const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const scriptPath = path.join(root, 'nmbxd-EX-for-edit.user.js');
const manifestPath = path.join(root, 'nmbxd-EX-Extension', 'manifest.json');
const script = fs.readFileSync(scriptPath, 'utf8');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertContains(text, message) {
  assert(script.includes(text), message);
}

function normalizeNmbSearchHref(rawHref) {
  const url = new URL(rawHref, 'https://nmb-search.166666666.xyz/');
  if (url.protocol !== 'https:') return rawHref;
  if (url.hostname !== 'www.nmbxd1.com') return rawHref;
  const nextPath = url.pathname.replace(/^\/m\/t\/(\d+)/, '/t/$1');
  if (nextPath === url.pathname) return rawHref;
  url.pathname = nextPath;
  return url.toString();
}

function testMetadataAndManifestScope() {
  assertContains('// @match        https://nmb-search.166666666.xyz/*', 'userscript metadata must include nmb-search scope');
  const isolatedEntry = manifest.content_scripts.find((entry) => (entry.js || []).includes('src/content/nmbxd-EX-for-edit.user.js'));
  assert(isolatedEntry, 'manifest must contain userscript content script entry');
  assert((isolatedEntry.matches || []).includes('https://nmb-search.166666666.xyz/*'), 'Extension userscript entry must match nmb-search scope');
}

function testScriptWiring() {
  assertContains('function isNmbSearchPage', 'script must detect nmb-search page');
  assertContains('function normalizeNmbSearchMobileThreadUrl', 'script must normalize mobile thread URL');
  assertContains('function rewriteNmbSearchMobileThreadLinks', 'script must rewrite search result links');
  assertContains('function makeNmbSearchLinkOpenInNewTab', 'script must set nmb-search links to open in a new tab');
  assertContains('function isNmbSearchResultLink', 'script must detect nmb-search result links separately from page chrome links');
  assertContains('function handleNmbSearchLinkClick', 'script must intercept nmb-search link clicks');
  assertContains("const selector = '#overflow.text-result a[href]'", 'rewrite flow must scan only links inside #overflow.text-result');
  assertContains("a.matches('#overflow.text-result a[href]')", 'click handler must limit forced new-tab behavior to search result links');
  assertContains('if (!isNmbSearchResultLink(a)) return;', 'non-result nmb-search links must keep default click behavior');
  assertContains('makeNmbSearchLinkOpenInNewTab(a);', 'rewrite flow must apply new-tab behavior to matched nmb-search links');
  assertContains("document.addEventListener('click', handleNmbSearchLinkClick, true);", 'nmb-search click handler must run in capture phase');
  assertContains("window.open(a.href, '_blank', 'noopener,noreferrer');", 'nmb-search click handler must force new-tab navigation');
  assertContains('function initNmbSearchMobileThreadRedirector', 'script must initialize search redirector');
  assertContains('startup.nmbSearchMobileThreadRedirector', 'document.ready must short-circuit into search redirector on nmb-search');
}

function applyOpenInNewTab(anchor) {
  anchor.target = '_blank';
  const rel = new Set(String(anchor.rel || '').split(/\s+/).filter(Boolean));
  rel.add('noopener');
  rel.add('noreferrer');
  anchor.rel = Array.from(rel).join(' ');
}

function isSearchResultAnchor(anchor) {
  return !!(anchor && anchor.insideResult);
}

function rewriteSearchAnchor(anchor) {
  if (!isSearchResultAnchor(anchor)) return;
  const nextHref = normalizeNmbSearchHref(anchor.href);
  if (nextHref !== anchor.href) anchor.href = nextHref;
  applyOpenInNewTab(anchor);
}

function shouldInterceptClick(event) {
  return !event.defaultPrevented && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && isSearchResultAnchor(event.anchor);
}

