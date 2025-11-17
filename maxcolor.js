(() => {
    const plugin_id = 'maxcolor';
    const plugin_name = 'MaxColor';

    const COLORS = {
        low: '#ff3333',
        mid: '#ffcc00',
        high: '#00ff00'
    };

    const BLOCK_RADIUS = '0.9em';
    const GRADIENT = 'linear-gradient(117deg, rgb(0 0 0) 0%, rgb(11 26 35) 50%, rgb(14, 14, 14) 100%)';

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
            backgroundBlock.style.background = GRADIENT;
            backgroundBlock.style.setProperty('background', GRADIENT, 'important');
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

    // Внедрение стилей для :hover и .focus (скругление кнопок и тень для элементов списков)
    function injectInteractionStyles() {
        const styleId = 'maxcolor-interaction-styles';
        
        // Удаляем старые стили, если они были, чтобы применить новые
        const oldStyle = document.getElementById(styleId);
        if (oldStyle) {
            oldStyle.remove();
        }

        // -- ОБНОВЛЕННЫЕ ПРАВИЛА --
        const SHADOW_COLOR = '0 4px 15px rgb(57 148 188 / 30%)';

        const cssRules = `
            /* Скругление кнопок на главной странице фильма */
            .full-start__button.selector:hover,
            .full-start__button.selector.focus {
                border-radius: 0.5em !important;
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

        // Создаем тег <style> и добавляем его в <head>
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.type = 'text/css';
        styleElement.innerHTML = cssRules;
        document.head.appendChild(styleElement);
    }
    // -- КОНЕЦ БЛОКА --

    function applyStyles() {
        recolorSeedNumbers();
        roundCorners();
        changeBackground();
        injectInteractionStyles();
    }

    function startObserver() {
        applyStyles(); // сразу применяем
        const obs = new MutationObserver(applyStyles);
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
