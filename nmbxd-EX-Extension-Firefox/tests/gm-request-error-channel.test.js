// GM_xmlhttpRequest 错误通道契约（三扩展构建共享 gm-compat.js）
//
// 背景（真实故障）：WebDAV 检查 https://webdav.vsinger.hn.cn/ 时显示
//   "异常响应 HTTP undefined"
// 根因不是 HTTP 状态码，而是**后台失败被当成成功回传**：
//   · 后台 handleRequest 里 fetch 抛 NetworkError → 消息处理器 catch 后
//     sendResponse({ ok:false, error })  ← 该对象没有 status 字段
//   · gm-compat 的回调只判断 `if (!response)`，于是 {ok:false} 落到 onload
//   · 业务层读到 response.status === undefined → 拼出 "HTTP undefined"
//
// 本测试锁定三条不变量：
//   I1  后台错误对象（{ok:false,error}）必须走 onerror，绝不 onload
//   I2  后台超时对象（{ok:false,timeout:true}）必须走 ontimeout
//   I3  正常响应（{ok:true,status:...}）仍走 onload，且 status 原样透传
//
// 三个扩展构建的 gm-compat.js 是同一份文件（字节相同），故只测一份并校验三份一致。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const builds = ['nmbxd-EX-Extension', 'nmbxd-EX-Extension-Firefox', 'nmbxd-EX-Extension-Firefox115'];
const repoRoot = path.resolve(root, '..');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

const GM_PATH = path.join(root, 'src/content/gm-compat.js');
const GM_SRC = fs.readFileSync(GM_PATH, 'utf8');

// 从 gm-compat 里截出 GM_xmlhttpRequest 的完整实现（用于行为测试）
function extractGmXmlhttpRequest() {
  const start = GM_SRC.indexOf('root.GM_xmlhttpRequest = function GM_xmlhttpRequest');
  assert(start !== -1, 'GM_xmlhttpRequest must exist in gm-compat');
  const braceOpen = GM_SRC.indexOf('{', start);
  let depth = 0;
  for (let i = braceOpen; i < GM_SRC.length; i++) {
    if (GM_SRC[i] === '{') depth++;
    else if (GM_SRC[i] === '}') { depth--; if (depth === 0) return GM_SRC.slice(start, i + 1); }
  }
  throw new Error('unbalanced GM_xmlhttpRequest');
}

// 构造一个最小沙箱：只提供 GM_xmlhttpRequest 运行所需的依赖桩
function runGmRequest(responseStub) {
  const calls = [];
  const sandbox = {
    console,
    Promise,
    setTimeout,
    clearTimeout,
    Uint8Array,
    Blob: function Blob() {},
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    __response: responseStub,
  };
  // 依赖桩：isRuntimeAvailable / chrome.runtime / base64ToBytes / getRuntimeLastError 等
  const prelude = `
    var markedInvalid = false;
    function isRuntimeAvailable() { return true; }
    function markExtensionContextInvalidated() { markedInvalid = true; }
    function getRuntimeLastError() { return null; }
    function runPageFetchRequest() { return false; }
    function base64ToBytes(b64) { return new Uint8Array(0); }
    var chrome = {
      runtime: {
        id: 'test-id',
        sendMessage: function (msg, cb) { cb(__response); }
      }
    };
    var root = { GM_xmlhttpRequest: null };
  `;
  vm.createContext(sandbox);
  vm.runInContext(prelude + '\n' + extractGmXmlhttpRequest(), sandbox, { filename: 'gm.js' });

  sandbox.root.GM_xmlhttpRequest({
    method: 'GET',
    url: 'https://example.test/x',
    headers: {},
    responseType: 'text',
    timeout: 5000,
    onload: (r) => calls.push({ kind: 'onload', status: r.status }),
    onerror: (e) => calls.push({ kind: 'onerror', message: e && e.message ? String(e.message) : String(e) }),
    ontimeout: () => calls.push({ kind: 'ontimeout' }),
  });
  return calls;
}

// ---------- I1：后台网络错误必须走 onerror ----------
test('I1 后台 {ok:false,error} 走 onerror，而不是 onload', () => {
  const calls = runGmRequest({ ok: false, error: 'NetworkError when attempting to fetch resource.' });
  assert(calls.length === 1, `应只触发一次回调，实际 ${calls.length}：${JSON.stringify(calls)}`);
  assert(calls[0].kind === 'onerror', `必须走 onerror，实际 ${calls[0].kind}（若为 onload 会重现 "HTTP undefined"）`);
  assert(/NetworkError/.test(calls[0].message), `错误原因必须透传，实际 "${calls[0].message}"`);
});

