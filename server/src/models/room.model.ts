import { Player } from './player.model';
import { Game } from './game.model';

export class Room {
    name: string;
    guid: string;
    isStarted: boolean;
    players: Player[];
    game: Game;
}