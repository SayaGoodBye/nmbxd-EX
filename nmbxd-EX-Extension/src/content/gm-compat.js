(function () {
  'use strict';

  const root = globalThis;
  const storagePrefix = 'xdex-Extension:';
  const localStoragePrefix = 'xdex-Extension-local:';
  const syncStoragePrefix = 'xdex-Extension-sync:';
  const syncTtlMs = 30 * 60 * 1000;
  const syncKeys = new Set([
    'myScriptSettings',
    'cookies',
    'now-cookie',
    'xdex-last-used-cookie',
    'xdex-cookie-userhash-digests',
    'loginPromptSuppressAuto',
    'xdex_update_check_state',
    'xdex_extension_update_check_state'
  ]);
  const instanceId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const listeners = new Map();
  const memoryStore = new Map();
  const syncVersions = new Map();
  let syncSeq = 0;

  // BEGIN GENERATED USERSCRIPT META
  const scriptMetaStr = [
    "// ==UserScript==",
    "// @name         X岛-EX",
    "// @namespace    https://github.com/SayaGoodBye/nmbxd-EX",
    "// @version      3.3.0",
    "// @description  X岛-EX 网页端增强，移动端般的浏览体验：快捷切换饼干/ 添加页首页码 / 关闭图片水印 / 预览真实饼干 / 隐藏无标题-无名氏-版规 / 显示外部图床 / 自动刷新饼干 toast提示 / 无缝翻页-自动翻页 / 默认原图+控件 / 新标签打开串 / 优化引用弹窗 / 拓展引用格式 / 当页回复编号 / 扩展坞增强 / 拦截回复中间页 / 颜文字拓展 / 高亮PO主 / 发串UI调整 / 『分组标记饼干』 / 『屏蔽饼干』 / 『只看饼干』 / 『屏蔽关键词』- 隐藏-折叠 / 增强X岛匿名版 / 板块页快速回复 / 展开板块页长串 / 野生搜索酱 / unvcode-零宽空格模式 / 侧边栏收起 / 图片隐藏模式 / 图片自动压缩-非法图像格式（无GCT）GIF重编码 / 链接自动识别 / 使用数据-设置项-导入导出-剪贴板文件 / 常用串 / 浏览历史 / 发言历史 / 移动端订阅 。",
    "// @author       XY",
    "// @match        https://*.nmbxd1.com/*",
    "// @match        https://*.nmbxd.com/*",
    "// @match        https://nmb-search.166666666.xyz/*",
    "// @grant        GM_getValue",
    "// @grant        GM_setValue",
    "// @grant        GM_addValueChangeListener",
    "// @grant        GM_xmlhttpRequest",
    "// @grant        GM_deleteValue",
    "// @grant        GM_listValues",
    "// @grant        GM_addStyle",
    "// @grant        unsafeWindow",
    "// @connect      nmbxd1.com",
    "// @connect      www.nmbxd1.com",
    "// @connect      nmbxd.com",
    "// @connect      www.nmbxd.com",
    "// @connect      nmb-search.166666666.xyz",
    "// @connect      image.nmb.best",
    "// @connect      api.nmb.best",
    "// @connect      raw.githubusercontent.com",
    "// @connect      cdn.jsdelivr.net",
    "// @connect      fastly.jsdelivr.net",
    "// @connect      update.greasyfork.org",
    "// @connect      scriptcat.org",
    "// @connect      code.jquery.com",
    "// @connect      unpkg.com",
    "// @require      https://code.jquery.com/jquery-3.6.0.min.js",
    "// @require      https://cdn.jsdelivr.net/npm/apng-js@1.1.5/lib/index.js",
    "// @require      https://unpkg.com/upng-js@2.1.0/UPNG.js",
    "// @icon         https://image.nmb.best/image/2026-06-03/6a1fcea41fad3.png",
    "// @icon64       https://image.nmb.best/image/2026-06-03/6a1fced8e0e64.png",
    "// @license      WTFPL",
    "// @changelog    新增\\n1.新增使用数据的导入导出，可选项目：设置/浏览历史/发言历史/草稿/颜文字统计\\n",
    "// @note         特别感谢：icon由9HrD12x设计并绘制 >>No.68765505",
    "// @note         致谢：切饼代码移植自[XD-Enhance](https://greasyfork.org/zh-CN/scripts/438164-xd-enhance)",
    "// @note         致谢：外部图床代码二改自[显示x岛图片链接指向的图片](https://greasyfork.org/zh-CN/scripts/546024-%E6%98%BE%E7%A4%BAx%E5%B2%9B%E5%9B%BE%E7%89%87%E9%93%BE%E6%8E%A5%E6%8C%87%E5%90%91%E7%9A%84%E5%9B%BE%E7%89%87)",
    "// @note         致谢：完整移植[增强x岛匿名版](https://greasyfork.org/zh-CN/scripts/513156-%E5%A2%9E%E5%BC%BAx%E5%B2%9B%E5%8C%BF%E5%90%8D%E7%89%88)",
    "// @note         致谢：部分功能移植自[X岛-揭示板的增强型体验](https://greasyfork.org/zh-CN/scripts/497875-x%E5%B2%9B-%E6%8F%AD%E7%A4%BA%E6%9D%BF%E7%9A%84%E5%A2%9E%E5%BC%BA%E5%9E%8B%E4%BD%93%E9%AA%8C#%E8%BF%9E%E6%8E%A5%E7%9B%B4%E6%8E%A5%E8%B7%B3%E8%BD%AC)",
    "// @note         致谢：来自4sYbzEX的搜索服务[野生搜索酱](https://www.nmbxd.com/t/64792841)",
    "// @note         致谢：来自acVMxuv的[侧边栏优化](https://greasyfork.org/zh-CN/scripts/553143-x%E5%B2%9B%E4%BC%98%E5%8C%96%E5%B2%9B-%E4%BE%A7%E8%BE%B9%E6%A0%8F%E4%BC%98%E5%8C%96%E7%89%88)",
    "// @downloadURL  https://update.greasyfork.org/scripts/531005/X%E5%B2%9B-EX.user.js",
    "// @updateURL    https://update.greasyfork.org/scripts/531005/X%E5%B2%9B-EX.meta.js",
    "// @run-at       document-start",
    "// ==/UserScript=="
  ].join('\n');
  const scriptMeta = { name: "X岛-EX", version: "3.3.0" };
  // END GENERATED USERSCRIPT META

  function normalizeKey(key) {
    return storagePrefix + String(key);
  }

  function cloneValue(value) {
    if (value == null) return value;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      return value;
    }
  }

  function valuesEqual(left, right) {
    try {
      return JSON.stringify(left) === JSON.stringify(right);
    } catch (_) {
      return left === right;
    }
  }

  function isSyncKey(key) {
    return syncKeys.has(String(key));
  }

  function compareSyncVersion(left, right) {
    const leftTs = Number(left && left.ts) || 0;
    const rightTs = Number(right && right.ts) || 0;
    if (leftTs !== rightTs) return leftTs - rightTs;
    const leftSeq = Number(left && left.seq) || 0;
    const rightSeq = Number(right && right.seq) || 0;
    if (leftSeq !== rightSeq) return leftSeq - rightSeq;
    return String(left && left.instanceId || '').localeCompare(String(right && right.instanceId || ''));
  }

  function rememberSyncVersion(key, version) {
    if (!isSyncKey(key) || !version) return;
    const normalizedKey = String(key);
    const current = syncVersions.get(normalizedKey);
    if (!current || compareSyncVersion(current, version) <= 0) {
      syncVersions.set(normalizedKey, {
        ts: Number(version.ts) || Date.now(),
        seq: Number(version.seq) || 0,
        instanceId: String(version.instanceId || '')
      });
    }
  }

  function createSyncEnvelope(key, value, deleted) {
    return {
      protocol: 1,
      key: String(key),
      value: cloneValue(value),
      deleted: !!deleted,
      ts: Date.now(),
      seq: ++syncSeq,
      instanceId,
      version: scriptMeta.version
    };
  }

  function publishLocalStorageSync(key, value, deleted) {
    if (!isSyncKey(key)) return;
    try {
      const envelope = createSyncEnvelope(key, value, deleted);
      rememberSyncVersion(key, envelope);
      localStorage.setItem(syncStoragePrefix + String(key), JSON.stringify(envelope));
    } catch (err) {
      console.warn('[X岛-EX Extension] localStorage sync publish failed', err);
    }
  }

  function applyLocalStorageSyncEnvelope(envelope) {
    if (!envelope || envelope.protocol !== 1 || !isSyncKey(envelope.key)) return false;
    if (String(envelope.instanceId || '') === instanceId) return false;
    if (Date.now() - (Number(envelope.ts) || 0) > syncTtlMs) return false;

    const normalizedKey = String(envelope.key);
    const current = syncVersions.get(normalizedKey);
    if (current && compareSyncVersion(current, envelope) >= 0) return false;

    const oldValue = memoryStore.get(normalizedKey);
    if (envelope.deleted) {
      memoryStore.delete(normalizedKey);
      removeLocalStorageMirror(normalizedKey, { publish: false });
      rememberSyncVersion(normalizedKey, envelope);
      if (typeof oldValue !== 'undefined') emitValueChange(normalizedKey, oldValue, undefined, true);
      return true;
    }

    const nextValue = cloneValue(envelope.value);
    memoryStore.set(normalizedKey, nextValue);
    writeLocalStorageMirror(normalizedKey, nextValue, { publish: false });
    rememberSyncVersion(normalizedKey, envelope);
    if (!valuesEqual(oldValue, nextValue)) emitValueChange(normalizedKey, oldValue, nextValue, true);
    return true;
  }

  function applyLocalStorageMirrorChange(key, rawValue) {
    if (!key || !key.startsWith(localStoragePrefix)) return false;
    const rawKey = key.slice(localStoragePrefix.length);
    if (!isSyncKey(rawKey)) return false;
    const oldValue = memoryStore.get(rawKey);
    if (rawValue == null) {
      memoryStore.delete(rawKey);
      if (typeof oldValue !== 'undefined') emitValueChange(rawKey, oldValue, undefined, true);
      return true;
    }
    try {
      const nextValue = JSON.parse(rawValue);
      memoryStore.set(rawKey, nextValue);
      if (!valuesEqual(oldValue, nextValue)) emitValueChange(rawKey, oldValue, nextValue, true);
      return true;
    } catch (err) {
      console.warn('[X岛-EX Extension] localStorage mirror sync parse failed', err);
      return false;
    }
  }

  function emitValueChange(key, oldValue, newValue, remote) {
    const callbacks = listeners.get(String(key));
    if (!callbacks) return;
    callbacks.forEach((callback) => {
      try {
        callback(String(key), cloneValue(oldValue), cloneValue(newValue), !!remote);
      } catch (err) {
        console.warn('[X岛-EX Extension] GM_addValueChangeListener callback failed', err);
      }
    });
  }

  let extensionContextInvalidated = false;
  let extensionContextReminderShown = false;

  function isExtensionContextError(error) {
    const message = String(error && (error.message || error) || '');
    return /Extension context invalidated|context invalidated|Receiving end does not exist/i.test(message);
  }

  function markExtensionContextInvalidated(error) {
    if (!isExtensionContextError(error) && root.chrome && chrome.runtime && chrome.runtime.id) return false;
    extensionContextInvalidated = true;
    if (root.__xdexRuntime) root.__xdexRuntime.extensionContextInvalidated = true;
    if (!extensionContextReminderShown) {
      extensionContextReminderShown = true;
      console.warn('[X岛-EX Extension] extension context invalidated; refresh this page to reconnect', error);
      showExtensionToast('扩展已更新，刷新页面可恢复完整同步');
    }
    return true;
  }

  function isRuntimeAvailable() {
    return !!(root.chrome && chrome.runtime && chrome.runtime.id && chrome.runtime.sendMessage && !extensionContextInvalidated);
  }

  function getRuntimeLastError() {
    return root.chrome && chrome.runtime ? chrome.runtime.lastError : null;
  }

  function canUsePageFetchFallback(url) {
    try {
      const target = new URL(String(url || ''), location.href);
      return target.origin === location.origin;
    } catch (_) {
      return false;
    }
  }

  function createHeadersObject(headers) {
    if (!headers) return {};
    if (typeof headers === 'string') {
      return headers.split(/\r?\n/).reduce((acc, line) => {
        const index = line.indexOf(':');
        if (index > 0) acc[line.slice(0, index).trim()] = line.slice(index + 1).trim();
        return acc;
      }, {});
    }
    return headers;
  }

  function formatResponseHeaders(headers) {
    if (!headers || typeof headers.forEach !== 'function') return '';
    const lines = [];
    headers.forEach((value, key) => lines.push(`${key}: ${value}`));
    return lines.join('\r\n');
  }

  function runPageFetchRequest(details) {
    if (typeof fetch !== 'function' || !canUsePageFetchFallback(details.url)) return false;
    fetch(details.url, {
      method: details.method || 'GET',
      headers: createHeadersObject(details.headers),
      body: details.data || null,
      credentials: 'include'
    }).then(async (response) => {
      let responseBody;
      if (details.responseType === 'blob') {
        responseBody = await response.blob();
      } else if (details.responseType === 'arraybuffer') {
        responseBody = await response.arrayBuffer();
      } else if (details.responseType === 'json') {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }
      if (typeof details.onload === 'function') {
        details.onload({
          status: response.status,
          statusText: response.statusText,
          responseHeaders: formatResponseHeaders(response.headers),
          responseText: typeof responseBody === 'string' ? responseBody : '',
          response: responseBody,
          finalUrl: response.url || details.url
        });
      }
    }).catch((err) => {
      if (typeof details.onerror === 'function') details.onerror(err);
    });
    return true;
  }

  function syncFromChromeStorage() {
    if (!root.chrome || !chrome.storage || !chrome.storage.local) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(null, (items) => {
          const lastError = getRuntimeLastError();
          if (lastError) {
            markExtensionContextInvalidated(lastError);
            console.warn('[X岛-EX Extension] storage preload failed', lastError.message);
            resolve(false);
            return;
          }

          Object.entries(items || {}).forEach(([key, value]) => {
            if (!key.startsWith(storagePrefix)) return;
            const rawKey = key.slice(storagePrefix.length);
            const oldValue = memoryStore.get(rawKey);
            const nextValue = cloneValue(value);
            memoryStore.set(rawKey, nextValue);
                        if (!valuesEqual(oldValue, nextValue)) {
              emitValueChange(rawKey, oldValue, nextValue, true);
            }
          });

          resolve(true);
        });
      } catch (err) {
        markExtensionContextInvalidated(err);
        console.warn('[X岛-EX Extension] storage preload failed', err);
        resolve(false);
      }
    });
  }

  function syncFromLocalStorage() {
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(localStoragePrefix)) continue;
        const rawKey = key.slice(localStoragePrefix.length);
        memoryStore.set(rawKey, JSON.parse(localStorage.getItem(key)));
      }
    } catch (err) {
      console.warn('[X岛-EX Extension] localStorage preload failed', err);
    }
  }

  function writeLocalStorageMirror(key, value, options) {
    try {
      localStorage.setItem(localStoragePrefix + String(key), JSON.stringify(value));
      if (!options || options.publish !== false) publishLocalStorageSync(key, value, false);
    } catch (err) {
      console.warn('[X岛-EX Extension] localStorage mirror write failed', err);
    }
  }

  function removeLocalStorageMirror(key, options) {
    try {
      localStorage.removeItem(localStoragePrefix + String(key));
      if (!options || options.publish !== false) publishLocalStorageSync(key, undefined, true);
    } catch (err) {
      console.warn('[X岛-EX Extension] localStorage mirror remove failed', err);
    }
  }

  root.GM_info = root.GM_info || {
    script: {
      name: scriptMeta.name,
      version: scriptMeta.version
    },
    scriptMetaStr
  };

  root.__xdexRuntime = root.__xdexRuntime || {
    kind: 'extension',
    storage: 'chrome.storage.local',
    gmCompat: true,
    cookieBridge: true,
    pageBridge: true,
    packagedGifsicle: true
  };

  root.unsafeWindow = root.unsafeWindow || window;

  root.GM_getValue = function GM_getValue(key, defaultValue) {
    return memoryStore.has(String(key)) ? cloneValue(memoryStore.get(String(key))) : defaultValue;
  };

  root.GM_setValue = function GM_setValue(key, value) {
    const normalizedKey = String(key);
    const oldValue = memoryStore.get(normalizedKey);
    const nextValue = cloneValue(value);
    memoryStore.set(normalizedKey, nextValue);
    writeLocalStorageMirror(normalizedKey, nextValue);

    if (root.chrome && chrome.storage && chrome.storage.local) {
      if (!root.chrome.runtime || !chrome.runtime.id || extensionContextInvalidated) {
        markExtensionContextInvalidated(new Error('Extension context invalidated'));
      } else {
        try {
          chrome.storage.local.set({ [normalizeKey(normalizedKey)]: nextValue }, () => {
            const lastError = getRuntimeLastError();
            if (lastError) {
              markExtensionContextInvalidated(lastError);
              console.warn('[X岛-EX Extension] GM_setValue storage write failed', lastError.message);
            }
          });
        } catch (err) {
          markExtensionContextInvalidated(err);
          console.warn('[X岛-EX Extension] GM_setValue storage write failed', err);
        }
      }
    }

    emitValueChange(normalizedKey, oldValue, nextValue, false);
  };

  root.GM_deleteValue = function GM_deleteValue(key) {
    const normalizedKey = String(key);
    const oldValue = memoryStore.get(normalizedKey);
    memoryStore.delete(normalizedKey);
    removeLocalStorageMirror(normalizedKey);

    if (root.chrome && chrome.storage && chrome.storage.local) {
      if (!root.chrome.runtime || !chrome.runtime.id || extensionContextInvalidated) {
        markExtensionContextInvalidated(new Error('Extension context invalidated'));
      } else {
        try {
          chrome.storage.local.remove(normalizeKey(normalizedKey), () => {
            const lastError = getRuntimeLastError();
            if (lastError) {
              markExtensionContextInvalidated(lastError);
              console.warn('[X岛-EX Extension] GM_deleteValue storage remove failed', lastError.message);
            }
          });
        } catch (err) {
          markExtensionContextInvalidated(err);
          console.warn('[X岛-EX Extension] GM_deleteValue storage remove failed', err);
        }
      }
    }

    emitValueChange(normalizedKey, oldValue, undefined, false);
  };

  root.GM_listValues = function GM_listValues() {
    return Array.from(memoryStore.keys());
  };

  root.GM_addValueChangeListener = function GM_addValueChangeListener(key, callback) {
    const normalizedKey = String(key);
    if (!listeners.has(normalizedKey)) listeners.set(normalizedKey, new Map());
    const id = Math.random().toString(36).slice(2);
    listeners.get(normalizedKey).set(id, callback);
    return id;
  };

  root.GM_removeValueChangeListener = function GM_removeValueChangeListener(id) {
    listeners.forEach((callbacks) => callbacks.delete(id));
  };

  root.GM_addStyle = function GM_addStyle(css) {
    const style = document.createElement('style');
    style.textContent = String(css || '');
    (document.head || document.documentElement).appendChild(style);
    return style;
  };

  if (root.chrome && chrome.runtime && chrome.runtime.onMessage) {
    try {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (!message || message.type !== 'xdex:image-menu-log') return false;
      // if (!message || (message.type !== 'xdex:image-menu-log' && message.type !== 'xdex:copy-thread-link-from-image')) return false;
      // if (message.type === 'xdex:copy-thread-link-from-image') {
      //   handleCopyThreadLinkFromImage(message)
      //     .then((result) => sendResponse(result))
      //     .catch((err) => sendResponse({ ok: false, error: err && err.message ? err.message : String(err) }));
      //   return true;
      // }
        console.log('[X岛-EX Extension 图片菜单]', message.stage, message.detail || {});
        showImageMenuToast(message.stage, message.detail || {});
        return false;
      });
    } catch (err) {
      markExtensionContextInvalidated(err);
    }
  }

  // async function handleCopyThreadLinkFromImage(message) {
  //   const threadUrl = resolveThreadLinkFromImageUrl(message && message.imageUrl);
  //   if (!threadUrl) throw new Error('未找到图片所属串链接');
  //   return { ok: true, threadUrl };
  // }

  // function resolveThreadLinkFromImageUrl(imageUrl) {
  //   const anchor = findImageAnchorByUrl(imageUrl);
  //   if (!anchor) return location.href;
  //   const root = anchor.closest('.h-threads-img-a, .h-threads-img-box, .h-threads-item-reply, .h-threads-item-reply-main, .h-threads-item, .h-threads-item-index') || anchor;
  //   const index = root.closest && root.closest('.h-threads-item-index[data-threads-id]');
  //   const indexTid = index && index.getAttribute('data-threads-id');
  //   if (isThreadId(indexTid)) return `${location.origin}/t/${indexTid.slice(0, 8)}`;
  //   const pathMatch = location.pathname.match(/\/t\/(\d{8,})/);
  //   if (pathMatch) return `${location.origin}/t/${pathMatch[1].slice(0, 8)}`;
  //   const infoLink = root.closest('.h-threads-item-index, .h-threads-item, .h-threads-item-reply, .h-threads-item-reply-main')?.querySelector('.h-threads-info-id[href*="/t/"]');
  //   const hrefMatch = String(infoLink && infoLink.getAttribute('href') || '').match(/\/t\/(\d{8,})/);
  //   return hrefMatch ? `${location.origin}/t/${hrefMatch[1].slice(0, 8)}` : location.href;
  // }

  // function findImageAnchorByUrl(imageUrl) {
  //   const target = normalizeImageLookupUrl(imageUrl);
  //   return Array.from(document.querySelectorAll('.h-threads-img-a')).find((anchor) => {
  //     const img = anchor.querySelector('.h-threads-img');
  //     return normalizeImageLookupUrl(anchor.href) === target
  //       || normalizeImageLookupUrl(anchor.getAttribute('href')) === target
  //       || normalizeImageLookupUrl(img && (img.currentSrc || img.src)) === target
  //       || normalizeImageLookupUrl(img && img.getAttribute('src')) === target;
  //   }) || null;
  // }

  // function normalizeImageLookupUrl(url) {
  //   try {
  //     return new URL(String(url || '').replace('/thumb/', '/image/'), location.href).href;
  //   } catch (_) {
  //     return '';
  //   }
  // }

  // function isThreadId(value) {
  //   return /^\d{8,}$/.test(String(value || '').trim());
  // }

  function showImageMenuToast(stage, detail) {
    if (stage !== 'copy-succeeded' && stage !== 'copy-failed' && stage !== 'skipped-static') return;
    // if (stage !== 'copy-succeeded' && stage !== 'copy-failed' && stage !== 'skipped-static' && stage !== 'thread-link-succeeded' && stage !== 'thread-link-failed') return;
    const text = stage === 'copy-succeeded'
      ? getImageMenuSuccessToast(detail)
      : (stage === 'skipped-static' ? '静态图片请使用浏览器原生复制图像' : `复制失败：${detail.error || '未知错误'}`);
    // const text = stage === 'thread-link-succeeded'
    //   ? '串链接已复制'
    //   : (stage === 'copy-succeeded'
    //   ? getImageMenuSuccessToast(detail)
    //   : (stage === 'skipped-static' ? '静态图片请使用浏览器原生复制图像' : `复制失败：${detail.error || '未知错误'}`));
    showExtensionToast(text);
  }

  function showExtensionToast(text) {
    const toast = document.createElement('div');
    toast.className = 'ae-toast';
    toast.textContent = text;
    toast.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147483647;background:rgba(0,0,0,.75);color:#fff;padding:8px 18px;border-radius:5px;font-size:14px;line-height:1.4;box-shadow:0 2px 8px rgba(0,0,0,.25);';
    document.documentElement.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }

  function getImageMenuSuccessToast(detail) {
    const method = detail && detail.method ? detail.method : '';
    if (method === 'image/gif') return 'GIF 已原样复制到剪贴板';
    if (method.indexOf('web image/gif') !== -1 || method.indexOf('html') !== -1 && detail.format === 'gif') return 'GIF 已按富文本图片复制到剪贴板';
    if (method.indexOf('web image/png') !== -1 || method.indexOf('html') !== -1 && detail.format === 'apng') return 'APNG 已按富文本图片复制到剪贴板';
    if (method.indexOf('html') !== -1) return '已按富文本图片复制到剪贴板';
    return '当前环境无法复制动图二进制，已复制图片地址';
  }

  root.GM_xmlhttpRequest = function GM_xmlhttpRequest(details) {
    if (!details || !details.url) throw new Error('GM_xmlhttpRequest requires url');
    if (!isRuntimeAvailable()) {
      const err = new Error('Extension context invalidated');
      markExtensionContextInvalidated(err);
      if (runPageFetchRequest(details)) return;
      if (typeof details.onerror === 'function') details.onerror(err);
      return;
    }

    try {
      chrome.runtime.sendMessage({
        type: 'xdex:gm-request',
        details: {
          method: details.method || 'GET',
          url: details.url,
          headers: details.headers || {},
          data: details.data || null,
          responseType: details.responseType || 'text'
        }
      }, (response) => {
        const lastError = getRuntimeLastError();
        if (lastError) {
          markExtensionContextInvalidated(lastError);
          if (typeof details.onerror === 'function') details.onerror(lastError);
          return;
        }

        if (!response || !response.ok) {
          if (typeof details.onerror === 'function') details.onerror(response && response.error ? response.error : response);
          return;
        }

        let responseBody = response.response;
        if (details.responseType === 'blob' && response.base64) {
          const bytes = base64ToBytes(response.base64);
          responseBody = new Blob([bytes], { type: response.contentType || 'application/octet-stream' });
        } else if (details.responseType === 'arraybuffer' && response.base64) {
          const bytes = base64ToBytes(response.base64);
          responseBody = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        }

        if (typeof details.onload === 'function') {
          details.onload({
            status: response.status,
            statusText: response.statusText,
            responseHeaders: response.responseHeaders || '',
            responseText: typeof responseBody === 'string' ? responseBody : '',
            response: responseBody,
            finalUrl: response.finalUrl || details.url
          });
        }
      });
    } catch (err) {
      markExtensionContextInvalidated(err);
      if (runPageFetchRequest(details)) return;
      if (typeof details.onerror === 'function') details.onerror(err);
    }
  };

  function requestCookieOperation(type, details) {
    return new Promise((resolve, reject) => {
      if (!isRuntimeAvailable()) {
        const err = new Error('Extension context invalidated');
        markExtensionContextInvalidated(err);
        reject(err);
        return;
      }
      try {
        chrome.runtime.sendMessage({ type, details: details || {} }, (response) => {
          const lastError = getRuntimeLastError();
          if (lastError) {
            markExtensionContextInvalidated(lastError);
            reject(new Error(lastError.message));
            return;
          }
          if (!response || !response.ok) {
            reject(new Error(response && response.error ? response.error : 'Cookie operation failed'));
            return;
          }
          resolve(response);
        });
      } catch (err) {
        markExtensionContextInvalidated(err);
        reject(err);
      }
    });
  }

  root.__xdexCookies = root.__xdexCookies || {
    getUserhash() {
      return requestCookieOperation('xdex:cookies:getUserhash').then((response) => response.value || '');
    },
    getAll(details) {
      return requestCookieOperation('xdex:cookies:getAll', details).then((response) => response.cookies || []);
    },
    set(details) {
      return requestCookieOperation('xdex:cookies:set', details).then((response) => response.cookie || null);
    },
    remove(details) {
      return requestCookieOperation('xdex:cookies:remove', details).then((response) => response.result || null);
    }
  };

  function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  if (root.chrome && chrome.storage && chrome.storage.onChanged) {
    try {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'local') return;
        Object.entries(changes || {}).forEach(([key, change]) => {
          if (!key.startsWith(storagePrefix)) return;
          const rawKey = key.slice(storagePrefix.length);
          if (typeof change.newValue === 'undefined') {
            memoryStore.delete(rawKey);
            removeLocalStorageMirror(rawKey);
          } else {
            memoryStore.set(rawKey, change.newValue);
            writeLocalStorageMirror(rawKey, change.newValue);
          }
          emitValueChange(rawKey, change.oldValue, change.newValue, true);
        });
      });
    } catch (err) {
      markExtensionContextInvalidated(err);
    }
  }

  if (typeof root.addEventListener === 'function') {
    root.addEventListener('storage', (event) => {
      if (!event || !event.key) return;
      if (event.key.startsWith(syncStoragePrefix)) {
        try {
          applyLocalStorageSyncEnvelope(JSON.parse(event.newValue || 'null'));
        } catch (err) {
          console.warn('[X岛-EX Extension] localStorage sync event failed', err);
        }
        return;
      }
      applyLocalStorageMirrorChange(event.key, event.newValue);
    });
  }

  root.__xdexGmStorageReady = syncFromChromeStorage();
  syncFromLocalStorage();
})();
