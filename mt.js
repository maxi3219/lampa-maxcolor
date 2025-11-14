(() => {
    'use strict';

    const plugin_id = 'roundedmenu';
    const plugin_name = 'RoundedMenu';

    const SEED_COLORS = { low: '#ff3333', mid: '#ffcc00', high: '#00ff00' };

    const parsersInfo = [
        { base: 'jacred_xyz',         name: 'Jacred.xyz',        settings:{ url:'jacred.xyz',           key:'',        parser_torrent_type:'jackett' } },
        { base: 'jr_maxvol_pro',      name: 'Jr.maxvol.pro',     settings:{ url:'jr.maxvol.pro',        key:'',        parser_torrent_type:'jackett' } },
        { base: 'jacred_my_to',       name: 'Jacred.my.to',      settings:{ url:'jacred.my.to',         key:'',        parser_torrent_type:'jackett' } },
        { base: 'lampa_app',          name: 'Lampa.app',         settings:{ url:'lampa.app',            key:'',        parser_torrent_type:'jackett' } },
        { base: 'jacred_pro',         name: 'Jacred.pro',        settings:{ url:'jacred.pro',           key:'',        parser_torrent_type:'jackett' } },
        { base: 'jacred_viewbox_dev', name: 'Viewbox',           settings:{ url:'jacred.viewbox.dev',   key:'viewbox', parser_torrent_type:'jackett' } }
    ];

    /* UI / CSS tweaks */
    function applyStyles() {
        const style = document.createElement('style');
        style.id = 'roundedmenu-style';
        style.innerHTML = `
            @media screen and (min-width: 480px) {
                .settings__content, .selectbox__content.layer--height {
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
                .settings-folder.selector, .settings-param.selector, .settings-param__value.selector, .selectbox-item.selector {
                    border-radius: 1em !important;
                    margin-bottom: 0.3em !important;
                    transition: background 0.25s ease !important;
                }
                .settings-folder.selector.focus, .settings-folder.selector.hover, .settings-folder.selector.traverse,
                .settings-param.selector.focus, .settings-param.selector.hover, .settings-param.selector.traverse,
                .settings-param__value.selector.focus, .settings-param__value.selector.hover, .settings-param__value.selector.traverse,
                .selectbox-item.selector.focus, .selectbox-item.selector.hover, .selectbox-item.selector.traverse {
                    background: linear-gradient(to right, #4dd9a0 1%, #4d8fa8 100%) !important;
                    border-radius: 1em !important;
                }
            }

            body { background: linear-gradient(135deg, #010a13 0%, #133442 50%, #01161d 100%) !important; color: #fff !important; }
            .head__body svg, .head__body svg use { fill: #fff !important; color: #fff !important; transition: none !important; }
            .head__body .selector.hover svg, .head__body .selector.focus svg, .head__body .selector.traverse svg { fill: #fff !important; color: #fff !important; }
            .head__body .selector.hover, .head__body .selector.focus, .head__body .selector.traverse { color: inherit !important; }
            .filter--parser.selector { cursor: pointer !important; }

            /* Torrent card background via pseudo element (preserve viewed icon) */
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
            .torrent-item__viewed { position: absolute !important; top: 8px !important; right: 8px !important; z-index: 2 !important; pointer-events: none !important; }

            .watched-history { position: relative !important; border-radius: 0.9em !important; }

            /* filter buttons hover */
            .torrent-filter .selector.hover, .torrent-filter .selector.focus, .torrent-filter .selector.traverse {
                background: linear-gradient(to right, #4dd9a0 1%, #4d8fa8 100%) !important;
                border-radius: 1em !important;
                color: #fff !important;
            }

            /* full-start buttons: base rounded, hover small rounded without animation */
            .full-start-new__buttons .full-start__button.selector { border-radius: 1em !important; transition: background 0.18s ease !important; }
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
                color: #fff !important; fill: #fff !important;
            }

            /* parser select button style */
            .simple-button--filter.filter--parser { cursor: pointer !important; }
        `;
        document.head.appendChild(style);
    }

    /* Hard reload button with fallbacks */
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
                try { window.location.replace(href); } catch (e) {
                    try { window.location.href = href; } catch (_) {}
                }
            }, 250);
        });

        headActions.appendChild(btn);
    }

    /* Show parser menu — items use colored span (green for available, red for unavailable) */
    async function showParserMenu(reason) {
        const statuses = await Promise.all(parsersInfo.map(async p => {
            const ok = await checkAvailability(p.settings.url);
            return { ...p, ok };
        }));

        const items = statuses.map(s => ({
            title: `<span style="color:${s.ok ? '#00ff00' : '#ff3333'}">${s.name}</span>`,
            base: s.base,
            selected: Lampa.Storage.get('lme_url_two') === s.base
        }));

        Lampa.Select.show({
            title: 'Каталог парсеров',
            subtitle: reason || '',
            items,
            onSelect: (a) => {
                Lampa.Storage.set('lme_url_two', a.base);
                applySelectedParser(a.base);
                const el = document.getElementById('parser-current');
                const picked = parsersInfo.find(p => p.base === a.base);
                if (el && picked) el.textContent = picked.name;
                try {
                    const active = Lampa.Activity.active();
                    if (active && active.activity && typeof active.activity.refresh === 'function') {
                        active.activity.refresh();
                    } else {
                        setTimeout(() => { try { window.location.reload(); } catch (_) { window.location.href = window.location.href; } }, 200);
                    }
                } catch (err) { /* noop */ }
            }
        });
    }

    function applySelectedParser(base) {
        const found = parsersInfo.find(p => p.base === base);
        if (!found) return;
        const s = found.settings;
        const type = s.parser_torrent_type === 'prowlarr' ? 'prowlarr' : 'jackett';
        Lampa.Storage.set(type + '_url', s.url);
        Lampa.Storage.set(type + '_key', s.key);
        Lampa.Storage.set('parser_torrent_type', s.parser_torrent_type);
    }

    /* checkAvailability helper */
    async function checkAvailability(url) {
        try {
            await fetch(`https://${url}`, { method: 'HEAD', mode: 'no-cors' });
            return true;
        } catch {
            return false;
        }
    }

    /* Mount parser button in filter bar */
    function mountParserButton(container) {
        if (!container || container.querySelector('#parser-selectbox')) return;
        const currentBase = Lampa.Storage.get('lme_url_two') || 'jacred_xyz';
        const currentInfo = parsersInfo.find(p => p.base === currentBase) || parsersInfo[0];

        const btn = document.createElement('div');
        btn.id = 'parser-selectbox';
        btn.className = 'simple-button simple-button--filter filter--parser selector';
        btn.innerHTML = `<span>Парсер</span><div id="parser-current">${currentInfo.name}</div>`;
        container.appendChild(btn);

        btn.addEventListener('hover:enter', async () => {
            await showParserMenu();
        });
    }

    /* Observe for UI error message and open parser menu automatically when matching text appears */
    function startErrorObserver() {
        const TARGET_TEXT = 'Ошибка подключения. Парсер не отвечает на запрос';
        const ALT_TEXT = 'Здесь пусто Ошибка подключения. Парсер не отвечает на запрос';

        const checkNode = (node) => {
            try {
                const text = (node.innerText || node.textContent || '').trim();
                if (!text) return;
                if (text.indexOf(TARGET_TEXT) !== -1 || text.indexOf(ALT_TEXT) !== -1) {
                    // avoid spamming: show menu once per detection by briefly marking node
                    if (!node.__parser_menu_shown) {
                        node.__parser_menu_shown = true;
                        showParserMenu('Не удалось подключиться к текущему парсеру. Выберите другой источник.');
                    }
                }
            } catch (e) {}
        };

        const obs = new MutationObserver(muts => {
            for (const m of muts) {
                if (m.addedNodes && m.addedNodes.length) {
                    m.addedNodes.forEach(n => {
                        if (n.nodeType === 1) checkNode(n);
                        if (n.querySelectorAll) n.querySelectorAll('*').forEach(el => checkNode(el));
                    });
                }
                if (m.target && m.target.nodeType === 1) checkNode(m.target);
            }
        });

        obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    }

    /* Parser observer to mount button when filter appears */
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

    /* Seed colorization */
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

    /* Init plugin */
    function initMenuPlugin() {
        applyStyles();
        addReloadButton();
        startParserObserver();
        startErrorObserver();
        startSeedsObserver();
        // apply currently selected parser to storage on start
        const selected = Lampa.Storage.get('lme_url_two');
        if (selected) applySelectedParser(selected);
    }

    function registerMenu() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '10.5',
                author: 'maxi3219',
                description: 'UI tweaks + жесткий перезапуск + авто-открытие выбора парсеров при ошибке подключения (цвет статуса сохранён)',
                init: initMenuPlugin
            });
        } else {
            initMenuPlugin();
        }
    }

    registerMenu();

})();
