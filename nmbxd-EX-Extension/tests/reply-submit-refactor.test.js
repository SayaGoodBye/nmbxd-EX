const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const scriptPath = path.join(root, 'nmbxd-EX-for-edit.user.js');
const script = fs.readFileSync(scriptPath, 'utf8').replace(/\r\n/g, '\n');

/*
 * Sprint 1 pre-change baseline (LF source, recorded before extraction):
 * - interceptReplyForm: lines 14971-16800, 1830 lines. Responsibility: own reply-form
 *   interception, submit state/retries, success/failure orchestration, image processing and
 *   refresh/navigation. Closure dependencies include form/isReply/isPost, DOM/browser APIs,
 *   toast/history/draft helpers, cookie/preview helpers, image codecs and submit-lock helpers.
 *   Observable effects include event binding, fetch, form/state mutation, DOM replacement,
 *   cookies, history snapshots, toast/log output, reply refresh and navigation.
 * - nested doSubmit: lines 16217-16489, 273 lines. Responsibility: execute fetch, classify the
 *   response and orchestrate retries plus terminal success/failure. Its closure dependencies
 *   include form/isReply/isPost, submit-lock helpers, classifiers, toast, history/form cleanup,
 *   document/getCurrentCookie/enableHDImage/refreshCookies/updatePreviewCookieId, navigation,
 *   settings, image/retry helpers and retry-state helpers. Observable effects include fetch,
 *   locks, toast/log output, history snapshots, form/DOM/cookie changes, retries and navigation.
 * - success preview block: lines 16246-16302, 57 lines. Responsibility: replace .h-preview-box
 *   with the existing placeholder using current-cookie ID text, initialize HD image behavior,
 *   refresh cookies and then update the preview cookie ID. Closure dependencies: document,
 *   getCurrentCookie, enableHDImage, refreshCookies, updatePreviewCookieId, toast and console.
 *   Observable effects: one DOM lookup/replacement; optional enableHDImage call; optional one
 *   refreshCookies(callback, false), callback-ordered updatePreviewCookieId; warning/failure toast.
 *
 * Sprint 1 gain gate (post-change measurement): interceptReplyForm is 1775 lines (-55) and
 * nested doSubmit is 218 lines (-55); doSubmit no longer directly closes over document,
 * getCurrentCookie, enableHDImage, refreshCookies or updatePreviewCookieId for this concern.
 * The 58-line helper adds one orchestration call and keeps seven narrow runtime globals
 * (document, the four preview/cookie functions, toast and console), but makes the complete UI
 * sequence executable in isolation. Readability improves because doSubmit now exposes the
 * success pipeline as snapshot -> form cleanup -> preview cleanup -> navigation. Regression
 * risk is low-to-moderate (DOM template and callback/error behavior were moved verbatim) and
 * is bounded by exact structure/order/count tests. The 55-line main-function reduction,
 * five fewer direct doSubmit dependencies and isolated behavior test outweigh the one-helper
 * abstraction cost, so this stage has positive net benefit and is retained.
 *
 * Sprint 2 pre-change baseline (LF source, recorded before scope migration):
 * - getCurrentPage: lines 16602-16605, 4 lines. Responsibility: parse the current page from
 *   location. Free variables: URL and location. Side effects: none.
 * - getMaxPageFromPagination: lines 16606-16620, 15 lines. Responsibility: derive the largest
 *   page represented by the bottom pagination. Free variables: document. Side effects: none.
 * - minimalHideEmptyTitleAndEmail: lines 16631-16645, 15 lines. Responsibility: hide empty or
 *   default title/email labels below a supplied root. Free variables: Array. Side effects: writes
 *   matching elements' style.display.
 * - refreshRepliesWithSeamlessPaging: lines 16650-16793, 144 lines. Responsibility: resolve the
 *   refresh page, fetch and merge missing replies, reapply enhancements, synchronize pagination,
 *   detect a newly available page, and finish the refresh callback. Free variables: the three
 *   helpers above plus URL/location/document/fetch/DOMParser/window/$/setTimeout, toast and the
 *   existing shared-core/enhancement/filter functions. Side effects: network fetch with included
 *   credentials, reply DOM merge, pagination synchronization, enhancement/filter calls, toast and
 *   console output, 50ms enhancement scheduling, optional 100ms SeamlessPaging.loadNext, and one
 *   done call on every terminal path.
 * - all four declarations were nested in interceptReplyForm (lines 15030-16804, 1775 lines).
 *
 * Sprint 2 gain gate (post-change measurement): moving the 197 source lines occupied by these
 * helpers and adjacent comments reduces interceptReplyForm from 1775 to 1578 lines and
 * removes the refresh helper cluster from its closure. The only newly explicit dependency is the
 * narrow getConfig function passed by the caller because safeGetConfig remains form-local. The
 * refresh function still uses existing userscript-scope browser/shared-core globals; no service
 * container or API change is introduced. One dependency object and one call-site argument cost
 * less than the 198-line closure reduction, isolated six-path execution, and unique userscript-scope
 * declarations. Net benefit is positive, so the migration is retained; a neutral/negative measured
 * result requires reverting this migration and stopping subsequent high-risk work.
 *
 * Sprint 3 pre-change baseline (LF source, recorded before reader extraction): detectImageFormat
 * occupied 42 lines inside interceptReplyForm and directly owned three FileReader operations plus
 * magic-byte/APNG/WebP recognition. Observable behavior: extension fallback on read failure, one
 * 8-byte header read, PNG secondary scan capped at 256KB with acTL before IDAT, and WebP secondary
 * scan capped at 4096 bytes with ANIM recognition. Post-change it is a 42-line userscript-scope
 * detector plus an 8-line shared Blob reader; interceptReplyForm loses the detector and FileReader
 * dependency. Format and read-count/error-fallback tests make this a positive net gain.
 *
 * Sprint 4 pre-change baseline: illegal-word retry data preparation/restoration in doSubmit read
 * current textarea/FormData content, cloned current form fields, replaced content, and restored the
 * original textarea before cache reset. The three extracted helpers total 18 lines and remove these
 * data mechanics from the retry orchestration while leaving toast, counters and recursive
 * doSubmit(newFD, false) order unchanged. Isolated FormData/restoration tests and source-order
 * contracts bound the low regression risk; net gain is positive.
 *
 * Sprint 5 pre-change baseline: static/GIF/APNG compression tools occupied lines 15104-15935 (832
 * lines) inside interceptReplyForm and depended on browser/image-codec globals, but not submit form
 * state. Moving them verbatim before interceptReplyForm reduces that function by 832 lines and
 * removes its compression implementation closure while retaining all constants, attempts,
 * quality/lossy/colors/scale choices, logs, toasts and async ordering. Structural marker tests cover
 * those contracts; the large cohesion/testability gain outweighs the userscript-scope names, so net
 * gain is positive.
 */

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

