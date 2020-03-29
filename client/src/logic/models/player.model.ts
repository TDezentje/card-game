import { Card, CARD_HEIGHT, CARD_WIDTH } from './card.model';
import { Table } from './table.model';
import { ScreenSize } from 'logic/interfaces/screen-size.interface';
import { getTweenValue, rand } from 'logic/helpers/animation.helper';
import { GameStatus } from 'logic/gamestate';

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

    public isCleaning = false;

    public constructor(obj) {
        Object.assign(this, obj);
        this.cards = [];
    }

    public tick(deltaT: number, screenSize: ScreenSize, table: Table, index: number, playerCount: number, status: GameStatus, myTurn: boolean) {
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

        if (status === GameStatus.cleanup) {
            let minFirePosX, minFirePosY, maxFirePosX, maxFirePosY;
            if (!this.isCleaning) {
                const fireRadius = CARD_HEIGHT * 2.5;
                const fireDirection = this.degrees + 180;
                const minFireRadians = (fireDirection - 25) * Math.PI/180;
                const maxFireRadians = (fireDirection + 25) * Math.PI/180;
    
                minFirePosX = this.positionX + (fireRadius * Math.cos(minFireRadians));
                minFirePosY = this.positionY + (fireRadius * Math.sin(minFireRadians));
                maxFirePosX = this.positionX + (fireRadius * Math.cos(maxFireRadians));
                maxFirePosY = this.positionY + (fireRadius * Math.sin(maxFireRadians));

                this.isCleaning = true;
            }

            for (const card of this.cards) {
                if (!card.isCleaning) {
                    card.futurePositionX = rand(minFirePosX, maxFirePosX);
                    card.futurePositionY = rand(minFirePosY, maxFirePosY);
                    card.futureRotation = card.rotation + (rand(36) * 10);
                    card.rotationAxis = 'Y';
                    card.futureDegrees = card.degrees + (rand(36) * 10);
                    card.futureOriginX = CARD_WIDTH / 2;
                    card.futureOriginY = CARD_HEIGHT / 2;
                    card.isCleaning = true;
                }

                card.tick(deltaT);
            }
            return;
        }

        this.isCleaning = false;

        for (const [cardIndex, card] of this.cards.entries()) {
            const distanceFromCenter = cardIndex - (((this.cards.length + 1) / 2) - 1);
            let futureDegrees, futureRotation, futurePositionX, futurePositionY;
    
            if (index === 0) {
                futureDegrees = htmlDegrees + (4 * distanceFromCenter);
                futureRotation = 0;
                futurePositionX = (cardPositionX - 70) + (80 * distanceFromCenter);
                futurePositionY = (cardPositionY - 140) + (Math.abs(distanceFromCenter) * Math.abs(distanceFromCenter) * 3);

                if (!myTurn) {
                    futurePositionY += CARD_HEIGHT * .45;
                }
            } else {
                futureDegrees = htmlDegrees + (15 * distanceFromCenter);
                futureRotation = 180;
                futurePositionX = cardPositionX - (CARD_WIDTH / 2);
                futurePositionY = cardPositionY - CARD_HEIGHT;
            }

            card.futureRotation = futureRotation;
            card.futureDegrees = futureDegrees;
            card.futurePositionX = futurePositionX;
            card.futurePositionY = futurePositionY;
            card.futureOriginX = CARD_WIDTH / 2;
            card.futureOriginY = CARD_HEIGHT;
            card.futureAdjustmentX = 0;
            card.futureAdjustmentY = 0;
    
            card.tick(deltaT);
        }
    }
}