import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import db from '../../config/db.js';
import { EventRow, EventWithTags, EventFilters } from './types.js';
import { Tag } from '../tags/types.js';
import { PaginationParams } from '../../shared/types/index.js';

const TABLE = 'events';

function applyFilters(query: Knex.QueryBuilder, filters: EventFilters): Knex.QueryBuilder {
  if (filters.is_public !== undefined) {
    query.where('events.is_public', filters.is_public);
  }

  if (filters.time_filter === 'upcoming') {
    query.where('events.date_time', '>=', new Date());
  } else if (filters.time_filter === 'past') {
    query.where('events.date_time', '<', new Date());
  }

  if (filters.tag_id) {
    query.whereExists(function () {
      this.select(db.raw('1'))
        .from('event_tags')
        .whereRaw('event_tags.event_id = events.id')
        .where('event_tags.tag_id', filters.tag_id!);
    });
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    query.where(function () {
      this.where('events.title', 'like', term)
        .orWhere('events.description', 'like', term)
        .orWhere('events.location', 'like', term);
    });
  }

  return query;
}

async function attachTags(events: EventRow[]): Promise<EventWithTags[]> {
  if (events.length === 0) return [];

  const eventIds = events.map((e) => e.id);

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

  const userIds = [...new Set(events.map((e) => e.user_id))];
  const users = await db('users').whereIn('id', userIds).select('id', 'name');
  const userMap = new Map<string, string>();
  for (const u of users) {
    userMap.set(u.id as string, u.name as string);
  }

  return events.map((event) => ({
    ...event,
    tags: tagMap.get(event.id) || [],
    creator_name: userMap.get(event.user_id) || 'Unknown',
  }));
}

export async function findAll(
  filters: EventFilters,
  pagination: PaginationParams,
): Promise<{ items: EventWithTags[]; total: number }> {
  const countQuery = db(TABLE).count('* as count');
  applyFilters(countQuery, filters);
  const [{ count }] = await countQuery;
  const total = Number(count);

  const dataQuery = db(TABLE)
    .select('events.*')
    .orderBy(`events.${pagination.sortBy}`, pagination.order)
    .limit(pagination.limit)
    .offset((pagination.page - 1) * pagination.limit);
  applyFilters(dataQuery, filters);

  const events = await dataQuery;
  const items = await attachTags(events as EventRow[]);

  return { items, total };
}

export async function findById(id: string): Promise<EventWithTags | undefined> {
  const event = await db(TABLE).where('events.id', id).first<EventRow>();
  if (!event) return undefined;

  const [enriched] = await attachTags([event]);
  return enriched;
}

export async function create(
  data: {
    title: string;
    description?: string;
    date_time: string;
    location?: string;
    is_public: boolean;
    user_id: string;
  },
  tagIds: string[],
): Promise<EventWithTags> {
  return db.transaction(async (trx: Knex.Transaction) => {
    const eventId = uuidv4();
    await trx(TABLE).insert({
      id: eventId,
      title: data.title,
      description: data.description || null,
      date_time: new Date(data.date_time),
      location: data.location || null,
      is_public: data.is_public,
      user_id: data.user_id,
    });

    const event = await trx(TABLE).where('id', eventId).first<EventRow>();
    if (!event) throw new Error('Failed to create event');

    if (tagIds.length > 0) {
      const tagEntries = tagIds.map((tag_id) => ({
        event_id: event.id,
        tag_id,
      }));
      await trx('event_tags').insert(tagEntries);
    }

    const tagRows =
      tagIds.length > 0
        ? await trx('tags').whereIn('id', tagIds).select('*')
        : [];

    const user = await trx('users').where('id', data.user_id).first('name');

    return {
      ...event,
      tags: tagRows as Tag[],
      creator_name: (user?.name as string) || 'Unknown',
    };
  });
}

export async function update(
  id: string,
  data: Partial<{
    title: string;
    description: string | null;
    date_time: Date;
    location: string | null;
    is_public: boolean;
  }>,
  tagIds?: string[],
): Promise<EventWithTags> {
  return db.transaction(async (trx: Knex.Transaction) => {
    if (Object.keys(data).length > 0) {
      await trx(TABLE).where('id', id).update({
        ...data,
        updated_at: new Date(),
      });
    }

    if (tagIds !== undefined) {
      await trx('event_tags').where('event_id', id).del();
      if (tagIds.length > 0) {
        const tagEntries = tagIds.map((tag_id) => ({
          event_id: id,
          tag_id,
        }));
        await trx('event_tags').insert(tagEntries);
      }
    }

    const event = await trx(TABLE).where('id', id).first<EventRow>();
    if (!event) throw new Error('Event not found after update');

    const eventTags = await trx('event_tags')
      .join('tags', 'event_tags.tag_id', 'tags.id')
      .where('event_tags.event_id', id)
      .select('tags.*');

    const user = await trx('users').where('id', event.user_id).first('name');

    return {
      ...event,
      tags: eventTags as Tag[],
      creator_name: (user?.name as string) || 'Unknown',
    };
  });
}

export async function deleteById(id: string): Promise<number> {
  return db(TABLE).where('id', id).del();
}