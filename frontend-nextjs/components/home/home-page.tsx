"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { HeroSectionEnhanced } from "@/components/ui/hero-section-enhanced"
import { FeatureCard } from "@/components/ui/feature-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Badge } from "@/components/ui/badge"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import Link from "next/link"
import { AnnouncementsSection } from "@/components/homepage/announcements-section"
import { EventsSection } from "@/components/homepage/events-section"
import { ClubsSection } from "@/components/homepage/clubs-section"
import { NewsSection } from "@/components/homepage/news-section"
import {
  BookOpen,
  Users,
  Trophy,
  Calendar,
  Award,
  Star,
  TrendingUp,
  Heart,
  Sparkles,
  GraduationCap,
  ArrowRight,
  Clock,
  User,
  Newspaper,
  Camera,
  Music,
  Palette,
  Drama,
  Microscope,
  Calculator,
  Globe,
  Gamepad2,
  PartyPopper,
  ChevronRight,
} from "lucide-react"
import { AnnouncementBanner } from "@/components/ui/announcement-banner"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

// Defer heavy, below-the-fold widgets to reduce initial JS
const StudentRankings = dynamic(
  () => import("@/components/student-rankings").then((m) => ({ default: m.StudentRankings })),
  { loading: () => <div aria-busy="true" className="h-24" /> }
)

const CampusGallery = dynamic(
  () => import("@/components/ui/campus-gallery").then((m) => ({ default: m.CampusGallery })),
  { loading: () => <div aria-busy="true" className="h-64" /> }
)

const AcademicCalendar = dynamic(
  () => import("@/components/ui/academic-calendar").then((m) => ({ default: m.AcademicCalendar })),
  { loading: () => <div aria-busy="true" className="h-32" /> }
)

const EventSystem = dynamic(
  () => import("@/components/ui/event-system").then((m) => ({ default: m.EventSystem })),
  { loading: () => <div aria-busy="true" className="h-40" /> }
)

const CelebrationOverlay = dynamic(
  () => import("@/components/celebration-overlay").then((m) => ({ default: m.CelebrationOverlay })),
  { ssr: false }
)

