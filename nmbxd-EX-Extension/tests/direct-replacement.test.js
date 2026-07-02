const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function extractUserscriptHeader(sourceText) {
  const match = String(sourceText || '').match(/\/\/\s*==UserScript==[\s\S]*?\/\/\s*==\/UserScript==/);
  if (!match) throw new Error('userscript header not found');
  return match[0];
}

function readMetaValue(header, key) {
  const match = String(header || '').match(new RegExp('^//\\s*@' + key + '\\s+(.+)$', 'm'));
  return match ? String(match[1] || '').trim() : '';
}

function normalizeLineEndings(text) {
  return String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function extractCssRule(sourceText, selector) {
  const source = normalizeLineEndings(sourceText);
  const start = source.indexOf(`${selector} {`);
  if (start === -1) return '';
  const end = source.indexOf('}', start);
  return end === -1 ? '' : source.slice(start, end + 1).replace(/\s+/g, '');
}

function resolveUpstreamUserscriptPath() {
  const candidates = [
    path.resolve(root, '..', 'nmbxd-EX-for-edit.user.js'),
    path.resolve(root, '..', 'nmbxd-EX.user.js')
  ];
  const upstreamPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!upstreamPath) throw new Error('upstream userscript not found');
  return upstreamPath;
}

function testDirectUserscriptCopy() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  const extensionCopy = read('src/content/nmbxd-EX-for-edit.user.js');
  assert(extensionCopy === upstream, 'Extension userscript copy must be byte-for-byte replaceable from upstream');
}

async function testGifsiclePreload() {
  const code = read('src/content/gifsicle-loader.js');
  let importedUrl = '';
  const context = {
    console,
    URL,
    chrome: {
      runtime: {
        getURL(filePath) {
          return `chrome-extension://test/${filePath}`;
        }
      }
    },
    __xdexImportModule(url) {
      importedUrl = url;
      return Promise.resolve({ default: { run() {} } });
    }
  };
  context.globalThis = context;
  context.window = context;
  vm.runInNewContext(code, context, { filename: 'gifsicle-loader.js' });
  assert(context.__xdexGifsicleModulePromise, 'gifsicle loader must start preloading before userscript executes');
  const api = await context.__xdexGifsicleModulePromise;
  assert(api && typeof api.run === 'function', 'gifsicle preload must resolve a run() API');
  assert(context.__xdexGifsicleModule === api, 'gifsicle preload must populate upstream-visible __xdexGifsicleModule');
  assert(importedUrl.endsWith('/vendor/gifsicle/gifsicle.min.js'), 'gifsicle preload must import packaged vendor file');
}

function testManifestBridgeOrder() {
  const manifest = JSON.parse(read('manifest.json'));
  const contentScript = manifest.content_scripts.find((entry) =>
    Array.isArray(entry.js) && entry.js.includes('src/content/nmbxd-EX-for-edit.user.js')
  );
  assert(contentScript, 'manifest must load Extension userscript copy');
  const js = contentScript.js;
  const gmIndex = js.indexOf('src/content/gm-compat.js');
  const gifsicleIndex = js.indexOf('src/content/gifsicle-loader.js');
  const bridgeIndex = js.indexOf('src/content/userscript-bridge.js');
  const scriptIndex = js.indexOf('src/content/nmbxd-EX-for-edit.user.js');
  assert(gmIndex !== -1, 'manifest must load GM compatibility before direct userscript copy');
  assert(gifsicleIndex !== -1, 'manifest must load gifsicle loader before direct userscript copy');
  assert(bridgeIndex !== -1, 'manifest must load userscript bridge before direct userscript copy');
  assert(gmIndex < gifsicleIndex, 'GM compatibility must execute before gifsicle loader');
  assert(gifsicleIndex < bridgeIndex, 'gifsicle loader must execute before userscript bridge');
  assert(bridgeIndex < scriptIndex, 'userscript bridge must execute before direct userscript copy');
}

function testExtensionRuntimeDescriptor() {
  const code = read('src/content/gm-compat.js');
  const storageListeners = [];
  const context = {
    console,
    localStorage: {
      length: 0,
      key() { return null; },
      setItem() {},
      removeItem() {}
    },
    chrome: {
      runtime: {},
      storage: {
        local: {
          get(_keys, callback) { callback({}); },
          set(_items, callback) { if (callback) callback(); },
          remove(_key, callback) { if (callback) callback(); }
        },
        onChanged: {
          addListener(listener) { storageListeners.push(listener); }
        }
      }
    },
    atob(value) {
      return Buffer.from(value, 'base64').toString('binary');
    },
    document: {
      createElement() { return {}; },
      head: { appendChild() {} },
      documentElement: { appendChild() {} }
    }
  };
  context.globalThis = context;
  context.window = context;
  vm.runInNewContext(code, context, { filename: 'gm-compat.js' });
  assert(context.__xdexRuntime, 'GM compatibility must expose an Extension runtime descriptor before userscript execution');
  assert(context.__xdexRuntime.kind === 'extension', 'Extension runtime descriptor must identify the extension runtime');
  assert(context.__xdexRuntime.gmCompat === true, 'Extension runtime descriptor must declare GM compatibility');
  assert(context.__xdexRuntime.cookieBridge === true, 'Extension runtime descriptor must declare cookie bridge capability');
  assert(context.__xdexRuntime.pageBridge === true, 'Extension runtime descriptor must declare page bridge capability');
  assert(context.__xdexRuntime.packagedGifsicle === true, 'Extension runtime descriptor must declare packaged gifsicle capability');
}

function testGmInfoMetadataMatchesUserscriptHeader() {
  const code = read('src/content/gm-compat.js');
  const userscriptHeader = normalizeLineEndings(extractUserscriptHeader(read('src/content/nmbxd-EX-for-edit.user.js')));
  const storageListeners = [];
  const context = {
    console,
    localStorage: {
      length: 0,
      key() { return null; },
      setItem() {},
      removeItem() {}
    },
    chrome: {
      runtime: {},
      storage: {
        local: {
          get(_keys, callback) { callback({}); },
          set(_items, callback) { if (callback) callback(); },
          remove(_key, callback) { if (callback) callback(); }
        },
        onChanged: {
          addListener(listener) { storageListeners.push(listener); }
        }
      }
    },
    atob(value) {
      return Buffer.from(value, 'base64').toString('binary');
    },
    document: {
      createElement() { return {}; },
      head: { appendChild() {} },
      documentElement: { appendChild() {} }
    }
  };
  context.globalThis = context;
  context.window = context;
  vm.runInNewContext(code, context, { filename: 'gm-compat.js' });

  assert(context.GM_info, 'GM compatibility must expose GM_info');
  assert(context.GM_info.scriptMetaStr === userscriptHeader, 'GM_info.scriptMetaStr must match Extension userscript header');
  assert(context.GM_info.script.name === readMetaValue(userscriptHeader, 'name'), 'GM_info script name must match userscript @name');
  assert(context.GM_info.script.version === readMetaValue(userscriptHeader, 'version'), 'GM_info script version must match userscript @version');
  assert(context.GM_info.scriptMetaStr.includes('// @changelog'), 'GM_info script metadata must include userscript @changelog');
  assert(!context.GM_info.scriptMetaStr.includes('Chrome/Edge MV3 migration prototype'), 'GM_info script metadata must not use the Extension prototype placeholder changelog');
}

function testManifestVersionMatchesUserscriptHeader() {
  const manifest = JSON.parse(read('manifest.json'));
  const userscriptHeader = normalizeLineEndings(extractUserscriptHeader(read('src/content/nmbxd-EX-for-edit.user.js')));
  const userscriptVersion = readMetaValue(userscriptHeader, 'version');
  assert(manifest.version === userscriptVersion, 'manifest version must match userscript @version');
}

function testExtensionUpdateHostPermissions() {
  const manifest = JSON.parse(read('manifest.json'));
  const userscriptHeader = normalizeLineEndings(extractUserscriptHeader(read('src/content/nmbxd-EX-for-edit.user.js')));
  const hostPermissions = manifest.host_permissions || [];
  assert(hostPermissions.includes('https://raw.githubusercontent.com/*'), 'manifest must allow Extension update checks against GitHub raw content');
  assert(hostPermissions.includes('https://cdn.jsdelivr.net/*'), 'manifest must allow Extension update checks against jsDelivr fallback');
  assert(hostPermissions.includes('https://fastly.jsdelivr.net/*'), 'manifest must allow Extension update checks against fastly jsDelivr fallback');
  assert(hostPermissions.includes('https://api.nmb.best/*'), 'manifest must allow post-history getLastPost API requests');
  assert(hostPermissions.includes('https://image.nmb.best/*'), 'manifest must allow X island image CDN requests');
  assert(hostPermissions.includes('https://update.greasyfork.org/*'), 'manifest must allow GreasyFork update metadata requests');
  assert(hostPermissions.includes('https://scriptcat.org/*'), 'manifest must allow ScriptCat update API requests');
  assert(hostPermissions.includes('https://code.jquery.com/*'), 'manifest must allow userscript @require jQuery source if loaded externally');
  assert(hostPermissions.includes('https://unpkg.com/*'), 'manifest must allow userscript @require UPNG source if loaded externally');
  [
    'nmbxd1.com',
    'www.nmbxd1.com',
    'nmbxd.com',
    'www.nmbxd.com',
    'nmb-search.166666666.xyz',
    'image.nmb.best',
    'api.nmb.best',
    'raw.githubusercontent.com',
    'cdn.jsdelivr.net',
    'fastly.jsdelivr.net',
    'update.greasyfork.org',
    'scriptcat.org',
    'code.jquery.com',
    'unpkg.com'
  ].forEach((host) => {
    assert(userscriptHeader.includes(`// @connect      ${host}`), `userscript metadata must allow GM requests to ${host}`);
  });
}

function testRuntimeSpecificUpdateSources() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  assert(upstream.includes('UPDATE_EXTENSION_GITHUB_JSON_URL'), 'userscript must define an Extension GitHub update.json source');
  assert(upstream.includes('https://raw.githubusercontent.com/SayaGoodBye/nmbxd-EX/main/nmbxd-EX-Extension/update.json'), 'Extension update source must use GitHub raw update.json, not the GitHub blob page');
  assert(upstream.includes('UPDATE_EXTENSION_JSDELIVR_JSON_URL'), 'userscript must define an Extension jsDelivr update.json fallback source');
  assert(upstream.includes('https://fastly.jsdelivr.net/gh/SayaGoodBye/nmbxd-EX@main/nmbxd-EX-Extension/update.json'), 'Extension update source must use explicit fastly jsDelivr @main update.json fallback');
  assert(upstream.includes('fetchExtensionUpdateJson('), 'Extension update checks must parse the generated update.json index');
  assert(upstream.includes('function getUpdateCheckRequestsForRuntime()'), 'userscript must route update requests by runtime');
  assert(upstream.includes("XDEX_RUNTIME.kind === 'extension'"), 'update checks must branch for the Extension runtime');
  assert(upstream.includes("fetchMetaVersionAndChangelog(UPDATE_GREASYFORK_META_URL, 'greasyfork')"), 'userscript runtime must keep GreasyFork update checks');
  assert(upstream.includes("fetchScriptCatVersionAndChangelog(UPDATE_SCRIPTCAT_API_URL, 'scriptcat')"), 'userscript runtime must keep ScriptCat update checks');
}

function testGeneratedUpdateJsonContract() {
  const script = read('scripts/sync-userscript-meta.js');
  assert(script.includes('updateJsonPath'), 'metadata sync script must write the Extension update.json index');
  assert(script.includes('buildUpdateJson'), 'metadata sync script must build update.json from userscript metadata');
  assert(script.includes('https://github.com/SayaGoodBye/nmbxd-EX/releases/latest'), 'update.json must advertise the GitHub release download route');
  assert(script.includes('https://pan.baidu.com/s/1-ELWglsTXG8jK5S6WwqtsQ?pwd=k8zf'), 'update.json must advertise the BaiduPan mirror route');
}

function testGithubUpdateFooterHighlight() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  assert(upstream.includes('xdex-update-source-github'), 'footer highlight cleanup must know the GitHub update source class');
  assert(upstream.includes('github: {'), 'footer highlight map must include a GitHub source entry');
  assert(upstream.includes("primary: 'github'"), 'GitHub update source must highlight GitHub as primary');
  assert(upstream.includes("secondary: ['baidupan']"), 'GitHub update source must highlight BaiduPan as secondary');
  assert(upstream.includes("primary: 'baidupan'"), 'jsDelivr fallback update source must highlight BaiduPan as primary');
  assert(upstream.includes("secondary: ['github']"), 'jsDelivr fallback update source must keep GitHub as secondary');
}

function testRunLinkBlankContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  assert(upstream.includes('function runLinkBlank(root = document)'), 'userscript must keep runLinkBlank for board/sidebar/footer links');
  assert(upstream.includes("const selector = '#h-content .h-threads-list a, .margin-bottom a, .margin-top a, [style*=\"margin-top: -5px\"] a, [style*=\"margin-top:-5px\"] a, #h-menu-content a'"), 'runLinkBlank must include class-based footer/sidebar links and inline margin-top:-5px link containers');
  assert(upstream.includes("if (a.closest('.uk-parent')) return;"), 'runLinkBlank must not force .uk-parent links into new tabs');
  assert(upstream.includes("if (!href || href === '#' || /^javascript:/i.test(href)) return;"), 'runLinkBlank must keep empty/hash/javascript links untouched');
  assert(upstream.includes("a.setAttribute('target', '_blank')"), 'runLinkBlank must still force eligible links to open in a new tab');
  assert(upstream.includes('e.ctrlKey || e.metaKey'), 'runLinkBlank click handling must keep modifier-key behavior explicit');
}

function testSettingsPanelModuleShellContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  const tabSlotCss = extractCssRule(upstream, '#sp_panel_tab_slot');
  const tabCss = extractCssRule(upstream, '#sp_panel_tab_slot .sp_panel_tab');
  const settingsTabCss = extractCssRule(upstream, '#sp_panel_tab_slot .sp_panel_tab[data-sp-module="settings"]');
  const historyTabCss = extractCssRule(upstream, '#sp_panel_tab_slot .sp_panel_tab[data-sp-module="history"]');
  const tabIconCss = extractCssRule(upstream, '#sp_panel_tab_slot .sp_panel_tab_icon');
  const tabLabelCss = extractCssRule(upstream, '#sp_panel_tab_slot .sp_panel_tab_label');
  const tabExpandedCss = extractCssRule(upstream, '#sp_panel_tab_slot .sp_panel_tab.active,\n                  #sp_panel_tab_slot .sp_panel_tab:hover,\n                  #sp_panel_tab_slot .sp_panel_tab:focus,\n                  #sp_panel_tab_slot .sp_panel_tab:focus-visible,\n                  #sp_panel_tab_slot .sp_panel_tab.is-hover');
  const tabLabelExpandedCss = extractCssRule(upstream, '#sp_panel_tab_slot .sp_panel_tab.active .sp_panel_tab_label,\n                  #sp_panel_tab_slot .sp_panel_tab:hover .sp_panel_tab_label,\n                  #sp_panel_tab_slot .sp_panel_tab:focus .sp_panel_tab_label,\n                  #sp_panel_tab_slot .sp_panel_tab:focus-visible .sp_panel_tab_label,\n                  #sp_panel_tab_slot .sp_panel_tab.is-hover .sp_panel_tab_label');
  const panelViewsCss = extractCssRule(upstream, '#sp_panel_views');
  const moduleActiveCss = extractCssRule(upstream, '.sp_panel_module.active');
  assert(upstream.includes("sp_enableImageContextMenu: 'userscript模式：为图片/动图启用自定义右键菜单，关闭后保留浏览器原生图片右键菜单，复制图片过程中需要浏览器窗口在前台。\\nextension模式：在浏览器右键菜单中添加“X岛-EX：复制GIF/APNG”按钮，仅用于复制GIF/APNG，在复制GIF/APNG过程中可不在前台。'"), 'image context menu setting description must explain userscript and extension behavior with a line break');
  assert(upstream.includes('id="sp_panel_tab_slot"'), 'settings panel must reserve a left-side module tab slot #sp_panel_tab_slot');
  assert(upstream.includes('id="sp_panel_views"'), 'settings panel must include a module view container #sp_panel_views');
  assert(upstream.includes('id="sp_module_settings"'), 'settings panel must wrap existing settings UI in #sp_module_settings');
  assert(upstream.includes('data-sp-module="settings"'), 'settings panel must add a visible Settings module tab control');
  assert(upstream.includes('data-sp-module="history"'), 'settings panel must add a visible History module tab control');
  assert(upstream.includes('<span class="sp_panel_tab_icon">设</span><span class="sp_panel_tab_label">设置</span>'), 'settings tab must expose stable icon and label spans with 设/设置 text');
  assert(upstream.includes('<span class="sp_panel_tab_icon">浏</span><span class="sp_panel_tab_label">浏览历史</span>'), 'history tab must expose stable icon and label spans with 浏/浏览历史 text');
  assert(upstream.includes('id="sp_module_history"'), 'settings panel must add a History module view #sp_module_history');
  assert(upstream.includes('setSettingsPanelModule'), 'settings panel must expose an in-place active module setter');
  assert(upstream.includes('data-sp-module-view="settings"'), 'settings panel must declare the settings module view');
  assert(upstream.includes('data-sp-module-view="history"'), 'settings panel must declare the history module view');
  assert(upstream.includes('#sp_panel_tab_slot:empty'), 'reserved tab slot must stay visually inert while no tabs are registered');
  assert(tabSlotCss.includes('align-items:flex-end'), 'side module tab slot must keep collapsed bookmarks attached to the panel edge');
  assert(tabCss.includes('--sp-panel-tab-label-width:4em'), 'side module tab expanded label area must reserve four Chinese-character widths');
  assert(tabCss.includes('width:var(--sp-panel-tab-collapsed-width)') && tabCss.includes('min-height:50px'), 'side module tabs must be taller collapsed bookmarks');
  assert(tabCss.includes('background:var(--sp-panel-tab-bg)') && tabCss.includes('color:#fff'), 'side module tabs must use their per-tab color variable as the visible background');
  assert(settingsTabCss.includes('--sp-panel-tab-bg:#006666'), 'settings side tab color must be exactly #006666');
  assert(historyTabCss.includes('--sp-panel-tab-bg:#0080FF'), 'history side tab color must be exactly #0080FF');
  assert(tabIconCss.includes('border-radius:50%') && tabIconCss.includes('text-align:center'), 'side module tab icon must render as a centered circle for future icon replacement');
  assert(tabLabelCss.includes('width:var(--sp-panel-tab-label-width)') && tabLabelCss.includes('text-align:center') && tabLabelCss.includes('opacity:0'), 'side module tab label must reserve four-character centered text while hidden by default');
  assert(upstream.includes('#sp_panel_tab_slot .sp_panel_tab:focus,') && tabExpandedCss.includes('width:var(--sp-panel-tab-expanded-width)'), 'active, hover, focus, focus-visible, and is-hover states must expand side module tabs');
  assert(upstream.includes('#sp_panel_tab_slot .sp_panel_tab:focus .sp_panel_tab_label,') && tabLabelExpandedCss.includes('opacity:1'), 'active, hover, focus, focus-visible, and is-hover states must reveal side module tab labels');
  assert(upstream.includes(".off('mouseenter mouseleave', '.sp_panel_tab')"), 'side module tabs must bind a compatibility hover namespace to the full .sp_panel_tab');
  assert(upstream.includes(".on('mouseenter', '.sp_panel_tab', (e) => { $(e.currentTarget).addClass('is-hover'); })"), 'side module tabs must add .is-hover on mouseenter');
  assert(upstream.includes(".on('mouseleave', '.sp_panel_tab', (e) => { $(e.currentTarget).removeClass('is-hover'); })"), 'side module tabs must remove .is-hover on mouseleave');
  assert(panelViewsCss.includes('display:flex'), 'module shell must own the middle flex body area');
  assert(panelViewsCss.includes('flex-direction:column') && panelViewsCss.includes('flex:1') && panelViewsCss.includes('min-height:0'), 'module shell must preserve panel top/bottom bounds with a flex body');
  assert(moduleActiveCss.includes('display:flex') && moduleActiveCss.includes('flex-direction:column'), 'active module must remain a flex column body');
  assert(upstream.includes('overflow-y:auto;flex:1;min-height:300px;'), 'settings content must keep the original low-height scroll behavior');
  assert(upstream.includes("#sp_apply').toggle(nextModule === 'settings')"), 'settings panel module setter must show #sp_apply only for settings module');
  assert(upstream.includes("#sp_panel_footer .sp_panel_links').show()"), 'settings panel footer link container must stay visible so #sp_close remains right-aligned');
  assert(upstream.includes("#sp_panel_footer .sp_panel_links a').toggle(nextModule === 'settings')"), 'settings panel footer links themselves must be hidden outside the Settings module');
  assert(!upstream.includes("#sp_module_history #sp_apply"), 'History module must not use the global #sp_apply button');
  assert(!upstream.includes('sp_update_log_link'), 'settings panel module shell must not require the removed update-log link');

  const setterIndex = upstream.indexOf('function setSettingsPanelModule');
  const syncInputsIndex = upstream.indexOf('syncInputs', setterIndex);
  const setterEndIndex = upstream.indexOf('}', setterIndex);
  assert(setterIndex !== -1, 'settings panel module setter must be defined as a function');
  assert(syncInputsIndex === -1 || syncInputsIndex > setterEndIndex, 'settings panel module switching must not call syncInputs()');
}

function testSettingsPanelSaveAndReloadContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  assert(upstream.includes('<button id="sp_apply" style="padding:6px 10px;">保存并刷新</button>'), 'settings apply button must be labeled 保存并刷新');
  assert(upstream.includes('const reloadRequiredSettingKeys = ['), 'settings panel must keep a shared list of reload-required checkbox keys');
  assert(upstream.includes("'enableCookieSwitch'"), 'reload-required setting list must include regular checkbox settings');
  assert(upstream.includes("'toggleSidebar'"), 'reload-required setting list must include the final regular checkbox setting');
  assert(upstream.includes('collectReloadRequiredSettingsFromPanel'), 'settings panel must collect reload-required checkbox state through a named helper');
  assert(upstream.includes("reloadRequiredSettingKeys.forEach(k => { this.state[k] = $('#sp_' + k).is(':checked'); })"), 'reload-required checkbox state must be collected from current panel inputs');
  assert(upstream.includes('const saveReloadRequiredSettingsImmediately = () => {'), 'settings panel must save reload-required checkbox changes immediately');
  assert(upstream.includes(".off('change.xdexReloadSettingSave')"), 'settings panel must namespace immediate-save checkbox change handlers');
  assert(upstream.includes(".on('change.xdexReloadSettingSave', saveReloadRequiredSettingsImmediately)"), 'settings panel must persist reload-required checkbox changes on change');
  assert(upstream.includes("toast('设置已保存，刷新后生效'"), 'immediate checkbox save must tell users the change will apply after refresh');
  assert(/\$\('#sp_apply'\)\.off\('click'\)\.on\('click',\s*\(\)\s*=>\s*\{\s*collectReloadRequiredSettingsFromPanel\(\);/.test(upstream), '保存并刷新 must reuse the same checkbox collection helper before saving and reloading');
  assert(!upstream.includes('<button id="sp_apply" style="padding:6px 10px;">应用更改</button>'), 'old 应用更改 button label must not remain');
}

function testBrowsingHistoryStorageContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  assert(upstream.includes("const THREAD_HISTORY_STORAGE_KEY = 'xdex_thread_history'"), 'userscript must define local-only xdex_thread_history GM key');
  assert(upstream.includes("const THREAD_HISTORY_SYNC_EVENT = 'xdex:thread-history-changed'"), 'history updates must have a same-page sync event for open panels');
  assert(upstream.includes('THREAD_HISTORY_LIVE_RENDER_DEBOUNCE_DELAY = 300'), 'history live sync must debounce restore storms before re-rendering');
  assert(upstream.includes('THREAD_HISTORY_LIVE_RENDER_MAX_WAIT = 1500'), 'history live sync must cap debounce wait during large restore storms');
  assert(upstream.includes('THREAD_HISTORY_REVISIT_DWELL_MS = 5000'), 'history reactivation visits must require a dwell threshold to avoid counting quick tab switches');
  assert(upstream.includes('function createDefaultThreadHistoryStore()'), 'userscript must define a default history store factory');
  assert(upstream.includes('version: 1'), 'history store shape must include version: 1');
  assert(upstream.includes('limit: 500'), 'history store shape must include limit: 500');
  assert(upstream.includes('items: {}'), 'history store shape must include items map');
  assert(upstream.includes('index: {}'), 'history store shape must include index map');
  assert(upstream.includes('order: []'), 'history store shape must include order list');
  assert(upstream.includes('function normalizeThreadHistoryStore'), 'userscript must normalize/repair history store consistency');
  assert(upstream.includes('function upsertThreadHistoryRecord'), 'userscript must upsert history records');
  assert(upstream.includes('function getThreadHistoryPaginationBounds'), 'history writes must derive page bounds from the rendered pagination bar');
  assert(upstream.includes('paginations[paginations.length - 1]'), 'history page bounds must use the last pagination bar because upper bars can be stale');
  assert(upstream.includes('/末页\\s*\\((\\d+)\\)/') || upstream.includes('末页\\s*\\((\\d+)\\)'), 'history page bounds must parse explicit last-page labels like 末页(554)');
  assert(upstream.includes("source: lastPageLink ? 'last-link' : 'disabled-next'"), 'history page bounds must fall back to disabled/no-link next-page state at the real last page');
  assert(upstream.includes('function applyThreadHistoryPageBounds'), 'history records must clamp dirty page/url/maxVisitedPage values before saving');
  assert(upstream.includes('buildThreadHistoryPageUrl(next.mode, next.threadId, boundedPage)'), 'dirty history URLs must be rebuilt to the validated bounded page');
  assert(upstream.includes('applyThreadHistoryPageBounds(mergedBase)'), 'existing polluted history records must be corrected on the next write');
  assert(upstream.includes('const countVisit = options.countVisit !== false'), 'history upsert must distinguish real visits from progress-only touches');
  assert(upstream.includes('visitCount: (Number(old.visitCount) || 0) + (countVisit ? 1 : 0)'), 'progress-only history updates must not increment visitCount');
  assert(upstream.includes('function touchThreadHistoryCurrentLocation'), 'history must update latest URL/page/max page without counting a new visit');
  assert(upstream.includes('function recordThreadHistoryProgress'), 'seamless paging must upsert progress records even when the current item was not saved yet');
  assert(upstream.includes("reason: 'seamless-page'"), 'seamless paging must update history progress separately from visit counting');
  assert(upstream.includes('recordThreadHistoryProgress({ url: nextUrl, page: nextPageNum'), 'seamless paging must update saved URL and max page after pushState');
  assert(!upstream.includes('touchThreadHistoryCurrentLocation({ url: nextUrl, page: nextPageNum'), 'seamless paging must not depend on an existing history item to update page progress');
  assert(upstream.includes('countVisit: false') && upstream.includes("reason: options.reason || 'progress'"), 'seamless progress updates must not increment visitCount');
  assert(upstream.includes("recordCurrentThreadHistory(0, { reason: 'reply-success-refresh', countVisit: false, touchVisitedAt: true })"), 'successful replies must refresh the current thread history record without incrementing visit count');
  assert(upstream.includes('function installThreadHistoryReactivationTracking'), 'history must track reactivation dwell for already-open thread pages');
  assert(upstream.includes('function scheduleThreadHistoryReactivationVisit'), 'history must schedule dwell-based visits when a thread page becomes active again');
  assert(upstream.includes('document.addEventListener(\'visibilitychange\''), 'history dwell tracking must use visibilitychange');
  assert(upstream.includes("window.addEventListener('focus'"), 'history dwell tracking must use focus as a compatibility signal');
  assert(upstream.includes("recordCurrentThreadHistory(0, { reason: 'reactivation-dwell', countVisit: true })"), 'history must only count reactivated pages after dwell threshold passes');
  assert(upstream.includes('installThreadHistoryReactivationTracking(true)') && upstream.includes('installThreadHistoryReactivationTracking(false)'), 'startup must avoid counting hidden restored pages until they become active and dwell long enough');
  assert(upstream.includes("notifyThreadHistoryStoreChanged('local-write', false)"), 'history writes must notify already-open panels in this page');
  assert(upstream.includes('function bindThreadHistoryLiveSync'), 'history panel must bind live synchronization listeners');
  assert(upstream.includes('GM_addValueChangeListener(THREAD_HISTORY_STORAGE_KEY'), 'history panel must listen to cross-page GM value changes');
  assert(upstream.includes('window.addEventListener(THREAD_HISTORY_SYNC_EVENT'), 'history panel must listen to same-page history sync events');
  assert(upstream.includes('function isThreadHistoryPanelOpen'), 'history live sync must avoid re-rendering while the panel is closed');
  assert(upstream.includes('lastLiveSync'), 'history live sync must expose diagnostics for cross-page refreshes');
  assert(upstream.includes('pendingCount: threadHistoryLiveRenderPendingCount'), 'history live sync diagnostics must report batched pending updates');
  assert(upstream.includes('clearTimeout(threadHistoryLiveRenderTimer)'), 'history live sync must merge repeated writes into one delayed render');
  assert(upstream.includes('Math.min(THREAD_HISTORY_LIVE_RENDER_DEBOUNCE_DELAY, THREAD_HISTORY_LIVE_RENDER_MAX_WAIT - elapsed)'), 'history live sync must combine short debounce with max-wait flushing');
  assert(upstream.includes('renderThreadHistoryModule();'), 'history live sync must re-render the visible module after storage changes');
  assert(upstream.includes('bindThreadHistoryLiveSync();'), 'settings panel render must install history live sync once');
  const readyStart = upstream.indexOf('$(document).ready(() => {');
  const readySyncEnd = upstream.indexOf("startupPerfDebug.mark('document.ready.syncSetup.end'", readyStart);
  const readyThreadSync = upstream.indexOf('bindThreadHistoryLiveSync();', readyStart);
  const readyPostSync = upstream.indexOf('bindPostHistoryLiveSync();', readyStart);
  assert(readyThreadSync !== -1 && readyPostSync !== -1 && readyThreadSync < readyPostSync && readyThreadSync < readySyncEnd, 'startup must bind thread-history live sync before post-history sync so cross-page history refresh works without opening settings first');
  assert(upstream.includes('function searchThreadHistory'), 'userscript must search only the lightweight history index');
  assert(upstream.includes('function compareThreadHistoryResults'), 'history search must support user-selectable result sorting');
  assert(!upstream.includes("'xdex_thread_history',"), 'history GM key must not be added to Extension sync key lists');
}

function testPostHistoryStorageAndCompletionContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  assert(upstream.includes("const POST_HISTORY_STORAGE_KEY = 'xdex_post_history'"), 'userscript must define local-only xdex_post_history GM key');
  assert(upstream.includes('function createDefaultPostHistoryStore()'), 'post history must define a default store factory');
  assert(upstream.includes('version: POST_HISTORY_STORE_VERSION') && upstream.includes('items: {}') && upstream.includes('order: []'), 'post history store shape must be { version, items, order } (limit removed, per-type limits used instead)');
  assert(upstream.includes('// limit: POST_HISTORY_LIMIT,'), 'post history shared limit field must be commented out in favor of per-type limits');
  assert(upstream.includes('POST_HISTORY_THREAD_LIMIT') && upstream.includes('POST_HISTORY_REPLY_LIMIT'), 'post history must define per-type limits for threads and replies');
  assert(upstream.includes('status: \'pending\'') && upstream.includes("'confirmed'") && upstream.includes("'unconfirmed'") && upstream.includes("'failed'"), 'post history records must support pending, confirmed, unconfirmed, and failed statuses');
  assert(upstream.includes("type === 'reply' ? 'reply' : 'thread'"), 'post history records must normalize thread/reply types');
  assert(upstream.includes('function snapshotSubmittedPostHistory(fd, options)'), 'post history must snapshot the final submitted FormData');
  const successIndex = upstream.indexOf('if (successMsg) {');
  const toastIndex = upstream.indexOf('toast(successMsg.textContent.trim()', successIndex);
  const snapshotIndex = upstream.indexOf('snapshotSubmittedPostHistory(fd, { isPost, isReply, form });', successIndex);
  const cleanupIndex = upstream.indexOf('// 清空输入框', successIndex);
  assert(successIndex !== -1 && toastIndex !== -1 && snapshotIndex > toastIndex && snapshotIndex < cleanupIndex, 'post history snapshot must run after success toast and before cleanup');
  assert(upstream.includes('upsertPostHistoryRecord(snapshot);') && upstream.includes('completePostHistorySnapshot(localId, snapshot, 0);'), 'post history must save pending before starting non-blocking completion');
  const normalizeStart = upstream.indexOf('function normalizePostHistoryText(text)');
  const normalizeBody = upstream.slice(normalizeStart, upstream.indexOf('function hashPostHistoryText', normalizeStart));
  assert(normalizeBody.includes(".replace(/<br\\s*\\/?\\s*>/gi, ' ')") && normalizeBody.includes(".replace(/<[^>]+>/g, '')"), 'post history text normalization must make API HTML content comparable to submitted plain text');
  assert(normalizeBody.includes(".replace(/&gt;/gi, '>')") && normalizeBody.includes(".replace(/&amp;/gi, '&')"), 'post history text normalization must decode basic HTML entities before content matching');
  assert(upstream.includes("const POST_HISTORY_API_BASE = `${location.origin}/Api`"), 'post history completion must use same-origin /Api for cookie-bound recent-post lookup');
  assert(upstream.includes('function fetchPostHistorySameOriginText(url, context, stage)') && upstream.includes("credentials: 'include'") && upstream.includes("cache: 'no-store'"), 'post history API requests must use page same-origin fetch with credentials');
  assert(upstream.includes('`${POST_HISTORY_API_BASE}/getLastPost`'), 'post history completion must keep GET /getLastPost as the highest-priority confirmation API');
  assert(upstream.includes('function completePostHistoryFromThreadFallback(localId, snapshot, retryAttempt)') && upstream.includes('function fetchPostHistoryThreadPage(threadId, page, context)'), 'post history must define a thread tail-page fallback after getLastPost is exhausted');
  const completionStart = upstream.indexOf('function completePostHistorySnapshot(localId, snapshot, attempt = 0)');
  const completionBody = upstream.slice(completionStart, upstream.indexOf('function snapshotSubmittedPostHistory', completionStart));
  assert(completionBody.includes('fetchLastPostHistoryPost({ localId, attempt })') && completionBody.includes('completePostHistoryFromThreadFallback(localId, snapshot)'), 'completion must include getLastPost and fallback calls');
  assert(completionBody.includes('completePostHistoryFromThreadFallback(localId, confirmedSnapshot)') && completionBody.includes("const confirmedResto = String(post.resto || snapshot.resto || '').trim();") && completionBody.includes('const confirmedSnapshot = Object.assign({}, snapshot, { id, postId: id, resto: confirmedResto, threadId: confirmedResto });'), 'completion must verify reply pages with the real resto returned by getLastPost so board-page replies scan the correct thread');
  assert(completionBody.indexOf('completePostHistoryFromThreadFallback(localId, snapshot)') < completionBody.indexOf('fetchLastPostHistoryPost({ localId, attempt })'), 'thread fallback must be in the retry-exhausted branch before scheduled getLastPost attempts');
  assert(upstream.includes("const POST_HISTORY_THREAD_API_BASE = 'https://api.nmb.best/api'"), 'post history thread fallback must define api.nmb.best as the primary thread API source');
  assert(upstream.includes('`${POST_HISTORY_THREAD_API_BASE}/thread?id=${encodeURIComponent(threadId)}&page=${encodeURIComponent(page)}`'), 'thread fallback must use api.nmb.best/api/thread?id={threadId}&page={page} as the primary request URL');
  assert(upstream.includes("fetchPostHistoryThreadApiPage(threadId, page, detail)") && upstream.includes(".catch(() => fetchPostHistorySameOriginThreadPage(threadId, page, detail))"), 'thread fallback must try api.nmb.best first and only hit same-origin /Api/thread after API failure');
  assert(upstream.includes("logPostHistory('thread api request'") && upstream.includes("logPostHistory('thread api response'") && upstream.includes("logPostHistory('thread api error'"), 'thread API fallback must expose api.nmb.best request, response, and error stages');
  assert(upstream.includes("fetchPostHistorySameOriginText(url, detail, 'thread same-origin fallback')") && upstream.includes("logPostHistory(label + ' request'") && upstream.includes("logPostHistory('thread fallback confirmed'") && upstream.includes("logPostHistory('thread fallback exhausted'"), 'thread same-origin fallback and final thread confirmation stages must remain observable');
  assert(upstream.includes('function buildPostHistoryThreadCandidate(reply, thread, page)') && upstream.includes('page: Math.max(1, Number(page) || 1)'), 'thread fallback candidates must carry the page where a reply was found');
  assert(upstream.includes('return { thread, replies, replyCount, page: Math.max(1, Number(context && context.page) || 1) };'), 'thread fallback parser must preserve the requested page on parsed page data');
  assert(upstream.includes('const POST_HISTORY_REPLIES_PER_PAGE = 19'), 'post history thread-page verification must define the API reply page size explicitly');
  assert(upstream.includes('const tailPage = Math.max(1, Math.ceil(total / POST_HISTORY_REPLIES_PER_PAGE));'), 'thread fallback must derive the tail page from ReplyCount and 19 replies per page');
  assert(upstream.includes('const pages = [tailPage, tailPage - 1]'), 'thread fallback must only scan the tail page and then the previous page');
  assert(!upstream.includes('tailPage - 2') && !upstream.includes('tailPage, tailPage - 1, tailPage - 2, 1'), 'thread fallback must not scan extra pages before the previous page is needed');
  assert(upstream.includes('const firstPage = await fetchPostHistoryThreadPage(threadId, 1, { localId, phase: \'count\', retryAttempt:') && upstream.includes('const pages = getPostHistoryThreadFallbackPages(firstPage.replyCount);'), 'thread fallback must fetch page=1 for ReplyCount before scanning tail pages');
  assert(!upstream.includes("phase: 'hint-scan'") && !upstream.includes('hintedPage'), 'thread fallback must not assume the page where the user submitted is where the new reply belongs');
  assert(upstream.includes("const existingPage = type === 'thread' ? (Number(existing.page) || 0) : 0;") && upstream.includes('page: Math.max(0, Number(post.page) || existingPage || (type === \'thread\' ? 1 : 0))'), 'confirmed reply records must not preserve the page where the user submitted as the actual reply page');
  assert(upstream.includes('const parsedSource = parseThreadHistoryUrl(location.href);') && upstream.includes("page: type === 'thread' ? (parsedSource ? parsedSource.page : 1) : 0"), 'post history reply snapshots must not store the current browsing page as the reply location');
  assert(upstream.includes('Array.isArray(data) ? (data[0] || null) : data'), 'post history completion must handle [] / [post] getLastPost responses');
  assert(upstream.includes('POST_HISTORY_GET_LAST_POST_RETRY_DELAYS = [300, 800, 1500, 2500]'), 'post history must use a short retry schedule for getLastPost');
  assert(upstream.includes("updatePostHistoryRecord(localId, { status: 'unconfirmed' })"), 'post history must keep unresolved records as unconfirmed');
  assert(upstream.includes("Number(resto) === 0 ? 'thread' : 'reply'"), 'getLastPost completion must classify Number(resto) === 0 as thread and non-zero as reply');
  assert(upstream.includes('function buildCanonicalReplyUrl(threadId, replyId)') && upstream.includes('return buildCanonicalReplyUrl(threadId, postId);'), 'post history reply links must build canonical /t/{threadId}?r={postId} URLs');
  assert(upstream.includes('return `${location.origin}/t/${threadId}?r=${threadId}`'), 'post history thread links must use ?r= format directly');
  assert(upstream.includes('postHistoryMatchesSnapshot') && upstream.includes('contentHash') && upstream.includes('POST_HISTORY_MATCH_TIME_WINDOW_MS') && upstream.includes('usedIds.has(id)') && upstream.includes("type === 'reply'"), 'post history matching must use type, content hash, reply resto, time window, and confirmed id reuse guards');
  assert(upstream.includes('window.__xdexPostHistoryDebug') && upstream.includes('function logPostHistory(stage, data, level = \'log\')'), 'post history must expose a bounded debug event buffer and stage logger');
  assert(upstream.includes('window.__xdexGetPostHistoryDebug = function getPostHistoryDebug()') && upstream.includes('window.__xdexClearPostHistoryDebug = function clearPostHistoryDebug()'), 'post history debug must expose getter and clear APIs for Extension bridges');
  assert(upstream.includes("logPostHistory('snapshot'") && upstream.includes("logPostHistory('store upsert'") && upstream.includes("logPostHistory('store update'"), 'post history must log snapshot and store write stages');
  assert(upstream.includes("logPostHistory('store update skipped'") && upstream.includes("logPostHistory('store notify'"), 'post history must log missing-record updates and store notifications');
  assert(upstream.includes("logPostHistory('completion scheduled'") && upstream.includes("logPostHistory('completion retry'") && upstream.includes("logPostHistory('completion exhausted'"), 'post history must log completion scheduling, retry, and exhaustion stages');
  assert(upstream.includes("fetchPostHistorySameOriginText(url, context, 'getLastPost')") && upstream.includes("logPostHistory(label + ' request'") && upstream.includes("logPostHistory(label + ' response'") && upstream.includes("logPostHistory(label + ' error'"), 'post history must log getLastPost request, response, and error stages');
  assert(upstream.includes("logPostHistory('getLastPost parse'") && upstream.includes("logPostHistory('getLastPost parse failed'") && upstream.includes("logPostHistory('getLastPost empty'"), 'post history must log getLastPost parse, parse failure, and empty response stages');
  assert(upstream.includes("logPostHistory('match rejected'") && upstream.includes("logPostHistory('match accepted'"), 'post history must log match acceptance and rejection stages');
  assert(upstream.includes("logPostHistory('confirmed'") && upstream.includes("logPostHistory('unconfirmed'"), 'post history must log final confirmed and unconfirmed outcomes');
  assert(upstream.includes("reject('type-mismatch'") && upstream.includes("reject('reply-resto-mismatch'") && upstream.includes("reject('missing-time'") && upstream.includes("reject('time-window-mismatch'"), 'post history match logs must expose rejection reason markers');
  assert(upstream.includes("window.confirm('确定要删除这条发言记录吗？')"), 'post history item deletion must ask for confirmation');
  assert(upstream.includes("window.confirm('确定要清空全部我的发言记录吗？')"), 'post history clear must ask for confirmation');
  assert(!upstream.includes("'xdex_post_history',"), 'post history GM key must not be added to Extension sync key lists');
}

function testPostHistoryServerContentWinsContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  const matchStart = upstream.indexOf('function postHistoryMatchesSnapshot(post, snapshot, usedIds)');
  const matchBody = upstream.slice(matchStart, upstream.indexOf('function confirmPostHistorySnapshot', matchStart));
  assert(matchBody.includes("logPostHistory('server content differs'"), 'post-history matching must log when confirmed server content differs from submitted content');
  assert(!matchBody.includes("reject('content-mismatch'"), 'post-history matching must not reject a candidate only because the server normalized its content');
  assert(matchBody.includes('expectedHash: snapshot.contentHash') && matchBody.includes('actualHash: hashPostHistoryText(postText)'), 'post-history content-diff diagnostics must include expected and actual content hashes');

  const confirmStart = upstream.indexOf('function confirmPostHistorySnapshot(localId, post)');
  const confirmBody = upstream.slice(confirmStart, upstream.indexOf('function completePostHistorySnapshot', confirmStart));
  assert(confirmBody.includes('const serverContentRaw = post.content ||'), 'post-history confirmation must derive a server-side content value');
  assert(confirmBody.includes('const serverContentText = normalizePostHistoryText(serverContentRaw);'), 'post-history confirmation must normalize server content for search and hashes');
  assert(confirmBody.includes('contentRaw: serverContentRaw') && confirmBody.includes('contentText: serverContentText') && confirmBody.includes('contentHash: hashPostHistoryText(serverContentText)'), 'post-history confirmation must overwrite saved content fields with server-confirmed content');
  assert(confirmBody.includes('contentHtml: sanitizePostHistoryServerContentHtml(serverContentRaw)'), 'post-history confirmation must preserve sanitized server HTML for rendering line breaks and server substitutions');

  const postItemStart = upstream.indexOf('function buildPostHistoryItemElement(result)');
  const postItemBody = upstream.slice(postItemStart, upstream.indexOf('function renderPostHistoryModule', postItemStart));
  assert(postItemBody.includes('if (item.contentHtml) content.innerHTML = item.contentHtml;'), 'post-history rendering must prefer sanitized server HTML when available');
  assert(postItemBody.includes('else content.textContent = item.contentText || item.contentRaw ||'), 'post-history rendering must keep plain-text fallback for old or pending records');
}

function testPostHistoryForumNameContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  const mapPath = path.resolve(root, '..', 'forum-fid-map.json');
  assert(fs.existsSync(mapPath), 'fid/forum mapping reference file must exist under .temp');
  const mapping = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  assert(mapping && mapping.forums && mapping.forums['98'] && mapping.forums['98'].displayName === 'DANGER/U/', 'fid mapping file must include DANGER/U/ display name');
  assert(mapping.forums['25'] && mapping.forums['25'].displayName === '任天堂NS', 'fid mapping file must store a plain display name for HTML showName entries');
  assert(mapping.timelines && mapping.timelines['7'] && mapping.timelines['7'].displayName === '生活线', 'timeline mapping file must include live timeline ids');

  assert(upstream.includes('const POST_HISTORY_FORUM_FID_MAP = Object.freeze({'), 'userscript must embed a fid-to-forum-name mapping for post history');
  assert(upstream.includes("'98': 'DANGER/U/'") && upstream.includes("'25': '任天堂NS'") && upstream.includes("'60': '三百人委员会'"), 'userscript fid mapping must include known board display names');
  assert(upstream.includes('const POST_HISTORY_TIMELINE_ID_MAP = Object.freeze({') && upstream.includes("'7': '生活线'"), 'userscript must embed timeline names for future post-history use');
  assert(upstream.includes('function normalizePostHistoryFid(fid)') && upstream.includes('function getPostHistoryForumNameByFid(fid)'), 'userscript must centralize post-history fid normalization and display lookup');
  assert(upstream.includes('function getCurrentPostHistoryFid()'), 'userscript may derive a weak fid fallback from the current page when no API fid is available');

  const snapshotStart = upstream.indexOf('function snapshotSubmittedPostHistory(fd, options)');
  const snapshotBody = upstream.slice(snapshotStart, upstream.indexOf('function parseThreadHistoryUrl', snapshotStart));
  assert(snapshotBody.includes('const fallbackFid = getCurrentPostHistoryFid();'), 'post-history snapshots must only capture current-page fid as a fallback');
  assert(snapshotBody.includes('fid: fallbackFid') && snapshotBody.includes('forumName: getPostHistoryForumNameByFid(fallbackFid)'), 'post-history snapshots must store fallback fid and Chinese forum name when available');

  const confirmStart = upstream.indexOf('function confirmPostHistorySnapshot(localId, post)');
  const confirmBody = upstream.slice(confirmStart, upstream.indexOf('function completePostHistorySnapshot', confirmStart));
  assert(confirmBody.includes('const fid = getPostHistoryPostFid(post) || normalizePostHistoryFid(existing.fid);'), 'post-history confirmation must prefer server/API fid and only fall back to saved fid');
  assert(confirmBody.includes('fid,') && confirmBody.includes('forumName: getPostHistoryForumNameByFid(fid)'), 'post-history confirmation must persist fid and forum display name');
  assert(upstream.includes('function getPostHistoryPostFid(post)') && upstream.includes('post.forum_id') && upstream.includes('post.forumId'), 'post-history must centralize API post fid extraction across common field names');
  assert(upstream.includes('function buildPostHistoryThreadCandidate(reply, thread, page)') && upstream.includes('getPostHistoryPostFid(reply) || getPostHistoryPostFid(thread)'), 'thread fallback candidates must carry API thread fid when reply entries omit it');

  const searchStart = upstream.indexOf('function searchPostHistory(query, type)');
  const searchBody = upstream.slice(searchStart, upstream.indexOf('function parseLastPostResponse', searchStart));
  assert(searchBody.includes('item.fid') && searchBody.includes('item.forumName'), 'post-history search must include fid and forum name');

  const postItemStart = upstream.indexOf('function buildPostHistoryItemElement(result)');
  const postItemBody = upstream.slice(postItemStart, upstream.indexOf('function renderPostHistoryModule', postItemStart));
  assert(postItemBody.includes('const forumName = item.forumName || getPostHistoryForumNameByFid(item.fid);'), 'post-history render must resolve a forum name from saved fid');
  assert(postItemBody.includes("appendThreadHistoryText(footer, 'span', 'xdex-post-history-forum', `${forumName}`);"), 'post-history footer must display the Chinese forum name without a redundant label');
  assert(postItemBody.indexOf("appendThreadHistoryText(footer, 'span', 'xdex-post-history-forum'") < postItemBody.indexOf("appendThreadHistoryText(footer, 'span', 'xdex-post-history-type'"), 'post-history footer must display forum name before reply/thread type');
}

function testPostHistoryPanelContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  const postsTabCss = extractCssRule(upstream, '#sp_panel_tab_slot .sp_panel_tab[data-sp-module="posts"]');
  const moduleStart = upstream.indexOf('<div id="sp_module_posts"');
  const moduleEnd = upstream.indexOf('<div id="sp_panel_footer"', moduleStart);
  const moduleBody = upstream.slice(moduleStart, moduleEnd);
  assert(upstream.includes('data-sp-module="posts"'), 'settings panel must add a posts peer module tab');
  assert(upstream.includes('<span class="sp_panel_tab_icon">言</span><span class="sp_panel_tab_label">我的发言</span>'), 'posts tab must expose stable 言/我的发言 icon and label');
  assert(postsTabCss.includes('--sp-panel-tab-bg:#FFFF00') && postsTabCss.includes('color:#332200'), 'posts side tab must use #FFFF00 with dark readable text');
  assert(upstream.includes('id="sp_module_posts"') && upstream.includes('data-sp-module-view="posts"'), 'settings panel must add #sp_module_posts with posts module view');
  assert(moduleBody.includes('id="sp_posts_title"') && moduleBody.includes('我的发言'), 'posts module must title itself 我的发言');
  assert(moduleBody.includes('id="sp_posts_search"') && moduleBody.includes('id="sp_posts_count"') && moduleBody.includes('id="sp_posts_clear"'), 'posts module must include search, count, and clear controls');
  assert(moduleBody.includes('data-post-history-type="thread"') && moduleBody.includes('我的主题') && moduleBody.includes('data-post-history-type="reply"') && moduleBody.includes('我的回复'), 'posts module must include half-width type buttons for themes and replies');
  assert(upstream.includes("let postHistoryActiveType = 'reply'") && moduleBody.includes('data-post-history-type="reply" class="active"'), 'posts module must default to 我的回复');
  assert(upstream.includes('.xdex-post-history-type-buttons button.active') && upstream.includes('background:#F0E0D6'), 'posts active type button must use #F0E0D6 background');
  assert(!moduleBody.includes('sp_posts_sort'), 'posts module must not include a sort select');
  assert(upstream.includes('id="sp_postAfterAction"') && upstream.includes('发串后跳转') && upstream.includes('发串后刷新'), 'settings panel must include a post-after-action dropdown');
  assert(upstream.includes('searchPostHistory(effectiveQuery || \'\', postHistoryActiveType)'), 'posts search must only search within the selected type');
  assert(upstream.includes("postHistoryActiveType === 'reply' ? '暂无我的回复' : '暂无我的主题'"), 'posts module must render per-type empty states');
  assert(upstream.includes("if ($(e.currentTarget).data('spModule') === 'posts') renderPostHistoryModuleSoon();"), 'module switch click must render posts when data-sp-module="posts" is active');
  assert(upstream.includes('function renderPostHistoryModule') && upstream.includes('function bindPostHistoryModuleEvents'), 'posts module must define render and bind functions similar to history');
  assert(upstream.includes('GM_addValueChangeListener(POST_HISTORY_STORAGE_KEY'), 'posts panel must listen to GM value changes');
  assert(upstream.includes('xdex-post-history-delete'), 'posts module must use a separate delete class');
  assert(!upstream.includes("deleteButton.className = 'xdex-history-delete';\n    deleteButton.dataset.postHistoryKey"), 'posts module must not reuse .xdex-history-delete for post records');
}

function testHistorySearchHelpContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  const historyModuleStart = upstream.indexOf('<div id="sp_module_history"');
  const postsModuleStart = upstream.indexOf('<div id="sp_module_posts"');
  const historyModuleBody = upstream.slice(historyModuleStart, postsModuleStart);
  const postsModuleBody = upstream.slice(postsModuleStart, upstream.indexOf('<div id="sp_panel_footer"', postsModuleStart));

  assert(upstream.includes('function buildHistorySearchHelpMark(title)'), 'history modules must share an underlined ? search-help helper');
  assert(upstream.includes("className = 'xdex-history-search-help'") && upstream.includes("textContent = '?'"), 'search-help helper must render a visible ? marker');
  assert(upstream.includes('textDecoration = \'underline\'') || upstream.includes("textDecoration = 'underline'"), 'search-help marker must be underlined');
  assert(historyModuleBody.includes('placeholder="搜索标题、名称、正文、串号等关键词；高级检索见后方 ?"'), 'browsing-history placeholder must summarize normal fields in the shared order and point to the ? help');
  assert(postsModuleBody.includes('placeholder="搜索标题、名称、正文、串号等关键词；高级检索见后方 ?"'), 'post-history placeholder must summarize normal fields in the shared order without Email and point to the ? help');
  assert(upstream.includes('sp_history_count') && upstream.includes('buildHistorySearchHelpMark(THREAD_HISTORY_SEARCH_HELP_TEXT)'), 'browsing-history render must place search help beside the concrete count');
  assert(upstream.includes('sp_posts_count') && upstream.includes('buildHistorySearchHelpMark(POST_HISTORY_SEARCH_HELP_TEXT)'), 'post-history render must place search help beside the concrete count');
  assert(upstream.includes('THREAD_HISTORY_SEARCH_HELP_TEXT') && upstream.includes('POST_HISTORY_SEARCH_HELP_TEXT'), 'both history modules must define their own tooltip text');
}

function testPostHistoryAdvancedSearchContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  const parserStart = upstream.indexOf('function parsePostHistorySearchQuery(query)');
  const parserBody = upstream.slice(parserStart, upstream.indexOf('function parseLastPostResponse', parserStart));
  const searchStart = upstream.indexOf('function searchPostHistory(query, type)');
  const searchBody = upstream.slice(searchStart, upstream.indexOf('function parseLastPostResponse', searchStart));

  assert(parserStart !== -1, 'post-history search must parse advanced query syntax separately from browsing history');
  assert(upstream.includes('function getPostHistoryForumSearchText(item)'), 'post-history search must centralize forum display/raw/group fuzzy text');
  assert(upstream.includes('POST_HISTORY_FORUM_SEARCH_META'), 'post-history forum search must include embedded raw/show/group metadata, not only fid display names');
  assert(upstream.includes("rawName: 'DANGER_U'") && upstream.includes("showName: 'DANGER/U/'") && upstream.includes("groupName: '综合'"), 'forum metadata must allow forum:DAN/forum:danger and group-name matching');
  assert(parserBody.includes('statusFilters') && parserBody.includes('forumFilters') && parserBody.includes('fieldFilters') && parserBody.includes('hasImage') && parserBody.includes('isGif') && parserBody.includes('hasZeroWidth'), 'post-history parser must support status, forum, field, and has filters');
  assert(!parserBody.includes('typeFilters') && !parserBody.includes('type:reply') && !parserBody.includes('type:thread'), 'post-history advanced search must not duplicate the existing thread/reply tabs');
  assert(searchBody.includes('normalizePostHistoryType(item.type) !== selectedType'), 'post-history search must keep the current theme/reply tab as the type boundary');
  assert(searchBody.includes('filters.statusFilters') && searchBody.includes('filters.fidFilters') && searchBody.includes('filters.forumFilters'), 'post-history search must apply status, fid, and fuzzy forum filters');
  assert(searchBody.includes('getPostHistoryForumSearchText(item).includes(value)'), 'forum: filters must fuzzy-match forum display name, raw name, showName, and group name');
  assert(searchBody.includes('filters.hasImage') && searchBody.includes('filters.isGif') && searchBody.includes('filters.hasZeroWidth'), 'post-history search must support image/gif/zero-width has filters');
  assert(searchBody.includes('item.resto') && searchBody.includes('item.contentRaw') && searchBody.includes('item.sourceUrl') && searchBody.includes('item.url') && searchBody.includes('item.imageFile'), 'post-history ordinary search text must include expanded stored fields');
}

function testHistoryAndPostCanonicalReplyLinksContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  assert(upstream.includes('function buildCanonicalReplyUrl(threadId, replyId)'), 'userscript must centralize canonical /t/{threadId}?r={replyId} link construction');
  assert(upstream.includes('return `${location.origin}/t/${tid}?r=${rid}`'), 'canonical reply URLs must use ?r= instead of #r anchors');
  assert(upstream.includes('function buildPostHistoryReplyActionUrl(type, id, resto, page)'), 'post-history must centralize [回应] page-link construction separately from No. links');
  const postReplyActionStart = upstream.indexOf('function buildPostHistoryReplyActionUrl(type, id, resto, page)');
  const postReplyActionBody = upstream.slice(postReplyActionStart, upstream.indexOf('function getConfirmedPostHistoryIds', postReplyActionStart));
  assert(postReplyActionBody.includes('return `${location.origin}/t/${threadId}?page=${pageNum}&r=${postId}`') && postReplyActionBody.includes('return buildPostHistoryUrl(type, postId, threadId);'), 'post-history [回应] must use /t/{threadId}?page={page}&r={postId} and fall back to the canonical ?r link when page is missing');
  const postUrlStart = upstream.indexOf('function buildPostHistoryUrl(type, id, resto)');
  const postUrlBody = upstream.slice(postUrlStart, upstream.indexOf('function getConfirmedPostHistoryIds', postUrlStart));
  assert(postUrlBody.includes('return buildCanonicalReplyUrl(threadId, postId);'), 'post-history render must rebuild links from stored ids/resto instead of trusting old saved url fields');
  const historyItemStart = upstream.indexOf('function buildThreadHistoryItemElement(result)');
  const historyItemBody = upstream.slice(historyItemStart, upstream.indexOf('function renderThreadHistoryModule', historyItemStart));
  assert(historyItemBody.includes('const historyReplyUrl = buildCanonicalReplyUrl(item.threadId, item.threadId);'), 'browsing-history No link must be rebuilt as /t/{threadId}?r={threadId} for old saved records too');
  assert(historyItemBody.includes('const historyReplyActionUrl = buildThreadHistoryItemUrl(item);'), 'browsing-history [回应] must use the record page URL rather than the No. canonical reply URL');
  assert(historyItemBody.includes('replyLink.href = historyReplyUrl'), 'browsing-history No link must not use old saved item.url directly');
  assert(historyItemBody.includes('replyActionLink.href = historyReplyActionUrl'), 'browsing-history [回应] link must use the latest recorded page URL');
  const postItemStart = upstream.indexOf('function buildPostHistoryItemElement(result)');
  const postItemBody = upstream.slice(postItemStart, upstream.indexOf('function renderPostHistoryModule', postItemStart));
  assert(postItemBody.includes("const displayPostId = item.postId || item.id || (item.type === 'reply' ? '' : item.threadId);"), 'post-history item render must not use a reply threadId as a fake post No. when confirmation failed');
  assert(postItemBody.includes('const postUrl = buildPostHistoryUrl(item.type, displayPostId, item.resto || item.threadId);'), 'post-history item render must rebuild canonical links only from an actual post id for replies');
  assert(postItemBody.includes('const postReplyActionUrl = buildPostHistoryReplyActionUrl(item.type, displayPostId, item.resto || item.threadId, item.page);'), 'post-history [回应] must use the located page URL and fall back to the No. canonical URL');
  assert(postItemBody.includes('postLink.href = postUrl'), 'post-history No link must use the rebuilt canonical URL');
  assert(postItemBody.includes('postLink.textContent = `No.${displayPostId}`'), 'post-history No text must use the same actual post id used for the canonical URL');
  assert(postItemBody.includes("replyActionLink.className = 'xdex-post-history-reply-action'") && postItemBody.includes('replyActionLink.href = postReplyActionUrl') && postItemBody.includes("replyActionLink.textContent = '回应'"), 'post-history must render a [回应] action using the page URL when available');
  assert(postItemBody.includes("if (item.status !== 'confirmed') appendThreadHistoryText(footer, 'span', 'xdex-post-history-status'"), 'post-history must hide the confirmed status label and only show unresolved/failed states');
  assert(postItemBody.includes('`所在页：P${displayPage}`'), 'post-history must display the located page when available (dynamically resolved for threads, direct for replies)');
  assert(postItemBody.includes('getLatestThreadHistoryUrl(item.threadId)'), 'post-history thread items must check browsing history for dynamic page resolution');
  assert(postItemBody.includes('// const displayPage = item.page;'), 'old direct item.page usage must be commented out, not deleted');
  const postBindStart = upstream.indexOf('function bindPostHistoryModuleEvents()');
  const postBindBody = upstream.slice(postBindStart, upstream.indexOf('function formatLocalDateKey', postBindStart));
  assert(postBindBody.includes("off('click.xdex-post-history-reply', '.xdex-post-history-reply-action')") && postBindBody.includes("window.open(url, '_blank', 'noopener')") && postBindBody.includes('window.location.href = url'), 'post-history [回应] must open a new tab by default and use current tab on Ctrl/Command click');
}

function testPostHistoryLiveSyncContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  assert(upstream.includes('let postHistoryLiveRenderTimer = 0') && upstream.includes('let postHistoryLiveRenderPendingCount = 0') && upstream.includes('let postHistoryLiveRenderDirty = false'), 'post history live sync must keep its own render timer, pending counter, and dirty state');
  assert(upstream.includes('function schedulePostHistoryLiveRender(source, remote)'), 'post history live sync must have a dedicated render scheduler');
  const notifyStart = upstream.indexOf('function notifyPostHistoryStoreChanged(source, remote)');
  const notifyBody = upstream.slice(notifyStart, upstream.indexOf('function setPostHistoryStore', notifyStart));
  assert(notifyBody.includes('schedulePostHistoryLiveRender(source, remote)'), 'post history writes must schedule a visible-panel render in the current page');
  const schedulerStart = upstream.indexOf('function schedulePostHistoryLiveRender(source, remote)');
  const schedulerBody = upstream.slice(schedulerStart, upstream.indexOf('function notifyPostHistoryStoreChanged', schedulerStart));
  assert(schedulerBody.includes('const active = isPostHistoryPanelOpen();') && schedulerBody.includes("const renderable = !!document.getElementById('sp_posts_results');"), 'post history scheduler must track both active panel state and whether posts DOM can be rendered');
  assert(schedulerBody.includes('postHistoryLiveRenderDirty = true;') && schedulerBody.includes('postHistoryLiveRenderDirty = false;'), 'post history scheduler must retain dirty writes until a posts render consumes them');
  assert(schedulerBody.includes("logPostHistory('live sync'") && schedulerBody.includes('pendingCount: postHistoryLiveRenderPendingCount') && schedulerBody.includes('renderable,'), 'post history scheduler must log live sync diagnostics');
  assert(schedulerBody.includes('clearTimeout(postHistoryLiveRenderTimer)'), 'post history scheduler must merge repeated writes into one render');
  assert(schedulerBody.includes('if (!renderable) {'), 'post history scheduler must only defer when the posts render target does not exist yet');
  assert(schedulerBody.includes('Math.min(THREAD_HISTORY_LIVE_RENDER_DEBOUNCE_DELAY, THREAD_HISTORY_LIVE_RENDER_MAX_WAIT - elapsed)'), 'post history scheduler must use the same debounce/max-wait behavior as history');
  assert(schedulerBody.includes('renderPostHistoryModule();'), 'post history scheduler must re-render the visible posts module');
  const renderStart = upstream.indexOf('function renderPostHistoryModule(query)');
  const renderBody = upstream.slice(renderStart, upstream.indexOf('function renderPostHistoryModuleSoon', renderStart));
  assert(renderBody.includes('postHistoryLiveRenderDirty = false;'), 'direct posts renders must consume pending live-sync dirtiness');
  const bindStart = upstream.indexOf('function bindPostHistoryLiveSync()');
  const bindBody = upstream.slice(bindStart, upstream.indexOf('function buildPostHistoryUrl', bindStart));
  assert(bindBody.includes('GM_addValueChangeListener(POST_HISTORY_STORAGE_KEY, (_key, _oldValue, _newValue, remote) => {') && bindBody.includes("schedulePostHistoryLiveRender('gm-value-change', remote);"), 'post history live sync must handle cross-page GM value changes');
  assert(bindBody.includes('const detail = event && event.detail || {};') && bindBody.includes("schedulePostHistoryLiveRender(detail.source || 'window-event', !!detail.remote);"), 'post history live sync must handle same-page custom events through the scheduler');
  const readyStart = upstream.indexOf('$(document).ready(() => {');
  const settingPanelInitIndex = upstream.indexOf('SettingPanel.init();', readyStart);
  const startupBindIndex = upstream.indexOf('bindPostHistoryLiveSync();', readyStart);
  const syncSetupEndIndex = upstream.indexOf("startupPerfDebug.mark('document.ready.syncSetup.end'", readyStart);
  assert(startupBindIndex > settingPanelInitIndex && startupBindIndex < syncSetupEndIndex, 'startup must bind post-history live sync during document.ready setup before deferred panel renders');
}

function testPostHistoryRefImageContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  assert(upstream.includes('function buildPostHistoryImageFile(img, ext)'), 'post history must normalize /ref img/ext into one imageFile field');
  assert(upstream.includes("const suffix = extValue ? (extValue[0] === '.' ? extValue : `.${extValue}`) : ''"), 'post history imageFile builder must normalize ext with one leading dot');
  assert(upstream.includes('base.toLowerCase().endsWith(suffix.toLowerCase()) ? base : base + suffix'), 'post history imageFile builder must avoid double-appending extensions');
  assert(upstream.includes('function parsePostHistoryRefResponse(resp, context)'), 'post history must parse /ref JSON response for image enrichment');
  assert(upstream.includes('const refPost = data && !Array.isArray(data) ? data : null'), 'post history /ref parser must expect a single object response');
  assert(upstream.includes("logPostHistory('ref parse'") && upstream.includes("logPostHistory('ref empty'") && upstream.includes("logPostHistory('ref parse failed'"), 'post history /ref parser must log parse, empty, and failure stages');
  assert(upstream.includes('function postHistoryRefPostHasImage(refPost)'), 'post history must centralize whether a /ref result contains usable image metadata');
  assert(upstream.includes('function parsePostHistoryRefHtmlResponse(resp, context)'), 'post history must parse /Home/Forum/ref HTML as final image fallback');
  assert(upstream.includes("new DOMParser().parseFromString(String(html || ''), 'text/html')"), 'post history HTML fallback must parse the returned ref fragment as HTML');
  assert(upstream.includes("doc.querySelector('.h-threads-img-box')") && upstream.includes('extractThreadHistoryImageFile(root)'), 'post history HTML fallback must prefer the desktop ref image container and reuse history image extraction');
  assert(upstream.includes('normalizeThreadHistoryImageFile(') && upstream.includes("img.h-threads-image"), 'post history HTML fallback must normalize desktop/mobile image URLs into imageFile');
  assert(upstream.includes("logPostHistory('ref html parse'") && upstream.includes("logPostHistory('ref html empty'") && upstream.includes("logPostHistory('ref html parse failed'"), 'post history HTML fallback must log parse, empty, and failure stages');
  assert(upstream.includes('function fetchPostHistoryRefPost(id, context)'), 'post history must fetch /ref by confirmed post id');
  assert(upstream.includes("const POST_HISTORY_REF_API_FALLBACK_BASE = 'https://api.nmb.best/api'"), 'post history /ref must define api.nmb.best fallback base for same-origin 503 failures');
  assert(upstream.includes('function fetchPostHistoryRefApiPost(id, context)'), 'post history must isolate api.nmb.best /ref fetching');
  assert(upstream.includes('`${POST_HISTORY_REF_API_FALLBACK_BASE}/ref?id=${encodeURIComponent(postId)}`'), 'post history /ref API fetch must call api.nmb.best/api/ref?id={postId}');
  assert(upstream.includes("fetchPostHistoryRefApiPost(postId, detail)") && upstream.includes("fetchPostHistorySameOriginRefPost(postId, detail)"), 'post history /ref must try api.nmb.best before same-origin /Api/ref');
  assert(upstream.includes('function fetchPostHistorySameOriginRefPost(id, context)'), 'post history must isolate same-origin /Api/ref as a fallback');
  assert(upstream.includes('`${POST_HISTORY_API_BASE}/ref?id=${encodeURIComponent(postId)}`') && upstream.includes("fetchPostHistorySameOriginText(url, detail, 'ref same-origin fallback')"), 'post history /ref same-origin fallback must use credentialed same-origin fetch after api.nmb.best fails or has no image');
  assert(upstream.includes("logPostHistory('ref api request'") && upstream.includes("logPostHistory('ref api response'") && upstream.includes("logPostHistory('ref api error'"), 'post history /ref API fetch must expose request, response, and error debug stages');
  assert(upstream.includes('function fetchPostHistoryRefHtmlFallbackPost(id, context)'), 'post history must isolate /Home/Forum/ref HTML fallback fetching');
  assert(upstream.includes('`/Home/Forum/ref?id=${encodeURIComponent(postId)}`'), 'post history HTML fallback must call the same ref endpoint used by quote popups');
  assert(upstream.includes("fetchPostHistorySameOriginText(url, detail, 'ref html fallback')"), 'post history HTML fallback must use the same credentialed fetch/debug path');
  assert(upstream.includes('return fetchPostHistoryRefHtmlFallbackPost(postId, detail);'), 'post history must continue to HTML fallback when all JSON /ref paths fail or have no usable image');
  assert(upstream.includes('function enrichPostHistoryRefImage(localId, postId)'), 'post history must enrich confirmed records with /ref image metadata');
  assert(upstream.includes('updatePostHistoryRecord(localId, { imageFile, imageImg: refPost.img || \'\', imageExt: refPost.ext || \'\' })'), 'post history enrichment must store normalized imageFile plus original img/ext metadata');
  const confirmStart = upstream.indexOf('function confirmPostHistorySnapshot(localId, post)');
  const confirmBody = upstream.slice(confirmStart, upstream.indexOf('function completePostHistorySnapshot', confirmStart));
  assert(confirmBody.includes('const imageFile = buildPostHistoryImageFile(post.img, post.ext);') && confirmBody.includes("if (imageFile) Object.assign(update, { imageFile, imageImg: post.img || '', imageExt: post.ext || '' });"), 'post history confirmation must persist thread API img/ext immediately when present');
  assert(confirmBody.includes('if (!imageFile) {') && confirmBody.includes('enrichPostHistoryRefImage(localId, id).then('), 'post history must async-enrich /ref image when the confirmed candidate has no usable image');
  assert(confirmBody.includes('resolver(Object.assign({ localId }, update))'), 'enrichment completion must resolve the confirmation promise');
  const postItemStart = upstream.indexOf('function buildPostHistoryItemElement(result)');
  const postItemBody = upstream.slice(postItemStart, upstream.indexOf('function renderPostHistoryModule', postItemStart));
  assert(postItemBody.includes('if (item.imageFile) {'), 'post history renderer must display enriched images when imageFile exists');
  assert(postItemBody.includes("imageLink.className = 'h-threads-img-a xdex-post-history-image'") && postItemBody.includes('imageLink.href = buildThreadHistoryImageUrl(item.imageFile, true)'), 'post history image link must reuse browsing-history original-image URL logic');
  assert(postItemBody.includes("image.className = 'h-threads-img'") && postItemBody.includes('image.src = buildThreadHistoryImageUrl(item.imageFile, false)'), 'post history thumbnail must reuse browsing-history gif/original and non-gif/thumb URL logic');
}

function testHistoryAndPostImageQuotePreviewContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  assert(upstream.includes('function isSettingsPanelImageEnhancementRoot(root)'), 'HD image enhancement must centralize settings-panel exclusion');
  assert(upstream.includes("return !!(node && node.closest && node.closest('#sp_panel'));"), 'settings-panel exclusion must cover the whole settings panel instead of individual image classes');
  const hdStart = upstream.indexOf('function enableHDImageAndLayoutFix(root = document)');
  const hdBody = upstream.slice(hdStart, upstream.indexOf('function handlePendingHDImageAndLayoutFix', hdStart));
  assert(hdBody.includes('if (isSettingsPanelImageEnhancementRoot(root)) return;'), 'HD image enhancement must skip settings panel roots before binding/replacing images');
  assert(hdBody.includes("node.closest && node.closest('#sp_panel')") && hdBody.includes('if (isRelevant) node.dataset.xdexHdLayoutPending = \'1\';'), 'HD global observer must not queue settings-panel mutations for later HD processing');

  assert(upstream.includes('.xdex-history-image,') && upstream.includes('.xdex-post-history-image {') && upstream.includes('width:112px') && upstream.includes('max-height:112px'), 'post-history image links must share browsing-history 112px panel constraints');
  assert(upstream.includes('.xdex-history-image img,') && upstream.includes('.xdex-post-history-image img {') && upstream.includes('max-width:112px') && upstream.includes('max-height:112px'), 'post-history image tags must share browsing-history thumbnail constraints');

  assert(upstream.includes('function openHistoryImageQuotePreview(tid)'), 'history/post image clicks must share a quote-preview opener');
  const openStart = upstream.indexOf('function openHistoryImageQuotePreview(tid)');
  const openBody = upstream.slice(openStart, upstream.indexOf('function buildThreadHistoryItemElement', openStart));
  assert(openBody.includes('enableQuotePreview();') && openBody.includes('window.__xdexOpenQuoteByTid(quoteId, { fromPOImage: true })'), 'history/post image opener must reuse extended quote popup and auto-activate images');

  const historyItemStart = upstream.indexOf('function buildThreadHistoryItemElement(result)');
  const historyItemBody = upstream.slice(historyItemStart, upstream.indexOf('function renderThreadHistoryModule', historyItemStart));
  assert(historyItemBody.includes('imageLink.dataset.historyQuoteId = item.threadId || \'\';'), 'browsing-history image anchors must carry the thread No. for quote-popup opening');
  const postItemStart = upstream.indexOf('function buildPostHistoryItemElement(result)');
  const postItemBody = upstream.slice(postItemStart, upstream.indexOf('function renderPostHistoryModule', postItemStart));
  assert(postItemBody.includes('imageLink.dataset.postHistoryQuoteId = displayPostId || item.threadId || \'\';'), 'post-history image anchors must prefer the saved post No. and only fall back to thread No. when no post id exists');

  const historyBindStart = upstream.indexOf('function bindThreadHistoryModuleEvents()');
  const historyBindBody = upstream.slice(historyBindStart, upstream.indexOf('function buildPostHistoryItemElement', historyBindStart));
  assert(historyBindBody.includes("off('click.xdex-history-image-quote', '.xdex-history-image')") && historyBindBody.includes("openHistoryImageQuotePreview(this.dataset.historyQuoteId || '')"), 'browsing-history image clicks must open the corresponding quote popup');
  const postBindStart = upstream.indexOf('function bindPostHistoryModuleEvents()');
  const postBindBody = upstream.slice(postBindStart, upstream.indexOf('function formatLocalDateKey', postBindStart));
  assert(postBindBody.includes("off('click.xdex-post-history-image-quote', '.xdex-post-history-image')") && postBindBody.includes("openHistoryImageQuotePreview(this.dataset.postHistoryQuoteId || '')"), 'post-history image clicks must open the corresponding quote popup');
  assert(historyBindBody.includes('if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;') && postBindBody.includes('if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;'), 'history/post image quote handlers must preserve modified-click default image behavior');
}

function testHistoryAndPostContentEnhancementContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  assert(upstream.includes('function enhanceHistoryRenderedContent(root)'), 'history/post rendered content must use one shared enhancement helper');
  const helperStart = upstream.indexOf('function enhanceHistoryRenderedContent(root)');
  const helperEnd = upstream.indexOf('function buildThreadHistoryItemElement', helperStart);
  const helperBody = upstream.slice(helperStart, helperEnd);
  assert(helperBody.includes('renderHiddenTextContent(root);'), 'history/post enhancement must render [h] hidden text markers');
  assert(helperBody.includes("if (typeof extendQuote === 'function') extendQuote(root);"), 'history/post enhancement must recognize standard and bare quote references');
  assert(helperBody.includes("if (typeof initExtendedContent === 'function') initExtendedContent(root);"), 'history/post enhancement must bind hover ref-view and extended quote handlers');
  assert(helperBody.includes("if (cfg && cfg.enableAutoUrlLinkify && typeof runAutoUrlLinkify === 'function') runAutoUrlLinkify(root);"), 'history/post enhancement must reuse auto URL linkification when enabled');
  assert(helperBody.includes('if (cfg && cfg.enableImageHideMode) applyImageHideMode(cfg.applyImageHideMode || \'default\', root);'), 'history/post enhancement must keep image-hide behavior consistent with normal content');

  const historyItemStart = upstream.indexOf('function buildThreadHistoryItemElement(result)');
  const historyItemBody = upstream.slice(historyItemStart, upstream.indexOf('function renderThreadHistoryModule', historyItemStart));
  assert(historyItemBody.includes('enhanceHistoryRenderedContent(content);'), 'browsing-history content must run full quote/link enhancement after rendering');
  const postItemStart = upstream.indexOf('function buildPostHistoryItemElement(result)');
  const postItemBody = upstream.slice(postItemStart, upstream.indexOf('function renderPostHistoryModule', postItemStart));
  assert(postItemBody.includes('enhanceHistoryRenderedContent(content);'), 'post-history content must run full quote/link enhancement after rendering');
}

function testHistoryAndPostDeleteConfirmContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  const historyDeleteStart = upstream.indexOf("off('click.xdex-history-delete', '.xdex-history-delete')");
  const historyClearStart = upstream.indexOf("$('#sp_history_clear').off('click.xdex-history')");
  const postsDeleteStart = upstream.indexOf("off('click.xdex-post-history-delete', '.xdex-post-history-delete')");
  const postsClearStart = upstream.indexOf("$('#sp_posts_clear').off('click.xdex-post-history')");
  assert(historyDeleteStart !== -1 && historyClearStart !== -1 && postsDeleteStart !== -1 && postsClearStart !== -1, 'delete/clear handlers must be present for history and post history modules');

  const historyDeleteHandler = upstream.slice(historyDeleteStart, historyClearStart);
  const historyClearHandler = upstream.slice(historyClearStart, upstream.indexOf('});', historyClearStart) + 3);
  const postsDeleteHandler = upstream.slice(postsDeleteStart, postsClearStart);
  const postsClearHandler = upstream.slice(postsClearStart, upstream.indexOf('});', postsClearStart) + 3);

  assert(!historyDeleteHandler.includes('window.confirm('), 'single browsing-history deletion must remain direct without confirmation');
  assert(historyClearHandler.includes("window.confirm('确定要清空全部浏览历史吗？')"), 'browsing-history clear must ask for confirmation');
  assert(postsDeleteHandler.includes("window.confirm('确定要删除这条发言记录吗？')"), 'post-history item deletion must ask for confirmation');
  assert(postsClearHandler.includes("window.confirm('确定要清空全部我的发言记录吗？')"), 'post-history clear must ask for confirmation');
}

function testBrowsingHistoryUrlParsingContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  assert(upstream.includes('function parseThreadHistoryUrl'), 'userscript must expose a history URL parser');
  assert(upstream.includes('/\\/t\\/(\\d{6,8})(?:\\/(\\d+))?/'), 'history URL parser must support /t/{id} and /t/{id}/{page}');
  assert(upstream.includes('/\\/Forum\\/po\\/id\\/(\\d{6,8})(?:\\/page\\/(\\d+)\\.html)?/'), 'history URL parser must support PO id page paths');
  assert(upstream.includes("url.searchParams.get('page')"), 'history URL parser must support query page fallback');
  assert(upstream.includes("mode: poMatch ? 'po' : 'normal'"), 'history URL parser must return normal or po mode');
}

function testKaomojiContextCopyContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  const contextMenuIndex = upstream.indexOf("item.addEventListener('contextmenu'");
  assert(contextMenuIndex !== -1, 'kaomoji panel items must support right-click copy');

  const contextMenuEnd = upstream.indexOf('panel.appendChild(item)', contextMenuIndex);
  assert(contextMenuEnd > contextMenuIndex, 'kaomoji right-click handler must be attached before item insertion');
  const handler = upstream.slice(contextMenuIndex, contextMenuEnd);

  assert(handler.includes('e.preventDefault();'), 'kaomoji right-click copy must suppress the browser context menu');
  assert(handler.includes('e.stopPropagation();'), 'kaomoji right-click copy must not bubble into global handlers');
  assert(handler.includes('writeClipboardText(opt.value, null)'), 'kaomoji right-click copy must copy the actual option value, not display text');
  assert(!handler.includes('item.textContent'), 'kaomoji right-click copy must not copy the rendered label for rich kaomoji');
  assert(!handler.includes('select.dispatchEvent'), 'kaomoji right-click copy must not trigger the insertion change handler');
  assert(!handler.includes('recordKaomojiUsage'), 'kaomoji right-click copy must not affect recent/frequent sorting stats');
  assert(/toast\('颜文字已复制', 900, \{ queue: false, key: 'kaomoji-copy' \}\);\s*hidePanel\(\);/.test(handler), 'kaomoji right-click copy must close the expanded panel after successful copy feedback');
  assert(upstream.includes('const val = NEED_LF.has(key) ? ("\\n" + EXTRA_RICH[key] + "\\n") : EXTRA_RICH[key];'), 'rich kaomoji option values must retain required leading/trailing newlines');
}

function testBrowsingHistoryIndexContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  const fields = [
    'searchText', 'threadIdText', 'titleText', 'authorText', 'cookieIdText', 'excerptText',
    'mode', 'hasImage', 'isGif', 'hasZeroWidth', 'hasVisibleText', 'hasWhitespaceOnly', 'lastVisitedAt'
  ];
  for (const field of fields) {
    assert(upstream.includes(field), `history index must include ${field}`);
  }
  assert(upstream.includes('function buildThreadHistoryIndexEntry'), 'userscript must build persistent lightweight index entries');
  assert(upstream.includes('has:zwsp') && upstream.includes('has:zerowidth'), 'history search must support zero-width filters');
  assert(upstream.includes('mode:po') && upstream.includes('mode:normal'), 'history search must support mode filters');
  assert(upstream.includes('has:image') && upstream.includes('has:gif'), 'history search must support image filters');
  assert(upstream.includes("sortMode || 'last-desc'"), 'history search must default to newest-first sorting');
  assert(upstream.includes("sortMode === 'last-asc'") && upstream.includes("sortMode === 'visits-desc'") && upstream.includes("sortMode === 'visits-asc'") && upstream.includes("sortMode === 'page-desc'"), 'history search must support time, visit-count, and max-page sorting modes');
  assert(upstream.includes('ZERO_WIDTH_RE'), 'history extraction must detect zero-width content');
}

function testBrowsingHistoryExtractionAndRenderingContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  assert(upstream.includes('function extractThreadHistoryRecord'), 'userscript must extract current thread history from DOM');
  assert(upstream.includes('function findThreadHistoryMainElement'), 'history extraction must use a helper to find the real thread main container');
  assert(upstream.includes(".h-threads-list .h-threads-item-main"), 'history extraction must prefer main thread containers inside .h-threads-list');
  assert(upstream.includes('.h-threads-item-main'), 'history extraction must use main thread container');
  const historyFinderStart = upstream.indexOf('function findThreadHistoryMainElement');
  const historyFinderEnd = upstream.indexOf('function extractThreadHistoryRecord', historyFinderStart);
  const historyFinderBody = upstream.slice(historyFinderStart, historyFinderEnd);
  assert(!historyFinderBody.includes('.h-threads-item-reply-main'), 'history extraction must not use reply containers as thread history source');
  assert(upstream.includes(".h-preview-box .h-threads-item-main") || upstream.includes("closest('.h-preview-box')"), 'history extraction must keep quote preview DOM excluded');
  assert(upstream.includes('.h-threads-content'), 'history extraction must use thread content');
  assert(upstream.includes('contentFlags'), 'history records must store content flags');
  assert(upstream.includes('hasZeroWidth'), 'history records must preserve zero-width flag');
  assert(upstream.includes('contentHtml'), 'history records must preserve sanitized rich content HTML for same-origin thread content');
  assert(upstream.includes('contentText'), 'history records must preserve trimmed plain content text for search and fallback rendering');
  assert(upstream.includes('cookieHtml'), 'history records must preserve sanitized rich cookie HTML for red-name and special cookie styles');
  assert(upstream.includes('sanitizeThreadHistoryInlineHtml'), 'history extraction must sanitize inline cookie HTML separately from content HTML');
  assert(upstream.includes('extractThreadHistoryCookieId'), 'history extraction must keep a pure cookie id for matching while preserving rich cookie HTML');
  assert(upstream.includes('buildThreadHistoryLegacyCookieHtml'), 'history rendering must provide a best-effort red-name fallback for old records without cookieHtml');
  assert(upstream.includes('getThreadHistoryCookieMarkId'), 'history rendering must separate visible cookie text from the pure marker id');
  assert(upstream.includes('cookieHtml: nextRecord.cookieHtml || old.cookieHtml ||'), 'history upsert must not overwrite existing rich cookieHtml with an empty extraction');
  assert(upstream.includes('data-xdex-cookie-id'), 'history rendering must expose the pure cookie id without flattening the visible cookie HTML');
  assert(upstream.includes("cookieSpan.setAttribute('data-xdex-cookie-id', cookieMarkId)"), 'history fallback cookie rendering must expose data-xdex-cookie-id for old records too');
  assert(upstream.includes('SUB') && upstream.includes('SUP'), 'history sanitizers must preserve sub/sup tags used by special cookie badges');
  assert(upstream.includes('THREAD_HISTORY_EXCERPT_LIMIT = 250'), 'history content preview limit must be 250 characters');
  assert(upstream.includes('contentTruncated'), 'history records must store whether display content was truncated');
  assert(upstream.includes('appendThreadHistoryTruncationMarker'), 'history rendering must append truncation marker only in the visible DOM');
  assert(upstream.includes('isEmptyThreadHistoryInlineElement'), 'history truncation must remove trailing empty inline nodes before the visible truncation marker');
  assert(upstream.includes('removeThreadHistoryTrailingBreaks(node)'), 'history truncation must recursively prune nested trailing blank nodes before the visible marker');
  assert(upstream.includes('item.contentText || item.excerpt'), 'history search must remain compatible with old excerpt-only records');
  assert(upstream.includes('sanitizeThreadHistoryContentHtml'), 'history extraction must sanitize rich content before storing it');
  assert(!upstream.includes("+ '…'"), 'history extraction must not store display ellipsis in contentHtml or excerpt');
  assert(upstream.includes('slice(0, THREAD_HISTORY_EXCERPT_LIMIT)'), 'history excerpt must remain length-limited');
  assert(upstream.includes('function extractThreadHistoryImageFile'), 'history extraction must normalize imageFile only');
  assert(upstream.includes('normalizeThreadHistoryImageFile(source)'), 'history image extraction must normalize every candidate source');
  assert(upstream.includes('2024-12-10/6757ea866e1aa.png'), 'history image normalization contract must preserve date directory and filename suffix');
  assert(upstream.includes("String(imageFile).split('/').map(encodeURIComponent).join('/')"), 'history image rendering must preserve normalized date directory slashes while encoding path segments');
  assert(upstream.includes('/image/{file}') || upstream.includes('/image/'), 'history image handling must recognize image path files');
  assert(upstream.includes('/thumb/{file}') || upstream.includes('/thumb/'), 'history image handling must recognize thumb path files');
  assert(upstream.includes('function renderThreadHistoryModule'), 'settings panel must render the History module');
  assert(upstream.includes('sp_history_sort'), 'History toolbar must include a sort select after the count and before clear');
  assert(upstream.includes('最近访问优先') && upstream.includes('最早访问优先') && upstream.includes('访问次数最多') && upstream.includes('访问次数最少') && upstream.includes('最高页码优先'), 'History sort select must expose requested ordering choices');
  assert(upstream.includes("$('#sp_history_sort').off('change.xdex-history')"), 'History sort select must re-render results when changed');
  assert(!upstream.includes('sp_history_close'), 'History module must not add a duplicate close button; it must use footer #sp_close');
  assert(upstream.includes('class="sp_panel_links"') && upstream.includes("$('#sp_panel_footer .sp_panel_links').show()"), 'Footer must keep a link placeholder container so close alignment remains stable outside Settings');
  assert(upstream.includes("[thread-history]"), 'history feature must emit diagnostic logs for recording/rendering failures');
  assert(upstream.includes('xdex-history-item'), 'History UI must wrap rendered records in .xdex-history-item');
  assert(upstream.includes('h-threads-item-main'), 'History UI must reuse h-threads-item-main class');
  assert(upstream.includes('h-threads-info xdex-history-info'), 'History UI must reuse original .h-threads-info metadata row semantics');
  assert(upstream.includes('main.appendChild(deleteButton)'), 'History delete button must float from the item body instead of occupying the metadata row');
  assert(!upstream.includes('info.appendChild(deleteButton)'), 'History delete button must not reserve right-side space in .xdex-history-info');
  assert(upstream.includes("deleteButton.textContent = '×'"), 'History delete button must use the compact floating x style');
  assert(upstream.includes('#sp_history_results') && upstream.includes('padding-top:8px'), 'History result list must keep a small safe gap below the toolbar for the first floating delete button');
  const historyDeleteCss = extractCssRule(upstream, '.xdex-history-delete,\n                     .xdex-post-history-delete') || extractCssRule(upstream, '.xdex-history-delete');
  assert(historyDeleteCss.includes('position:absolute') && historyDeleteCss.includes('top:-9px') && historyDeleteCss.includes('right:10px'), 'History delete button must float at the top-right like setting-row delete buttons');
  assert(historyDeleteCss.includes('border-radius:999px') && historyDeleteCss.includes('background:#F0E0D6'), 'History delete button must keep the compact rounded marked-delete visual style');
  assert(upstream.includes("document.createElement('a')") && upstream.includes('h-threads-info-id xdex-history-thread-id'), 'History UI must keep No.x as a clickable .h-threads-info-id anchor for original quote tracking');
  assert(upstream.includes('replyLink.href = historyReplyUrl'), 'History No.x link must use rebuilt canonical ?r= URL instead of old saved URL');
  assert(upstream.includes("createdAtEl.getAttribute('title') || createdAtEl.getAttribute('datetime')"), 'History extraction must prefer original created-at title/datetime over already-relative visible text');
  assert(upstream.includes('createdAtNode.dataset.xdexOriginalTime = item.createdAt'), 'History created-at nodes must keep original time for relative-time re-rendering');
  assert(upstream.includes('createdAtNode.title = item.createdAt'), 'History created-at nodes must expose original time through title for exact-time restore');
  assert(!upstream.includes('xdexSkipRelativeTime'), 'History created-at nodes must remain eligible for relative time instead of being skipped');
  const replyLinkStart = upstream.indexOf("replyLink.className = 'h-threads-info-id xdex-history-thread-id'");
  const replyActionStart = upstream.indexOf("const replyAction = document.createElement('span')", replyLinkStart);
  const replyLinkBlock = upstream.slice(replyLinkStart, replyActionStart);
  assert(!replyLinkBlock.includes("target = '_blank'") && !replyLinkBlock.includes("rel = 'noopener'"), 'History No.x ordinary click must keep original quote insertion behavior instead of forcing a new tab');
  assert(upstream.includes('e.currentTarget.textContent.trim()'), 'Original quote insertion must read the whole No.x anchor text, not a clicked child node');
  const quoteHandlerStart = upstream.indexOf("$('body').on('click', 'a.h-threads-info-id'");
  const noTextAreaGuard = upstream.indexOf('if (!正文框.length) return;', quoteHandlerStart);
  const preventDefaultBeforeGuard = upstream.indexOf('e.preventDefault();', quoteHandlerStart);
  assert(preventDefaultBeforeGuard !== -1 && preventDefaultBeforeGuard < noTextAreaGuard, 'No.x ordinary click must prevent default navigation before textarea availability checks');
  assert(!upstream.includes('xdex-history-reply h-threads-info-id') && !upstream.includes('h-threads-info-id xdex-history-reply'), 'History reply action must not trigger original quote insertion via .h-threads-info-id');
  assert(!upstream.includes('xdex-history-open'), 'History UI must not render duplicate open link because [回应] is the saved-url action');
  assert(upstream.includes('xdex-history-reply-action'), 'History UI must provide an explicit reply action near thread info');
  assert(upstream.includes('replyActionLink.href = historyReplyActionUrl'), 'History reply action must use the latest recorded page URL');
  assert(upstream.includes("window.open(url, '_blank', 'noopener')"), 'History reply action must open the rebuilt canonical URL in a new tab by default');
  assert(upstream.includes('window.location.href = url'), 'History reply action must support Ctrl/Command click opening in the current tab');
  assert(upstream.includes('串内最远：P${item.maxVisitedPage || item.page || 1}'), 'History footer must label the furthest in-thread page clearly');
  assert(upstream.includes('最近查看：P${item.page || 1}'), 'History footer must label the latest viewed page clearly');
  assert(upstream.includes('content.innerHTML = item.contentHtml'), 'History rich content rendering must use sanitized contentHtml when available');
  assert(upstream.includes('white-space:pre-wrap'), 'History rich content rendering must preserve text-node line breaks');
  assert(upstream.includes('font-size:14px') && upstream.includes('line-height:20px'), 'History content font must be reduced from the original thread size for panel readability');
  assert(upstream.includes('xdex-history-po-label') && upstream.includes('00FFCC') && upstream.includes("'Po'"), 'History footer must render Po label with the requested color and spelling');
  assert(upstream.includes('markAllCookies(getFilterConfig().markedGroups || [], wrapper)'), 'History items must reapply cookie marker styling to rendered cookie IDs');
  assert(upstream.includes('wrapCookieMarkTargetPreserveHtml') && !upstream.includes('$el.empty();\n        $el.append(document.createTextNode(parts[0]'), 'Cookie marker must preserve rich cookie HTML instead of rebuilding plain text');
  assert(!upstream.includes('h-threads-list xdex-history'), 'History UI must not wrap records in .h-threads-list');
}

function testRelativeTimeIdempotenceContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  assert(upstream.includes("const timeStr = target.attr('data-xdex-original-time') || target.attr('title') || target.text().trim()"), 'Relative time formatter must always prefer the stable original timestamp');
  assert(upstream.includes('if (Number.isNaN(date.getTime())) return;'), 'Relative time formatter must ignore invalid/non-machine time strings to avoid NaN prefixes');
  assert(upstream.includes("target.attr('data-xdex-original-time', timeStr)"), 'Relative time formatter must bind the original timestamp for future refreshes');
  assert(upstream.includes("const timeStr = target.attr('data-xdex-original-time') || target.attr('title');"), 'Exact-time restore must prefer the same original timestamp marker');
  assert(upstream.includes('function formatRelativeTimeMachineTime(ts)'), 'Relative time formatter must have a reusable machine-time formatter');
  assert(upstream.includes('return `${y}-${m}-${day}(${weekday})${hh}:${mm}:${ss}`'), 'Relative time machine-time formatter must preserve weekday and seconds for slice-based rendering');
  const postHistoryStart = upstream.indexOf('function buildPostHistoryItemElement(result)');
  const postHistoryEnd = upstream.indexOf('function renderPostHistoryModule', postHistoryStart);
  const postHistoryBody = upstream.slice(postHistoryStart, postHistoryEnd);
  assert(postHistoryBody.includes('const submittedAtText = formatRelativeTimeMachineTime(item.submittedAt);'), 'Post-history created-at must use relative-time machine format instead of minute-only history format');
  assert(postHistoryBody.includes("appendThreadHistoryInfoText(infoMain, 'h-threads-info-createdat', submittedAtText)"), 'Post-history created-at node must render the stable submitted-at machine text');
  assert(postHistoryBody.includes('createdAtNode.dataset.xdexOriginalTime = submittedAtText') && postHistoryBody.includes('createdAtNode.title = submittedAtText'), 'Post-history created-at nodes must bind their original machine timestamp');
}

function testBrowsingHistoryPanelBodyContract() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  const panelViewsCss = extractCssRule(upstream, '#sp_panel_views');
  const panelContentCss = extractCssRule(upstream, '.sp_panel_content');
  const settingsStart = upstream.indexOf('<div id="sp_module_settings"');
  const moduleStart = upstream.indexOf('<div id="sp_module_history"');
  const settingsBodyStart = upstream.indexOf('<div id="sp_panel_content"', settingsStart);
  const importExportStart = upstream.indexOf('id="sp_importExport"', settingsBodyStart);
  const settingsEnd = upstream.lastIndexOf('</div>', moduleStart);
  const sharedBodyStart = upstream.indexOf('<div class="sp_panel_content">', moduleStart);
  const contentStart = upstream.indexOf('<div id="sp_history_content"', moduleStart);
  const titleStart = upstream.indexOf('id="sp_history_title"', contentStart);
  const toolbarStart = upstream.indexOf('class="xdex-history-toolbar"', contentStart);
  const sortStart = upstream.indexOf('id="sp_history_sort"', toolbarStart);
  const clearStart = upstream.indexOf('id="sp_history_clear"', toolbarStart);
  const resultsStart = upstream.indexOf('id="sp_history_results"', contentStart);
  const footerStart = upstream.indexOf('<div id="sp_panel_footer"', moduleStart);

  assert(settingsStart !== -1, 'Settings module #sp_module_settings must exist');
  assert(settingsBodyStart !== -1 && settingsBodyStart < moduleStart, 'Settings module body must exist before History module');
  assert(importExportStart !== -1 && importExportStart < moduleStart, 'Settings content must be fully declared before History module');
  assert(settingsEnd !== -1 && settingsEnd < moduleStart, 'History module must be a sibling after #sp_module_settings, not nested inside the hidden settings module');
  assert(moduleStart !== -1, 'History module #sp_module_history must exist');
  assert(sharedBodyStart !== -1 && sharedBodyStart > moduleStart, 'History module must reuse the shared .sp_panel_content panel body');
  assert(contentStart !== -1 && contentStart > moduleStart, 'History module must contain #sp_history_content');
  assert(contentStart > sharedBodyStart, '#sp_history_content must live inside the shared .sp_panel_content body');
  assert(titleStart !== -1 && titleStart > contentStart, 'History body must contain #sp_history_title');
  assert(toolbarStart !== -1 && toolbarStart > contentStart, 'History body must contain toolbar controls');
  assert(sortStart !== -1 && clearStart !== -1 && sortStart < clearStart, 'History sort select must appear before the clear button');
  assert(resultsStart !== -1 && resultsStart > toolbarStart, 'History body must contain #sp_history_results after toolbar');
  assert(footerStart !== -1 && resultsStart > moduleStart && resultsStart < footerStart, 'History visible structure must stay inside #sp_module_history before footer');
  assert(footerStart !== -1 && contentStart < footerStart, '#sp_history_content must appear before #sp_panel_footer so the module cannot collapse to footer-only');
  assert(panelViewsCss.includes('display:flex'), 'module shell must make #sp_panel_views the middle flex body');
  assert(panelViewsCss.includes('flex-direction:column') && panelViewsCss.includes('flex:1') && panelViewsCss.includes('min-height:0'), 'module shell must preserve panel top/bottom bounds with a flex body');
  assert(panelContentCss.includes('padding:18px') && panelContentCss.includes('overflow-y:auto') && panelContentCss.includes('min-height:300px'), 'shared .sp_panel_content must carry the padded flex/scroll body contract');
  assert(upstream.includes('#sp_module_history.sp_panel_module.active'), 'History active module must become the middle flex body, not collapse above the footer');
}

function createGmCompatStorageContext() {
  const storage = new Map();
  const listeners = new Map();
  const storageListeners = [];
  const context = {
    console,
    localStorage: {
      get length() { return storage.size; },
      key(index) { return Array.from(storage.keys())[index] || null; },
      getItem(key) { return storage.has(String(key)) ? storage.get(String(key)) : null; },
      setItem(key, value) { storage.set(String(key), String(value)); },
      removeItem(key) { storage.delete(String(key)); }
    },
    chrome: {
      runtime: { id: 'test-extension' },
      storage: {
        local: {
          get(_keys, callback) { callback({}); },
          set(_items, callback) { if (callback) callback(); },
          remove(_key, callback) { if (callback) callback(); }
        },
        onChanged: {
          addListener(listener) { storageListeners.push(listener); }
        }
      }
    },
    atob(value) {
      return Buffer.from(value, 'base64').toString('binary');
    },
    document: {
      createElement() { return { style: {}, remove() {} }; },
      head: { appendChild() {} },
      documentElement: { appendChild() {} }
    },
    location: { href: 'https://www.nmbxd1.com/t/12345678', origin: 'https://www.nmbxd1.com' },
    URL,
    setTimeout(fn) { return fn(); },
    addEventListener(type, fn) {
      const list = listeners.get(type) || [];
      list.push(fn);
      listeners.set(type, list);
    },
    dispatchStorageEvent(event) {
      for (const fn of listeners.get('storage') || []) fn(event);
    },
    getLocalStorageValue(key) {
      return storage.get(key);
    }
  };
  context.globalThis = context;
  context.window = context;
  return context;
}

function testGmCompatLocalStorageSyncBridge() {
  const code = read('src/content/gm-compat.js');
  const context = createGmCompatStorageContext();
  vm.runInNewContext(code, context, { filename: 'gm-compat.js' });

  let remoteChange = null;
  context.GM_addValueChangeListener('myScriptSettings', (key, oldValue, newValue, remote) => {
    remoteChange = { key, oldValue, newValue, remote };
  });

  context.GM_setValue('myScriptSettings', { enableFoo: true });
  const mirror = JSON.parse(context.getLocalStorageValue('xdex-Extension-local:myScriptSettings'));
  assert(mirror.enableFoo === true, 'GM_setValue must write the localStorage mirror for whitelisted settings');

  const published = JSON.parse(context.getLocalStorageValue('xdex-Extension-sync:myScriptSettings'));
  assert(published.protocol === 1, 'GM_setValue must publish a versioned localStorage sync envelope');
  assert(published.key === 'myScriptSettings', 'sync envelope must include the GM key');
  assert(published.value.enableFoo === true, 'sync envelope must include the GM value');
  assert(typeof published.instanceId === 'string' && published.instanceId, 'sync envelope must include a writer instance id');

  context.dispatchStorageEvent({
    key: 'xdex-Extension-sync:myScriptSettings',
    newValue: JSON.stringify({
      protocol: 1,
      key: 'myScriptSettings',
      value: { enableFoo: false, exact: true },
      deleted: false,
      ts: Date.now() + 1000,
      seq: 1,
      instanceId: 'other-version',
      version: 'test'
    })
  });

  const synced = context.GM_getValue('myScriptSettings', {});
  assert(synced.enableFoo === false && synced.exact === true, 'remote sync envelope must update GM_getValue state');
  assert(remoteChange && remoteChange.key === 'myScriptSettings', 'remote sync envelope must notify GM_addValueChangeListener');
  assert(remoteChange.remote === true, 'remote sync envelope must be emitted as a remote change');
}

async function testGmCompatSameOriginFetchFallback() {
  const code = read('src/content/gm-compat.js');
  const context = createGmCompatStorageContext();
  let fetchedUrl = '';
  context.chrome.runtime = {};
  context.fetch = (url, options) => {
    fetchedUrl = String(url);
    assert(options.credentials === 'include', 'same-origin fallback must include page credentials');
    return Promise.resolve({
      status: 200,
      statusText: 'OK',
      url: String(url),
      headers: { forEach(callback) { callback('text/html', 'content-type'); } },
      text() { return Promise.resolve('<tbody><tr></tr></tbody>'); }
    });
  };

  vm.runInNewContext(code, context, { filename: 'gm-compat.js' });

  const responseText = await new Promise((resolve, reject) => {
    context.GM_xmlhttpRequest({
      method: 'GET',
      url: 'https://www.nmbxd1.com/Member/User/Cookie/index.html',
      onload(response) { resolve(response.responseText); },
      onerror(error) { reject(error); }
    });
  });

  assert(fetchedUrl.endsWith('/Member/User/Cookie/index.html'), 'stale GM_xmlhttpRequest must use page fetch for same-origin requests');
  assert(responseText.includes('<tbody>'), 'same-origin fallback must return responseText to userscript callers');
  assert(context.__xdexRuntime.extensionContextInvalidated === true, 'stale fallback must still mark invalidated runtime');
}

function testUserscriptRuntimeLogHelper() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  assert(upstream.includes('function getXDexRuntimeInfo()'), 'upstream userscript must include runtime detection helper');
  assert(upstream.includes("declared.kind === 'extension'"), 'runtime helper must honor the Extension declared runtime');
  assert(upstream.includes("kind: 'userscript'"), 'runtime helper must fall back to userscript runtime');
  assert(upstream.includes("console.log('[runtime]:'"), 'userscript must log the detected runtime during startup');
}

function testSingletonStartupGuard() {
  const upstream = fs.readFileSync(resolveUpstreamUserscriptPath(), 'utf8');
  const runtimeIndex = upstream.indexOf('const XDEX_RUNTIME = getXDexRuntimeInfo();');
  const guardIndex = upstream.indexOf('shouldExitForXDexSingleton(XDEX_RUNTIME)');
  const waitIndex = upstream.indexOf('const XDEX_SINGLETON_WAIT_MS = 100;');
  const startupFunctionIndex = upstream.indexOf('function startXDexRuntime()');
  const scheduleFunctionIndex = upstream.indexOf('function scheduleXDexStartup()');
  const scheduleCallIndex = upstream.lastIndexOf('scheduleXDexStartup();');
  const delayedGuardIndex = upstream.indexOf('if (shouldExitForXDexSingleton(XDEX_RUNTIME)) return;', guardIndex + 1);
  const versionLogIndex = upstream.indexOf('cat_version();');
  const loadIndex = upstream.indexOf("window.addEventListener('load'");
  const observerIndex = upstream.indexOf('installEarlyStartupObserver();');
  const readyIndex = upstream.indexOf('$(document).ready');
  const startupBody = upstream.slice(startupFunctionIndex, scheduleCallIndex);

  assert(upstream.includes("const XDEX_SINGLETON_OWNER_DATASET_KEY = 'xdexSingletonOwner';"), 'userscript must define the shared singleton owner dataset key');
  assert(upstream.includes('function shouldExitForXDexSingleton(runtimeInfo)'), 'userscript must include a singleton startup guard');
  assert(upstream.includes("owner === 'extension'"), 'singleton guard must recognize Extension ownership');
  assert(upstream.includes("runtimeInfo.kind !== 'extension'"), 'singleton guard must allow the Extension runtime to continue');
  assert(waitIndex !== -1, 'userscript must define a bounded Extension marker wait window for cross-extension races');
  assert(startupFunctionIndex !== -1, 'userscript must wrap real startup in a callable startup function');
  assert(scheduleFunctionIndex !== -1, 'userscript must schedule startup through the singleton arbitrator');
  assert(scheduleCallIndex !== -1, 'userscript must call the singleton startup scheduler exactly once after startup body definition');
  assert(delayedGuardIndex !== -1, 'userscript must re-check Extension ownership after the bounded wait before startup');
  assert(runtimeIndex !== -1, 'userscript must compute runtime before singleton guard');
  assert(guardIndex !== -1, 'userscript must call the singleton startup guard');
  assert(runtimeIndex < guardIndex, 'singleton guard must run after runtime detection');
  assert(scheduleFunctionIndex < startupFunctionIndex, 'startup scheduler must be defined before real startup body');
  assert(guardIndex < delayedGuardIndex, 'startup scheduler must check immediately before delayed re-check');
  assert(delayedGuardIndex < startupFunctionIndex, 'delayed singleton re-check must be defined before real startup body');
  assert(startupFunctionIndex < scheduleCallIndex, 'startup scheduler must be called only after real startup body definition');
  assert(startupFunctionIndex < versionLogIndex, 'version logging must live inside the real startup function');
  assert(startupBody.includes('cat_version();'), 'version logging must be inside the startup body');
  assert(startupBody.includes("console.log('[runtime]:'"), 'runtime logging must be inside the startup body');
  assert(startupBody.includes("window.addEventListener('load'"), 'window.load initialization must be inside the startup body');
  assert(startupBody.includes('installEarlyStartupObserver();'), 'early observer installation must be inside the startup body');
  assert(startupBody.includes('$(document).ready'), 'document.ready initialization must be inside the startup body');
  assert(guardIndex < versionLogIndex, 'singleton guard must run before version logging');
  assert(guardIndex < loadIndex, 'singleton guard must run before window.load initialization');
  assert(guardIndex < observerIndex, 'singleton guard must run before early startup observer installation');
  assert(guardIndex < readyIndex, 'singleton guard must run before document.ready initialization');
}

function createSharedDocument() {
  const listeners = new Map();
  return {
    documentElement: { dataset: {} },
    addEventListener(type, fn) {
      const list = listeners.get(type) || [];
      list.push(fn);
      listeners.set(type, list);
    },
    removeEventListener(type, fn) {
      const list = listeners.get(type) || [];
      listeners.set(type, list.filter((listener) => listener !== fn));
    },
    dispatchEvent(event) {
      for (const fn of listeners.get(event.type) || []) fn(event);
      return true;
    }
  };
}

