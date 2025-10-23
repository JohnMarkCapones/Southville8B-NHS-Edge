"use client"

import { useState } from "react"
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

interface Article {
  id: string
  title: string
  excerpt: string
  category: string
  status: "draft" | "pending" | "published" | "rejected"
  views: number
  likes: number
  comments: number
  createdAt: string
  publishedAt?: string
  thumbnail?: string
}

// Sample data - TODO: Replace with actual database
const sampleArticles: Article[] = [
  {
    id: "1",
    title: "School Science Fair Winners Announced",
    excerpt: "Students showcase innovative projects in annual science competition",
    category: "Academic News",
    status: "published",
    views: 245,
    likes: 32,
    comments: 8,
    createdAt: "2024-01-15",
    publishedAt: "2024-01-16",
  },
  {
    id: "2",
    title: "Basketball Team Advances to Finals",
    excerpt: "Southville 8B NHS basketball team secures spot in championship game",
    category: "Sports",
    status: "published",
    views: 189,
    likes: 45,
    comments: 12,
    createdAt: "2024-01-14",
    publishedAt: "2024-01-14",
  },
  {
    id: "3",
    title: "Upcoming Cultural Festival Preview",
    excerpt: "Get ready for our biggest cultural celebration of the year",
    category: "Events",
    status: "pending",
    views: 0,
    likes: 0,
    comments: 0,
    createdAt: "2024-01-18",
  },
  {
    id: "4",
    title: "Student Council Election Guide",
    excerpt: "Everything you need to know about the upcoming elections",
    category: "Announcements",
    status: "draft",
    views: 0,
    likes: 0,
    comments: 0,
    createdAt: "2024-01-17",
  },
]

export default function PublisherDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [articles, setArticles] = useState<Article[]>(sampleArticles)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null)

  const stats = {
    totalArticles: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    pending: articles.filter((a) => a.status === "pending").length,
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

  const confirmDelete = () => {
    if (articleToDelete) {
      setArticles(articles.filter((a) => a.id !== articleToDelete))
      toast({
        title: "Article Deleted",
        description: "Your article has been successfully deleted.",
      })
    }
    setDeleteDialogOpen(false)
    setArticleToDelete(null)
  }

  const getStatusBadge = (status: Article["status"]) => {
    const variants = {
      draft: { color: "bg-gray-500", label: "Draft", icon: FileText },
      pending: { color: "bg-yellow-500", label: "Pending Review", icon: Clock },
      published: { color: "bg-green-500", label: "Published", icon: CheckCircle },
      rejected: { color: "bg-red-500", label: "Rejected", icon: XCircle },
    }
    const variant = variants[status]
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
                    <SelectItem value="pending">Pending</SelectItem>
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
              {filteredArticles.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No articles found</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/student/publisher/edit/${article.id}`)}
                            className="flex-1 sm:flex-none"
                          >
                            <Edit className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/student/publisher/preview/${article.id}`)}
                            className="flex-1 sm:flex-none"
                          >
                            <Eye className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(article.id)}
                            className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StudentLayout>
  )
}
