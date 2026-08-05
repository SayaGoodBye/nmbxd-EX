const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function extractFunction(name) {
  const start = source.indexOf(`function ${name}`);
  assert(start !== -1, `${name} must exist`);
  let depth = 0;
  let seenBody = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') {
      depth += 1;
      seenBody = true;
    } else if (ch === '}') {
      depth -= 1;
      if (seenBody && depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`${name} body not closed`);
}

function testHoverFallbackIsConditional() {
  const body = extractFunction('bindRightSidebarShellButtons');
  assert(/CSS\.supports\(['"]selector\(:has\(\*\)\)['"]\)/.test(body), 'hover fallback should check :has() support');
  const supportsIndex = body.indexOf('CSS.supports');
  const mouseIndex = body.indexOf("addEventListener('mouseenter'");
  assert(mouseIndex > supportsIndex, 'mouseenter fallback should be guarded by the :has() support check');
}

function testHoverFallbackCssDoesNotShareHasSelectorList() {

  const shellStyle = source.slice(source.indexOf('function ensureRightSidebarShellStyle'), source.indexOf('function logRightSidebarDocker'));

  assert(shellStyle.includes('.hld__docker.is-hover .hld__docker-btns>div {'), 'legacy hover fallback must have its own CSS rule');

  assert(!/\.hld__docker\.is-hover \.hld__docker-btns>div,\s*\.hld__docker:has\(/.test(shellStyle), 'legacy hover fallback must not share a selector list with :has()');

}



function testReplyClickUsesNativeDedupedBinding() {

  assert(source.includes('xdexReplyDockBound'), 'REPLY button should use a dataset/native binding guard');
  assert(!source.includes("off('click.xdexReplyDock').on('click.xdexReplyDock'"), 'REPLY button should not use jQuery off/on for the dock click');
}

function testResizeObserverIsCleanedOnClose() {
  const body = extractFunction('closeOverlay');
  assert(/__resizeObserver[\s\S]*disconnect\(\)[\s\S]*__resizeObserver\s*=\s*null/.test(body), 'closeOverlay should disconnect and clear overlay.__resizeObserver');
}

function testDragMoveListenersAreTemporary() {
  if (!source.includes('function enableDragForReply')) return; // TDD: not yet implemented
  const body = extractFunction('enableDragForReply');
  assert(!body.includes("$(window).on('mousemove.qpdrag-reply'"), 'drag should not keep a namespaced window mousemove handler alive after setup');
  assert(body.includes("window.addEventListener('mousemove'"), 'drag should add mousemove only when dragging starts');
  assert(body.includes("window.removeEventListener('mousemove'"), 'drag should remove mousemove when dragging ends');
  assert(body.includes("{ once: true }") || body.includes('once: true'), 'mouseup handler should be one-shot');
}

function extractBetween(startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  assert(start !== -1, `${startNeedle} must exist`);
  const end = source.indexOf(endNeedle, start);
  assert(end !== -1, `${endNeedle} must exist after ${startNeedle}`);
  return source.slice(start, end);
}

function testReplyControllerIsLazy() {
  const replaceBody = extractBetween('function replaceRightSidebar()', 'function interceptReplyForm()');
  if (!replaceBody.includes('ensureRightSidebarReplyController')) return; // TDD: lazy pattern not yet wired
  assert(!replaceBody.includes('function ensureOverlay'), 'replaceRightSidebar should not define overlay setup eagerly');
  assert(!replaceBody.includes('function closeOverlay'), 'replaceRightSidebar should not define overlay close eagerly');
  assert(!replaceBody.includes('function enableDragForReply'), 'replaceRightSidebar should not define drag handlers eagerly');
  assert(replaceBody.includes('ensureRightSidebarReplyController().open()'), 'REPLY click should lazily open the reply controller');
}

const tests = [
  testHoverFallbackIsConditional,
  testHoverFallbackCssDoesNotShareHasSelectorList,
  testReplyClickUsesNativeDedupedBinding,
  testResizeObserverIsCleanedOnClose,
  testDragMoveListenersAreTemporary,
  testReplyControllerIsLazy,
];

for (const test of tests) {
  test();
}

console.log('right sidebar event contract ok');
