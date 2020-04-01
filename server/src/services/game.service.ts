import { TheMind } from 'games/themind';
import { CrazyEights } from 'games/crazyEights';
import { Burro } from 'games/burro';
import { Player } from 'models/player.model';
import { PlayerService } from './player.service';
import { RoomService } from './room.service';
import { GameLogic, GameEffect } from 'games/game.logic';
import { Room } from 'models/room.model';
import { WebsocketService, GameAction } from './websocket.service';
import { Card } from 'models/card.model';
import { GameEndState } from 'models/end-state.model';

export class GameService {
    private games: { new(): GameLogic }[] = [];
    private playerService: PlayerService = new PlayerService();
    private roomService: RoomService = new RoomService();

    public constructor(private readonly websocketService: WebsocketService) {

    }

    public loadGames() {
        this.games = [];
        this.games.push(Burro);
        this.games.push(TheMind);
        this.games.push(CrazyEights);
    }

    public getGames() {
        return this.games.map(g => {
            return {
                name: (g as any).gameName,
                guid: (g as any).guid
            };
        });
    }

    public getRooms() {
        const roomsToPlay = this.roomService.getRooms();

        return roomsToPlay.map(rtp => this.mapRoom(rtp));
    }

    private mapRoom(room: Room) {
        return {
            name: room.name,
            guid: room.guid,
            isStarted: room.isStarted,
            playersCount: room.players?.length,
            minPlayersCount: room.game.minPlayers,
            maxPlayersCount: room.game.maxPlayers,
            gameName: room.game.constructor.name
        };
    }
    
    public buttonClicked(playerGuid: string){
        const room = this.getRoomByPlayerGuid(playerGuid);
        if (room) {
            room.game.buttonClicked(playerGuid);
        }
    }

    public createRoom(playerGuid: string, gameGuid: string) {
        let room = this.getRoomByPlayerGuid(playerGuid);
        if (room) {
            // User already in room
            return;
        }

        const game = this.games.find(g => (g as any).guid === gameGuid);
        const instance = new game();
        instance.onPlayerLeft = this.onPlayerLeft.bind(this);
        instance.onStart = this.onGameStarted.bind(this);
        instance.onNextPlayer = this.onNextPlayer.bind(this);
        instance.onPlayCard = this.onPlayCard.bind(this);
        instance.onMoveCard = this.onMoveCard.bind(this);
        instance.onTakeCards = this.onTakeCards.bind(this);
        instance.onEffect = this.onEffect.bind(this);
        instance.onGameover = this.onGameover.bind(this);

        room = this.roomService.createRoom(instance);
        this.sendMessageToEverybody(GameAction.RoomCreate, {
            room: this.mapRoom(room)
        });

        this.joinGame(playerGuid, room.guid);

        return room.guid;
    }

