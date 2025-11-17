/**
 * LAMPA Theme Plugin
 *  - добавляет смену цветовой схемы (presets + кастомные цвета)
 *  - сохраняет выбор в localStorage под ключом "lampa_theme_plugin"
 *
 * Установите как обычный плагин (URL to raw .js).
 */

(function(){
  const STORAGE_KEY = 'lampa_theme_plugin';

  // Набор пресетов; можно добавить свои
  const PRESETS = {
    'Default': {
      '--bg': '#0f0f11',
      '--card': '#141416',
      '--accent': '#FF6B00',
      '--text': '#e6e6e6',
      '--muted': '#9a9a9a'
    },
    'Light': {
      '--bg': '#f6f6f7',
      '--card': '#ffffff',
      '--accent': '#0078D4',
      '--text': '#111111',
      '--muted': '#6b6b6b'
    },
    'Green': {
      '--bg': '#071617',
      '--card': '#0b2a24',
      '--accent': '#00c27a',
      '--text': '#dffcf0',
      '--muted': '#84bba4'
    },
    'Purple': {
      '--bg': '#0b0912',
      '--card': '#151126',
      '--accent': '#b76bff',
      '--text': '#efe8ff',
      '--muted': '#b8a6d8'
    }
  };

  // Применить набор CSS-переменных к :root
  function applyTheme(vars) {
    if (!vars) return;
    const root = document.documentElement || document.getElementsByTagName('html')[0];
    Object.keys(vars).forEach(k => {
      try { root.style.setProperty(k, vars[k]); } catch(e) {}
    });
    // Добавим вспомогательный класс — позволяет писать дополнительные правила
    root.classList.add('lampa-theme-plugin-applied');
  }

  // Соберём CSS, чтобы гарантировать, что переменные используются в UI.
  // (Это мягкий хак: многие View-элементы Lampa используют прямые цвета, но
  // если тема собрана через переменные или карточки, то переопределится)
  function injectCSS() {
    if (document.getElementById('lampa-theme-plugin-style')) return;
    const css = `
      :root {
        /* базовые переменные (значения будут перезаписаны applyTheme) */
        --bg: #0f0f11;
        --card: #141416;
        --accent: #FF6B00;
        --text: #e6e6e6;
        --muted: #9a9a9a;
      }

      /* примеры переопределения популярных элементов Lampa */
      body, .body, .app, .page {
        background: var(--bg) !important;
        color: var(--text) !important;
      }

      .card, .item, .settings, .menu {
        background: var(--card) !important;
        color: var(--text) !important;
      }

      a, .accent, .btn, .tag, .active {
        color: var(--accent) !important;
      }

      input, textarea, select {
        background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02));
        color: var(--text) !important;
        border-color: rgba(255,255,255,0.03) !important;
      }

      .muted { color: var(--muted) !important; }

      /* небольшая плавность */
      .lampa-theme-plugin-applied * {
        transition: background-color .18s ease, color .18s ease, border-color .18s ease;
      }
    `;
    const style = document.createElement('style');
    style.id = 'lampa-theme-plugin-style';
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  // Сохранение / загрузка
  function saveState(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state || {})); } catch(e){}
  }
  function loadState() {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch(e){ return null; }
  }

  // UI: диалог настроек (fallback если нет API lampa.settings)
  function openSettingsUI() {
    // уже открыт?
    if (document.getElementById('lampa-theme-plugin-ui')) return;

    const state = loadState() || { preset: 'Default', custom: {} };
    const overlay = document.createElement('div');
    overlay.id = 'lampa-theme-plugin-ui';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.zIndex = 999999;
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.backdropFilter = 'blur(6px)';
    overlay.style.background = 'rgba(0,0,0,0.45)';

    const box = document.createElement('div');
    box.style.width = '760px';
    box.style.maxWidth = '94%';
    box.style.maxHeight = '90%';
    box.style.overflow = 'auto';
    box.style.background = 'var(--card)';
    box.style.color = 'var(--text)';
    box.style.borderRadius = '10px';
    box.style.padding = '18px';
    box.style.boxShadow = '0 8px 30px rgba(0,0,0,0.6)';
    overlay.appendChild(box);

    const title = document.createElement('h2');
    title.textContent = 'Theme plugin — цветовая схема';
    box.appendChild(title);

    const presetsWrap = document.createElement('div');
    presetsWrap.style.display = 'flex';
    presetsWrap.style.flexWrap = 'wrap';
    presetsWrap.style.gap = '10px';
    presetsWrap.style.marginBottom = '12px';

    Object.keys(PRESETS).forEach(pn => {
      const btn = document.createElement('button');
      btn.textContent = pn;
      btn.style.padding = '8px 12px';
      btn.style.border = 'none';
      btn.style.borderRadius = '6px';
      btn.style.cursor = 'pointer';
      btn.className = 'preset-btn';
      btn.onclick = () => {
        applyTheme(PRESETS[pn]);
        saveState({ preset: pn });
      };
      presetsWrap.appendChild(btn);
    });
    box.appendChild(presetsWrap);

    // Кастомные поля
    const form = document.createElement('div');
    form.style.display = 'grid';
    form.style.gridTemplateColumns = '1fr 1fr';
    form.style.gap = '10px';

    const fields = ['--bg','--card','--accent','--text','--muted'];
    fields.forEach(k => {
      const wrap = document.createElement('label');
      wrap.style.display = 'flex';
      wrap.style.flexDirection = 'column';
      wrap.style.fontSize = '13px';
      wrap.style.gap = '6px';
      wrap.textContent = k;
      const input = document.createElement('input');
      input.type = 'color';
      input.value = (state.custom && state.custom[k]) ? state.custom[k] : PRESETS[state.preset || 'Default'][k];
      input.oninput = () => {
        // применяем частично
        const cur = loadState() || { preset: null, custom: {} };
        cur.custom = cur.custom || {};
        cur.custom[k] = input.value;
        saveState(cur);
        applyTheme(Object.assign({}, PRESETS['Default'], cur.custom));
      };
      wrap.appendChild(input);
      form.appendChild(wrap);
    });

    box.appendChild(form);

    // Actions
    const actions = document.createElement('div');
    actions.style.marginTop = '12px';
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    box.appendChild(actions);

    const btnClose = document.createElement('button');
    btnClose.textContent = 'Закрыть';
    btnClose.onclick = () => { overlay.remove(); };
    actions.appendChild(btnClose);

    const btnReset = document.createElement('button');
    btnReset.textContent = 'Сбросить';
    btnReset.onclick = () => {
      saveState({ preset: 'Default', custom: {} });
      applyTheme(PRESETS['Default']);
      overlay.remove();
    };
    actions.appendChild(btnReset);

    document.body.appendChild(overlay);
  }

  // Попытаться зарегистрировать в Lampa (если доступен API для плагинов)
  function registerWithLampa() {
    try {
      if (window.lampa && window.lampa.addMenu) {
        // пример использования известных API: addMenu / addSettings — не гарантировано везде
        try {
          window.lampa.addMenu({
            id: 'theme_plugin',
            title: 'Цветовая тема (Theme plugin)',
            onClick: function(){
              // если Lampa имеет собственный UI — показать свой диалог или вызвать settings
              if (window.lampa.openPluginSettings) {
                window.lampa.openPluginSettings('theme_plugin');
              } else {
                openSettingsUI();
              }
            }
          });
        } catch(e){}
        // если есть возможность добавить настройки в системные настройки Lampa:
        if (window.lampa.addSettings) {
          window.lampa.addSettings({
            id: 'theme_plugin',
            title: 'Theme plugin',
            onOpen: openSettingsUI
          });
        }
        return true;
      }
    } catch(e){}
    return false;
  }

  // Инициализация: inject css, применить сохранённую тему, зарегистрировать меню
  function init() {
    // guard
    if (window.__lampa_theme_plugin_inited) return;
    window.__lampa_theme_plugin_inited = true;

    // подождём DOM, если нужно
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _init);
    } else {
      _init();
    }

    function _init(){
      injectCSS();

      const state = loadState();
      if (state) {
        if (state.preset && PRESETS[state.preset]) {
          applyTheme(PRESETS[state.preset]);
        }
        if (state.custom && Object.keys(state.custom).length) {
          // применяем поверх пресета (или поверх Default)
          applyTheme(Object.assign({}, PRESETS[state.preset] || PRESETS['Default'], state.custom));
        }
      } else {
        // применить дефолтную тему
        applyTheme(PRESETS['Default']);
      }

      // попытка зарегистрировать пункт меню/настроек в Lampa
      const ok = registerWithLampa();
      if (!ok) {
        // если нет API регистрации — добавим внизу экрана плавающую кнопку для открытия UI
        addFloatingButton();
      }
    }
  }

  function addFloatingButton(){
    if (document.getElementById('lampa-theme-plugin-fab')) return;
    const btn = document.createElement('button');
    btn.id = 'lampa-theme-plugin-fab';
    btn.title = 'Theme';
    btn.style.position = 'fixed';
    btn.style.right = '12px';
    btn.style.bottom = '12px';
    btn.style.zIndex = 999999;
    btn.style.width = '46px';
    btn.style.height = '46px';
    btn.style.borderRadius = '50%';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 6px 18px rgba(0,0,0,0.45)';
    btn.style.background = 'var(--accent)';
    btn.style.color = 'var(--card)';
    btn.style.fontWeight = '700';
    btn.textContent = 'T';
    btn.onclick = openSettingsUI;
    document.body.appendChild(btn);
  }

  // старт
  try { init(); } catch(e){ console.error('Theme plugin init error', e); }

  // Экспорт (если Lampa ожидает module.exports)
  try {
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = { init: init, applyTheme: applyTheme, presets: PRESETS };
    }
  } catch(e){}

  // Если Lampa ищет global plugin var:
  try { window.theme_plugin = { init: init, applyTheme: applyTheme, presets: PRESETS }; } catch(e){}
})();
