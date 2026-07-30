// heic2any MAIN world bridge
// 在 MAIN world 加载 heic2any，并通过 postMessage 提供跨世界转换服务
// ISOLATED world (content script) 通过 window.postMessage 发送请求，接收结果
(function () {
  var g = window;

  // 1. 保存并禁用 AMD/CommonJS
  var savedDefine = g.define;
  var hasSavedDefine = typeof savedDefine !== 'undefined';
  var savedModule = g.module;
  var hasSavedModule = typeof savedModule !== 'undefined';
  if (hasSavedDefine) g.define = undefined;
  if (hasSavedModule) g.module = undefined;

  // 2. 从自身 src 推导 heic2any.min.js URL
  var myScript = document.querySelector('script[data-xdex-heic2any-loader="1"]');
  var myUrl = myScript ? myScript.src : '';
  var heic2anyUrl = myUrl.replace(/heic2any-loader\.js$/, 'heic2any.min.js');

  if (!heic2anyUrl || heic2anyUrl === myUrl) {
    document.documentElement.setAttribute('data-xdex-heic2any-ready', 'error');
    console.error('[heic2any-loader] 无法推导 heic2any.min.js URL');
    return;
  }

  // 3. 加载 heic2any.min.js
  var s = document.createElement('script');
  s.src = heic2anyUrl;
  s.onload = function () {
    // 恢复 AMD/CommonJS
    if (hasSavedDefine) g.define = savedDefine;
    if (hasSavedModule) g.module = savedModule;

    if (typeof g.heic2any !== 'function') {
      document.documentElement.setAttribute('data-xdex-heic2any-ready', 'error');
      console.error('[heic2any-loader] heic2any 加载了但 window.heic2any 不是 function');
      return;
    }

    // 4. 设置跨世界桥接：监听 ISOLATED world 的 postMessage 请求
    window.addEventListener('message', function handler(e) {
      if (!e.data || e.data.type !== 'xdex-heic2any-convert') return;
      var requestId = e.data.requestId;
      var arrayBuffer = e.data.arrayBuffer;

      var blob = new Blob([arrayBuffer], { type: 'image/heic' });
      g.heic2any({ blob: blob, toType: 'image/png', quality: 1, multiple: false })
        .then(function (result) {
          var pngBlob = Array.isArray(result) ? result[0] : result;
          return pngBlob.arrayBuffer();
        })
        .then(function (pngBuffer) {
          // 用 transferable 传回 ArrayBuffer（零拷贝）
          window.postMessage({
            type: 'xdex-heic2any-result',
            requestId: requestId,
            success: true,
            arrayBuffer: pngBuffer
          }, '*', [pngBuffer]);
        })
        .catch(function (err) {
          window.postMessage({
            type: 'xdex-heic2any-result',
            requestId: requestId,
            success: false,
            error: String(err && err.message || err)
          }, '*');
        });
    });

    // 5. 通知就绪
    document.documentElement.setAttribute('data-xdex-heic2any-ready', 'ready');
    console.log('[heic2any-loader] 桥接就绪, window.heic2any:', typeof g.heic2any);
  };
  s.onerror = function () {
    if (hasSavedDefine) g.define = savedDefine;
    if (hasSavedModule) g.module = savedModule;
    document.documentElement.setAttribute('data-xdex-heic2any-ready', 'error');
    console.error('[heic2any-loader] heic2any.min.js 加载失败');
  };
  document.documentElement.appendChild(s);
})();
