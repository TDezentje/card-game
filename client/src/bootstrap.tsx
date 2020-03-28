import { h, render } from 'preact';
import { App } from './components/app.element';

if (document.readyState == 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
        render(<App />, document.body);
    });
} else {
    render(<App />, document.body);
}