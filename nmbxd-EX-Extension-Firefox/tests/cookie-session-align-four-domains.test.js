// 「四域同写」+ 交还快照 契约测试
// 对应需求：
//   ① 切换自定义饼干时，**四个主域同时**写成该身份（不是只写当前域后清掉别处）
//   ② 同步：写阶段必须先把目标身份写到**所有**域，再清理异值 → 任何时刻都不存在"某个域没有正确身份"的中间态
//   ③ 交还（切回站点饼干）时必须把其它主域**原样还原**（与写入对称），且没有快照时**绝不误删**
//   ④ QwQNT 桥恒以 senderUrl 为作用域（get/set/remove 全如此）→ 只处理当前域
// 假 jar 严格照抄实测语义：getAll 只返回该 url 可见的 cookie；set 的 domain 与 url 不匹配则被忽略；remove 删该 url 可匹配的同名 cookie。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

function extractFn(name) {
  const anchor = 'function ' + name + '(';
  let start = src.indexOf(anchor);
  assert(start !== -1, name + ' 必须存在');
  if (src.slice(Math.max(0, start - 6), start) === 'async ') start -= 6;
  const parenOpen = src.indexOf('(', start);
  let pd = 0, parenClose = -1;
  for (let i = parenOpen; i < src.length; i++) {
    if (src[i] === '(') pd++;
    else if (src[i] === ')') { pd--; if (pd === 0) { parenClose = i; break; } }
  }
  const braceOpen = src.indexOf('{', parenClose);
  let depth = 0;
  for (let i = braceOpen; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  throw new Error('unbalanced ' + name);
}

const PIECES = [
  'xdexApexOfHost', 'xdexQwqntSupportsCrossDomainCookies', 'xdexSessionAlignProbes',
  'xdexReadUserhashVariants', 'xdexUserhashAttrs',
  'xdexCookieIsHostOnly', 'xdexCookieUrlOf',
  'alignSessionToCookieViaDocument', 'alignSessionToCookie', 'releaseSessionAlignment'
].map(extractFn).join('\n\n');

// ─────────── 假 jar：照抄 chrome.cookies 实测语义 ───────────
// 关键保真点：
//   · host-only cookie（未显式给 domain）**只对它自己的 host 生效**，不含子域；
//   · domain cookie（`.nmbxd1.com`）对该域及其所有子域生效；
//   · set 的 domain 与 url 不匹配 → 被浏览器忽略（跨域写入不生效）。
function makeJar(initial) {
  const jar = initial.map(c => Object.assign({ hostOnly: false, path: '/', secure: true, httpOnly: false, sameSite: 'lax', session: false }, c));
  const ops = [];
  const hostOf = (url) => new URL(url).hostname;
  const visible = (c, host) => {
    const d = String(c.domain || '');
    if (!d) return false;
    if (c.hostOnly) return host === d;                    // host-only：精确匹配
    const norm = d.replace(/^\./, '');
    return host === norm || host.endsWith('.' + norm);    // domain：含子域
  };
  const keyOf = (c) => String(c.domain || '') + '|' + (c.path || '/') + '|' + c.name;
  return {
    jar, ops,
    getAll: async (url) => {
      const host = hostOf(url);
      ops.push({ op: 'get', url, host });
      return jar.filter(c => visible(c, host)).map(c => Object.assign({}, c));
    },
    set: async (details, url) => {
      const host = hostOf(url);
      const domain = details.domain || null;
      if (domain) {
        const norm = String(domain).replace(/^\./, '');
        if (!(host === norm || host.endsWith('.' + norm))) {
          ops.push({ op: 'set-rejected', url, domain, value: details.value });
          return null;                                     // 跨域写入被浏览器忽略（实测语义）
        }
      }
      const next = {
        name: details.name, value: details.value, domain: domain || host,
        hostOnly: !domain,
        path: details.path || '/', secure: !!details.secure, httpOnly: !!details.httpOnly,
        sameSite: details.sameSite || 'lax', session: details.expirationDate === undefined
      };
      const i = jar.findIndex(c => keyOf(c) === keyOf(next));
      if (i >= 0) jar[i] = next; else jar.push(next);
      ops.push({ op: 'set', url, domain: domain || ('(host-only:' + host + ')'), value: details.value });
      return next;
    },
    remove: async (name, url) => {
      const host = hostOf(url);
      let n = 0;
      for (let i = jar.length - 1; i >= 0; i -= 1) {
        if (jar[i].name === name && visible(jar[i], host)) { jar.splice(i, 1); n += 1; }
      }
      ops.push({ op: 'remove', url, host, n });
      return n;
    }
  };
}

const PAGE = 'www.nmbxd1.com';
const PAGE_URL = 'https://' + PAGE + '/t/1';

function makeSandbox(opts) {
  const o = opts || {};
  const jar = o.jar;
  const store = Object.assign({}, o.store || {});
  const base = {
    console: { log: () => {}, warn: () => {} },
    Promise, URL,
    location: { hostname: PAGE, href: PAGE_URL, origin: 'https://' + PAGE },
    getJarCookieApi: () => (o.api === undefined ? 'extension' : o.api),
    GM_getValue: (k, d) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : d),
    GM_setValue: (k, v) => { store[k] = v; },
    GM_deleteValue: (k) => { delete store[k]; },
    jarGetAllCookies: (url) => jar.getAll(url),
    jarSetCookie: (d, url) => jar.set(d, url),
    jarRemoveCookie: (n, url) => jar.remove(n, url),
    sessionAlignedValue: '',
    sessionAlignSeq: 0,
    sessionAlignChain: Promise.resolve(),
    toast: () => {}
  };
  const sandbox = Object.assign(base, o.extra || {});
  sandbox.__store = store;
  const ctx = vm.createContext(sandbox);
  // 常量在函数之外（模块作用域），必须显式补齐，否则读它会 ReferenceError（被内部 try 吞掉 → 快照逻辑静默失效）
  vm.runInContext("const SESSION_ALIGN_BEFORE_KEY = 'xdex_session_align_before';\nlet xdexQwqntCrossDomainCache = null;\n" + PIECES + '\n', ctx);
  return sandbox;
}

