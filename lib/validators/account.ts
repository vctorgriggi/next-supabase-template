import { z } from 'zod';

export const accountSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  website: z
    .string()
    .trim()
    // allow empty string or valid URL
    .refine(
      (val) => val === '' || z.string().url().safeParse(val).success,
      'Invalid URL',
    )
    // convert empty string to null
    .transform((val) => val || null)
    .nullable(),
  avatar_url: z.string().nullable(),
});

export type AccountValues = z.infer<typeof accountSchema>;
