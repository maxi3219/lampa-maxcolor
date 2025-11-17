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

    // Фикс меню: реальный сдвиг вправо, сброс transform/left/inset и нижний спейсер
    function fixSettingsBlock() {
        const styleId = 'maxcolor-settings-fix';
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

                    /* Жёсткий сдвиг вправо и сброс конфликтов */
                    right: 4em !important;
                    left: auto !important;
                    inset: auto !important;
                    transform: none !important;
                    margin: 0 !important;

                    width: 35% !important;
                    max-width: 40em !important;
                    max-height: calc(100vh - 2em) !important;

                    overflow-y: auto !important;
                    box-sizing: border-box !important;

                    background: rgb(33 33 33 / 98%) !important;
                    border-radius: 1.2em !important;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.8) !important;

                    padding: 1em 1em 3.5em 1em !important; /* запас снизу внутри */
                    display: flex !important;
                    flex-direction: column !important;
                }

                /* Гарантированный нижний "спейсер" через псевдоэлемент контейнера */
                .settings__content::after,
                .selectbox__content.layer--height::after {
                    content: '' !important;
                    display: block !important;
                    height: 2.5em !important;
                    flex: 0 0 auto !important;
                }

                /* Доп. запас последнему реальному пункту на случай агрессивных тем */
                .settings__content .selector:last-child,
                .selectbox__content.layer--height .selector:last-child {
                    margin-bottom: 2em !important;
                }

                /* Страховка против анимаций, которые оставляют "хвост" сбоку */
                body.settings--open .settings__content,
                body.selectbox--open .selectbox__content.layer--height {
                    transform: none !important;
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
        fixSettingsBlock();
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
                description: 'Цвет сидов, скругления блоков, новый фон и жёсткий фикс позиционирования меню',
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
