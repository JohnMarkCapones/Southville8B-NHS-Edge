/**
 * useClubForms Hook
 *
 * React Query hooks for fetching club forms and form details.
 *
 * Usage:
 * ```tsx
 * const { data: forms, isLoading } = useClubForms(clubId);
 * const { data: form } = useClubForm(clubId, formId);
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getClubFormsByClub, getClubFormById } from '@/lib/api/endpoints/club-forms';

/**
 * Fetch all forms for a club
 *
 * @param clubId - Club ID
 * @param enabled - Whether to enable the query (default: true)
 */
export function useClubForms(clubId: string, enabled = true) {
  return useQuery({
    queryKey: ['club-forms', clubId],
    queryFn: () => getClubFormsByClub(clubId),
    enabled: enabled && !!clubId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single form with its questions
 *
 * @param clubId - Club ID
 * @param formId - Form ID
 * @param enabled - Whether to enable the query (default: true)
 */
export function useClubForm(clubId: string, formId: string, enabled = true) {
  return useQuery({
    queryKey: ['club-form', clubId, formId],
    queryFn: () => getClubFormById(clubId, formId),
    enabled: enabled && !!clubId && !!formId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
