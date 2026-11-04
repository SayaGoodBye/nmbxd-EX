'use strict';

// Firefox 版扩展的静态审计：
//   1) 清单必须符合 Firefox MV3：background.scripts（而非 service_worker）、gecko id、
//      不含 Chrome 专有权限（offscreen / declarativeNetRequestWithHostAccess 由本仓改为 declarativeNetRequest）。
//   2) 代码里不得出现 Firefox 不支持的扩展 API（本仓曾经用到的：chrome.offscreen.*、chrome.runtime.getContexts）。
//   3) 所有用到的 chrome.<api> 必须落在「Firefox 支持集合」内，出现新 API 时提醒人工确认。
//
// 用法：node scripts/audit-firefox-apis.js

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const failures = [];
const notes = [];

function fail(msg) { failures.push(msg); }
function note(msg) { notes.push(msg); }

// ---------- 1. 清单审计 ----------
const manifestPath = path.join(root, 'manifest.json');
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (err) {
  fail(`manifest.json 解析失败: ${err.message}`);
}

if (manifest) {
  if (manifest.background && manifest.background.service_worker) {
    fail('Firefox 不支持 background.service_worker，必须使用 background.scripts');
  }
  if (!manifest.background || !Array.isArray(manifest.background.scripts) || !manifest.background.scripts.length) {
    fail('background.scripts 必须存在且非空（Firefox 事件页）');
  }
  const geckoId = manifest.browser_specific_settings && manifest.browser_specific_settings.gecko
    && manifest.browser_specific_settings.gecko.id;
  if (!geckoId) fail('缺少 browser_specific_settings.gecko.id（Firefox 需要稳定 ID）');
  // AMO 自 2025-11-03 起要求新提交扩展声明数据收集情况（该字段仅在 Firefox 140+ 被识别）
  const dcp = manifest.browser_specific_settings
    && manifest.browser_specific_settings.gecko
    && manifest.browser_specific_settings.gecko.data_collection_permissions;
  if (!dcp || !Array.isArray(dcp.required) || !dcp.required.length) {
    fail('缺少 browser_specific_settings.gecko.data_collection_permissions.required（AMO 提交必填）');
  } else if (dcp.required.includes('none') && dcp.required.length > 1) {
    fail('data_collection_permissions.required 中 "none" 不能与其它类别同时出现');
  }
  if (manifest.key) fail('Firefox 不识别清单 key（Chrome 专有），应移除');
  const permissions = Array.isArray(manifest.permissions) ? manifest.permissions : [];
  permissions.forEach((perm) => {
    if (perm === 'offscreen') fail('Firefox 不支持 offscreen 权限');
    if (perm === 'declarativeNetRequestWithHostAccess') {
      notes.push('declarativeNetRequestWithHostAccess 为 Chromium 侧用法；Firefox 版已改用 declarativeNetRequest + host_permissions');
    }
  });
  const resources = (manifest.web_accessible_resources || [])
    .reduce((acc, entry) => acc.concat(entry && entry.resources ? entry.resources : []), []);
  if (resources.some((item) => /offscreen/i.test(item))) fail('web_accessible_resources 仍含 offscreen 资源');
  const bgScripts = (manifest.background && manifest.background.scripts) || [];
  if (bgScripts.includes('offscreen/offscreen.js')) fail('background.scripts 不应包含 offscreen 脚本');
  if (!bgScripts.some((item) => /dom-jobs\.js$/.test(item))) fail('background.scripts 缺少 dom-jobs.js（Firefox 的后台 DOM 任务）');
  const contentJs = (manifest.content_scripts || []).reduce((acc, entry) => acc.concat(entry && entry.js ? entry.js : []), []);
  if (!contentJs.some((item) => /clipboard-writer\.js$/.test(item))) {
    fail('content_scripts 缺少 clipboard-writer.js（剪贴板回退通道）');
  }
  if (manifest.content_scripts && manifest.content_scripts.some((entry) => entry.world && entry.world !== 'MAIN')) {
    fail('content_scripts.world 只允许缺省或 MAIN');
  }
}

// ---------- 2. 代码审计 ----------
const scanDirs = ['src', 'export', 'options'];
const scanFiles = [];
function walk(dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return;
  fs.readdirSync(abs, { withFileTypes: true }).forEach((entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel);
    else if (/\.js$/.test(entry.name)) scanFiles.push(rel);
  });
}
scanDirs.forEach(walk);

const forbidden = [
  { re: /chrome\.offscreen\b/, why: 'Firefox 无 offscreen API（本仓用后台事件页代替）' },
  { re: /chrome\.runtime\.getContexts\b/, why: 'Firefox 无 runtime.getContexts（本仓不再需要：无离屏文档）' },
  { re: /chrome\.sidePanel\b/, why: 'Firefox 无 sidePanel（如需侧栏应使用 sidebar_action）' },
  { re: /chrome\.declarativeNetRequest\.updateSessionRules\b/, why: '需 Firefox ≥128（清单 strict_min_version 已约束），低于该版本应改用 webRequest' }
];

// Firefox 支持、且本仓实际用到的扩展 API 顶层集合
const supportedApis = new Set([
  'chrome.runtime', 'chrome.storage', 'chrome.tabs', 'chrome.contextMenus', 'chrome.cookies',
  'chrome.downloads', 'chrome.alarms', 'chrome.action', 'chrome.declarativeNetRequest'
]);

const usedApis = new Map();
scanFiles.forEach((rel) => {
  const text = fs.readFileSync(path.join(root, rel), 'utf8');
  forbidden.forEach(({ re, why }) => {
    if (re.test(text)) {
      // updateSessionRules 属"版本受限"而非"不支持"，单独记为提示
      if (/updateSessionRules/.test(re.source)) {
        if (!notes.some((item) => item.includes('updateSessionRules'))) notes.push(`updateSessionRules：${why}`);
        return;
      }
      fail(`${rel} 使用了 Firefox 不支持的 API：${re} —— ${why}`);
    }
  });
  const matches = text.match(/chrome\.[a-zA-Z]+/g) || [];
  matches.forEach((item) => usedApis.set(item, (usedApis.get(item) || 0) + 1));
});

usedApis.forEach((count, api) => {
  if (!supportedApis.has(api)) {
    fail(`出现未审计的扩展 API：${api}（${count} 处）—— 请确认 Firefox 是否支持并补入白名单`);
  }
});

console.log('== Firefox 扩展静态审计 ==');
console.log('扫描文件:', scanFiles.length);
console.log('用到的扩展 API:', Array.from(usedApis.keys()).sort().join(', '));
notes.forEach((item) => console.log('[提示]', item));
if (failures.length) {
  failures.forEach((item) => console.error('[失败]', item));
  process.exit(1);
}
console.log('审计通过');
