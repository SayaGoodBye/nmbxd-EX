# X岛-EX Firefox 版扩展：兼容性说明

> 目录：`.temp/nmbxd-EX-Extension-Firefox/`
> 参照实现：`.temp/nmbxd-EX-Extension/`（Chrome/Edge，Manifest V3 + Service Worker）
> 最低版本：**Firefox 128**（`browser_specific_settings.gecko.strict_min_version = "128.0"`）

## 0. 为什么最低要求 Firefox 128

| 依赖点 | 需要的 Firefox 版本 | 说明 |
|---|---|---|
| `content_scripts.world: "MAIN"`（`src/content/page-bridge.js`） | **128** | 让桥接脚本跑在页面主世界（与页面共享 `window`）。低于 128 时该字段被忽略 → 桥接失效 |
| `declarativeNetRequest.updateSessionRules`（自定义饼干发帖改 Cookie 头） | **128** | Firefox 113 起有 DNR，但会话规则（session rules）自 128 起支持 |
| `ClipboardItem` + `navigator.clipboard.write()` | 127 | 异步剪贴板写入（图片） |
| MV3 host 权限**安装即授予** | 127 | 127 之前 MV3 的 host 权限必须由用户手动授予（见第 4 节） |

更低版本（113~127）理论上可运行，但需要按第 3.4 节的两条替代方案改造；本仓按 128+ 收敛，不做兼容分支。

## 1. 与 Chrome 版的文件差异

| 文件 | Chrome 版 | Firefox 版 |
|---|---|---|
| `manifest.json` | `background.service_worker` + `key` + `offscreen` 权限 | `background.scripts`（事件页）+ `browser_specific_settings.gecko`；**移除** `key`、`offscreen` 权限；`declarativeNetRequestWithHostAccess` → `declarativeNetRequest` |
| `offscreen/offscreen.html`、`offscreen/offscreen.js` | 离屏文档（剪贴板 + blob 下载） | **删除**；等价逻辑迁到 ↓ |
| `src/background/dom-jobs.js` | — | **新增**：`xdexRunDomJob(message)`，在后台事件页内直接完成剪贴板写入 / blob 锚点下载 / blob URL |
| `src/content/clipboard-writer.js` | — | **新增**：内容脚本侧的剪贴板回退通道（后台写失败时由它写入） |
| `src/background/service-worker.js` | `sendToOffscreen()` / `ensureOffscreenDocument()` / `hasOffscreenDocument()` | 改为 `runBackgroundDomJob()`（+ `requestContentClipboardWrite()` 回退）；删除两个离屏文档管理函数；头部注释说明差异 |
| `src/background/thread-export-tasks.js` | 下载走 `sendToOffscreen('xdex:export-save')` | 改为 `runBackgroundDomJob(...)`；**锚点下载失败时自动回退 downloads API**（`xdexExportSwDownload`） |
| `scripts/audit-firefox-apis.js` | — | **新增**：Firefox API 静态审计（清单约束 + 禁用 API + 未审计 API 白名单） |
| 其余（`export/`、`options/`、`vendor/`、`src/content/*`、`src/shared/`、`tests/`、`update.json`、`scripts/sync-userscript-meta.js`） | 同 | **原样复用**（内容脚本与用户脚本副本逐字节一致） |

## 2. 扩展 API 差异总表（逐条：差异 → 本仓处理）

