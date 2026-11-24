// 大图激活尺寸：缩略图 → 原图就绪后必须重算
// 问题：点击激活时先 hdImageLazyLoader.load() 再**立即** handleActiveImageBox()，
//       此时原图通常还没下载完，img.naturalWidth 仍是**缩略图**尺寸，__sizeCache 被固定。
//       之后即使原图加载完成，再次激活仍是缩略图大小（用户实测复现）。
// 修复：原图就绪（probe.onload → 切换活元素 src）后，若该图正处于激活态，强制重算一次。
const fs = require('fs');
const path = require('path');

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

// startHdAttempt 内含异步回调，括号配平提取易失败 → 直接按锚点切片
function sliceBetween(a, b) {
  const i = src.indexOf(a);
  if (i < 0) return '';
  const j = src.indexOf(b, i);
  return j > i ? src.slice(i, j) : src.slice(i, i + 4000);
}
const startHd = sliceBetween('function startHdAttempt(img, hdUrl, attempt, onSettled, baseHdUrl) {', 'function load(img, hdUrl, options) {');
const activeBox = sliceBetween('handleActiveImageBox(imgBox, forceRecalculate = false) {', 'handleGeneralElements(container) {');

// ─────────── ① 原图就绪后必须重算 ───────────
test('原图就绪（probe.onload）后必须重算激活态尺寸', () => {
  // 注意：startHd 里还有一处 probe.onload = null（finishAttempt 清理），必须定位到赋值回调那处
  const i = startHd.indexOf('probe.onload = () => {');
  assert(i >= 0, 'probe.onload 回调必须存在');
  // 用"下一个回调 / 链尾"作右界，避免注释增删导致固定长度切片失效
  const end = startHd.indexOf('probe.onerror = () =>', i);
  const block = startHd.slice(i, end > i ? end : startHd.length);
  assert(/handleActiveImageBox\(box, true\)/.test(block), '原图就绪后必须以 force=true 重算');
  assert(/classList\.contains\('h-active'\)/.test(block), '仅在该图处于激活态时重算');
});

test('重算前必须丢弃旧尺寸缓存（尺寸来源已变）', () => {
  const i = startHd.indexOf('probe.onload = () => {');
  const end = startHd.indexOf('probe.onerror = () =>', i);
  const block = startHd.slice(i, end > i ? end : startHd.length);
  assert(/delete box\.__sizeCache/.test(block), '必须删除 __sizeCache');
  assert(/delete box\.__maxWidth/.test(block), '必须删除 __maxWidth');
  // 删除必须发生在重算之前
  assert(block.indexOf('delete box.__sizeCache') < block.indexOf('handleActiveImageBox(box, true)'),
    'delete 必须先于重算');
});

// ─────────── ② 尺寸来源是 img.naturalWidth（缩略图会污染） ───────────
test('handleActiveImageBox 用 naturalWidth/Height 计算（故必须处理缩略图就绪的场景）', () => {
  assert(/const naturalWidth = img\.naturalWidth;/.test(activeBox), 'must read naturalWidth');
  assert(/const naturalHeight = img\.naturalHeight;/.test(activeBox), 'must read naturalHeight');
  // 仅在"尚未 complete"时挂 onload：图片若以缩略图 complete，就永远不会再触发
  assert(/if \(img\.complete\) return;/.test(activeBox), 'complete 时直接返回，不会等原图');
});

// ─────────── ③ 激活路径：先 load(hd) 再立即算尺寸 ───────────
test('激活时先触发原图加载，再立即计算尺寸（正是需要后续重算的原因）', () => {
  assert(/hdImageLazyLoader\.load\(img, anchor\.href, \{ force: true \}\)/.test(src), '激活必须触发原图加载');
  const i = src.indexOf("box.classList.add('h-active')");
  assert(i > 0, 'must find activate branch');
  // 分支内现在还有"恢复原图 src"的插入代码，切片要足够长
  const block = src.slice(i, i + 2000);
  const loadIdx = block.indexOf('hdImageLazyLoader.load(');
  // 注意：注释里也出现该词，必须匹配真正的调用形式
  const layoutIdx = block.indexOf('handleImageLayout.handleActiveImageBox(box)');
  assert(loadIdx >= 0 && layoutIdx >= 0, 'both calls must exist in activate branch');
  assert(loadIdx < layoutIdx, 'load 先于 handleActiveImageBox（此时原图未就绪 → 必须靠后续重算）');
});

// ─────────── ④ 不得破坏既有回退语义 ───────────
test('失败回退仍回缩略图、不置 loaded（修复不改变失败语义）', () => {
  assert(/hdFailedCooldown\.set\(img, nowTs\(\) \+ HD_RETRY_COOLDOWN_MS\)/.test(startHd), 'must keep cooldown on failure');
  assert(/img\.src = thumbSrc;/.test(startHd), 'must restore thumbnail on failure');
  const failIdx = startHd.indexOf('if (thumbSrc) {');
  const failBlock = startHd.slice(failIdx, failIdx + 900);
  assert(!/xdexHdLoaded = '1'/.test(failBlock), 'failure must not mark loaded');
});


// ─────────── ⑤ 缓存必须与"尺寸来源"绑定 ───────────
test('__sizeCache 必须记录尺寸来源（img.src），并在 src 变化时重算', () => {
  const i = activeBox.indexOf('sizeSourceKey');
  assert(i >= 0, 'must compute sizeSourceKey');
  assert(/const sizeSourceKey = String\(img\.currentSrc \|\| img\.src \|\| ''\);/.test(activeBox),
    'sizeSourceKey must come from currentSrc/src');
  assert(/const sourceChanged = imgBox\.__sizeSource !== sizeSourceKey;/.test(activeBox),
    'must compare with stored source');
  assert(/\|\| sourceChanged\)/.test(activeBox), 'recalc condition must include sourceChanged');
  assert(/imgBox\.__sizeSource = sizeSourceKey;/.test(activeBox), 'must persist the source key');
});

test('原文缺口：只比较 maxWidth 会复用缩略图缓存（回归守卫）', () => {
  // 旧条件只有 !cache || force || maxWidth 变化 → 缩略图缓存会被复用
  const i = activeBox.indexOf('if (!imgBox.__sizeCache || shouldForceRecalculate');
  assert(i >= 0, 'must find the recalc condition');
  const cond = activeBox.slice(i, i + 260);
  assert(cond.indexOf('sourceChanged') > 0, 'condition must include sourceChanged (not just maxWidth)');
});

// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass += 1; console.log('  ok  ' + name); }
    catch (err) { console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err)); process.exitCode = 1; }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  console.log(process.exitCode ? 'hd active-size refresh contract FAILED' : 'hd active-size refresh contract ok');
})();
