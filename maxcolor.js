(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    function log(...a) {
        try { console.log(`[${plugin_name}]`, ...a); } catch (e) {}
    }

    // --- Вставка кнопки выбора парсера ---
    function insertParserButton() {
        const filterBlock = document.querySelector('.torrent-filter');
        if (!filterBlock) return;

        // Проверяем, нет ли уже кнопки
        if (filterBlock.querySelector('.filter--parser')) return;

        // Создаем кнопку по аналогии с "Фильтр"
        const parserBtn = document.createElement('div');
        parserBtn.className = 'simple-button simple-button--filter selector filter--parser';
        parserBtn.innerHTML = `
            <span>Парсер</span>
            <div class="">Выбрать</div>
        `;

        // Вставляем после блока фильтра
        const filterEl = filterBlock.querySelector('.filter--filter');
        if (filterEl) {
            filterEl.insertAdjacentElement('afterend', parserBtn);
        } else {
            filterBlock.appendChild(parserBtn);
        }

        // Навешиваем обработчик
        parserBtn.addEventListener('hover:enter', () => {
            try {
                // стандартный вызов меню выбора парсера
                Lampa.Select.show({
                    title: 'Выбор парсера',
                    items: [
                        { title: 'Jacred RU', value: 'jacred_ru' },
                        { title: 'Jacred Pro', value: 'jacred_pro' },
                        { title: 'Jacred XYZ', value: 'jacred_xyz' },
                        { title: 'Jac Black', value: 'jac_black' },
                        { title: 'Viewbox', value: 'jacred_viewbox_dev' },
                        { title: 'ByLampa Jackett', value: 'bylampa_jackett' },
                        { title: 'Jac Lampa32 RU', value: 'jac_lampa32_ru' },
                        { title: 'Maxvol Pro', value: 'jr_maxvol_pro' },
                        { title: 'Нет парсера', value: 'no_parser' }
                    ],
                    onSelect: (choice) => {
                        Lampa.Storage.set('parser_use', choice.value);
                        log('Выбран парсер:', choice.value);
                        Lampa.Activity.toggle(); // перезапуск активности
                    }
                });
            } catch (e) {
                log('Ошибка открытия меню парсера', e);
            }
        });

        log('Кнопка выбора парсера добавлена');
    }

    // --- Основные стили и наблюдатель ---
    function applyStyles() {
        insertParserButton();
    }

    function startObserver() {
        applyStyles();
        const obs = new MutationObserver(applyStyles);
        obs.observe(document.body, { childList: true, subtree: true });
        log('Observer started (v1.2 с рабочей кнопкой парсера)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.2',
                author: 'maxi3219',
                description: 'Добавляет кнопку выбора парсера в список фильтров',
                init: startObserver
            });
            log('Registered with Lampa');
        } else {
            log('Standalone mode');
            startObserver();
        }
    }

    register();
})();
