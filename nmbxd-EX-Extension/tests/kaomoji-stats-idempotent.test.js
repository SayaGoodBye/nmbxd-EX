// 颜文字使用次数统计：幂等合并契约
// 历史 bug：WebDAV 双向同步用 merged = R + (L - base) 做增量，base 一旦过期
// （换设备 / 远端被别的设备推进 / 基线残留已删除的别名 key），delta 会把远端已有的量
// 重复计入，导致每轮同步翻倍。实测 count 的 log2 密集分布在 47~68（约 47~68 轮），
// 反推真实次数仅 1~8；213 条里 86 条超出 2^53，整数精度彻底丢失。
// 修复：改为幂等取最大值 —— 不依赖基线正确性，重复合并 N 次结果不变。
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

// 抽出真实实现（在沙箱里跑）
const mergeSrc = sliceBetween('      const KAOMOJI_COUNT_MAX = 1e6;', '      function collectFullExportPayload(');
const healSrc = sliceBetween('        const KAO_STATS_SANE_MAX = 1e6;', '        function loadKaomojiStats() {');

const sandbox = { KAO_STATS_KEY: 'kaomojiUsageStats', GM_setValue: () => {}, console: { log: () => {} } };
const vm = require('vm');
const ctx = vm.createContext(sandbox);
vm.runInContext(mergeSrc + '\n' + healSrc + '\nthis.mergeKaomojiStats = mergeKaomojiStats; this.heal = healKaomojiStatsIfCorrupted;', ctx);
const mergeKaomojiStats = sandbox.mergeKaomojiStats;
const heal = sandbox.heal;

// ─────────── ① 幂等性（核心） ───────────
test('同一份备份重复导入 N 次不增长（旧逻辑会 N 倍累加）', () => {
  let stats = { 'k:a\nv:a': { count: 5, lastUsed: 1000 } };
  const backup = JSON.parse(JSON.stringify(stats));
  for (let n = 0; n < 100; n++) stats = mergeKaomojiStats(stats, backup);
  assert(stats['k:a\nv:a'].count === 5, 'expected 5, got ' + stats['k:a\nv:a'].count);
});

test('WebDAV 双向同步 60 轮不增长（旧逻辑会翻倍到 1e18 量级）', () => {
  const MAX = 1e6;
  const round = (local, remote) => {
    const merged = {};
    new Set(Object.keys(local).concat(Object.keys(remote))).forEach((k) => {
      const l = local[k], r = remote[k];
      if (!r) { merged[k] = l; return; }
      if (!l) { merged[k] = r; return; }
      merged[k] = {
        count: Math.min(Math.max(Number(l.count) || 0, Number(r.count) || 0), MAX),
        lastUsed: Math.max(Number(l.lastUsed) || 0, Number(r.lastUsed) || 0)
      };
    });
    return merged;
  };
  let local = { 'k:b\nv:b': { count: 1, lastUsed: 1 } };
  let remote = {};
  for (let n = 0; n < 60; n++) {
    local = round(local, remote);
    remote = JSON.parse(JSON.stringify(local));
  }
  assert(local['k:b\nv:b'].count === 1, 'expected 1 after 60 rounds, got ' + local['k:b\nv:b'].count);
});

// ─────────── ② 上限保护 ───────────
test('单边首次导入的脏数据也必须截断（曾经漏网）', () => {
  const out = mergeKaomojiStats({}, { 'k:z\nv:z': { count: 9.6e21, lastUsed: 1 } });
  assert(out['k:z\nv:z'].count === 1e6, 'must clamp to 1e6, got ' + out['k:z\nv:z'].count);
});

test('两边都有时取较大值并截断', () => {
  const out = mergeKaomojiStats(
    { 'k:y\nv:y': { count: 3, lastUsed: 10 } },
    { 'k:y\nv:y': { count: 9, lastUsed: 20 } }
  );
  assert(out['k:y\nv:y'].count === 9, 'must take max');
  assert(out['k:y\nv:y'].lastUsed === 20, 'lastUsed must take max');
});

test('lastUsed 始终取最大值（时间不可累加）', () => {
  const out = mergeKaomojiStats(
    { 'k:c\nv:c': { count: 10, lastUsed: 500 } },
    { 'k:c\nv:c': { count: 1, lastUsed: 900 } }
  );
  assert(out['k:c\nv:c'].lastUsed === 900, 'lastUsed must be max even when count favours other side');
});

// ─────────── ③ 脏数据自愈 ───────────
test('大面积超上限时按排名重标定，且相对顺序不变', () => {
  const bad = {};
  // 模拟实测分布：多数在 1e18~1e21
  for (let n = 0; n < 50; n++) bad['k:' + n + '\nv:' + n] = { count: Math.pow(10, 18 + (n % 4)), lastUsed: n };
  const healed = heal(bad);
  const before = Object.entries(bad).map(([k, v]) => ({ k, c: v.count })).sort((a, b) => b.c - a.c);
  const after = Object.entries(healed).map(([k, v]) => ({ k, c: v.count })).sort((a, b) => b.c - a.c);
  assert(before.length === after.length, 'entry count must be preserved');
  for (let n = 0; n < before.length; n++) {
    assert(before[n].k === after[n].k, 'rank order changed at index ' + n);
  }
  assert(after[0].c === before.length, 'top should score N, got ' + after[0].c);
  assert(after[after.length - 1].c >= 1, 'min score must be >= 1');
  assert(after.every((r) => r.c <= 1e6), 'all healed counts must be reasonable');
});

