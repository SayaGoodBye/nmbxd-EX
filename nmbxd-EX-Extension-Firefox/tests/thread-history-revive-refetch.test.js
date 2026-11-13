// 浏览历史「恢复后重抓正文」契约：
//   1. 默认不重抓：正常访问仍走轻量入口（不提取正文、不写整库）；
//   2. 只有"移入回收站 → 从墓碑恢复（revivedAt）→ 再次访问"时，走完整路径重抓一次；
//   3. 抓完消费令牌（item.revivedRefetchAt = 那次 revivedAt），之后回到轻量入口；
//   4. 令牌判定本身幂等：purged / 仍在回收站（无 revivedAt）/ 已消费 → 0。
// 运行：node tests/thread-history-revive-refetch.test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const EXT_ROOT = path.join(__dirname, '..');
const SOURCE_PATH = path.join(EXT_ROOT, 'src', 'content', 'nmbxd-EX-for-edit.user.js');

const source = fs.readFileSync(SOURCE_PATH, 'utf8').replace(/\r\n/g, '\n');

function extractFunctionBody(functionName) {
  const start = source.indexOf(`function ${functionName}(`);
  assert(start !== -1, `${functionName} 必须存在`);
  let i = source.indexOf('(', start);
  assert(i !== -1, `${functionName} 参数列表必须存在`);
  let parenDepth = 0;
  for (; i < source.length; i++) {
    const ch = source[i];
    if (ch === '(') parenDepth += 1;
    else if (ch === ')') {
      parenDepth -= 1;
      if (parenDepth === 0) { i += 1; break; }
    }
  }
  const braceStart = source.indexOf('{', i);
  assert(braceStart !== -1, `${functionName} 函数体必须存在`);
  let depth = 0;
  for (let j = braceStart; j < source.length; j++) {
    const ch = source[j];
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, j + 1);
    }
  }
  throw new Error(`${functionName} 函数体未闭合`);
}

const tokenFnSource = extractFunctionBody('getThreadHistoryReviveRefetchToken');
const recordFnSource = extractFunctionBody('recordCurrentThreadHistory');
const lightFnSource = extractFunctionBody('recordThreadHistoryLightVisit');

function loadTokenFn() {
  const sandbox = {};
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  // getThreadHistoryStore 桩：未显式传 store 时读它
  vm.runInContext(
    `var __store = null;
     function getThreadHistoryStore() { return __store || { tombstones: {}, items: {} }; }
     ${tokenFnSource}
     globalThis.__token = getThreadHistoryReviveRefetchToken;
     globalThis.__setStore = (s) => { __store = s; };`,
    sandbox
  );
  return sandbox;
}

function testTokenRules() {
  const sb = loadTokenFn();
  const token = sb.__token;
  const KEY = 'thread:123';

  const revived = 1700000000000;
  const storeRevived = { tombstones: { [KEY]: { deletedAt: 1699999999000, origin: 'local', purged: false, revivedAt: revived } }, items: {} };

  assert.strictEqual(token(KEY, {}, storeRevived), revived, '恢复后未消费 → 应返回该次 revivedAt');
  assert.strictEqual(token(KEY, { revivedRefetchAt: revived }, storeRevived), 0, '已为该次恢复抓过 → 不应再抓');
  assert.strictEqual(token(KEY, { revivedRefetchAt: revived - 1 }, storeRevived), revived, '令牌比对的是时间戳，不等于即视为未消费');

  const storePending = { tombstones: { [KEY]: { deletedAt: 1, purged: false, revivedAt: null } }, items: {} };
  assert.strictEqual(token(KEY, {}, storePending), 0, '仍在回收站（无 revivedAt）→ 不重抓');

  const storePurged = { tombstones: { [KEY]: { deletedAt: 1, purged: true, revivedAt: revived } }, items: {} };
  assert.strictEqual(token(KEY, {}, storePurged), 0, '彻底删除（purged）→ 不重抓');

  assert.strictEqual(token('thread:404', {}, storeRevived), 0, '无墓碑 → 不重抓');
  assert.strictEqual(token('', {}, storeRevived), 0, '无 key → 不重抓');

  // 第二次「删除 → 恢复」产生新的 revivedAt → 必须再抓一次（幂等的前提是逐次比较）
  const revivedAgain = revived + 60000;
  const storeSecond = { tombstones: { [KEY]: { deletedAt: 2, purged: false, revivedAt: revivedAgain } }, items: {} };
  assert.strictEqual(token(KEY, { revivedRefetchAt: revived }, storeSecond), revivedAgain, '再次恢复 → 新令牌');

  // 默认参数：不传 store 时读 getThreadHistoryStore()
  sb.__setStore(storeRevived);
  assert.strictEqual(token(KEY, {}), revived, '不传 store 时应回退到 getThreadHistoryStore()');

  // 异常不应抛出（返回 0）
  assert.strictEqual(token(KEY, {}, { tombstones: null }), 0, 'tombstones 为空时安全返回 0');
}

