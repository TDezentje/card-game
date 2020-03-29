import { Player } from './models/player.model';
import { CardStack } from './models/card-stack.model';
import { CardPile } from './models/card-pile.model';
import { Table } from './models/table.model';
import { Card } from './models/card.model';
import { sleep } from './helpers/animation.helper';

export enum GameStatus {
    started,
    running,
    gameover,
    finished,
    cleanup
}

export class GameState {
    public players: Player[];
    public myPlayerGuid: string;
    public nextPlayerGuid: string;
    public stack: CardStack;
    public pile: CardPile;

    public isAdmin: boolean;
    public status: GameStatus;

    public table: Table;
    public websocket = new WebSocket("ws://" + location.hostname + ':8001');
    public afterTick: () => void;

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
        this.pile.tick(deltaT, screenSize);

        const indexOfMe = this.players.findIndex(p => p.guid === this.myPlayerGuid);
        for (const [index, player] of this.players.entries()) {
            let relativeIndex = index - indexOfMe;
            if (relativeIndex < 0) {
                relativeIndex = this.players.length + relativeIndex;
            }
            player.tick(deltaT, screenSize, this.table, relativeIndex, this.players.length);
        }

        this.afterTick?.();
        window.requestAnimationFrame(this.tick);
    }

    public playCard(card: Card) {
        if (!this.nextPlayerGuid || this.nextPlayerGuid !== this.myPlayerGuid) {
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

    private onWebsocketMessage(event) {
        const data = JSON.parse(event.data);
        console.log(data);
        switch (data.action) {
            case 'join':
                this.handleJoin(data);
                break;
            case 'player-joined':
                this.handlePlayerJoined(data);
                break;
            case 'player-left':
                this.handlePlayerleft(data);
                break;
            case 'start':
                this.handleStart(data);
                break;
            case 'played':
                this.handlePlay(data);
                break;
            case 'gameover':
                this.handleGameOver();
                break;
            case 'finished':
                this.handleFinished();
                break;
        }
    }

    private handleJoin(data) {
        this.myPlayerGuid = data.actionByPlayer.guid;
        this.isAdmin = data.actionByPlayer.isAdmin;
        this.players = data.players.map(p => new Player(p));
        this.status = GameStatus.started;
    }

    private handlePlayerJoined(data) {
        this.players.push(new Player(data.actionByPlayer));
    }

    private handlePlayerleft(data) {
        this.players.splice(this.players.findIndex(p => p.guid === data.actionByPlayer.guid), 1);
    }

    private async handleStart(data) {
        if (data.isStarted) {
            if (this.status !== GameStatus.started) {
                this.status = GameStatus.cleanup;
                await sleep(800);
            }

            this.status = GameStatus.running;
            this.pile.cards = [];
            this.stack.hasCards = true;
            if (data.data && data.data.nextPlayerGuid) {
                this.nextPlayerGuid = data.data.nextPlayerGuid;
            }

            this.players = data.players.map(p => {
                p = JSON.parse(JSON.stringify(p));
                delete p.cards;
                return new Player(p);
            });

            for (let i = 0; i < Math.max(...data.players.map(p => p.cards.length)); i++) {
                for (const p of data.players) {
                    const promise = sleep(50);

                    const card: Card = p.cards[i];
                    if (!card) {
                        continue;
                    }

                    card.positionX = this.stack.card.positionX;
                    card.positionY = this.stack.card.positionY;
                    card.originX = this.stack.card.originX;
                    card.originY = this.stack.card.originY;
                    card.rotationY = this.stack.card.rotationY;
                    card.degrees = this.stack.card.degrees;
                    card.adjustmentX = this.stack.card.adjustmentX;
                    card.adjustmentY = this.stack.card.adjustmentY;

                    card.futureAdjustmentX = 0;
                    card.futureAdjustmentY = 0;

                    const player = this.players.find(p2 => p.guid === p2.guid);
                    player.cards.push(card);

                    await promise;
                };
            }
        }
    }

    public handlePlay(data) {
        if (!data.data.isValid && !data.data.gameOver) {
            return;
        }

        const player = this.players.find(p => p.guid === data.actionByPlayer.guid);
        const cardIndex = player.cards.findIndex(c => c.guid === data.data.cardGuid);
        this.nextPlayerGuid = data.data.nextPlayerGuid;

        if (cardIndex === -1) {
            return;
        }

        const card = player.cards[cardIndex];
        card.corner = data.data.card.corner;
        card.display = data.data.card.display;
        card.color = data.data.card.color;
        player.cards.splice(cardIndex, 1);
        this.pile.addCard(card);
    }

    public handleGameOver() {
        setTimeout(() => {
            this.status = GameStatus.gameover;
        }, 1000);
    }

    public handleFinished() {
        this.status = GameStatus.finished;
    }
}