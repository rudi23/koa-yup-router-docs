import { isSchemaObject } from 'openapi3-ts';
import { isSchema } from 'yup';
import yupToOpenapi from '@rudi23/yup-to-openapi';
import type YupRouter from '@rudi23/koa-yup-router';
import type { RouteSpecification, InputType, ValidationSchema } from '@rudi23/koa-yup-router';
import type {
    OperationObject,
    ParameterLocation,
    ParameterObject,
    PathsObject,
    OpenAPIObject,
    ContentObject,
    HeadersObject,
    ResponsesObject,
} from 'openapi3-ts';
import type { OutputSchema } from '@rudi23/koa-yup-router/@type/types/index.js';
import type { Config } from './types';

const defaultConfig: Config = {
    headRoutes: false,
    defaultResponses: {
        200: {
            description: 'OK',
        },
        400: {
            description: 'Bad request',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
};

function getParameters(yupSchema: ValidationSchema, inPath: ParameterLocation): ParameterObject[] {
    const schemaObj = yupToOpenapi(yupSchema);

    return Object.entries(schemaObj.properties || {}).map(([name, props]) => {
        if (isSchemaObject(props)) {
            const { description, title, ...restProps } = props;

            const fieldSchema: ParameterObject = {
                name,
                in: inPath,
                schema: restProps,
                required: schemaObj.required?.includes(name),
            };

            if (title) {
                fieldSchema.title = title;
            }
            if (description) {
                fieldSchema.description = description;
            }

            return fieldSchema;
        }

        return {
            name,
            in: inPath,
            schema: {
                $ref: props.$ref,
            },
        };
    });
}

function getMediaType(input: InputType | undefined): string {
    switch (input) {
        case 'json':
            return 'application/json';
        case 'form':
            return 'application/x-www-form-urlencoded';
        case 'multipart':
            return 'multipart/form-data';
        default:
            return '*/*';
    }
}

function getResponseContent(outputBodySchema: OutputSchema['body']): ContentObject | undefined {
    if (!outputBodySchema) {
        return undefined;
    }

    if (isSchema(outputBodySchema)) {
        return {
            'application/json': {
                schema: yupToOpenapi(outputBodySchema),
            },
        };
    }

    return Object.entries(outputBodySchema).reduce((aggSchema, [contentType, schema]) => {
        if (isSchema(schema)) {
            return {
                ...aggSchema,
                [contentType]: { schema: yupToOpenapi(schema) },
            };
        }

        return aggSchema;
    }, {} as ContentObject);
}

function getResponseHeaders(outputHeadersSchema: OutputSchema['headers']): HeadersObject | undefined {
    if (!outputHeadersSchema) {
        return undefined;
    }

    return Object.entries(outputHeadersSchema).reduce((aggSchema, [contentType, schema]) => {
        if (isSchema(schema.schema)) {
            return {
                ...aggSchema,
                [contentType]: { schema: yupToOpenapi(schema.schema), description: schema.description },
            };
        }

        return aggSchema;
    }, {} as HeadersObject);
}

function getResponse(specs: RouteSpecification, config: Config): ResponsesObject {
    if (specs.meta?.swagger?.response) {
        return specs.meta.swagger.response as ResponsesObject;
    }

    if (specs.validate.output) {
        const responses = { ...config.defaultResponses };
        Object.keys(specs.validate.output).forEach((codes) => {
            // 200,206,300
            const respCodes = codes.toString().split(',');
            respCodes.forEach((unformattedCode) => {
                // 200-299
                const code = (unformattedCode.includes('-') ? unformattedCode.split('-')[0] : unformattedCode).trim();

                const spec = specs.validate.output?.[codes];
                if (!spec) {
                    return;
                }

                const { body, headers, description } = spec;
                const responseDescription = description || config.defaultResponses?.[code]?.description;
                const responseContent = getResponseContent(body);
                const responseHeaders = getResponseHeaders(headers);

                if (config.defaultResponses[code]) {
                    responses[code] = config.defaultResponses[code];
                }
                if (!responses[code]) {
                    responses[code] = {};
                }
                if (responseDescription) {
                    responses[code].description = responseDescription;
                }
                if (responseContent) {
                    responses[code].content = responseContent;
                }
                if (responseHeaders) {
                    responses[code].headers = responseHeaders;
                }
            });
        });

        return responses;
    }

    return {};
}

function createOperationObject(specs: RouteSpecification, config: Config): OperationObject {
    const schema: OperationObject = {
        responses: {},
    };

    if (specs.validate.output) {
        schema.responses = getResponse(specs, config);
    }

    let parameters: ParameterObject[] = [];
    if (specs.validate.params) {
        parameters = [...parameters, ...getParameters(specs.validate.params, 'path')];
    }
    if (specs.validate.query) {
        parameters = [...parameters, ...getParameters(specs.validate.query, 'query')];
    }
    if (specs.validate.headers) {
        parameters = [...parameters, ...getParameters(specs.validate.headers, 'header')];
    }
    if (parameters.length > 0) {
        schema.parameters = parameters;
    }

    if (specs.meta?.swagger?.summary) {
        schema.summary = specs.meta?.swagger?.summary;
    }
    if (specs.meta?.swagger?.description) {
        schema.description = specs.meta?.swagger?.description;
    }
    if (specs.meta?.swagger?.deprecated) {
        schema.deprecated = specs.meta?.swagger?.deprecated;
    }
    if (specs.meta?.swagger?.tags) {
        schema.tags = specs.meta?.swagger?.tags;
    }
    if (specs.meta?.swagger?.security) {
        schema.security = specs.meta?.swagger?.security;
    }
    if (specs.validate.body) {
        const mediaType = getMediaType(specs.validate.type);
        schema.requestBody = {
            content: {
                [mediaType]: {
                    schema: yupToOpenapi(specs.validate.body),
                },
            },
        };
    }

    return schema;
}

function processRoute(route: YupRouter, config: Config): PathsObject {
    return route.routeSpecs.reduce((aggPs, specs, index) => {
        const layer = route.router.stack[index];
        const path = layer.path.replace(/:(\w+)/g, '{$1}');
        const schema = createOperationObject(specs, config);

        layer.methods
            .map((m) => m.toLowerCase())
            .filter((m) => !config.headRoutes && m !== 'head')
            .forEach((method) => {
                // eslint-disable-next-line no-param-reassign
                aggPs[path] = {
                    ...aggPs[path],
                    [method]: schema,
                };
            });

        return aggPs;
    }, {} as PathsObject);
}

export function createPaths(router: YupRouter | YupRouter[], config: Partial<Config> = {}): PathsObject {
    const mergedConfig = { ...config, ...defaultConfig };
    const routes = !Array.isArray(router) ? [router] : router;

    return routes.reduce(
        (aggRoutes, route) => ({
            ...aggRoutes,
            ...processRoute(route, mergedConfig),
        }),
        {} as PathsObject
    );
}

export default function createDocument(
    router: YupRouter | YupRouter[],
    initialDoc: OpenAPIObject,
    config: Partial<Config> = {}
): OpenAPIObject {
    const paths = createPaths(router, config);

    return {
        ...initialDoc,
        paths: { ...initialDoc.paths, ...paths },
    };
}

export * from './types';
export * from 'openapi3-ts';
