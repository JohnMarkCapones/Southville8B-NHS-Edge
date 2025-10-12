import type { MetadataRoute } from "next"

// Disallow non-public application areas; allow guess/public sections and root
export default function robots(): MetadataRoute.Robots {
  const base = "https://southville8bnhs.com"
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/guess"],
        disallow: [
          "/admin",
          "/superadmin",
          "/teacher",
          "/student",
          "/api",
          "/_next",
          "/private",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
