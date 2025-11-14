(() => {
    /* === Плагин RoundedMenu + Reload + Парсер === */
    const plugin_id_menu = 'roundedmenu';
    const plugin_name_menu = 'RoundedMenu';

    function logMenu(...args) { try { console.log(`[${plugin_name_menu}]`, ...args); } catch(e) {} }

    /* === Стили меню === */
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
            .m-reload-screen { cursor: pointer !important; }
            .m-reload-screen:hover svg { transform: rotate(180deg); transition: transform 0.4s ease; }
            .filter--parser.selector { cursor: pointer !important; }
        `;
        // avoid duplicate
        if (!document.getElementById(style.id)) document.head.appendChild(style);
        logMenu('Menu styles applied');
    }

    /* === Кнопка Reload === */
    function addReloadButton() {
        if(document.getElementById('MRELOAD')) return;
        const headActions = document.querySelector('.head__actions');
        if(!headActions){ setTimeout(addReloadButton,1000); return; }

        const btn = document.createElement('div');
        btn.id = 'MRELOAD';
        btn.className = 'head__action selector m-reload-screen';
        btn.innerHTML = `<svg fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#fff" stroke-width="0.48"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"/></svg>`;
        btn.addEventListener('click',()=>location.reload());
        headActions.appendChild(btn);
    }

    /* === Парсеры: логика исправлена === */

    const PARSERS = ['Не выбран','Jacred.xyz','Jr.maxvol.pro','Jacred.my.to','Lampa.app','Jacred.pro'];

    function createParserButtonIfMissing() {
        const container = document.querySelector('.torrent-filter');
        if(!container) return;

        // if exists, update label only
        const existing = container.querySelector('#parser-selectbox');
        const stored = Lampa.Storage.get('parser_select') || 'Jacred.xyz';

        if (existing) {
            const label = existing.querySelector('#parser-current');
            if (label) label.textContent = stored;
            return;
        }

        // create button (standard look)
        const btn = document.createElement('div');
        btn.id = 'parser-selectbox';
        btn.className = 'simple-button simple-button--filter filter--parser selector';
        btn.innerHTML = `<span>Парсер</span><div id="parser-current">${stored}</div>`;

        // Important: do not try to rely on local .addEventListener only — we use controller send
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            // send toggle via controller (this is the safe way on torrent screen)
            try {
                Lampa.Controller.listener.send('toggle', { action: 'open_parser_menu' });
            } catch(err) {
                // fallback: open directly
                openParserMenu();
                console.error(err);
            }
        });

        container.appendChild(btn);
    }

    // Ensure button is present and re-created after re-renders
    let filterObserver = null;
    function observeFilterBar() {
        // observe body for changes to re-inject button if .torrent-filter re-renders
        if (filterObserver) return;

        filterObserver = new MutationObserver(() => {
            // small delay to allow DOM settle
            setTimeout(() => createParserButtonIfMissing(), 80);
        });

        filterObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Build parser menu in body (outside re-render zone)
    function openParserMenu() {
        // if already open - remove
        const existingMenu = document.getElementById('parser-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const menu = document.createElement('div');
        menu.id = 'parser-menu';
        menu.className = 'selectbox__content layer--height';
        // style to look like standard selectbox but keep it separate
        menu.style.position = 'fixed';
        menu.style.right = '1em';
        menu.style.top = '6.2em';
        menu.style.width = '28em';
        menu.style.maxHeight = '60vh';
        menu.style.overflowY = 'auto';
        menu.style.background = 'rgba(54,54,54,0.98)';
        menu.style.borderRadius = '1.2em';
        menu.style.boxShadow = '0 8px 24px rgba(0,0,0,0.8)';
        menu.style.padding = '0.3em';
        menu.style.zIndex = 9999;

        // head
        const head = document.createElement('div');
        head.className = 'selectbox__head';
        head.innerHTML = `<div class="selectbox__title">Выбрать парсер</div>`;
        menu.appendChild(head);

        // body structure like Lampa
        const bodyWrap = document.createElement('div');
        bodyWrap.className = 'selectbox__body scroll scroll--mask scroll--over';
        bodyWrap.innerHTML = `<div class="scroll__content layer--wheight"><div class="scroll__body"></div></div>`;
        menu.appendChild(bodyWrap);

        const scrollBody = menu.querySelector('.scroll__body');

        const current = Lampa.Storage.get('parser_select') || 'Jacred.xyz';

        PARSERS.forEach(p => {
            const item = document.createElement('div');
            item.className = 'selectbox-item selector' + (current === p ? ' selected' : '');
            item.innerHTML = `<div class="selectbox-item__title">${p}</div>`;
            item.addEventListener('click', (e) => {
                e.stopPropagation();

                // save
                Lampa.Storage.set('parser_select', p);
                // update button label if exists
                const btnLabel = document.querySelector('#parser-selectbox #parser-current');
                if (btnLabel) btnLabel.textContent = p;

                // update current variable if needed (not global)
                // trigger refresh via Lampa Activity
                try {
                    const active = Lampa.Activity.active();
                    if (active && active.activity) {
                        // prefer refresh() if exists
                        if (typeof active.activity.refresh === 'function') {
                            active.activity.refresh();
                        } else if (active.component && typeof active.component.search === 'function') {
                            active.component.search();
                        } else {
                            // fallback: reload page
                            location.reload();
                        }
                    } else {
                        location.reload();
                    }
                } catch(err) {
                    console.error(err);
                    location.reload();
                }

                // close menu
                menu.remove();
            });
            scrollBody.appendChild(item);
        });

        // close on outside click
        setTimeout(() => {
            document.addEventListener('click', function onDocClick(ev) {
                if (!menu.contains(ev.target)) {
                    menu.remove();
                    document.removeEventListener('click', onDocClick);
                }
            });
        }, 10);

        document.body.appendChild(menu);
    }

    // Listen controller toggle events to open menu (safe method)
    try {
        Lampa.Controller.listener.follow('toggle', (event) => {
            if (!event) return;
            // allow object or simple string
            if (event.action === 'open_parser_menu' || event === 'open_parser_menu') {
                openParserMenu();
            }
        });
    } catch (e) {
        // if listener not available for some reason, ignore — we have fallback on click
        console.warn('Parser controller listener not attached:', e);
    }

    /* === Инициализация плагина === */
    function initMenuPlugin() {
        applyCustomMenuStyles();
        addReloadButton();

        // try create button now
        createParserButtonIfMissing();

        // observe DOM to re-create button if .torrent-filter re-renders
        observeFilterBar();

        // also attempt to re-create when Lampa signals full/load
        if (window.Lampa && typeof Lampa.Listener === 'object') {
            Lampa.Listener.follow('app', function(event){
                if(event.type === 'ready'){
                    createParserButtonIfMissing();
                }
            });
            Lampa.Listener.follow('full', function(){ createParserButtonIfMissing(); });
        } else {
            document.addEventListener('DOMContentLoaded', createParserButtonIfMissing);
        }
    }

    function registerMenu() {
        if(window.app && app.plugins && typeof app.plugins.add === 'function'){
            app.plugins.add({id: plugin_id_menu, name: plugin_name_menu, version: '7.4-patch', author: 'maxi3219', description: 'Меню + зеленые раздающие + reload + кнопка парсер (fixed)', init: initMenuPlugin});
        } else { initMenuPlugin(); }
    }

    registerMenu();

    /* === Плагин MaxColor === */
    const COLORS={low:'#ff3333',mid:'#ffcc00',high:'#00ff00'};
    function recolorSeedNumbers(){
        const seedBlocks=document.querySelectorAll('.torrent-item__seeds');
        seedBlocks.forEach(block=>{
            const span=block.querySelector('span');
            if(!span) return;
            const num=parseInt(span.textContent);
            if(isNaN(num)) return;
            let color=COLORS.low;
            if(num>10) color=COLORS.high;
            else if(num>=5) color=COLORS.mid;
            span.style.color=color;
            span.style.fontWeight='bold';
        });
    }
    function startObserver(){
        const obs=new MutationObserver(()=>recolorSeedNumbers());
        obs.observe(document.body,{childList:true,subtree:true});
        recolorSeedNumbers();
    }
    if(window.app && app.plugins && typeof app.plugins.add==='function'){
        app.plugins.add({id:'maxcolor',name:'MaxColor',version:'2.0',author:'maxi3219',description:'Цвет раздающих',init:startObserver});
    } else { startObserver(); }
})();
