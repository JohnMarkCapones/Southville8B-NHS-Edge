"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Save,
  Eye,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import StudentLayout from "@/components/student/student-layout"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import { newsApi, UpdateNewsDto, ReviewComment } from "@/lib/api/endpoints/news"
import { NewsArticle } from "@/types/news"

interface ArticleFormData {
  title: string
  content: string
  contentJson: any
}

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const articleId = params.id as string

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    content: "",
    contentJson: null,
  })

  const [reviewComments, setReviewComments] = useState<ReviewComment[]>([])
  const [articleStatus, setArticleStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch article data and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch article and review comments in parallel
        const [article, comments] = await Promise.all([
          newsApi.getNewsById(articleId),
          newsApi.getReviewComments(articleId).catch(() => []), // Don't fail if no comments
        ])

        if (!article) {
          setError("Article not found")
          return
        }

        setReviewComments(comments)
        setArticleStatus(article.status)

        // Populate form with article data
        setFormData({
          title: article.title || "",
          content: article.content || "",
          contentJson: article.articleJson || null,
        })
      } catch (error: any) {
        console.error('Failed to fetch article data:', error)
        setError(error?.message || "Failed to load article")
        toast({
          title: "Failed to load article",
          description: error?.message || "Unable to load the article for editing.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (articleId) {
      fetchData()
    }
  }, [articleId, toast])

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in title and content before saving.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      
      const updateData: UpdateNewsDto = {
        title: formData.title,
        articleHtml: formData.content,
        articleJson: formData.contentJson || undefined,
      }

      await newsApi.updateNews(articleId, updateData)
      
      toast({
        title: "Article Updated",
        description: "Your article has been successfully updated.",
      })
      
      // Navigate back to publisher dashboard
      router.push("/student/publisher")
    } catch (error: any) {
      console.error('Failed to update article:', error)
      toast({
        title: "Failed to update article",
        description: error?.message || "Unable to update the article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }


  if (isLoading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Loading article...</h3>
              <p className="text-slate-500 dark:text-slate-400">Please wait while we fetch the article for editing</p>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Error Loading Article</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
              <Button onClick={() => router.push("/student/publisher")} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Publisher
              </Button>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/student/publisher")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Edit Article
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Update your article content and settings</p>
                {articleStatus && (articleStatus === 'published' || articleStatus === 'archived') && (
                  <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Note:</strong> This article is {articleStatus}. You may not be able to edit it depending on your permissions.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/student/publisher/preview/${articleId}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !formData.title || !formData.content}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Article Title */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-red-500">*</span>
                    Article Title
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter your article title..."
                    className="text-lg font-medium"
                  />
                </CardContent>
              </Card>

              {/* Article Content */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-red-500">*</span>
                    Article Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TiptapEditor
                    content={formData.content}
                    onChange={(html, json) => setFormData((prev) => ({ ...prev, content: html, contentJson: json }))}
                    placeholder="Write your article content here..."
                    className="min-h-[400px]"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Review Status */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Review Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviewComments.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
                        <AlertCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        No review comments yet
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Your article is pending review
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {reviewComments.length} comment{reviewComments.length !== 1 ? 's' : ''} from reviewer{reviewComments.length !== 1 ? 's' : ''}
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {reviewComments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                  {comment.author.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {comment.author}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(comment.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                              {comment.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}