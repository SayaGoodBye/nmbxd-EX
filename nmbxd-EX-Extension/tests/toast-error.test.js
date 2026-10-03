// 错误 toast 契约测试：红框 + 驻留到下次交互 + 可被下一条 error 顶掉 + 30s 保险 + 无监听泄漏
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(condition, message) { if (!condition) throw new Error(message); }

// ── 抽取 toast 基础设施（toastQueue..dismissOnNextInteraction）并在沙箱内执行 ──
function loadToastModule() {
  const s0 = src.indexOf('const toastQueue = []');
  assert(s0 !== -1, 'toastQueue must exist');
  const s1 = src.indexOf('const Utils = {', s0);
  assert(s1 !== -1, 'Utils block must follow toast infra');
  const block = src.slice(s0, s1);

  const listeners = { pointerdown: [], keydown: [] };
  const element = { style: {}, __xdexImmediateToastSeq: 0 };
  const timers = [];
  const sb = {
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    window: { setTimeout: (fn, ms) => { sb.__timers.push({ fn, ms, cancelled: false }); return sb.__timers.length; },
              clearTimeout: (id) => { const t = sb.__timers[id - 1]; if (t) t.cancelled = true; } },
    console: { log() {}, warn() {} },
    document: {
      body: { append() {}, remove() {} },
      addEventListener(ev, fn) { listeners[ev].push(fn); },
      removeEventListener(ev, fn) { const a = listeners[ev]; const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); },
    },
    $: (sel) => {
      const jq = makeJQ(element);
      // '#xdex-immediate-toast-...' 查询：模拟「节点已存在」语义（复用路径）
      jq.length = (typeof sel === 'string' && sel.startsWith('#')) ? 1 : 1;
      return jq;
    },
  };
  function makeJQ(node) {
    const jq = {
      length: 1, 0: node,
      css(k, v) {
        if (typeof k === 'string') { node.style[k] = v; return jq; }
        Object.assign(node.style, k); return jq;
      },
      text(t) { node._text = t; return jq; },
      show() { return jq; }, stop() { return jq; }, fadeIn() { return jq; },
      fadeOut(d, cb) { node.fadeOutCalled = true; node.fadeOutCb = cb; return jq; },
      delay() { return jq; }, append() {},
    };
    return jq;
  }
  sb.globalThis = sb;
  sb.__element = element;
  sb.__timers = timers;
  vm.createContext(sb);
  vm.runInNewContext(block + '\nthis.toast=toast; this.showImmediateToast=showImmediateToast; this.dismissOnNextInteraction=dismissOnNextInteraction; this.ERROR_TOAST_MAX_HOLD_MS=ERROR_TOAST_MAX_HOLD_MS; this.ERROR_TOAST_FADE_AFTER_INTERACT_MS=ERROR_TOAST_FADE_AFTER_INTERACT_MS;', sb, { filename: 'toast.js' });
  return { sb, listeners, element };
}

function testErrorForcesImmediateChannel() {
  const start = src.indexOf('function toast(msg, duration = 1800, options = {})');
  assert(start !== -1, 'toast() must exist');
  const body = src.slice(start, src.indexOf('function showNextToast', start));
  assert(body.includes("options.type === 'error'"), 'toast() must branch on options.type === error');
  assert(/showImmediateToast\(msg, duration, options\.key, 'error'\)/.test(body), 'error must be forwarded to the immediate channel with the error type');
}

function testErrorToastHasRedBorder() {
  const start = src.indexOf('function showImmediateToast(');
  const body = src.slice(start, src.indexOf('const ERROR_TOAST_MAX_HOLD_MS'));
  assert(body.includes('#e74c3c'), 'error toast must use the red border colour');
  assert(body.includes('fontWeight'), 'error toast must bold its text');
}

