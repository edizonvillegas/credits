import { Router } from 'express';
import { login, me, register, verifyEmail } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.get('/me', requireAuth, me);

export default router;
