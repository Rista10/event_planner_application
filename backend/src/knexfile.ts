import dotenv from 'dotenv';
import type { Knex } from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: Record<string, Knex.Config> = {
    development: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'event_user',
            password: process.env.DB_PASSWORD || 'event_password',
            database: process.env.DB_NAME || 'event_planning',
        },
        migrations: {
            directory: path.resolve(__dirname, 'database/migrations'),
            extension: __filename.endsWith('.js') ? 'js' : 'ts',
        },
        seeds: {
            directory: path.resolve(__dirname, 'database/seeds'),
            extension: __filename.endsWith('.js') ? 'js' : 'ts',
        },
        pool: {
            min: 2,
            max: 10,
        },
    },
};

export default config;
