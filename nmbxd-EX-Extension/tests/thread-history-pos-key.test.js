const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const script = fs.readFileSync(path.join(root, 'nmbxd-EX-for-edit.user.js'), 'utf8').replace(/\r\n/g, '\n');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function extractFunctionBody(source, functionName) {
  const start = source.indexOf(`function ${functionName}(`);
  assert(start !== -1, `${functionName} must exist`);
  // 先跳过参数列表：默认值里可能出现 `{}`（例如 options = {}），直接找 '{' 会误判为函数体起始
  let i = source.indexOf('(', start);
  assert(i !== -1, `${functionName} parameter list must exist`);
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
  assert(braceStart !== -1, `${functionName} body must exist`);
  let depth = 0;
  for (let j = braceStart; j < source.length; j++) {
    const ch = source[j];
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, j + 1);
    }
  }
  throw new Error(`${functionName} body not closed`);
}

// 位置小键原语是一段连续源码：从缓存变量声明到 syncThreadHistoryPosAndStore 结束。
// 直接抽出这段真实源码在沙箱里执行，避免"复刻逻辑"式的假测试。
function extractPosKeyBlock() {
  const start = script.indexOf('  let threadHistoryPosGmCache = null;');
  assert(start !== -1, 'thread-history pos key block must exist');
  const end = script.indexOf('  function getThreadHistoryStore()', start);
  assert(end !== -1, 'pos key block must end before getThreadHistoryStore');
  return script.slice(start, end);
}

function createSandbox(options = {}) {
  const gmStorage = new Map();
  const lsStorage = new Map();
  const counters = { gmWrites: 0, lsWrites: 0 };
  const localStorageStub = {
    getItem: (k) => (lsStorage.has(k) ? lsStorage.get(k) : null),
    setItem: (k, v) => {
      if (options.lsFails) throw new Error('quota');
      counters.lsWrites += 1;
      lsStorage.set(k, String(v));
    },
    removeItem: (k) => { lsStorage.delete(k); }
  };
  const perfStub = { begin: () => 0, finish: () => {}, record: () => {}, mark: () => {} };
  const api = new Function(
    'GM_getValue', 'GM_setValue', 'localStorage', 'buildThreadHistoryPageUrl',
    'THREAD_HISTORY_POS_KEY', 'THREAD_HISTORY_POS_HOT_KEY', 'THREAD_HISTORY_POS_LIMIT', 'startupPerfDebug', 'Date',
    `${extractPosKeyBlock()}
     return { normalizeThreadHistoryPosEntry, readThreadHistoryPosMap, readThreadHistoryPosGmMap, readThreadHistoryPosHotMap,
              setThreadHistoryPosEntry, persistThreadHistoryPosToGm, migrateThreadHistoryPosFromStore,
              syncThreadHistoryPosAndStore, invalidateThreadHistoryPosCache, applyThreadHistoryPosOverlayToStore };`
  )(
    (k, d) => (gmStorage.has(k) ? JSON.parse(JSON.stringify(gmStorage.get(k))) : d),
    (k, v) => { counters.gmWrites += 1; gmStorage.set(k, JSON.parse(JSON.stringify(v))); },
    localStorageStub,
    (mode, tid, page) => `https://x/t/${tid}?page=${page}`,
    'xdex_thread_history_pos',
    'xdex_thread_history_pos_hot',
    options.posLimit || 300,
    perfStub,
    Date
  );
  return { api, gmStorage, lsStorage, counters, GM_KEY: 'xdex_thread_history_pos', HOT_KEY: 'xdex_thread_history_pos_hot' };
}

function item(extra = {}) {
  return Object.assign({
    key: 'normal:64180270', mode: 'normal', threadId: '64180270', page: 1,
    url: 'https://x/t/64180270?page=1', maxVisitedPage: 1, lastKnownPage: 1,
    lastReadReplyId: '', lastReadReplyPage: 1, lastVisitedAt: 1000, visitCount: 1
  }, extra);
}

function store(items, order) {
  return { version: 1, items, index: {}, tombstones: {}, order: order || Object.keys(items) };
}

