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
        const elements = document.querySelectorAll('div, span, p, li');

        elements.forEach(el => {
            const text = el.textContent.trim();

            // ищем элементы, где есть "Раздают:" и число
            if (/Раздают:\s*\d+/i.test(text)) {
                const match = text.match(/Раздают:\s*(\d+)/i);
                if (!match) return;

                const num = parseInt(match[1]);
                let color = COLORS.low;
                if (num > 10) color = COLORS.high;
                else if (num >= 5) color = COLORS.mid;

                // чтобы не трогать уже обработанные элементы
                if (el.dataset.maxcolor === 'done') return;

                // заменяем ТОЛЬКО число после “Раздают:”
                el.innerHTML = el.innerHTML.replace(
                    /(Раздают:\s*)(\d+)/i,
                    `$1<span style="color:${color}; font-weight:bold;">$2</span>`
                );

                el.dataset.maxcolor = 'done';
            }
        });
    }

    function startObserver() {
        const obs = new MutationObserver(() => recolorSeedNumbers());
        obs.observe(document.body, { childList: true, subtree: true });
        recolorSeedNumbers();
        log('Observer started (v1.7)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.7',
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
