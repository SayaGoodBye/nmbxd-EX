'use strict';

const IMAGE_MENU_COPY_ANIMATED = 'xdex-copy-gif-apng';
// const IMAGE_MENU_COPY_THREAD_LINK = 'xdex-copy-thread-link';
const OFFSCREEN_DOCUMENT_PATH = 'offscreen/offscreen.html';

chrome.runtime.onInstalled.addListener((details) => {
  console.info('[X岛-EX Extension] installed', details.reason);
  createImageContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  createImageContextMenus();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return false;

  if (message.type === 'xdex:gm-request') {
    handleRequest(message.details, sender)
      .then(sendResponse)
      .catch((err) => {
        sendResponse({ ok: false, error: err && err.message ? err.message : String(err) });
      });

    return true;
  }

  if (message.type.startsWith('xdex:cookies:')) {
    handleCookieMessage(message, sender)
      .then(sendResponse)
      .catch((err) => {
        sendResponse({ ok: false, error: err && err.message ? err.message : String(err) });
      });

    return true;
  }

  return false;
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info || !info.srcUrl) return;

  if (info.menuItemId === IMAGE_MENU_COPY_ANIMATED) {
    copyGifOrApngToClipboard(info, tab);
  }
  // else if (info.menuItemId === IMAGE_MENU_COPY_THREAD_LINK) {
  //   copyThreadLinkFromPage(info, tab);
  // }
});

function createImageContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: IMAGE_MENU_COPY_ANIMATED,
      title: 'X岛-EX：复制GIF/APNG',
      contexts: ['image'],
      documentUrlPatterns: ['https://*.nmbxd1.com/*', 'https://*.nmbxd.com/*']
    });
    // chrome.contextMenus.create({
    //   id: IMAGE_MENU_COPY_THREAD_LINK,
    //   title: 'X岛-EX：复制串链接',
    //   contexts: ['image'],
    //   documentUrlPatterns: ['https://*.nmbxd1.com/*', 'https://*.nmbxd.com/*']
    // });
  });
}

async function copyGifOrApngToClipboard(info, tab) {
  const url = info && info.srcUrl;
  if (!url) return;
  const tabId = tab && tab.id;
  logImageMenuStage('clicked', { url }, tabId);
  try {
    const image = await fetchBinary(url);
    logImageMenuStage('fetched', { url, contentType: image.contentType, bytes: image.buffer ? image.buffer.byteLength : 0 }, tabId);
    const animated = detectAnimatedImage(image.buffer, image.contentType, url);
    if (!animated) {
      console.info('[X岛-EX Extension] skipped static image copy; use browser native Copy image', url);
      logImageMenuStage('skipped-static', { url, contentType: image.contentType }, tabId);
      return;
    }
    logImageMenuStage('animated-detected', { url, format: animated.format, contentType: animated.contentType }, tabId);
    const result = await sendToOffscreen({
      type: 'xdex:copy-animated-image',
      base64: image.base64,
      contentType: animated.contentType,
      format: animated.format,
      url
    });
    if (!result || result.ok !== true) {
      throw new Error(result && result.error ? result.error : 'Offscreen clipboard copy failed');
    }
    logImageMenuStage('copy-succeeded', { url, format: animated.format, method: result.method || '' }, tabId);
  } catch (err) {
    console.warn('[X岛-EX Extension] animated image copy failed', err);
    logImageMenuStage('copy-failed', { url, error: err && err.message ? err.message : String(err) }, tabId);
  }
}

// function copyThreadLinkFromPage(info, tab) {
//   const tabId = tab && tab.id;
//   logImageMenuStage('thread-link-clicked', { url: info && info.srcUrl }, tabId);
//   if (!tabId || !chrome.tabs || !chrome.tabs.sendMessage) {
//     logImageMenuStage('thread-link-failed', { error: 'No active tab for thread link copy' }, tabId);
//     return;
//   }
//   chrome.tabs.sendMessage(tabId, {
//     type: 'xdex:copy-thread-link-from-image',
//     imageUrl: info.srcUrl
//   }, (response) => {
//     if (chrome.runtime && chrome.runtime.lastError) {
//       logImageMenuStage('thread-link-failed', { error: chrome.runtime.lastError.message }, tabId);
//       return;
//     }
//     if (!response || response.ok !== true) {
//       logImageMenuStage('thread-link-failed', { error: response && response.error ? response.error : 'Thread link copy failed' }, tabId);
//       return;
//     }
//     sendToOffscreen({ type: 'xdex:copy-text', text: response.threadUrl || '' })
//       .then((result) => {
//         if (!result || result.ok !== true) throw new Error(result && result.error ? result.error : 'Thread link clipboard copy failed');
//         logImageMenuStage('thread-link-succeeded', { url: response.threadUrl || '', method: result.method || '' }, tabId);
//       })
//       .catch((err) => {
//         logImageMenuStage('thread-link-failed', { error: err && err.message ? err.message : String(err) }, tabId);
//       });
//   });
// }

