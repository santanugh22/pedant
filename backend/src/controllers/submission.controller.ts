import { Request, Response } from 'express';
import { SubmissionService } from '../services/submissionService';
import { catchAsync, sendSuccess } from '../utils/response';
import { ValidationError } from '../utils/errors';

export const presignSubmission = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const result = await SubmissionService.presignUpload(userId, id, req.body);
  return sendSuccess(res, result, 200);
});

export const createSubmission = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const result = await SubmissionService.createSubmission(userId, id, req.body);
  return sendSuccess(res, result, 201);
});

export const getMySubmission = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const result = await SubmissionService.getMySubmission(userId, id);
  return sendSuccess(res, result, 200);
});

export const uploadLocalFile = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ValidationError('No file uploaded');
  }

  const fileKey = req.file.filename;
  const publicUrl = `/uploads/${fileKey}`;

  return sendSuccess(
    res,
    {
      fileKey,
      publicUrl,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
    200
  );
});
