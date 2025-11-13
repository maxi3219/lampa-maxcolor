(() => {
    const plugin_id = 'roundedmenu';
    const plugin_name = 'RoundedMenu';

    function log(...args) {
        try { console.log(`[${plugin_name}]`, ...args); } catch (e) {}
    }

    function applyCustomStyles() {
        const style = document.createElement('style');
        style.id = 'roundedmenu-enhanced-style';
        style.innerHTML = `
            @media screen and (min-width: 480px) {
                /* ✅ Убираем белые рамки и тени */
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

                .card::before,
                .card::after,
                .card__view::before,
                .card__view::after {
                    content: none !important;
                    display: none !important;
                }

                /* ✅ Подготовка изображения */
                .card__img,
                .card__poster,
                .card__view img {
                    border-radius: 1em !important;
                    transition: box-shadow 0.3s ease, outline 0.3s ease !important;
                }

                /* ✅ Градиентная рамка с зазором и свечением */
                .card.selector.focus .card__img,
                .card.selector.hover .card__img,
                .card.selector.traverse .card__img,
                .card.selector.focus .card__poster,
                .card.selector.hover .card__poster,
                .card.selector.traverse .card__poster,
                .card.selector.focus .card__view img,
                .card.selector.hover .card__view img,
                .card.selector.traverse .card__view img {
                    outline: 3px solid transparent !important;
                    outline-offset: 6px !important;
                    border-radius: 1em !important;
                    box-shadow:
                        0 0 0 4px rgba(76, 207, 160, 0.6),
                        0 0 12px rgba(76, 207, 160, 0.5),
                        0 0 24px rgba(76, 138, 168, 0.4) !important;
                }

                /* ✅ Плашки и пункты */
                .settings__content,
                .selectbox__content.layer--height {
                    background: rgba(54,54,54,.959) !important;
                    border-radius: 1.2em !important;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8) !important;
                    padding: 0.5em !important;
                }

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
        log('Enhanced styles applied');
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
                version: '3.6',
                author: 'maxi3219',
                description: 'Градиентная рамка с зазором и свечением, работает на CUB и TMDB',
                init: initPlugin
            });
            log('Registered with Lampa');
        } else {
            initPlugin();
        }
    }

    register();
})();
