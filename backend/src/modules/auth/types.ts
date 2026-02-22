export interface SignupRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface VerifyEmailRequestBody {
  token: string;
}

export interface ResendVerificationRequestBody {
  email: string;
}

export interface ForgotPasswordRequestBody {
  email: string;
}

export interface ResetPasswordRequestBody {
  token: string;
  newPassword: string;
}

export interface VerifyTwoFactorRequestBody {
  userId: string;
  otp: string;
}

export interface Enable2FARequestBody {
  enable: boolean;
}

export interface AuthResponseData {
  user: {
    id: string;
    name: string;
    email: string;
    isEmailVerified: boolean;
    twoFactorEnabled: boolean;
  };
  accessToken: string;
}

export interface TwoFactorRequiredResponse {
  requiresTwoFactor: true;
  userId: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password: string;
  is_email_verified: boolean;
  two_factor_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}
