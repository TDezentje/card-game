import { GameService } from './game.service';

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
                if (data === "stop") {
                    self.gameService.stopGame(this.playerGuid);
                    this.send("stopped");
                }

                if (data === "start") {
                    self.gameService.startGame(this.playerGuid);
                    this.send("started");
                }

                if (data === "join") {
                    const player = self.gameService.joinGame();
                    this.send(JSON.stringify(player));
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
}