| 能力 | Chrome | Firefox | 本仓处理 |
|---|---|---|---|
| 后台运行形态 | MV3 Service Worker（无 DOM） | MV3 **事件页**（普通文档，有 DOM，可被挂起） | `background.scripts` 顺序加载；长任务续跑依赖既有 `alarms` 每分钟唤醒（与 Chrome 版同机制） |
| `@require`/多脚本加载 | `importScripts()` | 页面里无 `importScripts` | 由 manifest 的 `background.scripts` 顺序加载；代码里的 `importScripts` 保留但仅在 Chrome 侧生效 |
| `chrome.offscreen.*` | 有（109+） | **无** | 用**后台事件页本身**承担同样工作（`src/background/dom-jobs.js`） |
| `chrome.runtime.getContexts` | 有（116+） | **无** | 本仓不再需要（没有离屏文档要查） |
| 剪贴板写入 | SW 内不可写 → 用离屏文档 | 后台页可直接写：MDN 明确 `clipboardWrite` 允许从**所有扩展上下文与内容脚本**写剪贴板，且**不需要瞬时用户激活** | 主路径在后台页（`dom-jobs.js`）；失败时回退内容脚本（`clipboard-writer.js`） |
| 写 `image/gif` | 可用（视版本） | 异步剪贴板只保证 `text/plain`、`text/html`、`image/png` | 沿用既有逐级回退：`image/gif` → `web image/gif`+html → html+plain → 选区 `execCommand('copy')` → 纯文本 URL |
| `ClipboardItem.supports` | 有（121+） | 无 | `supportsClipboardType()` 在缺失时按"乐观尝试 + 失败回退"处理 |
| 请求头改写 | `declarativeNetRequestWithHostAccess` + `updateSessionRules` | `declarativeNetRequest`（113+）；**会话规则 128+**；`modifyHeaders` 需要 host 权限 | 权限名改为 `declarativeNetRequest`；逻辑不变（2 条会话规则，用完即删）；不可用时抛出的错误文案已说明版本要求 |
| 固定扩展 ID | 清单 `key` | **不识别** `key` | 移除；改用 `browser_specific_settings.gecko.id`（**必须稳定**，改了等于换扩展、会丢存储） |
| host 权限授予 | 安装即授予 | MV3 默认**可选**；127 起安装自动授予，但**临时载入（about:debugging）不会自动授予** | 见第 4 节：首次使用需手动"允许访问" |
| `content_scripts.world` | 支持 `MAIN` | **128+** | 依赖 128；低于 128 见 3.4 |
| `web_accessible_resources.matches` | 支持 | 105+ 支持 | 原样保留（已移除 `offscreen/offscreen.html`） |
| 下载文件名 | 离屏文档锚点下载绕过 `onDeterminingFilename` 干扰 | 后台页锚点下载同样可用；若受限则回退 `downloads.download` | `thread-export-tasks.js` 双路径（锚点优先，`ANCHOR_DOWNLOAD_FAILED` → downloads API） |
| `chrome.cookies` / `alarms` / `contextMenus` / `action` / `tabs` / `storage` / `downloads` | 支持 | 支持（语义一致） | 原样复用 |
| 扩展页面 CSP | `extension_pages` | 同样支持，且必须包含默认限制 | 保持 `script-src 'self'; object-src 'self'; connect-src 'self' http: https: ws: wss:` |

## 3. 无法实现 / 需要替代的项

### 3.1 `chrome.offscreen`（离屏文档）——Firefox 无此 API
**替代**：后台事件页本身就是普通文档，`dom-jobs.js` 在其中直接执行 DOM 相关任务。
**差异说明**：Chrome 离屏文档是常驻独立文档；Firefox 后台事件页在空闲时可能被挂起（MV3 事件页语义）。对本仓影响有限：这些任务都是**一次性短任务**（一次剪贴板写入 / 一次下载触发），不需要常驻。
**残留风险（真机验证项）**：非可见窗口触发下载在个别策略下可能被拒 → 已内置 downloads API 回退。

### 3.2 `chrome.runtime.getContexts`——Firefox 无
**替代**：无需替代（用途仅是"离屏文档是否已存在"，而 Firefox 版没有离屏文档）。

### 3.3 `declarativeNetRequestWithHostAccess` 权限名——Chromium 侧写法
**替代**：Firefox 用 `declarativeNetRequest` + `host_permissions`（文档明确 `modifyHeaders` 需要 host 权限）。
**注意**：Firefox 的 host 权限若未授予，规则**静默不生效**（社区实例：表现为"规则加了但请求头没变"）。见第 4 节。

### 3.4 低于 Firefox 128 的环境（本仓不实现，仅记录替代方案）
| 缺失能力 | 替代方案 |
|---|---|
| `content_scripts.world: "MAIN"` | 由内容脚本（隔离世界）注入 `<script src="chrome.runtime.getURL('src/content/page-bridge.js')">` 到页面，或改用 `scripting.executeScript({ world: 'MAIN' })`（同样 128+，故实际只有 `<script>` 注入这条路） |
| `updateSessionRules` | 改用 **blocking `webRequest.onBeforeSendHeaders`**（Firefox MV3 仍支持阻塞式 webRequest）：在清单 permissions 增加 `webRequest`、`webRequestBlocking`，在回调里对两个 POST 端点重写 `Cookie` 头；代价是请求拦截全程参与、权限提示更重 |

### 3.5 明确"无法实现"的项
| 项 | 原因 |
|---|---|
| 与 Chrome 完全相同的"离屏剪贴板"语义（常驻、可后台写任意 MIME） | Firefox 无 offscreen API，且异步剪贴板只保证 `text/plain` / `text/html` / `image/png`；`image/gif` 写入无法保证 → 只能降级为"HTML（含 `<img>`）+ 纯文本 URL" |
| 固定扩展 ID（清单 `key`） | Firefox 不识别 `key`；等价物是 `gecko.id`，但**语义不同**：改 ID = 新扩展，不继承存储与权限 |
| 自动更新通道 | Chrome 用清单外的商店/企业策略 | **Firefox 也支持**：`browser_specific_settings.gecko.update_url`（指向自托管 update manifest，必须 https）——本仓未填写，走 AMO 自动更新；自托管分发时按需补上 |

