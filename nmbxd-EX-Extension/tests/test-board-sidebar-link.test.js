// 测试板块侧边栏入口契约：位置（三百人委员会下方）、链接、样式一致、幂等、容错
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');
function assert(condition, message) { if (!condition) throw new Error(message); }

// ── 最小 DOM 桩（支持 :scope >、tag.class、[attr] 选择器） ──
function makeEl(tag, cls, text) {
  return {
    tagName: tag.toUpperCase(), className: cls || '', _text: text || '', children: [], parent: null,
    _attrs: {}, _href: '',
    set href(v) { this._href = v; }, get href() { return this._href; },
    set textContent(v) { this._text = String(v); this.children = []; }, get textContent() { return this._text; },
    appendChild(c) { c.parent = this; this.children.push(c); return c; },
    insertBefore(c, ref) { c.parent = this; const i = ref ? this.children.indexOf(ref) : -1; if (i >= 0) this.children.splice(i, 0, c); else this.children.push(c); return c; },
    setAttribute(k, v) { this._attrs[k] = v; }, getAttribute(k) { return this._attrs[k]; },
    querySelector(sel) { return this.querySelectorAll(sel)[0] || null; },
    querySelectorAll(sel) { const out = []; const walk = (n) => { for (const c of n.children) { if (match(c, sel)) out.push(c); walk(c); } }; walk(this); return out; },
    get nextSibling() { if (!this.parent) return null; const i = this.parent.children.indexOf(this); return this.parent.children[i + 1] || null; },
  };
}
function match(n, sel) {
  return sel.split(',').map(x => x.trim()).some(p => {
    p = p.replace(/^:scope\s*>\s*/, '');
    const attr = p.match(/^([a-z-]+)?\[([\w-]+)\]$/i);
    if (attr) { if (attr[1] && n.tagName.toLowerCase() !== attr[1].toLowerCase()) return false; return n._attrs[attr[2]] !== undefined; }
    const m = p.match(/^([a-z-]+)?(?:\.([\w-]+))?$/i);
    if (!m) return false;
    if (m[1] && n.tagName.toLowerCase() !== m[1].toLowerCase()) return false;
    if (m[2] && !n.className.split(/\s+/).includes(m[2])) return false;
    return true;
  });
}

function buildSidebar({ withAdmin = true } = {}) {
  const menu = makeEl('ul', 'uk-nav uk-nav-parent-icon'); menu.id = 'h-menu-content';
  if (withAdmin) {
    const groupLi = makeEl('li', 'uk-parent uk-open');
    groupLi.appendChild(makeEl('a', 'h-nav-parent-header', '管理'));
    const wrap = makeEl('div', '');
    const sub = makeEl('ul', 'uk-nav-sub');
    [['值班室', '/f/%E5%80%BC%E7%8F%AD%E5%AE%A4'], ['技术支持', '/f/%E6%8A%80%E6%9C%AF%E6%94%AF%E6%8C%81'],
     ['版务', '/f/%E7%89%88%E5%8A%A1'], ['三百人委员会', '/f/%E7%99%BE%E8%84%91%E6%B1%87']].forEach(([name, href]) => {
      const li = makeEl('li', ''); const a = makeEl('a', '', name); a.href = href; li.appendChild(a); sub.appendChild(li);
    });
    wrap.appendChild(sub); groupLi.appendChild(wrap); menu.appendChild(groupLi);
  }
  return { menu, sub: withAdmin ? menu.children[0].children[1].children[0] : null };
}

// tag 30 模块：从注释头到 tag -1 之间提取（独立模块，已不再挂在 PageType 上）
function loadTag30(menu) {
  const s0 = src.indexOf('tag 30. 测试板块增强');
  const s1 = src.indexOf('tag -1. 入口初始化');
  assert(s0 !== -1 && s1 !== -1, 'tag 30 block must exist between tag 29 and tag -1');
  const block = src.slice(src.lastIndexOf('/*', s0), src.lastIndexOf('/*', s1));
  const sb = {
    document: { getElementById: (id) => (id === 'h-menu-content' ? menu : null), querySelector: () => null, createElement: (t) => makeEl(t, ''), body: makeEl('body', '') },
    MutationObserver: class { observe() {} },
    ensureTestBoardSidebarLink: null, installTestBoardSidebarLinkObserver: null,
  };
  sb.globalThis = sb;
  vm.createContext(sb);
  vm.runInNewContext(block + '\nthis.ensureTestBoardSidebarLink = ensureTestBoardSidebarLink; this.installTestBoardSidebarLinkObserver = installTestBoardSidebarLinkObserver;', sb, { filename: 'tag30.js' });
  return sb;
}

