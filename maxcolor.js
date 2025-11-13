(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    function log(...args) {
        try { console.log(`[${plugin_name}]`, ...args); } catch (e) {}
    }

    const COLORS = {
        low: '#FF0000',    // <5
        mid: '#FFFF33',    // 5-10
        high: '#00FF00'    // >10
    };

    function colorNumberOnly() {
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
            if (el.childElementCount === 0 && /Раздают:/i.test(el.textContent)) {
                const match = el.textContent.match(/(Раздают:\s*)(\d+)/i);
                if (match) {
                    const count = parseInt(match[2]);
                    let color = COLORS.low;
                    if (count > 10) color = COLORS.high;
                    else if (count >= 5) color = COLORS.mid;

                    // Заменяем только число, оборачивая его в <span>
                    const newHtml = el.textContent.replace(
                        /(Раздают:\s*)(\d+)/i,
                        `$1<span class="maxcolor-num" style="
                            color: ${color};
                            font-weight: bold;
                            text-shadow: 0 0 8px ${color};
                        ">$2</span>`
                    );

                    el.innerHTML = newHtml;
                }
            }
        });
    }

    function startObserver() {
        const observer = new MutationObserver(() => colorNumberOnly());
        observer.observe(document.body, { childList: true, subtree: true });
        colorNumberOnly();
        log('Observer started (v1.4)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.4',
                author: 'maxi3219',
                description: 'Неоновая подсветка только числа раздающих',
                init: startObserver
            });
            log('Registered via app.plugins.add');
        } else {
            log('Running standalone (no app.plugins)');
            startObserver();
        }
    }

    register();
})();
