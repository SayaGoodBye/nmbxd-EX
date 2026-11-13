// 发言历史「删除后不再回到列表」+ 垃圾桶标识 hover 变红 契约
//   背景：发言历史此前与浏览历史共用"墓碑压制 + 删除后新段(items 影子条目)"模型：
//   删除后只要再有一次写入（如回复确认链/字段回填）就把该条重建回主列表并带垃圾桶标识，
//   回收站卡片还会合成显示"新记录"。维护者明确：发言历史**不需要**这个区分，删除后应直接进回收站。
//   另：深色主题下 `:root.xdex-darkreader-active …-tombstone-mark{color:var(--foreground)}`（0,3,0）
//   压过 hover 的 `color:#EE0000`（0,2,0），导致只有圆周变红、图标不变。
// 运行：node tests/post-history-tombstone-no-revive.test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8').replace(/\r\n/g, '\n');

function extractFunction(name) {
  const start = src.indexOf('function ' + name + '(');
  assert(start !== -1, name + ' 必须存在');
  let depth = 0;
  for (let j = src.indexOf('{', start); j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(start, j + 1); }
  }
  throw new Error(name + ' 未闭合');
}

// ── 1. 影子归并口径 ──
function loadMerge() {
  const sb = { console, Date, Number, String, Math, Object, Array, JSON, Infinity, isFinite };
  sb.globalThis = sb;
  vm.createContext(sb);
  vm.runInContext(extractFunction('mergePostHistoryShadowIntoSnapshot') + '\nglobalThis.__m = mergePostHistoryShadowIntoSnapshot;', sb);
  return sb.__m;
}

function testMergePrefersNewer() {
  const merge = loadMerge();
  // 入参（删除后新段/新写入）内容优先；提交时间取更早、页码取更大（与回收站卡片合成口径一致）
  const a = merge({ contentText: '旧', submittedAt: 2000, page: 3, type: 'reply', localId: 'k' },
    { contentText: '新', submittedAt: 1000, page: 9, type: 'reply', localId: 'k' });
  assert.strictEqual(a.contentText, '新', '入参内容优先（新段即最新）');
  assert.strictEqual(a.submittedAt, 1000, 'submittedAt 取更早者');
  assert.strictEqual(a.page, 9, 'page 取更大者');
  assert.strictEqual(a.localId, 'k');
  const b = merge({ contentText: '', submittedAt: 5000, page: 1, type: 'reply' }, { contentText: '影子', submittedAt: 100, page: 7 });
  assert.strictEqual(b.contentText, '影子', '入参内容为空时回退到快照内容');
  assert.strictEqual(b.page, 7, 'page 仍取更大者');
  // 空快照 / submittedAt 非法 → 不产生 NaN
  const c = merge(null, { contentText: 'x', submittedAt: 'abc', page: 'q' });
  assert.strictEqual(c.contentText, 'x');
  assert(Number.isFinite(c.submittedAt) && c.submittedAt > 0, 'submittedAt 必须有有限兜底');
  assert.strictEqual(c.page, 0);
}

// ── 2. 写入守卫：有未复活墓碑时不得重建 items ──
function loadUpsert(store) {
  const writes = [];
  const sb = {
    console, Date, Number, String, Math, Object, Array, JSON, Infinity, isFinite,
    getPostHistoryStore: () => store,
    setPostHistoryStore: (s) => { writes.push(JSON.parse(JSON.stringify(s))); return s; },
    normalizePostHistoryStatus: (s) => String(s || 'posted'),
    normalizePostHistoryType: (t) => (t === 'thread' ? 'thread' : 'reply'),
    normalizePostHistoryText: (t) => String(t || ''),
    hashPostHistoryText: (t) => 'h:' + String(t || '').slice(0, 8),
    logPostHistory: () => {}
  };
  sb.globalThis = sb;
  vm.createContext(sb);
  vm.runInContext(
    extractFunction('mergePostHistoryShadowIntoSnapshot') + '\n' + extractFunction('upsertPostHistoryRecord') +
    '\nglobalThis.__u = upsertPostHistoryRecord;',
    sb
  );
  return { upsert: sb.__u, writes };
}

