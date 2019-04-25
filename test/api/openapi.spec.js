const { promises: fs } = require('fs');
const { resolve } = require('path');
const request = require('supertest');
const SwaggerParser = require('swagger-parser');
const { app } = require('../../app');

const PROJECT_ROOT = resolve(__dirname, '../..');
const API_SCHEMA = resolve(
    PROJECT_ROOT,
    process.env.API_PATH || '../warbler-api/swagger.yaml'
);

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

describe('OpenAPI schema tests', () => {
    /** @type {Map<string, object>} Operation ID -> API Schema */
    let operations = new Map();

    beforeAll(async () => {
        // Throw if the file can't be accessed
        await fs.access(API_SCHEMA);

        const api = await SwaggerParser.dereference(API_SCHEMA);
        operations = new Map(
            Object.entries(api).flatMap(([path, pathInfo]) =>
                Object.entries(pathInfo)
                    .filter(([, methodInfo]) => 'operationId' in methodInfo)
                    .map(([method, methodInfo]) => [
                        methodInfo.operationId,
                        {
                            ...methodInfo,
                            path,
                            method
                        }
                    ])
            )
        );
    });

    function operationTest(operationId, cb) {
        const operation = operations.get(operationId);
        if (!operation) throw new Error(`Invalid operation ${operationId}`);

        function buildPath(params) {
            return Object.entries(params).reduce(
                (path, [param, data]) => path.replace(`{${param}}`, data),
                operation.path
            );
        }

        return describe(`${operation}: ${operation.method.toUpperCase()} ${
            operation.path
        }`, () => cb(operation, buildPath));
    }

    operationTest('getThread', (operation, buildPath) => {
        // TODO mock the existing thread

        test('should have 404 status for unknown thread', async () => {
            await request(app)
                .get(buildPath({ thread_id: fakeThreadId }))
                .expect(404);
        });

        test('should have 200 status for known thread', async () => {
            const res = await request(app)
                .get(buildPath({ thread_id: exitingThreadId }))
                .get(`/v1/comments/${exitingThreadId}`)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(res.body).toBeInstanceOf(Object);
        });

        // TODO test the body
    });
});
