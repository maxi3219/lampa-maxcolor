(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';
    const COLORS = {
        low: '#ff3333',
        mid: '#ffcc00',
        high: '#00ff00'
    };
    const BLOCK_RADIUS = '0.9em';
    const GRADIENT_APP_BG = 'linear-gradient(117deg, rgb(0 0 0) 0%, rgb(11 26 35) 50%, rgb(14, 14, 14) 100%)';

    function log(...a) {
        try { console.log(`[${plugin_name}]`, ...a); } catch (e) {}
    }

    // Список парсеров (точно как в твоём «стандартном» скрипте + «Без парсера»)
    const parserList = [
        {title: 'Без парсера',        key: 'no_parser',          url: '',                     apikey: '', statusType: 'false', protocol: 'http', lang: 'lg'},
        {title: 'Jacred RU',          key: 'jac_lampa32_ru',     url: '62.60.149.237:2601',    apikey: '', statusType: 'false', protocol: 'http', lang: 'lg'},
        {title: 'ByLampa Jackett',    key: 'bylampa_jackett',    url: '62.60.149.237:9117',    apikey: '777', statusType: 'false', protocol: 'http', lang: 'df'},
        {title: 'Jacred.xyz',         key: 'jacred_xyz',         url: 'jacred.xyz',           apikey: '', statusType: 'healthy', protocol: 'https', lang: 'lg'},
        {title: 'Jacred Maxvol Pro',  key: 'jr_maxvol_pro',      url: 'jr.maxvol.pro',        apikey: '', statusType: 'healthy', protocol: 'https', lang: 'lg'},
        {title: 'Jacred RU',          key: 'jacred_ru',         url: 'jac-red.ru',           apikey: '', statusType: 'false', protocol: 'http', lang: 'lg'},
        {title: 'Jacred Viewbox Dev', key: 'jacred_viewbox_dev', url: 'jacred.viewbox.dev',   apikey: '7530327ymMkST', statusType: 'false', protocol: 'https', lang: 'lg'},
        {title: 'Jacred Pro',         key: 'jacred_pro',         url: 'jacred.pro',           apikey: '', statusType: 'healthy', protocol: 'https', lang: 'lg'},
        {title: 'Jac Black',          key: 'jac_black',          url: 'jacblack.ru:9117',     apikey: '', statusType: 'false', protocol: 'http', lang: 'lg'},
    ];

    function getCurrentParserTitle() {
        const key = Lampa.Storage.get('parser_torrent_type', 'no_parser');
        const item = parserList.find(p => p.key === key);
        return item ? item.title : 'Стандартный';
    }

    function checkParserStatus(p) {
        return new Promise(resolve => {
            if (p.key === 'no_parser') return resolve(p.title);

            const url = p.protocol + '://' + p.url + '/api/v2.0/indexers/' + p.statusType + '/results?apikey=' + (p.apikey || '');

            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.timeout = 5000;

            xhr.onload = () => {
                if (xhr.status === 200) resolve('<span style="color:#64e364;">✔  ' + p.title + '</span>');
                else resolve('<span style="color:#ff2121;">✘  ' + p.title + '</span>');
            };
            xhr.onerror = xhr.ontimeout = () => resolve('<span style="color:#ff2121;">✘  ' + p.title + '</span>');
            xhr.send();
        });
    }

    function showParserMenu() {
        Promise.all(parserList.map(p => checkParserStatus(p))).then(titles => {
            const items = titles.map((title, i) => ({
                title: title,
                parser: parserList[i]
            }));

            Lampa.Select.show({
                title: 'Меню смены парсера',
                items: items,
                onSelect: (item) => {
                    const p = item.parser;
                    Lampa.Storage.set('jackett_url', p.url);
                    Lampa.Storage.set('parser_torrent_type', p.key);
                    Lampa.Storage.set('jackett_key', p.apikey);
                    Lampa.Storage.set('jackett_interview', p.statusType === 'healthy' ? 'healthy' : 'false');
                    Lampa.Storage.set('parse_lang', p.lang);
                    Lampa.Storage.set('parser_use', true);

                    // Обновляем текст кнопки + перезагружаем торренты
                    applyStyles();
                    Lampa.Activity.reload();
                },
                onBack: () => Lampa.Controller.toggle('content')
            });
        });
    }

    // Добавляем кнопку «Парсер» в панель торрентов
    function addParserButton() {
        const container = document.querySelector('.torrent-filter');
        if (!container || container.querySelector('.filter--parser')) return;

        const button = document.createElement('div');
        button.className = 'simple-button simple-button--filter selector filter--parser';
        button.innerHTML = `<span>Парсер</span><div class="">${getCurrentParserTitle()}</div>`;

        // Вставляем сразу после кнопки «Фильтр»
        const filterBtn = container.querySelector('.filter--filter');
        if (filterBtn) filterBtn.after(button);

        // Наведение/фокус/клик — открываем меню
        button.addEventListener('click', showParserMenu);
    }

    // Окраска сидов
    function recolorSeedNumbers() {
        document.querySelectorAll('.torrent-item__seeds').forEach(block => {
            const span = block.querySelector('span');
            if (!span) return;
            const num = parseInt(span.textContent);
            if (isNaN(num)) return;
            let color = COLORS.low;
            if (num > 10) color = COLORS.high;
            else if (num >= 5) color = COLORS.mid;
            span.style.color = color;
            span.style.fontWeight = 'bold';
        });
    }

    // Скругления блоков
    function roundCorners() {
        document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render')
            .forEach(item => item.style.borderRadius = BLOCK_RADIUS);
        document.querySelectorAll('.watched-history.selector')
            .forEach(item => item.style.borderRadius = BLOCK_RADIUS);
    }

    // Фон и прозрачность
    function changeBackground() {
        const backgroundBlock = document.querySelector('.background');
        if (backgroundBlock) {
            backgroundBlock.style.background = GRADIENT_APP_BG;
            backgroundBlock.style.setProperty('background', GRADIENT_APP_BG, 'important');
        }

        document.querySelectorAll('.settings__content, .selectbox__content.layer--height').forEach(panel => {
            panel.style.background = 'rgba(33,33,33,0.98)';
            panel.style.setProperty('background', 'rgba(33,33,33,0.98)', 'important');
            if (panel.classList.contains('settings__content')) {
                panel.style.left = '99%';
                panel.style.maxHeight = 'calc(100vh - 1.8em)';
                panel.style.setProperty('left', '99%', 'important');
                panel.style.setProperty('max-height', 'calc(100vh - 1.8em)', 'important');
            } else if (panel.classList.contains('selectbox__content')) {
                panel.style.left = '99%';
                panel.style.maxHeight = 'calc(100vh - 1.8em)';
                panel.style.setProperty('left', '99%', 'important');
                panel.style.setProperty('max-height', 'calc(100vh - 1.8em)', 'important');
            }
        });
    }

    // Стили взаимодействия (добавил тень для новой кнопки)
    function injectInteractionStyles() {
        const styleId = 'maxcolor-interaction-styles';
        const staticStyleId = 'maxcolor-static-styles';

        document.getElementById(styleId)?.remove();
        document.getElementById(staticStyleId)?.remove();

        const SHADOW_COLOR = '0 4px 15px rgb(57 148 188 / 30%)';
        const GRADIENT_HOVER_BG = 'linear-gradient(to right, #9cc1bc, #536976)';

        const interactionCss = `
            .full-start__button.selector:hover,
            .full-start__button.selector.focus {
                border-radius: 0.5em !important;
                box-shadow: ${SHADOW_COLOR} !important;
                background: ${GRADIENT_HOVER_BG} !important;
            }
            .selectbox-item.selector:hover,
            .selectbox-item.selector.focus,
            .settings-folder.selector:hover,
            .settings-folder.selector.focus,
            .filter--parser.selector:hover,
            .filter--parser.selector.focus {
                box-shadow: ${SHADOW_COLOR} !important;
            }
        `;

        const staticCss = `
            .torrent-item.selector {
                background-color: rgb(68 68 69 / 13%) !important;
            }
        `;

        const interactionStyle = document.createElement('style');
        interactionStyle.id = styleId;
        interactionStyle.innerHTML = interactionCss;
        document.head.appendChild(interactionStyle);

        const staticStyle = document.createElement('style');
        staticStyle.id = staticStyleId;
        staticStyle.innerHTML = staticCss;
        document.head.appendChild(staticStyle);
    }

    function applyStyles() {
        recolorSeedNumbers();
        roundCorners();
        changeBackground();
        injectInteractionStyles();
        addParserButton(); // <— новая кнопка
    }

    function startObserver() {
        applyStyles();
        const obs = new MutationObserver(applyStyles);
        obs.observe(document.body, { childList: true, subtree: true });
        log('Observer started (v1.1 — добавлен выбор парсера в торрентах)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.1',
                author: 'maxi3219',
                description: 'Цвет сидов, скругления, фон, эффекты + выбор парсера в торрентах',
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
