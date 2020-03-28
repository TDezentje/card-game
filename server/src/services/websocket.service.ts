import { GameService } from './game.service';
import { Turn } from 'models/turn.model';
import { State } from 'models/game-state.model';

const WebSocket = require('ws');

export class WebsocketService {
    private wssGame;
    private gameService: GameService = new GameService();

    public createWebserver() {
        this.gameService.loadGames();
        this.gameService.createGame();

        this.wssGame = new WebSocket.Server({ port: 8001 });
        this.wssGame.on('connection', (ws) => {
            const player = this.gameService.joinGame();
            ws.isAlive = true;
            ws.playerGuid = player.guid;
            ws.on('pong', () => ws.isAlive = true);
            ws.send(JSON.stringify(player));
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            ws.on('message', function (data) {
                const turn: Turn = JSON.parse(data);
                if (turn.action === "stop") {
                    const result = self.gameService.stopGame(this.playerGuid);
                    if (result.state === State.Stopped) {
                        self.broadcastMessage(result);
                    } else {
                        this.send(JSON.stringify(result));
                    }
                }

                if (turn.action === "start") {
                    const result = self.gameService.startGame(this.playerGuid);
                    if (result.state === State.Stopped) {
                        self.broadcastMessage(result);
                    } else {
                        this.send(JSON.stringify(result));
                    }
                }

                if (turn.action === "join") {
                    const player = self.gameService.joinGame();
                    this.send(JSON.stringify(player));
                }

                if (turn.action === "play") {
                    const result = self.gameService.playCard(this.playerGuid, turn.cardGuid);
                    if (result.gameOver) {
                        self.broadcastMessage(result);
                    } else {
                        this.send(JSON.stringify(result));
                    }
                }

                if (turn.action === "cardsOnStack") {
                    const result = self.gameService.getCardsOnStackFromGame(this.playerGuid);
                    this.send(JSON.stringify(result));
                }

                if (turn.action === "cardsToUse") {
                    const result = self.gameService.getCardsToUseFromGame(this.playerGuid);
                    this.send(JSON.stringify(result));
                }
            });
        });

        const cleanUpInterval = setInterval(() => {
            this.gameService.cleanUpInActiveUsers(Array.from(this.wssGame.clients));
        }, 30000);

        const interval = setInterval(() => {
            this.wssGame.clients.forEach((ws) => {
                if (ws.isAlive === false) {
                    return ws.terminate();
                }

                ws.isAlive = false;
                ws.ping();
            });
        }, 5000);

        this.wssGame.on('close', () => {
            clearInterval(interval);
            clearInterval(cleanUpInterval);
        });
    }

    private broadcastMessage(message) {
        this.wssGame.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
}