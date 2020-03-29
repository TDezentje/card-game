import { getTweenValue } from 'logic/helpers/animation.helper';

export class Card {
    public corner: CardCorner;
    public guid: string;
    public display: string;
    public canBeUsed: boolean;
    public color: string;
    
    public positionX?: number;
    public positionY?: number;
    public adjustmentX?: number;
    public adjustmentY?: number;
    public degrees?: number;
    public rotation?: number;
    public rotationAxis?: string;
    public originX?: number;
    public originY?: number;

    public futurePositionX?: number;
    public futurePositionY?: number;
    public futureAdjustmentX?: number;
    public futureAdjustmentY?: number;
    public futureDegrees?: number;
    public futureRotation?: number;
    public futureOriginX?: number;
    public futureOriginY?: number;

    public isCleaning = false;

    public constructor(obj?) {
        Object.assign(this, obj);
    }

    public tick(deltaT) {
        this.positionX = getTweenValue(this.positionX, this.futurePositionX, deltaT, 6);
        this.positionY = getTweenValue(this.positionY, this.futurePositionY, deltaT, 6);
        this.adjustmentX = getTweenValue(this.adjustmentX, this.futureAdjustmentX, deltaT, 6);
        this.adjustmentY = getTweenValue(this.adjustmentY, this.futureAdjustmentY, deltaT, 6);

        this.rotation = getTweenValue(this.rotation, this.futureRotation, deltaT, 4);
        this.originX = getTweenValue(this.originX, this.futureOriginX, deltaT, 5);
        this.originY = getTweenValue(this.originY, this.futureOriginY, deltaT, 5);
        this.degrees = getTweenValue(this.degrees, this.futureDegrees, deltaT, 5);
    }
}

export class CardCorner {
    public leftTop: string;
    public leftBottom: string;
    public rightTop: string;
    public rightBottom: string;
}

export const CARD_WIDTH = 110;
export const CARD_HEIGHT = 150;