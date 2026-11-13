// dom-jobs.js 契约测试（Firefox）：剪贴板降级链 + 导出落盘分支。
// 运行：node .temp/nmbxd-EX-Extension-Firefox/tests/dom-jobs.test.js
// 做法：把 dom-jobs.js 全文放进沙箱执行（补齐 DOM/剪贴板桩），再调用真实函数。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'background', 'dom-jobs.js'),
  'utf8'
);

function makeSandbox(clipboardBehavior) {
  const attempts = [];
  function ClipboardItem(data) { this.data = data; }
  ClipboardItem.supports = undefined; // Firefox 无 supports()

  const clipboard = {
    write: async ([item]) => {
      const types = Object.keys(item.data);
      attempts.push(types.join('+'));
      await clipboardBehavior(types);
    },
    writeText: async (text) => { attempts.push('writeText:' + String(text).slice(0, 20)); },
  };

  const element = () => ({
    style: {}, setAttribute() {}, select() {}, remove() {},
    getContext() { return { drawImage() {}, }; },
    click() {},
  });
  const sandbox = {
    console,
    setTimeout, clearTimeout, URL, Uint8Array, Blob, Promise, Map, Set, Array, Object, String, Number, Error,
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    ClipboardItem,
    navigator: { clipboard },
    document: {
      body: { appendChild() {}, removeChild() {} },
      documentElement: {},
      createElement: element,
      addEventListener() {}, removeEventListener() {},
      execCommand() { attempts.push('execCommand'); return true; },
    },
    createImageBitmap: async () => ({ width: 1, height: 1, close() {} }),
    OffscreenCanvas: function () {
      return { getContext: () => ({ drawImage() {} }), convertToBlob: async () => new Blob(['png'], { type: 'image/png' }) };
    },
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: 'dom-jobs.js' });
  return { sandbox, attempts };
}

(async () => {
  let failed = 0;

  // 场景 1：Firefox 常见能力 —— 拒绝 image/gif 与 web image/*，仅接受 html+plain
  {
    const { sandbox, attempts } = makeSandbox(async (types) => {
      if (types.includes('image/gif') || types.some((t) => t.startsWith('web '))) {
        throw new Error('NotAllowedError: unsupported format');
      }
    });
    const r = await sandbox.xdexRunDomJob({
      type: 'xdex:copy-animated-image',
      base64: Buffer.from('GIF89a').toString('base64'),
      format: 'gif',
      url: 'https://img.example/a.gif',
    });
    console.log('[场景1] 尝试顺序:', attempts.join(' → '));
    console.log('[场景1] method:', r.method, '| ok:', r.ok);
    const pass = r.ok === true && (r.method === 'html+plain' || r.method === 'html-selection');
    console.log(pass ? '  PASS 降级到 html+plain' : '  FAIL 未落在预期档位');
    if (!pass) failed += 1;
  }

  // 场景 2：Firefox 支持 image/gif 直写
  {
    const { sandbox, attempts } = makeSandbox(async () => {});
    const r = await sandbox.xdexRunDomJob({
      type: 'xdex:copy-animated-image',
      base64: Buffer.from('GIF89a').toString('base64'),
      format: 'gif',
      url: 'https://img.example/a.gif',
    });
    console.log('[场景2] 尝试顺序:', attempts.join(' → '), '| method:', r.method);
    const pass = r.ok === true && r.method === 'image/gif';
    console.log(pass ? '  PASS 直写 image/gif' : '  FAIL 未直写');
    if (!pass) failed += 1;
  }

  // 场景 3：纯文本复制
  {
    const { sandbox, attempts } = makeSandbox(async () => {});
    const r = await sandbox.xdexRunDomJob({ type: 'xdex:copy-text', text: 'https://www.nmbxd1.com/t/64180270' });
    console.log('[场景3] 尝试顺序:', attempts.join(' → '), '| method:', r.method);
    const pass = r.ok === true && r.method === 'url';
    console.log(pass ? '  PASS 文本复制' : '  FAIL 文本复制');
    if (!pass) failed += 1;
  }

  // 场景 4：导出落盘（扁平文件名 → 锚点下载成功）
  {
    const { sandbox } = makeSandbox(async () => {});
    const r = await sandbox.xdexRunDomJob({
      type: 'xdex:export-save',
      base64: Buffer.from('# hi').toString('base64'),
      filename: 'thread.md',
      contentType: 'text/markdown;charset=utf-8',
    });
    console.log('[场景4] export-save →', JSON.stringify(r));
    const pass = r.ok === true && r.filename === 'thread.md';
    console.log(pass ? '  PASS 扁平文件名走锚点下载' : '  FAIL');
    if (!pass) failed += 1;
  }

  // 场景 5：含子目录的文件名必须拒绝（交给 downloads API）
  {
    const { sandbox } = makeSandbox(async () => {});
    const r = await sandbox.xdexRunDomJob({
      type: 'xdex:export-save',
      base64: Buffer.from('x').toString('base64'),
      filename: 'sub/dir/thread.md',
      contentType: 'text/markdown',
    });
    console.log('[场景5] 子目录 →', JSON.stringify(r));
    const pass = r.ok === false && r.error === 'SUBDIR_NOT_SUPPORTED';
    console.log(pass ? '  PASS 子目录被拒绝并交由 downloads API' : '  FAIL');
    if (!pass) failed += 1;
  }

  if (failed) { console.error(failed + ' 项失败'); process.exit(1); }
  console.log('dom jobs contract ok');
})();
