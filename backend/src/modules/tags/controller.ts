import { Request, Response, NextFunction } from 'express';
import { createTagSchema } from './validation.js';
import * as tagService from './service.js';
import { AppError } from '../../middleware/errorHandler.js';
import { ApiSuccessResponse } from '../../shared/types/index.js';
import { Tag } from './types.js';

export async function getAll(_req:Request, res:Response, next:NextFunction): Promise<void> {
    try {
        const tags = await tagService.getAllTags();
        
        const response: ApiSuccessResponse<Tag[]> = {
            success: true,
            data: tags,
            error: null,
        };
        
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createTagSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }

    const tag = await tagService.createTag(parsed.data.name);

    const response: ApiSuccessResponse<Tag> = {
      success: true,
      data: tag,
      error: null,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    if (!id) {
      throw new AppError('Tag ID is required', 400, 'VALIDATION_ERROR');
    }

    await tagService.deleteTag(id);

    const response: ApiSuccessResponse<{ message: string }> = {
      success: true,
      data: { message: 'Tag deleted successfully' },
      error: null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
