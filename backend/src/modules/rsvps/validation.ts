import { z } from 'zod';

export const createOrUpdateRsvpSchema = z.object({
  response: z.enum(['YES', 'NO', 'MAYBE'], {
    error: 'Please select a response',
  }),
});

export const rsvpQuerySchema = z.object({
  page: z.coerce
    .number({ error: 'Page must be a number' })
    .int('Page must be a whole number')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.coerce
    .number({ error: 'Limit must be a number' })
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Cannot fetch more than 100 responses at once')
    .default(20),
  response: z.enum(['YES', 'NO', 'MAYBE']).optional(),
});
