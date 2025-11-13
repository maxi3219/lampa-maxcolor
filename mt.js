(() => {
    /* === Плагин RoundedMenu (БАЗА) === */
    const plugin_id_menu = 'roundedmenu';
    const plugin_name_menu = 'RoundedMenu';

    function logMenu(...args) {
        try { console.log(`[${plugin_name_menu}]`, ...args); } catch (e) {}
    }

    function applyCustomMenuStyles() {
        try {
            if (document.getElementById('roundedmenu-style-menuonly')) return;

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

                    /* === Пункты меню === */
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

                /* === Тёмный фон === */
                body {
                    background: linear-gradient(135deg, #010a13 0%, #133442 50%, #01161d 100%) !important;
                    color: #ffffff !important;
                }

                /* === Фикс выравнивания кнопок в шапке === */
                .head__actions {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-end !important;
                }
                .head__action {
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    margin: 0 0.3em !important;
                    flex-shrink: 0 !important;
                }

                /* === Иконки: белые, без обводки === */
                .head__action.selector svg,
                .head__action.selector svg use,
                #MRELOAD svg,
                #MRELOAD svg use {
                    color: #ffffff !important;
                    fill: #ffffff !important;
                    stroke: none !important;
                    outline: none !important;
                }
                .head__action.selector:hover svg,
                .head__action.selector:hover svg use,
                #MRELOAD:hover svg,
                #MRELOAD:hover svg use {
                    color: #ffffff !important;
                    fill: #ffffff !important;
                    stroke: none !important;
                    outline: none !important;
                }
            `;
            document.head.appendChild(style);
            logMenu('styles applied');
        } catch (err) {
            console.error('[RoundedMenu] style error:', err);
        }
    }

    /* === Кнопка перезагрузки с надёжным fallback === */
    function performReload() {
        try {
            // 1) обычный перезапуск
            window.location.reload();
        } catch (e1) {
            try {
                // 2) жёсткий перескок на тот же URL
                window.location.assign(window.location.href);
            } catch (e2) {
                try {
                    // 3) мягкий ресет: закрыть меню и перерисовать главный экран (если уместно)
                    if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.close === 'function') {
                        Lampa.Controller.close();
                    }
                    if (window.Lampa && Lampa.Activity && typeof Lampa.Activity.render === 'function') {
                        Lampa.Activity.render();
                    }
                } catch (e3) {
                    console.error('[RoundedMenu] reload fallback failed:', e3);
                }
            }
        }
    }

    function addReloadButtonOnce() {
        try {
            if (document.getElementById('MRELOAD')) return;
            const actions = document.querySelector('.head__actions');
            if (!actions) return;

            const div = document.createElement('div');
            div.id = 'MRELOAD';
            div.className = 'head__action selector m-reload-screen';
            div.innerHTML = `
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 4a8 8 0 0 1 7.45 5.06h-2.15a1 1 0 1 0 0 2h4a1 1 0 0 0 1-1v-4a1 1 0 1 0-2 0v1.38A9.99 9.99 0 1 0 22 12a1 1 0 1 0-2 0 8 8 0 1 1-8-8z"
                          fill="#ffffff"></path>
                </svg>
            `;
            div.addEventListener('click', performReload);
            actions.appendChild(div);
            logMenu('reload button added');
        } catch (err) {
            console.error('[RoundedMenu] addReloadButton error:', err);
        }
    }

    function attachReloadButtonWhenReady() {
        // Если блок уже есть — добавляем сразу
        addReloadButtonOnce();

        // Иначе ждём появления .head__actions, добавляем один раз и отключаем наблюдатель
        const obs = new MutationObserver(() => {
            const actions = document.querySelector('.head__actions');
            if (actions && !document.getElementById('MRELOAD')) {
                addReloadButtonOnce();
                obs.disconnect();
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    function initMenuPlugin() {
        applyCustomMenuStyles();
        attachReloadButtonWhenReady();
    }

    function registerMenu() {
        try {
            if (window.app && app.plugins && typeof app.plugins.add === 'function') {
                app.plugins.add({
                    id: plugin_id_menu,
                    name: plugin_name_menu,
                    version: '6.0',
                    author: 'maxi3219',
                    description: 'Скруглённое меню + тёмный фон + кнопка перезагрузки',
                    init: () => {
                        if (window.Lampa && typeof Lampa.Listener === 'object') {
                            Lampa.Listener.follow('app', (event) => {
                                if (event && event.type === 'ready') initMenuPlugin();
                            });
                        } else {
                            document.addEventListener('DOMContentLoaded', initMenuPlugin);
                        }
                    }
                });
            } else {
                // Без регистратора — просто инициализация
                if (window.Lampa && typeof Lampa.Listener === 'object') {
                    Lampa.Listener.follow('app', (event) => {
                        if (event && event.type === 'ready') initMenuPlugin();
                    });
                } else {
                    document.addEventListener('DOMContentLoaded', initMenuPlugin);
                }
            }
        } catch (err) {
            console.error('[RoundedMenu] register error:', err);
            // Последний шанс
            document.addEventListener('DOMContentLoaded', initMenuPlugin);
        }
    }

    registerMenu();

    /* === Плагин MaxColor (сид-колор) === */
    const plugin_id_color = 'maxcolor';
    const plugin_name_color = 'MaxColor';

    const COLORS = { low: '#ff3333', mid: '#ffcc00', high: '#00ff00' };

    function logColor(...a) {
        try { console.log(`[${plugin_name_color}]`, ...a); } catch (e) {}
    }

    function recolorSeedNumbers() {
        try {
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
        } catch (err) {
            console.error('[MaxColor] recolor error:', err);
        }
    }

    function startObserver() {
        try {
            const obs = new MutationObserver(() => recolorSeedNumbers());
            obs.observe(document.body, { childList: true, subtree: true });
            recolorSeedNumbers();
            logColor('observer started (v2.0)');
        } catch (err) {
            console.error('[MaxColor] observer error:', err);
        }
    }

    function registerColor() {
        try {
            if (window.app && app.plugins && typeof app.plugins.add === 'function') {
                app.plugins.add({
                    id: plugin_id_color,
                    name: plugin_name_color,
                    version: '2.0',
                    author: 'maxi3219',
                    description: 'Окрашивает число после "Раздают:" без свечения',
                    init: () => {
                        if (window.Lampa && typeof Lampa.Listener === 'object') {
                            Lampa.Listener.follow('app', (event) => {
                                if (event && event.type === 'ready') startObserver();
                            });
                        } else {
                            document.addEventListener('DOMContentLoaded', startObserver);
                        }
                    }
                });
            } else {
                if (window.Lampa && typeof Lampa.Listener === 'object') {
                    Lampa.Listener.follow('app', (event) => {
                        if (event && event.type === 'ready') startObserver();
                    });
                } else {
                    document.addEventListener('DOMContentLoaded', startObserver);
                }
            }
        } catch (err) {
            console.error('[MaxColor] register error:', err);
            document.addEventListener('DOMContentLoaded', startObserver);
        }
    }

    registerColor();
})();
