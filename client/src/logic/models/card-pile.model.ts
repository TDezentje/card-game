import { Card, CARD_WIDTH, CARD_HEIGHT } from './card.model';
import { ScreenSize } from 'logic/interfaces/screen-size.interface';
import { rand } from 'logic/helpers/animation.helper';
import { GameStatus } from 'logic/gamestate';

export class CardPile {
    public cards: Card[];

    public constructor() {
        this.cards = [];
    }

    public tick(deltaT, screenSize: ScreenSize, status: GameStatus) {
        const centerX = screenSize.width / 2;
        const centerY = screenSize.height / 2;

        for (const card of this.cards) {
            if (status === GameStatus.cleanup && !card.isCleaning) {
                card.futurePositionX = card.positionX + (rand(20) * 10);
                card.futurePositionY = card.positionY + (rand(20) * 10);
                card.futureRotation = card.rotation + (rand(36) * 10);
                card.rotationAxis = 'Y';
                card.futureDegrees = card.degrees + (rand(36) * 10);
                card.isCleaning = true;
            } else if (status !== GameStatus.cleanup) {
                card.futurePositionX = centerX - (CARD_WIDTH / 2);
                card.futurePositionY = centerY - (CARD_HEIGHT / 2);
            }

            card.tick(deltaT);
        }
    }

    public addCard(card: Card) {
        this.cards.push(card);
        card.futureRotation = 0;
        card.rotationAxis = 'X';
        card.futureOriginX = (CARD_WIDTH / 2) + rand(10);
        card.futureOriginY = (CARD_HEIGHT / 2) + rand(10);
        card.futureAdjustmentX = rand(30);
        card.futureAdjustmentY = rand(30);
        card.futureDegrees = card.degrees + rand(55);
    }
}