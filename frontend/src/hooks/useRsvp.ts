import { useState, useEffect, useCallback } from 'react';
import type { Rsvp, RsvpSummary, RsvpResponse } from '../types/rsvp';
import { getMyRsvp, getRsvpSummary, createOrUpdateRsvp, cancelRsvp } from '../services/rsvp';

interface UseRsvpReturn {
  myRsvp: Rsvp | null;
  summary: RsvpSummary | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  submitRsvp: (response: RsvpResponse) => Promise<void>;
  cancelMyRsvp: () => Promise<void>;
  refetch: () => void;
}

export function useRsvp(eventId: string | undefined, isAuthenticated: boolean): UseRsvpReturn {
  const [myRsvp, setMyRsvp] = useState<Rsvp | null>(null);
  const [summary, setSummary] = useState<RsvpSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const fetchData = useCallback(async (): Promise<void> => {
    if (!eventId) return;

    setLoading(true);
    setError(null);

    try {
      const summaryData = await getRsvpSummary(eventId);
      setSummary(summaryData);

      if (isAuthenticated) {
        const rsvpData = await getMyRsvp(eventId);
        setMyRsvp(rsvpData);
      }
    } catch {
      setError('Failed to load RSVP data');
    } finally {
      setLoading(false);
    }
  }, [eventId, isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData, trigger]);

  const submitRsvp = useCallback(
    async (response: RsvpResponse): Promise<void> => {
      if (!eventId) return;

      setSubmitting(true);
      setError(null);

      try {
        const rsvp = await createOrUpdateRsvp(eventId, { response });
        setMyRsvp(rsvp);
        const summaryData = await getRsvpSummary(eventId);
        setSummary(summaryData);
      } catch {
        setError('Failed to submit RSVP');
        throw new Error('Failed to submit RSVP');
      } finally {
        setSubmitting(false);
      }
    },
    [eventId],
  );

  const cancelMyRsvp = useCallback(async (): Promise<void> => {
    if (!eventId) return;

    setSubmitting(true);
    setError(null);

    try {
      await cancelRsvp(eventId);
      setMyRsvp(null);
      const summaryData = await getRsvpSummary(eventId);
      setSummary(summaryData);
    } catch {
      setError('Failed to cancel RSVP');
      throw new Error('Failed to cancel RSVP');
    } finally {
      setSubmitting(false);
    }
  }, [eventId]);

  const refetch = useCallback((): void => {
    setTrigger((prev) => prev + 1);
  }, []);

  return {
    myRsvp,
    summary,
    loading,
    submitting,
    error,
    submitRsvp,
    cancelMyRsvp,
    refetch,
  };
}
