import { Game } from 'models/game.model';
import { TheMind } from 'games/themind';
import { Player } from 'models/player.model';
import { PlayerService } from './player.service';
import { RoomService } from './room.service';
import { GameState } from 'models/game-state.model';
import { GameLogic } from 'games/game.logic';

export class GameService {
    private activeGameInRooms: { [roomId: string]: Game } = {};
    private games: GameLogic[] = [];
    private playerService: PlayerService = new PlayerService();
    private roomService: RoomService = new RoomService();

    public loadGames() {
        this.games = [];
        const theMind = new TheMind();
        theMind.game.cardsToUse = JSON.parse(JSON.stringify(theMind.game.cards));
        theMind.game.cardsOnStack = [];
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

    public resetGame(playerGuid: string): GameState{
        const player = this.playerService.getPlayer(playerGuid);
        const gameState = new GameState();
        if (player.isAdmin) {
            const room = this.getRoomByPlayerGuid(playerGuid);
            if(room.game.hasNextLevel){
                this.games.find(g => g.id === room.game.name).nextLevel(room.game);
            } else {
                const game = this.getRandomGame();
                room.game = game;
                this.activeGameInRooms[room.guid] = game;
            }
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

    public getRandomGame() {
        const idx = Math.floor(Math.random() * Math.floor(this.games.length));
        return this.games[idx].game;
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
            gameOver: false,
            result: true,
            card: card
        };
        const gameState = new GameState();
        gameState.players = room.players;
        gameState.action = "play";
        if (!this.games.find(g => g.id === game.name).isValidCard(cardGuid, game.cardsOnStack, game.cardsToUse)) {
            valid.gameOver =  !game.allowInvalidMoves;
            valid.result = false;
        }
        game.cardsOnStack.push(card);
        gameState.data = valid;
        return gameState;
    }

    public getRoomByPlayerGuid(playerGuid: string) {
        return this.roomService.getRooms().find(r => r.players.some(p => p.guid === playerGuid));
    }
    
    private getGameInRoom(roomGuid: string) {
        return this.activeGameInRooms[roomGuid];
    }
}