import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import knexpkg from 'knex';
import { buildKnexConfig } from '../src/knexfile.mjs';

const knex = knexpkg;

(async (): Promise<void> => {
    const { NODE_ENV: env } = process.env;

    if (env !== 'development' && env !== 'test') {
        process.stderr.write(`Refusing to run in "${env}" environment\n`);
        process.exit(1);
    }

    const db = knex(buildKnexConfig());
    if (env === 'test') {
        process.stdout.write('Rolling back all migrations, if any\n');
        await db.migrate.rollback(
            {
                directory: join(dirname(fileURLToPath(import.meta.url)), 'migrations'),
            },
            true,
        );
    }

    process.stdout.write('Creating tables\n');
    await db.migrate.latest({
        directory: join(dirname(fileURLToPath(import.meta.url)), 'migrations'),
    });

    process.stdout.write('DONE\n');

    if (process.env.SEED_TABLES === 'yes') {
        await db.seed.run({
            directory: join(dirname(fileURLToPath(import.meta.url)), 'seeds'),
        });
    }

    await db.destroy();
})().catch((e) => console.error(e));
