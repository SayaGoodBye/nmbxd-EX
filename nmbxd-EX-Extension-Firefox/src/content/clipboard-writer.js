(function () {
  'use strict';

  // ==========================================================================
  // Firefox 版：剪贴板写入的「内容脚本回退通道」。
  //
  // 背景：Firefox 的 MV3 后台是事件页（普通文档），配合 manifest 的 clipboardWrite
  // 权限，通常可以直接调用 navigator.clipboard.write 完成写入（MDN：clipboardWrite
  // 允许从所有扩展上下文与内容脚本写入剪贴板，且不要求瞬时用户激活）。
  // 但后台页并非「获得焦点的窗口」，个别环境/策略下仍可能被拒绝；此时
  // service-worker.js 会把同一任务转发到本内容脚本（页面上下文、通常处于焦点）执行。
  //
  // 消息：{ type: 'xdex:clipboard-write', job: <与后台 dom-jobs.js 完全相同的载荷> }
  //   job.type ∈ { xdex:copy-image, xdex:copy-animated-image, xdex:copy-text }
  // 回执：{ ok: true, method } / { ok: false, error }
  // ==========================================================================

  function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function normalizeImageType(contentType) {
    return String(contentType || 'image/png').split(';')[0].trim().toLowerCase() || 'image/png';
  }

  function supportsType(type) {
    return typeof ClipboardItem !== 'undefined'
      && (typeof ClipboardItem.supports !== 'function' || ClipboardItem.supports(type));
  }

  function blobOf(data, type) {
    return new Blob([data], { type });
  }

  function escapeAttr(value) {
    return String(value || '').replace(/[&<>"]/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    })[ch]);
  }

  // 用一次临时选区 + execCommand('copy') 兜底（Firefox 下需要 clipboardWrite 权限，
  // 已在 manifest 中声明；具备该权限时可在短生命周期事件之外调用）
  function copyHtmlWithSelection(html, text) {
    const handler = (event) => {
      event.preventDefault();
      event.clipboardData.setData('text/html', html);
      event.clipboardData.setData('text/plain', text);
    };
    document.addEventListener('copy', handler, true);
    try {
      return document.execCommand('copy');
    } catch (err) {
      return false;
    } finally {
      document.removeEventListener('copy', handler, true);
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
    } catch (err) {
      return false;
    } finally {
      textarea.remove();
    }
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return { method: 'url' };
    } catch (err) {
      if (!copyTextWithSelection(text)) throw err;
      return { method: 'url-selection' };
    }
  }

  async function convertToPng(blob) {
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    context.drawImage(bitmap, 0, 0);
    if (typeof bitmap.close === 'function') bitmap.close();
    const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!pngBlob) throw new Error('PNG 转换失败');
    return pngBlob;
  }

  async function writeImage(job) {
    const bytes = base64ToBytes(job.base64 || '');
    const type = normalizeImageType(job.contentType || 'image/png');
    const blob = blobOf(bytes, type);

    if (typeof ClipboardItem !== 'undefined' && supportsType(type)) {
      await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
      return { method: type };
    }
    if (type !== 'image/png') {
      const pngBlob = await convertToPng(blob);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
      return { method: 'image/png' };
    }
    throw new Error(`Clipboard image type is not supported: ${type}`);
  }

  async function writeAnimated(job) {
    const bytes = base64ToBytes(job.base64 || '');
    const url = String(job.url || '');
    const html = `<img src="${escapeAttr(url)}">`;
    const isGif = job.format === 'gif';
    const blob = blobOf(bytes, isGif ? 'image/gif' : 'image/png');

    if (isGif && supportsType('image/gif')) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/gif': blob })]);
        return { method: 'image/gif' };
      } catch (err) { /* 继续回退 */ }
    }
    const webType = isGif ? 'web image/gif' : 'web image/png';
    try {
      await navigator.clipboard.write([new ClipboardItem({
        [webType]: blob,
        'text/html': blobOf(html, 'text/html'),
        'text/plain': blobOf(url, 'text/plain')
      })]);
      return { method: `${webType}+html+plain` };
    } catch (err) { /* 继续回退 */ }
    try {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': blobOf(html, 'text/html'),
        'text/plain': blobOf(url, 'text/plain')
      })]);
      return { method: 'html+plain' };
    } catch (err) { /* 继续回退 */ }
    if (copyHtmlWithSelection(html, url)) return { method: 'html-selection' };
    return copyText(url);
  }

  async function handleJob(job) {
    if (!job || typeof job.type !== 'string') throw new Error('缺少 job.type');
    if (job.type === 'xdex:copy-text') return copyText(String(job.text || ''));
    if (job.type === 'xdex:copy-animated-image') return writeAnimated(job);
    if (job.type === 'xdex:copy-image') return writeImage(job);
    throw new Error(`不支持的任务类型：${job.type}`);
  }

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message || message.type !== 'xdex:clipboard-write' || !message.job) return false;
      handleJob(message.job)
        .then((result) => sendResponse(Object.assign({ ok: true }, result || {})))
        .catch((err) => sendResponse({ ok: false, error: err && err.message ? err.message : String(err) }));
      return true;
    });
  }
})();