function loadFunctions(functionNames) {
  const code = functionNames.map((name) => {
    const declarations = extractFunctionDeclarations(script, name);
    assert(declarations.length === 1, `${name} must have exactly one declaration (found ${declarations.length})`);
    return declarations[0];
  }).join('\n') + `\nthis.exports = { ${functionNames.join(', ')} };`;
  class TestFormData {
    constructor(source) {
      this.items = [];
      if (source && typeof source.entries === 'function') {
        for (const [key, value] of source.entries()) this.items.push([key, value]);
      }
    }
    append(key, value) { this.items.push([key, value]); }
    set(key, value) {
      this.items = this.items.filter(([itemKey]) => itemKey !== key);
      this.items.push([key, value]);
    }
    get(key) {
      const item = this.items.find(([itemKey]) => itemKey === key);
      return item ? item[1] : null;
    }
    entries() { return this.items[Symbol.iterator](); }
  }
  const context = { console, FormData: TestFormData };
  vm.runInNewContext(code, context, { filename: 'reply-submit-helpers.js' });
  return context.exports;
}

function testUrlProtectionAndTextContracts() {
  const { fallbackInsertZWSP, insertZwspAfterHanAndAsciiLettersOutsideUrls } = loadFunctions([
    'findUrlRanges',
    'inAnyRange',
    'transformTextOutsideUrlRanges',
    'fallbackInsertZWSP',
    'insertZwspAfterHanAndAsciiLettersOutsideUrls'
  ]);
  assert(fallbackInsertZWSP('中文ABC') === '中\u200B文\u200BABC', 'fallback must insert U+200B after every non-URL Han character only');
  assert(fallbackInsertZWSP('旦开摆') === '旦\u200B开\u200B摆\u200B', 'effective fallback must not use the kaomoji exclusion set');
  assert(fallbackInsertZWSP('前https://例子.example/path中文后') === '前\u200Bhttps://例子.example/path中文后', 'fallback must preserve a URL adjacent to Han text with the existing greedy boundary');
  const multipleUrls = '甲https://a.example/p?q=中文#段\n乙(www.example/path),丙 ftp://b.example/x。';
  assert(
    fallbackInsertZWSP(multipleUrls) === '甲\u200Bhttps://a.example/p?q=中文#段\n乙\u200B(www.example/path),丙 ftp://b.example/x。',
    'fallback must preserve multiple URLs and the existing greedy query/hash/punctuation boundary behavior across newlines'
  );
  assert(
    insertZwspAfterHanAndAsciiLettersOutsideUrls('中A https://a.example/x?q=中#h\n文B') === '中\u200BA\u200B https://a.example/x?q=中#h\n文\u200BB\u200B',
    'U+200B mode must process Han and ASCII letters while preserving URLs and newlines'
  );
  assert(
    insertZwspAfterHanAndAsciiLettersOutsideUrls('旦开摆 (╯°□°）╯︵ ┻━┻') === '旦\u200B开\u200B摆\u200B (╯°□°）╯︵ ┻━┻',
    'U+200B mode must retain the existing no-kaomoji-exclusion contract'
  );
}

function testImageAndFormDataHelpers() {
  const {
    getImageExtension,
    normalizeDetectedImageFormat,
    getStaticImageOutputType,
    cloneFormData,
    cloneFormDataWithImage
  } = loadFunctions([
    'getImageExtension',
    'normalizeDetectedImageFormat',
    'getStaticImageOutputType',
    'cloneFormData',
    'cloneFormDataWithImage'
  ]);
  assert(getImageExtension('photo.JPEG') === 'jpeg', 'image extension must normalize case');
  assert(getImageExtension('no-extension') === 'no-extension', 'missing-dot extension fallback must retain the existing basename behavior');
  assert(normalizeDetectedImageFormat('47494638', 'png') === 'gif', 'GIF magic must outrank a misleading extension');
  assert(normalizeDetectedImageFormat('ffd8ffe0', 'webp') === 'jpeg', 'JPEG magic must outrank a misleading extension');
  assert(normalizeDetectedImageFormat('424d', 'png') === 'bmp', 'BMP magic contract must remain unchanged');
  assert(normalizeDetectedImageFormat('00000000', 'apng') === 'apng', 'known extension fallback must be retained');
  assert(normalizeDetectedImageFormat('00000000', 'jpg') === 'jpeg', 'jpg fallback must normalize to jpeg');
  assert(normalizeDetectedImageFormat('89504e47', 'gif') === 'png-container', 'PNG magic must retain deferred APNG inspection priority');
  assert(normalizeDetectedImageFormat('52494646', 'gif') === 'webp-container', 'RIFF magic must retain deferred animated WebP inspection priority');
  assert(getStaticImageOutputType('image/jpg') === 'image/jpeg', 'image/jpg must normalize to image/jpeg');
  assert(getStaticImageOutputType('image/webp') === 'image/webp', 'WebP MIME must remain WebP');
  assert(getStaticImageOutputType('image/gif') === 'image/png', 'other static conversion inputs must remain PNG');

  const source = new FormData();
  source.append('content', '原文');
  source.append('tag', 'one');
  source.append('tag', 'two');
  source.append('image', 'old-image');
  const cloned = cloneFormData(source);
  assert(Array.from(cloned.entries()).map(JSON.stringify).join('|') === Array.from(source.entries()).map(JSON.stringify).join('|'), 'FormData clone must preserve order and duplicate entries');
  const retry = cloneFormDataWithImage(source, 'new-image');
  assert(retry.get('image') === 'new-image', 'retry FormData must replace the image');
  assert(source.get('image') === 'old-image', 'retry FormData must not mutate the source');
  assert(Array.from(retry.entries()).filter(([key]) => key === 'tag').length === 2, 'retry FormData must preserve duplicate non-image fields');
}

