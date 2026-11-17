// 切换饼干时的焦点回归契约测试
// 对应需求：选择饼干后应立即把焦点交回发帖输入框，不等 switch_cookie 的网络往返
// （网络延迟时，旧实现在 .done 之后才 focus，期间用户无法输入）。
// 本测试钉住三件事：
//   ① switch_cookie 支持 focusBackNow，且在发起请求【之前】就恢复焦点
//   ② 恢复动作与网络成功回调解耦（请求未完成时焦点已回归）
//   ③ 成功回调仍保留一次兜底恢复（UI 更新可能打断即时恢复）
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// 提取函数体：先配对参数列表的圆括号，再找函数体花括号
// （不能直接用第一个 '{'：形如 `opts = {}` 的默认参数会误导配对）
function extractFn(name) {
  const start = src.indexOf('function ' + name);
  assert(start !== -1, name + ' 必须存在');
  const parenOpen = src.indexOf('(', start);
  let pd = 0, parenClose = -1;
  for (let i = parenOpen; i < src.length; i++) {
    if (src[i] === '(') pd++;
    else if (src[i] === ')') { pd--; if (pd === 0) { parenClose = i; break; } }
  }
  assert(parenClose !== -1, name + ' 参数列表配对失败');
  const braceOpen = src.indexOf('{', parenClose);
  let depth = 0;
  for (let i = braceOpen; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  throw new Error('unbalanced ' + name);
}

const fnSrc = extractFn('switch_cookie');
const rfSrc = extractFn('restorePostTextareaFocus');

// ─────────── ① 选项存在且位置正确 ───────────
test('switch_cookie 支持 focusBackNow 选项', () => {
  assert(/opts\.focusBackNow/.test(fnSrc), 'switch_cookie 必须读取 opts.focusBackNow');
  assert(/if \(opts\.focusBackNow\) restorePostTextareaFocus\(\);/.test(fnSrc),
    'focusBackNow 应直接调用 restorePostTextareaFocus()');
});

test('焦点恢复发生在发起网络请求之前（解耦的关键）', () => {
  const idxFocus = fnSrc.indexOf('if (opts.focusBackNow) restorePostTextareaFocus();');
  const idxGet = fnSrc.indexOf('$.get(');
  assert(idxFocus !== -1, '必须有即时恢复语句');
  assert(idxGet !== -1, '必须有 $.get 请求');
  assert(idxFocus < idxGet, `即时恢复必须在 $.get 之前（实际 focus@${idxFocus} get@${idxGet}）`);
});

// ─────────── ② 用桩驱动真实函数，验证请求未完成时焦点已回归 ───────────
test('请求挂起时焦点已回归（模拟网络延迟）', () => {
  const vm = require('vm');
  let focused = 0;
  let pending = null;                       // 捕获未 resolve 的请求
  let requested = 0;                       // 已发出的请求次数（同步可见）
  const sandbox = {
    console: { log: () => {}, warn: () => {} },
    GM_setValue: () => {},
    // 调试埋点 + 自定义饼干分支的真实依赖：桩成与焦点时序无关的最小实现
    xdexDbg: () => {},
    xdexDbgCookieTag: (c) => (c ? 'tag' : null),
    isCustomCookie: (c) => !!(c && c.custom),
    getCustomCookieValue: () => 'v',
    getCurrentCookie: () => null,
    abbreviateName: (n) => String(n),
    LAST_USED_COOKIE_KEY: 'k',
    updateCurrentCookieDisplay: () => {},
    updateDropdownUI: () => {},
    getCookiesList: () => ({}),
    removeDateString: () => {},
    updatePreviewCookieId: () => {},
    toast: () => {},
    setTimeout: () => 0,                    // 兜底恢复不执行，确保只测即时恢复
    document: { querySelector: () => ({ focus: () => { focused++; } }) },
    location: { origin: 'https://www.nmbxd1.com', hostname: 'www.nmbxd1.com', pathname: '/t/1', search: '' },
    // 桩：模拟 jQuery jqXHR —— 它本身是 thenable（Promise.resolve 会认），同时保留 done/fail。
    // ⚠ Promise.resolve(thenable) 会在**微任务**里调用 then，而本用例是同步断言，
    //   因此这里用 requested 同步记录"请求已发出"，pending 只用于模拟网络成功回调。
    $: {
      get: () => {
        requested += 1;
        const o = {
          done: (cb) => { pending = cb; return o; },
          fail: () => o,
          then: (onOk) => { pending = onOk; return o; },
          catch: () => o,
        };
        return o;
      },
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(rfSrc + '\n' + fnSrc + '\nthis.switch_cookie = switch_cookie;', sandbox);

  sandbox.switch_cookie({ id: 'abc', name: 'X' }, { silent: true, focusBackNow: true });
  assert(focused === 1, `发起请求后焦点应已回归 1 次，实际 ${focused}（请求尚未完成）`);
  assert(requested === 1, `应已发出 1 次切换请求（挂起中），实际 ${requested}`);

  // 模拟网络成功：兜底恢复被 setTimeout 吞掉，焦点次数不应变化
  if (typeof pending === 'function') pending();
  assert(focused === 1, `成功回调不应重复聚焦（兜底走 setTimeout），实际 ${focused}`);
});

test('未传 focusBackNow 时不得提前聚焦（保持既有调用方行为）', () => {
  const vm = require('vm');
  let focused = 0;
  const sandbox = {
    console: { log: () => {}, warn: () => {} },
    GM_setValue: () => {}, xdexDbg: () => {}, xdexDbgCookieTag: (c) => (c ? 'tag' : null), isCustomCookie: (c) => !!(c && c.custom), getCustomCookieValue: () => 'v', getCurrentCookie: () => null, abbreviateName: (n) => String(n), LAST_USED_COOKIE_KEY: 'k',
    updateCurrentCookieDisplay: () => {}, updateDropdownUI: () => {}, getCookiesList: () => ({}), removeDateString: () => {},
    updatePreviewCookieId: () => {}, toast: () => {}, setTimeout: () => 0,
    document: { querySelector: () => ({ focus: () => { focused++; } }) },
    location: { origin: 'https://www.nmbxd1.com', hostname: 'www.nmbxd1.com', pathname: '/t/1', search: '' },
    $: { get: () => { const o = { done: () => o, fail: () => o }; return o; } },
  };
  vm.createContext(sandbox);
  vm.runInContext(rfSrc + '\n' + fnSrc + '\nthis.switch_cookie = switch_cookie;', sandbox);
  sandbox.switch_cookie({ id: 'abc', name: 'X' }, { silent: true });
  assert(focused === 0, `未开启 focusBackNow 时不应提前聚焦，实际 ${focused}`);
});

// ─────────── ③ 兜底恢复仍在成功回调内 ───────────
test('成功回调保留兜底恢复（UI 更新可能打断即时恢复）', () => {
  assert(/setTimeout\(\(\) => \{ restorePostTextareaFocus\(\); \}, 100\)/.test(fnSrc),
    '成功回调应保留 setTimeout(restorePostTextareaFocus, 100) 兜底');
});

// ─────────── ④ 两条 UI 路径都传入 focusBackNow ───────────
test('快捷菜单与原生下拉两条路径都启用即时恢复', () => {
  assert(/restorePostTextareaFocus\(\);\s*\}\s*\);\s*\n\s*menu\.appendChild/.test(src) ||
         /closeCookieShortcutMenu\(\);\s*\n\s*if \(typeof restorePostTextareaFocus === 'function'\) restorePostTextareaFocus\(\);/.test(src),
    '快捷菜单点击后应先关菜单再即时恢复焦点');
  assert(/switch_cookie\(l\[sel\], \{ focusBackNow: true \}\)/.test(src),
    '原生下拉 change 应传 focusBackNow: true');
});

// ─────────── ⑤ 切回站点饼干：串行化后不得因回调形态不同而中断 ───────────
// 回归：曾经把 release 的 Promise 结果直接链 .done()/.fail()（那是 jQuery 的方法），
// 在 QwQNT/扩展端会抛 `runSwitch.done is not a function`，导致"从自定义饼干切不回站点饼干"。
test('切回站点饼干：串行化结果统一按 Promise 处理（不直接链 .done/.fail）', () => {
  // 必须把串行化结果先收敛成 Promise
  assert(/Promise\.resolve\(runSwitch\)/.test(fnSrc),
    'switch_cookie 必须用 Promise.resolve(runSwitch) 兼容 Promise 与 jQuery Deferred 两种形态');
  // 不得对 runSwitch 直接调用 jQuery 专有方法
  assert(!/runSwitch\s*\n?\s*\.done\(/.test(fnSrc) && !/runSwitch\.done\(/.test(fnSrc),
    'switch_cookie 不得对 runSwitch 直接链 .done()（原生 Promise 没有该方法）');
  assert(!/runSwitch\.fail\(/.test(fnSrc),
    'switch_cookie 不得对 runSwitch 直接链 .fail()');
});

test('切回站点饼干：失败判定只来源于请求本身，成功后处理抛错不得改判为失败', () => {
  // 必须两参 then：onOk 抛错不能进 onErr（用 .then().catch() 会把"成功后处理异常"误报成切换失败）
  assert(/Promise\.resolve\(runSwitch\)\.then\(onSwitchOk,\s*onSwitchFail\)/.test(fnSrc),
    '切回站点饼干必须用 .then(onSwitchOk, onSwitchFail)（两参形态）');
  assert(!/Promise\.resolve\(runSwitch\)[\s\S]{0,40}\.catch\(/.test(fnSrc),
    '不得用 .then().catch() 承接失败——onOk 内部异常会被误判为切换失败');
  // 成功处理体自身必须 try/catch，避免抛出未处理 rejection
  const okBody = fnSrc.slice(fnSrc.indexOf('const onSwitchOk'), fnSrc.indexOf('const onSwitchFail'));
  assert(/try\s*\{/.test(okBody) && /catch\s*\(/.test(okBody),
    'onSwitchOk 必须自带 try/catch（切换已成功，后处理异常不得外泄）');
  assert(/onDone && onDone\(cookie\)/.test(okBody), '切回成功必须调用 onDone');
  const failBody = fnSrc.slice(fnSrc.indexOf('const onSwitchFail'));
  assert(/onFail && onFail\(\)/.test(failBody), '切回失败必须调用 onFail');
});

test('会话对齐判定不依赖 document.cookie（httpOnly 场景必须仍能识别）', () => {
  // 主判据必须是内存标记；否则 httpOnly 的 userhash 读不到 → 判定假阴性 → restore() 冲掉对齐结果
  assert(/let sessionAlignedValue/.test(src), '必须存在 sessionAlignedValue 内存标记');
  const guard = src.slice(src.indexOf('function isSessionAlignedToCurrentCustomCookie'), src.indexOf('function isSessionAlignedToCurrentCustomCookie') + 900);
  assert(/sessionAlignedValue/.test(guard), '对齐判定必须先看内存标记');
  assert(/document\.cookie/.test(guard), 'document.cookie 只能作为兜底');
  // 「对齐成功后写入标记」的覆盖已改为**行为断言**，见 cookie-session-align-four-domains.test.js
  // （在那里跑真实 alignSessionToCookie，断言 sessionAlignedValue 变为目标值）——
  // 原先在此处钉死具体表达式（`sessionAlignedValue = result.ok`）属实现细节，已删除。
  // 切回站点饼干后必须清标记
  assert(/clearSessionAlignedMark\(\)/.test(src), '切回站点饼干必须清除对齐标记');
});

test('会话对齐判定：行为验证（document.cookie 为空时仍返回 true）', () => {
  const vm = require('vm');
  const CUSTOM = '%99xABCDEFGHIJ';
  const sandbox = {
    console: { log: () => {}, warn: () => {} },
    document: { cookie: '' },          // 模拟 httpOnly：JS 读不到 userhash
    getCurrentCookie: () => ({ custom: true, name: 'NMB' }),
    getCustomCookieValue: () => CUSTOM,
    location: { hostname: 'www.nmbxd1.com', href: 'https://www.nmbxd1.com/', origin: 'https://www.nmbxd1.com' },
  };
  vm.createContext(sandbox);
  // 只取"标记 + 判定函数"两段，避免引入整份脚本的依赖
  const markDecl = 'let sessionAlignedValue = ' + JSON.stringify(CUSTOM) + ';';
  const guardFn = src.slice(src.indexOf('function isSessionAlignedToCurrentCustomCookie'),
    src.indexOf('function isSessionAlignedToCurrentCustomCookie') + src.slice(src.indexOf('function isSessionAlignedToCurrentCustomCookie')).indexOf('\n}') + 2);
  vm.runInContext(markDecl + '\n' + guardFn + '\nthis.isAligned = isSessionAlignedToCurrentCustomCookie;', sandbox);
  assert(sandbox.isAligned() === true,
    'document.cookie 读不到时（httpOnly），只要内存标记匹配就必须判定为已对齐');
  // 标记为空时必须返回 false（防止误判导致 restore 被跳过）
  const sandbox2 = Object.assign({}, sandbox);
  vm.createContext(sandbox2);
  vm.runInContext('let sessionAlignedValue = "";\n' + guardFn + '\nthis.isAligned = isSessionAlignedToCurrentCustomCookie;', sandbox2);
  assert(sandbox2.isAligned() === false,
    '内存标记为空且 cookie 不可读时必须返回 false');
});

test('切回站点饼干：release 只调用一次（不得重复清会话）', () => {
  // 先清再切必须串行且只做一次；曾经的重复调用会让"切回后又被清掉"
  const calls = (fnSrc.match(/releaseSessionAlignment\(\)/g) || []).length;
  assert(calls === 1, `releaseSessionAlignment 在 switch_cookie 内应只调用 1 次，实际 ${calls}`);
});

test('自定义饼干发送：必须先等对齐链落定，且已对齐时不再做 jar 交换（避免互相覆盖）', () => {
  // 对齐与发送的 jar 临时交换都会改 userhash；交换结束时会"还原旧值"，
  // 若与对齐并发就会把对齐结果冲掉 → 会话回到旧身份（又是"未应用饼干"的土壤）。
  const fn = extractFn('sendSubmitRequest');
  assert(/await sessionAlignChain/.test(fn),
    'sendSubmitRequest 必须在选择发送通道前 await sessionAlignChain（消除与对齐的竞态）');
  assert(/sessionAlreadyAligned/.test(fn),
    'sendSubmitRequest 必须识别"会话已对齐"，并在已对齐时跳过 jar 临时交换');
  // 两个会改 jar 的通道都要有跳过分支
  const skips = (fn.match(/if \(sessionAlreadyAligned\)/g) || []).length;
  assert(skips >= 2, `qwqnt 与受限扩展两条通道都应跳过交换，实际 ${skips} 处`);
});
let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (e) { failed++; console.error(`FAIL - ${name}: ${e.message}`); }
}
if (failed) { console.error(`${failed} test(s) failed`); process.exit(1); }
console.log('cookie focus restore contract ok');
