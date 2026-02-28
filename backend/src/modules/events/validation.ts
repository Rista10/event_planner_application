import { z } from 'zod';

const coerceBoolean = z.union([z.boolean(), z.number()]).transform((val) => Boolean(val));

// Validate that date is not in the past
const futureDateSchema = z
  .string()
  .min(1, 'Please select a date and time for your event')
  .refine((val) => !isNaN(Date.parse(val)), 'Please enter a valid date and time')
  .refine((val) => new Date(val) > new Date(), 'Event date must be in the future');

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Please enter a title for your event')
    .max(255, 'Title is too long (max 255 characters)')
    .trim(),
  description: z
    .string()
    .max(5000, 'Description is too long (max 5000 characters)')
    .trim()
    .optional(),
  date_time: futureDateSchema,
  location: z
    .string()
    .max(500, 'Location is too long (max 500 characters)')
    .trim()
    .optional(),
  is_public: coerceBoolean.optional().default(true),
  tag_ids: z.array(z.string().uuid('Invalid tag selected')).optional().default([]),
});

export const updateEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Event title cannot be empty')
    .max(255, 'Title is too long (max 255 characters)')
    .trim()
    .optional(),
  description: z
    .string()
    .max(5000, 'Description is too long (max 5000 characters)')
    .trim()
    .optional()
    .nullable(),
  date_time: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Please enter a valid date and time')
    .optional(),
  location: z
    .string()
    .max(500, 'Location is too long (max 500 characters)')
    .trim()
    .optional()
    .nullable(),
  is_public: coerceBoolean.optional(),
  tag_ids: z.array(z.string().uuid('Invalid tag selected')).optional(),
});

export const eventQuerySchema = z.object({
  page: z.coerce
    .number({ message: 'Page must be a number' })
    .int('Page must be a whole number')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.coerce
    .number({ message: 'Limit must be a number' })
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(50, 'Cannot fetch more than 50 events at once')
    .default(10),
  sortBy: z.enum(['date_time', 'created_at', 'title']).default('date_time'),
  order: z.enum(['asc', 'desc']).default('asc'),
  tag_id: z.string().uuid('Invalid tag filter').optional(),
  is_public: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  time_filter: z.enum(['upcoming', 'past']).optional(),
  search: z.string().max(255, 'Search query is too long').optional(),
});
