(() => {
    'use strict';

    const plugin_id = 'roundedmenu';
    const plugin_name = 'RoundedMenu';

    const SEED_COLORS = { low:'#ff3333', mid:'#ffcc00', high:'#00ff00' };

    const parsersInfo = [
        { base:'jacred_xyz',         name:'Jacred.xyz',        settings:{ url:'jacred.xyz',           key:'',        parser_torrent_type:'jackett' } },
        { base:'jr_maxvol_pro',      name:'Jr.maxvol.pro',     settings:{ url:'jr.maxvol.pro',        key:'',        parser_torrent_type:'jackett' } },
        { base:'jacred_my_to',       name:'Jacred.my.to',      settings:{ url:'jacred.my.to',         key:'',        parser_torrent_type:'jackett' } },
        { base:'lampa_app',          name:'Lampa.app',         settings:{ url:'lampa.app',            key:'',        parser_torrent_type:'jackett' } },
        { base:'jacred_pro',         name:'Jacred.pro',        settings:{ url:'jacred.pro',           key:'',        parser_torrent_type:'jackett' } },
        { base:'jacred_viewbox_dev', name:'Viewbox',           settings:{ url:'jacred.viewbox.dev',   key:'viewbox', parser_torrent_type:'jackett' } }
    ];

    /* ===================== STYLES ===================== */
    function applyStyles() {
        const style = document.createElement('style');
        style.id = 'roundedmenu-style';
        style.innerHTML = `
            body { background: linear-gradient(135deg,#010a13 0%,#133442 50%,#01161d 100%) !important; color:#fff !important; }
            .head__body svg, .head__body svg use { fill:#fff !important; color:#fff !important; }
            .filter--parser.selector { cursor:pointer !important; }

            .torrent-item {
                position:relative !important;
                border-radius:0.9em !important;
                background:transparent !important;
                overflow:visible !important;
            }
            .torrent-item::before {
                content:'' !important;
                position:absolute !important;
                inset:0 !important;
                background-color:rgba(0,0,0,0.3) !important;
                border-radius:inherit !important;
                z-index:0 !important;
                pointer-events:none !important;
            }
            .torrent-item > * { position:relative !important; z-index:1 !important; }
            .torrent-item__viewed { position:absolute !important; top:8px !important; right:8px !important; z-index:2 !important; }

            .full-start-new__buttons .full-start__button.selector { border-radius:1em !important; transition:background 0.18s ease !important; }
            .full-start-new__buttons .full-start__button.selector.hover,
            .full-start-new__buttons .full-start__button.selector.focus,
            .full-start-new__buttons .full-start__button.selector.traverse {
                background:linear-gradient(to right,#4dd9a0 12%,#2f6ea8 100%) !important;
                border-radius:0.5em !important;
                color:#fff !important;
            }
            .full-start-new__buttons .full-start__button.selector.hover svg,
            .full-start-new__buttons .full-start__button.selector.focus svg,
            .full-start-new__buttons .full-start__button.selector.traverse svg {
                color:#fff !important; fill:#fff !important;
            }
        `;
        document.head.appendChild(style);
    }

    /* ===================== HARD RELOAD ===================== */
    function addReloadButton() {
        if (document.getElementById('MRELOAD')) return;
        const headActions = document.querySelector('.head__actions');
        if (!headActions) { setTimeout(addReloadButton,1000); return; }

        const btn = document.createElement('div');
        btn.id = 'MRELOAD';
        btn.className = 'head__action selector m-reload-screen';
        btn.innerHTML = `<svg fill="#fff" viewBox="0 0 24 24"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z"/></svg>`;
        btn.addEventListener('hover:enter', () => {
            const href = window.location.href;
            try { window.location.reload(); } catch(e){}
            setTimeout(() => {
                try { window.location.replace(href); } catch(e){
                    try { window.location.href = href; } catch(_){}
                }
            },250);
        });
        headActions.appendChild(btn);
    }

    /* ===================== PARSER MENU ===================== */
    async function checkAvailability(url) {
        try { await fetch(`https://${url}`,{method:'HEAD',mode:'no-cors'}); return true; }
        catch { return false; }
    }

    async function showParserMenu(reason) {
        const statuses = await Promise.all(parsersInfo.map(async p => {
            const ok = await checkAvailability(p.settings.url);
            return { ...p, ok };
        }));
        const items = statuses.map(s => ({
            title:`<span style="color:${s.ok ? '#00ff00':'#ff3333'}">${s.name}</span>`,
            base:s.base,
            selected:Lampa.Storage.get('lme_url_two')===s.base
        }));
        Lampa.Select.show({
            title:'Каталог парсеров',
            subtitle:reason||'',
            items,
            onSelect:(a)=>{
                Lampa.Storage.set('lme_url_two',a.base);
                applySelectedParser(a.base);
                const el=document.getElementById('parser-current');
                const picked=parsersInfo.find(p=>p.base===a.base);
                if(el&&picked) el.textContent=picked.name;
                try {
                    const active=Lampa.Activity.active();
                    if(active&&active.activity&&typeof active.activity.refresh==='function'){
                        active.activity.refresh();
                    } else {
                        setTimeout(()=>{ try{window.location.reload();}catch(_){window.location.href=window.location.href;} },200);
                    }
                } catch(err){}
            }
        });
    }

    function applySelectedParser(base){
        const found=parsersInfo.find(p=>p.base===base);
        if(!found) return;
        const s=found.settings;
        const type=s.parser_torrent_type==='prowlarr'?'prowlarr':'jackett';
        Lampa.Storage.set(type+'_url',s.url);
        Lampa.Storage.set(type+'_key',s.key);
        Lampa.Storage.set('parser_torrent_type',s.parser_torrent_type);
    }

    function mountParserButton(container){
        if(!container||container.querySelector('#parser-selectbox')) return;
        const currentBase=Lampa.Storage.get('lme_url_two')||'jacred_xyz';
        const currentInfo=parsersInfo.find(p=>p.base===currentBase)||parsersInfo[0];
        const btn=document.createElement('div');
        btn.id='parser-selectbox';
        btn.className='simple-button simple-button--filter filter--parser selector';
        btn.innerHTML=`<span>Парсер</span><div id="parser-current">${currentInfo.name}</div>`;
        container.appendChild(btn);
        btn.addEventListener('hover:enter',async()=>{ await showParserMenu(); });
    }

    function startParserObserver(){
        const obs=new MutationObserver(()=>{
            const container=document.querySelector('.torrent-filter');
            if(container&&!container.querySelector('#parser-selectbox')) mountParserButton(container);
        });
        obs.observe(document.body,{childList:true,subtree:true});
        const first=document.querySelector('.torrent-filter');
        if(first) mountParserButton(first);
    }

    /* ===================== ERROR DETECTION ===================== */
    function startErrorObserver(){
        const TARGET_TEXT='Здесь пусто Ошибка подключения. Парсер не отвечает на запрос';
        const triggerMenu=()=>{ showParserMenu('Не удалось подключиться к текущему парсеру. Выберите другой источник.'); };
        const checkNodeText=(node)=>{
            try{ const t=(node.innerText||node.textContent||'').trim(); return t.includes(TARGET_TEXT); }
            catch{ return false; }
        };
        const obs=new MutationObserver(muts=>{
            for(const m of muts){
                m.addedNodes.forEach(n=>{
                    if(n.nodeType===1){
                        if(checkNodeText(n
