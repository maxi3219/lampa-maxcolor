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

    /* ------------------ UI: Окраска сидов / скругления / фон ------------------ */
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

    function roundCorners() {
        document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render')
            .forEach(item => item.style.borderRadius = BLOCK_RADIUS);
        document.querySelectorAll('.watched-history.selector')
            .forEach(item => item.style.borderRadius = BLOCK_RADIUS);
    }

    function changeBackground() {
        const backgroundBlock = document.querySelector('.background');
        if (backgroundBlock) {
            backgroundBlock.style.background = GRADIENT;
            backgroundBlock.style.setProperty('background', GRADIENT, 'important');
        }
    }

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

    /* ------------------ Основной фикс меню: CSS + JS ------------------ */

    function injectMenuCSS() {
        if (document.getElementById('maxcolor-menu-fix-v2')) return;

        const style = document.createElement('style');
        style.id = 'maxcolor-menu-fix-v2';
        style.textContent = `
            /* 1) Панель: явные одинаковые отступы сверху/снизу/справа, фиксированная ширина */
            .selectbox__content.layer--height,
            .settings__content {
                /* не трогаем transform (Lampa может использовать анимацию) */
                position: fixed !important;
                box-sizing: border-box !important;

                /* одинаковые отступы вокруг: top/bottom = 1.5em, right = 1.5em */
                top: 1.5em !important;
                bottom: 1.5em !important;
                right: 1.5em !important;
                left: auto !important;

                /* напрямую перебиваем inset (Lampa часто ставит inline inset). 
                   Используем auto как левую сторону, чтобы вычисления шли по правому краю */
                inset: 1.5em 1.5em 1.5em auto !important;

                width: 36% !important;
                max-width: 42em !important;

                padding: 1em !important;
                padding-bottom: 5em !important; /* запас для пульта */
                border-radius: 1.2em !important;
                background: rgba(33,33,33,0.98) !important;

                /* указав height:auto и max-height мы предотвращаем "вздутие" высоты (2639px etc) */
                height: auto !important;
                max-height: calc(100vh - 3em) !important;

                overflow: hidden !important; /* внешний контейнер не должен показывать фон справа */
                display: flex !important;
                flex-direction: column !important;
                z-index: 99999 !important;
            }

            /* 2) Внутренние скроллы — разрешаем скролл и убираем принудительную высоту */
            .selectbox__content.layer--height .selectbox__body,
            .settings__content .settings__body,
            .scroll,
            .scroll__content,
            .scroll__body {
                height: auto !important;
                max-height: none !important;
                overflow-y: auto !important;
                -webkit-overflow-scrolling: touch !important;
            }

            /* 3) Порог видимости / фокуса — чтобы при пульте элемент не уходил за край */
            .scroll__body {
                scroll-padding-bottom: 6.5em !important; /* нужен запас для scrollIntoView */
            }

            .selector,
            .settings-folder.selector {
                scroll-margin-bottom: 6.5em !important;
            }

            .selector:focus,
            .settings-folder.selector:focus {
                outline: none !important;
                scroll-margin-bottom: 6.5em !important;
            }

            /* 4) Специальная защита: если тема рисует фон шире, скрываем фон-полоску */
            .selectbox__content.layer--height,
            .settings__content {
                overflow-x: hidden !important;
            }

            /* 5) Вставочный spacer в CSS (доп. страховка) */
            .scroll__body::after {
                content: "" !important;
                display: block !important;
                height: 4.5em !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // JS: добавляет inline !important там, где Lampa мгновенно перезаписывает стили, и вставляет spacer-элемент если нужно
    function adjustPanelsInline() {
        const panels = document.querySelectorAll('.selectbox__content.layer--height, .settings__content');

        panels.forEach(panel => {
            try {
                // 1) Перебиваем inline-стили height (если Lampa ставит большую фиксированную высоту)
                panel.style.setProperty('height', 'auto', 'important');
                panel.style.setProperty('max-height', 'calc(100vh - 3em)', 'important');

                // 2) Устанавливаем right/top/bottom inline — на случай быстрой перезаписи Lampa
                panel.style.setProperty('top', '1.5em', 'important');
                panel.style.setProperty('bottom', '1.5em', 'important');
                panel.style.setProperty('right', '1.5em', 'important');
                panel.style.setProperty('left', 'auto', 'important');

                // 3) Ширина/box-sizing/padding
                panel.style.setProperty('width', '36%', 'important');
                panel.style.setProperty('max-width', '42em', 'important');
                panel.style.setProperty('box-sizing', 'border-box', 'important');
                panel.style.setProperty('padding', '1em', 'important');
                panel.style.setProperty('padding-bottom', '5em', 'important');

                // 4) Внутренний скролл: найдем .scroll__body и добавим spacer, если не добавлен
                const scrollBodies = panel.querySelectorAll('.scroll__body');
                scrollBodies.forEach(sb => {
                    // удаляем inline height, если есть
                    sb.style.setProperty('height', 'auto', 'important');
                    sb.style.setProperty('max-height', 'none', 'important');

                    const spacerId = 'maxcolor-scroll-spacer';
                    if (!sb.querySelector(`#${spacerId}`)) {
                        const spacer = document.createElement('div');
                        spacer.id = spacerId;
                        // spacer height чуть больше scroll-padding-bottom
                        spacer.style.height = '6.5em';
                        spacer.style.minHeight = '6.5em';
                        spacer.style.flexShrink = '0';
                        spacer.style.pointerEvents = 'none';
                        sb.appendChild(spacer);
                    }
                });

                // 5) Убедимся, что контейнер не показывает фоновый "кусок" справа
                panel.style.setProperty('overflow-x', 'hidden', 'important');
            } catch (e) {
                log('adjustPanelsInline error', e);
            }
        });
    }

    /* ------------------ Повышаем видимость фокуса (не ломая Lampa) ------------------ */
    function ensureFocusBehavior() {
        // если Lampa использует классы для фокусного состояния — усиливаем видимость и scroll-margin
        const styleId = 'maxcolor-focus-helpers';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .selector.layer--focus,
            .selector.focus,
            .settings-folder.selector.focus {
                outline: none !important;
                /* не даём элементу прятаться за низ — запас видимости */
                scroll-margin-bottom: 6.5em !important;
            }
        `;
        document.head.appendChild(style);
    }

    /* ------------------ Всё вместе ------------------ */
    function applyAll() {
        recolorSeedNumbers();
        roundCorners();
        changeBackground();
        enforceButtonsRadius();
        injectMenuCSS();
        adjustPanelsInline();
        ensureFocusBehavior();
    }

    function startObserver() {
        const obs = new MutationObserver(mutations => {
            // ставим простую защиту: если появились панели или изменились — подправим
            try {
                applyAll();
            } catch (e) {
                log('applyAll error', e);
            }
        });

        obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
        // первичный вызов
        applyAll();
        log('Observer started (v5.1)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '5.1',
                author: 'maxi3219',
                description: 'Fix menu positioning: right offset, equal top/bottom, prevent clipping with remote, preserve Lampa behavior',
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
