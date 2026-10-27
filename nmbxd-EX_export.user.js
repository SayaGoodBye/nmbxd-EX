// ==UserScript==
// @name         X岛-EX · 脚本猫后台导出
// @namespace    https://github.com/SayaGoodBye/nmbxd-EX
// @version      1.0.0
// @description  接收 X岛-EX 的导出指令，在后台抓取串内容并导出为 md/txt 落盘。页面关闭后任务继续。
// @author       SayaGoodBye
// @background
// @storageName  xdex-export
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_cookie
// @grant        GM_log
// @connect      api.nmb.best
// @connect      image.nmb.best
// @connect      nmbxd1.com
// @connect      www.nmbxd1.com
// @connect      nmbxd.com
// @connect      www.nmbxd.com
// @icon         https://image.nmb.best/image/2026-06-03/6a1fcea41fad3.png
// @icon64       https://image.nmb.best/image/2026-06-03/6a1fced8e0e64.png
// ==/UserScript==

// 运行环境：脚本猫把 @background 脚本放在 offscreen document 中执行，
// 因此 Blob / URL.createObjectURL 可用；落盘走 GM_download（原生支持 blob: URL）。
//
// 通信：与「X岛-EX · 脚本猫后台导出桥接」（前台脚本）共用 @storageName，
// 经共享存储的 GM_setValue / GM_addValueChangeListener 交换请求与响应。

const REQ_KEY = 'xdex_export_req';
const RES_KEY = 'xdex_export_res';
const STATE_KEY = 'xdex_export_state';
const TASKS_KEY = 'xdex_export_tasks';

// 串内页地址（导出链接用）
// ===== 复用自 .temp/nmbxd-EX-Extension/src/background/thread-export.js 的纯函数（原样搬入，便于对照）=====
const XDEX_EXPORT_API_BASE = 'https://api.nmb.best/api';
const XDEX_EXPORT_PER_PAGE = 19;
const XDEX_EXPORT_IMAGE_BASE = 'https://image.nmb.best/image';
const XDEX_EXPORT_SITE_BASE = 'https://www.nmbxd1.com';

function xdexExportBuildUrl(tid, page, poOnly) {
  const kind = poOnly ? 'po' : 'thread';
  return `${XDEX_EXPORT_API_BASE}/${kind}?id=${encodeURIComponent(String(tid))}&page=${encodeURIComponent(String(page))}`;
}

function xdexExportImageUrl(img, ext) {
  const name = String(img || '').trim();
  if (!name) return '';
  const suffix = String(ext || '').trim();
  return `${XDEX_EXPORT_IMAGE_BASE}/${name}${suffix}`;
}

