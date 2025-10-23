import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { JsonLd, buildBreadcrumbListSchema } from "@/components/seo/jsonld"
import { absoluteUrl } from "@/lib/seo"
import AnnouncementDetailClient from "./client-page"

// Map backend announcement to frontend format
function mapAnnouncementToFrontend(item: any) {
  const excerpt = item.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
  
  return {
    id: item.id,
    title: item.title,
    excerpt,
    content: item.content,
    category: item.type as 'urgent' | 'academic' | 'event' | 'general',
    date: item.createdAt,
    author: { name: item.user?.full_name || 'Unknown' },
    source: 'Southville 8B NHS',
    sticky: false,
    slug: item.id,
    tags: item.tags?.map((tag: any) => tag.name) || [],
    attachments: [], // Backend doesn't have attachments yet
  }
}

async function getAnnouncementById(id: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'
  const res = await fetch(`${apiUrl}/api/v1/announcements/${id}`, {
    next: { revalidate: 3600 },
  })
  
  if (!res.ok) {
    return null
  }
  
  const data = await res.json()
  return mapAnnouncementToFrontend(data)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const announcement = await getAnnouncementById(slug)
  
  if (!announcement) {
    return {
      title: "Announcement Not Found | Southville 8B NHS",
      robots: { index: false, follow: false },
    }
  }

  const title = `${announcement.title} | Announcements`
  const description = announcement.excerpt || "Official school announcement."
  const path = `/guess/announcements/${announcement.slug}`

  const ogUrl = `${path}`
  const ogImage = `/api/og?title=${encodeURIComponent(announcement.title)}&subtitle=${encodeURIComponent(
    "Southville 8B NHS"
  )}`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: ogUrl,
      type: "article",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const announcement = await getAnnouncementById(slug)
  
  if (!announcement) {
    notFound()
  }

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListSchema([
          { name: "Home", url: absoluteUrl("/") },
          { name: "Announcements", url: absoluteUrl("/guess/announcements") },
          { name: announcement.title, url: absoluteUrl(`/guess/announcements/${announcement.slug}`) },
        ])}
      />
      <AnnouncementDetailClient announcement={announcement} />
    </>
  )
}

// Enable ISR for announcement details
export const dynamic = "force-dynamic"
export const revalidate = 3600 // revalidate hourly
