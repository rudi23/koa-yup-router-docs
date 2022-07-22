import type { ValidateConfig } from '@rudi23/koa-yup-router';

export type Config = {
    headRoutes: boolean;
    defaultResponses: ValidateConfig['output'];
};
