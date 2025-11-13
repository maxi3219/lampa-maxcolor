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
        log('Theme saved to localStorage');
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
            log('Theme applied from localStorage');
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
        btn.onclick = onClick;
        return btn;
    }

    function injectButtons() {
        const panel = document.querySelector('.settings__content');
        if (!panel || panel.querySelector('[data-theme-transfer]')) return;

        const exportBtn = createButton('Сохранить тему', exportTheme);
        const importBtn = createButton('Загрузить тему', importTheme);

        exportBtn.setAttribute('data-theme-transfer', 'true');
        importBtn.setAttribute('data-theme-transfer', 'true');

        panel.appendChild(exportBtn);
        panel.appendChild(importBtn);
        log('Buttons injected');
    }

    function observeSettingsPanel() {
        const observer = new MutationObserver(() => {
            injectButtons();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        log('MutationObserver started');
    }

    function initPlugin() {
        observeSettingsPanel();
    }

    function register() {
        if (window.app && app.plugins && typeof app.plugins.add === 'function') {
            app.plugins.add({
                id: plugin_id,
                name: plugin_name,
                version: '1.2',
                author: 'maxi3219',
                description: 'Автоматический экспорт/импорт темы через localStorage с гарантированной вставкой кнопок',
                init: initPlugin
            });
            log('Registered with Lampa');
        } else {
            initPlugin();
        }
    }

    register();
})();
