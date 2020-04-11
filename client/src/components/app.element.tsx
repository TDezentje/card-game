import { h, Component } from 'preact';
import { GameElement } from './game/game.element';
import { AppState } from 'logic/app-state';
import { Router, route } from 'preact-router';
import { sleep, getQuality, setQuality, Quality } from 'logic/helpers/animation.helper';
import { Watch } from './helper/watch';

const css = require('./app.element.scss');

class State {
    public quality;
}

export class AppElement extends Component<{}, State> {
    public state = new State();
    public appState = new AppState();
    
    public constructor(props) {
        super(props);
        this.onCreateRoomClick = this.onCreateRoomClick.bind(this);
        this.onJoinRoomClick = this.onJoinRoomClick.bind(this);
        this.handleRoute = this.handleRoute.bind(this);
        this.onQualityChanged = this.onQualityChanged.bind(this);

        this.state.quality = getQuality();
    }

    public componentDidMount() {     
        window.requestAnimationFrame(this.appState.tick);
    }

    public render() {
        return <div class={`quality-${this.state.quality}`}>
            <Router onChange={this.handleRoute}>
                <div path="/" class={css.form}>
                    <span class={css.title}>Welcome</span>
                    <button onClick={this.onCreateRoomClick}>Create room</button>
                    <button onClick={this.onJoinRoomClick}>Join room</button>
                    <button onClick={this.onSettingsClick}>Settings</button>
                </div>
                <div path="/create" class={css.form}>
                    <span class={css.title}>Which game do you want to play?</span>
                        <Watch property={this.appState.availableGames} render={
                            (availableGames) => availableGames.value.map(g => <button class={css.game} onClick={() => this.createRoom(g.guid)}>
                                <span>{g.name}</span>
                                {
                                    g.minPlayersCount && <span>Min: {g.minPlayersCount}</span>
                                }
                                {
                                    g.maxPlayersCount && <span>Max: {g.maxPlayersCount}</span>
                                }
                            </button>)
                        } />
                    <button class={css.back} onClick={this.onBackClick}>Back</button>
                </div>
                <div path="/join" class={css.form}>
                    <span class={css.title}>Choose a room</span>
                    <Watch property={this.appState.allRooms} render={
                            (allRooms) => {
                                const rooms = allRooms.value.filter(r => !r.isStarted);
                                if (rooms.length === 0) {
                                    return <span class={css.sub}>No rooms found</span>;
                                } else {
                                    return rooms.map(room => 
                                        <Watch property={room} render={(r) => 
                                            <button class={css.room} disabled={(r.maxPlayersCount && r.playersCount === r.maxPlayersCount)} 
                                                onClick={() => this.joinRoom(r.guid)}>
                                                <span>{r.name}</span>
                                                {r.maxPlayersCount ? <span>{r.playersCount}/{r.maxPlayersCount}</span> : null}
                                            </button>
                                        } /> 
                                    );
                                }
                            }
                    } />
                    <button class={css.back} onClick={this.onBackClick}>Back</button>
                </div>
                <div path="/settings" class={css.form}>
                    <Watch property={this.appState.me} render={ me =>
                        [
                            <span class={css.title}>Settings</span>,
                            <label for="name" />,

                            <input id="name" name="name" value={me.name} onInput={e => this.onNameChanged(e)} />,
                            <input type="color" id="color" name="color" value={me.color} onInput={e => this.onColorChanged(e)} />,

                            <select id="quality" name="quality" onInput={e => this.onQualityChanged(e)}>
                                <option selected={this.state.quality === Quality.Low} value="low">Low</option>
                                <option selected={this.state.quality === Quality.High} value="high">High</option>
                            </select>,
                            <button class={css.back} onClick={this.onBackClick}>Back</button>
                        ]
                    } />
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
                await sleep(1000);
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

    private onColorChanged(event) {
        this.appState.changeColor(event.currentTarget.value);
    }

    private onQualityChanged(event) {
        this.setState({
            quality: event.currentTarget.value
        });
        setQuality(event.currentTarget.value);
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
