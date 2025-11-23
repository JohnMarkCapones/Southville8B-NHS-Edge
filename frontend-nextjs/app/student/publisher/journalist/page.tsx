"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { newsApi } from "@/lib/api/endpoints/news"
import { NewsArticle } from "@/types/news"
import {
  Users,
  Plus,
  Search,
  Filter,
  UserPlus,
  Trash2,
  FileText,
  Eye,
  Edit,
  Calendar,
  Clock,
  Tag,
  TrendingUp,
  UserCircle,
  GraduationCap,
  Mail,
  Phone,
  X,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PenTool,
  Camera,
  BookOpen,
  Save,
  Pin,
  PinOff,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import StudentLayout from "@/components/student/student-layout"
import { Separator } from "@/components/ui/separator"

// Types matching backend API
interface JournalistMember {
  membershipId: string
  userId: string
  userName: string
  userEmail: string
  position: string
  articlesCount?: number
  status?: "active" | "inactive"
}

// Position mapping for display
const POSITION_DISPLAY_MAP: Record<string, { label: string; icon: any }> = {
  "Writer": { label: "Writer", icon: PenTool },
  "Editor": { label: "Editor", icon: BookOpen },
  "Photographer": { label: "Photographer", icon: Camera },
  "Editor-in-Chief": { label: "Editor-in-Chief", icon: BookOpen },
  "Co-Editor-in-Chief": { label: "Co-Editor-in-Chief", icon: BookOpen },
  "Publisher": { label: "Publisher", icon: FileText },
}

export default function JournalistManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<"members" | "articles">("members")

  // Member Management State
  const [memberSearch, setMemberSearch] = useState("")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [addMemberDialog, setAddMemberDialog] = useState(false)
  const [removeMemberDialog, setRemoveMemberDialog] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<JournalistMember | null>(null)
  const [newMember, setNewMember] = useState({
    userId: "",
    position: "Writer",
  })
  const [availableStudents, setAvailableStudents] = useState<any[]>([])

  // Article Management State
  const [articleSearch, setArticleSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [articleDialog, setArticleDialog] = useState(false)
  const [deleteArticleDialog, setDeleteArticleDialog] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null)
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null)
  const [articleForm, setArticleForm] = useState({
    title: "",
    description: "",
    articleHtml: "",
    categoryId: "",
    tags: [] as string[],
    visibility: "public" as "public" | "students" | "teachers" | "private",
  })
  const [currentTag, setCurrentTag] = useState("")

  // ============================================
  // DATA FETCHING
  // ============================================

  // Fetch journalism members
  const {
    data: membersData = [],
    isLoading: isLoadingMembers,
    error: membersError,
  } = useQuery({
    queryKey: ["journalism-members"],
    queryFn: () => newsApi.getJournalismMembers(),
  })

  // Fetch journalism KPIs
  const { data: kpisData } = useQuery({
    queryKey: ["journalism-kpis"],
    queryFn: () => newsApi.getJournalismKpis(),
  })

  // Fetch user's articles
  const {
    data: articlesData = [],
    isLoading: isLoadingArticles,
    error: articlesError,
  } = useQuery({
    queryKey: ["my-articles"],
    queryFn: () => newsApi.getMyArticles(),
  })

  // Fetch news stats
  const { data: newsStats } = useQuery({
    queryKey: ["news-stats"],
    queryFn: () => newsApi.getNewsStats(false), // false = user-specific stats
  })

  // ============================================
  // MUTATIONS
  // ============================================

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (data: { userId: string; position: string }) =>
      newsApi.addJournalismMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalism-members"] })
      queryClient.invalidateQueries({ queryKey: ["journalism-kpis"] })
      setAddMemberDialog(false)
      setNewMember({ userId: "", position: "Writer" })
      toast({
        title: "Member Added",
        description: "Member has been added to the journalism team successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add member. Please try again.",
        variant: "destructive",
      })
    },
  })

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => newsApi.removeJournalismMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalism-members"] })
      queryClient.invalidateQueries({ queryKey: ["journalism-kpis"] })
      setRemoveMemberDialog(false)
      setMemberToRemove(null)
      toast({
        title: "Member Removed",
        description: "Member has been removed from the journalism team.",
        variant: "destructive",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove member. Please try again.",
        variant: "destructive",
      })
    },
  })

  // Create article mutation
  const createArticleMutation = useMutation({
    mutationFn: (data: any) => newsApi.createNews(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-articles"] })
      queryClient.invalidateQueries({ queryKey: ["news-stats"] })
      setArticleDialog(false)
      setEditingArticle(null)
      toast({
        title: "Article Created",
        description: "Your article has been created successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create article. Please try again.",
        variant: "destructive",
      })
    },
  })

  // Update article mutation
  const updateArticleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      newsApi.updateNews(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-articles"] })
      setArticleDialog(false)
      setEditingArticle(null)
      toast({
        title: "Article Updated",
        description: "Your article has been updated successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update article. Please try again.",
        variant: "destructive",
      })
    },
  })

  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: (id: string) => newsApi.deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-articles"] })
      queryClient.invalidateQueries({ queryKey: ["news-stats"] })
      setDeleteArticleDialog(false)
      setArticleToDelete(null)
      toast({
        title: "Article Deleted",
        description: "Your article has been deleted successfully.",
        variant: "destructive",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete article. Please try again.",
        variant: "destructive",
      })
    },
  })

  // ============================================
  // FILTERED DATA
  // ============================================

  // Memoized filtered members
  const filteredMembers = useMemo(() => {
    return membersData.filter((member) => {
      const matchesSearch =
        member.userName.toLowerCase().includes(memberSearch.toLowerCase()) ||
        member.userEmail.toLowerCase().includes(memberSearch.toLowerCase())
      const matchesRole = roleFilter === "all" || member.position === roleFilter
      return matchesSearch && matchesRole
    })
  }, [membersData, memberSearch, roleFilter])

  // Memoized filtered articles
  const filteredArticles = useMemo(() => {
    const filtered = articlesData.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
        (article.excerpt || "").toLowerCase().includes(articleSearch.toLowerCase())

      // For status filtering, we'll need to use featured/trending flags
      // Since NewsArticle doesn't have a status field
      const matchesStatus = statusFilter === "all" // Simplified for now

      // Handle category as string or object
      const articleCategory = typeof article.category === 'string'
        ? article.category
        : article.category?.name || ""
      const matchesCategory = categoryFilter === "all" || articleCategory === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })

    // Sort featured articles first (using featured flag instead of isPinned)
    return filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return 0
    })
  }, [articlesData, articleSearch, statusFilter, categoryFilter])

  // Member Stats
  const memberStats = useMemo(() => {
    if (kpisData) {
      const positionCounts = kpisData.membersByPosition.reduce(
        (acc: any, item: any) => {
          acc[item.position] = item.count
          return acc
        },
        {}
      )

      return {
        total: kpisData.totalMembers,
        writers: positionCounts["Writer"] || 0,
        editors: (positionCounts["Editor"] || 0) + (positionCounts["Editor-in-Chief"] || 0) + (positionCounts["Co-Editor-in-Chief"] || 0),
        photographers: positionCounts["Photographer"] || 0,
        totalArticles: kpisData.activeContributors30d || 0,
      }
    }

    return {
      total: membersData.length,
      writers: membersData.filter((m) => m.position === "Writer").length,
      editors: membersData.filter((m) => m.position.includes("Editor")).length,
      photographers: membersData.filter((m) => m.position === "Photographer").length,
      totalArticles: 0,
    }
  }, [membersData, kpisData])

  // Article Stats
  const articleStats = useMemo(() => {
    if (newsStats) {
      return {
        total: newsStats.total,
        published: newsStats.published,
        drafts: newsStats.draft,
        pending: newsStats.pendingReview,
        totalViews: articlesData.reduce((sum, a) => sum + (a.views || 0), 0),
        totalLikes: articlesData.reduce((sum, a) => sum + (a.likes || 0), 0),
      }
    }

    // Fallback: calculate stats from articlesData using actual status field
    return {
      total: articlesData.length,
      published: articlesData.filter((a) => a.status?.toLowerCase() === 'published').length,
      drafts: articlesData.filter((a) => a.status?.toLowerCase() === 'draft' || !a.status).length,
      pending: articlesData.filter((a) => a.status?.toLowerCase() === 'pending_approval' || a.status?.toLowerCase() === 'pending review').length,
      totalViews: articlesData.reduce((sum, a) => sum + (a.views || 0), 0),
      totalLikes: articlesData.reduce((sum, a) => sum + (a.likes || 0), 0),
    }
  }, [articlesData, newsStats])

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleAddMember = useCallback(() => {
    if (!newMember.userId) {
      toast({
        title: "Missing Information",
        description: "Please select a student.",
        variant: "destructive",
      })
      return
    }

    addMemberMutation.mutate({
      userId: newMember.userId,
      position: newMember.position,
    })
  }, [newMember, addMemberMutation, toast])

  const handleRemoveMember = useCallback(() => {
    if (!memberToRemove) return
    removeMemberMutation.mutate(memberToRemove.userId)
  }, [memberToRemove, removeMemberMutation])

  const handleOpenArticleDialog = useCallback((article?: NewsArticle) => {
    if (article) {
      setEditingArticle(article)
      setArticleForm({
        title: article.title,
        description: article.excerpt || "",
        articleHtml: article.content,
        categoryId: typeof article.category === 'string' ? article.category : article.category?.name || "",
        tags: article.tags || [],
        visibility: "public",
      })
    } else {
      setEditingArticle(null)
      setArticleForm({
        title: "",
        description: "",
        articleHtml: "",
        categoryId: "",
        tags: [],
        visibility: "public",
      })
    }
    setArticleDialog(true)
  }, [])

  const handleSaveArticle = useCallback(() => {
    if (!articleForm.title || !articleForm.articleHtml) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in title and content.",
        variant: "destructive",
      })
      return
    }

    const articleData = {
      title: articleForm.title,
      description: articleForm.description,
      articleHtml: articleForm.articleHtml,
      articleJson: { content: articleForm.articleHtml }, // Simple JSON representation
      categoryId: articleForm.categoryId || undefined,
      tags: articleForm.tags,
      visibility: articleForm.visibility,
    }

    if (editingArticle) {
      updateArticleMutation.mutate({
        id: editingArticle.id,
        data: {
          title: articleForm.title,
          description: articleForm.description,
          article_html: articleForm.articleHtml,
          article_json: { content: articleForm.articleHtml },
          category_id: articleForm.categoryId || undefined,
          tags: articleForm.tags,
          visibility: articleForm.visibility,
        },
      })
    } else {
      createArticleMutation.mutate(articleData)
    }
  }, [articleForm, editingArticle, createArticleMutation, updateArticleMutation, toast])

  const handleDeleteArticle = useCallback(() => {
    if (!articleToDelete) return
    deleteArticleMutation.mutate(articleToDelete.id)
  }, [articleToDelete, deleteArticleMutation])

  const handleTogglePin = useCallback((articleId: string) => {
    // Note: Pin functionality might need backend support
    // For now, this is a placeholder
    toast({
      title: "Feature Not Available",
      description: "Pin functionality requires backend support.",
    })
  }, [toast])

  const addTag = useCallback(() => {
    if (currentTag.trim() && !articleForm.tags.includes(currentTag.trim())) {
      setArticleForm((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }))
      setCurrentTag("")
    }
  }, [currentTag, articleForm.tags])

  const removeTag = useCallback((tag: string) => {
    setArticleForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }, [])

  const getStatusBadge = (article: NewsArticle) => {
    // Check actual article status first
    const status = article.status?.toLowerCase() || 'draft'

    // Map status to badge
    switch (status) {
      case 'published':
        return (
          <Badge className="bg-green-500 text-white border-0">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-blue-500 text-white border-0">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case 'pending_approval':
      case 'pending review':
        return (
          <Badge className="bg-amber-500 text-white border-0">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        )
      case 'draft':
      default:
        return (
          <Badge className="bg-slate-500 text-white border-0">
            <FileText className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        )
    }
  }

  const getRoleIcon = (role: string) => {
    const positionInfo = POSITION_DISPLAY_MAP[role]
    const Icon = positionInfo?.icon || UserCircle
    return <Icon className="w-4 h-4" />
  }

  // Loading state
  if (isLoadingMembers || isLoadingArticles) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center h-[60vh]">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
              <p className="text-slate-600 dark:text-slate-400">Loading journalism data...</p>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Error state
  if (membersError || articlesError) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center h-[60vh]">
            <Card className="max-w-md">
              <CardContent className="p-8 text-center space-y-4">
                <AlertCircle className="w-12 h-12 mx-auto text-red-600" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Error Loading Data
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {(membersError as Error)?.message || (articlesError as Error)?.message || "Failed to load journalism data. Please try again."}
                </p>
                <Button onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </StudentLayout>
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
                Journalist Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your journalism team and articles</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "members" | "articles")}>
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Members
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Articles
              </TabsTrigger>
            </TabsList>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6 mt-6">
              {/* Member Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Members</p>
                        <p className="text-3xl font-bold mt-1">{memberStats.total}</p>
                      </div>
                      <Users className="w-10 h-10 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Writers</p>
                        <p className="text-3xl font-bold mt-1">{memberStats.writers}</p>
                      </div>
                      <PenTool className="w-10 h-10 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Editors</p>
                        <p className="text-3xl font-bold mt-1">{memberStats.editors}</p>
                      </div>
                      <BookOpen className="w-10 h-10 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-pink-100 text-sm font-medium">Photographers</p>
                        <p className="text-3xl font-bold mt-1">{memberStats.photographers}</p>
                      </div>
                      <Camera className="w-10 h-10 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">Active Contributors</p>
                        <p className="text-3xl font-bold mt-1">{memberStats.totalArticles}</p>
                      </div>
                      <BarChart3 className="w-10 h-10 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Search */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Search members..."
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          className="pl-10 dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] dark:bg-slate-800 dark:border-slate-700">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="Writer">Writer</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                        <SelectItem value="Editor-in-Chief">Editor-in-Chief</SelectItem>
                        <SelectItem value="Photographer">Photographer</SelectItem>
                        <SelectItem value="Publisher">Publisher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Members List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => (
                  <Card
                    key={member.membershipId}
                    className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              {member.userName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{member.userName}</h3>
                            <Badge variant="outline" className="mt-1">
                              {getRoleIcon(member.position)}
                              <span className="ml-1">{member.position}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {member.userEmail}
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Member ID:</span>
                          <span className="font-mono text-xs text-slate-900 dark:text-slate-100 ml-2">
                            {member.userId.slice(0, 8)}...
                          </span>
                        </div>
                        <Badge variant="default" className="bg-green-500 text-white">
                          Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredMembers.length === 0 && (
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No members found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      {memberSearch || roleFilter !== "all"
                        ? "Try adjusting your filters"
                        : "No journalism members found"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Articles Tab */}
            <TabsContent value="articles" className="space-y-6 mt-6">
              {/* Article Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Articles</p>
                        <p className="text-3xl font-bold mt-1">{articleStats.total}</p>
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
                        <p className="text-3xl font-bold mt-1">{articleStats.published}</p>
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
                        <p className="text-3xl font-bold mt-1">{articleStats.totalViews}</p>
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
                        <p className="text-3xl font-bold mt-1">{articleStats.totalLikes}</p>
                      </div>
                      <TrendingUp className="w-10 h-10 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Add Button */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Search articles..."
                          value={articleSearch}
                          onChange={(e) => setArticleSearch(e.target.value)}
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
                    <Button
                      onClick={() => handleOpenArticleDialog()}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Article
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Articles List */}
              <div className="space-y-4">
                {filteredArticles.map((article) => {
                  const categoryName = typeof article.category === 'string'
                    ? article.category
                    : article.category?.name || "Uncategorized"
                  const authorName = typeof article.author === 'string'
                    ? article.author
                    : article.author?.full_name || article.author?.name || "Unknown"

                  return (
                  <Card
                    key={article.id}
                    className={`shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all ${
                      article.featured ? "ring-2 ring-amber-500 dark:ring-amber-400" : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {article.featured && (
                                  <Pin className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-current" />
                                )}
                                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                                  {article.title}
                                </h3>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                {article.excerpt || "No description available"}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              {getStatusBadge(article)}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <Badge variant="outline" className="text-xs">
                              {categoryName}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <UserCircle className="w-3 h-3" />
                              {authorName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {article.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {article.likes}
                            </span>
                          </div>

                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {article.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex sm:flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenArticleDialog(article)}
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
                            onClick={() => {
                              setArticleToDelete(article)
                              setDeleteArticleDialog(true)
                            }}
                            className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  )
                })}
              </div>

              {filteredArticles.length === 0 && (
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No articles found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      {articleSearch || statusFilter !== "all" || categoryFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Start by creating your first article"}
                    </p>
                    {!articleSearch && statusFilter === "all" && categoryFilter === "all" && (
                      <Button
                        onClick={() => handleOpenArticleDialog()}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Article
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Article Dialog */}
      <Dialog open={articleDialog} onOpenChange={setArticleDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              {editingArticle ? "Edit Article" : "Create New Article"}
            </DialogTitle>
            <DialogDescription>
              {editingArticle ? "Update your article details" : "Fill in the details for your new article"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="article-title">Title *</Label>
              <Input
                id="article-title"
                value={articleForm.title}
                onChange={(e) => setArticleForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter article title..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="article-excerpt">Description</Label>
              <Textarea
                id="article-excerpt"
                value={articleForm.description}
                onChange={(e) => setArticleForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="article-content">Content *</Label>
              <Textarea
                id="article-content"
                value={articleForm.articleHtml}
                onChange={(e) => setArticleForm((prev) => ({ ...prev, articleHtml: e.target.value }))}
                placeholder="Write your article content..."
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="article-category">Category</Label>
                <Select
                  value={articleForm.categoryId}
                  onValueChange={(value) => setArticleForm((prev) => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic News">Academic News</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Announcements">Announcements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="article-visibility">Visibility</Label>
                <Select
                  value={articleForm.visibility}
                  onValueChange={(value: any) => setArticleForm((prev) => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="teachers">Teachers Only</SelectItem>
                    <SelectItem value="private">Internal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  Add
                </Button>
              </div>
              {articleForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {articleForm.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArticleDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveArticle}
              disabled={!articleForm.title || !articleForm.articleHtml || createArticleMutation.isPending || updateArticleMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {(createArticleMutation.isPending || updateArticleMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              <Save className="w-4 h-4 mr-2" />
              {editingArticle ? "Update Article" : "Create Article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Article Confirmation */}
      <AlertDialog open={deleteArticleDialog} onOpenChange={setDeleteArticleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{articleToDelete?.title}"</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteArticle}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteArticleMutation.isPending}
            >
              {deleteArticleMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Delete Article
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StudentLayout>
  )
}
