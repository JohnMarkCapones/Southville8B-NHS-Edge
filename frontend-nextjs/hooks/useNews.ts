import { useQuery, useQueryClient } from '@tanstack/react-query'
import { newsApi, NewsListParams } from '@/lib/api/endpoints/news'
import { NewsArticle, NewsCategory } from '@/types/news'

// Query keys for consistent caching
export const newsQueryKeys = {
  all: ['news'] as const,
  lists: () => [...newsQueryKeys.all, 'list'] as const,
  list: (params: NewsListParams) => [...newsQueryKeys.lists(), params] as const,
  details: () => [...newsQueryKeys.all, 'detail'] as const,
  detail: (slug: string) => [...newsQueryKeys.details(), slug] as const,
  categories: () => [...newsQueryKeys.all, 'categories'] as const,
  featured: () => [...newsQueryKeys.all, 'featured'] as const,
  trending: () => [...newsQueryKeys.all, 'trending'] as const,
  related: (articleId: string) => [...newsQueryKeys.all, 'related', articleId] as const,
}

/**
 * Hook to fetch news articles with filtering and pagination
 */
export function useNews(params: NewsListParams = {}) {
  return useQuery({
    queryKey: newsQueryKeys.list(params),
    queryFn: () => newsApi.getNews(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 or client errors
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status
        if (status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },
    // Return empty data instead of throwing error when API is unavailable
    throwOnError: false,
  })
}

/**
 * Hook to fetch a specific news article by slug
 */
export function useNewsArticle(slug: string) {
  return useQuery({
    queryKey: newsQueryKeys.detail(slug),
    queryFn: () => newsApi.getNewsBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status
        if (status === 404) {
          return false
        }
      }
      return failureCount < 2
    },
    throwOnError: false,
  })
}

/**
 * Hook to fetch news categories
 */
export function useNewsCategories() {
  return useQuery({
    queryKey: newsQueryKeys.categories(),
    queryFn: () => newsApi.getCategories(),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    retry: 2,
    throwOnError: false,
  })
}

/**
 * Hook to fetch featured news articles
 */
export function useFeaturedNews(limit: number = 5) {
  return useQuery({
    queryKey: [...newsQueryKeys.featured(), limit],
    queryFn: () => newsApi.getFeaturedNews(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    throwOnError: false,
  })
}

/**
 * Hook to fetch trending news articles
 */
export function useTrendingNews(limit: number = 3) {
  return useQuery({
    queryKey: [...newsQueryKeys.trending(), limit],
    queryFn: () => newsApi.getTrendingNews(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    throwOnError: false,
  })
}

/**
 * Hook to fetch related news articles
 */
export function useRelatedNews(currentArticleId: string, limit: number = 3) {
  return useQuery({
    queryKey: [...newsQueryKeys.related(currentArticleId), limit],
    queryFn: () => newsApi.getRelatedNews(currentArticleId, limit),
    enabled: !!currentArticleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    throwOnError: false,
  })
}

/**
 * Hook to prefetch news data
 */
export function usePrefetchNews() {
  const queryClient = useQueryClient()

  const prefetchNews = (params: NewsListParams) => {
    queryClient.prefetchQuery({
      queryKey: newsQueryKeys.list(params),
      queryFn: () => newsApi.getNews(params),
      staleTime: 5 * 60 * 1000,
    })
  }

  const prefetchNewsArticle = (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: newsQueryKeys.detail(slug),
      queryFn: () => newsApi.getNewsBySlug(slug),
      staleTime: 5 * 60 * 1000,
    })
  }

  const prefetchCategories = () => {
    queryClient.prefetchQuery({
      queryKey: newsQueryKeys.categories(),
      queryFn: () => newsApi.getCategories(),
      staleTime: 60 * 60 * 1000,
    })
  }

  return {
    prefetchNews,
    prefetchNewsArticle,
    prefetchCategories,
  }
}

/**
 * Hook to invalidate news cache
 */
export function useInvalidateNews() {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: newsQueryKeys.all })
  }

  const invalidateList = (params?: NewsListParams) => {
    if (params) {
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.list(params) })
    } else {
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.lists() })
    }
  }

  const invalidateArticle = (slug: string) => {
    queryClient.invalidateQueries({ queryKey: newsQueryKeys.detail(slug) })
  }

  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: newsQueryKeys.categories() })
  }

  return {
    invalidateAll,
    invalidateList,
    invalidateArticle,
    invalidateCategories,
  }
}