export default function HomePage() {
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  // Calculate theme values safely after mounting to avoid hydration mismatch
  const isGamingTheme = mounted ? theme === "gaming" : false
  const isDarkMode = mounted ? (theme === "dark" || theme === "gaming") : false

  // Generate background circles only on client to avoid hydration mismatch
  const [backgroundCircles, setBackgroundCircles] = useState<Array<{
    left: string
    top: string
    width: string
    height: string
  }>>([])

  useEffect(() => {
    setMounted(true)

    // Generate random positions only on client side
    setBackgroundCircles(
      Array.from({ length: 6 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 200 + 100}px`,
        height: `${Math.random() * 200 + 100}px`,
      }))
    )
  }, [])

  const [heroRef, heroInView] = useIntersectionObserver({ threshold: 0.1 })
  const [welcomeRef, welcomeInView] = useIntersectionObserver({ threshold: 0.1 })
  const [rankingsRef, rankingsInView] = useIntersectionObserver({ threshold: 0.1 })
  const [galleryRef, galleryInView] = useIntersectionObserver({ threshold: 0.1 })
  const [extracurricularRef, extracurricularInView] = useIntersectionObserver({ threshold: 0.1 })
  const [eventsRef, eventsInView] = useIntersectionObserver({ threshold: 0.1 })
  const [achievementsRef, achievementsInView] = useIntersectionObserver({ threshold: 0.1 })
  const [testimonialsRef, testimonialsInView] = useIntersectionObserver({ threshold: 0.1 })
  const [ctaRef, ctaInView] = useIntersectionObserver({ threshold: 0.1 })

  const achievements = [
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "State Champions",
      description: "Multiple state championships in academics and athletics",
      value: "12+",
      color: "from-school-gold to-vibrant-orange",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Excellence Rating",
      description: "Consistently rated as a top-performing school",
      value: "A+",
      color: "from-vibrant-purple to-vibrant-pink",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "College Acceptance",
      description: "Students accepted to top universities nationwide",
      value: "98%",
      color: "from-vibrant-cyan to-vibrant-teal",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Student Satisfaction",
      description: "High student satisfaction and engagement rates",
      value: "96%",
      color: "from-vibrant-rose to-vibrant-pink",
    },
  ]


  const upcomingEvents = [
    {
      id: 1,
      title: "Spring Musical: Hamilton",
      date: "2024-04-20",
      time: "7:00 PM",
      location: "Main Auditorium",
      category: "Arts",
      icon: <Music className="w-5 h-5" />,
    },
    {
      id: 2,
      title: "Science Fair 2024",
      date: "2024-05-10",
      time: "9:00 AM",
      location: "Gymnasium",
      category: "Academic",
      icon: <Microscope className="w-5 h-5" />,
    },
    {
      id: 3,
      title: "State Basketball Championship",
      date: "2024-03-15",
      time: "8:00 PM",
      location: "State Arena",
      category: "Sports",
      icon: <Trophy className="w-5 h-5" />,
    },
  ]

  const [clubs, setClubs] = useState<any[]>([])
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)

  // Fetch clubs from API
  useEffect(() => {
    async function fetchClubs() {
      try {
        setIsLoadingClubs(true)
        const { getClubs } = await import("@/lib/api/endpoints/clubs")
        const clubsData = await getClubs({ limit: 50 })
        setClubs(clubsData)
      } catch (error) {
        console.error("Error fetching clubs:", error)
      } finally {
        setIsLoadingClubs(false)
      }
    }
    fetchClubs()
  }, [])

  // Icon mapping for clubs
  const getClubIcon = (clubName: string) => {
    const name = clubName.toLowerCase()
    if (name.includes("math")) return <Calculator className="w-5 h-5" />
    if (name.includes("science")) return <Microscope className="w-5 h-5" />
    if (name.includes("art") || name.includes("arts")) return <Palette className="w-5 h-5" />
    if (name.includes("music")) return <Music className="w-5 h-5" />
    if (name.includes("drama") || name.includes("theater")) return <Drama className="w-5 h-5" />
    if (name.includes("photo")) return <Camera className="w-5 h-5" />
    if (name.includes("game") || name.includes("gaming")) return <Gamepad2 className="w-5 h-5" />
    if (name.includes("environment")) return <Globe className="w-5 h-5" />
    if (name.includes("volunteer")) return <Heart className="w-5 h-5" />
    if (name.includes("debate") || name.includes("speech")) return <Users className="w-5 h-5" />
    if (name.includes("honor") || name.includes("academic")) return <GraduationCap className="w-5 h-5" />
    if (name.includes("sport") || name.includes("athletic")) return <Trophy className="w-5 h-5" />
    return <Users className="w-5 h-5" /> // Default icon
  }

  // Get color gradient for clubs
  const getClubColor = (index: number) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-green-500 to-teal-600",
      "from-orange-500 to-red-500",
      "from-pink-500 to-rose-600",
      "from-indigo-500 to-blue-600",
      "from-cyan-500 to-blue-500",
      "from-emerald-500 to-green-600",
    ]
    return colors[index % colors.length]
  }

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Class of 2023",
      content:
        "Southville 8B NHS provided me with the foundation I needed to succeed in college. The teachers truly care about each student's success.",
      image: "/placeholder.svg?height=80&width=80&text=SJ",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Current Student",
      content:
        "The variety of clubs and activities here is amazing. I've been able to explore my interests and develop leadership skills.",
      image: "/placeholder.svg?height=80&width=80&text=MC",
      rating: 5,
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Parent",
      content:
        "As a parent, I'm impressed by the school's commitment to academic excellence and character development. My daughter thrives here.",
      image: "/placeholder.svg?height=80&width=80&text=ER",
      rating: 5,
    },
  ]

  const announcementItems = [
    {
      icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />,
      message: "Early Application Deadline: December 15th for priority consideration",
      action: { label: "Apply Now", href: "/guess/contact" },
    },
    {
      icon: <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />,
      message: "Congratulations to our Science Olympiad team for winning the State Championship!",
      action: { label: "Read Story", href: "/guess/news" },
    },
  ]

  return (
    <div className={cn("min-h-screen", isDarkMode && "dark")} suppressHydrationWarning>
      <div id="main-content">
        <section ref={heroRef} aria-label="Hero section">
          <HeroSectionEnhanced />
        </section>
      <div className="relative z-[30] -mt-3 sm:-mt-4">
        <AnnouncementBanner items={announcementItems} fullBleed />
      </div>

      {/* Welcome Message */}
      <section
        ref={welcomeRef}
        className={cn(
          "py-12 xs:py-16 sm:py-20 md:py-24 lg:py-28 relative overflow-hidden",
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20"
            : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50",
        )}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {backgroundCircles.map((circle, i) => (
            <div
              key={i}
              className={cn(
                "absolute rounded-full opacity-10",
                isDarkMode ? "bg-blue-400" : "bg-gradient-to-r from-blue-400 to-purple-400",
              )}
              style={{
                left: circle.left,
                top: circle.top,
                width: circle.width,
                height: circle.height,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-3 xs:px-4 sm:px-6 md:px-8 relative z-10">
          <div className={cn("max-w-6xl mx-auto text-center", welcomeInView && "animate-fadeIn")}>            
            <div className="flex justify-center mb-4 xs:mb-6 sm:mb-8">
              <Badge
                variant="secondary"
                className={cn(
                  "text-sm xs:text-base sm:text-lg px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-3 rounded-full",
                  isDarkMode ? "bg-gray-800/80 text-blue-400 border-blue-400/30" : "bg-white/80 backdrop-blur-sm",
                )}
              >
                <Heart className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1.5 xs:mr-2 sm:mr-3 text-red-500" />
                Welcome to Our Amazing Community
                <Sparkles className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 ml-1.5 xs:ml-2 sm:ml-3" />
              </Badge>
            </div>

            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 xs:mb-6 sm:mb-8 leading-tight">
              Where <span className="gradient-text">Excellence</span> Meets Opportunity
            </h2>

            <p className="text-base xs:text-lg sm:text-xl md:text-2xl leading-relaxed mb-6 xs:mb-8 sm:mb-12 max-w-5xl mx-auto text-muted-foreground px-2 xs:px-4">
              🌟 At Southville 8B National High School, we believe every student has the potential to achieve greatness.
              Our dedicated faculty, state-of-the-art facilities, and comprehensive programs create an environment where
              students can <span className="font-bold text-primary">explore their passions</span>,
              <span className="font-bold text-primary"> develop their talents</span>, and
              <span className="font-bold text-primary"> prepare for a successful future</span>. ✨
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 md:gap-8 lg:gap-10 justify-items-center items-center mt-8 xs:mt-10 sm:mt-12 md:mt-16 lg:mt-20 mb-8 xs:mb-10 sm:mb-12 md:mb-16 max-w-6xl mx-auto">
              <Link
                href="/guess/academics"
                className="w-full xs:w-full sm:w-auto md:w-full lg:w-auto md:col-span-1 lg:col-span-1"
              >
                <AnimatedButton
                  size="lg"
                  className="group font-bold text-sm xs:text-base sm:text-lg md:text-lg lg:text-xl px-4 xs:px-5 sm:px-6 md:px-7 lg:px-8 xl:px-9 h-10 xs:h-11 sm:h-12 md:h-13 lg:h-14 xl:h-15 rounded-full shadow-xl hover:shadow-2xl w-full relative overflow-hidden transition-all duration-300 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 hover:scale-105 active:scale-95 touch-manipulation"
                >
                  <BookOpen className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 mr-2 xs:mr-2 sm:mr-3 md:mr-3 lg:mr-3 group-hover:rotate-12 transition-all duration-300" />
                  <span className="truncate">🚀 Explore Academics</span>
                  <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 ml-2 xs:ml-2 sm:ml-3 md:ml-3 lg:ml-3 group-hover:translate-x-2 transition-all duration-300" />
                </AnimatedButton>
              </Link>

              <Link
                href="/guess/student-life"
                className="w-full xs:w-full sm:w-auto md:w-full lg:w-auto md:col-span-1 lg:col-span-1"
              >
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  className="group font-bold text-sm xs:text-base sm:text-lg md:text-lg lg:text-xl px-4 xs:px-5 sm:px-6 md:px-7 lg:px-8 xl:px-9 h-10 xs:h-11 sm:h-12 md:h-13 lg:h-14 xl:h-15 rounded-full w-full transition-all duration-300 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:scale-105 active:scale-95 touch-manipulation"
                >
                  <Users className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 mr-2 xs:mr-2 sm:mr-3 md:mr-3 lg:mr-3 group-hover:scale-110 transition-all duration-300" />
                  <span className="truncate">🤝 Join Our Community</span>
                </AnimatedButton>
              </Link>

              <div className="w-full xs:w-full sm:w-auto md:w-full lg:w-auto md:col-span-2 md:justify-self-center lg:col-span-1 lg:justify-self-auto">
                <AnimatedButton
                  variant="gradient"
                  size="lg"
                  className="group font-bold text-sm xs:text-base sm:text-lg md:text-lg lg:text-xl px-4 xs:px-5 sm:px-6 md:px-7 lg:px-8 xl:px-9 h-10 xs:h-11 sm:h-12 md:h-13 lg:h-14 xl:h-15 rounded-full w-full md:max-w-sm lg:max-w-none shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 touch-manipulation"
                  onClick={() => setIsCelebrationOpen(true)}
                >
                  <PartyPopper className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 mr-2 xs:mr-2 sm:mr-3 md:mr-3 lg:mr-3 group-hover:rotate-12 transition-transform" />
                  <span className="truncate">🎉 School Celebrations</span>
                  <Sparkles className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 ml-2 xs:ml-2 sm:ml-3 md:ml-3 lg:ml-3" />
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnnouncementsSection />

      <EventsSection />

      <NewsSection />

      {/* Student Rankings */}
      <section ref={rankingsRef} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <StudentRankings />
        </div>
      </section>

      {/* Interactive School Gallery */}
      <section ref={galleryRef} className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className={cn("text-center mb-16", galleryInView && "animate-fadeIn")}>            
            <Badge variant="secondary" className="mb-4">
              <Camera className="w-4 h-4 mr-2" />
              School Life Gallery
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Explore Our <span className="gradient-text">Campus</span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-muted-foreground">
              Take a visual journey through our vibrant school community. From academic achievements to athletic
              victories, discover the moments that make our school special.
            </p>
          </div>
          <div className={cn(galleryInView && "animate-fadeIn")}>
            <CampusGallery />
          </div>
        </div>
      </section>

      {/* Extracurricular Activities Section */}
      <section className="py-12 xs:py-16 sm:py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 xs:px-6 sm:px-8 relative z-10">
          <div className="text-center mb-8 xs:mb-12 sm:mb-16">
            {/* Enhanced badge */}
            <div className="inline-flex items-center justify-center mb-4 xs:mb-6">
              <div className="rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-3 animate-float">
                <Sparkles className="w-6 h-6 xs:w-8 xs:h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 px-4 xs:px-6 py-2 xs:py-3 rounded-full text-sm xs:text-base font-bold mb-4 xs:mb-6 shadow-sm">
              <span>🎯 Extracurricular</span>
            </div>

            <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 xs:mb-6">
              Beyond the <span className="gradient-text">Classroom</span>
              <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
            </h2>

            <p className="text-base xs:text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Discover opportunities to grow, lead, and make lasting connections through our diverse range of clubs and
              activities.
            </p>

            {/* Stats row */}
            {!isLoadingClubs && clubs.length > 0 && (
              <div className="flex justify-center gap-6 sm:gap-12 mt-8 flex-wrap">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {clubs.length}+
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Active Clubs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    95%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Participation</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    200+
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Events Yearly</div>
                </div>
              </div>
            )}
          </div>

          {isLoadingClubs ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Loading clubs...</p>
              </div>
            </div>
          ) : clubs.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Clubs Available</h3>
              <p className="text-muted-foreground">Check back soon for exciting club opportunities!</p>
            </div>
          ) : (
            <div className="relative px-8 sm:px-12 md:px-16">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {clubs.map((club, index) => (
                    <CarouselItem key={club.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <AnimatedCard
                        className="group hover:scale-105 transition-all duration-300 cursor-pointer animate-slideInUp bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700 hover:border-primary/30 shadow-md hover:shadow-xl relative overflow-hidden h-full"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Decorative gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 dark:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="p-4 xs:p-5 sm:p-6 text-center relative z-10 flex flex-col h-full">
                          {/* Club icon with enhanced styling */}
                          <div className="relative mb-4 xs:mb-5 sm:mb-6">
                            <div
                              className={cn(
                                "w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 mx-auto rounded-lg xs:rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-lg",
                                `bg-gradient-to-r ${getClubColor(index)}`,
                              )}
                            >
                              {getClubIcon(club.name)}
                            </div>
                          </div>

                          {/* Club name */}
                          <h3 className="text-base xs:text-lg font-bold mb-2 xs:mb-3 group-hover:text-primary transition-colors duration-300 leading-tight min-h-[3rem]">
                            {club.name}
                          </h3>

                          {/* Description */}
                          {club.description && (
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 min-h-[2.5rem] flex-grow">
                              {club.description}
                            </p>
                          )}

                          {/* Join button */}
                          <Link
                            href={club.name === "Math Club" ? "/guess/math-club" : "/guess/extracurricular"}
                            className="w-full mt-auto"
                          >
                            <AnimatedButton
                              variant="outline"
                              size="sm"
                              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300 group-hover:scale-105 text-xs xs:text-sm h-8 xs:h-9 sm:h-10 rounded-full"
                            >
                              <span className="mr-1 xs:mr-2">Learn More</span>
                              <ArrowRight className="w-3 h-3 xs:w-4 xs:h-4 group-hover:translate-x-1 transition-transform" />
                            </AnimatedButton>
                          </Link>
                        </div>
                      </AnimatedCard>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex -left-4 md:-left-6 lg:-left-8 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 shadow-lg" />
                <CarouselNext className="hidden sm:flex -right-4 md:-right-6 lg:-right-8 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 shadow-lg" />
              </Carousel>
            </div>
          )}

          {/* View All Clubs Button */}
          {!isLoadingClubs && clubs.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/guess/extracurricular">
                <AnimatedButton
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Explore All {clubs.length} Clubs
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </AnimatedButton>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className={cn("text-center mb-16", testimonialsInView && "animate-fadeIn")}>            
            <Badge variant="secondary" className="mb-4">
              <Heart className="w-4 h-4 mr-2" />
              Community Voices
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What Our <span className="gradient-text">Community</span> Says
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-muted-foreground">
              Hear from students, parents, and alumni about their experiences at Southville 8B National High School.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedCard
                key={index}
                className="group hover:scale-105 transition-all duration-300 animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full mr-4 group-hover:scale-110 transition-transform object-cover"
                      loading="lazy"
                    />
                    <div>
                      <h3 className="font-bold group-hover:text-primary transition-colors">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Calendar */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <AcademicCalendar />
        </div>
      </section>

      {/* Event System */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <EventSystem />
        </div>
      </section>

      {/* CTA / LMS Features */}
      <section
        ref={ctaRef}
        className="py-16 relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/10 dark:to-indigo-950/10"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-lg animate-pulse"></div>
          <div
            className="absolute bottom-10 right-10 w-20 h-20 bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 rounded-full blur-lg animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={cn("text-center max-w-4xl mx-auto", ctaInView && "animate-fadeIn")}>
            <Badge variant="secondary" className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Advanced Learning Platform
            </Badge>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Experience Our <span className="gradient-text">Advanced LMS Platform</span>
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Cutting-edge educational technology designed to enhance learning and streamline teaching. 
              Our comprehensive platform provides everything students and educators need to succeed.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <div className="text-center p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Interactive Learning</h3>
                <p className="text-sm text-muted-foreground">Engaging digital content and interactive lessons</p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Quiz System</h3>
                <p className="text-sm text-muted-foreground">Interactive assessments and instant feedback</p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Progress Tracking</h3>
                <p className="text-sm text-muted-foreground">Real-time analytics and performance insights</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/guess/student">
                <AnimatedButton 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <User className="w-5 h-5 mr-2" />
                  Student Portal
                  <ArrowRight className="w-5 h-5 ml-2" />
                </AnimatedButton>
              </Link>
              
              <Link href="/guess/teacher">
                <AnimatedButton 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-300"
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Teacher Portal
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Celebration Overlay */}
      <CelebrationOverlay isOpen={isCelebrationOpen} onClose={() => setIsCelebrationOpen(false)} />
      </div>
    </div>
  )
}
