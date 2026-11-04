// 分组顺序传播契约测试
// 覆盖：键提取（双键）、快照、重排（未列入追加末尾）、合并（at 新者胜/单端缺失）、
//       接入两条合并路径、拖拽写 meta、静默传播（WebDAV skip）、defaults 声明
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');
function assert(c, m) { if (!c) throw new Error(m); }

function loadOrderModule() {
  const s0 = src.indexOf('  const GROUP_ORDER_FIELDS = [');
  const s1 = src.indexOf('  // 从行 DOM 提取语义键');
  assert(s0 !== -1 && s1 !== -1 && s0 < s1, 'order module must be extractable');
  const block = src.slice(s0, s1);
  assert(block.includes('function mergeGroupOrdersInto'), 'block must contain all five helpers');
  const sb = { console: { log() { }, warn() { } } };
  sb.globalThis = sb;
  vm.createContext(sb);
  vm.runInNewContext(block + '\nthis.K=groupOrderKeysOf; this.S=groupOrderSnapshot; this.A=applyGroupOrder; this.M=mergeGroupOrderMeta; this.MI=mergeGroupOrdersInto;', sb, { filename: 'order.js' });
  return sb;
}

function testDeclaredInDefaults() {
  assert(/groupOrderMeta:\s*\{\}/.test(src), 'defaults must declare groupOrderMeta (init prunes unknown fields)');
}

function testSilentPropagation() {
  const i = src.indexOf('WEBDAV_SETTINGS_SKIP_KEYS = new Set([');
  const block = src.slice(i, src.indexOf(']);', i));
  assert(block.includes("'groupOrderMeta'"), 'groupOrderMeta must be skipped by the WebDAV diff (silent propagation)');
}

function testKeyExtractionDoubleKey() {
  const sb = loadOrderModule();
  const k = sb.K('markedGroups', { desc: '组A', cookies: ['a', 'b'] });
  assert(k[0] === 'd:组A', 'desc must be the primary key');
  assert(k[1] === 'c:a,b', 'cookies must be the fallback key (joined)');
  const k2 = sb.K('markedGroups', { desc: '', cookies: ['x'] });
  assert(k2[0] === 'c:x', 'cookie-only group must key on cookies');
}

function testKeyExtractionPerField() {
  const sb = loadOrderModule();
  assert(sb.K('favoriteThreads', { desc: 'd', threadId: '12345678' }).includes('i:12345678'), 'favoriteThreads keys on threadId');
  assert(sb.K('subscriptionFeeds', { desc: 'd', uuid: 'u1' }).includes('u:u1'), 'subscriptionFeeds keys on uuid');
  assert(sb.K('threadCookieWhitelistGroups', { desc: 'd', threads: ['1', '2'] }).includes('t:1,2'), 'whitelist keys on threads');
  assert(sb.K('blockedKeywords', { value: 'kw', regex: true }).includes('k:r:kw'), 'keywords key on value+regex flag');
  assert(sb.K('blockedKeywords', { value: 'kw', regex: false }).includes('k:kw'), 'plain keyword key without regex flag');
}

function testSnapshotAndReorder() {
  const sb = loadOrderModule();
  const arr = [{ desc: 'A' }, { desc: 'B' }, { desc: 'C' }];
  const snap = sb.S('favoriteThreads', [{ threadId: '1' }, { threadId: '2' }]);
  assert(snap.join('|') === 'i:1|i:2', `snapshot must follow array order, got ${snap.join('|')}`);
  const out = sb.A('markedGroups', arr, ['d:C', 'd:A', 'd:B']);
  assert(out.map(x => x.desc).join('') === 'CAB', `reorder must follow the order vector, got ${out.map(x => x.desc).join('')}`);
}

function testUnlistedAppendedAtEnd() {
  const sb = loadOrderModule();
  const arr = [{ desc: 'A' }, { desc: 'B' }, { desc: 'D' }];
  const out = sb.A('markedGroups', arr, ['d:B', 'd:A']);
  assert(out.map(x => x.desc).join('') === 'BAD', `unlisted items must append at the end, got ${out.map(x => x.desc).join('')}`);
}

