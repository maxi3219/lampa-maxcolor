(() => {
    const plugin_id_menu = 'roundedmenu';
    const plugin_name_menu = 'RoundedMenu';

    // === Логирование ===
    function logMenu(...args){try{console.log(`[${plugin_name_menu}]`,...args);}catch(e){}}

    // === Стили меню + зеленые раздающие ===
    function applyCustomMenuStyles(){
        const style = document.createElement('style');
        style.id='roundedmenu-style-menuonly';
        style.innerHTML=`
            @media screen and (min-width:480px){
                .settings__content,
                .selectbox__content.layer--height{
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
                body.selectbox--open .selectbox__content.layer--height{
                    transform: translateX(0) !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }
                .settings-folder.selector,
                .settings-param.selector,
                .settings-param__value.selector,
                .selectbox-item.selector{
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
                .selectbox-item.selector.traverse{
                    background: linear-gradient(to right,#4dd9a0 1%,#4d8fa8 100%) !important;
                    border-radius:1em !important;
                }
            }
            body{
                background: linear-gradient(135deg,#010a13 0%,#133442 50%,#01161d 100%) !important;
                color: #fff !important;
            }
            .torrent-item__seeds span{font-weight:bold;}
            .head__body svg,.head__body svg use{fill:#fff !important;color:#fff !important;transition:none !important;}
            .head__body .selector.hover svg,
            .head__body .selector.focus svg,
            .head__body .selector.traverse svg{fill:#fff !important;color:#fff !important;}
            .head__body .selector.hover,.head__body .selector.focus,.head__body .selector.traverse{color:inherit !important;}
            .m-reload-screen{cursor:pointer !important;}
            .m-reload-screen:hover svg{transform:rotate(180deg);transition:transform 0.4s ease;}
            .filter--parser.selector{cursor:pointer !important;}
        `;
        document.head.appendChild(style);
        logMenu('Menu styles applied');
    }

    // === Кнопка Reload ===
    function addReloadButton(){
        if(document.getElementById('MRELOAD')) return;
        const headActions=document.querySelector('.head__actions');
        if(!headActions){ setTimeout(addReloadButton,1000); return; }

        const btn=document.createElement('div');
        btn.id='MRELOAD';
        btn.className='head__action selector m-reload-screen';
        btn.innerHTML=`<svg fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#fff" stroke-width="0.48"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"/></svg>`;
        btn.addEventListener('click',()=>location.reload());
        headActions.appendChild(btn);
    }

    // === Кнопка Парсер ===
    function addParserButton(){
        const container=document.querySelector('.torrent-filter');
        if(!container){ setTimeout(addParserButton,500); return; }
        if(container.querySelector('#parser-selectbox')) return;

        const btn=document.createElement('div');
        btn.id='parser-selectbox';
        btn.className='simple-button simple-button--filter filter--parser selector';
        btn.innerHTML=`<span>Парсер</span><div id="parser-current">${Lampa.Storage.get('parser_select')||'Jacred.xyz'}</div>`;
        container.appendChild(btn);

        const parsers=['Jacred.xyz','Jr.maxvol.pro','Jacred.my.to','Lampa.app','Jacred.pro'];

        btn.addEventListener('click',(e)=>{
            e.stopPropagation();
            // открываем стандартное меню через Lampa
            const filterBtn=document.querySelector('.filter--filter');
            if(filterBtn && filterBtn.trigger_click){
                filterBtn.trigger_click(); // открывает стандартное меню
            }

            // Создаем кастомный список
            let menu=document.getElementById('parser-menu');
            if(menu) menu.remove();

            menu=document.createElement('div');
            menu.id='parser-menu';
            menu.className='selectbox__content layer--height';
            menu.style.position='absolute';
            const rect=btn.getBoundingClientRect();
            menu.style.top=rect.bottom+'px';
            menu.style.left=rect.left+'px';
            menu.style.width=rect.width+'px';
            menu.style.background='rgba(54,54,54,0.98)';
            menu.style.borderRadius='1em';
            menu.style.boxShadow='0 8px 24px rgba(0,0,0,0.8)';
            menu.style.maxHeight='300px';
            menu.style.overflowY='auto';
            document.body.appendChild(menu);

            parsers.forEach(p=>{
                const item=document.createElement('div');
                item.className='selectbox-item selector'+(Lampa.Storage.get('parser_select')===p?' selected':'');
                item.innerHTML=`<div class="selectbox-item__title">${p}</div>`;
                item.addEventListener('click',()=>{
                    Lampa.Storage.set('parser_select',p);
                    document.getElementById('parser-current').textContent=p;
                    try{
                        const active=Lampa.Activity.active();
                        if(active && active.activity && typeof active.activity.refresh==='function'){
                            active.activity.refresh();
                        }
                    }catch(err){console.error(err);}
                    menu.remove();
                });
                menu.appendChild(item);
            });

            // Закрытие при клике вне меню
            document.addEventListener('click', ev=>{
                if(!btn.contains(ev.target) && !menu.contains(ev.target)) menu.remove();
            },{once:true});
        });
    }

    // === Зеленые раздающие ===
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

    // === Инициализация ===
    function initMenuPlugin(){
        if(window.Lampa && typeof Lampa.Listener==='object'){
            Lampa.Listener.follow('app',event=>{
                if(event.type==='ready'){
                    applyCustomMenuStyles();
                    addReloadButton();
                    addParserButton();
                    startObserver();
                }
            });
        } else {
            document.addEventListener('DOMContentLoaded',()=>{
                applyCustomMenuStyles();
                addReloadButton();
                addParserButton();
                startObserver();
            });
        }
    }

    if(window.app && app.plugins && typeof app.plugins.add==='function'){
        app.plugins.add({id:plugin_id_menu,name:plugin_name_menu,version:'8.0',author:'maxi3219',description:'Меню + зеленые раздающие + reload + кнопка парсер',init:initMenuPlugin});
    } else { initMenuPlugin(); }

})();
