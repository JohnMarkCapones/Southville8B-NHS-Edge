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
  address,
  alternateName,
}: {
  name: string
  url: string
  logo: string
  sameAs?: string[]
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
    addressSubregion?: string // optional extension for barangay if desired
  }
  alternateName?: string[]
}) {
  const schema: Json = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
  }
  if (sameAs && sameAs.length) schema.sameAs = sameAs
  if (address) {
    const {
      streetAddress,
      addressLocality,
      addressRegion,
      postalCode,
      addressCountry,
      addressSubregion,
    } = address
    schema.address = {
      "@type": "PostalAddress",
      ...(streetAddress ? { streetAddress } : {}),
      ...(addressLocality ? { addressLocality } : {}),
      ...(addressRegion ? { addressRegion } : {}),
      ...(postalCode ? { postalCode } : {}),
      ...(addressCountry ? { addressCountry } : {}),
      // Non-standard: Google typically ignores subregion/barangay; include only if helpful
      ...(addressSubregion ? { addressSubregion } : {}),
    }
  }
  if (alternateName && alternateName.length) schema.alternateName = alternateName
  return schema
}

export function buildWebSiteSchema({
  url,
  name,
  searchTarget,
}: {
  url: string
  name: string
  /** Full URL template for site search, e.g. https://example.com/search?q={search_term_string} */
  searchTarget?: string
}) {
  const schema: Json = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url,
    name,
  }

  if (searchTarget) {
    schema.potentialAction = {
      "@type": "SearchAction",
      target: searchTarget,
      "query-input": "required name=search_term_string",
    }
  }

  return schema
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
