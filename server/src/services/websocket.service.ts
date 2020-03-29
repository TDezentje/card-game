import { GameService } from './game.service';
import { Turn } from 'models/turn.model';
import { GameState } from 'models/gamestate.model';
import { Player } from 'models/player.model';

const WebSocket = require('ws');

export class WebsocketService {
    private wssGame;
    private gameService: GameService = new GameService();

    public createWebserver() {
        this.gameService.loadGames();
        this.gameService.createGame();

        this.wssGame = new WebSocket.Server({ port: 8001 });
        this.wssGame.on('connection', (ws) => {
            const result = this.gameService.joinGame();
            ws.isAlive = true;
            ws.playerGuid = result.actionByPlayer.guid;
            ws.on('pong', () => ws.isAlive = true);
            ws.send(JSON.stringify(result));

            if (result.players.length > 1) {
                result.action = "player-joined";
                for (const player of result.players.filter(p => p.guid !== ws.playerGuid)) {
                    this.sendMessageToPlayer(player.guid, this.prepareDataForSending(result, player));
                }
            }

            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            ws.on('message', function (data) {
                const turn: Turn = JSON.parse(data);
                if (turn.action === "stop") {
                    const result = self.gameService.stopGame(this.playerGuid);
                    if (!result.isStarted) {
                        for (const player of result.players) {
                            self.sendMessageToPlayer(player.guid, self.prepareDataForSending(result, player));
                        }
                    } else {
                        this.send(JSON.stringify(result));
                    }
                }

                if (turn.action === "start") {
                    const result = self.gameService.startGame(this.playerGuid);

                    if (result.isStarted) {
                        for (const player of result.players) {
                            self.sendMessageToPlayer(player.guid, self.prepareDataForSending(result, player));
                        }
                    }
                }

                if (turn.action === "join") {
                    const result = self.gameService.joinGame();
                    this.send(JSON.stringify(result));
                    
                    if (result.players.length > 1) {
                        result.action = "player-joined";
                        for (const player of result.players.filter(p => p.guid !== ws.playerGuid)) {
                            self.sendMessageToPlayer(player.guid, self.prepareDataForSending(result, player));
                        }
                    }
                }

                if (turn.action === "next-game") {
                    const result = self.gameService.resetGame(this.playerGuid);
                    for (const player of result.players) {
                        self.sendMessageToPlayer(player.guid, self.prepareDataForSending(result, player));
                    }
                }

                if (turn.action === "play") {
                    const result = self.gameService.playCard(this.playerGuid, turn.cardGuid);
                    for (const player of result.players) {
                        self.sendMessageToPlayer(player.guid, self.prepareDataForSending(result, player));

                        if (result.data.gameOver) {
                            const copyResult = self.prepareDataForSending(result, player);
                            copyResult.action = "gameover";
                            self.sendMessageToPlayer(player.guid, copyResult);
                        }

                        if (result.players.every(p => p.cards.length === 0)) {
                            self.sendMessageToPlayer(player.guid, {
                                action: "finished"
                            });
                        }

                    }
                }
            });

            ws.on('close', function () {
                const result = self.gameService.leaveGame(this.playerGuid);
                for (const player of result.players.filter(p => p.guid !== ws.playerGuid)) {
                    self.sendMessageToPlayer(player.guid, self.prepareDataForSending(result, player));
                }
            });
        });
    }

    private sendMessageToPlayer(playerGuid: string, message) {
        this.wssGame.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && client.playerGuid === playerGuid) {
                client.send(JSON.stringify(message));
            }
        });
    }

    private prepareDataForSending(result: GameState, player: Player): GameState {
        const copyResult: GameState = JSON.parse(JSON.stringify(result));
        copyResult.players = JSON.parse(JSON.stringify(result.players)).map(p => {
            if (p.cards && p.guid !== player.guid) {
                p.cards = p.cards.map(c => ({ guid: c.guid }));
            }
            return p;
        });
        return copyResult;
    }
}