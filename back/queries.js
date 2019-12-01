const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'me',
    password: 'password',
    host: 'localhost',
    database: 'my_chat',
    port: 5432
});

const create_tables = () => {
    create_user_table(() => {
        create_messages_table(() => {
            create_room_table();
        });
    });
};

const create_user_table = (callback) => {
    let sql =
    'CREATE TABLE IF NOT EXISTS users (\
        ID SERIAL PRIMARY KEY,\
        username TEXT NOT NULL UNIQUE,\
        email TEXT NOT NULL UNIQUE,\
        password TEXT NOT NULL\
    )';
    pool.query(sql, (err) => {
        if (err) {
            console.error("Create usre table");
            console.error(err);
        } else
            callback();
    });
};

const create_room_table = () => {
    let sql =
    'CREATE TABLE IF NOT EXISTS room(\
        ID SERIAL PRIMARY KEY,\
        name TEXT NOT NULL UNIQUE,\
        usernames text[],\
        messages messages\
    )';
    pool.query(sql, (err) => {
        if (err) {
            console.error("create_room_table");
            console.error(err);
        }
    });
};

const create_messages_table = (callback) => {
    let sql =
    'CREATE TABLE IF NOT EXISTS messages(\
        ID SERIAL PRIMARY KEY,\
        date TIMESTAMPTZ,\
        author TEXT NOT NULL,\
        content TEXT\
    )';
    pool.query(sql, (err) => {
        if (err) {
            console.error("create_messages_table");
            console.error(err);
        } else
            callback();
    });
};

const new_user = (username, email, password) => {
    let sql = 'INSERT INTO users (username, email, password) \
               VALUES ($1, $2, crypt($3, gen_salt(\'bf\')))';
    pool.query(sql, [username, email, password], (err, result) => {
        if (err) {
            console.error("new user");
            console.error(err);
            return false;
        }
    });
    return true;
};

const get_all_users = (req, res) => {
    let sql = 'SELECT * FROM users';
    pool.query(sql, (err, result) => {
        if (err) {
            console.error("get_all_users");
            console.error(err);
            return null;
        }
        res.json(result.rows);
    });
};

const login = (req, res) => {
    const { email, password } = req.body;
    let sql = 'SELECT password = crypt($1, password) FROM users WHERE email = $2';

    if (!email || !password) {
        res.redirect('/login');
        return;
    }
    pool.query(sql, [password, email], (err, result) => {
        if (err) {
            console.error("login");
            console.error(err);
        }
        let rows = result.rows;
        let cond = rows.length != 0 && '?column?' in rows[0];
        if (cond && rows[0]['?column?'] === true) {
            req.session.log = true;
            get_username_by_email(email, (ret) => {
                req.session.username = ret;
                req.session.save();
            });
            res.redirect('/');
        } else
            res.redirect('/login');
    });
};

const get_username_by_email = (email, callback) => {
    let sql = 'SELECT username FROM users WHERE email = $1';

    pool.query(sql, [email], (err, result) => {
        if (err) {
            console.error("get_username_by_email");
            console.error(err);
            callback("GET_NAME_ERROR");
        }
        let rows = result.rows;
        if (rows.length != 0 && 'username' in rows[0]) {
            callback(rows[0]['username']);
        }
    });
    return callback("NAME_NOT_FOUND");
};

const new_room = (name, username) => {
    let sql = 'INSERT INTO room (name, usernames)\
               VALUES ($1, ARRAY[$2])';

    pool.query(sql, [name, username], (err, result) => {
        if (err) {
            console.error("new_room");
            console.error(err);
        }
    });
};

module.exports = {
    create_tables,
    new_user,
    get_all_users,
    login,
    new_room
}