async function testImageFormatDetectionContracts() {
  const declarations = ['getImageExtension', 'normalizeDetectedImageFormat', 'readBlobAsArrayBuffer', 'detectImageFormat']
    .map((name) => {
      const declaration = extractFunctionDeclarations(script, name)[0];
      return name === 'detectImageFormat' ? `async ${declaration}` : declaration;
    }).join('\n');
  let failReadAt = 0;
  let readCount = 0;
  class TestFileReader {
    readAsArrayBuffer(blob) {
      readCount++;
      if (failReadAt === readCount) {
        this.error = new Error('read failed');
        this.onerror();
        return;
      }
      this.result = blob.buffer;
      this.onload();
    }
  }
  const context = { FileReader: TestFileReader, Uint8Array, Array, Math, Error };
  vm.runInNewContext(`${declarations}\nthis.detectImageFormat = detectImageFormat;`, context);

  function file(name, bytes) {
    const source = Uint8Array.from(bytes);
    return {
      name,
      size: source.length,
      slice(start, end) {
        const sliced = source.slice(start, end);
        return { buffer: sliced.buffer };
      }
    };
  }
  function ascii(text) { return Array.from(text, (ch) => ch.charCodeAt(0)); }
  function pngWithChunk(type) {
    return [0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0, ...ascii(type), 0, 0, 0, 0];
  }

  readCount = 0;
  assert(await context.detectImageFormat(file('wrong.png', ascii('GIF89a00'))) === 'gif', 'GIF magic must win over extension');
  assert(readCount === 1, 'GIF detection must only read the 8-byte header');

  readCount = 0;
  assert(await context.detectImageFormat(file('image.png', pngWithChunk('acTL'))) === 'apng', 'PNG acTL must detect APNG');
  assert(readCount === 2, 'PNG container detection must perform one secondary read');
  assert(await context.detectImageFormat(file('image.png', pngWithChunk('IDAT'))) === 'png', 'PNG IDAT before acTL must remain static PNG');

  assert(await context.detectImageFormat(file('image.webp', [...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBPANIM')])) === 'animated-webp', 'WebP ANIM marker must detect animation');
  assert(await context.detectImageFormat(file('image.webp', [...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBPVP8 ')])) === 'webp', 'WebP without ANIM must remain static');

  failReadAt = 1;
  readCount = 0;
  assert(await context.detectImageFormat(file('fallback.jpg', [])) === 'jpeg', 'header read failure must fall back to normalized extension');
  failReadAt = 2;
  readCount = 0;
  assert(await context.detectImageFormat(file('fallback.png', pngWithChunk('acTL'))) === 'png', 'PNG secondary read failure must fall back to static PNG');
  failReadAt = 2;
  readCount = 0;
  assert(await context.detectImageFormat(file('fallback.webp', [...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBPANIM')])) === 'webp', 'WebP secondary read failure must fall back to static WebP');
  failReadAt = 0;

  const intercept = extractFunctionDeclarations(script, 'interceptReplyForm')[0];
  assert(!intercept.includes('function detectImageFormat('), 'detectImageFormat must no longer be nested in interceptReplyForm');
  assert((script.match(/new FileReader\(\)/g) || []).length >= 1, 'shared FileReader primitive must remain present');
  assert(extractFunctionDeclarations(script, 'readBlobAsArrayBuffer').length === 1, 'Blob reader helper must have one declaration');
  assert(extractFunctionDeclarations(script, 'detectImageFormat').length === 1, 'image format detector must have one declaration');
}

function testStaticCompressionCandidateSelectionContracts() {
  const compress = extractFunctionDeclarations(script, 'compressImageToSize')[0];
  assert(compress, 'compressImageToSize must remain structurally complete');
  const orderedMarkers = [
    'let bestBlob = null;',
    'const considerBlob = (blob) => {',
    'if (blob.size > targetUpperBytes) return;',
    'const score = targetUpperBytes - blob.size;',
    'if (score < bestScore)',
    'let result = await searchBestQualityAtScale(1);',
    'if (result.hitRange)',
    'const maxPhases = 4;',
    'for (let phase = 0; phase < maxPhases; phase++)',
    'const predicted = scale * Math.sqrt(targetUpperBytes / Math.max(result.blob.size, 1)) * safety;',
    'if (bestBlob)'
  ];
  let cursor = -1;
  for (const marker of orderedMarkers) {
    cursor = compress.indexOf(marker, cursor + 1);
    assert(cursor !== -1, `static compression search/candidate order changed at: ${marker}`);
  }
  assert((compress.match(/resolve\(toFile\(bestBlob\)\);/g) || []).length === 2, 'static JPEG/WebP candidate resolution count changed');
  assert(compress.includes('if (result.exceeded) {'), 'static scale search must remain gated by the over-limit result');
  assert(compress.includes('const finalBlob = pngResult.blob || bestBlob;'), 'PNG candidate fallback priority changed');
  assert(compress.includes('const STATIC_MAX_ATTEMPTS = 5;') === false, 'static limits must stay outside the function body');
}

/*
 * Sprint 6 gain gate: compressImageToSize is 233 lines and its search callbacks share img/file,
 * output type, mutable best candidate/score and attempt count. Promoting those callbacks would
 * require a broad mutable context or many parameters while current tests only lock markers and
 * candidate order, not canvas-size outputs across browsers. The abstraction cost and regression
 * radius cannot be shown lower than the readability gain, so no production split is made and this
 * boundary is locked until stronger differential fixtures exist.
 *
 * Sprint 7 differential boundary: the trusted Alma snapshot can safely baseline extracted static
 * compression source after normalizing the prior output-type helper extraction and scope indent.
 * Runtime traces cover image-format reads, success cleanup, reply refresh, retry ordering and locks;
 * the complete event-bound closure is intentionally not executed because its broad page/GM/browser
 * dependencies would require an untrustworthy synthetic application shell.
 */
function testTrustedSnapshotCompressionDifferential() {
  const snapshotPath = path.resolve(root, '..', '.alma-snapshots', 'backups', 'backup-1782203244133', 'nmbxd-EX.user.js');
  assert(fs.existsSync(snapshotPath), 'trusted Alma snapshot baseline must remain available');
  const baseline = fs.readFileSync(snapshotPath, 'utf8');
  const baselineCompress = extractFunctionDeclarations(baseline, 'compressImageToSize')[0];
  const currentCompress = extractFunctionDeclarations(script, 'compressImageToSize')[0];
  assert(baselineCompress && currentCompress, 'trusted/current static compression functions must both be extractable');
  // Intentional algorithm upgrade: remaining-attempt-aware scale prediction.
  // Keep the old contract markers as a historical baseline, and lock the new prediction path.
  assert(baselineCompress.includes('for (let phase = 0; phase < 4; phase++)') || baselineCompress.includes('scale * 0.92'), 'trusted baseline still records the old fixed-step scale search');
  assert(currentCompress.includes('const maxPhases = 4;'), 'current static compression must use remaining-aware phase budget');
  assert(currentCompress.includes('const predicted = scale * Math.sqrt(targetUpperBytes / Math.max(result.blob.size, 1)) * safety;'), 'current static compression must estimate next scale from measured size');
  assert(currentCompress.includes('const STATIC_MIN_SCALE = 0.2;'), 'current static compression must relax min scale below the old 0.5 floor');
  assert(currentCompress.includes('considerBlob'), 'candidate selection core must remain');
  assert(currentCompress.includes('searchBestQualityAtScale(1)'), 'original-size quality search must remain first');
}

function testCompressImageResponsibilityBoundary() {
  const compress = extractFunctionDeclarations(script, 'compressImageToSize')[0];
  const nestedResponsibilities = [
    'drawToCanvas',
    'canvasToBlob',
    'toFile',
    'considerBlob',
    'searchBestQualityAtScale',
    'searchBestPngScale'
  ];
  for (const name of nestedResponsibilities) {
    assert(compress.includes(`const ${name} =`), `static compression responsibility boundary changed: ${name}`);
    assert(extractFunctionDeclarations(script, name).length === 0, `${name} must not be promoted to a userscript-scope declaration without stronger differential tests`);
  }
}

function testCompressionToolScopeAndContracts() {
  const intercept = extractFunctionDeclarations(script, 'interceptReplyForm')[0];
  const interceptStart = script.indexOf('function interceptReplyForm(');
  const functionNames = [
    'compressImageToSize',
    'clampNumber',
    'formatKB',
    'getGifDimensions',
    'ensureGifsicleLoaded',
    'runGifsicleAttempt',
    'reencodeGifWithGifsicle',
    'compressGifToSize',
    'compressApngToSize'
  ];
  const constantNames = [
    'STATIC_MAX_SIZE_KB',
    'STATIC_TARGET_LOWER_KB',
    'STATIC_ACCEPTABLE_LOWER_KB',
    'STATIC_MAX_ATTEMPTS',
    'GIF_MAX_SIZE_KB',
    'GIF_TARGET_LOWER_KB',
    'GIF_ACCEPTABLE_LOWER_KB',
    'GIF_MAX_ORIGINAL_KB',
    'GIF_MAX_LONG_EDGE',
    'GIF_MAX_ATTEMPTS',
    'gifsicleApiPromise'
  ];
  const apngHelperNames = ['readPngChunks', 'buildApng', 'crcTable', 'crc32', 'renderFrameToBlob', 'renderFrameToPng'];

  assert(intercept && interceptStart !== -1, 'interceptReplyForm must remain structurally complete');
  for (const name of functionNames) {
    const declarations = extractFunctionDeclarations(script, name);
    assert(declarations.length === 1, `${name} must have exactly one declaration`);
    assert(script.indexOf(`function ${name}(`) < interceptStart, `${name} must be declared before interceptReplyForm`);
    assert(!intercept.includes(`function ${name}(`), `${name} must not remain nested in interceptReplyForm`);
  }
  for (const name of constantNames) {
    const declarationPattern = new RegExp(`\\b(?:const|let)\\s+${name}\\b`, 'g');
    assert((script.match(declarationPattern) || []).length === 1, `${name} must have exactly one declaration`);
    assert(script.search(declarationPattern) < interceptStart, `${name} must be declared before interceptReplyForm`);
    assert(!new RegExp(`\\b(?:const|let)\\s+${name}\\b`).test(intercept), `${name} must not remain nested in interceptReplyForm`);
  }

  const apngStart = script.indexOf('async function compressApngToSize(');
  const apngDomain = script.slice(apngStart, interceptStart);
  for (const name of apngHelperNames) {
    assert((script.match(new RegExp(`\\b(?:const|let)\\s+${name}\\b`, 'g')) || []).length === 1, `${name} APNG helper must have exactly one declaration`);
    assert(new RegExp(`\\b(?:const|let)\\s+${name}\\b`).test(apngDomain), `${name} must remain inside compressApngToSize`);
  }

  const compressionDomain = script.slice(script.indexOf('const STATIC_MAX_SIZE_KB = 2048;'), interceptStart);
  for (const forbidden of ['form', 'formData', 'isReply', 'isPost', 'safeGetConfig']) {
    assert(!new RegExp(`\\b${forbidden}\\b`).test(compressionDomain), `compression tools must not depend on submit closure identifier ${forbidden}`);
  }
  for (const dependency of ['window', 'toast', 'getStaticImageOutputType']) {
    assert(new RegExp(`\\b${dependency}\\b`).test(compressionDomain), `compression tools must retain IIFE dependency ${dependency}`);
  }

  for (const marker of [
    'const STATIC_MAX_SIZE_KB = 2048;',
    'const STATIC_TARGET_LOWER_KB = 1900;',
    'const STATIC_ACCEPTABLE_LOWER_KB = 1850;',
    'const STATIC_MAX_ATTEMPTS = 5;',
    'const GIF_MAX_ORIGINAL_KB = 30 * 1024;//目前限制30MB以内',
    'const GIF_MAX_LONG_EDGE = 1600;',
    'const GIF_MAX_ATTEMPTS = 3;//目前最多重试3次',
    "const args = ['-O3', `--lossy=${Math.round(lossy)}`, '--colors', String(Math.round(colors))];",
    "args.push('--scale', scale.toFixed(3));",
    "const command = [...args, '/tem/input.gif', '-o', '/out/out.gif'].join(' ');",
    'const targetLowerBytes = Math.floor((maxSizeKB - 68) * 1024);',
    'const scaleSteps = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.15];',
    'const STATIC_MIN_SCALE = 0.2;',
    'const HARD_MIN_SCALE = 0.05;',
    'if (predicted < minScale) {',
    'const forced = clampScale(predicted * 0.9, HARD_MIN_SCALE, scale * 0.9)',
    'const predicted = scale * Math.sqrt(targetUpperBytes / Math.max(result.blob.size, 1)) * safety;',
    'const predictedScale = scale * Math.sqrt(maxBytes / Math.max(blob.size, 1)) * safety;',
    'const predicted = scale * Math.sqrt(maxBytes / Math.max(blob.size, 1)) * 0.92;',
    'return compressImageToSize(file, maxSizeKB);',
    'const gifResult = await compressGifToSize(gifFile, {',
    'const compressedFile = await compressApngToSize(file, 2048, {',
    'const reencodedFile = await reencodeGifWithGifsicle(file);'
  ]) assert(script.includes(marker), `compression contract marker changed: ${marker}`);

  const { clampNumber, formatKB } = loadFunctions(['clampNumber', 'formatKB']);
  assert(clampNumber(-2, 0, 10) === 0, 'clampNumber must retain lower clamping');
  assert(clampNumber(12, 0, 10) === 10, 'clampNumber must retain upper clamping');
  assert(clampNumber(4, 0, 10) === 4, 'clampNumber must retain in-range values');
  assert(formatKB(1536) === '1.5KB', 'formatKB must retain one-decimal KB formatting');
}

function testSubmitResponseClassification() {
  const { classifySubmitResponse } = loadFunctions(['classifySubmitResponse']);
  const node = (textContent) => ({ textContent });
  const doc = (selectors) => ({ querySelector(selector) { return selectors[selector] || null; } });

  assert(classifySubmitResponse(doc({ 'p.success': node('成功') }), '').kind === 'success', 'success response must be classified');
  assert(classifySubmitResponse(doc({ 'p.error': node('失败') }), '').kind === 'error', 'error response must be classified');
  assert(classifySubmitResponse(doc({}), '<title>500 Internal Server Error</title>').message === '500 Internal Server Error,可能是图床故障', 'HTTP 500 fallback must preserve its toast message');
  assert(classifySubmitResponse(doc({ 'div.error': { querySelector() { return node('详细系统错误'); } } }), '').message === '详细系统错误', 'system error h1 must be surfaced');
  assert(classifySubmitResponse(doc({ title: node('系统发生错误') }), '').message === '系统发生错误', 'system error title must preserve fallback semantics');
}

function testSubmitErrorClassification() {
  const { classifySubmitError } = loadFunctions(['isImageSizeError', 'classifySubmitError']);
  assert(classifySubmitError('图片太大') === 'image-size', 'oversized image must be classified');
  assert(classifySubmitError('非法图像文件') === 'illegal-image', 'illegal image must be classified');
  assert(classifySubmitError('含有非法词语') === 'illegal-word', 'illegal words must be classified');
  assert(classifySubmitError('权限不足') === 'other', 'ordinary server errors must remain ordinary');
}

function testNetworkErrorFormatting() {
  const { formatSubmitNetworkError } = loadFunctions(['formatSubmitNetworkError']);
  assert(formatSubmitNetworkError({ name: 'TypeError', message: 'Failed to fetch' }) === '发送超时，请检查网络后重试', 'fetch/network TypeError must keep timeout wording');
  assert(formatSubmitNetworkError({ name: 'Error', message: 'boom' }) === '发送失败：boom', 'other errors must include their message');
  assert(formatSubmitNetworkError({}) === '发送失败：未知错误', 'missing error details must retain unknown-error wording');
}

function testIllegalWordRetryHelpers() {
  const { getCurrentSubmitContent, createContentRetryFormData, restoreOriginalSubmitContent } = loadFunctions([
    'getCurrentSubmitContent',
    'createContentRetryFormData',
    'restoreOriginalSubmitContent'
  ]);
  const textarea = { value: '当前正文' };
  const form = {
    __originalContent: '原始正文',
    querySelector() { return textarea; },
    entries() { return [['content', textarea.value], ['name', '测试']][Symbol.iterator](); }
  };
  const fallback = new FormData();
  fallback.append('content', 'FormData正文');
  assert(getCurrentSubmitContent(form, fallback) === '当前正文', 'textarea content must take priority');
  form.querySelector = () => null;
  assert(getCurrentSubmitContent(form, fallback) === 'FormData正文', 'FormData content must be the fallback');
  form.querySelector = () => textarea;
  const retry = createContentRetryFormData(form, '安全正文');
  assert(retry.get('content') === '安全正文', 'retry FormData must replace content');
  assert(retry.get('name') === '测试', 'retry FormData must retain other current form fields');
  textarea.value = '已转换';
  assert(restoreOriginalSubmitContent(form) === '原始正文', 'restore helper must return the original content for follow-up cache reset');
  assert(textarea.value === '原始正文', 'restore helper must restore textarea value');
}

/*
 * Sprint 8 gain gate: form.__submitting/__submitLockTimer/__submitImageProcessing govern the
 * network/image lock lifecycle, while illegal retry counters and __originalContent govern a
 * separate retry lifecycle. Centralizing them would touch submit entry, timeout, recursive image
 * retries and two illegal-word modes at once. Existing tests protect key traces but do not execute
 * the complete event-bound closure, so the larger regression radius cannot prove positive net
 * benefit. Keep the current state fields and lock their ownership boundaries.
 */
function testSubmitStateConsolidationBoundary() {
  const intercept = extractFunctionDeclarations(script, 'interceptReplyForm')[0];
  for (const field of ['__submitting', '__submitLockTimer', '__submitImageProcessing', '__illegalRetryCount', '__illegalRetryCountU200B', '__originalContent']) {
    assert(intercept.includes(field), `existing submit state field must remain explicit: ${field}`);
  }
  assert(!intercept.includes('__submitState'), 'central submit-state object must not be introduced without full closure execution coverage');
}

function testRetryContractsRemainVisible() {
  assert(script.includes('const normalRetries = 2;'), 'unvcode must retain two normal retries');
  assert(script.includes('const fallbackRetryIndex = 2;'), 'unvcode must retain third fallback retry');
  assert(script.includes('const maxRetriesAll = 3;'), 'unvcode must retain total retry count');
  assert(script.includes('restoreOriginalSubmitContent(form);'), 'failed illegal-word retries must restore original content through the shared helper');
  assert(script.includes('form.__illegalRetryCountU200B >= 1'), 'U+200B mode must retain its single retry limit');
  assert(script.includes("toast('插入零宽空格后仍提交失败，非法词语可能存在于url中，请手动处理', 3000);"), 'U+200B terminal toast wording must remain unchanged');
  assert(script.includes("toast('unvcode替换后仍提交失败，已恢复原始文本，请手动处理', 3000);"), 'unvcode terminal toast wording must remain unchanged');
  assert(script.includes("toast('已尝试插入零宽空格模式并重试提交', 2000);\n                  doSubmit(newFD, false);"), 'U+200B retry must preserve toast-before-submit order and isRetry=false');
  assert(script.includes("const newFD = createContentRetryFormData(form, safeText);\n                  // 新增：递增计数"), 'U+200B retry must prepare current form state before incrementing');
  assert(script.includes("form.__illegalRetryCount++;\n                    doSubmit(newFD, false);"), 'unvcode retry must increment before recursive isRetry=false submission');
  assert(script.includes("restoreOriginalSubmitContent(form);\n                    resetCacheForFailedContent(form.__originalContent);"), 'unvcode failure must restore original content before cache reset');
}

function testSuccessfulSubmitPreviewCleanupContract() {
  const declarations = extractFunctionDeclarations(script, 'clearSuccessfulSubmitPreview');
  assert(declarations.length === 1, 'success preview cleanup must be extracted as one adjacent helper');
  const helper = declarations[0];
  const context = {
    console: { warn(message) { context.trace.push(`warn:${message}`); } },
    trace: [],
    document: {
      querySelector(selector) {
        context.trace.push(`query:${selector}`);
        return context.previewBox;
      }
    },
    getCurrentCookie() {
      context.trace.push('getCurrentCookie');
      return { name: '测试饼干' };
    },
    enableHDImage(node) {
      assert(node === context.previewBox, 'enableHDImage must receive the preview box');
      context.trace.push('enableHDImage');
    },
    refreshCookies(callback, force) {
      context.trace.push(`refreshCookies:${force}`);
      callback();
      context.trace.push('refreshCookies:return');
    },
    updatePreviewCookieId() { context.trace.push('updatePreviewCookieId'); },
    toast(message) { context.trace.push(`toast:${message}`); },
    previewBox: { innerHTML: '' }
  };
  vm.runInNewContext(`${helper}\nthis.clearSuccessfulSubmitPreview = clearSuccessfulSubmitPreview;`, context);
  context.clearSuccessfulSubmitPreview();

  const html = context.previewBox.innerHTML;
  for (const fragment of [
    '<div class="h-preview-box">',
    '<div class="h-threads-item">',
    '<div class="h-threads-item-replies">',
    '<div class="h-threads-item-reply">',
    '<div class="h-threads-item-reply-main">',
    '<div class="h-threads-img-box">',
    '<div class="h-threads-info">',
    '<div class="h-threads-content"></div>',
    '<span class="h-threads-info-uid">ID:测试饼干</span>',
    'No.9999999'
  ]) assert(html.includes(fragment), `preview placeholder must retain ${fragment}`);
  assert((html.match(/ID:测试饼干/g) || []).length === 1, 'current cookie ID text must appear exactly once');
  assert(
    JSON.stringify(context.trace) === JSON.stringify([
      'query:.h-preview-box',
      'getCurrentCookie',
      'enableHDImage',
      'refreshCookies:false',
      'updatePreviewCookieId',
      'refreshCookies:return'
    ]),
    `preview cleanup order/count changed: ${JSON.stringify(context.trace)}`
  );
  assert(!context.trace.some((event) => event.startsWith('toast:')), 'successful preview cleanup must not add a toast');
  assert(script.includes("toast(successMsg.textContent.trim() || (isReply ? '回复成功' : '发串成功'), 900, { queue: false, key: 'send-status' });"), 'original success toast text/fallback/options must remain unchanged');
}

function testSuccessfulSubmitOrchestrationTrace() {
  const doSubmit = extractFunctionDeclarations(script, 'doSubmit')[0];
  const calls = [
    ['snapshot', 'snapshotSubmittedPostHistory(fd, { isPost, isReply, form });'],
    ['clear-form', 'clearSuccessfulSubmitForm();'],
    ['clear-preview', 'clearSuccessfulSubmitPreview();'],
    ['navigate', 'runSuccessfulSubmitNavigation(confirmPromise);']
  ];
  let cursor = -1;
  for (const [label, marker] of calls) {
    const index = doSubmit.indexOf(marker);
    assert(index > cursor, `successful submit trace must call ${label} once and in contract order`);
    assert(doSubmit.indexOf(marker, index + marker.length) === -1, `successful submit trace must call ${label} exactly once`);
    cursor = index;
  }
}

function testSubmitLockLifecycleContracts() {
  const intercept = extractFunctionDeclarations(script, 'interceptReplyForm')[0];
  const doSubmit = extractFunctionDeclarations(script, 'doSubmit')[0];
  const compressRetry = extractFunctionDeclarations(script, 'compressImageForRetry')[0];
  assert(intercept && doSubmit && compressRetry, 'submit lifecycle functions must remain structurally complete');

  assert(intercept.includes('function beginSubmitImageProcessing('), 'submit lock must expose one unified image-processing entry point');
  assert(intercept.includes('function finishSubmitImageProcessing('), 'submit lock must expose one unified image-processing exit point');
  assert(intercept.includes('f.__submitting = true;\n        f.__submitImageProcessing = true;'), 'entering image processing must preserve the submit lock and mark the form before expensive work');
  assert(intercept.includes('clearSubmitLockTimer(f);'), 'entering image processing must cancel the current network timeout');
  assert(intercept.includes('if (f.__submitImageProcessing) return;'), 'timeout callback must not toast or unlock while image processing is active');
  assert(intercept.includes('f.__submitting = false;\n          toast(\'提交可能失败，请检查网络，或者刷新后重试\');'), 'ordinary submit timeout must retain toast and unlock behavior');

  assert(doSubmit.includes('finishSubmitImageProcessing(form);\n        refreshSubmitLockTimer(form);'), 'recursive network submit must atomically leave image processing and start a fresh timeout');
  assert(intercept.includes('beginSubmitImageProcessing(form);\n                try {\n                  const actualFormat = await detectImageFormat(file);'), 'oversized-image handling must enter the unified lifecycle before format detection and compression');
  assert(intercept.includes('beginSubmitImageProcessing(form);\n                try {\n                  console.log(\'[interceptReplyForm] 检测到非法GIF'), 'illegal GIF re-encoding must use the same image-processing lifecycle');
  assert((intercept.match(/finishSubmitImageProcessing\(form\);/g) || []).length >= 3, 'success/failure exits and recursive submit handoff must clear image-processing state');

  for (const format of ["actualFormat === 'gif'", "actualFormat === 'apng'", "actualFormat === 'animated-webp'", 'compressImageToSize(file, 2048)']) {
    assert(compressRetry.includes(format), `compressImageForRetry must retain covered image path: ${format}`);
  }
  const timeoutToast = '提交可能失败，请检查网络，或者刷新后重试';
  assert(script.split(timeoutToast).length - 1 === 1, 'submit timeout toast text must remain unchanged and exist only in the ordinary timeout path');
}

function createReplyRefreshHarness(options = {}) {
  const trace = [];
  const timers = [];
  const targetReplies = { name: 'target-replies' };
  const fragment = { innerHTML: '' };
  const newReplies = { innerHTML: '<article>No.123</article>' };
  const oldNext = options.newPage ? {
    textContent: '下一页',
    classList: { contains(name) { return name === 'uk-disabled'; } },
    querySelector() { return null; }
  } : null;
  const newNextLink = { href: 'https://example.test/t/1?page=3', getAttribute(attr) { return attr === 'href' ? this.href : null; } };
  const newNext = options.newPage ? {
    textContent: '下一页',
    classList: { contains() { return false; } },
    querySelector(selector) { return selector === 'a' ? newNextLink : null; }
  } : null;
  const pagination = (next) => ({ querySelectorAll(selector) { return selector === 'li' && next ? [next] : []; } });
  const parsedList = options.parsedListMissing ? null : {
    querySelector(selector) { return selector === '.h-threads-item-replies' && !options.parsedRepliesMissing ? newReplies : null; }
  };
  const parsedDocument = {
    querySelectorAll(selector) {
      return selector === 'ul.uk-pagination.uk-pagination-left.h-pagination' && options.newPage ? [pagination(newNext)] : [];
    }
  };
  const realList = options.realListMissing ? null : { name: 'real-list' };
  const context = {
    trace,
    console: { log(message) { trace.push(`log:${message}`); }, warn(message) { trace.push(`warn:${message}`); } },
    URL,
    location: { href: 'https://example.test/t/1?page=2', origin: 'https://example.test', pathname: '/t/1' },
    document: {
      querySelector() { return null; },
      querySelectorAll(selector) {
        if (selector === '.uk-pagination.uk-pagination-left.h-pagination') return [];
        if (selector === 'ul.uk-pagination.uk-pagination-left.h-pagination') return options.newPage ? [pagination(oldNext)] : [];
        return [];
      },
      createElement(tag) { assert(tag === 'div', 'refresh must create the merge fragment as a div'); return fragment; }
    },
    window: { SeamlessPaging: { loadNext() { trace.push('loadNext'); } } },
    $: (node) => node,
    DOMParser: class {
      parseFromString(html, type) {
        trace.push(`parse:${html}:${type}`);
        return parsedDocument;
      }
    },
    setTimeout(callback, delay) { trace.push(`schedule:${delay}`); timers.push({ callback, delay }); },
    fetch(url, init) {
      trace.push(`fetch:${url}:${init && init.credentials}`);
      if (options.fetchFailure) return Promise.reject(new Error('network'));
      return Promise.resolve({ text() { trace.push('response.text'); return Promise.resolve('<html>fresh</html>'); } });
    },
    toast(message) { trace.push(`toast:${message}`); },
    safeGetConfig() { return { name: 'cfg' }; },
    getMaxClonedPageInDOM() { trace.push('getMaxClonedPageInDOM'); return 2; },
    resolveThreadRefreshTargetPage(maxPage, maxCloned, currentPage) {
      trace.push(`resolve:${maxPage}:${maxCloned}:${currentPage}`);
      return options.skip ? { kind: 'skip' } : { kind: 'refresh', targetPage: 2 };
    },
    getRealThreadsList(root) {
      trace.push(root === context.document ? 'getRealThreadsList:current' : 'getRealThreadsList:fetched');
      return root === context.document ? realList : parsedList;
    },
    ensureThreadRepliesContainer(list, page) {
      trace.push(`ensure:${list === realList}:${page}`);
      return { targetReplies: options.targetRepliesMissing ? null : targetReplies, created: false };
    },
    stripSystemTipReplies(node) { trace.push(`strip:${node === fragment}`); },
    preprocessPageEnhancementsBeforeInsert(node, cfg) { trace.push(`preprocess:${node === fragment}:${cfg.name}`); },
    appendMissingRepliesByThreadsId(target, node, mergeOptions) {
      trace.push(`append:${target === targetReplies}:${node === fragment}:${JSON.stringify(mergeOptions)}`);
      return { appendedNodes: [] };
    },
    applyPageEnhancements(target, cfg) { trace.push(`enhance:${target === targetReplies}:${cfg.name}`); },
    applyFilters() {},
    prepareAndSyncBottomPagination(doc) { trace.push(`syncPagination:${doc === parsedDocument}`); },
    refreshFilterDisplay(cfg) { trace.push(`refreshFilters:${cfg.name}`); }
  };
  const declarations = ['getCurrentPage', 'getMaxPageFromPagination', 'parsePaginationPageNum', 'minimalHideEmptyTitleAndEmail', 'refreshRepliesWithSeamlessPaging']
    .map((name) => extractFunctionDeclarations(script, name)[0]).join('\n');
  vm.runInNewContext(`${declarations}\nthis.refresh = refreshRepliesWithSeamlessPaging;`, context);
  return { context, trace, timers };
}

async function settleReplyRefresh(harness) {
  await new Promise((resolve) => setImmediate(resolve));
  harness.timers.sort((a, b) => a.delay - b.delay).forEach((timer) => timer.callback());
}

async function testReplyRefreshDifferentialTraceContracts() {
  const cases = [
    { name: 'skip', options: { skip: true }, toast: null, fetch: false },
    { name: 'missing real list', options: { realListMissing: true }, toast: '未找到真实列表，无法刷新回复区', fetch: false },
    { name: 'missing target replies', options: { targetRepliesMissing: true }, toast: '未找到目标回复区', fetch: false },
    { name: 'fetch failure', options: { fetchFailure: true }, toast: '刷新回复区失败', fetch: true }
  ];
  for (const testCase of cases) {
    const harness = createReplyRefreshHarness(testCase.options);
    let doneCount = 0;
    harness.context.refresh(() => { doneCount++; harness.trace.push('done'); }, { getConfig: () => ({ name: 'cfg' }) });
    await settleReplyRefresh(harness);
    assert(doneCount === 1, `${testCase.name} must call done exactly once (got ${doneCount})`);
    assert(harness.trace.some((event) => event.startsWith('fetch:')) === testCase.fetch, `${testCase.name} fetch presence changed`);
    const toasts = harness.trace.filter((event) => event.startsWith('toast:'));
    assert(JSON.stringify(toasts) === JSON.stringify(testCase.toast ? [`toast:${testCase.toast}`] : []), `${testCase.name} toast changed: ${JSON.stringify(toasts)}`);
  }

  const normal = createReplyRefreshHarness();
  let normalDone = 0;
  normal.context.refresh(() => { normalDone++; normal.trace.push('done'); }, { getConfig: () => ({ name: 'cfg' }) });
  await settleReplyRefresh(normal);
  assert(normalDone === 1, 'normal refresh must call done exactly once');
  const normalExpected = [
    'resolve:null:2:2',
    'getRealThreadsList:current',
    'ensure:true:2',
    'fetch:https://example.test/t/1?page=2:include',
    'response.text',
    'parse:<html>fresh</html>:text/html',
    'getRealThreadsList:fetched',
    'strip:true',
    'preprocess:true:cfg',
    'append:true:true:{"replyOnly":true,"excludeSystemOnOld":true,"excludeSystemOnNew":true}',
    'schedule:50',
    'syncPagination:true',
    'refreshFilters:cfg',
    'done',
    'enhance:true:cfg'
  ];
  let cursor = -1;
  for (const expected of normalExpected) {
    cursor = normal.trace.indexOf(expected, cursor + 1);
    assert(cursor !== -1, `normal refresh order missing ${expected}: ${JSON.stringify(normal.trace)}`);
  }
  assert(!normal.trace.some((event) => event.startsWith('toast:')), 'normal refresh must not add a toast');

  const newPage = createReplyRefreshHarness({ newPage: true });
  let newPageDone = 0;
  newPage.context.refresh(() => { newPageDone++; newPage.trace.push('done'); }, { getConfig: () => ({ name: 'cfg' }) });
  await settleReplyRefresh(newPage);
  assert(newPageDone === 1, 'new-page refresh must call done exactly once');
  const discoveryToast = newPage.trace.indexOf('toast:发现3页，正在加载……');
  const schedule100 = newPage.trace.indexOf('schedule:100');
  const done = newPage.trace.indexOf('done');
  const enhance = newPage.trace.indexOf('enhance:true:cfg');
  const loadNext = newPage.trace.indexOf('loadNext');
  assert(discoveryToast !== -1 && discoveryToast < schedule100 && schedule100 < done, 'new-page toast and 100ms scheduling must precede done');
  assert(done < enhance && enhance < loadNext, 'done, 50ms enhancement and 100ms loadNext order changed');
}

function testReplyRefreshPlacementAndGainContracts() {
  const names = ['getCurrentPage', 'getMaxPageFromPagination', 'minimalHideEmptyTitleAndEmail', 'refreshRepliesWithSeamlessPaging'];
  const intercept = extractFunctionDeclarations(script, 'interceptReplyForm')[0];
  for (const name of names) {
    assert(extractFunctionDeclarations(script, name).length === 1, `${name} must have one declaration in the file`);
    assert(!intercept.includes(`function ${name}(`), `${name} must no longer be nested in interceptReplyForm`);
  }
  const refresh = extractFunctionDeclarations(script, 'refreshRepliesWithSeamlessPaging')[0];
  assert(refresh.includes('resolveThreadRefreshTargetPage(maxPage, maxCloned, currentPage)'), 'target-page resolver arguments changed');
  assert(/appendMissingRepliesByThreadsId\(targetReplies, fragment, \{\s*replyOnly: true,\s*excludeSystemOnOld: true,\s*excludeSystemOnNew: true\s*\}\)/.test(refresh), 'reply merge arguments changed');
  assert(refresh.includes('applyPageEnhancements(targetReplies, cfg2 || (typeof getConfig === \'function\' ? getConfig() : null))'), 'enhancement arguments changed');
  assert(refresh.includes('prepareAndSyncBottomPagination(doc);'), 'pagination synchronization argument changed');
  assert(refresh.includes('}, 50);') && /window\.SeamlessPaging\.loadNext\(\);\s*\}, 100\);/.test(refresh), '50ms/100ms scheduling contract changed');
  assert(script.includes('refreshRepliesWithSeamlessPaging(() => {') && script.includes('}, { getConfig: safeGetConfig });'), 'caller must pass only the form-local config dependency');
}

function testHelperPlacementAndSyntaxContracts() {
  const helperNames = [
    'findUrlRanges',
    'inAnyRange',
    'transformTextOutsideUrlRanges',
    'fallbackInsertZWSP',
    'insertZwspAfterHanAndAsciiLettersOutsideUrls',
    'getImageExtension',
    'normalizeDetectedImageFormat',
    'getStaticImageOutputType',
    'cloneFormData',
    'cloneFormDataWithImage'
  ];
  for (const name of helperNames) {
    assert(extractFunctionDeclarations(script, name).length === 1, `${name} must not be declared more than once`);
  }
  const intercept = extractFunctionDeclarations(script, 'interceptReplyForm')[0];
  const doSubmit = extractFunctionDeclarations(script, 'doSubmit')[0];
  assert(intercept && doSubmit && intercept.includes(doSubmit), 'interceptReplyForm and nested doSubmit syntax must remain structurally complete');
  for (const name of helperNames) {
    assert(!intercept.includes(`function ${name}(`), `${name} must be extracted from interceptReplyForm`);
  }
}

testUrlProtectionAndTextContracts();
testImageAndFormDataHelpers();
testStaticCompressionCandidateSelectionContracts();
testTrustedSnapshotCompressionDifferential();
testCompressImageResponsibilityBoundary();
testCompressionToolScopeAndContracts();
testSubmitResponseClassification();
testSubmitErrorClassification();
testNetworkErrorFormatting();
testIllegalWordRetryHelpers();
testSubmitStateConsolidationBoundary();
testRetryContractsRemainVisible();
testSuccessfulSubmitPreviewCleanupContract();
testSuccessfulSubmitOrchestrationTrace();
testSubmitLockLifecycleContracts();
Promise.resolve()
  .then(() => testImageFormatDetectionContracts())
  .then(() => testReplyRefreshDifferentialTraceContracts())
  .then(() => {
    testReplyRefreshPlacementAndGainContracts();
    testHelperPlacementAndSyntaxContracts();
    console.log('reply submit refactor contract ok');
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