function logImageMenuStage(stage, detail, tabId) {
  const payload = { type: 'xdex:image-menu-log', stage, detail: detail || {} };
  console.log('[X岛-EX Extension 图片菜单]', stage, detail || {});
  if (!tabId || !chrome.tabs || !chrome.tabs.sendMessage) return;
  chrome.tabs.sendMessage(tabId, payload, () => {
    const ignored = chrome.runtime && chrome.runtime.lastError;
    void ignored;
  });
}

async function handleRequest(details, sender) {
  const method = details && details.method ? details.method : 'GET';
  const responseType = details && details.responseType ? details.responseType : 'text';
  const headers = await buildRequestHeaders(details, sender);
  const response = await fetch(details.url, {
    method,
    headers,
    body: method.toUpperCase() === 'GET' ? undefined : details.data,
    credentials: 'include'
  });

  const responseHeaders = Array.from(response.headers.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join('\r\n');

  if (responseType === 'blob' || responseType === 'arraybuffer') {
    const buffer = await response.arrayBuffer();
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseHeaders,
      finalUrl: response.url,
      contentType: response.headers.get('content-type') || '',
      base64: arrayBufferToBase64(buffer)
    };
  }

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    responseHeaders,
    finalUrl: response.url,
    response: await response.text()
  };
}

async function buildRequestHeaders(details, sender) {
  const headers = sanitizeRequestHeaders(details && details.headers);
  if (!isApiNmbBestUrl(details && details.url)) return headers;
  const userhash = await getUserhashForSender(sender);
  if (userhash) await syncApiUserhashCookie(userhash);
  return headers;
}

function sanitizeRequestHeaders(headers) {
  const result = {};
  Object.entries(headers || {}).forEach(([key, value]) => {
    if (String(key).toLowerCase() === 'cookie') return;
    result[key] = value;
  });
  return result;
}

function isApiNmbBestUrl(url) {
  try {
    return new URL(url).hostname === 'api.nmb.best';
  } catch (_) {
    return false;
  }
}

async function getUserhashForSender(sender) {
  if (!chrome.cookies) return '';
  const pageUrl = getSenderPageUrl(sender);
  if (!isAllowedXdaoUrl(pageUrl)) return '';
  const cookie = await getCookie({ url: pageUrl, name: 'userhash' });
  return cookie && cookie.value ? cookie.value : '';
}

async function syncApiUserhashCookie(userhash) {
  await setCookie({ url: 'https://api.nmb.best/', name: 'userhash', value: userhash });
}

async function handleCookieMessage(message, sender) {
  if (!chrome.cookies) throw new Error('chrome.cookies is unavailable');

  const pageUrl = getSenderPageUrl(sender);
  if (!isAllowedXdaoUrl(pageUrl)) throw new Error('Cookie request is not from an allowed X岛 page');

  if (message.type === 'xdex:cookies:getUserhash') {
    const cookie = await getCookie({ url: pageUrl, name: 'userhash' });
    return { ok: true, value: cookie ? cookie.value : '' };
  }

  if (message.type === 'xdex:cookies:getAll') {
    const cookies = await getAllCookies({ url: pageUrl });
    return { ok: true, cookies };
  }

  if (message.type === 'xdex:cookies:set') {
    const details = normalizeCookieSetDetails(message.details, pageUrl);
    const cookie = await setCookie(details);
    return { ok: true, cookie };
  }

  if (message.type === 'xdex:cookies:remove') {
    const details = normalizeCookieRemoveDetails(message.details, pageUrl);
    const result = await removeCookie(details);
    return { ok: true, result };
  }

  throw new Error(`Unsupported cookie operation: ${message.type}`);
}

function getSenderPageUrl(sender) {
  return (sender && sender.tab && sender.tab.url) || (sender && sender.url) || '';
}

function isAllowedXdaoUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host === 'nmbxd1.com' || host.endsWith('.nmbxd1.com') || host === 'nmbxd.com' || host.endsWith('.nmbxd.com');
  } catch (_) {
    return false;
  }
}

