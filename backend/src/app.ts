import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiSuccessResponse } from './shared/types/index.js';

const app = express();

// Security middleware
app.use(helmet());
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
// app.use('/api/auth', authRoutes);
// app.use('/api/events', eventRoutes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
