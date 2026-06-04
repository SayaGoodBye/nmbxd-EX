'use strict';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || (message.type !== 'xdex:copy-image' && message.type !== 'xdex:copy-animated-image' && message.type !== 'xdex:copy-text')) {
    return false;
  }

  handleClipboardMessage(message)
    .then((result) => sendResponse(Object.assign({ ok: true }, result || {})))
    .catch((err) => sendResponse({ ok: false, error: err && err.message ? err.message : String(err) }));

  return true;
});

async function handleClipboardMessage(message) {
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
  return typeof ClipboardItem.supports !== 'function' || ClipboardItem.supports(type);
}

async function convertImageToPng(blob) {
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext('2d');
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas.convertToBlob({ type: 'image/png' });
}
