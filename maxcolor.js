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
        // ищем все элементы, содержащие именно "Раздают:"
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
            const html = el.innerHTML;
            if (!html || !/Раздают:\s*\d+/i.test(html)) return;

            el.innerHTML = html.replace(/(Раздают:\s*)(\d{1,5})/gi, (m, label, num) => {
                const count = parseInt(num);
                let color = COLORS.low;
                if (count > 10) color = COLORS.high;
                else if (count >= 5) color = COLORS.mid;
                return `${label}<span style="color:${color}; font-weight:bold;">${num}</span>`;
            });
        });
    }

    function startObserver() {
        const obs = new MutationObserver(() => recolorSeedNumbers());
        obs.observe(document.body, { childList: true, subtree: true });
        recolorSeedNumbers();
        log('Observer started (v1.6)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.6',
                author: 'maxi3219',
                description: 'Окрашивает только число после "Раздают:" (без свечения)',
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
