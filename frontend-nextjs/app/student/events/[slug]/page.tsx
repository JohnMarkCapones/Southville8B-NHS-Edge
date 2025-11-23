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
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Enhanced Back Button */}
        <div className="mb-6 sm:mb-8 animate-in slide-in-from-left duration-500">
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={() => router.push("/student/events")}
            className="group hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-background/80 border-border/50 shadow-md hover:shadow-xl hover:bg-primary hover:text-primary-foreground hover:border-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Events
          </AnimatedButton>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Enhanced Event Header */}
            <div className="animate-in slide-in-from-left duration-700">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Badge
                  variant="outline"
                  className="flex items-center gap-2 hover:scale-110 transition-all duration-300 bg-gradient-to-r from-background/90 to-background/80 backdrop-blur-md border-school-blue/30 text-school-blue shadow-sm hover:shadow-md hover:border-school-blue/50"
                >
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">School Event</span>
                </Badge>
                {event.is_featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 via-school-gold to-amber-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 animate-gentleGlow">
                    <Star className="w-3 h-3 mr-1 fill-current animate-pulse" />
                    <span className="text-xs sm:text-sm font-semibold">Featured</span>
                  </Badge>
                )}
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors cursor-default group">
                  <div className="p-1.5 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="font-medium">{viewCount} views</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-school-blue via-vibrant-indigo to-school-gold bg-clip-text text-transparent leading-tight animate-in slide-in-from-bottom duration-700">
                {event.title}
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed animate-in fade-in duration-700 delay-200">
                {event.description}
              </p>

              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
                    bgGradient: "from-blue-500/10 to-indigo-500/10",
                    iconBg: "from-blue-500 to-indigo-500",
                  },
                  {
                    icon: MapPin,
                    title: event.location,
                    subtitle: "Venue",
                    color: "text-vibrant-indigo",
                    bgGradient: "from-indigo-500/10 to-purple-500/10",
                    iconBg: "from-indigo-500 to-purple-500",
                  },
                  {
                    icon: Users,
                    title: event.organizer?.fullName || "Event Organizer",
                    subtitle: "Organizer",
                    color: "text-school-gold",
                    bgGradient: "from-amber-500/10 to-orange-500/10",
                    iconBg: "from-amber-500 to-orange-500",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`group relative p-4 sm:p-6 bg-card/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border/50 hover:bg-card/80 hover:shadow-2xl hover:shadow-school-blue/10 transition-all duration-500 hover:scale-105 hover:-translate-y-1 cursor-pointer animate-in slide-in-from-bottom ${index === 2 ? 'sm:col-span-2' : ''}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative flex items-center gap-3 sm:gap-4">
                      <div className={`p-2.5 sm:p-3 bg-gradient-to-br ${item.iconBg} rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                        <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-foreground text-sm sm:text-base md:text-lg truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground font-medium">{item.subtitle}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 animate-in slide-in-from-bottom duration-700 delay-500">
                <AnimatedButton
                  variant="gradient"
                  size="lg"
                  className="group px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-semibold shadow-2xl hover:shadow-school-blue/30 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-school-blue via-vibrant-indigo to-school-gold"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="hidden xs:inline">Register for Event</span>
                  <span className="xs:hidden">Register</span>
                </AnimatedButton>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`group px-4 sm:px-6 py-3 sm:py-4 hover:scale-105 transition-all duration-300 ${isFavorite ? "bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700 text-pink-600 dark:text-pink-400 shadow-lg shadow-pink-500/20" : "hover:border-pink-300 dark:hover:border-pink-700"}`}
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 transition-all duration-300 ${isFavorite ? "fill-current text-pink-500 scale-110" : "group-hover:scale-110"}`} />
                  <span className="hidden sm:inline">{isFavorite ? "Favorited" : "Add to Favorites"}</span>
                  <span className="sm:hidden">{isFavorite ? "Saved" : "Save"}</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setHasNotification(!hasNotification)}
                  className={`group px-4 sm:px-6 py-3 sm:py-4 hover:scale-105 transition-all duration-300 ${hasNotification ? "bg-school-blue/10 border-school-blue text-school-blue shadow-lg shadow-school-blue/20" : "hover:border-school-blue"}`}
                >
                  <Bell className={`w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 transition-all duration-300 ${hasNotification ? "animate-pulse" : "group-hover:animate-pulse"}`} />
                  <span className="hidden sm:inline">{hasNotification ? "Notifications On" : "Notify Me"}</span>
                  <span className="sm:hidden">{hasNotification ? "On" : "Notify"}</span>
                </Button>

                <div className="flex gap-2 sm:gap-2.5">
                  {[
                    {
                      icon: Facebook,
                      platform: "facebook",
                      color: "hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300",
                    },
                    {
                      icon: Twitter,
                      platform: "twitter",
                      color: "hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300",
                    },
                    {
                      icon: Share2,
                      platform: "share",
                      color: "hover:text-school-gold hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-300",
                    },
                  ].map((social) => (
                    <Button
                      key={social.platform}
                      variant="outline"
                      size="lg"
                      onClick={() => shareEvent(social.platform)}
                      className={`p-3 sm:p-4 hover:scale-110 hover:rotate-6 transition-all duration-300 ${social.color} hover:shadow-lg`}
                    >
                      <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Event Image */}
            <div className="animate-in slide-in-from-right duration-700">
              <AnimatedCard variant="lift" className="overflow-hidden group rounded-2xl shadow-2xl">
                <div className="relative">
                  <Image
                    src={event.eventImage || "/placeholder.svg"}
                    alt={event.title}
                    width={1200}
                    height={630}
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                    priority={false}
                    sizes="(min-width: 1024px) 1024px, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Image Overlay Badge */}
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-white/90 dark:bg-black/90 backdrop-blur-md text-foreground border-0 shadow-lg px-3 py-1.5">
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        <span className="font-semibold">Click to expand</span>
                      </Badge>
                    </div>
                  </div>
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

          {/* Enhanced Sidebar */}
          <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right duration-700 delay-300">
            {/* Spacer to align with Event Highlights - only on large screens */}
            <div className="hidden lg:block h-[950px]"></div>

            {/* Enhanced Event Organizer */}
            <AnimatedCard
              variant="lift"
              className="bg-gradient-to-br from-card to-card/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-school-blue to-vibrant-indigo rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">Event Organizer</h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="group p-4 bg-gradient-to-br from-muted/50 to-background rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-border/50">
                    <div className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">{event.organizer?.fullName || "Event Organizer"}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1.5 break-all">{event.organizer?.email || "organizer@school.edu"}</div>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Enhanced Tags */}
            {event.tags && event.tags.length > 0 && (
              <AnimatedCard
                variant="lift"
                className="bg-gradient-to-br from-card to-card/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-gradient-to-br from-school-gold to-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Bookmark className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">Event Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1.5 text-xs sm:text-sm bg-gradient-to-r from-school-blue/10 to-school-gold/10 text-school-blue border-school-blue/20 hover:scale-110 hover:shadow-lg hover:bg-gradient-to-r hover:from-school-blue hover:to-school-gold hover:text-white hover:border-transparent transition-all duration-300 cursor-pointer"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* Enhanced Quick Actions */}
            <AnimatedCard
              variant="lift"
              className="bg-gradient-to-br from-card to-card/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-vibrant-indigo to-school-blue rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-school-blue to-vibrant-indigo hover:from-school-blue/90 hover:to-vibrant-indigo/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                    <Download className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                    <span className="text-sm sm:text-base">Download Event Info</span>
                  </Button>
                  <Button variant="outline" className="w-full hover:bg-muted hover:scale-105 hover:shadow-lg transition-all duration-300 group">
                    <Calendar className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm sm:text-base">Add to Calendar</span>
                  </Button>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>

      {/* Enhanced Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-in slide-in-from-right duration-500">
          <AnimatedCard variant="lift" className="bg-gradient-to-r from-school-green via-emerald-500 to-green-600 text-white shadow-2xl border-0 hover:scale-105 transition-transform duration-300">
            <div className="p-4 sm:p-6 flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base">Success!</div>
                <div className="text-xs sm:text-sm opacity-90">Link copied to clipboard</div>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="ml-2 p-1.5 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
          </AnimatedCard>
        </div>
      )}
    </StudentLayout>
  )
}
