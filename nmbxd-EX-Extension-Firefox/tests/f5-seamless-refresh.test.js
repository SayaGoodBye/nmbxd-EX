// F5 接管「手动检查回复更新」：契约测试
// 规则：仅在串内**末页**且该刷新按钮可见时，把 F5 等价为单击该按钮；非末页保持浏览器刷新。
// 判定复用按钮自身显隐（末页 flex / 非末页 none / 浮窗打开 none），避免重复推导末页条件。
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
  const po = src.indexOf('(', start);
  let pd = 0, pc = -1;
  for (let i = po; i < src.length; i++) { if (src[i] === '(') pd++; else if (src[i] === ')') { pd--; if (pd === 0) { pc = i; break; } } }
  const bo = src.indexOf('{', pc); let d = 0;
  for (let i = bo; i < src.length; i++) { if (src[i] === '{') d++; else if (src[i] === '}') { d--; if (d === 0) return src.slice(start, i + 1); } }
  throw new Error('unbalanced ' + name);
}

const fnSrc = extractFn('bindF5ToSeamlessRefresh');
const lastSrc = extractFn('isSeamlessThreadLastPage');
const pagSrc = extractFn('getSeamlessBottomPagination');

// 造一个极简 document：可派发 keydown、可返回按钮与 computedStyle、可配置翻页条末页与否
function makeEnv(opts) {
  const o = opts || {};
  let handler = null;
  const clicks = [];
  const reloads = { count: 0 };
  const btn = { id: 'seamless-refresh-btn', click: () => clicks.push(clicks.length + 1) };
  const mainPag = { querySelector: () => (o.hasNext ? { tagName: 'A' } : null), closest: () => null };
  const pags = (o.pags && o.pags.length) ? o.pags : (o.pagination === null ? [] : [mainPag]);
  const env = {
    __now: 1_000_000_000_000,
    console: { warn: () => {} },
    window: { getComputedStyle: () => ({ display: o.display || 'flex', visibility: o.visibility || 'visible' }) },
    document: {
      getElementById: (id) => (id === 'seamless-refresh-btn' && !o.noButton ? btn : null),
      addEventListener: (type, fn, capture) => { if (type === 'keydown' && capture === true) handler = fn; },
      querySelectorAll: (sel) => (String(sel).indexOf('uk-pagination') >= 0 ? pags : [])
    },
    // 被测函数依赖的外部工具
    __pags: o.pags || [],
    location: { reload: () => { reloads.count += 1; } },
    getXDexRuntimeInfo: () => ({ kind: o.kind || 'extension' })
  };
  const sandbox = Object.assign({}, env, o.extra || {});
  // 沙箱内提供可控时钟（vm 内的 Date 与宿主不同，必须显式注入）
  sandbox.Date = { now: () => sandbox.__now };
  const ctx = vm.createContext(sandbox);
  vm.runInContext(pagSrc + '\n' + fnSrc + '\n' + lastSrc + '\nthis.bind = bindF5ToSeamlessRefresh;', ctx);
  sandbox.bind();
  return { clicks, reloads, fire: (ev) => handler(ev), btn, sandbox };
}

function makeKey(over) {
  const e = Object.assign({
    key: 'F5', keyCode: 116, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false,
    target: { tagName: 'DIV', isContentEditable: false },
    preventDefault: () => { e.__prevented = true; },
    stopPropagation: () => { e.__stopped = true; }
  }, over || {});
  return e;
}

// ─────────── ① 末页（按钮可见）→ 接管 ───────────
test('末页：F5 被接管并等价于单击按钮', () => {
  const env = makeEnv({ display: 'flex', hasNext: false });
  const e = makeKey();
  env.fire(e);
  assert(e.__prevented === true && e.__stopped === true, '应阻止默认刷新并停止传播');
  assert(env.clicks.length === 1, '应触发一次按钮点击，实际 ' + env.clicks.length);
});

