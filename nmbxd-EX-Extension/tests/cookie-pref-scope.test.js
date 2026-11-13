// 饼干偏好（每串默认饼干）页面作用域与"不自动设定"契约
//   背景：版块页/时间线页上 `detectPOCookieHash()` 取的是页面上**第一个** .h-threads-item-main —— 那是**别的串**的 OP；
//   据此写偏好会把第一条串的饼干设成被回复串的"默认饼干"（张冠李戴）。
//   另外：点击串链接换串时，偏好开关的重建原先被放在"fetch 成功且解析出 resto/__hash__"的 guard 里，
//   一旦 fetch 失败就会**残留上一串的默认饼干状态**；且该路径还会**自动设定**偏好。
// 运行：node tests/cookie-pref-scope.test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const USERSCRIPT = path.join(root, 'src/content/nmbxd-EX-for-edit.user.js');
const src = fs.readFileSync(USERSCRIPT, 'utf8').replace(/\r\n/g, '\n');

function extractFunction(name) {
  const start = src.indexOf('function ' + name + '(');
  assert(start !== -1, name + ' 必须存在');
  let depth = 0;
  for (let j = src.indexOf('{', start); j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(start, j + 1); }
  }
  throw new Error(name + ' 未闭合');
}

// ── detectPOCookieHash 的作用域守卫 ──
function runDetectPO(opts) {
  const o = opts || {};
  const uidText = o.uidText === undefined ? 'ID:5TM0hro' : o.uidText;
  const uidSpan = { textContent: uidText };
  const scopeElem = { querySelector: (sel) => (sel.indexOf('.h-threads-item-main') === 0 ? (o.hasMainRow === false ? null : uidSpan) : null) };
  const sandbox = {
    console,
    document: { querySelector: () => (o.hasMainRow === false ? null : uidSpan) },
    PageType: {
      isThreadPage: () => !!o.isThreadPage,
      isPOThreadPage: () => !!o.isPOThreadPage
    },
    getCookiesList: () => (o.cookieList || { a: { name: '5TM0hro' } }),
    findCookieByHash: (list, hash) => Object.values(list || {}).some((c) => String(c.name) === String(hash)) ? { name: hash } : null
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(extractFunction('detectPOCookieHash') + '\nglobalThis.__f = detectPOCookieHash;', sandbox);
  return sandbox.__f;
}

function testScopeGuardOnNonThreadPages() {
  // 版块页/时间线页（页面上第一个 OP 属于别的串）→ 必须返回 null，不得据此写偏好
  const f = runDetectPO({ isThreadPage: false, isPOThreadPage: false, hasMainRow: true });
  assert.strictEqual(f(), null, '非串页不得凭"页面第一个 OP"推断 PO 饼干');
}

function testScopeAllowedOnThreadPages() {
  const f = runDetectPO({ isThreadPage: true, uidText: 'ID:5TM0hro', cookieList: { a: { name: '5TM0hro' } } });
  assert.strictEqual(f(), '5TM0hro', '串页上应能取到本条串的 OP 饼干');
  const po = runDetectPO({ isPOThreadPage: true, uidText: 'ID:5TM0hro', cookieList: { a: { name: '5TM0hro' } } });
  assert.strictEqual(po(), '5TM0hro', 'PO 页同样允许');
  const unknown = runDetectPO({ isThreadPage: true, uidText: 'ID:NOTMINE', cookieList: { a: { name: '5TM0hro' } } });
  assert.strictEqual(unknown(), null, 'OP 饼干不在自己的饼干列表里 → null（不设偏好）');
  const empty = runDetectPO({ isThreadPage: true, uidText: 'ID:', cookieList: { a: { name: '5TM0hro' } } });
  assert.strictEqual(empty(), null, '取不到饼干文本 → null');
}

function testExplicitRootStillAllowed() {
  // 调用方若已知目标容器，可显式传入 root（非串页也可用）
  const f = runDetectPO({ isThreadPage: false, uidText: 'ID:5TM0hro', cookieList: { a: { name: '5TM0hro' } } });
  const scope = { querySelector: () => ({ textContent: 'ID:5TM0hro' }) };
  assert.strictEqual(f(scope), '5TM0hro', '显式 root 时不受页面类型限制');
}

function testSourceContracts() {
  // ① 点击串链接（换串）时，偏好开关重建必须**在 fetch 之前**、且不再自动设定偏好
  const clickStart = src.indexOf("$('body').on('click', 'a[href*=\"/t/\"][href*=\"r=\"]'");
  assert(clickStart !== -1, '必须存在"点 r= 串链接"的处理器');
  const elseIdx = src.indexOf('else {', clickStart);
  const injectIdx = src.indexOf('injectCookieCheckSwitch(tid)', elseIdx);
  const getIdx = src.indexOf('$.get(`/t/${tid}?r=${rid}`)', elseIdx);
  assert(injectIdx !== -1 && getIdx !== -1 && injectIdx < getIdx, '偏好开关重建必须在 fetch 之前（否则 fetch 失败即残留）');
  const guardSlice = src.slice(elseIdx, guardEnd(elseIdx));
  assert(!/initThreadCookiePref\(/.test(guardSlice), '点击串链接不得自动"设定"偏好（只渲染已有偏好）');

  // ② 自动填充（切到回复模式）路径同样不得自动设定偏好
  const pendingIdx = src.indexOf('injectCookieCheckSwitch(pendingReplyParams.tid)');
  assert(pendingIdx !== -1, '待回复参数路径必须重建开关');
  const pendingBlock = src.slice(pendingIdx - 400, pendingIdx + 200);
  assert(!/initThreadCookiePref\(pendingReplyParams\.tid\)/.test(pendingBlock), '自动填充路径不得自动设定偏好');

  // ③ 初始化路径（打开串）仍按设计自动带 PO 偏好：仅串页生效（由 detectPOCookieHash 守卫保证）
  assert(src.includes('const poHash = detectPOCookieHash();'), 'initThreadCookiePref 仍使用 PO 检测');

  // ④ 说明性：开关重建后要刷新着色
  assert(src.includes('refreshCookiePrefSwitchState()'), '换串/设定后必须刷新开关着色');
}
function guardEnd(start) {
  let d = 0;
  for (let j = src.indexOf('{', start); j < src.length; j++) {
    if (src[j] === '{') d++;
    else if (src[j] === '}') { d--; if (!d) return j + 1; }
  }
  return src.length;
}

const tests = [testScopeGuardOnNonThreadPages, testScopeAllowedOnThreadPages, testExplicitRootStillAllowed, testSourceContracts];

let failed = 0;
tests.forEach((fn) => {
  try { fn(); console.log('  PASS ' + fn.name); }
  catch (e) { failed += 1; console.error('  FAIL ' + fn.name + '\n       ' + ((e && e.message) || e)); }
});
if (failed) { console.error(failed + ' / ' + tests.length + ' 项失败'); process.exit(1); }
console.log('cookie pref scope contract ok');
