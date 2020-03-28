import { Player } from './models/player.model';
import { CardStack } from './models/card-stack.model';
import { CardPile } from './models/card-pile.model';
import { Table } from './models/table.model';

export class GameState {
    public players: Player[];
    public myPlayerGuid: string;
    public stack: CardStack;
    public pile: CardPile;

    public table: Table;

    public constructor() {
        this.tick = this.tick.bind(this);

        this.players = [
            new Player('abcd', 'Tom'),
            new Player('abcd', 'Remco'),
            new Player('abcd', 'Amber')
        ];
        this.myPlayerGuid = 'abcd';
        this.stack = new CardStack();
        this.pile = new CardPile();
        this.table = new Table();
    }

    public tick() {
        const screenSize = {
            width: document.body.clientWidth,
            height: document.body.clientHeight
        };
        
        this.table.tick(screenSize);

        const indexOfMe = this.players.findIndex(p => p.guid === this.myPlayerGuid);
        for (const [index, player] of this.players.entries()) {
            let relativeIndex = index - indexOfMe;
            if (relativeIndex < 0) {
                relativeIndex = this.players.length - relativeIndex;
            }
            player.tick(screenSize, this.table, relativeIndex, this.players.length);
        }


        this.afterTick?.();
        window.requestAnimationFrame(this.tick);
    }

    public afterTick: () => void;
}