function testScrollPathWritesOnlyPosKey() {
  const touchBody = extractFunctionBody(script, 'touchThreadHistoryCurrentLocation');
  const posIndex = touchBody.indexOf('if (options.positionOnly)');
  assert(posIndex !== -1, 'touch must branch on positionOnly');
  const posBranch = touchBody.slice(posIndex, touchBody.indexOf('const saved = setThreadHistoryStore(store);', posIndex));
  assert(posBranch.includes('setThreadHistoryPosEntry('), 'positionOnly branch must write the pos key');
  assert(!posBranch.includes('setThreadHistoryStore('), 'positionOnly branch must not write the whole store');
  assert(posBranch.includes('return store;'), 'positionOnly branch must return before the store write');
  const scrollBody = extractFunctionBody(script, 'updateThreadHistoryScrollPosition');
  assert(scrollBody.includes('positionOnly: true'), 'scroll path must be marked positionOnly');
  assert(script.includes("const THREAD_HISTORY_POS_KEY = 'xdex_thread_history_pos';"), 'pos key constant must exist');
  assert(script.includes("const THREAD_HISTORY_POS_HOT_KEY = 'xdex_thread_history_pos_hot';"), 'hot pos key constant must exist');
  assert(/const THREAD_HISTORY_POS_LIMIT = \d+;/.test(script), 'pos key limit constant must exist');
}

function testHighFrequencyWriteNeverTouchesGm() {
  // ★ 核心修复：滚动中的位置更新只写 localStorage（无扩展存储往返、无跨标签广播），GM 一次都不写
  const box = createSandbox();
  box.counters.gmWrites = 0;
  box.api.setThreadHistoryPosEntry('normal:64180270', { p: 338, u: '', mv: 338, lk: 338, rid: '1234', rp: 338 }, 5000);
  assert(box.counters.gmWrites === 0, `hot write must not touch GM storage (gmWrites=${box.counters.gmWrites})`);
  assert(box.counters.lsWrites === 1, 'hot write must go to localStorage exactly once');
  const hot = JSON.parse(box.lsStorage.get(box.HOT_KEY));
  assert(hot['normal:64180270'].p === 338 && hot['normal:64180270'].rid === '1234', 'hot entry must carry the scalars');
  assert(!box.gmStorage.has(box.GM_KEY), 'GM side must stay untouched until a checkpoint');
  // 多次滚动更新：仍然 0 次 GM 写入
  for (let i = 0; i < 20; i += 1) {
    box.api.setThreadHistoryPosEntry('normal:64180270', { p: 338, rid: String(1000 + i), rp: 338 }, 5000 + i);
  }
  assert(box.counters.gmWrites === 0, 'repeated scroll updates must never write GM');
  assert(box.counters.lsWrites === 21, 'each change must write the hot layer');
}

function testCheckpointFlushesHotToGm() {
  const box = createSandbox();
  box.api.setThreadHistoryPosEntry('normal:64180270', { p: 338, rid: '999', rp: 338 }, 5000);
  assert(box.api.persistThreadHistoryPosToGm('pagehide') === true, 'checkpoint must flush pending hot entries');
  assert(box.counters.gmWrites === 1, 'checkpoint must write GM exactly once');
  const gm = box.gmStorage.get(box.GM_KEY);
  assert(gm['normal:64180270'].p === 338 && gm['normal:64180270'].rid === '999', 'GM must receive the hot values');
  assert(box.api.persistThreadHistoryPosToGm('hidden') === false, 'no pending changes → no second GM write');
  assert(box.counters.gmWrites === 1, 'GM write count must stay at one');
  // 检查点接线（源码级）
  assert(script.includes("persistThreadHistoryPosToGm('pagehide')"), 'pagehide must be a checkpoint');
  assert(script.includes("persistThreadHistoryPosToGm('hidden')"), 'tab hidden must be a checkpoint');
  assert(script.includes("'threadHistory.posWriteHot'"), 'hot write must be instrumented');
  assert(script.includes("'threadHistory.posFlushGM'"), 'GM flush must be instrumented');
}

