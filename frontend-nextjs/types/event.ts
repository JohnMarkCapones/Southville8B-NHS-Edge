export interface Event {
  id: string
  title: string
  slug: string
  description: string
  content: string
  category: string
  tags: string[]
  featuredImage: string

  // Date & Time
  startDate: string
  endDate: string
  isAllDay: boolean
  registrationDeadline: string

  // Location
  venue: string
  room: string
  isVirtual: boolean
  meetingLink: string
  address: string

  // Registration
  maxAttendees: number
  currentAttendees: number
  registrationRequired: boolean
  registrationLink: string
  isWaitlistEnabled: boolean
  registrationFee: number

  // Organizer
  organizer: string
  contactEmail: string
  contactPhone: string
  department: string

  // Status & Visibility
  status: "draft" | "published" | "scheduled" | "cancelled" | "completed"
  visibility: "public" | "students" | "teachers" | "internal"
  cancelReason: string

  // Meta
  featured: boolean
  views: number
  createdAt: string
  updatedAt: string
  publishedDate: string
}
