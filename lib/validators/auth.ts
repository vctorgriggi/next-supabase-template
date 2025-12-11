import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type LoginValues = z.infer<typeof loginSchema>;

// register schema is currently the same as login schema
export const registerSchema = loginSchema.extend({});

export type RegisterValues = LoginValues;
