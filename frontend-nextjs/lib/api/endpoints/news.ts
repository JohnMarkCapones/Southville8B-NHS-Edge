import { NewsArticle, NewsCategory, NewsListResponse } from '@/types/news'
import { apiClient } from '@/lib/api/client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'

export interface NewsApiResponse {
  id: string
  title: string
  slug: string
  author_id: string
  article_json?: any
  article_html: string
  description: string
  category_id: string
  status: 'draft' | 'pending_approval' | 'approved' | 'published'
  visibility: 'public' | 'students' | 'teachers' | 'private'
  published_date?: string
  views: number
  created_at: string
  updated_at: string
  deleted_at?: string | null
  deleted_by?: string | null
  author?: {
    id: string
    email: string
    full_name: string
  }
  category?: {
    id: string
    name: string
    slug: string
  }
  tags?: Array<{
    id: string
    tag: {
      name: string
    }
  }>
  featured_image_url?: string
  // Fields that might not exist in API but we'll handle
  likes?: number
  comments_count?: number
  shares?: number
  featured?: boolean
  trending?: boolean
  read_time?: string
}

export interface NewsCategoryApiResponse {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  created_at: string
  updated_at: string
}

export interface NewsListParams {
  categoryId?: string
  limit?: number
  offset?: number
  search?: string
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending'
  status?: string
  visibility?: string
  includeDeleted?: boolean
}

// Admin-specific list response with pagination
export interface AdminNewsListResponse {
  data: NewsArticle[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// DTOs for creating/updating news
export interface CreateNewsDto {
  title: string
  slug?: string
  description: string
  article_html: string
  article_json?: any
  category_id: string
  visibility: 'public' | 'students' | 'teachers' | 'private'
  status?: 'draft' | 'pending_approval'
  featured_image_url?: string
  tags?: string[]
  co_author_ids?: string[]
}

export interface UpdateNewsDto {
  title?: string
  slug?: string
  description?: string
  article_html?: string
  article_json?: any
  category_id?: string
  visibility?: 'public' | 'students' | 'teachers' | 'private'
  status?: 'draft' | 'pending_approval' | 'approved' | 'published'
  featured_image_url?: string
  tags?: string[]
}

export interface UploadImageResponse {
  url: string
  fileName: string
  fileSize: number
}

class NewsApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message)
    this.name = 'NewsApiError'
  }
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text()
    throw new NewsApiError(
      `API request failed: ${errorText || response.statusText}`,
      response.status,
      response.statusText
    )
  }

  try {
    return await response.json()
  } catch (error) {
    throw new NewsApiError(
      'Failed to parse API response',
      response.status,
      response.statusText
    )
  }
}

// Utility function to safely extract category name
export function getCategoryName(category: any): string {
  if (typeof category === 'string') {
    return category
  }
  if (category && typeof category === 'object' && category.name) {
    return category.name
  }
  return 'General'
}

// Utility function to safely extract author name
export function getAuthorName(author: any): string {
  if (typeof author === 'string') {
    return author
  }
  if (author && typeof author === 'object') {
    return author.full_name || author.name || author.email || 'Unknown Author'
  }
  return 'Unknown Author'
}

// Utility function to safely format dates
export function formatDate(dateString: any): string {
  if (!dateString) {
    return 'No date'
  }
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

// Utility function to safely format numbers
export function formatNumber(value: any): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10)
    if (!isNaN(parsed)) {
      return parsed
    }
  }
  return 0
}

// Map backend status to frontend-friendly status
export function mapBackendStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'draft': 'Draft',
    'pending_approval': 'Pending Review',
    'approved': 'Approved',
    'published': 'Published',
  }
  return statusMap[status] || status
}

// Map backend visibility to frontend-friendly visibility
export function mapBackendVisibility(visibility: string): string {
  const visibilityMap: Record<string, string> = {
    'public': 'Public',
    'students': 'Students Only',
    'teachers': 'Teachers Only',
    'private': 'Internal',
  }
  return visibilityMap[visibility] || visibility
}

