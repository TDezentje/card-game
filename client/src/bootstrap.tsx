import { h, render } from 'preact';
import { AppElement } from './components/app.element';

if (document.readyState == 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
        render(<AppElement />, document.body);
    });
} else {
    render(<AppElement />, document.body);
}