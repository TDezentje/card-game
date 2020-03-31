import { h, Component } from 'preact';
import { GameElement } from './game/game.element';
import { AppState } from 'logic/app-state';

const css = require('./app.element.scss');

class State {
    isCreatingRoom = false;
    isJoiningRoom = false;
}
export class AppElement extends Component<{}, State> {
    public state = new State();
    public appState = new AppState();
    
    public constructor(props) {
        super(props);
        this.onCreateRoomClick = this.onCreateRoomClick.bind(this);
        this.onJoinRoomClick = this.onJoinRoomClick.bind(this);
    }

    public componentDidMount() {     
        this.appState.afterTick = () => {
            this.forceUpdate();
        };
        window.requestAnimationFrame(this.appState.tick);  
    }

    public render() {
        return <div>
            {
                this.appState.status ? <GameElement gameState={this.appState} /> : null
            }

            {
                !this.appState.status && !this.state.isCreatingRoom && !this.state.isJoiningRoom ? 
                    <div class={css.form}>
                        <span class={css.title}>Welcome</span>
                        <button onClick={this.onCreateRoomClick}>Create room</button>
                        <button onClick={this.onJoinRoomClick}>Join room</button>
                    </div>
                : null
            }

            {
                !this.appState.status && this.state.isCreatingRoom ? 
                    <div class={css.form}>
                        <span class={css.title}>Which game do you want to play?</span>
                        {
                            this.appState.availableGames.map(g => <button onClick={() => this.createRoom(g.guid)}>{g.name}</button>)
                        }
                    </div>
                : null
            }

            {
                !this.appState.status && this.state.isJoiningRoom ? 
                    <div class={css.form}>
                        <span class={css.title}>Choose a room</span>
                        {
                            this.appState.allRooms?.filter(r => !r.isStarted).length === 0 ? <span class={css.sub}>No rooms found</span> : null
                        }
                        {
                            this.appState.allRooms?.filter(r => !r.isStarted).map(r => <button class={css.room} disabled={(r.maxPlayersCount && r.playersCount === r.maxPlayersCount)} 
                                    onClick={() => this.joinRoom(r.guid)}>
                                <span>{r.name}</span>
                                {r.maxPlayersCount ? <span>{r.playersCount}/{r.maxPlayersCount}</span> : null}
                            </button>)
                        }
                    </div>
                : null
            }

        </div>;
    }

    private onCreateRoomClick() {
        this.setState({
            isCreatingRoom: true,
            isJoiningRoom: false
        });
    }

    private onJoinRoomClick() {
        this.setState({
            isCreatingRoom: false,
            isJoiningRoom: true
        });
    }

    private createRoom(guid) {
        this.appState.createRoom(guid);
    }

    private joinRoom(guid) {
        this.appState.joinRoom(guid);
    }
}
