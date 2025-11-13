(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    function log(msg){
        console.log(`[${plugin_name}] ${msg}`);
    }

    function recolorSeeders(){
        // Ищем все элементы, где есть слово "Раздают"
        const seeders = document.querySelectorAll('*');
        seeders.forEach(el => {
            if (el.childElementCount === 0 && /Раздают:/i.test(el.textContent)) {
                const match = el.textContent.match(/Раздают:\s*(\d+)/i);
                if (match) {
                    const count = parseInt(match[1]);
                    let color;
                    if (count > 10) color = '#00FF00';        // ярко-зелёный
                    else if (count >= 5) color = '#FFFF33';   // неоново-жёлтый
                    else color = '#FF0033';                   // неоново-красный
                    el.style.color = color;
                    el.style.fontWeight = 'bold';
                    el.style.textShadow = `0 0 10px ${color}`;
                }
            }
        });
    }

    function startObserver(){
        const observer = new MutationObserver(() => recolorSeeders());
        observer.observe(document.body, { childList: true, subtree: true });
        recolorSeeders();
        log('Observer started and recoloring active');
    }

    function register(){
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.2',
                author: 'maxi3219',
                description: 'Неоновая подсветка количества раздающих в списке торрентов',
                init: startObserver
            });
            log('Registered successfully');
        } else {
            setTimeout(register, 1000);
        }
    }

    register();
})();
