import { jest } from '@jest/globals';
import { AppError } from '../../../middleware/errorHandler.js';

// mock repository functions
const mockFindAll = jest.fn<(...args: any[]) => any>();
const mockFindByName = jest.fn<(...args: any[]) => any>();
const mockCreate = jest.fn<(...args: any[]) => any>();
const mockFindById = jest.fn<(...args: any[]) => any>();
const mockDeleteById = jest.fn<(...args: any[]) => any>();

jest.unstable_mockModule('../repository.js', () => ({
    findAll: mockFindAll,
    findByName: mockFindByName,
    create: mockCreate,
    findById: mockFindById,
    deleteById: mockDeleteById,
}));

const { getAllTags, createTag, deleteTag } = await import('../service.js');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('getAllTags', () => {
    it('Should return whatever repository returns', async () => {
        const mockTags = [{ id: '1', name: 'Tech' }];
        mockFindAll.mockResolvedValue(mockTags);

        const result = await getAllTags();

        expect(result).toEqual(mockTags);
        expect(mockFindAll).toHaveBeenCalled();
    });
});

describe('createTag', () => {
    it('Tag already exists -> throws 409', async () => {
        const existingTag = { id: '1', name: 'Tech' };
        mockFindByName.mockResolvedValue(existingTag);

        await expect(createTag('Tech')).rejects.toThrow(AppError);
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it('Successful creation', async () => {
        const newTag = { id: '2', name: 'Music' };
        mockFindByName.mockResolvedValue(null);
        mockCreate.mockResolvedValue(newTag);

        const result = await createTag('Music');

        expect(mockCreate).toHaveBeenCalledWith('Music');
        expect(result).toEqual(newTag);
    });
});

describe('deleteTag', () => {
    it('Tag not found -> 404', async () => {
        mockFindById.mockResolvedValue(null);

        await expect(deleteTag('bad-id')).rejects.toThrow(AppError);
        expect(mockDeleteById).not.toHaveBeenCalled();
    });

    it('Successful delete', async () => {
        const tag = { id: '1', name: 'Tech' };
        mockFindById.mockResolvedValue(tag);
        mockDeleteById.mockResolvedValue(undefined);

        await expect(deleteTag('1')).resolves.not.toThrow();
        expect(mockDeleteById).toHaveBeenCalledWith('1');
    });
});
