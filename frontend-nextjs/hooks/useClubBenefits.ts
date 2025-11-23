import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClubBenefits,
  getClubBenefitById,
  createClubBenefit,
  updateClubBenefit,
  deleteClubBenefit,
  CreateClubBenefitDto,
  UpdateClubBenefitDto,
} from '@/lib/api/endpoints/clubs';
import type { ClubBenefitData } from '@/lib/api/types/clubs';

/**
 * Hook to fetch all benefits for a club
 */
export function useClubBenefits(clubId: string) {
  return useQuery<ClubBenefitData[]>({
    queryKey: ['club-benefits', clubId],
    queryFn: () => getClubBenefits(clubId),
    enabled: !!clubId,
  });
}

/**
 * Hook to fetch a single benefit
 */
export function useClubBenefit(clubId: string, benefitId: string) {
  return useQuery<ClubBenefitData>({
    queryKey: ['club-benefit', clubId, benefitId],
    queryFn: () => getClubBenefitById(clubId, benefitId),
    enabled: !!clubId && !!benefitId,
  });
}

/**
 * Hook to create a new benefit
 */
export function useCreateClubBenefit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: CreateClubBenefitDto }) =>
      createClubBenefit(clubId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['club-benefits', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['clubs', variables.clubId] });
    },
  });
}

/**
 * Hook to update a benefit
 */
export function useUpdateClubBenefit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clubId,
      benefitId,
      data,
    }: {
      clubId: string;
      benefitId: string;
      data: UpdateClubBenefitDto;
    }) => updateClubBenefit(clubId, benefitId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['club-benefits', variables.clubId] });
      queryClient.invalidateQueries({
        queryKey: ['club-benefit', variables.clubId, variables.benefitId],
      });
      queryClient.invalidateQueries({ queryKey: ['clubs', variables.clubId] });
    },
  });
}

/**
 * Hook to delete a benefit
 */
export function useDeleteClubBenefit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubId, benefitId }: { clubId: string; benefitId: string }) =>
      deleteClubBenefit(clubId, benefitId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['club-benefits', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['clubs', variables.clubId] });
    },
  });
}
