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
  Sparkles,
  X,
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
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {/* Enhanced Header Banner with Animated Background */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 sm:p-8 md:p-10 text-white shadow-2xl">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_50%)] animate-float"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: "1s" }}></div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0 gap-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-2 sm:space-x-3 animate-fadeIn">
                  <div className="p-2 sm:p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs sm:text-sm px-2 sm:px-3 py-1">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                    School Events
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight animate-slideInLeft">
                  Discover Amazing Events
                </h1>
                <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed animate-slideInLeft" style={{ animationDelay: "100ms" }}>
                  Join exciting activities, competitions, and celebrations happening at our school
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                <div className="text-center group cursor-default">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 transition-transform duration-300 group-hover:scale-110">
                      {upcomingEvents.length}
                    </div>
                    <div className="text-white/80 text-xs sm:text-sm font-medium">Upcoming</div>
                  </div>
                </div>
                <div className="text-center group cursor-default">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 transition-transform duration-300 group-hover:scale-110">
                      {featuredEvents.length}
                    </div>
                    <div className="text-white/80 text-xs sm:text-sm font-medium">Featured</div>
                  </div>
                </div>
                <div className="text-center group cursor-default">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 transition-transform duration-300 group-hover:scale-110">
                      {favorites.length}
                    </div>
                    <div className="text-white/80 text-xs sm:text-sm font-medium">Favorites</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 flex-1">
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110" />
                <Input
                  placeholder="Search events, tags, or organizers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20 border-gray-300 dark:border-gray-600"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {searchTerm && searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:bg-muted">
                <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 bg-transparent border-none text-sm focus:outline-none focus:ring-0 cursor-pointer min-w-[120px]"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label} ({category.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <div className="flex items-center bg-muted/50 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 px-3 transition-all duration-300"
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="ml-1.5 hidden sm:inline text-xs">Grid</span>
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 px-3 transition-all duration-300"
                >
                  <List className="w-4 h-4" />
                  <span className="ml-1.5 hidden sm:inline text-xs">List</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedCategory !== "all") && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs animate-fadeIn">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="text-xs animate-fadeIn">
                  Category: {categories.find((c) => c.value === selectedCategory)?.label}
                  <button onClick={() => setSelectedCategory("all")} className="ml-1 hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                }}
                className="h-6 text-xs px-2 hover:bg-destructive/10 hover:text-destructive"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Loading State */}
        {eventsLoading && (
          <div className="flex flex-col justify-center items-center py-16 space-y-4 animate-fadeIn">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-primary/20 animate-ping"></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Loading amazing events...</p>
              <div className="flex space-x-1 justify-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Error State */}
        {eventsError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 text-center shadow-lg animate-fadeIn">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/20 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-destructive animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Failed to Load Events</h3>
            <p className="text-muted-foreground mb-4">
              We encountered an error while loading events. Please try again later.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
              Try Again
            </Button>
          </div>
        )}

        {/* Enhanced Featured Events Section */}
        {!debouncedSearchTerm && !eventsLoading && featuredEvents.length > 0 && (
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Featured Events
                </h2>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  {featuredEvents.length}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event, index) => (
                <Card
                  key={event.id}
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-yellow-300 dark:border-yellow-700 bg-gradient-to-br from-white to-yellow-50 dark:from-gray-800 dark:to-yellow-950/20 animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-video bg-gradient-to-r from-yellow-400 to-orange-500 overflow-hidden">
                    {event.eventImage && (
                      <img
                        src={event.eventImage}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-yellow-500 text-white font-semibold shadow-lg animate-gentleGlow">
                        <Star className="w-3 h-3 mr-1 animate-pulse" />
                        Featured
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-9 w-9 p-0 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
                        onClick={(e) => {
                          e.preventDefault()
                          toggleFavorite(event.id)
                        }}
                      >
                        <Heart
                          className={`w-4 h-4 transition-all duration-300 ${favorites.includes(event.id) ? "text-red-500 fill-current scale-110" : "text-gray-600"}`}
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-9 w-9 p-0 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
                      >
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

        {/* Enhanced Upcoming and Past Events Tabs */}
        {!eventsLoading && !eventsError && (
          <Tabs defaultValue="upcoming" className="space-y-6 animate-fadeIn">
            <TabsList className="grid w-full grid-cols-2 h-12 sm:h-14 bg-muted/50 rounded-xl p-1">
              <TabsTrigger
                value="upcoming"
                className="text-xs sm:text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
              >
                <TrendingUp className="w-4 h-4 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">Upcoming Events</span>
                <span className="xs:hidden">Upcoming</span>
                <Badge variant="secondary" className="ml-1.5 sm:ml-2 text-xs">
                  {upcomingEvents.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="text-xs sm:text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
              >
                <Award className="w-4 h-4 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">Past Events</span>
                <span className="xs:hidden">Past</span>
                <Badge variant="secondary" className="ml-1.5 sm:ml-2 text-xs">
                  {pastEvents.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Events Tab */}
            <TabsContent value="upcoming" className="space-y-4 animate-fadeIn">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-16 sm:py-20 px-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full mb-6">
                    <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No upcoming events found</h3>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                    {debouncedSearchTerm
                      ? `No events matching "${debouncedSearchTerm}"`
                      : "Try adjusting your search or filter criteria, or check back later for new events"}
                  </p>
                  {(debouncedSearchTerm || selectedCategory !== "all") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedCategory("all")
                      }}
                      className="mt-4"
                    >
                      Clear filters
                    </Button>
                  )}
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
            <TabsContent value="past" className="space-y-4 animate-fadeIn">
              {pastEvents.length === 0 ? (
                <div className="text-center py-16 sm:py-20 px-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-full mb-6">
                    <Award className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground animate-pulse" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No past events found</h3>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                    Check back later for completed events and event history
                  </p>
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

        {/* Enhanced Call to Action */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-white/20 shadow-2xl animate-fadeIn">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10 text-center space-y-4 sm:space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg mb-2">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Want to organize an event?</h3>
            <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Share your ideas and bring the school community together. Create memorable experiences!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2">
              <Link href="/student/clubs">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white hover:bg-white/90 text-purple-600 border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Propose Event
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/student/calendar">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}

// Enhanced Event Card Component for Upcoming Events
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
      className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] border border-gray-200 dark:border-gray-700 ${
        viewMode === "list" ? "flex flex-col sm:flex-row" : ""
      }`}
    >
      <div
        className={`relative bg-gradient-to-r ${getCategoryGradientColor(event)} overflow-hidden ${
          viewMode === "list" ? "sm:w-56 sm:flex-shrink-0 h-48 sm:h-auto" : "aspect-video"
        }`}
      >
        {event.eventImage && (
          <img
            src={event.eventImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-3 left-3 transform group-hover:scale-105 transition-transform duration-300">
          <Badge className={`${getCategoryColor(event)} shadow-lg`}>{getCategoryName(event)}</Badge>
        </div>
        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <Button
            size="sm"
            variant="secondary"
            className="h-9 w-9 p-0 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
            onClick={(e) => {
              e.preventDefault()
              toggleFavorite(event.id)
            }}
          >
            <Heart
              className={`w-4 h-4 transition-all duration-300 ${favorites.includes(event.id) ? "text-red-500 fill-current scale-110" : "text-gray-600"}`}
            />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-9 w-9 p-0 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <CardHeader className="pb-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors line-clamp-2 font-semibold">
              {event.title}
            </CardTitle>
          </div>
          {event.organizer && (
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              by {event.organizer.fullName}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{event.description}</p>

          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs sm:text-sm">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs sm:text-sm">{event.time}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs sm:text-sm line-clamp-1">{event.location}</span>
            </div>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-xs hover:bg-secondary/80 transition-colors cursor-default"
                >
                  {tag.name}
                </Badge>
              ))}
              {event.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{event.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Link href={`/student/events/${generateSlug(event.title)}`} className="flex-1">
              <Button className="w-full group/btn hover:bg-primary/90 transition-all duration-300 hover:shadow-lg text-xs sm:text-sm">
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                View Details
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                toggleNotification(event.id)
              }}
              className={`transition-all duration-300 hover:scale-105 ${
                notifications.includes(event.id)
                  ? "bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-950 dark:border-blue-700"
                  : ""
              }`}
            >
              <Bell
                className={`w-4 h-4 transition-all duration-300 ${notifications.includes(event.id) ? "animate-pulse" : ""}`}
              />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

// Enhanced Past Event Card Component
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
      className={`group overflow-hidden hover:shadow-xl transition-all duration-500 opacity-90 hover:opacity-100 transform hover:-translate-y-1 border border-gray-300 dark:border-gray-600 ${
        viewMode === "list" ? "flex flex-col sm:flex-row" : ""
      }`}
    >
      <div
        className={`relative bg-gradient-to-r from-gray-400 to-gray-600 overflow-hidden ${
          viewMode === "list" ? "sm:w-56 sm:flex-shrink-0 h-48 sm:h-auto" : "aspect-video"
        }`}
      >
        {event.eventImage && (
          <img
            src={event.eventImage}
            alt={event.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
          />
        )}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300"></div>
        <div className="absolute top-3 left-3 transform group-hover:scale-105 transition-transform duration-300">
          <Badge className="bg-gray-600 text-white shadow-lg">
            <Award className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        </div>
        <div className="absolute top-3 right-3 transform group-hover:scale-105 transition-transform duration-300">
          <Badge variant="outline" className="bg-white/95 text-gray-700 shadow-lg backdrop-blur-sm">
            {getCategoryName(event)}
          </Badge>
        </div>
      </div>

      <div className="flex-1">
        <CardHeader className="pb-3 space-y-2">
          <CardTitle className="text-base sm:text-lg font-semibold group-hover:text-muted-foreground transition-colors">
            {event.title}
          </CardTitle>
          {event.organizer && (
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              by {event.organizer.fullName}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{event.description}</p>

          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2 hover:text-foreground transition-colors">
              <div className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-foreground transition-colors">
              <div className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Award className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">Event completed</span>
            </div>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs opacity-75 hover:opacity-100 transition-opacity">
                  {tag.name}
                </Badge>
              ))}
              {event.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs opacity-75">
                  +{event.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <Link href={`/student/events/${generateSlug(event.title)}`} className="block">
            <Button
              variant="outline"
              className="w-full group/btn hover:bg-muted transition-all duration-300 hover:shadow-md text-xs sm:text-sm"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
              View Event Details
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </div>
    </Card>
  )
}
