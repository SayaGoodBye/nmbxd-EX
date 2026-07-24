const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const script = fs.readFileSync(path.join(root, 'nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function extractFunctionBody(source, functionName) {
  const start = source.indexOf(`function ${functionName}(`);
  assert(start !== -1, `${functionName} must exist`);
  const braceStart = source.indexOf('{', start);
  assert(braceStart !== -1, `${functionName} body must exist`);
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`${functionName} body not closed`);
}

function testAddCurrentThreadPageGate() {
  const helperIndex = script.indexOf('function isFavoriteThreadPageLocation()');
  const getterIndex = script.indexOf('function getCurrentFavoriteThreadId()');
  const domFallbackIndex = script.indexOf("document.querySelector('.h-threads-list .h-threads-item[data-threads-id]')", getterIndex);
  const helperBody = extractFunctionBody(script, 'isFavoriteThreadPageLocation');

  assert(helperIndex !== -1, 'favorite threads must define a page-location gate');
  assert(getterIndex !== -1, 'favorite threads must define current thread id getter');
  assert(script.indexOf("if (!isFavoriteThreadPageLocation()) return '';", getterIndex) !== -1, 'board/timeline pages must not fall through to DOM first-thread detection');
  assert(script.includes("function getFavoriteThreadsAddLinkText()"), 'favorite menu must define page-aware add link text');
  assert(script.includes("return isFavoriteThreadPageLocation() ? '添加当前串' : '添加常用串';"), 'non-thread pages must show 添加常用串 to avoid ambiguity');
  assert(script.includes('addLink.textContent = getFavoriteThreadsAddLinkText();'), 'favorite menu add link must use page-aware text');
  assert(script.includes('function openFavoriteThreadsSettingsPanel(options = {})'), 'favorite settings opener must accept options');
  assert(script.includes('if (options.addEmptyGroup)'), 'non-thread add flow must be able to append a new manual entry group');
  assert(script.includes('$container.append(buildFavoriteThreadRowHtml(nextIndex));'), 'manual add flow must append a new favorite thread group');
  assert(script.includes('openFavoriteThreadsSettingsPanel({ addEmptyGroup: true });'), 'non-thread add-current flow must open settings with a new empty group');
  assert(domFallbackIndex !== -1, 'thread pages may still use DOM thread id fallback');
  assert(getterIndex < domFallbackIndex, 'page-location gate must run before DOM fallback');
  // 只检查门控函数自身，不要扫到后面无关的 /f/ 值班室逻辑
  assert(!/\\\/f\\\//.test(helperBody) && !helperBody.includes('/f/'), 'board pages must not be treated as add-current thread pages');
  assert(!helperBody.includes('Forum\\/timeline') && !helperBody.includes('Forum/timeline'), 'timeline pages must not be treated as add-current thread pages');
}

function testThreadPagePatterns() {
  // 支持 6-8 位串号；普通串 /t/<id> 与可选旧式 /t/<id>/<n>；PO 串 /Forum/po/id/<id>(/page/n.html)?
  assert(script.includes('^\\/t\\/\\d{6,8}(?:\\/\\d+)?\\/?$'), 'canonical /t/<id> pages must allow add-current auto add');
  assert(script.includes('^\\/Forum\\/po\\/id\\/\\d{6,8}(?:\\/page\\/\\d+)?(?:\\.html)?$'), 'legacy /Forum/po/id/<id> pages must allow add-current auto add');
}

function testSettingsPanelFixedFavoriteThreadsItem() {
  assert(script.includes('id="sp_enableFavoriteThreads" class="xdex-switch fixed-on" role="switch" checked disabled'), 'settings panel must show favorite threads as a fixed enabled switch');
  assert(script.includes('<label for="sp_enableFavoriteThreads"> 常用串</label>'), 'fixed favorite threads switch must use 常用串 label');
  assert(script.includes('id="sp_enableThreadHistory" class="xdex-switch fixed-on" role="switch" checked disabled'), 'settings panel must show browsing history as a fixed enabled switch');
  assert(script.includes('<label for="sp_enableThreadHistory"> 浏览历史</label>'), 'fixed browsing history switch must use 浏览历史 label');
  assert(script.indexOf('id="sp_enableFavoriteThreads"') < script.indexOf('id="sp_enableThreadHistory"'), 'fixed browsing history switch must be placed after favorite threads');
  assert(script.includes("sp_enableFavoriteThreads: '在侧边栏添加常用串，支持串内一键添加，并优先跳转浏览历史中的最近阅读页'"), 'fixed favorite threads switch must describe history-linked jumps');
  assert(script.includes("sp_enableThreadHistory: '保存浏览历史，支持搜索，可切换多种排序方式'"), 'fixed browsing history switch must have hover description');
  assert(!script.includes('id="sp_favoriteThreads" class="xdex-switch fixed-on"'), 'fixed favorite threads switch must not reuse sp_favoriteThreads data id');
  assert(!script.includes('name="sp_enableFavoriteThreads"'), 'display-only favorite threads switch must not add a hidden setting field');
  assert(!script.includes('name="sp_enableThreadHistory"'), 'display-only browsing history switch must not add a hidden setting field');
}

function testFavoriteThreadsHistoryLinkage() {
  const latestBody = extractFunctionBody(script, 'getLatestThreadHistoryUrl');
  const syncBody = extractFunctionBody(script, 'syncFavoriteThreadsLinks');
  assert(script.includes('function getLatestThreadHistoryUrl'), 'favorite threads must be able to look up latest browsing-history URL');
  // 优先普通模式，没有再回退只看 PO；都没有由调用方回退普通第 1 页
  assert(latestBody.includes("getThreadHistoryKey('normal', tid)"), 'favorite history lookup must prefer normal-mode history records');
  assert(latestBody.includes("getThreadHistoryKey('po', tid)"), 'favorite history lookup may fall back to PO history records');
  assert(latestBody.includes('buildThreadHistoryItemUrl(normal)'), 'favorite history lookup must reuse the history URL builder for normal mode');
  assert(latestBody.includes('buildThreadHistoryItemUrl(po)'), 'favorite history lookup must reuse the history URL builder for PO fallback');
  assert(script.includes('link.href = getLatestThreadHistoryUrl(item.threadId) || makeFavoriteThreadUrl(item.threadId);'), 'favorite thread links must prefer latest history URL and fall back to first page');
  assert(syncBody.includes("getThreadHistoryKey('normal', tid)"), 'syncing favorite links must prefer normal-mode history');
  assert(syncBody.includes("getThreadHistoryKey('po', tid)"), 'syncing favorite links may fall back to PO history');
  assert(syncBody.includes("buildThreadHistoryPageUrl('normal', tid, 1)"), 'syncing favorite links must fall back to normal page 1 when no history exists');
  assert(script.includes('data-update-channel="thread" data-thread-id="67024789" href="https://www.nmbxd1.com/t/67024789"'), 'settings footer thread link must expose its thread id and keep page 1 as fallback');
  assert(syncBody.includes("#xdex-favorite-threads-menu a[data-thread-id], #sp_panel_footer a[data-thread-id]"), 'history linkage must synchronize both favorite-thread and settings-footer links');
  assert(script.includes("$('body').append(html);\n      syncFavoriteThreadsLinks();"), 'settings footer thread link must synchronize immediately after panel render');
  const liveSyncBody = extractFunctionBody(script, 'bindThreadHistoryLiveSync');
  assert(liveSyncBody.includes("scheduleThreadHistoryLiveRender('gm-value-change', remote);\n          syncFavoriteThreadsLinks();"), 'remote browsing-history changes must refresh linked thread URLs');
}

function testThreadHistoryMenuEntry() {
  assert(script.includes('function openThreadHistorySettingsPanel()'), 'sidebar browsing history entry must have an opener function');
  assert(script.includes('function createThreadHistoryMenuNode()'), 'sidebar browsing history entry must be rendered as a menu node');
  assert(script.includes("li.id = 'xdex-thread-history-menu'"), 'sidebar browsing history entry must have a stable id');
  assert(script.includes("setXDexSidebarExLabel(link, '浏览历史')"), 'sidebar browsing history entry must use 浏览历史 label with native EX sub badge');
  assert(script.includes("setXDexSidebarExLabel(header, '常用串')"), 'favorite threads sidebar entry must use 常用串 label with native EX sub badge');
  assert(script.includes("$('#sp_panel_tab_slot [data-sp-module=\"history\"]').trigger('click')"), 'sidebar browsing history entry must open the history settings module');
  assert(script.includes("const oldThreadHistory = document.getElementById('xdex-thread-history-menu')"), 'rendering sidebar menu must remove the previous browsing history entry before inserting a new one');
  assert(script.includes("const oldPostHistory = document.getElementById('xdex-post-history-menu')"), 'rendering sidebar menu must remove the previous post history entry before inserting a new one');
  assert(script.indexOf('const node = createFavoriteThreadsMenuNode(items, wasOpen);') < script.indexOf('const threadHistoryNode = createThreadHistoryMenuNode();'), 'browsing history sidebar entry must be created after favorite threads');
  assert(script.indexOf('menu.insertBefore(node, timeline || menu.firstChild);') < script.indexOf('menu.insertBefore(threadHistoryNode, timeline || node.nextSibling);'), 'browsing history sidebar entry must be inserted after favorite threads and before timeline');
}

testAddCurrentThreadPageGate();
testThreadPagePatterns();
testSettingsPanelFixedFavoriteThreadsItem();
testFavoriteThreadsHistoryLinkage();
testThreadHistoryMenuEntry();
console.log('favorite threads contract ok');
