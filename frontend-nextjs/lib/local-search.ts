import { announcementsData } from "@/lib/announcements-data"
import { EVENTS } from "@/app/guess/event/[slug]/data"

export type SearchResult =
  | { type: "announcement"; title: string; excerpt: string; url: string; date?: string }
  | { type: "event"; title: string; excerpt: string; url: string; date?: string }

export function searchSite(query: string): { announcements: SearchResult[]; events: SearchResult[] } {
  const q = query.trim().toLowerCase()
  if (!q) return { announcements: [], events: [] }

  const ann = announcementsData
    .filter((a) =>
      [a.title, a.excerpt, a.content, a.category, a.source, ...(a.tags ?? [])]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(q))
    )
    .slice(0, 10)
    .map((a) => ({
      type: "announcement" as const,
      title: a.title,
      excerpt: a.excerpt,
      url: `/guess/announcements/${a.slug}`,
      date: a.date,
    }))

  const ev = EVENTS
    .filter((e) =>
      [e.title, e.description, e.fullDescription, e.category, e.location, ...(e.tags ?? [])]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(q))
    )
    .slice(0, 10)
    .map((e) => ({
      type: "event" as const,
      title: e.title,
      excerpt: e.description,
      url: `/guess/event/${e.slug}`,
      date: e.date,
    }))

  return { announcements: ann, events: ev }
}
