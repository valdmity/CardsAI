'use strict';

const cardTemplate = document.querySelector('#cardTemplate');

const createCardHtml = (card) => {
    const cardHtml = cardTemplate.content.cloneNode(true).querySelector(".card");

    if (card.photo_url !== "")
    {
        const img = document.createElement('img');
        img.src = card.photo_url;
        cardHtml.appendChild(img);
    }

    cardHtml.querySelector('h3').innerText = card.name;
    cardHtml.querySelector('p').innerText = card.description;
    cardHtml.cardInfo = card;

    return cardHtml;
}

const arrangeDisplayedCards = (displayedCards) => {
    for (let i = 0; i < displayedCards.length; i++) {
        displayedCards[i].style.zIndex = (displayedCards.length - i).toString();
        displayedCards[i].style.transform = `scale(${(20 - i) / 20}) translateY(${-30 * i}px)`;
    }
}

const makeCardSwipeable = (el, onCardSwipe) => {
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

        onCardSwipe(event.deltaX > 0 ? Direction.Right : Direction.Left);
    });
}
