(() => {
    'use strict';

    const plugin_id = 'roundedmenu';
    const plugin_name = 'RoundedMenu';

    const SEED_COLORS = { low: '#ff3333', mid: '#ffcc00', high: '#00ff00' };

    const parsersInfo = [
        { base: 'jacred_xyz',        name: 'Jacred.xyz',      settings: { url: 'jacred.xyz',         key: '',       parser_torrent_type: 'jackett' } },
        { base: 'jr_maxvol_pro',     name: 'Jr.maxvol.pro',   settings: { url: 'jr_maxvol.pro',      key: '',       parser_torrent_type: 'jackett' } },
        { base: 'jacred_my_to',      name: 'Jacred.my.to',    settings: { url: 'jacred.my.to',       key: '',       parser_torrent_type: 'jackett' } },
        { base: 'lampa_app',         name: 'Lampa.app',       settings: { url: 'lampa.app',          key: '',       parser_torrent_type: 'jackett' } },
        { base: 'jacred_pro',        name: 'Jacred.pro',      settings: { url: 'jacred.pro',         key: '',       parser_torrent_type: 'jackett' } },
        { base: 'jacred_viewbox_dev',name: 'Viewbox',         settings: { url: 'jacred.viewbox.dev', key: 'viewbox',parser_torrent_type: 'jackett' } }
    ];

    /* ---------------- СТИЛИ ---------------- */
    function applyStyles() {
        const style = document.createElement('style');
        style.id = 'roundedmenu-style';
        style.innerHTML = `YOUR ORIGINAL CSS BLOCK (оставил нетронутым)`; // ВОЗВРАЩАЙ свой оригинальный CSS сюда
        document.head.appendChild(style);
    }

    /* ---------------- КНОПКА ОБНОВЛЕНИЯ ---------------- */
    function addReloadButton() {
        if (document.getElementById('MRELOAD')) return;
        const headActions = document.querySelector('.head__actions');
        if (!headActions) { setTimeout(addReloadButton, 1000); return; }

        const btn = document.createElement('div');
        btn.id = 'MRELOAD';
        btn.className = 'head__action selector m-reload-screen';
        btn.innerHTML = `<svg fill="#fff" viewBox="0 0 24 24"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z"/></svg>`;

        btn.addEventListener('hover:enter', () => {
            const href = window.location.href;
            try { window.location.reload(); } catch (e) {}
            setTimeout(() => {
                try { window.location.replace(href); } catch (e) { window.location.href = href; }
            }, 200);
        });

        headActions.appendChild(btn);
    }

    /* ---------------- СМЕНА ПАРСЕРА ---------------- */
    function changeParser() {
        const selected = Lampa.Storage.get('lme_url_two');
        const found = parsersInfo.find(p => p.base === selected);
        if (!found) return;

        const s = found.settings;
        const type = s.parser_torrent_type === 'prowlarr' ? 'prowlarr' : 'jackett';

        Lampa.Storage.set(type + '_url', s.url);
        Lampa.Storage.set(type + '_key', s.key);
        Lampa.Storage.set('parser_torrent_type', s.parser_torrent_type);
    }

    async function checkAvailability(url) {
        try {
            await fetch(`https://${url}`, { method: 'HEAD', mode: 'no-cors' });
            return true;
        } catch {
            return false;
        }
    }

    /* ---------------- КНОПКА "ПАРСЕР" ---------------- */
    function mountParserButton(container) {
        if (!container || container.querySelector('#parser-selectbox')) return;

        const currentBase = Lampa.Storage.get('lme_url_two') || 'jacred_xyz';
        const currentInfo = parsersInfo.find(p => p.base === currentBase) || parsersInfo[0];

        const btn = document.createElement('div');
        btn.id = 'parser-selectbox';
        btn.className = 'simple-button simple-button--filter filter--parser selector';
        btn.innerHTML = `<span>Парсер</span><div id="parser-current">${currentInfo.name}</div>`;

        btn.addEventListener('hover:enter', showParserList);
        container.appendChild(btn);
    }

    function startParserObserver() {
        const obs = new MutationObserver(() => {
            const container = document.querySelector('.torrent-filter');
            if (container && !container.querySelector('#parser-selectbox')) {
                mountParserButton(container);
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });

        const first = document.querySelector('.torrent-filter');
        if (first) mountParserButton(first);
    }

    /* ---------------- АВТО-МЕНЮ ПРИ ОШИБКЕ ---------------- */
    function autoOpenOnParserError() {
        const observer = new MutationObserver(() => {
            const empty = document.querySelector(
                '.empty, .empty__body, .empty__title, .empty__text'
            );

            if (!empty) return;

            const text = (empty.innerText || '').toLowerCase();

            if (
                text.includes('парсер не отвечает') ||
                (text.includes('здесь пусто') && text.includes('парсер')) ||
                (text.includes('ошибка') && text.includes('парсер'))
            ) {
                showParserList();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    /* ---------------- МЕНЮ СПИСКА ПАРСЕРОВ ---------------- */
    function showParserList() {
        Promise.all(parsersInfo.map(async p => {
            const ok = await checkAvailability(p.settings.url);
            return { ...p, ok };
        }))
        .then(statuses => {
            const current = Lampa.Storage.get('lme_url_two');

            const items = statuses.map(s => ({
                title: (current === s.base ? '✓ ' : '') +
                       `<span style="color:${s.ok ? '#00ff00' : '#ff3333'}">${s.name}</span>`,
                base: s.base
            }));

            Lampa.Select.show({
                title: 'Каталог парсеров',
                items,
                onSelect: (a) => {
                    Lampa.Storage.set('lme_url_two', a.base);
                    changeParser();

                    const el = document.getElementById('parser-current');
                    const picked = parsersInfo.find(p => p.base === a.base);
                    if (el && picked) el.textContent = picked.name;

                    Lampa.Select.hide();

                    // задержка, чтобы не ломать выбор
                    setTimeout(() => {
                        try {
                            const active = Lampa.Activity.active();
                            active?.activity?.refresh?.();
                        } catch {}
                    }, 250);
                }
            });
        });
    }

    /* ---------------- ИНИЦИАЛИЗАЦИЯ ---------------- */
    function initMenuPlugin() {
        applyStyles();
        addReloadButton();
        startParserObserver();
        changeParser();
        autoOpenOnParserError();
    }

    registerPlugins();
    function registerPlugins() {
        if (window.app?.plugins?.add) {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '10.4',
                author: 'maxi3219',
                description: 'Меню, UI, авто-парсер',
                init: initMenuPlugin
            });
        } else initMenuPlugin();

        if (window.app?.plugins?.add) {
            app.plugins.add({
                id: 'maxcolor',
                name: 'MaxColor',
                version: '2.5',
                author: 'maxi3219',
                description: 'Цвет сидов',
                init: startSeedsObserver
            });
        } else startSeedsObserver();
    }

    /* ---------------- ПОДСВЕТКА СИДОВ ---------------- */
    function recolorSeedNumbers() {
        document.querySelectorAll('.torrent-item__seeds span').forEach(span => {
            const num = parseInt(span.textContent);
            if (isNaN(num)) return;
            span.style.color =
                num > 10 ? SEED_COLORS.high :
                num >= 5 ? SEED_COLORS.mid :
                SEED_COLORS.low;
            span.style.fontWeight = 'bold';
        });
    }

    function startSeedsObserver() {
        const obs = new MutationObserver(recolorSeedNumbers);
        obs.observe(document.body, { childList: true, subtree: true });
        recolorSeedNumbers();
    }

})();
