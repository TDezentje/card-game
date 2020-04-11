export abstract class Watchable {
    private listeners = [];
    protected properties: string[] = [];
    
    public subscribe(listener: (watchable: Watchable) => void) {
        this.listeners.push(listener);
    }

    public unsubscribe(listener: (watchable: Watchable) => void) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }

    public update() {
        for (const listener of this.listeners) {
            listener(this);
        }
    }

    public apply(obj) {
        Object.assign(this, obj);
        this.update();
    }

    public updateOnChange(props: () => Array<any>, body: () => void) {
        const now = props();
        body();
        const then = props();

        if (now.length !== then.length) {
            this.update();
            return;
        }

        for (let i = 0; i < now.length; i++) {
            if(now[i] !== then[i]) {
                this.update();
                return;
            }
        }
    }
}