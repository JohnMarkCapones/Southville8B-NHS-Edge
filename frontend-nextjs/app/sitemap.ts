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
  "/guess/announcements",
  "/guess/event",
  "/guess/enrollment",
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

  // Dynamically include known event detail routes
  const eventSlugs = [
    "spring-musical-hamilton",
    "state-basketball-championship",
    "science-fair-2024",
    "graduation-ceremony-2024",
    "senior-prom-2024",
    "robotics-competition",
  ]

  // Known announcement slugs (could be generated from a data source)
  const announcementSlugs = [
    "early-application-extended",
    "science-olympiad-championship",
    "hamilton-musical-tickets",
    "stem-lab-opening",
    "parent-teacher-conferences",
    "national-merit-semifinalists",
    "spring-sports-tryouts",
    "college-fair",
  ]

  const entries: MetadataRoute.Sitemap = [
    ...publicPaths.map((path) => ({
      url: `${base}${path}`,
      lastModified: now as unknown as Date,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.6,
    })),
    ...eventSlugs.map((slug) => ({
      url: `${base}/guess/event/${slug}`,
      lastModified: now as unknown as Date,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...announcementSlugs.map((slug) => ({
      url: `${base}/guess/announcements/${slug}`,
      lastModified: now as unknown as Date,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]

  return entries
}
