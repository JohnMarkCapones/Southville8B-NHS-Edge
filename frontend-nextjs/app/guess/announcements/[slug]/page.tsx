import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAnnouncementBySlug, announcementsData } from "@/lib/announcements-data"
import { JsonLd, buildBreadcrumbListSchema } from "@/components/seo/jsonld"
import { absoluteUrl } from "@/lib/seo"
import AnnouncementDetailClient from "./client-page"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const announcement = getAnnouncementBySlug(slug)
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

// Server component: no client-only UI or icon config here

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const announcement = getAnnouncementBySlug(slug)
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
      <AnnouncementDetailClient params={{ slug }} />
    </>
  )
}

// Enable full static generation with ISR for announcement details
export const dynamic = "force-static"
export const revalidate = 86400 // revalidate daily

export function generateStaticParams() {
  return announcementsData.map((a) => ({ slug: a.slug }))
}
