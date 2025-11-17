(() => {
    'use strict';

    const plugin_id = 'roundedmenu';
    const plugin_name = 'RoundedMenu-MaxColor';
    const VERSION = '11.0';

    const SEED_COLORS = { low: '#ff3333', mid: '#ffcc00', high: '#00ff00' };

    // Список парсеров (пример из вашего файла). При необходимости замените / дополните.
    const parsersInfo = [
        { base: 'jacred_xyz',         name: 'Jacred.xyz',           settings: { url: 'jacred.xyz',         key: '',       parser_torrent_type: 'jackett' } },
        { base: 'jr_maxvol_pro',      name: 'Jr.maxvol.pro',        settings: { url: 'jr.maxvol.pro',      key: '',       parser_torrent_type: 'jackett' } },
        { base: 'jacred_my_to',       name: 'Jacred.my.to',         settings: { url: 'jacred.my.to',       key: '',       parser_torrent_type: 'jackett' } },
        { base: 'lampa_app',          name: 'Lampa.app',            settings: { url: 'lampa.app',          key: '',       parser_torrent_type: 'jackett' } },
        { base: 'jacred_pro',         name: 'Jacred.pro',           settings: { url: 'jacred.pro',         key: '',       parser_torrent_type: 'jackett' } },
        { base: 'jacred_viewbox_dev', name: 'Viewbox',              settings: { url: 'jacred.viewbox.dev', key: 'viewbox',parser_torrent_type: 'jackett' } }
    ];

    // ----- Утилиты логирования и debounce -----
    function log(...a) { try { console.log(`[${plugin_name}][v${VERSION}]`, ...a); } catch (e) {} }
    function debounce(fn, ms = 120) { let t = null; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }

    // ----- Стили (RoundedMenu + небольшие фикс-правки) -----
    function applyStyles() {
        if (document.getElementById('roundedmenu-style')) return;
        const style = document.createElement('style');
        style.id = 'roundedmenu-style';
        style.innerHTML = `
            @media screen and (min-width: 480px) {
                .settings__content, .selectbox__content.layer--height {
                    position: fixed !important; top: 1em !important; right: 1em !important; left: auto !important;
                    width: 35% !important; max-height: calc(100vh - 2em) !important; overflow-y: auto !important;
                    background: rgba(54,54,54,0.98) !important; border-radius: 1.2em !important;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.8) !important; padding: 0.5em !important; display:flex !important;
                    flex-direction: column !important; transform: translateX(100%) !important;
                    transition: transform 0.3s ease, opacity 0.3s ease !important; z-index: 999 !important;
                    visibility: hidden !important; opacity: 0 !important;
                }
                body.settings--open .settings__content,
                body.selectbox--open .selectbox__content.layer--height {
                    transform: translateX(0) !important; visibility: visible !important; opacity: 1 !important;
                }
                .settings-folder.selector, .settings-param.selector, .selectbox-item.selector {
                    border-radius: 1em !important; margin-bottom: 0.3em !important; transition: background 0.25s ease !important;
                }
                .settings-folder.selector.focus, .settings-folder.selector.hover,
                .selectbox-item.selector.focus, .selectbox-item.selector.hover {
                    background: linear-gradient(to right, #4dd9a0 1%, #4d8fa8 100%) !important; border-radius: 1em !important;
                }
            }
            body { background: linear-gradient(135deg, #010a13 0%, #133442 50%, #01161d 100%) !important; color: #fff !important; }
            .head__body svg, .head__body svg use { fill: #fff !important; color: #fff !important; transition: none !important; }
            .filter--parser.selector { cursor: pointer !important; }
            .torrent-item { position: relative !important; border-radius: 0.9em !important; background: transparent !important; overflow: visible !important; }
            .torrent-item::before { content: '' !important; position: absolute !important; inset: 0 !important; background-color: rgba(0,0,0,0.3) !important; border-radius: inherit !important; z-index: 0 !important; pointer-events: none !important; }
            .torrent-item > * { position: relative !important; z-index: 1 !important; }
            .torrent-filter .selector.hover, .torrent-filter .selector.focus { background: linear-gradient(to right, #4dd9a0 1%, #4d8fa8 100%) !important; border-radius: 1em !important; color: #fff !important; }
            .full-start-new__buttons .full-start__button.selector { border-radius: 1em !important; transition: background 0.18s ease !important; }
            .full-start-new__buttons .full-start__button.selector.hover, .full-start-new__buttons .full-start__button.selector.focus { background: linear-gradient(to right, #4dd9a0 12%, #2f6ea8 100%) !important; border-radius: 0.5em !important; color: #fff !important; }
        `;
        document.head.appendChild(style);
    }

    // ----- Reload button (как в примере) -----
    function addReloadButton() {
        if (document.getElementById('MRELOAD')) return;
        const headActions = document.querySelector('.head__actions');
        if (!headActions) { setTimeout(addReloadButton, 800); return; }

        const btn = document.createElement('div');
        btn.id = 'MRELOAD';
        btn.className = 'head__action selector m-reload-screen';
        btn.innerHTML = `<svg fill="#fff" viewBox="0 0 24 24"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z"/></svg>`;

        btn.addEventListener('hover:enter', () => {
            const href = window.location.href;
            try { window.location.reload(); } catch (e) {}
            setTimeout(() => {
                try { window.location.replace(href); } catch (e) { try { window.location.href = href; } catch (_) {} }
            }, 250);
        });

        headActions.appendChild(btn);
    }

    // ----- Работа с Storage: безопасная запись/чтение для разных окружений -----
    function getStorageApi() {
        if (window.Lampa && Lampa.Storage) return Lampa.Storage;
        if (window.app && app.storage) return app.storage;
        return null;
    }
    function safeSet(key, value) {
        try {
            const s = getStorageApi();
            if (s) {
                if (typeof s.set === 'function') { s.set(key, value); log('Storage.set', key, value); return true; }
                if (typeof s.setItem === 'function') { s.setItem(key, value); log('storage.setItem', key, value); return true; }
            }
            if (window.localStorage) { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); log('localStorage.setItem', key, value); return true; }
        } catch (e) { log('safeSet error', e); }
        return false;
    }
    function safeGet(key) {
        try {
            const s = getStorageApi();
            if (s) {
                if (typeof s.get === 'function') return s.get(key);
                if (typeof s.getItem === 'function') return s.getItem(key);
            }
            if (window.localStorage) { const v = localStorage.getItem(key); try { return JSON.parse(v); } catch { return v; } }
        } catch (e) { log('safeGet error', e); }
        return null;
    }

    // ----- Проверка доступности парсера (HEAD fetch, no-cors) -----
    async function checkAvailability(url) {
        try {
            // HEAD + no-cors, может вернуть opaque, считаем это рабочим
            await fetch(`https://${url}`, { method: 'HEAD', mode: 'no-cors' });
            return true;
        } catch {
            return false;
        }
    }

    // ----- Управление состоянием контроллера (сохраняем чтобы вернуться на страницу фильма) -----
    let _savedController = null;
    function saveCurrentState() {
        try {
            if (window.Lampa && Lampa.Controller) {
                const name = typeof Lampa.Controller.activeName === 'function' ? Lampa.Controller.activeName() : null;
                const id = typeof Lampa.Controller.activeId === 'function' ? Lampa.Controller.activeId() : null;
                _savedController = { name: name || null, id: id || null, active: true };
                log('saved controller', _savedController);
                return;
            }
            _savedController = null;
        } catch (e) { log('saveCurrentState error', e); _savedController = null; }
    }
    function restoreSavedState() {
        try {
            log('restoreSavedState start', _savedController);
            if (!_savedController) { try { history.back(); } catch {} ; return; }
            if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.open === 'function') {
                try {
                    if (_savedController.id) Lampa.Controller.open(_savedController.name, _savedController.id);
                    else Lampa.Controller.open(_savedController.name);
                    // даём время и вызываем refresh
                    setTimeout(() => { runListUpdateTriggers(); }, 350);
                    return;
                } catch (e) { log('Lampa.Controller.open failed', e); }
            }
            try { history.back(); setTimeout(() => runListUpdateTriggers(), 350); } catch (e) { log('history.back failed', e); }
        } catch (e) { log('restoreSavedState error', e); }
    }

    // ----- Триггеры обновления списка торрентов (пытаемся разными способами) -----
    function runListUpdateTriggers() {
        log('runListUpdateTriggers');
        try {
            if (window.Lampa) {
                try { if (Lampa.Select && typeof Lampa.Select.hide === 'function') { Lampa.Select.hide(); log('Lampa.Select.hide'); } } catch (e) {}
                try { if (Lampa.Controller && typeof Lampa.Controller.update === 'function') { Lampa.Controller.update(); log('Controller.update'); } } catch (e) {}
                try { if (Lampa.Controller && typeof Lampa.Controller.refresh === 'function') { Lampa.Controller.refresh(); log('Controller.refresh'); } } catch (e) {}
                try { if (Lampa.Activity && typeof Lampa.Activity.reload === 'function') { Lampa.Activity.reload(); log('Activity.reload'); } } catch (e) {}
            }
        } catch (e) { log('runListUpdateTriggers step1 error', e); }

        // симулируем клики по элементам фильтра/обновления
        try {
            const searchBtn = document.querySelector('.torrent-filter .filter--search') || document.querySelector('.filter--search');
            const backBtn = document.querySelector('.torrent-filter .filter--back') || document.querySelector('.filter--back');
            if (searchBtn) { try { searchBtn.click(); log('clicked filter--search'); } catch (e) { log(e); } }
            setTimeout(() => { if (backBtn) { try { backBtn.click(); log('clicked filter--back'); } catch (e) { log(e); } } }, 220);
        } catch (e) { log('simulate click error', e); }

        try { window.dispatchEvent(new CustomEvent('LampaParserChanged', { detail: { time: Date.now() } })); log('dispatched LampaParserChanged'); } catch (e) { log(e); }
    }

    // ----- UI: вставка кнопки выбора парсеров рядом с фильтрами -----
    function getCurrentParserTitle() {
        try {
            const k = safeGet('lme_url_two') || safeGet('parser_torrent_type') || safeGet('parser') || '';
            if (!k) return 'Авто';
            const p = parsersInfo.find(x => x.base === k || x.settings && (x.settings.url === k || x.base === k));
            return p ? p.name : 'Выбран';
        } catch (e) { return 'Авто'; }
    }

    function mountParserButton(container) {
        try {
            if (!container) return;
            if (container.querySelector('#parser-selectbox')) return;

            const currentBase = safeGet('lme_url_two') || 'jacred_xyz';
            const currentInfo = parsersInfo.find(p => p.base === currentBase) || parsersInfo[0];

            const btn = document.createElement('div');
            btn.id = 'parser-selectbox';
            btn.className = 'simple-button simple-button--filter filter--parser selector';
            btn.innerHTML = `<span>Парсер</span><div id="parser-current">${currentInfo.name}</div>`;
            // вставляем сразу после filter--filter если есть
            const ref = container.querySelector('.filter--filter');
            if (ref && ref.parentNode) ref.parentNode.insertBefore(btn, ref.nextSibling);
            else container.appendChild(btn);

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                saveCurrentState();
                openParserSelectMenu();
            });

            log('parser button mounted');
        } catch (e) { log('mountParserButton error', e); }
    }

    function startParserObserver() {
        const obs = new MutationObserver(debounce(() => {
            const container = document.querySelector('.torrent-filter');
            if (container && !container.querySelector('#parser-selectbox')) mountParserButton(container);
        }, 200));
        obs.observe(document.body, { childList: true, subtree: true });

        const first = document.querySelector('.torrent-filter');
        if (first) mountParserButton(first);
    }

    // ----- Открытие селекта Lampa.Select и обработка выбора -----
    function openParserSelectMenu() {
        try {
            if (!(window.Lampa && Lampa.Select && typeof Lampa.Select.show === 'function')) {
                alert('Меню выбора парсеров доступно только внутри Lampa');
                log('Lampa.Select not found');
                return;
            }

            // Подготовим статусы (проверка доступности) — если нужно, можно убрать await чтобы не ждать
            Promise.all(parsersInfo.map(async p => {
                const ok = await checkAvailability(p.settings.url).catch(() => false);
                return { ...p, ok };
            })).then(statuses => {
                const items = statuses.map(s => ({
                    title: `<span style="color:${s.ok ? '#00ff00' : '#ff3333'}">${s.name}</span>`,
                    base: s.base,
                    settings: s.settings
                }));

                Lampa.Select.show({
                    title: 'Каталог парсеров',
                    items,
                    onBack: function() {
                        try { if (Lampa.Select && typeof Lampa.Select.hide === 'function') Lampa.Select.hide(); } catch (e) {}
                        log('select onBack');
                    },
                    onSelect: function(item) {
                        log('parser selected', item);
                        try {
                            // записываем основные ключи в несколько мест для совместимости
                            safeSet('lme_url_two', item.base);
                            if (item.settings && item.settings.url) safeSet('lme_url', item.settings.url);
                            // сохраняем под общими именами, которые встречаются в разных реализациях
                            if (item.settings) {
                                const s = item.settings;
                                if (s.parser_torrent_type) safeSet('parser_torrent_type', s.parser_torrent_type);
                                if (s.url) {
                                    // некоторые плагины используют jackett_url / jackett_urltwo / parser-specific keys
                                    safeSet('jackett_url', s.url);
                                    safeSet('jackett_url_two', s.url);
                                    safeSet('lme_url', s.url);
                                }
                                if (s.key) safeSet('jackett_key', s.key);
                            }
                            safeSet('parser_use', true);
                        } catch (e) { log('save settings error', e); }

                        // Закрываем селект
                        try { if (Lampa.Select && typeof Lampa.Select.hide === 'function') Lampa.Select.hide(); } catch (e) {}

                        // Обновляем подпись на кнопке
                        setTimeout(() => {
                            const el = document.querySelector('.filter--parser > div:last-child, #parser-current');
                            if (el) el.textContent = getCurrentParserTitle();
                        }, 220);

                        // Восстанавливаем страницу фильма и триггерим обновление списка
                        setTimeout(() => restoreSavedState(), 260);

                        // Доп. триггеры: dispatch events и принудительный update
                        setTimeout(() => {
                            try { window.dispatchEvent(new CustomEvent('parser_changed', { detail: { base: item.base } })); } catch (e) {}
                            runListUpdateTriggers();
                        }, 600);
                    }
                });
            }).catch(err => {
                log('statuses Promise error', err);
            });

        } catch (e) { log('openParserSelectMenu error', e); }
    }

    // ----- Перекраска сидов (MaxColor) -----
    function recolorSeedNumbers() {
        try {
            document.querySelectorAll('.torrent-item__seeds').forEach(block => {
                const span = block.querySelector('span');
                if (!span) return;
                const num = parseInt(span.textContent);
                if (isNaN(num)) return;
                let color = SEED_COLORS.low;
                if (num > 10) color = SEED_COLORS.high;
                else if (num >= 5) color = SEED_COLORS.mid;
                span.style.color = color;
                span.style.fontWeight = 'bold';
            });
        } catch (e) { log('recolorSeedNumbers error', e); }
    }
    function startSeedsObserver() {
        const obs = new MutationObserver(debounce(() => recolorSeedNumbers(), 80));
        obs.observe(document.body, { childList: true, subtree: true });
        recolorSeedNumbers();
    }

    // ----- Инициализация плагина и регистрация -----
    function initMenuPlugin() {
        applyStyles();
        addReloadButton();
        startParserObserver();
        startSeedsObserver();
        // Синхронно применяем changeParser если в Storage уже есть выбор
        try { // старая совместимость: применим настройки парсера в runtime (если необходимо)
            const sel = safeGet('lme_url_two') || safeGet('parser_torrent_type') || safeGet('parser');
            if (sel) log('initial parser selection detected', sel);
        } catch (e) { log(e); }
    }

    function registerMenu() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: VERSION,
                author: 'maxi3219',
                description: 'RoundedMenu + MaxColor + Parser selector (встроено восстановление страницы и агрессивный refresh)',
                init: initMenuPlugin
            });
            log('Registered with app.plugins');
        } else {
            // fallback
            document.addEventListener('DOMContentLoaded', () => initMenuPlugin());
            setTimeout(() => initMenuPlugin(), 1000);
            log('Standalone init scheduled');
        }
    }

    registerMenu();

    // ----- Экспорт для отладки (в консоли) -----
    try { window.__RoundedMenuMaxColor = { safeGet, safeSet, runListUpdateTriggers, openParserSelectMenu, parsersInfo }; } catch (e) {}

})();
