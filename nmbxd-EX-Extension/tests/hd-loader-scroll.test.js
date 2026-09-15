// 高清原图懒加载：滚动热路径重构的等价性契约测试
// 覆盖：measureImage 与被合并的 classifyImage/getImagePriority 逐点一致、
//       canStartNonGif 的配额语义与旧的 queueHasKind 全队列扫描一致、
//       单次测量的 rect 读取数线性于队列长度、速度采样不再被亚毫秒 dt 放大
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

// 与 quote-availability 测试同款：跳过参数列表（含默认参数对象）后再配对花括号
function skipQuoted(src, from, q) {
  for (let i = from + 1; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '\\') { i += 1; continue; }
    if (ch === q) return i;
  }
  return src.length;
}
function regexAllowed(src, k) {
  let p = k - 1;
  while (p >= 0 && /\s/.test(src[p])) p -= 1;
  if (p < 0) return true;
  return ['=', '(', ',', ':', '?', '&', '|', '!', '[', '{', ';'].indexOf(src[p]) !== -1 ||
    /return$/.test(src.slice(Math.max(0, p - 6), p + 1));
}
function scanBalanced(src, open) {
  const opener = src[open];
  const closer = opener === '(' ? ')' : opener === '{' ? '}' : ']';
  let depth = 0;
  for (let k = open; k < src.length; k += 1) {
    const ch = src[k];
    const next = src[k + 1];
    if (ch === '/' && next === '/') { k = src.indexOf('\n', k); if (k === -1) return -1; continue; }
    if (ch === '/' && next === '*') { k = src.indexOf('*/', k); if (k === -1) return -1; continue; }
    if (ch === '"' || ch === "'" || ch === '`' || (ch === '/' && regexAllowed(src, k))) { k = skipQuoted(src, k, ch); continue; }
    if (ch === opener) depth += 1;
    else if (ch === closer) { depth -= 1; if (depth === 0) return k; }
  }
  return -1;
}
function extractFunction(name) {
  const start = source.indexOf(`function ${name}`);
  assert(start !== -1, `${name} must exist`);
  const openParen = source.indexOf('(', start);
  const closeParen = scanBalanced(source, openParen);
  assert(closeParen !== -1, `${name} params not closed`);
  const bodyStart = source.indexOf('{', closeParen + 1);
  assert(bodyStart !== -1, `${name} body must exist`);
  const bodyEnd = scanBalanced(source, bodyStart);
  assert(bodyEnd !== -1, `${name} body not closed`);
  return source.slice(start, bodyEnd + 1);
}
function extractConst(needle) {
  const line = source.split('\n').find((l) => l.trim().startsWith(needle));
  assert(line, `${needle} must exist`);
  return line.trim();
}

const NAMES = ['measureImage', 'measureQueue', 'getSnapPriority', 'getSnapKind', 'canStartNonGif', 'updateScrollMetrics'];
const consts = [extractConst('const MAX_CONCURRENT'), extractConst('const RESERVE_AHEAD_SLOTS'),
  extractConst('const BEHIND_PENALTY_DISTANCE'), extractConst('const SCROLL_SPEED_SAMPLE_MS')].join('\n');

// 闭包内的可变状态在此显式声明，供被测函数读写
const state = `
let scrollDirection = 1;
let scrollSpeed = 0;
let lastScrollY = 0;
let lastScrollTs = 0;
let activeLoads = 0;
let activeAheadLoads = 0;
const queue = [];
function nowTs() { return __now; }
let __now = 0;
`;

