import AnnouncementsClient from "./page.client"

export const dynamic = "force-static"
export const revalidate = 3600
export const runtime = "edge"

async function getAnnouncements() {
  // TODO: point to NestJS API on prod, e.g., process.env.API_URL
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/announcements`, {
    next: { revalidate, tags: ["announcements"] },
  })
  if (!res.ok) return { items: [] }
  return res.json() as Promise<{ items: any[] }>
}

export default async function AnnouncementsPage() {
  const { items } = await getAnnouncements()
  return <AnnouncementsClient initialItems={items} />
}
