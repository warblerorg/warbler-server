const express = require('express');

const { Pool, Client } = require('pg');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const user_validation_local = require('./src/user_validation_local.js');

const pool = new Pool();
const app = express();

// middleware stuff
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cookieSession({
    name: 'session',
    keys: ['asdf']
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration

passport.use(new LocalStrategy(
    async function(email_or_id, password, done) {
        try {
            const queryResult = await pool.query("SELECT * FROM users WHERE email_or_id=$1", [email_or_id]);
            if (queryResult.rows.length == 0) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            const validUser = await user_validation_local.validateUser(password, queryResult.rows[0]);
            if (!validUser) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            done(null, queryResult.rows[0]);
        } catch(e) {
            done(e);
        }
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.get('/', async (req, res) => res.send("Hello world!"));

app.get('/v1/comments/:thread_id/:comment_id', async (req, res, next) => {
    try {
        const queryResult = await pool.query("SELECT * FROM comments WHERE thread_id=$1 AND comment_id=$2",
            [req.params["thread_id"], req.params["comment_id"]]);
        if (queryResult.rows.length == 0) {
            res.status(404).send({
                "status": "error",
                "type": "comment not found"
            });
        } else {
            res.json(queryResult.rows[0]);
        }
    } catch(err) {
        console.log(err);
        res.status(500).send("Internal error.");
    }
});

app.get('/v1/comments/:thread_id', async (req, res, next) => {
    try {
        const queryResult = await pool.query("SELECT * FROM comments WHERE thread_id=$1", [req.params["thread_id"]]);
        res.json(queryResult.rows);
    } catch(err) {
        console.log(err);
        res.status(500).send(`Internal error: ${err.message}`);
    }
});

app.post('/v1/thread_comment/:thread_id', async (req, res, next) => {
    try {
        let current_user_id = null;
        if (!!req.user) {
            current_user_id = req.user["email_or_id"];
        } else {
            res.status(401).send("Cannot post comment without being logged in.");
        }
        if (current_user_id != req.body["user_id"]) {
            res.status(401).send("Unauthorized: cannot post comment as that user");
        } else {
            const queryResult = await pool.query("INSERT INTO comments(thread_id, parent_id, user_id, content)" +
                " VALUES($1, $2, $3, $4)",
                [
                    req.params["thread_id"],
                    req.body["parent_id"],
                    current_user_id,
                    req.body["content"]
                ]
            );
            res.json(queryResult.rows[0]);
        }
    } catch(err) {
        console.log(err);
        res.status(500).send("Internal error inserting.");
    }
});

app.put('/v1/comments/:thread_id/:comment_id', async (req, res, next) => {
    try {
        let current_user_id = null;
        if (!!req.user) {
            current_user_id = req.user["email_or_id"];
        } else {
            res.status(401).send("Need to be logged in to update comment.");
        }
        const updateQueryResult = await pool.query("UPDATE comments SET content=$1 WHERE thread_id=$2 and comment_id=$3 and user_id=$4",
            [req.body["content"], req.params["thread_id"], req.params["comment_id"], current_user_id]);
        if (updateQueryResult.rowCount == 0) {
            res.status(404).send(`Cannot find comment with id ` +
                `${req.params["id"]} belonging to user ${current_user_id}`);
        } else {
            res.status(204).send();
        }
    } catch(err) {
        console.log(err)
        res.status(500).send("Internal error updating comment.");
    }
});

app.delete('/v1/comments/:id', async (req, res, next) => {
    try {
        const current_user_id = req.user["email_or_id"];
        const userQueryResult = await pool.query("SELECT user_id FROM comments WHERE comment_id=$1",
            [req.params["id"]]);
        if (userQueryResult.rows.length == 0) {
            res.status(404).send(`Cannot find comment with id ${req.params["id"]}`);
        } else {
            let valid_user_id = userQueryResult.rows[0]["user_id"];
            if (current_user_id != valid_user_id) {
                res.status(401).send("Unauthorized");
            } else {
                const deleteQueryResult = await pool.query("DELETE FROM comments WHERE comment_id=$1",
                    [req.params["id"]]);
                res.status(204).send();
            }
        }
    } catch(err) {
        console.log(err);
        res.status(500).send("Internal error deleting.");
    }
});

app.get('/v1/thread/:id', async (req, res, next) => {
    try {
        const queryResult = await pool.query("SELECT * FROM threads WHERE id=$1", [req.params["id"]]);
        if (queryResult.rows.length == 0) {
            res.status(404).json({
                "status": "error",
                "type": "thread not found"
            });
        } else {
            res.json(queryResult.rows[0]);
        }
    } catch(err) {
        console.log(err);
        res.status(500).send("Internal error.");
    }
});

app.post('/v1/thread', async (req, res, next) => {
    try {
        const queryResult = await pool.query("INSERT INTO threads(id) VALUES($1)", [req.body["thread_id"]]);
        res.json(queryResult.rows[0]);
    } catch(err) {
        console.log(err);
        res.status(500).send(`Internal error inserting: ${err.stack}`);
    }
});
//app.put('/v1/thread')
//app.delete('/v1/thread/:id')

app.get('/v1/user/:id', async (req, res, next) => {
    try {
        const queryResult = await pool.query(
            "SELECT email_or_id, display_name, website FROM users WHERE email_or_id=$1", [req.params["id"]]);
        if (queryResult.rows.length == 0) {
            res.status(404).json({
                "status": "error",
                "type": "user profile not found"
            });
        } else {
            res.json(queryResult.rows[0]);
        }
    } catch(err) {
        console.log(err);
        res.status(500).send("Internal error.");
    }
});
app.post('/v1/user', async (req, res, next) => {
    try {
        const encryptedPassword = await user_validation_local.encryptPassword(req.body["password"]);
        const queryResult = await pool.query(
            "INSERT INTO users(email_or_id, display_name, website, encrypted_password) VALUES($1, $2, $3, $4)",
            [
                req.body["email_or_id"],
                req.body["display_name"],
                req.body["website"],
                Buffer.from(encryptedPassword)
            ]
        );
        res.json(queryResult.rows[0]);
    } catch(err) {
        console.log(err);
        res.status(500).send(`Internal error inserting: ${err.stack}`);
    }
});

app.put('/v1/user', async (req, res, next) => {
    try {
        let current_user_id = null;
        if (!!req.user) {
            current_user_id = req.user["email_or_id"];
        } else {
            res.status(401).send("Need to be logged in to update user.");
        }
        const encryptedPassword = await user_validation_local.encryptPassword(req.body["password"]);
        const updateQueryResult = await pool.query("UPDATE users SET email_or_id=$1, display_name=$2, website=$3, encrypted_password=$4 WHERE user_id=$5",
            [
                req.body["new_id"],
                req.body["display_name"],
                req.body["website"],
                Buffer.from(encryptedPassword),
                current_user_id
            ]);
        if (updateQueryResult.rowCount == 0) {
            res.status(404).send(`Cannot find user with id ${current_user_id}`);
        } else {
            res.status(204).send();
        }
    } catch(err) {
        console.log(err)
        res.status(500).send("Internal error updating user.");
    }
});

app.delete('/v1/user/:id', async (req, res, next) => {
    try {
        let current_user_id = null;
        if (!!req.user) {
            current_user_id = req.user["email_or_id"];
        }
        if (current_user_id != req.body["user_id"]) {
            res.status(401).send("Cannot delete user as another user: unauthorized");
        } else {
            const queryResult = await pool.query("DELETE FROM users WHERE email_or_id=$1", [current_user_id]);
            req.logout();
            res.json(queryResult.rows[0]);
        }
    } catch(err) {
        console.log(err);
        res.status(500).send("Internal error deleting user.");
    }
});

app.post('/login', passport.authenticate('local'),
    async (req, res, next) => {
        res.status(204).send();
});
app.get('/logout', async (req, res, next) => {
    req.logout();
    res.status(204).send();
});

exports.app = app;
