const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function extractFunction(name) {
  const start = source.indexOf(`function ${name}`);
  assert(start !== -1, `${name} must exist`);
  const bodyStart = source.indexOf('{', start);
  assert(bodyStart !== -1, `${name} body must exist`);
  let depth = 0;
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = bodyStart; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];
    if (lineComment) { if (ch === '\n') lineComment = false; continue; }
    if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i += 1; } continue; }
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '/' && next === '/') { lineComment = true; i += 1; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i += 1; continue; }
    if (ch === '`' || ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '{') depth += 1;
    else if (ch === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`${name} body not closed`);
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
vm.runInNewContext(`${queue}\n${styleMark}\n${probe}\n${parse}\nthis.probeQuoteAvailability = probeQuoteAvailability; this.parseQuoteResponseForAvailability = parseQuoteResponseForAvailability; this.createQuoteAvailabilityQueue = createQuoteAvailabilityQueue; this.applyQuoteAvailabilityStyle = applyQuoteAvailabilityStyle;`, ctx, { filename: 'extract.js' });

const probeQuoteAvailability = ctx.probeQuoteAvailability; const parseQuoteResponseForAvailability = ctx.parseQuoteResponseForAvailability; const createQuoteAvailabilityQueue = ctx.createQuoteAvailabilityQueue; const applyQuoteAvailabilityStyle = ctx.applyQuoteAvailabilityStyle;

const tests = [
  function emptyTextRendersEmpty() {
    const font = makeStubFont('');
    const out = probeQuoteAvailability(font, { state: { extendQuoteAvailabilityDetection: true, extendQuote: true }, cache: {}, queueSet: () => {} });
    assert(out.kind === 'empty', 'empty text should be classified as empty');
    assert(!out.queued, 'empty text should not queue a network probe');
  },

  function invalidTextRendersEmpty() {
    const font = makeStubFont('no number here');
    const out = probeQuoteAvailability(font, { state: { extendQuoteAvailabilityDetection: true, extendQuote: true }, cache: {}, queueSet: () => {} });
    assert(out.kind === 'empty', 'text with no digits should be empty');
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
    const html = '<div class="h-threads-content">no main item here</div>';
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

  function styleMarksThreadBoldAndEmptyFaded() {
    const font = makeStubFont('No.69349845');
    font.style = {};
    applyQuoteAvailabilityStyle(font, 'thread');
    assert(font.dataset.xdexQuoteAvail === 'thread' && font.style.fontWeight === 'bold', 'thread must be bold-marked');
    applyQuoteAvailabilityStyle(font, 'empty');
    assert(font.dataset.xdexQuoteAvail === 'empty' && font.style.opacity === '0.5', 'empty must be faded');
    applyQuoteAvailabilityStyle(font, 'unknown');
    assert(font.style.fontWeight === '' && font.style.opacity === '', 'unknown must reset styles');
  },

];

for (const t of tests) t();
console.log('quote availability core ok');
