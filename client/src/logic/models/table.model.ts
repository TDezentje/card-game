import { ScreenSize } from 'logic/models/screen-size.model';
import { Watchable } from 'logic/helpers/watchable';

export class Table extends Watchable{
    public size: string;
    public radius: number;

    public tick(screenSize: ScreenSize) {
        this.updateOnChange(() => [this.size, this.radius], () =>{
            if (screenSize.width * .9 < screenSize.height * .9) {
                this.size = '90vw';
                this.radius = screenSize.width * .9 / 2;
            } else {
                this.size = '90vh';
                this.radius = screenSize.height * .9 / 2;
            }
        });
    }
}