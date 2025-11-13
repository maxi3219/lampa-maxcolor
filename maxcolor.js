(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    function log(...args){
        try{ console.log(`[${plugin_name}]`, ...args); }catch(e){}
    }

    // цвета (неоновые)
    const COLORS = {
        low: '#FF0000',    // <5
        mid: '#FFFF00',    // 5-10
        high: '#00FF00'    // >10
    };

    // применить стиль к элементу
    function applyStyle(el, color){
        if (!el) return;
        el.classList.add('maxcolor-applied');
        el.style.setProperty('color', color, 'important');
        el.style.setProperty('font-weight', '700', 'important');
        el.style.setProperty('text-shadow', `0 0 8px ${color}`, 'important');
    }

    // ищем число рядом с "Раздают"
    function findCountInTextNodes(){
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        const nodes = [];
        while(walker.nextNode()){
            const t = walker.currentNode;
            if (!t || !t.nodeValue) continue;
            if (/Раздат/i.test(t.nodeValue) || /Разда/i.test(t.nodeValue)) {
                nodes.push(t);
            }
        }
        return nodes;
    }

    // получить ближайший блочный родитель (limit уровней)
    function findNearestBlockParent(node, limit = 6){
        let cur = node.nodeType === 1 ? node : node.parentElement;
        let i = 0;
        while(cur && i < limit){
            const display = window.getComputedStyle(cur).display || '';
            if (display.startsWith('block') || display === 'flex' || display === 'grid' || cur.tagName.toLowerCase() === 'li' || cur.classList.contains('torrent') ) {
                return cur;
            }
            cur = cur.parentElement;
            i++;
        }
        // fallback — вернём просто parentElement для наглядности
        return node.parentElement || node;
    }

    // попарсить строку: ищем "Раздают:" и ближайшее число
    function parseCountFromString(str){
        if (!str) return null;
        // варианты: "Раздают: 16", "Раздают 16", "Раздають: 16" и т.д.
        const m = str.match(/Разда\w*[:\s]*([0-9]{1,5})/i);
        if (m && m[1]) return parseInt(m[1].replace(/\s+/g,''), 10);
        // иногда формат "Раздают\n16" -> ищем просто число в строке
        const m2 = str.match(/([0-9]{1,5})/);
        if (m2) return parseInt(m2[1],10);
        return null;
    }

    // основная логика: находим текстовые узлы с "Раздают", получаем значение, красим родителя
    function recolorSeeders(){
        try{
            const textNodes = findCountInTextNodes();
            if (!textNodes || textNodes.length === 0) {
                // ничего не найдено — можно логировать раз в N, но не спамить
                // log('no text nodes with Раздают found');
            }

            textNodes.forEach(textNode => {
                // Склеим вокруг соседние тексты (в одном блоке) чтобы поймать число, которое может быть в соседнем span
                const parent = textNode.parentElement;
                let combined = textNode.nodeValue.trim();

                // добавляем текст соседей внутри того же родителя (первые 4 ребенка)
                if (parent) {
                    const kids = Array.from(parent.childNodes).slice(0,10);
                    combined = kids.map(n => n.nodeValue || (n.textContent ? n.textContent : '')).join(' ').trim();
                }

                let count = parseCountFromString(combined);

                // если не нашли в parent — пробуем соседние текст-узлы (prev/next)
                if (count === null){
                    const prev = textNode.previousSibling;
                    const next = textNode.nextSibling;
                    const s = ((prev && prev.nodeValue)?prev.nodeValue:'') + ' ' + combined + ' ' + ((next && next.nodeValue)?next.nodeValue:'');
                    count = parseCountFromString(s);
                }

                if (count !== null && !isNaN(count)){
                    // решение о цвете
                    let color = COLORS.low;
                    if (count > 10) color = COLORS.high;
                    else if (count >= 5) color = COLORS.mid;

                    // находим ближайший блок-родитель и красим
                    const target = findNearestBlockParent(textNode, 6);
                    if (target){
                        applyStyle(target, color);
                        // также пометим исходный текстовый узел (если он в span)
                        if (textNode.parentElement) {
                            textNode.parentElement.style.setProperty('color', color, 'important');
                        }
                    } else {
                        // fallback: красим parentElement
                        if (textNode.parentElement) applyStyle(textNode.parentElement, color);
                    }
                }
            });
        }catch(e){
            console.warn(`[${plugin_name}] recolor error`, e);
        }
    }

    // дебаунсер
    let timer = null;
    function scheduleRecolor(){
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            recolorSeeders();
        }, 250);
    }

    function startObserver(){
        const observer = new MutationObserver(() => scheduleRecolor());
        observer.observe(document.body, { childList: true, subtree: true });
        // initial run
        scheduleRecolor();
        log('Observer started');
    }

    function register(){
        try{
            if (window.app && app.plugins && typeof app.plugins.add === 'function') {
                app.plugins.add({
                    id: plugin_id,
                    name: plugin_name,
                    version: '1.3',
                    author: 'maxi3219',
                    description: 'Неоновая подсветка Раздают (универсальная)',
                    init: startObserver
                });
                log('registered with app.plugins.add');
            } else {
                // Если Lampa не доступна (например пока страница не инициализирована) — всё равно запускаем observer,
                // потому что мы на странице в браузере и можем работать без интеграции.
                log('app.plugins.add not found — running observer standalone');
                startObserver();
            }
        }catch(err){
            console.error(`[${plugin_name}] register error`, err);
            startObserver();
        }
    }

    // стиль защиты — чтобы не перекрашивать каждый раз уже перекрашенные узлы
    const style = document.createElement('style');
    style.innerHTML = `.maxcolor-applied { transition: color .2s ease, text-shadow .2s ease !important; }`;
    document.head && document.head.appendChild(style);

    // старт
    register();

})();
