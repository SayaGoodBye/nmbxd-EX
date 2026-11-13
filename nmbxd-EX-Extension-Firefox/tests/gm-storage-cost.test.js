const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const script = fs.readFileSync(path.join(root, 'nmbxd-EX-for-edit.user.js'), 'utf8').replace(/\r\n/g, '\n');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function extractBlock(startNeedle, endNeedle) {
  const start = script.indexOf(startNeedle);
  assert(start !== -1, `block start not found: ${startNeedle}`);
  const end = script.indexOf(endNeedle, start);
  assert(end !== -1, `block end not found: ${endNeedle}`);
  return script.slice(start, end);
}

function extractFunctionBody(functionName) {
  const start = script.indexOf(`function ${functionName}(`);
  assert(start !== -1, `${functionName} must exist`);
  let i = script.indexOf('(', start);
  let paren = 0;
  for (; i < script.length; i++) {
    const ch = script[i];
    if (ch === '(') paren += 1;
    else if (ch === ')') { paren -= 1; if (paren === 0) { i += 1; break; } }
  }
  const braceStart = script.indexOf('{', i);
  let depth = 0;
  for (let j = braceStart; j < script.length; j++) {
    const ch = script[j];
    if (ch === '{') depth += 1;
    else if (ch === '}') { depth -= 1; if (depth === 0) return script.slice(start, j + 1); }
  }
  throw new Error(`${functionName} body not closed`);
}

function createSandbox() {
  const gm = new Map();
  const counters = { get: 0, set: 0 };
  const SettingPanel = { key: 'xdex-my-script-settings', defaults: {}, state: {} };
  const nowFn = (() => {
    let t = 0;
    return () => (t += 1.5);   // 每次调用推进 1.5ms，便于断言耗时统计
  })();
  const cacheBlock = extractBlock('  let settingsSnapshotCache = null;', '  function deferStartupTask(');
  const gmBlock = extractBlock('    const gmCallProfiles = new Map();', '    function installBrowserObservers() {');
  const api = new Function(
    'GM_getValue', 'GM_setValue', 'SettingPanel', 'now', 'console', 'XDEX_PERF_DIAGNOSTICS_ENABLED',
    `${cacheBlock}\n${gmBlock}
     return {
       readSettingsCached, invalidateSettingsSnapshot,
       wrapGmStorageForProfiling, summarizeGmCalls,
       callGet: (k, d) => GM_getValue(k, d),
       callSet: (k, v) => GM_setValue(k, v)
     };`
  )(
    (k, d) => { counters.get += 1; return gm.has(k) ? JSON.parse(JSON.stringify(gm.get(k))) : d; },
    (k, v) => { counters.set += 1; gm.set(k, JSON.parse(JSON.stringify(v))); },
    SettingPanel,
    nowFn,
    { table: () => {}, log: () => {}, warn: () => {} },
    true
  );
  return { api, counters, gm, SettingPanel };
}

