(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';
    const VERSION = '1.0-merged';
    const COLORS = {
        low: '#ff3333',
        mid: '#ffcc00',
        high: '#00ff00'
    };
    const BLOCK_RADIUS = '0.9em';
    const GRADIENT_APP_BG = 'linear-gradient(117deg, rgb(0 0 0) 0%, rgb(11 26 35) 50%, rgb(14, 14, 14) 100%)';

    function log(...a) {
        try { console.log(`[${plugin_name}][v${VERSION}]`, ...a); } catch (e) {}
    }

    // ----- Ваши исходные визуальные функции (без изменений) -----
    function recolorSeedNumbers() {
        document.querySelectorAll('.torrent-item__seeds').forEach(block => {
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

    function roundCorners() {
        document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render')
            .forEach(item => item.style.borderRadius = BLOCK_RADIUS);
        document.querySelectorAll('.watched-history.selector')
            .forEach(item => item.style.borderRadius = BLOCK_RADIUS);
    }

    function changeBackground() {
        const backgroundBlock = document.querySelector('.background');
        if (backgroundBlock) {
            backgroundBlock.style.background = GRADIENT_APP_BG;
            backgroundBlock.style.setProperty('background', GRADIENT_APP_BG, 'important');
        }
        document.querySelectorAll('.settings__content, .selectbox__content.layer--height').forEach(panel => {
            panel.style.background = 'rgba(33,33,33,0.98)';
            panel.style.setProperty('background', 'rgba(33,33,33,0.98)', 'important');
            if (panel.classList.contains('settings__content')) {
                panel.style.left = '99%';
                panel.style.maxHeight = 'calc(100vh - 1.8em)';
                panel.style.setProperty('left', '99%', 'important');
                panel.style.setProperty('max-height', 'calc(100vh - 1.8em)', 'important');
            } else if (panel.classList.contains('selectbox__content')) {
                panel.style.left = '99%';
                panel.style.maxHeight = 'calc(100vh - 1.8em)';
                panel.style.setProperty('left', '99%', 'important');
                panel.style.setProperty('max-height', 'calc(100vh - 1.8em)', 'important');
            }
        });
    }

    function injectInteractionStyles() {
        const styleId = 'maxcolor-interaction-styles';
        const staticStyleId = 'maxcolor-static-styles';

        document.getElementById(styleId)?.remove();
        document.getElementById(staticStyleId)?.remove();

        const SHADOW_COLOR = '0 4px 15px rgb(57 148 188 / 30%)';
        const GRADIENT_HOVER_BG = 'linear-gradient(to right, #9cc1bc, #536976)';
        const interactionCss = `
            .full-start__button.selector:hover,
            .full-start__button.selector.focus {
                border-radius: 0.5em !important;
                box-shadow: ${SHADOW_COLOR} !important;
                background: ${GRADIENT_HOVER_BG} !important;
            }
            .selectbox-item.selector:hover,
            .selectbox-item.selector.focus {
                box-shadow: ${SHADOW_COLOR} !important;
            }
            .settings-folder.selector:hover,
            .settings-folder.selector.focus {
                box-shadow: ${SHADOW_COLOR} !important;
            }
            .simple-button.simple-button--filter.selector.filter--parser {
                display: inline-flex;
                align-items: center;
                gap: 0.6em;
            }
        `;
        const staticCss = `
            .torrent-item.selector {
                background-color: rgb(68 68 69 / 13%) !important;
            }
        `;

        const interactionStyleElement = document.createElement('style');
        interactionStyleElement.id = styleId;
        interactionStyleElement.type = 'text/css';
        interactionStyleElement.innerHTML = interactionCss;
        document.head.appendChild(interactionStyleElement);

        const staticStyleElement = document.createElement('style');
        staticStyleElement.id = staticStyleId;
        staticStyleElement.type = 'text/css';
        staticStyleElement.innerHTML = staticCss;
        document.head.appendChild(staticStyleElement);
    }

    // ----- Простая debounce -----
    function debounce(fn, ms = 120) {
        let t = null;
        return function() {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, arguments), ms);
        };
    }

    // ----- Секция: система выбора парсеров (взята только логика для торрентов) -----
    // Список парсеров — подставьте ваши реальные записи если нужно
    const PARSERS = [
        { base: 'jacred_xyz', title: 'Jacred.xyz', url: 'jacred.xyz', url_two: 'jacred_xyz', jac_key: '', jac_int: 'healthy', jac_lang: 'lg' },
        { base: 'jr_maxvol_pro', title: 'Jr.maxvol.pro', url: 'jr.maxvol.pro', url_two: 'jr_maxvol_pro', jac_key: '', jac_int: '', jac_lang: 'lg' },
        { base: 'jacred_pro', title: 'Jacred.pro', url: 'jacred.pro', url_two: 'jacred_pro', jac_key: '', jac_int: '', jac_lang: 'lg' },
        { base: 'no_parser', title: 'Нет парсера', url: '', url_two: 'no_parser', jac_key: '', jac_int: '', jac_lang: 'lg' }
    ];

    function getStorageApi() {
        if (window.Lampa && Lampa.Storage) return Lampa.Storage;
        if (window.app && app.storage) return app.storage;
        return null;
    }

    function safeSet(key, value) {
        try {
            const s = getStorageApi();
            if (s) {
                if (typeof s.set === 'function') { s.set(key, value); return true; }
                if (typeof s.setItem === 'function') { s.setItem(key, value); return true; }
            }
            if (window.localStorage) { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); return true; }
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

    // Сохраняем текущий контроллер (чтобы вернуться на страницу фильма)
    let _savedController = null;
    function saveCurrentState() {
        try {
            if (window.Lampa && Lampa.Controller) {
                const name = typeof Lampa.Controller.activeName === 'function' ? Lampa.Controller.activeName() : null;
                const id = typeof Lampa.Controller.activeId === 'function' ? Lampa.Controller.activeId() : null;
                _savedController = { name: name || null, id: id || null };
                log('saved controller', _savedController);
                return;
            }
            _savedController = null;
        } catch (e) { log('saveCurrentState error', e); _savedController = null; }
    }

    function restoreSavedState() {
        try {
            log('restoreSavedState', _savedController);
            if (!_savedController) return tryHistoryBack();
            if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.open === 'function') {
                try {
                    if (_savedController.id) Lampa.Controller.open(_savedController.name, _savedController.id);
                    else Lampa.Controller.open(_savedController.name);
                    setTimeout(() => { runListUpdateTriggers(); }, 400);
                    return;
                } catch (e) { log('Lampa.Controller.open failed', e); }
            }
            tryHistoryBack();
        } catch (e) { log('restoreSavedState error', e); }
    }

    function tryHistoryBack() {
        try { if (window.history && typeof history.back === 'function') { history.back(); log('history.back called'); setTimeout(() => { runListUpdateTriggers(); }, 350); } } catch (e) { log('history.back failed', e); }
    }

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

        try {
            const searchBtn = document.querySelector('.torrent-filter .filter--search') || document.querySelector('.filter--search');
            const backBtn = document.querySelector('.torrent-filter .filter--back') || document.querySelector('.filter--back');
            if (searchBtn) { try { searchBtn.click(); log('clicked filter--search'); } catch (e) { log(e); } }
            setTimeout(() => { if (backBtn) { try { backBtn.click(); log('clicked filter--back'); } catch (e) { log(e); } } }, 220);
        } catch (e) { log('simulate click error', e); }

        try { window.dispatchEvent(new CustomEvent('LampaParserChanged', { detail: { time: Date.now() } })); log('dispatched LampaParserChanged'); } catch (e) { log(e); }
    }

    // Проверка доступности парсеров (используем как в примере HEAD+no-cors)
    async function checkAvailability(url) {
        try {
            await fetch(`https://${url}`, { method: 'HEAD', mode: 'no-cors' });
            return true;
        } catch {
            return false;
        }
    }

    // Вставка кнопки парсеров в .torrent-filter
    function injectParserButton() {
        try {
            const container = document.querySelector('.torrent-filter');
            if (!container) return;
            if (container.querySelector('.filter--parser')) return;

            const btn = document.createElement('div');
            btn.className = 'simple-button simple-button--filter filter--parser selector';
            btn.setAttribute('data-name', 'parser_selector');

            const icon = document.createElement('div');
            icon.style.width = '1.05em';
            icon.style.height = '1.05em';
            icon.style.display = 'inline-block';
            icon.style.borderRadius = '0.2em';
            icon.style.background = 'linear-gradient(90deg,#d99821,#e8b84f)';
            icon.style.flex = '0 0 auto';
            icon.style.marginRight = '0.5em';
            btn.appendChild(icon);

            const spanTitle = document.createElement('span');
            spanTitle.textContent = 'Парсер';
            btn.appendChild(spanTitle);

            const divCurrent = document.createElement('div');
            divCurrent.className = '';
            divCurrent.textContent = getCurrentParserTitle();
            btn.appendChild(divCurrent);

            const ref = container.querySelector('.filter--filter');
            if (ref && ref.parentNode) ref.parentNode.insertBefore(btn, ref.nextSibling);
            else container.appendChild(btn);

            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                saveCurrentState();
                openParserSelectMenu();
            });

            if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.follow === 'function') {
                Lampa.Storage.follow('change', () => {
                    const el = document.querySelector('.filter--parser > div:last-child');
                    if (el) el.textContent = getCurrentParserTitle();
                });
            }

            log('Parser button injected');
        } catch (e) {
            log('injectParserButton error', e);
        }
    }

    function getCurrentParserTitle() {
        try {
            const key = safeGet('parser_torrent_type') || safeGet('lme_url_two') || safeGet('parser') || '';
            if (!key) return 'Авто';
            const p = PARSERS.find(x => x.url_two === key || x.base === key || x.url === key);
            return p ? p.title : 'Выбран';
        } catch (e) { return 'Авто'; }
    }

    // Открываем Lampa.Select и обрабатываем выбор
    function openParserSelectMenu() {
        try {
            if (window.Lampa && Lampa.Select && typeof Lampa.Select.show === 'function') {
                // подготавливаем статусы — не блокируем UI (в фоне)
                Promise.all(PARSERS.map(async p => {
                    const ok = p.url ? await checkAvailability(p.url).catch(() => false) : false;
                    return { ...p, ok };
                })).then(statuses => {
                    const items = statuses.map(s => ({
                        title: `<span style="color:${s.ok ? '#00ff00' : '#ff3333'}">${s.title}</span>`,
                        url: s.url,
                        url_two: s.url_two || s.base,
                        base: s.base,
                        jac_key: s.jac_key
                    }));

                    Lampa.Select.show({
                        title: 'Выбрать парсер',
                        items: items,
                        onBack: function() {
                            try { if (Lampa.Select && typeof Lampa.Select.hide === 'function') Lampa.Select.hide(); } catch (e) {}
                            log('select onBack');
                        },
                        onSelect: function(item) {
                            log('parser selected', item);
                            try {
                                if (item.url) safeSet('jackett_url', item.url);
                                safeSet('parser_torrent_type', item.url_two || item.base || '');
                                safeSet('jackett_key', item.jac_key || '');
                                safeSet('lme_url_two', item.base || '');
                                safeSet('parser_use', true);
                                log('settings saved', item.url_two || item.base);
                            } catch (e) { log('save error', e); }

                            try { if (Lampa.Select && typeof Lampa.Select.hide === 'function') Lampa.Select.hide(); } catch (e) {}

                            setTimeout(() => {
                                const el = document.querySelector('.filter--parser > div:last-child');
                                if (el) el.textContent = getCurrentParserTitle();
                            }, 220);

                            setTimeout(() => restoreSavedState(), 260);

                            setTimeout(() => {
                                try { window.dispatchEvent(new CustomEvent('parser_changed', { detail: { base: item.base } })); } catch (e) {}
                                runListUpdateTriggers();
                            }, 600);
                        }
                    });
                }).catch(err => {
                    log('statuses Promise error', err);
                });
            } else {
                alert('Открыть меню выбора парсеров можно только внутри Lampa');
                log('Lampa.Select not found');
            }
        } catch (e) { log('openParserSelectMenu error', e); }
    }

    // ----- Observer и применение стилей -----
    function applyAll() {
        recolorSeedNumbers();
        roundCorners();
        changeBackground();
        injectInteractionStyles();
        injectParserButton();
    }

    function startObserver() {
        applyAll();
        const obs = new MutationObserver(debounce(applyAll, 120));
        obs.observe(document.body, { childList: true, subtree: true });
        log('Observer started (merged)');
    }

    // ----- Регистрация плагина (как у вас было) -----
    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: VERSION,
                author: 'maxi3219',
                description: 'Цвет сидов, скругления блоков, фон, прозрачность меню и выбор парсеров (torrent only)',
                init: startObserver
            });
            log('Registered with Lampa');
        } else {
            log('Standalone mode');
            startObserver();
        }
    }

    register();

    // ----- Для отладки: экспорт парсеров и функций -----
    try { window.__MaxColorPlugin = { PARSERS, safeGet, safeSet, openParserSelectMenu, runListUpdateTriggers }; } catch (e) {}

})();
