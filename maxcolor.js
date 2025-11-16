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
       СТИЛИ: ФОН + СКРУГЛЕНИЯ + ВОССТАНОВЛЕНИЕ ОБВОДКИ
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

            /* СКРУГЛЕНИЕ ИСТОРИИ ПРОСМОТРА */
            .watched-history {
                border-radius: 0.9em !important;
                overflow: hidden !important;
            }

            /* ВОССТАНАВЛИВАЕМ БЕЛУЮ ПОДСВЕТКУ ВЫДЕЛЕНИЯ */
            .torrent-item.selector.focus,
            .torrent-item.selector.hover,
            .torrent-item.selector.traverse {
                outline: 3px solid #ffffff !important;
                outline-offset: -3px !important;
                box-shadow: 0 0 12px rgba(255,255,255,0.35) !important;
                border-radius: inherit !important;
            }
        `;

        const style = document.createElement('style');
        style.id = 'maxcolor-ui-style';
        style.innerHTML = css;
        document.head.appendChild(style);
    }

    /* ============================================================
       ЛОГИКА ОКРАШИВАНИЯ ЧИСЕЛ "РАЗДАЮТ"
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
        log('Observer started (v1.9)');
    }

    /* ============================================================
       РЕГИСТРАЦИЯ ПЛАГИНА
       ============================================================ */
    function register() {
        applyStyles(); // подключаем твой стиль

        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.9',
                author: 'maxi3219',
                description: 'Окрашивает число раздающих + стиль интерфейса',
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
