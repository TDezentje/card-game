import { h } from 'preact';
import { useState, useCallback } from 'preact/hooks';

export function App() {
    const [value, setValue] = useState(0);
    const increment = useCallback(() => {
        setValue(value + 1);
    }, [value]);

    return (
        <div>
            Counter: {value}
            <button onClick={increment}>Increment</button>
        </div>
    );
}