function xdexExportDecodeEntities(text) {
  return String(text || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&bull;/g, '•')
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function xdexExportStripTags(text) {
  return String(text || '').replace(/<[^>]*>/g, '');
}

function xdexExportHtmlToMarkdown(html) {
  let out = String(html || '');
  out = out.replace(/<img[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, (_m, src) => `\n![](${src})\n`);
  out = out.replace(/<a[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, href, text) => {
    const label = xdexExportStripTags(text).trim();
    const url = /^https?:/i.test(href) ? href : `${XDEX_EXPORT_SITE_BASE}${href.startsWith('/') ? '' : '/'}${href}`;
    return label ? `[${label}](${url})` : url;
  });
  out = out.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, (_m, _t, text) => `**${xdexExportStripTags(text).trim()}**`);
  out = out.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, (_m, _t, text) => `*${xdexExportStripTags(text).trim()}*`);
  out = out.replace(/<font[^>]*color=["']?#?789922["']?[^>]*>([\s\S]*?)<\/font>/gi, (_m, text) => xdexExportStripTags(text).trim());
  out = out.replace(/<br\s*\/?>/gi, '\n');
  out = out.replace(/<\/p>/gi, '\n');
  out = xdexExportStripTags(out);
  return xdexExportDecodeEntities(out).replace(/\n{3,}/g, '\n\n').trim();
}

function xdexExportHtmlToText(html) {
  let out = String(html || '');
  out = out.replace(/<img[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, (_m, src) => `\n[图片] ${src}\n`);
  out = out.replace(/<a[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, href, text) => {
    const label = xdexExportStripTags(text).trim();
    const url = /^https?:/i.test(href) ? href : `${XDEX_EXPORT_SITE_BASE}${href.startsWith('/') ? '' : '/'}${href}`;
    return label ? `${label} (${url})` : url;
  });
  out = out.replace(/<br\s*\/?>/gi, '\n');
  out = out.replace(/<\/p>/gi, '\n');
  out = xdexExportStripTags(out);
  return xdexExportDecodeEntities(out).replace(/\n{3,}/g, '\n\n').trim();
}

function xdexExportShortHash(userHash) {
  const raw = String(userHash || '').trim();
  if (!raw) return '';
  return '#' + raw.slice(0, 7);
}

function xdexExportEntryUrl(tid, page, isOp) {
  const base = `${XDEX_EXPORT_SITE_BASE}/t/${tid}`;
  return isOp ? base : `${base}/page/${Math.max(1, Number(page) || 1)}`;
}

function xdexExportCollectEntries(threadObj, page) {
  const entries = [];
  const op = {
    id: String((threadObj && threadObj.id) || '').trim(),
    name: String((threadObj && threadObj.name) || '').trim(),
    title: String((threadObj && threadObj.title) || '').trim(),
    email: String((threadObj && threadObj.email) || '').trim(),
    now: String((threadObj && threadObj.now) || '').trim(),
    userHash: String((threadObj && (threadObj.user_hash || threadObj.UserHash)) || '').trim(),
    content: String((threadObj && threadObj.content) || ''),
    img: String((threadObj && threadObj.img) || '').trim(),
    ext: String((threadObj && threadObj.ext) || '').trim(),
    page: 1,
    isOp: true
  };
  entries.push(op);
  const replies = Array.isArray(threadObj && threadObj.Replies) ? threadObj.Replies : [];
  replies.forEach((reply) => {
    if (!reply) return;
    if (String(reply.id || '') === '9999999') return; // Tips 酱过滤
    entries.push({
      id: String(reply.id || '').trim(),
      name: String(reply.name || '').trim(),
      title: String(reply.title || '').trim(),
      email: String(reply.email || '').trim(),
      now: String(reply.now || '').trim(),
      userHash: String(reply.user_hash || reply.UserHash || '').trim(),
      content: String(reply.content || ''),
      img: String(reply.img || '').trim(),
      ext: String(reply.ext || '').trim(),
      page: Number(page) || 1,
      isOp: false
    });
  });
  return entries;
}

function xdexExportParseThreadResponse(raw, page) {
  let data = raw;
  if (typeof raw === 'string') {
    const text = raw.trim();
    if (text.startsWith('"')) {
      try { throw new Error(JSON.parse(text)); } catch (e) { if (e instanceof Error) throw e; }
    }
    if (!text.startsWith('{') && !text.startsWith('[')) {
      throw new Error(text || '接口返回了无法解析的内容');
    }
    try {
      data = JSON.parse(text);
    } catch (_e) {
      throw new Error('接口返回了无法解析的 JSON');
    }
  }
  if (!data || data.success === false) {
    throw new Error((data && data.error) || '接口返回错误');
  }
  const totalReplies = Number(data.ReplyCount != null ? data.ReplyCount : data.reply_count) || 0;
  return {
    page: Number(page) || 1,
    totalPages: Math.max(1, Math.ceil(totalReplies / XDEX_EXPORT_PER_PAGE)),
    totalReplies,
    fid: String(data.fid || '').trim(),
    entries: xdexExportCollectEntries(data, page)
  };
}

function xdexExportBuildDocument(options) {
  const { format = 'md', tid = '', title = '', entries = [] } = options || {};
  const isMd = format !== 'txt';
  const lines = [];
  lines.push(isMd ? `# ${title || `串 ${tid}`}` : (title || `串 ${tid}`));
  lines.push('');
  entries.forEach((entry) => {
    const page = entry.page || 1;
    const url = xdexExportEntryUrl(tid, page, entry.isOp);
    const hash = xdexExportShortHash(entry.userHash);
    const head = [];
    head.push(isMd ? `[${entry.id}](${url})` : entry.id);
    if (hash) head.push(entry.isOp ? `${hash} (Po)` : hash);
    const name = String(entry.name || '').trim();
    const titleField = String(entry.title || '').trim();
    if (name && name !== '无名氏') head.push(name);
    if (titleField && titleField !== '无标题') head.push(titleField);
    if (entry.now) head.push(entry.now);
    lines.push(head.join(' | '));
    lines.push('');
    const imageUrl = xdexExportImageUrl(entry.img, entry.ext);
    if (imageUrl) {
      lines.push(`![${String(entry.img || '').trim()}](${imageUrl})`);
      lines.push('');
    }
    const body = isMd ? xdexExportHtmlToMarkdown(entry.content) : xdexExportHtmlToText(entry.content);
    if (body) {
      lines.push(body);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  });
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

function xdexExportBuildFileName(tid, title, from, to, format) {
  const safeTitle = String(title || '').replace(/[\\/:*?"<>|\r\n\t]/g, '_').trim().slice(0, 60);
  // 始终使用实际页码区间（完整下载也是 1-N，不再用 'full'）
  const range = `${from}-${to}`;
  const ext = format === 'txt' ? 'txt' : 'md';
  const base = [String(tid), safeTitle, range].filter(Boolean).join('_');
  return `${base}.${ext}`;
}

// ---- 日志（写入共享存储供桥接/页面查看）----
function bgLog(level, message) {
  try {
    const list = GM_getValue(STATE_KEY, []);
    const arr = Array.isArray(list) ? list : [];
    arr.push({ level, message: String(message), at: Date.now() });
    GM_setValue(STATE_KEY, arr.slice(-60));
  } catch (_e) {}
  GM_log(`[X岛-EX 导出] ${message}`, level === 'error' ? 'error' : 'info');
}

// ---- 取得 userhash：优先用调用方传入，其次 GM_cookie（支持 HttpOnly）----
function getUserhashFromCookieApi() {
  return new Promise((resolve) => {
    try {
      if (typeof GM_cookie !== 'function') { resolve(''); return; }
      GM_cookie('list', { url: 'https://www.nmbxd1.com/', name: 'userhash' }, (cookies, error) => {
        if (error) { resolve(''); return; }
        const hit = (Array.isArray(cookies) ? cookies : []).find((c) => c && c.name === 'userhash' && c.value);
        resolve(hit ? `userhash=${hit.value}` : '');
      });
    } catch (_e) { resolve(''); }
  });
}

// ── 请求限流 ──
// 任意两次 API 请求之间至少间隔 API_MIN_INTERVAL_MS：既避免高频抓取给站点造成压力，
// 也避免因为请求过密被风控/屏蔽。所有抓取都经由 fetchText，闸门放在那里最稳妥。
// 用 Promise 链实现 FIFO —— 并发发起的请求会依次通过，而不是同时冲出去。
const API_MIN_INTERVAL_MS = 1200;
let apiLastAt = 0;
let apiGateChain = Promise.resolve();
function apiThrottle() {
  const run = apiGateChain.then(async () => {
    const wait = apiLastAt + API_MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    apiLastAt = Date.now();
  });
  apiGateChain = run.catch(() => {});
  return run;
}

// ── 导出队列（顺序执行）──
// 批量提交时多个任务会先后到达；串行执行可避免并发抓取叠加请求频率。
const exportQueue = [];
let exportRunning = false;

function enqueueExport(taskId, details) {
  exportQueue.push({ taskId, details });
  updateTask(taskId, { status: 'queued' });
  bgLog('info', `任务入队 ${taskId}（当前队列 ${exportQueue.length} 个）`);
  pumpExportQueue();
}

function pumpExportQueue() {
  if (exportRunning) return;
  const next = exportQueue.shift();
  if (!next) return;
  exportRunning = true;
  updateTask(next.taskId, { status: 'running' });
  bgLog('info', `开始抓取 ${next.taskId}（队列剩余 ${exportQueue.length} 个）`);
  Promise.resolve()
    .then(() => runExport(next.details, next.taskId))
    .then((data) => {
      finishTask(next.taskId, {
        status: data.canceled ? 'canceled' : 'done',
        filename: data.filename,
        title: data.title,
        error: data.canceled ? `已取消，导出已完成的 ${data.pages} 页` : ''
      });
      bgLog('info', `任务${data.canceled ? '已取消（已导出部分）' : '完成'} ${next.taskId}：${data.filename}`);
    })
    .catch((e) => {
      const msg = String((e && e.message) || e);
      finishTask(next.taskId, { status: cancelFlags.has(next.taskId) ? 'canceled' : 'failed', error: msg });
      cancelFlags.delete(next.taskId);
      bgLog('error', `任务失败 ${next.taskId}：${msg}`);
    })
    .then(() => { exportRunning = false; pumpExportQueue(); });
}

// ---- 带 Cookie 的 GM_xmlhttpRequest ----
async function fetchText(url, cookieHeader) {
  await apiThrottle(); // 全局限流：任意两次请求之间至少间隔 API_MIN_INTERVAL_MS
  return new Promise((resolve, reject) => {
    const headers = {};
    if (cookieHeader) headers.Cookie = cookieHeader;
    GM_xmlhttpRequest({
      method: 'GET',
      url,
      headers,
      timeout: 20000,
      onload: (res) => {
        if (res.status >= 200 && res.status < 300) resolve(res.responseText);
        else reject(new Error(`HTTP ${res.status}`));
      },
      onerror: () => reject(new Error('网络请求失败')),
      ontimeout: () => reject(new Error('请求超时'))
    });
  });
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// 标题取用规则（与页面侧 xdexExportPickTitle 保持一致，保证检索展示 = 落盘文件名）：
//   有标题且不是「无标题」→ 用原标题；否则取主串正文「第一句话」（到第一个句末标点为止），截到 40 字。
//   与页面侧 xdexExportPickTitle、扩展端 xdexExportPickTitle 三端保持同一规则。
function xdexExportHtmlToPlain(html) {
  return String(html == null ? '' : html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
function xdexExportPickTitle(title, contentHtml) {
  const t = String(title || '').trim();
  if (t && t !== '无标题') return t;
  const text = xdexExportHtmlToPlain(contentHtml);
  if (!text) return '';
  const m = text.match(/^[^。！？!?]{1,60}[。！？!?]/);
  return (m ? m[0] : text).slice(0, 40).trim();
}

// ---- 任务状态（供页面 1s/3s 轮询 list 呈现进度）----
function readTasks() {
  const v = GM_getValue(TASKS_KEY, null);
  return (v && typeof v === 'object' && Array.isArray(v.tasks) && Array.isArray(v.history))
    ? v : { tasks: [], history: [] };
}
function writeTasks(state) {
  try { GM_setValue(TASKS_KEY, { tasks: state.tasks.slice(0, 20), history: state.history.slice(0, 50) }); } catch (_e) {}
}
function updateTask(taskId, patch) {
  const st = readTasks();
  const i = st.tasks.findIndex((t) => t && t.id === taskId);
  if (i < 0) return null;
  st.tasks[i] = Object.assign({}, st.tasks[i], patch, { updatedAt: Date.now() });
  writeTasks(st);
  return st.tasks[i];
}
function finishTask(taskId, patch) {
  const st = readTasks();
  const i = st.tasks.findIndex((t) => t && t.id === taskId);
  if (i < 0) return null;
  const done = Object.assign({}, st.tasks[i], patch, { finishedAt: Date.now() });
  st.tasks.splice(i, 1);
  st.history.unshift(done);
  writeTasks(st);
  return done;
}
// 取消标记：只存在内存里即可（后台脚本常驻，页面关闭不影响已提交任务）
const cancelFlags = new Set();

// 从业务错误响应中取出可读文案（兼容转义形式）
function extractApiError(text) {
  const m = String(text || '').match(/"error"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (!m) return '接口返回错误';
  try { return JSON.parse('"' + m[1] + '"'); } catch (_e) { return m[1]; }
}

// ---- 抓一页，自动在 Cookie 来源之间回退 ----
async function fetchPageWithCookieFallback(tid, page, preferredCookie) {
  const url = xdexExportBuildUrl(tid, page, false);
  const tried = [];
  const candidates = [];
  if (preferredCookie) candidates.push(preferredCookie);
  const fromApi = await getUserhashFromCookieApi();
  if (fromApi && fromApi !== preferredCookie) candidates.push(fromApi);
  candidates.push('');

  let lastErr = null;
  for (const c of candidates) {
    let text;
    try {
      text = await fetchText(url, c);
    } catch (e) {
      // 网络层失败：换下一个来源继续尝试
      lastErr = e;
      continue;
    }
    // 业务错误：站点返回 success:false 的 JSON，而非 HTTP 错误码
    if (/"success"\s*:\s*false/.test(text)) {
      const msg = extractApiError(text);
      // 仅「未登入」类错误值得换一个 Cookie 来源重试；
      // 串不存在等重试无意义，直接抛出真实原因（不放进 catch，避免被本循环吞掉）
      if (!/登入|饼干|登录/.test(msg)) throw new Error(msg);
      lastErr = new Error(msg);
      continue;
    }
    return text;
  }
  throw lastErr || new Error('抓取失败');
}

// ---- 落盘 ----
// 兼容性处理（把「浏览器行为差异」从风险变成可自动兜底）：
//   1. 优先 blob: URL（ScriptCat 后台跑在 offscreen，正常可用）；
//      若该环境没有 URL.createObjectURL，退回 data: URL，保证仍能落盘。
//   2. 文件名带子目录（X岛-EX/xxx.md）时，若浏览器不接受（个别环境下会失败），
//      自动退回扁平文件名重试一次，保证导出不因命名而整体失败。
function xdexSanitizeFileName(name) {
  // 与 ScriptCat cleanFileName 同语义：非法字符替换为 '-'，去掉 .. 回溯
  return String(name || 'export.txt')
    .replace(/[\x00-\x1F\\:*?"<>|]+/g, '-')
    .replace(/\.\.+/g, '-')
    .trim();
}

function makeContentUrl(content, mime) {
  const type = `${mime};charset=utf-8`;
  try {
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      const blob = new Blob([content], { type });
      return { url: URL.createObjectURL(blob), revoke: () => { try { URL.revokeObjectURL(url); } catch (_e) {} } };
    }
  } catch (_e) {}
  // 退回 data: URL（无 createObjectURL 的环境）
  const bytes = new TextEncoder().encode(content);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return { url: `data:${type};base64,${btoa(bin)}`, revoke: () => {} };
}

function downloadOnce(filename, content, mime) {
  return new Promise((resolve, reject) => {
    const made = makeContentUrl(content, mime);
    const done = (ok, payload) => {
      setTimeout(() => made.revoke(), 60000);
      ok ? resolve(filename) : reject(payload);
    };
    try {
      GM_download({
        url: made.url,
        name: filename,
        conflictAction: 'overwrite',
        onload: () => done(true),
        onerror: (err) => done(false, new Error('保存文件失败：' + JSON.stringify(err))),
        ontimeout: () => done(false, new Error('保存文件超时'))
      });
    } catch (e) { done(false, e); }
  });
}

async function saveFile(filename, content, mime) {
  const clean = xdexSanitizeFileName(filename);
  try {
    return await downloadOnce(clean, content, mime);
  } catch (e) {
    // 带子目录失败时退回扁平文件名再试一次（子目录支持与否由浏览器决定）
    const flat = xdexSanitizeFileName(clean.replace(/\//g, '_'));
    if (flat === clean) throw e;
    bgLog('info', `带子目录保存失败，改用扁平文件名重试：${flat}（原因：${e && e.message}）`);
    return await downloadOnce(flat, content, mime);
  }
}

// 二进制落盘（图片）：GM_download 支持 data: URL
function downloadBinaryOnce(filename, bytes, mime) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  const url = `data:${mime || 'application/octet-stream'};base64,${btoa(bin)}`;
  return new Promise((resolve, reject) => {
    try {
      GM_download({
        url,
        name: xdexSanitizeFileName(filename),
        conflictAction: 'overwrite',
        onload: () => resolve(filename),
        onerror: (err) => reject(new Error('图片保存失败：' + JSON.stringify(err))),
        ontimeout: () => reject(new Error('图片保存超时'))
      });
    } catch (e) { reject(e); }
  });
}

// ---- 单串导出 ----
// HTML 离线包（nimingban 结构）：内嵌精简查看器（双栏：左列表/右内容），无需用户持有任何模板文件。
// 数据契约与 nimingban 原版一致（_set_data_ JSONP），保证兼容原版 离线浏览.html。
// 图片字段三态：fileName（本地相对路径）+ img（绝对外链）同时写入 → 查看器本地缺失时回退外链。
// ---- 原版 nimingban 查看器（base64 内嵌，逐字节保真）----
const XDEX_ORIGINAL_VIEWER_B64 = '77u/PCFET0NUWVBFIGh0bWw+CjxodG1sPgogICAgPGhlYWQ+CiAgICAgICAgPG1ldGEgY2hhcnNldD0idXRmLTgiPgogICAgICAgIDx0aXRsZT5B5bKb5Yy/5ZCN54mI5pys5Zyw5pWw5o2u5rWP6KeIPC90aXRsZT4KICAgICAgICA8bWV0YSBuYW1lPSJ2aWV3cG9ydCIgY29udGVudD0id2lkdGg9ZGV2aWNlLXdpZHRoLCB1c2VyLXNjYWxhYmxlPW5vIiAvPgogICAgICAgIDxtZXRhIG5hbWU9ImFwcGxlLW1vYmlsZS13ZWItYXBwLWNhcGFibGUiIGNvbnRlbnQ9InllcyI+CiAgICAgICAgPG1ldGEgbmFtZT0iYXBwbGUtbW9iaWxlLXdlYi1hcHAtc3RhdHVzLWJhci1zdHlsZSIgY29udGVudD0iYmxhY2siPgogICAgICAgIDxtZXRhIG5hbWU9Im1zYXBwbGljYXRpb24tdGFwLWhpZ2hsaWdodCIgY29udGVudD0ibm8iIC8+CiAgICAgICAgPG1ldGEgbmFtZT0iZm9ybWF0LWRldGVjdGlvbiIgY29udGVudD0idGVsZXBob25lPW5vIj4KICAgICAgICA8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgogICAgICAgICAgICBodG1se21hcmdpbjowO3BhZGRpbmc6MDtoZWlnaHQ6MTAwJTtmb250LXNpemU6NjIuNSV9Ym9keXtmb250LXNpemU6MS42cmVtO2JhY2tncm91bmQtY29sb3I6I2VmZWZmNDttYXJnaW46MDtwYWRkaW5nOjA7aGVpZ2h0OjEwMCU7ZGlzcGxheTpibG9jaztvdmVyZmxvdzpoaWRkZW47Zm9udC1mYW1pbHk6Ii4uLiIsIk1pY3Jvc29mdCBZYUhlaSIsIldlblF1YW5ZaSBNaWNybyBIZWkiLHNhbnMtc2VyaWZ9aDF7bWFyZ2luOjAgMCAxcmVtIDB9aDF7Zm9udC1zaXplOjIuNXJlbTtmb250LXdlaWdodDpub3JtYWx9cHtmb250LXNpemU6MS45cmVtO2ZvbnQtd2VpZ2h0Om5vcm1hbDtsaW5lLWhlaWdodDoyLjVyZW07Zm9udC1zaXplOmluaGVyaXR9YmxvY2txdW90ZSxlbXtmb250LXN0eWxlOm5vcm1hbH1hLGltZyxidXR0b24sYmxvY2txdW90ZXstd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6cmdiYSgwLDAsMCwwKTstd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6dHJhbnNwYXJlbnR9LmJ1dHRvbjo6LW1vei1mb2N1cy1pbm5lcixbcm9sZT0iYnV0dG9uIl06Oi1tb3otZm9jdXMtaW5uZXIsYnV0dG9uOjotbW96LWZvY3VzLWlubmVye2JvcmRlcjowO291dGxpbmU6MH1idXR0b24sW3JvbGU9ImJ1dHRvbiJde2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7Zm9udC1zdHlsZTpub3JhbWw7d2lkdGg6MTAwJTtoZWlnaHQ6NHJlbTttYXJnaW46MCAwIDFyZW07cGFkZGluZzowIDEuMnJlbTstbW96LWJveC1zaXppbmc6Ym9yZGVyLWJveDtkaXNwbGF5OmlubGluZS1ibG9jazt2ZXJ0aWNhbC1hbGlnbjptaWRkbGU7dGV4dC1vdmVyZmxvdzplbGxpcHNpczt3aGl0ZS1zcGFjZTpub3dyYXA7b3ZlcmZsb3c6aGlkZGVuO2JhY2tncm91bmQtY29sb3I6I2Q4ZDhkODtib3JkZXI6MDtjdXJzb3I6cG9pbnRlcjtmb250LXdlaWdodDpub3JtYWw7Zm9udC1zaXplOjEuNnJlbTtsaW5lLWhlaWdodDo0cmVtO2NvbG9yOiMzMzM7dGV4dC1hbGlnbjpjZW50ZXI7dGV4dC1kZWNvcmF0aW9uOm5vbmU7b3V0bGluZTowfXNlbGVjdDotbW96LWZvY3VzcmluZ3tjb2xvcjp0cmFuc3BhcmVudDt0ZXh0LXNoYWRvdzowIDAgMCAjMzMzfXNlY3Rpb25bcm9sZT0icmVnaW9uIl0+aGVhZGVye3otaW5kZXg6MDtoZWlnaHQ6YXV0b31zZWN0aW9uW3JvbGU9InJlZ2lvbiJdPmhlYWRlcjpmaXJzdC1jaGlsZHtwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmJsb2NrO3BhZGRpbmc6MDtoZWlnaHQ6NXJlbTtib3JkZXI6MDtjb2xvcjojZmZmO2JhY2tncm91bmQtY29sb3I6IzAwOTY4ODtib3gtc2hhZG93OjAgM3B4IDZweCByZ2JhKDAsMCwwLDAuMTYpLDBweCAzcHggNnB4IHJnYmEoMCwwLDAsMC4yMyl9c2VjdGlvbltyb2xlPSJyZWdpb24iXT5oZWFkZXI6Zmlyc3QtY2hpbGQgaDF7Zm9udC1zaXplOjEuOHJlbTtsaW5lLWhlaWdodDo1cmVtO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO2Rpc3BsYXk6YmxvY2s7b3ZlcmZsb3c6aGlkZGVuO21hcmdpbjowO2NvbG9yOiNmZmY7aGVpZ2h0OjEwMCU7Zm9udC13ZWlnaHQ6MzAwfXNlY3Rpb25bcm9sZT0icmVnaW9uIl0+aGVhZGVyOmZpcnN0LWNoaWxkIG1lbnV7aGVpZ2h0OjEwMCU7ZmxvYXQ6cmlnaHQ7cGFkZGluZzowO21hcmdpbjowfXNlY3Rpb25bcm9sZT0icmVnaW9uIl0+aGVhZGVyOmZpcnN0LWNoaWxkIGJ1dHRvbixzZWN0aW9uW3JvbGU9InJlZ2lvbiJdPmhlYWRlcjpmaXJzdC1jaGlsZCBbcm9sZT0iYnV0dG9uIl17Ym94LXNpemluZzpib3JkZXItYm94O3Bvc2l0aW9uOnJlbGF0aXZlO2Rpc3BsYXk6YmxvY2s7b3ZlcmZsb3c6aGlkZGVuO2Zsb2F0OmxlZnQ7d2lkdGg6MTByZW07aGVpZ2h0OjVyZW07Ym9yZGVyOjA7YmFja2dyb3VuZDowO21hcmdpbjowO2ZvbnQtd2VpZ2h0OjQwMDtmb250LXNpemU6MS41cmVtO2xpbmUtaGVpZ2h0OjVyZW07Ym9yZGVyLXJhZGl1czowO3RleHQtZGVjb3JhdGlvbjpub25lO3RleHQtYWxpZ246Y2VudGVyO3RleHQtc2hhZG93Om5vbmV9c2VjdGlvbltyb2xlPSJyZWdpb24iXT5oZWFkZXI6Zmlyc3QtY2hpbGQgYnV0dG9uOmZvY3Vze291dGxpbmU6MH1zZWN0aW9uW3JvbGU9InJlZ2lvbiJdPmhlYWRlcjpmaXJzdC1jaGlsZCBidXR0b24sc2VjdGlvbltyb2xlPSJyZWdpb24iXT5oZWFkZXI6Zmlyc3QtY2hpbGQgW3JvbGU9ImJ1dHRvbiJde2NvbG9yOnJnYmEoMCwwLDAsMC42KX1zZWN0aW9uW3JvbGU9InJlZ2lvbiJdPmhlYWRlcjpmaXJzdC1jaGlsZCBidXR0b246Zmlyc3QtY2hpbGQsc2VjdGlvbltyb2xlPSJyZWdpb24iXT5oZWFkZXI6Zmlyc3QtY2hpbGQgW3JvbGU9ImJ1dHRvbiJdOmZpcnN0LWNoaWxke3dpZHRoOmF1dG99c2VjdGlvbltyb2xlPSJyZWdpb24iXT5oZWFkZXI6Zmlyc3QtY2hpbGQgYnV0dG9uOmFjdGl2ZSxzZWN0aW9uW3JvbGU9InJlZ2lvbiJdPmhlYWRlcjpmaXJzdC1jaGlsZCBbcm9sZT0iYnV0dG9uIl06YWN0aXZlLHNlY3Rpb25bcm9sZT0icmVnaW9uIl0+aGVhZGVyOmZpcnN0LWNoaWxkIGJ1dHRvbjpob3ZlcixzZWN0aW9uW3JvbGU9InJlZ2lvbiJdPmhlYWRlcjpmaXJzdC1jaGlsZCBbcm9sZT0iYnV0dG9uIl06aG92ZXJ7YmFja2dyb3VuZC1jb2xvcjpyZ2JhKDAsMCwwLDAuMDcpfXNlY3Rpb25bcm9sZT0icmVnaW9uIl0+aGVhZGVyOmZpcnN0LWNoaWxkIGJ1dHRvbjpmb2N1cyxzZWN0aW9uW3JvbGU9InJlZ2lvbiJdPmhlYWRlcjpmaXJzdC1jaGlsZCBbcm9sZT0iYnV0dG9uIl06Zm9jdXN7YmFja2dyb3VuZC1jb2xvcjp0cmFuc3BhcmVudH1zZWN0aW9uW3JvbGU9InJlZ2lvbiJde3dpZHRoOjEwMCU7dHJhbnNpdGlvbjphbGwgLjUwcyBlYXNlIDBzOy13ZWJraXQtdHJhbnNpdGlvbjphbGwgLjUwcyBlYXNlIDBzO3Bvc2l0aW9uOnJlbGF0aXZlfXNlY3Rpb25bZGF0YS1wb3NpdGlvbj0iY3VycmVudCJdey13ZWJraXQtdHJhbnNmb3JtOnRyYW5zbGF0ZXgoMCk7dHJhbnNmb3JtOnRyYW5zbGF0ZXgoMCl9c2VjdGlvbltkYXRhLXBvc2l0aW9uPSJyaWdodCJdey13ZWJraXQtdHJhbnNmb3JtOnRyYW5zbGF0ZSgxMDAlLDApO3RyYW5zZm9ybTp0cmFuc2xhdGUoMTAwJSwwKX1zZWN0aW9uW3JvbGU9InJlZ2lvbiJde3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2xlZnQ6MDtyaWdodDowO2JvdHRvbTowO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7YmFja2dyb3VuZC1jb2xvcjojZmZmO2JvcmRlcjowO292ZXJmbG93OmhpZGRlbn1zZWN0aW9uW3JvbGU9InJlZ2lvbiJdPmhlYWRlci5maXhlZDpmaXJzdC1jaGlsZHtwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDoxMDAlfVtkYXRhLXBhZ2Vde21hcmdpbi1ib3R0b206MTVweH0uY29udGVudHtwYWRkaW5nLWJvdHRvbTowOy13ZWJraXQtdHJhbnNpdGlvbi1wcm9wZXJ0eTp0cmFuc2Zvcm07dHJhbnNpdGlvbi1wcm9wZXJ0eTp0cmFuc2Zvcm07LXdlYmtpdC10cmFuc2Zvcm0tb3JpZ2luOjAgMDt0cmFuc2Zvcm0tb3JpZ2luOjAgMH0uc2Nyb2xsYWJsZXtvdmVyZmxvdy14OmhpZGRlbjtvdmVyZmxvdy15OmF1dG87aGVpZ2h0OjEwMCU7LW1vei1ib3gtc2l6aW5nOmJvcmRlci1ib3g7LXdlYmtpdC1ib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym94LXNpemluZzpib3JkZXItYm94O3Bvc2l0aW9uOnJlbGF0aXZlfS5zY3JvbGxhYmxlLmhlYWRlcntoZWlnaHQ6OTUlO2hlaWdodDpjYWxjKDEwMCUgLSA1cmVtKTt0b3A6NXJlbX0ucGFnaW5hdGlvbntwb3NpdGlvbjpyZWxhdGl2ZTtjdXJzb3I6cG9pbnRlcn0ucGFnaW5hdGlvbjpob3Zlcntjb2xvcjojMzY2OGQxfS5wYWdpbmF0aW9uIC5hcnJvd3tkaXNwbGF5OmlubGluZS1ibG9jaztvdmVyZmxvdzpoaWRkZW47dmVydGljYWwtYWxpZ246bWlkZGxlO21hcmdpbi1sZWZ0OjEuNXJlbTtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjMDAwO3dpZHRoOjVweDtoZWlnaHQ6NXB4O2JvcmRlci1sZWZ0OjFweCBzb2xpZCAjMDAwOy13ZWJraXQtdHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpO3RyYW5zZm9ybTpyb3RhdGUoLTQ1ZGVnKX0ucGFnaW5hdGlvbiwubXNne21hcmdpbjowO2hlaWdodDo0cmVtO2xpbmUtaGVpZ2h0OjRyZW07dGV4dC1hbGlnbjpjZW50ZXI7YmFja2dyb3VuZC1jb2xvcjojZmZmfS5tc2d7bWFyZ2luLWJvdHRvbTozcmVtfS5jb21tZW50e3BhZGRpbmc6MTBweDttYXJnaW46MTBweDtib3JkZXItYm90dG9tOjA7cG9zaXRpb246cmVsYXRpdmU7YmFja2dyb3VuZC1jb2xvcjojZmZmO3dvcmQtYnJlYWs6YnJlYWstYWxsO2xldHRlci1zcGFjaW5nOi42cHg7LW1vei1ib3gtc2hhZG93OjFweCAxcHggNXB4ICNhMDc4ODg7LXdlYmtpdC1ib3gtc2hhZG93OjFweCAxcHggNXB4ICNhMDc4ODg7Ym94LXNoYWRvdzoxcHggMXB4IDVweCAjYTA3ODg4fS5vcGxpc3Qtc2VjdGlvbiAuY29tbWVudHtjdXJzb3I6cG9pbnRlcn0udGhyZWFkLXNlY3Rpb24gLmNvbW1lbnR7bWFyZ2luOjA7YmFja2dyb3VuZDowO2JvcmRlci1ib3R0b206MXB4IHNvbGlkICNlMGQxZDE7Ym94LXNoYWRvdzpub25lO292ZXJmbG93LXg6aGlkZGVuO292ZXJmbG93LXk6YXV0b30ub3BsaXN0LXNlY3Rpb24gLmNvbW1lbnQ6YWN0aXZle2JhY2tncm91bmQtY29sb3I6IzBhYztjb2xvcjojZmZmfS5jb21tZW50LWltYWdle21hcmdpbi10b3A6MTBweH0uY29tbWVudCBpbWd7bWF4LXdpZHRoOjEwMCU7bWF4LWhlaWdodDoxMDAlfS5jb21tZW50LWhlYWRlcntwb3NpdGlvbjpyZWxhdGl2ZTttYXJnaW46MDtjb2xvcjojODA4MDgwfS5wb3tjb2xvcjojMDAwO2ZvbnQtd2VpZ2h0OmJvbGR9LnVpZDpub3QoOmVtcHR5KXttYXJnaW4tcmlnaHQ6MTBweH0ub3BsaXN0LXNlY3Rpb24gLmNvbW1lbnQ6bm90KC5jb21tZW50LWxpc3QpIC5sb25nLWxvbmctYWdve2NvbG9yOiM4MTJmY2R9LmNvbW1lbnQtaGVhZGVyIC5yaWQsLnF1b3RlLWhlYWRlciAucmlke3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO3JpZ2h0OjA7aGVpZ2h0OjEwMCU7bGluZS1oZWlnaHQ6MTAwJX0uY29tbWVudFtkYXRhLXN0YXRlPSJkb3dubG9hZGVkIl0gLnJpZDpiZWZvcmV7Y29udGVudDoi5bey5LiL6L29In0uY29tbWVudFtkYXRhLXN0YXRlPSJkcmFmdCJdIC5yaWQ6YmVmb3Jle2NvbnRlbnQ6IuiNieeovyJ9LmNvbW1lbnQtaW5mb3twYWRkaW5nOjAgLjVyZW07bWFyZ2luOi41cmVtIDB9LmNvbW1lbnQtaW5mbyBwLC5zYWdle21hcmdpbjowO2NvbG9yOnJlZH0uY29tbWVudC1jb250ZW50e3BhZGRpbmc6LjZyZW0gMDtsaW5lLWhlaWdodDoxLjV9YmxvY2txdW90ZXtmb250LXNpemU6MS4ycmVtO21hcmdpbjowO2ZvbnQtc3R5bGU6bm9ybWFsO2N1cnNvcjpwb2ludGVyO2Rpc3BsYXk6aW5saW5lLWJsb2NrO3dpZHRoOjEwMCV9YmxvY2txdW90ZSBwe21hcmdpbi10b3A6MH1ibG9ja3F1b3RlIGJsb2NrcXVvdGV7Ym9yZGVyLWxlZnQ6bm9uZTtjb2xvcjojMjMzfS5xdW90ZS1hcmVhe2NvbG9yOiMyMzM7YmFja2dyb3VuZC1jb2xvcjojZTBmMmYxO3Bvc2l0aW9uOnJlbGF0aXZlO21hcmdpbjo1cHggNXB4IDVweCAyMHB4O3BhZGRpbmc6MCA1cHggNXB4IDEwcHg7Ym9yZGVyLWxlZnQ6NnB4IHNvbGlkIHJnYmEoMCwgMTUwLCAxMzYsIDAuNTYpO21heC1oZWlnaHQ6MTAwcHg7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW47Zm9udC1zdHlsZTpub3JtYWx9LnF1b3RlLWFyZWEucXVvdGUtc2hvdy5xdW90ZS1hcmVhLC5xdW90ZS1hcmVhLnF1b3RlLXNob3cgLmNvbW1lbnQtY29udGVudHttYXgtaGVpZ2h0OjEwMCV9LnF1b3RlLWFyZWEgLmNvbW1lbnQtY29udGVudHttYXJnaW46MDtwYWRkaW5nOjA7bWF4LWhlaWdodDozZW07b3ZlcmZsb3c6aGlkZGVufS5xdW90ZS1hcmVhIC5idG4tc2hvdy1pbWFnZXt3aWR0aDphdXRvO2JvcmRlcjowO2NvbG9yOiMzZDNkYTU7YmFja2dyb3VuZDowO2ZvbnQtc2l6ZToxLjJyZW07cGFkZGluZzowO21hcmdpbjowO2xpbmUtaGVpZ2h0OjMwcHg7aGVpZ2h0OjMwcHh9LnF1b3RlLWFyZWEgcHttYXJnaW4tdG9wOjA7bWFyZ2luLWJvdHRvbTowfS5xdW90ZS1oZWFkZXJ7cG9zaXRpb246cmVsYXRpdmV9LnF1b3RlLWhlYWRlciAucmlke3RleHQtZGVjb3JhdGlvbjp1bmRlcmxpbmU7Y29sb3I6IzYwNjU1NH0ucXVvdGUtbm97Y29sb3I6Izc4OTkyMn1zZWN0aW9uW3JvbGU9InJlZ2lvbiJdPmhlYWRlcjpmaXJzdC1jaGlsZCAudGFiIGlucHV0e3dpZHRoOjA7aGVpZ2h0OjA7dmlzaWJpbGl0eTpoaWRkZW47cG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3RvcDowfXNlY3Rpb25bcm9sZT0icmVnaW9uIl0+aGVhZGVyOmZpcnN0LWNoaWxkIC50YWIgaW5wdXQ6Y2hlY2tlZCtsYWJlbHtiYWNrZ3JvdW5kLWNvbG9yOnJnYmEoMCwwLDAsMC4xKTtjb2xvcjojZmZmfS50aHVtYi1zaXplLC50aHVtYi1zaXplIGltZ3ttYXgtd2lkdGg6MTAwJTttYXgtaGVpZ2h0OjEwMCV9LmZ1bGwtc2l6ZSwuZnVsbC1zaXplIGltZ3ttYXgtd2lkdGg6bm9uZTttYXgtaGVpZ2h0Om5vbmV9LmhpZGRlbntkaXNwbGF5Om5vbmV9LmRlc2t0b3AtbW9kZSAub3BsaXN0LXNlY3Rpb257d2lkdGg6NDAlfS5kZXNrdG9wLW1vZGUgLnRocmVhZC1zZWN0aW9ue3dpZHRoOjYwJTtyaWdodDowO2xlZnQ6YXV0b30uZGVza3RvcC1tb2RlIC50aHJlYWQtc2VjdGlvbltkYXRhLXBvc2l0aW9uPSJyaWdodCJdey13ZWJraXQtdHJhbnNmb3JtOnRyYW5zbGF0ZXgoMCk7dHJhbnNmb3JtOnRyYW5zbGF0ZXgoMCl9LmRlc2t0b3AtbW9kZSAjYnRuLXRocmVhZC1iYWNre2Rpc3BsYXk6bm9uZX1AbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6MzYwcHgpey5jb21tZW50LWhlYWRlcntmb250LXNpemU6MS40cmVtfX0KICAgICAgICA8L3N0eWxlPgogICAgPC9oZWFkPgogICAgPGJvZHk+CiAgICAgICAgPHNlY3Rpb24gaWQ9Im9wbGlzdC1zZWN0aW9uIiBjbGFzcz0ib3BsaXN0LXNlY3Rpb24iIHJvbGU9InJlZ2lvbiIgZGF0YS1tb2RlPSJmYXZvciIgZGF0YS1wb3NpdGlvbj0iY3VycmVudCI+CiAgICAgICAgICAgIDxoZWFkZXIgY2xhc3M9ImZpeGVkIj4KICAgICAgICAgICAgICAgIDxtZW51IHR5cGU9InRvb2xiYXIiIGNsYXNzPSJ0YWIiPgogICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0icmFkaW8iIG5hbWU9InJiIiBpZD0icmItZmF2b3IiIGNoZWNrZWQ+CiAgICAgICAgICAgICAgICAgIDxsYWJlbCByb2xlPSJidXR0b24iIGZvcj0icmItZmF2b3IiIGlkPSJidG4tZmF2b3IiID7mlLbol488L2xhYmVsPgogICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0icmFkaW8iIG5hbWU9InJiIiBpZD0icmItY29tbWVudCI+CiAgICAgICAgICAgICAgICAgIDxsYWJlbCByb2xlPSJidXR0b24iIGZvcj0icmItY29tbWVudCIgaWQ9ImJ0bi1jb21tZW50Ij7or4Torro8L2xhYmVsPgogICAgICAgICAgICAgICAgPC9tZW51PgogICAgICAgICAgICAgICAgPGgxPgogICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9Imh0dHBzOi8vYWRubWIuY29tIiB0YXJnZXQ9Il9ibGFuayIgcm9sZT0iYnV0dG9uIj5BQ+WMv+WQjeeJiDwvYT4KICAgICAgICAgICAgICAgIDwvaDE+CiAgICAgICAgICAgIDwvaGVhZGVyPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJzY3JvbGxhYmxlIGhlYWRlciI+CiAgICAgICAgICAgICAgPGRpdiBkYXRhLXR5cGU9Imxpc3QiIGNsYXNzPSJjb250ZW50Ij48L2Rpdj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9zZWN0aW9uPgogICAgICAgIDxzZWN0aW9uIGlkPSJ0aHJlYWQtc2VjdGlvbiIgY2xhc3M9InRocmVhZC1zZWN0aW9uIiByb2xlPSJyZWdpb24iIGRhdGEtbW9kZT0ibG9jYWwtdGhyZWFkIiBkYXRhLXBvc2l0aW9uPSJyaWdodCI+CiAgICAgICAgICAgIDxoZWFkZXIgY2xhc3M9ImZpeGVkIj4KICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9ImJ0bi10aHJlYWQtYmFjayIgdHlwZT0iYnV0dG9uIj7ov5Tlm548L2J1dHRvbj4KICAgICAgICAgICAgICAgIDxtZW51IHR5cGU9InRvb2xiYXIiPgogICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD0iYnRuLW9yaWdpbmFsVGhyZWFkIiBocmVmPSIjIj7mn6XnnIvljp/kuLI8L2J1dHRvbj4KICAgICAgICAgICAgICAgIDwvbWVudT4KICAgICAgICAgICAgICAgIDxoMT48L2gxPgogICAgICAgICAgICA8L2hlYWRlcj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0ic2Nyb2xsYWJsZSBoZWFkZXIiPgogICAgICAgICAgICAgIDxkaXYgZGF0YS10eXBlPSJsaXN0IiBjbGFzcz0iY29udGVudCI+PC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvc2VjdGlvbj4KICAgIDwvYm9keT4KICAgIDxzY3JpcHQgdHlwZT0idGV4dC9qYXZhc2NyaXB0Ij4KICAgICAgICB2YXIgRD1mdW5jdGlvbihhKXtyZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYSl9LENhY2hlcz17fSxIPXtoYWNmdW46e3NpdGU6ImhhY2Z1biIsdGhyZWFkOiJodHRwczovL2Fkbm1iLmNvbS90IixjZG46Imh0dHBzOi8vYWRubWIuY29tL1B1YmxpYy9VcGxvYWQifSxiZWl0YWk6e3NpdGU6ImJlaXRhaSIsdGhyZWFkOiJodHRwczovL3RubWIub3JnL3QiLGNkbjoiaHR0cHM6Ly90bm1iLm9yZy9QdWJsaWMvVXBsb2FkIn19O3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKCJET01Db250ZW50TG9hZGVkIixmdW5jdGlvbigpe0QoIm9wbGlzdC1zZWN0aW9uIikuYWRkRXZlbnRMaXN0ZW5lcigiY2xpY2siLG9wTGlzdENsaWNrRXZlbnQsZmFsc2UpO0QoInRocmVhZC1zZWN0aW9uIikuYWRkRXZlbnRMaXN0ZW5lcigiY2xpY2siLHRocmVhZENsaWNrRXZlbnQsZmFsc2UpO3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKCJyZXNpemUiLHVwZGF0ZUxheW91dCk7dXBkYXRlTGF5b3V0KCk7bG9hZE9QTGlzdCgiZmF2b3IiKX0pO2Z1bmN0aW9uIHVwZGF0ZUxheW91dCgpe3ZhciBiPXdpbmRvdy5pbm5lcldpZHRoO3ZhciBhPWRvY3VtZW50LmJvZHkuY2xhc3NMaXN0O2lmKGI8MTAyNCl7YS5yZW1vdmUoImRlc2t0b3AtbW9kZSIpO2EuYWRkKCJtb2JpbGUtbW9kZSIpfWVsc2V7YS5yZW1vdmUoIm1vYmlsZS1tb2RlIik7YS5hZGQoImRlc2t0b3AtbW9kZSIpfX1mdW5jdGlvbiBvcExpc3RDbGlja0V2ZW50KGwpe3ZhciBrPUQoIm9wbGlzdC1zZWN0aW9uIiksaT1rLnF1ZXJ5U2VsZWN0b3IoIi5jb250ZW50IiksaD1sLnRhcmdldCxtPWgudGFnTmFtZS50b0xvd2VyQ2FzZSgpLGY9aC5jbGFzc0xpc3QsYj1oLmlkO2lmKGYuY29udGFpbnMoInBhZ2luYXRpb24iKSl7dmFyIG49ay5nZXRBdHRyaWJ1dGUoImRhdGEtdG90YWwtcGFnZSIpO3ZhciBqPXByb21wdCgi6L6T5YWl6aG15pWw77yI5YWxIituKyLpobXvvIkiLCIiKTtpZighail7cmV0dXJufWlmKCFqfHxpc05hTihqKXx8cGFyc2VJbnQoaiwxMCk+bnx8cGFyc2VJbnQoaiwxMCk8PTApe2o9bn12YXIgZz1rLmdldEF0dHJpYnV0ZSgiZGF0YS1tb2RlIik7bmF2aWdhdGVUb1BhZ2UoaixnKTtkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCIjb3BsaXN0LXNlY3Rpb24gLnNjcm9sbGFibGUiKS5zY3JvbGxUb3A9MH1lbHNle2lmKG09PSJpbWcifHxtPT0iaW1hZ2UtcGxhY2Vob2xkZXIiKXtoLmNsYXNzTGlzdC50b2dnbGUoImZ1bGwtc2l6ZSIpfWVsc2V7aWYoZi5jb250YWlucygiY29tbWVudCIpfHwoaD1maW5kUGFyZW50KGgsIi5jb21tZW50IikpJiZoKXt2YXIgZD1oLmdldEF0dHJpYnV0ZSgiZGF0YS10aWQiKSxlPWguZ2V0QXR0cmlidXRlKCJkYXRhLXJlcGx5LXBhZ2UiKSxhPWguZ2V0QXR0cmlidXRlKCJkYXRhLXNpdGUiKXx8ImhhY2Z1biIsYz1oLmdldEF0dHJpYnV0ZSgiZGF0YS1mbmFtZSIpO3ZhciBnPWsuZ2V0QXR0cmlidXRlKCJkYXRhLW1vZGUiKTtEKCJ0aHJlYWQtc2VjdGlvbiIpLnNldEF0dHJpYnV0ZSgiZGF0YS1zaXRlIixhKTtpZihnPT0iZmF2b3IiKXtEKCJ0aHJlYWQtc2VjdGlvbiIpLnNldEF0dHJpYnV0ZSgiZGF0YS10aHJlYWQtaWQiLGQpO2VtcHR5KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIiN0aHJlYWQtc2VjdGlvbiAuY29udGVudCIpKTtsb2FkVGhyZWFkKGQsMSl9ZWxzZXt3aW5kb3cub3BlbihIW2FdLnRocmVhZCsiLyIrZCsoZT8iP3BhZ2U9IitlOiIiKSwiX2JsYW5rIil9fWVsc2V7aWYoYj09ImJ0bi1mYXZvciIpe2suc2V0QXR0cmlidXRlKCJkYXRhLW1vZGUiLCJmYXZvciIpO2xvYWRPUExpc3QoImZhdm9yIil9ZWxzZXtpZihiPT0iYnRuLWNvbW1lbnQiKXtrLnNldEF0dHJpYnV0ZSgiZGF0YS1tb2RlIiwiY29tbWVudCIpO2xvYWRPUExpc3QoImNvbW1lbnQiKX19fX19fWZ1bmN0aW9uIHRocmVhZENsaWNrRXZlbnQobCl7dmFyIGs9RCgidGhyZWFkLXNlY3Rpb24iKSxpPWsucXVlcnlTZWxlY3RvcigiLmNvbnRlbnQiKSxoPWwudGFyZ2V0LG49aC50YWdOYW1lLnRvTG93ZXJDYXNlKCksZz1oLmNsYXNzTGlzdCxjPWguaWQ7aWYoYz09ImJ0bi10aHJlYWQtYmFjayIpe0QoInRocmVhZC1zZWN0aW9uIikuc2V0QXR0cmlidXRlKCJkYXRhLXBvc2l0aW9uIiwicmlnaHQiKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZnJlZUltYWdlTWVtb3J5KGkucXVlcnlTZWxlY3RvckFsbCgiaW1nIikpO2kuaW5uZXJIVE1MPSIifSw1MDApfWVsc2V7aWYoYz09ImJ0bi1vcmlnaW5hbFRocmVhZCIpe3ZhciBkPWsuZ2V0QXR0cmlidXRlKCJkYXRhLXRocmVhZC1pZCIpLGI9ay5nZXRBdHRyaWJ1dGUoImRhdGEtc2l0ZSIpfHwiaGFjZnVuIjt3aW5kb3cub3BlbihIW2JdLnRocmVhZCsiLyIrZCwiX2JsYW5rIil9ZWxzZXtpZihnLmNvbnRhaW5zKCJwYWdpbmF0aW9uIikpe3ZhciBtPWsuZ2V0QXR0cmlidXRlKCJkYXRhLXRvdGFsLXBhZ2UiKTt2YXIgaj1wcm9tcHQoIui+k+WFpemhteaVsO+8iOWFsSIrbSsi6aG177yJIiwiIik7aWYoIWope3JldHVybn1pZihpc05hTihqKXx8cGFyc2VJbnQoaiwxMCk+bXx8cGFyc2VJbnQoaiwxMCk8PTApe2o9bX1uYXZpZ2F0ZVRvUGFnZShqLCJsb2NhbC10aHJlYWQiKTtkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCIjdGhyZWFkLXNlY3Rpb24gLnNjcm9sbGFibGUiKS5zY3JvbGxUb3A9MH1lbHNle2lmKG49PSJpbWciKXt2YXIgZj1maW5kUGFyZW50KGgsIi5xdW90ZS1hcmVhIik7aWYoZil7Zi5jbGFzc0xpc3QudG9nZ2xlKCJxdW90ZS1zaG93Iil9ZWxzZXtpZihmaW5kUGFyZW50KGgsIi5jb21tZW50Iikpe2guY2xhc3NMaXN0LnRvZ2dsZSgiZnVsbC1zaXplIil9fX1lbHNle2lmKGcuY29udGFpbnMoImJ0bi1zaG93LWltYWdlIikpe3ZhciBmPWZpbmRQYXJlbnQoaCwiLnF1b3RlLWFyZWEiKTtmJiZmLmNsYXNzTGlzdC5hZGQoInF1b3RlLXNob3ciKTt2YXIgYT1oLmdldEF0dHJpYnV0ZSgibG9jYWwtc3JjIil8fGguZ2V0QXR0cmlidXRlKCJ0aHVtYi1zcmMiKTt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCJpbWciKTtlLnNyYz1hO2gucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZSxoKX1lbHNle2lmKGcuY29udGFpbnMoInF1b3RlLWFyZWEiKXx8KGg9ZmluZFBhcmVudChoLCIucXVvdGUtYXJlYSIpKSYmaCl7aC5jbGFzc0xpc3QudG9nZ2xlKCJxdW90ZS1zaG93Iil9fX19fX19ZnVuY3Rpb24gbG9hZE9QTGlzdChoLGYsZSl7Zj1wYXJzZUludChmLDEwKXx8MTt2YXIgZz1EKCJvcGxpc3Qtc2VjdGlvbiIpO3ZhciBkPWcucXVlcnlTZWxlY3RvcigiLmNvbnRlbnQiKTt2YXIgYz1oKyIvIitoKyIuaW5kZXgiO3ZhciBiPWZ1bmN0aW9uKHApe2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoImRhdGFMb2FkZWQiLGIpO2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoImRhdGFFcnJvciIsYSk7cD1wLmRldGFpbC5kYXRhO2lmKGg9PSJmYXZvciIpe3Auc29ydChmdW5jdGlvbih1LGkpe3JldHVybiBpLmNyZWF0ZWQtdS5jcmVhdGVkfSl9ZWxzZXtpZihoPT0iY29tbWVudCIpe3Auc29ydChmdW5jdGlvbih1LGkpe3UuY3JlYXRlZD11LmNyZWF0ZWR8fHUuY3JlYXRlZEF0O2kuY3JlYXRlZD1pLmNyZWF0ZWR8fGkuY3JlYXRlZEF0O3JldHVybiBpLmNyZWF0ZWQtdS5jcmVhdGVkfSl9fWU9ZC5xdWVyeVNlbGVjdG9yQWxsKCIuY29tbWVudCIpLmxlbmd0aD42MDA/MDplO3ZhciByPTQwO3ZhciBvPU1hdGguY2VpbChwLmxlbmd0aC9yKTtvPW88PTA/MTpvO3ZhciBqPShmLTEpKnI7dmFyIG09ZipyO3ZhciBzPVtdO2Zvcih2YXIgbj1qO248bTtuKyspe2lmKCFwW25dKXticmVha31zLnB1c2gocFtuXSl9Zy5zZXRBdHRyaWJ1dGUoImRhdGEtdG90YWwtcGFnZSIsbyk7dmFyIGw9e2RhdGE6cyxjdXJyZW50UGFnZTpmLHRvdGFsUGFnZTpvfTt2YXIgdD1uZXcgUGFnZShoLGwpO2luc2VydChlLGQsdCxkLmZpcnN0Q2hpbGQpO2lmKGY9PTF8fGU9PTApe2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIiNvcGxpc3Qtc2VjdGlvbiAuc2Nyb2xsYWJsZSIpLnNjcm9sbFRvcD0wfXZhciBxPWYrMTt2YXIgaz1xPm8/c2hvd01zZyhkLCLlt7LmmK/mnIDlkI7kuIDpobUiKTpzaG93TXNnKGQsIueCueWHu+WKoOi9vVBhZ2UgIitxLGZ1bmN0aW9uKGkpe2xvYWRPUExpc3QoaCxxLDIpfSk7ZC5hcHBlbmRDaGlsZChrKX07dmFyIGE9ZnVuY3Rpb24oKXtkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCJkYXRhTG9hZGVkIixiKTtkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCJkYXRhRXJyb3IiLGEpO2QuYXBwZW5kQ2hpbGQoc2hvd01zZyhkLCLmsqHmnInmraTpobXmlbDmja4iKSl9O2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoImRhdGFMb2FkZWQiLGIpO2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoImRhdGFFcnJvciIsYSk7bG9hZENvbnRlbnQoYyl9ZnVuY3Rpb24gbG9hZFRocmVhZChjLGYsail7Zj1wYXJzZUludChmLDEwKXx8MTt2YXIgaT1EKCJ0aHJlYWQtc2VjdGlvbiIpLGU9aS5xdWVyeVNlbGVjdG9yKCIuY29udGVudCIpLGg9aS5xdWVyeVNlbGVjdG9yKCJoMSIpLGI9aS5nZXRBdHRyaWJ1dGUoImRhdGEtc2l0ZSIpfHwiaGFjZnVuIixrPWI9PSJoYWNmdW4iPyJ0IjpiLmNoYXJBdCgwKSxhPSJmYXZvci90aHJlYWRzLyIraytjKyIvZGF0YS8iK2YrIi5kYXRhIixkPTE5O2kuc2V0QXR0cmlidXRlKCJkYXRhLXBvc2l0aW9uIiwiY3VycmVudCIpO2gudGV4dENvbnRlbnQ9Ii4uLiI7dmFyIGw9ZnVuY3Rpb24ocil7ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigiZGF0YUxvYWRlZCIsbCk7ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigiZGF0YUVycm9yIixnKTtyPXIuZGV0YWlsLmRhdGE7aWYoIXIpe2FsZXJ0KCLmsqHmnInmraTpobXmlbDmja4iKTtyZXR1cm59cj1iYWNrd2FyZENvbXBhdGlibGUocik7aj1lLnF1ZXJ5U2VsZWN0b3JBbGwoIi5jb21tZW50IikubGVuZ3RoPjYwMD8wOmo7dmFyIHE9TWF0aC5jZWlsKHIucmVwbHlDb3VudC9kKTtxPXF8fDE7aS5zZXRBdHRyaWJ1dGUoImRhdGEtdG90YWwtcGFnZSIscSk7YWRkVG9DYWNoZShjLGYscik7aC50ZXh0Q29udGVudD0iTm8uIitjKyIoIityLnJlcGx5Q291bnQrIikiO3ZhciBzPXtkYXRhOnIsY3VycmVudFBhZ2U6Zix0b3RhbFBhZ2U6cX07dmFyIG09bmV3IFBhZ2UoImxvY2FsLXRocmVhZCIscyk7aWYoZj49Mil7bS5yZW1vdmVDaGlsZChtLnF1ZXJ5U2VsZWN0b3IoImFydGljbGUiKSl9dmFyIG89bmV3IFF1b3RlKG0ucXVlcnlTZWxlY3RvckFsbCgiYmxvY2txdW90ZSIpLGMpO28ucmVuZGVyQWxsKCk7aW5zZXJ0KGosZSxtLGUuZmlyc3RDaGlsZCk7aWYoZj09MXx8aj09MCl7ZG9jdW1lbnQucXVlcnlTZWxlY3RvcigiI3RocmVhZC1zZWN0aW9uIC5zY3JvbGxhYmxlIikuc2Nyb2xsVG9wPTB9dmFyIG49ZisxO3ZhciBwPW4+cT9zaG93TXNnKGUsIuW3suaYr+acgOWQjuS4gOmhtSIpOnNob3dNc2coZSwi54K55Ye75Yqg6L29UGFnZSAiK24sZnVuY3Rpb24odCl7bG9hZFRocmVhZChjLG4sMil9KTtlLmFwcGVuZENoaWxkKHApfTt2YXIgZz1mdW5jdGlvbigpe2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoImRhdGFMb2FkZWQiLGwpO2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoImRhdGFFcnJvciIsZyk7ZS5hcHBlbmRDaGlsZChzaG93TXNnKGUsIuayoeacieatpOmhteaVsOaNriIpKX07ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigiZGF0YUxvYWRlZCIsbCk7ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigiZGF0YUVycm9yIixnKTtsb2FkQ29udGVudChhKX1mdW5jdGlvbiBsb2FkQ29udGVudChjLGQsYil7dmFyIGE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic2NyaXB0Iik7YS50eXBlPSJ0ZXh0L2phdmFzY3JpcHQiO2EuY2xhc3NOYW1lPSJkYXRhLWpzIjthLnNyYz1jO2Eub25sb2FkPWZ1bmN0aW9uKCl7dGhpcy5vbmxvYWQ9bnVsbDtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGEpfSw0MDApfTthLm9uZXJyb3I9ZnVuY3Rpb24oKXt0aGlzLm9uZXJyb3I9bnVsbDthLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYSk7ZGlzcGF0Y2goZG9jdW1lbnQsImRhdGFFcnJvciIpfTtkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgiaGVhZCIpWzBdLmFwcGVuZENoaWxkKGEpfWZ1bmN0aW9uIENvbW1lbnQoZyxqLG0sZCl7dmFyIGk9Zy51c2VyaWR8fGcudWlkO3ZhciBlPShtJiZtPT1pKT90cnVlOmZhbHNlO3ZhciBhPWZ1bmN0aW9uKG8pe3ZhciBwPS8oKCZndDsmZ3Q7XHM/Tm9cLil8KD4+XHM/Tm9cLil8KD4+KXwoJmd0OyZndDspKVxkK1xzKig8YnIgXC8+KT8oXHIpPyhcbik/L2lnO289by5yZXBsYWNlKHAsZnVuY3Rpb24ocil7dmFyIHE9ci5tYXRjaCgvXGQrLyk7cT1xJiZxLmxlbmd0aD4wJiZxWzBdO2lmKHEpe3JldHVybiI8YmxvY2txdW90ZSBkYXRhLXRocmVhZC1pZD0nIitxKyInIGRhdGEtcG8tdWlkPVwiIitlc2NhcGUobSkrIlwiPjxzcGFuIGNsYXNzPSdxdW90ZS1ubyc+IisoIiZndDsmZ3Q7Tm8uIitxKSsiPC9zcGFuPjwvYmxvY2txdW90ZT4ifX0pO2lmKG8uaW5kZXhPZigiPC9hPiIpPDApe3A9LyhodHRwcz98ZnRwKTpcL1wvW1wtQS1aYS16MC05KyZAI1wvJT89fl98ITosLjtdKltcLUEtWmEtejAtOSsmQCNcLyU9fl98XS9nO289by5yZXBsYWNlKHAsZnVuY3Rpb24ocSl7dmFyIHI9IiIscz1xLnN1YnN0cihxLmxhc3RJbmRleE9mKCIuIikrMSk7dmFyIHQ9JzxhIGhyZWY9IicrcSsnIiB0YXJnZXQ9Il9ibGFuayIgY2xhc3M9ImV4dGVybmFsLWxpbmsiPicrcSsiPC9hPiI7dD0iPGRpdj4iK3QrIjwvZGl2PiI7aWYoWyJtcDMiLCJhYWMiLCJvZ2ciLCJ3YXYiXS5pbmRleE9mKHMpPi0xKXtyPXQrJzxhdWRpbyBzcmM9IicrcSsnIiBwcmVsb2FkPSJub25lIiBjb250cm9scz0idHJ1ZSI+PC9hdWRpbz4nfWVsc2V7aWYoWyJtcDQiLCJ3ZWJtIl0uaW5kZXhPZihzKT4tMSl7cj10Kyc8dmlkZW8gc3JjPSInK3ErJyIgcHJlbG9hZD0ibm9uZSIgY29udHJvbHM9InRydWUiPjwvdmlkZW8+J31lbHNle3I9dH19cmV0dXJuIHJ9KTtwPS9hYyhcZHsyLDh9KS9nO289by5yZXBsYWNlKHAsZnVuY3Rpb24ocSl7cT1vLmluZGV4T2YoIi8iK3EpPi0xP3E6JzxhIGhyZWY9Imh0dHA6Ly93d3cuYWNmdW4udHYvdi8nK3ErJyIgdGFyZ2V0PSJfYmxhbmsiIGNsYXNzPSJleHRlcm5hbC1saW5rIj4nK3ErIjwvYT4iO3JldHVybiBxfSl9cD0vXFtoXF0oLio/KVxbXC9oXF0vZztvPW8ucmVwbGFjZShwLCc8c3BhbiBjbGFzcz0iaC1oaWRkZW4tdGV4dCI+JDE8L3NwYW4+Jyk7aj09ImNvbW1lbnQiJiZvLnJlcGxhY2UoL1xuL2csIjxicj4iKTt2YXIgbj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCJkaXYiKTtuLmlubmVySFRNTD1vO24uY2xhc3NOYW1lPSJjb21tZW50LWNvbnRlbnQiO3JldHVybiBufSxiPWZ1bmN0aW9uKHQpe3ZhciBzPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImRpdiIpLHE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic3BhbiIpLG89ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic3BhbiIpLHA9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic3BhbiIpO3ZhciByPXQuaWR8fHQudGhyZWFkaWQsbj10LnVzZXJpZHx8dC51aWQ7by5jbGFzc05hbWU9InVpZCIrKGU/IiBwbyI6IiIpO28uaW5uZXJIVE1MPXBhcnNlSW50KHQuYWRtaW4sMTApJiZuJiZuLmluZGV4T2YoIjxmb250Iik8MCYmKCI8Zm9udCBjb2xvcj0ncmVkJz4iK24rIjwvZm9udD4iKXx8bnx8IiI7cS5jbGFzc05hbWU9InR0aW1lIjtxLmlubmVySFRNTD10LmNyZWF0ZWQmJmohPSJmYXZvciI/KHBhcnNlVGltZSh0LmNyZWF0ZWQpKyIgIik6dC5ub3c/KHBhcnNlVGltZSh0Lm5vdykrIiAiKToiIjtwLmNsYXNzTmFtZT0icmlkIjtwLnNldEF0dHJpYnV0ZSgiZGF0YS10aHJlYWQtaWQiLHIpO3AudGV4dENvbnRlbnQ9cj8iTm8uIityOiIiO3MuY2xhc3NOYW1lPSJjb21tZW50LWhlYWRlciI7cy5hcHBlbmRDaGlsZChvKTtzLmFwcGVuZENoaWxkKHEpO3MuYXBwZW5kQ2hpbGQocCk7cmV0dXJuIHN9LGg9ZnVuY3Rpb24oKXt2YXIgbj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCJkaXYiKSxvPSIiO28rPWcudGl0bGUmJmcudGl0bGUhPSLml6DmoIfpopgiPygiPHA+5qCH6aKY77yaIitnLnRpdGxlKyI8L3A+Iik6IiI7bys9Zy5uYW1lJiZnLm5hbWUhPSLml6DlkI3msI8iPygiPHA+5ZCN56ew77yaIitnLm5hbWUrIjwvcD4iKToiIjtvKz1nLmVtYWlsPygiPHA+RW1haWzvvJoiK2cuZW1haWwrIjwvcD4iKToiIjtvKz1wYXJzZUludChnLnNhZ2UsMTApPygiPHAgY2xhc3M9J3NhZ2UnPijmnKzkuLLlt7Lnu4/ooqtTQUdFKTwvcD4iKToiIjtuLmNsYXNzTmFtZT0iY29tbWVudC1pbmZvIjtuLmlubmVySFRNTD1vO3JldHVybiBufSxsPWZ1bmN0aW9uKCl7dmFyIG89Zy5zaXRlfHxEKCJ0aHJlYWQtc2VjdGlvbiIpLmdldEF0dHJpYnV0ZSgiZGF0YS1zaXRlIil8fCJoYWNmdW4iLHY9SFtvXS5jZG4scD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCJkaXYiKSxzPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImltZyIpLHQ9Zy5pbWc/Zy5pbWcucmVwbGFjZSgvXC9UaFwvL2csIi90aC8iKToiIixxPWcuZXh0P2cuZXh0LnJlcGxhY2UoIi5qcGUiLCIuanBlZyIpOiIiLHU9InQiLG49IiIscj0iIjtzcmM9IiI7aWYobyE9ImhhY2Z1biIpe3U9by5jaGFyQXQoMCk7bj0iLyIrdCsiX3QiK3Escj0iLyIrdCtxfWVsc2V7bj0iL3RodW1iLyIrdCtxLHI9Ii9pbWFnZS8iK3QrcX1zcmM9dituO2lmKGcuaW1nJiYoZy5pbWcuaW5kZXhPZigiaHR0cDoiKT4tMXx8Zy5pbWcuaW5kZXhPZigiaHR0cHM6Iik+LTF8fGcuaW1nLmluZGV4T2YoImZpbGU6Iik+LTEpKXtzcmM9Zy5pbWd9aWYoaj09ImZhdm9yIil7Zy5maWxlTmFtZT1nLmZpbGVOYW1lP2cuZmlsZU5hbWU6bi5zdWJzdHIobi5sYXN0SW5kZXhPZigiLyIpKzEpfWlmKGcuZmlsZU5hbWUpe2lmKGo9PSJ0aHJlYWQifHxqPT0ibG9jYWwtdGhyZWFkIil7c3JjPSJmYXZvci90aHJlYWRzLyIrdSsoZHx8Zy5pZCkrIi9pbWFnZXMvIitnLmZpbGVOYW1lfWVsc2V7aWYoaj09ImZhdm9yInx8aj09ImNvbW1lbnQiKXtzcmM9aisiL2ltYWdlcy8iK2cuZmlsZU5hbWV9fXMuc2V0QXR0cmlidXRlKCJsb2NhbC1zcmMiLHNyYyk7cy5zZXRBdHRyaWJ1dGUoInNyYyIsc3JjKX1zLnNldEF0dHJpYnV0ZSgic3JjIixzcmMpO24mJnMuc2V0QXR0cmlidXRlKCJ0aHVtYi1zcmMiLHYrbik7ciYmcy5zZXRBdHRyaWJ1dGUoImZ1bGwtc2l6ZS1zcmMiLHYrcik7cy5vbmVycm9yPWZ1bmN0aW9uKCl7dGhpcy5vbmVycm9yPW51bGw7dGhpcy5zcmM9dGhpcy5nZXRBdHRyaWJ1dGUoInRodW1iLXNyYyIpfTtwLmNsYXNzTmFtZT0iY29tbWVudC1pbWFnZSI7cC5hcHBlbmRDaGlsZChzKTtyZXR1cm4gcH0saz1mdW5jdGlvbihvKXt2YXIgcD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCJhcnRpY2xlIiksbj0iY29tbWVudCI7cC5zZXRBdHRyaWJ1dGUoImRhdGEtdGlkIixnLnRocmVhZHNJZHx8Zy50aHJlYWRpZHx8Zy50aWR8fGcuaWQpO2cuc3RhdGUmJnAuc2V0QXR0cmlidXRlKCJkYXRhLXN0YXRlIixnLnN0YXRlKTtnLnJlcGx5UGFnZSYmcC5zZXRBdHRyaWJ1dGUoImRhdGEtcmVwbHktcGFnZSIsZy5yZXBseVBhZ2UpO2cuc2l0ZSYmcC5zZXRBdHRyaWJ1dGUoImRhdGEtc2l0ZSIsZy5zaXRlKTtuKz1vPT0iZmF2b3IiPyIgZmF2b3ItbGlzdCI6bz09ImNvbW1lbnQiPyIgY29tbWVudC1saXN0IjoiIjtwLmNsYXNzTmFtZT1uO3ZhciBxPWIoZyk7aWYobz09ImNvbW1lbnQiKXtpZihnLnN0YXRlPT0ic2VudCIpe3EucXVlcnlTZWxlY3RvcigiLnJpZCIpLnRleHRDb250ZW50PWcuZm9ydW1OYW1lPyJbIitnLmZvcnVtTmFtZSsiXSI6IiJ9ZWxzZXtxLnF1ZXJ5U2VsZWN0b3IoIi5yaWQiKS50ZXh0Q29udGVudD0iIn19ZWxzZXtxLnF1ZXJ5U2VsZWN0b3IoIi5yaWQiKS50ZXh0Q29udGVudD0iIn1nLmNvbnRlbnQ9Zy5jb250ZW50fHwiIjtnLmNvbnRlbnQ9Zy5jb250ZW50Lmxlbmd0aD4zMDA/Zy5jb250ZW50LnNsaWNlKDAsMzAwKSsiLi4uIjpnLmNvbnRlbnQ7cC5hcHBlbmRDaGlsZChxKTtwLmFwcGVuZENoaWxkKGgoKSk7KGcuaW1nfHxnLmZpbGVOYW1lKSYmcC5hcHBlbmRDaGlsZChsKCkpO3AuYXBwZW5kQ2hpbGQoYShnLmNvbnRlbnQpKTtyZXR1cm4gcH0sZj1mdW5jdGlvbigpe3ZhciBuPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImFydGljbGUiKTtuLmlkPSJ0IitnLmlkO24uY2xhc3NOYW1lPSJjb21tZW50IjtuLnNldEF0dHJpYnV0ZSgiZGF0YS11aWQiLGcudWlkKTtuLmFwcGVuZENoaWxkKGIoZykpO24uYXBwZW5kQ2hpbGQoaCgpKTsoZy5pbWd8fGcuZmlsZU5hbWUpJiZuLmFwcGVuZENoaWxkKGwoKSk7bi5hcHBlbmRDaGlsZChhKGcuY29udGVudCkpO3JldHVybiBufTt2YXIgYz0iIjtzd2l0Y2goail7Y2FzZSJmYXZvciI6Yz1rKCJmYXZvciIpO2JyZWFrO2Nhc2UiY29tbWVudCI6Yz1rKCJjb21tZW50Iik7YnJlYWs7Y2FzZSJsb2NhbC10aHJlYWQiOmM9ZigpO2JyZWFrfXJldHVybiBjfWZ1bmN0aW9uIFF1b3RlKGMsZSl7Yz1jfHxbXTt2YXIgYj0iIjt2YXIgZD1EKCJ0aHJlYWQtc2VjdGlvbiIpLmdldEF0dHJpYnV0ZSgiZGF0YS1zaXRlIil8fCJoYWNmdW4iO3ZhciBhPUhbZF0uY2RuO3JldHVybnsicmVuZGVyIjpmdW5jdGlvbihpKXt2YXIgaz0oYiYmdW5lc2NhcGUoYik9PWkudXNlcmlkKT90cnVlOmZhbHNlLHA9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgiYXJ0aWNsZSIpLG09ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgicCIpLGo9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic3BhbiIpLG49ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic3BhbiIpO2ouY2xhc3NOYW1lPSJ0dGltZSI7ai5pbm5lckhUTUw9cGFyc2VUaW1lKGkubm93KSsiICI7bi5jbGFzc05hbWU9InVpZCIrKGs/IiBwbyI6IiIpO24uaW5uZXJIVE1MPXBhcnNlSW50KGkuYWRtaW4sMTApJiZpLnVzZXJpZCYmaS51c2VyaWQuaW5kZXhPZigiPGZvbnQiKTwwJiYoJzxmb250IGNvbG9yPSJyZWQiPicraS51c2VyaWQrIjwvZm9udD4iKXx8aS51c2VyaWR8fCIiO20uY2xhc3NOYW1lPSJxdW90ZS1oZWFkZXIiO20uYXBwZW5kQ2hpbGQobik7bS5hcHBlbmRDaGlsZChqKTtwLmNsYXNzTmFtZT0icXVvdGUtYXJlYSI7cC5hcHBlbmRDaGlsZChtKTtpZihpLmltZyl7dmFyIGc9KCIvdGh1bWIvIikraS5pbWcucmVwbGFjZSgvXC9UaFwvL2csIi90aC8iKStpLmV4dC5yZXBsYWNlKCIuanBlIiwiLmpwZWciKTt2YXIgZj1hK2c7aWYoaS5pbWcuaW5kZXhPZigiaHR0cDoiKT4tMXx8aS5pbWcuaW5kZXhPZigiaHR0cHM6Iik+LTF8fGkuaW1nLmluZGV4T2YoImZpbGU6Iik+LTEpe2Y9aS5pbWd9dmFyIGg9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgiZGl2Iik7aC5jbGFzc05hbWU9InF1b3RlLWltZyI7dmFyIGw9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgiYnV0dG9uIik7bC5jbGFzc05hbWU9ImJ0bi1zaG93LWltYWdlIjtsLnRleHRDb250ZW50PSLmmL7npLrlm77niYciO2wuc2V0QXR0cmlidXRlKCJ0eXBlIiwiYnV0dG9uIik7bC5zZXRBdHRyaWJ1dGUoInRodW1iLXNyYyIsZik7dmFyIHI9ZD09ImhhY2Z1biI/InQiOmQuY2hhckF0KDApO2kuZmlsZU5hbWUmJmwuc2V0QXR0cmlidXRlKCJsb2NhbC1zcmMiLCJmYXZvci90aHJlYWRzLyIrcitlKyIvaW1hZ2VzLyIraS5maWxlTmFtZSk7aC5hcHBlbmRDaGlsZChsKTtwLmFwcGVuZENoaWxkKGgpfXZhciBvPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImRpdiIpLHE9aS5jb250ZW50O3E9cS5yZXBsYWNlKC8jNzg5OTIyL2csIiIpO3E9cS5yZXBsYWNlKC9cW2hcXSguKj8pXFtcL2hcXS9nLCc8c3BhbiBjbGFzcz0iaC1oaWRkZW4tdGV4dCI+JDE8L3NwYW4+Jyk7by5jbGFzc05hbWU9ImNvbW1lbnQtY29udGVudCI7by5pbm5lckhUTUw9cTtwLmFwcGVuZENoaWxkKG8pO3JldHVybiBwfSwicmVuZGVyQWxsIjpmdW5jdGlvbigpe3ZhciBoPXRoaXMsZz17fTtbXS5zbGljZS5jYWxsKGMpLmZvckVhY2goZnVuY3Rpb24oaSl7dmFyIGs9aS5nZXRBdHRyaWJ1dGUoImRhdGEtdGhyZWFkLWlkIiksaj1xdWVyeUNhY2hlZFRocmVhZChlLGspO2I9aS5nZXRBdHRyaWJ1dGUoImRhdGEtcG8tdWlkIik7aWYoail7Z1trXT1nW2tdJiZnW2tdLmNsb25lTm9kZSh0cnVlKXx8aC5yZW5kZXIoaik7aS5hcHBlbmRDaGlsZChnW2tdKX19KTtmb3IodmFyIGYgaW4gZyl7ZGVsZXRlIGdbZl19Zz1udWxsfX19ZnVuY3Rpb24gUGFnZShtLGMpe3ZhciBwPWRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSxlPWMuZGF0YSxoPWMuY3VycmVudFBhZ2UsZj1jLnRvdGFsUGFnZSxrPSJQYWdlICIraCsiLyIrZisiPHNwYW4gY2xhc3M9J2Fycm93Jz48L3NwYW4+Ijt2YXIgbz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCJwIik7by5jbGFzc05hbWU9InBhZ2luYXRpb24iO28uaW5uZXJIVE1MPWs7cC5hcHBlbmRDaGlsZChvKTtpZihtPT0idGhyZWFkInx8bT09ImxvY2FsLXRocmVhZCIpe3ZhciBiPWUucmVwbHlzfHxbXSxuPWUudXNlcmlkO2lmKGUuaWQpe3ZhciBhPW5ldyBDb21tZW50KGUsbSxuLGUuaWQpO3AuYXBwZW5kQ2hpbGQoYSl9Zm9yKHZhciBkPTAsaj1iLmxlbmd0aDtkPGo7ZCsrKXt2YXIgZz1uZXcgQ29tbWVudChiW2RdLG0sbixlLmlkKTtwLmFwcGVuZENoaWxkKGcpfX1lbHNle2Zvcih2YXIgZD0wLGo9ZS5sZW5ndGg7ZDxqO2QrKyl7dmFyIGc9bmV3IENvbW1lbnQoZVtkXSxtLCIiLGVbZF0uaWQpO3AuYXBwZW5kQ2hpbGQoZyl9fXZhciBsPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImRpdiIpO2wuc2V0QXR0cmlidXRlKCJkYXRhLXBhZ2Utbm8iLGgpO2wuYXBwZW5kQ2hpbGQocCk7cmV0dXJuIGx9ZnVuY3Rpb24gbmF2aWdhdGVUb1BhZ2UoYSxjKXtzd2l0Y2goYyl7Y2FzZSJ0aHJlYWQiOmNhc2UibG9jYWwtdGhyZWFkIjpkZWZhdWx0OnZhciBiPUQoInRocmVhZC1zZWN0aW9uIikuZ2V0QXR0cmlidXRlKCJkYXRhLXRocmVhZC1pZCIpO2xvYWRUaHJlYWQoYixhKTticmVhaztjYXNlImZhdm9yIjpsb2FkT1BMaXN0KCJmYXZvciIsYSk7YnJlYWs7Y2FzZSJjb21tZW50Ijpsb2FkT1BMaXN0KCJjb21tZW50IixhKTticmVha319ZnVuY3Rpb24gYWRkVG9DYWNoZShkLGMsYil7dmFyIGE9Q2FjaGVzO2FbZF09YVtkXXx8e307Yi5mb3J1bT1udWxsO2FbZF1bY109Yn1mdW5jdGlvbiBxdWVyeUNhY2hlZFRocmVhZChjLGUpe3ZhciBtPSIiLGg9Q2FjaGVzfHx7fTt2YXIgbD1oW2NdO2lmKCFsKXtyZXR1cm4gbX1lPWV8fGM7Zm9yKHZhciBqIGluIGwpe3ZhciBrPWxbal07aWYoIWspe2NvbnRpbnVlfXZhciBhPWsuaWR8fCIiO2lmKGEmJmE9PWUpe209azticmVha312YXIgZD1rLnJlcGx5c3x8W107Zm9yKHZhciBmPTAsZz1kLmxlbmd0aDtmPGc7ZisrKXt2YXIgYj1kW2ZdO2lmKGIuaWQ9PWUpe209YjticmVha319aWYobSl7YnJlYWt9fXJldHVybiBtfWZ1bmN0aW9uIGluc2VydChhLGIsZCxjKXtpZihhPT0xKXtiLmluc2VydEJlZm9yZShkLGMpfWVsc2V7aWYoYT09Mil7Yi5hcHBlbmRDaGlsZChkKX1lbHNle2VtcHR5KGIpO2IuYXBwZW5kQ2hpbGQoZCl9fX1mdW5jdGlvbiBwYXJzZVRpbWUoZil7aWYoIWYpe3JldHVybiIifWY9aXNOYU4oZik/Zi5yZXBsYWNlKC9cKCguKj8pXCkvLCIgIikucmVwbGFjZSgvLS9nLCIvIik6Zjt2YXIgbSxkPW5ldyBEYXRlKCksYz1uZXcgRGF0ZShmKSxrPWMuZ2V0RnVsbFllYXIoKSxqPWMuZ2V0TW9udGgoKSxoPWMuZ2V0SG91cnMoKSxnPWMuZ2V0TWludXRlcygpLGU9Yy5nZXREYXRlKCk7dmFyIGw9KGorMSkrIi8iK2U7dmFyIG49KGg8MT8iMCI6IiIpK2grIjoiKyhnPDEwPyIwIjoiIikrZzt2YXIgaT1kLmdldEZ1bGxZZWFyKCk7aWYoaz09aSl7dmFyIGI9Yy5nZXRTZWNvbmRzKCk7dmFyIGE9KGI8MTA/IjAiOiIiKStiO2lmKGQuZ2V0TW9udGgoKT09aiYmZC5nZXREYXRlKCk9PWUpe209bisiOiIrYX1lbHNle209bCsiICIrbisiOiIrYX19ZWxzZXttPShrKyIiKS5zbGljZSgyLDQpKyIvIitsKyIgIitufWlmKGQtYz4xODAqMjQqNjAqNjAqMTAwMCl7bT0iPHNwYW4gY2xhc3M9J2xvbmctbG9uZy1hZ28nPiIrbSsiPC9zcGFuPiJ9cmV0dXJuIG19ZnVuY3Rpb24gZmluZFBhcmVudChlLGEpe3ZhciBkPWEuY2hhckF0KDApLGM9ZD09PSIuIj8iY2xhc3MiOihkPT09IlsiPyJhdHRyaWJ1dGUiOiJ0YWciKSxiPWUucGFyZW50Tm9kZTt3aGlsZShiKXtpZihiLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk9PSJib2R5Iil7cmV0dXJuIG51bGx9aWYoYz09ImNsYXNzIil7aWYoYi5jbGFzc0xpc3QuY29udGFpbnMoYS5zdWJzdHJpbmcoMSkpKXticmVha319ZWxzZXtpZihjPT0idGFnIil7aWYoYi5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpPT1hKXticmVha319ZWxzZXtpZihjPT0iYXR0cmlidXRlIil7YT1hLnJlcGxhY2UoLyhcWyl8KFxdKS9nLCIiKTtpZihiLmdldEF0dHJpYnV0ZShhKSE9PW51bGwpe2JyZWFrfX19fWI9Yi5wYXJlbnROb2RlfXJldHVybiBifWZ1bmN0aW9uIGJhY2t3YXJkQ29tcGF0aWJsZShiKXtpZighYi50aHJlYWRzKXtyZXR1cm4gYn12YXIgYz1mdW5jdGlvbihnKXt2YXIgZT17fTtlLmlkPWcuaWQ7ZS51c2VyaWQ9Zy51aWQ7ZS5uYW1lPWcubmFtZTtlLnRpdGxlPWcudGl0bGU7ZS5lbWFpbD1nLmVtYWlsO2UuY29udGVudD1nLmNvbnRlbnQ7ZS5maWxlTmFtZT1nLmZpbGVOYW1lO2UucmVwbHlDb3VudD1nLnJlcGx5Q291bnQ7ZS5ub3c9Zy5jcmVhdGVkQXQ7aWYoInNhZ2UiIGluIGcpe2Uuc2FnZT1nLnNhZ2UmJmcuc2FnZSE9IjAiPyIxIjoiMCJ9aWYoZy5pbWFnZSl7dmFyIGY9Zy5pbWFnZSxkPWYubGFzdEluZGV4T2YoIi4iKTtlLmltZz1mLnNsaWNlKDAsZCk7ZS5leHQ9Zi5zbGljZShkKX1yZXR1cm4gZX07dmFyIGE9e307YT1jKGIudGhyZWFkcyk7YS5yZXBseXM9W107Yi5yZXBseXMuZm9yRWFjaChmdW5jdGlvbihkKXthLnJlcGx5cy5wdXNoKGMoZCkpfSk7cmV0dXJuIGF9ZnVuY3Rpb24gZGlzcGF0Y2goZCxhLGIpe3ZhciBjPWRvY3VtZW50LmNyZWF0ZUV2ZW50KCJDdXN0b21FdmVudCIpO2lmKGMmJmMuaW5pdEN1c3RvbUV2ZW50KXtjLmluaXRDdXN0b21FdmVudChhLHRydWUsdHJ1ZSxiKX1lbHNle2M9ZG9jdW1lbnQuY3JlYXRlRXZlbnQoIkV2ZW50Iik7Yy5pbml0RXZlbnQoYSx0cnVlLHRydWUpO2MuZGV0YWlsPWJ9cmV0dXJuIGQuZGlzcGF0Y2hFdmVudChjKX1mdW5jdGlvbiBzaG93TXNnKGEsYyxkKXtpZighYSl7cmV0dXJufXZhciBiPWEucXVlcnlTZWxlY3RvcigiLm1zZyIpO2ImJmIucGFyZW50Tm9kZSYmYi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGIpO2I9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgiYnV0dG9uIik7Yi5jbGFzc05hbWU9Im1zZyI7Yi5pbm5lckhUTUw9Y3x8IuWKoOi9veWkp+Wksei0pSI7Yi5vbmNsaWNrPWZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTtlLnN0b3BQcm9wYWdhdGlvbigpO3RoaXMub25jbGljaz1udWxsO3RoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtkJiZkKGUpfTtyZXR1cm4gYn1mdW5jdGlvbiBmcmVlSW1hZ2VNZW1vcnkoYSl7W10uc2xpY2UuY2FsbChhKS5mb3JFYWNoKGZ1bmN0aW9uKGIpe2Iuc2V0QXR0cmlidXRlKCJzcmMiLCJkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUlBQUFBVUVCQUFBQUN3QUFBQUFBUUFCQUFBQ0FrUUJBRHM9Iil9KX1mdW5jdGlvbiBlbXB0eShhKXt3aGlsZShhLmZpcnN0Q2hpbGQpe2EucmVtb3ZlQ2hpbGQoYS5maXJzdENoaWxkKX19ZnVuY3Rpb24gX3NldF9kYXRhXyhhKXtkaXNwYXRjaChkb2N1bWVudCwiZGF0YUxvYWRlZCIse2RhdGE6YX0pfTsKPC9zY3JpcHQ+CjwvaHRtbD4=';
const XDEX_EXPORT_VIEWER_ADAPTER = `
<script>
// ===== X岛-EX 离线包适配层 =====
(function () {
  window.XDEX_REMOTE = __XDEX_REMOTE__;
  var scan = function () {
    Array.prototype.forEach.call(document.images, function (i) {
      if (i.dataset.xdexFixed) return;
      var src = i.getAttribute('src') || '';
      if (!src || src.indexOf('data:') === 0) return;
      var doubleProto = (src.match(/:\\/\\//g) || []).length >= 2;   // 拼坏的双协议 thumb-src
      var isLocal = src.indexOf('favor/') === 0;                     // 本地缺失
      if (!doubleProto && !isLocal) return;
      var name = src.split('/').pop().split('?')[0];
      var remote = window.XDEX_REMOTE[name];
      if (remote && remote !== src) { i.dataset.xdexFixed = '1'; i.src = remote; }
      else if (!remote) { i.dataset.xdexFixed = 'missing'; }
    });
  };
  setInterval(scan, 400);

  // 元数据染色：标题=红（原版语义）、名称/Email=正绿、SAGE=红；去掉 标题：/名称：/Email： 前缀
  var css = document.createElement('style');
  css.textContent = '.comment-info p{color:red!important}'
    + '.comment-info p.xdex-name{color:green!important}'
    + '.comment-info p.sage{color:red!important}';
  document.head.appendChild(css);
  var decorate = function () {
    Array.prototype.forEach.call(document.querySelectorAll('.comment-info p'), function (p) {
      if (p.dataset.xdexDecorated) return;
      var txt = p.textContent || '';
      if (txt.indexOf('标题：') === 0) { p.textContent = txt.slice(3); p.className = ''; p.dataset.xdexDecorated = '1'; }
      else if (txt.indexOf('名称：') === 0) { p.textContent = txt.slice(3); p.className = 'xdex-name'; p.dataset.xdexDecorated = '1'; }
      else if (txt.indexOf('Email：') === 0) { p.textContent = txt.slice(6); p.className = 'xdex-name'; p.dataset.xdexDecorated = '1'; }
    });
  };
  setInterval(decorate, 500);

  // 拦截「没有此页数据」弹窗 → 页面内提示（增量包缺页是常态，不该打断阅读）
  window.alert = function (msg) {
    if (String(msg || '').indexOf('没有此页数据') >= 0) return;   // 适配层另行提示
    var orig = document.createElement('iframe');                  // 其余 alert 仍走原语义
    orig.style.display = 'none';
    document.body.appendChild(orig);
    orig.contentWindow.alert(msg);
    orig.remove();
  };

  // 下载缺失图片到本地（File System Access；需用户选离线包根目录）
  var b = document.createElement('button');
  b.id = 'xdex-download-images';
  b.textContent = '\\u2b07 下载缺失图片到本地';
  b.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:99999;padding:8px 14px;'
    + 'background:#0ac;color:#fff;border:0;border-radius:6px;cursor:pointer;font-size:13px;';
  b.onclick = async function () {
    try {
      if (typeof window.showDirectoryPicker !== 'function') { b.textContent = '当前浏览器不支持'; return; }
      var dir = await window.showDirectoryPicker({ mode: 'readwrite' });
      var favor = await dir.getDirectoryHandle('favor');
      var threads = await favor.getDirectoryHandle('threads');
      var count = 0, fail = 0, skip = 0;
      var tids = {};
      Array.prototype.forEach.call(document.querySelectorAll('#oplist-section .content article'), function (a) {
        var tid = (a.getAttribute('data-tid') || '').replace(/^t/, '');
        if (tid) tids[tid] = 1;
      });
      for (var tid in tids) {
        var thDir = null;
        try { thDir = await threads.getDirectoryHandle('t' + tid); } catch (_) { continue; }
        var imgDir = null;
        try { imgDir = await thDir.getDirectoryHandle('images'); }
        catch (_) { imgDir = await thDir.getDirectoryHandle('images', { create: true }); }
        for (var name in window.XDEX_REMOTE) {
          try { await imgDir.getFileHandle(name); skip++; continue; } catch (_) {}
          try {
            var resp = await fetch(window.XDEX_REMOTE[name]);
            if (!resp.ok) { fail++; continue; }
            var fh = await imgDir.getFileHandle(name, { create: true });
            var w = await fh.createWritable();
            await w.write(await resp.blob());
            await w.close();
            count++;
          } catch (_) { fail++; }
        }
      }
      b.textContent = '\\u2713 新下载 ' + count + ' 张（已存在 ' + skip + '\\uff0c失败 ' + fail + '\\uff09';
      setTimeout(function () { location.reload(); }, 1500);
    } catch (err) {
      if (err && err.name !== 'AbortError') b.textContent = '失败：' + (err && err.message || err);
    }
  };
  var mount = function () { document.body.appendChild(b); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
</script>
`;
function decodeOriginalViewer() {
  // atob 返回 latin1 串；原文件是 UTF-8（含 BOM/中文）→ 必须按字节转 TextDecoder 解码，
  // 直接当 UTF-8 字符串写盘会把中文/BOM 全部损坏
  const bin = atob(XDEX_ORIGINAL_VIEWER_B64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}
function buildOriginalViewerHtml(remoteMap) {
  const adapter = XDEX_EXPORT_VIEWER_ADAPTER.replace('__XDEX_REMOTE__', JSON.stringify(remoteMap));
  const html = decodeOriginalViewer();
  if (!html.includes('</body>')) throw new Error('内嵌查看器模板异常');
  return html.replace('</body>', adapter + '\n</body>');
}

function xdexOfflineViewerHtml(remoteMap, threadTitle) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${threadTitle}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{color-scheme:light dark;--fg:#1a1a1a;--muted:#777;--bg:#efeff4;--card:#fff;--line:#dcdce2;--quote:#789922}
  @media (prefers-color-scheme:dark){:root{--fg:#ddd;--muted:#999;--bg:#181818;--card:#242424;--line:#333;--quote:#b5d06d}}
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  html,body{height:100%;margin:0}
  body{background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,"Microsoft YaHei",sans-serif;display:flex;overflow:hidden}
  section{display:flex;flex-direction:column;height:100%;min-width:0}
  header{flex:0 0 auto;padding:12px 16px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:10px}
  h1{font-size:16px;margin:0;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .sub{color:var(--muted);font-size:12px;margin-left:auto;white-space:nowrap}
  .scroll{flex:1 1 auto;overflow-y:auto;padding:12px}
  #list-pane{width:38%;min-width:280px;max-width:520px;border-right:1px solid var(--line);background:var(--card)}
  .item{padding:10px 12px;border-bottom:1px solid var(--line);cursor:pointer}
  .item[aria-selected="true"]{background:rgba(0,170,204,.16);box-shadow:inset 3px 0 0 #0ac}
  .item-title{font-weight:600;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .item-meta{color:var(--muted);font-size:12px}
  .item-snippet{color:var(--muted);font-size:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  #thread-pane{flex:1 1 auto}
  article{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px 14px;margin:0 0 12px}
  .head{color:var(--muted);font-size:13px;margin-bottom:8px}
  .head .id{color:var(--fg);font-weight:600}
  .head .po{color:#c00;font-weight:600}
  .body{overflow-wrap:anywhere}
  .body font[color="#789922"]{color:var(--quote)}
  .body img{max-width:100%;border-radius:6px;margin-top:8px;display:block}
  .body a{color:#2b7de9}
  .body blockquote{margin:4px 0;padding:4px 10px;border-left:3px solid var(--quote);background:rgba(120,153,34,.08);cursor:pointer}
  .body blockquote .quote-area{display:none;margin-top:6px;border-top:1px dashed var(--line);padding-top:6px}
  .body blockquote.quote-show .quote-area{display:block}
  .more{display:block;margin:8px auto 24px;padding:7px 18px;border-radius:6px;border:1px solid var(--line);background:var(--card);color:var(--fg);cursor:pointer}
  .empty{color:var(--muted);text-align:center;padding:40px 12px}
  .dl-btn{position:fixed;right:12px;bottom:12px;z-index:99;padding:8px 14px;background:#0ac;color:#fff;border:0;border-radius:6px;cursor:pointer;font-size:13px}
  @media (max-width:899px){
    #list-pane{width:100%;max-width:none;border-right:0}
    #thread-pane{position:fixed;inset:0;z-index:20;transform:translateX(100%)}
    body.thread-open #thread-pane{transform:translateX(0)}
    .back{display:inline-block;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:13px;margin-right:8px}
  }
  .back{display:none}
</style>
</head>
<body>
<section id="list-pane">
  <header><h1>导出列表</h1><span class="sub" id="list-count"></span></header>
  <div class="scroll" id="list"></div>
</section>
<section id="thread-pane">
  <header><button class="back" id="back">返回</button><h1 id="thread-title"></h1><span class="sub" id="thread-meta"></span></header>
  <div class="scroll" id="thread"></div>
</section>
<button class="dl-btn" id="dl-btn" style="display:none">⬇ 下载缺失图片到本地</button>
<script>
(function () {
  var REMOTE = ${JSON.stringify(remoteMap)};
  var TID = __TID__;
  var PAGES = __PAGES__;
  var page = 0, loading = false;

  window._set_data_ = function (data) { renderPage(data); };

  function esc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function loadJsonp(src){
    return new Promise(function(res,rej){
      var s=document.createElement('script');s.src=src;
      s.onload=function(){s.remove();res()};s.onerror=function(){s.remove();rej(new Error('无法加载 '+src))};
      document.head.appendChild(s);
    });
  }
  function imgFallback(scope){
    Array.prototype.forEach.call((scope||document).querySelectorAll('img'),function(i){
      if(i.dataset.fixed)return;
      var src=i.getAttribute('src')||'';
      if(!src||src.indexOf('data:')===0)return;
      var local=src.indexOf('favor/')===0;
      var broken=(src.match(/:\\/\\//g)||[]).length>=2;
      if(!local&&!broken)return;
      var name=src.split('/').pop().split('?')[0];
      if(REMOTE[name]){i.dataset.fixed='1';i.src=REMOTE[name];}
      else{i.dataset.fixed='missing';}
    });
  }
  // 拓展引用格式：No.xxxxxxxx / >>xxxxxxxx / 裸8位数字 → 绿色可点击引用
  function extendQuotes(scope){
    (scope||document).querySelectorAll('.body').forEach(function(el){
      if(el.dataset.xdq)return; el.dataset.xdq='1';
      var walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null);
      var nodes=[],n;
      while((n=walker.nextNode())){
        var p=n.parentElement;
        if(p&&p.tagName==='FONT'&&p.getAttribute('color')==='#789922')continue;
        if(/\\d/.test(n.nodeValue))nodes.push(n);
      }
      nodes.forEach(function(node){
        var text=node.nodeValue,frag=document.createDocumentFragment(),cur=0,re=/(?:>>)?No\\.(\\d{8})\\b|(?:>>)?(?<!\\d)(\\d{8})(?!\\d)/g,m,changed=false;
        while((m=re.exec(text))){
          if(m.index>cur)frag.appendChild(document.createTextNode(text.slice(cur,m.index)));
          var f=document.createElement('font');f.setAttribute('color','#789922');
          f.textContent=text.slice(m.index,re.lastIndex);
          f.style.cursor='pointer';
          f.addEventListener('click',function(){toggleQuote(this.textContent.match(/\\d{8}/)[0],f)});
          frag.appendChild(f);cur=re.lastIndex;changed=true;
        }
        if(changed){if(cur<text.length)frag.appendChild(document.createTextNode(text.slice(cur)));node.replaceWith(frag);}
      });
    });
  }
  function toggleQuote(refNo,fontEl){
    var existing=fontEl.parentElement.querySelector('blockquote[data-ref="'+refNo+'"]');
    if(existing){existing.classList.toggle('quote-show');return;}
    // 本地缓存（已渲染过的页面）命中则展开，否则提示未导出
    var hit=(window.__pageCache||{})[refNo];
    var bq=document.createElement('blockquote');
    bq.setAttribute('data-ref',refNo);bq.classList.add('quote-show');
    if(hit){
      bq.innerHTML='<div class="quote-area"><b>'+esc(hit.id)+'</b> '+esc(hit.now)+'<br>'+hit.content+'</div>';
    }else{
      bq.innerHTML='<div class="quote-area" style="color:var(--muted)">No.'+esc(refNo)+' 不在已导出的页面中（引用展开需要导出包含该回复的页面）</div>';
    }
    fontEl.parentElement.insertBefore(bq,fontEl.nextSibling);
  }
  function renderEntry(e,isOp){
    var src=e.fileName?('favor/threads/t'+TID+'/images/'+e.fileName):(e.img||'');
    // 标题红（原版语义）、名称绿：从 content 之外的字段拼进头部行
    var titleHtml=(e.title&&e.title!=='无标题')?' <span style="color:red">'+esc(e.title)+'</span>':'';
    var nameHtml=(e.name&&e.name!=='无名氏')?' <span style="color:green">'+esc(e.name)+'</span>':'';
    return '<article><div class="head"><span class="id">'+esc(e.id)+'</span>'
      +(isOp?' <span class="po">(Po)</span>':'')
      +' | #'+esc(String(e.userid||'').slice(0,7))+' | '+esc(e.now)
      +titleHtml+nameHtml+'</div>'
      +'<div class="body">'+(e.content||'')
      +(src?'<img src="'+esc(src)+'" alt="'+esc(e.fileName||'')+'" loading="lazy">':'')
      +'</div></article>';
  }
  function renderPage(data){
    var replies=Array.isArray(data.replys)?data.replys:[];
    window.__pageCache=window.__pageCache||{};
    replies.forEach(function(r){window.__pageCache[r.id]=r;});
    var html=replies.map(function(r,i){return renderEntry(r,page===1&&i===0)}).join('');
    if(page===1)document.getElementById('thread').innerHTML='';
    document.getElementById('thread').insertAdjacentHTML('beforeend',html);
    var more=document.getElementById('more');if(more)more.remove();
    if(page<PAGES){
      document.getElementById('thread').insertAdjacentHTML('beforeend','<button class="more" id="more">加载第 '+(page+1)+' / '+PAGES+' 页</button>');
      document.getElementById('more').onclick=nextPage;
    }
    document.getElementById('thread-title').textContent='No.'+data.id;
    document.getElementById('thread-meta').textContent='第 '+page+' / '+PAGES+' 页';
    loading=false;
    imgFallback();extendQuotes(document.getElementById('thread'));
  }
  function nextPage(){
    if(loading||page>=PAGES)return;
    loading=true;page++;
    loadJsonp('favor/threads/t'+TID+'/data/'+page+'.data')
      .catch(function(e){loading=false;document.getElementById('thread-meta').textContent=e.message+'（增量包可补导出该页）'});
  }
  document.getElementById('back').addEventListener('click',function(){document.body.classList.remove('thread-open')});
  // 列表：单串包只显示当前串（多串由外部索引扩展）
  document.getElementById('list').innerHTML='<div class="item" aria-selected="true"><div class="item-title">'+esc(__TITLE__)+'</div><div class="item-meta">No.'+esc(TID)+' · 共 '+PAGES+' 页已导出</div><div class="item-snippet">点击右侧查看内容</div></div>';
  document.getElementById('list-count').textContent='1 个串';
  document.querySelector('#list .item').addEventListener('click',function(){document.body.classList.add('thread-open');nextPage()});
  // 桌面端直接加载第一页；移动端点列表后再加载
  if(innerWidth>=900)nextPage();
  // 下载缺失图片（File System Access）
  document.getElementById('dl-btn').style.display='block';
  document.getElementById('dl-btn').onclick=async function(){
    try{
      if(typeof showDirectoryPicker!=='function'){this.textContent='当前浏览器不支持';return;}
      var dir=await showDirectoryPicker({mode:'readwrite'});
      var thDir=await dir.getDirectoryHandle('favor').then(function(f){return f.getDirectoryHandle('threads')}).then(function(t){return t.getDirectoryHandle('t'+TID)});
      var imgDir;try{imgDir=await thDir.getDirectoryHandle('images')}catch(e){imgDir=await thDir.getDirectoryHandle('images',{create:true})}
      var count=0,skip=0,fail=0;
      for(var name in REMOTE){
        try{await imgDir.getFileHandle(name);skip++;continue}catch(e){}
        try{
          var resp=await fetch(REMOTE[name]);if(!resp.ok){fail++;continue}
          var fh=await imgDir.getFileHandle(name,{create:true});var w=await fh.createWritable();
          await w.write(await resp.blob());await w.close();count++;
        }catch(e){fail++}
      }
      this.textContent='✓ 新下载 '+count+' 张（已存在 '+skip+'，失败 '+fail+'）';
      setTimeout(function(){location.reload()},1500);
    }catch(err){if(err&&err.name!=='AbortError')this.textContent='失败：'+(err&&err.message||err)}
  };
})();
</script>
</body>
</html>`;
}

function xdexExportToNmbEntrySC(entry, downloadImages) {
  const imgName = String(entry.img || '').trim();
  const fileName = imgName ? imgName.split('/').pop() + String(entry.ext || '').trim() : '';
  return {
    id: String(entry.id || '').trim(),
    userid: xdexExportShortHash(entry.userHash).replace(/^#/, ''),
    admin: 0,
    name: String(entry.name || '').trim() || '无名氏',
    email: String(entry.email || '').trim(),
    title: String(entry.title || '').trim() || '无标题',
    now: String(entry.now || '').trim(),
    content: String(entry.content || ''),
    img: downloadImages ? '' : xdexExportImageUrl(entry.img, entry.ext),
    ext: '',
    fileName: downloadImages ? fileName : '',
    sage: '0',
    status: 'n'
  };
}

// 保存 HTML 离线包（ScriptCat：GM_download 天然支持子目录）
async function saveOfflinePackage(tid, title, entries, totalReplies, downloadImages) {
  const sub = `X岛-EX/HTML/${tid}`;
  const dataDir = `${sub}/favor/threads/t${tid}/data`;
  const imgDir = `${sub}/favor/threads/t${tid}/images`;

  const remoteMap = {};
  entries.forEach((e) => {
    const name = String(e.img || '').trim() ? String(e.img).trim().split('/').pop() + String(e.ext || '').trim() : '';
    const url = xdexExportImageUrl(e.img, e.ext);
    if (name && url) remoteMap[name] = url;
  });

  // 按页分组写 .data
  const byPage = new Map();
  entries.forEach((e) => {
    const p = Number(e.page) || 1;
    if (!byPage.has(p)) byPage.set(p, []);
    byPage.get(p).push(e);
  });
  const pageCount = Math.max.apply(null, Array.from(byPage.keys()).concat([1]));
  for (const [page, list] of byPage) {
    const payload = {
      id: String(tid), fid: '',
      now: String(list[0] && list[0].now || ''),
      userid: xdexExportShortHash(list[0] && list[0].userHash).replace(/^#/, ''),
      name: '无名氏', email: '', title,
      content: title, sage: '0', admin: '0', status: 'n',
      replyCount: String(totalReplies || ''),
      replys: list.map((e) => xdexExportToNmbEntrySC(e, downloadImages))
    };
    await saveFile(`${dataDir}/${page}.data`, `_set_data_(${JSON.stringify(payload)});`, 'text/javascript');
  }

  // favor.index（单串）
  const op = entries.find((e) => e.isOp) || entries[0] || {};
  const idx = Object.assign(xdexExportToNmbEntrySC(op, downloadImages), {
    id: String(tid), fid: '', title,
    replyCount: String(totalReplies || ''), created: Date.now()
  });
  await saveFile(`${sub}/favor/favor.index`, `_set_data_(${JSON.stringify([idx])});`, 'text/javascript');

  // 查看器（内嵌，无外部文件依赖）
  const viewer = buildOriginalViewerHtml(remoteMap);
  await saveFile(`${sub}/离线浏览.html`, viewer, 'text/html');

  // 图片（可选）
  if (downloadImages) {
    const seen = new Set();
    for (const e of entries) {
      const name = String(e.img || '').trim() ? String(e.img).trim().split('/').pop() + String(e.ext || '').trim() : '';
      const url = xdexExportImageUrl(e.img, e.ext);
      if (!name || !url || seen.has(name)) continue;
      seen.add(name);
      try {
        const buf = await new Promise((resolve, reject) => {
          GM_xmlhttpRequest({
            method: 'GET', url, responseType: 'arraybuffer',
            onload: (r) => r.status === 200 ? resolve(new Uint8Array(r.response)) : reject(new Error('HTTP ' + r.status)),
            onerror: () => reject(new Error('网络错误')), ontimeout: () => reject(new Error('超时'))
          });
        });
        await downloadBinaryOnce(`${imgDir}/${name}`, buf, 'image/' + String(e.ext || '.png').replace('.', ''));
      } catch (err) {
        bgLog('info', `图片下载失败（跳过，离线包内走外链回退）：${name} ${err && err.message}`);
      }
    }
  }
  return `${sub}/离线浏览.html`;
}

async function runExport(details, taskId) {
  const { tid, format = 'md', cookie = '', from: reqFrom, to: reqTo, poOnly = false } = details || {};
  if (!/^\d{4,9}$/.test(String(tid || ''))) throw new Error('串号格式不正确');

  const firstText = await fetchPageWithCookieFallback(tid, 1, cookie);
  const first = xdexExportParseThreadResponse(firstText, 1);

  const totalPages = first.totalPages;
  const startPage = Math.min(Math.max(1, Number(reqFrom) || 1), totalPages);
  // to=0 是「全部页」哨兵，不能被抬高为 1
  const endPage = Number(reqTo) > 0 ? Math.min(Math.max(Number(reqTo), startPage), totalPages) : totalPages;

  // 首页同时给出标题，尽早落库，让缩略条在抓取阶段就能显示标题而非只有串号
  const opEarly = first.entries.find((e) => e.isOp) || {};
  const earlyTitle = xdexExportPickTitle(opEarly.title, opEarly.content);
  if (taskId && earlyTitle) updateTask(taskId, { title: earlyTitle });

  // 首页抓到后才知道总页数，此时才把进度区间落库（首页已抓到，若在范围内则计入完成）
  const donePages = [];
  const entries = first.entries.slice();
  if (startPage === 1) donePages.push(1);
  if (taskId) updateTask(taskId, {
    totalPages,
    progress: {
      donePages: donePages.slice(),
      currentPage: startPage === 1 ? 1 : 0,
      totalPages: endPage - startPage + 1,
      entries: entries.length
    }
  });
  // 取消时不丢弃已抓内容：跳出循环后按「实际完成页」导出（文件名记为 1-20 而非 1-300）
  for (let page = startPage === 1 ? 2 : startPage; page <= endPage; page += 1) {
    if (cancelFlags.has(taskId)) break; // 取消发生在抓下一页之前 → 不再发起新请求
    await sleep(300);
    const t = await fetchPageWithCookieFallback(tid, page, cookie);
    entries.push(...xdexExportParseThreadResponse(t, page).entries);
    donePages.push(page); // 已取回的页面即视为完成，计入导出
    if (taskId) updateTask(taskId, {
      progress: {
        donePages: donePages.slice(),
        currentPage: page,
        totalPages: endPage - startPage + 1,
        entries: entries.length
      }
    });
  }
  const canceled = !!taskId && cancelFlags.has(taskId);
  // 若 startPage > 1，首页仅用于探测，需剔除其条目
  const finalEntries = startPage === 1 ? entries : entries.filter((e) => e.page >= startPage);

  const op = finalEntries.find((e) => e.isOp) || first.entries.find((e) => e.isOp) || {};
  let title = xdexExportPickTitle(op.title, op.content);
  if (!title) title = `串${tid}`;

  const doc = xdexExportBuildDocument({
    format, tid, title, entries: finalEntries
  });
  // 文件名按「实际完成页」而非计划范围
  const doneFrom = donePages.length ? donePages[0] : startPage;
  const doneTo = donePages.length ? donePages[donePages.length - 1] : 0;
  if (format === 'html') {
    // HTML 离线包：多文件（nimingban 目录结构），逐个 GM_download 落子目录
    const filename = await saveOfflinePackage(tid, title, finalEntries, first.totalReplies, details.htmlDownloadImages);
    bgLog('info', `${canceled ? '已取消，导出已完成部分' : '导出完成'} ${tid}：《${title}》第 ${doneFrom}-${doneTo}/${totalPages} 页，${finalEntries.length} 条 → ${filename}`);
    return {
      ok: true, canceled, filename, title, totalPages,
      pages: `${doneFrom}-${doneTo}`, entries: finalEntries.length
    };
  }
  const filename = `X岛-EX/${xdexExportBuildFileName(tid, title, doneFrom, doneTo, format)}`;
  const mime = format === 'txt' ? 'text/plain' : 'text/markdown';
  const saved = await saveFile(filename, doc, mime);

  bgLog('info', `${canceled ? '已取消，导出已完成部分' : '导出完成'} ${tid}：《${title}》第 ${doneFrom}-${doneTo}/${totalPages} 页，${finalEntries.length} 条 → ${saved}`);
  return {
    ok: true,
    canceled,
    filename: saved,
    title,
    totalPages,
    pages: `${doneFrom}-${doneTo}`,
    entries: finalEntries.length
  };
}

// ---- 处理来自桥接的请求 ----
async function handleRequest(req) {
  const { id, type, details } = req || {};
  const respond = (payload) => {
    try { GM_setValue(RES_KEY, Object.assign({ id, at: Date.now() }, payload)); } catch (_e) {}
  };
  try {
    switch (type) {
      case 'xdex:export:probe': {
        const tid = String((details && details.tid) || '');
        if (!/^\d{4,9}$/.test(tid)) throw new Error('串号格式不正确');
        const text = await fetchPageWithCookieFallback(tid, 1, (details && details.cookie) || '');
        const parsed = xdexExportParseThreadResponse(text, 1);
        const op = parsed.entries.find((e) => e.isOp) || {};
        respond({ ok: true, data: {
          tid,
          title: op.title || '',
          fid: parsed.fid || '',
          totalPages: parsed.totalPages,
          totalReplies: parsed.totalReplies
        } });
        break;
      }
      case 'xdex:export:submit': {
        const tid = String((details && details.tid) || '');
        if (!/^\d{4,9}$/.test(tid)) throw new Error('串号格式不正确');
        const _from = Math.max(1, Number(details.from) || 1);
        const _to = Math.max(0, Number(details.to) || 0);
        const _tp = Math.max(0, Number(details.totalPages) || 0);
        const plannedPages = (_to > 0) ? Math.max(0, _to - _from + 1) : (_tp > 0 ? Math.max(0, _tp - _from + 1) : 0);
        const taskId = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const st = readTasks();
        st.tasks.unshift({
          id: taskId,
          tid,
          title: '',
          from: _from,
          to: _to,
          // 串总页数（区别于 progress.totalPages=本次计划页数）；0 表示未知
          totalPages: _tp,
          format: (details && details.format) === 'txt' ? 'txt' : (details && details.format) === 'html' ? 'html' : 'md',
          htmlDownloadImages: (details && details.format) === 'html' ? !!(details && details.htmlDownloadImages) : undefined,
          status: 'queued',
          // 入队时就写「本次计划页数」：避免抓到首页前列表显示成 0/总页数（如 0/324）
          progress: { donePages: [], currentPage: 0, totalPages: plannedPages, entries: 0 },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          finishedAt: 0,
          filename: '',
          error: ''
        });
        writeTasks(st);
        // 立即回执，让页面弹窗收尾；实际抓取交由队列**按顺序**执行（进度经 list 轮询呈现）
        respond({ ok: true, data: { id: taskId, tid, status: 'queued', queueLength: exportQueue.length + 1 } });
        enqueueExport(taskId, details);
        break;
      }
      case 'xdex:export:list': {
        const tasks = GM_getValue(TASKS_KEY, { tasks: [], history: [] });
        respond({ ok: true, data: tasks && typeof tasks === 'object' ? tasks : { tasks: [], history: [] } });
        break;
      }
      case 'xdex:export:cancel': {
        const taskId = String((details && details.id) || '');
        if (taskId) cancelFlags.add(taskId);
        respond({ ok: true, data: readTasks() });
        break;
      }
      case 'xdex:export:remove-history': {
        const taskId = String((details && details.id) || '');
        const st = readTasks();
        st.history = st.history.filter((t) => !t || t.id !== taskId);
        writeTasks(st);
        respond({ ok: true, data: st });
        break;
      }
      case 'xdex:export:clear-history': {
        const st = readTasks();
        st.history = [];
        writeTasks(st);
        respond({ ok: true, data: st });
        break;
      }
      default:
        respond({ ok: false, error: '不支持的请求类型：' + String(type) });
    }
  } catch (e) {
    respond({ ok: false, error: String((e && e.message) || e) });
  }
}

// ---- 主循环 ----
const HANDLED_KEY = 'xdex_export_last_req';
// 去重：同一请求只处理一次（监听器与轮询兜底可能都看到它）
function handleOnce(req) {
  if (!req || typeof req !== 'object' || !req.id) return;
  let last = '';
  try { last = String(GM_getValue(HANDLED_KEY, '') || ''); } catch (_e) {}
  if (String(req.id) === last) return;
  try { GM_setValue(HANDLED_KEY, String(req.id)); } catch (_e) {}
  handleRequest(req);
}

// 僵尸任务回收：后台脚本能启动，就说明上一次运行已经结束 ——
// 任何仍标记为 running/queued 的任务都不可能还在跑（页面关闭、浏览器重启、脚本重载
// 都会让抓取中断，而存储里的状态会残留）。不回收的话，页面侧会把它当成"有在跑的任务"
// 而永远轮询下去（这本身就是持续开销）。
function reapStaleTasks() {
  const st = readTasks();
  const stale = [];
  const kept = [];
  st.tasks.forEach((t) => {
    if (t && (t.status === 'running' || t.status === 'queued')) stale.push(t);
    else if (t) kept.push(t);
  });
  if (!stale.length) return 0;
  stale.forEach((t) => {
    st.history.unshift(Object.assign({}, t, {
      status: 'interrupted',
      error: '中断：后台脚本重启或页面/浏览器关闭，任务未能跑完',
      finishedAt: Date.now()
    }));
  });
  st.tasks = kept;
  st.history = st.history.slice(0, 50);
  writeTasks(st);
  return stale.length;
}

function main() {
  const reaped = reapStaleTasks();
  bgLog('info', `后台脚本已启动（v1.0.0），GM_download=${typeof GM_download}`
    + (reaped ? `；已回收 ${reaped} 个中断的任务` : ''));
  GM_addValueChangeListener(REQ_KEY, (name, oldValue, newValue) => { handleOnce(newValue); });
  // 补处理启动前遗留的请求（后台被回收后重启的场景）
  handleOnce(GM_getValue(REQ_KEY, null));
  // 轮询兜底：万一跨脚本值变更事件未按预期触发，仍能收到指令（靠 handleOnce 去重）
  setInterval(() => {
    try { handleOnce(GM_getValue(REQ_KEY, null)); } catch (_e) {}
  }, 1500);
  // 常驻
  return new Promise(() => {});
}

return main();
