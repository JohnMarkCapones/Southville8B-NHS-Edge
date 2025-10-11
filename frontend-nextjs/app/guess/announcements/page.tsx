"use client"

import { useState } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Bell, Calendar, ArrowRight, AlertCircle, BookOpen, Trophy, Users, Search, Filter } from "lucide-react"
import Link from "next/link"
import { announcementsData } from "@/lib/announcements-data"

interface Announcement {
  id: string
  date: string
  title: string
  category: "urgent" | "academic" | "event" | "general"
  source: string
  excerpt: string
  content: string
  href: string
  sticky?: boolean
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

export default function AnnouncementsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "category">("date")

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // Filter and search logic
  const filteredAnnouncements = announcementsData
    .filter((announcement) => {
      const matchesCategory = selectedCategory === "all" || announcement.category === selectedCategory
      const matchesSearch =
        searchQuery === "" ||
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return a.category.localeCompare(b.category)
    })

  // Separate sticky announcements
  const stickyAnnouncements = filteredAnnouncements.filter((a) => a.sticky)
  const regularAnnouncements = filteredAnnouncements.filter((a) => !a.sticky)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20">
      {/* Hero Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Bell className="w-4 h-4 mr-2" />
              Official Announcements
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              School <span className="gradient-text">Announcements</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Stay up-to-date with the latest news, events, and important updates from Southville 8B National High
              School
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Total Announcements", value: announcementsData.length, icon: Bell },
              {
                label: "Urgent",
                value: announcementsData.filter((a) => a.category === "urgent").length,
                icon: AlertCircle,
              },
              {
                label: "Academic",
                value: announcementsData.filter((a) => a.category === "academic").length,
                icon: BookOpen,
              },
              { label: "Events", value: announcementsData.filter((a) => a.category === "event").length, icon: Trophy },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-background/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="w-4 h-4" />
                Filter by:
              </div>
              <AnimatedButton
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </AnimatedButton>
              {Object.entries(categoryConfig).map(([key, config]) => {
                const Icon = config.icon
                return (
                  <AnimatedButton
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {config.label}
                  </AnimatedButton>
                )
              })}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <button
                onClick={() => setSortBy("date")}
                className={cn(
                  "text-sm font-medium transition-colors",
                  sortBy === "date" ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                Date
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                onClick={() => setSortBy("category")}
                className={cn(
                  "text-sm font-medium transition-colors",
                  sortBy === "category" ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                Category
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Sticky Announcements */}
            {stickyAnnouncements.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-2 text-red-500" />
                  Pinned Announcements
                </h2>
                <div className="space-y-6">
                  {stickyAnnouncements.map((announcement, index) => {
                    const config = categoryConfig[announcement.category]
                    const Icon = config.icon

                    return (
                      <Link key={announcement.id} href={`/guess/announcements/${announcement.slug}`}>
                        <AnimatedCard
                          variant="lift"
                          className={cn(
                            "group cursor-pointer overflow-hidden transition-all duration-300",
                            "hover:shadow-xl hover:scale-[1.02]",
                            "border-2 border-red-200 dark:border-red-800",
                            "animate-slideInUp",
                          )}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex flex-col md:flex-row md:items-center gap-6 p-6">
                            <div className="flex-shrink-0 md:w-32">
                              <div className="flex items-center md:flex-col md:items-start gap-2">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                <time className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                  {formatDate(announcement.date)}
                                </time>
                              </div>
                            </div>

                            <div className="hidden md:block w-px h-16 bg-border" />

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
                                    <Badge variant="destructive" className="text-xs">
                                      Pinned
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{announcement.source}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                    {announcement.excerpt}
                                  </p>
                                </div>
                              </div>
                            </div>

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
              </div>
            )}

            {/* Regular Announcements */}
            {regularAnnouncements.length > 0 ? (
              <div className="space-y-6">
                {regularAnnouncements.map((announcement, index) => {
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
                          <div className="flex-shrink-0 md:w-32">
                            <div className="flex items-center md:flex-col md:items-start gap-2">
                              <Calendar className="w-5 h-5 text-muted-foreground" />
                              <time className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                {formatDate(announcement.date)}
                              </time>
                            </div>
                          </div>

                          <div className="hidden md:block w-px h-16 bg-border" />

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
            ) : (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No announcements found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
