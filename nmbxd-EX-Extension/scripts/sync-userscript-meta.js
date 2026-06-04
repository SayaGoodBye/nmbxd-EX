const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'src', 'content', 'nmbxd-EX-for-edit.user.js');
const gmCompatPath = path.join(root, 'src', 'content', 'gm-compat.js');
const manifestPath = path.join(root, 'manifest.json');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function extractUserscriptHeader(sourceText) {
  const match = String(sourceText || '').match(/\/\/\s*==UserScript==[\s\S]*?\/\/\s*==\/UserScript==/);
  if (!match) throw new Error('Userscript header not found');
  return match[0];
}

function readMetaValue(header, key) {
  const match = String(header || '').match(new RegExp('^//\\s*@' + key + '\\s+(.+)$', 'm'));
  return match ? String(match[1] || '').trim() : '';
}

function toArrayLiteralLines(text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => `    ${JSON.stringify(line)}`)
    .join(',\n');
}

function replaceGeneratedBlock(code, header) {
  const name = readMetaValue(header, 'name');
  const version = readMetaValue(header, 'version');
  if (!name) throw new Error('Userscript @name not found');
  if (!version) throw new Error('Userscript @version not found');

  const generated = [
    '  // BEGIN GENERATED USERSCRIPT META',
    '  const scriptMetaStr = [',
    toArrayLiteralLines(header),
    "  ].join('\\n');",
    `  const scriptMeta = { name: ${JSON.stringify(name)}, version: ${JSON.stringify(version)} };`,
    '  // END GENERATED USERSCRIPT META'
  ].join('\n');

  const blockPattern = /  \/\/ BEGIN GENERATED USERSCRIPT META[\s\S]*?  \/\/ END GENERATED USERSCRIPT META/;
  if (!blockPattern.test(String(code || ''))) throw new Error('Generated metadata block not found');
  return String(code || '').replace(blockPattern, generated);
}

function assertChromeManifestVersion(version) {
  const text = String(version || '').trim();
  const parts = text.split('.');
  const valid = parts.length >= 1 && parts.length <= 4 && parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;
    if (part.length > 1 && part.startsWith('0')) return false;
    const value = Number(part);
    return Number.isInteger(value) && value >= 0 && value <= 65535;
  });

  if (!valid || parts.every((part) => Number(part) === 0)) {
    throw new Error(`Userscript @version is not a valid Chrome manifest version: ${text}`);
  }
}

function syncManifestVersion(manifestText, version) {
  assertChromeManifestVersion(version);
  const manifest = JSON.parse(manifestText);
  manifest.version = version;
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

const header = extractUserscriptHeader(read(userscriptPath));
const version = readMetaValue(header, 'version');
const nextGmCompat = replaceGeneratedBlock(read(gmCompatPath), header);
fs.writeFileSync(gmCompatPath, nextGmCompat, 'utf8');
fs.writeFileSync(manifestPath, syncManifestVersion(read(manifestPath), version), 'utf8');

console.log('CRX userscript metadata and manifest version synced');
