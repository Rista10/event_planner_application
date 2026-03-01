export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  date_time: string;
  location: string | null;
  is_public: boolean;
  user_id: string;
  creator_name: string;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  date_time: string;
  location?: string;
  is_public?: boolean;
  tag_ids?: string[];
}

export interface UpdateEventData {
  title?: string;
  description?: string | null;
  date_time?: string;
  location?: string | null;
  is_public?: boolean;
  tag_ids?: string[];
}

export interface EventFilters {
  tag_id?: string;
  is_public?: string;
  time_filter?: 'upcoming' | 'past';
  search?: string;
  my_events?: boolean;
}
