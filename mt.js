(() => {
    const plugin_id_menu = 'roundedmenu';
    const plugin_name_menu = 'RoundedMenu';

    function logMenu(...args){ try { console.log(`[${plugin_name_menu}]`, ...args); } catch(e){} }

    function applyStyles(){
        if(document.getElementById('roundedmenu-style-menuonly')) return;
        const style=document.createElement('style');
        style.id='roundedmenu-style-menuonly';
        style.innerHTML=`
            .filter--parser.selector { cursor:pointer; }
            .selectbox-item.selector.selected { background: linear-gradient(to right,#4dd9a0 1%,#4d8fa8 100%) !important; border-radius:1em; }
            .selectbox__content.layer--height { border-radius:1em; background: rgba(54,54,54,0.98); box-shadow: 0 8px 24px rgba(0,0,0,0.8); z-index:9999; }
        `;
        document.head.appendChild(style);
    }

    const PARSERS=['Jacred.xyz','Jr.maxvol.pro','Jacred.my.to','Lampa.app','Jacred.pro'];

    function createParserButton(container){
        if(container.querySelector('#parser-selectbox')) return;

        const btn=document.createElement('div');
        btn.id='parser-selectbox';
        btn.className='simple-button simple-button--filter filter--parser selector';
        btn.innerHTML=`<span>Парсер</span><div id="parser-current">${Lampa.Storage.get('parser_select')||'Jacred.xyz'}</div>`;
        container.appendChild(btn);

        btn.addEventListener('click', (e)=>{
            e.stopPropagation();
            // удаляем старое меню
            const oldMenu=document.getElementById('parser-menu');
            if(oldMenu) oldMenu.remove();

            const menu=document.createElement('div');
            menu.id='parser-menu';
            menu.className='selectbox__content layer--height';
            const rect=btn.getBoundingClientRect();
            menu.style.position='absolute';
            menu.style.top=(rect.bottom+2)+'px';
            menu.style.left=rect.left+'px';
            menu.style.width=rect.width+'px';
            menu.style.maxHeight='300px';
            menu.style.overflowY='auto';
            document.body.appendChild(menu);

            PARSERS.forEach(p=>{
                const item=document.createElement('div');
                item.className='selectbox-item selector'+(Lampa.Storage.get('parser_select')===p?' selected':'');
                item.innerHTML=`<div class="selectbox-item__title">${p}</div>`;
                item.addEventListener('click', ev=>{
                    ev.stopPropagation();
                    Lampa.Storage.set('parser_select',p);
                    document.getElementById('parser-current').textContent=p;

                    // Обновляем список торрентов: для фильтров корректно вызвать replace
                    try{
                        const active=Lampa.Activity.active();
                        if(active && active.activity && active.activity.component){
                            Lampa.Activity.replace({
                                url: active.activity.url,
                                title: active.activity.title,
                                component: active.activity.component
                            });
                        }
                    }catch(e){ console.error(e); }

                    menu.remove();
                });
                menu.appendChild(item);
            });

            // закрытие при клике вне
            setTimeout(()=>{
                document.addEventListener('click', function closeMenu(ev){
                    if(!menu.contains(ev.target)&&!btn.contains(ev.target)){
                        menu.remove();
                        document.removeEventListener('click',closeMenu);
                    }
                });
            },10);
        });
    }

    function initPlugin(){
        applyStyles();

        // Reload кнопка
        if(!document.getElementById('MRELOAD')){
            const headActions=document.querySelector('.head__actions');
            if(headActions){
                const btn=document.createElement('div');
                btn.id='MRELOAD';
                btn.className='head__action selector m-reload-screen';
                btn.innerHTML='<svg fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#fff" stroke-width="0.48"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"/></svg>';
                btn.addEventListener('click',()=>location.reload());
                headActions.appendChild(btn);
            }
        }

        // MutationObserver на фильтры торрентов
        const obs=new MutationObserver(()=>{
            document.querySelectorAll('.torrent-filter').forEach(container=>{
                createParserButton(container);
            });
        });
        obs.observe(document.body,{childList:true,subtree:true});
    }

    function registerPlugin(){
        if(window.app && app.plugins && typeof app.plugins.add==='function'){
            app.plugins.add({id:plugin_id_menu,name:plugin_name_menu,version:'7.6',author:'maxi3219',description:'Меню + reload + парсер',init:initPlugin});
        } else initPlugin();
    }

    registerPlugin();

    // MaxColor
    const COLORS={low:'#ff3333',mid:'#ffcc00',high:'#00ff00'};
    function recolorSeedNumbers(){
        document.querySelectorAll('.torrent-item__seeds').forEach(block=>{
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
    } else startObserver();

})();
