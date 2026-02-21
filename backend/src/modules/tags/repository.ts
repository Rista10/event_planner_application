import { v4 as uuidv4 } from 'uuid';
import db from '../../config/db.js';
import { Tag } from './types.js';

const TABLE = 'tags';

export async function findAll(): Promise<Tag[]> {
    return db(TABLE).select('*').orderBy('name', 'asc');
}

export async function findById(id: string): Promise<Tag | undefined> {
  return db(TABLE).where('id', id).first<Tag>();
}

export async function findByName(name: string): Promise<Tag | undefined> {
  return db(TABLE).where('name', name).first<Tag>();
}

export async function create(name: string): Promise<Tag> {
  const id = uuidv4();
  await db(TABLE).insert({ id, name });
  const tag = await db(TABLE).where('id', id).first<Tag>();
  if (!tag) {
    throw new Error('Failed to create tag');
  }
  return tag;
}

export async function deleteById(id: string): Promise<number> {
  return db(TABLE).where('id', id).del();
}
