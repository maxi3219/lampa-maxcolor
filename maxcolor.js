(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    const COLORS = { low: '#ff3333', mid: '#ffcc00', high: '#00ff00' };
    const BLOCK_RADIUS = '0.9em';
    const ACTIVE_RADIUS = '0.6em';
    const GRADIENT = 'linear-gradient(117deg, rgb(0 0 0) 0%, rgb(11 26 35) 50%, rgb(14, 14, 14) 100%)';

    function log(...a) { try { console.log(`[${plugin_name}]`, ...a); } catch(e){} }

    function recolorSeedNumbers() {
        document.querySelectorAll('.torrent-item__seeds').forEach(block=>{
            const span = block.querySelector('span'); if(!span) return;
            const num = parseInt(span.textContent); if(isNaN(num)) return;
            let color = COLORS.low; if(num>10) color=COLORS.high; else if(num>=5) color=COLORS.mid;
            span.style.color=color; span.style.fontWeight='bold';
        });
    }

    function roundCorners() {
        document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render').forEach(i=>i.style.borderRadius=BLOCK_RADIUS);
        document.querySelectorAll('.watched-history.selector').forEach(i=>i.style.borderRadius=BLOCK_RADIUS);
    }

    function changeBackground() {
        const bg=document.querySelector('.background'); if(bg){
            bg.style.background=GRADIENT;
            bg.style.setProperty('background',GRADIENT,'important');
        }
    }

    function enforceButtonsRadius(){
        const styleId='maxcolor-button-states'; if(document.getElementById(styleId)) return;
        const style=document.createElement('style'); style.id=styleId;
        style.textContent=`
            .full-start-new__buttons .full-start__button{transition:border-radius 0.2s ease;}
            .full-start-new__buttons .full-start__button:hover,
            .full-start-new__buttons .full-start__button:focus,
            .full-start-new__buttons .full-start__button.focus,
            .full-start-new__buttons .full-start__button.active,
            .full-start-new__buttons .full-start__button.layer--focus,
            .full-start-new__buttons.layer--focus .full-start__button.selector{
                border-radius: ${ACTIVE_RADIUS} !important;
            }
        `;
        document.head.appendChild(style);
    }

    function injectMenuCSS(){
        if(document.getElementById('maxcolor-menu-fix')) return;
        const style=document.createElement('style'); style.id='maxcolor-menu-fix';
        style.textContent=`
            .selectbox__content.layer--height,
            .settings__content{
                position: fixed !important;
                box-sizing: border-box !important;
                top: 1.5em !important;
                bottom: 1.5em !important;
                right: 1.5em !important;
                left: auto !important;
                inset: 1.5em 1.5em 1.5em auto !important;
                width: 36% !important;
                max-width: 42em !important;
                padding: 1em !important;
                padding-bottom: 5em !important;
                border-radius: 1.2em !important;
                background: rgba(33,33,33,0.98) !important;
                height: auto !important;
                max-height: calc(100vh - 3em) !important;
                overflow: hidden !important;
                display: flex !important;
                flex-direction: column !important;
                z-index: 99999 !important;
            }

            .scroll__body::after{content:""!important; display:block!important; height:4.5em!important; pointer-events:none!important;}
            .scroll__body, .scroll, .scroll__content{height:auto!important; max-height:none!important; overflow-y:auto!important; -webkit-overflow-scrolling:touch!important;}
            .selector, .settings-folder.selector{scroll-margin-bottom:6.5em !important;}
        `;
        document.head.appendChild(style);
    }

    function adjustPanelsInline(){
        document.querySelectorAll('.selectbox__content.layer--height, .settings__content').forEach(panel=>{
            if(!panel) return;
            try{
                panel.style.setProperty('height','auto','important');
                panel.style.setProperty('max-height','calc(100vh - 3em)','important');
                panel.style.setProperty('top','1.5em','important');
                panel.style.setProperty('bottom','1.5em','important');
                panel.style.setProperty('right','1.5em','important');
                panel.style.setProperty('left','auto','important');
                panel.style.setProperty('width','36%','important');
                panel.style.setProperty('max-width','42em','important');
                panel.style.setProperty('box-sizing','border-box','important');
                panel.style.setProperty('padding','1em','important');
                panel.style.setProperty('padding-bottom','5em','important');
                panel.style.setProperty('overflow-x','hidden','important');

                panel.querySelectorAll('.scroll__body').forEach(sb=>{
                    sb.style.setProperty('height','auto','important');
                    sb.style.setProperty('max-height','none','important');
                    if(!sb.querySelector('#maxcolor-scroll-spacer')){
                        const spacer=document.createElement('div'); spacer.id='maxcolor-scroll-spacer';
                        spacer.style.height='6.5em'; spacer.style.minHeight='6.5em'; spacer.style.flexShrink='0'; spacer.style.pointerEvents='none';
                        sb.appendChild(spacer);
                    }
                });
            }catch(e){log('adjustPanelsInline',e);}
        });
    }

    function applyAll(){
        recolorSeedNumbers();
        roundCorners();
        changeBackground();
        enforceButtonsRadius();
        injectMenuCSS();
        adjustPanelsInline();
    }

    function startObserver(){
        try{
            applyAll();
            const obs=new MutationObserver(mutations=>{
                try{ applyAll(); }catch(e){ log('Observer inner',e);}
            });
            obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
            log('Observer started (v5.2)');
        }catch(e){ log('startObserver',e);}
    }

    function register(){
        if(window.app && app.plugins && typeof app.plugins.add==='function'){
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '5.2',
                author: 'maxi3219',
                description: 'Safe menu fix (right offset, equal top/bottom, prevent clipping with remote, preserve Lampa)',
                init: startObserver
            });
            log('Registered with Lampa');
        }else{
            log('Standalone mode');
            startObserver();
        }
    }

    register();
})();
