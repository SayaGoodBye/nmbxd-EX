// 板块页/时间线「获取最新回复」按钮：重应用接线契约测试
// 缺陷形态：只在启动时一次性扫描 document，无缝翻页新增卡片拿不到按钮
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

function sliceFn(name) {
  const start = source.indexOf(`function ${name}`);
  assert(start !== -1, `${name} must exist`);
  let i = source.indexOf('(', start);
  let d = 0, close = i;
  for (let k = i; k < source.length; k += 1) {
    if (source[k] === '(') d += 1;
    else if (source[k] === ')') { d -= 1; if (d === 0) { close = k; break; } }
  }
  const b = source.indexOf('{', close + 1);
  d = 0;
  for (let k = b; k < source.length; k += 1) {
    const ch = source[k];
    if (ch === '"' || ch === "'" || ch === '`') { // 跳过字符串
      const q = ch; k += 1;
      while (k < source.length) { if (source[k] === '\\') { k += 2; continue; } if (source[k] === q) break; k += 1; }
      continue;
    }
    if (ch === '{') d += 1;
    else if (ch === '}') { d -= 1; if (d === 0) return source.slice(start, k + 1); }
  }
  throw new Error(`${name} body not closed`);
}

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('按钮绑定挂在每次追加重应用钩子上', () => {
  const hook = sliceFn('applyPageEnhancements');
  assert(/bindBoardThreadRefreshButtons\(root\)/.test(hook),
    'applyPageEnhancements 必须对追加内容调用 bindBoardThreadRefreshButtons(root)');
  // 与同类逐卡片注入功能同处一条钩子，避免再次漏挂
  assert(/enablePostExpand\(root\)/.test(hook), 'enablePostExpand 仍应在同一钩子内（对照锚点）');
});

test('绑定按追加根作用域扫描，而非重新扫全文档', () => {
  const fn = sliceFn('bindBoardThreadRefreshButtons');
  assert(/scanRoot\.querySelectorAll\('\.h-threads-item-index'\)/.test(fn),
    '应以 scanRoot 为作用域扫描卡片');
  assert(!/document\.querySelectorAll\('\.h-threads-item-index'\)/.test(fn),
    '不应绕过 root 直接全文档扫描');
});

test('绑定保持幂等且具备页面类型早退', () => {
  const fn = sliceFn('bindBoardThreadRefreshButtons');
  assert(/isBoardPage\(\)[\s\S]*isTimelinePage\(\)/.test(fn), '非板块/时间线页应早退（串内页追加不受影响）');
  assert(/:scope > \.xdex-board-refresh-btn/.test(fn), '应检查既有按钮避免重复注入');
});

test('绑定不再只依赖启动期一次性调用', () => {
  const calls = [];
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const l = lines[i];
    if (/bindBoardThreadRefreshButtons\(/.test(l) && !/function bindBoardThreadRefreshButtons/.test(l)) calls.push(i + 1);
  }
  assert(calls.length >= 3,
    `调用点应覆盖「启动一次 + 每次追加」，当前 ${calls.length} 处 @ L${calls.join(', L')}`);
});

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log('ok   ' + name); }
  catch (e) { failed += 1; console.log('FAIL ' + name + ' :: ' + (e && e.message ? e.message : e)); }
}
if (failed) { console.log(`\n${failed}/${tests.length} board refresh button assertions failed`); process.exitCode = 1; }
else console.log(`\nboard refresh button reapply contract ok (${tests.length} groups)`);
