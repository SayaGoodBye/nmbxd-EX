(function () {
  'use strict';

  const schema = globalThis.XdexSettingsSchema;
  const form = document.getElementById('settingsForm');
  const status = document.getElementById('status');
  const saveButton = document.getElementById('saveButton');
  const resetButton = document.getElementById('resetButton');
  const reloadButton = document.getElementById('reloadButton');
  const memoryStorage = {};
  let currentSettings = schema.cloneDefaultSettings();
  let statusTimer = 0;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    saveButton.addEventListener('click', saveSettings);
    resetButton.addEventListener('click', resetSettings);
    reloadButton.addEventListener('click', loadSettings);
    loadSettings();
  }

  function loadSettings() {
    setStatus('正在读取设置...', '');
    storageGet(schema.STORAGE_KEY)
      .then((value) => {
        currentSettings = schema.normalizeSettings(value);
        renderSettings(currentSettings);
        setStatus('设置已载入。', 'ok');
      })
      .catch((err) => setStatus(formatError(err), 'error'));
  }

  function saveSettings() {
    const collected = collectSettings();
    if (!collected.ok) {
      setStatus(collected.message, 'error');
      return;
    }

    const normalized = schema.normalizeSettings(collected.value);
    storageSet(schema.STORAGE_KEY, normalized)
      .then(() => {
        currentSettings = normalized;
        renderSettings(currentSettings);
        setStatus('设置已保存。刷新 X岛 页面后生效。', 'ok');
      })
      .catch((err) => setStatus(formatError(err), 'error'));
  }

  function resetSettings() {
    currentSettings = schema.cloneDefaultSettings();
    renderSettings(currentSettings);
    storageSet(schema.STORAGE_KEY, currentSettings)
      .then(() => setStatus('已恢复默认值并保存。刷新 X岛 页面后生效。', 'ok'))
      .catch((err) => setStatus(formatError(err), 'error'));
  }

  function renderSettings(settings) {
    form.textContent = '';
    schema.SETTING_GROUPS.forEach((group) => {
      const card = createElement('section', 'settings-card');
      card.dataset.group = group.id;

      const header = createElement('div', 'group-header');
      header.append(createElement('h2', '', group.title));
      header.append(createElement('p', 'group-description', group.description));
      card.append(header);

      const fieldList = createElement('div', 'field-list');
      group.fields.forEach((key) => fieldList.append(renderField(key, settings[key])));
      card.append(fieldList);
      form.append(card);
    });
  }

  function renderField(key, value) {
    const row = createElement('label', 'field-row');
    row.dataset.key = key;
    if (key === 'enableImageHideMode') row.classList.add('is-locked');

    const main = createElement('div', 'field-main');
    const titleWrap = createElement('div');
    titleWrap.append(createElement('div', 'field-title', schema.FIELD_LABELS[key] || key));
    titleWrap.append(createElement('div', 'field-key', key));
    main.append(titleWrap);
    main.append(createControl(key, value));
    row.append(main);

    const description = schema.FIELD_DESCRIPTIONS[key];
    if (description) row.append(createElement('p', 'field-description', description));
    row.append(createElement('div', 'field-error'));
    return row;
  }

  function createControl(key, value) {
    const defaultValue = schema.DEFAULT_SETTINGS[key];

    if (Array.isArray(defaultValue)) {
      const textarea = document.createElement('textarea');
      textarea.name = key;
      textarea.spellcheck = false;
      textarea.value = JSON.stringify(Array.isArray(value) ? value : defaultValue, null, 2);
      return textarea;
    }

    if (Object.prototype.hasOwnProperty.call(schema.ENUM_OPTIONS, key)) {
      const select = document.createElement('select');
      select.name = key;
      schema.ENUM_OPTIONS[key].forEach((optionValue) => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        select.append(option);
      });
      select.value = String(value);
      return select;
    }

    if (typeof defaultValue === 'boolean') {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = key;
      checkbox.checked = Boolean(value);
      if (key === 'enableImageHideMode') {
        checkbox.checked = true;
        checkbox.disabled = true;
      }
      return checkbox;
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.name = key;
    input.value = typeof value === 'string' ? value : '';
    return input;
  }

  function collectSettings() {
    clearFieldErrors();
    const next = {};

    for (const key of Object.keys(schema.DEFAULT_SETTINGS)) {
      const control = form.elements[key];
      const defaultValue = schema.DEFAULT_SETTINGS[key];

      if (Array.isArray(defaultValue)) {
        const parsed = parseJsonArrayField(key, control.value);
        if (!parsed.ok) return parsed;
        next[key] = parsed.value;
      } else if (typeof defaultValue === 'boolean') {
        next[key] = key === 'enableImageHideMode' ? true : Boolean(control.checked);
      } else {
        next[key] = control.value;
      }
    }

    return { ok: true, value: next };
  }

  function parseJsonArrayField(key, rawValue) {
    try {
      const value = JSON.parse(rawValue || '[]');
      if (!Array.isArray(value)) {
        throw new Error('必须是 JSON 数组。');
      }
      return { ok: true, value };
    } catch (err) {
      const message = `${schema.FIELD_LABELS[key] || key}: ${err.message}`;
      showFieldError(key, message);
      return { ok: false, message };
    }
  }

  function showFieldError(key, message) {
    const row = form.querySelector(`[data-key="${cssEscape(key)}"]`);
    if (!row) return;
    row.classList.add('has-error');
    const error = row.querySelector('.field-error');
    if (error) error.textContent = message;
  }

  function clearFieldErrors() {
    form.querySelectorAll('.field-row.has-error').forEach((row) => {
      row.classList.remove('has-error');
      const error = row.querySelector('.field-error');
      if (error) error.textContent = '';
    });
  }

  function storageGet(key) {
    if (!hasChromeStorage()) {
      return Promise.resolve(memoryStorage[key]);
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, (items) => {
        const error = chrome.runtime && chrome.runtime.lastError;
        if (error) reject(new Error(error.message));
        else resolve(items ? items[key] : undefined);
      });
    });
  }

  function storageSet(key, value) {
    if (!hasChromeStorage()) {
      memoryStorage[key] = value;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        const error = chrome.runtime && chrome.runtime.lastError;
        if (error) reject(new Error(error.message));
        else resolve();
      });
    });
  }

  function hasChromeStorage() {
    return Boolean(globalThis.chrome && chrome.storage && chrome.storage.local);
  }

  function setStatus(message, tone) {
    clearTimeout(statusTimer);
    status.textContent = message;
    if (tone) status.dataset.tone = tone;
    else delete status.dataset.tone;

    if (tone === 'ok') {
      statusTimer = setTimeout(() => {
        status.textContent = '';
        delete status.dataset.tone;
      }, 4000);
    }
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (typeof text !== 'undefined') element.textContent = text;
    return element;
  }

  function formatError(err) {
    return err && err.message ? err.message : String(err);
  }

  function cssEscape(value) {
    if (globalThis.CSS && typeof CSS.escape === 'function') return CSS.escape(value);
    return String(value).replace(/"/g, '\\"');
  }
})();
