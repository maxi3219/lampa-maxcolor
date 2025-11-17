(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    const COLORS = {
        low: '#ff3333',
        mid: '#ffcc00',
        high: '#00ff00'
    };

    const BLOCK_RADIUS = '0.9em';
    const GRADIENT_APP_BG = 'linear-gradient(117deg, rgb(0 0 0) 0%, rgb(11 26 35) 50%, rgb(14, 14, 14) 100%)';

    function log(...a) {
        try { console.log(`[${plugin_name}]`, ...a); } catch (e) {}
    }

    // Окраска сидов
    function recolorSeedNumbers() {
        document.querySelectorAll('.torrent-item__seeds').forEach(block => {
            const span = block.querySelector('span');
            if (!span) return;
            const num = parseInt(span.textContent);
            if (isNaN(num)) return;

            let color = COLORS.low;
            if (num > 10) color = COLORS.high;
            else if (num >= 5) color = COLORS.mid;

            span.style.color = color;
            span.style.fontWeight = 'bold';
        });
    }

    // Скругления блоков
    function roundCorners() {
        document.querySelectorAll('.torrent-item.selector.layer--visible.layer--render')
            .forEach(item => item.style.borderRadius = BLOCK_RADIUS);
        document.querySelectorAll('.watched-history.selector')
            .forEach(item => item.style.borderRadius = BLOCK_RADIUS);
    }

    // Фон подложки приложения и прозрачность меню
    function changeBackground() {
        const backgroundBlock = document.querySelector('.background');
        if (backgroundBlock) {
            backgroundBlock.style.background = GRADIENT_APP_BG;
            backgroundBlock.style.setProperty('background', GRADIENT_APP_BG, 'important');
        }

        // Прозрачность подложки меню и кастомные стили
        document.querySelectorAll('.settings__content, .selectbox__content.layer--height').forEach(panel => {
            // Общий стиль для обоих
            panel.style.background = 'rgba(33,33,33,0.98)';
            panel.style.setProperty('background', 'rgba(33,33,33,0.98)', 'important');

            // Стили для .settings__content
            if (panel.classList.contains('settings__content')) {
                panel.style.left = '99%';
                panel.style.maxHeight = 'calc(100vh - 1.8em)';
                panel.style.setProperty('left', '99%', 'important');
                panel.style.setProperty('max-height', 'calc(100vh - 1.8em)', 'important');
            }
            // Стили для .selectbox__content
            else if (panel.classList.contains('selectbox__content')) {
                panel.style.left = '99%';
                panel.style.maxHeight = 'calc(100vh - 1.8em)';
                panel.style.setProperty('left', '99%', 'important');
                panel.style.setProperty('max-height', 'calc(100vh - 1.8em)', 'important');
            }
        });
    }

    // Внедрение стилей для :hover и .focus
    function injectInteractionStyles() {
        const styleId = 'maxcolor-interaction-styles';
        const staticStyleId = 'maxcolor-static-styles';
        
        // Удаляем старые стили, если они были
        document.getElementById(styleId)?.remove();
        document.getElementById(staticStyleId)?.remove();

        // --- ПРАВИЛА ВЗАИМОДЕЙСТВИЯ (:hover, .focus) ---
        const SHADOW_COLOR = '0 4px 15px rgb(57 148 188 / 30%)';
        const GRADIENT_HOVER_BG = 'linear-gradient(to right, #9cc1bc, #536976)';

        const interactionCss = `
            /* Градиентный фон и тень для кнопок на странице фильма при наведении/фокусе */
            .full-start__button.selector:hover,
            .full-start__button.selector.focus {
                border-radius: 0.5em !important;
                box-shadow: ${SHADOW_COLOR} !important;
                background: ${GRADIENT_HOVER_BG} !important;
            }

            /* Тень для элементов в Selectbox (Источник) */
            .selectbox-item.selector:hover,
            .selectbox-item.selector.focus {
                box-shadow: ${SHADOW_COLOR} !important;
            }

            /* Тень для элементов в меню Настроек */
            .settings-folder.selector:hover,
            .settings-folder.selector.focus {
                box-shadow: ${SHADOW_COLOR} !important;
            }
        `;

        // --- СТАТИЧЕСКИЕ ПРАВИЛА ---
        const staticCss = `
            /* Новый фон для элементов списка торрентов */
            .torrent-item.selector {
                background-color: rgb(68 68 69 / 13%) !important;
            }
        `;
        
        // Создаем тег <style> для интерактивных стилей
        const interactionStyleElement = document.createElement('style');
        interactionStyleElement.id = styleId;
        interactionStyleElement.type = 'text/css';
        interactionStyleElement.innerHTML = interactionCss;
        document.head.appendChild(interactionStyleElement);

        // Создаем тег <style> для статических стилей
        const staticStyleElement = document.createElement('style');
        staticStyleElement.id = staticStyleId;
        staticStyleElement.type = 'text/css';
        staticStyleElement.innerHTML = staticCss;
        document.head.appendChild(staticStyleElement);
    }

    function applyStyles() {
        recolorSeedNumbers();
        roundCorners();
        changeBackground();
        injectInteractionStyles(); // Внедряем стили
    }

    function startObserver() {
        applyStyles(); // сразу применяем
        const obs = new MutationObserver(applyStyles);
        // Наблюдаем за изменениями в DOM
        obs.observe(document.body, { childList: true, subtree: true });
        log('Observer started (v1.0, упрощённая версия)');
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.0',
                author: 'maxi3219',
                description: 'Цвет сидов, скругления блоков, фон, прозрачность меню и визуальные эффекты фокуса',
                init: startObserver
            });
            log('Registered with Lampa');
        } else {
            log('Standalone mode');
            startObserver();
        }
    }

    register();
})();
