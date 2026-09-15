// 热路径护栏测试
// 对应审计项 M2 / M3 / M4：条件写入、写入失败留痕、完成回调合并
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

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
// 提取 `const NAME = (…) => { … }` 形式的箭头函数
function extractConstArrow(name) {
  const re = new RegExp(`const\\s+${name}\\s*=\\s*\\(`);
  const m = re.exec(source);
  assert(m, `${name} must exist`);
  const braceOpen = source.indexOf('{', source.indexOf('=>', m.index));
  const end = scanBalanced(source, braceOpen);
  return source.slice(m.index, end + 1);
}

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// ─────────────── M4：完成回调合并 ───────────────
test('M4: 多次完成回调只触发一轮 processQueue，且不会丢处理', () => {
  const timers = [];
  const code = `
    let queueScheduleId = 0;
    ${extractFunction('scheduleProcessQueue')}
    function processQueue() { this.__calls = (this.__calls || 0) + 1; }
    this.run = () => scheduleProcessQueue();
  `;
  const sandbox = { setTimeout: (fn) => { timers.push({ fn }); return timers.length; } };
  vm.createContext(sandbox);
  vm.runInNewContext(code, sandbox, { filename: 'm4.js' });
  // settle 必须在宿主作用域：timers 是 Node 侧变量，vm 脚本内不可见
  const api = { run: () => sandbox.run(), settle: () => { timers.splice(0).forEach(t => t.fn()); } };
  for (let i = 0; i < 6; i += 1) api.run();
  assert(sandbox.__calls === undefined || sandbox.__calls === 0, '未 settle 前不应执行');
  api.settle();
  assert(sandbox.__calls === 1, `6 次调度应合并为 1 轮, got ${sandbox.__calls}`);
  // 合并后仍可再次调度（不是一次性）
  api.run();
  api.settle();
  assert(sandbox.__calls === 2, `合并后应能再次调度, got ${sandbox.__calls}`);
});

// ─────────────── M3：写入失败留痕且只报一次 ───────────────
test('M3: 设置写入失败会告警，且只告警一次', () => {
  const warns = [];
  const win = {};
  const code = `${extractConstArrow('warnSettingSaveFailed')}\nthis.warn = warnSettingSaveFailed;`;
  const sandbox = { window: win, console: { warn: (...a) => warns.push(a.map(String).join(' ')) } };
  vm.createContext(sandbox);
  vm.runInNewContext(code, sandbox, { filename: 'm3.js' });
  sandbox.warn('图片隐藏模式', new Error('quota'));
  sandbox.warn('颜文字排序', new Error('quota'));
  sandbox.warn('阅图分隔线', new Error('quota'));
  assert(warns.length === 1, `应只告警一次, got ${warns.length}`);
  assert(warns[0].includes('图片隐藏模式'), `首次告警应带场景名, got ${warns[0]}`);
  assert(win.__xdexSettingSaveWarned === true, '标志应挂在 window 上以跨面板重开保持');
});

