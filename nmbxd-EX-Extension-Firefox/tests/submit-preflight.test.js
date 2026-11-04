const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const script = fs.readFileSync(path.join(root, 'nmbxd-EX-for-edit.user.js'), 'utf8').replace(/\r\n/g, '\n');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function extractFunctionDeclarations(source, functionName) {
  const declarations = [];
  const marker = `function ${functionName}(`;
  let searchFrom = 0;
  while (true) {
    const start = source.indexOf(marker, searchFrom);
    if (start === -1) break;
    const bodyStart = source.indexOf('{', start);
    let depth = 0;
    let quote = '';
    let escaped = false;
    let templateExpressionDepth = 0;
    for (let i = bodyStart; i < source.length; i++) {
      const ch = source[i];
      const next = source[i + 1];
      if (quote) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (quote === '`' && ch === '$' && next === '{') {
          templateExpressionDepth++;
          depth++;
          i++;
        } else if (ch === quote && (quote !== '`' || templateExpressionDepth === 0)) quote = '';
        else if (quote === '`' && ch === '}' && templateExpressionDepth > 0) {
          templateExpressionDepth--;
          depth--;
        }
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '/' && next === '/') { i = source.indexOf('\n', i); if (i === -1) break; continue; }
      if (ch === '/' && next === '*') { i = source.indexOf('*/', i + 2); if (i === -1) break; i++; continue; }
      if (ch === '{') depth++;
      if (ch === '}' && --depth === 0) {
        declarations.push(source.slice(start, i + 1));
        searchFrom = i + 1;
        break;
      }
    }
  }
  return declarations;
}

function makeFile(name, size, format, lastModified = 1) {
  return { name, size, lastModified, format, type: `image/${format}` };
}

function loadHarness(file, options = {}) {
  const fileInput = { files: [file], addEventListener() {} };
  const form = {
    action: '/Home/Forum/doReplyThread.html',
    method: 'POST',
    querySelector(selector) {
      return selector.indexOf('file') !== -1 ? fileInput : null;
    }
  };
  const calls = { fetch: [], convert: 0, compress: 0, clears: 0 };
  const toasts = [];
  const code = [
    extractFunctionDeclarations(script, 'showSubmitPreflightStatus')[0],
    extractFunctionDeclarations(script, 'isSubmitNetworkError')[0],
    extractFunctionDeclarations(script, 'formatSubmitError')[0],
    'async ' + extractFunctionDeclarations(script, 'prepareImageBeforeSubmit')[0],
    extractFunctionDeclarations(script, 'rememberPreparedSubmitImage')[0],
    'async ' + extractFunctionDeclarations(script, 'doSubmit')[0],
    'this.exports = { doSubmit, prepareImageBeforeSubmit, rememberPreparedSubmitImage };'
  ].join('\n');
  const context = {
    console,
    form,
    SettingPanel: { defaults: { interceptReplyFormAutoCompress: options.autoCompress !== false }, key: 'xdex-settings' },
    GM_getValue: () => ({}),
    SUBMIT_IMAGE_LIMIT_BYTES: 2048 * 1024,
    detectImageFormat: async (f) => f.format,
    convertWebpToAcceptedFormat: async (f) => {
      calls.convert++;
      if (options.convertDelay) await new Promise((resolve) => setTimeout(resolve, options.convertDelay));
      if (options.failConvert) throw new Error('转换失败：不支持的 WebP');
      return makeFile(f.name.replace(/\.\w+$/, '.png'), options.convertedSize == null ? f.size : options.convertedSize, 'png');
    },
    compressImageForRetry: async () => {
      calls.compress++;
      if (options.failCompress) throw new Error('压缩失败');
      return makeFile('compressed.png', options.compressedSize == null ? 1024 : options.compressedSize, 'png');
    },
    cloneFormDataWithImage: (fd, image) => ({ source: fd, image }),
    beginSubmitImageProcessing: () => { form.__processing = true; },
    finishSubmitImageProcessing: () => { form.__processing = false; },
    toast: (msg, duration, toastOptions) => toasts.push({ msg, duration, options: toastOptions }),
    clearSubmitPreflightStatus: () => { calls.clears++; },
    computeSubmitRequestTimeoutMs: () => 1000,
    refreshSubmitLockTimer: () => {},
    clearSubmitLockTimer: () => {},
    SUBMIT_NETWORK_UNKNOWN_MSG: '网络异常，结果未知：请刷新页面确认是否已发出，避免重复提交。',
    SUBMIT_IMAGE_PROCESSING_TIMEOUT_MS: options.preflightTimeoutMs || 80,
    SUBMIT_IMAGE_PROCESSING_TIMEOUT_MSG: '发送前处理超时（180 秒），本次未发送。请手动压缩/转换图片后重试。',
    classifySubmitResponse: () => ({ kind: 'unknown' }),
    DOMParser: class { parseFromString() { return {}; } },
    fetch: async (url, opts) => {
      calls.fetch.push(opts.body);
      if (options.networkError) throw new TypeError('Failed to fetch');
      return { text: async () => '<html></html>' };
    },
    AbortController,
    setTimeout,
    clearTimeout,
    isFinite
  };
  vm.createContext(context);
  vm.runInContext(code, context, { filename: 'submit-preflight-helpers.js' });
  return { api: context.exports, form, fileInput, calls, toasts };
}

