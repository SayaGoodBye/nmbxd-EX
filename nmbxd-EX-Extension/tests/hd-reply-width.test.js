// 带图回复容器加宽（固定预算）契约测试
// 设计（2026-09-24，按需求方确认）：不做实时测量；加宽量 = 固定预算 getExpandedWidthBudget()，
// 按「本步骤之后仍会改变 main 容器宽度的操作」的最坏叠加取值——
// 相对时间形态演化 ≈101px（最短「今天(四)N秒前」→ 最坏「N年前 YYYY-MM-DD(四)HH:MM:SS」，≈7.75em @13px）
// + 饼干大小写 ≈16px（全大写 ID 在非等宽字体下更宽）+ 饼干标记内边距 6px；
// 编号/Po 标记（3em 定宽图标格）、去除无标题/无名氏（只收窄且已在本步骤前生效）、
// 原图比缩略图宽（非激活态被站点 CSS 钳在 250px）均不产生增量。
// 一次写入后不再重算，避免渲染后的反复横向变化。
// 本测试钉住四件事：①加宽量=预算且不累加 ②预算为 0 无隐藏常数 ③上限钳制 ④未布局不写入不置锁、无图/预览框不写入
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// 提取 handleImageLayout 对象里的方法（源码缩进 6 空格）
function extractMethod(name) {
  const re = new RegExp(`^      ${name}\\(([^)]*)\\) \\{$`, 'm');
  const m = re.exec(src);
  assert(m, `method ${name} must exist`);
  const start = m.index;
  const braceOpen = src.indexOf('{', start);
  let depth = 0;
  for (let i = braceOpen; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  throw new Error('unbalanced ' + name);
}

// 构造一个可交互的假容器：offsetWidth 反映 max(style.width, 自然宽)（模拟 table-cell 最小宽度语义）
function makeMsgMain(naturalWidth) {
  const style = { width: '' };
  const msgMain = {
    style,
    __natural: naturalWidth,
    get offsetWidth() {
      const w = parseFloat(this.style.width) || 0;
      return Math.max(w, this.__natural);   // table-cell: style.width 为最小宽度
    },
    querySelector: (sel) => (sel === '.h-threads-img-box' ? { classList: { contains: () => false } } : null),
    closest: () => null,
  };
  return msgMain;
}

function buildApi(cap, budget) {
  const code = [extractMethod('expandMsgWidthIfImageExists'), extractMethod('getExpandedWidthBudget')].join(',\n');
  const sandbox = { console: { log: () => {} } };
  vm.createContext(sandbox);
  vm.runInContext('this.api = {' + code + '};', sandbox);
  const api = sandbox.api;
  api.getMaxMsgWidth = () => (cap === undefined ? 1200 : cap);
  api.getExpandedWidthBudget = () => budget; // 真实实现返回固定常数，单测注入以便覆盖各分支
  return api;
}

// ─────────── 加宽量 = 预算，且重复调用不得累加 ───────────
test('加宽量等于预算（410+80=490），重复调用不得累加', () => {
  const msgMain = makeMsgMain(410);
  const api = buildApi(1200, 80);
  api.expandMsgWidthIfImageExists(msgMain);
  const first = msgMain.style.width;
  assert(first === '490px', `首次应为 490px（410+预算80），实际 ${first}`);
  api.expandMsgWidthIfImageExists(msgMain);
  assert(msgMain.style.width === first, `重复调用后应仍为 ${first}，实际 ${msgMain.style.width}（累加即缺陷）`);
  api.expandMsgWidthIfImageExists(msgMain);
  assert(msgMain.style.width === first, `第三次调用后应仍为 ${first}，实际 ${msgMain.style.width}`);
});

// ─────────── 预算为 0 时不得引入隐藏的额外加宽 ───────────
test('预算为 0 时宽度等于自然宽（加宽量只来自预算，无隐藏常数）', () => {
  const msgMain = makeMsgMain(410);
  const api = buildApi(1200, 0);
  api.expandMsgWidthIfImageExists(msgMain);
  assert(msgMain.style.width === '410px', `应为 410px（自然宽+预算0），实际 ${msgMain.style.width}`);
});

// ─────────── 上限钳制 ───────────
test('上限钳制生效且幂等', () => {
  const msgMain = makeMsgMain(1000);
  const api = buildApi(900, 80);
  api.expandMsgWidthIfImageExists(msgMain);
  assert(msgMain.style.width === '900px', `应被上限钳到 900px，实际 ${msgMain.style.width}`);
  api.expandMsgWidthIfImageExists(msgMain);
  assert(msgMain.style.width === '900px', `重复调用应仍为 900px，实际 ${msgMain.style.width}`);
});

// ─────────── 未布局（量不到宽度）不写入也不置锁 ───────────
test('未布局（offsetWidth=0）不写入宽度也不置锁，留给后续重试', () => {
  const msgMain = makeMsgMain(0);
  const api = buildApi(1200, 80);
  api.expandMsgWidthIfImageExists(msgMain);
  assert(msgMain.style.width === '', `不应写入宽度，实际 ${msgMain.style.width}`);
  assert(msgMain.__imageWidthExpanded !== true, '未布局时不得置锁');
  msgMain.__natural = 410; // 布局恢复后同一元素再次进入判定应能正常加宽
  api.expandMsgWidthIfImageExists(msgMain);
  assert(msgMain.style.width === '490px', `恢复布局后应为 490px，实际 ${msgMain.style.width}`);
});

// ─────────── 只处理带图的非预览框容器 ───────────
test('无图片 / 预览框内的容器不得被写入宽度', () => {
  const noImg = makeMsgMain(410);
  noImg.querySelector = () => null;
  const api = buildApi(1200, 80);
  api.expandMsgWidthIfImageExists(noImg);
  assert(noImg.style.width === '', `无图容器不应被写入宽度，实际 ${noImg.style.width}`);

  const inPreview = makeMsgMain(410);
  inPreview.closest = () => '.h-preview-box';
  api.expandMsgWidthIfImageExists(inPreview);
  assert(inPreview.style.width === '', `预览框内容器不应被写入宽度，实际 ${inPreview.style.width}`);
});

// ─────────── 真实预算常数应为正（防止被改成 0/负数导致加宽失效） ───────────
test('固定预算常数为正值', () => {
  const code = extractMethod('getExpandedWidthBudget');
  const sandbox = { console: { log: () => {} } };
  vm.createContext(sandbox);
  vm.runInContext('this.api = {' + code + '};', sandbox);
  const value = sandbox.api.getExpandedWidthBudget();
  assert(Number.isFinite(value) && value > 0 && value <= 400, `预算常数应为 0~400 之间的正值，实际 ${value}`);
});

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (e) { failed++; console.error(`FAIL - ${name}: ${e.message}`); }
}
if (failed) { console.error(`${failed} test(s) failed`); process.exit(1); }
console.log('hd reply width contract ok');