function testUpsertBlockedByTombstone() {
  const store = {
    items: {}, index: {}, order: [],
    tombstones: { k1: { deletedAt: Date.now() - 1000, origin: 'local', purged: false, revivedAt: null, record: { contentText: '旧', submittedAt: 1000, page: 1, type: 'reply', localId: 'k1' } } }
  };
  const { upsert, writes } = loadUpsert(store);
  upsert({ localId: 'k1', type: 'reply', contentText: '新内容', submittedAt: 2000, page: 5, status: 'posted' });
  assert.strictEqual(Object.keys(store.items).length, 0, '有未复活墓碑 → 不得重建影子条目');
  assert.strictEqual(store.order.length, 0, '不得回到主列表');
  assert.strictEqual(store.tombstones.k1.record.contentText, '新内容', '应把新信息并入墓碑快照');
  assert.strictEqual(store.tombstones.k1.record.page, 5, '快照页码同步取更大者');
  assert.strictEqual(writes.length, 1, '仍需落盘（快照已更新）');
}

function testUpsertAllowedWhenPurgedOrRevived() {
  // purged（彻底删除）后重写 → 允许（用户已彻底删除，语义上视为全新记录）
  const storeA = { items: {}, index: {}, order: [], tombstones: { k1: { deletedAt: 1, purged: true } } };
  const a = loadUpsert(storeA);
  a.upsert({ localId: 'k1', type: 'reply', contentText: 'x', submittedAt: 2000, page: 1, status: 'posted' });
  assert.strictEqual(Object.keys(storeA.items).length, 1, 'purged 墓碑不拦写入');
  // 已恢复（revivedAt）→ 正常写入
  const storeB = { items: {}, index: {}, order: [], tombstones: { k1: { deletedAt: 1, purged: false, revivedAt: Date.now() } } };
  const b = loadUpsert(storeB);
  b.upsert({ localId: 'k1', type: 'reply', contentText: 'y', submittedAt: 3000, page: 2, status: 'posted' });
  assert.strictEqual(Object.keys(storeB.items).length, 1, '已恢复的墓碑不拦写入');
  // 无墓碑 → 正常写入
  const storeC = { items: {}, index: {}, order: [], tombstones: {} };
  const c = loadUpsert(storeC);
  c.upsert({ localId: 'k2', type: 'reply', contentText: 'z', submittedAt: 4000, page: 1, status: 'posted' });
  assert.strictEqual(Object.keys(storeC.items).length, 1, '无墓碑正常写入');
  assert.strictEqual(storeC.order.join(','), 'k2', '并置于列表首位');
}

// ── 3. 归一化一次性归并历史遗留影子（源码契约 + 顺序） ──
function testNormalizeConsolidatesLegacyShadow() {
  const norm = src.slice(src.indexOf('function normalizePostHistoryStore('), src.indexOf('function mergePostHistoryShadowIntoSnapshot(') > -1 ? undefined : undefined);
  const body = src.slice(src.indexOf('function normalizePostHistoryStore('));
  const mergeIdx = body.indexOf('t.record = mergePostHistoryShadowIntoSnapshot(t.record, shadow);');
  const purgeIdx = body.indexOf('if (t.purged) {');
  const dropIdx = body.indexOf('delete store.items[tKey];');
  assert(mergeIdx !== -1 && dropIdx !== -1, '归一化必须把遗留影子归并并移除');
  assert(purgeIdx !== -1 && mergeIdx < purgeIdx, '归并必须早于 TTL 降级（否则快照被降级后影子数据丢失）');
  assert(body.includes('if (!t || typeof t !== \'object\' || t.purged || t.revivedAt) return;'), '只处理未复活的墓碑');
  void norm;
}

