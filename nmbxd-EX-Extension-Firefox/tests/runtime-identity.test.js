// 运行时身份契约（Chrome 扩展 / Firefox 扩展必须完全等价）：
//   1. kind 名按浏览器家族区分（chrome-extension* / firefox-extension*）；
//   2. 所有分流判定走 isXDex* 辅助函数，两种扩展版的压制与分流结果一致；
//   3. 脚本端与扩展端共存时的单例压制对两种扩展都成立。
// 运行：node tests/runtime-identity.test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const EXT_ROOT = path.join(__dirname, '..');
const USERSCRIPT = path.join(EXT_ROOT, 'src', 'content', 'nmbxd-EX-for-edit.user.js');
const GM_COMPAT = path.join(EXT_ROOT, 'src', 'content', 'gm-compat.js');

const source = fs.readFileSync(USERSCRIPT, 'utf8');

function slice(fromMarker, toMarker) {
  const start = source.indexOf(fromMarker);
  assert(start >= 0, `源码缺少片段起点: ${fromMarker}`);
  const end = source.indexOf(toMarker, start + fromMarker.length);
  assert(end > start, `源码缺少片段终点: ${toMarker}`);
  return source.slice(start, end);
}

// tag 0 段：浏览器家族识别 + kind 辅助 + getXDexRuntimeInfo；外加单例压制函数。
const RUNTIME_SEGMENT =
  slice('const XDEX_SINGLETON_OWNER_DATASET_KEY', '(function earlyIconBtnStyle()') +
  slice('function shouldExitForXDexSingleton(', 'function cat_version(');

const ownerKeyMatch = source.match(/XDEX_SINGLETON_OWNER_DATASET_KEY = '([^']+)'/);
assert(ownerKeyMatch, '源码缺少单例 owner dataset key');
const OWNER_KEY = ownerKeyMatch[1];

const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const FIREFOX_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0';
const EXTENSION_ID = 'abcdefghijklmnopabcdefghijklmnop';

function loadRuntime(options) {
  const opts = options || {};
  const dataset = {};
  if (opts.owner) dataset[OWNER_KEY] = opts.owner;
  const sandbox = {
    console,
    navigator: { userAgent: opts.userAgent || '' },
    document: { documentElement: { dataset } },
    GM_info: { script: { version: '0.0.0' }, scriptHandler: opts.scriptHandler || '' }
  };
  if (opts.__xdexRuntime) sandbox.__xdexRuntime = opts.__xdexRuntime;
  if (opts.chrome) sandbox.chrome = opts.chrome;
  if (opts.browser) sandbox.browser = opts.browser;
  // QwQNT 桥：Electron 客户端注入 window.QwQNTNmbxd
  if (opts.qwqntBridge) sandbox.window = { QwQNTNmbxd: { xdexRequest() {} } };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(
    `${RUNTIME_SEGMENT}
     const XDEX_RUNTIME = getXDexRuntimeInfo();
     globalThis.__probe = {
       runtime: XDEX_RUNTIME,
       family: XDEX_BROWSER_FAMILY,
       isExtensionKind: isXDexExtensionKind,
       isDnrKind: isXDexDnrExtensionKind,
       isLimitedKind: isXDexLimitedExtensionKind,
       isPackaged: isXDexPackagedRuntime,
       exitNow: shouldExitForXDexSingleton(XDEX_RUNTIME)
     };`,
    sandbox
  );
  return sandbox.__probe;
}

// 内容脚本可见的 chrome API：runtime.id 有、declarativeNetRequest 没有（Chrome 文档：内容脚本只能访问 dom/i18n/storage/runtime.*）
const chromeContentScriptApis = { runtime: { id: EXTENSION_ID } };
// 假想的“内容脚本可见 DNR”宿主，用来验证 kind 命名成对覆盖
const chromeWithDnrApis = { runtime: { id: EXTENSION_ID }, declarativeNetRequest: { updateSessionRules() {} } };

function testChromeExtensionKind() {
  const p = loadRuntime({ userAgent: CHROME_UA, chrome: chromeContentScriptApis, scriptHandler: 'extension' });
  assert.strictEqual(p.family, 'chrome');
  assert.strictEqual(p.runtime.kind, 'chrome-extension-limited', 'Chrome 扩展内容脚本（DNR 不可见）应为 chrome-extension-limited');
  assert.strictEqual(p.runtime.packaged, true);
  assert.strictEqual(p.runtime.browser, 'chrome');
}

