import type { Metadata } from "next"
import { JsonLd, buildBreadcrumbListSchema } from "@/components/seo/jsonld"
import { absoluteUrl } from "@/lib/seo"
import { findClubBySlugFromAPI } from "../data-mapping"
import { notFound } from "next/navigation"
import ClientPage from "./client-page"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  
  let club
  try {
    club = await findClubBySlugFromAPI(slug)
  } catch (error) {
    console.error('Failed to fetch club from API for metadata:', error)
  }
  
  if (!club) {
    return {
      title: "Club Not Found | Clubs",
      description: "The club you're looking for does not exist.",
      robots: { index: false, follow: false },
    }
  }

  const path = `/guess/clubs/${club.slug}`
  const title = `${club.name} | Student Clubs`
  const description = club.description

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { 
      title, 
      description, 
      url: path, 
      images: [{ 
        url: `/api/og?title=${encodeURIComponent(club.name)}&subtitle=${encodeURIComponent('Student Club')}` 
      }] 
    },
    twitter: { 
      card: "summary_large_image", 
      title, 
      description, 
      images: [`/api/og?title=${encodeURIComponent(club.name)}&subtitle=${encodeURIComponent('Student Club')}`] 
    },
  }
}

export default async function ClubDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  let club
  try {
    club = await findClubBySlugFromAPI(slug)
  } catch (error) {
    console.error('Failed to fetch club from API:', error)
  }

  if (!club) {
    notFound()
  }

  const breadcrumbs = buildBreadcrumbListSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Clubs", url: absoluteUrl("/guess/clubs") },
    { name: club.name, url: absoluteUrl(`/guess/clubs/${club.slug}`) },
  ])

  const clubJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: club.name,
    description: club.description,
    url: absoluteUrl(`/guess/clubs/${club.slug}`),
    memberOf: {
      "@type": "Organization",
      name: "Southville 8B National High School"
    },
    ...(club.adviser && {
      employee: {
        "@type": "Person",
        name: club.adviser.name,
        jobTitle: club.adviser.title,
        email: club.adviser.email
      }
    })
  }

  return (
    <>
      <JsonLd data={[breadcrumbs, clubJsonLd]} />
      <ClientPage club={club} />
    </>
  )
}

export const revalidate = 3600
export const dynamic = "force-dynamic"