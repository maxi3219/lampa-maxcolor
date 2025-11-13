(() => {
    const plugin_id = 'theme-transfer';
    const plugin_name = 'ThemeTransfer';

    function log(...args) {
        try { console.log(`[${plugin_name}]`, ...args); } catch (e) {}
    }

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

    function createButton(label, onClick) {
        const btn = document.createElement('div');
        btn.className = 'settings-item';
        btn.innerText = label;
        btn.style.cursor = 'pointer';
        btn.style.padding = '1em';
        btn.style.border = '1px solid rgba(255,255,255,0.1)';
        btn.style.margin = '0.5em 0';
        btn.style.borderRadius = '0.5em';
        btn.style.background = 'rgba(255,255,255,0.05)';
        btn.tabIndex = 0;
        btn.onclick = onClick;
        return btn;
    }

    function addButtons() {
        const tryInsert = () => {
            const panel = document.querySelector('.settings__content');
            if (!panel) {
                setTimeout(tryInsert, 500); // ждём появления панели
                return;
            }

            const exportBtn = createButton('Сохранить тему', exportTheme);
            const importBtn = createButton('Загрузить тему', importTheme);

            panel.appendChild(exportBtn);
            panel.appendChild(importBtn);
            log('Buttons added');
        };

        tryInsert();
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
                version: '1.1',
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
