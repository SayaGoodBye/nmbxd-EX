// 深色模式：UID 红名保色契约
//   背景：引用浮窗/发串预览里的 `.h-threads-info *`、`.h-threads-content *` 通配规则把文字统一压成
//   灰/白（`!important`），而站点用 <font color="red"> 标注红名（`ID:<font color="red">名字</font>`），
//   于是红名在深色下变灰。现在为 UID 红名补了"保色例外"（绿色引用早有同类例外）。
//   本用例固定三件事：
//     1. 三处通配灰化规则（.qp-overlay-quote / .qp-body / .h-preview-box）都各有一条红名例外；
//     2. 例外的 CSS 特异性 ≥ 通配规则（否则写了也赢不了层叠）；
//     3. 例外同时覆盖 `color="red"`（含大小写）与 `color="#ff0000"`，且不误伤普通名与正文。
// 运行：node tests/dark-theme-uid-red.test.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const EXT_ROOT = path.join(__dirname, '..');
const SOURCE_PATH = path.join(EXT_ROOT, 'src', 'content', 'nmbxd-EX-for-edit.user.js');
const source = fs.readFileSync(SOURCE_PATH, 'utf8').replace(/\r\n/g, '\n');

// 取出改动的三处样式块（早期静态块 + 主深色主题列表），只在其中检索，避免误命中无关同名选择器
const EARLY_BLOCK_START = source.indexOf(':root.xdex-custom-dark .qp-overlay-quote .h-threads-info');
assert(EARLY_BLOCK_START !== -1, '必须存在引用浮窗的深色通配规则');
const EARLY_BLOCK = source.slice(EARLY_BLOCK_START, EARLY_BLOCK_START + 4000);

const THEME_ANCHOR = 'html.xdex-custom-dark, html.xdex-custom-dark body';
const THEME_ANCHOR_INDEX = source.indexOf(THEME_ANCHOR);
assert(THEME_ANCHOR_INDEX !== -1, '必须存在主深色主题样式数组');
// 取到该数组结束（anchor 之后 `.h-preview-box` 条目距此约 6.7KB，`const out` 约 17.7KB）
const THEME_BLOCK = source.slice(THEME_ANCHOR_INDEX, THEME_ANCHOR_INDEX + 20000);

// 极简 CSS 特异性计数（只覆盖本仓用到的形态：元素/类/属性/伪类，忽略 `:root` 之外的伪元素）
function specificity(selector) {
  const s = selector.trim();
  const ids = (s.match(/#[\w-]+/g) || []).length;
  const classes = (s.match(/\.[\w-]+/g) || []).length;
  const attrs = (s.match(/\[[^\]]+\]/g) || []).length;
  const pseudos = (s.match(/:(?!root\b)[\w-]+(\([^)]*\))?/g) || []).length;
  const stripped = s
    .replace(/#[\w-]+/g, ' ')
    .replace(/\.[\w-]+/g, ' ')
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/:[^\s>+~(]*/g, ' ')
    .replace(/[>+~,]/g, ' ');
  const elements = stripped.split(/\s+/).filter((t) => /^[a-zA-Z][\w-]*$/.test(t)).length;
  return [ids, classes + attrs + pseudos, elements];
}
function specificityGte(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return true; // 相等：靠文档顺序（例外都写在通配规则之后）
}

const CASES = [
  { name: '引用浮窗 .qp-overlay-quote', scope: '.qp-overlay-quote', color: '#e85248' },
  { name: '旧引用视图 .qp-body', scope: '.qp-body', color: "D('#cc1105')" },
  { name: '发串预览 .h-preview-box', scope: '.h-preview-box', color: "D('#cc1105')" }
];

function exceptionSelector(scope) {
  return `:root.xdex-custom-dark ${scope} .h-threads-info-uid font[color="red" i]`;
}
function wildcardSelector(scope) {
  return `:root.xdex-custom-dark ${scope} .h-threads-info *`;
}

function testEachScopeHasException() {
  CASES.forEach(({ name, scope, color }) => {
    const haystack = scope === '.qp-overlay-quote' ? EARLY_BLOCK : THEME_BLOCK;
    assert(haystack.includes(exceptionSelector(scope)), `${name}: 必须有 UID 红名例外规则`);
    assert(haystack.includes(`font[color="#ff0000" i]`), `${name}: 例外需同时覆盖 hex 形式 #ff0000`);
    assert(haystack.includes(color), `${name}: 例外颜色应为 ${color}（与该块的标题红保持一致）`);
  });
}

function testExceptionBeatsWildcard() {
  CASES.forEach(({ name, scope }) => {
    const ex = specificity(exceptionSelector(scope));
    const wc = specificity(wildcardSelector(scope));
    assert(specificityGte(ex, wc), `${name}: 例外特异性 ${ex.join('.')} 必须 ≥ 通配 ${wc.join('.')}`);
  });
}

function testWildcardStillExists() {
  // 例外存在的**前提**是那些通配灰化规则还在；若通配被删掉，本用例应提醒同步清理例外
  const wildcards = [
    [EARLY_BLOCK, '.qp-overlay-quote', '#d9d0d0'],
    [THEME_BLOCK, '.qp-body', "F('#800000')"],
    [THEME_BLOCK, '.h-preview-box', "F('#800000')"]
  ];
  wildcards.forEach(([haystack, scope, color]) => {
    assert(haystack.includes(wildcardSelector(scope)), `${scope}: 通配灰化规则仍在（例外因此仍然必要）`);
    assert(haystack.includes(color), `${scope}: 通配灰化的目标色为 ${color}`);
  });
}

function testScopeIsUidOnly() {
  // 例外只作用于 UID：正文里的红字/其它彩色仍按原设计灰化，绿引用仍走各自的既有例外
  CASES.forEach(({ scope }) => {
    const haystack = scope === '.qp-overlay-quote' ? EARLY_BLOCK : THEME_BLOCK;
    const rule = haystack.match(new RegExp(`[^']*${scope.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\.h-threads-info-uid font\\[color="red" i\\][^']*`));
    assert(rule, `${scope}: 应能定位到例外规则文本`);
    assert(!/h-threads-content/.test(rule[0]), `${scope}: 例外不得扩展到 .h-threads-content（正文彩色仍灰化）`);
  });
  assert(EARLY_BLOCK.includes('font[color="#789922"]{color:#b5d06d !important;}'), '绿色引用的既有例外必须保留');
  assert(THEME_BLOCK.includes("font[color=\"#789922\"] { color: ' + D('#789922') + ' !important; }"), '主主题里绿色引用例外必须保留');
}

const tests = [testEachScopeHasException, testExceptionBeatsWildcard, testWildcardStillExists, testScopeIsUidOnly];

let failed = 0;
tests.forEach((fn) => {
  try {
    fn();
    console.log(`  PASS ${fn.name}`);
  } catch (err) {
    failed += 1;
    console.error(`  FAIL ${fn.name}\n       ${(err && err.message) || err}`);
  }
});
if (failed) {
  console.error(`${failed} / ${tests.length} 项失败`);
  process.exit(1);
}
console.log('dark theme uid red contract ok');
