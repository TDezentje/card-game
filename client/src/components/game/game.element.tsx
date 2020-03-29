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

    const onMyCardClick = useCallback((card) => {
        gameState.playCard(card);
    }, [gameState]);

    const onStackClick = useCallback(() => {
        gameState.takeCard();
    }, [gameState]);

    const onOptionClick = useCallback((guid: string) => {
        gameState.selectOption(guid);
    }, [gameState]);

    const me = gameState.players.find(p => p.guid === gameState.myPlayerGuid);

    return <div class={css.gameContainer}>
        <div class={css.table} style={{width: gameState.table.size, height: gameState.table.size}}>
            <div class={`${css.rotationIndicator} ${css[gameState.rotation]}`}> 
                <div class={css.arrow} />
                <div class={css.arrow} />
            </div>
        </div>

        {
            me && <div class={`${css.hud} ${gameState.currentPlayerGuid === me.guid ? css.active : ''}`} style={{ borderColor: me.color }}>
                <div style={{backgroundColor: me.color }} class={css.name}>{me.name}</div>
            </div>
        }
        
        {
            gameState.pile.cards.map(c => <CardElement gameState={gameState} card={c} />)
        }   

        {
            gameState.stack.hasCards ? <CardElement onClick={onStackClick} gameState={gameState} card={gameState.stack.card} /> : <div class={css.emptyStack}><span>X</span></div>
        }   

        {
            gameState.players.map(p => 
                p.cards?.map(c => {
                    const isMine = p.guid === gameState.myPlayerGuid;
                    return <CardElement gameState={gameState} isMine={isMine} onClick={isMine ? () => onMyCardClick(c) : null} card={c} />;
                })
            )
        }

        {
            gameState.players.filter(p => p.guid !== gameState.myPlayerGuid).map(p => <div class={`${css.nameTag} ${gameState.currentPlayerGuid === p.guid ? css.active : ''}`} style={{transform: `translate(${p.positionX}px, ${p.positionY}px) translate(-50%, -50%)`}}>
                <div class={css.indicator} />
                <div class={css.background} style={{background: p.color }} />
                <span>{p.name}</span>
            </div>)
        }

        {
            gameState.status === GameStatus.started && gameState.isAdmin ? <button onClick={onStartClick} class={css.startButton}>START</button> : null
        }
   

        <div class={`${css.overlay} ${gameState.status === GameStatus.gameover ? css.visible : ''}`}>
            <span class={css.title}>GAME OVER!</span>
            {gameState.isAdmin ? <a href="#" onClick={onNextGameClick}>Opnieuw</a> : <span class={css.sub}>Wacht op de gamemaster</span> }
        </div>

        <div class={`${css.overlay} ${gameState.status === GameStatus.finished ? css.visible : ''}`}>
            <span class={css.title}>HOERA!</span>
            {
                gameState.winner ? [
                    <span class={css.title} style={{color:gameState.winner.color}}>{gameState.winner.name}</span>,
                    <span class={css.title}>heeft gewonnen</span>
                 ] : null
            }
            {gameState.isAdmin ? <a href="#" onClick={onNextGameClick}>Volgende spel</a> : <span class={css.sub}>Wacht op de gamemaster</span> }
        </div>

        <div class={`${css.overlay} ${gameState.activeMultipleChoice ? css.visible : ''}`}>
            <span class={css.sub}>Maak je keuze</span>
            <div class={css.options} style={{width: gameState.table.size, height: gameState.table.size}}>
            {
                gameState.activeMultipleChoice?.options.map(o => <button onClick={() => onOptionClick(o.guid)} disabled ={gameState.activeMultipleChoice.playerGuid !== me.guid} style={{color: o.color}}>{o.text}</button>)
            }
            </div>
        </div>
    </div>;
}
