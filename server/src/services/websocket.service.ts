import { GameService } from './game.service';
import { Turn } from 'models/turn.model';
import { Card } from 'models/card.model';

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
            ws.playerGuid = result.data.guid;
            ws.on('pong', () => ws.isAlive = true);
            ws.send(JSON.stringify(result));

            if (result.players.length > 1) {
                result.action = "player-joined";
                for (const player of result.players.filter(p => p.guid !== ws.playerGuid)) {
                    this.sendMessageToPlayer(player.guid, result);
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
                            self.sendMessageToPlayer(player.guid, result);
                        }
                    } else {
                        this.send(JSON.stringify(result));
                    }
                }

                if (turn.action === "start") {
                    const result = self.gameService.startGame(this.playerGuid);

                    if (result.isStarted) {
                        for (const player of result.players) {
                            self.sendMessageToPlayer(player.guid, {
                                action: "start",
                                isStarted: true,
                                players: JSON.parse(JSON.stringify(result.players)).map(p => {
                                    if (p.guid !== player.guid) {
                                        p.cards = p.cards.map(c => ({ guid: c.guid }));
                                    }
                                    return p;
                                })
                            });
                        }
                    } else {
                        this.send(JSON.stringify(result));
                    }
                }

                if (turn.action === "join") {
                    const result = self.gameService.joinGame();
                    this.send(JSON.stringify(result));
                    if (result.players.length > 1) {
                        result.action = "player-joined";
                        result.data.cards = result.data.cards.map(() => new Card());

                        for (const player of result.players.filter(p => p.guid !== ws.playerGuid)) {
                            self.sendMessageToPlayer(player.guid, result);
                        }
                    }
                }

                if (turn.action === "next-game") {
                    const result = self.gameService.resetGame(this.playerGuid);
                    for (const player of result.players) {
                        self.sendMessageToPlayer(player.guid, {
                            action: "start",
                            isStarted: true,
                            players: JSON.parse(JSON.stringify(result.players)).map(p => {
                                if (p.guid !== player.guid) {
                                    p.cards = p.cards.map(c => ({ guid: c.guid }));
                                }
                                return p;
                            })
                        });
                    }
                }

                if (turn.action === "play") {
                    const result = self.gameService.playCard(this.playerGuid, turn.cardGuid);
                    if(result !== null){
                        for (const player of result.players) {
                            self.sendMessageToPlayer(player.guid, {
                                action: "played",
                                isStarted: !result.data.gameOver,
                                data: {
                                    playerGuid: this.playerGuid,
                                    cardGuid: turn.cardGuid,
                                    card: result.data.card,
                                    nextPlayerGuid: result.nextPlayer && result.nextPlayer.guid,
                                    result: result.data.result
                                }
                            });

                            if(result.data.gameOver){
                                self.sendMessageToPlayer(player.guid, {
                                    action: "gameover",
                                    isStarted: !result.data.gameOver,
                                    data: {
                                        playerGuid: this.playerGuid,
                                        cardGuid: turn.cardGuid,
                                        card: result.data.card,
                                        result: result.data.result
                                    }
                                });
                            }
                            if (result.players.every(p => p.cards.length === 0)) {
                                self.sendMessageToPlayer(player.guid, {
                                    action: "finished"
                                });
                            }

                        }
                    }
                }
            });

            ws.on('close', function () {
                self.gameService.leaveGame(this.playerGuid);
                for (const player of result.players.filter(p => p.guid !== ws.playerGuid)) {
                    self.sendMessageToPlayer(player.guid, {
                        action: 'player-left',
                        guid: this.playerGuid
                    });
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
}