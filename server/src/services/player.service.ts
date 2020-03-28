import { Player } from 'models/player.model';
const uuid = require('uuid/v4');

export class PlayerService {
    public createPlayer(): Player {
        const newPlayer = new Player();
        newPlayer.guid = uuid();
        newPlayer.name = `Player ${Math.floor(Math.random() * Math.floor(99999))}`;

        return newPlayer;
    }
}