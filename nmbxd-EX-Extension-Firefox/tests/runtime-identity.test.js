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

// 内容脚本可见的 chrome API：runtime.id 有、declarativeNetRequest 没有
// （Chrome 官方文档：内容脚本只能访问 dom/i18n/storage/runtime.*；实测 dnr === undefined）
const chromeContentScriptApis = { runtime: { id: EXTENSION_ID } };
// 假想的"内容脚本也能看见 DNR"宿主，用来验证 API 可见性这条判定仍然有效
const chromeWithDnrApis = { runtime: { id: EXTENSION_ID }, declarativeNetRequest: { updateSessionRules() {} } };
const DNR_PERMS = ['storage', 'contextMenus', 'cookies', 'downloads', 'offscreen', 'clipboardWrite', 'alarms', 'declarativeNetRequestWithHostAccess'];
const NO_DNR_PERMS = ['storage', 'contextMenus', 'cookies', 'downloads'];
function runtimeWithManifest(perms) {
  return { runtime: { id: EXTENSION_ID, getManifest: () => ({ permissions: perms }) } };
}

function testChromeExtensionKindUsesDeclaredDnr() {
  // 关键用例：内容脚本看不到 DNR，但清单声明了权限 → 必须报 chrome-extension（DNR 路径可用）
  const p = loadRuntime({ userAgent: CHROME_UA, chrome: runtimeWithManifest(DNR_PERMS), scriptHandler: 'extension' });
  assert.strictEqual(p.family, 'chrome');
  assert.strictEqual(p.runtime.kind, 'chrome-extension', '清单声明 DNR 时必须走 chrome-extension（规则由后台安装）');
  assert.strictEqual(p.runtime.hasDnr, true);
  assert.strictEqual(p.runtime.hasDnrDeclared, true);
  assert.strictEqual(p.runtime.hasDnrApi, false, '内容脚本看不到 API 才是常态');
  assert.strictEqual(p.runtime.packaged, true);
  assert.strictEqual(p.runtime.browser, 'chrome');
}

function testChromeExtensionKindWithoutDeclaredDnr() {
  // 清单没有 DNR 权限（旧版/精简构建）→ 保守回到 limited，走容器接口替换
  const p = loadRuntime({ userAgent: CHROME_UA, chrome: runtimeWithManifest(NO_DNR_PERMS), scriptHandler: 'extension' });
  assert.strictEqual(p.runtime.kind, 'chrome-extension-limited', '未声明 DNR 时必须退回 chrome-extension-limited');
  assert.strictEqual(p.runtime.hasDnr, false);
  assert.strictEqual(p.runtime.hasDnrDeclared, false);
}

function testFirefoxExtensionKind() {
  const p = loadRuntime({
    userAgent: FIREFOX_UA,
    chrome: runtimeWithManifest(['storage', 'contextMenus', 'cookies', 'declarativeNetRequest']),
    browser: { runtime: { id: 'nmbxd-ex-firefox@saya-addon' } },
    scriptHandler: 'extension'
  });
  assert.strictEqual(p.family, 'firefox');
  assert.strictEqual(p.runtime.kind, 'firefox-extension', 'Firefox 构建清单声明 declarativeNetRequest → firefox-extension');
  assert.strictEqual(p.runtime.packaged, true);
  assert.strictEqual(p.runtime.browser, 'firefox');
}

function testFirefoxLimitedWithoutDeclaredDnr() {
  const p = loadRuntime({
    userAgent: FIREFOX_UA,
    chrome: runtimeWithManifest(NO_DNR_PERMS),
    browser: { runtime: { id: 'nmbxd-ex-firefox@saya-addon' } },
    scriptHandler: 'extension'
  });
  assert.strictEqual(p.runtime.kind, 'firefox-extension-limited', '未声明 DNR 的 Firefox 构建也应退回 limited');
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

function testBackgroundGuardsDnrRules() {
  const worker = fs.readFileSync(path.join(EXT_ROOT, 'src', 'background', 'service-worker.js'), 'utf8');
  assert(worker.includes('function ensureXdexHostPermissionForRules('), '后台必须先用 permissions.contains 确认站点访问权限');
  assert(worker.includes('chrome.runtime.getManifest();') || worker.includes('chrome.runtime.getManifest()'), '权限查询必须基于清单声明');
  assert(worker.includes('.filter((pattern) => XDEX_POST_RULE_DOMAINS.some((domain) => String(pattern).includes(domain)))'), '权限查询必须挑出两个主域的清单模式');
  assert(worker.includes('chrome.permissions.contains({ origins: declared })'), '必须用清单里声明的模式查询（用 *:// 会假阴性）');
  assert(worker.includes('chrome.permissions.getAll()'), 'contains 为否时要用已授予清单复核，避免误判可用路径');
  assert(!/contains\(\{ origins: XDEX_POST_RULE_DOMAINS\.map/.test(worker), '禁止自造 *:// 模式查询权限');
  assert(worker.includes('function verifyXdexPostRulesApplied('), '后台必须用 getSessionRules 复核规则是否落地');
  const handlerStart = worker.indexOf('async function handleDnrCookieRule(');
  assert(handlerStart !== -1, 'handleDnrCookieRule 必须存在');
  const handler = worker.slice(handlerStart, worker.indexOf('\n}\n', handlerStart));
  const guardIndex = handler.indexOf('await ensureXdexHostPermissionForRules();');
  const addIndex = handler.indexOf('await api.updateSessionRules({ removeRuleIds: XDEX_POST_RULE_IDS.slice(), addRules });');
  const verifyIndex = handler.indexOf('await verifyXdexPostRulesApplied();');
  // 关闭规则的分支也有一次 return { ok: true }，这里取最后一次（即加规则后的成功返回）
  const okIndex = handler.lastIndexOf('return { ok: true };');
  assert(guardIndex !== -1 && addIndex !== -1 && verifyIndex !== -1, 'DNR 处理必须依次：权限守卫 → 加规则 → 落地校验');
  assert(guardIndex < addIndex && addIndex < verifyIndex && verifyIndex < okIndex, '校验顺序必须阻止"加了却没生效"就回 ok:true');
}

const tests = [
  testChromeExtensionKindUsesDeclaredDnr,
  testChromeExtensionKindWithoutDeclaredDnr,
  testFirefoxExtensionKind,
  testFirefoxLimitedWithoutDeclaredDnr,
  testFirefoxDetectedByBrowserApiWithoutFirefoxUa,
  testDnrVisibleKinds,
  testDeclaredFallbackUsesBrowserFamily,
  testUserscriptAndQwqntKinds,
  testKindPredicatesAreSymmetric,
  testSingletonSuppressionIsSymmetric,
  testBranchesNoLongerHardcodeChromeKind,
  testGmCompatDeclaresBrowserFamily,
  testBackgroundGuardsDnrRules
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