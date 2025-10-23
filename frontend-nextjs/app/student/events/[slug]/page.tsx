"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import StudentLayout from "@/components/student/student-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import {
  Calendar,
  MapPin,
  Users,
  Heart,
  Share2,
  Bell,
  ArrowLeft,
  Star,
  CheckCircle,
  HelpCircle,
  Eye,
  Sparkles,
  Facebook,
  Twitter,
  Bookmark,
  Download,
} from "lucide-react"
import { getEventBySlug } from "@/lib/api/endpoints/events"
import type { Event } from "@/lib/api/types/events"
import {
  EventScheduleTimeline,
  EventFAQAccordion,
  EventHighlightsShowcase,
  EventAdditionalInfoComponent
} from "@/components/events"

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [hasNotification, setHasNotification] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [viewCount] = useState(Math.floor(Math.random() * 500) + 100)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true)
        const slug = params.slug as string
        const eventData = await getEventBySlug(slug)
        if (eventData) {
          setEvent(eventData)
        } else {
          setError("Event not found")
        }
      } catch (err) {
        console.error("Failed to fetch event:", err)
        setError("Failed to load event details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [params.slug])

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessMessage])

  const shareEvent = (platform: string) => {
    const url = window.location.href
    const text = `Check out ${event?.title} at Southville 8B NHS!`
    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`)
        break
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`)
        break
      case "share":
        navigator.clipboard.writeText(url)
        setShowSuccessMessage(true)
        break
    }
  }

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center animate-in fade-in duration-700">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-school-blue/20 to-school-gold/20 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-school-blue border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-school-blue to-school-gold bg-clip-text text-transparent">
              Loading Event...
            </h1>
            <p className="text-muted-foreground">Please wait while we fetch the event details.</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  if (error || !event) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center animate-in fade-in duration-700">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
              <HelpCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-red-600 dark:text-red-400">Event Not Found</h1>
            <p className="text-muted-foreground mb-8">{error || "The event you're looking for doesn't exist."}</p>
            <Button onClick={() => router.push("/student/events")} size="lg" className="bg-school-blue hover:bg-school-blue/90">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={() => router.push("/student/events")}
            className="hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-background/80 border-border/50 shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </AnimatedButton>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
            <div className="animate-in slide-in-from-left duration-700">
              <div className="flex items-center gap-3 mb-6">
                <Badge
                  variant="outline"
                  className="flex items-center gap-2 hover:scale-105 transition-all duration-300 bg-background/80 backdrop-blur-sm border-school-blue/30 text-school-blue"
                >
                  <Calendar className="w-4 h-4" />
                  School Event
                </Badge>
                {event.is_featured && (
                  <Badge className="bg-gradient-to-r from-school-gold to-amber-600 text-white shadow-lg animate-pulse">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  {viewCount} views
                </div>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-school-blue via-vibrant-indigo to-school-gold bg-clip-text text-transparent leading-tight">
                {event.title}
              </h1>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed animate-in fade-in duration-700 delay-200">
                {event.description}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  {
                    icon: Calendar,
                    title: new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                    subtitle: event.time,
                    color: "text-school-blue",
                  },
                  {
                    icon: MapPin,
                    title: event.location,
                    subtitle: "Venue",
                    color: "text-vibrant-indigo",
                  },
                  {
                    icon: Users,
                    title: event.organizer?.fullName || "Event Organizer",
                    subtitle: "Organizer",
                    color: "text-school-gold",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="group relative p-6 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 hover:bg-card/80 hover:shadow-xl hover:shadow-school-blue/10 transition-all duration-500 hover:scale-105 cursor-pointer animate-in slide-in-from-bottom"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-school-blue/5 to-school-gold/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-background to-muted rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-lg">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.subtitle}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 animate-in slide-in-from-bottom duration-700 delay-500">
                <AnimatedButton
                  variant="gradient"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-school-blue/25 hover:scale-105 transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Register for Event
                </AnimatedButton>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`px-6 py-4 hover:scale-105 transition-all duration-300 ${isFavorite ? "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400" : ""}`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFavorite ? "fill-current text-pink-500" : ""}`} />
                  {isFavorite ? "Favorited" : "Add to Favorites"}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setHasNotification(!hasNotification)}
                  className={`px-6 py-4 hover:scale-105 transition-all duration-300 ${hasNotification ? "bg-school-blue/10 border-school-blue text-school-blue" : ""}`}
                >
                  <Bell className={`w-5 h-5 mr-2 ${hasNotification ? "animate-pulse" : ""}`} />
                  {hasNotification ? "Notifications On" : "Notify Me"}
                </Button>

                <div className="flex gap-2">
                  {[
                    {
                      icon: Facebook,
                      platform: "facebook",
                      color: "hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                    },
                    {
                      icon: Twitter,
                      platform: "twitter",
                      color: "hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                    },
                    {
                      icon: Share2,
                      platform: "share",
                      color: "hover:text-school-gold hover:bg-amber-50 dark:hover:bg-amber-900/20",
                    },
                  ].map((social) => (
                    <Button
                      key={social.platform}
                      variant="outline"
                      size="lg"
                      onClick={() => shareEvent(social.platform)}
                      className={`p-4 hover:scale-110 transition-all duration-300 ${social.color} hover:shadow-lg`}
                    >
                      <social.icon className="w-5 h-5" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Event Image */}
            <div className="animate-in slide-in-from-right duration-700">
              <AnimatedCard variant="lift" className="overflow-hidden group">
                <div className="relative">
                  <Image
                    src={event.eventImage || "/placeholder.svg"}
                    alt={event.title}
                    width={1200}
                    height={630}
                    className="w-full h-80 lg:h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                    priority={false}
                    sizes="(min-width: 1024px) 1024px, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </AnimatedCard>
            </div>

            {/* Event Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <div className="animate-in slide-in-from-left duration-700 delay-300">
                <EventHighlightsShowcase
                  highlights={event.highlights}
                  variant="grid"
                  showImages={true}
                  maxItems={6}
                />
              </div>
            )}

            {/* Event Schedule */}
            {event.schedule && event.schedule.length > 0 && (
              <div className="animate-in slide-in-from-left duration-700 delay-500">
                <EventScheduleTimeline
                  schedule={event.schedule}
                  variant="detailed"
                  showIcons={true}
                />
              </div>
            )}

            {/* Event FAQ */}
            {event.faq && event.faq.length > 0 && (
              <div className="animate-in slide-in-from-left duration-700 delay-700">
                <EventFAQAccordion
                  faqs={event.faq}
                  variant="default"
                  showSearch={true}
                />
              </div>
            )}

            {/* Additional Information */}
            {event.additionalInfo && event.additionalInfo.length > 0 && (
              <div className="animate-in slide-in-from-left duration-700 delay-900">
                <EventAdditionalInfoComponent
                  additionalInfo={event.additionalInfo}
                  variant="grid"
                  showIcons={true}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-in slide-in-from-right duration-700 delay-300">
            {/* Spacer to align with Event Highlights */}
            <div className="h-0 lg:h-[950px]"></div>

            {/* Event Organizer */}
            <AnimatedCard
              variant="lift"
              className="bg-gradient-to-br from-card to-card/80 border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-school-blue to-vibrant-indigo rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Event Organizer</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-muted/50 to-background rounded-lg">
                    <div className="font-bold text-lg text-foreground">{event.organizer?.fullName || "Event Organizer"}</div>
                    <div className="text-sm text-muted-foreground mt-1">{event.organizer?.email || "organizer@school.edu"}</div>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <AnimatedCard
                variant="lift"
                className="bg-gradient-to-br from-card to-card/80 border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-school-gold to-amber-600 rounded-lg">
                      <Bookmark className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Event Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1 bg-gradient-to-r from-school-blue/10 to-school-gold/10 text-school-blue border-school-blue/20 hover:scale-110 hover:shadow-lg hover:bg-gradient-to-r hover:from-school-blue hover:to-school-gold hover:text-white hover:border-transparent transition-all duration-300 cursor-pointer"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* Quick Actions */}
            <AnimatedCard
              variant="lift"
              className="bg-gradient-to-br from-card to-card/80 border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-vibrant-indigo to-school-blue rounded-lg">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <Button className="w-full bg-school-blue hover:bg-school-blue/90">
                    <Download className="w-4 h-4 mr-2" />
                    Download Event Info
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right duration-500">
          <AnimatedCard variant="lift" className="bg-gradient-to-r from-school-green to-emerald-500 text-white shadow-2xl border-0">
            <div className="p-6 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <CheckCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="font-semibold">Success!</div>
                <div className="text-sm opacity-90">Link copied to clipboard</div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}
    </StudentLayout>
  )
}
