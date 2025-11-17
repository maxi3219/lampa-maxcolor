(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    function log(...a) {
        try { console.log(`[${plugin_name}]`, ...a); } catch (e) {}
    }

    // Регистрируем параметр выбора парсера в SettingsApi
    function registerParserSetting() {
        if (!Lampa.SettingsApi) return;

        Lampa.SettingsApi.addParam({
            component: 'parser',
            param: {
                name: 'parser_use',
                type: 'select',
                values: {
                    no_parser: 'Нет парсера',
                    jac_lampa32_ru: 'Jac Lampa32 RU',
                    bylampa_jackett: 'ByLampa Jackett',
                    jacred_xyz: 'Jacred XYZ',
                    jr_maxvol_pro: 'Jacred Maxvol Pro',
                    jacred_ru: 'Jacred RU',
                    jacred_viewbox_dev: 'Viewbox',
                    jacred_pro: 'Jacred Pro',
                    jac_black: 'Jac Black'
                },
                default: 'no_parser'
            },
            field: {
                name: 'Парсер',
                description: 'Нажмите для выбора парсера из списка'
            },
            onChange: (val) => {
                log('Выбран парсер:', val);
                Lampa.Activity.toggle(); // перезапуск активности
            }
        });

        log('Параметр parser_use зарегистрирован');
    }

    // Вставляем кнопку в фильтры
    function insertParserButton() {
        const filterBlock = document.querySelector('.torrent-filter');
        if (!filterBlock) return;
        if (filterBlock.querySelector('.filter--parser')) return;

        const parserBtn = document.createElement('div');
        parserBtn.className = 'simple-button simple-button--filter selector filter--parser';
        parserBtn.innerHTML = `
            <span>Парсер</span>
            <div class="">Выбрать</div>
        `;

        const filterEl = filterBlock.querySelector('.filter--filter');
        if (filterEl) {
            filterEl.insertAdjacentElement('afterend', parserBtn);
        } else {
            filterBlock.appendChild(parserBtn);
        }

        parserBtn.addEventListener('hover:enter', () => {
            try {
                Lampa.SettingsApi.toggle('parser_use'); // открываем стандартное меню
            } catch (e) {
                log('Ошибка открытия меню парсера', e);
            }
        });

        log('Кнопка выбора парсера добавлена');
    }

    function applyStyles() {
        insertParserButton();
    }

    function startObserver() {
        registerParserSetting(); // сначала регистрируем параметр
        applyStyles();
        const obs = new MutationObserver(applyStyles);
        obs.observe(document.body, { childList: true, subtree: true });
        log('Observer started (v1.4 с parser_use)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.4',
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
