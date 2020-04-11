import { ScreenSize } from 'logic/models/screen-size.model';
import { CARD_WIDTH, CARD_HEIGHT, Card } from './card.model';
import { Watchable } from 'logic/helpers/watchable';

export class CardStack extends Watchable {
    private _hasCards: boolean

    public get hasCards() {
        return this._hasCards;
    }

    public set hasCards(val) {
        this._hasCards = val;
        this.update();
    }
    
    public card: Card = new Card();

    public tick(screenSize: ScreenSize) {
        this.updateOnChange(() => [
            this.card.positionX,
            this.card.positionY,
            this.card.rotation,
            this.card.rotationAxis,
            this.card.degrees,
            this.card.adjustmentX,
            this.card.adjustmentY,
            this.card.originX,
            this.card.originY,
            this.card.scale
        ], () => {
            this.card.positionX = screenSize.width - CARD_WIDTH - 10;
            this.card.positionY = screenSize.height - CARD_HEIGHT - 10;
            this.card.rotation = 180;
            this.card.rotationAxis = 'X';
            this.card.degrees = 0;
            this.card.adjustmentX = 0;
            this.card.adjustmentY = 0;
            this.card.originX = CARD_WIDTH / 2;
            this.card.originY = CARD_HEIGHT;
            this.card.scale = 1;
        });
    }
}