// 引用浮窗几何契约
// 目标：
//   1) 面板高度由内容决定，内容变化（图片激活/文本变多）时自动生长，超出上限内部滚动
//   2) 四边/四角把手挂在 .qp-stack 上，必须与可见面板边缘重合（尤其底部）
//   3) 打开位置固定（上沿恒定），不随内容高度漂移
// 历史坑（都在本文件里守）：
//   · .qp-overlay-quote .qp-quote { height:auto !important } 压掉 height:100%，
//     面板退化为内容高而 stack 仍是 80vh → 底部把手悬在面板外 580px。
//   · 用 absolute + JS 测 scrollHeight 回写 stack 高度：图片加载/字体替换时序里
//     测到偏小值 → 面板闪一下正确高度又缩回最小值、激活图片不增长。
//   · .qp-quote 改 relative 后，内部 absolute 元素不撑开父级 → 面板塌成一条线。
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// 取某个选择器规则的 CSS 声明（先剥注释，避免注释里的旧写法被误判）
function ruleOf(selector) {
  const i = src.indexOf(selector);
  assert(i >= 0, 'missing rule: ' + selector);
  const j = src.indexOf('}', i);
  assert(j > i, 'unclosed rule: ' + selector);
  return src.slice(i, j).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
}

const stackCss = ruleOf('.qp-stack {');
// 面板样式分两处：主几何规则（absolute/width/height）+ 内容自适应兜底（!important）。
// 两者必须合并判断，否则只看到一半。
const quoteCss = (() => {
  const out = [];
  let idx = 0;
  while ((idx = src.indexOf('.qp-overlay-quote .qp-quote {', idx)) !== -1) {
    const j = src.indexOf('}', idx);
    out.push(src.slice(idx, j).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' '));
    idx = j;
  }
  return out.join(' || ');
})();

// ─────────── ① .qp-quote 的定位方式 ───────────
test('.qp-quote 必须 position:absolute（relative 会被内部 absolute 元素害得塌成一条线）', () => {
  assert(/position: absolute/.test(quoteCss), 'must be absolute (relative collapsed in practice)');
  assert(!/position: relative/.test(quoteCss), 'must NOT be relative');
});

test('.qp-quote 内容自适应（height:auto），不写死高度', () => {
  assert(/height: auto !important/.test(quoteCss), 'content-adaptive height');
  assert(/max-height: 100% !important/.test(quoteCss), 'bounded by stack height');
  assert(/overflow: auto !important/.test(quoteCss), 'internal scroll when overflowing');
});

// ─────────── ② .qp-stack：固定上沿 + 由 JS 贴合内容 ───────────
test('.qp-stack 用固定上沿定位（top:18vh + translateX，不随内容高度漂移）', () => {
  // 18vh：比回复浮窗最高时（上沿 10vh）低一截，比纯居中(41% @167px高)高很多。
  assert(/top: 18vh/.test(stackCss), 'must anchor the top edge (top:18vh)');
  assert(/transform: translateX\(-50%\)/.test(stackCss), 'horizontal centering only');
  assert(!/translate\(-50%, -50%\)/.test(stackCss), 'must NOT center vertically');
});

test('★ 最大宽度已放宽（820 → 1640），窄窗口仍跟随 90vw', () => {
  assert(/width: min\(90vw, 1640px\)/.test(stackCss), 'max width must be doubled to 1640px');
  assert(!/820px/.test(stackCss), 'old 820px cap must be gone');
});

test('.qp-stack 必须有确定高度（供 .qp-quote 的 max-height:100% 生效）', () => {
  // 上沿 18vh + 底部 5vh 余量 → 上限 77vh，保守取 72vh
  assert(/height: min\(72vh, calc\(100vh - 18vh - 5vh\)\)/.test(stackCss),
    'deterministic height with top offset + bottom margin reserved');
});

test('★ syncQuoteStackHeight 只认 scrollHeight，且必须事件驱动（不轮询）', () => {
  const i = src.indexOf('function syncQuoteStackHeight(');
  assert(i >= 0, 'helper must exist');
  const j = src.indexOf('function enableDragForTop(', i);
  const block = src.slice(i, j);
  // absolute + max-height:100% 下 offsetHeight 会被 stack 现有高度反钳，
  // 混入 offsetHeight 会把"缩小后的值"当内容高度写回，永久锁在小尺寸。
  assert(/quoteEl\.scrollHeight/.test(block), 'must read scrollHeight (natural content height)');
  assert(!/quoteEl\.offsetHeight/.test(block), 'must NOT mix in offsetHeight (clamped by stack)');
  // 事件驱动三件套：尺寸变化 / DOM 变化 / 图片载入
  assert(/ResizeObserver/.test(block), 'must react to size changes');
  assert(/MutationObserver/.test(block), 'must react to DOM changes (lazy-loaded images / expand)');
  assert(/'load'/.test(block), 'must react to <img> load (size only known after decode)');
  // 不得用定时轮询：静态页面下应零开销
  assert(!/setInterval/.test(block), 'must NOT poll on a timer (wasted work when idle)');
});

