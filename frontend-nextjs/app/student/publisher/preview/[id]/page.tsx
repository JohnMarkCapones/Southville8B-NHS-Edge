"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Edit,
  Calendar,
  Heart,
  Share2,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import StudentLayout from "@/components/student/student-layout"
import { newsApi, ApprovalHistoryRecord } from "@/lib/api/endpoints/news"
import { NewsArticle } from "@/types/news"

export default function PreviewArticlePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const articleId = params.id as string

  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const articleData = await newsApi.getNewsById(articleId)

        if (!articleData) {
          setError("Article not found")
          return
        }

        setArticle(articleData)

        // Fetch approval history if article is not draft
        if (articleData.status !== 'draft') {
          try {
            setIsLoadingHistory(true)
            const history = await newsApi.getApprovalHistory(articleId)
            setApprovalHistory(history)
          } catch (historyError) {
            console.error('Failed to fetch approval history:', historyError)
            // Don't show error toast for approval history failure
          } finally {
            setIsLoadingHistory(false)
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch article:', error)
        setError(error?.message || "Failed to load article")
        toast({
          title: "Failed to load article",
          description: error?.message || "Unable to load the article for preview.",
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

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { color: "bg-gray-500", label: "Draft" },
      pending_approval: { color: "bg-yellow-500", label: "Pending Review" },
      approved: { color: "bg-blue-500", label: "Approved" },
      published: { color: "bg-green-500", label: "Published" },
      rejected: { color: "bg-red-500", label: "Rejected" },
    }
    const variant = variants[status as keyof typeof variants] || variants.draft
    return (
      <Badge className={`${variant.color} text-white border-0`}>
        {variant.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Loading article...</h3>
              <p className="text-slate-500 dark:text-slate-400">Please wait while we fetch the article</p>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  if (error || !article) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Error Loading Article</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">{error || "Article not found"}</p>
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
                  Article Preview
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Preview your article before publishing</p>
              </div>
            </div>
            <Button
              onClick={() => router.push(`/student/publisher/edit/${articleId}`)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Article
            </Button>
          </div>

          {/* Article Preview */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-0">
              {/* Featured Image */}
              {article.featuredImageUrl && (
                <div className="w-full h-64 md:h-80 overflow-hidden rounded-t-lg">
                  <img
                    src={article.featuredImageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8 pb-24">
                {/* Article Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(article.status)}
                      {article.category && (
                        <Badge variant="outline" className="text-sm">
                          {article.category.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                      {article.views > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {article.views} views
                        </span>
                      )}
                    </div>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
                    {article.title}
                  </h1>

                  {article.description && (
                    <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                      {article.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {article.author?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {article.author || 'Anonymous'}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Author</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4 mr-2" />
                        {article.likes || 0}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </div>

                {/* Credits */}
                {article.credits && (
                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      <strong>Credits:</strong> {article.credits}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Approval History Section */}
          {article.status !== 'draft' && approvalHistory.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Review History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {isLoadingHistory ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 mx-auto animate-spin text-blue-600 mb-2" />
                      <p className="text-sm text-slate-500">Loading review history...</p>
                    </div>
                  ) : (
                    approvalHistory.map((record) => (
                      <div
                        key={record.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          record.status === 'approved'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                            : record.status === 'rejected'
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {record.status === 'approved' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : record.status === 'rejected' ? (
                              <XCircle className="w-5 h-5 text-red-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-yellow-600" />
                            )}
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {record.status === 'approved'
                                ? 'Approved'
                                : record.status === 'rejected'
                                ? 'Rejected'
                                : 'Changes Requested'}
                            </span>
                          </div>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(record.action_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="mb-2">
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            Reviewed by:{' '}
                            <span className="font-medium">
                              {record.approver?.full_name || record.approver?.email || 'Unknown'}
                            </span>
                          </p>
                        </div>

                        {record.remarks && (
                          <div className="mt-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Feedback:
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                              {record.remarks}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Helpful message for rejected articles */}
                {approvalHistory.some((r) => r.status === 'rejected') && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Next Steps:</strong> Please review the feedback above and make the necessary
                      changes to your article. Once updated, you can submit it again for review.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </StudentLayout>
  )
}