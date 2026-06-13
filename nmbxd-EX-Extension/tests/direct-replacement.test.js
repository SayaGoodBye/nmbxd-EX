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



function testUpdateJsonVersionMatchesUserscriptHeader() {

  const update = JSON.parse(read('update.json'));

  const userscriptHeader = normalizeLineEndings(extractUserscriptHeader(read('src/content/nmbxd-EX-for-edit.user.js')));

  const userscriptVersion = readMetaValue(userscriptHeader, 'version');

  assert(update.extension && update.extension.version === userscriptVersion, 'update.json extension version must match userscript @version');

}



function testSyncScriptUpdatesUpdateJson() {

  const syncScript = read('scripts/sync-userscript-meta.js');

  assert(syncScript.includes('const updateJsonPath = path.join(root, \'update.json\')'), 'sync script must target update.json');

  assert(syncScript.includes('function buildUpdateJson(header)'), 'sync script must build update.json from userscript metadata');

  assert(syncScript.includes('fs.writeFileSync(updateJsonPath, buildUpdateJson(header), \'utf8\')'), 'sync script must write update.json during metadata sync');

}



function findRepoRoot(startDir) {
  let dir = startDir;
  for (let i = 0; i < 10; i += 1) {
    if (fs.existsSync(path.join(dir, '.github', 'workflows', 'release.yml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function testReleaseWorkflowVerifiesUpdateJson() {
  const repoRoot = findRepoRoot(root);
  if (!repoRoot) return;
  const workflow = fs.readFileSync(path.join(repoRoot, '.github', 'workflows', 'release.yml'), 'utf8');
  assert(workflow.includes("const update = JSON.parse(fs.readFileSync('dist/nmbxd-EX-Extension/update.json', 'utf8'));"), 'release workflow must read extension update.json');
  assert(workflow.includes('update.extension.version !== userscriptVersion'), 'release workflow must verify update.json version against userscript');
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

(async function run() {
  testDirectUserscriptCopy();
  testExtensionRuntimeDescriptor();
  testGmInfoMetadataMatchesUserscriptHeader();
  testManifestVersionMatchesUserscriptHeader();
  testUpdateJsonVersionMatchesUserscriptHeader();
  testSyncScriptUpdatesUpdateJson();
  testReleaseWorkflowVerifiesUpdateJson();
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
  console.log('direct replacement contract ok');
}()).catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exitCode = 1;
});
