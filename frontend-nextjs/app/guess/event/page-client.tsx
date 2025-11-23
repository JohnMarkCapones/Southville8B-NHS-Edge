"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  CalendarCheck,
  Clock,
  MapPin,
  Search,
  Filter,
  Grid3x3,
  List,
  Star,
  TrendingUp,
  Users,
  Eye,
  Heart,
  ArrowRight,
  Sparkles,
  PartyPopper,
  Award,
  Zap,
  ChevronRight,
  ChevronLeft,
  X,
  CalendarDays,
  Trophy,
  Palette,
  Music,
  Microscope,
  Globe,
  CheckCircle,
} from "lucide-react"
import type { Event } from "@/lib/api/types/events"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EventsPageClientProps {
  initialEvents: Event[]
}

const ITEMS_PER_PAGE = 9

export default function EventsPageClient({ initialEvents }: EventsPageClientProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [featuredIndex, setFeaturedIndex] = useState(0)

  // Filter and search events
  const filteredEvents = useMemo(() => {
    let filtered = events

    // Apply category filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter((event) => {
        const tags = event.tags?.map((t) => t.name.toLowerCase()) || []
        return tags.some((tag) => tag.includes(selectedFilter.toLowerCase()))
      })
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [events, selectedFilter, searchQuery])

  // Featured events (top 3)
  const featuredEvents = useMemo(() => {
    return events.filter((e) => e.is_featured).slice(0, 3)
  }, [events])

  // Upcoming events
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return filteredEvents.filter((e) => new Date(`${e.date}T${e.time}`) >= now)
  }, [filteredEvents])

  // Paginate events
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return upcomingEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [upcomingEvents, currentPage])

  const totalPages = Math.ceil(upcomingEvents.length / ITEMS_PER_PAGE)

  // Auto-rotate featured carousel
  useEffect(() => {
    if (featuredEvents.length > 1) {
      const interval = setInterval(() => {
        setFeaturedIndex((prev) => (prev + 1) % featuredEvents.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [featuredEvents.length])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedFilter, searchQuery])

  const generateSlug = (event: Event) => {
    return (
      event.slug ||
      event.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
    )
  }

  const getEventIcon = (tags: any[]) => {
    const tagNames = tags?.map((t) => t.name.toLowerCase()) || []
    if (tagNames.some((t) => t.includes("music") || t.includes("performance")))
      return <Music className="w-5 h-5" />
    if (tagNames.some((t) => t.includes("sport") || t.includes("athletic"))) return <Trophy className="w-5 h-5" />
    if (tagNames.some((t) => t.includes("art"))) return <Palette className="w-5 h-5" />
    if (tagNames.some((t) => t.includes("science") || t.includes("academic")))
      return <Microscope className="w-5 h-5" />
    return <Calendar className="w-5 h-5" />
  }

  const getDaysUntil = (date: string, time: string) => {
    const eventDate = new Date(`${date}T${time}`)
    const now = new Date()
    const diff = eventDate.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  // Check if URL is a presigned URL (R2) that needs to bypass Next.js image optimization
  const isPresignedUrl = (url: string | undefined) => {
    if (!url) return false
    return (
      url.includes('X-Amz-Algorithm') ||
      url.includes('X-Amz-Signature') ||
      url.includes('%3FX-Amz-') ||
      url.includes('r2.cloudflarestorage.com')
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom duration-700">
            <Badge variant="secondary" className="mb-6 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border-cyan-300/50 dark:border-cyan-700/50 backdrop-blur-sm">
              <PartyPopper className="w-4 h-4 mr-2" />
              Discover Amazing Events
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-800 via-violet-600 to-pink-600 dark:from-cyan-400 dark:via-violet-400 dark:to-pink-400 bg-clip-text text-transparent leading-tight">
              Upcoming Events
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Join us for exciting performances, competitions, academic showcases, and community gatherings throughout the
              year.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
              <Input
                type="text"
                placeholder="Search events by name, location, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 py-6 text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-cyan-500 dark:focus:border-cyan-400 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            {[
              { icon: CalendarCheck, label: "Total Events", value: events.length, gradient: "from-cyan-500 to-blue-500" },
              { icon: TrendingUp, label: "Upcoming", value: upcomingEvents.length, gradient: "from-violet-500 to-purple-500" },
              { icon: Star, label: "Featured", value: featuredEvents.length, gradient: "from-yellow-500 to-orange-500" },
              {
                icon: Users,
                label: "Attendees",
                value: `${Math.floor(Math.random() * 500) + 200}+`,
                gradient: "from-pink-500 to-rose-500",
              },
            ].map((stat, index) => (
              <AnimatedCard
                key={index}
                variant="lift"
                className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl mb-3 w-fit`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Carousel */}
      {featuredEvents.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Featured Events
                </h2>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFeaturedIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length)}
                  className="hover:scale-110 transition-transform"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFeaturedIndex((prev) => (prev + 1) % featuredEvents.length)}
                  className="hover:scale-110 transition-transform"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {featuredEvents.length > 0 && (
              <Link href={`/guess/event/${generateSlug(featuredEvents[featuredIndex])}`}>
                <AnimatedCard variant="lift" className="group overflow-hidden cursor-pointer animate-in zoom-in duration-500">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-64 md:h-96">
                      <Image
                        src={featuredEvents[featuredIndex].eventImage || "/placeholder.svg"}
                        alt={featuredEvents[featuredIndex].title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(min-width: 768px) 50vw, 100vw"
                        unoptimized={false}
                        quality={95}
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg animate-pulse">
                          <Star className="w-4 h-4 mr-2 fill-current" />
                          Featured Event
                        </Badge>
                      </div>
                    </div>
                    <div className="p-8 md:p-12 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                      <div className="flex items-center gap-2 mb-4">
                        {featuredEvents[featuredIndex].tags?.slice(0, 2).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="text-3xl font-bold mb-4 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {featuredEvents[featuredIndex].title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-6 line-clamp-3">
                        {featuredEvents[featuredIndex].description}
                      </p>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                          <CalendarDays className="w-5 h-5 text-cyan-500" />
                          <span>{new Date(featuredEvents[featuredIndex].date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                          <Clock className="w-5 h-5 text-violet-500" />
                          <span>{featuredEvents[featuredIndex].time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-5 h-5 text-pink-500" />
                          <span>{featuredEvents[featuredIndex].location}</span>
                        </div>
                      </div>
                      <AnimatedButton
                        variant="gradient"
                        className="group-hover:scale-105 transition-transform"
                      >
                        View Event Details
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </AnimatedButton>
                    </div>
                  </div>
                </AnimatedCard>
              </Link>
            )}

            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {featuredEvents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setFeaturedIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === featuredIndex ? "w-8 bg-gradient-to-r from-cyan-500 to-violet-500" : "w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters and View Toggle */}
      <section className="py-8 sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All Events", icon: Globe },
                { id: "music", label: "Music & Arts", icon: Music },
                { id: "sport", label: "Sports", icon: Trophy },
                { id: "academic", label: "Academic", icon: Microscope },
                { id: "art", label: "Arts", icon: Palette },
              ].map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`hover:scale-105 transition-all duration-300 ${
                    selectedFilter === filter.id
                      ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg"
                      : ""
                  }`}
                >
                  <filter.icon className="w-4 h-4 mr-2" />
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-md" : ""}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-white dark:bg-slate-700 shadow-md" : ""}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-900 dark:text-white">{upcomingEvents.length}</span> upcoming
            events
            {searchQuery && (
              <span>
                {" "}
                matching "<span className="font-semibold text-cyan-600 dark:text-cyan-400">{searchQuery}</span>"
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Events Grid/List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {paginatedEvents.length === 0 ? (
            <div className="text-center py-20 animate-in fade-in duration-500">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center">
                <CalendarDays className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">No Events Found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Try adjusting your filters or search query
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 max-w-4xl mx-auto"
                }`}
              >
                {paginatedEvents.map((event, index) => {
                  const slug = generateSlug(event)
                  const daysUntil = getDaysUntil(event.date, event.time)

                  return (
                    <Link key={event.id} href={`/guess/event/${slug}`}>
                      <AnimatedCard
                        variant="lift"
                        className={`group overflow-hidden cursor-pointer h-full bg-white dark:bg-slate-800 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 animate-in zoom-in ${
                          viewMode === "list" ? "flex flex-row" : ""
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Image */}
                        <div className={`relative ${viewMode === "list" ? "w-48 h-48" : "h-48 w-full"}`}>
                          <Image
                            src={event.eventImage || "/placeholder.svg"}
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            sizes={viewMode === "list" ? "192px" : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"}
                            unoptimized={false}
                            quality={95}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          {/* Days Until Badge */}
                          {daysUntil >= 0 && daysUntil <= 30 && (
                            <div className="absolute top-3 right-3">
                              <Badge className={`${daysUntil <= 7 ? "bg-gradient-to-r from-orange-500 to-red-500 animate-pulse" : "bg-gradient-to-r from-cyan-500 to-violet-500"} text-white shadow-lg`}>
                                <Zap className="w-3 h-3 mr-1" />
                                {daysUntil === 0 ? "Today" : `${daysUntil}d`}
                              </Badge>
                            </div>
                          )}

                          {/* Event Icon */}
                          <div className="absolute top-3 left-3">
                            <div className="p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg">
                              {getEventIcon(event.tags || [])}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className={`p-6 flex-1 ${viewMode === "list" ? "flex flex-col justify-between" : ""}`}>
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {event.tags?.slice(0, 2).map((tag, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs hover:scale-110 transition-transform cursor-pointer"
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </div>

                          {/* Title */}
                          <h3 className={`font-bold mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors ${viewMode === "list" ? "text-2xl" : "text-xl"}`}>
                            {event.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                            {event.description}
                          </p>

                          {/* Event Details */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <CalendarDays className="w-4 h-4 text-cyan-500" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Clock className="w-4 h-4 text-violet-500" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <MapPin className="w-4 h-4 text-pink-500" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-violet-500 group-hover:text-white group-hover:border-transparent transition-all duration-300"
                          >
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </AnimatedCard>
                    </Link>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12 animate-in fade-in duration-500">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="hover:scale-105 transition-transform"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[40px] hover:scale-110 transition-all ${
                          currentPage === page
                            ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg"
                            : ""
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="hover:scale-105 transition-transform"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
