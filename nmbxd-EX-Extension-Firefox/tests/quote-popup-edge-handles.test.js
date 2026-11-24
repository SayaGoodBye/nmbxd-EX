// 引用浮窗（.qp-overlay-quote）边缘手柄：契约测试
// 问题：激活大图后内容变高，四边/四角拖拽把手不随容器变化（错位）。
// 根因：把手挂在内层滚动容器 .qp-quote 上，而它只写了 max-height:100%（内容会把它撑高），
//       且没有固定高度 → 把手跟随"内容高度"而不是"用户看到的外框"。
// 修复（对齐回复浮窗 .qp-overlay 的既有做法）：
//   ① 把手/DOM 挂在 .qp-stack（尺寸容器）上；
//   ② .qp-quote 用 height:100% 跟随 .qp-stack（与被拖/被缩放对象一致）；
//   ③ 拖拽/缩放对象仍是 .qp-quote（.qp-stack 带 transform，直接改其 top/left 会打架）。
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// ─────────── ① 把手挂载位置 ───────────
test('把手挂在 .qp-stack（不是 .qp-quote）', () => {
  assert(/\.qp-overlay-quote \.qp-stack > \.qp-drag-edge/.test(src), 'CSS 必须以 .qp-stack 直接子元素定位拖拽边');
  assert(/\.qp-overlay-quote \.qp-stack > \.qp-resize-corner/.test(src), 'CSS 必须以 .qp-stack 直接子元素定位拉伸角');
  assert(/\$stack\.append\(\$edges\);/.test(src), 'DOM 上把手必须 append 到 $stack');
  assert(!/\$quote\.append\(\$edges\);/.test(src), '不得再把把手 append 到 $quote');
});

test('叠层时先摘掉上一层的把手（避免残留）', () => {
  assert(/\$stack\.children\('\.qp-drag-edge, \.qp-resize-corner'\)\.remove\(\);/.test(src), '应清理旧把手');
});

// ─────────── ② .qp-quote 必须跟随尺寸容器 ───────────
test('.qp-quote 使用 height:100% 跟随 .qp-stack', () => {
  const i = src.indexOf('.qp-overlay-quote .qp-quote {');
  assert(i >= 0, '必须存在 .qp-overlay-quote .qp-quote 规则');
  const block = src.slice(i, i + 900);
  assert(/width: 100%; height: 100%; max-height: 100%;/.test(block), '必须同时写 width/height/max-height 100%');
  assert(/overflow: auto;/.test(block), '内容超出时仍应在面板内滚动');
});

// ─────────── ③ 拖拽/缩放对象 ───────────
test('拖拽与缩放的对象仍是 .qp-quote（避开 .qp-stack 的 transform）', () => {
  assert(/enableDragForTop\(\$quote, \$quote\.find\('\.qp-header'\)\.add\(\$edges\.filter\('\.qp-drag-edge'\)\)\);/.test(src),
    '拖拽目标应为 $quote，把手来自 $edges');
  assert(/enableResizeForQuote\(\$quote, \$edges\.filter\('\.qp-resize-corner'\)\);/.test(src),
    '缩放目标应为 $quote，把手来自 $edges');
  assert(/const \$box = \(\$target && \$target\.length\) \? \$target : \$stack;/.test(src),
    'enableResizeForQuote 必须支持传入目标与把手');
});

test('注释说明了为何不改 .qp-stack 的 top/left', () => {
  assert(/transform: translate\(-50%, -50%\)/.test(src), '应记录 .qp-stack 带 transform 的事实');
  assert(/直接改它的 top\/left 会与 transform 打架/.test(src), '应保留该设计约束的说明');
});

// ─────────── ④ 对齐既有实现（回复浮窗） ───────────
test('与回复浮窗的做法一致：把手在 .qp-stack 内、quote 为 100% 子元素', () => {
  // 回复浮窗：把手写在 .qp-stack 的模板里
  assert(/<div class="qp-stack">[\s\S]{0,400}?qp-drag-edge top/.test(src), '回复浮窗模板中把手应在 .qp-stack 内');
  // 回复浮窗：.qp-quote 为 100%/100%
  const i = src.indexOf('.qp-overlay .qp-stack > .qp-quote {');
  assert(i >= 0, '必须存在回复浮窗的 .qp-quote 规则');
  const block = src.slice(i, i + 600);
  assert(/width: 100%;/.test(block) && /height: 100%;/.test(block), '回复浮窗 .qp-quote 应为 100%/100%');
});


