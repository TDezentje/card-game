import { Room } from 'models/room.model';
import { Player } from 'models/player.model';
import { GameLogic } from 'games/game.logic';
const uuid = require('uuid/v4');

export class RoomService {
    private rooms: { [id: string]: Room } = {};

    public createRoom(game: GameLogic): Room {
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

    public getRoomByGame(game: GameLogic) {
        return this.getRooms().find(r => r.game === game);
    }

    public startRoom(roomGuid): Room {
        const oldRoom = this.getRoom(roomGuid);
        if (oldRoom.players.length >= Object.getPrototypeOf(oldRoom.game).constructor.minPlayers) {
            oldRoom.isStarted = true;
        }

        return oldRoom;
    }

    public deleteRoom(roomGuid) {
        delete this.rooms[roomGuid];
    }    

    public addUserToRoom(roomGuid: string, player: Player) {
        const room = this.getRoom(roomGuid);
        room.players.push(player);
        if (Object.getPrototypeOf(room.game).constructor.maxPlayers){
            if(room.players.length >= Object.getPrototypeOf(room.game).constructor.maxPlayers){
                room.isStarted = true;
            }
        }
    }
}