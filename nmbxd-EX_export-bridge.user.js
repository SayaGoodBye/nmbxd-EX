// ==UserScript==
// @name         X岛-EX · 脚本猫后台导出桥接
// @namespace    https://github.com/SayaGoodBye/nmbxd-EX
// @version      1.0.0
// @description  让 X岛-EX 在脚本猫环境下也能把串内容导出到本地：主脚本发 DOM 事件 → 本脚本转投后台脚本 → 后台抓取并落盘。主脚本无需改动存储。
// @author       SayaGoodBye
// @match        https://*.nmbxd1.com/*
// @match        https://*.nmbxd.com/*
// @storageName  xdex-export
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        unsafeWindow
// @run-at       document-start
// @connect      nmbxd1.com
// @connect      www.nmbxd1.com
// @connect      nmbxd.com
// @connect      www.nmbxd.com
// @icon         https://image.nmb.best/image/2026-06-03/6a1fcea41fad3.png
// @icon64       https://image.nmb.best/image/2026-06-03/6a1fced8e0e64.png
// ==/UserScript==

// 职责边界：
//   本脚本只做「搬运」——把主脚本的 DOM 事件翻译成后台脚本能读到的共享存储写入，反之亦然。
//   不解析串、不拼文档、不落盘（那些都在后台脚本里）。
//
// 与主脚本的约定见 patch-main-scriptcat.md：
//   ← xdex:export-request  { type, details, requestId }
//   → xdex:export-result   { requestId, ok, data | error }

(function () {
  'use strict';

  const REQ_KEY = 'xdex_export_req';
  const RES_KEY = 'xdex_export_res';
  const STATE_KEY = 'xdex_export_state';
  const PENDING_KEY = 'xdex_export_pending';

  // 每个 requestId 对应一次待回响应；后台回传时按 requestId 配回
  const waiting = new Map();

  function reply(detail) {
    try {
      document.dispatchEvent(new CustomEvent('xdex:export-result', { detail }));
    } catch (_e) {}
  }

  // 读取/写入「未配回响应」的暂存表：后台回传时用它找 requestId
  function readPending() {
    try { const v = GM_getValue(PENDING_KEY, {}); return (v && typeof v === 'object') ? v : {}; } catch (_e) { return {}; }
  }
  function writePending(obj) {
    try { GM_setValue(PENDING_KEY, obj && typeof obj === 'object' ? obj : {}); } catch (_e) {}
  }

  let seq = 0;
  function nextId() { seq += 1; return `${Date.now().toString(36)}-${seq}`; }

  // ── 主脚本 → 后台 ──────────────────────────────────────────
  document.addEventListener('xdex:export-request', (ev) => {
    const d = (ev && ev.detail) || {};
    const requestId = String(d.requestId || '');
    const type = String(d.type || '');
    const details = (d.details && typeof d.details === 'object') ? d.details : {};

    if (!requestId || !type) { reply({ requestId, ok: false, error: '请求缺少 requestId 或 type' }); return; }
    if (!/^xdex:export:/.test(type)) { reply({ requestId, ok: false, error: '不支持的请求类型：' + type }); return; }

    const id = nextId();
    waiting.set(id, { requestId, type, at: Date.now() });
    const pending = readPending();
    pending[id] = { requestId, type };
    writePending(pending);

    try {
      GM_setValue(REQ_KEY, { id, type, details, at: Date.now() });
      ensurePolling();
    } catch (e) {
      const p = readPending(); delete p[id]; writePending(p);
      waiting.delete(id);
      reply({ requestId, ok: false, error: '写入共享存储失败：' + String((e && e.message) || e) });
    }
  });

  // ── 后台 → 主脚本 ──────────────────────────────────────────
  // 处理一次后台回执（监听器与轮询兜底共用；靠 waiting/pending 的删除保证只派发一次）
  function deliver(res) {
    if (!res || typeof res !== 'object') return false;
    const id = String(res.id || '');
    const entry = waiting.get(id) || (readPending()[id] || null);
    if (!entry) return false; // 不是本页发起的请求（例如别的标签页的指令）
    waiting.delete(id);
    const p = readPending(); delete p[id]; writePending(p);
    if (res.ok === false) {
      reply({ requestId: entry.requestId, ok: false, error: String(res.error || '导出失败') });
    } else {
      reply({ requestId: entry.requestId, ok: true, data: res.data });
    }
    return true;
  }

  GM_addValueChangeListener(RES_KEY, (name, oldValue, newValue) => { deliver(newValue); });

  // 轮询兜底：万一脚本猫的跨脚本值变更事件未按预期触发，仍能取回结果。
  // 仅在存在未回执请求时活跃，避免常态开销。
  let pollTimer = null;
  function ensurePolling() {
    if (pollTimer) return;
    pollTimer = setInterval(() => {
      let pendingRes = null;
      try { pendingRes = GM_getValue(RES_KEY, null); } catch (_e) {}
      deliver(pendingRes);
      if (waiting.size === 0 && Object.keys(readPending()).length === 0) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    }, 800);
  }
  // 每次发起请求后启动兜底轮询（见上方 ensurePolling 调用）

  // ── 自检：把桥接能力暴露给主脚本 ────────────────────────────
  // 关键：脚本猫给每个脚本独立的沙箱 window，`window.x = y` 不会跨脚本可见。
  // 因此用两个通道：
  //   a) documentElement.dataset 标记 —— DOM 跨沙箱共享，主脚本据此判断「桥接已加载」；
  //   b) unsafeWindow.__xdexExportBridge —— 兜底通道（若沙箱实现允许）。
  try {
    try {
      const root = document.documentElement;
      if (root && root.dataset) root.dataset.xdexExportBridge = '1.0.0';
    } catch (_e) {}
    const pageWin = (typeof unsafeWindow !== 'undefined' && unsafeWindow) ? unsafeWindow : window;
    pageWin.__xdexExportBridge = {
      available: true,
      version: '1.0.0',
      // 主脚本调用入口：request(type, details, requestId)
      // 与扩展版消息契约同构 —— type 为 'xdex:export:xxx'，details 为对应载荷
      request: (type, details, requestId) => {
        try {
          document.dispatchEvent(new CustomEvent('xdex:export-request', {
            detail: { type: String(type || ''), details: details || {}, requestId: String(requestId || '') }
          }));
        } catch (_e) {}
      },
      // 供主脚本探测后台脚本是否真的在运行（可选）
      ping: () => {
        try { return !!GM_getValue(STATE_KEY, null); } catch (_e) { return false; }
      }
    };
    // 通知可能已先行加载的主脚本：桥接已就绪（主脚本据此补注入「导」按钮）
    document.dispatchEvent(new CustomEvent('xdex:export-bridge-ready', {
      detail: { version: '1.0.0' }
    }));
    // 启动日志：便于在页面控制台确认桥接确实加载了
    try {
      console.log('[X岛-EX 导出桥接] 已加载 v1.0.0，DOM 标记已写入：',
        document.documentElement.dataset.xdexExportBridge);
    } catch (_e) {}
  } catch (_e) {}
})();