function testErrorToastPersistsUntilInteraction() {
  const { sb, listeners, element } = loadToastModule();
  sb.toast('饼干失效', 1800, { type: 'error', key: 'refresh-status' });
  assert(listeners.pointerdown.length === 1 && listeners.keydown.length === 1,
    'error toast must install pointer/key early-dismiss listeners (no focusin: script-driven focus changes must not dismiss it)');
  assert(sb.__element.fadeOutCalled === undefined, 'error toast must NOT schedule an auto fadeOut immediately');
}

function testNewerErrorToastReplacesOlderOne() {
  const { sb, listeners, element } = loadToastModule();
  sb.toast('错误一', 1800, { type: 'error', key: 'refresh-status' });
  const seq1 = element.__xdexImmediateToastSeq;
  sb.toast('错误二', 1800, { type: 'error', key: 'refresh-status' });
  assert(element.__xdexImmediateToastSeq === seq1 + 1, 'second error must bump the generation');
  // 顶掉语义：旧监听即刻清理、新监听重新挂载 → 每类监听恰好 1 个（无泄漏堆积）
  assert(listeners.pointerdown.length === 1 && listeners.keydown.length === 1,
    'replacing an error toast must tear down the old persistence listeners immediately');
}

function testFocusinMustNotDismiss() {
  // 实测回归：发送失败后脚本恢复输入框焦点会触发 focusin，把还没看到的错误提示提前关掉
  const { sb, listeners, element } = loadToastModule();
  sb.toast('错误', 1800, { type: 'error', key: 'refresh-status' });
  // 模拟 focusin：监听列表里不应存在 focusin 处理器（未安装即不会误关）
  assert(!listeners.focusin, 'focusin must not be a dismiss trigger');
  // 即便外部触发 focus 类事件，toast 仍在（fadeOut 未被调用、监听还在）
  assert(sb.__element.fadeOutCalled === undefined, 'toast must survive focus changes');
  assert(listeners.pointerdown.length === 1, 'pointer listener must remain installed');
}

function testInteractionStartsGraceNotImmediateDismiss() {
  const { sb, listeners, element } = loadToastModule();
  sb.toast('错误', 1800, { type: 'error', key: 'refresh-status' });
  // 武装期（1s）内触发不关闭
  listeners.pointerdown[0]({ button: 0 });
  assert(element.fadeOutCalled === undefined, 'pointerdown during arm delay must NOT dismiss');
  // 模拟 1s 武装期结束
  const arm = sb.__timers.find(t => t.ms === 1000);
  assert(arm, 'arm timer (1000ms) must be scheduled');
  arm.fn();
  // 武装后：右键/中键不关闭、不启动宽限
  listeners.pointerdown[0]({ button: 2 });
  assert(element.fadeOutCalled === undefined, 'right-click must NOT dismiss');
  listeners.pointerdown[0]({ button: 1 });
  assert(element.fadeOutCalled === undefined, 'middle-click must NOT dismiss');
  // 武装后左键点击 → 不立即消失，启动 5s 宽限
  listeners.pointerdown[0]({ button: 0 });
  assert(element.fadeOutCalled === undefined, 'interaction must start a grace window, not dismiss immediately');
  const grace = sb.__timers.filter(t => t.ms === 5000);
  assert(grace.length === 1, `grace timer (5000ms) must be scheduled after interaction, got ${grace.length}`);
  // 宽限期满 → 渐隐
  grace[0].fn();
  assert(element.fadeOutCalled === true, 'grace expiry must run the fadeOut path');
}
const testInteractionDismissesErrorToast = testInteractionStartsGraceNotImmediateDismiss;

function testNonErrorReuseClearsRedBorder() {
  const { sb, listeners, element } = loadToastModule();
  sb.toast('错误', 1800, { type: 'error', key: 'refresh-status' });
  sb.toast('普通提示', 900, { queue: false, key: 'refresh-status' });
  assert(!element.style.border, 'non-error reuse must clear the red border');
  assert(listeners.pointerdown.length === 0, 'non-error reuse must clear persistence listeners');
}

