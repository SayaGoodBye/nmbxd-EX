// ?r= 定位契约：URL 带 r= 就定位（**不要求同时带 page=**），元素不在 DOM 时静默放弃。
// 背景：原先 `page === null → return` 让 `/t/<tid>?r=<rid>` 这种无 page 链接既不定位、
//       又被历史恢复短路，最后停在页首。
// 运行：node tests/reply-param-scroll.test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const EXT_ROOT = path.join(__dirname, '..');
const SOURCE_PATH = path.join(EXT_ROOT, 'src', 'content', 'nmbxd-EX-for-edit.user.js');
const source = fs.readFileSync(SOURCE_PATH, 'utf8').replace(/\r\n/g, '\n');

function extractFunctionBody(functionName) {
  const start = source.indexOf(`function ${functionName}(`);
  assert(start !== -1, `${functionName} 必须存在`);
  let i = source.indexOf('(', start);
  let parenDepth = 0;
  for (; i < source.length; i++) {
    const ch = source[i];
    if (ch === '(') parenDepth += 1;
    else if (ch === ')') {
      parenDepth -= 1;
      if (parenDepth === 0) { i += 1; break; }
    }
  }
  const braceStart = source.indexOf('{', i);
  let depth = 0;
  for (let j = braceStart; j < source.length; j++) {
    const ch = source[j];
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, j + 1);
    }
  }
  throw new Error(`${functionName} 函数体未闭合`);
}

const FN_SOURCE = extractFunctionBody('initReplyParamScrollTo');

// 返回一个可手动驱动的环境：pending 里是按顺序登记的定时器回调
function createEnv({ search, targetExists }) {
  const calls = { scroll: 0, options: [], scheduled: [] };
  const element = {
    isConnected: true,
    scrollIntoView(options) { calls.scroll += 1; calls.options.push(options); }
  };
  const sandbox = {
    URLSearchParams,
    location: { search },
    document: { querySelector: () => (targetExists ? element : null) },
    setTimeout: (fn, ms) => { calls.scheduled.push({ fn, ms }); return calls.scheduled.length; },
    console: { log() {}, warn() {} }
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(`${FN_SOURCE}\n;globalThis.__init = initReplyParamScrollTo;`, sandbox);
  return {
    calls,
    init: () => sandbox.__init(),
    // 驱动最多的轮询次数，返回实际跑了多少轮
    drain(maxRounds = 60) {
      let rounds = 0;
      while (calls.scheduled.length && rounds < maxRounds) {
        const next = calls.scheduled.shift();
        rounds += 1;
        next.fn();
      }
      return rounds;
    }
  };
}

function testNoPageStillScrolls() {
  const env = createEnv({ search: '?r=50764364', targetExists: true });
  env.init();
  assert.strictEqual(env.calls.scroll, 1, '无 page 的 ?r= 链接必须定位（本次修复核心）');
  assert.strictEqual(env.calls.options[0].block, 'center', '必须按视野居中定位');
}

function testWithPageStillScrolls() {
  const env = createEnv({ search: '?page=2&r=50764364', targetExists: true });
  env.init();
  assert.strictEqual(env.calls.scroll, 1, '带 page 的原有行为不能回退');
}

function testIgnoresNonNumericRParam() {
  ['?r=abc', '?r=12345', '?r=123456789', '?r=', '?page=2', ''].forEach((search) => {
    const env = createEnv({ search, targetExists: true });
    env.init();
    assert.strictEqual(env.calls.scroll, 0, `${search || '(无 query)'} 不应定位`);
    assert.strictEqual(env.calls.scheduled.length, 0, `${search || '(无 query)'} 不应启动轮询`);
  });
}

function testGivesUpWithoutCrossPageJump() {
  const env = createEnv({ search: '?r=50764364', targetExists: false });
  env.init();
  assert.strictEqual(env.calls.scroll, 0, '元素不存在时不得滚动');
  assert.strictEqual(env.calls.scheduled.length, 1, '应启动一次轮询');
  assert.strictEqual(env.calls.scheduled[0].ms, 300, '轮询间隔应为 300ms');
  const rounds = env.drain();
  assert(rounds >= 1 && rounds <= 21, `轮询必须在有限次数内停止（实际 ${rounds} 轮）`);
  assert.strictEqual(env.calls.scroll, 0, '放弃时不得滚动，也不得跨页跳转');
  assert.strictEqual(env.calls.scheduled.length, 0, '轮询耗尽后必须停止（不留常驻定时器）');
}

function testLateAppearingTargetIsFound() {
  // 元素晚一帧渲染：前两轮找不到、第三轮出现 → 仍应定位
  const calls = { scroll: 0, options: [], scheduled: [] };
  const element = { isConnected: true, scrollIntoView(o) { calls.scroll += 1; calls.options.push(o); } };
  let probes = 0;
  const sandbox = {
    URLSearchParams,
    location: { search: '?r=50764364' },
    document: { querySelector: () => { probes += 1; return probes >= 3 ? element : null; } },
    setTimeout: (fn, ms) => { calls.scheduled.push({ fn, ms }); return 1; },
    console: { log() {}, warn() {} }
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(`${FN_SOURCE}\n;globalThis.__init = initReplyParamScrollTo;`, sandbox);
  sandbox.__init();
  let rounds = 0;
  while (calls.scheduled.length && rounds < 10) { calls.scheduled.shift().fn(); rounds += 1; }
  assert.strictEqual(calls.scroll, 2, '元素晚到也必须定位（1 次定位 + 1 次 800ms 二次校准）');
  assert.deepStrictEqual(calls.options.map((o) => o.block), ['center', 'center'], '两次都按视野居中');
}

function testSourceContract() {
  assert(!FN_SOURCE.includes("params.get('page') === null"), '不得再要求 URL 带 page=');
  assert(FN_SOURCE.includes('/^\\d{6,8}$/.test(rParam)'), '仍必须校验 r= 为 6~8 位数字');
  assert(FN_SOURCE.includes('attempts <= 20'), '必须保留"有限次数轮询后放弃"的上限');
  assert(FN_SOURCE.includes("block: 'center'"), '必须居中定位');
  const restore = extractFunctionBody('initThreadHistoryReplyRestore');
  assert(restore.includes("if (new URLSearchParams(location.search).get('r')) return;"), '?r= 必须仍然优先于历史位置恢复');
}

const tests = [
  testNoPageStillScrolls,
  testWithPageStillScrolls,
  testIgnoresNonNumericRParam,
  testGivesUpWithoutCrossPageJump,
  testLateAppearingTargetIsFound,
  testSourceContract
];

let failed = 0;
tests.forEach((fn) => {
  try {
    fn();
    console.log(`  PASS ${fn.name}`);
  } catch (err) {
    failed += 1;
    console.error(`  FAIL ${fn.name}\n       ${(err && err.message) || err}`);
  }
});
if (failed) {
  console.error(`${failed} / ${tests.length} 项失败`);
  process.exit(1);
}
console.log('reply param scroll contract ok');