function testSourceContracts() {
  assert(script.includes('const SUBMIT_IMAGE_LIMIT_BYTES = 2048 * 1024;'), 'image limit must be a single named constant');
  assert((script.split('2048 * 1024').length - 1) === 1, 'image limit must not be re-inlined as 2048 * 1024 literals');

  const doSubmit = extractFunctionDeclarations(script, 'doSubmit')[0];
  const prepare = extractFunctionDeclarations(script, 'prepareImageBeforeSubmit')[0];
  assert(doSubmit.includes('if (!isRetry && !prepared) {'), 'pre-flight must only run on the first, unprepared submit');
  assert(doSubmit.includes('const prep = await Promise.race(['), 'doSubmit must race pre-flight against the wall-clock timeout');
  assert(doSubmit.includes('prepareImageBeforeSubmit(fd, token)'), 'doSubmit must pass the cancellation token to pre-flight');
  assert(doSubmit.includes('SUBMIT_IMAGE_PROCESSING_TIMEOUT_MS'), 'pre-flight timeout must be a named constant');
  assert(doSubmit.includes('if (prep && prep.cancelled) return;'), 'late pre-flight results must be discarded');
  assert(doSubmit.indexOf('prepareImageBeforeSubmit(fd, token)') < doSubmit.indexOf('refreshSubmitLockTimer(form);'), 'pre-flight must finish before network timers start');
  assert(doSubmit.indexOf('prepareImageBeforeSubmit(fd, token)') < doSubmit.indexOf('form.__submitUnknown = false;'), 'unknown-outcome reset must happen only after pre-flight succeeds');
  assert(prepare.includes('发送前处理期间图片已被更换'), 'pre-flight must abort when the selected image changes mid-processing');

  assert(prepare.includes("actualFormat === 'webp'"), 'pre-flight must detect static WebP');
  assert(prepare.includes("actualFormat === 'animated-webp'"), 'pre-flight must detect animated WebP');
  assert(prepare.includes("actualFormat === 'heic'"), 'pre-flight must detect HEIC');
  assert(prepare.includes('cfg.interceptReplyFormAutoCompress'), 'size pre-compression must respect the auto-compress setting');
  assert(prepare.includes('beginSubmitImageProcessing(form);'), 'pre-flight must keep the submit lock while processing');
  assert(prepare.includes('rememberPreparedSubmitImage(file, outFile);'), 'pre-flight must cache the processed image');
  assert(prepare.includes('form.__preparedImageChangeBound'), 'pre-flight must bind file change invalidation');
  assert(prepare.includes('if (isCancelled()) return { fd, prepared: false, cancelled: true };'), 'pre-flight must bail out after cancellation before locking/caching');
  assert(prepare.includes('if (!isCancelled()) finishSubmitImageProcessing(form);'), 'late pre-flight results must not clear a newer attempt lock');

  assert(script.includes("const SUBMIT_NETWORK_UNKNOWN_MSG = '网络异常，结果未知：请刷新页面确认是否已发出，避免重复提交。';"), 'network failures must use the unknown-outcome wording');
  assert(script.includes('const SUBMIT_IMAGE_PROCESSING_TIMEOUT_MS = 180000;'), 'pre-flight timeout must be 180 seconds');
  const statusFn = extractFunctionDeclarations(script, 'showSubmitPreflightStatus')[0];
  assert(statusFn.includes("key: 'send-status'"), 'pre-flight status must reuse the immediate send-status toast node');
  assert(prepare.indexOf('status(startMsg)') < prepare.indexOf('beginSubmitImageProcessing(form)'), 'pre-flight status must appear before expensive processing starts');

  const compressFn = extractFunctionDeclarations(script, 'compressImageForRetry')[0];
  assert(compressFn.includes('notify = toast'), 'compression helper must accept a notifier while keeping toast as default');
  assert(compressFn.includes('notify(`GIF压缩中'), 'GIF progress must route through the notifier');
  assert(compressFn.includes('notify(`APNG压缩中'), 'APNG progress must route through the notifier');

  const retryFormData = extractFunctionDeclarations(script, 'createContentRetryFormData')[0];
  assert(retryFormData.includes('form.__preparedImage'), 'text retries must reuse the pre-flight image instead of the original');
  assert(retryFormData.includes('current.lastModified === cached.lastModified'), 'cached image reuse must verify the input still holds the same file');

  const intercept = extractFunctionDeclarations(script, 'interceptReplyForm')[0];
  assert(intercept.includes("errorKind === 'image-format' && !isRetry && !prepared"), 'pre-flight conversion must prevent a second format conversion');
  assert(intercept.includes('if (file && !isRetry && !prepared) {'), 'pre-flight compression must prevent a second size compression');
  assert(intercept.includes('} else if (isRetry || prepared) {'), 'prepared oversize images must show the manual-compression message');
  assert(intercept.includes("runImageProcessingWithTimeout('图片格式转换'"), 'format retry must be time-limited');
  assert(intercept.includes("runImageProcessingWithTimeout('图片压缩'"), 'size retry must be time-limited');
  assert(intercept.includes("runImageProcessingWithTimeout(\n                    'GIF 修复'"), 'GIF repair retry must be time-limited');
  assert(intercept.includes('请更换图片，或手动'), 'image-processing timeouts must instruct the user to replace or manually process the image');
  assert(intercept.includes('reencodeErr && reencodeErr.message'), 'GIF repair failures must surface the timeout message');

  const retryHelper = extractFunctionDeclarations(script, 'runImageProcessingWithTimeout')[0];
  assert(retryHelper.includes('Promise.race(['), 'retry helper must race against a wall-clock timer');
  assert(retryHelper.includes('__imageProcessingTimeout'), 'retry helper must mark timeout errors distinctly');
  assert(retryHelper.includes('token.cancelled = true'), 'retry helper must cancel the token on timeout');
}

