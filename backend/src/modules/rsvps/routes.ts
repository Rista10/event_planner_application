import { Router } from 'express';
import * as rsvpController from './controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/event/:eventId', authenticate, rsvpController.createOrUpdate);

router.get('/event/:eventId/me', authenticate, rsvpController.getMyRsvp);

router.get('/event/:eventId/summary', rsvpController.getSummary);

router.get('/event/:eventId', authenticate, rsvpController.getForEvent);

router.delete('/event/:eventId', authenticate, rsvpController.cancel);

export default router;
