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

    // ====== визуальные правки ======
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

    function roundCorners() {
        document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render')
            .forEach(item => item.style.borderRadius = BLOCK_RADIUS);
        document.querySelectorAll('.watched-history.selector')
            .forEach(item => item.style.borderRadius = BLOCK_RADIUS);
    }

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
            .selectbox-item.selector.focus {
                box-shadow: ${SHADOW_COLOR} !important;
            }
            .settings-folder.selector:hover,
            .settings-folder.selector.focus {
                box-shadow: ${SHADOW_COLOR} !important;
            }
            /* стиль для кнопки выбора парсеров (чтобы точно совпадал с остальными) */
            .simple-button.simple-button--filter.selector.filter--parser {
                display: inline-flex;
                align-items: center;
                gap: 0.6em;
            }
        `;
        const staticCss = `
            .torrent-item.selector {
                background-color: rgb(68 68 69 / 13%) !important;
            }
        `;

        const interactionStyleElement = document.createElement('style');
        interactionStyleElement.id = styleId;
        interactionStyleElement.type = 'text/css';
        interactionStyleElement.innerHTML = interactionCss;
        document.head.appendChild(interactionStyleElement);

        const staticStyleElement = document.createElement('style');
        staticStyleElement.id = staticStyleId;
        staticStyleElement.type = 'text/css';
        staticStyleElement.innerHTML = staticCss;
        document.head.appendChild(staticStyleElement);
    }

    // ====== вставка кнопки выбора парсеров в блок фильтров ======

    // Список парсеров (копия / упрощённая версия из вашей большой функции)
    const PARSERS = [
        { title: 'Jacred Maxvol Pro', url: 'jr.maxvol.pro', url_two: 'jr_maxvol_pro', jac_key: '', jac_int: 'on', jac_lang: 'lg' },
        { title: '62.60.149.237:9117', url: '62.60.149.237:9117', url_two: '62.60.149.237:9117', jac_key: '', jac_int: '', jac_lang: 'df' },
        { title: 'jacred_xyz', url: 'jacred.xyz', url_two: 'jacred_xyz', jac_key: '', jac_int: 'healthy', jac_lang: 'lg' },
        { title: 'jr_maxvol_pro (alt)', url: 'jr.maxvol.pro', url_two: 'jr_maxvol_pro', jac_key: '', jac_int: 'on', jac_lang: 'lg' },
        { title: 'jacred_ru', url: 'jac-red.ru', url_two: 'jacred_ru', jac_key: '', jac_int: '', jac_lang: 'lg' },
        { title: 'jacred_viewbox_dev', url: 'jacred.viewbox.dev', url_two: 'jacred_viewbox_dev', jac_key: 'SOME_KEY', jac_int: '', jac_lang: 'lg' },
        { title: 'Jacred Pro', url: 'jacred.pro', url_two: 'jacred_pro', jac_key: '', jac_int: '', jac_lang: 'lg' },
        { title: 'Jac Black', url: 'jac_black', url_two: 'jac_black', jac_key: '', jac_int: '', jac_lang: 'lg' },
        { title: 'No parser', url: '', url_two: 'no_parser', jac_key: '', jac_int: '', jac_lang: 'lg' }
    ];

    // Создаёт DOM кнопку и добавляет её в .torrent-filter (после .filter--filter)
    function injectParserButton() {
        try {
            const container = document.querySelector('.torrent-filter');
            if (!container) return;

            // Если кнопка уже есть — ничего не делаем
            if (container.querySelector('.filter--parser')) return;

            // Создаём кнопку, структуру и поведение, чтобы визуально совпадала
            const btn = document.createElement('div');
            btn.className = 'simple-button simple-button--filter filter--parser selector';
            btn.setAttribute('data-name', 'parser_selector');

            // Иконка (простая, можно заменить на svg если нужно)
            const icon = document.createElement('div');
            icon.style.width = '1.05em';
            icon.style.height = '1.05em';
            icon.style.display = 'inline-block';
            icon.style.borderRadius = '0.2em';
            icon.style.background = 'linear-gradient(90deg,#d99821,#e8b84f)';
            icon.style.flex = '0 0 auto';
            icon.style.marginRight = '0.5em';
            btn.appendChild(icon);

            // Текст
            const spanTitle = document.createElement('span');
            spanTitle.textContent = 'Парсер';
            btn.appendChild(spanTitle);

            // Подпись / текущий выбор (динамическая часть, похожая на Sort/Filter)
            const divCurrent = document.createElement('div');
            divCurrent.className = '';
            divCurrent.textContent = getCurrentParserTitle();
            btn.appendChild(divCurrent);

            // Добавляем кнопку после .filter--filter (если есть), иначе в конец
            const ref = container.querySelector('.filter--filter');
            if (ref && ref.parentNode) ref.parentNode.insertBefore(btn, ref.nextSibling);
            else container.appendChild(btn);

            // Событие по нажатию: открываем меню выбора парсеров
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                openParserSelectMenu();
            });

            // Обновляем подпись при изменении Storage (если Lampa есть)
            if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.follow === 'function') {
                Lampa.Storage.follow('change', () => {
                    const el = document.querySelector('.filter--parser > div:last-child');
                    if (el) el.textContent = getCurrentParserTitle();
                });
            }
        } catch (e) {
            log('injectParserButton error', e);
        }
    }

    function getCurrentParserTitle() {
        try {
            if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.get === 'function') {
                const key = Lampa.Storage.get('parser_torrent_type') || Lampa.Storage.get('parser') || '';
                if (!key) return 'Авто';
                // ищем по url_two или url
                const p = PARSERS.find(x => x.url_two === key || x.url === key);
                return p ? p.title : 'Выбран';
            }
        } catch (e) {}
        return 'Авто';
    }

    // Открывает Lampa.Select с PARSERS и устанавливает параметры при выборе
    function openParserSelectMenu() {
        try {
            if (window.Lampa && Lampa.Select && typeof Lampa.Select.show === 'function') {
                const currentState = Lampa.Controller ? Lampa.Controller.activeName && Lampa.Controller.activeName() : null;
                const items = PARSERS.map(p => ({
                    title: p.title,
                    url: p.url,
                    url_two: p.url_two,
                    jac_key: p.jac_key,
                    jac_int: p.jac_int,
                    jac_lang: p.jac_lang
                }));

                Lampa.Select.show({
                    title: 'Выбрать парсер',
                    items: items,
                    onBack: function() {
                        if (currentState && Lampa.Controller) Lampa.Controller.open(currentState);
                    },
                    onSelect: function(item) {
                        try {
                            // Устанавливаем параметры в Storage (копирует поведение оригинала)
                            if (Lampa.Storage && typeof Lampa.Storage.set === 'function') {
                                // Некоторые ключи используют разные имена в исходном коде; ставим наиболее типичные
                                if (item.url) Lampa.Storage.set('jackett_url', item.url);
                                Lampa.Storage.set('parser_torrent_type', item.url_two || '');
                                Lampa.Storage.set('jackett_key', item.jac_key || '');
                                Lampa.Storage.set('jackett_interview', item.jac_int || '');
                                Lampa.Storage.set('parse_lang', item.jac_lang || 'lg');
                                Lampa.Storage.set('parser_use', true);
                            }
                        } catch (e) {
                            log('onSelect set error', e);
                        }

                        // Закрываем Select и возвращаемся назад, затем триггерим обновление/нажатие
                        if (currentState && window.history && typeof history.back === 'function') {
                            setTimeout(() => history.back(), 400);
                        }

                        // если есть контроллер парсера, пробуем нажать на кнопку обновления/обновления парсера
                        try {
                            const parserButton = Lampa.Storage ? Lampa.Storage.get('parser_torrent_type') : null;
                            setTimeout(() => {
                                // Пытаемся вызвать стандартный update: вызываем Lampa.Activity.press если есть
                                if (Lampa && Lampa.Controller && typeof Lampa.Controller.update === 'function') {
                                    Lampa.Controller.update();
                                }
                                // В редком случае: симулируем клик на текущей кнопке парсера (если найдено)
                                const btn = document.querySelector('[data-name="parser_torrent_type"]');
                                if (btn) btn.click();
                            }, 800);
                        } catch (e) {
                            log('post-select actions error', e);
                        }

                    }
                });

            } else {
                // fallback — если Lampa не доступна, показываем простое окно
                alert('Открыть меню выбора парсеров можно только внутри Lampa');
            }
        } catch (e) {
            log('openParserSelectMenu error', e);
        }
    }

    // ====== наблюдатель за DOM и интеграция кнопки ======
    function applyStyles() {
        recolorSeedNumbers();
        roundCorners();
        changeBackground();
        injectInteractionStyles();
        injectParserButton();
    }

    function startObserver() {
        applyStyles();
        const obs = new MutationObserver(debounce(applyStyles, 120));
        obs.observe(document.body, { childList: true, subtree: true });
        log('Observer started (v1.1) — parser button injected');
    }

    // Простая debounce для избежания частых вызовов при бурных мутациях
    function debounce(fn, ms) {
        let t = null;
        return function() {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, arguments), ms);
        };
    }

    // ====== регистрация плагина ======
    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.1',
                author: 'maxi3219',
                description: 'Цвет сидов, скругления блоков, фон, прозрачность меню, визуальные эффекты фокуса и выбор парсеров в фильтрах',
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
