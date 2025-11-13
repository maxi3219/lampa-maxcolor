function addReloadButton() {
    if (document.getElementById('MRELOAD')) return; // уже есть

    // ищем контейнер для кнопок в шапке
    const actions = document.querySelector('.head__actions');
    if (!actions) {
        console.warn('Не найден контейнер .head__actions');
        return;
    }

    const div = document.createElement('div');
    div.id = 'MRELOAD';
    div.className = 'head__action selector m-reload-screen';
    div.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path>
        </svg>
    `;

    // действие при клике — перезагрузка
    div.addEventListener('click', () => {
        location.reload();
    });

    actions.appendChild(div);
    console.log('Reload button added');
}
