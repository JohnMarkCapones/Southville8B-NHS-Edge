import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClubFaqs,
  getClubFaqById,
  createClubFaq,
  updateClubFaq,
  deleteClubFaq,
  CreateClubFaqDto,
  UpdateClubFaqDto,
} from '@/lib/api/endpoints/clubs';
import type { ClubFaqData } from '@/lib/api/types/clubs';

/**
 * Hook to fetch all FAQs for a club
 */
export function useClubFaqs(clubId: string) {
  return useQuery<ClubFaqData[]>({
    queryKey: ['club-faqs', clubId],
    queryFn: () => getClubFaqs(clubId),
    enabled: !!clubId,
  });
}

/**
 * Hook to fetch a single FAQ
 */
export function useClubFaq(clubId: string, faqId: string) {
  return useQuery<ClubFaqData>({
    queryKey: ['club-faq', clubId, faqId],
    queryFn: () => getClubFaqById(clubId, faqId),
    enabled: !!clubId && !!faqId,
  });
}

/**
 * Hook to create a new FAQ
 */
export function useCreateClubFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: CreateClubFaqDto }) =>
      createClubFaq(clubId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['club-faqs', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['clubs', variables.clubId] });
    },
  });
}

/**
 * Hook to update a FAQ
 */
export function useUpdateClubFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clubId,
      faqId,
      data,
    }: {
      clubId: string;
      faqId: string;
      data: UpdateClubFaqDto;
    }) => updateClubFaq(clubId, faqId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['club-faqs', variables.clubId] });
      queryClient.invalidateQueries({
        queryKey: ['club-faq', variables.clubId, variables.faqId],
      });
      queryClient.invalidateQueries({ queryKey: ['clubs', variables.clubId] });
    },
  });
}

/**
 * Hook to delete a FAQ
 */
export function useDeleteClubFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubId, faqId }: { clubId: string; faqId: string }) =>
      deleteClubFaq(clubId, faqId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['club-faqs', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['clubs', variables.clubId] });
    },
  });
}
