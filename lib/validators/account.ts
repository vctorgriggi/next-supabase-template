import { z } from 'zod';

export const accountSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .regex(
      /^[a-z0-9_]+$/i,
      'Username can only contain letters, numbers, and underscores',
    ),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  avatar_url: z.string().nullable(),
});

export type AccountValues = z.infer<typeof accountSchema>;
