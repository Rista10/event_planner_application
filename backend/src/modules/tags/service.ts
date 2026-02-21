import { AppError } from '../../middleware/errorHandler.js';
import * as tagRepository from './repository.js';
import { Tag } from './types.js';

export async function getAllTags(): Promise<Tag[]> {
  return tagRepository.findAll();
}

export async function createTag(name: string): Promise<Tag> {
  const existing = await tagRepository.findByName(name);
  if (existing) {
    throw new AppError('Tag already exists', 409, 'TAG_ALREADY_EXISTS');
  }
  return tagRepository.create(name);
}

export async function deleteTag(id: string): Promise<void> {
  const tag = await tagRepository.findById(id);
  if (!tag) {
    throw new AppError('Tag not found', 404, 'TAG_NOT_FOUND');
  }
  await tagRepository.deleteById(id);
}