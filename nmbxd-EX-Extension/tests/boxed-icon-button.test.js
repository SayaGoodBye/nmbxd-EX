// 圆角方框按钮（.xdex-boxed-btn）：与 .xdex-icon-btn 外观一致，且只作用于指定按钮
// 背景：用户要求给 sp_openDefaultSubscriptionFeed（我的订阅齿轮）与 kaomoji-manage-btn（颜文字铅笔）
//       加外围圆角方框，样式与 sp_openImageViewer 那类 30×30 按钮一致。
// 约束：.xdex-edit-default-btn 是公共类，还用于 kaomoji-undo-btn / kaomoji-reset-btn /
//       默认饼干编辑等位置，因此必须用独立的修饰类限定范围，不能改公共类本身。
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

function sliceBetween(a, b) {
  const i = src.indexOf(a);
  assert(i >= 0, 'missing anchor: ' + a.slice(0, 50));
  const j = src.indexOf(b, i);
  assert(j > i, 'missing end anchor: ' + b.slice(0, 50));
  return src.slice(i, j);
}

// ─────────── ① 修饰类存在且外观与 icon-btn 逐条等价 ───────────
const boxedRule = (() => {
  const i = src.indexOf("'.xdex-edit-default-btn.xdex-boxed-btn{");
  assert(i >= 0, '.xdex-boxed-btn 规则必须存在');
  const j = src.indexOf("' +", i);
  return src.slice(i, j);
})();

