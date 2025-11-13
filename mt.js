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
                    background: rgba(54,54,54,0.98) !important;
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
                    background: linear-gradient(to right, #4dd9a0 1%, #4d8fa8 100%) !important;
                    border-radius: 1em !important;
                }
            }

            /* === Новый фон для всей Лампы === */
            body {
                background: linear-gradient(135deg, #010a13 0%, #133442 50%, #01161d 100%) !important;
                color: #ffffff !important;
            }

            /* === Фикс: иконки всегда белые === */
            .head__action.selector.open--settings svg,
            .head__action.selector.open--settings svg use,
            .head__action.selector.notice--icon svg,
            .head__action.selector.notice--icon svg use,
            .head__action.selector.open--search svg,
            .head__action.selector.open--search svg use,
            #MRELOAD svg,
            #MRELOAD svg use {
                color: #ffffff !important;
                fill: #ffffff !important;
                stroke: none !important;
                outline: none !important;
            }
            .head__action.selector.open--settings:hover svg,
            .head__action.selector.open--settings:hover svg use,
            .head__action.selector.notice--icon:hover svg,
            .head__action.selector.notice--icon:hover svg use,
            .head__action.selector.open--search:hover svg,
            .head__action.selector.open--search:hover svg use,
            #MRELOAD:hover svg,
            #MRELOAD:hover svg use {
                color: #ffffff !important;
                fill: #ffffff !important;
                stroke: none !important;
                outline: none !important;
            }
        `;
        document.head.appendChild(style);
        logMenu('Menu styles + dark background + icon fixes applied');
    }

    /* === Добавляем кнопку MRELOAD === */
    function addReloadButton() {
        if (document.getElementById('MRELOAD')) return;
        const actions = document.querySelector('.head__actions');
        if (!actions) return;

        const div = document.createElement('div');
        div.id = 'MRELOAD';
        div.className = 'head__action selector m-reload-screen';
        div.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path>
            </svg>
        `;
        div.addEventListener('click', () => location.reload());
        actions.appendChild(div);
        logMenu('Reload button added');
    }

    function initMenuPlugin() {
        if (window.Lampa && typeof Lampa.Listener === 'object') {
            Lampa.Listener.follow('app', function(event){
                if(event.type === 'ready'){
                    applyCustomMenuStyles();
                    addReloadButton();
                }
            });
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                applyCustomMenuStyles();
                addReloadButton();
            });
        }
    }

    function registerMenu() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id_menu,
                name: plugin_name_menu,
                version: '6.4',
                author: 'maxi3219',
                description: 'Скруглённое меню + тёмный фон + фикс иконок + кнопка перезагрузки',
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
        low: '#ff3333',
        mid: '#ffcc00',
        high: '#00ff00'
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
        const obs
