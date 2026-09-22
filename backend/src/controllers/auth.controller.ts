import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { catchAsync, sendSuccess } from '../utils/response';

export const signup = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.signup(req.body);
  return sendSuccess(res, result, 201);
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  return sendSuccess(res, result, 200);
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.refresh(req.body.refreshToken);
  return sendSuccess(res, result, 200);
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.getMe(req.user!.userId);
  return sendSuccess(res, result, 200);
});
