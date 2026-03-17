import { z } from 'zod';

export const listCommentaryQuerySchema = z.object({
  limit: z
    .coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional(),
});

export const createCommentarySchema = z.object({
  minute: z.coerce.number().int().nonnegative(),
  sequence: z.coerce.number().int().optional(),
  period: z.string().trim().optional(),
  eventType: z.string().trim().optional(),
  actor: z.string().trim().optional(),
  team: z.string().trim().optional(),
  message: z.string().trim().min(1),
  metadata: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional(),
});
