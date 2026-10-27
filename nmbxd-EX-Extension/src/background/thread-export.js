'use strict';

// X岛-EX 串内容导出核心：抓取 + HTML→Markdown/TXT 转换 + 文档拼装。
// 运行于 Service Worker（无 DOM），因此不使用 DOMParser，改用正则/字符串处理。

const XDEX_EXPORT_API_BASE = 'https://api.nmb.best/api';
const XDEX_EXPORT_PER_PAGE = 19;
const XDEX_EXPORT_IMAGE_BASE = 'https://image.nmb.best/image';
const XDEX_EXPORT_SITE_BASE = 'https://www.nmbxd1.com';
const XDEX_EXPORT_REQUEST_GAP_MS = 300;
const XDEX_EXPORT_MAX_RETRY = 3;

function xdexExportSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function xdexExportBuildUrl(tid, page, poOnly) {
  const kind = poOnly ? 'po' : 'thread';
  return `${XDEX_EXPORT_API_BASE}/${kind}?id=${encodeURIComponent(String(tid))}&page=${encodeURIComponent(String(page))}`;
}

// 图片地址：img 为文件名（含扩展名），ext 为附加后缀（如 .jpg）
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

// HTML 片段 → Markdown（保留引用行、链接、图片、加粗）
function xdexExportHtmlToMarkdown(html) {
  let out = String(html || '');
  // 图片：<img src="..." /> 或站点 ext 形式
  out = out.replace(/<img[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, (_m, src) => `\n![](${src})\n`);
  // 链接
  out = out.replace(/<a[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, href, text) => {
    const label = xdexExportStripTags(text).trim();
    const url = /^https?:/i.test(href) ? href : `${XDEX_EXPORT_SITE_BASE}${href.startsWith('/') ? '' : '/'}${href}`;
    return label ? `[${label}](${url})` : url;
  });
  // 加粗 / 斜体
  out = out.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, (_m, _t, text) => `**${xdexExportStripTags(text).trim()}**`);
  out = out.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, (_m, _t, text) => `*${xdexExportStripTags(text).trim()}*`);
  // 引用号行（font color=#789922）保持原文
  out = out.replace(/<font[^>]*color=["']?#?789922["']?[^>]*>([\s\S]*?)<\/font>/gi, (_m, text) => xdexExportStripTags(text).trim());
  // 换行
  out = out.replace(/<br\s*\/?>/gi, '\n');
  out = out.replace(/<\/p>/gi, '\n');
  out = xdexExportStripTags(out);
  return xdexExportDecodeEntities(out).replace(/\n{3,}/g, '\n\n').trim();
}

// HTML 片段 → 纯文本
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

function xdexExportStripTags(text) {
  return String(text || '').replace(/<[^>]*>/g, '');
}

// 短哈希：站点 user_hash 形如 "J8fAQ0D"（7 位），导出为 "#J8fAQ0D"
// HTML → 纯文本（取标题用）。采用「去标签 + 折叠空白」这一最小规则，
// 与页面脚本侧 xdexExportHtmlToPlain、脚本猫后台侧同实现保持一致。
function xdexExportHtmlToPlain(html) {
  return String(html == null ? '' : html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// 标题取用规则（三端一致）：
//   有标题且不是「无标题」→ 用原标题；否则取主串正文「第一句话」
//   （到第一个句末标点（含）为止，没有标点则整段），最后统一截到 40 字。
function xdexExportPickTitle(title, contentHtml) {
  const t = String(title || '').trim();
  if (t && t !== '无标题') return t;
  const text = xdexExportHtmlToPlain(contentHtml);
  if (!text) return '';
  const m = text.match(/^[^。！？!?]{1,60}[。！？!?]/);
  return (m ? m[0] : text).slice(0, 40).trim();
}

function xdexExportShortHash(userHash) {
  const raw = String(userHash || '').trim();
  if (!raw) return '';
  return '#' + raw.slice(0, 7);
}

// 把 thread API 的 OP 与 Replies 组装为统一的条目数组
function xdexExportCollectEntries(threadObj, page) {
  const entries = [];
  const op = {
    id: String(threadObj && threadObj.id || '').trim(),
    name: String(threadObj && threadObj.name || '').trim(),
    title: String(threadObj && threadObj.title || '').trim(),
    email: String(threadObj && threadObj.email || '').trim(),
    now: String(threadObj && threadObj.now || '').trim(),
    userHash: String(threadObj && (threadObj.user_hash || threadObj.UserHash) || '').trim(),
    content: String(threadObj && threadObj.content || ''),
    img: String(threadObj && threadObj.img || '').trim(),
    ext: String(threadObj && threadObj.ext || '').trim(),
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
    // 站点在串不存在时返回 JSON 字符串字面量（如 "\u8be5\u4e32\u4e0d\u5b58\u5728"）
    // 或裸文本；两者都要解出可读文案
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

// 条目链接：OP 用 /t/{tid}，回复用 /t/{tid}/page/{n}
function xdexExportEntryUrl(tid, page, isOp) {
  const base = `${XDEX_EXPORT_SITE_BASE}/t/${tid}`;
  return isOp ? base : `${base}/page/${Math.max(1, Number(page) || 1)}`;
}

// 拼装导出文档
function xdexExportBuildDocument(options) {
  const {
    format = 'md',
    tid = '',
    title = '',
    fid = '',
    from = 1,
    to = 1,
    totalPages = 1,
    totalReplies = 0,
    poOnly = false,
    entries = [],
    exportedAt = new Date()
  } = options || {};
  const isMd = format !== 'txt';
  const lines = [];
  // 文档标题：MD 用 `# 标题`；TXT 同格式但无 Markdown 标记
  lines.push(isMd ? `# ${title || `串 ${tid}`}` : (title || `串 ${tid}`));
  lines.push('');
  entries.forEach((entry) => {
    const page = entry.page || 1;
    const url = xdexExportEntryUrl(tid, page, entry.isOp);
    const hash = xdexExportShortHash(entry.userHash);
    // 头部字段：id | hash(Po) | name? | title? | now
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
    // 图片紧随头部（参考格式：头部 → 图片 → 正文）
    const imageUrl = xdexExportImageUrl(entry.img, entry.ext);
    if (imageUrl) {
      const imgName = String(entry.img || '').trim();
      lines.push(`![${imgName}](${imageUrl})`);
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

// 生成安全文件名
function xdexExportBuildFileName(tid, title, from, to, format) {
  const safeTitle = String(title || '').replace(/[\\/:*?"<>|\r\n\t]/g, '_').trim().slice(0, 60);
  // 始终使用实际页码区间（完整下载也是 1-N，不再用 'full'）
  const range = `${from}-${to}`;
  const ext = format === 'txt' ? 'txt' : 'md';
  const base = [`${tid}`, safeTitle, range].filter(Boolean).join('_');
  return `${base}.${ext}`;
}

// 抓取单页（带重试与间隔）
// 全局限流：任意两次 API 请求之间至少间隔该时长。
// 既避免高频抓取给站点造成压力，也避免因请求过密被风控/屏蔽。
// 用 Promise 链实现 FIFO —— 并发发起的请求会依次通过，而不是同时冲出去。
const XDEX_EXPORT_MIN_REQUEST_INTERVAL_MS = 1200;
let xdexExportApiLastAt = 0;
let xdexExportApiChain = Promise.resolve();
function xdexExportApiThrottle() {
  const run = xdexExportApiChain.then(async () => {
    const wait = xdexExportApiLastAt + XDEX_EXPORT_MIN_REQUEST_INTERVAL_MS - Date.now();
    if (wait > 0) await xdexExportSleep(wait);
    xdexExportApiLastAt = Date.now();
  });
  xdexExportApiChain = run.catch(() => {});
  return run;
}

async function xdexExportFetchPage(tid, page, options) {
  const { poOnly = false, cookieHeader = '', fetchImpl = fetch } = options || {};
  const url = xdexExportBuildUrl(tid, page, poOnly);
  const headers = {};
  if (cookieHeader) headers.Cookie = cookieHeader;
  let lastError = null;
  for (let attempt = 0; attempt < XDEX_EXPORT_MAX_RETRY; attempt += 1) {
    if (attempt > 0) await xdexExportSleep(XDEX_EXPORT_REQUEST_GAP_MS * (attempt + 1));
    await xdexExportApiThrottle(); // 全局限流：任意两次请求之间至少间隔 XDEX_EXPORT_MIN_REQUEST_INTERVAL_MS
    try {
      const response = await fetchImpl(url, { method: 'GET', headers, credentials: 'include' });
      const text = await response.text();
      if (!response.ok) {
        // 503 等可重试；其它状态也尝试解析错误体
        if (response.status >= 500) {
          lastError = new Error(`HTTP ${response.status}`);
          continue;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      return xdexExportParseThreadResponse(text, page);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('请求失败');
}

// ---------- HTML 离线包（nimingban 目录结构） ----------
// 产物：{ 离线浏览.html, favor/favor.index, favor/threads/t{tid}/data/{n}.data, favor/threads/t{tid}/images/* }
// 数据契约（原版查看器逆向）：
//   .data     → _set_data_({id, fid, now, userid, name, email, title, content, sage, admin, status, replyCount, replys:[...]})
//   favor.index → _set_data_([{...条目, replyCount, created}])，按 created 降序，40 条/页
//   图片     → fileName 非空走本地 images/；img 为绝对 URL 时原版直接作 src（回退）
// 适配层（追加在原版查看器 </body> 前，不改原版一字节）：
//   · 轮询修复图片：本地缺失/拼坏 thumb-src → 换 XDEX_REMOTE 外链
//   · 元数据染色：标题正文色、名称正绿、SAGE 红；去掉 标题：/名称：/Email： 前缀
//   · 「下载缺失图片」按钮：File System Access 写回 images/
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

// 条目 → nimingban 字段映射（userId 截 7 位与站点 user_hash 一致）
function xdexExportToNmbEntry(entry, downloadImages) {
  const id = String(entry.id || '').trim();
  const imageUrl = xdexExportImageUrl(entry.img, entry.ext);
  const imgName = String(entry.img || '').trim();
  const fileName = imgName ? imgName.split('/').pop() + String(entry.ext || '').trim() : '';
  return {
    id,
    userid: xdexExportShortHash(entry.userHash).replace(/^#/, ''),
    admin: 0,
    name: String(entry.name || '').trim() || '无名氏',
    email: String(entry.email || '').trim(),
    title: String(entry.title || '').trim() || '无标题',
    now: String(entry.now || '').trim(),
    content: String(entry.content || ''),
    // 本地模式：fileName 指向 images/（原版优先）；外链模式：绝对 URL（fileName 留空）
    img: downloadImages ? '' : imageUrl,
    ext: '',
    fileName: downloadImages ? fileName : '',
    sage: '0',
    status: 'n'
  };
}

// 拼装单页 .data 内容（JSONP）
function xdexExportBuildNmbPageData(tid, threadTitle, page, entries) {
  const op = entries.find((e) => e.isOp) || entries[0] || {};
  const payload = {
    id: String(tid),
    fid: '',
    now: String(op.now || '').trim(),
    userid: xdexExportShortHash(op.userHash).replace(/^#/, ''),
    name: String(op.name || '').trim() || '无名氏',
    email: '',
    title: threadTitle,
    content: String(op.content || ''),
    sage: '0',
    admin: '0',
    status: 'n',
    replyCount: '',   // 由 RunTask 填总回复数（查看器据此算总页数）
    replys: entries.map((e) => xdexExportToNmbEntry(e, false))
  };
  return `_set_data_(${JSON.stringify(payload)});`;
}

// 生成原版查看器 HTML 由 tasks 层完成（需要读取用户磁盘上的原版查看器文件），
// 这里只负责纯数据：remoteMap 在 tasks 层从 entries 推导。

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    XDEX_EXPORT_API_BASE,
    XDEX_EXPORT_PER_PAGE,
    xdexExportBuildUrl,
    xdexExportImageUrl,
    xdexExportShortHash,
    xdexExportEntryUrl,
    xdexExportHtmlToMarkdown,
    xdexExportHtmlToText,
    xdexExportHtmlToPlain,
    xdexExportPickTitle,
    xdexExportCollectEntries,
    xdexExportParseThreadResponse,
    xdexExportBuildDocument,
    xdexExportBuildFileName,
    xdexExportToNmbEntry,
    xdexExportBuildNmbPageData,
    XDEX_EXPORT_VIEWER_ADAPTER,
    xdexExportFetchPage,
    xdexExportSleep
  };
}
