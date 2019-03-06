DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS threads;
DROP TABLE IF EXISTS comments;

CREATE TABLE users(
    email_or_id VARCHAR(512) PRIMARY KEY,
    display_name VARCHAR(512),
    website VARCHAR(512),
    encrypted_password bytea
);


CREATE TABLE threads(
    id VARCHAR(1024) PRIMARY KEY
);

CREATE TABLE comments(
    thread_id VARCHAR(1024) REFERENCES threads(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    comment_id SERIAL,
    parent_id INTEGER REFERENCES comments(comment_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    user_id VARCHAR(512) REFERENCES users(email_or_id),
    content TEXT,
    PRIMARY KEY (comment_id)
);