function testLinkInsertedAfterCommittee() {
  const { menu, sub } = buildSidebar();
  const mod = loadTag30(menu);
  assert(mod.ensureTestBoardSidebarLink() === true, 'helper must report success');
  const names = sub.children.map(li => li.children[0] && li.children[0]._text);
  const idx = names.indexOf('测试');
  assert(idx !== -1, `测试 link must be inserted, got ${JSON.stringify(names)}`);
  assert(names[idx - 1] === '三百人委员会', `测试 must sit directly after 三百人委员会, got ${JSON.stringify(names)}`);
}

function testLinkUrlAndStyle() {
  const { menu } = buildSidebar();
  const mod = loadTag30(menu);
  mod.ensureTestBoardSidebarLink();
  const link = menu.querySelector('a[data-xdex-test-board-link]');
  assert(link, 'link must carry the idempotence marker');
  assert(link.href === 'https://www.nmbxd1.com/f/%E6%B5%8B%E8%AF%95', `href must be the test board URL, got ${link.href}`);
  assert(link._text === '测试', `label must be 测试, got ${link._text}`);
  // 样式与其他链接一致：li 与 a 均不带额外 class
  assert(link.parent.className === '', 'li must not add classes (parity with sibling links)');
  assert(link.className === '', 'anchor must not add classes (parity with sibling links)');
}

function testIdempotent() {
  const { menu, sub } = buildSidebar();
  const mod = loadTag30(menu);
  mod.ensureTestBoardSidebarLink();
  const before = sub.children.length;
  assert(mod.ensureTestBoardSidebarLink() === true, 'second call must still report success');
  assert(sub.children.length === before, 'second call must not insert a duplicate');
  assert(menu.querySelectorAll('a[data-xdex-test-board-link]').length === 1, 'exactly one link must exist');
}

function testGracefulWhenAdminMissing() {
  const { menu } = buildSidebar({ withAdmin: false });
  const mod = loadTag30(menu);
  assert(mod.ensureTestBoardSidebarLink() === false, 'missing 管理 group must return false, not throw');
}