function mapApiNewsToFrontend(apiNews: NewsApiResponse): NewsArticle {
  // Calculate read time from article_html
  const cleanContent = apiNews.article_html?.replace(/<[^>]*>/g, '') || ''
  const wordCount = cleanContent.split(/\s+/).filter(w => w.length > 0).length
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))
  const readTime = apiNews.read_time || `${readTimeMinutes} min read`

  // Determine featured/trending based on views if not provided
  const isFeatured = apiNews.featured !== undefined ? apiNews.featured : apiNews.views > 2000
  const isTrending = apiNews.trending !== undefined ? apiNews.trending : apiNews.views > 1500

  return {
    id: apiNews.id,
    title: apiNews.title,
    slug: apiNews.slug,
    content: apiNews.article_html || '',
    excerpt: apiNews.description || cleanContent.substring(0, 160) + '...',
    author: getAuthorName(apiNews.author),
    authorImage: undefined, // API doesn't provide avatar currently
    date: formatDate(apiNews.published_date || apiNews.created_at),
    category: getCategoryName(apiNews.category),
    image: apiNews.featured_image_url,
    views: formatNumber(apiNews.views),
    likes: formatNumber(apiNews.likes || 0),
    comments: formatNumber(apiNews.comments_count || 0),
    shares: formatNumber(apiNews.shares || 0),
    featured: isFeatured,
    trending: isTrending,
    readTime: readTime,
    tags: apiNews.tags?.map(t => t.tag.name) || [],
    initialLikes: formatNumber(apiNews.likes || 0),
    avgRating: 4.5, // Default rating, can be enhanced later
    totalRatings: Math.floor(formatNumber(apiNews.views) / 10), // Estimate based on views
    // Additional admin fields
    status: mapBackendStatus(apiNews.status),
    visibility: mapBackendVisibility(apiNews.visibility),
    publishedDate: apiNews.published_date || '',
    deletedAt: apiNews.deleted_at,
    deletedBy: apiNews.deleted_by,
  } as any // Cast to any to allow extra fields
}

function mapApiCategoryToFrontend(apiCategory: NewsCategoryApiResponse): NewsCategory {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    slug: apiCategory.slug,
    description: apiCategory.description,
    color: apiCategory.color,
    icon: apiCategory.icon,
  }
}

