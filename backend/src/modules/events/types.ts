import { Tag } from '../tags/types.js';

export interface EventRow {
  id: string;
  title: string;
  description: string | null;
  date_time: Date;
  location: string | null;
  is_public: boolean;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface EventWithTags extends EventRow {
  tags: Tag[];
  creator_name: string;
}

export interface CreateEventBody {
  title: string;
  description?: string;
  date_time: string;
  location?: string;
  is_public?: boolean;
  tag_ids?: string[];
}

export interface UpdateEventBody {
  title?: string;
  description?: string | null;
  date_time?: string;
  location?: string | null;
  is_public?: boolean;
  tag_ids?: string[];
}

export interface EventFilters {
  tag_id?: string;
  is_public?: boolean;
  time_filter?: 'upcoming' | 'past';
  search?: string;
}

export interface EventQueryParams {
  page: number;
  limit: number;
  sortBy: string;
  order: 'asc' | 'desc';
  filters: EventFilters;
}
