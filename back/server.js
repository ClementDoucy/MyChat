'use strict';

const { app, ws_srv, db, front_dir } = require('./config');

let clients = [];

app.get('/', (req, res) => {
    if (!req.session.log)
        res.redirect('/login')
    else
        res.render(front_dir + 'index')
});

app.post('/', (req, res) => {
    if ('new_room' in req.body)
        db.new_room(req.body['new_room'], req.session.username);
    res.redirect('/');
});

app.get('/auth', (req, res) => {
    res.render(front_dir + 'auth');
});

app.post('/auth', (req, res) => {
    const { username, email, password, password_conf } = req.body
    let cond = username && email && password;
    if (cond && password === password_conf) {
        db.new_user(username, email, password);
        req.session.log = true;
        req.session.username = username;
        res.redirect('/');
    } else
        res.redirect('/auth');
});

app.get('/login', (req, res) => {
    res.render(front_dir + 'login');
});

app.post('/login', db.login);

app.get('/user', db.get_all_users);

app.ws('/ws', (ws, req) => {
    clients.push(ws);
    ws.on('message', (msg) => {
        clients.forEach((client) => {
            console.log(client.session);
            client.send(`[${req.session.username}] ${msg}`);
        });
    });
});