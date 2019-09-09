'use strict';

const WebSocket = require('ws');
const express = require("express");
const mongocli = require("mongodb").MongoClient;

const port = 12000;
const host = '0.0.0.0';
const app = express();

const url = 'mongodb://mongo:27017/';

const front_dir = "/home/node/front/";

const ws_srv = new WebSocket.Server({ port: 12001 });

var users = [];

mongocli.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}, (err, client) => {
    if (err) {
        console.error("Error: can't connect to mongodb.");
        return;
    }
    console.log("Connected to db\n");
    client.db('mydb').collection('col').find().toArray((err, result) => {
        if (err)
            throw err;
        console.log(result);
    });
    client.close();
});

app.use(express.static(front_dir));

app.listen(port, host, () => {
    console.log(`Running on http://${host}:${port}`);
});

app.get('/', (req, res) => {
    res.sendFile(front_dir + 'index.html');
});

ws_srv.broadcast = (data) => {
    ws_srv.clients.forEach((client) => {
        client.send(data);
    });
};

ws_srv.on('connection', (ws_cli, req) => {
    var ip = req.connection.remoteAddress.substr(7);
    console.log(ip + " connected.\n");
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