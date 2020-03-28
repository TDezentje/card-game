import { h } from 'preact';
import { GameState, GameStatus } from 'logic/gamestate';
import { CardElement } from './card/card.element';
import { useCallback } from 'preact/hooks';

const css = require('./game.element.scss');

export function GameElement({
    gameState
}: {
    gameState: GameState;
}) {
    const onStartClick = useCallback(() => {
        gameState.startGame();
    }, [gameState]);

    return <div class={css.gameContainer}>
        <div class={css.table} style={{width: gameState.table.size, height: gameState.table.size}} />

        {
            gameState.pile.cards.map(c => <CardElement gameState={gameState} card={c} />)
        }   

        {
            gameState.players.map(p => 
                p.cards?.map(c => <CardElement gameState={gameState} isMine={p.guid === gameState.myPlayerGuid} card={c} />)
            )
        }

        {
            gameState.players.map(p => <p class={css.nameTag} style={{background: p.color, transform: `translate(${p.positionX}px, ${p.positionY}px) translate(-50%, -50%)`}}>
                {p.name}
            </p>)
        }

        {
            gameState.status === GameStatus.started && gameState.isAdmin ? <button onClick={onStartClick} class={css.startButton}>Start</button> : null
        }   

        {
            gameState.status === GameStatus.gameover ?  <div class={css.overlay}><span class={css.gameover}>Game over</span></div> : null
        }   
    </div>;
}
