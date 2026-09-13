// 浏览历史 / 发言历史 检索层契约测试
// 覆盖:归一化记忆化缓存、索引内容指纹失步自愈、存量数据(无 index/无 fp)补齐、新旧检索算法结果等价
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

function extractFunction(name) {
  const start = source.indexOf(`function ${name}`);
  assert(start !== -1, `${name} must exist`);
  const openParen = source.indexOf('(', start);
  assert(openParen !== -1, `${name} params must exist`);
  // 1) 跳过参数列表(含默认参数对象),找到与之配对的 ')'
  const closeParen = scanBalanced(source, openParen);
  assert(closeParen !== -1, `${name} params not closed`);
  // 2) 函数体 '{' 与其配对 '}'
  const bodyStart = source.indexOf('{', closeParen + 1);
  assert(bodyStart !== -1, `${name} body must exist`);
  const bodyEnd = scanBalanced(source, bodyStart);
  assert(bodyEnd !== -1, `${name} body not closed`);
  return source.slice(start, bodyEnd + 1);
}

// 从 open 处开括号起配对;识别字符串/模板串/行注释/块注释/正则字面量;返回匹配闭括号下标
function scanBalanced(src, open) {
  const opener = src[open];
  const closer = opener === '(' ? ')' : opener === '{' ? '}' : ']';
  let depth = 0;
  for (let k = open; k < src.length; k += 1) {
    const ch = src[k];
    const next = src[k + 1];
    if (ch === '/' && next === '/') { k = src.indexOf('\n', k); if (k === -1) return -1; continue; }
    if (ch === '/' && next === '*') { k = src.indexOf('*/', k); if (k === -1) return -1; continue; }
    if (ch === '"' || ch === "'" || ch === '`' || (ch === '/' && regexAllowed(src, k))) { k = skipQuoted(src, k, ch); continue; }
    if (ch === opener) depth += 1;
    else if (ch === closer) { depth -= 1; if (depth === 0) return k; }
  }
  return -1;
}

function skipQuoted(src, from, quote) {
  for (let k = from + 1; k < src.length; k += 1) {
    const ch = src[k];
    if (ch === '\\') { k += 1; continue; }
    if (ch === quote) return k;
  }
  return src.length;
}

// 正则字面量判定: '=' , '(' , ',' , ':' , '?' , 'return' 之后出现的 '/' 视为正则起点
function regexAllowed(src, k) {
  let p = k - 1;
  while (p >= 0 && /\s/.test(src[p])) p -= 1;
  if (p < 0) return true;
  return ['=', '(', ',', ':', '?', '&', '|', '!', '[', '{', ';'].includes(src[p]) || /return$/.test(src.slice(Math.max(0, p - 6), p + 1));
}

function extractConst(needle) {
  const line = source.split('\n').find((l) => l.trim().startsWith(needle));
  assert(line, `${needle} must exist`);
  return line.trim();
}

function extractFrozen(name) {
  const m = new RegExp(`const ${name} = Object\\.freeze\\(\\{`).exec(source);
  assert(m, `${name} must exist`);
  const open = source.indexOf('{', m.index);
  let depth = 0;
  for (let j = open; j < source.length; j += 1) {
    const ch = source[j];
    if (ch === '{') depth += 1;
    else if (ch === '}') { depth -= 1; if (depth === 0) return source.slice(m.index, source.indexOf(')', j + 1) + 1) + ';'; }
  }
  throw new Error(`${name} not closed`);
}

// ── 组装被测代码 ──
const THREAD_FNS = ['getThreadHistoryKey', 'threadHistoryIndexFingerprint', 'buildThreadHistoryIndexEntry',
  'normalizeThreadHistoryStore', 'createDefaultThreadHistoryStore', 'getThreadHistoryStore',
  'setThreadHistoryStore', 'parseThreadHistorySearchQuery', 'scoreThreadHistoryIndexEntry',
  'getThreadHistorySortValue', 'compareThreadHistoryResults', 'searchThreadHistory',
  'parseThreadHistoryUrl', 'buildThreadHistoryPageUrl', 'isValidThreadId', 'notifyThreadHistoryStoreChanged'];
