import type { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

const TAG_NAMES = [
  'Birthday',
  'Conference',
  'Workshop',
  'Meetup',
  'Party',
  'Seminar',
  'Networking',
  'Hackathon',
  'Webinar',
  'Concert',
  'Festival',
  'Sports',
  'Charity',
  'Exhibition',
  'Training',
];

export async function seed(knex: Knex): Promise<void> {
  for (const name of TAG_NAMES) {
    const existing = await knex('tags').where('name', name).first();
    if (!existing) {
      await knex('tags').insert({ id: uuidv4(), name });
    }
  }
}
