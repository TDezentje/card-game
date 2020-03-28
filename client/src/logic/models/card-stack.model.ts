import { ScreenSize } from 'logic/interfaces/screen-size.interface';
import { CARD_WIDTH, CARD_HEIGHT, Card } from './card.model';

export class CardStack {
    public hasCards: boolean;
    public card: Card = new Card();

    public constructor() {
        this.hasCards = true;
    }

    public tick(screenSize: ScreenSize) {
        this.card.positionX = screenSize.width - CARD_WIDTH - 10;
        this.card.positionY = screenSize.height - CARD_HEIGHT - 10;
        this.card.rotationY = 180;
        this.card.degrees = 0;
        this.card.adjustmentX = 0;
        this.card.adjustmentY = 0;
        this.card.originX = CARD_WIDTH / 2;
        this.card.originY = CARD_HEIGHT;
    }
}