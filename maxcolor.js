(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    function log(msg){
        console.log(`[${plugin_name}] ${msg}`);
    }

    function recolorSeeders(){
        const elements = document.querySelectorAll('.torrent-item, .item, div, span, p');
        elements.forEach(el => {
            if (el.textContent && el.textContent.includes('Раздают:')) {
                const match = el.textContent.match(/Раздают:\s*(\d+)/);
                if (match) {
                    const count = parseInt(match[1]);
                    let color = '#FF0000';
                    if (count > 10) color = '#00FF00';
                    else if (count >= 5) color = '#FFFF00';
                    el.style.color = color;
                    el.style.fontWeight = 'bold';
                    el.style.textShadow = `0 0 8px ${color}`;
                }
            }
        });
    }

    function observeList(){
        const observer = new MutationObserver(() => recolorSeeders());
        observer.observe(document.body, { childList: true, subtree: true });
        log('observer active');
        recolorSeeders();
    }

    function register(){
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                author: 'User',
                version: '1.1',
                description: 'Подсвечивает количество раздающих неоновыми цветами',
                init: observeList
            });
            log('registered');
        } else {
            setTimeout(register, 1000);
        }
    }

    register();
})();