## 4. 首次使用必须授予 host 权限（Firefox 特有）

Firefox MV3 里 host 权限**默认是可选权限**：

- **从 AMO 安装 / 正式签名包**：Firefox **127+** 会在安装时自动授予（更早版本需用户手动开启）。
- **临时载入（about:debugging）**：**不会自动授予**。未授予时的表现是"功能看似可用但无效"——例如自定义饼干发帖的 Cookie 重写规则不生效、跨域请求（WebDAV/API/图床）失败。

授予方式（任一）：
1. 扩展图标上的**蓝点提示** → 右键 → **"始终允许在 <站点>"**；
2. `about:addons` → 本扩展 → **权限**页 → 打开 "访问 <站点> 的数据"；
3. 扩展设置页里主动调用 `permissions.request()`（本仓未内置该引导，可按需添加）。

> 建议在 Firefox 版首次运行时于设置面板显示一次提示（待办，未实现）。

## 5. 安装与调试

**临时载入（开发）**
1. `about:debugging#/runtime/this-firefox` → 「临时载入附加组件」→ 选择
   `.temp/nmbxd-EX-Extension-Firefox/manifest.json`；
2. 打开任一 `https://www.nmbxd1.com/*` 页面；
3. **按第 4 节授予 host 权限**（否则多数功能无效）；
4. 查看日志：`about:debugging` → 本扩展 → 「检查」打开后台页控制台（对应 Chrome 的 Service Worker 控制台）。

**持久安装（本机）**
- 正式版 Firefox 要求签名：用 AMO 自托管签名（`web-ext sign`）或使用 **Firefox Developer Edition / ESR** 并把 `xpinstall.signatures.required` 置为 `false`；
- 打包：把 `.temp/nmbxd-EX-Extension-Firefox/` 下除 `tests/`、`scripts/`、`update.json` 外的文件压成 zip，改名为 `.xpi`（发布用 zip 的排除规则可参考 Chrome 版约定）。

**版本号**
- `manifest.json.version` 必须与用户脚本 `@version` 一致（4 段以内整数）；改完元数据后运行
  `node scripts/sync-userscript-meta.js`（脚本在 Firefox 目录里同样可用：它按 `root/src/content/...`、`root/manifest.json`、`root/update.json` 定位）。

## 6. 维护与同步

内容脚本 `src/content/nmbxd-EX-for-edit.user.js` 与 Chrome 版一样是**用户脚本的副本**，跟随主脚本发布同步：

```powershell
# 1) 主脚本改动后，复制到 Firefox 版内容目录（与 Chrome 版同步动作一致）
Copy-Item -LiteralPath ".temp\nmbxd-EX-for-edit.user.js" `
  -Destination ".temp\nmbxd-EX-Extension-Firefox\src\content\nmbxd-EX-for-edit.user.js" -Force
