// 版块页快捷回复 → 浏览历史同步 契约测试
//   背景：版块页快捷回复成功后，脚本已从 API 拿到"我们那条回复"（id + 站点时间）、该串末页页码，
//   以及 thread 顶层字段（title/content/user_hash/img/ext/now）。本功能用这份**已到手**的数据
//   更新或新建对应的浏览历史（零新增请求）。
//   语义（维护者定义）：浏览时间＝服务端回应时间；已有条目 → 访问次数 +1（只写位置层，零整库写）；
//   无条目 → 一次整库写（延后到空闲）。
// 运行：node tests/board-reply-thread-history.test.js
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

const TID = '69743710';
const REPLY_ID = '69743888';
const SITE_TIME = '2026-11-06(五)09:52:36';
const SITE_MS = new Date(2026, 10, 6, 9, 52, 36).getTime();

function sandboxWith(extra) {
  const sb = Object.assign({
    console, Date, Number, String, Math, Set, Object, Array, JSON, RegExp, Error
  }, extra || {});
  sb.globalThis = sb;
  vm.createContext(sb);
  return sb;
}

function testParseSiteTime() {
  const sb = sandboxWith();
  vm.runInContext(extractFunction('parseThreadHistorySiteTime') + '\nglobalThis.__p = parseThreadHistorySiteTime;', sb);
  const p = sb.__p;
  assert.strictEqual(p(SITE_TIME), SITE_MS, '带 (周五) 的站点时间应能解析');
  assert.strictEqual(p('2026-11-06 09:52:36'), SITE_MS, '无周几括号也应能解析');
  assert.strictEqual(p(''), 0, '空串 → 0');
  assert.strictEqual(p('garbage'), 0, '垃圾串 → 0');
  const pad = (n) => String(n).padStart(2, '0');
  const f = new Date(Date.now() + 3600000);
  const futStr = f.getFullYear() + '-' + pad(f.getMonth() + 1) + '-' + pad(f.getDate()) + ' ' + pad(f.getHours()) + ':' + pad(f.getMinutes()) + ':' + pad(f.getSeconds());
  assert.strictEqual(p(futStr), 0, '明显未来的时间 → 0（调用方回退本机时间）');
}

