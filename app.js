const express = require('express');

const { Pool, Client } = require('pg');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = new Pool();
const app = express();

app.get('/', async (req, res) => res.send("Hello world!"));

app.get('/v1/comment/:id', async (req, res, next) => {
    try {
        const queryResult = await pool.query("SELECT * FROM comments WHERE comment_id=$1", [req.params["id"]]);
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

app.post('/v1/comment', async (req, res, next) => {
    try {
        const queryResult = await pool.query("INSERT INTO comments(thread_id, parent_id, user_id, content) VALUES($1, $2, $3, $4)",
            [
                req.body["thread_id"],
                req.body["parent_id"],
                req.body["user_id"],
                req.body["content"]
            ]
        );
        res.json(queryResult.rows[0]);
    } catch(err) {
        console.log(err);
        res.status(500).send("Internal error inserting.");
    }
});
//app.put('/v1/comment')
//app.delete('/v1/comment/:id')
//app.post('/v1/login')

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
        const queryResult = await pool.query("SELECT * FROM users WHERE email_or_id=$1", [req.params["id"]]);
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
        const queryResult = await pool.query("INSERT INTO users(email_or_id, display_name, website, encrypted_password) VALUES($1, $2, $3, $4)",
            [
                req.body["email_or_id"],
                req.body["display_name"],
                req.body["website"],
                req.body["encrypted_password"]
            ]
        );
        res.json(queryResult.rows[0]);
    } catch(err) {
        console.log(err);
        res.status(500).send(`Internal error inserting: ${err.stack}`);
    }
});
//app.put('/v1/user')
//app.delete('/v1/user/:id')

exports.app = app;
