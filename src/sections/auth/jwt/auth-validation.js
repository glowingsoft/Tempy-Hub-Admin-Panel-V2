import { z as zod } from 'zod';

const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export const strictEmailSchema = zod
  .string({ required_error: 'Email is required' })
  .trim()
  .min(1, { message: 'Email is required' })
  .refine((value) => !/\s/.test(value), { message: 'Email cannot contain spaces' })
  .refine((value) => EMAIL_PATTERN.test(value), { message: 'Enter a valid email address' })
  .transform((value) => value.toLowerCase());

export const otpCodeSchema = zod
  .string({ required_error: 'OTP is required' })
  .trim()
  .regex(/^\d{6}$/, { message: 'Enter the 6-digit OTP' });