function makeEnv(opts) {
  const o = opts || {};
  const state = {
    store: o.store || { items: {}, index: {}, order: [], tombstones: {} },
    pos: Object.assign({}, o.pos || {}),
    posWrites: [],
    upserts: [],
    records: [],
    logs: [],
    debug: [],
    idleCallbacks: [],
    liveRenders: [],
    syncLinksCalls: 0,
    historyEnabled: o.historyEnabled !== false,
    postEnabled: o.postEnabled !== false,
    postItems: o.postItems || [],
    matchBy: o.matchBy || 'id'
  };
  const mod = [extractFunction('parseThreadHistorySiteTime'), extractFunction('findThreadHistoryOwnReply'), extractFunction('syncThreadHistoryFromBoardReply')].join('\n');
  const sb = sandboxWith({
    isThreadHistoryEnabledNow: () => state.historyEnabled,
    isPostHistoryEnabledNow: () => state.postEnabled,
    getThreadHistoryKey: (mode, tid) => mode + ':' + tid,
    getThreadHistoryStore: () => state.store,
    getPostHistoryStore: () => ({ items: state.postItems.reduce((acc, it, i) => { acc[it.id || ('p' + i)] = it; return acc; }, {}) }),
    postHistoryMatchesSnapshot: (reply, item) => state.matchBy === 'snapshot'
      ? String(reply.content || '') === String(item.contentText || '')
      : String(reply.id) === String(item.id),
    buildThreadHistoryPageUrl: (mode, tid, page) => 'https://www.nmbxd1.com/t/' + tid + '?page=' + page,
    readThreadHistoryPosHotMap: () => state.pos,
    readThreadHistoryPosMap: () => state.pos,
    setThreadHistoryPosEntry: (key, fields, at) => { state.posWrites.push({ key, fields: Object.assign({}, fields), at }); state.pos[key] = Object.assign({}, state.pos[key] || {}, fields, { at }); return state.pos; },
    invalidateThreadHistoryPosCache: () => {},
    buildThreadHistoryRecordFromApiThread: (options) => {
      state.records.push(options);
      if (o.emptyRecord) return { key: 'normal:' + options.threadId, mode: 'normal', threadId: options.threadId, page: options.page, url: options.url, title: '', contentText: '', contentHtml: '' };
      return { key: 'normal:' + options.threadId, mode: 'normal', threadId: options.threadId, page: options.page, url: options.url, title: '站点标题', contentText: '正文', contentHtml: '<div>正文</div>' };
    },
    upsertThreadHistoryRecord: (record, options) => { state.upserts.push({ record, options: Object.assign({}, options) }); return state.store; },
    updateThreadHistoryDebugState: (patch) => { state.debug.push(patch); },
    logThreadHistory: (message) => { state.logs.push(message); },
    startupPerfDebug: { begin: () => 0, finish: () => {} },
    requestIdleCallback: (cb) => { state.idleCallbacks.push(cb); return state.idleCallbacks.length; },
    setTimeout: () => 0,
    // 本页刷新（修复：写入方本页收不到 storage/GM 变更事件）
    document: { hidden: o.hidden === true },
    scheduleThreadHistoryLiveRender: (source) => { state.liveRenders.push(source); },
    syncFavoriteThreadsLinks: () => { state.syncLinksCalls += 1; }
  });
  sb.threadHistoryStoreCache = {};            // 模拟"已有缓存"（修复分支要求它为真）
  sb.threadHistoryStoreNeedsPosOverlay = false;
  vm.runInContext(mod + '\nglobalThis.__sync = syncThreadHistoryFromBoardReply;', sb);
  state.getOverlayFlag = () => sb.threadHistoryStoreNeedsPosOverlay;
  return { state, sync: sb.__sync };
}

function payload(over) {
  return Object.assign({
    threadId: TID,
    page: 5,
    threadObj: { title: 'T', content: '<div>OP</div>', user_hash: 'abc', name: '无名氏', img: '2026-01-01/x', ext: '.jpg', now: SITE_TIME },
    replies: [{ id: REPLY_ID, now: SITE_TIME, content: '我的回复' }],
    isReplySuccess: true
  }, over || {});
}
function pendingItem(over) {
  return Object.assign({ id: REPLY_ID, status: 'pending', type: 'reply', threadId: TID, submittedAt: Date.now() - 1000, contentText: '我的回复' }, over || {});
}
function existingItem(over) {
  return Object.assign({ key: 'normal:' + TID, mode: 'normal', threadId: TID, page: 3, maxVisitedPage: 3, lastKnownPage: 3, lastVisitedAt: Date.now() - 86400000, visitCount: 4, contentText: 'old' }, over || {});
}

function testGuards() {
  { const e = makeEnv({ historyEnabled: false });
    assert.strictEqual(e.sync(payload()), 0, '浏览历史关闭 → 不写');
    assert.strictEqual(e.state.posWrites.length + e.state.upserts.length, 0, '不应有任何写入'); }
  { const e = makeEnv({ postEnabled: false });
    assert.strictEqual(e.sync(payload()), 0, '发言历史关闭 → 不写（两者都开才记录）'); }
  { const e = makeEnv({});
    assert.strictEqual(e.sync(payload({ isReplySuccess: false })), 0, '按钮刷新事件 → 不计数/不新建'); }
  { const e = makeEnv({});
    assert.strictEqual(e.sync(payload({ threadId: 'abc' })), 0, '非法串号 → 跳过'); }
  { const e = makeEnv({ store: { items: {}, index: {}, order: [], tombstones: { ['normal:' + TID]: { deletedAt: Date.now(), origin: 'local', purged: false } } } });
    assert.strictEqual(e.sync(payload()), 0, '回收站内/已彻底删 → 不复活');
    assert.strictEqual(e.state.posWrites.length + e.state.upserts.length, 0); }
}