function testHotPathsUseSettingsSnapshot() {
  // 热路径 helper 不得每次整读设置键（脚本猫的 GM_getValue 要经扩展通道）
  ['getTimeDisplayMode', 'getFavoriteThreadsConfig', 'getFilterConfig', 'getDockDisplayMode'].forEach((fn) => {
    const body = extractFunctionBody(fn);
    if (body.includes('GM_getValue(SettingPanel.key')) {
      assert(false, `${fn} must read settings through readSettingsCached() instead of a raw GM read`);
    }
  });
  ['getTimeDisplayMode', 'getFavoriteThreadsConfig', 'getDockDisplayMode'].forEach((fn) => {
    assert(extractFunctionBody(fn).includes('readSettingsCached()'), `${fn} must use the cached settings snapshot`);
  });
  assert(extractFunctionBody('getFilterConfig').includes('readSettingsCached()'), 'getFilterConfig fallback must use the cached snapshot');
  // 跨标签设置变更必须失效快照（否则别的标签页改设置后本页读到旧值）
  assert(script.includes('invalidateSettingsSnapshot()'), 'snapshot invalidation must exist');
  const listener = script.slice(script.indexOf('GM_addValueChangeListener(this.key'), script.indexOf('GM_addValueChangeListener(this.key') + 260);
  assert(listener.includes('invalidateSettingsSnapshot()'), 'cross-tab settings change must invalidate the snapshot');
  // GM 写入设置键必须失效快照（保证"即时生效"）
  const wrapper = extractBlock('    function wrapGmStorageForProfiling() {', '    function installBrowserObservers() {');
  assert(wrapper.includes('invalidateSettingsSnapshot()'), 'GM_setValue on the settings key must invalidate the snapshot');
  // 自动埋点必须被总开关约束：GM 包装不得无条件启用
  assert(/if \(XDEX_PERF_DIAGNOSTICS_ENABLED\) wrapGmStorageForProfiling\(\);/.test(script),
    'GM profiling wrapper must be gated by XDEX_PERF_DIAGNOSTICS_ENABLED');
  // 采集开关存在（当前为静默采集：开采集、但不自动打印）
  assert(/const XDEX_PERF_DIAGNOSTICS_ENABLED = (true|false);/.test(script),
    'diagnostics master switch must exist');
  assert(/const XDEX_PERF_QUIET = true;/.test(script),
    'quiet mode must suppress automatic perf console output');
  // 静默模式必须同时压住"逐条测量日志"与"逐条浏览器长帧日志"与"自动报告"
  assert(/if \(!XDEX_PERF_QUIET && duration >= LOG_TASK_MS\)/.test(script),
    'per-measurement logs must be suppressed in quiet mode');
  assert(/if \(!XDEX_PERF_QUIET && browserEvents\.length <= 60\)/.test(script),
    'browser observer per-entry logs must be suppressed in quiet mode');
  assert(/if \(!XDEX_PERF_QUIET\) \{\s*\n\s*setTimeout\(\(\) => \{\s*\n\s*report\(\{ auto: true \}\);/.test(script),
    'auto 60s report must be suppressed in quiet mode');
  assert(/installBrowserObservers\(\);/.test(script),
    'observers must still be installed so manual reports have data');
  assert(/AUTO_COLLECTION_ENABLED = XDEX_PERF_DIAGNOSTICS_ENABLED/.test(script),
    'collection flag must be masked by the master switch');
  // 探针出口
  assert(script.includes('target.__xdexPerfGm = summarizeGmCalls;'), 'GM profiler must be exposed on the page world');
  assert(/gm: gmCalls\.slice\(0, 15\),/.test(script), 'report must include the GM call summary');
}

function testSnapshotCachesAndInvalidates() {
  const box = createSandbox();
  box.gm.set(box.SettingPanel.key, { timeDisplayMode: 'exact', enableThreadHistory: true });
  const first = box.api.readSettingsCached();
  assert(first.timeDisplayMode === 'exact', 'snapshot must contain the stored settings');
  const readsAfterFirst = box.counters.get;
  for (let i = 0; i < 20; i += 1) box.api.readSettingsCached();
  assert(box.counters.get === readsAfterFirst, `repeated reads must hit the snapshot (get count stayed ${box.counters.get})`);
  assert(box.api.readSettingsCached() === first, 'snapshot must return the same object (no re-alloc)');
  // 失效后必须重新读取，并看到新值
  box.gm.set(box.SettingPanel.key, { timeDisplayMode: 'relative' });
  box.api.invalidateSettingsSnapshot();
  assert(box.api.readSettingsCached().timeDisplayMode === 'relative', 'invalidated snapshot must re-read fresh settings');
  assert(box.counters.get > readsAfterFirst, 'invalidation must cause exactly one more GM read');
  // 缺省/异常值按空对象处理
  box.api.invalidateSettingsSnapshot();
  box.gm.delete(box.SettingPanel.key);
  assert(typeof box.api.readSettingsCached() === 'object', 'missing settings must degrade to an empty object');
}

function testGmProfilerCountsAndInvalidates() {
  const box = createSandbox();
  box.api.wrapGmStorageForProfiling();
  box.api.wrapGmStorageForProfiling();          // 幂等：不得二次包装
  const value = box.api.callGet('some-key', 'fallback');
  assert(value === 'fallback', 'wrapper must pass through the raw return value');
  box.api.callGet('some-key', 'fallback');
  box.api.callSet('other-key', { a: 1 });
  const rows = box.api.summarizeGmCalls();
  const getRow = rows.find((r) => r.调用 === 'get' && r.键 === 'some-key');
  const setRow = rows.find((r) => r.调用 === 'set' && r.键 === 'other-key');
  assert(getRow && getRow.次数 === 2, `get calls must be counted per key (got ${getRow && getRow.次数})`);
  assert(getRow.合计ms > 0 && getRow.最大ms > 0, 'get row must carry timing');
  assert(setRow && setRow.次数 === 1, 'set calls must be counted per key');
  assert(rows[0].合计ms >= rows[rows.length - 1].合计ms, 'rows must be sorted by total time desc');
  // 写入设置键 → 快照失效（下层读取回升）
  box.api.readSettingsCached();
  const before = box.counters.get;
  box.api.readSettingsCached();
  assert(box.counters.get === before, 'snapshot must be warm before the write');
  box.api.callSet(box.SettingPanel.key, { enableThreadHistory: false });
  box.api.readSettingsCached();
  assert(box.counters.get === before + 1, 'writing the settings key must invalidate the snapshot');
}

testHotPathsUseSettingsSnapshot();
testSnapshotCachesAndInvalidates();
testGmProfilerCountsAndInvalidates();
console.log('gm storage cost contract ok');
