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
            
            if(result.players.length > 1){
                result.action = "player-joined";
                this.broadcastMessage(result, ws.playerGuid);
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
                                        p.cards = p.cards.map(c => ({guid: c.guid}));
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
                    if(result.players.length > 1){
                        result.action = "player-joined";
                        result.data.cards = result.data.cards.map(() => new Card());
                        
                        self.broadcastMessage(result);
                    }
                }

                if (turn.action === "play") {
                    const result = self.gameService.playCard(this.playerGuid, turn.cardGuid);       
                    for (const player of result.players) {
                        self.sendMessageToPlayer(player.guid, {
                            action: result.data.gameOver ? "gameover": "played",
                            isStarted: !result.data.gameOver,
                            data: {
                                playerGuid: this.playerGuid,
                                cardGuid: turn.cardGuid,
                                card: result.data.card
                            }
                        });
                    }
                }

                if (turn.action === "getcards") {
                    const result = self.gameService.playCard(this.playerGuid, turn.cardGuid);
                    if (result.data.gameOver) {
                        self.broadcastMessage({
                            action: "gameover",
                            isStarted: false,
                            players: result.players
                        });
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

            ws.on('close', function () {
                self.gameService.leaveGame(this.playerGuid);
                self.broadcastMessage({
                    action: 'player-left',
                    guid: this.playerGuid
                });
            });
        });

        // const cleanUpInterval = setInterval(() => {
        //     this.gameService.cleanUpInActiveUsers(Array.from(this.wssGame.clients));
        // }, 30000);

        // const interval = setInterval(() => {
        //     this.wssGame.clients.forEach((ws) => {
        //         if (ws.isAlive === false) {
        //             return ws.terminate();
        //         }

        //         ws.isAlive = false;
        //         ws.ping();
        //     });
        // }, 5000);

        // this.wssGame.on('close', () => {
        //     clearInterval(interval);
        //     clearInterval(cleanUpInterval);
        // });
    }

    private broadcastMessage(message, playerGuid?: string) {
        this.wssGame.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && (!playerGuid || playerGuid !== client.playerGuid)) {
                client.send(JSON.stringify(message));
            }
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