function testWiredIntoRenderPipeline() {
  // 1) tag 30 必须位于 tag 29 与 tag -1 之间
  const i29 = src.indexOf('tag 29. WebDAV');
  const i30 = src.indexOf('tag 30. 测试板块增强');
  const iMinus1 = src.indexOf('tag -1. 入口初始化');
  assert(i29 !== -1 && i30 !== -1 && iMinus1 !== -1, 'tag markers must all exist');
  assert(i29 < i30 && i30 < iMinus1, 'tag 30 must sit between tag 29 and tag -1');
  // 2) 页面加载时生效：挂进 runCriticalVisualEnhancements（启动早期 + 局部增强都会跑）
  const fn = src.slice(src.indexOf('function runCriticalVisualEnhancements('), src.indexOf('function runEarlyStartupPass('));
  assert(fn.includes('installTestBoardSidebarLinkObserver()'), 'critical visual pass must install the sidebar link');
  assert(fn.includes('installTestBoardListGuard()'), 'critical visual pass must install the list guard');
  assert(fn.includes('restoreTestBoardThreadList()'), 'critical visual pass must run the list restore');
  assert(/try \{[\s\S]{0,1200}installTestBoardListGuard\(\)[\s\S]{0,500}restoreTestBoardThreadList\(\)[\s\S]{0,60}\} catch/.test(fn), 'all three calls must be guarded');
  // 3) 独立模块：不再挂在 PageType 上
  const pt = src.slice(src.indexOf('const PageType = {'), src.indexOf('const Utils = {'));
  assert(!pt.includes('ensureTestBoardSidebarLink'), 'helper must be extracted out of PageType');
  // 4) 含观察器兜底（侧边栏晚于脚本渲染时补挂）
  const mod = src.slice(src.indexOf('tag 30. 测试板块增强'), src.indexOf('tag -1. 入口初始化'));
  assert(mod.includes('MutationObserver'), 'tag 30 must install a fallback observer for late sidebar rendering');
  assert(mod.includes('restoreTestBoardThreadList'), 'tag 30 must include the thread list restore for the test board');
  // 无缝翻页双分页修复：守护放回的原生分页（列表紧邻前方）须同步最新页码
  // 该修复在 tag 7（板块页无缝翻页）内，不在 tag 30
  const tag7 = src.slice(src.indexOf('tag 7. 自动+手动无缝翻页'), src.indexOf('tag 8.'));
  assert(tag7.includes('for (const oldPag of allPaginations)') && tag7.includes('replaceWith(pagClone.cloneNode(true))'),
    'seamless paging must sync all native paginations (incl. guard-restored)');
  // v2：守护器（removedNodes 即时放回，无闪变、增强可作用、无缝翻页可用）
  assert(mod.includes('installTestBoardListGuard'), 'tag 30 must include the list guard');
  assert(mod.includes('removedNodes'), 'guard must watch removedNodes');
  assert(mod.includes(".h-threads-list, .h-pagination"), 'guard must protect both list and pagination');
  // 页首页码共存：守护器不得放回 enablePaginationDuplication 的克隆（titlePag），否则与其去重逻辑死循环
  assert(mod.includes("dataset.xdexTitleClone === '1'"), 'guard must skip titlePag clones');
  // 豁免：页首页码克隆与无缝翻页替换的移除必须放行（否则与页码去重/翻页替换死循环）
  assert(mod.includes("dataset.xdexTitleClone === '1'"), 'guard must skip titlePag clones');
  assert(mod.includes("dataset.xdexSeamlessReplaced === '1'"), 'guard must honor seamless-replaced marker');
  assert(src.includes("dataset.xdexSeamlessReplaced = '1'"), 'seamless paging must mark replaced native pagination');
  // 全量替换：除 titlePag 与 pagClone 外的所有分页（含守护放回的页底分页）都要同步页码
  const tag7seg = src.slice(src.indexOf('tag 7. 自动+手动无缝翻页'), src.indexOf('tag 8.'));
  assert(/for \(const oldPag of allPaginations\)/.test(tag7seg), 'must iterate all paginations for replacement');
  assert(tag7seg.includes("oldPag.dataset.xdexTitleClone === '1'"), 'titlePag must be excluded from replacement');
  // 守护范围限定主内容区：站点脚本会移除侧边栏里的分页（那是站点自身行为），我们不代管
  assert(mod.includes("closest('#h-content')"), 'guard must scope to #h-content only');
  // 结构化锚定：列表放回发串表单容器后的 hr① 下方（分页紧随列表），不依赖易失效的位置表
  assert(mod.includes('findListAnchor'), 'guard must anchor placement structurally');
  assert(mod.includes('doPostThread.html'), 'anchor must be the post form');
  assert(mod.includes('hr.nextSibling'), 'list must be placed right after the first hr');
  // 测试板块上下文识别 + 管理分组展开（对齐服务端对默认板块的 uk-open 行为）
  assert(mod.includes('function isTestBoardContext()'), 'must identify test board context');
  assert(/function expandAdminGroupIfTestBoard\(/.test(mod), 'must expand the admin group');
  assert(mod.includes('input[name="fid"][value="122"]'), 'fid=122 form field must be a recognition signal (covers thread pages)');
  assert(mod.includes("classList.add('uk-open')"), 'expansion must add uk-open');
  assert(mod.includes("classList.remove('uk-hidden')"), 'expansion must remove uk-hidden (sidebar collapse uses it)');
  assert(mod.includes("setAttribute('aria-expanded', 'true')"), 'expansion must sync aria-expanded');
  // UIkit 竞态：ready 后重申展开（early pass 的设置会被组件初始化覆盖）
  assert(mod.includes('reassert'), 'expansion must re-assert after UIkit init (500ms/1200ms)');
  assert(mod.includes('scrollHeight'), 'expanded height must use concrete pixel value (native form is height:130px)');
  // 当前版块链接样式：ultimate-bold-correct + h-active，判定用测试板块上下文整体（版块页与串内页均高亮）
  assert(mod.includes("toggle('ultimate-bold-correct', active)"), 'link must carry ultimate-bold-correct in test board context (board & thread pages)');
  assert(mod.includes('const active = isTestBoardContext();'), 'style gate must be the test-board-context check');
  assert(mod.includes("classList.add('h-active')"), 'board page must mark the link active');
  // 串内页主判据：面包屑板块链接（服务端输出当前串所属板块），href 需解码后比对（兼容编码/明文两态）
  assert(mod.includes('a[href^="/f/"]'), 'breadcrumb must scan all /f/ links');
  assert(mod.includes("decodeURIComponent(href)"), 'breadcrumb href must be decoded before matching');
  assert(!mod.includes('refreshTestBoardThreadIds'), 'showf thread-id set fallback must stay removed (breadcrumb is sufficient)');
}

const tests = [testLinkInsertedAfterCommittee, testLinkUrlAndStyle, testIdempotent, testGracefulWhenAdminMissing, testWiredIntoRenderPipeline];
for (const t of tests) t();
console.log('test board sidebar link contract ok');
