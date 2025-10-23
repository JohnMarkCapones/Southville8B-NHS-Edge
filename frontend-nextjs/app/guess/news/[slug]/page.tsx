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
  const title = `${article.title} | News`
  const description = article.excerpt || article.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
  const ogImage = `/api/og?title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent(
    `Published: ${new Date(article.date).toLocaleDateString()}`,
  )}`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, images: [{ url: ogImage }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
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
