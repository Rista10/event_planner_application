import { Request, Response, NextFunction } from 'express';
import {
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyTwoFactorSchema,
  enable2FASchema,
} from './validation.js';
import * as authService from './service.js';
import { AppError } from '../../middleware/errorHandler.js';
import { ApiSuccessResponse } from '../../shared/types/index.js';
import { AuthResponseData, TwoFactorRequiredResponse } from './types.js';
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

    // Check if 2FA is required
    if ('requiresTwoFactor' in result) {
      const response: ApiSuccessResponse<TwoFactorRequiredResponse> = {
        success: true,
        data: result,
        error: null,
      };
      res.status(200).json(response);
      return;
    }

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

export async function verifyTwoFactor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = verifyTwoFactorSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }

    const result = await authService.verifyTwoFactor(parsed.data.userId, parsed.data.otp);

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

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = verifyEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }

    const result = await authService.verifyEmail(parsed.data.token);

    const response: ApiSuccessResponse<{ message: string }> = {
      success: true,
      data: result,
      error: null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = resendVerificationSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }

    const result = await authService.resendVerificationEmail(parsed.data.email);

    const response: ApiSuccessResponse<{ message: string }> = {
      success: true,
      data: result,
      error: null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }

    const result = await authService.forgotPassword(parsed.data.email);

    const response: ApiSuccessResponse<{ message: string }> = {
      success: true,
      data: result,
      error: null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }

    const result = await authService.resetPassword(parsed.data.token, parsed.data.newPassword);

    const response: ApiSuccessResponse<{ message: string }> = {
      success: true,
      data: result,
      error: null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function enableTwoFactor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = enable2FASchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }

    const userId = req.user!.id;
    const result = await authService.enableTwoFactor(userId, parsed.data.enable);

    const response: ApiSuccessResponse<{ message: string }> = {
      success: true,
      data: result,
      error: null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
