import { h } from 'preact';
import { Card } from 'logic/models/card.model';
import { GameState } from 'logic/gamestate';
import { useCallback } from 'preact/hooks';

const css = require('./card.element.scss');

export function CardElement({
    card,
    isMine,
    gameState
}: {
    card: Card;
    isMine?: boolean;
    gameState: GameState;
}) {
    const onClick = useCallback(() => {
        gameState.playCard(card);
    }, [card]);

    return <div class={`${css.cardContainer} ${isMine ? css.clickable : ''}`} onClick={isMine ? onClick : null} style={{transformOrigin: `${card.originX}px ${card.originY}px`, transform: `translate(${card.positionX + card.adjustmentX}px, ${card.positionY  + card.adjustmentY}px) rotate(${card.degrees || '0'}deg)`}}>
        <div class={css.scaler}>
            <div class={`${css.card} ${isMine ? css.clickable : ''}`} style={{transform: `rotateX(${card.rotationY}deg)`}}>
                <div class={`${css.front} ${css.face}`}>
                    <span class={css.topLeft}>{card.corner?.leftTop}</span>
                    <span class={css.topRight}>{card.corner?.rightTop}</span>
                    <span class={css.bottomRight}>{card.corner?.rightBottom}</span>
                    <span class={css.bottomLeft}>{card.corner?.leftBottom}</span>

                    <span class={css.middle}>{card.display}</span>
                </div>
                <div class={`${css.back} ${css.face}`}>
                    <div class={css.pattern} />
                </div>
            </div>
        </div>
    </div>;
}
