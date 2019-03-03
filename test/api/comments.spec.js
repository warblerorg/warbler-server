const request = require('supertest');
const { app } = require('../../app');

const exitingThreadId = 'existing-12ad3';
const fakeThreadId = 'does-not-exist-935sr';
const existingCommentId = 'existing-12ad3/1234';
const fakeCommentId = 'existing-12ad3/1000';

const bearer = 'Bearer 2312sd.3432re3d.4324324';
const author = {
    username: 'drwho',
    name: 'John Smith',
    website: 'https://tardis.net',
    avatar_url: ''
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

describe('GET /comments/{thread_id}', () => {
    // TODO mock the existing thread

    // For some reason this is needed for the
    // first 2 test suites to work properly
    beforeAll(() => wait(1000));

    test('should have 404 status for unknown thread', async () => {
        await request(app)
            .get(`/v1/comments/${fakeThreadId}`)
            .expect(404);
    });

    test('should have 200 status for known thread', async () => {
        const res = await request(app)
            .get(`/v1/comments/${exitingThreadId}`)
            .expect('Content-Type', /json/)
            .expect(200);
        expect(res.body).toBeInstanceOf(Object);
    });

    // TODO test the body
});

describe('POST /comments/{thread_id}', () => {
    // TODO mock the existing thread

    test('should have 404 status for unknown thread', async () => {
        await request(app)
            .post(`/v1/comments/${fakeThreadId}`)
            .send('Hello world')
            .set('Content-Type', 'text/plain')
            .set('Authorization', bearer)
            .expect(404);
    });

    test('should have 401 status for no authorization', async () => {
        await request(app)
            .post(`/v1/comments/${exitingThreadId}`)
            .send('Hello world')
            .set('Content-Type', 'text/plain')
            .expect(401);
    });

    describe('should accept various MIME types', () => {
        const commentTypes = new Map()
            .set('application/json', { content: 'Hello world' })
            .set('multipart/form-data', 'content=Hello%20world')
            .set('application/x-www-form-urlencoded', 'content=Hello%20world')
            .set('text/plain', 'Hello world');

        for (const [type, content] of commentTypes) {
            test(`should accept ${type}`, async () => {
                const res = await request(app)
                    .post(`/v1/comments/${exitingThreadId}`)
                    .set('Content-Type', type)
                    .set('Authorization', bearer)
                    .send(content)
                    .expect(200);
                expect(res.body).toEqual({
                    thread_id: exitingThreadId,
                    comment_id: expect.any(Number),
                    parent_id: null,
                    author,
                    content: 'Hello world'
                });
            });
        }
    });

    describe('should convert markdown', async () => {
        const res = await request(app)
            .post(`/v1/comments/${exitingThreadId}`)
            .set('Content-Type', 'text/plain')
            .set('Authorization', bearer)
            .send('**Hello** _world_!')
            .expect(200);
        expect(res.body.content).toBe('<strong>Hello</strong> <em>world</em>!');
    });

    describe('should remove XSS vectors', async () => {
        const res = await request(app)
            .post(`/v1/comments/${exitingThreadId}`)
            .set('Content-Type', 'text/plain')
            .set('Authorization', bearer)
            .send(
                `<img onload="alert('Evil code')" src="https://example.com"><script>alert('Hello bad world')</script><style>*{display:none}</style>`
            )
            .expect(200);
        expect(res.body.content).toBe('<img src="https://example.com">');
    });
});

describe('PUT /comments/{thread_id}/{comment_id}', () => {
    // TODO mock the existing thread

    test('should have 404 status for unknown thread', async () => {
        await request(app)
            .put(`/v1/comments/${fakeThreadId}/0`)
            .send('Hello world')
            .set('Content-Type', 'text/plain')
            .set('Authorization', bearer)
            .expect(404);
    });

    test('should have 404 status for unknown comment', async () => {
        await request(app)
            .put(`/v1/comments/${fakeCommentId}`)
            .send('Hello world')
            .set('Content-Type', 'text/plain')
            .set('Authorization', bearer)
            .expect(404);
    });

    test('should have 401 status for no authorization', async () => {
        await request(app)
            .put(`/v1/comments/${existingCommentId}`)
            .send('Hello world')
            .set('Content-Type', 'text/plain')
            .expect(401);
    });

    describe('should accept various MIME types', () => {
        const commentTypes = new Map()
            .set('application/json', { content: 'Hello world' })
            .set('multipart/form-data', 'content=Hello%20world')
            .set('application/x-www-form-urlencoded', 'content=Hello%20world')
            .set('text/plain', 'Hello world');

        for (const [type, content] of commentTypes) {
            test(`should accept ${type}`, async () => {
                const res = await request(app)
                    .put(`/v1/comments/${existingCommentId}`)
                    .set('Content-Type', type)
                    .set('Authorization', bearer)
                    .send(content)
                    .expect(200);
                expect(res.body).toEqual({
                    thread_id: exitingThreadId,
                    comment_id: 1234,
                    parent_id: null,
                    author,
                    content: 'Hello world'
                });
            });
        }
    });

    describe('should convert markdown', async () => {
        const res = await request(app)
            .put(`/v1/comments/${existingCommentId}`)
            .set('Content-Type', 'text/plain')
            .set('Authorization', bearer)
            .send('**Hello** _world_!')
            .expect(200);
        expect(res.body.content).toBe('<strong>Hello</strong> <em>world</em>!');
    });

    describe('should remove XSS vectors', async () => {
        const res = await request(app)
            .put(`/v1/comments/${existingCommentId}`)
            .set('Content-Type', 'text/plain')
            .set('Authorization', bearer)
            .send(
                `<img onload="alert('Evil code')" src="https://example.com"><script>alert('Hello bad world')</script><style>*{display:none}</style>`
            )
            .expect(200);
        expect(res.body.content).toBe('<img src="https://example.com">');
    });
});

describe('DELETE /comments/{thread_id}/{comment_id}', () => {
    // TODO mock the existing thread

    test('should have 404 status for unknown thread', async () => {
        await request(app)
            .delete(`/v1/comments/${fakeThreadId}/0`)
            .set('Content-Type', 'text/plain')
            .set('Authorization', bearer)
            .expect(404);
    });

    test('should have 404 status for unknown comment', async () => {
        await request(app)
            .delete(`/v1/comments/${fakeCommentId}`)
            .set('Content-Type', 'text/plain')
            .set('Authorization', bearer)
            .expect(404);
    });

    test('should have 401 status for no authorization', async () => {
        await request(app)
            .put(`/v1/comments/${existingCommentId}`)
            .set('Content-Type', 'text/plain')
            .expect(401);
    });

    describe('should delete comment', async () => {
        await request(app)
            .put(`/v1/comments/${exitingThreadId}/4321`)
            .set('Content-Type', 'text/plain')
            .set('Authorization', bearer)
            .expect(200);
    });
});
