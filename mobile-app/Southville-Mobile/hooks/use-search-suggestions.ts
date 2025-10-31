import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SuggestItem = {
  id: string;
  kind: "announcement" | "event" | "schedule" | "alert";
  title: string;
  subtitle?: string;
};

export type SuggestResponse = {
  announcements: SuggestItem[];
  events: SuggestItem[];
  schedules: SuggestItem[];
  alerts: SuggestItem[];
};

const RECENT_KEY = "sv8b.search.recent";

export function useSearchSuggestions(query: string) {
  const [data, setData] = useState<SuggestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const cacheRef = useRef<Map<string, SuggestResponse>>(new Map());
  const requestIdRef = useRef(0);

  const loadRecent = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const saveRecent = useCallback(
    async (q: string) => {
      try {
        const next = [q, ...recent.filter((r) => r !== q)].slice(0, 8);
        setRecent(next);
        await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
    },
    [recent]
  );

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const q = query.trim();
    const cached = cacheRef.current.get(q);
    if (cached) {
      setData(cached);
      return;
    }

    setLoading(true);
    setError(null);

    const currentId = ++requestIdRef.current;
    let isActive = true;
    const timer = setTimeout(async () => {
      try {
        const res = await apiRequest<SuggestResponse>(
          `/search/suggest?q=${encodeURIComponent(q)}&limit=5`
        );
        if (isActive && currentId === requestIdRef.current) {
          cacheRef.current.set(q, res);
          setData(res);
        }
      } catch (e: any) {
        if (isActive && currentId === requestIdRef.current) {
          setError(e?.message || "Failed to fetch suggestions");
        }
      } finally {
        // Always clear loading to avoid stuck spinners on stale responses
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      isActive = false;
      // Ensure loading is cleared on cleanup (e.g., query changed quickly)
      setLoading(false);
    };
  }, [query]);

  return {
    data,
    loading,
    error,
    recent,
    saveRecent,
  };
}
