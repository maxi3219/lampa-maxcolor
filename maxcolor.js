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

    function roundCorners() {
        // Добавляем скругление углов к нужным блокам
        const torrentItems = document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render');
        torrentItems.forEach(item => {
            item.style.borderRadius = '0.9em';
        });

        const watchedHistory = document.querySelectorAll('.watched-history.selector');
        watchedHistory.forEach(item => {
            item.style.borderRadius = '0.9em';
        });
    }

    function applyStyles() {
        recolorSeedNumbers();
        roundCorners();
    }

    function startObserver() {
        const obs = new MutationObserver(() => applyStyles());
        obs.observe(document.body, { childList: true, subtree: true });
        applyStyles();
        log('Observer started (v1.9)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.9',
                author: 'maxi3219',
                description: 'Окрашивает число после "Раздают:" и добавляет скругление углов',
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
