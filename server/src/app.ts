import express from 'express';

const PORT = 8080;
const app = express();
const path = require('path');

import { staticFiles } from './routes/static-files';

app.use('/assets', staticFiles);
app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Redirect listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');


    if (MODE === 'DEV') {
        console.log('Refreshing browser');
        const uuid = require('uuid/v4');
        const sessionId = uuid();
        const WebSocket = require('ws');
        const wss = new WebSocket.Server({ port: 8081 });
  
        wss.on('connection', ws => {
            ws.send(sessionId);
        });
    }
});