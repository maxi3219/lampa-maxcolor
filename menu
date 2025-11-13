(function(){
    // Проверка, что Lampa загружена
    if (!window.Lampa) return;

    // Ждём полной загрузки интерфейса
    Lampa.Listener.follow('app', function(event){
        if(event.type === 'ready'){
            applyCustomStyles();
        }
    });

    function applyCustomStyles(){
        const style = document.createElement('style');
        style.id = 'custom-rounded-settings-style';
        style.innerHTML = `
            @media screen and (min-width: 480px) {
                .settings__content {
                    position: fixed !important;
                    top: 1em !important;
                    right: 1em !important;
                    left: auto !important;
                    width: 35% !important;
                    max-height: calc(100vh - 2em) !important;
                    overflow-y: auto !important;
                    background: #262829 !important;
                    border-radius: 1.2em !important;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8) !important;
                    padding: 0.5em !important;
                    display: flex !important;
                    flex-direction: column !important;
                    transform: translateX(100%) !important;
                    transition: transform 0.3s ease !important;
                    z-index: 999 !important;
                }

                body.settings--open .settings__content {
                    transform: translateX(0) !important;
                }
            }
        `;
        document.head.appendChild(style);
        console.log('[Rounded Settings Menu] Custom styles applied');
    }
})();
