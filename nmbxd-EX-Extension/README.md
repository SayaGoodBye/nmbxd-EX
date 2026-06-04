# X岛-EX CRX Migration Prototype

This directory contains the Chrome/Edge MV3 migration prototype for X岛-EX.

For upstream userscript sync and CRX patch rules, see `MIGRATION.md`.

Current scope:

- Load as an unpacked extension from `.temp/nmbxd-EX-Extension`.
- Inject local jQuery, APNG, pako, UPNG, `GM_*` compatibility bootstrap, then a copied content-script version of `.temp/nmbxd-EX-for-edit.user.js`.
- Proxy `GM_xmlhttpRequest` through the MV3 service worker.
- Provide a minimal `chrome.cookies` bridge for reading `userhash` and controlled cookie get/set/remove operations.
- Add native extension image context menu entries for fast image copy, URL copy, and downloads.
- Load `gifsicle-wasm-browser@1.5.19` from a packaged vendor bundle instead of a remote CDN import.
- Install a minimal MAIN-world page bridge for page `window.initContent` calls while keeping business logic in the isolated content script.
- Install an isolated userscript bridge so `src/content/nmbxd-EX-for-edit.user.js` can be replaced directly from the upstream temp userscript.
- De-duplicate `initContent` bridge callbacks: isolated calls run page native init once and userscript init once, while page-originated calls still propagate back to the userscript once.
- Provide a minimal extension options page that edits `chrome.storage.local` key `xdex-Extension:myScriptSettings` while keeping the in-page settings panel unchanged.

Known Phase 1 limits:

- `chrome.storage.local` is async, while the userscript expects sync `GM_getValue`; the current adapter uses an in-memory cache, mirrors values through `localStorage`, and exposes `window.__xdexGmStorageReady` for async preload observation.
- The packaged `gifsicle-wasm-browser` bundle embeds its worker and wasm, but it still creates a blob Worker internally; GIF compression needs real Chrome/Edge QA.
- Direct replacement keeps the upstream remote gifsicle import as a fallback in the copied userscript. The CRX loader pre-populates `window.__xdexGifsicleModule` before that fallback executes; a store-ready release should still prefer an upstream loader hook or build transform that removes remote-code fallback text from packaged extension code.
- GIF/APNG compression still needs real browser QA after this local bundle migration.
- Chrome extensions cannot invoke the browser's built-in native "Copy image" command directly; the CRX menu uses extension clipboard APIs instead.