// 站点形态：当前域 host-only + 其余域各有自己的旧身份
function seedSiteIdentity() {
  return [
    { name: 'userhash', value: 'SITE-PAGE', domain: PAGE, hostOnly: true },
    { name: 'userhash', value: 'SITE-WWW', domain: 'www.nmbxd.com', hostOnly: true },
    { name: 'userhash', value: 'SITE-N1', domain: 'nmbxd1.com', hostOnly: true },
    { name: 'userhash', value: 'SITE-N2', domain: 'nmbxd.com', hostOnly: true }
  ];
}

const WANT = 'CUSTOM-IDENTITY-56CHARS';

// ─────────── ① 四域同写 ───────────
test('四域同写：四个主域都变成目标身份', async () => {
  const jar = makeJar(seedSiteIdentity());
  const sb = makeSandbox({ jar });
  const res = await sb.alignSessionToCookie(WANT);
  assert(res.ok === true, '对齐应成功，实际 ' + JSON.stringify(res.domains));
  assert(res.domains.length === 4, '必须逐域校验 4 个探针，实际 ' + res.domains.length);
  for (const d of res.domains) {
    assert(d.valuesOk === true, d.host + ' 应只有目标身份，实际 ' + JSON.stringify(d));
  }
  for (const c of jar.jar) {
    assert(c.value === WANT, 'jar 中不应残留旧身份，发现 ' + JSON.stringify(c));
  }
  assert(sb.sessionAlignedValue === WANT, '对齐成功必须写入内存标记（httpOnly 场景下判定只能靠它）');
  const hosts = jar.jar.map(c => c.domain).sort();
  assert(new Set(hosts).size === 4, '四个 host 应各有一枚 host-only（跟随站点方言），实际 ' + hosts.join(','));
});

test('domain 方言：每个可注册域一枚（覆盖其下所有 host）', async () => {
  const jar = makeJar([
    { name: 'userhash', value: 'SITE-PAGE', domain: '.nmbxd1.com', hostOnly: false },
    { name: 'userhash', value: 'SITE-N2', domain: '.nmbxd.com', hostOnly: false }
  ]);
  const sb = makeSandbox({ jar });
  const res = await sb.alignSessionToCookie(WANT);
  assert(res.ok === true, '对齐应成功，实际 ' + JSON.stringify(res.domains));
  const scopes = jar.jar.map(c => c.domain).sort();
  assert(scopes.length === 2 && scopes[0] === '.nmbxd.com' && scopes[1] === '.nmbxd1.com',
    'domain 方言下应只写两枚（各可注册域一枚），实际 ' + scopes.join(','));
  assert(jar.jar.every(c => c.value === WANT), '两枚都应是目标值');
});

