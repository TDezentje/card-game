export function getTweenValue(from: number, to: number, deltaT: number, unitsPerSecond: number) {
    const distance = to - from;
    return from + (distance * ((unitsPerSecond/ 1000) * deltaT));
}