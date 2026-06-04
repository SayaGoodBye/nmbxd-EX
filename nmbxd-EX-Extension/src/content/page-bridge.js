(function () {
  'use strict';

  if (document.documentElement && document.documentElement.dataset) {
    document.documentElement.dataset.xdexSingletonOwner = 'crx';
    document.documentElement.dataset.xdexSingletonSource = 'crx-main';
  }

  const callPageInitEvent = 'xdex:call-page-init-content';
  const pageInitDoneEvent = 'xdex:page-init-content';
  let nativeInitContent = typeof window.initContent === 'function' ? window.initContent : null;
  let wrappedInitContent = null;

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
    console.warn('[X岛-EX CRX] page initContent bridge install failed', err);
  }

  document.addEventListener(callPageInitEvent, (event) => {
    const root = event.detail && event.detail.root ? event.detail.root : document;
    try {
      callNativeInit(root, window, [root]);
    } catch (err) {
      console.warn('[X岛-EX CRX] page initContent call failed', err);
    }
  });

  window.__xdexPageBridgeInstalled = true;
}());
