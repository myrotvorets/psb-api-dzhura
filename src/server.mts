import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type Express, static as staticMiddleware } from 'express';
import * as knexpkg from 'knex';
import { Model } from 'objection';
import { installOpenApiValidator } from '@myrotvorets/oav-installer';
import { errorMiddleware, notFoundMiddleware } from '@myrotvorets/express-microservice-middlewares';
import { createServer } from '@myrotvorets/create-server';
import morgan from 'morgan';

import { buildKnexConfig } from './knexfile.mjs';
import { environment } from './lib/environment.mjs';

import { searchController } from './controllers/search.mjs';
import { monitoringController } from './controllers/monitoring.mjs';

export async function configureApp(app: Express): Promise<void> {
    const env = environment();

    if (env.NODE_ENV !== 'production') {
        app.use(
            '/specs/',
            staticMiddleware(join(dirname(fileURLToPath(import.meta.url)), 'specs'), {
                acceptRanges: false,
                index: false,
            }),
        );
    }

    await installOpenApiValidator(
        join(dirname(fileURLToPath(import.meta.url)), 'specs', 'dzhura.yaml'),
        app,
        env.NODE_ENV,
    );

    app.use('/', searchController());
    app.use('/', notFoundMiddleware);
    app.use(errorMiddleware);
}

/* c8 ignore start */
export function setupApp(): Express {
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

function setupKnex(): knexpkg.Knex {
    const { knex } = knexpkg.default;
    const db = knex(buildKnexConfig());
    Model.knex(db);
    return db;
}

export async function run(): Promise<void> {
    const [env, app, db] = [environment(), setupApp(), setupKnex()];

    app.use('/monitoring', monitoringController(db));

    await configureApp(app);

    const server = await createServer(app);

    server.on('close', () => {
        db.destroy().catch((e) => console.error('Failed to close database connection', e));
    });

    const finish = (): void => {
        server.close((err) => {
            if (err) {
                console.error('Failed to close server', err);
            } else {
                process.exit(0);
            }
        });
    };

    process.on('SIGTERM', finish);
    process.on('SIGINT', finish);
    process.on('SIGQUIT', finish);

    server.listen(env.PORT);
}
/* c8 ignore end */
