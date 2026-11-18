// 版块页/时间线「加入浏览历史」按钮 + 「获取最新回复」同步历史：契约测试
// 需求要点：
//   ① 按钮位于「获取最新回复」按钮**之前**，样式/图标与既有图标按钮一致（SVG 用 history 图标）
//   ② 点击 → 该串计入浏览历史：已存在只更新位置层（不虚增访问次数以外的语义错误），不存在则用卡片正文新建
//   ③ 页数按"发言后定位所在页"同一算法：REPLIES_PER_PAGE = 19 → 末页 = ceil(回复数 / 19)
//   ④ 最近阅读位置 = 该串在版块页显示的**最近一条回复**（.h-threads-item-reply 的 data-threads-id）
//   ⑤ 「获取最新回复」成功后同样更新字段，但不新建条目、不增加访问次数
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

// ─────────── ① 结构/接线守卫（静态） ───────────
test('按钮图标与类名：使用 history 图标，类名与既有图标按钮同风格', () => {
  assert(/const XDEX_ICON_HISTORY = '<svg class="xdex-icon-history"/.test(src), '必须有 history 图标常量');
  // 图标应为给定的 path 三连（时钟+回转箭头）
  assert(/M3 3v5h5/.test(src) && /M3\.05 13A9 9 0 1 0 6 5\.3L3 8/.test(src) && /M12 7v5l4 2/.test(src),
    'history 图标路径应与指定图标一致');
  const fn = extractFn('syncBoardThreadHistoryButton');
  assert(/className = 'xdex-icon-btn xdex-board-history-btn'/.test(fn), '按钮类名须含 xdex-icon-btn');
  assert(/min-width:1em;text-align:center;margin-left:4px;vertical-align:middle;/.test(fn), '内联样式须与既有按钮一致');
  assert(/innerHTML = XDEX_ICON_HISTORY/.test(fn), '须使用 history 图标');
});

test('位置：紧接「获取最新回复」按钮之前', () => {
  const fn = extractFn('syncBoardThreadHistoryButton');
  assert(/refreshBtn\.previousElementSibling !== histBtn/.test(fn), '应重排到刷新按钮之前');
  assert(/refreshBtn\.insertAdjacentElement\('beforebegin', histBtn\)/.test(fn), '必须以 beforebegin 插入');
  // 绑定顺序：先创建/重排刷新按钮，再同步历史按钮
  const bind = extractFn('bindBoardThreadRefreshButtons');
  assert(/syncBoardThreadHistoryButton\(item, infoBar, tid, btn\)/.test(bind), '刷新按钮建好后须调用历史按钮同步');
});

// ─────────── ② 页数与最近回复（纯逻辑，DOM 桩） ───────────
function makeRow(opts) {
  const o = opts || {};
  const replies = (o.replyIds || []).map((rid, i) => ({
    getAttribute: (a) => (a === 'data-threads-id' ? String(rid) : null),
    querySelector: (sel) => (sel === '.h-threads-info-createdat'
      ? { getAttribute: (a) => (a === 'data-xdex-original-time' ? (o.replyTimes && o.replyTimes[i]) || '' : null) }
      : null)
  }));
  return {
    getAttribute: (a) => (a === 'data-threads-id' ? String(o.tid || '') : null),
    textContent: o.text || '',
    querySelector: (sel) => (String(sel).indexOf('h-threads-tips') >= 0
      ? (o.omitted === undefined ? null : { textContent: '回应有 ' + o.omitted + ' 篇被省略。要阅读所有回应请按下回应链接。' })
      : null),
    querySelectorAll: (sel) => {
      if (String(sel).indexOf('.h-threads-item-reply') >= 0) {
        // 防御式实现用"实际展示条数"作为 tips 的加数 → 允许测试显式放大展示条数
        if (o.shownReplies && o.shownReplies > replies.length) {
          const extra = [];
          for (let i = replies.length; i < o.shownReplies; i += 1) {
            extra.push({ getAttribute: () => String(90000000 + i), querySelector: () => null });
          }
          return replies.concat(extra);
        }
        return replies;
      }
      return [];
    }
  };
}

function makeSandbox() {
  const sandbox = {
    console: { log: () => {}, warn: () => {} },
    document: { createElement: () => ({ innerHTML: '', querySelector: () => null }) }
  };
  const ctx = vm.createContext(sandbox);
  vm.runInContext(
    "const BOARD_HISTORY_REPLIES_PER_PAGE = 19;\n" +
    "function parseThreadHistorySiteTime(v){ return v ? 1700000000000 : 0; }\n" +
    extractFn('readBoardThreadRowSnapshot') + '\n' +
    "this.snap = readBoardThreadRowSnapshot;", ctx);
  return sandbox;
}

test('最近阅读位置 = 卡片显示的最后一条回复', () => {
  const sb = makeSandbox();
  const row = makeRow({ tid: '69806170', replyIds: ['69807117', '69807637'] });
  const snap = sb.snap(row, '69806170');
  assert(snap.lastReplyId === '69807637', '应取最后一条回复 69807637，实际 ' + snap.lastReplyId);
});

test('页数按 19 条/页计算：总数 = tips 的 N + 实际展示条数', () => {
  const sb = makeSandbox();
  // [omitted, shownReplies, 期望总数, 期望页数]
  const cases = [
    [0, 5, 5, 1], [14, 5, 19, 1], [15, 5, 20, 2], [33, 5, 38, 2],
    [34, 5, 39, 3], [95, 5, 100, 6], [3966, 5, 3971, 209]
  ];
  cases.forEach(([omitted, shown, total, expect]) => {
    const row = makeRow({ tid: '1', replyIds: [], omitted, shownReplies: shown });
    const snap = sb.snap(row, '1');
    assert(snap.replyCount === total, '省略 ' + omitted + ' + 展示 ' + shown + ' → 总数应为 ' + total + '，实际 ' + snap.replyCount);
    assert(snap.page === expect, total + ' 条回复应落在第 ' + expect + ' 页，实际 ' + snap.page);
  });
});

test('无 tips 时标记为未知，不臆断总数', () => {
  const sb = makeSandbox();
  const row = makeRow({ tid: '1', replyIds: ['11', '12', '13'] });
  const snap = sb.snap(row, '1');
  assert(snap.replyCountKnown === false, '无 tips 应标记未知');
  assert(snap.replyCount === 0, '未知时不得给出数字');
  assert(snap.page === 1, '未知时页数先按 1（交由调用方决定是否 API 复核）');
});

test('防御：刷新后展示 8 条时，加数用实测 8 而非写死的 5', () => {
  const sb = makeSandbox();
  const row = makeRow({ tid: '1', replyIds: ['1','2','3','4','5','6','7','8'], omitted: 3966, shownReplies: 8 });
  const snap = sb.snap(row, '1');
  assert(snap.shownReplies === 8, '应记录实际展示条数，实际 ' + snap.shownReplies);
  assert(snap.replyCount === 3974, '总数应为 3966 + 8 = 3974，实际 ' + snap.replyCount);
});

test('防御：展示条数为 0 时不得得出 N+5 的臆断值', () => {
  const sb = makeSandbox();
  const row = makeRow({ tid: '1', replyIds: [], omitted: 100, shownReplies: 0 });
  const snap = sb.snap(row, '1');
  assert(snap.replyCount === 100, '应为 100 + 0，实际 ' + snap.replyCount);
});

// ─────────── ③ 写入语义（更新 vs 新建） ───────────
test('已存在条目：写位置层，且访问次数 +1（再次访问）', () => {
  const add = extractFn('addBoardThreadToHistory');
  assert(add.indexOf('if (old) {') >= 0, 'must branch on existing entry');
  assert(add.indexOf('setThreadHistoryPosEntry(key, {') >= 0, 'existing entry must use position layer');
  assert(add.indexOf('Number(old.visitCount) || 0) + 1') >= 0, 'visit count must increase by 1');
  assert(add.indexOf('invalidateThreadHistoryPosCache()') >= 0, 'must invalidate position cache');
});

test('不存在条目：用卡片正文新建，正文为空则不建', () => {
  const add = extractFn('addBoardThreadToHistory');
  assert(/buildThreadHistoryRecordFromApiThread\(/.test(add), '须复用既有记录构建器（同源清洗）');
  assert(/upsertThreadHistoryRecord\(record, \{/.test(add), '须走整库写入');
  assert(/if \(!record \|\| \(!record\.contentHtml && !record\.contentText\)\)/.test(add), '正文为空必须拒绝新建');
  assert(/record\.lastReadReplyId = snap\.lastReplyId/.test(add), '新建须带上最近阅读回复');
});

test('墓碑守卫：回收站里的串不复活', () => {
  const add = extractFn('addBoardThreadToHistory');
  assert(/const tomb = \(store\.tombstones \|\| \{\}\)\[key\]/.test(add), '须查墓碑');
  assert(/if \(tomb && !store\.items\[key\]\)/.test(add), '墓碑存在且条目不存在 → 拒绝');
});

// ─────────── ④ 获取最新回复 → 更新字段 ───────────
test('刷新同步：取末页最后一条回复作为最近阅读位置', () => {
  const fn = extractFn('syncThreadHistoryFromBoardRefresh');
  assert(/for \(let i = replies\.length - 1; i >= 0; i -= 1\)/.test(fn), '须从末尾回溯找最后一条回复');
  assert(/Number\(r\.id\) === 9999999/.test(fn), '须过滤占位回复 9999999');
  assert(/rid: lastReplyId/.test(fn), '位置层 rid 须写为最新回复');
});

test('刷新同步：无条目时新建，正文为空则放弃', () => {
  const fn = extractFn('syncThreadHistoryFromBoardRefresh');
  assert(fn.indexOf('buildThreadHistoryRecordFromApiThread') >= 0, 'must reuse record builder');
  assert(fn.indexOf('payload.threadObj') >= 0, 'must use threadObj from page=1 response');
  assert(fn.indexOf('board-refresh-create') >= 0, 'must write through upsert');
  assert(fn.indexOf('record.contentHtml && !record.contentText') >= 0, 'must skip empty content');
});

test('刷新同步：已有条目位置层更新且访问次数 +1', () => {
  const fn = extractFn('syncThreadHistoryFromBoardRefresh');
  assert(fn.indexOf('Number(old.visitCount) || 0) + 1') >= 0, 'vc must increase by 1');
  assert(fn.indexOf('rid: lastReplyId') >= 0, 'rid must be latest reply');
  assert(fn.indexOf('mv: Math.max') >= 0, 'maxVisitedPage must be monotonic max');
  assert(fn.indexOf('lk: Math.max') >= 0, 'lastKnownPage must be max');
});

test('浏览时间 = 点击时刻（不得用回复发布时间）', () => {
  const addFn = extractFn('addBoardThreadToHistory');
  assert(addFn.indexOf('const visitedAt = Date.now();') >= 0, 'button path: visitedAt must be click time');
  assert(addFn.indexOf('snap.lastReplyTime') < 0, 'must not use reply publish time as visit time');
  const refFn = extractFn('syncThreadHistoryFromBoardRefresh');
  assert(refFn.indexOf('const visitedAt = Date.now();') >= 0, 'refresh path: visitedAt must be trigger time');
  assert(refFn.indexOf('lastReplyTime || Date.now()') < 0, 'must not fall back to reply publish time');
});
// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass += 1; console.log('  ok  ' + name); }
    catch (err) { console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err)); process.exitCode = 1; }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  console.log(process.exitCode ? 'board history button contract FAILED' : 'board history button contract ok');
})();
