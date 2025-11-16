(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    const COLORS = {
        low: '#ff3333',   // <5 — красный
        mid: '#ffcc00',   // 5–10 — жёлтый
        high: '#00ff00'   // >10 — зелёный
    };

    function log(...a) {
        try { console.log(`[${plugin_name}]`, ...a); } catch (e) {}
    }

    // Окрашивание числа "Раздают"
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

    // Фон приложения и скругления
    function applyCustomStyles() {
        const wrap = document.querySelector('.wrap__content');
        if (wrap) {
            wrap.style.setProperty('background', 'linear-gradient(135deg, #171717 0%, #2f3233 50%, #000000 100%)', 'important');
            wrap.style.setProperty('background-color', 'transparent', 'important');
            wrap.style.setProperty('background-image', 'linear-gradient(135deg, #171717 0%, #2f3233 50%, #000000 100%)', 'important');
        }

        const torrentItems = document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render');
        torrentItems.forEach(item => {
            item.style.borderRadius = '0.9em';
        });

        const historyBlocks = document.querySelectorAll('.watched-history.selector');
        historyBlocks.forEach(block => {
            block.style.borderRadius = '0.9em';
        });
    }

    // Отключение canvas-фона
    function overrideCanvasBackground() {
        const bg = document.querySelector('.background');
        if (bg) {
            bg.style.setProperty('background', 'linear-gradient(135deg, #171717 0%, #2f3233 50%, #000000 100%)', 'important');
            bg.style.setProperty('background-color', 'transparent', 'important');
        }

        const canvasOne = document.querySelector('.background__one');
        const canvasTwo = document.querySelector('.background__two');
        [canvasOne, canvasTwo].forEach(canvas => {
            if (canvas) canvas.style.setProperty('display', 'none', 'important');
        });
    }

    // Сделать меню и все его слои прозрачными
    function makeMenuTransparent() {
        const targets = [
            '.menu',
            '.menu__header',
            '.menu__case',
            '.menu__list',
            '.menu__item',
            '.menu__split'
        ];

        targets.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                el.style.setProperty('background', 'transparent', 'important');
                el.style.setProperty('background-color', 'transparent', 'important');
                el.style.setProperty('background-image', 'none', 'important');
                el.style.setProperty('box-shadow', 'none', 'important');
                el.style.setProperty('border', 'none', 'important');
                el.style.setProperty('outline', 'none', 'important');
            });
        });

        // На случай псевдо-элементов/градиентных масок
        const styleTagId = 'maxcolor-transparent-menu';
        if (!document.getElementById(styleTagId)) {
            const css = `
                .menu::before, .menu::after,
                .menu__header::before, .menu__header::after,
                .menu__case::before, .menu__case::after,
                .menu__list::before, .menu__list::after,
                .menu__item::before, .menu__item::after {
                    background: transparent !important;
                    background-image: none !important;
                    box-shadow: none !important;
                    border: none !important;
                }
            `;
            const tag = document.createElement('style');
            tag.id = styleTagId;
            tag.textContent = css;
            document.head.appendChild(tag);
        }
    }

    function startObserver() {
        const obs = new MutationObserver(() => {
            recolorSeedNumbers();
            applyCustomStyles();
            overrideCanvasBackground();
            makeMenuTransparent();
        });
        obs.observe(document.body, { childList: true, subtree: true });

        recolorSeedNumbers();
        applyCustomStyles();
        overrideCanvasBackground();
        makeMenuTransparent();

        log('Observer started (v2.3)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '2.3',
                author: 'maxi3219',
                description: 'Окрашивает число "Раздают", меняет фон, скругляет углы и делает меню полностью прозрачным',
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
