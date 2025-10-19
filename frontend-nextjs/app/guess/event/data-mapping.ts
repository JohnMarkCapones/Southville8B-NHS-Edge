// ============================================
// EVENTS DATA MAPPING
// Maps backend API response to frontend format
// ============================================

export type BackendEvent = {
  id: string
  title: string
  description: string
  full_description?: string
  date: string
  time: string
  location: string
  category: string
  registration_count: number
  max_registration?: number
  image?: string
  organizer: string
  organizer_contact: string
  organizer_phone?: string
  price?: string
  featured: boolean
  status: string
  visibility: string
  created_at: string
  updated_at: string
  // Related data (from joins)
  organizer_info?: {
    id: string
    full_name: string
    email: string
  }
  tags?: Array<{
    id: string
    name: string
    color?: string
  }>
  additional_info?: Array<{
    id: string
    title: string
    content: string
    order_index: number
  }>
  highlights?: Array<{
    id: string
    title: string
    content: string
    image_url?: string
    order_index: number
  }>
  schedule?: Array<{
    id: string
    activity_time: string
    activity_description: string
    order_index: number
  }>
  faq?: Array<{
    id: string
    question: string
    answer: string
  }>
}

export type FrontendEvent = {
  id: string
  title: string
  slug: string
  description: string
  fullDescription: string
  date: string
  time: string
  location: string
  category: string
  registrationCount: number
  maxRegistration?: number
  image: string
  tags: string[]
  organizer: string
  organizerContact: string
  organizerPhone?: string
  price?: string
  featured: boolean
  highlights?: string[]
  schedule?: { time: string; activity: string }[]
  faq?: { question: string; answer: string }[]
}

/**
 * Maps backend event data to frontend format
 */
export function mapEventToFrontend(backendEvent: BackendEvent): FrontendEvent {
  // Create slug from title
  const slug = backendEvent.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()

  // Map tags
  const tags = backendEvent.tags?.map(tag => tag.name) || []

  // Map highlights
  const highlights = backendEvent.highlights
    ?.sort((a, b) => a.order_index - b.order_index)
    .map(highlight => highlight.content) || []

  // Map schedule
  const schedule = backendEvent.schedule
    ?.sort((a, b) => a.order_index - b.order_index)
    .map(item => ({
      time: item.activity_time,
      activity: item.activity_description
    })) || []

  // Map FAQ
  const faq = backendEvent.faq?.map(item => ({
    question: item.question,
    answer: item.answer
  })) || []

  return {
    id: backendEvent.id,
    title: backendEvent.title,
    slug,
    description: backendEvent.description,
    fullDescription: backendEvent.full_description || backendEvent.description,
    date: backendEvent.date,
    time: backendEvent.time,
    location: backendEvent.location,
    category: backendEvent.category,
    registrationCount: backendEvent.registration_count,
    maxRegistration: backendEvent.max_registration,
    image: backendEvent.image || '/placeholder.svg?height=400&width=800&text=Event+Image',
    tags,
    organizer: backendEvent.organizer_info?.full_name || backendEvent.organizer,
    organizerContact: backendEvent.organizer_info?.email || backendEvent.organizer_contact,
    organizerPhone: backendEvent.organizer_phone,
    price: backendEvent.price,
    featured: backendEvent.featured,
    highlights,
    schedule,
    faq
  }
}

/**
 * Maps array of backend events to frontend format
 */
export function mapEventsToFrontend(backendEvents: BackendEvent[]): FrontendEvent[] {
  return backendEvents.map(mapEventToFrontend)
}

/**
 * Fetches events from the backend API
 */
export async function fetchEventsFromAPI(): Promise<FrontendEvent[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'
  
  try {
    const response = await fetch(`${apiUrl}/api/v1/events?page=1&limit=50&status=published&visibility=public`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.error('Failed to fetch events:', response.status, response.statusText)
      return []
    }

    const { data } = await response.json()
    return mapEventsToFrontend(data)
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

/**
 * Fetches a single event by ID from the backend API
 */
export async function fetchEventByIdFromAPI(id: string): Promise<FrontendEvent | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'
  
  try {
    const response = await fetch(`${apiUrl}/api/v1/events/${id}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.error('Failed to fetch event:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    return mapEventToFrontend(data)
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

/**
 * Finds an event by slug (searches through all events)
 */
export async function findEventBySlugFromAPI(slug: string): Promise<FrontendEvent | null> {
  const events = await fetchEventsFromAPI()
  return events.find(event => event.slug === slug) || null
}

