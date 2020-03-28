import { Card, CARD_WIDTH, CARD_HEIGHT } from './card.model';
import { ScreenSize } from 'logic/interfaces/screen-size.interface';

export class CardPile {
    public cards: Card[];

    public constructor() {
        this.cards = [];
    }

    public tick(screenSize: ScreenSize) {
        const centerX = screenSize.width / 2;
        const centerY = screenSize.height / 2;

        for (const card of this.cards) {
            card.rotationY = 0;
            card.degrees = 0;
            card.positionX = centerX - (CARD_WIDTH / 2);
            card.positionY = centerY - (CARD_HEIGHT / 2);
        }
    }
}