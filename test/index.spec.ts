import * as yup from 'yup';
import YupRouter from '@rudi23/koa-yup-router';
import type { OpenAPIObject, PathsObject } from 'openapi3-ts';
import createDocument, { createPaths } from '@src/index';

function createSampleRouter(): YupRouter {
    const router = new YupRouter();

    router.addRoute({
        method: 'get',
        path: '/user',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        handler: () => {},
    });
    router.addRoute({
        method: ['post', 'put'],
        path: '/path/:id',
        validate: {
            type: 'json',
            body: yup.object({
                number: yup.number().required().min(0).max(100),
                string: yup.string().required(),
                object: yup.object({
                    bool: yup.boolean().required(),
                }),
            }),
            params: yup.object({
                id: yup.number().required(),
            }),
            headers: yup.object({
                custom: yup.string().required(),
            }),
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        handler: () => {},
    });
    router.addRoute({
        method: 'delete',
        path: '/path/:id',
        validate: {
            type: 'json',
            params: yup.object({
                id: yup.number().required(),
            }),
            headers: yup.object({
                custom: yup.string().required(),
            }),
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        handler: () => {},
    });

    return router;
}

describe('koa-yup-router-docs', () => {
    it('should create paths openapi schema object', () => {
        const router = createSampleRouter();
        const output: PathsObject = {
            '/path/{id}': {
                'delete': {
                    'parameters': [
                        {
                            'in': 'path',
                            'name': 'id',
                            'required': true,
                            'schema': {
                                'format': 'float',
                                'type': 'number',
                            },
                        },
                        {
                            'in': 'header',
                            'name': 'custom',
                            'required': true,
                            'schema': {
                                'type': 'string',
                            },
                        },
                    ],
                    'responses': {},
                },
                'post': {
                    'parameters': [
                        {
                            'in': 'path',
                            'name': 'id',
                            'required': true,
                            'schema': {
                                'format': 'float',
                                'type': 'number',
                            },
                        },
                        {
                            'in': 'header',
                            'name': 'custom',
                            'required': true,
                            'schema': {
                                'type': 'string',
                            },
                        },
                    ],
                    'requestBody': {
                        'content': {
                            'application/json': {
                                'schema': {
                                    'properties': {
                                        'number': {
                                            'format': 'float',
                                            'maximum': 100,
                                            'minimum': 0,
                                            'type': 'number',
                                        },
                                        'object': {
                                            'properties': {
                                                'bool': {
                                                    'type': 'boolean',
                                                },
                                            },
                                            'required': ['bool'],
                                            'type': 'object',
                                        },
                                        'string': {
                                            'type': 'string',
                                        },
                                    },
                                    'required': ['number', 'string'],
                                    'type': 'object',
                                },
                            },
                        },
                    },
                    'responses': {},
                },
                'put': {
                    'parameters': [
                        {
                            'in': 'path',
                            'name': 'id',
                            'required': true,
                            'schema': {
                                'format': 'float',
                                'type': 'number',
                            },
                        },
                        {
                            'in': 'header',
                            'name': 'custom',
                            'required': true,
                            'schema': {
                                'type': 'string',
                            },
                        },
                    ],
                    'requestBody': {
                        'content': {
                            'application/json': {
                                'schema': {
                                    'properties': {
                                        'number': {
                                            'format': 'float',
                                            'maximum': 100,
                                            'minimum': 0,
                                            'type': 'number',
                                        },
                                        'object': {
                                            'properties': {
                                                'bool': {
                                                    'type': 'boolean',
                                                },
                                            },
                                            'required': ['bool'],
                                            'type': 'object',
                                        },
                                        'string': {
                                            'type': 'string',
                                        },
                                    },
                                    'required': ['number', 'string'],
                                    'type': 'object',
                                },
                            },
                        },
                    },
                    'responses': {},
                },
            },
            '/user': {
                'get': {
                    'responses': {},
                },
            },
        };

        expect(createPaths(router)).toEqual(output);
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
            'components': {
                'securitySchemes': {
                    'BasicAuth': {
                        'in': 'header',
                        'name': 'Authorization',
                        'type': 'apiKey',
                    },
                },
            },
            'info': {
                'description': 'Sample API',
                'title': 'Sample API',
                'version': '1.0.0',
            },
            'openapi': '3.0.1',
            'paths': {
                '/path/{id}': {
                    'delete': {
                        'parameters': [
                            {
                                'in': 'path',
                                'name': 'id',
                                'required': true,
                                'schema': {
                                    'format': 'float',
                                    'type': 'number',
                                },
                            },
                            {
                                'in': 'header',
                                'name': 'custom',
                                'required': true,
                                'schema': {
                                    'type': 'string',
                                },
                            },
                        ],
                        'responses': {},
                    },
                    'post': {
                        'parameters': [
                            {
                                'in': 'path',
                                'name': 'id',
                                'required': true,
                                'schema': {
                                    'format': 'float',
                                    'type': 'number',
                                },
                            },
                            {
                                'in': 'header',
                                'name': 'custom',
                                'required': true,
                                'schema': {
                                    'type': 'string',
                                },
                            },
                        ],
                        'requestBody': {
                            'content': {
                                'application/json': {
                                    'schema': {
                                        'properties': {
                                            'number': {
                                                'format': 'float',
                                                'maximum': 100,
                                                'minimum': 0,
                                                'type': 'number',
                                            },
                                            'object': {
                                                'properties': {
                                                    'bool': {
                                                        'type': 'boolean',
                                                    },
                                                },
                                                'required': ['bool'],
                                                'type': 'object',
                                            },
                                            'string': {
                                                'type': 'string',
                                            },
                                        },
                                        'required': ['number', 'string'],
                                        'type': 'object',
                                    },
                                },
                            },
                        },
                        'responses': {},
                    },
                    'put': {
                        'parameters': [
                            {
                                'in': 'path',
                                'name': 'id',
                                'required': true,
                                'schema': {
                                    'format': 'float',
                                    'type': 'number',
                                },
                            },
                            {
                                'in': 'header',
                                'name': 'custom',
                                'required': true,
                                'schema': {
                                    'type': 'string',
                                },
                            },
                        ],
                        'requestBody': {
                            'content': {
                                'application/json': {
                                    'schema': {
                                        'properties': {
                                            'number': {
                                                'format': 'float',
                                                'maximum': 100,
                                                'minimum': 0,
                                                'type': 'number',
                                            },
                                            'object': {
                                                'properties': {
                                                    'bool': {
                                                        'type': 'boolean',
                                                    },
                                                },
                                                'required': ['bool'],
                                                'type': 'object',
                                            },
                                            'string': {
                                                'type': 'string',
                                            },
                                        },
                                        'required': ['number', 'string'],
                                        'type': 'object',
                                    },
                                },
                            },
                        },
                        'responses': {},
                    },
                },
                '/user': {
                    'get': {
                        'responses': {},
                    },
                },
            },
            'servers': [
                {
                    'url': 'https://www.example.com/api/v1',
                },
            ],
        };

        expect(createDocument(router, initialDoc)).toEqual(output);
    });
});