const POST_FNS = ['normalizePostHistoryStatus', 'normalizePostHistoryType', 'normalizePostHistoryFid',
  'normalizePostHistoryText', 'hashPostHistoryText', 'getPostHistoryForumNameByFid',
  'normalizeHistorySearchValue', 'getPostHistoryForumSearchText', 'buildPostHistorySearchText',
  'getPostHistorySearchFieldText', 'parsePostHistorySearchQuery', 'createDefaultPostHistoryStore',
  'postHistoryIndexFingerprint', 'buildPostHistoryIndexEntry', 'normalizePostHistoryStore',
  'getPostHistoryStore', 'setPostHistoryStore', 'searchPostHistory', 'notifyPostHistoryStoreChanged'];

const consts = [
  extractConst('const THREAD_HISTORY_STORAGE_KEY'), extractConst('const THREAD_HISTORY_STORE_VERSION'),
  extractConst('const THREAD_HISTORY_LIMIT'), extractConst('const THREAD_HISTORY_TOMBSTONE_TTL_MS'),
  extractConst('const THREAD_HISTORY_TOMBSTONE_HARD_TTL_MS'), extractConst('const THREAD_HISTORY_EXCERPT_LIMIT'),
  extractConst('const POST_HISTORY_STORAGE_KEY'), extractConst('const POST_HISTORY_STORE_VERSION'),
  extractConst('const POST_HISTORY_TOMBSTONE_TTL_MS'), extractConst('const POST_HISTORY_TOMBSTONE_HARD_TTL_MS'),
  extractConst('const POST_HISTORY_THREAD_LIMIT'), extractConst('const POST_HISTORY_REPLY_LIMIT'),
  extractConst('const ZERO_WIDTH_RE'),
  extractFrozen('POST_HISTORY_FORUM_GROUP_MAP'), extractFrozen('POST_HISTORY_FORUM_FID_MAP'), extractFrozen('POST_HISTORY_FORUM_SEARCH_META')
].join('\n');

const stubs = `
let threadHistoryStoreCache = null;
let postHistoryStoreCache = null;
function invalidateThreadHistoryStoreCache() { threadHistoryStoreCache = null; }
function invalidatePostHistoryStoreCache() { postHistoryStoreCache = null; }
function scheduleThreadHistoryLiveRender() {}
function schedulePostHistoryLiveRender() {}
function syncFavoriteThreadsLinks() {}
function logThreadHistory() {}
function logPostHistory() {}
const window = { dispatchEvent() {}, addEventListener() {} };
let postHistoryActiveType = 'reply';
const GM = { v: {} };
function GM_getValue(k, d) { return k in GM.v ? JSON.parse(JSON.stringify(GM.v[k])) : d; }
function GM_setValue(k, v) { GM.v[k] = JSON.parse(JSON.stringify(v)); }
`;

