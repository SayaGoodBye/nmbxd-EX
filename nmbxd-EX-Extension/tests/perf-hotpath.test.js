// 性能取证与热路径修复契约测试
// 对应四个卡顿场景（发送后局部刷新 / 板块页快速回复插入 / 刷新按钮 / 无缝翻页后滚动）。
// 钉住三件事：
//   ① 性能采集开关可运行期切换（无需改源码），且默认关闭（关闭时无额外开销）
//   ② applyPageEnhancements 内过滤作用域必须与其余步骤一致传 root，不得传 document
//      （传 document 会让每次局部刷新/翻页对整条串全部回复重跑 PO 布局，成本随串长线性放大）
//   ③ 无缝翻页的用户滚动回调必须做 rAF 合并（滚动事件密集，未合并会重复强制布局读取）
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// ─────────── ① 采集开关运行时可切换且默认关闭 ───────────
test('性能采集开关默认关闭（关闭时 record/mark 为空调用）', () => {
  assert(/let AUTO_COLLECTION_ENABLED = false;/.test(src),
    'AUTO_COLLECTION_ENABLED 应默认 false');
  assert(!/const AUTO_COLLECTION_ENABLED = true;/.test(src), '不得硬编码为 true');
});

test('提供运行时开关：localStorage 标记 + 控制台函数', () => {
  assert(/localStorage\.getItem\('xdexPerfCollect'\)/.test(src),
    '应从 localStorage 读取采集标记（免改源码）');
  assert(/__xdexPerfCollectOn/.test(src), '应导出开启函数');
  assert(/__xdexPerfCollectOff/.test(src), '应导出关闭函数');
  assert(/__xdexPerfCollectState/.test(src), '应导出状态查询函数');
});

test('采集开关的读取不得让脚本因 localStorage 受限而抛错', () => {
  const idx = src.indexOf("localStorage.getItem('xdexPerfCollect')");
  assert(idx !== -1, '必须存在读取语句');
  // 该读取必须被 try/catch 包裹（kindle 等环境的 localStorage 可能受限）
  const scope = src.slice(Math.max(0, idx - 400), idx + 200);
  assert(/try\s*\{/.test(scope), 'localStorage 读取必须在 try 块内');
});

// ─────────── ② 过滤作用域必须传 root ───────────
test('applyPageEnhancements 内 refreshFilterDisplay 必须传 root 而非 document', () => {
  assert(!/refreshFilterDisplay\(liveCfg, document\)/.test(src),
    '不得对 document 重跑过滤（成本随串长度线性放大）');
  assert(/refreshFilterDisplay\(liveCfg, root\)/.test(src),
    '应把作用域收敛到本次新增的 root');
});

test('applyPageEnhancements 内各步骤作用域一致（均为 root）', () => {
  const start = src.indexOf('function applyPageEnhancements(root, cfg)');
  assert(start !== -1, 'applyPageEnhancements 必须存在');
  const end = src.indexOf('\n  }\n', start);
  const body = src.slice(start, end);
  // 检出错传 document 的步骤（已知唯一例外是 none —— 全部应按 root）
  const docCalls = body.match(/typeof \w+ === 'function'\)\s*\w+\(document\)/g) || [];
  assert(docCalls.length === 0, `不应有传 document 的步骤，发现：${docCalls.join(', ')}`);
});

// ─────────── ③ 滚动回调 rAF 合并 ───────────
test('无缝翻页用户滚动回调做 rAF 合并（一帧只处理一次）', () => {
  const i = src.indexOf('function onUserScroll()');
  assert(i !== -1, 'onUserScroll 必须存在');
  const brace = src.indexOf('{', i);
  let depth = 0, end = -1;
  for (let k = brace; k < src.length; k++) {
    if (src[k] === '{') depth++;
    else if (src[k] === '}') { depth--; if (depth === 0) { end = k; break; } }
  }
  const fn = src.slice(i, end + 1);
  assert(/userScrollFrameId/.test(fn), 'onUserScroll 必须有帧守卫，避免逐事件处理');
  assert(/requestAnimationFrame/.test(fn), 'onUserScroll 应使用 requestAnimationFrame 合并');
  assert(/if \(userScrollFrameId\) return;/.test(fn), '应有“本帧已排程则直接返回”的守卫');
});

test('滚动帧内仍保留冻结态解冻逻辑（合并不得改变行为）', () => {
  const i = src.indexOf('function runUserScrollFrame()');
  assert(i !== -1, '应把实际处理体抽为 runUserScrollFrame');
  const brace = src.indexOf('{', i);
  let depth = 0, end = -1;
  for (let k = brace; k < src.length; k++) {
    if (src[k] === '{') depth++;
    else if (src[k] === '}') { depth--; if (depth === 0) { end = k; break; } }
  }
  const body = src.slice(i, end + 1);
  assert(/observerFrozen && sentinel/.test(body), '应保留冻结态判断');
  assert(/isSeamlessNearBottom\(\)/.test(body), '应保留近底判定');
  assert(/observer\.observe\(sentinel\)/.test(body), '应保留恢复观察');
  assert(/lastUserScrollDir/.test(body), '应保留滚动方向更新');
});

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (e) { failed++; console.error(`FAIL - ${name}: ${e.message}`); }
}
if (failed) { console.error(`${failed} test(s) failed`); process.exit(1); }
console.log('perf hotpath contract ok');
