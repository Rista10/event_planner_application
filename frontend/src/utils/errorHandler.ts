import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api';


const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  INVALID_CREDENTIALS: 'The email or password you entered is incorrect.',
  USER_NOT_FOUND: 'No account found with this email address.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  INVALID_TOKEN: 'This link has expired or is invalid. Please request a new one.',
  TOKEN_EXPIRED: 'This link has expired. Please request a new one.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: "You don't have permission to perform this action.",

  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
  REQUIRED_FIELD: 'This field is required.',

  // 2FA errors
  INVALID_OTP: 'The verification code is incorrect. Please try again.',
  OTP_EXPIRED: 'The verification code has expired. Please request a new one.',
  TWO_FACTOR_REQUIRED: 'Please enter your verification code.',

  // Email verification
  EMAIL_NOT_VERIFIED: 'Please verify your email address before continuing.',
  EMAIL_ALREADY_VERIFIED: 'Your email is already verified.',

  // Event errors
  EVENT_NOT_FOUND: 'This event could not be found.',
  NOT_EVENT_OWNER: "You don't have permission to modify this event.",

  // RSVP errors
  RSVP_NOT_FOUND: 'RSVP not found.',
  ALREADY_RSVPED: "You've already responded to this event.",

  // Server errors
  INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again later.',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again later.',
  INVALID_JSON: 'There was a problem with your request. Please try again.',

  // Network errors
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  TIMEOUT: 'The request timed out. Please try again.',

  // Rate limiting
  TOO_MANY_REQUESTS: 'Too many attempts. Please wait a moment and try again.',
};

const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.';

export function parseApiError(error: unknown): {
  code: string;
  message: string;
  isNetworkError: boolean;
} {
  if (error instanceof AxiosError) {
    // Network error (no response received)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return {
          code: 'TIMEOUT',
          message: ERROR_MESSAGES.TIMEOUT,
          isNetworkError: true,
        };
      }
      return {
        code: 'NETWORK_ERROR',
        message: ERROR_MESSAGES.NETWORK_ERROR,
        isNetworkError: true,
      };
    }

    // Rate limiting
    if (error.response.status === 429) {
      return {
        code: 'TOO_MANY_REQUESTS',
        message: ERROR_MESSAGES.TOO_MANY_REQUESTS,
        isNetworkError: false,
      };
    }

    // API error response
    const apiError = error.response.data as ApiErrorResponse;
    if (apiError?.error) {
      const code = apiError.error.code;
      // Use API message if it's user-friendly, otherwise use our mapping
      const message = ERROR_MESSAGES[code] || apiError.error.message || DEFAULT_ERROR_MESSAGE;
      return {
        code,
        message,
        isNetworkError: false,
      };
    }

    // HTTP status-based fallback
    const statusMessages: Record<number, { code: string; message: string }> = {
      400: { code: 'BAD_REQUEST', message: 'Invalid request. Please check your input.' },
      401: { code: 'UNAUTHORIZED', message: ERROR_MESSAGES.UNAUTHORIZED },
      403: { code: 'FORBIDDEN', message: ERROR_MESSAGES.FORBIDDEN },
      404: { code: 'NOT_FOUND', message: 'The requested resource was not found.' },
      500: { code: 'INTERNAL_SERVER_ERROR', message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      502: { code: 'BAD_GATEWAY', message: ERROR_MESSAGES.SERVICE_UNAVAILABLE },
      503: { code: 'SERVICE_UNAVAILABLE', message: ERROR_MESSAGES.SERVICE_UNAVAILABLE },
    };

    const statusError = statusMessages[error.response.status];
    if (statusError) {
      return { ...statusError, isNetworkError: false };
    }
  }

  // Generic error fallback
  return {
    code: 'UNKNOWN_ERROR',
    message: DEFAULT_ERROR_MESSAGE,
    isNetworkError: false,
  };
}

export function handleApiError(error: unknown, fallbackMessage?: string): string {
  const { message } = parseApiError(error);
  return message || fallbackMessage || DEFAULT_ERROR_MESSAGE;
}
