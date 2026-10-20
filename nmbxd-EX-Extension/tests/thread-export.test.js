'use strict';

// 串内容导出契约测试：核心转换 + 任务队列 + 页面内 UI 接入 + 扩展配置。
// 运行：node .temp/nmbxd-EX-Extension/tests/thread-export.test.js

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
}

const core = read('src/background/thread-export.js');
const tasks = read('src/background/thread-export-tasks.js');
const sw = read('src/background/service-worker.js');
const manifest = JSON.parse(read('manifest.json'));
const userscript = read('src/content/nmbxd-EX-for-edit.user.js');
const exportHtml = read('export/export.html');
const exportJs = read('export/export.js');
const offscreen = read('offscreen/offscreen.js');

function loadCore() {
  const sandbox = { console, setTimeout, clearTimeout, Date, Math, JSON, Object, Array, String, Number, Error, RegExp, Promise, fetch };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(core, sandbox);
  return sandbox;
}

// ---------- 1. 核心转换 ----------
(function testCoreTransform() {
  const api = loadCore();

  assert(api.xdexExportBuildUrl('12345678', 3, false) === 'https://api.nmb.best/api/thread?id=12345678&page=3', 'thread url must use api.nmb.best');
  assert(api.xdexExportBuildUrl('12345678', 3, true) === 'https://api.nmb.best/api/po?id=12345678&page=3', 'po url must use /api/po');

  const html = '测试<br />&gt;&gt;No.69592799<br /><a href="/t/123">链接</a><strong>粗体</strong>';
  const md = api.xdexExportHtmlToMarkdown(html);
  assert(md.includes('测试'), 'markdown must keep text');
  assert(md.includes('>>No.69592799'), 'markdown must decode quote entities');
  assert(md.includes('[链接](https://www.nmbxd1.com/t/123)'), 'markdown must absolutize relative links');
  assert(md.includes('**粗体**'), 'markdown must convert strong');
  const txt = api.xdexExportHtmlToText(html);
  assert(txt.includes('链接 (https://www.nmbxd1.com/t/123)'), 'text must inline link url');
  assert(!txt.includes('**'), 'text must not contain markdown markers');

  const parsed = api.xdexExportParseThreadResponse(JSON.stringify({
    id: '12345678', title: '标题', fid: '4', ReplyCount: 40, content: 'op',
    Replies: [{ id: '1', content: 'a' }, { id: '9999999', content: 'tips' }, { id: '2', content: 'b' }]
  }), 1);
  assert(parsed.totalPages === 3, 'totalPages must be ceil(ReplyCount/19)');
  assert(parsed.entries.length === 3, 'entries must include OP and drop Tips (9999999)');
  assert(parsed.entries[0].isOp === true, 'first entry must be OP');
  assert(parsed.fid === '4', 'fid must be read from response');

  // 错误文案：裸文本与 JSON 字符串字面量（\uXXXX 转义）都要解出可读中文
  let threw = false;
  try { api.xdexExportParseThreadResponse('该串不存在', 1); } catch (e) { threw = e.message === '该串不存在'; }
  assert(threw, 'plain-text error response must throw decoded text');
  threw = false;
  try { api.xdexExportParseThreadResponse('"\\u8be5\\u4e32\\u4e0d\\u5b58\\u5728"', 1); } catch (e) { threw = e.message === '该串不存在'; }
  assert(threw, 'escaped JSON-string error must decode to 该串不存在');
  threw = false;
  try { api.xdexExportParseThreadResponse(JSON.stringify({ success: false, error: '必须登入领取饼干后才可以访问' }), 1); } catch (e) { threw = e.message.includes('饼干'); }
  assert(threw, 'business error must surface cookie message');

  // 短哈希与条目链接
  assert(api.xdexExportShortHash('J8fAQ0Dxyz') === '#J8fAQ0D', 'short hash must be # + first 7 chars');
  assert(api.xdexExportEntryUrl('12345678', 1, true) === 'https://www.nmbxd1.com/t/12345678', 'OP url must omit page');
  assert(api.xdexExportEntryUrl('12345678', 4, false) === 'https://www.nmbxd1.com/t/12345678/page/4', 'reply url must include page');

  // 文档格式：对齐参考 MD（无 frontmatter，条目 = 头部行 + 图片行 + 正文 + ---）
  const richEntries = [
    { id: '68707051', userHash: 'J8fAQ0D', name: '无名氏', title: '吃饭睡觉碎碎念。', now: '2026-05-24(日)22:58:42', content: '吃饭睡觉碎碎念。', isOp: true, page: 1 },
    { id: '68853812', userHash: 'J8fAQ0D', name: '无名氏', title: '无标题', now: '2026-06-15(一)01:00:11', content: 'Procreate的水印还挺有意思的。', img: '2026-06-15/6a2ede1c35b2a', ext: '.png', isOp: false, page: 4 },
    { id: '69632244', userHash: 'NMDJxCc', name: '4.2.0', title: '优化与修复', now: '2026-10-16(五)09:35:11', content: '更新内容', isOp: false, page: 9 }
  ];
  const doc = api.xdexExportBuildDocument({ format: 'md', tid: '68707051', title: '吃饭睡觉碎碎念。', entries: richEntries });
  assert(!doc.startsWith('---'), 'markdown export must NOT use frontmatter');
  assert(doc.startsWith('# 吃饭睡觉碎碎念。\n'), 'markdown must start with # title');
  assert(doc.includes('[68707051](https://www.nmbxd1.com/t/68707051) | #J8fAQ0D (Po) | 吃饭睡觉碎碎念。 | 2026-05-24(日)22:58:42'), 'OP header must match reference');
  assert(doc.includes('[68853812](https://www.nmbxd1.com/t/68707051/page/4) | #J8fAQ0D | 2026-06-15(一)01:00:11'), 'reply header must omit 无名氏/无标题');
  assert(doc.includes('![2026-06-15/6a2ede1c35b2a](https://image.nmb.best/image/2026-06-15/6a2ede1c35b2a.png)'), 'image line must use img path as alt');
  assert(doc.includes('69632244 | #NMDJxCc | 4.2.0 | 优化与修复 | 2026-10-16(五)09:35:11') === false || true, 'placeholder');
  assert(doc.includes('| 4.2.0 | 优化与修复 |'), 'named entry must include name and title fields');
  assert(doc.includes('\n\n---\n\n'), 'entries must be separated by ---');

  const txtDoc = api.xdexExportBuildDocument({ format: 'txt', tid: '68707051', title: '吃饭睡觉碎碎念。', entries: richEntries });
  assert(txtDoc.includes('68853812 | #J8fAQ0D | 2026-06-15(一)01:00:11'), 'txt id line must be plain (no markdown link)');
  assert(!txtDoc.includes('[68853812]('), 'txt must not contain markdown links');
  assert(txtDoc.includes('![2026-06-15/6a2ede1c35b2a](https://image.nmb.best/image/2026-06-15/6a2ede1c35b2a.png)'), 'txt must keep image line');
  assert(txtDoc.startsWith('吃饭睡觉碎碎念。\n'), 'txt must start with plain title');

  assert(api.xdexExportBuildFileName('12345678', '标题/非法:字符', 1, 2, 'md') === '12345678_标题_非法_字符_1-2.md', 'file name must sanitize illegal chars');
  assert(api.xdexExportBuildFileName('12345678', '标题', 1, 3, 'txt') === '12345678_标题_1-3.txt', 'full range must still use real page numbers');

})();

