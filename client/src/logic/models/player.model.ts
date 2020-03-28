import { Card, CARD_HEIGHT, CARD_WIDTH } from './card.model';
import { Table } from './table.model';
import { ScreenSize } from 'logic/interfaces/screen-size.interface';
import { getTweenValue } from 'logic/helpers/animation.helper';

export class Player {
    public name: string;
    public guid: string;
    public color: string;
    public isAdmin: boolean;
    public cards: Card[];

    public positionX: number;
    public positionY: number;

    public futureDegrees;
    public degrees: number;

    public constructor(obj) {
        Object.assign(this, obj);
        this.cards = [];
    }

    public tick(deltaT: number, screenSize: ScreenSize, table: Table, index: number, playerCount: number) {
        const htmlDegrees = (360 / playerCount * index);
        this.futureDegrees = htmlDegrees + 90;

        if (this.degrees === undefined) {
            this.degrees = this.futureDegrees;
        } else {
            this.degrees = getTweenValue(this.degrees, this.futureDegrees, deltaT, 5);
        }

        const radians = this.degrees * Math.PI/180;
        this.positionX = (screenSize.width/2) + (table.radius * Math.cos(radians));
        this.positionY = (screenSize.height/2) + (table.radius * Math.sin(radians));

        const cardRadius = table.radius ;
        const cardPositionX = (screenSize.width/2) + (cardRadius * Math.cos(radians));
        const cardPositionY = (screenSize.height/2) + (cardRadius * Math.sin(radians));

        if (index === 0) {
            this.positionY += 10;
        }

        if (!this.cards) {
            return;
        }

        if (index === 0) {
            for (const [index, card] of this.cards.entries()) {
                card.futureRotationY = 0;
                const distanceFromCenter = index - (((this.cards.length + 1) / 2) - 1);
                card.futureDegrees = htmlDegrees + (4 * distanceFromCenter);
                card.futurePositionX = (cardPositionX - 70) + (80 * distanceFromCenter);
                card.futurePositionY = (cardPositionY - 140) + (Math.abs(distanceFromCenter) * Math.abs(distanceFromCenter) * 3);
                this.calculateTweens(card, deltaT);
            }
        } else {
            for (const [index, card] of this.cards.entries()) {
                card.futureRotationY = 180;
                const distanceFromCenter = index - (((this.cards.length + 1) / 2) - 1);
                card.futureDegrees = htmlDegrees + (15 * distanceFromCenter);
                card.futurePositionX = cardPositionX - (CARD_WIDTH / 2);
                card.futurePositionY = cardPositionY - CARD_HEIGHT;
                this.calculateTweens(card, deltaT);
            }
        }
    }

    private calculateTweens(card, deltaT) {
        card.futureOriginX = CARD_WIDTH / 2;
        card.futureOriginY = CARD_HEIGHT;
        card.futureAdjustmentX = 0;
        card.futureAdjustmentY = 0;

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