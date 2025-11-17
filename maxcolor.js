(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';
    const VERSION = '1.4';
    const COLORS = { low: '#ff3333', mid: '#ffcc00', high: '#00ff00' };
    const BLOCK_RADIUS = '0.9em';
    const GRADIENT_APP_BG = 'linear-gradient(117deg, rgb(0 0 0) 0%, rgb(11 26 35) 50%, rgb(14, 14, 14) 100%)';
    function log(...a){ try{ console.log(`[${plugin_name}][v${VERSION}]`, ...a); }catch(e){} }

    // --- визуальные функции (как раньше) ---
    function recolorSeedNumbers(){ document.querySelectorAll('.torrent-item__seeds').forEach(b=>{ const s=b.querySelector('span'); if(!s) return; const n=parseInt(s.textContent); if(isNaN(n)) return; s.style.color = n>10?COLORS.high:(n>=5?COLORS.mid:COLORS.low); s.style.fontWeight='bold'; }); }
    function roundCorners(){ document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render').forEach(i=>i.style.borderRadius=BLOCK_RADIUS); document.querySelectorAll('.watched-history.selector').forEach(i=>i.style.borderRadius=BLOCK_RADIUS); }
    function changeBackground(){ const bg=document.querySelector('.background'); if(bg){ bg.style.background=GRADIENT_APP_BG; bg.style.setProperty('background', GRADIENT_APP_BG, 'important'); } document.querySelectorAll('.settings__content, .selectbox__content.layer--height').forEach(p=>{ p.style.background='rgba(33,33,33,0.98)'; p.style.setProperty('background','rgba(33,33,33,0.98)','important'); p.style.left='99%'; p.style.maxHeight='calc(100vh - 1.8em)'; p.style.setProperty('left','99%','important'); p.style.setProperty('max-height','calc(100vh - 1.8em)','important'); }); }
    function injectInteractionStyles(){ const id='maxcolor-style'; document.getElementById(id)?.remove(); const css = `
        .simple-button.simple-button--filter.selector.filter--parser{ display:inline-flex; align-items:center; gap:0.6em; }
        .torrent-item.selector{ background-color: rgb(68 68 69 / 13%) !important; }
    `; const s=document.createElement('style'); s.id=id; s.innerHTML=css; document.head.appendChild(s); }

    // --- парсеры (пример) ---
    const PARSERS = [
        { title:'Jacred Maxvol Pro', url:'jr.maxvol.pro', url_two:'jr_maxvol_pro', jac_key:'', jac_int:'on', jac_lang:'lg' },
        { title:'62.60.149.237:9117', url:'62.60.149.237:9117', url_two:'62.60.149.237:9117', jac_key:'', jac_int:'', jac_lang:'df' },
        { title:'jacred_xyz', url:'jacred.xyz', url_two:'jacred_xyz', jac_key:'', jac_int:'healthy', jac_lang:'lg' },
        { title:'No parser', url:'', url_two:'no_parser', jac_key:'', jac_int:'', jac_lang:'lg' }
    ];

    // --- storage helpers ---
    function getStorageApi(){ if(window.Lampa && Lampa.Storage) return Lampa.Storage; if(window.app && app.storage) return app.storage; return null; }
    function safeSet(key,val){ try{ const s=getStorageApi(); if(s){ if(typeof s.set==='function'){ s.set(key,val); return true; } if(typeof s.setItem==='function'){ s.setItem(key,val); return true; } } if(window.localStorage){ localStorage.setItem(key, typeof val==='string'?val:JSON.stringify(val)); return true; } }catch(e){ log('safeSet',e); } return false; }
    function safeGet(key){ try{ const s=getStorageApi(); if(s){ if(typeof s.get==='function') return s.get(key); if(typeof s.getItem==='function') return s.getItem(key); } if(window.localStorage){ const v=localStorage.getItem(key); try{ return JSON.parse(v); }catch{ return v; } } }catch(e){ log('safeGet',e); } return null; }

    // --- вспомогательные триггеры обновления ---
    function emitEvents(){ try{ if(window.Lampa && Lampa.Select && typeof Lampa.Select.hide==='function') Lampa.Select.hide(); }catch(e){ } try{ window.dispatchEvent(new CustomEvent('parser_changed',{detail:{time:Date.now()}})); }catch(e){} try{ if(window.Lampa && Lampa.Controller){ if(typeof Lampa.Controller.refresh==='function') Lampa.Controller.refresh(); if(typeof Lampa.Controller.update==='function') Lampa.Controller.update(); } }catch(e){} // симулируем клик обновления списка (если есть)
        try{ const refresh = document.querySelector('.torrent-filter .filter--back') || document.querySelector('.filter--back'); if(refresh) refresh.click(); }catch(e){}
    }

    // --- сохраняем состояние перед открытием выбора парсера и возвращаемся после выбора ---
    let _savedController = null; // { name, id, params } или null

    function saveCurrentState(){
        try{
            if(window.Lampa && Lampa.Controller){
                const name = typeof Lampa.Controller.activeName === 'function' ? Lampa.Controller.activeName() : null;
                const id = typeof Lampa.Controller.activeId === 'function' ? Lampa.Controller.activeId() : null;
                _savedController = { name: name || null, id: id || null };
                log('saved controller', _savedController);
                return;
            }
            // fallback: try read from DOM (movie page markers)
            _savedController = null;
        }catch(e){ log('saveCurrentState error', e); _savedController = null; }
    }

    function restoreSavedState(){
        try{
            log('restoreSavedState', _savedController);
            if(!_savedController) return tryHistoryBack(); // fallback

            // пытаемся открыть тот же контроллер + id
            if(window.Lampa && Lampa.Controller && typeof Lampa.Controller.open === 'function'){
                try{
                    // Lampa.Controller.open может принимать (name) или (name, id)
                    if(_savedController.id) Lampa.Controller.open(_savedController.name, _savedController.id);
                    else Lampa.Controller.open(_savedController.name);
                    log('Lampa.Controller.open called', _savedController);
                    // даём время на открытие, затем триггерим обновления
                    setTimeout(()=>{ emitEvents(); }, 400);
                    return;
                }catch(e){ log('Lampa.Controller.open failed', e); }
            }

            // если ничего не получилось — делаем history.back (обычно возвращает на страницу фильма)
            tryHistoryBack();
        }catch(e){ log('restoreSavedState error', e); }
    }

    function tryHistoryBack(){
        try{ if(window.history && typeof history.back === 'function'){ history.back(); log('history.back called'); setTimeout(()=>{ emitEvents(); }, 350); } }catch(e){ log('history.back failed', e); }
    }

    // --- UI: вставка кнопки выбора парсеров ---
    function getCurrentParserTitle(){ try{ const k = safeGet('parser_torrent_type') || safeGet('parser') || ''; if(!k) return 'Авто'; const p = PARSERS.find(x=>x.url_two===k||x.url===k); return p? p.title : 'Выбран'; }catch(e){ return 'Авто'; } }

    function injectParserButton(){
        try{
            const container = document.querySelector('.torrent-filter');
            if(!container) return;
            if(container.querySelector('.filter--parser')) return;

            const btn = document.createElement('div');
            btn.className = 'simple-button simple-button--filter filter--parser selector';
            btn.setAttribute('data-name','parser_selector');

            const icon = document.createElement('div');
            icon.style.width='1.05em'; icon.style.height='1.05em'; icon.style.display='inline-block'; icon.style.borderRadius='0.2em';
            icon.style.background='linear-gradient(90deg,#d99821,#e8b84f)'; icon.style.marginRight='0.5em';
            btn.appendChild(icon);

            const span = document.createElement('span'); span.textContent='Парсер'; btn.appendChild(span);
            const cur = document.createElement('div'); cur.textContent=getCurrentParserTitle(); btn.appendChild(cur);

            const ref = container.querySelector('.filter--filter');
            if(ref && ref.parentNode) ref.parentNode.insertBefore(btn, ref.nextSibling); else container.appendChild(btn);

            // запоминаем состояние до открытия окна выбора парсера
            btn.addEventListener('click', e=>{
                e.stopPropagation();
                saveCurrentState();
                openParserSelectMenu();
            });

            // обновление подписи при изменении Storage (если Lampa предоставляет follow)
            try{ if(window.Lampa && Lampa.Storage && typeof Lampa.Storage.follow === 'function'){ Lampa.Storage.follow('change', ()=>{ const el=document.querySelector('.filter--parser > div:last-child'); if(el) el.textContent=getCurrentParserTitle(); }); } }catch(e){}

            log('parser button injected');
        }catch(e){ log('injectParserButton error', e); }
    }

    // --- открытие меню и обработка выбора (с возвратом на сохранённую страницу) ---
    function openParserSelectMenu(){
        try{
            if(window.Lampa && Lampa.Select && typeof Lampa.Select.show === 'function'){
                const items = PARSERS.map(p=>({ title:p.title, url:p.url, url_two:p.url_two, jac_key:p.jac_key, jac_int:p.jac_int, jac_lang:p.jac_lang }));
                Lampa.Select.show({
                    title: 'Выбрать парсер',
                    items: items,
                    onBack: function(){ log('parser select onBack'); try{ if(Lampa.Select && Lampa.Select.hide) Lampa.Select.hide(); }catch(e){} },
                    onSelect: function(item){
                        log('parser selected', item);
                        // записываем настройки
                        try{
                            safeSet('jackett_url', item.url || '');
                            safeSet('parser_torrent_type', item.url_two || '');
                            safeSet('jackett_key', item.jac_key || '');
                            safeSet('jackett_interview', item.jac_int || '');
                            safeSet('parse_lang', item.jac_lang || 'lg');
                            safeSet('parser_use', true);
                        }catch(e){ log('save error', e); }

                        // уведомляем подписчиков и триггеры обновления
                        try{ window.dispatchEvent(new CustomEvent('parser_changed',{detail:{item}})); }catch(e){}
                        try{ if(window.Lampa && Lampa.Storage && typeof Lampa.Storage.change === 'function') Lampa.Storage.change('parser_torrent_type'); }catch(e){}

                        // закрываем Select
                        try{ if(Lampa.Select && Lampa.Select.hide) Lampa.Select.hide(); }catch(e){}

                        // Восстанавливаем страницу фильма и инициируем обновление списка торрентов
                        setTimeout(()=>{ restoreSavedState(); }, 220);

                        // апдейт подписи кнопки
                        setTimeout(()=>{ const el=document.querySelector('.filter--parser > div:last-child'); if(el) el.textContent=getCurrentParserTitle(); }, 600);
                    }
                });
            } else {
                alert('Меню выбора парсеров доступно только внутри Lampa');
                log('Lampa.Select not found');
            }
        }catch(e){ log('openParserSelectMenu error', e); }
    }

    // --- observer и init ---
    function applyAll(){ recolorSeedNumbers(); roundCorners(); changeBackground(); injectInteractionStyles(); injectParserButton(); }
    function startObserver(){ applyAll(); const obs = new MutationObserver(debounce(applyAll, 120)); obs.observe(document.body, { childList:true, subtree:true }); log('Observer started'); }
    function debounce(fn,ms){ let t=null; return function(){ clearTimeout(t); t=setTimeout(()=>fn.apply(this,arguments), ms); }; }

    function register(){
        if(window.app && app.plugins && typeof app.plugins.add === 'function'){
            app.plugins.add({ id: plugin_id, name: plugin_name, version: VERSION, author: 'maxi3219', description: 'MaxColor + parser selector (restore movie page after select)', init: startObserver });
            log('Registered with app.plugins');
        } else { log('Standalone mode'); startObserver(); }
    }

    register();
})();
