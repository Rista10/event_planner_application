import { z } from 'zod';

export const createTagSchema = z.object({
    name: z
        .string()
        .min(1, 'Tag name is required')
        .max(100, 'Tag name must be at most 100 characters long')
        .trim(),
});