// ─────────── ② 非末页（按钮隐藏）→ 不接管 ───────────
test('非末页（存在下一页链接）→ 保持浏览器刷新', () => {
  const env = makeEnv({ display: 'flex', hasNext: true });
  const e = makeKey();
  env.fire(e);
  assert(!e.__prevented, '不得阻止默认行为');
  assert(env.clicks.length === 0, '不应触发刷新');
});

test('浮窗打开（按钮被隐藏）→ 仍然接管', () => {
  const env = makeEnv({ display: 'none', hasNext: false });   // display:none = 浮窗态
  const e = makeKey();
  env.fire(e);
  assert(e.__prevented === true, '浮窗打开时 F5 仍应接管');
  assert(env.clicks.length === 1, '应触发一次刷新');
});

test('visibility:hidden 也不接管', () => {
  const env = makeEnv({ display: 'flex', visibility: 'hidden' });
  const e = makeKey();
  env.fire(e);
  assert(!e.__prevented && env.clicks.length === 0, '不可见时不得接管');
});

// ─────────── ③ 输入中不劫持 ───────────
test('输入框 / 可编辑区内按 F5 不劫持', () => {
  ['INPUT', 'TEXTAREA', 'SELECT'].forEach((tag) => {
    const env = makeEnv({ display: 'flex' });
    const e = makeKey({ target: { tagName: tag, isContentEditable: false } });
    env.fire(e);
    assert(!e.__prevented && env.clicks.length === 0, tag + ' 内不得接管');
  });
  const env2 = makeEnv({ display: 'flex' });
  const e2 = makeKey({ target: { tagName: 'DIV', isContentEditable: true } });
  env2.fire(e2);
  assert(!e2.__prevented && env2.clicks.length === 0, 'contentEditable 内不得接管');
});

// ─────────── ④ 组合键 / 其他键不拦 ───────────
test('Ctrl+F5 等组合键、以及非 F5 键不接管', () => {
  [['Ctrl+F5', { ctrlKey: true }], ['Shift+F5', { shiftKey: true }], ['Alt+F5', { altKey: true }]].forEach(([name, over]) => {
    const env = makeEnv({ display: 'flex' });
    const e = makeKey(over);
    env.fire(e);
    assert(!e.__prevented && env.clicks.length === 0, name + ' 不得接管');
  });
  const env2 = makeEnv({ display: 'flex' });
  const e2 = makeKey({ key: 'F6', keyCode: 117 });
  env2.fire(e2);
  assert(!e2.__prevented && env2.clicks.length === 0, '非 F5 键不得接管');
});

// ─────────── ⑤ 按钮不存在 / 只绑定一次 ───────────
test('按钮不存在时不报错、不接管', () => {
  const env = makeEnv({ display: 'flex', noButton: true });
  const e = makeKey();
  env.fire(e);
  assert(!e.__prevented, '没有按钮时不得阻止刷新');
});

test('重复调用只绑定一次（幂等）', () => {
  let binds = 0;
  const env = makeEnv({ display: 'flex', extra: {} });
  const origAdd = env.document ? null : null;
  // 直接统计 addEventListener 调用次数
  let count = 0;
  const env2 = makeEnv({
    display: 'flex',
    extra: {}
  });
  // 重新造一个可计数的 document
  let h = null, addCount = 0;
  const sb = {
    console: { warn: () => {} },
    getSeamlessBottomPagination: () => null,
    window: { getComputedStyle: () => ({ display: 'none', visibility: 'visible' }) },
    document: {
      getElementById: () => null,
      addEventListener: (t, fn, c) => { if (t === 'keydown' && c === true) { addCount++; h = fn; } }
    }
  };
  const ctx = vm.createContext(sb);
  vm.runInContext(fnSrc + '\n' + lastSrc + '\nthis.bind = bindF5ToSeamlessRefresh;', ctx);
  sb.bind(); sb.bind(); sb.bind();
  assert(addCount === 1, '应只绑定一次，实际 ' + addCount);
});

