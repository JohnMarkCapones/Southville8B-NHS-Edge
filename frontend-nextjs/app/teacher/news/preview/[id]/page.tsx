"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { newsApi } from "@/lib/api/endpoints/news"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Edit,
  Send,
  Calendar,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Share2,
  FileText,
  User,
  Facebook,
  Twitter,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Utility functions
const calculateWordCount = (html: string): number => {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.split(' ').filter(word => word.length > 0).length
}

const calculateReadingTime = (wordCount: number): number => {
  const wordsPerMinute = 200
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

export default function NewsPreviewPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [comment, setComment] = useState("")
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showPublishWarningDialog, setShowPublishWarningDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showRevisionDialog, setShowRevisionDialog] = useState(false)
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [rejectReason, setRejectReason] = useState("")

  // Fetch review comments from API
  const { data: reviewComments = [], isLoading: isLoadingComments, refetch: refetchComments } = useQuery({
    queryKey: ['news', 'review-comments', params.id],
    queryFn: () => newsApi.getReviewComments(params.id as string),
    enabled: !!params.id,
  })

  // Fetch article data from API
  const { data: articleData, isLoading, error } = useQuery({
    queryKey: ['news', 'preview', params.id],
    queryFn: () => newsApi.getNewsById(params.id as string),
    enabled: !!params.id,
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    )
  }

  // Error or not found state
  if (error || !articleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Article Not Found</h2>
            <p className="text-muted-foreground mb-4">The article you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push('/teacher/news')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate word count and reading time from article content
  const wordCount = calculateWordCount(articleData.content || '')
  const readingTime = calculateReadingTime(wordCount)

  // Map API data to article format
  const article = {
    id: articleData.id,
    title: articleData.title,
    slug: articleData.slug,
    excerpt: articleData.excerpt,
    content: articleData.content,
    featuredImage: articleData.image,
    category: articleData.category,
    tags: articleData.tags || [],
    author: {
      name: articleData.author,
      avatar: articleData.authorImage || articleData.authorAvatar,
      role: "Author", // API doesn't provide role
    },
    coAuthors: (articleData as any).co_authors?.map((coAuthor: any) => ({
      name: coAuthor.co_author_name,
      role: coAuthor.role || "Co-Author",
    })) || [],
    status: articleData.status,
    visibility: articleData.visibility,
    scheduledDate: (articleData as any).scheduled_date,
    createdAt: (articleData as any).created_at,
    updatedAt: (articleData as any).updated_at,
    wordCount: wordCount,
    readingTime: readingTime,
    views: articleData.views || 0,
    approvalStatus: articleData.reviewStatus || 'pending',
  }

  // Calculate completion percentage
  const completionChecks = {
    hasTitle: !!article.title,
    hasExcerpt: !!article.excerpt,
    hasContent: article.wordCount > 100,
    hasFeaturedImage: !!article.featuredImage,
    hasCategory: !!article.category,
    hasTags: article.tags.length > 0,
    hasScheduledDate: !!article.scheduledDate,
  }

  const completionPercentage =
    (Object.values(completionChecks).filter(Boolean).length / Object.keys(completionChecks).length) * 100

  const handlePublishClick = () => {
    // Check if article has pending review_status
    if (article.approvalStatus === 'pending' || article.approvalStatus === 'in_review') {
      // Show warning dialog that publishing will auto-approve
      setShowPublishWarningDialog(true)
    } else {
      // Show normal publish confirmation
      setShowPublishDialog(true)
    }
  }

  const handlePublish = async (forceApprove: boolean = false) => {
    try {
      // Call publish endpoint which sets published_date to now and changes status to published
      await newsApi.publishNews(article.id, forceApprove)

      toast({
        title: "Article Published",
        description: forceApprove
          ? "The article has been approved and published successfully."
          : "The article has been published successfully.",
      })
      router.push("/teacher/news")
    } catch (error: any) {
      console.error('Error publishing article:', error)
      const errorMessage = error?.message || "Failed to publish article. Please try again."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setShowPublishDialog(false)
      setShowPublishWarningDialog(false)
    }
  }

  const handleUnpublish = async () => {
    try {
      await newsApi.unpublishNews(article.id)
      toast({
        title: "Article Unpublished",
        description: "The article has been unpublished and moved to drafts.",
      })
      router.push("/teacher/news")
    } catch (error: any) {
      console.error('Error unpublishing article:', error)
      toast({
        title: "Error",
        description: "Failed to unpublish article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowUnpublishDialog(false)
    }
  }

  const handleApprove = async () => {
    try {
      await newsApi.approveNews(article.id)
      toast({
        title: "Article Approved",
        description: "The article has been approved and is ready to publish.",
      })
      router.push("/teacher/news")
    } catch (error: any) {
      console.error('Error approving article:', error)
      toast({
        title: "Error",
        description: "Failed to approve article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowApproveDialog(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      })
      return
    }

    try {
      await newsApi.rejectNews(article.id, rejectReason.trim())
      toast({
        title: "Article Rejected",
        description: "The article has been rejected with feedback.",
      })
      router.push("/teacher/news")
    } catch (error: any) {
      console.error('Error rejecting article:', error)
      toast({
        title: "Error",
        description: "Failed to reject article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowRejectDialog(false)
      setRejectReason("")
    }
  }

  const handleRequestRevision = async () => {
    if (!feedbackText.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide specific feedback for revision.",
        variant: "destructive",
      })
      return
    }

    try {
      // Add review comment with the revision request
      await newsApi.addReviewComment(article.id, `REVISION REQUESTED: ${feedbackText.trim()}`)

      // Optionally update the review status if you have an endpoint for that
      // await newsApi.updateReviewStatus(article.id, 'needs_revision')

      toast({
        title: "Revision Requested",
        description: "Your feedback has been sent to the author.",
      })

      // Refetch comments to show the new one
      refetchComments()
      router.push("/teacher/news")
    } catch (error: any) {
      console.error('Error requesting revision:', error)
      toast({
        title: "Error",
        description: "Failed to request revision. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowRevisionDialog(false)
      setFeedbackText("")
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      })
      return
    }

    try {
      // Call API to add review comment
      await newsApi.addReviewComment(article.id, comment.trim())

      // Refetch comments to show the new one
      refetchComments()

      toast({
        title: "Comment Added",
        description: "Your feedback has been added to the article.",
      })
      setComment("")
    } catch (error: any) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/teacher/news/edit/${article.id}`)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>

            {/* Show different actions based on article status */}
            {article.status !== "Published" && article.approvalStatus === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowApproveDialog(true)}
                  className="gap-2 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRevisionDialog(true)}
                  className="gap-2 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Request Revision
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  className="gap-2 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                >
                  <ThumbsDown className="h-4 w-4" />
                  Reject
                </Button>
              </>
            )}

            {article.status !== "Published" && (
              <Button
                onClick={handlePublishClick}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Send className="h-4 w-4" />
                Publish
              </Button>
            )}

            {article.status === "Published" && (
              <Button
                variant="outline"
                onClick={() => setShowUnpublishDialog(true)}
                className="gap-2 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
              >
                <XCircle className="h-4 w-4" />
                Unpublish
              </Button>
            )}
          </div>
        </div>

        {/* Preview Notice Banner */}
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-3 py-4">
            <Eye className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <p className="font-medium text-amber-900 dark:text-amber-100">Preview Mode</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This is how your article will appear when published. Only you can see this preview.
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
            >
              {article.status}
            </Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Article Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Article Display */}
            <Card>
              <CardContent className="p-0">
                <article className="prose prose-lg dark:prose-invert max-w-none">
                  {/* Featured Image */}
                  {article.featuredImage && (
                    <div className="relative w-full h-[400px] overflow-hidden rounded-t-lg">
                      <img
                        src={article.featuredImage || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-8">
                    {/* Category & Tags */}
                    <div className="flex flex-wrap gap-2 mb-4 not-prose">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100">
                        {article.category}
                      </Badge>
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4 break-words leading-tight">{article.title}</h1>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 not-prose">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={article.author.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{article.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{article.author.name}</p>
                          <p className="text-xs">{article.author.role}</p>
                        </div>
                      </div>
                      <Separator orientation="vertical" className="h-8" />
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Scheduled: {new Date(article.scheduledDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{article.readingTime} min read</span>
                      </div>
                    </div>

                    {/* Excerpt */}
                    {article.excerpt && (
                      <p className="text-xl text-muted-foreground mb-6 leading-relaxed">{article.excerpt}</p>
                    )}

                    <Separator className="my-6" />

                    {/* Article Content */}
                    <div
                      className="prose prose-lg dark:prose-invert max-w-none break-words"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />

                    {/* Co-Authors */}
                    {article.coAuthors.length > 0 && (
                      <div className="mt-8 pt-6 border-t not-prose">
                        <p className="text-sm font-medium mb-3">Co-Authors:</p>
                        <div className="flex flex-wrap gap-3">
                          {article.coAuthors.map((coAuthor, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {coAuthor.name} <span className="text-muted-foreground">({coAuthor.role})</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              </CardContent>
            </Card>

            {/* Social Media Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Social Media Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Facebook Preview */}
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Facebook className="h-4 w-4" />
                    <span>Facebook</span>
                  </div>
                  <div className="border rounded overflow-hidden">
                    <img
                      src={article.featuredImage || "/placeholder.svg"}
                      alt=""
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3 bg-muted/50">
                      <p className="font-medium text-sm line-clamp-1">{article.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{article.excerpt}</p>
                    </div>
                  </div>
                </div>

                {/* Twitter Preview */}
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Twitter className="h-4 w-4" />
                    <span>Twitter/X</span>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={article.featuredImage || "/placeholder.svg"}
                      alt=""
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <p className="font-medium text-sm line-clamp-2">{article.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">southville8bnhs.edu.ph</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Article Info & Actions */}
          <div className="space-y-6">
            {/* Completion Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Article Completion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{Math.round(completionPercentage)}%</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>

                <Separator />

                <div className="space-y-2">
                  {Object.entries(completionChecks).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      {value ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      )}
                      <span className={value ? "text-foreground" : "text-muted-foreground"}>
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Article Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Article Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Word Count</span>
                  <span className="font-medium">{article.wordCount} words</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reading Time</span>
                  <span className="font-medium">{article.readingTime} minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{article.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tags</span>
                  <span className="font-medium">{article.tags.length} tags</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Visibility</span>
                  <Badge variant="outline" className="capitalize">
                    {article.visibility}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Review Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Review Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Approval Status</span>
                  <Badge variant="outline" className="capitalize">
                    {article.approvalStatus.replace("_", " ")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Publishing Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Publishing Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Created</p>
                  <p className="font-medium">{new Date(article.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Last Modified</p>
                  <p className="font-medium">{new Date(article.updatedAt).toLocaleString()}</p>
                </div>
                {article.scheduledDate && (
                  <div>
                    <p className="text-muted-foreground mb-1">Scheduled For</p>
                    <p className="font-medium text-blue-600 dark:text-blue-400">
                      {new Date(article.scheduledDate).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Article?</AlertDialogTitle>
            <AlertDialogDescription>
              This will publish "{article.title}" and make it visible to{" "}
              {article.visibility === "public" ? "everyone" : article.visibility}.
              {article.scheduledDate && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400">
                  Note: This article is scheduled for {new Date(article.scheduledDate).toLocaleString()}. Publishing now
                  will override the schedule.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handlePublish(false)}>Publish Now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Warning Dialog for Pending Review */}
      <AlertDialog open={showPublishWarningDialog} onOpenChange={setShowPublishWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Publish Pending Article
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  This article has a <span className="text-amber-600 font-bold">Pending Review</span> status.
                </p>
                <p className="text-sm text-muted-foreground">
                  Publishing this article will automatically <span className="font-semibold">approve</span> it and make it immediately visible to all readers.
                </p>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to proceed?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handlePublish(true)}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Approve & Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unpublish Confirmation Dialog */}
      <AlertDialog open={showUnpublishDialog} onOpenChange={setShowUnpublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unpublish "{article.title}"? It will be moved to drafts and will no longer be visible to readers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnpublish}>Unpublish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve "{article.title}"? The article will be marked as approved and ready to publish.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="bg-green-500 hover:bg-green-600">
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Article</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{article.title}". This feedback will be sent to the author.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Explain why this article is being rejected..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={!rejectReason.trim()} className="bg-red-500 hover:bg-red-600">
              <ThumbsDown className="w-4 h-4 mr-2" />
              Reject Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Revision Dialog */}
      <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
            <DialogDescription>
              Provide specific feedback on what needs to be changed in "{article.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Be specific about what needs to be changed..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevisionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestRevision}
              disabled={!feedbackText.trim()}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Request Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
