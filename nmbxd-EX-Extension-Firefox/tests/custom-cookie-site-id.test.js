// 自定义饼干 → 站点饼干编号（123456 这类）的日志辅助：契约测试
// 对应需求：调试日志里要能看出"这枚自定义饼干对应自己账号饼干列表里的哪个编号"。
//   · 站点编号只存在于**本账号的饼干列表**里 → 只有该饼干本身就是自己列表中的一枚时才匹配得上；
//   · 别的账号的饼干不在自己列表里 → 只能给 userhash 缩写，拿不到这种编号（数据源里没有）。
// 匹配依据：对 userhash 取 SHA-256，与"站点饼干摘要缓存"（每枚站点饼干由导出页取到 userhash 后算得）比对。
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { webcrypto } = require('node:crypto');

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
  const po = src.indexOf('(', start);
  let pd = 0, pc = -1;
  for (let i = po; i < src.length; i++) { if (src[i] === '(') pd++; else if (src[i] === ')') { pd--; if (pd === 0) { pc = i; break; } } }
  const bo = src.indexOf('{', pc); let d = 0;
  for (let i = bo; i < src.length; i++) { if (src[i] === '{') d++; else if (src[i] === '}') { d--; if (d === 0) return src.slice(start, i + 1); } }
  throw new Error('unbalanced ' + name);
}

const abbreviateDecl = (src.match(/const abbreviateName = [^\n]+/) || [])[0];
assert(abbreviateDecl, '应能取到 abbreviateName 的真实定义（避免测试与产品不一致）');

const PIECES = [abbreviateDecl,
  'digestUserhash', 'getCookieUserhashDigestCache', 'resolveCustomCookieSiteId',
  'getCustomCookieSiteIdTag', 'xdexDbgCookieTag'
].map(s => (s.startsWith('const ') ? s : extractFn(s))).join('\n');

async function sha256hex(s) {
  const h = await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const VALUE = 'JXCC-VALUE-56CHARS-ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const OTHER = 'OTHER-ACCOUNT-VALUE-56CHARS-ABCDEFGHIJKLMNOPQRSTUVWXY';

function makeSandbox(opts) {
  const o = opts || {};
  const logs = [];
  const sandbox = {
    console: { log: () => {}, warn: () => {} },
    Promise, TextEncoder, crypto: webcrypto,
    GM_getValue: (k, d) => (Object.prototype.hasOwnProperty.call(o.store || {}, k) ? o.store[k] : d),
    xdexDbg: (label, payload) => logs.push({ label, payload }),
    getCustomCookieValue: () => o.currentValue || '',
    __logs: logs
  };
  const ctx = vm.createContext(sandbox);
  // 模块级常量/状态不在函数内，必须显式补齐（否则读它 ReferenceError）
  vm.runInContext("const COOKIE_USERHASH_DIGEST_CACHE_KEY = 'xdex_cookie_userhash_digest';\nconst customCookieSiteIdCache = new Map();\n" + PIECES + '\n', ctx);
  return sandbox;
}

function storeWith(entries) {
  const store = {};
  store['xdex_cookie_userhash_digest'] = entries;
  return store;
}

// ─────────── ① 命中：自定义饼干就是自己列表里的一枚 ───────────
test('命中：解析出自己的站点编号，且标签带箭头', async () => {
  const digest = await sha256hex(VALUE);
  const sb = makeSandbox({ store: storeWith({ '123456': { id: '123456', name: 'CUSTOM-DEMO', desc: 'd', digest } }), currentValue: VALUE });
  const hit = await sb.resolveCustomCookieSiteId(VALUE);
  assert(hit && String(hit.id) === '123456', '应命中站点编号 123456，实际 ' + JSON.stringify(hit));
  assert(sb.getCustomCookieSiteIdTag(VALUE) === '123456', '同步读取也应给出编号');
  assert(sb.xdexDbgCookieTag({ custom: true, name: 'CUSTOM-DEMO' }) === 'custom:CUSTOM-DEMO→123456',
    '自定义饼干标签应带箭头编号，实际 ' + sb.xdexDbgCookieTag({ custom: true, name: 'CUSTOM-DEMO' }));
  const line = sb.__logs.find(l => l.label === 'cookieSiteId:custom');
  assert(line && line.payload.reason === 'matched-own-cookie-list', '必须输出一条命中日志');
});

// ─────────── ② 不命中：别的账号的饼干 ───────────
test('不命中（别的账号）：返回 null、标签不带箭头、日志说明原因', async () => {
  const digest = await sha256hex(VALUE);
  const sb = makeSandbox({ store: storeWith({ '123456': { id: '123456', name: 'CUSTOM-DEMO', desc: 'd', digest } }), currentValue: OTHER });
  const hit = await sb.resolveCustomCookieSiteId(OTHER);
  assert(hit === null, '别的账号的饼干不应命中任何站点编号，实际 ' + JSON.stringify(hit));
  assert(sb.getCustomCookieSiteIdTag(OTHER) === null, '已解析但未命中 → null');
  assert(sb.xdexDbgCookieTag({ custom: true, name: 'CUSTOM-DEMO' }) === 'custom:CUSTOM-DEMO',
    '未命中时不得带箭头，实际 ' + sb.xdexDbgCookieTag({ custom: true, name: 'CUSTOM-DEMO' }));
  const line = sb.__logs.find(l => l.label === 'cookieSiteId:custom');
  assert(line && line.payload.reason === 'not-in-own-cookie-list' && line.payload.siteId === null,
    '日志必须点明"不在自己列表里"');
});

// ─────────── ③ 结果缓存：同一值只解析一次 ───────────
test('结果缓存：同一值重复解析只发一条日志', async () => {
  const digest = await sha256hex(VALUE);
  const sb = makeSandbox({ store: storeWith({ '123456': { id: '123456', name: 'CUSTOM-DEMO', desc: 'd', digest } }), currentValue: VALUE });
  await sb.resolveCustomCookieSiteId(VALUE);
  await sb.resolveCustomCookieSiteId(VALUE);
  const n = sb.__logs.filter(l => l.label === 'cookieSiteId:custom').length;
  assert(n === 1, '同一值只应解析一次，实际发了 ' + n + ' 条');
});

// ─────────── ④ 未解析 / 站点饼干标签不变 ───────────
test('未解析前标签不带箭头；站点饼干标签保持 site:id/name', async () => {
  const sb = makeSandbox({ store: storeWith({}), currentValue: VALUE });
  assert(sb.getCustomCookieSiteIdTag(VALUE) === undefined, '未解析应为 undefined');
  assert(sb.xdexDbgCookieTag({ custom: true, name: 'CUSTOM-DEMO' }) === 'custom:CUSTOM-DEMO', '未解析时无箭头');
  assert(sb.xdexDbgCookieTag({ id: '123456', name: 'X' }) === 'site:123456/X', '站点饼干标签格式不得改变');
  assert(sb.xdexDbgCookieTag(null) === null, '空值返回 null');
  assert((await sb.resolveCustomCookieSiteId('')) === null, '空值不解析');
  assert(sb.__logs.length === 0, '空值不应产生任何日志，实际 ' + sb.__logs.length);
});

// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass += 1; console.log('  ok  ' + name); }
    catch (err) { console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err)); process.exitCode = 1; }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  console.log(process.exitCode ? 'custom cookie site-id contract FAILED' : 'custom cookie site-id contract ok');
})();