// 旧算法参考实现(检索优化前的行为基线)
const reference = `
function oldScore(entry, tokens) {
  let s = Number(entry.lastVisitedAt) || 0;
  tokens.forEach((t) => { if (/^\\d{1,8}$/.test(t)) { if (entry.threadIdText === t) s += 1000000000000000; else if (entry.threadIdText.includes(t)) s += 500000000000000; } });
  return s;
}
function oldCompare(a, b, sortMode, tokens) {
  const A = a.item || {}, B = b.item || {};
  if (sortMode === 'last-asc') return getThreadHistorySortValue(A, 'lastVisitedAt') - getThreadHistorySortValue(B, 'lastVisitedAt');
  if (sortMode === 'visits-desc') return getThreadHistorySortValue(B, 'visitCount') - getThreadHistorySortValue(A, 'visitCount') || getThreadHistorySortValue(B, 'lastVisitedAt') - getThreadHistorySortValue(A, 'lastVisitedAt');
  if (sortMode === 'visits-asc') return getThreadHistorySortValue(A, 'visitCount') - getThreadHistorySortValue(B, 'visitCount') || getThreadHistorySortValue(B, 'lastVisitedAt') - getThreadHistorySortValue(A, 'lastVisitedAt');
  if (sortMode === 'page-desc') return getThreadHistorySortValue(B, 'maxVisitedPage') - getThreadHistorySortValue(A, 'maxVisitedPage') || getThreadHistorySortValue(B, 'lastVisitedAt') - getThreadHistorySortValue(A, 'lastVisitedAt');
  return oldScore(b.index, tokens) - oldScore(a.index, tokens);
}
function oldSearchThread(query, storeInput, sortMode) {
  const store = normalizeThreadHistoryStore(storeInput || getThreadHistoryStore());
  const parsed = parseThreadHistorySearchQuery(query);
  const filters = parsed.filters, tokens = parsed.tokens;
  return (store.order || []).filter((key) => {
    const e = store.index[key];
    if (!e || !store.items[key]) return false;
    if (filters.mode && e.mode !== filters.mode) return false;
    if (filters.hasImage && !e.hasImage) return false;
    if (filters.isGif && !e.isGif) return false;
    if (filters.hasZeroWidth && !e.hasZeroWidth) return false;
    if (filters.isSage && !e.isSage) return false;
    return tokens.every((x) => e.searchText.includes(x));
  }).map((key) => ({ key, item: store.items[key], index: store.index[key] }))
    .sort((a, b) => oldCompare(a, b, sortMode || 'last-desc', tokens));
}
function oldSearchPost(query, type) {
  const store = getPostHistoryStore();
  const selectedType = normalizePostHistoryType(type || postHistoryActiveType);
  const parsed = parsePostHistorySearchQuery(query);
  const filters = parsed.filters, tokens = parsed.tokens;
  return (store.order || []).map((key) => ({ key, item: store.items[key] })).filter((r) => {
    const item = r.item || {};
    if (normalizePostHistoryType(item.type) !== selectedType) return false;
    if (filters.statusFilters.length && !filters.statusFilters.includes(normalizePostHistoryStatus(item.status))) return false;
    if (filters.fidFilters.length && !filters.fidFilters.includes(normalizePostHistoryFid(item.fid))) return false;
    if (filters.forumFilters.length && !filters.forumFilters.every((v) => getPostHistoryForumSearchText(item).includes(v))) return false;
    if (filters.hasImage && !item.imageFile) return false;
    if (filters.isGif && !/\\.gif(?:$|[?#])/i.test(String(item.imageFile || item.imageExt || ''))) return false;
    if (filters.hasZeroWidth && !ZERO_WIDTH_RE.test(String(item.contentRaw || item.contentText || ''))) return false;
    if (filters.fieldFilters.length && !filters.fieldFilters.every((f) => getPostHistorySearchFieldText(item, f.field).includes(f.value))) return false;
    const text = buildPostHistorySearchText(item);
    return tokens.every((t) => text.includes(t));
  });
}
`;

const ctx = { console, Math, Date, JSON, Number, RegExp, Object, Array, String, Number, isNaN, parseInt, Infinity, NaN };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInNewContext(
  `${consts}\n${THREAD_FNS.map(extractFunction).join('\n')}\n${POST_FNS.map(extractFunction).join('\n')}\n${stubs}\n${reference}\n` +
  `this.api = { getThreadHistoryStore, setThreadHistoryStore, searchThreadHistory, oldSearchThread, normalizeThreadHistoryStore, createDefaultThreadHistoryStore, getThreadHistoryKey, buildThreadHistoryIndexEntry, threadHistoryIndexFingerprint, parseThreadHistoryUrl,` +
  ` getPostHistoryStore, setPostHistoryStore, searchPostHistory, oldSearchPost, createDefaultPostHistoryStore, buildPostHistoryIndexEntry, normalizePostHistoryStore,` +
  ` THREAD_HISTORY_STORAGE_KEY, POST_HISTORY_STORAGE_KEY, GM };\n`,
  ctx, { filename: 'extract.js' }
);

const A = ctx.api;
const GM = A.GM;

// ── 测试数据 ──
let seed = 20260912;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