function testFirefoxExtensionKind() {
  const p = loadRuntime({
    userAgent: FIREFOX_UA,
    chrome: chromeContentScriptApis,
    browser: { runtime: { id: 'nmbxd-ex-firefox@saya-addon' } },
    scriptHandler: 'extension'
  });
  assert.strictEqual(p.family, 'firefox');
  assert.strictEqual(p.runtime.kind, 'firefox-extension-limited', 'Firefox 扩展内容脚本必须报 firefox-extension-limited');
  assert.strictEqual(p.runtime.packaged, true);
  assert.strictEqual(p.runtime.browser, 'firefox');
}

function testFirefoxDetectedByBrowserApiWithoutFirefoxUa() {
  // 派生/改 UA 的 Firefox 宿主：只有 browser.runtime.id 而没有 chrome.runtime.id
  const p = loadRuntime({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36',
    browser: { runtime: { id: 'nmbxd-ex-firefox@saya-addon' } },
    scriptHandler: 'extension'
  });
  assert.strictEqual(p.family, 'firefox', '必须能用 browser.runtime.id 兜底识别 Firefox');
}

function testDnrVisibleKinds() {
  const chromeDnr = loadRuntime({ userAgent: CHROME_UA, chrome: chromeWithDnrApis });
  const firefoxDnr = loadRuntime({
    userAgent: FIREFOX_UA,
    chrome: chromeWithDnrApis,
    browser: { runtime: { id: EXTENSION_ID } }
  });
  assert.strictEqual(chromeDnr.runtime.kind, 'chrome-extension');
  assert.strictEqual(firefoxDnr.runtime.kind, 'firefox-extension');
}

function testDeclaredFallbackUsesBrowserFamily() {
  const declared = { kind: 'extension', storage: 'browser.storage.local' };
  const ff = loadRuntime({ userAgent: FIREFOX_UA, __xdexRuntime: declared, scriptHandler: 'extension' });
  const cr = loadRuntime({ userAgent: CHROME_UA, __xdexRuntime: declared, scriptHandler: 'extension' });
  assert.strictEqual(ff.runtime.kind, 'firefox-extension-limited', '声明为扩展但无 runtime.id 时也必须用 firefox-* 名');
  assert.strictEqual(cr.runtime.kind, 'chrome-extension-limited');
  assert.strictEqual(ff.runtime.packaged, true, '声明为扩展时仍按打包运行时处理');
}

function testUserscriptAndQwqntKinds() {
  const cr = loadRuntime({ userAgent: CHROME_UA, scriptHandler: 'tampermonkey' });
  assert.strictEqual(cr.runtime.kind, 'userscript');
  assert.strictEqual(cr.runtime.packaged, false);
  assert.strictEqual(cr.runtime.browser, 'chrome');
  const ff = loadRuntime({ userAgent: FIREFOX_UA, scriptHandler: 'violentmonkey' });
  assert.strictEqual(ff.runtime.kind, 'userscript');
  assert.strictEqual(ff.runtime.browser, 'firefox');
  const qw = loadRuntime({ userAgent: CHROME_UA, qwqntBridge: true });
  assert.strictEqual(qw.runtime.kind, 'qwqnt');
  assert.strictEqual(qw.runtime.packaged, true);
  assert.strictEqual(qw.runtime.browser, 'electron');
}

function testKindPredicatesAreSymmetric() {
  const p = loadRuntime({ userAgent: CHROME_UA, chrome: chromeContentScriptApis });
  const pairs = [
    ['chrome-extension', 'firefox-extension'],
    ['chrome-extension-limited', 'firefox-extension-limited']
  ];
  pairs.forEach(([chromeKind, firefoxKind]) => {
    assert.strictEqual(p.isExtensionKind(chromeKind), p.isExtensionKind(firefoxKind), `${chromeKind}/${firefoxKind} 必须同为扩展`);
    assert.strictEqual(p.isDnrKind(chromeKind), p.isDnrKind(firefoxKind), `${chromeKind}/${firefoxKind} 的 DNR 判定必须一致`);
    assert.strictEqual(p.isLimitedKind(chromeKind), p.isLimitedKind(firefoxKind), `${chromeKind}/${firefoxKind} 的受限判定必须一致`);
    assert.strictEqual(p.isPackaged({ kind: chromeKind }), p.isPackaged({ kind: firefoxKind }), `${chromeKind}/${firefoxKind} 必须同为打包运行时`);
  });
  assert.strictEqual(p.isExtensionKind('userscript'), false);
  assert.strictEqual(p.isExtensionKind('qwqnt'), false);
  assert.strictEqual(p.isPackaged({ kind: 'userscript', packaged: false }), false);
  assert.strictEqual(p.isPackaged({ kind: 'extension' }), true, '声明式 kind=extension 仍算打包运行时');
}

