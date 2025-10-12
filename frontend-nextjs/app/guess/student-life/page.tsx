"use client"

import { useState } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { FeatureCard } from "@/components/ui/feature-card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import {
  Users,
  MapPin,
  Heart,
  BookOpen,
  Music,
  Palette,
  Camera,
  Gamepad2,
  Globe,
  Microscope,
  Calculator,
  Drama,
  Utensils,
  Shield,
  Stethoscope,
  GraduationCap,
  Trophy,
  Star,
  Clock,
  CalendarIcon,
  Mail,
} from "lucide-react"

export default function StudentLifePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showAllEvents, setShowAllEvents] = useState(false)

  const facilities = [
    {
      title: "Modern Library",
      description: "State-of-the-art library with over 50,000 books, digital resources, and quiet study spaces.",
      icon: <BookOpen className="w-6 h-6" />,
      image: "/placeholder.svg?height=200&width=400",
      badge: "24/7 Access",
      stats: [
        { label: "Books", value: "50K+" },
        { label: "Study Rooms", value: "12" },
      ],
      variant: "featured" as const,
    },
    {
      title: "Science Laboratories",
      description: "Fully equipped labs for Biology, Chemistry, Physics, and Environmental Science research.",
      icon: <Microscope className="w-6 h-6" />,
      image: "/placeholder.svg?height=200&width=400",
      badge: "Research Ready",
      stats: [
        { label: "Lab Stations", value: "120" },
        { label: "Equipment Value", value: "$500K" },
      ],
    },
    {
      title: "Athletic Complex",
      description: "Comprehensive sports facilities including gymnasium, track, pool, and outdoor courts.",
      icon: <Trophy className="w-6 h-6" />,
      image: "/placeholder.svg?height=200&width=400",
      badge: "Championship Level",
      stats: [
        { label: "Sports", value: "15+" },
        { label: "Capacity", value: "2,000" },
      ],
    },
    {
      title: "Arts Center",
      description: "Creative spaces for visual arts, music, theater, and digital media production.",
      icon: <Palette className="w-6 h-6" />,
      image: "/placeholder.svg?height=200&width=400",
      badge: "Award Winning",
    },
    {
      title: "Technology Center",
      description: "Computer labs, maker space, and multimedia production facilities with latest technology.",
      icon: <Calculator className="w-6 h-6" />,
      image: "/placeholder.svg?height=200&width=400",
      badge: "Innovation Hub",
    },
    {
      title: "Cafeteria",
      description: "Spacious dining area serving nutritious meals with diverse menu options daily.",
      icon: <Utensils className="w-6 h-6" />,
      image: "/placeholder.svg?height=200&width=400",
      badge: "Healthy Options",
    },
  ]

  const supportServices = [
    {
      title: "Academic Support",
      description: "Tutoring, study groups, and academic counseling to help students succeed.",
      icon: <BookOpen className="w-6 h-6" />,
      contact: "academic.support@s8bnhs.edu",
      hours: "Mon-Fri: 7:30 AM - 4:30 PM",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Counseling Services",
      description: "Personal counseling, career guidance, and mental health support.",
      icon: <Heart className="w-6 h-6" />,
      contact: "counseling@s8bnhs.edu",
      hours: "Mon-Fri: 8:00 AM - 4:00 PM",
      color: "from-pink-500 to-pink-600",
    },
    {
      title: "Health Services",
      description: "School nurse, first aid, health screenings, and wellness programs.",
      icon: <Stethoscope className="w-6 h-6" />,
      contact: "health@s8bnhs.edu",
      hours: "Mon-Fri: 7:00 AM - 5:00 PM",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Safety & Security",
      description: "Campus security, emergency procedures, and safety protocols.",
      icon: <Shield className="w-6 h-6" />,
      contact: "security@s8bnhs.edu",
      hours: "24/7 Emergency Response",
      color: "from-orange-500 to-orange-600",
    },
  ]

  const events = [
    { date: "2024-02-15", title: "Science Fair", type: "Academic" },
    { date: "2024-02-20", title: "Basketball Championship", type: "Sports" },
    { date: "2024-02-25", title: "Art Exhibition Opening", type: "Arts" },
    { date: "2024-03-01", title: "Spring Musical Auditions", type: "Arts" },
    { date: "2024-03-05", title: "College Fair", type: "Academic" },
    { date: "2024-03-10", title: "Student Government Elections", type: "Leadership" },
  ]

  const displayedEvents = showAllEvents ? events : events.slice(0, 3)

  const testimonials = [
    {
      name: "Sarah Chen",
      grade: "Senior",
      quote:
        "The clubs and activities here have helped me discover my passion for environmental science. I've made lifelong friends and developed leadership skills.",
      image: "/placeholder.svg?height=80&width=80",
      club: "Environmental Club President",
    },
    {
      name: "Marcus Johnson",
      grade: "Junior",
      quote:
        "Being part of the drama club has boosted my confidence tremendously. The teachers are so supportive and the facilities are amazing.",
      image: "/placeholder.svg?height=80&width=80",
      club: "Drama Club Member",
    },
    {
      name: "Emily Rodriguez",
      grade: "Sophomore",
      quote:
        "The academic support services helped me improve my grades significantly. The tutoring program is fantastic!",
      image: "/placeholder.svg?height=80&width=80",
      club: "Honor Roll Student",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 dark:from-blue-800 dark:via-blue-700 dark:to-cyan-600 overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 dark:bg-white/30 rounded-full blur-xl animate-pulse"></div>
          <div
            className="absolute top-32 right-20 w-24 h-24 bg-white/15 dark:bg-white/25 rounded-full blur-lg animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/4 w-40 h-40 bg-white/10 dark:bg-white/20 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-32 right-1/3 w-28 h-28 bg-white/20 dark:bg-white/30 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        ></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge
            variant="secondary"
            className="mb-6 bg-white/20 dark:bg-white/30 text-white border-white/30 dark:border-white/40 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-white/40 transition-all duration-300"
          >
            <Users className="w-4 h-4 mr-2" />
            Student Life
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-3 text-white drop-shadow-lg">
            Vibrant <span className="text-yellow-300 dark:text-yellow-200 drop-shadow-md">Campus</span> Life
          </h1>
          <div className="mx-auto h-1.5 w-24 rounded-full bg-gradient-to-r from-white via-yellow-300 dark:via-yellow-200 to-white mb-6 shadow-lg" />
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/95 dark:text-white/90 drop-shadow-sm leading-relaxed">
            Discover a thriving community where students grow, learn, and create lasting memories through diverse
            activities, modern facilities, and comprehensive support services.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-white/30 dark:border-white/40 text-black dark:text-white hover:bg-white/20 dark:hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
            >
              <Users className="w-5 h-5 mr-2" />
              Explore Student Life
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-yellow-300/50 dark:border-yellow-200/50 text-black dark:text-white hover:bg-yellow-300/20 dark:hover:bg-yellow-200/20 backdrop-blur-sm transition-all duration-300"
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              View Events
            </AnimatedButton>
          </div>
        </div>
      </section>

      {/* Campus Facilities */}
      <section id="facilities" className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Campus <span className="gradient-text">Facilities</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our state-of-the-art facilities provide students with the resources they need to excel academically and
              personally.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility, index) => (
              <div key={facility.title} className="animate-slideInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <FeatureCard {...facility} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clubs & Organizations */}
      <section
        id="clubs"
        className="py-12 xs:py-16 sm:py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"
      >
        <div className="container mx-auto px-4 xs:px-6 sm:px-8">
          <div className="text-center mb-8 xs:mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 px-4 xs:px-6 py-2 xs:py-3 rounded-full text-sm xs:text-base font-bold mb-4 xs:mb-6 shadow-sm">
              <Users className="w-4 h-4 xs:w-5 xs:h-5" />
              <span>🎯 Get Involved</span>
            </div>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 xs:mb-6">
              Clubs & <span className="gradient-text">Organizations</span>
            </h2>
            <p className="text-base xs:text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Join one of our many clubs and organizations to pursue your interests, develop new skills, and make
              lasting connections.
            </p>
          </div>

          <Tabs defaultValue="academic" className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="grid grid-cols-3 bg-gray-100 dark:bg-gray-800 rounded-full p-1 shadow-sm">
                <TabsTrigger
                  value="academic"
                  className="text-sm font-medium px-6 py-2 rounded-full data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 transition-all duration-200"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Academic Excellence
                </TabsTrigger>
                <TabsTrigger
                  value="arts"
                  className="text-sm font-medium px-6 py-2 rounded-full data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 transition-all duration-200"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Arts & Culture
                </TabsTrigger>
                <TabsTrigger
                  value="special"
                  className="text-sm font-medium px-6 py-2 rounded-full data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 transition-all duration-200"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Special Interest
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="academic" className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-3">🎓 Academic Excellence Clubs</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Enhance your learning through academic competitions, research projects, and scholarly pursuits.
                </p>
              </div>

              <div className="grid xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6">
                {[
                  {
                    name: "National Honor Society",
                    members: 85,
                    icon: <GraduationCap className="w-5 h-5" />,
                    color: "from-blue-500 to-blue-600",
                  },
                  {
                    name: "Math Club",
                    members: 42,
                    icon: <Calculator className="w-5 h-5" />,
                    color: "from-blue-500 to-blue-600",
                  },
                  {
                    name: "Science Olympiad",
                    members: 38,
                    icon: <Microscope className="w-5 h-5" />,
                    color: "from-blue-500 to-blue-600",
                  },
                  {
                    name: "Debate Team",
                    members: 28,
                    icon: <Users className="w-5 h-5" />,
                    color: "from-blue-500 to-blue-600",
                  },
                ].map((club, index) => (
                  <AnimatedCard
                    key={club.name}
                    className="group hover:scale-105 transition-all duration-300 cursor-pointer animate-slideInUp bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700 hover:border-primary/30 shadow-md hover:shadow-lg relative overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-4 xs:p-5 sm:p-6 text-center relative z-10">
                      <div className="relative mb-4 xs:mb-5 sm:mb-6">
                        <div
                          className={`w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 mx-auto rounded-lg xs:rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300 shadow-md bg-gradient-to-r ${club.color}`}
                        >
                          {club.icon}
                        </div>
                        <div className="absolute -top-1 xs:-top-2 -right-1 xs:-right-2 bg-gradient-to-r from-orange-400 to-red-400 text-white text-[10px] xs:text-xs font-bold px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full shadow-md">
                          {club.members}
                        </div>
                      </div>

                      <h3 className="text-base xs:text-lg font-bold mb-2 xs:mb-3 group-hover:text-primary transition-colors duration-300 leading-tight">
                        {club.name}
                      </h3>

                      <div className="flex items-center justify-center space-x-1 xs:space-x-2 mb-3 xs:mb-4">
                        <Users className="w-3 h-3 xs:w-4 xs:h-4 text-muted-foreground" />
                        <span className="text-xs xs:text-sm font-medium text-muted-foreground">
                          {club.members} active members
                        </span>
                      </div>

                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300 group-hover:scale-105 text-xs xs:text-sm h-8 xs:h-9 sm:h-10 md:h-11 lg:h-12 rounded-full"
                      >
                        <span className="mr-1 xs:mr-2">Join Club</span>
                      </AnimatedButton>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="arts" className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-3">🎨 Creative Arts & Cultural Organizations</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Express your creativity and celebrate diverse cultures through artistic endeavors and performances.
                </p>
              </div>

              <div className="grid xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6">
                {[
                  {
                    name: "Drama Club",
                    members: 55,
                    icon: <Drama className="w-5 h-5" />,
                    color: "from-purple-500 to-pink-500",
                  },
                  {
                    name: "Art Society",
                    members: 47,
                    icon: <Palette className="w-5 h-5" />,
                    color: "from-purple-500 to-pink-500",
                  },
                  {
                    name: "Music Ensemble",
                    members: 62,
                    icon: <Music className="w-5 h-5" />,
                    color: "from-purple-500 to-pink-500",
                  },
                  {
                    name: "Photography Club",
                    members: 34,
                    icon: <Camera className="w-5 h-5" />,
                    color: "from-purple-500 to-pink-500",
                  },
                ].map((club, index) => (
                  <AnimatedCard
                    key={club.name}
                    className="group hover:scale-105 transition-all duration-300 cursor-pointer animate-slideInUp bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700 hover:border-primary/30 shadow-md hover:shadow-lg relative overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-4 xs:p-5 sm:p-6 text-center relative z-10">
                      <div className="relative mb-4 xs:mb-5 sm:mb-6">
                        <div
                          className={`w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 mx-auto rounded-lg xs:rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300 shadow-md bg-gradient-to-r ${club.color}`}
                        >
                          {club.icon}
                        </div>
                        <div className="absolute -top-1 xs:-top-2 -right-1 xs:-right-2 bg-gradient-to-r from-orange-400 to-red-400 text-white text-[10px] xs:text-xs font-bold px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full shadow-md">
                          {club.members}
                        </div>
                      </div>

                      <h3 className="text-base xs:text-lg font-bold mb-2 xs:mb-3 group-hover:text-primary transition-colors duration-300 leading-tight">
                        {club.name}
                      </h3>

                      <div className="flex items-center justify-center space-x-1 xs:space-x-2 mb-3 xs:mb-4">
                        <Users className="w-3 h-3 xs:w-4 xs:h-4 text-muted-foreground" />
                        <span className="text-xs xs:text-sm font-medium text-muted-foreground">
                          {club.members} active members
                        </span>
                      </div>

                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300 group-hover:scale-105 text-xs xs:text-sm h-8 xs:h-9 sm:h-10 md:h-11 lg:h-12 rounded-full"
                      >
                        <span className="mr-1 xs:mr-2">Join Club</span>
                      </AnimatedButton>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="special" className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-3">🌟 Special Interest & Community Groups</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Pursue your unique interests and make a positive impact in your community.
                </p>
              </div>

              <div className="grid xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6">
                {[
                  {
                    name: "Gaming Club",
                    members: 78,
                    icon: <Gamepad2 className="w-5 h-5" />,
                    color: "from-green-500 to-teal-500",
                  },
                  {
                    name: "Environmental Club",
                    members: 41,
                    icon: <Globe className="w-5 h-5" />,
                    color: "from-green-500 to-teal-500",
                  },
                  {
                    name: "Volunteer Corps",
                    members: 92,
                    icon: <Heart className="w-5 h-5" />,
                    color: "from-green-500 to-teal-500",
                  },
                  {
                    name: "Cultural Club",
                    members: 56,
                    icon: <Users className="w-5 h-5" />,
                    color: "from-green-500 to-teal-500",
                  },
                ].map((club, index) => (
                  <AnimatedCard
                    key={club.name}
                    className="group hover:scale-105 transition-all duration-300 cursor-pointer animate-slideInUp bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700 hover:border-primary/30 shadow-md hover:shadow-lg relative overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-4 xs:p-5 sm:p-6 text-center relative z-10">
                      <div className="relative mb-4 xs:mb-5 sm:mb-6">
                        <div
                          className={`w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 mx-auto rounded-lg xs:rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300 shadow-md bg-gradient-to-r ${club.color}`}
                        >
                          {club.icon}
                        </div>
                        <div className="absolute -top-1 xs:-top-2 -right-1 xs:-right-2 bg-gradient-to-r from-orange-400 to-red-400 text-white text-[10px] xs:text-xs font-bold px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full shadow-md">
                          {club.members}
                        </div>
                      </div>

                      <h3 className="text-base xs:text-lg font-bold mb-2 xs:mb-3 group-hover:text-primary transition-colors duration-300 leading-tight">
                        {club.name}
                      </h3>

                      <div className="flex items-center justify-center space-x-1 xs:space-x-2 mb-3 xs:mb-4">
                        <Users className="w-3 h-3 xs:w-4 xs:h-4 text-muted-foreground" />
                        <span className="text-xs xs:text-sm font-medium text-muted-foreground">
                          {club.members} active members
                        </span>
                      </div>

                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300 group-hover:scale-105 text-xs xs:text-sm h-8 xs:h-9 sm:h-10 md:h-11 lg:h-12 rounded-full"
                      >
                        <span className="mr-1 xs:mr-2">Join Club</span>
                      </AnimatedButton>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Events Calendar */}
      <section id="events" className="py-20 bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <Badge variant="secondary" className="mb-4">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Events & Activities
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Interactive <span className="gradient-text">Event Calendar</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover upcoming events, activities, and important dates. Filter by category and never miss what matters
              to you.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Enhanced Calendar Widget */}
            <div className="lg:col-span-1">
              <AnimatedCard
                variant="lift"
                className="p-6 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/20 border-2 border-blue-100 dark:border-blue-800/30"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Event Calendar</h3>
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    {events.length} Events
                  </Badge>
                </div>

                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-lg border-0 bg-transparent"
                  classNames={{
                    months: "space-y-4",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-lg font-semibold",
                    nav: "space-x-1 flex items-center",
                    nav_button:
                      "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-all",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-blue-100 dark:[&:has([aria-selected])]:bg-blue-900/30 [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                    day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-all",
                    day_selected:
                      "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-500 focus:text-white",
                    day_today: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                  }}
                />

                {/* Event Legend */}
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Event Categories
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: "Academic", color: "bg-blue-500", count: 2 },
                      { type: "Sports", color: "bg-green-500", count: 1 },
                      { type: "Arts", color: "bg-purple-500", count: 2 },
                      { type: "Leadership", color: "bg-orange-500", count: 1 },
                    ].map((category) => (
                      <div key={category.type} className="flex items-center space-x-2 text-sm">
                        <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                        <span className="text-muted-foreground">{category.type}</span>
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {category.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            </div>

            {/* Enhanced Events List */}
            <div className="lg:col-span-2">
              {/* Event Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700"
                >
                  All Events
                </AnimatedButton>
                <AnimatedButton variant="ghost" size="sm">
                  Academic
                </AnimatedButton>
                <AnimatedButton variant="ghost" size="sm">
                  Sports
                </AnimatedButton>
                <AnimatedButton variant="ghost" size="sm">
                  Arts
                </AnimatedButton>
                <AnimatedButton variant="ghost" size="sm">
                  Leadership
                </AnimatedButton>
              </div>

              {/* Events Grid */}
              <div className="space-y-4">
                {displayedEvents.map((event, index) => {
                  const eventDate = new Date(event.date)
                  const isUpcoming = eventDate >= new Date()
                  const categoryColors = {
                    Academic: "from-blue-500 to-blue-600",
                    Sports: "from-green-500 to-green-600",
                    Arts: "from-purple-500 to-purple-600",
                    Leadership: "from-orange-500 to-orange-600",
                  }

                  return (
                    <AnimatedCard
                      key={index}
                      variant="lift"
                      className={`group hover:shadow-lg transition-all duration-300 animate-slideInUp border-l-4 ${
                        event.type === "Academic"
                          ? "border-l-blue-500"
                          : event.type === "Sports"
                            ? "border-l-green-500"
                            : event.type === "Arts"
                              ? "border-l-purple-500"
                              : "border-l-orange-500"
                      } ${!isUpcoming ? "opacity-60" : ""}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            {/* Date Badge */}
                            <div
                              className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${categoryColors[event.type as keyof typeof categoryColors]} text-white flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}
                            >
                              <span className="text-xs font-medium uppercase">
                                {eventDate.toLocaleDateString("en-US", { month: "short" })}
                              </span>
                              <span className="text-lg font-bold">{eventDate.getDate()}</span>
                            </div>

                            {/* Event Details */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                  {event.title}
                                </h4>
                                {isUpcoming && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                  >
                                    Upcoming
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{eventDate.toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>School Campus</span>
                                </div>
                              </div>

                              <p className="text-muted-foreground text-sm leading-relaxed">
                                {event.type === "Academic"
                                  ? "Join us for an exciting academic competition and showcase your knowledge."
                                  : event.type === "Sports"
                                    ? "Cheer on our teams as they compete for championship glory."
                                    : event.type === "Arts"
                                      ? "Experience the creativity and talent of our artistic community."
                                      : "Participate in leadership development and community building activities."}
                              </p>
                            </div>
                          </div>

                          {/* Event Type Badge */}
                          <Badge
                            variant="outline"
                            className={`${
                              event.type === "Academic"
                                ? "border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400"
                                : event.type === "Sports"
                                  ? "border-green-200 dark:border-green-700 text-green-600 dark:text-green-400"
                                  : event.type === "Arts"
                                    ? "border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400"
                                    : "border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400"
                            }`}
                          >
                            {event.type}
                          </Badge>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-muted/20">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>Open to all students</span>
                          </div>

                          <div className="flex space-x-2">
                            <AnimatedButton variant="ghost" size="sm" className="text-xs">
                              <Heart className="w-3 h-3 mr-1" />
                              Interested
                            </AnimatedButton>
                            <AnimatedButton variant="outline" size="sm" className="text-xs">
                              Learn More
                            </AnimatedButton>
                          </div>
                        </div>
                      </div>
                    </AnimatedCard>
                  )
                })}
              </div>

              {events.length > 3 && (
                <div className="text-center mt-6">
                  <AnimatedButton
                    variant="outline"
                    size="lg"
                    onClick={() => setShowAllEvents(!showAllEvents)}
                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                  >
                    {showAllEvents ? (
                      <>
                        <Users className="w-5 h-5 mr-2 rotate-180" />
                        View Less Events
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 mr-2" />
                        View More Events ({events.length - 3} more)
                      </>
                    )}
                  </AnimatedButton>
                </div>
              )}

              {/* View Full Calendar Button */}
              <div className="text-center mt-8">
                <AnimatedButton variant="gradient" size="lg" animation="glow">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  View Full Academic Calendar
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Services */}
      <section className="py-20 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <Badge variant="secondary" className="mb-4">
              <Heart className="w-4 h-4 mr-2" />
              Student Support
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Comprehensive <span className="gradient-text">Support Services</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We provide comprehensive support services to ensure every student has the resources they need to succeed
              academically and personally.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {supportServices.map((service, index) => (
              <AnimatedCard
                key={service.title}
                variant="lift"
                className="overflow-hidden animate-slideInUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`h-2 bg-gradient-to-r ${service.color}`} />
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${service.color} text-white mr-4`}>
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-primary" />
                      <span>{service.contact}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-primary" />
                      <span>{service.hours}</span>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section className="py-20 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6">
              <Users className="w-4 h-4 mr-2" />
              Student Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Student <span className="text-blue-600 dark:text-blue-400">Voices</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Hear what our students have to say about their experiences and the impact of our programs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedCard
                key={testimonial.name}
                variant="default"
                animation="float"
                className="text-center animate-slideInUp hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="p-8">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted p-1">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-bold text-lg mb-2 text-foreground">{testimonial.name}</h4>
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {testimonial.grade}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {testimonial.club}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="italic leading-relaxed text-muted-foreground text-base">"{testimonial.quote}"</p>
                  </div>

                  <div className="flex justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-muted-foreground mb-6 text-lg">Want to share your story?</p>
            <AnimatedButton variant="outline" className="bg-background hover:bg-muted">
              Share Your Experience
            </AnimatedButton>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-school-blue to-vibrant-purple text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join Our Community?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Experience the vibrant student life at Southville 8B NHS. Get involved, make friends, and create memories
            that will last a lifetime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton
              variant="outline"
              size="lg"
              className="bg-white text-blue-700 border-white hover:bg-white/90 hover:text-blue-800"
            >
              <Users className="w-5 h-5 mr-2" />
              Join a Club
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="lg"
              className="bg-white text-blue-700 border-white hover:bg-white/90 hover:text-blue-800"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Campus Tour
            </AnimatedButton>
          </div>
        </div>
      </section>
    </div>
  )
}
