(function () {

    // список парсеров
    const PARSERS = [
        "Не выбран",
        "Jacred.xyz",
        "Jr.maxvol.pro",
        "Jacred.my.to",
        "Lampa.app",
        "Jacred.pro"
    ];

    // запоминаем выбранный парсер
    let currentParser = Lampa.Storage.get('custom_parser') || "Не выбран";

    // функция вставки кнопки
    function injectParserButton() {
        const filterBar = document.querySelector('.torrent-filter');
        if (!filterBar) return;

        // не добавлять вторую кнопку
        if (filterBar.querySelector('.filter--parser')) return;

        const btn = document.createElement('div');
        btn.className = "simple-button simple-button--filter selector filter--parser";
        btn.innerHTML = `<span>Парсер</span><div class="">${currentParser}</div>`;

        filterBar.appendChild(btn);

        // кнопка полностью работает через Controller.toggle
        btn.addEventListener('click', () => {
            Lampa.Controller.listener.send('toggle', {
                action: 'open_parser_menu'
            });
        });
    }

    // создаём стандартное окно выбора как в Lampa
    function openParserMenu() {
        const selectbox = new Lampa.Select({
            title: "Выбрать парсер",
            items: PARSERS.map(name => ({
                title: name,
                selected: name === currentParser
            }))
        });

        selectbox.onSelect = (item) => {
            currentParser = item.title;

            // сохраняем
            Lampa.Storage.set('custom_parser', currentParser);

            // обновляем надпись на кнопке
            const btn = document.querySelector('.filter--parser div');
            if (btn) btn.textContent = currentParser;

            // перезагрузка торрентов (активити НЕ сбивается)
            const active = Lampa.Activity.active();
            if (active && active.component && active.component.search) {
                active.component.search();
            }

            selectbox.close();
        };

        selectbox.open();
    }

    // слушаем toggle-события
    Lampa.Controller.listener.follow('toggle', (event) => {
        if (!event) return;

        if (event.action === 'open_parser_menu') {
            openParserMenu();
        }
    });

    // ждём загрузку страницы
    Lampa.Listener.follow('full', injectParserButton);
})();
