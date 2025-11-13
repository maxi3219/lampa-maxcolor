(() => {
    const plugin_id = 'roundedmenu';
    const plugin_name = 'RoundedMenu';

    function log(...args) {
        try { console.log(`[${plugin_name}]`, ...args); } catch (e) {}
    }

    function applyCustomStyles() {
        const style = document.createElement('style');
        style.id = 'roundedmenu-final-style';
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
                    border-radius: 1em !important;
                    transition: box-shadow 0.3s ease !important;
                }

                /* ✅ Приглушённая градиентная обводка с визуальным зазором */
                .card.selector.focus .card__img,
                .card.selector.hover .card__img,
                .card.selector.traverse .card__img {
                    box-shadow:
                        0 0 0 6px rgba(76, 207, 160, 0.4),
                        0 0 12px rgba(76, 207, 160, 0.3),
                        0 0 24px rgba(76, 138, 168, 0.25) !important;
                }

                /* ✅ Плашки настроек и источников */
                .settings__content,
                .selectbox__content.layer--height {
                    background: rgba(54,54,54,.959) !important;
                    border-radius: 1.2em !important;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8) !important;
                    padding: 0.5em !important;
                }

                /* ✅ Пункты меню и источников */
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
        log('Final styles applied');
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
                version: '3.5',
                author: 'maxi3219',
                description: 'Приглушённая обводка вокруг изображения карточки, без влияния на сетку',
                init: initPlugin
            });
            log('Registered with Lampa');
        } else {
            initPlugin();
        }
    }

    register();
})();
