"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { GuessBreadcrumb } from "@/components/ui/guess-breadcrumb"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  GraduationCap,
  Users,
  Trophy,
  Search,
  Calculator,
  Microscope,
  Globe,
  BookOpen,
  Heart,
  Leaf,
  Code,
  Newspaper,
  Languages,
  History,
  ArrowRight,
  Star,
  Calendar,
  MapPin,
  Clock,
  Award,
  Target,
  Sparkles,
  Filter,
} from "lucide-react"

export default function ExtracurricularClient() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const [heroRef, heroInView] = useIntersectionObserver({ threshold: 0.1 })
  const [clubsRef, clubsInView] = useIntersectionObserver({ threshold: 0.1 })

  const academicClubs = [
    // STEM & Academic Excellence
    {
      id: "math-club",
      name: "Math Club",
      category: "stem",
      members: 42,
      meetingTime: "Tuesdays 3:30 PM",
      location: "Room 205",
      adviser: "Dr. Maria Martinez",
      description:
        "Explore advanced mathematical concepts, compete in regional and national competitions, and develop problem-solving skills through challenging mathematical puzzles and proofs.",
      focusAreas: ["Competition Math", "Problem Solving", "Mathematical Proofs", "Peer Tutoring"],
      activities: [
        "AMC/AIME Competitions",
        "Math Olympiad Training",
        "Peer Tutoring Sessions",
        "Mathematical Research Projects",
      ],
      achievements: ["State Champions 2023", "Regional Winners", "National Qualifiers"],
      icon: <Calculator className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      featured: true,
      link: "/guess/clubs/math-club",
    },
    {
      id: "science-olympiad",
      name: "Science Olympiad",
      category: "stem",
      members: 38,
      meetingTime: "Wednesdays 3:45 PM",
      location: "Science Lab A",
      adviser: "Dr. Sarah Chen",
      description:
        "Compete in 23 different science events covering biology, chemistry, physics, and engineering. Build devices, conduct experiments, and test your scientific knowledge.",
      focusAreas: ["Experimental Design", "Device Building", "Scientific Knowledge", "Team Collaboration"],
      activities: ["Regional Competitions", "Device Construction", "Lab Experiments", "Study Sessions"],
      achievements: ["State Qualifiers", "Regional Medalists", "Top 10 Statewide"],
      icon: <Microscope className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      link: "/guess/clubs/science-club",
    },
    {
      id: "robotics-club",
      name: "Robotics Club",
      category: "stem",
      members: 35,
      meetingTime: "Thursdays 4:00 PM",
      location: "Engineering Lab",
      adviser: "Mr. James Wilson",
      description:
        "Design, build, and program robots for competitions. Learn engineering principles, coding, and teamwork while creating innovative robotic solutions.",
      focusAreas: ["Robot Design", "Programming", "Engineering", "Competition Strategy"],
      activities: ["FIRST Robotics Competition", "Robot Building", "Programming Workshops", "Engineering Challenges"],
      achievements: ["Regional Finalists", "Innovation Award", "Rookie All-Star"],
      icon: <Code className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      link: "/guess/clubs/robotics-club",
    },
    {
      id: "computer-science-club",
      name: "Computer Science Club",
      category: "stem",
      members: 45,
      meetingTime: "Fridays 3:30 PM",
      location: "Computer Lab",
      adviser: "Ms. Lisa Park",
      description:
        "Explore programming languages, develop apps and websites, and participate in coding competitions. Perfect for aspiring software developers and tech enthusiasts.",
      focusAreas: ["Web Development", "Mobile Apps", "Competitive Programming", "AI/Machine Learning"],
      activities: ["Hackathons", "Coding Competitions", "App Development", "Tech Workshops"],
      achievements: ["State Coding Champions", "App Store Publications", "Hackathon Winners"],
      icon: <Code className="w-6 h-6" />,
      color: "from-indigo-500 to-indigo-600",
    },

    // Language & Literature
    {
      id: "debate-team",
      name: "Debate Team",
      category: "language",
      members: 28,
      meetingTime: "Mondays 4:00 PM",
      location: "Room 301",
      adviser: "Mr. Robert Thompson",
      description:
        "Develop critical thinking, public speaking, and argumentation skills through competitive debate. Participate in local, state, and national tournaments.",
      focusAreas: ["Public Speaking", "Critical Thinking", "Research Skills", "Argumentation"],
      activities: ["Tournament Competitions", "Practice Debates", "Research Sessions", "Speech Workshops"],
      achievements: ["State Tournament Finalists", "Regional Champions", "National Qualifiers"],
      icon: <Users className="w-6 h-6" />,
      color: "from-red-500 to-red-600",
      link: "/guess/clubs/debate-team",
    },
    {
      id: "model-un",
      name: "Model United Nations",
      category: "language",
      members: 32,
      meetingTime: "Wednesdays 3:30 PM",
      location: "Room 302",
      adviser: "Ms. Jennifer Adams",
      description:
        "Simulate UN proceedings, debate global issues, and develop diplomatic skills. Represent different countries and work toward international solutions.",
      focusAreas: ["International Relations", "Diplomacy", "Public Speaking", "Global Awareness"],
      activities: ["MUN Conferences", "Position Paper Writing", "Diplomatic Simulations", "Current Events Discussions"],
      achievements: ["Outstanding Delegation Awards", "Best Delegate Honors", "Conference Champions"],
      icon: <Globe className="w-6 h-6" />,
      color: "from-teal-500 to-teal-600",
      link: "/guess/clubs/model-un",
    },
    {
      id: "creative-writing",
      name: "Creative Writing Club",
      category: "language",
      members: 24,
      meetingTime: "Tuesdays 3:45 PM",
      location: "Library Conference Room",
      adviser: "Ms. Emily Rodriguez",
      description:
        "Express creativity through various forms of writing including poetry, short stories, and novels. Share work, receive feedback, and publish in school literary magazine.",
      focusAreas: ["Poetry", "Fiction Writing", "Creative Expression", "Literary Analysis"],
      activities: ["Writing Workshops", "Poetry Slams", "Literary Magazine", "Author Visits"],
      achievements: ["Published Literary Magazine", "Poetry Contest Winners", "Regional Writing Awards"],
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-pink-500 to-pink-600",
    },
    {
      id: "spanish-club",
      name: "Spanish Honor Society",
      category: "language",
      members: 29,
      meetingTime: "Thursdays 3:30 PM",
      location: "Room 201",
      adviser: "Señora Maria Gonzalez",
      description:
        "Celebrate Hispanic culture, improve Spanish language skills, and engage in community service. Explore literature, traditions, and current events from Spanish-speaking countries.",
      focusAreas: ["Language Proficiency", "Cultural Awareness", "Community Service", "Literature Study"],
      activities: ["Cultural Celebrations", "Language Immersion", "Community Outreach", "Film Screenings"],
      achievements: ["Cultural Exchange Programs", "Community Service Awards", "Language Proficiency Certificates"],
      icon: <Languages className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
    },

    // Social Studies & History
    {
      id: "history-club",
      name: "History Club",
      category: "social",
      members: 26,
      meetingTime: "Mondays 3:30 PM",
      location: "Room 401",
      adviser: "Mr. David Miller",
      description:
        "Explore historical events, visit museums, and participate in historical reenactments. Develop research skills and historical thinking through engaging activities.",
      focusAreas: ["Historical Research", "Primary Sources", "Historical Thinking", "Cultural Understanding"],
      activities: ["Museum Visits", "Historical Reenactments", "Research Projects", "Guest Speaker Series"],
      achievements: ["History Fair Winners", "Research Publication", "Museum Partnerships"],
      icon: <History className="w-6 h-6" />,
      color: "from-amber-500 to-amber-600",
    },
    {
      id: "mock-trial",
      name: "Mock Trial Team",
      category: "social",
      members: 22,
      meetingTime: "Tuesdays 4:00 PM",
      location: "Room 402",
      adviser: "Ms. Patricia Lee",
      description:
        "Experience the legal system firsthand by participating in mock trials. Develop skills in legal reasoning, public speaking, and critical analysis.",
      focusAreas: ["Legal Reasoning", "Court Procedures", "Evidence Analysis", "Public Speaking"],
      activities: ["Mock Trial Competitions", "Legal Research", "Courtroom Simulations", "Attorney Mentorship"],
      achievements: ["State Competition Finalists", "Outstanding Attorney Awards", "Legal Excellence Recognition"],
      icon: <Award className="w-6 h-6" />,
      color: "from-slate-500 to-slate-600",
    },

    // Honor Societies
    {
      id: "nhs",
      name: "National Honor Society",
      category: "honor",
      members: 85,
      meetingTime: "First Monday 3:30 PM",
      location: "Auditorium",
      adviser: "Dr. Michael Johnson",
      description:
        "Recognize outstanding students who demonstrate excellence in scholarship, leadership, service, and character. Engage in meaningful community service projects.",
      focusAreas: ["Academic Excellence", "Leadership Development", "Community Service", "Character Building"],
      activities: ["Community Service Projects", "Tutoring Programs", "Leadership Workshops", "Fundraising Events"],
      achievements: ["National Recognition", "Community Impact Awards", "Scholarship Recipients"],
      icon: <GraduationCap className="w-6 h-6" />,
      color: "from-blue-600 to-blue-700",
      featured: true,
    },
    {
      id: "beta-club",
      name: "Beta Club",
      category: "honor",
      members: 67,
      meetingTime: "Second Wednesday 3:30 PM",
      location: "Room 501",
      adviser: "Ms. Karen White",
      description:
        "Promote academic achievement, character, service, and leadership among students. Participate in state and national conventions while serving the community.",
      focusAreas: ["Academic Achievement", "Character Development", "Service Learning", "Leadership Skills"],
      activities: ["State Conventions", "Service Projects", "Academic Competitions", "Leadership Training"],
      achievements: ["State Convention Awards", "Service Hour Recognition", "Academic Excellence"],
      icon: <Star className="w-6 h-6" />,
      color: "from-yellow-500 to-yellow-600",
    },

    // Special Interest
    {
      id: "environmental-club",
      name: "Environmental Club",
      category: "special",
      members: 41,
      meetingTime: "Fridays 3:45 PM",
      location: "Room 101",
      adviser: "Ms. Rachel Green",
      description:
        "Promote environmental awareness and sustainability. Organize recycling programs, garden projects, and environmental education initiatives.",
      focusAreas: ["Environmental Science", "Sustainability", "Conservation", "Community Education"],
      activities: ["Recycling Programs", "School Garden", "Environmental Cleanups", "Awareness Campaigns"],
      achievements: ["Green School Certification", "Environmental Awards", "Community Recognition"],
      icon: <Leaf className="w-6 h-6" />,
      color: "from-green-600 to-green-700",
    },
    {
      id: "student-newspaper",
      name: "Student Newspaper",
      category: "special",
      members: 18,
      meetingTime: "Thursdays 3:45 PM",
      location: "Journalism Room",
      adviser: "Mr. Alex Turner",
      description:
        "Report on school news, write feature articles, and develop journalism skills. Publish monthly newspaper and maintain school news website.",
      focusAreas: ["Journalism", "Writing Skills", "Photography", "Digital Media"],
      activities: ["News Reporting", "Feature Writing", "Photography", "Website Management"],
      achievements: ["Journalism Awards", "Published Articles", "Media Recognition"],
      icon: <Newspaper className="w-6 h-6" />,
      color: "from-gray-500 to-gray-600",
    },
  ]

  const categories = [
    { id: "all", name: "All Clubs", icon: <Target className="w-4 h-4" />, count: academicClubs.length },
    {
      id: "stem",
      name: "STEM",
      icon: <Microscope className="w-4 h-4" />,
      count: academicClubs.filter((club) => club.category === "stem").length,
    },
    {
      id: "language",
      name: "Language & Literature",
      icon: <BookOpen className="w-4 h-4" />,
      count: academicClubs.filter((club) => club.category === "language").length,
    },
    {
      id: "social",
      name: "Social Studies",
      icon: <Globe className="w-4 h-4" />,
      count: academicClubs.filter((club) => club.category === "social").length,
    },
    {
      id: "honor",
      name: "Honor Societies",
      icon: <Award className="w-4 h-4" />,
      count: academicClubs.filter((club) => club.category === "honor").length,
    },
    {
      id: "special",
      name: "Special Interest",
      icon: <Heart className="w-4 h-4" />,
      count: academicClubs.filter((club) => club.category === "special").length,
    },
  ]

  const filteredClubs = academicClubs.filter((club) => {
    const matchesCategory = activeCategory === "all" || club.category === activeCategory
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      club.name.toLowerCase().includes(query) ||
      club.description.toLowerCase().includes(query) ||
      club.focusAreas.some((area) => area.toLowerCase().includes(query))
    return matchesCategory && matchesSearch
  })

  const featuredClubs = academicClubs.filter((club) => club.featured)

  return (
    <div className="min-h-screen bg-background">
      <GuessBreadcrumb items={[{ label: "Extracurricular" }]} />
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative overflow-hidden"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-10 bg-gradient-to-r from-blue-400 to-purple-400"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 200 + 100}px`,
                height: `${Math.random() * 200 + 100}px`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={cn("text-center max-w-4xl mx-auto", heroInView && "animate-fadeIn")}>            
            <Badge variant="secondary" className="mb-6 text-lg px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm">
              <GraduationCap className="w-5 h-5 mr-3" />
              Academic Excellence & Leadership
              <Sparkles className="w-5 h-5 ml-3" />
            </Badge>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight">
              Explore Our <span className="gradient-text">Academic Clubs</span>
            </h1>

            <p className="text-xl md:text-2xl leading-relaxed mb-12 max-w-3xl mx-auto text-muted-foreground">
              Discover your passion, develop your talents, and join a community of like-minded students dedicated to
              academic excellence and personal growth.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[
                { number: "15+", label: "Academic Clubs", icon: "🎓" },
                { number: "400+", label: "Active Members", icon: "👥" },
                { number: "50+", label: "Competitions Won", icon: "🏆" },
                { number: "25+", label: "Years of Excellence", icon: "⭐" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:scale-110 transition-all duration-300 cursor-pointer group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold mb-2 text-primary">{stat.number}</div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Clubs Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Star className="w-4 h-4 mr-2" />
              Featured Clubs
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Spotlight on <span className="gradient-text">Excellence</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our most distinguished academic clubs with outstanding achievements and opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {featuredClubs.map((club, index) => (
              <AnimatedCard
                key={club.id}
                className="group hover:scale-105 transition-all duration-300 cursor-pointer animate-slideInUp overflow-hidden relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link href={club.link || "/extracurricular"}>
                  <div className="p-8">
                    {/* Club Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div
                          className={cn(
                            "w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg",
                            `bg-gradient-to-r ${club.color}`,
                          )}
                        >
                          {club.icon}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{club.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {club.members} members
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {club.meetingTime}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                        Featured
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground mb-6 leading-relaxed">{club.description}</p>

                    {/* Achievements */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                        Recent Achievements
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {club.achievements.map((achievement, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {club.location}
                        </div>
                      </div>
                      <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <span className="text-sm font-medium mr-2">Learn More</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* All Clubs Section */}
      <section ref={clubsRef} className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className={cn("text-center mb-12", clubsInView && "animate-fadeIn")}>            
            <Badge variant="secondary" className="mb-4">
              <Filter className="w-4 h-4 mr-2" />
              All Academic Clubs
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Find Your <span className="gradient-text">Perfect Match</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse all our academic clubs by category or search for specific interests.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search clubs by name, description, or focus area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base rounded-full border-2 focus:border-primary"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 bg-gray-100 dark:bg-gray-800 rounded-full p-1 shadow-sm">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="text-xs lg:text-sm font-medium px-3 lg:px-4 py-2 rounded-full data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 transition-all duration-200 flex items-center space-x-1 lg:space-x-2"
                  >
                    {category.icon}
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden">{category.name.split(" ")[0]}</span>
                    <Badge variant="secondary" className="ml-1 lg:ml-2 text-xs bg-white/20 text-current">
                      {category.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Clubs Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredClubs.map((club, index) => (
                <AnimatedCard
                  key={club.id}
                  className="group hover:scale-105 transition-all duration-300 cursor-pointer animate-slideInUp bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700 hover:border-primary/30 shadow-md hover:shadow-lg relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Link href={club.link || "/extracurricular"}>
                    <div className="p-6 relative z-10">
                      {/* Club Icon and Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300 shadow-md",
                            `bg-gradient-to-r ${club.color}`,
                          )}
                        >
                          {club.icon}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {club.members} members
                        </Badge>
                      </div>

                      {/* Club Name */}
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300 leading-tight">
                        {club.name}
                      </h3>

                      {/* Description */}
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
                        {club.description}
                      </p>

                      {/* Focus Areas */}
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                          Focus Areas
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {club.focusAreas.slice(0, 3).map((area, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                          {club.focusAreas.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{club.focusAreas.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Meeting Info */}
                      <div className="space-y-2 mb-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-2" />
                          {club.meetingTime}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-2" />
                          {club.location}
                        </div>
                      </div>

                      {/* Join Button */}
                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300 group-hover:scale-105"
                      >
                        <span className="mr-2">Learn More</span>
                        <ArrowRight className="w-4 h-4" />
                      </AnimatedButton>
                    </div>
                  </Link>
                </AnimatedCard>
              ))}
            </div>

            {/* No Results */}
            {filteredClubs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No clubs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or selecting a different category.
                </p>
                <AnimatedButton
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveCategory("all")
                  }}
                >
                  Clear Filters
                </AnimatedButton>
              </div>
            )}
          </Tabs>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 bg-white"
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
          <div className="text-center max-w-3xl mx-auto">
            <Badge
              variant="secondary"
              className="mb-6 text-base px-6 py-3 rounded-full bg-white/20 text-white border-white/30"
            >
              <Sparkles className="w-5 h-5 mr-3" />
              Ready to Get Involved?
              <Heart className="w-5 h-5 ml-3" />
            </Badge>

            <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight text-white">
              Join Our Academic <span className="gradient-text">Community</span>
            </h2>

            <p className="text-lg md:text-xl mb-12 leading-relaxed max-w-2xl mx-auto text-white/90">
              Take the next step in your academic journey. Connect with passionate students, dedicated advisers, and
              exciting opportunities for growth and achievement.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <AnimatedButton
                size="lg"
                className="group font-bold text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl w-full sm:w-auto relative overflow-hidden transition-all duration-300 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 hover:scale-105"
                asChild
              >
                <Link href="/contact">
                  <Users className="w-6 h-6 mr-3 group-hover:scale-110 transition-all duration-300" />
                  Contact Club Advisers
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-all duration-300" />
                </Link>
              </AnimatedButton>

              <AnimatedButton
                variant="outline"
                size="lg"
                className="group font-bold text-lg px-8 py-4 rounded-full w-full sm:w-auto transition-all duration-300 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-105"
                asChild
              >
                <Link href="/news-events">
                  <Calendar className="w-6 h-6 mr-3 group-hover:scale-110 transition-all duration-300" />
                  View Club Events
                </Link>
              </AnimatedButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
