import type { Metadata } from "next"
import HomePage from "@/components/home/home-page"
import { JsonLd, buildOrganizationSchema, buildWebSiteSchema } from "@/components/seo/jsonld"
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo"

export async function generateMetadata(): Promise<Metadata> {
  const title = DEFAULT_TITLE
  const description = DEFAULT_DESCRIPTION
  const url = "/"
  const image = `/api/og?title=${encodeURIComponent(DEFAULT_TITLE)}&subtitle=${encodeURIComponent(
    "Southville 8B NHS"
  )}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}

export default function Page() {
  const org = buildOrganizationSchema({
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/design-mode/image.png`,
  })
  const website = buildWebSiteSchema({ url: SITE_URL, name: SITE_NAME })

  return (
    <>
      <JsonLd id="org-jsonld" data={org} />
      <JsonLd id="website-jsonld" data={website} />
      <HomePage />
    </>
  )
}
