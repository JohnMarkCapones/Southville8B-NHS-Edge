/**
 * ========================================
 * BANNER NOTIFICATIONS HOOKS
 * ========================================
 * React Query hooks for Banner Notifications
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBanners,
  getActiveBanners,
  getBannerById,
  createBanner,
  updateBanner,
  toggleBannerStatus,
  deleteBanner,
} from '@/lib/api/endpoints/banners';
import type {
  BannerQueryParams,
  CreateBannerRequest,
  UpdateBannerRequest,
} from '@/lib/api/types/banners';
import { useToast } from './use-toast';

// ========================================
// QUERY HOOKS
// ========================================

/**
 * Get all banners with pagination (Admin only)
 */
export function useBanners(params?: BannerQueryParams & { enabled?: boolean }) {
  const { enabled = true, ...queryParams } = params || {};
  return useQuery({
    queryKey: ['banners', queryParams],
    queryFn: () => getBanners(queryParams),
    enabled,
  });
}

/**
 * Get active banners (Public endpoint)
 * Refreshes every minute to keep banners up-to-date
 */
export function useActiveBanners() {
  return useQuery({
    queryKey: ['banners', 'active'],
    queryFn: getActiveBanners,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}

/**
 * Get single banner by ID
 */
export function useBanner(id: string | null) {
  return useQuery({
    queryKey: ['banners', id],
    queryFn: () => getBannerById(id!),
    enabled: !!id,
  });
}

// ========================================
// MUTATION HOOKS
// ========================================

/**
 * All banner mutations in one hook
 */
export function useBannerMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: CreateBannerRequest) => createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: 'Success',
        description: 'Banner created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create banner',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerRequest }) =>
      updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: 'Success',
        description: 'Banner updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update banner',
        variant: 'destructive',
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => toggleBannerStatus(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: 'Success',
        description: `Banner ${data.isActive ? 'activated' : 'deactivated'} successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to toggle banner status',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: 'Success',
        description: 'Banner deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete banner',
        variant: 'destructive',
      });
    },
  });

  return {
    createMutation,
    updateMutation,
    toggleMutation,
    deleteMutation,
  };
}