// ─────────── ⑤b QwQNT 热载语义（普通 F5 不再由主进程处理） ───────────
test('QwQNT 非末页：F5 走整页重载（热载），不触发局部刷新', () => {
  const env = makeEnv({ display: 'flex', hasNext: true, kind: 'qwqnt' });
  const e = makeKey();
  env.fire(e);
  assert(e.__prevented === true, '必须阻止默认（否则按键会继续冒泡）');
  assert(env.reloads.count === 1, '应整页重载一次，实际 ' + env.reloads.count);
  assert(env.clicks.length === 0, '不得触发局部刷新按钮');
});

test('QwQNT 非末页：连按只重载一次', () => {
  const env = makeEnv({ display: 'flex', hasNext: true, kind: 'qwqnt' });
  for (let i = 0; i < 3; i++) env.fire(makeKey());
  assert(env.reloads.count === 1, '连按应只重载一次，实际 ' + env.reloads.count);
});

test('QwQNT 输入框内：仍保留热载（原有行为不丢）', () => {
  const env = makeEnv({ display: 'flex', hasNext: true, kind: 'qwqnt' });
  const e = makeKey({ target: { tagName: 'TEXTAREA', isContentEditable: false } });
  env.fire(e);
  assert(env.reloads.count === 1, '输入框内按 F5 必须热载');
  assert(env.clicks.length === 0, '不得触发局部刷新');
});

test('QwQNT 按钮不存在时：仍然热载（不静默失效）', () => {
  const env = makeEnv({ display: 'flex', hasNext: false, kind: 'qwqnt', noButton: true });
  const e = makeKey();
  env.fire(e);
  assert(env.reloads.count === 1, '无按钮时也必须热载');
});

test('QwQNT 末页：局部刷新，不整页重载', () => {
  const env = makeEnv({ display: 'flex', hasNext: false, kind: 'qwqnt' });
  const e = makeKey();
  env.fire(e);
  assert(env.clicks.length === 1, '末页应局部刷新');
  assert(env.reloads.count === 0, '末页不得整页重载');
});

test('扩展/用户脚本端：非末页不重载（交给浏览器原生 F5）', () => {
  ['extension', 'userscript', 'chrome-extension', 'firefox-extension'].forEach((kind) => {
    const env = makeEnv({ display: 'flex', hasNext: true, kind });
    const e = makeKey();
    env.fire(e);
    assert(!e.__prevented, kind + ' 端不得阻止默认行为');
    assert(env.reloads.count === 0, kind + ' 端不得自行重载');
  });
});

// ─────────── ⑤c 浮窗内的分页条不得污染末页判定 ───────────
test('浮窗内有自己的分页条（带下一页）时，主区域末页仍判为末页', () => {
  const mainPag = { querySelector: () => null, closest: () => null };                       // 主区域：末页
  const overlayPag = { querySelector: () => ({ tagName: 'A' }),                              // 浮窗：有下一页
                       closest: (sel) => (String(sel).includes('qp-overlay-quote') ? { id: 'x' } : null) };
  const env = makeEnv({ display: 'none', hasNext: false, pags: [mainPag, overlayPag], kind: 'extension' });
  const e = makeKey();
  env.fire(e);
  assert(e.__prevented === true, '浮窗内分页不得把末页误判为非末页');
  assert(env.clicks.length === 1, '应触发局部刷新，实际 ' + env.clicks.length);
});

test('浮窗内分页条被排除后，非末页仍正确判定', () => {
  const mainPag = { querySelector: () => ({ tagName: 'A' }), closest: () => null };          // 主区域：非末页
  const overlayPag = { querySelector: () => null, closest: () => ({ id: 'x' }) };
  const env = makeEnv({ display: 'flex', hasNext: true, pags: [mainPag, overlayPag], kind: 'extension' });
  const e = makeKey();
  env.fire(e);
  assert(!e.__prevented, '主区域非末页 → 不接管');
  assert(env.clicks.length === 0, '不应触发局部刷新');
});

