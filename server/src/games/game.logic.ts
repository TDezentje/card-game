import { Card } from 'models/card.model';
import { Player } from 'models/player.model';
import { GameEndState } from 'models/end-state.model';

export enum GameEffectType {
    RotationChanged = 'rotation-changed',
    PlayerSkipped = 'player-skipped',
    ResetPile = 'reset-pile',
    TakeCard = 'take-card',
    MultipleChoice = 'multiple-choice',
    ForceColor = 'force-color',
    KeepTurn = 'keep-turn',
    Button = 'button'
}

export class GameEffect {
    public constructor(public type: GameEffectType, public effectData?: any, public playerGuid?: string) {

    }
}


export class GameScore {
    public constructor(public name: string, public score: any) {

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
    public static gameName = "";
    public static guid: string;
    public static minPlayers?: number;
    public static maxPlayers?: number;
    public players: GamePlayer[];
    protected startCardAmountInHand;
    protected hasStack: boolean;
    protected cardsToUse?: Card[];
    protected cardsOnPile?: Card[];

    public abstract buttonClicked(_playerGuid: string);
    public abstract nextGame();
    public abstract resetGame();
    public abstract playCard(_playerGuid: string, cardGuid: string);
    public abstract answerMultipleChoice(playerGuid: string, answerGuid: string)
    public abstract takeCards(_playerGuid: string);
    
    public startGame(players: Player[]) {
        this.players = players.map(p => new GamePlayer(p));
        this.resetGame();

        for (const player of this.players) {
            player.cards = [];
            for (let idx = 0; idx < this.startCardAmountInHand; idx++) {
                const randomIdx = Math.floor(Math.random() * Math.floor(this.cardsToUse.length));
                const card = this.cardsToUse.splice(randomIdx, 1);
                player.cards.push(...card);
            }    
        }
        
        this.onStart(this, this.hasStack);
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
    public onMoveCard: (game: GameLogic, playerGuid: string, toPlayerGuid: string, card: Card) => void;
    public onTakeCards: (game: GameLogic, playerGuid: string, card: Card[], hasStack: boolean) => void;
    public onGameover: (game: GameLogic, endState: GameEndState) => void;
    public onNextPlayer: (game: GameLogic, playerGuid: string) => void;
    public onEffect: (game: GameLogic, gameEffect: GameEffect) => void;
    public onPlayerLeft: (game: GameLogic, playerGuid: string) => void;
    public onUpdateScore: (game: GameLogic, score: GameScore[]) => void;
}
