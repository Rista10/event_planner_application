import knex, { Knex } from 'knex';
import { env } from './env.js';

const dbConfig: Knex.Config = {
    client: 'mysql2',
    connection: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
    },
    pool: {
        min: 2,
        max: env.NODE_ENV === 'production' ? 20 : 10,
    },
};

const db = knex(dbConfig);

export default db;
