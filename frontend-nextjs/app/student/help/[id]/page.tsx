"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import StudentLayout from "@/components/student/student-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Bookmark,
  Share2,
  ThumbsUp,
  Eye,
  Clock,
  PlayCircle,
  ChevronRight,
  Home,
  CheckCircle2,
  Lightbulb,
  Video,
  Printer,
  Download,
} from "lucide-react"
import Link from "next/link"
import { getArticleById, getRelatedArticles, type HelpArticle } from "@/lib/help-articles-data"

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function HelpArticlePage() {
  const params = useParams()
  const router = useRouter()
  const articleId = params.id as string
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const article = getArticleById(articleId)
  const relatedArticles = article ? getRelatedArticles(articleId, 3) : []

  useEffect(() => {
    // Check bookmark status from localStorage
    const bookmarks = JSON.parse(localStorage.getItem('help-article-bookmarks') || '[]')
    setIsBookmarked(bookmarks.includes(articleId))
  }, [articleId])

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return
      
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setReadingProgress(Math.min(progress, 100))
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('help-article-bookmarks') || '[]')
    let newBookmarks
    
    if (isBookmarked) {
      newBookmarks = bookmarks.filter((id: string) => id !== articleId)
    } else {
      newBookmarks = [...bookmarks, articleId]
    }
    
    localStorage.setItem('help-article-bookmarks', JSON.stringify(newBookmarks))
    setIsBookmarked(!isBookmarked)
  }

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!article) {
    notFound()
  }

  const Icon = article.icon

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 z-50">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-150"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-emerald-100 mb-6">
              <Link href="/student" className="hover:text-white transition-colors">
                <Home className="w-4 h-4" />
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/student/help" className="hover:text-white transition-colors">
                Help Center
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">{article.title}</span>
            </div>

            {/* Article Header */}
            <div className="flex items-start gap-6">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${article.color} flex items-center justify-center flex-shrink-0 shadow-xl`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={`${difficultyColors[article.difficulty]}`}>
                    {article.difficulty}
                  </Badge>
                  <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
                    {article.type}
                  </Badge>
                  {article.featured && (
                    <Badge className="bg-amber-500 text-white">
                      Featured
                    </Badge>
                  )}
                  {article.videoAvailable && (
                    <Badge className="bg-red-500 text-white">
                      <Video className="w-3 h-3 mr-1" />
                      Video Available
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">{article.title}</h1>
                <p className="text-lg text-emerald-50 mb-6">{article.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{article.readingTime} read</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{article.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{article.likes} helpful</span>
                  </div>
                  <div className="text-emerald-200">
                    Updated {article.updated}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-white/20">
              <Button
                variant="secondary"
                onClick={() => router.back()}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                variant="secondary"
                onClick={toggleBookmark}
                className={`bg-white/20 hover:bg-white/30 text-white border-white/30 ${isBookmarked ? 'bg-white/30' : ''}`}
              >
                <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleShare}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="secondary"
                onClick={handlePrint}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsLiked(!isLiked)}
                className={`bg-white/20 hover:bg-white/30 text-white border-white/30 ${isLiked ? 'bg-white/30' : ''}`}
              >
                <ThumbsUp className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Article Content */}
            <div className="lg:col-span-2">
              <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                <CardContent className="p-8">
                  {/* Video Section */}
                  {article.videoAvailable && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                          <PlayCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            Video Tutorial Available
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Watch a step-by-step video guide for this article
                          </p>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
                        onClick={() => router.push(`/student/help/${articleId}/video`)}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Watch Video Tutorial
                      </Button>
                    </div>
                  )}

                  {/* Article Body */}
                  <div
                    ref={contentRef}
                    className="prose prose-slate dark:prose-invert max-w-none 
                      prose-headings:font-bold 
                      prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:font-extrabold prose-h2:text-slate-900 dark:prose-h2:text-slate-100 prose-h2:leading-tight
                      prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-5 prose-h3:font-bold prose-h3:text-slate-900 dark:prose-h3:text-slate-100 prose-h3:leading-tight
                      prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base prose-p:mt-4
                      prose-ul:my-6 prose-ul:pl-0 prose-ul:space-y-3
                      prose-ol:my-6 prose-ol:pl-0 prose-ol:space-y-4
                      prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-li:leading-relaxed prose-li:text-base prose-li:pl-2
                      prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-strong:font-semibold
                      prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:no-underline prose-a:font-medium hover:prose-a:underline
                      prose-code:text-slate-900 dark:prose-code:text-slate-100
                      [&>div]:mb-8 [&>div]:mt-6
                      [&>div>h2]:mb-4 [&>div>h2]:mt-6
                      [&>div>h3]:mb-4 [&>div>h3]:mt-6
                      [&>div>p]:mb-4 [&>div>p]:mt-2
                      [&>div>ul]:ml-6 [&>div>ul]:space-y-3 [&>div>ul]:mt-4
                      [&>div>ol]:ml-6 [&>div>ol]:space-y-4 [&>div>ol]:mt-4
                      [&>div>ul>li]:pl-2 [&>div>ol>li]:pl-2
                      [&>div>ol>li>ul]:ml-6 [&>div>ol>li>ul]:mt-2 [&>div>ol>li>ul]:space-y-2
                      [&>div>ol>li>ul>li]:pl-2
                      [&>h2]:border-b [&>h2]:border-slate-200 [&>h2]:dark:border-slate-700 [&>h2]:pb-3 [&>h2]:mb-6
                      [&>h3]:mt-10 [&>h3]:mb-5"
                    dangerouslySetInnerHTML={{ __html: article.fullContent }}
                  />

                  {/* Steps Section */}
                  {article.steps && article.steps.length > 0 && (
                    <div className="mt-10 p-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 shadow-sm">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        Step-by-Step Guide
                      </h3>
                      <ol className="space-y-5 ml-2">
                        {article.steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-md">
                              {index + 1}
                            </div>
                            <span className="text-slate-700 dark:text-slate-300 text-base leading-relaxed pt-1 flex-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Tips Section */}
                  {article.tips && article.tips.length > 0 && (
                    <div className="mt-10 p-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800 shadow-sm">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                          <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        Pro Tips
                      </h3>
                      <ul className="space-y-4 ml-2">
                        {article.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-4">
                            <Lightbulb className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-300 text-base leading-relaxed flex-1">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Tags:</span>
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Section */}
                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                      Was this article helpful?
                    </h3>
                    <div className="flex items-center gap-3">
                      <Button
                        variant={isLiked ? "default" : "outline"}
                        onClick={() => setIsLiked(!isLiked)}
                        className={isLiked ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                      >
                        <ThumbsUp className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                        Yes, helpful
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/student/help?search=contact support`)}
                      >
                        Not helpful
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Info */}
              <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Article Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Difficulty:</span>
                      <Badge className={difficultyColors[article.difficulty]}>
                        {article.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Reading Time:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{article.readingTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Views:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{article.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Helpful Votes:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{article.likes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Last Updated:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{article.updated}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Related Articles</h3>
                    <div className="space-y-3">
                      {relatedArticles.map((related) => {
                        const RelatedIcon = related.icon
                        return (
                          <Link
                            key={related.id}
                            href={`/student/help/${related.id}`}
                            className="block p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all group"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${related.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                <RelatedIcon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                  {related.title}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                  {related.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={`text-xs ${difficultyColors[related.difficulty]}`}>
                                    {related.difficulty}
                                  </Badge>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {related.readingTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Need Help Card */}
              <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Still need help?</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Contact our support team for personalized assistance
                  </p>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => window.location.href = 'mailto:support@southville8bnhs.edu.ph'}
                  >
                    Contact Support
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

