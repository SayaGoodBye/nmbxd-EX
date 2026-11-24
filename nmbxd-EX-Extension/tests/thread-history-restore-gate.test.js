// 「阅读位置恢复」闸门：契约测试
// 需求（用户场景）：在末页前几页读到底触发无缝翻页时，**不得**自动跳到记录的阅读位置。
//   只有"直接打开该页"（URL 里就是记录的那一页）才允许恢复。
// 三道防线：
//   ① 目标页 ≠ 当前 URL 页 → 直接放弃（cross-page 不跳）
//   ② 目标元素必须属于当前页容器（克隆页 data-cloned-page=N，N ≠ 当前页 → 不认）
//   ③ SeamlessPageAppended 事件发生 → 立即停止轮询；轮询窗口收窄到约 2s
// 另外：滚动跟踪必须"用户输入武装"才记录阅读位置（否则翻页插入内容引起的 scroll 会污染锚点）。
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

const restore = extractFn('initThreadHistoryReplyRestore');
const tracking = extractFn('installThreadHistoryScrollTracking');

// ─────────── ① 跨页闸门 ───────────
test('恢复：目标页 ≠ 当前 URL 页时直接放弃（不跨页跳转）', () => {
  assert(/const urlPage = Math\.max\(1, Number\(parsed\.page\) \|\| 1\);/.test(restore), '必须取当前 URL 页');
  assert(/if \(Number\(targetPage\) !== urlPage\) return;/.test(restore), '目标页与当前页不同必须 return');
});

test('恢复：目标元素必须在当前页容器内（克隆页不认）', () => {
  assert(/const inCurrentPageScope = \(el\) =>/.test(restore), '必须有当前页作用域判定');
  assert(/container\.getAttribute\('data-cloned-page'\)/.test(restore), '必须检查 data-cloned-page');
  assert(/return !cloned \|\| cloned === urlPage;/.test(restore), '克隆页页码必须等于当前页');
  assert(/if \(inCurrentPageScope\(all\[i\]\)\) return all\[i\];/.test(restore), '候选必须逐个过闸门');
});

// ─────────── ② 无缝翻页即停 ───────────
test('恢复：SeamlessPageAppended 发生即停止轮询', () => {
  assert(/document\.addEventListener\('SeamlessPageAppended', stop, \{ once: true \}\)/.test(restore), '必须监听无缝翻页事件');
  assert(/const tryScroll = \(\) => \{\s*if \(stopped\) return;/.test(restore), 'tryScroll 入口必须检查 stopped');
  assert(/if \(stopped\) return;\s*try \{\s*if \(el\.isConnected && inCurrentPageScope\(el\)\)/.test(restore),
    '二次校准也必须检查 stopped 与作用域');
});

test('恢复：轮询窗口收窄（不再覆盖用户停留后触发翻页的时段）', () => {
  assert(/if \(\+\+attempts <= 8\) setTimeout\(tryScroll, 250\);/.test(restore), '轮询应为 8×250ms ≈ 2s');
  assert(!/attempts <= 20/.test(restore), '不得再是 20×300ms=6s');
});

// ─────────── ③ 滚动跟踪：用户武装 ───────────
test('滚动跟踪：只有用户主动输入后的 scroll 才算阅读位置', () => {
  assert(/let userScrollArmed = false;/.test(tracking), '必须有用户武装标志');
  ['wheel', 'touchstart', 'touchmove', 'keydown', 'mousedown'].forEach((evt) => {
    assert(tracking.indexOf("'" + evt + "'") >= 0, '必须监听 ' + evt + ' 作为武装来源');
  });
  assert(/if \(!userScrollArmed\) return;\s+\/\/ 布局变化\/程序滚动/.test(tracking), '未武装时 scroll 必须直接返回');
});

test('滚动跟踪：pagehide 也只采纳用户滚动结果', () => {
  assert(/if \(isThreadHistoryEnabledNow\(\) && userScrollArmed\) \{/.test(tracking), 'pagehide 必须检查 userScrollArmed');
});

// ─────────── ④ 不破坏既有行为 ───────────
test('仍保留：标记消费即清、30s 时效、?r= 优先', () => {
  assert(/if \(new URLSearchParams\(location\.search\)\.get\('r'\)\) return;/.test(restore), '?r= 仍优先');
  assert(/window\.localStorage\.removeItem\('xdex-restore-read-pos'\)/.test(restore), '标记仍消费即清');
  assert(/Date\.now\(\) - Number\(armed\.at\) <= 30000/.test(restore), '30s 时效仍在');
});

test('仍保留：命中的二次校准（800ms）与原地居中', () => {
  assert(/el\.scrollIntoView\(\{ block: 'center', behavior: 'auto' \}\);/.test(restore), '必须以 center 对齐');
  assert(/\}, 800\);/.test(restore), '800ms 二次校准仍在');
});

// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass += 1; console.log('  ok  ' + name); }
    catch (err) { console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err)); process.exitCode = 1; }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  console.log(process.exitCode ? 'reading-position restore gate FAILED' : 'reading-position restore gate ok');
})();
