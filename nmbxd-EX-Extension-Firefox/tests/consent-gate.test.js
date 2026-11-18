// 授权（功能门控）：契约测试
// 规则（用户确定）：① 默认**全部授予**；② 未授权时设置**保持原开/关值**、仅灰显、功能不加载；
//                   ③ 点灰态跳授权弹窗对应项（不改状态）；④ 首次进入需授权版本 → 启动弹窗，读完并点「完成」才可关；
//                   ⑤ 授权状态可随导出/导入与 WebDAV 迁移（以传入值为准）。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

function extractFn(name) {
  const anchor = 'function ' + name + '(';
  let start = src.indexOf(anchor);
  assert(start !== -1, name + ' 必须存在');
  if (src.slice(Math.max(0, start - 6), start) === 'async ') start -= 6;
  const po = src.indexOf('(', start);
  let pd = 0, pc = -1;
  for (let i = po; i < src.length; i++) { if (src[i] === '(') pd++; else if (src[i] === ')') { pd--; if (pd === 0) { pc = i; break; } } }
  const bo = src.indexOf('{', pc); let d = 0;
  for (let i = bo; i < src.length; i++) { if (src[i] === '{') d++; else if (src[i] === '}') { d--; if (d === 0) return src.slice(start, i + 1); } }
  throw new Error('unbalanced ' + name);
}
// 取 `const NAME = [ ... ];`（按方括号配平，避免正则截断）
function extractConstArray(name) {
  const anchor = 'const ' + name + ' = [';
  const start = src.indexOf(anchor);
  assert(start !== -1, name + ' 必须存在');
  let d = 0;
  for (let i = src.indexOf('[', start); i < src.length; i++) {
    if (src[i] === '[') d++;
    else if (src[i] === ']') { d--; if (d === 0) return src.slice(start, i + 1) + ';'; }
  }
  throw new Error('unbalanced array ' + name);
}

const PIECES = [
  extractConstArray('XDEX_CONSENT_FEATURES'),
  'getConsentState', 'saveConsentState', 'hasConsent', 'setConsentGranted',
  'isConsentTermsRead', 'markConsentTermsRead', 'applyImportedConsent',
  'getEarlyStartupConfig', 'isUpdateCheckEnabled'
].map(s => (s.startsWith('const ') ? s : extractFn(s))).join('\n');

function makeSandbox(opts) {
  const o = opts || {};
  const store = {};
  const sandbox = {
    console: { log: () => {}, warn: () => {} },
    GM_getValue: (k, d) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : d),
    GM_setValue: (k, v) => { store[k] = v; },
    SettingPanel: { key: 'myScriptSettings', defaults: Object.assign({
      enableUpdateCheck: true, enableExternalImagePreview: true, searchServiceBy4sY: true
    }, o.defaults || {}) }
  };
  sandbox.__store = store;
  const ctx = vm.createContext(sandbox);
  vm.runInContext("const XDEX_CONSENT_KEY = 'xdex_consent';\nconst XDEX_CONSENT_TERMS_VERSION = 1;\n" + PIECES + '\n', ctx);
  return sandbox;
}

const IDS = ['updateCheck', 'externalImage', 'searchService', 'webdavSync'];

// ─────────── ① 默认全部授予 ───────────
test('默认全部授予（缺省即授权）', () => {
  const sb = makeSandbox();
  IDS.forEach(id => assert(sb.hasConsent(id) === true, id + ' 缺省应为已授权'));
  assert(sb.isConsentTermsRead() === false, '未读过条款时 readVersion 应为 0');
  assert(sb.__store['xdex_consent'] === undefined, '默认不应写入任何存储');
});

// ─────────── ② 撤销后不生效，但设置值不变 ───────────
test('撤销 updateCheck → 生效层关闭该功能，且不动设置值', () => {
  const sb = makeSandbox();
  const before = sb.getEarlyStartupConfig();
  assert(before.enableUpdateCheck === true, '已授权时应按设置值生效');
  sb.setConsentGranted('updateCheck', false);
  assert(sb.hasConsent('updateCheck') === false, '撤销后 hasConsent 应为 false');
  const after = sb.getEarlyStartupConfig();
  assert(after.enableUpdateCheck === false, '未授权 → 生效配置必须为 false');
  assert(after.enableExternalImagePreview === true, '不得牵连其它功能');
  const raw = sb.__store[SettingPanelKey()];
  assert(raw === undefined, '授权撤销不得改动设置存储（设置值保持原样）');
  assert(sb.isUpdateCheckEnabled() === false, 'isUpdateCheckEnabled 也必须为 false');
  function SettingPanelKey() { return 'myScriptSettings'; }
});

test('外部图床与搜索酱同样受门控', () => {
  const sb = makeSandbox();
  sb.setConsentGranted('externalImage', false);
  sb.setConsentGranted('searchService', false);
  const cfg = sb.getEarlyStartupConfig();
  assert(cfg.enableExternalImagePreview === false, '外部图床未授权 → 不加载');
  assert(cfg.searchServiceBy4sY === false, '搜索酱未授权 → 不替换搜索入口');
  assert(cfg.enableUpdateCheck === true, '未撤销的项不受影响');
});

