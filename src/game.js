'use strict';

const HOST = 'http://127.0.0.1:8000'
const board = document.querySelector('.board');
const cardsDiv = document.getElementById('cards');
const left = document.querySelector('.left-dot .dot-text');
const right = document.querySelector('.right-dot .dot-text');
let progressBars = [
    document.getElementById("progress-bar-1"),
    document.getElementById("progress-bar-2"),
    document.getElementById("progress-bar-3"),
    document.getElementById("progress-bar-4")
];
const Direction = {
    Left: 0,
    Right: 1
}
let displayedCards = [];
const CARD_ON_DISPLAY = 5;
const getActiveCard = () => displayedCards.length === 0 ? null : displayedCards[0];
let resources = [];


async function startGame() {
    resources = await fetch(`${HOST}/api/resources`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }).then(r => r.json());

    updateResources(progressBars, resources, resources);
    displayedCards = (await fetchCards(CARD_ON_DISPLAY)).map(createCardHtml);
    await renderCards();
    document.addEventListener("onCardSwipe", (event) => handleCardSwipe(event.detail.direction))
    board.classList.add('loaded');
}


function endGame() {
    // TODO something useful or not so
    console.log('Game over');
}


async function renderCards() {
    arrangeDisplayedCards(displayedCards);
    let activeCard = getActiveCard();
    updateSelectionDots(left, right, activeCard);
    makeCardSwipeable(activeCard);
    displayedCards.forEach(card => cardsDiv.appendChild(card))
}


async function handleCardSwipe(direction) {
    const swipedCardHtml = displayedCards.shift();
    const swipedCardInfo = swipedCardHtml.cardInfo;
    let newResources = await fetch(`${HOST}/api/swipe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: `{"card_id":"${swipedCardInfo.id}", "direction":"${direction === 0 ? "left" : "right"}"}`
    }).then(r => r.json());
    console.log(newResources, resources);
    updateResources(progressBars, newResources, resources);
    resources = newResources;
    // TODO something useful or not so

    setTimeout(() => cardsDiv.removeChild(swipedCardHtml), 1000);
    const newCard = await fetchCard();
    if (newCard) {
        displayedCards.push(createCardHtml(newCard));
        updateSelectionDots(left, right, getActiveCard());
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
