(() => {
    const plugin_id = 'roundedmenu';
    const plugin_name = 'RoundedMenu';

    function log(...args) {
        try { console.log(`[${plugin_name}]`, ...args); } catch (e) {}
    }

    function applyCustomStyles() {
        const style = document.createElement('style');
        style.id = 'custom-rounded-settings-style';
        style.innerHTML = `
            @media screen and (min-width: 480px) {
                /* === Плашки настроек и источников === */
                .settings__content {
                    position: fixed !important;
                    top: 1em !important;
                    right: 1em !important;
                    left: auto !important;
                    width: 35% !important;
                    max-height: calc(100vh - 2em) !important;
                    overflow-y: auto !important;
                    background: rgba(54,54,54,.959) !important;
                    border-radius: 1.2em !important;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8) !important;
                    padding: 0.5em !important;
                    display: flex !important;
                    flex-direction: column !important;
                    transform: translateX(100%) !important;
                    transition: transform 0.3s ease, opacity 0.3s ease !important;
                    z-index: 999 !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                }
                body.settings--open .settings__content {
                    transform: translateX(0) !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }

                .selectbox__content.layer--height {
                    position: fixed !important;
                    top: 1em !important;
                    right: 1em !important;
                    left: auto !important;
                    width: 35% !important;
                    max-height: calc(100vh - 2em) !important;
                    overflow-y: auto !important;
                    background: rgba(54,54,54,.959) !important;
                    border-radius: 1.2em !important;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8) !important;
                    padding: 0.5em !important;
                    display: flex !important;
                    flex-direction: column !important;
                    transform: translateX(100%) !important;
                    transition: transform 0.3s ease, opacity 0.3s ease !important;
                    z-index: 999 !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                }
                body.selectbox--open .selectbox__content.layer--height {
                    transform: translateX(0) !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }

                .settings-folder.selector {
                    border-radius: 1em !important;
                    margin-bottom: 0.3em !important;
                    transition: background 0.25s ease !important;
                }
                .settings-folder.selector.focus,
                .settings-folder.selector.hover,
                .settings-folder.selector.traverse {
                    background: linear-gradient(to right, #60ffbd 1%, #62a3c9 100%) !important;
                    border-radius: 1em !important;
                }

                .selectbox-item.selector {
                    border-radius: 1em !important;
                    margin-bottom: 0.3em !important;
                    transition: background 0.25s ease !important;
                }
                .selectbox-item.selector.focus,
                .selectbox-item.selector.hover,
                .selectbox-item.selector.traverse {
                    background: linear-gradient(to right, #60ffbd 1%, #62a3c9 100%) !important;
                    border-radius: 1em !important;
                }

                /* === Карточки: гашим встроенную белую рамку и переносим свечение на изображение === */

                /* 1) Жёстко отключаем встроенную белую рамку (обычно рисуется псевдо-элементом на .card.selector) */
                .card.selector::before,
                .card.selector::after {
                    content: none !important;
                    display: none !important;
                }

                /* 2) Убираем любые бордеры/аутлайны у слоёв */
                .card,
                .card__view,
                .card__img,
                .card__title,
                .card__age {
                    border: none !important;
                    outline: none !important;
                    box-shadow: none !important;
                }

                /* 3) Готовим визуальный контейнер изображения для свечения */
                .card .card__view {
                    position: relative !important;
                    border-radius: 1em !important;
                    overflow: visible !important; /* чтобы тень не обрезалась */
                }

                /* 4) Свечение вокруг ВСЕЙ карточки (именно блока с изображением), только в активных состояниях */
                .card.selector.focus .card__view,
                .card.selector.hover .card__view,
                .card.selector.traverse .card__view {
                    box-shadow:
                        0 0 0 2px rgba(96, 255, 189, 0.9),
                        0 0 16px rgba(96, 255, 189, 0.45),
                        0 0 28px rgba(98, 163, 201, 0.35) !important;
                }

                /* Дополнительно: подчистим возможный внутренний контур на изображении */
                .card__img {
                    background: none !important;
                }
            }
        `;
        document.head.appendChild(style);
        log('Custom styles applied');
    }

    function initPlugin() {
        if (window.Lampa && typeof Lampa.Listener === 'object') {
            Lampa.Listener.follow('app', function(event){
                if(event.type === 'ready'){
                    applyCustomStyles();
                }
            });
            log('Lampa listener attached');
        } else {
            document.addEventListener('DOMContentLoaded', applyCustomStyles);
            log('Standalone mode');
        }
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '2.9',
                author: 'maxi3219',
                description: 'Единые плашки и корректное свечение вокруг карточек',
                init: initPlugin
            });
            log('Registered with Lampa');
        } else {
            initPlugin();
        }
    }

    register();
})();