function testArmDelayGuardsImmediateDismiss() {
  // 实测回归：错误出现在提交动作后，用户继续打字/点击的 keydown/pointerdown 会立刻把提示关掉。
  // 修复：挂载后 1s 武装期内忽略交互事件，3s 渐隐照常。
  const { sb, listeners, element } = loadToastModule();
  sb.toast('含有非法词语', 0, { type: 'error', key: 'send-error' });
  // 武装期内触发 pointerdown/keydown → 不应关闭
  listeners.pointerdown[0]({ button: 0 });
  listeners.keydown[0]({ key: 'a' });
  assert(element.fadeOutCalled === undefined, 'armed-period interactions must NOT dismiss the toast');
  assert(listeners.pointerdown.length === 1, 'listeners must remain installed during arm delay');
  // 无操作 30s 驻留到期 → 渐隐
  const hold = sb.__timers.find(t => t.ms === 30000);
  assert(hold, 'hold timer (30000ms) must be scheduled');
  hold.fn();
  assert(element.fadeOutCalled === true, 'after the 30s hold the toast must fade out');
}

function testDismissReasonLogging() {
  // 排障需求：每次 error toast 消失必须在控制台输出原因（时限到期/键鼠操作/被顶掉）
  const body = src.slice(src.indexOf('function dismissOnNextInteraction'));
  assert(body.includes('关闭原因:'), 'dismiss must log the close reason');
  assert(body.includes('驻留上限'), 'natural expiry must be labelled as hold-limit');
  assert(body.includes('isTrusted='), 'pointer/keyboard reasons must include isTrusted to expose synthetic events');
  // 顶掉日志在 showImmediateToast 的节点复用分支
  const showBody = src.slice(src.indexOf('function showImmediateToast('), src.indexOf('const ERROR_TOAST_MAX_HOLD_MS'));
  assert(showBody.includes('被同 key 的新 toast 顶掉'), 'replacement path must log its own reason');
}

function testHoldSafetyCapExists() {
  // 2026-10-01 最终语义：无操作驻留 30s；交互后 5s 渐隐宽限（给足看清时间，非瞬间消失）
  assert(src.includes('ERROR_TOAST_MAX_HOLD_MS = 30000'), 'error toast must hold 30s without interaction');
  assert(src.includes('ERROR_TOAST_FADE_AFTER_INTERACT_MS = 5000'), 'after interaction, 5s grace before fade');
  const body = src.slice(src.indexOf('function dismissOnNextInteraction'));
  // 30s 计时器必须在挂载时启动（无操作路径）
  assert(/holdTimer = window\.setTimeout/.test(body), 'hold timer must be scheduled at mount');
  // 5s 宽限计时器必须在交互回调里启动（而非挂载时）——挂载区（addEventListener 之后）不应出现 FADE_AFTER_INTERACT
  const mountZone = body.slice(body.indexOf('document.addEventListener'), body.indexOf('el.__xdexToastDismissCleanup'));
  assert(!mountZone.includes('ERROR_TOAST_FADE_AFTER_INTERACT_MS'),
    'grace timer must NOT start at mount — only after interaction');
}

function testExtensionSideSupportsErrorType() {
  const gm = fs.readFileSync(path.join(root, 'src/content/gm-compat.js'), 'utf8');
  assert(gm.includes("function showExtensionToast(text, duration = 1800, type = '')"), 'extension toast must accept the error type');
  assert(gm.includes('#e74c3c'), 'extension error toast must use the red border');
  assert((gm.match(/addEventListener\('pointerdown', onPointer, true\)/g) || []).length === 1,
    'extension error toast must listen for pointer interaction');
  assert(gm.includes('setTimeout(dismiss, 30000)'), 'extension error toast must hold 30s without interaction');
  assert(gm.includes('setTimeout(dismiss, 5000)'), 'extension error toast must fade 5s after interaction');
  assert(gm.includes('armed = true; }, 1000)'), 'extension error toast must have the 1s arm delay');
}

