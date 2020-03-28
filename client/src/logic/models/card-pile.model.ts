import { Card, CARD_WIDTH, CARD_HEIGHT } from './card.model';
import { ScreenSize } from 'logic/interfaces/screen-size.interface';
import { getTweenValue } from 'logic/helpers/animation.helper';

export class CardPile {
    public cards: Card[];

    public constructor() {
        this.cards = [];
    }

    public tick(deltaT, screenSize: ScreenSize) {
        const centerX = screenSize.width / 2;
        const centerY = screenSize.height / 2;

        for (const card of this.cards) {
            card.futurePositionX = centerX - (CARD_WIDTH / 2);
            card.futurePositionY = centerY - (CARD_HEIGHT / 2);

            card.positionX = getTweenValue(card.positionX, card.futurePositionX, deltaT, 6);
            card.positionY = getTweenValue(card.positionY, card.futurePositionY, deltaT, 6);
            card.adjustmentX = getTweenValue(card.adjustmentX, card.futureAdjustmentX, deltaT, 6);
            card.adjustmentY = getTweenValue(card.adjustmentY, card.futureAdjustmentY, deltaT, 6);

            card.rotationY = getTweenValue(card.rotationY, card.futureRotationY, deltaT, 5);
            card.originX = getTweenValue(card.originX, card.futureOriginX, deltaT, 5);
            card.originY = getTweenValue(card.originY, card.futureOriginY, deltaT, 5);
            card.degrees = getTweenValue(card.degrees, card.futureDegrees, deltaT, 5);
        }
    }

    public addCard(card: Card) {
        this.cards.push(card);
        card.futureRotationY = 0;
        card.futureOriginX = (CARD_WIDTH / 2) + (10 - (Math.random() * 20));
        card.futureOriginY = (CARD_HEIGHT / 2) + (10 - (Math.random() * 20));
        card.futureAdjustmentX = (40 - (Math.random() * 80));
        card.futureAdjustmentY = (40 - (Math.random() * 80));
        card.futureDegrees = card.degrees + (55 - (Math.random() * 110));
    }
}