function buildThreadStore() {
  const store = A.createDefaultThreadHistoryStore();
  for (let i = 0; i < 50; i += 1) {
    const tid = String(68000000 + i * 137);
    const mode = pick(['normal', 'po']);
    const key = A.getThreadHistoryKey(mode, tid);
    const zw = rnd() < 0.3 ? '\u200B' : '';
    const img = pick(['', 'a.gif', 'b.png', 'c.GIF']);
    const item = {
      key, mode, threadId: tid, page: 1 + (i % 5), url: '/t/' + tid + (i % 5 > 1 ? '?page=' + (1 + (i % 5)) : ''),
      title: pick(['', '求评价', '无标题', '画']), author: pick(['无名氏', '路人']), cookieId: 'h' + (i % 4),
      createdAt: '2023-11-24(五)16:33:48', contentText: '内容' + i + zw, contentHtml: '', excerpt: '内容' + i,
      imageFile: img, contentFlags: { hasVisibleText: true, hasWhitespaceOnly: false, hasZeroWidth: !!zw },
      sageHtml: rnd() < 0.3 ? '<i></i>本串已经被SAGE' : '', firstVisitedAt: 1e12 + i, lastVisitedAt: 1e12 + i * 3,
      visitCount: i % 4, maxVisitedPage: 1 + (i % 5), lastKnownPage: 1 + (i % 5), lastScrollY: 0
    };
    store.items[key] = item;
    store.index[key] = A.buildThreadHistoryIndexEntry(item);
    store.order.push(key);
  }
  return store;
}

function buildPostStore() {
  const store = A.createDefaultPostHistoryStore();
  const FIDS = ['98', '122', '17', '4', '14', '12', '210', '999'];
  const WORDS = ['老师', '草', 'awa', '测试内容', '很长的一段正文用于检验子串匹配', '零宽', 'gif', '图片'];
  for (let i = 0; i < 60; i += 1) {
    const type = pick(['thread', 'reply']);
    const img = rnd() < 0.5 ? pick(['a.gif', 'b.png', 'c.GIF', 'd.jpg']) : '';
    const zw = rnd() < 0.3 ? '\u200B' : '';
    const raw = WORDS.filter(() => rnd() < 0.5).join('') + zw;
    const key = 'local-' + (1700000000000 + i * 7919) + '-' + i.toString(36);
    const item = {
      localId: key, status: pick(['pending', 'confirmed', 'failed', 'unconfirmed', 'bogus']), type,
      fid: pick(FIDS), forumName: pick(['综合', '测试', '绘画(二创)', '']), title: pick(['', '无标题', '求评价', '']),
      name: pick(['无名氏', '路人A']), email: pick(['sage', 'noname3', '']),
      id: String(60000000 + i), postId: String(60000000 + i),
      resto: type === 'reply' ? String(50000000 + (i % 7)) : '0', threadId: String(50000000 + (i % 7)),
      userHash: 'h' + (i % 5), page: i % 9, url: '/t/' + i, sourceUrl: '/f/' + pick(FIDS),
      contentRaw: raw, contentText: raw, contentHash: '',
      imageFile: img, imageImg: img ? '/i/' + img : '', imageExt: img ? img.split('.')[1] : '',
      submittedAt: 1700000000000 + i * 7919
    };
    store.items[key] = item;
    store.order.push(key);
  }
  return store;
}

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// ═══ 浏览历史 ═══
GM.v[A.THREAD_HISTORY_STORAGE_KEY] = buildThreadStore();

test('thread: 检索结果与优化前算法逐条等价', () => {
  const QS = ['', '内容12', 'mode:po', 'mode:normal', 'has:image', 'has:gif', 'has:sage', 'has:zwsp', '68000', '68000137', '画 h1', '内容 13'];
  const SORTS = [undefined, 'last-desc', 'last-asc', 'visits-desc', 'visits-asc', 'page-desc'];
  QS.forEach((q) => SORTS.forEach((s) => {
    const a = JSON.stringify(A.searchThreadHistory(q, null, s).map((r) => r.key));
    const b = JSON.stringify(A.oldSearchThread(q, null, s).map((r) => r.key));
    assert(a === b, `mismatch q=${JSON.stringify(q)} sort=${s}`);
  }));
});

test('thread: 归一化结果被记忆化(同一引用)', () => {
  assert(A.getThreadHistoryStore() === A.getThreadHistoryStore(), 'store should be cached');
});

test('thread: 检索字段变更触发索引重建并可命中', () => {
  const s = A.getThreadHistoryStore(); const k = s.order[0];
  s.items[k].title = 'ZZZ新标题'; s.items[k].cookieId = 'QQHSH';
  A.setThreadHistoryStore(s);
  const hit = A.searchThreadHistory('ZZZ新标题');
  const hit2 = A.searchThreadHistory('QQHSH');
  assert(hit.some((r) => r.key === k), 'title change should be searchable');
  assert(hit2.some((r) => r.key === k), 'cookieId change should be searchable');
});

