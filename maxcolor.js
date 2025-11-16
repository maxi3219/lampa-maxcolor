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

    /* ============================================================
       ДОБАВЛЕННЫЕ СТИЛИ: ФОН + СКРУГЛЕНИЯ ЭЛЕМЕНТОВ
       ============================================================ */
    function applyStyles() {
        const css = `
            /* ГЛОБАЛЬНЫЙ ФОН */
            .wrap,
            .wrap__content,
            body,
            html {
                background: linear-gradient(135deg, #171717 0%, #2f3233 50%, #000000 100%) !important;
            }

            /* СКРУГЛЕНИЕ ТОРРЕНТ-КАРТОЧЕК */
            .torrent-item {
                position: relative !important;
                border-radius: 0.9em !important;
                overflow: hidden !important;
            }

            /* СКРУГЛЕНИЕ БЛОКА ИСТОРИИ ПРОСМОТРА */
            .watched-history {
                border-radius: 0.9em !important;
                overflow: hidden !important;
            }
        `;

        const style = document.createElement('style');
        style.id = 'maxcolor-ui-style';
        style.innerHTML = css;
        document.head.appendChild(style);
    }

    /* ============================================================
       ОСНОВНАЯ ЛОГИКА ОКРАШИВАНИЯ ЧИСЕЛ "РАЗДАЮТ"
       ============================================================ */
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

    function startObserver() {
        const obs = new MutationObserver(() => recolorSeedNumbers());
        obs.observe(document.body, { childList: true, subtree: true });
        recolorSeedNumbers();
        log('Observer started (v1.8)');
    }

    /* ============================================================
       РЕГИСТРАЦИЯ ПЛАГИНА + СТАРТ СТИЛЕЙ
       ============================================================ */
    function register() {
        applyStyles();

        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.9',
                author: 'maxi3219',
                description: 'Окрашивает число раздающих + скругление элементов + новый фон',
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
