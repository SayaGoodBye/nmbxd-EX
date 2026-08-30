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

function testImmediateToastUsesGenerationGuard() {
  const body = extractFunction('showImmediateToast');
  assert(body.includes('__xdexImmediateToastSeq'), 'immediate toast should store a per-node generation token');
  assert(body.includes('=== seq'), 'immediate toast fadeOut callback should only remove the latest generation');
  assert(!body.includes('$t.stop(true, true).text(msg).show().delay(duration).fadeOut(160, () => $t.remove())'), 'same-key immediate toast must not let an old animation callback remove the new message');
}

function testRefreshStatusUsesImmediateToastKey() {

  const refreshStatusCalls = (source.match(/key:\s*['"]refresh-status['"]/g) || []).length;

  assert(refreshStatusCalls >= 1, 'refresh status channel should define the immediate refresh-status key');

  assert(source.includes("showRefreshStatus(result.hasUpdate ? '已更新' : '无更新')"), 'manual/auto refresh result should use the dedicated refresh-status toast');

}



function testRefreshStatusHasDedicatedChannel() {

  assert(source.includes('function showRefreshStatus('), 'refresh status should use a dedicated toast channel');

  assert(source.includes("key: 'refresh-status'"), 'refresh status channel should keep its dedicated key');

  assert(source.includes('function beginRefreshStatus('), 'refresh status should create a generation token');

  assert(source.includes('function isCurrentRefreshStatus('), 'refresh status should validate generation tokens');

}



function testRefreshChainPassesGenerationToken() {

  const refreshBody = extractFunction('refreshRepliesAndCheckNext');

  const resultBody = extractFunction('handleSeamlessRefreshCheckResult');

  assert(source.includes('function refreshRepliesAndCheckNext(done, options = {}, refreshGeneration)'), 'refresh check should carry a refresh generation');

  assert(resultBody.includes('refreshGeneration'), 'refresh result handler should validate the refresh generation');

  assert(resultBody.includes('isCurrentRefreshStatus(refreshGeneration)'), 'stale refresh results must be ignored');

}



function testRefreshPathDoesNotUseQueuedToast() {

  const refreshBody = extractFunction('refreshRepliesAndCheckNext');

  const resultBody = extractFunction('handleSeamlessRefreshCheckResult');

  const buttonBody = extractFunction('ensureSeamlessRefreshButtonNode');

  assert(!/toast\((?![^\n]*queue:\s*false)/.test(refreshBody), 'refresh check must not enqueue ordinary toasts');

  assert(!/toast\((?![^\n]*queue:\s*false)/.test(resultBody), 'refresh result must not enqueue ordinary toasts');

  assert(!/toast\((?![^\n]*queue:\s*false)/.test(buttonBody), 'refresh button must not enqueue ordinary toasts');

}


const tests = [
  testImmediateToastUsesGenerationGuard,
  testRefreshStatusUsesImmediateToastKey,
  testRefreshStatusHasDedicatedChannel,
  testRefreshChainPassesGenerationToken,
  testRefreshPathDoesNotUseQueuedToast,
];

for (const test of tests) test();

console.log('refresh toast contract ok');
