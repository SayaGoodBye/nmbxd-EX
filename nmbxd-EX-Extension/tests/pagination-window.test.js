const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const scriptPath = [path.join(root, 'nmbxd-EX-for-edit.user.js'), path.join(root, 'nmbxd-EX.user.js')].find(p => { try { fs.accessSync(p); return true; } catch (_) { return false; } });
const script = fs.readFileSync(scriptPath, 'utf8');

function extractFunctionSource(name) {
  const match = new RegExp(`^\\s*function ${name}\\s*\\(`, 'm').exec(script);
  assert(match, `${name} must exist`);
  const start = match.index + match[0].search(/function/);
  let i = script.indexOf('{', start);
  let depth = 0;
  for (; i < script.length; i += 1) {
    const ch = script[i];
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return script.slice(start, i + 1);
    }
  }
  throw new Error(`Unable to extract ${name}`);
}

function createClassList(initial = '') {
  const set = new Set(String(initial).split(/\s+/).filter(Boolean));
  return {
    contains(cls) { return set.has(cls); },
    add(cls) { set.add(cls); },
    remove(cls) { set.delete(cls); },
    toString() { return Array.from(set).join(' '); }
  };
}

function textOf(node) {
  const own = node.textContent == null ? '' : String(node.textContent);
  return own + (node.children || []).map(textOf).join('');
}

class Element {
  constructor(tagName, attrs = {}, text = '') {
    this.tagName = tagName.toUpperCase();
    this.attributes = { ...attrs };
    this.children = [];
    this.parentNode = null;
    this.textContent = text;
    this.dataset = {};
    this.classList = createClassList(attrs.class || '');
  }
  get className() { return this.classList.toString(); }
  set className(value) { this.attributes.class = value; this.classList = createClassList(value); }
  get href() { return this.getAttribute('href') || ''; }
  set href(value) { this.setAttribute('href', value); }
  appendChild(child) { child.parentNode = this; this.children.push(child); return child; }
  insertBefore(fragment, ref) {
    const idx = this.children.indexOf(ref);
    const insertAt = idx >= 0 ? idx : this.children.length;
    const nodes = fragment.isFragment ? fragment.children.slice() : [fragment];
    nodes.forEach(n => { n.parentNode = this; });
    this.children.splice(insertAt, 0, ...nodes);
    return fragment;
  }
  remove() {
    if (!this.parentNode) return;
    const idx = this.parentNode.children.indexOf(this);
    if (idx >= 0) this.parentNode.children.splice(idx, 1);
    this.parentNode = null;
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'class') this.classList = createClassList(value);
  }
  getAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null; }
  querySelectorAll(selector) {
    const selectors = selector.split(',').map(s => s.trim());
    const out = [];
    const visit = (node) => {
      for (const child of node.children || []) {
        if (selectors.some(sel => child.matches(sel))) out.push(child);
        visit(child);
      }
    };
    visit(this);
    return out;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  matches(selector) {
    const sel = selector.trim();
    if (sel === 'a') return this.tagName === 'A';
    if (sel === 'span') return this.tagName === 'SPAN';
    if (sel === 'li.uk-active') return this.tagName === 'LI' && this.classList.contains('uk-active');
    if (sel === 'a[href]' || sel === 'span[href]') return (this.tagName === 'A' || this.tagName === 'SPAN') && this.getAttribute('href');
    return false;
  }
}

function li(child, cls = '') {
  const node = new Element('li', cls ? { class: cls } : {});
  node.appendChild(child);
  node.textContent = textOf(child);
  return node;
}
function a(text, href) { return new Element('a', { href }, text); }
function span(text, href) { return new Element('span', { href }, text); }
function makeBoardPagination() {
  const ul = new Element('ul', { class: 'uk-pagination uk-pagination-left h-pagination' });
  const base = '/f/%E7%BB%BC%E5%90%88%E7%89%881';
  ul.appendChild(li(a('上一页', `${base}?page=1`)));
  ul.appendChild(li(a('1', `${base}?page=1`)));
  ul.appendChild(li(span('2', `${base}?page=2`), 'uk-active'));
  ul.appendChild(li(a('3', `${base}?page=3`)));
  ul.appendChild(li(a('下一页', `${base}?page=3`)));
  return ul;
}

function createContext(pathname) {
  const context = {
    location: { pathname },
    document: {
      createElement: tag => new Element(tag),
      createDocumentFragment: () => ({ isFragment: true, children: [], appendChild(child) { this.children.push(child); return child; } })
    },
    console
  };
  vm.createContext(context);
  vm.runInContext([
    extractFunctionSource('parsePaginationPageNum'),
    extractFunctionSource('buildPaginationHref'),
    extractFunctionSource('isBoardPaginationContext'),
    extractFunctionSource('rebuildPaginationPages'),
    extractFunctionSource('processPagination')
  ].join('\n'), context);
  return context;
}
function pageTexts(pag) {
  return pag.children.map(li => (li.children[0] && textOf(li.children[0])) || textOf(li));
}
function runBoardWithPath(pathname) {
  const context = createContext(pathname);
  const pag = makeBoardPagination();
  context.rebuildPaginationPages(pag);
  return pageTexts(pag).filter(t => /^\d+$/.test(t));
}

const pages = runBoardWithPath('/f/%E7%BB%BC%E5%90%88%E7%89%881');
assert.deepStrictEqual(pages, ['1', '2', '3', '4', '5', '6', '7'], 'board pagination should expand to seven page buttons on real /f/ URLs without a last-page link');

console.log('pagination window ok');