# 2) 若元数据/版本变动，同步 gm-compat 元数据块、manifest 版本、update.json
node ".temp\nmbxd-EX-Extension-Firefox\scripts\sync-userscript-meta.js"
# 3) 校验：内容副本与开发源字节一致 + Firefox API 审计
cmd /c fc /b ".temp\nmbxd-EX-for-edit.user.js" ".temp\nmbxd-EX-Extension-Firefox\src\content\nmbxd-EX-for-edit.user.js"
node ".temp\nmbxd-EX-Extension-Firefox\scripts\audit-firefox-apis.js"
```

测试：`tests/` 与 Chrome 版共用同一套 Node 契约测试（不依赖浏览器），在 Firefox 目录内同样可跑：

```powershell
node ".temp\nmbxd-EX-Extension-Firefox\tests\direct-replacement.test.js"   # 校验 Firefox 内容副本与开发源一致
```

## 7. 静态审计脚本

`scripts/audit-firefox-apis.js` 会检查：

0. **内容副本新鲜度**：把本构建的 `src/content/nmbxd-EX-for-edit.user.js` 与开发源 `.temp/nmbxd-EX-for-edit.user.js` 逐字节比对，不一致即失败（"忘了按 Sync workflow 第 2 步复制"从静默通过变成硬失败；找不到开发源时只记一条提示——因为 `.temp` 之外的副本或 CI 里该检查无意义）；
1. 清单：禁止 `background.service_worker`、必须有 `background.scripts` 与 `gecko.id`、不得含 `key` / `offscreen` 权限 / offscreen 资源、必须含 `dom-jobs.js` 与 `clipboard-writer.js`；
2. 代码：禁止 `chrome.offscreen`、`chrome.runtime.getContexts`、`chrome.sidePanel`；
3. API 白名单：出现未审计的 `chrome.<api>` 即失败（提醒人工确认 Firefox 支持情况）。

> 因为审计读的是**本构建成品**（`src/`、`export/`、`options/` + `manifest.json`），它在同步流程里的位置必须在"复制 + 元数据同步"**之后**：AGENTS.md 的顺序是 2 复制 → 3 两个构建各跑 `sync-userscript-meta.js` → 4 本审计 → 5 `fc /b` 五处校验。

## 7.1 `web-ext lint` 实测结果（2026-11-04）

```powershell
cd .temp\nmbxd-EX-Extension-Firefox
npx --yes web-ext lint --source-dir . --output=json
```

| 结果 | 数量 | 说明 |
|---|---|---|
| **errors** | **0** | 清单与 API 使用均通过 Firefox 校验 |
| warnings | 53 | 49×`UNSAFE_VAR_ASSIGNMENT`（动态 `innerHTML`）、2×`DANGEROUS_EVAL`、1×`INLINE_SCRIPT`、1×`KNOWN_LIBRARY` —— **全部来自用户脚本正文/vendor（Chrome 版同样存在）**，非本次移植引入 |
| notices | 1 | `MISSING_DATA_COLLECTION_PERMISSIONS` |

**数据收集声明（已补，且有一个必须知道的版本窗口）**：

- AMO 自 **2025-11-03** 起要求新提交扩展在清单中声明：
  ```json
  "browser_specific_settings": { "gecko": { "data_collection_permissions": { "required": ["none"] } } }
  ```
- **该字段只在 Firefox 140+ 被识别**；在 **Firefox 127 及更低版本会报错**（社区实测）。
- 本仓 `strict_min_version = 128.0` 恰好避开报错区间，但 **128~139 会忽略该字段**（不报错、也不生效）。若需要覆盖 128~139 的真实数据收集提示，只能在 AMO 提交表单里单独声明（AMO 侧要求，与浏览器版本无关）。

> `required: ["none"]` 的语义是"扩展**不把数据传输出扩展到第三方**"。本扩展的用户数据（设置、浏览历史、发言历史）默认只存本地；启用 WebDAV 同步时数据传到**用户自己填写的服务器**，不属于向第三方收集。该判断仍属策略性声明，维护者如认定不同可改为具体类别。


## 8. 本仓验证结果（2026-11-04）

| 检查项 | 命令 | 结果 |
|---|---|---|
| 全量语法 | `node --check`（src/ options/ export/ scripts/ 全部 JS） | **通过**（无失败） |
| 清单 JSON | `node -e "require('./manifest.json')"` | 通过：MV3 / `background.scripts` 4 项 / gecko id / min 128.0 / 无 `key` / 无 `offscreen` 权限 |
| API 静态审计 | `node scripts/audit-firefox-apis.js` | **通过**（仅 1 条提示：`updateSessionRules` 需 ≥128，已由 strict_min_version 约束） |
| 官方校验 | `npx web-ext lint --source-dir . --output=json` | **errors: 0** / warnings: 53 / notices: 1 |
| 契约测试 | `node tests/*.test.js`（与 Chrome 版同一套） | **34 通过 / 5 失败**，5 个失败在 Chrome 版**同样失败**（既有问题，非移植引入）：`group-order-propagation`、`hot-path-guards`、`refresh-toast`、`reply-submit-refactor`、`submit-preflight`（详见下方说明） |
| 内容副本字节一致 | `fc /b` / md5 | 与 `.temp\nmbxd-EX-for-edit.user.js`、Chrome 版内容副本、两处 QwQNT 副本**同一哈希** `568db6e78486727d51ecfdd319d07e9a` |
| 元数据链 | `node scripts/sync-userscript-meta.js` | 用户脚本 `@version` = manifest = update.json = gm-compat |

> 移植过程中**专门改造过**的两条测试（其余 27 条原样复用）：
> - `tests/image-context-menu.test.js`：断言目标由 `offscreen/offscreen.js` 改为 `src/background/dom-jobs.js`，并新增"后台失败 → 内容脚本 `xdex:clipboard-write` 回退"的契约；
> - `tests/thread-export.test.js`：沙箱桩 `sendToOffscreen` → `runBackgroundDomJob`，清单断言改为"**不得**含 offscreen 权限 + 必须有 `gecko.id` + `background.scripts` 必须加载 dom-jobs.js"，并新增 `ANCHOR_DOWNLOAD_FAILED` → downloads API 回退的断言。

## 8.1 剩余差异项的替代方案与验证（2026-11-04 第二轮调研）

### A. GIF / APNG 写入剪贴板（Firefox 无原生 image/gif）

**事实**：Async Clipboard 的"已净化"格式只有 `text/plain`、`text/html`、`image/png`；`web ` 前缀的自定义格式（如 `web image/gif`）是 Chromium 104+ 的能力。Firefox 只有 `ClipboardItem`（127+，PNG 起步），**未必接受 `web image/gif`**。

**替代链（逐级降级，已在 `dom-jobs.js` / `clipboard-writer.js` 中实现）**：

1. `image/gif` 直写（能成则成）；
2. `web image/gif` + `text/html`（含 `<img src>`）+ `text/plain`（URL）；
3. `text/html` + `text/plain`（**Firefox 最可能命中的一档**：粘到网页编辑器里仍是动图，粘到聊天软件至少是链接）；
4. 选区 + `execCommand('copy')` 写入 HTML；
5. 纯文本 URL。

**验证（页面控制台）**：

```js
(() => ({
  ClipboardItem: typeof ClipboardItem,
  supportsFn: typeof (window.ClipboardItem && ClipboardItem.supports),
  supports: (() => {
    try {
      return ['image/gif', 'web image/gif', 'web image/png', 'image/png', 'text/html']
        .map((t) => t + '=' + (typeof ClipboardItem.supports === 'function' ? ClipboardItem.supports(t) : 'n/a'))
        .join(', ');
    } catch (e) { return String(e); }
  })(),
  clipboardWrite: !!(navigator.clipboard && navigator.clipboard.write)
}))()
```

预期：Firefox 上 `supportsFn` 多为 `undefined`（→ 代码走"乐观尝试 + 失败回退"），最终落在第 3 档；Chrome 上 `ClipboardItem.supports('image/png')` 为 true。

### B. AMO 数据收集声明（已补，但有版本窗口）

见 §7.1：字段仅在 **Firefox 140+** 识别，**≤127 会报错**，128~139 忽略。本仓 `strict_min_version = 128.0` 避开报错区间；若要把支持面下探到 128~139，只能依赖 AMO 提交表单里的声明（AMO 侧要求与浏览器版本无关）。

### C. host 权限未授予时"静默失效"

**事实**：Firefox MV3 的 host 权限默认可选；未授予时 DNR 的 `modifyHeaders` **加了规则也不生效**（社区实例：表现为"请求头没变"），跨域 fetch 同样失败。

**替代（引导用户授予）**：

- 方案 1（推荐、零权限）：设置页检测实际能力并提示"点扩展图标 → 始终允许在 <站点>"；
- 方案 2（需清单声明）：把 host 放进 `optional_host_permissions`，在**用户手势**里调用 `browser.permissions.request({ origins: [...] })`，成功后自动刷新生效。

**验证**：真实授予状态请在 `about:addons → 本扩展 → 权限` 查看；也可在**后台页控制台**执行：

```js
chrome.permissions.getAll().then((p) => console.log('origins:', p.origins, 'permissions:', p.permissions));
```

### D. 后台事件页可能被挂起

**事实**：Firefox MV3 事件页空闲会被卸载。本仓后台有 3 个内存态：`xdexExportRuntime`（取消控制器）、`xdexExportQueue`（排队）、`xdexExportDirHandles`（目录句柄）。

**替代/兜底（已存在）**：任务状态持久化在 `storage.local`（键 `xdex-export-tasks`）+ `alarms`（每分钟）唤醒 `xdexExportResumeTasks()`；被挂起后由 alarm 或下一次事件重新拉起继续跑。

**已知不可恢复项**：进行中的 `fetch`（AbortController 随页面卸载丢失）与"目录句柄"（需再次用户手势才能重新选择）。已列为限制。

**验证（后台页控制台）**：

```js
chrome.alarms.getAll().then((a) => console.log('alarms:', a));
chrome.storage.local.get('xdex-export-tasks').then((o) => console.log('tasks:', o));
```

### E. 下载文件名保真（锚点 vs downloads API）

**事实**：锚点下载能保证文件名，但要求有可用的文档上下文；事件页被挂起或策略限制时可能失败。

**替代（已实现）**：`dom-jobs` 返回 `ANCHOR_DOWNLOAD_FAILED` → 调用方回退 `xdexExportSwDownload`（`downloads.download` + `conflictAction:'uniquify'`）。此时文件名可能被浏览器改写为 UUID（与 Chrome 版注释里记录的同一现象）。

**验证**：导出一次小串，检查下载目录中的文件名是否与标题一致；若为 UUID 则说明走了回退路径。

### F. 新增契约测试：`tests/dom-jobs.test.js`

把 `dom-jobs.js` **全文放进 vm 沙箱执行**（补齐 DOM / 剪贴板 / OffscreenCanvas 桩），直接调用真实函数，
覆盖 5 个场景（`node tests/dom-jobs.test.js`，实测全部通过）：

| 场景 | 模拟能力 | 期望 | 实测 |
|---|---|---|---|
| 1 | 拒绝 `image/gif` 与 `web image/*`（Firefox 典型） | 降级到 `html+plain` | `image/gif → web image/gif+html+plain → text/html+text/plain` → **html+plain** ✓ |
| 2 | 接受 `image/gif` | 直写 `image/gif` | ✓ |
| 3 | 文本复制 | `writeText` | method = `url` ✓ |
| 4 | 扁平文件名导出 | 锚点下载成功 | `{ok:true, filename:'thread.md'}` ✓ |
| 5 | 含子目录文件名 | 拒绝并交回 downloads API | `{ok:false, error:'SUBDIR_NOT_SUPPORTED'}` ✓ |

该用例为 Firefox 版专有（Chrome 版无 offscreen 替换需求，故不收录）。

### H. 运行时身份标识（`chrome-*` → `chrome-*` / `firefox-*` 成对，行为等同）

**目标**：Firefox 版在日志/导出/内部分流里不再冒用 `chrome-*` 名字，而且**任何分流结果都必须与 Chrome 版一致**。

#### H.1 命名规则（脚本端 `getXDexRuntimeInfo()`）

| kind | 判定 | packaged |
|---|---|---|
| `qwqnt` | QwQNT 桥 / `GM_info.scriptHandler === 'qwqnt-electron'` / `__xdexRuntime.storage === 'electron-localStorage'` | true |
| `chrome-extension` / `firefox-extension` | `chrome.runtime.id` 存在，**且当前上下文可见** `chrome.declarativeNetRequest.updateSessionRules` | true |
| `chrome-extension-limited` / `firefox-extension-limited` | 有 `chrome.runtime`（或 `__xdexRuntime.kind === 'extension'`）但没有可用 DNR | true |
| `userscript` | 其余 | false |

浏览器家族 `XDEX_BROWSER_FAMILY`：UA 含 `Firefox/` → `firefox`；否则若只有 `browser.runtime.id` 而没有
`chrome.runtime.id` 也算 `firefox`（兜底派生/改 UA 的宿主）。返回值新增 `browser` 字段（`chrome` / `firefox` / `electron`）。

#### H.2 为什么必须同时改分支判定

原来有 2 处按 `kind === 'chrome-extension'` / `'chrome-extension-limited'` 分流、7 处按
`kind === 'extension' || packaged` 判定。**只改名字不改判定**会让 Firefox 版掉进最后一个兜底分支
（临时切换 `document.cookie`），而不是 Chrome 版用的 cookie 容器接口替换 —— 这就是必须成对修改的原因。

现在的唯一判定入口：

| 辅助函数 | 语义 | 覆盖 |
|---|---|---|
| `isXDexExtensionKind(kind)` | 是不是扩展（两种浏览器） | `chrome-extension`、`chrome-extension-limited`、`firefox-extension`、`firefox-extension-limited` |
| `isXDexDnrExtensionKind(kind)` | 走 DNR 的扩展 | `chrome-extension`、`firefox-extension` |
| `isXDexLimitedExtensionKind(kind)` | 没有 DNR 的扩展 | `chrome-extension-limited`、`firefox-extension-limited` |
| `isXDexPackagedRuntime(rt)` | 打包运行时（扩展 / QwQNT / 声明式扩展） | `packaged === true` 或 `kind === 'extension'` 或 `isXDexExtensionKind(kind)` |

改动点：单例压制 `shouldExitForXDexSingleton`（原来 `kind !== 'extension' && !packaged`，现在 `!isXDexPackagedRuntime(rt)`）、
自定义饼干两条分支、更新检查存储键/请求源/来源映射、图片右键菜单、串链接右键菜单。

#### H.3 脚本端压制（与 Chrome 版同一条链路）

`page-bridge.js`（`world:"MAIN"`，`run_at:"document_start"`，Firefox 128+ 支持）写入
`documentElement.dataset.xdexSingletonOwner = 'extension'`；脚本端 `shouldExitForXDexSingleton()` 看到
`owner === 'extension'` 且自己不是打包运行时 → 直接退出。两个清单的 `content_scripts` 顺序完全一致
（Firefox 仅多一个 `clipboard-writer.js`），所以压制时机相同。

#### H.4 扩展端声明（`gm-compat.js`）

```js
root.__xdexRuntime = root.__xdexRuntime || {
  kind: 'extension',
  browser: isFirefoxHost ? 'firefox' : 'chrome',
  storage: (isFirefoxHost ? 'browser' : 'chrome') + '.storage.local',
  ...
};
```

`isFirefoxHost` 与脚本端用同一套 UA/API 探测；两个构建的 `gm-compat.js` **仍字节相同**（`fc /b` 无差异），
仅运行时结果不同。

#### H.5 实测：内容脚本看不到 `declarativeNetRequest` → 判定改用清单声明

Chrome 官方文档《Content scripts》明确列出内容脚本可直接访问的扩展 API 只有
`dom`、`i18n`、`storage`、`runtime.{id,getURL,getManifest,sendMessage,connect,onMessage,onConnect}`。
**`declarativeNetRequest` 不在其中**（Firefox 同样只在后台/扩展页暴露）。真机（Chrome 138）实测：
隔离世界里 `typeof chrome.declarativeNetRequest === "undefined"`、`Object.keys(chrome)` 只有
`dom/extension/i18n/runtime/storage`。

因此判定不再依赖"API 可见性"，而是读**清单声明**（`runtime.getManifest().permissions`，内容脚本可用）：

| 修正前 | 修正后 |
|---|---|
| `hasDnr = 可见 API` → 扩展内恒为 `false` → kind 恒为 `*-extension-limited` → **DNR 分支永不可达** | `hasDnr = 可见 API \|\| 清单声明 \`declarativeNetRequest\`/\`declarativeNetRequestWithHostAccess\`` → kind 为 `chrome-extension` / `firefox-extension`，真正走 DNR |

规则由**后台**安装，"后台有没有能力"才是关键，所以以清单声明为准是正确的口径；拿不到清单时才退回 API 可见性判断。

**真机验证**（Chrome 138 + 本扩展，CDP 观测）：

| 项 | 实测 |
|---|---|
| 内容脚本 `[runtime]` | `chrome-extension`（`hasDnrApi: false`、`hasDnrDeclared: true`） |
| 走扩展自身消息链路装规则 | `{ok:true}`；`getSessionRules()` = 9101/9102：`modifyHeaders` `set cookie = userhash=…`，`urlFilter` 为两个发帖端点、`requestMethods:['post']`、`resourceTypes:['xmlhttprequest']` |
| 实际发出的请求（`Network.requestWillBeSentExtraInfo`） | 未开规则：`PHPSESSID=…; _ga=…`（站点自身饼干）；开启后：**仅** `userhash=PROBE_ONLY`；关闭后规则清空 |

**两条实测坑（已写进后台实现）**：

1. `getSessionRules()` 报告规则存在 **≠** 规则生效 —— `modifyHeaders` 需要**已授予的站点访问权限**，
   否则规则静默不生效（后果是带着站点饼干发帖 = 用错身份）。故后台新增：
   - `ensureXdexHostPermissionForRules()`：权限守卫，不通过就直接报错（内容脚本随即退回 cookie 容器接口替换）；
   - `verifyXdexPostRulesApplied()`：加规则后用 `getSessionRules()` 复核落地，未落地则移除并报错。
   这条对 Firefox 尤其重要：MV3 的站点访问权限默认可选，`about:debugging` 临时安装不会自动授予。
2. 权限查询**不能用自造的 `*://*.domain/*`**：http/https 分别授权，`*://` 不是 `https://` 的子集，
   `permissions.contains` 会假阴性（实测 `contains({origins:['*://*.nmbxd1.com/*']}) === false`，
   而用清单声明模式 `https://*.nmbxd1.com/*` 查为 `true`）→ 必须用清单里声明的模式，并在为否时用
   `permissions.getAll()` 的宽泛授权（`https://*/*`）复核一次，避免把可用路径误判为不可用。

#### H.6 契约测试 `tests/runtime-identity.test.js`（13 项全过）

用 vm 沙箱抽出脚本端 `tag 0` 的识别段 + 单例压制函数，注入 UA / `chrome` / `browser` / `__xdexRuntime` 桩：

| 用例 | 断言 |
|---|---|
| Chrome 内容脚本 + 清单声明 DNR | `chrome-extension`，`hasDnrDeclared=true`、`hasDnrApi=false`、`packaged=true`、`browser='chrome'` |
| Chrome 内容脚本 + 清单**无** DNR | 退回 `chrome-extension-limited`（走 cookie 容器接口替换） |
| Firefox 内容脚本 + 清单声明 DNR | `firefox-extension`，`browser='firefox'` |
| Firefox 内容脚本 + 清单**无** DNR | 退回 `firefox-extension-limited` |
| 无 Firefox UA 只有 `browser.runtime.id` | 仍识别为 `firefox` |
| 假设内容脚本可见 DNR（无清单） | 仍为 `chrome-extension` / `firefox-extension`（API 这条判定保留） |
| 声明式 `__xdexRuntime.kind === 'extension'` | 按家族给出 `firefox-extension-limited` / `chrome-extension-limited` |
| userscript / QwQNT | `userscript`（packaged=false）/ `qwqnt`（packaged=true, browser=electron） |
| 四个辅助函数对称性 | 两种前缀的返回值逐一相等 |
| 单例压制 | 脚本端退出、扩展自身不退出、无 owner 时正常运行（两个家族各测一遍） |
| 源码残留 | 不允许再出现 `kind === 'chrome-extension'` / `kind === 'extension' || packaged` |
| `gm-compat` | 必须声明 `browser` 与随宿主变化的 `storage` 命名 |
| 后台 DNR 守卫 | 顺序必须是"权限守卫 → 加规则 → `getSessionRules` 落地校验 → ok"；权限查询必须用清单声明模式（禁止自造 `*://`）且含 `getAll()` 复核 |

