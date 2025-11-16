(() => {
  const plugin_id = 'maxcolor';
  const plugin_name = 'MaxColor';

  const COLORS = {
    low: '#ff3333',
    mid: '#ffcc00',
    high: '#00ff00'
  };

  function log(...a) {
    try { console.log(`[${plugin_name}]`, ...a); } catch (e) {}
  }

  // 1) Окраска числа "Раздают"
  function recolorSeedNumbers() {
    document.querySelectorAll('.torrent-item__seeds span').forEach(span => {
      const num = parseInt(span.textContent);
      if (isNaN(num)) return;
      const color = num > 10 ? COLORS.high : (num >= 5 ? COLORS.mid : COLORS.low);
      span.style.color = color;
      span.style.fontWeight = 'bold';
    });
  }

  // 2) Общий фон + скругления блоков
  function applyCustomStyles() {
    const wrap = document.querySelector('.wrap__content');
    if (wrap) {
      wrap.style.setProperty('background', 'linear-gradient(135deg, #171717 0%, #2f3233 50%, #000000 100%)', 'important');
    }
    document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render')
      .forEach(el => el.style.borderRadius = '0.9em');
    document.querySelectorAll('.watched-history.selector')
      .forEach(el => el.style.borderRadius = '0.9em');
  }

  // 3) Отключение canvas-фона
  function overrideCanvasBackground() {
    const bg = document.querySelector('.background');
    if (bg) {
      bg.style.setProperty('background', 'linear-gradient(135deg, #171717 0%, #2f3233 50%, #000000 100%)', 'important');
    }
    ['.background__one', '.background__two'].forEach(sel => {
      const canvas = document.querySelector(sel);
      if (canvas) canvas.style.setProperty('display', 'none', 'important');
    });
  }

  // 4) Меню в стиле settings-панели (строго по макету)
  function styleMenuAsSettingsPanel() {
    const styleId = 'maxcolor-menu-settings-panel';
    if (document.getElementById(styleId)) return;

    const css = `
      /* Контейнер меню как единая панель */
      .menu {
        background: rgba(23,23,23,0.95) !important;
        border-radius: 12px !important;
        box-shadow: 0 12px 32px rgba(0,0,0,0.45) !important;
        overflow: hidden !important;
        /* Вписываемся в поток контента (как settings__content) */
        margin: 0 16px 16px 16px !important;
        padding: 0 !important;
      }

      /* Шапка меню (как settings__head) */
      .menu__header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 18px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        background: transparent !important;
      }
      .menu__header-logo img,
      .menu__header-logo svg {
        width: 28px;
        height: 28px;
      }
      .menu__header-time {
        display: flex;
        flex-direction: column;
        gap: 4px;
        opacity: 0.9;
      }

      /* Группы пунктов как секции settings__body */
      .menu__case {
        padding: 12px 12px;
        background: transparent !important;
      }

      /* Разделитель между секциями */
      .menu__split {
        height: 1px;
        background: rgba(255,255,255,0.08) !important;
        margin: 0 12px;
      }

      /* Списки */
      .menu__list {
        list-style: none;
        margin: 0;
        padding: 0;
        background: transparent !important;
      }

      /* Пункты меню как элементы settings-folder */
      .menu__item {
        display: flex;
        align-items: center;
        gap: 12px;
        border-radius: 10px;
        padding: 10px 12px;
        margin: 6px 0;
        background: rgba(47,50,51,0.75);
        transition: background 160ms ease, transform 160ms ease;
      }
      .menu__item.selector.focus,
      .menu__item.selector:hover {
        background: rgba(255,255,255,0.12);
        transform: translateZ(0);
      }

      /* Иконка + текст */
      .menu__ico {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        color: #fff;
        opacity: 0.95;
      }
      .menu__ico svg { width: 100%; height: 100%; }

      .menu__text {
        color: #fff;
        font-size: 15px;
        line-height: 1.2;
        letter-spacing: .2px;
        opacity: 0.95;
      }

      /* Убираем любые чужие фоны поверх */
      .menu, .menu * {
        background-image: none !important;
      }
    `;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function startObserver() {
    const obs = new MutationObserver(() => {
      recolorSeedNumbers();
      applyCustomStyles();
      overrideCanvasBackground();
      styleMenuAsSettingsPanel();
    });
    obs.observe(document.body, { childList: true, subtree: true });

    recolorSeedNumbers();
    applyCustomStyles();
    overrideCanvasBackground();
    styleMenuAsSettingsPanel();

    log('Observer started (v2.6)');
  }

  function register() {
    if (window.app && app.plugins && typeof app.plugins.add === 'function') {
      app.plugins.add({
        id: plugin_id,
        name: plugin_name,
        version: '2.6',
        author: 'maxxx',
        description: 'Единый фон, скругления, отключение canvas и меню как панель настроек',
        init: startObserver
      });
      log('Registered with Lampa');
    } else {
      log('Standalone mode');
      startObserver();
    }
  }

  register();
})();
