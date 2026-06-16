const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const script = fs.readFileSync(path.join(root, 'nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertContains(text, message) {
  assert(script.includes(text), message);
}

function assertNotContains(text, message) {
  assert(!script.includes(text), message);
}

// ─── Per-type split limits ───────────────────────────────────────────────────

function testPerTypeLimitConstants() {
  assertContains('const POST_HISTORY_THREAD_LIMIT = Infinity;', 'must define POST_HISTORY_THREAD_LIMIT');
  assertContains('const POST_HISTORY_REPLY_LIMIT = Infinity;', 'must define POST_HISTORY_REPLY_LIMIT');
  assertContains('// const POST_HISTORY_LIMIT = 500;', 'old shared POST_HISTORY_LIMIT must be commented out, not deleted');
  assertNotContains("\n  const POST_HISTORY_LIMIT = 500;", 'active POST_HISTORY_LIMIT constant must not remain uncommented');
}

function testPerTypeCleanupLogic() {
  assertContains('const shouldCleanThread = POST_HISTORY_THREAD_LIMIT !== Infinity;', 'normalizePostHistoryStore must guard thread cleanup behind Infinity check');
  assertContains('const shouldCleanReply = POST_HISTORY_REPLY_LIMIT !== Infinity;', 'normalizePostHistoryStore must guard reply cleanup behind Infinity check');
  assertContains('typeOrders.thread', 'per-type cleanup must track thread orders separately');
  assertContains('typeOrders.reply', 'per-type cleanup must track reply orders separately');
  assertContains('shouldCleanThread && typeOrders.thread.length > POST_HISTORY_THREAD_LIMIT', 'thread cleanup must compare against POST_HISTORY_THREAD_LIMIT');
  assertContains('shouldCleanReply && typeOrders.reply.length > POST_HISTORY_REPLY_LIMIT', 'reply cleanup must compare against POST_HISTORY_REPLY_LIMIT');
  assertContains('// while (store.order.length > store.limit)', 'old shared cleanup must be commented out, not deleted');
}

function testDefaultStoreShapeUpdated() {
  assertContains('// limit: POST_HISTORY_LIMIT,', 'createDefaultPostHistoryStore limit field must be commented out, not deleted');
  assertContains('version: POST_HISTORY_STORE_VERSION', 'createDefaultPostHistoryStore must retain version field');
  assertContains('items: {}', 'createDefaultPostHistoryStore must retain items field');
  assertContains('order: []', 'createDefaultPostHistoryStore must retain order field');
}

function testNormalizeStoreLimitRemoved() {
  assertContains('// store.limit = Number(store.limit) > 0 ? Number(store.limit) : POST_HISTORY_LIMIT;', 'normalizePostHistoryStore limit assignment must be commented out, not deleted');
}

function testUpsertTypeCounts() {
  assertContains("const typeCounts = { thread: 0, reply: 0 };", 'upsertPostHistoryRecord must track per-type counts');
  assertContains("threadCount: typeCounts.thread,", 'upsertPostHistoryRecord log must include threadCount');
  assertContains("replyCount: typeCounts.reply", 'upsertPostHistoryRecord log must include replyCount');
  assertContains("const type = normalizePostHistoryType(store.items[key]?.type);", 'type counting must normalize item type before incrementing');
}

// ─── Post history sidebar menu ───────────────────────────────────────────────

function testPostHistorySidebarMenu() {
  assertContains('function createPostHistoryMenuNode()', 'must define post history sidebar menu node factory');
  assertContains("li.id = 'xdex-post-history-menu'", 'post history sidebar menu must have a stable id');
  assertContains("setXDexSidebarExLabel(link, '我的发言')", 'post history sidebar menu must use 我的发言 label with native EX sub badge');
  assertContains('function openPostHistorySettingsPanel()', 'must define post history settings panel opener');
  assertContains("$('#sp_panel_tab_slot [data-sp-module=\"posts\"]').trigger('click')", 'post history sidebar must open the posts settings module');
  assertContains('const postHistoryNode = createPostHistoryMenuNode()', 'renderFavoriteThreadsMenu must create post history menu node');
  assertContains("menu.insertBefore(postHistoryNode, timeline || threadHistoryNode.nextSibling);", 'post history sidebar must be inserted after browsing history');
  assertContains('function createSubscriptionFeedMenuNode()', 'must define subscription feed sidebar menu node factory');
  assertContains("li.id = 'xdex-subscription-feed-menu'", 'subscription feed sidebar menu must have a stable id');
  assertContains("setXDexSidebarExLabel(link, '我的订阅')", 'subscription feed sidebar menu must use 我的订阅 label with native EX sub badge');
  assertContains("const badge = document.createElement('sub')", 'EX badge must use native sub element like site identity badges');
  assertContains("badge.style.cssText = 'color: darkorange; font-weight: bold;'", 'EX badge style must match site identity badge color and weight');
  assertContains("setXDexSidebarExLabel(header, '常用串')", 'favorite threads sidebar menu must use 常用串 label with native EX sub badge');
  assertContains("setXDexSidebarExLabel(link, '浏览历史')", 'thread history sidebar menu must use 浏览历史 label with native EX sub badge');
  assertContains('function openSubscriptionFeedSettingsPanel()', 'must define subscription feed settings panel opener');
  assertContains("$('#sp_panel_tab_slot [data-sp-module=\"feeds\"]').trigger('click')", 'subscription feed sidebar must open the feeds settings module');
  assertContains('const subscriptionFeedNode = createSubscriptionFeedMenuNode()', 'renderFavoriteThreadsMenu must create subscription feed menu node');
  assertContains("menu.insertBefore(subscriptionFeedNode, timeline || postHistoryNode.nextSibling);", 'subscription feed sidebar must be inserted after post history');
}

// ─── Batch rendering optimization ────────────────────────────────────────────

function testBatchRenderingOptimization() {
  assertContains('function batchRenderHistoryItems(root, results, buildFn, queueId)', 'must define batch rendering helper');
  assertContains('function findHistoryScrollContainer(element)', 'must define scroll container finder');
  assertContains('requestAnimationFrame', 'batch rendering must use requestAnimationFrame for deferred batches');
  assertContains('batchRenderHistoryItems(root, results, buildThreadHistoryItemElement, \'threadHistory\')', 'browsing history must use batch rendering');
  assertContains('batchRenderHistoryItems(root, results, buildPostHistoryItemElement, \'postHistory\')', 'post history must use batch rendering');
  assertContains('historyRenderQueues', 'batch rendering must support cancellation via queue map');
}

// ─── Post-submission confirmation flow ───────────────────────────────────────

function testPostSubmissionConfirmationFlow() {
  assertContains('const postHistoryConfirmationMap = new Map()', 'must define confirmation map for Promise-based post-history wait');
  assertContains('POST_HISTORY_CONFIRM_TIMEOUT_MS', 'must define confirmation timeout constant');
  assertContains('10000', 'confirmation timeout must be 10 seconds');
  assertContains('Promise.race', 'doSubmit must race confirmation promise against timeout');
  assertContains('confirmPostHistorySnapshot', 'must define confirmation resolver');
  assertContains('snapshotSubmittedPostHistory', 'must define snapshot creator');
  assertContains('const confirmPromise = new Promise(res => { confirmResolver = res; })', 'doSubmit must create a deferred promise for confirmation');
  assertContains('postHistoryConfirmationMap.set(localId, confirmResolver)', 'doSubmit must register resolver in confirmation map');
  assertContains('postHistoryConfirmationMap.delete(localId)', 'confirmation flow must clean up map entries after resolve/reject');
}

// ─── Post-after-action dropdown ──────────────────────────────────────────────

function testPostAfterActionDropdown() {
  assertContains('id="sp_postAfterAction"', 'settings panel must include post-after-action dropdown');
  assertContains('<option value="jump">发串后跳转</option>', 'dropdown must include jump option');
  assertContains('<option value="refresh">发串后刷新</option>', 'dropdown must include refresh option');
  assertContains("sp_postAfterAction: '发串成功后的行为", 'settings hover description must explain the dropdown');
  assertContains('postAfterAction', 'settings defaults must include postAfterAction');
  assertContains("'jump'", 'default post-after-action must be jump');
  assertContains("function initPostAfterActionSelect", 'must define change handler for the dropdown');
}

// ─── Dynamic post history links (type-aware) ────────────────────────────────

function testDynamicPostHistoryLinks() {
  // buildPostHistoryReplyActionUrl must distinguish thread vs reply
  assertContains("if (type === 'reply')", 'buildPostHistoryReplyActionUrl must have type guard for reply');
  assertContains('const historyUrl = getLatestThreadHistoryUrl(threadId)', 'thread-type links must check browsing history first');
  assertContains("if (historyUrl) return historyUrl;", 'thread-type links must use browsing history URL when available');
  assertContains('const fallbackPage = Math.max(1, Number(page) || 1)', 'thread-type links must fall back to saved page');

  // buildPostHistoryUrl must use ?r=threadId for threads
  assertContains('return `${location.origin}/t/${threadId}?r=${threadId}`', 'post history thread URLs must use ?r= format');
}

function testBuildPostHistoryItemElementDynamicPage() {
  const postItemStart = script.indexOf('function buildPostHistoryItemElement(result)');
  const postItemBody = script.slice(postItemStart, script.indexOf('function renderPostHistoryModule', postItemStart));
  assert(postItemBody.includes("if (item.type === 'thread' && item.threadId)"), 'buildPostHistoryItemElement must have type guard for thread 所在页 display');
  assert(postItemBody.includes('getLatestThreadHistoryUrl(item.threadId)'), 'thread 所在页 must check browsing history for dynamic page');
  assert(postItemBody.includes('let displayPage = item.page;'), '所在页 must default to item.page (shared by reply and thread fallback)');
  assert(postItemBody.includes('`所在页：P${displayPage}`'), '所在页 must render displayPage (dynamically resolved for threads, direct for replies)');
  assert(postItemBody.includes('// const displayPage = item.page;'), 'old direct item.page usage must be commented out, not deleted');
}

// ─── Run all tests ───────────────────────────────────────────────────────────

testPerTypeLimitConstants();
testPerTypeCleanupLogic();
testDefaultStoreShapeUpdated();
testNormalizeStoreLimitRemoved();
testUpsertTypeCounts();
testPostHistorySidebarMenu();
testBatchRenderingOptimization();
testPostSubmissionConfirmationFlow();
testPostAfterActionDropdown();
testDynamicPostHistoryLinks();
testBuildPostHistoryItemElementDynamicPage();
console.log('post history recent features contract ok');
