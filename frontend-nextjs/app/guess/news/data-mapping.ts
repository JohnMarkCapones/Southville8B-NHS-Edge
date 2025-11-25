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
  coAuthors?: string[];
  credits?: string;
}

export interface BackendNews {
  id: string;
  title: string;
  slug: string;
  author_id: string;
  author_name?: string;
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
  co_authors?: Array<{
    id: string;
    co_author_name: string;
    role?: string;
  }>;
  credits?: string;
}

/**
 * Map backend news article to frontend format
 */
export function mapBackendNewsToFrontend(backendNews: BackendNews): NewsArticle {
  // Extract excerpt from HTML content (strip HTML tags)
  const cleanContent = backendNews.article_html?.replace(/<[^>]*>/g, '') || '';
  const excerpt = backendNews.description || (cleanContent.substring(0, 200) + (cleanContent.length > 200 ? '...' : ''));

  // Generate read time estimate (average 200 words per minute)
  const wordCount = cleanContent.split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const readTime = `${readTimeMinutes} min read`;

  // Map category
  const category = backendNews.category?.name || 'General';

  // Determine if featured (for now, we'll use views as a proxy)
  const featured = backendNews.views > 2000;
  const trending = backendNews.views > 1500;

  // Get author name with proper fallback chain
  const authorName = backendNews.author_name || backendNews.author?.full_name || 'Unknown Author';

  return {
    id: backendNews.id,
    title: backendNews.title,
    slug: backendNews.slug,
    excerpt: excerpt,
    content: backendNews.article_html || '',
    author: {
      name: authorName,
      email: backendNews.author?.email,
    },
    date: backendNews.published_date || backendNews.created_at,
    category: category,
    // Filter out data URIs (base64) - they don't work for OG images
    // Only use actual HTTP/HTTPS URLs or local paths
    image: (backendNews.featured_image_url && !backendNews.featured_image_url.startsWith('data:'))
      ? backendNews.featured_image_url
      : '/placeholder.svg?height=400&width=600&text=News',
    readTime: readTime,
    views: backendNews.views,
    featured: featured,
    trending: trending,
    tags: backendNews.tags?.map(t => t.tag.name) || [],
    coAuthors: backendNews.co_authors?.map(ca => ca.co_author_name) || [],
    credits: backendNews.credits || undefined,
  };
}

/**
 * Fetch news articles from the API
 * Only fetches articles that are published and approved
 */
export async function fetchNewsFromAPI(): Promise<NewsArticle[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

  try {
    const res = await fetch(`${apiUrl}/api/v1/news/public?limit=20`, {
      cache: 'no-store', // Disable caching for now to see real-time data
    });

    if (!res.ok) {
      console.error('Failed to fetch news from API:', res.status, res.statusText);
      return [];
    }

    const json = await res.json();
    
    // Handle both single object and array responses
    const data: BackendNews[] = Array.isArray(json) ? json : [json];

    // Filter to only show published and approved articles
    const publishedAndApproved = data.filter(article =>
      article.status === 'published' || article.status === 'approved'
    );

    return publishedAndApproved.map(mapBackendNewsToFrontend);
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
 * Returns published and approved news sorted by views
 */
export async function fetchFeaturedNewsFromAPI(): Promise<NewsArticle[]> {
  const allNews = await fetchNewsFromAPI();

  // Sort by views (descending) to show most popular first
  const sortedNews = allNews.sort((a, b) => (b.views || 0) - (a.views || 0));

  // Return top 3 articles, prioritizing featured ones
  const featured = sortedNews.filter(article => article.featured);

  // If we have featured articles, return those, otherwise return top 3 by views
  if (featured.length >= 3) {
    return featured.slice(0, 3);
  } else if (featured.length > 0) {
    // If we have some featured but not enough, fill with non-featured
    const nonFeatured = sortedNews.filter(article => !article.featured);
    return [...featured, ...nonFeatured].slice(0, 3);
  } else {
    // No featured articles, just return top 3 by views
    return sortedNews.slice(0, 3);
  }
}

/**
 * Fetch trending news articles
 */
export async function fetchTrendingNewsFromAPI(): Promise<NewsArticle[]> {
  const allNews = await fetchNewsFromAPI();
  return allNews.filter(article => article.trending).slice(0, 5);
}
