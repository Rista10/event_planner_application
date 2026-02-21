import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('events', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.datetime('date_time').notNullable();
    table.string('location', 500).nullable();
    table.boolean('is_public').notNullable().defaultTo(true);
    table.uuid('user_id').notNullable();
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });

  await knex.schema.raw('CREATE INDEX idx_events_user_id ON events(user_id)');
  await knex.schema.raw('CREATE INDEX idx_events_date_time ON events(date_time)');
  await knex.schema.raw('CREATE INDEX idx_events_is_public ON events(is_public)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('events');
}
