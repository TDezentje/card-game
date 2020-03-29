import { Player } from './player.model';
import { Card } from './card.model';

export class GameState {
    action: string;
    isStarted: boolean;
    actionByPlayer: Player;
    players: Player[];
    data: {
        card?: Card;
        isValid?: boolean;
        gameOver?: boolean;
        nextPlayerGuid?: string;
    }
}