const host = location.origin.replace(/^http/, 'ws') + '/ws';
const ws_cli = new WebSocket(host);

const send_btn = document.getElementById("send_btn");
const chat = document.getElementById("chat");
const buffer = document.getElementById("buffer");
const join_input = document.getElementById("join_input");
const join_btn = document.getElementById("join_btn");

ws_cli.onopen = () => {
    console.log("Connected to " + host);
};

ws_cli.onerror = error => {
    console.log("Error: can't connect to " + host + ": " + error);
};

on_message = (data) => {
    var p = document.createElement("p");
    var br = document.createElement("br");

    p.innerHTML += `[${data.author}] ${data.content}`;
    chat.append(p);
    chat.append(br);
};

on_current_room = (data) => {
    console.log(data);
    document.getElementById("current_room").innerHTML = data;
};

const on = {
    'message': on_message,
    'current_room': on_current_room
};

ws_cli.onmessage = event => {
    console.log(event.data);
    let json = JSON.parse(event.data);

    if (['event_name'] in json && [json.event_name] in on)
        on[json.event_name](json.data);
};

send_data = (event_name, data) => {
    let json = {event_name, data, date: Date()};

    ws_cli.send(JSON.stringify(json));
};

send_btn.addEventListener("click", (event) => {
    send_data('message', buffer.value);
    buffer.value = "";
});

join_btn.addEventListener("click", (event) => {
    send_data('join_room', join_input.value);
    join_input.value = "";
});
