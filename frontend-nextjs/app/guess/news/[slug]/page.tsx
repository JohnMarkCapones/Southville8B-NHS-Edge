import type { Metadata } from "next"
import { JsonLd, buildBreadcrumbListSchema } from "@/components/seo/jsonld"
import { absoluteUrl } from "@/lib/seo"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import ClientPage from "./client-page"
import { findNewsBySlugFromAPI } from "../data-mapping"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await findNewsBySlugFromAPI(slug)

  if (!article) {
    return {
      title: "News Article Not Found | News",
      description: "The news article you're looking for does not exist.",
      robots: { index: false, follow: false },
    }
  }

  const path = `/guess/news/${article.slug}`
  const fullUrl = absoluteUrl(path)
  const title = article.title // Use clean title for OG (without suffix for better preview)
  const ogTitle = `${article.title} | Southville 8B NHS News` // Full title for page
  // Ensure description is at least 100 characters for better Facebook preview
  const rawDescription = article.excerpt || article.content.replace(/<[^>]*>/g, '').trim()
  const description = rawDescription.length > 100 
    ? rawDescription.substring(0, 200).trim() + (rawDescription.length > 200 ? '...' : '')
    : rawDescription || 'Read the latest news from Southville 8B National High School'
  
  // Use article image if available, otherwise use OG image generator
  // Ensure image URL is absolute (handles both relative paths and full URLs)
  // Filter out data URIs (base64) - Facebook doesn't support them for OG images
  const hasValidImage = article.image && 
    !article.image.startsWith('data:') && 
    !article.image.includes('placeholder');
  
  const imageUrl: string = hasValidImage
    ? (article.image!.startsWith('http://') || article.image!.startsWith('https://') 
        ? article.image! 
        : absoluteUrl(article.image!))
    : absoluteUrl(`/api/og?title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent(
      `Published: ${new Date(article.date).toLocaleDateString()}`,
    )}`)

  // Get author name
  const authorName = typeof article.author === 'string' 
    ? article.author 
    : article.author?.name || 'Southville 8B NHS'

  // Get category
  const category = typeof article.category === 'string' 
    ? article.category 
    : (article.category && typeof article.category === 'object' && 'name' in article.category)
      ? (article.category as { name: string }).name
      : 'News'

  return {
    title: ogTitle,
    description,
    alternates: { canonical: fullUrl },
    openGraph: {
      type: 'article',
      locale: 'en_US',
      title, // Use clean title without suffix for better preview
      description,
      url: fullUrl,
      siteName: 'Southville 8B National High School',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
          type: 'image/jpeg', // Help Facebook understand the image type
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
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await findNewsBySlugFromAPI(slug)

  if (!article) {
    notFound()
  }

  const breadcrumbs = buildBreadcrumbListSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "News", url: absoluteUrl("/guess/news") },
    { name: article.title, url: absoluteUrl(`/guess/news/${slug}`) },
  ])

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Person",
      name: article.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Southville 8B NHS",
    },
    image: article.image ? [absoluteUrl(article.image)] : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/guess/news/${slug}`),
    },
  }

  return (
    <>
      <JsonLd data={[breadcrumbs, articleJsonLd]} />
      <div className="container mx-auto px-4 pt-4">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "News", href: "/guess/news" },
          ]}
          current={article.title}
        />
      </div>
      <ClientPage article={article} />
    </>
  )
}

export const revalidate = 3600
export const dynamic = "force-dynamic"
