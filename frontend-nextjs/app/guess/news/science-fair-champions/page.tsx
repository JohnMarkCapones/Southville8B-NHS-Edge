import type { Metadata } from "next"
import { JsonLd, buildBreadcrumbListSchema } from "@/components/seo/jsonld"
import { absoluteUrl } from "@/lib/seo"
import ClientPage from "./client-page"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"

export async function generateMetadata(): Promise<Metadata> {
  const title = "Science Fair Champions Advance to Nationals | News"
  const description =
    "Our students' innovative STEM projects earned top honors at state and advance to the national championship."
  const path = "/guess/news/science-fair-champions"
  const ogImage = `/api/og?title=${encodeURIComponent(
    "Science Fair Champions Advance to Nationals",
  )}&subtitle=${encodeURIComponent("Southville 8B NHS")}`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "article",
      images: [{ url: ogImage }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  }
}

export default function ScienceFairChampionsPage() {
  const articleUrl = absoluteUrl("/guess/news/science-fair-champions")
  const published = "2024-02-15"
  const title = "Science Fair Champions Advance to Nationals"
  const description =
    "Our students' innovative STEM projects earned top honors at state and advance to the national championship."

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: published,
    dateModified: published,
    author: { "@type": "Person", name: "Dr. Sarah Chen" },
    mainEntityOfPage: articleUrl,
  }

  const breadcrumbs = buildBreadcrumbListSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "News", url: absoluteUrl("/guess/news") },
    { name: title, url: articleUrl },
  ])

  return (
    <>
      <JsonLd data={[articleJsonLd, breadcrumbs]} />
      <div className="container mx-auto px-4 pt-4">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "News", href: "/guess/news" },
          ]}
          current={title}
        />
      </div>
      <ClientPage />
    </>
  )
}
