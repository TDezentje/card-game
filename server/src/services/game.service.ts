import { Game } from 'models/game.model';
import { TheMind } from 'games/themind';
import { Player } from 'models/player.model';
import { PlayerService } from './player.service';
import { RoomService } from './room.service';
import { GameState } from 'models/game-state.model';

export class GameService {
    private activeGameInRooms: { [roomId: string]: Game } = {};
    private games: Game[] = [];
    private playerService: PlayerService = new PlayerService();
    private roomService: RoomService = new RoomService();

    public loadGames() {
        this.games = [];
        const theMind = TheMind.game;
        theMind.cardsToUse = JSON.parse(JSON.stringify(theMind.cards));
        theMind.cardsOnStack = [];
        this.games.push(theMind);
    }

    public createGame() {
        const game = this.getRandomGame();
        const room = this.roomService.createRoom(game);
        this.activeGameInRooms[room.guid] = game;
    }

    public startGame(playerGuid: string): GameState{
        const player = this.playerService.getPlayer(playerGuid);
        const gameState = new GameState();
        if (player.isAdmin) {
            const room = this.getRoomByPlayerGuid(playerGuid);
            this.roomService.startRoom(room.guid);
            gameState.action = "start";
            gameState.isStarted = true;
            gameState.players = room.players;

            for (const player of room.players) {
                this.getNewCardsInHand(room.guid, player);
            }
        }
        return gameState;
    }

    public stopGame(playerGuid: string): GameState {
        const player = this.playerService.getPlayer(playerGuid);
        const gameState = new GameState();
        if (player.isAdmin) {
            const room = this.getRoomByPlayerGuid(playerGuid);
            this.roomService.deleteRoom(room.guid);
            this.activeGameInRooms[room.guid] = null;
            gameState.action = "stop";
            gameState.isStarted = false;
            gameState.players = room.players;
        }
        return gameState;
    }

    public joinGame(): GameState {
        if (this.roomService.getRooms().some(r => !r.isStarted)) {
            const player = this.playerService.createPlayer();
            const room = this.roomService.getRooms().find(r => !r.isStarted);
            const gameState = new GameState();
            gameState.action = "join";
            gameState.data = player;
            gameState.isStarted = room.isStarted;
            gameState.players = room.players;
            if (room.players.length === 0) {
                player.isAdmin = true;
            }
            this.roomService.addUserToRoom(room.guid, player);
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
        const gameState = new GameState();
        gameState.action = "leave";
        gameState.players = room.players;
        return gameState;
    }

    public cleanUpInActiveUsers(clients) {
        for (const room of this.roomService.getRooms()) {
            const playersInRoom = clients.filter(client => (client as any).roomGuid === room.guid).map(client => (client as any).playerGuid);
            const closedPlayers = room.players.filter(p => playersInRoom.every(pir => pir !== p.guid));
            for (const closedPlayer of closedPlayers) {
                this.roomService.deleteUserFromRoom(room.guid, closedPlayer);
            }
        }
    }

    public getRandomGame() {
        const idx = Math.floor(Math.random() * Math.floor(this.games.length));
        return this.games[idx];
    }

    public getCardsFromGame(playerGuid: string) {
        const room = this.getRoomByPlayerGuid(playerGuid);
        return this.activeGameInRooms[room.guid].cards;
    }

    public getCardsToUseFromGame(playerGuid: string) {
        const room = this.getRoomByPlayerGuid(playerGuid);     
        const gameState = new GameState();
        gameState.players = room.players;
        gameState.action = "cardsToUse";
        gameState.data = this.activeGameInRooms[room.guid].cardsToUse;
        return gameState;
    }

    public getCardsOnStackFromGame(playerGuid: string): GameState {
        const room = this.getRoomByPlayerGuid(playerGuid);
        const gameState = new GameState();
        gameState.players = room.players;
        gameState.action = "cardsOnStack";
        gameState.data = this.activeGameInRooms[room.guid].cardsOnStack;
        return gameState;
    }

    public getNewCardsInHand(roomGuid: string, player: Player) {
        player.cards = [];
        const activeGameInRoom = this.getGameInRoom(roomGuid);
        for (let idx = 0; idx < activeGameInRoom.numberOfCardsInHand; idx++) {
            const randomIdx = Math.floor(Math.random() * Math.floor(this.activeGameInRooms[roomGuid].cardsToUse.length));
            const card = activeGameInRoom.cardsToUse.splice(randomIdx, 1);
            player.cards.push(...card);
        }
    }

    public playCard(playerGuid: string, cardGuid: string): GameState {
        const room = this.getRoomByPlayerGuid(playerGuid);
        const game = this.getGameInRoom(room.guid);
        const card = game.cards.find(c => c.guid === cardGuid);
        room.players = room.players.map(p => {
            p.cards = p.cards.filter(c => c.guid !== cardGuid);
            return p;
        });
        const valid = {
            card: card
        }
        const gameState = new GameState();
        gameState.players = room.players;
        gameState.action = "play";
        if (!this.isValidMove(room.guid, cardGuid)) {
            valid.gameOver =  !game.allowInvalidMoves;
            valid.result = false;
        } else {
            valid.gameOver = false;
            valid.result = true;
        }
        gameState.data = valid;
        return gameState;
    }

    private isValidMove(roomGuid: string, cardGuid: string): boolean {
        const activeGameInRoom = this.getGameInRoom(roomGuid);
        const lastCardIdx = activeGameInRoom.cardsOnStack.length - 1;
        let lastPlayedCard;
        if (lastCardIdx >= 0) {
            lastPlayedCard = activeGameInRoom.cardsOnStack[lastCardIdx];
        }
        const card = activeGameInRoom.cards.find(c => c.guid === cardGuid);
        let isValid = true;
        for (const rule of activeGameInRoom.rules) {
            if (rule.operation === "bigger") {
                if (lastPlayedCard && lastPlayedCard[rule.property] >= card[rule.property]) {
                    isValid = false;                    
                    break;
                }
            }
        }
        activeGameInRoom.cardsOnStack.push(card);
        return isValid;
    }

    public getRoomByPlayerGuid(playerGuid: string) {
        return this.roomService.getRooms().find(r => r.players.some(p => p.guid === playerGuid));
    }
    
    private getGameInRoom(roomGuid: string) {
        return this.activeGameInRooms[roomGuid];
    }
}