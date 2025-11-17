(function () {
    'use strict';

    Lampa.Plugin.add('colorTheme', {
        title: 'Color Theme',
        category: 'interface',
        onStart: function () {
            let style = document.createElement('style');
            style.id = 'colorTheme-style';
            style.textContent = `
                body, .app, .background, .layer, .content {
                    background-color: #121212 !important;
                    color: #e0e0e0 !important;
                }
                .menu__item.active, .menu__item:hover {
                    background-color: #1e88e5 !important;
                    color: #ffffff !important;
                }
            `;
            document.head.appendChild(style);
        },
        onStop: function () {
            let style = document.getElementById('colorTheme-style');
            if (style) style.remove();
        }
    });
})();
