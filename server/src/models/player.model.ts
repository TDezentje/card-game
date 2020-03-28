import { Card } from './card.model';

export class Player {
    name: string;
    guid: string;
    isAdmin: boolean;
    cards: Card[];
}