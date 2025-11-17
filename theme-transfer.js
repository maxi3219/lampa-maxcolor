(function () {
    'use strict';

    var plugin_name = 'colorTheme';

    Lampa.Plugin.add(plugin_name, {
        title: 'Color Theme',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0 0 18h9a9 9 0 0 0-9-18z"/></svg>',
        category: 'interface',
        onStart: function () {
            injectStyles();
        },
        onStop: function () {
            removeStyles();
        }
    });

    function injectStyles() {
        let style = document.createElement('style');
        style.id = 'colorTheme-style';
        style.textContent = `
            /* Основной фон */
            body, .app, .background, .layer, .content {
                background-color: #121212 !important;
                color: #e0e0e0 !important;
            }

            /* Меню */
            .menu__item {
                background-color: transparent !important;
                color: #b0bec5 !important;
            }
            .menu__item.active, .menu__item:hover {
                background-color: #1e88e5 !important;
                color: #ffffff !important;
            }

            /* Заголовки */
            .head__title, .card__title, .card__subtitle {
                color: #90caf9 !important;
            }

            /* Кнопки */
            .button, .selector, .filter__item {
                background-color: #1e1e1e !important;
                border: 1px solid #1e88e5 !important;
                color: #e0e0e0 !important;
            }
            .button:hover, .selector:hover, .filter__item:hover {
                background-color: #1e88e5 !important;
                color: #ffffff !important;
            }

            /* Прогресс-бары */
            .progress__bar, .timeline__progress {
                background-color: #1e88e5 !important;
            }
        `;
        document.head.appendChild(style);
    }

    function removeStyles() {
        let style = document.getElementById('colorTheme-style');
        if (style) style.remove();
    }
})();
