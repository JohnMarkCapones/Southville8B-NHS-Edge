"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
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
  ChevronDown,
  ChevronUp,
  Car,
  Accessibility,
  Camera,
  Utensils,
  Shield,
  HelpCircle,
  Info,
  Share2,
  Heart,
  Bookmark,
  Eye,
  Sparkles,
} from "lucide-react"

// Local copy of UI-only data and logic kept as-is; server needs read-only access which lives in data.ts
const categoryIcons = {
  "Arts & Culture": <Palette className="w-5 h-5" />,
  Sports: <Trophy className="w-5 h-5" />,
  Academic: <Microscope className="w-5 h-5" />,
  "Special Event": <GraduationCap className="w-5 h-5" />,
  Social: <Users className="w-5 h-5" />,
}

// NOTE: The original page had an in-file events array; the server uses data.ts for metadata; the UI references it directly here for continuity
import { EVENTS } from "./data"

export default function ClientPage({ params }: { params: { slug: string } }) {
  const [isRegistered, setIsRegistered] = useState(false)
  const [showRSVP, setShowRSVP] = useState(false)
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [hoveredHighlight, setHoveredHighlight] = useState<number | null>(null)
  const [hoveredSchedule, setHoveredSchedule] = useState<number | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 500) + 100)

  const event = EVENTS.find((e) => e.slug === params.slug)

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessMessage])

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center animate-in fade-in duration-700">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-100 to-violet-100 dark:from-cyan-900/30 dark:to-violet-900/30 rounded-full flex items-center justify-center">
            <HelpCircle className="w-12 h-12 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-800 to-violet-600 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">
            Event Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            The event you're looking for doesn't exist or may have been moved.
          </p>
          <Link href="/">
            <AnimatedButton variant="gradient" size="lg" className="shadow-lg hover:shadow-xl">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Home
            </AnimatedButton>
          </Link>
        </div>
      </div>
    )
  }

  const faqData = [
    {
      question: "How do I register for this event?",
      answer:
        "Click the 'Register for Event' button above and fill out the registration form with your details. You'll receive a confirmation email once registered.",
    },
    {
      question: "Is there a dress code for this event?",
      answer:
        event?.category === "Social"
          ? "Yes, formal attire is required. Please dress appropriately for the occasion."
          : event?.category === "Sports"
            ? "Casual attire is recommended. Wear comfortable clothing and shoes suitable for cheering."
            : "Smart casual attire is recommended. Dress comfortably but appropriately for the venue.",
    },
    {
      question: "Can I bring guests?",
      answer:
        event?.category === "Social" || event?.category === "Special Event"
          ? "Yes, but guests must be registered in advance. Please include guest information when registering."
          : "Yes, guests are welcome! Please register them separately or include their information in your registration.",
    },
    {
      question: "What if I need to cancel my registration?",
      answer:
        "You can cancel your registration up to 24 hours before the event by contacting the organizer. Refunds, if applicable, will be processed within 5-7 business days.",
    },
    {
      question: "Is the venue accessible?",
      answer:
        "Yes, all our venues are fully accessible with wheelchair access, accessible restrooms, and designated parking spaces. Please contact us if you have specific accessibility needs.",
    },
    {
      question: "Will food be provided?",
      answer:
        event?.category === "Social" || event?.category === "Special Event"
          ? "Yes, refreshments and meals will be provided as part of the event."
          : "Light refreshments may be available. We recommend eating beforehand or bringing snacks if it's a longer event.",
    },
  ]

  const additionalInfo = [
    {
      icon: Car,
      title: "Parking Information",
      description:
        "Free parking is available in the main school lot. Overflow parking is available in the adjacent community center lot.",
    },
    {
      icon: Accessibility,
      title: "Accessibility",
      description:
        "All venues are wheelchair accessible with designated seating areas. ASL interpreters available upon request with 48-hour notice.",
    },
    {
      icon: Camera,
      title: "Photography Policy",
      description:
        "Photography is permitted during most events. Professional photographers will be present, and photos will be shared on our website.",
    },
    {
      icon: Utensils,
      title: "Food & Beverages",
      description:
        event?.category === "Social" || event?.category === "Special Event"
          ? "Full catering will be provided. Please inform us of any dietary restrictions when registering."
          : "Light refreshments may be available. Outside food and beverages are generally not permitted.",
    },
    {
      icon: Shield,
      title: "Safety Protocols",
      description:
        "We follow all current health and safety guidelines. Security personnel will be present at all events for your safety and peace of mind.",
    },
  ]

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setRsvpSubmitted(true)
    setShowRSVP(false)
    setIsRegistered(true)
    setShowSuccessMessage(true)
  }

  const shareEvent = (platform: string) => {
    const url = window.location.href
    const text = `Check out ${event.title} at Southville 8B NHS!`
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 via-violet-600/10 to-pink-600/10 dark:from-cyan-400/5 dark:via-violet-400/5 dark:to-pink-400/5" />
        <div className="container mx-auto px-4 pt-8 relative">
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
      </div>

      <div className="container mx-auto px-4 py-8">
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
                  {categoryIcons[event.category as keyof typeof categoryIcons]}
                  {event.category}
                </Badge>
                {event.featured && (
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
                {event.fullDescription}
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
                    title: `${event.registrationCount} registered`,
                    subtitle: event.maxRegistration
                      ? `${event.maxRegistration - event.registrationCount} spots left`
                      : "Attendees",
                    color: "text-pink-600 dark:text-pink-400",
                  },
                  ...(event.price
                    ? [
                        {
                          icon: DollarSign,
                          title: event.price,
                          subtitle: "Ticket Price",
                          color: "text-emerald-600 dark:text-emerald-400",
                        },
                      ]
                    : []),
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

            <div className="animate-in slide-in-from-right duration-700">
              <AnimatedCard variant="lift" className="overflow-hidden group">
                <div className="relative">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    width={1200}
                    height={630}
                    className="w-full h-80 lg:h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                    priority={false}
                    sizes="(min-width: 1024px) 1024px, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Click to view full image</p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </div>

            {/* Highlights */}
            {event.highlights && (
              <AnimatedCard
                variant="lift"
                className="animate-in slide-in-from-left duration-700 delay-300 bg-gradient-to-br from-white to-cyan-50/50 dark:from-slate-800 dark:to-slate-800/50 border-0 shadow-xl"
              >
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-lg">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-800 to-violet-600 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">
                      Event Highlights
                    </h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {event.highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className={`group flex items-center gap-3 p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                          hoveredHighlight === index
                            ? "bg-gradient-to-r from-cyan-50 to-violet-50 dark:from-cyan-900/20 dark:to-violet-900/20 scale-105 shadow-lg"
                            : "hover:bg-white/50 dark:hover:bg-slate-700/50"
                        }`}
                        onMouseEnter={() => setHoveredHighlight(index)}
                        onMouseLeave={() => setHoveredHighlight(null)}
                      >
                        <div
                          className={`p-2 rounded-lg transition-all duration-300 ${
                            hoveredHighlight === index
                              ? "bg-gradient-to-br from-cyan-500 to-violet-500 shadow-lg"
                              : "bg-gradient-to-br from-cyan-100 to-violet-100 dark:from-cyan-900/30 dark:to-violet-900/30"
                          }`}
                        >
                          <Star
                            className={`w-4 h-4 transition-colors duration-300 ${
                              hoveredHighlight === index ? "text-white" : "text-cyan-600 dark:text-cyan-400"
                            }`}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* Schedule */}
            {event.schedule && (
              <AnimatedCard
                variant="lift"
                className="animate-in slide-in-from-left duration-700 delay-500 bg-gradient-to-br from-white to-violet-50/50 dark:from-slate-800 dark:to-slate-800/50 border-0 shadow-xl"
              >
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 dark:from-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
                      Event Schedule
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {event.schedule.map((item, index) => (
                      <div
                        key={index}
                        className={`group flex items-center gap-6 p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                          hoveredSchedule === index
                            ? "bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20 scale-105 shadow-lg"
                            : "bg-slate-50/50 dark:bg-slate-700/30 hover:bg-white/70 dark:hover:bg-slate-700/50"
                        }`}
                        onMouseEnter={() => setHoveredSchedule(index)}
                        onMouseLeave={() => setHoveredSchedule(null)}
                      >
                        <div
                          className={`p-3 rounded-lg transition-all duration-300 ${
                            hoveredSchedule === index
                              ? "bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg"
                              : "bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/30 dark:to-pink-900/30"
                          }`}
                        >
                          <Clock
                            className={`w-5 h-5 transition-colors duration-300 ${
                              hoveredSchedule === index ? "text-white" : "text-violet-600 dark:text-violet-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-lg text-slate-900 dark:text-slate-100">{item.time}</div>
                          <div className="text-slate-600 dark:text-slate-400">{item.activity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* FAQ */}
            <AnimatedCard
              variant="lift"
              className="animate-in slide-in-from-left duration-700 delay-700 bg-gradient-to-br from-white to-pink-50/50 dark:from-slate-800 dark:to-slate-800/50 border-0 shadow-xl"
            >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 dark:from-pink-400 dark:to-orange-400 bg-clip-text text-transparent">
                    Frequently Asked Questions
                  </h3>
                </div>
                <div className="space-y-3">
                  {faqData.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-pink-500/10 dark:hover:shadow-pink-400/10 transition-all duration-300 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                    >
                      <button
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-orange-50/50 dark:hover:from-pink-900/10 dark:hover:to-orange-900/10 transition-all duration-300"
                        onClick={() => setHoveredSchedule(hoveredSchedule === index ? null : index)}
                      >
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{faq.question}</span>
                        <div className="p-1 rounded-lg bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-900/30 dark:to-orange-900/30">
                          {hoveredSchedule === index ? (
                            <ChevronUp className="w-5 h-5 text-pink-600 dark:text-pink-400 transition-transform duration-200" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-pink-600 dark:text-pink-400 transition-transform duration-200" />
                          )}
                        </div>
                      </button>
                      {hoveredSchedule === index && (
                        <div className="px-6 pb-6 animate-in slide-in-from-top duration-300">
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard>

            {/* Additional Information */}
            <AnimatedCard
              variant="lift"
              className="animate-in slide-in-from-left duration-700 delay-900 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-slate-800/50 border-0 shadow-xl"
            >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    Additional Information
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  {additionalInfo.map((info, index) => (
                    <div
                      key={index}
                      className="group p-6 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border border-emerald-100 dark:border-slate-600 hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/10 hover:scale-105 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg group-hover:shadow-lg transition-shadow duration-300">
                          <info.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100">{info.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{info.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-in slide-in-from-right duration-700 delay-400">
            {/* Organizer */}
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
                    <div className="font-bold text-lg text-slate-900 dark:text-slate-100">{event.organizer}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Organizing Department</div>
                  </div>

                  <Separator className="bg-slate-200 dark:bg-slate-700" />

                  <div className="space-y-3">
                    <a
                      href={`mailto:${event.organizerContact}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 transition-all duration-300 group"
                    >
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg group-hover:shadow-lg transition-shadow duration-300">
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {event.organizerContact}
                      </span>
                    </a>
                    {event.organizerPhone && (
                      <a
                        href={`tel:${event.organizerPhone}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-all duration-300 group"
                      >
                        <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg group-hover:shadow-lg transition-shadow duration-300">
                          <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                          {event.organizerPhone}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Tags */}
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
                      {tag}
                    </Badge>
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
                  <AnimatedButton type="submit" variant="gradient" className="flex-1 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" disabled={isLoading}>
                    {isLoading ? (
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
                  <Button type="button" variant="outline" onClick={() => setShowRSVP(false)} className="px-6 py-3 hover:scale-105 transition-transform duration-200" disabled={isLoading}>
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