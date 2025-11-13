(() => {
    /* === Плагин RoundedMenu + Reload + Parser + SeedColor === */
    const plugin_id_menu = 'roundedmenu';
    const plugin_name_menu = 'RoundedMenu';

    /* === Лог === */
    function log(...args) {
        try { console.log(`[${plugin_name_menu}]`, ...args); } catch (e) {}
    }

    /* === Стили меню и иконок === */
    function applyCustomStyles() {
        const style = document.createElement('style');
        style.id = 'roundedmenu-style';
        style.innerHTML = `
            @media screen and (min-width: 480px) {
                .settings__content,
                .selectbox__content.layer--height {
                    position: fixed !important;
                    top: 1em !important;
                    right: 1em !important;
                    width: 35% !important;
                    background: rgba(54,54,54,0.98) !important;
                    border-radius: 1.2em !important;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.8) !important;
                    padding: 0.5em !important;
                    transform: translateX(100%) !important;
                    transition: transform .3s ease, opacity .3s ease !important;
                    z-index: 999 !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                }
                body.settings--open .settings__content,
                body.selectbox--open .selectbox__content.layer--height {
                    transform: translateX(0)!important;
                    visibility: visible!important;
                    opacity: 1!important;
                }
                .settings-folder.selector,
                .settings-param.selector,
                .settings-param__value.selector,
                .selectbox-item.selector {
                    border-radius: 1em!important;
                    margin-bottom: 0.3em!important;
                    transition: background .25s ease!important;
                }
                .settings-folder.selector.focus,
                .settings-param.selector.focus,
                .settings-param__value.selector.focus,
                .selectbox-item.selector.focus {
                    background: linear-gradient(to right,#4dd9a0 1%,#4d8fa8 100%)!important;
                }
            }
            body {
                background: linear-gradient(135deg,#010a13 0%,#133442 50%,#01161d 100%)!important;
                color:#fff!important;
            }
            .head__body svg, .head__body svg use {
                fill:#fff!important;
                color:#fff!important;
                transition:none!important;
            }
            .m-reload-screen { cursor:pointer!important; }
            .m-reload-screen:hover svg {
                transform:rotate(180deg);
                transition:transform .4s ease;
            }
            .parser-button {
                display:flex;align-items:center;gap:6px;cursor:pointer;
                color:#fff;border:1px solid #666;border-radius:10px;
                padding:5px 12px;font-size:.9em;transition:background .25s ease;
            }
            .parser-button:hover { background:rgba(255,255,255,.1); }
        `;
        document.head.appendChild(style);
        log('Custom styles applied');
    }

    /* === Кнопка перезагрузки === */
    function addReloadButton() {
        if (document.getElementById('MRELOAD')) return;
        const headActions = document.querySelector('.head__actions');
        if (!headActions) return setTimeout(addReloadButton, 1000);

        const btn = document.createElement('div');
        btn.id = 'MRELOAD';
        btn.className = 'head__action selector m-reload-screen';
        btn.innerHTML = `
            <svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.48">
                <path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path>
            </svg>`;
        btn.addEventListener('click', () => {
            Lampa.Noty.show('Экран перезагружается...');
            const act = Lampa.Activity.active();
            if (act && act.activity) Lampa.Activity.replace(act.activity);
            else location.reload();
        });
        headActions.appendChild(btn);
    }

    /* === Подсветка числа "Раздают" === */
    const COLORS = {
        low: '#ff3333',
        mid: '#ffcc00',
        high: '#00ff00'
    };
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
    function startSeedObserver() {
        const obs = new MutationObserver(() => recolorSeedNumbers());
        obs.observe(document.body, { childList: true, subtree: true });
        recolorSeedNumbers();
        log('Seed color observer active');
    }

    /* === Кнопка "Парсер" === */
    const PARSERS = [
        { title: 'Jacred.xyz', url: 'https://jacred.xyz' },
        { title: 'Jr.maxvol.pro', url: 'https://jr.maxvol.pro' },
        { title: 'Jacred.my.to', url: 'https://jacred.my.to' },
        { title: 'Laampa.app', url: 'https://laampa.app' },
        { title: 'Jacred.pro', url: 'https://jacred.pro' }
    ];

    function addParserButton() {
        const filterBar = document.querySelector('.torrent-filter');
        if (!filterBar) return setTimeout(addParserButton, 1000);
        if (document.querySelector('.parser-button')) return;

        const current = Lampa.Storage.get('parser_selected', PARSERS[0].title);

        const btn = document.createElement('div');
        btn.className = 'parser-button selector';
        btn.innerHTML = `<span>Парсер:</span> <b>${current}</b>`;
        btn.addEventListener('click', openParserMenu);

        filterBar.appendChild(btn);
        log('Parser button added');
    }

    /* === Меню выбора парсера === */
    function openParserMenu() {
        const items = PARSERS.map(p => ({
            title: p.title,
            subtitle: p.url
        }));

        Lampa.Select.open({
            title: 'Выберите парсер',
            items,
            onSelect: (sel) => {
                const chosen = PARSERS.find(x => x.title === sel.title);
                if (!chosen) return;
                Lampa.Storage.set('parser_selected', chosen.title);
                const btn = document.querySelector('.parser-button b');
                if (btn) btn.textContent = chosen.title;
                Lampa.Noty.show(`Выбран парсер: ${chosen.title}`);

                // обновляем только список торрентов
                try {
                    const active = Lampa.Activity.active();
                    if (active && active.component && active.component === 'torrents') {
                        if (active.activity.source && typeof active.activity.source.search === 'function') {
                            active.activity.source.search(active.activity.query, (results) => {
                                if (results) {
                                    active.activity.results = results;
                                    Lampa.Torrent.render(results);
                                    recolorSeedNumbers();
                                }
                            });
                        } else {
                            Lampa.Activity.replace(active.activity);
                        }
                    }
                } catch (e) {
                    Lampa.Activity.replace(Lampa.Activity.active().activity);
                }
            },
            onBack: Lampa.Controller.toggle
        });
    }

    /* === Инициализация === */
    function init() {
        applyCustomStyles();
        addReloadButton();
        startSeedObserver();
        addParserButton();
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id_menu,
                name: plugin_name_menu,
                version: '8.0',
                author: 'maxi3219',
                description: 'Скруглённое меню + Reload + выбор Jacred-парсера + подсветка раздающих',
                init
            });
        } else init();
    }

    register();
})();
