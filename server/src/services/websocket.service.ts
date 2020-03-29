import { GameService } from './game.service';
import { Turn } from 'models/turn.model';
import { Room } from 'models/room.model';

const WebSocket = require('ws');

export enum GameAction {
    Join = 'join',
    PlayerJoined = 'player-joined',
    Start = 'start',
    NextPlayer = 'next-player',
    Effect = 'effect',
    Play = 'play',
    Gameover = 'gameover',
    Finished = 'finished',
    PlayerLeft = 'player-left',
    NextGame = 'next-game',
    TakeCards = 'take-cards'
}
export class WebsocketService {
    private wssGame;
    private gameService: GameService;

    public constructor() {
        this.gameService = new GameService(this);
    }

    public createWebserver() {
        this.gameService.loadGames();

        this.wssGame = new WebSocket.Server({ port: 8001 });
        this.wssGame.on('connection', (ws) => {
            const result = this.gameService.joinGame();
            ws.isAlive = true;
            ws.playerGuid = result.player.guid;
            ws.roomGuid = result.room.guid;
            ws.on('pong', () => ws.isAlive = true);
            ws.send(this.wrapMessage(GameAction.Join, {
                player: result.player,
                players: result.room.players
            }));

            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            ws.on('message', function (data) {
                const turn: Turn = JSON.parse(data);

                switch (turn.action) {
                    case GameAction.Start:
                        self.gameService.startGame(this.playerGuid);
                        break;
                    case GameAction.Play:
                        self.gameService.playCard(this.playerGuid, turn.cardGuid);
                        break;
                    case GameAction.NextGame:
                        self.gameService.nextGame(this.playerGuid);
                        break;
                    case GameAction.TakeCards:
                        self.gameService.takeCards(this.playerGuid);
                        break;
                }

                if (turn.action === "effect-response") {
                    
                }
            });

            ws.on('close', function () {
                self.gameService.leaveGame(this.playerGuid);
            });
        });
    }

    public sendMessageToPlayer(playerGuid: string, action: GameAction, message: any) {
        this.wssGame.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client.playerGuid === playerGuid) {
                client.send(this.wrapMessage(action, message));
            }
        });
    }

    public sendMessageToRoom(room: Room, action: GameAction, message?: any, exceptPlayerGuids?: string[]) {
        this.wssGame.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client.roomGuid === room.guid && 
                (!exceptPlayerGuids || !exceptPlayerGuids.includes(client.playerGuid))) {
                client.send(this.wrapMessage(action, message));
            }
        });
    }

    private wrapMessage(action: GameAction, actionData?: any) {
        return JSON.stringify({
            action,
            actionData
        });
    }
}