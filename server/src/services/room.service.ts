import { Room } from 'models/room.model';
import { Player } from 'models/player.model';
import { Game } from 'models/game.model';
const uuid = require('uuid/v4');

export class RoomService {
    private rooms: { [id: string]: Room } = {};

    public createRoom(game: Game): Room {
        const newRoom = new Room();
        newRoom.guid = uuid();
        newRoom.players = [];
        newRoom.isStarted = false;
        newRoom.game = game;

        this.rooms[newRoom.guid] = newRoom;
        return newRoom;
    }

    public getRoom(roomGuid): Room {
        return this.rooms[roomGuid];
    }

    public getRooms(): Room[] {
        return Object.values(this.rooms);
    }

    public startRoom(roomGuid): Room {
        const oldRoom = this.getRoom(roomGuid);
        oldRoom.isStarted = true;

        return oldRoom;
    }

    public deleteRoom(roomGuid: string) {
        const idx = this.getRooms().findIndex(r => r.guid === roomGuid);
        this.getRooms().splice(idx, 1);
    }

    public addUserToRoom(roomGuid: string, player: Player) {
        this.rooms[roomGuid].players.push(player);
        if(this.rooms[roomGuid].players.length >= this.rooms[roomGuid].game.maxPlayer){
            this.rooms[roomGuid].isStarted = true;
        }
    }

    public deleteUserFromRoom(roomGuid: string, player: Player) {
        const id = this.rooms[roomGuid].players.findIndex(p => p.guid === player.guid);
        this.rooms[roomGuid].players.splice(id, 1);
    }
}