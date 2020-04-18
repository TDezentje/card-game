import { Watchable } from './watchable';

export class StoreArray<T> extends Watchable {
    private _value: T[] = [];

    public get value () {
        return this._value || [];
    }

    public push(value: T | T[]) {
        if (Array.isArray(value)) {
            this._value.push(...value);
        } else {
            this._value.push(value);
        }

        this.update();
    }

    public setValue(value: T[]) {
        this._value = value;
        this.update();
    }

    public removeAt(index) {
        if(index > -1) {
            this.value?.splice(index, 1);
        }

        this.update();
    }

    public findIndex(cb) {
        return this.value.findIndex(cb);
    }

    public entries() {
        return this.value.entries();
    }

    public map(cb) {
        return this.value.map(cb);
    }

    public filter(cb) {
        return this.value.filter(cb);
    }

    public find(cb) {
        return this.value.find(cb);
    }

    public item(index) {
        return this.value[index];
    }

    public get length () {
        return this.value.length;
    }

    public splice(start, deleteCount) {
        return this.value.splice(start, deleteCount);
    }

    public empty() {
        this.value.splice(0);
    }

    public any() {
        return this.value?.length > 0;
    }
}