test('M3: 全部即时保存站点都已接入告警', () => {
  const bare = (source.match(/try \{ GM_setValue\(this\.key, this\.state\); \} catch \(e\) \{\}/g) || []).length;
  const warned = (source.match(/try \{ GM_setValue\(this\.key, this\.state\); \} catch \(e\) \{ warnSettingSaveFailed\(/g) || []).length;
  assert(bare === 0, `不应残留静默吞错的即时保存点, got ${bare}`);
  assert(warned >= 6, `即时保存点应全部接入告警, got ${warned}`);
});

// ─────────────── M2：面板定位条件写入 ───────────────
test('M2: 几何未变时 positionPanel 不重复写入 style', () => {
  const writes = [];
  const panel = {
    style: new Proxy({ width: '', left: '', top: '', display: 'grid', visibility: '' }, {
      // 必须记录每一次赋值调用：真实浏览器里对 CSSOM 赋相同值同样会脏化布局，
      // 若只记录「值变化」则旧实现与守卫实现无法区分（反向对照已验证此点）
      set(t, k, v) { writes.push(`${String(k)}=${v}`); t[k] = v; return true; },
    }),
    getBoundingClientRect: () => ({ width: 600, height: 300, left: 100, top: 200 }),
  };
  const trigger = { getBoundingClientRect: () => ({ top: 500, bottom: 540, left: 120 }) };
  const code = `
    const ITEM_W = 240;
    const panel = __panel, trigger = __trigger;
    function getQuoteElement() { return null; }
    function getPanelAnchorRect() { return { left: 100 }; }
    function getPanelTargetWidth() { return 820; }
    ${extractFunction('positionPanel')}
    this.positionPanel = positionPanel;
    this.writeCount = () => __writes.length;
  `;
  const sandbox = {
    __panel: panel, __trigger: trigger, __writes: writes,
    window: { innerWidth: 1280, innerHeight: 800 },
    Math, String, Number,
  };
  vm.createContext(sandbox);
  vm.runInNewContext(code, sandbox, { filename: 'm2.js' });
  sandbox.positionPanel();
  const first = writes.length;
  assert(first >= 3, `首次定位必须写入 width/left/top, got ${first}: ${writes.join(',')}`);
  sandbox.positionPanel();
  sandbox.positionPanel();
  assert(writes.length === first, `几何未变时不应再写入, before=${first} after=${writes.length} :: ${writes.slice(first).join(',')}`);
  // 窗口变窄 → 宽度变化应被写入
  sandbox.window.innerWidth = 600;
  sandbox.positionPanel();
  assert(writes.length > first, '窗口尺寸变化后应重新写入宽度');
});

// ─────────────── 饼干偏好开关：串上下文清理不变量 ───────────────
test('清开关函数会移除区域内全部节点并容忍区域缺失', () => {
  const code = `${extractFunction('clearCookieCheckSwitch')}\nthis.clear = clearCookieCheckSwitch;`;
  // 有区域
  const area = { innerHTML: '<input><span>gear</span>' };
  const sb1 = { document: { querySelector: s => (s === '.xdex-cookie-check-area' ? area : null) } };
  vm.createContext(sb1);
  vm.runInNewContext(code, sb1, { filename: 'clear.js' });
  sb1.clear();
  assert(area.innerHTML === '', `区域内容应被清空, got ${JSON.stringify(area.innerHTML)}`);
  // 无区域（串内页尚未创建时不得抛错）
  const sb2 = { document: { querySelector: () => null } };
  vm.createContext(sb2);
  vm.runInNewContext(code, sb2, { filename: 'clear2.js' });
  let threw = false;
  try { sb2.clear(); } catch (e) { threw = true; }
  assert(!threw, '区域不存在时不应抛错');
});

test('不变量：每个重置串上下文处都必须同时清饼干偏好开关', () => {
  const lines = source.split('\n');
  // resto 被重置为占位值 = 串上下文已清除
  const resetSites = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (/val\(['"]20011114['"]\)/.test(lines[i])) resetSites.push(i + 1);
  }
  assert(resetSites.length >= 3, `应覆盖全部重置点, got ${resetSites.length} @ ${resetSites.join(',')}`);
  const WINDOW = 20;
  // 重置点后 20 行内必须出现清开关调用
  const missing = resetSites.filter(ln => {
    const upto = Math.min(lines.length, ln - 1 + WINDOW);
    for (let k = ln - 1; k < upto; k += 1) {
      if (/clearCookieCheckSwitch\(\)/.test(lines[k])) return false;
    }
    return true;
  });
  assert(missing.length === 0,
    `以下重置串上下文处漏清开关，会残留上一串的默认饼干状态：L${missing.join(', L')}`);
});

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log('ok   ' + name); }
  catch (e) { failed += 1; console.log('FAIL ' + name + ' :: ' + (e && e.message ? e.message : e)); }
}
if (failed) { console.log(`\n${failed}/${tests.length} hot path guard assertions failed`); process.exitCode = 1; }
else console.log(`\nhot path guards contract ok (${tests.length} groups)`);
