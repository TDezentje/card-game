import { h } from 'preact';
import { AppState, GameStatus, EffectIndicator } from 'logic/app-state';
import { CardElement } from './card/card.element';
import { IconElement } from './icon/icon.element';

const css = require('./game.element.scss');

const EffectIndicatorElement =  ({ gameState, indicator, isConstant}: {
    gameState: AppState;
    indicator: EffectIndicator;
    isConstant?: boolean;
}) => {
    const onOptionClick = (guid: string) => {
        gameState.selectOption(guid);
    };

    const onButtonClick = () => {
        gameState.buttonClicked();
    };

    return <div class={`${css.effectIndicatorContainer} ${indicator?.multipleChoice ? css.multipleChoice : ''} ${indicator?.button ? css.button : ''}`} style={{width: gameState.table.size, height: gameState.table.size}}>
        <div class={`${css.effectIndicator} ${indicator?.visible ? css.visible : ''} ${isConstant && !indicator?.multipleChoice ? css.constant : ''}`}>
            <IconElement icon={indicator?.icon} />
            <span class={indicator?.color ? css.background : ''} style={{color: indicator?.color}}>{indicator?.text}</span>

            {
                indicator?.playerPositionDegrees !== undefined ? 
                    <div class={css.arrowContainer} style={{transform: `translate(-50%, -50%) rotate(${indicator.playerPositionDegrees}deg)`}}>
                        <div class={css.arrow} />
                    </div> : null
            }
            
            {
                indicator?.multipleChoice ? <div class={css.multipleChoiceBackground}>
                    {
                        <svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg">
                            {
                                indicator?.multipleChoice?.options.map(o => [
                                    <path d={`M${o.offsetX},${o.offsetY} L${o.partX1 + o.offsetX},${o.partY1 + o.offsetY} A100,100 0 0,1 ${o.partX2 + o.offsetX},${o.partY2 + o.offsetY} Z`} fill="white"
                                        onClick={() => onOptionClick(o.guid)} />
                                ])
                            }
                        </svg>
                    }
                </div> : null
            }
            {
                indicator?.multipleChoice?.options.map(o => 
                    <button onClick={() => onOptionClick(o.guid)} disabled ={indicator.multipleChoice.playerGuid !== gameState.me.guid} 
                            style={{color: o.color, transform: `translate(-50%, -50%) translate(${o.x}px, ${o.y}px)`}}><span>{o.text}</span></button>)
            }

            {
                indicator?.button ? 
                    <button class={css.background} onClick={onButtonClick}>
                        <span>{indicator.button.text}</span>
                    </button>
                    :null
            }
            
        </div>
    </div>;
};

export function GameElement({
    gameState
}: {
    gameState: AppState;
}) {
    const onStartClick = () => {
        gameState.startGame();
    };

    const onNextGameClick = (event) => {
        event.preventDefault();
        gameState.nextGame();
    };

    const onMyCardClick = (card) => {
        gameState.playCard(card);
    };

    const onMyCardMouseEnter = (card) => {
        gameState.focusCard(card);
    };

    const onMyCardMouseLeave = (card) => {
        gameState.unfocusCard(card);
    };

    const onStackClick = () => {
        gameState.takeCard();
    };

    const onKeyPress = (event) => {
        if (event.keyCode === 13) {
            gameState.sendChatMessage(event.target.value);
            event.target.value = '';
        }
    };

    const me = gameState.players.find(p => p.guid === gameState.me.guid);

    return <div class={css.gameContainer}>
        <div class={css.table} style={{width: gameState.table.size, height: gameState.table.size}}>
            <div class={`${css.rotationIndicator} ${css[gameState.rotation]}`}> 
                <div class={css.arrow} />
                <div class={css.arrow} />
            </div>
        </div>

        {
            me && <div class={`${css.hud} ${gameState.currentPlayerGuid === me.guid ? css.active : ''}`} style={{ borderColor: me.color }}>
                <div class={css.chat}>
                    <div class={css.messages}>
                        {
                            gameState.chatMessages.map(m => <div class={css.message}>
                                <span class={css.chatName} style={{color: m.color}}>{m.name}:</span>
                                <p class={css.text}>{m.text}</p>
                            </div>)
                        }
                    </div>
                    <div style={{backgroundColor: me.color }} class={css.name}>
                        {me.name}
                        <input class={css.input} onKeyPress={onKeyPress} placeholder="Chat" />
                    </div>
                </div>
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
                    const isMine = p.guid === gameState.me.guid;
                    return <CardElement gameState={gameState} isMine={isMine} card={c}
                            onClick={isMine ? () => onMyCardClick(c) : null} 
                            onMouseEnter={isMine ? () => onMyCardMouseEnter(c) : null} 
                            onMouseLeave={isMine ? () => onMyCardMouseLeave(c) : null} />;
                })
            )
        }

        {
            gameState.players.filter(p => p.guid !== gameState.me.guid).map(p => <div class={`${css.nameTag} ${gameState.currentPlayerGuid === p.guid ? css.active : ''}`} style={{transform: `translate(${p.positionX}px, ${p.positionY}px) translate(-50%, -50%)`}}>
                <div class={css.indicator} />
                <div class={css.background} style={{background: p.color }} />
                <span>{p.name}</span>
            </div>)
        }

        {
            gameState.status === GameStatus.lobby && gameState.isAdmin && gameState.hasMinimumPlayers ? <button onClick={onStartClick} class={css.startButton}>START</button> : null
        }

        <EffectIndicatorElement key="constant" gameState={gameState} indicator={gameState.activeConstantEffectIndicator} isConstant />
        <EffectIndicatorElement key="instant" gameState={gameState} indicator={gameState.activeEffectIndicator} />

        <div key="gameover" class={`${css.overlay} ${gameState.status === GameStatus.gameover ? css.visible : ''}`}>
            {gameState.endState?.text.split('\n').map(s => <span class={css.title}>{s}</span>)}
            {gameState.isAdmin ? <a href="#" onClick={onNextGameClick}>{gameState.endState?.buttonText}</a> : <span class={css.sub}>{gameState.endState?.altText}</span> }
        </div>
    </div>;
}