import { Router } from 'express';
import * as eventController from './controller.js';
import { authenticate } from '../../middleware/auth.js';
import { eventCreationRateLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.get('/', eventController.list);
router.get('/:id', eventController.getById);
router.post('/', authenticate, eventCreationRateLimiter, eventController.create);
router.patch('/:id', authenticate, eventController.update);
router.delete('/:id', authenticate, eventController.remove);

export default router;
