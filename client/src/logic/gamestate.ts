import { Player } from './models/player.model';
import { CardStack } from './models/card-stack.model';
import { CardPile } from './models/card-pile.model';
import { Table } from './models/table.model';
import { Card } from './models/card.model';
import { sleep } from './helpers/animation.helper';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faSyncAlt, faBan, faRedoAlt } from '@fortawesome/free-solid-svg-icons';

export enum GameStatus {
    started,
    running,
    gameover,
    finished,
    cleanup
}

export enum GameRotation{
    None = 'none',
    Clockwise = 'clockwise',
    counterClockwise = 'counterClockwise',
}

interface MultipleChoice {
    options: { guid: string; text: string; color: string}[];
    playerGuid: string;
}

interface EffectIndicator {
    icon?: IconDefinition;
    text?: string;
    visible: boolean;
    playerPositionDegrees: number;
}

export class GameState {
    public players: Player[];
    public myPlayerGuid: string;
    public currentPlayerGuid: string;
    public stack: CardStack;
    public pile: CardPile;

    public isAdmin: boolean;
    public status: GameStatus;
    public rotation: GameRotation = GameRotation.None;

    public winner: Player;
    public table: Table;
    public websocket = new WebSocket("ws://" + location.hostname + ':8001');
    public afterTick: () => void;

    public activeMultipleChoice: MultipleChoice;
    public activeEffectIndicator: EffectIndicator;

    private lastTick = 0;

    public constructor() {
        this.tick = this.tick.bind(this);
        this.players = [];
        this.stack = new CardStack();
        this.pile = new CardPile();
        this.table = new Table();

        this.websocket.onmessage = this.onWebsocketMessage.bind(this);
    }

    public tick(time: number) {
        const deltaT = time - this.lastTick;
        this.lastTick = time;

        const screenSize = {
            width: document.body.clientWidth,
            height: document.body.clientHeight
        };

        this.table.tick(screenSize);
        this.stack.tick(screenSize);
        this.pile.tick(deltaT, screenSize, this.status);

        const indexOfMe = this.players.findIndex(p => p.guid === this.myPlayerGuid);
        for (const [index, player] of this.players.entries()) {
            let relativeIndex = index - indexOfMe;
            if (relativeIndex < 0) {
                relativeIndex = this.players.length + relativeIndex;
            }
            player.tick(deltaT, screenSize, this.table, relativeIndex, this.players.length, this.status, this.currentPlayerGuid === this.myPlayerGuid);
        }

        this.afterTick?.();
        window.requestAnimationFrame(this.tick);
    }

    public playCard(card: Card) {
        if (this.currentPlayerGuid && this.currentPlayerGuid !== this.myPlayerGuid) {
            return;
        }
        this.websocket.send(JSON.stringify({
            action: 'play',
            cardGuid: card.guid
        }));
    }

    public startGame() {
        this.websocket.send(JSON.stringify({
            action: 'start'
        }));
    }

    public nextGame() {
        this.websocket.send(JSON.stringify({
            action: 'next-game'
        }));
    }

    public takeCard() {
        this.websocket.send(JSON.stringify({
            action: 'take-cards'
        }));
    }

    public selectOption(guid) {
        this.websocket.send(JSON.stringify({
            action: 'effect-response',
            optionGuid: guid
        }));
    }

    private onWebsocketMessage(event) {
        const data = JSON.parse(event.data);
        console.log(data);
        switch (data.action) {
            case 'join':
                this.handleJoin(data.actionData);
                break;
            case 'player-joined':
                this.handlePlayerJoined(data.actionData);
                break;
            case 'player-left':
                this.handlePlayerleft(data.actionData);
                break;
            case 'start':
                this.handleStart(data.actionData);
                break;
            case 'play':
                this.handlePlay(data.actionData);
                break;
            case 'next-player':
                this.handleNextPlayer(data.actionData);
                break;
            case 'take-cards':
                this.handleTakeCards(data.actionData);
                break;
            case 'effect':
                this.handleEffect(data.actionData);
                break;
            case 'gameover':
                this.handleGameOver();
                break;
            case 'finished':
                this.handleFinished(data.actionData);
                break;
            case 'admin-changed':
                this.handleAdminChanged(data.actionData);
                break;
        }
    }

    private handleJoin(data) {
        this.myPlayerGuid = data.player.guid;
        this.isAdmin = data.player.isAdmin;
        this.players = data.players.map(p => new Player(p));
        this.status = GameStatus.started;
    }

    private handlePlayerJoined(data) {
        this.players.push(new Player(data));
    }

    private handlePlayerleft(data) {
        this.players.splice(this.players.findIndex(p => p.guid === data.playerGuid), 1);
    }

    private async handleStart(data) {
        if (this.status !== GameStatus.started) {
            this.status = GameStatus.cleanup;
            await sleep(800);
        }

        this.status = GameStatus.running;
        this.pile.cards = [];
        this.stack.hasCards = true;
        this.winner;
        
        this.players = data.players.map(p => {
            p = JSON.parse(JSON.stringify(p));
            delete p.cards;
            return new Player(p);
        });
        
        for (let i = 0; i < Math.max(...data.players.map(p => p.cards.length)); i++) {
            for (const p of data.players) {
                await sleep(50);
                
                const card: Card = p.cards[i];
                if (!card) {
                    continue;
                }

                this.addCardToPlayerFromStack(p.guid, card);

            };
        }
        this.stack.hasCards = data.hasStack;
    }

