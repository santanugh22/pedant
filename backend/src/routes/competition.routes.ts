import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as compController from '../controllers/competition.controller';
import * as subController from '../controllers/submission.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  competitionQuerySchema,
  createCompetitionSchema,
  presignSubmissionSchema,
  createSubmissionSchema,
} from '../validators/competition.validator';
import { registrationRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Configure local multer storage for fallback/turnkey submission uploads
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB limit
});

// Platform overview statistics (for Home screen)
router.get('/stats/overview', compController.getOverviewStats);

// Competitions list & create
router.get('/', optionalAuth, validate(competitionQuerySchema, 'query'), compController.listCompetitions);
router.post('/', validate(createCompetitionSchema), compController.createCompetition);

// Competition details & sub-resources
router.get('/:id', optionalAuth, compController.getCompetition);
router.get('/:id/winners', compController.getWinners);
router.get('/:id/testimonials', compController.getTestimonials);

// Registration
router.post('/:id/register', requireAuth, registrationRateLimiter, compController.register);
router.get('/:id/registration', requireAuth, compController.getRegistrationStatus);

// Submissions
router.post(
  '/:id/submissions/presign',
  requireAuth,
  validate(presignSubmissionSchema),
  subController.presignSubmission
);
router.post(
  '/:id/submissions',
  requireAuth,
  validate(createSubmissionSchema),
  subController.createSubmission
);
router.get('/:id/submissions/me', requireAuth, subController.getMySubmission);
router.post(
  '/:id/submissions/upload-local',
  requireAuth,
  upload.single('file'),
  subController.uploadLocalFile
);

export default router;
