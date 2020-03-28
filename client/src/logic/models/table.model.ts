import { ScreenSize } from 'logic/interfaces/screen-size.interface';

export class Table {
    public size: string;
    public radius: number;

    public tick(screenSize: ScreenSize) {
        if (screenSize.width * .8 < screenSize.height * .8) {
            this.size = '80vw';
            this.radius = screenSize.width * .8 / 2;
        } else {
            this.size = '80vh';
            this.radius = screenSize.height * .8 / 2;
        }
    }
}