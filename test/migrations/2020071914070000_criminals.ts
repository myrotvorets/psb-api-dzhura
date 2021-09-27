/* istanbul ignore file */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const exists: boolean = await knex.schema.hasTable('criminals');
    if (!exists) {
        await knex.schema.createTable('criminals', function (table: Knex.CreateTableBuilder): void {
            table.bigIncrements('id').notNullable();
            table.string('slug', 255).notNullable();
            table.string('name', 255).notNullable();
            table.string('nname', 255).notNullable();
            table.string('tname', 255).notNullable();
            table.string('sname', 255).notNullable();
            table.date('dob').notNullable();
            table.string('country', 255).notNullable();
            table.string('address', 4096).notNullable();
            table.string('phone', 1024).notNullable();
            table.text('description').notNullable();
            table.text('comments').notNullable();
            table.boolean('active').notNullable();
            table.dateTime('last_modified');

            table.index(['active', 'last_modified'], 'idx_criminals_active_lm');
            table.index(['last_modified'], 'idx_criminals_last_modified');
            table.index(['country', 'active'], 'idx_criminals_country');
            table.index([knex.raw('address(255)'), 'active'], 'idx_criminals_address');
            table.index(['description'], 'idx_criminals_description', 'FULLTEXT');
            table.index(['sname'], 'idx_criminals_sname', 'FULLTEXT');
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
        throw new Error(`Refusing to run this in ${process.env.NODE_ENV} environment`);
    }

    await knex.schema.dropTableIfExists('criminals');
}