function testMergeNewerWinsAcrossLayers() {
  const box = createSandbox();
  // GM 侧较旧、热表较新 → 合并视图取热表
  box.api.setThreadHistoryPosEntry('normal:1', { p: 5 }, 1000);
  box.api.persistThreadHistoryPosToGm('seed');
  box.api.setThreadHistoryPosEntry('normal:1', { p: 9 }, 2000);
  assert(box.api.readThreadHistoryPosMap()['normal:1'].p === 9, 'newer hot entry must win in the merged view');
  // GM 侧较新（另一个标签页/设备写入）→ 合并视图取 GM
  const box2 = createSandbox();
  box2.api.setThreadHistoryPosEntry('normal:1', { p: 3 }, 500);
  box2.api.persistThreadHistoryPosToGm('seed');
  box2.api.setThreadHistoryPosEntry('normal:1', { p: 4 }, 900);   // 热表 p=4@900
  box2.api.invalidateThreadHistoryPosCache();
  // 模拟 GM 侧被别处更新为更晚的 at
  const gm = box2.gmStorage.get(box2.GM_KEY);
  gm['normal:1'] = { p: 7, u: '', mv: 7, lk: 7, rid: '', rp: 7, at: 3000 };
  box2.gmStorage.set(box2.GM_KEY, gm);
  assert(box2.api.readThreadHistoryPosMap()['normal:1'].p === 7, 'newer GM entry must win in the merged view');
  // 过期热写入不得覆盖
  box2.api.setThreadHistoryPosEntry('normal:1', { p: 1 }, 100);
  assert(box2.api.readThreadHistoryPosMap()['normal:1'].p === 7, 'stale write must be ignored');
}

function testFallbackWhenLocalStorageUnavailable() {
  const box = createSandbox({ lsFails: true });
  box.api.setThreadHistoryPosEntry('normal:1', { p: 42 }, 8000);
  assert(box.counters.gmWrites === 1, 'without localStorage the entry must fall back to a GM write');
  const gm = box.gmStorage.get(box.GM_KEY);
  assert(gm['normal:1'].p === 42, 'fallback must persist the position to GM');
}

function testOverlayUsesMergedViewAndStaysBounded() {
  const box = createSandbox();
  box.api.setThreadHistoryPosEntry('normal:t1', { p: 7, u: '', mv: 7, lk: 7, rid: 'abc', rp: 7 }, 5000);
  const items = {};
  for (let i = 1; i <= 500; i += 1) items['normal:t' + i] = item({ key: 'normal:t' + i, threadId: 't' + i, lastVisitedAt: 1000 });
  const st = store(items);
  const snapshot = new Map(Object.keys(items).map((k) => [k, JSON.stringify(items[k])]));
  box.api.applyThreadHistoryPosOverlayToStore(st);
  let changed = 0;
  Object.keys(items).forEach((k) => { if (JSON.stringify(items[k]) !== snapshot.get(k)) changed += 1; });
  assert(changed === 1, `overlay must touch only mapped threads (touched ${changed})`);
  assert(items['normal:t1'].page === 7 && items['normal:t1'].lastReadReplyId === 'abc', 'hot values must reach the store mirror');
  assert(items['normal:t1'].url === 'https://x/t/t1?page=7', 'empty hot url must be rebuilt from the page');
}

function testProjectionScanAndPrune() {
  // 首次迁移：两层都空 → 投影进热表（不写 GM）
  const box = createSandbox();
  box.api.migrateThreadHistoryPosFromStore(store({
    'normal:64180270': item({ page: 12, lastVisitedAt: 1500, lastReadReplyId: 'abc' }),
    'po:11111111': item({ key: 'po:11111111', mode: 'po', page: 3, lastVisitedAt: 900 })
  }));
  assert(box.api.readThreadHistoryPosHotMap()['normal:64180270'].p === 12, 'projection must fill the hot layer');
  assert(box.counters.gmWrites === 0, 'projection must not write GM');
  box.api.setThreadHistoryPosEntry('normal:64180270', { p: 99 }, 9999);
  box.api.migrateThreadHistoryPosFromStore(store({ 'normal:64180270': item({ page: 12, lastVisitedAt: 1500 }) }));
  assert(box.api.readThreadHistoryPosMap()['normal:64180270'].p === 99, 'projection must not overwrite existing entries');
  // 淘汰 + 失效清理：小键上限与库内存在性
  const small = createSandbox({ posLimit: 2 });
  small.api.setThreadHistoryPosEntry('normal:a', { p: 1 }, 100);
  small.api.setThreadHistoryPosEntry('normal:b', { p: 1 }, 200);
  small.api.setThreadHistoryPosEntry('normal:c', { p: 1 }, 300);
  small.api.syncThreadHistoryPosAndStore(store({
    'normal:a': item({ lastVisitedAt: 100 }), 'normal:b': item({ lastVisitedAt: 200 }), 'normal:c': item({ lastVisitedAt: 300 })
  }));
  const pruned = small.api.readThreadHistoryPosMap();
  assert(Object.keys(pruned).length === 2, 'pos map must be pruned to the limit');
  assert(!pruned['normal:a'] && pruned['normal:c'], 'pruning must drop the oldest first');
  const small2 = createSandbox();
  small2.api.setThreadHistoryPosEntry('po:22222222', { p: 2 }, 500);
  small2.api.syncThreadHistoryPosAndStore(store({ 'normal:1': item({ lastVisitedAt: 100 }) }));
  assert(!small2.api.readThreadHistoryPosMap()['po:22222222'], 'entries for threads absent from the store must be dropped');
  // 整库更新（更新近的访问）刷新小键
  const box3 = createSandbox();
  box3.api.setThreadHistoryPosEntry('normal:1', { p: 5 }, 1000);
  box3.api.syncThreadHistoryPosAndStore(store({ 'normal:1': item({ page: 9, lastVisitedAt: 3000, lastReadReplyId: '777' }) }));
  const refreshed = box3.api.readThreadHistoryPosMap()['normal:1'];
  assert(refreshed.p === 9 && refreshed.at === 3000 && refreshed.rid === '777', 'newer store visit must refresh the pos entry');
  assert(box3.counters.gmWrites === 1, 'store write is a checkpoint → exactly one GM write');
}

