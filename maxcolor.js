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
            wrap.style.background = 'linear-gradient(135deg, #171717 0%, #2f3233 50%, #000000 100%)';
        }

        document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render')
            .forEach(item => item.style.borderRadius = '0.9em');

        document.querySelectorAll('.watched-history.selector')
            .forEach(block => block.style.borderRadius = '0.9em');
    }

    // Отключение canvas-фона
    function overrideCanvasBackground() {
        const bg = document.querySelector('.background');
        if (bg) {
            bg.style.background = 'linear-gradient(135deg, #171717 0%, #2f3233 50%, #000000 100%)';
            bg.style.zIndex = '-1';
        }

        ['.background__one', '.background__two'].forEach(sel => {
            const canvas = document.querySelector(sel);
            if (canvas) canvas.style.display = 'none';
        });
    }

    // Меню в стиле панели настроек
    function styleMenuLikeSettings() {
        const menu = document.querySelector('.menu');
        if (menu) {
            menu.style.background = 'rgba(23, 23, 23, 0.95)'; // тёмный фон
            menu.style.borderRadius = '1em';                  // скруглённые углы
            menu.style.margin = '1em';                        // отступ от краёв
            menu.style.padding = '0.5em';                     // внутренние отступы
            menu.style.boxShadow = '0 0 25px rgba(0,0,0,0.6)';// мягкая тень
            menu.style.overflow = 'hidden';
        }

        const header = document.querySelector('.menu__header');
        if (header) {
            header.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
            header.style.paddingBottom = '0.5em';
            header.style.marginBottom = '0.5em';
        }

        document.querySelectorAll('.menu__item').forEach(item => {
            item.style.borderRadius = '0.5em';
            item.style.margin = '0.2em 0';
            item.style.padding = '0.4em';
            item.style.background = 'rgba(47, 50, 51, 0.8)';
        });
    }

    function startObserver() {
        const obs = new MutationObserver(() => {
            recolorSeedNumbers();
            applyCustomStyles();
            overrideCanvasBackground();
            styleMenuLikeSettings();
        });
        obs.observe(document.body, { childList: true, subtree: true });

        recolorSeedNumbers();
        applyCustomStyles();
        overrideCanvasBackground();
        styleMenuLikeSettings();

        log('Observer started (v2.5)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '2.5',
                author: 'maxi3219',
                description: 'Окрашивает число "Раздают", меняет фон, скругляет углы и оформляет меню как панель настроек',
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
