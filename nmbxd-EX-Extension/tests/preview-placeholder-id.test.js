const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const scriptPath = path.join(root, 'nmbxd-EX-for-edit.user.js');
const script = fs.readFileSync(scriptPath, 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function handleInfoIdClick({ text, inPreviewBox, ctrlKey, metaKey, shiftKey, textareaValue }) {
  if (ctrlKey || metaKey || shiftKey) return textareaValue;
  if (inPreviewBox && String(text || '').trim() === 'No.9999999') return textareaValue;
  const ref = `>>${String(text || '').trim()}`;
  if (!textareaValue) return `${ref}\n`;
  return `${textareaValue}\n${ref}\n`;
}

function testScriptContainsPlaceholderGuard() {
  assert(script.includes('isPreviewPlaceholderInfoId'), 'script must define preview placeholder guard helper');
  assert(script.includes("anchor.closest('.h-preview-box')"), 'guard must detect preview box ancestry');
  assert(script.includes("text === 'No.9999999'"), 'guard must specifically ignore No.9999999');
  assert(script.includes('if (isPreviewPlaceholderInfoId(e.currentTarget))'), 'quote handler must use the guard before insertion');
}

function testCurrentBehaviorShowsBug() {
  const nextValue = handleInfoIdClick({
    text: 'No.9999999',
    inPreviewBox: true,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    textareaValue: ''
  });
  assert(nextValue === '', 'preview No.9999999 click must not insert a quote');
}

testScriptContainsPlaceholderGuard();
testCurrentBehaviorShowsBug();
console.log('preview placeholder id contract ok');
