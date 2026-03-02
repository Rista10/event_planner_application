import { jest } from '@jest/globals';

// mock functions for the repository
const mockFindAll = jest.fn<(...args: any[]) => any>();
const mockFindById = jest.fn<(...args: any[]) => any>();
const mockCreate = jest.fn<(...args: any[]) => any>();
const mockUpdate = jest.fn<(...args: any[]) => any>();
const mockDeleteById = jest.fn<(...args: any[]) => any>();

jest.unstable_mockModule('../repository.js', () => ({
    findAll: mockFindAll,
    findById: mockFindById,
    create: mockCreate,
    update: mockUpdate,
    deleteById: mockDeleteById,
}));

const { listEvents, getEventById, createEvent, updateEvent, deleteEvent } = await import('../service.js');

const fakeEvent = {
    id: 'event-1',
    title: 'Test Event',
    description: 'A test event',
    date_time: new Date('2026-06-15T10:00:00Z'),
    location: 'Kathmandu',
    is_public: true,
    user_id: 'owner-123',
    tags: [],
    created_at: new Date(),
    updated_at: new Date(),
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe('listEvents', () => {
    it('should return correct pagination structure', async () => {
        mockFindAll.mockResolvedValue({ items: [fakeEvent], total: 25 });

        const result = await listEvents({}, { page: 2, limit: 10, sortBy: 'date_time', order: 'desc' });

        expect(result.items).toHaveLength(1);
        expect(result.total).toBe(25);
        expect(result.page).toBe(2);
        expect(result.limit).toBe(10);
        expect(result.totalPages).toBe(3);
    });

    it('should pass filters and pagination to repository', async () => {
        mockFindAll.mockResolvedValue({ items: [], total: 0 });
        const filters = { search: 'party', is_public: true };
        const pagination = { page: 1, limit: 5, sortBy: 'title', order: 'asc' as const };

        await listEvents(filters, pagination);

        expect(mockFindAll).toHaveBeenCalledWith(filters, pagination);
    });
});


describe('getEventById', () => {
    it('should throw 404 when event not found', async () => {
        mockFindById.mockResolvedValue(undefined);
        await expect(getEventById('bad-id')).rejects.toThrow('Event not found');
    });

    it('should throw 404 for private event when user is not the owner', async () => {
        mockFindById.mockResolvedValue({ ...fakeEvent, is_public: false, user_id: 'owner-123' });
        await expect(getEventById('event-1', 'another-user')).rejects.toThrow('Event not found');
    });

    it('should return public event for any user', async () => {
        mockFindById.mockResolvedValue(fakeEvent);
        const result = await getEventById('event-1', 'any-user');
        expect(result.id).toBe('event-1');
    });

    it('should return private event for the owner', async () => {
        mockFindById.mockResolvedValue({ ...fakeEvent, is_public: false, user_id: 'owner-123' });
        const result = await getEventById('event-1', 'owner-123');
        expect(result.id).toBe('event-1');
    });
});


describe('createEvent', () => {
    it('should call repository with correct data and default is_public to true', async () => {
        mockCreate.mockResolvedValue(fakeEvent);

        await createEvent('owner-123', {
            title: 'Test Event',
            description: 'A test event',
            date_time: '2026-06-15T10:00:00Z',
            location: 'Kathmandu',
            tag_ids: ['tag-1'],
        });

        expect(mockCreate).toHaveBeenCalledWith(
            {
                title: 'Test Event',
                description: 'A test event',
                date_time: '2026-06-15T10:00:00Z',
                location: 'Kathmandu',
                is_public: true,
                user_id: 'owner-123',
            },
            ['tag-1'],
        );
    });

    it('should respect explicit is_public: false', async () => {
        mockCreate.mockResolvedValue({ ...fakeEvent, is_public: false });

        await createEvent('owner-123', {
            title: 'Private Event',
            description: 'Secret',
            date_time: '2026-06-15T10:00:00Z',
            location: 'Kathmandu',
            is_public: false,
        });

        expect(mockCreate).toHaveBeenCalledWith(
            expect.objectContaining({ is_public: false }),
            [],
        );
    });

    it('should default tag_ids to empty array when not provided', async () => {
        mockCreate.mockResolvedValue(fakeEvent);

        await createEvent('owner-123', {
            title: 'No Tags Event',
            description: 'No tags',
            date_time: '2026-06-15T10:00:00Z',
            location: 'Kathmandu',
        });

        expect(mockCreate).toHaveBeenCalledWith(
            expect.any(Object),
            [],
        );
    });
});


describe('updateEvent', () => {
    it('should throw 404 when event not found', async () => {
        mockFindById.mockResolvedValue(undefined);
        await expect(updateEvent('owner-123', 'bad-id', { title: 'X' })).rejects.toThrow('Event not found');
    });

    it('should throw 403 when user is not the owner', async () => {
        mockFindById.mockResolvedValue(fakeEvent);
        await expect(updateEvent('not-owner', 'event-1', { title: 'X' })).rejects.toThrow('You can only edit your own events');
    });

    it('should update event and convert date_time to Date', async () => {
        mockFindById.mockResolvedValue(fakeEvent);
        mockUpdate.mockResolvedValue({ ...fakeEvent, title: 'Updated' });

        await updateEvent('owner-123', 'event-1', {
            title: 'Updated',
            date_time: '2026-07-01T10:00:00Z',
        });

        expect(mockUpdate).toHaveBeenCalledWith(
            'event-1',
            { title: 'Updated', date_time: new Date('2026-07-01T10:00:00Z') },
            undefined,
        );
    });

    it('should forward tag_ids to repository when provided', async () => {
        mockFindById.mockResolvedValue(fakeEvent);
        mockUpdate.mockResolvedValue(fakeEvent);

        await updateEvent('owner-123', 'event-1', {
            title: 'Updated',
            tag_ids: ['tag-2', 'tag-3'],
        });

        expect(mockUpdate).toHaveBeenCalledWith(
            'event-1',
            { title: 'Updated' },
            ['tag-2', 'tag-3'],
        );
    });

    it('should only include provided fields in update data', async () => {
        mockFindById.mockResolvedValue(fakeEvent);
        mockUpdate.mockResolvedValue({ ...fakeEvent, location: 'Pokhara' });

        await updateEvent('owner-123', 'event-1', {
            location: 'Pokhara',
        });

        expect(mockUpdate).toHaveBeenCalledWith(
            'event-1',
            { location: 'Pokhara' },
            undefined,
        );
    });
});


describe('deleteEvent', () => {
    it('should throw 404 when event not found', async () => {
        mockFindById.mockResolvedValue(undefined);
        await expect(deleteEvent('owner-123', 'bad-id')).rejects.toThrow('Event not found');
    });

    it('should throw 403 when user is not the owner', async () => {
        mockFindById.mockResolvedValue(fakeEvent);
        await expect(deleteEvent('not-owner', 'event-1')).rejects.toThrow('You can only delete your own events');
    });

    it('should delete event successfully', async () => {
        mockFindById.mockResolvedValue(fakeEvent);
        mockDeleteById.mockResolvedValue(undefined);

        await deleteEvent('owner-123', 'event-1');

        expect(mockDeleteById).toHaveBeenCalledWith('event-1');
    });
});
