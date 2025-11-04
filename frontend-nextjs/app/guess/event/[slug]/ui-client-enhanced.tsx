"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  CalendarIcon,
  MapPin,
  Users,
  Star,
  ChevronLeft,
  Clock,
  Phone,
  Mail,
  Facebook,
  Twitter,
  CheckCircle,
  Trophy,
  Microscope,
  GraduationCap,
  Palette,
  X,
  Share2,
  Heart,
  Bookmark,
  Eye,
  Sparkles,
  HelpCircle,
  Calendar,
  Download,
  Bell,
  BellOff,
  QrCode,
  TrendingUp,
  Award,
  Zap,
  PartyPopper,
  Copy,
  Check,
  ArrowRight,
  MapPinned,
  CalendarCheck,
  UserPlus,
  Shield,
} from "lucide-react"

// Import our event components
import {
  EventScheduleTimeline,
  EventFAQAccordion,
  EventHighlightsShowcase,
  EventAdditionalInfoComponent,
} from "@/components/events"

// Import API functions
import { getEventBySlug, getEvents } from "@/lib/api/endpoints/events"
import type { Event } from "@/lib/api/types/events"

// Fallback to static data if API fails
import { EVENTS } from "./data"

interface ClientPageProps {
  params: { slug: string }
}

export default function ClientPageEnhanced({ params }: ClientPageProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [similarEvents, setSimilarEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [showRSVP, setShowRSVP] = useState(false)
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 500) + 100)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // RSVP form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")

  const heroRef = useRef<HTMLDivElement>(null)

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true)
        const eventData = await getEventBySlug(params.slug)
        if (eventData) {
          const mappedEvent = {
            ...eventData,
            imageUrl: eventData.eventImage || "/placeholder.svg",
            fullDescription: eventData.description,
            category: "Special Event",
            registrationCount: Math.floor(Math.random() * 100) + 20,
            maxRegistration: 150,
            price: undefined,
            featured: eventData.is_featured || false,
            organizer: eventData.organizer || {
              id: "default",
              fullName: "Event Organizer",
              email: "organizer@school.edu",
            },
            organizerContact: eventData.organizer?.email || "organizer@school.edu",
            organizerPhone: undefined,
            tags: eventData.tags || [],
            highlights: eventData.highlights?.map((h) => ({
              ...h,
              createdAt: h.createdAt || new Date().toISOString(),
            })) || [],
            schedule: eventData.schedule?.map((s) => ({
              ...s,
              createdAt: s.createdAt || new Date().toISOString(),
            })) || [],
            faq: eventData.faq || [],
            additionalInfo: eventData.additionalInfo || [],
          }
          setEvent(mappedEvent)

          // Fetch similar events
          const eventsResponse = await getEvents({ limit: 4, status: "published" })
          const filteredSimilar = eventsResponse.data.filter((e) => e.id !== eventData.id).slice(0, 3)
          setSimilarEvents(filteredSimilar)
        } else {
          const staticEvent = EVENTS.find((e) => e.slug === params.slug)
          if (staticEvent) {
            setEvent({
              id: staticEvent.id.toString(),
              title: staticEvent.title,
              slug: staticEvent.slug,
              description: staticEvent.description,
              date: staticEvent.date,
              time: staticEvent.time,
              location: staticEvent.location,
              organizerId: "static",
              eventImage: staticEvent.image,
              status: "published" as any,
              visibility: "public" as any,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              tags: staticEvent.tags.map((tag) => ({ id: tag, name: tag, color: "#6366f1" })),
              organizer: {
                id: "static",
                fullName: staticEvent.organizer,
                email: staticEvent.organizerContact,
              },
              highlights: staticEvent.highlights?.map((highlight, index) => ({
                id: `highlight-${index}`,
                title: `Highlight ${index + 1}`,
                content: highlight,
                orderIndex: index,
                createdAt: new Date().toISOString(),
              })),
              schedule: staticEvent.schedule?.map((item, index) => ({
                id: `schedule-${index}`,
                activityTime: item.time,
                activityDescription: item.activity,
                orderIndex: index,
                createdAt: new Date().toISOString(),
              })),
              faq: (staticEvent as any).faq?.map((item: any, index: number) => ({
                id: `faq-${index}`,
                question: item.question,
                answer: item.answer,
                createdAt: new Date().toISOString(),
              })),
              additionalInfo: [],
            })
          }
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

  // Countdown timer
  useEffect(() => {
    if (!event) return

    const calculateTimeLeft = () => {
      const eventDate = new Date(`${event.date}T${event.time}`)
      const now = new Date()
      const difference = eventDate.getTime() - now.getTime()

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [event])

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Auto-hide success message
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessMessage])

  // Simulate view count increase
  useEffect(() => {
    const interval = setInterval(() => {
      setViewCount((prev) => prev + Math.floor(Math.random() * 3))
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setRsvpSubmitted(true)
    setShowRSVP(false)
    setIsRegistered(true)
    setShowSuccessMessage(true)
  }

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
      case "copy":
        navigator.clipboard.writeText(url)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
        break
    }
  }

  const downloadCalendar = () => {
    if (!event) return
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${event.date.replace(/-/g, "")}T${event.time.replace(/:/g, "")}00
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: "text/calendar" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${event.slug}.ics`
    link.click()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center animate-in fade-in duration-700">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-full animate-ping opacity-20" />
            <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-800 to-violet-600 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">
            Loading Event...
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Preparing an amazing event experience for you
          </p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center animate-in fade-in duration-700">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
            <HelpCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-800 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent">
            Event Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            {error || "The event you're looking for doesn't exist or may have been moved."}
          </p>
          <Link href="/guess/event">
            <AnimatedButton variant="gradient" size="lg" className="shadow-lg hover:shadow-xl">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Events
            </AnimatedButton>
          </Link>
        </div>
      </div>
    )
  }

  const registrationProgress = ((event as any).registrationCount / (event as any).maxRegistration) * 100 || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Floating Action Buttons */}
      <div className="fixed right-6 bottom-6 z-40 flex flex-col gap-3">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group p-4 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300"
          title="Scroll to top"
        >
          <CalendarCheck className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowShareModal(true)}
          className="group p-4 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300"
          title="Share event"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className={`group p-4 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 ${
            notificationsEnabled
              ? "bg-gradient-to-r from-green-500 to-emerald-500"
              : "bg-gradient-to-r from-slate-400 to-slate-500"
          }`}
          title={notificationsEnabled ? "Notifications enabled" : "Enable notifications"}
        >
          {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6 animate-in slide-in-from-left duration-500">
          <Link href="/guess/event">
            <AnimatedButton
              variant="outline"
              size="sm"
              className="hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 shadow-lg hover:shadow-xl"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Events
            </AnimatedButton>
          </Link>
        </div>

        {/* Hero Section with Parallax */}
        <div
          ref={heroRef}
          className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-700"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
            <Image
              src={event.eventImage || "/placeholder.svg"}
              alt={event.title}
              fill
              className="object-cover"
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            {/* Hero Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
              <div className="max-w-4xl">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Badge className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white px-4 py-2 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Special Event
                  </Badge>
                  {event.featured && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg animate-pulse px-4 py-2">
                      <Star className="w-4 h-4 mr-2 fill-current" />
                      Featured
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">{viewCount.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">Trending</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight drop-shadow-2xl">
                  {event.title}
                </h1>

                {/* Description */}
                <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-3xl drop-shadow-lg">
                  {event.description}
                </p>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-4">
                  {!isRegistered ? (
                    <AnimatedButton
                      variant="default"
                      size="lg"
                      onClick={() => setShowRSVP(true)}
                      className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      Register Now
                    </AnimatedButton>
                  ) : (
                    <AnimatedButton
                      variant="outline"
                      size="lg"
                      disabled
                      className="bg-green-500/20 border-green-500 text-white px-8 py-6"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Registered
                    </AnimatedButton>
                  )}

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={downloadCalendar}
                    className="border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 px-6 py-6 hover:scale-105 transition-all duration-300"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Add to Calendar
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 px-6 py-6 hover:scale-105 transition-all duration-300 ${
                      isBookmarked ? "text-pink-400" : "text-white"
                    }`}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                    {isBookmarked ? "Saved" : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="mb-12 animate-in slide-in-from-bottom duration-700">
          <AnimatedCard variant="gradient" className="p-8 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10 border-0">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-800 to-violet-600 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent mb-2">
                Event Starts In
              </h2>
              <p className="text-slate-600 dark:text-slate-400">Don't miss this amazing event!</p>
            </div>
            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in zoom-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-violet-600 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent mb-2">
                    {item.value.toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-left duration-700">
              {[
                {
                  icon: CalendarIcon,
                  title: "Date & Time",
                  value: new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                  subtitle: event.time,
                  gradient: "from-cyan-500 to-blue-500",
                },
                {
                  icon: MapPin,
                  title: "Location",
                  value: event.location,
                  subtitle: "Venue Details",
                  gradient: "from-violet-500 to-purple-500",
                },
                {
                  icon: Users,
                  title: "Attendees",
                  value: `${(event as any).registrationCount || 0} registered`,
                  subtitle: `${(event as any).maxRegistration || 150} spots available`,
                  gradient: "from-pink-500 to-rose-500",
                },
                {
                  icon: Award,
                  title: "Status",
                  value: isRegistered ? "You're Registered!" : "Registration Open",
                  subtitle: isRegistered ? "See you there!" : "Limited spots available",
                  gradient: "from-emerald-500 to-green-500",
                },
              ].map((card, index) => (
                <AnimatedCard
                  key={index}
                  variant="lift"
                  className="group relative overflow-hidden bg-white dark:bg-slate-800"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className="p-6 relative">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 bg-gradient-to-br ${card.gradient} rounded-xl shadow-lg`}>
                        <card.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{card.title}</div>
                        <div className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">{card.value}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{card.subtitle}</div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>

            {/* Registration Progress */}
            <AnimatedCard variant="lift" className="p-6 bg-white dark:bg-slate-800 animate-in slide-in-from-left duration-700 delay-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Registration Status</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {(event as any).registrationCount || 0} out of {(event as any).maxRegistration || 150} spots taken
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-violet-600 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">
                  {Math.round(registrationProgress)}%
                </div>
              </div>
              <Progress value={registrationProgress} className="h-3" />
              <div className="mt-4 flex items-center gap-2 text-sm">
                {registrationProgress > 75 ? (
                  <>
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-600 dark:text-orange-400 font-medium">Filling up fast!</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">Plenty of spots available</span>
                  </>
                )}
              </div>
            </AnimatedCard>

            {/* Event Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <div className="animate-in slide-in-from-left duration-700 delay-500">
                <EventHighlightsShowcase highlights={event.highlights} variant="grid" showImages={true} maxItems={6} />
              </div>
            )}

            {/* Event Schedule */}
            {event.schedule && event.schedule.length > 0 && (
              <div className="animate-in slide-in-from-left duration-700 delay-700">
                <EventScheduleTimeline schedule={event.schedule} variant="detailed" showIcons={true} />
              </div>
            )}

            {/* Event FAQ */}
            {event.faq && event.faq.length > 0 && (
              <div className="animate-in slide-in-from-left duration-700 delay-900">
                <EventFAQAccordion faqs={event.faq} variant="default" showSearch={true} />
              </div>
            )}

            {/* Additional Information */}
            {event.additionalInfo && event.additionalInfo.length > 0 && (
              <div className="animate-in slide-in-from-left duration-700 delay-1000">
                <EventAdditionalInfoComponent additionalInfo={event.additionalInfo} variant="grid" showIcons={true} />
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6 animate-in slide-in-from-right duration-700">
            {/* Event Organizer */}
            <AnimatedCard variant="lift" className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80 border-0 shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Event Organizer</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl hover:shadow-lg transition-shadow duration-300">
                    <div className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                      {event.organizer?.fullName || "Event Organizer"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${event.organizer?.email || "organizer@school.edu"}`} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                        {event.organizer?.email || "organizer@school.edu"}
                      </a>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-300 dark:hover:border-cyan-700 hover:scale-105 transition-all duration-300"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Organizer
                  </Button>
                </div>
              </div>
            </AnimatedCard>

            {/* Event Tags */}
            {event.tags && event.tags.length > 0 && (
              <AnimatedCard variant="lift" className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80 border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg">
                      <Bookmark className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Event Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1.5 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800 hover:scale-110 hover:shadow-lg hover:from-violet-500 hover:to-purple-500 hover:text-white transition-all duration-300 cursor-pointer"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* Similar Events */}
            {similarEvents.length > 0 && (
              <AnimatedCard variant="lift" className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80 border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
                      <PartyPopper className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Similar Events</h3>
                  </div>
                  <div className="space-y-4">
                    {similarEvents.map((similarEvent, index) => (
                      <Link key={index} href={`/guess/event/${similarEvent.slug}`}>
                        <div className="group p-4 bg-white dark:bg-slate-700/50 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                            {similarEvent.title}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{new Date(similarEvent.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{similarEvent.location}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/guess/event">
                    <Button variant="outline" className="w-full mt-4 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-300 dark:hover:border-pink-700">
                      View All Events
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </AnimatedCard>
            )}

            {/* Quick Stats */}
            <AnimatedCard variant="lift" className="bg-gradient-to-br from-cyan-500 to-violet-500 text-white border-0 shadow-xl">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-6">Event Stats</h3>
                <div className="space-y-4">
                  {[
                    { icon: Eye, label: "Total Views", value: viewCount.toLocaleString() },
                    { icon: Heart, label: "People Interested", value: Math.floor(viewCount * 0.3).toLocaleString() },
                    { icon: Share2, label: "Shares", value: Math.floor(viewCount * 0.15).toLocaleString() },
                  ].map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>

      {/* RSVP Modal */}
      {showRSVP && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <AnimatedCard
            variant="lift"
            className="w-full max-w-md animate-in zoom-in duration-300 bg-white dark:bg-slate-800 shadow-2xl"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-800 to-violet-600 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">
                    Register for Event
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{event.title}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRSVP(false)}
                  className="hover:scale-110 transition-transform duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <form onSubmit={handleRSVP} className="space-y-6">
                <div className="animate-in slide-in-from-bottom duration-300 delay-100">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200"
                  />
                </div>
                <div className="animate-in slide-in-from-bottom duration-300 delay-200">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200"
                  />
                </div>
                <div className="animate-in slide-in-from-bottom duration-300 delay-300">
                  <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200"
                  />
                </div>
                <div className="animate-in slide-in-from-bottom duration-300 delay-400">
                  <Label htmlFor="notes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200"
                  />
                </div>
                <div className="flex gap-3 animate-in slide-in-from-bottom duration-300 delay-500">
                  <AnimatedButton
                    type="submit"
                    variant="gradient"
                    className="flex-1 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Registering...
                      </div>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Register
                      </>
                    )}
                  </AnimatedButton>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRSVP(false)}
                    className="px-6 py-3 hover:scale-105 transition-transform duration-200"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </AnimatedCard>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <AnimatedCard
            variant="lift"
            className="w-full max-w-md animate-in zoom-in duration-300 bg-white dark:bg-slate-800 shadow-2xl"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-800 to-violet-600 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">
                  Share Event
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareModal(false)}
                  className="hover:scale-110 transition-transform duration-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-gradient-to-br from-slate-100 to-white dark:from-slate-700 dark:to-slate-800 rounded-2xl p-8 mb-6 flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-32 h-32 mx-auto mb-4 text-slate-400" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Scan to view event</p>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-3 mb-6">
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700"
                  onClick={() => shareEvent("facebook")}
                >
                  <Facebook className="w-5 h-5 mr-3 text-blue-600" />
                  Share on Facebook
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-300 dark:hover:border-sky-700"
                  onClick={() => shareEvent("twitter")}
                >
                  <Twitter className="w-5 h-5 mr-3 text-sky-500" />
                  Share on Twitter
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300 dark:hover:border-violet-700"
                  onClick={() => shareEvent("copy")}
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-5 h-5 mr-3 text-green-500" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-3 text-violet-600" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}

      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right duration-500">
          <AnimatedCard
            variant="lift"
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl border-0"
          >
            <div className="p-6 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <CheckCircle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="font-semibold text-lg">Success!</div>
                <div className="text-sm opacity-90">
                  {rsvpSubmitted ? `Registered for ${event.title}` : "Action completed successfully"}
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}
    </div>
  )
}
