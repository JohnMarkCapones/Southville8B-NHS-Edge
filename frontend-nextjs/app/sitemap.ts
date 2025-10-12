import type { MetadataRoute } from "next"

// Basic sitemap; extend as routes grow. Exclude private app areas.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://southville8bnhs.com"

  // Known public routes (expand as needed)
  const publicPaths = [
    "/",
    "/guess/academics",
    "/guess/student-life",
    "/guess/athletics",
    "/guess/news-events",
    "/guess/news",
    "/guess/news/science-fair-champions",
    "/guess/gallery",
    "/guess/library",
    "/guess/virtual-tour",
    "/guess/leaderboard",
    "/guess/portal",
    "/guess/contact",
    "/guess/terms",
    "/guess/privacy",
    "/guess/enhanced-nav-demo",
    "/guess/mobile-app",
    "/maintenance",
  ]

  const now = new Date().toISOString()

  return publicPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.6,
  }))
}
