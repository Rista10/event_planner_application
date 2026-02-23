import { AppError } from '../../middleware/errorHandler.js';
import { PaginatedResult, PaginationParams } from '../../shared/types/index.js';
import * as eventRepository from './repository.js';
import { CreateEventBody, UpdateEventBody, EventWithTags, EventFilters } from './types.js';

export async function listEvents(
  filters: EventFilters,
  pagination: PaginationParams,
): Promise<PaginatedResult<EventWithTags>> {
  const { items, total } = await eventRepository.findAll(filters, pagination);


  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

export async function getEventById(id: string): Promise<EventWithTags> {
  const event = await eventRepository.findById(id);
  if (!event) {
    throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  }
  return event;
}

export async function createEvent(
  userId: string,
  data: CreateEventBody,
): Promise<EventWithTags> {
  return eventRepository.create(
    {
      title: data.title,
      description: data.description,
      date_time: data.date_time,
      location: data.location,
      is_public: data.is_public ?? true,
      user_id: userId,
    },
    data.tag_ids || [],
  );
}

export async function updateEvent(
  userId: string,
  eventId: string,
  data: UpdateEventBody,
): Promise<EventWithTags> {
  const existing = await eventRepository.findById(eventId);
  if (!existing) {
    throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  if (existing.user_id !== userId) {
    throw new AppError('You can only edit your own events', 403, 'FORBIDDEN');
  }

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.date_time !== undefined) updateData.date_time = new Date(data.date_time);
  if (data.location !== undefined) updateData.location = data.location;
  if (data.is_public !== undefined) updateData.is_public = data.is_public;

  return eventRepository.update(eventId, updateData, data.tag_ids);
}

export async function deleteEvent(userId: string, eventId: string): Promise<void> {
  const existing = await eventRepository.findById(eventId);
  if (!existing) {
    throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  if (existing.user_id !== userId) {
    throw new AppError('You can only delete your own events', 403, 'FORBIDDEN');
  }

  await eventRepository.deleteById(eventId);
}
