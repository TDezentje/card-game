import { Card } from './card.model';

export class Game {
    name: string;
    turnBased: boolean;
    turnTime?: number;
    numberOfCardsInHand?: number;
    maxPlayer?: number;
    allowInvalidMoves: boolean;
    cards: Card[];
    cardsToUse?: Card[];
    cardsOnStack?: Card[];
}