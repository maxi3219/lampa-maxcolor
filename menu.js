(() => {
    const plugin_id = 'roundedmenu';
    const plugin_name = 'RoundedMenu';

    function log(...args) {
        try { console.log(`[${plugin_name}]`, ...args); } catch (e) {}
    }

    function applyCustomStyles() {
        const style = document.createElement('style');
        style.id = 'custom-rounded-settings-style';
        style.innerHTML = `
            @media screen and (min-width: 480px) {
                .settings__content,
                .selectbox__content {
                    position: fixed !important;
                    top: 1em !important;
                    right: 1em !important;
                    left: auto !important;
                    width: 35% !important;
                    max-height: calc(100vh - 2em) !important;
                    overflow-y: auto !important;
                    background: rgba(26, 42, 58, 0.98) !important;
                    border-radius: 1.2em !important;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8) !important;
                    padding: 0.5em !important;
                    display: flex !important;
                    flex-direction: column !important;
                    transform: translateX(100%) !important;
                    transition: transform 0.3s ease !important;
                    z-index: 999 !important;
                }

                body.settings--open .settings__content,
                body.selectbox--open .selectbox__content {
                    transform: translateX(0) !important;
                }
            }
        `;
        document.head.appendChild(style);
        log('Custom styles applied');
    }

    function initPlugin() {
        if (window.Lampa && typeof Lampa.Listener === 'object') {
            Lampa.Listener.follow('app', function(event){
                if(event.type === 'ready'){
                    applyCustomStyles();
                }
            });
            log('Lampa listener attached');
        } else {
            document.addEventListener('DOMContentLoaded', applyCustomStyles);
            log('Standalone mode');
        }
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.2',
                author: 'maxi3219',
                description: 'Скруглённое меню и источник с отступом от правого края, скрытые по умолчанию',
                init: initPlugin
            });
            log('Registered with Lampa');
        } else {
            initPlugin();
        }
    }

    register();
})();