function testDefaultPathDoesNotRefetch() {
  const guardIndex = recordFnSource.indexOf('const reviveRefetchToken = getThreadHistoryReviveRefetchToken(keyNow, itemNow, storeNow);');
  const elseIndex = recordFnSource.indexOf('} else if (itemNow && (itemNow.contentText || itemNow.excerpt)) {');
  const lightIndex = recordFnSource.indexOf('recordThreadHistoryLightVisit(keyNow, parsedNow, itemNow, storeNow, options)');
  assert(guardIndex !== -1, '分流块必须查询恢复重抓令牌');
  assert(elseIndex !== -1, '轻量入口必须变成"令牌为空时"的分支');
  assert(lightIndex !== -1, '轻量入口调用必须保留');
  assert(guardIndex < elseIndex && elseIndex < lightIndex, '必须"先判令牌，再走轻量入口"');
  assert(recordFnSource.includes("status: 'revive-refetch'"), '重抓分支要写调试状态，便于排查');
  assert(!/if \(reviveRefetchToken\) \{[^}]*recordThreadHistoryLightVisit/.test(recordFnSource), '重抓分支内不得再走轻量入口');
}

function testMarkerConsumedOnFullPathOnly() {
  assert(recordFnSource.includes('const reviveTokenForMarker = getThreadHistoryReviveRefetchToken(record.key, storeForReviveMarker.items[record.key], storeForReviveMarker);'),
    '完整路径要重新取令牌（写在记录上）');
  assert(recordFnSource.includes('record.revivedRefetchAt = reviveTokenForMarker;'), '令牌必须写进记录以消费');
  const markerIndex = recordFnSource.indexOf('record.revivedRefetchAt = reviveTokenForMarker;');
  const upsertIndex = recordFnSource.indexOf('upsertThreadHistoryRecord(record, Object.assign({ reason: \'initial-load\', countVisit: true }, options));');
  assert(upsertIndex !== -1, '完整路径必须仍然调用 upsertThreadHistoryRecord');
  assert(markerIndex < upsertIndex, '令牌必须在同一笔整库写入前贴上，避免"抓了但没消费"');
  assert(!lightFnSource.includes('revivedRefetchAt'), '轻量入口不得触碰重抓令牌');
  assert(!lightFnSource.includes('extractThreadHistoryRecord('), '轻量入口仍然不得提取正文');
}

function testForceFullIsNotCalledByDefault() {
  const callSites = [];
  const re = /recordCurrentThreadHistory\(([^)]*)\)/g;
  let m;
  while ((m = re.exec(source)) !== null) callSites.push(m[0]);
  assert(callSites.length >= 4, `应能枚举到全部调用点，实际 ${callSites.length}`);
  const withForceFull = callSites.filter((call) => call.includes('forceFull'));
  assert(withForceFull.length <= 1, `默认不得触发重抓，只有手动入口可以传 forceFull，实际 ${withForceFull.length} 处`);
  // 手动入口必须存在且是唯一 bearer
  assert(source.includes('window.__xdexRefetchThreadContent = function xdexRefetchThreadContent(options)'), '必须提供手动重抓入口');
  assert(source.includes("Object.assign({ reason: 'manual-refetch', forceFull: true }, options || {})"), '手动入口必须走完整路径');
  // 自动链路（initial-load / reactivation-dwell / reply-success-refresh）都不得带 forceFull
  ['reason: \'initial-load\'', 'reason: \'reactivation-dwell\'', 'reason: \'reply-success-refresh\''].forEach((needle) => {
    const idx = source.indexOf(needle);
    assert(idx !== -1, `找不到调用点：${needle}`);
    const slice = source.slice(idx, source.indexOf(')', idx));
    assert(!slice.includes('forceFull'), `${needle} 调用点不得强制完整路径`);
  });
}

