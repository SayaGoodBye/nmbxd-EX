'use strict';

// ============================================================================
// Firefox 版：原 Chrome 版的 offscreen 文档在此被「后台事件页内直接执行」取代。
//
// 为什么可以这样替代：
//   · Chrome 的 MV3 后台是 Service Worker（无 DOM），才需要 offscreen 文档来做
//     「剪贴板写入 / blob 锚点下载 / 创建 blob URL」这类 DOM 相关工作；
//   · Firefox 的 MV3 后台是 **事件页（普通文档）**，本身就有 window/document，
//     因此同一份工作可以直接在后台页里做，不需要（Firefox 也不提供）offscreen API。
//   · 剪贴板：MDN 明确「在 Firefox 与 Chrome 中，clipboardWrite 权限允许从**所有扩展
//     上下文**与内容脚本写入剪贴板，无需瞬时用户激活」→ 后台页可直接写。
//
// 与 Chrome 版的差异（详见同目录 Firefox兼容性说明）：
//   1) 不再有 chrome.runtime.onMessage 监听：由 service-worker.js 直接调用 xdexRunDomJob()；
//   2) 返回值沿用旧协议（{ok:true,...} / {ok:false,error}），调用方无需改动；
//   3) 锚点下载失败（部分环境/策略下不允许非可见文档触发下载）时返回
//      error:'ANCHOR_DOWNLOAD_FAILED'，交由调用方回退到 downloads API 下载。
// ============================================================================

async function xdexRunDomJob(message) {
  if (!message || typeof message.type !== 'string') {
    return { ok: false, error: 'DOM job: missing message type' };
  }

  if (message.type === 'xdex:export-save') {
    return xdexDomJobExportSave(message);
  }

  if (message.type === 'xdex:export-blob-url') {
    return xdexDomJobExportBlobUrl(message);
  }

  if (message.type === 'xdex:copy-image'
    || message.type === 'xdex:copy-animated-image'
    || message.type === 'xdex:copy-text') {
    try {
      const result = await xdexHandleClipboardMessage(message);
      return Object.assign({ ok: true }, result || {});
    } catch (err) {
      return { ok: false, error: err && err.message ? err.message : String(err) };
    }
  }

  return { ok: false, error: `unknown DOM job: ${message.type}` };
}

// 导出文件落盘：用 <a download> 触发（不走 downloads API）。
// 原因：只要档案中任一扩展注册了 downloads.onDeterminingFilename，
// downloads API 的 filename 参数就会被忽略，blob: URL 会退化成 UUID 文件名。
// 锚点下载完全绕开该机制，文件名始终由 download 属性决定（同 Tampermonkey「Native」模式）。
function xdexDomJobExportSave(message) {
  try {
    const bytes = base64ToBytes(message.base64 || '');
    const blob = new Blob([bytes], { type: message.contentType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const rawName = String(message.filename || 'export.txt');
    // 含子目录的文件名交由后台的 downloads API（downloads.download 支持相对子目录，
    // 而锚点下载只能给扁平文件名）
    if (/[\\/]/.test(rawName)) {
      try { URL.revokeObjectURL(url); } catch (_e) {}
      return { ok: false, error: 'SUBDIR_NOT_SUPPORTED' };
    }
    if (!document || !document.body) {
      try { URL.revokeObjectURL(url); } catch (_e) {}
      return { ok: false, error: 'ANCHOR_DOWNLOAD_FAILED' };
    }
    const filename = rawName.replace(/[\\/]/g, '_');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try { a.remove(); URL.revokeObjectURL(url); } catch (_e) {}
    }, 60000);
    return { ok: true, filename };
  } catch (err) {
    return { ok: false, error: err && err.message ? err.message : String(err) };
  }
}

function xdexDomJobExportBlobUrl(message) {
  try {
    const bytes = base64ToBytes(message.base64 || '');
    const blob = new Blob([bytes], { type: message.contentType || 'application/octet-stream' });
    return { ok: true, url: URL.createObjectURL(blob) };
  } catch (err) {
    return { ok: false, error: err && err.message ? err.message : String(err) };
  }
}

