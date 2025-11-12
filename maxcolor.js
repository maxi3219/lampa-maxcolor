(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    function log(msg){
        console.log(`[${plugin_name}] ${msg}`);
    }

    function recolorSeeders(){
        // находим все элементы, где написано "Раздают:"
        document.querySelectorAll('*').forEach(el => {
            if (el.textContent && el.textContent.trim().startsWith('Раздают:')) {
                const match = el.textContent.match(/Раздают:\s*(\d+)/);
                if (match) {
                    const count = parseInt(match[1]);
                    let color = '#FF0000'; // по умолчанию красный
                    if (count > 10) color = '#00FF00';     // зелёный
                    else if (count >= 5) color = '#FFFF00'; // жёлтый

                    el.style.color = color;
                    el.style.fontWeight = 'bold';
                    el.style.textShadow = '0 0 6px ' + color;
                }
            }
        });
    }

    // MutationObserver — следим за изменениями DOM (когда Лампа подгружает релизы)
    function observeList(){
        const observer = new MutationObserver(() => recolorSeeders());
        observer.observe(document.body, { childList: true, subtree: true });
        log('observer active');
        recolorSeeders();
    }

    // регистрация плагина в Lampa
    if (window.app && app.plugins && typeof app.plugins.add === 'function') {
        app.plugins.add({
            id: plugin_id,
            name: plugin_name,
            author: 'User',
            version: '1.0',
            description: 'Подсвечивает количество раздающих неоновыми цветами',
            init: observeList
        });
        log('registered');
    } else {
        // fallback если плагины ещё не инициализированы
        log('waiting for Lampa...');
        const interval = setInterval(() => {
            if (window.app && app.plugins && typeof app.plugins.add === 'function') {
                clearInterval(interval);
                app.plugins.add({
                    id: plugin_id,
                    name: plugin_name,
                    author: 'User',
                    version: '1.0',
                    description: 'Подсвечивает количество раздающих неоновыми цветами',
                    init: observeList
                });
                log('registered (delayed)');
            }
        }, 1000);
    }
})();
