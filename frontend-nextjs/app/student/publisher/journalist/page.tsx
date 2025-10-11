"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
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

// Types
interface JournalistMember {
  id: string
  name: string
  email: string
  phone: string
  grade: string
  role: "Writer" | "Editor" | "Photographer"
  avatar?: string
  joinDate: string
  articlesCount: number
  status: "active" | "inactive"
}

interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  status: "draft" | "pending" | "published" | "revision"
  author: string
  coAuthors: string[]
  views: number
  likes: number
  comments: number
  createdAt: string
  publishedAt?: string
  lastEdited?: string
  isPinned: boolean
  priority: "low" | "medium" | "high"
}

// Mock Data
const mockMembers: JournalistMember[] = [
  {
    id: "1",
    name: "Maria Santos",
    email: "maria.santos@student.edu",
    phone: "+63 917 123 4567",
    grade: "Grade 8-A",
    role: "Writer",
    joinDate: "2024-01-15",
    articlesCount: 12,
    status: "active",
  },
  {
    id: "2",
    name: "Juan Dela Cruz",
    email: "juan.delacruz@student.edu",
    phone: "+63 917 234 5678",
    grade: "Grade 8-B",
    role: "Editor",
    joinDate: "2024-01-10",
    articlesCount: 8,
    status: "active",
  },
  {
    id: "3",
    name: "Sofia Garcia",
    email: "sofia.garcia@student.edu",
    phone: "+63 917 345 6789",
    grade: "Grade 8-A",
    role: "Photographer",
    joinDate: "2024-02-01",
    articlesCount: 15,
    status: "active",
  },
]

const mockArticles: Article[] = [
  {
    id: "1",
    title: "School Science Fair Winners Announced",
    excerpt: "Students showcase innovative projects in annual science competition",
    content: "<p>Full article content here...</p>",
    category: "Academic News",
    tags: ["science", "competition", "awards"],
    status: "published",
    author: "Maria Santos",
    coAuthors: ["Juan Dela Cruz"],
    views: 245,
    likes: 32,
    comments: 8,
    createdAt: "2024-01-15",
    publishedAt: "2024-01-16",
    isPinned: true,
    priority: "high",
  },
  {
    id: "2",
    title: "Basketball Team Advances to Finals",
    excerpt: "Southville 8B NHS basketball team secures spot in championship game",
    content: "<p>Full article content here...</p>",
    category: "Sports",
    tags: ["basketball", "sports", "championship"],
    status: "published",
    author: "Juan Dela Cruz",
    coAuthors: [],
    views: 189,
    likes: 45,
    comments: 12,
    createdAt: "2024-01-14",
    publishedAt: "2024-01-14",
    isPinned: false,
    priority: "medium",
  },
  {
    id: "3",
    title: "Upcoming Cultural Festival Preview",
    excerpt: "Get ready for our biggest cultural celebration of the year",
    content: "<p>Draft content...</p>",
    category: "Events",
    tags: ["culture", "festival", "events"],
    status: "draft",
    author: "Maria Santos",
    coAuthors: [],
    views: 0,
    likes: 0,
    comments: 0,
    createdAt: "2024-01-18",
    lastEdited: "2024-01-18",
    isPinned: false,
    priority: "low",
  },
]

const availableStudents = [
  { id: "4", name: "Carlos Reyes", email: "carlos.reyes@student.edu", grade: "Grade 8-C" },
  { id: "5", name: "Ana Lopez", email: "ana.lopez@student.edu", grade: "Grade 8-A" },
  { id: "6", name: "Miguel Torres", email: "miguel.torres@student.edu", grade: "Grade 8-B" },
]

