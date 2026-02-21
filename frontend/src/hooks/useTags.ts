import { useState, useEffect, useCallback } from 'react';
import type { Tag } from '../types/events';
import { getTags, createTag as createTagApi } from '../services/tags';

interface UseTagsReturn {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  createTag: (name: string) => Promise<Tag>;
  refetch: () => void;
}

export function useTags(): UseTagsReturn {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTags();
      setTags(data);
    } catch {
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = useCallback(async (name: string): Promise<Tag> => {
    const tag = await createTagApi(name);
    setTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
    return tag;
  }, []);

  return {
    tags,
    loading,
    error,
    createTag,
    refetch: fetchTags,
  };
}