// ---------- I2：后台超时必须走 ontimeout ----------
test('I2 后台 {ok:false,timeout:true} 走 ontimeout', () => {
  const calls = runGmRequest({ ok: false, timeout: true, error: '请求超时（5000ms）' });
  assert(calls.length === 1, `应只触发一次回调，实际 ${calls.length}`);
  assert(calls[0].kind === 'ontimeout', `必须走 ontimeout，实际 ${calls[0].kind}`);
});

// ---------- I3：有 status 的响应一律走 onload，含 4xx ----------
// fetch 的 response.ok 只覆盖 200–299，但 401/403/404/405 对 WebDAV 是正常语义
// （目录需认证 / 无 index / 文件未创建），必须带真实 status 走 onload。
// 曾因按 ok 分流，把 401 误报成「请求失败」（本仓库真实回归）。
[200, 401, 403, 404, 405].forEach((code) => {
  test(`I3 有 status 的响应走 onload 且 status 透传（${code}）`, () => {
    const calls = runGmRequest({ ok: code >= 200 && code < 300, status: code, statusText: '', response: 'body' });
    assert(calls.length === 1, `应只触发一次回调，实际 ${calls.length}`);
    assert(calls[0].kind === 'onload', `${code} 必须走 onload（4xx 是正常 HTTP 响应），实际 ${calls[0].kind}`);
    assert(calls[0].status === code, `status 必须透传为 ${code}，实际 ${calls[0].status}`);
  });
});

// ---------- 源码级：ok === false 的分支必须早于 onload ----------
test('源码契约：ok===false 判定必须出现在 onload 调用之前', () => {
  const src = extractGmXmlhttpRequest();
  const iGuard = src.indexOf('!hasHttpStatus');
  const iOnload = src.indexOf('details.onload({');
  assert(iGuard !== -1, '必须存在「无 status 即失败」的分支');
  assert(iOnload !== -1, '必须存在 details.onload 调用');
  assert(iGuard < iOnload, '失败分支必须早于 onload，否则失败响应仍会被当作成功');
});

// ---------- 三构建共享同一份 gm-compat ----------
test('三扩展构建的 gm-compat.js 字节一致（改一处即三处生效）', () => {
  const hashes = builds.map((b) => {
    const p = path.join(repoRoot, b, 'src/content/gm-compat.js');
    assert(fs.existsSync(p), `缺少 ${b}/src/content/gm-compat.js`);
    return fs.readFileSync(p, 'utf8');
  });
  assert(hashes[0] === hashes[1], 'Chrome 与 Firefox(128+) 的 gm-compat 不一致');
  assert(hashes[0] === hashes[2], 'Chrome 与 Firefox(115) 的 gm-compat 不一致');
});

// ---------- 业务层：status 缺失时必须给可判读原因，而不是 "HTTP undefined" ----------
test('WebDAV 检查在 status 缺失时不得输出 "HTTP undefined"', () => {
  const us = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');
  const i = us.indexOf('async function checkWebdavConnection');
  assert(i !== -1, 'checkWebdavConnection 必须存在');
  const end = us.indexOf('\n  function setWebdavStatus', i);
  const body = us.slice(i, end === -1 ? i + 8000 : end);
  assert(body.indexOf('未拿到 HTTP 状态') !== -1, '必须有 status 缺失的专门文案');
  // 断言两个兜底分支都被 Number.isFinite 守卫
  const guards = (body.match(/!Number\.isFinite\(Number\(/g) || []).length;
  assert(guards >= 2, `目录与同步文件两处兜底都应加守卫，实际 ${guards} 处`);
});

// ---------- 运行 ----------
let passed = 0;
const failures = [];
for (const [name, fn] of tests) {
  try { fn(); console.log('  PASS', name); passed++; }
  catch (err) { console.error('  FAIL', name, '\n      ', err.message); failures.push(name); }
}
console.log('');
if (failures.length) {
  console.error(`${failures.length} / ${tests.length} 项失败`);
  process.exit(1);
}
console.log('gm-request error channel contract ok');
