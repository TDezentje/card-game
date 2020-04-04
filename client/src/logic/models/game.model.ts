export class Game {
    guid: string;
    name: string;
    minPlayersCount: number;
    maxPlayersCount: number;
}

export class GameEndState {
    text: string;
    buttonText: string;
    altText: string;
}

export enum GameStatus {
    lobby = 1,
    started = 2,
    gameover = 3,
    cleanup = 4
}

export enum GameRotation {
    None = 'none',
    Clockwise = 'clockwise',
    counterClockwise = 'counterClockwise',
}