function normalizeCookieSetDetails(details, pageUrl) {
  if (!details || !details.name) throw new Error('Cookie set requires name');
  const url = details.url || pageUrl;
  if (!isAllowedXdaoUrl(url)) throw new Error('Cookie set URL is not allowed');
  return Object.assign({}, details, { url });
}

function normalizeCookieRemoveDetails(details, pageUrl) {
  if (!details || !details.name) throw new Error('Cookie remove requires name');
  const url = details.url || pageUrl;
  if (!isAllowedXdaoUrl(url)) throw new Error('Cookie remove URL is not allowed');
  return { url, name: details.name, storeId: details.storeId };
}

function getCookie(details) {
  return new Promise((resolve, reject) => {
    chrome.cookies.get(details, (cookie) => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message));
      else resolve(cookie || null);
    });
  });
}

function getAllCookies(details) {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll(details, (cookies) => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message));
      else resolve(cookies || []);
    });
  });
}

function setCookie(details) {
  return new Promise((resolve, reject) => {
    chrome.cookies.set(details, (cookie) => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message));
      else resolve(cookie || null);
    });
  });
}

function removeCookie(details) {
  return new Promise((resolve, reject) => {
    chrome.cookies.remove(details, (result) => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message));
      else resolve(result || null);
    });
  });
}

async function fetchBinary(url) {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
  const buffer = await response.arrayBuffer();
  return {
    buffer,
    base64: arrayBufferToBase64(buffer),
    contentType: response.headers.get('content-type') || ''
  };
}

function detectAnimatedImage(buffer, contentType, url) {
  const type = detectImageMimeType(buffer, contentType, url);
  if (type === 'image/gif' && isAnimatedGifBuffer(new Uint8Array(buffer))) {
    return { format: 'gif', contentType: 'image/gif' };
  }
  if (type === 'image/png' && isAnimatedPngBuffer(new Uint8Array(buffer))) {
    return { format: 'apng', contentType: 'image/png' };
  }
  return null;
}

function detectImageMimeType(buffer, contentType, url) {
  const declared = String(contentType || '').split(';')[0].trim().toLowerCase();
  const bytes = new Uint8Array(buffer || new ArrayBuffer(0));
  if (isGifBuffer(bytes)) return 'image/gif';
  if (isPngBuffer(bytes)) return 'image/png';
  if (declared) return declared;
  return guessImageType(url);
}

function isGifBuffer(bytes) {
  if (!bytes || bytes.length < 6) return false;
  const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5]);
  return header === 'GIF87a' || header === 'GIF89a';
}

function isAnimatedGifBuffer(bytes) {
  if (!isGifBuffer(bytes)) return false;
  let frames = 0;
  for (let i = 13; i < bytes.length; i += 1) {
    if (bytes[i] === 0x2c) {
      frames += 1;
      if (frames > 1) return true;
    }
  }
  return false;
}

function isPngBuffer(bytes) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!bytes || bytes.length < signature.length) return false;
  return signature.every((value, index) => bytes[index] === value);
}

function isAnimatedPngBuffer(bytes) {
  if (!isPngBuffer(bytes)) return false;
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = readPngChunkLength(bytes, offset);
    const type = readPngChunkType(bytes, offset);
    if (type === 'acTL') {
      if (offset + 16 > bytes.length) return false;
      const frames = ((bytes[offset + 8] << 24) | (bytes[offset + 9] << 16) | (bytes[offset + 10] << 8) | bytes[offset + 11]) >>> 0;
      return frames > 1;
    }
    if (type === 'IDAT' || type === 'IEND') return false;
    offset += 12 + length;
  }
  return false;
}

function readPngChunkLength(bytes, offset) {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function readPngChunkType(bytes, offset) {
  return String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
}

async function sendToOffscreen(message) {
  await ensureOffscreenDocument();
  return chrome.runtime.sendMessage(message);
}

async function ensureOffscreenDocument() {
  if (await hasOffscreenDocument()) return;
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: ['CLIPBOARD'],
    justification: 'Write selected X岛 image data to the clipboard from the extension context.'
  });
}

async function hasOffscreenDocument() {
  if (!chrome.runtime.getContexts) return false;
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)]
  });
  return contexts.length > 0;
}

function guessImageType(url) {
  const cleanUrl = String(url || '').split(/[?#]/)[0].toLowerCase();
  if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) return 'image/jpeg';
  if (cleanUrl.endsWith('.gif')) return 'image/gif';
  if (cleanUrl.endsWith('.webp')) return 'image/webp';
  if (cleanUrl.endsWith('.svg')) return 'image/svg+xml';
  return 'image/png';
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
