import { Game } from 'models/game.model';
import { Card } from 'models/card.model';

export abstract class GameLogic {
    public id: string;
    public game: Game;

    public abstract isValidCard(cardGuid: string, cardsOnStack: Card[], cardsToUse: Card[]);
}