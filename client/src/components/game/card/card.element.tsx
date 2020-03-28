import { h } from 'preact';
import { Card } from 'logic/models/card.model';
import { Player } from 'logic/models/player.model';

const css = require('./card.element.scss');

export function CardElement({
    card
}: {
    card: Card;
}) {
    return <div class={css.card} style={{transform: `translate(${card.positionX}px, ${card.positionY}px) rotate(${card.degrees}deg) rotateY(${card.rotationY}deg)`}}>
        <div class={`${css.front} ${css.face}`}>
            <span class={css.topLeft}>{card.corner.leftTop}</span>
            <span class={css.topRight}>{card.corner.rightTop}</span>
            <span class={css.bottomRight}>{card.corner.rightTop}</span>
            <span class={css.bottomLeft}>{card.corner.leftBottom}</span>

            <span class={css.middle}>{card.display}</span>
        </div>
        <div class={`${css.back} ${css.face}`}>
            <div class={css.pattern} />
        </div>
    </div>;
}
