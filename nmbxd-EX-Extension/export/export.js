'use strict';

// X岛-EX 导出管理页：提交任务 + 查看进度/历史。
// 任务数据由 Service Worker 维护在 chrome.storage.local['xdex-export-tasks']。

const TASKS_KEY = 'xdex-export-tasks';

const els = {
  tid: document.getElementById('export-tid'),
  probe: document.getElementById('export-probe'),
  probeInfo: document.getElementById('export-probe-info'),
  totalPages: document.getElementById('export-total-pages'),
  format: document.getElementById('export-format'),
  from: document.getElementById('export-from'),
  to: document.getElementById('export-to'),
  submit: document.getElementById('export-submit'),
  submitStatus: document.getElementById('export-submit-status'),
  poOnly: document.getElementById('export-po-only'),
  runningList: document.getElementById('running-list'),
  historyList: document.getElementById('history-list'),
  runningCount: document.getElementById('running-count'),
  clearHistory: document.getElementById('clear-history')
};

// 已检索结果：按 tid 复用（不只是最后一次），避免重复请求
const probedMap = new Map(); // tid -> { tid, title, fid, totalPages, totalReplies }

// ---------- 表单与检索结果的持久化 ----------
// 关掉或重开管理页后保留上次的输入与检索结果，不必从头再来。
// 解析串号：支持 `67024789`、`No.67024789`、URL、`67024789?r=x&page=23`，逗号/换行分隔批量
function parseTidList(input) {
  const parts = String(input == null ? '' : input)
    .split(/[,\n\uFF0C;；]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  return parts.map((raw) => {
    let text = raw;
    const urlMatch = text.match(/\/t\/(\d{4,9})/) || text.match(/\/Forum\/po\/id\/(\d{4,9})/);
    if (urlMatch) return { tid: urlMatch[1], raw, ok: true, error: '' };
    text = text.replace(/^(?:No\.?|＃|#)\s*/i, '').split(/[?&\s]/)[0];
    const numMatch = text.match(/^(\d{4,9})/);
    if (numMatch) return { tid: numMatch[1], raw, ok: true, error: '' };
    return { tid: '', raw, ok: false, error: '无法识别的串号' };
  });
}

// 校验页码范围是否真实存在（依据该串的总页数）。只填一端时另一端自动补全。
function validateRange(info) {
  const rawFrom = String(els.from.value).trim();
  const rawTo = String(els.to.value).trim();
  const total = Number(info && info.totalPages) || 0;
  if (!rawFrom && !rawTo) return { ok: true, from: 1, to: 0, all: true };
  const fromN = Number(rawFrom);
  const toN = Number(rawTo);
  if (rawFrom && (!Number.isFinite(fromN) || fromN < 1)) return { ok: false, error: '起始页必须是 ≥1 的整数' };
  if (rawTo && (!Number.isFinite(toN) || toN < 1)) return { ok: false, error: '结束页必须是 ≥1 的整数' };
  const from = rawFrom ? Math.floor(fromN) : 1;
  const to = rawTo ? Math.floor(toN) : (total || 0);
  if (total && from > total) return { ok: false, error: `起始页 ${from} 超出总页数 ${total}` };
  if (total && to > total) return { ok: false, error: `结束页 ${to} 超出总页数 ${total}` };
  if (to && to < from) return { ok: false, error: `结束页 ${to} 小于起始页 ${from}` };
  return { ok: true, from, to, all: false };
}

const XDEX_EXPORT_FORM_KEY = 'xdex-export-form-state';
function saveFormState() {
  try {
    const payload = {
      tid: els.tid.value,
      format: els.format.value,
      from: els.from.value,
      to: els.to.value,
      poOnly: !!els.poOnly.checked,
      probed: Array.from(probedMap.entries()),
      probeInfo: els.probeInfo.textContent || '',
      submitStatus: els.submitStatus.textContent || '',
      submitTone: els.submitStatus.dataset.tone || ''
    };
    localStorage.setItem(XDEX_EXPORT_FORM_KEY, JSON.stringify(payload));
  } catch (_e) { /* 忽略 */ }
}
function restoreFormState() {
  try {
    const raw = localStorage.getItem(XDEX_EXPORT_FORM_KEY);
    if (!raw) return;
    const st = JSON.parse(raw) || {};
    if (st.tid) els.tid.value = st.tid;
    if (st.format) els.format.value = st.format;
    if (st.from) els.from.value = st.from;
    if (st.to) els.to.value = st.to;
    els.poOnly.checked = !!st.poOnly;
    if (Array.isArray(st.probed)) st.probed.forEach((pair) => { if (pair && pair[0]) probedMap.set(pair[0], pair[1]); });
    if (st.probeInfo) els.probeInfo.textContent = st.probeInfo;
    if (st.submitStatus) { els.submitStatus.textContent = st.submitStatus; els.submitStatus.dataset.tone = st.submitTone || ''; }
    if (probedMap.size === 1) els.totalPages.value = String(Array.from(probedMap.values())[0].totalPages);
    else if (probedMap.size > 1) els.totalPages.value = `${probedMap.size} 个串`;
  } catch (_e) { /* 忽略 */ }
}

function send(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const err = chrome.runtime.lastError;
      if (err) { reject(new Error(err.message)); return; }
      if (!response) { reject(new Error('扩展后台无响应')); return; }
      if (response.ok === false) { reject(new Error(response.error || '操作失败')); return; }
      resolve(response.data);
    });
  });
}

