const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..', '..');
const scriptPath = [path.join(root, 'nmbxd-EX-for-edit.user.js'), path.join(root, 'nmbxd-EX.user.js')].find(p => { try { fs.accessSync(p); return true; } catch (_) { return false; } });
const script = fs.readFileSync(scriptPath, 'utf8');

function sliceBetween(startNeedle, endNeedle) {
  const start = script.indexOf(startNeedle);
  assert(start >= 0, `${startNeedle} must exist`);
  const end = script.indexOf(endNeedle, start);
  assert(end > start, `${endNeedle} must exist after ${startNeedle}`);
  return script.slice(start, end);
}

function sliceFunction(name) {
  const startNeedle = `function ${name}`;
  const start = script.indexOf(startNeedle);
  assert(start >= 0, `${startNeedle} must exist`);
  let brace = script.indexOf('{', start);
  assert(brace > start, `${name} body must exist`);
  let depth = 0;
  for (let i = brace; i < script.length; i += 1) {
    const ch = script[i];
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return script.slice(start, i + 1);
    }
  }
  throw new Error(`Unable to extract ${name}`);
}

const shellBind = sliceBetween('function bindRightSidebarShellButtons(docker)', 'function tryReplaceRightSidebarEarly()');
const earlyReplace = sliceBetween('function tryReplaceRightSidebarEarly()', 'function ensureRightSidebarReplyController()');
const fullReplace = sliceFunction('replaceRightSidebar()');

assert(script.includes('function openRightSidebarReplyWhenReady'), 'reply should use a safe wait-for-form opener');
assert(script.includes('function bindRightSidebarReplyButton'), 'reply binding should be extracted for reuse by early and full sidebar setup');
assert(shellBind.includes('bindRightSidebarReplyButton(docker)'), 'early shell binding must attach REPLY click immediately');
assert(earlyReplace.includes('bindRightSidebarShellButtons(docker)'), 'early sidebar setup must still bind shell buttons');
// 当前实现先取 dockerEl = dockerDom[0]，再 bindRightSidebarReplyButton(dockerEl)
assert(
  fullReplace.includes('bindRightSidebarReplyButton(dockerEl)') ||
  fullReplace.includes('bindRightSidebarReplyButton(dockerDom[0])'),
  'full replaceRightSidebar must keep a fallback REPLY binding'
);
assert(fullReplace.includes('const dockerEl = dockerDom[0]') || fullReplace.includes('bindRightSidebarReplyButton(dockerDom[0])'), 'full replace must resolve docker element before REPLY bind');
assert(!fullReplace.includes('ensureRightSidebarReplyController().open();'), 'full replaceRightSidebar should not own the only direct REPLY open binding');
assert(script.includes('openRightSidebarReplyWhenReady(retry + 1)'), 'safe opener should retry briefly when form is not yet in DOM');

console.log('right sidebar early reply ok');
