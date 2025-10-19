import AnnouncementsClient from "./page.client"

export const dynamic = "force-static"
export const revalidate = 3600
export const runtime = "edge"

// Map backend announcement to frontend format
function mapAnnouncementToFrontend(item: any) {
  // Extract first 200 chars of content as excerpt (strip HTML)
  const excerpt = item.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
  
  return {
    id: item.id,
    title: item.title,
    excerpt,
    content: item.content,
    category: item.type as 'urgent' | 'academic' | 'event' | 'general', // Map 'type' to 'category'
    date: item.createdAt,
    author: item.user?.full_name || 'Unknown',
    sticky: false, // Backend doesn't have this field yet
    slug: item.id, // Use ID as slug for now
  }
}

async function getAnnouncements() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'
  const res = await fetch(`${apiUrl}/api/v1/announcements?page=1&limit=10&visibility=public&includeExpired=false`, {
    next: { revalidate, tags: ["announcements"] },
  })
  if (!res.ok) {
    console.error('Failed to fetch announcements:', res.status, res.statusText)
    return []
  }
  const { data } = await res.json()
  return data.map(mapAnnouncementToFrontend)
}

export default async function AnnouncementsPage() {
  const items = await getAnnouncements()
  return <AnnouncementsClient initialItems={items} />
}
