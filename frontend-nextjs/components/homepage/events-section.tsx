"use client"

import React, { useState } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Calendar, ArrowRight, Music, Microscope, Trophy, Clock, MapPin, Loader2, ImageIcon, Sparkles, PartyPopper } from "lucide-react"
import Link from "next/link"
import { getEvents } from "@/lib/api/endpoints/events"
import { Event } from "@/lib/api/types/events"
import Image from "next/image"

const categoryIcons = {
  "Arts & Culture": Music,
  "Academic": Microscope,
  "Sports": Trophy,
  "Special Event": Calendar,
  "Social": Calendar,
}

const categoryColors = {
  "Arts & Culture": "from-purple-500 to-pink-500",
  "Academic": "from-blue-500 to-cyan-500",
  "Sports": "from-green-500 to-emerald-500",
  "Special Event": "from-orange-500 to-red-500",
  "Social": "from-indigo-500 to-purple-500",
}

export function EventsSection() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [useApiData, setUseApiData] = useState(false)

  // Fetch events from API on component mount
  React.useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsResult = await getEvents({
          status: 'published' as any,
          visibility: 'public' as any,
          limit: 20, // Get more events so we can prioritize featured ones
        })

        if (eventsResult?.data && eventsResult.data.length > 0) {
          // Debug: Log the first event to see its structure
          console.log('📊 First event data:', eventsResult.data[0])
          console.log('🖼️ Event image field:', eventsResult.data[0]?.eventImage)

          // Sort events: featured first, then by date (upcoming first)
          const sortedEvents = [...eventsResult.data].sort((a, b) => {
            // Featured events first
            if (a.is_featured && !b.is_featured) return -1
            if (!a.is_featured && b.is_featured) return 1

            // Then sort by date (upcoming first)
            const dateA = new Date(`${a.date}T${a.time}`)
            const dateB = new Date(`${b.date}T${b.time}`)
            return dateA.getTime() - dateB.getTime()
          })

          // Show only first 3 events
          setEvents(sortedEvents.slice(0, 3))
          setUseApiData(true)
        } else {
          setEvents([])
          setUseApiData(false)
        }
      } catch (error) {
        console.error('Failed to fetch events from API:', error)
        setEvents([])
        setUseApiData(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [])

  if (isLoading) {
    return (
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-sky-200/30 dark:bg-sky-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6 text-base px-6 py-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 shadow-sm">
              <Calendar className="w-5 h-5 mr-2" />
              Upcoming Events
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Don't Miss Out on <span className="gradient-text">Exciting Events</span> 🎉
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join us for <span className="font-semibold text-foreground">thrilling performances</span>, <span className="font-semibold text-foreground">competitive events</span>, and <span className="font-semibold text-foreground">special celebrations</span> throughout the school year. Experience the vibrant spirit of our community!
            </p>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading exciting events...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // If no events, don't render the section
  if (!events || events.length === 0) {
    return null
  }

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-sky-200/30 dark:bg-sky-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <Badge variant="secondary" className="mb-6 text-base px-6 py-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 shadow-sm animate-fadeIn">
            <Calendar className="w-5 h-5 mr-2" />
            Upcoming Events
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight animate-fadeIn">
            Don't Miss Out on <span className="gradient-text">Exciting Events</span> 🎉
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fadeIn">
            Join us for <span className="font-semibold text-foreground">thrilling performances</span>, <span className="font-semibold text-foreground">competitive events</span>, and <span className="font-semibold text-foreground">special celebrations</span> throughout the school year. Experience the vibrant spirit of our community!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {events.map((event, index) => {
            // Generate slug if not present
            const eventSlug = event.slug || event.title
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim()

            // Get the first tag for category display
            const categoryTag = event.tags && event.tags.length > 0 ? event.tags[0].name : 'General'

            return (
              <AnimatedCard
                key={event.id}
                variant="lift"
                className="group cursor-pointer hover:scale-[1.02] transition-all duration-500 animate-slideInUp overflow-hidden bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link href={`/guess/event/${eventSlug}`}>
                  {/* Event Image */}
                  <div className="relative w-full h-56 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 overflow-hidden">
                    {event.eventImage ? (
                      <>
                        <Image
                          src={event.eventImage}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized={event.eventImage.includes('imagedelivery.net')}
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <Calendar className="w-20 h-20 text-primary/30 mb-2" />
                        <span className="text-sm text-muted-foreground font-medium">Event Image</span>
                      </div>
                    )}

                    {/* Featured Badge Overlay */}
                    {event.is_featured && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg px-3 py-1.5 text-xs font-bold">
                          ⭐ Featured
                        </Badge>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <Badge variant="secondary" className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-foreground border border-border shadow-md px-3 py-1.5 text-xs font-semibold">
                        {categoryTag}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-b from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-800/50">
                    {/* Event Title */}
                    <div className="mb-5">
                      <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
                        {event.title}
                      </h3>

                      {/* Description if available */}
                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Event Details Grid */}
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-3 group/item">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover/item:bg-blue-500 dark:group-hover/item:bg-blue-600 transition-colors">
                          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover/item:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground font-medium mb-0.5">Date</p>
                          <p className="text-sm font-semibold text-foreground truncate">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 group/item">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover/item:bg-indigo-500 dark:group-hover/item:bg-indigo-600 transition-colors">
                          <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover/item:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground font-medium mb-0.5">Time</p>
                          <p className="text-sm font-semibold text-foreground truncate">{event.time}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 group/item">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover/item:bg-purple-500 dark:group-hover/item:bg-purple-600 transition-colors">
                          <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover/item:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground font-medium mb-0.5">Location</p>
                          <p className="text-sm font-semibold text-foreground truncate">{event.location}</p>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-primary group-hover:text-primary/80 transition-colors">
                        <span className="text-sm font-bold">View Event Details</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
            )
          })}
        </div>

        {/* View All Events Button */}
        <div className="text-center mt-8">
          <div className="inline-block">
            <AnimatedButton
              variant="default"
              size="lg"
              className="group bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-xl hover:shadow-2xl transition-all duration-500 px-8 py-6 text-lg font-bold rounded-full"
              asChild
            >
              <Link href="/guess/event" className="flex items-center gap-3">
                <PartyPopper className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                <span>Explore All Events</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </AnimatedButton>
          </div>

          {/* Subtitle */}
          <p className="mt-4 text-sm text-muted-foreground font-medium text-center mx-auto">
            Discover more exciting happenings at our school
          </p>
        </div>

        {/* Data Source Indicator (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 text-center">
            <Badge variant="outline" className="text-xs">
              {useApiData ? '✅ Using API Data' : '⚠️ Using Static Data'}
            </Badge>
          </div>
        )}
      </div>
    </section>
  )
}
