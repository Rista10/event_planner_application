import { Request, Response, NextFunction } from 'express';
import { createOrUpdateRsvpSchema, rsvpQuerySchema } from './validation.js';
import * as rsvpService from './service.js';
import { AppError } from '../../middleware/errorHandler.js';
import { ApiSuccessResponse, PaginatedResult } from '../../shared/types/index.js';
import { RsvpRow, RsvpWithUser, RsvpSummary } from './types.js';

export async function createOrUpdate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const eventId = req.params.eventId as string;
    if (!eventId) {
      throw new AppError('Event ID is required', 400, 'VALIDATION_ERROR');
    }

    const parsed = createOrUpdateRsvpSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join(', ');
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }

    const userId = req.user!.id as string;
    const rsvp = await rsvpService.createOrUpdateRsvp(userId, eventId, parsed.data.response);

    const response: ApiSuccessResponse<RsvpRow> = {
      success: true,
      data: rsvp,
      error: null,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function getMyRsvp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eventId = req.params.eventId as string;
    if (!eventId) {
      throw new AppError('Event ID is required', 400, 'VALIDATION_ERROR');
    }

    const userId = req.user!.id as string;
    const rsvp = await rsvpService.getMyRsvpForEvent(userId, eventId);

    const response: ApiSuccessResponse<RsvpRow | null> = {
      success: true,
      data: rsvp,
      error: null,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function getForEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eventId = req.params.eventId as string;
    if (!eventId) {
      throw new AppError('Event ID is required', 400, 'VALIDATION_ERROR');
    }

    const parsed = rsvpQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join(', ');
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }

    const userId = req.user!.id as string;
    const { page, limit, response: responseFilter } = parsed.data;

    const result = await rsvpService.getRsvpsForEvent(
      userId,
      eventId,
      { page, limit, sortBy: 'updated_at', order: 'desc' },
      responseFilter,
    );

    const response: ApiSuccessResponse<PaginatedResult<RsvpWithUser>> = {
      success: true,
      data: result,
      error: null,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eventId = req.params.eventId as string;
    if (!eventId) {
      throw new AppError('Event ID is required', 400, 'VALIDATION_ERROR');
    }

    const summary = await rsvpService.getRsvpSummary(eventId);

    const response: ApiSuccessResponse<RsvpSummary> = {
      success: true,
      data: summary,
      error: null,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eventId = req.params.eventId as string;
    if (!eventId) {
      throw new AppError('Event ID is required', 400, 'VALIDATION_ERROR');
    }

    const userId = req.user!.id as string;
    await rsvpService.cancelRsvp(userId, eventId);

    const response: ApiSuccessResponse<{ message: string }> = {
      success: true,
      data: { message: 'RSVP cancelled successfully' },
      error: null,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
