
export class ScreenSize {
    public width: number;
    public height: number;

    public constructor() {
        window.addEventListener('resize', () => window.requestAnimationFrame(this.init.bind(this)));
        this.init();
    }

    private init() {
        this.width = document.body.clientWidth,
        this.height = document.body.clientHeight;
    }
}