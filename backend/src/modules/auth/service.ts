import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../../config/env.js';
import { AppError } from '../../middleware/errorHandler.js';
import * as authRepository from './repository.js';
import { AuthResponseData, TokenPayload, SignupRequestBody, LoginRequestBody } from './types.js';

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

  const tokenPayload: TokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    auth: {
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
    },
    refreshToken,
  };
}

export async function login(
  data: LoginRequestBody,
): Promise<{ auth: AuthResponseData; refreshToken: string }> {
  const user = await authRepository.findByEmail(data.email);
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const passwordMatch = await bcrypt.compare(data.password, user.password);
  if (!passwordMatch) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const tokenPayload: TokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    auth: {
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
    },
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
      auth: {
        user: { id: user.id, name: user.name, email: user.email },
        accessToken,
      },
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
}
