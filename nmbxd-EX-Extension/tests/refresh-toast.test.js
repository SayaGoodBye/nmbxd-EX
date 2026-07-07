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
  assert(refreshStatusCalls >= 4, 'refresh status toasts should consistently use the immediate refresh-status key');
  assert(source.includes("toast(result.hasUpdate ? '已更新' : '无更新', 900, { queue: false, key: 'refresh-status' })"), 'manual/auto refresh result should use immediate refresh-status toast');
}

const tests = [
  testImmediateToastUsesGenerationGuard,
  testRefreshStatusUsesImmediateToastKey,
];

for (const test of tests) test();

console.log('refresh toast contract ok');
