import * as yup from 'yup';
import YupRouter from '@rudi23/koa-yup-router';
import type { OpenAPIObject, PathsObject } from 'openapi3-ts';
import createDocument, { createPaths } from '../src/index.js';

function createSampleRouter(): YupRouter {
    const router = new YupRouter();

    router.addRoute({
        method: 'get',
        path: '/user',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        handler: () => {},
    });
    router.addRoute({
        method: ['head', 'get'],
        path: '/user/:id',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        handler: () => {},
        validate: {
            output: {
                200: {
                    body: yup.object({
                        user: yup.object({
                            id: yup.number().required(),
                            name: yup.string(),
                            surname: yup.string(),
                        }),
                    }),
                },
                404: {
                    description: 'User not found',
                },
            },
        },
    });
    router.addRoute({
        method: ['post', 'put'],
        path: '/user/:id',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        handler: () => {},
        validate: {
            type: 'json',
            body: yup.object({
                name: yup.string().required(),
                surname: yup.string().required(),
                age: yup.number().integer().required().min(0).max(100),
                details: yup.object({
                    hasJob: yup.boolean().required(),
                }),
            }),
            params: yup.object({
                id: yup.number().required(),
            }),
            headers: yup.object({
                Authorization: yup.string().required(),
            }),
            output: {
                200: {
                    description: 'User created/updated',
                    body: yup.object({
                        user: yup.object({
                            id: yup.number().required(),
                        }),
                    }),
                },
                400: {
                    description: 'Bad request',
                    headers: {
                        'X-Rate-Limit-Limit': {
                            schema: yup.number().required(),
                            description: 'The number of allowed requests in the current period',
                        },
                    },
                },
            },
        },
    });
    router.addRoute({
        method: 'delete',
        path: '/user/:id',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        handler: () => {},
        validate: {
            type: 'json',
            params: yup.object({
                id: yup.number().required(),
            }),
            headers: yup.object({
                Authorization: yup.string().required(),
            }),
            output: {
                200: {
                    description: 'Deleted',
                    body: yup.object({
                        id: yup.number().required(),
                    }),
                },
                403: {
                    description: 'Forbidden',
                    body: yup.object({
                        error: yup.string().required(),
                    }),
                },
            },
        },
    });

    return router;
}

