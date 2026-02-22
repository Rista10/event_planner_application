import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../../config/env.js';
import { AppError } from '../../middleware/errorHandler.js';
import * as authRepository from './repository.js';
import * as tokenService from '../token/service.js';
import * as emailService from '../email/service.js';
import { TokenType } from '../token/types.js';
import {
  AuthResponseData,
  TokenPayload,
  SignupRequestBody,
  LoginRequestBody,
  TwoFactorRequiredResponse,
  UserRow,
} from './types.js';

function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as StringValue,
  });
}

function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as StringValue,
  });
}

function buildAuthResponse(user: UserRow, accessToken: string): AuthResponseData {
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.is_email_verified,
      twoFactorEnabled: user.two_factor_enabled,
    },
    accessToken,
  };
}

export async function signup(
  data: SignupRequestBody,
): Promise<{ auth: AuthResponseData; refreshToken: string }> {
  const existing = await authRepository.findByEmail(data.email);
  if (existing) {
    throw new AppError('Email already in use', 409, 'EMAIL_ALREADY_EXISTS');
  }

  const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);

  const user = await authRepository.createUser({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  // Create email verification token and send email
  const { plaintext: verificationToken } = await tokenService.createToken({
    userId: user.id,
    type: TokenType.EMAIL_VERIFICATION,
    expiresInMinutes: env.EMAIL_VERIFICATION_EXPIRY_MINUTES,
  });

  await emailService.sendVerificationEmail(user.email, user.name, verificationToken);

  const tokenPayload: TokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    auth: buildAuthResponse(user, accessToken),
    refreshToken,
  };
}

export async function login(
  data: LoginRequestBody,
): Promise<{ auth: AuthResponseData; refreshToken: string } | TwoFactorRequiredResponse> {
  const user = await authRepository.findByEmail(data.email);
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const passwordMatch = await bcrypt.compare(data.password, user.password);
  if (!passwordMatch) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Check if 2FA is enabled
  if (user.two_factor_enabled) {
    const { plaintext: otp } = await tokenService.createToken({
      userId: user.id,
      type: TokenType.TWO_FACTOR,
      expiresInMinutes: env.TWO_FACTOR_EXPIRY_MINUTES,
    });

    await emailService.sendTwoFactorOtpEmail(user.email, user.name, otp);

    return {
      requiresTwoFactor: true,
      userId: user.id,
    };
  }

  const tokenPayload: TokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    auth: buildAuthResponse(user, accessToken),
    refreshToken,
  };
}

export async function verifyTwoFactor(
  userId: string,
  otp: string,
): Promise<{ auth: AuthResponseData; refreshToken: string }> {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const token = await tokenService.verifyOtpForUser(userId, otp);
  await tokenService.consumeToken(token.id);

  const tokenPayload: TokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    auth: buildAuthResponse(user, accessToken),
    refreshToken,
  };
}

export async function refreshAccessToken(
  token: string,
): Promise<{ auth: AuthResponseData; refreshToken: string }> {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;

    const user = await authRepository.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 401, 'INVALID_TOKEN');
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    return {
      auth: buildAuthResponse(user, accessToken),
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const authToken = await tokenService.verifyToken(token, TokenType.EMAIL_VERIFICATION);

  const user = await authRepository.findById(authToken.user_id);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (user.is_email_verified) {
    throw new AppError('Email is already verified', 400, 'EMAIL_ALREADY_VERIFIED');
  }

  await tokenService.consumeToken(authToken.id);
  await authRepository.updateEmailVerified(authToken.user_id, true);

  return { message: 'Email verified successfully' };
}

export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    // Don't reveal if email exists
    return { message: 'If the email exists, a verification link has been sent' };
  }

  if (user.is_email_verified) {
    throw new AppError('Email is already verified', 400, 'EMAIL_ALREADY_VERIFIED');
  }

  const { plaintext: verificationToken } = await tokenService.createToken({
    userId: user.id,
    type: TokenType.EMAIL_VERIFICATION,
    expiresInMinutes: env.EMAIL_VERIFICATION_EXPIRY_MINUTES,
  });

  await emailService.sendVerificationEmail(user.email, user.name, verificationToken);

  return { message: 'If the email exists, a verification link has been sent' };
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    // Don't reveal if email exists
    return { message: 'If the email exists, a password reset link has been sent' };
  }

  const { plaintext: resetToken } = await tokenService.createToken({
    userId: user.id,
    type: TokenType.PASSWORD_RESET,
    expiresInMinutes: env.PASSWORD_RESET_EXPIRY_MINUTES,
  });

  await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

  return { message: 'If the email exists, a password reset link has been sent' };
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  const authToken = await tokenService.verifyToken(token, TokenType.PASSWORD_RESET);

  const user = await authRepository.findById(authToken.user_id);
  if (!user) {
    throw new AppError('Invalid or expired token', 400, 'INVALID_TOKEN');
  }

  await tokenService.consumeToken(authToken.id);

  const hashedPassword = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
  await authRepository.updatePassword(authToken.user_id, hashedPassword);

  return { message: 'Password reset successfully' };
}

export async function enableTwoFactor(
  userId: string,
  enable: boolean,
): Promise<{ message: string }> {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  await authRepository.updateTwoFactorEnabled(userId, enable);

  return {
    message: enable
      ? 'Two-factor authentication enabled'
      : 'Two-factor authentication disabled',
  };
}
