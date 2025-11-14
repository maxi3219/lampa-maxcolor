(() => {
    'use strict';

    const plugin_id = 'roundedmenu';
    const plugin_name = 'RoundedMenu';

    const SEED_COLORS = { low: '#ff3333', mid: '#ffcc00', high: '#00ff00' };

    const parsersInfo = [
        { base: 'jacred_xyz',         name: 'Jacred.xyz',      settings: { url: 'jacred.xyz',          key: '',        parser_torrent_type: 'jackett' } },
        { base: 'jr_maxvol_pro',      name: 'Jr.maxvol.pro',   settings: { url: 'jr.maxvol.pro',       key: '',        parser_torrent_type: 'jackett' } },
        { base: 'jacred_my_to',       name: 'Jacred.my.to',    settings: { url: 'jacred.my.to',        key: '',        parser_torrent_type: 'jackett' } },
        { base: 'lampa_app',          name: 'Lampa.app',       settings: { url: 'lampa.app',           key: '',        parser_torrent_type: 'jackett' } },
        { base: 'jacred_pro',         name: 'Jacred.pro',      settings: { url: 'jacred.pro',          key: '',        parser_torrent_type: 'jackett' } },
        { base: 'jacred_viewbox_dev', name: 'Viewbox',         settings: { url: 'jacred.viewbox.dev',  key: 'viewbox', parser_torrent_type: 'jackett' } }
    ];

    // ===== Activity tracking (reliable torrents vs online detection) =====
    const currentActivity = { component: '', source: '', type: '' };

    function trackActivity() {
        try {
            Lampa.Listener.follow('activity', e => {
                if (e && (e.type === 'start' || e.type === 'enter')) {
                    currentActivity.component = String(e.activity?.component || '').toLowerCase();
                    currentActivity.source    = String(e.activity?.source    || '').toLowerCase();
                    currentActivity.type      = String(e.activity?.type      || '').toLowerCase();
                }
            });
        } catch (_) {}
    }

    function inTorrentsContext() {
        // Hard rules first (exclude online), then include torrents, finally DOM fallback
        const comp = currentActivity.component;
        const src  = currentActivity.source;
        const typ  = currentActivity.type;

        const isOnline = comp.includes('online') || src.includes('online');
        if (isOnline) return false;

        const isTorrentActivity =
            comp.includes('torrent') ||
            src.includes('jackett')   ||
            typ === 'torrents'        ||
            Lampa.Storage.get('parser_torrent_type') === 'jackett' ||
            Lampa.Storage.get('parser_torrent_type') === 'prowlarr';

        // DOM fallback only if not clearly online
        const hasTorrentFilterDom = !!document.querySelector('.torrent-filter');

        return isTorrentActivity || (hasTorrentFilterDom && !isOnline);
    }

    // ===== Styles =====
    function applyStyles() {
        const style = document.createElement('style');
        style.id = 'roundedmenu-style';
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

            body { background: linear-gradient(135deg, #010a13 0%, #133442 50%, #01161d 100%) !important; color: #fff !important; }
            .head__body svg, .head__body svg use { fill: #fff !important; color: #fff !important; transition: none !important; }
            .head__body .selector.hover svg, .head__body .selector.focus svg, .head__body .selector.traverse svg { fill: #fff !important; color: #fff !important; }
            .head__body .selector.hover, .head__body .selector.focus, .head__body .selector.traverse { color: inherit !important; }
            .filter--parser.selector { cursor: pointer !important; }

            .torrent-item {
                position: relative !important;
                border-radius: 0.9em !important;
                background: transparent !important;
                overflow: visible !important;
            }
            .torrent-item::before {
                content: '' !important;
                position: absolute !important;
                inset: 0 !important;
                background-color: rgba(0,0,0,0.3) !important;
                border-radius: inherit !important;
                z-index: 0 !important;
                pointer-events: none !important;
            }
            .torrent-item > * { position: relative !important; z-index: 1 !important; }
            .torrent-item__viewed {
                position: absolute !important;
                top: 8px !important;
                right: 8px !important;
                z-index: 2 !important;
                pointer-events: none !important;
            }

            .watched-history {
                position: relative !important;
                border-radius: 0.9em !important;
            }

            .torrent-filter .selector.hover,
            .torrent-filter .selector.focus,
            .torrent-filter .selector.traverse {
                background: linear-gradient(to right, #4dd9a0 1%, #4d8fa8 100%) !important;
                border-radius: 1em !important;
                color: #fff !important;
            }

            .full-start-new__buttons .full-start__button.selector {
                border-radius: 1em !important;
                transition: background 0.18s ease !important;
            }
            .full-start-new__buttons .full-start__button.selector.hover,
            .full-start-new__buttons .full-start__button.selector.focus,
            .full-start-new__buttons .full-start__button.selector.traverse {
                background: linear-gradient(to right, #4dd9a0 12%, #2f6ea8 100%) !important;
                border-radius: 0.5em !important;
                color: #fff !important;
            }
            .full-start-new__buttons .full-start__button.selector.hover svg,
            .full-start-new__buttons .full-start__button.selector.focus svg,
            .full-start-new__buttons .full-start__button.selector.traverse svg {
                color: #fff !important;
                fill: #fff !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ===== Reload button =====
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
            let triedReload = false;

            try { triedReload = true; window.location.reload(); } catch (e) {}

            setTimeout(() => {
                try { window.location.replace(href); }
                catch (e) { try { window.location.href = href; } catch (_) {} }
            }, triedReload ? 250 : 0);
        });

        headActions.appendChild(btn);
    }

    // ===== Parser switching =====
    function changeParser() {
        const selected = Lampa.Storage.get('lme_url_two');
        const found = parsersInfo.find(p => p.base === selected);
        if (found) {
            const s = found.settings;
            const type = s.parser_torrent_type === 'prowlarr' ? 'prowlarr' : 'jackett';
            Lampa.Storage.set(type + '_url', s.url);
            Lampa.Storage.set(type + '_key', s.key);
            Lampa.Storage.set('parser_torrent_type', s.parser_torrent_type);
        }
    }

    async function checkAvailability(url) {
        try {
            await fetch(`https://${url}`, { method: 'HEAD', mode: 'no-cors' });
            return true;
        } catch {
            return false;
        }
    }

    function openParserSelect() {
        Promise.all(parsersInfo.map(async p => {
            const ok = await checkAvailability(p.settings.url);
            return { ...p, ok };
        })).then(statuses => {
            const items = statuses.map(s => ({
                title: `<span style="color:${s.ok ? '#00ff00' : '#ff3333'}">${s.name}</span>`,
                base: s.base,
                selected: Lampa.Storage.get('lme_url_two') === s.base
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

                    try {
                        const active = Lampa.Activity.active();
                        if (active && active.activity && typeof active.activity.refresh === 'function') {
                            active.activity.refresh();
                        }
                    } catch (err) { /* noop */ }
                }
            });
        });
    }

    // ===== Parser button (only in torrents) =====
    function mountParserButton(container) {
        if (!container || container.querySelector('#parser-selectbox')) return;
        if (!inTorrentsContext()) return;

        const currentBase = Lampa.Storage.get('lme_url_two') || 'jacred_xyz';
        const currentInfo = parsersInfo.find(p => p.base === currentBase) || parsersInfo[0];

        const btn = document.createElement('div');
        btn.id = 'parser-selectbox';
        btn.className = 'simple-button simple-button--filter filter--parser selector';
        btn.innerHTML = `<span>Парсер</span><div id="parser-current">${currentInfo.name}</div>`;
        container.appendChild(btn);

        btn.addEventListener('hover:enter', () => {
            if (inTorrentsContext()) openParserSelect();
        });
    }

    function startParserObserver() {
        const obs = new MutationObserver(() => {
            if (!inTorrentsContext()) return;
            const container = document.querySelector('.torrent-filter');
            if (container && !container.querySelector('#parser-selectbox')) {
                mountParserButton(container);
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });

        if (inTorrentsContext()) {
            const first = document.querySelector('.torrent-filter');
            if (first) mountParserButton(first);
        }
    }

    // ===== Auto open select on parser error (only in torrents) =====
    function handleParserError() {
        let lastTrigger = 0;
        const TRIGGER_COOLDOWN = 1500; // ms

        function shouldTriggerOnce() {
            const now = Date.now();
            if (now - lastTrigger < TRIGGER_COOLDOWN) return false;
            lastTrigger = now;
            return true;
        }

        function isErrorBlock(node) {
            if (!node) return false;
            const txt = (node.textContent || '').toLowerCase();
            return (
                txt.includes('ошибка подключения') ||
                txt.includes('здесь пусто') ||
                txt.includes('парсер не отвечает')
            );
        }

        function wireRefreshButtonWithin(errorBlock) {
            const btns = errorBlock.querySelectorAll('.button, .selector');
            btns.forEach(b => {
                const label = (b.textContent || '').trim().toLowerCase();
                if (label.includes('обновить')) {
                    b.addEventListener('hover:enter', (ev) => {
                        try { ev.stopPropagation(); } catch (e) {}
                        if (inTorrentsContext()) openParserSelect();
                    }, { once: true });
                }
            });
        }

        const obs = new MutationObserver((mutations) => {
            if (!inTorrentsContext()) return;

            for (const m of mutations) {
                const added = Array.from(m.addedNodes || []);
                for (const node of added) {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('empty') && isErrorBlock(node)) {
                        if (shouldTriggerOnce()) {
                            wireRefreshButtonWithin(node);
                            openParserSelect();
                        }
                    }
                    if (node.nodeType === 1) {
                        const emptyInTree = node.querySelector && node.querySelector('.empty');
                        if (emptyInTree && isErrorBlock(emptyInTree)) {
                            if (shouldTriggerOnce()) {
                                wireRefreshButtonWithin(emptyInTree);
                                openParserSelect();
                            }
                        }
                    }
                }
            }
        });

        obs.observe(document.body, { childList: true, subtree: true });

        const initialEmpty = document.querySelector('.empty');
        if (initialEmpty && isErrorBlock(initialEmpty) && inTorrentsContext() && shouldTriggerOnce()) {
            wireRefreshButtonWithin(initialEmpty);
            openParserSelect();
        }
    }

    // ===== Seeds color =====
    function recolorSeedNumbers() {
        const seedBlocks = document.querySelectorAll('.torrent-item__seeds');
        seedBlocks.forEach(block => {
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
    }

    function startSeedsObserver() {
        const obs = new MutationObserver(() => recolorSeedNumbers());
        obs.observe(document.body, { childList: true, subtree: true });
        recolorSeedNumbers();
    }

    // ===== Boot & register =====
    function initMenuPlugin() {
        const boot = () => {
            trackActivity();           // start tracking activity
            applyStyles();
            addReloadButton();
            startParserObserver();
            changeParser();
            handleParserError();
        };

        if (window.Lampa && typeof Lampa.Listener === 'object') {
            Lampa.Listener.follow('app', e => {
                if (e.type === 'ready') boot();
            });
        } else {
            document.addEventListener('DOMContentLoaded', boot);
        }
    }

    function registerMenu() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '10.8',
                author: 'maxi3219',
                description: 'Жёсткий перезапуск (ПК/ТВ) + авто-выбор парсера при ошибке подключения (только торренты) + скругление подложек торрентов + UI tweaks',
                init: initMenuPlugin
            });
        } else {
            initMenuPlugin();
        }
    }

    registerMenu();

    if (window.app && app.plugins && typeof app.plugins.add === 'function') {
        app.plugins.add({
            id: 'maxcolor',
            name: 'MaxColor',
            version: '2.8',
            author: 'maxi3219',
            description: 'Цвет раздающих',
            init: startSeedsObserver
        });
    } else {
        startSeedsObserver();
    }

})();
