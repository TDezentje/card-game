import { Room } from 'models/room.model';
import { Player } from 'models/player.model';
const uuid = require('uuid/v4');

export class RoomService {
    private rooms: { [id: string]: Room } = {};

    public createRoom(): Room {
        const newRoom = new Room();
        newRoom.guid = uuid();
        newRoom.players = [];

        this.rooms[newRoom.guid] = newRoom;
        return newRoom;
    }
    public deleteRoom(roomGuid: string) {
        this.rooms[roomGuid] = null;
    }

    public addUserToRoom(roomGuid: string, player: Player) {
        this.rooms[roomGuid].players.push(player);

    }

    public deleteUserFromRoom(roomGuid: string, player: Player) {
        const id = this.rooms[roomGuid].players.findIndex(p => p.guid === player.guid);
        this.rooms[roomGuid].players.splice(id, 1);
    }
}