function testUrlBehavior() {
  assert(
    normalizeNmbSearchHref('https://www.nmbxd1.com/m/t/65864812?r=68078266') === 'https://www.nmbxd1.com/t/65864812?r=68078266',
    'mobile thread URL must rewrite to PC thread URL and preserve query'
  );
  assert(
    normalizeNmbSearchHref('https://www.nmbxd1.com/m/t/65864812#reply') === 'https://www.nmbxd1.com/t/65864812#reply',
    'mobile thread URL must preserve hash'
  );
  assert(
    normalizeNmbSearchHref('https://www.nmbxd1.com/m/f/%E7%BB%BC%E5%90%88') === 'https://www.nmbxd1.com/m/f/%E7%BB%BC%E5%90%88',
    'non-thread mobile URL must stay unchanged'
  );
  assert(
    normalizeNmbSearchHref('https://web.archive.org/web/https%3A%2F%2Fwww.nmbxd1.com%2Fm%2Ft%2F65864812%3Fr%3D68078266') === 'https://web.archive.org/web/https%3A%2F%2Fwww.nmbxd1.com%2Fm%2Ft%2F65864812%3Fr%3D68078266',
    'archive service links must stay unchanged'
  );
}

function testNewTabBehavior() {
  const anchor = { target: '', rel: 'noreferrer nofollow' };
  applyOpenInNewTab(anchor);
  assert(anchor.target === '_blank', 'rewritten nmb-search links must open in a new tab');
  assert(anchor.rel.split(/\s+/).includes('noopener'), 'new-tab links must include noopener');
  assert(anchor.rel.split(/\s+/).includes('noreferrer'), 'new-tab links must keep noreferrer');
  assert(anchor.rel.split(/\s+/).includes('nofollow'), 'existing rel tokens must be preserved');

  const pcThread = { href: 'https://www.nmbxd1.com/t/65864812', target: '', rel: '', insideResult: true };
  rewriteSearchAnchor(pcThread);
  assert(pcThread.href === 'https://www.nmbxd1.com/t/65864812', 'PC thread URL must stay unchanged');
  assert(pcThread.target === '_blank', 'result links must open in a new tab');
  assert(pcThread.rel.split(/\s+/).includes('noopener'), 'non-mobile links must include noopener');

  const archive = {
    href: 'https://web.archive.org/web/https%3A%2F%2Fwww.nmbxd1.com%2Fm%2Ft%2F65864812%3Fr%3D68078266',
    target: '',
    rel: '',
    insideResult: true
  };
  rewriteSearchAnchor(archive);
  assert(
    archive.href === 'https://web.archive.org/web/https%3A%2F%2Fwww.nmbxd1.com%2Fm%2Ft%2F65864812%3Fr%3D68078266',
    'archive service links must still stay unchanged'
  );
  assert(archive.target === '_blank', 'archive result links must open in a new tab');

  const pageChromeLink = { href: 'https://example.test/help', target: '', rel: '', insideResult: false };
  rewriteSearchAnchor(pageChromeLink);
  assert(pageChromeLink.target === '', 'nmb-search links outside #overflow.text-result must keep default target behavior');
  assert(pageChromeLink.rel === '', 'nmb-search links outside #overflow.text-result must not receive rel tokens');
}

function testClickInterceptBehavior() {
  assert(shouldInterceptClick({ defaultPrevented: false, button: 0, anchor: { insideResult: true } }), 'plain left-click on result links must be intercepted for forced new-tab navigation');
  assert(!shouldInterceptClick({ defaultPrevented: false, button: 0, anchor: { insideResult: false } }), 'plain left-click outside #overflow.text-result must keep browser default behavior');
  assert(!shouldInterceptClick({ defaultPrevented: true, button: 0, anchor: { insideResult: true } }), 'already prevented clicks must not be intercepted');
  assert(!shouldInterceptClick({ defaultPrevented: false, button: 1, anchor: { insideResult: true } }), 'middle clicks must keep browser default behavior');
  assert(!shouldInterceptClick({ defaultPrevented: false, button: 0, ctrlKey: true, anchor: { insideResult: true } }), 'modified clicks must keep browser default behavior');
}

testMetadataAndManifestScope();
testScriptWiring();
testUrlBehavior();
testNewTabBehavior();
testClickInterceptBehavior();
console.log('nmb search redirect contract ok');