// ─────────── ② 同步：先写全部，再删异值 ───────────
test('写优先：全部目标的写入都发生在任何删除之前', async () => {
  // 站点方言 = host-only（当前页是 host-only），另留一枚 `.nmbxd.com` 跨作用域残留 →
  // 它不会被"同作用域写入"覆盖，只能靠删除清掉，因此删除必然发生在写入之后。
  const jar = makeJar(seedSiteIdentity().concat([
    { name: 'userhash', value: 'STALE-SCOPE', domain: '.nmbxd.com', hostOnly: false }
  ]));
  const sb = makeSandbox({ jar });
  const res = await sb.alignSessionToCookie(WANT);
  assert(res.ok === true, '对齐应成功，实际 ' + JSON.stringify(res.domains));
  const firstRemoveIdx = jar.ops.findIndex(o => o.op === 'remove');
  assert(firstRemoveIdx > 0, '应发生删除（跨作用域残留必须被清掉）');
  const wroteHosts = new Set(
    jar.ops.slice(0, firstRemoveIdx)
      .filter(o => o.op === 'set' && o.value === WANT)
      .map(o => String(o.domain).replace(/^\(host-only:/, '').replace(/\)$/, ''))
  );
  assert(wroteHosts.size === 4, '首轮删除之前必须已把四个域都写成目标身份（同步要求），实际 ' + wroteHosts.size + ' 个：' + Array.from(wroteHosts).join(','));
  assert(!jar.jar.some(c => c.value === 'STALE-SCOPE'), '跨作用域残留必须被清除');
});

// ─────────── ③ 快照与交还 ───────────
test('交还：其它主域还原为对齐前的身份，当前域不动', async () => {
  const jar = makeJar(seedSiteIdentity());
  const sb = makeSandbox({ jar });
  await sb.alignSessionToCookie(WANT);
  const res = await sb.releaseSessionAlignment();
  assert(res.ok === true, '交还应成功');
  const byDomain = {};
  jar.jar.forEach(c => { byDomain[c.domain] = c.value; });
  assert(byDomain[PAGE] === WANT, '当前域交给站点 switchTo，本函数不应改动它（实际 ' + byDomain[PAGE] + '）');
  assert(byDomain['www.nmbxd.com'] === 'SITE-WWW', '其它域应还原为原值，实际 ' + byDomain['www.nmbxd.com']);
  assert(byDomain['nmbxd1.com'] === 'SITE-N1', '其它域应还原为原值，实际 ' + byDomain['nmbxd1.com']);
  assert(byDomain['nmbxd.com'] === 'SITE-N2', '其它域应还原为原值，实际 ' + byDomain['nmbxd.com']);
  assert(sb.sessionAlignedValue === '', '交还后应清掉内存标记');
  assert(!sb.__store['xdex_session_align_before'], '交还后应清掉快照');
});

test('交还（无快照）：绝不误删任何 cookie', async () => {
  const jar = makeJar(seedSiteIdentity());
  const sb = makeSandbox({ jar });
  const before = jar.jar.length;
  const res = await sb.releaseSessionAlignment();
  assert(res.skipped === 'no-snapshot', '无快照时应直接跳过，实际 ' + JSON.stringify(res));
  assert(jar.jar.length === before, '无快照时不得删除任何 cookie');
  assert(jar.ops.filter(o => o.op === 'remove').length === 0, '不应发生任何删除操作');
});

test('A→B 二次切换：快照不被覆盖，交还仍回到最初身份', async () => {
  const jar = makeJar(seedSiteIdentity());
  const sb = makeSandbox({ jar });
  await sb.alignSessionToCookie('CUSTOM-A');
  await sb.alignSessionToCookie('CUSTOM-B');
  assert(sb.__store['xdex_session_align_before'].value === 'CUSTOM-A', '快照应记录首次对齐的身份（不重取）');
  await sb.releaseSessionAlignment();
  const byDomain = {};
  jar.jar.forEach(c => { byDomain[c.domain] = c.value; });
  assert(byDomain['www.nmbxd.com'] === 'SITE-WWW', '二次切换后交还仍应回到最初身份，实际 ' + byDomain['www.nmbxd.com']);
});

