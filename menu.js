(() => {
    const plugin_id = 'roundedmenu';
    const plugin_name = 'RoundedMenu';

    function log(...args) {
        try { console.log(`[${plugin_name}]`, ...args); } catch (e) {}
    }

    function applyCustomStyles() {
        const style = document.createElement('style');
        style.id = 'roundedmenu-minimal-ring';
        style.innerHTML = `
            @media screen and (min-width: 480px) {
                /* Не трогаем .card и .card__view геометрию
                   Лишь обеспечиваем позиционирование для псевдо-элемента */
                .card .card__view {
                    position: relative !important;
                }

                /* Ничего не меняем в размерах .card__img */
                .card__img {
                    border: none !important;
                    outline: none !important;
                    /* позиционирование нужно только для псевдо-элемента; это не влияет на поток */
                    position: relative !important;
                    border-radius: 1em !important;
                }

                /* Убираем настырные белые рамки, если они всё ещё приходят псевдо-элементами темы */
                .card__view::before,
                .card__view::after {
                    content: none !important;
                    display: none !important;
                }

                /* Приглушённая толстая обводка с зазором — только вокруг изображения.
                   Появляется ТОЛЬКО в активных состояниях карточки. */
                .card.selector.focus .card__img::after,
                .card.selector.hover .card__img::after,
                .card.selector.traverse .card__img::after {
                    content: "" !important;
                    position: absolute !important;

                    /* Зазор: рамка «на расстоянии» от краёв постера */
                    inset: -8px !important;

                    /* Радиус рамки = радиус изображения + зазор */
                    border-radius: calc(1em + 8px) !important;

                    /* Приглушённый градиент (мягче и темнее) */
                    background: linear-gradient(
                        to right,
                        rgba(76, 207, 160, 0.42),
                        rgba(76, 138, 168, 0.36)
                    ) !important;

                    /* Маска-«кольцо»: оставляем только внешний контур, внутренняя часть прозрачная */
                    -webkit-mask:
                        linear-gradient(#000 0 0) content-box,
                        linear-gradient(#000 0 0) !important;
                    -webkit-mask-composite: xor !important;
                    mask-composite: exclude !important;

                    pointer-events: none !important;
                    z-index: 2 !important;
                }

                /* Остальные ваши стили (плашки/пункты) оставляем без изменений — если нужны, добавь ниже */
            }
        `;
        document.head.appendChild(style);
        log('Minimal ring styles applied');
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
                version: '3.4',
                author: 'maxi3219',
                description: 'Толстая приглушённая обводка с зазором вокруг постера, без влияния на сетку',
                init: initPlugin
            });
            log('Registered with Lampa');
        } else {
            initPlugin();
        }
    }

    register();
})();
