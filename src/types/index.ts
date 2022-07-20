import type { ResponsesObject } from 'openapi3-ts';

export type Config = {
    headRoutes: boolean;
    defaultResponses: ResponsesObject;
};
