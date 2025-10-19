"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Calculator,
  Trophy,
  Users,
  Calendar,
  Star,
  Target,
  BookOpen,
  Brain,
  Lightbulb,
  Crown,
  Medal,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  MapPin,
  Mail,
  ChevronRight,
  Sparkles,
  Heart,
  Microscope,
  Code,
  Globe,
  ChevronLeft,
  Home,
} from "lucide-react"

// Icon mapping
const iconComponents = {
  Calculator,
  Microscope,
  Code,
  Users,
  Music: Users, // Fallback
  Palette: Users, // Fallback
  Trophy,
  Leaf: Users, // Fallback
  Globe,
  Drama: Users, // Fallback
  Crown,
  Medal,
  Star,
};

type Club = {
  id: string
  slug: string
  name: string
  icon: string
  color: string
  members: number
  meetingTime: string
  location: string
  adviser: {
    name: string
    title: string
    credentials: string
    bio: string
    achievements: string[]
    quote: string
    email: string
    office: string
    image: string
  }
  description: string
  mission: string
  goals: string[]
  officers: Array<{
    name: string
    position: string
    grade: string
    bio: string
    achievements: string[]
    image: string
    icon: string
  }>
  upcomingEvents: Array<{
    title: string
    date: string
    time: string
    location: string
    description: string
    type: string
    icon: string
  }>
  benefits: Array<{
    title: string
    description: string
    icon: string
    color: string
  }>
  faqItems: Array<{
    question: string
    answer: string
  }>
  stats: Array<{
    number: string
    label: string
    icon: string
  }>
}

interface ClientPageProps {
  club: Club
}

