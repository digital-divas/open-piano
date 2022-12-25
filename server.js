const WebSocket = require("ws");

const wss = new WebSocket.Server({
    port: 3000
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