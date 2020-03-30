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

export enum GameRotation {
    None = 'none',
    Clockwise = 'clockwise',
    counterClockwise = 'counterClockwise',
}

interface MultipleChoice {
    options: { 
        guid: string; 
        text: string; 
        color: string; 
        x?: number; 
        y?: number; 
        partX1?: number;
        partY1?: number;
        partX2?: number;
        partY2?: number;
        offsetX?: number;
        offsetY?: number;
    }[];
    playerGuid: string;
}

export interface EffectIndicator {
    icon?: IconDefinition;
    text?: string;
    visible: boolean;
    playerPositionDegrees?: number;
    color?: string;
    multipleChoice?: MultipleChoice;
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
    public websocket = new WebSocket("wss://" + location.hostname);
    public afterTick: () => void;

    public activeEffectIndicator: EffectIndicator;
    public activeConstantEffectIndicator: EffectIndicator;
    private lastTick = 0;

    public constructor() {
        this.tick = this.tick.bind(this);
        this.players = [];
        this.stack = new CardStack();
        this.pile = new CardPile();
        this.table = new Table();

        this.websocket.onmessage = this.onWebsocketMessage.bind(this);
        this.websocket.onerror = this.onWebsocketError.bind(this);
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


    public focusCard(card: Card) {
        this.websocket.send(JSON.stringify({
            action: 'focus-card',
            cardGuid: card.guid
        }));
    }

    public unfocusCard(card: Card) {
        this.websocket.send(JSON.stringify({
            action: 'unfocus-card',
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

    private onWebsocketError(event){
        console.log(event);
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
            case 'focus-card':
                this.handleFocusCard(data.actionData);
                break;
            case 'unfocus-card':
                this.handleUnfocusCard(data.actionData);
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

        if (this.activeConstantEffectIndicator) {
            this.activeConstantEffectIndicator.visible = false;
        }
        
        if (this.activeEffectIndicator) {
            this.activeEffectIndicator.visible = false;
        }

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
        card.scale = this.stack.card.scale;
        card.futureScale = card.scale;

        card.futureAdjustmentX = 0;
        card.futureAdjustmentY = 0;

        const player = this.players.find(p => playerGuid === p.guid);
        player.cards.push(card);
    }

    private handlePlay(data) {
        if (this.activeConstantEffectIndicator) {
            this.activeConstantEffectIndicator.visible = false;
        }

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

    public handleFocusCard(data) {
        if (data.playerGuid === this.myPlayerGuid) {
            return;
        }

        const card = this.players.find(p => p.guid === data.playerGuid).cards.find(c => c.guid === data.cardGuid);
        if (card) {
            card.focus();
        }
    }

    public handleUnfocusCard(data) {
        if (data.playerGuid === this.myPlayerGuid) {
            return;
        }

        const card = this.players.find(p => p.guid === data.playerGuid).cards.find(c => c.guid === data.cardGuid);
        if (card) {
            card.unfocus();
        }
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
                break;
            case 'force-color':
                this.handleForceColor(data.effectData);
                break;
        }
    }

    private async handleEffectRotationChanged(data) {
        if (data.rotationClockwise !== undefined && this.rotation !== GameRotation.None) {
            await this.applyEffectIdenticator({
                icon: faSyncAlt
            });
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
        const multipleChoice = {
            options: data.options,
            playerGuid
        };

        const radius = this.table.radius * .6 * .4;
        const stepSize = 360 / multipleChoice.options.length;

        for (const [index, option] of multipleChoice.options.entries()) {
            const radians = ((stepSize * index) - 90) * Math.PI/180;
            option.x = Math.round(radius * Math.cos(radians));
            option.y = Math.round(radius * Math.sin(radians));

            const startRadians = ((stepSize * index) - 90 - (stepSize / 2)) * Math.PI/180;
            const endRadians = ((stepSize * index) - 90 + (stepSize / 2)) * Math.PI/180;
            option.partX1 = Math.round(100 * Math.cos(startRadians));
            option.partY1 = Math.round(100 * Math.sin(startRadians));
            option.partX2 = Math.round(100 * Math.cos(endRadians));
            option.partY2 = Math.round(100 * Math.sin(endRadians));

            option.offsetX = Math.round(Math.cos(radians));
            option.offsetY = Math.round(Math.sin(radians));
        }

        this.applyEffectIdenticator({
            playerGuid,
            multipleChoice
        });
    }

    private handleTakeCardEffect(data) {
        this.applyEffectIdenticator({
            text: `+${data.count}`,
            playerGuid: data.playerGuid,
            noDelay: true
        });
    }

    private handlePlayerSkipped(data) {
        this.applyEffectIdenticator({
            icon: faBan,
            playerGuid: data.playerGuid
        });
    }

    private handleKeepTurn(data) {
        this.applyEffectIdenticator({
            icon: faRedoAlt,
            playerGuid: data.playerGuid
        });
    }

    private handleForceColor(data) {
        this.applyEffectIdenticator({
            text: data.text,
            color: data.color,
            isConstant: true,
            noDelay: true
        });
    }

    private async applyEffectIdenticator({
        icon, text, playerGuid, noDelay, color, isConstant, multipleChoice
    }: {
        icon?: IconDefinition;
        text?: string;
        playerGuid?: string;
        noDelay?: boolean;
        color?: string;
        isConstant?: boolean;
        multipleChoice?: MultipleChoice;
    }) {
        if (!noDelay) {
            await sleep(400);
        }
        
        if ((isConstant || multipleChoice) && this.activeConstantEffectIndicator?.visible) {
            this.activeConstantEffectIndicator.visible = false;
            await sleep(400);
        }

        let playerPositionDegrees;

        if (playerGuid) {
            const player = this.players.find(p => p.guid === playerGuid);
            playerPositionDegrees = player.degrees;
        }

        const effect = {
            text,
            icon,
            visible: true,
            playerPositionDegrees,
            color: color,
            multipleChoice
        };

        if (isConstant || multipleChoice) {
            this.activeConstantEffectIndicator = effect;
        } else {
            this.activeEffectIndicator = effect;
        }


        if (!isConstant && !multipleChoice) {
            setTimeout(async () => {
                this.activeEffectIndicator.visible = false;
            }, 1400);
        }

        await sleep(500);
    }
}