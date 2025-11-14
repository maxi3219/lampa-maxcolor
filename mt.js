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
        document.head.appendChild(style);
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
        btn.addEventListener('click',()=>{
            const active = Lampa.Activity.active();
            if(active && active.activity && active.activity.url){
                Lampa.Noty.show('Экран перезагружается...');
                Lampa.Activity.replace({
                    url: active.activity.url,
                    title: active.activity.title,
                    component: active.activity.component
                });
            } else location.reload();
        });
        headActions.appendChild(btn);
    }

    /* === Кнопка Парсер в torrent-filter === */
    function addParserButton() {
        const container = document.querySelector('.torrent-filter');
        if(!container){ setTimeout(addParserButton,500); return; }
        if(container.querySelector('#parser-selectbox')) return;

        const btn = document.createElement('div');
        btn.id = 'parser-selectbox';
        btn.className = 'simple-button simple-button--filter filter--parser selector';
        btn.innerHTML = `<span>Парсер</span><div id="parser-current">${Lampa.Storage.get('parser_select')||'Jacred.xyz'}</div>`;
        container.appendChild(btn);

        const parsers = ['Jacred.xyz','Jr.maxvol.pro','Jacred.my.to','Lampa.app','Jacred.pro'];

        btn.addEventListener('click', () => {
            Lampa.selectbox.open({
                title: 'Выберите парсер',
                items: parsers.map(p => ({title: p, selected: Lampa.Storage.get('parser_select')===p})),
                onSelect: (item) => {
                    Lampa.Storage.set('parser_select', item.title);
                    document.getElementById('parser-current').textContent = item.title;
                    // Обновляем список торрентов
                    const active = Lampa.Activity.active();
                    if(active && active.activity && typeof active.activity.refresh === 'function'){
                        active.activity.refresh();
                    }
                }
            });
        });
    }

    function initMenuPlugin() {
        if(window.Lampa && typeof Lampa.Listener==='object'){
            Lampa.Listener.follow('app', event=>{
                if(event.type==='ready'){
                    applyCustomMenuStyles();
                    addReloadButton();
                    addParserButton();
                }
            });
        } else {
            document.addEventListener('DOMContentLoaded', ()=>{
                applyCustomMenuStyles();
                addReloadButton();
                addParserButton();
            });
        }
    }

    function registerMenu() {
        if(window.app && app.plugins && typeof app.plugins.add==='function'){
            app.plugins.add({id:plugin_id_menu,name:plugin_name_menu,version:'7.5',author:'maxi3219',description:'Меню + зеленые раздающие + reload + кнопка парсер',init:initMenuPlugin});
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