    public leaveRoom(playerGuid: string) {
        const room = this.getRoomByPlayerGuid(playerGuid);
        if (room) {
            const idx = room.players.findIndex(p => p.guid === playerGuid);
            const player = room.players[idx];
            room.players.splice(idx, 1);
            if (player?.isAdmin && room.players.length > 0) {
                room.players[0].isAdmin = true;
                this.websocketService.sendMessageToRoom(room, GameAction.AdminChanged, {
                    playerGuid: room.players[0].guid
                });
            }

            if (room.players.length === 0) {
                this.roomService.deleteRoom(room.guid);
                this.sendMessageToEverybody(GameAction.RoomRemoved, {
                    roomGuid: room.guid
                });
            } else {
                this.sendMessageToEverybody(GameAction.RoomUpdated, {
                    room: this.mapRoom(room)
                });
            }
        }
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

    public takeCards(playerGuid: string) {
        const room = this.getRoomByPlayerGuid(playerGuid);
        room.game.takeCards(playerGuid);
    }

    public effectResponse(playerGuid: string, optionGuid: string) {
        const room = this.getRoomByPlayerGuid(playerGuid);
        room.game.answerMultipleChoice(playerGuid, optionGuid);
    }

    public nextGame(playerGuid: string) {
        const player = this.playerService.getPlayer(playerGuid);

        if (player.isAdmin) {
            const room = this.getRoomByPlayerGuid(playerGuid);
            room.game.nextGame();
        }
    }

    public createPlayer(): { player: Player; games; rooms } {
        const player = this.playerService.createPlayer();
        return {
            player,
            games: this.getGames(),
            rooms: this.getRooms()
        };
    }

    public joinGame(playerGuid: string, roomGuid: string): { room: Room } {
        const player = this.playerService.getPlayer(playerGuid);
        const room = this.roomService.getRoom(roomGuid);

        if (!room || room.players.length === room.game.maxPlayers) {
            this.websocketService.sendMessageToPlayer(playerGuid, GameAction.RoomRemoved, {
                roomGuid
            });
            return;
        }

        if (!room.isStarted) {
            if (room.players.length === 0) {
                player.isAdmin = true;
                room.name = player.name;
            } else {
                player.isAdmin = false;
            }
            this.roomService.addUserToRoom(room.guid, player);
            this.playerService.updatePlayerColor(player.guid, room.players);

            this.websocketService.sendMessageToPlayer(playerGuid, GameAction.Join, {
                player,
                players: room.players,
                roomGuid: room.guid
            });

            this.websocketService.sendMessageToRoom(room, GameAction.PlayerJoined, player, [player.guid]);

            this.sendMessageToEverybody(GameAction.RoomUpdated, {
                room: this.mapRoom(room)
            });
            return {
                room
            };
        }
    }

    public leaveGame(playerGuid: string) {
        const room = this.getRoomByPlayerGuid(playerGuid);
        if (room) {
            room.game.leaveGame(playerGuid);
            this.leaveRoom(playerGuid);
        }

    }

    private getRoomByPlayerGuid(playerGuid: string) {
        return this.roomService.getRooms().find(r => r.players.some(p => p.guid === playerGuid));
    }

    public onGameStarted(game: GameLogic, hasStack: boolean) {
        const room = this.roomService.getRoomByGame(game);
        this.websocketService.sendMessageToRoom(room, GameAction.Start, {
            players: room.game.players,
            hasStack
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

    public onMoveCard(game: GameLogic, playerGuid: string, toPlayerGuid: string, card: Card) {
        this.websocketService.sendMessageToPlayer(toPlayerGuid, GameAction.MoveCard, {
            playerGuid,
            toPlayerGuid,
            card
        });

        const publicCard = new Card();
        publicCard.guid = card.guid;
        this.sendMessageToRoom(game, GameAction.MoveCard, {
            playerGuid,
            toPlayerGuid,
            card: publicCard
        }, [toPlayerGuid]);
    }

    public onTakeCards(game: GameLogic, playerGuid: string, cards: Card[], hasStack: boolean) {
        this.sendMessageToRoom(game, GameAction.TakeCards, {
            playerGuid,
            hasStack,
            cards: cards.map(c => {
                const result = new Card();
                result.guid = c.guid;
                return result;
            })
        }, [playerGuid]);
        this.websocketService.sendMessageToPlayer(playerGuid, GameAction.TakeCards, {
            playerGuid,
            hasStack,
            cards
        });
    }

    public onGameover(game: GameLogic, data: GameEndState) {
        this.sendMessageToRoom(game, GameAction.Gameover, data);
    }

    public onEffect(game: GameLogic, gameEffect: GameEffect) {
        this.sendMessageToRoom(game, GameAction.Effect, gameEffect);
    }

    public onPlayerLeft(game: GameLogic, playerGuid: string) {
        this.sendMessageToRoom(game, GameAction.PlayerLeft, {
            playerGuid
        });
    }

    public sendMessageToRoom(game: GameLogic, action: GameAction, message?: any, exceptPlayerGuids?: string[]) {
        const room = this.roomService.getRoomByGame(game);
        this.websocketService.sendMessageToRoom(room, action, message, exceptPlayerGuids);
    }

    public sendMessageToEverybody(action: GameAction, message?: any) {
        this.websocketService.sendMessage(action, message);
    }
}