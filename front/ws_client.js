const host = "ws://172.20.10.4:12001"
const ws_cli = new WebSocket(host)

const send_btn = document.getElementById("send_btn");
const chat = document.getElementById("chat");
const buffer = document.getElementById("buffer");

ws_cli.onopen = () => {
    console.log("Connected to " + host);
};

ws_cli.onerror = error => {
    console.log("Error: can't connect to " + host + ": " + error);
};

ws_cli.onmessage = event => {
    console.log(event.data);
    var p = document.createElement("p");
    var br = document.createElement("br");
    p.innerHTML += event.data;
    chat.append(p);
    chat.append(br);
};

send_btn.addEventListener("click", (event) => {
    data = buffer.value;
    buffer.value = "";
    ws_cli.send(data)
});