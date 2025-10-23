export const dynamic = "force-static"
export const revalidate = 86400
import type { Metadata } from "next"
import AboutPageClient from "./AboutPageClient"
import { JsonLd, buildBreadcrumbListSchema } from "@/components/seo/jsonld"
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Southville 8B National High School in Rodriguez, Rizal — our history, mission, achievements, and the teachers who lead our learners.",
  alternates: { canonical: "/guess/about" },
  openGraph: {
    title: "About Us",
    description:
      "Learn about Southville 8B National High School in Rodriguez, Rizal — our history, mission, achievements, and the teachers who lead our learners.",
    url: "/guess/about",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us",
    description:
      "Learn about Southville 8B National High School in Rodriguez, Rizal — our history, mission, achievements, and the teachers who lead our learners.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function AboutPage() {
  const breadcrumb = buildBreadcrumbListSchema([
    { name: "Home", url: SITE_URL + "/" },
    { name: "About", url: SITE_URL + "/guess/about" },
  ])
  
  return (
    <>
      <JsonLd id="breadcrumb-about" data={breadcrumb} />
      <AboutPageClient />
    </>
  )
}
