import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('rsvps', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('event_id').notNullable();
    table.uuid('user_id').notNullable();
    table.enum('response', ['YES', 'NO', 'MAYBE']).notNullable();
    table.timestamps(true, true);

    table.foreign('event_id').references('id').inTable('events').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    table.unique(['event_id', 'user_id']);
  });

  await knex.schema.raw('CREATE INDEX idx_rsvps_event_id ON rsvps(event_id)');
  await knex.schema.raw('CREATE INDEX idx_rsvps_user_id ON rsvps(user_id)');
  await knex.schema.raw('CREATE INDEX idx_rsvps_response ON rsvps(response)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('rsvps');
}
