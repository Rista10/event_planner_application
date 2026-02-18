import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import logger from '../config/logger.js';
import { ApiErrorResponse } from '../shared/types/index.js'

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.headers['x-request-id'] as string | undefined;

  if (err instanceof AppError) {
    logger.warn({
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      requestId,
      path: req.path,
    });

    const response: ApiErrorResponse = {
      success: false,
      data: null,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    res.status(err.statusCode).json(response);
    return;
  }

  logger.error({
    message: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    requestId,
    path: req.path,
  });

  const response: ApiErrorResponse = {
    success: false,
    data: null,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : err.message,
    },
  };

  res.status(500).json(response);
}
