import { Router } from 'express';
import * as authController from './controller.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js'

const router = Router();

router.post('/signup', authRateLimiter, authController.signup);
router.post('/login', authRateLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
