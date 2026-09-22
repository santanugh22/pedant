import { Router } from 'express';
import * as compController from '../controllers/competition.controller';
import { requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { verifyPaymentSchema } from '../validators/competition.validator';

const router = Router();

router.post('/verify', requireAuth, validate(verifyPaymentSchema), compController.verifyPayment);

export default router;
