import { h, Component } from 'preact';
import { GameElement } from './game/game.element';
import { AppState } from 'logic/app-state';
import { Router, route } from 'preact-router';
import { sleep } from 'logic/helpers/animation.helper';

const css = require('./app.element.scss');

export class AppElement extends Component {
    public appState = new AppState();
    
    public constructor(props) {
        super(props);
        this.onCreateRoomClick = this.onCreateRoomClick.bind(this);
        this.onJoinRoomClick = this.onJoinRoomClick.bind(this);
        this.handleRoute = this.handleRoute.bind(this);
    }

    public componentDidMount() {     
        this.appState.afterTick = () => {
            this.forceUpdate();
        };
        window.requestAnimationFrame(this.appState.tick);  
    }

    public render() {
        return <div>
            <Router onChange={this.handleRoute}>
                <div path="/" class={css.form}>
                    <span class={css.title}>Welcome</span>
                    <button onClick={this.onCreateRoomClick}>Create room</button>
                    <button onClick={this.onJoinRoomClick}>Join room</button>
                    <button onClick={this.onSettingsClick}>Settings</button>
                </div>
                <div path="/create" class={css.form}>
                    <span class={css.title}>Which game do you want to play?</span>
                    {
                        this.appState.availableGames?.map(g => <button class={css.game} onClick={() => this.createRoom(g.guid)}>
                            <span>{g.name}</span>
                            {
                                g.minPlayersCount && <span>Min: {g.minPlayersCount}</span>
                            }
                            {
                                g.maxPlayersCount && <span>Max: {g.maxPlayersCount}</span>
                            }
                            
                        </button>)
                    }

                    <button class={css.back} onClick={this.onBackClick}>Back</button>
                </div>
                <div path="/join" class={css.form}>
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
                    <button class={css.back} onClick={this.onBackClick}>Back</button>
                </div>
                <div path="/settings" class={css.form}>
                    <span class={css.title}>Settings</span>
                    <label for="name" />
                    <input id="name" name="name" value={this.appState.me?.name} onInput={e => this.onNameChanged(e)} />
                    <button class={css.back} onClick={this.onBackClick}>Back</button>
                </div>
                <div path="/game/:roomGuid">
                    <GameElement gameState={this.appState} />
                </div>
            </Router>
        </div>;
    }

    private async handleRoute(event) {
        if (!this.appState?.status && event.current?.props?.roomGuid) {
            while (!this.appState?.me) {
                await sleep(500);
            }
            this.appState.joinRoom(event.current.props.roomGuid);
        }

        if (/^\/game\//.test(event.previous)) {
            this.appState.leaveRoom();
        }
    }

    private onCreateRoomClick() {
        route('/create');
    }

    private onJoinRoomClick() {
        route('/join');
    }
    
    private onSettingsClick() {
        route('/settings');
    }

    private onNameChanged(event) {
        this.appState.changeName(event.currentTarget.value);
    }

    private createRoom(guid) {
        this.appState.createRoom(guid);
    }

    private joinRoom(guid) {
        this.appState.joinRoom(guid);
    }

    private onBackClick(event) {
        event.preventDefault();
        history.back();
    }
}
