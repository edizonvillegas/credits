import { Router } from 'express';
import { buyCredits, exportData } from '../controllers/credits.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/buy', requireAuth, buyCredits);
router.post('/export', requireAuth, exportData);

export default router;
