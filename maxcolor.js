(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    const COLORS = {
        low: '#ff3333',
        mid: '#ffcc00',
        high: '#00ff00'
    };

    const BLOCK_RADIUS = '0.9em';
    const ACTIVE_RADIUS = '0.6em';
    const GRADIENT = 'linear-gradient(117deg, rgb(0 0 0) 0%, rgb(11 26 35) 50%, rgb(14, 14, 14) 100%)';

    function log(...a) { try { console.log(`[${plugin_name}]`, ...a); } catch (e) {} }

    /* ----------------------------------------------------
       ОКРАСКА СИДОВ
    ---------------------------------------------------- */
    function recolorSeedNumbers() {
        document.querySelectorAll('.torrent-item__seeds').forEach(block => {
            const span = block.querySelector('span');
            if (!span) return;
            const num = parseInt(span.textContent);
            if (isNaN(num)) return;
            let color = COLORS.low;
            if (num > 10) color = COLORS.high;
            else if (num >= 5) color = COLORS.mid;
            span.style.color = color;
            span.style.fontWeight = 'bold';
        });
    }

    /* ----------------------------------------------------
       СКРУГЛЕНИЕ БЛОКОВ
    ---------------------------------------------------- */
    function roundCorners() {
        document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render')
            .forEach(item => item.style.borderRadius = BLOCK_RADIUS);
        document.querySelectorAll('.watched-history.selector')
            .forEach(item => item.style.borderRadius = BLOCK_RADIUS);
    }

    /* ----------------------------------------------------
       НОВЫЙ ФОН
    ---------------------------------------------------- */
    function changeBackground() {
        const backgroundBlock = document.querySelector('.background');
        if (backgroundBlock) {
            backgroundBlock.style.background = GRADIENT;
            backgroundBlock.style.setProperty('background', GRADIENT, 'important');
        }
    }

    /* ----------------------------------------------------
       СКРУГЛЕНИЕ КНОПОК
    ---------------------------------------------------- */
    function enforceButtonsRadius() {
        const styleId = 'maxcolor-button-states';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .full-start-new__buttons .full-start__button {
                transition: border-radius 0.2s ease;
            }
            .full-start-new__buttons .full-start__button:hover,
            .full-start-new__buttons .full-start__button:focus,
            .full-start-new__buttons .full-start__button.focus,
            .full-start-new__buttons .full-start__button.active,
            .full-start-new__buttons .full-start__button.layer--focus,
            .full-start-new__buttons.layer--focus .full-start__button.selector {
                border-radius: ${ACTIVE_RADIUS} !important;
            }
        `;
        document.head.appendChild(style);
    }

    /* ----------------------------------------------------
       ПРАВИЛЬНОЕ МЕНЮ СПРАВА, РОВНЫЕ ОТСТУПЫ И БЕЗ ОБРЕЗАНИЯ
    ---------------------------------------------------- */
    function fixMenu() {
        if (document.getElementById("max-fix-selectbox")) return;

        const style = document.createElement('style');
        style.id = "max-fix-selectbox";
        style.textContent = `

        /* ОСНОВНОЙ ПАТЧ ДЛЯ МЕНЮ (selectbox + settings) */
        .selectbox__content.layer--height,
        .settings__content {

            position: fixed !important;
            box-sizing: border-box !important;

            /* одинаковый отступ сверху/снизу/справа */
            top: 1.5em !important;
            bottom: 1.5em !important;
            right: 1.5em !important;

            left: auto !important;

            /* перебиваем inset, который Lampa вставляет автоматически */
            inset: 1.5em 1.5em 1.5em auto !important;

            width: 36% !important;
            max-width: 42em !important;

            padding: 1em !important;
            padding-bottom: 4em !important;

            border-radius: 1.2em !important;
            background: rgba(33,33,33,0.98) !important;

            overflow-y: auto !important;

            /* Убираем растягивание меню (2639px и т.п.) */
            height: auto !important;
            max-height: calc(100vh - 3em) !important;

            display: flex !important;
            flex-direction: column !important;
        }

        /* Убираем кривые внутренние высоты */
        .selectbox__body,
        .settings__body,
        .scroll,
        .scroll__content,
        .scroll__body {
            height: auto !important;
            max-height: none !important;
        }

        /* Даем запас снизу, чтобы последний пункт НЕ резался на пульте */
        .scroll__body::after,
        .settings__content .selector:last-child::after {
            content: "";
            display: block;
            height: 4em !important;
        }

        `;
        document.head.appendChild(style);
    }

    /* ----------------------------------------------------
       ОБЩАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ
    ---------------------------------------------------- */
    function applyStyles() {
        recolorSeedNumbers();
        roundCorners();
        changeBackground();
        enforceButtonsRadius();
        fixMenu();
    }

    /* ----------------------------------------------------
       OBSERVER
    ---------------------------------------------------- */
    function startObserver() {
        const obs = new MutationObserver(applyStyles);
        obs.observe(document.body, { childList: true, subtree: true });
        applyStyles();
        log('Observer started (v5.0)');
    }

    /* ----------------------------------------------------
       РЕГИСТРАЦИЯ ПЛАГИНА
    ---------------------------------------------------- */
    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '5.0',
                author: 'maxi3219',
                description: 'Цвет сидов, скругления блоков, новый фон + фиксированное правое меню без обрезания',
                init: startObserver
            });
            log('Registered');
        } else {
            log('Standalone mode');
            startObserver();
        }
    }

    register();
})();
