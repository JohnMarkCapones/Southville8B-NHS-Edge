"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import StudentLayout from "@/components/student/student-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Heart,
  Share2,
  Bell,
  Star,
  TrendingUp,
  Award,
  Zap,
  Filter,
  Grid3X3,
  List,
  ChevronRight,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useEvents, useFeaturedEvents } from "@/hooks/useEvents"
import { generateSlug, formatDate, getCategoryColor, getCategoryName } from "@/lib/api/endpoints/events"
import type { Event } from "@/lib/api/types/events"
import { EventStatus, EventVisibility } from "@/lib/api/types/events"

export default function StudentEventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [favorites, setFavorites] = useState<string[]>([])
  const [notifications, setNotifications] = useState<string[]>([])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // Wait 300ms after user stops typing

    return () => clearTimeout(timer)
  }, [searchTerm])

  // API data fetching with React Query
  const {
    data: eventsResponse,
    isLoading: eventsLoading,
    error: eventsError,
  } = useEvents({
    limit: 50,
    status: EventStatus.PUBLISHED,
    visibility: EventVisibility.PUBLIC,
    search: debouncedSearchTerm || undefined,
  })

  const { data: featuredEvents = [], isLoading: featuredLoading } = useFeaturedEvents(3)

  // Get all events
  const allEvents = eventsResponse?.data || []

  // Client-side category filtering
  const filteredEvents = useMemo(() => {
    if (selectedCategory === "all") return allEvents

    return allEvents.filter((event) => {
      const category = getCategoryName(event)
      return category.toLowerCase() === selectedCategory.toLowerCase()
    })
  }, [allEvents, selectedCategory])

  // Separate upcoming and past events
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingEvents = filteredEvents.filter((event) => {
    const eventDate = new Date(event.date)
    return eventDate >= today && event.status === "published"
  })

  const pastEvents = filteredEvents.filter((event) => {
    const eventDate = new Date(event.date)
    return eventDate < today || event.status === "completed"
  })

  // Build categories list with counts
  const categories = useMemo(() => {
    const categoryCounts: { [key: string]: number } = {}

    allEvents.forEach((event) => {
      const category = getCategoryName(event)
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })

    return [
      { value: "all", label: "All Events", count: allEvents.length },
      { value: "academic", label: "Academic", count: categoryCounts["Academic"] || 0 },
      { value: "sports", label: "Sports", count: categoryCounts["Sports"] || 0 },
      { value: "cultural", label: "Cultural", count: categoryCounts["Cultural"] || 0 },
      { value: "social", label: "Social", count: categoryCounts["Social"] || 0 },
    ]
  }, [allEvents])

  const toggleFavorite = (eventId: string) => {
    setFavorites((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]))
  }

  const toggleNotification = (eventId: string) => {
    setNotifications((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]))
  }

  const getCategoryGradientColor = (event: Event) => {
    const category = getCategoryName(event)
    const colors = {
      Academic: "from-blue-500 to-blue-600",
      Sports: "from-green-500 to-green-600",
      Cultural: "from-purple-500 to-purple-600",
      Social: "from-orange-500 to-orange-600",
    }
    return colors[category as keyof typeof colors] || "from-gray-500 to-gray-600"
  }

  return (
    <StudentLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 sm:p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-6 h-6" />
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    School Events
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold">Discover Amazing Events</h1>
                <p className="text-white/90 text-lg max-w-2xl">
                  Join exciting activities, competitions, and celebrations happening at our school
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{upcomingEvents.length}</div>
                  <div className="text-white/80 text-sm">Upcoming</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{featuredEvents.length}</div>
                  <div className="text-white/80 text-sm">Featured</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{favorites.length}</div>
                  <div className="text-white/80 text-sm">Favorites</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search events, tags, or organizers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
                {searchTerm && searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm h-11 min-w-[140px]"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label} ({category.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {eventsLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {eventsError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Events</h3>
            <p className="text-muted-foreground">
              We encountered an error while loading events. Please try again later.
            </p>
          </div>
        )}

        {/* Featured Events Section */}
        {!debouncedSearchTerm && !eventsLoading && featuredEvents.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">Featured Events</h2>
              <Badge variant="secondary">{featuredEvents.length}</Badge>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-yellow-200 dark:border-yellow-800"
                >
                  <div className="relative aspect-video bg-gradient-to-r from-yellow-400 to-orange-500">
                    {event.eventImage && (
                      <img
                        src={event.eventImage}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-yellow-500 text-white font-semibold">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                        onClick={() => toggleFavorite(event.id)}
                      >
                        <Heart
                          className={`w-4 h-4 ${favorites.includes(event.id) ? "text-red-500 fill-current" : "text-gray-600"}`}
                        />
                      </Button>
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </Button>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </CardTitle>
                      <Badge variant="outline" className={getCategoryColor(event)}>
                        {getCategoryName(event)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>
                          {formatDate(event.date)} at {event.time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {event.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Link href={`/student/events/${generateSlug(event.title)}`} className="flex-1">
                        <Button className="w-full group-hover:bg-primary/90 transition-colors">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleNotification(event.id)}
                        className={notifications.includes(event.id) ? "bg-blue-50 border-blue-200" : ""}
                      >
                        <Bell className={`w-4 h-4 ${notifications.includes(event.id) ? "text-blue-600" : ""}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming and Past Events Tabs */}
        {!eventsLoading && !eventsError && (
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
              <TabsTrigger
                value="upcoming"
                className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Upcoming Events ({upcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Award className="w-4 h-4 mr-2" />
                Past Events ({pastEvents.length})
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Events Tab */}
            <TabsContent value="upcoming" className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No upcoming events found</h3>
                  <p className="text-muted-foreground">
                    {debouncedSearchTerm
                      ? `No events matching "${debouncedSearchTerm}"`
                      : "Try adjusting your search or filter criteria"}
                  </p>
                </div>
              ) : (
                <div className={viewMode === "grid" ? "grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      viewMode={viewMode}
                      favorites={favorites}
                      notifications={notifications}
                      toggleFavorite={toggleFavorite}
                      toggleNotification={toggleNotification}
                      getCategoryColor={getCategoryColor}
                      getCategoryName={getCategoryName}
                      getCategoryGradientColor={getCategoryGradientColor}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Past Events Tab */}
            <TabsContent value="past" className="space-y-4">
              {pastEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No past events found</h3>
                  <p className="text-muted-foreground">Check back later for completed events</p>
                </div>
              ) : (
                <div className={viewMode === "grid" ? "grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                  {pastEvents.map((event) => (
                    <PastEventCard
                      key={event.id}
                      event={event}
                      viewMode={viewMode}
                      getCategoryColor={getCategoryColor}
                      getCategoryName={getCategoryName}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-xl p-6 border">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Want to organize an event?</h3>
            <p className="text-muted-foreground">Share your ideas and bring the school community together</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" className="bg-white dark:bg-gray-800">
                <Zap className="w-4 h-4 mr-2" />
                Propose Event
              </Button>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}

// Event Card Component for Upcoming Events
function EventCard({
  event,
  viewMode,
  favorites,
  notifications,
  toggleFavorite,
  toggleNotification,
  getCategoryColor,
  getCategoryName,
  getCategoryGradientColor,
}: {
  event: Event
  viewMode: "grid" | "list"
  favorites: string[]
  notifications: string[]
  toggleFavorite: (id: string) => void
  toggleNotification: (id: string) => void
  getCategoryColor: (event: Event) => string
  getCategoryName: (event: Event) => string
  getCategoryGradientColor: (event: Event) => string
}) {
  return (
    <Card
      className={`group overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
        viewMode === "list" ? "flex flex-col sm:flex-row" : ""
      }`}
    >
      <div
        className={`relative bg-gradient-to-r ${getCategoryGradientColor(event)} ${
          viewMode === "list" ? "sm:w-48 sm:flex-shrink-0" : "aspect-video"
        }`}
      >
        {event.eventImage && (
          <img
            src={event.eventImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute top-3 left-3">
          <Badge className={getCategoryColor(event)}>{getCategoryName(event)}</Badge>
        </div>
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => toggleFavorite(event.id)}
          >
            <Heart
              className={`w-4 h-4 ${favorites.includes(event.id) ? "text-red-500 fill-current" : "text-gray-600"}`}
            />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
              {event.title}
            </CardTitle>
          </div>
          {event.organizer && (
            <p className="text-sm text-muted-foreground">by {event.organizer.fullName}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{event.location}</span>
            </div>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {event.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex space-x-2">
            <Link href={`/student/events/${generateSlug(event.title)}`} className="flex-1">
              <Button className="w-full group-hover:bg-primary/90 transition-colors">
                <Eye className="w-4 h-4 mr-1" />
                View Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleNotification(event.id)}
              className={notifications.includes(event.id) ? "bg-blue-50 border-blue-200" : ""}
            >
              <Bell className={`w-4 h-4 ${notifications.includes(event.id) ? "text-blue-600" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

// Past Event Card Component
function PastEventCard({
  event,
  viewMode,
  getCategoryColor,
  getCategoryName,
}: {
  event: Event
  viewMode: "grid" | "list"
  getCategoryColor: (event: Event) => string
  getCategoryName: (event: Event) => string
}) {
  return (
    <Card
      className={`group overflow-hidden hover:shadow-lg transition-all duration-300 opacity-90 hover:opacity-100 ${
        viewMode === "list" ? "flex flex-col sm:flex-row" : ""
      }`}
    >
      <div
        className={`relative bg-gradient-to-r from-gray-400 to-gray-600 ${
          viewMode === "list" ? "sm:w-48 sm:flex-shrink-0" : "aspect-video"
        }`}
      >
        {event.eventImage && (
          <img
            src={event.eventImage}
            alt={event.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
          />
        )}
        <div className="absolute top-3 left-3">
          <Badge className="bg-gray-500 text-white">Completed</Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="bg-white/90 text-gray-700">
            {getCategoryName(event)}
          </Badge>
        </div>
      </div>

      <div className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          {event.organizer && <p className="text-sm text-muted-foreground">by {event.organizer.fullName}</p>}
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Event completed</span>
            </div>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {event.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs opacity-75">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <Button variant="outline" className="w-full bg-transparent">
            <Link
              href={`/student/events/${generateSlug(event.title)}`}
              className="flex items-center justify-center w-full"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Event Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </div>
    </Card>
  )
}
