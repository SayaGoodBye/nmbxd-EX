// WebDAV 浏览历史“基线增量”合并的回归测试
// 覆盖三个已修复缺陷：
//   F1 裸上传（远端缺失/无效）后未推进基线 → 下轮把整份本地计数当新增再加一遍
//   F2 基线从未建立但本端已同步过 → 整份旧计数被计为新增，各端逐轮倍增
//   F3 远端缺该 key 时沿用 mergedCount(=0+本地−基线) → 已同步条目被清零
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const SRC = path.join(root, 'src/content/nmbxd-EX-for-edit.user.js');
const src = fs.readFileSync(SRC, 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// 提取（含 async 前缀）函数体，保留完整文本
function extractFn(name) {
  let start = src.indexOf('async function ' + name);
  if (start === -1) start = src.indexOf('function ' + name);
  assert(start !== -1, `function ${name} must exist`);
  const braceOpen = src.indexOf('{', start);
  let depth = 0;
  for (let i = braceOpen; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  throw new Error('unbalanced ' + name);
}

const STORE_KEY = 'xdex_thread_history';
const BASE_KEY = 'xdex_webdav_history_baselines';
const CFG_KEY = 'xdex_webdav_config';
const K = 'normal:64180270';

const mkItem = (c) => ({ key: K, mode: 'normal', threadId: '64180270', title: 'T', page: 1, maxVisitedPage: 1, lastKnownPage: 1, url: 'https://www.nmbxd1.com/t/64180270', firstVisitedAt: 1, lastVisitedAt: 1000, visitCount: c });
const mkStore = (c) => ({ version: 1, limit: Infinity, items: { [K]: mkItem(c) }, index: {}, order: [K], tombstones: {} });
const EMPTY_STORE = { version: 1, limit: Infinity, items: {}, index: {}, order: [], tombstones: {} };

// 每个“端”一份独立 GM 存储；active 指向当前端
function makeSandbox(activeRef) {
  const sandbox = {
    console: { log: () => {}, warn: () => {}, error: () => {} },
    Date, Math, JSON, Object, Array, Number, String, Set, Map, Infinity, isNaN, parseInt, parseFloat,
    encodeURIComponent, decodeURIComponent,
    location: { href: 'https://www.nmbxd1.com/t/123' },
    GM_getValue: (k, d) => (activeRef.map.has(k) ? JSON.parse(JSON.stringify(activeRef.map.get(k))) : d),
    GM_setValue: (k, v) => { activeRef.map.set(k, JSON.parse(JSON.stringify(v))); },
    WEBDAV_CONFIG_KEY: CFG_KEY,
    WEBDAV_SYNC_FILE: 'xdex-webdav-sync.json',
    createDefaultThreadHistoryStore: () => ({ version: 1, limit: Infinity, items: {}, index: {}, order: [], tombstones: {} }),
    THREAD_HISTORY_STORE_VERSION: 1, THREAD_HISTORY_LIMIT: Infinity,
    THREAD_HISTORY_TOMBSTONE_TTL_MS: 2592000000, THREAD_HISTORY_TOMBSTONE_HARD_TTL_MS: 8640000000,
    parseThreadHistoryUrl: (u) => { const m = String(u).match(/[?&]page=(\d+)/); return m ? { page: Number(m[1]) } : null; },
    getThreadHistoryKey: (m, i) => m + ':' + i,
    notifyThreadHistoryStoreChanged: () => {},
    threadHistoryIndexFingerprint: (it) => JSON.stringify([it && it.threadId, it && it.title, it && it.mode]),
    setThreadHistoryStore: (s) => { sandbox.GM_setValue(STORE_KEY, s); return sandbox.api.normalizeThreadHistoryStore(s); },
    setPostHistoryStore: (s) => s,
    mergePostHistoryStore: (a) => a,
    mergeSettingsForWebdavUpload: (a) => a,
    webdavBaseUrl: () => 'https://dav.example.com/xdex/',
    // 桩网络层：GET 读 remote.valid/remote.store，PUT 记录载荷并写回远端
    webdavRequest: async (details) => {
      if (details.method === 'GET') {
        if (!sandbox.__remote.valid) return { status: 404, responseText: '' };
        return { status: 200, responseText: JSON.stringify({ meta: { exportedAt: new Date().toISOString() }, payload: { threadHistory: sandbox.__remote.store } }) };
      }
      const body = JSON.parse(details.body);
      sandbox.__remote.store = body.payload.threadHistory;
      sandbox.__remote.valid = true;
      sandbox.__putCount += 1;
      return { status: 201 };
    },
    getWebdavUtils: () => sandbox.__utils,
    __remote: { valid: true, store: null },
    __putCount: 0,
  };
  vm.createContext(sandbox);
  const code = ['normalizeThreadHistoryStore', 'threadHistoryIndexFingerprint', 'buildThreadHistoryIndexEntry',
    'getThreadHistoryKey', 'buildThreadHistoryPageUrl', 'getWebdavHistoryBaselines', 'webdavFullSelection',
    'saveWebdavHistoryBaselinesFromStore', 'mergeThreadHistoryStoreWebdav'].map(extractFn).join('\n');
  vm.runInContext(code + '\nthis.api={normalizeThreadHistoryStore,mergeThreadHistoryStoreWebdav,getWebdavHistoryBaselines,saveWebdavHistoryBaselinesFromStore};', sandbox);
  vm.runInContext(extractFn('webdavUploadLocal') + '\nthis.uploadLocal=webdavUploadLocal;', sandbox);
  const api = sandbox.api;
  sandbox.__utils = {
    buildFullExportFile: () => ({ file: { meta: {}, payload: { threadHistory: api.normalizeThreadHistoryStore(sandbox.GM_getValue(STORE_KEY, null)) } } }),
    parseFullExportFile: (text) => { try { const d = JSON.parse(text); return { valid: !!(d && d.payload), data: d }; } catch (e) { return { valid: false, error: e.message }; } },
    mergeThreadHistoryStoreWebdav: api.mergeThreadHistoryStoreWebdav,
    getWebdavHistoryBaselines: api.getWebdavHistoryBaselines,
    saveWebdavHistoryBaselinesFromStore: api.saveWebdavHistoryBaselinesFromStore,
    mergePostHistoryStore: sandbox.mergePostHistoryStore,
    mergeSettingsForWebdavUpload: sandbox.mergeSettingsForWebdavUpload,
  };
  return sandbox;
}

// ─────────── F3：远端缺该 key 时不得清零 ───────────
test('F3 远端缺该 key：保留本地计数，不把已同步值算成 0', () => {
  const ref = { map: new Map() };
  const S = makeSandbox(ref);
  ref.map.set(STORE_KEY, mkStore(1463));
  ref.map.set(BASE_KEY, { threadHistory: { [K]: { count: 1463, at: 1 } } });
  const local = S.api.normalizeThreadHistoryStore(S.GM_getValue(STORE_KEY, null));
  const merged = S.api.mergeThreadHistoryStoreWebdav(local, S.api.normalizeThreadHistoryStore(EMPTY_STORE), S.api.getWebdavHistoryBaselines());
  assert(merged.items[K], '条目不得丢失');
  assert(merged.items[K].visitCount === 1463, `期望 1463（保留本地），实际 ${merged.items[K].visitCount}`);
});

test('F3 未同步过的新 key 仍按全量计入（不误伤）', () => {
  const ref = { map: new Map() };
  const S = makeSandbox(ref);
  ref.map.set(STORE_KEY, mkStore(20));
  const local = S.api.normalizeThreadHistoryStore(S.GM_getValue(STORE_KEY, null));
  const merged = S.api.mergeThreadHistoryStoreWebdav(local, S.api.normalizeThreadHistoryStore(EMPTY_STORE), S.api.getWebdavHistoryBaselines());
  assert(merged.items[K].visitCount === 20, `期望 20，实际 ${merged.items[K].visitCount}`);
});

// ─────────── F1：裸上传后推进基线 ───────────
test('F1 远端缺失时裸上传成功后推进基线到本次上传值', async () => {
  const ref = { map: new Map() };
  const S = makeSandbox(ref);
  ref.map.set(STORE_KEY, mkStore(1463));
  ref.map.set(CFG_KEY, { lastSyncAt: 111 });
  S.__remote.valid = false;
  await S.uploadLocal({ url: 'https://dav.example.com/xdex' }, {});
  const bl = S.GM_getValue(BASE_KEY, null);
  assert(S.__putCount === 1, '应发生一次 PUT');
  assert(bl && bl.threadHistory && bl.threadHistory[K], '裸上传后必须写入基线');
  assert(bl.threadHistory[K].count === 1463, `期望基线 1463，实际 ${bl.threadHistory[K].count}`);
});

test('F1 上传失败时不得推进基线', async () => {
  const ref = { map: new Map() };
  const S = makeSandbox(ref);
  ref.map.set(STORE_KEY, mkStore(1463));
  S.__remote.valid = false;
  const origRequest = S.webdavRequest;
  S.webdavRequest = async (d) => (d.method === 'GET' ? { status: 404, responseText: '' } : { status: 500 });
  await S.uploadLocal({ url: 'https://dav.example.com/xdex' }, {});
  const bl = S.GM_getValue(BASE_KEY, null);
  assert(!bl || !bl.threadHistory || !bl.threadHistory[K], 'PUT 失败后不得写入基线');
  S.webdavRequest = origRequest;
});

// ─────────── F2：基线缺失的迁移兜底 ───────────
test('F2 守卫存在，且仅在“基线未建立 + 本端曾同步过”时按本地重建基线', () => {
  const guardStart = src.indexOf('let baselines = getWebdavHistoryBaselines();');
  const guardEnd = src.indexOf('merged = mergeThreadHistoryStoreWebdav(local,', guardStart);
  assert(guardStart !== -1 && guardEnd !== -1, '迁移守卫块必须存在');
  const guard = src.slice(guardStart, guardEnd);

  const runGuard = (map) => {
    const ref = { map };
    const S = makeSandbox(ref);
    S.local = S.api.normalizeThreadHistoryStore(S.GM_getValue(STORE_KEY, null));
    vm.runInContext('(function(){' + guard + ' this.__baselines = baselines; })();', S, { filename: 'f2guard.js' });
    return S.__baselines;
  };

  // 曾同步过 + 基线未建立 → 应重建基线（delta 归零）
  const mapSynced = new Map();
  mapSynced.set(STORE_KEY, mkStore(1463));
  mapSynced.set(CFG_KEY, { lastSyncAt: 111 });
  const b1 = runGuard(mapSynced);
  assert(b1 && b1.threadHistory && b1.threadHistory[K], '曾同步过时必须重建基线');
  assert(b1.threadHistory[K].count === 1463, `重建基线应为本地值 1463，实际 ${b1.threadHistory[K].count}`);

  // 从未同步过（新端）→ 不得重建，本地计数应作为新增
  const mapFresh = new Map();
  mapFresh.set(STORE_KEY, mkStore(375));
  const b2 = runGuard(mapFresh);
  assert(!b2 || !b2.threadHistory, '新端不得重建基线，否则其本地计数会被吞掉');
});

// ─────────── 端到端：多端不再倍增 ───────────
test('E2E 4 端·基线缺失·远端同值 → 不倍增', () => {
  const ref = { map: new Map() };
  const S = makeSandbox(ref);
  const guardStart = src.indexOf('let baselines = getWebdavHistoryBaselines();');
  const guard = src.slice(guardStart, src.indexOf('merged = mergeThreadHistoryStoreWebdav(local,', guardStart));

  const ends = [1, 2, 3, 4].map(() => {
    const m = new Map();
    m.set(STORE_KEY, mkStore(1463));
    m.set(CFG_KEY, { lastSyncAt: 111 });
    return m;
  });
  S.__remote.valid = true;
  S.__remote.store = mkStore(1463);

  for (const m of ends) {
    ref.map = m;
    S.local = S.api.normalizeThreadHistoryStore(S.GM_getValue(STORE_KEY, null));
    S.__remoteTH = S.__remote.store;
    vm.runInContext('(function(){' + guard + `
      __m = mergeThreadHistoryStoreWebdav(local, normalizeThreadHistoryStore(__remoteTH), baselines);
      __m = normalizeThreadHistoryStore(__m);
      GM_setValue('${STORE_KEY}', __m);
      saveWebdavHistoryBaselinesFromStore(__m, baselines);
    })();`, S, { filename: 'e2e.js' });
    S.__remote.store = S.api.normalizeThreadHistoryStore(S.GM_getValue(STORE_KEY, null));
  }
  const v = S.api.normalizeThreadHistoryStore(ends[3].get(STORE_KEY)).items[K].visitCount;
  assert(v === 1463, `4 端依次同步后应仍为 1463，实际 ${v}（倍增即为此前缺陷）`);
});

let failed = 0;
(async () => {
  for (const [name, fn] of tests) {
    try { await fn(); console.log(`ok - ${name}`); }
    catch (e) { failed++; console.error(`FAIL - ${name}: ${e.message}`); }
  }
  if (failed) { console.error(`${failed} test(s) failed`); process.exit(1); }
  console.log('webdav baseline contract ok');
})();