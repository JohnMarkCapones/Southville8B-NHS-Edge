import { NewsArticle, NewsCategory, NewsListResponse } from '@/types/news'
import { apiClient } from '@/lib/api/client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'

export interface NewsApiResponse {
  id: string
  title: string
  slug: string
  author_id: string
  author_name?: string | null
  article_json?: any
  article_html: string
  description: string
  category_id: string
  status: 'draft' | 'pending_approval' | 'approved' | 'published'
  visibility: 'public' | 'students' | 'teachers' | 'private'
  review_status?: 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision' | null
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
  co_authors?: Array<{
    id: string
    co_author_name: string
    role?: string
  }>
  credits?: string | null
  featured_image_url?: string
  // Fields that might not exist in API but we'll handle
  likes?: number
  comments_count?: number
  shares?: number
  featured?: boolean
  trending?: boolean
  read_time?: string
}

export interface ApprovalHistoryRecord {
  id: string
  news_id: string
  approver_id: string
  status: 'approved' | 'rejected' | 'pending' | 'changes_requested'
  remarks: string | null
  action_at: string
  approver?: {
    id: string
    full_name: string
    email: string
  }
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

export interface ReviewCommentApiResponse {
  id: string
  news_id: string
  reviewer_id: string
  comment: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
  deleted_by?: string | null
  reviewer?: {
    id: string
    full_name: string
    email: string
  }
}

export interface ReviewComment {
  id: string
  author: string
  comment: string
  timestamp: string
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
  description?: string
  articleHtml: string
  articleJson: any
  categoryId?: string
  visibility?: 'public' | 'students' | 'teachers' | 'private'
  reviewStatus?: 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision'
  featuredImageUrl?: string
  tags?: string[]
  coAuthorNames?: string[]
  scheduledDate?: string
  authorName?: string
  credits?: string
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
  authorName?: string
  coAuthorNames?: string[]
  credits?: string
}

export interface UploadImageResponse {
  url: string // Cloudflare Images URL (cf_image_url)
  cf_image_url?: string // Cloudflare Images delivery URL
  cf_image_id?: string // Cloudflare Images ID
  fileName: string
  fileSize: number
  mimeType?: string
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

  // Debug: Log what we're getting from the API
  console.log('DEBUG - API News Data:', {
    author_name: apiNews.author_name,
    author_object: apiNews.author,
    author_full_name: apiNews.author?.full_name,
    author_id: apiNews.author_id
  })

  // Get author name: priority order is author_name -> author.full_name -> "Unknown"
  const authorName = apiNews.author_name || apiNews.author?.full_name || 'Unknown'

  // Determine author type based on author email or role
  // Students typically have @student or student-specific email patterns
  // Teachers have @teacher or professional emails
  // This is a temporary solution until the backend provides explicit author_type
  const authorEmail = apiNews.author?.email || ''
  const authorType = authorEmail.includes('@student') || authorEmail.includes('student')
    ? 'student'
    : 'teacher'

