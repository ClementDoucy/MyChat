'use strict';

const process = require("process");

if (process.argv.length != 3) {
    console.error("USAGE: node server.js [WebSocket Host]");
    console.error("Invalid arguments. Exit.");
    process.exit(1);
}

const WebSocket = require('ws');
const express = require("express");

const port = 12000;
const host = '0.0.0.0';
const front_dir = "/home/node/front/";

const app = express();
const ws_srv = new WebSocket.Server({ port: 12001 });

const morgan = require('morgan');
const log_fmt = "[:date[web]] :remote-addr :method :url :status :response-time ms";

app.use(morgan(log_fmt, {
    skip: (req, res) => {
        return res.statusCode < 400
    },
    stream: process.stderr
}));

app.use(morgan(log_fmt, {
    skip: (req, res) => {
        return res.statusCode >= 400
    },
    stream: process.stdout
}));

var users = [];

app.use(express.static(front_dir));

app.listen(port, host, () => {
    console.log(`Running on http://${host}:${port}`);
});

app.get('/', (req, res) => {
    res.sendFile(front_dir + 'index.html', {ws_host:process.argv[2]});
});

app.get('/auth', (req, res) => {
    res.sendFile(front_dir + 'auth.html');
});

ws_srv.broadcast = (data) => {
    ws_srv.clients.forEach((client) => {
        client.send(data);
    });
};

ws_srv.on('connection', (ws_cli, req) => {
    var ip = req.connection.remoteAddress.substr(7);
    console.log("[Web Socket] " + ip + " connected.");
    users[ip] = "";
    ws_cli.on('message', message => {
        var fmt_message = "[" + (users[ip] != "" ? users[ip] : ip) + "] " + message;
        if (message.length >= 11 && message.substr(0, 9) == "/nickname") {
            users[ip] = message.slice(10, message.length);
        } else {
            ws_srv.broadcast(fmt_message);
        }
    });
});