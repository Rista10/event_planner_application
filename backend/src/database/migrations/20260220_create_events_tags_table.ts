import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('event_tags', (table) => {
    table.uuid('event_id').notNullable();
    table.uuid('tag_id').notNullable();

    table.foreign('event_id').references('id').inTable('events').onDelete('CASCADE');
    table.foreign('tag_id').references('id').inTable('tags').onDelete('CASCADE');

    table.primary(['event_id', 'tag_id']);
  });

  await knex.schema.raw('CREATE INDEX idx_event_tags_event_id ON event_tags(event_id)');
  await knex.schema.raw('CREATE INDEX idx_event_tags_tag_id ON event_tags(tag_id)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('event_tags');
}
