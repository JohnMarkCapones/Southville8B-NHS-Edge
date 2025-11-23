"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { newsApi } from "@/lib/api/endpoints/news"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  Database,
  Send,
  Archive,
  Copy,
  Star,
  StarOff,
  XCircle,
  Newspaper,
  Sparkles,
  Check,
  ChevronRightIcon,
  MessageSquare,
  UserCheck,
  Link2,
  Users,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Activity,
  UserPlus,
  UserMinus,
  Shield,
  Download,
  TrendingUp,
  Award,
} from "lucide-react"

const mockNewsArticles = [
  // Teacher-created articles
  {
    id: "1",
    title: "Science Fair Winners Announced",
    author: "Dr. Maria Santos",
    authorType: "teacher",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    category: "Academic",
    status: "Published",
    publishedDate: "2024-01-15",
    submittedDate: "2024-01-14",
    views: 1250,
    excerpt: "Congratulations to all participants in this year's science fair competition...",
    featured: true,
    visibility: "Public",
  },
  {
    id: "2",
    title: "Basketball Team Advances to Finals",
    author: "Coach Rodriguez",
    authorType: "teacher",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    category: "Sports",
    status: "Published",
    publishedDate: "2024-01-14",
    submittedDate: "2024-01-13",
    views: 890,
    excerpt: "Our varsity basketball team secured their spot in the regional finals...",
    featured: false,
    visibility: "Public",
  },
  // Student submissions - Pending Review
  {
    id: "3",
    title: "Student Council Elections: Meet the Candidates",
    author: "Maria Clara Santos",
    authorType: "student",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    studentGrade: "Grade 11",
    category: "Student Life",
    status: "Pending Review",
    publishedDate: "",
    submittedDate: "2024-01-16",
    views: 0,
    excerpt: "Get to know the candidates running for student council positions this year...",
    featured: false,
    visibility: "Public",
  },
  {
    id: "4",
    title: "Behind the Scenes: School Musical Rehearsals",
    author: "Juan Dela Cruz",
    authorType: "student",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    studentGrade: "Grade 10",
    category: "Events",
    status: "Pending Review",
    publishedDate: "",
    submittedDate: "2024-01-16",
    views: 0,
    excerpt: "An exclusive look at the hard work going into this year's musical production...",
    featured: false,
    visibility: "Public",
  },
  {
    id: "5",
    title: "Environmental Club's Tree Planting Initiative",
    author: "Sofia Reyes",
    authorType: "student",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    studentGrade: "Grade 12",
    category: "Events",
    status: "Pending Review",
    publishedDate: "",
    submittedDate: "2024-01-15",
    views: 0,
    excerpt: "Students plant 100 trees around campus as part of sustainability efforts...",
    featured: false,
    visibility: "Public",
  },
  {
    id: "6",
    title: "New Cafeteria Menu: Student Favorites Return",
    author: "Miguel Torres",
    authorType: "student",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    studentGrade: "Grade 9",
    category: "Student Life",
    status: "Pending Review",
    publishedDate: "",
    submittedDate: "2024-01-15",
    views: 0,
    excerpt: "Popular dishes make a comeback after student feedback survey...",
    featured: false,
    visibility: "Students Only",
  },
  // Student submissions - Needs Revision
  {
    id: "7",
    title: "Chess Club Tournament Results",
    author: "Anna Lim",
    authorType: "student",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    studentGrade: "Grade 11",
    category: "Sports",
    status: "Needs Revision",
    publishedDate: "",
    submittedDate: "2024-01-14",
    views: 0,
    excerpt: "Results from the inter-school chess tournament held last weekend...",
    featured: false,
    visibility: "Public",
    feedback: "Please add more details about the tournament format and include photos of the winners.",
  },
  {
    id: "8",
    title: "Study Tips from Honor Students",
    author: "Carlos Mendoza",
    authorType: "student",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    studentGrade: "Grade 12",
    category: "Academic",
    status: "Needs Revision",
    publishedDate: "",
    submittedDate: "2024-01-13",
    views: 0,
    excerpt: "Top students share their secrets to academic success...",
    featured: false,
    visibility: "Students Only",
    feedback: "Great content! Please cite your sources and add specific examples for each tip.",
  },
  // Student submissions - Approved (ready to publish)
  {
    id: "9",
    title: "Art Exhibition Showcases Student Talent",
    author: "Isabella Garcia",
    authorType: "student",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    studentGrade: "Grade 11",
    category: "Events",
    status: "Approved",
    publishedDate: "",
    submittedDate: "2024-01-12",
    approvedDate: "2024-01-15",
    views: 0,
    excerpt: "Annual art exhibition features stunning works from student artists...",
    featured: false,
    visibility: "Public",
  },
  {
    id: "10",
    title: "Robotics Team Prepares for National Competition",
    author: "David Chen",
    authorType: "student",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    studentGrade: "Grade 12",
    category: "Academic",
    status: "Approved",
    publishedDate: "",
    submittedDate: "2024-01-11",
    approvedDate: "2024-01-14",
    views: 0,
    excerpt: "Our robotics team is ready to compete at the national level...",
    featured: false,
    visibility: "Public",
  },
  // More published student articles
  {
    id: "11",
    title: "Volleyball Team Wins Regional Championship",
    author: "Emma Rodriguez",
    authorType: "student",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    studentGrade: "Grade 10",
    category: "Sports",
    status: "Published",
    publishedDate: "2024-01-10",
    submittedDate: "2024-01-09",
    approvedDate: "2024-01-10",
    views: 567,
    excerpt: "Girls volleyball team brings home the championship trophy...",
    featured: false,
    visibility: "Public",
  },
  {
    id: "12",
    title: "Book Club Discusses Contemporary Literature",
    author: "Sophia Martinez",
    authorType: "student",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    studentGrade: "Grade 11",
    category: "Student Life",
    status: "Published",
    publishedDate: "2024-01-08",
    submittedDate: "2024-01-07",
    approvedDate: "2024-01-08",
    views: 234,
    excerpt: "Monthly book club meeting explores themes in modern fiction...",
    featured: false,
    visibility: "Students Only",
  },
]

