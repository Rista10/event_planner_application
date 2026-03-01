import { v4 as uuidv4 } from 'uuid';
import db from '../../config/db.js';
import { RsvpRow, RsvpWithUser, RsvpResponse, RsvpSummary } from './types.js';
import { PaginationParams } from '../../shared/types/index.js';
import { EventRow, EventWithTags } from '../events/types.js';
import { Tag } from '../tags/types.js';

const TABLE = 'rsvps';

export async function upsert(data: {
  event_id: string;
  user_id: string;
  response: RsvpResponse;
}): Promise<RsvpRow> {
  const existing = await findByEventAndUser(data.event_id, data.user_id);

  if (existing) {
    await db(TABLE).where('id', existing.id).update({
      response: data.response,
      updated_at: new Date(),
    });
    return { ...existing, response: data.response, updated_at: new Date() };
  } else {
    const id = uuidv4();
    await db(TABLE).insert({ id, ...data });
    const rsvp = await db(TABLE).where('id', id).first<RsvpRow>();
    if (!rsvp) throw new Error('Failed to create RSVP');
    return rsvp;
  }
}

export async function findByEventAndUser(
  eventId: string,
  userId: string,
): Promise<RsvpRow | undefined> {
  return db(TABLE).where('event_id', eventId).where('user_id', userId).first<RsvpRow>();
}

export async function findByEventId(
  eventId: string,
  pagination: PaginationParams,
  responseFilter?: RsvpResponse,
): Promise<{ items: RsvpWithUser[]; total: number }> {
  const countQuery = db(TABLE).where('event_id', eventId);
  if (responseFilter) {
    countQuery.where('response', responseFilter);
  }
  const [{ count }] = await countQuery.clone().count('* as count');
  const total = Number(count);

  const dataQuery = db(TABLE)
    .join('users', 'rsvps.user_id', 'users.id')
    .where('rsvps.event_id', eventId)
    .select('rsvps.*', 'users.name as user_name', 'users.email as user_email')
    .orderBy('rsvps.updated_at', 'desc')
    .limit(pagination.limit)
    .offset((pagination.page - 1) * pagination.limit);

  if (responseFilter) {
    dataQuery.where('rsvps.response', responseFilter);
  }

  const items = await dataQuery;
  return { items: items as RsvpWithUser[], total };
}

export async function getSummaryByEventId(eventId: string): Promise<RsvpSummary> {
  const rows = await db(TABLE)
    .where('event_id', eventId)
    .select('response')
    .count('* as count')
    .groupBy('response');

  const summary: RsvpSummary = { yes: 0, no: 0, maybe: 0, total: 0 };
  for (const row of rows) {
    const count = Number(row.count);
    if (row.response === 'YES') summary.yes = count;
    else if (row.response === 'NO') summary.no = count;
    else if (row.response === 'MAYBE') summary.maybe = count;
    summary.total += count;
  }
  return summary;
}

export async function deleteByEventAndUser(eventId: string, userId: string): Promise<number> {
  return db(TABLE).where('event_id', eventId).where('user_id', userId).del();
}

export async function findAllByEventId(eventId: string): Promise<RsvpWithUser[]> {
  return db(TABLE)
    .join('users', 'rsvps.user_id', 'users.id')
    .where('rsvps.event_id', eventId)
    .select('rsvps.*', 'users.name as user_name', 'users.email as user_email')
    .orderBy('rsvps.created_at', 'asc') as Promise<RsvpWithUser[]>;
}

export async function findEventsUserIsAttending(
  userId: string,
  pagination: PaginationParams,
): Promise<{ items: EventWithTags[]; total: number }> {
  const [{ count }] = await db(TABLE)
    .where('rsvps.user_id', userId)
    .where('rsvps.response', 'YES')
    .join('events', 'rsvps.event_id', 'events.id')
    .count('* as count');
  const total = Number(count);

  if (total === 0) {
    return { items: [], total: 0 };
  }

  // Get events with pagination
  const eventRows = await db(TABLE)
    .where('rsvps.user_id', userId)
    .where('rsvps.response', 'YES')
    .join('events', 'rsvps.event_id', 'events.id')
    .select('events.*')
    .orderBy(`events.${pagination.sortBy}`, pagination.order)
    .limit(pagination.limit)
    .offset((pagination.page - 1) * pagination.limit) as EventRow[];

  const eventIds = eventRows.map((e) => e.id);
  const tagRows = await db('event_tags')
    .join('tags', 'event_tags.tag_id', 'tags.id')
    .whereIn('event_tags.event_id', eventIds)
    .select('event_tags.event_id', 'tags.id', 'tags.name', 'tags.created_at');

  const tagMap = new Map<string, Tag[]>();
  for (const row of tagRows) {
    const eventId = row.event_id as string;
    if (!tagMap.has(eventId)) {
      tagMap.set(eventId, []);
    }
    tagMap.get(eventId)!.push({
      id: row.id as string,
      name: row.name as string,
      created_at: row.created_at as Date,
    });
  }

  // Attach creator names
  const creatorIds = [...new Set(eventRows.map((e) => e.user_id))];
  const users = await db('users').whereIn('id', creatorIds).select('id', 'name');
  const userMap = new Map<string, string>();
  for (const u of users) {
    userMap.set(u.id as string, u.name as string);
  }

  const items: EventWithTags[] = eventRows.map((event) => ({
    ...event,
    tags: tagMap.get(event.id) || [],
    creator_name: userMap.get(event.user_id) || 'Unknown',
  }));

  return { items, total };
}
