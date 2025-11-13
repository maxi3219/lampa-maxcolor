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
                /* ✅ Убираем белую рамку и тени */
                .card,
                .card__view,
                .card__img {
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
                .card__img {
                    position: relative !important;
                    border-radius: 1em !important;
                    z-index: 1 !important;
                }

                /* ✅ Градиентная рамка с зазором через псевдо-элемент */
                .card.selector.focus .card__img::after,
                .card.selector.hover .card__img::after,
                .card.selector.traverse .card__img::after {
                    content: "" !important;
                    position: absolute !important;
                    inset: -6px !important; /* зазор между рамкой и изображением */
                    border-radius: 1.2em !important;
                    background: linear-gradient(to right, #4ccfa0 1%, #4c8aa8 100%) !important;

                    /* Маска: оставляем только рамку */
                    -webkit-mask: 
                        linear-gradient(#000 0 0) content-box, 
                        linear-gradient(#000 0 0) !important;
                    -webkit-mask-composite: xor !important;
                    mask-composite: exclude !important;

                    pointer-events: none !important;
                    z-index: 2 !important;
                }

                /* ✅ Плашки и пункты — как раньше */
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
                version: '3.2',
                author: 'maxi3219',
                description: 'Приглушённая рамка с зазором вокруг изображения карточки',
                init: initPlugin
            });
            log('Registered with Lampa');
        } else {
            initPlugin();
        }
    }

    register();
})();
