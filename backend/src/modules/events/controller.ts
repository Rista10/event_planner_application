import { Request, Response, NextFunction } from 'express';
import { createEventSchema, updateEventSchema, eventQuerySchema } from './validation.js';
import * as eventService from './service.js';
import { AppError } from '../../middleware/errorHandler.js';
import { ApiSuccessResponse } from '../../shared/types/index.js';
import { EventWithTags } from './types.js';
import { PaginatedResult } from '../../shared/types/index.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = eventQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }

    const { page, limit, sortBy, order, tag_id, is_public, time_filter, search, my_events } = parsed.data;
    const currentUserId = req.user?.id;

    const result = await eventService.listEvents(
      { tag_id, is_public, time_filter, search, currentUserId, my_events },
      { page, limit, sortBy, order },
    );

    const response: ApiSuccessResponse<PaginatedResult<EventWithTags>> = {
      success: true,
      data: result,
      error: null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    if (!id) {
      throw new AppError('Event ID is required', 400, 'VALIDATION_ERROR');
    }
    const currentUserId = req.user?.id;
    const event = await eventService.getEventById(id, currentUserId);

    const response: ApiSuccessResponse<EventWithTags> = {
      success: true,
      data: event,
      error: null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }

    const userId = req.user!.id;
    const event = await eventService.createEvent(userId, parsed.data);

    const response: ApiSuccessResponse<EventWithTags> = {
      success: true,
      data: event,
      error: null,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    if (!id) {
      throw new AppError('Event ID is required', 400, 'VALIDATION_ERROR');
    }

    const parsed = updateEventSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }

    const userId = req.user!.id;
    const event = await eventService.updateEvent(userId, id, parsed.data);

    const response: ApiSuccessResponse<EventWithTags> = {
      success: true,
      data: event,
      error: null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    if (!id) {
      throw new AppError('Event ID is required', 400, 'VALIDATION_ERROR');
    }

    const userId = req.user!.id;
    await eventService.deleteEvent(userId, id);

    const response: ApiSuccessResponse<{ message: string }> = {
      success: true,
      data: { message: 'Event deleted successfully' },
      error: null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
