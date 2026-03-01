import { v4 as uuidv4 } from 'uuid';
import db from '../../config/db.js';
import { AuthTokenRow, TokenType } from './types.js';

const TABLE = 'auth_tokens';

export async function create(data: {
  userId: string;
  tokenHash: string;
  type: TokenType;
  expiresAt: Date;
}): Promise<AuthTokenRow> {
  const id = uuidv4();
  await db(TABLE).insert({
    id,
    user_id: data.userId,
    token_hash: data.tokenHash,
    type: data.type,
    expires_at: data.expiresAt,
  });

  const token = await db(TABLE).where('id', id).first<AuthTokenRow>();
  if (!token) {
    throw new Error('Failed to create auth token');
  }
  return token;
}

export async function findByHash(tokenHash: string): Promise<AuthTokenRow | undefined> {
  return db(TABLE).where('token_hash', tokenHash).first<AuthTokenRow>();
}

export async function findValidByHashAndType(
  tokenHash: string,
  type: TokenType,
): Promise<AuthTokenRow | undefined> {
  return db(TABLE)
    .where('token_hash', tokenHash)
    .where('type', type)
    .whereNull('used_at')
    .where('expires_at', '>', new Date())
    .first<AuthTokenRow>();
}

export async function findLatestValidByUserAndType(
  userId: string,
  type: TokenType,
): Promise<AuthTokenRow | undefined> {
  return db(TABLE)
    .where('user_id', userId)
    .where('type', type)
    .whereNull('used_at')
    .where('expires_at', '>', new Date())
    .orderBy('created_at', 'desc')
    .first<AuthTokenRow>();
}

export async function markAsUsed(id: string): Promise<void> {
  await db(TABLE).where('id', id).update({ used_at: new Date() });
}

export async function invalidateAllByUserAndType(userId: string, type: TokenType): Promise<void> {
  await db(TABLE)
    .where('user_id', userId)
    .where('type', type)
    .whereNull('used_at')
    .update({ used_at: new Date() });
}