export const newsApi = {
  /**
   * Fetch all published news articles
   */
  async getNews(params: NewsListParams = {}): Promise<NewsListResponse> {
    const searchParams = new URLSearchParams()

    if (params.categoryId) searchParams.append('categoryId', params.categoryId)
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.offset) searchParams.append('offset', params.offset.toString())

    const response = await fetch(
      `${API_BASE_URL}/api/v1/news/public?${searchParams.toString()}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await handleApiResponse<NewsApiResponse[]>(response)

    // Apply client-side filtering and sorting
    let filteredData = data

    // Apply search filter
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      filteredData = filteredData.filter(article => {
        // Search in title
        const titleMatch = article.title.toLowerCase().includes(searchLower)

        // Search in description
        const descriptionMatch = article.description?.toLowerCase().includes(searchLower)

        // Search in author name
        const authorName = getAuthorName(article.author).toLowerCase()
        const authorMatch = authorName.includes(searchLower)

        // Search in tags
        const tagsMatch = (article.tags || []).some(tag =>
          tag.tag.name.toLowerCase().includes(searchLower)
        )

        return titleMatch || descriptionMatch || authorMatch || tagsMatch
      })
    }

    // Apply sorting
    if (params.sortBy) {
      filteredData = [...filteredData].sort((a, b) => {
        switch (params.sortBy) {
          case 'newest':
            return new Date(b.published_date || b.created_at).getTime() - new Date(a.published_date || a.created_at).getTime()
          case 'oldest':
            return new Date(a.published_date || a.created_at).getTime() - new Date(b.published_date || b.created_at).getTime()
          case 'popular':
            return b.views - a.views
          case 'trending':
            if (a.trending && !b.trending) return -1
            if (!a.trending && b.trending) return 1
            return b.views - a.views
          default:
            return 0
        }
      })
    }

    // Map to frontend format
    const mappedData = filteredData.map(mapApiNewsToFrontend)

    return {
      data: mappedData,
      total: mappedData.length,
      limit: params.limit || 20,
      offset: params.offset || 0,
    }
  },

  /**
   * Fetch a specific news article by slug
   */
  async getNewsBySlug(slug: string): Promise<NewsArticle | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/news/public/slug/${slug}`,
        {
          next: { revalidate: 300 }, // Cache for 5 minutes
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status === 404) {
        return null
      }

      const data = await handleApiResponse<NewsApiResponse>(response)
      return mapApiNewsToFrontend(data)
    } catch (error) {
      if (error instanceof NewsApiError && error.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Fetch news categories
   */
  async getCategories(): Promise<NewsCategory[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/news-categories/public`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await handleApiResponse<NewsCategoryApiResponse[]>(response)
    return data.map(mapApiCategoryToFrontend)
  },

  /**
   * Fetch featured news articles
   */
  async getFeaturedNews(limit: number = 5): Promise<NewsArticle[]> {
    const response = await this.getNews({ limit: 50 }) // Get more to filter featured
    return response.data
      .filter(article => article.featured)
      .slice(0, limit)
  },

  /**
   * Fetch trending news articles
   */
  async getTrendingNews(limit: number = 3): Promise<NewsArticle[]> {
    const response = await this.getNews({ limit: 50 }) // Get more to filter trending
    return response.data
      .filter(article => article.trending)
      .slice(0, limit)
  },

  /**
   * Fetch related news articles
   */
  async getRelatedNews(currentArticleId: string, limit: number = 3): Promise<NewsArticle[]> {
    const response = await this.getNews({ limit: 20 })
    return response.data
      .filter(article => article.id !== currentArticleId)
      .slice(0, limit)
  },

  // ============================================
  // AUTHENTICATED ENDPOINTS (For Superadmin)
  // ============================================

  /**
   * Get all news articles (authenticated, for admin)
   * Supports filtering by status, visibility, and includes deleted
   */
  async getAllNews(params: NewsListParams = {}): Promise<AdminNewsListResponse> {
    const searchParams = new URLSearchParams()

    const page = params.offset ? Math.floor(params.offset / (params.limit || 20)) + 1 : 1
    const limit = params.limit || 20

    searchParams.append('page', page.toString())
    searchParams.append('limit', limit.toString())

    if (params.categoryId) searchParams.append('categoryId', params.categoryId)
    if (params.status) searchParams.append('status', params.status.toLowerCase().replace(' ', '_'))
    if (params.visibility) searchParams.append('visibility', params.visibility.toLowerCase())
    if (params.search) searchParams.append('search', params.search)

    const endpoint = `/news?${searchParams.toString()}`

    try {
      const response = await apiClient.get<NewsApiResponse[]>(endpoint)

      // Filter by deleted status if needed
      let filteredData = response
      if (params.includeDeleted === false) {
        filteredData = response.filter(article => !article.deleted_at)
      } else if (params.includeDeleted === true) {
        filteredData = response.filter(article => article.deleted_at !== null)
      }

      // Apply client-side search if provided
      if (params.search) {
        const searchLower = params.search.toLowerCase()
        filteredData = filteredData.filter(article => {
          return (
            article.title.toLowerCase().includes(searchLower) ||
            article.description?.toLowerCase().includes(searchLower) ||
            getAuthorName(article.author).toLowerCase().includes(searchLower)
          )
        })
      }

      // Map to frontend format
      const mappedData = filteredData.map(mapApiNewsToFrontend)

      return {
        data: mappedData,
        pagination: {
          total: mappedData.length,
          page,
          limit,
          totalPages: Math.ceil(mappedData.length / limit),
        },
      }
    } catch (error) {
      console.error('[newsApi.getAllNews] Error:', error)
      throw error
    }
  },

  /**
   * Get news article by ID (authenticated)
   */
  async getNewsById(id: string): Promise<NewsArticle | null> {
    try {
      const response = await apiClient.get<NewsApiResponse>(`/news/${id}`)
      return mapApiNewsToFrontend(response)
    } catch (error) {
      if (error instanceof Error && 'status' in error && (error as any).status === 404) {
        return null
      }
      console.error('[newsApi.getNewsById] Error:', error)
      throw error
    }
  },

  /**
   * Create new news article (authenticated)
   */
  async createNews(data: CreateNewsDto): Promise<NewsArticle> {
    try {
      const response = await apiClient.post<NewsApiResponse>('/news', data)
      return mapApiNewsToFrontend(response)
    } catch (error) {
      console.error('[newsApi.createNews] Error:', error)
      throw error
    }
  },

  /**
   * Update news article (authenticated)
   */
  async updateNews(id: string, data: UpdateNewsDto): Promise<NewsArticle> {
    try {
      const response = await apiClient.patch<NewsApiResponse>(`/news/${id}`, data)
      return mapApiNewsToFrontend(response)
    } catch (error) {
      console.error('[newsApi.updateNews] Error:', error)
      throw error
    }
  },

  /**
   * Delete news article - soft delete (authenticated)
   */
  async deleteNews(id: string): Promise<void> {
    try {
      await apiClient.delete(`/news/${id}`)
    } catch (error) {
      console.error('[newsApi.deleteNews] Error:', error)
      throw error
    }
  },

  /**
   * Restore deleted news article (authenticated)
   * Note: Backend may not have this endpoint yet, may need to use PATCH
   */
  async restoreNews(id: string): Promise<NewsArticle> {
    try {
      // Attempt to restore by updating deleted_at to null
      const response = await apiClient.patch<NewsApiResponse>(`/news/${id}`, {
        deleted_at: null,
        deleted_by: null,
      } as any)
      return mapApiNewsToFrontend(response)
    } catch (error) {
      console.error('[newsApi.restoreNews] Error:', error)
      throw error
    }
  },

  /**
   * Upload image for Tiptap editor (authenticated)
   */
  async uploadImage(file: File): Promise<UploadImageResponse> {
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await apiClient.post<UploadImageResponse>('/news/upload-image', formData)
      return response
    } catch (error) {
      console.error('[newsApi.uploadImage] Error:', error)
      throw error
    }
  },

  /**
   * Submit article for approval (authenticated)
   */
  async submitForApproval(id: string): Promise<NewsArticle> {
    try {
      const response = await apiClient.patch<NewsApiResponse>(`/news/${id}`, {
        status: 'pending_approval',
      })
      return mapApiNewsToFrontend(response)
    } catch (error) {
      console.error('[newsApi.submitForApproval] Error:', error)
      throw error
    }
  },

  /**
   * Approve article (authenticated)
   */
  async approveNews(id: string, message?: string): Promise<NewsArticle> {
    try {
      const response = await apiClient.patch<NewsApiResponse>(`/news/${id}/approve`, {
        approval_message: message,
      })
      return mapApiNewsToFrontend(response)
    } catch (error) {
      console.error('[newsApi.approveNews] Error:', error)
      throw error
    }
  },

  /**
   * Reject article (authenticated)
   */
  async rejectNews(id: string, reason: string): Promise<NewsArticle> {
    try {
      const response = await apiClient.patch<NewsApiResponse>(`/news/${id}/reject`, {
        rejection_reason: reason,
      })
      return mapApiNewsToFrontend(response)
    } catch (error) {
      console.error('[newsApi.rejectNews] Error:', error)
      throw error
    }
  },
}

export { NewsApiError }
