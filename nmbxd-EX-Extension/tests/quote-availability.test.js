const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

const ctx = {
  console,
  Math,
  Date,
  JSON,
  Number,
  Promise,
  setTimeout: (fn, ms) => { if (ctx.__t) clearTimeout(ctx.__t); ctx.__t = setTimeout(fn, ms); return ctx.__t; },
  clearTimeout: (id) => clearTimeout(id),
  fetch: () => Promise.resolve({ ok: true, text: () => Promise.resolve('') })
};
ctx.globalThis = ctx;
vm.createContext(ctx);
ctx.fetch = () => Promise.resolve({ ok: true, text: () => Promise.resolve('') });
vm.runInNewContext(`${refId}\n${queue}\n${styleMark}\n${probe}\n${parse}\nthis.probeQuoteAvailability = probeQuoteAvailability; this.parseQuoteResponseForAvailability = parseQuoteResponseForAvailability; this.createQuoteAvailabilityQueue = createQuoteAvailabilityQueue; this.applyQuoteAvailabilityStyle = applyQuoteAvailabilityStyle; this.getQuoteRefIdFromText = getQuoteRefIdFromText;`, ctx, { filename: 'extract.js' });

const probeQuoteAvailability = ctx.probeQuoteAvailability; const parseQuoteResponseForAvailability = ctx.parseQuoteResponseForAvailability; const createQuoteAvailabilityQueue = ctx.createQuoteAvailabilityQueue; const applyQuoteAvailabilityStyle = ctx.applyQuoteAvailabilityStyle;

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
    const html = '<div class="h-threads-content"><div class="h-threads-item" id="item_69349845"></div></div>';
    const r = parseQuoteResponseForAvailability(html);
    assert(r.kind === 'thread', 'ok html containing the requested id should be a thread');
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
      fetchFn: (tid) => Promise.resolve({ ok: true, html: '<div class="h-threads-content"><div class="h-threads-item" id="item_' + tid + '"></div></div>', httpStatus: 200 }),
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

  function queueFlushKeepsNetworkErrorAsUnknown() {
    const results = [];
    const q = createQuoteAvailabilityQueue({
      fetchFn: () => Promise.reject(new Error('network down')),
      cacheSet: () => {},
      cacheGet: () => null,
      onResult: (tid, kind) => { results.push([tid, kind]); },
      noDelay: true
    });
    q.enqueue('33333333');
    return q.flushNow().then(() => {
      assert(results.length === 1 && results[0][1] === 'unknown', 'network error should remain unknown');
      assert(q.pendingSize() === 0, 'network error must still drain pending queue');
    });
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

];

for (const t of tests) t();
console.log('quote availability core ok');
