import { Card } from './card.model';
import { Rule } from './rule.model';

export class Game {
    name: string;
    turnBased: boolean;
    turnTime?: number;
    numberOfCardsInHand?: number;
    maxPlayer?: number;
    allowInvalidMoves: boolean;
    rules: Rule[];
    cards: Card[];
    cardsToUse?: Card[];
    cardsOnStack?: Card[];
}