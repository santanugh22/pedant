import { Request, Response } from 'express';
import { ReferralService } from '../services/referralService';
import { catchAsync, sendSuccess } from '../utils/response';

export const getMyReferral = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await ReferralService.getMyReferral(userId);
  return sendSuccess(res, result, 200);
});

export const redeemReferral = catchAsync(async (req: Request, res: Response) => {
  const { referralCode } = req.body;
  const userId = req.user!.userId;
  const result = await ReferralService.redeem(referralCode, userId);
  return sendSuccess(res, result, 200);
});
