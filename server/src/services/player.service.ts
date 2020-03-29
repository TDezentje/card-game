import { Player } from 'models/player.model';
const uuid = require('uuid/v4');

export class PlayerService {
    private players: Player[] = [];
    private colors: string[] = [
        "#d76587",
        "#d6630b",
        "#8f336f",
        "#de3943",
        "#a020f6",
        "#088f19",
        "#2d8a5f",
        "#4090cf",
        "#5c67fd",
        "#c90f13",
        "#ac6208",
        "#88b66a",
        "#482a12",
        "#0f2598",
        "#eba494"
    ]

    public createPlayer(): Player { 
        const newPlayer = new Player();
        newPlayer.guid = uuid();
        newPlayer.name = `Player ${Math.floor(Math.random() * Math.floor(9999))}`;
        newPlayer.color = this.colors[Math.floor(Math.random() * Math.floor(15))];
        this.players.push(newPlayer);

        return newPlayer;
    }

    public getPlayer(playerGuid: string) {
        return this.players.find(p => p.guid === playerGuid);
    }

    public updatePlayerColor(playerGuid: string, playersInRoom: Player[]) {
        const oldPlayer = this.getPlayer(playerGuid);
        const unUsedColors = this.colors.filter(c => !playersInRoom.map(p => p.color).includes(c));
        oldPlayer.color = unUsedColors[Math.floor(Math.random() * Math.floor(unUsedColors.length))];
    }
}