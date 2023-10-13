import * as knexpkg from 'knex';
import { buildKnexConfig } from '../src/knexfile.mjs';

try {
    const { knex } = knexpkg.default;
    const { NODE_ENV: env } = process.env;

    if (env !== 'development' && env !== 'test') {
        process.stderr.write(`Refusing to run in "${env}" environment\n`);
        process.exit(1);
    }

    const db = knex(buildKnexConfig());
    if (env === 'test') {
        process.stdout.write('Rolling back all migrations, if any\n');
        await db.migrate.rollback(undefined, true);
    }

    process.stdout.write('Creating tables\n');
    await db.migrate.latest();

    if (process.env['SEED_TABLES'] === 'yes') {
        process.stdout.write('Populating tables\n');
        await db.seed.run();
    }

    process.stdout.write('DONE\n');
    await db.destroy();
} catch (e) {
    console.error(e);
    process.exit(1);
}
