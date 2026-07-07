import { Router } from 'express';
import { buyCredits, exportData, getCredits, handleStripeWebhook, saveTemplate } from '../controllers/credits.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getCredits);
router.post('/buy', requireAuth, buyCredits);
router.post('/export', requireAuth, exportData);
router.post('/templates', requireAuth, saveTemplate);
router.post('/stripe/webhook', handleStripeWebhook);

export default router;
