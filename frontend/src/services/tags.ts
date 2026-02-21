import api from './api';
import type { ApiSuccessResponse } from '../types/api';
import type { Tag } from '../types/events'

export async function getTags(): Promise<Tag[]> {
  const response = await api.get<ApiSuccessResponse<Tag[]>>('/tags');
  return response.data.data;
}

export async function createTag(name: string): Promise<Tag> {
  const response = await api.post<ApiSuccessResponse<Tag>>('/tags', { name });
  return response.data.data;
}
