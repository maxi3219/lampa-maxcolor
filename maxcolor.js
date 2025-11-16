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
            wrap.style.background = 'linear-gradient(135deg, #171717 0%, #2f3233 50%, #000000 100%)';
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

    function overrideCanvasBackground() {
        const bg = document.querySelector('.background');
        if (bg) {
            bg.style.background = 'linear-gradient(135deg, #171717 0%, #2f3233 50%, #000000 100%)';
            bg.style.zIndex = '-1';
        }

        const canvasOne = document.querySelector('.background__one');
        const canvasTwo = document.querySelector('.background__two');
        [canvasOne, canvasTwo].forEach(canvas => {
            if (canvas) canvas.style.display = 'none';
        });
    }

    function styleMenuPanel() {
        const menu = document.querySelector('.menu');
        if (menu) {
            menu.style.background = 'linear-gradient(135deg, #171717 0%, #2f3233 50%, #000000 100%)';
            menu.style.borderRadius = '1em';
            menu.style.margin = '1em';
            menu.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
            menu.style.overflow = 'hidden';
        }
    }

    function startObserver() {
        const obs = new MutationObserver(() => {
            recolorSeedNumbers();
            applyCustomStyles();
            overrideCanvasBackground();
            styleMenuPanel();
        });
        obs.observe(document.body, { childList: true, subtree: true });

        recolorSeedNumbers();
        applyCustomStyles();
        overrideCanvasBackground();
        styleMenuPanel();

        log('Observer started (v2.1)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '2.1',
                author: 'maxi3219',
                description: 'Окрашивает число "Раздают", меняет фон, скругляет углы и стилизует меню',
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