function testUpdatePath() {
  const e = makeEnv({ postItems: [pendingItem()] });
  e.state.store.items['normal:' + TID] = existingItem();
  assert.strictEqual(e.sync(payload()), 1, '已有条目 → 返回 1（位置层更新）');
  assert.strictEqual(e.state.posWrites.length, 1, '恰好一次位置层写入');
  assert.strictEqual(e.state.upserts.length, 0, '更新路径不得写整库');
  const w = e.state.posWrites[0];
  assert.strictEqual(w.key, 'normal:' + TID);
  assert(w.at >= Date.now() - 10000 && w.at !== SITE_MS, '位置层 at 应为"写入时间"（新鲜度基准），不是业务时间');
  assert.strictEqual(w.fields.vat, SITE_MS, 'vat（浏览时间）＝回应时间');
  assert.strictEqual(w.fields.vc, 5, '访问次数 4+1');
  assert.strictEqual(w.fields.p, 5, 'page = max(3,5)');
  assert.strictEqual(w.fields.mv, 5, 'maxVisitedPage = max(3,5)');
  assert.strictEqual(w.fields.lk, 5, 'lastKnownPage = max(3,5)');
  assert.strictEqual(w.fields.rid, REPLY_ID, 'rid 记录本次回复 id（幂等键）');
  assert.strictEqual(w.fields.rp, 5, 'rp = 回复所在页');
  assert.strictEqual(w.fields.u, 'https://www.nmbxd1.com/t/' + TID + '?page=5', 'url 指向回复所在页');
  assert(e.state.debug.some((d) => d.lastBoardReply && d.lastBoardReply.mode === 'update'), '调试状态 mode=update');
  // ★ 修复：写入方本页必须自己刷新（跨标签才靠 storage/GM 变更事件）
  assert.strictEqual(e.state.getOverlayFlag(), true, '必须置位"位置层需叠加"，否则本页读到的顺序是旧的');
  assert.deepStrictEqual(e.state.liveRenders, ['board-reply'], '可见时应调度一次本页重绘');
  assert.strictEqual(e.state.syncLinksCalls, 1, '常用串链接也要顺手同步');
}
function testHiddenTabSkipsDomWork() {
  const e = makeEnv({ postItems: [pendingItem()], hidden: true });
  e.state.store.items['normal:' + TID] = existingItem();
  assert.strictEqual(e.sync(payload()), 1, '后台标签仍要写位置层');
  assert.strictEqual(e.state.liveRenders.length, 0, '后台标签不做 DOM 工作（不调度重绘）');
  assert.strictEqual(e.state.getOverlayFlag(), true, '但仍要置位叠加标记，以便切回时刷新');
}

function testIdempotent() {
  const e = makeEnv({ postItems: [pendingItem()], pos: { ['normal:' + TID]: { p: 5, mv: 5, lk: 5, rid: REPLY_ID, rp: 5, at: SITE_MS, vat: SITE_MS, vc: 9 } } });
  e.state.store.items['normal:' + TID] = existingItem({ visitCount: 4 });
  e.sync(payload());
  assert.strictEqual(e.state.posWrites[0].fields.vc, 9, '同一回复重复触发 → 计数不变（max(9,4)）');
}

function testUnmatchedDoesNotCount() {
  const e = makeEnv({ postItems: [] });
  e.state.store.items['normal:' + TID] = existingItem({ visitCount: 4 });
  assert.strictEqual(e.sync(payload()), 1, '未匹配到回复仍更新位置（返回 1）');
  const w = e.state.posWrites[0];
  assert.strictEqual(w.fields.vc, 4, '未识别出回复 → 不计数（宁可少计不误计）');
  assert(w.at > 0, '回退时间应为本机时间（有效数字）');
}

