"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  FileText,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Heart,
  MessageCircle,
  Search,
  Filter,
  Calendar,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useToast } from "@/hooks/use-toast"
import StudentLayout from "@/components/student/student-layout"
import { newsApi } from "@/lib/api/endpoints/news"
import { NewsArticle } from "@/types/news"

interface Article {
  id: string
  title: string
  excerpt: string
  category: string
  status: "draft" | "pending_approval" | "approved" | "published" | "rejected"
  reviewStatus?: "pending" | "in_review" | "approved" | "rejected" | "needs_revision"
  views: number
  likes: number
  comments: number
  createdAt: string
  publishedAt?: string
  thumbnail?: string
}

// Helper function to transform NewsArticle to Article
const transformNewsArticle = (newsArticle: NewsArticle): Article => {
  // Normalize status to lowercase for consistent filtering
  const normalizeStatus = (status: string | undefined): Article["status"] => {
    if (!status) return 'draft'
    const statusMap: Record<string, Article["status"]> = {
      'draft': 'draft',
      'pending_approval': 'pending_approval',
      'approved': 'approved',
      'published': 'published',
      'rejected': 'rejected',
      // Handle case variations
      'Draft': 'draft',
      'Pending_Approval': 'pending_approval',
      'Approved': 'approved',
      'Published': 'published',
      'Rejected': 'rejected',
    }
    return statusMap[status] || 'draft'
  }

  const categoryName = typeof newsArticle.category === 'string'
    ? newsArticle.category
    : newsArticle.category?.name || "Uncategorized"

  return {
    id: newsArticle.id,
    title: newsArticle.title,
    excerpt: newsArticle.excerpt || "",
    category: categoryName,
    status: normalizeStatus(newsArticle.status),
    reviewStatus: newsArticle.reviewStatus as Article["reviewStatus"],
    views: newsArticle.views || 0,
    likes: newsArticle.likes || 0,
    comments: newsArticle.comments || 0,
    createdAt: newsArticle.date,
    publishedAt: newsArticle.publishedDate,
    thumbnail: newsArticle.image,
  }
}

export default function PublisherDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch articles on component mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true)
        const newsArticles = await newsApi.getMyArticles()
        const transformedArticles = newsArticles.map(transformNewsArticle)
        setArticles(transformedArticles)
      } catch (error: any) {
        console.error('Failed to fetch articles:', error)
        toast({
          title: "Failed to load articles",
          description: error?.message || "Unable to fetch your articles. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [toast])

  const stats = {
    totalArticles: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    pending: articles.filter((a) => a.status === "pending_approval").length,
    drafts: articles.filter((a) => a.status === "draft").length,
    totalViews: articles.reduce((sum, a) => sum + a.views, 0),
    totalLikes: articles.reduce((sum, a) => sum + a.likes, 0),
  }

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || article.status === statusFilter
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleDelete = (id: string) => {
    setArticleToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!articleToDelete) return

    try {
      setIsDeleting(true)
      await newsApi.deleteNews(articleToDelete)
      setArticles(articles.filter((a) => a.id !== articleToDelete))
      toast({
        title: "Article Deleted",
        description: "Your article has been successfully deleted.",
      })
    } catch (error: any) {
      console.error('Failed to delete article:', error)
      toast({
        title: "Failed to delete article",
        description: error?.message || "Unable to delete the article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setArticleToDelete(null)
    }
  }

  const getStatusBadge = (status: Article["status"]) => {
    const variants = {
      draft: { color: "bg-gray-500", label: "Draft", icon: FileText },
      pending_approval: { color: "bg-yellow-500", label: "Pending Review", icon: Clock },
      approved: { color: "bg-blue-500", label: "Approved", icon: CheckCircle },
      published: { color: "bg-green-500", label: "Published", icon: CheckCircle },
      rejected: { color: "bg-red-500", label: "Rejected", icon: XCircle },
    }
    const variant = variants[status] || variants.draft
    const Icon = variant.icon
    return (
      <Badge className={`${variant.color} text-white border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {variant.label}
      </Badge>
    )
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Publisher Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your articles and track performance</p>
            </div>
            <Button
              onClick={() => router.push("/student/publisher/create")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Write New Article
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Articles</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalArticles}</p>
                  </div>
                  <FileText className="w-10 h-10 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Published</p>
                    <p className="text-3xl font-bold mt-1">{stats.published}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Views</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalViews}</p>
                  </div>
                  <Eye className="w-10 h-10 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Total Likes</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalLikes}</p>
                  </div>
                  <Heart className="w-10 h-10 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] dark:bg-slate-800 dark:border-slate-700">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Academic News">Academic News</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Announcements">Announcements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Articles List */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                My Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Loading your articles...</h3>
                  <p className="text-slate-500 dark:text-slate-400">Please wait while we fetch your articles</p>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No articles found</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 text-center">
                    {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Start writing your first article"}
                  </p>
                  {!searchQuery && statusFilter === "all" && categoryFilter === "all" && (
                    <Button
                      onClick={() => router.push("/student/publisher/create")}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Write New Article
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                              {article.title}
                            </h3>
                            {getStatusBadge(article.status)}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{article.excerpt}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <Badge variant="outline" className="text-xs">
                              {article.category}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(article.createdAt).toLocaleDateString()}
                            </span>
                            {article.status === "published" && (
                              <>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {article.views} views
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {article.likes} likes
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" />
                                  {article.comments} comments
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex sm:flex-col gap-2">
                          {/* Only show edit button for draft/pending articles */}
                          {(article.status === 'draft' || article.status === 'pending_approval') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/student/publisher/edit/${article.id}`)}
                              className="flex-1 sm:flex-none"
                            >
                              <Edit className="w-4 h-4 sm:mr-2" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/student/publisher/preview/${article.id}`)}
                            className="flex-1 sm:flex-none"
                          >
                            <Eye className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          {/* Only show delete button for draft articles */}
                          {article.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(article.id)}
                              disabled={isDeleting}
                              className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                            >
                              {isDeleting && articleToDelete === article.id ? (
                                <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 sm:mr-2" />
                              )}
                              <span className="hidden sm:inline">
                                {isDeleting && articleToDelete === article.id ? "Deleting..." : "Delete"}
                              </span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StudentLayout>
  )
}
