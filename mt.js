(() => {
    const plugin_id_menu = 'roundedmenu';
    const plugin_name_menu = 'RoundedMenu';

    const PARSERS = ['Не выбран','Jacred.xyz','Jr.maxvol.pro','Jacred.my.to','Laampa.app','Jacred.pro'];

    function logMenu(...args) {
        try { console.log(`[${plugin_name_menu}]`, ...args); } catch(e){}
    }

    function applyCustomMenuStyles() {
        const style=document.createElement('style');
        style.id='roundedmenu-style-menuonly';
        style.innerHTML=`
            body{background: linear-gradient(135deg,#010a13 0%,#133442 50%,#01161d 100%) !important;color:#fff !important;}
            .torrent-filter .simple-button.parser-btn{
                margin-left:0.5em;
                padding:0.2em 0.5em;
                border-radius:0.8em;
                background:linear-gradient(to right,#4dd9a0,#4d8fa8);
                color:#fff;
                cursor:pointer;
                display:flex;
                align-items:center;
                transition:background 0.25s ease;
            }
            .torrent-filter .simple-button.parser-btn:hover{
                background:linear-gradient(to right,#4d8fa8,#4dd9a0);
            }
        `;
        document.head.appendChild(style);
        logMenu('Menu styles applied');
    }

    function addParserButton() {
        const filterBar = document.querySelector('.torrent-filter');
        if(!filterBar) return setTimeout(addParserButton, 500);
        if(filterBar.querySelector('.parser-btn')) return;

        const btn = document.createElement('div');
        btn.className = 'simple-button parser-btn selector';
        const current = Lampa.Storage.get('parser_selected', PARSERS[1]);
        btn.innerHTML = `<span>Парсер: ${current}</span>`;

        btn.addEventListener('click', () => {
            logMenu('Parser button clicked');
            const items = PARSERS.map(title => ({title, selected: title === Lampa.Storage.get('parser_selected', PARSERS[1])}));
            if(!window.Lampa || !Lampa.Select) {
                console.error('Lampa.Select не найден!');
                return;
            }

            Lampa.Select.open({
                title:'Выберите парсер',
                items,
                onSelect: sel => {
                    Lampa.Storage.set('parser_selected', sel.title);
                    btn.querySelector('span').textContent = `Парсер: ${sel.title}`;
                    Lampa.Noty.show(`Выбран парсер: ${sel.title}`);
                    debugUpdateTorrentList(sel.title);
                },
                onBack: Lampa.Controller.toggle
            });
        });

        filterBar.appendChild(btn);
    }

    function debugUpdateTorrentList(parserTitle) {
        try {
            const active = Lampa.Activity.active();
            if(!active) {
                console.warn('Активный экран не найден');
                return;
            }
            console.log('Active screen:', active);

            if(!active.activity || active.activity.component !== 'torrents') {
                console.warn('Это не экран торрентов. component =', active.activity?.component);
                return;
            }

            const source = active.activity.source;
            console.log('Source object:', source);
            console.log('Methods available:', Object.keys(source || {}));

            if(source && typeof source.search === 'function') {
                const query = active.activity.query || '';
                logMenu(`Попытка обновить торренты с парсером: ${parserTitle}`);
                source.search(query, res => {
                    console.log('Результат search():', res);
                    if(res) {
                        active.activity.results = res;
                        if(typeof Lampa.Torrent.render === 'function') Lampa.Torrent.render(res);
                    }
                });
            } else {
                console.warn('Метод search() не найден у source!');
            }
        } catch(e) {
            console.error('Ошибка при обновлении торрентов:', e);
        }
    }

    function initPlugin() {
        if(window.Lampa && Lampa.Listener){
            Lampa.Listener.follow('app', e => {
                if(e.type === 'ready') {
                    applyCustomMenuStyles();
                    addParserButton();
                }
            });
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                applyCustomMenuStyles();
                addParserButton();
            });
        }
    }

    if(window.app && app.plugins && typeof app.plugins.add === 'function') {
        app.plugins.add({
            id: plugin_id_menu,
            name: plugin_name_menu,
            version: 'debug-1.0',
            author: 'maxi3219',
            description: 'Отладка кнопки парсеров',
            init: initPlugin
        });
    } else {
        initPlugin();
    }
})();