async function testBehavior() {
  // 1) 小尺寸、可接受格式：不做任何处理，首次请求就是原图
  {
    const original = makeFile('a.jpg', 1000, 'jpeg');
    const h = loadHarness(original);
    await h.api.doSubmit({ original: true });
    assert(h.calls.fetch.length === 1, 'small acceptable image must submit once');
    assert(h.calls.fetch[0].original === true, 'small acceptable image must upload unchanged');
    assert(h.calls.convert === 0 && h.calls.compress === 0, 'small acceptable image must not be converted/compressed');
    assert(!h.form.__preparedImage, 'small acceptable image must not populate the cache');
    assert(!h.toasts.some((t) => /发送前处理/.test(t.msg)), 'small acceptable image must not show a pre-flight status');
    assert(h.calls.clears >= 1, 'receiving a response must clear the send-status toast');
  }

  // 2) 小尺寸 WebP：首次请求前就转 PNG
  {
    const original = makeFile('a.webp', 1000, 'webp');
    const h = loadHarness(original);
    await h.api.doSubmit({ original: true });
    assert(h.calls.convert === 1, 'WebP must be converted before the first upload');
    assert(h.calls.fetch.length === 1, 'WebP conversion must not add an extra upload');
    assert(h.calls.fetch[0].image && /\.png$/.test(h.calls.fetch[0].image.name), 'first upload must carry the converted PNG');
    assert(h.form.__preparedImage && h.form.__preparedImage.file, 'WebP conversion must populate the cache');
    assert(h.toasts.some((t) => t.options && t.options.key === 'send-status' && /发送前处理：服务器不接受 WebP/.test(t.msg)), 'WebP pre-flight must show an immediate status toast');
    assert(h.toasts.some((t) => /发送前处理完成：已处理至/.test(t.msg)), 'pre-flight completion status must be shown');
  }

  // 3) 超过 2048KB：开启自动压缩时首次请求就是压缩图
  {
    const original = makeFile('big.jpg', 3 * 1024 * 1024, 'jpeg');
    const h = loadHarness(original);
    await h.api.doSubmit({ original: true });
    assert(h.calls.compress === 1, 'oversized image must be compressed before the first upload');
    assert(h.calls.fetch[0].image.size === 1024, 'first upload must carry the compressed image');
    assert(h.toasts.some((t) => /发送前处理：图片 .* 超过 2048KB，正在压缩/.test(t.msg)), 'oversize pre-flight must announce compression');
  }

  // 4) 关闭自动压缩：超限图保持原样（仅服务端拒绝后再走旧逻辑）
  {
    const original = makeFile('big.jpg', 3 * 1024 * 1024, 'jpeg');
    const h = loadHarness(original, { autoCompress: false });
    await h.api.doSubmit({ original: true });
    assert(h.calls.compress === 0, 'auto-compress off must not pre-compress');
    assert(h.calls.fetch[0].original === true, 'auto-compress off must upload the original');
  }

  // 5) 转换失败：不发起任何请求，给出错误提示
  {
    const original = makeFile('a.webp', 1000, 'webp');
    const h = loadHarness(original, { failConvert: true });
    h.form.__submitUnknown = true; // 上一次提交结果未知
    await h.api.doSubmit({ original: true });
    assert(h.calls.fetch.length === 0, 'failed pre-flight must not upload the original');
    assert(h.calls.clears >= 1, 'failed pre-flight must clear the processing status');
    assert(h.form.__submitUnknown === true, 'failed pre-flight must keep the previous unknown-outcome warning');
    assert(h.toasts.some((t) => t.options && t.options.type === 'error' && /转换失败/.test(t.msg)), 'failed pre-flight must surface the conversion error');
  }

  // 6) 同一张图重复提交：复用缓存，不重复转换
  {
    const original = makeFile('a.webp', 1000, 'webp');
    const h = loadHarness(original);
    await h.api.doSubmit({ original: true });
    await h.api.doSubmit({ original: true });
    assert(h.calls.convert === 1, 'same file must be converted only once');
    assert(h.calls.fetch.length === 2, 'both attempts must still submit');
    assert(h.calls.fetch[1].image === h.form.__preparedImage.file, 'second attempt must reuse the cached converted file');
  }

  // 7) 非法词文本重试：FormData 重建时携带预检后的图片
  {
    const original = makeFile('a.webp', 1000, 'webp');
    const prepared = makeFile('a.png', 900, 'png');
    const form = {
      __currentFile: original,
      __preparedImage: { name: original.name, size: original.size, lastModified: original.lastModified, file: prepared },
      querySelector(selector) {
        return selector.indexOf('file') !== -1 ? { files: [this.__currentFile] } : null;
      }
    };
    class FD {
      constructor(source) {
        this.map = new Map([['content', 'old'], ['image', source.__currentFile]]);
      }
      set(key, value) { this.map.set(key, value); }
      get(key) { return this.map.get(key); }
    }
    const code = extractFunctionDeclarations(script, 'createContentRetryFormData')[0] + '\nthis.exports = { createContentRetryFormData };';
    const context = { form, FormData: FD };
    vm.createContext(context);
    vm.runInContext(code, context, { filename: 'submit-preflight-retry-formdata.js' });
    const retryFd = context.exports.createContentRetryFormData(form, 'new content');
    assert(retryFd.get('image') === prepared, 'text retry must carry the prepared image');
    assert(retryFd.get('content') === 'new content', 'text retry must still replace the content');

    const other = makeFile('other.jpg', 555, 'jpeg');
    form.__currentFile = other;
    const retryFd2 = context.exports.createContentRetryFormData(form, 'x');
    assert(retryFd2.get('image') === other, 'a different selected file must not use the stale cache');
  }

  // 8) 处理期间换图：放弃本次结果，不发送旧图
  {
    const original = makeFile('a.webp', 1000, 'webp');
    const h = loadHarness(original, { convertDelay: 30 });
    const pending = h.api.doSubmit({ original: true });
    await new Promise((resolve) => setTimeout(resolve, 5));
    const replacement = makeFile('b.webp', 2000, 'webp', 2);
    h.fileInput.files = [replacement];
    await pending;
    assert(h.calls.fetch.length === 0, 'image replaced during pre-flight must not send the stale image');
    assert(h.toasts.some((t) => /图片已被更换/.test(t.msg)), 'image replacement must surface an explicit error');
    assert(!h.form.__preparedImage, 'replaced image must not leave a stale prepared cache');
  }

  // 9) 网络层失败：结果可能已到达服务器，必须保留「未知」标记
  {
    const original = makeFile('a.jpg', 1000, 'jpeg');
    const h = loadHarness(original, { networkError: true });
    h.form.__submitUnknown = false;
    await h.api.doSubmit({ original: true });
    assert(h.form.__submitUnknown === true, 'network failure must mark a potentially-reached request as unknown');
    assert(h.calls.fetch.length === 1, 'network failure must still attempt the request');
    assert(h.toasts.some((t) => /网络异常，结果未知/.test(t.msg)), 'network failure must warn about the unknown outcome');
  }

  // 10) 预检超时：按时解锁、不发送；迟到的处理结果不得写缓存/状态
  {
    const original = makeFile('slow.webp', 1000, 'webp');
    const h = loadHarness(original, { convertDelay: 300 });
    h.form.__submitUnknown = false;
    const startedAt = Date.now();
    await h.api.doSubmit({ original: true });
    const elapsed = Date.now() - startedAt;
    assert(elapsed < 250, 'pre-flight timeout must release the submit path without waiting for the codec');
    assert(h.calls.fetch.length === 0, 'timed-out pre-flight must not upload');
    assert(h.form.__processing === false, 'timed-out pre-flight must clear the processing lock');
    assert(!h.form.__preparedImage, 'timed-out pre-flight must not write a cache entry');
    assert(h.toasts.some((t) => /发送前处理超时/.test(t.msg)), 'timed-out pre-flight must show a timeout error');
    assert(h.calls.clears >= 1, 'timed-out pre-flight must clear the processing status toast');
    await new Promise((resolve) => setTimeout(resolve, 350));
    assert(h.calls.fetch.length === 0, 'late codec result must not trigger an upload after timeout');
    assert(!h.form.__preparedImage, 'late codec result must not write a cache entry after timeout');
    assert(!h.toasts.some((t) => /发送前处理完成/.test(t.msg)), 'late codec result must not overwrite the status toast after timeout');
  }

  // 11) 重试处理超时助手：成功透传结果，超时用 error 提示更换图片
  {
    const helperSrc = extractFunctionDeclarations(script, 'runImageProcessingWithTimeout')[0] + '\nthis.exports = { runImageProcessingWithTimeout };';
    const helperContext = {
      SUBMIT_IMAGE_PROCESSING_TIMEOUT_MS: 50,
      setTimeout,
      clearTimeout,
      console
    };
    vm.createContext(helperContext);
    vm.runInContext(helperSrc, helperContext, { filename: 'submit-image-retry-timeout.js' });
    const runTimed = helperContext.exports.runImageProcessingWithTimeout;
    const fast = await runTimed('测试处理', async () => 'ok');
    assert(fast === 'ok', 'retry helper must pass through a normal result');
    let timedOut = null;
    try {
      await runTimed('测试处理', () => new Promise((resolve) => setTimeout(() => resolve('late'), 200)));
    } catch (err) {
      timedOut = err;
    }
    assert(timedOut && /超时/.test(timedOut.message), 'retry helper must reject on timeout');
    assert(/请更换图片，或手动压缩\/转换后重试/.test(timedOut.message), 'retry timeout must instruct the user to replace or manually process the image');
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  console.log('submit preflight contract ok');
}

(async () => {
  testSourceContracts();
  await testBehavior();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
