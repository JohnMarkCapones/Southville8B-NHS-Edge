import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/seo"
import { newsApi } from "@/lib/api/endpoints/news"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const article = await newsApi.getNewsBySlug(slug)

    if (!article) {
      return {
        title: "News Article Not Found | News",
        description: "The news article you're looking for does not exist.",
        robots: { index: false, follow: false },
      }
    }

    const path = `/student/news/${article.slug}`
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
    }
  }
}

export default function NewsArticleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

