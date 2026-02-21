import { z } from 'zod';

const coerceBoolean = z.union([z.boolean(), z.number()]).transform((val) => Boolean(val));

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be at most 255 characters'),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters')
    .optional(),
  date_time: z
    .string()
    .min(1, 'Date and time is required')
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  location: z
    .string()
    .max(500, 'Location must be at most 500 characters')
    .optional(),
  is_public: coerceBoolean.optional().default(true),
  tag_ids: z.array(z.string().uuid('Invalid tag ID')).optional().default([]),
});

export const updateEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must be at most 255 characters')
    .optional(),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters')
    .optional()
    .nullable(),
  date_time: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
    .optional(),
  location: z
    .string()
    .max(500, 'Location must be at most 500 characters')
    .optional()
    .nullable(),
  is_public: coerceBoolean.optional(),
  tag_ids: z.array(z.string().uuid('Invalid tag ID')).optional(),
});

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sortBy: z.enum(['date_time', 'created_at', 'title']).default('date_time'),
  order: z.enum(['asc', 'desc']).default('asc'),
  tag_id: z.string().uuid().optional(),
  is_public: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  time_filter: z.enum(['upcoming', 'past']).optional(),
  search: z.string().max(255).optional(),
});