test('正常数据不得被误伤（少量越界只靠截断）', () => {
  const ok = {};
  for (let n = 0; n < 50; n++) ok['k:' + n] = { count: n, lastUsed: n };
  const out = heal(ok);
  assert(out === ok, 'healthy data must be returned untouched (same reference)');
});


// ─────────── ⑤ 边界折半（人工校正） ───────────
test('★ 边界条目及其之前必须额外折半，且必须在排名之前做', () => {
  // 用户按使用体感指出「( ﾟ∀。)」及之前的条目被多翻了一倍。
  // 关键：折半必须在排名之前 —— 若先按排名重标定(1..N)再折半，
  // 213/2=106 会掉到 203 之后，整体排序颠倒（已实测）。
  const i = src.indexOf('const EXTRA_HALVE_UNTIL_LABEL');
  assert(i >= 0, 'halve correction must exist');
  const byRawIdx = src.indexOf('const byRaw = keys', i);
  const rankedIdx = src.indexOf('const ranked = keys', i);
  assert(byRawIdx > 0 && rankedIdx > byRawIdx, 'halve decision must precede ranking');
  assert(/halveSet\.has\(k\) \? raw \/ 2 : raw/.test(src), 'must halve before sort');
});

test('★ 边界匹配必须精确，不得用子串（( ﾟ∀。) 是常见子串）', () => {
  const i = src.indexOf('const boundaryIdx = byRaw.findIndex');
  assert(i >= 0, 'boundary lookup must exist');
  const line = src.slice(i, src.indexOf(';', i) + 1);
  assert(/\.trim\(\) === EXTRA_HALVE_UNTIL_LABEL/.test(line), 'must compare with === after trim');
  assert(line.indexOf('indexOf(EXTRA_HALVE_UNTIL_LABEL)') < 0, 'must NOT use indexOf (substring match)');
});

test('边界折半的端到端效果：边界条目排名后移，且落在未折半区之后', () => {
  // 构造：10 个高位条目 + 边界 + 若干低位
  const mk = (n, base) => {
    const o = {};
    for (let i = 0; i < n; i++) o['sk:site:L' + i + '\nv:L' + i] = { count: base * Math.pow(2, n - i), lastUsed: i };
    return o;
  };
  const stats = Object.assign(
    mk(10, 1e15),
    { 'sk:site:( ﾟ∀。)\nv:( ﾟ∀。)': { count: 4e18, lastUsed: 1 } },
    { 'sk:site:( ﾟ∀。)7\nv:( ﾟ∀。)7': { count: 1e6, lastUsed: 1 } }
  );
  const out = heal(JSON.parse(JSON.stringify(stats)));
  const b = out['sk:site:( ﾟ∀。)\nv:( ﾟ∀。)'].count;
  const b7 = out['sk:site:( ﾟ∀。)7\nv:( ﾟ∀。)7'].count;
  // 名字像但**不是同一条**的颜文字绝不能进折半集合 —— 它排得比边界低即可
  assert(b7 < b, '( ﾟ∀。)7 (different kaomoji) must rank below the boundary, got ' + b7 + ' vs ' + b);
  // 折半只影响"多算一轮"的量级，不改变折半区内部的相对顺序
  const l0 = out['sk:site:L0\nv:L0'].count;
  const l9 = out['sk:site:L9\nv:L9'].count;
  assert(l0 > l9, 'relative order inside the halved group must be preserved: ' + l0 + ' vs ' + l9);
});

// ─────────── ④ 源级守卫 ───────────
test('WebDAV 分支不得再出现 r + (l - base) 的增量写法', () => {
  const i = src.indexOf('merged = {};\n            const keys = new Set(Object.keys(local)');
  assert(i >= 0, 'webdav merge block must exist');
  const block = src.slice(i, src.indexOf('// 推进基线到合并值', i));
  assert(block.indexOf('delta') < 0, 'delta-based accumulation must be gone');
  assert(/Math\.max\(Number\(l\.count\)/.test(block), 'must use idempotent max');
});

// ─────────── 运行 ───────────
(async () => {
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass += 1; console.log('  ok  ' + name); }
    catch (err) { console.error('  FAIL ' + name + '\n       ' + (err && err.message ? err.message : err)); process.exitCode = 1; }
  }
  console.log(`\n${pass}/${tests.length} passed`);
  console.log(process.exitCode ? 'kaomoji stats idempotency contract FAILED' : 'kaomoji stats idempotency contract ok');
})();