test('方框尺寸/圆角/边框/背景必须与 .xdex-icon-btn 一致', () => {
  assert(/width:30px/.test(boxedRule), 'width must be 30px like icon-btn');
  assert(/height:30px/.test(boxedRule), 'height must be 30px like icon-btn');
  assert(/border-radius:8px/.test(boxedRule), 'border-radius must be 8px like icon-btn');
  assert(/border:1px solid var\(--xdex-sp-border,#bfa58f\)/.test(boxedRule), 'border must match icon-btn');
  assert(/background:var\(--xdex-sp-panel-bg,#F0E0D6\)/.test(boxedRule), 'background must match icon-btn');
  assert(/box-sizing:border-box/.test(boxedRule), 'box-sizing must be border-box');
  // 与真实 icon-btn 声明逐项比对（防止将来只改一边导致同排按钮大小不一）
  const icon = sliceBetween("'.xdex-icon-btn{display:inline-flex;", "' +");
  ['width:30px', 'height:30px', 'border-radius:8px', 'box-sizing:border-box'].forEach((decl) => {
    assert(icon.indexOf(decl) >= 0, 'icon-btn must still declare ' + decl);
    assert(boxedRule.indexOf(decl) >= 0, 'boxed-btn must declare ' + decl);
  });
});

test('hover/active 与深色模式必须同样覆盖', () => {
  assert(/\.xdex-edit-default-btn\.xdex-boxed-btn:hover\{border-color:#00ffcc !important;color:#00ffcc !important;\}/.test(src),
    'hover must match icon-btn (#00ffcc)');
  assert(/\.xdex-edit-default-btn\.xdex-boxed-btn:active\{border-color:#00b386 !important;color:#00b386 !important;\}/.test(src),
    'active must match icon-btn (#00b386)');
  assert(/:root\.xdex-custom-dark \.xdex-edit-default-btn\.xdex-boxed-btn,:root\.xdex-darkreader-active \.xdex-edit-default-btn\.xdex-boxed-btn\{background:#2b2c2d;border-color:#555;color:#d9d0d0;\}/.test(src),
    'dark mode must be covered (both custom-dark and darkreader)');
});

// ─────────── ② 只挂到两个指定按钮 ───────────
test('sp_openDefaultSubscriptionFeed 必须挂上修饰类', () => {
  assert(/id="sp_openDefaultSubscriptionFeed" class="xdex-edit-default-btn xdex-boxed-btn"/.test(src),
    'subscription gear must carry .xdex-boxed-btn');
});

test('kaomoji-manage-btn 必须挂上修饰类', () => {
  assert(/manageBtn\.className = 'xdex-edit-default-btn kaomoji-manage-btn xdex-boxed-btn';/.test(src),
    'kaomoji pencil must carry .xdex-boxed-btn');
});

// ─────────── ③ 不得扩大作用范围（回归守卫） ───────────
test('公共类 .xdex-edit-default-btn 本身不得被加上边框/背景', () => {
  const i = src.indexOf("'.xdex-edit-default-btn{");
  assert(i >= 0, 'base class must exist');
  const base = src.slice(i, src.indexOf("' +", i));
  assert(!/border:1px solid/.test(base), 'base class must NOT gain a border (would affect undo/reset/edit buttons)');
  assert(!/background:var\(/.test(base), 'base class must NOT gain a background');
  assert(/border:none/.test(base), 'base class must keep border:none');
  assert(/background:none/.test(base), 'base class must keep background:none');
});

test('三个颜文字按钮都必须挂 boxed 修饰类', () => {
  assert(/resetBtn\.className = 'xdex-edit-default-btn kaomoji-reset-btn xdex-boxed-btn';/.test(src),
    'reset must carry .xdex-boxed-btn');
  assert(/undoBtn\.className = 'xdex-edit-default-btn kaomoji-undo-btn xdex-boxed-btn';/.test(src),
    'undo must carry .xdex-boxed-btn');
});

test('★ 共享 .kaomoji-*-btn 规则必须排除 .xdex-boxed-btn（否则抹掉边框）', () => {
  // 该样式块在 .xdex-boxed-btn 规则**之后**注入（面板初始化时才 append），后注入者胜出；
  // 不排除就会把 border:0 / background:none / border-radius:4px 压到已加框按钮上，
  // 实测表现为"三按钮尺寸对但都没边框没背景"。
  const i = src.indexOf('.kaomoji-manage-btn:not(.xdex-boxed-btn),');
  assert(i >= 0, 'shared rule must exclude .xdex-boxed-btn via :not()');
  const block = src.slice(i, i + 900);
  assert(/border: 0;/.test(block), 'unboxed branch keeps border: 0');
  assert(/border-radius: 4px;/.test(block), 'unboxed branch keeps compact radius');
  assert(/\.kaomoji-undo-btn:not\(\.xdex-boxed-btn\),/.test(block), 'undo must be excluded too');
  assert(/\.kaomoji-reset-btn:not\(\.xdex-boxed-btn\)/.test(block), 'reset must be excluded too');
});

test('加框态必须保留布局与交互，但不再声明边框/背景/尺寸', () => {
  const i = src.indexOf('.kaomoji-manage-btn.xdex-boxed-btn,');
  assert(i >= 0, 'boxed-state rule must exist');
  const block = src.slice(i, i + 800);
  assert(/display: inline-flex;/.test(block), 'must keep inline-flex');
  assert(/align-items: center;/.test(block), 'must keep centering');
  assert(!/width: 30px/.test(block), 'size stays owned by .xdex-boxed-btn');
  assert(!/border: 1px/.test(block), 'border stays owned by .xdex-boxed-btn');
  assert(!/background:/.test(block), 'background stays owned by .xdex-boxed-btn');
});

test('未挂修饰类的按钮不受影响（对照）', () => {
  // sp_openThreadExport 本来就该有自己的框（它用的是 .xdex-icon-btn），保持不变
  assert(/id="sp_openThreadExport" class="xdex-icon-btn"/.test(src), 'export button keeps .xdex-icon-btn');
  // 默认饼干编辑按钮不在此次范围内
  const m = src.match(/class="xdex-edit-default-btn" title="修改默认饼干"/);
  assert(m, 'cookie edit button must remain unboxed');
});

// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass += 1; console.log('  ok  ' + name); }
    catch (err) { console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err)); process.exitCode = 1; }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  console.log(process.exitCode ? 'boxed button contract FAILED' : 'boxed button contract ok');
})();
