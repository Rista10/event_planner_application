import { useState, useEffect, useCallback } from 'react';
import type { EventItem, EventFilters } from '../types/events';
import type { PaginationParams, PaginatedResult } from '../types/api';
import { getEvents } from '../services/events';

interface UseEventsReturn {
  events: EventItem[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  pagination: PaginationParams;
  filters: EventFilters;
  setPagination: (params: Partial<PaginationParams>) => void;
  setFilters: (filters: EventFilters) => void;
  refetch: () => void;
}

export function useEvents(): UseEventsReturn {
  const [data, setData] = useState<PaginatedResult<EventItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPaginationState] = useState<PaginationParams>({
    page: 1,
    limit: 5,
    sortBy: 'date_time',
    order: 'asc',
  });
  const [filters, setFiltersState] = useState<EventFilters>({});
  const [trigger, setTrigger] = useState(0);

  const fetchEvents = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const result = await getEvents({ ...pagination, ...filters });
      setData(result);
    } catch {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [pagination, filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, trigger]);

  const setPagination = useCallback((params: Partial<PaginationParams>): void => {
    setPaginationState((prev) => ({ ...prev, ...params }));
  }, []);

  const setFilters = useCallback((newFilters: EventFilters): void => {
    setFiltersState(newFilters);
    setPaginationState((prev) => ({ ...prev, page: 1 }));
  }, []);

  const refetch = useCallback((): void => {
    setTrigger((prev) => prev + 1);
  }, []);

  return {
    events: data.items,
    total: data.total,
    totalPages: data.totalPages,
    loading,
    error,
    pagination,
    filters,
    setPagination,
    setFilters,
    refetch,
  };
}
