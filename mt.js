(() => {
    const plugin_id_menu = 'roundedmenu';

    function applyCustomMenuStyles() {
        const style = document.createElement('style');
        style.id = 'roundedmenu-style';
        style.innerHTML = `
            body {
                background: linear-gradient(135deg, #010a13 0%, #133442 50%, #01161d 100%) !important;
                color: #ffffff !important;
            }

            /* Меню */
            @media screen and (min-width: 480px) {
                .settings__content,
                .selectbox__content.layer--height {
                    position: fixed !important;
                    top: 1em !important;
                    right: 1em !important;
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
            }

            /* Градиент при наведении */
            .settings-folder.selector.focus,
            .settings-param.selector.focus,
            .settings-param__value.selector.focus,
            .selectbox-item.selector.focus {
                background: linear-gradient(to right, #4dd9a0 1%, #4d8fa8 100%) !important;
                border-radius: 1em !important;
            }

            /* Фикс: иконки всегда белые, без чёрной обводки */
            .head__action.selector svg,
            .head__action.selector svg use {
                color: #ffffff !important;
                fill: #ffffff !important;
                stroke: none !important;
                outline: none !important;
            }
            .head__action.selector:hover svg,
            .head__action.selector:hover svg use {
                color: #ffffff !important;
                fill: #ffffff !important;
                stroke: none !important;
                outline: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    /* Добавляем кнопку MRELOAD */
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
    }

    /* Следим за появлением .head__actions */
    function observeHead() {
        const obs = new MutationObserver(() => {
            const actions = document.querySelector('.head__actions');
            if (actions && !document.getElementById('MRELOAD')) {
                addReloadButton();
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    function initPlugin() {
        applyCustomMenuStyles();
        observeHead();
    }

    if (window.app && app.plugins && typeof app.plugins.add === 'function') {
        app.plugins.add({
            id: plugin_id_menu,
            name: plugin_name_menu,
            version: '6.0',
            author: 'maxi3219',
            description: 'Меню + фон + фикс иконок + кнопка перезагрузки',
            init: initPlugin
        });
    } else {
        initPlugin();
    }
})();
