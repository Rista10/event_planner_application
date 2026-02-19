import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiSuccessResponse } from './shared/types/index.js';
import authRoutes from './modules/auth/routes.js';
import { swaggerSpec } from './config/swagger.js';

const app = express();

// Security middleware (CSP relaxed for Swagger UI at /api-docs)
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                'script-src': ["'self'", "'unsafe-inline'"],
                'style-src': ["'self'", "'unsafe-inline'"],
            },
        },
    })
);
app.use(
    cors({
        origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
        credentials: true,
    })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP request logging
app.use(morgan('combined'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const response: ApiSuccessResponse<{ status: string }> = {
    success: true,
    data: { status: 'ok' },
    error: null,
  };
  res.json(response);
});

// TODO: Mount route modules here
// app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);


// Global error handler (must be last)
app.use(errorHandler);

export default app;
