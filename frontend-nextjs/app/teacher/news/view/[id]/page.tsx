"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Edit, Eye, Calendar, Tag, Share2, Bookmark, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock article data - TODO: Replace with actual database integration
const mockArticleData: Record<string, any> = {
  "1": {
    id: "1",
    title: "Science Fair Winners Announced",
    slug: "science-fair-winners-announced",
    excerpt: "Congratulations to all participants in this year's science fair competition...",
    content: `
      <h2>Science Fair Results</h2>
      <p>We are proud to announce the winners of our annual science fair competition. This year saw exceptional participation from students across all grade levels, with innovative projects that showcased creativity, scientific rigor, and practical applications.</p>
      
      <h3>First Place Winners:</h3>
      <ul>
        <li><strong>Grade 7:</strong> Maria Santos - "Solar Energy Efficiency in Urban Settings"</li>
        <li><strong>Grade 8:</strong> John Doe - "Innovative Water Purification Methods Using Natural Materials"</li>
        <li><strong>Grade 9:</strong> Jane Smith - "Plant Growth Under Different Light Conditions and Wavelengths"</li>
      </ul>
      
      <h3>Second Place Winners:</h3>
      <ul>
        <li><strong>Grade 7:</strong> Pedro Cruz - "Biodegradable Plastic Alternatives"</li>
        <li><strong>Grade 8:</strong> Lisa Wong - "Air Quality Monitoring System"</li>
        <li><strong>Grade 9:</strong> Mark Johnson - "Renewable Energy Storage Solutions"</li>
      </ul>
      
      <p>All winners will receive certificates and prizes at the upcoming awards ceremony. Special thanks to our judges, sponsors, and all the students who participated in making this year's science fair a tremendous success.</p>
      
      <blockquote>
        <p>"The level of innovation and scientific thinking displayed by our students this year was truly remarkable. These young minds are the future of scientific discovery." - Dr. Maria Santos, Science Department Head</p>
      </blockquote>
      
      <p>We encourage all students to continue exploring their scientific interests and look forward to next year's competition!</p>
    `,
    author: "Dr. Maria Santos",
    authorInitials: "MS",
    category: "Academic",
    tags: ["science", "competition", "awards", "students"],
    status: "Published",
    publishedDate: "2024-01-15",
    views: 1250,
    readingTime: 5,
    visibility: "Public",
    featured: true,
  },
  "2": {
    id: "2",
    title: "Basketball Team Advances to Finals",
    slug: "basketball-team-advances-to-finals",
    excerpt: "Our varsity basketball team secured their spot in the regional finals...",
    content: `
      <h2>Historic Victory</h2>
      <p>In an exciting match that kept spectators on the edge of their seats, our varsity basketball team secured their spot in the regional finals with a decisive 78-65 victory over their rivals.</p>
      
      <h3>Game Highlights:</h3>
      <ul>
        <li>Outstanding performance by team captain Miguel Rodriguez with 28 points</li>
        <li>Solid defense throughout all four quarters</li>
        <li>Excellent teamwork and strategic plays</li>
        <li>Strong support from our school community</li>
      </ul>
      
      <p>The team will face the regional champions in the finals next month. Let's show our support and cheer them on to victory!</p>
    `,
    author: "Coach Rodriguez",
    authorInitials: "CR",
    category: "Sports",
    tags: ["basketball", "sports", "finals", "achievement"],
    status: "Published",
    publishedDate: "2024-01-14",
    views: 890,
    readingTime: 3,
    visibility: "Public",
    featured: false,
  },
}

export default function ViewArticlePage() {
  const router = useRouter()
  const params = useParams()
  const [article, setArticle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual database fetch
    const articleId = params.id as string
    if (mockArticleData[articleId]) {
      setArticle(mockArticleData[articleId])
    }
    setIsLoading(false)
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
            <p className="text-gray-600 mb-4">The article you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/teacher/news")}>Back to News</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Academic: "bg-purple-500/10 text-purple-700 border-purple-500/20",
      Sports: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      Announcements: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      Events: "bg-green-500/10 text-green-700 border-green-500/20",
      "Student Life": "bg-pink-500/10 text-pink-700 border-pink-500/20",
    }
    return colors[category] || "bg-gray-500/10 text-gray-700 border-gray-500/20"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-white/80">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/teacher/news/edit/${article.id}`)}
              className="hover:bg-white/80"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="hover:bg-white/80 bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Article Content */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Article Header */}
            <div className="p-6 sm:p-8 lg:p-12">
              {/* Category Badge */}
              <div className="mb-4">
                <Badge className={getCategoryColor(article.category)}>{article.category}</Badge>
              </div>

              {/* Title - with proper overflow handling */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 break-words leading-tight">
                {article.title}
              </h1>

              {/* Excerpt - with proper overflow handling */}
              {article.excerpt && (
                <p className="text-lg sm:text-xl text-gray-600 mb-6 break-words leading-relaxed">{article.excerpt}</p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                      {article.authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium truncate">{article.author}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {new Date(article.publishedDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{article.readingTime} min read</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Eye className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{article.views.toLocaleString()} views</span>
                </div>
              </div>

              <Separator className="mb-8" />

              {/* Article Content - Using exact same rendering method as superadmin preview */}
              <div
                className="prose prose-lg dark:prose-invert max-w-none break-words"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags - with proper overflow handling */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex items-start gap-3 min-w-0">
                    <Tag className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-wrap gap-2 min-w-0">
                      {article.tags.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer break-words"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 px-6 sm:px-8 lg:px-12 py-6 border-t">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="hover:bg-white bg-transparent">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" className="hover:bg-white bg-transparent">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => router.push(`/teacher/news/edit/${article.id}`)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Article
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Articles Section (Optional) */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">More Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(mockArticleData)
              .filter((a: any) => a.id !== article.id)
              .slice(0, 2)
              .map((relatedArticle: any) => (
                <Card
                  key={relatedArticle.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer bg-white/80 backdrop-blur-sm"
                  onClick={() => router.push(`/teacher/news/view/${relatedArticle.id}`)}
                >
                  <CardContent className="p-6">
                    <Badge className={getCategoryColor(relatedArticle.category)} variant="secondary">
                      {relatedArticle.category}
                    </Badge>
                    <h3 className="text-lg font-semibold mt-3 mb-2 break-words line-clamp-2">{relatedArticle.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 break-words line-clamp-2">{relatedArticle.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(relatedArticle.publishedDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {relatedArticle.views}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