const mockStudentContributors = [
  {
    id: "sc1",
    name: "Maria Clara Santos",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "maria.santos@southville8b.edu",
    grade: "Grade 11",
    section: "A",
    role: "Senior Contributor",
    status: "Active",
    articlesSubmitted: 12,
    articlesPublished: 10,
    approvalRate: 83,
    lastSubmission: "2024-01-16",
    joinedDate: "2023-09-01",
  },
  {
    id: "sc2",
    name: "Juan Dela Cruz",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "juan.delacruz@southville8b.edu",
    grade: "Grade 10",
    section: "B",
    role: "Writer",
    status: "Active",
    articlesSubmitted: 8,
    articlesPublished: 6,
    approvalRate: 75,
    lastSubmission: "2024-01-16",
    joinedDate: "2023-10-15",
  },
  {
    id: "sc3",
    name: "Sofia Reyes",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "sofia.reyes@southville8b.edu",
    grade: "Grade 12",
    section: "A",
    role: "Editor",
    status: "Active",
    articlesSubmitted: 15,
    articlesPublished: 14,
    approvalRate: 93,
    lastSubmission: "2024-01-15",
    joinedDate: "2023-08-20",
  },
  {
    id: "sc4",
    name: "Miguel Torres",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "miguel.torres@southville8b.edu",
    grade: "Grade 9",
    section: "C",
    role: "Writer",
    status: "Active",
    articlesSubmitted: 5,
    articlesPublished: 3,
    approvalRate: 60,
    lastSubmission: "2024-01-15",
    joinedDate: "2023-11-01",
  },
  {
    id: "sc5",
    name: "Anna Lim",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "anna.lim@southville8b.edu",
    grade: "Grade 11",
    section: "B",
    role: "Writer",
    status: "Active",
    articlesSubmitted: 7,
    articlesPublished: 5,
    approvalRate: 71,
    lastSubmission: "2024-01-14",
    joinedDate: "2023-09-15",
  },
  {
    id: "sc6",
    name: "Carlos Mendoza",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "carlos.mendoza@southville8b.edu",
    grade: "Grade 12",
    section: "A",
    role: "Senior Contributor",
    status: "Active",
    articlesSubmitted: 18,
    articlesPublished: 16,
    approvalRate: 89,
    lastSubmission: "2024-01-13",
    joinedDate: "2023-08-15",
  },
  {
    id: "sc7",
    name: "Isabella Garcia",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "isabella.garcia@southville8b.edu",
    grade: "Grade 11",
    section: "A",
    role: "Editor",
    status: "Active",
    articlesSubmitted: 11,
    articlesPublished: 10,
    approvalRate: 91,
    lastSubmission: "2024-01-12",
    joinedDate: "2023-09-01",
  },
  {
    id: "sc8",
    name: "David Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "david.chen@southville8b.edu",
    grade: "Grade 12",
    section: "B",
    role: "Writer",
    status: "Suspended",
    articlesSubmitted: 4,
    articlesPublished: 1,
    approvalRate: 25,
    lastSubmission: "2024-01-05",
    joinedDate: "2023-10-01",
  },
  {
    id: "sc9",
    name: "Emma Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "emma.rodriguez@southville8b.edu",
    grade: "Grade 10",
    section: "A",
    role: "Writer",
    status: "Active",
    articlesSubmitted: 9,
    articlesPublished: 8,
    approvalRate: 89,
    lastSubmission: "2024-01-10",
    joinedDate: "2023-09-20",
  },
  {
    id: "sc10",
    name: "Sophia Martinez",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "sophia.martinez@southville8b.edu",
    grade: "Grade 11",
    section: "C",
    role: "Writer",
    status: "Active",
    articlesSubmitted: 6,
    articlesPublished: 5,
    approvalRate: 83,
    lastSubmission: "2024-01-08",
    joinedDate: "2023-10-10",
  },
]

const mockActivityFeed = [
  {
    id: "a1",
    type: "submission",
    student: "Maria Clara Santos",
    article: "Student Council Elections: Meet the Candidates",
    timestamp: "2 hours ago",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    id: "a2",
    type: "submission",
    student: "Juan Dela Cruz",
    article: "Behind the Scenes: School Musical Rehearsals",
    timestamp: "3 hours ago",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    id: "a3",
    type: "approved",
    student: "Isabella Garcia",
    article: "Art Exhibition Showcases Student Talent",
    timestamp: "5 hours ago",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    id: "a4",
    type: "revision",
    student: "Anna Lim",
    article: "Chess Club Tournament Results",
    timestamp: "1 day ago",
    icon: AlertTriangle,
    color: "text-orange-600",
  },
  {
    id: "a5",
    type: "published",
    student: "Emma Rodriguez",
    article: "Volleyball Team Wins Regional Championship",
    timestamp: "2 days ago",
    icon: Send,
    color: "text-purple-600",
  },
]