function testRefreshStatusErrorChannel() {
  // 刷新快速队列的错误语义与全局 error 一致（无操作 30s 驻留 / 操作后 5s 渐隐）
  const fn = src.slice(src.indexOf('function showRefreshStatus('), src.indexOf('function toast(msg, duration = 1800'));
  assert(fn.includes("type"), 'showRefreshStatus must accept and forward the error type');
  assert(fn.includes("key: 'refresh-status', type"), 'error type must ride the refresh-status channel (later status toasts replace it)');
  const samples = [
    "showRefreshStatus('刷新回复失败，该串可能已被删除', 0, 'error');",
    "showRefreshStatus('刷新回复区失败', 0, 'error');",
    "showRefreshStatus('刷新失败，网络错误', 0, 'error');",
  ];
  samples.forEach(x => assert(src.includes(x), `refresh error call site missing: ${x.slice(20, 50)}…`));
  assert((src.match(/showRefreshStatus\([^)]*, 0, 'error'\)/g) || []).length === 4,
    `expected 4 migrated refresh error call sites (2x 刷新回复失败 + 回复区失败 + 网络错误)`);
}

function testSpecialBoardAndExtensionUpdateToasts() {
  // 值班室/测试板块默认发串模式提示（两处分支）+ 扩展更新后刷新提示，均需 error 通道
  assert(src.includes("toast(_boardName + '版块默认为\"发串\"模式，请注意', 0, { type: 'error', key: 'board-post-mode-notice' });"),
    'special board post-mode notice must use the error channel');
  const gm = fs.readFileSync(path.join(root, 'src/content/gm-compat.js'), 'utf8');
  assert(gm.includes("showExtensionToast('扩展已更新，刷新页面可恢复完整同步', 0, 'error')"),
    'extension-updated reminder must use the error toast channel');
}

function testMigratedErrorCallSites() {
  // 第一批迁移的代表性错误调用点（发送/图片/饼干/刷新失败路径）
  const samples = [
    "toast('回复已发送，但饼干刷新失败，请刷新页面', 0, { type: 'error' });",
    "toast('刷新失败，网络错误', 0, { type: 'error' });",
    "toast('提交可能失败，请检查网络，或者刷新后重试', 0, { type: 'error' });",
    "toast('本串默认饼干已失效，请重新选择', 0, { type: 'error' });",
  ];
  samples.forEach(s => assert(src.includes(s), `migrated call site missing: ${s.slice(0, 40)}…`));
  assert((src.match(/\{ type: 'error' \}/g) || []).length >= 15,
    `expected at least 15 migrated error call sites`);
  // 2026-10-01：中间页 errorMsg 分支（p.error 解析结果）也必须走 error 通道
  // 覆盖：图片大小关闭自动压缩 / 非非法词兜底（图片安全性审核不通过等）/ unvcode 穷尽 / 无 unvcode
  const midPage = src.match(/toast\(msg, 0, \{ type: 'error', key: 'send-error' \}\)/g) || [];
  assert(midPage.length === 4, `intermediate-page error branches must all use the error channel, got ${midPage.length}`);
}

const tests = [
  testErrorForcesImmediateChannel,
  testFocusinMustNotDismiss,
  testArmDelayGuardsImmediateDismiss,
  testDismissReasonLogging,
  testRefreshStatusErrorChannel,
  testSpecialBoardAndExtensionUpdateToasts,
  testErrorToastHasRedBorder,
  testErrorToastPersistsUntilInteraction,
  testNewerErrorToastReplacesOlderOne,
  testInteractionDismissesErrorToast,
  testNonErrorReuseClearsRedBorder,
  testHoldSafetyCapExists,
  testExtensionSideSupportsErrorType,
  testMigratedErrorCallSites,
];
for (const t of tests) t();
console.log('toast error contract ok');
