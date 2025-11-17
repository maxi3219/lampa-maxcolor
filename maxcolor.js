(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    function log(...a) {
        try { console.log(`[${plugin_name}]`, ...a); } catch (e) {}
    }

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

        // Важно: используем SettingsApi.toggle('parser_use')
        parserBtn.addEventListener('hover:enter', () => {
            try {
                Lampa.SettingsApi.toggle('parser_use');
                log('Открыто меню выбора парсера');
            } catch (e) {
                log('Ошибка открытия меню парсера', e);
            }
        });
    }

    function applyStyles() {
        insertParserButton();
    }

    function startObserver() {
        applyStyles();
        const obs = new MutationObserver(applyStyles);
        obs.observe(document.body, { childList: true, subtree: true });
        log('Observer started (v1.3 с parser_use)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.3',
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
