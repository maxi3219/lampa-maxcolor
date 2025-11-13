(() => {
    const plugin_id = 'theme-transfer';
    const plugin_name = 'ThemeTransfer';

    function log(...args) {
        try { console.log(`[${plugin_name}]`, ...args); } catch (e) {}
    }

    // Собираем все CSS-переменные текущей темы
    function exportTheme() {
        const styles = getComputedStyle(document.documentElement);
        const vars = {};
        for (let i = 0; i < styles.length; i++) {
            const name = styles[i];
            if (name.startsWith('--')) {
                vars[name] = styles.getPropertyValue(name).trim();
            }
        }
        localStorage.setItem('theme_backup', JSON.stringify(vars));
        log('Theme exported to localStorage');
    }

    // Применяем сохранённые переменные
    function importTheme() {
        const json = localStorage.getItem('theme_backup');
        if (!json) {
            log('No theme found in localStorage');
            return;
        }
        try {
            const vars = JSON.parse(json);
            for (const key in vars) {
                document.documentElement.style.setProperty(key, vars[key]);
            }
            log('Theme imported from localStorage');
        } catch (e) {
            log('Error parsing theme JSON');
        }
    }

    // Добавляем кнопки в меню настроек
    function addButtons() {
        const panel = document.querySelector('.settings__content');
        if (!panel) return;

        const exportBtn = document.createElement('div');
        exportBtn.className = 'settings-item';
        exportBtn.innerText = 'Сохранить тему';
        exportBtn.onclick = exportTheme;

        const importBtn = document.createElement('div');
        importBtn.className = 'settings-item';
        importBtn.innerText = 'Загрузить тему';
        importBtn.onclick = importTheme;

        panel.appendChild(exportBtn);
        panel.appendChild(importBtn);
    }

    function initPlugin() {
        if (window.Lampa && typeof Lampa.Listener === 'object') {
            Lampa.Listener.follow('app', function(event){
                if(event.type === 'ready'){
                    addButtons();
                }
            });
            log('Lampa listener attached');
        } else {
            document.addEventListener('DOMContentLoaded', addButtons);
            log('Standalone mode');
        }
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.0',
                author: 'maxi3219',
                description: 'Автоматический экспорт/импорт темы через localStorage',
                init: initPlugin
            });
            log('Registered with Lampa');
        } else {
            initPlugin();
        }
    }

    register();
})();
