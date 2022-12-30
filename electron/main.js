const {
    app,
    BrowserWindow,
    Menu,
    globalShortcut,
} = require('electron');
const WebSocket = require("ws");

/**
 * @type {WebSocket.Server[]}
 */
const connections = [];


const wss = new WebSocket.Server({
    port: 3000
});

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


app.on('ready', () => {

    Menu.setApplicationMenu(null);

    // const mainWindow = new BrowserWindow({ width: 800, height: 600, frame: false });

    console.log('teste');

    const mainWindow = new BrowserWindow({
        frame: true,
        resizable: false,
        transparent: false,
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true
        }
    });


    mainWindow.center();
    mainWindow.setMenu(null);
    mainWindow.setFullScreen(false);
    mainWindow.loadURL('file://' + __dirname + '/index.html');
});
