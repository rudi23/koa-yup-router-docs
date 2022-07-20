# koa-yup-router-docs

Generates [OpenApi 3 document](https://swagger.io/specification/#openapi-object) with paths from [koa yup router][koa-yup-router].

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@rudi23/koa-yup-router-docs.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@rudi23/koa-yup-router-docs
[download-image]: https://img.shields.io/npm/dm/@rudi23/koa-yup-router-docs.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/@rudi23/koa-yup-router-docs
[koa-yup-router]: https://github.com/rudi23/koa-yup-router

### Installation

Install using [`npm`][npm-url]:

```bash
npm install @rudi23/koa-yup-router-docs
```

NodeJS `>= 12.0.0.` is required.

### Example

```js
import * as yup from 'yup';
import YupRouter from '@rudi23/koa-yup-router';
import createDocument from '@rudi23/koa-yup-router-docs';

const router = new YupRouter();

router.addRoute({
    method: 'get',
    path: '/user',
    handler: () => {},
});

router.addRoute({
    method: ['post', 'put'],
    path: '/user/:id',
    validate: {
        type: 'json',
        body: yup.object({
            firstName: yup.string().required(),
            lastName: yup.string().required(),
            age: yup.number().required().min(0).max(100),
        }),
        params: yup.object({
            id: yup.number().required(),
        }),
        headers: yup.object({
            custom: yup.string(),
        }),
        output: {
            200: {
                description: 'Success OK',
                body: yup.string().required(),
            },
            201: {
                description: 'Created OK',
                body: {
                    'application/json': yup.object({
                        id: yup.number().required(),
                    }),
                },
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
    handler: () => {},
});

router.addRoute({
    method: 'delete',
    path: '/user/:id',
    validate: {
        type: 'json',
        params: yup.object({
            id: yup.number().required(),
        }),
        headers: yup.object({
            custom: yup.string(),
        }),
    },
    handler: () => {},
});

const openApiDoc = createDocument(router, {
    openapi: '3.0.3',
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
});
```

## LICENSE

[MIT](https://github.com/rudi23/koa-yup-router-docs/blob/master/LICENSE)
