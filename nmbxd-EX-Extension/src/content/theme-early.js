/* X岛-EX 深色主题 early 注入（document_start 首位执行，无任何依赖）。
 * 目标：页面首帧渲染前打 xdex-custom-dark 类 + 注入 fallback 深色样式，杜绝浅→深闪变。
 * 读取链（全同步）：sessionStorage 会话记忆 → localStorage GM 镜像（gm-compat 写入的
 * xdex-Extension-local:myScriptSettings）→ 不做异步 chrome.storage 等待。
 * Dark Reader 激活时不注入（由其接管）。
 */
(function () {
  'use strict';
  try {
    var LS_KEY = 'xdex-Extension-local:myScriptSettings';
    var SESSION_KEY = 'xdexCustomDarkEnabled';
    console.log('[xdex-theme-early] script ran at document_start, htmlExists=' + !!document.documentElement);
    var enabled = null;
    var sessionRaw = null;
    var lsRaw = null;
    try {
      var s = sessionStorage.getItem(SESSION_KEY);
      sessionRaw = s;
      if (s === 'true') enabled = true;
      else if (s === 'false') enabled = false;
    } catch (e) {}
    if (enabled === null) {
      try {
        var raw = localStorage.getItem(LS_KEY);
        lsRaw = raw ? raw.slice(0, 120) : null;
        if (raw) {
          var obj = JSON.parse(raw);
          enabled = obj && obj.enableCustomDarkTheme === 'dark';
        }
      } catch (e) {}
    }
    console.log('[xdex-theme-early] session=' + JSON.stringify(sessionRaw) + ' ls=' + JSON.stringify(lsRaw) + ' enabled=' + enabled);
    if (!enabled) return;
    var apply = function () {
      try {
        var rootEl = document.documentElement;
        if (!rootEl) { console.log('[xdex-theme-early] apply: no html yet, waiting'); return false; }
        var drMode = rootEl.getAttribute('data-darkreader-mode') || rootEl.getAttribute('data-darkreader-scheme');
        if (drMode && drMode !== 'off') { console.log('[xdex-theme-early] apply: DR active(' + drMode + '), skip'); return true; }
        rootEl.classList.add('xdex-custom-dark');
        if (!document.getElementById('xdex-custom-theme-early')) {
          var style = document.createElement('style');
          style.id = 'xdex-custom-theme-early';
          style.textContent =
            'html{background-color:#28292a!important;color:#d9d0d0!important}' +
            'body{background-color:#28292a!important}' +
            '#h-menu{background-color:#28292a!important}' +
            'font[color="#789922"]{color:#b5d06d!important}';
          (document.head || rootEl).appendChild(style);
          if (!document.head) {
            var mo = new MutationObserver(function () {
              if (document.head) {
                mo.disconnect();
                if (style.isConnected) document.head.appendChild(style);
              }
            });
            mo.observe(rootEl, { childList: true });
          }
        }
        console.log('[xdex-theme-early] applied: class + style injected');
        return true;
      } catch (e) { console.log('[xdex-theme-early] apply threw: ' + e.message); return true; }
    };
    if (!apply()) {
      console.log('[xdex-theme-early] waiting for html via observer');
      // documentElement 尚不存在（极早 document_start）：等它出现
      var rootMo = new MutationObserver(function () {
        if (document.documentElement) {
          rootMo.disconnect();
          apply();
        }
      });
      rootMo.observe(document, { childList: true, subtree: true });
    }
  } catch (e) {}
})();
