// 脚本端（无 cookie 容器接口）会话对齐契约测试
// 对应需求：用户脚本环境没有扩展/QwQNT 的 cookie 容器接口，但站点 userhash 可以用
// document.cookie 直接写入（实测服务端接受 JS 写入的 cookie），因此脚本端也应把会话对齐到
// 自定义饼干（可读受限版块、发送即用该身份），而不是像旧实现那样直接跳过。
// 本测试钉住：
//   ① alignSessionToCookie 在无容器接口时**委派**给 document 路径（而不是返回 unsupported）
//   ② document 路径复用发送链路原语：installUserhashCookieForSend → 读回校验 → 设内存标记
//   ③ 未收敛时还原原作用域、不设标记（不能把会话留在错身份上）
//   ④ 非 X岛域 / 空值 直接拒绝，不写 cookie
//   ⑤ 文案与接线不再回退（"仅用于发送"已删除；自定义分支不再以容器接口为前提）
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// 提取函数体：先配对参数列表的圆括号，再找函数体花括号
// （不能直接用第一个 '{'：形如 `opts = {}` 的默认参数会误导配对）
function extractFn(name) {
  const anchor = 'function ' + name + '(';
  let start = src.indexOf(anchor);
  assert(start !== -1, name + ' 必须存在');
  // 保留 async 前缀：丢掉它会改变返回值语义（Promise vs 普通对象），与产品实现失真
  if (src.slice(Math.max(0, start - 6), start) === 'async ') start -= 6;
  const parenOpen = src.indexOf('(', start);
  let pd = 0, parenClose = -1;
  for (let i = parenOpen; i < src.length; i++) {
    if (src[i] === '(') pd++;
    else if (src[i] === ')') { pd--; if (pd === 0) { parenClose = i; break; } }
  }
  assert(parenClose !== -1, name + ' 参数列表配对失败');
  const braceOpen = src.indexOf('{', parenClose);
  let depth = 0;
  for (let i = braceOpen; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  throw new Error('unbalanced ' + name);
}

const docSrc = extractFn('alignSessionToCookieViaDocument');
const alignSrc = extractFn('alignSessionToCookie');
const loadSrc = extractFn('ensureSessionAlignedOnLoad');

// ─────────── 沙箱：把三个函数一起注入（互相引用） ───────────
function makeSandbox(overrides) {
  const calls = { install: 0, restore: 0 };
  const base = {
    console: { log: () => {}, warn: () => {} },
    Promise,
    sessionAlignedValue: '',
    sessionAlignSeq: 0,
    sessionAlignChain: Promise.resolve(),
    getJarCookieApi: () => '',
    userhashApexDomain: () => '.nmbxd1.com',
    readAllUserhashCookieValues: () => ['WANTED'],
    installUserhashCookieForSend: () => {
      calls.install += 1;
      return { ok: true, scopes: { host: 'OLD', domain: null, apex: '.nmbxd1.com' } };
    },
    restoreUserhashCookieScopes: () => { calls.restore += 1; },
    location: { hostname: 'www.nmbxd1.com', href: 'https://www.nmbxd1.com/t/1' },
    jarGetAllCookies: async () => { throw new Error('jar stub unused'); },
    jarSetCookie: async () => { throw new Error('jar stub unused'); },
    jarRemoveCookie: async () => { throw new Error('jar stub unused'); }
  };
  const sandbox = Object.assign(base, overrides || {});
  sandbox.__calls = calls;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(docSrc + '\n' + alignSrc + '\n' + loadSrc + '\n', ctx);
  return sandbox;
}

// 载入时懒对齐的沙箱：桩掉插件状态与 alignSessionToCookie（本组只验证"何时该补对齐"）
function makeLoadSandbox(overrides) {
  const calls = { align: 0, toast: [] };
  const base = {
    console: { log: () => {}, warn: () => {} },
    Promise,
    getCurrentCookie: () => ({ id: 'c1', name: 'CUSTOM-A', custom: true }),
    isCustomCookie: (c) => !!(c && c.custom),
    getCustomCookieValue: () => 'WANTED',
    isSessionAlignedToCurrentCustomCookie: () => false,
    readAllUserhashCookieValues: () => ['OTHER'],
    toast: (msg, dur, opts) => { calls.toast.push({ msg, opts }); },
    alignSessionToCookie: () => { calls.align += 1; return Promise.resolve({ ok: true, via: 'document' }); }
  };
  const sandbox = Object.assign(base, overrides || {});
  sandbox.__calls = calls;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(loadSrc + '\n', ctx);
  return sandbox;
}


// ─────────── ① 接线：无容器接口时委派 document 路径 ───────────
test('无容器接口时 alignSessionToCookie 委派 document 路径', async () => {
  const sb = makeSandbox();
  const res = await sb.alignSessionToCookie('WANTED');
  assert(sb.__calls.install === 1, '应调用 installUserhashCookieForSend 写入');
  assert(res.via === 'document', '结果必须标记 via: document（实际 ' + res.via + '）');
  assert(res.ok === true, '收敛成功时 ok 应为 true');
  assert(res.count === 1, '收敛后应只剩 1 枚，实际 ' + res.count);
  assert(sb.sessionAlignedValue === 'WANTED', '成功必须写入内存标记（发送链路据此跳过临时交换）');
});

test('源码里保留委派语句（防止退回 unsupported）', () => {
  assert(/if \(!getJarCookieApi\(\)\) return alignSessionToCookieViaDocument\(value\);/.test(alignSrc),
    'alignSessionToCookie 必须把无容器接口的分支委派给 document 路径');
  assert(!/reason: 'unsupported'/.test(alignSrc), 'alignSessionToCookie 不应再返回 unsupported');
});

test('有容器接口时不走 document 路径', async () => {
  const sb = makeSandbox({ getJarCookieApi: () => 'extension' });
  await sb.alignSessionToCookie('WANTED').catch(() => null);
  assert(sb.__calls.install === 0, '有容器接口时必须走 jar 路径，不能调用 document 写入');
});

// ─────────── ② 未收敛时还原、不设标记 ───────────
test('写入未收敛时还原原作用域且不设内存标记', async () => {
  const sb = makeSandbox({
    installUserhashCookieForSend: () => ({ ok: false, scopes: { host: 'OLD', domain: 'OLD', apex: '.nmbxd1.com' } })
  });
  const res = await sb.alignSessionToCookie('WANTED');
  assert(res.ok === false, '未收敛时 ok 必须为 false');
  assert(res.via === 'document', '未收敛结果仍应标记 via: document');
  assert(sb.__calls.restore === 1, '未收敛必须还原原作用域（否则用户留在错身份上）');
  assert(sb.sessionAlignedValue === '', '未收敛不得写内存标记');
});

test('读回值不匹配时判为异常', async () => {
  const sb = makeSandbox({ readAllUserhashCookieValues: () => ['WANTED', 'OTHER'] });
  const res = await sb.alignSessionToCookie('WANTED');
  assert(res.ok === false && res.valueMatches === false, '存在第二枚时必须判为未对齐');
  assert(sb.__calls.restore === 0, '已写入成功时不还原（只判异常）');
  assert(sb.sessionAlignedValue === '', '值不匹配不得写内存标记');
});

// ─────────── ③ 拒绝路径 ───────────
test('非 X岛域拒绝且不写 cookie', async () => {
  const sb = makeSandbox({ userhashApexDomain: () => '' });
  const res = await sb.alignSessionToCookie('WANTED');
  assert(res.ok === false && res.reason === 'not-site', '非站点域应返回 not-site，实际 ' + res.reason);
  assert(sb.__calls.install === 0, '拒绝时不得写入任何 cookie');
});

test('空值拒绝', async () => {
  const sb = makeSandbox();
  const res = await sb.alignSessionToCookie('   '.repeat(0));
  assert(res.ok === false && res.reason === 'empty', '空值应返回 empty，实际 ' + res.reason);
});

// ─────────── ④ 文案与接线不回退 ───────────
test('已删除“仅用于发送”类文案', () => {
  assert(!/仅用于发送/.test(src), '源码中不应再出现“仅用于发送”');
  assert(!/只用于发送/.test(src), '源码中不应再出现“只用于发送”');
  assert(/会把会话切换为该饼干身份/.test(src), '导入说明应说明会切换会话身份');
});

test('switch_cookie 自定义分支不再以容器接口为前提', () => {
  const fn = extractFn('switch_cookie');
  assert(!/getJarCookieApi\(\) && typeof alignSessionToCookie/.test(fn),
    '自定义分支不应再用 getJarCookieApi() 阻断对齐（脚本端也要对齐）');
  assert(/if \(typeof alignSessionToCookie === 'function'\)/.test(fn),
    '自定义分支应只判断函数是否存在');
});

// ─────────── ⑤ 载入时懒对齐（跨域自我修复） ───────────
test('站点饼干：载入时不做任何事', async () => {
  const sb = makeLoadSandbox({ isCustomCookie: () => false, getCurrentCookie: () => ({ id: 's1' }) });
  await sb.ensureSessionAlignedOnLoad();
  assert(sb.__calls.align === 0, '站点饼干不应触发对齐');
});

test('已对齐 / 饼干已删除：不补对齐', async () => {
  const a = makeLoadSandbox({ isSessionAlignedToCurrentCustomCookie: () => true });
  await a.ensureSessionAlignedOnLoad();
  assert(a.__calls.align === 0, '已对齐时不应再写 cookie');

  const b = makeLoadSandbox({ getCustomCookieValue: () => '' });
  await b.ensureSessionAlignedOnLoad();
  assert(b.__calls.align === 0, '饼干已删除时不应写 cookie');
});

test('本域是别的身份：就地补对齐，且不再提示刷新', async () => {
  const sb = makeLoadSandbox();
  await sb.ensureSessionAlignedOnLoad();
  await new Promise((r) => setTimeout(r, 0));
  assert(sb.__calls.align === 1, '本域身份不符时必须补对齐');
  assert(sb.__calls.toast.length === 0, '按用户要求已去除"刷新"提示，不应有任何 toast');
  assert(!/刷新页面后生效/.test(src), '源码中不应再出现"刷新页面后生效"文案');
  assert(!/toast\(/.test(loadSrc), 'ensureSessionAlignedOnLoad 体内不应再调用 toast');
});

test('补对齐失败不抛错、不提示', async () => {
  const sb = makeLoadSandbox({ alignSessionToCookie: () => Promise.resolve({ ok: false, reason: 'document-write-failed' }) });
  await sb.ensureSessionAlignedOnLoad();
  await new Promise((r) => setTimeout(r, 0));
  assert(sb.__calls.toast.length === 0, '失败时也不应提示');
});

test('启动批次已接入懒对齐步骤', () => {
  assert(/startup\.batch1\.sessionAlign/.test(src), '启动批次必须包含 sessionAlign 步骤');
  assert(/run: \(\) => ensureSessionAlignedOnLoad\(\)/.test(src), '该步骤必须调用 ensureSessionAlignedOnLoad');
});

// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try {
      await fn();
      pass += 1;
      console.log('  ok  ' + name);
    } catch (err) {
      console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err));
      process.exitCode = 1;
    }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  if (process.exitCode) console.log('cookie session align (document) contract FAILED');
  else console.log('cookie session align (document) contract ok');
})();
