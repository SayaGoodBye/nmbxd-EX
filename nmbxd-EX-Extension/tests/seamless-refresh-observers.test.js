// 无缝翻页刷新按钮：观察器单例契约测试
// 对应审计项 H1/H2/H3 —— body 级、分页栏级、浮窗属性级观察器都不得随调用次数累积
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

// ── 括号/字符串/注释感知的函数提取器（与仓库其它测试同款） ──
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
  const closeParen = scanBalanced(source, source.indexOf('(', start));
  const bodyStart = source.indexOf('{', closeParen + 1);
  const bodyEnd = scanBalanced(source, bodyStart);
  return source.slice(start, bodyEnd + 1);
}
function extractDeclBlock(marker) {
  const i = source.indexOf(marker);
  assert(i !== -1, `${marker} must exist`);
  const lineStart = source.lastIndexOf('\n', i) + 1;
  const end = source.indexOf(';', source.indexOf('seamlessPagObserverTarget = null', lineStart));
  return source.slice(lineStart, end + 1);
}

const code = [
  extractFunction('observeSeamlessRefreshOverlays'),
  extractDeclBlock('let seamlessGlobalObserver = null;'),
  extractFunction('addRefreshButtonIfNeeded'),
  'this.api = { addRefreshButtonIfNeeded };',
].join('\n');

// ── 桩 ──
function mkNode(tag) { return { __tag: tag, style: {}, dataset: {} }; }

let observers, bodyNode, pagNode, overlayA, overlayB, btnNode, displayCalls, pagLookups, currentApi;

function setup() {
  observers = [];
  displayCalls = 0;
  pagLookups = 0;
  bodyNode = mkNode('body');
  pagNode = mkNode('pag-1');
  overlayA = mkNode('overlay');
  overlayB = mkNode('overlay-quote');
  btnNode = mkNode('btn');

  // 每次都用全新沙箱：同一 context 内重复 runInNewContext 会让顶层 let 声明报 already declared
  const sandbox = {};
  class FakeMO {
    constructor(cb) { this.cb = cb; this.targets = []; this.disconnects = 0; observers.push(this); }
    observe(el) { this.targets.push(el); }
    disconnect() { this.disconnects += 1; }
  }
  sandbox.MutationObserver = FakeMO;
  sandbox.document = {
    body: bodyNode,
    querySelector(sel) {
      if (sel === '.qp-overlay') return overlayA;
      if (sel === '.qp-overlay-quote') return overlayB;
      return null;
    },
  };
  sandbox.ensureSeamlessRefreshButtonNode = () => btnNode;
  sandbox.getSeamlessBottomPagination = () => { pagLookups += 1; return pagNode; };
  sandbox.updateSeamlessRefreshBtnDisplay = () => { displayCalls += 1; };

  vm.createContext(sandbox);
  vm.runInNewContext(code, sandbox, { filename: 'seamless.js' });
  currentApi = sandbox.api;
}

const api = () => currentApi;
const observersOn = node => observers.filter(o => o.targets.indexOf(node) !== -1);
const fireBody = () => { observersOn(bodyNode).forEach(o => o.cb()); };

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('H1: 重复调用只挂一个 body 观察器', () => {
  setup();
  for (let i = 0; i < 5; i += 1) api().addRefreshButtonIfNeeded();
  assert(observersOn(bodyNode).length === 1, `body 观察器应为 1, got ${observersOn(bodyNode).length}`);
});

test('H2: 重复调用只挂一个分页栏观察器', () => {
  setup();
  for (let i = 0; i < 5; i += 1) api().addRefreshButtonIfNeeded();
  assert(observersOn(pagNode).length === 1, `分页栏观察器应为 1, got ${observersOn(pagNode).length}`);
});

test('H3: 同一浮窗元素只挂一个属性观察器', () => {
  setup();
  for (let i = 0; i < 5; i += 1) api().addRefreshButtonIfNeeded();
  assert(observersOn(overlayA).length === 1, `overlay 观察器应为 1, got ${observersOn(overlayA).length}`);
  assert(observersOn(overlayB).length === 1, `overlay-quote 观察器应为 1, got ${observersOn(overlayB).length}`);
});

test('H1-H3: 重复调用不产生任何额外观察器实例', () => {
  setup();
  api().addRefreshButtonIfNeeded();
  const first = observers.length;
  for (let i = 0; i < 9; i += 1) api().addRefreshButtonIfNeeded();
  assert(first === 4, `首次应为 1 body + 1 分页栏 + 2 浮窗 = 4, got ${first}`);
  assert(observers.length === first, `重复调用不应新增, got ${observers.length}`);
});

test('H2: 分页栏未变时观察器回调不重建观察器', () => {
  setup();
  api().addRefreshButtonIfNeeded();
  const before = observers.length;
  for (let i = 0; i < 10; i += 1) fireBody();
  assert(observers.length === before, `不应新增观察器, before=${before} after=${observers.length}`);
  assert(observers.every(o => o.disconnects === 0), '同一分页栏不应发生 disconnect');
  assert(displayCalls === 11, `显示状态仍应每次刷新(1 初始 + 10 回调), got ${displayCalls}`);
});

test('H2: 分页栏更换时旧观察器被 disconnect 且总数只加一', () => {
  setup();
  api().addRefreshButtonIfNeeded();
  const totalBefore = observers.length;
  const oldPag = pagNode;
  pagNode = mkNode('pag-2');
  fireBody();
  assert(observersOn(pagNode).length === 1, '新分页栏应恰好挂 1 个观察器');
  assert(observers.length === totalBefore + 1, `应只新增 1 个观察器, got +${observers.length - totalBefore}`);
  const stale = observers.filter(o => o.targets.some(t => t.__tag === 'pag-1'));
  assert(stale.length === 1 && stale[0].disconnects === 1, '旧分页栏观察器必须被 disconnect');
  assert(observersOn(oldPag)[0].disconnects === 1, '同一实例应已被断开');
});

test('H3: 晚出现的浮窗仍会被挂上且只挂一次', () => {
  setup();
  overlayB = null;
  api().addRefreshButtonIfNeeded();
  assert(observersOn(overlayA).length === 1, '已存在的 overlay 应被观察');
  overlayB = mkNode('overlay-quote');
  api().addRefreshButtonIfNeeded();
  assert(observersOn(overlayB).length === 1, `新建浮窗应被补挂且只挂一次, got ${observersOn(overlayB).length}`);
  api().addRefreshButtonIfNeeded();
  assert(observersOn(overlayB).length === 1, '再次调用不应叠加');
});

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log('ok   ' + name); }
  catch (e) { failed += 1; console.log('FAIL ' + name + ' :: ' + (e && e.message ? e.message : e)); }
}
if (failed) { console.log(`\n${failed}/${tests.length} seamless refresh observer assertions failed`); process.exitCode = 1; }
else console.log(`\nseamless refresh observers contract ok (${tests.length} groups)`);
