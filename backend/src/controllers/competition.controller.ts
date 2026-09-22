import { Request, Response } from 'express';
import { CompetitionService } from '../services/competitionService';
import { RegistrationService } from '../services/registrationService';
import { catchAsync, sendSuccess } from '../utils/response';
import { Registration } from '../models/Registration';
import mongoose from 'mongoose';

export const listCompetitions = catchAsync(async (req: Request, res: Response) => {
  const { category, page, limit } = req.query as any;
  const userId = req.user?.userId;
  const result = await CompetitionService.listCompetitions(
    category as string | undefined,
    page ? parseInt(page as string, 10) : 1,
    limit ? parseInt(limit as string, 10) : 10,
    userId
  );
  return sendSuccess(res, result.competitions, 200, result.pagination);
});

export const getCompetition = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user?.userId;
  const result = await CompetitionService.getCompetitionById(id, userId);
  return sendSuccess(res, result, 200);
});

export const getWinners = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { page, limit } = req.query as any;
  const result = await CompetitionService.getWinners(
    id,
    page ? parseInt(page as string, 10) : 1,
    limit ? parseInt(limit as string, 10) : 10
  );
  return sendSuccess(res, result.winners, 200, result.pagination);
});

export const getTestimonials = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { page, limit } = req.query as any;
  const result = await CompetitionService.getTestimonials(
    id,
    page ? parseInt(page as string, 10) : 1,
    limit ? parseInt(limit as string, 10) : 10
  );
  return sendSuccess(res, result.testimonials, 200, result.pagination);
});

export const register = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const result = await RegistrationService.registerForCompetition(id, userId);
  return sendSuccess(res, result, 201);
});

export const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await RegistrationService.verifyPayment(userId, req.body);
  return sendSuccess(res, result, 200);
});

export const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);
  const result = await RegistrationService.handleRazorpayWebhook(rawBody, signature);
  return sendSuccess(res, result, 200);
});

export const getRegistrationStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.userId;

  const registration = await Registration.findOne({
    competitionId: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(userId),
    status: { $in: ['pending_payment', 'confirmed'] },
  });

  return sendSuccess(res, registration, 200);
});
