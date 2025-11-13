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
                /* Окно настроек и selectbox */
                .settings__content,
                .selectbox__content {
                    position: fixed !important;
                    top: 1em !important;
                    right: 1em !important;
                    left: auto !important;
                    width: 35% !important;
                    max-height: calc(100vh - 2em) !important;
                    overflow-y: auto !important;
                    background: rgba(54,54,54,.959) !important; /* новый фон */
                    border-radius: 1.2em !important;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8) !important;
                    padding: 0.5em !important;
                    display: flex !important;
                    flex-direction: column !important;
                    transform: translateX(100%) !important;
                    transition: transform 0.3s ease, opacity 0.3s ease !important;
                    z-index: 999 !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                }

                body.settings--open .settings__content,
                body.selectbox--open .selectbox__content {
                    transform: translateX(0) !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }

                /* Пункты меню всегда скруглены */
                .settings-folder.selector {
                    border-radius: 1em !important;
                    margin-bottom: 0.3em !important;
                    transition: background 0.25s ease !important; /* убрали анимацию скругления */
                }

                /* Активные состояния: только фон-градиент */
                .settings-folder.selector.focus,
                .settings-folder.selector.hover,
                .settings-folder.selector.traverse {
                    background: linear-gradient(to right, #60ffbd 1%, #62a3c9 100%) !important;
                    background: -webkit-linear-gradient(left, #60ffbd 1%, #62a3c9 100%) !important;
                    background: -o-linear-gradient(left, #60ffbd 1%, #62a3c9 100%) !important;
                    background: -webkit-gradient(linear, left top, right top, color-stop(1%, #60ffbd), to(#62a3c9)) !important;
                    border-radius: 1em !important;
                    /* цвет текста не меняем, остаётся как по умолчанию */
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
                version: '1.9',
                author: 'maxi3219',
                description: 'Скруглённые пункты меню без смены цвета текста и новый фон',
                init: initPlugin
            });
            log('Registered with Lampa');
        } else {
            initPlugin();
        }
    }

    register();
})();
