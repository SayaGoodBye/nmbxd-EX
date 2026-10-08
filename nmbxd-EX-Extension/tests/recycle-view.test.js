// 回收站视图契约测试
// 覆盖：已恢复(revivedAt)的墓碑不得出现在回收站列表；purged 仍排除；待删除项保留；
//       角标/计数与列表同源；恢复后墓碑保留（供 WebDAV 传播）
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');
function assert(c, m) { if (!c) throw new Error(m); }

function extractFn(name) {
  const i = src.indexOf('function ' + name);
  assert(i !== -1, `function ${name} must exist`);
  const j = src.indexOf('\n  function ', i + 10);
  return src.slice(i, j);
}

function runList(block, store, fnName, ttlName) {
  const sb = {
    getThreadHistoryStore: () => store,
    getPostHistoryStore: () => store,
    threadHistoryRecycleSort: 'recent',
    postHistoryRecycleSort: 'recent',
    THREAD_HISTORY_TOMBSTONE_TTL_MS: 30 * 86400000,
    POST_HISTORY_TOMBSTONE_TTL_MS: 30 * 86400000,
    Date, Object, Number, Array,
  };
  sb.globalThis = sb;
  vm.createContext(sb);
  vm.runInNewContext(block + `\nthis.list = ${fnName};`, sb, { filename: 'recycle.js' });
  return sb.list();
}

function makeStore() {
  return {
    tombstones: {
      pending: { deletedAt: Date.now() - 1000, purged: false, revivedAt: null, record: { title: '待删除' } },
      revived: { deletedAt: Date.now() - 2000, purged: false, revivedAt: Date.now(), record: null },
      purged: { deletedAt: Date.now() - 3000, purged: true, revivedAt: null },
    },
  };
}

function testThreadHistoryFiltersRevived() {
  const list = runList(extractFn('getThreadHistoryTombstoneList'), makeStore(), 'getThreadHistoryTombstoneList');
  assert(list.length === 1, `only the pending tombstone must remain, got ${list.length}`);
  assert(list[0].key === 'pending', `pending tombstone must survive, got ${list[0].key}`);
}

function testPostHistoryFiltersRevived() {
  const list = runList(extractFn('getPostHistoryTombstoneList'), makeStore(), 'getPostHistoryTombstoneList');
  assert(list.length === 1, `only the pending tombstone must remain, got ${list.length}`);
  assert(list[0].key === 'pending', `pending tombstone must survive, got ${list[0].key}`);
}

function testFilterCondition() {
  ['getThreadHistoryTombstoneList', 'getPostHistoryTombstoneList'].forEach((fn) => {
    const block = extractFn(fn);
    assert(block.includes('!tombs[key].purged'), `${fn} must still exclude purged tombstones`);
    assert(block.includes('!tombs[key].revivedAt'), `${fn} must exclude revived tombstones`);
  });
}

function testRestoreKeepsTombstoneForSync() {
  // 恢复后墓碑必须保留（revivedAt 供 WebDAV 传播），而不是被删除
  ['restoreThreadHistoryFromTombstone', 'restorePostHistoryFromTombstone'].forEach((fn) => {
    const i = src.indexOf('function ' + fn);
    if (i === -1) return; // 发言历史可能复用同一实现，容忍缺失
    const j = src.indexOf('\n  function ', i + 10);
    const block = src.slice(i, j);
    assert(block.includes('revivedAt'), `${fn} must mark the tombstone as revived (sync propagation)`);
    assert(!/delete store\.tombstones\[key\]/.test(block), `${fn} must not delete the tombstone (needed for propagation)`);
  });
}

function testBadgeSharesListSource() {
  // 角标与栏计数必须复用同一列表函数（修复后自动同步）
  const calls = (src.match(/getThreadHistoryTombstoneList\(\)/g) || []).length;
  const postCalls = (src.match(/getPostHistoryTombstoneList\(\)/g) || []).length;
  assert(calls >= 3, `thread history list must be shared by view/count/badge, got ${calls} refs`);
  assert(postCalls >= 3, `post history list must be shared by view/count/badge, got ${postCalls} refs`);
}

function testNoDuplicateFilterImplementations() {
  // 不得存在其它地方重复实现墓碑过滤（避免漏改）
  const matches = src.match(/!tombs\[key\]\.purged/g) || [];
  assert(matches.length === 2, `exactly two tombstone filters expected, got ${matches.length}`);
}

function testCardTrashMarksSkipRevived() {
  // 卡片上的垃圾桶角标与列表同源：已恢复的墓碑不得再显示角标（否则点击进入回收站会找不到条目）
  const marks = src.match(/const tomb = \(get(?:Thread|Post)HistoryStore\(\)\.tombstones \|\| \{\}\)\[result\.key\];\s*\n\s*if \(tomb && !tomb\.purged && !tomb\.revivedAt\)/g) || [];
  assert(marks.length === 2, `both card trash marks must exclude revived tombstones, got ${marks.length}`);
  // 不允许存在只判断 purged 的角标条件
  const stale = src.match(/const tomb = \(get(?:Thread|Post)HistoryStore\(\)\.tombstones \|\| \{\}\)\[result\.key\];\s*\n\s*if \(tomb && !tomb\.purged\)/g) || [];
  assert(stale.length === 0, `stale trash-mark condition found (missing revivedAt): ${stale.length}`);
}

function testAllTombstoneConsumersHandleRevived() {
  // 所有消费 tombstones 的判定点都必须考虑 revivedAt（除恢复/删除/过期等有意处理的路径）
  const lines = src.split('\n');
  const offenders = [];
  lines.forEach((l, i) => {
    if (!/tombstones/.test(l)) return;
    if (!/purged/.test(l)) return;
    if (/revivedAt/.test(l)) return;
    // 允许：清理/写入墓碑本身的行（赋值、purged 置位）
    if (/store\.tombstones\[/.test(l) && /=/.test(l)) return;
    if (/if \(t\.purged\)/.test(l)) return; // 过期清理内部
    if (/setPostHistoryStore|setThreadHistoryStore/.test(l)) return;
    offenders.push(`L${i + 1}: ${l.trim().slice(0, 120)}`);
  });
  assert(offenders.length === 0, `tombstone consumers missing revivedAt handling:\n${offenders.join('\n')}`);
}

const tests = [
  testThreadHistoryFiltersRevived,
  testPostHistoryFiltersRevived,
  testFilterCondition,
  testRestoreKeepsTombstoneForSync,
  testBadgeSharesListSource,
  testNoDuplicateFilterImplementations,
  testCardTrashMarksSkipRevived,
  testAllTombstoneConsumersHandleRevived,
];
for (const t of tests) t();
console.log('recycle view contract ok');
