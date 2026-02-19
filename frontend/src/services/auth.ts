import api from './api';
import type { ApiSuccessResponse } from '../types/api';
import type { AuthResponse, LoginRequest, SignupRequest } from '../types/auth';

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<ApiSuccessResponse<AuthResponse>>('/auth/login', data);
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
