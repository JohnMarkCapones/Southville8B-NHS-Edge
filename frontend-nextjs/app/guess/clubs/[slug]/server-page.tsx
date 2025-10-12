import type { Metadata } from "next"
import { JsonLd, buildBreadcrumbListSchema } from "@/components/seo/jsonld"
import { absoluteUrl } from "@/lib/seo"

// Minimal club data accessor using the client module's object shape without importing React
// We avoid importing the client page to keep this file server-safe.
// Note: For now, we duplicate slugs and names for metadata; consider centralizing later.
const CLUBS: Array<{ slug: string; name: string; description: string }> = [
  {
    slug: "math-club",
    name: "Math Club",
    description:
      "Explore advanced mathematical concepts, compete in competitions, and develop problem-solving skills.",
  },
  {
    slug: "science-club",
    name: "Science Club",
    description: "Hands-on experiments, science fair preparation, and exploration of science disciplines.",
  },
  {
    slug: "robotics-club",
    name: "Robotics Club",
    description: "Design, build, and program robots for competitions and learn engineering principles.",
  },
  {
    slug: "debate-team",
    name: "Debate Team",
    description: "Develop critical thinking and public speaking through competitive debate.",
  },
  {
    slug: "model-un",
    name: "Model United Nations",
    description: "Simulate UN proceedings, debate global issues, and develop diplomatic skills.",
  },
]

function getClub(slug: string) {
  return CLUBS.find((c) => c.slug === slug)
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const club = getClub(params.slug)
  if (!club) {
    return {
      title: "Club Not Found | Clubs",
      description: "The club you’re looking for does not exist.",
      robots: { index: false, follow: false },
    }
  }

  const path = `/guess/clubs/${club.slug}`
  const title = `${club.name} | Clubs`
  const description = club.description
  const ogImage = `/api/og?title=${encodeURIComponent(club.name)}&subtitle=${encodeURIComponent("Southville 8B NHS")}`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, images: [{ url: ogImage }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  }
}

export default function ClubsSlugServerPage({ params }: { params: { slug: string } }) {
  const club = getClub(params.slug)

  const breadcrumbs = buildBreadcrumbListSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Clubs", url: absoluteUrl("/guess/clubs") },
    { name: club ? club.name : "Club", url: absoluteUrl(`/guess/clubs/${params.slug}`) },
  ])

  const creativeWork = club
    ? {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: club.name,
        description: club.description,
        url: absoluteUrl(`/guess/clubs/${club.slug}`),
      }
    : undefined

  return <JsonLd data={creativeWork ? [breadcrumbs, creativeWork] : [breadcrumbs]} />
}