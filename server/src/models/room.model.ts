import { Player } from './player.model';
import { GameLogic } from 'games/game.logic';

export class Room {
    name: string;
    guid: string;
    isStarted: boolean;
    players: Player[];
    game: GameLogic;
}