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
    xdexExportFetchPage,
    xdexExportSleep
  };
}
