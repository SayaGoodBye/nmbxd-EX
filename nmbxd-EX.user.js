// ==UserScript==
// @name         X岛-EX
// @namespace    https://github.com/SayaGoodBye/nmbxd-EX
// @version      3.2.0
// @description  X岛-EX 网页端增强，移动端般的浏览体验：快捷切换饼干/ 添加页首页码 / 关闭图片水印 / 预览真实饼干 / 隐藏无标题-无名氏-版规 / 显示外部图床 / 自动刷新饼干 toast提示 / 无缝翻页-自动翻页 / 默认原图+控件 / 新标签打开串 / 优化引用弹窗 / 拓展引用格式 / 当页回复编号 / 扩展坞增强 / 拦截回复中间页 / 颜文字拓展 / 高亮PO主 / 发串UI调整 / 『分组标记饼干』 / 『屏蔽饼干』 / 『只看饼干』 / 『屏蔽关键词』- 隐藏-折叠 / 增强X岛匿名版 / 板块页快速回复 / 展开板块页长串 / 野生搜索酱 / unvcode-零宽空格模式 / 侧边栏收起 / 图片隐藏模式 / 图片自动压缩-非法图像格式（无GCT）GIF重编码 / 链接自动识别 / 设置项导入导出-剪贴板文件 / 常用串 / 浏览历史 / 发言历史 。
// @author       XY
// @match        https://*.nmbxd1.com/*
// @match        https://*.nmbxd.com/*
// @match        https://nmb-search.166666666.xyz/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_xmlhttpRequest
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addStyle
// @grant        unsafeWindow
// @connect      nmbxd1.com
// @connect      www.nmbxd1.com
// @connect      nmbxd.com
// @connect      www.nmbxd.com
// @connect      nmb-search.166666666.xyz
// @connect      image.nmb.best
// @connect      api.nmb.best
// @connect      raw.githubusercontent.com
// @connect      cdn.jsdelivr.net
// @connect      fastly.jsdelivr.net
// @connect      update.greasyfork.org
// @connect      scriptcat.org
// @connect      code.jquery.com
// @connect      unpkg.com
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdn.jsdelivr.net/npm/apng-js@1.1.5/lib/index.js
// @require      https://unpkg.com/upng-js@2.1.0/UPNG.js
// @icon         https://image.nmb.best/image/2026-06-03/6a1fcea41fad3.png
// @icon64       https://image.nmb.best/image/2026-06-03/6a1fced8e0e64.png
// @license      WTFPL
// @changelog    新增\n1.新增"我的订阅"，可使用订阅号与移动端订阅互通，提供更完整的信息（内容、图片、版块），并支持侧边栏一键跳转订阅面板，支持添加多个订阅号。\n\n优化：\n1.浏览历史支持显示被SAGE的串，高级检索支持“has:sage”。\n\n修复：\n1.修复图片隐藏模式对设置图标进行作用；修复修复图片懒加载下applyImageHideMode中Tips模式无法正常替换图片的问题。\n
// @note         特别感谢：icon由9HrD12x设计并绘制 >>No.68765505
// @note         致谢：切饼代码移植自[XD-Enhance](https://greasyfork.org/zh-CN/scripts/438164-xd-enhance)
// @note         致谢：外部图床代码二改自[显示x岛图片链接指向的图片](https://greasyfork.org/zh-CN/scripts/546024-%E6%98%BE%E7%A4%BAx%E5%B2%9B%E5%9B%BE%E7%89%87%E9%93%BE%E6%8E%A5%E6%8C%87%E5%90%91%E7%9A%84%E5%9B%BE%E7%89%87)
// @note         致谢：完整移植[增强x岛匿名版](https://greasyfork.org/zh-CN/scripts/513156-%E5%A2%9E%E5%BC%BAx%E5%B2%9B%E5%8C%BF%E5%90%8D%E7%89%88)
// @note         致谢：部分功能移植自[X岛-揭示板的增强型体验](https://greasyfork.org/zh-CN/scripts/497875-x%E5%B2%9B-%E6%8F%AD%E7%A4%BA%E6%9D%BF%E7%9A%84%E5%A2%9E%E5%BC%BA%E5%9E%8B%E4%BD%93%E9%AA%8C#%E8%BF%9E%E6%8E%A5%E7%9B%B4%E6%8E%A5%E8%B7%B3%E8%BD%AC)
// @note         致谢：来自4sYbzEX的搜索服务[野生搜索酱](https://www.nmbxd.com/t/64792841)
// @note         致谢：来自acVMxuv的[侧边栏优化](https://greasyfork.org/zh-CN/scripts/553143-x%E5%B2%9B%E4%BC%98%E5%8C%96%E5%B2%9B-%E4%BE%A7%E8%BE%B9%E6%A0%8F%E4%BC%98%E5%8C%96%E7%89%88)
// @downloadURL  https://update.greasyfork.org/scripts/531005/X%E5%B2%9B-EX.user.js
// @updateURL    https://update.greasyfork.org/scripts/531005/X%E5%B2%9B-EX.meta.js
// @run-at       document-start
// ==/UserScript==
/* global $, jQuery */

// 更新渠道
// @downloadURL https://update.greasyfork.org/scripts/531005/X%E5%B2%9B-EX.user.js
// @updateURL https://update.greasyfork.org/scripts/531005/X%E5%B2%9B-EX.meta.js
// @downloadURL https://scriptcat.org/scripts/code/6289/X%E5%B2%9B-EX.user.js
// @updateURL https://scriptcat.org/scripts/code/6289/X%E5%B2%9B-EX.meta.js

(function($){
  'use strict';
  /* --------------------------------------------------
   * tag 0. 通用与工具函数
   * -------------------------------------------------- */
  const VERSION = GM_info.script.version;
  const XDEX_SINGLETON_OWNER_DATASET_KEY = 'xdexSingletonOwner';
  const XDEX_SINGLETON_WAIT_MS = 100;
  function getXDexRuntimeInfo(){
      const declared = typeof globalThis !== 'undefined' ? globalThis.__xdexRuntime : null;
      if (declared && declared.kind === 'extension') {
          return Object.assign({ kind: 'extension' }, declared);
      }
      const scriptHandler = GM_info && (GM_info.scriptHandler || (GM_info.script && GM_info.script.handler)) || '';
      return {
          kind: 'userscript',
          scriptHandler: scriptHandler || 'unknown'
      };
  }
  function shouldExitForXDexSingleton(runtimeInfo){
      const root = document.documentElement;
      const owner = root && root.dataset ? root.dataset[XDEX_SINGLETON_OWNER_DATASET_KEY] : '';
      return owner === 'extension' && (!runtimeInfo || runtimeInfo.kind !== 'extension');
  }
  function cat_version(){
      console.log('[version]:', VERSION);
  }
  const XDEX_RUNTIME = getXDexRuntimeInfo();
  function getXDexGmStorageReady(){
      const ready = typeof globalThis !== 'undefined' ? globalThis.__xdexGmStorageReady : null;
      return ready && typeof ready.then === 'function' ? ready : Promise.resolve();
  }
  const XDEX_GM_STORAGE_READY = getXDexGmStorageReady();
  function scheduleXDexStartup(){
      if (shouldExitForXDexSingleton(XDEX_RUNTIME)) return;
      const startAfterStorageReady = () => {
          if (shouldExitForXDexSingleton(XDEX_RUNTIME)) return;
          startXDexRuntime();
      };
      if (XDEX_RUNTIME.kind !== 'extension') {
        setTimeout(() => {
          if (shouldExitForXDexSingleton(XDEX_RUNTIME)) return;
          XDEX_GM_STORAGE_READY.then(() => {
              startAfterStorageReady();
          }, () => {
              startAfterStorageReady();
          });
        }, XDEX_SINGLETON_WAIT_MS);
        return;
      }
      XDEX_GM_STORAGE_READY.then(() => {
          startAfterStorageReady();
      }, () => {
          startAfterStorageReady();
      });
  }
  function startXDexRuntime(){
  cat_version();
  console.log('[runtime]:', XDEX_RUNTIME.kind, XDEX_RUNTIME);

  const UPDATE_CHECK_KEY = 'xdex_update_check_state';
  const UPDATE_EXTENSION_CHECK_KEY = 'xdex_extension_update_check_state';
  const UPDATE_GREASYFORK_META_URL = 'https://update.greasyfork.org/scripts/531005/X%E5%B2%9B-EX.meta.js';
  const UPDATE_SCRIPTCAT_API_URL = 'https://scriptcat.org/api/v2/scripts/6289';
  const UPDATE_EXTENSION_GITHUB_JSON_URL = 'https://raw.githubusercontent.com/SayaGoodBye/nmbxd-EX/main/nmbxd-EX-Extension/update.json';
  const UPDATE_EXTENSION_JSDELIVR_JSON_URL = 'https://fastly.jsdelivr.net/gh/SayaGoodBye/nmbxd-EX@main/nmbxd-EX-Extension/update.json';
  const UPDATE_CHECK_HOUR = 11;
  const THREAD_HISTORY_STORAGE_KEY = 'xdex_thread_history';
  const THREAD_HISTORY_STORE_VERSION = 1;
  const THREAD_HISTORY_LIMIT = 500;
  const THREAD_HISTORY_EXCERPT_LIMIT = 250;
  const THREAD_HISTORY_RECORD_RETRY_LIMIT = 10;
  const THREAD_HISTORY_RECORD_RETRY_DELAY = 500;
  const THREAD_HISTORY_SYNC_EVENT = 'xdex:thread-history-changed';
  const THREAD_HISTORY_LIVE_RENDER_DEBOUNCE_DELAY = 300;
  const THREAD_HISTORY_LIVE_RENDER_MAX_WAIT = 1500;
  const THREAD_HISTORY_REVISIT_DWELL_MS = 5000;
  const POST_HISTORY_STORAGE_KEY = 'xdex_post_history';
  const POST_HISTORY_STORE_VERSION = 1;
  // const POST_HISTORY_LIMIT = 500;
  const POST_HISTORY_THREAD_LIMIT = Infinity;
  const POST_HISTORY_REPLY_LIMIT = Infinity;
  const POST_HISTORY_SYNC_EVENT = 'xdex:post-history-changed';
  const POST_HISTORY_API_BASE = `${location.origin}/Api`;
  const POST_HISTORY_REF_API_FALLBACK_BASE = 'https://api.nmb.best/api';
  const POST_HISTORY_THREAD_API_BASE = 'https://api.nmb.best/api';
  const POST_HISTORY_GET_LAST_POST_RETRY_DELAYS = [300, 800, 1500, 2500];

  const POST_HISTORY_CONFIRM_TIMEOUT_MS = 10000;

  const POST_HISTORY_REPLIES_PER_PAGE = 19;
  const POST_HISTORY_MATCH_TIME_WINDOW_MS = 45000;
  const POST_HISTORY_FORUM_FID_MAP = Object.freeze({
    '-1': '时间线',
    '4': '综合版1',
    '98': 'DANGER/U/',
    '20': '欢乐恶搞',
    '121': '速报2',
    '17': '绘画(二创)',
    '110': '社畜(校园)',
    '19': '故事(小说)',
    '81': '都市怪谈(灵异)',
    '37': '军武',
    '30': '技术宅(代码)',
    '75': '数码(装机)',
    '118': '宠物',
    '97': '女装(时尚)',
    '106': '买买买(物品推荐)',
    '14': '动画综合',
    '12': '漫画',
    '53': '婆罗门一',
    '31': '电影/电视',
    '116': '主播管人(圈内)',
    '45': '卡牌桌游',
    '9': '特摄(布袋戏)',
    '102': '战锤',
    '39': '胶佬(手办)',
    '94': '铁道厨(车辆)',
    '6': 'VOCALOID',
    '90': '小马(美漫)',
    '5': '东方Project',
    '93': '舰娘',
    '111': '跑团',
    '57': '创作茶水间',
    '91': '规则怪谈',
    '11': '海龟汤(推理)',
    '15': '科学(干货)',
    '103': '文学(推书)',
    '35': '音乐(推歌)',
    '27': 'AI(Chatgpt)',
    '115': '摄影(cos)',
    '112': 'ROLL点',
    '2': '游戏综合',
    '3': '手游专楼',
    '25': '任天堂NS',
    '22': '腾讯游戏(LOL)',
    '23': '暴雪游戏',
    '124': 'SE(FF14)',
    '70': 'V社(DOTA)',
    '28': '怪物猎人',
    '68': '鹰角游戏',
    '47': '米哈游',
    '34': '音游打卡',
    '10': '联机(服务器发布）',
    '62': '露营',
    '113': '育儿',
    '120': '自救互助',
    '32': '料理(美食)',
    '33': '体育(健身)',
    '56': '学业打卡',
    '89': '日记(树洞)',
    '18': '值班室',
    '117': '技术支持',
    '96': '版务',
    '60': '三百人委员会'
  });
  const POST_HISTORY_FORUM_GROUP_MAP = Object.freeze({
    '-1': '综合', '4': '综合', '98': '综合', '20': '综合', '121': '综合', '17': '综合', '110': '综合', '19': '综合', '81': '综合', '37': '综合', '30': '综合', '75': '综合', '118': '综合', '97': '综合', '106': '综合',
    '14': '亚文化', '12': '亚文化', '53': '亚文化', '31': '亚文化', '116': '亚文化', '45': '亚文化', '9': '亚文化', '102': '亚文化', '39': '亚文化', '94': '亚文化', '6': '亚文化', '90': '亚文化', '5': '亚文化', '93': '亚文化',
    '111': '创作', '57': '创作', '91': '创作', '11': '创作', '15': '创作', '103': '创作', '35': '创作', '27': '创作', '115': '创作', '112': '创作',
    '2': '游戏', '3': '游戏', '25': '游戏', '22': '游戏', '23': '游戏', '124': '游戏', '70': '游戏', '28': '游戏', '68': '游戏', '47': '游戏', '34': '游戏', '10': '游戏',
    '62': '生活', '113': '生活', '120': '生活', '32': '生活', '33': '生活', '56': '生活', '89': '生活',
    '18': '管理', '117': '管理', '96': '管理', '60': '管理'
  });
  const POST_HISTORY_FORUM_SEARCH_META = Object.freeze({
    '98': { rawName: 'DANGER_U', showName: 'DANGER/U/', groupName: '综合' },
    '17': { rawName: '绘画', showName: '绘画(二创)', groupName: '综合' },
    '110': { rawName: '社畜', showName: '社畜(校园)', groupName: '综合' },
    '19': { rawName: '故事', showName: '故事(小说)', groupName: '综合' },
    '81': { rawName: '都市怪谈', showName: '都市怪谈(灵异)', groupName: '综合' },
    '30': { rawName: '技术宅', showName: '技术宅(代码)', groupName: '综合' },
    '75': { rawName: '数码', showName: '数码(装机)', groupName: '综合' },
    '97': { rawName: '女装2', showName: '女装(时尚)', groupName: '综合' },
    '106': { rawName: '买买买', showName: '买买买(物品推荐)', groupName: '综合' },
    '31': { rawName: '影视', showName: '电影/电视', groupName: '亚文化' },
    '116': { rawName: '主播管人', showName: '主播管人(圈内)', groupName: '亚文化' },
    '9': { rawName: '特摄', showName: '特摄(布袋戏)', groupName: '亚文化' },
    '39': { rawName: '胶佬', showName: '胶佬(手办)', groupName: '亚文化' },
    '94': { rawName: '铁道厨', showName: '铁道厨(车辆)', groupName: '亚文化' },
    '90': { rawName: '小马', showName: '小马(美漫)', groupName: '亚文化' },
    '11': { rawName: '海龟汤', showName: '海龟汤(推理)', groupName: '创作' },
    '15': { rawName: '科学', showName: '科学(干货)', groupName: '创作' },
    '103': { rawName: '文学', showName: '文学(推书)', groupName: '创作' },
    '35': { rawName: '音乐', showName: '音乐(推歌)', groupName: '创作' },
    '27': { rawName: 'AI', showName: 'AI(Chatgpt)', groupName: '创作' },
    '115': { rawName: '摄影', showName: '摄影(cos)', groupName: '创作' },
    '25': { rawName: '任天堂', showName: '任天堂NS', groupName: '游戏' },
    '22': { rawName: '腾讯游戏', showName: '腾讯游戏(LOL)', groupName: '游戏' },
    '124': { rawName: 'SE', showName: 'SE(FF14)', groupName: '游戏' },
    '70': { rawName: 'V社', showName: 'V社(DOTA)', groupName: '游戏' },
    '10': { rawName: '联机', showName: '联机(服务器发布）', groupName: '游戏' },
    '32': { rawName: '料理', showName: '料理(美食)', groupName: '生活' },
    '33': { rawName: '体育', showName: '体育(健身)', groupName: '生活' },
    '89': { rawName: '日记', showName: '日记(树洞)', groupName: '生活' },
    '60': { rawName: '百脑汇', showName: '三百人委员会', groupName: '管理' }
  });
  const POST_HISTORY_TIMELINE_ID_MAP = Object.freeze({
    '1': '综合线',
    '2': '创作线',
    '3': '非创作线',
    '4': '亚文化线',
    '5': '综合2线',
    '6': '游戏线',
    '7': '生活线'
  });
  const THREAD_HISTORY_SEARCH_HELP_TEXT = '普通关键词：串号、标题、名称、饼干、正文\n高级检索：\nmode:po 只看 Po 串\nmode:normal 普通串\nhas:image 带图\nhas:gif GIF\nhas:zwsp 或 has:zerowidth 含零宽字符\nhas:sage 被 SAGE 的串\n可组合：mode:po has:image has:sage 关键词';
  const postHistoryConfirmationMap = new Map(); // 等待发串确认后跳转的 Promise 存储器 { localId -> resolver }
  const POST_HISTORY_SEARCH_HELP_TEXT = '普通关键词：发言 No、串号、板块、标题、名称、Email、正文、饼干、状态\n高级检索：\nstatus:confirmed 已确认\nstatus:pending 确认中\nstatus:failed 失败\nstatus:unconfirmed 未确认\nfid:98 指定板块 ID\nforum:综合 模糊匹配板块显示名/本名/分组名\nthread:64180270 指定串号\nid:68821620 指定发言 No\npage:203 指定页码\ncookie:abc123 指定饼干\nname:无名氏 指定名称\nemail:sage 指定 Email\nhas:image 带图\nhas:gif GIF\nhas:zwsp 或 has:zerowidth 含零宽字符\n可组合：forum:综合 has:image 关键词';
  const ZERO_WIDTH_RE = /[\u200B\u200C\u200D\uFEFF]/;

  const threadHistoryDebugState = {
    loadedAt: new Date().toISOString(),
    href: location.href,
    runtime: XDEX_RUNTIME && XDEX_RUNTIME.kind,
    storageKey: THREAD_HISTORY_STORAGE_KEY,
    lastRecord: null,
    lastRender: null,
    lastPanelModule: ''
  };
  window.__xdexThreadHistoryDebug = threadHistoryDebugState;
  let threadHistoryLiveSyncBound = false;
  let threadHistoryLiveRenderTimer = 0;
  let threadHistoryLiveRenderFirstAt = 0;
  let threadHistoryLiveRenderPendingCount = 0;
  let threadHistoryReactivationTrackingInstalled = false;
  let threadHistoryDwellTimer = 0;
  let threadHistoryVisibleSince = 0;
  let threadHistoryVisibleSessionCounted = false;
  let postHistoryLiveSyncBound = false;
  let postHistoryLiveRenderTimer = 0;
  let postHistoryLiveRenderFirstAt = 0;
  let postHistoryLiveRenderPendingCount = 0;
  let postHistoryLiveRenderDirty = false;
  let postHistoryActiveType = 'reply';

  function updateThreadHistoryDebugState(patch) {
    Object.assign(threadHistoryDebugState, patch || {});
    window.__xdexThreadHistoryDebug = threadHistoryDebugState;
    return threadHistoryDebugState;
  }

  function logThreadHistory(message, details, level = 'info') {
    const payload = Object.assign({ href: location.href }, details || {});
    updateThreadHistoryDebugState({ lastLog: { message, details: payload, at: new Date().toISOString() } });
    const logger = console[level] || console.info || console.log;
    logger.call(console, `[thread-history] ${message}`, payload);
  }

  function logThreadHistoryFlat(message, details, level = 'info') {
    const payload = Object.assign({ href: location.href }, details || {});
    const text = Object.keys(payload)
      .map(key => `${key}=${JSON.stringify(payload[key])}`)
      .join(' ');
    updateThreadHistoryDebugState({ lastFlatLog: { message, details: payload, at: new Date().toISOString() } });
    const logger = console[level] || console.info || console.log;
    logger.call(console, `[thread-history] ${message} ${text}`);
  }

  function normalizeMetaChangelog(text) {
    return String(text || '')
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\n')
      .trim();
  }

  function parseVersionAndChangelogFromMeta(metaText) {
    const text = String(metaText || '');
    const versionMatch = text.match(/^\/\/\s*@version\s+(.+)$/m);
    const changelogMatches = [...text.matchAll(/^\/\/\s*@changelog\s+(.+)$/gm)];
    const changelog = normalizeMetaChangelog(changelogMatches
      .map(m => String(m[1] || '').trim())
      .filter(Boolean)
      .join('\n')
      .trim());
    return {
      version: versionMatch ? String(versionMatch[1] || '').trim() : '',
      changelog
    };
  }

  const CHANGELOG = parseVersionAndChangelogFromMeta(GM_info.scriptMetaStr || '').changelog || '';
  function getUpdateCheckStorageKey() {
    return XDEX_RUNTIME && XDEX_RUNTIME.kind === 'extension' ? UPDATE_EXTENSION_CHECK_KEY : UPDATE_CHECK_KEY;
  }

  function getDefaultUpdateCheckState() {
    return {
      lastCheckDate: '',
      nextCheckAt: 0,
      pendingUpdateVersion: '',
      pendingUpdateChangelog: '',
      pendingUpdateSource: '',
      pendingUpdateDetectedAt: 0,
      latestRemoteVersion: '',
      ignoredVersion: '',
      lastDismissDate: '',
      dismissedUntil: 0
    };
  }

  function getUpdateCheckState() {
    try {
      const saved = GM_getValue(getUpdateCheckStorageKey(), null);
      const merged = Object.assign(getDefaultUpdateCheckState(), saved || {});
      console.log('[update-check] get state:', merged);
      return merged;
    } catch (e) {
      console.warn('[update-check] get state failed, fallback to default:', e);
      return getDefaultUpdateCheckState();
    }
  }

  function setUpdateCheckState(nextState) {
    const merged = Object.assign(getDefaultUpdateCheckState(), nextState || {});
    GM_setValue(getUpdateCheckStorageKey(), merged);
    console.log('[update-check] set state:', merged);
    return merged;
  }

  function createDefaultThreadHistoryStore() {
    return {
      version: 1,
      limit: 500,
      items: {},
      index: {},
      order: []
    };
  }

  function getThreadHistoryKey(mode, threadId) {
    return `${mode}:${String(threadId || '').slice(0, 8)}`;
  }

  function normalizeThreadHistoryStore(rawStore) {
    const store = Object.assign(createDefaultThreadHistoryStore(), rawStore || {});
    store.version = THREAD_HISTORY_STORE_VERSION;
    store.limit = Number(store.limit) > 0 ? Number(store.limit) : THREAD_HISTORY_LIMIT;
    store.items = store.items && typeof store.items === 'object' ? store.items : {};
    store.index = store.index && typeof store.index === 'object' ? store.index : {};
    const seen = new Set();
    store.order = (Array.isArray(store.order) ? store.order : [])
      .filter(key => {
        if (!store.items[key] || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    Object.keys(store.items).forEach(key => {
      if (!store.index[key]) store.index[key] = buildThreadHistoryIndexEntry(store.items[key]);
      if (!seen.has(key)) {
        seen.add(key);
        store.order.push(key);
      }
    });
    Object.keys(store.index).forEach(key => {
      if (!store.items[key]) delete store.index[key];
    });
    store.order.sort((a, b) => {
      const av = Number(store.items[a] && store.items[a].lastVisitedAt) || 0;
      const bv = Number(store.items[b] && store.items[b].lastVisitedAt) || 0;
      return bv - av;
    });
    while (store.order.length > store.limit) {
      const key = store.order.pop();
      delete store.items[key];
      delete store.index[key];
    }
    return store;
  }

  function getThreadHistoryStore() {
    try {
      return normalizeThreadHistoryStore(GM_getValue(THREAD_HISTORY_STORAGE_KEY, null));
    } catch (e) {
      return createDefaultThreadHistoryStore();
    }
  }

  function setThreadHistoryStore(store) {
    const normalized = normalizeThreadHistoryStore(store);
    GM_setValue(THREAD_HISTORY_STORAGE_KEY, normalized);
    notifyThreadHistoryStoreChanged('local-write', false);
    return normalized;
  }

  function isThreadHistoryPanelOpen() {
    const cover = document.getElementById('sp_cover');
    const module = document.getElementById('sp_module_history');
    return !!module && module.classList.contains('active') && (!cover || getComputedStyle(cover).display !== 'none');
  }

  function scheduleThreadHistoryLiveRender(source, remote) {
    const active = isThreadHistoryPanelOpen();
    const now = Date.now();
    if (!threadHistoryLiveRenderFirstAt) threadHistoryLiveRenderFirstAt = now;
    threadHistoryLiveRenderPendingCount += 1;
    updateThreadHistoryDebugState({
      lastLiveSync: {
        source,
        remote: !!remote,
        active,
        pendingCount: threadHistoryLiveRenderPendingCount,
        firstAt: threadHistoryLiveRenderFirstAt,
        at: new Date().toISOString()
      }
    });
    if (!active) {
      if (threadHistoryLiveRenderTimer) clearTimeout(threadHistoryLiveRenderTimer);
      threadHistoryLiveRenderTimer = 0;
      threadHistoryLiveRenderFirstAt = 0;
      threadHistoryLiveRenderPendingCount = 0;
      return;
    }
    const run = () => {
      threadHistoryLiveRenderTimer = 0;
      threadHistoryLiveRenderFirstAt = 0;
      threadHistoryLiveRenderPendingCount = 0;
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => renderThreadHistoryModule());
      else renderThreadHistoryModule();
    };
    if (threadHistoryLiveRenderTimer) clearTimeout(threadHistoryLiveRenderTimer);
    const elapsed = now - threadHistoryLiveRenderFirstAt;
    const delay = elapsed >= THREAD_HISTORY_LIVE_RENDER_MAX_WAIT
      ? 0
      : Math.min(THREAD_HISTORY_LIVE_RENDER_DEBOUNCE_DELAY, THREAD_HISTORY_LIVE_RENDER_MAX_WAIT - elapsed);
    threadHistoryLiveRenderTimer = setTimeout(run, delay);
  }

  function notifyThreadHistoryStoreChanged(source, remote) {
    try {
      window.dispatchEvent(new CustomEvent(THREAD_HISTORY_SYNC_EVENT, { detail: { source, remote: !!remote, at: Date.now() } }));
    } catch (e) {}
    scheduleThreadHistoryLiveRender(source, remote);
  }

  function bindThreadHistoryLiveSync() {
    if (threadHistoryLiveSyncBound) return;
    threadHistoryLiveSyncBound = true;
    if (typeof GM_addValueChangeListener === 'function') {
      try {
        GM_addValueChangeListener(THREAD_HISTORY_STORAGE_KEY, (_key, _oldValue, _newValue, remote) => {
          scheduleThreadHistoryLiveRender('gm-value-change', remote);
        });
      } catch (e) {
        logThreadHistory('live sync listener failed', { error: e && e.message ? e.message : String(e) }, 'warn');
      }
    }
    window.addEventListener(THREAD_HISTORY_SYNC_EVENT, (event) => {
      const detail = event && event.detail || {};
      scheduleThreadHistoryLiveRender(detail.source || 'window-event', !!detail.remote);
    });
  }

  function createDefaultPostHistoryStore() {
    return {
      version: POST_HISTORY_STORE_VERSION,
      // limit: POST_HISTORY_LIMIT,
      items: {},
      order: []
    };
  }

  function normalizePostHistoryType(type) {
    return type === 'reply' ? 'reply' : 'thread';
  }

  function normalizePostHistoryStatus(status) {
    return ['pending', 'confirmed', 'unconfirmed', 'failed'].includes(status) ? status : 'pending';
  }

  function normalizePostHistoryFid(fid) {
    const value = String(fid == null ? '' : fid).trim();
    return /^-?\d+$/.test(value) ? value : '';
  }

  function getPostHistoryForumNameByFid(fid) {
    return POST_HISTORY_FORUM_FID_MAP[normalizePostHistoryFid(fid)] || '';
  }

  function normalizeHistorySearchValue(value) {
    return String(value == null ? '' : value).trim().toLowerCase();
  }

  function getPostHistoryForumSearchText(item) {
    const fid = normalizePostHistoryFid(item && item.fid);
    const meta = POST_HISTORY_FORUM_SEARCH_META[fid] || {};
    return [
      fid,
      item && item.forumName,
      getPostHistoryForumNameByFid(fid),
      meta.rawName,
      meta.showName,
      meta.groupName || POST_HISTORY_FORUM_GROUP_MAP[fid]
    ].join(' ').toLowerCase();
  }

  function getPostHistoryPostFid(post) {
    if (!post || typeof post !== 'object') return '';
    return normalizePostHistoryFid(post.fid || post.Fid || post.forum_id || post.forumId || post.forum);
  }

  function getCurrentPostHistoryFid() {
    const path = String(location && location.pathname || '');
    const forumMatch = path.match(/^\/f\/([^/?#]+)/);
    if (!forumMatch) return '';
    let forumName = '';
    try {
      forumName = decodeURIComponent(forumMatch[1] || '');
    } catch (e) {
      forumName = forumMatch[1] || '';
    }
    const normalizedName = forumName.replace(/\s+/g, '').toLowerCase();
    return Object.keys(POST_HISTORY_FORUM_FID_MAP).find(fid => {
      const name = String(POST_HISTORY_FORUM_FID_MAP[fid] || '').replace(/\s+/g, '').toLowerCase();
      return name === normalizedName;
    }) || '';
  }

  function normalizePostHistoryText(text) {
    return String(text || '')
      .replace(/<br\s*\/?\s*>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&gt;/gi, '>')
      .replace(/&lt;/gi, '<')
      .replace(/&amp;/gi, '&')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\s\u00a0]+/g, ' ')
      .trim();
  }

  function sanitizePostHistoryServerContentHtml(content) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = String(content || '');
    return sanitizeThreadHistoryContentHtml(wrapper);
  }

  function hashPostHistoryText(text) {
    const normalized = normalizePostHistoryText(text);
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      hash = ((hash << 5) - hash + normalized.charCodeAt(i)) | 0;
    }
    return String(hash >>> 0);
  }

  const postHistoryDebugState = window.__xdexPostHistoryDebug = window.__xdexPostHistoryDebug || { events: [] };

  function summarizePostHistoryText(text) {
    const normalized = normalizePostHistoryText(text);
    return {
      length: normalized.length,
      hash: hashPostHistoryText(normalized),
      preview: normalized.slice(0, 40)
    };
  }

  function summarizePostHistoryCandidate(post) {
    if (!post) return null;
    const resto = String(post.resto || '0').trim();
    return {
      id: String(post.id || '').trim(),
      resto,
      type: Number(resto) === 0 ? 'thread' : 'reply',
      now: post.now || '',
      img: post.img || '',
      ext: post.ext || '',
      content: summarizePostHistoryText(post.content || '')
    };
  }

  function summarizePostHistorySnapshot(snapshot) {
    if (!snapshot) return null;
    return {
      localId: snapshot.localId || '',
      type: snapshot.type || '',
      resto: snapshot.resto || '',
      contentHash: snapshot.contentHash || '',
      submittedAt: snapshot.submittedAt || 0,
      sourceUrl: snapshot.sourceUrl || ''
    };
  }

  function logPostHistory(stage, data, level = 'log') {
    const detail = Object.assign({ stage, at: Date.now() }, data || {});
    try {
      postHistoryDebugState.events.push(detail);
      if (postHistoryDebugState.events.length > 80) postHistoryDebugState.events.shift();
      postHistoryDebugState.last = detail;
    } catch (e) {}
    const method = console[level] ? level : 'log';
    console[method]('[post-history] ' + stage, detail);
  }

  window.__xdexGetPostHistoryDebug = function getPostHistoryDebug() {
    return postHistoryDebugState;
  };

  window.__xdexClearPostHistoryDebug = function clearPostHistoryDebug() {
    postHistoryDebugState.events = [];
    postHistoryDebugState.last = null;
    return postHistoryDebugState;
  };

  function normalizePostHistoryStore(rawStore) {
    const store = Object.assign(createDefaultPostHistoryStore(), rawStore || {});
    store.version = POST_HISTORY_STORE_VERSION;
    // store.limit = Number(store.limit) > 0 ? Number(store.limit) : POST_HISTORY_LIMIT;
    store.items = store.items && typeof store.items === 'object' ? store.items : {};
    const seen = new Set();
    store.order = (Array.isArray(store.order) ? store.order : [])
      .filter(key => {
        if (!store.items[key] || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    Object.keys(store.items).forEach(key => {
      const item = store.items[key] || {};
      item.localId = item.localId || key;
      item.status = normalizePostHistoryStatus(item.status);
      item.type = normalizePostHistoryType(item.type);
      item.fid = normalizePostHistoryFid(item.fid);
      item.forumName = item.forumName || getPostHistoryForumNameByFid(item.fid);
      item.contentText = normalizePostHistoryText(item.contentText || item.contentRaw || '');
      item.contentHash = item.contentHash || hashPostHistoryText(item.contentText);
      item.page = Math.max(0, Number(item.page) || 0);
      store.items[key] = item;
      if (!seen.has(key)) {
        seen.add(key);
        store.order.push(key);
      }
    });
    store.order.sort((a, b) => {
      const av = Number(store.items[a] && store.items[a].submittedAt) || 0;
      const bv = Number(store.items[b] && store.items[b].submittedAt) || 0;
      return bv - av;
    });

    // 旧：全局共享 limit 清理
    // while (store.order.length > store.limit) {
    //   const key = store.order.pop();
    //   delete store.items[key];
    // }

    // 新增：按类型分别清理（仅在 limit !== Infinity 时生效）
    const shouldCleanThread = POST_HISTORY_THREAD_LIMIT !== Infinity;
    const shouldCleanReply = POST_HISTORY_REPLY_LIMIT !== Infinity;
    if (shouldCleanThread || shouldCleanReply) {
      const typeOrders = { thread: [], reply: [] };
      store.order.forEach(key => {
        const type = normalizePostHistoryType(store.items[key]?.type);
        typeOrders[type].push(key);
      });
      while (shouldCleanThread && typeOrders.thread.length > POST_HISTORY_THREAD_LIMIT) {
        const key = typeOrders.thread.pop();
        delete store.items[key];
      }
      while (shouldCleanReply && typeOrders.reply.length > POST_HISTORY_REPLY_LIMIT) {
        const key = typeOrders.reply.pop();
        delete store.items[key];
      }
      store.order = store.order.filter(key => store.items[key]);
    }
    return store;
  }

  function getPostHistoryStore() {
    try {
      return normalizePostHistoryStore(GM_getValue(POST_HISTORY_STORAGE_KEY, null));
    } catch (e) {
      return createDefaultPostHistoryStore();
    }
  }

  function isPostHistoryPanelOpen() {
    const cover = document.getElementById('sp_cover');
    const module = document.getElementById('sp_module_posts');
    return !!module && module.classList.contains('active') && (!cover || getComputedStyle(cover).display !== 'none');
  }

  function schedulePostHistoryLiveRender(source, remote) {
    const active = isPostHistoryPanelOpen();
    const renderable = !!document.getElementById('sp_posts_results');
    const now = Date.now();
    if (!postHistoryLiveRenderFirstAt) postHistoryLiveRenderFirstAt = now;
    postHistoryLiveRenderPendingCount += 1;
    postHistoryLiveRenderDirty = true;
    logPostHistory('live sync', {
      source,
      remote: !!remote,
      active,
      renderable,
      pendingCount: postHistoryLiveRenderPendingCount,
      firstAt: postHistoryLiveRenderFirstAt
    });
    if (!renderable) {
      if (postHistoryLiveRenderTimer) clearTimeout(postHistoryLiveRenderTimer);
      postHistoryLiveRenderTimer = 0;
      postHistoryLiveRenderFirstAt = 0;
      postHistoryLiveRenderPendingCount = 0;
      return;
    }
    const run = () => {
      postHistoryLiveRenderTimer = 0;
      postHistoryLiveRenderFirstAt = 0;
      postHistoryLiveRenderPendingCount = 0;
      postHistoryLiveRenderDirty = false;
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => renderPostHistoryModule());
      else renderPostHistoryModule();
    };
    if (postHistoryLiveRenderTimer) clearTimeout(postHistoryLiveRenderTimer);
    const elapsed = now - postHistoryLiveRenderFirstAt;
    const delay = elapsed >= THREAD_HISTORY_LIVE_RENDER_MAX_WAIT
      ? 0
      : Math.min(THREAD_HISTORY_LIVE_RENDER_DEBOUNCE_DELAY, THREAD_HISTORY_LIVE_RENDER_MAX_WAIT - elapsed);
    postHistoryLiveRenderTimer = setTimeout(run, delay);
  }

  function notifyPostHistoryStoreChanged(source, remote) {
    try {
      window.dispatchEvent(new CustomEvent(POST_HISTORY_SYNC_EVENT, { detail: { source, remote: !!remote, at: Date.now() } }));
    } catch (e) {}
    logPostHistory('store notify', { source, remote: !!remote });
    schedulePostHistoryLiveRender(source, remote);
  }

  function setPostHistoryStore(store) {
    const normalized = normalizePostHistoryStore(store);
    GM_setValue(POST_HISTORY_STORAGE_KEY, normalized);
    notifyPostHistoryStoreChanged('local-write', false);
    return normalized;
  }

  function bindPostHistoryLiveSync() {
    if (postHistoryLiveSyncBound) return;
    postHistoryLiveSyncBound = true;
    if (typeof GM_addValueChangeListener === 'function') {
      try {
        GM_addValueChangeListener(POST_HISTORY_STORAGE_KEY, (_key, _oldValue, _newValue, remote) => {
          schedulePostHistoryLiveRender('gm-value-change', remote);
        });
      } catch (e) {
        logPostHistory('live sync listener failed', { error: e && e.message ? e.message : String(e) }, 'warn');
      }
    }
    window.addEventListener(POST_HISTORY_SYNC_EVENT, (event) => {
      const detail = event && event.detail || {};
      schedulePostHistoryLiveRender(detail.source || 'window-event', !!detail.remote);
    });
  }

  function buildCanonicalReplyUrl(threadId, replyId) {
    const tid = String(threadId || '').trim();
    const rid = String(replyId || '').trim();
    if (!tid || !rid) return '';
    return `${location.origin}/t/${tid}?r=${rid}`;
  }

  function buildPostHistoryUrl(type, id, resto) {
    const postId = String(id || '').trim();
    const threadId = String(type === 'reply' ? resto : id || '').trim();
    if (!postId && !threadId) return '';
    if (type === 'reply') return buildCanonicalReplyUrl(threadId, postId);

    // 主题也使用 ?r=threadId 格式
    // return `${location.origin}/t/${threadId}`;
    return `${location.origin}/t/${threadId}?r=${threadId}`;
  }

  function buildPostHistoryReplyActionUrl(type, id, resto, page) {
    const postId = String(id || '').trim();
    const threadId = String(type === 'reply' ? resto : id || '').trim();
    const pageNum = Math.max(0, Number(page) || 0);
    // reply 类型保持原来的行为：有 page 就用 ?page=N，否则回退到 ?r=replyId
    if (type === 'reply') {
      if (threadId && pageNum > 0) return `${location.origin}/t/${threadId}?page=${pageNum}`;
      return buildPostHistoryUrl(type, postId, threadId);
    }
    // thread 类型优先从浏览历史获取最新页面（动态更新）
    const historyUrl = getLatestThreadHistoryUrl(threadId);
    if (historyUrl) return historyUrl;
    // 没有浏览历史，回退到发言历史记录的页面
    const fallbackPage = Math.max(1, Number(page) || 1);
    if (threadId) return `${location.origin}/t/${threadId}?page=${fallbackPage}`;
    return buildPostHistoryUrl(type, postId, threadId);
  }

  function getConfirmedPostHistoryIds(store) {
    const ids = new Set();
    Object.keys(store.items || {}).forEach(key => {
      const item = store.items[key];
      if (item && item.status === 'confirmed' && item.id) ids.add(String(item.id));
    });
    return ids;
  }

  function upsertPostHistoryRecord(record) {
    if (!record || !record.localId) return getPostHistoryStore();
    const store = getPostHistoryStore();
    const old = store.items[record.localId] || {};
    const merged = Object.assign({}, old, record, {
      localId: record.localId,
      status: normalizePostHistoryStatus(record.status),
      type: normalizePostHistoryType(record.type),
      contentText: normalizePostHistoryText(record.contentText || record.contentRaw || old.contentText || ''),
      contentHash: record.contentHash || old.contentHash || hashPostHistoryText(record.contentText || record.contentRaw || old.contentText || ''),
      submittedAt: Number(record.submittedAt || old.submittedAt) || Date.now()
    });
    store.items[merged.localId] = merged;
    store.order = [merged.localId].concat((store.order || []).filter(key => key !== merged.localId));
    const typeCounts = { thread: 0, reply: 0 };
    store.order.forEach(key => {
      const type = normalizePostHistoryType(store.items[key]?.type);
      typeCounts[type]++;

    });

    logPostHistory('store upsert', {
      localId: merged.localId,
      status: merged.status,
      type: merged.type,
      contentHash: merged.contentHash,
      submittedAt: merged.submittedAt,
      total: store.order.length,
      threadCount: typeCounts.thread,
      replyCount: typeCounts.reply
    });
    return setPostHistoryStore(store);
  }

  function updatePostHistoryRecord(localId, patch) {
    const store = getPostHistoryStore();
    if (!store.items[localId]) {
      logPostHistory('store update skipped', { localId, patch: patch || {} }, 'warn');
      return store;
    }
    store.items[localId] = Object.assign({}, store.items[localId], patch || {});
    logPostHistory('store update', {
      localId,
      patch: patch || {},
      status: store.items[localId].status,
      type: store.items[localId].type,
      id: store.items[localId].id || '',
      resto: store.items[localId].resto || ''
    });
    return setPostHistoryStore(store);
  }

  function deletePostHistoryItem(localId) {
    const store = getPostHistoryStore();
    delete store.items[localId];
    store.order = (store.order || []).filter(key => key !== localId);
    return setPostHistoryStore(store);
  }

  function clearPostHistory() {
    return setPostHistoryStore(createDefaultPostHistoryStore());
  }

  function searchPostHistory(query, type) {
    const store = getPostHistoryStore();
    const selectedType = normalizePostHistoryType(type || postHistoryActiveType);
    const { filters, tokens } = parsePostHistorySearchQuery(query);
    return (store.order || [])
      .map(key => ({ key, item: store.items[key] }))
      .filter(result => {
        const item = result.item || {};
        if (normalizePostHistoryType(item.type) !== selectedType) return false;
        if (filters.statusFilters.length && !filters.statusFilters.includes(normalizePostHistoryStatus(item.status))) return false;
        if (filters.fidFilters.length && !filters.fidFilters.includes(normalizePostHistoryFid(item.fid))) return false;
        if (filters.forumFilters.length && !filters.forumFilters.every(value => getPostHistoryForumSearchText(item).includes(value))) return false;
        if (filters.hasImage && !item.imageFile) return false;
        if (filters.isGif && !/\.gif(?:$|[?#])/i.test(String(item.imageFile || item.imageExt || ''))) return false;
        if (filters.hasZeroWidth && !ZERO_WIDTH_RE.test(String(item.contentRaw || item.contentText || ''))) return false;
        if (filters.fieldFilters.length && !filters.fieldFilters.every(filter => getPostHistorySearchFieldText(item, filter.field).includes(filter.value))) return false;
        const text = buildPostHistorySearchText(item);
        return tokens.every(token => text.includes(token));
      });
  }

  function parsePostHistorySearchQuery(query) {
    const filters = { statusFilters: [], fidFilters: [], forumFilters: [], fieldFilters: [], hasImage: false, isGif: false, hasZeroWidth: false };
    const tokens = [];
    String(query || '').split(/\s+/).filter(Boolean).forEach(rawToken => {
      const token = normalizeHistorySearchValue(rawToken);
      const pair = token.match(/^([a-z]+):(.+)$/);
      if (!pair) {
        tokens.push(token);
        return;
      }
      const key = pair[1];
      const value = normalizeHistorySearchValue(pair[2]);
      if (!value) return;
      if (key === 'status' && ['pending', 'confirmed', 'unconfirmed', 'failed'].includes(value)) filters.statusFilters.push(value);
      else if (key === 'fid') {
        const fid = normalizePostHistoryFid(value);
        if (fid) filters.fidFilters.push(fid);
      } else if (key === 'forum') filters.forumFilters.push(value);
      else if (key === 'has' && value === 'image') filters.hasImage = true;
      else if (key === 'has' && value === 'gif') filters.isGif = true;
      else if (key === 'has' && (value === 'zwsp' || value === 'zerowidth')) filters.hasZeroWidth = true;
      else if (['id', 'thread', 'page', 'cookie', 'name', 'email'].includes(key)) filters.fieldFilters.push({ field: key, value });
      else tokens.push(token);
    });
    return { filters, tokens };
  }

  function getPostHistorySearchFieldText(item, field) {
    if (field === 'id') return normalizeHistorySearchValue([item.id, item.postId].join(' '));
    if (field === 'thread') return normalizeHistorySearchValue([item.threadId, item.resto].join(' '));
    if (field === 'page') return normalizeHistorySearchValue(item.page);
    if (field === 'cookie') return normalizeHistorySearchValue(item.userHash);
    if (field === 'name') return normalizeHistorySearchValue(item.name);
    if (field === 'email') return normalizeHistorySearchValue(item.email);
    return '';
  }

  function buildPostHistorySearchText(item) {
    return [
      item.id,
      item.threadId,
      item.postId,
      item.resto,
      item.fid,
      item.forumName,
      getPostHistoryForumSearchText(item),
      item.title,
      item.name,
      item.email,
      item.contentText,
      item.contentRaw,
      item.userHash,
      item.status,
      item.type,
      item.page,
      item.url,
      item.sourceUrl,
      item.imageFile,
      item.imageImg,
      item.imageExt
    ].join(' ').toLowerCase();
  }

  function parseLastPostResponse(resp, context) {
    const text = resp && (resp.responseText || resp.response) || '';
    try {
      const json = typeof text === 'string' ? JSON.parse(text) : text;
      const data = json && (json.data || json.post || json);
      const post = Array.isArray(data) ? (data[0] || null) : data;
      if (!post) {
        logPostHistory('getLastPost empty', Object.assign({}, context || {}, { responseLength: String(text || '').length }));
        return null;
      }
      logPostHistory('getLastPost parse', Object.assign({}, context || {}, { candidate: summarizePostHistoryCandidate(post) }));
      return post;
    } catch (e) {
      logPostHistory('getLastPost parse failed', Object.assign({}, context || {}, {
        error: e && e.message ? e.message : String(e),
        responseLength: String(text || '').length,
        preview: String(text || '').slice(0, 80)
      }), 'warn');
      return null;
    }
  }

  function fetchPostHistorySameOriginText(url, context, stage) {
    const label = stage || 'post history api';
    logPostHistory(label + ' request', Object.assign({}, context || {}, { url }));
    return fetch(url, { credentials: 'include', cache: 'no-store' }).then(resp => {
      return resp.text().then(text => {
        logPostHistory(label + ' response', Object.assign({}, context || {}, {
          status: resp.status,
          responseLength: String(text || '').length
        }));
        if (!resp.ok) throw new Error(`HTTP ${resp.status} ${url}`);
        return {
          status: resp.status,
          statusText: resp.statusText,
          responseText: text,
          response: text,
          finalUrl: resp.url || url
        };
      });
    }).catch(e => {
      logPostHistory(label + ' error', Object.assign({}, context || {}, { error: e && e.message ? e.message : String(e) }), 'warn');
      throw e;
    });
  }

  function fetchLastPostHistoryPost(context) {
    const url = `${POST_HISTORY_API_BASE}/getLastPost`;
    return fetchPostHistorySameOriginText(url, context, 'getLastPost').then(resp => parseLastPostResponse(resp, context));
  }

  function getPostHistoryApiCookieHeaders() {
    const userhash = getCurrentBrowserUserhash();
    return userhash ? { Cookie: `userhash=${userhash}` } : null;
  }

  function buildPostHistoryImageFile(img, ext) {
    const base = String(img || '').trim();
    const extValue = String(ext || '').trim();
    if (!base) return '';
    const suffix = extValue ? (extValue[0] === '.' ? extValue : `.${extValue}`) : '';
    if (!suffix) return base;
    return base.toLowerCase().endsWith(suffix.toLowerCase()) ? base : base + suffix;
  }

  function parsePostHistoryRefResponse(resp, context) {
    const text = resp && (resp.responseText || resp.response) || '';
    try {
      const json = typeof text === 'string' ? JSON.parse(text) : text;
      const data = json && (json.data || json.post || json);
      const refPost = data && !Array.isArray(data) ? data : null;
      if (refPost && refPost.success === false) throw new Error(refPost.error || 'ref api error');
      if (!refPost) {
        logPostHistory('ref empty', Object.assign({}, context || {}, { responseLength: String(text || '').length }));
        return null;
      }
      logPostHistory('ref parse', Object.assign({}, context || {}, {
        id: refPost.id || '',
        imageFile: buildPostHistoryImageFile(refPost.img, refPost.ext)
      }));
      return refPost;
    } catch (e) {
      logPostHistory('ref parse failed', Object.assign({}, context || {}, {
        error: e && e.message ? e.message : String(e),
        responseLength: String(text || '').length,
        preview: String(text || '').slice(0, 80)
      }), 'warn');
      return null;
    }
  }

  function postHistoryRefPostHasImage(refPost) {
    return !!buildPostHistoryImageFile(refPost && refPost.img, refPost && refPost.ext);
  }

  function parsePostHistoryRefHtmlResponse(resp, context) {
    const html = resp && (resp.responseText || resp.response) || '';
    try {
      const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
      const root = doc.querySelector('.h-threads-img-box') || doc.querySelector('.h-threads-item-main') || doc.body;
      let imageFile = extractThreadHistoryImageFile(root);
      if (!imageFile) {
        const imageNode = doc.querySelector('.h-threads-img-a[href], img.h-threads-image, img.h-threads-img, a[href*="/image/"], a[href*="/thumb/"]');
        const imageAnchor = imageNode && imageNode.closest ? imageNode.closest('a[href]') : imageNode;
        imageFile = normalizeThreadHistoryImageFile(
          (imageAnchor && imageAnchor.getAttribute && imageAnchor.getAttribute('href')) ||
          (imageNode && imageNode.getAttribute && (imageNode.getAttribute('data-src') || imageNode.getAttribute('src')))
        );
      }
      if (!imageFile) {
        logPostHistory('ref html empty', Object.assign({}, context || {}, { responseLength: String(html || '').length }));
        return null;
      }
      logPostHistory('ref html parse', Object.assign({}, context || {}, { imageFile }));
      return { img: imageFile, ext: '', imageFile };
    } catch (e) {
      logPostHistory('ref html parse failed', Object.assign({}, context || {}, {
        error: e && e.message ? e.message : String(e),
        responseLength: String(html || '').length,
        preview: String(html || '').slice(0, 80)
      }), 'warn');
      return null;
    }
  }

  function fetchPostHistoryRefPost(id, context) {
    const postId = String(id || '').trim();
    if (!postId) return Promise.resolve(null);
    const detail = Object.assign({}, context || {}, { id: postId });
    return fetchPostHistoryRefApiPost(postId, detail)
      .then(refPost => {
        if (postHistoryRefPostHasImage(refPost)) return refPost;
        return fetchPostHistorySameOriginRefPost(postId, detail);
      })
      .catch(() => fetchPostHistorySameOriginRefPost(postId, detail));
  }

  function fetchPostHistoryRefApiPost(id, context) {
    const postId = String(id || '').trim();
    if (!postId) return Promise.resolve(null);
    const url = `${POST_HISTORY_REF_API_FALLBACK_BASE}/ref?id=${encodeURIComponent(postId)}`;
    const headers = getPostHistoryApiCookieHeaders();
    const detail = Object.assign({}, context || {}, { id: postId, api: true, authenticated: !!headers });
    logPostHistory('ref api request', Object.assign({}, detail, { url }));
    return gmRequest(url, 'text', headers).then(resp => {
      logPostHistory('ref api response', Object.assign({}, detail, {
        status: resp.status,
        responseLength: String(resp.responseText || resp.response || '').length
      }));
      const refPost = parsePostHistoryRefResponse(resp, detail);
      return postHistoryRefPostHasImage(refPost) ? refPost : null;
    }).catch(e => {
      logPostHistory('ref api error', Object.assign({}, detail, { error: e && e.message ? e.message : String(e) }), 'warn');
      throw e;
    });
  }

  function fetchPostHistorySameOriginRefPost(id, context) {
    const postId = String(id || '').trim();
    if (!postId) return Promise.resolve(null);
    const url = `${POST_HISTORY_API_BASE}/ref?id=${encodeURIComponent(postId)}`;
    const detail = Object.assign({}, context || {}, { id: postId, sameOriginFallback: true });
    return fetchPostHistorySameOriginText(url, detail, 'ref same-origin fallback')
      .then(resp => {
        const refPost = parsePostHistoryRefResponse(resp, detail);
        if (postHistoryRefPostHasImage(refPost)) return refPost;
        return fetchPostHistoryRefHtmlFallbackPost(postId, detail);
      })
      .catch(() => fetchPostHistoryRefHtmlFallbackPost(postId, detail));
  }

  function fetchPostHistoryRefHtmlFallbackPost(id, context) {
    const postId = String(id || '').trim();
    if (!postId) return Promise.resolve(null);
    const url = `/Home/Forum/ref?id=${encodeURIComponent(postId)}`;
    const detail = Object.assign({}, context || {}, { id: postId, htmlFallback: true });
    return fetchPostHistorySameOriginText(url, detail, 'ref html fallback')
      .then(resp => parsePostHistoryRefHtmlResponse(resp, detail));
  }

  function enrichPostHistoryRefImage(localId, postId) {
    return fetchPostHistoryRefPost(postId, { localId }).then(refPost => {
      const imageFile = refPost ? buildPostHistoryImageFile(refPost.img, refPost.ext) : '';
      if (!imageFile) return false;
      updatePostHistoryRecord(localId, { imageFile, imageImg: refPost.img || '', imageExt: refPost.ext || '' });
      return true;
    }).catch(e => {
      logPostHistory('ref image error', { localId, id: postId, error: e && e.message ? e.message : String(e) }, 'warn');
      return false;
    });
  }

  function parsePostHistoryThreadResponse(resp, context) {
    const text = resp && (resp.responseText || resp.response) || '';
    try {
      const thread = typeof text === 'string' ? JSON.parse(text) : text;
      if (thread && thread.success === false) throw new Error(thread.error || 'thread api error');
      const replies = Array.isArray(thread && thread.Replies) ? thread.Replies : [];
      const replyCount = Number(thread && (thread.ReplyCount || thread.replyCount || thread.reply_count)) || replies.length;
      logPostHistory('thread fallback parse', Object.assign({}, context || {}, { replyCount, replies: replies.length }));
      return { thread, replies, replyCount, page: Math.max(1, Number(context && context.page) || 1) };
    } catch (e) {
      logPostHistory('thread fallback parse failed', Object.assign({}, context || {}, {
        error: e && e.message ? e.message : String(e),
        responseLength: String(text || '').length,
        preview: String(text || '').slice(0, 80)
      }), 'warn');
      throw e;
    }
  }

  function fetchPostHistoryThreadPage(threadId, page, context) {
    const detail = Object.assign({}, context || {}, { threadId, page });
    return fetchPostHistoryThreadApiPage(threadId, page, detail)
      .catch(() => fetchPostHistorySameOriginThreadPage(threadId, page, detail));
  }

  function fetchPostHistoryThreadApiPage(threadId, page, context) {
    const url = `${POST_HISTORY_THREAD_API_BASE}/thread?id=${encodeURIComponent(threadId)}&page=${encodeURIComponent(page)}`;
    const headers = getPostHistoryApiCookieHeaders();
    const detail = Object.assign({}, context || {}, { threadId, page, api: true, authenticated: !!headers });
    logPostHistory('thread api request', Object.assign({}, detail, { url }));
    return gmRequest(url, 'text', headers).then(resp => {
      logPostHistory('thread api response', Object.assign({}, detail, {
        status: resp.status,
        responseLength: String(resp.responseText || resp.response || '').length
      }));
      return parsePostHistoryThreadResponse(resp, detail);
    }).catch(e => {
      logPostHistory('thread api error', Object.assign({}, detail, { error: e && e.message ? e.message : String(e) }), 'warn');
      throw e;
    });
  }

  function fetchPostHistorySameOriginThreadPage(threadId, page, context) {
    const url = `${POST_HISTORY_API_BASE}/thread?id=${encodeURIComponent(threadId)}&page=${encodeURIComponent(page)}`;
    const detail = Object.assign({}, context || {}, { threadId, page });
    return fetchPostHistorySameOriginText(url, detail, 'thread same-origin fallback').then(resp => parsePostHistoryThreadResponse(resp, detail));
  }

  function getPostHistoryThreadFallbackPages(replyCount) {
    const total = Number(replyCount) || 0;
    const tailPage = Math.max(1, Math.ceil(total / POST_HISTORY_REPLIES_PER_PAGE));
    const pages = [tailPage, tailPage - 1]
      .filter(page => page >= 1)
      .map(page => Math.max(1, Number(page) || 1));
    return Array.from(new Set(pages)).sort((a, b) => b - a);
  }

  function buildPostHistoryThreadCandidate(reply, thread, page) {
    const threadId = String(thread && thread.id || '').trim();
    const fid = getPostHistoryPostFid(reply) || getPostHistoryPostFid(thread);
    return Object.assign({}, reply || {}, { fid, resto: threadId, page: Math.max(1, Number(page) || 1) });
  }

  function findPostHistoryThreadFallbackMatch(pageData, snapshot, usedIds) {
    const replies = Array.isArray(pageData && pageData.replies) ? pageData.replies : [];
    for (let i = replies.length - 1; i >= 0; i--) {
      const candidate = buildPostHistoryThreadCandidate(replies[i], pageData && pageData.thread || { id: snapshot && snapshot.resto, fid: snapshot && snapshot.fid }, pageData && pageData.page);
      if (postHistoryMatchesSnapshot(candidate, snapshot, usedIds)) return candidate;
    }
    return null;
  }

  const POST_HISTORY_THREAD_PAGE_RETRY_DELAYS = [5000, 15000, 30000, 60000, 120000];

  async function completePostHistoryFromThreadFallback(localId, snapshot, retryAttempt) {
    if (!snapshot || snapshot.type !== 'reply' || !String(snapshot.resto || '').trim()) {
      logPostHistory('thread fallback exhausted', { localId, reason: 'unsupported-snapshot', snapshot: summarizePostHistorySnapshot(snapshot) }, 'warn');
      return false;
    }
    const threadId = String(snapshot.resto || '').trim();
    try {
      const firstPage = await fetchPostHistoryThreadPage(threadId, 1, { localId, phase: 'count', retryAttempt: retryAttempt || 0 });
      const pages = getPostHistoryThreadFallbackPages(firstPage.replyCount);
      const usedIds = getConfirmedPostHistoryIds(getPostHistoryStore());
      for (const page of pages) {
        const pageData = page === 1 ? firstPage : await fetchPostHistoryThreadPage(threadId, page, { localId, phase: 'scan' });
        const post = findPostHistoryThreadFallbackMatch(pageData, snapshot, usedIds);
        if (post) {
          logPostHistory('thread fallback confirmed', { localId, page, retryAttempt: retryAttempt || 0, candidate: summarizePostHistoryCandidate(post) });
          confirmPostHistorySnapshot(localId, post);
          return true;
        }
      }
      logPostHistory('thread fallback exhausted', { localId, pages, snapshot: summarizePostHistorySnapshot(snapshot) }, 'warn');
      return false;
    } catch (e) {
      const attempt = retryAttempt || 0;
      if (attempt < POST_HISTORY_THREAD_PAGE_RETRY_DELAYS.length) {
        const delay = POST_HISTORY_THREAD_PAGE_RETRY_DELAYS[attempt];
        logPostHistory('thread page verify retry scheduled', { localId, threadId, attempt, nextAttempt: attempt + 1, delay, error: e && e.message ? e.message : String(e) });
        setTimeout(() => {
          completePostHistoryFromThreadFallback(localId, snapshot, attempt + 1);
        }, delay);
        return false;
      }
      logPostHistory('thread page verify error', { localId, threadId, attempts: attempt + 1, error: e && e.message ? e.message : String(e) }, 'warn');
      return false;
    }
  }

  function postHistoryMatchesSnapshot(post, snapshot, usedIds) {
    const reject = (reason, extra) => {
      logPostHistory('match rejected', Object.assign({
        reason,
        snapshot: summarizePostHistorySnapshot(snapshot),
        candidate: summarizePostHistoryCandidate(post)
      }, extra || {}));
      return false;
    };
    if (!post || !snapshot) return reject('missing-post-or-snapshot');
    const id = String(post.id || '').trim();
    if (!id) return reject('missing-id');
    const expectedId = String(snapshot.id || snapshot.postId || '').trim();
    if (expectedId && id !== expectedId) return reject('id-mismatch', { expectedId, actualId: id });
    if (usedIds.has(id) && id !== expectedId) return reject('duplicate-confirmed-id', { id });
    const resto = String(post.resto || '0').trim();
    const type = Number(resto) === 0 ? 'thread' : 'reply';
    if (type !== snapshot.type) return reject('type-mismatch', { expectedType: snapshot.type, actualType: type });
    if (type === 'reply' && String(snapshot.resto || '').trim() && String(snapshot.resto || '').trim() !== resto) return reject('reply-resto-mismatch', { expectedResto: String(snapshot.resto || '').trim(), actualResto: resto });
    const postText = normalizePostHistoryText(post.content || '');
    if (postText && snapshot.contentHash && hashPostHistoryText(postText) !== snapshot.contentHash && postText !== snapshot.contentText) {
      logPostHistory('server content differs', {
        snapshot: summarizePostHistorySnapshot(snapshot),
        candidate: summarizePostHistoryCandidate(post),
        expectedHash: snapshot.contentHash,
        actualHash: hashPostHistoryText(postText)
      });
    }
    const postTs = Date.parse(post.now || '');
    if (!postTs) return reject('missing-time');
    const timeDiff = Math.abs(postTs - Number(snapshot.submittedAt || Date.now()));
    if (timeDiff > POST_HISTORY_MATCH_TIME_WINDOW_MS) return reject('time-window-mismatch', { postTs, submittedAt: Number(snapshot.submittedAt || Date.now()), timeDiff });
    logPostHistory('match accepted', {
      snapshot: summarizePostHistorySnapshot(snapshot),
      candidate: summarizePostHistoryCandidate(post),
      timeDiff
    });
    return true;
  }

  function confirmPostHistorySnapshot(localId, post) {
    const resto = String(post.resto || '0').trim();
    const type = Number(resto) === 0 ? 'thread' : 'reply';
    const id = String(post.id || '').trim();
    const url = buildPostHistoryUrl(type, id, resto);
    const existing = getPostHistoryStore().items[localId] || {};
    const existingPage = type === 'thread' ? (Number(existing.page) || 0) : 0;
    const imageFile = buildPostHistoryImageFile(post.img, post.ext);
    const serverContentRaw = post.content || '';
    const serverContentText = normalizePostHistoryText(serverContentRaw);
    const fid = getPostHistoryPostFid(post) || normalizePostHistoryFid(existing.fid);
    const update = {
      status: 'confirmed',
      type,
      id,
      resto,
      threadId: type === 'reply' ? resto : id,
      postId: id,
      page: Math.max(0, Number(post.page) || existingPage || (type === 'thread' ? 1 : 0)),
      fid,
      forumName: getPostHistoryForumNameByFid(fid),
      title: post.title || '',
      email: post.email || '',
      contentRaw: serverContentRaw,
      contentText: serverContentText,
      contentHash: hashPostHistoryText(serverContentText),
      contentHtml: sanitizePostHistoryServerContentHtml(serverContentRaw),
      userHash: post.user_hash || post.userHash || '',
      confirmedAt: Date.now(),
      url
    };
    if (imageFile) Object.assign(update, { imageFile, imageImg: post.img || '', imageExt: post.ext || '' });
    logPostHistory('confirmed', { localId, type, id, resto, url });
    updatePostHistoryRecord(localId, update);

    const resolver = postHistoryConfirmationMap.get(localId);

    if (!imageFile) {
      // 没有图片，异步获取后再通知等待者
      enrichPostHistoryRefImage(localId, id).then(() => {
        if (resolver) {
          resolver(Object.assign({ localId }, update));
          postHistoryConfirmationMap.delete(localId);
        }
      }).catch(() => {
        if (resolver) {
          resolver(Object.assign({ localId }, update));
          postHistoryConfirmationMap.delete(localId);
        }
      });
    } else {
      // 已有图片，直接通知等待者
      if (resolver) {
        resolver(Object.assign({ localId }, update));
        postHistoryConfirmationMap.delete(localId);
      }
    }
  }

  function completePostHistorySnapshot(localId, snapshot, attempt = 0) {
    const delay = POST_HISTORY_GET_LAST_POST_RETRY_DELAYS[attempt];
    if (delay == null) {
      logPostHistory('completion exhausted', { localId, attempt, snapshot: summarizePostHistorySnapshot(snapshot) }, 'warn');
      // 清理等待者（确认失败或超时）
      const resolver = postHistoryConfirmationMap.get(localId);
      if (resolver) {
        resolver(null);
        postHistoryConfirmationMap.delete(localId);
      }
      completePostHistoryFromThreadFallback(localId, snapshot).then(confirmed => {
        if (confirmed) return;
        logPostHistory('unconfirmed', { localId, attempt, snapshot: summarizePostHistorySnapshot(snapshot) }, 'warn');
        updatePostHistoryRecord(localId, { status: 'unconfirmed' });
      }).catch(e => {
        logPostHistory('thread fallback error', { localId, error: e && e.message ? e.message : String(e) }, 'warn');
        logPostHistory('unconfirmed', { localId, attempt, snapshot: summarizePostHistorySnapshot(snapshot) }, 'warn');
        updatePostHistoryRecord(localId, { status: 'unconfirmed' });
      });
      return;
    }
    logPostHistory('completion scheduled', { localId, attempt, delay, snapshot: summarizePostHistorySnapshot(snapshot) });
    setTimeout(() => {
      fetchLastPostHistoryPost({ localId, attempt }).then(post => {
        const store = getPostHistoryStore();
        if (!postHistoryMatchesSnapshot(post, snapshot, getConfirmedPostHistoryIds(store))) {
          logPostHistory('completion retry', { localId, attempt, nextAttempt: attempt + 1 });
          completePostHistorySnapshot(localId, snapshot, attempt + 1);
          return;
        }
        const id = String(post.id || '').trim();
        const confirmedResto = String(post.resto || snapshot.resto || '').trim();
        const confirmedSnapshot = Object.assign({}, snapshot, { id, postId: id, resto: confirmedResto, threadId: confirmedResto });
        confirmPostHistorySnapshot(localId, post);
        if (confirmedSnapshot.type === 'reply') {
          completePostHistoryFromThreadFallback(localId, confirmedSnapshot);
        }
      }).catch(e => {
        logPostHistory('completion retry', { localId, attempt, nextAttempt: attempt + 1, error: e && e.message ? e.message : String(e) }, 'warn');
        completePostHistorySnapshot(localId, snapshot, attempt + 1);
      });
    }, delay);
  }

  function snapshotSubmittedPostHistory(fd, options) {

    const type = options && options.isReply ? 'reply' : 'thread';
    const submittedAt = Date.now();
    const contentRaw = fd && fd.get ? String(fd.get('content') || '') : '';
    const contentText = normalizePostHistoryText(contentRaw);
    const resto = fd && fd.get ? String(fd.get('resto') || '').trim() : '';
    const fallbackFid = getCurrentPostHistoryFid();
    const localId = `local-${submittedAt}-${Math.random().toString(36).slice(2, 8)}`;
    const parsedSource = parseThreadHistoryUrl(location.href);
    const snapshot = {
      status: 'pending',
      type,
      localId,
      id: '',
      resto,
      threadId: type === 'reply' ? resto : '',
      postId: '',
      page: type === 'thread' ? (parsedSource ? parsedSource.page : 1) : 0,
      fid: fallbackFid,
      forumName: getPostHistoryForumNameByFid(fallbackFid),
      title: fd && fd.get ? String(fd.get('title') || '') : '',
      name: fd && fd.get ? String(fd.get('name') || '') : '',
      email: fd && fd.get ? String(fd.get('email') || '') : '',
      contentRaw,
      contentText,
      contentHash: hashPostHistoryText(contentText),
      userHash: '',
      submittedAt,
      confirmedAt: 0,
      sourceUrl: location.href,
      url: ''
    };

    // 为发串创建一个可等待的 Promise，用于确认后跳转
    let confirmResolver;
    const confirmPromise = new Promise(res => { confirmResolver = res; });
    postHistoryConfirmationMap.set(localId, confirmResolver);
    logPostHistory('snapshot', { snapshot: summarizePostHistorySnapshot(snapshot), content: summarizePostHistoryText(contentText) });
    upsertPostHistoryRecord(snapshot);
    completePostHistorySnapshot(localId, snapshot, 0);
    return { snapshot, localId, confirmPromise };
  }

  function parseThreadHistoryUrl(inputUrl) {
    let url;
    try {
      url = new URL(inputUrl || location.href, location.origin);
    } catch (e) {
      return null;
    }
    const path = url.pathname || '';
    const normalMatch = path.match(/\/t\/(\d{8,})(?:\/(\d+))?/);
    const poMatch = path.match(/\/Forum\/po\/id\/(\d{8,})(?:\/page\/(\d+)\.html)?/);
    const match = normalMatch || poMatch;
    if (!match) return null;
    const pathPage = parseInt(match[2] || '', 10);
    const queryPage = parseInt(url.searchParams.get('page') || '', 10);
    return {
      mode: poMatch ? 'po' : 'normal',
      threadId: String(match[1]).slice(0, 8),
      page: pathPage > 0 ? pathPage : (queryPage > 0 ? queryPage : 1),
      url: url.toString()
    };
  }

  function buildThreadHistoryPageUrl(mode, threadId, page) {
    const tid = String(threadId || '').trim();
    const pageNum = Math.max(1, Number(page) || 1);
    if (!tid) return location.href;
    if (mode === 'po') return `${location.origin}/Forum/po/id/${tid}/page/${pageNum}.html`;
    return `${location.origin}/t/${tid}?page=${pageNum}`;
  }

  function parseThreadHistoryPageNumberFromElement(el) {
    if (!el) return 0;
    const text = String(el.textContent || '').trim();
    const lastTextMatch = text.match(/末页\s*\((\d+)\)/);
    if (lastTextMatch) return Number(lastTextMatch[1]) || 0;
    const href = el.getAttribute && el.getAttribute('href');
    const parsed = href ? parseThreadHistoryUrl(href) : null;
    if (parsed && parsed.page) return Number(parsed.page) || 0;
    const numericText = text.match(/^\d+$/);
    return numericText ? Number(numericText[0]) || 0 : 0;
  }

  function getThreadHistoryPaginationBounds(root = document) {
    const paginations = Array.from((root || document).querySelectorAll('ul.uk-pagination.uk-pagination-left.h-pagination'));
    const pagination = paginations.length ? paginations[paginations.length - 1] : null;
    if (!pagination) return null;

    const items = Array.from(pagination.querySelectorAll('li'));
    const elements = Array.from(pagination.querySelectorAll('a, span'));
    const parsedLinks = elements
      .map(el => parseThreadHistoryUrl(el.getAttribute && el.getAttribute('href')))
      .filter(Boolean);
    const parsedIdentity = parsedLinks.find(parsed => parsed.threadId);
    const lastPageLink = elements.find(el => /^末页/.test(String(el.textContent || '').trim()));
    const activeEl = pagination.querySelector('li.uk-active a, li.uk-active span');
    const activePage = parseThreadHistoryPageNumberFromElement(activeEl);
    const nextItem = items.find(li => /下一页|下页|Next|›|»|→/i.test(String(li.textContent || '').trim()));
    const nextHasLink = !!(nextItem && nextItem.querySelector('a[href]'));
    const numericPages = elements
      .map(parseThreadHistoryPageNumberFromElement)
      .filter(num => num > 0);

    let lastPage = parseThreadHistoryPageNumberFromElement(lastPageLink);
    if (!lastPage && nextItem && !nextHasLink) {
      lastPage = activePage || Math.max(0, ...numericPages);
    }
    if (!lastPage) return null;

    return {
      lastPage,
      activePage,
      threadId: parsedIdentity && parsedIdentity.threadId || '',
      mode: parsedIdentity && parsedIdentity.mode || '',
      source: lastPageLink ? 'last-link' : 'disabled-next'
    };
  }

  function applyThreadHistoryPageBounds(record, root = document) {
    if (!record || !record.threadId) return record;
    const bounds = getThreadHistoryPaginationBounds(root);
    if (!bounds || !bounds.lastPage) return record;
    if (bounds.threadId && bounds.threadId !== String(record.threadId)) return record;
    if (bounds.mode && record.mode && bounds.mode !== record.mode) return record;

    const parsedUrl = record.url ? parseThreadHistoryUrl(record.url) : null;
    const page = Math.max(1, Number(record.page || (parsedUrl && parsedUrl.page)) || 1);
    const boundedPage = Math.min(page, bounds.lastPage);
    const existingUrlPage = parsedUrl && parsedUrl.page || 0;
    const next = Object.assign({}, record, {
      page: boundedPage,
      maxVisitedPage: Math.min(Math.max(Number(record.maxVisitedPage) || boundedPage, boundedPage), bounds.lastPage),
      lastKnownPage: bounds.lastPage
    });
    if (page > bounds.lastPage || existingUrlPage > bounds.lastPage) {
      next.url = buildThreadHistoryPageUrl(next.mode, next.threadId, boundedPage);
    }
    return next;
  }

  function getElementTextPreserveZeroWidth(el) {
    return el ? String(el.textContent || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n') : '';
  }

  function getVisibleTextForHistory(text) {
    return String(text || '').replace(ZERO_WIDTH_RE, '').replace(/[\s\u00a0]+/g, '');
  }

  function trimThreadHistoryContentText(text) {
    return String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  }

  function sanitizeThreadHistoryInlineStyle(styleValue) {
    const safeRules = [];
    String(styleValue || '').split(';').forEach(rule => {
      const separator = rule.indexOf(':');
      if (separator === -1) return;
      const name = rule.slice(0, separator).trim().toLowerCase();
      const value = rule.slice(separator + 1).trim();
      if (!/^(color|background-color|text-decoration|font-weight)$/.test(name) && !/^--darkreader-inline-(?:color|bgcolor)$/.test(name)) return;
      if (/url\s*\(|expression\s*\(|javascript:/i.test(value)) return;
      safeRules.push(`${name}: ${value}`);
    });
    return safeRules.join('; ');
  }

  function sanitizeThreadHistoryContentUrl(urlValue) {
    try {
      const url = new URL(urlValue, location.origin);
      if (!/^https?:$/.test(url.protocol)) return '';
      return url.href;
    } catch (e) {
      return '';
    }
  }

  function escapeThreadHistoryHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function cleanThreadHistoryContentWhitespace(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    if (!nodes.length) return;
    nodes[0].nodeValue = String(nodes[0].nodeValue || '').replace(/^\s+/, '');
    const last = nodes[nodes.length - 1];
    last.nodeValue = String(last.nodeValue || '').replace(/\s+$/, '');
  }

  function normalizeThreadHistoryContentWhitespace(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const prev = node.previousSibling;
      const next = node.nextSibling;
      let value = String(node.nodeValue || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      value = value.replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, '\n\n');
      if (prev && prev.nodeType === Node.ELEMENT_NODE && prev.tagName === 'BR') value = value.replace(/^\s+/, '');
      if (next && next.nodeType === Node.ELEMENT_NODE && next.tagName === 'BR') value = value.replace(/[ \t]+$/, '');
      node.nodeValue = value;
    });
    cleanThreadHistoryContentWhitespace(root);
  }

  function removeThreadHistoryTrailingBreaks(root) {
    while (root && root.lastChild) {
      const node = root.lastChild;
      if (node.nodeType === Node.ELEMENT_NODE) {
        removeThreadHistoryTrailingBreaks(node);
      }
      if (node.nodeType === Node.TEXT_NODE && !String(node.nodeValue || '').trim()) {
        node.remove();
        continue;
      }
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
        node.remove();
        continue;
      }
      if (isEmptyThreadHistoryInlineElement(node)) {
        node.remove();
        continue;
      }
      break;
    }
  }

  function isEmptyThreadHistoryInlineElement(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
    if (!/^(A|SPAN|FONT|B|STRONG|I|EM|U|S|DEL|CODE|SUB|SUP)$/.test(node.tagName)) return false;
    return !String(node.textContent || '').trim() && !node.querySelector('img, video, audio, canvas, svg');
  }

  function limitThreadHistoryContentText(root, limit) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let remaining = Math.max(0, Number(limit) || 0);
    let truncated = false;
    for (const node of nodes) {
      if (truncated || remaining <= 0) {
        node.nodeValue = '';
        continue;
      }
      const value = String(node.nodeValue || '');
      if (value.length > remaining) {
        node.nodeValue = value.slice(0, remaining).replace(/\s+$/, '');
        pruneAfterThreadHistoryTextNode(root, node);
        truncated = true;
        remaining = 0;
      } else {
        remaining -= value.length;
      }
    }
    cleanThreadHistoryContentWhitespace(root);
    removeThreadHistoryTrailingBreaks(root);
  }

  function pruneAfterThreadHistoryTextNode(root, textNode) {
    let current = textNode;
    while (current && current.parentNode && current !== root) {
      while (current.nextSibling) current.nextSibling.remove();
      current = current.parentNode;
    }
    if (current === root) removeThreadHistoryTrailingBreaks(root);
  }

  function isThreadHistoryContentTruncated(text) {
    return String(text || '').length > THREAD_HISTORY_EXCERPT_LIMIT;
  }

  function appendThreadHistoryTruncationMarker(contentEl) {
    if (!contentEl) return;
    removeThreadHistoryTrailingBreaks(contentEl);
    contentEl.appendChild(document.createTextNode('……'));
  }

  function sanitizeThreadHistoryInlineHtml(sourceEl) {
    if (!sourceEl) return '';
    const clone = sourceEl.cloneNode(true);
    clone.querySelectorAll('script, style, template, iframe, object, embed, svg, math').forEach(el => el.remove());
    const allowedTags = new Set(['SPAN', 'FONT', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'DEL', 'SUB', 'SUP']);
    Array.from(clone.querySelectorAll('*')).forEach(el => {
      if (!allowedTags.has(el.tagName)) {
        el.replaceWith(...Array.from(el.childNodes));
        return;
      }
      Array.from(el.attributes).forEach(attr => {
        const name = attr.name.toLowerCase();
        const value = attr.value || '';
        if (name === 'style') {
          const safeStyle = sanitizeThreadHistoryInlineStyle(value);
          if (safeStyle) el.setAttribute('style', safeStyle);
          else el.removeAttribute(attr.name);
          return;
        }
        if (el.tagName === 'FONT' && name === 'color') return;
        if (name === 'class') return;
        if (name === 'data-darkreader-inline-color' || name === 'data-darkreader-inline-bgcolor') return;
        el.removeAttribute(attr.name);
      });
    });
    cleanThreadHistoryContentWhitespace(clone);
    return clone.innerHTML.trim();
  }

  function extractThreadHistoryCookieId(cookieEl, fallbackText) {
    if (cookieEl) {
      const font = cookieEl.querySelector('font');
      if (font) {
        for (const node of font.childNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            const value = String(node.nodeValue || '').trim();
            if (value) return value;
          }
        }
      }
    }
    const value = (String(fallbackText || '').split(':')[1] || fallbackText || '').trim();
    const match = String(value).match(/[A-Za-z0-9]{3,7}/);
    return match ? match[0] : value;
  }

  function buildThreadHistoryLegacyCookieHtml(cookieId) {
    const value = String(cookieId || '').trim();
    const match = value.match(/^([A-Za-z0-9]{3,7})(.+)$/);
    if (!match || !match[2].trim()) return '';
    const id = escapeThreadHistoryHtml(match[1]);
    const badge = escapeThreadHistoryHtml(match[2].trim());
    return `ID:<font color="red">${id}<sub style="color: darkorange; font-weight: bold;">${badge}</sub></font>`;
  }

  function getThreadHistoryCookieMarkId(item) {
    const value = String(item && item.cookieId || '').trim();
    const match = value.match(/^([A-Za-z0-9]{3,7})/);
    return match ? match[1] : value;
  }

  function sanitizeThreadHistoryContentHtml(contentEl) {
    if (!contentEl) return '';
    const clone = contentEl.cloneNode(true);
    clone.querySelectorAll('script, style, template, iframe, object, embed, svg, math').forEach(el => el.remove());
    const allowedTags = new Set(['A', 'BR', 'SPAN', 'FONT', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'DEL', 'CODE', 'PRE', 'SUB', 'SUP']);
    Array.from(clone.querySelectorAll('*')).forEach(el => {
      if (!allowedTags.has(el.tagName)) {
        el.replaceWith(...Array.from(el.childNodes));
        return;
      }
      Array.from(el.attributes).forEach(attr => {
        const name = attr.name.toLowerCase();
        const value = attr.value || '';
        if (name.startsWith('on') || name === 'id' || (name.startsWith('data-') && name !== 'data-darkreader-inline-color' && name !== 'data-darkreader-inline-bgcolor')) {
          el.removeAttribute(attr.name);
          return;
        }
        if (name === 'style') {
          const safeStyle = sanitizeThreadHistoryInlineStyle(value);
          if (safeStyle) el.setAttribute('style', safeStyle);
          else el.removeAttribute(attr.name);
          return;
        }
        if (el.tagName === 'A' && name === 'href') {
          const safeHref = sanitizeThreadHistoryContentUrl(value);
          if (safeHref) {
            el.setAttribute('href', safeHref);
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener');
          } else {
            el.removeAttribute(attr.name);
          }
          return;
        }
        if (el.tagName === 'FONT' && name === 'color') return;
        if (name !== 'class' && name !== 'title' && name !== 'target' && name !== 'rel') el.removeAttribute(attr.name);
      });
    });
    normalizeThreadHistoryContentWhitespace(clone);
    return clone.innerHTML.trim();
  }

  function normalizeThreadHistoryImageFile(urlValue) {
    if (!urlValue) return '';
    try {
      const url = new URL(urlValue, location.origin);
      const match = url.pathname.match(/\/(?:image|thumb)\/([^?#]+)/);
      return match ? decodeURIComponent(match[1]) : '';
    } catch (e) {
      const match = String(urlValue).match(/\/(?:image|thumb)\/([^?#]+)/);
      return match ? decodeURIComponent(match[1]) : '';
    }
  }

  const THREAD_HISTORY_IMAGE_FILE_CONTRACT_EXAMPLE = '2024-12-10/6757ea866e1aa.png';

  function extractThreadHistoryImageFile(mainEl) {
    if (!mainEl) return '';
    const anchor = mainEl.querySelector('.h-threads-img-a[href]');
    const img = mainEl.querySelector('.h-threads-img-a img, img.h-threads-img');
    const sources = [
      anchor && anchor.getAttribute('href'),
      img && img.dataset && img.dataset.xdexHdSrc,
      img && img.dataset && img.dataset.xdexThumbSrc,
      img && img.dataset && img.dataset.src,
      img && img.getAttribute && img.getAttribute('src')
    ];
    for (const source of sources) {
      const imageFile = normalizeThreadHistoryImageFile(source);
      if (imageFile) return imageFile;
    }
    return '';
  }

  function isThreadHistoryMainCandidate(el) {
    return !!el && !el.closest('.h-preview-box') && !!el.querySelector('.h-threads-content');
  }

  function findThreadHistoryMainElement(root, parsed) {
    const scope = root || document;
    const primary = scope.querySelector('.h-threads-list .h-threads-item-main');
    if (isThreadHistoryMainCandidate(primary)) return primary;
    const mains = Array.from(scope.querySelectorAll('.h-threads-item-main'));
    return mains.find(isThreadHistoryMainCandidate) || null;
  }

  function extractThreadHistoryRecord(root) {
    const parsed = parseThreadHistoryUrl(location.href);
    if (!parsed) {
      logThreadHistory('skip record: unsupported url', { url: location.href });
      return null;
    }
    const mainEl = findThreadHistoryMainElement(root, parsed);
    if (!mainEl) {
      logThreadHistory('skip record: missing h-threads-item-main', { url: location.href, parsed });
      return null;
    }
    const contentEl = mainEl.querySelector('.h-threads-content');
    const rawContent = getElementTextPreserveZeroWidth(contentEl);
    const contentText = trimThreadHistoryContentText(rawContent);
    const contentTruncated = isThreadHistoryContentTruncated(contentText);
    const contentHtml = sanitizeThreadHistoryContentHtml(contentEl);
    const hasZeroWidth = ZERO_WIDTH_RE.test(rawContent);
    const hasVisibleText = !!getVisibleTextForHistory(rawContent);
    const hasWhitespaceOnly = !hasVisibleText && /^[\s\u00a0]*$/.test(rawContent.replace(ZERO_WIDTH_RE, '')) && rawContent.length > 0;
    const imageFile = extractThreadHistoryImageFile(mainEl);
    const title = getElementTextPreserveZeroWidth(mainEl.querySelector('.h-threads-info-title')).trim();
    const author = getElementTextPreserveZeroWidth(mainEl.querySelector('.h-threads-info-email')).trim();
    const cookieEl = mainEl.querySelector('.h-threads-info-uid');
    const cookieText = getElementTextPreserveZeroWidth(cookieEl).trim();
    const cookieId = extractThreadHistoryCookieId(cookieEl, cookieText);
    const cookieHtml = sanitizeThreadHistoryInlineHtml(cookieEl);
    const createdAtEl = mainEl.querySelector('.h-threads-info-createdat, .h-threads-info time');
    const createdAt = String(createdAtEl && (createdAtEl.getAttribute('title') || createdAtEl.getAttribute('datetime')) || getElementTextPreserveZeroWidth(createdAtEl)).trim();
    const tipsEl = mainEl.querySelector('.h-threads-tips');
    const sageHtml = (tipsEl && /SAGE/i.test(tipsEl.textContent || ''))
      ? '<i class="uk-icon-thumbs-down"></i>&nbsp;本串已经被SAGE'
      : '';
    return {
      key: getThreadHistoryKey(parsed.mode, parsed.threadId),
      mode: parsed.mode,
      threadId: parsed.threadId,
      page: parsed.page,
      url: parsed.url,
      title,
      author,
      cookieId,
      cookieHtml,
      createdAt,
      contentText,
      contentHtml,
      contentTruncated,
      excerpt: contentText.slice(0, THREAD_HISTORY_EXCERPT_LIMIT),
      imageFile,
      contentFlags: { hasVisibleText, hasWhitespaceOnly, hasZeroWidth },
      sageHtml,
            lastScrollY: Math.max(0, Math.floor(window.scrollY || 0))
    };
  }

  function buildThreadHistoryIndexEntry(item) {
    const contentFlags = item && item.contentFlags ? item.contentFlags : {};
    const imageFile = String(item && item.imageFile || '');
    const titleText = String(item && item.title || '').toLowerCase();
    const authorText = String(item && item.author || '').toLowerCase();
    const cookieIdText = String(item && item.cookieId || '').toLowerCase();
    const excerptText = String(item && (item.contentText || item.excerpt) || '').toLowerCase();
    const threadIdText = String(item && item.threadId || '');
    return {
      searchText: [threadIdText, titleText, authorText, cookieIdText, excerptText].join(' ').toLowerCase(),
      threadIdText,
      titleText,
      authorText,
      cookieIdText,
      excerptText,
      mode: item && item.mode === 'po' ? 'po' : 'normal',
      hasImage: !!imageFile,
      isGif: /\.gif(?:$|[?#])/i.test(imageFile),
      hasZeroWidth: !!contentFlags.hasZeroWidth,
      hasVisibleText: !!contentFlags.hasVisibleText,
      hasWhitespaceOnly: !!contentFlags.hasWhitespaceOnly,
      isSage: !!(item && item.sageHtml),
      lastVisitedAt: Number(item && item.lastVisitedAt) || 0
    };
  }

  function upsertThreadHistoryRecord(nextRecord, options = {}) {
    if (!nextRecord || !nextRecord.threadId || !nextRecord.mode) return getThreadHistoryStore();
    const now = Date.now();
    const countVisit = options.countVisit !== false;
    const touchVisitedAt = countVisit || options.touchVisitedAt === true;
    const store = getThreadHistoryStore();
    nextRecord = applyThreadHistoryPageBounds(nextRecord);
    const key = nextRecord.key || getThreadHistoryKey(nextRecord.mode, nextRecord.threadId);
    const old = store.items[key] || {};
    const maxVisitedPage = Math.max(Number(old.maxVisitedPage) || 1, Number(nextRecord.page) || 1);
    const boundedMaxVisitedPage = nextRecord.lastKnownPage ? Math.min(maxVisitedPage, Number(nextRecord.lastKnownPage) || maxVisitedPage) : maxVisitedPage;
    const mergedBase = Object.assign({}, old, nextRecord);
    const merged = Object.assign({}, applyThreadHistoryPageBounds(mergedBase), {
      key,
      firstVisitedAt: old.firstVisitedAt || now,
      lastVisitedAt: touchVisitedAt ? now : (Number(old.lastVisitedAt) || now),
      visitCount: (Number(old.visitCount) || 0) + (countVisit ? 1 : 0),
      maxVisitedPage: boundedMaxVisitedPage,
      cookieHtml: nextRecord.cookieHtml || old.cookieHtml || ''
    });
    store.items[key] = merged;
    store.index[key] = buildThreadHistoryIndexEntry(merged);
    store.order = [key].concat((store.order || []).filter(itemKey => itemKey !== key));
    const saved = setThreadHistoryStore(store);
    logThreadHistory('record saved', { key, total: saved.order.length, countVisit, reason: options.reason || '', record: merged });
    return saved;
  }

  function touchThreadHistoryCurrentLocation(options = {}) {
    const parsed = parseThreadHistoryUrl(options.url || location.href);
    if (!parsed) return getThreadHistoryStore();
    const key = getThreadHistoryKey(parsed.mode, parsed.threadId);
    const store = getThreadHistoryStore();
    const item = store.items[key];
    if (!item) return store;
    const now = Date.now();
    const bounded = applyThreadHistoryPageBounds(Object.assign({}, item, {
      page: Math.max(Number(item.page) || 1, Number(options.page || parsed.page) || 1),
      url: options.url || parsed.url
    }));
    item.page = bounded.page;
    item.url = bounded.url;
    item.maxVisitedPage = bounded.lastKnownPage
      ? Math.min(Math.max(Number(item.maxVisitedPage) || 1, Number(item.page) || 1), Number(bounded.lastKnownPage) || Number(item.page) || 1)
      : Math.max(Number(item.maxVisitedPage) || 1, Number(item.page) || 1);
    if (bounded.lastKnownPage) item.lastKnownPage = bounded.lastKnownPage;
    item.lastScrollY = Math.max(0, Math.floor(window.scrollY || 0));
    if (options.touchVisitedAt) item.lastVisitedAt = now;
    store.index[key] = buildThreadHistoryIndexEntry(item);
    store.order = [key].concat((store.order || []).filter(itemKey => itemKey !== key));
    const saved = setThreadHistoryStore(store);
    logThreadHistory('location touched', { key, reason: options.reason || '', page: item.page, url: item.url, maxVisitedPage: item.maxVisitedPage, touchVisitedAt: !!options.touchVisitedAt });
    return saved;
  }

  function recordThreadHistoryProgress(options = {}) {
    const parsed = parseThreadHistoryUrl(options.url || location.href);
    if (!parsed) return getThreadHistoryStore();
    const record = extractThreadHistoryRecord(document) || {
      key: getThreadHistoryKey(parsed.mode, parsed.threadId),
      mode: parsed.mode,
      threadId: parsed.threadId
    };
    record.key = getThreadHistoryKey(parsed.mode, parsed.threadId);
    record.mode = parsed.mode;
    record.threadId = parsed.threadId;
    record.page = Math.max(Number(record.page) || 1, Number(options.page || parsed.page) || 1);
    record.url = options.url || parsed.url;
    record.lastScrollY = Math.max(0, Math.floor(window.scrollY || 0));
    return upsertThreadHistoryRecord(record, { countVisit: false, touchVisitedAt: options.touchVisitedAt === true, reason: options.reason || 'progress' });
  }

  function updateThreadHistoryScrollPosition() {
    touchThreadHistoryCurrentLocation({ reason: 'scroll-position' });
  }

  function deleteThreadHistoryItem(key) {
    const store = getThreadHistoryStore();
    delete store.items[key];
    delete store.index[key];
    store.order = (store.order || []).filter(itemKey => itemKey !== key);
    return setThreadHistoryStore(store);
  }

  function clearThreadHistory() {
    return setThreadHistoryStore(createDefaultThreadHistoryStore());
  }

  function parseThreadHistorySearchQuery(query) {
    const filters = { mode: '', hasImage: false, isGif: false, hasZeroWidth: false, isSage: false };
    const tokens = [];
    String(query || '').toLowerCase().split(/\s+/).filter(Boolean).forEach(token => {
      if (token === 'mode:po') filters.mode = 'po';
      else if (token === 'mode:normal') filters.mode = 'normal';
      else if (token === 'has:image') filters.hasImage = true;
      else if (token === 'has:gif') filters.isGif = true;
      else if (token === 'has:zwsp' || token === 'has:zerowidth') filters.hasZeroWidth = true;
      else if (token === 'has:sage') filters.isSage = true;
      else tokens.push(token);
    });
    return { filters, tokens };
  }

  function scoreThreadHistoryIndexEntry(entry, tokens) {
    let score = Number(entry.lastVisitedAt) || 0;
    tokens.forEach(token => {
      if (/^\d{1,8}$/.test(token)) {
        if (entry.threadIdText === token) score += 1000000000000000;
        else if (entry.threadIdText.includes(token)) score += 500000000000000;
      }
    });
    return score;
  }

  function getThreadHistorySortValue(item, field) {
    if (!item) return 0;
    if (field === 'visitCount') return Number(item.visitCount) || 0;
    if (field === 'maxVisitedPage') return Number(item.maxVisitedPage || item.page) || 0;
    return Number(item.lastVisitedAt) || 0;
  }

  function compareThreadHistoryResults(a, b, sortMode, tokens) {
    const itemA = a.item || {};
    const itemB = b.item || {};
    if (sortMode === 'last-asc') return getThreadHistorySortValue(itemA, 'lastVisitedAt') - getThreadHistorySortValue(itemB, 'lastVisitedAt');
    if (sortMode === 'visits-desc') return getThreadHistorySortValue(itemB, 'visitCount') - getThreadHistorySortValue(itemA, 'visitCount') || getThreadHistorySortValue(itemB, 'lastVisitedAt') - getThreadHistorySortValue(itemA, 'lastVisitedAt');
    if (sortMode === 'visits-asc') return getThreadHistorySortValue(itemA, 'visitCount') - getThreadHistorySortValue(itemB, 'visitCount') || getThreadHistorySortValue(itemB, 'lastVisitedAt') - getThreadHistorySortValue(itemA, 'lastVisitedAt');
    if (sortMode === 'page-desc') return getThreadHistorySortValue(itemB, 'maxVisitedPage') - getThreadHistorySortValue(itemA, 'maxVisitedPage') || getThreadHistorySortValue(itemB, 'lastVisitedAt') - getThreadHistorySortValue(itemA, 'lastVisitedAt');
    return scoreThreadHistoryIndexEntry(b.index, tokens) - scoreThreadHistoryIndexEntry(a.index, tokens);
  }

  function searchThreadHistory(query, storeInput, sortMode) {
    const store = normalizeThreadHistoryStore(storeInput || getThreadHistoryStore());
    const { filters, tokens } = parseThreadHistorySearchQuery(query);
    return (store.order || [])
      .filter(key => {
        const entry = store.index[key];
        if (!entry || !store.items[key]) return false;
        if (filters.mode && entry.mode !== filters.mode) return false;
        if (filters.hasImage && !entry.hasImage) return false;
        if (filters.isGif && !entry.isGif) return false;
        if (filters.hasZeroWidth && !entry.hasZeroWidth) return false;
        if (filters.isSage && !entry.isSage) return false;
        return tokens.every(token => entry.searchText.includes(token));
      })
      .map(key => ({ key, item: store.items[key], index: store.index[key] }))
      .sort((a, b) => compareThreadHistoryResults(a, b, sortMode || 'last-desc', tokens));
  }

  let threadHistoryScrollTrackingInstalled = false;

  function installThreadHistoryScrollTracking() {
    if (threadHistoryScrollTrackingInstalled) return;
    threadHistoryScrollTrackingInstalled = true;
    let scrollTimer = 0;
    window.addEventListener('scroll', () => {
      if (scrollTimer) return;
      scrollTimer = setTimeout(() => {
        scrollTimer = 0;
        updateThreadHistoryScrollPosition();
      }, 1200);
    }, { passive: true });
    window.addEventListener('pagehide', updateThreadHistoryScrollPosition, { passive: true });
  }

  function isThreadHistoryPageActive() {
    return document.visibilityState === 'visible' && (typeof document.hasFocus !== 'function' || document.hasFocus());
  }

  function cancelThreadHistoryDwellTimer(resetSession) {
    if (threadHistoryDwellTimer) clearTimeout(threadHistoryDwellTimer);
    threadHistoryDwellTimer = 0;
    threadHistoryVisibleSince = 0;
    if (resetSession) threadHistoryVisibleSessionCounted = false;
  }

  function scheduleThreadHistoryReactivationVisit(source) {
    if (!parseThreadHistoryUrl(location.href)) return;
    if (!isThreadHistoryPageActive()) {
      cancelThreadHistoryDwellTimer(document.visibilityState !== 'visible');
      return;
    }
    if (threadHistoryVisibleSessionCounted || threadHistoryDwellTimer) return;
    threadHistoryVisibleSince = Date.now();
    updateThreadHistoryDebugState({ lastDwell: { source, status: 'scheduled', threshold: THREAD_HISTORY_REVISIT_DWELL_MS, at: new Date().toISOString() } });
    threadHistoryDwellTimer = setTimeout(() => {
      threadHistoryDwellTimer = 0;
      if (!threadHistoryVisibleSince || !isThreadHistoryPageActive()) return;
      if (Date.now() - threadHistoryVisibleSince < THREAD_HISTORY_REVISIT_DWELL_MS) return;
      threadHistoryVisibleSessionCounted = true;
      updateThreadHistoryDebugState({ lastDwell: { source, status: 'counted', threshold: THREAD_HISTORY_REVISIT_DWELL_MS, at: new Date().toISOString() } });
      recordCurrentThreadHistory(0, { reason: 'reactivation-dwell', countVisit: true });
    }, THREAD_HISTORY_REVISIT_DWELL_MS);
  }

  function installThreadHistoryReactivationTracking(initialCounted) {
    if (threadHistoryReactivationTrackingInstalled) return;
    threadHistoryReactivationTrackingInstalled = true;
    threadHistoryVisibleSessionCounted = !!initialCounted && document.visibilityState === 'visible';
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') scheduleThreadHistoryReactivationVisit('visibilitychange');
      else cancelThreadHistoryDwellTimer(true);
    }, { passive: true });
    window.addEventListener('focus', () => scheduleThreadHistoryReactivationVisit('focus'), { passive: true });
    window.addEventListener('blur', () => cancelThreadHistoryDwellTimer(false), { passive: true });
    window.addEventListener('pagehide', () => cancelThreadHistoryDwellTimer(true), { passive: true });
  }

  function recordCurrentThreadHistory(attempt = 0, options = {}) {
    const record = extractThreadHistoryRecord(document);
    if (!record) {
      const parsed = parseThreadHistoryUrl(location.href);
      const missingMain = !!parsed && !findThreadHistoryMainElement(document, parsed);
      updateThreadHistoryDebugState({
        lastRecord: {
          status: parsed ? (missingMain ? 'missing-main' : 'extract-failed') : 'unsupported-url',
          attempt,
          parsed,
          at: new Date().toISOString(),
          readyState: document.readyState,
          mainCount: document.querySelectorAll('.h-threads-item-main').length,
          listCount: document.querySelectorAll('.h-threads-list').length
        }
      });
      if (missingMain && attempt < THREAD_HISTORY_RECORD_RETRY_LIMIT) {
        logThreadHistory('retry record: waiting for h-threads-item-main', {
          attempt: attempt + 1,
          limit: THREAD_HISTORY_RECORD_RETRY_LIMIT,
          delay: THREAD_HISTORY_RECORD_RETRY_DELAY,
          readyState: document.readyState
        });
        setTimeout(() => recordCurrentThreadHistory(attempt + 1), THREAD_HISTORY_RECORD_RETRY_DELAY);
      }
      return;
    }
    upsertThreadHistoryRecord(record, Object.assign({ reason: 'initial-load', countVisit: true }, options));
    updateThreadHistoryDebugState({ lastRecord: { status: 'saved', attempt, reason: options.reason || 'initial-load', record, at: new Date().toISOString() } });
    installThreadHistoryScrollTracking();
  }

  function formatThreadHistoryTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${hh}:${mm}`;
  }

  function formatRelativeTimeMachineTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const weekday = '日一二三四五六'[d.getDay()];
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${day}(${weekday})${hh}:${mm}:${ss}`;
  }

  function buildThreadHistoryImageUrl(imageFile, full) {
    if (!imageFile) return '';
    const path = /\.gif$/i.test(imageFile) || full ? 'image' : 'thumb';
    const encodedFile = String(imageFile).split('/').map(encodeURIComponent).join('/');
    return `https://image.nmb.best/${path}/${encodedFile}`;
  }

  function buildThreadHistoryItemUrl(item) {
    if (item && item.url) return item.url;
    const threadId = item && item.threadId ? item.threadId : '';
    const page = item && item.page ? item.page : 1;
    return buildThreadHistoryPageUrl(item && item.mode, threadId, page);
  }

  function buildHistorySearchHelpMark(title) {
    const mark = document.createElement('span');
    mark.className = 'xdex-history-search-help';
    mark.textContent = '?';
    mark.title = title || '';
    mark.style.textDecoration = 'underline';
    mark.style.cursor = 'help';
    mark.style.whiteSpace = 'nowrap';
    mark.setAttribute('aria-label', title || '高级检索说明');
    return mark;
  }

  function getLatestThreadHistoryUrl(threadId) {
    const tid = String(threadId || '').trim();
    if (!isValidThreadId(tid)) return '';
    const store = getThreadHistoryStore();
    const candidates = ['normal', 'po']
      .map((mode) => store.items[getThreadHistoryKey(mode, tid)])
      .filter(Boolean)
      .sort((a, b) => (Number(b.lastVisitedAt) || 0) - (Number(a.lastVisitedAt) || 0));
    return candidates.length ? buildThreadHistoryItemUrl(candidates[0]) : '';
  }

  function appendThreadHistoryText(parent, tagName, className, text) {
    const el = document.createElement(tagName);
    if (className) el.className = className;
    el.textContent = text || '';
    parent.appendChild(el);
    return el;
  }

  function appendThreadHistoryInfoText(parent, className, text) {
    const value = String(text || '').trim();
    if (!value) return null;
    return appendThreadHistoryText(parent, 'span', className, value);
  }

  function shouldRenderThreadHistoryTitle(title) {
    const value = String(title || '').trim();
    return !!value && value !== '无标题';
  }

  function shouldRenderThreadHistoryAuthor(author) {
    const value = String(author || '').trim();
    return !!value && value !== '无名氏';
  }

  function buildThreadHistoryItemElement(result) {
    const item = result.item || {};
    const wrapper = document.createElement('div');
    wrapper.className = 'xdex-history-item';
    wrapper.dataset.historyKey = result.key;

    const main = document.createElement('div');
    main.className = 'h-threads-item-main';
    wrapper.appendChild(main);

    const info = document.createElement('div');
    info.className = 'h-threads-info xdex-history-info';
    main.appendChild(info);

    const infoMain = document.createElement('span');
    infoMain.className = 'xdex-history-info-main';
    info.appendChild(infoMain);

    if (shouldRenderThreadHistoryTitle(item.title)) appendThreadHistoryInfoText(infoMain, 'h-threads-info-title', item.title);
    if (shouldRenderThreadHistoryAuthor(item.author)) appendThreadHistoryInfoText(infoMain, 'h-threads-info-email', item.author);
    const createdAtNode = appendThreadHistoryInfoText(infoMain, 'h-threads-info-createdat', item.createdAt);
    if (createdAtNode) {
      createdAtNode.dataset.xdexOriginalTime = item.createdAt;
      createdAtNode.title = item.createdAt;
    }
    const cookieHtml = item.cookieHtml || buildThreadHistoryLegacyCookieHtml(item.cookieId);
    const cookieMarkId = getThreadHistoryCookieMarkId(item);
    if (cookieHtml) {
      const cookieSpan = appendThreadHistoryText(infoMain, 'span', 'h-threads-info-uid', '');
      if (cookieMarkId) cookieSpan.setAttribute('data-xdex-cookie-id', cookieMarkId);
      cookieSpan.innerHTML = cookieHtml;
    } else if (item.cookieId) {
      const cookieSpan = appendThreadHistoryInfoText(infoMain, 'h-threads-info-uid', `ID:${item.cookieId}`);
      if (cookieSpan && cookieMarkId) cookieSpan.setAttribute('data-xdex-cookie-id', cookieMarkId);
    }

    const historyReplyUrl = buildCanonicalReplyUrl(item.threadId, item.threadId);
    const historyReplyActionUrl = buildThreadHistoryItemUrl(item);
    const replyLink = document.createElement('a');
    replyLink.className = 'h-threads-info-id xdex-history-thread-id';
    replyLink.href = historyReplyUrl;
    replyLink.textContent = `No.${item.threadId || ''}`;
    infoMain.appendChild(replyLink);

    const replyAction = document.createElement('span');
    replyAction.className = 'h-threads-info-reply-btn xdex-history-reply-label';
    const replyActionLink = document.createElement('a');
    replyActionLink.className = 'xdex-history-reply-action';
    replyActionLink.href = historyReplyActionUrl;
    replyActionLink.target = '_blank';
    replyActionLink.rel = 'noopener';
    replyActionLink.textContent = '回应';
    replyAction.appendChild(document.createTextNode('['));
    replyAction.appendChild(replyActionLink);
    replyAction.appendChild(document.createTextNode(']'));
    infoMain.appendChild(replyAction);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'xdex-history-delete';
    deleteButton.dataset.historyKey = result.key;
    deleteButton.title = '删除';
    deleteButton.textContent = '×';
    main.appendChild(deleteButton);

    if (item.imageFile) {
      const imageLink = document.createElement('a');
      imageLink.className = 'h-threads-img-a xdex-history-image';
      imageLink.href = buildThreadHistoryImageUrl(item.imageFile, true);
      imageLink.dataset.historyQuoteId = item.threadId || '';
      imageLink.target = '_blank';
      imageLink.rel = 'noopener';
      const img = document.createElement('img');
      img.className = 'h-threads-img';
      img.src = buildThreadHistoryImageUrl(item.imageFile, false);
      img.alt = item.imageFile;
      imageLink.appendChild(img);
      main.appendChild(imageLink);
    }

    if (item.sageHtml) {
      const sageDiv = document.createElement('div');
      sageDiv.className = 'h-threads-tips uk-text-danger uk-text-bold';
      sageDiv.innerHTML = item.sageHtml;
      main.appendChild(sageDiv);
    }
        const content = document.createElement('div');
    content.className = 'h-threads-content';
    if (item.contentHtml) content.innerHTML = item.contentHtml;
    else content.textContent = item.contentText || item.excerpt || '';
    if (item.contentTruncated) {
      limitThreadHistoryContentText(content, THREAD_HISTORY_EXCERPT_LIMIT);
      appendThreadHistoryTruncationMarker(content);
    }
    main.appendChild(content);
    enhanceHistoryRenderedContent(content);

    const footer = document.createElement('div');
    footer.className = 'xdex-history-footer';
    appendThreadHistoryText(footer, 'span', 'xdex-history-time', formatThreadHistoryTime(item.lastVisitedAt));
    appendThreadHistoryText(footer, 'span', 'xdex-history-visit-count', `共访问 ${item.visitCount || 1} 次`);
    appendThreadHistoryText(footer, 'span', 'xdex-history-page', `串内最远：P${item.maxVisitedPage || item.page || 1}`);
    appendThreadHistoryText(footer, 'span', 'xdex-history-current-page', `最近查看：P${item.page || 1}`);
    if (item.mode === 'po') appendThreadHistoryText(footer, 'span', 'xdex-history-po-label', 'Po');
    main.appendChild(footer);
    enhanceHistoryRenderedContent(footer);
    markAllCookies(getFilterConfig().markedGroups || [], wrapper);
    return wrapper;
  }

  const HISTORY_RENDER_INITIAL_COUNT = 50;
  const HISTORY_RENDER_BATCH_SIZE = 20;
  const HISTORY_RENDER_BATCH_THRESHOLD = 400;
  const historyRenderQueues = new Map();

  function findHistoryScrollContainer(element) {
    let el = element;
    while (el && el !== document.body && el !== document.documentElement) {
      const style = window.getComputedStyle(el);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto' || style.overflow === 'scroll') {
        return el;
      }
      el = el.parentElement;
    }
    return element;
  }

  function batchRenderHistoryItems(root, results, buildFn, queueId) {
    const prev = historyRenderQueues.get(queueId);
    if (prev) {
      prev.cancelled = true;
      if (prev.scrollHandler && prev.scrollContainer) {
        prev.scrollContainer.removeEventListener('scroll', prev.scrollHandler, { passive: true });
      }
    }
    if (!root) return;

    const total = results.length;
    if (total <= 0) return;

    let cursor = 0;
    const state = { cancelled: false };
    const scrollContainer = findHistoryScrollContainer(root);
    historyRenderQueues.set(queueId, state);

    function appendBatch(count) {
      if (state.cancelled) return;
      const slice = results.slice(cursor, cursor + count);
      const fragment = document.createDocumentFragment();
      slice.forEach(r => fragment.appendChild(buildFn(r)));
      root.appendChild(fragment);
      cursor += slice.length;
    }

    function maybeLoadMore() {
      if (state.cancelled || cursor >= total) return;
      const nearBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - HISTORY_RENDER_BATCH_THRESHOLD;
      if (nearBottom) {
        appendBatch(HISTORY_RENDER_BATCH_SIZE);
        requestAnimationFrame(() => {
          if (!state.cancelled) maybeLoadMore();
        });
      }
    }

    const scrollHandler = () => {
      if (state.cancelled) return;
      if (cursor >= total) return;
      requestAnimationFrame(() => {
        if (state.cancelled) return;
        maybeLoadMore();
      });
    };

    state.scrollHandler = scrollHandler;
    state.scrollContainer = scrollContainer;
    scrollContainer.addEventListener('scroll', scrollHandler, { passive: true });

    appendBatch(HISTORY_RENDER_INITIAL_COUNT);

    if (cursor < total) {
      requestAnimationFrame(() => {
        if (state.cancelled) return;
        maybeLoadMore();
      });
    }
  }

  function renderThreadHistoryModule(query) {
    const root = document.getElementById('sp_history_results');
    if (!root) {
      logThreadHistory('render skipped: missing #sp_history_results');
      return;
    }
    const input = document.getElementById('sp_history_search');
    const sortSelect = document.getElementById('sp_history_sort');
    const effectiveQuery = query == null && input ? input.value : query;
    const sortMode = sortSelect ? sortSelect.value : 'last-desc';
    const results = searchThreadHistory(effectiveQuery || '', null, sortMode);
    updateThreadHistoryDebugState({ lastRender: { query: effectiveQuery || '', sortMode, count: results.length, at: new Date().toISOString() } });
    logThreadHistory('render module', { query: effectiveQuery || '', sortMode, count: results.length });
    const count = document.getElementById('sp_history_count');
    if (count) {
      count.textContent = `${results.length} 条 `;
      count.appendChild(buildHistorySearchHelpMark(THREAD_HISTORY_SEARCH_HELP_TEXT));
    }
    root.textContent = '';
    if (!results.length) {
      const empty = document.createElement('div');
      empty.className = 'xdex-history-empty';
      empty.textContent = effectiveQuery ? '没有匹配的浏览历史' : '暂无浏览历史';
      root.appendChild(empty);
      return;
    }
    batchRenderHistoryItems(root, results, buildThreadHistoryItemElement, 'threadHistory');
    const reportThreadHistoryRenderDom = () => {
      const cover = document.getElementById('sp_cover');
      const panel = document.getElementById('sp_panel');
      const views = document.getElementById('sp_panel_views');
      const module = document.getElementById('sp_module_history');
      const panelContent = document.querySelector('#sp_module_history .sp_panel_content');
      const historyContent = document.getElementById('sp_history_content');
      const firstItem = root.querySelector('.xdex-history-item');
      updateThreadHistoryDebugState({
        lastRenderDom: {
          activeModule: module?.classList.contains('active') || false,
          contentDisplay: getComputedStyle(historyContent || root).display,
          resultsDisplay: getComputedStyle(root).display,
          coverDisplay: getComputedStyle(cover || document.body).display,
          panelDisplay: getComputedStyle(panel || document.body).display,
          viewsDisplay: getComputedStyle(views || document.body).display,
          moduleDisplay: getComputedStyle(module || document.body).display,
          panelContentDisplay: getComputedStyle(panelContent || document.body).display,
          childCount: root.children.length,
          itemCount: root.querySelectorAll('.xdex-history-item').length,
          coverHeight: cover?.offsetHeight || 0,
          panelHeight: panel?.offsetHeight || 0,
          viewsHeight: views?.offsetHeight || 0,
          moduleHeight: module?.offsetHeight || 0,
          panelContentHeight: panelContent?.offsetHeight || 0,
          historyContentHeight: historyContent?.offsetHeight || 0,
          offsetHeight: root.offsetHeight,
          scrollHeight: root.scrollHeight,
          firstItemHeight: firstItem?.offsetHeight || 0,
          firstItemText: firstItem?.textContent?.slice(0, 80) || '',
          at: new Date().toISOString()
        }
      });
      logThreadHistory('render dom', threadHistoryDebugState.lastRenderDom);
      logThreadHistoryFlat('render dom flat', threadHistoryDebugState.lastRenderDom);
    };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(reportThreadHistoryRenderDom);
    else setTimeout(reportThreadHistoryRenderDom, 0);
  }

  function renderThreadHistoryModuleSoon(query) {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => renderThreadHistoryModule(query));
      return;
    }
    setTimeout(() => renderThreadHistoryModule(query), 0);
  }

  function openHistoryImageQuotePreview(tid) {
    const quoteId = String(tid || '').trim();
    if (!/^\d+$/.test(quoteId) || quoteId === '9999999') return false;
    try {
      if (typeof window.__xdexOpenQuoteByTid !== 'function' && typeof enableQuotePreview === 'function') {
        enableQuotePreview();
      }
      if (typeof window.__xdexOpenQuoteByTid !== 'function') return false;
      const ret = window.__xdexOpenQuoteByTid(quoteId, { fromPOImage: true });
      if (ret && typeof ret.then === 'function') ret.catch(() => {});
      return true;
    } catch (e) {
      return false;
    }
  }

  function enhanceHistoryRenderedContent(root) {
    if (!root) return;
    try { renderHiddenTextContent(root); } catch (e) {}
    try { if (typeof extendQuote === 'function') extendQuote(root); } catch (e) {}
    try { if (typeof initExtendedContent === 'function') initExtendedContent(root); } catch (e) {}
    try {
      const cfg = Object.assign({}, SettingPanel.defaults, GM_getValue(SettingPanel.key, {}));
      if (cfg && cfg.enableImageHideMode) applyImageHideMode(cfg.applyImageHideMode || 'default', root);
      if (cfg && cfg.enableAutoUrlLinkify && typeof runAutoUrlLinkify === 'function') runAutoUrlLinkify(root);
    } catch (e) {}
  }

  function bindThreadHistoryModuleEvents() {
    $('#sp_history_search').off('input.xdex-history').on('input.xdex-history', function () {
      renderThreadHistoryModule(this.value || '');
    });
    $('#sp_history_sort').off('change.xdex-history').on('change.xdex-history', function () {
      renderThreadHistoryModule();
    });
    $('#sp_history_results').off('click.xdex-history-reply', '.xdex-history-reply-action').on('click.xdex-history-reply', '.xdex-history-reply-action', function (e) {
      if (e.button !== 0) return;
      const url = this.href || '';
      if (!url) return;
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        window.location.href = url;
        return;
      }
      window.open(url, '_blank', 'noopener');
    });
    $('#sp_history_results').off('click.xdex-history-image-quote', '.xdex-history-image').on('click.xdex-history-image-quote', '.xdex-history-image', function (e) {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      const opened = openHistoryImageQuotePreview(this.dataset.historyQuoteId || '');
      if (!opened) return;
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    });
    $('#sp_history_results').off('click.xdex-history-delete', '.xdex-history-delete').on('click.xdex-history-delete', '.xdex-history-delete', function (e) {
      e.preventDefault();
      const key = this.dataset.historyKey || '';
      if (!key) return;
      deleteThreadHistoryItem(key);
      renderThreadHistoryModule();
      toast('已删除浏览历史');
    });
    $('#sp_history_clear').off('click.xdex-history').on('click.xdex-history', function (e) {
      e.preventDefault();
      if (!window.confirm('确定要清空全部浏览历史吗？')) return;
      clearThreadHistory();
      renderThreadHistoryModule();
      toast('已清空浏览历史');
    });
  }

  function buildPostHistoryItemElement(result) {
    const item = result.item || {};
    const wrapper = document.createElement('div');
    wrapper.className = 'xdex-history-item xdex-post-history-item';
    wrapper.dataset.postHistoryKey = result.key;

    const main = document.createElement('div');
    main.className = 'h-threads-item-main';
    wrapper.appendChild(main);

    const info = document.createElement('div');
    info.className = 'h-threads-info xdex-history-info xdex-post-history-info';
    main.appendChild(info);

    const infoMain = document.createElement('span');
    infoMain.className = 'xdex-history-info-main';
    info.appendChild(infoMain);

    if (shouldRenderThreadHistoryTitle(item.title)) appendThreadHistoryInfoText(infoMain, 'h-threads-info-title', item.title);
    if (shouldRenderThreadHistoryAuthor(item.name)) appendThreadHistoryInfoText(infoMain, 'h-threads-info-email', item.name);
    if (item.email) appendThreadHistoryInfoText(infoMain, 'h-threads-info-email', item.email);
    const submittedAtText = formatRelativeTimeMachineTime(item.submittedAt);
    const createdAtNode = appendThreadHistoryInfoText(infoMain, 'h-threads-info-createdat', submittedAtText);
    if (createdAtNode) {
      createdAtNode.dataset.xdexOriginalTime = submittedAtText;
      createdAtNode.title = submittedAtText;
    }
    if (item.userHash) appendThreadHistoryInfoText(infoMain, 'h-threads-info-uid', `ID:${item.userHash}`);

    const displayPostId = item.postId || item.id || (item.type === 'reply' ? '' : item.threadId);
    const postUrl = buildPostHistoryUrl(item.type, displayPostId, item.resto || item.threadId);
    const postReplyActionUrl = buildPostHistoryReplyActionUrl(item.type, displayPostId, item.resto || item.threadId, item.page);
    if (postUrl) {
      const postLink = document.createElement('a');
      postLink.className = 'h-threads-info-id xdex-post-history-thread-id';
      postLink.href = postUrl;
      postLink.textContent = `No.${displayPostId}`;
      infoMain.appendChild(postLink);

      const replyAction = document.createElement('span');
      replyAction.className = 'h-threads-info-reply-btn xdex-post-history-reply-label';
      const replyActionLink = document.createElement('a');
      replyActionLink.className = 'xdex-post-history-reply-action';
      replyActionLink.href = postReplyActionUrl;
      replyActionLink.target = '_blank';
      replyActionLink.rel = 'noopener';
      replyActionLink.textContent = '回应';
      replyAction.appendChild(document.createTextNode('['));
      replyAction.appendChild(replyActionLink);
      replyAction.appendChild(document.createTextNode(']'));
      infoMain.appendChild(replyAction);
    } else {
      appendThreadHistoryInfoText(infoMain, 'h-threads-info-id xdex-post-history-thread-id', '未确认');
    }

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'xdex-post-history-delete';
    deleteButton.dataset.postHistoryKey = result.key;
    deleteButton.title = '删除';
    deleteButton.textContent = '×';
    main.appendChild(deleteButton);

    if (item.imageFile) {
      const imageLink = document.createElement('a');
      imageLink.className = 'h-threads-img-a xdex-post-history-image';
      imageLink.href = buildThreadHistoryImageUrl(item.imageFile, true);
      imageLink.dataset.postHistoryQuoteId = displayPostId || item.threadId || '';
      imageLink.target = '_blank';
      imageLink.rel = 'noopener';
      const image = document.createElement('img');
      image.className = 'h-threads-img';
      image.src = buildThreadHistoryImageUrl(item.imageFile, false);
      image.alt = item.imageFile;
      imageLink.appendChild(image);
      main.appendChild(imageLink);
    }

    const content = document.createElement('div');
    content.className = 'h-threads-content';
    if (item.contentHtml) content.innerHTML = item.contentHtml;
    else content.textContent = item.contentText || item.contentRaw || '';
    main.appendChild(content);
    enhanceHistoryRenderedContent(content);

    const footer = document.createElement('div');
    footer.className = 'xdex-history-footer xdex-post-history-footer';
    if (item.status !== 'confirmed') appendThreadHistoryText(footer, 'span', 'xdex-post-history-status', item.status === 'pending' ? '确认中' : item.status === 'failed' ? '失败' : '未确认');
    const forumName = item.forumName || getPostHistoryForumNameByFid(item.fid);
    if (forumName) appendThreadHistoryText(footer, 'span', 'xdex-post-history-forum', `${forumName}`);
    appendThreadHistoryText(footer, 'span', 'xdex-post-history-type', item.type === 'reply' ? '回复' : '主题');
    if (item.threadId) appendThreadHistoryText(footer, 'span', 'xdex-post-history-thread', `串号：${item.threadId}`);
    // 优先从浏览历史获取最近浏览页（仅 thread 类型），否则回退到记录中的 page
    // const displayPage = item.page;
    let displayPage = item.page;
    if (item.type === 'thread' && item.threadId) {
      const historyUrl = getLatestThreadHistoryUrl(item.threadId);
      if (historyUrl) {
        const parsed = parseThreadHistoryUrl(historyUrl);
        if (parsed && parsed.page) displayPage = parsed.page;
      }
    }
    if (displayPage) appendThreadHistoryText(footer, 'span', 'xdex-post-history-page', `所在页：P${displayPage}`);
    main.appendChild(footer);
    enhanceHistoryRenderedContent(footer);
    markAllCookies(getFilterConfig().markedGroups || [], wrapper);
    return wrapper;
  }

  function renderPostHistoryModule(query) {
    const root = document.getElementById('sp_posts_results');
    if (!root) return;
    postHistoryLiveRenderDirty = false;
    const input = document.getElementById('sp_posts_search');
    const effectiveQuery = query == null && input ? input.value : query;
    const results = searchPostHistory(effectiveQuery || '', postHistoryActiveType);
    const count = document.getElementById('sp_posts_count');
    if (count) {
      count.textContent = `${results.length} 条 `;
      count.appendChild(buildHistorySearchHelpMark(POST_HISTORY_SEARCH_HELP_TEXT));
    }
    root.textContent = '';
    if (!results.length) {
      const empty = document.createElement('div');
      empty.className = 'xdex-history-empty xdex-post-history-empty';
      empty.textContent = effectiveQuery ? '没有匹配的我的发言' : (postHistoryActiveType === 'reply' ? '暂无我的回复' : '暂无我的主题');
      root.appendChild(empty);
      return;
    }
    batchRenderHistoryItems(root, results, buildPostHistoryItemElement, 'postHistory');
  }

  function renderPostHistoryModuleSoon(query) {
    postHistoryLiveRenderDirty = false;
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => renderPostHistoryModule(query));
      return;
    }
    setTimeout(() => renderPostHistoryModule(query), 0);
  }

  // ─── 订阅 Feed 渲染 ──────────────────────────────────────────────────────
  const SUBSCRIPTION_FEED_API_BASE = 'https://api.nmb.best/api';
  const SUBSCRIPTION_FEED_SESSION_STORE_KEY = 'xdex_subscription_feed_sessions_v3';
  const SUBSCRIPTION_FEED_SESSION_VERSION = 3;
  const SUBSCRIPTION_FEED_SESSION_TTL_MS = 2 * 60 * 1000;
  const SUBSCRIPTION_FEED_SESSION_MAX_COUNT = 5;
  let subscriptionFeedCurrentPage = 1;
  let subscriptionFeedCurrentUuid = '';
  let subscriptionFeedLoading = false;
  let subscriptionFeedAllItems = [];
  let subscriptionFeedHasMore = true;
  let subscriptionFeedRequestSeq = 0;
  const subscriptionFeedInflightPages = Object.create(null);
  let subscriptionFeedRenderedPages = Object.create(null);
  let subscriptionFeedHighestRenderedPage = 0;
  let subscriptionFeedCurrentDisplayPage = 1;
  let subscriptionFeedCacheExpired = false;

  const ACTIVE_FEED_STORAGE_KEY = 'xdex_active_subscription_feed_uuid';

  function getActiveSubscriptionFeedUuid() {
    try { return GM_getValue(ACTIVE_FEED_STORAGE_KEY, ''); } catch (e) { return ''; }
  }

  function setActiveSubscriptionFeedUuid(uuid) {
    try { GM_setValue(ACTIVE_FEED_STORAGE_KEY, uuid || ''); } catch (e) {}
  }

  function createDefaultSubscriptionFeedSessionStore() {
    return {
      version: SUBSCRIPTION_FEED_SESSION_VERSION,
      sessions: {}
    };
  }

  function normalizeSubscriptionFeedSessionStore(rawStore) {
    const store = Object.assign(createDefaultSubscriptionFeedSessionStore(), rawStore || {});
    store.version = SUBSCRIPTION_FEED_SESSION_VERSION;
    store.sessions = store.sessions && typeof store.sessions === 'object' ? store.sessions : {};
    return store;
  }

  function getSubscriptionFeedSessionStore() {
    try {
      return normalizeSubscriptionFeedSessionStore(GM_getValue(SUBSCRIPTION_FEED_SESSION_STORE_KEY, null));
    } catch (e) {
      return createDefaultSubscriptionFeedSessionStore();
    }
  }

  function setSubscriptionFeedSessionStore(store) {
    const normalized = normalizeSubscriptionFeedSessionStore(store);
    GM_setValue(SUBSCRIPTION_FEED_SESSION_STORE_KEY, normalized);
    return normalized;
  }

  function getSubscriptionFeedItemId(item) {
    return String(Number(item && item.id) || 0);
  }

  function normalizeSubscriptionFeedPageItems(items) {
    const list = Array.isArray(items) ? items : [];
    const seen = new Set();
    return list.filter((item) => {
      const id = getSubscriptionFeedItemId(item);
      if (!id || id === '0' || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }

  function buildSubscriptionFeedPageEntry(page, items) {
    const normalizedPage = Math.max(1, Number(page) || 1);
    const normalizedItems = normalizeSubscriptionFeedPageItems(items);
    return {
      page: normalizedPage,
      fetchedAt: Date.now(),
      itemIds: normalizedItems.map(getSubscriptionFeedItemId),
      items: normalizedItems
    };
  }

  function computeHighestContiguousSubscriptionFeedPage(pages) {
    let page = 1;
    while (pages && pages[String(page)] && Number(pages[String(page)].page) === page) page++;
    return page - 1;
  }

  function normalizeSubscriptionFeedSession(session) {
    if (!session || typeof session !== 'object') return null;
    const uuid = String(session.uuid || '').trim();
    if (!uuid) return null;
    const cachedPages = session.cachedPages && typeof session.cachedPages === 'object' ? session.cachedPages : {};
    const normalizedPages = {};
    Object.keys(cachedPages).forEach((key) => {
      const entry = cachedPages[key] || {};
      const page = Math.max(1, Number(entry.page || key) || 1);
      const normalizedItems = normalizeSubscriptionFeedPageItems(entry.items);
      normalizedPages[String(page)] = {
        page,
        fetchedAt: Number(entry.fetchedAt) || 0,
        itemIds: normalizedItems.map(getSubscriptionFeedItemId),
        items: normalizedItems
      };
    });
    const highestCachedPage = computeHighestContiguousSubscriptionFeedPage(normalizedPages);
    const createdAt = Number(session.createdAt) || 0;
    const expiresAt = Number(session.expiresAt) || 0;
    const lastAccessAt = Number(session.lastAccessAt) || createdAt || Date.now();
    return {
      version: SUBSCRIPTION_FEED_SESSION_VERSION,
      uuid,
      createdAt,
      expiresAt,
      lastAccessAt,
      highestCachedPage,
      cachedPages: normalizedPages
    };
  }

  function isSubscriptionFeedSessionExpired(session) {
    return !session || !session.expiresAt || Date.now() > Number(session.expiresAt);
  }

  function isSubscriptionFeedSessionStructurallyValid(session) {
    const normalized = normalizeSubscriptionFeedSession(session);
    if (!normalized) return false;
    if (!normalized.createdAt || !normalized.expiresAt) return false;
    for (let page = 1; page <= normalized.highestCachedPage; page++) {
      const entry = normalized.cachedPages[String(page)];
      if (!entry || Number(entry.page) !== page || !Array.isArray(entry.items)) return false;
    }
    return true;
  }

  function getSubscriptionFeedSession(uuid) {
    const key = String(uuid || '').trim();
    if (!key) return null;
    const store = getSubscriptionFeedSessionStore();
    return normalizeSubscriptionFeedSession(store.sessions[key]);
  }

  function saveSubscriptionFeedSession(session) {
    const normalized = normalizeSubscriptionFeedSession(session);
    if (!normalized) return null;
    const store = getSubscriptionFeedSessionStore();
    store.sessions[normalized.uuid] = normalized;
    const ordered = Object.values(store.sessions)
      .map(normalizeSubscriptionFeedSession)
      .filter(Boolean)
      .sort((a, b) => (Number(b.lastAccessAt) || 0) - (Number(a.lastAccessAt) || 0));
    const limited = ordered.slice(0, SUBSCRIPTION_FEED_SESSION_MAX_COUNT);
    store.sessions = {};
    limited.forEach((item) => {
      store.sessions[item.uuid] = item;
    });
    setSubscriptionFeedSessionStore(store);
    return normalized;
  }

  function deleteSubscriptionFeedSession(uuid) {
    const key = String(uuid || '').trim();
    if (!key) return;
    const store = getSubscriptionFeedSessionStore();
    if (!store.sessions[key]) return;
    delete store.sessions[key];
    setSubscriptionFeedSessionStore(store);
  }

  function pruneExpiredSubscriptionFeedSessions() {
    const store = getSubscriptionFeedSessionStore();
    let changed = false;
    Object.keys(store.sessions).forEach((uuid) => {
      const session = normalizeSubscriptionFeedSession(store.sessions[uuid]);
      if (!session || isSubscriptionFeedSessionExpired(session) || !isSubscriptionFeedSessionStructurallyValid(session)) {
        delete store.sessions[uuid];
        changed = true;
        return;
      }
      store.sessions[uuid] = session;
    });
    if (changed) setSubscriptionFeedSessionStore(store);
  }

  function createSubscriptionFeedSession(uuid, firstPageEntry) {
    const now = Date.now();
    const normalizedUuid = String(uuid || '').trim();
    const cachedPages = {};
    let highestCachedPage = 0;
    if (firstPageEntry && Array.isArray(firstPageEntry.items) && firstPageEntry.items.length) {
      cachedPages[String(firstPageEntry.page)] = firstPageEntry;
      highestCachedPage = firstPageEntry.page === 1 ? 1 : 0;
    }
    return {
      version: SUBSCRIPTION_FEED_SESSION_VERSION,
      uuid: normalizedUuid,
      createdAt: now,
      expiresAt: now + SUBSCRIPTION_FEED_SESSION_TTL_MS,
      lastAccessAt: now,
      highestCachedPage,
      cachedPages
    };
  }

  function flattenSubscriptionFeedSessionItems(session) {
    const normalized = normalizeSubscriptionFeedSession(session);
    if (!normalized || normalized.highestCachedPage <= 0) return [];
    const items = [];
    for (let page = 1; page <= normalized.highestCachedPage; page++) {
      const entry = normalized.cachedPages[String(page)];
      if (!entry || !Array.isArray(entry.items)) break;
      items.push(...entry.items);
    }
    return items;
  }

  function resetSubscriptionFeedRuntimeState(uuid) {
    subscriptionFeedCurrentUuid = String(uuid || '').trim();
    subscriptionFeedCurrentPage = 0;
    subscriptionFeedAllItems = [];
    subscriptionFeedHasMore = true;
    subscriptionFeedRenderedPages = Object.create(null);
    subscriptionFeedHighestRenderedPage = 0;
    subscriptionFeedCurrentDisplayPage = 1;
    subscriptionFeedCacheExpired = false;
  }

  function rebuildSubscriptionFeedRuntimeList() {
    const items = [];
    for (let page = 1; page <= subscriptionFeedHighestRenderedPage; page++) {
      const entry = subscriptionFeedRenderedPages[String(page)];
      if (!entry || !Array.isArray(entry.items)) break;
      items.push(...entry.items);
    }
    subscriptionFeedAllItems = items;
    subscriptionFeedCurrentPage = subscriptionFeedHighestRenderedPage;
  }

  function applySubscriptionFeedSessionToRuntime(session) {
    const normalized = normalizeSubscriptionFeedSession(session);
    if (!normalized) return false;
    subscriptionFeedCurrentUuid = normalized.uuid;
    subscriptionFeedRenderedPages = Object.create(null);
    for (let page = 1; page <= normalized.highestCachedPage; page++) {
      const entry = normalized.cachedPages[String(page)];
      if (!entry) break;
      subscriptionFeedRenderedPages[String(page)] = entry;
    }
    subscriptionFeedHighestRenderedPage = normalized.highestCachedPage;
    subscriptionFeedCurrentDisplayPage = normalized.highestCachedPage > 0 ? 1 : 0;
    rebuildSubscriptionFeedRuntimeList();
    subscriptionFeedHasMore = true;
    subscriptionFeedCacheExpired = false;
    return true;
  }

  function appendSubscriptionFeedRenderedPage(pageEntry) {
    if (!pageEntry || !pageEntry.page || !Array.isArray(pageEntry.items)) return false;
    const page = Math.max(1, Number(pageEntry.page) || 1);
    if (page !== subscriptionFeedHighestRenderedPage + 1) return false;
    subscriptionFeedRenderedPages[String(page)] = pageEntry;
    subscriptionFeedHighestRenderedPage = page;
    subscriptionFeedCurrentDisplayPage = page;
    rebuildSubscriptionFeedRuntimeList();
    return true;
  }

  function getSubscriptionFeedNextRenderPage() {

    return Math.max(0, Number(subscriptionFeedHighestRenderedPage) || 0) + 1;

  }


  function appendSubscriptionFeedPageSeparator(root, page) {
    if (!root || !page || page <= 1) return;
    const sep = document.createElement('div');
    sep.className = 'xdex-feed-page-separator';
    sep.style.cssText = 'text-align:center;color:#999;font-size:12px;padding:8px 0;border-top:1px dashed #ddd;margin-top:8px;';
    sep.textContent = `——第${page}页——`;
    root.appendChild(sep);
  }

  function updateSubscriptionFeedDisplayPageFromScroll() {

    const container = document.querySelector('#sp_module_feeds .sp_panel_content');

    const results = document.getElementById('sp_feeds_results');

    if (!container || !results || subscriptionFeedHighestRenderedPage <= 0) return;

    const separators = Array.from(results.querySelectorAll('.xdex-feed-page-separator'));

    let displayPage = 1;

    const threshold = container.scrollTop + 4;

    separators.forEach((sep) => {

      const page = Number((sep.textContent || '').match(/第(\d+)页/)?.[1] || 0);

      if (!page) return;

      const top = sep.offsetTop;

      if (threshold >= top) displayPage = page;

    });

    subscriptionFeedCurrentDisplayPage = Math.min(Math.max(1, displayPage), Math.max(1, subscriptionFeedHighestRenderedPage));

    $('#sp_feeds_page_label').text(`第${subscriptionFeedCurrentDisplayPage}页`);

  }



  function renderSubscriptionFeedRenderedPages(options = {}) {

    const $results = $('#sp_feeds_results').empty();

    const displayPage = Math.max(0, Number(options.displayPage) || 0) || subscriptionFeedCurrentDisplayPage || subscriptionFeedHighestRenderedPage || 0;

    if (subscriptionFeedHighestRenderedPage <= 0) {

      $results.html('<div style="text-align:center;color:#999;padding:40px 0;">暂无订阅内容</div>');

      $('#sp_feeds_page_label').text('第0页');

      return;

    }

    for (let page = 1; page <= subscriptionFeedHighestRenderedPage; page++) {

      const entry = subscriptionFeedRenderedPages[String(page)];

      if (!entry || !Array.isArray(entry.items)) break;

      appendSubscriptionFeedPageSeparator($results[0], page);

      entry.items.forEach((item) => {

        $results[0].appendChild(buildSubscriptionFeedItemElement(item));

      });

    }

    subscriptionFeedCurrentDisplayPage = Math.min(Math.max(1, displayPage), Math.max(1, subscriptionFeedHighestRenderedPage));

    $('#sp_feeds_page_label').text(`第${subscriptionFeedCurrentDisplayPage}页`);

    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(updateSubscriptionFeedDisplayPageFromScroll);

    else setTimeout(updateSubscriptionFeedDisplayPageFromScroll, 0);

  }


  function restoreSubscriptionFeedSession(uuid) {
    const session = getSubscriptionFeedSession(uuid);
    if (!session || isSubscriptionFeedSessionExpired(session) || !isSubscriptionFeedSessionStructurallyValid(session)) {
      if (session) deleteSubscriptionFeedSession(uuid);
      return false;
    }
    const restored = Object.assign({}, session, { lastAccessAt: Date.now() });
    saveSubscriptionFeedSession(restored);
    applySubscriptionFeedSessionToRuntime(restored);
    renderSubscriptionFeedRenderedPages({ displayPage: 1 });
    return true;
  }

  function invalidateSubscriptionFeedSession(uuid, reason) {
    const key = String(uuid || '').trim();
    if (!key) return;
    console.info('[subscription-feed] invalidate session', { uuid: key, reason: reason || '' });
    deleteSubscriptionFeedSession(key);
  }

  function populateSubscriptionFeedSelector() {
    const $sel = $('#sp_feeds_selector').empty();
    const $display = $('#sp_feeds_selector_display');
    const $dropdown = $('#sp_feeds_selector_dropdown').empty().hide();
    const $desc = $display.find('.xdex-feed-display-desc');
    const $uuid = $display.find('.xdex-feed-display-uuid');
    const feeds = (typeof getFilterConfig === 'function' ? getFilterConfig() : {}).subscriptionFeeds || [];
    if (!feeds.length) {
      $sel.append('<option value="">(请先添加订阅号)</option>');
      $desc.text('请先在设置中添加订阅号');
      $uuid.text('');
      return '';
    }
    feeds.forEach((f, i) => {
      const label = f.desc ? `${f.desc}：${f.uuid}` : f.uuid;
      $sel.append(`<option value="${Utils.escapeHTML ? Utils.escapeHTML(f.uuid) : f.uuid}">${Utils.escapeHTML ? Utils.escapeHTML(label) : label}</option>`);
      const $opt = $('<div class="xdex-feed-option" role="option"></div>')
        .attr('data-uuid', f.uuid)
        .text(label);
      $dropdown.append($opt);
    });
    const saved = getActiveSubscriptionFeedUuid();
    const match = feeds.find(f => f.uuid === saved);
    const selected = match ? match.uuid : feeds[0].uuid;
    $sel.val(selected);
    const activeFeed = feeds.find(f => f.uuid === selected);
    $desc.text(activeFeed && activeFeed.desc ? activeFeed.desc : '');
    $uuid.text(activeFeed && activeFeed.desc ? activeFeed.uuid : '');
    $dropdown.find('.xdex-feed-option').removeClass('active').filter(`[data-uuid="${selected}"]`).addClass('active');
    return selected;
  }

  function buildSubscriptionFeedItemElement(item) {
    const threadId = Number(item.id) || 0;
    const wrapper = document.createElement('div');
    wrapper.className = 'xdex-history-item';
    wrapper.dataset.feedThreadId = String(threadId);
    const main = document.createElement('div');
    main.className = 'h-threads-item-main';
    wrapper.appendChild(main);
    const info = document.createElement('div');
    info.className = 'h-threads-info xdex-history-info';
    main.appendChild(info);
    const infoMain = document.createElement('span');
    infoMain.className = 'xdex-history-info-main';
    info.appendChild(infoMain);
    const title = String(item.title || '');
    const email = String(item.email || '');
    const now = String(item.now || '');
    const userHash = String(item.user_hash || '');
    if (title && title !== '无标题') appendThreadHistoryInfoText(infoMain, 'h-threads-info-title', title);
    if (email) appendThreadHistoryInfoText(infoMain, 'h-threads-info-email', email);
    const createdAtNode = appendThreadHistoryInfoText(infoMain, 'h-threads-info-createdat', now);
    if (createdAtNode) {
      createdAtNode.dataset.xdexOriginalTime = now;
      createdAtNode.title = now;
    }
    if (userHash) {
      const cookieSpan = appendThreadHistoryText(infoMain, 'span', 'h-threads-info-uid', `ID:${userHash}`);
      if (cookieSpan) cookieSpan.setAttribute('data-xdex-cookie-id', userHash);
    }
    const replyLink = document.createElement('a');
    replyLink.className = 'h-threads-info-id xdex-history-thread-id';
    replyLink.href = `${location.origin}/t/${threadId}`;
    replyLink.textContent = `No.${threadId}`;
    infoMain.appendChild(replyLink);
    const replyCount = Number(item.reply_count) || 0;
    if (replyCount > 0) {
      appendThreadHistoryText(infoMain, 'span', 'xdex-history-visit-count', `${replyCount} 回`);
    }

    // 从浏览历史查找最近查看页
    const tid = String(threadId || '').trim();
    const histStore = getThreadHistoryStore();
    const histCandidates = ['normal', 'po']
      .map((mode) => histStore.items[getThreadHistoryKey(mode, tid)])
      .filter(Boolean)
      .sort((a, b) => (Number(b.lastVisitedAt) || 0) - (Number(a.lastVisitedAt) || 0));
    const histItem = histCandidates[0] || null;
    const histPage = histItem ? (Number(histItem.page) || 1) : 1;

    // [回应] 链接
    const replyAction = document.createElement('span');
    replyAction.className = 'h-threads-info-reply-btn xdex-history-reply-label';
    const replyActionLink = document.createElement('a');
    replyActionLink.className = 'xdex-history-reply-action';
    replyActionLink.href = `${location.origin}/t/${tid}?page=${histPage}`;
    replyActionLink.target = '_blank';
    replyActionLink.rel = 'noopener';
    replyActionLink.textContent = '回应';
    replyAction.appendChild(document.createTextNode('['));
    replyAction.appendChild(replyActionLink);
    replyAction.appendChild(document.createTextNode(']'));
    infoMain.appendChild(replyAction);

    // 取消订阅按钮
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'xdex-post-history-delete';
    deleteButton.dataset.feedThreadId = String(threadId);
    deleteButton.title = '取消订阅';
    deleteButton.textContent = '×';
    main.appendChild(deleteButton);

    // 图片
    const imgRaw = String(item.img || '');
    const extRaw = String(item.ext || '');
    if (imgRaw) {
      const suffix = extRaw ? (extRaw[0] === '.' ? extRaw : `.${extRaw}`) : '';
      const imageFile = suffix && imgRaw.toLowerCase().endsWith(suffix.toLowerCase()) ? imgRaw : imgRaw + suffix;
      const imageLink = document.createElement('a');
      imageLink.className = 'h-threads-img-a xdex-history-image';
      imageLink.dataset.historyQuoteId = threadId;
      imageLink.href = buildThreadHistoryImageUrl(imageFile, true);
      imageLink.target = '_blank';
      imageLink.rel = 'noopener';
      const img = document.createElement('img');
      img.className = 'h-threads-img';
      img.src = buildThreadHistoryImageUrl(imageFile, false);
      img.alt = imageFile;
      imageLink.appendChild(img);
      main.appendChild(imageLink);
    }

    // 正文
    const content = document.createElement('div');
    content.className = 'h-threads-content';
    const contentHtml = String(item.content || '');
    if (contentHtml) content.innerHTML = contentHtml;
    else content.textContent = '';
    main.appendChild(content);
    enhanceHistoryRenderedContent(content);

    // 脚注
    const footer = document.createElement('div');
    footer.className = 'xdex-history-footer';
    const fid = String(item.fid || '');
    const forumName = fid ? (POST_HISTORY_FORUM_FID_MAP[fid] || '') : '';
    if (forumName) appendThreadHistoryText(footer, 'span', 'xdex-post-history-forum', forumName);
    appendThreadHistoryText(footer, 'span', 'xdex-post-history-type', '订阅');
    appendThreadHistoryText(footer, 'span', 'xdex-history-time', now);
    main.appendChild(footer);
    enhanceHistoryRenderedContent(footer);
    markAllCookies(getFilterConfig().markedGroups || [], wrapper);
    return wrapper;
  }

  async function fetchSubscriptionFeedPage(uuid, page) {
    const url = `${SUBSCRIPTION_FEED_API_BASE}/feed?uuid=${encodeURIComponent(uuid)}&page=${encodeURIComponent(page)}`;
    const resp = await gmRequest(url, 'json');
    const data = resp.response || resp.responseText;
    if (Array.isArray(data)) return data;
    try { return JSON.parse(typeof data === 'string' ? data : '[]'); } catch (e) { return []; }
  }

  function renderSubscriptionFeedModule() {
    const $results = $('#sp_feeds_results').empty();
    pruneExpiredSubscriptionFeedSessions();
    const uuid = populateSubscriptionFeedSelector();
    if (!uuid) {
      $results.html('<div style="text-align:center;color:#999;padding:40px 0;">请先在设置中添加订阅号</div>');
      subscriptionFeedCurrentUuid = '';
      subscriptionFeedHasMore = false;
      return;
    }
    subscriptionFeedCurrentUuid = uuid;
    if (restoreSubscriptionFeedSession(uuid)) return;
    resetSubscriptionFeedRuntimeState(uuid);
    $results.html('<div style="text-align:center;color:#999;padding:40px 0;">正在获取订阅……</div>');
    loadSubscriptionFeedPage(uuid, 1, { replace: true, source: 'init' });
  }

  async function loadSubscriptionFeedPage(uuid, page, options = {}) {
    const replace = !!options.replace;
    if (!uuid || subscriptionFeedLoading) return;
    const requestPage = Math.max(1, Number(page) || 1);
    const $results = $('#sp_feeds_results');
    if (replace && subscriptionFeedHighestRenderedPage <= 0) {
      resetSubscriptionFeedRuntimeState(uuid);
      if ($results.length) $results.empty();
    }
    const expectedPage = getSubscriptionFeedNextRenderPage();
    if (requestPage !== expectedPage) {
      console.warn('[subscription-feed] reject non-contiguous page', {
        uuid,
        page: requestPage,
        expectedPage,
        source: options.source || '',
        currentPage: subscriptionFeedCurrentPage,
        highestRenderedPage: subscriptionFeedHighestRenderedPage,
        allItems: subscriptionFeedAllItems.length,
        cacheExpired: subscriptionFeedCacheExpired
      });
      return;
    }
    const session = getSubscriptionFeedSession(uuid);
    if (session && isSubscriptionFeedSessionExpired(session)) subscriptionFeedCacheExpired = true;
    subscriptionFeedLoading = true;
    const seq = ++subscriptionFeedRequestSeq;
    subscriptionFeedInflightPages[requestPage] = seq;
    try {
      const items = normalizeSubscriptionFeedPageItems(await fetchSubscriptionFeedPage(uuid, requestPage));
      if (subscriptionFeedInflightPages[requestPage] !== seq) return;
      if (uuid !== subscriptionFeedCurrentUuid) return;
      if (!items.length) {
        subscriptionFeedHasMore = false;
        renderSubscriptionFeedRenderedPages({ displayPage: subscriptionFeedCurrentDisplayPage });
        return;
      }
      const pageEntry = buildSubscriptionFeedPageEntry(requestPage, items);
      if (!appendSubscriptionFeedRenderedPage(pageEntry)) return;
      subscriptionFeedHasMore = true;
      renderSubscriptionFeedRenderedPages({ displayPage: subscriptionFeedCurrentDisplayPage });
      if (!subscriptionFeedCacheExpired) {
        let nextSession = getSubscriptionFeedSession(uuid);
        if (!nextSession || isSubscriptionFeedSessionExpired(nextSession) || !isSubscriptionFeedSessionStructurallyValid(nextSession)) {
          nextSession = createSubscriptionFeedSession(uuid, pageEntry);
        } else {
          nextSession.cachedPages[String(requestPage)] = pageEntry;
          nextSession.highestCachedPage = computeHighestContiguousSubscriptionFeedPage(nextSession.cachedPages);
          nextSession.lastAccessAt = Date.now();
        }
        saveSubscriptionFeedSession(nextSession);
      }
    } catch (err) {
      console.error('[subscription-feed] load error', err);
      if (replace) {
        $results.html(`<div style="text-align:center;color:#c00;padding:40px 0;">加载失败：${Utils.escapeHTML ? Utils.escapeHTML(err.message) : err.message}</div>`);
      }
    } finally {
      if (subscriptionFeedInflightPages[requestPage] === seq) delete subscriptionFeedInflightPages[requestPage];
      subscriptionFeedLoading = false;
    }
  }

  function bindSubscriptionFeedModuleEvents() {
    // 订阅号切换
    // 自定义下拉菜单交互
    const $wrap = $('.xdex-feed-selector-wrap');
    const $display = $('#sp_feeds_selector_display');
    const $dropdown = $('#sp_feeds_selector_dropdown');

    $display.off('click.feedDropdown').on('click.feedDropdown', (e) => {
      e.stopPropagation();
      const isOpen = $dropdown.is(':visible');
      $dropdown.toggle(!isOpen);
      $display.attr('aria-expanded', String(!isOpen));
    });

    $dropdown.off('click.feedOption', '.xdex-feed-option').on('click.feedOption', '.xdex-feed-option', function (e) {
      e.stopPropagation();
      const uuid = $(this).data('uuid') || '';
      if (!uuid) return;
      $('#sp_feeds_selector').val(uuid).trigger('change.subscriptionFeed');
      const feeds = (typeof getFilterConfig === 'function' ? getFilterConfig() : {}).subscriptionFeeds || [];
      const feed = feeds.find(f => f.uuid === uuid);
      $display.find('.xdex-feed-display-desc').text(feed && feed.desc ? feed.desc : '');
      $display.find('.xdex-feed-display-uuid').text(feed && feed.desc ? feed.uuid : '');
      $dropdown.find('.xdex-feed-option').removeClass('active').filter('[data-uuid="' + uuid + '"]').addClass('active');
      $dropdown.hide();
      $display.attr('aria-expanded', 'false');
    });

    $(document).off('click.feedDropdownClose').on('click.feedDropdownClose', () => {
      $dropdown.hide();
      $display.attr('aria-expanded', 'false');
    });

    $('#sp_feeds_selector').off('change.subscriptionFeed').on('change.subscriptionFeed', function () {
      subscriptionFeedCurrentUuid = $(this).val() || '';
      if (subscriptionFeedCurrentUuid) {
        setActiveSubscriptionFeedUuid(subscriptionFeedCurrentUuid);
        renderSubscriptionFeedModule();
      }
    });
    // 跨页面同步：其他标签页切换订阅号时自动刷新
    if (typeof GM_addValueChangeListener === 'function') {
      GM_addValueChangeListener(ACTIVE_FEED_STORAGE_KEY, (_key, _oldVal, newVal, remote) => {
        if (!remote) return;
        const uuid = String(newVal || '');
        if (uuid && uuid !== subscriptionFeedCurrentUuid) {
          subscriptionFeedCurrentUuid = uuid;
          $('#sp_feeds_selector').val(uuid);
          renderSubscriptionFeedModule();
        }
      });
    }

    // 跳转
    $('#sp_feeds_page_jump').off('click.subscriptionFeed').on('click.subscriptionFeed', (e) => {
      e.preventDefault();
      const page = parseInt($('#sp_feeds_page_input').val(), 10);
      if (!page || page < 1 || !subscriptionFeedCurrentUuid) return;
      const expectedPage = getSubscriptionFeedNextRenderPage();
      if (page !== expectedPage) {
        toast(`当前缓存会话仅支持连续翻页，请先加载第${expectedPage}页`);
        return;
      }
      loadSubscriptionFeedPage(subscriptionFeedCurrentUuid, page, { replace: false, source: 'jump' });
    });

    // 滚动加载下一页
    const $scrollContainer = $('#sp_module_feeds .sp_panel_content');
    $scrollContainer.off('scroll.subscriptionFeed').on('scroll.subscriptionFeed', function () {
      updateSubscriptionFeedDisplayPageFromScroll();
      if (subscriptionFeedLoading || !subscriptionFeedHasMore || !subscriptionFeedCurrentUuid) return;
      const el = this;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 400) {
        const nextPage = getSubscriptionFeedNextRenderPage();
        loadSubscriptionFeedPage(subscriptionFeedCurrentUuid, nextPage, { replace: false, source: 'scroll' });
      }
    });

    // 上一页
    $('#sp_feeds_prev').off('click.subscriptionFeed').on('click.subscriptionFeed', (e) => {
      e.preventDefault();
      toast('当前缓存会话仅支持向后连续翻页');
    });

    // 下一页
    $('#sp_feeds_next').off('click.subscriptionFeed').on('click.subscriptionFeed', (e) => {
      e.preventDefault();
      if (!subscriptionFeedCurrentUuid) return;
      const nextPage = getSubscriptionFeedNextRenderPage();
      loadSubscriptionFeedPage(subscriptionFeedCurrentUuid, nextPage, { replace: false, source: 'next-button' });
    });

    // 订阅面板图片点击 → 打开引用弹窗（图片激活态）
    $('#sp_feeds_results').off('click.xdex-feed-image-quote', '.xdex-history-image').on('click.xdex-feed-image-quote', '.xdex-history-image', function (e) {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      const opened = openHistoryImageQuotePreview(this.dataset.historyQuoteId || '');
      if (!opened) return;
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    });

    // 取消订阅
    $('#sp_feeds_results').off('click.xdex-feed-delete', '.xdex-post-history-delete').on('click.xdex-feed-delete', '.xdex-post-history-delete', function (e) {
      e.preventDefault();
      const tid = this.dataset.feedThreadId || '';
      if (!tid || !subscriptionFeedCurrentUuid) return;
      if (!window.confirm('确定要取消订阅这个串吗？')) return;
      GM_xmlhttpRequest({
        method: 'POST',
        url: `${SUBSCRIPTION_FEED_API_BASE}/delFeed`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: `uuid=${encodeURIComponent(subscriptionFeedCurrentUuid)}&tid=${encodeURIComponent(tid)}`,
        onload: () => {
          invalidateSubscriptionFeedSession(subscriptionFeedCurrentUuid, 'delete-feed');
          resetSubscriptionFeedRuntimeState(subscriptionFeedCurrentUuid);
          toast('已取消订阅');
          renderSubscriptionFeedModule();
        },
        onerror: () => toast('取消订阅失败')
      });
    });
  }

  function setPostHistoryType(type) {
    postHistoryActiveType = normalizePostHistoryType(type);
    $('#sp_posts_type_buttons [data-post-history-type]').removeClass('active')
      .filter(`[data-post-history-type="${postHistoryActiveType}"]`).addClass('active');
    renderPostHistoryModule();
  }

  function bindPostHistoryModuleEvents() {
    $('#sp_posts_search').off('input.xdex-post-history').on('input.xdex-post-history', function () {
      renderPostHistoryModule(this.value || '');
    });
    $('#sp_posts_type_buttons').off('click.xdex-post-history', '[data-post-history-type]').on('click.xdex-post-history', '[data-post-history-type]', function (e) {
      e.preventDefault();
      setPostHistoryType(this.dataset.postHistoryType || 'thread');
    });
    $('#sp_posts_results').off('click.xdex-post-history-reply', '.xdex-post-history-reply-action').on('click.xdex-post-history-reply', '.xdex-post-history-reply-action', function (e) {
      if (e.button !== 0) return;
      const url = this.href || '';
      if (!url) return;
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        window.location.href = url;
        return;
      }
      window.open(url, '_blank', 'noopener');
    });
    $('#sp_posts_results').off('click.xdex-post-history-image-quote', '.xdex-post-history-image').on('click.xdex-post-history-image-quote', '.xdex-post-history-image', function (e) {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      const opened = openHistoryImageQuotePreview(this.dataset.postHistoryQuoteId || '');
      if (!opened) return;
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    });
    $('#sp_posts_results').off('click.xdex-post-history-delete', '.xdex-post-history-delete').on('click.xdex-post-history-delete', '.xdex-post-history-delete', function (e) {
      e.preventDefault();
      const key = this.dataset.postHistoryKey || '';
      if (!key) return;
      if (!window.confirm('确定要删除这条发言记录吗？')) return;
      deletePostHistoryItem(key);
      renderPostHistoryModule();
      toast('已删除发言记录');
    });
    $('#sp_posts_clear').off('click.xdex-post-history').on('click.xdex-post-history', function (e) {
      e.preventDefault();
      if (!window.confirm('确定要清空全部我的发言记录吗？')) return;
      clearPostHistory();
      renderPostHistoryModule();
      toast('已清空我的发言');
    });
  }

  function formatLocalDateKey(ts = Date.now()) {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getNextNaturalCheckAt(nowTs = Date.now(), hour = UPDATE_CHECK_HOUR) {
    const d = new Date(nowTs);
    d.setDate(d.getDate() + 1);
    d.setHours(hour, 0, 0, 0);
    return d.getTime();
  }

  function compareVersionStrings(a, b) {
    const pa = String(a || '').split('.').map(v => parseInt(v, 10) || 0);
    const pb = String(b || '').split('.').map(v => parseInt(v, 10) || 0);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      const av = pa[i] || 0;
      const bv = pb[i] || 0;
      if (av > bv) return 1;
      if (av < bv) return -1;
    }
    return 0;
  }

  function gmRequest(url, responseType = 'text', headers = null) {
    return new Promise((resolve, reject) => {
      const request = {
        method: 'GET',
        url,
        responseType,
        onload: (resp) => {
          if (resp.status >= 200 && resp.status < 300) {
            resolve(resp);
          } else {
            reject(new Error(`HTTP ${resp.status} ${url}`));
          }
        },
        onerror: () => reject(new Error(`Request failed: ${url}`)),
        ontimeout: () => reject(new Error(`Request timeout: ${url}`))
      };
      if (headers) request.headers = headers;
      GM_xmlhttpRequest(request);
    });
  }

  async function fetchMetaVersionAndChangelog(url, source) {
    const resp = await gmRequest(url, 'text');
    const parsed = parseVersionAndChangelogFromMeta(resp.responseText || '');
    return {
      source,
      url,
      version: parsed.version,
      changelog: parsed.changelog
    };
  }

  async function fetchScriptCatVersionAndChangelog(url, source = 'scriptcat') {
    const resp = await gmRequest(url, 'text');
    const json = JSON.parse(resp.responseText || '{}');
    const script = (json && json.data && json.data.script) || {};
    return {
      source,
      url,
      version: String(script.version || '').trim(),
      changelog: String(script.changelog || '').trim()
    };
  }

  async function fetchExtensionUpdateJson(url, source) {
    const resp = await gmRequest(url, 'text');
    const json = JSON.parse(resp.responseText || '{}');
    const extension = json && json.extension ? json.extension : json;
    return {
      source,
      url,
      version: String(extension.version || '').trim(),
      changelog: String(extension.changelog || '').trim(),
      downloads: extension.downloads || {}
    };
  }

  function getUpdateCheckRequestsForRuntime() {
    if (XDEX_RUNTIME && XDEX_RUNTIME.kind === 'extension') {
      return [
        () => fetchExtensionUpdateJson(UPDATE_EXTENSION_GITHUB_JSON_URL, 'github'),
        () => fetchExtensionUpdateJson(UPDATE_EXTENSION_JSDELIVR_JSON_URL, 'jsdelivr')
      ];
    }
    return [
      () => fetchMetaVersionAndChangelog(UPDATE_GREASYFORK_META_URL, 'greasyfork'),
      () => fetchScriptCatVersionAndChangelog(UPDATE_SCRIPTCAT_API_URL, 'scriptcat')
    ];
  }

  function choosePreferredRemoteMeta(results) {
    const valid = (results || []).filter(item => item && item.version);
    if (!valid.length) return null;
    valid.sort((a, b) => compareVersionStrings(b.version, a.version));
    const topVersion = valid[0].version;
    const topCandidates = valid.filter(item => compareVersionStrings(item.version, topVersion) === 0);
    const preferredSource = XDEX_RUNTIME && XDEX_RUNTIME.kind === 'extension' ? 'github' : 'greasyfork';
    const preferred = topCandidates.find(item => item.source === preferredSource) || topCandidates[0];
    return preferred;
  }

  function shouldShowPendingUpdateReminder(state, currentVersion = VERSION) {
    if (!state || !state.pendingUpdateVersion) return false;
    if (compareVersionStrings(state.pendingUpdateVersion, currentVersion) <= 0) return false;
    if (state.ignoredVersion && state.ignoredVersion === state.pendingUpdateVersion) return false;
    if (state.lastDismissDate && state.lastDismissDate === formatLocalDateKey()) return false;
    if (state.dismissedUntil && Date.now() < state.dismissedUntil) return false;
    return true;
  }

  function updateSettingsButtonBadge(state = getUpdateCheckState()) {
    const $btn = $('#sp_btn');
    if (!$btn.length) return;
    if (typeof isUpdateCheckEnabled === 'function' && !isUpdateCheckEnabled()) {
      $btn.removeClass('xdex-has-update');
      return;
    }
    $btn.toggleClass('xdex-has-update', shouldShowPendingUpdateReminder(state));
  }

  function clearFooterUpdateHighlight() {
    const $links = $('#sp_panel_footer .sp_panel_links');
    $links.removeClass('xdex-update-highlight xdex-update-source-greasyfork xdex-update-source-scriptcat xdex-update-source-github');
    $links.find('[data-update-channel]').removeClass('xdex-update-link-primary xdex-update-link-secondary');
  }

  function flashFooterUpdateHighlight(source = '') {
    const $links = $('#sp_panel_footer .sp_panel_links');
    if (!$links.length) return;
    clearFooterUpdateHighlight();
    $links.addClass('xdex-update-highlight');
    const sourceKey = String(source || '').trim().toLowerCase();
    const channelMap = {
      greasyfork: {
        containerClass: 'xdex-update-source-greasyfork',
        primary: 'greasyfork',
        secondary: ['github']
      },
      scriptcat: {
        containerClass: 'xdex-update-source-scriptcat',
        primary: 'scriptcat',
        secondary: ['baidupan']
      },
      github: {
        containerClass: 'xdex-update-source-github',
        primary: 'github',
        secondary: ['baidupan']
      },
      jsdelivr: {
        containerClass: 'xdex-update-source-github',
        primary: 'baidupan',
        secondary: ['github']
      }
    };
    const config = channelMap[sourceKey];
    if (config) {
      $links.addClass(config.containerClass);
      $links.find(`[data-update-channel="${config.primary}"]`).addClass('xdex-update-link-primary');
      (config.secondary || []).forEach((channel) => {
        $links.find(`[data-update-channel="${channel}"]`).addClass('xdex-update-link-secondary');
      });
    }
    setTimeout(() => {
      clearFooterUpdateHighlight();
    }, 5000);
  }

  function renderUpdateLogDialog(mode = 'local', state = getUpdateCheckState()) {
    const $dlg = $('#sp_update_log');
    if (!$dlg.length) return;
    const isRemote = mode === 'remote' && state && state.pendingUpdateVersion && compareVersionStrings(state.pendingUpdateVersion, VERSION) > 0;
    const title = isRemote ? `发现新版本 v${state.pendingUpdateVersion}` : '更新日志';
    const bodyText = isRemote
      ? (state.pendingUpdateChangelog || `发现新版本 v${state.pendingUpdateVersion}，但未提取到更新说明。`)
      : (CHANGELOG || '暂无更新说明');
    $dlg.attr('data-update-mode', isRemote ? 'remote' : 'local');
    $dlg.find('.xdex-update-log-title').text(title);
    $dlg.find('.xdex-update-log-body').text(bodyText);
    $dlg.find('.xdex-update-log-actions').css('display', isRemote ? 'flex' : 'none');
  }

  function openUpdateLogDialog(mode = 'local') {
    const state = getUpdateCheckState();
    renderUpdateLogDialog(mode, state);
    $('#sp_update_log').fadeIn(120);
  }

  function closeUpdateLogDialog(options = {}) {
    const { treatAsDismiss = false, reason = 'unknown' } = options || {};
    const mode = $('#sp_update_log').attr('data-update-mode') || '';
    if (treatAsDismiss) {
      const state = getUpdateCheckState();
      state.lastDismissDate = formatLocalDateKey();
      state.dismissedUntil = state.nextCheckAt || getNextNaturalCheckAt();
      setUpdateCheckState(state);
      updateSettingsButtonBadge(state);
      console.log('[update-check] dismiss dialog:', {
        reason,
        mode,
        treatAsDismiss: true,
        lastDismissDate: state.lastDismissDate,
        dismissedUntil: state.dismissedUntil,
        dismissedUntilISO: state.dismissedUntil ? new Date(state.dismissedUntil).toISOString() : ''
      });
    } else {
      console.log('[update-check] close dialog:', {
        reason,
        mode,
        treatAsDismiss: false
      });
    }
    $('#sp_update_log').fadeOut(120);
  }

  function maybeShowPendingUpdateDialogOnPanelOpen() {
    if (!isUpdateCheckEnabled()) {
      const state = getDefaultUpdateCheckState();
      updateSettingsButtonBadge(state);
      clearFooterUpdateHighlight();
      return;
    }
    const state = getUpdateCheckState();
    updateSettingsButtonBadge(state);
    if (shouldShowPendingUpdateReminder(state)) {
      openUpdateLogDialog('remote');
    }
  }

  async function checkForDailyScriptUpdate(force = false) {
    if (!isUpdateCheckEnabled()) {
      const state = getUpdateCheckState();
      updateSettingsButtonBadge(state);
      clearFooterUpdateHighlight();
      return state;
    }
    const now = Date.now();
    const today = formatLocalDateKey(now);
    const state = getUpdateCheckState();
    const alreadyChecked = !force && state.nextCheckAt && now < state.nextCheckAt;
    console.log('[update-check] start:', {
      force,
      now,
      today,
      currentVersion: VERSION,
      state: Object.assign({}, state),
      alreadyChecked,
      nextCheckAtISO: state.nextCheckAt ? new Date(state.nextCheckAt).toISOString() : ''
    });
    if (alreadyChecked) {
      console.log('[update-check] skip: already checked for current window', {
        force,
        now,
        nextCheckAt: state.nextCheckAt,
        nextCheckAtISO: new Date(state.nextCheckAt).toISOString()
      });
      updateSettingsButtonBadge(state);
      return state;
    }
    state.lastCheckDate = today;
    state.nextCheckAt = getNextNaturalCheckAt(now);
    console.log('[update-check] scheduled next check:', {
      lastCheckDate: state.lastCheckDate,
      nextCheckAt: state.nextCheckAt,
      nextCheckAtISO: new Date(state.nextCheckAt).toISOString()
    });
    try {
      const requests = getUpdateCheckRequestsForRuntime();
      const settled = await Promise.allSettled(requests.map((request) => request()));
      const sourceResults = settled.map((item, index) => {
        const source = XDEX_RUNTIME && XDEX_RUNTIME.kind === 'extension'
          ? (index === 0 ? 'github' : 'jsdelivr')
          : (index === 0 ? 'greasyfork' : 'scriptcat');
        if (item.status === 'fulfilled') {
          console.log('[update-check] remote meta success:', item.value);
          return item.value;
        }
        console.warn(`[update-check] remote meta failed: ${source}`, item.reason);
        return null;
      });
      const preferredRemote = choosePreferredRemoteMeta(sourceResults);
      console.log('[update-check] remote meta choice:', {
        localVersion: VERSION,
        candidates: sourceResults,
        preferred: preferredRemote
      });
      const remoteVersion = preferredRemote ? String(preferredRemote.version || '').trim() : '';
      const remoteChangelog = preferredRemote ? String(preferredRemote.changelog || '').trim() : '';
      state.latestRemoteVersion = remoteVersion;
      if (remoteVersion && compareVersionStrings(remoteVersion, VERSION) > 0) {
        state.pendingUpdateVersion = remoteVersion;
        state.pendingUpdateDetectedAt = now;
        state.pendingUpdateChangelog = remoteChangelog || `发现新版本 v${remoteVersion}，但未提取到更新说明。`;
        state.pendingUpdateSource = preferredRemote ? String(preferredRemote.source || '').trim() : '';
        if (state.dismissedUntil && now >= state.dismissedUntil) {
          state.dismissedUntil = 0;
          state.lastDismissDate = '';
        }
        if (state.ignoredVersion && compareVersionStrings(state.ignoredVersion, remoteVersion) < 0) {
          state.ignoredVersion = '';
        }
      } else {
        state.pendingUpdateVersion = '';
        state.pendingUpdateChangelog = '';
        state.pendingUpdateSource = '';
        state.pendingUpdateDetectedAt = 0;
      }
    } catch (e) {
      console.warn('[update-check] daily update check failed:', e);
    }
    console.log('[update-check] final state before save:', state);
    setUpdateCheckState(state);
    updateSettingsButtonBadge(state);
    return state;
  }
  const toastQueue = [];
  let isShowing = false;
  
  function toast(msg, duration = 1800, options = {}) {
    if (options.queue === false) {
      showImmediateToast(msg, duration, options.key);
      return;
    }
    toastQueue.push({ msg, duration });
    if (!isShowing) showNextToast();
  }
  
  function showNextToast() {
    if (toastQueue.length === 0) {
      isShowing = false;
      return;
    }
    isShowing = true;
    const { msg, duration } = toastQueue.shift();
    console.log('[toast]', msg);
  
    // ✅ 每次创建一个新的 toast 节点
    const $t = $(`<div class="ae-toast" style="
      position:fixed;top:10px;left:50%;transform:translateX(-50%);
      background:rgba(0,0,0,.75);color:#fff;padding:8px 18px;
      border-radius:5px;z-index:9999;display:none;font-size:14px;">
      ${msg}
    </div>`);
  
    $('body').append($t);
  
    $t.fadeIn(240).delay(duration).fadeOut(240, () => {
      $t.remove();     // ✅ 动画结束后删除节点
      showNextToast(); // ✅ 显示下一个
    });
  }

  function showImmediateToast(msg, duration = 900, key = 'default') {
    const safeKey = String(key || 'default').replace(/[^a-z0-9_-]/gi, '-');
    let $t = $(`#xdex-immediate-toast-${safeKey}`);
    if ($t.length) {
      $t.stop(true, true).text(msg).show().delay(duration).fadeOut(160, () => $t.remove());
      return $t;
    }
    $t = $(`<div id="xdex-immediate-toast-${safeKey}" class="ae-toast" style="
      position:fixed;top:10px;left:50%;transform:translateX(-50%);
      background:rgba(0,0,0,.75);color:#fff;padding:8px 18px;
      border-radius:5px;z-index:9999;display:none;font-size:14px;"></div>`);
    $t.text(msg);
    $('body').append($t);
    $t.fadeIn(120).delay(duration).fadeOut(160, () => $t.remove());
    return $t;
  }
  
  const Utils = {
      // 逗号(中英)分隔，支持转义 \, \， \\
      strToList(s) {
        if (!s) return [];
        const list = [], esc = ',，\\';
        let cur = '';
        for (let i = 0; i < s.length; i++) {
          const ch = s[i];
          if (ch === '\\' && i + 1 < s.length && esc.includes(s[i+1])) {
            cur += s[++i];
          } else if (ch === ',' || ch === '，') {
            const t = cur.trim();
            if (t) list.push(t);
            cur = '';
          } else cur += ch;
        }
        const t = cur.trim();
        if (t) list.push(t);
        return [...new Set(list)];
      },

      cookieLegal: s => /^[A-Za-z0-9]{3,7}$/.test(s),

      cookieMatch: (cid,p) => cid.toLowerCase().includes(p.toLowerCase()),

      firstHit(txt,list) {
        return list.find(k=>txt.toLowerCase().includes(k.toLowerCase()))||null;
      },

      collapse($elem, hint) {
        if (!$elem.length || $elem.data('xdex-collapsed')) return;
        const $icons = $elem.find('.h-threads-item-reply-icon');
        let nums = '';
        if ($icons.length) {
          const f = $icons.first().text();
          const l = $icons.last().text();
          nums = $icons.length>1 ? `${f}-${l} ` : `${f} `;
        }
        const cap = `${nums}${hint}`;
        const $ph = $(`
          <div class="xdex-placeholder xdex-generic-toggle" style="
            padding:6px 10px;background:#fafafa;color:#888;
            border:1px dashed #bbb;margin-bottom:3px;cursor:pointer;">
            ${cap}（点击展开）
          </div>
        `);
        $elem.before($ph).hide().data('xdex-collapsed',true);
        $elem.addClass('xdex-generic-collapsed'); // ★ 标记为公用折叠，以免触发板块页长串折叠/收起

        $ph.on('click',()=>{
          if($elem.is(':visible')){
            $elem.hide(); $ph.html(`${cap}（点击展开）`);
          } else {
            $elem.show(); $ph.text('点击折叠');
          }
        });
      return $ph;
      },

      // ===== 引用串优化缓存相关 =====
      quoteCache: {},

      getQuoteFromCache(id) {
        return this.quoteCache[id] || GM_getValue('quote_' + id, null);
      },

      saveQuoteToCache(id, html) {
        this.quoteCache[id] = html;
        GM_setValue('quote_' + id, html);
      }
  };

  // 多分组标记时依次使用的背景色（可扩充）
  const markColors = [
    '#66CCFF','#00FFCC','#EE0000','#006666','#0080FF','#FFFF00',
    '#39C5BB','#9999FF','#FF4004','#3399FF','#D80000','#F6BE71',
    '#EE82EE','#FFA500','#FFE211','#FAAFBE','#0000FF'
  ];

  // 解析"最后一个冒号分隔"的分组：返回 {desc, list}
  function parseDescAndListByLastColon(raw) {
    const idx = Math.max(raw.lastIndexOf(':'), raw.lastIndexOf('：'));
    let desc = '';
    let cookiePart = '';
    
    if (idx > 0) {
      // 有冒号：冒号前是备注/说明，冒号后是饼干
      desc = raw.slice(0, idx).trim();
      cookiePart = raw.slice(idx + 1).trim();
    } else {
      // 没有冒号：整个字符串都是饼干
      cookiePart = raw.trim();
    }
    
    const list = Utils.strToList(cookiePart);
    return { desc, list };
  }

  // 校验分组说明长度（<=20 字符；满足“10个汉字/20个英文字符”的近似约束）
  function isValidDesc(desc) { return !desc || desc.length <= 20; }

  function isValidHexColor(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  function normalizeHexColor(color) {
    if (typeof color !== 'string') return '';
    const trimmed = color.trim();
    return isValidHexColor(trimmed) ? trimmed.toUpperCase() : '';
  }

  function clampColorChannel(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function rgbToHex(rgb) {
    if (!rgb) return '';
    const r = clampColorChannel(Math.round(rgb.r || 0), 0, 255);
    const g = clampColorChannel(Math.round(rgb.g || 0), 0, 255);
    const b = clampColorChannel(Math.round(rgb.b || 0), 0, 255);
    return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  }

  function hexToRgb(color) {
    const normalized = normalizeHexColor(color);
    if (!normalized) return null;
    return {
      r: parseInt(normalized.slice(1, 3), 16),
      g: parseInt(normalized.slice(3, 5), 16),
      b: parseInt(normalized.slice(5, 7), 16),
    };
  }

  function hsvToRgb(h, s, v) {
    const hue = ((Number(h) % 360) + 360) % 360;
    const sat = clampColorChannel(Number(s), 0, 1);
    const val = clampColorChannel(Number(v), 0, 1);
    const c = val * sat;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = val - c;
    let r1 = 0;
    let g1 = 0;
    let b1 = 0;
    if (hue < 60) {
      r1 = c; g1 = x;
    } else if (hue < 120) {
      r1 = x; g1 = c;
    } else if (hue < 180) {
      g1 = c; b1 = x;
    } else if (hue < 240) {
      g1 = x; b1 = c;
    } else if (hue < 300) {
      r1 = x; b1 = c;
    } else {
      r1 = c; b1 = x;
    }
    return {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255),
    };
  }

  function rgbToHsv(r, g, b) {
    const red = clampColorChannel(Number(r), 0, 255) / 255;
    const green = clampColorChannel(Number(g), 0, 255) / 255;
    const blue = clampColorChannel(Number(b), 0, 255) / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;
    let h = 0;
    if (delta) {
      if (max === red) h = 60 * (((green - blue) / delta) % 6);
      else if (max === green) h = 60 * (((blue - red) / delta) + 2);
      else h = 60 * (((red - green) / delta) + 4);
    }
    if (h < 0) h += 360;
    return {
      h,
      s: max === 0 ? 0 : delta / max,
      v: max,
    };
  }

  function hexToHsv(color) {
    const rgb = hexToRgb(color);
    return rgb ? rgbToHsv(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, v: 1 };
  }

  function hsvToHex(h, s, v) {
    return rgbToHex(hsvToRgb(h, s, v));
  }

  function parseRgbColorString(value) {
    if (typeof value !== 'string') return null;
    const match = value.trim().match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
    if (!match) return null;
    const r = Number(match[1]);
    const g = Number(match[2]);
    const b = Number(match[3]);
    if ([r, g, b].some((n) => Number.isNaN(n) || n < 0 || n > 255)) return null;
    return { r, g, b };
  }

  function formatRgbColor(rgb) {
    if (!rgb) return '';
    return `rgb(${clampColorChannel(Math.round(rgb.r || 0), 0, 255)}, ${clampColorChannel(Math.round(rgb.g || 0), 0, 255)}, ${clampColorChannel(Math.round(rgb.b || 0), 0, 255)})`;
  }

  function getMarkedGroupEffectiveColor(group, index) {
    return normalizeHexColor(group && group.color) || markColors[index % markColors.length];
  }

  function isValidThreadId(threadId) {
    return /^\d{8}$/.test(threadId);
  }

  function normalizeFavoriteThreadInput(raw) {
    const value = String(raw || '').trim();
    if (isValidThreadId(value)) return value;

    let url;
    try {
      url = new URL(value, location.origin);
    } catch (e) {
      return '';
    }

    if (url.hostname && !['www.nmbxd1.com', 'nmbxd1.com', 'www.nmbxd.com', 'nmbxd.com'].includes(url.hostname)) return '';

    const path = url.pathname || '';
    const threadMatch = path.match(/^\/t\/(\d{8})(?:\/\d+)?\/?$/);
    if (threadMatch) return threadMatch[1];

    const poMatch = path.match(/^\/Forum\/po\/id\/(\d{8})(?:\/page\/\d+)?(?:\.html)?$/);
    if (poMatch) return poMatch[1];

    return '';
  }

  function makeFavoriteThreadUrl(threadId) {
    return `https://www.nmbxd1.com/t/${threadId}`;
  }

  function trimFavoriteThreadDesc(desc) {
    return String(desc || '').trim().slice(0, 20);
  }

  function formatFavoriteThreadMenuText(item) {
    const text = item && item.desc ? item.desc : item && item.threadId ? item.threadId : '';
    return text.length > 7 ? `${text.slice(0, 7)}……` : text;
  }

  function normalizeFavoriteThreads(val) {
    if (!Array.isArray(val)) return [];
    const seen = new Set();
    return val.map((item) => {
      const desc = item && typeof item.desc === 'string' && isValidDesc(item.desc.trim()) ? item.desc.trim() : '';
      const threadId = normalizeFavoriteThreadInput(item && typeof item.threadId === 'string' ? item.threadId : '');
      return { desc, threadId };
    }).filter((item) => {
      if (!isValidThreadId(item.threadId) || seen.has(item.threadId)) return false;
      seen.add(item.threadId);
      return true;
    });
  }

  function collectSubscriptionFeedsFromPanel() {
    const parsed = [];
    const seen = new Map();
    let valid = true;
    $('#subscription-feed-inputs-container .subscription-feed-row').each((idx, el) => {
      const $row = $(el);
      const desc = ($row.find('.subscription-feed-desc-input').val() || '').trim();
      const uuid = ($row.find('.subscription-feed-uuid-input').val() || '').trim();
      if (!desc && !uuid) return;
      if (!isValidDesc(desc)) { toast(`第${idx + 1}组备注过长`); valid = false; return false; }
      if (!uuid) { toast(`第${idx + 1}组未指定订阅号`); valid = false; return false; }
      if (seen.has(uuid)) {
        const first = seen.get(uuid);
        const suffix = first.desc ? `（${first.desc}）` : '';
        toast(`第${idx + 1}组与第${first.index}组${suffix}订阅号重复`);
        valid = false;
        return false;
      }
      seen.set(uuid, { index: idx + 1, desc });
      parsed.push({ desc, uuid });
    });
    return valid ? parsed : null;
  }

  function collectFavoriteThreadsFromPanel() {
    const parsed = [];
    const seen = new Map();
    let valid = true;
    $('#favorite-thread-inputs-container .favorite-thread-row').each((idx, el) => {
      const $row = $(el);
      const desc = ($row.find('.favorite-thread-desc-input').val() || '').trim();
      const rawThread = ($row.find('.favorite-thread-id-input').val() || '').trim();
      const threadId = normalizeFavoriteThreadInput(rawThread);
      if (!desc && !rawThread) return;
      if (!isValidDesc(desc)) { toast(`第${idx + 1}组备注过长`); valid = false; return false; }
      if (!rawThread) { toast(`第${idx + 1}组未指定串号或链接`); valid = false; return false; }
      if (!threadId) { toast(`第${idx + 1}组存在不合法串号或链接`); valid = false; return false; }
      if (seen.has(threadId)) {
        const first = seen.get(threadId);
        const suffix = first.desc ? `（${first.desc}）` : '';
        toast(`第${idx + 1}组与第${first.index}组${suffix}重复`);
        valid = false;
        return false;
      }
      seen.set(threadId, { index: idx + 1, desc });
      parsed.push({ desc, threadId });
    });
    return valid ? parsed : null;
  }

  function buildFavoriteThreadRowHtml(index, item = {}) {
    const desc = item.desc || '';
    const threadId = item.threadId || '';
    return `
      <div class="favorite-thread-row" style="position:relative;margin:10px 0 8px;">
        <span style="position:absolute;top:-9px;left:10px;display:inline-block;padding:0 6px;font-size:12px;line-height:18px;border:1px solid #a98f7a;border-radius:999px;background:#F0E0D6;z-index:1;">#${index}</span>
        <button type="button" class="favorite-thread-delete" style="position:absolute;top:-9px;right:10px;width:20px;height:20px;border:1px solid #a98f7a;border-radius:999px;background:#F0E0D6;line-height:16px;padding:0;font-size:14px;cursor:pointer;z-index:1;">×</button>
        <div style="display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:8px;align-items:flex-start;border:1px solid #bfa58f;border-radius:6px;padding:12px 10px 10px;background:rgba(255,255,255,0.18);box-sizing:border-box;width:100%;">
          <input class="favorite-thread-desc-input" style="width:100%;min-width:0;padding:5px 8px;box-sizing:border-box;border-radius:8px;" placeholder="备注（可选）" value="${Utils.escapeHTML ? Utils.escapeHTML(desc) : desc}">
          <input class="favorite-thread-id-input" style="width:100%;min-width:0;padding:5px 8px;box-sizing:border-box;border-radius:8px;" placeholder="8位串号或串链接" value="${Utils.escapeHTML ? Utils.escapeHTML(threadId) : threadId}">
        </div>
      </div>`;
  }

  function buildSubscriptionFeedRowHtml(index, item = {}) {
    const desc = item.desc || '';
    const uuid = item.uuid || '';
    return `
      <div class="subscription-feed-row" style="position:relative;margin:10px 0 8px;">
        <span style="position:absolute;top:-9px;left:10px;display:inline-block;padding:0 6px;font-size:12px;line-height:18px;border:1px solid #a98f7a;border-radius:999px;background:#F0E0D6;z-index:1;">#${index}</span>
        <button type="button" class="subscription-feed-delete" style="position:absolute;top:-9px;right:10px;width:20px;height:20px;border:1px solid #a98f7a;border-radius:999px;background:#F0E0D6;line-height:16px;padding:0;font-size:14px;cursor:pointer;z-index:1;">×</button>
        <div style="display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:8px;align-items:flex-start;border:1px solid #bfa58f;border-radius:6px;padding:12px 10px 10px;background:rgba(255,255,255,0.18);box-sizing:border-box;width:100%;">
          <input class="subscription-feed-desc-input" style="width:100%;min-width:0;padding:5px 8px;box-sizing:border-box;border-radius:8px;" placeholder="备注（可选）" value="${Utils.escapeHTML ? Utils.escapeHTML(desc) : desc}">
          <input class="subscription-feed-uuid-input" style="width:100%;min-width:0;padding:5px 8px;box-sizing:border-box;border-radius:8px;" placeholder="订阅号（任意字符串）" value="${Utils.escapeHTML ? Utils.escapeHTML(uuid) : uuid}">
        </div>
      </div>`;
  }

  function parseThreadCookieWhitelistRule(raw) {
    const idx = Math.max(raw.lastIndexOf(':'), raw.lastIndexOf('：'));
    let threadPart = '';
    let cookiePart = '';

    if (idx > 0) {
      threadPart = raw.slice(0, idx).trim();
      cookiePart = raw.slice(idx + 1).trim();
    } else {
      threadPart = raw.trim();
    }

    return {
      threads: Utils.strToList(threadPart),
      cookies: Utils.strToList(cookiePart),
    };
  }

  function buildThreadCookieWhitelistRowHtml(index, group = {}) {
    const desc = group.desc || '';
    const threadText = Array.isArray(group.threads) ? group.threads.join(',') : '';
    const cookieText = Array.isArray(group.cookies) ? group.cookies.join(',') : '';
    return `
      <div class="thread-cookie-whitelist-row" style="position:relative;margin:10px 0 8px;">
        <span style="position:absolute;top:-9px;left:10px;display:inline-block;padding:0 6px;font-size:12px;line-height:18px;border:1px solid #a98f7a;border-radius:999px;background:#F0E0D6;z-index:1;">#${index}</span>
        <button type="button" class="thread-cookie-whitelist-delete" style="position:absolute;top:-9px;right:10px;width:20px;height:20px;border:1px solid #a98f7a;border-radius:999px;background:#F0E0D6;line-height:16px;padding:0;font-size:14px;cursor:pointer;z-index:1;">×</button>
        <div style="display:grid;grid-template-columns:minmax(0,0.9fr) minmax(0,1.25fr) minmax(0,1.35fr);gap:8px;align-items:flex-start;border:1px solid #bfa58f;border-radius:6px;padding:12px 10px 10px;background:rgba(255,255,255,0.18);box-sizing:border-box;width:100%;">
          <input class="thread-cookie-whitelist-desc-input" style="width:100%;min-width:0;padding:5px 8px;box-sizing:border-box;border-radius:8px;" placeholder="备注（可选）" value="${Utils.escapeHTML ? Utils.escapeHTML(desc) : desc}">
          <input class="thread-cookie-whitelist-threads-input" style="width:100%;min-width:0;padding:5px 8px;box-sizing:border-box;border-radius:8px;" placeholder="8位串号1,8位串号2" value="${Utils.escapeHTML ? Utils.escapeHTML(threadText) : threadText}">
          <input class="thread-cookie-whitelist-cookies-input" style="width:100%;min-width:0;padding:5px 8px;box-sizing:border-box;border-radius:8px;" placeholder="3-7位饼干ID1,饼干ID2" value="${Utils.escapeHTML ? Utils.escapeHTML(cookieText) : cookieText}">
        </div>
      </div>`;
  }

  function buildCookieGroupRowHtml(type, index, value, placeholder) {
    return `
      <div class="${type}-row" style="position:relative;margin:10px 0 8px;">
        <span style="position:absolute;top:-9px;left:10px;display:inline-block;padding:0 6px;font-size:12px;line-height:18px;border:1px solid #a98f7a;border-radius:999px;background:#F0E0D6;z-index:1;">#${index}</span>
        <button type="button" class="${type}-delete" style="position:absolute;top:-9px;right:10px;width:20px;height:20px;border:1px solid #a98f7a;border-radius:999px;background:#F0E0D6;line-height:16px;padding:0;font-size:14px;cursor:pointer;z-index:1;">×</button>
        <div style="border:1px solid #bfa58f;border-radius:6px;padding:12px 10px 10px;background:rgba(255,255,255,0.18);box-sizing:border-box;width:100%;">
          <input class="${type}-input" style="width:100%;padding:5px 8px;box-sizing:border-box;border-radius:8px;" placeholder="${placeholder}" value="${Utils.escapeHTML ? Utils.escapeHTML(value || '') : (value || '')}">
        </div>
      </div>`;
  }

  function buildBlockedKeywordGroupRowHtml(index, group = {}) {
    const keywordText = typeof group.value === 'string'
      ? group.value
      : (Array.isArray(group.keywords) ? group.keywords.join(',') : '');
    return buildCookieGroupRowHtml('blocked-keyword', index, keywordText, '关键词1,关键词2；8位数字同时也作为串号/回复号匹配');
  }

  function buildCookieGroupTwoFieldRowHtml(type, index, group = {}) {
    const desc = group.desc || '';
    const cookieText = Array.isArray(group.cookies) ? group.cookies.join(',') : '';
    const color = normalizeHexColor(group.color);
    const effectiveColor = type === 'marked' ? getMarkedGroupEffectiveColor(group, index - 1) : '';
    const gridTemplateColumns = type === 'marked'
      ? 'minmax(0,2fr) minmax(0,3fr) 34px'
      : 'minmax(0,2fr) minmax(0,3fr)';
    const markedSwatchHtml = type === 'marked' ? `
          <div class="marked-color-cell" style="position:relative;min-width:0;">
            <input type="hidden" class="marked-color-value" value="${Utils.escapeHTML ? Utils.escapeHTML(color) : color}">
            <button
              type="button"
              class="marked-color-swatch"
              aria-label="设置标记颜色"
              data-default-color="${effectiveColor}"
              style="width:100%;height:31px;padding:0;border:1px solid #a98f7a;border-radius:8px;box-sizing:border-box;background:${effectiveColor};cursor:pointer;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.42);"
            ></button>
            <div class="marked-color-popover" style="display:none;position:absolute;right:0;z-index:12;width:220px;padding:10px;border:1px solid #bfa58f;border-radius:10px;background:var(--xdex-sp-panel-bg);box-shadow:0 8px 18px var(--xdex-sp-shadow);">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <div class="marked-color-preview" style="width:30px;height:30px;flex:0 0 30px;border:1px solid #a98f7a;border-radius:8px;background:${effectiveColor};box-shadow:inset 0 0 0 1px rgba(255,255,255,0.42);"></div>
                <div style="min-width:0;flex:1;">
                  <div class="marked-color-status" style="font-size:12px;line-height:1.25;color:#6f5d50;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">#RRGGBB，自定义为空时按默认序列</div>
                  <div class="marked-color-default-hint" style="font-size:11px;line-height:1.25;color:#8a7768;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">默认 ${effectiveColor}</div>
                </div>
              </div>
              <div class="marked-color-sv" style="position:relative;height:110px;border:1px solid #a98f7a;border-radius:8px;cursor:crosshair;overflow:hidden;background:linear-gradient(to top, #000 0%, transparent 100%), linear-gradient(to right, #fff 0%, hsl(0,100%,50%) 100%);margin-bottom:8px;">
                <div class="marked-color-sv-thumb" style="position:absolute;left:100%;top:0;width:12px;height:12px;margin-left:-6px;margin-top:-6px;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 1px rgba(0,0,0,0.35);pointer-events:none;background:transparent;"></div>
              </div>
              <div class="marked-color-hue" style="position:relative;height:14px;border:1px solid #a98f7a;border-radius:999px;cursor:pointer;overflow:hidden;background:linear-gradient(to right, #FF0000 0%, #FFFF00 16.66%, #00FF00 33.33%, #00FFFF 50%, #0000FF 66.66%, #FF00FF 83.33%, #FF0000 100%);margin-bottom:8px;">
                <div class="marked-color-hue-thumb" style="position:absolute;left:0;top:50%;width:12px;height:12px;margin-left:-6px;margin-top:-6px;border:2px solid #fff;border-radius:50%;box-sizing:border-box;box-shadow:0 0 0 1px rgba(0,0,0,0.35);pointer-events:none;background:transparent;"></div>
              </div>
              <div style="display:flex;gap:6px;margin-bottom:8px;">
                <button type="button" class="marked-color-format" data-format="hex" style="flex:1;padding:4px 0;border:1px solid #7da6bf;border-radius:8px;background:#66CCFF;color:#fff;cursor:pointer;">HEX</button>
                <button type="button" class="marked-color-format" data-format="rgb" style="flex:1;padding:4px 0;border:1px solid #a98f7a;border-radius:8px;background:#F0E0D6;color:#6f5d50;cursor:pointer;">RGB</button>
              </div>
              <input class="marked-color-input" style="width:100%;min-width:0;padding:5px 8px;box-sizing:border-box;border-radius:8px;margin-bottom:8px;" placeholder="#66CCFF" value="${Utils.escapeHTML ? Utils.escapeHTML(color) : color}">
              <div style="display:flex;gap:6px;">
                <button type="button" class="marked-color-clear" style="flex:1;padding:4px 0;border:1px solid #a98f7a;border-radius:8px;background:#F0E0D6;cursor:pointer;">恢复默认</button>
                <button type="button" class="marked-color-save" style="flex:1;padding:4px 0;border:1px solid #7da6bf;border-radius:8px;background:#66CCFF;color:#fff;cursor:pointer;">保存</button>
              </div>
            </div>
          </div>` : '';
    return `
      <div class="${type}-row" style="position:relative;margin:10px 0 8px;">
        <span style="position:absolute;top:-9px;left:10px;display:inline-block;padding:0 6px;font-size:12px;line-height:18px;border:1px solid #a98f7a;border-radius:999px;background:#F0E0D6;z-index:1;">#${index}</span>
        <button type="button" class="${type}-delete" style="position:absolute;top:-9px;right:10px;width:20px;height:20px;border:1px solid #a98f7a;border-radius:999px;background:#F0E0D6;line-height:16px;padding:0;font-size:14px;cursor:pointer;z-index:1;">×</button>
        <div style="display:grid;grid-template-columns:${gridTemplateColumns};gap:8px;align-items:flex-start;border:1px solid #bfa58f;border-radius:6px;padding:12px 10px 10px;background:rgba(255,255,255,0.18);box-sizing:border-box;width:100%;">
          <input class="${type}-desc-input" style="width:100%;min-width:0;padding:5px 8px;box-sizing:border-box;border-radius:8px;" placeholder="备注（可选）" value="${Utils.escapeHTML ? Utils.escapeHTML(desc) : desc}">
          <input class="${type}-cookies-input" style="width:100%;min-width:0;padding:5px 8px;box-sizing:border-box;border-radius:8px;" placeholder="3-7位饼干ID1,饼干ID2" value="${Utils.escapeHTML ? Utils.escapeHTML(cookieText) : cookieText}">
${markedSwatchHtml}
        </div>
      </div>`;
  }

  function normalizeThreadCookieWhitelistGroups(val) {
    if (!Array.isArray(val)) return [];
    return val.map((g) => ({
      desc: typeof g.desc === 'string' && isValidDesc(g.desc.trim()) ? g.desc.trim() : '',
      threads: Array.isArray(g.threads) ? [...new Set(g.threads.filter(isValidThreadId))] : [],
      cookies: Array.isArray(g.cookies) ? [...new Set(g.cookies.filter(Utils.cookieLegal))] : [],
    })).filter((g) => g.threads.length && g.cookies.length);
  }

  function mergeThreadCookieWhitelistGroups(groups) {
    const threadOrder = [];
    const threadToState = new Map();
    const mergeEvents = [];

    groups.forEach((group, idx) => {
      const desc = typeof group.desc === 'string' && isValidDesc(group.desc.trim()) ? group.desc.trim() : '';
      const cookies = [...new Set((group.cookies || []).filter(Utils.cookieLegal))];
      const threads = [...new Set((group.threads || []).filter(isValidThreadId))];
      threads.forEach((threadId) => {
        if (!threadToState.has(threadId)) {
          threadToState.set(threadId, { desc, cookies: new Set(), firstIndex: typeof group.rowIndex === 'number' ? group.rowIndex : idx });
          threadOrder.push(threadId);
        } else {
          mergeEvents.push({
            threadId,
            rowIndex: typeof group.rowIndex === 'number' ? group.rowIndex : idx,
            desc,
            cookies,
          });
        }
        cookies.forEach((cookie) => threadToState.get(threadId).cookies.add(cookie));
      });
    });

    const grouped = new Map();
    const mergedGroups = [];

    threadOrder.forEach((threadId) => {
      const state = threadToState.get(threadId);
      const cookies = Array.from(state.cookies);
      const desc = state.desc || '';
      const key = `${desc}\u0002${cookies.slice().sort().join('\u0001')}`;
      if (!grouped.has(key)) {
        const group = { desc, threads: [], cookies };
        grouped.set(key, group);
        mergedGroups.push(group);
      }
      grouped.get(key).threads.push(threadId);
    });

    return {
      groups: mergedGroups,
      mergeEvents,
    };
  }

  // 兼容旧版本 blockedCookies 值到“组结构”
  function normalizeBlockedGroups(val) {
    if (!val) return [];
    if (typeof val === 'string') {
      const tokens = Utils.strToList(val);
      return tokens.map(t=>{
        const {desc, list} = parseDescAndListByLastColon(t);
        const id = list[0] || '';
        return id && Utils.cookieLegal(id) ? { desc, cookies:[id] } : null;
      }).filter(Boolean);
    }
    if (Array.isArray(val)) {
      if (val.length && 'cookies' in val[0]) {
        return val.map(g=>({
          desc: g.desc || '',
          cookies: Array.isArray(g.cookies) ? g.cookies.filter(Utils.cookieLegal) : []
        })).filter(g=>g.cookies.length);
      }
      if (val.length && 'cookie' in val[0]) {
        const map = new Map();
        val.forEach(({cookie, desc})=>{
          if (!Utils.cookieLegal(cookie)) return;
          const key = desc || '';
          if (!map.has(key)) map.set(key, []);
          map.get(key).push(cookie);
        });
        return [...map.entries()].map(([desc, cookies])=>({desc, cookies}));
      }
    }
    return [];
  }

  function escapeBlockedKeywordInputToken(keyword) {
    return String(keyword || '').trim().replace(/([\\,，])/g, '\\$1');
  }

  function joinBlockedKeywordInputTokens(keywords) {
    return keywords.map(escapeBlockedKeywordInputToken).filter(Boolean).join(',');
  }

  function normalizeBlockedKeywordGroupValue(group) {
    if (typeof group === 'string') return group.trim();
    if (Array.isArray(group)) return joinBlockedKeywordInputTokens(group);
    if (!group || typeof group !== 'object') return '';
    if (typeof group.value === 'string') return group.value.trim();
    if (typeof group.text === 'string') return group.text.trim();
    if (typeof group.keywords === 'string') return group.keywords.trim();
    if (Array.isArray(group.keywords)) return joinBlockedKeywordInputTokens(group.keywords);
    return '';
  }

  function normalizeBlockedKeywordGroups(val) {
    if (!val) return [];
    if (typeof val === 'string') {
      const value = normalizeBlockedKeywordGroupValue(val);
      return Utils.strToList(value).length ? [{ value }] : [];
    }
    if (!Array.isArray(val)) return [];
    return val.map((group) => {
      const value = normalizeBlockedKeywordGroupValue(group);
      return { value };
    }).filter((group) => Utils.strToList(group.value).length);
  }

  function flattenBlockedKeywords(groups) {
    return [...new Set(normalizeBlockedKeywordGroups(groups).flatMap((group) => Utils.strToList(group.value)))];
  }

  function isEightDigitKeyword(keyword) {
    return /^\d{8}$/.test(String(keyword || '').trim());
  }

  function normalizeMarkedGroups(val) {
    if (!val) return [];
    if (typeof val === 'string') {
      const tokens = Utils.strToList(val);
        return tokens.map(t => {
          const { desc, list } = parseDescAndListByLastColon(t);
          const cookies = list.filter(Utils.cookieLegal);
          return cookies.length ? { desc, color: '', cookies } : null;
        }).filter(Boolean);
      }
      if (Array.isArray(val)) {
        if (val.length && 'cookies' in val[0]) {
          return val.map(g => ({
            desc: typeof g.desc === 'string' && isValidDesc(g.desc.trim()) ? g.desc.trim() : '',
            color: normalizeHexColor(g.color),
            cookies: Array.isArray(g.cookies) ? [...new Set(g.cookies.filter(Utils.cookieLegal))] : []
          })).filter(g => g.cookies.length);
        }
      if (val.length && 'cookie' in val[0]) {
        const map = new Map();
        val.forEach(({ cookie, desc }) => {
          if (!Utils.cookieLegal(cookie)) return;
          const key = typeof desc === 'string' && isValidDesc(desc.trim()) ? desc.trim() : '';
          if (!map.has(key)) map.set(key, []);
          map.get(key).push(cookie);
        });
        return [...map.entries()].map(([desc, cookies]) => ({ desc, color: '', cookies: [...new Set(cookies)] }));
      }
    }
    return [];
  }
  // 双刷新支持：如果上一次保存设置时要求执行第二次重载（localStorage 标记），
  // 则在页面加载时触发第二次重载并清理标记。
  try {
    const _flag = localStorage.getItem('myScriptSettings_doSecondReload');
    if (_flag === '1') {
      localStorage.removeItem('myScriptSettings_doSecondReload');
      console.log('[Settings] detected second-reload flag, performing second reload');
      // 延迟短暂时间以让页面先完成初始化任务，再执行第二次重载
      setTimeout(() => { try { location.reload(); } catch (e) { console.warn(e); } }, 200);
    }
  } catch (e) { /* ignore */ }
  /* --------------------------------------------------
   * tag 1. 设置面板
   * -------------------------------------------------- */
  const SETTINGS_BUTTON_ICON_32 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAuIwAALiMBeKU/dgAACkBJREFUeJy1l3twU3UWx+soPphZd3Udl3XYdZxdfMz6nF1n1BnHXR/soi5EQBaxFkQB0UHXVUFAiyWBIhZZoLUItAVKIfRBaXuT9JFnkyZNbto0zyb35p3cVx6l0IKKytlzb0stD/lHNzOfSXPzy/l+f+f8HqcFBf/HV6xxtsTP/uJDO25gqaoZHH3obj5UeXuW2nXTxWPCjS8U0A2y+5HHkCk/izAX2D6FjTbOZNP2vWwm6mIzcQ8rROws5+9iEx3v8vSeu86PRdFpiAZJIc/+dPHgrn9yKQvP8jSwOQHYfB4ZGn/Pjz3jvEk+Wv+3SQaOIcPi3+KzBlp2Qz0t+8MVhejVsjuQe8NrZDPEz0HHlgIu1vZXJt33LRUjwTRoBiJgho5eNWidnWAIWYGkSQin/JDmKckEF29+vL//86vCDbJrUHz6UVr2NFKOMOPceCUDzyPTkVnh1bJrGPrwrSzraWW4AGj79dA5oAU7ZQNf2AMe2g2WsAM6fN3QbtOBPURCSjQh0EmXv271QcOWWxTHSwpQsASBScz9UQMoOmvcyDO7mzfcru0/siaZcuSotAeMQTOE4k5IcmIZeGCyHMSFJFBsFHQ+Gxx394A/QgKbTUE0pk+ZnZW7jpm3/VkURLhJBjZfKQMPBNfOfU69c0WRsnuHPBBstgX8WognbMBmksCKM8ymse45NJGdWANpNONLeEFj14EvYgZOCDN8vG2hiSybv8Pwwfy6wQVrUbgCeQrXwbUXiCbnvlFAy1ZMRx4kl6+6upSQ34MsCQ0qC2PUcY6idMAke1GYRQMR4DIJFM+MfRbf81mJdCYO9mAvtJMaSLO+b+iI/l0tWXNzqWrjy2Wd62dVOV/7xeVnLVsxFalEKN1H7z+jNG5Zbe3bWcgmDPXpFAkMNwhMwgQcF4KMQAOPKZYyIBqQSEslkUwIEXC7tVgC+whFt7lae2sVOJmbkFnIfZc1EJGtuBrFixHnFweLX96vL33A6Kx5KRhsDLJJI8VmUAAXYZbzw8lsAgRJLCfVWuAHgctxWJ4oZiY6lo0sgxmzDHMRZbnXW9kqJ6pnovhU5PUfrb34wgHTkQX4g98jCxiq7t10rItlhDgG5WAYBc4MZSGfTUoiooEhgcLnYchgFnixNLwfM+aFVKrvHB9tjgt01R6Fqvp5jPcXjP0wMkddbJ+mKbZfP57+milhWc005Eb8sriUKL1FFEceTAZrl7vsdQOBkBsYPICGUfjMiSEYzfPAp51YkgBkeB+M5FL4jIMhNJhifTAQ7gFXb+3XubT5TD6pt2xrr5qB8WQKYu+vUGNji7x7BZp4CJlaEJZV34rMtr65+z78skSuqpmGg5/e1Vl1m0p95KMm5dZ37KR+mM2kIIclOHMiJ5k4iWInhBBkGRKGBT+M5tKQY9wQTLpg25H94CPrY/mUPjKUtuWTEdXCzarqRzHujO312//esLXjVRSfidxTEJtTXRCVVV+ztUUxGw2Iqb8PuVdeTsxAHvfbyq6LBpvXsEzfiJBywEg2jgbykomxbHBweigjGRLSJLj6tWCxagyZmOrRE4ytcZhzscOsO0eHTV0HTIf/gaLvHFcYnfi+Fflkcv2Ltqg2XYUZeAi5E8XnINItx8VbfsdFG1SxQNPZk7gLzmdhMkO4U9Jxy7lUwjacoNVP5eKqhblE+5doYuBUJgI5Pvy1mjxegqLzDu1q+rxV3i2W4JcFe2ThO5E5pa2bFotiOPsn0MBvULxIXtEumeODO6bS3oNrbKaqUcqjgiRthVM59ocsYPozWPt4nDw3MNA+FPFWv3OC6THlk6b4Sd7/1SjunJFc4mxHv+aAGG/zvoNvlbYpbpaCo/ivkbvwQZH4WaGqeVqu3n+TvFz1ihDaOSXkrv2T3a4qN/SYvFpT53dWaxt4XW3fn8RZncb0iyURDQjpAQj4dYDjzvX0diUSlLYaDbxwkvM0jeIiPT0kfO8MaHGZ259TbDI2bP6y7rcXb8FXxjPwpFxdc0tpZetSh61FgwG/7jTbYDJGqwGYuE8yIGbgdF4ALtkPJKmeGKOzmIftdmJt1H/44YjfwLudNthdsfW78m2d59BEUl7seET+kfVSA+sJ5RPLCPOTH9bqN5iMxFcXi2stFrD0GrHe/vES5KVtmGdD4MabcvJYk1XP2W0tH++rVLiL166FooVLobq86is0MIIUKood111g4E2i9drFhGP1a0TP/Dfq7C+o25vtBrPhgqB9fSZIx3xwStoNY/UfzTFYCgbCIdcFYzVaE+iPHeE+2yRP/LtwJby1aDlsLnlvtLSsw4kGqpE7C2QEvQ55ajmhWfEvYkC5jOieWUj0leCz4vJWNemwNOUngnabgXLp4BQXHUs9noojUn0zkMWb0GUlfhDv1IP20Jeeg/sOVJeUfFA2f34RzJ7zMpRsePvb7XvrD6N4G/KsaOCPyP0vEr5H1xDV++YRg4Xr1E0r20jlfwJR6ygdsILRbJSCHiNUYNMehXzSIy4qPANY6RzIxgehsXYnaLraQKMzgq6rHfrNGvCHuvwd1raWaLB9JeXRfeN3mSERNYwe1SjLlAc6PjzwRceDooGZyIvI/FVE08dvEKql27o79zvoXoYXYsCxceh36CQDh5ua4NDuUohh83Eaj+MRvH5DePWWl22Eisod0K5WAWnqhDgdwAsrAxzelAmeOhuOdtO4E86JWRNSHtD3mM64zEor3V3xGBoI34bi9yB3v05oH3lTpa7U+nTtUYb6hs/EpEDRwR5c1Raoa2gA+fr3oM+kQXEGaGzRSj/5EJYtWwZtjbXg7NZAKkGDgA2KCI8XGB31g9dvlzIlGsgyfmky/aajPWHDzkdEA4vE2Y9lITyH6N1TFE66RkVhnseZ4LUr5DNAOdqghWiCD95/Gw5WyGHHp8Xw0qLFsHjJUthf+SnEcQGeFxaJpyLQQ9qgy2IFr9cp3aKigWGxt8TJ9OuUtbSxXMxA5CrkehFxN4Rp9TKGj56VZsC6JwKyuO/tpgY4slcBhyrWwaLCJSCbVwjln60H0nBs3OjYWA6z4xywQ5fZKs3W7ycn7o8RPMD0uKZchiOVdrdy3SU9QTRqUvM4e0FsNsTmY9KsaHcXfLZpHaxauRw2Fq+CPeUfQ8jbjf0fc8G4cNQuHkQTO2IwQE4c2+KOMfd0gd6lptooHX+BeMy1bVo8PfCdFAiv2slBpSykKagsV8CCRUugeMNaoEI9l4wZq30aNIMG0JFaMGG7HvDZxxctdk0sNq4BHSjpXuiLmk9NiBvU6wo8/rrdPB4oggiu8EuCY2ZsxmYo3VQMQcpzWfHzDKRc0BRxwtGwHeopMzRQFhR1QH3EBV1xD0R43GHcoHnCgNu77w46Zh6RAmCdJBOXCZyO9EPIY7qiuIA3pbiA49jEUnho+dkI+LkYBLk4RPH/CC7LS2sGs/HfCQOk79ASBltuKQAesxfX/3wG0qFuSIWubIDnsXzYqIo9otjATl6gE2MyyTMs4371f1z0RWiHZ4pgAAAAAElFTkSuQmCC';
  const SETTINGS_BUTTON_ICON_64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAHVVJREFUeJztewl0G/W9LkmA5raldKX0Ao+errzS0ntvOa/tLfRyeb20r9DYgUIuSUggkA0SAiSQFEISIie2yeJ4i7d4je14X0eWN1m7ZHmXJUuWNNo1iySvCSkJTfJ7v/9IdqR4ycI9r+edc+ec72hGM575f99vHyW33fbf239v/99urpoVS/7ea7jpzd+fsYQZTl/mM6bdETBm3DIBuib+cXt1fC9dHb/GURN/+3/lGv9LN0tP8hLWkvIgZy96kXM1Slh3i4P1Sj/hvLJPOU/nGOduMXJuSsK7GpJZW8lz/Gjmv4Rs6Xcsdk8k/UMk34QAxEVEPX733f9HlG5scxuOLWPNKfdy1pOPs562DpY1TLMhBtjxMcT4VYyFgA1xwAacwHIj51mfjubtp0Qhe/pPnOaMOfdFol9AwhmI6YgABH/D7x/9O9CcuwVGU28PWFN/zNvyPuacjS2sS9zNcqYL7Fgwlvi8QHGISExPgHPVVwdsGT+/9v7o+l9CwlURy88IoCPf/z34xmwBa9odnL04j3G1nmdYCzCcDdigHxjeAV7cd+J3TsYCLnYUvH48z9N43hf2gmvFCPHAemTneFvO20Fb+j9EPwfJfgEt/iQSVyKGEE/MnKuyx99RaY+/Dz9XIRJxf+3nJkbvjruD3h3/CP1e/I/wc8H45K3pTzM+/UWGNQOB362EXloGrbQGGu1aaDDJQaJrAaq/A7qUzdBpkIHCoYYhpxxcHh0wATfCAYx/EMWzojAB9Ia+i7w9f9eYPf0L1z4Pid+H+CmKsbzWEb8Myf4BkYtQI84jADFS5Yq79WqBpB+yvxe/E/EWYjcKsJXePbf8BO3pX2GdDSVk4X4k4GOGQWbvgiZ9O5zpU0FZnwaqVDJoaJNAQ3srNLZKoFrVBRUGFVSNqkA8imLZZOBwydEz7CiABfOCC0jocF75CG/P/VXAnr5svjVW2VcuRaJpiIEI8SsR8gQXquj4B2+JPBL+AWIv4p8EMfY8QwR5AkXIdO1ZOSsCYz7xFdZRs4Xl7eeJ9fy8E7T97VCllkGtvBMqjSqoo9UgcfRAl00HapMSlIMykJhQFHs3nDFooEYphdquDqhTdIDe3AUOEkLsSDg5Ek/wq31uW+mhkq6kBxOpg0uj11lLP78kYnVYAAerHStvvlQi8ScQK5DwrPvR78Utxe9Ujt3xs3HJ2Ip+w3o6u9igFxi0PO0fgRZtG1R0K6Gltx26R8VgdbbhOQOwPOYFzAksWtiNYg27VCB3aqHFqIQ6VUfYQzQYIhg2Ho7GcOjFfMAi/ODxyC509aSeONV5+NEkSvTl6LWilTcuIkAL4ua9AIn+b8RTjihrR75vQ1HuIvuJlOj7o9ZaOcPbLjG+Hly0DbQODVQY1aC1SsDhHQA/fs8GPfNn/jEsgSich7PDkA2FGJJB6YAOygc1ILepUCwMB9aE14YE8VwO8WX1QLatuCspD5/91VkB7HFfRpK+BQTwIt6+aQGQ5E/R5Xcivh/13fdRAAlaYBkuYEt62yEbw/SBP0AD7WgFs98IraMSMNFtQnZnOEyIeO76JTAMPzcKNUi8yNgLjZIW0AzVA8saw/kAz3N+/QWGrjnvHC290qD+WJUiSfj3mbUhyYwFBOAq6fi/3LwH7BbcfRXiL4g/IZ5HHGw9selHSH5fslh0smcou86Pbm82d4J5pBNcbgXY3BrBbUmZY3x9kcXfSB8QBol/BYpQq+mCaoUU+gYlmFQHwz1CwPkZ72l5Gxulxx0jqe/r+o9VlMqStiaKRaT8PYOYjpB2IjoRf8FyeG+t/9mb5i9s7t3xS9AD7kXijyF+WZX75s+QfB1i1+DgsSdZd7vMPloNSm0dWEaUSFgvZG4Cv7cnTD7oBk7oAmfcnl9cBDzvxb9TY2UgOaFZ0QYGazMQoUn+4LzSap7OfzixWbQsSSz6H7iWFMSxYsO6B5HsAST9AeJRzAvfqqY/Rwm8dsOHfBkhijzwXtaSvp1xtXmMw+Ug7WvF+JSD36MIk8AGhwl4wrGP4EK+qCaHtL6OhQUIefH8KDZNJmgdaoXyXjW0GyVg96jD9/IqGJwd4iJrWoL4n4jGJPHBTeWWF4gI37hlknT85m/Z4zdvQRxCPOaI33x75EE/RBxC7CDH43TG11hnY5vfXn3F4WgAj38IS5Ue/E6JkLiEzE3IkIaGlDJCKnoO4EfDLo3JjQs653oFJkeOxzLIGkA5IoWmdjHo+yWCAKQ8Wu2thqOS/IdEzQVCSUxsPEhy0nGSlxDf/DwCrELiEwhAtODxd5KbRLcdEYt24Y1PI+4n12F7+gjjaBjx2htwQYawVZl+FKAVS1dfuJHB+s37upEILRDkZkSZ6fvJNYLF/cAF7OF6H+MJKBA7CE6XGtSddaBUNQgVA4U+73F2fJYvzcsRUQUPJzQXLIkY6Z8RZxDP37IASDo9Qp7Aj/hXvOGj5fIk6eBgyvGANXMXay9NxrovZ9jhC2GLhFtfEuuMR0qmOqHmcyjE2ZATgjPNzLVWJj3BTG5AD+F4Y8RToj0hKNzPieE1YqgRcgrnkVTyrvpSTX/+uZOdpyQowg8jAixFPIOowPzwrVsV4GmEBRFEFObn7v0zuWEyJfr2hCPzbs6a9XtZf2n7gKnGzzprtayL8gm9Ox+JaeINpG4j+XNjPvjr5ASM8Zaw5YQQiAoD9IAgWjh8bjxc6wNW9AY6/F30kITEiaiMRwacm2rg6eKXeFv6keHhk4aM9nwxivDtGQ643v+FyEY8cCsC3IVuvw4/D/Rv2Easn4Y4MHMeH3QfQirtyT/BWXOP8t52tdDhhfjZBEcalwBWA0KeYCpgA35GAIFURAgsbRMBC4Q4YyRJhsUh4cBxpogQnquiobcwfhJm1EXsPkcCtvRs3paRc1qeV4treh/zQThfNQqeQBqlN0mluCVPiCj5W0Q64hGBvLhwOT7oY5G44AXGkvErjq7ScnTFWFgAfzgPCNZywyQufkaA8+M8hHjrlVkrj0XcHq8ZYwfg/EQQr7cCj6RnQ4IIhSHFovdwbA8KgiUw5BGe4/dqPmNs5V7OktrFj6aWGYazHsN11eD6no5a+9ORnPXDzyNAEuKpRIloScT6jyH5ZLLPWU4s451VH7OOxgkGuzfG1xu2FCl9aKXpMe+sAARngw6hKxSmO9wXiCICXkWUUBxMcoNIeADP+WJyARekgWN0gB4HvEeCpbAVWNspJmBNP8qZU7+Ja7sLUYkifCOy9i9FKsLmln36f0T8DnH3DZPHVvfr+MflMyUFif8AH3AQ8VtybOs/fqdpoGyXm26nNYpysOGUN2N9MsBMobWiBSAI+buBdXcJZZFDiwsJj3jAOBtzXViIIWDcUox5NVpcC7RLBgp5CRgHqoF1tVwc98onzgYt/KSvPZG3pn0xYqDtuM5nEcsjIpD+oFB8QBuH5Fsk+/TbJPt65p8K7fGFP6HjC3fS8QXfi/zxOsTWw1gCIzdfh8hGCK+eGHP6i+6RQoXbUibKydx7SSqtizRAHiFZjSPBawX4BImO+3sg4O4EnrS2JM45A4QYPYZBKEqAAIyTGYIMQgEvDLu7ocvQCvWNJ8E2VMDz7s4LY96OsSkMiwmfkuftBc9E1vgI4jjinyIc7iAhXHW05SSSX4FYh0LsFu/rju0OHXH5S5H4ayjA4/i5Af9oOSKLKDhzjYgqTMAbbxaJ82/DavAdvaqgtaP99MGB7vwHc9J3e/JOpYcTIXkFho1KAHuCawX46+S4IMIUZv4p7PSCDLbKWDY5Zy1MMlo8PyZcN425gXNJhVdqDJbONrscDpWdgoyswxB0y6Ymmb4rk0z3lSnecGU6YLk85m5q9Y+cuAstT8IgH7Fq1pObElbXJnWUI/lvovXvQQHScf+3MQJY/k8+NkCFcegFm/HzKSS+gmTRq+QL7sHYyk4QFwrWF2VQdyJKEMKUWFbw/oaivA99dpsmEgbo4h4ljPvUQoKbK8SMR3AYFnr4dGpKsLogECbIMa8avWIAQ2kAzKY22HsqC/YeSoTW5hzdpKd+17gj948B+nTmmKfzHBFzGqtMyNVo5a3ZvzjUUriCeMHM2sX7dU+VpzYoqo9I/g0F+DHiARQhGfFbFGL5rAiuuIJljviCB8yr8kkJ+RDxUZQA/0Hia/Y4g3oEUYgQbjCiO/qAQZOy32mTTJIcQOaAALp4yNMJ50LuBQUQSiS68V8nJ2ePz2HjNI0JL8AO41yhhr7uekhIPg4yuXjCPNy0GbP+HSF300sTfl3fdGD0s7NB22UiwLhPByFnbVVXb+Hjh8UFJWisO1s+7F6CRPfXH+6aaP5IrcD904ijiFJEDuJHc3IB1s3lQieFOWCWsLgQk1/hI1EC5CJi3raG7Bl34ZRWwrrbLrEe2YVwk2PA7E8vKsCM28ckS2YIE58OfPZ6/OwFJshc9rhUH9PGkvs5W8kjU5zBMsX2uMc94uMTPsUkIT/NW1E812eTfpmiQn1aTfIAWvhbSLITAYhPEcOICiIK4jnEvXMFwO4JUYx4khwfpAq+jAKUiepPCQ1FQqZ4GZKfRvzjtX/LmFMf5NziIf9IWoVnOPUyg3NCCDu3c9eUxEU9AgcgH42jr7MNfB7tFZ+r65LPPzLsMOQ8RJ4x7m5JHvdKx8ZctesDdMUH417F36axcZrxItJzDIw0T6MAryLBr6MIq06W5IiSGw7XkKQ4h/DMdireMiPAzxPFoqOIn0es/wu8WfrMdQmZ1E+QvF2U2TrvnM3bc1/3mjLbZeLDkyxdi5ax3DD5v06MYZXAidKPLS8mU4e1dQwHqytO85k3Ohr2LAmMpn0haMt6KUifSQzQleUYPpeneTMm0F4gn4Q8EcLt6JwgDVuUUf+AKEPcMy/53HjHA3nx9F7EF/Gix0kOSKISvisIQBXEowiimWuR/ApE2UJCBm0Z3+ZGM94V14qmhrRZlwOYDElW/2TcDxM41Ezj6DsfeZIsp/F8wNcjlD6PSwfm4UYwDYvBOlSYxI9m/Hrc0/LxNG+ynAvSn05ikiTihnPIOO6PYgiEPW3cr/HjuktEzfnh1rgq5YnEuiPFSWLRD+ZdNBL/aW48LUUh7hY6P0q0EwW4JyLAa5hQZt+nIfmNogzx/mvvwVnSlmKC+s3IYKlF2916RaHpgOqyw6CQJABVmwDi2kSg0a0DrHFe8hPYPJ3DChAkXSVjAnq0Ewx9Z6BdpQO5VgYOY8E5jPlPMMYvBh3VZt5aIEP3nzw/MTabTGcqzjTXf+5wS8EZFOBrwpoPaJsPHRNbEpsSfraQ4W6ren5qxl2eEYYISvS1iABvoAfsihJgBwogvBSh9cfJz2HfGDWcfn14oLoNiV8gC76KbpBpFNDT0wx6PQW8W3ZxGhsk4qpksaRCEMtNY9zPJMMQHjusEjAO1kOHSjt7ry7hPk1u61DRr93D4R9IUIgnJv1aHWmiJvxXhy/ibZQury2rrvzHCfv0O0WYBBNESufh9Nrr/4CKxP+E2I7V4KsRAV5HD3g3SoDtiHf40bQvuk25rxj6qxsU2q5PO9VqiCV/FeRcTw8FQwPiy36HCs6iCFM4+2PWRiECMd4wht3hiKEe+nvr5tyHCNKtFw+jCE+xlrTlvDV1+Zi7YdW5ED1NKkH0fUaHSvw1ZYXihP36ABEAMSXa3/2HGxGATFE7EF+PCPCqKDYEXsNE+BE9nP+WvoeyIvkLCxGPhlrXAUqdDKwWrdDsfCK8KxiPCoOQgAl05eHBBkJ03vtI1apLfb0NSquh6DmynpCj6L4Jbwc15lXOltWQzwjpKR9cSjmSfPFYovpKRIDLiHduRIAnEbsR90UE+CMKkBglwFNZxdW+ga7yv0W76PXQpZYL4dA3oJtNVtEg34WFYcBiqAAVCra4oO2f2YeLXkRPvNvSn/OolEqCjpYzkHJ0P6zf8Co8vWI1vP3mNjh5goKIAIieftFe7dKF2YcF+DV5AYLT4PcjAvxLAlWYHk/Rd8dT9oc2nulbvydf6unuPD0lVSlviDwJAY1OAgqtAoYNSmyO5naHZ7FShNvhCfDZKEDvuu59B/oaBlGE1cM9uc9v27YJ1qx5GVbEr4U/Ivk1f34Fdm97HbLTSv92VQD9ecT91xPgYUQq4hfk+IC49Cu7qMZSJJ+PSF7ZbN+57bQuWN1ebVCrWm9IgO5uCpOaGMdbI0ywpjntMRmQsK2dPZ7ESjAyLL2+sCrVFY283t9cVyRPOPgWvLLqVXh99SbYsXYL7Fm/Dfa9th0aio6YkbR1RoSEfT0HrifAvZH3AL+Pa6ZvR8vveZEy+N4Utz0WFQa5ZWVlWQPqM4xMLVt0kTKNHHyObsG1Z1z92hAY8yhjjqdwmLKYFNcVgKqnoDUt9UplyenPqDMi58ENO2DfK29C0sZ34I01m2H9CxsgO/29T5JOVr+TkNQ54wXjon3dVztCtOrDSHL2l97E5oO3I/mSj6ij7+C5XXju0FuUeDuGwo5nxfY74yjHV/eckv5bck5TjUV2kupWNV1cbJFaFQVjzt7ZeZ+Uv+gJkbj+tR4R8g2DYaBtwXu2KjTQ3NwKHTkpPllZtjg5u7HEpDlStOq59bDzpdfhnZe2CjngT3FrYO8Hb8CpjsTKw6XZ5Ui+P5ILfhctwElEHhLdgJ+/wc9/3US1lq+n1AN4vBWPv7aRUt2/iVIaV1L2Ivwum4TD5upea7vytNSoLBhfVIDOQhh3DsRk/OhxmAwxscnQA3ZlOXTrmue9n1iqgPr8YpDmp07oatLWHc2t340e+UrAlrbjhRfXQRzmgD+vXAd/+NOLEP/ntZCVtvtC6qlK66ETTYeR/GZEEAVIwVBYGhGA/iUSWo84gPsnEMdXU715b1I1g89Slnvw+Gd4LhFF0KMImbj/u/+kTM/kaST9MpN4YlRbclGh6Zp3saRKNJYnw7hrMEIu1tLngq6YcCD7nKEVZA0ZoNR2zrlfm1ID9UXFoKjOAmNXujqzsObJyGT66Bid/pOSU/vO79q5FTZveQ32f7gDyoqSoEed7U4qPqVIEKleRuLYFPUMIhoT9vXeHRHAMWdCSqIOLj1MJSRtoGQiJJyL+A+RuCAOUdCqOfm41lRh6nWqhBegPGcDQ0cZdKnmxqxaK4GEvTuAt2kEtz8bcggJb8bS01GvzaaYUdA3Z8HhD9+ChoaiWKu3d0FTZQV0nM4Dr7ETnB4V9DqkIO+rmmyQVlOW4RyhZE9zg5Pk/eInQoPFhxsiW8ulWsXx4+aB00+ODJT+u8eY/s/6ztIvHdyrmw2Bo2jl38c308LbnnixYwl+9721VPfxVyi5chVl+B6KtPQAVXLvsdbCd6n+crvRIQcOM3UgxEJgfAycvfXQJ62eI4C8qwze2LQJRnWV2KqGfyghb4eFfl2YEiN9PDsC3Y0n4c03NsPW1zeCTN05G+vlZVXQWZoLFp0Y/K5h4XkEfNADVq8eBuzUefVobafPkrlimhu+eG2YeR1qLL/tU0qtdEyhlYYsshw7Zz7xRFQOoHciMpB0MeIY7qchcJ8+8gGVVXmISnwQBfjqs5R1//tSlUY10niFC7iAx+QVCPlwMePA2PVgls/1AnFTLrz88gbQi/Ngwt0vkA+PrOgB44wwB4x7dGDvKoIP390Occ+thSMf78XQ0YC4Uw51BcWgqckB+6AMON4DgbGQ8LwZ8CE/eDkLmJztl5SWOgPOFFeuFcDv7IlZk0mSC4wpZXWMy8c1OEkofBHxXcR34ihaGCP3Uye2bKTaGldS1tNHlPLtvSPVMjczEn64IIA3vJixADCOHhhUx/bvNZXH4ZmVa6Ay7UPgzao5Lz4YkwyaCw/D2nUvC83LwYPvQiNVDfVl5dBekgXOoXbgx4IxpGOA5xjOBRZsr7XoIWfnGbV5T1/MmiwtGcCMpDwV5QFzcwDZVoodSzEZbttAdXlfpaRbBk3FG0fs4mku6I0IYL8qADlGCzn6arBXv9od1lYeE7Jx8gdvw4i84mr2Jz+IjKqgsfAQbHz1VeGaVWvWw5kzWSCurwZFRQ64DVK0MLcweQwDj9cMRpMaew0lunmnkFfmCtAfk5TtrSeAG019OLoMzpsDEG8hPt5LZZ7AhJgxYqnQuL09kRgkAlhxgd6YBbGeARhQVGLrqwo3Kg3pArnVa9dDc94hYQCaYixgVZVD8v63gZQtcp4gNWUfNBbngbIyG1ifRbDuQuR5FNCJpVXVrcRnaYRnabpbUVj/3PeLvqsCkJHa0ZpyJWBLFypA0Jb2m9sE8hRdiWQDCCPu2xAWxL6VEiv51xf/kNeekD1qb8UH87OL4Nh+jEuL4P6zi5sYB2dPBfTKwqGgUxXD758JE9z33nZwqXNAV58EWzdvnCVO8M47W6CjLhv6GrOAwZK5sNWRfNAPRmOXMFhFu7YO2+1rR+vw26He2WuU2g6gm06cZa3vL/GbTixjhk8ULJoDyDagTLjDYMg5TP7lZ/RCOK8cvcA5Z4GMYwCs8lJQqKQ40DRDVeEHQoIrTN8DR0Vvw5qXXo4hv2nzayA5cwiUNbnA+rGyjIcWsTyL5NVkJJ5TcfqwEs28HYrJNZwBOtTaSFcqRgFSteP2jCW20VNrXd1phvnCP2ajB4/90mwuVcdYenwCOE97pAxes1CMW/+oBgYVVYKVOhsOgqn6GJjrj8Pe3W/AyufXzpJ/EUOjNG0P9DZlInnrbHjNb3mP8PvjfOQJhvpr5u02zwZtOIqH85JO2gROaUqGw5r3U6mV6jUMFZkXJZ997NXbjIbs3Q5azMRmXx54X9eCC+YYGuyqMiHmqOpDkC7aBflH90BbxQHIT90tZH0iwIG/bIe+phScEocWJU+8wunQQ3fv/B0ngXGwat6XrZ+MeUGuCQ9suo4G8Pac2Nlrr86psyk+7TVXtC0qgLk/9X7zSJnWy5hireHXQgAtsliskrJoVhRASXEKPB2/WiD8n5jpEz/aAS1V+0F04E2g+4qBZWyL3mcm6ZnMHaDSty8ogHmoCj6dmpwrAg5hmm7yd1rQK2qg11rJF9v7oMkmhQFbRcKiAhiHsh+3060Mw7uirB8A3ttx3UUHcNFuTT401GTGZPs/xq2GDz/YBkOadGC9fdex/NUKY/dgrTe1gLRbFgmD2LdRpsEFBED09lIg13WBfKgZSuw9UEL3Q6+96ZLDdnrz4h5gyt/r9g9ejilJLGbp4NzkNx9YnxH07WmweeuWWQGefeElqCo7gn3D6A2Sv+oFBrcOKke1IMYqIMVxWdMtAZWuHWNcAQO9dejurDBrkH6ANFpjzAC4sHRLza1Qa1FBkb0f8u2DoMc5xufpcrPOhqcWJD+sPrTcPFrr4QLuWOuzfTe8aAI3uu6RQ7sF4hs3b4HqyhzgAouHz8JexUKLXQWn6CHIow2QTw/CaVsPVNlUUGeTQ4NVBrX4WWVTI9m+2evIZwkeSxzd4CReR/7lmVd92mfJ+/GCAlj6jv/MQrddicn+2PuTf8dzM4tmPCNAnTkCm7H2l5RkgtdnvjXyEZhcMmi0K6Hc3o3EDALBhUDOF9t7oYHWg8KpB7c/snbyL9Q9KpHHlPntecnLWt6/vc9YeNjju8ba6Pp8wHGTVgtgi9wEjeXHwcfcWOgsfC8vVh8VitiNk2Av6B0ykNk7QGLtgGZrJzRau4CySqHV1gUKWoWujrnBZwAv7xBCaDacgu7PGLfsRUt/7vw/lroNxx/vM5Xq5/TiZAAiv93fzKJxgvP0NYJLW/z5yJMRmNFHPofQEDOJeUJ4BulSFx2covMJT3t9topfzUt+tDvpTr2pLMtil5yd88c4zgYC1y9bMQ8LsuA1UeAxNn8+8tjRkflDuCd6IY9j8K3ej2MG5S7D8fnd32LIfEg/Ujns8A/N44I4//PGGyePscZgvLr7ysGlL4HF2tzFRUTX581C7M6S4Mzzd6I3AL+jMbFXJpr/BxKtsWzFsI2a9nH2edwZEyLbe4OuHwDPMAUuTTEOQXn4iYOOQ3VriyahJ+SeqLKJ4clxI7cgphu8Izmz/3vi/wLKEJjy325E2wAAAABJRU5ErkJggg==';

  const SettingPanel = {
    key: 'myScriptSettings',
    defaults: {
      enableCookieSwitch: true,
      disableWatermark: true,
      // note: `duplicatePagination` 已弃用，使用 `enablePaginationDuplication`
      enablePaginationDuplication: true,
      updatePreviewCookie: true,
      hideEmptyTitleEmail: true,
      enableExternalImagePreview: true,  // 外部图床显示
      enableAutoCookieRefresh: true,
      enableAutoCookieRefreshToast: false,
      interceptReplyFormUnvcode: true, // 拦截回复中间页--unvcode
      interceptReplyFormU200B: true,
      interceptReplyFormAutoCompress: true,
      enableSeamlessPaging: true,
      enableAutoSeamlessPaging: true,
      enableHDImageAndLayoutFix: true,               // 启用高清图片链接
      enableLinkBlank: true, // 串页新标签打开
      enableAutoUrlLinkify: true,
      enableQuotePreview: true, // 优化引用弹窗
      enableUpdateCheck: true,
      enableImageContextMenu: true,
      enableImageHideMode: true, // 图片隐藏/无图模式
      applyImageHideMode: 'default', // default | blur | noimage | tips
      enableDraft: true,
      timeDisplayMode: 'relative', // relative | exact
      extendQuote: true, // 拓展引用格式
      enablePostExpandAll: true, // 默认展开板块页长串
      kaomojiSort: 'default', // 颜文字排序：default | freq | recent
      toggleSidebar: false, // 侧边栏收起功能
      postAfterAction: 'jump', // 发串后：jump=新标签页打开 / refresh=刷新页面回板块第一页
      threadCookieWhitelistGroups: [],
      threadCookieWhitelistDisplayMode: 'fold', // 只看饼干：fold | hide | column
      poAnnotationSideDisplayMode: 'collapse', // 分栏侧栏：collapse | expand
      replyModeDefault: '回复',   // 板块页默认模式：发串/回复
      replyExtraDefault: '临时',  // 板块/时间线默认额外模式：临时/连续
      markedGroups: [],
      blockedCookies: [],
      blockedKeywords: [],
      favoriteThreads: [],
      subscriptionFeeds: [],    // [{desc, uuid}, ...]
      blockDisplayMode: 'hide'  // fold = 折叠 | hide = 隐藏
    },
    state: {},

    // JSONC 解析（支持 // 注释和尾随逗号）
    parseJSONC(str) {
      const cleaned = str
        .replace(/\/\/.*$/gm, '')
        .replace(/,(\s*[}\]])/g, '$1');
      return JSON.parse(cleaned);
    },

    // 导出为 JSONC 字符串
    buildJSONC(state) {
      const lines = [
        '// X岛-EX 配置文件',
        '// 支持 // 注释和尾随逗号',
        '{',
        '  "_meta": {',
        `    "version": "${typeof VERSION !== 'undefined' ? VERSION : 'unknown'}",`,
        `    "exportedAt": "${new Date().toISOString()}",`,
        '    "source": "nmbxd-EX"',
        '  },',
        '  "settings": {',
      ];
      const entries = Object.entries(state);
      entries.forEach(([key, val], i) => {
        const json = JSON.stringify(val, null, 2);
        if (json.includes('\n')) {
          const indented = json.split('\n').map((line, li) => li === 0 ? line : '    ' + line).join('\n');
          lines.push(`    ${JSON.stringify(key)}: ${indented}${i < entries.length - 1 ? ',' : ''}`);
        } else {
          lines.push(`    ${JSON.stringify(key)}: ${json}${i < entries.length - 1 ? ',' : ''}`);
        }
      });
      lines.push('  },');
      lines.push('}');
      return lines.join('\n');
    },

    // 校验导入的配置
    validateImport(incoming) {
      if (typeof incoming !== 'object' || incoming === null) return { valid: false, error: '配置内容无效' };
      const defaults = this.defaults;
      const validated = {};
      let skipped = 0;
      for (const [key, val] of Object.entries(incoming)) {
        if (!(key in defaults)) continue;
        if (key === 'blockedKeywords') {
          if (typeof val !== 'string' && !Array.isArray(val)) { skipped++; continue; }
          validated[key] = normalizeBlockedKeywordGroups(val);
          continue;
        }
        if (typeof val !== typeof defaults[key]) { skipped++; continue; }
        if (Array.isArray(defaults[key]) && !Array.isArray(val)) { skipped++; continue; }
        validated[key] = val;
      }
      return { valid: true, merged: Object.assign({}, defaults, validated), skipped };
    },

    // 从文本导入（校验 + 暂存）
    importFromText(text) {
      let parsed;
      try {
        parsed = this.parseJSONC(text);
      } catch (e) {
        toast('配置文件格式错误'); return;
      }
      const incoming = parsed.settings || parsed;
      const result = this.validateImport(incoming);
      if (!result.valid) { toast(result.error); return; }
      this.__pendingImport = result.merged;
      const msg = result.skipped > 0
        ? `格式正确（${result.skipped} 个字段已跳过），请点击[应用]`
        : '格式正确，请点击[应用]';
      toast(msg);
      const btn = document.getElementById('btn_xdex_import_export');
      if (btn) btn.classList.remove('xdex-inv');
    },

    // 导出到剪贴板
    async exportToClipboard() {
      try {
        const jsonc = this.buildJSONC(this.state);
        await navigator.clipboard.writeText(jsonc);
        toast('配置已复制到剪贴板');
      } catch (e) {
        toast('复制失败，请重试');
      }
    },

    // 导出为文件
    exportToFile() {
      const jsonc = this.buildJSONC(this.state);
      const blob = new Blob([jsonc], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `x岛-ex-settings-v${typeof VERSION !== 'undefined' ? VERSION : 'unknown'}.jsonc`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast('配置已导出');
    },

    // 从剪贴板导入
    async importFromClipboard() {
      try {
        const text = await navigator.clipboard.readText();
        if (!text) { toast('剪贴板为空'); return; }
        this.importFromText(text);
      } catch (e) {
        toast('无法读取剪贴板，请先点击页面后再试');
      }
    },

    // 从文件导入
    importFromFile() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.jsonc,.txt';
      input.onchange = () => {
        if (!input.files || !input.files[0]) return;
        const reader = new FileReader();
        reader.onload = () => this.importFromText(reader.result);
        reader.readAsText(input.files[0]);
      };
      input.click();
    },

    syncAuxiliaryControls() {
      const whitelistModeSelect = document.getElementById('sp_threadCookieWhitelistDisplayMode');
      if (whitelistModeSelect) {
        whitelistModeSelect.value = (this.state && this.state.threadCookieWhitelistDisplayMode) || 'fold';
      }
      const poSideModeSelect = document.getElementById('sp_poAnnotationSideDisplayMode');
      if (poSideModeSelect) {
        poSideModeSelect.value = (this.state && this.state.poAnnotationSideDisplayMode) || 'collapse';
      }
      const draftSelect = document.getElementById('sp_enableDraftMode');
      if (draftSelect) {
        const enabled = !!(this.state && this.state.enableDraft);
        draftSelect.value = enabled ? 'off' : 'on';
      }
      const expandSelect = document.getElementById('sp_postExpandAllMode');
      if (expandSelect) {
        const enabled = !!(this.state && this.state.enablePostExpandAll);
        expandSelect.value = enabled ? 'expand' : 'collapse';
      }
      const timeDisplaySelect = document.getElementById('sp_timeDisplayMode');

      if (timeDisplaySelect) {
        timeDisplaySelect.value = (this.state && this.state.timeDisplayMode === 'exact') ? 'exact' : 'relative';
      }
      const postAfterSelect = document.getElementById('sp_postAfterAction');
      if (postAfterSelect) {
        postAfterSelect.value = (this.state && this.state.postAfterAction === 'refresh') ? 'refresh' : 'jump';
      }
    },

    init() {
      const saved = GM_getValue(this.key, {});
      const isFirstInit = Object.keys(saved).length === 0; // 判断是否首次初始化
      
      console.log('init读取的原始数据:', JSON.stringify(saved));
          this.state = Object.assign({}, this.defaults, saved);
          if (this.state.timeDisplayMode !== 'exact') this.state.timeDisplayMode = 'relative';
      // 该功能为固定启用项：避免历史配置把它保存为 false 导致下拉无法生效
      this.state.enableImageHideMode = true;
      console.log('init合并后的state:', JSON.stringify(this.state));
      
      // 兼容迁移：屏蔽饼干到组结构
      this.state.markedGroups = normalizeMarkedGroups(this.state.markedGroups);
      this.state.blockedCookies = normalizeBlockedGroups(this.state.blockedCookies);
      this.state.blockedKeywords = normalizeBlockedKeywordGroups(this.state.blockedKeywords);
      this.state.favoriteThreads = normalizeFavoriteThreads(this.state.favoriteThreads);
      this.state.threadCookieWhitelistGroups = normalizeThreadCookieWhitelistGroups(this.state.threadCookieWhitelistGroups);
      
      // 清理废弃字段
      const validKeys = Object.keys(this.defaults);
      let needCleanup = false;
      Object.keys(this.state).forEach(key => {
        if (!validKeys.includes(key)) {
          delete this.state[key];
          needCleanup = true;
        }
      });
      
      console.log('init清理后的state:', JSON.stringify(this.state));
      
      // 只在首次初始化或需要清理废弃字段时才保存
      if (isFirstInit || needCleanup) {
        console.log('首次初始化或需要清理，执行保存');
        GM_setValue(this.key, this.state);
      }

      this.render();
      GM_addValueChangeListener(this.key,(k,ov,nv,remote)=>{
        if(remote){
          this.state = Object.assign({}, this.defaults, nv);
          this.state.markedGroups = normalizeMarkedGroups(this.state.markedGroups);
          this.state.blockedCookies = normalizeBlockedGroups(this.state.blockedCookies);
          this.state.blockedKeywords = normalizeBlockedKeywordGroups(this.state.blockedKeywords);
          this.state.favoriteThreads = normalizeFavoriteThreads(this.state.favoriteThreads);
          this.state.threadCookieWhitelistGroups = normalizeThreadCookieWhitelistGroups(this.state.threadCookieWhitelistGroups);
          if (this.state.timeDisplayMode !== 'exact') this.state.timeDisplayMode = 'relative';
          this.syncInputs();
          this.syncAuxiliaryControls();
          try { renderFavoriteThreadsMenu(); } catch (e) {}
          try { refreshFilterDisplay(this.state); } catch (e) {}
          try { if (typeof window.__xdexApplyTimeDisplayMode === 'function') window.__xdexApplyTimeDisplayMode(document); } catch (e) {}
        }
      });
    },

    render() {
      if (!$('#xdex-setting-style').length) {
          $('head').append(`
              <style id="xdex-setting-style">
                  :root {
                      --xdex-sp-panel-bg: #FFFFEE;
                      --xdex-sp-fold-bg: #F0E0D6;
                      --xdex-sp-footer-bg: #FFFFEE;
                      --xdex-sp-border: #eee;
                      --xdex-sp-shadow: rgba(0,0,0,0.2);
                  }

                  :root.xdex-darkreader-active {
                      --xdex-sp-panel-bg: #2b2c2d;
                      --xdex-sp-fold-bg: #483327;
                      --xdex-sp-footer-bg: #2b2c2d;
                      --xdex-sp-border: #4b4d50;
                      --xdex-sp-shadow: rgba(0,0,0,0.55);
                  }

                  .xdex-inv {opacity:0;pointer-events:none;}

                  #sp_panel {
                      background: var(--xdex-sp-panel-bg) !important;
                      box-shadow: 0 2px 10px var(--xdex-sp-shadow) !important;
                  }

                  .sp_fold,
                  .sp_fold_head,
                  .sp_fold_body {
                      background: var(--xdex-sp-fold-bg) !important;
                      border-color: var(--xdex-sp-border) !important;
                  }

                  #sp_panel_footer {
                      background: var(--xdex-sp-footer-bg) !important;
                      border-top-color: var(--xdex-sp-border) !important;
                  }

                  /* 设置按钮样式：图标入口 */
                  #sp_btn {
                      position:fixed;
                      top:10px;
                      right:10px;
                      z-index:10000;
                      width:36px;
                      height:36px;
                      padding:2px;
                      border:none;
                      background:rgba(102,204,255,.92);
                      border-radius:50%;
                      display:flex;
                      align-items:center;
                      justify-content:center;
                      overflow:visible;
                      box-shadow:0 1px 4px rgba(0,0,0,.18);
                      transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
                      cursor:pointer;
                  }

                  #sp_btn:hover {
                      background:#66CCFF;
                      box-shadow:0 2px 8px rgba(0,0,0,.24);
                      transform:translateY(-1px);
                  }

                  #sp_btn img {
                      display:block;
                      width:32px;
                      height:32px;
                      pointer-events:none;
                      user-select:none;
                  }
                  #sp_btn.xdex-has-update::after {
                       content:'!';
                       position:absolute;
                       right:-6px;
                      top:-6px;
                      width:18px;
                      height:18px;
                      border-radius:50%;
                      background:#e53935;
                      color:#fff;
                      font-size:12px;
                      line-height:18px;
                      text-align:center;
                      font-weight:bold;
                      box-shadow:0 1px 4px rgba(0,0,0,.25);
                  }
                  #sp_panel_footer .sp_panel_links.xdex-update-highlight {
                       box-shadow: inset 0 0 0 2px #ff4d4f, 0 0 0 2px rgba(255,77,79,.18);
                       background: linear-gradient(90deg, rgba(255,77,79,.08), rgba(255,193,7,.08)) !important;
                       transition: box-shadow 0.2s ease, background 0.2s ease, filter 0.2s ease;
                  }
                  #sp_panel_footer .sp_panel_links.xdex-update-source-greasyfork {
                       box-shadow: inset 0 0 0 2px rgba(255,152,0,.68), 0 0 0 2px rgba(255,152,0,.16);
                  }
                  #sp_panel_footer .sp_panel_links.xdex-update-source-scriptcat {
                       box-shadow: inset 0 0 0 2px rgba(18,150,219,.68), 0 0 0 2px rgba(18,150,219,.16);
                  }
                  #sp_panel_footer .sp_panel_links a.xdex-update-link-primary {
                       color:#c62828 !important;
                       font-weight:700;
                       text-decoration:underline;
                       text-underline-offset:2px;
                  }
                  #sp_panel_footer .sp_panel_links a.xdex-update-link-secondary {
                       color:#8a1f1f !important;
                       font-weight:600;
                  }

                  #sp_panel_tab_slot {
                         position:absolute;
                         left:-112px;
                         top:48px;
                         width:112px;
                         display:flex;
                        flex-direction:column;
                         align-items:flex-end;
                         gap:6px;
                    }

                  #sp_panel_tab_slot:empty {
                        display:none;
                  }

                  #sp_panel_tab_slot .sp_panel_tab {
                         --sp-panel-tab-bg:#006666;
                         --sp-panel-tab-icon-size:28px;
                         --sp-panel-tab-label-width:4em;
                         --sp-panel-tab-collapsed-width:42px;
                         --sp-panel-tab-expanded-width:calc(var(--sp-panel-tab-icon-size) + var(--sp-panel-tab-label-width) + 20px);
                         width:var(--sp-panel-tab-collapsed-width);
                         min-height:50px;
                         padding:6px;
                         border:1px solid var(--xdex-sp-border);
                         border-right:none;
                        border-radius:999px 0 0 999px;
                        background:var(--sp-panel-tab-bg);
                        color:#fff;
                        cursor:pointer;
                         display:flex;
                         align-items:center;
                         justify-content:flex-start;
                         gap:8px;
                         overflow:hidden;
                         box-sizing:border-box;
                         transition:width .16s ease, filter .16s ease;
                    }

                  #sp_panel_tab_slot .sp_panel_tab[data-sp-module="settings"] {
                         --sp-panel-tab-bg:#006666;
                    }

                  #sp_panel_tab_slot .sp_panel_tab[data-sp-module="history"] {
                          --sp-panel-tab-bg:#0080FF;
                     }

                  #sp_panel_tab_slot .sp_panel_tab[data-sp-module="posts"] {
                          --sp-panel-tab-bg:#FFFF00;
                          color:#332200;
                     }

                  #sp_panel_tab_slot .sp_panel_tab[data-sp-module="feeds"] {
                          --sp-panel-tab-bg:#39C5BB;
                          color:#440022;
                     }

                  #sp_panel_tab_slot .sp_panel_tab.active,
                  #sp_panel_tab_slot .sp_panel_tab:hover,
                  #sp_panel_tab_slot .sp_panel_tab:focus,
                  #sp_panel_tab_slot .sp_panel_tab:focus-visible,
                  #sp_panel_tab_slot .sp_panel_tab.is-hover {
                         width:var(--sp-panel-tab-expanded-width);
                         font-weight:bold;
                    }

                  #sp_panel_tab_slot .sp_panel_tab_icon {
                         width:var(--sp-panel-tab-icon-size);
                         height:var(--sp-panel-tab-icon-size);
                         line-height:var(--sp-panel-tab-icon-size);
                         border-radius:50%;
                         background:rgba(255,255,255,.18);
                         flex:0 0 var(--sp-panel-tab-icon-size);
                         text-align:center;
                    }

                  #sp_panel_tab_slot .sp_panel_tab_label {
                         width:var(--sp-panel-tab-label-width);
                         flex:0 0 var(--sp-panel-tab-label-width);
                         text-align:center;
                         white-space:nowrap;
                         opacity:0;
                         transition:opacity .16s ease;
                    }

                  #sp_panel_tab_slot .sp_panel_tab.active .sp_panel_tab_label,
                  #sp_panel_tab_slot .sp_panel_tab:hover .sp_panel_tab_label,
                  #sp_panel_tab_slot .sp_panel_tab:focus .sp_panel_tab_label,
                  #sp_panel_tab_slot .sp_panel_tab:focus-visible .sp_panel_tab_label,
                  #sp_panel_tab_slot .sp_panel_tab.is-hover .sp_panel_tab_label {
                         opacity:1;
                    }

                  #sp_panel_views {
                        display:flex;
                        flex-direction:column;
                        flex:1;
                        min-height:0;
                   }

                  .sp_panel_module.active {
                        display:flex;
                        flex-direction:column;
                        flex:1;
                        min-height:0;
                  }

                  #sp_module_history.sp_panel_module.active,
                  #sp_module_posts.sp_panel_module.active,
                  #sp_module_feeds.sp_panel_module.active {
                         display:flex;
                         flex-direction:column;
                         flex:1;
                         min-height:0;
                  }

                  .sp_panel_module:not(.active) {
                         display:none;
                    }

                   .sp_panel_content {
                          padding:18px;
                          overflow-y:auto;
                          flex:1 1 auto;
                          min-height:300px;
                          box-sizing:border-box;
                     }

                   #sp_history_content {
                          display:block;
                     }

                  .xdex-history-toolbar {
                         display:flex;
                         align-items:center;
                         gap:8px;
                         margin:0 0 10px;
                    }

                  .xdex-history-toolbar input {
                          flex:1;
                          min-width:0;
                          padding:6px 8px;
                          border:1px solid var(--xdex-sp-border);
                          border-radius:8px;
                          background:var(--xdex-sp-panel-bg);
                      }

                  .xdex-history-toolbar select {
                          padding:6px 8px;
                          border:1px solid var(--xdex-sp-border);
                          border-radius:8px;
                          background:var(--xdex-sp-panel-bg);
                     }

                   .xdex-history-toolbar .xdex-history-count {
                           white-space:nowrap;
                      }

                   .xdex-history-toolbar .xdex-history-search-help {
                           display:inline-block;
                           margin-left:3px;
                           text-decoration:underline;
                           cursor:help;
                           color:inherit;
                      }

                   #sp_history_results {
                           display:block;
                           min-height:40px;
                           padding-top:8px;
                           color:inherit;
                      }

                   #sp_posts_results {
                           display:block;
                           min-height:40px;
                           padding-top:8px;
                           color:inherit;
                      }

                   .xdex-post-history-type-buttons {
                          display:flex;
                          gap:8px;
                          margin:0 0 10px;
                     }

                   .xdex-post-history-type-buttons button {
                          flex:1;
                          padding:6px 8px;
                          border:1px solid var(--xdex-sp-border);
                          border-radius:8px;
                          background:var(--xdex-sp-panel-bg);
                          cursor:pointer;
                     }

                   .xdex-post-history-type-buttons button.active {
                           background:#F0E0D6;
                           color:#332200;
                           font-weight:bold;
                      }

                   .xdex-history-item {
                           display:block !important;
                            position:relative;
                            margin:10px 0 8px;
                            border:1px solid var(--xdex-sp-border);
                            border-radius:8px;
                            background:var(--xdex-sp-fold-bg);
                            overflow:visible;
                       }

                   .xdex-history-item .h-threads-item-main {
                          display:block !important;
                           position:relative;
                           padding:10px;
                           background:transparent;
                      }

                    .xdex-history-item .h-threads-content {
                           display:block !important;
                           margin:15px 40px 6px;
                           font-size:14px;
                            line-height:20px;
                           white-space:pre-wrap;
                           overflow-wrap:anywhere;
                      }

                    .xdex-history-item .h-threads-info {
                           display:flex;
                           align-items:flex-start;
                           gap:8px;
                           line-height:1.5;
                           margin-bottom:6px;
                      }

                    .xdex-history-info-main {
                           flex:1 1 auto;
                           min-width:0;
                      }

                   .xdex-history-item .h-threads-info-title {
                          color:#cc1105;
                          font-weight:bold;
                     }

                   .xdex-history-item .h-threads-info-email {
                          color:#117743;
                          font-weight:bold;
                     }

                    .xdex-history-item .h-threads-info-email,
                    .xdex-history-item .h-threads-info-createdat,
                    .xdex-history-item .h-threads-info-uid,
                    .xdex-history-item .h-threads-info-id,
                    .xdex-history-item .h-threads-info-reply-btn {
                            margin-left:5px;
                       }

                    .xdex-history-delete,
                    .xdex-post-history-delete,
                    .xdex-history-reply-action {
                           text-decoration:none;
                           border:0;
                           background:transparent;
                          padding:0;
                          font:inherit;
                           cursor:pointer;
                      }

                    .xdex-history-delete:hover,
                    .xdex-post-history-delete:hover,
                    .xdex-history-reply-action:hover {
                           text-decoration:underline;
                      }

                    .xdex-history-reply-action {
                           color:#07d;
                      }

                    .xdex-history-reply-action:hover {
                           color:#059;
                      }

                     .xdex-history-delete,
                     .xdex-post-history-delete {
                             position:absolute;
                             top:-9px;
                             right:10px;
                            width:20px;
                            height:20px;
                            border:1px solid #a98f7a;
                            border-radius:999px;
                            background:#F0E0D6;
                            line-height:16px;
                            padding:0;
                            font-size:14px;
                            z-index:1;
                            color:#800000;
                       }

                    .xdex-history-footer {
                           display:flex;
                           align-items:center;
                           flex-wrap:wrap;
                           gap:0;
                           clear:both;
                           margin-top:8px;
                           color:#777;
                           font-size:12px;
                      }

                    .xdex-history-footer span + span::before {
                           content:'·';
                           margin:0 6px;
                           color:#777;
                      }

                    .xdex-history-po-label {
                           color:#00FFCC;
                           font-weight:bold;
                      }

                  .xdex-history-header {
                         justify-content:space-between;
                         margin-bottom:6px;
                    }

                  .xdex-history-meta {
                         flex-wrap:wrap;
                         font-size:12px;
                    }

                  .xdex-history-image,
                  .xdex-post-history-image {
                          display:block;
                          width:112px;
                          max-height:112px;
                         margin:6px 10px 6px 0;
                         overflow:hidden;
                         float:left;
                    }

                  .xdex-history-image img,
                  .xdex-post-history-image img {
                          max-width:112px;
                          max-height:112px;
                          object-fit:contain;
                    }

                   .xdex-history-footer,
                   .xdex-history-empty {
                          clear:both;
                          margin-top:8px;
                         color:#777;
                         font-size:12px;
                    }
              </style>
          `);
      }

      if (!$('#sp_btn').length) {
        $('body').append(
            $(`<button id="sp_btn" type="button" title="X岛-EX 设置" aria-label="X岛-EX 设置"><img src="${SETTINGS_BUTTON_ICON_32}" srcset="${SETTINGS_BUTTON_ICON_32} 1x, ${SETTINGS_BUTTON_ICON_64} 2x" width="32" height="32" alt=""></button>`)
                .on('click',()=>{
                  this.syncInputs();
                  this.syncAuxiliaryControls();
                  if (typeof window.__xdexSyncDarkReaderTheme === 'function') window.__xdexSyncDarkReaderTheme();
                  $('#sp_cover').fadeIn();
                  maybeShowPendingUpdateDialogOnPanelOpen();
                })
        );
        updateSettingsButtonBadge(getUpdateCheckState());
    }

      const fold = (id,title,ph) => `
        <div class="sp_fold" style="border:1px solid #eee;margin:6px 0;background:#F0E0D6;">
          <div class="sp_fold_head" data-btn="#btn_${id}"
              style="display:flex;align-items:center;padding:6px 8px;background:#F0E0D6;cursor:pointer;">
            <span>${title}</span>
            <button id="btn_${id}" class="sp_save xdex-inv" data-id="${id}"
                    style="margin-left:auto;padding:2px 8px;">保存</button>
          </div>
          <div class="sp_fold_body" style="display:none;padding:8px 10px;background:#F0E0D6;">
          <input id="${id}" style="width:100%;padding:5px 8px;box-sizing:border-box;border-radius:8px;" placeholder="${ph}">
          </div>
        </div>`;

      const checkboxItemStyle = 'width:50%; display:flex; align-items:center; gap:8px;';
      const checkboxRowStyle = 'width:50%; display:flex; align-items:center; gap:8px;';
      const quickReplyRowStyle = 'display:flex; align-items:center; gap:12px; margin:4px 0;';
      const quickReplyColumnStyle = 'flex:1; display:flex; flex-direction:column; align-items:flex-start; gap:4px;';

      const html = `
        <style>
          .fixed-on {
            accent-color: #000; /* 勾选颜色黑色 */
          }

          .fixed-on:disabled {
            opacity: 1;         /* 不降低透明度 */
            filter: none;       /* 去掉可能的灰度滤镜 */
            cursor: default;    /* 鼠标变成普通箭头 */
          }

          .xdex-switch { appearance:none; width:34px; height:18px; flex:0 0 34px; border:1px solid #a98f7a; border-radius:999px; background:#EE0000; cursor:pointer; position:relative; box-sizing:border-box; transition:background .18s ease,border-color .18s ease; }
          .xdex-switch::before { content:""; position:absolute; width:14px; height:14px; left:1px; top:1px; border-radius:50%; background:#FFFFEE; box-shadow:0 1px 2px rgba(0,0,0,.24); transition:transform .18s ease; }
          .xdex-switch:checked { background:#66CCFF; border-color:#7da6bf; }
          input.xdex-switch.fixed-on:checked:disabled { background:#00FFCC; border-color:#00b894; }
          .xdex-switch:checked::before { transform:translateX(16px); }
          .xdex-switch:focus-visible { outline:2px solid #cc1105; outline-offset:2px; }
          .xdex-switch:disabled { opacity:1; cursor:default; }
        </style>
        <div id="sp_cover" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9999;">
          <div id="sp_panel" style="
              position:relative;margin:40px auto;width:min(711px, calc(100vw - 32px));
              max-height:calc(100vh - 80px);background:#FFFFEE;border-radius:8px;
              display:flex;flex-direction:column;box-shadow:0 2px 10px rgba(0,0,0,0.2);">
            <div id="sp_panel_tab_slot" aria-label="设置面板模块">
              <button type="button" class="sp_panel_tab" data-sp-module="settings"><span class="sp_panel_tab_icon">设</span><span class="sp_panel_tab_label">设置</span></button>
              <button type="button" class="sp_panel_tab" data-sp-module="history"><span class="sp_panel_tab_icon">浏</span><span class="sp_panel_tab_label">浏览历史</span></button>
              <button type="button" class="sp_panel_tab" data-sp-module="posts"><span class="sp_panel_tab_icon">言</span><span class="sp_panel_tab_label">我的发言</span></button>
              <button type="button" class="sp_panel_tab" data-sp-module="feeds"><span class="sp_panel_tab_icon">订</span><span class="sp_panel_tab_label">我的订阅</span></button>
            </div>
            <div id="sp_panel_views">
              <div id="sp_module_settings" class="sp_panel_module active" data-sp-module-view="settings">
                <div id="sp_panel_content" class="sp_panel_content" style="padding:18px;overflow-y:auto;flex:1;min-height:300px;box-sizing:border-box;">
                  <div id="sp_panel_title" style="margin:0 0 10px; position:relative; text-align:center;">

                <span style="font-size:20px; font-weight:bold;">X岛-EX</span>

                <a id="sp_version_link" href="javascript:void(0)" style="position:absolute; right:0; top:50%; transform:translateY(-50%); font-size:12px; color:#999; text-decoration:underline;">v2.1.0.1</a>

              </div>

                  <div id="sp_checkbox_container" style="display:flex;flex-wrap:wrap;">
                <div style="${checkboxItemStyle}"><input type="checkbox" id="sp_enableCookieSwitch" class="xdex-switch" role="switch"><label for="sp_enableCookieSwitch"> 快捷切换饼干</label></div>
                <div style="${checkboxItemStyle}"><input type="checkbox" id="sp_enablePaginationDuplication" class="xdex-switch" role="switch"><label for="sp_enablePaginationDuplication"> 添加页首页码</label></div>
                <div style="${checkboxItemStyle}"><input type="checkbox" id="sp_disableWatermark" class="xdex-switch" role="switch"><label for="sp_disableWatermark"> 关闭图片水印</label></div>
                <div style="${checkboxItemStyle}"><input type="checkbox" id="sp_updatePreviewCookie" class="xdex-switch" role="switch"><label for="sp_updatePreviewCookie"> 预览真实饼干</label></div>
                <div style="${checkboxItemStyle}"><input type="checkbox" id="sp_hideEmptyTitleEmail" class="xdex-switch" role="switch"><label for="sp_hideEmptyTitleEmail"> 隐藏无标题/无名氏/版规</label></div>
                <div style="${checkboxItemStyle}"><input type="checkbox" id="sp_enableExternalImagePreview" class="xdex-switch" role="switch"><label for="sp_enableExternalImagePreview"> 显示外部图床</label></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_enableAutoCookieRefresh" class="xdex-switch" role="switch"><label for="sp_enableAutoCookieRefresh"> 自动刷新饼干</label><input type="checkbox" id="sp_enableAutoCookieRefreshToast" class="xdex-switch" role="switch"><label for="sp_enableAutoCookieRefreshToast"> toast提示</label></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_enableSeamlessPaging" class="xdex-switch" role="switch"><label for="sp_enableSeamlessPaging"> 无缝翻页</label><input type="checkbox" id="sp_enableAutoSeamlessPaging" class="xdex-switch" role="switch" checked><label for="sp_enableAutoSeamlessPaging"> 自动翻页</label></div>
                <div style="${checkboxItemStyle}"><input type="checkbox" id="sp_enableHDImageAndLayoutFix" class="xdex-switch" role="switch"><label for="sp_enableHDImageAndLayoutFix"> 图片控件-布局调整</label></div>
                <div style="${checkboxItemStyle}"><input type="checkbox" id="sp_enableLinkBlank" class="xdex-switch" role="switch"><label for="sp_enableLinkBlank"> 新标签打开串</label></div>
                <div style="${checkboxItemStyle}"><input type="checkbox" id="sp_enableAutoUrlLinkify" class="xdex-switch" role="switch"><label for="sp_enableAutoUrlLinkify"> 自动识别网址链接</label></div>
                <div style="${checkboxItemStyle}"><input type="checkbox" id="sp_enableQuotePreview" class="xdex-switch" role="switch"><label for="sp_enableQuotePreview"> 优化引用弹窗</label></div>
                <div style="${checkboxItemStyle}"><input type="checkbox" id="sp_extendQuote" class="xdex-switch" role="switch"><label for="sp_extendQuote"> 拓展引用格式</label></div>
                <div style="${checkboxItemStyle}"><input type="checkbox" id="sp_toggleSidebar" class="xdex-switch" role="switch"><label for="sp_toggleSidebar"> 自动收起侧边栏</label></div>
                <div style="${checkboxItemStyle}"><input type="checkbox" id="sp_enableUpdateCheck" class="xdex-switch" role="switch"><label for="sp_enableUpdateCheck"> 检查更新</label></div>
                <div style="${checkboxItemStyle}"><input type="checkbox" id="sp_enableImageContextMenu" class="xdex-switch" role="switch"><label for="sp_enableImageContextMenu"> 图片菜单</label></div>
                <!-- <div style="width:50%;"><label for="sp_占位"> </label></div> -->
                <!-- 以下是默认勾选项不可更改 -->
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_interceptReplyForm" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_interceptReplyForm"> 拦截回复中间页</label><input type="checkbox" id="sp_interceptReplyFormAutoCompress" class="xdex-switch" role="switch"><label for="sp_interceptReplyFormAutoCompress"> 自动压缩图片</label></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_interceptReplyFormUnvcode" class="xdex-switch" role="switch"><label for="sp_interceptReplyFormUnvcode"> unvcode</label><input type="checkbox" id="sp_interceptReplyFormU200B" class="xdex-switch" role="switch"><label for="sp_interceptReplyFormU200B"> 零宽空格优先</label></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_updateReplyNumbers" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_updateReplyNumbers"> 当页回复编号</label><input type="hidden" name="sp_updateReplyNumbers" value="1"></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_replaceRightSidebar" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_replaceRightSidebar"> 扩展坞增强</label><input type="hidden" name="sp_replaceRightSidebar" value="1"></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_kaomojiEnhancer" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_kaomojiEnhancer"> 颜文字拓展</label><select id="sp_kaomojiSort" style="height:24px;"><option value="default">默认</option><option value="recent">最近</option><option value="freq">常用</option></select><input type="hidden" name="sp_kaomojiEnhancer" value="1"></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_highlightPO" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_highlightPO"> 标记Po主</label><input type="hidden" name="sp_highlightPO" value="1"></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_applyFilters" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_applyFilters"> 标记/屏蔽-饼干/关键词</label><select id="sp_blockDisplayMode" style="height:24px;"><option value="fold">折叠</option><option value="hide">隐藏</option></select><input type="hidden" name="sp_applyFilters" value="1"></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_threadCookieWhitelistModeEnabled" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_threadCookieWhitelistModeEnabled"> 只看饼干</label><select id="sp_threadCookieWhitelistDisplayMode" style="height:24px;"><option value="fold">折叠</option><option value="hide">隐藏</option><option value="column">分栏</option></select><select id="sp_poAnnotationSideDisplayMode" style="height:24px;"><option value="collapse">收起</option><option value="expand">展开</option></select></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_enhancePostFormLayout" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_enhancePostFormLayout"> 发串UI调整</label><input type="hidden" name="sp_enhancePostFormLayout" value="1"></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_enhanceIsland" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_enhanceIsland"> 增强X岛匿名版</label><select id="sp_enableDraftMode" style="height:24px;"><option value="on">关闭草稿</option><option value="off">开启草稿</option></select><select id="sp_timeDisplayMode" style="height:24px;"><option value="relative">相对时间</option><option value="exact">精确时间</option></select><input type="hidden" name="sp_enhanceIsland" value="1"></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_enablePostExpand" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_enablePostExpand"> 展开板块页长串</label><select id="sp_postExpandAllMode" style="height:24px;"><option value="collapse">全部收起</option><option value="expand">全部展开</option></select><input type="hidden" name="sp_enablePostExpand" value="1"></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_searchServiceBy4sY" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_searchServiceBy4sY"> 野生搜索酱</label><input type="hidden" name="sp_searchServiceBy4sY" value="1"></div>
                <div style="${checkboxRowStyle}">
                  <input type="checkbox" id="sp_enableImageHideMode" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_enableImageHideMode"> 模糊/无图/Tips模式</label>
                  <select id="sp_applyImageHideMode" style="height:24px;">
                    <option value="default">默认</option>
                    <option value="blur">模糊</option>
                    <option value="noimage">无图</option>
                    <option value="tips">Tips</option>
                  </select>
                </div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_enableFavoriteThreads" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_enableFavoriteThreads"> 常用串</label></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_enableThreadHistory" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_enableThreadHistory"> 浏览历史</label></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_enablePostHistory" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_enablePostHistory"> 发言历史</label><select id="sp_postAfterAction" style="height:24px;"><option value="jump">发串后跳转</option><option value="refresh">发串后刷新</option></select><input type="hidden" name="sp_enablePostHistory" value="1"></div>
                <div style="${checkboxRowStyle}"><input type="checkbox" id="sp_enableSubscriptionFeed" class="xdex-switch fixed-on" role="switch" checked disabled><label for="sp_enableSubscriptionFeed"> 我的订阅</label></div>
            </div>
              <div style="margin-top:12px;">
                <h3 id="sp_replyQuicklyOnBoardPage" style="margin:6px 0;">板块页快速回复默认设置</h3>
                <div style="${quickReplyRowStyle}">
                  <!-- 左侧：板块页默认模式 -->
                  <div style="${quickReplyColumnStyle}">
                    <label for="sp_replyModeDefault" style="margin-bottom:4px;">板块页默认模式</label>
                    <select id="sp_replyModeDefault" style="width:100%;">
                      <option value="发串">发串</option>
                      <option value="回复">回复</option>
                    </select>
                  </div>
                  <!-- 右侧：回复默认模式 -->
                  <div style="${quickReplyColumnStyle}">
                    <label for="sp_replyExtraDefault" style="margin-bottom:4px;">回复默认模式</label>
                    <select id="sp_replyExtraDefault" style="width:100%;">
                      <option value="临时">临时</option>
                      <option value="连续">连续</option>
                    </select>
                  </div>
                </div>
                  </div>

              <div style="margin-top:12px;">
                <!-- 标记饼干（组） -->
                  <div class="sp_fold" style="border:1px solid #eee;margin:6px 0;background:#F0E0D6;">
                  <div class="sp_fold_head" data-btn="#btn_sp_marked,#btn_group_marked"
                      style="display:flex;align-items:center;padding:6px 8px;background:#F0E0D6;cursor:pointer;">
                    <span>标记饼干</span>
                    <button id="btn_group_marked" class="xdex-inv" style="margin-left:auto;padding:2px 8px;">添加分组</button>
                    <button id="btn_sp_marked" class="sp_save xdex-inv" data-id="sp_marked"
                            style="margin-left:4px;padding:2px 8px;">保存</button>
                  </div>
                  <div class="sp_fold_body" style="display:none;padding:8px 10px;background:#F0E0D6;">
                    <div id="marked-inputs-container"></div>
                  </div>
                </div>

                <!-- 屏蔽饼干（组，含备注） -->
                  <div class="sp_fold" style="border:1px solid #eee;margin:6px 0;background:#F0E0D6;">
                  <div class="sp_fold_head" data-btn="#btn_sp_blocked,#btn_group_blocked"
                      style="display:flex;align-items:center;padding:6px 8px;background:#F0E0D6;cursor:pointer;">
                    <span>屏蔽饼干</span>
                    <button id="btn_group_blocked" class="xdex-inv" style="margin-left:auto;padding:2px 8px;">添加分组</button>
                    <button id="btn_sp_blocked" class="sp_save xdex-inv" data-id="sp_blocked"
                            style="margin-left:4px;padding:2px 8px;">保存</button>
                  </div>
                  <div class="sp_fold_body" style="display:none;padding:8px 10px;background:#F0E0D6;">
                    <div id="blocked-inputs-container"></div>
                  </div>
                </div>

                <!-- 只看饼干（组，按串号） -->
                  <div class="sp_fold" style="border:1px solid #eee;margin:6px 0;background:#F0E0D6;">
                  <div class="sp_fold_head" data-btn="#btn_sp_threadCookieWhitelist,#btn_group_threadCookieWhitelist"
                      style="display:flex;align-items:center;padding:6px 8px;background:#F0E0D6;cursor:pointer;">
                    <span>只看饼干</span>
                    <button id="btn_group_threadCookieWhitelist" class="xdex-inv" style="margin-left:auto;padding:2px 8px;">添加分组</button>
                    <button id="btn_sp_threadCookieWhitelist" class="sp_save xdex-inv" data-id="sp_threadCookieWhitelist"
                            style="margin-left:4px;padding:2px 8px;">保存</button>
                  </div>
                  <div class="sp_fold_body" style="display:none;padding:8px 10px;background:#F0E0D6;">
                    <div id="thread-cookie-whitelist-inputs-container"></div>
                  </div>
                </div>

                <!-- 屏蔽关键词（组） -->
                <div class="sp_fold" style="border:1px solid #eee;margin:6px 0;background:#F0E0D6;">
                  <div class="sp_fold_head" data-btn="#btn_sp_blockedKeywords,#btn_group_blockedKeywords"
                      style="display:flex;align-items:center;padding:6px 8px;background:#F0E0D6;cursor:pointer;">
                    <span>屏蔽关键词</span>
                    <button id="btn_group_blockedKeywords" class="xdex-inv" style="margin-left:auto;padding:2px 8px;">添加分组</button>
                    <button id="btn_sp_blockedKeywords" class="sp_save xdex-inv" data-id="sp_blockedKeywords"
                            style="margin-left:4px;padding:2px 8px;">保存</button>
                  </div>
                  <div class="sp_fold_body" style="display:none;padding:8px 10px;background:#F0E0D6;">
                    <div id="blocked-keyword-inputs-container"></div>
                    <div style="font-size:12px;color:#888;text-align:center;">每组仍使用逗号分隔；8位纯数字会同时匹配正文、串号和回复号</div>
                  </div>
                </div>

                <!-- 常用串 -->
                <div class="sp_fold" style="border:1px solid #eee;margin:6px 0;background:#F0E0D6;">
                  <div class="sp_fold_head" data-btn="#btn_sp_favoriteThreads,#btn_group_favoriteThreads"
                      style="display:flex;align-items:center;padding:6px 8px;background:#F0E0D6;cursor:pointer;">
                    <span>常用串</span>
                    <button id="btn_group_favoriteThreads" class="xdex-inv" style="margin-left:auto;padding:2px 8px;">添加常用串</button>
                    <button id="btn_sp_favoriteThreads" class="sp_save xdex-inv" data-id="sp_favoriteThreads"
                            style="margin-left:4px;padding:2px 8px;">保存</button>
                  </div>
                  <div class="sp_fold_body" style="display:none;padding:8px 10px;background:#F0E0D6;">
                    <div id="favorite-thread-inputs-container"></div>
                    <!-- <div style="font-size:12px;color:#888;text-align:center;">备注可选；可填写 8 位串号或串链接，保存后统一为主串链接</div> -->
                  </div>
                </div>

                <!-- 我的订阅 -->
                <div class="sp_fold" style="border:1px solid #eee;margin:6px 0;background:#F0E0D6;">
                  <div class="sp_fold_head" data-btn="#btn_sp_subscriptionFeeds,#btn_group_subscriptionFeeds"
                      style="display:flex;align-items:center;padding:6px 8px;background:#F0E0D6;cursor:pointer;">
                    <span>我的订阅</span>
                    <button id="btn_group_subscriptionFeeds" class="xdex-inv" style="margin-left:auto;padding:2px 8px;">添加订阅号</button>
                    <button id="btn_sp_subscriptionFeeds" class="sp_save xdex-inv" data-id="sp_subscriptionFeeds"
                            style="margin-left:4px;padding:2px 8px;">保存</button>
                  </div>
                  <div class="sp_fold_body" style="display:none;padding:8px 10px;background:#F0E0D6;">
                    <div id="subscription-feed-inputs-container"></div>
                  </div>
                </div>

                <!-- 设置导入/导出 -->
                <div class="sp_fold" style="border:1px solid #eee;margin:6px 0;background:#F0E0D6;">
                  <div class="sp_fold_head" data-btn="#btn_sp_importExport"
                      style="display:flex;align-items:center;padding:6px 8px;background:#F0E0D6;cursor:pointer;">
                    <span>设置导入/导出</span>
                    <button id="btn_sp_importExport" class="sp_save xdex-inv" data-id="sp_importExport"

                            style="margin-left:auto;padding:2px 8px;">应用</button>
                  </div>
                  <div class="sp_fold_body" style="display:none;padding:8px 10px;background:#F0E0D6;">
                    <div style="display:flex;gap:8px;margin-bottom:8px;">
                      <button id="sp_importClipboard" style="flex:1;padding:4px 8px;font-size:13px;cursor:pointer;">从剪贴板导入</button>
                      <button id="sp_exportClipboard" style="flex:1;padding:4px 8px;font-size:13px;cursor:pointer;">导出到剪贴板</button>
                    </div>
                    <div style="display:flex;gap:8px;margin-bottom:8px;">
                      <button id="sp_importFile" style="flex:1;padding:4px 8px;font-size:13px;cursor:pointer;">从文件导入</button>
                      <button id="sp_exportFile" style="flex:1;padding:4px 8px;font-size:13px;cursor:pointer;">导出为文件</button>
                    </div>
                    <div style="font-size:12px;color:#888;text-align:center;">导入将覆盖当前全部配置，建议先导出备份</div>
                  </div>
                </div>

                <!-- 完整数据导入/导出 -->
                <div class="sp_fold" style="border:1px solid #eee;margin:6px 0;background:#F0E0D6;">
                  <div class="sp_fold_head" data-btn="#btn_sp_fullExport_reset,#btn_sp_fullExport_export,#btn_sp_fullExport_import"
                      style="display:flex;align-items:center;padding:6px 8px;background:#F0E0D6;cursor:pointer;">
                    <span>完整数据导入/导出</span>
                    <button id="btn_sp_fullExport_reset" class="xdex-inv" style="margin-left:auto;padding:2px 8px;color:#c00;">重置所选项目</button>
                    <button id="btn_sp_fullExport_export" class="xdex-inv" style="margin-left:4px;padding:2px 8px;">导出为文件</button>
                    <button id="btn_sp_fullExport_import" class="xdex-inv" style="margin-left:4px;padding:2px 8px;">从文件导入</button>
                  </div>
                  <div class="sp_fold_body" style="display:none;padding:8px 10px;background:#F0E0D6;">
                    <div style="font-size:12px;color:#666;margin-bottom:6px;">
                      用于备份或迁移脚本/扩展运行产生的数据，支持按类别导出与导入。默认全选。
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px 16px;margin-bottom:6px;">
                      <div style="display:flex;align-items:center;gap:4px;">
                        <input type="checkbox" id="sp_fullExport_settings" class="xdex-switch" role="switch" checked>
                        <label for="sp_fullExport_settings">设置</label>
                      </div>
                      <div style="display:flex;align-items:center;gap:4px;">
                        <input type="checkbox" id="sp_fullExport_threadHistory" class="xdex-switch" role="switch" checked>
                        <label for="sp_fullExport_threadHistory">浏览历史</label>
                      </div>
                      <div style="display:flex;align-items:center;gap:4px;">
                        <input type="checkbox" id="sp_fullExport_postHistory" class="xdex-switch" role="switch" checked>
                        <label for="sp_fullExport_postHistory">发言历史</label>
                      </div>
                      <div style="display:flex;align-items:center;gap:4px;">
                        <input type="checkbox" id="sp_fullExport_drafts" class="xdex-switch" role="switch" checked>
                        <label for="sp_fullExport_drafts">草稿</label>
                      </div>
                      <div style="display:flex;align-items:center;gap:4px;">
                        <input type="checkbox" id="sp_fullExport_kaomojiStats" class="xdex-switch" role="switch" checked>
                        <label for="sp_fullExport_kaomojiStats">颜文字统计</label>
                      </div>
                    </div>
                    <div id="sp_fullExport_import_preview" style="display:none;margin-top:8px;padding:6px 8px;border:1px dashed #aaa;border-radius:6px;background:#FFFFEE;"></div>
                  </div>
                </div>
                </div>
              </div>
              </div>
              <div id="sp_module_history" class="sp_panel_module" data-sp-module-view="history">
                <div class="sp_panel_content">
                  <div id="sp_history_content">
                    <div id="sp_history_title" style="margin:0 0 10px; position:relative; text-align:center;">
                      <span style="font-size:20px; font-weight:bold;">浏览历史</span>
                    </div>
                    <div class="xdex-history-toolbar">
                      <input id="sp_history_search" type="search" autocomplete="off" placeholder="搜索标题、名称、正文、串号等关键词；高级检索见后方 ?">
                      <span id="sp_history_count" class="xdex-history-count">0 条</span>
                      <select id="sp_history_sort" aria-label="浏览历史排序">
                        <option value="last-desc">最近访问优先</option>
                        <option value="last-asc">最早访问优先</option>
                        <option value="visits-desc">访问次数最多</option>
                        <option value="visits-asc">访问次数最少</option>
                        <option value="page-desc">最高页码优先</option>
                      </select>
                      <button id="sp_history_clear" type="button" style="padding:6px 10px;">清空</button>
                    </div>
                    <div id="sp_history_results"></div>
                  </div>
                </div>
              </div>
              <div id="sp_module_posts" class="sp_panel_module" data-sp-module-view="posts">
                <div class="sp_panel_content">
                  <div id="sp_posts_content">
                    <div id="sp_posts_title" style="margin:0 0 10px; position:relative; text-align:center;">
                      <span style="font-size:20px; font-weight:bold;">我的发言</span>
                    </div>
                    <div class="xdex-history-toolbar">
                      <input id="sp_posts_search" type="search" autocomplete="off" placeholder="搜索标题、名称、正文、串号等关键词；高级检索见后方 ?">
                      <span id="sp_posts_count" class="xdex-history-count">0 条</span>
                      <button id="sp_posts_clear" type="button" style="padding:6px 10px;">清空</button>
                    </div>
                    <div id="sp_posts_type_buttons" class="xdex-post-history-type-buttons">
                      <button type="button" data-post-history-type="thread">我的主题</button>
                      <button type="button" data-post-history-type="reply" class="active">我的回复</button>
                    </div>
                    <div id="sp_posts_results"></div>
                  </div>
                </div>
              </div>
              <div id="sp_module_feeds" class="sp_panel_module" data-sp-module-view="feeds">
                <div class="sp_panel_content">
                  <div id="sp_feeds_content">
                    <div id="sp_feeds_title" style="margin:0 0 10px; position:relative; text-align:center;">
                      <span style="font-size:20px; font-weight:bold;">我的订阅</span>
                    </div>
                    <div class="xdex-history-toolbar" style="flex-wrap:wrap;gap:6px;">
                      <div class="xdex-feed-selector-wrap" style="flex:1 1 auto;min-width:0;position:relative;">
                      <select id="sp_feeds_selector" aria-hidden="true" tabindex="-1" style="position:absolute;opacity:0;pointer-events:none;width:0;height:0;"></select>
                      <div id="sp_feeds_selector_display" class="xdex-feed-selector-display" role="combobox" aria-haspopup="listbox" aria-expanded="false">
                        <span class="xdex-feed-display-desc"></span>
                        <span class="xdex-feed-display-uuid"></span>
                      </div>
                      <div id="sp_feeds_selector_dropdown" class="xdex-feed-selector-dropdown" role="listbox" style="display:none;"></div>
                    </div>
                      <input id="sp_feeds_page_input" type="number" min="1" placeholder="页码" size="4" style="flex:0 0 auto;width:4em;padding:4px 6px;">
                      <button id="sp_feeds_page_jump" type="button" style="padding:4px 8px;">跳转</button>
                    </div>
                    <div id="sp_feeds_results"></div>
                  </div>
                </div>
              </div>
            </div>

            <div id="sp_panel_footer" style="padding:10px 18px;display:flex;align-items:center;justify-content:space-between;position:relative;border-top:1px solid #eee;background:#FFFFEE;">
              <div class="sp_panel_links" style="display:flex;align-items:center;gap:8px;">
                <a data-update-channel="thread" href="https://www.nmbxd1.com/t/67024789" target="_blank" rel="noopener">串内</a>
                <a data-update-channel="greasyfork" href="https://greasyfork.org/zh-CN/scripts/531005-x%E5%B2%9B-ex" target="_blank" rel="noopener">GreasyFork</a>
                <a data-update-channel="github" href="https://github.com/SayaGoodBye/nmbxd-EX" target="_blank" rel="noopener">Github</a>
                <a data-update-channel="scriptcat" href="https://scriptcat.org/zh-CN/script-show-page/6289" target="_blank" rel="noopener">ScriptCat</a>
                <a data-update-channel="baidupan" href="https://pan.baidu.com/s/1-ELWglsTXG8jK5S6WwqtsQ?pwd=k8zf" target="_blank" rel="noopener">百度网盘</a>
              </div>
              <div id="sp_feeds_pager" style="display:none;position:absolute;left:50%;transform:translateX(-50%);align-items:center;gap:8px;">
                <button id="sp_feeds_prev" type="button" style="padding:4px 10px;">上一页</button>
                <span id="sp_feeds_page_label" style="font-size:18px;color:#666;">第1页</span>
                <button id="sp_feeds_next" type="button" style="padding:4px 10px;">下一页</button>
              </div>
              <div class="sp_panel_actions" style="display:flex;align-items:center;gap:10px;">
                <button id="sp_apply" style="padding:6px 10px;">保存并刷新</button>
                <button id="sp_close" style="padding:6px 10px;">关闭</button>
              </div>
            </div>
          </div>
        </div>`;
      $('#sp_cover').remove();
      $('body').append(html);

      function setSettingsPanelModule(moduleName) {
        const $nextView = $(`#sp_panel_views [data-sp-module-view="${moduleName}"]`);
        const nextModule = $nextView.length ? moduleName : 'settings';
        $('#sp_panel_tab_slot .sp_panel_tab').removeClass('active')
          .filter(`[data-sp-module="${nextModule}"]`).addClass('active');
        $('#sp_panel_views .sp_panel_module').removeClass('active').css('display', 'none');
        const $activeModule = $('#sp_panel_views .sp_panel_module')
          .filter(`[data-sp-module-view="${nextModule}"]`)
          .addClass('active')
          .css({ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: (nextModule === 'history' || nextModule === 'posts' || nextModule === 'feeds') ? '300px' : '0' });
        if (nextModule === 'history' || nextModule === 'posts' || nextModule === 'feeds') {
          $activeModule.find('.sp_panel_content').css({ display: 'block', flex: '1 1 auto', minHeight: '300px', overflowY: 'auto', boxSizing: 'border-box' });
          $activeModule.find('#sp_history_content,#sp_posts_content,#sp_feeds_content').css({ display: 'block' });
          $activeModule.find('#sp_history_results,#sp_posts_results,#sp_feeds_results').css({ display: 'block', minHeight: '40px' });
        }
        $('#sp_panel_footer .sp_panel_links').show();
        $('#sp_panel_footer .sp_panel_links a').toggle(nextModule === 'settings');
        $('#sp_apply').toggle(nextModule === 'settings');
        $('#sp_feeds_pager').toggle(nextModule === 'feeds');
        updateThreadHistoryDebugState({
          lastPanelModule: nextModule,
          lastPanelState: {
            requested: moduleName,
            resolved: nextModule,
            footerLinksVisible: $('#sp_panel_footer .sp_panel_links').is(':visible'),
            applyVisible: $('#sp_apply').is(':visible'),
            historyResults: !!document.getElementById('sp_history_results'),
            historyResultsHeight: document.getElementById('sp_history_results')?.offsetHeight || 0,
            historyModuleDisplay: getComputedStyle(document.getElementById('sp_module_history') || document.body).display,
            historyContentDisplay: getComputedStyle(document.getElementById('sp_history_content') || document.body).display,
            historyPanelContentHeight: document.querySelector('#sp_module_history .sp_panel_content')?.offsetHeight || 0,
            at: new Date().toISOString()
          }
        });
        logThreadHistory('panel module switched', threadHistoryDebugState.lastPanelState);
        logThreadHistoryFlat('panel module switched flat', threadHistoryDebugState.lastPanelState);
      }

      $('#sp_panel_tab_slot').off('click', '[data-sp-module]').on('click', '[data-sp-module]', (e) => {
        e.preventDefault();
        logThreadHistory('panel tab clicked', { module: $(e.currentTarget).data('spModule') });
        setSettingsPanelModule($(e.currentTarget).data('spModule'));
        if ($(e.currentTarget).data('spModule') === 'history') renderThreadHistoryModuleSoon();

        if ($(e.currentTarget).data('spModule') === 'posts') renderPostHistoryModuleSoon();

        if ($(e.currentTarget).data('spModule') === 'feeds') renderSubscriptionFeedModule();
      });
      $('#sp_panel_tab_slot').off('mouseenter mouseleave', '.sp_panel_tab')
        .on('mouseenter', '.sp_panel_tab', (e) => { $(e.currentTarget).addClass('is-hover'); })
        .on('mouseleave', '.sp_panel_tab', (e) => { $(e.currentTarget).removeClass('is-hover'); });
      setSettingsPanelModule('settings');
      bindThreadHistoryModuleEvents();
      bindThreadHistoryLiveSync();
      bindPostHistoryModuleEvents();
      bindPostHistoryLiveSync();
      bindSubscriptionFeedModuleEvents();
      renderThreadHistoryModule();
      renderPostHistoryModule();

      // 折叠头：统一控制
      $('.sp_fold_head').off('click').on('click', function(){
        const $head = $(this);
        $head.next('.sp_fold_body').slideToggle(150);
        const btns = ($head.data('btn') || '').split(',');
        btns.forEach(sel => $(sel).toggleClass('xdex-inv'));
      });

      // 同步已有配置 & 默认折叠
      this.syncInputs();

      const reloadRequiredSettingKeys = [
        'enableCookieSwitch',
        'disableWatermark',
        'enablePaginationDuplication',
        'updatePreviewCookie',
        'hideEmptyTitleEmail',
        'enableExternalImagePreview',
        'enableUpdateCheck',
        'enableAutoCookieRefresh',
        'enableAutoCookieRefreshToast',
        'interceptReplyFormUnvcode',
        'interceptReplyFormU200B',
        'interceptReplyFormAutoCompress',
        'enableSeamlessPaging',
        'enableAutoSeamlessPaging',
        'enableHDImageAndLayoutFix',
        'enableImageContextMenu',
        'enableLinkBlank',
        'enableAutoUrlLinkify',
        'enableQuotePreview',
        'extendQuote',
        'toggleSidebar'
      ];

      const collectReloadRequiredSettingsFromPanel = () => {
        reloadRequiredSettingKeys.forEach(k => { this.state[k] = $('#sp_' + k).is(':checked'); });
        // 固定启用：不受面板勾选状态影响
        this.state.enableImageHideMode = true;
      };

      const saveReloadRequiredSettingsImmediately = () => {
        collectReloadRequiredSettingsFromPanel();
        try {
          GM_setValue(this.key, this.state);
          toast('设置已保存，刷新后生效', 900, { queue: false, key: 'settings-saved' });
        } catch (e) {}
      };

      const reloadRequiredSettingSelector = reloadRequiredSettingKeys.map(k => '#sp_' + k).join(',');
      $(reloadRequiredSettingSelector)
        .off('change.xdexReloadSettingSave')
        .on('change.xdexReloadSettingSave', saveReloadRequiredSettingsImmediately);

      // 图片隐藏模式：即时切换并即时应用（无需点“应用更改”）
      const applyImageHideModeImmediately = () => {
        const mode = $('#sp_applyImageHideMode').val() || 'default';

        // 固定启用，仅切换具体模式
        this.state.enableImageHideMode = true;
        this.state.applyImageHideMode = mode;

        try { GM_setValue(this.key, this.state); } catch (e) {}

        if (typeof applyImageHideMode === 'function') {
          applyImageHideMode(mode, document);
        }
      };

      $('#sp_enableImageHideMode').off('change').on('change', applyImageHideModeImmediately);
      $('#sp_applyImageHideMode').off('change').on('change', applyImageHideModeImmediately);

      // 屏蔽显示模式：即时切换并即时生效（折叠/隐藏）
      const applyBlockDisplayModeImmediately = () => {
        const mode = $('#sp_blockDisplayMode').val() || 'fold';
        this.state.blockDisplayMode = mode;
        try { GM_setValue(this.key, this.state); } catch (e) {}
        refreshFilterDisplay(this.state);
      };
      $('#sp_blockDisplayMode').off('change').on('change', applyBlockDisplayModeImmediately);

      const applyThreadCookieWhitelistDisplayModeImmediately = () => {
        this.state.threadCookieWhitelistDisplayMode = $('#sp_threadCookieWhitelistDisplayMode').val() || 'fold';
        this.state.poAnnotationSideDisplayMode = $('#sp_poAnnotationSideDisplayMode').val() || 'collapse';
        try { GM_setValue(this.key, this.state); } catch (e) {}
        refreshFilterDisplay(this.state);
      };
      $('#sp_threadCookieWhitelistDisplayMode').off('change').on('change', applyThreadCookieWhitelistDisplayModeImmediately);
      $('#sp_poAnnotationSideDisplayMode').off('change').on('change', applyThreadCookieWhitelistDisplayModeImmediately);

      // 颜文字排序：即时切换并即时生效（无需点“应用更改”）
      const applyKaomojiSortImmediately = () => {
        const mode = $('#sp_kaomojiSort').val() || 'default';
        this.state.kaomojiSort = mode;
        try { GM_setValue(this.key, this.state); } catch (e) {}

        // 与颜文字按钮右侧的快捷下拉实时同步
        $('.sp_kaomojiSort_copy').val(mode);

        document.querySelectorAll('#h-emot-select').forEach(sel => {
          try {
            sel.dispatchEvent(new Event('kaomoji:sort-changed'));
          } catch (e) {}
        });

        // 广播排序模式变化，供其它复制下拉同步
        try {
          window.dispatchEvent(new CustomEvent('kaomoji:sort-mode-changed', { detail: { mode, source: 'settings' } }));
        } catch (e) {}
      };
      $('#sp_kaomojiSort').off('change').on('change', applyKaomojiSortImmediately);

      (function initPostExpandModeSelect() {
          const sel = document.getElementById('sp_postExpandAllMode');
          if (!sel) return;
          sel.value = (SettingPanel.state && SettingPanel.state.enablePostExpandAll) ? 'expand' : 'collapse';
          sel.addEventListener('change', (e) => {
              e.stopPropagation();
              const nextState = (sel.value || 'expand') === 'expand';
              SettingPanel.state.enablePostExpandAll = nextState;

              const items = document.querySelectorAll('.h-threads-item-index');
              let anchor = null;
              for (const item of items) {
                const rect = item.getBoundingClientRect();
                if (rect.top >= 0) { anchor = item; break; }
              }
              if (!anchor && items.length) anchor = items[items.length - 1];
              const anchorTopBefore = anchor ? anchor.getBoundingClientRect().top : null;

              items.forEach(item => {
                const toggleBtn = item.querySelector('.h-threads-info .js-toggle-mode');
                if (!toggleBtn) return;
                const expanded = item.classList.contains('expanded');
                if (nextState && !expanded) {
                  toggleBtn.click();
                } else if (!nextState && expanded) {
                  toggleBtn.click();
                }
              });

              if (!nextState && anchor && anchorTopBefore !== null) {
                requestAnimationFrame(() => {
                  const anchorTopAfter = anchor.getBoundingClientRect().top;
                  const delta = anchorTopAfter - anchorTopBefore;
                  window.scrollBy({ top: delta, behavior: 'instant' });
                });
              }

              try { GM_setValue(SettingPanel.key, SettingPanel.state); } catch (err) {}
              toast(nextState ? '已展开长串' : '已折叠长串');
          });
      })();

      (function initPostAfterActionSelect() {
          const sel = document.getElementById('sp_postAfterAction');
          if (!sel) return;
          sel.value = (SettingPanel.state && SettingPanel.state.postAfterAction) || 'jump';
          sel.addEventListener('change', (e) => {
              e.stopPropagation();
              const action = (sel.value || 'jump') === 'jump' ? 'jump' : 'refresh';
              SettingPanel.state.postAfterAction = action;
              try { GM_setValue(SettingPanel.key, SettingPanel.state); } catch (err) {}
              toast(action === 'jump' ? '已切换为：发串后新标签页打开' : '已切换为：发串后刷新页面回顶部');
          });
      })();

      (function initDraftModeSelect() {
          const sel = document.getElementById('sp_enableDraftMode');
          if (!sel) return;
          sel.value = (SettingPanel.state && SettingPanel.state.enableDraft) ? 'off' : 'on';
          sel.addEventListener('change', (e) => {
            e.stopPropagation();
            const enabled = (sel.value || 'off') === 'off';
            SettingPanel.state.enableDraft = enabled;

            try { GM_setValue(SettingPanel.key, SettingPanel.state); } catch (err) {}

            if (!enabled) {
              deleteAllDraftsSafe();
              toast('已清除缓存草稿并关闭草稿功能');
            } else {
              try { migrateLegacyDraftIfNeeded(); } catch (err) {}
              try { if (typeof 载入编辑 === 'function') 载入编辑(); } catch (err) {}
              try { if (typeof 注册自动保存编辑 === 'function') 注册自动保存编辑(); } catch (err) {}
              toast('已开启草稿缓存');
            }
          });
      })();

      (function initTimeDisplayModeSelect() {
          const sel = document.getElementById('sp_timeDisplayMode');
          if (!sel) return;
          sel.value = (SettingPanel.state && SettingPanel.state.timeDisplayMode === 'exact') ? 'exact' : 'relative';
          sel.addEventListener('change', (e) => {
            e.stopPropagation();
            const mode = (sel.value === 'exact') ? 'exact' : 'relative';
            SettingPanel.state.timeDisplayMode = mode;
            try { GM_setValue(SettingPanel.key, SettingPanel.state); } catch (err) {}
            try { if (typeof window.__xdexApplyTimeDisplayMode === 'function') window.__xdexApplyTimeDisplayMode(document); } catch (err) {}
            toast(mode === 'exact' ? '已切换为精确时间' : '已切换为相对时间');
          });
      })();

      // 标记：新增组输入
      $('#btn_group_marked').off('click').on('click', e=>{
        e.stopPropagation();
        const nextIndex = $('#marked-inputs-container .marked-row').length + 1;
        $('#marked-inputs-container').append(
          buildCookieGroupTwoFieldRowHtml('marked', nextIndex)
        ).find('.marked-desc-input').last().focus();
      });
      // 屏蔽：新增组输入
      $('#btn_group_blocked').off('click').on('click', e=>{
        e.stopPropagation();
        const nextIndex = $('#blocked-inputs-container .blocked-row').length + 1;
        $('#blocked-inputs-container').append(
          buildCookieGroupTwoFieldRowHtml('blocked', nextIndex)
        ).find('.blocked-desc-input').last().focus();
      });
      $('#btn_group_threadCookieWhitelist').off('click').on('click', e=>{
        e.stopPropagation();
        const nextIndex = $('#thread-cookie-whitelist-inputs-container .thread-cookie-whitelist-row').length + 1;
        $('#thread-cookie-whitelist-inputs-container').append(buildThreadCookieWhitelistRowHtml(nextIndex));
        $('#thread-cookie-whitelist-inputs-container .thread-cookie-whitelist-row').last().find('.thread-cookie-whitelist-desc-input').focus();
      });

      $('#btn_group_blockedKeywords').off('click').on('click', e=>{
        e.stopPropagation();
        const nextIndex = $('#blocked-keyword-inputs-container .blocked-keyword-row').length + 1;
        $('#blocked-keyword-inputs-container').append(buildBlockedKeywordGroupRowHtml(nextIndex));
        $('#blocked-keyword-inputs-container .blocked-keyword-row').last().find('.blocked-keyword-input').focus();
      });

      $('#btn_group_favoriteThreads').off('click').on('click', e=>{

        e.stopPropagation();

        const nextIndex = $('#favorite-thread-inputs-container .favorite-thread-row').length + 1;

        $('#favorite-thread-inputs-container').append(buildFavoriteThreadRowHtml(nextIndex));

        $('#favorite-thread-inputs-container .favorite-thread-row').last().find('.favorite-thread-desc-input').focus();

      });

      $('#btn_group_subscriptionFeeds').off('click').on('click', e=>{

        e.stopPropagation();

        const nextIndex = $('#subscription-feed-inputs-container .subscription-feed-row').length + 1;

        $('#subscription-feed-inputs-container').append(buildSubscriptionFeedRowHtml(nextIndex));

        $('#subscription-feed-inputs-container .subscription-feed-row').last().find('.subscription-feed-desc-input').focus();

      });



      const saveMarkedGroups = ({ fromDelete = false } = {}) => {
        const parsed = collectMarkedGroupsFromPanel();
        if (!parsed) return false;
        this.state.markedGroups = parsed;
        GM_setValue(this.key, this.state);
        this.syncInputs();
        toast(fromDelete ? '已删除标记分组' : '标记分组已保存');
        refreshFilterDisplay(this.state);
        return true;
      };

      const saveBlockedGroups = ({ fromDelete = false } = {}) => {
        const parsed = [];
        let valid = true;
        $('#blocked-inputs-container .blocked-row').each((idx, el)=>{
          const $row = $(el);
          const desc = ($row.find('.blocked-desc-input').val() || '').trim();
          const cookies = Utils.strToList(($row.find('.blocked-cookies-input').val() || '').trim());
          if (!desc && !cookies.length) return;
          if (!isValidDesc(desc)) { toast(`第${idx + 1}条备注过长`); valid=false; return false; }
          if (!cookies.length) { toast(`第${idx + 1}条未指定饼干`); valid=false; return false; }
          if (cookies.some(id=>!Utils.cookieLegal(id))) { toast(`第${idx + 1}条存在不合法饼干`); valid=false; return false; }
          parsed.push({ desc, cookies });
        });
        if (!valid) return false;
        this.state.blockedCookies = parsed;
        GM_setValue(this.key, this.state);
        this.syncInputs();
        toast(fromDelete ? '已删除屏蔽分组' : '屏蔽分组已保存');
        refreshFilterDisplay(this.state);
        return true;
      };

      const saveThreadCookieWhitelistGroups = ({ fromDelete = false } = {}) => {
        const parsed = [];
        let valid = true;
        $('#thread-cookie-whitelist-inputs-container .thread-cookie-whitelist-row').each((idx, el) => {
          const $row = $(el);
          const desc = ($row.find('.thread-cookie-whitelist-desc-input').val() || '').trim();
          const threads = Utils.strToList(($row.find('.thread-cookie-whitelist-threads-input').val() || '').trim());
          const cookies = Utils.strToList(($row.find('.thread-cookie-whitelist-cookies-input').val() || '').trim());
          if (!desc && !threads.length && !cookies.length) return;
          if (!isValidDesc(desc)) { toast(`第${idx + 1}条备注过长`); valid = false; return false; }
          if (!threads.length) { toast(`第${idx + 1}条未指定串号`); valid = false; return false; }
          if (threads.some(id => !isValidThreadId(id))) { toast(`第${idx + 1}条存在不合法串号`); valid = false; return false; }
          if (!cookies.length) { toast(`第${idx + 1}条未指定饼干`); valid = false; return false; }
          if (cookies.some(id => !Utils.cookieLegal(id))) { toast(`第${idx + 1}条存在不合法饼干`); valid = false; return false; }
          parsed.push({ desc, threads, cookies, rowIndex: idx + 1 });
        });
        if (!valid) return false;
        const { groups, mergeEvents } = mergeThreadCookieWhitelistGroups(parsed);
        this.state.threadCookieWhitelistGroups = groups;
        GM_setValue(this.key, this.state);
        mergeEvents.forEach((event) => {
          if (event.desc) {
            toast(`第${event.rowIndex}条（${event.desc}）中的串号 ${event.threadId} 已与现有只看规则合并`);
          } else {
            toast(`第${event.rowIndex}条的串号 ${event.threadId}（${event.cookies.join('，')}）已与现有只看规则合并`);
          }
        });
        this.syncInputs();
        toast(fromDelete ? '已删除只看饼干分组' : '只看饼干分组已保存');
        refreshFilterDisplay(this.state);
        return true;
      };

      const collectBlockedKeywordGroupsFromPanel = () => {
        const parsed = [];
        $('#blocked-keyword-inputs-container .blocked-keyword-row').each((idx, el)=>{
          const rawValue = ($(el).find('.blocked-keyword-input').val() || '').trim();
          if (Utils.strToList(rawValue).length) parsed.push({ value: rawValue });
        });
        return parsed;
      };

      const saveBlockedKeywordGroups = ({ fromDelete = false } = {}) => {
        this.state.blockedKeywords = collectBlockedKeywordGroupsFromPanel();
        GM_setValue(this.key, this.state);
        this.syncInputs();
        toast(fromDelete ? '已删除关键词分组' : '屏蔽关键词已保存');
        refreshFilterDisplay(this.state);
        return true;
      };

      const saveFavoriteThreads = ({ fromDelete = false } = {}) => {
        const parsed = collectFavoriteThreadsFromPanel();
        if (!parsed) return false;
        this.state.favoriteThreads = parsed;
        GM_setValue(this.key, this.state);
        this.syncInputs();
        renderFavoriteThreadsMenu();
        toast(fromDelete ? '已删除常用串' : '常用串已保存');
        return true;
      };

      $('#marked-inputs-container').off('click', '.marked-delete').on('click', '.marked-delete', (e) => {
        e.preventDefault();
        e.stopPropagation();
        $(e.currentTarget).closest('.marked-row').remove();
        saveMarkedGroups({ fromDelete: true });
        return false;
      });

      $('#blocked-inputs-container').off('click', '.blocked-delete').on('click', '.blocked-delete', (e) => {
        e.preventDefault();
        e.stopPropagation();
        $(e.currentTarget).closest('.blocked-row').remove();
        saveBlockedGroups({ fromDelete: true });
        return false;
      });

      $('#thread-cookie-whitelist-inputs-container').off('click', '.thread-cookie-whitelist-delete').on('click', '.thread-cookie-whitelist-delete', (e) => {
        e.preventDefault();
        e.stopPropagation();
        $(e.currentTarget).closest('.thread-cookie-whitelist-row').remove();
        saveThreadCookieWhitelistGroups({ fromDelete: true });
        return false;
      });

      $('#blocked-keyword-inputs-container').off('click', '.blocked-keyword-delete').on('click', '.blocked-keyword-delete', (e) => {
        e.preventDefault();
        e.stopPropagation();
        $(e.currentTarget).closest('.blocked-keyword-row').remove();
        saveBlockedKeywordGroups({ fromDelete: true });
        return false;
      });

      $('#favorite-thread-inputs-container').off('click', '.favorite-thread-delete').on('click', '.favorite-thread-delete', (e) => {
        e.preventDefault();
        e.stopPropagation();
        $(e.currentTarget).closest('.favorite-thread-row').remove();
        saveFavoriteThreads({ fromDelete: true });
        return false;
      });

      // 标记：保存
      $('#btn_sp_marked').off('click').on('click', e=>{
        e.stopPropagation();
        saveMarkedGroups();
      });

      // 屏蔽：保存
      $('#btn_sp_blocked').off('click').on('click', e=>{
        e.stopPropagation();
        saveBlockedGroups();
      });

      $('#btn_sp_blockedKeywords').off('click').on('click', e=>{
        e.stopPropagation();
        saveBlockedKeywordGroups();
      });

      $('#btn_sp_favoriteThreads').off('click').on('click', e=>{
        e.stopPropagation();
        saveFavoriteThreads();
      });

      $('#subscription-feed-inputs-container').off('click', '.subscription-feed-delete').on('click', '.subscription-feed-delete', (e) => {
        e.preventDefault();
        e.stopPropagation();
        $(e.currentTarget).closest('.subscription-feed-row').remove();
        saveSubscriptionFeeds({ fromDelete: true });
        return false;
      });
      // 订阅号：保存
      const saveSubscriptionFeeds = ({ fromDelete = false } = {}) => {
        const parsed = collectSubscriptionFeedsFromPanel();
        if (!parsed) return false;
        this.state.subscriptionFeeds = parsed;
        GM_setValue(this.key, this.state);
        this.syncInputs();
        toast(fromDelete ? '已删除订阅号' : '订阅号已保存');
        return true;
      };
      $('#btn_sp_subscriptionFeeds').off('click').on('click', e=>{
        e.stopPropagation();
        saveSubscriptionFeeds();
      });

      $('#btn_sp_threadCookieWhitelist').off('click').on('click', e=>{
        e.stopPropagation();
        saveThreadCookieWhitelistGroups();
      });

      const closeMarkedColorPopovers = () => {
        $('#marked-inputs-container .marked-color-popover').hide();
      };

      const getMarkedRowDefaultColor = ($row) => {
        const rowIndex = Math.max($row.index(), 0);
        return markColors[rowIndex % markColors.length];
      };

      const updateMarkedRowSwatch = ($row, draftColor) => {
        const color = normalizeHexColor(draftColor) || getMarkedRowDefaultColor($row);
        $row.find('.marked-color-swatch').css('background', color).attr('data-default-color', color);
        $row.find('.marked-color-preview').css('background', color);
      };

      const readMarkedColorInputValue = ($popover) => ($popover.find('.marked-color-input').val() || '').trim();

      const readMarkedColorInputAsHex = ($popover) => {
        const state = $popover.data('pickerState') || {};
        const rawValue = readMarkedColorInputValue($popover);
        if (!rawValue) return '';
        if ((state.format || 'hex') === 'rgb') {
          const rgb = parseRgbColorString(rawValue);
          return rgb ? rgbToHex(rgb) : null;
        }
        const normalized = normalizeHexColor(rawValue);
        return normalized || null;
      };

      const setMarkedColorInputFromState = ($popover) => {
        const state = $popover.data('pickerState');
        if (!state) return;
        const inputValue = state.inputEmpty
          ? ''
          : (state.format === 'rgb' ? formatRgbColor(hexToRgb(state.hex)) : state.hex);
        $popover.find('.marked-color-input').val(inputValue);
      };

      const updateMarkedColorFormatButtons = ($popover) => {
        const state = $popover.data('pickerState') || {};
        $popover.find('.marked-color-format').each((_, el) => {
          const $btn = $(el);
          const active = $btn.data('format') === (state.format || 'hex');
          $btn.css({
            border: active ? '1px solid #7da6bf' : '1px solid #a98f7a',
            background: active ? '#66CCFF' : '#F0E0D6',
            color: active ? '#fff' : '#6f5d50',
          });
        });
      };

      const renderMarkedColorPicker = ($row) => {
        const $popover = $row.find('.marked-color-popover');
        const state = $popover.data('pickerState');
        if (!state) return;
        const displayHex = normalizeHexColor(state.hex) || state.defaultHex;
        const displayHsv = hexToHsv(displayHex);
        const hueHex = hsvToHex(state.hsv.h, 1, 1);
        const $sv = $popover.find('.marked-color-sv');
        const $svThumb = $popover.find('.marked-color-sv-thumb');
        const $hueThumb = $popover.find('.marked-color-hue-thumb');
        $sv.css('background', `linear-gradient(to top, #000 0%, transparent 100%), linear-gradient(to right, #fff 0%, ${hueHex} 100%)`);
        $svThumb.css({ left: `${state.hsv.s * 100}%`, top: `${(1 - state.hsv.v) * 100}%` });
        $hueThumb.css('left', `${(state.hsv.h / 360) * 100}%`);
        $popover.find('.marked-color-preview').css('background', displayHex);
        $popover.find('.marked-color-status').text(state.inputEmpty ? `默认色 ${state.defaultHex}` : displayHex);
        $popover.find('.marked-color-default-hint').text(`默认 ${state.defaultHex}`);
        setMarkedColorInputFromState($popover);
        updateMarkedColorFormatButtons($popover);
        updateMarkedRowSwatch($row, state.inputEmpty ? '' : displayHex);
      };

      const setMarkedColorPickerHex = ($row, nextHex, options = {}) => {
        const $popover = $row.find('.marked-color-popover');
        const state = $popover.data('pickerState');
        if (!state) return;
        const normalized = normalizeHexColor(nextHex);
        const allowEmpty = !!options.allowEmpty;
        if (!normalized && !allowEmpty) return;
        state.inputEmpty = !normalized;
        state.hex = normalized || state.defaultHex;
        state.hsv = hexToHsv(state.hex);
        $popover.data('pickerState', state);
        renderMarkedColorPicker($row);
      };

      const setMarkedColorPickerFormat = ($row, format) => {
        const $popover = $row.find('.marked-color-popover');
        const state = $popover.data('pickerState');
        if (!state) return;
        state.format = format === 'rgb' ? 'rgb' : 'hex';
        $popover.data('pickerState', state);
        renderMarkedColorPicker($row);
      };

      const updateMarkedColorPickerFromPointer = ($row, areaType, clientX, clientY) => {
        const $popover = $row.find('.marked-color-popover');
        const state = $popover.data('pickerState');
        if (!state) return;
        if (areaType === 'sv') {
          const rect = $popover.find('.marked-color-sv')[0].getBoundingClientRect();
          const s = clampColorChannel((clientX - rect.left) / rect.width, 0, 1);
          const v = clampColorChannel(1 - ((clientY - rect.top) / rect.height), 0, 1);
          state.hsv.s = s;
          state.hsv.v = v;
        } else {
          const rect = $popover.find('.marked-color-hue')[0].getBoundingClientRect();
          state.hsv.h = clampColorChannel(((clientX - rect.left) / rect.width) * 360, 0, 360);
          if (state.hsv.h === 360) state.hsv.h = 359.999;
        }
        state.inputEmpty = false;
        state.hex = hsvToHex(state.hsv.h, state.hsv.s, state.hsv.v);
        $popover.data('pickerState', state);
        renderMarkedColorPicker($row);
      };

      const positionMarkedColorPopover = ($row) => {
        const $cell = $row.find('.marked-color-cell');
        const $popover = $row.find('.marked-color-popover');
        if (!$cell.length || !$popover.length) return;
        $popover.css({ top: '', bottom: '' });
        const cellRect = $cell[0].getBoundingClientRect();
        const popRect = $popover[0].getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        const gap = 6;
        const spaceBelow = viewportHeight - cellRect.bottom - gap;
        const spaceAbove = cellRect.top - gap;
        const openAbove = spaceBelow < popRect.height && spaceAbove > spaceBelow;
        const popoverHeight = popRect.height;
        if (openAbove) {
          let offsetBottom = cellRect.height + gap;
          const topIfOpened = cellRect.bottom - offsetBottom - popoverHeight;
          if (topIfOpened < 4) {
            offsetBottom = Math.max(cellRect.bottom - popoverHeight - 4, gap);
          }
          $popover.css({ top: 'auto', bottom: `${offsetBottom}px` });
        } else {
          let offsetTop = cellRect.height + gap;
          const overflow = cellRect.top + offsetTop + popoverHeight - viewportHeight + 4;
          if (overflow > 0) {
            offsetTop = Math.max(offsetTop - overflow, -cellRect.top + 4);
          }
          $popover.css({ top: `${offsetTop}px`, bottom: 'auto' });
        }
      };

      const openMarkedColorPopover = ($row) => {
        const $popover = $row.find('.marked-color-popover');
        const storedColor = ($row.find('.marked-color-value').val() || '').trim();
        const defaultHex = getMarkedRowDefaultColor($row);
        const displayHex = normalizeHexColor(storedColor) || defaultHex;
        $popover.data('pickerState', {
          format: 'hex',
          defaultHex,
          inputEmpty: !normalizeHexColor(storedColor),
          hex: displayHex,
          hsv: hexToHsv(displayHex),
        });
        renderMarkedColorPicker($row);
        $popover.show();
        positionMarkedColorPopover($row);
        $popover.find('.marked-color-input').trigger('focus').trigger('select');
      };

      const beginMarkedColorDrag = ($row, areaType, startEvent) => {
        const moveEvent = startEvent.type.indexOf('touch') === 0 ? 'touchmove.markedColorDrag' : 'mousemove.markedColorDrag';
        const endEvent = startEvent.type.indexOf('touch') === 0 ? 'touchend.markedColorDrag touchcancel.markedColorDrag' : 'mouseup.markedColorDrag';
        const getPoint = (evt) => {
          const touch = evt.originalEvent && evt.originalEvent.touches && evt.originalEvent.touches[0];
          const changedTouch = evt.originalEvent && evt.originalEvent.changedTouches && evt.originalEvent.changedTouches[0];
          return touch || changedTouch || evt;
        };
        const applyPointer = (evt) => {
          const point = getPoint(evt);
          updateMarkedColorPickerFromPointer($row, areaType, point.clientX, point.clientY);
        };
        applyPointer(startEvent);
        $(document).off('.markedColorDrag').on(moveEvent, (evt) => {
          evt.preventDefault();
          applyPointer(evt);
        }).on(endEvent, () => {
          $(document).off('.markedColorDrag');
        });
      };

      const collectMarkedGroupsFromPanel = () => {
        const parsed = [];
        let valid = true;
        $('#marked-inputs-container .marked-row').each((idx, el)=>{
          const $row = $(el);
          const desc = ($row.find('.marked-desc-input').val() || '').trim();
          const cookies = Utils.strToList(($row.find('.marked-cookies-input').val() || '').trim());
          const rawColor = ($row.find('.marked-color-value').val() || '').trim();
          if (!desc && !cookies.length) return;
          if (!isValidDesc(desc)) { toast(`第${idx + 1}条备注过长`); valid=false; return false; }
          if (!cookies.length) { toast(`第${idx + 1}条未指定饼干`); valid=false; return false; }
          if (cookies.some(id=>!Utils.cookieLegal(id))) { toast(`第${idx + 1}条存在不合法饼干`); valid=false; return false; }
          if (rawColor && !isValidHexColor(rawColor)) { toast(`第${idx + 1}条颜色格式无效，应为 #RRGGBB`); valid=false; return false; }
          parsed.push({ desc, color: normalizeHexColor(rawColor), cookies });
        });
        return valid ? parsed : null;
      };

      $(document).off('click.markedColorPopover').on('click.markedColorPopover', (e) => {
        if ($(e.target).closest('#marked-inputs-container .marked-color-cell').length) return;
        closeMarkedColorPopovers();
      });

      $('#marked-inputs-container').off('click', '.marked-color-swatch').on('click', '.marked-color-swatch', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const $row = $(e.currentTarget).closest('.marked-row');
        const $popover = $row.find('.marked-color-popover');
        const shouldOpen = !$popover.is(':visible');
        closeMarkedColorPopovers();
        if (!shouldOpen) return false;
        openMarkedColorPopover($row);
        return false;
      });

      $('#marked-inputs-container').off('input', '.marked-color-input').on('input', '.marked-color-input', (e) => {
        const $row = $(e.currentTarget).closest('.marked-row');
        const $popover = $row.find('.marked-color-popover');
        const normalized = readMarkedColorInputAsHex($popover);
        if (normalized === '') {
          setMarkedColorPickerHex($row, '', { allowEmpty: true });
          return;
        }
        if (normalized) setMarkedColorPickerHex($row, normalized);
      });

      $('#marked-inputs-container').off('blur', '.marked-color-input').on('blur', '.marked-color-input', (e) => {
        const $row = $(e.currentTarget).closest('.marked-row');
        const $popover = $row.find('.marked-color-popover');
        const parsedHex = readMarkedColorInputAsHex($popover);
        if (parsedHex === '') {
          setMarkedColorPickerHex($row, '', { allowEmpty: true });
          return;
        }
        if (parsedHex) {
          setMarkedColorPickerHex($row, parsedHex);
          return;
        }
        renderMarkedColorPicker($row);
      });

      $('#marked-inputs-container').off('click', '.marked-color-format').on('click', '.marked-color-format', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const $row = $(e.currentTarget).closest('.marked-row');
        setMarkedColorPickerFormat($row, $(e.currentTarget).data('format'));
        return false;
      });

      $('#marked-inputs-container').off('mousedown touchstart', '.marked-color-sv').on('mousedown touchstart', '.marked-color-sv', (e) => {
        e.preventDefault();
        e.stopPropagation();
        beginMarkedColorDrag($(e.currentTarget).closest('.marked-row'), 'sv', e);
        return false;
      });

      $('#marked-inputs-container').off('mousedown touchstart', '.marked-color-hue').on('mousedown touchstart', '.marked-color-hue', (e) => {
        e.preventDefault();
        e.stopPropagation();
        beginMarkedColorDrag($(e.currentTarget).closest('.marked-row'), 'hue', e);
        return false;
      });

      $('#marked-inputs-container').off('click', '.marked-color-clear').on('click', '.marked-color-clear', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const $row = $(e.currentTarget).closest('.marked-row');
        const $popover = $row.find('.marked-color-popover');
        $row.find('.marked-color-value').val('');
        if ($popover.is(':visible')) {
          setMarkedColorPickerHex($row, '', { allowEmpty: true });
          const state = $popover.data('pickerState');
          if (state) {
            state.format = 'hex';
            $popover.data('pickerState', state);
            renderMarkedColorPicker($row);
          }
        } else {
          updateMarkedRowSwatch($row, '');
        }
        $popover.hide();
        return false;
      });

      $('#marked-inputs-container').off('click', '.marked-color-save').on('click', '.marked-color-save', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const $row = $(e.currentTarget).closest('.marked-row');
        const $popover = $row.find('.marked-color-popover');
        const parsedHex = readMarkedColorInputAsHex($popover);
        if (parsedHex === null) {
          toast('颜色格式无效，应为 #RRGGBB 或 rgb(r, g, b)');
          $row.find('.marked-color-input').trigger('focus');
          return false;
        }
        const normalized = normalizeHexColor(parsedHex);
        $row.find('.marked-color-value').val(normalized);
        if (normalized) {
          setMarkedColorPickerHex($row, normalized);
          setMarkedColorPickerFormat($row, 'hex');
        } else {
          setMarkedColorPickerHex($row, '', { allowEmpty: true });
        }
        updateMarkedRowSwatch($row, normalized);
        $popover.hide();
        return false;
      });

      // ========== 导入/导出配置 ==========
      function parseJSONC(str) {
        // 逐字符解析：只在字符串外部去掉 // 注释和尾随逗号（不清理零宽字符，保留用户数据完整性）
        let out = '', inStr = false, esc = false;
        for (let i = 0; i < str.length; i++) {
          const ch = str[i];
          if (inStr) {
            out += ch;
            if (esc) { esc = false; }
            else if (ch === '\\') { esc = true; }
            else if (ch === '"') { inStr = false; }
          } else {
            if (ch === '"') { inStr = true; out += ch; }
            else if (ch === '/' && str[i + 1] === '/') {
              // 跳过行注释
              while (i < str.length && str[i] !== '\n') i++;
              out += '\n';
            }
            else if (ch === ',' && /^\s*[}\]]/.test(str.slice(i + 1))) {
              // 尾随逗号：后面紧跟 } 或 ]（允许空白），跳过逗号
              continue;
            }
            else { out += ch; }
          }
        }
        return JSON.parse(out);
      }

      // 固定开启项：UI 中为 disabled + checked，无需导入/导出
      const FIXED_KEYS = new Set([
        'enableImageHideMode',   // 固定启用（applyImageHideMode 仍可导出）
        'interceptReplyForm',    // 拦截回复中间页
        'updateReplyNumbers',    // 当页回复编号
        'replaceRightSidebar',   // 扩展坞增强
        'kaomojiEnhancer',       // 颜文字拓展（kaomojiSort 仍可导出）
        'highlightPO',           // 标记Po主
        'enhancePostFormLayout', // 发串UI调整
        'applyFilters',          // 标记/屏蔽-饼干/关键词
        'enhanceIsland',         // 增强X岛匿名版
        'enablePostExpand',      // 展开板块页长串
        'searchServiceBy4sY',    // 野生搜索酱
      ]);

      // 清理字符串值中的零宽/不可见控制字符
      function sanitizeValue(val) {
        if (typeof val === 'string') {
          return val.replace(/[\u200B\u200C\u200D\uFEFF\u200E\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069]/g, '');
        }
        if (Array.isArray(val)) return val.map(sanitizeValue);
        if (val && typeof val === 'object') {
          const o = {};
          for (const [k2, v2] of Object.entries(val)) o[k2] = sanitizeValue(v2);
          return o;
        }
        return val;
      }

      // === 完整数据导入导出 ===
      const FULL_EXPORT_SCHEMA_VERSION = 1;

      const FULL_IMPORT_DIRECT_OVERRIDE_KEYS = [
        'enableCookieSwitch', 'disableWatermark', 'enablePaginationDuplication',
        'updatePreviewCookie', 'hideEmptyTitleEmail', 'enableExternalImagePreview',
        'enableAutoCookieRefresh', 'enableAutoCookieRefreshToast',
        'interceptReplyFormUnvcode', 'interceptReplyFormU200B',
        'interceptReplyFormAutoCompress', 'enableSeamlessPaging',
        'enableAutoSeamlessPaging', 'enableHDImageAndLayoutFix',
        'enableLinkBlank', 'enableAutoUrlLinkify', 'enableQuotePreview',
        'enableUpdateCheck', 'enableImageContextMenu', 'enableImageHideMode',
        'applyImageHideMode', 'enableDraft', 'timeDisplayMode',
        'extendQuote', 'kaomojiSort', 'toggleSidebar',
        'threadCookieWhitelistDisplayMode', 'poAnnotationSideDisplayMode',
        'replyModeDefault', 'replyExtraDefault', 'blockDisplayMode',
        'postAfterAction'
      ];

      function mergeFavoriteThreads(localItems, importedItems) {
        const local = Array.isArray(localItems) ? normalizeFavoriteThreads(localItems) : [];
        const imported = Array.isArray(importedItems) ? normalizeFavoriteThreads(importedItems) : [];
        const seen = new Map();
        local.forEach((item) => {
          const key = String(item.threadId || '').trim();
          if (key) seen.set(key, item);
        });
        imported.forEach((item) => {
          const key = String(item.threadId || '').trim();
          if (!key) return;
          if (!seen.has(key)) {
            seen.set(key, item);
          } else {
            const existing = seen.get(key);
            if (!existing.desc && item.desc) existing.desc = item.desc;
          }
        });
        return Array.from(seen.values());
      }

      function mergeSubscriptionFeeds(localItems, importedItems) {
        const local = Array.isArray(localItems) ? localItems : [];
        const imported = Array.isArray(importedItems) ? importedItems : [];
        const seen = new Map();
        local.forEach((item) => {
          const key = String(item.uuid || '').trim();
          if (key) seen.set(key, item);
        });
        imported.forEach((item) => {
          const key = String(item.uuid || '').trim();
          if (!key) return;
          if (!seen.has(key)) {
            seen.set(key, item);
          } else {
            const existing = seen.get(key);
            if (!existing.desc && item.desc) existing.desc = item.desc;
          }
        });
        return Array.from(seen.values());
      }

      function mergeMarkedGroups(localGroups, importedGroups) {
        const local = Array.isArray(localGroups) ? localGroups : [];
        const imported = Array.isArray(importedGroups) ? importedGroups : [];
        const result = [];
        const usedImported = new Set();

        local.forEach((localGroup) => {
          const localDesc = localGroup.desc || localGroup.name || '';
          let matched = false;
          for (let i = 0; i < imported.length; i++) {
            if (usedImported.has(i)) continue;
            const impGroup = imported[i];
            const impDesc = impGroup.desc || impGroup.name || '';
            if (localDesc && impDesc && localDesc === impDesc) {
              matched = true;
              usedImported.add(i);
              const localCookies = Array.isArray(localGroup) ? localGroup : (localGroup.cookies || []);
              const impCookies = Array.isArray(impGroup) ? impGroup : (impGroup.cookies || []);
              const mergedCookies = Array.from(new Set([...localCookies, ...impCookies]));
              if (Array.isArray(localGroup) && !localGroup.desc) {
                result.push(mergedCookies);
              } else {
                result.push({ ...localGroup, ...impGroup, desc: impDesc || localDesc, cookies: mergedCookies });
              }
              break;
            }
          }
          if (!matched) result.push(localGroup);
        });
        imported.forEach((impGroup, i) => { if (!usedImported.has(i)) result.push(impGroup); });
        return result;
      }

      function mergeBlockedCookies(localGroups, importedGroups) {
        return mergeMarkedGroups(localGroups, importedGroups);
      }

      function mergeWhitelistGroupsForImport(localGroups, importedGroups) {
        const local = Array.isArray(localGroups) ? localGroups : [];
        const imported = Array.isArray(importedGroups) ? importedGroups : [];
        const result = [];
        const usedImported = new Set();

        local.forEach((localGroup) => {
          const localDesc = String(localGroup.desc || '').trim();
          let matched = false;
          for (let i = 0; i < imported.length; i++) {
            if (usedImported.has(i)) continue;
            const impGroup = imported[i];

            const impDesc = String(impGroup.desc || '').trim();
            if (localDesc && impDesc && localDesc === impDesc) {
              matched = true;
              usedImported.add(i);
              const mergedThreads = Array.from(new Set([...(localGroup.threads || []), ...(impGroup.threads || [])]));
              const mergedCookies = Array.from(new Set([...(localGroup.cookies || []), ...(impGroup.cookies || [])]));
              result.push({ ...localGroup, ...impGroup, desc: impDesc || localDesc, threads: mergedThreads, cookies: mergedCookies });
              break;
            }
          }
          if (!matched) result.push(localGroup);
        });
        imported.forEach((impGroup, i) => { if (!usedImported.has(i)) result.push(impGroup); });
        return result;
      }

      function mergeBlockedKeywords(localValue, importedValue) {
        const localGroups = normalizeBlockedKeywordGroups(localValue);
        const importedGroups = normalizeBlockedKeywordGroups(importedValue);
        const allLocalKws = new Set(flattenBlockedKeywords(localGroups));
        const result = localGroups.map((g) => ({ value: g.value }));
        importedGroups.forEach((impGroup) => {
          const impKws = Utils.strToList(impGroup.value);
          if (!impKws.length) return;
          const hasNew = impKws.some((kw) => !allLocalKws.has(kw));
          if (hasNew) result.push({ value: impGroup.value });
        });
        return result;
      }

      function mergeSettingsForFullImport(localSettings, importedSettings) {
        const result = Object.assign({}, localSettings);
        FULL_IMPORT_DIRECT_OVERRIDE_KEYS.forEach((key) => {
          if (key in importedSettings) result[key] = importedSettings[key];
        });
        result.favoriteThreads = mergeFavoriteThreads(localSettings.favoriteThreads, importedSettings.favoriteThreads);
        result.subscriptionFeeds = mergeSubscriptionFeeds(localSettings.subscriptionFeeds, importedSettings.subscriptionFeeds);
        result.blockedKeywords = mergeBlockedKeywords(localSettings.blockedKeywords, importedSettings.blockedKeywords);
        result.markedGroups = mergeMarkedGroups(localSettings.markedGroups, importedSettings.markedGroups);
        result.blockedCookies = mergeBlockedCookies(localSettings.blockedCookies, importedSettings.blockedCookies);
        result.threadCookieWhitelistGroups = mergeWhitelistGroupsForImport(localSettings.threadCookieWhitelistGroups, importedSettings.threadCookieWhitelistGroups);
        return result;
      }

      function mergeThreadHistoryStore(localStore, importedStore) {
        const local = normalizeThreadHistoryStore(localStore);
        const imported = normalizeThreadHistoryStore(importedStore);
        const result = Object.assign({}, local);
        result.items = Object.assign({}, local.items);
        Object.keys(imported.items).forEach((key) => {
          const impItem = imported.items[key];
          if (!result.items[key]) {
            result.items[key] = impItem;
          } else {
            const localItem = result.items[key];
            result.items[key] = {
              ...localItem,
              ...impItem,
              lastVisitedAt: Math.max(Number(localItem.lastVisitedAt) || 0, Number(impItem.lastVisitedAt) || 0),
              page: Math.max(Number(localItem.page) || 0, Number(impItem.page) || 0),
              visitCount: Math.max(Number(localItem.visitCount) || 0, Number(impItem.visitCount) || 0),
              title: impItem.title || localItem.title,
              name: impItem.name || localItem.name,
            };
          }
        });
        result.order = Object.keys(result.items)
          .sort((a, b) => (Number(result.items[b].lastVisitedAt) || 0) - (Number(result.items[a].lastVisitedAt) || 0));
        return result;
      }

      function mergePostHistoryStore(localStore, importedStore) {
        const local = normalizePostHistoryStore(localStore);
        const imported = normalizePostHistoryStore(importedStore);
        const result = Object.assign({}, local);
        result.items = Object.assign({}, local.items);
        const STATUS_PRIORITY = { confirmed: 3, unconfirmed: 2, pending: 1, failed: 0 };
        Object.keys(imported.items).forEach((key) => {
          const impItem = imported.items[key];
          if (!result.items[key]) {
            result.items[key] = impItem;
          } else {
            const localItem = result.items[key];
            const localStatus = STATUS_PRIORITY[localItem.status] || 0;
            const impStatus = STATUS_PRIORITY[impItem.status] || 0;
            result.items[key] = {
              ...localItem,
              ...impItem,
              status: impStatus >= localStatus ? impItem.status : localItem.status,
              page: Math.max(Number(localItem.page) || 0, Number(impItem.page) || 0),
              submittedAt: Math.min(Number(localItem.submittedAt) || Infinity, Number(impItem.submittedAt) || Infinity),
              contentText: impItem.contentText || localItem.contentText,
              forumName: impItem.forumName || localItem.forumName,
            };
          }
        });
        result.order = Object.keys(result.items)
          .sort((a, b) => (Number(result.items[b].submittedAt) || 0) - (Number(result.items[a].submittedAt) || 0));
        return result;
      }

      function normalizeDraftExportText(text) {
        return String(text || '')
          .replace(/^\uFEFF/, '')
          .replace(/[\u200B\u200C\u200D\uFEFF\u200E\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069]/g, '')
          .trim();
      }

      function collectDraftsForExport() {
        const registry = getDraftRegistry();
        const items = {};
        registry.forEach((key) => {
          const raw = readDraftValue(key);
          const clean = normalizeDraftExportText(raw);
          if (clean) items[key] = raw;
        });
        return { registry: Object.keys(items), items };
      }

      function applyDraftsFromImport(drafts) {
        if (!drafts || typeof drafts !== 'object') return { imported: 0, overwritten: 0 };
        const items = drafts.items || {};
        let imported = 0;
        let overwritten = 0;
        const newRegistry = new Set(getDraftRegistry());
        Object.keys(items).forEach((key) => {
          const clean = normalizeDraftExportText(items[key]);
          if (!clean) return;
          const existing = readDraftValue(key);
          if (existing === items[key]) return;
          if (existing) overwritten++;
          else imported++;
          GM_setValue(key, items[key]);
          newRegistry.add(key);
        });
        saveDraftRegistry(Array.from(newRegistry));
        return { imported, overwritten };
      }

      function mergeKaomojiStats(localStats, importedStats) {
        const local = (localStats && typeof localStats === 'object') ? localStats : {};
        const imported = (importedStats && typeof importedStats === 'object') ? importedStats : {};
        const result = Object.assign({}, local);
        Object.keys(imported).forEach((key) => {
          const impVal = imported[key];
          const localVal = result[key];
          if (!localVal) {
            result[key] = impVal;
          } else if (typeof impVal === 'object' && typeof localVal === 'object') {
            const localCount = Number(localVal.count) || 0;
            const impCount = Number(impVal.count) || 0;
            const localLast = Number(localVal.lastUsed) || 0;
            const impLast = Number(impVal.lastUsed) || 0;
            result[key] = {
              count: localCount + impCount,
              lastUsed: Math.max(localLast, impLast)
            };
          }
        });
        return result;
      }

      function collectFullExportPayload(selection) {
        const payload = {};
        if (selection.settings) {
          payload.myScriptSettings = Object.assign({}, SettingPanel.defaults, GM_getValue(SettingPanel.key, {}));
        }
        if (selection.threadHistory) {
          payload.threadHistory = normalizeThreadHistoryStore(GM_getValue(THREAD_HISTORY_STORAGE_KEY, null));
        }
        if (selection.postHistory) {
          payload.postHistory = normalizePostHistoryStore(GM_getValue(POST_HISTORY_STORAGE_KEY, null));
        }
        if (selection.drafts) {
          payload.drafts = collectDraftsForExport();
        }
        if (selection.kaomojiStats) {
          payload.kaomojiStats = GM_getValue('kaomojiUsageStats', {});
        }
        return payload;
      }

      function buildFullExportFile(selection) {
        const payload = collectFullExportPayload(selection);
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:]/g, '-').replace(/\..+/, '');
        const scriptVersion = typeof VERSION !== 'undefined' ? VERSION : (typeof GM_info !== 'undefined' ? GM_info.script.version : 'unknown');
        const platform = typeof GM_info !== 'undefined' && GM_info.scriptHandler ? 'userscript' : 'extension';
        return {
          file: {
            meta: { format: 'xdex-full-export', schemaVersion: FULL_EXPORT_SCHEMA_VERSION, exportedAt: now.toISOString(), source: 'nmbxd-EX', scriptVersion, platform },
            selection,
            strategyHints: { settings: 'merge', threadHistory: 'merge', postHistory: 'merge', drafts: 'override-imported', kaomojiStats: 'accumulate' },
            summary: {
              threadHistoryCount: selection.threadHistory ? Object.keys((payload.threadHistory || {}).items || {}).length : 0,
              postHistoryCount: selection.postHistory ? Object.keys((payload.postHistory || {}).items || {}).length : 0,
              draftCount: selection.drafts ? (payload.drafts.registry || []).length : 0,
              kaomojiStatsEntries: selection.kaomojiStats ? Object.keys(payload.kaomojiStats || {}).length : 0,
            },
            payload
          },
          filename: `x岛-ex-full-export-${timestamp}.json`
        };
      }

      function downloadFullExportFile(fileData) {
        const blob = new Blob([JSON.stringify(fileData.file, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileData.filename;
        a.click();
        URL.revokeObjectURL(a.href);
      }

      function parseFullExportFile(text) {
        let parsed;
        try { parsed = JSON.parse(text); } catch (e) { return { valid: false, error: '文件格式错误，无法解析 JSON' }; }
        if (!parsed || typeof parsed !== 'object') return { valid: false, error: '文件内容无效' };
        const meta = parsed.meta || {};
        if (meta.format !== 'xdex-full-export') return { valid: false, error: '不支持的文件格式，请使用 X岛-EX 完整数据导出文件' };
        if (!meta.schemaVersion || meta.schemaVersion > FULL_EXPORT_SCHEMA_VERSION) return { valid: false, error: `不支持的 schema 版本: ${meta.schemaVersion}` };
        if (!parsed.payload || typeof parsed.payload !== 'object') return { valid: false, error: '文件缺少 payload 数据' };
        return { valid: true, data: parsed };
      }

      function applyFullImportPayload(importData) {
        const payload = importData.payload;
        const report = {};

        if (payload.myScriptSettings) {
          const local = Object.assign({}, SettingPanel.defaults, GM_getValue(SettingPanel.key, {}));
          const merged = mergeSettingsForFullImport(local, payload.myScriptSettings);
          GM_setValue(SettingPanel.key, merged);
          report.settings = { mode: 'merge', changed: true };
        }

        if (payload.threadHistory) {
          const local = normalizeThreadHistoryStore(GM_getValue(THREAD_HISTORY_STORAGE_KEY, null));
          const merged = mergeThreadHistoryStore(local, payload.threadHistory);
          GM_setValue(THREAD_HISTORY_STORAGE_KEY, merged);
          report.threadHistory = { mode: 'merge', count: Object.keys(merged.items || {}).length };
        }

        if (payload.postHistory) {
          const local = normalizePostHistoryStore(GM_getValue(POST_HISTORY_STORAGE_KEY, null));
          const merged = mergePostHistoryStore(local, payload.postHistory);
          GM_setValue(POST_HISTORY_STORAGE_KEY, merged);
          report.postHistory = { mode: 'merge', count: Object.keys(merged.items || {}).length };
        }

        if (payload.drafts) {
          const result = applyDraftsFromImport(payload.drafts);
          report.drafts = { mode: 'override-imported', imported: result.imported, overwritten: result.overwritten };
        }

        if (payload.kaomojiStats) {
          const local = GM_getValue('kaomojiUsageStats', {});
          const merged = mergeKaomojiStats(local, payload.kaomojiStats);
          GM_setValue('kaomojiUsageStats', merged);
          report.kaomojiStats = { mode: 'accumulate', changed: true };
        }

        return report;
      }
      // === 完整数据导入导出 end ===

      function buildJSONC(state) {
        const filtered = {};
        for (const [k, v] of Object.entries(state)) {
          if (!FIXED_KEYS.has(k)) filtered[k] = v; // 不清理零宽字符，保留用户原始数据
        }

        const meta = {
          _meta: {
            version: (typeof VERSION !== 'undefined' ? VERSION : GM_info.script.version),
            exportedAt: new Date().toISOString(),
            source: 'nmbxd-EX'
          },
          settings: filtered
        };
        const lines = JSON.stringify(meta, null, 2).split('\n');
        // 在 _meta 前加注释，在 settings 闭合括号前加尾随逗号
        let result = lines.map((line, i) => {
          if (i === 0) return line; // 开头 {
          if (/"_meta"/.test(line)) return '  // X岛-EX 配置文件\n' + line;
          if (/^}$/.test(line.trim())) return line; // 最外层 }
          return line;
        }).join('\n');
        // 给 settings 对象的最后一个字段后加尾随逗号
        result = result.replace(/("settings":\s*\{[\s\S]*?)(\n\s*\}\s*\n\s*\})/, (m, inner, close) => {
          const trimmed = inner.replace(/,\s*$/, '');
          return trimmed + ',\n' + close.replace(/^\n/, '');
        });
        return result;
      }

      function validateImport(incoming) {
        const defaults = SettingPanel.defaults;
        if (typeof incoming !== 'object' || incoming === null) {
          toast('配置内容无效'); return null;
        }
        const validated = {};
        let skipped = 0;
        for (const [key, val] of Object.entries(incoming)) {
          if (FIXED_KEYS.has(key)) continue;         // 固定项直接跳过
          if (!(key in defaults)) continue;           // 未知字段跳过
          if (Array.isArray(defaults[key]) && !Array.isArray(val)) { skipped++; continue; }
          if (typeof val !== typeof defaults[key]) { skipped++; continue; }
          validated[key] = val;
        }
        return Object.assign({}, defaults, validated);
      }

      function handleImportText(text) {

        if (!text || !text.trim()) { toast('内容为空'); return; }

        // 只清理文本开头的 BOM，不清理内容中的零宽字符（用户数据可能包含零宽空格）
        text = text.replace(/^\uFEFF/, '');
        let parsed;
        try {
          parsed = parseJSONC(text);
        } catch (e) {
          toast('配置文件格式错误'); return;
        }
        const incoming = parsed.settings || parsed;
        const merged = validateImport(incoming);
        if (!merged) return;

        SettingPanel.__pendingImport = merged;
        // 显示保存按钮
        $('#btn_sp_importExport').removeClass('xdex-inv');
        toast('格式正确，请点击[应用]');
      }

      // 从剪贴板导入
      $('#sp_importClipboard').off('click').on('click', async () => {
        try {
          const text = await navigator.clipboard.readText();
          handleImportText(text);
        } catch (e) {
          toast('无法读取剪贴板，请先点击页面后再试');
        }
      });

      // 导出到剪贴板
      $('#sp_exportClipboard').off('click').on('click', async () => {
        try {
          const jsonc = buildJSONC(SettingPanel.state);
          await navigator.clipboard.writeText(jsonc);
          toast('已复制到剪贴板');
        } catch (e) {
          toast('复制失败');
        }
      });

      // 从文件导入
      $('#sp_importFile').off('click').on('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.jsonc,.txt';
        input.onchange = () => {
          const file = input.files && input.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => handleImportText(reader.result);
          reader.onerror = () => toast('文件读取失败');
          reader.readAsText(file);
        };
        input.click();
      });

      // 导出为文件
      $('#sp_exportFile').off('click').on('click', () => {
        try {
          const jsonc = buildJSONC(SettingPanel.state);
          const blob = new Blob([jsonc], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'x岛-ex-settings-v' + (typeof VERSION !== 'undefined' ? VERSION : GM_info.script.version) + '.jsonc';
          a.click();
          URL.revokeObjectURL(a.href);
          toast('配置已导出');
        } catch (e) {
          toast('导出失败');
        }
      });

      // 导入/导出折叠块的"保存"按钮
      $('#btn_sp_importExport').off('click').on('click', e => {
        e.stopPropagation();
        if (SettingPanel.__pendingImport) {
          GM_setValue(SettingPanel.key, SettingPanel.__pendingImport);
          SettingPanel.state = SettingPanel.__pendingImport;
          delete SettingPanel.__pendingImport;
          $('#btn_sp_importExport').addClass('xdex-inv');
          toast('配置已导入，即将刷新');
          setTimeout(() => location.reload(), 800);
        } else {
          toast('没有待导入的配置');
        }
      });

      // 关闭面板时清除暂存
      const _origClose = $('#sp_close,#sp_cover').off.bind($('#sp_close,#sp_cover'), 'click');
      delete SettingPanel.__pendingImport;

      // ── 完整数据导入导出 ──
      $('#btn_sp_fullExport_reset').off('click').on('click', (e) => {
        e.stopPropagation();
        const selection = {
          settings: $('#sp_fullExport_settings').is(':checked'),
          threadHistory: $('#sp_fullExport_threadHistory').is(':checked'),
          postHistory: $('#sp_fullExport_postHistory').is(':checked'),
          drafts: $('#sp_fullExport_drafts').is(':checked'),
          kaomojiStats: $('#sp_fullExport_kaomojiStats').is(':checked'),
        };
        if (!Object.values(selection).some(Boolean)) { toast('请至少勾选一项'); return; }
        const parts = [];
        if (selection.settings) parts.push('设置（恢复默认）');
        if (selection.threadHistory) parts.push('浏览历史');
        if (selection.postHistory) parts.push('发言历史');
        if (selection.drafts) parts.push('草稿');
        if (selection.kaomojiStats) parts.push('颜文字统计');
        if (!window.confirm(`确定要清除以下项目的全部内容吗？\n\n${parts.join('、')}\n\n清除后页面将自动刷新。`)) return;
        try {
          if (selection.settings) GM_setValue(SettingPanel.key, {});
          if (selection.threadHistory) GM_setValue(THREAD_HISTORY_STORAGE_KEY, normalizeThreadHistoryStore(null));
          if (selection.postHistory) GM_setValue(POST_HISTORY_STORAGE_KEY, normalizePostHistoryStore(null));
          if (selection.drafts) {
            getDraftRegistry().forEach((key) => { try { GM_deleteValue(key); } catch (_) {} });
            saveDraftRegistry([]);
          }
          if (selection.kaomojiStats) GM_setValue('kaomojiUsageStats', {});
          toast('已清除所选项目，即将刷新');
          setTimeout(() => location.reload(), 800);
        } catch (err) {
          toast('清除失败: ' + (err.message || err));
        }
      });

      $('#btn_sp_fullExport_export').off('click').on('click', (e) => {
        e.stopPropagation();
        const selection = {
          settings: $('#sp_fullExport_settings').is(':checked'),
          threadHistory: $('#sp_fullExport_threadHistory').is(':checked'),
          postHistory: $('#sp_fullExport_postHistory').is(':checked'),
          drafts: $('#sp_fullExport_drafts').is(':checked'),
          kaomojiStats: $('#sp_fullExport_kaomojiStats').is(':checked'),
        };
        if (!Object.values(selection).some(Boolean)) { toast('请至少勾选一项'); return; }
        const fileData = buildFullExportFile(selection);
        downloadFullExportFile(fileData);
        toast('完整数据已导出');
      });

      $('#btn_sp_fullExport_import').off('click').on('click', (e) => {
        e.stopPropagation();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = () => {
          const file = input.files && input.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const result = parseFullExportFile(reader.result);
            if (!result.valid) { toast(result.error); return; }
            SettingPanel.__pendingFullImport = result.data;
            renderFullImportPreview(result.data);
          };
          reader.readAsText(file);
        };
        input.click();
      });

      function renderFullImportPreview(data) {
        const $preview = $('#sp_fullExport_import_preview').empty().show();
        const meta = data.meta || {};
        const summary = data.summary || {};
        let html = '<div style="font-size:12px;color:#333;">';
        html += `<div>来源版本: ${meta.scriptVersion || '?'} | 导出时间: ${meta.exportedAt ? new Date(meta.exportedAt).toLocaleString() : '?'}</div>`;
        html += '<div style="margin-top:4px;">包含数据:</div><ul style="margin:2px 0;padding-left:20px;">';
        if (summary.threadHistoryCount) html += `<li>浏览历史: ${summary.threadHistoryCount} 条</li>`;
        if (summary.postHistoryCount) html += `<li>发言历史: ${summary.postHistoryCount} 条</li>`;
        if (summary.draftCount) html += `<li>草稿: ${summary.draftCount} 条</li>`;
        if (summary.kaomojiStatsEntries) html += `<li>颜文字统计: ${summary.kaomojiStatsEntries} 项</li>`;
        if (data.selection && data.selection.settings) html += '<li>设置配置（合并导入）</li>';
        html += '</ul>';
        html += '<div style="color:#666;margin-top:4px;">导入策略: 设置合并、历史合并、草稿冲突时导入端覆盖、颜文字累加</div>';
        html += '</div>';
        const $btn = $('<button style="margin-top:6px;padding:4px 10px;">应用导入</button>');
        $btn.on('click', () => {
          if (!SettingPanel.__pendingFullImport) { toast('无可导入数据'); return; }
          if (!window.confirm('确定要导入完整数据吗？\n导入完成后页面将自动刷新。')) return;
          const report = applyFullImportPayload(SettingPanel.__pendingFullImport);
          SettingPanel.__pendingFullImport = null;
          $preview.hide();
          const parts = [];
          if (report.settings) parts.push('设置已合并');
          if (report.threadHistory) parts.push(`浏览历史 ${report.threadHistory.count} 条`);
          if (report.postHistory) parts.push(`发言历史 ${report.postHistory.count} 条`);
          if (report.drafts) parts.push(`草稿 ${report.drafts.imported} 条导入${report.drafts.overwritten ? `, ${report.drafts.overwritten} 条覆盖` : ''}`);
          if (report.kaomojiStats) parts.push('颜文字已累加');
          toast(`完整数据导入完成: ${parts.join('、')}，即将刷新`);
          setTimeout(() => location.reload(), 800);
        });
        $preview.html(html).append($btn);
      }

      $('#sp_apply').off('click').on('click', ()=>{
        collectReloadRequiredSettingsFromPanel();
        let valid = true;
        this.state.blockedKeywords = collectBlockedKeywordGroupsFromPanel();
        const favoriteThreads = collectFavoriteThreadsFromPanel();
        if (!favoriteThreads) return;
        this.state.favoriteThreads = favoriteThreads;
        this.state.replyModeDefault = $('#sp_replyModeDefault').val();
        this.state.replyExtraDefault = $('#sp_replyExtraDefault').val();
        this.state.kaomojiSort = $('#sp_kaomojiSort').val() || 'default';
        this.state.applyImageHideMode = $('#sp_applyImageHideMode').val() || 'default';
        this.state.threadCookieWhitelistDisplayMode = $('#sp_threadCookieWhitelistDisplayMode').val() || 'fold';
        this.state.poAnnotationSideDisplayMode = $('#sp_poAnnotationSideDisplayMode').val() || 'collapse';
        this.state.timeDisplayMode = ($('#sp_timeDisplayMode').val() === 'exact') ? 'exact' : 'relative';

        // 标记分组（双字段结构）
        const mk = collectMarkedGroupsFromPanel();
        if (!mk) return;
        this.state.markedGroups = mk;

        // 屏蔽分组（双字段结构）
        const bk = [];
        $('#blocked-inputs-container .blocked-row').each((idx, el)=>{
          const $row = $(el);
          const desc = ($row.find('.blocked-desc-input').val() || '').trim();
          const cookies = Utils.strToList(($row.find('.blocked-cookies-input').val() || '').trim());
          if (!desc && !cookies.length) return;
          if (!isValidDesc(desc)) { toast(`第${idx + 1}条备注过长`); valid=false; return false; }
          if (!cookies.length) { toast(`第${idx + 1}条未指定饼干`); valid=false; return false; }
          if (cookies.some(id=>!Utils.cookieLegal(id))) { toast(`第${idx + 1}条存在不合法饼干`); valid=false; return false; }
          bk.push({ desc, cookies });
        });
        if (!valid) return;
        this.state.blockedCookies = bk;

        const wlg = [];
        $('#thread-cookie-whitelist-inputs-container .thread-cookie-whitelist-row').each((idx, el) => {
          const $row = $(el);
          const desc = ($row.find('.thread-cookie-whitelist-desc-input').val() || '').trim();
          const threads = Utils.strToList(($row.find('.thread-cookie-whitelist-threads-input').val() || '').trim());
          const cookies = Utils.strToList(($row.find('.thread-cookie-whitelist-cookies-input').val() || '').trim());
          if (!desc && !threads.length && !cookies.length) return;
          if (!isValidDesc(desc)) { toast(`第${idx + 1}条备注过长`); valid = false; return false; }
          if (!threads.length) { toast(`第${idx + 1}条未指定串号`); valid = false; return false; }
          if (threads.some(id => !isValidThreadId(id))) { toast(`第${idx + 1}条存在不合法串号`); valid = false; return false; }
          if (!cookies.length) { toast(`第${idx + 1}条未指定饼干`); valid = false; return false; }
          if (cookies.some(id => !Utils.cookieLegal(id))) { toast(`第${idx + 1}条存在不合法饼干`); valid = false; return false; }
          wlg.push({ desc, threads, cookies, rowIndex: idx + 1 });
        });
        if (!valid) return;
        const { groups: mergedWhitelistGroups, mergeEvents } = mergeThreadCookieWhitelistGroups(wlg);
        this.state.threadCookieWhitelistGroups = mergedWhitelistGroups;
        mergeEvents.forEach((event) => {
          if (event.desc) {
            toast(`第${event.rowIndex}条（${event.desc}）中的串号 ${event.threadId} 已与现有只看规则合并`);
          } else {
            toast(`第${event.rowIndex}条的串号 ${event.threadId}（${event.cookies.join('，')}）已与现有只看规则合并`);
          }
        });

        // 原版
        // GM_setValue(this.key, this.state);
        // toast('保存成功，即将刷新页面');
        // setTimeout(()=>location.reload(),500);
        // Edge双重刷新版
        // GM_setValue(this.key, this.state);
        // console.log('GM_setValue执行成功');

        // // 立即读取验证
        // const saved = GM_getValue(this.key);
        // console.log('读取验证:', JSON.stringify(saved));

        // toast('保存成功，即将刷新页面');

        // // Edge 浏览器需要更长的延迟确保存储完成
        // setTimeout(() => {
        //   // 再次验证保存是否成功
        //   const finalCheck = GM_getValue(this.key);
        //   console.log('刷新前最终验证:', JSON.stringify(finalCheck));
        //   // 两次刷新
        //   try {
        //     // 设置标记，下一次页面加载时脚本会检测到并执行第二次重载
        //     localStorage.setItem(this.key + '_doSecondReload', '1');
        //   } catch (e) {
        //     console.warn('[Settings] set second-reload flag failed', e);
        //   }
        //   location.reload();
        // }, 800);  // 将延迟从 500ms 增加到 800ms
        // 当前版本
        GM_setValue(this.key, this.state);
        console.log('GM_setValue执行成功');

        // 立即读取验证
        const saved = GM_getValue(this.key);
        console.log('读取验证:', JSON.stringify(saved));

        toast('保存成功，即将刷新页面');

        // Edge 浏览器需要更长的延迟确保存储完成
        setTimeout(() => {
          // 再次验证保存是否成功
          const finalCheck = GM_getValue(this.key);
          console.log('刷新前最终验证:', JSON.stringify(finalCheck));
          // 只刷新一次
          location.reload();
        }, 800);  // 将延迟从 500ms 增加到 800ms

      });

      // 关闭面板
      $('#sp_close,#sp_cover').off('click').on('click', e=>{
        if (e.target.id==='sp_close' || e.target.id==='sp_cover')
          $('#sp_cover').fadeOut();
      });

      //鼠标悬浮在具体功能上显示提示
      // ====== 1. 定义功能描述映射表 ======

      const spDescriptions = {
        sp_enableCookieSwitch: '发帖框上方添加饼干切换器，单击即可快速切换饼干。使用前可单击“刷新”以获取当前登陆账户最新饼干列表。',
        sp_enablePaginationDuplication: '在串首页添加页码导航栏',
        sp_disableWatermark: '取消发图默认勾选的水印选项',
        sp_updatePreviewCookie: '为“增强X岛匿名版”添加的预览框显示真实饼干',
        sp_hideEmptyTitleEmail: '隐藏帖内无标题、无名氏和版规提示，优化显示效果，减少版面占用',
        sp_enableExternalImagePreview: '直接显示外部图床的图片',
        sp_enableUpdateCheck: '控制是否自动检查脚本更新；关闭后不会发起远程更新请求，也不会继续安排后续检查。',
        sp_enableAutoCookieRefresh: '回到X岛页面后自动刷新饼干，以防错饼',
        sp_enableAutoCookieRefreshToast: '自动刷新时显示toast提示，触发频率较高，建议关闭',
        sp_enableSeamlessPaging: '阅读到页面底部时无缝加载下一页并为新页首添加页码提示',
        sp_enableAutoSeamlessPaging: '滚动到页面底部后自动触发无缝翻页，关闭则可使用按钮手动无缝翻页',
        sp_enableHDImageAndLayoutFix: 'X岛-揭示板的增强型体验:默认加载原图而非缩略图，并为所有图片添加X岛自带图片控件；调整布局，防止文字与图片溢出',
        sp_enableImageContextMenu: 'userscript模式：为图片/动图启用自定义右键菜单，关闭后保留浏览器原生图片右键菜单，复制图片过程中需要浏览器窗口在前台。\nextension模式：在浏览器右键菜单中添加“X岛-EX：复制GIF/APNG”按钮，仅用于复制GIF/APNG，在复制GIF/APNG过程中可不在前台。',
        sp_enableLinkBlank: 'X岛-揭示板的增强型体验:串页链接在新标签页打开',
        sp_enableAutoUrlLinkify: '自动将正文中的网址转换为可点击的新标签页蓝色链接，可与“拓展引用格式”共存',
        sp_enableQuotePreview: '优化引用弹窗显示，将鼠标悬停出现引用弹窗改为点击显示引用弹窗，引用弹窗可持久存在，支持嵌套、拖拽，点击非引用弹窗区域或ESC键可关闭当前引用弹窗，点击右下角×以关闭全部引用弹窗',
        sp_extendQuote: '拓展引用格式，支持除“>>No.66994128”标准引用格式外的引用，例如“>>66994128”、“66994128”、“No.66994128”，同样支持“优化引用弹窗”',
        sp_threadCookieWhitelistModeEnabled: '只看饼干模式。折叠：保持原版只看饼干折叠逻辑；隐藏：未命中的回复直接隐藏；分栏：重点回复保留在主阅读流，观众回复进入侧栏批注。',
        sp_poAnnotationSideDisplayMode: '分栏模式下观众回复栏的显示状态。展开：完整展开；收起：默认高度不超过对应主回复高度，超出部分滚动。',
        sp_toggleSidebar: '来自acVMxuv的自动收起右侧扩展坞侧边栏，鼠标悬停时展开显示',
        sp_updateReplyNumbers: '添加当页内回复编号显示',
        sp_replaceRightSidebar: '增强右侧扩展坞功能，点击REPLY按钮打开回复弹窗，点击非回复弹窗区域或ESC键可关闭回复弹窗，另外支持使用CTRL+ENTER发送消息',
        sp_interceptReplyForm: '拦截回复跳转中间页，使用toast提示发送成功/失败信息',
        sp_interceptReplyFormUnvcode: '不可明说的功能，请参照https://words-away.typeboom.com/说明',
        sp_interceptReplyFormU200B: '优先使用插入零宽空格模式而非unvcode替换模式',
        sp_interceptReplyFormAutoCompress: '自动压缩>2048KB的图片。',
        sp_kaomojiEnhancer: '拓展颜文字功能，添加更多颜文字（部分来自蓝岛）,优化选择颜文字弹窗，选择颜文字后可插入光标所在处。支持排序：默认（原顺序）/常用（使用次数高优先）/最近（最近使用优先，未使用保持默认顺序）。',
        sp_highlightPO: '为回复添加Po主标志，PO主回复编号使用角标显示',
        sp_enhancePostFormLayout: '优化发串/回复表单布局，将“送出”按钮移至颜文字栏目，折叠“标题”“E-mail”“名称”等不常用项目，节省版面',
        sp_applyFilters: '标记/屏蔽-饼干/关键词过滤规则\n折叠：匹配到的串/回复显示为可展开的按钮\n隐藏：匹配到的串/回复完全隐藏',
        sp_enhanceIsland: '增强X岛匿名版:\n1.发串前显示预览：麻麻再也不用担心我的ASCII ART排版失误了,另外支持预览插入图片和外部图床图片；\n2.自动保存编辑：记忆文本框内容（防止屏蔽词导致被吞），可以在翻页等各种页面切换后保存，仅在“回复成功”后删除，按主串号 "/t/xxxx" 分开存储；\n3.追记引用串号：点击串号回复时附加到光标所在处（或替换文本选区），可追记多条引用；\n4.人类友好的时间显示：如“5秒前”、“1小时前”、“昨天”等；\n5.粘贴插入图片：直接粘贴，将自动作为图片插入\n自动添加标题：将po主设置的标题或者第一行文字 + 页码设置为标签页标题',
        sp_timeDisplayMode: '切换串内时间显示方式。相对时间会在当前可见页面定时刷新；精确时间显示原始发帖时间。',
        sp_replyQuicklyOnBoardPage: '为板块页添加快速回复模式，在板块页即可回串，页面实时更新，无需跳转串内；并额外支持时间线内回串。\n“板块页默认模式”可选“发串/回复”两种模式，“回复默认模式”可选“临时/连续”两种回复模式，临时模式下回复成功即清除回串信息，连续模式可连续回复直到手动清理回串信息，搭配回复浮窗使用效果更佳',
        sp_enablePostExpand: '为板块页内串添加“展开/收起”按钮，点击即可切换长串的完整显示与折叠显示',
        sp_searchServiceBy4sY: '官方搜索当前不可用，公告详见：https://www.nmbxd1.com/t/56546294\n替换搜索按钮为来自4sYbzEX的“野生搜索酱”，具体使用方法请查阅原串：https://www.nmbxd.com/t/64792841',
        sp_enableImageHideMode: '“默认/模糊/无图/Tips”四种模式可选。默认模式不做修改；选择模糊模式时可使用鼠标悬浮暂时预览图片；无图模式隐藏图片；Tips模式随机显示Tips娘，点击后可恢复原图显示',
        sp_enableFavoriteThreads: '在侧边栏添加常用串，支持串内一键添加，并优先跳转浏览历史中的最近阅读页',
        sp_enableThreadHistory: '保存浏览历史，支持搜索，可切换多种排序方式',
        sp_enablePostHistory: '保存发言历史，分为“我的主题/我的回复”，并记录回复所在页面，支持搜索，可切换多种排序方式',
        sp_enableSubscriptionFeed: '使用移动端订阅号进行同步，支持添加多个订阅号',
        sp_postAfterAction: '发串成功后的行为：新标签页打开新串，或刷新当前板块页回到顶部',
        sp_subscriptionFeeds: '管理X岛订阅号，可添加多个订阅号并设置备注，用于在"我的订阅"标签中查看和管理订阅内容',
      };

      // 更新日志弹窗（放在 spDescriptions 之后，避免引用未定义）
      if (!document.getElementById('sp_update_log')) {
        const $log = $(
          '<div id=\"sp_update_log\" style=\"display:none;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:10001;\">' +
            '<div style=\"position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:360px;background:var(--xdex-sp-panel-bg);border:1px solid var(--xdex-sp-border);border-radius:8px;box-shadow:0 2px 12px var(--xdex-sp-shadow);\">' +
              '<div style=\"padding:10px 12px;border-bottom:1px solid var(--xdex-sp-border);display:flex;align-items:center;justify-content:space-between;\">' +
                '<span class=\"xdex-update-log-title\" style=\"font-weight:bold;\">更新日志</span>' +
                '<span id=\"sp_update_log_close\" style=\"cursor:pointer;\">✕</span>' +
              '</div>' +
              '<div class=\"xdex-update-log-body\" style=\"padding:12px;font-size:12px;white-space:pre-line;\">' +
                (CHANGELOG || '暂无更新说明') +
              '</div>' +
              '<div class=\"xdex-update-log-actions\" style=\"display:none;padding:0 12px 12px;gap:8px;justify-content:flex-end;\">' +
                '<button id=\"sp_update_log_update_now\" style=\"padding:4px 10px;\">立即更新</button>' +
                '<button id=\"sp_update_log_ignore_version\" style=\"padding:4px 10px;\">忽略此版本</button>' +
                '<button id=\"sp_update_log_dismiss_today\" style=\"padding:4px 10px;\">今日关闭</button>' +
              '</div>' +
            '</div>' +
          '</div>'
        );
        $('body').append($log);
        $('#sp_update_log_close,#sp_update_log').on('click', (e) => {
          if (e.target.id === 'sp_update_log') {
            closeUpdateLogDialog({ treatAsDismiss: false, reason: 'overlay' });
            return;
          }
          if (e.target.id === 'sp_update_log_close') {
            const isRemoteMode = $('#sp_update_log').attr('data-update-mode') === 'remote';
            closeUpdateLogDialog({ treatAsDismiss: isRemoteMode, reason: 'close-button' });
          }
        });
        $('#sp_update_log_update_now').on('click', () => {
          const state = getUpdateCheckState();
          closeUpdateLogDialog({ reason: 'update-now' });
          flashFooterUpdateHighlight(state.pendingUpdateSource || '');
        });
        $('#sp_update_log_ignore_version').on('click', () => {
          const state = getUpdateCheckState();
          if (state.pendingUpdateVersion) {
            state.ignoredVersion = state.pendingUpdateVersion;
            setUpdateCheckState(state);
            updateSettingsButtonBadge(state);
          }
          closeUpdateLogDialog({ reason: 'ignore-version' });
        });
        $('#sp_update_log_dismiss_today').on('click', () => {
          closeUpdateLogDialog({ treatAsDismiss: true, reason: 'dismiss-today' });
        });
      }

      // 版本号同步到当前脚本版本
      try {
        const ver = (typeof GM_info !== 'undefined' && GM_info && GM_info.script && GM_info.script.version) ? GM_info.script.version : '';
        if (ver) $('#sp_version_link').text('v' + ver);
      } catch (e) {}

      $('#sp_version_link').off('click').on('click', (e) => {
        e.preventDefault();
        openUpdateLogDialog('local');
      });

// ====== 2. 创建 tooltip 元素并添加样式 ======
      if (!$('#sp_tooltip').length) {
        $('body').append('<div id="sp_tooltip"></div>');
        const tooltipStyle = `
          #sp_tooltip {
            position: fixed;
            max-width: 260px;
            background: rgba(0,0,0,0.85);
            color: #fff;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 12px;
            line-height: 1.4;
            pointer-events: none;
            display: none;
            z-index: 100000;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            transition: opacity 0.15s ease;
            opacity: 0;
            white-space: pre-line;
          }
          #sp_tooltip.show {
            display: block;
            opacity: 1;
          }
        `;
        $('<style>').text(tooltipStyle).appendTo('head');
      }

      // ====== 3. 绑定事件到每个设置项 ======
      $('#sp_checkbox_container input[type=checkbox]').each(function(){
        const id = this.id;
        const desc = spDescriptions[id];
        if (!desc) return;

        const $label = $(this).next('label');
        const $target = $label.length ? $label : $(this);

        $target.on('mouseenter', function(e){
          $('#sp_tooltip').text(desc)
            .css({ top: e.clientY + 12, left: e.clientX + 12 })
            .addClass('show');
        }).on('mousemove', function(e){
          const offsetX = 40; // 横向偏移量
          const offsetY = 0; // 纵向偏移量
          $('#sp_tooltip').css({
            top: e.clientY + offsetY,   // 保持纵向偏移
            left: e.clientX + offsetX   // 横向偏移改大，右移更多
          });

        }).on('mouseleave', function(){
          $('#sp_tooltip').removeClass('show');
        });
      });
      // 给额外的标题绑定提示
      $('#sp_replyQuicklyOnBoardPage').each(function(){
        const id = this.id;
        const desc = spDescriptions[id];
        if (!desc) return;
        $(this).on('mouseenter', function(e){
          $('#sp_tooltip').text(desc)
            .css({ top: e.clientY + 12, left: e.clientX + 12 })
            .addClass('show');
        }).on('mousemove', function(e){
          $('#sp_tooltip').css({ top: e.clientY, left: e.clientX + 40 });
        }).on('mouseleave', function(){
          $('#sp_tooltip').removeClass('show');
        });
      });

    },

    syncInputs() {
      // 勾选框
      [
        'enableCookieSwitch',
        'disableWatermark',
        'enablePaginationDuplication',
        'updatePreviewCookie',
        'hideEmptyTitleEmail',
        'enableExternalImagePreview',
        'enableUpdateCheck',
        'enableAutoCookieRefresh',
        'enableAutoCookieRefreshToast',
        'interceptReplyFormUnvcode',
        'interceptReplyFormU200B',
        'interceptReplyFormAutoCompress',
        'enableSeamlessPaging',
        'enableAutoSeamlessPaging',
        'enableHDImageAndLayoutFix',
        'enableImageContextMenu',
        'enableLinkBlank',
        'enableAutoUrlLinkify',
        'enableQuotePreview',
        'enableImageHideMode',
        'extendQuote',
        'enablePostExpandAll',
        'toggleSidebar'
      ].forEach(k=> $('#sp_'+k).prop('checked', this.state[k]));

      // 固定启用项：始终显示为开启
      $('#sp_enableImageHideMode').prop('checked', true);
      $('#sp_applyImageHideMode').val(this.state.applyImageHideMode || 'default');
      $('#sp_blockDisplayMode').val(this.state.blockDisplayMode || 'fold');
      $('#sp_threadCookieWhitelistDisplayMode').val(this.state.threadCookieWhitelistDisplayMode || 'fold');
      $('#sp_poAnnotationSideDisplayMode').val(this.state.poAnnotationSideDisplayMode || 'collapse');
      $('#sp_kaomojiSort').val(this.state.kaomojiSort || 'default');
      $('#sp_timeDisplayMode').val(this.state.timeDisplayMode === 'exact' ? 'exact' : 'relative');

      // 标记分组
      const groupsM = this.state.markedGroups.length ? this.state.markedGroups : [{desc:'',cookies:[]}];
      const $m = $('#marked-inputs-container').empty();
      groupsM.forEach((g, idx)=>{
        $m.append(buildCookieGroupTwoFieldRowHtml('marked', idx + 1, g));
      });

      // 屏蔽分组
      const groupsB = this.state.blockedCookies.length ? this.state.blockedCookies : [{desc:'',cookies:[]}];
      const $b = $('#blocked-inputs-container').empty();
      groupsB.forEach((g, idx)=>{
        $b.append(buildCookieGroupTwoFieldRowHtml('blocked', idx + 1, g));
      });

      const groupsW = this.state.threadCookieWhitelistGroups.length ? this.state.threadCookieWhitelistGroups : [{threads:[],cookies:[]}];
      const $w = $('#thread-cookie-whitelist-inputs-container').empty();
      groupsW.forEach((g, idx)=>{
        $w.append(buildThreadCookieWhitelistRowHtml(idx + 1, g));
      });

      const groupsK = normalizeBlockedKeywordGroups(this.state.blockedKeywords);
      const $k = $('#blocked-keyword-inputs-container').empty();
      (groupsK.length ? groupsK : [{value:''}]).forEach((g, idx)=>{
        $k.append(buildBlockedKeywordGroupRowHtml(idx + 1, g));
      });

      const favoriteThreads = normalizeFavoriteThreads(this.state.favoriteThreads);
      const $favoriteThreads = $('#favorite-thread-inputs-container').empty();
      (favoriteThreads.length ? favoriteThreads : [{desc:'', threadId:''}]).forEach((item, idx)=>{
        $favoriteThreads.append(buildFavoriteThreadRowHtml(idx + 1, item));
      });

      const subscriptionFeeds = Array.isArray(this.state.subscriptionFeeds) ? this.state.subscriptionFeeds : [];
      const $feeds = $('#subscription-feed-inputs-container').empty();
      (subscriptionFeeds.length ? subscriptionFeeds : [{desc:'', uuid:''}]).forEach((item, idx)=>{
        $feeds.append(buildSubscriptionFeedRowHtml(idx + 1, item));
      });

      $('#sp_replyModeDefault').val(this.state.replyModeDefault);
      $('#sp_replyExtraDefault').val(this.state.replyExtraDefault);

      // 初始折叠与按钮隐藏
      $('.sp_fold_body').hide();
      $('#btn_group_marked,#btn_sp_marked,#btn_group_blocked,#btn_sp_blocked,#btn_group_threadCookieWhitelist,#btn_sp_threadCookieWhitelist,#btn_group_blockedKeywords,#btn_sp_blockedKeywords,#btn_group_favoriteThreads,#btn_sp_favoriteThreads,#btn_group_subscriptionFeeds,#btn_sp_subscriptionFeeds,#btn_sp_importExport,#btn_sp_fullExport_reset,#btn_sp_fullExport_export,#btn_sp_fullExport_import').addClass('xdex-inv');

      $('#sp_replyModeDefault').val(this.state.replyModeDefault);
      $('#sp_replyExtraDefault').val(this.state.replyExtraDefault);

    }
  };

  /* --------------------------------------------------
   * tag 2. 回复编号
   * -------------------------------------------------- */
  // 数字样式：包裹为『n』
  const circledNumber = n => `『${n}』`;

  function updateReplyNumbers() {
    // 遍历每一个页面的回复区（含无缝加载的）
    $('.h-threads-item-replies').each(function () {
      let effectiveCount = 0;

      $(this).find('.h-threads-item-reply-icon').each(function () {
        const $reply = $(this).closest('[data-threads-id]');

        if ($reply.attr('data-threads-id') === '9999999') {
          // 特殊：小提示串号 -> 编号 0
          $(this).text(circledNumber(0));
        } else {
          // 普通回复 -> 依次递增
          effectiveCount++;
          $(this).text(circledNumber(effectiveCount));
        }
      });
    });
  }

  /* --------------------------------------------------
   * tag 3. 饼干标记 / 屏蔽 逻辑
   * -------------------------------------------------- */
  // 标记：支持同一饼干命中多个分组时，title 展示多行备注，颜色取首匹配组
  function extractCookieIdFromUidElement(el, fallbackText) {
    const datasetId = el && el.dataset ? el.dataset.xdexCookieId : '';
    if (datasetId) return datasetId;
    const font = el && el.querySelector ? el.querySelector('font') : null;
    if (font) {
      for (const node of font.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          const value = String(node.nodeValue || '').trim();
          if (value) return value;
        }
      }
    }
    const value = (String(fallbackText || '').split(':')[1] || fallbackText || '').trim();
    const match = String(value).match(/[A-Za-z0-9]{3,7}/);
    return match ? match[0] : value;
  }

  function wrapCookieMarkTargetPreserveHtml(el, color) {
    if (!el) return;
    const existing = el.querySelector('.xdex-cookie-mark-target');
    if (existing) {
      $(existing).css({ background: color, padding:'0 3px', borderRadius:'2px' });
      return;
    }
    const target = document.createElement('span');
    target.className = 'xdex-cookie-mark-target';
    $(target).css({ background: color, padding:'0 3px', borderRadius:'2px' });
    let passedColon = false;
    Array.from(el.childNodes).forEach(node => {
      if (!passedColon && node.nodeType === Node.TEXT_NODE) {
        const value = node.nodeValue || '';
        const index = value.indexOf(':');
        if (index !== -1) {
          node.nodeValue = value.slice(0, index + 1);
          const rest = value.slice(index + 1);
          if (rest) target.appendChild(document.createTextNode(rest));
          passedColon = true;
          return;
        }
      }
      if (passedColon) target.appendChild(node);
    });
    if (!target.childNodes.length) {
      while (el.firstChild) target.appendChild(el.firstChild);
    }
    el.appendChild(target);
  }

  function markAllCookies(groups, root) {
    const $scope = root ? $(root).find('span.h-threads-info-uid').add($(root).filter('span.h-threads-info-uid')) : $('span.h-threads-info-uid');
    $scope.each(function(){
      const $el = $(this);
      const rawText = $el.text();
      const cid = extractCookieIdFromUidElement(this, rawText);
      // 先清除旧的标记样式
      $el.find('.xdex-cookie-mark-target').contents().unwrap();
      $el.css({ background: '', padding: '', borderRadius: '' }).removeAttr('title');
      // 收集所有匹配的分组索引和备注
      let firstMatchIdx = -1;
      const hits = [];
      for (let i=0; i<groups.length; i++){
        const g = groups[i];
        if (g.cookies.some(p=>Utils.cookieMatch(cid,p))) {
          if (firstMatchIdx === -1) firstMatchIdx = i; // 记录第一个匹配的分组索引
          if (g.desc) hits.push(g.desc); // 只有有备注时才加入 hits
        }
      }
      // 如果没有匹配到任何分组，保持清除状态
      if (firstMatchIdx === -1) return;
      // 根据第一个匹配的分组索引选择颜色
      const color = getMarkedGroupEffectiveColor(groups[firstMatchIdx], firstMatchIdx);
      if (rawText.includes(':') && cid) {
        wrapCookieMarkTargetPreserveHtml(this, color);
      } else {
        $el.css({ background: color, padding:'0 3px', borderRadius:'2px' });
      }
      // 只有当有备注时才设置 title
      if (hits.length > 0) {
        $el.attr('title', hits.join('\n'));
      }
    });
  }

  function getFilterConfig(cfg) {
    if (cfg && typeof cfg === 'object') {
      const next = Object.assign({}, cfg);
      next.blockedCookies = normalizeBlockedGroups(next.blockedCookies);
      next.blockedKeywords = normalizeBlockedKeywordGroups(next.blockedKeywords);
      next.threadCookieWhitelistGroups = normalizeThreadCookieWhitelistGroups(next.threadCookieWhitelistGroups);
      return next;
    }
    try {
      const next = Object.assign({}, SettingPanel.defaults, GM_getValue(SettingPanel.key, {}));
      next.markedGroups = normalizeMarkedGroups(next.markedGroups);
      next.blockedCookies = normalizeBlockedGroups(next.blockedCookies);
      next.blockedKeywords = normalizeBlockedKeywordGroups(next.blockedKeywords);
      next.threadCookieWhitelistGroups = normalizeThreadCookieWhitelistGroups(next.threadCookieWhitelistGroups);
      return next;
    } catch (e) {
      return Object.assign({}, SettingPanel.defaults);
    }
  }

  function isUpdateCheckEnabled() {
    try {
      const cfg = Object.assign({}, SettingPanel.defaults, GM_getValue(SettingPanel.key, {}));
      return !!cfg.enableUpdateCheck;
    } catch (e) {
      return !!SettingPanel.defaults.enableUpdateCheck;
    }
  }

  function asFilterRoot(root) {
    if (!root) return $(document);
    return root.jquery ? root : $(root);
  }

  function withSelf($root, selector) {
    return $root.filter(selector).add($root.find(selector));
  }

  function resetTag3FilterState(root) {

    const $root = asFilterRoot(root);

    // 恢复折叠状态

    withSelf($root, '[data-xdex-filter-target="1"]').each((_, el) => {

      $(el)

        .show()

        .removeData('xdex-collapsed')

        .removeAttr('data-xdex-filter-target')

        .removeClass('xdex-generic-collapsed');

    });

    // 恢复隐藏状态

    withSelf($root, '[data-xdex-filter-hidden="1"]').each((_, el) => {

      $(el).show().removeAttr('data-xdex-filter-hidden');

    });

    withSelf($root, '[data-xdex-filter-placeholder="1"]').remove();

  }

  function decorateFilterPlaceholder($ph, $el, placeholderClass, expandedFlex = '0 0 auto') {
    $ph.attr('data-xdex-filter-placeholder', '1').addClass(placeholderClass);
    $el.attr('data-xdex-filter-target', '1');
    if ($ph && $el.hasClass('h-threads-item-reply-main')) {
      const $row  = $el.closest('.h-threads-item-reply');
      const $icon = $row.find('.h-threads-item-reply-icon').first();
      if ($row.length) {
        $row.css({ display: 'flex', alignItems: 'flex-start' });
      }
      if ($icon.length) {
        $icon.css({ flex: '0 0 3em', textAlign: 'center' });
      }
      const applyWidth = () => {
        const txt = ($ph.text() || '').trim();
        if (txt === '点击折叠') {
          $ph.css({
            flex: '0 0 auto',
            maxWidth: '8em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginRight: '0.5em'
          });
        } else {
          $ph.css({
            flex: expandedFlex,
            maxWidth: 'none',
            whiteSpace: 'normal',
            overflow: 'visible',
            textOverflow: 'clip',
            marginRight: '0'
          });
        }
      };
      applyWidth();
      $ph.off('click.xdex-filter-width').on('click.xdex-filter-width', () => {
        setTimeout(applyWidth, 0);
      });
    }
  }

  function getThreadIdForElement($el) {
    const $index = $el.closest('.h-threads-item-index[data-threads-id]');
    const indexTid = ($index.attr('data-threads-id') || '').trim();
    if (isValidThreadId(indexTid)) return indexTid;

    const pathMatch = location.pathname.match(/\/t\/(\d{8,})/);
    if (pathMatch) return pathMatch[1].slice(0, 8);

    const href = $el.closest('.h-threads-item-index, .h-threads-item, .h-threads-item-reply, .h-threads-item-reply-main')
      .find('.h-threads-info-id[href*="/t/"]').first().attr('href') || '';
    const hrefMatch = href.match(/\/t\/(\d{8,})/);
    return hrefMatch ? hrefMatch[1].slice(0, 8) : '';
  }

  function addFilterId(ids, value) {
    const match = String(value || '').match(/\d{8}/);
    if (match && match[0] !== '99999999' && !ids.includes(match[0])) ids.push(match[0]);
  }

  function getFilterIdsForElement($el) {
    const ids = [];
    addFilterId(ids, $el.attr('data-threads-id'));
    addFilterId(ids, $el.closest('[data-threads-id]').attr('data-threads-id'));
    addFilterId(ids, $el.find('.h-threads-info-id').first().text());
    addFilterId(ids, $el.closest('.h-threads-item-index, .h-threads-item, .h-threads-item-reply, .h-threads-item-reply-main').find('.h-threads-info-id').first().text());
    const href = $el.closest('.h-threads-item-index, .h-threads-item, .h-threads-item-reply, .h-threads-item-reply-main').find('.h-threads-info-id[href]').first().attr('href') || '';
    addFilterId(ids, href);
    return ids;
  }

  function findBlockedKeywordHit(text, groups, $el) {
    const keywords = flattenBlockedKeywords(groups);
    const textHit = Utils.firstHit(text || '', keywords);
    if (textHit) return textHit;
    const ids = getFilterIdsForElement($el);
    return keywords.find((keyword) => isEightDigitKeyword(keyword) && ids.includes(keyword)) || null;
  }

  function getThreadWhitelistGroup(threadId, groups) {
    if (!threadId || !groups.length) return null;
    for (const group of groups) {
      if ((group.threads || []).includes(threadId)) {
        return group;
      }
    }
    return null;
  }

  function isSystemReplyElement($el) {
    if ($el.closest('.h-threads-item-reply[data-threads-id="9999999"]').length) return true;
    const replyIdText = ($el.find('.h-threads-info-id').first().text() || '').trim();
    return replyIdText === 'No.9999999';
  }

  function isThreadPageForPOAnnotation() {
    return /\/t\/\d{8,}/.test(location.pathname);
  }

  function isLiveDocumentRoot(root) {
    if (!root || root === document) return true;
    try {
      return !!(root.ownerDocument === document && document.documentElement && document.documentElement.contains(root));
    } catch (e) {
      return false;
    }
  }

  function refreshFilterDisplay(cfg, root) {
    return startupPerfDebug.measure('refreshFilterDisplay', () => {
      if (!isLiveDocumentRoot(root)) {
        applyFilters(cfg, root || document);
        return;
      }
      if (typeof refreshPOAnnotationMode === 'function') {
        refreshPOAnnotationMode(root || document, cfg);
      } else if (typeof applyFilters === 'function') {
        applyFilters(cfg, root || document);
      }
    }, () => startupPerfDebug.summarizeRoot(root || document));
  }

  function getThreadCookieWhitelistDisplayMode(cfg) {
    return (cfg && cfg.threadCookieWhitelistDisplayMode) || 'fold';
  }

  function getPOAnnotationSideDisplayMode(cfg) {
    return (cfg && cfg.poAnnotationSideDisplayMode) || 'collapse';
  }

  function isPOAnnotationActive(cfg) {
    return getThreadCookieWhitelistDisplayMode(cfg) === 'column' && isThreadPageForPOAnnotation();
  }

  function getCookieIdFromReplyMain($reply) {
    return ($reply.find('.h-threads-info-uid').first().text().split(':')[1] || '').trim();
  }

  function detectRuntimePOGroups(root, cfg) {
    const baseCfg = getFilterConfig(cfg);
    if (!isPOAnnotationActive(baseCfg)) return null;
    const threadId = getThreadIdForElement(asFilterRoot(root || document));
    if (!threadId) return null;
    const cookies = [];
    withSelf(asFilterRoot(root || document), '.h-threads-item-reply-main').each((_, el) => {
      const $reply = $(el);
      if (!$reply.find('span.uk-text-primary.uk-text-small').length) return;
      const cid = getCookieIdFromReplyMain($reply);
      if (Utils.cookieLegal(cid) && !cookies.includes(cid)) cookies.push(cid);
    });
    return cookies.length ? { desc: 'PO', threads: [String(threadId).slice(0, 8)], cookies, isAuto: true } : null;
  }

  function buildEffectiveWhitelistGroups(manualGroups, autoPOGroup) {
    const groups = normalizeThreadCookieWhitelistGroups(manualGroups || []).map(g => ({
      desc: g.desc || '',
      threads: [...(g.threads || [])],
      cookies: [...(g.cookies || [])]
    }));
    if (autoPOGroup && autoPOGroup.threads?.length && autoPOGroup.cookies?.length) {
      groups.push({
        desc: autoPOGroup.desc || 'PO',
        threads: [...autoPOGroup.threads],
        cookies: [...autoPOGroup.cookies]
      });
    }
    return mergeThreadCookieWhitelistGroups(groups).groups;
  }

  function buildPOAnnotationLiveConfig(cfg, root) {
    const liveCfg = getFilterConfig(cfg);
    if (!isPOAnnotationActive(liveCfg)) return liveCfg;
    const autoPOGroup = detectRuntimePOGroups(root, liveCfg);
    liveCfg.threadCookieWhitelistGroups = buildEffectiveWhitelistGroups(liveCfg.threadCookieWhitelistGroups || [], autoPOGroup);
    return liveCfg;
  }

  function applyFilters(cfg) {
    const root = arguments.length > 1 ? arguments[1] : undefined;
    return startupPerfDebug.measure('applyFilters', () => {
    const $root = asFilterRoot(root);
    cfg = getFilterConfig(cfg);
    if (applyFilters._running) return; // 防重入
    applyFilters._running = true;
    try {
    resetTag3FilterState($root);
    // 标记
    markAllCookies(cfg.markedGroups||[], $root);

    // 屏蔽（按组，匹配到则折叠，文案含备注）
    const blkG = (cfg.blockedCookies||[]);
    const blkKGroups = normalizeBlockedKeywordGroups(cfg.blockedKeywords);
    const whitelistGroups = normalizeThreadCookieWhitelistGroups(cfg.threadCookieWhitelistGroups || []);
    const whitelistDisplayMode = getThreadCookieWhitelistDisplayMode(cfg);
    const poAnnotationMode = isPOAnnotationActive(cfg);

    const displayMode = cfg.blockDisplayMode || 'fold';

    const checkBlocked = $el => {
      if ($el.closest('.h-preview-box').length) return;
      if (isSystemReplyElement($el)) return;
      const cid = ($el.find('.h-threads-info-uid').first().text().split(':')[1]||'').trim();
      const txt = $el.find('.h-threads-content').first().text();
      if (cid && blkG.length) {
        let matchedCookie = null, matchedDesc = '';
        for (let i=0; i<blkG.length && !matchedCookie; i++){
          const g = blkG[i];
          const hit = g.cookies.find(p=>Utils.cookieMatch(cid,p));
          if (hit) { matchedCookie = hit; matchedDesc = g.desc || ''; }
        }

        if (matchedCookie) {
          if (displayMode === 'hide') {
            const _c = $el.closest('.h-threads-item-reply'); const $target = _c.length ? _c : $el;

            // 板块页主串：隐藏下方的 <hr> 分隔线
            if ($target.hasClass('h-threads-item-index')) {
              const $hr = $target.next('hr');
              if ($hr.length) $hr.hide().attr('data-xdex-filter-hidden', '1');
            }
            $target.hide().attr('data-xdex-filter-hidden', '1');
          } else {
            const label = matchedDesc ? `${matchedCookie}：${matchedDesc}` : matchedCookie;
            const $ph = Utils.collapse($el, `饼干屏蔽『${label}』`);
            if ($ph) decorateFilterPlaceholder($ph, $el, 'xdex-placeholder-blocked', '0 0 auto');
          }
          return;
        }
      }

      const kw = findBlockedKeywordHit(txt, blkKGroups, $el);

      if (kw) {
        if (displayMode === 'hide') {
          const _c = $el.closest('.h-threads-item-reply'); const $target = _c.length ? _c : $el;

            // 板块页主串：隐藏下方的 <hr> 分隔线
            if ($target.hasClass('h-threads-item-index')) {
              const $hr = $target.next('hr');
              if ($hr.length) $hr.hide().attr('data-xdex-filter-hidden', '1');
            }
          $target.hide().attr('data-xdex-filter-hidden', '1');
        } else {
          const $ph = Utils.collapse($el, `关键词屏蔽『${kw}』`);
          if ($ph) decorateFilterPlaceholder($ph, $el, 'xdex-placeholder-blocked', '0 0 auto');
        }
      }
    };

    const checkWhitelistReply = ($reply, whitelistGroup) => {
      if ($reply.closest('.h-preview-box').length) return;
      if (isSystemReplyElement($reply)) return;
      const cid = ($reply.find('.h-threads-info-uid').first().text().split(':')[1] || '').trim();
      if (!cid) return;
      const whitelistCookies = whitelistGroup?.cookies || [];
      if (whitelistCookies.some((pattern) => Utils.cookieMatch(cid, pattern))) {
        return;
      }

      if (poAnnotationMode) return;

      if (whitelistDisplayMode === 'hide') {
        const _c = $reply.closest('.h-threads-item-reply');
        const $target = _c.length ? _c : $reply;
        $target.hide().attr('data-xdex-filter-hidden', '1');
        return;
      }

      // 只看饼干始终保持折叠，不受 displayMode 影响
      const prefix = whitelistGroup && whitelistGroup.desc ? `『${whitelistGroup.desc}』` : '';
      const $ph = Utils.collapse($reply, `${prefix}只看饼干『${whitelistCookies.join('，')}』`);
      if ($ph) decorateFilterPlaceholder($ph, $reply, 'xdex-placeholder-whitelist', '0 0 auto');

    };

    if(/\/t\/\d{8,}/.test(location.pathname)){
      const currentThreadId = getThreadIdForElement($root);
      const whitelistGroup = getThreadWhitelistGroup(currentThreadId, whitelistGroups);
      withSelf($root, '.h-threads-item-reply-main').each((_,el)=>{
        const $reply = $(el);
        if (whitelistGroup) {
          checkWhitelistReply($reply, whitelistGroup);
        } else {
          checkBlocked($reply);
        }
      });
    } else {
      const $threads = withSelf($root, '.h-threads-item-index');
      if ($threads.length) {
        $threads.each((_,el)=>{
        const $th=$(el);
        const threadId = getThreadIdForElement($th);
        const whitelistGroup = getThreadWhitelistGroup(threadId, whitelistGroups);
        if (!whitelistGroup) {
          checkBlocked($th);
        }
        $th.find('.h-threads-item-reply-main').each((_,s)=>{
          const $reply = $(s);
          if (whitelistGroup) {
            checkWhitelistReply($reply, whitelistGroup);
          } else {
            checkBlocked($reply);
          }
        });
        });
      } else {
        withSelf($root, '.h-threads-item-reply-main').each((_, el) => {
          const $reply = $(el);
          const threadId = getThreadIdForElement($reply);
          const whitelistGroup = getThreadWhitelistGroup(threadId, whitelistGroups);
          if (whitelistGroup) {
            checkWhitelistReply($reply, whitelistGroup);
          } else {
            checkBlocked($reply);
          }
        });
      }
    }
    } finally { applyFilters._running = false; }
    }, () => startupPerfDebug.summarizeRoot(root || document));
  }

  function resetPOAnnotationLayout(root) {
    const scope = root || document;
    const anchors = Array.from(scope.querySelectorAll ? scope.querySelectorAll('[data-xdex-po-annotation-anchor="1"]') : []);
    anchors.forEach(anchor => {
      const key = anchor.getAttribute('data-xdex-po-annotation-key');
      const repliesRoot = anchor.closest('.h-threads-item-replies') || document;
      const moved = key ? repliesRoot.querySelector(`.h-threads-item-reply[data-xdex-po-annotation-moved="${key}"]`) : null;
      if (moved && anchor.parentNode) {
        anchor.parentNode.insertBefore(moved, anchor);
        moved.removeAttribute('data-xdex-po-annotation-moved');
        moved.removeAttribute('data-xdex-po-annotation-role');
      }
      anchor.remove();
    });
    const wrappers = Array.from(scope.querySelectorAll ? scope.querySelectorAll('[data-xdex-po-annotation-wrapper="1"]') : []);
    wrappers.forEach(wrapper => {
      const repliesRoot = wrapper.closest('.h-threads-item-replies');
      const mainReplies = Array.from(wrapper.querySelectorAll('.xdex-po-annotation-main > .h-threads-item-reply'));
      mainReplies.forEach(reply => {
        if (repliesRoot) {
          reply.removeAttribute('data-xdex-po-annotation-highlight');
          reply.removeAttribute('data-xdex-po-annotation-role');
          repliesRoot.insertBefore(reply, wrapper);
        }
      });
      const sideReplies = Array.from(wrapper.querySelectorAll('.h-threads-item-reply[data-xdex-po-annotation-moved]'));
      sideReplies.forEach(reply => {
        if (repliesRoot) {
          reply.removeAttribute('data-xdex-po-annotation-moved');
          reply.removeAttribute('data-xdex-po-annotation-role');
          repliesRoot.insertBefore(reply, wrapper);
        }
      });
      wrapper.remove();
    });
    Array.from(scope.querySelectorAll ? scope.querySelectorAll('.h-threads-item-reply[data-xdex-po-annotation-moved]') : []).forEach(reply => {
      const repliesRoot = reply.closest('.h-threads-item-replies');
      if (repliesRoot && reply.parentNode !== repliesRoot) {
        const fallbackWrapper = repliesRoot.querySelector('[data-xdex-po-annotation-wrapper="1"]');
        if (fallbackWrapper && fallbackWrapper.parentNode === repliesRoot) {
          repliesRoot.insertBefore(reply, fallbackWrapper);
        } else {
          repliesRoot.appendChild(reply);
        }
      }
      reply.removeAttribute('data-xdex-po-annotation-moved');
      reply.removeAttribute('data-xdex-po-annotation-role');
    });
    Array.from(scope.querySelectorAll ? scope.querySelectorAll('[data-xdex-po-annotation-anchor="1"], [data-xdex-po-annotation-wrapper="1"]') : []).forEach(el => el.remove());
    Array.from(scope.querySelectorAll ? scope.querySelectorAll('[data-xdex-po-annotation-audience], [data-xdex-po-annotation-highlight]') : []).forEach(el => {
      el.removeAttribute('data-xdex-po-annotation-audience');
      el.removeAttribute('data-xdex-po-annotation-highlight');
      el.removeAttribute('data-xdex-po-annotation-role');
    });
  }

  function ensurePOAnnotationStyle() {
    if (document.getElementById('xdex-po-annotation-style')) return;
    const style = document.createElement('style');
    style.id = 'xdex-po-annotation-style';
    style.textContent = `
      .xdex-po-annotation-group{display:grid;grid-template-columns:minmax(0,1fr) clamp(220px,31vw,380px);gap:10px;align-items:start;margin:6px 0;overflow:visible;}
      .xdex-po-annotation-main{min-width:0;position:relative;z-index:2;overflow:visible;}
      .xdex-po-annotation-side{min-width:0;border-left:2px solid #d2b59e;padding-left:8px;opacity:.92;position:relative;z-index:1;overflow:visible;}
      .xdex-po-annotation-side-title{font-size:12px;color:#886b58;margin:0 0 4px;cursor:pointer;user-select:none;}
      .xdex-po-annotation-side-body{min-width:0;overflow:visible;}
      .xdex-po-annotation-side[data-side-display-mode="collapse"] .xdex-po-annotation-side-body{overflow:auto;}
      .xdex-po-annotation-side .h-threads-item-reply{font-size:12px;margin-bottom:6px;}
      .xdex-po-annotation-main .h-threads-item-reply{position:relative;z-index:2;overflow:visible;}
      .xdex-po-annotation-main .h-threads-img-box.h-active{position:relative;z-index:20;overflow:visible !important;}
      .xdex-po-annotation-main .h-threads-img-box.h-active .h-threads-img-a{position:relative;z-index:21;overflow:visible !important;}
      .xdex-po-annotation-main .h-threads-img-box.h-active .h-threads-img{position:relative;z-index:22;}
      .xdex-po-annotation-side .h-threads-item-reply-main,.xdex-po-annotation-side .h-threads-content,.xdex-po-annotation-side .h-threads-img-box,.xdex-po-annotation-side .h-threads-img-a,.xdex-po-annotation-side .h-threads-img,.xdex-po-annotation-side img{max-width:100% !important;height:auto !important;box-sizing:border-box;}
      .xdex-po-annotation-side .h-threads-item-reply-main{width:100% !important;}
      .xdex-po-annotation-side .h-threads-img-box{width:100% !important;max-width:100% !important;}
      .xdex-po-annotation-side .h-threads-img-a{display:block;max-width:100% !important;overflow:hidden;}
      .xdex-po-annotation-side .h-threads-img{max-width:100% !important;height:auto !important;}
      .xdex-po-annotation-side .h-threads-img-box.h-active{max-width:100% !important;overflow:hidden !important;}
      .xdex-po-annotation-side .h-threads-img-box .h-threads-img-tool-btn{font-size:11px;white-space:nowrap;}
      @media (max-width: 860px){.xdex-po-annotation-group{display:block}.xdex-po-annotation-side{border-left:0;border-top:1px dashed #d2b59e;margin-top:6px;padding:6px 0 0;}}
    `;
    document.head.appendChild(style);
  }

  function openPOAnnotationReplyQuote(replyEl) {
    if (!replyEl) return false;
    const tid = (replyEl.getAttribute('data-threads-id') || '').trim();
    if (!/^\d{1,}$/.test(tid) || tid === '9999999') return false;
    try {
      if (typeof window.__xdexOpenQuoteByTid !== 'function' && typeof enableQuotePreview === 'function') {
        enableQuotePreview();
      }
      if (typeof window.__xdexOpenQuoteByTid !== 'function') return false;
      const ret = window.__xdexOpenQuoteByTid(tid, { fromPOImage: true });
      if (ret && typeof ret.then === 'function') {
        ret.catch(() => {});
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function bindPOAnnotationSideImageQuotePreview() {
    if (document.documentElement.dataset.xdexPoImageQuoteBound === '1') return;
    document.documentElement.dataset.xdexPoImageQuoteBound = '1';
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented) return;
      if (typeof e.button === 'number' && e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const trigger = e.target.closest('.xdex-po-annotation-side .h-threads-img-a');
      if (!trigger) return;
      const replyEl = trigger.closest('.h-threads-item-reply');
      if (!replyEl) return;
      const opened = openPOAnnotationReplyQuote(replyEl);
      if (!opened) return;
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    }, true);
  }

  function updatePOAnnotationSideState(group, expanded) {
    if (!group) return;
    const side = group.querySelector('.xdex-po-annotation-side');
    const title = group.querySelector('.xdex-po-annotation-side-title');
    const body = group.querySelector('.xdex-po-annotation-side-body');
    const main = group.querySelector('.xdex-po-annotation-main');
    if (!side || !title || !body || !main) return;
    side.setAttribute('data-side-expanded', expanded ? '1' : '0');
    const displayMode = expanded ? 'expand' : 'collapse';
    side.setAttribute('data-side-display-mode', displayMode);
    title.setAttribute('data-side-expanded', expanded ? '1' : '0');
    if (expanded) {
      body.style.maxHeight = 'none';
      body.style.overflowY = 'visible';
    } else {
      const mainHeight = Math.max(main.offsetHeight || 0, 88);
      body.style.maxHeight = `${mainHeight}px`;
      body.style.overflowY = body.scrollHeight > mainHeight ? 'auto' : 'visible';
    }
  }

  function bindPOAnnotationSideToggle(group, defaultMode) {
    if (!group || group.getAttribute('data-xdex-po-side-toggle-bound') === '1') return;
    group.setAttribute('data-xdex-po-side-toggle-bound', '1');
    const title = group.querySelector('.xdex-po-annotation-side-title');
    if (!title) return;
    title.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const side = group.querySelector('.xdex-po-annotation-side');
      const expanded = !(side && side.getAttribute('data-side-expanded') === '1');
      updatePOAnnotationSideState(group, expanded);
    });
    updatePOAnnotationSideState(group, defaultMode === 'expand');
  }

  function isPOAnnotationHighlightReply(reply, whitelistGroup) {
    if (!reply || !whitelistGroup) return false;
    if (reply.getAttribute('data-threads-id') === '9999999') return false;
    const main = reply.querySelector('.h-threads-item-reply-main');
    if (!main) return false;
    const cid = ($(main).find('.h-threads-info-uid').first().text().split(':')[1] || '').trim();
    return !!cid && (whitelistGroup.cookies || []).some(pattern => Utils.cookieMatch(cid, pattern));
  }

  function applyPOAnnotationLayout(root, liveCfg) {
    if (!isPOAnnotationActive(liveCfg)) return;
    if (window.innerWidth && window.innerWidth < 860) return;
    const rootNode = root || document;
    const threadId = getThreadIdForElement(asFilterRoot(rootNode));
    const whitelistGroup = getThreadWhitelistGroup(threadId, normalizeThreadCookieWhitelistGroups(liveCfg.threadCookieWhitelistGroups || []));
    if (!whitelistGroup) return;
    ensurePOAnnotationStyle();
    bindPOAnnotationSideImageQuotePreview();
    const sideDisplayMode = getPOAnnotationSideDisplayMode(liveCfg);

    const containers = [];
    if (rootNode.matches && rootNode.matches('.h-threads-item-replies')) containers.push(rootNode);
    if (rootNode.querySelectorAll) rootNode.querySelectorAll('.h-threads-item-replies').forEach(el => containers.push(el));
    const uniqueContainers = [...new Set(containers)];

    uniqueContainers.forEach(repliesRoot => {
      const replies = Array.from(repliesRoot.children).filter(el => el.classList && el.classList.contains('h-threads-item-reply'));
      const highlights = replies.filter(reply => isPOAnnotationHighlightReply(reply, whitelistGroup));
      if (highlights.length < 2) return;
      let currentGroup = null;
      let movedCount = 0;
      let continuationGroup = null;

      const createGroup = (reply, sideTitle, continuationText = '') => {
        const group = document.createElement('div');
        group.className = 'xdex-po-annotation-group';
        group.setAttribute('data-xdex-po-annotation-wrapper', '1');
        const main = document.createElement('div');
        main.className = 'xdex-po-annotation-main';
        const side = document.createElement('div');
        side.className = 'xdex-po-annotation-side';
        side.setAttribute('data-xdex-po-annotation-side', '1');
        side.setAttribute('data-side-display-mode', sideDisplayMode);
        const title = document.createElement('div');
        title.className = 'xdex-po-annotation-side-title';
        title.textContent = sideTitle;
        side.appendChild(title);
        const sideBody = document.createElement('div');
        sideBody.className = 'xdex-po-annotation-side-body';
        side.appendChild(sideBody);
        if (continuationText) {
          const continuation = document.createElement('div');
          continuation.className = 'xdex-po-annotation-side-title';
          continuation.textContent = continuationText;
          main.appendChild(continuation);
        }
        repliesRoot.insertBefore(group, reply);
        group.appendChild(main);
        group.appendChild(side);
        bindPOAnnotationSideToggle(group, sideDisplayMode);
        return { wrapper: group, main, side };
      };

      replies.forEach(reply => {
        if (isPOAnnotationHighlightReply(reply, whitelistGroup)) {
          reply.setAttribute('data-xdex-po-annotation-highlight', '1');
          const group = createGroup(reply, '批注');
          group.main.appendChild(reply);
          currentGroup = group;
          return;
        }
        if (reply.getAttribute('data-threads-id') === '9999999') return;
        if (reply.querySelector('.h-threads-item-reply-main[data-xdex-filter-hidden="1"]')) return;
        if (!currentGroup) {
          continuationGroup = continuationGroup || createGroup(reply, '批注（续）', '上页续');
        }
        const targetGroup = currentGroup || continuationGroup;
        if (!targetGroup) return;
        const key = `po-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const anchor = document.createElement('span');
        anchor.setAttribute('data-xdex-po-annotation-anchor', '1');
        anchor.setAttribute('data-xdex-po-annotation-key', key);
        anchor.style.display = 'none';
        repliesRoot.insertBefore(anchor, reply);
        reply.setAttribute('data-xdex-po-annotation-moved', key);
        reply.setAttribute('data-xdex-po-annotation-role', 'side');
        const sideBody = targetGroup.side.querySelector('.xdex-po-annotation-side-body') || targetGroup.side;
        sideBody.appendChild(reply);
        movedCount++;
        updatePOAnnotationSideState(targetGroup.wrapper, sideDisplayMode === 'expand');
      });
      Array.from(repliesRoot.querySelectorAll('[data-xdex-po-annotation-wrapper="1"]')).forEach(wrapper => {
        const hasSideReply = !!wrapper.querySelector('.xdex-po-annotation-side .h-threads-item-reply');
        if (!hasSideReply) {
          const mainReplies = Array.from(wrapper.querySelectorAll('.xdex-po-annotation-main > .h-threads-item-reply'));
          mainReplies.forEach(reply => repliesRoot.insertBefore(reply, wrapper));
          wrapper.remove();
        } else {
          updatePOAnnotationSideState(wrapper, sideDisplayMode === 'expand');
        }
      });
    });
  }

  function refreshPOAnnotationMode(root, cfg) {
    const targetRoot = root || document;
    resetPOAnnotationLayout(targetRoot);
    const liveCfg = buildPOAnnotationLiveConfig(cfg, targetRoot);
    applyFilters(liveCfg, targetRoot);
    try {
      applyPOAnnotationLayout(targetRoot, liveCfg);
    } catch (e) {
      try { resetPOAnnotationLayout(targetRoot); } catch (_) {}
      console.warn('PO annotation layout failed, fallback to filters-only', e);
    }
  }

  /* --------------------------------------------------

   * tag 4. 外部图床显示
   * -------------------------------------------------- */
  const ExternalImagePreview = (function(){
    let started = false;
    const PROCESSED_ATTRIBUTE = 'data-images-processed';
    const DEFAULT_VISIBLE = 3;
    const LOAD_BATCH = 3;
    const imageUrlRegex = /(https?:\/\/[^\s'")\]}]+?\.(?:jpg|jpeg|png|gif|bmp|webp|svg)(?:\?[^\s'")\]}]*)?)(?=$|\s|['")\]}.,!?])/gi;

    function buttonCss() {
      return `
        font-size: 12px;
        padding: 4px 10px;
        margin-left: 6px;
        color: #333;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
      `;
    }

    function createImageItem(url, containerWidth) {
      const frag = document.createDocumentFragment();

      const img = document.createElement('img');
      img.src = url;
      img.style.cssText = `
        display: block;
        margin: 8px auto 2px auto;
        border: 1px solid #ccc;
        border-radius: 3px;
        cursor: pointer;
        height: auto;
      `;

      const linkDiv = document.createElement('div');
      linkDiv.style.cssText = `
        font-size: 12px;
        color: #666;
        margin: 0 auto 10px auto;
        word-break: break-all;
        width: fit-content;
        max-width: 100%;
      `;
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.textContent = url;
      a.style.color = '#007bff';
      a.addEventListener('click', (e) => e.stopPropagation());
      linkDiv.appendChild(a);

      img.addEventListener('load', () => {
        const naturalW = img.naturalWidth || 0;
        if (naturalW > containerWidth) {
          img.style.width = Math.round(containerWidth * 0.75) + 'px';
          img.dataset.state = 'large';
        } else {
          img.style.width = naturalW + 'px';
          img.dataset.state = 'small';
        }
      });

      img.addEventListener('error', () => {
        img.style.display = 'none';
        linkDiv.style.display = 'none';
      });

      img.addEventListener('click', (e) => {
        e.stopPropagation();
        const state = img.dataset.state;
        if (state === 'large') {
          window.open(url, '_blank');
        } else if (state === 'small') {
          const naturalW = img.naturalWidth || 0;
          const targetW = Math.round(containerWidth * 0.75);
          if (!img.dataset.enlarged && targetW > naturalW) {
            img.style.width = targetW + 'px';
            img.dataset.enlarged = 'true';
          } else {
            window.open(url, '_blank');
          }
        }
      });

      frag.appendChild(img);
      frag.appendChild(linkDiv);
      return frag;
    }

    function appendImages(bodyEl, urls, containerWidth) {
      const frag = document.createDocumentFragment();
      urls.forEach((url) => frag.appendChild(createImageItem(url, containerWidth)));
      bodyEl.appendChild(frag);
    }

    function setCollapsed(container, collapsed) {
      container.classList.toggle('collapsed', collapsed);
      container.dataset.collapsed = collapsed ? 'true' : 'false';
      container.querySelectorAll('.iic-toggle-btn').forEach((btn) => {
        btn.textContent = collapsed ? '展开' : '收起';
      });
    }

    function injectContainer(afterDiv, imageUrls) {
      const total = imageUrls.length;
      if (total === 0) return;

      const container = document.createElement('div');
      container.className = 'injected-image-container';
      container.style.cssText = `
        margin: 12px 0;
        border: 1px solid #ddd;
        border-radius: 6px;
        background-color: #f9f9f9;
        box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        overflow: hidden;
      `;
      container.dataset.total = String(total);
      container.dataset.collapsed = 'false';

      const header = document.createElement('div');
      header.className = 'iic-header';
      header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        background: #f2f2f2;
        border-bottom: 1px solid #e6e6e6;
        cursor: default;
        user-select: none;
      `;
      const title = document.createElement('span');
      title.className = 'iic-title';
      title.textContent = `图片预览（${total}）`;
      title.style.cssText = `font-size: 13px; color: #333;`;

      const actions = document.createElement('div');
      actions.className = 'iic-actions';

      const moreTopBtn = document.createElement('button');
      moreTopBtn.className = 'iic-more-btn-top';
      moreTopBtn.style.cssText = buttonCss();

      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'iic-toggle-btn';
      toggleBtn.textContent = '收起';
      toggleBtn.style.cssText = buttonCss();
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const next = container.dataset.collapsed !== 'true';
        setCollapsed(container, next);
      });

      actions.appendChild(moreTopBtn);
      actions.appendChild(toggleBtn);
      header.appendChild(title);
      header.appendChild(actions);

      const body = document.createElement('div');
      body.className = 'iic-body';
      body.style.cssText = `
        padding: 12px 24px 10px 24px;
        overflow-x: auto;
      `;

      const footer = document.createElement('div');
      footer.className = 'iic-footer';
      footer.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 12px 12px 12px;
        background: #f9f9f9;
        border-top: 1px solid #eee;
      `;
      const moreBottomBtn = document.createElement('button');
      moreBottomBtn.className = 'iic-more-btn-bottom';
      moreBottomBtn.style.cssText = buttonCss();
      footer.appendChild(moreBottomBtn);

      const style = document.createElement('style');
      style.textContent = `
        .injected-image-container.collapsed .iic-body,
        .injected-image-container.collapsed .iic-footer { display: none; }
      `;

      container.appendChild(style);
      container.appendChild(header);
      container.appendChild(body);
      container.appendChild(footer);
      afterDiv.parentNode.insertBefore(container, afterDiv.nextSibling);

      const containerWidth = body.clientWidth || 600;

      const visibleUrls = imageUrls.slice(0, DEFAULT_VISIBLE);
      const queue = imageUrls.slice(DEFAULT_VISIBLE);

      appendImages(body, visibleUrls, containerWidth);

      function remainingCount() { return queue.length; }
      function updateMoreButtons() {
        const rem = remainingCount();
        const label = rem > 0 ? `展开更多（剩余${rem}，+${LOAD_BATCH}）` : '已全部展开';
        moreTopBtn.textContent = label;
        moreBottomBtn.textContent = label;
        const display = rem > 0 ? '' : 'none';
        moreTopBtn.style.display = display;
        moreBottomBtn.style.display = display;
      }
      function loadMore(e) {
        e.stopPropagation();
        if (queue.length === 0) return;
        const batch = queue.splice(0, LOAD_BATCH);
        appendImages(body, batch, containerWidth);
        updateMoreButtons();
      }
      moreTopBtn.addEventListener('click', loadMore);
      moreBottomBtn.addEventListener('click', loadMore);
      updateMoreButtons();

      container.addEventListener('click', (e) => {
        const target = e.target;
        if (target.closest('img, button, a, input, label, textarea, select')) return;
        if (container.dataset.collapsed !== 'true') setCollapsed(container, true);
      });
    }

    function processDiv(div) {
      if (div.hasAttribute(PROCESSED_ATTRIBUTE)) return;

      // 如果是预览框且已经有图片，则直接标记为已处理并跳过
      if (div.classList.contains('h-preview-box') && div.querySelector('img')) {
        div.setAttribute(PROCESSED_ATTRIBUTE, 'true');
        return;
      }

      div.setAttribute(PROCESSED_ATTRIBUTE, 'true');

      const textContent = div.textContent || div.innerText || '';
      const matches = textContent.match(imageUrlRegex);
      if (!matches || matches.length === 0) return;

      const uniqueImageUrls = [...new Set(matches.map((u) => u.trim()))];
      if (uniqueImageUrls.length === 0) return;

      injectContainer(div, uniqueImageUrls);
    }

    function findAndProcessDivs() {
      const divs = document.querySelectorAll(
        'div.h-threads-content:not([' + PROCESSED_ATTRIBUTE + ']), ' +
        'div.h-preview-box:not([' + PROCESSED_ATTRIBUTE + '])'
      );
      divs.forEach(processDiv);
    }

    function observeChanges() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType !== 1) return;
              if (node.classList && node.classList.contains('injected-image-container')) return;

              if (
                node.classList &&
                (node.classList.contains('h-threads-content') || node.classList.contains('h-preview-box')) &&
                !node.hasAttribute(PROCESSED_ATTRIBUTE)
              ) {
                processDiv(node);
              }

              const childDivs = node.querySelectorAll && node.querySelectorAll(
                'div.h-threads-content:not([' + PROCESSED_ATTRIBUTE + ']), ' +
                'div.h-preview-box:not([' + PROCESSED_ATTRIBUTE + '])'
              );

              if (childDivs && childDivs.length > 0) {
                childDivs.forEach(processDiv);
              }
            });
          }
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    function init() {
      if (started) return;
      started = true;
      setTimeout(findAndProcessDivs, 100);
      observeChanges();
      window.addEventListener('load', () => setTimeout(findAndProcessDivs, 500));
      // 调试辅助
      window.resetImageScript = function resetProcessedElements() {
        document.querySelectorAll('[' + PROCESSED_ATTRIBUTE + ']').forEach((el) => el.removeAttribute(PROCESSED_ATTRIBUTE));
        document.querySelectorAll('.injected-image-container').forEach((c) => c.remove());
      };
    }

    return { init };
  })();

  /* --------------------------------------------------
   * tag 5. 手动切换饼干 + 自动刷新饼干
   * -------------------------------------------------- */
  const abbreviateName = n => n.replace(/\s*-\s*\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/, '');
  const getCookiesList   = () => GM_getValue('cookies', {});
  const getCurrentCookie = () => GM_getValue('now-cookie', null);
  const LAST_USED_COOKIE_KEY = 'xdex-last-used-cookie';
  const getLastUsedCookie = () => GM_getValue(LAST_USED_COOKIE_KEY, null);
  const isCookieListUnavailable = (list) => !list || Object.keys(list).length === 0;
  const getLikelyActiveCookie = () => getCurrentCookie() || getLastUsedCookie();
  const COOKIE_USERHASH_DIGEST_CACHE_KEY = 'xdex-cookie-userhash-digests';
  const cookieDigestInflight = new Map();
  let cookieListUnavailableState = false;
  const LOGIN_PROMPT_SUPPRESS_KEY = 'loginPromptSuppressAuto';
  const getLoginPromptSuppressAuto = () => !!GM_getValue(LOGIN_PROMPT_SUPPRESS_KEY, false);
  const setLoginPromptSuppressAuto = (v) => GM_setValue(LOGIN_PROMPT_SUPPRESS_KEY, !!v);

  function getCookieUserhashDigestCache() {
    const cache = GM_getValue(COOKIE_USERHASH_DIGEST_CACHE_KEY, {});
    return cache && typeof cache === 'object' ? cache : {};
  }

  function setCookieUserhashDigestCache(cache) {
    GM_setValue(COOKIE_USERHASH_DIGEST_CACHE_KEY, cache && typeof cache === 'object' ? cache : {});
  }

  function getCurrentBrowserUserhash() {
    const match = String(document.cookie || '').match(/(?:^|;\s*)userhash=([^;]+)/);
    if (!match) return null;
    try { return decodeURIComponent(match[1]); } catch (e) { return match[1]; }
  }

  async function digestUserhash(raw) {
    if (!raw || !globalThis.crypto || !globalThis.crypto.subtle || typeof TextEncoder === 'undefined') return null;
    try {
      const data = new TextEncoder().encode(raw);
      const hash = await globalThis.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return null;
    }
  }

  function getQueryParamPreservePlus(search, name) {
    const query = String(search || '').replace(/^\?/, '');
    const pairs = query.split('&');
    for (const pair of pairs) {
      const idx = pair.indexOf('=');
      const key = idx >= 0 ? pair.slice(0, idx) : pair;
      let decodedKey;
      try { decodedKey = decodeURIComponent(key); } catch (e) { decodedKey = key; }
      if (decodedKey !== name) continue;
      const value = idx >= 0 ? pair.slice(idx + 1) : '';
      try { return decodeURIComponent(value); } catch (e) { return value; }
    }
    return null;
  }

  function decodeCookieExportText(text) {
    if (!text || typeof atob !== 'function' || typeof TextDecoder === 'undefined') return null;
    try {
      const bin = atob(text);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const jsonText = new TextDecoder('utf-8').decode(bytes);
      try { return JSON.parse(jsonText); }
      catch (e) { return JSON.parse(jsonText.replace(/\+/g, '%20')); }
    } catch (e) {
      return null;
    }
  }

  function parseCookieExportUserhash(html) {
    const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    const node = doc.querySelector('img[src*="text="]') || doc.querySelector('[src*="text="]');
    const src = node && node.getAttribute('src');
    if (!src) return null;
    try {
      const url = new URL(src, location.origin);
      const text = getQueryParamPreservePlus(url.search, 'text') || url.searchParams.get('text');
      const data = decodeCookieExportText(text);
      return data && typeof data.cookie === 'string' ? data.cookie : null;
    } catch (e) {
      return null;
    }
  }

  function getCookieDigestCacheEntry(cookie) {
    return {
      id: cookie.id,
      name: cookie.name,
      desc: cookie.desc,
      updatedAt: Date.now()
    };
  }

  async function fetchCookieExportUserhashDigest(cookie) {
    if (!cookie || !cookie.id) return null;
    const id = String(cookie.id);
    if (cookieDigestInflight.has(id)) return cookieDigestInflight.get(id);
    const promise = (async () => {
      try {
        const resp = await gmRequest(`https://www.nmbxd1.com/Member/User/Cookie/export/id/${encodeURIComponent(id)}.html`, 'text');
        const raw = parseCookieExportUserhash(resp.responseText || '');
        const digest = await digestUserhash(raw);
        return digest ? Object.assign(getCookieDigestCacheEntry(cookie), { digest }) : null;
      } catch (e) {
        return null;
      }
    })();
    cookieDigestInflight.set(id, promise);
    try { return await promise; }
    finally { cookieDigestInflight.delete(id); }
  }

  async function syncCookieUserhashDigestCache(list) {
    const ids = Object.keys(list || {});
    if (!ids.length) return;
    const cache = getCookieUserhashDigestCache();
    const next = {};
    const missing = [];
    ids.forEach(id => {
      const cookie = list[id];
      if (!cookie) return;
      if (cache[id] && cache[id].digest) {
        next[id] = Object.assign({}, cache[id], getCookieDigestCacheEntry(cookie));
      } else {
        missing.push(cookie);
      }
    });
    setCookieUserhashDigestCache(next);
    if (!missing.length) return;
    const results = await Promise.allSettled(missing.map(fetchCookieExportUserhashDigest));
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value && result.value.id && result.value.digest) {
        next[String(result.value.id)] = result.value;
      }
    });
    setCookieUserhashDigestCache(next);
  }

  async function getCookieMatchedByCurrentUserhash() {
    const raw = getCurrentBrowserUserhash();
    const digest = await digestUserhash(raw);
    if (!digest) return null;
    const cache = getCookieUserhashDigestCache();
    const entry = Object.values(cache).find(item => item && item.digest === digest);
    return entry ? { id: entry.id, name: entry.name, desc: entry.desc } : null;
  }

  async function getLikelyActiveCookieAsync() {
    const matched = await getCookieMatchedByCurrentUserhash();
    return matched || getLikelyActiveCookie();
  }

  function removeDateString(){
    $('#cookie-switcher-ui').find('*').addBack().contents()
      .filter(function(){ return this.nodeType===3; })
      .each(function(){
        this.nodeValue = this.nodeValue.replace(/ - 0000-00-00 00:00:00/g,'');
      });
  }
  function updateCurrentCookieDisplay(cur){
    const $d = $('#current-cookie-display');
    if(!$d.length) return;
    if(cookieListUnavailableState){
      $d.text('待确认').css('color','red');
    } else if(cur){
      const nm = abbreviateName(cur.name);
      $d.text(nm + (cur.desc ? ' - ' + cur.desc : '')).css('color','#000');
    } else {
      $d.text('无饼干').css('color','red');
      //showLoginPrompt(); // 这里触发
    }
    removeDateString();
  }

  function updateDropdownUI(list){
    const $dd = $('#cookie-dropdown'); $dd.empty();
    const ids = Object.keys(list);
    ids.forEach(id=>{
      const c=list[id];
      const txt=abbreviateName(c.name)+(c.desc?' - '+c.desc:'');
      $dd.append(`<option value="${id}">${txt}</option>`);
    });
    const cur = getCurrentCookie();
    if (cur && list[cur.id]) {
      $dd.val(cur.id);
    } else {
      $dd.val(ids[0] || '');
    }
    removeDateString();
  }

  function scheduleCookieDropdownFocusRestore(dropdown, delay = 120) {
    if (!dropdown) return;
    const target = dropdown.__focusBackTarget;
    if (!target) return;
    if (dropdown.__focusBackTimer) {
      clearTimeout(dropdown.__focusBackTimer);
    }
    dropdown.__focusBackTimer = setTimeout(() => {
      dropdown.__focusBackTimer = null;
      if (document.activeElement === dropdown && target.isConnected) {
        try { target.focus(); } catch (e) {}
      }
      delete dropdown.__focusBackTarget;
      delete dropdown.__openedValue;
    }, delay);
  }

  function closeCookieShortcutMenu() {
    const existing = document.getElementById('xdex-cookie-shortcut-menu');
    if (existing) existing.remove();
  }

  function openCookieShortcutMenu(dropdown, focusBackTarget) {
    closeCookieShortcutMenu();
    const options = Array.from(dropdown.options || []);
    if (!options.length) return false;
    const selectedValue = dropdown.value;
    const normalStyle = 'display:block;width:100%;box-sizing:border-box;border:0;background:transparent;color:inherit;text-align:left;padding:6px 12px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;outline:none;';
    const selectedStyle = normalStyle + 'background:#eaf7ff;outline:2px solid #66ccff;outline-offset:-2px;box-shadow:inset 3px 0 0 #66ccff;';
    const hoverStyle = normalStyle + 'background:#f2f2f2;';
    const selectedHoverStyle = normalStyle + 'background:#dff3ff;outline:2px solid #66ccff;outline-offset:-2px;box-shadow:inset 3px 0 0 #66ccff;';
    const activeStyle = normalStyle + 'background:#e8e8e8;outline:2px solid #66ccff;outline-offset:-2px;';
    const activeSelectedStyle = normalStyle + 'background:#dff3ff;outline:2px solid #66ccff;outline-offset:-2px;box-shadow:inset 3px 0 0 #66ccff;';
    const menu = document.createElement('div');
    menu.id = 'xdex-cookie-shortcut-menu';
    menu.tabIndex = -1;
    menu.style.cssText = 'position:fixed;z-index:2147483647;min-width:220px;max-width:420px;max-height:50vh;overflow:auto;background:#fff;color:#222;border:1px solid rgba(0,0,0,.25);border-radius:6px;box-shadow:0 4px 18px rgba(0,0,0,.25);font-size:14px;line-height:1.4;padding:4px 0;';
    function applyCookieShortcutItemStyle(item) {
      if (!item) return;
      const isCurrent = item.dataset.current === '1';
      const isActive = item.dataset.active === '1';
      item.style.cssText = isActive ? (isCurrent ? activeSelectedStyle : activeStyle) : (isCurrent ? selectedStyle : normalStyle);
    }
    function setActiveCookieShortcutItem(nextItem) {
      menu.querySelectorAll('button[data-value]').forEach((item) => {
        item.dataset.active = item === nextItem ? '1' : '0';
        applyCookieShortcutItemStyle(item);
      });
      if (nextItem) {
        nextItem.focus();
        nextItem.scrollIntoView({ block: 'nearest' });
      }
    }
    options.forEach((option) => {
      const isSelected = option.value === selectedValue;
      const item = document.createElement('button');
      item.type = 'button';
      item.textContent = option.textContent || option.value;
      item.dataset.value = option.value;
      item.dataset.current = isSelected ? '1' : '0';
      item.dataset.active = '0';
      if (isSelected) item.setAttribute('aria-current', 'true');
      applyCookieShortcutItemStyle(item);
      item.addEventListener('mouseenter', () => { item.style.cssText = isSelected ? selectedHoverStyle : hoverStyle; });
      item.addEventListener('mouseleave', () => { applyCookieShortcutItemStyle(item); });
      item.addEventListener('click', () => {
        dropdown.__focusBackTarget = focusBackTarget || dropdown.__focusBackTarget || document.activeElement || null;
        dropdown.value = item.dataset.value || '';
        dropdown.dispatchEvent(new Event('change', { bubbles: true }));
        closeCookieShortcutMenu();
      });
      menu.appendChild(item);
    });
    const rect = dropdown.getBoundingClientRect();
    document.documentElement.appendChild(menu);
    const width = Math.max(rect.width || 220, 220);
    menu.style.width = `${width}px`;
    const menuRect = menu.getBoundingClientRect();
    const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - menuRect.width - 8));
    const top = Math.min(Math.max(8, rect.bottom + 4), Math.max(8, window.innerHeight - menuRect.height - 8));
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.addEventListener('keydown', (e) => {
      const items = Array.from(menu.querySelectorAll('button[data-value]'));
      const active = items.find((item) => item.dataset.active === '1') || document.activeElement;
      const index = Math.max(0, items.indexOf(active));
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCookieShortcutMenu();
        if (focusBackTarget && focusBackTarget.isConnected) focusBackTarget.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveCookieShortcutItem(items[Math.min(items.length - 1, index + 1)]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveCookieShortcutItem(items[Math.max(0, index - 1)]);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        active && active.click && active.click();
      }
    });
    document.addEventListener('mousedown', function onMouseDown(e) {
      if (menu.contains(e.target)) return;
      closeCookieShortcutMenu();
      document.removeEventListener('mousedown', onMouseDown, true);
    }, true);
    const selected = Array.from(menu.querySelectorAll('button[data-value]')).find((item) => item.dataset.value === dropdown.value) || menu.querySelector('button[data-value]');
    if (selected) setActiveCookieShortcutItem(selected);
    logCookieDropdownShortcutStage('custom-menu-opened', { options: options.length, value: dropdown.value });
    return true;
  }

  function switch_cookie(cookie, opts = {}){
    const silent = !!opts.silent;
    const onDone = typeof opts.onDone === 'function' ? opts.onDone : null;
    const onFail = typeof opts.onFail === 'function' ? opts.onFail : null;

    if(!cookie || !cookie.id) {
      if (!silent) toast('无效的饼干信息！');
      onFail && onFail();
      return;
    }
    $.get(`https://www.nmbxd1.com/Member/User/Cookie/switchTo/id/${cookie.id}.html`)
      .done(()=>{
        if (!silent) toast('切换成功! 当前饼干为 '+abbreviateName(cookie.name));
        GM_setValue('now-cookie',cookie);
        GM_setValue(LAST_USED_COOKIE_KEY,cookie);
        updateCurrentCookieDisplay(cookie);
        updateDropdownUI(getCookiesList());
        removeDateString();
        updatePreviewCookieId();

        // 切换成功后，将焦点移回到 textarea
        const textarea = document.querySelector('textarea.h-post-form-textarea');
        if (textarea) {
          setTimeout(() => {
            textarea.focus();
          }, 100); // 延迟100ms确保UI更新完成
        }

        onDone && onDone(cookie);
      })
      .fail(()=>{
        if (!silent) toast('切换失败，请重试');
        onFail && onFail();
      });
  }

  function autoApplyFirstCookieIfNeeded(list, opts = {}) {
      const ids = Object.keys(list || {});
      if (!ids.length) return false;
  
      const cur = getCurrentCookie();
      if (cur && list[cur.id]) return false;
      const lastUsed = getLastUsedCookie();
      const preferred = lastUsed && list[lastUsed.id] ? list[lastUsed.id] : null;
      const first = list[ids[0]];
      const target = preferred || first;
      if (!target || !target.id) return false;
  
      if (window.__cookieAutoApplying) return true;
      window.__cookieAutoApplying = true;
  
      switch_cookie(target, {
        silent: !!opts.silent,
        onDone: (cookie) => {
          window.__cookieAutoApplying = false;
          if (opts.showDefaultToast) {
            toast(preferred ? '已应用最近饼干：' + abbreviateName(cookie.name) : '已应用默认饼干：' + abbreviateName(cookie.name));
          }
          if (typeof opts.onDone === 'function') opts.onDone(cookie);
        },
        onFail: () => {
          window.__cookieAutoApplying = false;
          if (typeof opts.onFail === 'function') opts.onFail();
        }
      });
  
      return true;
    }
  
  function refreshCookies(cb, showToast = true, opts = {}){
    GM_xmlhttpRequest({
      method:'GET',
      url:'https://www.nmbxd1.com/Member/User/Cookie/index.html',
      onload: async r=>{
        if(r.status!==200){ toast('刷新失败 HTTP '+r.status); return cb&&cb(); }
        const doc=new DOMParser().parseFromString(r.responseText,'text/html');
        const rows=doc.querySelectorAll('tbody>tr'), list={};
        rows.forEach(row=>{
          const tds=row.querySelectorAll('td');
          if(tds.length>=4){
            const id=tds[1].textContent.trim();
            const name=(tds[2].querySelector('a')||{}).textContent?.trim?.() || (tds[2].textContent||'').trim();
            const desc=tds[3].textContent.trim();
            list[id]={id,name,desc};
          }
        });
        GM_setValue('cookies',list);
        cookieListUnavailableState = isCookieListUnavailable(list);
        let actualCookieBeforeSync = null;
        if (!cookieListUnavailableState) {
          try { actualCookieBeforeSync = await getCookieMatchedByCurrentUserhash(); } catch (e) {}
          try { await syncCookieUserhashDigestCache(list); } catch (e) {}
        }
        updateDropdownUI(list);
        if (showToast) {
          toast('饼干列表已刷新！');
        }
        let cur=getCurrentCookie();
        let deletedActualCookie = null;
        if (cookieListUnavailableState) {
          cur = await getLikelyActiveCookieAsync();
          if (!cur) cur = null;
        } else if (actualCookieBeforeSync && actualCookieBeforeSync.id) {
          if (list[actualCookieBeforeSync.id]) {
            cur = list[actualCookieBeforeSync.id];
          } else {
            deletedActualCookie = actualCookieBeforeSync;
            cur = null;
            GM_setValue('now-cookie', null);
          }
        } else if(cur && !list[cur.id]) cur=null;

        // 若已登录且有饼干列表，但当前未应用任何饼干，则优先自动应用最近使用的饼干，否则应用第一个
        if (!cur && Object.keys(list).length) {
          const started = autoApplyFirstCookieIfNeeded(list, {
            silent: true,
            showDefaultToast: !deletedActualCookie,
            onDone: (cookie) => {
              if (deletedActualCookie && cookie && cookie.name) {
                toast('当前饼干 ' + abbreviateName(deletedActualCookie.name) + ' 已被删除，已切换到 ' + abbreviateName(cookie.name));
              }
              cb&&cb();
            },
            onFail: () => {
              GM_setValue('now-cookie', null);
              updateCurrentCookieDisplay(null);
              removeDateString();
              updatePreviewCookieId();
              cb&&cb();
            }
          });
          if (started) return;
        }

        GM_setValue('now-cookie',cur);
        updateCurrentCookieDisplay(cur);
        removeDateString();
        updatePreviewCookieId();

        // === 新增：检测是否无饼干，触发登录提示 ===
        const $display = $('#current-cookie-display');
        const $dropdown = $('#cookie-dropdown');
        if (
          !$dropdown.children().length ||
          ($display.length && $display.text().trim() === '已删除')
        ) {
          showLoginPrompt(!!opts.manualPrompt);
        }

        cb&&cb();

      },
      onerror:()=>{
        toast('刷新失败，网络错误'); cb&&cb();
      }
    });
  }

  function ensureLoginPromptStyle() {
    if (document.getElementById('xdex-login-prompt-style')) return;
    const style = document.createElement('style');
    style.id = 'xdex-login-prompt-style';
    style.textContent = `
      :root {
        --xdex-login-backdrop-bg: rgba(0,0,0,.45);
        --xdex-login-dialog-bg: #FFFFEE;
        --xdex-login-dialog-border: #d6c7ba;
        --xdex-login-dialog-text: #2f241d;
        --xdex-login-dialog-muted: #6a5546;
        --xdex-login-dialog-shadow: rgba(0,0,0,.28);
        --xdex-login-btn-bg: #f0e0d6;
        --xdex-login-btn-hover-bg: #e7d3c7;
        --xdex-login-btn-border: #c7b5a8;
        --xdex-login-btn-text: #4d392c;
        --xdex-login-btn-primary-bg: #66CCFF;
        --xdex-login-btn-primary-hover-bg: #54c2f7;
        --xdex-login-btn-primary-border: #59b9e7;
        --xdex-login-btn-primary-text: #fff;
      }

      :root.xdex-darkreader-active {
        --xdex-login-backdrop-bg: rgba(8,8,9,.62);
        --xdex-login-dialog-bg: #2F3233;
        --xdex-login-dialog-border: #3a2a21;
        --xdex-login-dialog-text: #f2dfc7;
        --xdex-login-dialog-muted: #d2bda4;
        --xdex-login-dialog-shadow: rgba(0,0,0,.6);
        --xdex-login-btn-bg: #3a2a21;
        --xdex-login-btn-hover-bg: #4a3429;
        --xdex-login-btn-border: #5d4334;
        --xdex-login-btn-text: #f2dfc7;
        --xdex-login-btn-primary-bg: #8fb3ff;
        --xdex-login-btn-primary-hover-bg: #a4c0ff;
        --xdex-login-btn-primary-border: #7da4f6;
        --xdex-login-btn-primary-text: #1a2232;
      }

      #login-modal-wrapper {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: flex;
        align-items: flex-start;
        justify-content: center;
      }

      #login-modal-wrapper .login-backdrop {
        position: absolute;
        inset: 0;
        background: var(--xdex-login-backdrop-bg);
      }

      #login-modal-wrapper .login-dialog {
        position: relative;
        top: 30%;
        width: min(400px, calc(100vw - 32px));
        padding: 20px;
        background: var(--xdex-login-dialog-bg);
        border: 1px solid var(--xdex-login-dialog-border);
        border-radius: 8px;
        box-shadow: 0 8px 24px var(--xdex-login-dialog-shadow);
        color: var(--xdex-login-dialog-text);
        z-index: 10001;
        box-sizing: border-box;
      }

      #login-modal-wrapper.xdex-login-embedded {
        align-items: center;
      }

      #login-modal-wrapper.xdex-login-embedded .login-dialog {
        top: 0;
        width: min(920px, calc(100vw - 24px));
        height: min(88vh, 860px);
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      #login-modal-wrapper.xdex-login-embedded .login-dialog.xdex-login-dialog-pending {
        visibility: hidden;
      }

      #login-modal-wrapper.xdex-login-embedded .login-dialog h2,
      #login-modal-wrapper.xdex-login-embedded .login-dialog p {
        flex: 0 0 auto;
      }

      #login-modal-wrapper.xdex-login-embedded .login-dialog-frame-wrap {
        flex: 1 1 auto;
        min-height: 0;
        border: 1px solid var(--xdex-login-dialog-border);
        border-radius: 6px;
        overflow: hidden;
        background: #fff;
      }

      #login-modal-wrapper.xdex-login-embedded .login-dialog-frame {
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
        background: #fff;
      }

      #login-modal-wrapper.xdex-login-embedded .login-dialog-frame.xdex-login-frame-pending {
        visibility: hidden;
      }

      #login-modal-wrapper.xdex-login-embedded .login-dialog-status {
        min-height: 0;
        margin: 0;
        color: var(--xdex-login-dialog-muted);
      }

      #login-modal-wrapper.xdex-login-embedded .login-dialog-actions {
        margin-top: 4px;
      }

      #login-modal-wrapper .login-dialog h2 {
        margin: 0 0 12px;
        color: inherit;
      }

      #login-modal-wrapper .login-dialog p {
        margin: 0 0 8px;
        color: var(--xdex-login-dialog-muted);
      }

      #login-modal-wrapper .login-dialog-actions {
        margin-top: 16px;
        text-align: right;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        flex-wrap: wrap;
      }

      #login-modal-wrapper .login-dialog-actions button {
        margin-left: 10px;
        padding: 6px 12px;
        background: var(--xdex-login-btn-bg);
        border: 1px solid var(--xdex-login-btn-border);
        border-radius: 6px;
        color: var(--xdex-login-btn-text);
        box-shadow: none;
        cursor: pointer;
      }

      #login-modal-wrapper .login-dialog-actions button:hover,
      #login-modal-wrapper .login-dialog-actions button:focus {
        background: var(--xdex-login-btn-hover-bg);
        outline: none;
      }

      #login-modal-wrapper #login-open {
        background: var(--xdex-login-btn-primary-bg);
        border-color: var(--xdex-login-btn-primary-border);
        color: var(--xdex-login-btn-primary-text);
      }

      #login-modal-wrapper #login-open:hover,
      #login-modal-wrapper #login-open:focus {
        background: var(--xdex-login-btn-primary-hover-bg);
      }
    `;
    document.head.appendChild(style);
  }

  function disableVerifyInputMemory(root = document) {
    if (!root) return;
    const targets = [];
    if (root.nodeType === 1 && root.matches && (root.matches('#doc-ipt-verify-1') || root.matches('input[name="verify"]'))) {
      targets.push(root);
    }
    if (root.querySelectorAll) {
      root.querySelectorAll('#doc-ipt-verify-1, input[name="verify"]').forEach((el) => targets.push(el));
    }
    targets.forEach((el) => {
      if (!el || el.dataset.xdexVerifyMemoryDisabled === '1') return;
      el.setAttribute('autocomplete', 'off');
      el.setAttribute('autocapitalize', 'off');
      el.setAttribute('autocorrect', 'off');
      el.setAttribute('spellcheck', 'false');
      el.dataset.xdexVerifyMemoryDisabled = '1';
    });
  }

  //done : 弹出登录提示弹窗已修复
  function showLoginPrompt(force = false){
    const url = window.location.href;
    const allowed = (
      url.startsWith("https://www.nmbxd1.com/t/") ||
      url.startsWith("https://www.nmbxd1.com/f/") ||
      url.startsWith("https://www.nmbxd1.com/Forum/timeline/")
    );
    if (!allowed) return; // 不在指定页面 → 直接退出

    if (!force && (window.__loginPromptSuppressUntilRefresh || getLoginPromptSuppressAuto())) return; // 持久化“不再提醒”后，自动场景不再弹出
    if (!force && window.__loginPromptShown) return; // 自动触发只弹一次
    if ($('#login-modal-wrapper').length) return; // 避免重复插入
    window.__loginPromptShown = true;

    ensureLoginPromptStyle();

    function updateLoggedOutCookieHint($dialog) {
      const $hint = $dialog.find('.login-cookie-hint');
      if (!$hint.length) return;
      const applyLoginCookieMark = () => {
        if (typeof markAllCookies !== 'function') return;
        try {
          const cfg = getFilterConfig();
          markAllCookies(cfg.markedGroups || [], $dialog[0]);
        } catch (e) {}
      };
      const setHint = (prefix, cookieName, suffix) => {
        $hint.empty();
        if (!cookieName) {
          $hint.text(prefix);
          return;
        }
        $hint.append(document.createTextNode(prefix));
        $hint.append($('<span class="h-threads-info-uid"></span>').text(`ID:${cookieName}`));
        $hint.append(document.createTextNode(suffix));
        applyLoginCookieMark();
      };
      const likely = getLikelyActiveCookie();
      if (likely && likely.name) {
        setHint('缓存中可用饼干可能为：', abbreviateName(likely.name), '。此时仍可作为该饼干回复。');
      } else {
        setHint('当前仍可能按最后一次应用的饼干回复，但暂时无法确认具体饼干。');
      }
      getCookieMatchedByCurrentUserhash().then(matched => {
        if (!matched || !matched.name || !isCookieListUnavailable(getCookiesList())) return;
        setHint('当前实际作用饼干为：', abbreviateName(matched.name), '。此时仍可作为该饼干回复。');
      });
    }

    let pollTimer = null;
    let pollTimeout = null;
    let isChecking = false;
    let embeddedMode = false;

    const cleanup = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      if (pollTimeout) {
        clearTimeout(pollTimeout);
        pollTimeout = null;
      }
      isChecking = false;
    };

    const closePrompt = () => {
      cleanup();
      $m.fadeOut(200, () => $m.remove());
    };

    const refreshStatus = (text) => {
      $m.find('.login-dialog-status').text(text || '');
    };

    const checkLoginState = (onDone) => {
      if (isChecking) return;
      isChecking = true;
      refreshCookies(() => {
        isChecking = false;
        const hasCookies = Object.keys(getCookiesList() || {}).length > 0;
        if (hasCookies) {
          cleanup();
          toast('登录成功，饼干已刷新');
          closePrompt();
          return;
        }
        if (typeof onDone === 'function') onDone(false);
      }, false, { manualPrompt: false });
    };

    const startPolling = () => {
      cleanup();
      refreshStatus('Tips:已进入嵌入登录模式，完成后会自动检测。');
      checkLoginState();
      pollTimer = setInterval(() => {
        checkLoginState((ok) => {
          if (!ok) refreshStatus('Tips:登陆未完成');
        });
      }, 2000);
      pollTimeout = setTimeout(() => {
        cleanup();
        refreshStatus('Tips:自动检测已停止，请在完成登录后点击“我已完成登录，刷新饼干”。');
      }, 120000);
    };

    const renderEmbeddedMode = () => {
      if (embeddedMode) return;
      embeddedMode = true;
      $m.addClass('xdex-login-embedded');
      const $dialog = $m.find('.login-dialog');
      $dialog.addClass('xdex-login-dialog-pending');
      $dialog.html(`
        <h2>登录</h2>
        <div class="login-dialog-frame-wrap">
          <iframe class="login-dialog-frame xdex-login-frame-pending" src="https://www.nmbxd1.com/Member/User/Index/login.html" title="登录页面"></iframe>
        </div>
        <p class="login-dialog-status"></p>
        <div class="login-dialog-actions">
          <button id="login-refresh-after-login">我已完成登录，刷新饼干</button>
          <button id="login-close-embedded">关闭</button>
        </div>
      `);

      const compactEmbeddedLoginPage = (doc) => {
        if (!doc || !doc.head) return false;
        if (!/\/Member\/User\/Index\/login\.html(?:$|[?#])/.test(doc.location.href)) return false;
        if (doc.getElementById('xdex-compact-login-style')) return true;
        const style = doc.createElement('style');
        style.id = 'xdex-compact-login-style';
        style.textContent = `
          html, body {
            height: auto !important;
            min-height: 0 !important;
            overflow: auto !important;
          }
          body[data-type="login"] {
            overflow: auto !important;
          }
          .myapp-login {
            height: auto !important;
            min-height: 0 !important;
            padding: 8px 0 !important;
          }
          .myapp-login-logo-block {
            padding: 0 !important;
          }
          .tpl-login-max {
            max-width: 520px !important;
            margin: 0 auto !important;
          }
          .myapp-login-logo-text {
            display: none !important;
          }
          .login-font {
            padding: 4px 0 8px !important;
            font-size: 11px !important;
            line-height: 1.2 !important;
          }
          .login-am-center {
            width: auto !important;
            max-width: 420px !important;
            float: none !important;
          }
          .login-am-center .am-form-group {
            margin-bottom: 8px !important;
          }
          .login-am-center .am-form input {
            height: 34px !important;
            line-height: 26px !important;
            font-size: 12px !important;
          }
          img[src*="/Member/User/Index/verify.html"] {
            margin-top: 4px !important;
          }
          .am-form p {
            margin: 8px 0 0 !important;
          }
          .login-am-center .am-btn-default {
            min-height: 34px !important;
            line-height: 28px !important;
          }
        `;
        doc.head.appendChild(style);
        return true;
      };

      const applyEmbeddedLoginAdjustments = () => {
        const iframe = $m.find('.login-dialog-frame').get(0);
        if (!iframe) return;
        try {
          const doc = iframe.contentDocument;
          if (doc) {
            disableVerifyInputMemory(doc);
            if (compactEmbeddedLoginPage(doc)) {
              iframe.classList.remove('xdex-login-frame-pending');
              $dialog.removeClass('xdex-login-dialog-pending');
            }
          }
        } catch (e) {}
      };

      const $iframe = $m.find('.login-dialog-frame');
      $iframe.on('load', applyEmbeddedLoginAdjustments);
      applyEmbeddedLoginAdjustments();

      $('#login-close-embedded').on('click', () => {
        closePrompt();
      });

      $('#login-refresh-after-login').on('click', () => {
        refreshStatus('Tips:正在检查登录状态...');
        checkLoginState((ok) => {
          if (!ok) refreshStatus('Tips:仍未检测到饼干，请确认已完成登录。');
        });
      });

      $m.off('click').on('click', (e) => {
        if (e.target.classList && e.target.classList.contains('login-backdrop')) {
          closePrompt();
        }
      });

      startPolling();
    };

    const $m = $(`
      <div id="login-modal-wrapper">
        <!-- 遮罩层 -->
        <div class="login-backdrop"></div>
        <!-- 弹窗内容 -->
        <div class="login-dialog">
          <h2>提示</h2>
          <p class="login-cookie-warning">当前已退出登录，无法切换饼干。</p>
          <p class="login-cookie-hint" style="color:red;">当前仍可能按最后一次应用的饼干回复，但暂时无法确认具体饼干。</p>
          <div class="login-dialog-actions">
            <button id="login-open">去登录</button>
            <button id="login-no-remind">不再提醒</button>
            <!-- <button id="login-close">关闭</button> -->
          </div>
        </div>
      </div>
    `);

    $('body').append($m);
    updateLoggedOutCookieHint($m);

    $('#login-open').on('click', () => {
      toast('正在打开登录面板……');
      renderEmbeddedMode();
    });

    $('#login-close').on('click', () => {
      closePrompt();
    });

    $('#login-no-remind').on('click', () => {
      window.__loginPromptSuppressUntilRefresh = true;
      setLoginPromptSuppressAuto(true);
      closePrompt();
    });

    $m.on('click', (e) => {
      if (e.target.classList && e.target.classList.contains('login-backdrop')) {
        closePrompt();
      }
    });
  }

  function createCookieSwitcherUI(){
    const $title = $('.h-post-form-title:contains("回应模式")').first();
    let $grid = $title.closest('.uk-grid.uk-grid-small.h-post-form-grid');
    if(!$grid.length)
      $grid = $('.h-post-form-title:contains("名 称")').first()
        .closest('.uk-grid.uk-grid-small.h-post-form-grid');
    if(!$grid.length) return;

    const cur = getCurrentCookie(), list = getCookiesList();
    cookieListUnavailableState = isCookieListUnavailable(list);

    const $ui = $(`
      <div class="uk-grid uk-grid-small h-post-form-grid" id="cookie-switcher-ui" style="display: flex; flex-wrap: nowrap; align-items: center; width: 100%;">
        <div class="uk-width-1-5">
          <div class="h-post-form-title">饼干</div>
        </div>
        <div class="uk-width-4-5 h-post-form-input" style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap;">
          <div style="flex:1 1 auto;display:flex;align-items:center;gap:6px;min-width:3ch;">
            <span id="current-cookie-display" style="max-width:40%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></span>
            <select id="cookie-dropdown" style="flex:1 1 auto;min-width:3ch;max-width:100%;"></select>
          </div>
          <button id="apply-cookie" class="uk-button uk-button-default" style="display:none;">应用</button>
          <div style="margin-left:auto;flex:0 0 auto;display:flex;align-items:center;">
            <button id="refresh-cookie" class="uk-button uk-button-default" style="min-width:1em;text-align:center;">刷新</button>
          </div>
        </div>
      </div>`);

    $grid.before($ui);

    updateCurrentCookieDisplay(cur);
    updateDropdownUI(list);

    // 登录但未应用任何饼干时，优先自动应用最近使用的饼干，否则应用第一个
    autoApplyFirstCookieIfNeeded(list, { silent: true, showDefaultToast: true });

    // === 新增：检测是否无饼干，立即弹出登录提示 ===
    const $display = $('#current-cookie-display');
    const $dropdown = $('#cookie-dropdown');
    if (
      !$dropdown.children().length ||
      ($display.length && $display.text().trim() === '无饼干')
    ) {
      showLoginPrompt();
    }

    // 单击下拉项即切换饼干
    $('#cookie-dropdown').on('change', function(){
      const sel = $(this).val();
      const l = getCookiesList();
      if(!Object.keys(l).length) return showLoginPrompt();
      if(!sel) return toast('请选择饼干');
      l[sel] ? switch_cookie(l[sel]) : toast('饼干信息无效');
      scheduleCookieDropdownFocusRestore(this, 120);
      if (!this.__focusBackTarget) delete this.__openedValue;
    });

    $('#cookie-dropdown').on('click', function(){
      if (!this.__focusBackTarget) return;
      const openedValue = this.__openedValue;
      if (openedValue == null) return;
      if (String(this.value) === String(openedValue)) {
        scheduleCookieDropdownFocusRestore(this, 120);
      }
    });

    $('#cookie-dropdown').on('keydown', function(e){
      if (!(e && (e.key === ' ' || e.code === 'Space'))) return;
      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      e.stopPropagation();
      $(this).trigger('change');
    });

    $('#cookie-dropdown').on('blur', function(){
      if (this.__focusBackTimer) {
        clearTimeout(this.__focusBackTimer);
        this.__focusBackTimer = null;
      }
      delete this.__focusBackTarget;
      delete this.__openedValue;
    });

    // 刷新按钮
    $('#refresh-cookie').on('click', e=>{
      e.preventDefault();
      // 用户手动点击“刷新”：若未登录，则作为“手动弹出”强制提示，不受“不再提醒”影响
      window.__loginPromptShown = false;

      refreshCookies(null, true, { manualPrompt: true });
    });

  }

  /* --------------------------------------------------
   * tag 6. 页面增强：页首页码 / 关闭水印 / 预览区真实饼干 / 隐藏无标题+无名氏+版规
   * -------------------------------------------------- */
  function enablePaginationDuplication  (){

    // 获取所有分页栏，而不是只获取一个
    const pags = document.querySelectorAll('ul.uk-pagination.uk-pagination-left.h-pagination');
    if(!pags.length) return;
  
    pags.forEach(pag => {
      const tit = document.querySelector('h2.h-title');
      if(!tit || !pag) return;
  
      // 克隆分页栏并插入标题后
      const clone = pag.cloneNode(true);
      tit.parentNode.insertBefore(clone, tit.nextSibling);
  
      // 对克隆分页栏执行末页补全
      processPagination(clone);
    });
  
    // 监听 DOM 变化，自动处理后续新增的分页栏
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if(node.nodeType === 1){
            // 判断是否是分页栏
            if(node.matches && node.matches('ul.uk-pagination.uk-pagination-left.h-pagination')){
              processPagination(node);
            }
            // 判断是否包含分页栏
            const innerPags = node.querySelectorAll?.('ul.uk-pagination.uk-pagination-left.h-pagination');
            innerPags?.forEach(p => processPagination(p));
          }
        });
      });
    });
  
    observer.observe(document.body, { childList: true, subtree: true });
  }
  // 专门处理“末页”按钮的函数
  function processPagination(pag){
    pag.querySelectorAll('a').forEach(a => {
      if(a.textContent.trim().startsWith('末页')){
  
        // 如果已经有页码则跳过
        if(/\(\d+\)$/.test(a.textContent.trim())) return;
  
        // 第一种格式：?page=13
        let m = a.href.match(/page=(\d+)/);
  
        // 第二种格式：/page/6.html
        if(!m){
          m = a.href.match(/\/page\/(\d+)\.html/);
        }
  
        if(m){
          a.textContent = `末页(${m[1]})`;
        }
      }
    });
  }
  
  const disableWatermark = () => {
    const c = document.querySelector('input[type="checkbox"][name="water"][value="true"]');
    if(c) c.checked = false;
  };
  function updatePreviewCookieId(){
    if(!$('.h-preview-box').length) return;
    const cur=getCurrentCookie();
    const $uid = $('.h-preview-box .h-threads-info-uid');
    const listUnavailable = isCookieListUnavailable(getCookiesList());
    if (listUnavailable) {
      const likely = getLikelyActiveCookie();
      const name = likely && likely.name ? abbreviateName(likely.name) : '未知';
      $uid.text(`已退出登录，无法获取列表，当前饼干可能为:${name}`).css('color', 'red');
      getCookieMatchedByCurrentUserhash().then(matched => {
        if (!matched || !matched.name || !isCookieListUnavailable(getCookiesList())) return;
        $uid.text(`已退出登录，无法切换饼干，当前实际作用饼干为:${abbreviateName(matched.name)}`).css('color', 'red');
        if (typeof markAllCookies === 'function') {
          try {
            const cfg = getFilterConfig();
            markAllCookies(cfg.markedGroups || [], $('.h-preview-box')[0]);
          } catch (e) {}
        }
      });
    } else {
      const name=cur&&cur.name?abbreviateName(cur.name):'无饼干';
      $uid.text('ID:'+name).css('color', '');
      cookieListUnavailableState = false;
    }
    // 切换饼干后更新标记背景色
    if (typeof markAllCookies === 'function') {
      try {
        const cfg = getFilterConfig();
        markAllCookies(cfg.markedGroups || [], $('.h-preview-box')[0]);
      } catch (e) {}
    }
  }
  function hideEmptyTitleAndEmail(root){
    const $root = root ? $(root) : null;
    const $titles = $root
      ? $root.find('.h-threads-info-title').add($root.filter('.h-threads-info-title'))
      : $('.h-threads-info-title');
    const $emails = $root
      ? $root.find('.h-threads-info-email').add($root.filter('.h-threads-info-email'))
      : $('.h-threads-info-email');

    $titles.each(function(){
      if ($(this).text().trim() === '无标题' && this.style.display !== 'none') {
        this.style.display = 'none';
      }
    });
    $emails.each(function(){
      if ($(this).text().trim() === '无名氏' && this.style.display !== 'none') {
        this.style.display = 'none';
      }
    });
  }

  function getEarlyStartupConfig() {
    try {
      return Object.assign({}, SettingPanel.defaults, GM_getValue(SettingPanel.key, {}));
    } catch (e) {
      return SettingPanel.defaults;
    }
  }

  function collapseEarlyStartupBlocks(root, cfg) {
    if (!cfg || !cfg.hideEmptyTitleEmail || typeof Utils === 'undefined' || typeof Utils.collapse !== 'function') return;
    const $root = root ? $(root) : $(document);
    Utils.collapse($root.find('.h-forum-header').addBack('.h-forum-header'), '『版规』');
    Utils.collapse($root.find('form[action="/Home/Forum/doReplyThread.html"]').addBack('form[action="/Home/Forum/doReplyThread.html"]'), '『回复』');
    Utils.collapse($root.find('form[action="/Home/Forum/doPostThread.html"]').addBack('form[action="/Home/Forum/doPostThread.html"]'), '『发串』');
  }

  function runEarlyStartupPass(root) {
    const cfg = getEarlyStartupConfig();
    if (cfg.hideEmptyTitleEmail) {
      hideEmptyTitleAndEmail(root);
      collapseEarlyStartupBlocks(root, cfg);
    }
  }

  function getEnhanceIslandOriginalTitle() {
    const root = document.documentElement;
    if (!root) return document.title;
    if (!root.dataset.xdexOriginalTitle) {
      root.dataset.xdexOriginalTitle = document.title;
    }
    return root.dataset.xdexOriginalTitle || document.title;
  }

  function selectEnhanceIslandTitleText() {
    const titleEl = document.querySelector('.h-threads-list .h-threads-item-main .h-threads-info .h-threads-info-title');
    const contentEl = document.querySelector('.h-threads-list .h-threads-item-main .h-threads-content');
    if (!contentEl) return '';

    const titleText = (titleEl?.textContent || '').trim();
    if (titleText && titleText !== '无标题') return titleText;

    const walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_ELEMENT);
    let node = contentEl;
    while (node) {
      try {
        if (window.getComputedStyle(node).color === 'rgb(255, 0, 0)') {
          const redSegment = node.textContent.replace(/^[=\s+]+|[=\s+]+$/g, '');
          if (redSegment) return redSegment;
        }
      } catch (_) {}
      node = walker.nextNode();
    }

    const lines = (contentEl.innerText || contentEl.textContent || '').split('\n');
    for (let line of lines) {
      line = line.trim();
      if (line) return line;
    }
    return '';
  }

  function applyEarlyEnhanceIslandAutoTitle() {
    if (!isEnhanceIslandAutoTitlePage()) return false;
    const titleText = selectEnhanceIslandTitleText();
    if (!titleText) return false;

    const pathBlocks = window.location.pathname.split('/').splice(1);
    const searchParams = new URLSearchParams(window.location.search || '');
    const page = pathBlocks[0] === 'Forum'
      ? (pathBlocks[5]?.replace(/\.html$/, '') || 1)
      : (searchParams.get('page') || 1);
    const titleEl = document.querySelector('title');
    if (!titleEl) return false;
    titleEl.textContent = `${titleText} - ${getEnhanceIslandOriginalTitle()} - page ${page}`;
    return true;
  }

  function installEarlyEnhanceIslandAutoTitle() {
    if (!isEnhanceIslandAutoTitlePage()) return;
    let observer = null;
    let rafId = 0;
    let stopped = false;

    const stop = () => {
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
      observer = null;
    };

    const queueTitleUpdate = () => {
      if (stopped || rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (stopped) return;
        if (applyEarlyEnhanceIslandAutoTitle()) stop();
      });
    };

    const startObserve = () => {
      if (stopped) return;
      const target = document.body || document.documentElement;
      if (!target || observer) return;
      observer = new MutationObserver(queueTitleUpdate);
      observer.observe(target, { childList: true, subtree: true, characterData: true });
      queueTitleUpdate();
      setTimeout(stop, 5000);
    };

    getEnhanceIslandOriginalTitle();
    if (document.body || document.documentElement) {
      startObserve();
    } else {
      const timer = setInterval(() => {
        if (document.body || document.documentElement) {
          clearInterval(timer);
          startObserve();
        }
      }, 25);
      setTimeout(() => {
        clearInterval(timer);
        stop();
      }, 5000);
    }
  }

  function installEarlyStartupObserver() {
    const relevantSelector = '.h-threads-info-title, .h-threads-info-email, .h-forum-header, form[action="/Home/Forum/doReplyThread.html"], form[action="/Home/Forum/doPostThread.html"]';
    let observer = null;
    let rafId = 0;
    let passCount = 0;
    let stopped = false;

    const stop = () => {
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
      observer = null;
    };

    const queuePass = () => {
      if (stopped || rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (stopped) return;
        runEarlyStartupPass(document);
        passCount += 1;
        if (passCount >= 4) stop();
      });
    };

    const startObserve = () => {
      if (stopped) return;
      const target = document.body || document.documentElement;
      if (!target || observer) return;
      observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue;
            const el = node;
            if (el.matches?.(relevantSelector) || el.querySelector?.(relevantSelector)) {
              queuePass();
              return;
            }
          }
        }
      });
      observer.observe(target, { childList: true, subtree: true });
      setTimeout(stop, 1200);
    };

    runEarlyStartupPass(document);
    if (document.body || document.documentElement) {
      startObserve();
    } else {
      const timer = setInterval(() => {
        if (document.body || document.documentElement) {
          clearInterval(timer);
          startObserve();
        }
      }, 25);
      setTimeout(() => {
        clearInterval(timer);
        stop();
      }, 1200);
    }
  }

  const startupPerfDebug = (() => {
    const AUTO_COLLECTION_ENABLED = false;
    const LONG_TASK_MS = 50;
    const LOG_TASK_MS = 16;
    const AUTO_REPORT_AFTER_MS = 60000;
    const stats = new Map();
    const events = [];
    const browserEvents = [];
    const startedAt = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    const target = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    function now() {
      return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    }

    function getStat(label) {
      if (!stats.has(label)) {
        stats.set(label, { label, count: 0, total: 0, max: 0, longCount: 0, last: 0, meta: null });
      }
      return stats.get(label);
    }

    function normalizeMeta(meta) {
      try {
        return typeof meta === 'function' ? meta() : (meta || null);
      } catch (e) {
        return { metaError: e && e.message ? e.message : String(e) };
      }
    }

    function record(label, duration, meta) {
      if (!AUTO_COLLECTION_ENABLED) return;
      const stat = getStat(label);
      stat.count += 1;
      stat.total += duration;
      stat.max = Math.max(stat.max, duration);
      stat.last = duration;
      if (duration >= LONG_TASK_MS) stat.longCount += 1;
      stat.meta = normalizeMeta(meta);
      const event = {
        at: Math.round(now()),
        label,
        duration: Number(duration.toFixed(2)),
        meta: stat.meta
      };
      events.push(event);
      if (duration >= LOG_TASK_MS) {
        console.log('[XDEX startup perf]', event);
      }
    }

    function mark(label, meta) {
      if (!AUTO_COLLECTION_ENABLED) return null;
      const event = {
        at: Math.round(now()),
        label: `mark:${label}`,
        duration: 0,
        meta: normalizeMeta(meta)
      };
      events.push(event);
      if (typeof performance !== 'undefined' && performance.mark) {
        try { performance.mark(`XDEX:${label}`); } catch (e) {}
      }
      return event;
    }

    function measure(label, fn, meta) {
      const started = now();
      try {
        return fn();
      } finally {
        record(label, now() - started, meta);
      }
    }

    async function measureAsync(label, fn, meta) {
      const started = now();
      try {
        return await fn();
      } finally {
        record(label, now() - started, meta);
      }
    }

    function measureObserver(label, mutations, fn, meta) {
      let result;
      const started = now();
      try {
        result = fn();
        return result;
      } finally {
        let added = 0;
        let removed = 0;
        for (const mutation of mutations || []) {
          added += mutation.addedNodes ? mutation.addedNodes.length : 0;
          removed += mutation.removedNodes ? mutation.removedNodes.length : 0;
        }
        record(`observer:${label}`, now() - started, () => Object.assign({
          records: mutations ? mutations.length : 0,
          added,
          removed
        }, normalizeMeta(meta) || {}));
      }
    }

    function summarizeRoot(root) {
      const scope = root && root.querySelectorAll ? root : document;
      if (!scope || !scope.querySelectorAll) return { root: 'unknown' };
      return {
        root: root === document ? 'document' : (root && root.className ? String(root.className).slice(0, 80) : root && root.nodeName),
        threads: scope.querySelectorAll('.h-threads-content').length,
        replies: scope.querySelectorAll('.h-threads-item-reply-main').length,
        imgs: scope.querySelectorAll('img').length,
        previewBoxes: scope.querySelectorAll('.h-preview-box').length
      };
    }

    function recordObserver(label, mutations, meta) {
      let added = 0;
      let removed = 0;
      for (const mutation of mutations || []) {
        added += mutation.addedNodes ? mutation.addedNodes.length : 0;
        removed += mutation.removedNodes ? mutation.removedNodes.length : 0;
      }
      record(`observer:${label}`, 0, () => Object.assign({
        records: mutations ? mutations.length : 0,
        added,
        removed
      }, normalizeMeta(meta) || {}));
    }

    function report(options = {}) {
      const table = Array.from(stats.values())
        .map(item => ({
          label: item.label,
          count: item.count,
          total: Number(item.total.toFixed(2)),
          max: Number(item.max.toFixed(2)),
          avg: Number((item.total / Math.max(1, item.count)).toFixed(2)),
          longCount: item.longCount,
          last: Number(item.last.toFixed(2)),
          meta: item.meta
        }))
        .sort((a, b) => b.total - a.total || b.max - a.max);
      const elapsed = Number((now() - startedAt).toFixed(2));
      if (options.table !== false) console.table(table);
      const result = {
        elapsed,
        autoWindowMs: AUTO_REPORT_AFTER_MS,
        stats: table,
        events: events.slice(-300),
        browserEvents: browserEvents.slice(-200)
      };
      console.log(options.auto ? '[XDEX startup perf auto report]' : '[XDEX startup perf report]', result);
      return result;
    }

    function reset() {
      stats.clear();
      events.length = 0;
      browserEvents.length = 0;
      console.log('[XDEX startup perf] reset');
      return 'reset';
    }

    function installBrowserObservers() {
      if (typeof PerformanceObserver === 'undefined' || !PerformanceObserver.supportedEntryTypes) return;
      const supported = PerformanceObserver.supportedEntryTypes;
      if (supported.includes('longtask')) {
        try {
          const observer = new PerformanceObserver(list => {
            list.getEntries().forEach(entry => {
              const item = {
                at: Math.round(entry.startTime),
                label: 'browser:longtask',
                duration: Number(entry.duration.toFixed(2)),
                name: entry.name || '',
                attribution: Array.from(entry.attribution || []).map(attr => ({
                  name: attr.name || '',
                  containerType: attr.containerType || '',
                  containerName: attr.containerName || '',
                  containerSrc: attr.containerSrc || ''
                }))
              };
              browserEvents.push(item);
              console.log('[XDEX browser perf]', item);
            });
          });
          observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {}
      }
      if (supported.includes('long-animation-frame')) {
        try {
          const observer = new PerformanceObserver(list => {
            list.getEntries().forEach(entry => {
              const item = {
                at: Math.round(entry.startTime),
                label: 'browser:long-animation-frame',
                duration: Number(entry.duration.toFixed(2)),
                renderStart: entry.renderStart ? Number(entry.renderStart.toFixed(2)) : 0,
                styleAndLayoutStart: entry.styleAndLayoutStart ? Number(entry.styleAndLayoutStart.toFixed(2)) : 0,
                blockingDuration: entry.blockingDuration ? Number(entry.blockingDuration.toFixed(2)) : 0
              };
              browserEvents.push(item);
              console.log('[XDEX browser perf]', item);
            });
          });
          observer.observe({ type: 'long-animation-frame', buffered: true });
        } catch (e) {}
      }
    }

    const api = { measure, measureAsync, measureObserver, record, recordObserver, mark, report, reset, summarizeRoot };
    window.__xdexStartupPerfReport = report;
    window.__xdexStartupPerfReset = reset;
    target.__xdexStartupPerfReport = report;
    target.__xdexStartupPerfReset = reset;
    if (AUTO_COLLECTION_ENABLED) {
      installBrowserObservers();
      setTimeout(() => {
        report({ auto: true });
      }, AUTO_REPORT_AFTER_MS);
      console.log('[XDEX startup perf] auto collection started; auto report in 60s');
    }
    return api;
  })();

  function deferStartupTask(task, delay = 0, label = 'anonymous') {
    const run = () => {
      try {
        startupPerfDebug.measure(`deferStartupTask:${label}`, task, { delay });
      } catch (e) { console.warn('启动延迟任务失败', e); }
    };
    const schedule = () => setTimeout(run, delay);
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(schedule);
    } else {
      schedule();
    }
  }

  function deferStartupSteps(steps, delay = 0, label = 'anonymous') {
    const list = Array.isArray(steps) ? steps.filter(step => step && typeof step.run === 'function') : [];
    if (!list.length) return;

    const runStep = (index) => {
      if (index >= list.length) return;
      const step = list[index];
      startupPerfDebug.mark(`deferStartupSteps:${label}:${index + 1}:start`, { delay, index, step: step.label || '' });
      try {
        startupPerfDebug.measure(step.label || `deferStartupSteps:${label}:${index + 1}`, step.run, step.meta || { delay, index });
      } catch (e) { console.warn('启动分片任务失败', step.label || label, e); }
      finally {
        startupPerfDebug.mark(`deferStartupSteps:${label}:${index + 1}:end`, { delay, index, step: step.label || '' });
      }
      setTimeout(() => runStep(index + 1), 0);
    };

    const run = () => runStep(0);
    const schedule = () => setTimeout(run, delay);
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(schedule);
    } else {
      schedule();
    }
  }

  function addLastPageNumber(){
    document.querySelectorAll('ul.uk-pagination.uk-pagination-left.h-pagination a').forEach(a => {
      if (a.textContent.trim() === '末页') {
        const m = a.href.match(/page=(\d+)/);
        if (m && !a.textContent.includes(`(${m[1]})`)) {
          a.textContent = `末页(${m[1]})`;
        }
      }
    });
  }

  // 自动监听 DOM 变化
  function observePagination(){
    if (observePagination.__bound) return;
    const observeTarget = document.body || document.documentElement;
    if (!observeTarget) {
      setTimeout(observePagination, 25);
      return;
    }
    observePagination.__bound = true;
    const observer = new MutationObserver(mutations => {
      let foundPagination = false;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue; // 只处理元素节点

          // 如果新增的是分页条本身，或它的子元素
          if (
            node.matches?.('ul.uk-pagination.uk-pagination-left.h-pagination') ||
            node.closest?.('ul.uk-pagination.uk-pagination-left.h-pagination')
          ) {
            foundPagination = true;
            break;
          }
        }
        if (foundPagination) break; // 已找到就不再继续遍历
      }

      if (foundPagination) {
        addLastPageNumber();
      }
    });

    observer.observe(observeTarget, {
      childList: true,
      subtree: true
    });
  }

  // 初始化
  //duplicatePagination();
  observePagination();

  /* --------------------------------------------------
   * tag 7. 自动+手动无缝翻页
   * -------------------------------------------------- */
  // ========== 公共增强函数 ==========
  // root: 新插入或替换的 DOM 节点（例如 repliesClone 或 targetReplies）
  // cfg: 当前配置对象
  function applyPageEnhancements(root, cfg) {
    const getLatestCfg = () => {
      try {
        // 关键：以 GM 最新配置为最高优先级，避免旧 cfg 覆盖新设置
        return Object.assign({}, SettingPanel.defaults, cfg || {}, GM_getValue(SettingPanel.key, {}));
      } catch (e) {
        return Object.assign({}, SettingPanel.defaults, cfg || {});
      }
    };

    let liveCfg = getLatestCfg();

    try { if (typeof hideEmptyTitleAndEmail === 'function') hideEmptyTitleAndEmail($(root)); } catch (e) {}
    try { refreshFilterDisplay(liveCfg, root); } catch (e) {}
      try { if (liveCfg && liveCfg.enableRelativeTime && typeof formatDateStrOnPage === 'function') formatDateStrOnPage(root); } catch (e) {}
      try { if (typeof enablePostExpand === 'function') enablePostExpand(root); } catch (e) {}

    setTimeout(() => {
      liveCfg = getLatestCfg();

      try { if (typeof hideEmptyTitleAndEmail === 'function') hideEmptyTitleAndEmail($(root)); } catch (e) {}
      try { if (typeof highlightPO === 'function') highlightPO(); } catch (e) {}
      try { if (liveCfg && liveCfg.enableHDImageAndLayoutFix && typeof enableHDImageAndLayoutFix === 'function') enableHDImageAndLayoutFix(root); } catch (e) {}
      try { if (liveCfg && liveCfg.enableHDImage && typeof enableHDImage === 'function') enableHDImage(root); } catch (e) {}
      try {
        if (typeof applyImageHideMode === 'function') {
          if (liveCfg && liveCfg.enableImageHideMode) {
            applyImageHideMode(liveCfg.applyImageHideMode || 'default', root);
          } else {
            applyImageHideMode('default', root);
          }
        }
      } catch (e) {}
      try { if (liveCfg && liveCfg.enableLinkBlank && typeof runLinkBlank === 'function') runLinkBlank(root); } catch (e) {}
      try { if (liveCfg && liveCfg.enableAutoUrlLinkify && typeof runAutoUrlLinkify === 'function') runAutoUrlLinkify(root); } catch (e) {}
      try { if (liveCfg && liveCfg.extendQuote && typeof extendQuote === 'function') extendQuote(root); } catch (e) {}
      try { if (liveCfg && liveCfg.enableQuotePreview && typeof enableQuotePreview === 'function') enableQuotePreview(); } catch (e) {}
      try { refreshFilterDisplay(liveCfg, document); } catch (e) {}
      try { if (liveCfg && liveCfg.enableRelativeTime && typeof formatDateStrOnPage === 'function') formatDateStrOnPage(root); } catch (e) {}
      try { if (typeof initContent === 'function') initContent(root); } catch (e) {}
      //try { if (typeof autoHideRefView === 'function') autoHideRefView(root); } catch (e) {}
      try { if (typeof enablePostExpand === 'function') enablePostExpand(root); } catch (e) {}
      // if (typeof preventContentOverflow === 'function') {
      //   try { preventContentOverflow(document); } catch (e) {}
      // }
    }, 50);
  }

  function isEnhanceIslandAutoTitlePage() {
    return /^\/t\/\d{4,}/.test(location.pathname) || /^\/Forum\/po\/id\/\d+/.test(location.pathname);
  }

  function refreshEnhanceIslandAutoTitle() {
    if (!isEnhanceIslandAutoTitlePage()) return;
    try {
      if (typeof window.enhanceIslandAutoTitle === 'function') {
        window.enhanceIslandAutoTitle();
      }
    } catch (e) {
      console.warn('[enhanceIslandAutoTitle] refresh failed:', e);
    }
  }

  function initSeamlessPaging() {
    let lastCheckAt = 0;

    // 所有需要被 window.SeamlessPaging 访问的变量都在此声明
    let loading = false;
    let done = false;
    let loadedPages = new Set();
    let reachedLastPageAt = -1;
    let lastFinalToastTs = 0;
    let lastLoadedPage = 1;
    let observer = null;
    let observerFrozen = false;
    let hasUserInteracted = false;
    let lastUserScrollDir = 0;
    let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;

    try {
      const cfg = Object.assign({}, SettingPanel.defaults, GM_getValue(SettingPanel.key, {}));
      if (!cfg.enableSeamlessPaging) return;

      // let loading = false;
      // let done = false;
      // const loadedPages = new Set();
      // let reachedLastPageAt = -1;     // 记录“最后一页已加载”的页码（例如 20）
      // let lastFinalToastTs = 0;       // 防抖：末页提示的时间戳，避免重复弹

      const isThreadPage = /\/t\/\d{4,}/.test(location.pathname) || /^\/Forum\/po\/id\/\d+/.test(location.pathname);
      const isBoardPage = /^\/f\//.test(location.pathname) || /^\/Forum\/timeline\/id\/\d+/.test(location.pathname);

      const originInfo = (function () {
        const cur = new URL(location.href, location.origin);
        const threadMatch =
          location.pathname.match(/\/t\/(\d{4,})/) ||
          location.pathname.match(/\/Forum\/po\/id\/(\d+)/);
        return {
          origin: location.origin,
          threadId: threadMatch
           ? threadMatch[1] : (document.querySelector('[data-threads-id]')?.getAttribute('data-threads-id') || null),
          page: Number(cur.searchParams.get('page') || (location.pathname.match(/\/page\/(\d+)(?:\.html)?$/)?.[1] || 1))
        };
      })();

      // let lastLoadedPage = originInfo.page || 1;
      lastLoadedPage = originInfo.page || 1;
      loadedPages.add(lastLoadedPage);

      const SENTINEL_ID = 'hld_auto_page_sentinel';
      let sentinel = document.getElementById(SENTINEL_ID);

      // let observer = null;           // 新增：让 observer 可被其他函数控制
      // let observerFrozen = false;    // 新增：哨兵冻结标记（大图激活时用）

      // 交互状态检测
      // let hasUserInteracted = false;
      // let lastUserScrollDir = 0;
      // let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;

      function onUserScroll() {
        hasUserInteracted = true;
        const curTop = window.pageYOffset || document.documentElement.scrollTop || 0;
        lastUserScrollDir = (curTop > lastScrollTop) ? 1 : (curTop < lastScrollTop ? -1 : lastUserScrollDir);
        lastScrollTop = curTop;
        // 新增：若处于冻结状态，满足条件则解冻并恢复观察
        if (observerFrozen && sentinel) {
          const maxDomLast = getDomLastPageNum();
          const atLastPage = !!(maxDomLast && lastLoadedPage >= maxDomLast);
          const nearBottom = (window.scrollY + window.innerHeight) >= (document.documentElement.scrollHeight - 200);

          // 若不再有激活大图，或已接近底部（两者满足任一），恢复观察
          let activeInView = false;
          const activeBox = document.querySelector('.h-threads-img-box.h-active');
          if (activeBox) {
            const r = activeBox.getBoundingClientRect();
            activeInView = (r.bottom > 0 && r.top < window.innerHeight);
          }

          if (!activeInView || (atLastPage && nearBottom)) {
            try { observer.observe(sentinel); } catch (e) {}
            observerFrozen = false;
          }
        }
      }

      function onWheel(e) {
        hasUserInteracted = true;
        if (typeof e.deltaY === 'number') lastUserScrollDir = e.deltaY > 0 ? 1 : -1;
      }
      window.addEventListener('scroll', onUserScroll, { passive: true });
      window.addEventListener('wheel', onWheel, { passive: true });

      // ======== 新增：桥接器 + 自动重执行器 ========
      function reinitForNewContent(container) {
        try {
          // 1. 派发自定义事件
          document.dispatchEvent(new CustomEvent('SeamlessPageAppended', {
            detail: { container }
          }));

          // 2. 模拟 DOMContentLoaded（部分脚本只监听这个）
          document.dispatchEvent(new Event('DOMContentLoaded'));

          // 3. 重新执行 container 内的 <script> 标签
          container.querySelectorAll('script').forEach(oldScript => {
            const newScript = document.createElement('script');
            if (oldScript.src) {
              newScript.src = oldScript.src;
            } else {
              newScript.textContent = oldScript.textContent;
            }
            [...oldScript.attributes].forEach(attr => {
              newScript.setAttribute(attr.name, attr.value);
            });
            oldScript.replaceWith(newScript);
          });
        } catch (err) {
          console.warn('reinitForNewContent error:', err);
        }
      }
      // ============================================

      // 串内页容器
      function getRootRepliesContainer() {
        const root = document.querySelector('.h-threads-item.uk-clearfix[data-threads-id]') ||
                    document.querySelector('.h-threads-item.uk-clearfix') ||
                    document.querySelector('[data-threads-id]');
        if (!root) return null;
        const replies = root.querySelectorAll('.h-threads-item-replies');
        if (!replies || replies.length === 0) return null;
        return { root, lastReplies: replies[replies.length - 1] };
      }

      function ensureSentinelPlaced() {
        const containers = getRootRepliesContainer();
        if (!containers) return;
        const { lastReplies } = containers;
        if (!sentinel) {
          sentinel = document.createElement('div');
          sentinel.id = SENTINEL_ID;
          sentinel.style.height = '1px';
          sentinel.style.width = '100%';
          sentinel.style.pointerEvents = 'none';
        }
        if (lastReplies.nextSibling !== sentinel) {
          lastReplies.parentNode.insertBefore(sentinel, lastReplies.nextSibling);
        }
      }

      // 板块页容器
      function ensureSentinelPlacedBoard() {
        const lists = document.querySelectorAll('.h-threads-list');
        const lastList = lists[lists.length - 1];
        if (!lastList) return;
        if (!sentinel) {
          sentinel = document.createElement('div');
          sentinel.id = SENTINEL_ID;
          sentinel.style.height = '1px';
          sentinel.style.width = '100%';
          sentinel.style.pointerEvents = 'none';
        }
        if (lastList.nextSibling !== sentinel) {
          lastList.parentNode.insertBefore(sentinel, lastList.nextSibling);
        }
      }

      function removeIdsFromNode(node) {
        if (!node || node.querySelectorAll === undefined) return;
        node.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        if (node.hasAttribute && node.hasAttribute('id')) node.removeAttribute('id');
      }

      function parseLastPageFromPagination(pagUl) {
        if (!pagUl) return null;
        const anchors = Array.from(pagUl.querySelectorAll('a')).map(a => a.href || a.getAttribute('href') || '');
        const pageNums = anchors.map(h => {
          try {
            const u = new URL(h, location.origin);
            const p = Number(u.searchParams.get('page') || '') || null;
            return p;
          } catch (e) {
            const m = (h || '').match(/page=(\d+)/);
            return m ? Number(m[1]) : null;
          }
        }).filter(n => !!n);
        if (pageNums.length === 0) return null;
        return Math.max(...pageNums);
      }

      function getDomLastPageNum() {
        const allPaginations = document.querySelectorAll('ul.uk-pagination.uk-pagination-left.h-pagination');
        if (allPaginations.length === 0) return null;
        const lastPagination = allPaginations[allPaginations.length - 1];
        return parseLastPageFromPagination(lastPagination);
      }

      function buildThreadPageUrl(threadId, pageNum) {
        // 如果当前是 /Forum/po/id/{threadId}/page/N.html 形式
        if (/^\/Forum\/po\/id\/\d+/.test(location.pathname)) {
          return `${location.origin}/Forum/po/id/${threadId}/page/${pageNum}.html`;
        }
        // 默认 /t/{threadId}?page=N
        return `${location.origin}/t/${threadId}?page=${pageNum}`;
      }

      function computeNextUrl() {
        const tid = originInfo.threadId || document.querySelector('[data-threads-id]')?.getAttribute('data-threads-id');
        if (!tid) return null;
        return buildThreadPageUrl(tid, lastLoadedPage + 1);
      }

      // ========== 新增：无缝翻页内部专用的刷新 / 判定工具（放在 loadNext 之前） ==========
      // done 为当前认定的末页添加手动局部刷新按钮，以避免回复数太少，无法滚动触发局部刷新，检测到为末页时一直存在
      // 从 root 中获取第一个非预览的 .h-threads-list （避免误取预览区）
      function getRealThreadsList(root = document) {
        const lists = Array.from((root || document).querySelectorAll('.h-threads-list'));
        return lists.find(el => !el.closest('.h-preview-box')) || null;
      }

      // 获取 DOM 中最大的 data-cloned-page（已被无缝加载进来的最大页）
      function getMaxClonedPageInDOM() {
        let max = 0;
        document.querySelectorAll('.h-threads-item-replies[data-cloned-page]').forEach(el => {
          const n = parseInt(el.getAttribute('data-cloned-page'), 10);
          if (!isNaN(n) && n > max) max = n;
        });
        return max;
      }

      // 刷新目标回复区（主页面回复区 或 data-cloned-page = 最大的克隆页）并检查是否有下一页
      // done(result) 回调会收到 { status: 'last'|'hasNext'|'error', nextPage?: number }
      function refreshRepliesAndCheckNext(done, options = {}) {
        const showResultToast = options.showResultToast !== false;
        const suppressResultToastOnHasNext = options.suppressResultToastOnHasNext !== false;
        try {
          const domMaxPage = getDomLastPageNum();
          const maxCloned = getMaxClonedPageInDOM();
          let targetPage = null;
          if ((domMaxPage && maxCloned === domMaxPage && maxCloned > 0) || (!domMaxPage && maxCloned > 0)) {
            targetPage = maxCloned;
          } else if (domMaxPage && lastLoadedPage === domMaxPage && maxCloned === 0) {
            targetPage = null;
          }

          const list = getRealThreadsList(document);
          if (!list) {
            console.warn('[refreshReplies] 未找到 .h-threads-list');
            toast('刷新回复失败，该串可能已被删除');
            return done && done({ status: "error" });
          }

        let targetReplies;
        if (maxCloned > 0) {
          // ✅ 如果已经有克隆界面，永远刷新最大的克隆页
          targetReplies = list.querySelector(`.h-threads-item-replies[data-cloned-page="${maxCloned}"]`);
        } else {
          // ✅ 否则刷新主页面的回复区
          targetReplies = list.querySelector('.h-threads-item-replies:not([data-cloned-page])');
        }

        // 如果没有找到回复区，说明当前串没有回复，需要创建回复区容器
        if (!targetReplies) {
          const threadItem = list.querySelector('.h-threads-item');
          if (threadItem) {
            targetReplies = document.createElement('div');
            targetReplies.className = 'h-threads-item-replies';
            if (maxCloned > 0) {
              targetReplies.setAttribute('data-cloned-page', String(maxCloned));
            }
            threadItem.appendChild(targetReplies);
            console.log('[refreshReplies] 已创建空的回复区容器');
          } else {
            console.warn('[refreshReplies] 未找到 .h-threads-item，无法创建回复区');
            toast('刷新回复失败，未找到串容器');
            return done && done({ status: "error" });
          }
        }

        // 构建请求 URL：优先用 threadId + ?page=N，否则回退到 location.href
        let fetchUrl = location.href;
        try {
          if (typeof originInfo !== 'undefined' && originInfo && originInfo.threadId && targetPage) {
            fetchUrl = buildThreadPageUrl(originInfo.threadId, targetPage);
          } else if (targetPage) {
            const u = new URL(location.href, location.origin);
            u.searchParams.set('page', String(targetPage));
            fetchUrl = u.toString();
          }
        } catch (e) {
          // ignore
        }

        fetch(fetchUrl, { credentials: 'same-origin' })
          .then(res => res.text())
          .then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const newList = getRealThreadsList(doc);
            if (!newList) {
              console.warn('[refreshReplies] 抓取页面中未找到 .h-threads-list');
              toast('刷新回复失败，该串可能已被删除');
              return done && done({ status: "error" });
            }

        // 新增：替换前记录所有激活图片所在的回复ID，刷新后在 newReplies（离线 DOM）上恢复
        let activeReplyIds = [];
        try {
          targetReplies.querySelectorAll('.h-threads-item-reply .h-threads-img-box.h-active').forEach(box => {
            const replyEl = box.closest('.h-threads-item-reply');
            if (replyEl) {
              const rid = replyEl.getAttribute('data-threads-id');
              if (rid) activeReplyIds.push(rid);
            }
          });
        } catch (e) {}

        // newReplies 已从返回的页面 doc 中得到
        const newReplies = newList.querySelector('.h-threads-item-replies');
        if (!newReplies) {
          console.warn('[refreshReplies] 抓取页面中未找到 .h-threads-item-replies');
          toast('刷新回复失败，页面无回复内容');
          return done && done({ status: "error" });
        }

        // 在覆盖前，移除系统提示（避免页面跳动）
        try {
          newReplies.querySelectorAll('.h-threads-item-reply[data-threads-id="9999999"]').forEach(n => n.remove());
        } catch (e) {}

        // 在替换前，先对 detached DOM 做预处理，避免闪烁（在脱离 document 的 newReplies 上操作）
        try {
          if (typeof hideEmptyTitleAndEmail === 'function') hideEmptyTitleAndEmail($(newReplies));
          if (typeof applyFilters === 'function') applyFilters(cfg, newReplies); // 尝试以 root-aware 方式处理
        } catch (e) {
          console.warn('预处理过滤失败', e);
        }
        // 暂时取消局部刷新后保留图片h-active状态的设定
        // —— 关键：在 newReplies（脱离 DOM 的节点）上恢复激活状态，避免插入后闪烁 ——
        // if (activeReplyIds.length > 0) {
        //   try {
        //     activeReplyIds.forEach(rid => {
        //       const newBox = newReplies.querySelector(`.h-threads-item-reply[data-threads-id="${rid}"] .h-threads-img-box`);
        //       if (newBox) {
        //         newBox.classList.add('h-active');
        //         const tool = newBox.querySelector('.h-threads-img-tool');
        //         if (tool) tool.style.display = '';
        //       }
        //     });
        //   } catch (e) {
        //     console.warn('restore multiple active images on newReplies failed', e);
        //   }
        // }
        // done 将局部刷新修改为新增而非替换，应该可以避免已active的图片发生变化

        // 替换目标回复区内容（保留容器，替换 innerHTML）—— 原子性替换已有，插入的是已处理好的 newReplies HTML
        // === 改为增量新增：比较新旧回复差异，只添加缺失部分，避免覆盖 h-active ===

        // 1. 收集原先 targetReplies 中已有的回复 ID
        const oldItems = Array.from(targetReplies.querySelectorAll('[data-threads-id]'));
        const oldIdSet = new Set(oldItems.map(i => i.dataset.threadsId));

        // 2. 收集新拉取页面中的回复项
        const newItems = Array.from(newReplies.querySelectorAll('[data-threads-id]'));
        let hasUpdate = false;

        // 3. 逐项比较，把 newReplies 中不存在于 oldReplies 的部分依顺序追加到正确位置
        for (const item of newItems) {
            const tid = item.dataset.threadsId;
            if (!oldIdSet.has(tid)) {
                // 新增回复项，插入到 targetReplies 最后（保持服务器顺序）
                hasUpdate = true;
                targetReplies.appendChild(item.cloneNode(true));
            }
        }
        // 同步替换底部分页条（取返回页的最后一个分页）
        const newPags = doc.querySelectorAll('ul.uk-pagination.uk-pagination-left.h-pagination');
        const newPag = newPags.length ? newPags[newPags.length - 1] : null;
        const oldPags = document.querySelectorAll('ul.uk-pagination.uk-pagination-left.h-pagination');
        const oldPag = oldPags.length ? oldPags[oldPags.length - 1] : null;
        if (newPag && oldPag) {
          // 只替换 innerHTML（避免完全替换导致事件/引用丢失），但你也可改为 replaceWith(clone)
          try { oldPag.innerHTML = newPag.innerHTML; } catch (e) { oldPag.replaceWith(newPag.cloneNode(true)); }
        }

        // 让其他模块对新内容生效（使用 initSeamlessPaging 作用域内已有的函数）
        try { if (typeof reinitForNewContent === 'function') reinitForNewContent(targetReplies); } catch (e) {}
        // 复用无缝翻页里常用的增强调用（与 loadNext 中添加内容后使用的一致）
        // 替换后立即执行视觉相关过滤，避免闪烁

        reinitForNewContent(targetReplies);
        applyPageEnhancements(targetReplies, cfg);

        // 统计“用户回复”数量（排除系统回复 No.9999999）
        const allReplies = Array.from(targetReplies.querySelectorAll('.h-threads-item-reply'));
        const userReplies = allReplies.filter(el => el.getAttribute('data-threads-id') !== '9999999');
        const userCount = userReplies.length;

        // 基于返回的分页判断是否出现了“更多页”
        const parsedLastFromReturned = (function() {
          const pag = newPag || doc.querySelector('ul.uk-pagination.uk-pagination-left.h-pagination') || doc.querySelector('ul.uk-pagination');
          return pag ? parseLastPageFromPagination(pag) : null;
        })();

        // 如果用户回复 < 19 => 肯定是最后一页
        if (userCount < 19) {
          const result = { status: 'last', hasUpdate };
          if (showResultToast) toast(hasUpdate ? "已更新" : "无更新");
          if (typeof done === 'function') done(result);
          addRefreshButtonIfNeeded();
          return;
        }

        // 用户回复满 19 条：若解析到的最新页码 > 当前已知 lastLoadedPage，则说明出现下一页
        if (parsedLastFromReturned && parsedLastFromReturned > lastLoadedPage) {
          const result = { status: 'hasNext', nextPage: lastLoadedPage + 1, hasUpdate };
          if (showResultToast && !suppressResultToastOnHasNext) toast(hasUpdate ? "已更新" : "无更新");
          if (typeof done === 'function') done(result);
          return;
        } else {
          const result = { status: 'last', hasUpdate };
          if (showResultToast) toast(hasUpdate ? "已更新" : "无更新");
          if (typeof done === 'function') done(result);
          addRefreshButtonIfNeeded();
          return;
        }
      })
      .catch(err => {
        console.error('refreshRepliesAndCheckNext error:', err);
        toast('刷新回复区失败');
        if (typeof done === 'function') done({ status: 'error' });
      });
        } catch (err) {
          console.error('refreshRepliesAndCheckNext pre error:', err);
          if (typeof done === 'function') done({ status: 'error' });
        }
      }

      function extractFromHTML(htmlText) {
        const doc = new DOMParser().parseFromString(htmlText, 'text/html');
        const repliesAll = doc.querySelectorAll('.h-threads-item-replies');
        const replies = repliesAll.length ? repliesAll[0] : doc.querySelector('.h-threads-item-replies');
        let pagination = doc.querySelector('ul.uk-pagination.uk-pagination-left.h-pagination') ||
                        doc.querySelector('ul.uk-pagination.uk-pagination-left') ||
                        doc.querySelector('ul.uk-pagination');
        return { replies, pagination, doc };
      }

      function addRefreshButtonIfNeeded() {
        // 若按钮已存在则不重复创建
        let btn = document.getElementById('seamless-refresh-btn');
        if (!btn) {
            btn = document.createElement('div');
            btn.id = 'seamless-refresh-btn';
            btn.className = 'qp-reset-btn seamless-refresh-btn';
            btn.title = '手动检查回复更新';
            btn.textContent = '🗘';
    
            // --- 固定位置样式 ---
            btn.style.position = 'fixed';
            btn.style.right = '12px';
            btn.style.bottom = '60px';
            btn.style.fontSize = '20px';
            btn.style.lineHeight = '1';
            btn.style.color = '#fff';
            btn.style.background = 'rgba(0,0,0,.6)';
            btn.style.padding = '6px 12px';
            btn.style.borderRadius = '6px';
            btn.style.cursor = 'pointer';
            btn.style.zIndex = '9001';
            btn.style.userSelect = 'none';
            btn.style.display = 'none';   // 默认不显示
    
            document.body.appendChild(btn);
    
            // 点击触发“局部刷新 → 若有下一页则无缝翻页”
            btn.addEventListener('click', () => {
                try {
                    toast("正在刷新……", 1500, { queue: false, key: 'refresh-status' });
                    refreshRepliesAndCheckNext(result => {
                        if (!result || result.status === 'error') return;
                        if (result.status === 'hasNext' && result.nextPage) {
                            toast(`发现新回复，正在加载第 ${result.nextPage} 页……`, 700, { queue: false, key: 'refresh-status' });
                            loadedPages.delete(result.nextPage);
                            loading = false;
                            lastLoadedPage = result.nextPage - 1;
                            lastCheckAt = 0;
                            setTimeout(() => loadNext(), 50);
                        } else if (result.status === 'last') {
                            toast(result.hasUpdate ? '已更新' : '无更新', 900, { queue: false, key: 'refresh-status' });
                        }
                    }, { showResultToast: false });
                } catch (e) {
                    console.warn('刷新按钮触发失败:', e);
                }
            });
        }
    
        // --- 始终监听页面最底部的分页栏 ---
        function getBottomPagination() {
            const allPaginations = document.querySelectorAll('ul.uk-pagination');
            return allPaginations.length ? allPaginations[allPaginations.length - 1] : null;
        }
    
        function updateBtnDisplay(pag) {
          if (!pag) {
              btn.style.display = 'none';
              return;
          }
          const hasNext = !!pag.querySelector('li:last-child a');
          if (hasNext) {
              btn.style.display = 'none';
              return;
          }
      
          // 检查浮窗状态
          const overlay = document.querySelector('.qp-overlay');
          const overlayQuote = document.querySelector('.qp-overlay-quote');
          const overlayOpen = (overlay && overlay.style.display === 'block');
          const overlayQuoteOpen = (overlayQuote && overlayQuote.style.display === 'block');
      
          if (overlayOpen || overlayQuoteOpen) {
              btn.style.display = 'none';
          } else {
              btn.style.display = 'block';
          }
      }
      
        function observeOverlays() {
          const overlays = [document.querySelector('.qp-overlay'), document.querySelector('.qp-overlay-quote')];
          overlays.forEach(el => {
              if (!el) return;
              const obs = new MutationObserver(() => {
                  updateBtnDisplay(getBottomPagination());
              });
              obs.observe(el, { attributes: true, attributeFilter: ['style'] });
          });
        }
      
        // 初始绑定
        observeOverlays();
    
        // 建立一个 MutationObserver，始终监听最新的分页栏
        let currentObserver = null;
        function observeBottomPagination() {
            const pag = getBottomPagination();
            if (!pag) return;
    
            // 先更新一次显示状态
            updateBtnDisplay(pag);
    
            // 如果已有旧的 observer，先断开
            if (currentObserver) {
                currentObserver.disconnect();
            }
    
            // 新建 observer 监听底部分页栏的变化
            currentObserver = new MutationObserver(() => {
                updateBtnDisplay(getBottomPagination());
            });
            currentObserver.observe(pag, { childList: true, subtree: true });
        }
    
        // 初始监听一次
        observeBottomPagination();
    
        // 每次 DOM 可能插入新分页栏时，重新绑定监听
        const globalObserver = new MutationObserver(() => {
            observeBottomPagination();
        });
        globalObserver.observe(document.body, { childList: true, subtree: true });
    }
    
      // 串内页加载
      async function loadNext() {
        const loadNextStarted = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
        startupPerfDebug.mark('seamless.loadNext.start', { lastLoadedPage, loading, done });
        console.log('[loadNext] 函数被调用');

        const now = Date.now();
        console.log('[loadNext] 检查防抖: now - lastCheckAt =', now - lastCheckAt);
        if (now - lastCheckAt < 1000) {
          console.log('[loadNext] 防抖拦截，返回');
          return;
        }
        lastCheckAt = now;

        console.log('[loadNext] 通过防抖检查');

         const domLast = getDomLastPageNum();
      // if (domLast && lastLoadedPage >= domLast) {
      //   return;
      // }
        // 新增：基于当前页底分页DOM的“新鲜判定”
        function checkPaginationState(lastLoadedPage) {
          const allPaginations = document.querySelectorAll('ul.uk-pagination.uk-pagination-left.h-pagination');
          const bottomPag = allPaginations.length ? allPaginations[allPaginations.length - 1] : null;
          if (!bottomPag) {
            return { status: 'noPagination', stop: false };
          }

          const lis = Array.from(bottomPag.querySelectorAll('li'));
          const numericLis = lis.filter(li => /^\d+$/.test(li.textContent.trim()));
          const hasNextLinkNow = lis.some(li => /下一页|下页|Next|›|»|→/i.test(li.textContent.trim()));

          // 只有一页
          if (numericLis.length <= 1) {
            return { status: 'singlePage', stop: true, message: '仅一页，无需翻页' };
          }

          // 已到末页
          const maxDomLast = getDomLastPageNum();
          if (maxDomLast && lastLoadedPage >= maxDomLast) {
            return { status: 'atLastPage', stop: true, message: '已经是最后一页了' };
          }

          // 没有“下一页”按钮且也没有更大页码
          if (!hasNextLinkNow && maxDomLast && lastLoadedPage + 1 > maxDomLast) {
            return { status: 'noNextLink', stop: true, message: '没有下一页' };
          }

          // 正常情况
          return { status: 'ok', stop: false };
        }

        // 调用新鲜判定
        const state = checkPaginationState(lastLoadedPage);
        if (state.stop) {
          if (state.message) {
            const now2 = Date.now();
            if (now2 - lastFinalToastTs > 3000) {
              toast('正在检查新回复……', 900, { queue: false, key: 'refresh-status' });
              lastFinalToastTs = now2;
            }
          }

          // 👉 每次末页判定时，都刷新最新回复区和分页
          refreshRepliesAndCheckNext(result => {
            if (!result || result.status === 'error') {
              return;
            }
            if (result.status === 'hasNext' && result.nextPage) {
              toast(`发现新回复，正在加载第 ${result.nextPage} 页……`, 700, { queue: false, key: 'refresh-status' });
              // ★ 关键：重置状态，避免 loadNext() 被拦截
              loadedPages.delete(result.nextPage);   // 确保不会误判已加载
              loading = false;                       // 确保不会被 loading 拦截
              lastLoadedPage = result.nextPage - 1;  // 回退一页，让 loadNext() 认为下一页还没加载
              lastCheckAt = 0;  // 重置防抖时间戳，允许立即加载
              setTimeout(() => loadNext(), 50);
            } else if (result.status === 'last') {
              toast(result.hasUpdate ? '已更新' : '无更新', 900, { queue: false, key: 'refresh-status' });
            }

            // last 分支已通过刷新状态 toast 原位更新
          }, { showResultToast: false });

          return;
        }

        // if (loading) return;
        // const nextPageNum = lastLoadedPage + 1;
        // if (loadedPages.has(nextPageNum)) return;
        console.log('[loadNext] loading =', loading);
        if (loading) {
          console.log('[loadNext] loading 为 true，返回');
          return;
        }

        const nextPageNum = lastLoadedPage + 1;
        console.log('[loadNext] 计算下一页页码: lastLoadedPage =', lastLoadedPage, ', nextPageNum =', nextPageNum);

        console.log('[loadNext] loadedPages 包含的页码:', Array.from(loadedPages));
        if (loadedPages.has(nextPageNum)) {
          console.log('[loadNext] nextPageNum 已在 loadedPages 中，返回');
          return;
        }

        console.log('[loadNext] 准备加载页码:', nextPageNum);
        const nextUrl = computeNextUrl();
        if (!nextUrl) { return; }

        toast(`正在加载第 ${nextPageNum} 页……`);

        loading = true;
        try {
          const res = await startupPerfDebug.measureAsync('seamless.loadNext.fetch', () => fetch(nextUrl, { credentials: 'same-origin' }), { nextPageNum, nextUrl });
          if (!res.ok) {
              toast('刷新失败，网络错误');
              return;
          }
          const html = await startupPerfDebug.measureAsync('seamless.loadNext.responseText', () => res.text(), { nextPageNum });
          const { replies, pagination } = startupPerfDebug.measure('seamless.loadNext.extractFromHTML', () => extractFromHTML(html), { nextPageNum, htmlLength: html.length });
          if (!replies) { return; }

          let pagClone = startupPerfDebug.measure('seamless.loadNext.clonePagination', () => pagination ? pagination.cloneNode(true) : null, { nextPageNum });
          if (!pagClone) {
            pagClone = document.createElement('ul');
            pagClone.className = 'uk-pagination uk-pagination-left h-pagination';
          }
          pagClone.setAttribute('hld-auto-page', 'ok');
          removeIdsFromNode(pagClone);
          const lastPageNum = parseLastPageFromPagination(pagClone);
          if (lastPageNum) pagClone.setAttribute('data-last-page', String(lastPageNum));
          pagClone.setAttribute('data-cloned-page', String(nextPageNum));

          const repliesClone = startupPerfDebug.measure('seamless.loadNext.cloneReplies', () => replies.cloneNode(true), { nextPageNum, replies: replies.querySelectorAll ? replies.querySelectorAll('.h-threads-item-reply').length : 0 });
          repliesClone.setAttribute('data-cloned-page', String(nextPageNum));
          removeIdsFromNode(repliesClone);

          const containers = getRootRepliesContainer();
          if (!containers) { return; }
          const { lastReplies } = containers;

          startupPerfDebug.measure('seamless.loadNext.insertDom', () => {
            lastReplies.insertAdjacentElement('afterend', pagClone);
            pagClone.insertAdjacentElement('afterend', repliesClone);
          }, { nextPageNum });

          // ======== 新增：让其他脚本对新内容生效 ========
          startupPerfDebug.measure('seamless.loadNext.reinitForNewContent', () => reinitForNewContent(repliesClone), { nextPageNum });
          startupPerfDebug.measure('seamless.loadNext.applyPageEnhancements', () => applyPageEnhancements(repliesClone, cfg), { nextPageNum });
          // ============================================

          // 更新底部分页条
          const allPaginations = document.querySelectorAll('ul.uk-pagination.uk-pagination-left.h-pagination');
          if (allPaginations.length > 0) {
            const lastPagination = allPaginations[allPaginations.length - 1];
            if (lastPagination && lastPagination !== pagClone) {
              lastPagination.replaceWith(pagClone.cloneNode(true));
            }
          }

          loadedPages.add(nextPageNum);
          lastLoadedPage = nextPageNum;

          try { history.pushState(null, '', nextUrl); } catch (e) {}
          recordThreadHistoryProgress({ url: nextUrl, page: nextPageNum, reason: 'seamless-page', touchVisitedAt: true });
          refreshEnhanceIslandAutoTitle();

          ensureSentinelPlaced();

          const hasNextLink = (() => {
              const anchorsText = Array.from(pagClone.querySelectorAll('a')).map(a => a.textContent.trim());
              if (anchorsText.some(t => /下一页|下页|Next|next|›|»|→/.test(t))) return true;
              const parsed = parseLastPageFromPagination(pagClone);
              if (parsed && parsed > nextPageNum) return true;
              return false;
            })();

            // 不在这里吐司“已经是最后一页了”，仅记录“末页已加载”的页码
            if (!hasNextLink) {
              reachedLastPageAt = nextPageNum;
            } else {
              // 仍有下一页可能，清除标记
              reachedLastPageAt = -1;
            }

        } catch (e) {
          console.warn('seamless paging loadNext error:', e);
          toast('加载失败，请稍后重试');
          return;
        } finally {
          loading = false;
          const finished = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
          startupPerfDebug.record('seamless.loadNext.total', finished - loadNextStarted, { lastLoadedPage, loading, done });
          startupPerfDebug.mark('seamless.loadNext.end', { lastLoadedPage, loading, done });
        }
      }

      async function loadNextBoard() {
        const loadNextBoardStarted = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
        startupPerfDebug.mark('seamless.loadNextBoard.start', { lastLoadedPage, loading, done });
        if (loading || done) return;
        const nextPageNum = lastLoadedPage + 1;
        if (loadedPages.has(nextPageNum)) return;

        let nextUrl;
        if (/^\/Forum\/timeline\/id\/\d+/.test(location.pathname)) {
          // 时间线模式
          const base = location.pathname.replace(/\/page\/\d+\.html$/, ''); // 去掉已有的 /page/N.html
          nextUrl = `${location.origin}${base}/page/${nextPageNum}.html`;
        } else {
          // 默认板块模式
          nextUrl = `${location.origin}${location.pathname}?page=${nextPageNum}`;
        }

        loading = true;
        try {
          const res = await startupPerfDebug.measureAsync('seamless.loadNextBoard.fetch', () => fetch(nextUrl, { credentials: 'same-origin' }), { nextPageNum, nextUrl });
          if (!res.ok) { done = true; return; }
          const html = await startupPerfDebug.measureAsync('seamless.loadNextBoard.responseText', () => res.text(), { nextPageNum });
          const doc = startupPerfDebug.measure('seamless.loadNextBoard.parseHTML', () => new DOMParser().parseFromString(html, 'text/html'), { nextPageNum, htmlLength: html.length });
          const list = doc.querySelector('.h-threads-list');
          const pagination = doc.querySelector('ul.uk-pagination.uk-pagination-left.h-pagination');

          // 板块页空页面检查（速报2）
          if (!list) {
            done = true;
            const now = Date.now();
            if (now - lastFinalToastTs > 3000) {
              toast('已经是最后一页了');
              lastFinalToastTs = now;
            }
            return;
          }

          // 检查 list 是否为空（没有子元素或只有空白内容）
          const hasContent = list.children.length > 0 || list.textContent.trim().length > 0;
          if (!hasContent) {
            done = true;
            const now = Date.now();
            if (now - lastFinalToastTs > 3000) {
              toast('已经是最后一页了');
              lastFinalToastTs = now;
            }
            return;
          }

          toast(`正在加载第 ${nextPageNum} 页……`);
          if (!list) { done = true; return; }

          const listClone = startupPerfDebug.measure('seamless.loadNextBoard.cloneList', () => list.cloneNode(true), { nextPageNum, threads: list.querySelectorAll ? list.querySelectorAll('.h-threads-item').length : 0 });
          removeIdsFromNode(listClone);

          // 找到当前页面最后一个 .h-threads-list
          const lists = document.querySelectorAll('.h-threads-list');
          const lastList = lists[lists.length - 1];
          if (lastList) {
            let pagClone = pagination ? pagination.cloneNode(true) : null;
            if (pagClone) {
              removeIdsFromNode(pagClone);
              startupPerfDebug.measure('seamless.loadNextBoard.insertDom', () => {
                lastList.insertAdjacentElement('afterend', pagClone);
                pagClone.insertAdjacentElement('afterend', listClone);
              }, { nextPageNum });

              // ======== 新增：让其他脚本对新内容生效 ========
              startupPerfDebug.measure('seamless.loadNextBoard.reinitForNewContent', () => reinitForNewContent(listClone), { nextPageNum });

              startupPerfDebug.measure('seamless.loadNextBoard.applyPageEnhancements', () => applyPageEnhancements(listClone, cfg), { nextPageNum });

              // ============================================

              // 更新底部分页条
              const allPaginations = document.querySelectorAll('ul.uk-pagination.uk-pagination-left.h-pagination');
              if (allPaginations.length > 0) {
                const lastPagination = allPaginations[allPaginations.length - 1];
                if (lastPagination && lastPagination !== pagClone) {
                  lastPagination.replaceWith(pagClone.cloneNode(true));
                }
              }
            } else {
              startupPerfDebug.measure('seamless.loadNextBoard.insertDom', () => lastList.insertAdjacentElement('afterend', listClone), { nextPageNum });
              // ======== 新增：让其他脚本对新内容生效 ========
              startupPerfDebug.measure('seamless.loadNextBoard.reinitForNewContent', () => reinitForNewContent(listClone), { nextPageNum });
              try { if (cfg.enableQuotePreview && typeof enableQuotePreview === 'function') startupPerfDebug.measure('seamless.loadNextBoard.enableQuotePreview', () => enableQuotePreview(), { nextPageNum }); } catch (e) {}
              if (typeof initContent === 'function') {
                startupPerfDebug.measure('seamless.loadNextBoard.initContent', () => initContent(listClone), { nextPageNum });   // 重新绑定引用悬浮预览
              }
              //autoHideRefView(listClone); // 拓展引用悬浮
              // ============================================

            }
          }

        loadedPages.add(nextPageNum);
        lastLoadedPage = nextPageNum;
        try { history.pushState(null, '', nextUrl); } catch (e) {}
        recordThreadHistoryProgress({ url: nextUrl, page: nextPageNum, reason: 'seamless-page', touchVisitedAt: true });
        refreshEnhanceIslandAutoTitle();

        const hasNextLink = pagination && Array.from(pagination.querySelectorAll('a')).some(a => /下一页|下页|Next|›|»|→/i.test(a.textContent));
        //if (!hasNextLink) done = true;

        } catch (e) {
          console.warn('board paging loadNext error:', e);
        return;
        } finally {
          loading = false;
          const finished = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
          startupPerfDebug.record('seamless.loadNextBoard.total', finished - loadNextBoardStarted, { lastLoadedPage, loading, done });
          startupPerfDebug.mark('seamless.loadNextBoard.end', { lastLoadedPage, loading, done });
        }
      }

      // 新增：检查激活大图并按需冻结/解冻观察器（限定在当前串的最后一个 replies 容器）
      function checkActiveImageAndToggleObserver() {
        const container = getRootRepliesContainer();
        const activeBox = container && container.lastReplies
          ? container.lastReplies.querySelector('.h-threads-img-box.h-active')
          : null;
        const hasActive = !!activeBox;

        const maxDomLast = getDomLastPageNum();
        const atLastPage = !!(maxDomLast && lastLoadedPage >= maxDomLast);
        const nearBottom = (window.scrollY + window.innerHeight) >= (document.documentElement.scrollHeight - 200);

        let activeInView = false;
        if (activeBox) {
          const r = activeBox.getBoundingClientRect();
          activeInView = (r.bottom > 0 && r.top < window.innerHeight);
        }

        // 末页 + 激活在视口内 + 未接近底部 → 冻结（disconnect）
        if (atLastPage && activeInView && !nearBottom) {
          try { observer && observer.disconnect(); } catch (e) {}
          observerFrozen = true;
          return;
        }

        // 其他情况 → 恢复观察（如果之前被冻结）
        if (observerFrozen && sentinel && observer) {
          try { observer.observe(sentinel); } catch (e) {}
          observerFrozen = false;
        }
      }

      // 新增：绑定点击检查（覆盖查看大图/收起等交互）
      document.addEventListener('click', (e) => {
        const t = e.target;
        if (t.closest('.h-threads-img-tool-btn') || t.closest('.h-threads-img-a')) {
          setTimeout(checkActiveImageAndToggleObserver, 0);
        }
      });

      function initObserver() {
        ensureSentinelPlaced();
        if (!sentinel) return;

        // 使用外层 observer 变量（替换原来的 “let observer = ...”）
        observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            // 新增：若冻结，直接忽略（被大图激活时冻结）
            if (observerFrozen) return;

            // 新增：末页 + 虚拟缓冲区 + 大图激活逻辑
            const maxDomLast = getDomLastPageNum();
            const atLastPage = !!(maxDomLast && lastLoadedPage >= maxDomLast);
            const nearBottom = (window.scrollY + window.innerHeight) >= (document.documentElement.scrollHeight - 200);

            // 检测是否有激活大图且在视口中（限定在当前串的最后 replies）
            let activeInView = false;
            const container = getRootRepliesContainer();
            const activeBox = container && container.lastReplies
              ? container.lastReplies.querySelector('.h-threads-img-box.h-active')
              : null;
            if (activeBox) {
              const r = activeBox.getBoundingClientRect();
              activeInView = (r.bottom > 0 && r.top < window.innerHeight);
            }

            // 在末页时：如果激活大图且未接近底部 → 冻结观察器避免误触发
            if (atLastPage && activeInView && !nearBottom) {
              try { observer.disconnect(); } catch (e) {}
              observerFrozen = true;
              return;
            }

            // 在末页时：开启“虚拟缓冲区”，只有 nearBottom 才允许触发（解决大图未激活也提前触发的问题）
            if (atLastPage && !nearBottom) {
              return;
            }

            // 原有的触发判定保留
            if (entry.isIntersecting && !loading) {
              if (hasUserInteracted && lastUserScrollDir > 0) {
                loadNext();
              }
            }
          });
        }, { root: null, rootMargin: '0px', threshold: 0.05 });

        observer.observe(sentinel);
      }

      function initManualButton() {
        const btn = document.createElement('div');
        btn.className = 'xdex-placeholder';
        btn.textContent = '加载下一页';
        btn.style.cssText = `
          padding: 6px 10px;
          background: rgb(250, 250, 250);
          color: rgb(136, 136, 136);
          border: 1px dashed rgb(187, 187, 187);
          margin: 10px auto;
          cursor: pointer;
          width: 100%;
          box-sizing: border-box;
          text-align: center;
        `;
        btn.addEventListener('click', () => {
          // 允许点击时触发 loadNext，由 loadNext 负责末页提示（避免寂默返回）
          loadNext();
        });

        ensureSentinelPlaced();
        if (sentinel && sentinel.parentNode) {
          sentinel.parentNode.insertBefore(btn, sentinel);
        }
      }

      function initObserverBoard() {
        ensureSentinelPlacedBoard();
        if (!sentinel) return;
        let observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !loading && !done) {
              if (hasUserInteracted && lastUserScrollDir > 0) {
                loadNextBoard();
              }
            }
          });
        }, { root: null, rootMargin: '0px', threshold: 0.05 });
        observer.observe(sentinel);
      }

      function initManualButtonBoard() {
        const btn = document.createElement('div');
        btn.className = 'xdex-placeholder';
        btn.textContent = '加载下一页';
        btn.style.cssText = `
          padding: 6px 10px;
          background: rgb(250, 250, 250);
          color: rgb(136, 136, 136);
          border: 1px dashed rgb(187, 187, 187);
          margin: 10px auto;
          cursor: pointer;
          width: 100%;
          box-sizing: border-box;
          text-align: center;
        `;
        btn.addEventListener('click', () => loadNextBoard());
        ensureSentinelPlacedBoard();
        if (sentinel && sentinel.parentNode) {
          sentinel.parentNode.insertBefore(btn, sentinel);
        }
      }

      if (isThreadPage) {
        if (cfg.enableAutoSeamlessPaging) {
          ensureSentinelPlaced();
          initObserver();
        } else {
          initManualButton();
        }
      } else if (isBoardPage) {
        if (cfg.enableAutoSeamlessPaging) {
          ensureSentinelPlacedBoard();
          initObserverBoard();
        } else {
          initManualButtonBoard();
        }
      }

      // 调试：检查 loadNext 是否存在
      console.log('=== 定义 window.SeamlessPaging 前的检查 ===');
      console.log('loadNext 类型:', typeof loadNext);
      console.log('loadNext 函数:', loadNext);

      const loadNextFunc = loadNext;  // ← 先保存引用
      console.log('loadNextFunc 类型:', typeof loadNextFunc);

      // 为拦截中间页发送成功分支提供无缝翻页调用
      window.SeamlessPaging = {
        loadNext: function() {
          console.log('=== window.SeamlessPaging.loadNext 被调用 ===');
          console.log('调用时 loadNext 类型:', typeof loadNext);
          console.log('调用时 loadNextFunc 类型:', typeof loadNextFunc);
          console.log('lastLoadedPage 当前值:', lastLoadedPage);
          console.log('loading 当前值:', loading);
          console.log('loadedPages 内容:', Array.from(loadedPages));

          loadedPages.delete(lastLoadedPage + 1);   // 清除下一页的已加载标记
          console.log('已删除页码:', lastLoadedPage + 1);

          loading = false;                          // 重置加载状态
          console.log('loading 重置为:', loading);

          lastCheckAt = 0;                          // 重置防抖时间戳
          console.log('lastCheckAt 重置为:', lastCheckAt);

          console.log('准备在 50ms 后调用 loadNextFunc');
          setTimeout(() => {
            console.log('=== setTimeout 内部执行 ===');
            console.log('执行前 loadNextFunc 类型:', typeof loadNextFunc);
            try {
              loadNextFunc();
              console.log('loadNextFunc 调用成功');
            } catch (err) {
              console.error('loadNextFunc 调用失败:', err);
            }
          }, 50);
        }
      };

      console.log('=== window.SeamlessPaging 定义完成 ===');
      console.log('window.SeamlessPaging:', window.SeamlessPaging);
      addRefreshButtonIfNeeded();

    } catch (err) {
        console.error('initSeamlessPaging failed', err);
  }

  }

  /* --------------------------------------------------
   * tag 8. 移植‘X岛-揭示板的增强型体验’功能：启用高清图片链接+图片控件+布局调整/串在新标签页打开
   * -------------------------------------------------- */
  /* --------------------------------------------------
  * 合并后的图片处理函数：高清图片 + 防溢出 + 图片控件
  * -------------------------------------------------- */
  // 屏蔽原站点的 initImageBox
  window.initImageBox = function() {
    console.debug("initImageBox 已被屏蔽，由 enableHDImageAndLayoutFix 接管");
  };
  // 新逻辑，启用高清图片链接和布局修正
  const hdImageLazyLoader = (() => {
    const ROOT_MARGIN = '600px 0px';
    const MAX_CONCURRENT = 3;
    const BEHIND_PENALTY_DISTANCE = 2500;
    let observer = null;
    let scrollListenerBound = false;
    let lastScrollY = window.scrollY || window.pageYOffset || 0;
    let scrollDirection = 1;
    let activeLoads = 0;
    let peakActiveLoads = 0;
    const queue = [];
    const queued = new Set();

    function getHdUrl(url) {
      const raw = String(url || '');
      return raw.includes('/thumb/') ? raw.replace('/thumb/', '/image/') : raw;
    }

    function isGifUrl(url) {
      return /\.gif(?:$|[?#])/i.test(String(url || ''));
    }

    function bindScrollListener() {
      if (scrollListenerBound) return;
      window.addEventListener('scroll', () => {
        const currentY = window.scrollY || window.pageYOffset || 0;
        if (currentY > lastScrollY) scrollDirection = 1;
        else if (currentY < lastScrollY) scrollDirection = -1;
        lastScrollY = currentY;
        processQueue();
      }, { passive: true });
      scrollListenerBound = true;
    }

    function ensureObserver() {
      if (observer || typeof IntersectionObserver !== 'function') return observer;
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          enqueue(img);
          observer.unobserve(img);
        });
      }, {
        root: null,
        rootMargin: ROOT_MARGIN,
        threshold: 0.01
      });
      return observer;
    }

    function prepare(img, hdUrl) {
      if (!img) return '';
      const finalHdUrl = getHdUrl(hdUrl || img.currentSrc || img.src || img.getAttribute('src') || '');
      if (!finalHdUrl || !finalHdUrl.includes('/image/')) return '';
      if (!img.dataset.xdexThumbSrc) {
        img.dataset.xdexThumbSrc = img.currentSrc || img.src || img.getAttribute('src') || '';
      }
      img.dataset.xdexHdSrc = finalHdUrl;
      img.loading = 'lazy';
      return finalHdUrl;
    }

    function collect(root) {
      if (!root) return [];
      const imgs = [];
      if (root.matches && root.matches('img[data-xdex-hd-src]')) imgs.push(root);
      if (root.querySelectorAll) {
        root.querySelectorAll('img[data-xdex-hd-src]').forEach(img => imgs.push(img));
      }
      return imgs;
    }

    function getImagePriority(img) {
      const rect = img.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const viewportCenter = viewportHeight / 2;
      const imgCenter = rect.top + rect.height / 2;
      const aheadDistance = scrollDirection >= 0 ? rect.top - viewportHeight : -rect.bottom;
      const behindDistance = scrollDirection >= 0 ? -rect.bottom : rect.top - viewportHeight;
      const isVisible = rect.bottom >= 0 && rect.top <= viewportHeight;
      const isAhead = aheadDistance >= 0;
      const isBehind = behindDistance > 0;

      if (isVisible) return Math.abs(imgCenter - viewportCenter);
      if (isAhead) return 10000 + aheadDistance;
      if (isBehind) {
        const farBehindPenalty = behindDistance > BEHIND_PENALTY_DISTANCE ? 1000000 : 100000;
        return farBehindPenalty + behindDistance;
      }
      return 200000 + Math.abs(imgCenter - viewportCenter);
    }

    function processQueue() {
      if (activeLoads >= MAX_CONCURRENT || queue.length === 0) return;

      queue.sort((a, b) => getImagePriority(a) - getImagePriority(b));
      while (activeLoads < MAX_CONCURRENT && queue.length > 0) {
        const img = queue.shift();
        queued.delete(img);
        if (!img || !img.isConnected) continue;
        if (img.dataset.xdexHdLoaded === '1' || img.dataset.xdexHdLoading === '1') continue;

        const hdSrc = img.dataset.xdexHdSrc;
        if (!hdSrc) continue;

        activeLoads++;
        peakActiveLoads = Math.max(peakActiveLoads, activeLoads);
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          activeLoads = Math.max(0, activeLoads - 1);
          processQueue();
        };
        img.addEventListener('load', finish, { once: true });
        img.addEventListener('error', finish, { once: true });
        load(img, hdSrc);
        if (img.dataset.xdexHdLoaded === '1' || img.dataset.xdexHdLoading !== '1') finish();
      }
    }

    function enqueue(img) {
      if (!img || img.dataset.xdexHdLoaded === '1' || img.dataset.xdexHdLoading === '1') return;
      if (!img.dataset.xdexHdSrc) return;
      if (!queued.has(img)) {
        queued.add(img);
        queue.push(img);
      }
      processQueue();
    }

    function observe(root) {
      const io = ensureObserver();
      if (!io) return;
      bindScrollListener();
      collect(root).forEach(img => {
        if (img.dataset.xdexHdLoaded === '1') return;
        io.observe(img);
      });
    }

    function load(img, hdUrl) {
      if (!img) return;
      const finalHdUrl = prepare(img, hdUrl);
      if (!finalHdUrl) return;
      if ((img.currentSrc || img.src) === finalHdUrl) {
        img.dataset.xdexHdLoaded = '1';
        delete img.dataset.xdexHdLoading;
        return;
      }
      if (img.dataset.xdexHdLoading === '1') return;

      img.dataset.xdexHdLoading = '1';
      const thumbSrc = img.dataset.xdexThumbSrc || '';
      const onLoad = () => {
        img.dataset.xdexHdLoaded = '1';
        delete img.dataset.xdexHdLoading;
      };
      const onError = () => {
        delete img.dataset.xdexHdLoading;
        if (thumbSrc && (img.currentSrc || img.src) === finalHdUrl) img.src = thumbSrc;
      };

      img.addEventListener('load', onLoad, { once: true });
      img.addEventListener('error', onError, { once: true });
      img.src = finalHdUrl;
    }

    function getStats() {
      return {
        activeLoads,
        peakActiveLoads,
        queued: queue.length,
        maxConcurrent: MAX_CONCURRENT,
        scrollDirection
      };
    }

    return { getHdUrl, isGifUrl, prepare, observe, load, getStats };
  })();

  const hdImageDebugTarget = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

  function clearHDImageTiming() {
    if (performance && typeof performance.clearResourceTimings === 'function') {
      performance.clearResourceTimings();
    }
    return 'cleared';
  }

  function reportHDImageConcurrency(options = {}) {
    const includeGif = !!options.includeGif;
    const showTable = options.table !== false;
    const entries = performance.getEntriesByType('resource')
      .filter(e => e && e.initiatorType === 'img')
      .filter(e => String(e.name || '').includes('/image/'))
      .filter(e => includeGif || !/\.gif(?:$|[?#])/i.test(String(e.name || '')))
      .filter(e => Number.isFinite(e.startTime) && Number.isFinite(e.responseEnd) && e.responseEnd > e.startTime)
      .sort((a, b) => a.startTime - b.startTime);

    let peak = 0;
    let peakAt = 0;
    entries.forEach(a => {
      let active = 0;
      entries.forEach(b => {
        if (b.startTime <= a.startTime && b.responseEnd >= a.startTime) active++;
      });
      if (active > peak) {
        peak = active;
        peakAt = a.startTime;
      }
    });

    const rows = entries.map(e => ({
      start: Math.round(e.startTime),
      end: Math.round(e.responseEnd),
      duration: Math.round(e.duration),
      url: String(e.name || '').slice(-100)
    }));
    if (showTable && rows.length) console.table(rows);

    const result = {
      peakResourceOverlap: peak,
      peakAt: Math.round(peakAt),
      countedRequests: entries.length,
      includeGif,
      loader: hdImageLazyLoader.getStats()
    };
    console.log('[XDEX HD image concurrency]', result);
    return result;
  }

  window.__xdexClearHDImageTiming = clearHDImageTiming;
  window.__xdexReportHDImageConcurrency = reportHDImageConcurrency;
  hdImageDebugTarget.__xdexClearHDImageTiming = clearHDImageTiming;
  hdImageDebugTarget.__xdexReportHDImageConcurrency = reportHDImageConcurrency;

  function isSettingsPanelImageEnhancementRoot(root) {
    if (!root || root === document) return false;
    const node = root.nodeType === 1 ? root : root.parentElement;
    return !!(node && node.closest && node.closest('#sp_panel'));
  }

  function enableHDImageAndLayoutFix(root = document) {
    return startupPerfDebug.measure('enableHDImageAndLayoutFix', () => {
    if (isSettingsPanelImageEnhancementRoot(root)) return;
    const isDocumentRoot = root === document;
    if (isDocumentRoot && enableHDImageAndLayoutFix.__documentProcessed) {
      handlePendingHDImageAndLayoutFix(document);
      return;
    }
    if (isDocumentRoot) enableHDImageAndLayoutFix.__documentProcessed = true;
    // ==================== 注入样式（只注入一次）====================
    if (!document.getElementById('prevent-overflow-style')) {
      const style = document.createElement('style');
      style.id = 'prevent-overflow-style';
      style.textContent = `
        .h-threads-content,
        .h-threads-item-reply-main,
        .h-preview-box {
          max-width: 100%;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
          box-sizing: border-box;
        }

        .h-threads-img-box.h-active {
          max-width: 100%;
          box-sizing: border-box;
          overflow: visible;
        }

        .h-threads-img-box.h-active .h-threads-img-a {
          display: block;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          transition: width 0.3s ease, height 0.3s ease;
        }

        .h-threads-img-box.h-active .h-threads-img {
          display: block;
          box-sizing: border-box;
          position: relative;
          transform-origin: center center;
          transition: transform 0.2s ease-out,
                      margin 0.2s ease-out;
        }

        .h-threads-content img:not(.h-threads-img),
        .h-preview-box img {
          max-width: 100% !important;
          height: auto !important;
          box-sizing: border-box;
        }

        .h-threads-content pre,
        .h-preview-box pre {
          max-width: 100%;
          overflow-x: auto;
          white-space: pre-wrap;
          word-wrap: break-word;
          box-sizing: border-box;
        }

        .h-threads-content table,
        .h-preview-box table {
          max-width: 100%;
          overflow-x: auto;
          display: block;
          box-sizing: border-box;
        }

        .h-threads-content a,
        .h-preview-box a {
          word-break: break-all;
          overflow-wrap: break-word;
        }
      `;
      document.head.appendChild(style);
    }

    // ==================== 子函数1: 布局计算和溢出处理 ====================
    const handleImageLayout = {

      getElementContentWidth(el) {
        if (!el) return 0;
        const style = getComputedStyle(el);
        const paddingX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
        const width = el.clientWidth || el.offsetWidth || 0;
        return Math.max(0, Math.floor(width - paddingX));
      },

      // ★ 新增：根据场景（板块页/串内页）计算消息容器最大允许宽度
      getMaxMsgWidth(msgMain) {
        // ===== 新增：引用浮窗场景 =====
        const quoteBox = msgMain.closest('.qp-quote');
        if (quoteBox) {
          return this.getElementContentWidth(quoteBox);
        }
        // 基础浏览器边缘限制
        const viewportLimit = window.innerWidth - 240; // 保留你的全局边距逻辑
        // 串内页默认上限
        const threadPageCap = 1200;

        // 判断是否处于板块页的回复结构（存在 .h-threads-item-index）
        const threadItem = msgMain.closest('.h-threads-item');
        const isBoardPage = threadItem && threadItem.classList.contains('h-threads-item-index');

        if (!isBoardPage) {
          // 串内页：使用原有逻辑（viewport 边缘 + 1200 上限）
          return Math.min(viewportLimit, threadPageCap);
        }

        // 板块页：右侧区域限制
        // 右侧区域宽度 = 整个串容器宽度 - 左侧回复序号图标宽度 - 留边距40
        const iconEl = msgMain.previousElementSibling && msgMain.previousElementSibling.classList.contains('h-threads-item-reply-icon')
          ? msgMain.previousElementSibling
          : null;
        const iconWidth = iconEl ? iconEl.offsetWidth || 0 : 0;

        const threadWidth = threadItem.offsetWidth || viewportLimit;
        const rightRegionWidth = Math.max(0, threadWidth - iconWidth - 40);

        // 不能超过浏览器边缘限制
        return Math.min(rightRegionWidth, viewportLimit);
      },

      // ★ 新增：未激活时也拓展消息容器宽度
      expandMsgWidthIfImageExists(msgMain) {
        const imgBox = msgMain.querySelector('.h-threads-img-box');
        if (!imgBox) return; // 没有图片则跳过
      
        // ☆ 新增：检查是否已经扩展过，如果已扩展则跳过
        if (msgMain.__imageWidthExpanded === true) return;
      
        // 如果图片未激活
        if (!imgBox.classList.contains('h-active')) {
          const currentWidth = msgMain.offsetWidth;
          const maxMsgWidth = this.getMaxMsgWidth(msgMain);
          const targetWidth = Math.min(currentWidth + 80, maxMsgWidth);

          // 保存原始宽度，便于之后恢复
          if (msgMain.__originalWidth === undefined) {
            msgMain.__originalWidth = msgMain.style.width || '';
          }

          msgMain.style.width = targetWidth + 'px';
          // ☆ 新增：标记已经扩展过，防止重复调用时继续加宽
          msgMain.__imageWidthExpanded = true;
        }
      },

      // 预计算图片在所有旋转角度下的尺寸
      precalculateImageSizes(naturalWidth, naturalHeight, maxWidth) {
        const sizes = {};

        // 0° 和 180°（宽高不变）
        let horizontal = {
          containerWidth: naturalWidth,
          containerHeight: naturalHeight,
          imgWidth: naturalWidth,
          imgHeight: naturalHeight,
          scale: 1
        };

        // 判断当前朝向下，应该按哪个维度适配
        if (naturalWidth > maxWidth) {
          // 宽度超限，按宽度等比缩放
          const scale = maxWidth / naturalWidth;
          horizontal.containerWidth = maxWidth;
          horizontal.containerHeight = Math.floor(naturalHeight * scale);
          horizontal.imgWidth = maxWidth;
          horizontal.imgHeight = Math.floor(naturalHeight * scale);
          horizontal.scale = scale;
        // } else if (naturalHeight > maxWidth && naturalWidth < maxWidth * 0.8) {
        //   // 宽度明显小于最大宽度（小于80%）且高度超限时，才按高度等比缩放
        //   const scale = maxWidth / naturalHeight;
        //   horizontal.containerWidth = Math.floor(naturalWidth * scale);
        //   horizontal.containerHeight = maxWidth;
        //   horizontal.imgWidth = Math.floor(naturalWidth * scale);
        //   horizontal.imgHeight = maxWidth;
        //   horizontal.scale = scale;
        // }
          } else {
            // 宽度未超限，保持原尺寸或适当放大
            // 不做任何处理，使用初始值（原尺寸）
          }
        // 如果宽高都不超限，保持原尺寸（已在初始化时设置）

        sizes[0] = sizes[180] = horizontal;

        // 90° 和 270°（宽高互换）
        let vertical = {
          containerWidth: naturalHeight,   // 容器宽度 = 原图高度
          containerHeight: naturalWidth,   // 容器高度 = 原图宽度
          imgWidth: naturalWidth,
          imgHeight: naturalHeight,
          scale: 1
        };

        // 旋转后，容器的宽度实际是原图的高度
        if (naturalHeight > maxWidth) {
          // 旋转后宽度（原图高度）超限，按原图高度等比缩放
          const scale = maxWidth / naturalHeight;
          vertical.containerWidth = maxWidth;
          vertical.containerHeight = Math.floor(naturalWidth * scale);
          vertical.imgWidth = Math.floor(naturalWidth * scale);
          vertical.imgHeight = maxWidth;
          vertical.scale = scale;
        } else if (naturalWidth > maxWidth) {
          // 旋转后宽度未超限但高度（原图宽度）超限，按原图宽度等比缩放
          const scale = maxWidth / naturalWidth;
          vertical.containerWidth = Math.floor(naturalHeight * scale);
          vertical.containerHeight = maxWidth;
          vertical.imgWidth = maxWidth;
          vertical.imgHeight = Math.floor(naturalHeight * scale);
          vertical.scale = scale;
        }
        // 如果宽高都不超限，保持原尺寸（已在初始化时设置）

        sizes[90] = sizes[270] = vertical;

        return sizes;
      },

      // 应用预计算的尺寸
      applyImageSize(imgBox, rotateIndex) {
        const imgA = imgBox.querySelector('.h-threads-img-a');
        const img = imgBox.querySelector('.h-threads-img');

        if (!imgA || !img || !imgBox.__sizeCache) return;

        img.removeAttribute('align');
        img.removeAttribute('hspace');
        imgBox.style.float = 'none';
        imgA.style.float = 'none';
        img.style.float = 'none';

        // 强制重置图片定位为 relative，确保在容器内正确定位
        img.style.position = 'relative';
        img.style.top = 'auto';
        img.style.left = 'auto';

        // 根据 rotateIndex 确定旋转角度
        // const rotation = (rotateIndex * 90) % 360;
        // 不取模，保持角度单调累加
        const rotation = rotateIndex * 90;

        // 用于查找尺寸缓存的归一化角度
        const normalized = ((rotation % 360) + 360) % 360;
        let targetRotation;
        if (normalized === 0) targetRotation = 0;
        else if (normalized === 90) targetRotation = 90;
        else if (normalized === 180) targetRotation = 180;
        else if (normalized === 270) targetRotation = 270;
        else targetRotation = 0;

        // 归一化到 0, 90, 180, 270
        // let targetRotation;
        // if (rotation === 0) {
        //   targetRotation = 0;
        // } else if (rotation === 90) {
        //   targetRotation = 90;
        // } else if (rotation === 180) {
        //   targetRotation = 180;
        // } else if (rotation === 270) {
        //   targetRotation = 270;
        // } else {
        //   targetRotation = 0;
        // }

        const size = imgBox.__sizeCache[targetRotation];
        if (!size) return;

        const isRotated90or270 = (targetRotation === 90 || targetRotation === 270);

        // 设置容器尺寸（容器不旋转，只改变宽高）
        imgA.style.width = size.containerWidth + 'px';
        imgA.style.height = size.containerHeight + 'px';
        imgA.style.maxWidth = imgBox.__maxWidth + 'px';

        // 设置图片尺寸
        img.style.width = size.imgWidth + 'px';
        img.style.height = size.imgHeight + 'px';
        img.style.maxWidth = 'none';
        img.style.maxHeight = 'none';

        // 图片只需要旋转，不需要translate偏移（因为容器已经是正确尺寸）
        img.style.transform = `rotate(${rotation}deg) scale(1.02)`;
        setTimeout(() => {
          img.style.transform = `rotate(${rotation}deg) scale(1)`;
        }, 50);

        if (isRotated90or270) {
          const marginTop = (size.containerHeight - size.imgHeight) / 2;
          const marginLeft = (size.containerWidth - size.imgWidth) / 2;
          img.style.marginTop = marginTop + 'px';
          img.style.marginLeft = marginLeft + 'px';
        } else {
          img.style.display = '';
          img.style.marginTop = '0px';
          img.style.marginLeft = '0px';
          img.style.marginRight = '0px';
          img.style.marginBottom = '0px';
        }
        // 使用margin居中图片
        // if (isRotated90or270) {
        //   const marginTop = (size.containerHeight - size.imgHeight) / 2;
        //   let marginLeft = (size.containerWidth - size.imgWidth) / 2;

        //   // ★ 修正：避免负 margin 导致图片超出容器
        //   if (marginLeft < 0) marginLeft = 0;

        //   img.style.marginTop = marginTop + 'px';
        //   img.style.marginLeft = marginLeft + 'px';
        // } else {
        //   img.style.marginTop = '0px';
        //   img.style.marginLeft = '0px';
        // }
        // 设置容器和图片尺寸保持一致
        // if (isRotated90or270) {
        //   // 旋转 90°/270° 时，容器宽高直接跟随图片
        //   imgA.style.width = size.imgWidth + 'px';
        //   imgA.style.height = size.imgHeight + 'px';
        // } else {
        //   // 0°/180° 时，容器用正常计算值
        //   imgA.style.width = size.containerWidth + 'px';
        //   imgA.style.height = size.containerHeight + 'px';
        // }
        // imgA.style.maxWidth = imgBox.__maxWidth + 'px';

        // // 设置图片尺寸
        // img.style.width = size.imgWidth + 'px';
        // img.style.height = size.imgHeight + 'px';
        // img.style.maxWidth = 'none';
        // img.style.maxHeight = 'none';

      },

      // 处理激活状态的图片盒子
      handleActiveImageBox(imgBox, forceRecalculate = false) {
        const imgA = imgBox.querySelector('.h-threads-img-a');
        const img = imgBox.querySelector('.h-threads-img');

        if (!imgA || !img) return;

        const isActive = imgBox.classList.contains('h-active');

        if (!isActive) {
          if (imgBox.__activeLayoutFrame) {
            cancelAnimationFrame(imgBox.__activeLayoutFrame);
            imgBox.__activeLayoutFrame = 0;
          }
          // 取消激活：恢复原始状态并清除缓存
          if (imgBox.__originalStyles) {
            imgA.style.width = imgBox.__originalStyles.aWidth || '';
            imgA.style.height = imgBox.__originalStyles.aHeight || '';
            imgA.style.maxWidth = imgBox.__originalStyles.aMaxWidth || '';
            img.style.width = imgBox.__originalStyles.imgWidth || '';
            img.style.height = imgBox.__originalStyles.imgHeight || '';
            img.style.maxWidth = imgBox.__originalStyles.imgMaxWidth || '';
            img.style.maxHeight = imgBox.__originalStyles.imgMaxHeight || '';
            img.style.transform = imgBox.__originalStyles.imgTransform || '';
            img.style.position = imgBox.__originalStyles.imgPosition || '';
            img.style.top = imgBox.__originalStyles.imgTop || '';
            img.style.left = imgBox.__originalStyles.imgLeft || '';
            img.style.display = imgBox.__originalStyles.imgDisplay || '';
            img.style.marginTop = imgBox.__originalStyles.imgMarginTop || '';
            img.style.marginLeft = imgBox.__originalStyles.imgMarginLeft || '';
            img.style.marginRight = imgBox.__originalStyles.imgMarginRight || '';
            img.style.marginBottom = imgBox.__originalStyles.imgMarginBottom || '';
            imgBox.style.float = imgBox.__originalStyles.boxFloat || '';
            imgA.style.float = imgBox.__originalStyles.aFloat || '';
            img.style.float = imgBox.__originalStyles.imgFloat || '';
            if (imgBox.__originalStyles.imgAlign == null) img.removeAttribute('align');
            else img.setAttribute('align', imgBox.__originalStyles.imgAlign);
            if (imgBox.__originalStyles.imgHspace == null) img.removeAttribute('hspace');
            else img.setAttribute('hspace', imgBox.__originalStyles.imgHspace);

            delete imgBox.__originalStyles;
            delete imgBox.__sizeCache;
            delete imgBox.__maxWidth;
          }
          // ★ 未激活但存在图片时，消息容器宽度扩大 100px，且不超过场景最大宽度
          // const msgMain = imgBox.closest('.h-threads-item-reply-main');
          // if (msgMain) {
          //   const currentWidth = msgMain.offsetWidth;
          //   const maxMsgWidth = this.getMaxMsgWidth(msgMain);
          //   const targetWidth = Math.min(currentWidth + 50, maxMsgWidth);
          //   msgMain.style.width = targetWidth + 'px';
          // }
          // ★ 新增逻辑：恢复页面加载时的额外拓展
          // const msgMain = imgBox.closest('.h-threads-item-reply-main');
          // if (msgMain && msgMain.__originalWidth !== undefined) {
          //   msgMain.style.width = msgMain.__originalWidth; // 恢复原始宽度
          //   delete msgMain.__originalWidth;
          // }
          return;
        }

        // 保存原始样式
        if (!imgBox.__originalStyles) {
          imgBox.__originalStyles = {
            aWidth: imgA.style.width,
            aHeight: imgA.style.height,
            aMaxWidth: imgA.style.maxWidth,
            imgWidth: img.style.width,
            imgHeight: img.style.height,
            imgMaxWidth: img.style.maxWidth,
            imgMaxHeight: img.style.maxHeight,
            imgTransform: img.style.transform,
            imgPosition: img.style.position,
            imgTop: img.style.top,
            imgLeft: img.style.left,
            imgDisplay: img.style.display,
            imgMarginTop: img.style.marginTop,
            imgMarginLeft: img.style.marginLeft,
            imgMarginRight: img.style.marginRight,
            imgMarginBottom: img.style.marginBottom,
            boxFloat: imgBox.style.float,
            aFloat: imgA.style.float,
            imgFloat: img.style.float,
            imgAlign: img.getAttribute('align'),
            imgHspace: img.getAttribute('hspace')
          };
        }

        if (imgBox.__activeLayoutFrame) cancelAnimationFrame(imgBox.__activeLayoutFrame);
        imgBox.__activeLayoutForceRecalculate = !!(imgBox.__activeLayoutForceRecalculate || forceRecalculate);

        imgBox.__activeLayoutFrame = requestAnimationFrame(() => {
          const shouldForceRecalculate = !!imgBox.__activeLayoutForceRecalculate;
          imgBox.__activeLayoutFrame = 0;
          imgBox.__activeLayoutForceRecalculate = false;
          if (!imgBox.classList.contains('h-active')) return;

          const naturalWidth = img.naturalWidth;
          const naturalHeight = img.naturalHeight;

          if (!naturalWidth || !naturalHeight) {
            if (img.complete) return;
            img.onload = () => {
              if (imgBox.classList.contains('h-active')) this.handleActiveImageBox(imgBox);
            };
            return;
          }

          // 强制触发布局更新
          document.body.offsetHeight;

          // 获取当前最大可用宽度
          // const container = imgBox.closest('.h-threads-item-reply-main');
          const container = imgBox.closest('.h-threads-item-reply-main') || imgBox.closest('.h-threads-item-main');
          let maxWidth;

          if (container) {
            container.offsetHeight; // 触发 reflow
            let msgWidth = container.offsetWidth || container.clientWidth;

          // 新增：识别预览框与浮窗场景
          const isPreview = !!imgBox.closest('.h-preview-box');
          const isOverlay = !!imgBox.closest('.qp-body'); // 回复浮窗

          if (isPreview) {
            if (isOverlay) {
              // 在预览框 + 浮窗中：使用浮窗内容容器宽度
              const quoteBox = imgBox.closest('.qp-quote');
              if (quoteBox) {
                maxWidth = this.getElementContentWidth(quoteBox);
              } else {
                const wrapEl = imgBox.closest('.qp-content-wrap');
                if (wrapEl) {
                  msgWidth = wrapEl.offsetWidth || msgWidth;
                }
                // 留边距 40（与原逻辑一致），不再受 window.innerWidth - 240 限制
                maxWidth = Math.max(0, (msgWidth || 0) - 40);
              }
            } else {
              // 在预览框但不在浮窗中：最大宽度限制为 800
              // 仍保留消息容器边距 40
              const base = Math.max(0, (msgWidth || 0) - 40);
              maxWidth = Math.min(base, 800);
            }
          } else {
            // 常规消息：保留原逻辑
            if (msgWidth < 300) {
              const parentContainer = container.closest('.h-threads-item-replies') ||
                                      container.closest('.h-threads-list') ||
                                      container.parentElement;
              if (parentContainer) {
                msgWidth = parentContainer.offsetWidth || window.innerWidth - 240;
              } else {
                msgWidth = window.innerWidth - 240;
              }
            }
            // maxWidth = Math.min(msgWidth - 40, handleImageLayout.getMaxMsgWidth(container));
            maxWidth = handleImageLayout.getMaxMsgWidth(container);
          }

        } else {
          // 无容器时，兜底用视口宽度
          maxWidth = Math.min(window.innerWidth - 240, 1200);
        }

          // 如果最大宽度变化或首次计算，重新预计算所有旋转角度的尺寸
          if (!imgBox.__sizeCache || shouldForceRecalculate || imgBox.__maxWidth !== maxWidth) {
            imgBox.__maxWidth = maxWidth;
            imgBox.__sizeCache = this.precalculateImageSizes(naturalWidth, naturalHeight, maxWidth);
          }

          // 获取当前旋转索引
          const rotateIndex = parseInt(img.dataset.rotateIndex || '0');

          // 应用对应旋转角度的尺寸
          this.applyImageSize(imgBox, rotateIndex);

        });
      },

      // 处理普通元素溢出
      handleGeneralElements(container) {
        const SELECTORS = [
          '.h-threads-content',
          '.h-threads-item-reply-main',
          '.h-preview-box',
          'pre',
          'code',
          'table'
        ];

        SELECTORS.forEach(selector => {
          container.querySelectorAll(selector).forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
              el.style.maxWidth = '100%';
              el.style.boxSizing = 'border-box';
            }

            if (el.tagName === 'PRE' || el.tagName === 'CODE') {
              el.style.maxWidth = '100%';
              el.style.overflowX = 'auto';
              el.style.whiteSpace = 'pre-wrap';
            }

            if (el.tagName === 'TABLE') {
              el.style.maxWidth = '100%';
              el.style.display = 'block';
              el.style.overflowX = 'auto';
            }
          });
        });

        container.querySelectorAll('.h-threads-content a, .h-preview-box a').forEach(el => {
          const href = el.getAttribute('href') || '';
          if (href.length > 50) {
            el.style.wordBreak = 'break-all';
            el.style.overflowWrap = 'break-word';
          }
        });

        container.querySelectorAll('.h-threads-content img:not(.h-threads-img), .h-preview-box img').forEach(el => {
          el.style.maxWidth = '100%';
          el.style.height = 'auto';
        });
      }
    };

    // ==================== 子函数2: 交互逻辑处理 ====================
    const handleImageInteraction = {

      // 记录点击次数（用于切换展开/收起）
      clickCountMap: new WeakMap(),
      lastClickedAnchor: null,

      // 准备高清地址，实际图片请求交给近视窗懒加载。
      replaceHDLinks(container) {
        const imgs = [];
        if (container.matches && container.matches('img')) imgs.push(container);
        container.querySelectorAll('img').forEach(img => imgs.push(img));
        imgs.forEach(img => {
          if (img.closest('.h-preview-box')) return; // 新增：预览框中跳过
          const src = img.currentSrc || img.src || img.getAttribute('src') || '';
          if (src.includes('/thumb/')) {
            const hdSrc = hdImageLazyLoader.prepare(img, src);
            if (hdImageLazyLoader.isGifUrl(hdSrc)) hdImageLazyLoader.load(img, hdSrc);
          }
        });

        const anchors = [];
        if (container.matches && container.matches('a')) anchors.push(container);
        container.querySelectorAll('a').forEach(a => anchors.push(a));
        anchors.forEach(a => {
          if (a.closest('.h-preview-box')) return; // 新增：预览框中跳过
          if (a.href.includes('/thumb/')) {
            a.href = hdImageLazyLoader.getHdUrl(a.href);
          }
        });
      },

      // 绑定图片点击展开/收起逻辑
      bindImageClickLogic(container) {
        container.querySelectorAll('.h-threads-img-a').forEach(anchor => {
          // ===== 新增：预览框内的图片不绑定点击逻辑 =====
          if (anchor.closest('.h-preview-box')) return;
          if (anchor.dataset.hdBound === "1") return;
          anchor.dataset.hdBound = "1";

          anchor.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();

          const box = anchor.closest('.h-threads-img-box');
          if (!box) return;

          const img = box.querySelector('.h-threads-img');
          if (!img) return;

          if (!box.__initialDisplayState) {
            box.__initialDisplayState = {
              src: img.currentSrc || img.src || '',
              href: anchor.href || '',
              aWidth: anchor.style.width || '',
              aHeight: anchor.style.height || '',
              imgWidth: img.style.width || '',
              imgHeight: img.style.height || '',
              imgNaturalWidth: img.width || 0,
              imgNaturalHeight: img.height || 0
            };
          }

          const shouldOpen = !box.classList.contains('h-active');

          // 同步保留旧计数状态，但展开/收起以真实 DOM 状态为准。
          if (this.lastClickedAnchor !== anchor) {
            this.lastClickedAnchor = anchor;
            this.clickCountMap.set(anchor, 0);
            }
            this.clickCountMap.set(anchor, shouldOpen ? 1 : 0);

            if (shouldOpen) {
              // 展开
              box.classList.add('h-active');
              hdImageLazyLoader.load(img, anchor.href);
              img.dataset.rotateIndex = '0'; // 重置旋转索引
              // ★ 新增：加载失败兜底
              img.onerror = () => {
                console.warn('[图片加载失败，回退到缩略图]', img.src);
                const fallback = img.dataset.xdexThumbSrc || img.getAttribute('data-src') || anchor.href;
                img.src = fallback;
              };
              // 触发布局计算
              handleImageLayout.handleActiveImageBox(box);
            } else {
              // 收起
              box.classList.remove('h-active');
              img.style.transform = '';
              img.dataset.rotateIndex = '0';
              const initial = box.__initialDisplayState;
              if (initial) {
                if (initial.src) img.src = initial.src;
                if (initial.href) anchor.href = initial.href;
                anchor.style.width = initial.aWidth || '';
                anchor.style.height = initial.aHeight || '';
                img.style.width = initial.imgWidth || '';
                img.style.height = initial.imgHeight || '';
                if (!initial.imgWidth && initial.imgNaturalWidth) {
                  img.width = initial.imgNaturalWidth;
                }
                if (!initial.imgHeight && initial.imgNaturalHeight) {
                  img.height = initial.imgNaturalHeight;
                }
              }
              // 触发布局恢复
              handleImageLayout.handleActiveImageBox(box);
            }
          }, true);
        });
      },

      // 绑定图片控件（收起/旋转按钮）
      bindImageControls(container) {
        container.querySelectorAll('.h-threads-img-box').forEach(box => {
          // ===== 新增：预览框内的图片不绑定控件逻辑 =====
          if (box.closest('.h-preview-box')) return;
          if (box.dataset.toolBound === "1") return;
          box.dataset.toolBound = "1";

          const img = box.querySelector('.h-threads-img');
          const imgA = box.querySelector('.h-threads-img-a');
          const toolSmall = box.querySelector('.h-threads-img-tool-small');
          const toolLeft = box.querySelector('.h-threads-img-tool-left');
          const toolRight = box.querySelector('.h-threads-img-tool-right');

          // 收起按钮
          if (toolSmall && imgA) {
            toolSmall.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopImmediatePropagation();
              imgA.click();
            });
          }

          // 左旋按钮（逆时针）
          if (toolLeft && img) {
            toolLeft.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopImmediatePropagation();

              if (!box.classList.contains('h-active')) return;

              let rotateIndex = parseInt(img.dataset.rotateIndex || '0');
              //rotateIndex = (rotateIndex - 1 + 4) % 4;
              rotateIndex = rotateIndex - 1;   // ★ 改为累加，不取模
              img.dataset.rotateIndex = rotateIndex.toString();

              console.log('[左旋] rotateIndex:', rotateIndex);

              // 延迟执行布局调整，等待旋转动画完成
              setTimeout(() => {
                handleImageLayout.applyImageSize(box, rotateIndex);
              }, 50);
            });
          }

          // 右旋按钮（顺时针）
          if (toolRight && img) {
            toolRight.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopImmediatePropagation();

              if (!box.classList.contains('h-active')) return;

              let rotateIndex = parseInt(img.dataset.rotateIndex || '0');
              //rotateIndex = (rotateIndex + 1) % 4;
              rotateIndex = rotateIndex + 1;   // ★ 改为累加，不取模
              img.dataset.rotateIndex = rotateIndex.toString();

              console.log('[右旋] rotateIndex:', rotateIndex);

              // 延迟执行布局调整，等待旋转动画完成
              setTimeout(() => {
                handleImageLayout.applyImageSize(box, rotateIndex);
              }, 50);
            });
          }
        });
      },

      // 监听图片盒子的状态变化
      observeImageBoxes(container) {
        const imgBoxes = container.querySelectorAll('.h-threads-img-box');

        imgBoxes.forEach(imgBox => {
          // ===== 新增：预览框内的图片不观察 =====
          if (imgBox.closest('.h-preview-box')) return;
          // 如果已经激活但没有正确的尺寸，立即处理
          if (imgBox.classList.contains('h-active')) {
            const imgA = imgBox.querySelector('.h-threads-img-a');
            if (imgA) {
              const currentWidth = parseInt(imgA.style.width) || 0;
              const currentHeight = parseInt(imgA.style.height) || 0;

              // 如果容器尺寸异常（太小或为0），强制重新计算
              if (currentWidth < 50 || currentHeight < 50) {
                requestAnimationFrame(() => {
                  if (imgBox.classList.contains('h-active')) {
                    handleImageLayout.handleActiveImageBox(imgBox, true);
                  }
                });
              }
            }
          }

          // 监听 class 变化
          if (!imgBox.__overflowObserver) {
            const observer = new MutationObserver(mutations => {
              startupPerfDebug.measureObserver('hdImageBox', mutations, () => {
              mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                  handleImageLayout.handleActiveImageBox(imgBox);
                }
              });
              }, () => ({ imgBoxes: 1 }));
            });

            observer.observe(imgBox, {
              attributes: true,
              childList: true,
              subtree: true
            });
            imgBox.__overflowObserver = observer;
          }
        });
      }
    };

    function expandReplyMainWidths(scope) {
      const replyMains = [];
      if (scope.matches && scope.matches('.h-threads-item-reply-main')) {
        replyMains.push(scope);
      }
      if (scope.querySelectorAll) {
        scope.querySelectorAll('.h-threads-item-reply-main').forEach(msgMain => {
          replyMains.push(msgMain);
        });
      }

      replyMains.forEach(msgMain => {
        handleImageLayout.expandMsgWidthIfImageExists(msgMain);
      });
    }

    // ==================== 执行所有处理 ====================

    // 1. 替换高清链接
    handleImageInteraction.replaceHDLinks(root);
    hdImageLazyLoader.observe(root);

    // 2. 绑定图片点击和控件
    handleImageInteraction.bindImageClickLogic(root);
    handleImageInteraction.bindImageControls(root);
    if (typeof enableImageContextMenu === 'function') enableImageContextMenu(root);

    // 3. 处理普通元素溢出
    handleImageLayout.handleGeneralElements(root);

    // 4. 监听图片盒子状态
    handleImageInteraction.observeImageBoxes(root);

    // ★ 页面加载和无缝翻页新内容都需要拓展带图回复宽度
    expandReplyMainWidths(root);
    // ==================== 全局监听 ====================

    // 监听 DOM 变化
    if (root === document && !enableHDImageAndLayoutFix.__globalObserver) {
      const observer = new MutationObserver(mutations => {
        startupPerfDebug.measureObserver('hdGlobal', mutations, () => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType !== 1 || !node.dataset) return;
            if (node.closest && node.closest('#sp_panel')) return;
            const isRelevant = node.matches?.('.h-threads-img-box, .h-threads-img-a, .h-threads-img, .h-threads-content, .h-preview-box')
              || node.querySelector?.('.h-threads-img-box, .h-threads-img-a, .h-threads-img, .h-threads-content, .h-preview-box');
            if (isRelevant) node.dataset.xdexHdLayoutPending = '1';
          });
        });
        schedulePendingHDImageAndLayoutFix();
        }, () => startupPerfDebug.summarizeRoot(document));
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      enableHDImageAndLayoutFix.__globalObserver = observer;
    }

    // 监听窗口大小改变
    if (root === document && !enableHDImageAndLayoutFix.__resizeHandlerBound) {
      window.addEventListener('resize', () => {
        handleImageLayout.handleGeneralElements(document);
        document.querySelectorAll('.h-threads-img-box.h-active').forEach(imgBox => {
          handleImageLayout.handleActiveImageBox(imgBox, true);
        });
      });
      enableHDImageAndLayoutFix.__resizeHandlerBound = true;
    }
    }, () => startupPerfDebug.summarizeRoot(root));
  }

  function handlePendingHDImageAndLayoutFix(root = document) {
    if (!root || !root.querySelectorAll) return;
    const queue = handlePendingHDImageAndLayoutFix.__queue || [];
    const queued = handlePendingHDImageAndLayoutFix.__queued || new Set();
    handlePendingHDImageAndLayoutFix.__queue = queue;
    handlePendingHDImageAndLayoutFix.__queued = queued;

    root.querySelectorAll('[data-xdex-hd-layout-pending="1"]').forEach(node => {
      delete node.dataset.xdexHdLayoutPending;
      if (queued.has(node)) return;
      queued.add(node);
      queue.push(node);
    });

    handlePendingHDImageAndLayoutFix.__scheduled = false;
    if (handlePendingHDImageAndLayoutFix.__running || !queue.length) return;
    processPendingHDImageAndLayoutFix(root);
  }

  function processPendingHDImageAndLayoutFix(root = document) {
    const queue = handlePendingHDImageAndLayoutFix.__queue || [];
    const queued = handlePendingHDImageAndLayoutFix.__queued || new Set();
    const batchSize = 5;
    handlePendingHDImageAndLayoutFix.__running = true;

    startupPerfDebug.measure('enableHDImageAndLayoutFix.pending', () => {
      let processed = 0;
      while (processed < batchSize && queue.length) {
        const node = queue.shift();
        queued.delete(node);
        if (node && node.isConnected) {
          enableHDImageAndLayoutFix(node);
          processed++;
        }
      }
    }, () => startupPerfDebug.summarizeRoot(root));

    if (queue.length) {
      setTimeout(() => processPendingHDImageAndLayoutFix(root), 0);
      return;
    }
    handlePendingHDImageAndLayoutFix.__running = false;
  }

  function schedulePendingHDImageAndLayoutFix() {
    if (handlePendingHDImageAndLayoutFix.__scheduled) return;
    handlePendingHDImageAndLayoutFix.__scheduled = true;
    setTimeout(() => handlePendingHDImageAndLayoutFix(document), 0);
  }

  // 旧逻辑，只作用于预览框
  function enableHDImage(root = document) {
    return startupPerfDebug.measure('enableHDImage', () => {
    // 记录点击次数（用于切换展开/收起）
    const clickCountMap = new WeakMap();
    let lastClickedAnchor = null;

    // 1. 仅在预览框内准备高清链接，实际请求交给近视窗懒加载
    root.querySelectorAll('.h-preview-box img').forEach(img => {
      const src = img.currentSrc || img.src || img.getAttribute('src') || '';
      if (src.includes('/thumb/')) {
        const hdSrc = hdImageLazyLoader.prepare(img, src);
        if (hdImageLazyLoader.isGifUrl(hdSrc)) hdImageLazyLoader.load(img, hdSrc);
      }
    });
    root.querySelectorAll('.h-preview-box a').forEach(a => {
      if (a.href.includes('/thumb/')) {
        a.href = hdImageLazyLoader.getHdUrl(a.href);
      }
    });
    hdImageLazyLoader.observe(root);

    // 2. 仅绑定预览框内的图片盒子的点击逻辑
    root.querySelectorAll('.h-preview-box .h-threads-img-a').forEach(anchor => {
      if (anchor.dataset.hdBound === "1") return;
      anchor.dataset.hdBound = "1";

      anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // 保护：如果不是预览框中的 anchor，直接返回
        if (!this.closest('.h-preview-box')) return;

        const box = this.closest('.h-threads-img-box');
        if (!box) return;

        const img = box.querySelector('.h-threads-img');
        if (!img) return;

        // 计数切换展开/收起
        if (lastClickedAnchor !== this) {
          lastClickedAnchor = this;
          clickCountMap.set(this, 0);
        }
        let count = (clickCountMap.get(this) || 0) + 1;
        clickCountMap.set(this, count);

        if (count % 2 === 1) {
          box.classList.add('h-active');
          hdImageLazyLoader.load(img, this.href);
          updatePreviewImageLayout(box);
        } else {
          box.classList.remove('h-active');
          img.style.transform = '';
          img.style.top = '0px';
          img.style.left = '0px';
          img.dataset.rotateIndex = 0;
          const ds = img.getAttribute('data-src');
          if (ds) img.src = ds;
          else if (img.dataset.xdexThumbSrc) img.src = img.dataset.xdexThumbSrc;
          updatePreviewImageLayout(box);
        }
      });
    });

    // 3. 工具按钮逻辑（收起/旋转）
    const rotateArray = [
      'matrix(1, 0, 0, 1, 0, 0)',
      'matrix(0, 1, -1, 0, 0, 0)',
      'matrix(-1, 0, 0, -1, 0, 0)',
      'matrix(0, -1, 1, 0, 0, 0)'
    ];

    function applyResizeForRotation(img, imgA, rotateIndex) {
      if (!img || !imgA) return;
      const normalizedRotateIndex = ((rotateIndex % rotateArray.length) + rotateArray.length) % rotateArray.length;
      img.style.setProperty('transform', rotateArray[normalizedRotateIndex], 'important');
      img.style.setProperty('transform-origin', 'center center', 'important');
      const width = img.width;
      const height = img.height;

      if (normalizedRotateIndex === 1 || normalizedRotateIndex === 3) {
        const offset = (width - height) / 2;
        img.style.setProperty('top', offset + 'px', 'important');
        img.style.setProperty('left', -offset + 'px', 'important');
        imgA.style.height = width + 'px';
      } else {
        img.style.setProperty('top', '0px', 'important');
        img.style.setProperty('left', '0px', 'important');
        imgA.style.height = height + 'px';
      }
    }

    function updatePreviewImageLayout(box) {
      if (!box) return;
      const img = box.querySelector('.h-threads-img');
      const imgA = box.querySelector('.h-threads-img-a');
      if (!img || !imgA) return;
      const rotateIndex = Number.parseInt(img.dataset.rotateIndex || '0', 10) || 0;
      applyResizeForRotation(img, imgA, rotateIndex);
    }

    function rotatePreviewImage(box, delta) {
      if (!box || !box.closest('.h-preview-box')) return;
      const img = box.querySelector('.h-threads-img');
      const imgA = box.querySelector('.h-threads-img-a');
      if (!img || !imgA) return;
      if (!box.classList.contains('h-active')) {
        box.classList.add('h-active');
        hdImageLazyLoader.load(img, imgA.getAttribute('href') || img.src || '');
      }
      const current = Number.parseInt(img.dataset.rotateIndex || '0', 10) || 0;
      const next = (current + delta + rotateArray.length) % rotateArray.length;
      img.dataset.rotateIndex = String(next);
      updatePreviewImageLayout(box);
      requestAnimationFrame(() => updatePreviewImageLayout(box));
    }

    // 3. 仅绑定预览框内的图片盒子工具按钮
    root.querySelectorAll('.h-preview-box .h-threads-img-box').forEach(box => {
      if (box.dataset.toolBound === "1") return;
      box.dataset.toolBound = "1";

      // 保护：如果该盒子不在预览框，则跳过
      if (!box.closest('.h-preview-box')) return;

      const img = box.querySelector('.h-threads-img');
      const imgA = box.querySelector('.h-threads-img-a');
      const toolSmall = box.querySelector('.h-threads-img-tool-small');
      const toolLarge = box.querySelector('.h-threads-img-tool-large');
      const toolLeft = box.querySelector('.h-threads-img-tool-left');
      const toolRight = box.querySelector('.h-threads-img-tool-right');

      if (toolSmall && imgA) {
        toolSmall.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          imgA.click();
        });
      }

      if (toolLarge && imgA) {
        toolLarge.href = imgA.href || img.src || 'javascript:;';
        toolLarge.target = '_blank';
        toolLarge.addEventListener('click', (e) => {
          e.stopImmediatePropagation();
          const url = imgA.href || img.src || '';
          if (!url || url === location.href || /(^|\/)?:javascript:;?$/.test(url)) {
            e.preventDefault();
            return;
          }
          toolLarge.href = url;
        });
      }

      if (toolLeft && img) {
        toolLeft.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          rotatePreviewImage(box, -1);
        });
      }

      if (toolRight && img) {
        toolRight.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          rotatePreviewImage(box, 1);
        });
      }
    });
    }, () => startupPerfDebug.summarizeRoot(root));
  }

  // 板块页链接新标签页打开
  function runLinkBlank(root = document) {
    const selector = '#h-content .h-threads-list a, .margin-bottom a, .margin-top a, [style*="margin-top: -5px"] a, [style*="margin-top:-5px"] a, #h-menu-content a';
    root.querySelectorAll(selector).forEach(a => {
        // ===== 新增：排除分页导航内的链接 =====
        if (a.closest('ul.uk-pagination.uk-pagination-left.h-pagination')) return;
        if (a.closest('.uk-parent')) return;
        const href = String(a.getAttribute('href') || '').trim();
        if (!href || href === '#' || /^javascript:/i.test(href)) return;
        // =====================================
        a.setAttribute('target', '_blank');
        if (!a.dataset.xdexLinkBlankCurrentBound) {
          a.dataset.xdexLinkBlankCurrentBound = '1';
          a.addEventListener('click', e => {
            if (e.button !== 0 || !(e.ctrlKey || e.metaKey)) return;
            e.preventDefault();
            window.location.href = a.href;
          });
        }
    });
  }

  /* --------------------------------------------------
   * tag 9. 引用浮窗/鼠标离开后自动隐藏原生引用/引用格式拓展
   * -------------------------------------------------- */
  function enableQuotePreview() {
    if (enableQuotePreview.__initialized) return;
    const quotePreviewRoot = document.body;
    if (!quotePreviewRoot) {
      setTimeout(enableQuotePreview, 25);
      return;
    }

    const cache = Object.create(null);
    // 防止短时间内重复点击同一引用号导致多重弹窗
    let lastQuoteTid = null;
    let lastQuoteAt = 0;
    const QUOTE_DOUBLE_CLICK_WINDOW = 250;

    // 注入样式（只注入一次）
    if (!document.getElementById('qp-styles')) {
      const style = document.createElement('style');
      style.id = 'qp-styles';
      style.textContent = `
        .qp-overlay-quote {
          position: fixed; inset: 0;
          z-index: 9999; /* 降低层级 */
          background: rgba(0,0,0,.45);
          display: none;
        }
        .qp-stack {
          position: fixed;
          top: 55%; /* 下移一点 */
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(90vw, 820px);
          height: 80vh;
          overflow: visible;
          box-sizing: border-box;
        }

        .qp-close-all {
          position: fixed; right: 12px; bottom: 12px;
          font-size: 20px; line-height: 1;
          color: #fff; background: rgba(0,0,0,.6);
          padding: 6px 12px; border-radius: 6px; cursor: pointer; z-index: 10000;
          user-select: none;
        }
        .qp-quote {
          position: absolute;
          top: 0; left: 0;
          width: 100%; max-height: 100%;
          overflow: auto;
          background: #FFFFEE;
          border: 1px solid #ccc;
          outline: 2px solid #fff;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,.24);
          padding: 18px 20px 20px;
          box-sizing: border-box;
        }
        .qp-quote * { max-width: 100%; box-sizing: border-box; }
        .qp-header {
          position: sticky; top: 0;
          display: flex; gap: 10px; justify-content: flex-end;
          padding-bottom: 6px; margin: -8px -8px 10px; padding: 8px;
          background: transparent; /* ✅ 改为透明背景 */
          z-index: 2;
        }
        .qp-level {
          font-size: 12px; color: #333; background: #eee; border-radius: 4px; padding: 2px 6px;
        }
        .qp-back {
          font-size: 12px; color: #333; background: #f0f0f0;
          border: 1px solid #ccc; border-radius: 4px; padding: 2px 6px;
          cursor: pointer;
        }
        .qp-quote.is-dragging { cursor: grabbing !important; }
        #h-ref-view { pointer-events: none !important; }
        #h-ref-view {
          z-index: 20000 !important; /* 保证原生引用框在浮窗之上 */
        }
        /* 拖拽手柄：四边窄条，仅在手柄区域显示“移动”指针 */
        .qp-drag-edge {
          position: absolute;
          pointer-events: auto;
          z-index: 3;
          cursor: move;
        }
        .qp-drag-edge.top    { top: 0;    left: 0;    right: 0;  height: 10px; }
        .qp-drag-edge.bottom { bottom: 0; left: 0;    right: 0;  height: 10px; }
        .qp-drag-edge.left   { top: 0;    bottom: 0;  left: 0;   width: 10px; }
        .qp-drag-edge.right  { top: 0;    bottom: 0;  right: 0;  width: 10px; } 
        /* 标题栏作为拖拽手柄时的指针反馈 */
        .qp-header { cursor: move; }

      `;
      document.head.appendChild(style);
    }

    //✅ 监听原生引用浮窗的显示，如果鼠标不在引用号上则立即隐藏
    const observer = new MutationObserver(() => {
      const refView = document.getElementById('h-ref-view');
      if (!refView) return;
    
      const display = refView.style.display;
    
      // ✅ 当浮窗被隐藏时（none），重置透明度
      if (display === 'none') {
        refView.style.opacity = '';
        return;
      }
    
      // ✅ 当浮窗显示时（block），检查鼠标是否在引用号上
      if (display === 'block') {
        const quoteFonts = document.querySelectorAll('font[color="#789922"]');
        let isHovering = false;
    
        quoteFonts.forEach(font => {
          if (font.matches(':hover')) {
            isHovering = true;
          }
        });
    
        // ✅ 显示但鼠标不在引用号上 → 立即隐藏并重置透明度
        if (!isHovering) {
          refView.style.display = 'none';
          refView.style.opacity = '';
        }
      }
    });
    
    observer.observe(quotePreviewRoot, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    });

    const $overlay = $('<div class="qp-overlay-quote"></div>').appendTo('body');
    const $stack   = $('<div class="qp-stack"></div>').appendTo($overlay);
    const $closeAll= $('<div class="qp-close-all" title="关闭所有引用浮窗">❌</div>').appendTo($overlay);

    $closeAll.on('click', () => {
      $stack.empty();
      $overlay.fadeOut(160);
    });

    // 点击引用框以外的任何地方都关闭
    $overlay.off('click.qp').on('click.qp', function(e){
      if (!$overlay.is(':visible')) return;

      const $top = $stack.children('.qp-quote').last();
      if (!$top.length) { $overlay.fadeOut(160); return; }

      // 1) 如果点击发生在最上层引用框内部，忽略
      if ($(e.target).closest($top).length) return;

      // 2) 如果正在/刚刚拖拽，避免误触关闭
      if ($top.hasClass('is-dragging') || $('.qp-quote.is-dragging').length) return;

      // 3) 点击最上层框之外：仅移除最上层
      $top.remove();
      if ($stack.children('.qp-quote').length === 0) $overlay.fadeOut(160);
    });

    $(document).on('keydown.qp', e => {
      if (e.key !== 'Escape' || !$overlay.is(':visible')) return;
      const $last = $stack.children('.qp-quote').last();
      if ($last.length) $last.remove();
      if ($stack.children().length === 0) $overlay.fadeOut(160);
    });

    function fetchData(tid) {
      if (cache[tid]) return Promise.resolve(cache[tid]);
      return $.get(`/Home/Forum/ref?id=${tid}`).then(html => (cache[tid] = html));
    }

    function stripIds($root) {
      $root.find('[id]').removeAttr('id');
      return $root;
    }

    function simplifyQuoteInfoIdLinks($root) {
      if (!$root || !$root.find) return;

      $root.find('a.h-threads-info-id[href]').each(function () {
        const a = this;
        const href = a.getAttribute('href') || '';
        if (!href) return;

        let url;
        try {
          url = new URL(href, location.origin);
        } catch (e) {
          return;
        }

        // 仅处理 /t/{tid}?r={...} 这类链接
        const m = url.pathname.match(/^\/t\/(\d{4,})$/);
        if (!m) return;

        const tid = m[1];
        const rid = url.searchParams.get('r');

        // 仅当 r 与 tid 完全一致时精简为 /t/{tid}
        if (rid && rid === tid) {
          a.setAttribute('href', `/t/${tid}`);
        }
      });
    }

    function showQuote(html, options = {}) {
      const depth = $stack.children('.qp-quote').length;

      const $quote = $('<div class="qp-quote"></div>').css({
        top: '0px',
        left: '0px',
        zIndex: 1000 + depth
      });

      const $header = $('<div class="qp-header"></div>');
      const $level  = $(`<span class="qp-level">第 ${depth + 1} 层</span>`);
      const $back   = $('<button class="qp-back">返回</button>').on('click', e => {
        e.stopPropagation();
        $quote.remove();
        if ($stack.children().length === 0) $overlay.fadeOut(160);
      });

      $header.append($level, $back);
      $quote.append($header);

      const $content = stripIds($('<div></div>').html(html));
      simplifyQuoteInfoIdLinks($content);
      $quote.append($content.contents());

      // 在 $quote 内添加四条边框拖拽手柄
      const $edges = $(
        '<div class="qp-drag-edge top"></div>' +
        '<div class="qp-drag-edge bottom"></div>' +
        '<div class="qp-drag-edge left"></div>' +
        '<div class="qp-drag-edge right"></div>'
      );
      $quote.append($edges);

      // 仅在标题栏 + 四边手柄上触发拖拽
      enableDragForTop($quote, $quote.find('.qp-header, .qp-drag-edge'));

      $stack.append($quote);
      $overlay.fadeIn(160);

      enableHDImageAndLayoutFix($quote[0]);
      if (typeof extendQuote === 'function') extendQuote($quote[0]);
      if (typeof initExtendedContent === 'function') initExtendedContent($quote[0]);
      runAutoUrlLinkify($quote[0]);
      runLinkBlank($quote[0]);
      enableHDImageAndLayoutFix();
      hideEmptyTitleAndEmail($quote[0]);
      initContent($quote[0]);
      try {
        const _cfg = Object.assign({}, SettingPanel.defaults, GM_getValue(SettingPanel.key, {}));
        if (_cfg.enableImageHideMode) applyImageHideMode(_cfg.applyImageHideMode || 'default', $quote[0]);
      } catch (e) {}

      if (options && options.fromPOImage) {
        setTimeout(() => {
          try {
            const imgAnchor = $quote[0].querySelector('.h-threads-img-box .h-threads-img-a');
            if (!imgAnchor) return;
            const imgBox = imgAnchor.closest('.h-threads-img-box');
            if (!imgBox || imgBox.classList.contains('h-active')) return;
            imgAnchor.click();
          } catch (e) {}
        }, 0);
      }
      //autoHideRefView();
    }

    window.__xdexOpenQuoteByTid = function(tid, options = {}) {
      if (!tid) return Promise.resolve(false);
      return fetchData(String(tid)).then(html => {
        showQuote(html, options || {});
        return true;
      }).catch(err => {
        console.warn('open quote by tid failed', tid, err);
        return false;
      });
    };

    function enableDragForTop($quote, $handles) {
      // 不要清除所有 qpdrag 事件，只清除当前 $quote 的
      $quote.off('.qpdrag');

      $quote.css({
        top: parseInt($quote.css('top')) || 0 + 'px',
        left: parseInt($quote.css('left')) || 0 + 'px',
        position: 'absolute' // 确保是绝对定位
      });

      //let dragging = false, dx = 0, dy = 0;
      let dx = 0, dy = 0;

      // 仅在"手柄"元素上启动拖拽：标题栏 + 四边窄条
      $handles.on('mousedown.qpdrag', function(e){
        // 避免点击标题栏中的交互控件（返回按钮等）触发拖拽
        if ($(e.target).closest('a,button,input,textarea,select,label').length) return;

        //dragging = true;
        $quote.data('dragging', true);  // ← 使用 data 存储

        $overlay.data('isDragging', true); // 标记正在拖拽
        $quote.addClass('is-dragging');

        // 获取当前的 top 和 left 值
        const currentTop = parseInt($quote.css('top')) || 0;
        const currentLeft = parseInt($quote.css('left')) || 0;
        const stackOff = $stack.offset();

        dx = e.pageX - currentLeft - stackOff.left;
        dy = e.pageY - currentTop - stackOff.top;
        e.preventDefault();
      });

      //$(document).on('mousemove.qpdrag', function(e){
      $(window).off('mousemove.qpdrag mouseup.qpdrag');
      $(window).on('mousemove.qpdrag', function(e){
        //if (!dragging) return;
        if (!$quote.data('dragging')) return;
        e.preventDefault();  // ← 在这里添加
        e.stopPropagation(); // ← 在这里添加
        const stackOff = $stack.offset();
        const stackWidth = $stack.width();
        const stackHeight = $stack.height();
        const quoteWidth = $quote.outerWidth();
        const quoteHeight = $quote.outerHeight();

        let top = e.pageY - dy - stackOff.top;
        let left = e.pageX - dx - stackOff.left;

        // 限制拖拽范围，允许向左和向上拖出一部分（至少保留 50px 可见）
        top = Math.max(-quoteHeight + 50, Math.min(stackHeight - 50, top));
        left = Math.max(-quoteWidth + 50, Math.min(stackWidth - 50, left));

        $quote.css({ top: top + 'px', left: left + 'px' });
      });

      //$(document).on('mouseup.qpdrag', function(e){
      $(window).on('mouseup.qpdrag', function(e){
        //if (!dragging) return;
        e.preventDefault();    // ← 添加（但注意这里没有 e 参数）
        //dragging = false;
        if (!$quote.data('dragging')) return;
        $quote.data('dragging', false);
        $quote.removeClass('is-dragging');

        // 延迟清除拖拽状态，避免释放瞬间的点击事件触发关闭
        setTimeout(() => {
          $overlay.data('isDragging', false);
        }, 100);

        // 不要解绑 document 的事件，因为可能有多个引用框
        // $(document).off('mousemove.qpdrag mouseup.qpdrag');
      });
    }

    $(document).off('click.qp').on('click.qp', 'font[color="#789922"]', function(e){

      $('#h-ref-view').hide().css('opacity', '');   // 点击时关闭原生引用框并重置透明度
      e.preventDefault();
      e.stopPropagation();
      const tid = (this.textContent.match(/\d+/) || [])[0];
      if (!tid) return;
      const now = Date.now();
      if (lastQuoteTid === tid && now - lastQuoteAt <= QUOTE_DOUBLE_CLICK_WINDOW) {
        return; // 同一引用号短时间内重复点击，忽略
      }

      lastQuoteTid = tid;
      lastQuoteAt = now;
      fetchData(tid).then(showQuote);

    });

    $(document).on('mouseleave', 'font[color="#789922"]', function () {
      $('#h-ref-view').hide();   // 鼠标移开时关闭原生引用框
    });
    // 全局监听多个事件，确保原生引用浮窗及时隐藏
    $(document).on('mousemove.refview scroll.refview wheel.refview', function(e) {
      const refView = document.getElementById('h-ref-view');
      if (!refView || refView.style.display === 'none') return;

      // scroll/wheel 事件可能没有有效坐标，直接隐藏更稳妥
      if (e.type === 'scroll' || e.type === 'wheel') {
        refView.style.display = 'none';
        refView.style.opacity = '';
        return;
      }

      const x = Number(e.clientX);
      const y = Number(e.clientY);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
      }
      if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
        return;
      }

      // 检查鼠标当前位置下的元素是否是引用号
      let elementsUnderMouse = [];
      try {
        elementsUnderMouse = document.elementsFromPoint(x, y) || [];
      } catch (_) {
        return;
      }
      const isOnQuote = elementsUnderMouse.some(el => {
        return el.tagName === 'FONT' && el.getAttribute('color') === '#789922';
      });

      // 如果不在引用号上，立即隐藏
      if (!isOnQuote) {
        refView.style.display = 'none';
        refView.style.opacity = '';  // 重置透明度
      }
    });
    enableQuotePreview.__initialized = true;
  }

  function monitorRefView(){
    const refView = document.getElementById('h-ref-view');
    if (!refView) return;
    if (refView.dataset.exMonitorBound === '1') return;
    refView.dataset.exMonitorBound = '1';
    let rafLock = 0;
    const observer = new MutationObserver(() => {
      if (refView.style.display !== 'block') return;
      if (rafLock) return;
      rafLock = requestAnimationFrame(() => {
        rafLock = 0;
        hideEmptyTitleAndEmail(refView);
      });
    });

    observer.observe(refView, {
      attributes: true,
      attributeFilter: ['style'],
      childList: true,
      subtree: true
    });
  }

  function ensureRefViewLayoutStyle() {
    if (document.getElementById('h-ref-view-layout-style')) return;
    const style = document.createElement('style');
    style.id = 'h-ref-view-layout-style';
    style.textContent = `
      #h-ref-view {
        box-sizing: border-box !important;
        max-width: calc(100vw - 2rem) !important;
        overflow: auto !important;
        overflow-wrap: break-word !important;
        word-break: break-word !important;
      }
      #h-ref-view:has(img) {
        min-width: min(52rem, calc(100vw - 2rem)) !important;
      }
      #h-ref-view:has(img) .h-threads-item-reply-main,
      #h-ref-view:has(img) .h-threads-content {
        min-width: 22rem !important;
      }
      #h-ref-view.xdex-ref-view-stack-image:has(img) {
        min-width: 0 !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
      }
      #h-ref-view.xdex-ref-view-stack-image:has(img) .h-threads-img-box {
        float: none !important;
        display: block !important;
        max-width: 100% !important;
      }
      #h-ref-view.xdex-ref-view-stack-image:has(img) .h-threads-img-a,
      #h-ref-view.xdex-ref-view-stack-image:has(img) img {
        max-width: 100% !important;
      }
      #h-ref-view.xdex-ref-view-stack-image:has(img) .h-threads-img {
        float: none !important;
        display: block !important;
        margin: 0 0 12px 0 !important;
      }
      #h-ref-view.xdex-ref-view-stack-image:has(img) .h-threads-item-reply-main,
      #h-ref-view.xdex-ref-view-stack-image:has(img) .h-threads-content {
        clear: both !important;
        display: block !important;
        min-width: 0 !important;
        width: auto !important;
      }
      #h-ref-view img {
        max-width: min(100%, 30rem) !important;
        max-height: 52vh !important;
        width: auto !important;
        height: auto !important;
        object-fit: contain !important;
      }
    `;
    document.head.appendChild(style);
  }

  function updateRefViewImageLayout(refView, anchorEl) {
    if (!refView || !anchorEl) return;
    refView.classList.remove('xdex-ref-view-stack-image');
    refView.style.width = '';

    const layoutImages = Array.from(refView.querySelectorAll('img')).filter(img => {
      if (img.closest('.xdex-hide-noimage')) return false;
      const box = img.closest('.h-threads-img-box');
      if (box && getComputedStyle(box).display === 'none') return false;
      return getComputedStyle(img).display !== 'none';
    });
    if (!layoutImages.length) return;

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const imageWidth = 30 * rootFontSize;
    const readableTextWidth = 22 * rootFontSize;
    const stackedReadableWidth = 38 * rootFontSize;
    const margin = 16;
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth || 0;
    const viewportLeft = window.pageXOffset || document.documentElement.scrollLeft || 0;
    const viewportRight = viewportLeft + viewportWidth - margin;
    const anchorLeft = $(anchorEl).offset().left;
    const fullInlineWidth = Math.min(imageWidth + readableTextWidth, Math.max(0, viewportWidth - margin * 2));
    const availableRight = viewportRight - anchorLeft;
    const shouldStack = availableRight < fullInlineWidth;
    const expectedWidth = shouldStack ? Math.min(Math.max(imageWidth, stackedReadableWidth), Math.max(0, viewportWidth - margin * 2)) : fullInlineWidth;
    const left = Math.max(viewportLeft + margin, Math.min(anchorLeft, viewportRight - expectedWidth));

    refView.classList.toggle('xdex-ref-view-stack-image', shouldStack);
    if (shouldStack) {
      layoutImages.forEach(img => {
        img.removeAttribute('align');
        img.removeAttribute('hspace');
      });
    }
    refView.style.left = left + 'px';
    refView.style.width = expectedWidth > 0 ? expectedWidth + 'px' : '';
  }

  function renderHiddenTextContent(root) {
    const $root = $(root || document);
    $root.find('.h-threads-content').add($root.filter('.h-threads-content')).each(function () {
      if (this.dataset.xdexPreviewSpoilerRendered === '1') return;
      const $content = $(this);
      let html = $content.html();
      const hideenRegExp = /\[h\]([\s\S]*?)\[\/h\]/g;
      if (hideenRegExp.test(html)) {
        html = html.replace(hideenRegExp, '<span class="h-hidden-text">$1</span>');
        $content.html(html);
      }
    });
  }

  // function autoHideRefView() {
  //     setInterval(() => {
  //         const refView = document.getElementById('h-ref-view');
  //         if (!refView || getComputedStyle(refView).display === 'none') return;

  //         // 获取当前引用框中的引用号 ID
  //         const infoId = refView.querySelector('.h-threads-info-id');
  //         if (!infoId) return;

  //         const tidMatch = infoId.textContent.match(/\d+/);
  //         if (!tidMatch) return;

  //         const tid = tidMatch[0];

  //         // 查找所有引用号元素
  //         const quoteFonts = document.querySelectorAll("font[color='#789922']");

  //         let isHovering = false;
  //         quoteFonts.forEach(font => {
  //             const text = font.textContent;
  //             if (text.includes(tid) && font.matches(':hover')) {
  //                 isHovering = true;
  //             }
  //         });

  //         // 如果没有任何引用号处于 hover 状态 → 隐藏引用框
  //         if (!isHovering) {
  //             refView.style.display = 'none';
  //         }
  //     }, 300); // 每 300ms 检查一次
  // }

  //引用格式拓展
  function extendQuote(root = document) {
    return startupPerfDebug.measure('extendQuote', () => {
    const ROOT_SELECTOR = '.h-threads-content, .h-post-form-input, .xdex-post-history-thread';
    const QUOTE_COLOR = '#789922';

    // 在容器内遍历纯文本节点，避免破坏现有标签
    const quoteRoots = root.matches?.(ROOT_SELECTOR)
      ? [root]
      : Array.from(root.querySelectorAll(ROOT_SELECTOR));
    quoteRoots.forEach(root => {
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    // 没数字直接跳过
                    if (!node.nodeValue || !/\d/.test(node.nodeValue)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // 已经在 quote 的 <font color="#789922"> 内，跳过
                    const p = node.parentElement;
                    if (p && p.tagName.toLowerCase() === 'font' && (p.getAttribute('color') || '').toLowerCase() === QUOTE_COLOR) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodes = [];
        let n;
        while ((n = walker.nextNode())) textNodes.push(n);

        textNodes.forEach(processTextNode);
    });

    function processTextNode(textNode) {
        const text = textNode.nodeValue;
        // 两类模式：No.12345678 与 单独 8 位数字
        const patterns = [
          { name: 'no',  regex: /(?:>>)?No\.(\d{8})\b/g },      // 匹配 No.12345678 或 >>No.12345678
          { name: 'num', regex: /(?:>>)?(?<!\d)(\d{8})(?!\d)/g } // 匹配 12345678 或 >>12345678
        ];

        const frag = document.createDocumentFragment();
        let cursor = 0;
        let changed = false;

        while (true) {
            const next = findNextMatch(text, cursor, patterns);
            if (!next) break;

            const { start, end } = next;

            // 若匹配前紧挨着 ">>"，说明是标准引用的一部分，跳过这次，继续后移
            // if (start >= 2 && text[start - 2] === '>' && text[start - 1] === '>') {
            //     // 只推进一位，继续找后面的匹配，避免卡住
            //     cursor = start + 1;
            //     continue;
            // }

            // 追加匹配前的原始文本
            if (start > cursor) {
                frag.appendChild(document.createTextNode(text.slice(cursor, start)));
            }

            // 用与标准引用一致的 <font color="#789922"> 包裹，但不添加 ">>"
            const font = document.createElement('font');
            font.setAttribute('color', QUOTE_COLOR);
            // 直接保留原始匹配文本（可能是 "No.12345678" 或 "12345678"）
            font.textContent = text.slice(start, end);
            frag.appendChild(font);

            cursor = end;
            changed = true;
        }

        if (!changed) return;

        // 末尾剩余文本
        if (cursor < text.length) {
            frag.appendChild(document.createTextNode(text.slice(cursor)));
        }

        textNode.replaceWith(frag);
    }

    // 在多正则间找到下一处最早的匹配
    function findNextMatch(text, fromIndex, patterns) {
        let best = null;
        for (const p of patterns) {
            p.regex.lastIndex = fromIndex;
            const m = p.regex.exec(text);
            if (m) {
                const start = m.index;
                const end = start + m[0].length;
                if (!best || start < best.start) {
                    best = { start, end };
                }
            }
        }
        return best;
    }
    }, () => startupPerfDebug.summarizeRoot(root));
  }

  function initExtendedContent(root) {
    return startupPerfDebug.measure('initExtendedContent', () => {
    const $root = $(root || document);
    ensureRefViewLayoutStyle();
    try { injectSubscriptionExButton(root || document); } catch (e) {}

    // —— 在捕获阶段接管原生引用浮窗，避免原站先显示未处理内容 ——
    $root.find("font[color='#789922']").add($root.filter("font[color='#789922']"))
      .filter(function () {
        return /(No\.\d{8}|\d{8})/.test($(this).text());
      })
      .off('mouseenter.ext')
      .each(function () {
        const quoteEl = this;
        if (quoteEl.__xdexRefHoverHandler) {
          quoteEl.removeEventListener('mouseover', quoteEl.__xdexRefHoverHandler, true);
          quoteEl.removeEventListener('mouseenter', quoteEl.__xdexRefHoverHandler, true);
        }

        quoteEl.__xdexRefHoverHandler = function (event) {
          if (event.type === 'mouseover' && event.relatedTarget && quoteEl.contains(event.relatedTarget)) return;
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          const match = /\d+/.exec($(quoteEl).text());
          if (!match) return;
          const tid = match[0];
          const seq = (window.__xdexRefViewRequestSeq || 0) + 1;
          window.__xdexRefViewRequestSeq = seq;
          const $rv = $("#h-ref-view").off().stop(true, true).hide().css('visibility', 'hidden');

          $.get('/Home/Forum/ref?id=' + tid)
            .done(function (data) {
              if (seq !== window.__xdexRefViewRequestSeq) return;
              if (data.indexOf('<!DOCTYPE html><html><head>') >= 0) return;

              $rv.html(data).css({
                top: $(quoteEl).offset().top,
                left: $(quoteEl).offset().left
              });

              try {
                const refEl = $rv[0];
                hideEmptyTitleAndEmail(refEl);
                renderHiddenTextContent(refEl);
                if (typeof extendQuote === 'function') extendQuote(refEl);
                if (typeof initExtendedContent === 'function') initExtendedContent(refEl);
                const _cfg = Object.assign({}, SettingPanel.defaults, GM_getValue(SettingPanel.key, {}));
                if (_cfg.enableImageHideMode) applyImageHideMode(_cfg.applyImageHideMode || 'default', refEl);
                if (_cfg.enableAutoUrlLinkify) runAutoUrlLinkify(refEl);
                updateRefViewImageLayout(refEl, quoteEl);
              } catch (e) {}
              $rv.css('visibility', '').show();
            });
        };

        quoteEl.addEventListener('mouseover', quoteEl.__xdexRefHoverHandler, true);
        quoteEl.addEventListener('mouseenter', quoteEl.__xdexRefHoverHandler, true);
      });

    // —— 新增：处理 [h]...[/h] 隐藏文本 ——
    renderHiddenTextContent(root);
    }, () => startupPerfDebug.summarizeRoot(root || document));
  }

  /* --------------------------------------------------
   * tag 10. 创建拓展坞+reply按钮呼出回复悬浮窗
   * -------------------------------------------------- */
  function replaceRightSidebar() {
    const logRightSidebar = (stage, detail) => {
      console.log('[replaceRightSidebar]', stage, detail || {});
    };

    logRightSidebar('start', {
      原始工具栏数: $('#h-tool').length,
      既有拓展坞数: $('.hld__docker').length,
      既有样式: !!document.getElementById('qp-style'),
      readyState: document.readyState,
      href: location.href,
    });

    // 移除原始工具栏
    $('#h-tool').remove();
    logRightSidebar('original-toolbar-removed', {
      remainingToolbarCount: $('#h-tool').length,
    });

      const isDarkReaderActive = () => {
        const root = document.documentElement;
        if (!root) return false;
        const mode = root.getAttribute('data-darkreader-mode');
        const scheme = root.getAttribute('data-darkreader-scheme');
        return !!(mode && mode !== 'off') || !!(scheme && scheme !== 'off');
      };

      const syncQuotePopupTheme = () => {
        const root = document.documentElement;
        if (!root) return;
        root.classList.toggle('xdex-darkreader-active', isDarkReaderActive());

        const previewBg = isDarkReaderActive() ? '#483327' : '#F0E0D6';
        document.querySelectorAll('.qp-body .qp-content-wrap .h-preview-box, .qp-body .qp-content-wrap .h-preview-box .h-threads-item, .qp-body .qp-content-wrap .h-preview-box .h-threads-item-replies, .qp-body .qp-content-wrap .h-preview-box .h-threads-item-reply, .qp-body .qp-content-wrap .h-preview-box .h-threads-item-reply-main').forEach((el) => {
          el.style.setProperty('background', previewBg, 'important');
        });
      };
      window.__xdexSyncDarkReaderTheme = syncQuotePopupTheme;

    // 样式（只注入一次）
    if (!document.getElementById('qp-style')) {
        const style = document.createElement('style');
        style.id = 'qp-style';
        style.textContent = `
          :root {
            --xdex-qp-shell-bg: #FFFFEE;
            --xdex-qp-form-bg: #FFFFEE;
            --xdex-qp-preview-bg: #F0E0D6;
            --xdex-qp-textarea-bg: #fff;
            --xdex-qp-border: #ccc;
            --xdex-qp-outline: #fff;
            --xdex-qp-shadow: rgba(0,0,0,.24);
            --xdex-qp-reset-bg: rgba(0,0,0,.6);
            --xdex-qp-reset-color: #fff;
          }

          :root.xdex-darkreader-active {
            --xdex-qp-shell-bg: #2b2c2d;
            --xdex-qp-form-bg: #2b2c2d;
            --xdex-qp-preview-bg: #483327;
            --xdex-qp-textarea-bg: #1f2021;
            --xdex-qp-border: #4b4d50;
            --xdex-qp-outline: #3a3c3f;
            --xdex-qp-shadow: rgba(0,0,0,.55);
            --xdex-qp-reset-bg: rgba(19,20,21,.88);
            --xdex-qp-reset-color: #e8e6e3;
          }

          .qp-overlay {
            position: fixed; inset: 0; z-index: 9000;
            background: rgba(0,0,0,.45); display: none;
          }
          .qp-stack {
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: min(90vw, 820px);   /* 初始宽度为视口的90%，最大820px */
            min-width: 0;              /* 不设固定值，由 JS 动态控制 */
            max-width: none;           /* 允许用户手动扩展 */
            height: 80vh;
            overflow: visible; box-sizing: border-box;
          }
          .qp-quote {
            position: absolute;
            top: 0; left: 0;
            width: 100%;
            max-height: 100%;
          overflow-x: hidden;  /* 隐藏横向滚动条 */
          overflow-y: auto;    /* 保留竖向滚动条 */
            background: var(--xdex-qp-shell-bg);
            border: 1px solid var(--xdex-qp-border);
            outline: 2px solid var(--xdex-qp-outline);
            border-radius: 8px;
            box-shadow: 0 8px 24px var(--xdex-qp-shadow);
            padding: 18px 20px 20px;
            box-sizing: border-box;
          }
          .qp-quote textarea[name="content"] {
            resize: both;           /* 允许双向调节 */
            min-width: 90%;        /* 最小宽度为容器宽度 */
            max-width: none;       /* 通过 JS 动态控制，这里不限制 */
            box-sizing: border-box;
          }

          /* 仅在浮窗中允许拖动改变宽度 */
          .qp-body .h-post-form-textarea {
              resize: horizontal;   /* 允许左右拉伸 */
              min-width: px;     /* 原始宽度为最小值，避免变太窄 */
              max-width: 100%;      /* 防止超过容器太多 */
              box-sizing: border-box;
          }

          /* 拖拽手柄：四边窄条，仅在手柄区域显示"移动"指针 */
          .qp-drag-edge {
            position: absolute;
            pointer-events: auto;
            z-index: 3;
            cursor: move;
          }
          .qp-drag-edge.top    { top: 0;    left: 0;    right: 0;  height: 8px; }
          .qp-drag-edge.bottom { bottom: 0; left: 0;    right: 0;  height: 8px; } 
          .qp-drag-edge.left   { top: 0;    bottom: 0;  left: 0;   width: 8px; }
          .qp-drag-edge.right  { top: 0;    bottom: 0;  right: 0;  width: 8px; } 

          .qp-quote.is-dragging { cursor: grabbing !important; }

          /* 归位按钮 */
          .qp-reset-btn {
            position: fixed; right: 12px; bottom: 12px;
            font-size: 20px; line-height: 1;
            color: var(--xdex-qp-reset-color); background: var(--xdex-qp-reset-bg);
            padding: 6px 12px; border-radius: 6px; cursor: pointer;
            z-index: 9001; /* 比 overlay 高 */
            user-select: none;
            display: none;
          }

          .qp-body .qp-content-wrap {
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: none;       /* 改为 none，不限制最大宽度 */
            margin: 0 auto;
            background: var(--xdex-qp-form-bg);
          }

          .qp-body .qp-content-wrap form {
            max-width: 100%;
            box-sizing: border-box;
            background: var(--xdex-qp-form-bg);
          }

          /* textarea 可以双向调整 */
          .qp-body .qp-content-wrap textarea[name="content"] {
            resize: both;
            min-width: 600px;   /* 给个合理的最小值 */
            min-height: 100px;   /* 给个合理的最小值 */
            width: auto;        /* 不要强制 100% */
            max-width: none;    /* 允许无限扩展 */
            box-sizing: border-box;
            background: var(--xdex-qp-textarea-bg);
          }

          .qp-body .qp-content-wrap .h-preview-box {
            width: 100% !important;   /* 始终和容器一致 */
            overflow-wrap: break-word; /* 长单词/长链接换行 */
            word-break: break-word;    /* 兼容性处理 */
            white-space: normal;       /* 允许正常换行 */
          }

          /* 浮窗内预览框及其子层级全部占满宽度 */
          .qp-body .qp-content-wrap .h-preview-box,
          .qp-body .qp-content-wrap .h-preview-box .h-threads-item,
          .qp-body .qp-content-wrap .h-preview-box .h-threads-item-replies,
          .qp-body .qp-content-wrap .h-preview-box .h-threads-item-reply,
          .qp-body .qp-content-wrap .h-preview-box .h-threads-item-reply-main {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              box-sizing: border-box;
              display: block;
              background: var(--xdex-qp-preview-bg);
          }

          /* 浮窗内：仅在非 h-active 状态下限制缩略图宽度 */
          .qp-body .qp-content-wrap .h-preview-box .h-threads-img-box:not(.h-active) .h-threads-img {
            max-width: 33% !important;
            height: auto !important;
          }

          /* 表单内：仅在非 h-active 状态下限制缩略图宽度 */
          #h-post-form .h-preview-box .h-threads-img-box:not(.h-active) .h-threads-img {
            max-width: 50% !important;
            height: auto !important;
          }

          .hld__docker { position: fixed; height: 80px; width: 30px; bottom: 180px; right: 0; transition: all ease .2s; z-index: 9998; }
          .hld__docker:hover,
          .hld__docker.is-hover { width: 150px; height: 300px; bottom: 75px; }
          .hld__docker:has(.hld__docker-sidebar:hover) { width: 150px; height: 300px; bottom: 75px; }
          .hld__docker-sidebar { background: #fff; position: fixed; height: 50px; width: 20px; bottom: 195px; right: 0; display: flex; justify-content: center; align-items: center; border: 1px solid #CCC; box-shadow: 0 0 1px #333; border-right: none; border-radius: 5px 0 0 5px; }
          .hld__docker-btns { position: absolute; top: 0; left: 50px; bottom: 0; right: 50px; display: flex; justify-content: center; align-items: center; flex-direction: column; }
          .hld__docker .hld__docker-btns>div { opacity: 0; flex-shrink: 0; }
          .hld__docker:hover .hld__docker-btns>div,
          .hld__docker.is-hover .hld__docker-btns>div { opacity: 1; }
          .hld__docker:has(.hld__docker-sidebar:hover) .hld__docker-btns>div { opacity: 1; }
          .hld__docker-btns>div { background: #fff; border: 1px solid #CCC; box-shadow: 0 0 1px #444; width: 50px; height: 50px; border-radius: 50%; margin: 10px 0; cursor: pointer; display: flex; justify-content: center; align-items: center; font-size: 20px; font-weight: bold; color: #333; transition: background .2s, transform .2s; }
          .hld__docker-btns>div:hover { background: #f0f0f0; transform: scale(1.1); }
        `;
        document.head.appendChild(style);
        logRightSidebar('style-injected', { 样式ID: style.id });
    } else {
        logRightSidebar('style-reused', { 样式ID: 'qp-style' });
    }

    syncQuotePopupTheme();
    if (!replaceRightSidebar.__darkReaderObserver) {
      const observer = new MutationObserver(() => syncQuotePopupTheme());
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-darkreader-mode', 'data-darkreader-scheme', 'style', 'class'],
        childList: true,
        subtree: true,
      });
      replaceRightSidebar.__darkReaderObserver = observer;
    }

    // 扩展坞 DOM
    const dockerDom = $(`
        <div class="hld__docker">
            <div class="hld__docker-sidebar">
                <svg viewBox="0 0 1024 1024" width="64" height="64">
                    <path d="M518.3 824.05c-7.88 0-15.76-2.97-21.69-9L215.25 533.65c-5.73-5.73-9-13.61-9-21.69s3.27-15.96 9-21.69l281.4-281.4c11.97-11.97 31.41-11.97 43.39 0s11.97 31.41 0 43.39L280.33 511.95l259.71 259.71c11.97 11.97 11.97 31.41 0 43.39-5.94 6.04-13.72 9-21.69 9z" fill="#888"/>
                    <path d="M787.16 772.89c-7.88 0-15.76-2.97-21.69-9L535.23 533.65c-11.97-11.97-11.97-31.41 0-43.39l230.24-230.24c11.97-11.97 31.41-11.97 43.39 0s11.97 31.41 0 43.39L600.31 511.95l208.55 208.55c11.97 11.97 11.97 31.41 0 43.39-5.94 6.04-13.72 9-21.69 9z" fill="#888"/>
                </svg>
            </div>
            <div class="hld__docker-btns">
                <div data-type="TOP">↑</div>
                <div data-type="REPLY">↩</div>
                <div data-type="BOTTOM">↓</div>
            </div>
        </div>
    `);
    $('body').append(dockerDom);
    logRightSidebar('docker-appended', {
      拓展坞数: $('.hld__docker').length,
      按钮数: dockerDom.find('.hld__docker-btns>div').length,
      支持Has选择器: !!(window.CSS && CSS.supports && CSS.supports('selector(:has(*))')),
    });

    dockerDom
      .on('mouseenter', () => {
        dockerDom.addClass('is-hover');
      })
      .on('mouseleave', () => {
        dockerDom.removeClass('is-hover');
      });
    logRightSidebar('hover-bound', {
      targetClass: 'hld__docker',
      fallbackClass: 'is-hover',
    });

    // 顶部按钮
    dockerDom.find('[data-type="TOP"]').on('click', () => {
        $('html, body').animate({ scrollTop: 0 }, 500);
    });

    // 悬浮窗引用
    let overlay;

    function ensureOverlay() {
      if (!overlay) {
          overlay = document.createElement('div');
          overlay.className = 'qp-overlay';
          overlay.innerHTML = `
              <div class="qp-stack">
                  <div class="qp-quote">
                      <div class="qp-drag-edge top"></div>
                      <div class="qp-drag-edge bottom"></div>
                      <div class="qp-drag-edge left"></div>
                      <div class="qp-drag-edge right"></div>
                      <div class="qp-body"></div>
                  </div>
              </div>
              <div class="qp-reset-btn">🗘</div>
          `;
          document.body.appendChild(overlay);

          // 点击遮罩关闭（点内容不关闭，且允许事件冒泡到 document 以触发引用弹窗）
          overlay.addEventListener('click', function (e) {
            if (e.target.closest('.qp-quote')) {
                return; // 点击在内容区：不关闭，也不阻止冒泡
            }
            // 如果正在调整 textarea 大小，不关闭浮窗
            if (overlay.__isResizing) {
                return;
            }
            closeOverlay();
          });

          // ESC 关闭（优先关闭颜文字选择框）
          document.addEventListener('keydown', e => {
            if (e.key !== 'Escape') return;

            // 检查是否存在打开的颜文字面板
            const openKaomojiPanel = document.querySelector('.kaomoji-panel[style*="display: grid"]');
            if (openKaomojiPanel) {
                // 触发颜文字函数内的关闭逻辑（模拟点击空白或ESC）
                openKaomojiPanel.style.display = 'none';
                // 若有全局绑定的 hidePanel 函数（例如触发按钮附近定义的），触发它
                const hideEvent = new CustomEvent('kaomoji:hide');
                document.dispatchEvent(hideEvent);
                //openKaomojiPanel.style.display = 'none';

                // ★ 新增：关闭颜文字面板后聚焦到浮窗内的 textarea
                const ta = overlay?.querySelector('textarea[name="content"]');
                if (ta) {
                  ta.focus();
                }

                return; // 阻止继续关闭浮窗

            }

            // 若没有颜文字面板打开，则关闭回复浮窗
            closeOverlay();
          });

          // 归位按钮事件
          const resetBtn = overlay.querySelector('.qp-reset-btn');
          resetBtn.addEventListener('click', (e) => {
              e.stopPropagation(); // 阻止事件冒泡，避免触发 overlay 的关闭逻辑
              const quote = overlay.querySelector('.qp-quote');
              quote.style.top = '0px';
              quote.style.left = '0px';
          });
      }
      return overlay;
   }

    function closeOverlay() {
      if (!overlay) return;

      // 清理 ResizeObserver
      // if (overlay.__resizeObserver) {
      //   overlay.__resizeObserver.disconnect();
      //   overlay.__resizeObserver = null;
      // }

      // 清理 stack 的 ResizeObserver
      if (overlay.__stackObserver) {
        overlay.__stackObserver.disconnect();
        overlay.__stackObserver = null;
      }
      // 保存当前浮窗和textarea的尺寸（保存计算后的实际值）
      const stack = overlay.querySelector('.qp-stack');
      const ta = overlay.querySelector('textarea[name="content"]');
      if (stack && ta) {
        const taRect = ta.getBoundingClientRect();
        overlay.__savedStackWidth = stack.style.width;
        overlay.__savedTextareaWidth = taRect.width + 'px'; // 保存实际宽度
        overlay.__savedTextareaHeight = taRect.height + 'px'; // 保存实际高度

        // 在移回原位置之前，先应用尺寸到 textarea
        ta.style.width = taRect.width + 'px';
        ta.style.height = taRect.height + 'px';
      }

      overlay.style.display = 'none';

      // 隐藏归位按钮
      const resetBtn = overlay.querySelector('.qp-reset-btn');
      if (resetBtn) resetBtn.style.display = 'none';

      // 清理窗口 resize 监听
      if (overlay.__windowResizeHandler) {
        window.removeEventListener('resize', overlay.__windowResizeHandler);
        overlay.__windowResizeHandler = null;
      }
      if (overlay.__formEl && overlay.__formEl.__placeholder) {
        overlay.__formEl.__placeholder.parentNode.insertBefore(overlay.__formEl, overlay.__formEl.__placeholder);

        // 移回后清除 textarea 的宽度样式，让它恢复原始状态
        const taInForm = overlay.__formEl.querySelector('textarea[name="content"]');
        if (taInForm) {
          taInForm.style.removeProperty('width');
          taInForm.style.removeProperty('height');
          taInForm.style.removeProperty('min-width');
          taInForm.style.removeProperty('max-width');
        }

          if (overlay.__formEl.__wasCollapsed) {
            const $form = $(overlay.__formEl);
            const hint = overlay.__formEl.action.includes('doReplyThread') ? '『回复』' : '『发串』';
            // 如果原位置已经有占位符，就直接隐藏并标记折叠
            if ($form.prev('.xdex-placeholder').length) {
                $form.hide().data('xdex-collapsed', true);
            } else if (typeof Utils !== 'undefined' && typeof Utils.collapse === 'function') {
                Utils.collapse($form, hint);
            }
            overlay.__formEl.__wasCollapsed = false;
        }
      }
      if (overlay.__previewEl && overlay.__previewEl.__placeholder) {
        overlay.__previewEl.__placeholder.parentNode.insertBefore(overlay.__previewEl, overlay.__previewEl.__placeholder);
      }
    }

    // 新增：回复浮窗拖拽函数
    function enableDragForReply($quote, $handles) {
      // 确保初始位置居中
      $quote.css({
          top: '0px',
          left: '0px',
          position: 'absolute' // 确保是相对于 stack 定位
      });

      //let dragging = false, dx = 0, dy = 0;
      let dx = 0, dy = 0;

      // 移除旧的事件监听（避免重复绑定）
      $handles.off('mousedown.qpdrag-reply');
      $(window).off('mousemove.qpdrag-reply mouseup.qpdrag-reply');

      $handles.on('mousedown.qpdrag-reply', function(e){
          //dragging = true;
          $quote.data('dragging', true);  // ← 使用 data 存储
          $quote.addClass('is-dragging');

          // 获取当前的 top 和 left 值
          const currentTop = parseInt($quote.css('top')) || 0;
          const currentLeft = parseInt($quote.css('left')) || 0;

          dx = e.pageX - currentLeft - $quote.parent().offset().left;
          dy = e.pageY - currentTop - $quote.parent().offset().top;
          e.preventDefault();
      });

      $(window).on('mousemove.qpdrag-reply', function(e){
          //if (!dragging) return;
          if (!$quote.data('dragging')) return;  // ← 从 data 读取
          e.preventDefault();  // ← 在这里添加
          e.stopPropagation(); // ← 在这里添加
          const $stack = $quote.parent();
          const stackOff = $stack.offset();
          const stackWidth = $stack.width();
          const stackHeight = $stack.height();
          const quoteWidth = $quote.outerWidth();
          const quoteHeight = $quote.outerHeight();

          let top = e.pageY - dy - stackOff.top;
          let left = e.pageX - dx - stackOff.left;

          // 限制拖拽范围，允许向左和向上拖出一部分
          top = Math.max(-quoteHeight + 50, Math.min(stackHeight - 50, top));
          left = Math.max(-quoteWidth + 50, Math.min(stackWidth - 50, left));

          $quote.css({ top: top + 'px', left: left + 'px' });
      });

      $(window).on('mouseup.qpdrag-reply', function(e){
          //if (!dragging) return;
          if (!$quote.data('dragging')) return;  // ← 从 data 读取
          e.preventDefault();    // ← 添加（但注意这里没有 e 参数）
          //dragging = false;
          $quote.data('dragging', false);  // ← 使用 data 存储
          $quote.removeClass('is-dragging');
      });
    }

    // REPLY 按钮
    dockerDom.find('[data-type="REPLY"]').on('click', () => {
      let formEl = document.querySelector('form[action="/Home/Forum/doReplyThread.html"]');
      let previewEl = document.querySelector('.h-preview-box');

      // 如果串内没找到表单，尝试板块页发串表单
      if (!formEl) {
          const postForm = document.querySelector('#h-post-form form[action="/Home/Forum/doPostThread.html"]');
          if (postForm) {
              formEl = postForm;
              previewEl = document.querySelector('#h-post-form .h-preview-box');
          }
      }

      if (!formEl) {
          toast && toast('未找到回复/发串表单');
          return;
      }

      const ov = ensureOverlay();
      const body = ov.querySelector('.qp-body');
      body.innerHTML = '';

      // 占位符
      if (!formEl.__placeholder) {
          const ph1 = document.createElement('div');
          ph1.style.display = 'none';
          formEl.parentNode.insertBefore(ph1, formEl);
          formEl.__placeholder = ph1;
      }
      if (previewEl && !previewEl.__placeholder) {
          const ph2 = document.createElement('div');
          ph2.style.display = 'none';
          previewEl.parentNode.insertBefore(ph2, previewEl);
          previewEl.__placeholder = ph2;
      }

      // 如果表单是折叠状态，展开它（不影响原位置的占位符）
      if ($(formEl).data('xdex-collapsed')) {
          formEl.__wasCollapsed = true; // ★ 记录原本是折叠的
          $(formEl).show().removeData('xdex-collapsed');
      }
      // === 新增：给表单打标记，避免被板块页展开逻辑误处理 ===
      formEl.classList.add('qp-reply-form');

      // 包装容器，防止 UI 松散
      const wrap = document.createElement('div');
      wrap.className = 'qp-content-wrap';

      // 表单是必需的
      wrap.appendChild(formEl);

      // 预览框是可选的
      if (previewEl) {
        wrap.appendChild(previewEl);
        // 浮窗内：强制预览框及其 replies 拉满宽度，清理站点样式的限宽/居中
        if (previewEl) {
          // 预览框本身满宽
          previewEl.style.width = '100%';
          previewEl.style.maxWidth = 'none';
          previewEl.style.margin = '0';

          // replies 拉满
          const replies = previewEl.querySelectorAll('.h-threads-item-replies');
          replies.forEach(el => {
            el.style.width = '100%';
            el.style.maxWidth = 'none';
            el.style.margin = '0';
            el.style.display = 'block';
            el.style.boxSizing = 'border-box';
          });

          // 如有外层 item/容器被限宽，一并放开
          const items = previewEl.querySelectorAll('.h-threads-item');
          items.forEach(el => {
            el.style.width = '100%';
            el.style.maxWidth = 'none';
            el.style.margin = '0';
            el.style.boxSizing = 'border-box';
          });
        }
      }

      body.appendChild(wrap);
      // 浮窗内立即处理扩展引用，保证可点击引用弹窗
      if (typeof extendQuote === 'function') {
        extendQuote(previewEl || wrap);
      }
      if (typeof initContent === 'function') {
        try { initContent(root); } catch (e) {}
      }

      // if (typeof autoHideRefView === 'function') {
      //   try { autoHideRefView(root); } catch (e) { try { autoHideRefView(); } catch (e) {} }
      // }

      // 保存引用
      ov.__formEl = formEl;
      ov.__previewEl = previewEl;

      // 显示 overlay
      ov.style.display = 'block';

      // 初始化时检查是否需要调整浮窗宽度（确保不超出当前浏览器宽度）
      const currentResponsiveWidth = Math.max(400, Math.min(window.innerWidth * 0.9, 820));
      const stackElement = ov.querySelector('.qp-stack');
      const currentWidth = stackElement.getBoundingClientRect().width;
      if (currentWidth > currentResponsiveWidth) {
        stackElement.style.width = currentResponsiveWidth + 'px';
      }

      // // 恢复之前保存的尺寸（需要在 ResizeObserver 创建之前恢复）
      // const stackForRestore = ov.querySelector('.qp-stack');
      // const restoredTa = ov.querySelector('textarea[name="content"]');

      // // 先恢复 textarea 的尺寸
      // if (ov.__savedTextareaWidth && restoredTa) {
      //   restoredTa.style.width = ov.__savedTextareaWidth;
      //   restoredTa.style.minWidth = ov.__savedTextareaWidth; // 确保不会被缩小
      // }
      // if (ov.__savedTextareaHeight && restoredTa) {
      //   restoredTa.style.height = ov.__savedTextareaHeight;
      // }

      // // 再恢复 stack 的宽度
      // if (ov.__savedStackWidth && stackForRestore) {
      //   stackForRestore.style.width = ov.__savedStackWidth;
      // }
      // 显示归位按钮
      const resetBtn = ov.querySelector('.qp-reset-btn');
      if (resetBtn) resetBtn.style.display = 'block';

      // 启用拖拽功能
      const $quote = $(ov.querySelector('.qp-quote'));
      const $handles = $quote.find('.qp-drag-edge');
      enableDragForReply($quote, $handles);

      const ta = ov.querySelector('textarea[name="content"]');
      // ---------- BEGIN 插入（替换旧的 ResizeObserver 逻辑） ----------
      if (ta) {
        // 先恢复之前保存的尺寸，再设置其他属性
        if (ov.__savedTextareaWidth) {
          ta.style.width = ov.__savedTextareaWidth;
        }
        if (ov.__savedTextareaHeight) {
          ta.style.height = ov.__savedTextareaHeight;
        }

        ta.style.resize = 'both';
        ta.style.fontSize = '14px';
        // 不设置 maxWidth，让它自由调整
      }
      // 监听 textarea 调整大小的开始和结束
      if (ta) {
        ta.addEventListener('mousedown', function(e) {
          // 检测是否点击在右下角调整区域（通常是最后 15px 范围）
          const rect = ta.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;
          const isResizeCorner = (offsetX > rect.width - 15) && (offsetY > rect.height - 15);
          const isResizeRight = offsetX > rect.width - 15;
          const isResizeBottom = offsetY > rect.height - 15;

          if (isResizeCorner || isResizeRight || isResizeBottom) {
            ov.__isResizing = true;

            // 监听鼠标释放，标记调整结束
            const onMouseUp = function() {
              // 延迟一点清除标记，避免释放瞬间的点击事件触发关闭
              setTimeout(() => {
                ov.__isResizing = false;
              }, 100);
              document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mouseup', onMouseUp);
          }
        });
      }
      const stack = ov.querySelector('.qp-stack');
      const quote = ov.querySelector('.qp-quote');

      // 绝对最小宽度（不能再小）
      const ABSOLUTE_MIN_WIDTH = 400;

      // 动态计算当前应有的宽度（视口90%，但不小于400px，不大于820px）
      function getResponsiveWidth() {
        return Math.max(ABSOLUTE_MIN_WIDTH, Math.min(window.innerWidth * 0.9, 820));
      }

      // 初始化时记录用户可能扩展到的最大宽度
      // 如果有保存的宽度，使用保存的；否则使用响应式宽度
      let userMaxWidth = ov.__savedStackWidth ? parseFloat(ov.__savedStackWidth) : getResponsiveWidth();

      // 定义安全边距（textarea 与浮窗边框之间的最小距离）
      const SAFE_MARGIN = 30;

      const ro = new ResizeObserver(entries => {
        for (const entry of entries) {
          const taRect = ta.getBoundingClientRect();
          const taWidth = Math.round(taRect.width);
          const stackRect = stack.getBoundingClientRect();

          // 获取 quote 的 padding
          const quoteStyle = window.getComputedStyle(quote);
          const quotePaddingLeft = parseFloat(quoteStyle.paddingLeft);
          const quotePaddingRight = parseFloat(quoteStyle.paddingRight);

          // 计算 textarea 左边距（相对于 quote）
          const quoteRect = quote.getBoundingClientRect();
          const taLeftOffset = taRect.left - quoteRect.left - quotePaddingLeft;

          // 计算 textarea 右边界（相对于 quote 左边界）
          const taRightEdge = taLeftOffset + taWidth;

          // 计算 quote 的内部可用宽度
          const quoteInnerWidth = quoteRect.width - quotePaddingLeft - quotePaddingRight;

          // 获取视口宽度和当前响应式宽度
          const maxAllowedWidth = window.innerWidth;
          const responsiveWidth = getResponsiveWidth();

          // 如果 textarea 右边界超过了安全区域，需要扩展 stack
          const safeRightBound = quoteInnerWidth - SAFE_MARGIN - 20;

          if (taRightEdge > safeRightBound) {
            // 计算需要的新 stack 宽度
            const neededQuoteWidth = taLeftOffset + taWidth + SAFE_MARGIN + 20 + quotePaddingLeft + quotePaddingRight;

            // 限制不超过视口宽度
            const finalWidth = Math.min(neededQuoteWidth, maxAllowedWidth);
            stack.style.width = finalWidth + 'px';
            quote.style.width = '100%';

            // 更新用户扩展到的最大宽度
            userMaxWidth = Math.max(finalWidth, userMaxWidth);

            // 如果达到最大宽度，限制 textarea 不能继续变宽
            if (finalWidth >= maxAllowedWidth) {
              const maxTaWidth = maxAllowedWidth - taLeftOffset - SAFE_MARGIN - 20 - quotePaddingLeft - quotePaddingRight;
              ta.style.maxWidth = Math.max(maxTaWidth, 200) + 'px';
            } else {
              ta.style.maxWidth = 'none';
            }
          }
          // 如果 textarea 缩小了，也缩小 stack
          else {
            // 计算当前实际需要的宽度
            const neededQuoteWidth = taLeftOffset + taWidth + SAFE_MARGIN + 20 + quotePaddingLeft + quotePaddingRight;
            const currentStackWidth = stackRect.width;

            // 只有当需要的宽度明显小于当前宽度时才缩小
            if (neededQuoteWidth < currentStackWidth - 10) {
              // 使用响应式宽度作为下限
              const finalWidth = Math.max(neededQuoteWidth, responsiveWidth);
              stack.style.width = finalWidth + 'px';
              quote.style.width = '100%';

              // 同步调整 textarea 宽度，使其适应浮窗
              if (finalWidth <= responsiveWidth) {
                const maxTaWidth = finalWidth - taLeftOffset - SAFE_MARGIN - 20 - quotePaddingLeft - quotePaddingRight;
                if (taWidth > maxTaWidth) {
                  ta.style.width = Math.max(maxTaWidth, 200) + 'px';
                }
              }
            }

            // 缩小时也要检查是否需要解除 maxWidth 限制
            if (stackRect.width < maxAllowedWidth) {
              ta.style.maxWidth = 'none';
            }
          }
        }
      });
      if (ta) {
        ro.observe(ta);
        ov.__resizeObserver = ro;
      }

      // 最后恢复 stack 的宽度（在 ResizeObserver 创建之后）
      const stackForRestore = ov.querySelector('.qp-stack');
      if (ov.__savedStackWidth && stackForRestore) {
        stackForRestore.style.width = ov.__savedStackWidth;
        // 监听窗口大小变化，动态调整浮窗和 textarea
      const handleWindowResize = function() {
        const responsiveWidth = getResponsiveWidth(); // 当前浏览器宽度对应的响应式宽度
        const currentStackWidth = stack.getBoundingClientRect().width;

        // 关键：只在浏览器宽度变窄、且当前浮窗宽度超出响应式宽度时，才缩小浮窗
        if (responsiveWidth < currentStackWidth) {
          // 将浮窗宽度设置为响应式宽度（会随浏览器变窄而变窄）
          stack.style.width = responsiveWidth + 'px';

          // 同时调整 textarea，确保不超出新的浮窗宽度
          if (ta) {
            const taRect = ta.getBoundingClientRect();
            const quoteStyle = window.getComputedStyle(quote);
            const quotePaddingLeft = parseFloat(quoteStyle.paddingLeft);
            const quotePaddingRight = parseFloat(quoteStyle.paddingRight);
            const quoteRect = quote.getBoundingClientRect();
            const taLeftOffset = taRect.left - quoteRect.left - quotePaddingLeft;

            const maxTaWidth = responsiveWidth - taLeftOffset - SAFE_MARGIN - 20 - quotePaddingLeft - quotePaddingRight;
            if (taRect.width > maxTaWidth) {
              ta.style.width = Math.max(maxTaWidth, 200) + 'px';
            }
          }
        }
        // 浏览器变宽时不做任何调整（保持用户设置的宽度）
      };

      window.addEventListener('resize', handleWindowResize);
      ov.__windowResizeHandler = handleWindowResize;
      }
      // ---------- END 插入 ----------

      // 聚焦 textarea
      if (ta) {
          ta.focus();
          const val = ta.value;
          ta.value = '';
          ta.value = val;
      }

      // Ctrl+Enter 发送并在成功后关闭浮窗
      if (ta) {
          const form = ta.closest('form');
          if (form && !ta.__qpCtrlEnterBound) {
              ta.__qpCtrlEnterBound = true;

              // 保留：提交成功后关闭浮窗
              document.addEventListener('replySuccess', () => {
                  form.__submitting = false;
                  closeOverlay();
              });

              // 新增：调用抽取的绑定函数
              bindCtrlEnter(ta);
          }
      }
    });

    // 底部按钮：平滑滚动到最底部，不污染 URL
    dockerDom.find('[data-type="BOTTOM"]').on('click', () => {
        $('html, body').animate({ scrollTop: $(document).height() - $(window).height() }, 500);
    });
  }

  /* --------------------------------------------------
   * tag 11. 拦截回复中间页
   * -------------------------------------------------- */
  function interceptReplyForm() {
    // —— 缓存工具（GM_* 优先；localStorage 兜底；返回对象型默认值） ——
    function cacheGet(key, fallback = null) {
      try {
        if (typeof GM_getValue === 'function') {
          const v = GM_getValue(key);
          return v != null ? v : fallback;
        }
        const s = localStorage.getItem(key);
        return s != null ? JSON.parse(s) : fallback;
      } catch (_) {
        return fallback;
      }
    }

    function cacheSet(key, val) {
      try {
        if (typeof GM_setValue === 'function') {
          GM_setValue(key, val);
          return;
        }
        localStorage.setItem(key, JSON.stringify(val));
      } catch (_) {}
    }

    // —— NFKC 候选池 ——
    function getNkfcBase() {
      const CACHE_KEY_NKFC = 'nkfcBase.v2';
      let base = cacheGet(CACHE_KEY_NKFC, {});
      if (Object.keys(base).length > 0) return base;

      base = {};
      for (let i = 0; i <= 0xFFFF; i++) {
        const ch = String.fromCharCode(i);
        const norm = ch.normalize('NFKC');
        if (ch !== norm) (base[norm] ||= []).push(ch);
      }
      cacheSet(CACHE_KEY_NKFC, base);
      return base;
    }

    // —— 单字符替换 ——
    // —— 颜文字中常见的汉字与英文，替换时排除（可保留或按需维护） ——
    const KAOMOJI_EXCLUDE_CHARS = new Set([
      '旦','开','摆','摔','低','好','钩','我','咬','接','龙','大','成','功',
      '举','高','糕','咩','吁','肥','喵','酱','狗','比','汪','哈','電','柱',
      'N','o','O','o'
    ]);

    // —— 单字符替换（回归稳定候选：优先第一个），但保留缓存为数组以便未来扩展 ——
    function maskChar(ch, skipAscii = true) {
      const CACHE_KEY_CHARMAP = 'unvcodeCharMap.v3';
      const charMap = cacheGet(CACHE_KEY_CHARMAP, {});

      if (charMap.hasOwnProperty(ch)) {
        const cached = charMap[ch];
        if (Array.isArray(cached) && cached.length > 0) {
          return cached[0]; // 稳定使用首选候选，旧版风格
        } else if (typeof cached === 'string') {
          return cached;
        }
      }

      if (skipAscii && ch.charCodeAt(0) < 128) {
        charMap[ch] = [ch];
        cacheSet(CACHE_KEY_CHARMAP, charMap);
        return ch;
      }

      const base = getNkfcBase();
      const norm = ch.normalize('NFKC');
      const candidates = base[norm] || [];
      const mapped = candidates.length > 0 ? candidates[0] : ch;

      charMap[ch] = [mapped];
      cacheSet(CACHE_KEY_CHARMAP, charMap);
      return mapped;
    }

    // —— 逐字替换（委托 maskChar） ——
    function unvcode(text, skipAscii = true) {
      let out = '';
      for (const ch of text) out += maskChar(ch, skipAscii);
      return out;
    }

    // —— 保留你之前的选择性规则：URL 整段跳过；非 URL 部分中文 → unvcode；英文 → 原样 + U+200B；其他原样 ——
    function unvcodeSelective(text) {
      const urlRegex = /(?:(?:https?|ftp):\/\/[^\s]+|www\.[^\s]+|[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?|>>(?:No\.)?\d+)/gi;
      const hanRegex = /[\u4E00-\u9FFF]/;
      const engRegex = /[A-Za-z]/;

      return text
        .split(/(\b(?:https?|ftp):\/\/[^\s]+|www\.[^\s]+|[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?|>>(?:No\.)?\d+)/gi)
        .map(part => {
          if (!part) return '';

          // URL 整段跳过
          if (urlRegex.test(part)) {
            urlRegex.lastIndex = 0;
            return part;
          }

          // 非 URL：按规则处理
          let out = '';
          for (const ch of part) {
            if (hanRegex.test(ch) && !KAOMOJI_EXCLUDE_CHARS.has(ch)) {
              out += unvcode(ch, false); // 中文 → unvcode
            } else if (engRegex.test(ch) && !KAOMOJI_EXCLUDE_CHARS.has(ch)) {
              out += ch + '\u200B';     // 英文 → 原样 + U+200B
            } else {
              out += ch;                // 其他 → 原样
            }
          }
          return out;
        })
        .join('');
    }
    // —— 根据当前失败文本，精准刷新需处理字符的缓存 ——
    // 仅刷新：非 URL 段中的中文与英文，且不在排除集合中的字符
    function resetCacheForFailedContent(text) {
      const urlRegex = /(?:(?:https?|ftp):\/\/[^\s]+|www\.[^\s]+|[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?|>>(?:No\.)?\d+)/gi;
      const hanRegex = /[\u4E00-\u9FFF]/;
      const engRegex = /[A-Za-z]/;

      const CACHE_KEY_CHARMAP = 'unvcodeCharMap.v3';
      const charMap = cacheGet(CACHE_KEY_CHARMAP, {});

      const parts = text.split(/(\b(?:https?|ftp):\/\/[^\s]+|www\.[^\s]+|[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?|>>(?:No\.)?\d+)/gi);
      let changed = false;

      for (const part of parts) {
        if (!part) continue;

        // 跳过 URL 段
        if (urlRegex.test(part)) {
          urlRegex.lastIndex = 0;
          continue;
        }

        // 非 URL 段：逐字检查
        for (const ch of part) {
          const isHan = /[\u4E00-\u9FFF]/.test(ch);
          const isEng = /[A-Za-z]/.test(ch);
          if (!isHan && !isEng) continue;
          if (KAOMOJI_EXCLUDE_CHARS.has(ch)) continue;

          // 清空该字符的缓存（使下次重新生成替换）
          if (charMap[ch]) {
            delete charMap[ch];
            changed = true;
          }
        }
      }

      if (changed) cacheSet(CACHE_KEY_CHARMAP, charMap);
    }
    // —— 备用方案：仅在中文后插入零宽空格 ——
    function fallbackInsertZWSP(text) {
      const urlRegex = /(?:(?:https?|ftp):\/\/[^\s]+|www\.[^\s]+|[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?|>>(?:No\.)?\d+)/gi;
      const hanRegex = /[\u4E00-\u9FFF]/;

      return text
        .split(/(\b(?:https?|ftp):\/\/[^\s]+|www\.[^\s]+|[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?|>>(?:No\.)?\d+)/gi)
        .map(part => {
          if (!part) return '';
          if (urlRegex.test(part)) {
            urlRegex.lastIndex = 0;
            return part; // URL 段跳过
          }

          let out = '';
          for (const ch of part) {
            if (hanRegex.test(ch) && !KAOMOJI_EXCLUDE_CHARS.has(ch)) {
              out += ch + '\u200B'; // 汉字后插入零宽空格
            } else {
              out += ch;
            }
          }
          return out;
        })
        .join('');
    }
    // 提取所有 URL 范围
    function findUrlRanges(text) {
      const re = /(?:(?:https?|ftp):\/\/[^\s]+|www\.[^\s]+|[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?|>>(?:No\.)?\d+)/gi;
      const ranges = [];
      for (const m of text.matchAll(re)) {
        ranges.push({ start: m.index, end: m.index + m[0].length });
      }
      return ranges;
    }

    // 判断位置是否在任何 URL 范围内
    function inAnyRange(pos, ranges) {
      for (const r of ranges) {
        if (pos >= r.start && pos < r.end) return true;
      }
      return false;
    }
    // done 可选unvcode模式或者零宽空格模式，目前来看unvcode模式下长文本中被替换的文字较多，观感受影响，只要没有复制需求，零宽空格更实用
    // done BUG 其他报错似乎不toast提示-大概是好了吧，新增了500报错的toast，但目前图床有问题没法确定图片安全性审核不通过是不是也会toast
    // 第三次保底：对所有非 URL 段内的汉字插入 U+200B（不使用排除集合）
    function fallbackInsertZWSP(text) {
      const hanRegex = /[\u4E00-\u9FFF]/;
      const urlRanges = findUrlRanges(text);

      let out = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inAnyRange(i, urlRanges)) {
          out += ch; // URL 段内不处理
        } else {
          if (hanRegex.test(ch)) {
            out += ch + '\u200B'; // 非 URL 段内所有汉字后插入零宽空格
          } else {
            out += ch;
          }
        }
      }
      return out;
    }
    // —— 表单提交拦截 ——
    document.addEventListener('submit', function (e) {
      const form = e.target;
      const isReply = form.matches('form[action="/Home/Forum/doReplyThread.html"]');
      const isPost = form.matches('form[action="/Home/Forum/doPostThread.html"]');
      if (!isReply && !isPost) return;

      e.preventDefault();

      const formData = new FormData(form);
      // 文字内容
      let content = (formData.get('content') || '').toString().trim();

      // 新增：如果内容只有 "0"，就在后面加一个零宽空格
      if (content === '0') {
        content = '0\u200B'; // 在 0 后追加零宽空格
        formData.set('content', content);
        const textarea = form.querySelector('textarea[name="content"]');
        if (textarea) textarea.value = content;
      }
      if (!content) {
        // 检查是否选择了图片（支持 name="image"）
        const fileInput = form.querySelector('input[type="file"][name="image"]');
        const hasImage = !!(fileInput && fileInput.files && fileInput.files.length > 0);

        if (hasImage || content === '0') {
          //无文字但有图片，或者内容只有 "0" → 自动补零宽空格，并同步到 FormData 与 DOM
          //修改以自定义。
          //content = '分享图片';//默认占位文字
          //content = '‎';//空格占位符 U+200E
          //content = '　';//全角空格占位符 U+3000
          content = '​'; // 零宽空格占位符 U+200B
          formData.set('content', content);
          const textarea = form.querySelector('textarea[name="content"]');
          if (textarea) textarea.value = content;
        } else {
          toast(isReply ? '回复内容不能为空' : '发串内容不能为空');
          return;
        }
      }

      const STATIC_MAX_SIZE_KB = 2048;
      const STATIC_TARGET_LOWER_KB = 1900;
      const STATIC_ACCEPTABLE_LOWER_KB = 1850;
      const STATIC_MAX_ATTEMPTS = 5;

      async function compressImageToSize(file, maxSizeKB = STATIC_MAX_SIZE_KB, minQuality = 0.6) {
        const maxSizeBytes = STATIC_MAX_SIZE_KB * 1024;
        const targetUpperBytes = maxSizeBytes;
        const targetLowerBytes = STATIC_TARGET_LOWER_KB * 1024;

        if (file.size <= maxSizeBytes) {
          return file;
        }

        console.log(`[compressImage] 开始压缩: ${(file.size / 1024).toFixed(1)}KB -> 目标区间 ${(targetLowerBytes / 1024).toFixed(0)}-${maxSizeKB}KB`);
        const startTime = performance.now();

        return new Promise((resolve, reject) => {
          const img = new Image();
          const url = URL.createObjectURL(file);

          img.onload = async () => {
            URL.revokeObjectURL(url);

            const originalType = file.type || 'image/jpeg';
            const isJPEG = originalType === 'image/jpeg' || originalType === 'image/jpg';
            const isWEBP = originalType === 'image/webp';
            const outputType = isWEBP ? 'image/webp' : (isJPEG ? 'image/jpeg' : 'image/png');

            const drawToCanvas = (scale) => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = Math.max(1, Math.floor(img.width * scale));
              canvas.height = Math.max(1, Math.floor(img.height * scale));
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              return canvas;
            };

            const canvasToBlob = (canvas, quality) => new Promise((resolveBlob, rejectBlob) => {
              canvas.toBlob((blob) => {
                if (!blob) {
                  rejectBlob(new Error('图片压缩失败'));
                  return;
                }
                resolveBlob(blob);
              }, outputType, quality);
            });

            const toFile = (blob) => new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now()
            });

            const formatSupportsQuality = outputType !== 'image/png';
            const clampScale = (scale, minScale = 0.12, maxScale = 1) => Math.min(maxScale, Math.max(minScale, scale));
            let bestBlob = null;
            let bestScore = Infinity;
            let totalAttempts = 0;

            const considerBlob = (blob) => {
              if (blob.size > targetUpperBytes) return;
              const score = targetUpperBytes - blob.size;
              if (score < bestScore) {
                bestScore = score;
                bestBlob = blob;
              }
            };

            const searchBestQualityAtScale = async (scale) => {
              const canvas = drawToCanvas(scale);

              if (!formatSupportsQuality) {
                totalAttempts++;
                const blob = await canvasToBlob(canvas, 0.92);
                console.log(`[compressImage] 尝试#${totalAttempts}: 缩放=${scale.toFixed(3)}, 质量=png-default -> ${(blob.size / 1024).toFixed(1)}KB`);
                considerBlob(blob);
                return { blob, exceeded: blob.size > targetUpperBytes, hitRange: blob.size >= targetLowerBytes && blob.size <= targetUpperBytes };
              }

              let low = minQuality;
              let high = 0.95;
              let localBest = null;
              let localBestScore = Infinity;

              for (let i = 0; i < STATIC_MAX_ATTEMPTS; i++) {
                const quality = (low + high) / 2;
                totalAttempts++;
                const blob = await canvasToBlob(canvas, quality);
                const sizeKB = blob.size / 1024;
                console.log(`[compressImage] 尝试#${totalAttempts}: 缩放=${scale.toFixed(3)}, 质量=${quality.toFixed(4)} -> ${sizeKB.toFixed(1)}KB`);

                if (blob.size <= targetUpperBytes) {
                  const score = targetUpperBytes - blob.size;
                  if (score < localBestScore) {
                    localBestScore = score;
                    localBest = blob;
                  }
                  considerBlob(blob);
                  low = quality;
                } else {
                  high = quality;
                }
              }

                // ✨ 精细搜索：从 high(≈0.95) 逐步提升到 1.0，寻找最接近限制的质量
                if (localBest && localBest.size < targetLowerBytes) {
                  console.log(`[compressImage] 精细搜索：当前最佳 ${(localBest.size / 1024).toFixed(1)}KB < ${(STATIC_TARGET_LOWER_KB)}KB，尝试提高质量……`);
                  for (let q = 0.96; q <= 0.998; q = Math.min(0.998, q + 0.005)) {
                  totalAttempts++;
                  const blob = await canvasToBlob(canvas, q);
                  const sizeKB = blob.size / 1024;
                  console.log(`[compressImage] 尝试#${totalAttempts}: 缩放=${scale.toFixed(3)}, 质量=${q.toFixed(4)}(精细) -> ${sizeKB.toFixed(1)}KB`);
                  considerBlob(blob);
                  if (blob.size <= targetUpperBytes) {
                    const score = targetUpperBytes - blob.size;
                    if (score < localBestScore) {
                      localBestScore = score;
                      localBest = blob;
                    }
                    if (blob.size >= targetLowerBytes) {
                      return {
                        blob: localBest,
                        exceeded: false,
                        hitRange: true
                      };
                    }
                  } else {
                    break;
                  }
                }
              }

              if (localBest) {
                return {
                  blob: localBest,
                  exceeded: false,
                  hitRange: localBest.size >= targetLowerBytes && localBest.size <= targetUpperBytes
                };
              }

              const fallbackBlob = await canvasToBlob(canvas, minQuality);
              totalAttempts++;
              console.log(`[compressImage] 尝试#${totalAttempts}: 缩放=${scale.toFixed(3)}, 质量=${minQuality.toFixed(4)}(fallback) -> ${(fallbackBlob.size / 1024).toFixed(1)}KB`);
              considerBlob(fallbackBlob);
              return {
                blob: fallbackBlob,
                exceeded: fallbackBlob.size > targetUpperBytes,
                hitRange: fallbackBlob.size >= targetLowerBytes && fallbackBlob.size <= targetUpperBytes
              };
            };

            const searchBestPngScale = async () => {
              const relaxedLowerBytes = Math.max(Math.floor(maxSizeBytes * 0.84), Math.floor(targetLowerBytes * 0.88));
              const baseScale = Math.sqrt(targetUpperBytes / file.size);
              const minScale = clampScale(baseScale * 0.7, 0.12, 0.55);
              let scale = clampScale(baseScale * 1.08, minScale, 0.92);
              let lastUnderLimitBlob = null;
              const seenScales = new Set();

              for (let phase = 0; phase < 6; phase++) {
                const scaleKey = scale.toFixed(4);
                if (seenScales.has(scaleKey)) break;
                seenScales.add(scaleKey);

                const result = await searchBestQualityAtScale(scale);
                if (!result.exceeded) lastUnderLimitBlob = result.blob;
                if (result.hitRange) return result;

                if (result.exceeded) {
                  const shrinkRatio = Math.sqrt(targetUpperBytes / result.blob.size);
                  const nextScale = clampScale(scale * shrinkRatio * 0.97, minScale, scale * 0.98);
                  if (Math.abs(nextScale - scale) < 0.005) break;
                  scale = nextScale;
                  continue;
                }

                if (result.blob.size >= relaxedLowerBytes) {
                  return {
                    blob: result.blob,
                    exceeded: false,
                    hitRange: false
                  };
                }

                const growRatio = Math.sqrt(targetUpperBytes / Math.max(result.blob.size, 1));
                const nextScale = clampScale(scale * Math.min(growRatio * 0.985, 1.12), minScale, 0.98);
                if (nextScale <= scale + 0.004 || nextScale >= 0.995) break;
                scale = nextScale;
              }

              if (bestBlob) {
                return {
                  blob: bestBlob,
                  exceeded: false,
                  hitRange: bestBlob.size >= targetLowerBytes && bestBlob.size <= targetUpperBytes
                };
              }

              if (lastUnderLimitBlob) {
                return {
                  blob: lastUnderLimitBlob,
                  exceeded: false,
                  hitRange: lastUnderLimitBlob.size >= targetLowerBytes && lastUnderLimitBlob.size <= targetUpperBytes
                };
              }

              return {
                blob: null,
                exceeded: true,
                hitRange: false
              };
            };

            try {
              if (!formatSupportsQuality) {
                const pngResult = await searchBestPngScale();
                const finalBlob = pngResult.blob || bestBlob;
                if (finalBlob) {
                  const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
                  console.log(`[compressImage] ✓ PNG完成: ${(file.size / 1024).toFixed(1)}KB -> ${(finalBlob.size / 1024).toFixed(1)}KB, ${totalAttempts}次尝试, ${elapsed}秒`);
                  resolve(toFile(finalBlob));
                  return;
                }

                reject(new Error('无法将PNG压缩到限制以内'));
                return;
              }

              let result = await searchBestQualityAtScale(1);
              if (result.hitRange) {
                const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
                console.log(`[compressImage] ✓ 原尺寸命中目标: ${(bestBlob.size / 1024).toFixed(1)}KB, ${totalAttempts}次尝试, ${elapsed}秒`);
                resolve(toFile(bestBlob));
                return;
              }

              if (result.exceeded) {
                let scale = clampScale(Math.sqrt(targetUpperBytes / result.blob.size) * 0.98, 0.5, 0.98);

                for (let phase = 0; phase < 4; phase++) {
                  result = await searchBestQualityAtScale(scale);
                  if (result.hitRange) break;

                  if (result.exceeded) {
                    scale = clampScale(scale * 0.92, 0.5, 0.98);
                  } else if (bestBlob && bestBlob.size < targetLowerBytes) {
                    scale = clampScale(scale * 1.03, 0.5, 1);
                    if (scale >= 0.999) break;
                  } else {
                    break;
                  }
                }
              }

              if (bestBlob) {
                const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
                console.log(`[compressImage] ✓ 完成: ${(file.size / 1024).toFixed(1)}KB -> ${(bestBlob.size / 1024).toFixed(1)}KB, ${totalAttempts}次尝试, ${elapsed}秒`);
                resolve(toFile(bestBlob));
                return;
              }

              reject(new Error('无法将图片压缩到目标大小'));
            } catch (err) {
              reject(err);
            }
          };

          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('图片加载失败'));
          };

          img.src = url;
        });
      }

      const GIF_MAX_SIZE_KB = 2048;
      const GIF_TARGET_LOWER_KB = 1900;
      const GIF_ACCEPTABLE_LOWER_KB = 1850;
      const GIF_MAX_ORIGINAL_KB = 30 * 1024;//目前限制30MB以内
      const GIF_MAX_LONG_EDGE = 1600;
      const GIF_MAX_ATTEMPTS = 3;//目前最多重试3次
      let gifsicleApiPromise = null;

      function clampNumber(value, min, max) {
        return Math.min(max, Math.max(min, value));
      }

      function formatKB(sizeBytes) {
        return `${(sizeBytes / 1024).toFixed(1)}KB`;
      }

      function getGifDimensions(file) {
        return new Promise((resolve) => {
          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            const result = {
              width: img.naturalWidth || img.width || 0,
              height: img.naturalHeight || img.height || 0
            };
            URL.revokeObjectURL(url);
            resolve(result);
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({ width: 0, height: 0 });
          };
          img.src = url;
        });
      }

      async function ensureGifsicleLoaded() {
        if (window.__xdexGifsicleModule) {
          return window.__xdexGifsicleModule;
        }

        if (!gifsicleApiPromise) {
          gifsicleApiPromise = import('https://cdn.jsdelivr.net/npm/gifsicle-wasm-browser/dist/gifsicle.min.js')
            .then((mod) => {
              const api = (mod && (mod.default || mod.gifsicle || mod)) || null;
              if (!api) {
                throw new Error('GIF压缩库未返回可用模块');
              }
              window.__xdexGifsicleModule = api;
              return api;
            })
            .catch((err) => {
              gifsicleApiPromise = null;
              throw err;
            });
        }

        return gifsicleApiPromise;
      }

      async function runGifsicleAttempt(api, inputFile, args) {
        const fileName = '/tem/input.gif';
        const outName = '/out/out.gif';
        const commandText = [...args, fileName, '-o', outName].join(' ');

        if (typeof api.run === 'function') {
          const result = await api.run({
            input: [{ file: inputFile, name: fileName }],
            command: [commandText]
          });
          const output = (result && (result.output || result.files || result)) || [];
          const outFile = Array.isArray(output)
            ? output.find((item) => item && (((item.name || '') === outName) || /out\.gif$/i.test(item.name || '')))
            : null;
          const data = outFile && (outFile.data || outFile.buffer || outFile.content || outFile.file || outFile.blob);
          if (data instanceof Blob) return data;
          if (data instanceof Uint8Array) return new Blob([data], { type: 'image/gif' });
          if (data instanceof ArrayBuffer) return new Blob([new Uint8Array(data)], { type: 'image/gif' });
          if (outFile instanceof Blob) return outFile;
          throw new Error('gifsicle.run 未返回可用输出');
        }

        if (api.default && typeof api.default.run === 'function') {
          return runGifsicleAttempt(api.default, inputFile, args);
        }

        throw new Error('未识别的 gifsicle-wasm-browser API 形态');
      }

      // GIF 结构修复：用 gifsicle 重新编码（不压缩，只修复 GCT 等结构问题）
      async function reencodeGifWithGifsicle(file) {
        const api = await ensureGifsicleLoaded();
        const blob = await runGifsicleAttempt(api, file, ['--no-warnings']);
        return new File([blob], file.name.replace(/\.gif$/i, '.gif'), { type: 'image/gif', lastModified: Date.now() });
      }

      async function compressGifToSize(file, options = {}) {
        const maxSizeKB = options.maxSizeKB || GIF_MAX_SIZE_KB;
        const targetLowerKB = options.targetLowerKB || GIF_TARGET_LOWER_KB;
        const acceptableLowerKB = options.acceptableLowerKB || GIF_ACCEPTABLE_LOWER_KB;
        const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
        const maxBytes = maxSizeKB * 1024;
        const lowerBytes = targetLowerKB * 1024;
        const acceptableLowerBytes = acceptableLowerKB * 1024;
        const originalKB = file.size / 1024;

        if (file.size <= maxBytes) {
          return {
            file,
            summary: '原始 GIF 已在目标大小内，无需压缩',
            attempts: []
          };
        }

        if (originalKB > GIF_MAX_ORIGINAL_KB) {
          throw new Error(`GIF 原始体积过大（${formatKB(file.size)}），限制为 <= ${GIF_MAX_ORIGINAL_KB}KB`);
        }

        const { width, height } = await getGifDimensions(file);
        if (width > 0 && height > 0) {
          const longEdge = Math.max(width, height);
          if (longEdge > GIF_MAX_LONG_EDGE) {
            throw new Error(`GIF 尺寸过大（${width}x${height}），限制长边 <= ${GIF_MAX_LONG_EDGE}`);
          }
        }

        const api = await ensureGifsicleLoaded();
        const attempts = [];
        let bestBlob = null;
        let bestArgs = null;

        const oversizeRatio = file.size / maxBytes;
        let scale = clampNumber(Math.sqrt(maxBytes / file.size) * (oversizeRatio > 2.5 ? 1.32 : (oversizeRatio > 1.6 ? 1.18 : 1.06)), 0.22, 0.98);
        let lossy = oversizeRatio > 2.5 ? 40 : (oversizeRatio > 1.6 ? 30 : 20);
        let colors = oversizeRatio > 2.5 ? 128 : 160;
        const seenConfigs = new Set();

        console.log(`[compressGif] 开始压缩: ${formatKB(file.size)} -> 目标区间 ${targetLowerKB}-${maxSizeKB}KB, 倍率=${oversizeRatio.toFixed(2)}`);

        for (let i = 0; i < GIF_MAX_ATTEMPTS; i++) {
          const args = ['-O3', `--lossy=${Math.round(lossy)}`, '--colors', String(Math.round(colors))];
          if (scale < 0.995) {
            args.push('--scale', scale.toFixed(3));
          }

          const configKey = `${Math.round(lossy)}|${Math.round(colors)}|${scale < 0.995 ? scale.toFixed(3) : '1.000'}`;
          if (seenConfigs.has(configKey)) {
            scale = clampNumber(scale * 0.97, 0.16, 0.98);
            lossy = clampNumber(Math.round(lossy) + 8, 0, 200);
            colors = clampNumber(Math.round(colors) - 16, 48, 256);
            continue;
          }
          seenConfigs.add(configKey);

          try {
            const blob = await runGifsicleAttempt(api, file, args);
            const sizeKB = blob.size / 1024;
            const hitTarget = blob.size <= maxBytes;
            const inRange = blob.size >= lowerBytes && blob.size <= maxBytes;
            const attemptLog = {
              index: i + 1,
              args: args.join(' '),
              sizeKB: Number(sizeKB.toFixed(1)),
              hitTarget,
              inRange
            };
            attempts.push(attemptLog);
            console.log(`[compressGif] 尝试#${attemptLog.index}: ${attemptLog.args} -> ${attemptLog.sizeKB}KB${inRange ? '（命中目标区间）' : (hitTarget ? '（低于上限）' : '')}`);
            if (onProgress) {
              onProgress({
                index: attemptLog.index,
                total: GIF_MAX_ATTEMPTS,
                originalKB: Number(originalKB.toFixed(1)),
                currentKB: attemptLog.sizeKB,
                args: attemptLog.args,
                hitTarget,
                inRange
              });
            }

            if (hitTarget) {
              if (!bestBlob || blob.size > bestBlob.size) {
                bestBlob = blob;
                bestArgs = args;
              }
              if (inRange || blob.size >= acceptableLowerBytes) {
                break;
              }

              scale = clampNumber(scale * 1.08, 0.16, 0.98);
              lossy = clampNumber(Math.round(lossy) - 12, 0, 200);
              colors = clampNumber(Math.round(colors) + 32, 48, 256);
            } else {
              scale = clampNumber(scale * 0.90, 0.16, 0.98);
              lossy = clampNumber(Math.round(lossy) + 18, 0, 200);
              colors = clampNumber(Math.round(colors) - 24, 48, 256);
            }
          } catch (error) {
            const message = error && error.message ? error.message : String(error);
            attempts.push({ index: i + 1, args: args.join(' '), error: message });
            console.error(`[compressGif] 尝试#${i + 1} 失败: ${args.join(' ')} -> ${message}`);
            if (onProgress) {
              onProgress({
                index: i + 1,
                total: GIF_MAX_ATTEMPTS,
                originalKB: Number(originalKB.toFixed(1)),
                currentKB: null,
                args: args.join(' '),
                error: message,
                hitTarget: false,
                inRange: false
              });
            }
            scale = clampNumber(scale * 0.90, 0.16, 0.98);
            lossy = clampNumber(Math.round(lossy) + 18, 0, 200);
            colors = clampNumber(Math.round(colors) - 24, 48, 256);
          }
        }

        if (!bestBlob) {
          throw new Error('GIF 压缩后仍无法降到 2048KB 以下');
        }

        const compressedFile = new File([bestBlob], file.name.replace(/\.gif$/i, '') + '-compressed.gif', {
          type: 'image/gif',
          lastModified: Date.now()
        });
        const summary = `最佳命令: ${bestArgs.join(' ')}；原始 ${formatKB(file.size)} -> 压缩后 ${formatKB(compressedFile.size)}`;
        return { file: compressedFile, summary, attempts };
      }

      // ✅ APNG 压缩（apng-js Player 合成 + UPNG 重编码）
      // 支持增量帧（blend/dispose），不再降级为静态压缩
      async function compressApngToSize(file, maxSizeKB = 2048, options = {}) {
        const maxBytes = maxSizeKB * 1024;
        const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
        if (file.size <= maxBytes) return file;

        const arrayBuffer = await file.arrayBuffer();

        // 用 apng-js 解析（它能正确处理所有 APNG 结构）
        // apng-js UMD 导出名为 "apng-js"，需要从全局获取
        const _apngRaw = window['apng-js'] || window['apngJs'];
        const apngJsLib = typeof _apngRaw === 'function' ? _apngRaw
                        : (_apngRaw && typeof _apngRaw.default === 'function') ? _apngRaw.default
                        : null;
        if (!apngJsLib) {
          console.warn('[compressApngToSize] apng-js 库未加载 (window["apng-js"]=' + typeof _apngRaw + ')，降级到静态压缩');
          toast('APNG 解析库未加载，将转为静态图片压缩（动画会丢失）', 3000);
          return compressImageToSize(file, maxSizeKB);
        }
        let apng;
        try {
          apng = apngJsLib(arrayBuffer);
        } catch (e) {
          console.warn('[compressApngToSize] parseAPNG 失败，降级到静态压缩:', e.message);
          toast('APNG 解码失败，将转为静态图片压缩（动画会丢失）', 3000);
          return compressImageToSize(file, maxSizeKB);
        }
        if (apng instanceof Error) {
          console.warn('[compressApngToSize] parseAPNG 返回错误:', apng.message);
          toast('APNG 解码失败，将转为静态图片压缩（动画会丢失）', 3000);
          return compressImageToSize(file, maxSizeKB);
        }

        const { width, height } = apng;
        if (!apng.frames || apng.frames.length <= 1) {
          return compressImageToSize(file, maxSizeKB);
        }

        console.log(`[compressApngToSize] APNG: ${width}x${height}, ${apng.frames.length}帧, 总时长=${apng.playTime}ms`);

        // ---- 第一步：用 apng-js Player 逐帧合成，拿到每帧的完整 RGBA 像素 ----
        await apng.createImages();

        const renderCanvas = document.createElement('canvas');
        renderCanvas.width = width;
        renderCanvas.height = height;
        const renderCtx = renderCanvas.getContext('2d', { willReadFrequently: true });

        const player = await apng.getPlayer(renderCtx, false);

        const compositedFrames = [];  // { data: Uint8ClampedArray, delay: number }
        for (let i = 0; i < apng.frames.length; i++) {
          await player.renderNextFrame();
          const imgData = renderCtx.getImageData(0, 0, width, height);
          compositedFrames.push({
            data: new Uint8Array(imgData.data),
            delay: apng.frames[i].delay || 100
          });
        }

        console.log(`[compressApngToSize] 合成完成: ${compositedFrames.length}帧`);

        // 验证合成帧数据完整性
        const expectedFrameBytes = width * height * 4;
        for (let i = 0; i < compositedFrames.length; i++) {
          if (compositedFrames[i].data.length !== expectedFrameBytes) {
            throw new Error(`合成帧${i}数据异常: 期望${expectedFrameBytes}字节, 实际${compositedFrames[i].data.length}字节`);
          }
        }
        console.log(`[compressApngToSize] 帧数据验证通过: ${compositedFrames.length}帧 × ${(expectedFrameBytes/1024).toFixed(0)}KB/帧`);

        // ---- 第二步：可选抽帧（帧数 > 15 且压缩压力大时启用）----
        let workFrames = compositedFrames;
        let workDelays = compositedFrames.map(f => f.delay);
        const originalFrameCount = compositedFrames.length;

        const oversizeRatio = file.size / maxBytes;
        if (oversizeRatio > 1.8 && compositedFrames.length > 15) {
          const step = oversizeRatio > 3 ? 3 : 2;
          const decimated = [];
          const decimatedDelays = [];
          for (let i = 0; i < compositedFrames.length; i += step) {
            decimated.push(compositedFrames[i]);
            let accumulatedDelay = 0;
            for (let j = i; j < Math.min(i + step, compositedFrames.length); j++) {
              accumulatedDelay += compositedFrames[j].delay;
            }
            decimatedDelays.push(accumulatedDelay);
          }
          workFrames = decimated;
          workDelays = decimatedDelays;
          console.log(`[compressApngToSize] 抽帧: ${originalFrameCount} → ${workFrames.length}帧 (step=${step})`);
        }

        // ---- 第三步：逐帧 canvas.toBlob + 手动组装 APNG ----
        // 完全绕过 UPNG.encode 的多帧模式，避免大数据量内存爆炸

        // PNG chunk 读取辅助
        const readPngChunks = (u8) => {
          const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
          let pos = 8; // 跳过 PNG signature
          const chunks = [];
          while (pos + 8 <= u8.length) {
            const len = dv.getUint32(pos); pos += 4;
            const type = String.fromCharCode(u8[pos], u8[pos+1], u8[pos+2], u8[pos+3]); pos += 4;
            if (pos + len + 4 > u8.length) break;
            chunks.push({ type, data: u8.slice(pos, pos + len) });
            pos += len + 4; // data + crc
          }
          return chunks;
        };

        // 手动组装 APNG
        const buildApng = (ihdrData, frameChunks, delays, numPlays) => {
          // 计算总大小
          // 第 1 帧: fcTL(38) + IDAT(12+len)*
          // 后续帧: fcTL(38) + fdAT(12+4+len)* （fdAT 多 4 字节 seqNum）
          let totalSize = 8 + (12 + 13) + (12 + 8); // sig + IHDR + acTL
          for (let i = 0; i < frameChunks.length; i++) {
            totalSize += 12 + 26; // fcTL
            for (const idat of frameChunks[i]) {
              totalSize += (i === 0 ? 12 : 12 + 4) + idat.length; // IDAT vs fdAT
            }
          }
          totalSize += 12; // IEND

          const buf = new ArrayBuffer(totalSize);
          const u8 = new Uint8Array(buf);
          const dv = new DataView(buf);
          let o = 0;

          // PNG signature
          u8.set([137, 80, 78, 71, 13, 10, 26, 10], 0); o = 8;

          // IHDR
          const ihdrLen = 13;
          dv.setUint32(o, ihdrLen); o += 4;
          u8.set([73, 72, 68, 82], o); o += 4; // "IHDR"
          u8.set(ihdrData, o); o += ihdrLen;
          // CRC32 of type+data
          const ihdrCrc = crc32(u8.slice(o - 4 - ihdrLen, o));
          dv.setUint32(o, ihdrCrc); o += 4;

          // acTL (animation control)
          dv.setUint32(o, 8); o += 4; // length
          u8.set([97, 99, 84, 76], o); o += 4; // "acTL"
          dv.setUint32(o, frameChunks.length); o += 4; // num_frames
          dv.setUint32(o, numPlays); o += 4; // num_plays (0 = infinite)
          const acTlCrc = crc32(u8.slice(o - 4 - 8, o));
          dv.setUint32(o, acTlCrc); o += 4;

          // Frames — APNG 规范：第 1 帧用 IDAT，后续帧用 fdAT
          let seqNum = 0;
          for (let i = 0; i < frameChunks.length; i++) {
            const w = dv.getUint32(16); // from IHDR
            const h = dv.getUint32(20);
            const delay = delays[i] || 100;

            // fcTL (frame control) — 26 bytes data
            dv.setUint32(o, 26); o += 4;
            u8.set([102, 99, 84, 76], o); o += 4; // "fcTL"
            dv.setUint32(o, seqNum++); o += 4; // sequence_number
            dv.setUint32(o, w); o += 4;
            dv.setUint32(o, h); o += 4;
            dv.setUint32(o, 0); o += 4; // x_offset
            dv.setUint32(o, 0); o += 4; // y_offset
            dv.setUint16(o, delay); o += 2; // delay_num
            dv.setUint16(o, 1000); o += 2; // delay_den (毫秒)
            u8[o++] = 0; // dispose_op: NONE
            u8[o++] = i === 0 ? 0 : 1; // blend_op: SOURCE for first, OVER for rest
            dv.setUint32(o, crc32(u8.slice(o - 4 - 26, o))); o += 4;

            if (i === 0) {
              // 第 1 帧：IDAT（标准 PNG 图像数据块，无额外 seqNum）
              for (const idatData of frameChunks[i]) {
                dv.setUint32(o, idatData.length); o += 4;
                u8.set([73, 68, 65, 84], o); o += 4; // "IDAT"
                u8.set(idatData, o); o += idatData.length;
                dv.setUint32(o, crc32(u8.slice(o - 4 - idatData.length, o))); o += 4;
              }
            } else {
              // 后续帧：fdAT（frame data，比 IDAT 多 4 字节 seqNum）
              for (const idatData of frameChunks[i]) {
                const fdatPayloadLen = 4 + idatData.length; // seqNum + 压缩数据
                dv.setUint32(o, fdatPayloadLen); o += 4;
                u8.set([102, 100, 65, 84], o); o += 4; // "fdAT"
                dv.setUint32(o, seqNum++); o += 4; // sequence_number
                u8.set(idatData, o); o += idatData.length;
                // CRC 覆盖 type("fdAT") + payload(seqNum + data)
                dv.setUint32(o, crc32(u8.slice(o - 4 - idatData.length - 4, o))); o += 4;
              }
            }
          }

          // IEND
          dv.setUint32(o, 0); o += 4;
          u8.set([73, 69, 78, 68], o); o += 4;
          dv.setUint32(o, crc32(u8.slice(o - 4, o))); o += 4;

          return buf;
        };

        // CRC32 查找表
        const crcTable = (() => {
          const table = new Uint32Array(256);
          for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) {
              c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            }
            table[n] = c;
          }
          return table;
        })();

        const crc32 = (data) => {
          let crc = 0xFFFFFFFF;
          for (let i = 0; i < data.length; i++) {
            crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
          }
          return (crc ^ 0xFFFFFFFF) >>> 0;
        };

        // 逐帧渲染到 canvas + toBlob
        const renderFrameToBlob = (srcData, srcW, srcH, scale) => {
          return new Promise((resolve, reject) => {
            const newW = Math.max(1, Math.floor(srcW * scale));
            const newH = Math.max(1, Math.floor(srcH * scale));
            const canvas = document.createElement('canvas');
            canvas.width = newW;
            canvas.height = newH;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            // 通过 Image → canvas 方式绘制（避免 OffscreenCanvas + putImageData 的内存问题）
            const img = new Image();
            const blob = new Blob([srcData], { type: 'image/bmp' });
            const url = URL.createObjectURL(blob);
            img.onload = () => {
              ctx.drawImage(img, 0, 0, newW, newH);
              URL.revokeObjectURL(url);
              canvas.toBlob((pngBlob) => {
                if (!pngBlob) { reject(new Error('toBlob 返回 null')); return; }
                pngBlob.arrayBuffer().then(ab => resolve(new Uint8Array(ab))).catch(reject);
              }, 'image/png');
            };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image 加载失败')); };
            img.src = url;
          });
        };

        // 单帧编码：canvas 缩放 → toBlob('image/png')
        // 在右下角放一个几乎透明的像素，强制浏览器输出 RGBA（type=6），避免偷换成 RGB
        const renderFrameToPng = (rgbaData, srcW, srcH, scale) => {
          return new Promise((resolve, reject) => {
            const newW = Math.max(1, Math.floor(srcW * scale));
            const newH = Math.max(1, Math.floor(srcH * scale));
            const srcCanvas = document.createElement('canvas');
            srcCanvas.width = srcW;
            srcCanvas.height = srcH;
            const srcCtx = srcCanvas.getContext('2d');
            srcCtx.putImageData(new ImageData(new Uint8ClampedArray(rgbaData), srcW, srcH), 0, 0);
            const dstCanvas = document.createElement('canvas');
            dstCanvas.width = newW;
            dstCanvas.height = newH;
            const dstCtx = dstCanvas.getContext('2d');
            dstCtx.imageSmoothingEnabled = true;
            dstCtx.imageSmoothingQuality = 'high';
            dstCtx.drawImage(srcCanvas, 0, 0, newW, newH);
            // 强制 RGBA：在不可见角落放一个几乎全透明的像素
            dstCtx.fillStyle = 'rgba(0,0,0,0.004)';
            dstCtx.fillRect(newW - 1, newH - 1, 1, 1);
            dstCanvas.toBlob((pngBlob) => {
              if (!pngBlob) { reject(new Error('toBlob 返回 null')); return; }
              pngBlob.arrayBuffer().then(ab => resolve(new Uint8Array(ab))).catch(reject);
            }, 'image/png');
          });
        };

        const targetLowerBytes = Math.floor((maxSizeKB - 68) * 1024);
        const startTime = performance.now();

        // 缩放梯度：从大到小（直接枚举，避免浮点死循环）
        const scaleSteps = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.15];

        for (const scale of scaleSteps) {
          const newW = Math.max(1, Math.floor(width * scale));
          const newH = Math.max(1, Math.floor(height * scale));
          console.log(`[compressApngToSize] 尝试 scale=${scale.toFixed(2)}: ${newW}x${newH}, ${workFrames.length}帧`);

          try {
            // 逐帧渲染为 PNG
            const framePngs = [];
            for (let i = 0; i < workFrames.length; i++) {
              const pngU8 = await renderFrameToPng(workFrames[i].data, width, height, scale);
              framePngs.push(pngU8);
            }

            // 解析第一帧的 IHDR
            const firstChunks = readPngChunks(framePngs[0]);
            const ihdrChunk = firstChunks.find(c => c.type === 'IHDR');
            if (!ihdrChunk) throw new Error('第一帧 PNG 缺少 IHDR');

            // 提取每帧的 IDAT 数据
            const allFrameIdats = framePngs.map(png => {
              const chunks = readPngChunks(png);
              return chunks.filter(c => c.type === 'IDAT').map(c => c.data);
            });

            // 组装 APNG
            const apngBuf = buildApng(ihdrChunk.data, allFrameIdats, workDelays, 0);
            const blob = new Blob([apngBuf], { type: 'image/apng' });
            const sizeKB = blob.size / 1024;
            console.log(`[compressApngToSize] scale=${scale.toFixed(2)} → ${sizeKB.toFixed(1)}KB`);
            if (onProgress) {
              onProgress({ scale, sizeKB, originalKB: file.size / 1024, frameCount: workFrames.length, newW: Math.floor(width * scale), newH: Math.floor(height * scale) });
            }

            if (blob.size >= targetLowerBytes && blob.size <= maxBytes) {
              const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
              console.log(`[compressApngToSize] ✓ 命中目标: ${sizeKB.toFixed(1)}KB, ${elapsed}秒`);
              return new File([blob], file.name.replace(/\.\w+$/i, '') + '-compressed.png', { type: 'image/png' });
            }

            if (blob.size <= maxBytes) {
              // 低于上限但未命中下限——也接受
              const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
              console.log(`[compressApngToSize] ✓ 完成: ${(file.size/1024).toFixed(1)}KB → ${sizeKB.toFixed(1)}KB, ${elapsed}秒`);
              return new File([blob], file.name.replace(/\.\w+$/i, '') + '-compressed.png', { type: 'image/png' });
            }
          } catch (e) {
            console.error(`[compressApngToSize] scale=${scale.toFixed(2)} 失败:`, e.message);
            if (onProgress) {
              onProgress({ scale, error: e.message, originalKB: file.size / 1024 });
            }
          }
        }

        throw new Error('APNG 压缩失败：所有缩放比例均无法降到限制以内，请手动处理');
      }

      // 检查错误信息是否与图片大小有关
      function isImageSizeError(msg) {
        if (!msg) return false;
        const patterns = [
          /图片.*大/i,
          /不能超过.*2048/i,
          /超过.*2048/i,
          /2048.*kb/i,
          /文件.*大/i,
          /image.*size/i,
          /file.*large/i,
          /too\s*large/i
        ];
        return patterns.some(p => p.test(msg));
      }

      function cloneFormData(sourceFd) {
        const cloned = new FormData();
        for (const [key, value] of sourceFd.entries()) {
          cloned.append(key, value);
        }
        return cloned;
      }

      function resetIllegalRetryState(options = {}) {
        const { clearOriginalContent = false } = options;
        form.__illegalRetryCount = 0;
        form.__illegalRetryCountU200B = 0;
        if (clearOriginalContent) {
          form.__originalContent = null;
        }
      }

      // 通过文件头部魔数检测真实图片格式（静态 / 动画）
      function detectImageFormat(file) {
        const ext = (file.name || '').split('.').pop().toLowerCase();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const arr = new Uint8Array(reader.result);
            const hex4 = Array.from(arr.subarray(0, 4), b => b.toString(16).padStart(2, '0')).join('').toLowerCase();

            // GIF: 47 49 46 38
            if (hex4 === '47494638') return resolve('gif');
            // JPEG: ff d8 ff
            if (hex4.startsWith('ffd8ff')) return resolve('jpeg');
            // PNG / APNG: 89 50 4e 47
            if (hex4 === '89504e47') {
              const fullReader = new FileReader();
              fullReader.onload = () => {
                const fullArr = new Uint8Array(fullReader.result);
                let foundAcTl = false;
                for (let i = 8; i + 12 <= fullArr.length; ) {
                  const len = (fullArr[i] << 24) | (fullArr[i+1] << 16) | (fullArr[i+2] << 8) | fullArr[i+3];
                  const type = String.fromCharCode(fullArr[i+4], fullArr[i+5], fullArr[i+6], fullArr[i+7]);
                  if (type === 'acTL') { foundAcTl = true; break; }
                  if (type === 'IDAT') break;
                  i += 12 + len;
                }
                resolve(foundAcTl ? 'apng' : 'png');
              };
              fullReader.onerror = () => resolve('png');
              fullReader.readAsArrayBuffer(file.slice(0, Math.min(file.size, 256 * 1024)));
              return;
            }
            // WebP: 52 49 46 46
            if (hex4 === '52494646') {
              const fullReader = new FileReader();
              fullReader.onload = () => {
                const fullArr = new Uint8Array(fullReader.result);
                const str = String.fromCharCode.apply(null, Array.from(fullArr.subarray(0, Math.min(4096, fullArr.length))));
                resolve(str.indexOf('ANIM') !== -1 ? 'animated-webp' : 'webp');
              };
              fullReader.onerror = () => resolve('webp');
              fullReader.readAsArrayBuffer(file.slice(0, Math.min(file.size, 4096)));
              return;
            }
            // BMP: 42 4d
            if (hex4 === '424d') return resolve('bmp');

            if (ext === 'gif') return resolve('gif');
            if (ext === 'apng') return resolve('apng');
            if (ext === 'webp') return resolve('webp');
            if (ext === 'png') return resolve('png');
            if (ext === 'jpg' || ext === 'jpeg') return resolve('jpeg');
            return resolve('unknown');
          };
          reader.onerror = () => {
            if (ext === 'gif') return resolve('gif');
            if (ext === 'apng') return resolve('apng');
            if (ext === 'webp') return resolve('webp');
            if (ext === 'png') return resolve('png');
            if (ext === 'jpg' || ext === 'jpeg') return resolve('jpeg');
            return resolve('unknown');
          };
          reader.readAsArrayBuffer(file.slice(0, 8));
        });
      }

      function processTextPreservingHiddenTags(input, processor) {
        if (!input || typeof processor !== 'function') return input || '';
        return input
          .split(/(\[h\]|\[\/h\])/gi)
          .map(part => (/^\[h\]$|^\[\/h\]$/i.test(part) ? part : processor(part)))
          .join('');
      }

      async function doSubmit(fd, isRetry = false) {
        return fetch(form.action, {
          method: form.method,
          body: fd,
          credentials: 'include'
        })
        .then(res => res.text())
        .then(async html => {
          // 增加调试输出：打印响应 HTML 的前 2000 字符，避免控制台被大量内容淹没
          try { console.log('[interceptReplyForm] response html (truncated):', html.slice(0, 2000)); } catch (e) { console.log('[interceptReplyForm] response html (full):', html); }
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const successMsg = doc.querySelector('p.success');
          const errorMsg   = doc.querySelector('p.error');
          // 打印解析到的 success / error 节点，便于调试未触发 toast 的情况
          console.log('[interceptReplyForm] parsed successMsg:', successMsg, 'errorMsg:', errorMsg);

          // 如果既没有 successMsg 也没有 errorMsg，检查其他错误格式
          if (!successMsg && !errorMsg) {
            try {
              // 格式1：500 Internal Server Error
              if (/500\s+Internal\s+Server\s+Error/i.test(html) || html.indexOf('<title>500 Internal Server Error</title>') !== -1) {
                toast('500 Internal Server Error,可能是图床故障');
                return;
              }

              // 格式2：系统错误页面（错误信息在 <div class="error"> 的 <h1> 中）
              const errorDiv = doc.querySelector('div.error');
              if (errorDiv) {
                const h1 = errorDiv.querySelector('h1');
                if (h1 && h1.textContent.trim()) {
                  toast(h1.textContent.trim());
                  return;
                }
              }

              // 格式3：title 含"系统发生错误"
              const titleEl = doc.querySelector('title');
              if (titleEl && /系统发生错误|系统错误/i.test(titleEl.textContent)) {
                toast('系统发生错误');
                return;
              }
            } catch (e) {
              console.warn('[interceptReplyForm] error while checking fallback formats:', e);
            }
          }

          if (successMsg) {

            toast(successMsg.textContent.trim() || (isReply ? '回复成功' : '发串成功'));

            const { confirmPromise, localId } = snapshotSubmittedPostHistory(fd, { isPost, isReply, form });

            // 清空输入框
            const textarea = form.querySelector('textarea[name="content"]');
            if (textarea) textarea.value = '';
            // 清空图片选择
            const fileInput = form.querySelector('input[type="file"][name="image"]');
            if (fileInput) fileInput.value = '';
            // ★ 清空编辑
            // 先立即删除（兜底清理，避免监听未注册导致残留）
            deleteDraftSafe(getDraftKey());
            // **清空标题、名称、Email**
            const titleInput = form.querySelector('input[name="title"]');
            if (titleInput) titleInput.value = '';

            const nameInput = form.querySelector('input[name="name"]');
            if (nameInput) nameInput.value = '';

            const emailInput = form.querySelector('input[name="email"]');
            if (emailInput) emailInput.value = '';
            // 再广播事件给增强模块/其他联动
            document.dispatchEvent(new CustomEvent('replySuccess', {
              detail: { key: getDraftKey() }
            }));
            // 重置预览框
            const previewBox = document.querySelector('.h-preview-box');
            if (previewBox) {
              const cur = getCurrentCookie();
              const cookieText = cur ? cur.name : '--';
              // 先放一个占位 ID，等刷新完成后再更新
              previewBox.innerHTML = `
                <div class="h-preview-box">
                  <div class="h-threads-item">
                    <div class="h-threads-item-replies">
                      <div class="h-threads-item-reply">
                        <div class="h-threads-item-reply-main">
                          <div class="h-threads-img-box">
                            <div class="h-threads-img-tool uk-animation-slide-top">
                              <span class="h-threads-img-tool-btn h-threads-img-tool-small uk-button-link"><i class="uk-icon-minus"></i>收起</span>
                              <a href="javascript:;" class="h-threads-img-tool-btn h-threads-img-tool-large uk-button-link"><i class="uk-icon-search-plus"></i>查看大图</a>
                              <span class="h-threads-img-tool-btn h-threads-img-tool-left uk-button-link"><i class="uk-icon-reply"></i>向左旋转</span>
                              <span class="h-threads-img-tool-btn h-threads-img-tool-right uk-button-link"><i class="uk-icon-share"></i>向右旋转</span>
                            </div>
                            <a class="h-threads-img-a"><img src="" align="left" border="0" hspace="20" class="h-threads-img"></a>
                          </div>
                          <div class="h-threads-info">
                            <span class="h-threads-info-title"></span>
                            <span class="h-threads-info-email"></span>
                            <span class="h-threads-info-createdat">2013-07-11(六)12:07:12</span>
                            <span class="h-threads-info-uid">ID:${cookieText}</span>
                            <span class="h-threads-info-report-btn">
                              [<a href="/f/值班室" target="_blank">举报</a>]
                            </span>
                            <a href=":javascript:;" class="h-threads-info-id" target="_blank">No.9999999</a>
                          </div>
                          <div class="h-threads-content"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>`;
              if (typeof enableHDImage === 'function') {
                enableHDImage(previewBox);
              }
            }
            if (typeof refreshCookies === 'function') {
              try {
                refreshCookies(() => {
                  try {
                    if (typeof updatePreviewCookieId === 'function') {
                      updatePreviewCookieId();
                    }
                  } catch (err) {
                    console.warn('[interceptReplyForm] updatePreviewCookieId after success failed', err);
                  }
                }, false);
              } catch (err) {
                console.warn('[interceptReplyForm] refreshCookies after success failed', err);
                toast('回复已发送，但饼干刷新失败，请刷新页面');
              }
            }
            // if (isReply) {
            //   try {
            //     refreshRepliesWithSeamlessPaging(() => {
            //       try {
            //         reapplyPageEnhancements();

            //         if (window.SeamlessPaging && typeof window.SeamlessPaging.refreshAndMaybeLoadNext === 'function') {
            //           // 延迟一点再检查,避免 DOM 还没稳定
            //           setTimeout(() => {
            //             try {
            //               window.SeamlessPaging.refreshAndMaybeLoadNext();
            //             } catch (err) {
            //               console.warn('SeamlessPaging.refreshAndMaybeLoadNext 执行失败', err);
            //             }
            //           }, 200);
            //         }
            //       } catch (err) {
            //         console.warn('刷新后增强处理失败', err);
            //         // 不向上抛出，避免触发外层的 catch
            //       }
            //     });
            //   } catch (err) {
            //     console.error('refreshRepliesWithSeamlessPaging 调用失败', err);
            //     // 不向上抛出，避免触发外层的 "未知错误"
            //   }
            // } else {
            //   location.reload();
            // }
            if (isReply) {
              try {
                refreshRepliesWithSeamlessPaging(() => {
                  // 刷新完成（翻页逻辑已在内部处理）
                  recordCurrentThreadHistory(0, { reason: 'reply-success-refresh', countVisit: false, touchVisitedAt: true });
                  console.log('回复区刷新完成');
                });
              } catch (err) {
                console.error('refreshRepliesWithSeamlessPaging 调用失败', err);
              }
            } else {
              // 发串：根据设置决定行为
              const cfg = (typeof SettingPanel !== 'undefined' && SettingPanel.state) ? SettingPanel.state : {};
              const postAction = cfg.postAfterAction === 'refresh' ? 'refresh' : 'jump';
              if (postAction === 'jump' && confirmPromise) {
                toast('新串发送成功，正在确认地址……');
                Promise.race([
                  confirmPromise,
                  new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), POST_HISTORY_CONFIRM_TIMEOUT_MS))
                ]).then(confirmed => {
                  if (confirmed && confirmed.url) {
                    window.open(confirmed.url, '_blank');
                    toast('已在新标签页打开新串');
                  } else {
                    toast('新串已发送，但未能确认地址');
                  }
                }).catch(() => {
                  toast('新串已发送，确认地址超时');
                });
              } else if (postAction === 'refresh' && confirmPromise) {
                // refresh 模式：等待发言历史确认后，跳转板块第一页顶部
                toast('新串发布成功，正在确认地址……');
                Promise.race([
                  confirmPromise,
                  new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), POST_HISTORY_CONFIRM_TIMEOUT_MS))
                ]).then(() => {
                  const boardPage1 = location.origin + location.pathname + '?page=1';
                  toast('正在转版块第一页……');
                  window.location.href = boardPage1;
                }).catch(() => {
                  const boardPage1 = location.origin + location.pathname + '?page=1';
                  toast('确认地址超时，正在转版块第一页……');
                  window.location.href = boardPage1;
                });
              } else {
                // jump 模式但无 confirmPromise：直接刷新页面
                location.reload();
              }
            }
          } else if (errorMsg) {
            const msg = errorMsg.textContent.trim() || '提交失败';
            const cfg = Object.assign({}, SettingPanel.defaults, GM_getValue(SettingPanel.key, {}));

            // 检查是否是图片大小错误
            if (isImageSizeError(msg)) {
              if (!cfg.interceptReplyFormAutoCompress) {
                try {
                  toast(msg);
                } catch (e) {
                  console.warn('[interceptReplyForm] toast error for image-size message:', msg, e);
                }
                return;
              }

              const fileInput = form.querySelector('input[type="file"][name="image"]');
              const file = fileInput && fileInput.files && fileInput.files[0];

              if (file && !isRetry) {
                const actualFormat = await detectImageFormat(file);
                console.log(`[interceptReplyForm] 检测到真实格式: ${actualFormat} | MIME: ${file.type} | 文件名: ${file.name}`);
                toast('图片大小>2048KB，正在尝试自动压缩', 3000);
                console.log(`[interceptReplyForm] 图片大小: ${(file.size / 1024).toFixed(1)}KB，开始压缩……`);
                try {
                  let compressedFile;
                  if (actualFormat === 'gif') {
                    let gifFile = file;
                    if (!/\.gif$/i.test(file.name)) {
                      const fixedName = file.name.replace(/\.\w+$/i, '.gif');
                      gifFile = new File([file], fixedName, { type: 'image/gif', lastModified: file.lastModified });
                      console.log(`[interceptReplyForm] 后缀已修正: ${file.name} → ${fixedName}`);
                    }
                    const gifResult = await compressGifToSize(gifFile, {
                      maxSizeKB: 2048,
                      targetLowerKB: 1850,
                      acceptableLowerKB: 1780,
                      onProgress: (progress) => {
                        if (progress.error) {
                          toast(`GIF压缩中：第${progress.index}/${progress.total}次失败，继续尝试……`, 1800);
                          return;
                        }
                        toast(`GIF压缩中：第${progress.index}/${progress.total}次，${progress.originalKB.toFixed(1)}KB → ${progress.currentKB.toFixed(1)}KB`, 1800);
                      }
                    });
                    compressedFile = gifResult.file;
                    console.log(`[interceptReplyForm] GIF压缩完成: ${gifResult.summary}`);
                  } else if (actualFormat === 'apng') {
                    compressedFile = await compressApngToSize(file, 2048, {
                      onProgress: (progress) => {
                        if (progress.error) {
                          toast(`APNG压缩中：scale=${progress.scale.toFixed(2)} 失败，继续尝试……`, 1800);
                          return;
                        }
                        toast(`APNG压缩中：${progress.newW}x${progress.newH} ${progress.frameCount}帧 → ${progress.sizeKB.toFixed(0)}KB（原${progress.originalKB.toFixed(0)}KB）`, 1800);
                      }
                    });
                    console.log(`[interceptReplyForm] APNG压缩完成: ${(compressedFile.size / 1024).toFixed(1)}KB`);
                  } else if (actualFormat === 'animated-webp') {
                    toast('检测到动画 WebP，将按静态图片压缩，动图可能丢失', 2000);
                    compressedFile = await compressImageToSize(file, 2048);
                    console.log(`[interceptReplyForm] 动画WebP压缩完成: ${(compressedFile.size / 1024).toFixed(1)}KB`);
                  } else {
                    compressedFile = await compressImageToSize(file, 2048);
                    console.log(`[interceptReplyForm] 压缩后大小: ${(compressedFile.size / 1024).toFixed(1)}KB`);
                    console.log(`[interceptReplyForm] 静态图片压缩完成: ${(compressedFile.size / 1024).toFixed(1)}KB`);
                  }
                  resetIllegalRetryState({ clearOriginalContent: false });
                  const newFD = cloneFormData(fd);
                  newFD.set('image', compressedFile);
                  toast(`图片已压缩至 ${(compressedFile.size / 1024).toFixed(1)}KB，正在重新提交……`, 2000);
                  await doSubmit(newFD, true);
                  return;
                } catch (compressErr) {
                  console.error('[interceptReplyForm] 图片压缩失败:', compressErr);
                  toast(compressErr && compressErr.message ? compressErr.message : '图片压缩失败，请手动压缩后再试', 3000);
                  return;
                }
              } else if (isRetry) {
                toast('压缩后图片仍然超过限制，请手动压缩后再试', 3000);
                return;
              }
            }

            // 非法图像文件 + GIF：可能是无 GCT 等结构问题，尝试用 gifsicle 重新编码后重试
            if (/非法图像/.test(msg) && !isRetry) {
              const fileInput = form.querySelector('input[type="file"][name="image"]');
              const file = fileInput && fileInput.files && fileInput.files[0];
              if (file && /\.gif$/i.test(file.name)) {
                console.log('[interceptReplyForm] 检测到非法GIF，尝试用gifsicle重新编码……');
                try {
                  const reencodedFile = await reencodeGifWithGifsicle(file);
                  const newFD = cloneFormData(fd);
                  newFD.set('image', reencodedFile);
                  toast('GIF结构已修复，正在重新提交……', 2000);
                  await doSubmit(newFD, true);
                  return;
                } catch (reencodeErr) {
                  console.error('[interceptReplyForm] GIF重编码失败:', reencodeErr);
                  toast('GIF重编码失败，请手动处理');
                  return;
                }
              }
            }

            // 如果不是"含有非法词语"的特殊情况，直接提示并返回，避免被后续分支忽略
            if (!/含有非法词语/.test(msg)) {
              try {
                toast(msg);
              } catch (e) {
                console.warn('[interceptReplyForm] toast error for message:', msg, e);
              }
              return;
            }

            if (/含有非法词语/.test(msg)) {
              if (cfg.interceptReplyFormUnvcode) {
                // 新增：优先判断 interceptReplyFormU200B
                if (cfg.interceptReplyFormU200B) {
                  // 新增：初始化或递增重试计数
                  form.__illegalRetryCountU200B = (form.__illegalRetryCountU200B || 0);
                  // 新增：检查是否已经重试过
                  if (form.__illegalRetryCountU200B >= 1) {
                    toast('插入零宽空格后仍提交失败，非法词语可能存在于url中，请手动处理', 3000);
                    const textarea = form.querySelector('textarea[name="content"]');
                    if (textarea && form.__originalContent != null) {
                      textarea.value = form.__originalContent;
                    }
                    form.__originalContent = null;
                    form.__illegalRetryCountU200B = 0;
                    return;
                  }

                  const textarea = form.querySelector('textarea[name="content"]');
                  const currentInput = textarea
                    ? textarea.value
                    : (formData.get('content') || '').toString();
            
                  // 构造安全文本：对所有非 URL 段的中文与英文字符插入 U+200B
                  const urlRegex = /(?:(?:https?|ftp):\/\/[^\s]+|www\.[^\s]+|[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?|>>(?:No\.)?\d+)/gi;
                  const hanRegex = /[\u4E00-\u9FFF]/;
                  const engRegex = /[A-Za-z]/;
            
                  const safeText = processTextPreservingHiddenTags(currentInput, (segment) => segment
                    .split(/((?:https?|ftp):\/\/[^\s]+|www\.[^\s]+|[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?|>>(?:No\.)?\d+)/gi)
                    .map(part => {
                      if (!part) return '';
                      if (urlRegex.test(part)) {
                        urlRegex.lastIndex = 0;
                        return part; // URL 段跳过
                      }
                      let out = '';
                      for (const ch of part) {
                        if (hanRegex.test(ch) || engRegex.test(ch)) {
                          out += ch + '\u200B'; // 中文或英文 → 插入零宽空格
                        } else {
                          out += ch;
                        }
                      }
                      return out;
                    })
                    .join(''));
            
                  const newFD = new FormData(form);
                  newFD.set('content', safeText);
            
                  // 新增：递增计数
                  form.__illegalRetryCountU200B++;

                  toast('已尝试插入零宽空格模式并重试提交', 2000);
                  doSubmit(newFD, false);
                  return;
                } else {
                  // 原有三次重试逻辑
                  const normalRetries = 2;       // 前两次正常替换
                  const fallbackRetryIndex = 2;  // 第三次（索引为2）执行保底
                  const maxRetriesAll = 3;       // 共尝试三次：0、1（正常），2（保底）
            
                  form.__illegalRetryCount = (form.__illegalRetryCount || 0);
            
                  const textarea = form.querySelector('textarea[name="content"]');
                  const currentInput = textarea
                    ? textarea.value
                    : (formData.get('content') || '').toString();
            
                  if (form.__illegalRetryCount === 0) {
                    form.__originalContent = currentInput;
                  }
            
                  if (form.__illegalRetryCount >= maxRetriesAll) {
                    toast('unvcode替换后仍提交失败，已恢复原始文本，请手动处理', 3000);
                    if (textarea && form.__originalContent != null) {
                      textarea.value = form.__originalContent;
                    }
                    resetCacheForFailedContent(form.__originalContent);
                    form.__originalContent = null;
                    form.__illegalRetryCount = 0;
                    return;
                  }
            
                  let safeText;
                  if (form.__illegalRetryCount < normalRetries) {
                    safeText = processTextPreservingHiddenTags(currentInput, (segment) => unvcodeSelective(segment));
                  } else {
                    safeText = processTextPreservingHiddenTags(currentInput, (segment) => fallbackInsertZWSP(segment));
                  }
            
                  const shouldRetry =
                    (form.__illegalRetryCount < normalRetries && safeText !== currentInput)
                    || (form.__illegalRetryCount === fallbackRetryIndex);
            
                  if (shouldRetry) {
                    toast('已尝试unvcode替换模式并重试提交', 2000);
                    const newFD = new FormData(form);
                    newFD.set('content', safeText);
                    form.__illegalRetryCount++;
                    doSubmit(newFD, false);
                    return;
                  }
                  toast(msg);
                }
              } else {
                toast(msg);
              }
            }
          }

        })
        .catch((err) => {
          console.error('[interceptReplyForm] fetch error:', err);
          if (err.name === 'TypeError' && /fetch|network/i.test(err.message)) {
            toast('发送超时，请检查网络后重试');
          } else {
            toast('发送失败：' + (err.message || '未知错误'));
          }
        });
      }
      // 防重复提交
      if (form.__submitting) {
        toast('发送中，请勿重复提交……');
        return;
      }
      form.__submitting = true;

      // 每次用户触发的新提交，重置重试计数并记录当前原始内容
      resetIllegalRetryState({ clearOriginalContent: false });
      const textarea = form.querySelector('textarea[name="content"]');
      form.__originalContent = textarea
        ? textarea.value
        : (formData.get('content') || '').toString();
      toast('正在发送……');
      doSubmit(formData, false).finally(() => { form.__submitting = false; });
    }, true);

    // ————— helpers —————
    function getRealThreadsList(root = document) {
      const lists = Array.from(root.querySelectorAll('.h-threads-list'));
      return lists.find(el => !el.closest('.h-preview-box')) || null;
    }

    function getCurrentPage() {
      const sp = new URL(location.href, location.origin).searchParams;
      return parseInt(sp.get('page') || '1', 10);
    }

    function getMaxPageFromPagination() {
      const paginations = Array.from(document.querySelectorAll('.uk-pagination.uk-pagination-left.h-pagination'));
      if (!paginations.length) return null;
      const last = paginations[paginations.length - 1];
      let max = 1;
      last.querySelectorAll('a[href*="page="]').forEach(a => {
        const m = a.href.match(/[?&]page=(\d+)/);
        if (m) max = Math.max(max, parseInt(m[1], 10));
      });
      last.querySelectorAll('li, span').forEach(el => {
        const nums = (el.textContent || '').match(/\d+/g);
        if (nums) nums.forEach(n => max = Math.max(max, parseInt(n, 10)));
      });
      return max || null;
    }

    function getMaxClonedPageInDOM() {
      const nodes = document.querySelectorAll('.h-threads-item-replies[data-cloned-page]');
      let max = 0;
      nodes.forEach(el => {
        const n = parseInt(el.getAttribute('data-cloned-page'), 10);
        if (!isNaN(n)) max = Math.max(max, n);
      });
      return max;
    }

    function minimalHideEmptyTitleAndEmail(root) {
      if (!root || !root.querySelectorAll) return;
      Array.from(root.querySelectorAll('.h-threads-info-title')).forEach(el => {
        const txt = (el.textContent || '').trim();
        if (!txt || txt === '无标题' || /^无标题/i.test(txt)) {
          el.style.display = 'none';
        }
      });
      Array.from(root.querySelectorAll('.h-threads-info-email')).forEach(el => {
        const txt = (el.textContent || '').trim();
        if (!txt || txt === '无名氏' || /^无名氏/i.test(txt)) {
          el.style.display = 'none';
        }
      });
    }

    // done 将拦截中间页-局部刷新修改为增量模式
    function refreshRepliesWithSeamlessPaging(done) {
      const currentPage = getCurrentPage();
      const maxPage = getMaxPageFromPagination();
      const maxCloned = getMaxClonedPageInDOM();
      let targetPage = null;

      if ((maxPage && maxCloned === maxPage && maxCloned > 0) || (!maxPage && maxCloned > 0)) {
        targetPage = maxCloned;
      } else if (maxPage && currentPage === maxPage && maxCloned === 0) {
        targetPage = null;
      } else {
        if (typeof done === 'function') done();
        return;
      }

      const list = getRealThreadsList(document);
      if (!list) {
        toast('未找到真实列表，无法刷新回复区');
        if (typeof done === 'function') done();
        return;
      }

      let targetReplies = targetPage
        ? list.querySelector(`.h-threads-item-replies[data-cloned-page="${targetPage}"]`)
        : list.querySelector('.h-threads-item-replies:not([data-cloned-page])');

      // 如果没有找到回复区（无回复时只有主串），自动创建回复区容器
      if (!targetReplies) {
        const threadItem = list.querySelector('.h-threads-item');
        if (threadItem) {
          targetReplies = document.createElement('div');
          targetReplies.className = 'h-threads-item-replies';
          if (targetPage) {
            targetReplies.setAttribute('data-cloned-page', String(targetPage));
          }
          threadItem.appendChild(targetReplies);
          console.log('[refreshRepliesWithSeamlessPaging] 已创建空的回复区容器');
        } else {
          toast('未找到目标回复区');
          if (typeof done === 'function') done();
          return;
        }
      }

      let fetchUrl;
      if (targetPage) {
        const url = new URL(location.href, location.origin);
        url.searchParams.set('page', String(targetPage));
        fetchUrl = url.toString();
      } else {
        fetchUrl = location.href;
      }

      fetch(fetchUrl, { credentials: 'include' })
        .then(res => res.text())
        .then(html => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const newList = getRealThreadsList(doc);
          if (!newList) {
            toast('未找到最新列表');
            if (typeof done === 'function') done();
            return;
          }
          const newReplies = newList.querySelector('.h-threads-item-replies');
          if (!newReplies) {
            toast('未找到最新回复区');
            if (typeof done === 'function') done();
            return;
          }

          // ——— 离线处理（关键） ———
          const cfg2 = (typeof safeGetConfig === 'function') ? safeGetConfig() : null;

          // 先准备一个离线 fragment（仅作为工作台，不再整体套用 innerHTML）
          const fragment = document.createElement('div');
          fragment.innerHTML = newReplies.innerHTML;

          // 排除系统提示类回复（tips）
          Array.from(fragment.querySelectorAll('.h-threads-item-reply[data-threads-id="9999999"]'))
            .forEach(el => el.remove());

          // 离线预处理：对 fragment 做一次过滤（主要保证新增项的 DOM 是处理过的）
          try {
            if (typeof hideEmptyTitleAndEmail === 'function') hideEmptyTitleAndEmail($(fragment));
            if (cfg2 && typeof applyFilters === 'function') applyFilters(cfg2, fragment);
          } catch (e) {
            console.warn('预处理过滤失败', e);
          }

          // === 改为增量新增：比较新旧回复差异，只添加缺失部分，避免覆盖 h-active ===

          // 1) 收集当前目标区原有的回复 ID（排除系统提示）
          const oldItems = Array.from(targetReplies.querySelectorAll('.h-threads-item-reply[data-threads-id]'));
          const oldIdSet = new Set(
            oldItems
              .map(i => i.getAttribute('data-threads-id'))
              .filter(id => id && id !== '9999999')
          );

          // 2) 收集新页面的回复项（使用 newReplies，而非 fragment，以维持服务器顺序）
          const newItems = Array.from(newReplies.querySelectorAll('.h-threads-item-reply[data-threads-id]'))
            .filter(i => i.getAttribute('data-threads-id') !== '9999999');

          // 3) 逐项比较，把新页面中不存在于旧页面的项依顺序追加（保持服务器顺序）
          const appendedNodes = [];
          for (const item of newItems) {
            const tid = item.getAttribute('data-threads-id');
            if (!oldIdSet.has(tid)) {
              // 新增回复项：克隆并追加到 targetReplies 末尾
              const node = item.cloneNode(true);
              targetReplies.appendChild(node);
              appendedNodes.push(node);
            }
          }

          // 4) 针对“新增的节点”做精细化处理，避免全局覆盖旧节点状态
          try {
            // 立即处理新增节点，降低闪烁
            if (typeof hideEmptyTitleAndEmail === 'function') {
              appendedNodes.forEach(n => { try { hideEmptyTitleAndEmail($(n)); } catch (_) {} });
            }
            if (cfg2 && typeof applyFilters === 'function') {
              appendedNodes.forEach(n => { try { applyFilters(cfg2, n); } catch (_) {} });
            }
            if (typeof enablePostExpand === 'function') {
              appendedNodes.forEach(n => { try { enablePostExpand(n); } catch (_) {} });
            }
          } catch (e) {
            // 局部处理不影响整体流程
          }

          // 延迟执行其他增强
          setTimeout(() => {
            // 统一走公共增强函数，确保与无缝翻页保持一致（包括 applyImageHideMode）
            try {
              if (typeof applyPageEnhancements === 'function') {
                applyPageEnhancements(targetReplies, cfg2 || (typeof safeGetConfig === 'function' ? safeGetConfig() : null));
              } else {
                // 兜底（极端情况下公共函数不可用）
                try { if (typeof hideEmptyTitleAndEmail === 'function') hideEmptyTitleAndEmail($(targetReplies)); } catch (e) {}
                try { if (typeof highlightPO === 'function') highlightPO(); } catch (e) {}
                try { if (typeof enableHDImageAndLayoutFix === 'function') enableHDImageAndLayoutFix(document); } catch (e) {}
                try { if (typeof enableHDImage === 'function') enableHDImage(document); } catch (e) {}
                try { if (typeof initContent === 'function') initContent(targetReplies); } catch (e) {}
              }
            } catch (e) {}
          }, 50);

          // 同步更新底部分页栏
          const newPags = doc.querySelectorAll('ul.uk-pagination.uk-pagination-left.h-pagination');
          const newPag = newPags.length ? newPags[newPags.length - 1] : null;
          const oldPags = document.querySelectorAll('ul.uk-pagination.uk-pagination-left.h-pagination');
          const oldPag = oldPags.length ? oldPags[oldPags.length - 1] : null;

          if (newPag && oldPag) {
            // 1. 判断发送前是否为最后一页（下一页按钮是 uk-disabled 且无链接）
            const oldNextLi = Array.from(oldPag.querySelectorAll('li')).find(li =>
              /下一页|下页|Next|›|»|→/i.test(li.textContent.trim())
            );
            const wasLastPage = oldNextLi &&
              oldNextLi.classList.contains('uk-disabled') &&
              !oldNextLi.querySelector('a');

            // 替换 DOM
            try {
              oldPag.innerHTML = newPag.innerHTML;
            } catch (e) {
              oldPag.replaceWith(newPag.cloneNode(true));
            }

            // 2. 如果发送前是最后一页，检查刷新后是否出现了新页
            if (wasLastPage) {
              const newNextLi = Array.from(newPag.querySelectorAll('li')).find(li =>
                /下一页|下页|Next|›|»|→/i.test(li.textContent.trim())
              );
              const hasNewPage = newNextLi &&
                !newNextLi.classList.contains('uk-disabled') &&
                !!newNextLi.querySelector('a');

              if (hasNewPage) {
                // 提取新页码
                const nextLink = newNextLi.querySelector('a');
                const nextPageMatch = nextLink ? nextLink.href.match(/page=(\d+)/) : null;
                const nextPageNum = nextPageMatch ? parseInt(nextPageMatch[1], 10) : null;

                if (nextPageNum) {
                  toast(`发现${nextPageNum}页，正在加载……`);

                  // 触发无缝翻页
                  if (window.SeamlessPaging && typeof window.SeamlessPaging.loadNext === 'function') {
                    setTimeout(() => {
                      window.SeamlessPaging.loadNext();
                    }, 100);
                  }
                }
              }
            }
          }

          // 4) 如果某些 filter 只能作用于 document（没有 root 参数），此处再做一次全局调用（尽量放到最后）
          try {
            if (cfg2 && typeof applyFilters === 'function') {
              try { refreshFilterDisplay(cfg2); } catch (e) { /* 忽略 */ }
            }
          } catch (e) {}

          if (typeof done === 'function') done();
        })
        .catch(() => {
          toast('刷新回复区失败');
          if (typeof done === 'function') done();
        });
    }

    function safeGetConfig() {
      try {
        if (typeof SettingPanel !== 'undefined' && typeof GM_getValue === 'function') {
          const defaults = SettingPanel.defaults || {};
          const saved = GM_getValue(SettingPanel.key, {}) || {};
          return Object.assign({}, defaults, saved);
          }
       } catch (e) {}
       return null;
    }
  }

  function isCookieDropdownShortcut(e) {
    return !!(e && e.ctrlKey && (e.code === 'Backslash' || e.code === 'IntlBackslash' || e.key === '\\'));
  }

  function logCookieDropdownShortcutStage(stage, detail) {
    try {
      console.log('[XDEX cookie shortcut]', stage, Object.assign({ runtime: XDEX_RUNTIME && XDEX_RUNTIME.kind }, detail || {}));
    } catch (e) {}
  }

  function openCookieDropdownFromShortcut(focusBackTarget) {
    const dropdown = document.getElementById('cookie-dropdown');
    if (!dropdown) {
      logCookieDropdownShortcutStage('dropdown-missing', {
        activeTag: document.activeElement && document.activeElement.tagName,
        textareas: document.querySelectorAll('form textarea[name="content"]').length,
        switcher: !!document.getElementById('cookie-switcher-ui')
      });
      return false;
    }
    dropdown.__focusBackTarget = focusBackTarget || document.activeElement || null;
    dropdown.__openedValue = dropdown.value;
    dropdown.focus();
    logCookieDropdownShortcutStage('dropdown-focus', {
      options: dropdown.options ? dropdown.options.length : 0,
      value: dropdown.value,
      hasShowPicker: typeof dropdown.showPicker === 'function'
    });
    if (XDEX_RUNTIME && XDEX_RUNTIME.kind === 'extension') {
      return openCookieShortcutMenu(dropdown, focusBackTarget);
    }
    if (typeof dropdown.showPicker === 'function') {
      try {
        dropdown.showPicker();
        logCookieDropdownShortcutStage('showPicker-called');
        return true;
      } catch (e) {
        logCookieDropdownShortcutStage('showPicker-failed', { message: e && e.message ? e.message : String(e) });
      }
    }
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    dropdown.dispatchEvent(mouseDownEvent);
    logCookieDropdownShortcutStage('fallback-mousedown-dispatched');
    return true;
  }

  function installCookieDropdownShortcutHandler() {
    if (installCookieDropdownShortcutHandler.__installed) return;
    installCookieDropdownShortcutHandler.__installed = true;
    logCookieDropdownShortcutStage('handler-installed');
    function onCookieDropdownShortcutKeydown(e) {
      if (e && e.ctrlKey) {
        logCookieDropdownShortcutStage('ctrl-keydown', { key: e.key, code: e.code, targetTag: e.target && e.target.tagName });
      }
      if (!isCookieDropdownShortcut(e)) return;
      logCookieDropdownShortcutStage('shortcut-matched', { key: e.key, code: e.code });
      if (!openCookieDropdownFromShortcut(document.activeElement)) return;
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
    }
    document.addEventListener('keydown', onCookieDropdownShortcutKeydown, true);
  }

  // 绑定 Ctrl+Enter 快捷提交表单 + 全局打开浮窗
  function bindCtrlEnter(ta) {
    if (!ta || ta.__ctrlEnterBound) return;
    const form = ta.closest('form');
    if (!form) return;

    ta.__ctrlEnterBound = true;

    // 焦点在 textarea 内时：Ctrl+Enter 提交，Ctrl+\ 打开 cookie 下拉框
    ta.addEventListener('keydown', function (e) {
      // Ctrl+Enter 提交表单
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') {
          e.stopImmediatePropagation();
        }
        try { form.requestSubmit(); } catch (_) { form.submit(); }
      }

      // Ctrl+\ 打开 cookie 下拉框
      if (isCookieDropdownShortcut(e)) {
        if (openCookieDropdownFromShortcut(ta)) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof e.stopImmediatePropagation === 'function') {
            e.stopImmediatePropagation();
          }
        }
      }

      // Ctrl+/ 打开颜文字选择框
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        e.stopPropagation();
        const kaomojiTrigger = document.querySelector('.kaomoji-trigger');
        if (kaomojiTrigger) {
          kaomojiTrigger.click();
        }
      }
    });
    // 全局监听：Ctrl+Enter 打开浮窗
    document.addEventListener('keydown', function (e) {
      // Ctrl + Enter 打开浮窗（已有逻辑）
      if (e.ctrlKey && e.key === 'Enter') {
        const active = document.activeElement;
        const isTextarea = active && active.tagName === 'TEXTAREA';
        if (!isTextarea) {
          e.preventDefault();
          e.stopPropagation();
          const replyBtn = document.querySelector('.hld__docker [data-type="REPLY"]');
          if (replyBtn) replyBtn.click();
        }
      }
    }, false);

  }

  /* --------------------------------------------------
   * tag 12. 高亮Po主+回复表单UI调整
   * -------------------------------------------------- */
  // 高亮 Po 主（内置并先执行楼层编号）
  function highlightPO() {
    return startupPerfDebug.measure('highlightPO', () => {
    const poTextColor  = '#00FFCC'; // Po 本体颜色
    const iconWidthEm  = 3.0;       // 所有图标统一宽度

    // 子函数：先为当前页面所有回复区编号（原 updateReplyNumbers 逻辑）
    function updateReplyNumbersLocal() {
      document.querySelectorAll('.h-threads-item-replies').forEach(replies => {
        let effectiveCount = 0;
        replies.querySelectorAll('.h-threads-item-reply-icon').forEach(icon => {
          const reply = icon.closest('[data-threads-id]');
          if (!reply) return;

          if (reply.getAttribute('data-threads-id') === '9999999') {
            // 特殊：小提示串号 -> 编号 0
            icon.textContent = circledNumber(0);
          } else {
            // 普通回复 -> 依次递增
            effectiveCount++;
            icon.textContent = `『${effectiveCount}』`;
          }
        });
      });
    }

    // 统一设置所有回复图标的宽度与基础样式
    document.querySelectorAll('.h-threads-item-reply-icon').forEach(icon => {
      icon.style.display = 'inline-block';
      icon.style.width = iconWidthEm + 'em';
      icon.style.textAlign = 'center';
      icon.style.position = 'relative';
      icon.style.fontWeight = 'normal';
    });

    // 先编号，再做 Po 标替换
    updateReplyNumbersLocal();

    // 替换 PO 回复的数字为 Po，并加角标
    document.querySelectorAll('.h-threads-item-reply').forEach(reply => {
      const main = reply.querySelector('.h-threads-item-reply-main');
      const icon = reply.querySelector('.h-threads-item-reply-icon');
      if (!main || !icon) return;

      const isPO = !!main.querySelector('span.uk-text-primary.uk-text-small');
      if (!isPO) return;

      let html = icon.innerHTML;
      const m = html.match(/『(\d+)』/);
      if (!m) return;

      const originalNumber = m[1]; // 原数字
      const poHTML = `『<span style="color:${poTextColor}; font-weight:bold">Po</span>』`;

      // 替换数字为 Po
      html = html.replace(m[0], poHTML);
      icon.innerHTML = html;

      // 角标（避免重复添加）
      if (!icon.querySelector('.po-n-badge')) {
        const badge = document.createElement('span');
        badge.className = 'po-n-badge';
        badge.textContent = originalNumber;
        Object.assign(badge.style, {
          position: 'absolute',
          top: '-0.55em',
          right: '-0.6em',
          fontSize: '10px',
          lineHeight: '1',
          fontWeight: '600',
          color: 'initial',
          background: 'transparent',
          pointerEvents: 'none',
        });
        icon.appendChild(badge);
      }
    });
    }, () => startupPerfDebug.summarizeRoot(document));
  }

  // 初次执行
  highlightPO();

  //回复表单UI调整
  function enhancePostFormLayout() {
     const form = document.querySelector('form[action*="doReplyThread"], form[action*="doPostThread"]');

      if (!form) return;

      // 定位“标题”行与“颜文字”行
      const allRows = Array.from(form.querySelectorAll('.h-post-form-grid'));
      let titleRow = null, emoticonRow = null;

      for (const row of allRows) {
        const titleText = row.querySelector('.h-post-form-title')?.textContent?.trim() || '';
        if (titleText === '标题') titleRow = row;
        if (row.querySelector('.kaomoji-trigger') || row.querySelector('#h-emot-select')) {
          emoticonRow = row;
        }
      }

      // 1) 先把送出按钮移到“颜文字”行，并让整行用 flex 不换行，按钮推到行最右
      if (titleRow && emoticonRow) {
        const sendBtnCell = titleRow.querySelector('.h-post-form-option');
        const sendBtn = sendBtnCell?.querySelector('input[type="submit"]');
        if (sendBtn) {
          // 让“颜文字”整行用 flex 布局，禁止换行，垂直居中
          Object.assign(emoticonRow.style, {
            display: 'flex',
            flexWrap: 'nowrap',
            alignItems: 'center',
            width: '100%'
          });

          // 创建一个右侧容器，使用 margin-left:auto 将其推到最右
          const btnWrapper = document.createElement('div');
          Object.assign(btnWrapper.style, {
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center'
          });
          btnWrapper.appendChild(sendBtn);

          // 将按钮容器添加到“颜文字”行
          emoticonRow.appendChild(btnWrapper);
        }
      }

      // 2) 折叠「标题 / 名称(含管理员) / E-mail」为一个折叠面板，并固定顺序
      // 重新抓一次，避免移动节点导致 NodeList 顺序问题
      const freshRows = Array.from(form.querySelectorAll('.h-post-form-grid'));
      const norm = (s) => String(s || '').replace(/[\s-]+/g, '').toLowerCase();
      const rowMap = new Map();

      for (const row of freshRows) {
        const label = row.querySelector('.h-post-form-title')?.textContent || '';
        const k = norm(label);
        if (k === '标题') rowMap.set('title', row);
        else if (k === '名称') rowMap.set('name', row); // 原文“名 称”会被规整成“名称”
        else if (k === 'email') rowMap.set('email', row); // 原文 “E-mail”
      }

      const rowsToCollapse = ['title', 'name', 'email']
        .map(k => rowMap.get(k))
        .filter(Boolean);

      // 关闭浏览器推荐填充（title/name/email）
      form.setAttribute('autocomplete', 'off');
      const noPersistInputs = rowsToCollapse.flatMap(row =>
        Array.from(row.querySelectorAll('input[type="text"], textarea'))
      );
      noPersistInputs.forEach(input => {
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('spellcheck', 'false');
      });

      if (rowsToCollapse.length) {
        const wrapper = document.createElement('div');
        wrapper.className = 'collapse-wrapper';
        wrapper.style.width = '100%';

        // 将折叠目标打包进容器
        rowsToCollapse[0].before(wrapper);
        rowsToCollapse.forEach(r => wrapper.appendChild(r));

        // 使用现有 collapse 能力（依赖 jQuery）
        if (typeof Utils !== 'undefined' && typeof Utils.collapse === 'function' && typeof $ === 'function') {
          Utils.collapse($(wrapper), '可选项');
        }
      }
    }

  /* --------------------------------------------------
   * tag 13. 颜文字增强-光标处插入/选择框优化/额外颜文字拓展
   * -------------------------------------------------- */
  function kaomojiEnhancer() {
      const SELECTOR = '#h-emot-select';
      let enhanceScheduled = false;

      function runKaomojiEnhancePass() {
        initInsertAtCaret();      // 功能 1：颜文字插入光标处
        extendKaomojiSet();       // 功能 3：颜文字样式拓展，先补稳定 key
        optimizeSelectorStyle();  // 功能 2：选择框样式优化，基于稳定 key 渲染排序
      }

      function scheduleKaomojiEnhancePass() {
        if (enhanceScheduled) return;
        enhanceScheduled = true;
        setTimeout(() => {
          enhanceScheduled = false;
          runKaomojiEnhancePass();
        }, 0);
      }

      function observeKaomojiSelects() {
        if (kaomojiEnhancer.__selectObserverInstalled) return;
        const observeRoot = document.body || document.documentElement;
        if (!observeRoot) return;
        kaomojiEnhancer.__selectObserverInstalled = true;

        const observer = new MutationObserver(mutations => {
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes || []) {
              if (!node || node.nodeType !== 1) continue;
              if ((node.matches && node.matches(SELECTOR)) || (node.querySelector && node.querySelector(SELECTOR))) {
                scheduleKaomojiEnhancePass();
                return;
              }
            }
          }
        });
        observer.observe(observeRoot, { childList: true, subtree: true });
      }

      // 初始化所有功能
      runKaomojiEnhancePass();
      observeKaomojiSelects();

      /**
       * 功能 1：选择颜文字后插入到光标位置
       */
      // BUG:win7与部分win10环境下颜文字插入两次。
      function initInsertAtCaret() {
        const SELECTOR = '#h-emot-select';
        const TA_SELECTOR = 'textarea.h-post-form-textarea[name="content"]';

        document.querySelectorAll(SELECTOR).forEach(select => {
            if (select.dataset.kaoBound === '1') return;
            select.dataset.kaoBound = '1';

            const form = select.closest('form');
            const textarea = form ? form.querySelector(TA_SELECTOR) : null;
            if (!textarea) return;

            let lastStart = 0;
            let lastEnd = 0;

            // 记录光标位置
            const remember = () => {
                lastStart = textarea.selectionStart ?? lastStart;
                lastEnd = textarea.selectionEnd ?? lastEnd;
            };

            ['keyup', 'mouseup', 'select', 'input', 'focus', 'blur'].forEach(ev =>
                textarea.addEventListener(ev, remember, true)
            );

            // 只在 select 上监听 focus 相关事件来记录位置
            ['focus', 'mousedown'].forEach(ev =>
                select.addEventListener(ev, remember, true)
            );

            // 防抖保护
            let isInserting = false;

            // 用 change 事件来触发插入
            select.addEventListener('change', e => {
              e.stopImmediatePropagation();
              e.preventDefault();
              e.stopPropagation();

              if (isInserting) return;

              const val = select.value;
              if (!val) return;

              // ★ 在插入前强制记忆一次光标位置
              remember();

              isInserting = true;
              insertAtCaret(textarea, val, lastStart, lastEnd);

              setTimeout(() => {
                select.value = '';
                isInserting = false;
              }, 50);

              textarea.focus();
            }, true);

            // 移除 change 事件的监听，避免重复触发
            select.addEventListener('change', function(e) {
                e.stopImmediatePropagation();
                e.preventDefault();
                e.stopPropagation();
            }, true);

            // 移除原生 jQuery change handler，防止双重插入
            try {
                const jqEvents = $._data(select, 'events');
                if (jqEvents && jqEvents.change) {
                    delete jqEvents.change;
                }
            } catch (e) {}

            function insertAtCaret(textarea, text, selStart, selEnd) {
                // 记录插入前的滚动位置
                const prevScrollTop = textarea.scrollTop;
                // 确定插入位置
                let start = Number.isInteger(selStart) ? selStart : textarea.selectionStart;
                let end   = Number.isInteger(selEnd)   ? selEnd   : textarea.selectionEnd;
                if (!Number.isInteger(start) || !Number.isInteger(end)) {
                    start = end = textarea.value.length;
                }
                // 优先用 execCommand 插入（保留浏览器撤销历史，支持 Ctrl+Z）
                textarea.focus();
                textarea.setSelectionRange(start, end);
                const success = document.execCommand('insertText', false, text);
                if (!success) {
                    // 回退：execCommand 不可用时走原逻辑
                    const before = textarea.value.slice(0, start);
                    const after  = textarea.value.slice(end);
                    textarea.value = before + text + after;
                    const newPos = start + text.length;
                    textarea.setSelectionRange(newPos, newPos);
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                }
                // 恢复滚动条位置
                textarea.scrollTop = prevScrollTop;
                // 更新记忆位置（execCommand 后光标自动在插入文本末尾）
                lastStart = lastEnd = textarea.selectionStart;
            }
        });
    }

      /**
       * 功能 2：颜文字选择框样式优化
       */
      function optimizeSelectorStyle() {
        const GAP = 4;               // 单元格间距（缩小）
        const CHAR_W = 14;           // 每个字宽度（px）
        const CHAR_H = 16;           // 每个字高度（px）
        const PAD = 6;               // 浮窗内边距（缩小）
        const ITEM_W = CHAR_W * 6 + 6; // 大约半个长颜文字宽度
        const ITEM_H = CHAR_H * 2 + 4; // 不超过两行字高
        const KAO_STATS_KEY = 'kaomojiUsageStats';
        let kaomojiStatsReadable = true;

        function getSortMode() {
          try {
            const stateMode = SettingPanel && SettingPanel.state && SettingPanel.state.kaomojiSort;
            if (stateMode === 'default' || stateMode === 'recent' || stateMode === 'freq') return stateMode;
          } catch (e) {}

          try {
            const cfg = Object.assign({}, SettingPanel.defaults, GM_getValue(SettingPanel.key, {}));
            const mode = cfg.kaomojiSort || 'default';
            return (mode === 'default' || mode === 'recent' || mode === 'freq') ? mode : 'default';
          } catch (e) {
            return 'default';
          }
        }

        function loadKaomojiStats() {
          try {
            const v = GM_getValue(KAO_STATS_KEY, {});
            kaomojiStatsReadable = !!(v && typeof v === 'object');
            return kaomojiStatsReadable ? v : {};
          } catch (e) {
            kaomojiStatsReadable = false;
            return {};
          }
        }

        function saveKaomojiStats(stats) {
          if (!kaomojiStatsReadable) return;
          try { GM_setValue(KAO_STATS_KEY, stats || {}); } catch (e) {}
        }

        function normalizeKaomojiValue(v) {
          return String(v == null ? '' : v).replace(/\r\n/g, '\n');
        }

        function kaomojiKeyFromOption(opt) {
          const stableKey = (opt?.dataset?.kaoKey || '').trim();
          if (stableKey) return `sk:${stableKey}`;
          const text = (opt?.textContent || '').trim();
          const value = normalizeKaomojiValue(opt?.value);
          // 用“显示文本 + 实际值”作为唯一键，避免脚本扩展颜文字（尤其富文本）统计丢失或冲突
          return `k:${text}\nv:${value}`;
        }

        function syncKaomojiStatsWithOptions(options) {
          const stats = loadKaomojiStats();
          const keysOnPage = new Set();

          // 收集当前页面所有颜文字 key（而非仅当前 select），避免多 select 场景误删扩展项统计
          document.querySelectorAll(SELECTOR).forEach(sel => {
            Array.from(sel.options || []).forEach(opt => {
              const label = (opt?.textContent || '').trim();
              if (!label || label === '无') return;
              keysOnPage.add(kaomojiKeyFromOption(opt));
            });
          });

          options.forEach(opt => {
            const label = (opt?.textContent || '').trim();
            const key = kaomojiKeyFromOption(opt);
            if (!label || label === '无') return;

            // 兼容旧版本（仅按 text 存储）统计，迁移到新 key
            const legacyKey = label;
            if (!stats[key] && stats[legacyKey] && typeof stats[legacyKey] === 'object') {
              stats[key] = {
                count: Number(stats[legacyKey].count) || 0,
                lastUsed: Number(stats[legacyKey].lastUsed) || 0
              };
              delete stats[legacyKey];
            }

            const fallbackKey = `k:${label}\nv:${normalizeKaomojiValue(opt?.value)}`;
            if (key !== fallbackKey && !stats[key] && stats[fallbackKey] && typeof stats[fallbackKey] === 'object') {
              stats[key] = {
                count: Number(stats[fallbackKey].count) || 0,
                lastUsed: Number(stats[fallbackKey].lastUsed) || 0
              };
              delete stats[fallbackKey];
            }

            if (!stats[key]) stats[key] = { count: 0, lastUsed: 0 };
            if (!Number.isFinite(Number(stats[key].count))) stats[key].count = 0;
            if (!Number.isFinite(Number(stats[key].lastUsed))) stats[key].lastUsed = 0;
          });

          // 不主动删除缺失 key：时间线等场景下，扩展颜文字可能晚于首次渲染注入，
          // 若此处清理会把“扩展项统计”反复删掉，表现为计数长期为 0。
          // 如需清理可后续增加手动/定时 GC，而不是在每次渲染时做强清理。

          saveKaomojiStats(stats);
          return stats;
        }

        function recordKaomojiUsage(opt) {
          const label = (opt?.textContent || '').trim();
          const key = kaomojiKeyFromOption(opt);
          if (!label || label === '无') return;
          const stats = loadKaomojiStats();
          if (!stats[key]) stats[key] = { count: 0, lastUsed: 0 };
          stats[key].count = (Number(stats[key].count) || 0) + 1;
          stats[key].lastUsed = Date.now();
          saveKaomojiStats(stats);
        }

        function getSortedKaomojiOptions(select) {
          const mode = getSortMode();
          const all = Array.from(select.options || []);
          const base = all
            .filter(opt => (opt.textContent || '').trim() !== '无')
            .map((opt, idx) => ({
              opt,
              idx,
              key: kaomojiKeyFromOption(opt)
            }));

          const stats = syncKaomojiStatsWithOptions(base.map(x => x.opt));

          if (mode === 'freq') {
            base.sort((a, b) => {
              const sa = stats[a.key] || { count: 0, lastUsed: 0 };
              const sb = stats[b.key] || { count: 0, lastUsed: 0 };
              const dc = (Number(sb.count) || 0) - (Number(sa.count) || 0);
              if (dc !== 0) return dc;
              // 常用模式：频次相同 -> 最近使用优先
              const dt = (Number(sb.lastUsed) || 0) - (Number(sa.lastUsed) || 0);
              if (dt !== 0) return dt;
              // 最近时间也相同（如未使用项 1970） -> 默认顺序
              return a.idx - b.idx;
            });
            return base.map(x => x.opt);
          }

          if (mode === 'recent') {
            const used = [];
            const unused = [];
            base.forEach(x => {
              const st = stats[x.key] || { count: 0, lastUsed: 0 };
              if ((Number(st.lastUsed) || 0) > 0) used.push(x);
              else unused.push(x);
            });

            used.sort((a, b) => {
              const sa = stats[a.key] || { count: 0, lastUsed: 0 };
              const sb = stats[b.key] || { count: 0, lastUsed: 0 };
              const dt = (Number(sb.lastUsed) || 0) - (Number(sa.lastUsed) || 0);
              if (dt !== 0) return dt;
              const dc = (Number(sb.count) || 0) - (Number(sa.count) || 0);
              if (dc !== 0) return dc;
              return a.idx - b.idx;
            });

            // 未使用保持默认顺序（均视作 1970-01-01 00:00:00）
            return used.concat(unused).map(x => x.opt);
          }

          // default：保持原顺序
          return base.map(x => x.opt);
        }

        const selects = document.querySelectorAll(SELECTOR);
        if (!selects.length) return;

        // 注入样式（只注入一次）
        if (!document.getElementById('kaomoji-style')) {
            const style = document.createElement('style');
            style.id = 'kaomoji-style';
            style.textContent = `
                .kaomoji-trigger {
                    display: inline-flex;
                    align-items: center;
                    height: 26px;
                    line-height: 26px;
                    padding: 0 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    background: #fff;
                    cursor: pointer;
                    white-space: nowrap;
                    user-select: none;
                }
                .kaomoji-panel {
                    position: fixed;
                    z-index: 2147483647;
                    display: none;
                    grid-template-columns: repeat(auto-fill, minmax(${ITEM_W}px, 1fr));
                    gap: ${GAP}px;
                    padding: ${PAD}px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    background: #fff;
                    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
                    box-sizing: border-box;
                    overflow-y: auto;

                    /* 关键调整 */
                    width: auto; /* 宽度由 JS 按 qp-quote 动态设置 */
                    max-width: calc(100vw - ${PAD * 2}px); /* 不超过视口宽度 */
                    min-width: ${ITEM_W}px; /* 至少一列 */
                    max-height: calc(${ITEM_H}px * 5 + ${GAP}px * 4 + ${PAD}px * 2);
                }
                .kaomoji-item {
                    width: ${ITEM_W}px;
                    height: ${ITEM_H}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2px;
                    border-radius: 4px;
                    cursor: pointer;
                    user-select: none;
                    text-align: center;
                    font-size: 14px;
                    line-height: 1.2;
                    word-break: break-word;
                }
                /* 禁用默认 focus 白框/发白 */
                .kaomoji-item:focus {
                  outline: none;
                }
                /* 鼠标悬停：仅变色，不显示蓝框（避免与键盘选中混淆） */
                .kaomoji-item:hover {
                  background: #f2f2f2;
                }
                /* 键盘选中：变色 + 蓝框（专属样式） */
                .kaomoji-item.kaomoji-active {
                  background: #e0e0e0;
                  outline: 2px solid #66ccff;
                  outline-offset: -2px;
                }
            `;
            document.head.appendChild(style);
        }

        selects.forEach(select => {
            if (select.dataset.kaoStyled === '1') return;
            select.dataset.kaoStyled = '1';

            select.style.display = 'none';

            const trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'kaomoji-trigger';
            trigger.textContent = '选择颜文字';

            // 颜文字按钮右侧快捷排序下拉（复制设置面板的 #sp_kaomojiSort）
            const quickSort = document.createElement('select');
            quickSort.className = 'sp_kaomojiSort_copy';
            quickSort.setAttribute('data-copy-of', 'sp_kaomojiSort');
            quickSort.style.height = '26px';
            quickSort.style.marginLeft = '6px';
            quickSort.style.flex = '0 0 auto';

            // 复制设置面板中的下拉项；若面板未渲染则使用同款兜底项
            const panelSort = document.querySelector('#sp_kaomojiSort');
            if (panelSort && panelSort.options && panelSort.options.length) {
              Array.from(panelSort.options).forEach(op => {
                quickSort.appendChild(new Option(op.textContent, op.value));
              });
            } else {
              quickSort.appendChild(new Option('默认', 'default'));
              quickSort.appendChild(new Option('最近', 'recent'));
              quickSort.appendChild(new Option('常用', 'freq'));
            }
            quickSort.value = getSortMode();

            const panel = document.createElement('div');
            panel.className = 'kaomoji-panel';
            //panel.tabIndex = -1; // 👈 添加：使 panel 可以接收焦点

            function renderPanelItems() {
              while (panel.firstChild) panel.removeChild(panel.firstChild);

              const options = getSortedKaomojiOptions(select);
              options.forEach(opt => {
                const item = document.createElement('div');
                item.className = 'kaomoji-item';
                item.textContent = opt.textContent;
                item.dataset.value = opt.value;
                item.tabIndex = -1; // 使 item 可聚焦，避免 focus 时“发白/丢焦点”
                item.addEventListener('click', () => {
                  recordKaomojiUsage(opt); // 无论是否开启排序都记录
                  select.value = opt.value;
                  select.dispatchEvent(new Event('change', { bubbles: true }));
                  trigger.textContent = opt.textContent || '选择颜文字';
                  hidePanel();
                });
                item.addEventListener('contextmenu', async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  try {
                    await writeClipboardText(opt.value, null);
                    toast('颜文字已复制', 900, { queue: false, key: 'kaomoji-copy' });
                    hidePanel();
                  } catch (err) {
                    console.warn('[kaomoji] copy failed:', err);
                    toast('颜文字复制失败', 900, { queue: false, key: 'kaomoji-copy' });
                  }
                });
                panel.appendChild(item);
              });
            }

            renderPanelItems();

            select.parentNode.insertBefore(trigger, select.nextSibling);
            trigger.insertAdjacentElement('afterend', quickSort);

            // 默认位置（非 qp-quote）下，uk-width-1-5 会导致换行：扩展输入容器并强制同排
            const inputCell = select.parentElement;
            if (inputCell) {
              Object.assign(inputCell.style, {
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'nowrap',
                minWidth: '0',
                gap: '6px'
              });
              trigger.style.flex = '0 0 auto';

              if (!trigger.closest('.qp-quote')) {
                inputCell.classList.remove('uk-width-1-5');
                inputCell.style.width = 'auto';
                inputCell.style.maxWidth = 'none';
                inputCell.style.flex = '1 1 auto';
              }
            }
            document.body.appendChild(panel);

            function getQuoteElement() {
              // 仅当当前触发器本身位于回复面板中时，才跟随 qp-quote 定位
              // 避免默认页面场景误命中页面上其他/隐藏的 qp-quote，导致面板贴边
              return trigger.closest('.qp-quote');
            }

            function getPanelAnchorRect() {
              const quoteEl = getQuoteElement();
              if (quoteEl) return quoteEl.getBoundingClientRect();
              return trigger.getBoundingClientRect();
            }

            function getPanelTargetWidth() {
              const quoteEl = getQuoteElement();
              if (quoteEl) {
                const w = Math.round(quoteEl.getBoundingClientRect().width || 0);
                if (w > 0) return Math.max(ITEM_W, w);
              }

              // 未打开回复面板时，使用与回复面板一致的初始宽度：min(90vw, 820px)
              // （与 replaceRightSidebar 中 .qp-stack 的初始宽度保持一致）
              const replyInitW = Math.round(Math.min(window.innerWidth * 0.9, 820));
              return Math.max(ITEM_W, replyInitW);
            }

            function positionPanel() {
              const triggerRect = trigger.getBoundingClientRect();
              const quoteEl = getQuoteElement();
              const anchorRect = getPanelAnchorRect();
              const margin = 6;

              // 宽度跟随 qp-quote，并限制在可视区域内（窗口变窄时同步变窄）
              const targetW = getPanelTargetWidth();
              const maxW = Math.max(ITEM_W, window.innerWidth - margin * 2);
              const finalW = Math.min(targetW, maxW);
              panel.style.width = `${Math.round(finalW)}px`;

              // 若当前不可见，临时显示用于测量
              const wasHidden = (panel.style.display === 'none' || panel.style.display === '');
              if (wasHidden) {
                panel.style.display = 'grid';
                panel.style.visibility = 'hidden';
              }

              const panelRect = panel.getBoundingClientRect();
              const panelW = panelRect.width;
              const panelH = panelRect.height;

              // 横向：有 qp-quote 时跟随其左边缘；无 qp-quote 时居中
              let left = quoteEl ? anchorRect.left : (window.innerWidth - panelW) / 2;
              let top = triggerRect.top - panelH - 6;

              if (left + panelW > window.innerWidth - margin) {
                  left = window.innerWidth - margin - panelW;
              }
              if (left < margin) left = margin;

              if (top < margin) {
                  top = triggerRect.bottom + 6;
              }
              if (top + panelH > window.innerHeight - margin) {
                  top = Math.max(margin, window.innerHeight - margin - panelH);
              }

              panel.style.left = `${Math.round(left)}px`;
              panel.style.top = `${Math.round(top)}px`;

              if (wasHidden) {
                panel.style.visibility = '';
              }
          }

          let followRafId = 0;
          let followResizeHandler = null;
          let followScrollHandler = null;

          function startPanelFollow() {
            stopPanelFollow();

            followResizeHandler = () => {
              if (panel.style.display === 'grid') positionPanel();
            };
            followScrollHandler = () => {
              if (panel.style.display === 'grid') positionPanel();
            };

            window.addEventListener('resize', followResizeHandler);
            // 捕获阶段监听，兼容任意滚动容器
            window.addEventListener('scroll', followScrollHandler, true);

            const tick = () => {
              if (panel.style.display !== 'grid') {
                followRafId = 0;
                return;
              }
              positionPanel();
              followRafId = window.requestAnimationFrame(tick);
            };
            followRafId = window.requestAnimationFrame(tick);
          }

          function stopPanelFollow() {
            if (followRafId) {
              window.cancelAnimationFrame(followRafId);
              followRafId = 0;
            }
            if (followResizeHandler) {
              window.removeEventListener('resize', followResizeHandler);
              followResizeHandler = null;
            }
            if (followScrollHandler) {
              window.removeEventListener('scroll', followScrollHandler, true);
              followScrollHandler = null;
            }
          }

          function showPanel() {
            // 每次打开都按最新统计与排序模式重建，确保“关闭后再开”顺序实时更新
            renderPanelItems();
            positionPanel();
            panel.style.display = 'grid';
            panel.style.visibility = '';
            panel.scrollTop = 0;
            bindGlobalClose();
            startPanelFollow();
            initKeyboardNav();
            // 👇 添加：延迟聚焦，确保 DOM 渲染完成
            setTimeout(() => {
                const items = panel.querySelectorAll('.kaomoji-item');
                if (items.length > 0) {
                    items[0].focus();
                }
            }, 0);
          }

          function hidePanel() {
            panel.style.display = 'none';
            unbindGlobalClose();
            stopPanelFollow();
            removeKeyboardNav();
          }

            // 点击快捷排序前先关闭颜文字面板，避免用户眼前发生重排
            quickSort.addEventListener('mousedown', () => {
              if (panel.style.display === 'grid') hidePanel();
            }, true);

            quickSort.addEventListener('change', () => {
              const mode = quickSort.value || 'default';

              try {
                if (SettingPanel && SettingPanel.state) SettingPanel.state.kaomojiSort = mode;
              } catch (e) {}

              try {
                const cfg = Object.assign({}, SettingPanel.defaults, GM_getValue(SettingPanel.key, {}));
                cfg.kaomojiSort = mode;
                GM_setValue(SettingPanel.key, cfg);
              } catch (e) {}

              // 与设置面板中的下拉同步
              const panelSort = document.querySelector('#sp_kaomojiSort');
              if (panelSort) panelSort.value = mode;

              // 与其他快捷下拉同步
              document.querySelectorAll('.sp_kaomojiSort_copy').forEach(el => {
                if (el !== quickSort) el.value = mode;
              });

              // 即时生效
              document.querySelectorAll(SELECTOR).forEach(sel => {
                try {
                  sel.dispatchEvent(new Event('kaomoji:sort-changed'));
                } catch (e) {}
              });

              // 广播模式变化（供后续新建的复制下拉同步）
              try {
                window.dispatchEvent(new CustomEvent('kaomoji:sort-mode-changed', { detail: { mode, source: 'quick' } }));
              } catch (e) {}
            });

            const onSortModeChanged = (ev) => {
              const mode = ev?.detail?.mode || getSortMode();
              if (quickSort.value !== mode) quickSort.value = mode;
            };
            window.addEventListener('kaomoji:sort-mode-changed', onSortModeChanged);

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                if (panel.style.display === 'none' || panel.style.display === '') {
                    showPanel();
                } else {
                    hidePanel();
                }
            });

          let outsideHandler, escHandler;
          function bindGlobalClose() {
              outsideHandler = (e) => {
                // 👇 忽略由键盘触发的伪鼠标事件 
                if (e.pointerType === '' || e.detail === 0) { 
                  return; 
                }
                // 捕获阶段执行，防止被其他脚本阻止
                const target = e.target;
                if (!panel.contains(target) && target !== trigger) {
                    hidePanel();
                }
              };

              escHandler = (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    hidePanel();
                }
            };

              // 用捕获阶段监听 click 和 mousedown
              document.addEventListener('click', outsideHandler, true);
              document.addEventListener('mousedown', outsideHandler, true);
              window.addEventListener('keydown', escHandler);
          }
          function unbindGlobalClose() {
            document.removeEventListener('click', outsideHandler, true);
            document.removeEventListener('mousedown', outsideHandler, true);
            window.removeEventListener('keydown', escHandler);
          }

          let currentIndex = -1;
          let keyboardHandler;
          //let highlightedItems = new Set();

          function clearActive(items) {
            items.forEach(item => item.classList.remove('kaomoji-active'));
          }

          function setActive(items, index) {
            if (!items.length) return;
            const next = Math.max(0, Math.min(index, items.length - 1));
            if (currentIndex === next && items[currentIndex] && items[currentIndex].classList.contains('kaomoji-active')) {
              return;
            }
            if (currentIndex >= 0 && items[currentIndex]) {
              items[currentIndex].classList.remove('kaomoji-active');
            }
            currentIndex = next;
            const el = items[currentIndex];
            el.classList.add('kaomoji-active');
            el.focus({ preventScroll: true });
            el.scrollIntoView({ block: 'nearest', behavior: 'auto' });
          }

          function initKeyboardNav() {
            const items = Array.from(panel.querySelectorAll('.kaomoji-item'));
            if (!items.length) return;

            // 重置状态
            clearActive(items);
            currentIndex = -1;
            setActive(items, 0);

            keyboardHandler = (e) => {
                // 如果面板不可见，直接返回
                if (panel.style.display === 'none' || panel.style.display === '') {
                  return;
                }
                const items = Array.from(panel.querySelectorAll('.kaomoji-item'));
                if (!items.length) return;

                // const panelWidth = panel.offsetWidth - PAD * 2;
                // const cols = Math.floor(panelWidth / (ITEM_W + GAP));
                // // 使用实际 grid 列数，避免计算误差
                // const gridCols = getComputedStyle(panel).gridTemplateColumns.split(/\s+/).filter(s => s && s !== '').length;
                // const cols = gridCols > 0 ? gridCols : 1;

                // 通过实际位置计算列数
                // let cols = items.length; // 默认只有一行
                // if (items.length > 1) {
                //     const firstTop = items[0].getBoundingClientRect().top;
                //     for (let i = 1; i < items.length; i++) {
                //         if (items[i].getBoundingClientRect().top > firstTop) {
                //             cols = i;
                //             break;
                //         }
                //     }
                // }
                // 通过首行实际 offsetTop 统计列数，避免两行颜文字导致行高变化影响判定
                let cols = 1; // 默认至少一列
                if (items.length > 1) {
                  const firstTop = items[0].offsetTop;
                  let count = 1;
                  for (let i = 1; i < items.length; i++) {
                    if (Math.abs(items[i].offsetTop - firstTop) <= 1) {
                      count++;
                    } else {
                      break;
                    }
                  }
                  cols = Math.max(1, count);
                }
                let newIndex = currentIndex;

                const key = e.key.toLowerCase();

                if (e.key === 'ArrowRight' || key === 'd') {
                    e.preventDefault();
                    newIndex = Math.min(currentIndex + 1, items.length - 1);
                } else if (e.key === 'ArrowLeft' || key === 'a') {
                    e.preventDefault();
                    newIndex = Math.max(currentIndex - 1, 0);
                } else if (e.key === 'ArrowDown' || key === 's') {
                    e.preventDefault();
                    newIndex = Math.min(currentIndex + cols, items.length - 1);
                } else if (e.key === 'ArrowUp' || key === 'w') {
                    e.preventDefault();
                    newIndex = Math.max(currentIndex - cols, 0);
                } else if (e.key === 'Enter' || key === ' ') {
                    e.preventDefault();
                    items[currentIndex].click();
                    return;
                }

                if (newIndex !== currentIndex) {
                  setActive(items, newIndex);
                }
            };

            window.addEventListener('keydown', keyboardHandler);
          }

          function removeKeyboardNav() {
            if (keyboardHandler) {
                window.removeEventListener('keydown', keyboardHandler);
                keyboardHandler = null;
            }
            // 清除所有颜文字的高亮样式
            const items = panel.querySelectorAll('.kaomoji-item');
            items.forEach(item => item.classList.remove('kaomoji-active'));

            currentIndex = -1;
          }
          select.addEventListener('kaomoji:updated', () => {
            renderPanelItems();
          });
          select.addEventListener('kaomoji:sort-changed', () => {
            renderPanelItems();
            if (panel.style.display === 'grid') {
              initKeyboardNav();
            }
          });
      });
    }

      /**
       * 功能 3：颜文字样式拓展
       */
      function extendKaomojiSet() {
          const EXTRA_EMOTS = [
              "( ´_ゝ`)旦","(<ゝω・) ☆","(`ε´ (つ*⊂)","=͟͟͞͞( 'ヮ' 三 'ヮ' =͟͟͞͞)","↙(`ヮ´ )↗ 开摆！",
              "(っ˘Д˘)ノ<","(ﾉ#)`д´)σ","₍₍(ง`ᝫ´ )ว⁾","( `ᵂ´)","( *・ω・)✄╰ひ╯","U•ェ•*U","⊂( ﾟωﾟ)つ",
              "( ﾟ∀。)7","･ﾟ( ﾟ∀。) ﾟ。","\\( ﾟ∀。)/","(╬ﾟ∀。)","( `д´)σ","( ﾟᯅ 。)","( ;`д´; )","m9( `д´)","( ﾟπ。)","ᕕ( ﾟ∀。)ᕗ",
              "ฅ(^ω^ฅ)","(|||^ヮ^)","(|||ˇヮˇ)","(　↺ω↺)"," `ー´) `д´) `д´)",
              "₍˄·͈༝·͈˄₎◞","⁽ ˇᐜˇ⁾","⁽ ˆ꒳ˆ⁾","⁽ ^ᐜ^⁾","⁽´°`⁾","⁽´ᵖ`⁾","⁽ ˙³˙⁾","⁽°ᵛ°⁾","⁽ `ᵂ´⁾",
              "( ;ˇωˇ; )","(　‸ო‸)","(　‸ω‸)"," /̵͇̿̿/’̿’̿ ̿ ̿̿ ̿̿ ̿̿","( ;´ω`)人 ","_(:зゝ∠)_","(　ﾟ 灬ﾟ)","( `д´)ゞ","(ᗜᴗᗜ)",
              "接☆龙☆大☆成☆功","ᑭ`д´)ᓀ ∑ᑭ(`ヮ´ )ᑫ","乚 (^ω^ ﾐэ)Э好钩我咬","乚(`ヮ´  ﾐэ)Э","( ﾟ∀。ﾐэ)Э三三三三　乚",
              "(ˇωˇ ﾐэ)Э三三三三　乚","(‸ω‸ ﾐэ)Э","( へ ﾟ∀ﾟ)べ摔低低","(ベ ˇωˇ)べ 摔低低",
          ];
          const EXTRA_RICH = {
              "҉( ﾟ∀。)": "　　҉\n( ﾟ∀。)",
              "⬭꒰ঌ( ˇωˇ)໒꒱":"　　⬭\n꒰ঌ(　ˇωˇ)໒꒱",
              "齐齐蛤尔": "(`ヮ´ )σ`∀´) ﾟ∀ﾟ)σ",
              "呼伦悲尔": "( ﾉд`ﾟ);´д`) ´_ゝ`)",
              "愕尔多厮": "Σ( ﾟдﾟ)´ﾟДﾟ)　ﾟдﾟ)))",
              "智利": "( ﾟ∀。)∀。)∀。)",
              "阴山山脉": "(　ˇωˇ )◕∀◕｡)^ω^)",
              "mini阴阳酱":"₍˄·͈༝·͈˄₎◞⁽ ˇᐜˇ⁾⁽ ˆ꒳ˆ⁾⁽ ^ᐜ^⁾⁽´°`⁾⁽´ᵖ`⁾⁽ ˙³˙⁾⁽°ᵛ°⁾⁽ `ᵂ´⁾",
              "F5欧拉": "　σ　σ\nσ(　´ρ`)σ[F5]\n　σ　σ",
              "UK酱": "\\ ︵\nᐕ)⁾⁾",
              "白羊": "╭◜◝ ͡ ◜◝ J J\n(　　　　 `д´) 　“咩！”\n╰◟д ◞ ͜ ◟д◞",
              "兔兔": "　/)　/)\nc(　╹^╹)",
              "neko": "　　　　　∧,,　\n　　　　ヾ ｀. ､`フ\n　　　(,｀'´ヽ､､ﾂﾞ\n　 (ヽｖ'　　　`''ﾞつ\n　　,ゝ　 ⌒`ｙ'''´\n　 （ (´＾ヽこつ\n　　 ) )\n　　(ノ",
              "neko2": "　　　､ゞヾ∧\"\"'∧;,\n　　ヾ　　　・ω・ 彡\n　 ﾐ　　　 　o　 o　 ミ\n　~彡 ﾐ\n　　/ｿ,,　,０; ,;;:､０ヾ`",
              "neko3": "　　　 　／l、 \n(*´∀`)σ（ﾟ∀。７\n 　　　　l、 ~ヽ\n　　　　じしf_, )ノ ​",
              "给你": "（\\_/）\n(・_・)\n / 　>",
              "催更喵gkd": "　　　　　　＿＿＿\n　　　　　／＞　　フ\n　　　　　| 　_　 _ l 我是一只催更的\n　 　　　／` ミ＿xノ 喵喵酱\n　　 　 /　　　 　 | gkdgkd\n　　　 /　 ヽ　　 ﾉ\n　 　 │　　|　|　|\n　／￣|　　 |　|　|\n　| (￣ヽ＿_ヽ_)__)\n　＼二つ",
              "举高高": "　　　　_∧＿∧_ \n　　 　((∀｀/ 　) \n　　　/⌒　　 ／ \n　　/(__ノ＼_ノ \n　　(_ノ ||| 举高高~~\n　∧＿∧　∧＿∧\n(( ・∀・ ))・∀・) )\n`＼　　 ∧ 　　ノ\n　/　｜/　　｜\n（＿ノ＿)_ノL＿)",
              "举高高2": "　　　　_∧＿∧_\n　　　 ((∀｀/ 　)\n　　　 /⌒　　 ／\n　 /(__ノ＼_ノ(((ヽ\n　(_ノ　 　￣Ｙ＼\n|　(＼　(\\　 /)　 ｜ )举高高！\nヽ　ヽ` ( ﾟ∀ﾟ ) _ノ /\n　＼ |　⌒Ｙ⌒　/ /\n　 ｜ヽ · ｜ · ﾉ ／/\n　 ＼トー仝ーイ\n　　 ｜ ミ土彡/\n　　　). \\ °　 /\n　　　( 　\\. y 　\\",
              "举糕糕": "举糕糕~\n　　☆☆☆☆☆☆☆☆\n　╭┻┻┻┻┻┻┻┻╮\n　┃╱╲╱╲╱╲╱╲┃\n╭┻━━━━━━━━┻╮\n┃╱╲╱╲╱╲╱╲╱╲┃\n┗━━━━━━━━━━┛\n　　　∧＿∧　∧＿∧\n　　(( ・∀・ ))・∀・) )\n　　`＼　　 ∧ 　　ノ\n　　　/　　｜/　　｜\n　　（＿ノ＿)_ノL＿)",
              "Happy肥肥Day": ".　　　　　　　.★ * ★.. \n　　.*★　*.　*..*　　　★ \n　　★　　　　　　★ \n　　‘*. *'　 ʜᴀᴘᴘʏ 肥肥 ᴅᴀʏ \n　　　‘★.　　 ★’ \n　　　　　*..★\n┊┊┊┊☆☆☆☆☆☆☆☆┊┊┊┊\n┊┊┊╭┻┻┻┻┻┻┻┻╮┊┊┊\n┊┊┊┃╱╲╱╲╱╲╱╲┃┊┊┊\n┊┊╭┻━━━━━━━━┻╮┊┊\n┊┊┃╱╲╱╲╱╲╱╲╱╲┃┊┊\n╱▔┗━━━━━━━━━━┛▔╲",
              "大嘘": "吁~~~~　　rnm，退钱！\n 　　　/　　　/\n(　ﾟ 3ﾟ) `ー´) `д´) `д´)",
              "巴拉巴拉": "　∧＿∧\n（｡･ω･｡)つ━☆・*。\n⊂　　 ノ 　　　・゜+.\n　しーＪ　　　°。+ *´¨)\n　　　 　　.· ´¸.·*´¨) ¸.·*¨)\n　　　　　　　 　(¸.·´ (¸.·’*",
              "碣石": "　　_ _\n　 ( ﾟ_ﾟ)　　\n/　(⁰　　)╲/",
              "冰封王座": "(ノﾟ∀ﾟ)ノ👑\n　　　( ﾟ∀。)\n\n　　　👑\n(//ﾟωﾟ)//\n    \n　👑\n(Ⅱﾟωﾟ)Ⅱ\n\n　 👑\nᕕ( ᐛ )ᕗ",
              "冰封王座2": "(ノﾟ∀ﾟ)ノ🍟\n　　　( ﾟ∀。)\n\n　　　🍟\n(//ﾟωﾟ)//\n    \n　🍟\n(Ⅱﾟωﾟ)Ⅱ\n\n　 🍟\nᕕ( ᐛ )ᕗ",
              "冰封王座3": "( `д´)=🔪 👑\n　　　 (　ﾟ 3ﾟ)\n　　　👑\n(// `ー´)//\n(　x 3x)\n　👑\n(Ⅱ`∀´)Ⅱ\n(　x 3x)\n　👑\n( `д´)\n(　x 3x)",
              "喵喵酱": "　^ ^\n( =`д´=)哈—！",
              "狗比酱": "(U `д´)<汪汪汪！",
              "起舞":"⊂ヽ(　^ω^)つ\n　 ＼ 　　／　　\n　　( ＿_フ\n　　(／",
              "N98": "淦\n是\nN\n9\n8\n接☆龙☆大☆成☆功\n盗摄？(　^ω^)\n石雕\n要素齐全\nN98是什么？\n同问\n感谢\n谢谢\n要素齐全\n什么是要素齐全？\n淦\n是\nN\n9\n5\nr\n警惕r点机器人\n你一个人都说完了我们说什么(╬ﾟдﾟ)",
              "望po石":"　┏━┓\n　┃望┃\nᕕ┃po┃ᕗ\n　┃石┃\n　┗━┛\n嗨呀我又来望po了\n我天天都来这望po",
              "望po石2": "　　　　┏━┓\n　　　　┃望┃\n　　　　┃po┃\n　　　　┃石┃\n　　　　┗━┛　　　　\n　　　┏━━━┓\n　　┏┛　望　┗┓\n　┏┛　　po　　┗┓\n┏┛　　　山　　　┗┓\n┗━━━━━━━━━┛",
              "撞墙": "┃電柱┃　( ´ー`)\n┃電柱┃дﾟ ) =͟͟͞͞ =͟͟͞͞\n┃電柱┃　( ´д`)\n┃電柱┃дﾟ ) =͟͟͞͞ =͟͟͞͞\n┃電柱┃　(;´Д`)\n┃電柱┃π。) =͟͟͞͞ =͟͟͞͞",
              "冰箱先生":"　　/\n┌───┐\n│　ﾟ∀ﾟ│\n├─┬─┤\n│　│　│\n└─┴─┘",
              "冰箱先生3D":"　　/\n▁▁▁▁\n╲　　　╲\n▏┌───┐\n▏│　ﾟ∀ﾟ │\n▏├─┬─┤\n╲│　│　│\n　└─┴─┘",
              "血压↑":"　他妈的／＞__フ\n　　　　| ＝ ^ω^)＝　血压↗↗\n　 　　／`　　 丨",
              "血压0↓":"　算逑喽／＞__フ\n　　　　| ＝ ˇωˇ)＝　血压0↓\n　 　　／`　　 丨",
              "全角空格": "　",
              "零宽空格": "​",
          };
          const ORDERED_RICH = [
              "҉( ﾟ∀。)","⬭꒰ঌ( ˇωˇ)໒꒱","齐齐蛤尔","呼伦悲尔","愕尔多厮","智利","阴山山脉",
              "mini阴阳酱","F5欧拉","UK酱","白羊","兔兔",
              "neko","neko2","neko3","催更喵gkd",
              "给你","举高高","举高高2","举糕糕","Happy肥肥Day",
              "大嘘","巴拉巴拉","碣石",
              "冰封王座","冰封王座2","冰封王座3",
              "喵喵酱","狗比酱","起舞","N98",
              "望po石","望po石2","撞墙","冰箱先生","冰箱先生3D","血压↑","血压0↓",
              "全角空格","零宽空格",
              // 页面中“防剧透/骰子/高级骰子”不动其原位
          ];
          const NEED_LF = new Set([
              "҉( ﾟ∀。)","⬭꒰ঌ( ˇωˇ)໒꒱","F5欧拉","UK酱","白羊","兔兔",
              "neko","neko2","neko3","催更喵gkd",
              "给你","举高高","举高高2","举糕糕","Happy肥肥Day",
              "大嘘","巴拉巴拉","碣石",
              "冰封王座","冰封王座2","冰封王座3",
              "喵喵酱","狗比酱","起舞","N98",
              "望po石","望po石2","撞墙","冰箱先生","冰箱先生3D","血压↑","血压0↓"
          ]);

          // 一次性补齐（选择器就绪且已有至少一个选项时调用）
          function patchSelect(sel) {
              if (!sel || sel.dataset.kaoExtended === '1') return;
              if (!sel.options || sel.options.length === 0) return;
              // 去重集合
              const existingValues = new Set();
              const existingLabels = new Set();
              Array.from(sel.options).forEach(op => {
                  existingValues.add(op.value);
                  existingLabels.add(op.textContent);
              });
              // 追加普通
              const frag = document.createDocumentFragment();
              EXTRA_EMOTS.forEach(txt => {
                  if (!existingValues.has(txt)) {
                    const op = new Option(txt, txt);
                    op.dataset.kaoKey = `extra:${txt}`;
                    frag.appendChild(op);
                      existingValues.add(txt);
                  }
              });
              if (frag.childNodes.length) sel.appendChild(frag);

              // 收集需要重排的富颜文字：先把 ORDERED_RICH 中已存在的挪出
              const bucket = new Map(); ORDERED_RICH.forEach(k => bucket.set(k, null));
              for (let i = sel.options.length - 1; i >= 0; i--) {
                  const op = sel.options[i];
                  const label = op.textContent;
                  if (bucket.has(label)) {
                      bucket.set(label, op);
                      sel.remove(i);
                  }
              }
              // 按顺序插回；缺的用 EXTRA_RICH 补齐；值前加换行（NEED_LF）
              const richFrag = document.createDocumentFragment();
              ORDERED_RICH.forEach(key => {
                  let node = bucket.get(key);
                  if (node) {
                    node.dataset.kaoKey = `rich:${key}`;
                      richFrag.appendChild(node);
                  } else if (EXTRA_RICH[key]) {
                      const val = NEED_LF.has(key) ? ("\n" + EXTRA_RICH[key] + "\n") : EXTRA_RICH[key];
                    const op = new Option(key, val);
                    op.dataset.kaoKey = `rich:${key}`;
                    richFrag.appendChild(op);
                  }
              });
              if (richFrag.childNodes.length) sel.appendChild(richFrag);

              sel.dataset.kaoExtended = '1';
              sel.dispatchEvent(new CustomEvent('kaomoji:updated', { bubbles: true }));
          }

          function patchSelectsIn(root = document) {
              if (!root) return;
              const selects = [];
              if (root.matches && root.matches(SELECTOR)) selects.push(root);
              if (root.querySelectorAll) root.querySelectorAll(SELECTOR).forEach(sel => selects.push(sel));
              selects.forEach(sel => {
                  if (sel.options && sel.options.length > 0) patchSelect(sel);
              });
          }

          // 方案 A：钩住 jQuery 的 append，仅针对 #h-emot-select
          (function hookjQueryAppend(){
              const $ = window.jQuery;
              if (!$ || !$.fn || !$.fn.append || $.fn.append.__kaoHooked) return;
              const rawAppend = $.fn.append;
              $.fn.append = function(...args){
                  const ret = rawAppend.apply(this, args);
                  try {
                      // 如果目标包含我们的 select，就尝试打补丁
                      this.each(function(){
                          patchSelectsIn(this);
                      });
                  } catch(_) {}
                  return ret;
              };
              $.fn.append.__kaoHooked = true;
          })();

          // 方案 B：用 MutationObserver 监听 select 的子节点变化，首次填充后补齐
          (function observeSelect(){
              document.querySelectorAll(SELECTOR).forEach(sel => {
                  if (sel.options && sel.options.length > 0) {
                      patchSelect(sel);
                      return;
                  }
                  if (sel.dataset.kaoOptionObserver === '1') return;
                  sel.dataset.kaoOptionObserver = '1';
                  const mo = new MutationObserver(() => {
                      if (sel.options && sel.options.length > 0) {
                          patchSelect(sel);
                          mo.disconnect();
                          delete sel.dataset.kaoOptionObserver;
                          scheduleKaomojiEnhancePass();
                      }
                  });
                  mo.observe(sel, { childList: true, subtree: false });
              });
          })();

          // 方案 C：兜底重试（避免异步加载错过时机）
          let tries = 0;
          (function retry(){
              patchSelectsIn(document);
              const pending = Array.from(document.querySelectorAll(SELECTOR)).some(sel => !sel.dataset.kaoExtended);
              if (!pending) return;
              if (tries++ < 30) {
                  setTimeout(retry, 100);
              }
          })();
      }
  }

  // function renderSpoiler(container) {
  //   var $container = $(container);
  //   // 用构造函数写法，避免 /^.../ 形式
  //   var reg = new RegExp("\\[h\\]([\\s\\S]*?)\\[\\/h\\]", "gi");

  //   $container.find('.h-threads-content').each(function () {
  //     var text = $(this).text().trim();
  //     var match = reg.exec(text);
  //     if (match) {
  //       $(this).html('<span class="h-hidden-text">' + match[1] + '</span>');
  //     }
  //   });
  // }

  /* --------------------------------------------------
   * tag 14. ‘增强x岛匿名版’：添加预览框+草稿保存/恢复/自动设置网页标题/人类友好时间显示/引用追记/粘贴图片上传
   * -------------------------------------------------- */
  // 统一生成草稿存储用的 key
  // 统一：草稿 key 生成
  function getDraftKey() {
    return window.location.pathname;
  }

  function getDraftStorageKey(pathname = getDraftKey()) {
    return `xdex_draft:${pathname}`;
  }

  function getDraftRegistryKey() {
    return 'xdex_draft_registry';
  }

  function isLegacyDraftKey(key) {
    return /^\/t\/\d+$/.test(key) || /^\/f\/[^/]+$/.test(key) || /^\/Forum\/timeline\/id\/\d+$/.test(key);
  }

  function getDraftRegistry() {
    try {
      if (typeof GM_getValue === 'function') {
        const value = GM_getValue(getDraftRegistryKey(), []);
        return Array.isArray(value) ? value : [];
      }
    } catch (_) {}
    return [];
  }

  function saveDraftRegistry(list) {
    try {
      if (typeof GM_setValue === 'function') {
        GM_setValue(getDraftRegistryKey(), Array.from(new Set(Array.isArray(list) ? list : [])));
      }
    } catch (_) {}
  }

  function addDraftKeyToRegistry(storageKey) {
    if (!storageKey) return;
    const registry = getDraftRegistry();
    if (!registry.includes(storageKey)) {
      registry.push(storageKey);
      saveDraftRegistry(registry);
    }
  }

  function removeDraftKeyFromRegistry(storageKey) {
    if (!storageKey) return;
    const next = getDraftRegistry().filter((key) => key !== storageKey);
    saveDraftRegistry(next);
  }

  function getDraftEnabledNow() {
    try {
      if (typeof SettingPanel !== 'undefined' && SettingPanel && SettingPanel.state) {
        return !!SettingPanel.state.enableDraft;
      }
      if (typeof GM_getValue === 'function') {
        const saved = GM_getValue(SettingPanel.key, {});
        return !!Object.assign({}, SettingPanel.defaults, saved).enableDraft;
      }
    } catch (_) {}
    return true;
  }

  function getLegacyDraftValue(pathname = getDraftKey()) {
    try {
      if (typeof GM_getValue === 'function') {
        const value = GM_getValue(pathname, '');
        return typeof value === 'string' ? value : '';
      }
    } catch (_) {}
    return '';
  }

  function readDraftValue(pathname = getDraftKey()) {
    const storageKey = getDraftStorageKey(pathname);
    let value = '';
    try {
      if (typeof GM_getValue === 'function') {
        value = GM_getValue(storageKey, '');
      }
    } catch (_) {}
    if (typeof value === 'string' && value !== '') return value;
    return getLegacyDraftValue(pathname);
  }

  function saveDraftValue(pathname, content) {
    if (!getDraftEnabledNow()) return;
    const storageKey = getDraftStorageKey(pathname);
    try {
      if (typeof GM_setValue === 'function') {
        GM_setValue(storageKey, content);
        addDraftKeyToRegistry(storageKey);
      }
    } catch (_) {}
  }

  function migrateLegacyDraftIfNeeded(pathname = getDraftKey()) {
    const legacyValue = getLegacyDraftValue(pathname);
    if (typeof legacyValue !== 'string' || legacyValue === '') return '';
    const storageKey = getDraftStorageKey(pathname);
    let current = '';
    try {
      if (typeof GM_getValue === 'function') {
        current = GM_getValue(storageKey, '');
      }
    } catch (_) {}
    if (!current) {
      try {
        if (typeof GM_setValue === 'function') {
          GM_setValue(storageKey, legacyValue);
          addDraftKeyToRegistry(storageKey);
        }
      } catch (_) {}
    }
    deleteDraftSafe(pathname);
    return legacyValue;
  }

  // 统一：安全删除草稿（有 GM_deleteValue 用之；否则写空串兜底）
  function deleteDraftSafe(key) {
    try {
      if (!key) key = getDraftKey();
      if (typeof GM_deleteValue === 'function') {
        GM_deleteValue(key);
      } else if (typeof GM_setValue === 'function') {
        GM_setValue(key, ''); // 覆盖为空字符串
      } else {
        // 无 GM_* 时不做处理
      }
    } catch (_) {}
    removeDraftKeyFromRegistry(key);
  }

  function deleteAllDraftsSafe() {
    const keysToDelete = new Set(getDraftRegistry());
    try { keysToDelete.add(getDraftStorageKey()); } catch (_) {}
    try {
      if (typeof GM_listValues === 'function') {
        const allKeys = GM_listValues();
        allKeys.forEach((key) => {
          if (!isLegacyDraftKey(key)) return;
          let value = '';
          try { value = GM_getValue(key, ''); } catch (_) {}
          if (typeof value === 'string') keysToDelete.add(key);
        });
      }
    } catch (_) {}
    keysToDelete.forEach((key) => {
      try { deleteDraftSafe(key); } catch (_) {}
    });
    saveDraftRegistry([]);
  }

  // 完整移植为可调用函数。需要：jQuery 2.2.4+；GM_setValue/GM_getValue/GM_deleteValue 授权
  function enhanceIsland(config = {}) {
    return startupPerfDebug.measure('enhanceIsland', () => {
    // 配置开关（默认全开）
    let cfg = Object.assign({
      enablePreview: true,         // 发帖预览（插入预览DOM并实时渲染）
      enableDraft: true,           // 草稿保存/恢复和成功后清理
      enableAutoTitle: true,       // 自动设置网页标题（含页码）
      enableRelativeTime: true,    // 相对时间显示（每2.5秒刷新）
      enableQuoteInsert: true,     // 点击 No.xxxx 插入引用
      enablePasteImage: true       // 粘贴剪贴板图片到文件输入
    }, config);

    // 解析 jQuery
    const $ = cfg.$ || window.jQuery || window.$;
    if (!$) {
      console.warn('[enhanceIsland] jQuery not found.');
      return;
    }

    // 公用变量
    const 正文框 = $('textarea.h-post-form-textarea');
    const search = window.location.search;
    const 搜索参数 = {};
    search.replace(/^\?/, '').split('&').forEach(kev => {
      if (!kev) return;
      const [k, v] = kev.split('=', 2);
      搜索参数[k] = v;
    });
    const 路径 = window.location.pathname;
    const 路径分块 = 路径.split('/').splice(1);

    const isDraftEnabled = () => getDraftEnabledNow();
    let draftAutosaveBound = false;

    // 动态生成预览区域 DOM
    function buildPreviewHtml() {
      // 从 cookie-switcher 里取当前饼干
      const cookieDisplay = document.querySelector('#h-post-form #current-cookie-display');
      const cookieText = cookieDisplay ? cookieDisplay.textContent.trim() : '--';

      return `
      <div class="h-preview-box">
        <div class="h-threads-item">
          <div class="h-threads-item-replies">
            <div class="h-threads-item-reply">
              <div class="h-threads-item-reply-main">
                <div class="h-threads-img-box">
                  <div class="h-threads-img-tool uk-animation-slide-top">
                    <span class="h-threads-img-tool-btn h-threads-img-tool-small uk-button-link"><i class="uk-icon-minus"></i>收起</span>
                    <a href="javascript:;" class="h-threads-img-tool-btn h-threads-img-tool-large uk-button-link"><i class="uk-icon-search-plus"></i>查看大图</a>
                    <span class="h-threads-img-tool-btn h-threads-img-tool-left uk-button-link"><i class="uk-icon-reply"></i>向左旋转</span>
                    <span class="h-threads-img-tool-btn h-threads-img-tool-right uk-button-link"><i class="uk-icon-share"></i>向右旋转</span>
                  </div>
                  <a class="h-threads-img-a"><img src="" align="left" border="0" hspace="20" class="h-threads-img"></a>
                </div>
                <div class="h-threads-info">
                  <span class="h-threads-info-title"></span>
                  <span class="h-threads-info-email"></span>
                  <span class="h-threads-info-createdat">2013-07-11(六)12:07:12</span>
                  <span class="h-threads-info-uid">ID:${cookieText}</span>
                  <span class="h-threads-info-report-btn">
                    [<a href="/f/值班室" target="_blank">举报</a>]
                  </span>
                  <a href=":javascript:;" class="h-threads-info-id" target="_blank">No.9999999</a>
                </div>
                <div class="h-threads-content"></div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    }

    // 预览区域 DOM
    const previewHtml = buildPreviewHtml();
    //previewBox.outerHTML = previewHtml;

    // 引用插入函数（与原脚本一致）
    function enhanceNode(root) {
      if (typeof extendQuote === 'function') extendQuote(root);
      if (typeof initExtendedContent === 'function') initExtendedContent(root);
      if (typeof initContent === 'function') initContent(root);
      //if (typeof autoHideRefView === 'function') autoHideRefView(root);
    }
    // 只有在页面存在发帖表单容器时才插入预览
    function initPreviewBox() {
        if (!cfg.enablePreview) return;
        if (!$('#h-post-form form').length) return;

        // 只创建一次预览框
        if (!$('.h-preview-box').length) {
            const $box = $(previewHtml).insertAfter('#h-post-form form');
            setTimeout(() => {
              startupPerfDebug.measure('enhanceIsland.deferEnhanceNode', () => enhanceNode($box[0]), () => startupPerfDebug.summarizeRoot($box[0]));
            }, 0);
            // ★ 新增：让预览框里的图片也启用高清图+旋转布局逻辑
            if (typeof enableHDImage === 'function') {
                enableHDImage($box[0]);
            }
            // 让预览框宽度跟随表单
            // === 实时监测预览框父容器变化 ===
            const boxEl = $box[0];

            function applyBoxStyle(previewEl) {
              return startupPerfDebug.measure('enhanceIsland.applyBoxStyle', () => {
              if (!$box.closest('.qp-body').length) {
                // 不在 .qp-body 内时，应用基础样式
                $box.css({
                  width: '100%',
                  'box-sizing': 'border-box'
                });
                $box.find('.h-threads-content').css({
                  'overflow-wrap': 'break-word',
                  'word-break': 'break-word',
                  'white-space': 'normal'
                });
              } else {
                // 在 .qp-body 内时，实时跟随 .qp-content-wrap 宽度
                const wrapEl = $box.closest('.qp-content-wrap')[0];
                if (wrapEl && previewEl) {
                  const wrapStyle = window.getComputedStyle(wrapEl);
                  previewEl.style.width = wrapStyle.width;
                  previewEl.style.boxSizing = 'border-box';
                }

                // 保持换行规则
                $box.find('.h-threads-content').css({
                  'max-width': '100%',        /* 预览框不超过容器宽度 */
                  'overflow-wrap': 'break-word',
                  'word-break': 'break-word',
                  'white-space': 'normal'
                });
              }
              }, () => ({ previewBoxes: document.querySelectorAll('.h-preview-box').length }));
            }

            // 初始化时执行一次
            applyBoxStyle();

            // 监听 DOM 变化
            let previewStyleScheduled = false;
            const mo = new MutationObserver((mutations) => {
              startupPerfDebug.measureObserver('enhanceIsland.previewBoxStyle', mutations, () => {
              if (previewStyleScheduled) return;
              previewStyleScheduled = true;
              requestAnimationFrame(() => {
                previewStyleScheduled = false;
                applyBoxStyle();
              });
              }, () => ({
                previewBoxes: document.querySelectorAll('.h-preview-box').length
              }));
            });

            // 监听父节点变化（包括被移动到别的容器）
            mo.observe(document.body, {
              childList: true,
              subtree: true
            });

            if (typeof updatePreviewCookieId === 'function') updatePreviewCookieId();

            // === 图片预览更新函数 ===
            function updatePreviewFromFile(file) {
                const imgEl = $box.find('.h-threads-img')[0];
                const imgLink = $box.find('.h-threads-img-a')[0];
                const toolLarge = $box.find('.h-threads-img-tool-large')[0];
                const imgBox = $box.find('.h-threads-img-box')[0];
                if (!imgEl) return;

                // 清理旧 URL
                if (imgEl.dataset.prevObjectUrl) {
                    URL.revokeObjectURL(imgEl.dataset.prevObjectUrl);
                    delete imgEl.dataset.prevObjectUrl;
                }

                if (file) {
                  const objectUrl = URL.createObjectURL(file);
                  imgEl.src = objectUrl;
                  imgEl.dataset.prevObjectUrl = objectUrl;
                  imgEl.style.display = 'block';
                  if (imgLink) imgLink.href = objectUrl;
                  if (toolLarge) toolLarge.href = objectUrl;
                  if (imgBox) imgBox.classList.remove('h-active');
                  imgEl.dataset.rotateIndex = '0';
                  imgEl.style.transform = '';
                  imgEl.style.top = '0px';
                  imgEl.style.left = '0px';
                  // 清理默认宽度，避免占满
                  imgEl.style.width = 'auto';
                  imgEl.style.height = 'auto';
                  // ★ 新增：根据所在位置限制缩略图大小
                  const isInOverlay = !!$box.closest('.qp-body').length;
                  if (isInOverlay) {
                      // 在浮窗中：最大宽度为浮窗宽度的 1/3
                      const wrapEl = $box.closest('.qp-content-wrap')[0];
                      if (wrapEl) {
                          const wrapWidth = wrapEl.getBoundingClientRect().width;
                          imgEl.style.maxWidth = (wrapWidth / 3) + 'px';
                          imgEl.style.height = 'auto';
                      }
                  } else {
                      // 在表单中：最大宽度为表单宽度的 1/2
                      const formEl = document.querySelector('#h-post-form form');
                      if (formEl) {
                          const formWidth = formEl.getBoundingClientRect().width;
                          imgEl.style.maxWidth = (formWidth / 2) + 'px';
                          imgEl.style.height = 'auto';
                      }
                  }
              } else {
                  imgEl.removeAttribute('src');
                  imgEl.style.display = 'none';
                  imgEl.style.maxWidth = '';
                  imgEl.style.width = '';
                  imgEl.style.height = '';
                  imgEl.style.transform = '';
                  imgEl.style.top = '0px';
                  imgEl.style.left = '0px';
                  delete imgEl.dataset.rotateIndex;
                  if (imgLink) {
                    imgLink.removeAttribute('href');
                    imgLink.style.height = '';
                  }
                  if (toolLarge) toolLarge.href = 'javascript:;';
                  if (imgBox) imgBox.classList.remove('h-active');
              }

            }

            // === 监听文件选择 ===
            const fileInput = document.querySelector('input[type="file"][name="image"]');
            if (fileInput) {
                fileInput.addEventListener('change', function () {
                    const file = this.files && this.files[0] ? this.files[0] : null;
                    updatePreviewFromFile(file);
                });
            }

            // === 监听粘贴图片（不依赖 change 事件）===
            document.addEventListener('paste', function (e) {
                const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items || [];
                if (!items.length) return;

                let file = null;
                for (const it of items) {
                    if (it.kind === 'file') {
                        const f = it.getAsFile();
                        if (f && f.type.startsWith('image/')) {
                            file = f;
                            break;
                        }
                    }
                }
                if (!file) return;

                // 如果 input 存在，也同步到 input.files
                if (fileInput) {
                    try {
                        const dt = new DataTransfer();
                        dt.items.add(file);
                        fileInput.files = dt.files;
                    } catch (_) {
                        // 某些浏览器不支持 DataTransfer 构造器
                    }
                }

                // 直接更新预览
                updatePreviewFromFile(file);
                // 触发 change，让绑定在 file input 上的逻辑（如清除按钮）也能执行
                if (fileInput) {
                    try {
                        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                    } catch (_) {}
                }

            }, true);
        }
    }
    // 预览引用/隐藏文本渲染
    const previewBox = $('<div/>'); // 占位，真正引用在 initPreviewBox 后重新抓取
    const refExp = /^([>＞]+.*)$/;
    const quoteTokenExp = /(?:>>)?No\.(\d{8})\b|(?:>>)?(?<!\d)(\d{8})(?!\d)/g;
    const hideExp = /\[h\]([\s\S]*?)\[\/h\]/g;
    let lastPreviewRaw = null;
    let lastPreviewRenderedHtml = '';
    let lastPreviewEnhanceAt = 0;
    let previewEnhanceTimer = null;

    function bindPreviewQuoteHover(previewRoot) {
      if (!previewRoot) return;
      if (typeof initContent === 'function') initContent(previewRoot);
    }

    function extendPreviewQuoteText(previewRoot) {
      if (!previewRoot) return;
      if (typeof extendQuote === 'function') extendQuote(previewRoot);
      bindPreviewQuoteHover(previewRoot);
    }

    function schedulePreviewEnhance(previewRoot) {
      if (!previewRoot) return;
      const now = Date.now();
      const elapsed = now - lastPreviewEnhanceAt;
      if (previewEnhanceTimer) {
        clearTimeout(previewEnhanceTimer);
        previewEnhanceTimer = null;
      }

      if (lastPreviewEnhanceAt === 0) {
        lastPreviewEnhanceAt = now;
        previewEnhanceTimer = setTimeout(() => {
          previewEnhanceTimer = null;
          lastPreviewEnhanceAt = Date.now();
          extendPreviewQuoteText(previewRoot);
        }, 0);
        return;
      }

      if (elapsed >= 3000) {
        lastPreviewEnhanceAt = now;
        extendPreviewQuoteText(previewRoot);
        return;
      }

      previewEnhanceTimer = setTimeout(() => {
        previewEnhanceTimer = null;
        lastPreviewEnhanceAt = Date.now();
        extendPreviewQuoteText(previewRoot);
      }, 3000 - elapsed);
    }

    function renderContent(raw) {
      return startupPerfDebug.measure('enhanceIsland.renderContent', () => {
      const box = $('.h-preview-box');
      if (!box.length) return;
      const previewContent = box.find('.h-threads-content');
      if (raw === lastPreviewRaw) return;
      lastPreviewRaw = raw;

      if (typeof raw !== 'string' || raw.trim() === '') {
        previewContent.text('');
        lastPreviewRenderedHtml = '';
        if (previewEnhanceTimer) {
          clearTimeout(previewEnhanceTimer);
          previewEnhanceTimer = null;
        }
        return;
      }
      previewContent.text('');
      previewContent[0]?.setAttribute('data-xdex-preview-spoiler-rendered', '1');
      function appendPreviewText(text, className) {
        if (text === '') return;
        const span = $('<span></span>').text(text);
        if (className) span.addClass(className);
        previewContent.append(span);
      }
      function appendPreviewQuoteLine(line) {
        previewContent.append($('<font color="#789922"></font>').text(line));
      }
      for (let i of raw.split('\n')) {
        i = i.replace(/ +/g, ' ');
        if (refExp.test(i)) {
          appendPreviewQuoteLine(i);
        } else {
          hideExp.lastIndex = 0;
          let lastIndex = 0;
          let match;
          let hasHiddenText = false;
          while ((match = hideExp.exec(i)) !== null) {
            hasHiddenText = true;
            appendPreviewText(i.slice(lastIndex, match.index));
            appendPreviewText(match[1], 'h-hidden-text');
            lastIndex = hideExp.lastIndex;
          }
          if (hasHiddenText) {
            appendPreviewText(i.slice(lastIndex));
          } else {
            appendPreviewText(i);
          }
        }
        previewContent.append('<br>');
      }
      const renderedHtml = previewContent[0]?.innerHTML || '';
      const previewChanged = renderedHtml !== lastPreviewRenderedHtml;
      lastPreviewRenderedHtml = renderedHtml;
      if (previewChanged) {
        bindPreviewQuoteHover(previewContent[0]);
        schedulePreviewEnhance(previewContent[0]);
      }
      // 自动识别链接
      if (typeof runAutoUrlLinkify === 'function') {
        runAutoUrlLinkify(previewContent[0]);
      }
      // 标记饼干背景色
      if (typeof markAllCookies === 'function') {
        try {
          const cfg = getFilterConfig();
          markAllCookies(cfg.markedGroups || [], previewContent[0]);
        } catch (e) {}
      }
      }, () => ({
        textLength: typeof raw === 'string' ? raw.length : 0,
        lines: typeof raw === 'string' && raw ? raw.split('\n').length : 0,
        previewBoxes: document.querySelectorAll('.h-preview-box').length
      }));
    }

  // 草稿：发帖成功清空（拦截模式优先）
  function 清空编辑(key) {
    if (!isDraftEnabled()) return;
    if (key) {
      deleteDraftSafe(getDraftStorageKey(key));
      deleteDraftSafe(key);
      return;
    }
    // ===== 兼容原“中间页”的旧逻辑（仍保留）=====
    const okBox = document.getElementsByClassName('success')[0];
    if (!okBox) return;
    if (!okBox.textContent.includes('回复成功')) return;

    const hrefEl = document.getElementById('href');
    if (!hrefEl || !hrefEl.href) return;

    const m = /https?:\/\/[^/]+(\/t\/\d+)/.exec(hrefEl.href);
    if (!m) return;
    deleteDraftSafe(getDraftStorageKey(m[1]));
    deleteDraftSafe(m[1]);
  }

    // 统一用事件清空，缺省用 getDraftKey()
    document.addEventListener('replySuccess', e => {
      清空编辑(e.detail?.key || getDraftKey());
    });

    // 草稿：载入
    function 载入编辑() {
      if (!isDraftEnabled()) return;
      if (!正文框.length) return;
      const key = getDraftKey();
      const migratedLegacy = migrateLegacyDraftIfNeeded(key);
      let draft = readDraftValue(key);
      if (!draft && migratedLegacy) draft = migratedLegacy;

      // 检查 URL 参数 r
      if (搜索参数.r) {
        const quote = `>>No.${搜索参数.r}\n`;
        if (!draft.startsWith(quote)) {
          draft = quote + draft;
        }
      }

      正文框.val(draft);
    }

    // 草稿：注册自动保存 + 初始化一次保存触发（原脚本用 $(保存编辑)）
    function 注册自动保存编辑() {
      if (draftAutosaveBound) {
        保存编辑();
        return;
      }
      draftAutosaveBound = true;

      // 原有正文框监听
      $('form').on('input', 保存编辑);

      // 颜文字选择变更时也更新预览（原生代码修改textarea值但不派发input事件）
      $('form').on('change', '#h-emot-select', 保存编辑);

      // 改为事件委托：监听 name 和 title 输入框
      $(document).on('input', 'form input[name="name"], form input[name="title"]', 保存编辑);

      // 文档就绪时同步一次
      $(保存编辑);
    }

    function 保存编辑() {
      return startupPerfDebug.measure('enhanceIsland.saveDraftAndPreview', () => {
      if (!正文框.length) return;
      if (isDraftEnabled()) {
        saveDraftValue(getDraftKey(), 正文框.val());
      }
      renderContent(正文框.val());

      const box = $('.h-preview-box');
      if (box.length) {
        const previewTitle = box.find('.h-threads-info-title');
        const previewEmail = box.find('.h-threads-info-email');

        const titleVal = $('form input[name="title"]').val() || '';
        const nameVal  = $('form input[name="name"]').val() || '';

        // 标题：空则隐藏，有值则显示并更新
        if (titleVal.trim() === '') {
          previewTitle.hide().text('无标题'); // 保留默认文案但不显示
        } else {
          previewTitle.text(titleVal.trim()).show();
        }

        // 名称：空则隐藏，有值则显示并更新
        if (nameVal.trim() === '') {
          previewEmail.hide().text('无名氏'); // 保留默认文案但不显示
        } else {
          previewEmail.text(nameVal.trim()).show();
        }
      }

      }, () => ({ textLength: 正文框 && 正文框.val ? String(正文框.val() || '').length : 0 }));
    }

    function isPreviewPlaceholderInfoId(anchor) {
      const text = anchor && anchor.textContent ? anchor.textContent.trim() : '';
      return text === 'No.9999999' && !!(anchor && anchor.closest && anchor.closest('.h-preview-box'));
    }

    // 点击 No.xxxx 插入引用（保持原先光标与选择区逻辑）
    function 注册追记引用串号() {
      if (!cfg.enableQuoteInsert) return;
      $('body').on('click', 'a.h-threads-info-id', e => {
        // 如果按住 Ctrl/Meta/Shift 键，允许浏览器默认行为（在新标签页/新窗口打开链接）
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        if (isPreviewPlaceholderInfoId(e.currentTarget)) {
          e.stopPropagation();
          return;
        }
        if (!正文框.length) return;
        const start = 正文框.prop('selectionStart');
        const end = 正文框.prop('selectionEnd');
        const len = end - start;
        const str = 正文框.val();
        const left = str.substring(0, start);
        const right = str.substring(end);
        const ref = `>>${e.currentTarget.textContent.trim()}`;
        正文框.val(
          start === 0
            ? `${ref}\n${right}`
            : end === str.length
              ? `${left}\n${ref}\n`
              : len > 0
                ? `${left} ${ref} ${right}`
                : `${left}\n${ref}`
        );
        正文框.trigger('input', '');
        保存编辑();
      });
    }

    // 粘贴图片到文件输入（保持原选择器）
    function 注册粘贴图片() {
      if (!cfg.enablePasteImage) return;
      window.addEventListener('paste', e => {
        const files = (e.clipboardData || e.originalEvent?.clipboardData)?.files || [];
        if (files.length) {
          const fileInput = document.querySelector('input[type="file"][name="image"]');
          if (fileInput) {
            fileInput.files = files;
            fileInput.dispatchEvent(new Event('input', { bubbles: true }));
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });
    }

    // 子函数：选择了图片后出现“清除图片”按钮；清除后按钮消失，恢复“选择文件”
    function 绑定清除图片按钮() {
        const $form = $('#h-post-form form, form[action="/Home/Forum/doReplyThread.html"]').first();
        if (!$form.length) return;

        const $file = $form.find('input[type="file"][name="image"]');
        if (!$file.length) return;

        if ($file.data('xdexClearBound')) return;
        $file.data('xdexClearBound', true);

        // 包一层容器，方便布局
        if (!$file.parent().hasClass('xdex-file-wrapper')) {
            $file.wrap('<div class="xdex-file-wrapper" style="display:flex;align-items:center;justify-content:space-between;width:100%;"></div>');
        }

      function 刷新按钮() {
          const hasFile = $file[0].files && $file[0].files.length > 0;
          let $btn = $form.find('.xdex-clear-image-btn');

          if (hasFile) {
              if (!$btn.length) {
                  $btn = $('<button type="button" class="xdex-clear-image-btn" title="清除图片">×</button>');
                  $btn.css({
                      fontSize: '16px',
                      lineHeight: '1',
                      padding: '2px 6px',
                      cursor: 'pointer'
                  });
                  $file.after($btn);

                  $btn.on('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                    // 清空文件
                    $file.val('');

                    // 直接调用预览清空逻辑
                    if (typeof updatePreviewFromFile === 'function') {
                        updatePreviewFromFile(null);
                    } else {
                        const $preview = $('.h-preview-box');
                        $preview.find('img').attr('src', '').removeAttr('src');
                        $preview.find('.h-threads-img-a').attr('href', '');
                    }

                    // 复原预览框容器状态
                    const $previewBox = $('.h-preview-box .h-threads-img-box');
                    $previewBox.removeClass('h-active');
                    $previewBox.find('.h-threads-img-a').css('height', '');
                    $previewBox.find('.h-threads-img')
                      .css({ transform: '', top: '0px', left: '0px' })
                      .removeAttr('data-rotate-index');

                    // 移除按钮
                    $(this).remove();
                });

              }
          } else {
              if ($btn.length) $btn.remove();
          }
      }

      $file.on('change', 刷新按钮);
      刷新按钮();
    }

    // 自动标题：择标题（与原逻辑等价）
    function 选择标题() {
      return selectEnhanceIslandTitleText() || document.title;
    }

    const 原始标题 = getEnhanceIslandOriginalTitle();

    function 自动标题() {
      if (!cfg.enableAutoTitle) return;

      // 每次调用时重新解析 URL
      const search = window.location.search;
      const 搜索参数 = {};
      search.replace(/^\?/, '').split('&').forEach(kev => {
        if (!kev) return;
        const [k, v] = kev.split('=', 2);
        搜索参数[k] = v;
      });
      const 路径 = window.location.pathname;
      const 路径分块 = 路径.split('/').splice(1);

      const 是串页 = 路径分块[0] === 't' || (路径分块[0] === 'Forum' && 路径分块[1] === 'po' && 路径分块[2] === 'id');
      if (!是串页) return;

      const 页码 = 路径分块[0] === 'Forum'
        ? (路径分块[5]?.replace(/\.html$/, '') || 1)
        : (搜索参数.page || 1);

      const 标题 = 选择标题();
      const titleEl = document.querySelector('title');
      if (titleEl) {
        titleEl.textContent = `${标题} - ${原始标题} - page ${页码}`;
      }
    }

    // 相对时间格式化（与原逻辑等价，目标 span.h-threads-info-createdat）
    function getFriendlyTime(machineReadableTime) {
      const date = new Date(machineReadableTime);
      const now = new Date();
      if (now < date) return machineReadableTime;

      let friendlyDate = machineReadableTime.slice(0, 10);
      let friendlyTime = machineReadableTime.slice(13, 21);
      const weekday = machineReadableTime.slice(11, 12);

      const diff = (now.getTime() - date.getTime()) / 1000;
      if (diff < 60) {
        friendlyTime = `${Math.floor(diff)}秒前`;
      } else if (diff < 3600) {
        friendlyTime = `${Math.floor(diff / 60)}分钟前`;
      } else if (diff < 24 * 3600) {
        friendlyTime = `${Math.floor(diff / 3600)}小时前 ${friendlyTime}`;
      }

      const yesterday = new Date(new Date(now - 1000 * 60 * 60 * 24).toLocaleDateString());
      if (now.toLocaleDateString() === date.toLocaleDateString()) {
        friendlyDate = '今天';
      } else if (yesterday.toLocaleDateString() === date.toLocaleDateString()) {
        friendlyDate = '昨天';
      } else if (yesterday - date < 1000 * 60 * 60 * 24 * 30) {
        friendlyDate = `${Math.floor((now - date) / (1000 * 60 * 60 * 24))}天前`;
      } else if (now.getFullYear() === date.getFullYear()) {
        friendlyDate = friendlyDate.slice(5);
      } else {
        friendlyDate = `${now.getFullYear() - date.getFullYear()}年前 ${friendlyDate}`;
      }
      return `${friendlyDate}(${weekday})${friendlyTime}`;
    }

    function formatDateStrOnPage(root = document) {
      if (!cfg.enableRelativeTime) return;
      if (document.visibilityState && document.visibilityState !== 'visible') return;
      if (getTimeDisplayMode() === 'exact') {
        restoreExactDateStrOnPage(root);
        return;
      }
      const $root = root && root.jquery ? root : $(root || document);
      const targets = withSelf($root, 'span.h-threads-info-createdat');
      targets.each(function () {
        const target = $(this);
        const timeStr = target.attr('data-xdex-original-time') || target.attr('title') || target.text().trim();
        if (!timeStr) return;
        const date = new Date(timeStr);
        if (Number.isNaN(date.getTime())) return;
        target.attr('data-xdex-original-time', timeStr);
        target.attr('title', timeStr);
        const friendlyTime = getFriendlyTime(timeStr);
        target.text(friendlyTime);
      });
    }

    function getTimeDisplayMode() {
      try {
        const saved = GM_getValue(SettingPanel.key, {});
        return saved && saved.timeDisplayMode === 'exact' ? 'exact' : 'relative';
      } catch (e) {
        return cfg.timeDisplayMode === 'exact' ? 'exact' : 'relative';
      }
    }

    function restoreExactDateStrOnPage(root = document) {
      if (document.visibilityState && document.visibilityState !== 'visible') return;
      const $root = root && root.jquery ? root : $(root || document);
      const targets = withSelf($root, 'span.h-threads-info-createdat');
      targets.each(function () {
        const target = $(this);
        const timeStr = target.attr('data-xdex-original-time') || target.attr('title');
        if (timeStr) target.text(timeStr);
      });
    }

    function applyTimeDisplayMode(root = document) {
      if (!cfg.enableRelativeTime) return;
      if (getTimeDisplayMode() === 'exact') {
        restoreExactDateStrOnPage(root);
        return;
      }
      formatDateStrOnPage(root);
    }

    function stopRelativeTimeScheduler() {
      if (window.__xdexRelativeTimeTimer) {
        clearInterval(window.__xdexRelativeTimeTimer);
        window.__xdexRelativeTimeTimer = null;
      }
      if (window.__xdexRelativeTimeVisibilityHandler) {
        document.removeEventListener('visibilitychange', window.__xdexRelativeTimeVisibilityHandler);
        window.__xdexRelativeTimeVisibilityHandler = null;
      }
    }

    function ensureRelativeTimeScheduler() {
      if (!cfg.enableRelativeTime) {
        stopRelativeTimeScheduler();
        return;
      }

      if (!window.__xdexRelativeTimeVisibilityHandler) {
        window.__xdexRelativeTimeVisibilityHandler = () => {
          if (document.visibilityState === 'visible') {
            applyTimeDisplayMode();
          }
        };
        document.addEventListener('visibilitychange', window.__xdexRelativeTimeVisibilityHandler, { passive: true });
      }

      if (!window.__xdexRelativeTimeTimer) {
        window.__xdexRelativeTimeTimer = setInterval(() => {
          applyTimeDisplayMode();
        }, 5000);
      }

      if (!document.visibilityState || document.visibilityState === 'visible') {
        applyTimeDisplayMode();
      }
    }

    window.__xdexApplyTimeDisplayMode = applyTimeDisplayMode;

    // 路由：各页面初始化（与原逻辑一致）
    function 串() {
      if (cfg.enablePreview) initPreviewBox();
      if (isDraftEnabled()) 载入编辑();
      if (cfg.enableQuoteInsert) 注册追记引用串号();
      if (cfg.enablePreview || isDraftEnabled()) 注册自动保存编辑();
      if (cfg.enablePasteImage) 注册粘贴图片();
      绑定清除图片按钮();
      if (cfg.enableAutoTitle) 自动标题();
      ensureRelativeTimeScheduler();
    }

    function 串只看po() {
      if (cfg.enableAutoTitle) 自动标题();
      ensureRelativeTimeScheduler();
    }

    function 版块() {
      if (cfg.enablePreview) initPreviewBox();
      if (cfg.enablePreview || isDraftEnabled()) 注册自动保存编辑();
      //if (cfg.enableQuoteInsert) 注册追记引用串号();
      if (cfg.enablePasteImage) 注册粘贴图片();
      绑定清除图片按钮();
      ensureRelativeTimeScheduler();
    }

    function 时间线() {
      if (cfg.enablePreview) initPreviewBox();
      if (cfg.enablePreview || isDraftEnabled()) 注册自动保存编辑();
      //if (cfg.enableQuoteInsert) 注册追记引用串号();
      if (cfg.enablePasteImage) 注册粘贴图片();
      绑定清除图片按钮();
      ensureRelativeTimeScheduler();
    }

    function 回复成功() {
      if (isDraftEnabled()) 清空编辑();
      if (cfg.enablePasteImage) 注册粘贴图片();
    }
    document.addEventListener('replySuccess', e => {
        回复成功(e.detail?.key);
    });

    function 未知() {
      if (cfg.enablePasteImage) 注册粘贴图片();
    }

    // 一级路径解析（支持 m 前缀）
    const 一层路径 = 路径分块[0] === 'm' ? 路径分块[1] : 路径分块[0];

    // 入口分流（与原脚本一致）
    switch (一层路径) {
      case 't':
        串();
        break;
      case 'f':
        版块();
        break;
      case 'Forum':
        if (路径分块[1] === 'po' && 路径分块[2] === 'id') {
          串只看po();
        } else if (路径分块[1] === 'timeline' && 路径分块[2] === 'id') {
          // 这里就是时间线页面
          时间线();
        } else {
          未知();
        }
        break;
      case 'Home':
        if (路径 === '/Home/Forum/doReplyThread.html') {
          回复成功();
        } else {
          未知();
        }
        break;
      case 'Member':
        if (路径.startsWith('/Member/User/Cookie/export/id/')) {
          console.debug('//不是我的TODO');
        }
        break;
      default:
        未知();
    }

    // 首次渲染预览（若需要）
    if (cfg.enablePreview) {
      renderContent(正文框.val ? (正文框.val() || '') : '');
    }

    // 以便无缝翻页后修改标题
    window.enhanceIslandAutoTitle = 自动标题;
    }, () => {
      const textarea = document.querySelector('textarea.h-post-form-textarea');
      return { path: location.pathname, textLength: textarea ? String(textarea.value || '').length : 0 };
    });
  }

  /* --------------------------------------------------
   * tag 15. 板块页快速回复入口（含时间线支持）
   * -------------------------------------------------- */
  function replyQuicklyOnBoardPage() {
    // 同时识别 /f/ 板块 和 /Forum/timeline/id/{id} 时间线
    const isBoardPage = /^\/f\//.test(location.pathname);
    const timelineMatch = location.pathname.match(/\/Forum\/timeline\/id\/(\d+)(?:\/page\/\d+(\.html)?)?/i);
    const isTimeline = !!timelineMatch;
    if (!isBoardPage && !isTimeline) return;

    // 时间线 id 与名称映射（1-7）
    const timelineId = timelineMatch ? timelineMatch[1] : null;
    const timelineNameMap = {
      '1': '综合线',
      '2': '创作线',
      '3': '非创作线',
      '4': '亚文化线',
      '5': '综合2线',
      '6': '游戏线',
      '7': '生活线'
    };

    // boardBaseName：仅板块/时间线的基础名称（不包含后缀），显示文本按模式拼接后缀
    const boardBaseName = isTimeline
      ? (timelineNameMap[timelineId] || '时间线')
      : decodeURIComponent((location.pathname || '').replace(/^\/f\//, '').split('/')[0] || '');

    // 持久变量：保存当前正在回复的串号 / 缓存的回复参数
    let currentReplyTid = null;
    let pendingReplyParams = null; // { tid, resto, hash }

    // ---------- 子函数：为时间线插入回复表单（第四个子函数） ----------
    function bindTimelineReplyForm() {
      // 找到页面上的第一个 <hr>，在其下插入我们要的回复表单容器与一个 <hr> 与线程列表分隔
      const $firstHr = $('hr').first();
      if (!$firstHr.length) return;

      const timelineLabel = timelineNameMap[timelineId] || '时间线';

      const emotOptions = [
        '<option value="|∀ﾟ">|∀ﾟ</option>',
        '<option value="(´ﾟДﾟ`)">(´ﾟДﾟ`)</option>',
        '<option value="(;´Д`)">(;´Д`)</option>',
        '<option value="(｀･ω･)">(｀･ω･)</option>',
        '<option value="(=ﾟωﾟ)=">(=ﾟωﾟ)=</option>',
        '<option value="| ω・´)">| ω・´)</option>',
        '<option value="|-` )">|-` )</option>',
        '<option value="|д` )">|д` )</option>',
        '<option value="|ー` )">|ー` )</option>',
        '<option value="|∀` )">|∀` )</option>',
        '<option value="(つд⊂)">(つд⊂)</option>',
        '<option value="(ﾟДﾟ≡ﾟДﾟ)">(ﾟДﾟ≡ﾟДﾟ)</option>',
        '<option value="(＾o＾)ﾉ">(＾o＾)ﾉ</option>',
        '<option value="(|||ﾟДﾟ)">(|||ﾟДﾟ)</option>',
        '<option value="( ﾟ∀ﾟ)">( ﾟ∀ﾟ)</option>',
        '<option value="( ´∀`)">( ´∀`)</option>',
        '<option value="(*´∀`)">(*´∀`)</option>',
        '<option value="(*ﾟ∇ﾟ)">(*ﾟ∇ﾟ)</option>',
        '<option value="(*ﾟーﾟ)">(*ﾟーﾟ)</option>',
        '<option value="(　ﾟ 3ﾟ)">(　ﾟ 3ﾟ)</option>',
        '<option value="( ´ー`)">( ´ー`)</option>',
        '<option value="( ・_ゝ・)">( ・_ゝ・)</option>',
        '<option value="( ´_ゝ`)">( ´_ゝ`)</option>',
        '<option value="(*´д`)">(*´д`)</option>',
        '<option value="(・ー・)">(・ー・)</option>',
        '<option value="(・∀・)">(・∀・)</option>',
        '<option value="(ゝ∀･)">(ゝ∀･)</option>',
        '<option value="(〃∀〃)">(〃∀〃)</option>',
        '<option value="(*ﾟ∀ﾟ*)">(*ﾟ∀ﾟ*)</option>',
        '<option value="( ﾟ∀。)">( ﾟ∀。)</option>',
        '<option value="( `д´)">( `д´)</option>',
        '<option value="(`ε´ )">(`ε´ )</option>',
        '<option value="(`ヮ´ )">(`ヮ´ )</option>',
        '<option value="σ`∀´)">σ`∀´)</option>',
        '<option value=" ﾟ∀ﾟ)σ"> ﾟ∀ﾟ)σ</option>',
        '<option value="ﾟ ∀ﾟ)ノ">ﾟ ∀ﾟ)ノ</option>',
        '<option value="(╬ﾟдﾟ)">(╬ﾟдﾟ)</option>',
        '<option value="(|||ﾟдﾟ)">(|||ﾟдﾟ)</option>',
        '<option value="( ﾟдﾟ)">( ﾟдﾟ)</option>',
        '<option value="Σ( ﾟдﾟ)">Σ( ﾟдﾟ)</option>',
        '<option value="( ;ﾟдﾟ)">( ;ﾟдﾟ)</option>',
        '<option value="( ;´д`)">( ;´д`)</option>',
        '<option value="(　д ) ﾟ ﾟ">(　д ) ﾟ ﾟ</option>',
        '<option value="( ☉д⊙)">( ☉д⊙)</option>',
        '<option value="(((　ﾟдﾟ)))">(((　ﾟдﾟ)))</option>',
        '<option value="( ` ・´)">( ` ・´)</option>',
        '<option value="( ´д`)">( ´д`)</option>',
        '<option value="( -д-)">( -д-)</option>',
        '<option value="(&gt;д&lt;)">(&gt;д&lt;)</option>',
        '<option value="･ﾟ( ﾉд`ﾟ)">･ﾟ( ﾉд`ﾟ)</option>',
        '<option value="( TдT)">( TдT)</option>',
        '<option value="(￣∇￣)">(￣∇￣)</option>',
        '<option value="(￣3￣)">(￣3￣)</option>',
        '<option value="(￣ｰ￣)">(￣ｰ￣)</option>',
        '<option value="(￣ . ￣)">(￣ . ￣)</option>',
        '<option value="(￣皿￣)">(￣皿￣)</option>',
        '<option value="(￣艸￣)">(￣艸￣)</option>',
        '<option value="(￣︿￣)">(￣︿￣)</option>',
        '<option value="(￣︶￣)">(￣︶￣)</option>',
        '<option value="ヾ(´ωﾟ`)">ヾ(´ωﾟ`)</option>',
        '<option value="(*´ω`*)">(*´ω`*)</option>',
        '<option value="(・ω・)">(・ω・)</option>',
        '<option value="( ´・ω)">( ´・ω)</option>',
        '<option value="(`・ω)">(`・ω)</option>',
        '<option value="(´・ω・`)">(´・ω・`)</option>',
        '<option value="(`・ω・´)">(`・ω・´)</option>',
        '<option value="( `_っ´)">( `_っ´)</option>',
        '<option value="( `ー´)">( `ー´)</option>',
        '<option value="( ´_っ`)">( ´_っ`)</option>',
        '<option value="( ´ρ`)">( ´ρ`)</option>',
        '<option value="( ﾟωﾟ)">( ﾟωﾟ)</option>',
        '<option value="(oﾟωﾟo)">(oﾟωﾟo)</option>',
        '<option value="(　^ω^)">(　^ω^)</option>',
        '<option value="(｡◕∀◕｡)">(｡◕∀◕｡)</option>',
        '<option value="/( ◕‿‿◕ )\\">/( ◕‿‿◕ )\\</option>',
        '<option value="ヾ(´ε`ヾ)">ヾ(´ε`ヾ)</option>',
        '<option value="(ノﾟ∀ﾟ)ノ">(ノﾟ∀ﾟ)ノ</option>',
        '<option value="(σﾟдﾟ)σ">(σﾟдﾟ)σ</option>',
        '<option value="(σﾟ∀ﾟ)σ">(σﾟ∀ﾟ)σ</option>',
        '<option value="|дﾟ )">|дﾟ )</option>',
        '<option value="┃電柱┃">┃電柱┃</option>',
        '<option value="ﾟ(つд`ﾟ)">ﾟ(つд`ﾟ)</option>',
        '<option value="ﾟÅﾟ )　">ﾟÅﾟ )　</option>',
        '<option value="⊂彡☆))д`)">⊂彡☆))д`)</option>',
        '<option value="⊂彡☆))д´)">⊂彡☆))д´)</option>',
        '<option value="⊂彡☆))∀`)">⊂彡☆))∀`)</option>',
        '<option value="(´∀((☆ミつ">(´∀((☆ミつ</option>',
        '<option value="･ﾟ( ﾉヮ´ )">･ﾟ( ﾉヮ´ )</option>',
        '<option value="(ﾉ)`ω´(ヾ)">(ﾉ)`ω´(ヾ)</option>',
        '<option value="ᕕ( ᐛ )ᕗ">ᕕ( ᐛ )ᕗ</option>',
        '<option value="(　ˇωˇ)">(　ˇωˇ)</option>',
        '<option value="( ｣ﾟДﾟ)｣&lt;">( ｣ﾟДﾟ)｣&lt;</option>',
        '<option value="( ›´ω`‹ )">( ›´ω`‹ )</option>',
        '<option value="(;´ヮ`)7">(;´ヮ`)7</option>',
        '<option value="(`ゥ´ )">(`ゥ´ )</option>',
        '<option value="(`ᝫ´ )">(`ᝫ´ )</option>',
        '<option value="( ᑭ`д´)ᓀ))д´)ᑫ">( ᑭ`д´)ᓀ))д´)ᑫ</option>',
        '<option value="σ( ᑒ )">σ( ᑒ )</option>',
        '<option value="(`ヮ´ )σ`∀´) ﾟ∀ﾟ)σ">齐齐蛤尔</option>',
        '<option value="吁~~~~　　rnm，退钱！<br>&nbsp;　　　/　　　/ <br>(　ﾟ 3ﾟ) `ー´) `д´) `д´)">大嘘</option>',
        '<option value="[h] [/h]">防剧透</option>',
        '<option value="[n]">骰子</option>',
        '<option value="[n,m]">高级骰子</option>'
      ].join('\n');

      const formHtml = `
        <div id="h-post-form" class="uk-container-center uk-width-small-8-10 uk-width-medium-4-10 uk-width-large-4-10">
          <form action="/Home/Forum/doReplyThread.html" method="post" enctype="multipart/form-data">
            <!-- 隐藏字段，默认用 与 原来 setMode 一致的占位值（会在点击链接时被替换） -->
            <input type="hidden" name="resto" value="20011114">
            <input type="hidden" name="__hash__" value="cirns">

            <!-- 回应模式行（包含兼容原来逻辑的类和占位）-->
            <div class="uk-grid uk-grid-small h-post-form-grid js-reply-mode-row">
              <div class="uk-width-1-5">
                <div class="h-post-form-title">回应模式</div>
              </div>
              <div class="h-post-form-input uk-width-3-5 js-reply-mode-text">
                ${timelineLabel}-快速回复
              </div>
              <div class="h-post-form-option uk-width-1-5">
                <div class="reply-mode-toggle" style="display:flex; flex-direction:row; align-items:center; justify-content:flex-end; gap:6px;">
                  <span class="js-reply-extra" style="display:none; display:inline-flex; align-items:center;"></span>
                  <button type="button" class="js-toggle-mode" style="display:inline-flex; flex:0 0 auto; align-items:center; width:auto; padding:2px 8px; font-size:13px; cursor:pointer;">切换</button>
                </div>
              </div>
            </div>

            <!-- 以下为你提供的表单其余内容（保留原样，确保 textarea, input 名称等一致） -->
            <div class="uk-grid uk-grid-small h-post-form-grid">
              <div class="uk-width-1-5">
                <div class="h-post-form-title">名 称</div>
              </div>
              <div class="h-post-form-input uk-width-3-5">
                <input type="text" name="name" size="28" value="" maxlength="100">
              </div>
              <div class="h-post-form-option uk-width-1-5">
                <label class="h-admin-tool"><input type="checkbox" name="isManager" value="true">管理员</label>
              </div>
            </div>

            <div class="uk-grid uk-grid-small h-post-form-grid">
              <div class="uk-width-1-5">
                <div class="h-post-form-title">E-mail</div>
              </div>
              <div class="h-post-form-input uk-width-3-5">
                <input type="text" name="email" size="28" value="" maxlength="100">
              </div>
            </div>

            <div class="uk-grid uk-grid-small h-post-form-grid">
              <div class="uk-width-1-5">
                <div class="h-post-form-title">标题</div>
              </div>
              <div class="h-post-form-input uk-width-3-5">
                <input type="text" name="title" size="28" value="" maxlength="100">
              </div>
              <div class="h-post-form-option uk-width-1-5">
                <input type="submit" value="送出">
              </div>
            </div>

            <!-- 颜文字、正文、附图等 -->
            <div class="uk-grid uk-grid-small h-post-form-grid">
              <div class="uk-width-1-5">
                <div class="h-post-form-title">颜文字</div>
              </div>
              <div class="h-post-form-input uk-width-1-5">
                <select id="h-emot-select">
                ${emotOptions}
                </select>
              </div>
            </div>

            <div class="uk-grid uk-grid-small h-post-form-grid">
              <div class="uk-width-1-5">
                <div class="h-post-form-title h-post-form-textarea-title">正文</div>
              </div>
              <div class="h-post-form-input uk-width-4-5">
                <textarea name="content" maxlength="10000" class="h-post-form-textarea"></textarea>
              </div>
            </div>

            <div class="uk-grid uk-grid-small h-post-form-grid">
              <div class="uk-width-1-5">
                <div class="h-post-form-title">附加图片</div>
              </div>
              <div class="h-post-form-option uk-width-1-6">
                <label class="h-water-tool">
                  <input type="checkbox" name="water" value="true" checked="true">水印
                </label>
              </div>
              <div class="h-post-form-input uk-width-3-5">
                <input type="file" name="image">
              </div>
            </div>

            <!-- 如果页面需要 __hash__ 的实际值，可以在点击串链接并 fetch 后替换此隐藏值 -->
            <!-- 注意：原来 HTML 示例中的 long-hash 在这里用占位 'cirns'，后续会覆盖 -->
            <input type="hidden" name="__hash__" value="cirns">
          </form>
          <div class="uk-clearfix"></div>
        </div>
      `;

      // 插入表单：在第一个 hr 下插入表单和一个新的 hr（把表单与列表分离）
      $firstHr.after(formHtml + '<hr>');

      // 返回插入的 form jQuery 对象（方便调用端定位）
      return $('#h-post-form form').first();
      document.dispatchEvent(new Event('timelineReplyFormInserted'));
    }

    // ---------- 根据页面场景获取或插入表单 ----------
    let $formPost = $('form[action="/Home/Forum/doPostThread.html"]').first();   // 板块页发串表单
    let $formReply = $('form[action="/Home/Forum/doReplyThread.html"]').first(); // 串内页回串表单
    // TODO 值班室板块回复表单需要选择原因，无论在板块页快速回复还是串内回复
    if ($formPost.length) {
        // 当前是板块页，直接使用发串表单
    } else if ($formReply.length) {
        // 当前是串内页，直接使用回串表单
    } else if (/\/timeline|\/feed/.test(location.pathname)) {
        // 当前是时间线页，无表单 → 插入一个回串表单
        $formReply = $(`
            <form action="/Home/Forum/doReplyThread.html" method="post" id="timeline-reply-form">
                <!-- 这里填入串内页回复表单的必要字段 -->
            </form>
        `);
        $('body').append($formReply);
    }

    if (!$formPost.length && isTimeline) {
      $formPost = bindTimelineReplyForm();
    }
    // 时间线：插入/刷新完表单后，纳入统一的“包裹 + 折叠”
    if (isTimeline && $formPost && $formPost.length) {
      ensureCollapsed($formPost, '『回复』');
    }

    if (!$formPost || !$formPost.length) return;

    // 如果表单中已经存在“回应模式”行（例如我们插入的时间线表单），则复用；否则按原逻辑插入 $row
    let $row = null;
    if ($formPost.find('.h-post-form-title:contains("回应模式")').length) {
      // 优先找到带 js-reply-mode-row 的行（如果插入时已包含）
      $row = $formPost.find('.js-reply-mode-row').first();
    } else {
      // 原有逻辑：找到 名称 行 作为插入位置
      const $nameRow = $formPost.find('.h-post-form-title').filter(function(){
        return $(this).text().trim() === '名 称';
      }).closest('.h-post-form-grid').first();
      if (!$nameRow.length) return;

      // 插入回应模式行（与原代码结构一致）
      $row = $(`
        <div class="uk-grid uk-grid-small h-post-form-grid js-reply-mode-row">
          <div class="uk-width-1-5">
            <div class="h-post-form-title">回应模式</div>
          </div>
          <div class="h-post-form-input uk-width-3-5 js-reply-mode-text">
            板块名或串号
          </div>
          <div class="h-post-form-option uk-width-1-5">
            <div class="reply-mode-toggle" style="display:flex; flex-direction:row; align-items:center; justify-content:flex-end; gap:6px;">
              <span class="js-reply-extra" style="display:none; display:inline-flex; align-items:center;"></span>
              <button type="button" class="js-toggle-mode" style="display:inline-flex; flex:0 0 auto; align-items:center; width:auto; padding:2px 8px; font-size:13px; cursor:pointer;">切换</button>
            </div>
          </div>
        </div>
      `);

      // 插入到 placeholder 或 名称行之前
      let $insertBefore = $formPost.find('.xdex-placeholder').first();
      if ($insertBefore.length) {
        $insertBefore.before($row);
      } else {
        $nameRow.before($row);
      }
    }

    // 如果当前页面是时间线：不允许发串，隐藏切换按钮并强制设为 回复 模式（但保留临时/连续按钮）
    if (isTimeline) {
      $row.find('.js-toggle-mode').hide();
    }

    // 状态与事件（复用原有逻辑）
    window.replyModeState = { mode: '发串', extra: null };
    function emitReplyModeChange() {
      document.dispatchEvent(new CustomEvent('replyModeChange', { detail: window.replyModeState }));
    }

    // 切换逻辑（保留原版 setMode，外部依赖不变）
    const $modeBtns = $row.find('.js-mode'); // 兼容原代码（若不存在不会报错）
    function setMode(mode, {silent = false} = {}) {
      $modeBtns.removeClass('active').filter('[data-mode="'+mode+'"]').addClass('active');

      if (mode === '发串') {
      $formPost.attr('action', '/Home/Forum/doPostThread.html');
      $row.find('.js-reply-extra').hide().empty();
      $row.find('.js-reply-mode-text').text(boardBaseName ? (boardBaseName + '-发串') : '板块-发串');
        window.replyModeState = { mode: '发串', extra: null };

        if (!silent) {
          toast('已切换到 发串 模式');
        }
      } else if (mode === '回复') {
        $formPost.attr('action', '/Home/Forum/doReplyThread.html');

        // 确保 hidden 存在
        let $resto = $formPost.find('input[name="resto"]');
        if (!$resto.length) {
          $resto = $('<input type="hidden" name="resto">').appendTo($formPost);
        }
        let $hash = $formPost.find('input[name="__hash__"]');
        if (!$hash.length) {
          $hash = $('<input type="hidden" name="__hash__">');
          $resto.after($hash); // 保证顺序
        }

        let autofilled = false;

        if (pendingReplyParams) {
          // 自动填充缓存的参数
          $resto.val(pendingReplyParams.resto);
          $hash.val(pendingReplyParams.hash);
          $row.find('.js-reply-mode-text').html(
            `<font color="#789922">No.${pendingReplyParams.tid}</font>`
          );
          const $replyModeText = $row.find('.js-reply-mode-text');
          // 触发扩展引用
          const root = $replyModeText[0];
          if (typeof initExtendedContent === 'function') { try { initExtendedContent(root); } catch(e){} }
          if (typeof initContent === 'function') { try { initContent(root); } catch(e){} }
          //if (typeof autoHideRefView === 'function') { try { autoHideRefView(root); } catch(e){} }

          toast('已自动填充回复串号，请确认无误后再发送');
          pendingReplyParams = null; // 用过一次就清空
          autofilled = true;
        } else {
          // 默认逻辑
          $resto.val('20011114');
          $hash.val('cirns');
          // 对于时间线，默认显示的文本已经在插入表单时写成 `${timeline}-快速回复`，这里保持不变
          if (!isTimeline) {
            $row.find('.js-reply-mode-text').text((boardBaseName || '板块') + '-快速回复');
          }
        }

        // 插入“临时/连续”按钮（若尚未插入）
        const $extra = $row.find('.reply-mode-toggle .js-reply-extra');
        if (!$extra.children().length) {
          // 包裹容器
          const $wrapper = $('<div class="xdex-file-wrapper" style="display:flex;align-items:center;justify-content:space-between;width:100%;"></div>');

          // “×”按钮
          const $btnReset = $('<button type="button" class="js-reset" style="margin-right:6px;">×</button>');
          $btnReset.on('click', function(){
            // 重置 hidden 值
            $formPost.find('input[name="resto"]').val('20011114');
            $formPost.find('input[name="__hash__"]').val('cirns');

            // 重置显示文本
            if (isTimeline) {
              const timelineNames = {1:'综合线',2:'创作线',3:'非创作线',4:'亚文化线',5:'综合2线',6:'游戏线',7:'生活线'};
              const label = timelineNames[timelineId] || '时间线';
              $row.find('.js-reply-mode-text').text(label + '-快速回复');
            } else {
              $row.find('.js-reply-mode-text').text((boardBaseName || '板块') + '-快速回复');
            }

            // **清空正文 textarea**
            $formPost.find('textarea.h-post-form-textarea').val('');
            // **清空标题、名称、Email**
            $formPost.find('input[name="title"]').val('');
            $formPost.find('input[name="name"]').val('');
            $formPost.find('input[name="email"]').val('');

            // 重置预览框
            const previewBox = document.querySelector('.h-preview-box');
            if (previewBox) {
              // 获取当前饼干
              const cur = getCurrentCookie();
              const cookieText = cur ? cur.name : '--';

                previewBox.innerHTML = `
                <div class="h-preview-box">
                  <div class="h-threads-item">
                    <div class="h-threads-item-replies">
                      <div class="h-threads-item-reply">
                        <div class="h-threads-item-reply-main">
                          <div class="h-threads-img-box">
                            <div class="h-threads-img-tool uk-animation-slide-top">
                              <span class="h-threads-img-tool-btn h-threads-img-tool-small uk-button-link"><i class="uk-icon-minus"></i>收起</span>
                              <a href="javascript:;" class="h-threads-img-tool-btn h-threads-img-tool-large uk-button-link"><i class="uk-icon-search-plus"></i>查看大图</a>
                              <span class="h-threads-img-tool-btn h-threads-img-tool-left uk-button-link"><i class="uk-icon-reply"></i>向左旋转</span>
                              <span class="h-threads-img-tool-btn h-threads-img-tool-right uk-button-link"><i class="uk-icon-share"></i>向右旋转</span>
                            </div>
                            <a class="h-threads-img-a"><img src="" align="left" border="0" hspace="20" class="h-threads-img"></a>
                          </div>
                          <div class="h-threads-info">
                            <span class="h-threads-info-title"></span>
                            <span class="h-threads-info-email"></span>
                            <span class="h-threads-info-createdat">2013-07-11(六)12:07:12</span>
                            <span class="h-threads-info-uid">ID:${cookieText}</span>
                            <span class="h-threads-info-report-btn">
                              [<a href="/f/值班室" target="_blank">举报</a>]
                            </span>
                            <a href=":javascript:;" class="h-threads-info-id" target="_blank">No.9999999</a>
                          </div>
                          <div class="h-threads-content">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>`;
              if (typeof enableHDImage === 'function') {
                enableHDImage(previewBox);
              }
            }
            updatePreviewCookieId();
            toast('已重置');
          });

          // “临时/连续”按钮
          const $btnExtra = $('<button type="button" class="js-extra" data-extra="临时" style="display:inline-flex; flex:0 0 auto; align-items:center; width:auto; padding:2px 8px; font-size:13px; cursor:pointer;">临时</button>');
          $btnExtra.on('click', function(){
            const cur = $(this).attr('data-extra');
            if (cur === '临时') {
              $(this).attr('data-extra','连续').text('连续');
              window.replyModeState = { mode: '回复', extra: '连续' };
              toast('已切换到 连续 回复模式');
            } else {
              $(this).attr('data-extra','临时').text('临时');
              window.replyModeState = { mode: '回复', extra: '临时' };
              toast('已切换到 临时 回复模式');
            }
            emitReplyModeChange();
          });

          // 组装
          $wrapper.append($btnReset).append($btnExtra);
          $extra.append($wrapper);
        }
        $extra.show();

        window.replyModeState = { mode: '回复', extra: '临时' };

        // 只有在没有自动填充时，才显示默认切换提示
        if (!autofilled && !silent) {
          toast('已切换到 回复 模式');
        }
      }
      emitReplyModeChange();
    }

    // 绑定模式按钮（原先存在的行为）
    $modeBtns.on('click', function(){ setMode($(this).attr('data-mode')); });
    // 初始状态：如果是时间线则强制 回复 模式（silent），否则默认静默发串
    if (isTimeline) {
      setMode('回复', {silent: true});
      // extra 模式
      if (SettingPanel.state.replyExtraDefault === '连续') {
        // 模拟点击一次“临时/连续”按钮，或者直接设置
        window.replyModeState.extra = '连续';
        $row.find('.js-extra').attr('data-extra','连续').text('连续');
      }
    } else {
      setMode(SettingPanel.state.replyModeDefault, {silent: true});
      // extra 模式
      if (SettingPanel.state.replyExtraDefault === '连续') {
        window.replyModeState.extra = '连续';
        $row.find('.js-extra').attr('data-extra','连续').text('连续');
      }
    }

    // 切换按钮逻辑（若存在切换按钮）
    $row.find('.js-toggle-mode').on('click', function(){
      if (window.replyModeState.mode === '发串') {
        setMode('回复');
      } else {
        setMode('发串');
      }
    });

    // 监听发送成功信号（兼容原逻辑）
    document.addEventListener('replySuccess', e => {
      if (window.replyModeState?.mode !== '回复') return;
      const $form = $('form[action="/Home/Forum/doReplyThread.html"]').first();

      if (window.replyModeState.extra === '临时') {
        // 重置为默认
        $form.find('input[name="resto"]').val('20011114');
        $form.find('input[name="__hash__"]').val('cirns');
        const displayName = isTimeline
          ? (timelineNameMap[timelineId] || '时间线')
          : (boardBaseName || '板块');

        $('.js-reply-mode-row .js-reply-mode-text').text(`${displayName}-快速回复`);

        // 广播“临时回复发送成功”
        document.dispatchEvent(new CustomEvent('tempReplySuccess', {
          detail: { key: e.detail?.key, tid: e.detail?.tid }
        }));
      } else if (window.replyModeState.extra === '连续') {
        // 不清理，广播“连续回复发送成功”
        document.dispatchEvent(new CustomEvent('contReplySuccess', {
          detail: { key: e.detail?.key, tid: e.detail?.tid }
        }));
      }
    });

    // ---------- 子函数2：处理带 r= 的串链接点击（复用并兼容时间线插入的表单） ----------
    function bindReplyQuoteLinks() {
      $('body').on('click', 'a[href*="/t/"][href*="r="]', function(e) {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        const url = new URL(this.href, location.origin);
        const tid = url.pathname.split('/')[2];
        const rid = url.searchParams.get('r');
        currentReplyTid = tid;
        if (!tid || !rid) return;
        e.preventDefault();

        const $textarea = $('textarea.h-post-form-textarea');
        if (!$textarea.length) return;

        if (window.replyModeState?.mode === '发串') {
          insertQuote($textarea, rid);

          // 抓取参数并缓存（用于后续切换到 回复 模式 自动填充）
          $.get(`/t/${tid}?r=${rid}`).done(html => {
            const $doc = $(html);
            const restoVal = $doc.find('form[action="/Home/Forum/doReplyThread.html"] input[name="resto"]').val();
            const hashVal  = $doc.find('form[action="/Home/Forum/doReplyThread.html"] input[name="__hash__"]').val();
            if (restoVal && hashVal) {
              pendingReplyParams = { tid, resto: restoVal, hash: hashVal };
            }
          });
        }
        else {
          $.get(`/t/${tid}?r=${rid}`).done(html => {
            const $doc = $(html);
            const restoVal = $doc.find('form[action="/Home/Forum/doReplyThread.html"] input[name="resto"]').val();
            const hashVal  = $doc.find('form[action="/Home/Forum/doReplyThread.html"] input[name="__hash__"]').val();

            if (restoVal && hashVal) {
              const $form = $('form[action="/Home/Forum/doReplyThread.html"]').first();
              $form.find('input[name="resto"]').val(restoVal);
              $form.find('input[name="__hash__"]').val(hashVal);

              // 在回应模式行中显示串号（直接插入 font）
              const $replyModeText = $('.js-reply-mode-row .js-reply-mode-text');
              $replyModeText.html(
                `<font color="#789922" data-darkreader-inline-color="" style="--darkreader-inline-color: var(--darkreader-text-789922, #aec66f);">No.${tid}</font>`
              );

              const root = $replyModeText[0];
              if (typeof initExtendedContent === 'function') { try { initExtendedContent(root); } catch(e){} }
              if (typeof initContent === 'function') { try { initContent(root); } catch(e){} }
              //if (typeof autoHideRefView === 'function') { try { autoHideRefView(root); } catch(e){} }
            }

            if (tid !== rid) {
              insertQuote($textarea, rid);
            }

          });
        }
      });

      function insertQuote($textarea, rid) {
        const start = $textarea.prop('selectionStart');
        const end   = $textarea.prop('selectionEnd');
        const str   = $textarea.val();
        const left  = str.substring(0, start);
        const right = str.substring(end);
        const ref   = `>>No.${rid}`;

        let newVal;
        if (start === 0) {
          newVal = `${ref}\n${right}`;
        } else if (end === str.length) {
          newVal = `${left}\n${ref}\n`;
        } else if (end > start) {
          newVal = `${left} ${ref} ${right}`;
        } else {
          newVal = `${left}\n${ref}${right}`;
        }

        $textarea.val(newVal).trigger('input');
      }
    }

    // ---------- 公用：重新应用页面增强（保持原样） ----------
    // function reapplyPageEnhancements(root = document) {
    //   if (typeof hideEmptyTitleAndEmail === 'function') {try { hideEmptyTitleAndEmail(root); } catch (e) {}}
    //   //if (typeof updateReplyNumbers === 'function') {try { updateReplyNumbers(root); } catch (e) {}}
    //   if (typeof highlightPO === 'function') {try { highlightPO(root); } catch (e) {}}
    //   if (typeof enableHDImageAndLayoutFix === 'function') {try { enableHDImageAndLayoutFix(root); } catch (e) {}}
    //   if (typeof extendQuote === 'function') {try { extendQuote(root); } catch (e) {}}
    //   try { if (typeof applyFilters === 'function') applyFilters(cfg, root); } catch (e) { try { if (typeof applyFilters === 'function') applyFilters(cfg); } catch (e) {} }
    //   if (typeof initExtendedContent === 'function') {try { initExtendedContent(root); } catch (e) {}}
    //   if (typeof initContent === 'function') {try { initContent(root); } catch (e) {}}
    //   if (typeof autoHideRefView === 'function') {try { autoHideRefView(root); } catch (e) {}}
    //   if (typeof enablePostExpand === 'function') {try { aenablePostExpand(); } catch (e) {}}
    // }

    // ---------- 子函数3：板块/时间线快速回复刷新逻辑（已扩展以支持时间线） ----------
    // done 将板块页快速回复-局部刷新修改为增量模式
    function bindBoardQuickReplyRefresh() {
      document.addEventListener('tempReplySuccess', handleBoardQuickReplyRefresh);
      document.addEventListener('contReplySuccess', handleBoardQuickReplyRefresh);

      function handleBoardQuickReplyRefresh(e) {
        // 只在 板块页 或 时间线 页生效
        if (!/^\/f\//.test(location.pathname) && !/\/Forum\/timeline\/id\/\d+/i.test(location.pathname)) return;

        // 优先使用事件 detail 中的 tid，否则用持久变量
        const tid = e.detail?.tid || currentReplyTid;
        if (!tid) {
          toast('订阅失败：未识别到当前串号');
          return;
        }

        // 不同页面的第一页 URL 构造：
        // - 板块页（/f/）：使用 ?page=1
        // - 时间线（/Forum/timeline/id/X[/page/N]）：去掉 /page/... 部分，得到 base timeline 地址（即第一页）
        let page1Url;
        if (isTimeline) {
          const base = location.pathname.replace(/\/page\/\d+(\.html)?$/i, '').replace(/\/$/, '');
          page1Url = location.origin + base;
        } else {
          page1Url = location.origin + location.pathname + '?page=1';
        }

        fetch(page1Url, { credentials: 'include' })
        .then(res => res.text())
        .then(html => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const newThreadDiv = doc.querySelector(`.h-threads-list div[data-threads-id="${tid}"]`);
          if (!newThreadDiv) return;

          // ——— 离线处理（关键，参考拦截中间页的处理方式） ———
          const fragment = document.createElement('div');
          fragment.appendChild(newThreadDiv.cloneNode(true));

          const cfg2 = (typeof SettingPanel !== 'undefined' && SettingPanel && SettingPanel.state)
            ? SettingPanel.state
            : null;

          // 在离线 fragment 上预处理
          try {
            if (typeof hideEmptyTitleAndEmail === 'function') hideEmptyTitleAndEmail($(fragment));
            if (cfg2 && typeof applyFilters === 'function') applyFilters(cfg2, fragment);
          } catch (e) {
            console.warn('预处理过滤失败', e);
          }

          // 获取处理后的节点
          const processedNode = fragment.firstChild;

          // ——— 替换当前页面所有相同串号的节点 ———
          // document.querySelectorAll(`.h-threads-list div[data-threads-id="${tid}"]`).forEach(oldNode => {
          //   const newNode = processedNode.cloneNode(true);
          //   oldNode.parentNode.replaceChild(newNode, oldNode);
          // });
          // === 改为增量新增：比较新旧回复差异，如有交集，新回复区可与旧回复区合并，否则替换 ===
          document.querySelectorAll(`.h-threads-list div[data-threads-id="${tid}"]`).forEach(oldNode => {
            const oldReplies = Array.from(oldNode.querySelectorAll('.h-threads-item-reply[data-threads-id]'));
            const oldIds = oldReplies.map(r => r.getAttribute('data-threads-id'));
          
            const newReplies = Array.from(processedNode.querySelectorAll('.h-threads-item-reply[data-threads-id]'));
            const newIds = newReplies.map(r => r.getAttribute('data-threads-id'));
          
            // 判断是否有交集
            const hasIntersection = newIds.some(id => oldIds.includes(id));
          
            if (hasIntersection) {
              // 合并：保留旧的，再追加新的（避免重复）
              const oldIdSet = new Set(oldIds);
              for (const reply of newReplies) {
                const tidReply = reply.getAttribute('data-threads-id');
                if (!oldIdSet.has(tidReply)) {
                  oldNode.querySelector('.h-threads-item-replies').appendChild(reply.cloneNode(true));
                }
              }
            } else {
              // 无交集：整块替换
              const newNode = processedNode.cloneNode(true);
              oldNode.parentNode.replaceChild(newNode, oldNode);
            }
          });
          
          // 立即执行视觉相关过滤，避免闪烁
          try { if (typeof hideEmptyTitleAndEmail === 'function') hideEmptyTitleAndEmail(); } catch (e) {}
          try { if (cfg2) refreshFilterDisplay(cfg2); } catch (e) {}
          try { if (typeof enablePostExpand === 'function') enablePostExpand(root); } catch (e) {}

          // 延迟执行其他增强
          setTimeout(() => {
            document.querySelectorAll(`.h-threads-list div[data-threads-id="${tid}"]`).forEach(targetNode => {
              try { if (typeof hideEmptyTitleAndEmail === 'function') hideEmptyTitleAndEmail($(targetNode)); } catch (e) {}
              try { if (typeof highlightPO === 'function') highlightPO(targetNode); } catch (e) {}
              try { if (cfg2 && cfg2.enableHDImageAndLayoutFix && typeof enableHDImageAndLayoutFix === 'function') enableHDImageAndLayoutFix(targetNode); } catch (e) {}
              try { if (cfg2 && cfg2.enableHDImage && typeof enableHDImage === 'function') enableHDImage(targetNode); } catch (e) {}
              try { if (cfg2 && cfg2.enableLinkBlank && typeof runLinkBlank === 'function') runLinkBlank(targetNode); } catch (e) {}
              try { if (cfg2 && cfg2.extendQuote && typeof extendQuote === 'function') extendQuote(targetNode); } catch (e) {}
              try { if (typeof initContent === 'function') initContent(targetNode); } catch (e) {}
              try { if (typeof initExtendedContent === 'function') initExtendedContent(targetNode); } catch (e) {}
              //try { if (typeof autoHideRefView === 'function') autoHideRefView(targetNode); } catch (e) {}
            });
            enableHDImageAndLayoutFix(document);
            enableHDImage(document);
            try { if (cfg2 && cfg2.enableQuotePreview && typeof enableQuotePreview === 'function') enableQuotePreview(); } catch (e) {}
            try { if (cfg2) refreshFilterDisplay(cfg2); } catch (e) {}
            try { if (typeof enablePostExpand === 'function') enablePostExpand(targetNode); } catch (e) {}
          }, 50);

            // --------- 确保重新应用标记与屏蔽 ---------
            // 说明：有两点防护：
            //  1) 使用 try/catch 防止 applyFilters 抛错中断其它逻辑；
            //  2) 对 cfg 做存在性回退（优先使用已存在的 cfg；没有时回退到 SettingPanel.state；再没有则不给参数调用，且吞掉异常）
            try {
              if (typeof applyFilters === 'function') {
                // 优先使用当前作用域的 cfg（如果存在），否则尝试使用 SettingPanel.state（你的函数中多次引用过）。
                const _cfg = (typeof cfg !== 'undefined') ? cfg
                            : (typeof SettingPanel !== 'undefined' && SettingPanel && SettingPanel.state) ? SettingPanel.state
                            : null;

                if (_cfg) {
                  // 正常调用（大多数情况会走到这里）
                  refreshFilterDisplay(_cfg);
                } else {
                  // 没有可用配置对象时，仍尝试一次无参调用以兼容极少数实现（但捕获其可能抛出的异常）
                  try { refreshFilterDisplay(); } catch (e) { /* 忽略 */ }
                }
              }
            } catch (e) {
              // 保守地记录错误（不抛出），以免阻断页面其它增强逻辑
              console.warn('applyFilters reapply failed:', e);
            }

          // 临时模式下刷新完成后清空持久变量
          if (e.type === 'tempReplySuccess') {
            currentReplyTid = null;
          }
        })
        .catch(() => toast('刷新板块串失败'));
      }
    }

    // 统一调用
    bindReplyQuoteLinks();
    bindBoardQuickReplyRefresh();

  }

  // === 通用：确保某个元素被折叠（幂等） ===
  function ensureCollapsed($elem, hint) {
    if (!$elem || !$elem.length) return;
    if ($elem.data('xdex-collapsed')) return; // 已折叠过
    Utils.collapse($elem, hint);
  }

  const postExpandDocScroller = document.scrollingElement || document.documentElement;

  function getScrollContainer(startEl) {
    let el = startEl || document.body;
    while (el && el !== document.body) {
      const style = getComputedStyle(el);
      const canScroll = /(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight;
      if (canScroll) return el;
      el = el.parentElement;
    }
    return postExpandDocScroller;
  }

  function getViewportRect(scroller) {
    if (scroller === postExpandDocScroller || scroller === document.body || scroller === document.documentElement) {
      return { top: 0, bottom: window.innerHeight };
    }
    const r = scroller.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom };
  }

  function isPartiallyInViewport(el, scroller) {
    if (!el) return false;
    const er = el.getBoundingClientRect();
    const vr = getViewportRect(scroller);
    const visibleTop = Math.max(er.top, vr.top);
    const visibleBottom = Math.min(er.bottom, vr.bottom);
    return Math.max(0, visibleBottom - visibleTop) > 0;
  }

  function getElementAbsTop(el, scroller) {
    const er = el.getBoundingClientRect();
    if (scroller === postExpandDocScroller || scroller === document.body || scroller === document.documentElement) {
      return er.top + window.scrollY;
    }
    const sr = scroller.getBoundingClientRect();
    return er.top - sr.top + scroller.scrollTop;
  }

  function scrollByCompensation(scroller, dy) {
    if (!dy) return;
    if (scroller === postExpandDocScroller || scroller === document.body || scroller === document.documentElement) {
      window.scrollBy({ top: dy, left: 0, behavior: 'auto' });
    } else {
      scroller.scrollTop += dy;
    }
  }

  function findNextThread(item) {
    let el = item.nextElementSibling;
    while (el) {
      if (el.classList && el.classList.contains('h-threads-item-index')) return el;
      el = el.nextElementSibling;
    }
    return null;
  }

  function collapseWithoutShift(item) {
    const postForm = document.getElementById('h-post-form');
    if (postForm && isPartiallyInViewport(postForm, postExpandDocScroller)) {
      item.classList.remove('expanded');
      return;
    }
    if (item.classList.contains('qp-reply-form') ||
        item.classList.contains('xdex-generic-collapsed') ||
        item.closest('.xdex-generic-toggle')) {
      item.classList.remove('expanded');
      return;
    }

    const scroller = getScrollContainer(item);
    const scrollerIsDoc = (scroller === postExpandDocScroller || scroller === document.body || scroller === document.documentElement);
    const next = findNextThread(item);
    const nextVisible = isPartiallyInViewport(next, scroller);

    const threadContainer = scrollerIsDoc ? document : scroller;
    const allThreadsInScroller = Array.from(threadContainer.querySelectorAll('.h-threads-item-index'));
    const visibleThreads = allThreadsInScroller.filter(t => isPartiallyInViewport(t, scroller));

    if (visibleThreads.length === 1 && visibleThreads[0] === item && next) {
      item.classList.remove('expanded');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try {
            const vr = getViewportRect(scroller);
            const vHeight = Math.max(1, vr.bottom - vr.top);
            const currentScroll = scrollerIsDoc ? window.scrollY : scroller.scrollTop;
            const nextAbsTop = getElementAbsTop(next, scroller);
            const desiredAbsTop = currentScroll + Math.floor(vHeight / 3);
            const delta = nextAbsTop - desiredAbsTop;
            if (delta !== 0) scrollByCompensation(scroller, delta);
          } catch (err) {
            try {
              const preScroll = scrollerIsDoc ? window.scrollY : scroller.scrollTop;
              const preHeight = scroller.scrollHeight;
              requestAnimationFrame(() => {
                const postHeight = scroller.scrollHeight;
                const d = preHeight - postHeight;
                if (d > 0) {
                  const target = Math.max(0, preScroll - d);
                  if (scrollerIsDoc) window.scrollTo({ top: target, left: 0, behavior: 'auto' });
                  else scroller.scrollTop = target;
                }
              });
            } catch (e2) {
              console.warn('collapseWithoutShift special-case fallback 异常：', e2);
            }
          }
        });
      });
      return;
    }

    if (nextVisible) {
      const preScroll = scrollerIsDoc ? window.scrollY : scroller.scrollTop;
      const preHeight = scroller.scrollHeight;
      item.classList.remove('expanded');
      requestAnimationFrame(() => {
        const postHeight = scroller.scrollHeight;
        const delta = preHeight - postHeight;
        if (delta > 0) {
          const target = Math.max(0, preScroll - delta);
          if (scrollerIsDoc) window.scrollTo({ top: target, left: 0, behavior: 'auto' });
          else scroller.scrollTop = target;
        }
      });
      return;
    }

    const anchor = item;
    const preAbsTop = getElementAbsTop(anchor, scroller);
    item.classList.remove('expanded');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const postAbsTop = getElementAbsTop(anchor, scroller);
        const delta = preAbsTop - postAbsTop;
        if (delta !== 0) {
          scrollByCompensation(scroller, delta);
        } else {
          try {
            const preScroll = scrollerIsDoc ? window.scrollY : scroller.scrollTop;
            const preHeight = scroller.scrollHeight;
            requestAnimationFrame(() => {
              const postHeight = scroller.scrollHeight;
              const d = preHeight - postHeight;
              if (d > 0) {
                const target = Math.max(0, preScroll - d);
                if (scrollerIsDoc) window.scrollTo({ top: target, left: 0, behavior: 'auto' });
                else scroller.scrollTop = target;
              }
            });
          } catch (err) {
            console.warn('collapseWithoutShift fallback 异常：', err);
          }
        }
      });
    });
  }

  /* --------------------------------------------------
   * tag 16. 允许展开/收起被板块页折叠的长串
   * -------------------------------------------------- */
  function enablePostExpand(root = document) {
    const scanRoot = root && typeof root.querySelectorAll === 'function' ? root : document;
    const scanTargets = [];
    if (scanRoot.classList && scanRoot.classList.contains('h-threads-item-index')) {
      scanTargets.push(scanRoot);
    }
    scanRoot.querySelectorAll('.h-threads-item-index').forEach(item => {
      if (!scanTargets.includes(item)) scanTargets.push(item);
    });

    // 注入样式（同前，保留 overflow-anchor: none）
    (function ensureExpandedStyle() {
      const id = 'h-expanded-style';
      if (document.getElementById(id)) return;
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `
        html, body {
          overflow-y: scroll !important;
        }
        .h-threads-item-index.expanded {
          max-height: none !important;
          overflow-y: scroll !important;
          overflow-anchor: none !important;
        }
      `;
      document.head.appendChild(style);
    })();

    let lastExpandedItem = null;
    // 根据 SettingPanel.state 读取是否开启“全部展开”模式
    const expandAllMode = !!(typeof SettingPanel !== 'undefined' && SettingPanel.state && SettingPanel.state.enablePostExpandAll);

    // 外部点击收起：兼容两种模式（常规 / 全部展开）
    function outsideHandler(e) {
      // 忽略公用折叠占位符点击
      if (e.target.closest('.xdex-placeholder.xdex-generic-toggle')) return;

      const cfg = (typeof SettingPanel !== 'undefined' && SettingPanel.state) ? SettingPanel.state : {};
      const isAllMode = !!cfg.enablePostExpandAll;

      if (!isAllMode) {
        // 必须在 #h-content 内
        const hContent = document.getElementById('h-content');
      if (!hContent || !hContent.contains(e.target)) return;

      // 找到所有 .h-threads-list，判断点击是否在任一 list 的垂直范围内
      const threadLists = document.querySelectorAll('#h-content .h-threads-list');
      if (!threadLists.length) return;

      const x = e.clientX;
      const y = e.clientY;
      let matchedListRect = null;
      let isInAnyList = false;
      for (const list of threadLists) {
        const listRect = list.getBoundingClientRect();
        if (y >= listRect.top && y <= listRect.bottom) {
          isInAnyList = true;
          matchedListRect = listRect;
          break;
        }
      }
      if (!isInAnyList) return;
      if (!matchedListRect) return;
      if (y < matchedListRect.top || y > matchedListRect.bottom) return;

        // 点击在 uk-container 内部不处理（排除串内部及其包裹容器）
        if (e.target.closest('.uk-container')) return;

        // 如果没有记录到最后被展开的串，则不处理
        if (!lastExpandedItem) return;

        // 确保 lastExpandedItem 仍在 DOM 中
        if (!document.contains(lastExpandedItem)) {
          lastExpandedItem = null;
          return;
        }

        // 获取被展开串的 rect
        const rect = lastExpandedItem.getBoundingClientRect();

        // 若点击纵坐标不在该串的垂直范围内，则不收起
        const V_TOL = 2; // 垂直容差（像素）
        if (y < rect.top - V_TOL || y > rect.bottom + V_TOL) return;

        // 若点击点在该串的水平内部范围内，不收起；只在左右明确外围才收起
        if (x >= rect.left && x <= rect.right) return;

        // 排除点击在上方兄弟元素内
        let p = lastExpandedItem.parentElement;
        while (p && p !== document.body) {
          for (let sib = p.firstElementChild; sib && sib !== lastExpandedItem; sib = sib.nextElementSibling) {
            if (sib.contains(e.target)) {
              return;
            }
          }
          if (p.classList && p.classList.contains('h-threads-list')) break;
          p = p.parentElement;
        }

        // 触发收起
        const btn = lastExpandedItem.querySelector('.h-threads-info .js-toggle-mode');
        if (btn) btn.textContent = '展开';
        collapseWithoutShift(lastExpandedItem);
        lastExpandedItem = null;
        return;
      }

      // ===== 全部展开模式保留原逻辑，但同样采用“纵向带 + 排除 uk-container” =====
      const hContent = document.getElementById('h-content');
      if (!hContent || !hContent.contains(e.target)) return;

      const threadLists = document.querySelectorAll('#h-content .h-threads-list');
      if (!threadLists.length) return;

      const y = e.clientY;
      let isInAnyList = false;
      for (const list of threadLists) {
        const listRect = list.getBoundingClientRect();
        if (y >= listRect.top && y <= listRect.bottom) {
          isInAnyList = true;
          break;
        }
      }
      if (!isInAnyList) return;

      // 点击在 uk-container 内部不处理
      if (e.target.closest('.uk-container')) return;

      const threads = Array.from(document.querySelectorAll('.h-threads-item-index'));
      if (!threads.length) return;

      let target = threads.find(t => {
        const r = t.getBoundingClientRect();
        return y >= r.top && y <= r.bottom;
      });

      if (!target) {
        let min = Infinity;
        for (const t of threads) {
          const r = t.getBoundingClientRect();
          const d = Math.min(Math.abs(y - r.top), Math.abs(y - r.bottom));
          if (d < min) { min = d; target = t; }
        }
      }

      if (target && target.classList.contains('expanded')) {
        const btn = target.querySelector('.h-threads-info .js-toggle-mode');
        if (btn) btn.textContent = '展开';
        collapseWithoutShift(target);
      }
    }

    // 添加按钮
    scanTargets.forEach(item => {
      // === 新增：跳过主串自身被折叠的情况（不包括串内回复被折叠） ===
      // 只检查 item 的直接子元素中是否有折叠占位符，不深入检查回复区域
      const directPlaceholder = Array.from(item.children).find(child =>
        child.classList.contains('xdex-placeholder') &&
        child.classList.contains('xdex-generic-toggle')
      );
      if (directPlaceholder) return;

      const infoBar = item.querySelector('.h-threads-info');
      if (!infoBar) return;
      if (infoBar.querySelector('.js-toggle-mode')) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'js-toggle-mode';
      btn.style.cssText = 'display:inline-flex; align-items:center; width:auto; padding:2px 8px; font-size:13px; cursor:pointer;';
      btn.textContent = '展开';

      // 如果是“全部展开”模式，启动就设为展开状态
      if (expandAllMode) {
          item.classList.add('expanded');
          btn.textContent = '收起';
        }

            btn.addEventListener('click', e => {
              e.stopPropagation();
              const willExpand = !item.classList.contains('expanded');
              if (willExpand) {
                item.classList.add('expanded');
                btn.textContent = '收起';
                lastExpandedItem = item;
              } else {
                btn.textContent = '展开';
                collapseWithoutShift(item);
                if (lastExpandedItem === item) lastExpandedItem = null;
              }
            });

      infoBar.appendChild(btn);
    });
    // === 初始化时根据设置自动全部展开 ===
    try {
        const expandAll = !!(typeof SettingPanel !== 'undefined' && SettingPanel.state && SettingPanel.state.enablePostExpandAll);
        if (expandAll) {
          scanTargets.forEach(item => {
            if (!item.classList.contains('expanded')) item.classList.add('expanded');
            const btn = item.querySelector('.h-threads-info .js-toggle-mode');
            if (btn) btn.textContent = '收起';
          });
        }
      } catch (err) {
        console.warn('自动全部展开失败：', err);
      }

    // 绑定外部点击
    const hContent = document.getElementById('h-content');
    if (hContent) {
      hContent.removeEventListener('click', outsideHandler, true);
      hContent.addEventListener('click', outsideHandler, true);
    }
  }

  /* --------------------------------------------------
   * tag 17. 替换搜索按钮为野生搜索酱（来自4sYbzEX https://www.nmbxd.com/t/64792841）
   * -------------------------------------------------- */
  function searchServiceBy4sY() {
    const btn = document.querySelector('#h-menu-search-keyword');
    if (!btn) return; // 若按钮不存在则不处理

    // 移除原有的 href 与默认跳转行为
    btn.removeAttribute('href');
    btn.removeEventListener('click', btn._4sYHandler || (()=>{}));

    // 定义新的点击事件
    const handler = (e) => {
      e.preventDefault();
      window.open('https://nmb-search.166666666.xyz/', '_blank');
    };

    // 绑定事件
    btn.addEventListener('click', handler);

    // 保存 handler 以便后续移除时使用（防止重复绑定）
    btn._4sYHandler = handler;
  }

  function isNmbSearchPage() {
    return location.hostname === 'nmb-search.166666666.xyz';
  }

  function normalizeNmbSearchMobileThreadUrl(rawHref) {
    let url;
    try {
      url = new URL(rawHref, location.href);
    } catch (e) {
      return rawHref;
    }
    if (url.protocol !== 'https:' || url.hostname !== 'www.nmbxd1.com') return rawHref;
    const nextPath = url.pathname.replace(/^\/m\/t\/(\d+)/, '/t/$1');
    if (nextPath === url.pathname) return rawHref;
    url.pathname = nextPath;
    return url.toString();
  }

  function makeNmbSearchLinkOpenInNewTab(a) {
    a.setAttribute('target', '_blank');
    const rel = new Set(String(a.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    a.setAttribute('rel', Array.from(rel).join(' '));
  }

  function isNmbSearchResultLink(a) {
    return !!(a && a.matches && a.matches('#overflow.text-result a[href]'));
  }

  function rewriteNmbSearchMobileThreadLinks(root = document) {
    if (!isNmbSearchPage()) return;
    const selector = '#overflow.text-result a[href]';
    const links = [];
    if (root && root.matches && root.matches(selector)) links.push(root);
    if (root && root.querySelectorAll) {
      root.querySelectorAll(selector).forEach(a => links.push(a));
    }
    links.forEach(a => {
      const rawHref = a.getAttribute('href') || a.href || '';
      const nextHref = normalizeNmbSearchMobileThreadUrl(rawHref);
      if (nextHref !== rawHref) a.setAttribute('href', nextHref);
      makeNmbSearchLinkOpenInNewTab(a);
    });
  }

  function handleNmbSearchLinkClick(e) {
    if (!isNmbSearchPage() || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    if (!isNmbSearchResultLink(a)) return;
    const rawHref = a.getAttribute('href') || a.href || '';
    if (!rawHref || /^javascript:/i.test(rawHref)) return;
    const nextHref = normalizeNmbSearchMobileThreadUrl(rawHref);
    if (nextHref !== rawHref) a.setAttribute('href', nextHref);
    makeNmbSearchLinkOpenInNewTab(a);
    e.preventDefault();
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    window.open(a.href, '_blank', 'noopener,noreferrer');
  }

  function initNmbSearchMobileThreadRedirector() {
    if (!isNmbSearchPage()) return;
    rewriteNmbSearchMobileThreadLinks(document);
    if (!initNmbSearchMobileThreadRedirector.clickHandlerInstalled) {
      document.addEventListener('click', handleNmbSearchLinkClick, true);
      initNmbSearchMobileThreadRedirector.clickHandlerInstalled = true;
    }
    if (initNmbSearchMobileThreadRedirector.observer || !document.body) return;
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node && node.nodeType === 1) rewriteNmbSearchMobileThreadLinks(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    initNmbSearchMobileThreadRedirector.observer = observer;
  }

  /* --------------------------------------------------
   * tag 18. 侧栏收起（来自acVMxuvhttps://greasyfork.org/zh-CN/scripts/553143-x%E5%B2%9B%E4%BC%98%E5%8C%96%E5%B2%9B-%E4%BE%A7%E8%BE%B9%E6%A0%8F%E4%BC%98%E5%8C%96%E7%89%88）
   * -------------------------------------------------- */
  function toggleSidebar() {
    // --- 侧边栏自动收起功能 ---
    const hMenuDiv = document.getElementById('h-menu');
    if (hMenuDiv) {
        // 1. 创建一个新的触发区域元素
        const triggerZone = document.createElement('div');

        // 2. 设置触发区域的样式
        // 它将是一个位于屏幕左侧的、透明的、固定宽度的垂直条
        triggerZone.style.position = 'fixed';
        triggerZone.style.left = '0';
        triggerZone.style.top = '0';
        triggerZone.style.width = '100px'; // 触发区域宽度，可以根据需要调整
        triggerZone.style.height = '100vh'; // 高度占满整个屏幕
        triggerZone.style.zIndex = '800'; // 确保它在大多数元素之上，但在菜单之下
        // triggerZone.style.backgroundColor = 'rgba(255, 0, 0, 0.2)'; // 取消此行注释以可视化触发区域

        // 3. 将触发区域添加到页面中
        document.body.appendChild(triggerZone);

        // 4. 设置侧边栏的初始样式为折叠
        hMenuDiv.style.transition = 'width 0.3s ease'; // 添加平滑过渡效果
        hMenuDiv.style.width = '0';
        hMenuDiv.style.overflow = 'hidden';
        hMenuDiv.style.zIndex = '999'; // 确保菜单在触发区域之上

        // 5. 为新的触发区域添加鼠标悬停事件，用于展开侧边栏
        triggerZone.addEventListener('mouseover', function() {
            hMenuDiv.style.width = '200px'; // 展开侧边栏
            hMenuDiv.style.overflow = 'visible';
        });

        // 6. 为侧边栏本身添加鼠标移出事件，用于收起侧边栏
        hMenuDiv.addEventListener('mouseleave', function() {
            hMenuDiv.style.width = '0'; // 收起侧边栏
            hMenuDiv.style.overflow = 'hidden';
        });
    }
  }

  /* --------------------------------------------------
   * tag 19. 替换顶栏图片点击事件，串内刷新，板块页回到首页
   * -------------------------------------------------- */
  function overrideTopImageClick() {
    const topImgLink = document.querySelector('#h-menu-top-img');
    if (!topImgLink) return;

    // 判断是否是串内页
    function isThreadPage(path) {
        return /\/t\/\d{4,}/.test(path) || /^\/Forum\/po\/id\/\d+/.test(path);
    }

    // 判断是否是板块页
    function isBoardPage(path) {
        return /^\/f\//.test(path) || /^\/Forum\/timeline\/id\/\d+/.test(path);
    }

    topImgLink.addEventListener('click', function(e) {
        e.preventDefault();
        const path = location.pathname;
        let url = location.href;

        if (isThreadPage(path)) {
            // 串内页：刷新当前页面
            location.reload();
        } else if (isBoardPage(path)) {
            // 板块页：跳转到第一页
            if (/\/Forum\/timeline\/id\/\d+\/page\/\d+\.html/.test(url)) {
                url = url.replace(/\/page\/\d+\.html/, '/page/1.html');
            } else if (/\/f\/.+\?page=\d+/.test(url)) {
                url = url.replace(/page=\d+/, 'page=1');
            }
            location.href = url;
        } else {
            // 其他情况：跳转首页
            location.href = '/';
        }
    });
  }

  /* --------------------------------------------------
   * tag 20. 默认/模糊/无图/Tips模式
   * -------------------------------------------------- */
  function applyImageHideMode(mode = 'default', root = document) {
    return startupPerfDebug.measure('applyImageHideMode', () => {
    const COVER_URL = 'https://moetu.org/xdchan/cover.php?from=index';
    const VALID_MODES = new Set(['default', 'blur', 'noimage', 'tips', 'none']);
    const finalMode = VALID_MODES.has(mode) ? mode : 'default';
    const scope = root && root.querySelectorAll ? root : document;
    const coverCache = applyImageHideMode.__coverCache || (applyImageHideMode.__coverCache = []);
    const coverCacheSet = applyImageHideMode.__coverCacheSet || (applyImageHideMode.__coverCacheSet = new Set());
    const COVER_CACHE_MAX = 80;

    // 样式只注入一次
    if (!document.getElementById('xdex-image-hide-style')) {
      const style = document.createElement('style');
      style.id = 'xdex-image-hide-style';
      style.textContent = `
        /* 模式1：模糊遮罩
           clip-path: inset(0) 裁剪 filter 产生的合成层溢出（overflow:hidden 做不到） */
        .h-threads-img-box.xdex-hide-blur:not(.h-active) .h-threads-img {
          filter: blur(14px) brightness(0.5);
          clip-path: inset(0);
          transition: filter .15s ease;
        }

        /* 悬浮时取消遮罩 */
        .h-threads-img-box.xdex-hide-blur:not(.h-active):hover .h-threads-img {
          filter: none;
          clip-path: none;
        }

        /* 放大（h-active）时始终不遮罩 */
        .h-threads-img-box.xdex-hide-blur.h-active .h-threads-img {
          filter: none !important;
          clip-path: none !important;
        }

        /* 独立 img（无容器时） */
        img.xdex-hide-blur-img {
          filter: blur(14px) brightness(0.5);
          clip-path: inset(0);
          transition: filter .15s ease;
        }
        img.xdex-hide-blur-img:hover {
          filter: none;
          clip-path: none;
        }

        /* 模式2：无图（隐藏，不删除 DOM） */
        .h-threads-img-box.xdex-hide-noimage {
          display: none !important;
        }
        img.xdex-hide-noimage-img {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    function getAllImgs(target) {
      const imgs = [];
      if (target instanceof HTMLImageElement) imgs.push(target);
      if (target && target.querySelectorAll) {
        target.querySelectorAll('img').forEach(img => imgs.push(img));
      }
      return imgs;
    }

    function addCoverToCache(url) {
      if (!url || coverCacheSet.has(url)) return;
      coverCacheSet.add(url);
      coverCache.push(url);
      if (coverCache.length > COVER_CACHE_MAX) {
        const removed = coverCache.shift();
        if (removed) coverCacheSet.delete(removed);
      }
    }

    function removeCoverFromCache(url) {
      if (!url || !coverCacheSet.has(url)) return;
      coverCacheSet.delete(url);
      const idx = coverCache.indexOf(url);
      if (idx >= 0) coverCache.splice(idx, 1);
    }

    function buildNewCoverUrl(idx) {
      return `${COVER_URL}&xdex=${Date.now()}_${idx}_${Math.random().toString(36).slice(2)}`;
    }

    function pickCoverUrl(idx, triedSet) {
      // 优先复用缓存 URL，降低重复请求压力
      const usableCached = coverCache.filter(u => !triedSet.has(u));
      if (usableCached.length > 0) {
        const u = usableCached[Math.floor(Math.random() * usableCached.length)];
        return { url: u, fromCache: true };
      }
      return { url: buildNewCoverUrl(idx), fromCache: false };
    }

    function isExcludedImage(img) {
      if (!img || !img.closest) return false;
      try {
        return !!img.closest([
          
          '#h-bottom-nav',
          '#h-menu-top',
          '#h-preview-box',
          '.h-preview-box',
          '#sp_btn',
          '.h-threads-item-reply[data-threads-id="9999999"]'
        ].join(', '));
      } catch (e) {
        // 选择器异常时兜底，避免中断后续逻辑
        return false;
      }
    }

    function restoreNoImage(img) {
      if (!img || img.dataset.xdexNoImgApplied !== '1') return;

      const box = img.closest('.h-threads-img-box');
      if (box) {
        box.classList.remove('xdex-hide-noimage');
        box.dataset.xdexNoImgBox = '0';
      }
      img.classList.remove('xdex-hide-noimage-img');
      img.dataset.xdexNoImgImg = '0';

      delete img.dataset.xdexNoImgApplied;
    }

    function restoreReplacedImage(img) {
      if (!img || img.dataset.xdexHideReplaceApplied !== '1') return;

      const origSrc = img.dataset.xdexOrigSrc;
      const origSrcset = img.dataset.xdexOrigSrcset;
      const origSizes = img.dataset.xdexOrigSizes;
      const origAlt = img.dataset.xdexOrigAlt;
      const origTitle = img.dataset.xdexOrigTitle;
      const origStyle = img.dataset.xdexOrigStyle;

      if (origSrc) img.setAttribute('src', origSrc); else img.removeAttribute('src');
      if (origSrcset) img.setAttribute('srcset', origSrcset); else img.removeAttribute('srcset');
      if (origSizes) img.setAttribute('sizes', origSizes); else img.removeAttribute('sizes');
      if (origAlt) img.setAttribute('alt', origAlt); else img.removeAttribute('alt');
      if (origTitle) img.setAttribute('title', origTitle); else img.removeAttribute('title');
      if (origStyle) img.setAttribute('style', origStyle); else img.removeAttribute('style');

      const box = img.closest('.h-threads-img-box');
      if (box) box.dataset.xdexHideReplaceBox = '0';

      if (img.__xdexRestoreOnClick) {
        img.removeEventListener('click', img.__xdexRestoreOnClick, true);
        img.__xdexRestoreOnClick = null;
      }
      img.onload = null;
      img.onerror = null;

      delete img.dataset.xdexHideReplaceApplied;
      // 恢复懒加载属性
      if (img.dataset.xdexOrigHdSrc) {
        img.dataset.xdexHdSrc = img.dataset.xdexOrigHdSrc;
        delete img.dataset.xdexOrigHdSrc;
      }
      if (img.dataset.xdexOrigThumbSrc) {
        img.dataset.xdexThumbSrc = img.dataset.xdexOrigThumbSrc;
        delete img.dataset.xdexOrigThumbSrc;
      }
      delete img.dataset.xdexOrigSrc;
      delete img.dataset.xdexOrigSrcset;
      delete img.dataset.xdexOrigSizes;
      delete img.dataset.xdexOrigAlt;
      delete img.dataset.xdexOrigTitle;
      delete img.dataset.xdexOrigStyle;
      delete img.dataset.xdexLockWidth;
      delete img.dataset.xdexLockHeight;
    }

    function clearBlurMarks(target) {
      if (!target || !target.querySelectorAll) return;
      target.querySelectorAll('.h-threads-img-box.xdex-hide-blur').forEach(box => {
        box.classList.remove('xdex-hide-blur');
        box.dataset.xdexHideBlurBox = '0';
      });
      target.querySelectorAll('img.xdex-hide-blur-img').forEach(img => {
        img.classList.remove('xdex-hide-blur-img');
        img.dataset.xdexHideBlurImg = '0';
      });
    }

    function clearNoImageMarks(target) {
      if (!target || !target.querySelectorAll) return;
      target.querySelectorAll('.h-threads-img-box.xdex-hide-noimage').forEach(box => {
        box.classList.remove('xdex-hide-noimage');
        box.dataset.xdexNoImgBox = '0';
      });
      target.querySelectorAll('img.xdex-hide-noimage-img').forEach(img => {
        img.classList.remove('xdex-hide-noimage-img');
        img.dataset.xdexNoImgImg = '0';
      });
      target.querySelectorAll('img[data-xdex-no-img-applied="1"]').forEach(restoreNoImage);
    }

    function applyBlur(img) {
      const box = img.closest('.h-threads-img-box');

      // blur 模式下若之前替换过，先恢复原图
      if (img.dataset.xdexHideReplaceApplied === '1') {
        restoreReplacedImage(img);
      }
      // blur 模式下若之前处于无图，先恢复
      if (img.dataset.xdexNoImgApplied === '1') {
        restoreNoImage(img);
      }

      if (box) {
        if (box.dataset.xdexHideBlurBox === '1') return;
        box.classList.add('xdex-hide-blur');
        box.dataset.xdexHideBlurBox = '1';
        return;
      }

      if (img.dataset.xdexHideBlurImg === '1') return;
      img.classList.add('xdex-hide-blur-img');
      img.dataset.xdexHideBlurImg = '1';
    }

    function applyNoImage(img) {
      const box = img.closest('.h-threads-img-box');

      if (img.dataset.xdexHideReplaceApplied === '1') {
        restoreReplacedImage(img);
      }

      if (box) {
        box.classList.remove('xdex-hide-blur');
        box.dataset.xdexHideBlurBox = '0';
      }
      img.classList.remove('xdex-hide-blur-img');
      img.dataset.xdexHideBlurImg = '0';

      if (img.dataset.xdexNoImgApplied === '1') return;

      img.dataset.xdexNoImgApplied = '1';
      if (box) {
        box.classList.add('xdex-hide-noimage');
        box.dataset.xdexNoImgBox = '1';
      } else {
        img.classList.add('xdex-hide-noimage-img');
        img.dataset.xdexNoImgImg = '1';
      }
    }

    function applyReplace(img, idx) {
      const box = img.closest('.h-threads-img-box');

      // Tips 模式下若之前处于无图，先恢复
      if (img.dataset.xdexNoImgApplied === '1') {
        restoreNoImage(img);
      }

      // Tips 模式下移除 blur 标记
      if (box) {
        box.classList.remove('xdex-hide-blur');
        box.dataset.xdexHideBlurBox = '0';
        box.classList.remove('xdex-hide-noimage');
        box.dataset.xdexNoImgBox = '0';
      }
      img.classList.remove('xdex-hide-blur-img');
      img.dataset.xdexHideBlurImg = '0';
      img.classList.remove('xdex-hide-noimage-img');
      img.dataset.xdexNoImgImg = '0';

      if (img.dataset.xdexHideReplaceApplied === '1') return;

      // 锁定当前显示尺寸，防止替换图挤压回复区域
      const rect = img.getBoundingClientRect();
      const cs = window.getComputedStyle(img);
      const lockW = Math.round(rect.width || parseFloat(cs.width) || 0);
      const lockH = Math.round(rect.height || parseFloat(cs.height) || 0);

      img.dataset.xdexOrigSrc = img.getAttribute('src') || '';
      img.dataset.xdexOrigSrcset = img.getAttribute('srcset') || '';
      img.dataset.xdexOrigSizes = img.getAttribute('sizes') || '';
      img.dataset.xdexOrigAlt = img.getAttribute('alt') || '';
      img.dataset.xdexOrigTitle = img.getAttribute('title') || '';
      img.dataset.xdexOrigStyle = img.getAttribute('style') || '';
      img.dataset.xdexLockWidth = lockW > 0 ? String(lockW) : '';
      img.dataset.xdexLockHeight = lockH > 0 ? String(lockH) : '';

      img.dataset.xdexHideReplaceApplied = '1';
      // 暂存并清除懒加载属性，防止懒加载器覆盖 tips 图
      if (img.dataset.xdexHdSrc) {
        img.dataset.xdexOrigHdSrc = img.dataset.xdexHdSrc;
        delete img.dataset.xdexHdSrc;
      }
      if (img.dataset.xdexThumbSrc) {
        img.dataset.xdexOrigThumbSrc = img.dataset.xdexThumbSrc;
      }
      delete img.dataset.xdexHdLoaded;
      delete img.dataset.xdexHdLoading;
      if (box) box.dataset.xdexHideReplaceBox = '1';

      // 不预加载原图：仅保存原链接，点击恢复时再加载
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.setAttribute('title', 'Tips');
      img.setAttribute('alt', 'Tips');
      if (lockW > 0) {
        img.style.width = `${lockW}px`;
        img.style.minWidth = `${lockW}px`;
        img.style.maxWidth = `${lockW}px`;
      } else {
        img.style.maxWidth = '100%';
      }
      if (lockH > 0) {
        img.style.height = `${lockH}px`;
      } else {
        img.style.height = 'auto';
      }
      img.style.maxHeight = '60vh';
      img.style.objectFit = 'cover';

      const tried = new Set();
      const applyCoverWithRetry = (remain = 6) => {
        if (img.dataset.xdexHideReplaceApplied !== '1') return;

        const picked = pickCoverUrl(idx, tried);
        const fakeUrl = picked.url;
        tried.add(fakeUrl);

        img.onload = () => {
          addCoverToCache(fakeUrl);
          img.onload = null;
          img.onerror = null;
        };

        img.onerror = () => {
          removeCoverFromCache(fakeUrl);
          if (remain <= 0) {
            img.onload = null;
            img.onerror = null;
            return;
          }
          // 失败后立即尝试下一张（优先缓存池，其次新 URL）
          applyCoverWithRetry(remain - 1);
        };

        img.setAttribute('src', fakeUrl);
      };

      applyCoverWithRetry();

      // 首次点击：仅恢复原图；后续点击回归原逻辑
      const restoreOnFirstClick = (e) => {
        if (img.dataset.xdexHideReplaceApplied !== '1') return;
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
        restoreReplacedImage(img);
      };

      img.__xdexRestoreOnClick = restoreOnFirstClick;
      img.addEventListener('click', restoreOnFirstClick, true);
    }

    if (finalMode === 'none' || finalMode === 'default') {
      clearBlurMarks(document);
      clearNoImageMarks(document);
      document.querySelectorAll('img[data-xdex-hide-replace-applied="1"]').forEach(restoreReplacedImage);
      window.__xdexImageHideMode = 'default';
      return;
    }

    const imgs = getAllImgs(scope);
    imgs.forEach((img, idx) => {
      // 排除顶栏和底栏导航中的图片，不参与替换/模糊
      if (isExcludedImage(img)) {
        if (img.dataset.xdexHideReplaceApplied === '1') restoreReplacedImage(img);
        if (img.dataset.xdexNoImgApplied === '1') restoreNoImage(img);
        img.classList.remove('xdex-hide-blur-img');
        img.dataset.xdexHideBlurImg = '0';
        img.classList.remove('xdex-hide-noimage-img');
        img.dataset.xdexNoImgImg = '0';
        const box = img.closest('.h-threads-img-box');
        if (box) {
          box.classList.remove('xdex-hide-blur');
          box.classList.remove('xdex-hide-noimage');
          box.dataset.xdexHideBlurBox = '0';
          box.dataset.xdexNoImgBox = '0';
          box.dataset.xdexHideReplaceBox = '0';
        }
        return;
      }

      // 跳过无 src 的占位图（但保留 h-threads-img 处理）
      if (!img.classList.contains('h-threads-img') && !(img.getAttribute('src') || '').trim()) return;
      if (finalMode === 'blur') applyBlur(img);
      else if (finalMode === 'noimage') applyNoImage(img);
      else if (finalMode === 'tips') applyReplace(img, idx);
    });

    window.__xdexImageHideMode = finalMode;
    }, () => Object.assign({ mode }, startupPerfDebug.summarizeRoot(root || document)));
  }

  // 暴露给外部：window.applyImageHideMode('default'|'blur'|'noimage'|'tips'|'none', root)
  window.applyImageHideMode = applyImageHideMode;

  /* --------------------------------------------------
   * tag 21. 自动识别链接
   * -------------------------------------------------- */
  function runAutoUrlLinkify(root = document) {
    return startupPerfDebug.measure('runAutoUrlLinkify', () => {
    const scope = root && root.querySelectorAll ? root : document;
    const processedAttr = 'data-xdex-linkified';
    const containerSelector = '.h-threads-content, .h-preview-box';
    const protocolUrlRegex = /https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?::\d{2,5})?(?:\/[^\s<，。！？；：、】【）》」』、?#]*)*(?:\?[^\s<，。！？；：、】【）》」』、#]*)?(?:#[^\s<，。！？；：、】【）》」』、]*)?/gi;
    const wwwUrlRegex = /www\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?::\d{2,5})?(?:\/[^\s<，。！？；：、】【）》」』、?#]*)*(?:\?[^\s<，。！？；：、】【）》」』、#]*)?(?:#[^\s<，。！？；：、】【）》」』、]*)?/gi;
    const bareDomainScanRegex = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?::\d{2,5})?(?:\/[^\s<，。！？；：、】【）》」』、?#]*)*(?:\?[^\s<，。！？；：、】【）》」』、#]*)?(?:#[^\s<，。！？；：、】【）》」』、]*)?/gi;
    const bareDomainCandidateRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?::\d{2,5})?(?:\/[^\s<，。！？；：、】【）》」』、?#]*)*(?:\?[^\s<，。！？；：、】【）》」』、#]*)?(?:#[^\s<，。！？；：、】【）》」』、]*)?$/i;
    const trailingPunctuationRegex = /[),.!?\]}'"，。！？；：、】【）》」』、]+$/;
    const skipTags = new Set(['A', 'CODE', 'PRE', 'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'BUTTON']);
    
    const shouldSkipTextNode = (node) => {
      const parent = node.parentElement;
      if (!parent) return true;
      if (parent.closest('a, code, pre, script, style, textarea, input, select, button')) return true;
      return skipTags.has(parent.tagName);
    };

    const normalizeHref = (value) => {
      if (/^https?:\/\//i.test(value)) return value;
      return `https://${value}`;
    };

    const hasTightBoundary = (char) => !!char && /[0-9A-Za-z]/.test(char);

    const extractCandidate = (text, match, type) => {
      let matchedText = match[0];
      while (trailingPunctuationRegex.test(matchedText)) {
        matchedText = matchedText.replace(trailingPunctuationRegex, '');
      }
      if (!matchedText) return null;

      const startIndex = match.index;
      const endIndex = startIndex + matchedText.length;
      const prevChar = text[startIndex - 1] || '';
      const nextChar = text[endIndex] || '';
      const isBareDomain = type === 'bare';

      if (type === 'www' && hasTightBoundary(prevChar)) {
        return null;
      }
      if (type === 'bare' && hasTightBoundary(prevChar)) {
        return null;
      }
      if (hasTightBoundary(nextChar)) {
        return null;
      }

      if (isBareDomain) {
        if (!bareDomainCandidateRegex.test(matchedText)) return null;
      }

      return {
        text: matchedText,
        href: normalizeHref(matchedText),
        startIndex,
        endIndex
      };
    };

    const linkifyTextNode = (textNode) => {
      const text = textNode.nodeValue || '';
      if (!text.trim()) return;

      protocolUrlRegex.lastIndex = 0;
      wwwUrlRegex.lastIndex = 0;
      bareDomainScanRegex.lastIndex = 0;
      const matches = [
        ...Array.from(text.matchAll(protocolUrlRegex)).map(match => ({ match, type: 'protocol' })),
        ...Array.from(text.matchAll(wwwUrlRegex)).map(match => ({ match, type: 'www' })),
        ...Array.from(text.matchAll(bareDomainScanRegex)).map(match => ({ match, type: 'bare' }))
      ].sort((a, b) => a.match.index - b.match.index || b.match[0].length - a.match[0].length);
      if (matches.length === 0) return;

      const fragment = document.createDocumentFragment();
      let cursor = 0;
      let changed = false;

      matches.forEach(({ match, type }) => {
        const candidate = extractCandidate(text, match, type);
        if (!candidate) return;
        if (candidate.startIndex < cursor) return;

        if (candidate.startIndex > cursor) {
          fragment.appendChild(document.createTextNode(text.slice(cursor, candidate.startIndex)));
        }

        const anchor = document.createElement('a');
        anchor.href = candidate.href;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = candidate.text;
        anchor.style.color = '#007bff';
        anchor.style.textDecoration = 'none';
        anchor.addEventListener('mouseenter', () => {
          anchor.style.textDecoration = 'underline';
          anchor.style.textDecorationColor = '#007bff';
        });
        anchor.addEventListener('mouseleave', () => {
          anchor.style.textDecoration = 'none';
        });
        fragment.appendChild(anchor);

        cursor = candidate.endIndex;
        changed = true;
      });

      if (!changed) return;
      if (cursor < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(cursor)));
      }
      textNode.parentNode.replaceChild(fragment, textNode);
    };

    const processContainer = (container) => {
      if (!container) return;

      const pendingWalker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            if (shouldSkipTextNode(node)) return NodeFilter.FILTER_REJECT;
            protocolUrlRegex.lastIndex = 0;
            if (protocolUrlRegex.test(node.nodeValue)) return NodeFilter.FILTER_ACCEPT;
            wwwUrlRegex.lastIndex = 0;
            if (wwwUrlRegex.test(node.nodeValue)) return NodeFilter.FILTER_ACCEPT;
            const bareMatches = Array.from(node.nodeValue.matchAll(bareDomainScanRegex));
            return bareMatches.some(({ 0: value, index }) => extractCandidate(node.nodeValue, { 0: value, index }, 'bare'))
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          }
        }
      );
      const hasPendingText = !!pendingWalker.nextNode();
      if (container.getAttribute(processedAttr) === '1' && !hasPendingText) return;

      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            if (shouldSkipTextNode(node)) return NodeFilter.FILTER_REJECT;
            protocolUrlRegex.lastIndex = 0;
            if (protocolUrlRegex.test(node.nodeValue)) return NodeFilter.FILTER_ACCEPT;
            wwwUrlRegex.lastIndex = 0;
            if (wwwUrlRegex.test(node.nodeValue)) return NodeFilter.FILTER_ACCEPT;
            const bareMatches = Array.from(node.nodeValue.matchAll(bareDomainScanRegex));
            return bareMatches.some(({ 0: value, index }) => extractCandidate(node.nodeValue, { 0: value, index }, 'bare'))
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          }
        }
      );

      const nodes = [];
      let currentNode;
      while ((currentNode = walker.nextNode())) {
        nodes.push(currentNode);
      }
      nodes.forEach(linkifyTextNode);
      container.setAttribute(processedAttr, '1');
    };

    const containers = new Set();
    if (scope.matches && scope.matches(containerSelector)) {
      containers.add(scope);
    }
    if (scope.closest) {
      const closestContainer = scope.closest(containerSelector);
      if (closestContainer) containers.add(closestContainer);
    }
    if (scope.querySelectorAll) {
      scope.querySelectorAll(containerSelector).forEach(node => containers.add(node));
    }
    containers.forEach(processContainer);
    }, () => startupPerfDebug.summarizeRoot(root || document));
  }

  /* --------------------------------------------------
   * tag 22. 检查更新
   * -------------------------------------------------- */
  function initializeUpdateReminderUI() {
    updateSettingsButtonBadge(getUpdateCheckState());
    clearFooterUpdateHighlight();
  }

  window.__xdexGetUpdateCheckState = function() {
    return getUpdateCheckState();
  };

  window.__xdexCheckUpdateNow = function() {
    return checkForDailyScriptUpdate(true).then((state) => {
      scheduleNextUpdateCheckTimer(state);
      return state;
    });
  };

  window.__xdexClearUpdateCheckState = function() {
    GM_deleteValue(UPDATE_CHECK_KEY);
    const state = getDefaultUpdateCheckState();
    updateSettingsButtonBadge(state);
    clearFooterUpdateHighlight();
    console.log('[update-check] cleared state');
    return state;
  };

  window.__xdexSetUpdateCheckState = function(nextState) {
    const state = setUpdateCheckState(nextState || {});
    updateSettingsButtonBadge(state);
    scheduleNextUpdateCheckTimer(state);
    return state;
  };

  window.__xdexPatchUpdateCheckState = function(patch) {
    const state = Object.assign(getUpdateCheckState(), patch || {});
    return window.__xdexSetUpdateCheckState(state);
  };

  const updateDebugTarget = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  updateDebugTarget.__xdexGetUpdateCheckState = window.__xdexGetUpdateCheckState;
  updateDebugTarget.__xdexCheckUpdateNow = window.__xdexCheckUpdateNow;
  updateDebugTarget.__xdexClearUpdateCheckState = window.__xdexClearUpdateCheckState;
  updateDebugTarget.__xdexSetUpdateCheckState = window.__xdexSetUpdateCheckState;
  updateDebugTarget.__xdexPatchUpdateCheckState = window.__xdexPatchUpdateCheckState;

  function scheduleDailyUpdateCheck() {
    if (!isUpdateCheckEnabled()) {
      scheduleNextUpdateCheckTimer(getUpdateCheckState());
      return;
    }
    checkForDailyScriptUpdate(false)
      .then((state) => {
        scheduleNextUpdateCheckTimer(state);
        if (shouldShowPendingUpdateReminder(state) && $('#sp_cover').is(':visible')) {
          openUpdateLogDialog('remote');
        }
      })
      .catch((e) => {
        console.warn('[update-check] schedule failed:', e);
      });
  }

  function scheduleNextUpdateCheckTimer(state = getUpdateCheckState()) {
    if (window.__xdexUpdateCheckTimer) {
      clearTimeout(window.__xdexUpdateCheckTimer);
      window.__xdexUpdateCheckTimer = 0;
    }
    if (!isUpdateCheckEnabled()) return;
    const nextCheckAt = Number(state && state.nextCheckAt || 0);
    if (!nextCheckAt) return;
    const delay = Math.max(0, nextCheckAt - Date.now());
    window.__xdexUpdateCheckTimer = setTimeout(() => {
      window.__xdexUpdateCheckTimer = 0;
      scheduleDailyUpdateCheck();
    }, Math.min(delay, 2147483647));
    console.log('[update-check] timer scheduled:', {
      nextCheckAt,
      nextCheckAtISO: new Date(nextCheckAt).toISOString(),
      delay
    });
  }

  /* --------------------------------------------------
   * tag 23. 图片/GIF 右键菜单增强
   * -------------------------------------------------- */
  function ensureImageContextMenuStyle() {
    if (document.getElementById('xdex-image-context-menu-style')) return;
    const style = document.createElement('style');
    style.id = 'xdex-image-context-menu-style';
    style.textContent = `
      #xdex-image-context-menu {
        position: fixed;
        z-index: 10050;
        min-width: 156px;
        max-width: 220px;
        padding: 6px 0;
        background: #FFFFEE;
        border: 1px solid #d6c7ba;
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.18);
        font-size: 13px;
        color: #333;
        user-select: none;
      }
      :root.xdex-darkreader-active #xdex-image-context-menu {
        background: #2b2c2d;
        border-color: #4b4d50;
        box-shadow: 0 10px 28px rgba(0,0,0,0.5);
        color: #e6e6e6;
      }
      #xdex-image-context-menu.xdex-hidden {
        display: none;
      }
      #xdex-image-context-menu .xdex-image-context-item {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 8px 12px;
        border: 0;
        background: transparent;
        color: inherit;
        text-align: left;
        cursor: pointer;
        line-height: 1.35;
        box-sizing: border-box;
      }
      #xdex-image-context-menu .xdex-image-context-item:hover,
      #xdex-image-context-menu .xdex-image-context-item:focus {
        background: rgba(102, 204, 255, 0.14);
        outline: none;
      }
      :root.xdex-darkreader-active #xdex-image-context-menu .xdex-image-context-item:hover,
      :root.xdex-darkreader-active #xdex-image-context-menu .xdex-image-context-item:focus {
        background: rgba(102, 204, 255, 0.18);
      }
      #xdex-image-context-menu .xdex-image-context-sep {
        height: 1px;
        margin: 4px 0;
        background: rgba(0,0,0,0.08);
      }
      :root.xdex-darkreader-active #xdex-image-context-menu .xdex-image-context-sep {
        background: rgba(255,255,255,0.08);
      }
      #xdex-image-context-menu .xdex-image-context-hint {
        display: block;
        margin-top: 2px;
        font-size: 11px;
        opacity: 0.72;
      }
    `;
    document.head.appendChild(style);
  }

  function gmRequestBlob(url) {
    return new Promise((resolve, reject) => {
      if (!url || typeof GM_xmlhttpRequest !== 'function') {
        reject(new Error('GM_xmlhttpRequest 不可用'));
        return;
      }
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        responseType: 'blob',
        onload: (res) => {
          if (res.status >= 200 && res.status < 300 && res.response) {
            resolve(res.response);
          } else {
            reject(new Error(`请求失败: ${res.status} ${url}`));
          }
        },
        onerror: (err) => {
          const reason = err && (err.error || err.statusText || err.status || err.message);
          reject(new Error(`请求失败: ${reason || '未知错误'} ${url}`));
        },
        ontimeout: () => reject(new Error('请求超时'))
      });
    });
  }

  async function fetchImageBlobByBrowser(url) {
    const resp = await fetch(url, { credentials: 'omit', cache: 'no-store' });
    if (!resp.ok) throw new Error(`fetch 请求失败: ${resp.status} ${url}`);
    return await resp.blob();
  }

  function handleImageContextMenuEvent(e, layer) {
    if (layer === 'document' && e.defaultPrevented) return false;
    // console.info('【右键菜单｜收到右键】', {
    //   标签: e.target && e.target.tagName,
    //   类名: e.target && e.target.className ? String(e.target.className).slice(0, 120) : '',
    //   坐标: `${e.clientX},${e.clientY}`,
    //   层级: layer
    // });
    const anchor = e.target && e.target.closest ? e.target.closest('.h-threads-img-a') : null;
    if (!anchor) {
      // console.info('【右键菜单｜跳过】', { 原因: '未命中图片链接', 层级: layer });
      return false;
    }
    if (anchor.closest('.h-preview-box')) {
      // console.info('【右键菜单｜跳过】', { 原因: '命中预览框图片', 层级: layer });
      return false;
    }
    // console.info('【右键菜单｜命中】', { 链接: (anchor.href || '').slice(0, 200), 层级: layer });

    const ctx = resolveImageContextData(anchor);
    if (!ctx) {
      console.warn('【右键菜单｜解析失败】', { 原因: '图片上下文为空', 层级: layer });
      return false;
    }

    e.preventDefault();
    if (typeof e.stopImmediatePropagation === 'function') {
      e.stopImmediatePropagation();
    }
    e.stopPropagation();
    e.cancelBubble = true;
    e.returnValue = false;
    // console.info('【右键菜单｜阻止原生】', { 成功: true, 层级: layer });
    openImageContextMenu(ctx, e.clientX, e.clientY);
    return true;
  }

  function getImageContextMenu() {
    ensureImageContextMenuStyle();
    let menu = document.getElementById('xdex-image-context-menu');
    // if (menu) console.debug('【右键菜单｜复用】', { 已存在: true });
    if (menu) return menu;
    // console.debug('【右键菜单｜创建】', { 已存在: false });
    menu = document.createElement('div');
    menu.id = 'xdex-image-context-menu';
    menu.className = 'xdex-hidden';
    menu.innerHTML = [
      // '<button type="button" class="xdex-image-context-item" data-action="copy-image">复制图片<span class="xdex-image-context-hint">GIF 先尝试原样复制，失败时自动降级</span></button>',
      '<button type="button" class="xdex-image-context-item" data-action="copy-image">复制图片</button>',
      '<button type="button" class="xdex-image-context-item" data-action="download-image">下载图片</button>',
      '<button type="button" class="xdex-image-context-item" data-action="copy-image-url">复制图片链接</button>',
      // '<div class="xdex-image-context-sep"></div>',
      '<button type="button" class="xdex-image-context-item" data-action="copy-thread-link">复制串链接</button>'
    ].join('');
    menu.__context = null;
    menu.addEventListener('click', async (e) => {
      const btn = e.target.closest('.xdex-image-context-item[data-action]');
      if (!btn) return;
      e.preventDefault();
      const ctx = menu.__context;
      closeImageContextMenu();
      if (!ctx) return;
      const action = btn.getAttribute('data-action');
      try {
        if (action === 'copy-image') {
          await copyImageBinary(ctx);
        } else if (action === 'download-image') {
          await downloadImageBlob(ctx);
        } else if (action === 'copy-image-url') {
          await copyImageUrl(ctx);
        } else if (action === 'copy-thread-link') {
          await copyThreadLink(ctx);
        }
      } catch (err) {
        console.warn('[tag23] action failed:', action, err);
        toast('操作失败，请重试');
      }
    });
    document.body.appendChild(menu);
    // console.info('【右键菜单｜挂载】', { 位置: 'body', 菜单项数: menu.querySelectorAll('.xdex-image-context-item').length });

    if (!getImageContextMenu.__globalBound) {
      // console.info('【右键菜单｜注册】', { 类型: 'contextmenu/click/blur/scroll/keydown', 阶段: 'capture' });
      window.addEventListener('contextmenu', (e) => {
        return handleImageContextMenuEvent(e, 'window') ? false : undefined;
      }, true);
      document.addEventListener('contextmenu', (e) => {
        return handleImageContextMenuEvent(e, 'document') ? false : undefined;
      }, true);
      document.addEventListener('click', (e) => {
        const cur = document.getElementById('xdex-image-context-menu');
        if (!cur || cur.classList.contains('xdex-hidden')) return;
        if (cur.contains(e.target)) return;
        closeImageContextMenu();
      }, true);
      window.addEventListener('blur', () => closeImageContextMenu());
      window.addEventListener('scroll', () => closeImageContextMenu(), true);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeImageContextMenu();
      });
      getImageContextMenu.__globalBound = true;
    }
    return menu;
  }

  function closeImageContextMenu() {
    const menu = document.getElementById('xdex-image-context-menu');
    if (!menu) return;
    menu.classList.add('xdex-hidden');
    menu.style.left = '-9999px';
    menu.style.top = '-9999px';
    menu.__context = null;
    // console.debug('【右键菜单｜关闭】', { 原因: '隐藏菜单' });
  }

  function shouldUseExtensionNativeImageContextMenu(cfg) {
    return !!(XDEX_RUNTIME && XDEX_RUNTIME.kind === 'extension' && cfg && cfg.enableImageContextMenu);
  }

  function openImageContextMenu(context, x, y) {
    const menu = getImageContextMenu();
    menu.__context = context;
    menu.classList.remove('xdex-hidden');
    menu.style.left = '0px';
    menu.style.top = '0px';
    const rect = menu.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - rect.width - 8);
    const top = Math.min(y, window.innerHeight - rect.height - 8);
    menu.style.left = Math.max(8, left) + 'px';
    menu.style.top = Math.max(8, top) + 'px';
    // console.info('【右键菜单｜显示】', {
    //   位置: `${menu.style.left},${menu.style.top}`,
    //   图片地址: String(context && context.imageUrl || '').slice(0, 200),
    //   GIF: !!(context && context.isGif)
    // });
  }

  function resolveThreadLinkFromImageTarget(target) {
    const $target = $(target);
    const tid = getThreadIdForElement($target);
    if (tid) return `${location.origin}/t/${tid}`;
    return location.href;
  }

  function sanitizeImageFileName(name) {
    return String(name || 'image')
      .replace(/[\\/:*?"<>|]+/g, '_')
      .replace(/\s+/g, ' ')
      .trim() || 'image';
  }

  function resolveImageContextData(anchorOrBox) {
    const anchor = anchorOrBox && anchorOrBox.matches && anchorOrBox.matches('.h-threads-img-a')
      ? anchorOrBox
      : anchorOrBox && anchorOrBox.querySelector
        ? anchorOrBox.querySelector('.h-threads-img-a')
        : null;
    if (!anchor) return null;
    const imgBox = anchor.closest('.h-threads-img-box');
    const img = imgBox ? imgBox.querySelector('.h-threads-img') : null;
    const rawUrl = (anchor.href || (img && (img.currentSrc || img.src)) || '').trim();
    if (!rawUrl) {
      console.warn('【右键菜单｜解析跳过】', { 原因: '图片地址为空' });
      return null;
    }
    const cleanUrl = rawUrl.replace('/thumb/', '/image/');
    let fileName = '';
    try {
      const u = new URL(cleanUrl, location.href);
      const leaf = decodeURIComponent((u.pathname.split('/').pop() || '').trim());
      fileName = sanitizeImageFileName(leaf || `image-${Date.now()}`);
    } catch (e) {
      fileName = sanitizeImageFileName(`image-${Date.now()}`);
    }
    return {
      anchor,
      imgBox,
      img,
      imageUrl: cleanUrl,
      imageUrlRaw: rawUrl,
      threadUrl: resolveThreadLinkFromImageTarget(anchor),
      fileName,
      isGif: /\.gif(?:$|[?#])/i.test(cleanUrl)
    };
  }

  async function writeClipboardText(text, successToast) {
    await navigator.clipboard.writeText(String(text || ''));
    if (successToast) toast(successToast);
  }

  function blobToObjectUrlDownload(blob, fileName) {
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = sanitizeImageFileName(fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 3000);
  }

  function resolveImageMimeType(ctx, blob) {
    let type = String(blob && blob.type || '').split(';')[0].trim().toLowerCase();
    if (type === 'image/jpg') type = 'image/jpeg';
    if (type) return type;

    const source = `${ctx && ctx.imageUrl || ''} ${ctx && ctx.fileName || ''}`;
    if (/\.gif(?:$|[?#\s])/i.test(source)) return 'image/gif';
    if (/\.jpe?g(?:$|[?#\s])/i.test(source)) return 'image/jpeg';
    if (/\.png(?:$|[?#\s])/i.test(source)) return 'image/png';
    if (/\.webp(?:$|[?#\s])/i.test(source)) return 'image/webp';
    if (/\.bmp(?:$|[?#\s])/i.test(source)) return 'image/bmp';
    if (/\.avif(?:$|[?#\s])/i.test(source)) return 'image/avif';
    return '';
  }

  async function detectImageMimeTypeFromMagic(blob) {
    if (!blob || blob.size < 4) return '';
    const bytes = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'image/gif';
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'image/png';
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp';
    if (bytes[0] === 0x42 && bytes[1] === 0x4d) return 'image/bmp';
    return '';
  }

  async function fetchImageBlobForContext(ctx) {
    let blob;
    try {
      blob = await gmRequestBlob(ctx.imageUrl);
    } catch (err) {
      console.warn('【右键菜单｜失败】', { 动作: '抓取图片', 阶段: 'GM_xmlhttpRequest', 原因: err && err.message ? err.message : String(err) });
      blob = await fetchImageBlobByBrowser(ctx.imageUrl);
      console.info('【右键菜单｜抓取图片】', { 阶段: 'fetch备用成功', 地址: String(ctx && ctx.imageUrl || '').slice(0, 200), MIME: String(blob && blob.type || ''), 大小: blob && blob.size });
    }
    const type = resolveImageMimeType(ctx, blob);
    if (!blob || !type.startsWith('image/')) {
      throw new Error(`Not an image content type. Got: ${blob && blob.type}`);
    }
    return blob;
  }

  async function convertBlobToPng(blob) {
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return await new Promise((resolve, reject) => {
      canvas.toBlob((pngBlob) => {
        if (pngBlob) resolve(pngBlob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/png');
    });
  }

  function createClipboardBlob(data, type) {
    return new Blob([data], { type });
  }

  function escapeHtmlAttr(value) {
    return String(value || '').replace(/[&<>"]/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    })[ch]);
  }

  async function isAnimatedPngBlob(blob) {
    if (!blob || blob.size < 33) return false;
    const header = new Uint8Array(await blob.slice(0, Math.min(blob.size, 1024 * 1024)).arrayBuffer());
    const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
    for (let i = 0; i < pngSignature.length; i++) {
      if (header[i] !== pngSignature[i]) return false;
    }
    for (let offset = 8; offset + 12 <= header.length;) {
      const length = ((header[offset] << 24) | (header[offset + 1] << 16) | (header[offset + 2] << 8) | header[offset + 3]) >>> 0;
      const type = String.fromCharCode(header[offset + 4], header[offset + 5], header[offset + 6], header[offset + 7]);
      if (type === 'acTL') return true;
      if (type === 'IDAT' || type === 'IEND') return false;
      offset += 12 + length;
      if (offset > header.length) return false;
    }
    return false;
  }

  async function copyAnimatedPngBinary(ctx, blob) {
    const imageUrl = String(ctx && ctx.imageUrl || '');
    const pngBlob = blob.type === 'image/png' ? blob : new Blob([blob], { type: 'image/png' });
    const webPngSupports = typeof ClipboardItem.supports === 'function' ? ClipboardItem.supports('web image/png') : undefined;
    console.info('【右键菜单｜APNG复制】', {
      阶段: '开始',
      大小: pngBlob.size,
      原始MIME: String(blob.type || ''),
      webImagePngSupports: webPngSupports,
      地址: imageUrl.slice(0, 200)
    });

    try {
      const html = `<img src="${escapeHtmlAttr(imageUrl)}">`;
      await navigator.clipboard.write([new ClipboardItem({
        'web image/png': pngBlob,
        'text/html': createClipboardBlob(html, 'text/html'),
        'text/plain': createClipboardBlob(imageUrl, 'text/plain')
      })]);
      toast('APNG 已按富文本图片复制到剪贴板');
      console.info('【右键菜单｜APNG复制】', { 阶段: 'web image/png成功', 附带: 'text/html,text/plain' });
      return true;
    } catch (err) {
      console.warn('【右键菜单｜失败】', { 动作: '复制APNG', 阶段: 'web image/png写入', 原因: err && err.message ? err.message : String(err) });
    }

    try {
      const html = `<img src="${escapeHtmlAttr(imageUrl)}">`;
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': createClipboardBlob(html, 'text/html'),
        'text/plain': createClipboardBlob(imageUrl, 'text/plain')
      })]);
      toast('APNG 已按富文本图片复制到剪贴板');
      console.info('【右键菜单｜APNG复制】', { 阶段: 'text/html成功' });
      return true;
    } catch (err) {
      console.warn('【右键菜单｜失败】', { 动作: '复制APNG', 阶段: 'text/html写入', 原因: err && err.message ? err.message : String(err) });
    }

    await copyImageUrl(ctx);
    toast('当前环境无法保留 APNG 动画，已复制图片地址');
    console.info('【右键菜单｜APNG复制】', { 阶段: 'URL兜底' });
    return false;
  }

  async function copyGifBinary(ctx, blob) {
    const gifUrl = String(ctx && ctx.imageUrl || '');
    const gifBlob = blob.type === 'image/gif' ? blob : new Blob([blob], { type: 'image/gif' });
    const gifSupports = typeof ClipboardItem.supports === 'function' ? ClipboardItem.supports('image/gif') : undefined;
    const webGifSupports = typeof ClipboardItem.supports === 'function' ? ClipboardItem.supports('web image/gif') : undefined;
    console.info('【右键菜单｜GIF复制】', {
      阶段: '开始',
      大小: gifBlob.size,
      原始MIME: String(blob.type || ''),
      imageGifSupports: gifSupports,
      webImageGifSupports: webGifSupports,
      地址: gifUrl.slice(0, 200)
    });

    if (gifSupports === true) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/gif': gifBlob })]);
        toast('GIF 已原样复制到剪贴板');
        console.info('【右键菜单｜GIF复制】', { 阶段: 'image/gif成功' });
        return true;
      } catch (err) {
        console.warn('【右键菜单｜失败】', { 动作: '复制GIF', 阶段: 'image/gif写入', 原因: err && err.message ? err.message : String(err) });
      }
    } else {
      console.info('【右键菜单｜GIF复制】', { 阶段: 'image/gif跳过', 原因: 'ClipboardItem.supports 未确认支持' });
    }

    try {
      const html = `<img src="${escapeHtmlAttr(gifUrl)}">`;
      const data = {
        'web image/gif': gifBlob,
        'text/html': createClipboardBlob(html, 'text/html'),
        'text/plain': createClipboardBlob(gifUrl, 'text/plain')
      };
      await navigator.clipboard.write([new ClipboardItem(data)]);
      toast('GIF 已按富文本图片复制到剪贴板');
      console.info('【右键菜单｜GIF复制】', { 阶段: 'web image/gif成功', 附带: 'text/html,text/plain' });
      return true;
    } catch (err) {
      console.warn('【右键菜单｜失败】', { 动作: '复制GIF', 阶段: 'web image/gif写入', 原因: err && err.message ? err.message : String(err) });
    }

    try {
      const html = `<img src="${escapeHtmlAttr(gifUrl)}">`;
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': createClipboardBlob(html, 'text/html'),
        'text/plain': createClipboardBlob(gifUrl, 'text/plain')
      })]);
      toast('GIF 已按富文本图片复制到剪贴板');
      console.info('【右键菜单｜GIF复制】', { 阶段: 'text/html成功' });
      return true;
    } catch (err) {
      console.warn('【右键菜单｜失败】', { 动作: '复制GIF', 阶段: 'text/html写入', 原因: err && err.message ? err.message : String(err) });
    }

    await copyImageUrl(ctx);
    toast('当前环境无法复制 GIF 二进制，已复制图片地址');
    console.info('【右键菜单｜GIF复制】', { 阶段: 'URL兜底' });
    return false;
  }

  async function copyImageBinary(ctx) {
    console.info('【右键菜单｜执行】', { 动作: '复制图片', GIF: !!(ctx && ctx.isGif), 地址: String(ctx && ctx.imageUrl || '').slice(0, 200) });
    if (!navigator.clipboard || typeof navigator.clipboard.write !== 'function' || typeof ClipboardItem === 'undefined') {
      await copyImageUrl(ctx);
      toast('当前环境不支持复制图片，已复制图片地址');
      return;
    }

    const blob = await fetchImageBlobForContext(ctx);
    const declaredType = resolveImageMimeType(ctx, blob);
    const magicType = await detectImageMimeTypeFromMagic(blob);
    const type = magicType || declaredType;
    const supportsOriginal = type === 'image/png'
      || (type === 'image/svg+xml' && typeof ClipboardItem.supports === 'function' && ClipboardItem.supports(type));
    console.info('【右键菜单｜复制诊断】', {
      MIME: type,
      原始MIME: String(blob.type || ''),
      魔数MIME: magicType,
      大小: blob.size,
      ClipboardItemSupports: supportsOriginal,
      GIF: !!(ctx && ctx.isGif)
    });

    if (type === 'image/gif') {
      await copyGifBinary(ctx, blob);
      return;
    }

    if (type === 'image/png' && await isAnimatedPngBlob(blob)) {
      await copyAnimatedPngBinary(ctx, blob);
      return;
    }

    try {
      if (supportsOriginal) {
        await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
        toast('图片已复制到剪贴板');
        return;
      }
      console.info('【右键菜单｜复制诊断】', { 阶段: '原始格式跳过', MIME: type, 原因: '仅 PNG/SVG 作为可靠原格式写入' });
    } catch (err) {
      console.warn('[tag23] native clipboard write failed:', type, err);
      console.warn('【右键菜单｜失败】', { 动作: '复制图片', 阶段: '原始格式写入', 原因: err && err.message ? err.message : String(err) });
    }

    if (type !== 'image/gif') {
      try {
        const pngBlob = await convertBlobToPng(blob);
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
        toast('已复制为 PNG ');
        return;
      } catch (err) {
        console.warn('[tag23] png fallback failed:', err);
        console.warn('【右键菜单｜失败】', { 动作: '复制图片', 阶段: 'PNG降级', 原因: err && err.message ? err.message : String(err) });
      }
    }

    await copyImageUrl(ctx);
    toast(type === 'image/gif' ? '当前环境无法直接复制 GIF，已复制图片地址' : '当前环境无法直接复制图片，已复制图片地址');
  }

  async function copyImageUrl(ctx) {
    console.info('【右键菜单｜执行】', { 动作: '复制图片地址', 地址: String(ctx && ctx.imageUrl || '').slice(0, 200) });
    await writeClipboardText(ctx.imageUrl, '图片地址已复制');
  }

  async function downloadImageBlob(ctx) {
    console.info('【右键菜单｜执行】', { 动作: '下载图片', 地址: String(ctx && ctx.imageUrl || '').slice(0, 200), 文件名: ctx && ctx.fileName });
    try {
      const blob = await fetchImageBlobForContext(ctx);
      let fileName = ctx.fileName;
      if (!/\.[a-z0-9]+$/i.test(fileName)) {
        const ext = (blob.type || '').split('/')[1] || 'img';
        fileName = `${fileName}.${ext}`;
      }
      blobToObjectUrlDownload(blob, fileName);
      toast('图片开始下载');
    } catch (err) {
      console.warn('[tag23] download image failed:', err);
      console.warn('【右键菜单｜失败】', { 动作: '下载图片', 原因: err && err.message ? err.message : String(err) });
      await copyImageUrl(ctx);
      toast('下载失败，已复制图片地址');
    }
  }

  async function copyThreadLink(ctx) {
    console.info('【右键菜单｜执行】', { 动作: '复制串链接', 串链接: String(ctx && ctx.threadUrl || '').slice(0, 200) });
    await writeClipboardText(ctx.threadUrl, '串链接已复制');
  }

  function enableImageContextMenu(root = document) {
    return startupPerfDebug.measure('enableImageContextMenu', () => {
    const cfg = Object.assign({}, SettingPanel.defaults, GM_getValue(SettingPanel.key, {}));
    if (!cfg.enableImageContextMenu) return;
    if (shouldUseExtensionNativeImageContextMenu(cfg)) return;
    ensureImageContextMenuStyle();
    getImageContextMenu();
    }, () => startupPerfDebug.summarizeRoot(root));
  }

  /* --------------------------------------------------
   * tag 24. 常用串/浏览历史/发言历史/移动端订阅
   * -------------------------------------------------- */
  function getFavoriteThreadsConfig() {
    try {
      const cfg = Object.assign({}, SettingPanel.defaults, SettingPanel.state || {}, GM_getValue(SettingPanel.key, {}));
      cfg.favoriteThreads = normalizeFavoriteThreads(cfg.favoriteThreads);
      return cfg;
    } catch (e) {
      const cfg = Object.assign({}, SettingPanel.defaults, SettingPanel.state || {});
      cfg.favoriteThreads = normalizeFavoriteThreads(cfg.favoriteThreads);
      return cfg;
    }
  }

  function isFavoriteThreadPageLocation() {
    const path = window.location.pathname || '';
    return /^\/t\/\d{8}(?:\/\d+)?\/?$/.test(path)
      || /^\/Forum\/po\/id\/\d{8}(?:\/page\/\d+)?(?:\.html)?$/i.test(path);
  }

  function getCurrentFavoriteThreadId() {
    if (!isFavoriteThreadPageLocation()) return '';
    const fromUrl = normalizeFavoriteThreadInput(window.location.href);
    if (fromUrl) return fromUrl;
    const mainThreadId = document.querySelector('.h-threads-list .h-threads-item[data-threads-id]')?.getAttribute('data-threads-id') || '';
    return isValidThreadId(mainThreadId) ? mainThreadId : '';
  }

  function getFavoriteThreadsAddLinkText() {
    return isFavoriteThreadPageLocation() ? '添加当前串' : '添加常用串';
  }

  function getCurrentFavoriteThreadDesc() {
    const fromTitle = String(document.title || '').replace(/\s+-\s+No\.\d{8}.*$/, '').trim();
    const title = fromTitle && !/^No\.\d{8}/.test(fromTitle) ? fromTitle : selectEnhanceIslandTitleText();
    return trimFavoriteThreadDesc(title);
  }

  function openFavoriteThreadsSettingsPanel(options = {}) {
    try {
      if (!$('#sp_btn').length) SettingPanel.init();
      $('#sp_btn').trigger('click');
      window.setTimeout(() => {
        const $container = $('#favorite-thread-inputs-container');
        const $fold = $container.closest('.sp_fold');
        const $body = $fold.children('.sp_fold_body');
        if (!$body.is(':visible')) {
          $body.slideDown(150);
          $('#btn_sp_favoriteThreads,#btn_group_favoriteThreads').removeClass('xdex-inv');
        }
        if ($fold[0]) $fold[0].scrollIntoView({ block: 'center' });
        if (options.addEmptyGroup) {
          const nextIndex = $container.find('.favorite-thread-row').length + 1;
          $container.append(buildFavoriteThreadRowHtml(nextIndex));
        }
        const $target = $container.find('.favorite-thread-id-input').last();
        if ($target.length) $target.focus();
      }, 0);
    } catch (e) {
      console.warn('[favoriteThreads] open settings failed:', e);
    }
  }

  function openThreadHistorySettingsPanel() {
    try {
      if (!$('#sp_btn').length) SettingPanel.init();
      $('#sp_btn').trigger('click');
      window.setTimeout(() => {
        $('#sp_panel_tab_slot [data-sp-module="history"]').trigger('click');
      }, 0);
    } catch (e) {
      console.warn('[thread-history] open settings failed:', e);
    }
  }

  function openPostHistorySettingsPanel() {
    try {
      if (!$('#sp_btn').length) SettingPanel.init();
      $('#sp_btn').trigger('click');
      window.setTimeout(() => {
        $('#sp_panel_tab_slot [data-sp-module="posts"]').trigger('click');
      }, 0);
    } catch (e) {
      console.warn('[post-history] open settings failed:', e);
    }
  }

  function openSubscriptionFeedSettingsPanel() {
    try {
      if (!$('#sp_btn').length) SettingPanel.init();
      $('#sp_btn').trigger('click');
      window.setTimeout(() => {
        $('#sp_panel_tab_slot [data-sp-module="feeds"]').trigger('click');
      }, 0);
    } catch (e) {
      console.warn('[subscription-feed] open settings failed:', e);
    }
  }

  function setXDexSidebarExLabel(link, label) {
    link.classList.add('xdex-sidebar-ex-link');
    link.textContent = '';
    link.appendChild(document.createTextNode(label));
    const badge = document.createElement('sub');
    badge.className = 'xdex-sidebar-ex-badge';
    badge.style.cssText = 'color: darkorange; font-weight: bold;';
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = 'EX';
    link.appendChild(badge);
  }

  function createPostHistoryMenuNode() {
    const li = document.createElement('li');
    li.id = 'xdex-post-history-menu';
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'h-nav-parent-header fr-bold-33d0c43d3b0';
    link.setAttribute('achecked', '1');
    setXDexSidebarExLabel(link, '我的发言');
    link.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openPostHistorySettingsPanel();
      return false;
    };
    li.appendChild(link);
    return li;
  }

  function createSubscriptionFeedMenuNode() {
    const li = document.createElement('li');
    li.id = 'xdex-subscription-feed-menu';
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'h-nav-parent-header fr-bold-33d0c43d3b0';
    link.setAttribute('achecked', '1');
    setXDexSidebarExLabel(link, '我的订阅');
    link.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSubscriptionFeedSettingsPanel();
      return false;
    };
    li.appendChild(link);
    return li;
  }

  function addCurrentThreadToFavoriteThreads() {
    const threadId = getCurrentFavoriteThreadId();
    if (!threadId) {
      openFavoriteThreadsSettingsPanel({ addEmptyGroup: true });
      toast('请在常用串设置中手动填写');
      return;
    }

    const cfg = getFavoriteThreadsConfig();
    const duplicateIndex = cfg.favoriteThreads.findIndex((item) => item.threadId === threadId);
    if (duplicateIndex >= 0) {
      const dup = cfg.favoriteThreads[duplicateIndex];
      const suffix = dup.desc ? `（${dup.desc}）` : '';
      toast(`当前串已在第${duplicateIndex + 1}组${suffix}`);
      return;
    }

    const settings = Object.assign({}, SettingPanel.defaults, GM_getValue(SettingPanel.key, {}), SettingPanel.state || {});
    settings.favoriteThreads = normalizeFavoriteThreads([...(cfg.favoriteThreads || []), {
      desc: getCurrentFavoriteThreadDesc(),
      threadId,
    }]);
    SettingPanel.state = settings;
    GM_setValue(SettingPanel.key, settings);
    try { SettingPanel.syncInputs(); } catch (e) {}
    renderFavoriteThreadsMenu();
    toast('已添加当前串到常用串');
  }

  function ensureFavoriteThreadsMenuStyle() {
    if (document.getElementById('xdex-favorite-threads-menu-style')) return;
    const style = document.createElement('style');
    style.id = 'xdex-favorite-threads-menu-style';
    style.textContent = `
      #h-menu-content .xdex-sidebar-ex-badge {
        color: darkorange;
        font-weight: bold;
        font-size: 10px;
        line-height: 1;
        margin-left: 1px;
      }
      #h-menu-content.uk-nav-parent-icon > #xdex-favorite-threads-menu > a::after {
        content: "\f104";
        width: 20px;
        margin-right: -10px;
        float: right;
        font-family: FontAwesome;
        text-align: center;
      }
      #h-menu-content.uk-nav-parent-icon > #xdex-favorite-threads-menu.uk-open > a::after {
        content: "\f107";
      }
      #xdex-favorite-threads-menu .xdex-favorite-add-current {
        text-decoration: underline;
      }
    `;
    document.head.appendChild(style);
  }

  function createFavoriteThreadsMenuNode(items, isOpen = false) {
    const li = document.createElement('li');
    li.id = 'xdex-favorite-threads-menu';
    li.className = 'uk-parent';
    if (isOpen) li.classList.add('uk-open');

    const header = document.createElement('a');
    header.href = '#';
    header.className = 'h-nav-parent-header fr-bold-33d0c43d3b0';
    header.setAttribute('achecked', '1');
    header.setAttribute('onclick', 'return false;');
    setXDexSidebarExLabel(header, '常用串');
    li.appendChild(header);

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `overflow:hidden;height:${isOpen ? 'auto' : '0'};position:relative;`;
    wrapper.classList.toggle('uk-hidden', !isOpen);
    const list = document.createElement('ul');
    list.className = 'uk-nav-sub';

    const addItem = document.createElement('li');
    const addLink = document.createElement('a');
    addLink.href = '#';
    addLink.className = 'xdex-favorite-add-current';
    addLink.setAttribute('achecked', '1');
    addLink.textContent = getFavoriteThreadsAddLinkText();
    addLink.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      addCurrentThreadToFavoriteThreads();
      return false;
    };
    addItem.appendChild(addLink);
    list.appendChild(addItem);

    items.forEach((item) => {
      const subItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = getLatestThreadHistoryUrl(item.threadId) || makeFavoriteThreadUrl(item.threadId);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('achecked', '1');
      link.textContent = formatFavoriteThreadMenuText(item);
      link.title = item.desc ? `${item.desc} - ${item.threadId}` : '';
      subItem.appendChild(link);
      list.appendChild(subItem);
    });

    wrapper.appendChild(list);
    li.appendChild(wrapper);
    if (window.jQuery) $(li).data('list-container', $(wrapper));
    li.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    header.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const opening = !li.classList.contains('uk-open');
      li.classList.toggle('uk-open', opening);
      li.setAttribute('aria-expanded', opening ? 'true' : 'false');
      if (window.jQuery) {
        if (opening) wrapper.classList.remove('uk-hidden');
        $(wrapper).stop(true, true).animate({ height: opening ? $(list).outerHeight() : 0 }, () => {
          if (opening && li.classList.contains('uk-open')) {
            wrapper.style.height = 'auto';
            wrapper.classList.remove('uk-hidden');
          } else if (!opening) {
            wrapper.style.height = '0';
            wrapper.classList.add('uk-hidden');
          }
        });
        return;
      }
      if (opening) {
        wrapper.classList.remove('uk-hidden');
        wrapper.style.height = `${list.scrollHeight}px`;
        window.setTimeout(() => {
          if (li.classList.contains('uk-open')) wrapper.style.height = 'auto';
        }, 160);
      } else {
        wrapper.style.height = `${list.scrollHeight}px`;
        window.requestAnimationFrame(() => {
          wrapper.style.height = '0';
          wrapper.classList.add('uk-hidden');
        });
      }
    });
    return li;
  }

  function createThreadHistoryMenuNode() {
    const li = document.createElement('li');
    li.id = 'xdex-thread-history-menu';
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'h-nav-parent-header fr-bold-33d0c43d3b0';
    link.setAttribute('achecked', '1');
    setXDexSidebarExLabel(link, '浏览历史');
    link.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openThreadHistorySettingsPanel();
      return false;
    };
    li.appendChild(link);
    return li;
  }

  function renderFavoriteThreadsMenu() {
    const menu = document.getElementById('h-menu-content') || document.querySelector('.h-menu-content');
    if (!menu) return;
    menu.classList.add('uk-nav-parent-icon');
    ensureFavoriteThreadsMenuStyle();
    const old = document.getElementById('xdex-favorite-threads-menu');
    const oldThreadHistory = document.getElementById('xdex-thread-history-menu');
    const oldPostHistory = document.getElementById('xdex-post-history-menu');
    const oldSubscriptionFeed = document.getElementById('xdex-subscription-feed-menu');
    const wasOpen = !!(old && old.classList.contains('uk-open'));

    if (old) old.remove();
    if (oldThreadHistory) oldThreadHistory.remove();
    if (oldPostHistory) oldPostHistory.remove();
    if (oldSubscriptionFeed) oldSubscriptionFeed.remove();

    const items = getFavoriteThreadsConfig().favoriteThreads || [];
    const node = createFavoriteThreadsMenuNode(items, wasOpen);
    const threadHistoryNode = createThreadHistoryMenuNode();
    const postHistoryNode = createPostHistoryMenuNode();
    const subscriptionFeedNode = createSubscriptionFeedMenuNode();
    const timeline = Array.from(menu.children).find((li) => {
      const header = li && li.querySelector ? li.querySelector(':scope > .h-nav-parent-header, :scope > a') : null;
      return header && (header.textContent || '').trim() === '时间线';
    });
    menu.insertBefore(node, timeline || menu.firstChild);
    menu.insertBefore(threadHistoryNode, timeline || node.nextSibling);
    menu.insertBefore(postHistoryNode, timeline || threadHistoryNode.nextSibling);
    menu.insertBefore(subscriptionFeedNode, timeline || postHistoryNode.nextSibling);
  }

  // ─── 页面内「订阅EX」快捷按钮 ─────────────────────────────────────────────────────────
  function ensureSubscriptionExButtonStyle() {
    if (document.getElementById('xdex-subscription-ex-btn-style')) return;
    const style = document.createElement('style');
    style.id = 'xdex-subscription-ex-btn-style';
    style.textContent = `
      .xdex-sub-ex-btn { color: #00FFCC; font-weight: normal; }
      .xdex-sub-ex-btn .xdex-sidebar-ex-badge {
        color: #66CCFF;
        font-weight: bold;
        font-size: 10px;
        line-height: 1;
        margin-left: 1px;
      }
      .xdex-sub-ex-btn:hover { text-decoration: underline; }
      .xdex-feed-selector-display {
        display: flex; align-items: center; gap: 6px;
        padding: 6px 8px;
        border: 1px solid var(--xdex-sp-border, #bfa58f);
        border-radius: 8px;
        background: var(--xdex-sp-panel-bg, #FFFFEE);
        cursor: pointer;
        font-size: 13px;
        line-height: 1.4;
        min-height: 1.4em;
        user-select: none;
        overflow: hidden;
      }
      .xdex-feed-display-desc {
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .xdex-feed-display-uuid {
        font-size: 12px; color: #888;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        filter: blur(4px);
        transition: filter 0.15s;
      }
      .xdex-feed-display-uuid:empty { display: none; }
      .xdex-feed-selector-wrap:hover .xdex-feed-display-uuid {
        filter: none;
      }
      .xdex-feed-selector-dropdown {
        position: absolute; top: 100%; left: 0; right: 0;
        margin-top: 2px;
        border: 1px solid var(--xdex-sp-border, #bfa58f);
        border-radius: 8px;
        background: #FFFFEE;
        box-shadow: 0 2px 8px rgba(0,0,0,.15);
        z-index: 100;
        max-height: 200px; overflow-y: auto;
      }
      .xdex-feed-option {
        padding: 6px 8px;
        cursor: pointer;
        font-size: 13px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .xdex-feed-option:hover { background: #F0E0D6; }
      .xdex-feed-option.active { background: #e8d5c0; font-weight: bold; }
    `;
    document.head.appendChild(style);
  }

  function getCurrentSubscriptionFeedLabel() {
    const uuid = subscriptionFeedCurrentUuid || '';
    if (!uuid) return '';
    try {
      const feeds = (typeof getFilterConfig === 'function' ? getFilterConfig() : {}).subscriptionFeeds || [];
      const feed = feeds.find((f) => f.uuid === uuid);
      return feed && feed.desc ? feed.desc : uuid;
    } catch (e) {
      return uuid;
    }
  }

  function resolveSubscriptionFeedUuid() {
    const panelSelectedUuid = String($('#sp_feeds_selector').val() || '').trim();
    if (panelSelectedUuid) return panelSelectedUuid;
    const dropdownSelectedUuid = String($('#sp_feeds_selector_dropdown .xdex-feed-option.active').data('uuid') || '').trim();
    if (dropdownSelectedUuid) return dropdownSelectedUuid;
    const uuid = subscriptionFeedCurrentUuid || getActiveSubscriptionFeedUuid() || '';
    if (uuid) return uuid;
    const feeds = (typeof getFilterConfig === 'function' ? getFilterConfig() : {}).subscriptionFeeds || [];
    return feeds.length ? feeds[0].uuid : '';
  }

  function injectSubscriptionExButton(root) {
    ensureSubscriptionExButtonStyle();
    const scope = root || document;
    const containers = scope.querySelectorAll ? scope.querySelectorAll('.h-threads-item[data-threads-id] > .h-threads-item-main') : [];
    containers.forEach((container) => {
      // 找到 No.xxx 链接作为插入锚点（板块页和串内页都有）
      const anchor = container.querySelector('a.h-threads-info-id');
      if (!anchor || anchor.__xdexSubExBound) return;
      anchor.__xdexSubExBound = true;
      const sep = document.createTextNode(' ');
      const span = document.createElement('span');
      span.className = 'h-threads-info-report-btn';
      const a = document.createElement('a');
      a.href = '#';
      a.title = '订阅到当前选中的订阅号';
      a.className = 'xdex-sub-ex-btn';
      a.appendChild(document.createTextNode('订阅'));
      const badge = document.createElement('sub');
      badge.className = 'xdex-sidebar-ex-badge';
      badge.style.cssText = 'color: #66CCFF; font-weight: bold;';
      badge.setAttribute('aria-hidden', 'true');
      badge.textContent = 'EX';
      a.appendChild(badge);
      a.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const tid = String(container.getAttribute('data-threads-id') || anchor.closest('.h-threads-item')?.getAttribute('data-threads-id') || '').trim();
        if (!tid) return;
        const uuid = resolveSubscriptionFeedUuid();
        if (!uuid) {
          toast('请先在设置中添加一个订阅号');
          return;
        }
        const feeds = (typeof getFilterConfig === 'function' ? getFilterConfig() : {}).subscriptionFeeds || [];
        const matchedFeed = feeds.find((f) => String(f.uuid || '').trim() === String(uuid || '').trim());
        const label = matchedFeed && matchedFeed.desc ? matchedFeed.desc : (getCurrentSubscriptionFeedLabel() || uuid);
        if (!window.confirm(`确定要订阅 No.${tid} 到「${label}」吗？`)) return;
        GM_xmlhttpRequest({
          method: 'POST',
          url: `${SUBSCRIPTION_FEED_API_BASE}/addFeed`,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          data: `uuid=${encodeURIComponent(uuid)}&tid=${encodeURIComponent(tid)}`,
          onload: (resp) => {
            if (resp.status >= 200 && resp.status < 300) {
              invalidateSubscriptionFeedSession(uuid, 'add-feed');
              toast(`已订阅 No.${tid} 到「${label}」`);
            } else {
              toast(`订阅失败 (${resp.status})`);
            }
          },
          onerror: () => toast('订阅失败，网络错误')
        });
      });
      span.appendChild(document.createTextNode('['));
      span.appendChild(a);
      span.appendChild(document.createTextNode(']'));
      anchor.before(span, sep);
    });
  }

  /* --------------------------------------------------
   * tag -1. 入口初始化
   * -------------------------------------------------- */
  window.addEventListener('load', () => {
    startupPerfDebug.mark('window.load.start', startupPerfDebug.summarizeRoot(document));
    startupPerfDebug.measure('window.load.enableHDImageAndLayoutFix', () => enableHDImageAndLayoutFix(document), () => startupPerfDebug.summarizeRoot(document));
    startupPerfDebug.mark('window.load.end', startupPerfDebug.summarizeRoot(document));
  });
  installEarlyStartupObserver();
  installEarlyEnhanceIslandAutoTitle();

  $(document).ready(() => {
    startupPerfDebug.mark('document.ready.start', startupPerfDebug.summarizeRoot(document));
    if (isNmbSearchPage()) {
      initNmbSearchMobileThreadRedirector();
      startupPerfDebug.mark('startup.nmbSearchMobileThreadRedirector', startupPerfDebug.summarizeRoot(document));
      return;
    }
    SettingPanel.init();
    const cfg = Object.assign({}, SettingPanel.defaults, GM_getValue(SettingPanel.key, {}));
    disableVerifyInputMemory(document);
    replyQuicklyOnBoardPage();                                      //板块页快速回复模式切换
    if (cfg.enableCookieSwitch)          createCookieSwitcherUI();  //快捷切换饼干
    if (cfg.enablePaginationDuplication) enablePaginationDuplication();     //添加页首页码
    if (cfg.disableWatermark)            disableWatermark();        //关闭图片水印
    if (cfg.updatePreviewCookie)         updatePreviewCookieId();   //预览真实饼干
    if (cfg.hideEmptyTitleEmail) {hideEmptyTitleAndEmail();         //隐藏无名氏/无标题/回复/发串/版规
      Utils.collapse($('.h-forum-header'), '『版规』');
      Utils.collapse($('form[action="/Home/Forum/doReplyThread.html"]'), '『回复』');
      Utils.collapse($('form[action="/Home/Forum/doPostThread.html"]'), '『发串』');
      }                                                              //折叠版规-发串-回复
    //if (cfg.updateReplyNumbers)          updateReplyNumbers();     //添加回复编号
    if (cfg.enableSeamlessPaging)        initSeamlessPaging();       //自动-手动无缝翻页
    bindThreadHistoryLiveSync();
    bindPostHistoryLiveSync();
    if (cfg.enableUpdateCheck) {
      initializeUpdateReminderUI();                                   //检查更新UI状态初始化
      scheduleDailyUpdateCheck();                                     //每日检查更新
    } else {
      updateSettingsButtonBadge(getDefaultUpdateCheckState());
      clearFooterUpdateHighlight();
      if (window.__xdexUpdateCheckTimer) {
        clearTimeout(window.__xdexUpdateCheckTimer);
        window.__xdexUpdateCheckTimer = 0;
      }
    }
    interceptReplyForm();                                            //拦截回复中间页
    enhancePostFormLayout();                                         //发帖UI调整
    if (cfg.toggleSidebar)               toggleSidebar();            //侧边栏收起功能
    renderFavoriteThreadsMenu();                                      //常用串
    if (isThreadHistoryPageActive()) {
      recordCurrentThreadHistory(0, { reason: 'initial-load', countVisit: true });
      installThreadHistoryReactivationTracking(true);
    } else {
      installThreadHistoryReactivationTracking(false);
    }
    startupPerfDebug.mark('document.ready.syncSetup.end', startupPerfDebug.summarizeRoot(document));

    // 保存原始函数
    const _initContent = window.initContent;

    // 将X岛原版https://www.nmbxd1.com/Public/Js/h.desktop.js中作用于引用的initContent函数支持我们新增的非标准引用格式
    window.initContent = function(root) {
        // 先执行原始逻辑
        if (typeof _initContent === 'function') {
            _initContent(root);
        }
        // 再执行扩展逻辑
        if (root) initExtendedContent(root);
    };
    deferStartupSteps([
      { label: 'startup.batch1.enableHDImageAndLayoutFix', run: () => { if (cfg.enableHDImageAndLayoutFix) enableHDImageAndLayoutFix(document); }, meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch1.enableHDImage', run: () => { if (cfg.enableHDImageAndLayoutFix) enableHDImage(document); }, meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch1.applyImageHideMode', run: () => { if (cfg.enableImageHideMode) applyImageHideMode(cfg.applyImageHideMode || 'default', document); }, meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch1.highlightPO', run: () => highlightPO(), meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch1.enablePostExpand', run: () => enablePostExpand(document), meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch1.refreshFilterDisplay', run: () => refreshFilterDisplay(cfg), meta: () => startupPerfDebug.summarizeRoot(document) }
    ], 0, 'batch1-layout-filter-image');

    deferStartupSteps([
      { label: 'startup.batch2.ExternalImagePreview.init', run: () => { if (cfg.enableExternalImagePreview) ExternalImagePreview.init(); }, meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch2.runLinkBlank', run: () => { if (cfg.enableLinkBlank) runLinkBlank(); }, meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch2.runAutoUrlLinkify', run: () => { if (cfg.enableAutoUrlLinkify) runAutoUrlLinkify(); }, meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch2.enableQuotePreview', run: () => { if (cfg.enableQuotePreview) enableQuotePreview(); }, meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch2.replaceRightSidebar', run: () => replaceRightSidebar(), meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch2.extendQuote', run: () => { if (cfg.extendQuote) extendQuote(); }, meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch2.kaomojiEnhancer', run: () => kaomojiEnhancer(), meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch2.initExtendedContent', run: () => initExtendedContent(), meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch2.searchServiceBy4sY', run: () => searchServiceBy4sY(), meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch2.monitorRefView', run: () => monitorRefView(), meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch2.overrideTopImageClick', run: () => overrideTopImageClick(), meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch2.enhanceIsland', run: () => enhanceIsland({ enablePreview: true, enableDraft: true, enableAutoTitle: true, enableRelativeTime: true, timeDisplayMode: cfg.timeDisplayMode, enableQuoteInsert: true, enablePasteImage: true }), meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch2.initContent(document)', run: () => initContent(document), meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch2.installCookieDropdownShortcutHandler', run: () => { if (cfg.enableCookieSwitch) installCookieDropdownShortcutHandler(); }, meta: () => startupPerfDebug.summarizeRoot(document) },
      { label: 'startup.batch2.bindCtrlEnter', run: () => document.querySelectorAll('form textarea[name="content"]').forEach(bindCtrlEnter), meta: () => startupPerfDebug.summarizeRoot(document) }
    ], 50, 'batch2-preview-content');

    // 屏蔽原站点的 initImageBox，改由 enableHDImageAndLayoutFix 负责初始化
    // window.initImageBox = function() {
    //   // 屏蔽原站点的逻辑
    //   console.debug("initImageBox 已被屏蔽，由 enableHDImageAndLayoutFix 接管");
    // };

    // 自动刷新并提示当前饼干，我不知道为什么必须写在这里。
    function autoRefreshCookiesToast() {
      try {
        if (typeof refreshCookies !== 'function') return;
        refreshCookies(() => {
          const list = getCookiesList();
          if (!list || !Object.keys(list).length) return;
          const cur = getCurrentCookie();
          const nm = cur && cur.name ? abbreviateName(cur.name) : '未知';
          if (cfg.enableAutoCookieRefreshToast) {
              toast(`自动刷新成功！当前饼干为 ${nm}`);
                }
        }, false); // ★ 不显示默认toast
      } catch (e) {
        console.warn('自动刷新饼干失败', e);
      }
    }

    // 仅在“从其它标签页切回到本标签页”时刷新
    const TAB_ACTIVE_KEY = 'xdex_active_tab';
    const tabId = Date.now() + '_' + Math.random().toString(36).slice(2);

    try {
      if (document.visibilityState === 'visible') {
        localStorage.setItem(TAB_ACTIVE_KEY, JSON.stringify({ id: tabId, t: Date.now() }));
      }
    } catch {}

    // ✅ 加上开关判断
    if (cfg.enableAutoCookieRefresh) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') return;
          try {
            const last = JSON.parse(localStorage.getItem(TAB_ACTIVE_KEY) || 'null');
            if (last && last.id && last.id !== tabId) {
              autoRefreshCookiesToast();
            }
            localStorage.setItem(TAB_ACTIVE_KEY, JSON.stringify({ id: tabId, t: Date.now() }));
          } catch (e) {
            try {
              localStorage.setItem(TAB_ACTIVE_KEY, JSON.stringify({ id: tabId, t: Date.now() }));
            } catch {}
          }
      }, { passive: true });
    }
    startupPerfDebug.mark('document.ready.end', startupPerfDebug.summarizeRoot(document));

    // 全局：在运行时立即应用“全部展开 / 全部收起”模式
    window.applyPostExpandAllMode = function(enable) {
      const threads = Array.from(document.querySelectorAll('.h-threads-item-index'));
      if (!threads.length) return;

      if (enable) {
        // 全部展开（立即把每个 item 加上 expanded，并把按钮设为 收起）
        threads.forEach(item => {
          const btn = item.querySelector('.h-threads-info .js-toggle-mode');
          if (!item.classList.contains('expanded')) item.classList.add('expanded');
          if (btn) btn.textContent = '收起';
        });
      } else {
        // 全部收起：对每个已展开的串依次调用 collapseWithoutShift，
        // 用 setTimeout 分批执行以给每次补偿留出一帧时间，尽量避免跳动累积。
        let delayIdx = 0;
        threads.forEach(item => {
          if (!item.classList.contains('expanded')) return;
          const d = delayIdx++ * 45; // 45ms 间隔（经验值）
          setTimeout(() => {
            const btn = item.querySelector('.h-threads-info .js-toggle-mode');
            if (btn) btn.textContent = '展开';
            try { collapseWithoutShift(item); } catch (err) { // 防守
              try { item.classList.remove('expanded'); } catch(e){}
            }
          }, d);
        });
      }
    };

  });
  }
  scheduleXDexStartup();

})(jQuery);
