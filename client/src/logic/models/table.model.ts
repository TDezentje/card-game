import { ScreenSize } from 'logic/interfaces/screen-size.interface';

export class Table {
    public size: string;
    public radius: number;

    public tick(screenSize: ScreenSize) {
        if (screenSize.width * .9 < screenSize.height * .9) {
            this.size = '90vw';
            this.radius = screenSize.width * .9 / 2;
        } else {
            this.size = '90vh';
            this.radius = screenSize.height * .9 / 2;
        }
    }
}