(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';
    const COLORS = { low: '#ff3333', mid: '#ffcc00', high: '#00ff00' };
    const BLOCK_RADIUS = '0.9em';
    const GRADIENT_APP_BG = 'linear-gradient(117deg, rgb(0 0 0) 0%, rgb(11 26 35) 50%, rgb(14, 14, 14) 100%)';

    function log(...a) { try { console.log(`[${plugin_name}]`, ...a); } catch (e) {} }

    // визуальные правки (как были)
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
            panel.style.left = '99%';
            panel.style.maxHeight = 'calc(100vh - 1.8em)';
            panel.style.setProperty('left', '99%', 'important');
            panel.style.setProperty('max-height', 'calc(100vh - 1.8em)', 'important');
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
            .full-start__button.selector:hover, .full-start__button.selector.focus {
                border-radius: 0.5em !important;
                box-shadow: ${SHADOW_COLOR} !important;
                background: ${GRADIENT_HOVER_BG} !important;
            }
            .selectbox-item.selector:hover, .selectbox-item.selector.focus { box-shadow: ${SHADOW_COLOR} !important; }
            .settings-folder.selector:hover, .settings-folder.selector.focus { box-shadow: ${SHADOW_COLOR} !important; }
            .simple-button.simple-button--filter.selector.filter--parser { display:inline-flex; align-items:center; gap:0.6em; }
        `;
        const staticCss = `.torrent-item.selector { background-color: rgb(68 68 69 / 13%) !important; }`;

        const s1 = document.createElement('style'); s1.id = styleId; s1.innerHTML = interactionCss; document.head.appendChild(s1);
        const s2 = document.createElement('style'); s2.id = staticStyleId; s2.innerHTML = staticCss; document.head.appendChild(s2);
    }

    // простой список парсеров (подставьте реальные значения если нужно)
    const PARSERS = [
        { title: 'Jacred Maxvol Pro', url: 'jr.maxvol.pro', url_two: 'jr_maxvol_pro', jac_key: '', jac_int: 'on', jac_lang: 'lg' },
        { title: '62.60.149.237:9117', url: '62.60.149.237:9117', url_two: '62.60.149.237:9117', jac_key: '', jac_int: '', jac_lang: 'df' },
        { title: 'jacred_xyz', url: 'jacred.xyz', url_two: 'jacred_xyz', jac_key: '', jac_int: 'healthy', jac_lang: 'lg' },
        { title: 'jacred_ru', url: 'jac-red.ru', url_two: 'jacred_ru', jac_key: '', jac_int: '', jac_lang: 'lg' },
        { title: 'No parser', url: '', url_two: 'no_parser', jac_key: '', jac_int: '', jac_lang: 'lg' }
    ];

    function getStorage() {
        if (window.Lampa && Lampa.Storage) return Lampa.Storage;
        if (window.app && app.storage) return app.storage;
        return null;
    }

    function safeSetStorage(key, value) {
        const storage = getStorage();
        if (!storage) return false;
        try {
            if (typeof storage.set === 'function') storage.set(key, value);
            else if (typeof storage.setItem === 'function') storage.setItem(key, value);
            else storage[key] = value;
            return true;
        } catch (e) { log('safeSetStorage error', e); return false; }
    }

    function safeGetStorage(key) {
        const storage = getStorage();
        if (!storage) return null;
        try {
            if (typeof storage.get === 'function') return storage.get(key);
            if (typeof storage.getItem === 'function') return storage.getItem(key);
            return storage[key];
        } catch (e) { return null; }
    }

    function notifyStorageChange(key) {
        try {
            // Lampa internal event if exists
            if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.change === 'function') {
                Lampa.Storage.change(key);
            }
            // generic custom event
            window.dispatchEvent(new CustomEvent('LampaStorageChange', { detail: { key } }));
            log('storage change notified for', key);
        } catch (e) { log('notifyStorageChange error', e); }
    }

    function updateUIAfterSelect() {
        try {
            // пытаемся вызвать известные API для обновления
            if (window.Lampa) {
                if (Lampa.Controller && typeof Lampa.Controller.update === 'function') try { Lampa.Controller.update(); } catch(e){};
                if (Lampa.Controller && typeof Lampa.Controller.refresh === 'function') try { Lampa.Controller.refresh(); } catch(e){};
                if (Lampa.Activity && typeof Lampa.Activity.reload === 'function') try { Lampa.Activity.reload(); } catch(e){};
                if (Lampa.Select && typeof Lampa.Select.hide === 'function') try { Lampa.Select.hide(); } catch(e){}
                if (Lampa.Select && typeof Lampa.Select.close === 'function') try { Lampa.Select.close(); } catch(e){}
            }
            // fallback: history.back()
            if (window.history && typeof history.back === 'function') history.back();
        } catch (e) { log('updateUIAfterSelect error', e); }
    }

    function getCurrentParserTitle() {
        try {
            const key = safeGetStorage('parser_torrent_type') || safeGetStorage('parser') || '';
            if (!key) return 'Авто';
            const p = PARSERS.find(x => x.url_two === key || x.url === key);
            return p ? p.title : 'Выбран';
        } catch (e) { return 'Авто'; }
    }

    // открывает Lampa.Select и обрабатывает выбор
    function openParserSelectMenu() {
        try {
            if (window.Lampa && Lampa.Select && typeof Lampa.Select.show === 'function') {
                const items = PARSERS.map(p => ({
                    title: p.title,
                    url: p.url,
                    url_two: p.url_two,
                    jac_key: p.jac_key,
                    jac_int: p.jac_int,
                    jac_lang: p.jac_lang
                }));

                Lampa.Select.show({
                    title: 'Выбрать парсер',
                    items: items,
                    onBack: function() {
                        log('parser select onBack');
                        // просто закрыть селект
                        try { if (Lampa.Select && typeof Lampa.Select.hide === 'function') Lampa.Select.hide(); } catch(e){}
                        try { history.back(); } catch(e){}
                    },
                    onSelect: function(item) {
                        log('parser selected', item);
                        // сохраняем в storage — используем безопасную установку
                        try {
                            // наиболее часто используемые ключи из оригинального кода
                            if (item.url) safeSetStorage('jackett_url', item.url);
                            safeSetStorage('parser_torrent_type', item.url_two || '');
                            safeSetStorage('jackett_key', item.jac_key || '');
                            safeSetStorage('jackett_interview', item.jac_int || '');
                            safeSetStorage('parse_lang', item.jac_lang || 'lg');
                            safeSetStorage('parser_use', true);

                            // уведомляем о смене
                            notifyStorageChange('parser_torrent_type');
                        } catch (e) { log('save error', e); }

                        // закрываем селект и пробуем инициировать обновление списка/контроллера
                        try {
                            if (Lampa.Select && typeof Lampa.Select.hide === 'function') Lampa.Select.hide();
                            if (Lampa.Select && typeof Lampa.Select.close === 'function') Lampa.Select.close();
                        } catch (e) { log('close select error', e); }

                        // небольшая задержка перед обновлением интерфейса
                        setTimeout(() => {
                            updateUIAfterSelect();
                            // Обновляем подпись на кнопке парсеров
                            const el = document.querySelector('.filter--parser > div:last-child');
                            if (el) el.textContent = getCurrentParserTitle();
                        }, 300);
                    }
                });
            } else {
                alert('Меню выбора парсеров доступно только внутри Lampa');
            }
        } catch (e) {
            log('openParserSelectMenu error', e);
        }
    }

    // вставляет кнопку в .torrent-filter
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

            btn.addEventListener('click', function(e) { e.stopPropagation(); openParserSelectMenu(); });

            // реагируем на изменение storage (если Lampa предоставляет follow)
            if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.follow === 'function') {
                Lampa.Storage.follow('change', () => {
                    const el = document.querySelector('.filter--parser > div:last-child');
                    if (el) el.textContent = getCurrentParserTitle();
                });
            }
        } catch (e) {
            log('injectParserButton error', e);
        }
    }

    function applyStyles() {
        recolorSeedNumbers();
        roundCorners();
        changeBackground();
        injectInteractionStyles();
        injectParserButton();
    }

    function startObserver() {
        applyStyles();
        const obs = new MutationObserver(debounce(applyStyles, 120));
        obs.observe(document.body, { childList: true, subtree: true });
        log('Observer started (v1.2) — parser button injected and select fixed');
    }

    function debounce(fn, ms) {
        let t = null;
        return function() { clearTimeout(t); t = setTimeout(() => fn.apply(this, arguments), ms); };
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.2',
                author: 'maxi3219',
                description: 'Цвет сидов, скругления, фон, эффекты и выбор парсеров (фикс выбора)',
                init: startObserver
            });
            log('Registered with Lampa');
        } else {
            log('Standalone mode');
            startObserver();
        }
    }

    register();
})();
