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
        // Находим все блоки статистики
        const stats = document.querySelectorAll('.torrent__stat');

        stats.forEach(stat => {
            // Ищем текст "Раздают"
            if (stat.textContent.includes('Раздают')) {
                const spans = stat.querySelectorAll('span');
                if (spans.length >= 1) {
                    const labelNode = stat.childNodes[0]; // текст "Раздают:"
                    const seedNode = spans[0];            // число раздающих

                    const num = parseInt(seedNode.textContent);
                    if (isNaN(num)) return;

                    let color = COLORS.low;
                    if (num > 10) color = COLORS.high;
                    else if (num >= 5) color = COLORS.mid;

                    seedNode.style.color = color;
                    seedNode.style.fontWeight = 'bold';
                }
            }
        });
    }

    function startObserver() {
        const obs = new MutationObserver(() => recolorSeedNumbers());
        obs.observe(document.body, { childList: true, subtree: true });
        recolorSeedNumbers();
        log('Observer started (v1.8)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.8',
                author: 'maxi3219',
                description: 'Окрашивает только число после "Раздают:" без свечения',
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
