(function () {
  'use strict';

  if (document.documentElement && document.documentElement.dataset) {
    document.documentElement.dataset.xdexSingletonOwner = 'extension';
    document.documentElement.dataset.xdexSingletonSource = 'extension-main';
  }

  const callPageInitEvent = 'xdex:call-page-init-content';
  const pageInitDoneEvent = 'xdex:page-init-content';
  const updateDebugRequestEvent = 'xdex:update-debug-request';
  const updateDebugResponseEvent = 'xdex:update-debug-response';
  const updateDebugMethods = {
    __xdexGetUpdateCheckState: '__xdexGetUpdateCheckState',
    __xdexCheckUpdateNow: '__xdexCheckUpdateNow',
    __xdexClearUpdateCheckState: '__xdexClearUpdateCheckState',
    __xdexSetUpdateCheckState: '__xdexSetUpdateCheckState',
    __xdexPatchUpdateCheckState: '__xdexPatchUpdateCheckState',
    __xdexGetPostHistoryDebug: '__xdexGetPostHistoryDebug',
    __xdexClearPostHistoryDebug: '__xdexClearPostHistoryDebug'
  };
  let updateDebugRequestId = 0;
  let nativeInitContent = typeof window.initContent === 'function' ? window.initContent : null;
  let wrappedInitContent = null;

  function serializeDebugArg(arg) {
    if (arg && typeof arg === 'object') {
      try {
        return JSON.parse(JSON.stringify(arg));
      } catch (err) {
        return arg;
      }
    }
    return arg;
  }

  function callUpdateDebug(method, args) {
    return new Promise((resolve, reject) => {
      const id = `update-debug-${Date.now()}-${++updateDebugRequestId}`;
      const timeoutId = window.setTimeout ? window.setTimeout(() => {
        document.removeEventListener(updateDebugResponseEvent, onResponse);
        reject(new Error(`Update debug method timed out: ${method}`));
      }, 10000) : null;
      function onResponse(event) {
        const detail = event && event.detail ? event.detail : {};
        if (detail.id !== id) return;
        document.removeEventListener(updateDebugResponseEvent, onResponse);
        if (timeoutId !== null && window.clearTimeout) window.clearTimeout(timeoutId);
        if (detail.ok) {
          resolve(detail.value);
          return;
        }
        reject(new Error(detail.error || `Update debug method failed: ${method}`));
      }
      document.addEventListener(updateDebugResponseEvent, onResponse);
      document.dispatchEvent(new CustomEvent(updateDebugRequestEvent, {
        detail: {
          id,
          method,
          args: Array.prototype.map.call(args || [], serializeDebugArg)
        }
      }));
    });
  }

  Object.keys(updateDebugMethods).forEach((name) => {
    window[name] = function xdexUpdateDebugProxy() {
      return callUpdateDebug(updateDebugMethods[name], arguments);
    };
  });

  function emitPageInit(root) {
    document.dispatchEvent(new CustomEvent(pageInitDoneEvent, {
      detail: { root: root || document }
    }));
  }

  function callNativeInit(root, thisArg, args) {
    if (typeof nativeInitContent !== 'function') return undefined;
    return nativeInitContent.apply(thisArg || window, args || [root]);
  }

  function createWrappedInitContent(fn) {
    return function xdexWrappedInitContent(root) {
      const result = fn.apply(this, arguments);
      emitPageInit(root);
      return result;
    };
  }

  function setNativeInitContent(fn) {
    nativeInitContent = typeof fn === 'function' ? fn : null;
    wrappedInitContent = nativeInitContent ? createWrappedInitContent(nativeInitContent) : nativeInitContent;
  }

  try {
    Object.defineProperty(window, 'initContent', {
      configurable: true,
      enumerable: true,
      get() {
        return wrappedInitContent;
      },
      set(fn) {
        setNativeInitContent(fn);
      }
    });
    if (nativeInitContent) setNativeInitContent(nativeInitContent);
  } catch (err) {
    console.warn('[X岛-EX Extension] page initContent bridge install failed', err);
  }

  document.addEventListener(callPageInitEvent, (event) => {
    const root = event.detail && event.detail.root ? event.detail.root : document;
    try {
      callNativeInit(root, window, [root]);
    } catch (err) {
      console.warn('[X岛-EX Extension] page initContent call failed', err);
    }
  });

  window.__xdexPageBridgeInstalled = true;
}());
