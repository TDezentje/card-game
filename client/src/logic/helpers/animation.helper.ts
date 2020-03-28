export function getTweenValue(from: number, to: number, deltaT: number, unitsPerSecond: number) {
    const distance = to - from;

    if (distance < 1 && distance > -1) {
        return to;
    }
    return from + (distance * ((unitsPerSecond/ 1000) * deltaT));
}

export function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}