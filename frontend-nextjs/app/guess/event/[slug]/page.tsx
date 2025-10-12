import type { Metadata } from "next"
import { JsonLd, buildBreadcrumbListSchema } from "@/components/seo/jsonld"
import { absoluteUrl } from "@/lib/seo"
import { findEventBySlug } from "./data"
import ClientPage from "./ui-client"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event = findEventBySlug(slug)
  if (!event) {
    return {
      title: "Event Not Found | Events",
      description: "The event you’re looking for does not exist.",
      robots: { index: false, follow: false },
    }
  }

  const path = `/guess/event/${event.slug}`
  const title = `${event.title} | Events`
  const description = event.description
  const ogImage = `/api/og?title=${encodeURIComponent(event.title)}&subtitle=${encodeURIComponent(
    `${event.location} • ${new Date(event.date).toLocaleDateString()}`,
  )}`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, images: [{ url: ogImage }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  }
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = findEventBySlug(slug)

  const breadcrumbs = buildBreadcrumbListSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Events", url: absoluteUrl("/guess/event") },
    { name: event ? event.title : "Event", url: absoluteUrl(`/guess/event/${slug}`) },
  ])

  const eventJsonLd = event
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        description: event.fullDescription || event.description,
        startDate: event.date,
        endDate: event.date,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: event.location,
          address: event.location,
        },
        organizer: {
          "@type": "Organization",
          name: event.organizer,
          email: event.organizerContact,
          telephone: event.organizerPhone,
        },
        offers: event.price
          ? {
              "@type": "Offer",
              price: event.price.replace(/[^0-9.]/g, ""),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: absoluteUrl(`/guess/event/${event.slug}`),
            }
          : undefined,
        image: event.image ? [absoluteUrl(event.image)] : undefined,
        performer: event.category ? [{ "@type": "PerformingGroup", name: event.category }] : undefined,
      }
    : undefined

  return (
    <>
      <JsonLd data={eventJsonLd ? [breadcrumbs, eventJsonLd] : [breadcrumbs]} />
      <div className="container mx-auto px-4 pt-4">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Events", href: "/guess/event" },
          ]}
          current={event ? event.title : "Event"}
        />
      </div>
      <ClientPage params={{ slug }} />
    </>
  )
}

// Revalidate event detail pages hourly
export const revalidate = 3600
