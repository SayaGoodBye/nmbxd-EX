// 饼干发送冷却：按"身份(userhash)"计时（站点条目 ↔ 同身份自定义饼干共享）
// 对应需求：自定义饼干若能在本账号饼干列表里被识别（同一 userhash），冷却应与站点那枚**共享**，
// 与二次确认弹窗里"使用次数"的口径一致（那里 stats 也按同一形式聚合）。
// 现状差异（改为身份键之前）：冷却按 cookie.id 落盘 → 同一身份的两个条目各记各的 → 界面显示 0s 但服务器仍拒绝。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

function extractFn(name) {
  const anchor = 'function ' + name + '(';
  let start = src.indexOf(anchor);
  assert(start !== -1, name + ' 必须存在');
  if (src.slice(Math.max(0, start - 6), start) === 'async ') start -= 6;
  const po = src.indexOf('(', start);
  let pd = 0, pc = -1;
  for (let i = po; i < src.length; i++) { if (src[i] === '(') pd++; else if (src[i] === ')') { pd--; if (pd === 0) { pc = i; break; } } }
  const bo = src.indexOf('{', pc); let d = 0;
  for (let i = bo; i < src.length; i++) { if (src[i] === '{') d++; else if (src[i] === '}') { d--; if (d === 0) return src.slice(start, i + 1); } }
  throw new Error('unbalanced ' + name);
}

const abbreviateDecl = (src.match(/const abbreviateName = [^\n]+/) || [])[0];
assert(abbreviateDecl, '应能取到 abbreviateName 的真实定义');

const PIECES = [abbreviateDecl,
  'cookieIdentityKey', 'getCookieCooldownStore', 'setCookieCooldownAt',
  'getCookieCooldownRemainMs', 'startCookieCooldown'
].map(s => (s.startsWith('const ') ? s : extractFn(s))).join('\n');

// 站点条目：name 形如 "<缩写> - <日期>"；自定义条目：name 就是缩写
const SITE = { id: '376569', name: 'DEMOc0d - 2026-01-01 00:00:00', desc: 'x' };
const CUSTOM_SAME = { id: 'custom-a', name: 'DEMOc0d', desc: '自定义', custom: true };
const CUSTOM_OTHER = { id: 'custom-b', name: 'OTHER7x', desc: '自定义', custom: true };

function makeSandbox(opts) {
  const o = opts || {};
  const store = {};
  const state = { now: 1_000_000_000_000, current: o.current || null, renders: 0 };
  const sandbox = {
    console: { log: () => {}, warn: () => {} },
    GM_getValue: (k, d) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : d),
    GM_setValue: (k, v) => { store[k] = v; },
    getCurrentCookie: () => state.current,
    renderCookieCooldown: () => { state.renders += 1; },
    Date: { now: () => state.now }
  };
  sandbox.__store = store;
  sandbox.__state = state;
  const ctx = vm.createContext(sandbox);
  vm.runInContext("const COOKIE_SUBMIT_COOLDOWN_MS = 15000;\nconst COOKIE_COOLDOWN_STORE_KEY = 'xdex-xvjuz-lrtbdxqcu';\n" + PIECES + '\n', ctx);
  return sandbox;
}

const KEY = 'xdex-xvjuz-lrtbdxqcu';

// ─────────── ① 同身份：自定义 → 站点 共享 ───────────
test('同身份共享：自定义条目计时后，站点条目也显示冷却', () => {
  const sb = makeSandbox({ current: CUSTOM_SAME });
  sb.startCookieCooldown();
  const keys = Object.keys(sb.__store[KEY] || {});
  assert(keys.length === 1, '只应有一条记录，实际 ' + JSON.stringify(keys));
  assert(keys[0] === 'DEMOc0d', '键必须是身份（去掉日期后的缩写），实际 ' + keys[0]);
  assert(sb.getCookieCooldownRemainMs(SITE) > 0, '站点条目应共享该冷却');
  assert(sb.getCookieCooldownRemainMs(CUSTOM_SAME) > 0, '自定义条目自身当然也在冷却');
  assert(sb.getCookieCooldownRemainMs(CUSTOM_OTHER) === 0, '不同身份不得被牵连');
});

test('同身份共享：站点条目计时后，自定义条目也显示冷却', () => {
  const sb = makeSandbox({ current: SITE });
  sb.startCookieCooldown();
  assert(sb.getCookieCooldownRemainMs(CUSTOM_SAME) > 0, '自定义条目应共享该冷却');
  assert(sb.getCookieCooldownRemainMs(SITE) > 0, '站点条目自身当然也在冷却');
  assert(sb.getCookieCooldownRemainMs(CUSTOM_OTHER) === 0, '不同身份不得被牵连');
});

// ─────────── ② 到点自动消失 ───────────
test('15s 走完即归零（未破坏原计时语义）', () => {
  const sb = makeSandbox({ current: CUSTOM_SAME });
  sb.startCookieCooldown();
  assert(sb.getCookieCooldownRemainMs(SITE) > 0, '刚提交应在冷却中');
  sb.__state.now += 15000;
  assert(sb.getCookieCooldownRemainMs(SITE) === 0, '15s 后应归零（站点与自定义同键）');
});

// ─────────── ③ 无参调用与渲染副作用保持 ───────────
test('无参调用沿用当前饼干，并触发重渲染', () => {
  const sb = makeSandbox({ current: CUSTOM_SAME });
  sb.startCookieCooldown();
  assert(sb.__state.renders === 1, '应触发一次重渲染，实际 ' + sb.__state.renders);
  assert(sb.getCookieCooldownRemainMs() > 0, '无参读取应按当前饼干判定');
  sb.__state.current = CUSTOM_OTHER;
  assert(sb.getCookieCooldownRemainMs() === 0, '切到别的身份后应显示无冷却');
});

// ─────────── ④ 名称为空/异常 → 回退条目 id ───────────
test('名称为空时回退条目 id（退化为按条目计时，不串号）', () => {
  const a = { id: 'id-a', name: '' };
  const b = { id: 'id-b', name: '' };
  const sb = makeSandbox({ current: a });
  sb.startCookieCooldown();
  const keys = Object.keys(sb.__store[KEY] || {});
  assert(keys.length === 1 && keys[0] === 'id-a', '应回退为条目 id，实际 ' + JSON.stringify(keys));
  assert(sb.getCookieCooldownRemainMs(a) > 0, '同条目仍能看到冷却');
  assert(sb.getCookieCooldownRemainMs(b) === 0, '另一条目不得被牵连');
});

// ─────────── ⑤ 过期记录仍会被清理（存储不增长） ───────────
test('过期键在下次写入时被清理', () => {
  const sb = makeSandbox({ current: CUSTOM_SAME });
  sb.startCookieCooldown();
  sb.__state.now += 60000;
  sb.__state.current = CUSTOM_OTHER;
  sb.startCookieCooldown();
  const keys = Object.keys(sb.__store[KEY] || {});
  assert(keys.length === 1 && keys[0] === 'OTHER7x', '旧身份记录应已被清理，实际 ' + JSON.stringify(keys));
});

// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass += 1; console.log('  ok  ' + name); }
    catch (err) { console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err)); process.exitCode = 1; }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  console.log(process.exitCode ? 'cookie cooldown identity contract FAILED' : 'cookie cooldown identity contract ok');
})();
