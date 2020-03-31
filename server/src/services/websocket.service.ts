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
    TakeCards = 'take-cards',
    AdminChanged = 'admin-changed',
    EffectResponse = 'effect-response',
    FocusCard = 'focus-card',
    UnfocusCard = 'unfocus-card',
    PlayerCreated = 'player-created',
    RoomCreate = 'room-create',
    RoomLeave = 'room-leave',
    RoomUpdated = 'room-updated',
    RoomRemoved = 'room-removed'
}
export class WebsocketService {
    private wssGame;
    private gameService: GameService;

    public constructor() {
        this.gameService = new GameService(this);
    }

    public createWebserver() {
        this.gameService.loadGames();

        this.wssGame = new WebSocket.Server({ noServer: true });
        this.wssGame.on('connection', (ws) => {
            const result = this.gameService.createPlayer();
            ws.isAlive = true;
            ws.playerGuid = result.player.guid;
            ws.on('pong', () => ws.isAlive = true);
            ws.send(this.wrapMessage(GameAction.PlayerCreated, {
                player: result.player,
                games: result.games,
                rooms: result.rooms
            }));

            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            ws.on('message', function (data) {
                const turn: Turn = JSON.parse(data);

                switch (turn.action) {
                    case GameAction.Join:
                        ws.roomGuid = turn.roomGuid;
                        self.gameService.joinGame(this.playerGuid, turn.roomGuid);
                        break;
                    case GameAction.RoomCreate:
                        const roomGuid = self.gameService.createRoom(this.playerGuid, turn.gameGuid);
                        ws.roomGuid = roomGuid;
                        break;
                    case GameAction.RoomLeave:
                        self.gameService.leaveRoom(this.playerGuid);
                        break;
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
                    case GameAction.EffectResponse:
                        self.gameService.effectResponse(this.playerGuid, turn.optionGuid);
                        break;
                    case GameAction.FocusCard:
                        self.sendMessageToRoomByGuid(ws.roomGuid, GameAction.FocusCard, {
                            playerGuid: result.player.guid,
                            cardGuid: turn.cardGuid
                        });
                        break;
                    case GameAction.UnfocusCard:
                        self.sendMessageToRoomByGuid(ws.roomGuid, GameAction.UnfocusCard, {
                            playerGuid: result.player.guid,
                            cardGuid: turn.cardGuid
                        });
                        break;
                }
            });

            ws.on('close', function () {
                self.gameService.leaveGame(this.playerGuid);
            });
        });

        return this.wssGame;
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

    public sendMessageToRoomByGuid(roomGuid: string, action: GameAction, message?: any, exceptPlayerGuids?: string[]) {
        this.wssGame.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client.roomGuid === roomGuid &&
                (!exceptPlayerGuids || !exceptPlayerGuids.includes(client.playerGuid))) {
                client.send(this.wrapMessage(action, message));
            }
        });
    }

    public sendMessage(action: GameAction, message?: any) {
        this.wssGame.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
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
