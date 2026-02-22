import { z } from 'zod';

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be at most 255 characters'),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be at most 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
  token: z
    .string()
    .min(1, 'Token is required'),
});

export const resendVerificationSchema = z.object({
  email: z
    .string()
    .email('Invalid email format'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

export const verifyTwoFactorSchema = z.object({
  userId: z
    .string()
    .uuid('Invalid user ID'),
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export const enable2FASchema = z.object({
  enable: z.boolean(),
});
