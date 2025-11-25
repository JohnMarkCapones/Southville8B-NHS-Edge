"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Eye,
  Clock,
  Tag,
  ArrowLeft,
  ChevronRight,
  Star,
  TrendingUp,
  ArrowUp,
  Printer,
  AlertCircle,
  RefreshCw,
  Users,
  BarChart3,
  Share2,
  CheckCircle2,
  XCircle,
  FileEdit,
  Globe,
  Lock,
  UserCheck,
  ShieldCheck,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { newsApi, getCategoryName, getAuthorName, formatDate } from "@/lib/api/endpoints/news"
import { cn } from "@/lib/utils"

export default function TeacherNewsViewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [readingProgress, setReadingProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Fetch article by ID using authenticated endpoint
  const { data: article, isLoading, error, refetch } = useQuery({
    queryKey: ['news', 'teacher', id],
    queryFn: () => newsApi.getNewsById(id),
    enabled: !!id,
    staleTime: 0, // Always fetch fresh data
    retry: 1,
  })

  // Fetch related articles
  const { data: relatedArticles = [] } = useQuery({
    queryKey: ['news', 'related', id],
    queryFn: () => newsApi.getRelatedNews(id, 3),
    enabled: !!id && !!article,
  })

  // Reading progress and scroll tracking
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          const progress = (scrollTop / docHeight) * 100
          setReadingProgress(Math.min(progress, 100))
          setShowScrollTop(scrollTop > 500)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePrint = () => {
    window.print()
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      'Draft': { label: 'Draft', className: 'bg-gray-500', icon: FileEdit },
      'Pending Review': { label: 'Pending Review', className: 'bg-yellow-500', icon: Clock },
      'Approved': { label: 'Approved', className: 'bg-green-500', icon: CheckCircle2 },
      'Published': { label: 'Published', className: 'bg-blue-500', icon: CheckCircle2 },
    }
    return statusMap[status] || { label: status, className: 'bg-gray-500', icon: FileEdit }
  }

  // Get visibility badge
  const getVisibilityBadge = (visibility: string) => {
    const visibilityMap: Record<string, { label: string; className: string; icon: any }> = {
      'Public': { label: 'Public', className: 'bg-green-600', icon: Globe },
      'Students Only': { label: 'Students', className: 'bg-blue-600', icon: UserCheck },
      'Teachers Only': { label: 'Teachers', className: 'bg-purple-600', icon: ShieldCheck },
      'Internal': { label: 'Internal', className: 'bg-red-600', icon: Lock },
    }
    return visibilityMap[visibility] || { label: visibility, className: 'bg-gray-600', icon: Globe }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Loading skeleton */}
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded w-48 mb-6"></div>
              <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
              <div className="aspect-video bg-muted rounded-2xl mb-8"></div>
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Failed to load article</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              There was an error loading this news article. Please try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => refetch()} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link href="/teacher/news">Back to News</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Article not found
  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Article not found</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              The news article you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="outline" asChild>
              <Link href="/teacher/news">Back to News</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const statusBadge = getStatusBadge(article.status as string)
  const visibilityBadge = getVisibilityBadge(article.visibility as string)
  const StatusIcon = statusBadge.icon
  const VisibilityIcon = visibilityBadge.icon

  return (
    <div>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Back Navigation */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/teacher/news" className="flex items-center gap-1 hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to News
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="capitalize">{getCategoryName(article.category)}</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium truncate">View Article</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={`/teacher/news/edit/${article.id}`}>
                <FileEdit className="w-4 h-4 mr-2" />
                Edit Article
              </Link>
            </Button>
          </div>

          {/* Article Header */}
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Badges Row */}
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-500 text-white capitalize">
                  {getCategoryName(article.category)}
                </Badge>
                {article.featured && (
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {article.trending && (
                  <Badge className="bg-red-500 text-white">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
                <Badge className={cn("text-white", statusBadge.className)}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusBadge.label}
                </Badge>
                <Badge className={cn("text-white", visibilityBadge.className)}>
                  <VisibilityIcon className="w-3 h-3 mr-1" />
                  {visibilityBadge.label}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {article.title}
              </h1>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed break-words whitespace-normal">
                  {article.excerpt}
                </p>
              )}

              {/* Author & Metadata Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 ring-2 ring-blue-500/20">
                    <AvatarImage src={article.authorImage || "/placeholder.svg"} alt={getAuthorName(article.author)} />
                    <AvatarFallback>
                      {getAuthorName(article.author)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">{getAuthorName(article.author)}</div>
                    <div className="text-sm">Author</div>
                  </div>
                </div>

                <Separator orientation="vertical" className="hidden sm:block h-12" />

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {article.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {article.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {article.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    {article.shares} shares
                  </span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {article.image && (
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg group">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content - Takes 2/3 on desktop */}
            <div className="lg:col-span-2 space-y-6 min-w-0">
              {/* Article Content */}
              <Card className="overflow-hidden shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-6 sm:p-8">
                  <div
                    ref={contentRef}
                    className={cn(
                      "prose prose-slate dark:prose-invert max-w-none break-words",
                      "prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-tight prose-headings:break-words",
                      "prose-h1:text-3xl prose-h1:mt-16 prose-h1:mb-10 prose-h1:leading-tight",
                      "prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:leading-tight prose-h2:font-semibold",
                      "prose-h3:text-xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:leading-tight prose-h3:font-semibold",
                      "prose-h4:text-lg prose-h4:mt-10 prose-h4:mb-5 prose-h4:leading-tight prose-h4:font-semibold",
                      "prose-ul:my-10 prose-ul:pl-6",
                      "prose-ol:my-10 prose-ol:pl-6",
                      "prose-li:my-4 prose-li:leading-relaxed prose-li:tracking-wide prose-li:break-words",
                      "prose-strong:text-foreground prose-strong:font-semibold",
                      "prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:break-words",
                      "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:my-10 prose-blockquote:break-words",
                      "prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:break-words",
                      "prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-10",
                      "[&>p]:text-xl [&>p]:leading-[1.8] [&>p]:text-foreground/50 [&>p]:mb-8 [&>p]:tracking-wide [&>p]:break-words [&>p]:whitespace-normal",
                      "[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>h2]:mt-12 [&>h2]:mb-6 [&>h2]:leading-tight [&>h2]:break-words",
                      "[&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-foreground [&>h3]:mt-10 [&>h3]:mb-5 [&>h3]:leading-tight [&>h3]:break-words",
                      "overflow-wrap-anywhere"
                    )}
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </CardContent>
              </Card>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer hover:scale-105"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrint}
                      className="gap-2 hover:scale-105 transition-all duration-300"
                    >
                      <Printer className="w-4 h-4" />
                      Print Article
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-2 hover:scale-105 transition-all duration-300"
                    >
                      <Link href={`/teacher/news/edit/${article.id}`}>
                        <FileEdit className="w-4 h-4" />
                        Edit Article
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Article Footer - Publish Info */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="text-sm text-muted-foreground">
                      Published on {article.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-white", statusBadge.className)}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusBadge.label}
                      </Badge>
                      <Badge className={cn("text-white", visibilityBadge.className)}>
                        <VisibilityIcon className="w-3 h-3 mr-1" />
                        {visibilityBadge.label}
                      </Badge>
                      {article.featured && (
                        <Badge className="bg-yellow-500 text-white">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Takes 1/3 on desktop */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start min-w-0">
              {/* About the Author */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">About the Author</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 ring-2 ring-blue-500/20 flex-shrink-0">
                      <AvatarImage src={article.authorImage || "/placeholder.svg"} alt={getAuthorName(article.author)} />
                      <AvatarFallback>
                        {getAuthorName(article.author)
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{getAuthorName(article.author)}</div>
                      <div className="text-sm text-muted-foreground">Article Author</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Article Stats */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Article Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{article.views}</div>
                      <div className="text-white/80">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{article.likes}</div>
                      <div className="text-white/80">Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{article.shares}</div>
                      <div className="text-white/80">Shares</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{article.comments}</div>
                      <div className="text-white/80">Comments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg">Related Articles</h3>
                    <div className="space-y-3">
                      {relatedArticles.map((relatedArticle) => (
                        <Link
                          key={relatedArticle.id}
                          href={`/teacher/news/view/${relatedArticle.id}`}
                          className="block group"
                        >
                          <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-muted">
                            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                              <Image
                                src={relatedArticle.image || "/placeholder.svg"}
                                alt={relatedArticle.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="80px"
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                {relatedArticle.title}
                              </h4>
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant="outline" className="text-xs capitalize px-2 py-0.5 font-medium">
                                  {getCategoryName(relatedArticle.category)}
                                </Badge>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                                  <Clock className="w-3 h-3" />
                                  {relatedArticle.readTime}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-blue-600 text-white">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-bold flex items-center gap-2">
                    <FileEdit className="w-4 h-4" />
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full justify-start hover:scale-105 transition-transform duration-300"
                      asChild
                    >
                      <Link href={`/teacher/news/edit/${article.id}`}>
                        <FileEdit className="w-4 h-4 mr-2" />
                        Edit Article
                      </Link>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full justify-start hover:scale-105 transition-transform duration-300"
                      asChild
                    >
                      <Link href="/teacher/news">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to News List
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
