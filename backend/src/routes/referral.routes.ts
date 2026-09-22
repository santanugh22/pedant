import { Router } from 'express';
import * as refController from '../controllers/referral.controller';
import { requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { redeemReferralSchema } from '../validators/competition.validator';

const router = Router();

router.get('/me/referral', requireAuth, refController.getMyReferral);
router.post('/redeem', requireAuth, validate(redeemReferralSchema), refController.redeemReferral);

export default router;
