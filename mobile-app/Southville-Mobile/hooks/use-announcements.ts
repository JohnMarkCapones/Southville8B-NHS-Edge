import { useState, useEffect } from 'react';
import { fetchAnnouncements } from '@/services/announcements';
import type { Announcement, AnnouncementsParams } from '@/lib/types/announcement';

interface UseAnnouncementsReturn {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnnouncements(params: AnnouncementsParams = {}): UseAnnouncementsReturn {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchAnnouncements(params);
      setAnnouncements(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch announcements';
      setError(errorMessage);
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(params)]);

  return {
    announcements,
    loading,
    error,
    refetch: fetchData,
  };
}