function testProgressUpdatesUsePositionLayer() {
  // ★ 翻页/无缝翻页更新的是「最远页/最近查看页/最近浏览位置」——位置类字段 → 必须走位置层，不写整库
  const progressBody = extractFunctionBody(script, 'recordThreadHistoryProgress');
  assert(progressBody.includes('const positionOnly = !!getThreadHistoryStore().items[key];'),
    'progress must be position-only whenever the record exists (visit time now rides in vat)');
  assert(/const record = positionOnly\s*\n\s*\? \{ key, mode: parsed\.mode, threadId: parsed\.threadId \}/.test(progressBody),
    'position-only progress must skip DOM extraction (no OP content needed)');
  assert(progressBody.includes('positionOnly }'), 'progress must forward positionOnly to the upsert');
  const upsertBody = extractFunctionBody(script, 'upsertThreadHistoryRecord');
  const posIndex = upsertBody.indexOf('if (options.positionOnly)');
  assert(posIndex !== -1, 'upsert must branch on positionOnly');
  const branch = upsertBody.slice(posIndex, upsertBody.indexOf('const saved = setThreadHistoryStore(store);', posIndex));
  assert(branch.includes('setThreadHistoryPosEntry('), 'positionOnly branch must write the position layer');
  assert(!branch.includes('setThreadHistoryStore('), 'positionOnly branch must not write the whole store');
  assert(branch.includes('return store;'), 'positionOnly branch must return before the store write');
  assert(branch.includes('mv: merged.maxVisitedPage'), 'position branch must carry maxVisitedPage (最远页)');
  assert(branch.includes('lk: merged.lastKnownPage'), 'position branch must carry lastKnownPage');
  assert(branch.includes('rid: merged.lastReadReplyId') && branch.includes('rp: merged.lastReadReplyPage'),
    'position branch must carry the reading anchor (最近浏览位置)');
}

