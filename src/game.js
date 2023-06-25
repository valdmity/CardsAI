'use strict';

const HOST = 'http://127.0.0.1:8000';
const board = document.querySelector('.board');
const cardsDiv = document.getElementById('cards');
const left = document.querySelector('.left-dot .dot-text');
const right = document.querySelector('.right-dot .dot-text');
const loseScreen = document.getElementById('lose-screen');
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
const swipeAudios = [
    new Audio('assets/sounds/card.mp3'),
    new Audio('assets/sounds/fast_wind.mp3'),
    new Audio('assets/sounds/swoosh.mp3'),
    new Audio('assets/sounds/enderman.mp3'),
];
let displayedCards = [];
const CARD_ON_DISPLAY = 5;
const getActiveCard = () => displayedCards.length === 0 ? null : displayedCards[0];
let resources = [];


async function startGame() {
    resources = await fetch(`${HOST}/api/resources`, {
        method: 'GET',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }).then(r => r.json());

    updateResources(progressBars, resources, resources);
    displayedCards = (await fetchCards(CARD_ON_DISPLAY)).map(createCardHtml);
    await renderCards();
    document.addEventListener("onCardSwipe", handleCardSwipe)
    document.addEventListener("onCardSwipe", playSwipeSound)
    document.addEventListener("onGameLose", handleGameLose)
    board.classList.add('loaded');
}


function endGame() {
    // TODO something useful or not so
    console.log('Game over');
}

async function playSwipeSound() {
    const randomAudio = swipeAudios[Math.floor(Math.random() * swipeAudios.length)];
    await randomAudio.play();
}


async function renderCards() {
    arrangeDisplayedCards(displayedCards);
    let activeCard = getActiveCard();
    updateSelectionDots(left, right, activeCard);
    makeCardSwipeable(activeCard);
    displayedCards.forEach(card => cardsDiv.appendChild(card))
}

async function handleSwipeEvent(event) {
    await handleCardSwipe(event.detail.direction)
}

async function handleCardSwipe(direction) {
    const swipedCardHtml = displayedCards.shift();
    const swipedCardInfo = swipedCardHtml.cardInfo;
    let newResources = await fetch(`${HOST}/api/swipe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        credentials: "include",
        body: `{"card_id":"${swipedCardInfo.id}", "direction":"${direction === 0 ? "left" : "right"}"}`
    }).then(r => r.json());
    console.log(newResources, resources);

    if (newResources.detail) {
        document.dispatchEvent(new CustomEvent("onGameLose"));
        return;
    }

    updateResources(progressBars, newResources, resources);
    resources = newResources;

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

async function handleGameLose() {
    document.removeEventListener("onCardSwipe", handleSwipeEvent);
    console.log(loseScreen)
    loseScreen.classList.remove("disabled");
}


// TODO переписать код ниже после добавления новых ручек на бэке
let _currentCardNum = 0;

async function fetchCard() {
    _currentCardNum++;
    const res = await fetch(`${HOST}/api/cards`, {
        credentials: "include"
    }).then(res => res.json());
    if (_currentCardNum >= res.length)
        return null;
    return res[_currentCardNum - 1];
}

async function fetchCards(cardsCount) {
    _currentCardNum += cardsCount;
    const res = await fetch(`${HOST}/api/cards`, {
        credentials: "include"
    }).then(res => res.json());
    const endInd = Math.min(_currentCardNum, res.length);
    return res.slice(_currentCardNum - cardsCount, endInd);
}

startGame();