export default function JournalistManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"members" | "articles">("members")

  // Member Management State
  const [members, setMembers] = useState<JournalistMember[]>(mockMembers)
  const [memberSearch, setMemberSearch] = useState("")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [addMemberDialog, setAddMemberDialog] = useState(false)
  const [removeMemberDialog, setRemoveMemberDialog] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<JournalistMember | null>(null)
  const [newMember, setNewMember] = useState({
    studentId: "",
    role: "Writer" as "Writer" | "Editor" | "Photographer",
  })

  // Article Management State
  const [articles, setArticles] = useState<Article[]>(mockArticles)
  const [articleSearch, setArticleSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [articleDialog, setArticleDialog] = useState(false)
  const [deleteArticleDialog, setDeleteArticleDialog] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [articleForm, setArticleForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [] as string[],
    status: "draft" as "draft" | "pending" | "published" | "revision",
    priority: "medium" as "low" | "medium" | "high",
  })
  const [currentTag, setCurrentTag] = useState("")

  // Memoized filtered members with debouncing
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        member.email.toLowerCase().includes(memberSearch.toLowerCase())
      const matchesGrade = gradeFilter === "all" || member.grade === gradeFilter
      const matchesRole = roleFilter === "all" || member.role === roleFilter
      return matchesSearch && matchesGrade && matchesRole
    })
  }, [members, memberSearch, gradeFilter, roleFilter])

  // Memoized filtered articles
  const filteredArticles = useMemo(() => {
    const filtered = articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(articleSearch.toLowerCase())
      const matchesStatus = statusFilter === "all" || article.status === statusFilter
      const matchesCategory = categoryFilter === "all" || article.category === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })

    // Sort pinned articles first
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })
  }, [articles, articleSearch, statusFilter, categoryFilter])

  // Member Stats
  const memberStats = useMemo(() => {
    return {
      total: members.length,
      writers: members.filter((m) => m.role === "Writer").length,
      editors: members.filter((m) => m.role === "Editor").length,
      photographers: members.filter((m) => m.role === "Photographer").length,
      totalArticles: members.reduce((sum, m) => sum + m.articlesCount, 0),
    }
  }, [members])

  // Article Stats
  const articleStats = useMemo(() => {
    return {
      total: articles.length,
      published: articles.filter((a) => a.status === "published").length,
      drafts: articles.filter((a) => a.status === "draft").length,
      pending: articles.filter((a) => a.status === "pending").length,
      totalViews: articles.reduce((sum, a) => sum + a.views, 0),
      totalLikes: articles.reduce((sum, a) => sum + a.likes, 0),
    }
  }, [articles])

  // Member Management Functions
  const handleAddMember = useCallback(() => {
    const student = availableStudents.find((s) => s.id === newMember.studentId)
    if (!student) return

    const member: JournalistMember = {
      id: student.id,
      name: student.name,
      email: student.email,
      phone: "+63 917 000 0000",
      grade: student.grade,
      role: newMember.role,
      joinDate: new Date().toISOString().split("T")[0],
      articlesCount: 0,
      status: "active",
    }

    setMembers((prev) => [...prev, member])
    setAddMemberDialog(false)
    setNewMember({ studentId: "", role: "Writer" })
    toast({
      title: "Member Added",
      description: `${student.name} has been added as a ${newMember.role}.`,
    })
  }, [newMember, toast])

  const handleRemoveMember = useCallback(() => {
    if (!memberToRemove) return

    setMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id))
    setRemoveMemberDialog(false)
    toast({
      title: "Member Removed",
      description: `${memberToRemove.name} has been removed from the journalist team.`,
      variant: "destructive",
    })
    setMemberToRemove(null)
  }, [memberToRemove, toast])

  // Article Management Functions
  const handleOpenArticleDialog = useCallback((article?: Article) => {
    if (article) {
      setEditingArticle(article)
      setArticleForm({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        tags: article.tags,
        status: article.status,
        priority: article.priority,
      })
    } else {
      setEditingArticle(null)
      setArticleForm({
        title: "",
        excerpt: "",
        content: "",
        category: "",
        tags: [],
        status: "draft",
        priority: "medium",
      })
    }
    setArticleDialog(true)
  }, [])

  const handleSaveArticle = useCallback(() => {
    if (!articleForm.title || !articleForm.content) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in title and content.",
        variant: "destructive",
      })
      return
    }

    if (editingArticle) {
      // Update existing article
      setArticles((prev) =>
        prev.map((a) =>
          a.id === editingArticle.id
            ? {
                ...a,
                ...articleForm,
                lastEdited: new Date().toISOString().split("T")[0],
              }
            : a,
        ),
      )
      toast({
        title: "Article Updated",
        description: `"${articleForm.title}" has been updated successfully.`,
      })
    } else {
      // Create new article
      const newArticle: Article = {
        id: Date.now().toString(),
        ...articleForm,
        author: "Current User", // TODO: Get from auth
        coAuthors: [],
        views: 0,
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString().split("T")[0],
        isPinned: false,
      }
      setArticles((prev) => [newArticle, ...prev])
      toast({
        title: "Article Created",
        description: `"${articleForm.title}" has been created as a ${articleForm.status}.`,
      })
    }

    setArticleDialog(false)
    setEditingArticle(null)
  }, [articleForm, editingArticle, toast])

  const handleDeleteArticle = useCallback(() => {
    if (!articleToDelete) return

    setArticles((prev) => prev.filter((a) => a.id !== articleToDelete.id))
    setDeleteArticleDialog(false)
    toast({
      title: "Article Deleted",
      description: `"${articleToDelete.title}" has been deleted.`,
      variant: "destructive",
    })
    setArticleToDelete(null)
  }, [articleToDelete, toast])

  const handleTogglePin = useCallback((articleId: string) => {
    setArticles((prev) => prev.map((a) => (a.id === articleId ? { ...a, isPinned: !a.isPinned } : a)))
  }, [])

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

  const getStatusBadge = (status: Article["status"]) => {
    const variants = {
      draft: { color: "bg-gray-500", label: "Draft", icon: FileText },
      pending: { color: "bg-yellow-500", label: "Pending", icon: Clock },
      published: { color: "bg-green-500", label: "Published", icon: CheckCircle },
      revision: { color: "bg-orange-500", label: "Needs Revision", icon: AlertCircle },
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

  const getPriorityBadge = (priority: Article["priority"]) => {
    const colors = {
      low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    }
    return (
      <Badge variant="outline" className={colors[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
      </Badge>
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Writer":
        return <PenTool className="w-4 h-4" />
      case "Editor":
        return <BookOpen className="w-4 h-4" />
      case "Photographer":
        return <Camera className="w-4 h-4" />
      default:
        return <UserCircle className="w-4 h-4" />
    }
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
                        <p className="text-orange-100 text-sm font-medium">Total Articles</p>
                        <p className="text-3xl font-bold mt-1">{memberStats.totalArticles}</p>
                      </div>
                      <BarChart3 className="w-10 h-10 opacity-80" />
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
                          placeholder="Search members..."
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          className="pl-10 dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>
                    </div>
                    <Select value={gradeFilter} onValueChange={setGradeFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] dark:bg-slate-800 dark:border-slate-700">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        <SelectItem value="Grade 8-A">Grade 8-A</SelectItem>
                        <SelectItem value="Grade 8-B">Grade 8-B</SelectItem>
                        <SelectItem value="Grade 8-C">Grade 8-C</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] dark:bg-slate-800 dark:border-slate-700">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="Writer">Writer</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                        <SelectItem value="Photographer">Photographer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => setAddMemberDialog(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Members List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => (
                  <Card
                    key={member.id}
                    className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{member.name}</h3>
                            <Badge variant="outline" className="mt-1">
                              {getRoleIcon(member.role)}
                              <span className="ml-1">{member.role}</span>
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setMemberToRemove(member)
                            setRemoveMemberDialog(true)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          {member.grade}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {member.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {member.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Joined {new Date(member.joinDate).toLocaleDateString()}
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Articles:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 ml-2">
                            {member.articlesCount}
                          </span>
                        </div>
                        <Badge
                          variant={member.status === "active" ? "default" : "secondary"}
                          className={member.status === "active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
                        >
                          {member.status}
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
                      {memberSearch || gradeFilter !== "all" || roleFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Start by adding your first team member"}
                    </p>
                    {!memberSearch && gradeFilter === "all" && roleFilter === "all" && (
                      <Button
                        onClick={() => setAddMemberDialog(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add First Member
                      </Button>
                    )}
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
                        <SelectItem value="revision">Needs Revision</SelectItem>
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
                {filteredArticles.map((article) => (
                  <Card
                    key={article.id}
                    className={`shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all ${
                      article.isPinned ? "ring-2 ring-amber-500 dark:ring-amber-400" : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {article.isPinned && (
                                  <Pin className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-current" />
                                )}
                                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                                  {article.title}
                                </h3>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                {article.excerpt}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              {getStatusBadge(article.status)}
                              {getPriorityBadge(article.priority)}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <Badge variant="outline" className="text-xs">
                              {article.category}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <UserCircle className="w-3 h-3" />
                              {article.author}
                            </span>
                            {article.coAuthors.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />+{article.coAuthors.length} co-author
                                {article.coAuthors.length > 1 ? "s" : ""}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(article.createdAt).toLocaleDateString()}
                            </span>
                            {article.lastEdited && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Edited {new Date(article.lastEdited).toLocaleDateString()}
                              </span>
                            )}
                            {article.status === "published" && (
                              <>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {article.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {article.likes}
                                </span>
                              </>
                            )}
                          </div>

                          {article.tags.length > 0 && (
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
                            onClick={() => handleTogglePin(article.id)}
                            className="flex-1 sm:flex-none"
                          >
                            {article.isPinned ? (
                              <>
                                <PinOff className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Unpin</span>
                              </>
                            ) : (
                              <>
                                <Pin className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Pin</span>
                              </>
                            )}
                          </Button>
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
                ))}
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

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialog} onOpenChange={setAddMemberDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Add New Member
            </DialogTitle>
            <DialogDescription>Add a student to your journalist team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="student">Select Student</Label>
              <Select
                value={newMember.studentId}
                onValueChange={(value) => setNewMember((prev) => ({ ...prev, studentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - {student.grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newMember.role}
                onValueChange={(value: any) => setNewMember((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Writer">Writer</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Photographer">Photographer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={!newMember.studentId}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={removeMemberDialog} onOpenChange={setRemoveMemberDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{memberToRemove?.name}</strong> from the journalist team? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-red-600 hover:bg-red-700">
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              <Label htmlFor="article-excerpt">Excerpt</Label>
              <Textarea
                id="article-excerpt"
                value={articleForm.excerpt}
                onChange={(e) => setArticleForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief description..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="article-content">Content *</Label>
              <Textarea
                id="article-content"
                value={articleForm.content}
                onChange={(e) => setArticleForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Write your article content..."
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="article-category">Category</Label>
                <Select
                  value={articleForm.category}
                  onValueChange={(value) => setArticleForm((prev) => ({ ...prev, category: value }))}
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
                <Label htmlFor="article-status">Status</Label>
                <Select
                  value={articleForm.status}
                  onValueChange={(value: any) => setArticleForm((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="article-priority">Priority</Label>
              <Select
                value={articleForm.priority}
                onValueChange={(value: any) => setArticleForm((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
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
              disabled={!articleForm.title || !articleForm.content}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
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
            <AlertDialogAction onClick={handleDeleteArticle} className="bg-red-600 hover:bg-red-700">
              Delete Article
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StudentLayout>
  )
}
