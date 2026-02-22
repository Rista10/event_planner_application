import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('auth_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('user_id').notNullable();
    table.string('token_hash', 255).notNullable();
    table.enum('type', ['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'TWO_FACTOR']).notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('used_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });

  await knex.schema.raw('CREATE INDEX idx_auth_tokens_token_hash ON auth_tokens(token_hash)');
  await knex.schema.raw('CREATE INDEX idx_auth_tokens_user_type ON auth_tokens(user_id, type)');
  await knex.schema.raw('CREATE INDEX idx_auth_tokens_expires_at ON auth_tokens(expires_at)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('auth_tokens');
}
