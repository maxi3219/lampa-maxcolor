(() => {
    const plugin_id = 'roundedmenu';
    const plugin_name = 'RoundedMenu';

    function log(...args) {
        try { console.log(`[${plugin_name}]`, ...args); } catch (e) {}
    }

    function applyCustomStyles() {
        const style = document.createElement('style');
        style.id = 'roundedmenu-style';
        style.innerHTML = `
            @media screen and (min-width: 480px) {
                /* === Контейнер постера === */
                .card__view {
                    position: relative !important;
                    border-radius: 1em !important;
                    overflow: visible !important;
                }

                /* === Градиентное кольцо с прозрачным зазором === */
                .card.selector.focus .card__view::after,
                .card.selector.hover .card__view::after,
                .card.selector.traverse .card__view::after {
                    content: "" !important;
                    position: absolute !important;
                    inset: -8px !important; /* зазор */
                    border-radius: calc(1em + 8px) !important;
                    background: linear-gradient(to right, #60ffbd 1%, #62a3c9 100%) !important;

                    /* маска: оставляем только кольцо */
                    -webkit-mask:
                        linear-gradient(#000 0 0) content-box,
                        linear-gradient(#000 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;

                    pointer-events: none !important;
                    z-index: 2 !important;
                }

                /* === Меню и подменю === */
                .settings__content,
                .selectbox__content.layer--height {
                    position: fixed !important;
                    top: 1em !important;
                    right: 1em !important;
                    width: 35% !important;
                    max-height: calc(100vh - 2em) !important;
                    overflow-y: auto !important;
                    background: rgba(54,54,54,.959) !important;
                    border-radius: 1.2em !important;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.8) !important;
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

                .settings-folder.selector,
                .settings-param.selector,
                .settings-param__value.selector,
                .selectbox-item.selector {
                    border-radius: 1em !important;
                    margin-bottom: 0.3em !important;
                    transition: background 0.25s ease !important;
                }
                .settings-folder.selector.focus,
                .settings-param.selector.focus,
                .settings-param__value.selector.focus,
                .selectbox-item.selector.focus,
                .settings-folder.selector.hover,
                .settings-param.selector.hover,
                .settings-param__value.selector.hover,
                .selectbox-item.selector.hover,
                .settings-folder.selector.traverse,
                .settings-param.selector.traverse,
                .settings-param__value.selector.traverse,
                .selectbox-item.selector.traverse {
                    background: linear-gradient(to right, #60ffbd 1%, #62a3c9 100%) !important;
                    border-radius: 1em !important;
                }
            }
        `;
        document.head.appendChild(style);
        log('Gradient ring applied');
    }

    function initPlugin() {
        if (window.Lampa && typeof Lampa.Listener === 'object') {
            Lampa.Listener.follow('app', function(event){
                if(event.type === 'ready'){
                    applyCustomStyles();
                }
            });
        } else {
            document.addEventListener('DOMContentLoaded', applyCustomStyles);
        }
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '4.9',
                author: 'maxi3219',
                description: 'Градиентное кольцо с прозрачным зазором вокруг постера + градиентное меню',
                init: initPlugin
            });
        } else {
            initPlugin();
        }
    }

    register();
})();
