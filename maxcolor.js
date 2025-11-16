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

    // Применение кастомных стилей (фон + скругления)
    function applyCustomStyles() {
        // Фон для основного контейнера
        const wrap = document.querySelector('.wrap__content');
        if (wrap) {
            wrap.style.background = 'linear-gradient(135deg, #171717 0%, #2f3233 50%, #000000 100%)';
        }

        // Скругление углов у torrent-item
        const torrentItems = document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render');
        torrentItems.forEach(item => {
            item.style.borderRadius = '0.9em';
        });

        // Скругление углов у watched-history
        const historyBlocks = document.querySelectorAll('.watched-history.selector');
        historyBlocks.forEach(block => {
            block.style.borderRadius = '0.9em';
        });
    }

    // Наблюдатель за изменениями DOM
    function startObserver() {
        const obs = new MutationObserver(() => {
            recolorSeedNumbers();
            applyCustomStyles();
        });
        obs.observe(document.body, { childList: true, subtree: true });

        // Первичный запуск
        recolorSeedNumbers();
        applyCustomStyles();

        log('Observer started (v1.9)');
    }

    // Регистрация плагина
    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.9',
                author: 'maxi3219',
                description: 'Окрашивает число "Раздают", меняет фон и скругляет углы',
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