function setStatus(text, tone) {
  els.submitStatus.textContent = text || '';
  if (tone) els.submitStatus.setAttribute('data-tone', tone);
  else els.submitStatus.removeAttribute('data-tone');
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function readTasks() {
  const stored = await chrome.storage.local.get(TASKS_KEY);
  const value = stored && stored[TASKS_KEY];
  return {
    tasks: Array.isArray(value && value.tasks) ? value.tasks : [],
    history: Array.isArray(value && value.history) ? value.history : []
  };
}

function buildTaskRow(task, isHistory) {
  const row = document.createElement('div');
  row.className = 'task-row';

  const head = document.createElement('div');
  head.className = 'task-row-head';
  const title = document.createElement('div');
  title.className = 'task-title';
  title.textContent = `No.${task.tid}`;
  const small = document.createElement('small');
  small.textContent = task.title || '';
  title.appendChild(small);

  const badge = document.createElement('span');
  const statusMap = { running: '进行中', queued: '排队中', done: '已完成', failed: '失败', canceled: '已取消' };
  badge.className = `badge ${task.status}`;
  badge.textContent = statusMap[task.status] || task.status;
  head.append(title, badge);
  row.appendChild(head);

  const donePages = (task.progress && Array.isArray(task.progress.donePages)) ? task.progress.donePages.length : 0;
  // 分母必须是「本次任务的计划页数」（提交 1-10 时是 10），而不是该串的总页数。
  //   to > 0 → 区间长度；to === 0（全部页哨兵）→ 总页数减去起始页偏移。
  const plannedPages = (function () {
    const from = Math.max(1, Number(task.from) || 1);
    const to = Math.max(0, Number(task.to) || 0);
    const total = Number(task.totalPages) || 0;
    if (to > 0) return Math.max(0, to - from + 1);
    if (total > 0) return Math.max(0, total - from + 1);
    return 0;
  })();
  const totalPages = Number(task.progress && task.progress.totalPages) || plannedPages;
  const percent = totalPages > 0 ? Math.min(100, Math.round((donePages / totalPages) * 100)) : 0;

  // 运行/排队中始终显示；已取消的任务因为按已完成页导出了，进度条也保留（便于看出导出了多少）
  const showBar = task.status === 'running' || task.status === 'queued'
    || (task.status === 'canceled' && percent > 0);
  if (showBar) {
    const track = document.createElement('div');
    track.className = 'progress-track';
    const fill = document.createElement('div');
    fill.className = 'progress-fill';
    fill.style.width = `${percent}%`;
    track.appendChild(fill);
    row.appendChild(track);
  }

  const meta = document.createElement('div');
  meta.className = 'task-meta';
  const parts = [];
  if (totalPages) parts.push(`${donePages}/${totalPages} 页`);
  parts.push(task.format === 'txt' ? 'TXT' : 'Markdown');
  if (task.poOnly) parts.push('只看PO');
  parts.push(task.status === 'done' || task.status === 'failed' || task.status === 'canceled'
    ? formatTime(task.finishedAt || task.updatedAt)
    : `开始于 ${formatTime(task.createdAt)}`);
  if (task.error && task.status !== 'done') parts.push(task.error);
  if (task.filename && task.status === 'done') parts.push(task.filename);
  meta.textContent = parts.filter(Boolean).join(' · ');
  row.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'task-actions';
  if (task.status === 'running' || task.status === 'queued') {
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'btn tiny';
    cancel.textContent = '取消';
    cancel.addEventListener('click', async () => {
      cancel.disabled = true;
      try { await send({ type: 'xdex:export:cancel', details: { id: task.id } }); } catch (_e) { cancel.disabled = false; }
      await refresh();
    });
    actions.appendChild(cancel);
  }
  if (isHistory) {
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn tiny';
    remove.textContent = '删除记录';
    remove.addEventListener('click', async () => {
      remove.disabled = true;
      try { await send({ type: 'xdex:export:remove-history', details: { id: task.id } }); } catch (_e) { remove.disabled = false; }
      await refresh();
    });
    actions.appendChild(remove);
  }
  if (actions.childElementCount) row.appendChild(actions);
  return row;
}

function renderList(container, list, isHistory) {
  container.textContent = '';
  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = isHistory ? '暂无历史任务' : '暂无进行中的任务';
    container.appendChild(empty);
    return;
  }
  list.forEach((task) => container.appendChild(buildTaskRow(task, isHistory)));
}

