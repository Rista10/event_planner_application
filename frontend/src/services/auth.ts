import api from './api';
import type { ApiSuccessResponse } from '../types/api';
import type {
  AuthResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  MessageResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  Verify2FARequest,
  Toggle2FARequest,
} from '../types/auth';

export async function loginApi(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<ApiSuccessResponse<LoginResponse>>('/auth/login', data);
  return response.data.data;
}

export async function signupApi(data: SignupRequest): Promise<AuthResponse> {
  const response = await api.post<ApiSuccessResponse<AuthResponse>>('/auth/signup', data);
  return response.data.data;
}

export async function refreshTokenApi(): Promise<AuthResponse> {
  const response = await api.post<ApiSuccessResponse<AuthResponse>>('/auth/refresh');
  return response.data.data;
}

export async function logoutApi(): Promise<void> {
  await api.post('/auth/logout');
}

export async function verifyEmailApi(data: VerifyEmailRequest): Promise<MessageResponse> {
  const response = await api.post<ApiSuccessResponse<MessageResponse>>('/auth/verify-email', data);
  return response.data.data;
}

export async function resendVerificationApi(data: ResendVerificationRequest): Promise<MessageResponse> {
  const response = await api.post<ApiSuccessResponse<MessageResponse>>('/auth/resend-verification', data);
  return response.data.data;
}

export async function forgotPasswordApi(data: ForgotPasswordRequest): Promise<MessageResponse> {
  const response = await api.post<ApiSuccessResponse<MessageResponse>>('/auth/forgot-password', data);
  return response.data.data;
}

export async function resetPasswordApi(data: ResetPasswordRequest): Promise<MessageResponse> {
  const response = await api.post<ApiSuccessResponse<MessageResponse>>('/auth/reset-password', data);
  return response.data.data;
}

export async function verify2FAApi(data: Verify2FARequest): Promise<AuthResponse> {
  const response = await api.post<ApiSuccessResponse<AuthResponse>>('/auth/verify-2fa', data);
  return response.data.data;
}

export async function toggle2FAApi(data: Toggle2FARequest): Promise<MessageResponse> {
  const response = await api.post<ApiSuccessResponse<MessageResponse>>('/auth/2fa', data);
  return response.data.data;
}