function testSingletonSuppressionIsSymmetric() {
  const hosts = [
    { family: 'chrome', ua: CHROME_UA, apis: { chrome: chromeContentScriptApis } },
    { family: 'firefox', ua: FIREFOX_UA, apis: { chrome: chromeContentScriptApis, browser: { runtime: { id: EXTENSION_ID } } } }
  ];
  hosts.forEach((host) => {
    // 脚本端：没有扩展 API，只有宿主页面上由 page-bridge 写入的 owner 标记
    const userscript = loadRuntime({ userAgent: host.ua, owner: 'extension', scriptHandler: 'tampermonkey' });
    assert.strictEqual(userscript.exitNow, true, `${host.family}: 扩展在场时脚本端必须让位`);
    assert.strictEqual(userscript.runtime.kind, 'userscript', `${host.family}: 脚本端 kind 不应变成扩展`);

    const extension = loadRuntime(Object.assign({ userAgent: host.ua, owner: 'extension', scriptHandler: 'extension' }, host.apis));
    assert.strictEqual(extension.exitNow, false, `${host.family}: 扩展自身不得让位`);

    const noOwner = loadRuntime({ userAgent: host.ua, scriptHandler: 'tampermonkey' });
    assert.strictEqual(noOwner.exitNow, false, `${host.family}: 没有扩展标记时脚本端正常运行`);
  });
}

function testBranchesNoLongerHardcodeChromeKind() {
  const leftovers = [
    "XDEX_RUNTIME.kind === 'extension' || XDEX_RUNTIME.packaged",
    "runtime.kind === 'chrome-extension'",
    "runtime.kind === 'chrome-extension-limited'"
  ].filter((needle) => source.includes(needle));
  assert.deepStrictEqual(leftovers, [], `仍有硬编码 Chrome kind 的分支：${leftovers.join(' | ')}`);
  assert(source.includes('function isXDexExtensionKind('), '必须存在 kind 判定辅助函数');
  assert(source.includes('function isXDexPackagedRuntime('), '必须存在打包运行时判定辅助函数');
  const gateCount = (source.match(/isXDexPackagedRuntime\(/g) || []).length;
  assert(gateCount >= 8, `打包运行时判定应覆盖全部分流点，实际出现 ${gateCount} 次`);
}

function testGmCompatDeclaresBrowserFamily() {
  const compat = fs.readFileSync(GM_COMPAT, 'utf8');
  assert(compat.includes("browser: isFirefoxHost ? 'firefox' : 'chrome'"), 'gm-compat 必须按宿主声明 __xdexRuntime.browser');
  assert(compat.includes("(isFirefoxHost ? 'browser' : 'chrome') + '.storage.local'"), 'gm-compat 的 storage 命名应随宿主变化');
  assert(compat.includes('/Firefox\\//i.test(ua)'), 'gm-compat 必须用 UA 识别 Firefox 宿主');
}

const tests = [
  testChromeExtensionKind,
  testFirefoxExtensionKind,
  testFirefoxDetectedByBrowserApiWithoutFirefoxUa,
  testDnrVisibleKinds,
  testDeclaredFallbackUsesBrowserFamily,
  testUserscriptAndQwqntKinds,
  testKindPredicatesAreSymmetric,
  testSingletonSuppressionIsSymmetric,
  testBranchesNoLongerHardcodeChromeKind,
  testGmCompatDeclaresBrowserFamily
];

let failed = 0;
tests.forEach((fn) => {
  try {
    fn();
    console.log(`  PASS ${fn.name}`);
  } catch (err) {
    failed += 1;
    console.error(`  FAIL ${fn.name}\n       ${(err && err.message) || err}`);
  }
});

if (failed) {
  console.error(`${failed} / ${tests.length} 项失败`);
  process.exit(1);
}
console.log('runtime identity contract ok');