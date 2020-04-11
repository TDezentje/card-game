import { Card, CARD_WIDTH, CARD_HEIGHT } from './card.model';
import { ScreenSize } from 'logic/models/screen-size.model';
import { rand, sleep } from 'logic/helpers/animation.helper';
import { GameStatus } from 'logic/models/game.model';
import { CardStack } from './card-stack.model';
import { Watchable } from 'logic/helpers/watchable';
import { StoreArray } from 'logic/helpers/store-array';

export class CardPile extends Watchable {
    public cards: StoreArray<Card> = new StoreArray();

    public tick(deltaT, screenSize: ScreenSize, status: GameStatus) {
        const centerX = screenSize.width / 2;
        const centerY = screenSize.height / 2;

        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards.item(i);
            if (status === GameStatus.cleanup && !card.isCleaning) {
                card.futurePositionX = card.positionX + (rand(20) * 10);
                card.futurePositionY = card.positionY + (rand(20) * 10);
                card.futureRotation = card.rotation + (rand(36) * 10);
                card.rotationAxis = 'Y';
                card.futureDegrees = card.degrees + (rand(36) * 10);
                card.isCleaning = true;
            } else if (status !== GameStatus.cleanup && !card.isResetting) {
                card.futurePositionX = centerX - (CARD_WIDTH / 2);
                card.futurePositionY = centerY - (CARD_HEIGHT / 2);
            }

            card.tick(deltaT);

            if (card.isResetting) {
                if (i !== this.cards.length -1 && card.positionX === card.futurePositionX && card.positionY === card.futurePositionY) {
                    this.cards.splice(i, 1);
                    i--;
                }
            }
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
        card.futureScale = 1;
        this.update();
    }

    public async resetCardsToStack(stack: CardStack, emptyPile: boolean) {
        if (!emptyPile && this.cards.length <= 1) {
            return false;
        }

        for (const [index, card] of this.cards.entries()) {
            if (!emptyPile && index === this.cards.length -1) {
                continue;
            }

            await sleep(25);

            card.futurePositionX = stack.card.positionX;
            card.futurePositionY = stack.card.positionY;
            card.futureRotation = stack.card.rotation;
            card.rotationAxis = 'Y';
            card.futureDegrees = stack.card.degrees;
            card.futureAdjustmentX = stack.card.adjustmentX;
            card.futureAdjustmentY = stack.card.adjustmentY;
            card.isResetting = true;
        }

        return true;
    }
}