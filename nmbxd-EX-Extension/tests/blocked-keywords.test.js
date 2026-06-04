const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const scriptPath = path.join(root, 'nmbxd-EX-for-edit.user.js');
const script = fs.readFileSync(scriptPath, 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertContains(text, message) {
  assert(script.includes(text), message);
}

function testGroupedKeywordWiring() {
  assertContains('blockedKeywords: []', 'blockedKeywords default must use grouped array storage');
  assertContains('function normalizeBlockedKeywordGroups', 'script must normalize grouped blocked keywords');
  assertContains('function buildBlockedKeywordGroupRowHtml', 'script must render blocked keyword group rows');
  assertContains('blocked-keyword-inputs-container', 'settings UI must contain grouped keyword container');
  assertContains('btn_group_blockedKeywords', 'settings UI must expose add-group button for keywords');
  assertContains('blocked-keyword-row', 'keyword group rows must use a distinct row class');
  assertContains('blocked-keyword-input', 'keyword group rows must use one input field');
  assert(!script.includes("$('#sp_blockedKeywords').val().trim()"), 'single blocked keyword input save path must be removed');
}

function testFilterWiring() {
  assertContains('function flattenBlockedKeywords', 'script must flatten grouped keyword rules for text matching');
  assertContains('function findBlockedKeywordHit', 'script must use a central keyword hit helper');
  assertContains('function getFilterIdsForElement', 'script must collect thread/reply IDs for keyword matching');
  assertContains('function isEightDigitKeyword', 'script must restrict ID matching to pure 8-digit keywords');
  assertContains('findBlockedKeywordHit(txt, blkKGroups, $el)', 'filter path must use grouped keyword hit helper');
  assert(!script.includes('const blkK = Utils.strToList(cfg.blockedKeywords);'), 'filter path must not parse blockedKeywords as a single string');
}

function testLegacyRawGroupWiring() {
  assertContains('function normalizeBlockedKeywordGroupValue', 'script must preserve each keyword group as raw input text');
  assertContains('function escapeBlockedKeywordInputToken', 'script must escape comma-containing keywords when rebuilding raw input text');
  assertContains('group.value', 'keyword groups must keep raw comma-separated input value');
  assertContains('value: rawValue', 'panel save must store raw group input value');
  assertContains('Utils.strToList(group.value)', 'filtering must parse raw group text only when deriving effective keywords');
}

function testExpectedKeywordBehavior() {
  const strToList = (s) => {
    const list = [];
    let cur = '';
    const esc = ',，\\';
    for (let i = 0; i < String(s || '').length; i += 1) {
      const ch = String(s || '')[i];
      if (ch === '\\' && i + 1 < String(s || '').length && esc.includes(String(s || '')[i + 1])) cur += String(s || '')[++i];
      else if (ch === ',' || ch === '，') { const t = cur.trim(); if (t) list.push(t); cur = ''; }
      else cur += ch;
    }
    const t = cur.trim();
    if (t) list.push(t);
    return [...new Set(list)];
  };
  const normalize = (val) => {
    const escapeToken = (token) => String(token || '').replace(/([\\,，])/g, '\\$1').trim();
    const joinTokens = (tokens) => tokens.map(escapeToken).filter(Boolean).join(',');
    if (!val) return [];
    if (typeof val === 'string') {
      const value = val.trim();
      return strToList(value).length ? [{ value }] : [];
    }
    if (!Array.isArray(val)) return [];
    return val.map((group) => {
      let value = '';
      if (typeof group === 'string') value = group.trim();
      else if (Array.isArray(group)) value = joinTokens(group);
      else if (group && typeof group.value === 'string') value = group.value.trim();
      else if (group && typeof group.text === 'string') value = group.text.trim();
      else if (group && Array.isArray(group.keywords)) value = joinTokens(group.keywords);
      else if (group && typeof group.keywords === 'string') value = group.keywords.trim();
      return { value };
    }).filter((group) => strToList(group.value).length);
  };
  const flatten = (groups) => [...new Set(normalize(groups).flatMap((group) => strToList(group.value)))];
  const firstTextHit = (text, keywords) => keywords.find((k) => text.toLowerCase().includes(k.toLowerCase())) || null;
  const isEightDigit = (keyword) => /^\d{8}$/.test(keyword);
  const hit = (text, groups, ids) => firstTextHit(text, flatten(groups)) || flatten(groups).find((k) => isEightDigit(k) && ids.includes(k)) || null;
  const legacy = '欢迎来到X岛,一个半全新的二次元泛ACG讨论区,减肥串,https://dailyakari.com/';
  const escapedPhrase = '欢迎来到X岛\\，一个半全新的二次元泛ACG讨论区';

  assert(JSON.stringify(normalize(legacy)) === JSON.stringify([{ value: legacy }]), 'legacy string must remain the first raw keyword group');
  assert(normalize([{ value: legacy }])[0].value === legacy, 'saved raw group value must round-trip without being split');
  assert(JSON.stringify(normalize([{ keywords: 'foo,bar' }, { keywords: ['baz'] }])) === JSON.stringify([{ value: 'foo,bar' }, { value: 'baz' }]), 'older keyword-array groups must migrate to raw group values');
  assert(normalize([{ keywords: ['欢迎来到X岛，一个半全新的二次元泛ACG讨论区'] }])[0].value === '欢迎来到X岛\\，一个半全新的二次元泛ACG讨论区', 'comma-containing keyword arrays must render escaped commas');
  assert(JSON.stringify(flatten([{ keywords: ['欢迎来到X岛，一个半全新的二次元泛ACG讨论区'] }])) === JSON.stringify(['欢迎来到X岛，一个半全新的二次元泛ACG讨论区']), 'escaped migrated keywords must stay one keyword after parsing');
  assert(normalize(escapedPhrase)[0].value === escapedPhrase, 'manually escaped comma must remain visible after normalization');
  assert(JSON.stringify(flatten([{ value: escapedPhrase }])) === JSON.stringify(['欢迎来到X岛，一个半全新的二次元泛ACG讨论区']), 'manually escaped comma must parse as one complete phrase');
  assert(hit('欢迎来到X岛', [{ value: escapedPhrase }], []) === null, 'escaped full phrase must not block partial prefix only');
  assert(hit('一个半全新的二次元泛ACG讨论区', [{ value: escapedPhrase }], []) === null, 'escaped full phrase must not block partial suffix only');
  assert(flatten([{ value: legacy }]).includes('欢迎来到X岛'), 'raw legacy group must still parse comma-separated keywords for filtering');
  assert(hit('contains bar', [{ value: 'foo,bar' }], []) === 'bar', 'text keyword match must still work');
  assert(hit('欢迎来到X岛，一个半全新的二次元泛ACG讨论区', [{ value: legacy }], []) === '欢迎来到X岛', 'legacy raw first group must match body content');
  assert(hit('plain text', [{ value: '12345678' }], ['12345678']) === '12345678', '8-digit keyword must match thread/reply ID');
  assert(hit('plain text', [{ value: '1234567,123456789' }], ['12345678']) === null, '7/9-digit keywords must not use ID matching');
}

testGroupedKeywordWiring();
testFilterWiring();
testLegacyRawGroupWiring();
testExpectedKeywordBehavior();
console.log('blocked keyword grouping contract ok');
