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

    // Новая версия — фикс меню + поведение для пульта
    function hardFixSettingsPosition() {
        const panels = document.querySelectorAll('.settings__content, .selectbox__content.layer--height');
        panels.forEach(panel => {
            // === РОВНЫЕ внешние отступы сверху/снизу/справа ===
            // top и bottom — одинаковые, right — немного меньше чтобы панель была ближе к правому краю
            const outerGap = '1.5em';   // запас сверху/снизу
            const rightGap = '0.8em';   // запас справа (меньше => ближе к правому краю)

            panel.style.setProperty('position', 'fixed', 'important');
            panel.style.setProperty('top', outerGap, 'important');
            panel.style.setProperty('bottom', outerGap, 'important');
            panel.style.setProperty('right', rightGap, 'important');
            panel.style.setProperty('left', 'auto', 'important');

            // Размеры — гибкие, не жёсткие
            panel.style.setProperty('width', '36%', 'important');
            panel.style.setProperty('max-width', '42em', 'important');
            panel.style.setProperty('box-sizing', 'border-box', 'important');

            // Внутренние отступы — большой запас снизу для пульта
            panel.style.setProperty('padding-top', '1em', 'important');
            panel.style.setProperty('padding-right', '1em', 'important');
            panel.style.setProperty('padding-left', '1em', 'important');
            panel.style.setProperty('padding-bottom', '6.5em', 'important'); // крупный запас

            // Поведение прокрутки и видимости элемента при фокусе
            panel.style.setProperty('overflow-y', 'auto', 'important');
            // scroll-padding-bottom помогает при scrollIntoView / фокусе пульта
            panel.style.setProperty('scroll-padding-bottom', '7.5em', 'important');
            panel.style.setProperty('overscroll-behavior', 'contain', 'important');

            // Выравнивание содержимого — начало, чтобы не прижималось к низу
            panel.style.setProperty('display', 'flex', 'important');
            panel.style.setProperty('flex-direction', 'column', 'important');
            panel.style.setProperty('justify-content', 'flex-start', 'important');
            panel.style.setProperty('align-items', 'stretch', 'important');

            // Визуальные стили
            panel.style.setProperty('border-radius', '1.2em', 'important');
            panel.style.setProperty('background', 'rgb(33 33 33 / 98%)', 'important');
            panel.style.setProperty('box-shadow', '0 8px 24px rgba(0,0,0,0.8)', 'important');

            // Убираем жесткие ограничения по высоте — это источник обрезания
            panel.style.removeProperty('max-height');

            // Спейсер в конце — дополнительная гарантия, что последний пункт не окажется скрыт
            const spacerId = 'maxmenu-bottom-spacer';
            if (!panel.querySelector(`#${spacerId}`)) {
                const spacer = document.createElement('div');
                spacer.id = spacerId;
                spacer.style.height = '7.5em';
                spacer.style.minHeight = '7.5em';
                spacer.style.flexShrink = '0';
                panel.appendChild(spacer);
            }
        });
    }

    // CSS-страховки (в том числе для фокуса по пульту)
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

                /* явный большой нижний отступ у последнего селектора (на всякий случай) */
                body.settings--open .settings__content .selector:last-child,
                body.selectbox--open .selectbox__content.layer--height .selector:last-child {
                    margin-bottom: 6.5em !important;
                }

                /* при фокусе (пульт/клавиатура) даём дополнительный scroll-margin */
                body.settings--open .settings__content .selector:focus,
                body.selectbox--open .selectbox__content.layer--height .selector:focus {
                    scroll-margin-bottom: 7.5em !important;
                }

                /* если тема жестко обрезает padding, добавим внутренний spacer-элемент */
                #maxmenu-bottom-spacer {
                    display: block;
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
        log('Observer started (v4.7)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '4.7',
                author: 'maxi3219',
                description: 'Цвет сидов, скругления блоков, фон, фикс меню: равные отступы сверху/снизу/справа, исправление обрезания для пульта',
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
