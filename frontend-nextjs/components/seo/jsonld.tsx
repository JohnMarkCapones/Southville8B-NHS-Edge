import React from "react"

type Json = Record<string, any>

export function JsonLd({ data, id }: { data: Json | Json[]; id?: string }) {
  const json = Array.isArray(data) ? data : [data]
  return (
    <script
      type="application/ld+json"
      {...(id ? { id } : {})}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}

export function buildOrganizationSchema({
  name,
  url,
  logo,
  sameAs,
}: {
  name: string
  url: string
  logo: string
  sameAs?: string[]
}) {
  const schema: Json = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
  }
  if (sameAs && sameAs.length) schema.sameAs = sameAs
  return schema
}

export function buildWebSiteSchema({
  url,
  name,
}: {
  url: string
  name: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url,
    name,
  }
}

export function buildBreadcrumbListSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