export default function ClientPage({ club }: ClientPageProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    grade: "",
    experience: "",
    interests: "",
    goals: "",
  })

  const [heroRef, heroInView] = useIntersectionObserver({ threshold: 0.1 })
  const [missionRef, missionInView] = useIntersectionObserver({ threshold: 0.1 })
  const [leadershipRef, leadershipInView] = useIntersectionObserver({ threshold: 0.1 })
  const [eventsRef, eventsInView] = useIntersectionObserver({ threshold: 0.1 })
  const [benefitsRef, benefitsInView] = useIntersectionObserver({ threshold: 0.1 })
  const [registrationRef, registrationInView] = useIntersectionObserver({ threshold: 0.1 })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    alert("Thank you for your interest! We'll contact you soon with next steps.")
  }

  const IconComponent = iconComponents[club.icon as keyof typeof iconComponents] || Users

  return (
    <div className="min-h-screen">
      {/* Breadcrumbs and Back Button */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
              <Link 
                href="/" 
                className="flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <Link 
                href="/guess/clubs" 
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                Clubs
              </Link>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-slate-900 dark:text-slate-100 font-medium">
                {club.name}
              </span>
            </nav>

            {/* Back Button */}
            <Link href="/guess/clubs">
              <AnimatedButton
                variant="outline"
                size="sm"
                className="hover:scale-105 transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Clubs
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative py-20 sm:py-24 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-10 bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 150 + 50}px`,
                height: `${Math.random() * 150 + 50}px`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={cn("max-w-4xl mx-auto text-center text-white", heroInView && "animate-fadeIn")}>
            <div className="flex justify-center mb-6">
              <Badge className="text-lg px-6 py-3 rounded-full bg-white/20 text-white border-white/30">
                <div className="flex items-center">
                  <IconComponent className="w-6 h-6 mr-3" />
                  <span className="mx-3">{club.members} Active Members</span>
                </div>
                <Sparkles className="w-5 h-5 ml-3" />
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-8 leading-tight">
              Southville 8B <span className="text-yellow-300">{club.name}</span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl mb-12 leading-relaxed max-w-3xl mx-auto text-white/90">
              {club.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <AnimatedButton
                size="lg"
                className="group font-bold text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-300 hover:to-orange-400 hover:scale-105 transition-all duration-300"
                onClick={() => document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Heart className="w-6 h-6 mr-3 group-hover:scale-110 transition-all duration-300" />
                Join Our Club
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-all duration-300" />
              </AnimatedButton>

              <AnimatedButton
                variant="outline"
                size="lg"
                className="group font-bold text-lg px-8 py-4 rounded-full w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300"
                onClick={() => document.getElementById("events")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Calendar className="w-6 h-6 mr-3 group-hover:scale-110 transition-all duration-300" />
                View Events
              </AnimatedButton>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {club.stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl sm:text-3xl font-bold mb-1">{stat.number}</div>
                  <div className="text-sm font-medium text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={missionRef} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className={cn("max-w-4xl mx-auto", missionInView && "animate-fadeIn")}>
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Target className="w-4 h-4 mr-2" />
                Our Mission
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Empowering <span className="gradient-text">Excellence</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary">🎯 What We Stand For</h3>
                <p className="text-lg leading-relaxed mb-6 text-muted-foreground">{club.mission}</p>

                <div className="space-y-4">
                  {club.goals.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-base">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Image
                  src={`/placeholder.svg?height=400&width=500&text=${encodeURIComponent(club.name)}+Mission`}
                  alt={`${club.name} Mission`}
                  width={500}
                  height={400}
                  className="w-full rounded-2xl shadow-lg"
                  sizes="(min-width: 768px) 500px, 90vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section ref={leadershipRef} className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className={cn("text-center mb-16", leadershipInView && "animate-fadeIn")}>
            <Badge variant="secondary" className="mb-4">
              <Crown className="w-4 h-4 mr-2" />
              Club Leadership
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Meet Our <span className="gradient-text">Officers</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-muted-foreground">
              Our dedicated student leaders bring passion, experience, and vision to guide our club toward continued
              excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {club.officers.map((officer, index) => {
              const OfficerIcon = iconComponents[officer.icon as keyof typeof iconComponents] || Star
              return (
                <AnimatedCard
                  key={index}
                  className="group hover:scale-105 transition-all duration-300 animate-slideInUp text-center"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6">
                    <div className="relative mb-6">
                      <Image
                        src={officer.image || "/placeholder.svg"}
                        alt={officer.name}
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full mx-auto mb-4 group-hover:scale-110 transition-transform"
                        sizes="96px"
                      />
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-2 rounded-full shadow-lg">
                        <OfficerIcon className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{officer.name}</h3>
                    <p className="text-primary font-semibold mb-1">{officer.position}</p>
                    <p className="text-sm text-muted-foreground mb-4">{officer.grade}</p>

                    <p className="text-sm leading-relaxed mb-4 text-muted-foreground">{officer.bio}</p>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">🏆 Achievements:</h4>
                      {officer.achievements.map((achievement, i) => (
                        <div key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* Club Adviser Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <GraduationCap className="w-4 h-4 mr-2" />
              Faculty Guidance
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Our Club <span className="gradient-text">Adviser</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <AnimatedCard className="group hover:scale-105 transition-all duration-300">
              <div className="p-8">
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  <div className="text-center">
                    <div className="relative">
                      <Image
                        src={club.adviser.image || "/placeholder.svg"}
                        alt={club.adviser.name}
                        width={128}
                        height={128}
                        className="w-32 h-32 rounded-2xl mx-auto shadow-lg group-hover:scale-105 transition-transform"
                        sizes="128px"
                      />
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full shadow-lg">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">
                        {club.adviser.name}
                      </h3>
                      <p className="text-lg text-primary font-semibold mb-2">{club.adviser.title}</p>
                      <p className="text-sm text-muted-foreground">{club.adviser.credentials}</p>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">{club.adviser.bio}</p>

                    <div>
                      <h4 className="text-sm font-bold mb-2 flex items-center">
                        <Trophy className="w-4 h-4 mr-2 text-primary" />
                        Key Achievements
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {club.adviser.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <span className="text-xs">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <blockquote className="text-sm text-muted-foreground italic">{club.adviser.quote}</blockquote>
                      <p className="text-right mt-2 text-xs font-semibold text-primary">— {club.adviser.name}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{club.adviser.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{club.adviser.office}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section ref={eventsRef} id="events" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className={cn("text-center mb-16", eventsInView && "animate-fadeIn")}>
            <Badge variant="secondary" className="mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming Events
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              What's <span className="gradient-text">Coming Up</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-muted-foreground">
              Join us for exciting competitions, workshops, and community events throughout the year.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {club.upcomingEvents.map((event, index) => {
              const EventIcon = iconComponents[event.icon as keyof typeof iconComponents] || Calendar
              return (
                <AnimatedCard
                  key={index}
                  className="group hover:scale-105 transition-all duration-300 animate-slideInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-lg">
                          <EventIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="font-semibold">{new Date(event.date).toLocaleDateString()}</div>
                        <div>{event.time}</div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>

                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {event.location}
                    </div>

                    <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                  </div>
                </AnimatedCard>
              )
            })}
          </div>

          <div className="text-center mt-12">
            <AnimatedButton variant="outline" className="group" asChild>
              <Link href="/news-events">
                View Full Calendar
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </AnimatedButton>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className={cn("text-center mb-16", benefitsInView && "animate-fadeIn")}>
            <Badge variant="secondary" className="mb-4">
              <Star className="w-4 h-4 mr-2" />
              Membership Benefits
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Why Join <span className="gradient-text">{club.name}?</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-muted-foreground">
              Discover the amazing opportunities and benefits that come with being part of our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {club.benefits.map((benefit, index) => {
              const BenefitIcon = iconComponents[benefit.icon as keyof typeof iconComponents] || Star
              return (
                <AnimatedCard
                  key={index}
                  className="group hover:scale-105 transition-all duration-300 animate-slideInUp text-center"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6">
                    <div
                      className={cn(
                        "w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg",
                        `bg-gradient-to-r ${benefit.color}`,
                      )}
                    >
                      <BenefitIcon className="w-8 h-8" />
                    </div>

                    <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">{benefit.title}</h3>

                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </AnimatedCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section ref={registrationRef} id="registration" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className={cn("max-w-4xl mx-auto", registrationInView && "animate-fadeIn")}>
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Users className="w-4 h-4 mr-2" />
                Join Our Community
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Ready to <span className="gradient-text">Get Started?</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Fill out the form below to join our amazing {club.name} community!
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-center">{club.name} Registration</CardTitle>
                <CardDescription className="text-center">
                  Complete this form to become a member of Southville 8B {club.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">Current Grade *</Label>
                    <Select value={formData.grade} onValueChange={(value) => handleInputChange("grade", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9">Grade 9</SelectItem>
                        <SelectItem value="10">Grade 10</SelectItem>
                        <SelectItem value="11">Grade 11</SelectItem>
                        <SelectItem value="12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Previous Experience</Label>
                    <Textarea
                      id="experience"
                      placeholder="Tell us about any related activities you've participated in..."
                      value={formData.experience}
                      onChange={(e) => handleInputChange("experience", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interests">Your Interests</Label>
                    <Textarea
                      id="interests"
                      placeholder="What interests you most about this club?"
                      value={formData.interests}
                      onChange={(e) => handleInputChange("interests", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goals">Goals & Expectations</Label>
                    <Textarea
                      id="goals"
                      placeholder="What do you hope to achieve by joining this club?"
                      value={formData.goals}
                      onChange={(e) => handleInputChange("goals", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="text-center pt-6">
                    <AnimatedButton
                      type="submit"
                      size="lg"
                      className="group font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 hover:scale-105 transition-all duration-300"
                    >
                      <Heart className="w-5 h-5 mr-3 group-hover:scale-110 transition-all duration-300" />
                      Submit Application
                      <Sparkles className="w-5 h-5 ml-3" />
                    </AnimatedButton>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Lightbulb className="w-4 h-4 mr-2" />
              Frequently Asked Questions
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Got <span className="gradient-text">Questions?</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-muted-foreground">
              Find answers to common questions about joining and participating in {club.name}.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {club.faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-semibold">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Join Our Journey?</h2>
            <p className="text-lg mb-8 text-white/90">
              Don't miss out on the opportunity to be part of our award-winning {club.name} community!
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <AnimatedButton
                size="lg"
                className="group font-bold text-lg px-8 py-3 rounded-full shadow-xl hover:shadow-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-300 hover:to-orange-400 hover:scale-105 transition-all duration-300"
                onClick={() => document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" })}
              >
                <IconComponent className="w-6 h-6 mr-3" />
                <span className="mx-3">Join {club.name}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-all duration-300" />
              </AnimatedButton>

              <AnimatedButton
                variant="outline"
                size="lg"
                className="group font-bold text-lg px-8 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300"
                asChild
              >
                <Link href="/contact">
                  <Mail className="w-6 h-6 mr-3 group-hover:scale-110 transition-all duration-300" />
                  Contact Us
                </Link>
              </AnimatedButton>
            </div>

            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-sm text-white/80">
                Questions? Contact our club advisor at <strong>{club.adviser.email}</strong> or visit us in{" "}
                {club.location}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
