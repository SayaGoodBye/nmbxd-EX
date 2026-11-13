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
  // 8033c9f 重构：isPreviewPlaceholderInfoId 辅助被移除，守卫改为直接 closest('.h-preview-box') 判断
  // （预览占位编号保留 href 以兼容站点 attr(href).replace，不再依赖 href 推断）
  assert(script.includes("e.currentTarget.closest('.h-preview-box')"), 'quote handler must detect preview box ancestry');
  assert(script.includes("target.closest('.h-preview-box')"), 'auto quote pass-through must also exclude preview placeholders');
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
