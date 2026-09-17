// 预览编号不参与引用追记 / 自动引用放行
// 对应问题：EX 发言预览的 a.h-threads-info-id 需携带 href（避免站点脚本 attr('href').replace 抛错），
// 但引用追记与 extractQuoteIdFromClickTarget 必须按 .h-preview-box 祖先排除预览，不得依赖 href 推断。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// 构造一个带 closest 的假锚元素：识别预览祖先查询与编号链接查询
function makeAnchor(href, insidePreview) {
  const a = {
    getAttribute: (k) => (k === 'href' ? href : null),
    textContent: 'No.123',
  };
  a.closest = (sel) => {
    if (sel === '.h-preview-box') return insidePreview ? {} : null;
    if (String(sel).indexOf('h-threads-info-id') !== -1) return a;
    return null;
  };
  return a;
}

// 提取 function 声明的平衡函数体
function extractBalancedFn(name) {
  const start = source.indexOf(`function ${name}`);
  assert(start !== -1, `${name} must exist`);
  const braceOpen = source.indexOf('{', start);
  let depth = 0, end = -1;
  for (let i = braceOpen; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  return source.slice(start, end + 1);
}

// ─────────────── 引用追记过滤 ───────────────
test('引用追记: 预览内编号被排除，预览外正常追记（且不依赖 href）', () => {
  const fnSrc = extractBalancedFn('注册追记引用串号');
  const clicks = [];
  const textareaVal = { v: 'draft' };
  const sandbox = {
    cfg: { enableQuoteInsert: true },
    $: () => ({ on: (ev, sel, cb) => clicks.push(cb) }),
    正文框: {
      0: { focus() {}, setSelectionRange() {}, dispatchEvent() {} },
      length: 1,
      prop: () => 5,
      trigger: () => {},
      val: (nv) => { if (nv !== undefined) textareaVal.v = nv; return textareaVal.v; },
    },
    document: { activeElement: null },
    setTimeout: (fn) => fn(),
    Event: function () {},
    console: { log: () => {} },
    保存编辑: () => {},
  };
  vm.createContext(sandbox);
  vm.runInNewContext(fnSrc + '\nthis.注册 = 注册追记引用串号;', sandbox, { filename: 'quote.js' });
  sandbox.注册();

  const mkEvent = (href, insidePreview) => ({ ctrlKey: false, metaKey: false, shiftKey: false, preventDefault: () => {}, stopPropagation: () => {}, currentTarget: makeAnchor(href, insidePreview) });
  const ta = sandbox.正文框;

  // 预览内、带 href="javascript:;" 的编号：不得插入
  ta.val('draft');
  clicks[0](mkEvent('javascript:;', true));
  assert(ta.val() === 'draft', `预览内编号不得插入引用, got ${JSON.stringify(ta.val())}`);

  // 预览外真实编号：正常插入
  ta.val('draft');
  clicks[0](mkEvent('/t/123?r=123', false));
  assert(ta.val().includes('>>No.123'), `预览外编号应正常追记, got ${JSON.stringify(ta.val())}`);
});

// ─────────────── 自动引用放行标记 ───────────────
test('extractQuoteIdFromClickTarget: 预览内编号不返回 rid（不设 2 秒放行标记）', () => {
  const fnSrc = extractBalancedFn('extractQuoteIdFromClickTarget');
  const sandbox = { URL, location: { origin: 'https://www.nmbxd1.com' }, String };
  vm.createContext(sandbox);
  vm.runInNewContext(fnSrc + '\nthis.f = extractQuoteIdFromClickTarget;', sandbox, { filename: 'exq.js' });

  assert(sandbox.f(makeAnchor('', true)) === '', '预览内编号不应提取 rid');
  assert(sandbox.f(makeAnchor('/t/123?r=123', false)) === '123', '预览外链接应正常提取 rid');
});

// ─────────────── 站点兼容：预览编号必须携带 href ───────────────
test('预览模板编号必须带 href（避免站点 attr(href).replace 抛错）', () => {
  const m = source.match(/<a class="h-threads-info-id" href="([^"]*)"/);
  assert(m, '预览模板编号必须带 href 属性');
  assert(m[1] === 'javascript:;', `href 应为 javascript:;, got ${m[1]}`);
});

// ─────────────── 旧 helper 应已移除 ───────────────
test('isPreviewPlaceholderInfoId 不再存在（避免误导性 href 推断）', () => {
  assert(source.indexOf('function isPreviewPlaceholderInfoId') === -1, '旧 helper 应已删除');
});

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (e) { failed++; console.error(`FAIL - ${name}: ${e.message}`); }
}
if (failed) { console.error(`${failed} test(s) failed`); process.exit(1); }
console.log('preview-quote-exclusion contract ok');
