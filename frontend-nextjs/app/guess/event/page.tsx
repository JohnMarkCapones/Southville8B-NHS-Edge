import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/seo"
import { JsonLd, buildBreadcrumbListSchema } from "@/components/seo/jsonld"
import { getEvents } from "@/lib/api/endpoints/events"
import { EVENTS } from "./[slug]/data"
import EventsPageClient from "./page-client"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"

export const metadata: Metadata = {
  title: "Events | Southville 8B NHS",
  description: "Discover upcoming events at Southville 8B NHS — performances, sports, academics, and more.",
  alternates: { canonical: "/guess/event" },
  openGraph: {
    title: "Events | Southville 8B NHS",
    description: "Discover upcoming events at Southville 8B NHS.",
    url: "/guess/event",
  },
  twitter: { card: "summary_large_image", title: "Events | Southville 8B NHS" },
}

export default async function EventsIndexPage() {
  const breadcrumbs = buildBreadcrumbListSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Events", url: absoluteUrl("/guess/event") },
  ])

  // Try to fetch from API, fallback to static data
  let events
  try {
    const response = await getEvents({
      page: 1,
      limit: 100,
      status: 'published',
      visibility: 'public'
    })
    events = response.data
    // If API returns empty array, use static data as fallback
    if (events.length === 0) {
      events = EVENTS
    }
  } catch (error) {
    console.error('Failed to fetch events from API, using static data:', error)
    events = EVENTS
  }

  return (
    <>
      <JsonLd data={[breadcrumbs]} />
      <div className="container mx-auto px-4 pt-4">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
          ]}
          current="Events"
        />
      </div>
      <EventsPageClient initialEvents={events} />
    </>
  )
}

// Revalidate Events index hourly
export const revalidate = 3600
export const dynamic = "force-dynamic"
