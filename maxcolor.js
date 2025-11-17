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

    // Новая версия — фикс меню + правильное поведение на пульте
    function hardFixSettingsPosition() {
        const panels = document.querySelectorAll('.settings__content, .selectbox__content.layer--height');
        panels.forEach(panel => {
            // Аккуратный сдвиг вправо
            panel.style.setProperty('right', '1.5em', 'important');

            // Позиционирование
            panel.style.setProperty('position', 'fixed', 'important');
            panel.style.setProperty('top', '1.5em', 'important');
            panel.style.setProperty('bottom', '1.5em', 'important');

            // Размеры
            panel.style.setProperty('width', '36%', 'important');
            panel.style.setProperty('max-width', '42em', 'important');

            // Внутренние отступы
            panel.style.setProperty('padding', '1em', 'important');
            panel.style.setProperty('padding-bottom', '5em', 'important');

            // Стили
            panel.style.setProperty('overflow-y', 'auto', 'important');
            panel.style.setProperty('border-radius', '1.2em', 'important');
            panel.style.setProperty('background', 'rgb(33 33 33 / 98%)', 'important');
            panel.style.setProperty('box-shadow', '0 8px 24px rgba(0,0,0,0.8)', 'important');
            panel.style.setProperty('display', 'flex', 'important');
            panel.style.setProperty('flex-direction', 'column', 'important');

            // ——— КЛЮЧЕВОЕ — убираем ограничение по высоте, чтобы не резало на пульте
            panel.style.removeProperty('max-height');

            // Спейсер для нижней части (100% не режет элементы)
            const spacerId = 'maxmenu-bottom-spacer';
            if (!panel.querySelector(`#${spacerId}`)) {
                const spacer = document.createElement('div');
                spacer.id = spacerId;
                spacer.style.height = '5em';
                spacer.style.minHeight = '5em';
                spacer.style.flexShrink = '0';
                panel.appendChild(spacer);
            }
        });
    }

    // CSS-страховка
    function addSettingsSafetyCSS() {
        const styleId = 'maxcolor-settings-safety';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @media screen and (min-width: 480px) {
                body.settings--open .settings__content,
                body.selectbox--open .selectbox__content.layer--height {
                    box-sizing: border-box !important;
                }

                /* улучшенный нижний отступ для пульта */
                body.settings--open .settings__content .selector:last-child,
                body.selectbox--open .selectbox__content.layer--height .selector:last-child {
                    margin-bottom: 4em !important;
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
        hardFixSettingsPosition();
        addSettingsSafetyCSS();
    }

    function startObserver() {
        const obs = new MutationObserver(applyStyles);
        obs.observe(document.body, { childList: true, subtree: true });
        applyStyles();
        log('Observer started (v4.6)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '4.6',
                author: 'maxi3219',
                description: 'Цвет сидов, скругления блоков, новый фон, фиксация меню, правый отступ, исправление обрезания для пульта',
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