function testVisitTimeTravelsInPositionLayer() {
  // ★ 翻页原来传 touchVisitedAt:true 迫使走整库；现在"最近访问时间"由位置层的 vat 承载
  const progressBody = extractFunctionBody(script, 'recordThreadHistoryProgress');
  assert(progressBody.includes('const positionOnly = !!getThreadHistoryStore().items[key];'),
    'progress must be position-only whenever the record exists (visit time rides in vat)');
  const upsertBody = extractFunctionBody(script, 'upsertThreadHistoryRecord');
  const branch = upsertBody.slice(upsertBody.indexOf('if (options.positionOnly)'), upsertBody.indexOf('const saved = setThreadHistoryStore(store);', upsertBody.indexOf('if (options.positionOnly)')));
  // 只校验语义：位置层必须用 vat 承载"访问时间"（兜底值可以是 now，也可以是调用方指定的 visitedAt）
  assert(/vat:\s*Number\(merged\.lastVisitedAt\)/.test(branch), 'position layer must carry the visit time (vat)');
  assert(/const visitedAt = Number\(options\.visitedAt\) \|\| now;/.test(upsertBody), 'upsert must accept an explicit visit time (visitedAt)');
  const overlay = extractFunctionBody(script, 'applyThreadHistoryPosOverlayToStore');
  assert(overlay.includes('item.lastVisitedAt = Number(entry.vat)'), 'overlay must apply vat to the record');
  assert(overlay.includes('store.index[key].lastVisitedAt = Number(entry.vat)'), 'overlay must refresh the derived index timestamp');
  assert(overlay.includes('store.order.sort('), 'overlay must re-sort the order when the visit time changed');
  const merge = extractFunctionBody(script, 'readThreadHistoryPosMap');
  assert(merge.includes('vat: Math.max('), 'merged view must keep the largest vat across layers');
  // 行为：带 vat 的位置写入依然不碰 GM
  const box = createSandbox();
  box.counters.gmWrites = 0;
  box.api.setThreadHistoryPosEntry('normal:1', { p: 338, vat: 9999 }, 10000);
  assert(box.counters.gmWrites === 0, 'visit-time carrying position write must not touch GM');
  assert(box.api.readThreadHistoryPosMap()['normal:1'].vat === 9999, 'vat must be stored in the position layer');
  // 叠加：vat 抬升条目的 lastVisitedAt 并触发重排
  const st = store({ 'normal:1': item({ lastVisitedAt: 100, page: 1 }), 'normal:2': item({ key: 'normal:2', threadId: '2', lastVisitedAt: 5000, page: 1 }) });
  st.order = ['normal:2', 'normal:1'];
  st.index = { 'normal:1': { lastVisitedAt: 100 }, 'normal:2': { lastVisitedAt: 5000 } };
  box.api.applyThreadHistoryPosOverlayToStore(st);
  assert(st.items['normal:1'].lastVisitedAt === 9999, 'overlay must lift the record visit time from vat');
  assert(st.index['normal:1'].lastVisitedAt === 9999, 'overlay must lift the index visit time');
  assert(st.order[0] === 'normal:1', 'order must be re-sorted after the visit time changed');
}

function testVisitCountTravelsInPositionLayer() {
  // ★ 轻量入口：重复访问时"不提取正文、不写整库"，但必须仍能推进访问次数（绝对计数 vc + 幂等 max）
  const light = extractFunctionBody(script, 'recordThreadHistoryLightVisit');
  assert(light.includes('setThreadHistoryPosEntry('), 'light path must write the position layer');
  assert(!light.includes('extractThreadHistoryRecord('), 'light path must not extract the OP from the DOM');
  assert(!light.includes('setThreadHistoryStore('), 'light path must not write the whole store');
  assert(light.includes('vc: nextVc'), 'light path must carry the absolute visit count');
  const entry = extractFunctionBody(script, 'recordCurrentThreadHistory');
  assert(entry.includes('recordThreadHistoryLightVisit('), 'entry must branch into the light path');
  assert(entry.includes('itemNow.contentText || itemNow.excerpt'), 'light path must require already-recorded content');
  assert(entry.includes('if (!options.forceFull)'), 'entry must allow forcing the full path');
  const box = createSandbox();
  box.api.setThreadHistoryPosEntry('normal:1', { p: 1, vc: 5 }, 3000);
  assert(box.api.readThreadHistoryPosMap()['normal:1'].vc === 5, 'vc must be stored in the position layer');
  const st = store({ 'normal:1': item({ visitCount: 1, lastVisitedAt: 2000, page: 1 }) });
  box.api.applyThreadHistoryPosOverlayToStore(st);
  assert(st.items['normal:1'].visitCount === 5, 'overlay must lift visitCount from vc');
  box.api.setThreadHistoryPosEntry('normal:1', { vc: 3 }, 2500);
  assert(box.api.readThreadHistoryPosMap()['normal:1'].vc === 5, 'vc must never regress on a stale write');
  box.api.persistThreadHistoryPosToGm('seed');
  box.api.setThreadHistoryPosEntry('normal:1', { vc: 9 }, 5000);
  assert(box.api.readThreadHistoryPosMap()['normal:1'].vc === 9, 'merged view must take the larger vc');
  const st2 = store({ 'normal:1': item({ visitCount: 4, lastVisitedAt: 1000, page: 1 }) });
  box.api.syncThreadHistoryPosAndStore(st2);
  assert(st2.items['normal:1'].visitCount === 9, 'whole-store write must persist the accumulated visit count');
}

