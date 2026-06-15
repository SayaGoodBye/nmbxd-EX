(function () {
  'use strict';

  const callPageInitEvent = 'xdex:call-page-init-content';
  const pageInitDoneEvent = 'xdex:page-init-content';
  const updateDebugRequestEvent = 'xdex:update-debug-request';
  const updateDebugResponseEvent = 'xdex:update-debug-response';
  const updateDebugMethods = new Set([
    '__xdexGetUpdateCheckState',
    '__xdexCheckUpdateNow',
    '__xdexClearUpdateCheckState',
    '__xdexSetUpdateCheckState',
    '__xdexPatchUpdateCheckState',
    '__xdexGetPostHistoryDebug',
    '__xdexClearPostHistoryDebug'
  ]);
  let userscriptInitContent = null;
  let wrappedInitContent = null;
  let suppressNextPageDone = 0;

  function serializeDebugValue(value) {
    if (value && typeof value === 'object') {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch (err) {
        return value;
      }
    }
    return value;
  }

  function emitUpdateDebugResponse(id, ok, value, error) {
    document.dispatchEvent(new CustomEvent(updateDebugResponseEvent, {
      detail: {
        id,
        ok,
        value: serializeDebugValue(value),
        error: error ? String(error.message || error) : ''
      }
    }));
  }

  function emitCallPageInit(root) {
    document.dispatchEvent(new CustomEvent(callPageInitEvent, {
      detail: { root: root || document }
    }));
  }

  function callUserscriptInit(root, thisArg, args) {
    if (typeof userscriptInitContent !== 'function') return undefined;
    return userscriptInitContent.apply(thisArg || window, args || [root]);
  }

  function createWrappedInitContent(fn) {
    return function xdexUserscriptInitContent(root) {
      try {
        suppressNextPageDone += 1;
        const suppressMarker = suppressNextPageDone;
        emitCallPageInit(root);
        if (suppressNextPageDone === suppressMarker) suppressNextPageDone -= 1;
      } catch (err) {
        if (suppressNextPageDone > 0) suppressNextPageDone -= 1;
        console.warn('[X岛-EX Extension] page initContent bridge failed', err);
      }
      return fn.apply(this, arguments);
    };
  }

  function setUserscriptInitContent(fn) {
    userscriptInitContent = typeof fn === 'function' ? fn : null;
    wrappedInitContent = userscriptInitContent ? createWrappedInitContent(userscriptInitContent) : userscriptInitContent;
  }

  try {
    Object.defineProperty(window, 'initContent', {
      configurable: true,
      enumerable: true,
      get() {
        return wrappedInitContent;
      },
      set(fn) {
        setUserscriptInitContent(fn);
      }
    });
  } catch (err) {
    console.warn('[X岛-EX Extension] userscript initContent bridge install failed', err);
  }

  document.addEventListener(pageInitDoneEvent, (event) => {
    const root = event.detail && event.detail.root ? event.detail.root : document;
    if (suppressNextPageDone > 0) {
      suppressNextPageDone -= 1;
      return;
    }
    try {
      callUserscriptInit(root, window, [root]);
    } catch (err) {
      console.warn('[X岛-EX Extension] userscript initContent call failed', err);
    }
  });

  document.addEventListener(updateDebugRequestEvent, (event) => {
    const detail = event && event.detail ? event.detail : {};
    const method = detail.method;
    const id = detail.id;
    if (!id || !updateDebugMethods.has(method)) return;
    const fn = window[method];
    if (typeof fn !== 'function') {
      emitUpdateDebugResponse(id, false, null, new Error(`Update debug method unavailable: ${method}`));
      return;
    }
    try {
      Promise.resolve(fn.apply(window, detail.args || [])).then((value) => {
        emitUpdateDebugResponse(id, true, value, null);
      }, (err) => {
        emitUpdateDebugResponse(id, false, null, err);
      });
    } catch (err) {
      emitUpdateDebugResponse(id, false, null, err);
    }
  });

  window.__xdexUserscriptBridgeInstalled = true;
}());