describe('koa-yup-router-docs', () => {
    it('should create paths openapi schema object', () => {
        const router = createSampleRouter();
        const output: PathsObject = {
            '/user': {
                get: {
                    responses: {
                        '200': { description: 'OK' },
                        '401': { description: '401 Unauthorized' },
                        '500': {
                            description: 'Internal Server Error',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            error: { type: 'string' },
                                            code: { type: 'string' },
                                        },
                                        required: ['error', 'code'],
                                    },
                                },
                            },
                        },
                        '503': {
                            description: 'Service Unavailable',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: { message: { type: 'string' } },
                                        required: ['message'],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/user/{id}': {
                get: {
                    responses: {
                        '200': {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            user: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'number', format: 'float' },
                                                    name: { type: 'string' },
                                                    surname: { type: 'string' },
                                                },
                                                required: ['id'],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        '401': { description: '401 Unauthorized' },
                        '404': { description: 'User not found' },
                        '500': {
                            description: 'Internal Server Error',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            error: { type: 'string' },
                                            code: { type: 'string' },
                                        },
                                        required: ['error', 'code'],
                                    },
                                },
                            },
                        },
                        '503': {
                            description: 'Service Unavailable',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: { message: { type: 'string' } },
                                        required: ['message'],
                                    },
                                },
                            },
                        },
                    },
                },
                post: {
                    responses: {
                        '200': {
                            description: 'User created/updated',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            user: {
                                                type: 'object',
                                                properties: { id: { type: 'number', format: 'float' } },
                                                required: ['id'],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        '400': {
                            description: 'Bad request',
                            headers: {
                                'X-Rate-Limit-Limit': {
                                    schema: { type: 'number', format: 'float' },
                                    description: 'The number of allowed requests in the current period',
                                },
                            },
                        },
                        '401': { description: '401 Unauthorized' },
                        '500': {
                            description: 'Internal Server Error',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            error: { type: 'string' },
                                            code: { type: 'string' },
                                        },
                                        required: ['error', 'code'],
                                    },
                                },
                            },
                        },
                        '503': {
                            description: 'Service Unavailable',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: { message: { type: 'string' } },
                                        required: ['message'],
                                    },
                                },
                            },
                        },
                    },
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            schema: { type: 'number', format: 'float' },
                            required: true,
                        },
                        {
                            name: 'Authorization',
                            in: 'header',
                            schema: { type: 'string' },
                            required: true,
                        },
                    ],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        surname: { type: 'string' },
                                        age: {
                                            type: 'integer',
                                            format: 'int32',
                                            minimum: 0,
                                            maximum: 100,
                                        },
                                        details: {
                                            type: 'object',
                                            properties: { hasJob: { type: 'boolean' } },
                                            required: ['hasJob'],
                                        },
                                    },
                                    required: ['name', 'surname', 'age'],
                                },
                            },
                        },
                    },
                },
                put: {
                    responses: {
                        '200': {
                            description: 'User created/updated',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            user: {
                                                type: 'object',
                                                properties: { id: { type: 'number', format: 'float' } },
                                                required: ['id'],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        '400': {
                            description: 'Bad request',
                            headers: {
                                'X-Rate-Limit-Limit': {
                                    schema: { type: 'number', format: 'float' },
                                    description: 'The number of allowed requests in the current period',
                                },
                            },
                        },
                        '401': { description: '401 Unauthorized' },
                        '500': {
                            description: 'Internal Server Error',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            error: { type: 'string' },
                                            code: { type: 'string' },
                                        },
                                        required: ['error', 'code'],
                                    },
                                },
                            },
                        },
                        '503': {
                            description: 'Service Unavailable',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: { message: { type: 'string' } },
                                        required: ['message'],
                                    },
                                },
                            },
                        },
                    },
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            schema: { type: 'number', format: 'float' },
                            required: true,
                        },
                        {
                            name: 'Authorization',
                            in: 'header',
                            schema: { type: 'string' },
                            required: true,
                        },
                    ],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        surname: { type: 'string' },
                                        age: {
                                            type: 'integer',
                                            format: 'int32',
                                            minimum: 0,
                                            maximum: 100,
                                        },
                                        details: {
                                            type: 'object',
                                            properties: { hasJob: { type: 'boolean' } },
                                            required: ['hasJob'],
                                        },
                                    },
                                    required: ['name', 'surname', 'age'],
                                },
                            },
                        },
                    },
                },
                delete: {
                    responses: {
                        '200': {
                            description: 'Deleted',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: { id: { type: 'number', format: 'float' } },
                                        required: ['id'],
                                    },
                                },
                            },
                        },
                        '401': { description: '401 Unauthorized' },
                        '403': {
                            description: 'Forbidden',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: { error: { type: 'string' } },
                                        required: ['error'],
                                    },
                                },
                            },
                        },
                        '500': {
                            description: 'Internal Server Error',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            error: { type: 'string' },
                                            code: { type: 'string' },
                                        },
                                        required: ['error', 'code'],
                                    },
                                },
                            },
                        },
                        '503': {
                            description: 'Service Unavailable',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: { message: { type: 'string' } },
                                        required: ['message'],
                                    },
                                },
                            },
                        },
                    },
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            schema: { type: 'number', format: 'float' },
                            required: true,
                        },
                        {
                            name: 'Authorization',
                            in: 'header',
                            schema: { type: 'string' },
                            required: true,
                        },
                    ],
                },
            },
        };

        expect(
            createPaths(router, {
                defaultResponses: {
                    200: {
                        description: 'OK',
                    },
                    401: {
                        description: '401 Unauthorized',
                    },
                    500: {
                        description: 'Internal Server Error',
                        body: yup.object({
                            error: yup.string().required(),
                            code: yup.string().required(),
                        }),
                    },
                    503: {
                        description: 'Service Unavailable',
                        body: yup.object({
                            message: yup.string().required(),
                        }),
                    },
                },
            })
        ).toEqual(output);
    });

    it('should create openapi document', () => {
        const router = createSampleRouter();

        const initialDoc: OpenAPIObject = {
            openapi: '3.0.1',
            info: {
                title: 'Sample API',
                description: 'Sample API',
                version: '1.0.0',
            },
            servers: [
                {
                    url: 'https://www.example.com/api/v1',
                },
            ],
            paths: {},
            components: {
                securitySchemes: {
                    BasicAuth: {
                        type: 'apiKey',
                        name: 'Authorization',
                        in: 'header',
                    },
                },
            },
        };

        const output: OpenAPIObject = {
            openapi: '3.0.1',
            info: { title: 'Sample API', description: 'Sample API', version: '1.0.0' },
            servers: [{ url: 'https://www.example.com/api/v1' }],
            paths: {
                '/user': {
                    get: {
                        responses: {
                            '200': { description: 'OK' },
                            '401': { description: '401 Unauthorized' },
                            '500': {
                                description: 'Internal Server Error',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                error: { type: 'string' },
                                                code: { type: 'string' },
                                            },
                                            required: ['error', 'code'],
                                        },
                                    },
                                },
                            },
                            '503': {
                                description: 'Service Unavailable',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: { message: { type: 'string' } },
                                            required: ['message'],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                '/user/{id}': {
                    get: {
                        responses: {
                            '200': {
                                description: 'OK',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                user: {
                                                    type: 'object',
                                                    properties: {
                                                        id: { type: 'number', format: 'float' },
                                                        name: { type: 'string' },
                                                        surname: { type: 'string' },
                                                    },
                                                    required: ['id'],
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            '401': { description: '401 Unauthorized' },
                            '404': { description: 'User not found' },
                            '500': {
                                description: 'Internal Server Error',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                error: { type: 'string' },
                                                code: { type: 'string' },
                                            },
                                            required: ['error', 'code'],
                                        },
                                    },
                                },
                            },
                            '503': {
                                description: 'Service Unavailable',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: { message: { type: 'string' } },
                                            required: ['message'],
                                        },
                                    },
                                },
                            },
                        },
                    },
                    post: {
                        responses: {
                            '200': {
                                description: 'User created/updated',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                user: {
                                                    type: 'object',
                                                    properties: { id: { type: 'number', format: 'float' } },
                                                    required: ['id'],
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            '400': {
                                description: 'Bad request',
                                headers: {
                                    'X-Rate-Limit-Limit': {
                                        schema: { type: 'number', format: 'float' },
                                        description: 'The number of allowed requests in the current period',
                                    },
                                },
                            },
                            '401': { description: '401 Unauthorized' },
                            '500': {
                                description: 'Internal Server Error',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                error: { type: 'string' },
                                                code: { type: 'string' },
                                            },
                                            required: ['error', 'code'],
                                        },
                                    },
                                },
                            },
                            '503': {
                                description: 'Service Unavailable',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: { message: { type: 'string' } },
                                            required: ['message'],
                                        },
                                    },
                                },
                            },
                        },
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                schema: { type: 'number', format: 'float' },
                                required: true,
                            },
                            {
                                name: 'Authorization',
                                in: 'header',
                                schema: { type: 'string' },
                                required: true,
                            },
                        ],
                        requestBody: {
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            surname: { type: 'string' },
                                            age: {
                                                type: 'integer',
                                                format: 'int32',
                                                minimum: 0,
                                                maximum: 100,
                                            },
                                            details: {
                                                type: 'object',
                                                properties: { hasJob: { type: 'boolean' } },
                                                required: ['hasJob'],
                                            },
                                        },
                                        required: ['name', 'surname', 'age'],
                                    },
                                },
                            },
                        },
                    },
                    put: {
                        responses: {
                            '200': {
                                description: 'User created/updated',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                user: {
                                                    type: 'object',
                                                    properties: { id: { type: 'number', format: 'float' } },
                                                    required: ['id'],
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            '400': {
                                description: 'Bad request',
                                headers: {
                                    'X-Rate-Limit-Limit': {
                                        schema: { type: 'number', format: 'float' },
                                        description: 'The number of allowed requests in the current period',
                                    },
                                },
                            },
                            '401': { description: '401 Unauthorized' },
                            '500': {
                                description: 'Internal Server Error',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                error: { type: 'string' },
                                                code: { type: 'string' },
                                            },
                                            required: ['error', 'code'],
                                        },
                                    },
                                },
                            },
                            '503': {
                                description: 'Service Unavailable',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: { message: { type: 'string' } },
                                            required: ['message'],
                                        },
                                    },
                                },
                            },
                        },
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                schema: { type: 'number', format: 'float' },
                                required: true,
                            },
                            {
                                name: 'Authorization',
                                in: 'header',
                                schema: { type: 'string' },
                                required: true,
                            },
                        ],
                        requestBody: {
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            surname: { type: 'string' },
                                            age: {
                                                type: 'integer',
                                                format: 'int32',
                                                minimum: 0,
                                                maximum: 100,
                                            },
                                            details: {
                                                type: 'object',
                                                properties: { hasJob: { type: 'boolean' } },
                                                required: ['hasJob'],
                                            },
                                        },
                                        required: ['name', 'surname', 'age'],
                                    },
                                },
                            },
                        },
                    },
                    delete: {
                        responses: {
                            '200': {
                                description: 'Deleted',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: { id: { type: 'number', format: 'float' } },
                                            required: ['id'],
                                        },
                                    },
                                },
                            },
                            '401': { description: '401 Unauthorized' },
                            '403': {
                                description: 'Forbidden',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: { error: { type: 'string' } },
                                            required: ['error'],
                                        },
                                    },
                                },
                            },
                            '500': {
                                description: 'Internal Server Error',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                error: { type: 'string' },
                                                code: { type: 'string' },
                                            },
                                            required: ['error', 'code'],
                                        },
                                    },
                                },
                            },
                            '503': {
                                description: 'Service Unavailable',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: { message: { type: 'string' } },
                                            required: ['message'],
                                        },
                                    },
                                },
                            },
                        },
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                schema: { type: 'number', format: 'float' },
                                required: true,
                            },
                            {
                                name: 'Authorization',
                                in: 'header',
                                schema: { type: 'string' },
                                required: true,
                            },
                        ],
                    },
                },
            },
            components: {
                securitySchemes: {
                    BasicAuth: { type: 'apiKey', name: 'Authorization', in: 'header' },
                },
            },
        };

        expect(
            createDocument(router, initialDoc, {
                defaultResponses: {
                    200: {
                        description: 'OK',
                    },
                    401: {
                        description: '401 Unauthorized',
                    },
                    500: {
                        description: 'Internal Server Error',
                        body: yup.object({
                            error: yup.string().required(),
                            code: yup.string().required(),
                        }),
                    },
                    503: {
                        description: 'Service Unavailable',
                        body: yup.object({
                            message: yup.string().required(),
                        }),
                    },
                },
            })
        ).toEqual(output);
    });
});
