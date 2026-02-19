import { Request, Response, NextFunction } from 'express';
import { signupSchema, loginSchema } from './validation.js';
import * as authService from './service.js';
import { AppError } from '../../middleware/errorHandler.js';
import { ApiSuccessResponse } from '../../shared/types/index.js';
import { AuthResponseData } from './types.js';
import { env } from '../../config/env.js';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }

    const result = await authService.signup(parsed.data);

    setRefreshTokenCookie(res, result.refreshToken);

    const response: ApiSuccessResponse<AuthResponseData> = {
      success: true,
      data: result.auth,
      error: null,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }

    const result = await authService.login(parsed.data);

    setRefreshTokenCookie(res, result.refreshToken);

    const response: ApiSuccessResponse<AuthResponseData> = {
      success: true,
      data: result.auth,
      error: null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies[REFRESH_TOKEN_COOKIE] as string | undefined;
    if (!token) {
      throw new AppError('Refresh token not found', 401, 'NO_REFRESH_TOKEN');
    }

    const result = await authService.refreshAccessToken(token);

    setRefreshTokenCookie(res, result.refreshToken);

    const response: ApiSuccessResponse<AuthResponseData> = {
      success: true,
      data: result.auth,
      error: null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    const response: ApiSuccessResponse<{ message: string }> = {
      success: true,
      data: { message: 'Logged out successfully' },
      error: null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
