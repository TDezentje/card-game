import { h, Component } from 'preact';
import { GameElement } from './game/game.element';
import { GameState } from 'logic/gamestate';

require('./app.element.scss');

export class App extends Component {
    public currentGame = new GameState();
    
    public componentDidMount() {     
        this.currentGame.afterTick = () => {
            this.forceUpdate();
        };
        window.requestAnimationFrame(this.currentGame.tick);  
    }

    public render() {
        return <div>
            <GameElement gameState={this.currentGame} />
        </div>;
    }
}
