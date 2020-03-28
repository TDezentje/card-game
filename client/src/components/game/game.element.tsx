import { h } from 'preact';
import { GameState } from 'logic/gamestate';
import { CardElement } from './card/card.element';

const css = require('./game.element.scss');

export function GameElement({
    gameState
}: {
    gameState: GameState;
}) {
    return <div class={css.gameContainer}>
        <div class={css.table} style={{width: gameState.table.size, height: gameState.table.size}} />

        {
            gameState.players.map(p => 
                p.cards.map(c => <CardElement card={c} />)
            )
        }

        {
            gameState.players.map(p => <span class={css.nameTag} style={{transform: `translate(${p.positionX}px, ${p.positionY}px) translate(-50%, -50%)`}}>
                {p.name}
            </span>)
        }        
    </div>;
}
