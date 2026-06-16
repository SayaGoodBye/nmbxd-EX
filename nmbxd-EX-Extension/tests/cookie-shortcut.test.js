const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const scriptPath = path.join(root, 'nmbxd-EX-for-edit.user.js');
const script = fs.readFileSync(scriptPath, 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function testExtensionStorageReadyBeforeStartup() {
  const readyIndex = script.indexOf('const XDEX_GM_STORAGE_READY = getXDexGmStorageReady();');
  const schedulerIndex = script.indexOf('function scheduleXDexStartup()');
  const gatedStartIndex = script.indexOf('startAfterStorageReady();');

  assert(readyIndex !== -1, 'userscript must read the Extension GM storage readiness promise before startup scheduling');
  assert(schedulerIndex !== -1, 'userscript must schedule startup through scheduleXDexStartup');
  assert(script.includes('function getXDexGmStorageReady()'), 'userscript must expose a helper for Extension GM storage readiness');
  assert(script.includes('XDEX_GM_STORAGE_READY.then(() => {'), 'userscript and Extension startup scheduler must wait for GM storage readiness before startup');
  assert(readyIndex < schedulerIndex, 'GM storage readiness must be captured before startup scheduling');
  assert(script.indexOf('XDEX_GM_STORAGE_READY.then(() => {') < gatedStartIndex, 'startup must be gated behind GM storage readiness');
}

function testCookieShortcutUsesStableBackslashMatch() {
  assert(script.includes('function isCookieDropdownShortcut(e)'), 'userscript must centralize cookie dropdown shortcut matching');
  assert(script.includes("e.code === 'Backslash'"), 'cookie dropdown shortcut must support physical Backslash key matching');
  assert(script.includes("e.code === 'IntlBackslash'"), 'cookie dropdown shortcut must support international Backslash key matching');
  assert(script.includes("e.key === '\\\\'"), 'cookie dropdown shortcut must keep character Backslash fallback matching');
  assert(script.includes('if (isCookieDropdownShortcut(e))'), 'bindCtrlEnter must use the centralized cookie shortcut matcher');
}

function testCookieShortcutUsesDocumentCaptureHandler() {
  assert(script.includes('function openCookieDropdownFromShortcut(focusBackTarget)'), 'userscript must centralize cookie dropdown opening');
  assert(script.includes('function openCookieShortcutMenu(dropdown, focusBackTarget)'), 'Extension shortcut must use a script-rendered cookie menu instead of relying on native select picker');
  assert(script.includes("XDEX_RUNTIME && XDEX_RUNTIME.kind === 'extension'"), 'Extension cookie shortcut path must be runtime gated');
  assert(script.includes('return openCookieShortcutMenu(dropdown, focusBackTarget);'), 'Extension cookie shortcut must bypass silent showPicker path');
  assert(script.includes('custom-menu-opened'), 'Extension cookie shortcut must log script-rendered menu opening');
  assert(script.includes('function installCookieDropdownShortcutHandler()'), 'userscript must install a document-level cookie shortcut handler');
  assert(script.includes('document.addEventListener(\'keydown\', onCookieDropdownShortcutKeydown, true)'), 'cookie shortcut handler must use capture phase');
  assert(script.includes('installCookieDropdownShortcutHandler.__installed'), 'cookie shortcut handler must be installed only once');
  assert(script.includes('startup.batch2.installCookieDropdownShortcutHandler'), 'startup must install the cookie shortcut handler even outside textarea focus');
}

testExtensionStorageReadyBeforeStartup();
testCookieShortcutUsesStableBackslashMatch();
testCookieShortcutUsesDocumentCaptureHandler();
console.log('cookie shortcut contract ok');
