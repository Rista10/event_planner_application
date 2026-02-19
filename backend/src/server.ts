import app from './app.js';
import { env } from './config/env.js';
import db from './config/db.js';
import logger from './config/logger.js';

async function startServer(): Promise<void> {
    try {
        // Verify database connection
        await db.raw('SELECT 1');
        logger.info({ message: 'Database connection established' });

        app.listen(env.PORT, () => {
            logger.info({
                message: `Server running on port ${env.PORT}`,
                environment: env.NODE_ENV,
            });
        });
    } catch (error) {
        const errMsg =
            error instanceof Error ? error.message : typeof error === 'object' ? JSON.stringify(error) : String(error);
        const errStack = error instanceof Error ? error.stack : undefined;
        logger.error({
            message: 'Failed to start server',
            error: errMsg || 'Unknown error',
            stack: errStack,
        });
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
