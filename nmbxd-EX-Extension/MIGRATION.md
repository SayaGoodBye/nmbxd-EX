# X岛-EX CRX Migration Guide

This document explains how to update the CRX prototype after the upstream userscript changes.

## Current Model

The CRX prototype now targets direct userscript replacement. The copied content script is expected to be byte-for-byte identical to the upstream temp userscript:

```text
.temp/nmbxd-EX-for-edit.user.js
.temp/nmbxd-EX-Extension/src/content/nmbxd-EX-for-edit.user.js
```

CRX-only behavior should live outside the copied userscript:

- `vendor/` contains local dependency bundles that cannot be loaded from remote CDNs in MV3.
- `src/content/gm-compat.js` provides the `GM_*` compatibility layer and routes privileged operations to the extension.
- `src/content/gifsicle-loader.js` preloads the packaged `gifsicle-wasm-browser` bundle and exposes `window.__xdexGifsicleModule` before the userscript runs.
- `src/content/page-bridge.js` handles the MAIN-world page `window.initContent` bridge.
- `src/content/userscript-bridge.js` handles the isolated-world userscript `window.initContent` wrapper without editing the userscript copy.
- `src/background/service-worker.js` handles cross-origin requests, cookies, downloads, context menus, and offscreen clipboard work.
- `options/` edits the same `xdex-Extension:myScriptSettings` object used by the GM storage adapter.

## Direct Replacement Workflow

To update the CRX version after the upstream userscript changes, copy the upstream temp userscript into the CRX content path:

```powershell
Copy-Item -LiteralPath ".temp\nmbxd-EX-for-edit.user.js" -Destination ".temp\nmbxd-EX-Extension\src\content\nmbxd-EX-for-edit.user.js" -Force
& "E:\A_software\nodejs\node.exe" ".temp\nmbxd-EX-Extension\scripts\sync-userscript-meta.js"
```

The sync script updates both generated userscript metadata in `src/content/gm-compat.js` and `manifest.json` `version` from the copied userscript `@version`.

After syncing, these values must match:

```text
src/content/nmbxd-EX-for-edit.user.js @version
src/content/gm-compat.js GM_info.script.version
manifest.json version
```

Then run the verification checklist below. Do not manually edit `src/content/nmbxd-EX-for-edit.user.js` for CRX behavior unless a new upstream incompatibility is discovered and documented here.

## Why Direct Replacement Works

### gifsicle remote import

The upstream script first checks `window.__xdexGifsicleModule`. The CRX `gifsicle-loader.js` defines that value before the userscript runs.

The exposed object has a `run()` method and proxies to the packaged vendor module:

```text
vendor/gifsicle/gifsicle.min.js
```

This prevents the upstream fallback `import('https://cdn.jsdelivr.net/npm/gifsicle-wasm-browser/dist/gifsicle.min.js')` from being used in the CRX path during normal execution.

Important limitation: the fallback text still exists in the directly copied upstream userscript. This satisfies the functional direct-replacement contract, but a store-ready package should still prefer an upstream loader hook or build-time transform that removes remote-code fallback text from packaged extension code.

### initContent page bridge

The upstream script assigns `window.initContent` in the isolated content-script world. `userscript-bridge.js` installs a property wrapper before the userscript runs, captures that assignment, and wraps calls to notify `page-bridge.js` through:

```text
xdex:call-page-init-content
```

`page-bridge.js` wraps the page-world native `window.initContent` and reports page calls through:

```text
xdex:page-init-content
```

The isolated bridge suppresses the completion event caused by its own `xdex:call-page-init-content` dispatch. This keeps an isolated `window.initContent(root)` call to one page-native init and one userscript init. A page-originated MAIN-world `window.initContent(root)` call has no suppression marker, so it still propagates back to the isolated userscript init once.

This keeps the bridge outside the copied userscript.

### settings storage

The upstream settings key remains:

```js
key: 'myScriptSettings'
```

The CRX adapter maps that key to:

```text
xdex-Extension:myScriptSettings
```

If upstream changes `SettingPanel.defaults`, update `src/shared/settings-schema.js` so the options page stays aligned.

## Manifest Order Requirements

The isolated content-script order must keep compatibility code before the userscript:

