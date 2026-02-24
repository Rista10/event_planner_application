import api from './api';
import type { ApiSuccessResponse } from '../types/api';
import type { Rsvp, RsvpSummary, CreateRsvpData } from '../types/rsvp';

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
