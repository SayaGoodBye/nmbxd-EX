(function () {
  'use strict';

  const STORAGE_KEY = 'xdex-Extension:myScriptSettings';

  const DEFAULT_SETTINGS = Object.freeze({
    enableCookieSwitch: true,
    disableWatermark: true,
    enablePaginationDuplication: true,
    updatePreviewCookie: true,
    hideEmptyTitleEmail: true,
    enableExternalImagePreview: true,
    enableAutoCookieRefresh: true,
    enableAutoCookieRefreshToast: false,
    interceptReplyFormUnvcode: true,
    interceptReplyFormU200B: true,
    interceptReplyFormAutoCompress: true,
    enableSeamlessPaging: true,
    enableAutoSeamlessPaging: true,
    enableHDImageAndLayoutFix: true,
    enableLinkBlank: true,
    enableAutoUrlLinkify: true,
    enableQuotePreview: true,
    enableUpdateCheck: true,
    enableImageContextMenu: true,
    enableImageHideMode: true,
    applyImageHideMode: 'default',
    enableDraft: true,
    timeDisplayMode: 'relative',
    extendQuote: true,
    enablePostExpandAll: true,
    kaomojiSort: 'default',
    toggleSidebar: false,
    threadCookieWhitelistGroups: [],
    threadCookieWhitelistDisplayMode: 'fold',
    poAnnotationSideDisplayMode: 'collapse',
    replyModeDefault: '回复',
    replyExtraDefault: '临时',
    markedGroups: [],
    blockedCookies: [],
    blockedKeywords: '',
    favoriteThreads: [],
    blockDisplayMode: 'hide'
  });

  const ENUM_OPTIONS = Object.freeze({
    applyImageHideMode: ['default', 'blur', 'noimage', 'tips'],
    kaomojiSort: ['default', 'freq', 'recent'],
    threadCookieWhitelistDisplayMode: ['fold', 'hide', 'column'],
    poAnnotationSideDisplayMode: ['collapse', 'expand'],
    timeDisplayMode: ['relative', 'exact'],
    replyModeDefault: ['发串', '回复'],
    replyExtraDefault: ['临时', '连续'],
    blockDisplayMode: ['fold', 'hide']
  });

  const SETTING_GROUPS = Object.freeze([
    {
      id: 'basic',
      title: '基础体验',
      description: '站点常用增强、更新检查与侧边栏行为。',
      fields: [
        'enableCookieSwitch',
        'disableWatermark',
        'updatePreviewCookie',
        'hideEmptyTitleEmail',
        'enableExternalImagePreview',
        'enableAutoCookieRefresh',
        'enableAutoCookieRefreshToast',
        'enableUpdateCheck',
        'toggleSidebar'
      ]
    },
    {
      id: 'pagingAndLayout',
      title: '翻页与版面',
      description: '页码、无缝翻页、高清图布局与链接打开方式。',
      fields: [
        'enablePaginationDuplication',
        'enableSeamlessPaging',
        'enableAutoSeamlessPaging',
        'enableHDImageAndLayoutFix',
        'enableLinkBlank',
        'enableAutoUrlLinkify',
        'enableQuotePreview'
      ]
    },
    {
      id: 'replyAndPost',
      title: '回复与发串',
      description: '回复中间页拦截、默认模式、草稿和长串展开。',
      fields: [
        'interceptReplyFormUnvcode',
        'interceptReplyFormU200B',
        'interceptReplyFormAutoCompress',
        'replyModeDefault',
        'replyExtraDefault',
        'enableDraft',
        'timeDisplayMode',
        'extendQuote',
        'enablePostExpandAll'
      ]
    },
    {
      id: 'image',
      title: '图片',
      description: '图片右键菜单与隐藏模式。enableImageHideMode 会始终保持启用。',
      fields: [
        'enableImageContextMenu',
        'enableImageHideMode',
        'applyImageHideMode'
      ]
    },
    {
      id: 'filters',
      title: '标记与屏蔽',
      description: 'Po 主标记、饼干屏蔽、关键词屏蔽及显示方式。',
      fields: [
        'markedGroups',
        'blockedCookies',
        'blockedKeywords',
        'favoriteThreads',
        'blockDisplayMode'
      ]
    },
    {
      id: 'threadWhitelist',
      title: '只看饼干',
      description: '按串号和饼干组控制只看范围。',
      fields: [
        'threadCookieWhitelistGroups',
        'threadCookieWhitelistDisplayMode',
        'poAnnotationSideDisplayMode'
      ]
    },
    {
      id: 'kaomoji',
      title: '颜文字',
      description: '颜文字排序策略。',
      fields: [
        'kaomojiSort'
      ]
    }
  ]);

  const FIELD_LABELS = Object.freeze({
    enableCookieSwitch: '快捷切换饼干',
    disableWatermark: '关闭图片水印',
    enablePaginationDuplication: '添加页首页码',
    updatePreviewCookie: '预览真实饼干',
    hideEmptyTitleEmail: '隐藏无标题/无名氏/版规',
    enableExternalImagePreview: '显示外部图床',
    enableAutoCookieRefresh: '自动刷新饼干',
    enableAutoCookieRefreshToast: '显示自动刷新提示',
    interceptReplyFormUnvcode: '拦截 unvcode 回复中间页',
    interceptReplyFormU200B: '拦截 U+200B 回复中间页',
    interceptReplyFormAutoCompress: '回复图片自动压缩',
    enableSeamlessPaging: '无缝翻页',
    enableAutoSeamlessPaging: '自动无缝翻页',
    enableHDImageAndLayoutFix: '默认原图与布局修正',
    enableLinkBlank: '串页新标签打开',
    enableAutoUrlLinkify: '自动识别链接',
    enableQuotePreview: '优化引用弹窗',
    enableUpdateCheck: '启用更新检查',
    enableImageContextMenu: '图片右键菜单',
    enableImageHideMode: '图片隐藏模式总开关',
    applyImageHideMode: '图片隐藏模式',
    enableDraft: '启用草稿',
    timeDisplayMode: '时间显示模式',
    extendQuote: '拓展引用格式',
    enablePostExpandAll: '默认展开板块页长串',
    kaomojiSort: '颜文字排序',
    toggleSidebar: '收起侧边栏',
    threadCookieWhitelistGroups: '只看饼干分组',
    threadCookieWhitelistDisplayMode: '只看饼干显示方式',
    poAnnotationSideDisplayMode: 'Po 主批注侧栏',
    replyModeDefault: '板块页默认模式',
    replyExtraDefault: '默认额外模式',
    markedGroups: '标记 Po 主分组',
    blockedCookies: '屏蔽饼干',
    blockedKeywords: '屏蔽关键词',
    favoriteThreads: '常用串',
    blockDisplayMode: '屏蔽显示方式'
  });

  const FIELD_DESCRIPTIONS = Object.freeze({
    enableImageHideMode: '该项由迁移原型固定为开启，保存时会被 normalizeSettings 强制为 true。',
    threadCookieWhitelistGroups: 'JSON 数组。保持与原设置面板导入导出结构一致。',
    markedGroups: 'JSON 数组。保持与原设置面板导入导出结构一致。',
    blockedCookies: 'JSON 数组。保持与原设置面板导入导出结构一致。',
    blockedKeywords: '普通字符串，可输入多行关键词文本。',
    favoriteThreads: 'JSON 数组。每组包含 desc 和 threadId；保存后 threadId 为 8 位数字。',
    timeDisplayMode: 'relative 显示相对时间；exact 显示精确时间。'
  });

  function cloneDefaultSettings() {
    return cloneValue(DEFAULT_SETTINGS);
  }

  function normalizeSettings(input) {
    const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const normalized = {};

    Object.keys(DEFAULT_SETTINGS).forEach((key) => {
      normalized[key] = normalizeValue(key, source[key], DEFAULT_SETTINGS[key]);
    });

    normalized.enableImageHideMode = true;
    return normalized;
  }

  function normalizeValue(key, value, defaultValue) {
    if (Array.isArray(defaultValue)) {
      return Array.isArray(value) ? cloneValue(value) : cloneValue(defaultValue);
    }

    if (Object.prototype.hasOwnProperty.call(ENUM_OPTIONS, key)) {
      return ENUM_OPTIONS[key].includes(value) ? value : defaultValue;
    }

    if (typeof defaultValue === 'boolean') {
      return coerceBoolean(value, defaultValue);
    }

    if (typeof defaultValue === 'string') {
      return typeof value === 'string' ? value : defaultValue;
    }

    return typeof value === 'undefined' ? cloneValue(defaultValue) : cloneValue(value);
  }

  function coerceBoolean(value, defaultValue) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const text = value.trim().toLowerCase();
      if (text === 'true' || text === '1') return true;
      if (text === 'false' || text === '0') return false;
    }
    return typeof value === 'undefined' ? defaultValue : Boolean(value);
  }

  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  globalThis.XdexSettingsSchema = Object.freeze({
    DEFAULT_SETTINGS,
    SETTING_GROUPS,
    ENUM_OPTIONS,
    STORAGE_KEY,
    FIELD_LABELS,
    FIELD_DESCRIPTIONS,
    normalizeSettings,
    cloneDefaultSettings
  });
})();
