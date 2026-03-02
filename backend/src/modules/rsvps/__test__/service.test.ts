import { jest } from '@jest/globals';

const mockEventFindById = jest.fn<(...args: any[]) => any>();
jest.unstable_mockModule('../../events/repository.js', () => ({
    findById: mockEventFindById,
}));
const mockRsvpUpsert = jest.fn<(...args: any[]) => any>();
const mockRsvpFindByEventAndUser = jest.fn<(...args: any[]) => any>();
const mockRsvpFindByEventId = jest.fn<(...args: any[]) => any>();
const mockRsvpGetSummaryByEventId = jest.fn<(...args: any[]) => any>();
const mockRsvpDeleteByEventAndUser = jest.fn<(...args: any[]) => any>();
const mockRsvpFindAllByEventId = jest.fn<(...args: any[]) => any>();
const mockRsvpFindEventsUserIsAttending = jest.fn<(...args: any[]) => any>();

jest.unstable_mockModule('../repository.js', () => ({
    upsert: mockRsvpUpsert,
    findByEventAndUser: mockRsvpFindByEventAndUser,
    findByEventId: mockRsvpFindByEventId,
    getSummaryByEventId: mockRsvpGetSummaryByEventId,
    deleteByEventAndUser: mockRsvpDeleteByEventAndUser,
    findAllByEventId: mockRsvpFindAllByEventId,
    findEventsUserIsAttending: mockRsvpFindEventsUserIsAttending,
}));

const {
    createOrUpdateRsvp,
    getMyRsvpForEvent,
    getRsvpsForEvent,
    getRsvpSummary,
    cancelRsvp,
    getRsvpsForExport,
    getEventsUserIsAttending,
} = await import('../service.js');

const fakeEvent = {
    id: 'event-1',
    user_id: 'owner-1',
    title: 'Test Event',
    is_public: true,
};

const fakeRsvp = {
    id: 'rsvp-1',
    event_id: 'event-1',
    user_id: 'user-1',
    response: 'GOING',
    created_at: new Date(),
    updated_at: new Date(),
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe('createOrUpdateRsvp', () => {
    it('Event not found -> 404', async () => {
        mockEventFindById.mockResolvedValue(undefined);
        await expect(createOrUpdateRsvp('user-1', 'bad-event', 'YES')).rejects.toThrow('Event not found');
    });

    it('Success -> upsert called correctly', async () => {
        mockEventFindById.mockResolvedValue(fakeEvent);
        mockRsvpUpsert.mockResolvedValue(fakeRsvp);

        await createOrUpdateRsvp('user-1', 'event-1', 'YES');

        expect(mockRsvpUpsert).toHaveBeenCalledWith({
            event_id: 'event-1',
            user_id: 'user-1',
            response: 'YES',
        });
    });
});

describe('getMyRsvpForEvent', () => {
    it('Returns RSVP if exists', async () => {
        mockRsvpFindByEventAndUser.mockResolvedValue(fakeRsvp);
        const result = await getMyRsvpForEvent('user-1', 'event-1');
        expect(result).toEqual(fakeRsvp);
    });

    it('Returns null if not exists', async () => {
        mockRsvpFindByEventAndUser.mockResolvedValue(undefined);
        const result = await getMyRsvpForEvent('user-1', 'event-1');
        expect(result).toBeNull();
    });
});

describe('getRsvpsForEvent', () => {
    const pagination = { page: 1, limit: 10, sortBy: 'created_at', order: 'desc' as const };

    it('Event not found -> 404', async () => {
        mockEventFindById.mockResolvedValue(undefined);
        await expect(getRsvpsForEvent('owner-1', 'bad-event', pagination)).rejects.toThrow('Event not found');
    });

    it('Not owner -> 403', async () => {
        mockEventFindById.mockResolvedValue(fakeEvent); 
        await expect(getRsvpsForEvent('not-owner', 'event-1', pagination)).rejects.toThrow('Only event owner can view RSVP list');
    });

    it('Owner -> returns paginated result', async () => {
        mockEventFindById.mockResolvedValue(fakeEvent);
        mockRsvpFindByEventId.mockResolvedValue({ items: [{ ...fakeRsvp, users: { name: 'Test User' } }], total: 15 });

        const result = await getRsvpsForEvent('owner-1', 'event-1', pagination);

        expect(result.items).toHaveLength(1);
        expect(result.total).toBe(15);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(10);
        expect(result.totalPages).toBe(2); 
    });
});

describe('getRsvpSummary', () => {
    it('Event not found -> 404', async () => {
        mockEventFindById.mockResolvedValue(undefined);
        await expect(getRsvpSummary('bad-event')).rejects.toThrow('Event not found');
    });

    it('Success -> repository called', async () => {
        mockEventFindById.mockResolvedValue(fakeEvent);
        const mockSummary = { GOING: 5, MAYBE: 2, DECLINED: 1 };
        mockRsvpGetSummaryByEventId.mockResolvedValue(mockSummary);

        const result = await getRsvpSummary('event-1');

        expect(mockRsvpGetSummaryByEventId).toHaveBeenCalledWith('event-1');
        expect(result).toEqual(mockSummary);
    });
});

describe('cancelRsvp', () => {
    it('Event not found -> 404', async () => {
        mockEventFindById.mockResolvedValue(undefined);
        await expect(cancelRsvp('user-1', 'bad-event')).rejects.toThrow('Event not found');
    });

    it('RSVP not found (delete returns 0) -> 404', async () => {
        mockEventFindById.mockResolvedValue(fakeEvent);
        mockRsvpDeleteByEventAndUser.mockResolvedValue(0);

        await expect(cancelRsvp('user-1', 'event-1')).rejects.toThrow('RSVP not found');
    });

    it('Success -> no error', async () => {
        mockEventFindById.mockResolvedValue(fakeEvent);
        mockRsvpDeleteByEventAndUser.mockResolvedValue(1);

        await expect(cancelRsvp('user-1', 'event-1')).resolves.not.toThrow();
        expect(mockRsvpDeleteByEventAndUser).toHaveBeenCalledWith('event-1', 'user-1');
    });
});

describe('getRsvpsForExport', () => {
    it('Event not found -> 404', async () => {
        mockEventFindById.mockResolvedValue(undefined);
        await expect(getRsvpsForExport('owner-1', 'bad-event')).rejects.toThrow('Event not found');
    });

    it('Not owner -> 403', async () => {
        mockEventFindById.mockResolvedValue(fakeEvent);
        await expect(getRsvpsForExport('not-owner', 'event-1')).rejects.toThrow('Only event owner can export RSVP list');
    });

    it('Success -> returns list', async () => {
        mockEventFindById.mockResolvedValue(fakeEvent);
        const exportList = [{ ...fakeRsvp, users: { name: 'Test User' } }];
        mockRsvpFindAllByEventId.mockResolvedValue(exportList);

        const result = await getRsvpsForExport('owner-1', 'event-1');

        expect(mockRsvpFindAllByEventId).toHaveBeenCalledWith('event-1');
        expect(result).toEqual(exportList);
    });
});

describe('getEventsUserIsAttending', () => {
    it('Correct pagination response structure', async () => {
        mockRsvpFindEventsUserIsAttending.mockResolvedValue({ items: [fakeEvent], total: 35 });
        const pagination = { page: 3, limit: 12, sortBy: 'date_time', order: 'asc' as const };

        const result = await getEventsUserIsAttending('user-1', pagination);

        expect(result.items).toHaveLength(1);
        expect(result.total).toBe(35);
        expect(result.page).toBe(3);
        expect(result.limit).toBe(12);
        expect(result.totalPages).toBe(3); 
    });
});
