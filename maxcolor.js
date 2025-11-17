// ==UserScript==
// @name         Lampa Custom UI
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Кастомизация Lampa: фон, скругления, прозрачность меню, подсветка раздающих, смещение меню
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const style = document.createElement('style');
    style.innerHTML = `
        /* Смена фона — оставляем градиент как у тебя */
        body {
            background: linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%) !important;
        }

        /* Скругление углов у торрентов */
        .content .torrent {
            border-radius: 1em !important;
        }

        /* Прозрачность подложки меню */
        .settings__content {
            background: rgba(33, 33, 33, 0.98) !important;
        }

        /* Подсветка раздающих */
        .torrent .torrent-seeder {
            color: #ffcc00 !important;
        }

        /* Смещение меню вправо и отступы */
        @media screen and (min-width: 481px) {
            .settings__content {
                top: 1em;
                left: 99%;
                bottom: 1em;
                max-height: calc(100vh - 2em);
                overflow-y: auto;
                border-radius: 1.2em;
                box-shadow: 0 8px 24px rgb(0 0 0 / 80%);
                padding: 0.5em;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
        }
    `;
    document.head.appendChild(style);
})();
