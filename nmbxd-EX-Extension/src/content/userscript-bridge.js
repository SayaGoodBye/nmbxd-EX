(function () {
  'use strict';

  const callPageInitEvent = 'xdex:call-page-init-content';
  const pageInitDoneEvent = 'xdex:page-init-content';
  let userscriptInitContent = null;
  let wrappedInitContent = null;
  let suppressNextPageDone = 0;

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

  window.__xdexUserscriptBridgeInstalled = true;
}());
