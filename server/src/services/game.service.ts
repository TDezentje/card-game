import { TheMind } from 'games/themind';
import { CrazyEights } from 'games/crazyEights';
import { Player } from 'models/player.model';
import { PlayerService } from './player.service';
import { RoomService } from './room.service';
import { GameLogic, GameEffect } from 'games/game.logic';
import { Room } from 'models/room.model';
import { WebsocketService, GameAction } from './websocket.service';
import { Card } from 'models/card.model';

export class GameService {
    private games: { new(): GameLogic }[] = [];
    private playerService: PlayerService = new PlayerService();
    private roomService: RoomService = new RoomService();

    public constructor(private readonly websocketService: WebsocketService) {

    }

    public loadGames() {
        this.games = [];
        // this.games.push(TheMind);
        this.games.push(CrazyEights);
    }

    public createGame() {
        const game = this.getRandomGame();
        const instance = new game();
        this.roomService.createRoom(instance);

        instance.onStart = this.onGameStarted.bind(this);
        instance.onNextPlayer = this.onNextPlayer.bind(this);
        instance.onPlayCard = this.onPlayCard.bind(this);
        instance.onEffect = this.onEffect.bind(this);
        instance.onGameover = this.onGameover.bind(this);
        instance.onFinish = this.onFinish.bind(this);
        instance.onPlayerLeft = this.onPlayerLeft.bind(this);
    }

    public getRandomGame() {
        const idx = Math.floor(Math.random() * Math.floor(this.games.length));
        return this.games[idx];
    }

    public startGame(playerGuid: string) {
        const player = this.playerService.getPlayer(playerGuid);
        
        if (player.isAdmin) {
            const room = this.getRoomByPlayerGuid(playerGuid);
            this.roomService.startRoom(room.guid);
            room.game.startGame(room.players);
        }
    }

    public playCard(playerGuid: string, cardGuid: string) {
        const room = this.getRoomByPlayerGuid(playerGuid);
        room.game.playCard(playerGuid, cardGuid);
    }

    public nextGame(playerGuid: string) {
        const player = this.playerService.getPlayer(playerGuid);
        
        if (player.isAdmin) {
            const room = this.getRoomByPlayerGuid(playerGuid);
            room.game.nextGame();
        }
    }

    public joinGame(): {player: Player; room: Room } {
        if (this.roomService.getRooms().some(r => !r.isStarted)) {
            const player = this.playerService.createPlayer();
            const room = this.roomService.getRooms().find(r => !r.isStarted);

            if (room.players.length === 0) {
                player.isAdmin = true;
            }
            this.roomService.addUserToRoom(room.guid, player);
            this.playerService.updatePlayerColor(player.guid, room.players);

            this.websocketService.sendMessageToRoom(room, GameAction.PlayerJoined, player, [player.guid]);

            return {
                player,
                room
            };
        } else {
            this.createGame();
            return this.joinGame();
        }
    }

    public leaveGame(playerGuid: string) {
        const room = this.getRoomByPlayerGuid(playerGuid);
        if (room) {
            room.players.splice(room.players.findIndex(p => p.guid === playerGuid), 1);
            room.game.leaveGame(playerGuid);
        }
    }

    public getRoomByPlayerGuid(playerGuid: string) {
        return this.roomService.getRooms().find(r => r.players.some(p => p.guid === playerGuid));
    }

    public onGameStarted(game: GameLogic) {
        const room = this.roomService.getRoomByGame(game);
        this.websocketService.sendMessageToRoom(room, GameAction.Start, {
            players: room.game.players
        });
    }

    public onNextPlayer(game: GameLogic, playerGuid: string) {
        this.sendMessageToRoom(game, GameAction.NextPlayer, {
            playerGuid
        });
    }

    public onPlayCard(game: GameLogic, playerGuid: string, card: Card) {
        this.sendMessageToRoom(game, GameAction.Play, {
            playerGuid,
            card
        });
    }

    public onGameover(game: GameLogic) {
        this.sendMessageToRoom(game, GameAction.Gameover);
    }

    public onFinish(game: GameLogic) {
        this.sendMessageToRoom(game, GameAction.Finished);
    }

    public onEffect(game: GameLogic, gameEffect: GameEffect) {
        this.sendMessageToRoom(game, GameAction.Effect, gameEffect); 
    }

    public onPlayerLeft(game: GameLogic, playerGuid: string) {
        this.sendMessageToRoom(game, GameAction.PlayerLeft, {
            playerGuid
        }); 
    }

    public sendMessageToRoom(game: GameLogic, action: GameAction, message?: any, exceptPlayerGuids?: string[])  {
        const room = this.roomService.getRoomByGame(game);
        this.websocketService.sendMessageToRoom(room, action, message, exceptPlayerGuids); 
    }
}