'use strict';

const HOST = 'http://127.0.0.1:8000'
const board = document.querySelector('.board');
const cardsDiv = document.getElementById('cards');
const left = document.querySelector('.left-dot .dot-text');
const right = document.querySelector('.right-dot .dot-text');
const Direction = {
    Left: 0,
    Right: 1
}
const cardsStorage =  [
    {
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
    },
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
]; // array of card objects, TODO: remove
let displayedCards = cardsStorage.map((card, index) => createCardHtml(card, index))

const CARD_ON_DISPLAY = 5;

const getActiveCard = () => displayedCards[0];


async function startGame() {
    displayedCards = (await fetchCards(CARD_ON_DISPLAY)).map(createCardHtml);
    await renderCards();
    board.classList.add('loaded');
}


function endGame() {
    // TODO something useful or not so
    console.log('Game over');
}


async function renderCards() {
    cardsDiv.innerHTML = '';
    arrangeDisplayedCards(displayedCards);
    makeCardSwipeable(displayedCards[0], onCardSwipe);
    displayedCards.forEach(card => cardsDiv.appendChild(card))
}


async function onCardSwipe(direction) {
    const swipedCardHtml = displayedCards.shift();
    const swipedCardInfo = swipedCardHtml.cardInfo;
    let resources = await fetch(`${HOST}/api/swipe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: `{"card_id":"${swipedCardInfo.id}", "direction":"${direction === 0 ? "left" : "right"}"}`
    }).then(r => r.json());

    // TODO something useful or not so
    let activeCard = getActiveCard();
    left.textContent = activeCard.cardInfo.left.title;
    right.textContent = activeCard.cardInfo.right.title;

    const newCard = await fetchCard();
    if (newCard) {
        displayedCards.push(createCardHtml(newCard));
    }
    if (displayedCards.length === 0) {
        endGame();
        return;
    }
    await renderCards();
}


// TODO переписать код ниже после добавления новых ручек на бэке
let _currentCardNum = 0;
async function fetchCard() {
    _currentCardNum++;
    const res = await fetch(`${HOST}/api/cards`).then(res => res.json());
    if (_currentCardNum >= res.length)
        return null;
    return res[_currentCardNum - 1];
}
async function fetchCards(cardsCount) {
    _currentCardNum += cardsCount;
    const res = await fetch(`${HOST}/api/cards`)
        .then(res => res.json());
    const endInd = Math.min(_currentCardNum, res.length);
    return res.slice(_currentCardNum - cardsCount, endInd);
}

startGame();
