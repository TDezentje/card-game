import { Game } from 'models/game.model';
import { TheMind } from 'games/themind';
import { Player } from 'models/player.model';
import { PlayerService } from './player.service';
import { RoomService } from './room.service';
import { Valid } from 'models/valid.model';
import { GameState, State } from 'models/game-state.model';

export class GameService {
    private activeGameInRooms: { [roomId: string]: Game } = {};
    private games: Game[] = [];
    private playerService: PlayerService = new PlayerService();
    private roomService: RoomService = new RoomService();

    public loadGames() {
        this.games = [];
        const theMind = TheMind.game;
        theMind.cardsToUse = theMind.cards;
        theMind.cardsOnStack = [];
        this.games.push(theMind);
    }

    public createGame() {
        const game = this.getRandomGame();
        const room = this.roomService.createRoom(game);
        this.activeGameInRooms[room.guid] = game;
    }

    public getGameInRoom(roomGuid: string) {
        return this.activeGameInRooms[roomGuid];
    }

    public startGame(playerGuid: string): GameState{
        const player = this.playerService.getPlayer(playerGuid);
        const gameState = new GameState();
        if (player.isAdmin) {
            const room = this.getRoomByPlayerGuid(playerGuid);
            this.roomService.startRoom(room.guid);
            gameState.state = State.Started;
            return gameState;
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
            gameState.state = State.Stopped;
            return gameState;
        }
        return gameState;
    }

    public joinGame(): Player {
        if (this.roomService.getRooms().some(r => !r.isStarted)) {
            const player = this.playerService.createPlayer();
            const room = this.roomService.getRooms().find(r => !r.isStarted);
            if (room.players.length === 0) {
                player.isAdmin = true;
            }
            this.roomService.addUserToRoom(room.guid, player);
            this.getNewCardsInHand(room.guid, player);
            return player;
        } else {
            this.createGame();
            return this.joinGame();
        }
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
        return this.activeGameInRooms[room.guid].cardsToUse;
    }

    public getCardsOnStackFromGame(playerGuid: string) {
        const room = this.getRoomByPlayerGuid(playerGuid);
        return this.activeGameInRooms[room.guid].cardsOnStack;
    }

    public getNewCardsInHand(roomGuid: string, player: Player) {
        player.cards = [];
        const activeGameInRoom = this.activeGameInRooms[roomGuid];
        for (let idx = 0; idx < activeGameInRoom.numberOfCardsInHand; idx++) {
            const randomIdx = Math.floor(Math.random() * Math.floor(this.activeGameInRooms[roomGuid].cardsToUse.length));
            const card = activeGameInRoom.cardsToUse.splice(randomIdx, 1);
            player.cards.push(...card);
        }
    }

    public playCard(playerGuid: string, cardGuid: string): Valid {
        const player = this.playerService.getPlayer(playerGuid);
        const room = this.getRoomByPlayerGuid(player.guid);
        const valid = new Valid();
        const game = this.getGameInRoom(room.guid);
        if (!this.isValidMove(room.guid, cardGuid)) {
            valid.gameOver =  !game.allowInvalidMoves;
            valid.result = false;
        } else {
            valid.gameOver = false;
            valid.result = true;
        }
        return valid;
    }

    private isValidMove(roomGuid: string, cardGuid: string): boolean {
        const activeGameInRoom = this.activeGameInRooms[roomGuid];
        const lastCardIdx = activeGameInRoom.cardsOnStack.length - 1;
        let lastPlayedCard;
        if (lastCardIdx >= 0) {
            lastPlayedCard = activeGameInRoom.cardsOnStack[lastCardIdx];
        }
        const card = activeGameInRoom.cards.find(c => c.guid === cardGuid);
        for (const rule of activeGameInRoom.rules) {
            if (rule.operation === "bigger") {
                if (!lastPlayedCard || lastPlayedCard[rule.property] < card[rule.property]) {
                    return true;
                }
                return false;
            }
        }
    }

    private getRoomByPlayerGuid(playerGuid: string) {
        return this.roomService.getRooms().find(r => r.players.some(p => p.guid === playerGuid));
    }
}