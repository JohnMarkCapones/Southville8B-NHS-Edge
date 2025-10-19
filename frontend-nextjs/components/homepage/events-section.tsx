"use client"

import React, { useState } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Calendar, ArrowRight, Music, Microscope, Trophy, Clock, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"
import { fetchEventsFromAPI } from "@/app/guess/event/data-mapping"
import { EVENTS } from "@/app/guess/event/[slug]/data"

interface Event {
  id: string
  title: string
  slug: string
  date: string
  time: string
  location: string
  category: string
  featured: boolean
}

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
        const apiEvents = await fetchEventsFromAPI()
        if (apiEvents && apiEvents.length > 0) {
          setEvents(apiEvents.slice(0, 3)) // Show only first 3 events
          setUseApiData(true)
        } else {
          // Fallback to static data
          setEvents(EVENTS.slice(0, 3))
          setUseApiData(false)
        }
      } catch (error) {
        console.error('Failed to fetch events from API, using static data:', error)
        setEvents(EVENTS.slice(0, 3))
        setUseApiData(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [])

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming Events
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Don't Miss Out on <span className="gradient-text">Exciting Events</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join us for performances, competitions, and special celebrations throughout the school year.
            </p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Calendar className="w-4 h-4 mr-2" />
            Upcoming Events
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            Don't Miss Out on <span className="gradient-text">Exciting Events</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join us for performances, competitions, and special celebrations throughout the school year.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {events.map((event, index) => {
            const IconComponent = categoryIcons[event.category as keyof typeof categoryIcons] || Calendar
            const colorClass = categoryColors[event.category as keyof typeof categoryColors] || "from-gray-500 to-gray-600"
            
            return (
              <AnimatedCard
                key={event.id}
                variant="lift"
                className="group cursor-pointer hover:scale-105 transition-all duration-300 animate-slideInUp overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link href={`/guess/event/${event.slug}`}>
                  <div className="p-6">
                    {/* Event Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      {event.featured && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          Featured
                        </Badge>
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="mt-4 pt-4 border-t border-transparent group-hover:border-border transition-colors">
                      <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <span className="text-sm font-medium">Learn more</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
            )
          })}
        </div>

        {/* View All Events Button */}
        <div className="text-center">
          <AnimatedButton
            variant="outline"
            size="lg"
            className="group hover:scale-105 transition-all duration-300"
            asChild
          >
            <Link href="/guess/event">
              View All Events
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </AnimatedButton>
        </div>

        {/* Data Source Indicator (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 text-center">
            <Badge variant="outline" className="text-xs">
              {useApiData ? 'Using API Data' : 'Using Static Data'}
            </Badge>
          </div>
        )}
      </div>
    </section>
  )
}
