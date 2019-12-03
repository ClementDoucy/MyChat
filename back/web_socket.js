let clients = []

const on_message = (ws, req, json) => {
    let data = {
        event_name: 'message',
        data: {
            author: req.session.username,
            content: json.data
        },
        date: Date()
    }
    data = JSON.stringify(data);
    clients.forEach((client) => {
        client.send(data);
    });
};

const on_join_room = (ws, req, json) => {
    req.session.room = json.data;
    console.log(`join_room : ${json.data}`);
    let data = {event_name: 'current_room', data: json.data, date: Date()};
    ws.send(JSON.stringify(data));
};

const on = {
    'message': on_message,
    'join_room': on_join_room
};

const manage = (ws, req) => {
    console.log(`[WS ${Date()}] ${req.session.username} connected`);
    clients.push(ws);

    ws.on('message', (msg) => {
        let json = JSON.parse(msg);
        if (['event_name'] in json && [json.event_name] in on)
            on[json.event_name](ws, req, json);
    });
};

module.exports = {manage};