// ─────────── ⑤d 浮窗内输入框不得阻断接管 ───────────
test('浮窗内的 textarea 里按 F5：仍按浮窗态接管（实测 bug 回归）', () => {
  // 拓展引用浮窗里带 qp-reply-form（含 textarea[name="content"]）；
  // 焦点在该输入框时，若仍按"输入中"返回 → F5 退化为整页刷新
  const overlayClosest = (sel) => (String(sel).includes('qp-overlay') ? { id: 'qp' } : null);
  const env = makeEnv({ display: 'none', hasNext: false, kind: 'extension' });
  const e = makeKey({
    target: { tagName: 'TEXTAREA', isContentEditable: false, closest: overlayClosest }
  });
  env.fire(e);
  assert(e.__prevented === true, '浮窗内输入框不得阻断接管');
  assert(env.clicks.length === 1, '应触发局部刷新，实际 ' + env.clicks.length);
});

test('非浮窗内的 textarea 仍不劫持（对照，保留原行为）', () => {
  const env = makeEnv({ display: 'flex', hasNext: false, kind: 'extension' });
  const e = makeKey({
    target: { tagName: 'TEXTAREA', isContentEditable: false, closest: () => null }
  });
  env.fire(e);
  assert(!e.__prevented, '普通输入框内不得接管');
  assert(env.clicks.length === 0, '不应触发刷新');
});

test('浮窗内输入框 + QwQNT 非末页：热载但要节流一次', () => {
  const overlayClosest = (sel) => (String(sel).includes('qp-overlay') ? { id: 'qp' } : null);
  const env = makeEnv({ display: 'none', hasNext: true, kind: 'qwqnt' });
  const e = makeKey({ target: { tagName: 'TEXTAREA', isContentEditable: false, closest: overlayClosest } });
  env.fire(e);
  assert(env.reloads.count === 1, '浮窗内 + 非末页 → QwQNT 应热载');
  assert(env.clicks.length === 0, '不得触发局部刷新');
});

// ─────────── ⑥ 节流：连按只触发一次 ───────────
test('节流：短时间内连按 F5 只触发一次按钮点击', () => {
  const env = makeEnv({ display: 'flex', hasNext: false });
  try {
    const results = [];
    for (let i = 0; i < 5; i++) { const e = makeKey(); env.fire(e); results.push(e.__prevented); }
    assert(env.clicks.length === 1, '5 次连按应只触发 1 次点击，实际 ' + env.clicks.length);
    assert(results.every(Boolean), '被节流吸收的按键同样要阻止浏览器刷新（否则会整页刷新）');
    env.sandbox.__now += 1300;
    const e2 = makeKey(); env.fire(e2);
    assert(env.clicks.length === 2, '越过节流窗口后应再次生效，实际 ' + env.clicks.length);
  } finally {}
});

// ─────────── ⑥ 接线守卫 ───────────
test('接线守卫：按钮创建后绑定，且末页判定独立于按钮显隐', () => {
  assert(/bindF5ToSeamlessRefresh\(\);/.test(src), '按钮创建流程必须调用绑定');
  assert(/function isSeamlessThreadLastPage\(/.test(src), '必须有独立的末页判定');
  assert(/getSeamlessBottomPagination\(/.test(lastSrc), '末页判定必须基于底部翻页条');
  assert(/li:last-child a/.test(lastSrc), '末页 = 翻页条没有下一页链接');
  assert(!/style\.display === 'none'/.test(fnSrc), 'F5 判定**不得**再依赖按钮 display（浮窗态会被隐藏）');
  assert(/btn\.click\(\)/.test(fnSrc), '必须等价于单击按钮（复用既有行为）');
  assert(/, true\)/.test(fnSrc), '必须以捕获阶段监听');
});

// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass += 1; console.log('  ok  ' + name); }
    catch (err) { console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err)); process.exitCode = 1; }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  console.log(process.exitCode ? 'F5 takeover contract FAILED' : 'F5 takeover contract ok');
})();
