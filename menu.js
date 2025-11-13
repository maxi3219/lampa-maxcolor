(() => {
    const plugin_id = 'roundedmenu';
    const plugin_name = 'RoundedMenu';

    function log(...args) {
        try { console.log(`[${plugin_name}]`, ...args); } catch (e) {}
    }

    function injectStyles() {
        if (document.getElementById('custom-rounded-settings-style')) return;

        const style = document.createElement('style');
        style.id = 'custom-rounded-settings-style';
        style.innerHTML = `
            @media screen and (min-width: 480px) {
                /* ✅ Окно настроек и selectbox */
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

                /* ✅ Меню слева */
                .wrap__left {
                    position: fixed !important;
                    top: 0 !important;
                    left: 1em !important;
                    width: 22em !important;
                    max-height: calc(100vh - 2em) !important;
                    z-index: 1 !important;
                    pointer-events: auto !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                }

                .menu {
                    width: 100% !important;
                    max-width: 15em !important;
                    border-radius: 1.2em !important;
                    margin: -2em 0 0 1em !important;
                    background: rgba(54, 54, 54, 0.959) !important;
                    border: 1px solid rgba(255, 255, 255, 0.082) !important;
                    padding: 0 !important;
                }

                /* ✅ Пункты меню */
                .menu__item {
                    border-radius: 0.6em !important;
                    margin-bottom: 0.3em !important;
                    transition: background 0.3s ease, border-radius 0.3s ease !important;
                }

                .menu__item.focus,
                .menu__item.hover,
                .menu__item.traverse {
                    background: linear-gradient(to right, #60ffbd 1%, #62a3c9 100%) !important;
                    background: -webkit-linear-gradient(left, #60ffbd 1%, #62a3c9 100%) !important;
                    background: -o-linear-gradient(left, #60ffbd 1%, #62a3c9 100%) !important;
                    background: -webkit-gradient(linear, left top, right top, color-stop(1%, #60ffbd), to(#62a3c9)) !important;
                    color: #1b1b1b !important;
                    border-radius: 1em !important;
                }
            }
        `;
        document.head.appendChild(style);
        log('Custom styles injected');
    }

    function observeMenu() {
        const observer = new MutationObserver(() => {
            const menu = document.querySelector('.menu');
            if (menu) injectStyles();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        log('MutationObserver watching for menu');
    }

    function initPlugin() {
        observeMenu();
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '2.0',
                author: 'maxi3219',
                description: 'Кастомное меню: фон, градиент, скругление, отступы',
                init: initPlugin
            });
            log('Registered with Lampa');
        } else {
            initPlugin();
        }
    }

    register();
})();
