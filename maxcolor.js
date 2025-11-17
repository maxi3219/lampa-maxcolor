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

    // Фон подложки приложения
    function changeBackground() {
        const backgroundBlock = document.querySelector('.background');
        if (backgroundBlock) {
            backgroundBlock.style.background = GRADIENT;
            backgroundBlock.style.setProperty('background', GRADIENT, 'important');
        }
    }

    // Стили кнопок
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

    // Жёсткий CSS - чтобы перебить любые стили Lampa (если будут пересоздавать)
    function injectForceCSS() {
        const id = 'maxcolor-force-css';
        if (document.getElementById(id)) return;

        const style = document.createElement('style');
        style.id = id;
        style.textContent = `
            /* Очень специфичный и важный блок стилей для панели настроек/selectbox */
            html body.settings--open .settings__content,
            html body.selectbox--open .selectbox__content.layer--height,
            body.settings--open .settings__content,
            body.selectbox--open .selectbox__content.layer--height {
                position: fixed !important;
                /* одинаковые внешние отступы сверху/снизу (outerGap) и справа (rightGap) */
                top: 1.5em !important;
                bottom: 1.5em !important;
                right: 0.8em !important;
                left: auto !important;

                width: 36% !important;
                max-width: 42em !important;
                box-sizing: border-box !important;
                padding: 1em !important;
                padding-bottom: 7.5em !important; /* большой запас для пульта */
                display: flex !important;
                flex-direction: column !important;
                justify-content: flex-start !important; /* не прижимать к низу */
                align-items: stretch !important;
                overflow-y: auto !important;
                -webkit-overflow-scrolling: touch !important;
                scroll-padding-bottom: 8.5em !important;
                overscroll-behavior: contain !important;

                background: rgb(33 33 33 / 98%) !important;
                border-radius: 1.2em !important;
                box-shadow: 0 8px 24px rgba(0,0,0,0.85) !important;
                transform: none !important;
                margin: 0 !important;
                z-index: 99999 !important;
            }

            /* Последний элемент — дополнительный отступ + защита для фокуса */
            body.settings--open .settings__content .selector:last-child,
            body.selectbox--open .selectbox__content.layer--height .selector:last-child {
                margin-bottom: 7.5em !important;
            }

            /* При фокусе (пульт) добавляем scroll-margin чтобы элемент не прятался */
            body.settings--open .settings__content .selector:focus,
            body.selectbox--open .selectbox__content.layer--height .selector:focus {
                scroll-margin-bottom: 8.5em !important;
            }

            /* Гарантируем, что вставленный spacer видим и занимает место */
            #maxmenu-bottom-spacer {
                display: block !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Переносим панель в body, применяем inline-стили и добавляем spacer
    function hardFixSettingsPosition() {
        const panels = Array.from(document.querySelectorAll('.settings__content, .selectbox__content.layer--height'));

        panels.forEach(panel => {
            try {
                // Если панель вложена в контейнер с transform, fixed будет "привязан" к нему.
                // Перенесём саму панель в body, чтобы fixed работал корректно.
                if (panel.parentNode && panel.parentNode !== document.body) {
                    document.body.appendChild(panel);
                }

                // Я всё равно ставлю инлайн-стили — это помогает при первой отрисовке
                panel.style.position = 'fixed';
                panel.style.top = '1.5em';
                panel.style.bottom = '1.5em';
                panel.style.right = '0.8em';
                panel.style.left = 'auto';
                panel.style.width = '36%';
                panel.style.maxWidth = '42em';
                panel.style.boxSizing = 'border-box';
                panel.style.padding = '1em';
                panel.style.paddingBottom = '7.5em';
                panel.style.display = 'flex';
                panel.style.flexDirection = 'column';
                panel.style.justifyContent = 'flex-start';
                panel.style.overflowY = 'auto';
                panel.style.webkitOverflowScrolling = 'touch';
                panel.style.scrollPaddingBottom = '8.5em';
                panel.style.transform = 'none';
                panel.style.zIndex = '99999';

                // Удалим max-height, если он там был
                panel.style.removeProperty('max-height');

                // Спейсер в конце
                const spacerId = 'maxmenu-bottom-spacer';
                if (!panel.querySelector(`#${spacerId}`)) {
                    const spacer = document.createElement('div');
                    spacer.id = spacerId;
                    spacer.style.height = '8.5em';
                    spacer.style.minHeight = '8.5em';
                    spacer.style.flexShrink = '0';
                    panel.appendChild(spacer);
                }
            } catch (e) {
                // не критично, но логируем
                log('hardFixSettingsPosition error', e);
            }
        });
    }

    function addSettingsSafetyCSS() {
        const styleId = 'maxcolor-settings-safety';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @media screen and (min-width: 360px) {
                body.settings--open .settings__content,
                body.selectbox--open .selectbox__content.layer--height {
                    box-sizing: border-box !important;
                }

                body.settings--open .settings__content .selector:last-child,
                body.selectbox--open .selectbox__content.layer--height .selector:last-child {
                    margin-bottom: 7.5em !important;
                }

                body.settings--open .settings__content .selector:focus,
                body.selectbox--open .selectbox__content.layer--height .selector:focus {
                    scroll-margin-bottom: 8.5em !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function applyStyles() {
        recolorSeedNumbers();
        roundCorners();
        changeBackground();
        enforceButtonsRadius();
        injectForceCSS();        // самый важный — CSS с !important
        hardFixSettingsPosition(); // перенос в body + inline-стили
        addSettingsSafetyCSS();
    }

    function startObserver() {
        const obs = new MutationObserver(() => {
            // запускаем с небольшим дебаунсом, чтобы не дергать Lampa постоянно
            try {
                applyStyles();
            } catch (e) {
                log('applyStyles error', e);
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
        // первичный вызов
        applyStyles();
        log('Observer started (v4.8)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '4.8',
                author: 'maxi3219',
                description: 'Fix: одинаковые отступы, перемещение панели в body, сильный CSS, защита нижнего отступа для пульта',
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