function testCreatePath() {
  const e = makeEnv({ postItems: [pendingItem()] });
  assert.strictEqual(e.sync(payload()), 2, '无条目 → 返回 2（排期新建）');
  assert.strictEqual(e.state.upserts.length, 0, '新建延后：此刻不得写整库');
  assert.strictEqual(e.state.idleCallbacks.length, 1, '应排入一个空闲回调');
  assert(e.state.debug.some((d) => d.lastBoardReply && d.lastBoardReply.mode === 'create-scheduled'), '先写 create-scheduled');
  e.state.idleCallbacks[0]();
  assert.strictEqual(e.state.upserts.length, 1, '空闲回调后写一次整库');
  const up = e.state.upserts[0];
  assert.strictEqual(up.options.visitedAt, SITE_MS, '整库写使用同一回应时间');
  assert.strictEqual(up.options.countVisit, true, '新建计一次访问');
  assert.strictEqual(up.options.reason, 'board-reply', '原因标记');
  assert.strictEqual(e.state.records.length, 1, '调用一次记录组装');
  assert.strictEqual(e.state.records[0].threadObj.title, 'T', '组装时把 thread 顶层字段传下去');
  assert(e.state.debug.some((d) => d.lastBoardReply && d.lastBoardReply.mode === 'create'), '完成后写 mode=create');
}

function testCreateGuards() {
  { const e = makeEnv({ postItems: [pendingItem()] });
    e.sync(payload());
    e.state.store.items['normal:' + TID] = existingItem();
    e.state.idleCallbacks[0]();
    assert.strictEqual(e.state.upserts.length, 0, '期间已创建 → 不重复新建'); }
  { const e = makeEnv({ postItems: [pendingItem()] });
    e.sync(payload());
    e.state.store.tombstones['normal:' + TID] = { deletedAt: Date.now(), purged: false };
    e.state.idleCallbacks[0]();
    assert.strictEqual(e.state.upserts.length, 0, '期间进回收站 → 放弃新建'); }
}

function testMatchingVariants() {
  // 按快照匹配（pending 无 id 时）
  { const e = makeEnv({ postItems: [pendingItem({ id: '' })], matchBy: 'snapshot' });
    e.state.store.items['normal:' + TID] = existingItem();
    e.sync(payload());
    assert.strictEqual(e.state.posWrites[0].fields.rid, REPLY_ID, '快照匹配也应识别出我方回复');
    assert.strictEqual(e.state.posWrites[0].fields.vc, 5, '识别出后正常 +1'); }
  // pending 过期（>180s）→ 视为未识别
  { const e = makeEnv({ postItems: [pendingItem({ submittedAt: Date.now() - 300000 })] });
    e.state.store.items['normal:' + TID] = existingItem();
    e.sync(payload());
    assert.strictEqual(e.state.posWrites[0].fields.vc, 4, '过期的 pending 不参与匹配 → 不计数'); }
  // 非本串的 pending → 不匹配
  { const e = makeEnv({ postItems: [pendingItem({ threadId: '12345678' })] });
    e.state.store.items['normal:' + TID] = existingItem();
    e.sync(payload());
    assert.strictEqual(e.state.posWrites[0].fields.vc, 4, '别的串的 pending 不参与匹配'); }
}

function testCreateSkippedWithoutContent() {
  // API 与版块页行都没有正文（串已删/非正常串）→ 不新建，避免"看不到内容的空条目"
  const e = makeEnv({ postItems: [pendingItem()], emptyRecord: true });
  assert.strictEqual(e.sync(payload()), 2, '仍返回"排期"状态');
  e.state.idleCallbacks[0]();
  assert.strictEqual(e.state.upserts.length, 0, '无正文 → 不得写整库（不留空条目）');
  assert(e.state.debug.some((d) => d.lastBoardReply && d.lastBoardReply.mode === 'create-skipped-no-content'), '应记录跳过原因');
  assert(e.state.logs.some((m) => /跳过新建/.test(m)), '应有跳过日志');
}

