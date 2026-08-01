import { z } from 'zod';

const phoneRegex = /^01[3-9]\d{8}$/;

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(80),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().regex(phoneRegex, 'Enter a valid Bangladeshi mobile number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(80).optional(),
      phone: z.string().regex(phoneRegex, 'Enter a valid Bangladeshi mobile number').optional(),
      avatar: z.string().url('Enter a valid image URL').optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'Nothing to update',
    }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Enter your current password'),
      newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    })
    .refine((body) => body.currentPassword !== body.newPassword, {
      path: ['newPassword'],
      message: 'Choose a password different from your current one',
    }),
});