function testDoubleKeyMatchingSurvivesDescAddition() {
  const sb = loadOrderModule();
  // order 记录的是 cookies 键（当时无备注），此后该组补了备注 → 仍应命中
  const arr = [{ desc: '新备注', cookies: ['z'] }, { desc: 'B', cookies: ['2'] }];
  const out = sb.A('markedGroups', arr, ['c:z', 'd:B']);
  assert(out[0].cookies[0] === 'z', 'cookie key must still match after a desc is added');
}

function testMergePrefersNewer() {
  const sb = loadOrderModule();
  const L = { order: ['d:A'], at: 1000 };
  const R = { order: ['d:B'], at: 2000 };
  assert(sb.M(L, R) === R, 'newer remote must win');
  assert(sb.M(R, L) === R, 'newer local must win');
  assert(sb.M(L, { order: [], at: 500 }) === L, 'older remote must lose');
}

function testMergeSingleSide() {
  const sb = loadOrderModule();
  assert(sb.M(null, { order: [], at: 1 }).at === 1, 'missing local → use remote');
  assert(sb.M({ order: [], at: 1 }, null).at === 1, 'missing remote → use local');
  assert(sb.M(null, null) === null, 'both missing → null');
}

function testMergeIntoEndToEnd() {
  const sb = loadOrderModule();
  const result = { markedGroups: [{ desc: 'A', cookies: ['1'] }, { desc: 'B', cookies: ['2'] }] };
  const local = { groupOrderMeta: { markedGroups: { order: ['d:A', 'd:B'], at: 100 } } };
  const remote = { groupOrderMeta: { markedGroups: { order: ['d:B', 'd:A'], at: 200 } } };
  sb.MI(result, local, remote);
  assert(result.markedGroups.map(x => x.desc).join('') === 'BA', 'newer remote order must be applied');
  assert(result.groupOrderMeta.markedGroups.at === 200, 'meta must adopt the winning side');
}

function testWiredIntoBothMergePaths() {
  assert(src.includes('mergeGroupOrdersInto(result, localSettings, importedSettings)'), 'full-import merge must apply group order');
  assert(src.includes('mergeGroupOrdersInto(result, localSettings, remoteSettings)'), 'webdav merge must apply group order');
}

function testDragWritesMeta() {
  const i = src.indexOf('function installRowDragSorting(');
  const block = src.slice(i, src.indexOf('function buildCookieGroupTwoFieldRowHtml('));
  assert(block.includes('field'), 'installRowDragSorting must accept a field');
  assert(block.includes('SettingPanel.state.groupOrderMeta[field] = { order, at: Date.now() }'), 'drag end must record groupOrderMeta');
  assert(block.includes('rowOrderKeyFromDom(field'), 'order vector must be read from the DOM (state is still stale at that point)');
  assert(block.includes('delete SettingPanel.state.groupOrderMeta[field]'), 'failed save must roll back the meta entry');
}

