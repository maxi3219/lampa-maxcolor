(() => {
    const plugin_id = 'maxxx';
    const plugin_name = 'maxxx';

    function log(...args) {
        try { console.log(`[${plugin_name}]`, ...args); } catch (e) {}
    }

    function applyCustomMenuStyles() {
        const style = document.createElement('style');
        style.id = 'maxxx-style-menu';
        style.innerHTML = `...`; // ← твой CSS для меню
        document.head.appendChild(style);
        log('Menu styles applied');
    }

    function recolorSeedNumbers() {
        const seedBlocks = document.querySelectorAll('.torrent-item__seeds');
        seedBlocks.forEach(block => {
            const span = block.querySelector('span');
            if (!span) return;

            const num = parseInt(span.textContent);
            if (isNaN(num)) return;

            let color = '#ff3333';
            if (num > 10) color = '#00ff00';
            else if (num >= 5) color = '#ffcc00';

            span.style.color = color;
            span.style.fontWeight = 'bold';
        });
    }

    function startObserver() {
        const obs = new MutationObserver(() => recolorSeedNumbers());
        obs.observe(document.body, { childList: true, subtree: true });
        recolorSeedNumbers();
        log('Observer started');
    }

    function initPlugin() {
        if (window.Lampa && typeof Lampa.Listener === 'object') {
            Lampa.Listener.follow('app', function(event){
                if(event.type === 'ready'){
                    applyCustomMenuStyles();
                    startObserver();
                }
            });
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                applyCustomMenuStyles();
                startObserver();
            });
        }
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name, // ← это и будет отображаться
                version: '6.0',
                author: 'maxi3219',
                description: 'Меню + цвет сидов, объединено',
                init: initPlugin
            });
        } else {
            initPlugin();
        }
    }

    register();
})();
