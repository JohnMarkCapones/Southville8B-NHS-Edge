import type { Metadata } from "next"
import Link from "next/link"
import { absoluteUrl } from "@/lib/seo"
import { JsonLd, buildBreadcrumbListSchema } from "@/components/seo/jsonld"
import { fetchClubsFromAPI } from "./data-mapping"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { cn } from "@/lib/utils"
import { 
  Calculator, 
  Microscope, 
  Code, 
  Users, 
  Music, 
  Palette, 
  Trophy, 
  Leaf, 
  Globe, 
  Drama, 
  ArrowRight,
  Crown,
  Medal,
  Star,
  ChevronRight,
  Home,
  ArrowLeft
} from "lucide-react"

// Icon mapping for clubs
const iconComponents = {
  Calculator,
  Microscope,
  Code,
  Users,
  Music,
  Palette,
  Trophy,
  Leaf,
  Globe,
  Drama,
  Crown,
  Medal,
  Star,
};

export const metadata: Metadata = {
  title: "Student Clubs | Southville 8B NHS",
  description: "Explore our diverse range of student clubs and organizations. Join clubs that match your interests and develop new skills.",
  alternates: {
    canonical: absoluteUrl("/guess/clubs"),
  },
  openGraph: {
    title: "Student Clubs | Southville 8B NHS",
    description: "Explore our diverse range of student clubs and organizations. Join clubs that match your interests and develop new skills.",
    url: absoluteUrl("/guess/clubs"),
    images: [
      {
        url: absoluteUrl("/api/og?title=Student%20Clubs&subtitle=Join%20Our%20Community"),
        width: 1200,
        height: 630,
        alt: "Student Clubs at Southville 8B NHS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Clubs | Southville 8B NHS",
    description: "Explore our diverse range of student clubs and organizations. Join clubs that match your interests and develop new skills.",
    images: [absoluteUrl("/api/og?title=Student%20Clubs&subtitle=Join%20Our%20Community")],
  },
}

export default async function ClubsIndexPage() {
  const breadcrumbs = buildBreadcrumbListSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Clubs", url: absoluteUrl("/guess/clubs") },
  ])

  let clubs
  try {
    clubs = await fetchClubsFromAPI()
    if (clubs.length === 0) {
      // Fallback to some basic clubs if API returns empty
      clubs = [
        {
          id: "math-club",
          slug: "math-club",
          name: "Math Club",
          icon: "Calculator",
          color: "from-blue-500 to-blue-600",
          members: 42,
          description: "Explore advanced mathematical concepts and compete in competitions.",
        },
        {
          id: "science-club",
          slug: "science-club", 
          name: "Science Club",
          icon: "Microscope",
          color: "from-green-500 to-green-600",
          members: 38,
          description: "Hands-on experiments and science fair preparation.",
        },
        {
          id: "robotics-club",
          slug: "robotics-club",
          name: "Robotics Club", 
          icon: "Code",
          color: "from-purple-500 to-purple-600",
          members: 35,
          description: "Design, build, and program robots for competitions.",
        },
      ]
    }
  } catch (error) {
    console.error('Failed to fetch clubs from API, using fallback data:', error)
    // Fallback clubs
    clubs = [
      {
        id: "math-club",
        slug: "math-club",
        name: "Math Club",
        icon: "Calculator",
        color: "from-blue-500 to-blue-600",
        members: 42,
        description: "Explore advanced mathematical concepts and compete in competitions.",
      },
      {
        id: "science-club",
        slug: "science-club", 
        name: "Science Club",
        icon: "Microscope",
        color: "from-green-500 to-green-600",
        members: 38,
        description: "Hands-on experiments and science fair preparation.",
      },
      {
        id: "robotics-club",
        slug: "robotics-club",
        name: "Robotics Club", 
        icon: "Code",
        color: "from-purple-500 to-purple-600",
        members: 35,
        description: "Design, build, and program robots for competitions.",
      },
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <JsonLd data={[breadcrumbs]} />
      
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
              <span className="text-slate-900 dark:text-slate-100 font-medium">
                Clubs
              </span>
            </nav>

            {/* Back Button */}
            <Link href="/">
              <AnimatedButton
                variant="outline"
                size="sm"
                className="hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Header Section */}
        <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4 bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
          <Users className="w-4 h-4 mr-2" />
          Student Organizations
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
          Join Our <span className="gradient-text">Amazing Clubs</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
          Discover your passion, develop new skills, and make lasting friendships through our diverse range of student clubs and organizations.
        </p>
      </div>

      {/* Clubs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {clubs.map((club, index) => {
          const IconComponent = iconComponents[club.icon as keyof typeof iconComponents] || Users
          
          return (
            <AnimatedCard
              key={club.id}
              variant="lift"
              className="group cursor-pointer hover:scale-105 transition-all duration-300 animate-slideInUp overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link href={`/guess/clubs/${club.slug}`}>
                <div className="p-8">
                  {/* Club Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform",
                      `bg-gradient-to-r ${club.color}`
                    )}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {club.members} Members
                    </Badge>
                  </div>

                  {/* Club Content */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {club.name}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed line-clamp-3">
                      {club.description}
                    </p>
                  </div>

                  {/* Club Footer */}
                  <div className="flex items-center text-primary group-hover:underline">
                    <span className="font-medium">Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </AnimatedCard>
          )
        })}
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-900/20 rounded-2xl p-12">
        <h2 className="text-3xl font-bold mb-4">Ready to Join a Club?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Don't see a club that matches your interests? Start your own! We're always excited to support new student initiatives.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <AnimatedButton asChild>
            <Link href="/contact">
              Start a New Club
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </AnimatedButton>
          <AnimatedButton variant="outline" asChild>
            <Link href="/guess/student-life">
              Learn About Student Life
            </Link>
          </AnimatedButton>
        </div>
      </div>
      </div>
    </div>
  )
}

export const revalidate = 3600
export const dynamic = "force-dynamic"
