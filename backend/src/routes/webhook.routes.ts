import { Router } from 'express';
import * as compController from '../controllers/competition.controller';

const router = Router();

router.post('/razorpay', compController.handleWebhook);

export default router;
