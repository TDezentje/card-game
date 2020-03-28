import { Game } from 'models/game.model';
import { Card } from 'models/card.model';
import { GameLogic } from './game.logic';

export class CrazyEights extends GameLogic {
    public isValidCard(cardGuid: string, cardsOnStack: Card[], cardsToUse: Card[]) {
      return;
    }

    public nextLevel (game) {
    }

    public resetGame(game){
    }

    public game: Game =
    {
        "name": "Crazy Eights",
        "turnBased": true,
        "turnTime": null,
        "maxPlayer": null,
        "numberOfCardsInHand": 5,
        "allowInvalidMoves": true,
        "hasNextLevel": false,
        "cards": [
        ]
    }

    public id = this.game.name;
    public level = 1;
}