import { Card } from './card.model';
import { Rule } from './rule.model';

export class Game {
    name: string;
    turnBased: boolean;
    turnTime?: number;
    numberOfCardsInHand?: number;
    maxPlayer?: number;
    rules: Rule[];
    cards: Card[];
    usedCards?: Card[];
    stackCards?: Card[] = [];
}