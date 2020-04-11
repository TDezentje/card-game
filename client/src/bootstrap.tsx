import { h, render } from 'preact';
import { AppElement } from './components/app.element';

if (MODE === 'DEV') {
    require("preact/debug");
}

if (document.readyState == 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
        render(<AppElement />, document.body);
    });
} else {
    render(<AppElement />, document.body);
}