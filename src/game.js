'use strict';

const HOST = 'http://127.0.0.1:8000'

const board = document.querySelector('.board');
const cardsDiv = document.getElementById('cards');
var activeCard = {
    "photo_url": "",
    "name": "Active",
    "description": "Active cards, rendered independetly",
};
var activeCardElement = undefined;

var cardsStorage = [
    {
        "photo_url": "",
        "name": "Stub",
        "description": "Description",
    }
]; // array of card objects

const renderCard = (card, stackIndex) => {
    const cardHtml = document.createElement('div');
    cardHtml.className = 'card';
    const img = document.createElement('img');
    img.src = card.photo_url;
    cardHtml.appendChild(img);

    const header = document.createElement('h3');
    header.innerText = card.name;
    cardHtml.appendChild(header);

    const description = document.createElement('p');
    description.innerText = card.name;
    cardHtml.appendChild(description);

    cardHtml.style.zIndex = cardsStorage.length - stackIndex;
    cardHtml.style.transform = `scale(${(20 - stackIndex) / 20}) translateY(${-30 * stackIndex}px)`;

    makeCardSwipable(cardHtml);
    cardsDiv.appendChild(cardHtml);

    return cardHtml;
}

const renderAllCards = () => {
    cardsDiv.innerHTML = '';

    if (!activeCard) {
        console.warn('Cards are over.');
        return;
    }

    // Мб починить ререндерин, чтоыб картинка по-новой не подгружалась, а карточка просто скейлилась
    renderCard(activeCard, 0);

    cardsStorage.map((card, index) => renderCard(card, index));
}

const makeCardSwipable = (el) => {
    const hammer = new Hammer(el);

    hammer.on('pan', event => el.classList.add('moving'));

    hammer.on('pan', event => {
        if (event.deltaX === 0)
            return;

        if (event.center.x === 0 && event.center.y === 0)
            return;

        const xMulti = event.deltaX * 0.03;
        const yMulti = event.deltaY / 80;
        const rotate = xMulti * yMulti;

        event.target.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(${rotate}deg)`;
    });

    hammer.on('panend', event => {
        el.classList.remove('moving');

        const moveOutWidth = document.body.clientWidth;
        const isKeep = Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.5;

        event.target.classList.toggle('removed', !isKeep);
        if (isKeep) {
            event.target.style.transform = '';
            // держали карточку, но она вернулась в исходную позицию
            return;
        }

        const endX = Math.max(Math.abs(event.velocityX) * moveOutWidth, moveOutWidth);
        const endY = Math.abs(event.velocityY) * moveOutWidth;

        const toX = event.deltaX > 0 ? endX : -endX;
        const toY = event.deltaY > 0 ? endY : -endY;

        const xMulti = event.deltaX * 0.03;
        const yMulti = event.deltaY / 80;

        const rotate = xMulti * yMulti;

        event.target.style.transform = `translate(${toX}px, ${(toY + event.deltaY)}px) rotate(${rotate}deg)`;

        if (event.deltaX > 0) {
            console.log('Right swipe');
        } else {
            console.log('Left swipe');
        }

        activeCard = cardsStorage.shift();
        renderAllCards();
    });
}


const fetchCards = () => {
    return fetch(`${HOST}/api/cards`).then(res => res.json());
}

fetchCards().then(cards => {
    cardsStorage = cards;
}).then(_ => renderAllCards()); // TODO перенести на событийную модель

renderAllCards(); // рендерим заглушки
board.classList.add('loaded');


