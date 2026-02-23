export type RsvpResponse = 'YES' | 'NO' | 'MAYBE';

export interface RsvpRow {
  id: string;
  event_id: string;
  user_id: string;
  response: RsvpResponse;
  created_at: Date;
  updated_at: Date;
}

export interface RsvpWithUser extends RsvpRow {
  user_name: string;
  user_email: string;
}

export interface RsvpSummary {
  yes: number;
  no: number;
  maybe: number;
  total: number;
}

export interface CreateOrUpdateRsvpBody {
  response: RsvpResponse;
}
