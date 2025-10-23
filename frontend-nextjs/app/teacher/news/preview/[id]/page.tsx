"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
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

export default function NewsPreviewPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [comment, setComment] = useState("")
  const [showPublishDialog, setShowPublishDialog] = useState(false)

  const [reviewComments, setReviewComments] = useState([
    {
      id: 1,
      author: "Principal Rodriguez",
      comment: "Great article! Please add more photos from the event.",
      timestamp: "2025-01-06T10:00:00",
    },
  ])

  // Mock article data - Replace with actual database fetch
  const article = {
    id: params.id,
    title: "Southville 8B NHS Wins Regional Science Fair Competition",
    slug: "southville-8b-nhs-wins-regional-science-fair",
    excerpt:
      "Our students showcased exceptional talent and innovation at the Regional Science Fair, bringing home multiple awards and recognition.",
    content: `
      <p>In a remarkable display of scientific excellence, students from Southville 8B National High School dominated the Regional Science Fair held last weekend at the City Convention Center.</p>
      
      <h2>Outstanding Achievements</h2>
      <p>The school's science club presented five groundbreaking projects across various categories, with three projects securing top positions in their respective divisions.</p>
      
      <blockquote>
        <p>"This victory represents months of hard work, dedication, and the unwavering support of our teachers and parents," said Maria Santos, one of the winning students.</p>
      </blockquote>
      
      <h3>Award Winners</h3>
      <ul>
        <li><strong>1st Place - Physics:</strong> "Renewable Energy Solutions for Rural Communities" by Grade 10 students</li>
        <li><strong>2nd Place - Biology:</strong> "Biodegradable Plastic from Banana Peels" by Grade 9 students</li>
        <li><strong>3rd Place - Chemistry:</strong> "Water Purification Using Natural Materials" by Grade 8 students</li>
      </ul>
      
      <p>The winning teams will represent our region at the National Science Fair next month, competing against the best young scientists from across the country.</p>
    `,
    featuredImage: "/placeholder.svg?height=400&width=800",
    category: "Academic Achievement",
    tags: ["Science Fair", "Student Achievement", "STEM Education", "Competition"],
    author: {
      name: "John Dela Cruz",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Science Department Head",
    },
    coAuthors: [
      { name: "Maria Garcia", role: "Science Teacher" },
      { name: "Robert Santos", role: "Club Moderator" },
    ],
    status: "draft",
    visibility: "public",
    scheduledDate: "2025-01-15T10:00:00",
    createdAt: "2025-01-05T14:30:00",
    updatedAt: "2025-01-06T09:15:00",
    wordCount: 342,
    readingTime: 2,
    views: 0,
    approvalStatus: "pending_review",
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

  const handlePublish = () => {
    // TODO: Implement actual publish logic with database
    toast({
      title: "Article Published",
      description: "The article has been published successfully.",
    })
    router.push("/teacher/news")
  }

  const handleAddComment = () => {
    if (!comment.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      })
      return
    }

    // Create new comment object
    const newComment = {
      id: reviewComments.length + 1,
      author: "Current User", // TODO: Replace with actual logged-in user name
      comment: comment.trim(),
      timestamp: new Date().toISOString(),
    }

    // Add comment to the list
    setReviewComments([...reviewComments, newComment])

    toast({
      title: "Comment Added",
      description: "Your feedback has been added to the article.",
    })
    setComment("")
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
              Edit Article
            </Button>
            <Button
              onClick={() => setShowPublishDialog(true)}
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Send className="h-4 w-4" />
              Publish Now
            </Button>
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

                <Separator />

                {/* Review Comments */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Review Comments ({reviewComments.length})</p>
                  {reviewComments.length > 0 ? (
                    reviewComments.map((review) => (
                      <div key={review.id} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{review.author}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.timestamp).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                  )}
                </div>

                <Separator />

                {/* Add Comment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Add Feedback</label>
                  <Textarea
                    placeholder="Add your comments or feedback..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <Button onClick={handleAddComment} size="sm" className="w-full gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Add Comment
                  </Button>
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
            <AlertDialogAction onClick={handlePublish}>Publish Now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
