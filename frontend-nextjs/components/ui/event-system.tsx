"use client"

import { useState } from "react"
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
} from "lucide-react"

interface Event {
  id: number
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
}

const events: Event[] = [
  {
    id: 1,
    title: "Spring Musical: Hamilton",
    description: "Drama department with professional-level production",
    date: "2024-04-20",
    time: "7:00 PM",
    location: "Main Auditorium",
    category: "Arts & Culture",
    registrationCount: 342,
    maxRegistration: 500,
    isInterested: true,
    isRegistered: false,
    image: "/placeholder.svg?height=200&width=300&text=Hamilton+Musical",
    tags: ["Musical", "Drama", "Hamilton"],
    organizer: "Drama Department",
    featured: true,
  },
  {
    id: 2,
    title: "State Basketball Championship",
    description: "Eagles compete for state championship",
    date: "2024-03-15",
    time: "8:00 PM",
    location: "State Arena, Downtown",
    category: "Sports",
    registrationCount: 150,
    isInterested: true,
    isRegistered: true,
    image: "/placeholder.svg?height=200&width=300&text=Basketball+Championship",
    tags: ["Basketball", "Championship", "Sports"],
    organizer: "Athletic Department",
  },
  {
    id: 3,
    title: "Science Fair 2024",
    description: "Annual showcase of student STEM projects with university judges",
    date: "2024-05-10",
    time: "9:00 AM",
    location: "Gymnasium",
    category: "Academic",
    registrationCount: 89,
    maxRegistration: 100,
    isInterested: false,
    isRegistered: true,
    image: "/placeholder.svg?height=200&width=300&text=Science+Fair",
    tags: ["Science", "STEM", "Competition"],
    organizer: "Science Department",
  },
  {
    id: 4,
    title: "Graduation Ceremony 2024",
    description: "Celebrating the graduating class of 2024",
    date: "2024-06-15",
    time: "10:00 AM",
    location: "Football Stadium",
    category: "Special Event",
    registrationCount: 560,
    maxRegistration: 600,
    isInterested: false,
    isRegistered: false,
    image: "/placeholder.svg?height=200&width=300&text=Graduation+2024",
    tags: ["Graduation", "Class of 2024", "Ceremony"],
    organizer: "Administration",
    featured: true,
  },
  {
    id: 5,
    title: "Senior Prom 2024",
    description: "Elegant senior prom with 'Enchanted Garden' theme",
    date: "2024-05-18",
    time: "7:00 PM",
    location: "Grand Ballroom Hotel",
    category: "Social",
    registrationCount: 287,
    maxRegistration: 400,
    isInterested: true,
    isRegistered: false,
    image: "/placeholder.svg?height=200&width=300&text=Senior+Prom",
    tags: ["Prom", "Senior", "Dance"],
    organizer: "Student Council",
    price: "$75",
  },
  {
    id: 6,
    title: "Robotics Competition",
    description: "Regional robotics competition featuring innovative student robots",
    date: "2024-04-12",
    time: "8:00 AM",
    location: "Engineering Lab",
    category: "Academic",
    registrationCount: 78,
    maxRegistration: 100,
    isInterested: false,
    isRegistered: true,
    image: "/placeholder.svg?height=200&width=300&text=Robotics+Competition",
    tags: ["Robotics", "Engineering", "Competition"],
    organizer: "Engineering Club",
  },
]

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

  const categories = ["All", "Arts & Culture", "Sports", "Academic", "Special Event", "Social"]

  const filteredEvents =
    selectedCategory === "All" ? events : events.filter((event) => event.category === selectedCategory)

  const featuredEvents = events.filter((event) => event.featured)
  const upcomingEvents = events.slice(0, 3)

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
                      href={`/guess/event/${event.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "")}`}
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
                  href={`/guess/event/${event.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "")}`}
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
