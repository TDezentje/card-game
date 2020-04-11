import { Watchable } from 'logic/helpers/watchable';

export class Room extends Watchable {
    guid: string;
    name: string;
    isStarted: boolean;
    playersCount: number;
    minPlayersCount: number;
    maxPlayersCount: number;
    gameName: string;

    public constructor(obj?: Room) {
        super();
        
        if (obj) {
            this.apply(obj);
        }
    }
}