test('重新授权 → 按原设置值恢复（无需用户再开一次）', () => {
  const sb = makeSandbox();
  sb.setConsentGranted('externalImage', false);
  assert(sb.getEarlyStartupConfig().enableExternalImagePreview === false, '先确认已关闭');
  sb.setConsentGranted('externalImage', true);
  assert(sb.getEarlyStartupConfig().enableExternalImagePreview === true, '恢复授权后应按原设置值生效');
});

// ─────────── ③ 阅读标记 ───────────
test('读完条款后置标记，此后不再主动弹', () => {
  const sb = makeSandbox();
  assert(sb.isConsentTermsRead() === false, '初始未读');
  sb.markConsentTermsRead();
  assert(sb.isConsentTermsRead() === true, '标记后应视为已读');
  assert(Number(sb.__store['xdex_consent'].readVersion) === 1, 'readVersion 应记录条款版本');
});

// ─────────── ④ 导入/同步携带（以传入值为准） ───────────
test('导入授权状态：覆盖已知四项、忽略未知项、抬升 readVersion', () => {
  const sb = makeSandbox();
  const ok = sb.applyImportedConsent({ granted: { updateCheck: false, webdavSync: false, evil: false }, readVersion: 1 });
  assert(ok === true, '应接受合法输入');
  assert(sb.hasConsent('updateCheck') === false && sb.hasConsent('webdavSync') === false, '导入值应覆盖本机');
  assert(sb.hasConsent('externalImage') === true, '未提及的项保持本机值');
  assert(sb.isConsentTermsRead() === true, 'readVersion 应被抬升');
  assert(sb.applyImportedConsent(null) === false, '空值应被拒绝');
  assert(sb.applyImportedConsent('x') === false, '非对象应被拒绝');
  assert(sb.applyImportedConsent({ readVersion: 9 }) === false, '没有 granted 分区应被拒绝');
});

// ─────────── ⑤ 接线守卫（防止后续重构漏挂） ───────────
test('接线守卫：四个受控项、启动步骤、面板入口、灰态样式、灰态不改状态', () => {
  ['sp_enableUpdateCheck', 'sp_enableExternalImagePreview', 'sp_searchServiceBy4sY', 'sp_webdavAutoSync'].forEach((id) => {
    assert(src.includes("control: '" + id + "'"), '受控项清单应包含 ' + id);
  });
  assert(/startup\.batch1\.consent/.test(src), '启动批次必须包含授权步骤（首启弹窗）');
  assert(/if \(!isConsentTermsRead\(\)\) openConsentModal\(null\)/.test(src), '首启未读时必须在启动阶段弹窗');
  assert(/id="btn_xdex_consent"/.test(src), '面板必须有「授权」入口');
  assert(/\.xdex-switch\.is-unauthorized/.test(src), '必须有未授权灰态样式');
  const apply = extractFn('applyConsentGateStyles');
  assert(!/\.checked\s*=/.test(apply), '套用灰态**不得**改动控件的 checked 状态（只改外观）');
  const guard = extractFn('bindConsentGuards');
  assert(!/\.checked\s*=/.test(guard), '点击守卫也不得改动 checked 状态');
  assert(/openConsentModal\(f\.id\)/.test(guard), '未授权的项点击应跳转到授权弹窗对应项');
  // 载荷携带（导出/导入/WebDAV 一并迁移）
  assert(/payload\.xdexConsent = getConsentState\(\)/.test(src), '全量导出载荷必须携带授权状态');
  assert(/if \(payload\.xdexConsent\) applyImportedConsent\(payload\.xdexConsent\)/.test(src), '文件导入必须应用授权状态');
  assert(/parsed\.data\.payload\.xdexConsent\) applyImportedConsent\(/.test(src), 'WebDAV 远端必须应用授权状态');
  // 即时生效 + 跨页同步
  assert(/function applyConsentEffects/.test(src), '必须有授权变更的即时生效分发');
  assert(/function bindConsentCrossPageSync/.test(src) && /GM_addValueChangeListener\(XDEX_CONSENT_KEY/.test(src), '必须有跨页授权变更监听');
  assert(/if \(before !== sw\.checked\) applyConsentEffects\(f\.id\)/.test(src), '弹窗内改动应只对被改动项即时生效');
  assert(/function restoreSearchServiceButton/.test(src), '撤销搜索酱授权必须能还原官方按钮');
  assert(/typeof hasConsent === 'function' && !hasConsent\('externalImage'\)\) return document\.createDocumentFragment\(\)/.test(src), '外部图床必须在取图前按授权闸门');
  assert(/scheduleNextUpdateCheckTimer\(getUpdateCheckState\(\)\)/.test(src), '撤销检查更新授权时必须清掉计时器');
  // 条款里的三条原文引用必须是原生引用格式，才能触发原生预览与拓展引用
  ['69730537', '69730629', '69750713'].forEach((n) => {
    assert(src.includes('<font color="#789922">&gt;&gt;No.' + n + '</font>'), '条款应以内联原生引用格式含 >>No.' + n);
  });
  // 弹窗层级必须低于引用浮窗（10004），否则引用内容会被弹窗挡住
  assert(/z-index:10003/.test(src), '授权弹窗 z-index 必须为 10003（低于 .qp-overlay-quote 的 10004）');
});

// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass += 1; console.log('  ok  ' + name); }
    catch (err) { console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err)); process.exitCode = 1; }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  console.log(process.exitCode ? 'consent gate contract FAILED' : 'consent gate contract ok');
})();
