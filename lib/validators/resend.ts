import { z } from 'zod';

export const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ResendValues = z.infer<typeof resendSchema>;
