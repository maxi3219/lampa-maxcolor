(() => {
    const plugin_id_menu = 'roundedmenu';
    const plugin_name_menu = 'RoundedMenu';

    function logMenu(...args){ try { console.log(`[${plugin_name_menu}]`, ...args);} catch(e){} }

    function applyCustomMenuStyles(){
        const style = document.createElement('style');
        style.innerHTML = `
            .filter--parser.selector{ cursor:pointer; }
        `;
        document.head.appendChild(style);
    }

    function addParserButton(){
        const container = document.querySelector('.torrent-filter');
        if(!container){ setTimeout(addParserButton,500); return; }
        if(container.querySelector('#parser-selectbox')) return;

        const btn = document.createElement('div');
        btn.id = 'parser-selectbox';
        btn.className='simple-button simple-button--filter filter--parser selector';
        btn.innerHTML=`<span>Парсер</span><div id="parser-current">${Lampa.Storage.get('parser_select')||'Jacred.xyz'}</div>`;
        container.appendChild(btn);

        const parsers = ['Jacred.xyz','Jr.maxvol.pro','Jacred.my.to','Lampa.app','Jacred.pro'];

        // Кнопка вызывает стандартный Select
        btn.addEventListener('click',()=>{
            Lampa.Select.show({
                title:'Выберите парсер',
                items: parsers.map(p=>({title:p,value:p})),
                onSelect:item=>{
                    Lampa.Storage.set('parser_select',item.value);
                    document.getElementById('parser-current').textContent=item.value;

                    // обновляем список торрентов, но кнопка остаётся
                    try{
                        const active=Lampa.Activity.active();
                        if(active && active.activity && typeof active.activity.refresh==='function'){
                            active.activity.refresh();
                        }
                    }catch(e){console.error(e);}
                }
            });
        });
    }

    function initMenuPlugin(){
        if(window.Lampa && typeof Lampa.Listener==='object'){
            Lampa.Listener.follow('app',event=>{
                if(event.type==='ready'){
                    applyCustomMenuStyles();
                    addParserButton();
                }
            });
        } else {
            document.addEventListener('DOMContentLoaded',()=>{
                applyCustomMenuStyles();
                addParserButton();
            });
        }
    }

    function registerMenu(){
        if(window.app && app.plugins && typeof app.plugins.add==='function'){
            app.plugins.add({id:plugin_id_menu,name:plugin_name_menu,version:'7.7',author:'maxi3219',description:'Кнопка парсер',init:initMenuPlugin});
        } else initMenuPlugin();
    }

    registerMenu();
})();
