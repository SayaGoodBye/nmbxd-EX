// F5 接管域名限制：仅在 nmbxd1.com / nmbxd.com（含子域）接管
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

function sliceBetween(a, b) {
  const i = src.indexOf(a);
  assert(i >= 0, 'missing anchor: ' + a.slice(0, 40));
  const j = src.indexOf(b, i);
  assert(j > i, 'missing end anchor: ' + b.slice(0, 40));
  return src.slice(i, j);
}

const f5 = sliceBetween('function bindF5ToSeamlessRefresh() {', 'function observeSeamlessRefreshOverlays(btn) {');

// ─────────── ① 必须有域名守卫，且在最早时机 ───────────
test('F5 处理器必须校验 nmbxd 站点（非本站一律放行）', () => {
  // 非 nmbxd 站点（含野生搜索酱）不做"末页局部刷新"，走默认刷新。
  // QwQNT 下的整页刷新由宿主 main 的 before-input-event 统一负责，
  // 页面侧必须放行，否则同一次 F5 会刷两遍。
  assert(/if \(!xdexApexOfHost\(location\.hostname\)\) return;/.test(f5),
    'non-nmbxd sites must bail out with a bare return (host handles refresh)');
});

test('★ 非本站分支不得自行 reload（避免与宿主重复刷新）', () => {
  const i = f5.indexOf('xdexApexOfHost(location.hostname)');
  const head = f5.slice(0, i);
  assert(head.indexOf('location.reload()') < 0, 'no reload before the host guard');
  // 守卫之后（本站分支）才允许 reloadForQwqnt 存在
  assert(f5.indexOf('location.reload()') > i, 'page-side reload only inside the nmbxd branch');
});

test('域名守卫必须先于本站接管逻辑（局部刷新 / 按钮点击）', () => {
  const guard = f5.indexOf('xdexApexOfHost(location.hostname)');
  assert(guard > 0, 'guard must exist');
  ['isSeamlessThreadLastPage()', 'btn.click()', 'const reloadForQwqnt'].forEach((marker) => {
    const at = f5.indexOf(marker);
    assert(at > guard, marker + ' must be after the host guard');
  });
});



// ─────────── ② 判据必须是全局唯一的本站判定函数 ───────────
test('必须使用 xdexApexOfHost 作为判据（勿另写域名比较）', () => {
  assert(f5.indexOf("location.hostname === 'nmbxd") < 0, 'must not inline host comparison');
  assert(f5.indexOf('xdexApexOfHost') > 0, 'must reuse xdexApexOfHost');
});

test('xdexApexOfHost 只承认 nmbxd1.com / nmbxd.com 及其子域', () => {
  const i = src.indexOf('function xdexApexOfHost(host) {');
  assert(i > 0, 'xdexApexOfHost must exist');
  const body = src.slice(i, i + 400);
  assert(/\(\^\|\\\.\)nmbxd1\\\.com\$/.test(body), 'must accept nmbxd1.com and subdomains');
  assert(/\(\^\|\\\.\)nmbxd\\\.com\$/.test(body), 'must accept nmbxd.com and subdomains');
  assert(/return '';/.test(body), 'must return empty string for other hosts');
});

// ─────────── ③ 本站行为不得回归 ───────────
test('本站仍保留：节流、按钮点击等价、QwQNT 整页重载分支', () => {
  assert(/< 1200/.test(f5), 'must keep the 1200ms throttle');
  assert(/btn\.click\(\)/.test(f5), 'must keep button click equivalence');
  assert(/kind !== 'qwqnt'/.test(f5), 'must keep qwqnt reload branch');
});

// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass += 1; console.log('  ok  ' + name); }
    catch (err) { console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err)); process.exitCode = 1; }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  console.log(process.exitCode ? 'F5 host guard contract FAILED' : 'F5 host guard contract ok');
})();
