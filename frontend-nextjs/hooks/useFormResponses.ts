/**
 * useFormResponses Hook
 *
 * React Query hooks for fetching form responses.
 *
 * Usage:
 * ```tsx
 * const { data: responses } = useFormResponses(clubId, formId);
 * const { data: response } = useFormResponse(clubId, formId, responseId);
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getFormResponses, getFormResponse } from '@/lib/api/endpoints/club-forms';

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
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch a single response by ID
 *
 * @param clubId - Club ID
 * @param formId - Form ID
 * @param responseId - Response ID
 * @param enabled - Whether to enable the query (default: true)
 */
export function useFormResponse(
  clubId: string,
  formId: string,
  responseId: string,
  enabled = true
) {
  return useQuery({
    queryKey: ['form-response', clubId, formId, responseId],
    queryFn: () => getFormResponse(clubId, formId, responseId),
    enabled: enabled && !!clubId && !!formId && !!responseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
