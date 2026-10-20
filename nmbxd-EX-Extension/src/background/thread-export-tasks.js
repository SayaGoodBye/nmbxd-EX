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
  const payload = {
    tasks: Array.isArray(state.tasks) ? state.tasks : [],
    history: Array.isArray(state.history) ? state.history.slice(0, XDEX_EXPORT_HISTORY_LIMIT) : []
  };
  await chrome.storage.local.set({ [XDEX_EXPORT_TASKS_KEY]: payload });
  await xdexExportUpdateBadge();
  return payload;
}

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
    format: (input && input.format) === 'txt' ? 'txt' : 'md',
    poOnly: !!(input && input.poOnly),
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
    // 锚点下载不支持子目录，使用扁平文件名
    const filename = xdexExportBuildFileName(latest.tid, title, doneFrom, doneTo, latest.format);
    const mime = latest.format === 'txt' ? 'text/plain' : 'text/markdown';
    await xdexExportDownload(filename, content, mime);

    const finalState = await xdexExportReadTasks();
    const finalIndex = finalState.tasks.findIndex((t) => t && t.id === taskId);
    if (finalIndex >= 0) {
      const doneTask = finalState.tasks[finalIndex];
      doneTask.status = canceled ? 'canceled' : 'done';
      doneTask.finishedAt = xdexExportNow();
      doneTask.filename = filename;
      doneTask.error = canceled ? `已取消，导出已完成的 ${doneFrom}-${doneTo} 页` : '';
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
