import { AppError } from '../../middleware/errorHandler.js';
import { PaginatedResult, PaginationParams } from '../../shared/types/index.js';
import * as rsvpRepository from './repository.js';
import * as eventRepository from '../events/repository.js';
import { RsvpRow, RsvpWithUser, RsvpResponse, RsvpSummary } from './types.js';

export async function createOrUpdateRsvp(
  userId: string,
  eventId: string,
  response: RsvpResponse,
): Promise<RsvpRow> {
  const event = await eventRepository.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  return rsvpRepository.upsert({
    event_id: eventId,
    user_id: userId,
    response,
  });
}

export async function getMyRsvpForEvent(userId: string, eventId: string): Promise<RsvpRow | null> {
  const rsvp = await rsvpRepository.findByEventAndUser(eventId, userId);
  return rsvp || null;
}

export async function getRsvpsForEvent(
  userId: string,
  eventId: string,
  pagination: PaginationParams,
  responseFilter?: RsvpResponse,
): Promise<PaginatedResult<RsvpWithUser>> {
  const event = await eventRepository.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  if (event.user_id !== userId) {
    throw new AppError('Only event owner can view RSVP list', 403, 'FORBIDDEN');
  }

  const { items, total } = await rsvpRepository.findByEventId(eventId, pagination, responseFilter);
  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

export async function getRsvpSummary(eventId: string): Promise<RsvpSummary> {
  const event = await eventRepository.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  return rsvpRepository.getSummaryByEventId(eventId);
}

export async function cancelRsvp(userId: string, eventId: string): Promise<void> {
  const event = await eventRepository.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  const deleted = await rsvpRepository.deleteByEventAndUser(eventId, userId);
  if (deleted === 0) {
    throw new AppError('RSVP not found', 404, 'RSVP_NOT_FOUND');
  }
}