  return {
    id: apiNews.id,
    title: apiNews.title,
    slug: apiNews.slug,
    content: apiNews.article_html || '',
    excerpt: apiNews.description || cleanContent.substring(0, 160) + '...',
    author: authorName,
    authorType: authorType,
    authorImage: undefined, // API doesn't provide avatar currently
    authorAvatar: undefined, // Alias for authorImage
    date: formatDate(apiNews.published_date || apiNews.created_at),
    submittedDate: formatDate(apiNews.created_at),
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
    reviewStatus: apiNews.review_status || 'pending',
    publishedDate: apiNews.published_date || '',
    deletedAt: apiNews.deleted_at,
    deletedBy: apiNews.deleted_by,
    // Co-authors and credits
    coAuthors: apiNews.co_authors?.map(ca => ca.co_author_name) || [],
    credits: apiNews.credits || '',
    articleJson: apiNews.article_json,
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
   * Submit news article for approval (sets review_status to pending)
   */
  async submit(id: string): Promise<void> {
    try {
      await apiClient.post<void>(`/news/${id}/submit`, {})
    } catch (error) {
      console.error('[newsApi.submit] Error:', error)
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
      // Call dedicated restore endpoint (Admin only)
      const response = await apiClient.patch<NewsApiResponse>(`/news/${id}/restore`, {})
      return mapApiNewsToFrontend(response)
    } catch (error) {
      console.error('[newsApi.restoreNews] Error:', error)
      throw error
    }
  },

  /**
   * Publish news article (authenticated - Advisers only)
   * Sets published_date to now and changes status to published
   * @param id Article ID
   * @param forceApprove If true, auto-approves pending articles when publishing
   */
  async publishNews(id: string, forceApprove: boolean = false): Promise<void> {
    try {
      const params = forceApprove ? '?forceApprove=true' : ''
      await apiClient.post(`/news/${id}/publish${params}`, {})
    } catch (error) {
      console.error('[newsApi.publishNews] Error:', error)
      throw error
    }
  },

  /**
   * Unpublish news article (authenticated - Advisers only)
   * Changes status from published back to draft
   */
  async unpublishNews(id: string): Promise<void> {
    try {
      await apiClient.post(`/news/${id}/unpublish`, {})
    } catch (error) {
      console.error('[newsApi.unpublishNews] Error:', error)
      throw error
    }
  },

  /**
   * Get review comments for a news article (authenticated)
   */
  async getReviewComments(newsId: string): Promise<ReviewComment[]> {
    try {
      const response = await apiClient.get<ReviewCommentApiResponse[]>(`/news/${newsId}/review-comments`)
      console.log('[newsApi.getReviewComments] Raw API response:', JSON.stringify(response, null, 2))
      return response.map(comment => {
        console.log('[newsApi.getReviewComments] Processing comment:', {
          id: comment.id,
          reviewer: comment.reviewer,
          full_name: comment.reviewer?.full_name,
          email: comment.reviewer?.email,
        })
        return {
          id: comment.id,
          author: comment.reviewer?.full_name || comment.reviewer?.email || 'Unknown',
          comment: comment.comment,
          timestamp: comment.created_at,
        }
      })
    } catch (error) {
      console.error('[newsApi.getReviewComments] Error:', error)
      throw error
    }
  },

  /**
   * Add a review comment to a news article (authenticated - Teachers/Admins only)
   */
  async addReviewComment(newsId: string, comment: string): Promise<ReviewComment> {
    try {
      const response = await apiClient.post<ReviewCommentApiResponse>(`/news/${newsId}/review-comments`, {
        comment,
      })
      console.log('[newsApi.addReviewComment] Raw API response:', JSON.stringify(response, null, 2))
      console.log('[newsApi.addReviewComment] Reviewer data:', {
        reviewer: response.reviewer,
        full_name: response.reviewer?.full_name,
        email: response.reviewer?.email,
      })
      return {
        id: response.id,
        author: response.reviewer?.full_name || response.reviewer?.email || 'Unknown',
        comment: response.comment,
        timestamp: response.created_at,
      }
    } catch (error) {
      console.error('[newsApi.addReviewComment] Error:', error)
      throw error
    }
  },

  /**
   * Update a review comment (authenticated - Owner only)
   */
  async updateReviewComment(commentId: string, comment: string): Promise<ReviewComment> {
    try {
      const response = await apiClient.patch<ReviewCommentApiResponse>(`/news/review-comments/${commentId}`, {
        comment,
      })
      return {
        id: response.id,
        author: response.reviewer?.full_name || response.reviewer?.email || 'Unknown',
        comment: response.comment,
        timestamp: response.created_at,
      }
    } catch (error) {
      console.error('[newsApi.updateReviewComment] Error:', error)
      throw error
    }
  },

  /**
   * Delete a review comment (authenticated - Owner or Admin)
   */
  async deleteReviewComment(commentId: string): Promise<void> {
    try {
      await apiClient.delete(`/news/review-comments/${commentId}`)
    } catch (error) {
      console.error('[newsApi.deleteReviewComment] Error:', error)
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
      const response = await apiClient.post<NewsApiResponse>(`/news/${id}/approve`, {
        remarks: message,
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
      const response = await apiClient.post<NewsApiResponse>(`/news/${id}/reject`, {
        remarks: reason,
      })
      return mapApiNewsToFrontend(response)
    } catch (error) {
      console.error('[newsApi.rejectNews] Error:', error)
      throw error
    }
  },

  /**
   * Quick update article status (Admin only)
   */
  async updateStatus(id: string, status: string): Promise<NewsArticle> {
    try {
      console.log(`[newsApi.updateStatus] Updating article ${id} status to ${status}`)
      const response = await apiClient.patch<NewsApiResponse>(`/news/${id}/status`, {
        status,
      })
      return mapApiNewsToFrontend(response)
    } catch (error) {
      console.error('[newsApi.updateStatus] Error:', error)
      throw error
    }
  },

  /**
   * Quick update article visibility (Admin only)
   */
  async updateVisibility(id: string, visibility: string): Promise<NewsArticle> {
    try {
      console.log(`[newsApi.updateVisibility] Updating article ${id} visibility to ${visibility}`)
      const response = await apiClient.patch<NewsApiResponse>(`/news/${id}/visibility`, {
        visibility,
      })
      return mapApiNewsToFrontend(response)
    } catch (error) {
      console.error('[newsApi.updateVisibility] Error:', error)
      throw error
    }
  },

  /**
   * Update article featured image (Admin only)
   */
  async updateFeaturedImage(id: string, featuredImageUrl: string): Promise<NewsArticle> {
    try {
      console.log(`[newsApi.updateFeaturedImage] Updating article ${id} featured image`)
      const response = await apiClient.patch<NewsApiResponse>(`/news/${id}/featured-image`, {
        featuredImageUrl,
      })
      return mapApiNewsToFrontend(response)
    } catch (error) {
      console.error('[newsApi.updateFeaturedImage] Error:', error)
      throw error
    }
  },

  /**
   * Remove article featured image (Admin only)
   */
  async removeFeaturedImage(id: string): Promise<NewsArticle> {
    try {
      console.log(`[newsApi.removeFeaturedImage] Removing featured image from article ${id}`)
      const response = await apiClient.delete<NewsApiResponse>(`/news/${id}/featured-image`)
      return mapApiNewsToFrontend(response)
    } catch (error) {
      console.error('[newsApi.removeFeaturedImage] Error:', error)
      throw error
    }
  },

  /**
   * Get news statistics (KPI counts)
   * @param all - Get all stats (admin only) instead of user-specific stats
   */
  async getNewsStats(all: boolean = false): Promise<{
    pendingReview: number
    published: number
    needsRevision: number
    approved: number
    rejected: number
    draft: number
    total: number
    studentSubmissions: number
  }> {
    try {
      const params = all ? '?all=true' : ''
      const response = await apiClient.get<{
        pendingReview: number
        published: number
        needsRevision: number
        approved: number
        rejected: number
        draft: number
        total: number
        studentSubmissions: number
      }>(`/news/stats${params}`)
      return response
    } catch (error) {
      console.error('[newsApi.getNewsStats] Error:', error)
      throw error
    }
  },

  /**
   * Get current user's own articles
   */
  async getMyArticles(): Promise<NewsArticle[]> {
    try {
      const response = await apiClient.get<NewsApiResponse[]>(`/news/my-articles`)
      return response.map(mapApiNewsToFrontend)
    } catch (error) {
      console.error('[newsApi.getMyArticles] Error:', error)
      throw error
    }
  },

  // ============================================
  // Journalism Team: Members & KPIs (Authenticated)
  // ============================================
  async getJournalismMembers(): Promise<Array<{ membershipId: string; userId: string; userName: string; userEmail: string; position: string }>> {
    try {
      return await apiClient.get('/journalism/members')
    } catch (error) {
      console.error('[newsApi.getJournalismMembers] Error:', error)
      throw error
    }
  },

  async getJournalismMember(userId: string): Promise<{ membershipId: string; userId: string; userName: string; userEmail: string; position: string }> {
    try {
      return await apiClient.get(`/journalism/members/${userId}`)
    } catch (error) {
      console.error('[newsApi.getJournalismMember] Error:', error)
      throw error
    }
  },

  async addJournalismMember(payload: { userId: string; position: string }): Promise<{ membershipId: string; userId: string; userName: string; userEmail: string; position: string }>
  {
    try {
      return await apiClient.post('/journalism/members', payload)
    } catch (error) {
      console.error('[newsApi.addJournalismMember] Error:', error)
      throw error
    }
  },

  async updateJournalismMember(userId: string, payload: { position: string }): Promise<{ userId: string; previousPosition: string; newPosition: string; updatedBy: string }>
  {
    try {
      return await apiClient.patch(`/journalism/members/${userId}`, payload)
    } catch (error) {
      console.error('[newsApi.updateJournalismMember] Error:', error)
      throw error
    }
  },

  async removeJournalismMember(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/journalism/members/${userId}`)
    } catch (error) {
      console.error('[newsApi.removeJournalismMember] Error:', error)
      throw error
    }
  },

  async getJournalismKpis(): Promise<{
    totalMembers: number;
    membersByPosition: { position: string; count: number }[];
    uniquePositionsOccupied: { adviser: boolean; editorInChief: boolean };
    activeContributors30d: number;
    pipelineBreakdown: { status: string; count: number }[];
    topContributors90d: { userId: string; name: string; count: number }[];
  }> {
    try {
      return await apiClient.get('/news/journalism/kpis')
    } catch (error) {
      console.error('[newsApi.getJournalismKpis] Error:', error)
      throw error
    }
  },

  /**
   * Get approval history for an article
   * Shows all approve/reject actions with remarks
   */
  async getApprovalHistory(articleId: string): Promise<ApprovalHistoryRecord[]> {
    try {
      console.log(`[newsApi.getApprovalHistory] Fetching approval history for article ${articleId}`)
      const response = await apiClient.get<ApprovalHistoryRecord[]>(`/news/${articleId}/approval-history`)
      return response
    } catch (error) {
      console.error('[newsApi.getApprovalHistory] Error:', error)
      throw error
    }
  },
}

export { NewsApiError }
