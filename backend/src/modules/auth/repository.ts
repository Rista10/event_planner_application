import { v4 as uuidv4 } from 'uuid';
import db from '../../config/db.js';
import { UserRow } from './types.js';

const TABLE = 'users';

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<UserRow> {
  const id = uuidv4();
  await db(TABLE).insert({ id, ...data });
  const user = await db(TABLE).where('id', id).first<UserRow>();
  if (!user) {
    throw new Error('Failed to create user');
  }
  return user;
}

export async function findByEmail(email: string): Promise<UserRow | undefined> {
  return db(TABLE).where('email', email).first<UserRow>();
}

export async function findById(id: string): Promise<UserRow | undefined> {
  return db(TABLE).where('id', id).first<UserRow>();
}
