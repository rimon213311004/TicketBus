import { Router } from 'express';
import * as controller from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validator';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), controller.register);
authRouter.post('/login', validate(loginSchema), controller.login);
authRouter.post('/refresh', controller.refresh);
authRouter.post('/logout', controller.logout);
authRouter.get('/me', requireAuth, controller.me);
authRouter.patch('/me', requireAuth, validate(updateProfileSchema), controller.updateMe);
authRouter.post(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  controller.changePassword,
);
