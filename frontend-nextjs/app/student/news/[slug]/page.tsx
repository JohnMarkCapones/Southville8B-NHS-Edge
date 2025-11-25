"use client"

import { useState, useEffect, useRef, useMemo, memo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import StudentLayout from "@/components/student/student-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Clock,
  Tag,
  ArrowLeft,
  Facebook,
  Twitter,
  Mail,
  Copy,
  ChevronRight,
  Star,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  ArrowUp,
  Printer,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { useNewsArticle, useRelatedNews } from "@/hooks/useNews"
import { NewsArticleSkeleton } from "@/components/ui/news-skeleton"
import { getCategoryName, getAuthorName, formatDate } from "@/lib/api/endpoints/news"
import { NewsArticle } from "@/types/news"
import { useToast } from "@/hooks/use-toast"

const RelatedArticleCard = memo(({ article }: { article: any }) => (
  <Link href={`/student/news/${article.slug}`} className="block group">
    <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-muted">
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
        <Image
          src={article.image || "/placeholder.svg"}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="80px"
        />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h4>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs capitalize px-2 py-0.5 font-medium">
            {getCategoryName(article.category)}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            <Clock className="w-3 h-3" />
            {article.readTime}
          </span>
        </div>
      </div>
    </div>
  </Link>
))
RelatedArticleCard.displayName = "RelatedArticleCard"

export default function NewsArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [rating, setRating] = useState(0)
  const [userRating, setUserRating] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const shareMenuRef = useRef<HTMLDivElement>(null)

  // API data fetching
  const { data: article, isLoading: articleLoading, error: articleError, refetch: refetchArticle } = useNewsArticle(slug)
  const { data: relatedArticles = [], isLoading: relatedLoading } = useRelatedNews(article?.id || "", 3)


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

  useEffect(() => {
    if (article) {
      setLikes(article.initialLikes)
      setRating(article.avgRating)
    }
  }, [article])

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const handleRating = (newRating: number) => {
    setUserRating(newRating)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePrint = () => {
    window.print()
  }

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false)
      }
    }

    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showShareMenu])

  const handleShare = async (platform: string) => {
    if (!article) return
    
    // Use guest URL path instead of student path
    const guestUrl = `${window.location.origin}/guess/news/${article.slug}`
    const title = article.title

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(guestUrl)}`, "_blank")
        toast({
          title: "Opening Facebook",
          description: "Share this article on Facebook",
        })
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(guestUrl)}&text=${encodeURIComponent(title)}`,
          "_blank",
        )
        toast({
          title: "Opening Twitter",
          description: "Share this article on Twitter",
        })
        break
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(guestUrl)}`
        toast({
          title: "Opening Email",
          description: "Share this article via email",
        })
        break
      case "copy":
        try {
          await navigator.clipboard.writeText(guestUrl)
          toast({
            title: "Link Copied!",
            description: "Article link has been copied to your clipboard",
          })
        } catch (err) {
          toast({
            title: "Failed to Copy",
            description: "Please try again or copy the link manually",
            variant: "destructive",
          })
        }
        break
    }
    setShowShareMenu(false)
  }

  // Loading state
  if (articleLoading) {
    return (
      <StudentLayout>
        <NewsArticleSkeleton />
      </StudentLayout>
    )
  }

  // Error state
  if (articleError) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Article not found</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                The news article you're looking for doesn't exist or has been removed.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={() => refetchArticle()} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/student/news">Back to News</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Article not found
  if (!article) {
    return (
      <StudentLayout>
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
                <Link href="/student/news">Back to News</Link>
              </Button>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/student/news" className="flex items-center gap-1 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="capitalize">{getCategoryName(article.category)}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium truncate">Article</span>
          </div>

          {/* Article Header */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-500 text-white capitalize">{getCategoryName(article.category)}</Badge>
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
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {article.title}
              </h1>

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

              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({article.totalRatings} ratings)</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg group">
              <Image
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content - Takes 2/3 on desktop */}
            <div className="lg:col-span-2 space-y-6 min-w-0">
              <Card className="overflow-hidden shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-6 sm:p-8">
                  <div
                    ref={contentRef}
                    className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg break-words"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </CardContent>
              </Card>

              {/* Tags */}
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

              {/* Engagement Actions */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <Button
                        variant={isLiked ? "default" : "outline"}
                        size="sm"
                        onClick={handleLike}
                        className="gap-2 hover:scale-105 transition-all duration-300"
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                        {likes}
                      </Button>

                      <Button
                        variant={isBookmarked ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className="gap-2 hover:scale-105 transition-all duration-300"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                        {isBookmarked ? "Saved" : "Save"}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        className="gap-2 hover:scale-105 transition-all duration-300 bg-transparent"
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare("copy")}
                        className="gap-2 hover:scale-105 transition-all duration-300"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </Button>
                      <div className="relative" ref={shareMenuRef}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowShareMenu(!showShareMenu)}
                          className="gap-2 hover:scale-105 transition-all duration-300"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </Button>

                        {showShareMenu && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-background border rounded-lg shadow-lg z-10 p-2 animate-in slide-in-from-top-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2 hover:bg-blue-50 dark:hover:bg-blue-950"
                              onClick={() => handleShare("facebook")}
                            >
                              <Facebook className="w-4 h-4 text-blue-600" />
                              Facebook
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2 hover:bg-blue-50 dark:hover:bg-blue-950"
                              onClick={() => handleShare("twitter")}
                            >
                              <Twitter className="w-4 h-4 text-blue-400" />
                              Twitter
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2 hover:bg-gray-50 dark:hover:bg-gray-900"
                              onClick={() => handleShare("email")}
                            >
                              <Mail className="w-4 h-4" />
                              Email
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2 hover:bg-gray-50 dark:hover:bg-gray-900"
                              onClick={() => handleShare("copy")}
                            >
                              <Copy className="w-4 h-4" />
                              Copy Link
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Rate this Article
                  </h3>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          className="hover:scale-110 transition-transform duration-200"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= userRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground hover:text-yellow-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {userRating > 0 && (
                      <span className="text-sm text-muted-foreground">
                        You rated this {userRating} star{userRating !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>

            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start min-w-0">
              {/* About the Author */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">About the Author</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      <div className="text-2xl font-bold">{likes}</div>
                      <div className="text-white/80">Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{article.shares}</div>
                      <div className="text-white/80">Shares</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Related Articles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex gap-3 p-3 rounded-lg">
                          <div className="w-20 h-20 bg-muted rounded-lg animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : relatedArticles.length > 0 ? (
                    relatedArticles.map((relatedArticle) => (
                      <RelatedArticleCard key={relatedArticle.id} article={relatedArticle} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No related articles found.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Newsletter Signup */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-blue-600 text-white">
                <CardContent className="p-6 text-center">
                  <Zap className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-bold mb-2">Stay Updated</h3>
                  <p className="text-sm text-white/90 mb-4">Get the latest school news delivered to your inbox</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full hover:scale-105 transition-transform duration-300"
                  >
                    Subscribe Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
