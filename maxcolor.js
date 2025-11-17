(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    const COLORS = { low: '#ff3333', mid: '#ffcc00', high: '#00ff00' };
    const BLOCK_RADIUS = '0.9em';
    const ACTIVE_RADIUS = '0.6em';
    const GRADIENT = 'linear-gradient(117deg, rgb(0 0 0) 0%, rgb(11 26 35) 50%, rgb(14, 14, 14) 100%)';

    function log(...a) { try { console.log(`[${plugin_name}]`, ...a); } catch (e) {} }

    // Окраска сидов
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

    // Скругления блоков
    function roundCorners() {
        document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render')
            .forEach(item => item.style.borderRadius = BLOCK_RADIUS);
        document.querySelectorAll('.watched-history.selector')
            .forEach(item => item.style.borderRadius = BLOCK_RADIUS);
    }

    // Фон приложения
    function changeBackground() {
        const backgroundBlock = document.querySelector('.background');
        if (backgroundBlock) {
            backgroundBlock.style.background = GRADIENT;
            backgroundBlock.style.setProperty('background', GRADIENT, 'important');
        }
    }

    // Кнопки
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

    // CSS для панели настроек и селектбокса
    function injectSettingsCSS() {
        const styleId = 'maxcolor-settings-css';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @media screen and (min-width: 480px) {
                .settings__content,
                .selectbox__content.layer--height {
                    position: fixed !important;
                    top: 1em !important;
                    bottom: 1em !important;

                    /* реальный сдвиг вправо и сброс конфликтов */
                    right: 4em !important;
                    left: auto !important;
                    inset: auto !important;
                    transform: none !important;
                    margin: 0 !important;

                    width: 35% !important;
                    max-width: 40em !important;
                    max-height: calc(100vh - 2em) !important;

                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    box-sizing: border-box !important;

                    background: rgb(33 33 33 / 98%) !important;
                    border-radius: 1.2em !important;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.8) !important;

                    /* внутренний отступ + прокрутка с запасом снизу */
                    padding: 1em 1em 3.5em 1em !important;
                    scroll-padding-bottom: 3.5em !important;
                    overscroll-behavior: contain !important;

                    display: flex !important;
                    flex-direction: column !important;
                }

                /* страховка видимости: не прячем панель в открытом состоянии */
                body.settings--open .settings__content,
                body.selectbox--open .selectbox__content.layer--height {
                    visibility: visible !important;
                    opacity: 1 !important;
                }

                /* доп. запас последнему реальному пункту */
                .settings__content .selector:last-child,
                .selectbox__content.layer--height .selector:last-child {
                    margin-bottom: 2em !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Фокусируемый «стоп-элемент» в конце, чтобы навигация пультом не обрезала последний пункт
    function ensureBottomFocusStop() {
        const panels = document.querySelectorAll('.settings__content, .selectbox__content.layer--height');
        panels.forEach(panel => {
            const stopId = 'max-bottom-focus-stop';
            if (!panel.querySelector('#' + stopId)) {
                const stop = document.createElement('div');
                stop.id = stopId;
                stop.className = 'settings-param selector'; // чтобы вписаться в поток фокуса
                stop.tabIndex = 0;
                stop.setAttribute('aria-hidden', 'false');
                stop.style.minHeight = '2.5em';
                stop.style.height = '2.5em';
                stop.style.marginTop = '0.5em';
                stop.style.marginBottom = '0.5em';
                stop.style.opacity = '0';        // невидимка
                stop.style.pointerEvents = 'none';
                // pointerEvents: none, но для ТВ фокуса иногда нужно true — оставим фокус через DOM, но без клика
                stop.style.pointerEvents = 'auto';
                panel.appendChild(stop);
            }
        });
    }

    // Перестраховка на событии открытия, чтобы все правки применялись после рендера
    function hookOpenEvents() {
        if (window.Lampa && typeof Lampa.Listener === 'object') {
            Lampa.Listener.follow('app', e => {
                if (e.type === 'settings_open' || e.type === 'selectbox_open' || e.type === 'ready') {
                    setTimeout(() => {
                        injectSettingsCSS();
                        ensureBottomFocusStop();
                    }, 0);
                }
            });
        }
        document.addEventListener('DOMContentLoaded', () => {
            injectSettingsCSS();
            ensureBottomFocusStop();
        });
    }

    function applyStyles() {
        recolorSeedNumbers();
        roundCorners();
        changeBackground();
        enforceButtonsRadius();
        injectSettingsCSS();
        ensureBottomFocusStop();
    }

    function startObserver() {
        const obs = new MutationObserver(() => {
            applyStyles();
        });
        obs.observe(document.body, { childList: true, subtree: true });
        applyStyles();
        hookOpenEvents();
        log('Observer started (v4.7)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '4.7',
                author: 'maxi3219',
                description: 'Фикс меню для ТВ: отступ снизу при навигации пультом, реальный сдвиг вправо, без подсветок',
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
