'use strict';

const HOST = 'http://127.0.0.1:8000'

const board = document.querySelector('.board');
const cardsDiv = document.getElementById('cards');
let activeCard = {
    "photo_url": "https://clck.ru/34ZeDi",
    "name": "Влад А4",
    "description": "Погнали пить пиво??",
    "left": {
        "title": "Нет...",
        "changes": [50, 20, 30, 10]
    },
    "right": {
        "title": "Да!",
        "changes": [20, 40, 10, 60]
    }
};
let activeCardElement = undefined;

let cardsStorage = [
    {
        "photo_url": "https://clck.ru/34ZeFQ",
        "name": "Технарь",
        "description": "Жи есть?",
        "left": {
            "title": "Есть",
            "changes": [10, 0, 0, -10]
        },
        "right": {
            "title": "Возможно",
            "changes": [0, -10, 0, 10]
        }
    },
    {
        "photo_url": "",
        "name": "???",
        "description": "Вилкой в глаз или в яндекс раз?",
        "left": {
            "title": "Вилкой",
            "changes": [0, 10, -10, 0]
        },
        "right": {
            "title": "В Яндекс",
            "changes": [0, 0, 10, -10]
        }
    }
]; // array of card objects

// Пример изменения заполненности ресурса с id "progress-bar-1"
let progressBars = [
    document.getElementById("progress-bar-1"),
    document.getElementById("progress-bar-2"),
    document.getElementById("progress-bar-3"),
    document.getElementById("progress-bar-4")
];

const leftDotText = document.querySelector('.left-dot .dot-text');
const rightDotText = document.querySelector('.right-dot .dot-text');
updateSelectionDots();

function updateSelectionDots(){
    leftDotText.textContent = activeCard.left.title;
    rightDotText.textContent = activeCard.right.title;
}

function updateProgressBar(progressBar, percentage) {
    let height = progressBar.style.height;
    if (height.length === 0){
        height = "0";
    }
    progressBar.style.height = (Math.max(0, Math.min(parseInt(height) + percentage, 100))).toString() + "%";
}

function updateResources(changes) {
    for (let i = 0; i < 4; i++) {
        updateProgressBar(progressBars[i], changes[i]);
    }
}

const renderCard = (card, stackIndex) => {
    /*const cardHtml = document.createElement('div');
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
    */
    const cardHtml = document.querySelector('#cardTemplate').content.cloneNode(true).querySelector(".card");

    if (card.photo_url != "")
    {
        const img = document.createElement('img');
        img.src = card.photo_url;
        cardHtml.appendChild(img);
    }
    cardHtml.querySelector('h3').innerText = card.name;
    cardHtml.querySelector('p').innerText = card.description;

    cardHtml.style.zIndex = (cardsStorage.length - stackIndex).toString();
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
    renderCard(activeCard, -1);

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
            updateResources(activeCard.right.changes);
        } else {
            console.log('Left swipe');
            updateResources(activeCard.left.changes);
        }

        activeCard = cardsStorage.shift();
        updateSelectionDots();
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