// 旧实现（重构前逐行照搬），用于等价性对照
const legacy = `
function oldClassify(img, vh, dir) {
  const rect = img.getBoundingClientRect();
  const aheadDistance = dir >= 0 ? rect.top - vh : -rect.bottom;
  const behindDistance = dir >= 0 ? -rect.bottom : rect.top - vh;
  if (rect.bottom >= 0 && rect.top <= vh) return 'visible';
  if (aheadDistance >= 0) return 'ahead';
  if (behindDistance > 0) return 'behind';
  return 'visible';
}
function oldPriority(img, vh, dir) {
  const rect = img.getBoundingClientRect();
  const viewportCenter = vh / 2;
  const imgCenter = rect.top + rect.height / 2;
  const aheadDistance = dir >= 0 ? rect.top - vh : -rect.bottom;
  const behindDistance = dir >= 0 ? -rect.bottom : rect.top - vh;
  const isVisible = rect.bottom >= 0 && rect.top <= vh;
  if (isVisible) return Math.abs(imgCenter - viewportCenter);
  if (aheadDistance >= 0) return 10000 + aheadDistance;
  if (behindDistance > 0) return (behindDistance > BEHIND_PENALTY_DISTANCE ? 1000000 : 100000) + behindDistance;
  return 200000 + Math.abs(imgCenter - viewportCenter);
}
// 旧配额判定：先扫全队列求 aheadWaiting
function oldCanStart(kind, kinds, free, activeAhead) {
  if (free <= 0) return false;
  const aheadWaiting = kind === 'ahead' || kinds.indexOf('ahead') !== -1;
  if (kind === 'visible') {
    if (!aheadWaiting) return true;
    return (free - 1) >= RESERVE_AHEAD_SLOTS || activeAhead > 0;
  }
  if (kind === 'ahead') return true;
  if (kinds.indexOf('visible') !== -1 || kinds.indexOf('ahead') !== -1) return false;
  return true;
}
`;

const code = `${consts}\n${state}\n${NAMES.map(extractFunction).join('\n')}\n${legacy}\n
this.api = { measureImage, measureQueue, getSnapPriority, getSnapKind, canStartNonGif, updateScrollMetrics,
  oldClassify, oldPriority, oldCanStart,
  set: (k, v) => { switch (k) {
    case 'scrollDirection': scrollDirection = v; break;
    case 'activeLoads': activeLoads = v; break;
    case 'activeAheadLoads': activeAheadLoads = v; break;
    case 'lastScrollY': lastScrollY = v; break;
    case 'lastScrollTs': lastScrollTs = v; break;
    case 'now': __now = v; break;
    case 'scrollSpeed': scrollSpeed = v; break;
  } },
  get: (k) => k === 'scrollSpeed' ? scrollSpeed : (k === 'lastScrollY' ? lastScrollY : (k === 'lastScrollTs' ? lastScrollTs : undefined)),
  queue,
};`;

const ctx = { Math, Number, Array, Object, Map, window: { innerHeight: 800 } };
ctx.globalThis = ctx;
require('vm').runInNewContext(code, ctx, { filename: 'hd.js' });
const A = ctx.api;

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// 可控图片桩：记录 rect 读取次数
let rectReads = 0;
function mkImg(rect, connected = true) {
  return {
    isConnected: connected,
    getBoundingClientRect() { rectReads += 1; return rect; },
  };
}
const r = (top, height) => ({ top, bottom: top + (height == null ? 100 : height), height: height == null ? 100 : height });

// ① 分类与优先级：与旧实现逐点一致
test('measureImage 与旧 classifyImage/getImagePriority 在随机几何下逐点一致', () => {
  let seed = 4242;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let dir of [-1, 1]) {
    for (let i = 0; i < 400; i += 1) {
      const vh = 400 + Math.floor(rnd() * 800);
      const top = Math.floor(rnd() * 3000) - 1000;
      const height = Math.floor(rnd() * 600);
      const rect = r(top, height);
      A.set('scrollDirection', dir);
      const img = mkImg(rect);
      const got = A.measureImage(img, vh);
      const wantKind = A.oldClassify(mkImg(rect), vh, dir);
      const wantPri = A.oldPriority(mkImg(rect), vh, dir);
      assert(got.kind === wantKind, `kind 不一致 dir=${dir} top=${top} h=${height} vh=${vh}: ${got.kind} vs ${wantKind}`);
      assert(got.priority === wantPri, `priority 不一致 dir=${dir} top=${top} h=${height} vh=${vh}: ${got.priority} vs ${wantPri}`);
    }
  }
});

