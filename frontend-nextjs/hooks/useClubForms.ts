/**
 * useClubForms Hook
 *
 * React Query hooks for fetching club forms, form details, and form responses.
 *
 * Usage:
 * ```tsx
 * const { data: forms, isLoading } = useClubForms(clubId);
 * const { data: form } = useClubForm(clubId, formId);
 * const { data: responses } = useFormResponses(clubId, formId);
 * const { data: response } = useFormResponse(clubId, formId, responseId);
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getClubFormsByClub,
  getClubFormById,
  getFormResponses,
  getFormResponse
} from '@/lib/api/endpoints/club-forms';

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

/**
 * Fetch all responses for a form
 *
 * @param clubId - Club ID
 * @param formId - Form ID
 * @param enabled - Whether to enable the query (default: true)
 */
export function useFormResponses(clubId: string, formId: string, enabled = true) {
  return useQuery({
    queryKey: ['form-responses', clubId, formId],
    queryFn: () => getFormResponses(clubId, formId),
    enabled: enabled && !!clubId && !!formId,
    staleTime: 30 * 1000, // 30 seconds (shorter for real-time updates)
  });
}

/**
 * Fetch a single form response by ID
 *
 * @param clubId - Club ID
 * @param formId - Form ID
 * @param responseId - Response ID
 * @param enabled - Whether to enable the query (default: true)
 */
export function useFormResponse(clubId: string, formId: string, responseId: string, enabled = true) {
  return useQuery({
    queryKey: ['form-response', clubId, formId, responseId],
    queryFn: () => getFormResponse(clubId, formId, responseId),
    enabled: enabled && !!clubId && !!formId && !!responseId,
    staleTime: 30 * 1000, // 30 seconds
  });
}
