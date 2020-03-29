import { Card } from 'models/card.model';
import { Player } from 'models/player.model';

export enum GameEffectType {
    RotationChanged = 'rotation-changed',
    PlayerSkipped = 'player-skipped',
    ResetPile = 'reset-pile'
}

export class GameEffect {
    public constructor(public type: GameEffectType, public effectData?: any) {

    }
}

export class GamePlayer extends Player {
    public cards: Card[];

    public constructor(obj) {
        super();
        Object.assign(this, obj);
    }
}

export abstract class GameLogic {
    public maxPlayers?: number;
    public players: GamePlayer[];
    protected startCardAmountInHand;
    protected hasPile: boolean;
    protected cardsToUse?: Card[];
    protected cardsOnPile?: Card[];

    public abstract nextGame();
    public abstract resetGame();
    public abstract playCard(_playerGuid: string, cardGuid: string);
    public abstract takeCards(_playerGuid: string);
    
    public startGame(players: Player[]) {
        this.resetGame();
        this.players = players.map(p => new GamePlayer(p));
        
        for (const player of this.players) {
            player.cards = [];
            for (let idx = 0; idx < this.startCardAmountInHand; idx++) {
                const randomIdx = Math.floor(Math.random() * Math.floor(this.cardsToUse.length));
                const card = this.cardsToUse.splice(randomIdx, 1);
                player.cards.push(...card);
            }    
        }
        
        this.onStart(this, this.hasPile);
    }
    
    public leaveGame(playerGuid: string) {
        if (this.players) {
            this.players.splice(this.players.findIndex(p => p.guid === playerGuid), 1);
        }

        this.onPlayerLeft(this, playerGuid);
    }

    protected takeCardFromHand(cardGuid: string) {
        for (const player of this.players) {
            const cardIndex = player.cards.findIndex(c => c.guid === cardGuid);
            if (cardIndex > -1) {
                player.cards.splice(cardIndex, 1);
            }
        }
    }

    public onStart: (game: GameLogic, hasStack: boolean) => void;
    public onPlayCard: (game: GameLogic, playerGuid: string, card: Card) => void;
    public onTakeCards: (game: GameLogic, playerGuid: string, card: Card[], hasStack: boolean) => void;
    public onGameover: (game: GameLogic) => void;
    public onFinish: (game: GameLogic, playerGuid?: string) => void;
    public onNextPlayer: (game: GameLogic, playerGuid: string) => void;
    public onEffect: (game: GameLogic, gameEffect: GameEffect) => void;
    public onPlayerLeft: (game: GameLogic, playerGuid: string) => void;
}
