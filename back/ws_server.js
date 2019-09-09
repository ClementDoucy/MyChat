const WebSocket = require('ws');

const ws_srv = new WebSocket.Server({ port: 12001 });

ws_srv.on('connection', (ws_cli, req) => {
    ws_cli.on('message', message => {
        console.log("Get "+ message + " from " + req.connection.remoteAddress);
    });
});