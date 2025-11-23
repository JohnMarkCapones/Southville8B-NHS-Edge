export interface NewsArticle {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  author: string | { id: string; email: string; full_name: string; name?: string; avatar?: string }
  authorImage?: string
  authorAvatar?: string
  authorType?: string
  date: string
  submittedDate?: string
  category: string | { id: string; name: string; slug: string }
  image?: string
  views: number
  likes: number
  comments: number
  shares: number
  featured: boolean
  trending: boolean
  readTime: string
  tags: string[]
  initialLikes: number
  avgRating: number
  totalRatings: number
  // Admin/backend fields
  status?: string
  visibility?: string
  reviewStatus?: string
  publishedDate?: string
  deletedAt?: string | null
  deletedBy?: string | null
  // Co-authors and credits
  coAuthors?: string[]
  credits?: string
  articleJson?: any
}

export interface NewsCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
}

export interface NewsComment {
  id: string
  author: string
  avatar?: string
  content: string
  date: string
  likes: number
  replies: number
}

export interface NewsListParams {
  categoryId?: string
  limit?: number
  offset?: number
  search?: string
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending'
}

export interface NewsListResponse {
  data: NewsArticle[]
  total: number
  limit: number
  offset: number
}
