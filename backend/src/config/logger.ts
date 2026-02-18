import winston from 'winston';
import { env } from './env.js';

const logger = winston.createLogger({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'event-planner-backend' },
    transports: [
        new winston.transports.Console({
            format:
                env.NODE_ENV === 'production'
                    ? winston.format.json()
                    : winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
    ],
});

export default logger;
