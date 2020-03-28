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

    const onNextGameClick = useCallback((event) => {
        event.preventDefault();
        gameState.nextGame();
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
            gameState.players.filter(p => p.guid !== gameState.myPlayerGuid).map(p => <p class={css.nameTag} style={{background: p.color, transform: `translate(${p.positionX}px, ${p.positionY}px) translate(-50%, -50%)`}}>
                {p.name}
            </p>)
        }

        {
            gameState.status === GameStatus.started && gameState.isAdmin ? <button onClick={onStartClick} class={css.startButton}>START</button> : null
        }   

        {
            gameState.status === GameStatus.gameover ?  <div class={css.overlay}>
                <span class={css.title}>GAME OVER!</span>
                {gameState.isAdmin ? <a href="#" onClick={onNextGameClick}>Opnieuw</a> : <span class={css.sub}>Wacht op de gamemaster</span> }
            </div> : null
        }  

        {
            gameState.status === GameStatus.finished ?  <div class={css.overlay}>
                <span class={css.title}>HOERA!</span>
                {gameState.isAdmin ? <a href="#" onClick={onNextGameClick}>Volgende level</a> : <span class={css.sub}>Wacht op de gamemaster</span> }
            </div> : null
        }    
    </div>;
}
