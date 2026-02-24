export type RsvpResponse = 'YES' | 'NO' | 'MAYBE';

export interface Rsvp {
  id: string;
  event_id: string;
  user_id: string;
  response: RsvpResponse;
  user_name: string;
  user_email: string;
  created_at: string;
  updated_at: string;
}

export interface RsvpSummary {
  yes: number;
  no: number;
  maybe: number;
  total: number;
}

export interface CreateRsvpData {
  response: RsvpResponse;
}