test('★ stack 是单例复用的，换 quote 必须重置观察器（否则新面板收不到事件）', () => {
  const i = src.indexOf('function syncQuoteStackHeight(');
  const block = src.slice(i, src.indexOf('function enableDragForTop(', i));
  assert(/__xdexStackQuote !== quoteEl/.test(block), 'must detect a new quote element');
  assert(/__xdexStackRO\)? \{ try \{ stackEl\.__xdexStackRO\.disconnect/.test(block), 'must disconnect old ResizeObserver');
  assert(/__xdexStackMO\).*?disconnect/.test(block), 'must disconnect old MutationObserver');
});


test('★ 高度必须补上 border（否则恒定差 2px 溢出、永远挂着滚动条）', () => {
  // scrollHeight 不含 border，clientHeight = 高度 - border。
  // .qp-quote 有 border:1px solid → 直接把 stack 高度写成 scrollHeight 时
  // clientHeight 永远比 scrollHeight 小 2px，内容完全放得下也会出现滚动条。
  const i = src.indexOf('function syncQuoteStackHeight(');
  const block = src.slice(i, src.indexOf('function enableDragForTop(', i));
  assert(/borderTopWidth/.test(block), 'must read border-top width');
  assert(/borderBottomWidth/.test(block), 'must read border-bottom width');
  assert(/h \+ borderY|scrollHeight \+ borderY|Math\.ceil\(h \+ borderY\)/.test(block),
    'must add vertical border to the measured height');
});

test('滚动条只在触达高度上限时出现（未超限不得预留滚动条）', () => {
  const i = src.indexOf('function syncQuoteStackHeight(');
  const block = src.slice(i, src.indexOf('function enableDragForTop(', i));
  // 上限截断存在，才可能内部滚动
  assert(/Math\.min\([^;]*maxAllowed\(\)/.test(block), 'must clamp to maxAllowed()');
  // maxAllowed 必须与 CSS 的 72vh 上限一致（18vh 上沿 + 5vh 底部余量）
  assert(/vh \* 0\.72/.test(block), 'maxAllowed must use 0.72 to match CSS');
  // 不得给引用弹窗的 .qp-quote 预留滚动条槽（回复浮窗另有选择器，不在本约束内）
  const quoteRuleIdx = src.indexOf('.qp-overlay-quote .qp-quote {');
  const quoteRule = src.slice(quoteRuleIdx, src.indexOf('}', quoteRuleIdx));
  assert(!/scrollbar-gutter/.test(quoteRule), 'must not reserve a scrollbar gutter on quote popup');
});

// ─────────── ③ 把手必须贴合可见边缘 ───────────
test('四边把手必须挂在 .qp-stack 的直接子级上', () => {
  assert(!/\.qp-overlay-quote\s+\.qp-quote[^{]*\.qp-drag-edge/.test(src),
    'handles must not be scoped under .qp-quote');
  assert(/\.qp-overlay-quote\s+\.qp-stack\s*>\s*\.qp-drag-edge/.test(src),
    'handles must be .qp-stack > .qp-drag-edge');
});

test('底部边条必须跨出 stack 底边（bottom:-4px + height:16px）', () => {
  assert(/\.qp-overlay-quote\s+\.qp-stack\s*>\s*\.qp-drag-edge\.bottom\s*\{\s*bottom:\s*-4px;[^}]*height:\s*16px;/.test(src),
    'bottom edge must straddle the stack bottom');
});

test('把手层级必须压过面板的内联 zIndex（1000+depth）', () => {
  // 该规则块内含长注释，必须取到规则结尾的 } 而不是固定长度
  const i = src.indexOf('.qp-overlay-quote .qp-stack > .qp-drag-edge,');
  assert(i >= 0, 'handle base rule must exist');
  const j = src.indexOf('}', i);
  const block = src.slice(i, j).replace(/\/\*[\s\S]*?\*\//g, '');
  assert(/z-index:\s*9000/.test(block), 'handles must sit above the panel');
  assert(/pointer-events:\s*auto/.test(block), 'handles must accept pointer events');
});

// ─────────── ④ 用户缩放后不被自动覆盖 ───────────
test('用户缩放后必须标记 qpUserSized，自动贴合不得再改高度', () => {
  const i = src.indexOf("$overlay.data('isDragging', true); // 避免缩放结束点到遮罩误关");
  assert(i > 0, 'resize start marker must exist');
  assert(/qpUserSized = '1'/.test(src.slice(i, i + 500)), 'resize must mark user-sized');
  const h = src.indexOf('function syncQuoteStackHeight(');
  const hEnd = src.indexOf('function enableDragForTop(', h);
  assert(/qpUserSized === '1'/.test(src.slice(h, hEnd)), 'apply() must bail out on user-sized');
});

// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass += 1; console.log('  ok  ' + name); }
    catch (err) { console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err)); process.exitCode = 1; }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  console.log(process.exitCode ? 'quote popup geometry contract FAILED' : 'quote popup geometry contract ok');
})();
