"use client"

import { useState, useEffect } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import {
  CalendarIcon,
  MapPin,
  Users,
  Heart,
  Star,
  Share2,
  ChevronRight,
  Trophy,
  Microscope,
  GraduationCap,
  Palette,
  Loader2,
} from "lucide-react"
import { getEvents } from "@/lib/api/endpoints/events"
import type { Event as ApiEvent } from "@/lib/api/types/events"
import { EventStatus, EventVisibility } from "@/lib/api/types/events"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  registrationCount: number
  maxRegistration?: number
  isInterested: boolean
  isRegistered: boolean
  image: string
  tags: string[]
  organizer: string
  price?: string
  featured?: boolean
  slug?: string
}

// Helper function to map API event to component format
function mapApiEventToComponent(apiEvent: ApiEvent): Event {
  // Generate slug from title if not provided
  const slug = apiEvent.slug || apiEvent.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  return {
    id: apiEvent.id,
    title: apiEvent.title,
    description: apiEvent.description,
    date: apiEvent.date,
    time: apiEvent.time,
    location: apiEvent.location,
    category: "Special Event", // Default category since API doesn't provide this
    registrationCount: 0, // Default since API doesn't provide this
    maxRegistration: undefined,
    isInterested: false, // Default state
    isRegistered: false, // Default state
    image: apiEvent.eventImage || "/placeholder.svg?height=200&width=300&text=Event+Image",
    tags: apiEvent.tags?.map(tag => tag.name) || [],
    organizer: apiEvent.organizer?.fullName || "Event Organizer",
    price: undefined,
    featured: false, // Will be set based on is_featured from API
    slug: slug
  }
}

const categoryIcons = {
  "Arts & Culture": <Palette className="w-4 h-4" />,
  Sports: <Trophy className="w-4 h-4" />,
  Academic: <Microscope className="w-4 h-4" />,
  "Special Event": <GraduationCap className="w-4 h-4" />,
  Social: <Users className="w-4 h-4" />,
}

export function EventSystem() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const categories = ["All", "Arts & Culture", "Sports", "Academic", "Special Event", "Social"]

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await getEvents({
          page: 1,
          limit: 50,
          status: EventStatus.PUBLISHED,
          visibility: EventVisibility.PUBLIC
        })
        
        // Map API events to component format
        const mappedEvents = response.data.map(mapApiEventToComponent)
        
        // Set featured status based on is_featured from API
        const eventsWithFeatured = mappedEvents.map(event => {
          const apiEvent = response.data.find(ae => ae.id === event.id)
          return {
            ...event,
            featured: apiEvent?.is_featured || false
          }
        })
        
        setEvents(eventsWithFeatured)
      } catch (err) {
        console.error('Failed to fetch events:', err)
        setError('Failed to load events')
        // Fallback to empty array
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const filteredEvents =
    selectedCategory === "All" ? events : events.filter((event) => event.category === selectedCategory)

  const featuredEvents = events.filter((event) => event.featured)
  const upcomingEvents = events.slice(0, 3)

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">
            School <span className="gradient-text">Events</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and participate in exciting events happening throughout our school community
          </p>
        </div>
        
        {/* Loading State */}
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">
            School <span className="gradient-text">Events</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and participate in exciting events happening throughout our school community
          </p>
        </div>
        
        {/* Error State */}
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <AnimatedButton 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Try Again
            </AnimatedButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">
          School <span className="gradient-text">Events</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover and participate in exciting events happening throughout our school community
        </p>
      </div>

      {/* Activity Insights */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <AnimatedCard variant="lift" className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">2</div>
          <div className="text-sm text-muted-foreground">Interests Tracked</div>
        </AnimatedCard>
        <AnimatedCard variant="lift" className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">2</div>
          <div className="text-sm text-muted-foreground">Events Viewed</div>
        </AnimatedCard>
        <AnimatedCard variant="lift" className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">1</div>
          <div className="text-sm text-muted-foreground">Events Registered</div>
        </AnimatedCard>
      </div>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <Star className="w-6 h-6 mr-2 text-yellow-500" />
            Featured Events
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredEvents.map((event) => (
              <AnimatedCard key={event.id} variant="lift" className="overflow-hidden">
                <div className="relative w-full h-48">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                    priority={Boolean(event.featured)}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">Featured</Badge>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                      aria-label={event.isInterested ? "Remove from interested" : "Mark as interested"}
                    >
                      <Heart className={`w-4 h-4 ${event.isInterested ? "text-red-500 fill-current" : "text-white"}`} />
                    </button>
                    <button 
                      className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                      aria-label="Share event"
                    >
                      <Share2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {categoryIcons[event.category as keyof typeof categoryIcons]}
                      {event.category}
                    </Badge>
                    {event.price && <Badge variant="secondary">{event.price}</Badge>}
                  </div>
                  <h4 className="text-xl font-bold mb-2">{event.title}</h4>
                  <p className="text-muted-foreground mb-4">{event.description}</p>
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      {event.registrationCount} registered
                      {event.maxRegistration && ` / ${event.maxRegistration}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <AnimatedButton variant={event.isRegistered ? "outline" : "gradient"} size="sm" className="flex-1">
                      {event.isRegistered ? "Registered" : "Register"}
                    </AnimatedButton>
                    <Link
                      href={`/guess/event/${event.slug || event.title
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim()}`}
                    >
                      <AnimatedButton variant="outline" size="sm">
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </AnimatedButton>
                    </Link>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((category) => (
          <AnimatedButton
            key={category}
            variant={selectedCategory === category ? "gradient" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            animation="subtle"
          >
            {category !== "All" && categoryIcons[category as keyof typeof categoryIcons]}
            <span className={category !== "All" ? "ml-2" : ""}>{category}</span>
          </AnimatedButton>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event, index) => (
          <AnimatedCard
            key={event.id}
            variant="lift"
            className="overflow-hidden animate-slideInUp"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="relative w-full h-40">
              <Image
                src={event.image || "/placeholder.svg"}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                priority={false}
              />
              <div className="absolute top-3 left-3">
                <Badge variant="outline" className="bg-white/90 text-gray-900 border-white/50">
                  {event.category}
                </Badge>
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <button 
                  className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                  aria-label={event.isInterested ? "Remove from interested" : "Mark as interested"}
                >
                  <Heart className={`w-3 h-3 ${event.isInterested ? "text-red-500 fill-current" : "text-white"}`} />
                </button>
              </div>
              {event.isRegistered && (
                <div className="absolute bottom-3 left-3">
                  <Badge variant="success">Registered</Badge>
                </div>
              )}
            </div>
            <div className="p-4">
              <h4 className="font-bold mb-2 line-clamp-1">{event.title}</h4>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
              <div className="space-y-1 mb-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {event.registrationCount} registered
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/guess/event/${event.slug || event.title
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim()}`}
                  className="flex-1"
                >
                  <AnimatedButton
                    variant={event.isRegistered ? "outline" : "gradient"}
                    size="sm"
                    className="w-full text-xs"
                  >
                    View Details
                  </AnimatedButton>
                </Link>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* View All Events */}
      <div className="text-center">
        <Link href="/guess/event">
          <AnimatedButton variant="gradient" size="lg" animation="glow">
            <CalendarIcon className="w-5 h-5 mr-2" />
            View All Events
          </AnimatedButton>
        </Link>
      </div>
    </div>
  )
}
