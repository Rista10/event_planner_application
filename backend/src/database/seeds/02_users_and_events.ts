import type { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Password@123';

const USERS = [
    {
        name: 'Rista Shrestha',
        email: 'rista@example.com',
    },
    {
        name: 'John Doe',
        email: 'john@example.com',
    },
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
    },
];

function futureDate(daysFromNow: number, hour = 10): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, 0, 0, 0);
    return date;
}

const EVENTS_TEMPLATE = [
    {
        title: 'Tech Meetup 2026',
        description:
            'A gathering of tech enthusiasts to discuss the latest trends in software development, AI, and cloud computing.',
        date_time: futureDate(7, 18),
        location: 'Kathmandu, Nepal',
        is_public: true,
        tags: ['Meetup', 'Networking'],
    },
    {
        title: 'Birthday Bash',
        description: 'Join us for an evening of fun, food, and celebration!',
        date_time: futureDate(14, 17),
        location: 'Patan, Lalitpur',
        is_public: false,
        tags: ['Birthday', 'Party'],
    },
    {
        title: 'Web Development Workshop',
        description:
            'Hands-on workshop covering React, Node.js, and modern full-stack development practices.',
        date_time: futureDate(10, 9),
        location: 'Bhaktapur, Nepal',
        is_public: true,
        tags: ['Workshop', 'Training'],
    },
    {
        title: 'Startup Networking Night',
        description:
            'Connect with founders, investors, and aspiring entrepreneurs over drinks and lightning talks.',
        date_time: futureDate(21, 19),
        location: 'Thamel, Kathmandu',
        is_public: true,
        tags: ['Networking', 'Seminar'],
    },
    {
        title: 'Annual Charity Run',
        description:
            'A 5K charity run to raise funds for local education initiatives. All fitness levels welcome!',
        date_time: futureDate(30, 6),
        location: 'Tundikhel, Kathmandu',
        is_public: true,
        tags: ['Charity', 'Sports'],
    },
    {
        title: 'Hackathon: Build for Good',
        description:
            '48-hour hackathon focused on building tech solutions for social impact. Teams of 2-4.',
        date_time: futureDate(45, 8),
        location: 'Pulchowk Campus, Lalitpur',
        is_public: true,
        tags: ['Hackathon', 'Networking'],
    },
    {
        title: 'Music Festival',
        description:
            'A weekend music festival featuring local and international artists across multiple stages.',
        date_time: futureDate(60, 14),
        location: 'Pokhara, Nepal',
        is_public: true,
        tags: ['Festival', 'Concert'],
    },
    {
        title: 'Art Exhibition: Modern Nepal',
        description:
            'Showcasing contemporary Nepali art with works from over 30 emerging and established artists.',
        date_time: futureDate(15, 11),
        location: 'Nepal Art Council, Kathmandu',
        is_public: true,
        tags: ['Exhibition'],
    },
];

export async function seed(knex: Knex): Promise<void> {
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    // --- Seed Users ---
    const userIds: string[] = [];

    for (const user of USERS) {
        const existing = await knex('users').where('email', user.email).first();
        if (existing) {
            userIds.push(existing.id);
        } else {
            const id = uuidv4();
            await knex('users').insert({
                id,
                name: user.name,
                email: user.email,
                password: hashedPassword,
                is_email_verified: true,
                two_factor_enabled: false,
            });
            userIds.push(id);
        }
    }

    // --- Seed Events ---
    for (let i = 0; i < EVENTS_TEMPLATE.length; i++) {
        const { tags, ...eventData } = EVENTS_TEMPLATE[i];
        // Distribute events across users round-robin
        const userId = userIds[i % userIds.length];

        const existing = await knex('events')
            .where('title', eventData.title)
            .andWhere('user_id', userId)
            .first();

        if (existing) continue;

        const eventId = uuidv4();
        await knex('events').insert({
            id: eventId,
            ...eventData,
            user_id: userId,
        });

        // Link tags
        for (const tagName of tags) {
            const tag = await knex('tags').where('name', tagName).first();
            if (tag) {
                await knex('event_tags').insert({
                    event_id: eventId,
                    tag_id: tag.id,
                });
            }
        }
    }
}
