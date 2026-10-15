// 切换饼干时的焦点回归契约测试
// 对应需求：选择饼干后应立即把焦点交回发帖输入框，不等 switch_cookie 的网络往返
// （网络延迟时，旧实现在 .done 之后才 focus，期间用户无法输入）。
// 本测试钉住三件事：
//   ① switch_cookie 支持 focusBackNow，且在发起请求【之前】就恢复焦点
//   ② 恢复动作与网络成功回调解耦（请求未完成时焦点已回归）
//   ③ 成功回调仍保留一次兜底恢复（UI 更新可能打断即时恢复）
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// 提取函数体：先配对参数列表的圆括号，再找函数体花括号
// （不能直接用第一个 '{'：形如 `opts = {}` 的默认参数会误导配对）
function extractFn(name) {
  const start = src.indexOf('function ' + name);
  assert(start !== -1, name + ' 必须存在');
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

const fnSrc = extractFn('switch_cookie');
const rfSrc = extractFn('restorePostTextareaFocus');

// ─────────── ① 选项存在且位置正确 ───────────
test('switch_cookie 支持 focusBackNow 选项', () => {
  assert(/opts\.focusBackNow/.test(fnSrc), 'switch_cookie 必须读取 opts.focusBackNow');
  assert(/if \(opts\.focusBackNow\) restorePostTextareaFocus\(\);/.test(fnSrc),
    'focusBackNow 应直接调用 restorePostTextareaFocus()');
});

test('焦点恢复发生在发起网络请求之前（解耦的关键）', () => {
  const idxFocus = fnSrc.indexOf('if (opts.focusBackNow) restorePostTextareaFocus();');
  const idxGet = fnSrc.indexOf('$.get(');
  assert(idxFocus !== -1, '必须有即时恢复语句');
  assert(idxGet !== -1, '必须有 $.get 请求');
  assert(idxFocus < idxGet, `即时恢复必须在 $.get 之前（实际 focus@${idxFocus} get@${idxGet}）`);
});

// ─────────── ② 用桩驱动真实函数，验证请求未完成时焦点已回归 ───────────
test('请求挂起时焦点已回归（模拟网络延迟）', () => {
  const vm = require('vm');
  let focused = 0;
  let pending = null;                       // 捕获未 resolve 的请求
  const sandbox = {
    console: { log: () => {}, warn: () => {} },
    GM_setValue: () => {},
    abbreviateName: (n) => String(n),
    LAST_USED_COOKIE_KEY: 'k',
    updateCurrentCookieDisplay: () => {},
    updateDropdownUI: () => {},
    getCookiesList: () => ({}),
    removeDateString: () => {},
    updatePreviewCookieId: () => {},
    toast: () => {},
    setTimeout: () => 0,                    // 兜底恢复不执行，确保只测即时恢复
    document: { querySelector: () => ({ focus: () => { focused++; } }) },
    $: { get: () => { const o = { done: (cb) => { pending = cb; return o; }, fail: () => o }; return o; } },
  };
  vm.createContext(sandbox);
  vm.runInContext(rfSrc + '\n' + fnSrc + '\nthis.switch_cookie = switch_cookie;', sandbox);

  sandbox.switch_cookie({ id: 'abc', name: 'X' }, { silent: true, focusBackNow: true });
  assert(focused === 1, `发起请求后焦点应已回归 1 次，实际 ${focused}（请求尚未完成）`);
  assert(typeof pending === 'function', '请求应处于挂起状态（模拟延迟）');

  // 模拟网络成功：兜底恢复被 setTimeout 吞掉，焦点次数不应变化
  pending();
  assert(focused === 1, `成功回调不应重复聚焦（兜底走 setTimeout），实际 ${focused}`);
});

test('未传 focusBackNow 时不得提前聚焦（保持既有调用方行为）', () => {
  const vm = require('vm');
  let focused = 0;
  const sandbox = {
    console: { log: () => {}, warn: () => {} },
    GM_setValue: () => {}, abbreviateName: (n) => String(n), LAST_USED_COOKIE_KEY: 'k',
    updateCurrentCookieDisplay: () => {}, updateDropdownUI: () => {}, getCookiesList: () => ({}), removeDateString: () => {},
    updatePreviewCookieId: () => {}, toast: () => {}, setTimeout: () => 0,
    document: { querySelector: () => ({ focus: () => { focused++; } }) },
    $: { get: () => { const o = { done: () => o, fail: () => o }; return o; } },
  };
  vm.createContext(sandbox);
  vm.runInContext(rfSrc + '\n' + fnSrc + '\nthis.switch_cookie = switch_cookie;', sandbox);
  sandbox.switch_cookie({ id: 'abc', name: 'X' }, { silent: true });
  assert(focused === 0, `未开启 focusBackNow 时不应提前聚焦，实际 ${focused}`);
});

// ─────────── ③ 兜底恢复仍在成功回调内 ───────────
test('成功回调保留兜底恢复（UI 更新可能打断即时恢复）', () => {
  assert(/setTimeout\(\(\) => \{ restorePostTextareaFocus\(\); \}, 100\)/.test(fnSrc),
    '成功回调应保留 setTimeout(restorePostTextareaFocus, 100) 兜底');
});

// ─────────── ④ 两条 UI 路径都传入 focusBackNow ───────────
test('快捷菜单与原生下拉两条路径都启用即时恢复', () => {
  assert(/restorePostTextareaFocus\(\);\s*\}\s*\);\s*\n\s*menu\.appendChild/.test(src) ||
         /closeCookieShortcutMenu\(\);\s*\n\s*if \(typeof restorePostTextareaFocus === 'function'\) restorePostTextareaFocus\(\);/.test(src),
    '快捷菜单点击后应先关菜单再即时恢复焦点');
  assert(/switch_cookie\(l\[sel\], \{ focusBackNow: true \}\)/.test(src),
    '原生下拉 change 应传 focusBackNow: true');
});

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (e) { failed++; console.error(`FAIL - ${name}: ${e.message}`); }
}
if (failed) { console.error(`${failed} test(s) failed`); process.exit(1); }
console.log('cookie focus restore contract ok');