async function xdexHandleClipboardMessage(message) {
  if (message.type === 'xdex:copy-text') {
    return copyTextFallback(String(message.text || ''));
  }

  if (message.type === 'xdex:copy-animated-image') {
    return writeAnimatedImageClipboard(message);
  }

  const bytes = base64ToBytes(message.base64 || '');
  const type = normalizeClipboardImageType(message.contentType || 'image/png');
  const blob = new Blob([bytes], { type });

  if (typeof ClipboardItem !== 'undefined' && supportsClipboardType(type)) {
    await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
    return { method: type };
  }

  if (type !== 'image/png') {
    const pngBlob = await convertImageToPng(blob);
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
    return { method: 'image/png' };
  }

  throw new Error(`Clipboard image type is not supported: ${type}`);
}

async function writeAnimatedImageClipboard(message) {
  const bytes = base64ToBytes(message.base64 || '');
  const url = String(message.url || '');
  if (message.format === 'gif') {
    return writeGifClipboard(new Blob([bytes], { type: 'image/gif' }), url);
  }
  if (message.format === 'apng') {
    return writeApngClipboard(new Blob([bytes], { type: 'image/png' }), url);
  }
  throw new Error(`Unsupported animated image format: ${message.format}`);
}

async function writeGifClipboard(blob, url) {
  // Firefox 的异步剪贴板只支持写 text/plain、text/html、image/png；
  // ClipboardItem.supports 在 Firefox 上不存在，故这里先尝试、失败即逐级回退。
  if (supportsClipboardType('image/gif')) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/gif': blob })]);
      return { method: 'image/gif' };
    } catch (e) {}
  }

  const html = `<img src="${escapeHtmlAttr(url)}">`;
  try {
    await navigator.clipboard.write([new ClipboardItem({
      'web image/gif': blob,
      'text/html': createClipboardBlob(html, 'text/html'),
      'text/plain': createClipboardBlob(url, 'text/plain')
    })]);
    return { method: 'web image/gif+html+plain' };
  } catch (e) {}

  try {
    await navigator.clipboard.write([new ClipboardItem({
      'text/html': createClipboardBlob(html, 'text/html'),
      'text/plain': createClipboardBlob(url, 'text/plain')
    })]);
    return { method: 'html+plain' };
  } catch (e) {}

  if (copyHtmlWithSelection(html, url)) return { method: 'html-selection' };
  return copyTextFallback(url);
}

async function writeApngClipboard(blob, url) {
  const html = `<img src="${escapeHtmlAttr(url)}">`;
  try {
    await navigator.clipboard.write([new ClipboardItem({
      'web image/png': blob,
      'text/html': createClipboardBlob(html, 'text/html'),
      'text/plain': createClipboardBlob(url, 'text/plain')
    })]);
    return { method: 'web image/png+html+plain' };
  } catch (e) {}

  try {
    await navigator.clipboard.write([new ClipboardItem({
      'text/html': createClipboardBlob(html, 'text/html'),
      'text/plain': createClipboardBlob(url, 'text/plain')
    })]);
    return { method: 'html+plain' };
  } catch (e) {}

  if (copyHtmlWithSelection(html, url)) return { method: 'html-selection' };
  return copyTextFallback(url);
}

function copyHtmlWithSelection(html, text) {
  const handler = (event) => {
    event.preventDefault();
    event.clipboardData.setData('text/html', html);
    event.clipboardData.setData('text/plain', text);
  };
  document.addEventListener('copy', handler, true);
  try {
    return document.execCommand('copy');
  } finally {
    document.removeEventListener('copy', handler, true);
  }
}

async function copyTextFallback(text) {
  try {
    await navigator.clipboard.writeText(text);
    return { method: 'url' };
  } catch (err) {
    if (!copyTextWithSelection(text)) throw err;
    return { method: 'url-selection' };
  }
}

function copyTextWithSelection(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } finally {
    textarea.remove();
  }
}

function createClipboardBlob(data, type) {
  return new Blob([data], { type });
}

function escapeHtmlAttr(value) {
  return String(value || '').replace(/[&<>"]/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  })[ch]);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function normalizeClipboardImageType(contentType) {
  return String(contentType || 'image/png').split(';')[0].trim().toLowerCase() || 'image/png';
}

function supportsClipboardType(type) {
  return typeof ClipboardItem !== 'undefined'
    && (typeof ClipboardItem.supports !== 'function' || ClipboardItem.supports(type));
}

async function convertImageToPng(blob) {
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext('2d');
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas.convertToBlob({ type: 'image/png' });
}
