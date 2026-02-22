import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
import { AppError } from '../../middleware/errorHandler.js';
import * as tokenRepository from './repository.js';
import { TokenType, AuthTokenRow, CreateTokenData, TokenWithPlaintext } from './types.js';

const OTP_LENGTH = 6;
const TOKEN_BYTE_LENGTH = 32;

function generateSecureToken(): string {
  return crypto.randomBytes(TOKEN_BYTE_LENGTH).toString('hex');
}

function generateOtp(): string {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(OTP_LENGTH);
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
}

function hashTokenSha256(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function hashOtpBcrypt(otp: string): Promise<string> {
  return bcrypt.hash(otp, env.BCRYPT_SALT_ROUNDS);
}

async function verifyOtpBcrypt(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

export async function createToken(data: CreateTokenData): Promise<TokenWithPlaintext> {
  const isOtp = data.type === TokenType.TWO_FACTOR;
  const plaintext = isOtp ? generateOtp() : generateSecureToken();

  // Use SHA-256 for long tokens (can lookup by hash), bcrypt for short OTPs (need slow hash)
  const tokenHash = isOtp
    ? await hashOtpBcrypt(plaintext)
    : hashTokenSha256(plaintext);

  const expiresAt = new Date(Date.now() + data.expiresInMinutes * 60 * 1000);

  // Invalidate any existing tokens of the same type for this user
  await tokenRepository.invalidateAllByUserAndType(data.userId, data.type);

  const token = await tokenRepository.create({
    userId: data.userId,
    tokenHash,
    type: data.type,
    expiresAt,
  });

  return { token, plaintext };
}

export async function verifyToken(
  plaintext: string,
  type: TokenType,
): Promise<AuthTokenRow> {
  if (type === TokenType.TWO_FACTOR) {
    throw new AppError('Use verifyOtpForUser for TWO_FACTOR tokens', 500, 'INTERNAL_ERROR');
  }

  // Hash the incoming token and lookup directly
  const tokenHash = hashTokenSha256(plaintext);
  const token = await tokenRepository.findValidByHashAndType(tokenHash, type);

  if (!token) {
    throw new AppError('Invalid or expired token', 400, 'INVALID_TOKEN');
  }

  return token;
}

export async function verifyOtpForUser(
  userId: string,
  otp: string,
): Promise<AuthTokenRow> {
  const token = await tokenRepository.findLatestValidByUserAndType(
    userId,
    TokenType.TWO_FACTOR,
  );

  if (!token) {
    throw new AppError('Invalid or expired OTP', 400, 'INVALID_OTP');
  }

  const isValid = await verifyOtpBcrypt(otp, token.token_hash);
  if (!isValid) {
    throw new AppError('Invalid or expired OTP', 400, 'INVALID_OTP');
  }

  return token;
}

export async function consumeToken(tokenId: string): Promise<void> {
  await tokenRepository.markAsUsed(tokenId);
}

export async function invalidateUserTokens(userId: string, type: TokenType): Promise<void> {
  await tokenRepository.invalidateAllByUserAndType(userId, type);
}

export { TokenType };
