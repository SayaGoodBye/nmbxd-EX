const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..', '..');
const script = fs.readFileSync(path.join(root, 'nmbxd-EX.user.js'), 'utf8');

function sliceBetween(startNeedle, endNeedle) {
  const start = script.indexOf(startNeedle);
  assert(start >= 0, `${startNeedle} must exist`);
  const end = script.indexOf(endNeedle, start);
  assert(end > start, `${endNeedle} must exist after ${startNeedle}`);
  return script.slice(start, end);
}

const expandSection = sliceBetween('function enablePostExpand(root = document)', '/* --------------------------------------------------\n   * tag 17.');
const criticalSection = sliceBetween('function runCriticalVisualEnhancements(root, cfg)', 'function runEarlyStartupPass(root)');
const runtimeApplySection = sliceBetween('window.applyPostExpandAllMode = function(enable)', '};\n  });');

assert(script.includes('xdex-post-expand-all'), 'all-expanded mode must be represented by a root-level CSS class');
assert(script.includes('xdex-post-expand-collapsed'), 'all-expanded mode must support per-thread collapsed exceptions');
assert(/html\.xdex-post-expand-all\s+\.h-threads-item-index:not\(\.xdex-post-expand-collapsed\)/.test(script), 'global all-expanded CSS must expand board, timeline, and legacy showf thread items without per-item class writes');

assert(!criticalSection.includes('enablePostExpand(root || document)'), 'early critical visual pass must not repeatedly scan the full page with enablePostExpand');
assert(!/if\s*\(expandAllMode\)\s*{[\s\S]*?item\.classList\.add\('expanded'\)/.test(expandSection), 'enablePostExpand initialization must not add expanded to every thread in all-expanded mode');
assert(!/if\s*\(expandAll\)\s*{[\s\S]*?scanTargets\.forEach\([\s\S]*?item\.classList\.add\('expanded'\)/.test(expandSection), 'automatic all-expanded initialization must not perform a second per-thread expanded loop');
assert(!/if\s*\(enable\)\s*{[\s\S]*?threads\.forEach\([\s\S]*?item\.classList\.add\('expanded'\)/.test(runtimeApplySection), 'runtime enabling all-expanded mode must not synchronously add expanded to every thread');

console.log('post expand performance ok');
