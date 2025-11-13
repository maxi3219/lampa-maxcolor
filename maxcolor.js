(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    const COLORS = {
        low: '#FF0000',    // <5 — красный
        mid: '#FFFF33',    // 5–10 — жёлтый
        high: '#00FF00'    // >10 — зелёный
    };

    function log(...a) {
        try { console.log(`[${plugin_name}]`, ...a); } catch (e) {}
    }

    function recolorSeedNumbers() {
        // находим элементы, где встречается "Раздают"
        const nodes = document.querySelectorAll('*');
        nodes.forEach(el => {
            const txt = el.textContent;
            if (!txt || !/Раздают:/i.test(txt)) return;

            // ищем соседние элементы или числа рядом
            const parent = el.parentElement || el;
            const seedTexts = parent.querySelectorAll('*');
            seedTexts.forEach(st => {
                if (st.dataset && st.dataset.maxcolorApplied) return;
                const match = st.textContent.match(/^(\d{1,5})$/);
                if (match) {
                    const count = parseInt(match[1]);
                    let color = COLORS.low;
                    if (count > 10) color = COLORS.high;
                    else if (count >= 5) color = COLORS.mid;

                    st.style.color = color;
                    st.style.fontWeight = 'bold';
                    st.style.textShadow = `0 0 8px ${color}`;
                    st.dataset.maxcolorApplied = '1';
                }
            });

            // если "Раздают: 123" в одном элементе — покрасим только число
            const matchInline = el.innerHTML.match(/Раздают:\s*([0-9]{1,5})/i);
            if (matchInline) {
                const count = parseInt(matchInline[1]);
                let color = COLORS.low;
                if (count > 10) color = COLORS.high;
                else if (count >= 5) color = COLORS.mid;

                const newHTML = el.innerHTML.replace(
                    /(Раздают:\s*)([0-9]{1,5})/i,
                    `$1<span style="color:${color};font-weight:bold;text-shadow:0 0 8px ${color}">$2</span>`
                );
                if (newHTML !== el.innerHTML) el.innerHTML = newHTML;
            }
        });
    }

    function startObserver() {
        const obs = new MutationObserver(() => recolorSeedNumbers());
        obs.observe(document.body, { childList: true, subtree: true });
        recolorSeedNumbers();
        log('Observer started (v1.5)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.5',
                author: 'maxi3219',
                description: 'Подсвечивает только число раздающих неоновыми цветами',
                init: startObserver
            });
            log('Registered with Lampa');
        } else {
            log('Running standalone mode');
            startObserver();
        }
    }

    register();
})();