// ── 3b. 归一化行为：遗留影子被归并进墓碑并从列表移除 ──
function loadNormalize() {
  const sb = {
    console, Date, Number, String, Math, Object, Array, JSON, Infinity, isFinite,
    POST_HISTORY_STORE_VERSION: 3,
    POST_HISTORY_TOMBSTONE_TTL_MS: 30 * 24 * 3600 * 1000,
    POST_HISTORY_TOMBSTONE_HARD_TTL_MS: 180 * 24 * 3600 * 1000,
    POST_HISTORY_LIMIT: Infinity,
    POST_HISTORY_THREAD_LIMIT: 500,
    POST_HISTORY_REPLY_LIMIT: 500,
    hashPostHistoryText: (t) => 'h:' + String(t || '').slice(0, 8),
    createDefaultPostHistoryStore: () => ({ version: 1, items: {}, index: {}, order: [], tombstones: {} }),
    postHistoryIndexFingerprint: (item) => 'fp:' + String(item && item.localId || ''),
    buildPostHistoryIndexEntry: (item) => ({ type: item.type, status: item.status, fp: 'fp:' + item.localId }),
    normalizePostHistoryStatus: (s2) => (['pending', 'confirmed', 'unconfirmed', 'failed'].includes(s2) ? s2 : 'pending'),
    normalizePostHistoryType: (t) => (t === 'reply' ? 'reply' : 'thread'),
    normalizePostHistoryFid: (f) => String(f || ''),
    getPostHistoryForumNameByFid: () => '',
    normalizePostHistoryText: (t) => String(t || '')
  };
  sb.globalThis = sb;
  vm.createContext(sb);
  vm.runInContext(extractFunction('mergePostHistoryShadowIntoSnapshot') + '\n' + extractFunction('normalizePostHistoryStore') + '\nglobalThis.__n = normalizePostHistoryStore;', sb);
  return sb.__n;
}

function testNormalizeDropsLegacyShadow() {
  const normalize = loadNormalize();
  const mk = (tombExtra) => ({
    version: 3, index: {}, items: { p1: { localId: 'p1', type: 'reply', status: 'confirmed', contentText: '删除后被写回的新内容', submittedAt: 1700000000000, page: 3 } },
    order: ['p1'],
    tombstones: { p1: Object.assign({ deletedAt: Date.now() - 3600000, origin: 'local', purged: false, revivedAt: null, record: { localId: 'p1', type: 'reply', status: 'confirmed', contentText: '被删的老内容', submittedAt: 1700000000000, page: 1 } }, tombExtra || {}) }
  });
  // 未复活墓碑 + 影子 → 归并并从列表移除
  const a = normalize(mk());
  assert.strictEqual(a.items.p1, undefined, '遗留影子必须从 items 移除（不再回到主列表）');
  assert.strictEqual((a.order || []).includes('p1'), false, 'order 也必须移除');
  assert.strictEqual(a.tombstones.p1.record.contentText, '删除后被写回的新内容', '新内容并入墓碑快照');
  assert.strictEqual(a.tombstones.p1.record.page, 3, '快照页码取更大者');
  // 已恢复(revivedAt) → 不归并（该条已回到列表）
  const b = normalize(mk({ revivedAt: Date.now() - 1000 }));
  assert(a.tombstones.p1.revivedAt === null, '未复活态不做 revivedAt 处理');
  // 彻底删除(purged) → 不归并（该墓碑已无快照语义）
  const c = normalize(mk({ purged: true }));
  assert(c.tombstones.p1.purged === true, 'purged 墓碑保持');
}

// ── 4. 垃圾桶标识 hover：图标也要红 ──
function testTrashMarkHoverTurnsIconRed() {
  assert(src.includes('stroke="currentColor"'), '垃圾桶 SVG 必须用 currentColor（跟随文字色）');
  assert(src.includes(':root.xdex-darkreader-active .xdex-history-tombstone-mark:hover'), '深色上下文必须补 hover 规则（否则被 0,3,0 的 color 规则压过）');
  assert(src.includes(':root.xdex-darkreader-active .xdex-post-history-tombstone-mark:hover'), '发言历史同样补齐');
  const hoverBlock = src.slice(src.indexOf('.xdex-history-tombstone-mark:hover'), src.indexOf('.xdex-recycle-sort'));
  assert(hoverBlock.includes('color:#EE0000 !important'), 'hover 的图标色需 !important 才能压过深色规则');
  assert(hoverBlock.includes('border-color:#EE0000 !important'), '圆周边框同样保持红色');
}

const tests = [testMergePrefersNewer, testNormalizeDropsLegacyShadow, testUpsertBlockedByTombstone, testUpsertAllowedWhenPurgedOrRevived, testNormalizeConsolidatesLegacyShadow, testTrashMarkHoverTurnsIconRed];

let failed = 0;
tests.forEach((fn) => {
  try { fn(); console.log('  PASS ' + fn.name); }
  catch (e) { failed += 1; console.error('  FAIL ' + fn.name + '\n       ' + ((e && e.message) || e)); }
});
if (failed) { console.error(failed + ' / ' + tests.length + ' 项失败'); process.exit(1); }
console.log('post history tombstone contract ok');
