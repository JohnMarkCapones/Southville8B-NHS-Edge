"use client"

import React, { useState } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Users, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { fetchClubsFromAPI, ClubItem } from "@/app/guess/clubs/data-mapping"

// Icon mapping for clubs
const iconComponents = {
  Calculator: "🧮",
  Microscope: "🔬", 
  Code: "💻",
  Users: "👥",
  Music: "🎵",
  Palette: "🎨",
  Trophy: "🏆",
  Leaf: "🌱",
  Globe: "🌍",
  Drama: "🎭",
  Crown: "👑",
  Medal: "🥇",
  Star: "⭐",
};

// Use the ClubItem type from data-mapping
type Club = Pick<ClubItem, 'id' | 'slug' | 'name' | 'icon' | 'color' | 'members' | 'description'>

export function ClubsSection() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [useApiData, setUseApiData] = useState(false)

  // Fetch clubs from API on component mount
  React.useEffect(() => {
    const loadClubs = async () => {
      try {
        const apiClubs = await fetchClubsFromAPI()
        if (apiClubs && apiClubs.length > 0) {
          setClubs(apiClubs.slice(0, 3)) // Show only first 3 clubs
          setUseApiData(true)
        } else {
          // Fallback to static data
          setClubs([
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
          ])
          setUseApiData(false)
        }
      } catch (error) {
        console.error('Failed to fetch clubs from API, using static data:', error)
        setClubs([
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
        ])
        setUseApiData(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadClubs()
  }, [])

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">
              <Users className="w-4 h-4 mr-2" />
              Student Clubs
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
              Join Our <span className="gradient-text">Amazing Clubs</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover your passion, develop new skills, and make lasting friendships through our diverse range of student clubs and organizations.
            </p>
          </div>
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading clubs...</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-900/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">
            <Users className="w-4 h-4 mr-2" />
            Student Clubs
          </Badge>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            Join Our <span className="gradient-text">Amazing Clubs</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover your passion, develop new skills, and make lasting friendships through our diverse range of student clubs and organizations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {clubs.map((club, index) => {
            const iconEmoji = iconComponents[club.icon as keyof typeof iconComponents] || "👥"
            
            return (
              <AnimatedCard
                key={club.id}
                variant="lift"
                className="group cursor-pointer hover:scale-105 transition-all duration-300 animate-slideInUp overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link href={`/guess/clubs/${club.slug}`}>
                  <div className="p-6">
                    {/* Club Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform text-2xl",
                        `bg-gradient-to-r ${club.color}`
                      )}>
                        {iconEmoji}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {club.members} Members
                      </Badge>
                    </div>

                    {/* Club Content */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {club.name}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {club.description}
                      </p>
                    </div>

                    {/* Club Footer */}
                    <div className="flex items-center text-primary group-hover:underline">
                      <span className="font-medium text-sm">Learn More</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
            )
          })}
        </div>

        <div className="text-center">
          <AnimatedButton asChild>
            <Link href="/guess/clubs">
              View All Clubs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </AnimatedButton>
        </div>
      </div>
    </section>
  )
}
