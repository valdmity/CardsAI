'use strict';

const HOST = 'http://127.0.0.1:8000'

var cardList = document.querySelectorAll('.card');
const container = document.querySelector('.board');
const cardsDiv = document.getElementById('cards');

var cardsStorage = [
    {
        "photo_url": "",
        "name": "Stub",
        "description": "Description",
    }
]; // array of card objects

const loadCards = () => {
    return fetch(`${HOST}/api/cards`).then(res => res.json());
}

const renderCards = () => {
    cardsDiv.innerHTML = '';

    cardsStorage.map((card, index) => {
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

        cardHtml.style.zIndex = cardList.length - index;
        cardHtml.style.transform = `scale(${(20 - index) / 20}) translateY(${-30 * index}px)`;

        makeCardSwipable(cardHtml); // TODO rename
        cardsDiv.appendChild(cardHtml);
    });
    cardList = document.querySelectorAll('.card');
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
    });
}

loadCards().then(r => { cardsStorage = r; }).then(_ => renderCards()); // TODO перенести на событийную модель
renderCards(); // рендерим заглушки
container.classList.add('loaded');


