import api from './api';
import type { ApiSuccessResponse, PaginatedResult } from '../types/api';
import type { Rsvp, RsvpSummary, CreateRsvpData } from '../types/rsvp';
import type { EventItem } from '../types/events';

export async function createOrUpdateRsvp(eventId: string, data: CreateRsvpData): Promise<Rsvp> {
  const response = await api.post<ApiSuccessResponse<Rsvp>>(`/rsvps/event/${eventId}`, data);
  return response.data.data;
}

export async function getMyRsvp(eventId: string): Promise<Rsvp | null> {
  const response = await api.get<ApiSuccessResponse<Rsvp | null>>(`/rsvps/event/${eventId}/me`);
  return response.data.data;
}

export async function getRsvpSummary(eventId: string): Promise<RsvpSummary> {
  const response = await api.get<ApiSuccessResponse<RsvpSummary>>(`/rsvps/event/${eventId}/summary`);
  return response.data.data;
}

export async function cancelRsvp(eventId: string): Promise<void> {
  await api.delete(`/rsvps/event/${eventId}`);
}

export async function getEventsAttending(
  params: { page?: number; limit?: number } = {},
): Promise<PaginatedResult<EventItem>> {
  const response = await api.get<ApiSuccessResponse<PaginatedResult<EventItem>>>(
    '/rsvps/me/attending',
    { params },
  );
  return response.data.data;
}

export async function exportGuestList(eventId: string): Promise<void> {
  const response = await api.get(`/rsvps/event/${eventId}/export`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'guest-list.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
