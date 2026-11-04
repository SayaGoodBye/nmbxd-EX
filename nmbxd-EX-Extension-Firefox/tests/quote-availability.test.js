const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function waitFor(cond, timeoutMs) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const tick = () => cond() ? resolve()
      : (Date.now() - t0 > (timeoutMs || 5000) ? reject(new Error('waitFor timeout')) : setTimeout(tick, 50));
    tick();
  });
}

// 跳过字符串/模板串/行注释/块注释/正则字面量,对 open 处的开括号做配对,返回匹配的闭括号下标
function skipStringLiteral(src, from, q) {
  for (let i = from + 1; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '\\') { i += 1; continue; }
    if (ch === q) return i;
  }
  return src.length;
}

// '/' 是否开启正则字面量:前一个非空白字符为运算符/定界符时视为正则起点,否则是除法
function regexAllowed(src, k) {
  let p = k - 1;
  while (p >= 0 && /\s/.test(src[p])) p -= 1;
  if (p < 0) return true;
  return ['=', '(', ',', ':', '?', '&', '|', '!', '[', '{', ';'].indexOf(src[p]) !== -1 ||
    /return$/.test(src.slice(Math.max(0, p - 6), p + 1));
}

function skipToMatching(src, open, closer) {
  const opener = src[open];
  let depth = 0;
  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];
    if (ch === '/' && next === '/') { i = src.indexOf('\n', i); if (i === -1) return -1; continue; }
    if (ch === '/' && next === '*') { i = src.indexOf('*/', i); if (i === -1) return -1; continue; }
    if (ch === '"' || ch === "'" || ch === '`' || (ch === '/' && regexAllowed(src, i))) { i = skipStringLiteral(src, i, ch); continue; }
    if (ch === opener) depth += 1;
    else if (ch === closer) { depth -= 1; if (depth === 0) return i; }
  }
  return -1;
}

// 先跳过参数列表再取函数体:默认参数对象(如 options = {})的 '{' 不能被当作函数体起点
function extractFunction(name) {
  const start = source.indexOf(`function ${name}`);
  assert(start !== -1, `${name} must exist`);
  const openParen = source.indexOf('(', start);
  assert(openParen !== -1, `${name} params must exist`);
  const closeParen = skipToMatching(source, openParen, ')');
  assert(closeParen !== -1, `${name} params not closed`);
  const bodyStart = source.indexOf('{', closeParen + 1);
  assert(bodyStart !== -1, `${name} body must exist`);
  const bodyEnd = skipToMatching(source, bodyStart, '}');
  assert(bodyEnd !== -1, `${name} body not closed`);
  return source.slice(start, bodyEnd + 1);
}

function extractExpression(name) {
  const sig = `function ${name}(`;
  const start = source.indexOf(sig);
  assert(start !== -1, `${name} must exist`);
  const end = source.indexOf('}', start);
  return source.slice(start, end + 1);
}

const AVAIL_KIND_RE = /xdexQuoteAvail=['"]([^'"]+)['"]/;

function makeStubFont(text) {
  const font = { tagName: 'FONT', dataset: {}, textContent: text || '' };
  font.getAttribute = function (k) { return k === 'color' ? '#789922' : null; };
  font.closest = function (sel) { return null; };
  return font;
}

function runInline(code, context) {
  vm.runInNewContext(code, context, { filename: 'inline.js' });
}

const probe = extractFunction('probeQuoteAvailability');
const parse = extractFunction('parseQuoteResponseForAvailability');
const queue = extractFunction('createQuoteAvailabilityQueue');
const styleMark = extractFunction('applyQuoteAvailabilityStyle');
const refId = extractFunction('getQuoteRefIdFromText');
const deleted = extractFunction('isQuoteRefDeletedSkeleton');

