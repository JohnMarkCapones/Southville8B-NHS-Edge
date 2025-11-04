"use client"

import { useState, useEffect, useMemo } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { GuessBreadcrumb } from "@/components/ui/guess-breadcrumb"
import {
  Newspaper,
  CalendarIcon,
  Clock,
  User,
  Tag,
  Share2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Music,
  Palette,
  Microscope,
  Globe,
  Heart,
  Loader2,
} from "lucide-react"
import { newsApi } from "@/lib/api/endpoints/news"
import { getEventsForMonth } from "@/lib/api/endpoints/events"
import type { NewsArticle, NewsCategory } from "@/types/news"
import type { Event } from "@/lib/api/types/events"

const ITEMS_PER_PAGE = 6

export default function NewsEventsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // State for data
  const [featuredNews, setFeaturedNews] = useState<NewsArticle | null>(null)
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [categories, setCategories] = useState<NewsCategory[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(true)

  // Fetch featured news - rotates hourly with most viewed published news
  useEffect(() => {
    const fetchFeaturedNews = async () => {
      try {
        const response = await newsApi.getNews({ sortBy: "popular", limit: 50 })
        const publishedNews = response.data.filter((article) => article.status === "Published")

        if (publishedNews.length > 0) {
          // Use current hour as seed for "random" selection that changes every hour
          const currentHour = new Date().getHours()
          const index = currentHour % publishedNews.length
          setFeaturedNews(publishedNews[index])
        }
      } catch (error) {
        console.error("Error fetching featured news:", error)
      }
    }

    fetchFeaturedNews()
    // Refresh every hour
    const interval = setInterval(fetchFeaturedNews, 3600000) // 1 hour in milliseconds
    return () => clearInterval(interval)
  }, [])

  // Fetch all news articles
  useEffect(() => {
    const fetchNews = async () => {
      setNewsLoading(true)
      try {
        const response = await newsApi.getNews({ limit: 100, sortBy: "newest" })
        const published = response.data.filter((article) => article.status === "Published")
        setNewsArticles(published)
      } catch (error) {
        console.error("Error fetching news:", error)
      } finally {
        setNewsLoading(false)
      }
    }

    fetchNews()
  }, [])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await newsApi.getCategories()
        setCategories(cats)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  // Fetch events for current/selected month
  useEffect(() => {
    const fetchEvents = async () => {
      setEventsLoading(true)
      try {
        const monthEvents = await getEventsForMonth(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
        setEvents(monthEvents)
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setEventsLoading(false)
      }
    }

    fetchEvents()
  }, [currentMonth]) // Re-fetch when month changes

  // Update loading state
  useEffect(() => {
    if (!newsLoading && !eventsLoading) {
      setLoading(false)
    }
  }, [newsLoading, eventsLoading])

  // Filter news by category
  const filteredNews = useMemo(() => {
    if (selectedCategory === "All") return newsArticles
    return newsArticles.filter((article) => article.category === selectedCategory)
  }, [newsArticles, selectedCategory])

  // Paginate filtered news
  const paginatedNews = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredNews.slice(startIndex, endIndex)
  }, [filteredNews, currentPage])

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE)

  // Get upcoming events (sorted by date)
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return events
      .filter((event) => new Date(`${event.date}T${event.time}`) >= now)
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
      .slice(0, 5)
  }, [events])

  // Get days with events for calendar highlighting
  const eventDays = useMemo(() => {
    return events.map((event) => new Date(event.date))
  }, [events])

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  return (
    <div className="min-h-screen">
      <GuessBreadcrumb items={[{ label: "News & Events" }]} />
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-white overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-white/5 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse delay-500"></div>
          <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-white/10 rounded-full blur-lg animate-pulse delay-700"></div>
        </div>

        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
            <Newspaper className="w-4 h-4 mr-2" />
            Stay Informed
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-3">
            News & <span className="text-yellow-300">Events</span>
          </h1>
          <div className="mx-auto h-1.5 w-24 rounded-full bg-white/90 mb-6" />
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            Stay connected with the latest happenings, achievements, and upcoming events in our vibrant school
            community.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/30 text-black dark:text-white backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-300"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Latest Stories
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/30 text-black dark:text-white backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-300"
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              View Calendar
            </AnimatedButton>
          </div>
        </div>
      </section>

      {/* Featured News */}
      <section id="latest" className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Featured <span className="gradient-text">Story</span>
            </h2>
          </div>

          {!featuredNews ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <AnimatedCard variant="lift" className="overflow-hidden max-w-6xl mx-auto animate-fadeIn">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative">
                  <img
                    src={featuredNews.image || "/placeholder.svg"}
                    alt={featuredNews.title}
                    className="w-full h-full object-cover min-h-[300px]"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-vibrant-orange to-vibrant-red text-white">
                      Featured Story
                    </Badge>
                  </div>
                </div>
                <div className="p-8 lg:p-12">
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {featuredNews.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredNews.readTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {featuredNews.date}
                    </div>
                  </div>

                  <h3 className="text-2xl lg:text-3xl font-bold mb-4 gradient-text">{featuredNews.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed text-lg">{featuredNews.excerpt}</p>

                  {featuredNews.tags && featuredNews.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredNews.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <AnimatedButton variant="gradient" animation="glow">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Read Full Story
                    </AnimatedButton>
                    <AnimatedButton variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}
        </div>
      </section>

      {/* News Articles */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Latest <span className="gradient-text">News</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the most recent news and announcements from our school community.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <AnimatedButton
              variant={selectedCategory === "All" ? "gradient" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("All")}
              animation="lift"
            >
              All
            </AnimatedButton>
            {categories.map((category) => (
              <AnimatedButton
                key={category.id}
                variant={selectedCategory === category.name ? "gradient" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                animation="lift"
              >
                {category.name}
              </AnimatedButton>
            ))}
          </div>

          {newsLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : paginatedNews.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No news articles found.</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedNews.map((article, index) => (
                  <AnimatedCard
                    key={article.id}
                    variant="lift"
                    className="overflow-hidden animate-slideInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <img
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{article.readTime}</span>
                      </div>

                      <h3 className="font-bold text-lg mb-3 line-clamp-2 hover:text-primary transition-colors">
                        {article.title}
                      </h3>

                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{article.excerpt}</p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span>By {article.author}</span>
                        <span>{article.date}</span>
                      </div>

                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {article.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <AnimatedButton variant="outline" size="sm" className="w-full">
                        Read More
                      </AnimatedButton>
                    </div>
                  </AnimatedCard>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    animation="lift"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </AnimatedButton>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <AnimatedButton
                        key={page}
                        variant={currentPage === page ? "gradient" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        animation="lift"
                        className="min-w-[40px]"
                      >
                        {page}
                      </AnimatedButton>
                    ))}
                  </div>

                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    animation="lift"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </AnimatedButton>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Events Calendar */}
      <section id="calendar" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="animate-slideInLeft">
              <Badge variant="secondary" className="mb-4">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Upcoming Events
              </Badge>
              <h2 className="text-4xl font-bold mb-6">
                Event <span className="gradient-text">Calendar</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Don't miss out on the exciting events happening throughout the school year. Mark your calendars and join
                us for these special occasions.
              </p>

              {eventsLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No upcoming events at this time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => {
                    const eventIcon = event.tags?.[0]?.name.toLowerCase().includes("music")
                      ? <Music className="w-5 h-5" />
                      : event.tags?.[0]?.name.toLowerCase().includes("science")
                      ? <Microscope className="w-5 h-5" />
                      : event.tags?.[0]?.name.toLowerCase().includes("art")
                      ? <Palette className="w-5 h-5" />
                      : <CalendarIcon className="w-5 h-5" />

                    return (
                      <AnimatedCard
                        key={event.id}
                        variant="lift"
                        className="animate-slideInLeft"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-vibrant-purple to-vibrant-pink rounded-lg flex items-center justify-center text-white flex-shrink-0">
                            {eventIcon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2 gap-2">
                              <h4 className="font-semibold line-clamp-2">{event.title}</h4>
                              {event.tags && event.tags.length > 0 && (
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  {event.tags[0].name}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {new Date(event.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {event.location}
                              </div>
                            </div>
                          </div>
                        </div>
                      </AnimatedCard>
                    )
                  })}
                </div>
              )}

              <div className="mt-8">
                <AnimatedButton variant="gradient" size="lg" animation="glow">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  View Full Calendar
                </AnimatedButton>
              </div>
            </div>

            <div className="animate-slideInRight">
              <AnimatedCard variant="gradient" className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-center">Interactive Calendar</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentMonth}
                  onMonthChange={(newMonth) => {
                    setCurrentMonth(newMonth)
                  }}
                  className="rounded-md border mx-auto"
                  modifiers={{
                    hasEvent: eventDays,
                  }}
                  modifiersClassNames={{
                    hasEvent: "bg-primary/20 font-bold text-primary",
                  }}
                />
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">
                      {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })} Events
                    </h4>
                    {!eventsLoading && events.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {events.length} {events.length === 1 ? "event" : "events"}
                      </Badge>
                    )}
                  </div>
                  {eventsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : events.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">No events this month</p>
                  ) : (
                    <div className="space-y-3">
                      {events.slice(0, 5).map((event) => (
                        <div key={event.id} className="flex justify-between items-center text-sm gap-2">
                          <span className="font-medium line-clamp-1 flex-1">{event.title}</span>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {new Date(event.date).getDate()}
                          </Badge>
                        </div>
                      ))}
                      {events.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          +{events.length - 5} more events
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section id="highlights" className="relative py-20 bg-background dark:bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Stay Connected</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-blue-600 mb-6" />
          <p className="text-lg mb-8 max-w-2xl mx-auto text-muted-foreground">
            Subscribe to our newsletter and never miss important school updates, news, and event announcements.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <AnimatedButton variant="default" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Subscribe
              </AnimatedButton>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Join 2,000+ parents and students who stay informed weekly.
            </p>
          </div>
        </div>
      </section>

      {/* Social Media & Connect */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Follow Us</h2>
          <div className="mx-auto h-1 w-16 rounded-full bg-blue-600 mb-6" />
          <p className="text-lg mb-8 max-w-xl mx-auto text-muted-foreground">
            Stay connected with our school community on social media.
          </p>

          <div className="flex justify-center space-x-4 mb-6">
            {[
              { icon: Globe, label: "Website", href: "#" },
              { icon: Heart, label: "Community", href: "#" },
            ].map((social) => {
              const IconComponent = social.icon
              return (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-md"
                  aria-label={social.label}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </a>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
