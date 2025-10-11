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
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  Eye,
  Heart,
  MessageCircle,
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
  ThumbsUp,
  Send,
  Users,
  BarChart3,
  Zap,
  ArrowUp,
  Printer,
} from "lucide-react"

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
            {article.category}
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

const CommentItem = memo(({ comment }: { comment: any }) => (
  <div className="flex gap-3 p-4 rounded-lg hover:bg-muted/30 transition-colors">
    <Avatar className="w-8 h-8 flex-shrink-0">
      <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.author} />
      <AvatarFallback>
        {comment.author
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">{comment.author}</span>
        <span className="text-xs text-muted-foreground">{new Date(comment.date).toLocaleDateString()}</span>
      </div>
      <p className="text-sm text-muted-foreground break-words">{comment.content}</p>
      <div className="flex items-center gap-4 text-xs">
        <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <ThumbsUp className="w-3 h-3" />
          {comment.likes}
        </button>
        <button className="text-muted-foreground hover:text-primary transition-colors">Reply</button>
        {comment.replies > 0 && (
          <span className="text-muted-foreground">
            {comment.replies} repl{comment.replies === 1 ? "y" : "ies"}
          </span>
        )}
      </div>
    </div>
  </div>
))
CommentItem.displayName = "CommentItem"

export default function NewsArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [newComment, setNewComment] = useState("")
  const [rating, setRating] = useState(0)
  const [userRating, setUserRating] = useState(0)
  const [showComments, setShowComments] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const comments = useMemo(
    () => [
      {
        id: 1,
        author: "Sarah Johnson",
        avatar: "/placeholder.svg?height=32&width=32&text=SJ",
        content: "Congratulations to all the winners! This is such an inspiring achievement for our school.",
        date: "2024-03-11",
        likes: 5,
        replies: 2,
      },
      {
        id: 2,
        author: "Mark Chen",
        avatar: "/placeholder.svg?height=32&width=32&text=MC",
        content:
          "The solar-powered water purification system sounds amazing! Can't wait to see it at the regional competition.",
        date: "2024-03-11",
        likes: 3,
        replies: 0,
      },
      {
        id: 3,
        author: "Lisa Rodriguez",
        avatar: "/placeholder.svg?height=32&width=32&text=LR",
        content: "So proud of our students! This shows the quality of education at Southville 8B NHS.",
        date: "2024-03-10",
        likes: 8,
        replies: 1,
      },
    ],
    [],
  )

  const article = useMemo(
    () => ({
      id: 1,
      title: "Southville 8B NHS Wins Municipal Science Fair",
      slug: "southville-8b-nhs-wins-municipal-science-fair",
      content: `
      <div class="prose prose-lg max-w-none">
        <p class="lead">In a remarkable display of scientific excellence, Southville 8B NHS students dominated the municipal science fair, bringing home multiple awards and recognition for their innovative projects.</p>
        
        <h2>Outstanding Achievements</h2>
        <p>Our students showcased exceptional scientific innovation and creativity across various categories. The competition, held at the Municipal Convention Center, featured over 200 projects from 15 schools across the district.</p>
        
        <h3>Award Winners</h3>
        <ul>
          <li><strong>First Place - Physics Category:</strong> Maria Santos with "Solar-Powered Water Purification System"</li>
          <li><strong>Second Place - Biology Category:</strong> John Dela Cruz with "Plant Growth Enhancement Using Natural Fertilizers"</li>
          <li><strong>Third Place - Chemistry Category:</strong> Ana Rodriguez with "Biodegradable Plastic from Banana Peels"</li>
          <li><strong>Best Innovation Award:</strong> Team Project by Grade 10 students on "Smart Waste Management System"</li>
        </ul>
        
        <h2>Impact on Our School Community</h2>
        <p>This achievement reflects the dedication of our students and the quality of science education at Southville 8B NHS. The winning projects will now advance to the regional competition next month.</p>
        
        <blockquote>
          <p>"I'm incredibly proud of our students' achievements. Their hard work and innovative thinking truly represent the spirit of scientific inquiry we foster at our school."</p>
          <cite>- Principal Maria Santos</cite>
        </blockquote>
        
        <h2>Looking Forward</h2>
        <p>The school will continue to support these talented students as they prepare for the regional competition. Additional mentoring sessions and laboratory time have been arranged to help them refine their projects further.</p>
        
        <p>We encourage all students to consider participating in next year's science fair. It's an excellent opportunity to explore scientific concepts, develop research skills, and showcase creativity.</p>
      </div>
    `,
      author: "Principal Maria Santos",
      authorImage: "/placeholder.svg?height=40&width=40&text=MS",
      date: "2024-03-10",
      category: "achievement",
      image: "/placeholder.svg?height=400&width=800&text=Science+Fair+Victory",
      views: 245,
      initialLikes: 32,
      comments: 8,
      featured: true,
      trending: true,
      readTime: "4 min read",
      tags: ["Science", "Achievement", "Competition", "Innovation", "Students"],
      shares: 15,
      avgRating: 4.8,
      totalRatings: 24,
    }),
    [],
  )

  const relatedArticles = useMemo(
    () => [
      {
        id: 2,
        title: "New Computer Laboratory Opens",
        slug: "new-computer-laboratory-opens",
        excerpt: "State-of-the-art computer laboratory with 30 new workstations now available for student use.",
        image: "/placeholder.svg?height=200&width=300&text=Computer+Lab",
        date: "2024-03-08",
        category: "facility",
        readTime: "3 min read",
      },
      {
        id: 3,
        title: "Basketball Team Advances to Regional Finals",
        slug: "basketball-team-advances-to-regional-finals",
        excerpt: "Our varsity basketball team secured their spot in the regional championship.",
        image: "/placeholder.svg?height=200&width=300&text=Basketball+Victory",
        date: "2024-03-05",
        category: "sports",
        readTime: "5 min read",
      },
      {
        id: 4,
        title: "Math Olympiad Team Wins Regional Competition",
        slug: "math-olympiad-team-wins-regional-competition",
        excerpt: "Our mathematics team brought home first place in the regional Math Olympiad competition.",
        image: "/placeholder.svg?height=200&width=300&text=Math+Olympiad",
        date: "2024-02-20",
        category: "achievement",
        readTime: "4 min read",
      },
    ],
    [],
  )

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
    setLikes(article.initialLikes)
    setRating(article.avgRating)
  }, [article.initialLikes, article.avgRating])

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const handleRating = (newRating: number) => {
    setUserRating(newRating)
  }

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      setNewComment("")
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = (platform: string) => {
    const url = window.location.href
    const title = article.title

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          "_blank",
        )
        break
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
        break
      case "copy":
        navigator.clipboard.writeText(url)
        break
    }
    setShowShareMenu(false)
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
            <span className="capitalize">{article.category}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium truncate">Article</span>
          </div>

          {/* Article Header */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-500 text-white capitalize">{article.category}</Badge>
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
                    <AvatarImage src={article.authorImage || "/placeholder.svg"} alt={article.author} />
                    <AvatarFallback>
                      {article.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">{article.author}</div>
                    <div className="text-sm">Author</div>
                  </div>
                </div>

                <Separator orientation="vertical" className="hidden sm:block h-12" />

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
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
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{article.comments} comments</span>
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
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent hover:scale-105 transition-all duration-300"
                        onClick={() => setShowComments(!showComments)}
                      >
                        <MessageCircle className="w-4 h-4" />
                        {article.comments}
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
                      <div className="relative">
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

              {showComments && (
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Comments ({comments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Share your thoughts about this article..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[100px] resize-none"
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleCommentSubmit} disabled={!newComment.trim()} className="gap-2">
                          <Send className="w-4 h-4" />
                          Post Comment
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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
                      <AvatarImage src={article.authorImage || "/placeholder.svg"} alt={article.author} />
                      <AvatarFallback>
                        {article.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{article.author}</div>
                      <div className="text-sm text-muted-foreground">School Principal</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Leading Southville 8B NHS with dedication to academic excellence and student development.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      15 articles
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      1.2k followers
                    </span>
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
                    <div className="text-center">
                      <div className="text-2xl font-bold">{comments.length}</div>
                      <div className="text-white/80">Comments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Related Articles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedArticles.map((relatedArticle) => (
                    <RelatedArticleCard key={relatedArticle.id} article={relatedArticle} />
                  ))}
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