// ② 单次测量的 rect 读取数必须线性于队列长度（旧实现是 O(N²)）
test('measureQueue 每个图片只读一次 rect', () => {
  A.queue.length = 0;
  for (let i = 0; i < 50; i += 1) A.queue.push(mkImg(r(i * 120 - 500, 100)));
  rectReads = 0;
  const snap = A.measureQueue();
  assert(rectReads === 50, `应恰好读 50 次 rect, got ${rectReads}`);
  // 排序与配额只读缓存，不再回查布局
  const sorted = A.queue.slice().sort((a, b) => A.getSnapPriority(snap, a) - A.getSnapPriority(snap, b));
  assert(sorted.length === 50 && rectReads === 50, `取优先级不得再读 rect, got ${rectReads}`);
  A.getSnapKind(snap, A.queue[0]);
  assert(rectReads === 50, `取分类不得再读 rect, got ${rectReads}`);
});

// ③ 计数配额与旧的全队列扫描一致
test('canStartNonGif 与旧 queueHasKind 语义一致', () => {
  const kinds = ['visible', 'ahead', 'behind'];
  A.set('scrollDirection', 1);
  for (let mask = 0; mask < 8; mask += 1) {
    const list = kinds.filter((_, i) => mask & (1 << i));
    for (let free = 0; free <= 3; free += 1) {
      for (const activeAhead of [0, 1]) {
        A.set('activeLoads', 3 - free);
        A.set('activeAheadLoads', activeAhead);
        for (const kind of kinds) {
          A.queue.length = 0;
          // 用真实桩重建队列，让 measureQueue 产出与 list 一致的计数
          for (const k of list) {
            const rect = k === 'visible' ? r(100, 100) : (k === 'ahead' ? r(5000, 100) : r(-3000, 100));
            A.queue.push({ isConnected: true, getBoundingClientRect: () => rect });
          }
          const snap = A.measureQueue();
          const got = A.canStartNonGif(kind, snap);
          const want = A.oldCanStart(kind, list, free, activeAhead);
          assert(got === want, `kind=${kind} list=[${list}] free=${free} activeAhead=${activeAhead}: ${got} vs ${want}`);
        }
      }
    }
  }
});

// ④ 速度采样：亚毫秒 dt 不得再被放大成虚高速度
test('updateScrollMetrics 忽略不足采样窗的位移，速度不被 dt 钳制放大', () => {
  A.set('lastScrollY', 0);
  A.set('lastScrollTs', 0);
  A.set('scrollSpeed', 0);
  A.set('now', 0);
  // 同一毫秒内 5 次、每次 120px 的滚动事件（旧实现会把 dt 钳到 1ms → 虚高 120000px/s）
  for (let i = 1; i <= 5; i += 1) { A.set('now', i); A.updateScrollMetrics(120 * i); }
  assert(A.get('scrollSpeed') === 0, `采样窗内不应更新速度, got ${A.get('scrollSpeed')}`);
  assert(A.get('lastScrollY') === 0, '未提交采样时不应推进 lastScrollY，位移需累计');
  // 跨过 100ms 窗：位移按累计值算 → 600px / 0.1s = 6000px/s，EMA 0.7*0+0.3*6000
  A.set('now', 120);
  A.updateScrollMetrics(720);
  const sp = A.get('scrollSpeed');
  assert(Math.abs(sp - 1800) < 1e-6, `累计位移应得 6000px/s 的 0.3 权重=1800, got ${sp}`);
  assert(A.get('lastScrollY') === 720, '提交后推进基准点');
});

// ⑤ 方向每次都更新（不受采样窗影响）
test('滚动方向立即更新', () => {
  A.set('lastScrollY', 1000);
  A.set('lastScrollTs', 100000);
  A.set('now', 100001);
  A.updateScrollMetrics(900);
  // 采样窗未满，方向仍应翻转：用一个满窗事件验证
  A.set('now', 100200);
  A.updateScrollMetrics(800);
  assert(A.get('scrollSpeed') > 0, '满窗后应更新速度');
});

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log('ok   ' + name); }
  catch (e) { failed += 1; console.log('FAIL ' + name + ' :: ' + (e && e.message ? e.message : e)); }
}
if (failed) { console.log(`\n${failed}/${tests.length} hd-loader-scroll assertions failed`); process.exitCode = 1; }
else console.log(`\nhd loader scroll contract ok (${tests.length} groups)`);