const warns = [];
const ctx = {
  // 源码 warn 的第二参是对象（{ id: tid }），必须序列化后才能断言到编号
  console: { log: console.log, error: console.error, warn: (...a) => warns.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')) },
  Math,
  Date,
  JSON,
  Number,
  Promise,
  // 必须透传真实定时器：单槽桩会让每个新 setTimeout 掐掉上一个，flushNow 的轮询链与 retryLater 互相覆盖导致永不 resolve
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
  fetch: () => Promise.resolve({ ok: true, text: () => Promise.resolve('') })
};
ctx.globalThis = ctx;
vm.createContext(ctx);
ctx.fetch = () => Promise.resolve({ ok: true, text: () => Promise.resolve('') });
vm.runInNewContext(`${refId}\n${deleted}\n${queue}\n${styleMark}\n${probe}\n${parse}\nthis.probeQuoteAvailability = probeQuoteAvailability; this.parseQuoteResponseForAvailability = parseQuoteResponseForAvailability; this.createQuoteAvailabilityQueue = createQuoteAvailabilityQueue; this.applyQuoteAvailabilityStyle = applyQuoteAvailabilityStyle; this.getQuoteRefIdFromText = getQuoteRefIdFromText; this.isQuoteRefDeletedSkeleton = isQuoteRefDeletedSkeleton;`, ctx, { filename: 'extract.js' });

const probeQuoteAvailability = ctx.probeQuoteAvailability; const parseQuoteResponseForAvailability = ctx.parseQuoteResponseForAvailability; const createQuoteAvailabilityQueue = ctx.createQuoteAvailabilityQueue; const applyQuoteAvailabilityStyle = ctx.applyQuoteAvailabilityStyle; const isQuoteRefDeletedSkeleton = ctx.isQuoteRefDeletedSkeleton;

const tests = [
  function emptyTextIsSkipped() {
    const font = makeStubFont('');
    const out = probeQuoteAvailability(font, { state: { extendQuoteAvailabilityDetection: true, extendQuote: true }, cache: {}, queueSet: () => {} });
    assert(out.kind === 'skip', 'text without a quote id must be skipped, not judged');
    assert(!out.queued, 'empty text should not queue a network probe');
  },

  function invalidTextIsSkipped() {
    const font = makeStubFont('no number here');
    const out = probeQuoteAvailability(font, { state: { extendQuoteAvailabilityDetection: true, extendQuote: true }, cache: {}, queueSet: () => {} });
    assert(out.kind === 'skip', 'text with no digits must be skipped as non-quote');
    assert(!out.queued, 'invalid text should not queue a probe');
  },

  function validQuoteQueuesProbe() {
    const font = makeStubFont('No.69349845');
    let queued = null;
    const out = probeQuoteAvailability(font, { state: { extendQuoteAvailabilityDetection: true, extendQuote: true }, cache: {}, queueSet: (id) => { queued = id; } });
    assert(out.kind === 'unknown', 'first encounter should be unknown until probed');
    assert(out.queued, 'valid quote should enqueue a probe');
    assert(queued === '69349845', 'queue should receive the bare thread id');
  },

  function disabledByExtendQuoteOff() {
    const font = makeStubFont('No.69349845');
    const out = probeQuoteAvailability(font, { state: { extendQuoteAvailabilityDetection: true, extendQuote: false }, cache: {}, queueSet: () => {} });
    assert(out.kind === 'unknown', 'disabled by extendQuote off should leave unknown');
    assert(!out.queued, 'extendQuote off should short-circuit no probe');
  },

  function disabledByAvailabilityOff() {
    const font = makeStubFont('No.69349845');
    const out = probeQuoteAvailability(font, { state: { extendQuoteAvailabilityDetection: false, extendQuote: true }, cache: {}, queueSet: () => {} });
    assert(out.kind === 'unknown', 'availability off should leave unknown');
    assert(!out.queued, 'availability off should short-circuit no probe');
  },

  function parseOkThread() {
    // 类名判据已停用：主串只能由与 tid 绑定的标记判定
    const html = '<div class="h-threads-content"><div class="h-threads-item" data-threads-id="69349845"></div></div>';
    assert(parseQuoteResponseForAvailability(html, '69349845').kind === 'thread', 'tid 绑定的 data-threads-id 应判 thread');
    assert(parseQuoteResponseForAvailability(html).kind === 'reply', '不传 tid 时类名不再判 thread，退回 reply');
  },

  function parseEmptyRendersEmpty() {
    assert(parseQuoteResponseForAvailability('').kind === 'empty', 'empty body must be empty');
    assert(parseQuoteResponseForAvailability('<!DOCTYPE html><html><head>').kind === 'empty', 'doctype html wrapper must be empty');
  },

  function parseHtmlWithoutItemRendersReply() {
    // 夹具不得含 h-threads-* 类名:源码宽分支会把任意 h-threads-* 容器判为 thread 页
    const html = '<div class="page-body">no main item here</div>';
    const r = parseQuoteResponseForAvailability(html, '50000001');
    assert(r.kind === 'reply', '200 ok but no main item should be reply');
  },

  function parseWithoutContentRendersEmpty() {
    assert(parseQuoteResponseForAvailability(null).kind === 'empty', 'null html must be empty');
  },

  function shortCircuitEmptyCacheKindPreservesKind() {
    const font = makeStubFont('No.69349845');
    const cache = { '69349845': { kind: 'reply', t: 1 } };
    const out = probeQuoteAvailability(font, { state: { extendQuoteAvailabilityDetection: true, extendQuote: true }, cache, queueSet: () => {} });
    assert(out.kind === 'reply', 'cached reply should be preserved');
    assert(!out.queued, 'cached reply should not re-probe');
  },

  function queueDeduplicatesPending() {
    let requests = 0;
    const q = createQuoteAvailabilityQueue({
      fetchFn: (tid) => { requests++; return Promise.resolve({ ok: true, html: '<div class="h-threads-content"><div class="h-threads-item" id="item_' + tid + '"></div></div>', httpStatus: 200 }); },
      cacheSet: () => {},
      cacheGet: () => null,
      onResult: () => {},
      noDelay: true
    });
    q.enqueue('11111111');
    q.enqueue('11111111');
    q.enqueue('22222222');
    const pending = q.pendingSize();
    assert(pending === 2, 'duplicate tid should coalesce: got ' + pending);
    // noDelay=true: enqueue 立即触发 pump,此时 fetch 异步仍未 resolve → in-flight 已记录
    assert(requests >= 1, 'noDelay enqueue should kick off fetch immediately: got ' + requests);
    return q.flushNow().then(() => { assert(q.pendingSize() === 0, 'flush must drain'); });
  },

  function queueFlushResolvesThreadAndCaches() {
    let cached = null;
    const results = [];
    const q = createQuoteAvailabilityQueue({
      // 生产路径 fetchQuoteAvailability 回传的是 JSON.stringify(thread)，这里对齐真实形态
      fetchFn: (tid) => Promise.resolve({ ok: true, html: '{"id":"' + tid + '","content":"x"}', httpStatus: 200 }),
      cacheSet: (tid, entry) => { cached = { tid, entry }; },
      cacheGet: () => null,
      onResult: (tid, kind) => { results.push([tid, kind]); },
      noDelay: true
    });
    q.enqueue('11111111');
    return q.flushNow().then(() => {
      assert(cached && cached.tid === '11111111' && cached.entry.kind === 'thread', 'thread result must be cached');
      assert(results.length === 1 && results[0][1] === 'thread', 'onResult must be invoked with thread kind');
      assert(q.pendingSize() === 0, 'flush must drain pending queue');
    });
  },

  async function queueNetworkErrorRetriesThenGivesUp() {
    const results = [];
    const before = warns.length;
    const q = createQuoteAvailabilityQueue({
      fetchFn: () => Promise.reject(new Error('network down')),
      cacheSet: () => {},
      cacheGet: () => null,
      onResult: (tid, kind) => { results.push([tid, kind]); },
      noDelay: true
    });
    q.enqueue('33333333');
    await q.flushNow();
    assert(results.length === 1 && results[0][1] === 'unknown', '首次网络失败应报 unknown 且不入缓存');
    assert(q.pendingSize() === 0, '单次失败后队列应排空(重试另起定时器)');
    // 重试预算：MAX_ATTEMPTS=3 → 共 3 次 unknown，之后放弃并告警一次
    await waitFor(() => warns.slice(before).some((w) => w.includes('33333333')), 8000);
    assert(results.length === 3, '重试应耗尽到 MAX_ATTEMPTS=3, got ' + results.length);
    assert(results.every((r) => r[1] === 'unknown'), '每次尝试都应报 unknown');
    assert(warns.slice(before).filter((w) => w.includes('33333333')).length === 1, '放弃重试只应告警一次');
  },

  function styleMarksQuoteAvailabilityKinds() {
    const font = makeStubFont('No.69349845');
    font.style = {};
    // 主串 + 本串串首 → 实线
    font.dataset.xdexCurThreadRef = '1';
    applyQuoteAvailabilityStyle(font, 'thread');
    assert(font.dataset.xdexQuoteAvail === 'thread' && font.style.textDecoration === 'underline' && font.style.textDecorationThickness === '2px', 'current-thread main quote must be solid-underlined');
    // 主串 + 非本串串首 → 虚线
    delete font.dataset.xdexCurThreadRef;
    applyQuoteAvailabilityStyle(font, 'thread');
    assert(font.style.textDecoration === 'underline dashed', 'other main quote must be dashed-underlined');
    // 统一不加粗
    assert(font.style.fontWeight === '', 'thread must not be bold anymore');
    applyQuoteAvailabilityStyle(font, 'empty');
    assert(font.dataset.xdexQuoteAvail === 'empty' && font.style.opacity === '0.5' && font.style.textDecoration === '', 'empty must be faded without underline');
    applyQuoteAvailabilityStyle(font, 'unknown');
    assert(font.style.fontWeight === '' && font.style.opacity === '' && font.style.textDecoration === '', 'unknown must reset styles');
  },

  // ── 类名判据停用后：只有与 tid 绑定的标记能判主串，容器类名一律退回 reply ──
  function parseThreadNeedsTidBinding() {
    const kind = (html, tid) => parseQuoteResponseForAvailability(html, tid).kind;
    // 与 tid 绑定的标记 → thread
    assert(kind('<div data-threads-id="69349845"></div>', '69349845') === 'thread', 'tid 绑定的 data-threads-id 判 thread');
    assert(kind('<div id="69349845"></div>', '69349845') === 'thread', 'tid 绑定的 id 判 thread');
    // 仅类名、无 tid 绑定 → 不再判 thread
    assert(kind('<div class="h-threads-item">x</div>', '69349845') === 'reply', '裸 h-threads-item 类名不得判 thread');
    assert(kind('<div class="h-threads-item-index">x</div>', '69349845') === 'reply', 'h-threads-item-index 类名不得判 thread');
    assert(kind('<div class="h-threads-content">x</div>', '69349845') === 'reply', 'h-threads-content 不得判 thread');
  },

  // ── 已删串：服务端照常渲染 h-threads-item 容器，只是字段全空，必须先判 empty 否则被误判 thread ──
  function parseDeletedSkeletonAsEmpty() {
    const deleted = '<div class="h-threads-item"><div data-threads-id="" class="h-threads-item-reply h-threads-item-ref"><div class="h-threads-item-reply-main"><div class="h-threads-info"><a href="/t/?r=&amp;scrollInto=true" class="h-threads-info-id">No.</a></div><div class="h-threads-content"> </div></div></div></div>';
    assert(isQuoteRefDeletedSkeleton(deleted) === true, '空字段骨架应识别为已删');
    // 即便带 tid 且 tid 不出现在文中，类名分支已停用，这里靠已删判据先返回 empty
    assert(parseQuoteResponseForAvailability(deleted, '6187238').kind === 'empty', '已删骨架判 empty');
    // 活帖骨架：No.<数字> + data-threads-id 非空 → 不算已删
    const live = '<div class="h-threads-item"><div data-threads-id="6187238" class="h-threads-item-reply"><a href="/t/6187238" class="h-threads-info-id">No.6187238</a><div class="h-threads-content">正文</div></div></div>';
    assert(isQuoteRefDeletedSkeleton(live) === false, '活帖不得判为已删');
    // 只有 No. 空、但 data-threads-id 有值 → 不满足双判据，不误判为已删
    assert(isQuoteRefDeletedSkeleton('<div data-threads-id="11111111"><a class="h-threads-info-id">No.</a></div>') === false, '单判据不足以定已删');
    // 只有 data-threads-id 空、但 No. 带数字 → 同样不误判
    assert(isQuoteRefDeletedSkeleton('<div data-threads-id=""><a class="h-threads-info-id">No.6187238</a></div>') === false, '单判据不足以定已删');
  },

  // ── 队列 API：priority 提到队首，drop 撤销未发出的探测 ──
  async function queuePriorityMovesToHead() {
    const order = [];
    const q = createQuoteAvailabilityQueue({
      fetchFn: (tid) => { order.push(tid); return new Promise((res) => setTimeout(() => res({ ok: true, html: '{"id":"' + tid + '"}', httpStatus: 200 }), 0)); },
      cacheGet: () => null, cacheSet: () => {}, onResult: () => {}, noDelay: true, concurrency: 1
    });
    q.enqueue('50000001');
    q.enqueue('50000002');
    q.enqueue('50000003');
    q.enqueue('50000004', { priority: true }); // 用户正在查看
    await q.flushNow();
    assert(order[0] === '50000001', '已在途/已取走的第一个不变，后续按优先级重排: ' + order.join(','));
    assert(order[1] === '50000004', 'priority 编号应紧随其后: ' + order.join(','));
    assert(order.join(',') === '50000001,50000004,50000002,50000003', '实际顺序: ' + order.join(','));
  },

  async function queueDropCancelsPendingProbe() {
    let calls = 0;
    const q = createQuoteAvailabilityQueue({
      fetchFn: (tid) => { calls += 1; return Promise.resolve({ ok: true, html: '{"id":"' + tid + '"}', httpStatus: 200 }); },
      cacheGet: () => null, cacheSet: () => {}, onResult: () => {}, noDelay: true, concurrency: 1
    });
    q.enqueue('60000001');
    q.enqueue('60000002');
    assert(q.drop('60000002') === true, '未发出的排队项应可撤销');
    await q.flushNow();
    assert(calls === 1, '被 drop 的编号不应再请求, got ' + calls);
    assert(q.drop('60000001') === false, '已完成的编号 drop 应返回 false');
  },

  // ── 常驻 worker 池不变量(取代原“凑一批→等最慢的一个→整批空等”的批次泵) ──
  async function queueNeverExceedsConcurrency() {
    let inFlight = 0, peak = 0, started = 0;
    const release = [];
    const q = createQuoteAvailabilityQueue({
      fetchFn: () => {
        started += 1; inFlight += 1; peak = Math.max(peak, inFlight);
        return new Promise((res) => release.push(() => { inFlight -= 1; res({ ok: true, html: '{"id":"11111111"}', httpStatus: 200 }); }));
      },
      cacheGet: () => null, cacheSet: () => {}, onResult: () => {}, noDelay: true, concurrency: 2
    });
    for (let i = 0; i < 8; i += 1) q.enqueue('1111111' + i);
    assert(peak <= 2, '峰值在途请求数不得超过 concurrency, got ' + peak);
    assert(started === 2, '首批应只发出 concurrency 个, got ' + started);
    while (release.length) {
      release.shift()();
      await new Promise((r) => setTimeout(r, 0));
    }
    assert(peak <= 2, '补位过程中峰值仍受控, got ' + peak);
    assert(started === 8, '全部编号最终都应被请求, got ' + started);
    assert(q.pendingSize() === 0, '队列应排空');
  },

  async function queueRefillsSlotWithoutWaitingForSlowRequest() {
    const settle = new Map();
    const started = [];
    const q = createQuoteAvailabilityQueue({
      fetchFn: (tid) => {
        started.push(tid);
        return new Promise((res) => settle.set(tid, () => res({ ok: true, html: '{"id":"' + tid + '"}', httpStatus: 200 })));
      },
      cacheGet: () => null, cacheSet: () => {}, onResult: () => {}, noDelay: true, concurrency: 2
    });
    q.enqueue('20000001'); // 慢请求：占住一个槽位不放
    q.enqueue('20000002'); // 快请求
    q.enqueue('20000003');
    assert(started.length === 2, '应只有 2 个在途, got ' + started.join(','));
    settle.get('20000002')(); // 快的那个先完成
    await new Promise((r) => setTimeout(r, 0));
    assert(started.indexOf('20000003') !== -1,
      '空闲槽位必须立刻补位，不能等慢请求（批次模型会整批空等）: ' + started.join(','));
    settle.get('20000001')(); settle.get('20000003')();
    await new Promise((r) => setTimeout(r, 0));
    assert(q.pendingSize() === 0, '队列应排空');
  },

  // ── GAP_MS 语义：缺省不引入任何节奏；显式传入必须真正生效 ──
  async function queueDefaultHasNoPacingStall() {
    const q = createQuoteAvailabilityQueue({
      fetchFn: async () => ({ ok: true, html: '{"id":"41111111"}', httpStatus: 200 }),
      cacheGet: () => null, cacheSet: () => {}, onResult: () => {}, noDelay: true, concurrency: 1
    });
    ['41111111', '42222222', '43333333', '44444444'].forEach((id) => q.enqueue(id));
    const t0 = Date.now();
    await q.flushNow();
    const elapsed = Date.now() - t0;
    assert(elapsed < 200, '不传 gapMs 时不得引入间隔(锁定“默认不节流”这一决定), elapsed=' + elapsed);
  },

  async function queueHonorsExplicitGapMs() {
    let calls = 0;
    const q = createQuoteAvailabilityQueue({
      fetchFn: async () => { calls += 1; return { ok: true, html: '{"id":"31111111"}', httpStatus: 200 }; },
      cacheGet: () => null, cacheSet: () => {}, onResult: () => {}, noDelay: true, concurrency: 1, gapMs: 40
    });
    ['31111111', '32222222', '33333333'].forEach((id) => q.enqueue(id));
    const t0 = Date.now();
    await q.flushNow();
    const elapsed = Date.now() - t0;
    assert(calls === 3, '三个编号都应被请求, got ' + calls);
    assert(elapsed >= 70, '显式 gapMs 必须真正节流(原 !=null 判定下 Number(undefined) 为 NaN 会让默认分支成死代码), elapsed=' + elapsed);
  },
];

// 异步用例必须串行 await，否则其中的断言失败只会变成未处理拒绝而被漏过
(async () => {
  for (const t of tests) await t();
  console.log('quote availability core ok');
})().catch((e) => {
  console.error('FAIL: ' + (e && e.message ? e.message : e));
  process.exitCode = 1;
});
