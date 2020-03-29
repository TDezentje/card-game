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

    public addUserToRoom(roomGuid: string, player: Player) {
        const room = this.getRoom(roomGuid);
        room.players.push(player);
        if(room.game.maxPlayer){
            if(room.players.length >= room.game.maxPlayer){
                room.isStarted = true;
            }
        }
    }

    public deleteUserFromRoom(roomGuid: string, player: Player) {
        const room = this.getRoom(roomGuid);
        const id = room.players.findIndex(p => p.guid === player.guid);
        room.players.splice(id, 1);
    }
}