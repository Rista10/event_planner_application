import { z } from 'zod';

// Password validation with clear requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password is too long (max 128 characters)')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  );

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, 'Please enter your name')
    .max(255, 'Name is too long (max 255 characters)')
    .trim(),
  email: z
    .string()
    .min(1, 'Please enter your email address')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long (max 255 characters)')
    .toLowerCase()
    .trim(),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email address')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Please enter your password'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is missing'),
});

export const resendVerificationSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email address')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email address')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is missing'),
  newPassword: passwordSchema,
});

export const verifyTwoFactorSchema = z.object({
  userId: z.string().uuid('Invalid session. Please try logging in again.'),
  otp: z
    .string()
    .length(6, 'Please enter the 6-digit verification code')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
});

export const enable2FASchema = z.object({
  enable: z.boolean({
    error: 'Please specify whether to enable or disable 2FA',
  }),
});