export default function TeacherNewsPage() {
  const { toast } = useToast()
  const router = useRouter()

  // Fetch real articles from API
  const { data: articlesData, isLoading: isLoadingArticles, refetch: refetchArticles } = useQuery({
    queryKey: ['news', 'teacher', 'all'],
    queryFn: () => newsApi.getAllNews({ limit: 100 }), // Fetch up to 100 articles
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 60000, // Refetch every minute
  })

  const [articles, setArticles] = useState<any[]>([])
  const [activityFeed] = useState(mockActivityFeed)
  const [contributors, setContributors] = useState(mockStudentContributors)

  // Update local articles state when API data changes
  useEffect(() => {
    if (articlesData?.data) {
      setArticles(articlesData.data)
    }
  }, [articlesData])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [authorTypeFilter, setAuthorTypeFilter] = useState("all")
  const [contributorSearchTerm, setContributorSearchTerm] = useState("")
  const [contributorRoleFilter, setContributorRoleFilter] = useState("all")
  const [contributorStatusFilter, setContributorStatusFilter] = useState("all")
  const [contributorGradeFilter, setContributorGradeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])
  const [selectedContributors, setSelectedContributors] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")

  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [selectedArticleForAction, setSelectedArticleForAction] = useState<any>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [publishWarningDialogOpen, setPublishWarningDialogOpen] = useState(false)
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false)
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const [selectedArticleForPublish, setSelectedArticleForPublish] = useState<any | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("")

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    article: any | null
    submenu: string | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    article: null,
    submenu: null,
  })

  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

  const [addContributorDialogOpen, setAddContributorDialogOpen] = useState(false)
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false)
  const [suspendUserDialogOpen, setSuspendUserDialogOpen] = useState(false)
  const [removeContributorDialogOpen, setRemoveContributorDialogOpen] = useState(false)
  const [selectedContributor, setSelectedContributor] = useState<any>(null)
  const [newRole, setNewRole] = useState("")
  const [newContributorEmail, setNewContributorEmail] = useState("")
  const [newContributorRole, setNewContributorRole] = useState("Writer")

  const getFilteredArticles = () => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || article.category.toLowerCase() === categoryFilter
      const matchesStatus = statusFilter === "all" || article.status.toLowerCase() === statusFilter
      const matchesAuthorType = authorTypeFilter === "all" || article.authorType === authorTypeFilter

      // Tab-based filtering using review_status
      let matchesTab = true
      if (activeTab === "pending") {
        // Pending tab: show articles with review_status 'pending' or 'in_review'
        matchesTab = article.reviewStatus === "pending" || article.reviewStatus === "in_review" || article.status === "Pending Review"
      } else if (activeTab === "published") {
        // Published tab: show articles with status 'Published'
        matchesTab = article.status === "Published"
      } else if (activeTab === "revision") {
        // Revision tab: show articles with review_status 'needs_revision'
        matchesTab = article.reviewStatus === "needs_revision" || article.status === "Needs Revision"
      } else if (activeTab === "approved") {
        // Approved tab: show articles with review_status 'approved'
        matchesTab = article.reviewStatus === "approved" || article.status === "Approved"
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesAuthorType && matchesTab
    })
  }

  const filteredArticles = getFilteredArticles()

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

  // Fetch real news statistics from API
  const { data: apiStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['news', 'stats'],
    queryFn: () => newsApi.getNewsStats(true), // true = get all stats (for reviewing all articles)
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 60000, // Refetch every minute
  })

  // Fallback to mock stats for display while loading or if error
  const stats = {
    total: apiStats?.total || articles.length,
    published: apiStats?.published || articles.filter((a) => a.status === "Published").length,
    pending: apiStats?.pendingReview || articles.filter((a) => a.status === "Pending Review" || a.reviewStatus === "pending" || a.reviewStatus === "in_review").length,
    needsRevision: apiStats?.needsRevision || articles.filter((a) => a.status === "Needs Revision" || a.reviewStatus === "needs_revision").length,
    approved: apiStats?.approved || articles.filter((a) => a.status === "Approved" || a.reviewStatus === "approved").length,
    totalViews: articles.reduce((sum, a) => sum + a.views, 0),
    studentSubmissions: apiStats?.studentSubmissions || articles.filter((a) => a.authorType === "student").length,
  }

  const topContributors = articles
    .filter((a) => a.authorType === "student")
    .reduce((acc: any[], article) => {
      const existing = acc.find((c) => c.name === article.author)
      if (existing) {
        existing.count++
        if (article.status === "Published") existing.published++
      } else {
        acc.push({
          name: article.author,
          avatar: article.authorAvatar,
          grade: article.studentGrade || "Student", // Fallback if grade not available
          count: 1,
          published: article.status === "Published" ? 1 : 0,
        })
      }
      return acc
    }, [])
    .sort((a, b) => b.published - a.published)
    .slice(0, 5)

  const getFilteredContributors = () => {
    return contributors.filter((contributor) => {
      const matchesSearch =
        contributor.name.toLowerCase().includes(contributorSearchTerm.toLowerCase()) ||
        contributor.email.toLowerCase().includes(contributorSearchTerm.toLowerCase())
      const matchesRole = contributorRoleFilter === "all" || contributor.role === contributorRoleFilter
      const matchesStatus = contributorStatusFilter === "all" || contributor.status === contributorStatusFilter
      const matchesGrade = contributorGradeFilter === "all" || contributor.grade === contributorGradeFilter

      return matchesSearch && matchesRole && matchesStatus && matchesGrade
    })
  }

  const filteredContributors = getFilteredContributors()

  const contributorStats = {
    total: contributors.length,
    active: contributors.filter((c) => c.status === "Active").length,
    suspended: contributors.filter((c) => c.status === "Suspended").length,
    newThisMonth: contributors.filter((c) => {
      const joinedDate = new Date(c.joinedDate)
      const now = new Date()
      return joinedDate.getMonth() === now.getMonth() && joinedDate.getFullYear() === now.getFullYear()
    }).length,
    avgApprovalRate: Math.round(contributors.reduce((sum, c) => sum + c.approvalRate, 0) / contributors.length),
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArticles(paginatedArticles.map((article) => article.id))
    } else {
      setSelectedArticles([])
    }
  }

  const handleSelectArticle = (articleId: string, checked: boolean) => {
    if (checked) {
      setSelectedArticles((prev) => [...prev, articleId])
    } else {
      setSelectedArticles((prev) => prev.filter((id) => id !== articleId))
    }
  }

  const getStatusBadge = (status: string, articleId: string) => {
    const badgeContent = (() => {
      switch (status) {
        case "Published":
          return (
            <Badge className="bg-green-500/10 text-green-700 border-green-500/20 cursor-pointer hover:bg-green-500/20 transition-colors">
              <CheckCircle className="w-3 h-3 mr-1" />
              Published
            </Badge>
          )
        case "Pending Review":
          return (
            <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20 cursor-pointer hover:bg-yellow-500/20 transition-colors">
              <Clock className="w-3 h-3 mr-1" />
              Pending Review
            </Badge>
          )
        case "Needs Revision":
          return (
            <Badge className="bg-orange-500/10 text-orange-700 border-orange-500/20 cursor-pointer hover:bg-orange-500/20 transition-colors">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Needs Revision
            </Badge>
          )
        case "Approved":
          return (
            <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 cursor-pointer hover:bg-blue-500/20 transition-colors">
              <ThumbsUp className="w-3 h-3 mr-1" />
              Approved
            </Badge>
          )
        case "Draft":
          return (
            <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 cursor-pointer hover:bg-gray-500/20 transition-colors">
              <FileText className="w-3 h-3 mr-1" />
              Draft
            </Badge>
          )
        case "Scheduled":
          return (
            <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 cursor-pointer hover:bg-blue-500/20 transition-colors">
              <Clock className="w-3 h-3 mr-1" />
              Scheduled
            </Badge>
          )
        case "Archived":
          return (
            <Badge className="bg-orange-500/10 text-orange-700 border-orange-500/20 cursor-pointer hover:bg-orange-500/20 transition-colors">
              <Archive className="w-3 h-3 mr-1" />
              Archived
            </Badge>
          )
        default:
          return <Badge className="cursor-pointer hover:bg-gray-100 transition-colors">{status}</Badge>
      }
    })()

    return <div onClick={() => handleStatusBadgeClick(articleId, status)}>{badgeContent}</div>
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      Academic: "bg-purple-500/10 text-purple-700 border-purple-500/20",
      Sports: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      Announcements: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      Events: "bg-green-500/10 text-green-700 border-green-500/20",
      "Student Life": "bg-pink-500/10 text-pink-700 border-pink-500/20",
    }

    return <Badge className={colors[category as keyof typeof colors] || "bg-gray-500/10"}>{category}</Badge>
  }

  const handleApproveArticle = (article: any) => {
    setSelectedArticleForAction(article)
    setApproveDialogOpen(true)
  }

  const handleRejectArticle = (article: any) => {
    setSelectedArticleForAction(article)
    setFeedbackText("")
    setRejectDialogOpen(true)
  }

  const handleRequestRevision = (article: any) => {
    setSelectedArticleForAction(article)
    setFeedbackText(article.feedback || "")
    setRevisionDialogOpen(true)
  }

  const confirmApprove = () => {
    if (selectedArticleForAction) {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === selectedArticleForAction.id
            ? { ...a, status: "Approved", approvedDate: new Date().toISOString().split("T")[0] }
            : a,
        ),
      )
      toast({
        title: "Article Approved",
        description: `"${selectedArticleForAction.title}" has been approved and is ready to publish.`,
      })
    }
    setApproveDialogOpen(false)
    setSelectedArticleForAction(null)
  }

  const confirmReject = () => {
    if (selectedArticleForAction && feedbackText.trim()) {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === selectedArticleForAction.id ? { ...a, status: "Needs Revision", feedback: feedbackText } : a,
        ),
      )
      toast({
        title: "Article Rejected",
        description: `Feedback sent to ${selectedArticleForAction.author}.`,
        variant: "destructive",
      })
    }
    setRejectDialogOpen(false)
    setSelectedArticleForAction(null)
    setFeedbackText("")
  }

  const confirmRequestRevision = () => {
    if (selectedArticleForAction && feedbackText.trim()) {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === selectedArticleForAction.id ? { ...a, status: "Needs Revision", feedback: feedbackText } : a,
        ),
      )
      toast({
        title: "Revision Requested",
        description: `Feedback sent to ${selectedArticleForAction.author}.`,
      })
    }
    setRevisionDialogOpen(false)
    setSelectedArticleForAction(null)
    setFeedbackText("")
  }

  const handleCreateArticle = () => {
    router.push("/teacher/news/create")
  }

  const handleEditArticle = (articleId: string) => {
    router.push(`/teacher/news/edit/${articleId}`)
  }

  const handleViewArticle = (articleId: string) => {
    router.push(`/teacher/news/view/${articleId}`)
  }

  const handleStatusBadgeClick = (articleId: string, currentStatus: string) => {
    setSelectedArticleId(articleId)
    setSelectedStatus(currentStatus)
    setStatusDialogOpen(true)
  }

  const handlePublishNow = (articleId: string) => {
    // Find the article to check its review_status
    const article = articles.find(a => a.id === articleId)

    if (!article) return

    setSelectedArticleId(articleId)
    setSelectedArticleForPublish(article)

    // Check if article has pending review_status
    if (article.reviewStatus === 'pending' || article.reviewStatus === 'in_review') {
      // Show warning dialog that publishing will auto-approve
      setPublishWarningDialogOpen(true)
    } else {
      // Show normal publish confirmation
      setPublishDialogOpen(true)
    }
  }

  const handleUnpublish = (articleId: string) => {
    setSelectedArticleId(articleId)
    setUnpublishDialogOpen(true)
  }

  const handleChangeStatus = (articleId: string, newStatus: string) => {
    setSelectedArticleId(articleId)
    setSelectedStatus(newStatus)
    setStatusDialogOpen(true)
  }

  const handleFeatureToggle = (articleId: string) => {
    setArticles((prev) => prev.map((a) => (a.id === articleId ? { ...a, featured: !a.featured } : a)))
    const article = articles.find((a) => a.id === articleId)
    toast({
      title: article?.featured ? "Article Unfeatured" : "Article Featured",
      description: article?.featured
        ? "The article has been removed from featured articles."
        : "The article has been added to featured articles.",
    })
  }

  const handleDuplicate = (articleId: string) => {
    const article = articles.find((a) => a.id === articleId)
    if (article) {
      const newArticle = {
        ...article,
        id: `${Date.now()}`,
        title: `${article.title} (Copy)`,
        status: "Draft",
        publishedDate: "",
        views: 0,
      }
      setArticles((prev) => [newArticle, ...prev])
      toast({
        title: "Article Duplicated",
        description: "A copy of the article has been created as a draft.",
      })
    }
  }

  const handleDeleteClick = (articleId: string) => {
    setSelectedArticleId(articleId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedArticleId) {
      try {
        // Call API to soft delete the article (sets deleted_at and deleted_by)
        await newsApi.deleteNews(selectedArticleId)

        // Remove from local state
        setArticles((prev) => prev.filter((a) => a.id !== selectedArticleId))

        // Refetch articles to get updated data
        refetchArticles()

        toast({
          title: "Article Deleted",
          description: "The article has been successfully deleted.",
        })
      } catch (error: any) {
        console.error('Error deleting article:', error)
        const errorMessage = error?.message || "Failed to delete article. Please try again."
        toast({
          title: "Cannot Delete Article",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
    setDeleteDialogOpen(false)
    setSelectedArticleId(null)
  }

  const confirmStatusChange = () => {
    if (selectedArticleId && selectedStatus) {
      setArticles((prev) => prev.map((a) => (a.id === selectedArticleId ? { ...a, status: selectedStatus } : a)))
      toast({
        title: "Status Updated",
        description: `Article status has been changed to ${selectedStatus}.`,
      })
    }
    setStatusDialogOpen(false)
    setSelectedArticleId(null)
    setSelectedStatus("")
  }

  const confirmPublish = async (forceApprove: boolean = false) => {
    if (!selectedArticleId) return

    try {
      await newsApi.publishNews(selectedArticleId, forceApprove)

      // Update local state
      setArticles((prev) =>
        prev.map((a) =>
          a.id === selectedArticleId
            ? { ...a, status: "Published", publishedDate: new Date().toISOString().split("T")[0], reviewStatus: 'approved' }
            : a,
        ),
      )

      toast({
        title: "Article Published",
        description: forceApprove
          ? "The article has been approved and published successfully."
          : "The article has been published successfully.",
      })

      // Refresh articles from API
      await refetchArticles()
    } catch (error) {
      console.error('Error publishing article:', error)
      toast({
        title: "Error",
        description: "Failed to publish article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPublishDialogOpen(false)
      setPublishWarningDialogOpen(false)
      setSelectedArticleId(null)
      setSelectedArticleForPublish(null)
    }
  }

  const confirmUnpublish = async () => {
    if (!selectedArticleId) return

    try {
      await newsApi.unpublishNews(selectedArticleId)

      // Update local state
      setArticles((prev) =>
        prev.map((a) =>
          a.id === selectedArticleId
            ? { ...a, status: "Draft" }
            : a
        )
      )

      toast({
        title: "Article Unpublished",
        description: "The article has been unpublished and moved to drafts.",
      })

      // Refresh articles from API
      await refetchArticles()
    } catch (error) {
      console.error('Error unpublishing article:', error)
      toast({
        title: "Error",
        description: "Failed to unpublish article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUnpublishDialogOpen(false)
      setSelectedArticleId(null)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, article: any) => {
    e.preventDefault()
    e.stopPropagation()

    const x = e.clientX
    const y = e.clientY

    const menuWidth = 240
    const menuHeight = 500
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let adjustedX = x
    let adjustedY = y

    if (x + menuWidth > viewportWidth) {
      adjustedX = x - menuWidth
    }

    if (y + menuHeight > viewportHeight) {
      adjustedY = y - menuHeight
    }

    setContextMenu({
      visible: true,
      x: adjustedX,
      y: adjustedY,
      article,
      submenu: null,
    })
  }

  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      article: null,
      submenu: null,
    })
  }

  const handlePreview = (article: any) => {
    router.push(`/teacher/news/preview/${article.id}`)
    closeContextMenu()
  }

  const handleCopyLink = (article: any) => {
    const link = `${window.location.origin}/news/${article.id}`
    navigator.clipboard.writeText(link)

    toast({
      title: "Link Copied",
      description: (
        <div className="space-y-2">
          <p className="font-medium">Article link copied to clipboard</p>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 max-w-full overflow-hidden">
              <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-mono text-xs truncate">{link}</span>
            </div>
          </div>
        </div>
      ),
      className: "border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20 backdrop-blur-sm",
      duration: 4000,
    })

    closeContextMenu()
  }

  const handleRequestReview = (article: any) => {
    toast({
      title: "Review Requested",
      description: `Review request sent for "${article.title}"`,
      duration: 3000,
    })
    closeContextMenu()
  }

  const handleBulkPublish = () => {
    setArticles((prev) =>
      prev.map((a) =>
        selectedArticles.includes(a.id)
          ? { ...a, status: "Published", publishedDate: new Date().toISOString().split("T")[0] }
          : a,
      ),
    )
    toast({
      title: "Articles Published",
      description: `${selectedArticles.length} article(s) have been published successfully.`,
    })
    setSelectedArticles([])
  }

  const handleBulkArchive = () => {
    setArticles((prev) => prev.map((a) => (selectedArticles.includes(a.id) ? { ...a, status: "Archived" } : a)))
    toast({
      title: "Articles Archived",
      description: `${selectedArticles.length} article(s) have been archived.`,
    })
    setSelectedArticles([])
  }

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true)
  }

  const confirmBulkDelete = () => {
    setArticles((prev) => prev.filter((a) => !selectedArticles.includes(a.id)))
    toast({
      title: "Articles Deleted",
      description: `${selectedArticles.length} article(s) have been permanently deleted.`,
    })
    setSelectedArticles([])
    setBulkDeleteDialogOpen(false)
  }

  const handleBulkApprove = () => {
    setArticles((prev) =>
      prev.map((a) =>
        selectedArticles.includes(a.id)
          ? { ...a, status: "Approved", approvedDate: new Date().toISOString().split("T")[0] }
          : a,
      ),
    )
    toast({
      title: "Articles Approved",
      description: `${selectedArticles.length} article(s) have been approved.`,
    })
    setSelectedArticles([])
  }

  const handleAddContributor = () => {
    setNewContributorEmail("")
    setNewContributorRole("Writer")
    setAddContributorDialogOpen(true)
  }

  const confirmAddContributor = () => {
    if (newContributorEmail.trim()) {
      toast({
        title: "Contributor Added",
        description: `Invitation sent to ${newContributorEmail}`,
      })
      setAddContributorDialogOpen(false)
    }
  }

  const handleChangeRole = (contributor: any) => {
    setSelectedContributor(contributor)
    setNewRole(contributor.role)
    setChangeRoleDialogOpen(true)
  }

  const confirmChangeRole = () => {
    if (selectedContributor && newRole) {
      setContributors((prev) => prev.map((c) => (c.id === selectedContributor.id ? { ...c, role: newRole } : c)))
      toast({
        title: "Role Updated",
        description: `${selectedContributor.name}'s role changed to ${newRole}`,
      })
      setChangeRoleDialogOpen(false)
    }
  }

  const handleSuspendUser = (contributor: any) => {
    setSelectedContributor(contributor)
    setSuspendUserDialogOpen(true)
  }

  const confirmSuspendUser = () => {
    if (selectedContributor) {
      const newStatus = selectedContributor.status === "Active" ? "Suspended" : "Active"
      setContributors((prev) => prev.map((c) => (c.id === selectedContributor.id ? { ...c, status: newStatus } : c)))
      toast({
        title: newStatus === "Suspended" ? "User Suspended" : "User Activated",
        description: `${selectedContributor.name} has been ${newStatus.toLowerCase()}`,
        variant: newStatus === "Suspended" ? "destructive" : "default",
      })
      setSuspendUserDialogOpen(false)
    }
  }

  const handleRemoveContributor = (contributor: any) => {
    setSelectedContributor(contributor)
    setRemoveContributorDialogOpen(true)
  }

  const confirmRemoveContributor = () => {
    if (selectedContributor) {
      setContributors((prev) => prev.filter((c) => c.id !== selectedContributor.id))
      toast({
        title: "Contributor Removed",
        description: `${selectedContributor.name} has been removed from contributors`,
        variant: "destructive",
      })
      setRemoveContributorDialogOpen(false)
    }
  }

  const handleExportContributors = () => {
    toast({
      title: "Export Started",
      description: "Downloading contributor data as CSV...",
    })
  }

  const handleBulkChangeRole = (role: string) => {
    setContributors((prev) => prev.map((c) => (selectedContributors.includes(c.id) ? { ...c, role } : c)))
    toast({
      title: "Roles Updated",
      description: `${selectedContributors.length} contributor(s) role changed to ${role}`,
    })
    setSelectedContributors([])
  }

  const handleBulkSuspend = () => {
    setContributors((prev) =>
      prev.map((c) => (selectedContributors.includes(c.id) ? { ...c, status: "Suspended" } : c)),
    )
    toast({
      title: "Users Suspended",
      description: `${selectedContributors.length} contributor(s) have been suspended`,
      variant: "destructive",
    })
    setSelectedContributors([])
  }

  const handleBulkActivate = () => {
    setContributors((prev) => prev.map((c) => (selectedContributors.includes(c.id) ? { ...c, status: "Active" } : c)))
    toast({
      title: "Users Activated",
      description: `${selectedContributors.length} contributor(s) have been activated`,
    })
    setSelectedContributors([])
  }

  const handleSelectAllContributors = (checked: boolean) => {
    if (checked) {
      setSelectedContributors(filteredContributors.map((c) => c.id))
    } else {
      setSelectedContributors([])
    }
  }

  const handleSelectContributor = (contributorId: string, checked: boolean) => {
    if (checked) {
      setSelectedContributors((prev) => [...prev, contributorId])
    } else {
      setSelectedContributors((prev) => prev.filter((id) => id !== contributorId))
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      "Senior Contributor": "bg-purple-500/10 text-purple-700 border-purple-500/20",
      Editor: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      Writer: "bg-green-500/10 text-green-700 border-green-500/20",
    }
    return <Badge className={colors[role as keyof typeof colors] || "bg-gray-500/10"}>{role}</Badge>
  }

  const getStatusBadgeContributor = (status: string) => {
    if (status === "Active") {
      return (
        <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-500/10 text-red-700 border-red-500/20">
          <XCircle className="w-3 h-3 mr-1" />
          Suspended
        </Badge>
      )
    }
  }

  useEffect(() => {
    const handleClick = () => closeContextMenu()
    const handleScroll = () => closeContextMenu()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContextMenu()
    }
    const handleResize = () => closeContextMenu()

    if (contextMenu.visible) {
      document.addEventListener("click", handleClick)
      document.addEventListener("scroll", handleScroll, { passive: true })
      document.addEventListener("keydown", handleKeyDown)
      window.addEventListener("resize", handleResize)

      return () => {
        document.removeEventListener("click", handleClick)
        document.removeEventListener("scroll", handleScroll)
        document.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [contextMenu.visible])

  return (
    <div className="space-y-8 px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto py-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Newspaper className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">News Management</h1>
                <p className="text-blue-100 mt-1 text-lg">Manage student submissions and school journalism</p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleCreateArticle}
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Article
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600" />
          <CardContent className="relative p-6 text-white">
            {isLoadingStats ? (
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-white/30 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-white/30 rounded animate-pulse" />
                  <div className="h-3 w-28 bg-white/30 rounded animate-pulse" />
                </div>
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-yellow-100">Pending Review</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-yellow-100">Awaiting approval</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600" />
          <CardContent className="relative p-6 text-white">
            {isLoadingStats ? (
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-white/30 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-white/30 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-white/30 rounded animate-pulse" />
                </div>
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                  <CheckCircle className="h-8 w-8" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-100">Published</p>
                  <p className="text-3xl font-bold">{stats.published}</p>
                  <p className="text-xs text-green-100">Live articles</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                  <CheckCircle className="h-8 w-8" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600" />
          <CardContent className="relative p-6 text-white">
            {isLoadingStats ? (
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-white/30 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-white/30 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-white/30 rounded animate-pulse" />
                </div>
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                  <AlertTriangle className="h-8 w-8" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-orange-100">Needs Revision</p>
                  <p className="text-3xl font-bold">{stats.needsRevision}</p>
                  <p className="text-xs text-orange-100">Requires changes</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                  <AlertTriangle className="h-8 w-8" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600" />
          <CardContent className="relative p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-100">Student Submissions</p>
                <p className="text-3xl font-bold">{stats.studentSubmissions}</p>
                <p className="text-xs text-purple-100">Total from students</p>
              </div>
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">Article Management</CardTitle>
                  <CardDescription>Review and manage student submissions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 h-auto">
                  <TabsTrigger value="all" className="flex flex-col items-center gap-1 py-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">All</span>
                    <Badge variant="secondary" className="text-xs">
                      {articles.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="flex flex-col items-center gap-1 py-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Pending</span>
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                      {stats.pending}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="flex flex-col items-center gap-1 py-2">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-xs">Approved</span>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                      {stats.approved}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="revision" className="flex flex-col items-center gap-1 py-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs">Revision</span>
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                      {stats.needsRevision}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="published" className="flex flex-col items-center gap-1 py-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Published</span>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      {stats.published}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-4">
                  {/* Search and filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                          placeholder="Search articles by title or author..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setCurrentPage(1)
                          }}
                          className="pl-11 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
                      <SelectTrigger className="w-full sm:w-[180px] h-11 border-gray-300">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="announcements">Announcements</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="student life">Student Life</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={authorTypeFilter} onValueChange={(value) => setAuthorTypeFilter(value)}>
                      <SelectTrigger className="w-full sm:w-[180px] h-11 border-gray-300">
                        <SelectValue placeholder="Author Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Authors</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                        <SelectItem value="teacher">Teachers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bulk actions */}
                  {selectedArticles.length > 0 && (
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {selectedArticles.length} article{selectedArticles.length > 1 ? "s" : ""} selected
                      </span>
                      <div className="flex items-center space-x-2">
                        {activeTab === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleBulkApprove}
                            className="border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700"
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleBulkPublish}
                          className="border-green-300 bg-green-50 hover:bg-green-100 text-green-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Publish
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleBulkArchive}
                          className="border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleBulkDelete}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Articles table */}
                  <TabsContent value={activeTab} className="mt-0">
                    <div className="border rounded-xl overflow-hidden shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
                            <TableHead className="w-12">
                              <Checkbox
                                checked={
                                  selectedArticles.length === paginatedArticles.length && paginatedArticles.length > 0
                                }
                                onCheckedChange={handleSelectAll}
                              />
                            </TableHead>
                            <TableHead className="font-semibold">Article</TableHead>
                            <TableHead className="font-semibold">Author</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Review Status</TableHead>
                            <TableHead className="font-semibold">Date</TableHead>
                            {activeTab === "pending" && <TableHead className="font-semibold">Actions</TableHead>}
                            {activeTab === "approved" && <TableHead className="font-semibold">Actions</TableHead>}
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingArticles ? (
                            // Loading skeleton
                            Array.from({ length: 5 }).map((_, idx) => (
                              <TableRow key={`loading-${idx}`}>
                                <TableCell><div className="h-4 w-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                                <TableCell>
                                  <div className="space-y-2">
                                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 w-64 bg-gray-200 rounded animate-pulse" />
                                  </div>
                                </TableCell>
                                <TableCell><div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" /></TableCell>
                                <TableCell><div className="h-6 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
                                <TableCell><div className="h-6 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
                                <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                                {activeTab === "pending" && <TableCell><div className="h-8 w-32 bg-gray-200 rounded animate-pulse" /></TableCell>}
                                {activeTab === "approved" && <TableCell><div className="h-8 w-32 bg-gray-200 rounded animate-pulse" /></TableCell>}
                                <TableCell><div className="h-8 w-8 bg-gray-200 rounded animate-pulse" /></TableCell>
                              </TableRow>
                            ))
                          ) : paginatedArticles.length === 0 ? (
                            // Empty state
                            <TableRow>
                              <TableCell colSpan={(activeTab === "pending" || activeTab === "approved") ? 8 : 7} className="text-center py-12">
                                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                  <FileText className="w-12 h-12 opacity-50" />
                                  <p className="text-lg font-medium">No articles found</p>
                                  <p className="text-sm">Try adjusting your filters or create a new article</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedArticles.map((article) => (
                            <TableRow
                              key={article.id}
                              className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors cursor-pointer"
                              onContextMenu={(e) => handleContextMenu(e, article)}
                              onClick={() => handlePreview(article)}
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedArticles.includes(article.id)}
                                  onCheckedChange={(checked) => handleSelectArticle(article.id, checked as boolean)}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="max-w-md">
                                  <div className="font-medium text-base flex items-center gap-2">
                                    {article.title}
                                    {article.featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                    {article.excerpt}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={article.authorAvatar || "/placeholder.svg"} />
                                    <AvatarFallback>{article.author.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-sm">{article.author}</div>
                                    {article.authorType === "student" && (
                                      <div className="text-xs text-muted-foreground">{article.studentGrade}</div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(article.status, article.id)}</TableCell>
                              <TableCell>
                                {article.reviewStatus === 'pending' && (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                    Pending
                                  </Badge>
                                )}
                                {article.reviewStatus === 'in_review' && (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                                    In Review
                                  </Badge>
                                )}
                                {article.reviewStatus === 'approved' && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                                    Approved
                                  </Badge>
                                )}
                                {article.reviewStatus === 'rejected' && (
                                  <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-300">
                                    Rejected
                                  </Badge>
                                )}
                                {article.reviewStatus === 'needs_revision' && (
                                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300">
                                    Needs Revision
                                  </Badge>
                                )}
                                {!article.reviewStatus && (
                                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                    N/A
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {article.publishedDate ? (
                                    <div className="flex items-center font-medium">
                                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                      {new Date(article.publishedDate).toLocaleDateString()}
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-muted-foreground">
                                      <Clock className="w-4 h-4 mr-2" />
                                      {new Date(article.submittedDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              {activeTab === "pending" && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleApproveArticle(article)}
                                      className="hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                                    >
                                      <ThumbsUp className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRequestRevision(article)}
                                      className="hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
                                    >
                                      <AlertTriangle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRejectArticle(article)}
                                      className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                    >
                                      <ThumbsDown className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                              {activeTab === "approved" && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleApproveArticle(article)}
                                      className="hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                                    >
                                      <ThumbsUp className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => handlePublishNow(article.id)}
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                      <Send className="w-4 h-4 mr-2" />
                                      Publish
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => handleViewArticle(article.id)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditArticle(article.id)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePreview(article)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      Preview
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {article.status === "Pending Review" && (
                                      <>
                                        <DropdownMenuItem onClick={() => handleApproveArticle(article)}>
                                          <ThumbsUp className="w-4 h-4 mr-2" />
                                          Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleRequestRevision(article)}>
                                          <AlertTriangle className="w-4 h-4 mr-2" />
                                          Request Revision
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                      </>
                                    )}
                                    {article.status !== "Published" && (
                                      <DropdownMenuItem onClick={() => handlePublishNow(article.id)}>
                                        <Send className="w-4 h-4 mr-2" />
                                        Publish Now
                                      </DropdownMenuItem>
                                    )}
                                    {article.status === "Published" && (
                                      <DropdownMenuItem onClick={() => handleUnpublish(article.id)}>
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Unpublish
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleFeatureToggle(article.id)}>
                                      {article.featured ? (
                                        <>
                                          <StarOff className="w-4 h-4 mr-2" />
                                          Unfeature
                                        </>
                                      ) : (
                                        <>
                                          <Star className="w-4 h-4 mr-2" />
                                          Feature
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDuplicate(article.id)}>
                                      <Copy className="w-4 h-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    {article.status === "Draft" && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-red-600 focus:text-red-600"
                                          onClick={() => handleDeleteClick(article.id)}
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4">
                      <div className="text-sm text-muted-foreground font-medium">
                        Showing <span className="text-foreground font-semibold">{startIndex + 1}</span> to{" "}
                        <span className="text-foreground font-semibold">
                          {Math.min(endIndex, filteredArticles.length)}
                        </span>{" "}
                        of <span className="text-foreground font-semibold">{filteredArticles.length}</span> articles
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </Button>
                        <div className="px-4 py-2 text-sm font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-lg">
                          Page {currentPage} of {totalPages || 1}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages || totalPages === 0}
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contributors" className="mt-6 space-y-6">
                    {/* Contributor Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                Active Contributors
                              </p>
                              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                {contributorStats.active}
                              </p>
                            </div>
                            <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-700 dark:text-green-300">New This Month</p>
                              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                {contributorStats.newThisMonth}
                              </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-red-700 dark:text-red-300">Suspended</p>
                              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                                {contributorStats.suspended}
                              </p>
                            </div>
                            <UserMinus className="w-8 h-8 text-red-600 dark:text-red-400" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Avg Approval Rate</p>
                              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                {contributorStats.avgApprovalRate}%
                              </p>
                            </div>
                            <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Management Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex gap-2">
                        <Button onClick={handleAddContributor} className="bg-purple-600 hover:bg-purple-700">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Contributor
                        </Button>
                        <Button variant="outline" onClick={handleExportContributors}>
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                          <Input
                            placeholder="Search by name or email..."
                            value={contributorSearchTerm}
                            onChange={(e) => setContributorSearchTerm(e.target.value)}
                            className="pl-11 h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                      <Select value={contributorRoleFilter} onValueChange={setContributorRoleFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] h-11 border-gray-300">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="Senior Contributor">Senior Contributor</SelectItem>
                          <SelectItem value="Editor">Editor</SelectItem>
                          <SelectItem value="Writer">Writer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={contributorStatusFilter} onValueChange={setContributorStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] h-11 border-gray-300">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={contributorGradeFilter} onValueChange={setContributorGradeFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] h-11 border-gray-300">
                          <SelectValue placeholder="Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Grades</SelectItem>
                          <SelectItem value="Grade 9">Grade 9</SelectItem>
                          <SelectItem value="Grade 10">Grade 10</SelectItem>
                          <SelectItem value="Grade 11">Grade 11</SelectItem>
                          <SelectItem value="Grade 12">Grade 12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedContributors.length > 0 && (
                      <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                          {selectedContributors.length} contributor{selectedContributors.length > 1 ? "s" : ""} selected
                        </span>
                        <div className="flex items-center space-x-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline" className="border-purple-300 bg-transparent">
                                <Shield className="w-4 h-4 mr-2" />
                                Change Role
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleBulkChangeRole("Senior Contributor")}>
                                Senior Contributor
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBulkChangeRole("Editor")}>Editor</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBulkChangeRole("Writer")}>Writer</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleBulkActivate}
                            className="border-green-300 bg-green-50 hover:bg-green-100 text-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Activate
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleBulkSuspend}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Suspend
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Contributors Table */}
                    <div className="border rounded-xl overflow-hidden shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
                            <TableHead className="w-12">
                              <Checkbox
                                checked={
                                  selectedContributors.length === filteredContributors.length &&
                                  filteredContributors.length > 0
                                }
                                onCheckedChange={handleSelectAllContributors}
                              />
                            </TableHead>
                            <TableHead className="font-semibold">Student</TableHead>
                            <TableHead className="font-semibold">Role</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Submitted</TableHead>
                            <TableHead className="font-semibold">Published</TableHead>
                            <TableHead className="font-semibold">Approval Rate</TableHead>
                            <TableHead className="font-semibold">Last Submission</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredContributors.map((contributor) => (
                            <TableRow
                              key={contributor.id}
                              className="hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors"
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedContributors.includes(contributor.id)}
                                  onCheckedChange={(checked) =>
                                    handleSelectContributor(contributor.id, checked as boolean)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={contributor.avatar || "/placeholder.svg"} />
                                    <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{contributor.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {contributor.grade} - {contributor.section}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getRoleBadge(contributor.role)}</TableCell>
                              <TableCell>{getStatusBadgeContributor(contributor.status)}</TableCell>
                              <TableCell>
                                <div className="font-medium">{contributor.articlesSubmitted}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-green-600">{contributor.articlesPublished}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`font-medium ${
                                      contributor.approvalRate >= 80
                                        ? "text-green-600"
                                        : contributor.approvalRate >= 60
                                          ? "text-yellow-600"
                                          : "text-red-600"
                                    }`}
                                  >
                                    {contributor.approvalRate}%
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(contributor.lastSubmission).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => handleChangeRole(contributor)}>
                                      <Shield className="w-4 h-4 mr-2" />
                                      Change Role
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        toast({
                                          title: "View Profile",
                                          description: "Profile view coming soon",
                                        })
                                      }}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleSuspendUser(contributor)}>
                                      {contributor.status === "Active" ? (
                                        <>
                                          <UserMinus className="w-4 h-4 mr-2" />
                                          Suspend User
                                        </>
                                      ) : (
                                        <>
                                          <UserCheck className="w-4 h-4 mr-2" />
                                          Activate User
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600"
                                      onClick={() => handleRemoveContributor(contributor)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Remove
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Activity Feed */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                  <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription className="text-xs">Latest submissions and actions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-4">
                  {activityFeed.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <div className={`rounded-full p-2 ${activity.color} bg-opacity-10`}>
                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.student}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{activity.article}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Top Contributors</CardTitle>
                  <CardDescription className="text-xs">Most active student journalists</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {topContributors.map((contributor, index) => (
                  <div key={contributor.name} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={contributor.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {contributor.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{contributor.grade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{contributor.published}</p>
                      <p className="text-xs text-muted-foreground">published</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve "{selectedArticleForAction?.title}"? The article will be marked as
              approved and ready to publish.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApprove} className="bg-green-500 hover:bg-green-600">
              <ThumbsUp className="w-4 h-4 mr-2" />
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Article</DialogTitle>
            <DialogDescription>
              Provide feedback to {selectedArticleForAction?.author} about why this article needs revision.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-feedback">Feedback (Required)</Label>
              <Textarea
                id="reject-feedback"
                placeholder="Explain what needs to be improved..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmReject}
              disabled={!feedbackText.trim()}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Send Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Revision Dialog */}
      <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
            <DialogDescription>
              Provide constructive feedback to {selectedArticleForAction?.author} about what needs to be improved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="revision-feedback">Feedback (Required)</Label>
              <Textarea
                id="revision-feedback"
                placeholder="Be specific about what needs to be changed..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevisionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmRequestRevision}
              disabled={!feedbackText.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Request Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this article? This action cannot be undone and the article will be
              permanently removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Article Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of this article to {selectedStatus}? This will affect the
              article's visibility and availability.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to publish this article now? It will be immediately visible to all readers based on
              its visibility settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmPublish(false)} className="bg-green-500 hover:bg-green-600">
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Warning Dialog for Pending Review Status */}
      <AlertDialog open={publishWarningDialogOpen} onOpenChange={setPublishWarningDialogOpen}>
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
              onClick={() => confirmPublish(true)}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Approve & Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unpublish Confirmation Dialog */}
      <AlertDialog open={unpublishDialogOpen} onOpenChange={setUnpublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unpublish this article? It will be moved to drafts and will no longer be visible
              to readers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnpublish}>Unpublish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Articles</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedArticles.length} article{selectedArticles.length > 1 ? "s" : ""}?
              This action cannot be undone and the articles will be permanently removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} className="bg-red-500 hover:bg-red-600">
              Delete {selectedArticles.length} Article{selectedArticles.length > 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Contributor Dialog */}
      <Dialog open={addContributorDialogOpen} onOpenChange={setAddContributorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contributor</DialogTitle>
            <DialogDescription>
              Send an invitation to a student to become a contributor. They will receive submission privileges.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contributor-email">Student Email</Label>
              <Input
                id="contributor-email"
                type="email"
                placeholder="student@southville8b.edu"
                value={newContributorEmail}
                onChange={(e) => setNewContributorEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contributor-role">Initial Role</Label>
              <Select value={newContributorRole} onValueChange={setNewContributorRole}>
                <SelectTrigger id="contributor-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Writer">Writer</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Senior Contributor">Senior Contributor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddContributorDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddContributor} disabled={!newContributorEmail.trim()}>
              <UserPlus className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={changeRoleDialogOpen} onOpenChange={setChangeRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Contributor Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedContributor?.name}. This will affect their permissions and responsibilities.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-role">New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger id="new-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Writer">Writer</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Senior Contributor">Senior Contributor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Role Descriptions:</p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>
                  • <strong>Writer:</strong> Can submit articles, requires approval
                </li>
                <li>
                  • <strong>Editor:</strong> Can submit and edit others' drafts
                </li>
                <li>
                  • <strong>Senior Contributor:</strong> Auto-approved articles
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmChangeRole}>
              <Shield className="w-4 h-4 mr-2" />
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend/Activate User Dialog */}
      <AlertDialog open={suspendUserDialogOpen} onOpenChange={setSuspendUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedContributor?.status === "Active" ? "Suspend User" : "Activate User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedContributor?.status === "Active"
                ? `Are you sure you want to suspend ${selectedContributor?.name}? They will no longer be able to submit articles.`
                : `Are you sure you want to activate ${selectedContributor?.name}? They will regain submission privileges.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSuspendUser}
              className={selectedContributor?.status === "Active" ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {selectedContributor?.status === "Active" ? "Suspend" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Contributor Dialog */}
      <AlertDialog open={removeContributorDialogOpen} onOpenChange={setRemoveContributorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Contributor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedContributor?.name} from contributors? This action cannot be
              undone and they will lose all submission privileges.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveContributor} className="bg-red-500 hover:bg-red-600">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {contextMenu.visible && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={closeContextMenu} />

          {/* Context Menu */}
          <div
            className="fixed z-50 min-w-[240px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1.5 space-y-0.5">
              {/* View Article */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  handleViewArticle(contextMenu.article.id)
                  closeContextMenu()
                }}
              >
                <Eye className="w-4 h-4 text-blue-600" />
                <span>View Article</span>
              </button>

              {/* Preview Article */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handlePreview(contextMenu.article)}
              >
                <Eye className="w-4 h-4 text-purple-600" />
                <span>Preview</span>
              </button>

              {/* Edit Article */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  handleEditArticle(contextMenu.article.id)
                  closeContextMenu()
                }}
              >
                <Edit className="w-4 h-4 text-green-600" />
                <span>Edit Article</span>
              </button>

              {/* Duplicate Article */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  handleDuplicate(contextMenu.article.id)
                  closeContextMenu()
                }}
              >
                <Copy className="w-4 h-4 text-purple-600" />
                <span>Duplicate Article</span>
              </button>

              <div className="h-px bg-border my-1" />

              {/* Change Status - Submenu */}
              <div
                className="relative"
                onMouseEnter={() => setContextMenu((prev) => ({ ...prev, submenu: "status" }))}
                onMouseLeave={() => setContextMenu((prev) => ({ ...prev, submenu: null }))}
              >
                <button className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Change Status</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Status Submenu */}
                {contextMenu.submenu === "status" && (
                  <div className="absolute left-full top-0 ml-1 min-w-[180px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 p-1.5 space-y-0.5">
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.article?.status === "Draft" ? "bg-gray-500/10" : ""
                      }`}
                      onClick={() => {
                        handleChangeStatus(contextMenu.article.id, "Draft")
                        closeContextMenu()
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span>Draft</span>
                      </div>
                      {contextMenu.article?.status === "Draft" && <Check className="w-4 h-4 text-gray-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.article?.status === "Published" ? "bg-green-500/10" : ""
                      }`}
                      onClick={() => {
                        handleChangeStatus(contextMenu.article.id, "Published")
                        closeContextMenu()
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Published</span>
                      </div>
                      {contextMenu.article?.status === "Published" && <Check className="w-4 h-4 text-green-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.article?.status === "Scheduled" ? "bg-blue-500/10" : ""
                      }`}
                      onClick={() => {
                        handleChangeStatus(contextMenu.article.id, "Scheduled")
                        closeContextMenu()
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Scheduled</span>
                      </div>
                      {contextMenu.article?.status === "Scheduled" && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.article?.status === "Archived" ? "bg-orange-500/10" : ""
                      }`}
                      onClick={() => {
                        handleChangeStatus(contextMenu.article.id, "Archived")
                        closeContextMenu()
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Archive className="w-4 h-4 text-orange-600" />
                        <span>Archived</span>
                      </div>
                      {contextMenu.article?.status === "Archived" && <Check className="w-4 h-4 text-orange-600" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Publish/Unpublish */}
              {contextMenu.article?.status !== "Published" ? (
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                  onClick={() => {
                    handlePublishNow(contextMenu.article.id)
                    closeContextMenu()
                  }}
                >
                  <Send className="w-4 h-4 text-green-600" />
                  <span>Publish Now</span>
                </button>
              ) : (
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                  onClick={() => {
                    handleUnpublish(contextMenu.article.id)
                    closeContextMenu()
                  }}
                >
                  <XCircle className="w-4 h-4 text-orange-600" />
                  <span>Unpublish</span>
                </button>
              )}

              <div className="h-px bg-border my-1" />

              {/* Toggle Featured */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  handleFeatureToggle(contextMenu.article.id)
                  closeContextMenu()
                }}
              >
                {contextMenu.article?.featured ? (
                  <>
                    <StarOff className="w-4 h-4 text-gray-600" />
                    <span>Remove from Featured</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span>Add to Featured</span>
                  </>
                )}
              </button>

              {/* Copy Link */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleCopyLink(contextMenu.article)}
              >
                <Link2 className="w-4 h-4 text-purple-600" />
                <span>Copy Link</span>
              </button>

              {/* Request Review */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleRequestReview(contextMenu.article)}
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Request Review</span>
              </button>

              {/* Add Comment */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  toast({
                    title: "Add Comment",
                    description: "Comment feature coming soon",
                    duration: 2000,
                  })
                  closeContextMenu()
                }}
              >
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Add Comment</span>
              </button>

              {contextMenu.article.status === "Draft" && (
                <>
                  <div className="h-px bg-border my-1" />

                  {/* Delete Article - Only for Draft articles */}
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition-colors text-left"
                    onClick={() => {
                      handleDeleteClick(contextMenu.article.id)
                      closeContextMenu()
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Article</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