function testPageBridgeDeclaresSingletonOwner() {
  const code = read('src/content/page-bridge.js');
  const markerIndex = code.indexOf("xdexSingletonOwner");
  const bridgeEventIndex = code.indexOf("const callPageInitEvent");
  const document = createSharedDocument();
  const context = createBridgeContext(document);

  assert(markerIndex !== -1, 'page bridge must declare the Extension singleton owner marker');
  assert(markerIndex < bridgeEventIndex, 'page bridge must declare singleton ownership before bridge setup');

  vm.runInNewContext(code, context, { filename: 'page-bridge.js' });
  assert(document.documentElement.dataset.xdexSingletonOwner === 'extension', 'page bridge must mark Extension as singleton owner on the shared DOM');
  assert(document.documentElement.dataset.xdexSingletonSource === 'extension-main', 'page bridge must identify the Extension MAIN world as singleton source');
}

function createBridgeContext(document) {
  const context = {
    console,
    document,
    CustomEvent: function CustomEvent(type, options) {
      this.type = type;
      this.detail = options && options.detail;
    }
  };
  context.globalThis = context;
  context.window = context;
  return context;
}

function testPageBridgeBehavior() {
  const code = read('src/content/page-bridge.js');
  const document = createSharedDocument();
  const context = createBridgeContext(document);
  const rootNode = { id: 'root' };
  let firstNativeCount = 0;
  let secondNativeCount = 0;
  let pageDoneCount = 0;

  context.window.initContent = function initContent(root) {
    assert(root === rootNode, 'page bridge must forward the original root to existing native initContent');
    firstNativeCount += 1;
  };
  document.addEventListener('xdex:page-init-content', (event) => {
    assert(event.detail.root === rootNode, 'page bridge must emit the original root after page initContent');
    pageDoneCount += 1;
  });

  vm.runInNewContext(code, context, { filename: 'page-bridge.js' });
  context.window.initContent(rootNode);
  assert(firstNativeCount === 1, 'page bridge must wrap an existing native initContent');
  assert(pageDoneCount === 1, 'page bridge must emit after existing native initContent runs');

  context.window.initContent = function initContent(root) {
    assert(root === rootNode, 'page bridge must forward the original root to reassigned native initContent');
    secondNativeCount += 1;
  };
  context.window.initContent(rootNode);
  assert(secondNativeCount === 1, 'page bridge must wrap a later native initContent assignment');
  assert(pageDoneCount === 2, 'page bridge must emit after later native initContent runs');

  document.dispatchEvent(new context.CustomEvent('xdex:call-page-init-content', { detail: { root: rootNode } }));
  assert(secondNativeCount === 2, 'page bridge must call current native initContent from bridge event');
  assert(pageDoneCount === 2, 'page bridge event call must not echo page completion back to isolated bridge');
}

function testUserscriptBridgeSuppressesSelfOriginatedPageDone() {
  const code = read('src/content/userscript-bridge.js');
  const document = createSharedDocument();
  const context = createBridgeContext(document);
  const rootNode = { id: 'root' };
  let userscriptInitCount = 0;

  document.addEventListener('xdex:call-page-init-content', (event) => {
    document.dispatchEvent(new context.CustomEvent('xdex:page-init-content', { detail: event.detail }));
  });

  vm.runInNewContext(code, context, { filename: 'userscript-bridge.js' });
  context.window.initContent = function initContent(root) {
    assert(root === rootNode, 'userscript bridge suppression test must preserve root');
    userscriptInitCount += 1;
  };

  context.window.initContent(rootNode);
  assert(userscriptInitCount === 1, 'userscript bridge must suppress page-done events caused by its own page call');

  document.dispatchEvent(new context.CustomEvent('xdex:page-init-content', { detail: { root: rootNode } }));
  assert(userscriptInitCount === 2, 'userscript bridge must still handle independent page-origin init completion');
}

function testIntegratedInitContentBridgeDedupesSelfCall() {
  const pageCode = read('src/content/page-bridge.js');
  const userscriptCode = read('src/content/userscript-bridge.js');
  const document = createSharedDocument();
  const pageContext = createBridgeContext(document);
  const userscriptContext = createBridgeContext(document);
  const rootNode = { id: 'root' };
  let pageNativeCount = 0;
  let userscriptInitCount = 0;
  let pageDoneCount = 0;

  pageContext.window.initContent = function initContent(root) {
    assert(root === rootNode, 'integrated bridge must forward root to page native initContent');
    pageNativeCount += 1;
  };
  document.addEventListener('xdex:page-init-content', () => {
    pageDoneCount += 1;
  });

  vm.runInNewContext(pageCode, pageContext, { filename: 'page-bridge.js' });
  vm.runInNewContext(userscriptCode, userscriptContext, { filename: 'userscript-bridge.js' });
  userscriptContext.window.initContent = function initContent(root) {
    assert(root === rootNode, 'integrated bridge must forward root to userscript initContent');
    userscriptInitCount += 1;
  };

  userscriptContext.window.initContent(rootNode);
  assert(pageNativeCount === 1, 'isolated initContent call must run page native initContent once');
  assert(userscriptInitCount === 1, 'isolated initContent call must run userscript initContent once');
  assert(pageDoneCount === 0, 'isolated initContent call must not echo page completion back to userscript bridge');

  pageNativeCount = 0;
  userscriptInitCount = 0;
  pageDoneCount = 0;
  pageContext.window.initContent(rootNode);
  assert(pageNativeCount === 1, 'page-origin initContent call must run page native initContent once');
  assert(userscriptInitCount === 1, 'page-origin initContent call must propagate to userscript initContent once');
  assert(pageDoneCount === 1, 'page-origin initContent call must produce one page completion event');
}

async function testUserscriptBridgeWrapsInitContent() {
  const code = read('src/content/userscript-bridge.js');
  const listeners = new Map();
  let pageCallCount = 0;
  let pageDoneCount = 0;
  const document = {
    addEventListener(type, fn) {
      const list = listeners.get(type) || [];
      list.push(fn);
      listeners.set(type, list);
    },
    dispatchEvent(event) {
      if (event.type === 'xdex:call-page-init-content') pageCallCount += 1;
      if (event.type === 'xdex:page-init-content') pageDoneCount += 1;
      for (const fn of listeners.get(event.type) || []) fn(event);
      return true;
    }
  };
  const context = {
    console,
    document,
    CustomEvent: function CustomEvent(type, options) {
      this.type = type;
      this.detail = options && options.detail;
    }
  };
  context.globalThis = context;
  context.window = context;
  vm.runInNewContext(code, context, { filename: 'userscript-bridge.js' });

  let nativeCount = 0;
  context.window.initContent = function initContent() {
    nativeCount += 1;
  };

  context.window.initContent(document);
  assert(nativeCount === 1, 'userscript bridge must call upstream initContent once');
  assert(pageCallCount === 1, 'userscript bridge must notify page bridge before upstream initContent');

  document.dispatchEvent(new context.CustomEvent('xdex:page-init-content', { detail: { root: document } }));
  assert(pageDoneCount === 1, 'userscript bridge must tolerate page init completion event');
}

async function testIntegratedUpdateDebugBridge() {
  const pageCode = read('src/content/page-bridge.js');
  const userscriptCode = read('src/content/userscript-bridge.js');
  const document = createSharedDocument();
  const pageContext = createBridgeContext(document);
  const userscriptContext = createBridgeContext(document);
  const nextState = { checked: true, source: 'github' };
  const patchState = { pendingUpdateVersion: '2.3.1' };
  let checkCount = 0;
  let patchedState = null;

  vm.runInNewContext(pageCode, pageContext, { filename: 'page-bridge.js' });
  vm.runInNewContext(userscriptCode, userscriptContext, { filename: 'userscript-bridge.js' });

  userscriptContext.window.__xdexCheckUpdateNow = function checkUpdateNow() {
    checkCount += 1;
    return Promise.resolve(nextState);
  };
  userscriptContext.window.__xdexPatchUpdateCheckState = function patchUpdateCheckState(patch) {
    patchedState = patch;
    return { patched: true, patch };
  };

  assert(typeof pageContext.window.__xdexCheckUpdateNow === 'function', 'page bridge must expose update check debug API to MAIN world');
  assert(typeof pageContext.window.__xdexPatchUpdateCheckState === 'function', 'page bridge must expose update state patch debug API to MAIN world');

  const checkResult = await pageContext.window.__xdexCheckUpdateNow();
  assert(JSON.stringify(checkResult) === JSON.stringify(nextState), 'page debug bridge must resolve with isolated update check result');
  assert(checkCount === 1, 'page debug bridge must invoke isolated update check once');

  const patchResult = await pageContext.window.__xdexPatchUpdateCheckState(patchState);
  assert(JSON.stringify(patchedState) === JSON.stringify(patchState), 'page debug bridge must pass arguments to isolated debug function');
  assert(patchResult && patchResult.patched === true, 'page debug bridge must return isolated patch result');
}

async function testIntegratedPostHistoryDebugBridge() {
  const pageCode = read('src/content/page-bridge.js');
  const userscriptCode = read('src/content/userscript-bridge.js');
  const document = createSharedDocument();
  const pageContext = createBridgeContext(document);
  const userscriptContext = createBridgeContext(document);
  const debugState = { events: [{ stage: 'snapshot' }], last: { stage: 'snapshot' } };
  let cleared = false;

  vm.runInNewContext(pageCode, pageContext, { filename: 'page-bridge.js' });
  vm.runInNewContext(userscriptCode, userscriptContext, { filename: 'userscript-bridge.js' });

  userscriptContext.window.__xdexGetPostHistoryDebug = function getPostHistoryDebug() {
    return debugState;
  };
  userscriptContext.window.__xdexClearPostHistoryDebug = function clearPostHistoryDebug() {
    cleared = true;
    return { events: [], last: null };
  };

  assert(typeof pageContext.window.__xdexGetPostHistoryDebug === 'function', 'page bridge must expose post history debug getter to MAIN world');
  assert(typeof pageContext.window.__xdexClearPostHistoryDebug === 'function', 'page bridge must expose post history debug clear API to MAIN world');

  const getResult = await pageContext.window.__xdexGetPostHistoryDebug();
  assert(getResult && getResult.events && getResult.events[0].stage === 'snapshot', 'page post-history debug bridge must resolve isolated debug state');

  const clearResult = await pageContext.window.__xdexClearPostHistoryDebug();
  assert(cleared === true, 'page post-history debug bridge must invoke isolated clear function');
  assert(clearResult && Array.isArray(clearResult.events) && clearResult.events.length === 0, 'page post-history debug bridge must return isolated clear result');
}

async function testServiceWorkerInjectsApiUserhashCookie() {
  const code = read('src/background/service-worker.js');
  let messageListener = null;
  let userhashCookieQuery = null;
  let apiCookieSet = null;
  let fetchOptions = null;
  const context = {
    console,
    URL,
    chrome: {
      runtime: {
        onInstalled: { addListener() {} },
        onStartup: { addListener() {} },
        onMessage: {
          addListener(listener) { messageListener = listener; }
        },
        lastError: null
      },
      contextMenus: {
        onClicked: { addListener() {} },
        removeAll(callback) { if (callback) callback(); },
        create() {}
      },
      tabs: { sendMessage() {} },
      cookies: {
        get(details, callback) {
          userhashCookieQuery = details;
          callback({ value: 'raw-userhash-value' });
        },
        set(details, callback) {
          apiCookieSet = details;
          callback(Object.assign({}, details));
        }
      }
    },
    fetch(url, options) {
      fetchOptions = { url, options };
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        url,
        headers: {
          entries() { return []; },
          get() { return 'application/json'; }
        },
        text() { return Promise.resolve('{"ok":true}'); }
      });
    },
    btoa(value) {
      return Buffer.from(value, 'binary').toString('base64');
    }
  };
  context.globalThis = context;
  vm.runInNewContext(code, context, { filename: 'service-worker.js' });

  assert(typeof messageListener === 'function', 'service worker must register a runtime message listener');
  const response = await new Promise((resolve) => {
    messageListener({
      type: 'xdex:gm-request',
      details: {
        method: 'GET',
        url: 'https://api.nmb.best/api/ref?id=68821620',
        headers: {
          Cookie: 'userhash=stale-from-content-script',
          'X-Test': 'kept'
        },
        responseType: 'text'
      }
    }, {
      tab: { url: 'https://www.nmbxd1.com/t/64180270?page=202' },
      url: 'https://www.nmbxd1.com/t/64180270?page=202'
    }, resolve);
  });

  assert(response && response.ok === true, 'service worker API request test must receive fetch response');
  assert(userhashCookieQuery && userhashCookieQuery.url === 'https://www.nmbxd1.com/t/64180270?page=202' && userhashCookieQuery.name === 'userhash', 'api.nmb.best GM requests must read userhash from the sender page cookie jar');
  assert(apiCookieSet && apiCookieSet.url === 'https://api.nmb.best/' && apiCookieSet.name === 'userhash' && apiCookieSet.value === 'raw-userhash-value', 'api.nmb.best GM requests must sync sender userhash into the API domain cookie jar');
  assert(fetchOptions && fetchOptions.url === 'https://api.nmb.best/api/ref?id=68821620', 'api.nmb.best GM request must keep the original target URL');
  assert(!('Cookie' in fetchOptions.options.headers), 'api.nmb.best GM request must not rely on a forbidden manual Cookie header');
  assert(fetchOptions.options.headers['X-Test'] === 'kept', 'api.nmb.best GM request must preserve non-cookie headers');
  assert(!JSON.stringify(fetchOptions.options.headers).includes('stale-from-content-script'), 'api.nmb.best GM request must not trust a caller-supplied Cookie header');
}

(async function run() {
  testDirectUserscriptCopy();
  testExtensionRuntimeDescriptor();
  testGmInfoMetadataMatchesUserscriptHeader();
  testManifestVersionMatchesUserscriptHeader();
  testExtensionUpdateHostPermissions();
  testRuntimeSpecificUpdateSources();
  testGeneratedUpdateJsonContract();
  testGithubUpdateFooterHighlight();
  testRunLinkBlankContract();
  testSettingsPanelModuleShellContract();
  testSettingsPanelSaveAndReloadContract();
  testBrowsingHistoryStorageContract();
  testPostHistoryStorageAndCompletionContract();
  testPostHistoryServerContentWinsContract();
  testPostHistoryForumNameContract();
  testPostHistoryPanelContract();
  testHistorySearchHelpContract();
  testPostHistoryAdvancedSearchContract();
  testHistoryAndPostCanonicalReplyLinksContract();
  testPostHistoryLiveSyncContract();
  testPostHistoryRefImageContract();
  testHistoryAndPostImageQuotePreviewContract();
  testHistoryAndPostContentEnhancementContract();
  testHistoryAndPostDeleteConfirmContract();
  testBrowsingHistoryUrlParsingContract();
  testKaomojiContextCopyContract();
  testBrowsingHistoryIndexContract();
  testBrowsingHistoryExtractionAndRenderingContract();
  testRelativeTimeIdempotenceContract();
  testBrowsingHistoryPanelBodyContract();
  testGmCompatLocalStorageSyncBridge();
  await testGmCompatSameOriginFetchFallback();
  testUserscriptRuntimeLogHelper();
  testSingletonStartupGuard();
  await testGifsiclePreload();
  testManifestBridgeOrder();
  testPageBridgeDeclaresSingletonOwner();
  testPageBridgeBehavior();
  testUserscriptBridgeSuppressesSelfOriginatedPageDone();
  testIntegratedInitContentBridgeDedupesSelfCall();
  await testUserscriptBridgeWrapsInitContent();
  await testIntegratedUpdateDebugBridge();
  await testIntegratedPostHistoryDebugBridge();
  await testServiceWorkerInjectsApiUserhashCookie();
  console.log('direct replacement contract ok');
}()).catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exitCode = 1;
});
