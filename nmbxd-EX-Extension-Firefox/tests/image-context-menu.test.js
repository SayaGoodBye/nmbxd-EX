const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const serviceWorker = fs.readFileSync(path.join(root, 'src', 'background', 'service-worker.js'), 'utf8');
// Firefox 版：offscreen 文档被后台事件页的 dom-jobs.js 取代（Firefox 无 offscreen API）
const domJobs = fs.readFileSync(path.join(root, 'src', 'background', 'dom-jobs.js'), 'utf8');
const clipboardWriter = fs.readFileSync(path.join(root, 'src', 'content', 'clipboard-writer.js'), 'utf8');
const userscript = fs.readFileSync(path.resolve(root, '..', 'nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hasActiveLine(source, text) {
  return source.split(/\r?\n/).some((line) => !line.trimStart().startsWith('//') && line.includes(text));
}

function testUserscriptSkipsCustomMenuInExtension() {
  assert(userscript.includes('function shouldUseExtensionNativeImageContextMenu(cfg)'), 'userscript must define Extension native image menu gate');
  assert(userscript.includes('isXDexPackagedRuntime('), 'gate must check packaged Extension runtime (chrome-* / firefox-*)');
  const gateIndex = userscript.indexOf('shouldUseExtensionNativeImageContextMenu(cfg)');
  const styleIndex = userscript.indexOf('ensureImageContextMenuStyle();', gateIndex);
  const menuIndex = userscript.indexOf('getImageContextMenu();', gateIndex);
  assert(gateIndex !== -1 && styleIndex !== -1 && menuIndex !== -1, 'enableImageContextMenu must keep existing userscript menu calls');
  assert(gateIndex < styleIndex && gateIndex < menuIndex, 'Extension gate must run before custom menu creation');
}

function testNativeAnimatedMenuContract() {
  assert(serviceWorker.includes("const IMAGE_MENU_COPY_ANIMATED = 'xdex-copy-gif-apng'"), 'service worker must define animated image menu id');
  assert(hasActiveLine(serviceWorker, "title: 'X岛-EX：复制GIF/APNG'"), 'service worker must register Copy GIF/APNG menu title');
  assert(!hasActiveLine(serviceWorker, "title: 'X岛-EX：复制串链接'"), 'Copy thread link menu must stay commented out');
  assert(!hasActiveLine(serviceWorker, "const IMAGE_MENU_COPY_THREAD_LINK = 'xdex-copy-thread-link'"), 'thread link menu id must stay commented out');
  assert(!serviceWorker.includes('parentId:'), 'image menu items must stay independent, not nested under a parent menu');
  assert(!serviceWorker.includes('X岛-EX：快速复制图片'), 'generic fast image copy menu must be removed');
  assert(serviceWorker.includes("type: 'xdex:copy-animated-image'"), 'animated menu must send animated copy message');
  assert(!hasActiveLine(serviceWorker, "type: 'xdex:copy-thread-link-from-image'"), 'thread link content message must stay commented out');
  assert(!hasActiveLine(serviceWorker, 'copyThreadLinkFromPage'), 'thread link handler must stay commented out');
  assert(serviceWorker.includes('skipped static image copy; use browser native Copy image'), 'static images must be skipped for browser native Copy image');
  assert(serviceWorker.includes("'xdex:image-menu-log'"), 'service worker must send page-visible diagnostics');
  assert(serviceWorker.includes('copy-succeeded'), 'service worker must log successful animated copy');
  assert(serviceWorker.includes('copy-failed'), 'service worker must log animated copy failures');
  assert(serviceWorker.includes('result.ok !== true'), 'service worker must reject failed offscreen responses');
}

function testAnimatedDetectionContract() {
  ['detectAnimatedImage', 'detectImageMimeType', 'isAnimatedGifBuffer', 'isAnimatedPngBuffer', 'readPngChunkLength', 'readPngChunkType'].forEach((name) => {
    assert(serviceWorker.includes(`function ${name}`), `service worker must define ${name}`);
  });
  assert(serviceWorker.includes("format: 'gif'"), 'GIF detection must return gif format');
  assert(serviceWorker.includes("format: 'apng'"), 'APNG detection must return apng format');
  assert(serviceWorker.includes("type === 'IDAT' || type === 'IEND'"), 'APNG detection must stop before image data when acTL is absent');
}

function testOffscreenAnimatedClipboardContract() {
  assert(domJobs.includes("message.type === 'xdex:copy-animated-image'"), 'dom-jobs must route animated copy messages');
  assert(domJobs.includes('function writeAnimatedImageClipboard(message)'), 'dom-jobs must route animated clipboard messages');
  assert(domJobs.includes('function writeGifClipboard(blob, url)'), 'dom-jobs must support GIF clipboard writes');
  assert(domJobs.includes('function writeApngClipboard(blob, url)'), 'dom-jobs must support APNG clipboard writes');
  assert(domJobs.includes("'web image/gif'"), 'GIF fallback must include web image/gif');
  assert(domJobs.includes("'web image/png'"), 'APNG fallback must include web image/png');
  assert(domJobs.includes("'text/html'"), 'animated fallback must include text/html');
  assert(domJobs.includes('function copyTextFallback(text)'), 'animated fallback must use focus-safe URL copy helper');
  assert(domJobs.includes('function copyHtmlWithSelection(html, text)'), 'animated fallback must try copy-event HTML before URL-only copy');
  assert(domJobs.includes("event.clipboardData.setData('text/html', html)"), 'HTML selection fallback must set text/html');
  assert(domJobs.includes('function copyTextWithSelection(text)'), 'URL fallback must support selection copy in the background page');
  assert(domJobs.includes("document.execCommand('copy')"), 'URL fallback must not rely only on focused clipboard.writeText');
  assert(domJobs.includes('method:'), 'copy response must include copy method');
}

function testFirefoxClipboardFallbackContract() {
  // 后台失败时转发到内容脚本；内容脚本侧独立实现写入
  assert(serviceWorker.includes('requestContentClipboardWrite'), 'service worker must fall back to the content script');
  assert(serviceWorker.includes("type: 'xdex:clipboard-write'"), 'fallback message type must be xdex:clipboard-write');
  assert(clipboardWriter.includes("message.type !== 'xdex:clipboard-write'"), 'content writer must only handle the fallback message');
  assert(clipboardWriter.includes('navigator.clipboard.writeText'), 'content writer must support text writes');
  assert(clipboardWriter.includes('function writeAnimated'), 'content writer must support animated images');
  assert(clipboardWriter.includes("document.execCommand('copy')"), 'content writer must keep selection fallbacks');
  // 后台不再依赖离屏文档
  assert(!serviceWorker.includes('chrome.offscreen'), 'service worker must not use chrome.offscreen (Firefox unsupported)');
  assert(!serviceWorker.includes('getContexts'), 'service worker must not use runtime.getContexts');
}

function testContentScriptReceivesImageMenuDiagnostics() {
  assert(serviceWorker.includes("chrome.tabs.sendMessage(tabId, payload"), 'service worker must send diagnostics to the clicked tab');
  assert(serviceWorker.includes("type: 'xdex:image-menu-log'"), 'diagnostic payload must use image menu log type');
  const gmCompat = fs.readFileSync(path.join(root, 'src', 'content', 'gm-compat.js'), 'utf8');
  assert(gmCompat.includes('function showImageMenuToast(stage, detail)'), 'content script must show image menu toast');
  assert(!hasActiveLine(gmCompat, "message.type !== 'xdex:copy-thread-link-from-image'"), 'content thread link message branch must stay commented out');
  assert(!hasActiveLine(gmCompat, 'function handleCopyThreadLinkFromImage(message)'), 'content thread link resolver must stay commented out');
  assert(!hasActiveLine(gmCompat, 'function resolveThreadLinkFromImageUrl(imageUrl)'), 'content thread link URL resolver must stay commented out');
  assert(gmCompat.includes("stage !== 'copy-succeeded'"), 'toast must react to copy result stages');
  assert(gmCompat.includes("stage !== 'skipped-static'"), 'static image skip must show toast to avoid false success feedback');
  assert(!hasActiveLine(gmCompat, "stage !== 'thread-link-succeeded'"), 'thread link success toast must stay commented out');
  assert(gmCompat.includes('静态图片请使用浏览器原生复制图像'), 'static image skip toast must tell users to use native copy image');
  assert(gmCompat.includes('top:10px;left:50%'), 'Extension toast must use the shared top-center position');
  assert(gmCompat.includes('GIF 已按富文本图片复制到剪贴板'), 'Extension GIF rich copy toast must match userscript wording');
  assert(gmCompat.includes('APNG 已按富文本图片复制到剪贴板'), 'Extension APNG rich copy toast must match userscript wording');
}

function testUserscriptAnimatedRichCopyToastWording() {
  // 当前文案：区分原样复制 / 富文本图片格式复制
  assert(userscript.includes("toast('GIF 已原样复制到剪贴板');"), 'userscript GIF binary copy toast must use explicit GIF wording');
  assert(userscript.includes("toast('GIF 已使用富文本图片格式复制到剪贴板');"), 'userscript GIF rich copy toast must use explicit GIF wording');
  assert(userscript.includes("toast('APNG 已使用富文本图片格式复制到剪贴板');"), 'userscript APNG rich copy toast must use explicit APNG wording');
  assert(!userscript.includes("toast('GIF 已复制到剪贴板');"), 'userscript GIF toast must not use generic wording');
  assert(!userscript.includes("toast('APNG 已复制到剪贴板');"), 'userscript APNG toast must not use generic wording');
  assert(!userscript.includes("toast('GIF 已按富文本图片复制到剪贴板');"), 'legacy GIF rich-copy wording must stay retired');
  assert(!userscript.includes("toast('APNG 已按富文本图片复制到剪贴板');"), 'legacy APNG rich-copy wording must stay retired');
}

testUserscriptSkipsCustomMenuInExtension();
testNativeAnimatedMenuContract();
testAnimatedDetectionContract();
testOffscreenAnimatedClipboardContract();
testFirefoxClipboardFallbackContract();
testContentScriptReceivesImageMenuDiagnostics();
testUserscriptAnimatedRichCopyToastWording();
console.log('image context menu contract ok');
