export class Card {
    corner: CardCorner;
    guid: string;
    display: string;
    color?: string;
    canBeUsed?: boolean;
}

export class CardCorner {
    leftTop: string;
    leftBottom: string;
    rightTop: string;
    rightBottom: string;
}