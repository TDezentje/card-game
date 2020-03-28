import { Player } from './player.model';

export class GameState {
    state: State;
    nextPlayer?: Player;
}

export enum State{
    Started,
    Running,
    Stopped
}