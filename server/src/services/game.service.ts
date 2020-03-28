import { Game } from 'models/game.model';
import { TheMind } from 'games/themind';
import { Player } from 'models/player.model';
import { Card } from 'models/card.model';
import { PlayerService } from './player.service';
import { RoomService } from './room.service';

export class GameService {
    private activeGameInRooms: { [roomId: string]: Game } = {};
    private games: Game[] = [];
    private playerService: PlayerService = new PlayerService();
    private roomService: RoomService = new RoomService();

    public loadGames() {
        this.games = [];
        const theMind = TheMind.game;
        theMind.usedCards = theMind.cards;
        this.games.push(theMind);
    }

    public createGame() {
        const game = this.getRandomGame();
        const room = this.roomService.createRoom(game);
        this.activeGameInRooms[room.guid] = game;
    }

    public startGame(playerGuid: string) {
        const player = this.playerService.getPlayer(playerGuid);
        if (player.isAdmin) {
            const room = this.roomService.getRooms().find(r => r.players.some(p => p.guid === playerGuid));
            this.roomService.startRoom(room.guid);
        }
    }

    public stopGame(playerGuid: string) {
        const player = this.playerService.getPlayer(playerGuid);
        if (player.isAdmin) {
            const room = this.roomService.getRooms().find(r => r.players.some(p => p.guid === playerGuid));
            this.roomService.deleteRoom(room.guid);
            this.activeGameInRooms[room.guid] = null;
        }
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

    public getCardsFromGame(roomGuid: string) {
        return this.activeGameInRooms[roomGuid].cards;
    }

    public getUsedCardsFromGame(roomGuid: string) {
        return this.activeGameInRooms[roomGuid].usedCards;
    }

    public getNewCardsInHand(roomGuid: string, player: Player) {
        player.cards = [];
        const activeGameInRoom = this.activeGameInRooms[roomGuid];
        for (let idx = 0; idx < activeGameInRoom.numberOfCardsInHand; idx++) {
            const randomIdx = Math.floor(Math.random() * Math.floor(this.activeGameInRooms[roomGuid].usedCards.length));
            const card = activeGameInRoom.usedCards.splice(randomIdx, 1);
            player.cards.push(...card);
        }
    }

    public isValidMove(roomGuid: string, card: Card): boolean {
        const activeGameInRoom = this.activeGameInRooms[roomGuid];
        const lastPlayedCard = activeGameInRoom.stackCards[activeGameInRoom.stackCards.length - 1];
        for (const rule of activeGameInRoom.rules) {
            if (rule.operation === "bigger") {
                if (lastPlayedCard[rule.property] < card[rule.property]) {
                    return true;
                }
                return false;
            }
        }
    }
}