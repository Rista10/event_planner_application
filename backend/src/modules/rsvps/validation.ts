import { z } from 'zod';

export const createOrUpdateRsvpSchema = z.object({
  response: z.enum(['YES', 'NO', 'MAYBE']),
});

export const rsvpQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  response: z.enum(['YES', 'NO', 'MAYBE']).optional(),
});
