(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    const COLORS = {
        low: '#ff3333',
        mid: '#ffcc00',
        high: '#00ff00'
    };

    const BLOCK_RADIUS = '0.9em';
    const GRADIENT_APP_BG = 'linear-gradient(117deg, rgb(0 0 0) 0%, rgb(11 26 35) 50%, rgb(14 14 14) 100%)';

    function log(...a) {
        try { console.log(`[${plugin_name}]`, ...a); } catch (e) {}
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

    // Фон подложки приложения и прозрачность меню
    function changeBackground() {
        const backgroundBlock = document.querySelector('.background');
        if (backgroundBlock) {
            backgroundBlock.style.background = GRADIENT_APP_BG;
            backgroundBlock.style.setProperty('background', GRADIENT_APP_BG, 'important');
        }

        document.querySelectorAll('.settings__content, .selectbox__content.layer--height').forEach(panel => {
            panel.style.background = 'rgba(33,33,33,0.98)';
            panel.style.setProperty('background', 'rgba(33,33,33,0.98)', 'important');

            panel.style.left = '99%';
            panel.style.maxHeight = 'calc(100vh - 1.8em)';
            panel.style.setProperty('left', '99%', 'important');
            panel.style.setProperty('max-height', 'calc(100vh - 1.8em)', 'important');
        });
    }

    // Внедрение стилей для :hover и .focus
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

    // --- Меню выбора парсеров ---
    const parsers = [
        { id: 'bylampa', name: 'ByLampa Jackett' },
        { id: 'jacred_xyz', name: 'Jacred.xyz' },
        { id: 'jacred_maxvol', name: 'Jacred Maxvol Pro' },
        { id: 'jacred_ru', name: 'Jacred Ru' },
        { id: 'jac_black', name: 'Jac Black' }
    ];

    function injectParserButton() {
        const filterBlock = document.querySelector('.torrent-filter');
        if (!filterBlock) return;
        if (filterBlock.querySelector('.filter--parser')) return;

        const btn = document.createElement('div');
        btn.className = 'simple-button simple-button--filter selector filter--parser';
        btn.innerHTML = `<span>Парсер</span><div>Выбрать</div>`;

        const filterBtn = filterBlock.querySelector('.filter--filter');
        if (filterBtn) filterBtn.after(btn);
        else filterBlock.appendChild(btn);

        btn.addEventListener('click', () => {
            // Открываем стандартное меню Lampa
            Lampa.Controller.toggle('settings');

            setTimeout(() => {
                const settingsPanel = document.querySelector('.settings__content');
                if (!settingsPanel) return;
                settingsPanel.innerHTML = '';

                parsers.forEach(parser => {
                    const item = document.createElement('div');
                    item.className = 'settings-folder selector';
                    item.textContent = parser.name;

                    item.addEventListener('click', () => {
                        app.storage.set('selected_parser', parser.id);
                        Lampa.Controller.toggle('settings');
                        Lampa.Api.notify('Парсер выбран: ' + parser.name);
                    });

                    settingsPanel.appendChild(item);
                });
            }, 120);
        });
    }

    function applyStyles() {
        recolorSeedNumbers();
        roundCorners();
        changeBackground();
        injectInteractionStyles();
        injectParserButton();
    }

    function startObserver() {
        applyStyles();
        const obs = new MutationObserver(applyStyles);
        obs.observe(document.body, { childList: true, subtree: true });
        log('Observer started (v1.2, с кастомными парсерами)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.2',
                author: 'maxi3219',
                description: 'Цвет сидов, скругления блоков, фон, прозрачность меню и выбор кастомных парсеров',
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
