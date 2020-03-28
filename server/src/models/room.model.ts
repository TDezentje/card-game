import { Player } from './player.model';

export class Room {
    name: string;
    guid: string;
    game: string;
    players: Player[];
    nextPlayer?: Player;
}