// ─────────── ⑤ 层级：必须高于面板（面板是内联 zIndex 1000+depth） ───────────
test('面板使用内联 zIndex（1000 + 层深）——把手必须压过它', () => {
  assert(/zIndex: 1000 \+ depth/.test(src), '面板应为内联 zIndex = 1000 + depth');
});

test('四边与四角 z-index 都必须高于面板', () => {
  // 取 CSS 里把手相关的整段（从第一个 .qp-stack > .qp-drag-edge 到 .qp-header 规则前）
  const start = src.indexOf('.qp-overlay-quote .qp-stack > .qp-drag-edge,');
  const end = src.indexOf('/* 标题栏作为拖拽手柄时的指针反馈 */');
  assert(start >= 0 && end > start, 'must locate handle css block');
  const block = src.slice(start, end);
  assert(/z-index: 9000;/.test(block), 'handles must be z-index 9000');
  assert(!/z-index: 6;/.test(block), 'must not be 6 (covered by panel)');
  assert(!/z-index: 7;/.test(block), 'must not be 7 (covered by panel)');
});


// ─────────── ⑥ 几何：底边不得贴住视口最下沿 ───────────
test('.qp-stack 必须居中且有安全边距（不得是 top:55% + 固定 80vh）', () => {
  const i = src.indexOf('.qp-stack {');
  const block = src.slice(i, i + 900);
  assert(/top: 50%;/.test(block), 'stack must be vertically centered (top:50%)');
  assert(!/top: 55%;/.test(block), 'must not be pushed down (top:55%)');
  assert(/height: min\(80vh, calc\(100vh - 40px\)\);/.test(block), 'height must reserve >=20px top/bottom margin');
});

test('.qp-stack 不得使用 height:auto（内部 .qp-quote 是 height:100%，会塌缩成 0）', () => {
  const i = src.indexOf('.qp-stack {');
  const block = src.slice(i, i + 1100);
  assert(!/^\s*height: auto;/m.test(block), 'height:auto would collapse to 0 with a 100% child');
});

test('上下边条必须跨出容器边缘（-4px）且加高到 16px', () => {
  // 实测：内收 1px 时可抓带 y=851..863，而面板可见底边在 864 → 用户放在"面板底部"
  // 命中的是遮罩，光标不变，感知为"底部没有拖拽条"。必须跨出边缘覆盖视觉边界。
  assert(/\.qp-drag-edge\.top    \{ top: -4px;    left: 14px; right: 14px; height: 16px; \}/.test(src),
    'top edge must cross the edge (-4px) with 16px band');
  assert(/\.qp-drag-edge\.bottom \{ bottom: -4px; left: 14px; right: 14px; height: 16px; \}/.test(src),
    'bottom edge must cross the edge (-4px) with 16px band');
  assert(!/bottom: 1px; left: 14px; right: 14px; height: 12px;/.test(src), 'must not revert to inset-1px/12px');
});


// ─────────── ⑦ 点击把手不得被遮罩判定为"点击外部"而关窗 ───────────
test('遮罩关闭判定必须排除把手（把手是 .qp-stack 的兄弟级子元素）', () => {
  assert(/const HANDLE_SEL = '\.qp-drag-edge, \.qp-resize-corner';/.test(src), 'must define handle selector');
  assert(/if \(inHandles\) return;/.test(src), 'must early-return for handle clicks');
  assert(/classList\.contains\('qp-drag-edge'\) \|\| n\.classList\.contains\('qp-resize-corner'\)/.test(src),
    'composedPath fallback must recognise handles');
  // inHandles 判定必须早于 inTopQuote 与"关闭"逻辑
  const iHandles = src.indexOf('if (inHandles) return;');
  const iClose = src.indexOf('clearQuoteSourceMark($top);', iHandles);
  assert(iHandles > 0 && iClose > iHandles, 'handle guard must precede close');
});

test('拖动/缩放过程中仍不关闭（既有保护保留）', () => {
  assert(/is-dragging/.test(src) && /is-resizing/.test(src), 'drag/resize state guards must remain');
});

// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass += 1; console.log('  ok  ' + name); }
    catch (err) { console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err)); process.exitCode = 1; }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  console.log(process.exitCode ? 'quote popup edge handles contract FAILED' : 'quote popup edge handles contract ok');
})();
