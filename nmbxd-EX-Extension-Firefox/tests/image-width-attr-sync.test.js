// 非激活图片宽度：原图就绪后必须把 width/height **属性**同步为原图尺寸
// 问题：站点给 <img> 写 width/height 属性（缩略图尺寸），属性优先于图片像素决定渲染尺寸。
//       只换 src 不改属性 → 原图仍按缩略图尺寸渲染（用户实测：加载完成后宽度仍是缩略图宽）。
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

const startHd = sliceBetween('function startHdAttempt(img, hdUrl, attempt, onSettled, baseHdUrl) {', 'function load(img, hdUrl, options) {');
const clickHandler = sliceBetween("anchor.addEventListener('click', (e) => {", 'function applyResizeForRotation(');
const restoreFn = sliceBetween('function restoreThumbSizeAttrs(img) {', 'function startHdAttempt(img, hdUrl');

// ─────────── ① 原图就绪后写回属性 ───────────
test('probe.onload 后必须把 width 属性同步为原图宽（并删掉 height 属性）', () => {
  const i = startHd.indexOf('probe.onload = () => {');
  assert(i >= 0, 'probe.onload must exist');
  const block = startHd.slice(i, i + 2600);
  assert(/img\.setAttribute\('width', String\(nw\)\)/.test(block), 'must set width attribute to original width');
  assert(/const nw = probe\.naturalWidth \| 0;/.test(block), 'size must come from probe (already decoded)');
  // ★ 不能写死 height：两个属性都写死时，被 max-width:100% 压宽会拉伸变形（实测 600x900 比例 0.667）
  assert(/img\.removeAttribute\('height'\)/.test(block), 'must REMOVE height attribute (browser derives it)');
  assert(!/img\.setAttribute\('height'/.test(block), 'must NOT set height attribute');
  // 不用 style.height（会被 applyImageSize / 取消激活的内联写入覆盖）
  assert(!/style\.setProperty\('height'/.test(block), 'must NOT rely on inline height:auto');
  // 必须在 finishAttempt(true) 之前
  assert(block.indexOf("setAttribute('width'") < block.indexOf('finishAttempt(true)'), 'attr sync must precede settle');
});

test('属性写入必须幂等（值相同不重复写，避免无谓重排）', () => {
  const i = startHd.indexOf('probe.onload = () => {');
  const block = startHd.slice(i, i + 2600);
  assert(/getAttribute\('width'\) !== String\(nw\)/.test(block), 'must compare before writing width');
  assert(/hasAttribute\('height'\)/.test(block), 'must guard height removal');
});

// ─────────── ② 收起时不得把属性写回缩略图尺寸 ───────────
test('收起恢复：原图已加载时不得把 width/height 属性写回缩略图值', () => {
  const i = clickHandler.indexOf('imgNaturalWidth:');
  assert(i >= 0, 'must record imgNaturalWidth');
  const saveBlock = clickHandler.slice(i - 300, i + 500);
  assert(/xdexHdLoaded === '1' \? \(img\.naturalWidth \| 0\)/.test(saveBlock),
    'saved size must prefer original size when hd loaded');

  const r = clickHandler.indexOf("if (img.dataset.xdexHdLoaded !== '1') {");
  assert(r >= 0, 'restore must be guarded by hd-loaded check');
  const restoreBlock = clickHandler.slice(r, r + 500);
  assert(/img\.width = initial\.imgNaturalWidth/.test(restoreBlock), 'must still restore when hd not loaded');
});

// ─────────── ③ 失败回退必须还原缩略图尺寸属性 ───────────
test('失败回退缩略图时必须还原 width/height 属性（否则被拉伸）', () => {
  const i = startHd.indexOf('if (thumbSrc) {');
  assert(i >= 0, 'failure branch must exist');
  const block = startHd.slice(i, i + 500);
  assert(/img\.src = thumbSrc;/.test(block), 'must restore thumbnail src');
  assert(/restoreThumbSizeAttrs\(img\)/.test(block), 'must restore thumbnail size attrs too');
});

test('restoreThumbSizeAttrs 与主路径同写法（只写 width、删 height）', () => {
  assert(/function restoreThumbSizeAttrs\(img\)/.test(restoreFn), 'helper must exist');
  assert(/if \(img\.hasAttribute\('height'\)\) img\.removeAttribute\('height'\);/.test(restoreFn), 'must drop height attr');
  assert(!/setAttribute\('height'/.test(restoreFn), 'must not set height attr');
  assert(/xdexThumbSrc/.test(restoreFn), 'must read the recorded thumbnail url');
  assert(/removeAttribute\('width'\)/.test(restoreFn), 'must drop width when size unavailable');
});

// ─────────── ④ 旋转逻辑依赖属性值，必须已被同步 ───────────
test('applyResizeForRotation 读 img.width（属性）→ 属性必须先被同步为原图尺寸', () => {
  const rotate = sliceBetween('function applyResizeForRotation(', 'function updatePreviewImageLayout(');
  assert(/const width = img\.width;/.test(rotate), 'rotation reads img.width (attribute)');
  // 说明性断言：属性同步存在于原图加载路径
  assert(startHd.indexOf("setAttribute('width'") > 0, 'width attr sync must exist for rotation correctness');
});

// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass += 1; console.log('  ok  ' + name); }
    catch (err) { console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err)); process.exitCode = 1; }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  console.log(process.exitCode ? 'image width attribute sync contract FAILED' : 'image width attribute sync contract ok');
})();
