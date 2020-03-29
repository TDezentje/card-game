import { h } from 'preact';
import { Card } from 'logic/models/card.model';
import { GameState, GameStatus } from 'logic/gamestate';
import { useCallback } from 'preact/hooks';

const css = require('./card.element.scss');

export function CardElement({
    card,
    isMine,
    gameState,
    onClick
}: {
    card: Card;
    isMine?: boolean;
    gameState: GameState;
    onClick?;
}) {
    return <div class={`${css.cardContainer} ${isMine ? css.clickable : ''} ${gameState.status === GameStatus.cleanup ? css.cleanup : ''}`} onClick={onClick} style={{transformOrigin: `${card.originX}px ${card.originY}px`, transform: `translate(${card.positionX + card.adjustmentX}px, ${card.positionY  + card.adjustmentY}px) rotate(${card.degrees || '0'}deg)`}}>
        <div class={css.scaler}>
            <div class={`${css.card} ${isMine ? css.clickable : ''}`} style={{transform: `rotate${card.rotationAxis}(${card.rotation}deg)`}}>
                <div class={`${css.front} ${css.face}`}>
                    <span class={css.topLeft} style={{color: card.color}}>{card.corner?.leftTop}</span>
                    <span class={css.topRight} style={{color: card.color}}>{card.corner?.rightTop}</span>
                    <span class={css.bottomRight} style={{color: card.color}}>{card.corner?.rightBottom}</span>
                    <span class={css.bottomLeft} style={{color: card.color}}>{card.corner?.leftBottom}</span>

                    <span class={css.middle} style={{color: card.color}}>{card.display}</span>
                </div>
                <div class={`${css.back} ${css.face}`}>
                    <div class={css.pattern} />
                </div>
            </div>
        </div>
    </div>;
}
