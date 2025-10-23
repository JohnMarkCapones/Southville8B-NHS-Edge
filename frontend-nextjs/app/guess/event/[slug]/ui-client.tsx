"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import {
  CalendarIcon,
  MapPin,
  Users,
  Star,
  ChevronLeft,
  Clock,
  DollarSign,
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
} from "lucide-react"

// Import our new event components
import { 
  EventScheduleTimeline, 
  EventFAQAccordion, 
  EventHighlightsShowcase, 
  EventAdditionalInfoComponent 
} from "@/components/events"

// Import API functions
import { getEventBySlug } from "@/lib/api/endpoints/events"
import type { Event } from "@/lib/api/types/events"

// Category icons mapping
const categoryIcons = {
  "Arts & Culture": <Palette className="w-5 h-5" />,
  Sports: <Trophy className="w-5 h-5" />,
  Academic: <Microscope className="w-5 h-5" />,
  "Special Event": <GraduationCap className="w-5 h-5" />,
  Social: <Users className="w-5 h-5" />,
}

// Fallback to static data if API fails
import { EVENTS } from "./data"

interface ClientPageProps {
  params: { slug: string }
}

export default function ClientPage({ params }: ClientPageProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [showRSVP, setShowRSVP] = useState(false)
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 500) + 100)

  // RSVP form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true)
        const eventData = await getEventBySlug(params.slug)
        if (eventData) {
          // Map API data to frontend format
          const mappedEvent = {
            ...eventData,
            // Map API field names to frontend expected names
            imageUrl: eventData.eventImage || '/placeholder.svg',
            fullDescription: eventData.description, // Use description as fullDescription if not provided
            category: 'Special Event', // Default category since API doesn't provide this
            registrationCount: 0, // Default since API doesn't provide this
            maxRegistration: undefined, // Default since API doesn't provide this
            price: undefined, // Default since API doesn't provide this
            featured: false, // Default since API doesn't provide this
            organizer: eventData.organizer || { id: 'default', fullName: 'Event Organizer', email: 'organizer@school.edu' },
            organizerContact: eventData.organizer?.email || 'organizer@school.edu',
            organizerPhone: undefined, // Default since API doesn't provide this
            // Ensure arrays are defined and properly formatted
            tags: eventData.tags || [],
            highlights: eventData.highlights?.map(h => ({
              ...h,
              createdAt: h.createdAt || new Date().toISOString()
            })) || [],
            schedule: eventData.schedule?.map(s => ({
              ...s,
              createdAt: s.createdAt || new Date().toISOString()
            })) || [],
            faq: eventData.faq || [],
            additionalInfo: eventData.additionalInfo || []
          }
          setEvent(mappedEvent)
        } else {
          // Fallback to static data
          const staticEvent = EVENTS.find((e) => e.slug === params.slug)
          if (staticEvent) {
            // Convert static event to API format
            setEvent({
              id: staticEvent.id.toString(),
              title: staticEvent.title,
              slug: staticEvent.slug,
              description: staticEvent.description,
              date: staticEvent.date,
              time: staticEvent.time,
              location: staticEvent.location,
              organizerId: 'static',
              eventImage: staticEvent.image,
              status: 'published' as any,
              visibility: 'public' as any,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              tags: staticEvent.tags.map(tag => ({ id: tag, name: tag, color: '#6366f1' })),
              organizer: { id: 'static', fullName: staticEvent.organizer, email: staticEvent.organizerContact },
              highlights: staticEvent.highlights?.map((highlight, index) => ({
                id: `highlight-${index}`,
                title: `Highlight ${index + 1}`,
                content: highlight,
                orderIndex: index,
                createdAt: new Date().toISOString()
              })),
              schedule: staticEvent.schedule?.map((item, index) => ({
                id: `schedule-${index}`,
                activityTime: item.time,
                activityDescription: item.activity,
                orderIndex: index,
                createdAt: new Date().toISOString()
              })),
              faq: (staticEvent as any).faq?.map((item: any, index: number) => ({
                id: `faq-${index}`,
                question: item.question,
                answer: item.answer,
                createdAt: new Date().toISOString()
              })),
              additionalInfo: []
            })
          }
        }
      } catch (err) {
        console.error('Failed to fetch event:', err)
        setError('Failed to load event details')
        // Fallback to static data
        const staticEvent = EVENTS.find((e) => e.slug === params.slug)
        if (staticEvent) {
          // Convert static event to API format
            setEvent({
              id: staticEvent.id.toString(),
              title: staticEvent.title,
              slug: staticEvent.slug,
              description: staticEvent.description,
              date: staticEvent.date,
              time: staticEvent.time,
              location: staticEvent.location,
              organizerId: 'static',
              eventImage: staticEvent.image,
              status: 'published' as any,
              visibility: 'public' as any,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              tags: staticEvent.tags.map(tag => ({ id: tag, name: tag, color: '#6366f1' })),
              organizer: { id: 'static', fullName: staticEvent.organizer, email: staticEvent.organizerContact },
              highlights: staticEvent.highlights?.map((highlight, index) => ({
                id: `highlight-${index}`,
                title: `Highlight ${index + 1}`,
                content: highlight,
                orderIndex: index,
                createdAt: new Date().toISOString()
              })),
              schedule: staticEvent.schedule?.map((item, index) => ({
                id: `schedule-${index}`,
                activityTime: item.time,
                activityDescription: item.activity,
                orderIndex: index,
                createdAt: new Date().toISOString()
              })),
              faq: (staticEvent as any).faq?.map((item: any, index: number) => ({
                id: `faq-${index}`,
                question: item.question,
                answer: item.answer,
                createdAt: new Date().toISOString()
              })),
              additionalInfo: []
            })
        }
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

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
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
      case "share":
        navigator.clipboard.writeText(url)
        setShowSuccessMessage(true)
        break
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center animate-in fade-in duration-700">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-100 to-violet-100 dark:from-cyan-900/30 dark:to-violet-900/30 rounded-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-800 to-violet-600 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">
            Loading Event...
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Please wait while we fetch the event details.
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back to Events Button */}
        <div className="mb-6">
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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
            <div className="animate-in slide-in-from-left duration-700">
              <div className="flex items-center gap-3 mb-6">
                <Badge
                  variant="outline"
                  className="flex items-center gap-2 hover:scale-105 transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200"
                >
                  <Calendar className="w-4 h-4" />
                  Special Event
                </Badge>
                {false && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg animate-pulse">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                  <Eye className="w-4 h-4" />
                  {viewCount} views
                </div>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-800 via-violet-600 to-pink-600 dark:from-cyan-400 dark:via-violet-400 dark:to-pink-400 bg-clip-text text-transparent leading-tight">
                {event.title}
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed animate-in fade-in duration-700 delay-200">
                {event.description}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  {
                    icon: CalendarIcon,
                    title: new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                    subtitle: event.time,
                    color: "text-cyan-600 dark:text-cyan-400",
                  },
                  {
                    icon: MapPin,
                    title: event.location,
                    subtitle: "Venue",
                    color: "text-violet-600 dark:text-violet-400",
                  },
                  {
                    icon: Users,
                    title: `0 registered`,
                    subtitle: "Attendees",
                    color: "text-pink-600 dark:text-pink-400",
                  },
                  // Price removed since API doesn't provide this field
                ].map((item, index) => (
                  <div
                    key={index}
                    className="group relative p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-400/10 transition-all duration-500 hover:scale-105 cursor-pointer animate-in slide-in-from-bottom"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 dark:from-cyan-400/5 dark:to-violet-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-lg">{item.title}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{item.subtitle}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 animate-in slide-in-from-bottom duration-700 delay-500">
                {!isRegistered ? (
                  <AnimatedButton
                    variant="gradient"
                    size="lg"
                    onClick={() => setShowRSVP(true)}
                    className="px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-cyan-500/25 dark:hover:shadow-cyan-400/25 hover:scale-105 transition-all duration-300"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Register for Event
                  </AnimatedButton>
                ) : (
                  <AnimatedButton
                    variant="outline"
                    size="lg"
                    disabled
                    className="animate-in zoom-in duration-500 px-8 py-4"
                  >
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Registered
                  </AnimatedButton>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`px-6 py-4 hover:scale-105 transition-all duration-300 ${isBookmarked ? "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400" : ""}`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isBookmarked ? "fill-current text-pink-500" : ""}`} />
                  {isBookmarked ? "Saved" : "Save"}
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
                      color: "hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20",
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
              className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80 border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Event Organizer</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-700/50 dark:to-slate-800/50 rounded-lg">
                    <div className="font-bold text-lg text-slate-900 dark:text-slate-100">{event.organizer?.fullName || 'Event Organizer'}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{event.organizer?.email || 'organizer@school.edu'}</div>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <AnimatedCard
                variant="lift"
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80 border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300"
              >
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
                        className="px-3 py-1 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800 hover:scale-110 hover:shadow-lg hover:bg-gradient-to-r hover:from-violet-500 hover:to-purple-500 hover:text-white transition-all duration-300 cursor-pointer"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            )}
          </div>
        </div>
      </div>

      {/* RSVP Modal */}
      {showRSVP && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <AnimatedCard variant="lift" className="w-full max-w-md animate-in zoom-in duration-300 bg-white dark:bg-slate-800 shadow-2xl">
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
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200" />
                </div>
                <div className="animate-in slide-in-from-bottom duration-300 delay-200">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Address
                  </Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200" />
                </div>
                <div className="animate-in slide-in-from-bottom duration-300 delay-300">
                  <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Phone Number
                  </Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200" />
                </div>
                <div className="animate-in slide-in-from-bottom duration-300 delay-400">
                  <Label htmlFor="notes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200" />
                </div>
                <div className="flex gap-3 animate-in slide-in-from-bottom duration-300 delay-500">
                  <AnimatedButton type="submit" variant="gradient" className="flex-1 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" disabled={isSubmitting}>
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
                  <Button type="button" variant="outline" onClick={() => setShowRSVP(false)} className="px-6 py-3 hover:scale-105 transition-transform duration-200" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </AnimatedCard>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right duration-500">
          <AnimatedCard variant="lift" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl border-0">
            <div className="p-6 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <CheckCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="font-semibold">Success!</div>
                <div className="text-sm opacity-90">{rsvpSubmitted ? `Registered for ${event.title}` : "Link copied to clipboard"}</div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}
    </div>
  )
}