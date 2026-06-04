const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const script = fs.readFileSync(path.join(root, 'nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function testAddCurrentThreadPageGate() {
  const helperIndex = script.indexOf('function isFavoriteThreadPageLocation()');
  const getterIndex = script.indexOf('function getCurrentFavoriteThreadId()');
  const domFallbackIndex = script.indexOf("document.querySelector('.h-threads-list .h-threads-item[data-threads-id]')", getterIndex);
  const boardPatternIndex = script.indexOf('^\\/f\\/', helperIndex);
  const timelinePatternIndex = script.indexOf('Forum\\/timeline', helperIndex);

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
  assert(boardPatternIndex === -1, 'board pages must not be treated as add-current thread pages');
  assert(timelinePatternIndex === -1, 'timeline pages must not be treated as add-current thread pages');
}

function testThreadPagePatterns() {
  assert(script.includes('^\\/t\\/\\d{8}(?:\\/\\d+)?\\/?$'), 'canonical /t/<id> pages must allow add-current auto add');
  assert(script.includes('^\\/Forum\\/po\\/id\\/\\d{8}(?:\\/page\\/\\d+)?(?:\\.html)?$'), 'legacy /Forum/po/id/<id> pages must allow add-current auto add');
}

function testSettingsPanelFixedFavoriteThreadsItem() {
  assert(script.includes('id="sp_enableFavoriteThreads" class="xdex-switch fixed-on" role="switch" checked disabled'), 'settings panel must show favorite threads as a fixed enabled switch');
  assert(script.includes('<label for="sp_enableFavoriteThreads"> 常用串</label>'), 'fixed favorite threads switch must use 常用串 label');
  assert(script.includes("sp_enableFavoriteThreads: '在侧边栏添加常用串，支持串内一键添加'"), 'fixed favorite threads switch must have hover description');
  assert(!script.includes('id="sp_favoriteThreads" class="xdex-switch fixed-on"'), 'fixed favorite threads switch must not reuse sp_favoriteThreads data id');
  assert(!script.includes('name="sp_enableFavoriteThreads"'), 'display-only favorite threads switch must not add a hidden setting field');
}

testAddCurrentThreadPageGate();
testThreadPagePatterns();
testSettingsPanelFixedFavoriteThreadsItem();
console.log('favorite threads contract ok');
