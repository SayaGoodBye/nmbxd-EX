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

// ---- 单串导出 ----
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
          format: (details && details.format) === 'txt' ? 'txt' : 'md',
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
