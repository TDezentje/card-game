import { RoomService } from './room.service';
import { PlayerService } from './player.service';
const uuid = require('uuid/v4');

const WebSocket = require('ws');

export class WebsocketService {
    private wssGame;
    private room;
    private playerService;
    private roomService;

    public createWebserver() {
        this.roomService = new RoomService();
        this.playerService = new PlayerService();
        this.room = this.roomService.createRoom();

        this.wssGame = new WebSocket.Server({ port: 8001 });
        this.wssGame.on('connection', (ws) => {
            const player = this.playerService.createPlayer();
            this.roomService.addUserToRoom(this.room.guid, player);
            ws.isAlive = true;
            ws.playerGuid = player.guid;
            ws.roomGuid = this.room.guid;
            ws.on('pong', () => ws.isAlive = true);
            ws.send(JSON.stringify(player));
        });

        const cleanUpInterval = setInterval(() => {
            for (const roomGuid of Object.keys(this.roomService.getRooms())) {
                const room = this.roomService.getRooms()[roomGuid];
                const playersInRoom = Array.from(this.wssGame.clients).filter(client => (client as any).roomGuid === room.guid).map(client => (client as any).playerGuid);
                const closedPlayers = room.players.filter(p => playersInRoom.every(pir => pir !== p.guid));
                for (const closedPlayer of closedPlayers) {
                    this.roomService.deleteUserFromRoom(room.guid, closedPlayer);
                }
            }            
        }, 30000);

        const interval = setInterval(() => {
            this.wssGame.clients.forEach((ws) => {
                if (ws.isAlive === false) {
                    return ws.terminate();
                }

                ws.isAlive = false;
                ws.ping();
                ws.send(JSON.stringify(this.roomService.getRooms()[ws.roomGuid]));
            });
        }, 5000);

        this.wssGame.on('close', () => {
            clearInterval(interval);
            clearInterval(cleanUpInterval);
        });
    }

    public sendToUser() {
        // this.wssGame.clients.forEach(function each(client) {
        //     if (client !== ws && client.readyState === WebSocket.OPEN) {
        //       client.send(data);
        //     }
        //   });
    }
}