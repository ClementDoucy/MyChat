const express = require("express");
const cookie_parser = require("cookie-parser");
const express_ws = require("express-ws");
const session = require("express-session");
const morgan = require('morgan');
const body_parser = require("body-parser");
const process = require("process");
const db = require('./queries');

const port = 12000;
const host = '0.0.0.0';
const front_dir = __dirname + "/../front/";

const app = express();
const ws_srv = express_ws(app);

app.set("view engine", 'ejs');
app.use(cookie_parser());
app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());
app.use(express.static(front_dir));

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

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

app.listen(port, host, () => {
    console.log(`Running on http://${host}:${port}`);
    db.create_tables();
});

module.exports = {
    app,
    ws_srv,
    db,
    front_dir
};