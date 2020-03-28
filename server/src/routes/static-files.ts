import express from 'express';
import path from 'path';

const STATIC_PATH = path.resolve(__dirname, 'assets');
const STATIC_OPTS = {
    maxAge: 31536000000
};

console.log('[App: Static] initialized.');
const staticFiles = express.static(STATIC_PATH, STATIC_OPTS);
export { staticFiles };