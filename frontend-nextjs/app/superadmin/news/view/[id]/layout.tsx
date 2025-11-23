import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/seo"

// Server-side function to fetch news by ID
async function getNewsById(id: string) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/news/${id}`,
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

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    // Map the API response to our format
    const article = {
      id: data.id,
      title: data.title,
      slug: data.slug,
      content: data.article_html || '',
      excerpt: data.description || '',
      author: data.author?.full_name || data.author_name || 'Unknown Author',
      date: data.published_date || data.created_at,
      category: data.category?.name || 'News',
      image: data.featured_image_url,
      tags: data.tags?.map((t: any) => t.tag?.name || t.name) || [],
    }

    return article
  } catch (error) {
    console.error('Error fetching news by ID:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  
  try {
    const article = await getNewsById(id)

    if (!article) {
      return {
        title: "News Article Not Found | News",
        description: "The news article you're looking for does not exist.",
        robots: { index: false, follow: false },
      }
    }

    const path = `/superadmin/news/view/${article.id}`
    const fullUrl = absoluteUrl(path)
    const title = `${article.title} | Southville 8B NHS News`
    const description = article.excerpt || article.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
    
    // Use article image if available, otherwise use OG image generator
    const imageUrl = article.image 
      ? absoluteUrl(article.image)
      : absoluteUrl(`/api/og?title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent(
        `Published: ${new Date(article.date).toLocaleDateString()}`,
      )}`)

    // Get author name
    const authorName = typeof article.author === 'string' 
      ? article.author 
      : article.author?.full_name || article.author?.name || 'Southville 8B NHS'

    // Get category
    const category = typeof article.category === 'string' 
      ? article.category 
      : article.category?.name || 'News'

    return {
      title,
      description,
      alternates: { canonical: fullUrl },
      robots: { index: false, follow: false }, // Admin pages shouldn't be indexed
      openGraph: {
        type: 'article',
        title,
        description,
        url: fullUrl,
        siteName: 'Southville 8B National High School',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: article.title,
          }
        ],
        publishedTime: article.date,
        authors: [authorName],
        section: category,
        tags: article.tags || [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
        creator: authorName,
      },
    }
  } catch (error) {
    return {
      title: "News Article | Southville 8B NHS",
      description: "Read the latest news from Southville 8B National High School",
      robots: { index: false, follow: false },
    }
  }
}

export default function SuperAdminNewsViewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

