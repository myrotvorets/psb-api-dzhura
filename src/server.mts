import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import knexpkg, { type Knex } from 'knex';
import { Model } from 'objection';
import { installOpenApiValidator } from '@myrotvorets/oav-installer';
import { errorMiddleware, notFoundMiddleware } from '@myrotvorets/express-microservice-middlewares';
import { createServer } from '@myrotvorets/create-server';
import morgan from 'morgan';

import { buildKnexConfig } from './knexfile.mjs';
import { environment } from './lib/environment.mjs';

import searchController from './controllers/search.mjs';
import monitoringController from './controllers/monitoring.mjs';

export async function configureApp(app: express.Express): Promise<void> {
    const env = environment();

    await installOpenApiValidator(
        join(dirname(fileURLToPath(import.meta.url)), 'specs', 'dzhura.yaml'),
        // join(curdir(), 'specs', 'dzhura.yaml'),
        app,
        env.NODE_ENV,
    );

    app.use('/', searchController());
    app.use('/', notFoundMiddleware);
    app.use(errorMiddleware);
}

/* istanbul ignore next */
export function setupApp(): express.Express {
    const app = express();
    app.set('strict routing', true);
    app.set('x-powered-by', false);

    if (process.env.SKIP_REQUEST_LOGGING !== '1') {
        app.use(
            morgan(
                '[PSBAPI-dzhura] :req[X-Request-ID]\t:method\t:url\t:status :res[content-length]\t:date[iso]\t:response-time\t:total-time',
            ),
        );
    }

    return app;
}

/* istanbul ignore next */
function setupKnex(): Knex {
    const knex = knexpkg.default;
    const db = knex(buildKnexConfig());
    Model.knex(db);
    return db;
}

/* istanbul ignore next */
export async function run(): Promise<void> {
    const [env, app, db] = [environment(), setupApp(), setupKnex()];

    app.use('/monitoring', monitoringController(db));

    await configureApp(app);

    (await createServer(app)).listen(env.PORT);
}
