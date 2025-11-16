(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    const COLORS = {
        low: '#ff3333',   // <5 — красный
        mid: '#ffcc00',   // 5–10 — жёлтый
        high: '#00ff00'   // >10 — зелёный
    };

    const BLOCK_RADIUS = '0.9em'; // для .torrent-item и .watched-history
    const ACTIVE_RADIUS = '0.6em'; // для активной и наведённой кнопки
    const GRADIENT = 'linear-gradient(89deg, #000000 0%, #292929 50%, #0e0e0e 100%)';

    function log(...a) { try { console.log(`[${plugin_name}]`, ...a); } catch (e) {} }

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
        document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render')
            .forEach(item => { item.style.borderRadius = BLOCK_RADIUS; });

        document.querySelectorAll('.watched-history.selector')
            .forEach(item => { item.style.borderRadius = BLOCK_RADIUS; });
    }

    function changeBackground() {
        const backgroundBlock = document.querySelector('.background');
        if (backgroundBlock) {
            backgroundBlock.style.setProperty('background', GRADIENT, 'important');
        }
    }

    function enforceButtonsRadius() {
        // Вставляем высокоспецифичное правило, чтобы перебить базовый border-radius: 1em
        const styleId = 'maxcolor-button-states';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
/* Базовые кнопки остаются 1em — как в теме, не трогаем */
/* Активная/наведённая кнопка — 0.6em */
.full-start-new__buttons .full-start__button:hover,
.full-start-new__buttons .full-start__button:focus,
.full-start-new__buttons .full-start__button.focus,
.full-start-new__buttons .full-start__button.active,
.full-start-new__buttons .full-start__button.selector:hover,
.full-start-new__buttons .full-start__button.selector:focus,
/* кейс, когда контейнер активен/в фокусе и внутри есть кнопка */
.full-start-new__buttons.focus .full-start__button.selector,
.full-start-new__buttons.active .full-start__button.selector,
/* кейс с кареткой/слоями фокуса, которые Lampa любит навешивать */
.full-start-new__buttons .full-start__button.layer--focus,
.full-start-new__buttons.layer--focus .full-start__button.selector {
    border-radius: ${ACTIVE_RADIUS} !important;
}
        `;
        document.head.appendChild(style);
    }

    function applyStyles() {
        recolorSeedNumbers();
        roundCorners();
        changeBackground();
        enforceButtonsRadius();
    }

    function startObserver() {
        const obs = new MutationObserver(applyStyles);
        obs.observe(document.body, { childList: true, subtree: true });
        applyStyles();
        log('Observer started (v2.8)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '2.8',
                author: 'maxi3219',
                description: 'Цвет сидов, скругления блоков, фон, и единое скругление 0.6em для активных/наведённых кнопок',
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
