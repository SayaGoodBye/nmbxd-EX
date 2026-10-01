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

// ─────────── ④ 热路径埋点（真机取证用；关闭采集时须零开销） ───────────
// 这些标签是 R1-R4 四轮真机测量的唯一数据来源，缺失则四场景无法归因，
// 因此与前三项同列为契约。语义要求：
//   1) 滚动/观察器热点必须走 begin/finish（可选 token 快路径），不得用无条件 now()
//   2) meta 必须惰性（函数形式），关闭采集时不得构造
//   3) 观察器创建处必须有计数埋点（H1-H3 的真机验收判据：实例数恒定）
test('startupPerfDebug 提供零开销 begin/finish 快路径', () => {
  assert(/function begin\(\)\s*\{\s*\n\s*return AUTO_COLLECTION_ENABLED \? now\(\) : null;/.test(src),
    'begin 必须在关闭采集时直接返回 null（不读时钟）');
  assert(/function finish\(label, token, meta\)\s*\{[\s\S]{0,200}?if \(!AUTO_COLLECTION_ENABLED \|\| token == null\) return;/.test(src),
    'finish 必须同时以 AUTO_COLLECTION_ENABLED 与 token == null 早退');
  assert(/const api = \{[^}]*\bbegin\b[^}]*\bfinish\b/.test(src), 'begin/finish 必须导出到 api');
});

test('热路径埋点存在且计时策略正确', () => {
  // 必须走 finish()：这些计时点位于 rAF/滚动回调内或异步续体里，
  // 用 measure 需要把回调整体包成函数（改结构），故用 begin/finish 配对
  const mustFinish = [
    'seamless.runUserScrollFrame',   // D 场景：滚动帧内无缝翻页判定
    'hdLazy.onScrollFrame',          // D 场景：滚动帧内懒加载处理
    'hdLazy.measureQueue',           // D 场景：rect 读取成本（meta 带队列长度）
    'applyPageEnhancements.total',   // A/B/C/D 共用的增强收口（异步段）
    'refresh.checkNext.syncDom',     // C 场景：刷新按钮 / loadNext 末页的局部刷新
    'refresh.postReply.syncDom',     // A 场景：串内页发送后刷新（独立实现，非 checkNext）
    // B 场景：板块页/时间线发送后增量刷新（Step 5-8 同步段 + 两处全文档调用）
    'boardQuickReply.total',
    'boardQuickReply.step5.measure', 'boardQuickReply.step6.insert', 'boardQuickReply.step7.compensate',
    'boardQuickReply.step8.post', 'boardQuickReply.buildNode',
    'boardQuickReply.deferred.refreshFilter', 'boardQuickReply.deferred.enablePostExpand', 'boardQuickReply.deferred.total',
    // B：await 分段（网络 vs 桥接阻塞）
    'boardQuickReply.await.p1', 'boardQuickReply.await.tail', 'boardQuickReply.await.prev',
  ];
  mustFinish.forEach(label => {
    // 必须能匹配到 `startupPerfDebug.finish('<label>'` 这一完整调用形式；
    // 不能用「先找标签再回看」——MEASURED_LABELS 名单里同样出现这些字符串，会命中错误位置
    assert(new RegExp(`startupPerfDebug\\.finish\\('${label.replace(/[.:]/g, m => '\\' + m)}'`).test(src),
      `${label} 必须通过 finish() 记录`);
  });
  // 允许走 measure()：同步调用，measure 已具备零开销快路径
  const allowMeasure = ['applyPageEnhancements.syncPreprocess'];
  allowMeasure.forEach(label => {
    assert(new RegExp(`startupPerfDebug\\.(finish|measure)\\('${label.replace(/[.:]/g, m => '\\' + m)}'`).test(src),
      `${label} 必须接入计时`);
  });
});

test('applyPageEnhancements 计时点在异步回调内（外层 measure 量不到真正耗时）', () => {
  const start = src.indexOf('function applyPageEnhancements(root, cfg)');
  assert(start !== -1, 'applyPageEnhancements 必须存在');
  const body = src.slice(start, start + 4000);
  const setT = body.indexOf('setTimeout(() => {');
  const tok = body.indexOf('startupPerfDebug.begin()');
  const fin = body.indexOf("startupPerfDebug.finish('applyPageEnhancements.total'");
  assert(setT !== -1 && tok !== -1 && fin !== -1, '计时点必须存在');
  assert(tok > setT && fin > tok, 'begin/finish 必须在 setTimeout 回调内部，包住真正的增强步骤');
});

test('观察器创建处均有计数埋点（H1-H3 真机验收判据）', () => {
  const labels = ['observer.create:body', 'observer.create:pag', 'observer.create:overlay',
    'observer.create:hdImageBox', 'observer.create:hdGlobal', 'observer.create:expandWidthRO'];
  labels.forEach(label => {
    const i = src.indexOf(`'${label}'`);
    assert(i !== -1, `缺少观察器计数埋点 ${label}`);
    const after = src.slice(i, i + 400);
    assert(/new (Mutation|Intersection|Resize)Observer/.test(after),
      `${label} 之后 400 字符内应紧邻对应的观察器构造`);
  });
});

test('埋点 meta 必须惰性求值（关闭采集时不构造对象）', () => {
  // finish 调用的第三参必须是箭头函数，不得直接传对象字面量
  const bad = src.match(/startupPerfDebug\.finish\([^)]*?,\s*(?:__perfToken|token)\s*,\s*\{/g) || [];
  assert(bad.length === 0, `finish 的 meta 必须用函数惰性求值，发现直接传对象：${bad.join(' | ')}`);
});

// ─────────── ⑤ 场景留档与导出（真机测量的记录通道） ───────────
test('提供场景记录与导出入口', () => {
  ['capture', 'exportAll', 'printAll', 'listRounds', 'clearRounds'].forEach(name => {
    assert(new RegExp(`function ${name}\\(`).test(src), `缺少 ${name} 函数`);
    const i = src.indexOf(`window.__xdexPerf${name === 'capture' ? 'Capture' : ''}`);
  });
  [['__xdexPerfCapture', 'capture'], ['__xdexPerfRounds', 'listRounds'], ['__xdexPerfExport', 'exportAll'],
   ['__xdexPerfPrint', 'printAll'], ['__xdexPerfClear', 'clearRounds']].forEach(([globalName, fn]) => {
    assert(new RegExp(`window\\.${globalName} = ${fn};`).test(src), `缺少全局入口 window.${globalName}`);
  });
  // 剪贴板 API 需用户手势且受页面策略限制，真机不可靠 —— 性能模块内必须走控制台展开输出
  // （设置面板的导入导出另有剪贴板通道，不在此断言范围内）
  const perfStart = src.indexOf('const startupPerfDebug = (() => {');
  const perfEnd = src.indexOf('})();', src.indexOf('return api;', perfStart));
  const perfSrc = src.slice(perfStart, perfEnd);
  assert(!/navigator\.clipboard/.test(perfSrc), '性能模块内不得依赖 navigator.clipboard（真机不可靠）');
  assert(/function printAll\(\)/.test(perfSrc) && /console\.log\(json\)/.test(perfSrc),
    'printAll 必须把 JSON 直接 console.log 展开');
});

test('capture 留档后必须清空统计（保证下一轮从零开始）', () => {
  const i = src.indexOf('function capture(name)');
  assert(i !== -1, 'capture 必须存在');
  const body = src.slice(i, i + 1200);
  assert(/rounds\.push\(scenario\)/.test(body), 'capture 必须把场景推入留档');
  assert(/reset\(\);/.test(body), 'capture 必须调用 reset() 清空本轮统计');
  assert(/if \(!name\)/.test(body), 'capture 缺场景名时必须早退告警');
});

test('留档筛选的是测量标签，不含高频观察器回调（避免导出膨胀）', () => {
  const i = src.indexOf('const MEASURED_LABELS = [');
  assert(i !== -1, 'MEASURED_LABELS 必须存在');
  const block = src.slice(i, src.indexOf('];', i));
  ['hdLazy.onScrollFrame', 'hdLazy.measureQueue', 'seamless.runUserScrollFrame',
   'applyPageEnhancements.total', 'refresh.checkNext.syncDom', 'refresh.postReply.syncDom']
    .forEach(label => assert(block.includes(`'${label}'`), `预留档标签应含 ${label}`));
  assert(!block.includes("'observer:hdGlobal'"), 'observer:* 回调属高频，不得进入逐轮明细（只保留 create 计数）');
});

// ─────────── ⑥ LoAF 脚本归因（未归因阻塞的定位手段） ───────────
test('长帧采集必须带 scripts 归因（否则阻塞无法定位到具体函数）', () => {
  const i = src.indexOf("label: 'browser:long-animation-frame'");
  assert(i !== -1, '长帧采集必须存在');
  const block = src.slice(i, i + 1800);
  ['scripts', 'sourceURL', 'sourceFunctionName', 'invoker', 'forcedStyleAndLayoutDuration']
    .forEach(f => assert(block.includes(f), `LoAF 采集应含 ${f}（用于归因脚本与强制布局耗时）`));
});

test('留档必须输出 topLoafScripts 聚合（按 duration+forcedStyleAndLayout 排序）', () => {
  assert(/topLoafScripts: topScripts/.test(src), '场景留档应含 topLoafScripts');
  assert(/\bduration \+ b\.forcedStyleAndLayout\) - \(a\.duration \+ a\.forcedStyleAndLayout\)/.test(src),
    '聚合排序应把 duration 与强制布局耗时一并计入');
});

test('留档字段顺序：blocking/LoAF 归因必须前置（控制台复制易从尾部截断）', () => {
  const i = src.indexOf('function collectScenario(round)');
  const body = src.slice(i, i + 3000);
  const ret = body.slice(body.indexOf('return {'));
  const order = ['scenario', 'blockingDurationMs', 'longAnimationFrames', 'topLoafScripts', 'measured'];
  let last = -1;
  order.forEach(k => {
    const p = ret.indexOf(k + ':');
    assert(p !== -1, `留档应含 ${k}`);
    // scenario 与 measured 之间的关键字段必须靠前
    if (k !== 'measured') { assert(p > last, `${k} 应在 ${order[order.indexOf(k)-1]} 之后`); last = p; }
  });
});

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (e) { failed++; console.error(`FAIL - ${name}: ${e.message}`); }
}
if (failed) { console.error(`${failed} test(s) failed`); process.exit(1); }
console.log('perf hotpath contract ok');
