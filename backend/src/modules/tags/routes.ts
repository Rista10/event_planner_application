import { Router } from 'express';
import * as tagController from './controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/', tagController.getAll);
router.post('/', authenticate, tagController.create);
router.delete('/:id', authenticate, tagController.remove);

export default router;
