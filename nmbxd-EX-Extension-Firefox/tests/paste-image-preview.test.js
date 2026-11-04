const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const scriptPath = path.join(root, 'nmbxd-EX-for-edit.user.js');
const script = fs.readFileSync(scriptPath, 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function testPreviewFileChangeBindingSyncsExistingFile() {
  assert(
    script.includes('syncPreviewFromCurrentFileInput'),
    'preview image binding must define a helper that syncs the current file input state'
  );
  assert(
    /fileInput\.addEventListener\('change',\s*syncPreviewFromCurrentFileInput\)/.test(script),
    'preview image change listener must use the shared sync helper'
  );
  assert(
    /syncPreviewFromCurrentFileInput\(\);/.test(script),
    'preview image binding must immediately render any file already present on the input'
  );
}

function testPasteImageCanPopulateInputAndNotifyPreview() {
  assert(
    script.includes('new DataTransfer()'),
    'paste image handling must be able to convert a clipboard image into input.files'
  );
  assert(
    script.includes("fileInput.dispatchEvent(new Event('change', { bubbles: true }))"),
    'paste image handling must dispatch change so late-bound preview/clear-button logic can react'
  );
}

// 全面修复 1：updatePreviewFromFile 不能只用闭包捕获的旧 $box，
// 必须每次调用时实时查询“当前真正在屏幕上的预览框”（浮窗内优先）。
// 实现上抽出了 getLivePreviewBox()，它用 document.querySelector 实时定位。
function testUpdatePreviewQueriesLivePreviewBox() {
  assert(
    /function updatePreviewImageFromFile\(/.test(script),
    'updatePreviewImageFromFile must exist as the single preview-update entry point'
  );
  assert(
    /function getLivePreviewBox\(\)\s*\{[^}]*document\.querySelector\([^)]*\.h-preview-box/.test(script),
    'a getLivePreviewBox() helper must resolve the live preview box via document.querySelector at call time'
  );
  // 清除按钮此前调用的是 initPreviewBox 内的局部 updatePreviewFromFile，
  // 跨作用域不可达 → 恒走兜底分支，HEIC 去重状态从未复位。
  assert(
    /xdex-clear-image-btn[\s\S]{0,600}updatePreviewImageFromFile\(null\)/.test(script),
    'clear-image button must call the global updatePreviewImageFromFile(null) so preview state (incl. HEIC tip dedupe) resets'
  );
  assert(
    !/typeof updatePreviewFromFile === 'function'/.test(script),
    'clear-image button must not test for the removed inner-scope updatePreviewFromFile wrapper'
  );
  // 关键修复：粘贴监听必须是不依赖 enhanceIsland 初始化的全局幂等绑定，
  // 否则早期打开 REPLY 浮窗时粘贴图片根本不会被脚本捕获。
  assert(
    /function bindPasteImagePreviewOnce\(\)/.test(script),
    'a global idempotent bindPasteImagePreviewOnce() must exist so paste is captured even before enhanceIsland runs'
  );
  assert(
    /bindPasteImagePreviewOnce\(\);/.test(script),
    'bindPasteImagePreviewOnce() must be invoked from the reply overlay open() path'
  );
}

// 全面修复 2：REPLY 浮窗 open() 必须能把“浮窗外出现的预览框”搬进浮窗，
// 否则 open() 早于 enhanceIsland 时，预览框会停在浮窗外，粘贴预览打到看不见的框。
function testOpenMovesStrayPreviewIntoOverlay() {
  const openIdx = script.indexOf('    function open() {');
  assert(openIdx !== -1, 'reply overlay open() must exist');
  const after = script.slice(openIdx);
  // 跳过函数头后，按下一个顶层 function 截断
  const openBody = after.split(/function\s+\w+\s*\(/m)[1] || '';
  assert(
    openBody.includes('h-preview-box'),
    'reply overlay open() must deal with the preview box'
  );
  // open() 里必须出现对 .h-preview-box 的实时查询（含搬运滞后预览框的逻辑）
  assert(
    /querySelector\([^)]*h-preview-box/.test(openBody),
    'open() must re-query the preview box (not only rely on the early null previewEl)'
  );
}

// early REPLY：open() 必须在显示前注入 qp-style，且折叠表单不能先在原位 show()
function testEarlyReplyOpenInjectsStyleBeforeShow() {
  assert(
    /function ensureReplyOverlayStyle\(\)/.test(script),
    'ensureReplyOverlayStyle() must exist so early open can inject qp-style without waiting for batch2'
  );
  assert(
    /function isDarkReaderActive\(\)/.test(script),
    'isDarkReaderActive() must be hoisted for early theme sync'
  );
  assert(
    /function syncQuotePopupTheme\(\)/.test(script),
    'syncQuotePopupTheme() must be hoisted for early theme sync'
  );

  const openIdx = script.indexOf('    function open() {');
  assert(openIdx !== -1, 'reply overlay open() must exist');
  const after = script.slice(openIdx);
  // 跳过 open 自己的函数头，取 body
  const brace = after.indexOf('{');
  const openBody = after.slice(brace + 1);
  const styleCallIdx = openBody.indexOf('ensureReplyOverlayStyle()');
  const showIdx = openBody.indexOf("ov.style.display = 'block'");
  assert(styleCallIdx !== -1, 'open() must call ensureReplyOverlayStyle()');
  assert(showIdx !== -1, "open() must show overlay via display = 'block'");
  assert(styleCallIdx < showIdx, 'ensureReplyOverlayStyle() must run before overlay is shown');

  assert(
    /const wasCollapsedForOpen\s*=/.test(openBody),
    'open() must remember collapsed state without showing form in-place first'
  );
  assert(
    /body\.appendChild\(wrap\);[\s\S]*wasCollapsedForOpen[\s\S]*\$\(formEl\)\.show\(\)/.test(openBody),
    'collapsed form must only show() after it has been moved into the overlay wrap'
  );
  assert(
    /xdex-placeholder\.xdex-generic-toggle/.test(openBody) || /xdex-generic-toggle/.test(openBody),
    'open() must handle the early collapse toggle button so it is not shown inside the overlay'
  );
  // Utils.collapse 必须跳过浮窗内 / qp-reply-form 表单，避免 early pass 把浮窗里的表单再折成按钮
  const collapseIdx = script.indexOf('collapse($elem, hint)');
  assert(collapseIdx !== -1, 'Utils.collapse must exist');
  const collapseBody = script.slice(collapseIdx, collapseIdx + 900);
  assert(
    /qp-reply-form/.test(collapseBody) && /qp-body/.test(collapseBody),
    'Utils.collapse must skip qp-reply-form and forms already inside .qp-body'
  );

  // replaceRightSidebar 必须复用 ensureReplyOverlayStyle，而不是再内联一套 qp-style
  assert(
    /ensureReplyOverlayStyle\(\);/.test(script),
    'replaceRightSidebar / open must invoke ensureReplyOverlayStyle()'
  );
  assert(
    !/const isDarkReaderActive\s*=\s*\(\)\s*=>/.test(script),
    'local isDarkReaderActive arrow in replaceRightSidebar should be removed (use hoisted helper)'
  );
  // Dark Reader 后处理会改边框色：sync 必须 !important 写回 border-color，而不是只改 preview 背景
  assert(
    /function getReplyOverlayThemeTokens/.test(script),
    'theme tokens helper must exist so border/outline colors stay consistent under Dark Reader'
  );
  assert(
    /setProperty\('border-color',\s*theme\.border,\s*'important'\)/.test(script),
    'syncQuotePopupTheme must force border-color with !important against Dark Reader overrides'
  );
  assert(
    /setProperty\('outline-color',\s*theme\.outline,\s*'important'\)/.test(script),
    'syncQuotePopupTheme must force outline-color with !important against Dark Reader overrides'
  );
  assert(
    /function ensureDarkReaderThemeObserver\(\)/.test(script),
    'early open must be able to install the Dark Reader theme observer without waiting for batch2'
  );
  assert(
    /attributeFilter:\s*\[[^\]]*data-darkreader-mode[^\]]*data-darkreader-scheme[^\]]*class[^\]]*\]/.test(script)
      || /attributeFilter:\s*\[[^\]]*data-darkreader-mode[^\]]*\]/.test(script),
    'Dark Reader observer should watch html darkreader attributes (not full subtree style storms)'
  );
  // 旧 darkreader observer 会连 style/childList/subtree 一起盯；现在只盯 html 的 darkreader 属性
  assert(
    !/__darkReaderObserver[\s\S]{0,240}attributeFilter:\s*\[[^\]]*style[^\]]*\][\s\S]{0,80}subtree:\s*true/.test(script),
    'old broad darkreader MutationObserver (style+subtree) should be removed'
  );
  assert(
    /__xdexDarkReaderThemeObserver[\s\S]{0,320}attributeFilter:\s*\[[^\]]*data-darkreader-mode[^\]]*data-darkreader-scheme[^\]]*class[^\]]*\]/.test(script)
      || /attributeFilter:\s*\['data-darkreader-mode', 'data-darkreader-scheme', 'class'\]/.test(script),
    'new darkreader observer must only watch data-darkreader-mode/scheme/class on documentElement'
  );
}