function testLegacyCookieRenderingIsPlain() {
  // 记录缺 cookieHtml 时的兜底：一律原样渲染，绝不猜测红名（旧串饼干可能就是 8 位）
  const sb = sandboxWith();
  vm.runInContext(extractFunction('escapeThreadHistoryHtml') + '\n' + extractFunction('buildThreadHistoryLegacyCookieHtml') + '\nglobalThis.__c = buildThreadHistoryLegacyCookieHtml;', sb);
  const c = sb.__c;
  assert.strictEqual(c('5TM0hro'), 'ID:5TM0hro', '7 位普通饼干 → 原样');
  assert.strictEqual(c('12345678'), 'ID:12345678', '8 位普通饼干（旧版串）→ 同样原样');
  assert.strictEqual(c('Admin✿'), 'ID:Admin✿', '没有读到红名信息时不做任何红名/角标处理');
  assert.strictEqual(c('xO8dJS0'), 'ID:xO8dJS0');
  assert.strictEqual(c(''), '', '空值 → 空串');
  assert.strictEqual(c('<b>x</b>'), 'ID:&lt;b&gt;x&lt;/b&gt;', '必须转义');
}

function testSourceContract() {
  const hookIdx = src.indexOf('syncThreadHistoryFromBoardReply({');
  const enrichIdx = src.indexOf('enrichPendingPostHistoryFromThreadData(t, tailReplies, tailPage)');
  assert(enrichIdx !== -1 && hookIdx !== -1, '钩子与回填调用都必须存在');
  assert(hookIdx > enrichIdx, '钩子必须接在回填之后（借道同一份数据）');
  assert(src.includes("isReplySuccess: e.type !== 'xdexBoardThreadRefresh'"), '必须把"按钮刷新"排除在计数之外');
  assert(src.includes('const visitedAt = Number(options.visitedAt) || now;'), 'upsertThreadHistoryRecord 必须支持指定访问时间');
  assert(src.includes('function extractThreadHistoryRecord(root, parsedOverride)'), '提取器必须支持显式目标串（版块页兜底取材）');
  assert(src.includes("const alreadyCounted = !replyId || String(prev.rid || '') === replyId;"), '计数幂等（含"识别不到回复则不计数"）');
  assert(src.includes("startupPerfDebug.finish('threadHistory.boardReply'"), '应有 threadHistory.boardReply 埋点');
  assert(src.includes('function buildThreadHistoryContentFromHtml('), '应有"由 API HTML 构建库内字段"的复用函数');
  assert(src.includes('function buildThreadHistoryRecordFromApiThread('), '应有 API 记录组装函数');
  assert(src.includes("mode: 'create-skipped-no-content'"), '无正文时必须跳过新建（避免空条目）');
  assert(src.includes('scheduleThreadHistoryLiveRender(\'board-reply\', false)'), '本页刷新：必须调度本页重绘');
  assert(!src.includes('match(/^([A-Za-z0-9]{3,8})(.+)$/'), '不得保留任何红名/角标启发式拆分');
  assert(src.includes("cookieHtml = Number(threadObj.admin)"), '红名只能来自读到的信息（API admin 字段）');
  assert(src.includes("cookieHtml = Number(threadObj.admin)"), 'API 组装必须按 admin 合成 cookieHtml（普通饼干不得缺 cookieHtml）');
}

const tests = [
  testParseSiteTime, testGuards, testUpdatePath, testHiddenTabSkipsDomWork, testIdempotent, testUnmatchedDoesNotCount,
  testCreatePath, testCreateGuards, testCreateSkippedWithoutContent, testMatchingVariants, testSourceContract
];

let failed = 0;
tests.forEach((fn) => {
  try { fn(); console.log('  PASS ' + fn.name); }
  catch (e) { failed += 1; console.error('  FAIL ' + fn.name + '\n       ' + ((e && e.message) || e)); }
});
if (failed) { console.error(failed + ' / ' + tests.length + ' 项失败'); process.exit(1); }
console.log('board reply thread-history contract ok');