**实测结果**：Firefox 测试集 **34 通过 / 5 失败**；Chrome 版 **33 通过 / 5 失败**（差额 1 为 Firefox 专有的 `dom-jobs.test.js`），两边失败的 5 个用例**完全相同**。
Chrome 测试集同名用例同样通过。

### I. 本轮已实测的结论汇总

| 项 | 实测方式 | 结果 |
|---|---|---|
| `data_collection_permissions` 是否消除 lint 提示 | `web-ext lint` 前后对比 | notice `MISSING_DATA_COLLECTION_PERMISSIONS` **消失**；新增 2 条 `KEY_*_UNSUPPORTED_BY_MIN_VERSION`（该字段仅在 140+ 识别，属预期，已在 §7.1 记录） |
| 该告警是否由 `content_scripts.world: "MAIN"` 引起 | 临时移除 `world` 后重跑 lint | **否**（移除后同样存在）→ 确认来自 `data_collection_permissions`，已还原 manifest |
| 审计脚本能否拦住"漏声明数据收集" | 临时删除该字段后运行审计 | **退出码 1** 并报"缺少 …data_collection_permissions.required"；还原后退出码 0 → 审计具备负向能力 |
| 剪贴板降级链是否真的按预期回退 | `tests/dom-jobs.test.js`（vm 沙箱跑真实代码） | 见 §8.1-F：5/5 通过 |
| 全量测试 | `node tests/*.test.js` | **34 通过 / 5 失败**（5 个失败与 Chrome 版完全相同，非移植引入） |
| 清单结构与 gecko 字段 | `node -e` 解析 + 审计脚本 | `background.scripts` × 4、`gecko.id`、`strict_min_version 128.0`、`data_collection_permissions.required=["none"]` |
| Chrome 版未被影响 | 文件级 diff | 仅 Firefox 目录新增 4 文件、删除 2 文件；Chrome 目录哈希未变 |

