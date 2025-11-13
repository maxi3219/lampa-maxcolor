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
                /* --- ваши текущие стили для плашек и пунктов --- */

                /* Базовое состояние карточек: тонкая нейтральная рамка */
                .card,
                .card__view {
                    position: relative !important;
                    border-radius: 1em !important;
                    border: 1px solid rgba(255,255,255,0.12) !important;
                    transition: border-color 0.2s ease !important;
                }

                /* Активные состояния карточек: градиентная обводка через псевдо-элемент */
                .card.selector.focus::before,
                .card.selector.hover::before,
                .card.selector.traverse::before,
                .card__view.selector.focus::before,
                .card__view.selector.hover::before,
                .card__view.selector.traverse::before {
                    content: "" !important;
                    position: absolute !important;
                    inset: 0 !important;
                    border-radius: 1em !important;
                    padding: 2px !important; /* толщина рамки */
                    background: linear-gradient(to right, #60ffbd 1%, #62a3c9 100%) !important;

                    /* Маскирование, чтобы осталась только рамка, а контент внутри не перекрывался */
                    -webkit-mask: 
                        linear-gradient(#000 0 0) content-box, 
                        linear-gradient(#000 0 0) !important;
                    -webkit-mask-composite: xor !important;
                    mask-composite: exclude !important;
                    pointer-events: none !important;
                }

                /* Можно слегка усилить рамку по ховеру мышью (если есть) */
                .card:hover::before,
                .card__view:hover::before {
                    padding: 2.5px !important;
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
                version: '2.5',
                author: 'maxi3219',
                description: 'Градиентная обводка карточек только при активном состоянии',
                init: initPlugin
            });
            log('Registered with Lampa');
        } else {
            initPlugin();
        }
    }

    register();
})();