function testSixRegistrationsCarryField() {
  const fields = (src.match(/installRowDragSorting\(\{[^}]*field: '(\w+)'/g) || []);
  assert(fields.length === 6, `all six registrations must pass field, got ${fields.length}`);
  ['markedGroups', 'blockedCookies', 'threadCookieWhitelistGroups', 'blockedKeywords', 'favoriteThreads', 'subscriptionFeeds']
    .forEach(f => assert(fields.some(x => x.includes(`'${f}'`)), `registration missing field: ${f}`));
}

function testDomKeyExtractorUsesRealClasses() {
  const i = src.indexOf('function rowOrderKeyFromDom(');
  const block = src.slice(i, src.indexOf('// 通用拖拽安装'));
  ['.marked-desc-input', '.marked-cookies-input', '.blocked-desc-input', '.blocked-cookies-input',
   '.thread-cookie-whitelist-desc-input', '.thread-cookie-whitelist-threads-input',
   '.favorite-thread-desc-input', '.favorite-thread-id-input',
   '.subscription-feed-desc-input', '.subscription-feed-uuid-input', '.blocked-keyword-input']
    .forEach(sel => assert(block.includes(sel), `DOM key extractor must read ${sel}`));
  assert(block.includes('normalizeFavoriteThreadInput'), 'favourite thread key must use the same normaliser as the collector');
}

function testSettingLabelsCoverDefaults() {
  // 冲突弹窗的中文名映射必须覆盖 defaults 的全部键（未知键会回退为英文键名）
  const i = src.indexOf('defaults: {');
  let depth = 0, end = -1;
  for (let k = i + 9; k < src.length; k++) {
    if (src[k] === '{') depth++;
    else if (src[k] === '}') { depth--; if (depth === 0) { end = k; break; } }
  }
  const block = src.slice(i, end + 1);
  const keys = (block.match(/^\s{6}(\w+):/gm) || []).map(x => x.trim().replace(':', ''));
  const labelBlock = src.slice(src.indexOf('const SETTING_LABELS = {'), src.indexOf('};', src.indexOf('const SETTING_LABELS = {')));
  const missing = keys.filter(k => !labelBlock.includes(k + ':'));
  assert(missing.length === 0, `SETTING_LABELS missing keys: ${missing.join(', ')}`);
}

function testConflictDialogRendersChineseLabels() {
  const i = src.indexOf('function webdavShowSettingsConflictDialog(');
  const block = src.slice(i, i + 2600);
  assert(block.includes('getSettingLabel(k)'), 'dialog must map keys through getSettingLabel');
  assert(block.includes('<b style='), 'labels must be bold');
  assert(block.includes('font-weight:700'), 'labels must carry bold weight');
  assert(block.includes('--xdex-conflict-key, #C0392B'), 'labels must use a distinct highlight colour');
}

function testConnectionProbeCoversSyncFile() {
  // 测试连接必须同时探测同步文件 URL（目录可达 ≠ 文件可读写）
  const i = src.indexOf('async function checkWebdavConnection');
  const block = src.slice(i, src.indexOf('function setWebdavStatus', i));
  assert(block.includes('webdavBaseUrl(cfg) + WEBDAV_SYNC_FILE'), 'connection probe must also request the sync file URL');
  assert(block.includes('同步文件'), 'probe failures must be reported as sync-file issues');
  // 404（文件尚未上传）仍算连接成功
  assert(/\[200, 201, 204, 207, 301, 302, 404, 405\]\.indexOf\(rf\.status\)/.test(block),
    'sync-file probe must accept 404 as reachable');
}

function testRemoteReadFailureExplainsHttp0() {
  const i = src.indexOf("if (remote.status !== 200) {");
  const block = src.slice(i, i + 1400);
  assert(block.includes('remote.timeout'), 'HTTP 0 message must distinguish timeout');
  assert(block.includes('remote.networkError'), 'HTTP 0 message must distinguish network errors');
  assert(block.includes('remote.callError'), 'HTTP 0 message must distinguish call errors');
  assert(block.includes('hanging'), 'HTTP 0 message must distinguish the hanging-callback case');
  assert(block.includes('被脚本管理器拦截'), 'HTTP 0 message must surface script-manager interception');
}

const tests = [
  testConnectionProbeCoversSyncFile,
  testRemoteReadFailureExplainsHttp0,
  testSettingLabelsCoverDefaults,
  testConflictDialogRendersChineseLabels,
  testDeclaredInDefaults,
  testSilentPropagation,
  testKeyExtractionDoubleKey,
  testKeyExtractionPerField,
  testSnapshotAndReorder,
  testUnlistedAppendedAtEnd,
  testDoubleKeyMatchingSurvivesDescAddition,
  testMergePrefersNewer,
  testMergeSingleSide,
  testMergeIntoEndToEnd,
  testWiredIntoBothMergePaths,
  testDragWritesMeta,
  testSixRegistrationsCarryField,
  testDomKeyExtractorUsesRealClasses,
];
for (const t of tests) t();
console.log('group order propagation contract ok');
