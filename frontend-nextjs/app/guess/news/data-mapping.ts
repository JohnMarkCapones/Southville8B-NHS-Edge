// News data mapping functions for API integration
// Maps backend news data to frontend format

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    email?: string;
  };
  date: string;
  category: string;
  image?: string;
  readTime: string;
  views?: number;
  featured?: boolean;
  trending?: boolean;
  tags?: string[];
}

export interface BackendNews {
  id: string;
  title: string;
  slug: string;
  author_id: string;
  domain_id?: string;
  article_html: string;
  description: string;
  featured_image_url?: string;
  category_id?: string;
  status: string;
  visibility: string;
  published_date?: string;
  views: number;
  created_at: string;
  updated_at: string;
  // Related data (from joins)
  author?: {
    id: string;
    full_name: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags?: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

/**
 * Map backend news article to frontend format
 */
export function mapBackendNewsToFrontend(backendNews: BackendNews): NewsArticle {
  // Extract excerpt from HTML content (strip HTML tags)
  const cleanContent = backendNews.article_html?.replace(/<[^>]*>/g, '') || '';
  const excerpt = cleanContent.substring(0, 200) + (cleanContent.length > 200 ? '...' : '');
  
  // Generate read time estimate (average 200 words per minute)
  const wordCount = cleanContent.split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const readTime = `${readTimeMinutes} min read`;
  
  // Map category
  const category = backendNews.category?.name || 'General';
  
  // Determine if featured (for now, we'll use views as a proxy)
  const featured = backendNews.views > 2000;
  const trending = backendNews.views > 1500;
  
  return {
    id: backendNews.id,
    title: backendNews.title,
    slug: backendNews.slug,
    excerpt: excerpt,
    content: backendNews.article_html || '',
    author: {
      name: backendNews.author?.full_name || 'Unknown Author',
      email: backendNews.author?.email,
    },
    date: backendNews.published_date || backendNews.created_at,
    category: category,
    image: backendNews.featured_image_url || '/placeholder.svg?height=400&width=600&text=News',
    readTime: readTime,
    views: backendNews.views,
    featured: featured,
    trending: trending,
    tags: backendNews.tags?.map(t => t.tag.name) || [],
  };
}

/**
 * Fetch news articles from the API
 */
export async function fetchNewsFromAPI(): Promise<NewsArticle[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
  
  try {
    const res = await fetch(`${apiUrl}/api/v1/news/public?limit=20`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error('Failed to fetch news from API:', res.status, res.statusText);
      return [];
    }

    const data: BackendNews[] = await res.json();
    return data.map(mapBackendNewsToFrontend);
  } catch (error) {
    console.error('Error fetching news from API:', error);
    return [];
  }
}

/**
 * Fetch a specific news article by slug from the API
 */
export async function findNewsBySlugFromAPI(slug: string): Promise<NewsArticle | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
  
  try {
    const res = await fetch(`${apiUrl}/api/v1/news/public/slug/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`Failed to fetch news by slug ${slug} from API:`, res.status, res.statusText);
      return null;
    }

    const data: BackendNews = await res.json();
    return mapBackendNewsToFrontend(data);
  } catch (error) {
    console.error(`Error fetching news by slug ${slug} from API:`, error);
    return null;
  }
}

/**
 * Fetch featured news articles (high views or manually marked)
 */
export async function fetchFeaturedNewsFromAPI(): Promise<NewsArticle[]> {
  const allNews = await fetchNewsFromAPI();
  return allNews.filter(article => article.featured).slice(0, 3);
}

/**
 * Fetch trending news articles
 */
export async function fetchTrendingNewsFromAPI(): Promise<NewsArticle[]> {
  const allNews = await fetchNewsFromAPI();
  return allNews.filter(article => article.trending).slice(0, 5);
}
