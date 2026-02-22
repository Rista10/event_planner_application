import { Router } from 'express';
import * as authController from './controller.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// Public auth routes
router.post('/signup', authRateLimiter, authController.signup);
router.post('/login', authRateLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Email verification
router.post('/verify-email', authRateLimiter, authController.verifyEmail);
router.post('/resend-verification', authRateLimiter, authController.resendVerificationEmail);

// Password reset
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, authController.resetPassword);

// Two-factor authentication
router.post('/verify-2fa', authRateLimiter, authController.verifyTwoFactor);
router.post('/2fa', authenticate, authController.enableTwoFactor);

export default router;
