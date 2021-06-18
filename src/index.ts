import { isSchemaObject } from 'openapi3-ts';
import yupToOpenapi from '@rudi23/yup-to-openapi';
import type YupRouter from '@rudi23/koa-yup-router';
import type { RouteSpecification, InputType, ValidationSchema } from '@rudi23/koa-yup-router';
import type { OperationObject, ParameterLocation, ParameterObject, PathsObject, OpenAPIObject } from 'openapi3-ts';
import type { Config } from './types';

const defaultConfig: Config = {
    headRoutes: false,
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

function createOperationObject(specs: RouteSpecification): OperationObject {
    const schema: OperationObject = {
        responses: specs.meta?.swagger?.respose || {},
    };

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
        const schema = createOperationObject(specs);

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
