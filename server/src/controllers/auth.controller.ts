import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendCreated, sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import * as authService from '../services/auth.service';

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    maxAge: REFRESH_MAX_AGE,
    path: '/api/auth',
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  return sendCreated(res, { user, accessToken }, 'Account created successfully');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);
  setRefreshCookie(res, refreshToken);
  return sendSuccess(res, { user, accessToken }, 'Signed in successfully');
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw AppError.unauthorized('No session found');

  const { user, accessToken, refreshToken } = await authService.refresh(token);
  setRefreshCookie(res, refreshToken);
  return sendSuccess(res, { user, accessToken }, 'Session refreshed');
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  return sendSuccess(res, null, 'Signed out');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!.id);
  return sendSuccess(res, { user });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.updateProfile(req.user!.id, req.body);
  return sendSuccess(res, { user }, 'Profile updated');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user!.id, currentPassword, newPassword);
  return sendSuccess(res, null, 'Password changed');
});
