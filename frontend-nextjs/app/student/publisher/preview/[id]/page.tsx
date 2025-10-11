"use client"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileText,
  User,
  Calendar,
  Clock,
  XCircle,
} from "lucide-react"
import StudentLayout from "@/components/student/student-layout"

export default function StudentArticlePreview() {
  const router = useRouter()
  const params = useParams()

  // Mock article data - TODO: Replace with actual database fetch
  const article = {
    id: params.id,
    title: "School Science Fair Winners Announced",
    excerpt: "Students showcase innovative projects in annual science competition",
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
    category: "Academic News",
    tags: ["Science Fair", "Student Achievement", "STEM Education"],
    author: {
      name: "Student Name",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    coAuthors: [{ name: "Co-Author Name" }],
    credits: "Photos by Photography Club",
    status: "pending" as const,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-16",
    wordCount: 342,
    readingTime: 2,
    reviewComments: [
      {
        id: 1,
        teacher: "Ms. Rodriguez",
        comment: "Great article! Please add more details about the winning projects.",
        timestamp: "2024-01-16T10:00:00",
        type: "feedback" as const,
      },
    ],
  }

  // Calculate completion percentage
  const completionChecks = {
    hasTitle: !!article.title,
    hasExcerpt: !!article.excerpt,
    hasContent: article.wordCount > 100,
    hasFeaturedImage: !!article.featuredImage,
    hasCategory: !!article.category,
    hasTags: article.tags.length > 0,
  }

  const completionPercentage =
    (Object.values(completionChecks).filter(Boolean).length / Object.keys(completionChecks).length) * 100

  const getStatusInfo = (status: string) => {
    const statusMap = {
      draft: {
        color: "bg-gray-500",
        label: "Draft",
        icon: FileText,
        description: "This article is saved as a draft and not yet submitted for review.",
      },
      pending: {
        color: "bg-yellow-500",
        label: "Pending Review",
        icon: Clock,
        description: "Your article is being reviewed by teachers. You'll be notified once it's approved.",
      },
      published: {
        color: "bg-green-500",
        label: "Published",
        icon: CheckCircle2,
        description: "Your article has been published and is now visible to everyone!",
      },
      rejected: {
        color: "bg-red-500",
        label: "Needs Revision",
        icon: XCircle,
        description: "Please review the feedback below and make the necessary changes.",
      },
    }
    return statusMap[status as keyof typeof statusMap] || statusMap.draft
  }

  const statusInfo = getStatusInfo(article.status)
  const StatusIcon = statusInfo.icon

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push("/student/publisher")}
              className="hover:bg-white/80 dark:hover:bg-slate-800/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Publisher
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/student/publisher/edit/${article.id}`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Article
            </Button>
          </div>

          {/* Preview Notice Banner */}
          <Card className={`border-0 shadow-lg ${statusInfo.color} text-white`}>
            <CardContent className="flex items-center gap-3 py-4">
              <StatusIcon className="h-6 w-6 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-lg">{statusInfo.label}</p>
                <p className="text-sm opacity-90">{statusInfo.description}</p>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Badge>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Article Preview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Article Display */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
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
                            <p className="text-xs">Author</p>
                          </div>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
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
                                <span>{coAuthor.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Credits */}
                      {article.credits && (
                        <div className="mt-4 pt-4 border-t not-prose">
                          <p className="text-sm text-muted-foreground">{article.credits}</p>
                        </div>
                      )}
                    </div>
                  </article>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Article Info */}
            <div className="space-y-6">
              {/* Completion Status */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
                </CardContent>
              </Card>

              {/* Teacher Feedback */}
              {article.reviewComments.length > 0 && (
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      Teacher Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {article.reviewComments.map((review) => (
                      <div
                        key={review.id}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2 bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{review.teacher}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(review.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Publishing Info */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Article Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Created</p>
                    <p className="font-medium">{new Date(article.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Last Modified</p>
                    <p className="font-medium">{new Date(article.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Status</p>
                    <Badge className={`${statusInfo.color} text-white border-0`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Help Card */}
              <Card className="shadow-lg border-0 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Need Help?</p>
                      <p className="text-blue-700 dark:text-blue-300">
                        If you have questions about the feedback or need assistance, contact your teacher or the school
                        publication adviser.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
