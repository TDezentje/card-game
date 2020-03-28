import { Player } from './player.model';

export class GameState {
    action: string;
    isStarted: boolean;
    players: Player[];
    nextPlayer?: Player;
    data: any;
}