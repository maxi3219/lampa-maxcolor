(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    const COLORS = {
        low: '#ff3333',
        mid: '#ffcc00',
        high: '#00ff00'
    };

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

    function applyCustomStyles() {
        const wrap = document.querySelector('.wrap__content');
        if (wrap) {
            wrap.style.setProperty('background', 'linear-gradient(135deg, #171717 0%, #2f3233 50%, #000000 100%)', 'important');
        }

        document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render')
            .forEach(item => item.style.borderRadius = '0.9em');

        document.querySelectorAll('.watched-history.selector')
            .forEach(block => block.style.borderRadius = '0.9em');
    }

    function overrideCanvasBackground() {
        const bg = document.querySelector('.background');
        if (bg) {
            bg.style.setProperty('background', 'linear-gradient(135deg, #171717 0%, #2f3233 50%, #000000 100%)', 'important');
        }
        ['.background__one', '.background__two'].forEach(sel => {
            const canvas = document.querySelector(sel);
            if (canvas) canvas.style.setProperty('display', 'none', 'important');
        });
    }

    function makeMenuTransparent() {
        const styleTagId = 'maxcolor-transparent-menu';
        if (!document.getElementById(styleTagId)) {
            const css = `
                .menu, .menu__header, .menu__case, .menu__list, .menu__item, .menu__split {
                    background: transparent !important;
                    background-color: transparent !important;
                    background-image: none !important;
                    box-shadow: none !important;
                    border: none !important;
                }
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

        log('Observer started (v2.4)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '2.4',
                author: 'maxi3219',
                description: 'Окрашивает число "Раздают", меняет фон, скругляет углы и делает меню прозрачным',
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
