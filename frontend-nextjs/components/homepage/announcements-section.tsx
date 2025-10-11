"use client"

import { useState } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Bell, Calendar, ArrowRight, AlertCircle, BookOpen, Trophy, Users } from "lucide-react"
import Link from "next/link"
import { announcementsData } from "@/lib/announcements-data"

interface Announcement {
  id: string
  date: string
  title: string
  category: "urgent" | "academic" | "event" | "general"
  source: string
  excerpt: string
  href: string
  slug: string
}

const categoryConfig = {
  urgent: {
    icon: AlertCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    label: "Urgent",
  },
  academic: {
    icon: BookOpen,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    label: "Academic",
  },
  event: {
    icon: Trophy,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    label: "Event",
  },
  general: {
    icon: Users,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    borderColor: "border-slate-200 dark:border-slate-800",
    label: "General",
  },
}

export function AnnouncementsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredAnnouncements =
    selectedCategory === "all"
      ? announcementsData.slice(0, 4)
      : announcementsData.filter((announcement) => announcement.category === selectedCategory).slice(0, 4)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Bell className="w-4 h-4 mr-2" />
            Latest Updates
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            School <span className="gradient-text">Announcements</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Stay informed about important updates, achievements, and upcoming events from Southville 8B NHS
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <AnimatedButton
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className="transition-all duration-300"
          >
            All Announcements
          </AnimatedButton>
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <AnimatedButton
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className="transition-all duration-300"
              >
                <Icon className="w-4 h-4 mr-2" />
                {config.label}
              </AnimatedButton>
            )
          })}
        </div>

        {/* Announcements List */}
        <div className="max-w-5xl mx-auto space-y-6 mb-12">
          {filteredAnnouncements.map((announcement, index) => {
            const config = categoryConfig[announcement.category]
            const Icon = config.icon

            return (
              <Link key={announcement.id} href={`/guess/announcements/${announcement.slug}`}>
                <AnimatedCard
                  variant="lift"
                  className={cn(
                    "group cursor-pointer overflow-hidden transition-all duration-300",
                    "hover:shadow-xl hover:scale-[1.02]",
                    "animate-slideInUp",
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6 p-6">
                    {/* Date Section */}
                    <div className="flex-shrink-0 md:w-32">
                      <div className="flex items-center md:flex-col md:items-start gap-2">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <time className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          {formatDate(announcement.date)}
                        </time>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-16 bg-border" />

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={cn("p-2 rounded-lg", config.bgColor)}>
                          <Icon className={cn("w-5 h-5", config.color)} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight mb-2">
                            {announcement.title}
                          </h3>
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className={cn("text-xs", config.borderColor)}>
                              {config.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{announcement.source}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {announcement.excerpt}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                        <ArrowRight className="w-5 h-5 text-primary group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </Link>
            )
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/guess/announcements">
            <AnimatedButton
              variant="gradient"
              size="lg"
              className="group hover:scale-105 transition-all duration-300"
              animation="glow"
            >
              View All Announcements
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </AnimatedButton>
          </Link>
        </div>
      </div>
    </section>
  )
}
