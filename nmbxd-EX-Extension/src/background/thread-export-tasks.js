'use strict';

// X岛-EX 串导出任务队列（Service Worker 侧）
// 依赖：thread-export.js（需在其后引入）

const XDEX_EXPORT_TASKS_KEY = 'xdex-export-tasks';
const XDEX_EXPORT_HISTORY_LIMIT = 50;

function xdexExportNow() {
  return Date.now();
}

function xdexExportRandomId() {
  return `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- 存储 ----------
async function xdexExportReadTasks() {
  try {
    const stored = await chrome.storage.local.get(XDEX_EXPORT_TASKS_KEY);
    const value = stored && stored[XDEX_EXPORT_TASKS_KEY];
    if (!value || typeof value !== 'object') return { tasks: [], history: [] };
    return {
      tasks: Array.isArray(value.tasks) ? value.tasks : [],
      history: Array.isArray(value.history) ? value.history : []
    };
  } catch (_e) {
    return { tasks: [], history: [] };
  }
}

async function xdexExportWriteTasks(state) {
  // FileSystemHandle 不可 JSON 序列化（chrome.storage 会剥离）→ 落盘前剥离，
  // 运行中的句柄由 xdexExportRuntime 保存（SW 存活期内有效）
  const strip = (t) => {
    if (!t || typeof t !== 'object') return t;
    if (!('dirHandle' in t)) return t;
    const copy = Object.assign({}, t);
    delete copy.dirHandle;
    return copy;
  };
  const payload = {
    tasks: (Array.isArray(state.tasks) ? state.tasks : []).map(strip),
    history: (Array.isArray(state.history) ? state.history : []).slice(0, XDEX_EXPORT_HISTORY_LIMIT).map(strip)
  };
  await chrome.storage.local.set({ [XDEX_EXPORT_TASKS_KEY]: payload });
  await xdexExportUpdateBadge();
  return payload;
}

// SW 存活期内的任务句柄缓存：taskId → FileSystemDirectoryHandle
// （任务从 tasks 轮转进 history 后句柄即不再需要；SW 被回收则依赖页面侧重发或回退 ZIP）
const xdexExportDirHandles = new Map();
// 最近一次目录写入回退 ZIP 的原因（供任务 error 字段补充说明）
let lastDirFallbackReason = '';

async function xdexExportUpdateTask(taskId, patch) {
  const state = await xdexExportReadTasks();
  const index = state.tasks.findIndex((t) => t && t.id === taskId);
  if (index < 0) return null;
  state.tasks[index] = Object.assign({}, state.tasks[index], patch, { updatedAt: xdexExportNow() });
  await xdexExportWriteTasks(state);
  return state.tasks[index];
}

async function xdexExportUpdateBadge() {
  try {
    const state = await xdexExportReadTasks();
    const running = state.tasks.filter((t) => t && (t.status === 'running' || t.status === 'queued')).length;
    await chrome.action.setBadgeText({ text: running > 0 ? String(running) : '' });
    if (running > 0) {
      await chrome.action.setBadgeBackgroundColor({ color: '#8f4a2f' });
    }
  } catch (_e) {
    // badge 不可用（如测试环境）时静默
  }
}

// ---------- 内存中的运行态（SW 被回收后由 alarms 恢复） ----------
const xdexExportRuntime = new Map(); // taskId -> { canceled, controller }

// ---------- 导出队列（顺序执行） ----------
// 批量提交时多个任务会先后到达；串行执行可避免并发抓取叠加请求频率。
// SW 被回收后队列会丢失，但任务状态已持久化，alarm 续跑时会重新入队。
const xdexExportQueue = [];
let xdexExportPumping = false;

function xdexExportEnqueue(taskId) {
  if (!taskId) return;
  if (xdexExportRuntime.has(taskId)) return; // 已在执行
  if (xdexExportQueue.indexOf(taskId) >= 0) return;
  xdexExportQueue.push(taskId);
  xdexExportPump();
}

function xdexExportPump() {
  if (xdexExportPumping) return;
  const nextId = xdexExportQueue.shift();
  if (!nextId) return;
  xdexExportPumping = true;
  Promise.resolve()
    .then(() => xdexExportRunTask(nextId))
    .catch(() => {})
    .then(() => {
      xdexExportPumping = false;
      xdexExportPump();
    });
}

// ---------- 提交 ----------
async function xdexExportSubmit(input) {
  const tid = String((input && input.tid) || '').trim();
  if (!/^\d{4,9}$/.test(tid)) throw new Error('串号格式不正确');
  const state = await xdexExportReadTasks();
  const duplicate = state.tasks.find((t) => t && t.tid === tid && (t.status === 'running' || t.status === 'queued'));
  if (duplicate) throw new Error('该串已有导出任务进行中');

  // 本次计划页数：to>0 → 区间长度；to=0（全部页）→ 总页数减起始偏移
  const plannedPages = (function () {
    const f = Math.max(1, Number((input && input.from) || 1));
    const t = Math.max(0, Number((input && input.to) || 0));
    const tp = Math.max(0, Number((input && input.totalPages) || 0));
    if (t > 0) return Math.max(0, t - f + 1);
    if (tp > 0) return Math.max(0, tp - f + 1);
    return 0;
  })();

  const task = {
    id: xdexExportRandomId(),
    tid,
    title: String((input && input.title) || '').trim(),
    fid: String((input && input.fid) || '').trim(),
    from: Math.max(1, Number((input && input.from) || 1)),
    // to = 0 是「全部页」哨兵，不能被 Math.max(1, …) 抬高成 1，否则只下载第一页
    to: Math.max(0, Number((input && input.to) || 0)),
    // totalPages = 0 表示未知，抓取首页后由 totalReplies 推算（不可抬高为 1，否则会截断为单页）
    totalPages: Math.max(0, Number((input && input.totalPages) || 0)),
    totalReplies: Number((input && input.totalReplies) || 0) || 0,
    format: (input && input.format) === 'txt' ? 'txt' : (input && input.format) === 'html' ? 'html' : 'md',
    poOnly: !!(input && input.poOnly),
    // HTML 离线包：是否随导出下载图片（默认 false → 外链模式，导出快；true → 抓图写入 images/）
    htmlDownloadImages: (input && input.format) === 'html' ? !!(input && input.htmlDownloadImages) : undefined,
    // 自定义导出目录句柄（页面 picker 获取，跨 sendMessage 传入；SW 用 FS Access 写 API 直写）。
    // FileSystemHandle 只能存内存/IndexedDB（chrome.storage 序列化会剥离句柄）→ 存内存 Map。
    dirHandle: (input && input.format) === 'html' && input.dirHandle && typeof input.dirHandle.getDirectoryHandle === 'function' ? input.dirHandle : null,
    dirName: (input && input.format) === 'html' && input.dirHandle ? String(input.dirHandle.name || '') : '',
    progress: {
      donePages: [],
      currentPage: 0,
      // 入队时就写「本次计划页数」：避免抓到首页前列表显示成 0/总页数（如 0/324）
      totalPages: plannedPages,
      entries: 0
    },
    cookieHeader: String((input && input.cookieHeader) || ''),
    status: 'queued',
    createdAt: xdexExportNow(),
    updatedAt: xdexExportNow(),
    finishedAt: 0,
    filename: '',
    error: ''
  };
  state.tasks.unshift(task);
  if (task.dirHandle) xdexExportDirHandles.set(task.id, task.dirHandle);
  await xdexExportWriteTasks(state);
  await xdexExportEnsureAlarm();
  // 交给队列按顺序执行；不阻塞消息响应
  xdexExportEnqueue(task.id);
  return { id: task.id, status: 'queued', queueLength: xdexExportQueue.length };
}

// ---------- 检索（验证串号 + 取回标题/总页数） ----------
async function xdexExportProbe(input) {
  const tid = String((input && input.tid) || '').trim();
  if (!/^\d{4,9}$/.test(tid)) throw new Error('串号格式不正确');
  const cookieHeader = String((input && input.cookieHeader) || '');
  const pageData = await xdexExportFetchPage(tid, 1, { cookieHeader });
  const op = pageData.entries.find((e) => e.isOp) || pageData.entries[0] || {};
  return {
    tid,
    // 与落盘命名同一套规则：无标题时取主串第一句话
    title: xdexExportPickTitle(op.title, op.content),
    rawTitle: String(op.title || '').trim(),
    fid: pageData.fid || '',
    totalPages: pageData.totalPages,
    totalReplies: pageData.totalReplies
  };
}

// ---------- 取消 ----------
async function xdexExportCancel(taskId) {
  const runtime = xdexExportRuntime.get(taskId);
  if (runtime) {
    // 已有运行实例：只置取消标记，RunTask 会跳出循环并把「已完成页」导出后写入 history。
    // 不在这里移动任务，避免与 RunTask 的收尾竞争。
    runtime.canceled = true;
    try { runtime.controller && runtime.controller.abort(); } catch (_e) {}
    return { ok: true, deferred: true };
  }
  // 没有运行实例（例如排队中尚未开始）：此时没有已抓取内容，直接收尾
  const state = await xdexExportReadTasks();
  const index = state.tasks.findIndex((t) => t && t.id === taskId);
  if (index < 0) return { ok: true };
  const task = state.tasks[index];
  if (task.status === 'running' || task.status === 'queued') {
    task.status = 'canceled';
    task.finishedAt = xdexExportNow();
    task.error = '已取消（尚未开始抓取）';
    state.tasks.splice(index, 1);
    state.history.unshift(task);
    await xdexExportWriteTasks(state);
  }
  return { ok: true };
}

// ---------- 移除历史记录 ----------
async function xdexExportRemoveHistory(taskId) {
  const state = await xdexExportReadTasks();
  state.history = state.history.filter((t) => t && t.id !== taskId);
  await xdexExportWriteTasks(state);
  return { ok: true };
}

async function xdexExportClearHistory() {
  const state = await xdexExportReadTasks();
  state.history = [];
  await xdexExportWriteTasks(state);
  return { ok: true };
}

// ---------- 下载 ----------
// SW 无 DOM：把内容交给 offscreen document，用 <a download="文件名"> 触发下载，
// 这样浏览器才会采用我们生成的文件名（直接 downloads.download(blob:) 会退化成 UUID 名）。
async function xdexExportDownload(filename, content, mime) {
  const buffer = new TextEncoder().encode(content);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < buffer.length; i += chunk) {
    binary += String.fromCharCode.apply(null, buffer.subarray(i, i + chunk));
  }
  const base64 = btoa(binary);
  const response = await sendToOffscreen({
    type: 'xdex:export-save',
    base64,
    filename,
    contentType: `${mime};charset=utf-8`
  });
  if (!response || !response.ok) {
    throw new Error((response && response.error) || '保存文件失败');
  }
  return response.filename || filename;
}

// ---------- 执行任务 ----------
// ---------- HTML 离线包保存 ----------
// 产物：单个 ZIP（内含 nimingban 目录结构），锚点下载（扁平名，无劫持风险）。
// 不能用 downloads API：本机若装有注册 onDeterminingFilename 的扩展（如 Ghost Downloader），
// filename 参数会被整体忽略，全部落成 download.js。锚点下载不受该机制影响。
// ZIP 内目录结构（与 nimingban 官方包一致）：
//   离线浏览.html
//   favor/favor.index
//   favor/threads/t{tid}/data/{n}.data
//   favor/threads/t{tid}/images/*（可选）
function xdexExportCrc32(bytes) {
  if (!xdexExportCrc32.table) {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c;
    }
    xdexExportCrc32.table = table;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i += 1) crc = xdexExportCrc32.table[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// 最小 ZIP writer（store + deflate-raw via CompressionStream；Chrome SW 均可用）
async function xdexExportBuildZip(files) {
  const enc = new TextEncoder();
  const u16 = (n) => new Uint8Array([n & 0xFF, (n >> 8) & 0xFF]);
  const u32 = (n) => new Uint8Array([n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >>> 24) & 0xFF]);
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const f of files) {
    const nameBytes = enc.encode(f.name);
    const raw = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
    let data = raw;
    let method = 0; // store
    if (!f.store && raw.length > 0 && typeof CompressionStream === 'function') {
      try {
        const cs = new CompressionStream('deflate-raw');
        const w = cs.writable.getWriter();
        w.write(raw);
        w.close();
        const buf = await new Response(cs.readable).arrayBuffer();
        data = new Uint8Array(buf);
        if (data.length < raw.length) method = 8; else data = raw;
      } catch (_) { data = raw; }
    }
    const crc = xdexExportCrc32(raw);
    const lh = new Uint8Array(30 + nameBytes.length);
    lh.set(u32(0x04034b50), 0); lh.set(u16(20), 4); lh.set(u16(0), 6);
    lh.set(u16(method), 8);
    lh.set(u32(crc), 14); lh.set(u32(data.length), 18); lh.set(u32(raw.length), 22);
    lh.set(u16(nameBytes.length), 26);
    lh.set(nameBytes, 30);
    locals.push(lh, data);
    const ch = new Uint8Array(46 + nameBytes.length);
    ch.set(u32(0x02014b50), 0); ch.set(u16(20), 4); ch.set(u16(20), 6);
    ch.set(u16(method), 10);
    ch.set(u32(crc), 16); ch.set(u32(data.length), 20); ch.set(u32(raw.length), 24);
    ch.set(u16(nameBytes.length), 28);
    ch.set(u32(offset), 42);
    ch.set(nameBytes, 46);
    centrals.push(ch);
    offset += lh.length + data.length;
  }
  const cd = centrals.reduce((sum, c) => sum + c.length, 0);
  const eocd = new Uint8Array(22);
  eocd.set(u32(0x06054b50), 0);
  eocd.set(u16(files.length), 8); eocd.set(u16(files.length), 10);
  eocd.set(u32(cd), 12); eocd.set(u32(offset), 16);
  const total = locals.reduce((sum, b) => sum + b.length, 0) + cd + 22;
  const out = new Uint8Array(total);
  let pos = 0;
  for (const b of locals.concat(centrals, [eocd])) { out.set(b, pos); pos += b.length; }
  return out;
}

function xdexExportBytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function xdexExportSaveOfflinePackage(task, title, collected, firstPage, doneFrom, doneTo, canceled) {
  const tid = String(task.tid);
  const downloadImages = !!task.htmlDownloadImages;
  const dataDir = `favor/threads/t${tid}/data`;
  const dirHandle = xdexExportDirHandles.get(task.id) || null;

  // remote 映射：fileName → 外链（适配层回退用）
  const remoteMap = {};
  collected.forEach(({ entries }) => {
    entries.forEach((e) => {
      const name = String(e.img || '').trim() ? String(e.img).trim().split('/').pop() + String(e.ext || '').trim() : '';
      const url = xdexExportImageUrl(e.img, e.ext);
      if (name && url) remoteMap[name] = url;
    });
  });

  const files = [];

  // 每页一个 .data（JSONP）
  for (const { page, entries } of collected) {
    const payload = {
      id: tid, fid: '',
      now: String((entries.find((e) => e.isOp) || entries[0] || {}).now || ''),
      userid: xdexExportShortHash((entries.find((e) => e.isOp) || entries[0] || {}).userHash).replace(/^#/, ''),
      name: '无名氏', email: '', title,
      content: title, sage: '0', admin: '0', status: 'n',
      replyCount: String(firstPage.totalReplies || ''),
      replys: entries.map((e) => xdexExportToNmbEntry(e, downloadImages))
    };
    files.push({ name: `${dataDir}/${page}.data`, data: `_set_data_(${JSON.stringify(payload)});` });
  }

  // favor.index：串级元数据（列表页）
  const opEntry = (collected[0] && collected[0].entries.find((e) => e.isOp)) || collected[0].entries[0] || {};
  const idxItem = Object.assign(
    xdexExportToNmbEntry(opEntry, downloadImages),
    { id: tid, fid: String(firstPage.fid || ''), title, replyCount: String(firstPage.totalReplies || ''), created: Date.now() }
  );
  files.push({ name: 'favor/favor.index', data: `_set_data_(${JSON.stringify([idxItem])});` });

  // 离线浏览.html：原版查看器 + 注入适配层（模板随扩展分发）
  const viewerUrl = chrome.runtime.getURL('vendor/nimingban/offline-viewer.html');
  const resp = await fetch(viewerUrl);
  if (!resp.ok) throw new Error(`离线查看器模板缺失（${resp.status}）`);
  let html = await resp.text();
  const adapter = XDEX_EXPORT_VIEWER_ADAPTER.replace('__XDEX_REMOTE__', JSON.stringify(remoteMap));
  if (!html.includes('</body>')) throw new Error('离线查看器模板格式异常');
  html = html.replace('</body>', adapter + '\n</body>');
  files.push({ name: '离线浏览.html', data: html });

  // 图片（可选）：外链 → images/
  if (downloadImages) {
    const imgDir = `favor/threads/t${tid}/images`;
    const seen = new Set();
    for (const { entries } of collected) {
      for (const e of entries) {
        const name = String(e.img || '').trim() ? String(e.img).trim().split('/').pop() + String(e.ext || '').trim() : '';
        const url = xdexExportImageUrl(e.img, e.ext);
        if (!name || !url || seen.has(name)) continue;
        seen.add(name);
        try {
          const bin = await xdexFetchImageBinary(url);
          files.push({ name: `${imgDir}/${name}`, data: Uint8Array.from(atob(bin.base64), (c) => c.charCodeAt(0)) });
        } catch (err) {
          console.warn('[X岛-EX 导出] 图片下载失败（跳过，离线包内走外链回退）', name, err && err.message);
        }
      }
    }
  }

  // 落盘通道一：用户自定义目录（FS Access 句柄，SW 直写，真目录树）
  const wantedDir = !!task.dirName;
  if (dirHandle) {
    try {
      // 权限预检：失效则回退 ZIP（页面手势链已断，无法静默重授权）
      if (dirHandle.queryPermission && await dirHandle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
        throw new Error('目录写权限已失效，请在导出弹窗重新选择文件夹');
      }
      // 串子目录：{tid}_{title}（同串增量导出落同目录）
      const safeTitle = String(title || '').replace(/[\\/:*?"<>|\r\n\t]/g, '_').trim().slice(0, 60);
      const threadName = `t${tid}` + (safeTitle ? `_${safeTitle}` : '');
      const root = await dirHandle.getDirectoryHandle('X岛-EX', { create: true });
      const threadDir = await root.getDirectoryHandle(threadName, { create: true });
      for (const f of files) {
        // f.name 形如 favor/threads/t{tid}/data/1.data → 相对包根逐级创建
        const parts = f.name.split('/');
        let cur = threadDir;
        for (let i = 0; i < parts.length - 1; i += 1) {
          cur = await cur.getDirectoryHandle(parts[i], { create: true });
        }
        const fh = await cur.getFileHandle(parts[parts.length - 1], { create: true });
        const w = await fh.createWritable();
        const data = typeof f.data === 'string' ? new TextEncoder().encode(f.data) : f.data;
        await w.write(data);
        await w.close();
      }
      const filename = `${dirHandle.name}/X岛-EX/${threadName}/离线浏览.html`;
      return { filename, dir: `${dirHandle.name}/X岛-EX/${threadName}` };
    } catch (err) {
      // 句柄路径失败 → 回退 ZIP 并把原因带上
      console.warn('[X岛-EX 导出] 自定义目录写入失败，回退 ZIP：', err && err.message);
      lastDirFallbackReason = err && err.message ? err.message : String(err);
    }
  } else if (wantedDir) {
    // 提交时带了目录，但 SW 曾被回收 / SW 重启导致内存句柄丢失 → 回退 ZIP 并提示重选
    lastDirFallbackReason = '后台重启导致目录连接丢失，请在导出弹窗重新选择文件夹后重试';
  }

  // 落盘通道二：ZIP 锚点下载（默认；免疫 onDeterminingFilename 劫持）
  const zipBytes = await xdexExportBuildZip(files);
  const safeTitle = String(title || '').replace(/[\\/:*?"<>|\r\n\t]/g, '_').trim().slice(0, 60);
  const filename = `X岛-EX_HTML_${tid}_${safeTitle}_${doneFrom}-${doneTo}.zip`;
  await xdexExportDownloadBinary(filename, xdexExportBytesToBase64(zipBytes), 'application/zip');
  return { filename, dir: filename };
}

// 二进制抓取（SW 全局，fetchBinary 在 service-worker.js 定义，importScripts 共享）
async function xdexFetchImageBinary(url) {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const buffer = await response.arrayBuffer();
  let binary = '';
  const chunk = 0x8000;
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return {
    base64: btoa(binary),
    contentType: response.headers.get('content-type') || 'application/octet-stream'
  };
}

// 二进制文件下载（图片等）：含子目录 → SW downloads API（offscreen 上下文无 downloads 权限）；
// 扁平文件名 → offscreen 锚点下载
async function xdexExportDownloadBinary(filename, base64, contentType) {
  if (/[\\/]/.test(String(filename))) {
    return xdexExportSwDownload(filename, base64, contentType);
  }
  const response = await sendToOffscreen({ type: 'xdex:export-save', base64, filename, contentType });
  if (!response || !response.ok) throw new Error((response && response.error) || '保存文件失败');
  return response.filename || filename;
}

// SW 侧 downloads.download：相对子目录文件名落在浏览器默认下载目录下
function xdexExportSwDownload(filename, base64, contentType) {
  return new Promise((resolve, reject) => {
    try {
      if (!chrome.downloads || typeof chrome.downloads.download !== 'function') {
        reject(new Error('downloads API 不可用'));
        return;
      }
      const url = 'data:' + (contentType || 'application/octet-stream') + ';base64,' + base64;
      chrome.downloads.download({ url, filename: String(filename).replace(/^[\\/]+/, ''), conflictAction: 'uniquify' }, (downloadId) => {
        const err = chrome.runtime.lastError;
        if (err || !downloadId) {
          reject(new Error((err && err.message) || 'downloads API 失败'));
        } else {
          resolve(filename);
        }
      });
    } catch (e) { reject(e); }
  });
}

// 文本文件下载（.data/.index/HTML）：downloads API 相对子目录；锚点不支持子目录，故改走 offscreen blob+downloads
async function xdexExportDownloadFile(filename, content, contentType) {
  const buffer = new TextEncoder().encode(content);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < buffer.length; i += chunk) {
    binary += String.fromCharCode.apply(null, buffer.subarray(i, i + chunk));
  }
  return xdexExportDownloadBinary(filename, btoa(binary), contentType);
}

async function xdexExportRunTask(taskId) {
  if (xdexExportRuntime.has(taskId)) return; // 本 SW 实例已接管该任务（防 alarms/消息重复触发）
  const state = await xdexExportReadTasks();
  const task = state.tasks.find((t) => t && t.id === taskId);
  if (!task) return;
  if (task.status === 'done' || task.status === 'failed' || task.status === 'canceled') return;

  const runtime = { canceled: false };
  xdexExportRuntime.set(taskId, runtime);

  try {
    await xdexExportUpdateTask(taskId, { status: 'running', error: '' });

    const cookieHeader = task.cookieHeader || '';
    const poOnly = !!task.poOnly;
    const collected = []; // { page, entries }

    // 第一页用于确定总页数
    const firstPage = await xdexExportFetchPage(task.tid, 1, { cookieHeader, poOnly });
    if (runtime.canceled) throw new Error('已取消');

    const totalPages = task.totalPages > 0 ? Math.min(task.totalPages, firstPage.totalPages) : firstPage.totalPages;
    const from = Math.min(Math.max(1, task.from), totalPages);
    const to = task.to > 0 ? Math.min(Math.max(task.to, from), totalPages) : totalPages;

    await xdexExportUpdateTask(taskId, {
      totalPages,
      totalReplies: firstPage.totalReplies,
      fid: task.fid || firstPage.fid,
      to,
      progress: { donePages: [], currentPage: 0, totalPages: totalPages - from + 1, entries: 0 }
    });

    const pageList = [];
    for (let page = from; page <= to; page += 1) pageList.push(page);

    // 取消时不丢弃已抓取的内容：跳出循环后按「实际完成页」导出。
    for (let i = 0; i < pageList.length; i += 1) {
      if (runtime.canceled) break; // 取消发生在抓取下一页之前 → 不再发起新请求
      const page = pageList[i];
      const data = page === 1 ? firstPage : await xdexExportFetchPage(task.tid, page, { cookieHeader, poOnly });
      collected.push({ page, entries: data.entries }); // 已取回的页面即视为完成，计入导出
      const entriesCount = collected.reduce((sum, item) => sum + item.entries.length, 0);
      await xdexExportUpdateTask(taskId, {
        progress: {
          donePages: collected.map((item) => item.page),
          currentPage: page,
          totalPages: pageList.length,
          entries: entriesCount
        }
      });
      if (i < pageList.length - 1) await xdexExportSleep(XDEX_EXPORT_REQUEST_GAP_MS);
    }

    const canceled = !!runtime.canceled;

    const latest = (await xdexExportReadTasks()).tasks.find((t) => t && t.id === taskId) || task;
    const opEntry = (collected[0] && collected[0].entries[0]) || {};
    let title = xdexExportPickTitle(latest.title || opEntry.title, opEntry.content);
    if (!title) title = `串${latest.tid}`;
    const allEntries = collected.reduce((list, item) => list.concat(item.entries), []);
    const content = xdexExportBuildDocument({
      format: latest.format,
      tid: latest.tid,
      title,
      fid: latest.fid,
      from,
      to,
      totalPages,
      totalReplies: firstPage.totalReplies,
      poOnly,
      entries: allEntries,
      exportedAt: new Date()
    });
    // 文件名按「实际完成页」而非计划范围：取消时 1-300 抓到 20 页 → 记为 1-20
    const donePages = collected.map((item) => item.page);
    const doneFrom = donePages.length ? donePages[0] : from;
    const doneTo = donePages.length ? donePages[donePages.length - 1] : 0;
    if (latest.format === 'html') {
      // HTML：FS 句柄直写自定义目录（可选），否则单 ZIP 锚点下载
      lastDirFallbackReason = '';
      const saved = await xdexExportSaveOfflinePackage(latest, title, collected, firstPage, doneFrom, doneTo, canceled);
      var filename = saved.filename;
      var dirNote = lastDirFallbackReason ? `（自定义目录写入失败已回退 ZIP：${lastDirFallbackReason}）` : '';
    } else {
      // 锚点下载不支持子目录，使用扁平文件名
      var filename = xdexExportBuildFileName(latest.tid, title, doneFrom, doneTo, latest.format);
      const mime = latest.format === 'txt' ? 'text/plain' : 'text/markdown';
      await xdexExportDownload(filename, content, mime);
      var dirNote = '';
    }
    // 任务收尾：句柄不再需要
    xdexExportDirHandles.delete(taskId);

    const finalState = await xdexExportReadTasks();
    const finalIndex = finalState.tasks.findIndex((t) => t && t.id === taskId);
    if (finalIndex >= 0) {
      const doneTask = finalState.tasks[finalIndex];
      doneTask.status = canceled ? 'canceled' : 'done';
      doneTask.finishedAt = xdexExportNow();
      doneTask.filename = filename;
      doneTask.error = canceled ? `已取消，导出已完成的 ${doneFrom}-${doneTo} 页` : (dirNote || '');
      doneTask.progress = Object.assign({}, doneTask.progress, { currentPage: doneTo, donePages });
      finalState.tasks.splice(finalIndex, 1);
      finalState.history.unshift(doneTask);
      await xdexExportWriteTasks(finalState);
    }
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    const canceled = runtime.canceled || message === '已取消';
    const current = await xdexExportReadTasks();
    const index = current.tasks.findIndex((t) => t && t.id === taskId);
    if (index >= 0) {
      const failed = current.tasks[index];
      failed.status = canceled ? 'canceled' : 'failed';
      failed.error = canceled ? '已取消' : message;
      failed.finishedAt = xdexExportNow();
      current.tasks.splice(index, 1);
      current.history.unshift(failed);
      await xdexExportWriteTasks(current);
    }
  } finally {
    xdexExportRuntime.delete(taskId);
    await xdexExportUpdateBadge();
  }
}

// ---------- SW 重启后恢复未完成任务 ----------
// MV3 SW 会被回收：任务状态已持久化，SW 每次启动 + 每分钟 alarm 都会尝试续跑。
async function xdexExportResumeTasks() {
  const state = await xdexExportReadTasks();
  const pending = state.tasks.filter((t) => t && (t.status === 'running' || t.status === 'queued'));
  for (const task of pending) {
    xdexExportEnqueue(task.id);
  }
  await xdexExportUpdateBadge();
}

const XDEX_EXPORT_ALARM = 'xdex-export-resume';

async function xdexExportEnsureAlarm() {
  try {
    if (!chrome.alarms) return;
    const existing = await chrome.alarms.get(XDEX_EXPORT_ALARM);
    if (!existing) {
      await chrome.alarms.create(XDEX_EXPORT_ALARM, { periodInMinutes: 1 });
    }
  } catch (_e) {}
}

function xdexExportHandleAlarm(alarm) {
  if (!alarm || alarm.name !== XDEX_EXPORT_ALARM) return;
  xdexExportResumeTasks().catch(() => {});
}

// ---------- 消息路由 ----------
async function xdexExportHandleMessage(message, sender) {
  const details = message.details || {};
  switch (message.type) {
    case 'xdex:export:probe':
      return { ok: true, data: await xdexExportProbe(details) };
    case 'xdex:export:submit': {
      const cookieHeader = details.cookieHeader || await xdexExportCookieHeaderForSender(sender);
      const result = await xdexExportSubmit(Object.assign({}, details, { cookieHeader }));
      return { ok: true, data: result };
    }
    case 'xdex:export:list':
      return { ok: true, data: await xdexExportReadTasks() };
    case 'xdex:export:cancel':
      return { ok: true, data: await xdexExportCancel(String(details.id || '')) };
    case 'xdex:export:remove-history':
      return { ok: true, data: await xdexExportRemoveHistory(String(details.id || '')) };
    case 'xdex:export:clear-history':
      return { ok: true, data: await xdexExportClearHistory() };
    default:
      return null;
  }
}

// 从发送者页面读取 userhash 作为 Cookie 头（页面关闭后仍可用快照）
async function xdexExportCookieHeaderForSender(sender) {
  try {
    if (!chrome.cookies) return '';
    const pageUrl = getSenderPageUrl(sender);
    if (!isAllowedXdaoUrl(pageUrl)) return '';
    const cookie = await getCookie({ url: pageUrl, name: 'userhash' });
    const value = cookie && cookie.value ? cookie.value : '';
    return value ? `userhash=${value}` : '';
  } catch (_e) {
    return '';
  }
}