function testReadAndWriteMergeWiring() {
  const getBody = extractFunctionBody(script, 'getThreadHistoryStore');
  assert(getBody.includes('migrateThreadHistoryPosFromStore(store)'), 'read path must run one-shot projection');
  assert(getBody.includes('syncThreadHistoryPosAndStore(store, { readOnly: true })'), 'read path must overlay the pos key read-only');
  assert(getBody.includes('applyThreadHistoryPosOverlayToStore(threadHistoryStoreCache)'), 'warm cache must apply the overlay incrementally');
  const setBody = extractFunctionBody(script, 'setThreadHistoryStore');
  const syncIndex = setBody.indexOf('syncThreadHistoryPosAndStore(store);');
  const normalizeIndex = setBody.indexOf('normalizeThreadHistoryStore(store)');
  assert(syncIndex !== -1 && normalizeIndex !== -1 && syncIndex < normalizeIndex, 'store write must align with the pos key before normalizing');
  assert(setBody.includes('GM_setValue(THREAD_HISTORY_STORAGE_KEY, normalized);\n    GM_setValue(THREAD_HISTORY_REV_KEY, nextHistoryRev());'), 'store write must keep the pinned storage+rev writes');
  const listenerIndex = script.indexOf('GM_addValueChangeListener(THREAD_HISTORY_POS_KEY');
  assert(listenerIndex !== -1, 'pos key change listener must exist');
  const listenerSlice = script.slice(listenerIndex, listenerIndex + 620);
  assert(listenerSlice.includes('threadHistoryPosReactTimer'), 'pos key listener must coalesce bursts');
  assert(listenerSlice.includes('reactToThreadHistoryPosChange()'), 'pos key listener must delegate to the coalesced reaction');
  const reactBody = extractFunctionBody(script, 'reactToThreadHistoryPosChange');
  assert(reactBody.includes('invalidateThreadHistoryPosCache()'), 'reaction must invalidate the pos cache');
  assert(reactBody.includes('threadHistoryStoreNeedsPosOverlay = true'), 'reaction must mark incremental overlay');
  assert(reactBody.includes('syncFavoriteThreadsLinks()'), 'reaction must refresh favorite links when visible');
  assert(reactBody.includes('if (!hidden)'), 'reaction must skip DOM work in background tabs');
}

function testFavoriteLinksPreferPosKey() {
  const body = extractFunctionBody(script, 'syncFavoriteThreadsLinks');
  assert(body.includes('readThreadHistoryPosMap()'), 'link sync must read the merged pos view first');
  assert(body.includes('getItemsLazily'), 'link sync must read the store lazily (only when the pos key lacks the thread)');
  assert(body.indexOf('readThreadHistoryPosMap()') < body.indexOf('getItemsLazily()'), 'pos key must be consulted before the store');
  assert(body.includes("#xdex-favorite-threads-menu a[data-thread-id], #sp_panel_footer a[data-thread-id]"), 'link sync must keep both link containers');
  assert(body.includes("buildThreadHistoryPageUrl('normal', tid, 1)"), 'link sync must keep the page-1 fallback');
  assert(body.includes('if (document.hidden) return;'), 'link sync must skip background tabs');
  assert(body.includes("link.getAttribute('href') !== url"), 'link sync must skip no-op href writes');
}

function testRemainingScrollCostsAreBounded() {
  const findBody = extractFunctionBody(script, 'findClosestToViewportCenterReply');
  assert(findBody.includes('refreshThreadHistoryVisibleObservation()'), 'center lookup must prefer the visible set');
  assert(findBody.includes('threadHistoryVisibleSet'), 'center lookup must scan the visible set');
  assert(findBody.includes('querySelectorAll'), 'center lookup must keep a full-scan fallback');
  assert(script.includes('function refreshThreadHistoryVisibleObservation()'), 'visible-set observer must exist');
  assert(script.includes('new IntersectionObserver'), 'visible set must be maintained by IntersectionObserver');
  assert(script.includes("'threadHistory.scrollDebounce'"), 'scroll debounce must be instrumented');
  assert(script.includes("'threadHistory.findCenter'"), 'center lookup must be instrumented');
}

testScrollPathWritesOnlyPosKey();
testHighFrequencyWriteNeverTouchesGm();
testCheckpointFlushesHotToGm();
testMergeNewerWinsAcrossLayers();
testFallbackWhenLocalStorageUnavailable();
testOverlayUsesMergedViewAndStaysBounded();
testProjectionScanAndPrune();
testProgressUpdatesUsePositionLayer();
testVisitTimeTravelsInPositionLayer();
testVisitCountTravelsInPositionLayer();
testReadAndWriteMergeWiring();
testFavoriteLinksPreferPosKey();
testRemainingScrollCostsAreBounded();
console.log('thread history pos key contract ok');
