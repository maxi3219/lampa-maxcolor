(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    const COLORS = {
        low: '#ff3333',   // <5 — красный
        mid: '#ffcc00',   // 5–10 — жёлтый
        high: '#00ff00'   // >10 — зелёный
    };

    const RADIUS = '0.9em';       // базовое скругление для блоков
    const ACTIVE_RADIUS = '0.6em'; // скругление для активной и наведённой кнопки
    const GRADIENT = 'linear-gradient(89deg, #000000 0%, #292929 50%, #0e0e0e 100%)';

    function log(...a) {
        try { console.log(`[${plugin_name}]`, ...a); } catch (e) {}
    }

    function recolorSeedNumbers() {
        const seedBlocks = document.querySelectorAll('.torrent-item__seeds');
        seedBlocks.forEach(block => {
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
        const torrentItems = document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render');
        torrentItems.forEach(item => {
            item.style.borderRadius = RADIUS;
        });

        const watchedHistory = document.querySelectorAll('.watched-history.selector');
        watchedHistory.forEach(item => {
            item.style.borderRadius = RADIUS;
        });
    }

    function changeBackground() {
        const backgroundBlock = document.querySelector('.background');
        if (backgroundBlock) {
            backgroundBlock.style.background = GRADIENT;
            backgroundBlock.style.setProperty('background', GRADIENT, 'important');
        }
    }

    function adjustButtonStates() {
        const styleId = 'maxcolor-button-states';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                /* Базовое состояние кнопок */
                .full-start-new__buttons .full-start__button {
                    transition: border-radius 0.2s ease;
                }
                /* Активная кнопка сразу получает скругление */
                .full-start-new__buttons .full-start__button.active {
                    border-radius: ${ACTIVE_RADIUS} !important;
                }
                /* При наведении на любую кнопку */
                .full-start-new__buttons .full-start__button:hover {
                    border-radius: ${ACTIVE_RADIUS} !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    function applyStyles() {
        recolorSeedNumbers();
        roundCorners();
        changeBackground();
        adjustButtonStates();
    }

    function startObserver() {
        const obs = new MutationObserver(() => applyStyles());
        obs.observe(document.body, { childList: true, subtree: true });
        applyStyles();
        log('Observer started (v2.7)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '2.7',
                author: 'maxi3219',
                description: 'Окрашивает число после "Раздают:", добавляет скругление углов, меняет фон и задаёт скругление для активных/наведённых кнопок',
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
