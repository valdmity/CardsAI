'use strict';

const container = document.querySelector('.board');
const cardList = document.querySelectorAll('.card');

const initCards = () => {
    const newCards = document.querySelectorAll('.card:not(.removed)');

    newCards.forEach((card, index) => {
        card.style.zIndex = cardList.length - index;
        card.style.transform = `scale(${(20 - index) / 20}) translateY(${-30 * index}px)`;
    });

    container.classList.add('loaded');
}

initCards();

cardList.forEach(el => {
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
        initCards();
    });
});