    private addCardToPlayerFromStack(playerGuid: string, card: any) {
        card = new Card(card);

        card.positionX = this.stack.card.positionX;
        card.positionY = this.stack.card.positionY;
        card.originX = this.stack.card.originX;
        card.originY = this.stack.card.originY;
        card.rotation = this.stack.card.rotation;
        card.rotationAxis = 'Y';
        card.degrees = this.stack.card.degrees;
        card.adjustmentX = this.stack.card.adjustmentX;
        card.adjustmentY = this.stack.card.adjustmentY;
        
        card.futureAdjustmentX = 0;
        card.futureAdjustmentY = 0;
        
        const player = this.players.find(p => playerGuid === p.guid);
        player.cards.push(card);
    }

    private handlePlay(data) {
        const player = this.players.find(p => p.guid === data.playerGuid);
        const cardIndex = player.cards.findIndex(c => c.guid === data.card.guid);

        const card = player.cards[cardIndex];
        card.corner = data.card.corner;
        card.display = data.card.display;
        card.color = data.card.color;
        player.cards.splice(cardIndex, 1);
        this.pile.addCard(card);
    }

    private handleNextPlayer(data) {
        this.currentPlayerGuid = data.playerGuid;
        delete this.activeMultipleChoice;
    } 

    public async handleTakeCards(data) {
        for (const card of data.cards) {
            await sleep(50);
            this.addCardToPlayerFromStack(data.playerGuid, card);
            this.stack.hasCards = data.hasStack;
        }
    }

    private handleGameOver() {
        setTimeout(() => {
            this.status = GameStatus.gameover;
            this.rotation = GameRotation.None;
        }, 600);
    }

    private handleFinished(data) {
        setTimeout(() => {
            this.status = GameStatus.finished;
            this.rotation = GameRotation.None;
            this.winner = this.players.find(p => p.guid === data?.playerGuid);
        }, 600);
    }

    private handleAdminChanged(data) {
        this.players.find(p => p.guid === data.playerGuid).isAdmin = true;
        this.isAdmin = data.playerGuid === this.myPlayerGuid;
    }

    public handleEffect(data) {
        switch (data.type) {
            case 'rotation-changed':
                this.handleEffectRotationChanged(data.effectData);
                break;
            case 'reset-pile':
                this.handleResetPile();
                break;
            case 'player-skipped':
                this.handlePlayerSkipped(data.effectData);
                break;
            case 'keep-turn':
                this.handleKeepTurn(data.effectData);
                break;
            case 'multiple-choice':
                this.handleMultipleChoice(data.effectData, data.playerGuid);
                break;
            case 'take-card':
                this.handleTakeCardEffect(data.effectData);
        }
    }

    private async handleEffectRotationChanged(data) {
        if (data.rotationClockwise !== undefined && this.rotation !== GameRotation.None) {
            await this.applyEffectIdenticator(faSyncAlt);
        }

        if (data.rotationClockwise) {
            this.rotation = GameRotation.Clockwise;
        } else if (data.rotationClockwise === false) {
            this.rotation = GameRotation.counterClockwise;
        } else {
            this.rotation = GameRotation.None;
        }
    }

    private async handleResetPile() {
        const succeeded = await this.pile.resetCardsToStack(this.stack);

        if (succeeded) {
            await sleep(50);
            this.stack.hasCards = true;
        }
    }

    private handleMultipleChoice(data, playerGuid) {
        this.activeMultipleChoice = {
            options: data.options,
            playerGuid
        };
    }

    private handleTakeCardEffect(data) {
        this.applyEffectIdenticator(`+${data.count}`, data.playerGuid, true);
    }

    private handlePlayerSkipped(data) {
        this.applyEffectIdenticator(faBan, data.playerGuid);
    }

    private handleKeepTurn(data) {
        this.applyEffectIdenticator(faRedoAlt, data.playerGuid);
    }

    private async applyEffectIdenticator(iconOrText: IconDefinition | string, playerGuid?: string, noDelay?: boolean) {
        if (!noDelay) {
            await sleep(400);
        }

        let playerPositionDegrees;
        
        if(playerGuid) {
            const player = this.players.find(p => p.guid === playerGuid);
            playerPositionDegrees = player.degrees;
        }

        this.activeEffectIndicator = {
            visible: true,
            playerPositionDegrees
        };

        if (typeof(iconOrText) === 'string') {
            this.activeEffectIndicator.icon = null;
            this.activeEffectIndicator.text = iconOrText;
        } else {
            this.activeEffectIndicator.text = null;
            this.activeEffectIndicator.icon = iconOrText;
        }

        setTimeout(async () => {
            this.activeEffectIndicator.visible = false;
        }, 1400);
        await sleep(500);
    }
}