"use client"

import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { cn } from "@/lib/utils"
import {
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Trophy,
  Users,
  Clock,
} from "lucide-react"
import { getAnnouncementBySlug, getRelatedAnnouncements, announcementsData } from "@/lib/announcements-data"

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

export default function AnnouncementDetailPage({ params }: { params: { slug: string } }) {
  const announcement = getAnnouncementBySlug(params.slug)

  if (!announcement) {
    notFound()
  }

  const config = categoryConfig[announcement.category]
  const Icon = config.icon
  const relatedAnnouncements = getRelatedAnnouncements(announcement.slug, announcement.category)

  // Find previous and next announcements
  const currentIndex = announcementsData.findIndex((a) => a.slug === announcement.slug)
  const previousAnnouncement = currentIndex > 0 ? announcementsData[currentIndex - 1] : null
  const nextAnnouncement = currentIndex < announcementsData.length - 1 ? announcementsData[currentIndex + 1] : null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: announcement.title,
          text: announcement.excerpt,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20">
      {/* Breadcrumb Navigation */}
      <section className="py-6 border-b border-border/50 bg-background/50 backdrop-blur-sm print:hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/guess/announcements" className="hover:text-foreground transition-colors">
                Announcements
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium line-clamp-1">{announcement.title}</span>
            </nav>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link href="/guess/announcements" className="print:hidden">
              <AnimatedButton variant="ghost" size="sm" className="mb-6 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Announcements
              </AnimatedButton>
            </Link>

            {/* Article Header */}
            <AnimatedCard className="mb-8 overflow-hidden">
              <div className="p-8">
                {/* Category Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("p-2 rounded-lg", config.bgColor)}>
                    <Icon className={cn("w-5 h-5", config.color)} />
                  </div>
                  <Badge variant="outline" className={cn(config.borderColor)}>
                    {config.label}
                  </Badge>
                  {announcement.sticky && (
                    <Badge variant="destructive" className="text-xs">
                      Pinned
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight text-balance">
                  {announcement.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={announcement.date}>{formatDate(announcement.date)}</time>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{announcement.author.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{announcement.source}</span>
                  </div>
                </div>

                {/* Excerpt */}
                <p className="text-lg text-muted-foreground leading-relaxed mb-6 text-pretty">{announcement.excerpt}</p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 print:hidden">
                  <AnimatedButton variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </AnimatedButton>
                  <AnimatedButton variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </AnimatedButton>
                </div>
              </div>
            </AnimatedCard>

            {/* Article Content */}
            <AnimatedCard className="mb-8">
              <div
                className="prose prose-slate dark:prose-invert max-w-none p-8 prose-headings:font-bold prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-3 prose-p:leading-relaxed prose-p:mb-4 prose-ul:my-4 prose-li:my-2 prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: announcement.content }}
              />

              {/* Tags */}
              {announcement.tags && announcement.tags.length > 0 && (
                <div className="px-8 pb-8">
                  <div className="pt-6 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                      {announcement.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {announcement.attachments && announcement.attachments.length > 0 && (
                <div className="px-8 pb-8">
                  <div className="pt-6 border-t border-border">
                    <h3 className="text-lg font-semibold mb-4">Attachments</h3>
                    <div className="space-y-2">
                      {announcement.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors group"
                          download
                        >
                          <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">
                            {attachment.name}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </AnimatedCard>

            {/* Previous/Next Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 print:hidden">
              {previousAnnouncement ? (
                <Link href={`/guess/announcements/${previousAnnouncement.slug}`} className="flex-1">
                  <AnimatedCard className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {previousAnnouncement.title}
                      </h3>
                    </div>
                  </AnimatedCard>
                </Link>
              ) : (
                <div className="flex-1" />
              )}

              {nextAnnouncement ? (
                <Link href={`/guess/announcements/${nextAnnouncement.slug}`} className="flex-1">
                  <AnimatedCard className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-2">
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {nextAnnouncement.title}
                      </h3>
                    </div>
                  </AnimatedCard>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>

            {/* Related Announcements */}
            {relatedAnnouncements.length > 0 && (
              <div className="print:hidden">
                <h2 className="text-2xl font-bold mb-6">Related Announcements</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedAnnouncements.map((related) => {
                    const relatedConfig = categoryConfig[related.category]
                    const RelatedIcon = relatedConfig.icon

                    return (
                      <Link key={related.id} href={`/guess/announcements/${related.slug}`}>
                        <AnimatedCard
                          variant="lift"
                          className="h-full cursor-pointer group hover:shadow-lg transition-all"
                        >
                          <div className="p-6">
                            <div className={cn("p-2 rounded-lg w-fit mb-4", relatedConfig.bgColor)}>
                              <RelatedIcon className={cn("w-5 h-5", relatedConfig.color)} />
                            </div>
                            <Badge variant="outline" className={cn("mb-3 text-xs", relatedConfig.borderColor)}>
                              {relatedConfig.label}
                            </Badge>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                              {related.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{related.excerpt}</p>
                            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <time>{formatDate(related.date)}</time>
                            </div>
                          </div>
                        </AnimatedCard>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          article {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