async function refresh() {
  const state = await readTasks();
  const running = state.tasks.filter((t) => t.status === 'running' || t.status === 'queued');
  els.runningCount.textContent = running.length ? `${running.length} 个` : '';
  renderList(els.runningList, state.tasks, false);
  renderList(els.historyList, state.history, true);
}

async function doProbe() {
  const list = parseTidList(els.tid.value.trim());
  if (!list.length) { setStatus('请输入串号', 'error'); return; }
  els.probe.disabled = true;
  els.probeInfo.textContent = '正在检索…';
  probedMap.clear();
  const oks = [];
  const fails = [];
  for (const item of list) {
    if (!item.ok) { fails.push(`✗ ${item.raw}：${item.error}`); continue; }
    try {
      const data = await send({ type: 'xdex:export:probe', details: { tid: item.tid } });
      probedMap.set(item.tid, data);
      oks.push(`✓《${data.title || `串${item.tid}`}》 ${item.tid}　版块 ${data.fid || '未知'}　共 ${data.totalPages} 页 / ${data.totalReplies} 回复`);
    } catch (error) {
      fails.push(`✗ ${item.tid} 不可下载：${error.message}`);
    }
  }
  els.probeInfo.textContent = oks.concat(fails).join('\n');
  if (probedMap.size === 1) els.totalPages.value = String(Array.from(probedMap.values())[0].totalPages);
  else if (probedMap.size > 1) els.totalPages.value = `${probedMap.size} 个串`;
  setStatus(fails.length ? `${fails.length} 个串不可下载，其余可正常加入` : `检索完成：${oks.length} 个串可下载`, fails.length ? 'error' : 'ok');
  els.probe.disabled = false;
  saveFormState();
}

async function doSubmit() {
  const list = parseTidList(els.tid.value.trim());
  if (!list.length) { setStatus('请输入串号', 'error'); return; }
  els.submit.disabled = true;
  const bothEmpty = !String(els.from.value).trim() && !String(els.to.value).trim();
  const needProbe = list.filter((x) => x.ok && !probedMap.get(x.tid));
  setStatus(needProbe.length ? `正在检索 ${needProbe.length} 个未检索的串…` : '正在提交…');
  const done = [];
  const fails = [];
  const infos = [];
  for (const item of list) {
    if (!item.ok) { fails.push(`${item.raw}：${item.error}`); continue; }
    let info = probedMap.get(item.tid);
    if (!info) {
      try {
        info = await send({ type: 'xdex:export:probe', details: { tid: item.tid } });
        probedMap.set(item.tid, info);
      } catch (error) { fails.push(`${item.tid} 不可下载：${error.message}`); continue; }
    }
    const chk = validateRange(info);
    if (!chk.ok) { fails.push(`${item.tid} 页码范围无效：${chk.error}`); continue; }
    if (bothEmpty || chk.all) {
      infos.push(`《${info.title || `串${item.tid}`}》 ${item.tid} 共 ${info.totalPages} 页 / ${info.totalReplies} 回复 → 全量导出`);
    }
    try {
      await send({
        type: 'xdex:export:submit',
        details: {
          tid: item.tid,
          title: info.title || '',
          fid: info.fid || '',
          totalPages: info.totalPages || 0,
          from: chk.from,
          to: chk.to,
          format: els.format.value,
          poOnly: els.poOnly.checked
        }
      });
      done.push(`${item.tid}（${chk.from}-${chk.all ? info.totalPages : chk.to} 页）`);
    } catch (error) { fails.push(`${item.tid} 提交失败：${error.message}`); }
  }
  const parts = [];
  if (infos.length) parts.push(infos.join('\n'));
  if (done.length) parts.push(`已加入导出队列 ${done.length} 个：${done.join('、')}（按顺序执行）`);
  if (fails.length) parts.push(`失败 ${fails.length} 个：${fails.join('；')}`);
  setStatus(parts.join('\n'), fails.length ? 'error' : 'ok');
  if (infos.length) els.probeInfo.textContent = infos.join('\n');
  els.submit.disabled = false;
  saveFormState();
  await refresh();
}

els.probe.addEventListener('click', doProbe);
els.submit.addEventListener('click', doSubmit);
els.clearHistory.addEventListener('click', async () => {
  try { await send({ type: 'xdex:export:clear-history' }); } catch (_e) {}
  await refresh();
});
els.tid.addEventListener('keydown', (e) => { if (e.key === 'Enter') doProbe(); });

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[TASKS_KEY]) refresh();
});

// 输入变化即持久化，重开页面后不用重填
['tid', 'format', 'from', 'to', 'poOnly'].forEach((key) => {
  const el = els[key];
  if (!el) return;
  el.addEventListener('input', saveFormState);
  el.addEventListener('change', saveFormState);
});

// 先恢复上次的输入与检索结果；URL 上带 tid 时以 URL 为准并重新检索
restoreFormState();
(function prefillFromQuery() {
  const params = new URLSearchParams(location.search);
  const tid = params.get('tid');
  if (tid && /^\d{4,9}$/.test(tid)) {
    els.tid.value = tid;
    doProbe();
  }
})();
saveFormState();

refresh();
