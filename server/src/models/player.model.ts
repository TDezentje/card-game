import { Card } from './card.model';

export class Player {
    name: string;
    color: string;
    guid: string;
    isAdmin: boolean;
    cards: Card[];
}