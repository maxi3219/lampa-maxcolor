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
       СТИЛИ (фокус торрентов + кнопки)
       ============================================================ */
    function applyStyles() {
        const css = `
            /* Фон */
            .wrap,
            .wrap__content,
            body,
            html {
                background: linear-gradient(135deg, #171717 0%, #2f3233 50%, #000000 100%) !important;
            }

            /* Базовое скругление торрентов */
            .torrent-item {
                position: relative !important;
                border-radius: 0.9em !important;
                overflow: hidden !important;
                transition: outline .15s ease, box-shadow .15s ease;
            }

            /* Фокус торрентов — мягкая, менее белая, тонкая, скругление 0.9 */
            .torrent-item.selector.focus,
            .torrent-item.selector.hover,
            .torrent-item.selector.traverse {
                outline: 1.6px solid rgba(255,255,255,0.28) !important;
                outline-offset: -2px !important;
                border-radius: 0.9em !important; /* ← скругление НЕ уменьшаем */
                box-shadow: 0 0 6px rgba(255,255,255,0.22) !important;
            }

            /* История */
            .watched-history {
                border-radius: 0.9em !important;
            }

            /* ================= КНОПКИ .full-start-new__buttons ================ */

            /* Уменьшаем ТОЛЬКО толщину обводки при фокусе / наведении */
            .full-start-new__buttons .full-start__button.selector.focus,
            .full-start-new__buttons .full-start__button.selector.hover,
            .full-start-new__buttons .full-start__button.selector.traverse {
                outline: 1.4px solid rgba(255,255,255,0.35) !important;
                outline-offset: -2px !important;
            }
        `;

        const style = document.createElement('style');
        style.id = 'maxcolor-ui-style';
        style.innerHTML = css;
        document.head.appendChild(style);
    }

    /* ============================================================
       Цвет сидов
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
        log('Observer started (v2.1)');
    }

    /* ============================================================
       Регистрация
       ============================================================ */
    function register() {
        applyStyles();

        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '2.1',
                author: 'maxi3219',
                description: 'Мягкая обводка торрентов + лёгкая обводка кнопок + цвета сидов',
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
