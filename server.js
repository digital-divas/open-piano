const WebSocket = require("ws");
const https = require('https');
const fs = require('fs');

const server = https.createServer({
    cert: fs.readFileSync('certificate.pem'),
    key: fs.readFileSync('key.pem')
});

const wss = new WebSocket.Server({
    // port: 3000,
    server: server
});

/**
 * @type {WebSocket.Server[]}
 */
const connections = [];

function onError(ws, err) {
    console.error(`onError: ${err.message}`);
}

function onMessage(ws, data) {
    // console.log(ws);
    console.log(`onMessage: ${data}`);

    for (const connection of connections) {
        if (connection == ws) {
            console.log('skip master');
            continue;
        }
        connection.send(`${data}`);
    }
    // ws.send(`recebido!`);
}

function onConnection(ws, req) {
    // console.log(ws);
    connections.push(ws);
    ws.on('message', data => onMessage(ws, data));
    ws.on('error', error => onError(ws, error));
    console.log(`onConnection`);
}

function onClose(ws) {
    console.log("onClose");
}

wss.on('connection', onConnection);
wss.on('close', onClose);

server.listen(function listening() {
    console.log(`wss://localhost:${server.address().port}`);

    // If the `rejectUnauthorized` option is not`false`, the server certificate
    // is verified against a list of well - known CAs.An 'error' event is emitted;
    // if verification fails.

    // The certificate used in this example is self - signed so`rejectUnauthorized`
    // is set to`false`.;

    const ws = new WebSocket(`wss://localhost:${server.address().port}`, {
        rejectUnauthorized: false
    });

    ws.on('open', function open() {

        // ws.send('All glory to WebSockets!');
    });
});