import { Player } from 'models/player.model';
const uuid = require('uuid/v4');

export class PlayerService {
    private players: Player[] = [];

    public createPlayer(): Player {
        const newPlayer = new Player();
        newPlayer.guid = uuid();
        newPlayer.name = `Player ${Math.floor(Math.random() * Math.floor(99999))}`;
        this.players.push(newPlayer);

        return newPlayer;
    }

    public getPlayer(playerGuid: string){
        return this.players.find(p => p.guid === playerGuid);
    }

    public getPlayers(){
        return this.players;
    }
}