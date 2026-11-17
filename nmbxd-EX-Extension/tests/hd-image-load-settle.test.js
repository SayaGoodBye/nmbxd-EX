// 高清原图加载：结算契约（槽位归还 / 不误标已加载 / 不边下边画）
//
// 背景（真机踩过的坑）：
//   ① 调度器的并发槽位改由 load() 的 onSettled 在**整条链结束**时归还后，
//      若某张图已在加载中（例如用户点击先起步），后来的 load() 会早退且**永不回调**，
//      调用方的槽位就此泄漏；累积到 MAX_CONCURRENT 后懒加载彻底停摆。
//   ② 「src 已是原图地址」曾被直接当成"已加载完成"，但链在发请求前就会改 src，
//      于是第二条链会把在途的图误标为 loaded 并清掉 loading —— 一旦那次请求失败，
//      该图永久停留在缩略图且不再重试。
//   ③ 直接把原图地址写给**活元素**时浏览器会"边下边画"：弱网/图床中途抖断会留下
//      "半条图像 + 大片空白"，重试再从零开始。现在改为**预载到游离 Image()**，
//      活元素全程显示缩略图，只有拿到完整图才切换 —— 因此本测试用假 Image 驱动。
//
// 结论：这三条都只能靠行为验证。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

function extractFn(name) {
  let start = src.indexOf('function ' + name + '(');
  if (start < 0) start = src.indexOf('function ' + name + ' (');
  assert(start !== -1, name + ' 必须存在');
  const parenOpen = src.indexOf('(', start);
  let pd = 0, parenClose = -1;
  for (let i = parenOpen; i < src.length; i++) {
    if (src[i] === '(') pd++;
    else if (src[i] === ')') { pd--; if (pd === 0) { parenClose = i; break; } }
  }
  const braceOpen = src.indexOf('{', parenClose);
  let depth = 0;
  for (let i = braceOpen; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  throw new Error('unbalanced ' + name);
}

function extractLineContaining(needle) {
  const i = src.indexOf(needle);
  assert(i !== -1, '缺少: ' + needle);
  const lineStart = src.lastIndexOf('\n', i) + 1;
  const lineEnd = src.indexOf('\n', i);
  return src.slice(lineStart, lineEnd);
}

const NAMES = ['getHdUrl', 'isGifUrl', 'prepare', 'nowTs', 'withHdRetryBuster', 'flushHdSettleWaiters', 'startHdAttempt', 'load'];
const consts = [
  extractLineContaining('const HD_RETRY_DELAYS'),
  extractLineContaining('const HD_RETRY_COOLDOWN_MS'),
  extractLineContaining('const hdFailedCooldown'),
  extractLineContaining('const hdSettleWaiters'),
].join('\n');

function makeSandbox() {
  const timers = [];
  const sandbox = {
    console: { log: () => {}, warn: () => {} },
    URL, Math, Number, Array, Object, Set, WeakMap,
    location: { href: 'https://www.nmbxd1.com/t/1/page/1', hostname: 'www.nmbxd1.com' },
    setTimeout: (fn, ms) => { timers.push({ fn, ms, id: timers.length + 1 }); return timers.length; },
    clearTimeout: (id) => { const t = timers.find((x) => x.id === id); if (t) t.cleared = true; },
    // 预载用的游离 Image 桩：记录实例，测试用 sandbox.__probes 驱动 onload/onerror
    Image: function FakeImage() { this.src = ''; this.onload = null; this.onerror = null; sandbox.__probes.push(this); },
  };
  sandbox.__probes = [];
  sandbox.globalThis = sandbox;
  sandbox.__timers = timers;
  sandbox.__flushTimers = () => {
    const due = timers.filter((t) => !t.cleared && !t.done);
    due.sort((a, b) => a.ms - b.ms);
    due.forEach((t) => { t.done = true; t.fn(); });
  };
  return sandbox;
}

function makeImg(sandbox, id) {
  const listeners = { load: [], error: [] };
  const thumb = 'https://image.nmb.best/thumb/' + id + '.png';
  return {
    dataset: { xdexThumbSrc: thumb },
    currentSrc: '',
    complete: false,
    naturalWidth: 0,
    isConnected: true,
    _src: thumb,
    get src() { return this._src; },
    set src(v) { this._src = v; },
    getAttribute(n) { return n === 'src' ? this._src : null; },
    addEventListener(type, fn) { if (listeners[type]) listeners[type].push(fn); },
    removeEventListener(type, fn) { if (listeners[type]) listeners[type] = listeners[type].filter((f) => f !== fn); },
    fire(type) { listeners[type].slice().forEach((fn) => fn()); },
    _listenerCount(type) { return listeners[type].length; },
  };
}

const CODE = `${consts}\n${NAMES.map(extractFn).join('\n')}\nthis.api = { load };`;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// ─────────── ① 预载期间活元素不得被改动；两条链都要结算 ───────────
test('预载期间活元素保持缩略图；第二条 load 的 onSettled 必须在结算时被调用', () => {
  const sandbox = makeSandbox();
  vm.createContext(sandbox);
  vm.runInContext(CODE, sandbox);
  const img = makeImg(sandbox, 'x');
  const A = 'https://image.nmb.best/image/x.png';
  const thumb = img.dataset.xdexThumbSrc;
  const settled = [];
  sandbox.api.load(img, A, { onSettled: (ok) => settled.push('A:' + ok) });
  sandbox.api.load(img, A, { onSettled: (ok) => settled.push('B:' + ok) });
  assert(sandbox.__probes.length === 1, `应只创建 1 个预载实例，实际 ${sandbox.__probes.length}（重复启动会浪费请求）`);
  assert(sandbox.__probes[0].src === A, '预载实例应指向原图地址');
  assert(img.src === thumb, '★ 预载期间活元素必须仍是缩略图（否则会出现"边下边画"的半张图）');
  assert(img.dataset.xdexHdLoading === '1', '整条链在途期间 loading 必须为 1');
  assert(img.dataset.xdexHdLoaded === undefined, '预载未完成不得标记已加载');
  sandbox.__probes[0].onload();
  assert(settled.join(',') === 'A:true,B:true', `两条链都应结算为成功，实际 ${settled.join(',')}`);
  assert(img.src === A, '预载成功后才切换活元素到原图');
  assert(img.dataset.xdexHdLoading === undefined, '结算后必须清掉 loading');
});

// ─────────── ② 重试耗尽：活元素始终是缩略图、两条链都收到 false ───────────
test('持续失败：两轮退避重试后两条链都收到 false，且活元素从未显示过半张原图', () => {
  const sandbox = makeSandbox();
  vm.createContext(sandbox);
  vm.runInContext(CODE, sandbox);
  const img = makeImg(sandbox, 'z');
  const thumb = img.dataset.xdexThumbSrc;
  const C = 'https://image.nmb.best/image/z.png';
  const settled = [];
  sandbox.api.load(img, C, { onSettled: (ok) => settled.push('A:' + ok) });
  sandbox.api.load(img, C, { onSettled: (ok) => settled.push('B:' + ok) });
  const srcWrites = [];
  Object.defineProperty(img, 'src', { get() { return this._src; }, set(v) { srcWrites.push(v); this._src = v; } });
  sandbox.__probes[0].onerror();
  assert(settled.length === 0, '退避期间不得提前结算（槽位应继续持有）');
  assert(img.src === thumb, '★ 重试期间活元素必须仍是缩略图');
  sandbox.__flushTimers();
  sandbox.__probes[1].onerror();
  sandbox.__flushTimers();
  sandbox.__probes[2].onerror();
  assert(settled.join(',') === 'A:false,B:false', `重试耗尽后两条链都应结算为失败，实际 ${settled.join(',')}`);
  assert(img.dataset.xdexHdLoaded === undefined, '失败后不得标注已加载（否则永不重试）');
  assert(img.dataset.xdexHdLoading === undefined, '失败后必须清掉 loading');
  assert(img.src === thumb, '失败后活元素仍应是缩略图');
  assert(srcWrites.every((v) => v === thumb), `活元素的 src 只应被写回缩略图，实际 ${JSON.stringify(srcWrites)}`);
  assert(sandbox.__probes.length === 3, `应共 3 次尝试（1 + 2 重试），实际 ${sandbox.__probes.length}`);
});

// ─────────── ③ src 已是原图且真的解码完成 → 直接认定已加载（不再发请求） ───────────
test('src 已是原图且解码完成时直接认定已加载（不重复发请求）', () => {
  const sandbox = makeSandbox();
  vm.createContext(sandbox);
  vm.runInContext(CODE, sandbox);
  const img = makeImg(sandbox, 'w');
  const D = 'https://image.nmb.best/image/w.png';
  img.src = D; img.complete = true; img.naturalWidth = 20;
  sandbox.api.load(img, D, { onSettled: () => {} });
  assert(img.dataset.xdexHdLoaded === '1', '确实已加载完成时应直接标记');
  assert(sandbox.__probes.length === 0, '不应再创建预载实例/发请求');
});

// ─────────── ④ 预载实例的监听必须被摘掉（防悬空回调） ───────────
test('结算后预载实例的回调必须摘除（避免迟到的 onload/onerror 再改状态）', () => {
  const sandbox = makeSandbox();
  vm.createContext(sandbox);
  vm.runInContext(CODE, sandbox);
  const img = makeImg(sandbox, 'v');
  const E = 'https://image.nmb.best/image/v.png';
  const settled = [];
  sandbox.api.load(img, E, { onSettled: (ok) => settled.push('A:' + ok) });
  const probe = sandbox.__probes[0];
  probe.onerror();
  assert(probe.onload === null && probe.onerror === null, '结算时必须把预载实例的回调置空');
  assert(settled.length === 0, '首次失败仍在退避中，不应结算');
});

// ─────────── ⑤ 不得存在"单次尝试超时"（慢下载必须允许下完） ───────────
// 历史缺陷：曾设 30s 看门狗，大图在慢网络下（3MB @ 20KB/s ≈ 150s）传到一半就被判失败，
// 重试又换新 URL 从头下载 → 进度全丢 → 三次都下不完 → 永远退回缩略图。
// <img> 没有进度事件，客户端无法区分"慢但在收数据"与"真的卡住"，因此任何墙钟阈值都是错的。
test('启动一次尝试时不得安排任何超时定时器（否则会误杀慢下载）', () => {
  const sandbox = makeSandbox();
  vm.createContext(sandbox);
  vm.runInContext(CODE, sandbox);
  const img = makeImg(sandbox, 's');
  const F = 'https://image.nmb.best/image/s.png';
  sandbox.api.load(img, F, { onSettled: () => {} });
  const pendingAfterStart = sandbox.__timers.filter((t) => !t.done && !t.cleared);
  assert(pendingAfterStart.length === 0,
    `启动尝试时不得排任何超时（旧实现会排 30s/300s 看门狗），实际 ${JSON.stringify(pendingAfterStart.map((t) => t.ms))}`);
  // 真正的失败（浏览器派发 error）之后，才应出现"退避重试"定时器
  sandbox.__probes[0].onerror();
  const pendingAfterFail = sandbox.__timers.filter((t) => !t.done && !t.cleared);
  assert(pendingAfterFail.length === 1 && pendingAfterFail[0].ms === 800,
    `失败后应只有一次 800ms 退避重试，实际 ${JSON.stringify(pendingAfterFail.map((t) => t.ms))}`);
});
// ─────────── ⑥ 已完成的图再次 load 不得重新下载 ───────────
// 场景：重试成功后活元素的 src 是带 ?xdexHdRetry=N 的地址（缓存键与干净地址不同），
// 若用"src === 干净地址"判断是否已加载，就会把它当成"还没加载"而**完整重下 2MB 大图**。
test('已标记 loaded 的图（含重试成功、src 带参数）再次 load 必须立即返回，不重新下载', () => {
  const sandbox = makeSandbox();
  vm.createContext(sandbox);
  vm.runInContext(CODE, sandbox);
  const img = makeImg(sandbox, 'done');
  const clean = 'https://image.nmb.best/image/done.png';
  // 模拟"重试成功后"的状态：加载完成、但 src 是带参数的地址（缓存键不同）
  img.src = clean + '?xdexHdRetry=1';
  img.complete = true; img.naturalWidth = 30;
  img.dataset.xdexHdLoaded = '1';
  const settled = [];
  sandbox.api.load(img, clean, { onSettled: (ok) => settled.push(ok), force: true });
  assert(sandbox.__probes.length === 0, '已完成的图不得再创建预载实例（否则会重复下载）');
  assert(sandbox.__timers.filter((t) => !t.done).length === 0, '已完成的图不得安排任何定时器');
  assert(settled.length === 0, '已完成的图不该再触发结算回调（调用方无需等）');
  assert(img.src === clean + '?xdexHdRetry=1', '已完成的图其 src 不应被改写');
});
let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (e) { failed++; console.error(`FAIL - ${name}: ${e.message}`); }
}
if (failed) { console.error(`\n${failed}/${tests.length} hd-image-load-settle assertions failed`); process.exitCode = 1; }
else console.log(`\nhd image load settle contract ok (${tests.length} groups)`);
