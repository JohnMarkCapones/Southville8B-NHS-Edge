import type { Metadata } from "next"
import Link from "next/link"
import { absoluteUrl } from "@/lib/seo"
import { JsonLd, buildBreadcrumbListSchema } from "@/components/seo/jsonld"
import { fetchEventsFromAPI } from "./data-mapping"
import { EVENTS } from "./[slug]/data"

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
    events = await fetchEventsFromAPI()
    // If API returns empty array, use static data as fallback
    if (events.length === 0) {
      events = EVENTS
    }
  } catch (error) {
    console.error('Failed to fetch events from API, using static data:', error)
    events = EVENTS
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <JsonLd data={[breadcrumbs]} />
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Events</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Explore upcoming and featured events across arts, sports, academics, and more.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((e) => (
          <Link key={e.id} href={`/guess/event/${e.slug}`} className="group block border rounded-xl p-5 hover:shadow-lg transition">
            <div className="text-sm text-muted-foreground">{new Date(e.date).toLocaleDateString()} • {e.time}</div>
            <div className="mt-2 font-semibold text-lg group-hover:underline">{e.title}</div>
            <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{e.description}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Revalidate Events index hourly
export const revalidate = 3600
export const dynamic = "force-dynamic"
