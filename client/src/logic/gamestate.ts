import { Player } from './models/player.model';
import { CardStack } from './models/card-stack.model';
import { CardPile } from './models/card-pile.model';
import { Table } from './models/table.model';
import { Card } from './models/card.model';

export enum GameStatus {
    started,
    running,
    gameover,
    finished
}

export class GameState {
    public players: Player[];
    public myPlayerGuid: string;
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
        this.myPlayerGuid = data.data.guid;
        this.isAdmin = data.data.isAdmin;
        this.players = data.players.map(p => new Player(p));
        this.status = GameStatus.started;
    }

    private handlePlayerJoined(data) {
        this.players.push(new Player(data.data));
    }

    private handlePlayerleft(data) {
        this.players.splice(this.players.findIndex(p => p.guid === data.guid), 1);
    }

    private handleStart(data) {
        if (data.isStarted) {
            this.status = GameStatus.running;
            this.players = data.players.map(p => new Player(p));
            this.pile.cards = [];        
        }
    }

    public handlePlay(data) {
        const player = this.players.find(p => p.guid === data.data.playerGuid);
        const cardIndex = player.cards.findIndex(c => c.guid === data.data.cardGuid);
        const card = player.cards[cardIndex];
        card.corner = data.data.card.corner;
        card.display = data.data.card.display;
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