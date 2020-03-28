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
                card.rotationY = 0;
                card.originX = CARD_WIDTH / 2;
                card.originY = CARD_HEIGHT;
                const distanceFromCenter = index - (((this.cards.length + 1) / 2) - 1);
                card.degrees = htmlDegrees + (4 * distanceFromCenter);
                card.positionX = (cardPositionX - 70) + (80 * distanceFromCenter);
                card.positionY = (cardPositionY - 140) + (Math.abs(distanceFromCenter) * Math.abs(distanceFromCenter) * 3);
                card.adjustmentX = 0;
                card.adjustmentY = 0;
            }
        } else {
            for (const [index, card] of this.cards.entries()) {
                card.rotationY = 180;
                card.originX = CARD_WIDTH / 2;
                card.originY = CARD_HEIGHT;
                const distanceFromCenter = index - (((this.cards.length + 1) / 2) - 1);
                card.degrees = htmlDegrees + (15 * distanceFromCenter);
                card.positionX = cardPositionX - (CARD_WIDTH / 2);
                card.positionY = cardPositionY - CARD_HEIGHT;
                card.adjustmentX = 0;
                card.adjustmentY = 0;
            }
        }
    }
}