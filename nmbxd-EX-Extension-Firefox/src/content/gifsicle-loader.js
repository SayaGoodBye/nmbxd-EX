(function () {
  'use strict';

  const vendorPath = 'vendor/gifsicle/gifsicle.min.js';
  let modulePromise = null;
  let loadedApi = null;

  function getRuntimeUrl(path) {
    if (!globalThis.chrome || !chrome.runtime || typeof chrome.runtime.getURL !== 'function') {
      throw new Error('chrome.runtime.getURL is unavailable for gifsicle loading');
    }
    return chrome.runtime.getURL(path);
  }

  function importModule(url) {
    if (typeof globalThis.__xdexImportModule === 'function') {
      return globalThis.__xdexImportModule(url);
    }
    return import(url);
  }

  globalThis.__xdexLoadGifsicleModule = function loadGifsicleModule() {
    if (loadedApi) {
      return Promise.resolve(loadedApi);
    }

    if (!modulePromise) {
      modulePromise = importModule(getRuntimeUrl(vendorPath))
        .then((mod) => {
          const api = (mod && (mod.default || mod.gifsicle || mod)) || null;
          if (!api || typeof api.run !== 'function') {
            throw new Error('本地 GIF 压缩库未返回可用 run() 接口');
          }
          loadedApi = api;
          globalThis.__xdexGifsicleModule = api;
          return api;
        })
        .catch((err) => {
          modulePromise = null;
          throw err;
        });
    }

    return modulePromise;
  };

  globalThis.__xdexGifsicleModule = {
    run() {
      const args = Array.prototype.slice.call(arguments);
      return globalThis.__xdexLoadGifsicleModule()
        .then((api) => api.run.apply(api, args));
    }
  };

  globalThis.__xdexGifsicleModulePromise = globalThis.__xdexLoadGifsicleModule();
}());