function testReviveFlowEndToEnd() {
  const sandbox = {};
  const KEY = 'thread:123';
  const state = {
    store: null,
    calls: [],
    debug: []
  };
  function seedStore(tombstone, item) {
    state.store = {
      items: item ? { [KEY]: Object.assign({ key: KEY, mode: 'normal', threadId: '123' }, item) } : {},
      index: {},
      order: item ? [KEY] : [],
      tombstones: { [KEY]: tombstone }
    };
  }

  const stubs = {
    isThreadHistoryEnabledNow: () => true,
    parseThreadHistoryUrl: () => ({ mode: 'normal', threadId: '123', page: 1, url: 'https://www.nmbxd1.com/t/123' }),
    getThreadHistoryKey: (mode, id) => `thread:${id}`,
    getThreadHistoryStore: () => state.store,
    recordThreadHistoryLightVisit: (key, parsed, item, store, options) => {
      state.calls.push('light');
      store.items[key] = Object.assign({}, item, { visitCount: (Number(item.visitCount) || 0) + 1 });
      return true;
    },
    extractThreadHistoryRecord: () => {
      state.calls.push('full-extract');
      return {
        key: KEY, mode: 'normal', threadId: '123', page: 1,
        url: 'https://www.nmbxd1.com/t/123', title: '标题', author: '无名氏',
        contentText: '重新抓取到的正文', excerpt: '重新抓取到的正文'
      };
    },
    findThreadHistoryMainElement: () => ({}),
    upsertThreadHistoryRecord: (record, options) => {
      state.calls.push('upsert');
      state.store.items[record.key] = Object.assign({}, state.store.items[record.key], record);
      return state.store;
    },
    updateThreadHistoryDebugState: (patch) => { state.debug.push(patch); },
    logThreadHistory: () => {},
    installThreadHistoryScrollTracking: () => {},
    startupPerfDebug: { begin: () => 0, finish: () => {} },
    document: { readyState: 'complete', querySelectorAll: () => [] },
    location: { href: 'https://www.nmbxd1.com/t/123' },
    setTimeout: () => 0
  };

  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  Object.assign(sandbox, stubs);
  vm.createContext(sandbox);
  vm.runInContext(
    `${tokenFnSource}
     ${recordFnSource}
     globalThis.__record = recordCurrentThreadHistory;`,
    sandbox
  );
  const record = sandbox.__record;

  // ① 普通访问（库里有正文、无恢复令牌）→ 轻量入口，不提取正文
  seedStore({ deletedAt: 1, origin: 'local', purged: false, revivedAt: null }, { contentText: '旧正文', visitCount: 1 });
  state.calls = [];
  record(0, { reason: 'initial-load' });
  assert.deepStrictEqual(state.calls, ['light'], `普通访问必须只走轻量入口，实际 ${state.calls.join('+')}`);
  assert.strictEqual(state.store.items[KEY].revivedRefetchAt, undefined, '普通访问不得写重抓令牌');

  // ② 移入回收站：正文快照进墓碑，items 去掉该串
  const snapshot = Object.assign({}, state.store.items[KEY]);
  seedStore({ deletedAt: 2, origin: 'local', purged: false, revivedAt: null, record: snapshot }, null);

  // ③ 从墓碑恢复（revivedAt）→ items 恢复为删除前快照（正文可能是旧的）
  seedStore({ deletedAt: 2, origin: 'local', purged: false, revivedAt: 111 }, snapshot);

  // ④ 恢复后再次访问 → 完整路径重抓一次，并消费令牌
  state.calls = [];
  record(0, { reason: 'initial-load' });
  assert.deepStrictEqual(state.calls, ['full-extract', 'upsert'], `恢复后首次访问必须重抓正文，实际 ${state.calls.join('+')}`);
  assert.strictEqual(state.store.items[KEY].contentText, '重新抓取到的正文', '正文必须被页面内容覆盖');
  assert.strictEqual(state.store.items[KEY].revivedRefetchAt, 111, '必须消费该次恢复的令牌');
  assert(state.debug.some((p) => p && p.lastRecord && p.lastRecord.status === 'revive-refetch'), '重抓分支必须留调试状态');

  // ⑤ 之后再次访问 → 回到轻量入口（只抓一次）
  state.calls = [];
  record(0, { reason: 'initial-load' });
  assert.deepStrictEqual(state.calls, ['light'], `令牌消费后必须回到轻量入口，实际 ${state.calls.join('+')}`);

  // ⑥ 再次删除 → 再次恢复（新 revivedAt）→ 必须再抓一次
  state.calls = [];
  seedStore({ deletedAt: 3, origin: 'local', purged: false, revivedAt: 222 }, state.store.items[KEY]);
  record(0, { reason: 'initial-load' });
  assert.deepStrictEqual(state.calls, ['full-extract', 'upsert'], `新一轮恢复必须再次重抓，实际 ${state.calls.join('+')}`);
  assert.strictEqual(state.store.items[KEY].revivedRefetchAt, 222, '令牌应更新为新一轮恢复时间');

  // ⑦ 恢复但库里没有正文（如远端恢复没带记录）→ 本来就走完整路径，令牌同样被消费
  seedStore({ deletedAt: 4, origin: 'local', purged: false, revivedAt: 333 }, null);
  state.calls = [];
  record(0, { reason: 'initial-load' });
  assert.deepStrictEqual(state.calls, ['full-extract', 'upsert'], `无正文时必须走完整路径，实际 ${state.calls.join('+')}`);
  assert.strictEqual(state.store.items[KEY].revivedRefetchAt, 333, '无正文场景也要消费令牌');
}

const tests = [testTokenRules, testDefaultPathDoesNotRefetch, testMarkerConsumedOnFullPathOnly, testForceFullIsNotCalledByDefault, testReviveFlowEndToEnd];

let failed = 0;
tests.forEach((fn) => {
  try {
    fn();
    console.log(`  PASS ${fn.name}`);
  } catch (err) {
    failed += 1;
    console.error(`  FAIL ${fn.name}\n       ${(err && err.message) || err}`);
  }
});

if (failed) {
  console.error(`${failed} / ${tests.length} 项失败`);
  process.exit(1);
}
console.log('thread history revive refetch contract ok');