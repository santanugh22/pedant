import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { signupSchema, loginSchema, refreshSchema } from '../validators/auth.validator';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/signup', authRateLimiter, validate(signupSchema), authController.signup);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.get('/me', requireAuth, authController.getMe);

export default router;
