export const TokenType = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
  TWO_FACTOR: 'TWO_FACTOR',
} as const;

export type TokenType = (typeof TokenType)[keyof typeof TokenType];

export interface AuthTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  type: TokenType;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

export interface CreateTokenData {
  userId: string;
  type: TokenType;
  expiresInMinutes: number;
}

export interface TokenWithPlaintext {
  token: AuthTokenRow;
  plaintext: string;
}
