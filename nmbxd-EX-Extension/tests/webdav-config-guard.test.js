// WebDAV 配置不被面板空值覆盖
// 症状：把 WebDAV 地址改成新值并保存后，一点"同步"就变回旧地址。
// 根因：webdavSyncNow() 开头无条件调 saveWebdavConfigFromPanel(false)，
//       而该函数读的是 $('#sp_webdavUrl').val()。面板未渲染 / 尚未回填 /
//       gm-compat 存储水合未完成（此时 GM_getValue 返回空）时读到空串或旧值，
//       于是把用户已保存的配置覆盖回去。
//       injector.ts 记录过同源事故：不要在存储水合完成前读-改-写 EX 设置。
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

function sliceBetween(a, b) {
  const i = src.indexOf(a);
  assert(i >= 0, 'missing anchor: ' + a.slice(0, 60));
  const j = src.indexOf(b, i);
  assert(j > i, 'missing end anchor: ' + b.slice(0, 60));
  return src.slice(i, j);
}

const syncNow = sliceBetween('  async function webdavSyncNow() {', '    // 与自动同步共用互斥锁');
const ensureFn = sliceBetween('  function ensureWebdavConfigInPanel() {', '  function saveWebdavConfigFromPanel(');

// ─────────── ① 同步前必须判断面板是否存在 ───────────
test('webdavSyncNow 不得无条件用面板值覆盖存储', () => {
  assert(syncNow.indexOf("saveWebdavConfigFromPanel(false);") >= 0, 'should still save when panel exists');
  assert(/\$\('#sp_webdavUrl'\)\.length\) saveWebdavConfigFromPanel\(false\);/.test(syncNow),
    'must guard with a panel-existence check before saving');
  // 裸调用（无 guard）不得存在
  const bare = /(^|\n)\s*saveWebdavConfigFromPanel\(false\);/.test(syncNow);
  assert(!bare, 'must NOT call saveWebdavConfigFromPanel unconditionally');
});

test('检查连接（btn_webdavCheck）同样不得无条件覆盖', () => {
  const i = src.indexOf("if (btn.id === 'btn_webdavCheck') {");
  assert(i >= 0, 'webdav check handler must exist');
  const block = src.slice(i, i + 800);
  assert(/\$\('#sp_webdavUrl'\)\.length\) saveWebdavConfigFromPanel\(false\);/.test(block),
    'check handler must guard the save too');
});

// ─────────── ② 回填必须考虑存储水合状态 ───────────
test('ensureWebdavConfigInPanel 必须在水合未完成且无已存值时跳过回填', () => {
  assert(/__xdexGmStorageReady/.test(ensureFn), 'must consult __xdexGmStorageReady');
  assert(/const hasSaved = /.test(ensureFn), 'must detect whether storage already has a config');
  assert(/if \(!storageReady && !hasSaved\) return;/.test(ensureFn),
    'must bail out when storage is not hydrated and nothing is saved');
  // 仍保留"空输入框才回填"的原语义
  assert(/if \(!\$url\.val\(\)\) \$url\.val\(cfg\.url\);/.test(ensureFn), 'must keep fill-only-when-empty');
});

// ─────────── ③ 不得引入新的覆盖路径 ───────────
test('WebDAV 配置写入点必须可枚举且都用 Object.assign 保留其它字段', () => {
  const stores = [...src.matchAll(/storeWebdavConfig\(([^)]*)\)/g)].map((m) => m[1].trim());
  assert(stores.length >= 3, 'expect several storeWebdavConfig call sites');
  stores.forEach((arg) => {
    const ok = arg.startsWith('Object.assign({}, cfg') || arg === 'cfg';
    assert(ok, 'unexpected storeWebdavConfig arg: ' + arg.slice(0, 60));
  });
});

test('payload.webdavConfig 导入回写仍存在（用户显式勾选时才覆盖，保留语义）', () => {
  assert(/if \(payload\.webdavConfig && typeof payload\.webdavConfig === 'object'\) \{/.test(src),
    'explicit import override must remain (opted-in behaviour)');
  assert(/report\.webdavConfig = \{ mode: 'override', changed: true \};/.test(src),
    'must keep the override report');
});

// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass += 1; console.log('  ok  ' + name); }
    catch (err) { console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err)); process.exitCode = 1; }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  console.log(process.exitCode ? 'webdav config guard contract FAILED' : 'webdav config guard contract ok');
})();
