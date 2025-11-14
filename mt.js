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

    btn.addEventListener('hover:enter', () => {
        Lampa.Select.show({
            title: 'Выбор парсера',
            items: parsers.map(p => ({
                title: p,
                selected: Lampa.Storage.get('parser_select') === p
            })),
            onSelect: (a) => {
                Lampa.Storage.set('parser_select', a.title);
                document.getElementById('parser-current').textContent = a.title;
                try {
                    const active = Lampa.Activity.active();
                    if(active && active.activity && typeof active.activity.refresh === 'function'){
                        active.activity.refresh();
                    }
                } catch(err){ console.error(err); }
            }
        });
    });
}
