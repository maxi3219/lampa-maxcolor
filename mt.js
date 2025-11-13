(() => {
    /* === Плагин RoundedMenu === */
    const plugin_id_menu = 'roundedmenu';
    const plugin_name_menu = 'RoundedMenu';

    function logMenu(...args) {
        try { console.log(`[${plugin_name_menu}]`, ...args); } catch (e) {}
    }

    function applyCustomMenuStyles() {
        const style = document.createElement('style');
        style.id = 'roundedmenu-style-menuonly';
        style.innerHTML = `
            @media screen and (min-width: 480px) {
                /* === Меню: компактное, справа === */
                .settings__content,
                .selectbox__content.layer--height {
                    position: fixed !important;
                    top: 1em !important;
                    right: 1em !important;
                    left: auto !important;
                    width: 35% !important;
                    max-height: calc(100vh - 2em) !important;
                    overflow-y: auto !important;
                    background: rgba(54,54,54,0.98) !important; /* ← менее прозрачный фон */
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

                /* === Все пункты меню и подменю === */
                .settings-folder.selector,
                .settings-param.selector,
                .settings-param__value.selector,
                .selectbox-item.selector {
                    border-radius: 1em !important;
                    margin-bottom: 0.3em !important;
                    transition: background 0.25s ease !important;
                }

                .settings-folder.selector.focus,
                .settings-folder.selector.hover,
                .settings-folder.selector.traverse,
                .settings-param.selector.focus,
                .settings-param.selector.hover,
                .settings-param.selector.traverse,
                .settings-param__value.selector.focus,
                .settings-param__value.selector.hover,
                .settings-param__value.selector.traverse,
                .selectbox-item.selector.focus,
                .selectbox-item.selector.hover,
                .selectbox-item.selector.traverse {
                    background: linear-gradient(to right, #4dd9a0 1%, #4d8fa8 100%) !important; /* ← затемнённый градиент */
                    border-radius: 1em !important;
                }
            }

            /* === Новый фон для всей Лампы === */
            body {
                background: linear-gradient(135deg, #010a13 0%, #133442 50%, #01161d 100%) !important;
                color: #ffffff !important;
            }

            /* === Иконки в шапке не должны темнеть при наведении === */
            .head__body svg,
            .head__body svg use {
                fill: #fff !important;
                color: #fff !important;
                transition: none !important;
            }

            .head__body .selector.hover svg,
            .head__body .selector.focus svg,
            .head__body .selector.traverse svg {
                fill: #fff !important;
                color: #fff !important;
            }

            .head__body .selector.hover,
            .head__body .selector.focus,
            .head__body .selector.traverse {
                color: inherit !important;
            }
        `;
        document.head.appendChild(style);
        logMenu('Menu styles + dark background applied');
    }

    function initMenuPlugin() {
        if (window.Lampa && typeof Lampa.Listener === 'object') {
            Lampa.Listener.follow('app', function(event){
                if(event.type === 'ready'){
                    applyCustomMenuStyles();
                }
            });
        } else {
            document.addEventListener('DOMContentLoaded', applyCustomMenuStyles);
        }
    }

    function registerMenu() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id_menu,
                name: plugin_name_menu,
                version: '5.5',
                author: 'maxi3219',
                description: 'Скруглённое меню + тёмный фон + фикс цвета иконок',
                init: initMenuPlugin
            });
        } else {
            initMenuPlugin();
        }
    }

    registerMenu();


    /* === Плагин MaxColor === */
    const plugin_id_color = 'maxcolor';
    const plugin_name_color = 'MaxColor';

    const COLORS = {
        low: '#ff3333',   // <5 — красный
        mid: '#ffcc00',   // 5–10 — жёлтый
        high: '#00ff00'   // >10 — зелёный
    };

    function logColor(...a) {
        try { console.log(`[${plugin_name_color}]`, ...a); } catch (e) {}
    }

    function recolorSeedNumbers() {
        const seedBlocks = document.querySelectorAll('.torrent-item__seeds');
        seedBlocks.forEach(block => {
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

    function startObserver() {
        const obs = new MutationObserver(() => recolorSeedNumbers());
        obs.observe(document.body, { childList: true, subtree: true });
        recolorSeedNumbers();
        logColor('Observer started (v2.0)');
    }

    function registerColor() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id_color,
                name: plugin_name_color,
                version: '2.0',
                author: 'maxi3219',
                description: 'Окрашивает число после "Раздают:" без свечения',
                init: startObserver
            });
        } else {
            startObserver();
        }
    }

    registerColor();
})();
