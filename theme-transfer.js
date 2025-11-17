(function () {
    'use strict';

    // Название плагина
    var plugin_name = 'colorTheme';

    // Регистрируем плагин
    Lampa.Plugin.add(plugin_name, {
        title: 'Color Theme',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0 0 18h9a9 9 0 0 0-9-18z"/></svg>',
        category: 'interface',
        onStart: function () {
            // Добавляем кастомные стили
            addCustomStyles();
        },
        onStop: function () {
            // Удаляем стили при отключении
            removeCustomStyles();
        }
    });

    // Функция добавления стилей
    function addCustomStyles() {
        let style = document.createElement('style');
        style.id = 'colorTheme-style';
        style.textContent = `
            /* Основной фон */
            body, .app, .background {
                background-color: #121212 !important;
                color: #e0e0e0 !important;
            }

            /* Активные элементы меню */
            .menu__item.active, .menu__item:hover {
                background-color: #1e88e5 !important;
                color: #ffffff !important;
            }

            /* Заголовки */
            .head__title, .card__title {
                color: #90caf9 !important;
            }

            /* Кнопки */
            .button, .selector {
                background-color: #1e1e1e !important;
                border: 1px solid #1e88e5 !important;
                color: #e0e0e0 !important;
            }

            .button:hover, .selector:hover {
                background-color: #1e88e5 !important;
                color: #ffffff !important;
            }

            /* Сидеры и прогресс-бары */
            .progress__bar {
                background-color: #1e88e5 !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Функция удаления стилей
    function removeCustomStyles() {
        let style = document.getElementById('colorTheme-style');
        if (style) style.remove();
    }
})();
