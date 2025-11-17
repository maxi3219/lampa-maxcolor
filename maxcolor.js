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

    function log(...a) { try { console.log(`[${plugin_name}]`, ...a); } catch(e){} }

    function recolorSeedNumbers() {
        document.querySelectorAll('.torrent-item__seeds').forEach(block => {
            const span = block.querySelector('span');
            if(!span) return;
            const num = parseInt(span.textContent);
            if(isNaN(num)) return;

            let color = COLORS.low;
            if(num > 10) color = COLORS.high;
            else if(num >= 5) color = COLORS.mid;

            span.style.color = color;
            span.style.fontWeight = 'bold';
        });
    }

    function roundCorners() {
        document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render, .watched-history.selector')
            .forEach(item => item.style.borderRadius = BLOCK_RADIUS);
    }

    function changeBackground() {
        const backgroundBlock = document.querySelector('.background');
        if(backgroundBlock){
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

    // --- НОВОЕ: Добавление кнопки выбора парсеров ---
    function addParserButton() {
        const filterPanel = document.querySelector('.torrent-filter');
        if(!filterPanel || filterPanel.querySelector('.filter--parser')) return;

        const parserButton = document.createElement('div');
        parserButton.className = 'simple-button simple-button--filter selector filter--parser';
        parserButton.innerHTML = `<span>Парсер</span><div class="">Выбрать</div>`;

        parserButton.addEventListener('click', () => {
            if(typeof Lampa.SettingsApi?.open === 'function'){
                Lampa.SettingsApi.open('parser'); // открываем меню выбора парсера
            }
        });

        const filterButton = filterPanel.querySelector('.filter--filter');
        if(filterButton){
            filterPanel.insertBefore(parserButton, filterButton.nextSibling);
        } else {
            filterPanel.appendChild(parserButton);
        }
    }

    function applyStyles() {
        recolorSeedNumbers();
        roundCorners();
        changeBackground();
        injectInteractionStyles();
        addParserButton();
    }

    function startObserver() {
        applyStyles();
        const obs = new MutationObserver(applyStyles);
        obs.observe(document.body, { childList: true, subtree: true });
        log('Observer started (v1.1, добавлен Parser Button)');
    }

    function register() {
        if(window.app && app.plugins && typeof app.plugins.add === 'function'){
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.1',
                author: 'maxi3219',
                description: 'Цвет сидов, скругления блоков, фон, прозрачность меню и визуальные эффекты фокуса + выбор парсеров',
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
