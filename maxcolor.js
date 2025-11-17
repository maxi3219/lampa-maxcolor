(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';
    const VERSION = '1.3';
    const COLORS = { low: '#ff3333', mid: '#ffcc00', high: '#00ff00' };
    const BLOCK_RADIUS = '0.9em';
    const GRADIENT_APP_BG = 'linear-gradient(117deg, rgb(0 0 0) 0%, rgb(11 26 35) 50%, rgb(14, 14, 14) 100%)';

    function log(...args){ try{ console.log(`[${plugin_name}][v${VERSION}]`, ...args); }catch(e){} }

    // ========== visual helpers (unchanged) ==========
    function recolorSeedNumbers(){
        document.querySelectorAll('.torrent-item__seeds').forEach(block=>{
            const span = block.querySelector('span'); if(!span) return;
            const num = parseInt(span.textContent); if(isNaN(num)) return;
            let color = COLORS.low;
            if(num > 10) color = COLORS.high;
            else if(num >= 5) color = COLORS.mid;
            span.style.color = color; span.style.fontWeight = 'bold';
        });
    }
    function roundCorners(){
        document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render').forEach(i=>i.style.borderRadius = BLOCK_RADIUS);
        document.querySelectorAll('.watched-history.selector').forEach(i=>i.style.borderRadius = BLOCK_RADIUS);
    }
    function changeBackground(){
        const bg = document.querySelector('.background');
        if(bg){ bg.style.background = GRADIENT_APP_BG; bg.style.setProperty('background', GRADIENT_APP_BG, 'important'); }
        document.querySelectorAll('.settings__content, .selectbox__content.layer--height').forEach(panel=>{
            panel.style.background = 'rgba(33,33,33,0.98)';
            panel.style.setProperty('background','rgba(33,33,33,0.98)','important');
            panel.style.left = '99%'; panel.style.maxHeight = 'calc(100vh - 1.8em)';
            panel.style.setProperty('left','99%','important');
            panel.style.setProperty('max-height','calc(100vh - 1.8em)','important');
        });
    }
    function injectInteractionStyles(){
        const idA = 'maxcolor-interaction-styles', idB = 'maxcolor-static-styles';
        document.getElementById(idA)?.remove(); document.getElementById(idB)?.remove();
        const SHADOW = '0 4px 15px rgb(57 148 188 / 30%)';
        const GR = 'linear-gradient(to right, #9cc1bc, #536976)';
        const cssA = `
            .full-start__button.selector:hover, .full-start__button.selector.focus{
                border-radius:0.5em!important; box-shadow:${SHADOW}!important; background:${GR}!important;
            }
            .selectbox-item.selector:hover, .selectbox-item.selector.focus{ box-shadow:${SHADOW}!important; }
            .settings-folder.selector:hover, .settings-folder.selector.focus{ box-shadow:${SHADOW}!important; }
            .simple-button.simple-button--filter.selector.filter--parser{ display:inline-flex; align-items:center; gap:0.6em; }
        `;
        const cssB = `.torrent-item.selector{ background-color: rgb(68 68 69 / 13%) !important; }`;
        const s1 = document.createElement('style'); s1.id = idA; s1.innerHTML = cssA; document.head.appendChild(s1);
        const s2 = document.createElement('style'); s2.id = idB; s2.innerHTML = cssB; document.head.appendChild(s2);
    }

    // ========== парсеры: подставьте реальные записи по необходимости ==========
    const PARSERS = [
        { title:'Jacred Maxvol Pro', url:'jr.maxvol.pro', url_two:'jr_maxvol_pro', jac_key:'', jac_int:'on', jac_lang:'lg' },
        { title:'62.60.149.237:9117', url:'62.60.149.237:9117', url_two:'62.60.149.237:9117', jac_key:'', jac_int:'', jac_lang:'df' },
        { title:'jacred_xyz', url:'jacred.xyz', url_two:'jacred_xyz', jac_key:'', jac_int:'healthy', jac_lang:'lg' },
        { title:'jacred_ru', url:'jac-red.ru', url_two:'jacred_ru', jac_key:'', jac_int:'', jac_lang:'lg' },
        { title:'No parser', url:'', url_two:'no_parser', jac_key:'', jac_int:'', jac_lang:'lg' }
    ];

    // ====== надёжная работа с Storage (несколько вариантов) ======
    function getStorageApi(){
        if(window.Lampa && Lampa.Storage) return Lampa.Storage;
        if(window.app && app.storage) return app.storage;
        return null;
    }
    function safeSet(key, value){
        try{
            const s = getStorageApi();
            if(s){
                if(typeof s.set === 'function'){ s.set(key, value); log('Storage.set used', key, value); return true; }
                if(typeof s.setItem === 'function'){ s.setItem(key, value); log('storage.setItem used', key, value); return true; }
            }
            // fallback localStorage
            if(window.localStorage){ localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); log('localStorage used', key, value); return true; }
        }catch(e){ log('safeSet error', e); }
        return false;
    }
    function safeGet(key){
        try{
            const s = getStorageApi();
            if(s){
                if(typeof s.get === 'function') return s.get(key);
                if(typeof s.getItem === 'function') return s.getItem(key);
            }
            if(window.localStorage) { const v = localStorage.getItem(key); try{return JSON.parse(v);}catch{ return v; } }
        }catch(e){ log('safeGet error', e); }
        return null;
    }

    function emitStorageEvent(key){
        try{
            // Lampa internal follow/callbacks
            if(window.Lampa && Lampa.Storage && typeof Lampa.Storage.change === 'function'){
                try{ Lampa.Storage.change(key); log('Lampa.Storage.change invoked', key); }catch(e){ log('Lampa.Storage.change failed', e); }
            }
            // CustomEvent for other listeners
            try{ window.dispatchEvent(new CustomEvent('parser_changed', { detail:{ key } })); log('Custom event parser_changed dispatched', key); }catch(e){ log('dispatch parser_changed failed', e); }
            // generic Lampa Storage.follow notify if available
            try{ if(window.Lampa && Lampa.Storage && typeof Lampa.Storage.follow === 'function') Lampa.Storage.follow('change', ()=>{}); }catch(e){}
        }catch(e){ log('emitStorageEvent error', e); }
    }

    // Попытки инициировать обновление списка торрентов разными способами
    function runListUpdateTriggers(){
        log('runListUpdateTriggers start');
        try{
            // 1) стандартные Lampa методы
            if(window.Lampa){
                try{ if(Lampa.Select && typeof Lampa.Select.hide === 'function'){ Lampa.Select.hide(); log('Lampa.Select.hide OK'); } }catch(e){ log('Lampa.Select.hide failed', e); }
                try{ if(Lampa.Select && typeof Lampa.Select.close === 'function'){ Lampa.Select.close(); log('Lampa.Select.close OK'); } }catch(e){ }
                try{ if(Lampa.Controller && typeof Lampa.Controller.update === 'function'){ Lampa.Controller.update(); log('Lampa.Controller.update OK'); } }catch(e){ log('Controller.update failed', e); }
                try{ if(Lampa.Controller && typeof Lampa.Controller.refresh === 'function'){ Lampa.Controller.refresh(); log('Lampa.Controller.refresh OK'); } }catch(e){}
                try{ if(Lampa.Activity && typeof Lampa.Activity.reload === 'function'){ Lampa.Activity.reload(); log('Lampa.Activity.reload OK'); } }catch(e){}
                try{ if(Lampa.Controller && typeof Lampa.Controller.open === 'function'){ /* no-op */ } }catch(e){}
            }
        }catch(e){ log('runListUpdateTriggers step1 error', e); }

        // 2) Симулируем клик по кнопке поиска/фильтра в .torrent-filter
        try{
            const searchBtn = document.querySelector('.torrent-filter .filter--search') || document.querySelector('.filter--search');
            const refreshBtn = document.querySelector('.torrent-filter .filter--back') || document.querySelector('.filter--back');
            if(searchBtn){ try{ searchBtn.click(); log('Clicked .filter--search'); }catch(e){ log('click search failed', e); } }
            // небольшая пауза и повторный клик на refresh/back
            setTimeout(()=>{ if(refreshBtn){ try{ refreshBtn.click(); log('Clicked .filter--back'); }catch(e){ log('click back failed', e); } } }, 250);
        }catch(e){ log('simulate click error', e); }

        // 3) dispatch универсального события, на которое могут подписываться плагины
        try{ window.dispatchEvent(new CustomEvent('LampaParserChanged', { detail: { time: Date.now() } })); log('LampaParserChanged event dispatched'); }catch(e){ log('dispatch LampaParserChanged failed', e); }

        // 4) history.back (если Select открыт)
        try{ if(window.history && typeof history.back === 'function'){ setTimeout(()=>{ history.back(); log('history.back called'); }, 300); } }catch(e){ log('history.back failed', e); }

        // 5) ещё попытки обращений к контроллерам / меню
        try{
            if(window.Lampa){
                try{ if(Lampa.Menu && typeof Lampa.Menu.toggle === 'function'){ Lampa.Menu.toggle(); log('Lampa.Menu.toggle called'); setTimeout(()=>Lampa.Menu.toggle(), 200); } }catch(e){}
                try{ if(Lampa.Controller && typeof Lampa.Controller.toggle === 'function'){ Lampa.Controller.toggle(); log('Lampa.Controller.toggle called'); setTimeout(()=>Lampa.Controller.toggle(), 200); } }catch(e){}
            }
        }catch(e){ log('final triggers failed', e); }
    }

    // ====== UI: вставляем кнопку парсеров в .torrent-filter ======
    function getCurrentParserTitle(){
        try{
            const key = safeGet('parser_torrent_type') || safeGet('parser') || '';
            if(!key) return 'Авто';
            const p = PARSERS.find(x => x.url_two === key || x.url === key);
            return p ? p.title : 'Выбран';
        }catch(e){ return 'Авто'; }
    }

    function injectParserButton(){
        try{
            const container = document.querySelector('.torrent-filter');
            if(!container) return;
            if(container.querySelector('.filter--parser')) return;

            const btn = document.createElement('div');
            btn.className = 'simple-button simple-button--filter filter--parser selector';
            btn.setAttribute('data-name','parser_selector');

            const icon = document.createElement('div');
            icon.style.width='1.05em'; icon.style.height='1.05em'; icon.style.display='inline-block';
            icon.style.borderRadius='0.2em'; icon.style.background='linear-gradient(90deg,#d99821,#e8b84f)';
            icon.style.flex='0 0 auto'; icon.style.marginRight='0.5em';
            btn.appendChild(icon);

            const spanTitle = document.createElement('span'); spanTitle.textContent = 'Парсер'; btn.appendChild(spanTitle);
            const divCurrent = document.createElement('div'); divCurrent.textContent = getCurrentParserTitle(); btn.appendChild(divCurrent);

            const ref = container.querySelector('.filter--filter');
            if(ref && ref.parentNode) ref.parentNode.insertBefore(btn, ref.nextSibling); else container.appendChild(btn);

            btn.addEventListener('click', e=>{ e.stopPropagation(); openParserSelectMenu(); });

            // обновляем текст при изменении Storage
            try{
                if(window.Lampa && Lampa.Storage && typeof Lampa.Storage.follow === 'function'){
                    Lampa.Storage.follow('change', ()=>{ const el = document.querySelector('.filter--parser > div:last-child'); if(el) el.textContent = getCurrentParserTitle(); });
                }
            }catch(e){}

            log('Parser button injected');
        }catch(e){ log('injectParserButton error', e); }
    }

    // ====== открытие меню выбора (Lampa.Select) и обработка выбора ======
    function openParserSelectMenu(){
        try{
            if(window.Lampa && Lampa.Select && typeof Lampa.Select.show === 'function'){
                const items = PARSERS.map(p=>({
                    title: p.title,
                    url: p.url,
                    url_two: p.url_two,
                    jac_key: p.jac_key,
                    jac_int: p.jac_int,
                    jac_lang: p.jac_lang
                }));

                Lampa.Select.show({
                    title: 'Выбрать парсер',
                    items: items,
                    onBack: function(){ log('Select onBack'); try{ if(Lampa.Select && Lampa.Select.hide) Lampa.Select.hide(); }catch(e){} },
                    onSelect: function(item){
                        log('onSelect item', item);
                        // 1) Сохраняем сразу в нескольких вариантах
                        try{
                            safeSet('jackett_url', item.url || '');
                            safeSet('parser_torrent_type', item.url_two || '');
                            safeSet('jackett_key', item.jac_key || '');
                            safeSet('jackett_interview', item.jac_int || '');
                            safeSet('parse_lang', item.jac_lang || 'lg');
                            safeSet('parser_use', true);
                            log('Saved to storage', item.url_two);
                        }catch(e){ log('save error', e); }

                        // 2) Немедленно уведомляем подписчиков
                        try{ emitStorageEvent('parser_torrent_type'); }catch(e){ log('emitStorageEvent error', e); }

                        // 3) Выполняем набор триггеров для обновления
                        setTimeout(()=>{ runListUpdateTriggers(); }, 80);

                        // 4) Закрываем Select и обновляем подпись на кнопке
                        try{ if(Lampa.Select && Lampa.Select.hide) Lampa.Select.hide(); }catch(e){}
                        setTimeout(()=>{ const el = document.querySelector('.filter--parser > div:last-child'); if(el) el.textContent = getCurrentParserTitle(); }, 300);

                        // 5) для отладки: печатаем состояние Storage через 400ms
                        setTimeout(()=>{ try{ log('post-select storage parser_torrent_type=', safeGet('parser_torrent_type')); }catch(e){} }, 420);
                    }
                });
            } else {
                alert('Меню выбора парсеров доступно только внутри Lampa');
                log('Lampa.Select not found');
            }
        }catch(e){ log('openParserSelectMenu error', e); }
    }

    // ====== observer и init ======
    function applyAll(){
        recolorSeedNumbers(); roundCorners(); changeBackground(); injectInteractionStyles(); injectParserButton();
    }

    function startObserver(){
        applyAll();
        const obs = new MutationObserver(debounce(applyAll, 120));
        obs.observe(document.body, { childList:true, subtree:true });
        log('Observer started');
    }

    function debounce(fn, ms){ let t = null; return function(){ clearTimeout(t); t = setTimeout(()=>fn.apply(this, arguments), ms); }; }

    function register(){
        if(window.app && app.plugins && typeof app.plugins.add === 'function'){
            app.plugins.add({
                id: plugin_id, name: plugin_name, version: VERSION, author: 'maxi3219',
                description: 'MaxColor + parser selector with aggressive refresh triggers',
                init: startObserver
            });
            log('Registered with Lampa/app.plugins');
        } else {
            log('Standalone mode - starting observer');
            startObserver();
        }
    }

    register();
})();