function testHeifPreviewTipDedupeAndReset() {
  // 回归：清空附件后重新附带同一个 HEIC，必须再次提示。
  const start = script.indexOf('function looksLikeHeifFile(file) {');
  const end = script.indexOf('// === 全局：把图片文件渲染到当前活跃预览框 ===', start);
  assert(start !== -1 && end !== -1, 'HEIC preview-tip block must exist');
  const block = script.slice(start, end);
  const toasts = [];
  const ctx = { console, Date, toast: (msg) => toasts.push(msg) };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInNewContext(
    block + '\nthis.maybe = maybeToastHeifPreviewUnsupported; this.reset = resetHeifPreviewTipState; this.notify = notifyHeifPreviewUnsupportedIfNeeded;',
    ctx,
    { filename: 'heic-tip.js' }
  );
  const mk = (name, size, lm) => ({ name, size, lastModified: lm, type: 'image/heic' });

  ctx.maybe(mk('a.heic', 1000, 111));
  assert(toasts.length === 1, 'first HEIC attachment must warn');
  ctx.maybe(mk('a.heic', 1000, 111));
  assert(toasts.length === 1, 'same-instance repeated calls (paste→change) must not re-warn');
  ctx.maybe(mk('a.heic', 1000, 111));
  assert(toasts.length === 1, 'same-key new instance within the short window must not re-warn');

  ctx.reset();
  ctx.maybe(mk('a.heic', 1000, 111));
  assert(toasts.length === 2, 'after clearing the attachment, re-attaching the same HEIC must warn again');

  ctx.maybe(mk('b.heic', 2000, 222));
  assert(toasts.length === 3, 'attaching a different HEIC must warn');
}

testPreviewFileChangeBindingSyncsExistingFile();
testPasteImageCanPopulateInputAndNotifyPreview();
testUpdatePreviewQueriesLivePreviewBox();
testOpenMovesStrayPreviewIntoOverlay();
testEarlyReplyOpenInjectsStyleBeforeShow();
console.log('paste image preview contract ok');