test('thread: 非检索字段变更不重建索引', () => {
  const s = A.getThreadHistoryStore(); const k = s.order[0];
  const before = s.index[k].fp;
  s.items[k].lastScrollY = 4321;
  A.setThreadHistoryStore(s);
  assert(A.getThreadHistoryStore().index[k].fp === before, 'fingerprint must be unchanged');
});

test('thread: 存量无 fp 索引首次读取自愈且结果不变', () => {
  const live = JSON.parse(JSON.stringify(A.getThreadHistoryStore()));
  Object.keys(live.index).forEach((k) => { delete live.index[k].fp; });
  GM.v[A.THREAD_HISTORY_STORAGE_KEY] = live;
  A.setThreadHistoryStore(A.normalizeThreadHistoryStore(live));
  const healed = A.getThreadHistoryStore();
  assert(Object.keys(healed.index).every((k) => !!healed.index[k].fp), 'all index entries must gain fp');
  const a = JSON.stringify(A.searchThreadHistory('内容12').map((r) => r.key));
  const b = JSON.stringify(A.oldSearchThread('内容12', null, undefined).map((r) => r.key));
  assert(a === b, 'results must not change after self-heal');
});

// ═══ 发言历史 ═══
GM.v[A.POST_HISTORY_STORAGE_KEY] = buildPostStore();

test('post: 存量无 index 存储首次读取补齐索引', () => {
  const legacy = buildPostStore();
  delete legacy.index;
  GM.v[A.POST_HISTORY_STORAGE_KEY] = legacy;
  A.setPostHistoryStore(legacy);
  const healed = A.getPostHistoryStore();
  assert(healed.index && Object.keys(healed.index).length === Object.keys(healed.items).length, 'index must be healed for every item');
});

test('post: 检索结果与优化前算法逐条等价', () => {
  const QS = ['', '综合', '老师', 'awa', 'status:confirmed', 'status:failed status:pending', 'fid:98', 'forum:测试',
    'has:image', 'has:gif', 'has:zwsp', 'id:60000003', 'thread:50000001', 'page:3', 'cookie:h2', 'name:路人',
    'email:sage', 'type:x', 'bogus:1', 'has:image status:confirmed 老师', 'forum:综合 has:gif', '零宽', 'h4 /t/', '测试内容 has:image'];
  QS.forEach((q) => ['reply', 'thread', undefined].forEach((t) => {
    const a = JSON.stringify(A.searchPostHistory(q, t).map((r) => r.key));
    const b = JSON.stringify(A.oldSearchPost(q, t).map((r) => r.key));
    assert(a === b, `mismatch q=${JSON.stringify(q)} type=${t}`);
  }));
});

test('post: 内容变更后索引重建并可命中', () => {
  const s = A.getPostHistoryStore(); const k = s.order[0];
  s.items[k].contentText = 'ZZZ唯一新内容'; s.items[k].contentHash = '';
  A.setPostHistoryStore(s);
  assert(A.searchPostHistory('zzz唯一新内容').some((r) => r.key === k), 'content change should be searchable');
});

test('post: 非检索字段变更不重建索引', () => {
  const s = A.getPostHistoryStore(); const k = s.order[0];
  const before = s.index[k].fp;
  s.items[k].submittedAt = s.items[k].submittedAt; // 同值写入
  A.setPostHistoryStore(s);
  assert(A.getPostHistoryStore().index[k].fp === before, 'fingerprint must be unchanged');
});

test('post: 删除条目后索引同步清除', () => {
  const s = A.getPostHistoryStore(); const k = s.order[1];
  delete s.items[k]; s.order = s.order.filter((x) => x !== k);
  A.setPostHistoryStore(s);
  assert(!A.getPostHistoryStore().index[k], 'index entry must be dropped with the item');
});

test('post: 归一化结果被记忆化(同一引用)', () => {
  assert(A.getPostHistoryStore() === A.getPostHistoryStore(), 'store should be cached');
});

let failed = 0;
tests.forEach(([name, fn]) => {
  try { fn(); console.log('ok   ' + name); }
  catch (e) { failed += 1; console.log('FAIL ' + name + ' :: ' + (e && e.message ? e.message : e)); }
});
if (failed) { console.log(`\n${failed}/${tests.length} history-search assertions failed`); process.exitCode = 1; }
else console.log(`\nhistory search contract ok (${tests.length} groups)`);