1. `vendor/jquery-3.6.0.min.js`
2. `vendor/apng-js-1.1.5.js`
3. `vendor/pako-2.1.0.min.js`
4. `vendor/UPNG-2.1.0.js`
5. `src/content/gm-compat.js`
6. `src/content/gifsicle-loader.js`
7. `src/content/userscript-bridge.js`
8. `src/content/nmbxd-EX-for-edit.user.js`

The MAIN-world content script must still load `src/content/page-bridge.js` at `document_start`.

## Dependency Rules

Chrome MV3 must not execute remotely hosted code. After each upstream sync, inspect userscript metadata and dynamic imports.

Check these patterns:

```powershell
rg -n "@require|import\(|https://cdn|https://unpkg|https://code\.jquery" ".temp\nmbxd-EX-Extension\src\content\nmbxd-EX-for-edit.user.js"
```

If a new runtime dependency appears:

1. Add a local copy under `vendor/`.
2. Add it to `manifest.json` content script order or `web_accessible_resources`, depending on how it is loaded.
3. Add a small loader under `src/content/` if dynamic loading is still needed.
4. Add or update a test in `tests/direct-replacement.test.js`.

## Verification Checklist

Run the direct replacement contract test after every upstream sync:

```powershell
& "E:\A_software\nodejs\node.exe" ".temp\nmbxd-EX-Extension\tests\direct-replacement.test.js"
```

Run syntax checks:

```powershell
& "E:\A_software\nodejs\node.exe" --check ".temp\nmbxd-EX-Extension\src\content\nmbxd-EX-for-edit.user.js"
& "E:\A_software\nodejs\node.exe" --check ".temp\nmbxd-EX-Extension\src\content\gm-compat.js"
& "E:\A_software\nodejs\node.exe" --check ".temp\nmbxd-EX-Extension\src\content\gifsicle-loader.js"
& "E:\A_software\nodejs\node.exe" --check ".temp\nmbxd-EX-Extension\src\content\page-bridge.js"
& "E:\A_software\nodejs\node.exe" --check ".temp\nmbxd-EX-Extension\src\content\userscript-bridge.js"
& "E:\A_software\nodejs\node.exe" --check ".temp\nmbxd-EX-Extension\src\background\service-worker.js"
& "E:\A_software\nodejs\node.exe" --check ".temp\nmbxd-EX-Extension\src\shared\settings-schema.js"
& "E:\A_software\nodejs\node.exe" --check ".temp\nmbxd-EX-Extension\options\options.js"
```

Run static checks:

```powershell
rg -n "__xdexLoadGifsicleModule|xdex:call-page-init-content|xdex:page-init-content" ".temp\nmbxd-EX-Extension\src\content\nmbxd-EX-for-edit.user.js"
rg -F "key: 'myScriptSettings'" ".temp\nmbxd-EX-Extension\src\content\nmbxd-EX-for-edit.user.js"
rg -F "STORAGE_KEY = 'xdex-Extension:myScriptSettings'" ".temp\nmbxd-EX-Extension\src\shared\settings-schema.js"
```

Expected results:

- The first command should not find CRX-only patch tokens in the copied userscript.
- The settings key and options storage key should still align.
- `cdn.jsdelivr.net/npm/gifsicle` may still appear as the upstream fallback; direct replacement relies on `gifsicle-loader.js` pre-populating `window.__xdexGifsicleModule` before that fallback runs.

## Browser QA Checklist

Static checks are not enough for these areas:

- GIF compression path, because `gifsicle-wasm-browser` creates a blob Worker internally.
- APNG/GIF/image compression behavior.
- Extension image context menu copy/download.
- Offscreen clipboard image write.
- Cookie bridge behavior on real X岛 pages.
- Options page save/reload with `chrome.storage.local` in an unpacked extension.
- MAIN-world `initContent` bridge on pages that define native `window.initContent`.

Load `.temp\nmbxd-EX-Extension` as an unpacked extension and test the changed feature before treating a sync as release-ready.

## Future Work

Direct replacement currently depends on the upstream script continuing to check `window.__xdexGifsicleModule` before remote import and continuing to assign `window.initContent` in the current shape.

To make the contract stronger:

1. Add an explicit upstream loader hook such as `window.__xdexResolveGifsicleApi`.
2. Add an explicit upstream `initExtendedContent` event hook instead of relying on `window.initContent` assignment interception.
3. Replace page-internal clipboard/download paths with compatibility helpers shared by userscript and CRX.
4. Make `SettingPanel.defaults` machine-readable so `settings-schema.js` can be regenerated.
