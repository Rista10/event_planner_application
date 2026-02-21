import api from './api';
import type { ApiSuccessResponse, PaginatedResult, PaginationParams } from '../types/api';
import type { EventItem, CreateEventData, UpdateEventData, EventFilters } from '../types/events';

export async function getEvents(
  params: PaginationParams & EventFilters,
): Promise<PaginatedResult<EventItem>> {
  const response = await api.get<ApiSuccessResponse<PaginatedResult<EventItem>>>('/events', {
    params,
  });
  return response.data.data;
}

export async function getEvent(id: string): Promise<EventItem> {
  const response = await api.get<ApiSuccessResponse<EventItem>>(`/events/${id}`);
  return response.data.data;
}

export async function createEvent(data: CreateEventData): Promise<EventItem> {
  const response = await api.post<ApiSuccessResponse<EventItem>>('/events', data);
  return response.data.data;
}

export async function updateEvent(id: string, data: UpdateEventData): Promise<EventItem> {
  const response = await api.patch<ApiSuccessResponse<EventItem>>(`/events/${id}`, data);
  return response.data.data;
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/events/${id}`);
}
