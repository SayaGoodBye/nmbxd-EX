const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/content/nmbxd-EX-for-edit.user.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function extractFunction(name) {
  const start = source.indexOf(`function ${name}`);
  assert(start !== -1, `${name} must exist`);
  let depth = 0;
  let seenBody = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') {
      depth += 1;
      seenBody = true;
    } else if (ch === '}') {
      depth -= 1;
      if (seenBody && depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`${name} body not closed`);
}

function testSettingsTitleHasStableEasterEggSelector() {
  assert(source.includes('xdex-setting-title-easter-egg'), 'settings X岛-EX title should have a stable easter egg selector');
}

function testEasterEggClickWindowAndCount() {
  const body = extractFunction('installSettingPanelEasterEgg');
  assert(body.includes('3000'), 'easter egg should use a 3 second click window');
  assert(body.includes('REQUIRED_CLICKS = 3') || body.includes('const REQUIRED_CLICKS = 3'), 'easter egg should require three clicks');
  assert(body.includes('68811442'), 'easter egg should open quote tid 68811442');
  assert(body.includes('fromPOImage: true'), 'easter egg should request active image state via fromPOImage');
  assert(body.includes('__xdexSettingEasterEggBound'), 'easter egg title binding should be idempotent');
  assert(body.includes('enableQuotePreview()'), 'easter egg should initialize quote preview before opening');
  assert(body.includes('__xdexOpenQuoteByTid'), 'easter egg should use the enhanced quote preview opener');
}

function testSettingPanelInstallsEasterEggAfterRender() {
  assert(source.includes('installSettingPanelEasterEgg'), 'setting panel should install the easter egg after rendering');
}

const tests = [
  testSettingsTitleHasStableEasterEggSelector,
  testEasterEggClickWindowAndCount,
  testSettingPanelInstallsEasterEggAfterRender,
];

for (const test of tests) test();

console.log('settings easter egg contract ok');
