(() => {
    /* === Плагин RoundedMenu + Reload + Parser (stable) === */
    const plugin_id_menu = 'roundedmenu';
    const plugin_name_menu = 'RoundedMenu';

    function logMenu(...args) {
        try { console.log(`[${plugin_name_menu}]`, ...args); } catch (e) {}
    }

    /* === Стили меню и кнопок === */
    function applyCustomMenuStyles() {
        const style = document.createElement('style');
        style.id = 'roundedmenu-style-menuonly';
        style.innerHTML = `
            @media screen and (min-width: 480px) {
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

            body {
                background: linear-gradient(135deg, #010a13 0%, #133442 50%, #01161d 100%) !important;
                color: #ffffff !important;
            }

            .head__body svg,
            .head__body svg use {
                fill: #fff !important;
                color: #fff !important;
                transition: none !important;
            }

            .m-reload-screen {
                cursor: pointer !important;
            }
            .m-reload-screen:hover svg {
                transform: rotate(180deg);
                transition: transform 0.4s ease;
            }

            /* === Стили кнопки Парсер === */
            .parser-button {
                display: flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                color: #fff;
                border: 1px solid #666;
                border-radius: 10px;
                padding: 5px 12px;
                font-size: 0.9em;
                transition: background 0.25s ease;
            }
            .parser-button:hover { background: rgba(255,255,255,0.06); }

            /* === Простейшее модальное окно (фоллбек) === */
            .lampa-parser-modal {
                position: fixed;
                left: 50%;
                top: 50%;
                transform: translate(-50%,-50%);
                background: rgba(20,20,20,0.98);
                border-radius: 8px;
                padding: 12px;
                z-index: 2000;
                min-width: 240px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.6);
                color: #fff;
            }
            .lampa-parser-modal h4 { margin: 0 0 8px 0; font-size: 1rem; }
            .lampa-parser-list { max-height: 320px; overflow-y: auto; margin:6px 0 0 0; padding:0; list-style:none; }
            .lampa-parser-list li { padding: 8px 10px; border-radius:6px; cursor:pointer; margin-bottom:6px; background: rgba(255,255,255,0.02); }
            .lampa-parser-list li:hover { background: rgba(255,255,255,0.06); }
            .lampa-parser-close { margin-top: 10px; text-align: right; opacity:0.9; cursor:pointer; font-size:0.9rem; }
        `;
        document.head.appendChild(style);
        logMenu('Menu styles applied');
    }

    /* === Кнопка перезагрузки === */
    function addReloadButton() {
        try {
            if (document.getElementById('MRELOAD')) return;
            const headActions = document.querySelector('.head__actions');
            if (!headActions) {
                setTimeout(addReloadButton, 800);
                return;
            }

            const btn = document.createElement('div');
            btn.id = 'MRELOAD';
            btn.className = 'head__action selector m-reload-screen';
            btn.innerHTML = `
                <svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.48">
                    <path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path>
                </svg>
            `;
            btn.addEventListener('click', () => {
                logMenu('Reload button clicked');
                try {
                    if (window.Lampa && typeof Lampa.Activity !== 'undefined') {
                        const active = Lampa.Activity.active();
                        if (active && (active.activity || active.activity && active.activity.url)) {
                            Lampa.Noty.show('Экран перезагружается...');
                            // Если activity.activity есть — используем его, иначе передаём active
                            const payload = active.activity ? active.activity : active;
                            try {
                                Lampa.Activity.replace({
                                    url: payload.url,
                                    title: payload.title,
                                    component: payload.component
                                });
                            } catch (e) {
                                // если replace не сработал — fallback: render или reload
                                try { Lampa.Activity.render(); } catch (e2) { location.reload(); }
                            }
                        } else location.reload();
                    } else location.reload();
                } catch (e) {
                    logMenu('Reload error', e);
                    location.reload();
                }
            });
            headActions.appendChild(btn);
            logMenu('Reload button added');
        } catch (e) { logMenu('addReloadButton error', e); }
    }

    /* === Получение списка парсеров (без падения) === */
    async function fetchParsers() {
        // Попробуем получить json-список из jackett.js (если доступно), иначе вернём дефолт
        const defaultParsers = [
            { name: 'Jackett', url: 'https://bylampa.github.io/jackett.js' },
            { name: 'Torlook', url: 'https://torlook.info' },
            { name: 'Piratebay', url: 'https://pirateproxy.live' }
        ];

        try {
            const res = await fetch('https://bylampa.github.io/jackett.js', {cache: 'no-cache'});
            if (!res.ok) {
                logMenu('jackett.js fetch status', res.status);
                return defaultParsers;
            }
            const text = await res.text();

            // Попробуем найти явный массив (в jackett.js обычно есть присвоение)
            // Ищем JSON-структуру массивов объектов — если не найдём, вернём default
            const arrMatch = text.match(/\[([^\]]{10,})\]/s);
            if (!arrMatch) return defaultParsers;

            const jsonText = arrMatch[0];
            try {
                const parsed = JSON.parse(jsonText);
                // Если parsed — массив объектов с name или title — норм
                if (Array.isArray(parsed) && parsed.length) {
                    return parsed.map(p => {
                        if (typeof p === 'string') return { name: p, url: p };
                        return { name: p.name || p.title || p.id || String(p.url || p.address || ''), url: p.url || p.address || p.link || '' };
                    });
                }
            } catch (e) {
                // не JSON — пробуем более точечно искать Lampa.Storage.set('jackett_parsers', ...)
                const storeMatch = text.match(/jackett_parsers'\s*,\s*(\[[\s\S]*?\])\)/);
                if (storeMatch) {
                    try {
                        const parsed2 = JSON.parse(storeMatch[1]);
                        if (Array.isArray(parsed2) && parsed2.length) {
                            return parsed2.map(p => ({ name: p.name || p.title || p.id || p.url, url: p.url || p.address || '' }));
                        }
                    } catch (e2) { /* fallthrough */ }
                }
            }
        } catch (e) {
            logMenu('fetchParsers error', e);
        }

        return defaultParsers;
    }

    /* === Простейшее модальное окно выбора (фоллбек если Lampa.Select недоступен) === */
    function openFallbackSelect(title, items, onSelect, onClose) {
        try {
            // Удаляем старое, если есть
            const old = document.querySelector('.lampa-parser-modal');
            if (old) old.remove();

            const wrap = document.createElement('div');
            wrap.className = 'lampa-parser-modal';
            wrap.innerHTML = `<h4>${title}</h4><ul class="lampa-parser-list"></ul><div class="lampa-parser-close">Отмена</div>`;

            const list = wrap.querySelector('.lampa-parser-list');
            items.forEach(it => {
                const li = document.createElement('li');
                li.textContent = it.title || it.name || it;
                li.addEventListener('click', () => {
                    try { wrap.remove(); } catch (e) {}
                    onSelect && onSelect(it);
                });
                list.appendChild(li);
            });

            wrap.querySelector('.lampa-parser-close').addEventListener('click', () => {
                try { wrap.remove(); } catch (e) {}
                onClose && onClose();
            });

            document.body.appendChild(wrap);
        } catch (e) {
            logMenu('openFallbackSelect error', e);
        }
    }

    /* === Добавляем пункт "Парсер" в окно торрентов === */
    async function addParserSelector() {
        try {
            const filterBar = document.querySelector('.torrent-filter');
            if (!filterBar) return setTimeout(addParserSelector, 800);

            if (document.querySelector('.parser-button')) return;

            const parsers = await fetchParsers();

            // безопасное получение значения из Lampa.Storage (если есть)
            let currentName = parsers && parsers.length ? parsers[0].name : 'Парсер';
            try {
                if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.get === 'function') {
                    currentName = Lampa.Storage.get('parser_selected', currentName);
                }
            } catch (e) { logMenu('storage get error', e); }

            const btn = document.createElement('div');
            btn.className = 'parser-button selector';
            btn.innerHTML = `<span>Парсер:</span> <b>${currentName}</b>`;

            btn.addEventListener('click', () => {
                try {
                    const items = parsers.map(p => ({ title: p.name, url: p.url }));
                    // если Lampa.Select есть — используем его
                    if (window.Lampa && Lampa.Select && typeof Lampa.Select.open === 'function') {
                        Lampa.Select.open({
                            title: 'Выберите парсер',
                            items: items.map(i => ({ title: i.title })),
                            onSelect: (sel) => {
                                // на основе выбранного title находим объект
                                const chosen = items.find(x => x.title === sel.title) || items[0];
                                try {
                                    if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.set === 'function') {
                                        Lampa.Storage.set('parser_selected', chosen.title);
                                    }
                                } catch (e) { logMenu('storage set error', e); }
                                btn.querySelector('b').textContent = chosen.title;
                                Lampa.Noty && Lampa.Noty.show && Lampa.Noty.show(`Выбран парсер: ${chosen.title}`);
                                // перезагружаем активный экран
                                try {
                                    const active = (Lampa.Activity && Lampa.Activity.active) ? Lampa.Activity.active() : null;
                                    const payload = active && active.activity ? active.activity : active;
                                    if (payload) Lampa.Activity.replace({ url: payload.url, title: payload.title, component: payload.component });
                                } catch (e) {
                                    logMenu('Activity.replace error', e);
                                    try { Lampa.Activity.render(); } catch (e2) { location.reload(); }
                                }
                            },
                            onBack: () => {
                                try { Lampa.Controller && Lampa.Controller.toggle && Lampa.Controller.toggle(); } catch (e) {}
                            }
                        });
                        return;
                    }

                    // иначе — фоллбек-меню
                    openFallbackSelect('Выберите парсер', items, (chosen) => {
                        try {
                            if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.set === 'function') {
                                Lampa.Storage.set('parser_selected', chosen.title || chosen.name);
                            }
                        } catch (e) { logMenu('storage set error (fallback)', e); }
                        btn.querySelector('b').textContent = chosen.title || chosen.name;
                        try { Lampa.Noty && Lampa.Noty.show && Lampa.Noty.show(`Выбран парсер: ${chosen.title || chosen.name}`); } catch (e) {}
                        // перезагрузка активного экрана
                        try {
                            if (window.Lampa && Lampa.Activity) {
                                const active = Lampa.Activity.active();
                                const payload = active && active.activity ? active.activity : active;
                                if (payload) Lampa.Activity.replace({ url: payload.url, title: payload.title, component: payload.component });
                            } else location.reload();
                        } catch (e) {
                            logMenu('fallback reload error', e);
                            location.reload();
                        }
                    }, () => {
                        // onClose
                    });

                } catch (e) {
                    logMenu('parser-button click error', e);
                }
            });

            // Вставим после фильтра: append — для простоты. Можно изменить позицию при необходимости.
            filterBar.appendChild(btn);
            logMenu('Parser selector added');
        } catch (e) { logMenu('addParserSelector error', e); }
    }

    /* === Инициализация === */
    function initMenuPlugin() {
        try {
            if (window.Lampa && typeof Lampa.Listener === 'object') {
                Lampa.Listener.follow('app', function(event){
                    if(event.type === 'ready'){
                        applyCustomMenuStyles();
                        addReloadButton();
                        addParserSelector();
                    }
                });
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    applyCustomMenuStyles();
                    addReloadButton();
                    addParserSelector();
                });
            }
        } catch (e) { logMenu('init error', e); }
    }

    function registerMenu() {
        try {
            if (window.app && app.plugins && typeof app.plugins.add === 'function') {
                app.plugins.add({
                    id: plugin_id_menu,
                    name: plugin_name_menu,
                    version: '6.1',
                    author: 'maxi3219',
                    description: 'Скруглённое меню + перезагрузка + выбор парсера Jackett (stable)',
                    init: initMenuPlugin
                });
            } else {
                initMenuPlugin();
            }
        } catch (e) { logMenu('register error', e); }
    }

    registerMenu();
})();