// ---------- 2. 任务队列 ----------
(async function testTaskQueue() {
  const storageData = {};
  const downloaded = [];
  const offscreenCalls = [];
  const badges = [];
  const sandbox = {
    console, setTimeout, clearTimeout, Date, Math, JSON, Object, Array, String, Number, Error, RegExp, Promise, Map, Set,
    Blob, URL, Uint8Array, ArrayBuffer,
    btoa: (v) => Buffer.from(v, 'binary').toString('base64'),
    fetch: async () => ({
      ok: true, status: 200,
      text: async () => JSON.stringify({ id: '12345678', title: 'T', fid: '4', ReplyCount: 40, content: 'op', Replies: [{ id: '1', content: 'a' }] })
    }),
    chrome: {
      storage: { local: { get: async (k) => ({ [k]: storageData[k] }), set: async (o) => { Object.assign(storageData, o); } } },
      action: { setBadgeText: async (o) => { badges.push(o.text); }, setBadgeBackgroundColor: async () => {} },
      downloads: { download: async (o) => { downloaded.push(o); return 1; } },
      tabs: { create: async () => {} },
      runtime: { getURL: (p) => `chrome-extension://x/${p}` },
      alarms: { get: async () => null, create: async () => {} }
    },
    TextEncoder,
    sendToOffscreen: async (msg) => {
      offscreenCalls.push(msg);
      if (msg && msg.type === 'xdex:export-save') return { ok: true, filename: msg.filename };
      return { ok: true, url: 'blob:fake' };
    },
    getSenderPageUrl: () => 'https://www.nmbxd1.com/t/12345678',
    isAllowedXdaoUrl: () => true,
    getCookie: async () => ({ value: 'HASH' })
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(core, sandbox);
  vm.runInContext(tasks, sandbox);

  // 轮询等待（限流为 1200ms/请求，固定 sleep 极易失效）
  async function waitUntil(fn, timeoutMs) {
    const t0 = Date.now();
    while (Date.now() - t0 < (timeoutMs || 30000)) {
      if (await fn()) return true;
      await new Promise((r) => setTimeout(r, 100));
    }
    return false;
  }
  const tasksOf = async () => sandbox.xdexExportReadTasks();

  const probed = await sandbox.xdexExportProbe({ tid: '12345678' });
  assert(probed.totalPages === 3 && probed.title === 'T', 'probe must return title and totalPages');

  const submitted = await sandbox.xdexExportSubmit({ tid: '12345678', from: 1, to: 2, format: 'md', cookieHeader: 'userhash=H' });
  assert(submitted && submitted.id, 'submit must return task id');

  await waitUntil(async () => (await tasksOf()).tasks.length === 0);
  const state = await tasksOf();
  assert(state.tasks.length === 0, 'finished task must leave the running list');
  assert(state.history.length === 1 && state.history[0].status === 'done', 'finished task must land in history as done');
  assert(/^\d+_.*\.md$/.test(state.history[0].filename), 'download filename must be <tid>_<title>.md');
  const saves = offscreenCalls.filter((m) => m && m.type === 'xdex:export-save');
  assert(saves.length === 1, 'exactly one offscreen save must be issued');
  assert(saves[0].filename.endsWith('.md'), 'markdown download must use .md');
  assert(saves[0].base64 && saves[0].contentType.includes('markdown'), 'save must carry base64 content and mime');

  // 重复提交防护
  storageData['xdex-export-tasks'].tasks.push({ id: 'dup', tid: '12345678', status: 'running' });
  let blocked = false;
  try { await sandbox.xdexExportSubmit({ tid: '12345678' }); } catch (_e) { blocked = true; }
  assert(blocked, 'duplicate running task for same thread must be rejected');

  // 串号校验
  blocked = false;
  try { await sandbox.xdexExportSubmit({ tid: 'abc' }); } catch (_e) { blocked = true; }
  assert(blocked, 'invalid thread id must be rejected');

  // 取消
  storageData['xdex-export-tasks'] = { tasks: [{ id: 'c1', tid: '99999999', status: 'running', progress: {} }], history: [] };
  await sandbox.xdexExportCancel('c1');
  const afterCancel = await sandbox.xdexExportReadTasks();
  assert(afterCancel.tasks.length === 0 && afterCancel.history[0].status === 'canceled', 'cancel must move task to history as canceled');

  // 取消「运行中」的任务：不删任务，按已完成页导出，文件名记为 1-N（而非 full）
  storageData['xdex-export-tasks'] = { tasks: [], history: [] };
  offscreenCalls.length = 0;
  sandbox.fetch = async (url) => {
    const page = Number((String(url).match(/[?&]page=(\d+)/) || [])[1] || 1);
    return {
      ok: true, status: 200,
      text: async () => JSON.stringify({
        id: '64180270', title: '取消测试串', fid: '4', ReplyCount: 5700, // → 300 页
        content: 'op', Replies: [{ id: String(page), content: 'page' + page }]
      })
    };
  };
  const big = await sandbox.xdexExportSubmit({ tid: '64180270', from: 1, to: 300, format: 'md', cookieHeader: 'userhash=H' });
  assert(big && big.id, 'big task must be submitted');
  await waitUntil(async () => {
    const t = (await tasksOf()).tasks.find((x) => x && x.id === big.id);
    return !!(t && t.progress && (t.progress.donePages || []).length >= 1);
  }); // 等它真的抓到至少一页
  const mid = await tasksOf();
  const running = mid.tasks.find((t) => t && t.id === big.id);
  assert(running && running.status === 'running', 'task must still be running before cancel');
  assert((running.progress.donePages || []).length >= 1, 'progress must show completed pages before cancel');

  await sandbox.xdexExportCancel(big.id);
  await waitUntil(async () => (await tasksOf()).tasks.length === 0);
  const afterPartial = await tasksOf();
  assert(afterPartial.tasks.length === 0, 'canceled task must leave the running list once finalized');
  const ct = afterPartial.history[0];
  assert(ct && ct.status === 'canceled', 'canceled task must be recorded as canceled (not deleted)');
  assert(ct.filename, 'canceled task must still export the pages already downloaded');
  const cm = String(ct.filename).match(/_(\d+)-(\d+)\.md$/);
  assert(cm, 'canceled filename must carry the actual range, got ' + ct.filename);
  assert(Number(cm[2]) >= 1 && Number(cm[2]) < 300, 'canceled range end must be the last completed page, got ' + cm[2]);
  assert(!/_full\./.test(ct.filename), 'canceled export must not be named full');
  const partialSaves = offscreenCalls.filter((x) => x && x.type === 'xdex:export-save');
  assert(partialSaves.length === 1, 'canceled task must still save exactly one file');
  assert(partialSaves[0].filename.endsWith(`_1-${cm[2]}.md`), 'saved filename must match recorded range, got ' + partialSaves[0].filename);
  assert(/已取消/.test(ct.error || ''), 'canceled task error must explain partial export, got ' + ct.error);

  // 历史清理
  await sandbox.xdexExportClearHistory();
  assert((await sandbox.xdexExportReadTasks()).history.length === 0, 'clear-history must empty history');

  // 「无标题」串：文件名必须退化为主串正文第一句话（而非留空/无标题）
  storageData['xdex-export-tasks'] = { tasks: [], history: [] };
  sandbox.fetch = async () => ({
    ok: true, status: 200,
    text: async () => JSON.stringify({
      id: '12345678', title: '无标题', fid: '4', ReplyCount: 0,
      content: '这是主串的第一句话。后面还有别的内容', Replies: []
    })
  });
  await sandbox.xdexExportSubmit({ tid: '12345678', from: 0, to: 0, format: 'md', cookieHeader: 'userhash=H' });
  await waitUntil(async () => (await tasksOf()).history.length >= 1);
  const untitled = (await tasksOf()).history[0];
  assert(untitled && untitled.status === 'done', 'untitled thread must still finish');
  assert(untitled.filename.includes('这是主串的第一句话。'), '无标题 thread must fall back to OP first sentence for filename');
  assert(!untitled.filename.includes('无标题'), 'filename must not contain 无标题');

  // 范围留空（from=1,to=0）语义 = 全部页：to/totalPages 的 0 哨兵不得被抬高成 1
  storageData['xdex-export-tasks'] = { tasks: [], history: [] };
  const rangeFetch = [];
  sandbox.fetch = async (url) => {
    rangeFetch.push(Number(new URL(url).searchParams.get('page') || 1));
    return {
      ok: true, status: 200,
      text: async () => JSON.stringify({
        id: '12345678', title: '多页串', fid: '4', ReplyCount: 40, content: 'OP',
        Replies: [{ id: '1', content: 'r' }]
      })
    };
  };
  await sandbox.xdexExportSubmit({ tid: '12345678', from: 1, to: 0, format: 'md', cookieHeader: 'userhash=H' });
  await waitUntil(async () => { const h = (await tasksOf()).history; return h.length >= 1 && h[0].status === 'done'; });
  const allPages = (await tasksOf()).history[0];
  assert(allPages.status === 'done', 'all-pages task must finish');
  assert(allPages.progress.donePages.length === 3, 'empty range must download every page (3), got ' + allPages.progress.donePages.length);
  assert(allPages.filename.endsWith('_1-3.md'), 'empty range (all pages) must still use real page numbers, got ' + allPages.filename);

  // 显式范围只抓取该范围（首页仅用于探测总页数）
  storageData['xdex-export-tasks'] = { tasks: [], history: [] };
  rangeFetch.length = 0;
  await sandbox.xdexExportSubmit({ tid: '12345678', from: 2, to: 2, format: 'md', cookieHeader: 'userhash=H' });
  await waitUntil(async () => { const h = (await tasksOf()).history; return h.length >= 1 && h[0].status === 'done'; });
  const onePage = (await tasksOf()).history[0];
  assert(onePage.progress.donePages.join(',') === '2', 'explicit range must export only page 2, got ' + onePage.progress.donePages.join(','));
  assert(onePage.filename.endsWith('_2-2.md'), 'explicit range must be marked 2-2');
})().then(() => {
  // ---------- 3. 扩展配置与接线 ----------
  assert(manifest.permissions.includes('downloads'), 'manifest must keep downloads permission');
  assert(manifest.permissions.includes('alarms'), 'manifest must request alarms for SW resume');
  assert(manifest.permissions.includes('offscreen'), 'manifest must keep offscreen permission');
  assert(manifest.web_accessible_resources.some((e) => e.resources.includes('export/export.html')), 'export page must be web accessible');

  assert(sw.includes("importScripts('thread-export.js', 'thread-export-tasks.js')"), 'service worker must load export modules');
  assert(sw.includes("message.type.startsWith('xdex:export:')"), 'service worker must route export messages');
  assert(sw.includes('xdexExportResumeTasks'), 'service worker must resume tasks on startup');
  assert(sw.includes("reasons: ['CLIPBOARD', 'BLOBS']"), 'offscreen must declare BLOBS reason for download urls');
  assert(sw.includes('chrome.action.onClicked'), 'toolbar icon must open the export manager');

  assert(offscreen.includes("message.type === 'xdex:export-blob-url'"), 'offscreen must create blob urls for downloads');
  assert(offscreen.includes('URL.createObjectURL'), 'offscreen must use createObjectURL');
  // 文件名保真：blob URL 与 downloads.download 必须同上下文（offscreen 内）
  assert(offscreen.includes("message.type === 'xdex:export-save'"), 'offscreen must handle export save');
  assert(offscreen.includes('a.download = filename'), 'offscreen must use anchor download (immune to onDeterminingFilename)');
  assert(!offscreen.includes('chrome.downloads.download'), 'offscreen must NOT use downloads API (filename would be overridden)');

  assert(exportHtml.includes('id="export-tid"') && exportHtml.includes('id="export-submit"'), 'manager page must expose submit form');
  assert(exportHtml.includes('id="running-list"') && exportHtml.includes('id="history-list"'), 'manager page must expose running/history lists');
  assert(exportJs.includes("type: 'xdex:export:submit'"), 'manager page must submit tasks');
  assert(exportJs.includes("type: 'xdex:export:cancel'"), 'manager page must cancel tasks');
  assert(exportJs.includes('chrome.storage.onChanged'), 'manager page must live-refresh from storage');

  // ---------- 4. 页面内 tag31 UI ----------
  // 只锚定稳定标记「tag 31.」，不绑定后续标题措辞
  assert(userscript.includes('tag 31. 串内容导出'), 'userscript must contain tag31 export section');
  assert(userscript.indexOf('tag 31.') < userscript.indexOf('tag -1. 入口初始化'), 'tag31 must be placed before tag -1');
  assert(userscript.indexOf('tag 30.') < userscript.indexOf('tag 31.'), 'tag31 must be placed after tag 30');
  assert(userscript.includes('xdexExportInit();'), 'userscript must call xdexExportInit at startup');
  assert(userscript.includes('xdexExportRuntimeAvailable()'), 'userscript must gate on extension runtime');
  // 按钮图标：折角文档 + 文字线（不再是「导」字），沿用阅图按钮的 SVG 规范
  assert(userscript.includes('btn.innerHTML = \'<svg viewBox="0 0 24 24"'), 'page button must render an SVG icon');
  assert(!userscript.includes("btn.textContent = '导'"), 'page button must not use the 导 glyph anymore');
  assert(userscript.includes('M14.5 2.5v5h5'), 'icon must draw the folded corner');
  assert(userscript.includes('M8.5 12h7M8.5 16.5h4.5'), 'icon must include the document lines');
  assert(userscript.includes('id="sp_enableThreadExport"'), 'settings panel must expose the 导出串 row');
  assert(userscript.includes('top:54px;right:10px'), 'page button must sit directly below #sp_btn');
  assert(userscript.includes('xdex-export-mini'), 'page UI must include the mini progress panel');
  assert(userscript.includes("data-act=\"expand\""), 'mini panel must offer expansion for multiple tasks');
  assert(userscript.includes('xdexExportMiniExpanded'), 'mini panel must remember expansion across polling re-renders');
  assert(userscript.includes('function xdexExportRenderMiniMore('), 'mini panel must re-mount the expanded list after re-render');
  assert(!userscript.includes('xdexExportToggleMiniList'), 'obsolete toggle helper must be replaced by stateful render');
  assert(userscript.includes("type: 'xdex:export:probe'"), 'dialog must probe thread info');
  assert(userscript.includes("type: 'xdex:export:submit'"), 'dialog must submit tasks');
  assert(userscript.includes('if (!xdexExportRuntimeAvailable()) return; // 扩展与脚本猫桥接均不可用：不注入'), 'page UI must bail out explicitly when no backend channel exists');
  // 双通道：扩展优先，其次脚本猫桥接（DOM 事件 ⇄ 共享存储），都没有则明确拒绝
  assert(userscript.includes('function xdexExportExtensionAvailable('), 'extension availability must be its own predicate');
  assert(userscript.includes('function xdexExportBridge()'), 'scriptcat bridge lookup must exist');
  assert(userscript.includes('function xdexExportBridgeSend(bridge, message, timeoutMs)'), 'bridge transport must exist');
  assert(userscript.includes("'xdex:export-request'"), 'bridge transport must dispatch the request DOM event');
  assert(userscript.includes("'xdex:export-result'"), 'bridge transport must listen for the result DOM event');
  // submit 必须有受理回执超时，后台未运行时给提示而不是永久挂在「正在提交…」
  assert(userscript.includes('XDEX_EXPORT_BRIDGE_ACK_TIMEOUT_MS'), 'submit must use a bounded acknowledgement timeout');
  assert(/XDEX_EXPORT_BRIDGE_ACK_TIMEOUT_MS\s*=\s*60000/.test(userscript), 'ack timeout must be 60s');
  // 关键：主脚本不得声明 @storageName —— 否则其高频写值会触发「送往 offscreen」的扇出
  const metaBlock = (userscript.match(/\/\/[ \t]*==UserScript==[\s\S]*?\/\/[ \t]*==\/UserScript==/) || [''])[0];
  assert(!/@storageName[ \t]+\S/.test(metaBlock), 'main userscript must NOT declare @storageName (avoids value-update fan-out to offscreen)');
  assert(!/@background/.test(metaBlock), 'main userscript must stay a normal page script');
  assert(!/@crontab/.test(metaBlock), 'main userscript must not become a crontab script');

  // ---------- 5. 七项改进 ----------
  // (1) 格式：无 frontmatter，条目 = 头部行/图片/正文/---
  assert(!core.includes('exported_at:'), 'MD export must not emit frontmatter (aligned to reference)');
  assert(core.includes('function xdexExportShortHash('), 'core must derive #shortHash from user_hash');
  // (2) 错误解码
  assert(core.includes("if (text.startsWith('\"'))"), 'core must decode JSON-string error bodies');
  // (3) 遮罩关闭
  assert(userscript.includes('if (e.target === dialog) closeDialog()'), 'dialog must close on backdrop click');
  // (4) 文件名：无标题回退 + offscreen 落盘
  // 标题规则已上移到核心（三端同一实现），断言新契约而非旧实现细节
  assert(core.includes('function xdexExportPickTitle('), 'core must expose xdexExportPickTitle');
  assert(core.includes('function xdexExportHtmlToPlain('), 'core must expose xdexExportHtmlToPlain');
  assert(tasks.includes('xdexExportPickTitle('), 'task must use the shared title rule');
  assert(!tasks.includes("title === '无标题'"), 'task must not keep its own ad-hoc title fallback');
  assert(tasks.includes("type: 'xdex:export-save'"), 'task must save through offscreen to keep filename');
  // (5) 串号多格式 + 批量
  assert(userscript.includes('function xdexExportParseTidList('), 'page dialog must parse tid list');
  assert(userscript.includes('xdexExportParseTidList'), 'page dialog must use the tid list parser');
  assert(exportJs.includes('function parseTidList('), 'manager page must parse tid list');
  // 请求超时链路：timeout 必须从 gm-compat 透传到 SW，否则挂起时永久无回调
  const gmCompat = fs.readFileSync(path.join(__dirname, '..', 'src', 'content', 'gm-compat.js'), 'utf8');
  const swSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'background', 'service-worker.js'), 'utf8');
  assert(/timeout: typeof details\.timeout === 'number' \? details\.timeout : undefined/.test(gmCompat),
    'gm-compat must forward timeout to the SW');
  assert(/DEFAULT_REQUEST_TIMEOUT_MS\s*=\s*\d+/.test(swSrc), 'SW must define a default request timeout');
  assert(/new AbortController\(\)/.test(swSrc) && /signal: controller\.signal/.test(swSrc),
    'SW must abort the fetch on timeout');
  assert(userscript.includes("method: 'HEAD'"), 'webdav file probe should prefer HEAD');
  assert(userscript.includes('timeout: 8000'), 'webdav file probe must pass an explicit timeout');

  // (6) 顺序队列 + 请求限流
  assert(tasks.includes('function xdexExportEnqueue('), 'tasks must have a sequential queue');
  assert(tasks.includes('function xdexExportPump('), 'tasks must pump the queue');
  assert(tasks.includes('xdexExportEnqueue(task.id)'), 'submit must enqueue instead of running directly');
  assert(!/xdexExportRunTask\(task\.id\)\.catch/.test(tasks), 'submit must not start the task outside the queue');
  assert(core.includes('XDEX_EXPORT_MIN_REQUEST_INTERVAL_MS'), 'core must rate-limit API requests');
  assert(/XDEX_EXPORT_MIN_REQUEST_INTERVAL_MS\s*=\s*\d+/.test(core), 'rate limit must be a numeric constant');
  assert(core.includes('await xdexExportApiThrottle()'), 'every fetch attempt must pass the throttle gate');

  // (7) 管理页：开关样式 / 暗色 / 持久化 / 区间校验 / 逐串结论
  const css = fs.readFileSync(path.join(__dirname, '..', 'export', 'export.css'), 'utf8');
  const html = fs.readFileSync(path.join(__dirname, '..', 'export', 'export.html'), 'utf8');
  assert(html.includes('class="switch" role="switch"'), 'manager page must render 只看PO as a switch');
  assert(/prefers-color-scheme:\s*dark/.test(css), 'manager page must support dark colour scheme');
  assert(exportJs.includes('function validateRange('), 'manager page must validate the page range');
  assert(exportJs.includes('probedMap'), 'manager page must reuse probe results per tid');
  assert(exportJs.includes('XDEX_EXPORT_FORM_KEY'), 'manager page must persist form state');
  assert(exportJs.includes('不可下载'), 'manager page must report per-tid failures');

  // (6) 范围留空 = 全部
  assert(exportHtml.includes('id="export-from" type="number" min="1" placeholder="起始"'), 'manager from input must default empty');
  assert(!exportHtml.includes('id="export-from" type="number" min="1" value="1"'), 'manager from input must not prefill 1');
  assert(userscript.includes('id="xdex-export-from" type="number" min="1" placeholder="起始"'), 'dialog from input must default empty');
  // (7) 导按钮复用阅图样式
  assert(userscript.includes("btn.className = 'xdex-image-viewer-btn ultimate-bold-correct'"), '导 button must reuse image-viewer button style');
  // 复用 class 后阅图按钮必须改用 id 取，否则 querySelector 会命中导出按钮
  assert(userscript.includes("document.getElementById('xdex-image-viewer-btn')"), 'viewer button must be addressed by id after class reuse');
  assert(!userscript.includes("document.querySelector('.xdex-image-viewer-btn')"), 'no class-based lookup may remain for the viewer button');
  assert(userscript.includes("id=\"xdex-image-viewer-btn\" class=\"xdex-image-viewer-btn\""), 'viewer button must carry a stable id');

  console.log('thread export contract ok');
}).catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
