import { TheMind } from 'games/themind';
import { CrazyEights } from 'games/crazyEights';
import { Player } from 'models/player.model';
import { PlayerService } from './player.service';
import { RoomService } from './room.service';
import { GameState } from 'models/gamestate.model';
import { GameLogic } from 'games/game.logic';
import { Room } from 'models/room.model';

export class GameService {
    private games: GameLogic[] = [];
    private playerService: PlayerService = new PlayerService();
    private roomService: RoomService = new RoomService();

    public loadGames() {
        this.games = [];
        const theMind = new TheMind();
        theMind.game.cardsToUse = JSON.parse(JSON.stringify(theMind.game.cards));
        theMind.game.cardsOnStack = [];
        this.games.push(theMind);
        const crazyEights = new CrazyEights();
        crazyEights.game.cardsToUse = JSON.parse(JSON.stringify(crazyEights.game.cards));
        crazyEights.game.cardsOnStack = [];
        this.games.push(crazyEights);
    }

    public createGame() {
        const game = this.getRandomGame();
        this.roomService.createRoom(game);
    }

    public startGame(playerGuid: string): GameState {
        const room = this.getRoomByPlayerGuid(playerGuid);
        const gameState = this.prepareGameState(playerGuid, room);
        if (gameState.actionByPlayer.isAdmin) {
            this.roomService.startRoom(room.guid);
            gameState.action = "start";

            for (const player of room.players) {
                this.getNewCardsInHand(room, player);
            }

            if (room.game.turnBased) {
                room.nextPlayer = room.players[0];
                gameState.data = {
                    nextPlayerGuid: room.nextPlayer.guid
                };
            }
        }
        return gameState;
    }

    public stopGame(playerGuid: string): GameState {
        const room = this.getRoomByPlayerGuid(playerGuid);
        const gameState = this.prepareGameState(playerGuid, room);
        if (gameState.actionByPlayer.isAdmin) {
            const room = this.getRoomByPlayerGuid(playerGuid);
            room.game = null;
            gameState.action = "stop";
        }
        return gameState;
    }

    public resetGame(playerGuid: string): GameState {
        const room = this.getRoomByPlayerGuid(playerGuid);
        const gameState = this.prepareGameState(playerGuid, room);
        if (gameState.actionByPlayer.isAdmin) {
            if (room.game.hasNextLevel && !room.game.gameOver) {
                this.findGameLogic(room.game.name).nextLevel(room.game);
            } else {
                const game = this.getRandomGame();
                this.findGameLogic(game.name).resetGame(game);
                room.game = game;
            }
            this.startGame(playerGuid);
        }
        return gameState;
    }

    public joinGame(): GameState {
        if (this.roomService.getRooms().some(r => !r.isStarted)) {
            const player = this.playerService.createPlayer();
            const room = this.roomService.getRooms().find(r => !r.isStarted);
            const gameState = this.prepareGameState(player.guid, room);
            gameState.action = "join";

            if (room.players.length === 0) {
                player.isAdmin = true;
            }
            this.roomService.addUserToRoom(room.guid, player);
            this.playerService.updatePlayerColor(player.guid, room.players);
            return gameState;
        } else {
            this.createGame();
            return this.joinGame();
        }
    }

    public leaveGame(playerGuid: string): GameState {
        const room = this.getRoomByPlayerGuid(playerGuid);
        if (room) {
            room.players.splice(room.players.findIndex(p => p.guid === playerGuid), 1);
        }
        const gameState = this.prepareGameState(playerGuid, room);
        gameState.action = "player-left";
        return gameState;
    }

    public getRandomGame() {
        const idx = Math.floor(Math.random() * Math.floor(this.games.length));
        return JSON.parse(JSON.stringify(this.games[idx].game));
    }

    public getNewCardsInHand(room: Room, player: Player) {
        player.cards = [];
        for (let idx = 0; idx < room.game.numberOfCardsInHand; idx++) {
            const randomIdx = Math.floor(Math.random() * Math.floor(room.game.cardsToUse.length));
            const card = room.game.cardsToUse.splice(randomIdx, 1);
            player.cards.push(...card);
        }
    }

    public playCard(playerGuid: string, cardGuid: string): GameState {
        const room = this.getRoomByPlayerGuid(playerGuid);
        const card = room.game.cards.find(c => c.guid === cardGuid);
        room.players = room.players.map(p => {
            p.cards = p.cards.filter(c => c.guid !== cardGuid);
            return p;
        });

        const gameState = this.prepareGameState(playerGuid, room);
        gameState.action = "played";
        gameState.data = {
            gameOver: false,
            isValid: true,
            card: card,
            cardGuid: cardGuid
        };
        if (!this.games.find(g => g.id === room.game.name).isValidCard(cardGuid, room.game.cardsOnStack, room.game.cardsToUse)) {
            gameState.data.gameOver = !room.game.allowInvalidMoves;
            gameState.data.isValid = false;
        }
        if (room.game.turnBased) {
            let currentPlayerIdx = room.players.findIndex(p => p.guid === room.nextPlayer.guid);
            currentPlayerIdx++;
            if (currentPlayerIdx === room.players.length) {
                currentPlayerIdx = 0;
            }
            room.nextPlayer = room.players[currentPlayerIdx];
            gameState.data.nextPlayerGuid = room.nextPlayer.guid;
        }
        room.game.gameOver = gameState.data.gameOver;
        if (gameState.data.isValid) {
            room.game.cardsOnStack.push(card);
        }
        return gameState;
    }

    public getRoomByPlayerGuid(playerGuid: string) {
        return this.roomService.getRooms().find(r => r.players.some(p => p.guid === playerGuid));
    }

    private findGameLogic(gameName: string) {
        return this.games.find(g => g.id === gameName);
    }

    private prepareGameState(playerGuid: string, room: Room): GameState {
        const player = this.playerService.getPlayer(playerGuid);
        const gameState = new GameState();
        gameState.actionByPlayer = player;
        gameState.isStarted = room.isStarted;
        gameState.players = room.players;

        return gameState;
    }
}