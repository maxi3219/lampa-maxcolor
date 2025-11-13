(() => {
    const plugin_id = 'roundedmenu';
    const plugin_name = 'RoundedMenu';

    function log(...args) {
        try { console.log(`[${plugin_name}]`, ...args); } catch (e) {}
    }

    function applyCustomStyles() {
        const style = document.createElement('style');
        style.id = 'roundedmenu-style-fixed';
        style.innerHTML = `
            @media screen and (min-width: 480px) {
                /* === Карточки === */
                .card,
                .card__view,
                .card__img,
                .card__poster,
                .card__view img {
                    border: none !important;
                    outline: none !important;
                    box-shadow: none !important;
                    background: none !important;
                }

                /* Убираем вспышку белой рамки */
                .card.selector {
                    outline: none !important;
                    border: none !important;
                }

                .card::before,
                .card::after,
                .card__view::before,
                .card__view::after {
                    content: none !important;
                    display: none !important;
                }

                .card__img,
                .card__poster,
                .card__view img {
                    border-radius: 1em !important;
                    transition: box-shadow 0.3s ease !important;
                }

                /* ✅ Яркая рамка с зазором */
                .card.selector.focus .card__img,
                .card.selector.hover .card__img,
                .card.selector.traverse .card__img,
                .card.selector.focus .card__poster,
                .card.selector.hover .card__poster,
                .card.selector.traverse .card__poster,
                .card.selector.focus .card__view img,
                .card.selector.hover .card__view img,
                .card.selector.traverse .card__view img {
                    outline: none !important; /* убираем белый контур */
                    box-shadow:
                        0 0 0 6px rgba(96, 255, 189, 0.9),
                        0 0 16px rgba(96, 255, 189, 0.7),
                        0 0 32px rgba(98, 163, 201, 0.6) !important;
                }

                /* === Меню: возвращаем исходный компактный стиль === */
                .settings__content,
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

                body.settings--open .settings__content,
                body.selectbox--open .selectbox__content.layer--height {
                    transform: translateX(0) !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }

                /* === Пункты меню и источников === */
                .settings-folder.selector,
                .selectbox-item.selector {
                    border-radius: 1em !important;
                    margin-bottom: 0.3em !important;
                    transition: background 0.25s ease !important;
                }

                .settings-folder.selector.focus,
                .settings-folder.selector.hover,
                .settings-folder.selector.traverse,
                .selectbox-item.selector.focus,
                .selectbox-item.selector.hover,
                .selectbox-item.selector.traverse {
                    background: linear-gradient(to right, #60ffbd 1%, #62a3c9 100%) !important;
                    border-radius: 1em !important;
                }
            }
        `;
        document.head.appendChild(style);
        log('Fixed styles applied');
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
                version: '3.8',
                author: 'maxi3219',
                description: 'Убираем белую вспышку рамки и возвращаем компактное меню',
                init: initPlugin
            });
            log('Registered with Lampa');
        } else {
            initPlugin();
        }
    }

    register();
})();
