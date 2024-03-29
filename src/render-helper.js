'use strict';

const cardTemplate = document.querySelector('#cardTemplate');
const leftDot = document.querySelector(".left-dot");
const rightDot = document.querySelector(".right-dot");
let progressBarsAnimTimeouts = [];

document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (coolDown) return;
    if (event.code !== 'ArrowRight' && event.code !== 'ArrowLeft') return;
    const dir = (event.code !== 'ArrowLeft' ? -1 : 1);
    swipeCard(getActiveCard(), -10000 * dir, 500, -90 * dir);
});

left.addEventListener('click', (event) => {
    if (event.repeat) return;
    if (coolDown) return;
    swipeCard(getActiveCard(), -10000, 500, -90);
});

right.addEventListener('click', (event) => {
    if (event.repeat) return;
    if (coolDown) return;
    swipeCard(getActiveCard(), 10000, 500, 90);
});


const createCardHtml = (card) => {
    const cardHtml= cardTemplate.content.cloneNode(true).querySelector(".card");

    if (card.photo_url !== "") {
        const imageHolder = cardHtml.querySelector('#imageHolder');
        const img = document.createElement('img');
        img.src = card.photo_url;
        img.alt = "Изображение персонажа";
        imageHolder.appendChild(img);
    }

    cardHtml.querySelector('h3').innerText = card.name;
    cardHtml.querySelector('p').innerText = card.description;
    cardHtml.cardInfo = card;

    return cardHtml;
}


const updateSelectionDots = (left, right, card) => {
    if (card == null) {
        left.textContent = null;
        right.textContent = null;
        return;
    }
    left.textContent = card.cardInfo.left.title;
    right.textContent = card.cardInfo.right.title;
}


const updateResources = (progressBars, newResources, oldResources) => {
    if (progressBarsAnimTimeouts.length > 0) {
        for (let i = 0; i < progressBarsAnimTimeouts.length; i++) {
            clearTimeout(progressBarsAnimTimeouts[i]);
        }
        progressBarsAnimTimeouts = [];
    }

    for (let i = 0; i < 4; i++) {
        let percentage = 78 - 0.63 * newResources[i];
        let diff = newResources[i] - oldResources[i];
        const progressBar = progressBars[i];
        let height = progressBar.style.height;
        if (height.length === 0){
            height = "0";
        }

        progressBar.style.height = percentage.toString() + "%";

        if (diff > 0) {
            progressBar.style.boxShadow = "0px 1vh 0.5vh rgba(0, 255, 0, 0.5)";
        }
        if (diff < 0) {
            progressBar.style.boxShadow = "0px 1vh 0.5vh rgba(255, 0, 0, 0.5)";
        }
    }

    progressBarsAnimTimeouts.push(setTimeout(() => {
        for (let i = 0; i < 4; i++) {
            progressBars[i].style.boxShadow = "";
        }
        }, 1000));
}


const arrangeDisplayedCards = (displayedCards) => {
    for (let i = 0; i < displayedCards.length; i++) {
        displayedCards[i].style.zIndex = (displayedCards.length - i).toString();
        displayedCards[i].style.transform = `scale(${(20 - i) / 20}) translateY(${-3 * i}vh)`;
    }
}


const makeCardSwipeable = (el) => {
    const hammer = new Hammer(el);

    hammer.on('pan', event => el.classList.add('moving'));

    hammer.on('pan', event => {
        if (event.deltaX === 0)
            return;

        updateSelectionDotsRender(event.deltaX);

        if (event.center.x === 0 && event.center.y === 0)
            return;

        const xMulti = event.deltaX * 0.03;
        const yMulti = event.deltaY / 80;
        const rotate = xMulti * yMulti;

        event.target.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(${rotate}deg)`;
    });

    hammer.on('panend', event => {
        el.classList.remove('moving');
        const card = event.target;
        const moveOutWidth = document.body.clientWidth;
        const isKeep = Math.abs(event.deltaX) < 80;

        card.classList.toggle('removed', !isKeep);
        if (isKeep) {
            card.style.transform = '';
            // держали карточку, но она вернулась в исходную позицию
            updateSelectionDotsRender(0);
            return;
        }

        const endX = Math.max(Math.abs(event.velocityX) * moveOutWidth, moveOutWidth);

        const endY = Math.abs(event.velocityY) * moveOutWidth;
        const toX = event.deltaX > 0 ? endX : -endX;

        const toY = event.deltaY > 0 ? endY : -endY;
        const xMulti = event.deltaX * 0.03;

        const yMulti = event.deltaY / 80;

        const rotate = xMulti * yMulti;
        swipeCard(card, toX, toY, rotate);
    });
}


const swipeCard = (card, toX, toY, rotate) => {
    updateSelectionDotsRender(toX);
    setTimeout(() => restoreSelectionDotsRender(), 200);
    card.style.transform = `translate(${toX}px, ${(toY)}px) rotate(${rotate}deg)`;
    document.dispatchEvent(new CustomEvent("onCardSwipe", {
        detail: { direction: (toX > 0 ? Direction.Right : Direction.Left) }
    }));
}

const updateSelectionDotsRender = (deltaX) => {
    const clientWidth = document.body.clientWidth;
    const deadZone = clientWidth / 10;
    if (-deadZone < deltaX && deltaX < deadZone)
    {
        restoreSelectionDotsRender();
        return;
    }
    deltaX += (deltaX < 0 ? deadZone : -deadZone);
    const maxDeltaX = (clientWidth / 2 - deadZone);
    let offset = deltaX / maxDeltaX;
    if (Math.abs(offset) > 0.5)
        offset = deltaX < 0 ? -0.5 : 0.5;
    leftDot.style.transform = `scale(${Math.max(0.8, 1 - offset)})`;
    rightDot.style.transform = `scale(${Math.max(0.8, 1 + offset)})`;
    leftDot.style.boxShadow = `0px 5px 10px rgba(0, 0, 0, 0.25), 0px 0px ${offset * offset * 100}px rgba(240, 98, 146, ${-50 * offset * offset * offset})`;
    rightDot.style.boxShadow = `0px 5px 10px rgba(0, 0, 0, 0.25), 0px 0px ${offset * offset * 100}px rgba(240, 98, 146, ${50 * offset * offset * offset})`;
}

const restoreSelectionDotsRender = () =>
{
    leftDot.style.transform = rightDot.style.transform = "";
    leftDot.style.boxShadow = rightDot.style.boxShadow = "0px 5px 10px rgba(0, 0, 0, 0.25)";
}