// ─────────── ④ QwQNT 只处理当前域 ───────────
test('QwQNT（未协商/老客户端）：只写/校验当前域', async () => {
  const jar = makeJar(seedSiteIdentity());
  const sb = makeSandbox({ jar, api: 'qwqnt' });
  const res = await sb.alignSessionToCookie(WANT);
  assert(res.via === 'qwqnt', '结果应标记 via=qwqnt，实际 ' + res.via);
  assert(res.domains.length === 1 && res.domains[0].host === PAGE, 'QwQNT 只应有当前域一个探针，实际 ' + JSON.stringify(res.domains));
  const others = jar.jar.filter(c => c.domain !== PAGE);
  assert(others.every(c => c.value !== WANT), 'QwQNT 不应改动其它域');
});

// ─────────── ⑤ 失败可观测 ───────────
test('某域写入被拒：ok=false 且逐域报告点出该域', async () => {
  const jar = makeJar(seedSiteIdentity());
  const sb = makeSandbox({ jar, extra: {} });
  // 让 www.nmbxd.com 的读取始终为空（模拟该域写不进去）
  const origGetAll = jar.getAll;
  jar.getAll = async (url) => {
    if (new URL(url).hostname === 'www.nmbxd.com') return [];
    return origGetAll(url);
  };
  const res = await sb.alignSessionToCookie(WANT);
  assert(res.ok === false, '存在无法收敛的域时 ok 必须为 false');
  const bad = res.domains.find(d => d.host === 'www.nmbxd.com');
  assert(bad && bad.valuesOk === false, '报告必须点出失败的域，实际 ' + JSON.stringify(res.domains));
  const pageProbe = res.domains.find(d => d.host === PAGE);
  assert(pageProbe.valuesOk === true, '其它域仍应写好（写优先，不因个别失败而不同步）');
});

// ─────────── ⑥ QwQNT 显式作用域（能力协商） ───────────
test('QwQNT + caps：同样做四域同写', async () => {
  const jar = makeJar(seedSiteIdentity());
  const sb = makeSandbox({
    jar, api: 'qwqnt',
    extra: { window: { QwQNTNmbxd: { xdexCookies: async (op) => (op === 'caps' ? { ok: true, crossDomain: true } : { ok: false, error: 'stub' }) } } }
  });
  const res = await sb.alignSessionToCookie(WANT);
  assert(res.via === 'qwqnt', 'via 应为 qwqnt，实际 ' + res.via);
  assert(res.domains.length === 4, '客户端支持显式作用域时应有四个探针，实际 ' + res.domains.length);
  assert(res.ok === true, '四域都应写成目标身份，实际 ' + JSON.stringify(res.domains));
  for (const c of jar.jar) assert(c.value === WANT, '不应残留旧身份：' + JSON.stringify(c));
});

test('QwQNT 无 caps（老客户端）：只动当前域，其它域一个字节不改', async () => {
  const jar = makeJar(seedSiteIdentity());
  const sb = makeSandbox({
    jar, api: 'qwqnt',
    extra: { window: { QwQNTNmbxd: { xdexCookies: async () => ({ ok: false, error: 'unknown op' }) } } }
  });
  const res = await sb.alignSessionToCookie(WANT);
  assert(res.domains.length === 1 && res.domains[0].host === PAGE, '老客户端只应有当前域探针，实际 ' + JSON.stringify(res.domains));
  const byDomain = {};
  jar.jar.forEach(c => { byDomain[c.domain] = c.value; });
  assert(byDomain[PAGE] === WANT, '当前域必须已对齐，实际 ' + byDomain[PAGE]);
  assert(byDomain['www.nmbxd.com'] === 'SITE-WWW', '其它域不得被改动，实际 ' + byDomain['www.nmbxd.com']);
  assert(byDomain['nmbxd1.com'] === 'SITE-N1' && byDomain['nmbxd.com'] === 'SITE-N2', '其它域不得被改动');
  assert(jar.ops.every(o => o.op !== 'remove' || o.host === PAGE), '不得在其它域发生删除');
});

// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass += 1; console.log('  ok  ' + name); }
    catch (err) { console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err)); process.exitCode = 1; }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  console.log(process.exitCode ? 'four-domain session align contract FAILED' : 'four-domain session align contract ok');
})();