## 9. 待真机验证清单（本仓已实现但未在 Firefox 实测）
（本仓已实现但未在 Firefox 实测）

1. 后台页写剪贴板：右键图片 → 「X岛-EX：复制GIF/APNG」；若后台被拒应自动回退内容脚本（看后台控制台的 `[X岛-EX Extension 图片菜单]` stage 日志）。
2. 导出下载：设置/导出页触发导出 → 文件名是否为预期（锚点路径），失败时应回退 downloads API（文件名可能被浏览器改写）。
3. 自定义饼干发帖（Chrome 侧已实测通过，Firefox 侧待验）：确认站点访问权限已授予后，POST `doReplyThread.html` / `doPostThread.html` 的 `Cookie` 头应被改写成**且仅为** `userhash=<所选饼干>`（规则 id 9101/9102，用完即删）。
   Chrome 实测口径：`Network.requestWillBeSentExtraInfo` 里未开规则为 `PHPSESSID=…`，开启后为 `userhash=PROBE_ONLY`。
   若权限未授予：后台会返回 `ok:false`（含提示），脚本自动退回 cookie 容器接口替换，**不会**静默用站点身份发帖。
4. `world: "MAIN"` 桥接：页面主世界能否收到 `xdex:*` 事件（`page-bridge.js`）。
5. 浏览器重启后：历史/设置/导出任务是否保留（`storage.local` 语义一致，预期保留）；事件页被挂起后 alarm 续跑导出任务是否正常。
6. 运行时标识：看内容脚本启动日志里的 `[runtime]:` 行，期望
   `kind: 'firefox-extension'`（清单声明了 `declarativeNetRequest`）、`browser: 'firefox'`、`packaged: true`、
   `hasDnrDeclared: true`、`hasDnrApi: false`。若为 `firefox-extension-limited`，说明清单里没有 DNR 权限声明。
   自检：`chrome.runtime.getManifest().permissions` 应含 `declarativeNetRequest`。
7. 脚本端压制：同站点同时装 Tampermonkey 脚本 + 本扩展，页面 `documentElement.dataset` 应含单例 owner 标记，
   且控制台只有一份 `[xdex]` 启动日志（脚本端已让位）。
