export class Card {
    public corner: CardCorner;
    public guid: string;
    public display: string;
    public canBeUsed: boolean;

    public positionX?: number;
    public positionY?: number;
    public adjustmentX?: number;
    public adjustmentY?: number;
    public degrees?: number;
    public rotationY?: number;
    public originX?: number;
    public originY?: number;

    public futurePositionX?: number;
    public futurePositionY?: number;
    public futureAdjustmentX?: number;
    public futureAdjustmentY?: number;
    public futureDegrees?: number;
    public futureRotationY?: number;
    public futureOriginX?: number;
    public futureOriginY?: number;

    public lastPositionChange?: number;
}

export class CardCorner {
    public leftTop: string;
    public leftBottom: string;
    public rightTop: string;
    public rightBottom: string;
}

export const CARD_WIDTH = 110;
export const CARD_HEIGHT = 150;