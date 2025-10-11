"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  TrendingUp,
  FileText,
  Globe,
  Users,
  Clock,
  CheckCircle,
  Copy,
  Star,
  BarChart3,
  Link2,
  ChevronRightIcon,
  Check,
  AlertTriangle,
  Archive,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react"

// Mock data for news articles
const mockNewsArticles = [
  {
    id: "1",
    title: "Annual Science Fair Winners Announced",
    author: "Dr. Maria Santos",
    category: "Academic",
    status: "Published",
    publishedDate: "2024-01-15",
    views: 1250,
    excerpt: "Congratulations to all participants in this year's science fair competition...",
    featured: true,
    visibility: "Public",
  },
  {
    id: "2",
    title: "Basketball Team Advances to Regional Finals",
    author: "Coach Rodriguez",
    category: "Sports",
    status: "Published",
    publishedDate: "2024-01-14",
    views: 890,
    excerpt: "Our varsity basketball team secured their spot in the regional finals...",
    featured: false,
    visibility: "Public",
  },
  {
    id: "3",
    title: "New Library Hours Effective Next Week",
    author: "Admin Office",
    category: "Announcements",
    status: "Scheduled",
    publishedDate: "2024-01-20",
    views: 0,
    excerpt: "Please note the updated library operating hours starting January 22nd...",
    featured: false,
    visibility: "Students Only",
  },
  {
    id: "4",
    title: "Teacher Professional Development Workshop",
    author: "HR Department",
    category: "Events",
    status: "Draft",
    publishedDate: "",
    views: 0,
    excerpt: "Join us for a comprehensive workshop on modern teaching methodologies...",
    featured: false,
    visibility: "Teachers Only",
  },
  {
    id: "5",
    title: "Student Council Election Results",
    author: "Student Affairs",
    category: "Student Life",
    status: "Published",
    publishedDate: "2024-01-12",
    views: 2100,
    excerpt: "The results of the student council elections are now official...",
    featured: true,
    visibility: "Public",
  },
]

const mockArchivedArticles = [
  {
    id: "archived-1",
    title: "Outdated School Policy Announcement",
    author: "Admin Office",
    category: "Announcements",
    status: "Published",
    publishedDate: "2023-06-15",
    views: 450,
    excerpt: "This policy has been superseded by new regulations...",
    featured: false,
    visibility: "Public",
    deletedDate: "2024-01-10",
    deletedBy: "John Admin",
    deletionReason: "Outdated information",
  },
  {
    id: "archived-2",
    title: "Last Year's Sports Day Highlights",
    author: "Coach Martinez",
    category: "Sports",
    status: "Published",
    publishedDate: "2023-05-20",
    views: 1200,
    excerpt: "Recap of the amazing sports day event from last year...",
    featured: false,
    visibility: "Public",
    deletedDate: "2024-01-08",
    deletedBy: "Sarah Superadmin",
    deletionReason: "Archived for historical purposes",
  },
  {
    id: "archived-3",
    title: "Cancelled Event Notice",
    author: "Events Team",
    category: "Events",
    status: "Draft",
    publishedDate: "",
    views: 0,
    excerpt: "This event was cancelled due to unforeseen circumstances...",
    featured: false,
    visibility: "Students Only",
    deletedDate: "2024-01-05",
    deletedBy: "John Admin",
    deletionReason: "Event cancelled",
  },
]

const NewsPage = () => {
  const { toast } = useToast()
  const router = useRouter()
  const [articles, setArticles] = useState(mockNewsArticles)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [visibilityFilter, setVisibilityFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])

  const [archivedArticles, setArchivedArticles] = useState(mockArchivedArticles)
  const [showArchivedSection, setShowArchivedSection] = useState(false)
  const [archivedSearchTerm, setArchivedSearchTerm] = useState("")
  const [archivedCategoryFilter, setArchivedCategoryFilter] = useState("all")
  const [archivedCurrentPage, setArchivedCurrentPage] = useState(1)
  const [archivedItemsPerPage, setArchivedItemsPerPage] = useState(10)
  const [selectedArchivedArticles, setSelectedArchivedArticles] = useState<string[]>([])
  const [restoreConfirmation, setRestoreConfirmation] = useState<{
    isOpen: boolean
    article: any
  }>({ isOpen: false, article: null })
  const [permanentDeleteConfirmation, setPermanentDeleteConfirmation] = useState<{
    isOpen: boolean
    article: any
  }>({ isOpen: false, article: null })

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

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    article: any
  }>({ isOpen: false, article: null })

  const [statusConfirmation, setStatusConfirmation] = useState<{
    isOpen: boolean
    article: any
    newStatus: string
  }>({ isOpen: false, article: null, newStatus: "" })

  const [visibilityConfirmation, setVisibilityConfirmation] = useState<{
    isOpen: boolean
    article: any
    newVisibility: string
  }>({ isOpen: false, article: null, newVisibility: "" })

  const [featuredConfirmation, setFeaturedConfirmation] = useState<{
    isOpen: boolean
    article: any
  }>({ isOpen: false, article: null })

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || article.category.toLowerCase() === categoryFilter
    const matchesStatus = statusFilter === "all" || article.status.toLowerCase() === statusFilter
    const matchesVisibility =
      visibilityFilter === "all" || article.visibility.toLowerCase().includes(visibilityFilter.toLowerCase())

    return matchesSearch && matchesCategory && matchesStatus && matchesVisibility
  })

  const filteredArchivedArticles = archivedArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(archivedSearchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(archivedSearchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(archivedSearchTerm.toLowerCase()) ||
      article.deletionReason?.toLowerCase().includes(archivedSearchTerm.toLowerCase())
    const matchesCategory =
      archivedCategoryFilter === "all" || article.category.toLowerCase() === archivedCategoryFilter

    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

  const archivedTotalPages = Math.ceil(filteredArchivedArticles.length / archivedItemsPerPage)
  const archivedStartIndex = (archivedCurrentPage - 1) * archivedItemsPerPage
  const archivedEndIndex = archivedStartIndex + archivedItemsPerPage
  const paginatedArchivedArticles = filteredArchivedArticles.slice(archivedStartIndex, archivedEndIndex)

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1)
    switch (filterType) {
      case "category":
        setCategoryFilter(value)
        break
      case "status":
        setStatusFilter(value)
        break
      case "visibility":
        setVisibilityFilter(value)
        break
    }
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

  const handleSelectAllArchived = (checked: boolean) => {
    if (checked) {
      setSelectedArchivedArticles(paginatedArchivedArticles.map((article) => article.id))
    } else {
      setSelectedArchivedArticles([])
    }
  }

  const handleSelectArchivedArticle = (articleId: string, checked: boolean) => {
    if (checked) {
      setSelectedArchivedArticles((prev) => [...prev, articleId])
    } else {
      setSelectedArchivedArticles((prev) => prev.filter((id) => id !== articleId))
    }
  }

  const getStatusBadge = (status: string, article?: any) => {
    const badge = (() => {
      switch (status) {
        case "Published":
          return (
            <Badge className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Published
            </Badge>
          )
        case "Draft":
          return (
            <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20">
              <FileText className="w-3 h-3 mr-1" />
              Draft
            </Badge>
          )
        case "Scheduled":
          return (
            <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20">
              <Clock className="w-3 h-3 mr-1" />
              Scheduled
            </Badge>
          )
        default:
          return (
            <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20">{status}</Badge>
          )
      }
    })()

    // If article is provided, wrap in dropdown
    if (article) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
              {badge}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-card border-border w-[180px]">
            <DropdownMenuItem
              className={`text-foreground ${status === "Published" ? "bg-green-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(article, "Published")
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              <span className="flex-1">Published</span>
              {status === "Published" && <Check className="w-4 h-4 text-green-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${status === "Draft" ? "bg-gray-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(article, "Draft")
              }}
            >
              <FileText className="w-4 h-4 mr-2 text-gray-600" />
              <span className="flex-1">Draft</span>
              {status === "Draft" && <Check className="w-4 h-4 text-gray-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${status === "Scheduled" ? "bg-blue-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(article, "Scheduled")
              }}
            >
              <Clock className="w-4 h-4 mr-2 text-blue-600" />
              <span className="flex-1">Scheduled</span>
              {status === "Scheduled" && <Check className="w-4 h-4 text-blue-600" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return badge
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      Academic: "bg-purple-500/10 text-purple-700 border-purple-500/20 hover:bg-purple-500/20",
      Sports: "bg-orange-500/10 text-orange-700 border-orange-500/20 hover:bg-orange-500/20",
      Announcements: "bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20",
      Events: "bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20",
      "Student Life": "bg-pink-500/10 text-pink-700 border-pink-500/20 hover:bg-pink-500/20",
    }

    return (
      <Badge
        className={
          colors[category as keyof typeof colors] ||
          "bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20"
        }
      >
        {category}
      </Badge>
    )
  }

  const getVisibilityBadge = (visibility: string, article?: any) => {
    if (article && article.status === "Draft") {
      return <span className="text-muted-foreground text-sm">—</span>
    }

    const badge = (() => {
      switch (visibility) {
        case "Public":
          return (
            <Badge className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20">
              <Globe className="w-3 h-3 mr-1" />
              Public
            </Badge>
          )
        case "Students Only":
          return (
            <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20">
              <Users className="w-3 h-3 mr-1" />
              Students
            </Badge>
          )
        case "Teachers Only":
          return (
            <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20 hover:bg-purple-500/20">
              <Users className="w-3 h-3 mr-1" />
              Teachers
            </Badge>
          )
        default:
          return (
            <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20">{visibility}</Badge>
          )
      }
    })()

    // If article is provided, wrap in dropdown
    if (article) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
              {badge}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-card border-border w-[180px]">
            <DropdownMenuItem
              className={`text-foreground ${visibility === "Public" ? "bg-green-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleVisibilityChange(article, "Public")
              }}
            >
              <Globe className="w-4 h-4 mr-2 text-green-600" />
              <span className="flex-1">Public</span>
              {visibility === "Public" && <Check className="w-4 h-4 text-green-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${visibility === "Students Only" ? "bg-blue-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleVisibilityChange(article, "Students Only")
              }}
            >
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              <span className="flex-1">Students Only</span>
              {visibility === "Students Only" && <Check className="w-4 h-4 text-blue-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${visibility === "Teachers Only" ? "bg-purple-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleVisibilityChange(article, "Teachers Only")
              }}
            >
              <Users className="w-4 h-4 mr-2 text-purple-600" />
              <span className="flex-1">Teachers Only</span>
              {visibility === "Teachers Only" && <Check className="w-4 h-4 text-purple-600" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return badge
  }

  const handleViewArticle = (article: any) => {
    toast({
      title: "📖 Article Preview",
      description: `Opening preview for "${article.title}"`,
      duration: 3000,
    })
  }

  const handleEditArticle = (article: any) => {
    router.push(`/superadmin/news/edit/${article.id}`)
  }

  const handleDeleteArticle = (article: any) => {
    setDeleteConfirmation({ isOpen: true, article })
    closeContextMenu()
  }

  const handleCreateArticle = () => {
    router.push("/superadmin/news/create")
  }

  const handleContextMenu = (e: React.MouseEvent, article: any) => {
    e.preventDefault()
    e.stopPropagation()

    const x = e.clientX
    const y = e.clientY

    // Adjust position if menu would go off screen
    const menuWidth = 240
    const menuHeight = 400
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

  const confirmDeleteArticle = () => {
    if (deleteConfirmation.article) {
      const articleToArchive = {
        ...deleteConfirmation.article,
        deletedDate: new Date().toISOString().split("T")[0],
        deletedBy: "Current Admin",
        deletionReason: "Archived by admin",
      }

      setArchivedArticles((prev) => [articleToArchive, ...prev])
      setArticles((prev) => prev.filter((a) => a.id !== deleteConfirmation.article.id))

      toast({
        title: "✅ Article Archived Successfully",
        description: (
          <div className="space-y-2">
            <p className="font-medium text-foreground">
              {deleteConfirmation.article.title} has been moved to archived articles.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center text-white text-xs font-bold">
                <Archive className="w-3 h-3" />
              </div>
              <span>{deleteConfirmation.article.author}</span>
              <span>•</span>
              <span>{deleteConfirmation.article.category}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-md w-fit">
              <CheckCircle className="w-3 h-3" />
              <span>Article can be restored from archived section</span>
            </div>
          </div>
        ),
        variant: "default",
        duration: 6000,
        className: "border-green-500/20 bg-green-500/5 backdrop-blur-md",
      })

      setDeleteConfirmation({ isOpen: false, article: null })
    }
  }

  const handleRestoreArticle = (article: any) => {
    setRestoreConfirmation({ isOpen: true, article })
  }

  const confirmRestoreArticle = () => {
    if (restoreConfirmation.article) {
      const { deletedDate, deletedBy, deletionReason, ...restoredArticle } = restoreConfirmation.article

      setArticles((prev) => [restoredArticle, ...prev])
      setArchivedArticles((prev) => prev.filter((a) => a.id !== restoreConfirmation.article.id))

      toast({
        title: "✅ Article Restored Successfully",
        description: (
          <div className="space-y-2">
            <p className="font-medium text-foreground">{restoreConfirmation.article.title} has been restored.</p>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-md w-fit">
              <RotateCcw className="w-3 h-3" />
              <span>Article is now active again</span>
            </div>
          </div>
        ),
        variant: "default",
        duration: 4000,
        className: "border-green-500/20 bg-green-500/5 backdrop-blur-md",
      })

      setRestoreConfirmation({ isOpen: false, article: null })
    }
  }

  const handlePermanentDeleteArticle = (article: any) => {
    setPermanentDeleteConfirmation({ isOpen: true, article })
  }

  const confirmPermanentDeleteArticle = () => {
    if (permanentDeleteConfirmation.article) {
      setArchivedArticles((prev) => prev.filter((a) => a.id !== permanentDeleteConfirmation.article.id))

      toast({
        title: "✅ Article Permanently Deleted",
        description: (
          <div className="space-y-2">
            <p className="font-medium text-foreground">
              {permanentDeleteConfirmation.article.title} has been permanently removed.
            </p>
            <div className="flex items-center gap-1 text-xs text-red-600 bg-red-500/10 px-2 py-1 rounded-md w-fit">
              <AlertTriangle className="w-3 h-3" />
              <span>This action cannot be undone</span>
            </div>
          </div>
        ),
        variant: "default",
        duration: 4000,
        className: "border-red-500/20 bg-red-500/5 backdrop-blur-md",
      })

      setPermanentDeleteConfirmation({ isOpen: false, article: null })
    }
  }

  const handleStatusChange = (article: any, newStatus: string) => {
    setStatusConfirmation({ isOpen: true, article, newStatus })
    closeContextMenu()
  }

  const confirmStatusChange = () => {
    if (statusConfirmation.article) {
      setArticles((prev) =>
        prev.map((a) => (a.id === statusConfirmation.article.id ? { ...a, status: statusConfirmation.newStatus } : a)),
      )

      toast({
        title: `✅ Status Updated`,
        description: (
          <div className="space-y-2">
            <p className="font-medium">Article status changed successfully</p>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10">
                <FileText className="w-3.5 h-3.5" />
                <span className="font-medium">{statusConfirmation.article.title}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">New status:</span>
              <div className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-700 font-medium">
                {statusConfirmation.newStatus}
              </div>
            </div>
            {statusConfirmation.newStatus === "Draft" && (
              <div className="text-xs text-muted-foreground italic">
                Note: Visibility settings don't apply to draft articles
              </div>
            )}
          </div>
        ),
        className: "border-green-500/20 bg-green-50/50 dark:bg-green-950/20 backdrop-blur-sm",
        duration: 4000,
      })

      setStatusConfirmation({ isOpen: false, article: null, newStatus: "" })
    }
  }

  const handleVisibilityChange = (article: any, newVisibility: string) => {
    setVisibilityConfirmation({ isOpen: true, article, newVisibility })
    closeContextMenu()
  }

  const confirmVisibilityChange = () => {
    if (visibilityConfirmation.article) {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === visibilityConfirmation.article.id ? { ...a, visibility: visibilityConfirmation.newVisibility } : a,
        ),
      )

      toast({
        title: `✅ Visibility Updated`,
        description: (
          <div className="space-y-2">
            <p className="font-medium">Article visibility changed successfully</p>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10">
                <FileText className="w-3.5 h-3.5" />
                <span className="font-medium">{visibilityConfirmation.article.title}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">New visibility:</span>
              <div className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 font-medium">
                {visibilityConfirmation.newVisibility}
              </div>
            </div>
          </div>
        ),
        className: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm",
        duration: 4000,
      })

      setVisibilityConfirmation({ isOpen: false, article: null, newVisibility: "" })
    }
  }

  const handleToggleFeatured = (article: any) => {
    setFeaturedConfirmation({ isOpen: true, article })
    closeContextMenu()
  }

  const confirmToggleFeatured = () => {
    if (featuredConfirmation.article) {
      setArticles((prev) =>
        prev.map((a) => (a.id === featuredConfirmation.article.id ? { ...a, featured: !a.featured } : a)),
      )

      toast({
        title: featuredConfirmation.article.featured ? `⭐ Removed from Featured` : `⭐ Added to Featured`,
        description: (
          <div className="space-y-2">
            <p className="font-medium">
              {featuredConfirmation.article.featured
                ? "Article removed from featured section"
                : "Article added to featured section"}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10">
                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium">{featuredConfirmation.article.title}</span>
              </div>
            </div>
          </div>
        ),
        className: "border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-950/20 backdrop-blur-sm",
        duration: 4000,
      })

      setFeaturedConfirmation({ isOpen: false, article: null })
    }
  }

  const handleDuplicateArticle = (article: any) => {
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
      title: `📋 Article Duplicated`,
      description: (
        <div className="space-y-2">
          <p className="font-medium">Article copied successfully</p>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 max-w-full overflow-hidden">
              <FileText className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium">{newArticle.title}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">The duplicate has been saved as a draft</div>
        </div>
      ),
      className: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm",
      duration: 4000,
    })

    closeContextMenu()
  }

  const handleCopyLink = (article: any) => {
    const link = `${window.location.origin}/news/${article.id}`
    navigator.clipboard.writeText(link)

    toast({
      title: `🔗 Link Copied`,
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

  const handleViewAnalytics = (article: any) => {
    toast({
      title: `📊 Article Analytics`,
      description: (
        <div className="space-y-2">
          <p className="font-medium">{article.title}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10">
              <Eye className="w-3.5 h-3.5" />
              <span>{article.views} views</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12% this week</span>
            </div>
          </div>
        </div>
      ),
      className: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm",
      duration: 5000,
    })

    closeContextMenu()
  }

  useState(() => {
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
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">School News Management</h1>
          <p className="text-muted-foreground">Create, manage, and publish school news articles and updates</p>
        </div>
        <Button onClick={handleCreateArticle} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Article
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
                <p className="text-2xl font-bold text-foreground">{articles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-foreground">
                  {articles.filter((a) => a.status === "Published").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-foreground">
                  {articles.filter((a) => a.status === "Scheduled").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-foreground">
                  {articles.reduce((sum, a) => sum + a.views, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Article Management</CardTitle>
          <CardDescription className="text-muted-foreground">
            Search, filter, and manage news articles across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search articles by title, author, or content..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={(value) => handleFilterChange("category", value)}>
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="announcements">Announcements</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="student life">Student Life</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={visibilityFilter} onValueChange={(value) => handleFilterChange("visibility", value)}>
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by visibility" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Visibility</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="students">Students Only</SelectItem>
                <SelectItem value="teachers">Teachers Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[100px] bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredArticles.length)} of {filteredArticles.length}{" "}
              articles
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedArticles.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <span className="text-sm text-foreground">
                {selectedArticles.length} article{selectedArticles.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" className="border-border bg-transparent">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Publish
                </Button>
                <Button size="sm" variant="outline" className="border-border bg-transparent">
                  <FileText className="w-4 h-4 mr-2" />
                  Draft
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Articles Table */}
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedArticles.length === paginatedArticles.length && paginatedArticles.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-foreground">Article</TableHead>
                  <TableHead className="text-foreground">Author</TableHead>
                  <TableHead className="text-foreground">Category</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Visibility</TableHead>
                  <TableHead className="text-foreground">Published</TableHead>
                  <TableHead className="text-foreground">Views</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedArticles.map((article) => (
                  <TableRow
                    key={article.id}
                    className="border-border cursor-pointer hover:bg-muted/50"
                    onContextMenu={(e) => handleContextMenu(e, article)}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedArticles.includes(article.id)}
                        onCheckedChange={(checked) => handleSelectArticle(article.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <div className="flex items-center">
                          <div className="font-medium text-foreground">{article.title}</div>
                          {article.featured && (
                            <Badge className="ml-2 bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.excerpt}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{article.author}</TableCell>
                    <TableCell>{getCategoryBadge(article.category)}</TableCell>
                    <TableCell>{getStatusBadge(article.status, article)}</TableCell>
                    <TableCell>{getVisibilityBadge(article.visibility, article)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {article.publishedDate ? (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(article.publishedDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {article.views.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem className="text-foreground" onClick={() => handleViewArticle(article)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Article
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-foreground" onClick={() => handleEditArticle(article)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Article
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteArticle(article)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Article
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({filteredArticles.length} total articles)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="border-border bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "" : "border-border bg-transparent"}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className={currentPage === totalPages ? "" : "border-border bg-transparent"}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="border-border bg-transparent"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Archive className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-foreground flex items-center gap-2">
                  Archived Articles
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-500/20">
                    {archivedArticles.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage archived articles - restore or permanently delete
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchivedSection(!showArchivedSection)}
              className="border-border"
            >
              {showArchivedSection ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Hide Archived
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show Archived
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {showArchivedSection && (
          <CardContent className="space-y-4">
            {/* Info Notice */}
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-700 dark:text-orange-400">
                  <p className="font-medium mb-1">Archived Articles Policy</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Archived articles are hidden from public view but can be restored</li>
                    <li>• Articles are automatically permanently deleted after 90 days</li>
                    <li>• You can manually restore or permanently delete articles at any time</li>
                    <li>• Permanent deletion cannot be undone</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search archived articles..."
                    value={archivedSearchTerm}
                    onChange={(e) => {
                      setArchivedSearchTerm(e.target.value)
                      setArchivedCurrentPage(1)
                    }}
                    className="pl-10 bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <Select
                value={archivedCategoryFilter}
                onValueChange={(value) => {
                  setArchivedCategoryFilter(value)
                  setArchivedCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="announcements">Announcements</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="student life">Student Life</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select
                  value={archivedItemsPerPage.toString()}
                  onValueChange={(value) => {
                    setArchivedItemsPerPage(Number(value))
                    setArchivedCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[100px] bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">entries</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {archivedStartIndex + 1} to {Math.min(archivedEndIndex, filteredArchivedArticles.length)} of{" "}
                {filteredArchivedArticles.length} archived articles
              </div>
            </div>

            {/* Bulk Actions for Archived */}
            {selectedArchivedArticles.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                <span className="text-sm text-foreground">
                  {selectedArchivedArticles.length} archived article{selectedArchivedArticles.length > 1 ? "s" : ""}{" "}
                  selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" className="border-green-500/20 bg-green-500/5 text-green-700">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore Selected
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Permanently Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Archived Articles Table */}
            <div className="border border-border rounded-lg opacity-70">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedArchivedArticles.length === paginatedArchivedArticles.length &&
                          paginatedArchivedArticles.length > 0
                        }
                        onCheckedChange={handleSelectAllArchived}
                      />
                    </TableHead>
                    <TableHead className="text-foreground">Article</TableHead>
                    <TableHead className="text-foreground">Author</TableHead>
                    <TableHead className="text-foreground">Category</TableHead>
                    <TableHead className="text-foreground">Deleted Date</TableHead>
                    <TableHead className="text-foreground">Deleted By</TableHead>
                    <TableHead className="text-foreground">Reason</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedArchivedArticles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        <Archive className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No archived articles found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedArchivedArticles.map((article) => (
                      <TableRow key={article.id} className="border-border hover:bg-muted/30">
                        <TableCell>
                          <Checkbox
                            checked={selectedArchivedArticles.includes(article.id)}
                            onCheckedChange={(checked) => handleSelectArchivedArticle(article.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <div className="font-medium text-foreground">{article.title}</div>
                            <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{article.excerpt}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">{article.author}</TableCell>
                        <TableCell>{getCategoryBadge(article.category)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(article.deletedDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{article.deletedBy}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{article.deletionReason}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem className="text-foreground" onClick={() => handleViewArticle(article)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() => handleRestoreArticle(article)}
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Restore Article
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => handlePermanentDeleteArticle(article)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Permanently Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Archived Pagination */}
            {filteredArchivedArticles.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {archivedCurrentPage} of {archivedTotalPages} ({filteredArchivedArticles.length} archived
                  articles)
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={archivedCurrentPage === 1}
                    onClick={() => setArchivedCurrentPage(archivedCurrentPage - 1)}
                    className="border-border bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, archivedTotalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <Button
                          key={pageNum}
                          variant={archivedCurrentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setArchivedCurrentPage(pageNum)}
                          className={archivedCurrentPage === pageNum ? "" : "border-border bg-transparent"}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    {archivedTotalPages > 5 && (
                      <>
                        <span className="text-muted-foreground">...</span>
                        <Button
                          variant={archivedCurrentPage === archivedTotalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => setArchivedCurrentPage(archivedTotalPages)}
                          className={archivedCurrentPage === archivedTotalPages ? "" : "border-border bg-transparent"}
                        >
                          {archivedTotalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={archivedCurrentPage === archivedTotalPages}
                    onClick={() => setArchivedCurrentPage(archivedCurrentPage + 1)}
                    className="border-border bg-transparent"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

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
                  handleViewArticle(contextMenu.article)
                  closeContextMenu()
                }}
              >
                <Eye className="w-4 h-4 text-blue-600" />
                <span>View Article</span>
              </button>

              {/* Edit Article */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  handleEditArticle(contextMenu.article)
                  closeContextMenu()
                }}
              >
                <Edit className="w-4 h-4 text-green-600" />
                <span>Edit Article</span>
              </button>

              {/* Duplicate Article */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleDuplicateArticle(contextMenu.article)}
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
                        contextMenu.article?.status === "Published" ? "bg-green-500/10" : ""
                      }`}
                      onClick={() => handleStatusChange(contextMenu.article, "Published")}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Published</span>
                      </div>
                      {contextMenu.article?.status === "Published" && <Check className="w-4 h-4 text-green-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.article?.status === "Draft" ? "bg-gray-500/10" : ""
                      }`}
                      onClick={() => handleStatusChange(contextMenu.article, "Draft")}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span>Draft</span>
                      </div>
                      {contextMenu.article?.status === "Draft" && <Check className="w-4 h-4 text-gray-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.article?.status === "Scheduled" ? "bg-blue-500/10" : ""
                      }`}
                      onClick={() => handleStatusChange(contextMenu.article, "Scheduled")}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Scheduled</span>
                      </div>
                      {contextMenu.article?.status === "Scheduled" && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Change Visibility - Submenu */}
              {contextMenu.article?.status !== "Draft" && (
                <div
                  className="relative"
                  onMouseEnter={() => setContextMenu((prev) => ({ ...prev, submenu: "visibility" }))}
                  onMouseLeave={() => setContextMenu((prev) => ({ ...prev, submenu: null }))}
                >
                  <button className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Change Visibility</span>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {/* Visibility Submenu */}
                  {contextMenu.submenu === "visibility" && (
                    <div className="absolute left-full top-0 ml-1 min-w-[180px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 p-1.5 space-y-0.5">
                      <button
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                          contextMenu.article?.visibility === "Public" ? "bg-green-500/10" : ""
                        }`}
                        onClick={() => handleVisibilityChange(contextMenu.article, "Public")}
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-green-600" />
                          <span>Public</span>
                        </div>
                        {contextMenu.article?.visibility === "Public" && <Check className="w-4 h-4 text-green-600" />}
                      </button>
                      <button
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                          contextMenu.article?.visibility === "Students Only" ? "bg-blue-500/10" : ""
                        }`}
                        onClick={() => handleVisibilityChange(contextMenu.article, "Students Only")}
                      >
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span>Students Only</span>
                        </div>
                        {contextMenu.article?.visibility === "Students Only" && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                      <button
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                          contextMenu.article?.visibility === "Teachers Only" ? "bg-purple-500/10" : ""
                        }`}
                        onClick={() => handleVisibilityChange(contextMenu.article, "Teachers Only")}
                      >
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span>Teachers Only</span>
                        </div>
                        {contextMenu.article?.visibility === "Teachers Only" && (
                          <Check className="w-4 h-4 text-purple-600" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="h-px bg-border my-1" />

              {/* Toggle Featured */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleToggleFeatured(contextMenu.article)}
              >
                <Star
                  className={`w-4 h-4 ${contextMenu.article?.featured ? "text-yellow-600 fill-yellow-600" : "text-gray-600"}`}
                />
                <span>{contextMenu.article?.featured ? "Remove from Featured" : "Add to Featured"}</span>
              </button>

              {/* Copy Link */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleCopyLink(contextMenu.article)}
              >
                <Link2 className="w-4 h-4 text-purple-600" />
                <span>Copy Link</span>
              </button>

              {/* View Analytics */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleViewAnalytics(contextMenu.article)}
              >
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>View Analytics</span>
              </button>

              <div className="h-px bg-border my-1" />

              {/* Delete Article */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition-colors text-left"
                onClick={() => {
                  handleDeleteArticle(contextMenu.article)
                  closeContextMenu()
                }}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Article</span>
              </button>
            </div>
          </div>
        </>
      )}

      {deleteConfirmation.isOpen && deleteConfirmation.article && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setDeleteConfirmation({ isOpen: false, article: null })}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              style={{
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mr-4">
                    <Archive className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Archive Article</h3>
                    <p className="text-sm text-muted-foreground">Article can be restored later</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Are you sure you want to archive{" "}
                    <span className="font-semibold text-orange-600">{deleteConfirmation.article.title}</span>?
                  </p>

                  {/* Article Info Card */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{deleteConfirmation.article.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">by {deleteConfirmation.article.author}</p>
                        </div>
                        {deleteConfirmation.article.featured && (
                          <Badge className="ml-2 bg-yellow-500/10 text-yellow-700 border-yellow-500/20 flex-shrink-0">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryBadge(deleteConfirmation.article.category)}
                        {getStatusBadge(deleteConfirmation.article.status)}
                        {deleteConfirmation.article.status !== "Draft" &&
                          getVisibilityBadge(deleteConfirmation.article.visibility)}
                      </div>
                      {deleteConfirmation.article.publishedDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Published: {new Date(deleteConfirmation.article.publishedDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span>{deleteConfirmation.article.views.toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-orange-700 dark:text-orange-400">
                        <p className="font-medium mb-1">What happens when you archive:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Article will be moved to archived section</li>
                          <li>• Article will be hidden from public view</li>
                          <li>• You can restore it anytime from archived section</li>
                          <li>• Article will be auto-deleted after 90 days</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmation({ isOpen: false, article: null })}
                    className="border-border bg-transparent hover:bg-muted/50 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDeleteArticle}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Article
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {restoreConfirmation.isOpen && restoreConfirmation.article && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setRestoreConfirmation({ isOpen: false, article: null })}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mr-4">
                    <RotateCcw className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Restore Article</h3>
                    <p className="text-sm text-muted-foreground">Bring article back to active status</p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>
                <div className="space-y-4">
                  <p className="text-foreground">
                    Restore <span className="font-semibold text-green-600">{restoreConfirmation.article.title}</span> to
                    active articles?
                  </p>
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">{restoreConfirmation.article.title}</p>
                      <p className="text-sm text-muted-foreground">by {restoreConfirmation.article.author}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Archive className="w-4 h-4" />
                        <span>Archived: {new Date(restoreConfirmation.article.deletedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setRestoreConfirmation({ isOpen: false, article: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmRestoreArticle}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore Article
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {permanentDeleteConfirmation.isOpen && permanentDeleteConfirmation.article && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setPermanentDeleteConfirmation({ isOpen: false, article: null })}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mr-4">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Permanently Delete Article</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>
                <div className="space-y-4">
                  <p className="text-foreground">
                    Permanently delete{" "}
                    <span className="font-semibold text-red-600">{permanentDeleteConfirmation.article.title}</span>?
                  </p>
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">{permanentDeleteConfirmation.article.title}</p>
                      <p className="text-sm text-muted-foreground">by {permanentDeleteConfirmation.article.author}</p>
                    </div>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700 dark:text-red-400">
                        <p className="font-medium mb-1">Warning: Permanent Action</p>
                        <ul className="space-y-1 text-xs">
                          <li>• All article data will be permanently lost</li>
                          <li>• This action cannot be reversed</li>
                          <li>• Article cannot be restored</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setPermanentDeleteConfirmation({ isOpen: false, article: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmPermanentDeleteArticle}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Permanently Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {statusConfirmation.isOpen && statusConfirmation.article && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setStatusConfirmation({ isOpen: false, article: null, newStatus: "" })}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              style={{
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Change Article Status</h3>
                    <p className="text-sm text-muted-foreground">Confirm status change</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Change status of{" "}
                    <span className="font-semibold text-blue-600">{statusConfirmation.article.title}</span> to{" "}
                    <span className="font-semibold text-green-600">{statusConfirmation.newStatus}</span>?
                  </p>

                  {/* Article Info Card */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{statusConfirmation.article.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">by {statusConfirmation.article.author}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Current status:</span>
                        {getStatusBadge(statusConfirmation.article.status)}
                        <span className="text-muted-foreground">→</span>
                        {getStatusBadge(statusConfirmation.newStatus)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700 dark:text-blue-400">
                        <p className="font-medium mb-1">What will happen:</p>
                        <ul className="space-y-1 text-xs">
                          {statusConfirmation.newStatus === "Published" && (
                            <>
                              <li>• Article will be visible to users based on visibility settings</li>
                              <li>• Article will appear in news listings</li>
                              <li>• Published date will be set to now</li>
                            </>
                          )}
                          {statusConfirmation.newStatus === "Draft" && (
                            <>
                              <li>• Article will be hidden from public view</li>
                              <li>• Visibility settings will not apply</li>
                              <li>• Article can be edited and published later</li>
                            </>
                          )}
                          {statusConfirmation.newStatus === "Scheduled" && (
                            <>
                              <li>• Article will be published at scheduled time</li>
                              <li>• Article is not yet visible to users</li>
                              <li>• You can edit the scheduled date anytime</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setStatusConfirmation({ isOpen: false, article: null, newStatus: "" })}
                    className="border-border bg-transparent hover:bg-muted/50 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmStatusChange}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Change Status
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {visibilityConfirmation.isOpen && visibilityConfirmation.article && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setVisibilityConfirmation({ isOpen: false, article: null, newVisibility: "" })}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              style={{
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mr-4">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Change Article Visibility</h3>
                    <p className="text-sm text-muted-foreground">Confirm visibility change</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Change visibility of{" "}
                    <span className="font-semibold text-purple-600">{visibilityConfirmation.article.title}</span> to{" "}
                    <span className="font-semibold text-blue-600">{visibilityConfirmation.newVisibility}</span>?
                  </p>

                  {/* Article Info Card */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{visibilityConfirmation.article.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">by {visibilityConfirmation.article.author}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Current visibility:</span>
                        {getVisibilityBadge(visibilityConfirmation.article.visibility)}
                        <span className="text-muted-foreground">→</span>
                        {getVisibilityBadge(visibilityConfirmation.newVisibility)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-purple-700 dark:text-purple-400">
                        <p className="font-medium mb-1">Who can see this article:</p>
                        <ul className="space-y-1 text-xs">
                          {visibilityConfirmation.newVisibility === "Public" && (
                            <>
                              <li>• Everyone can view this article</li>
                              <li>• Article appears in public news feed</li>
                              <li>• No login required to read</li>
                            </>
                          )}
                          {visibilityConfirmation.newVisibility === "Students Only" && (
                            <>
                              <li>• Only students can view this article</li>
                              <li>• Students must be logged in</li>
                              <li>• Teachers and admins can also view</li>
                            </>
                          )}
                          {visibilityConfirmation.newVisibility === "Teachers Only" && (
                            <>
                              <li>• Only teachers can view this article</li>
                              <li>• Teachers must be logged in</li>
                              <li>• Admins can also view</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setVisibilityConfirmation({ isOpen: false, article: null, newVisibility: "" })}
                    className="border-border bg-transparent hover:bg-muted/50 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmVisibilityChange}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Change Visibility
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {featuredConfirmation.isOpen && featuredConfirmation.article && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setFeaturedConfirmation({ isOpen: false, article: null })}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              style={{
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mr-4">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {featuredConfirmation.article.featured ? "Remove from Featured" : "Add to Featured"}
                    </h3>
                    <p className="text-sm text-muted-foreground">Confirm featured status change</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    {featuredConfirmation.article.featured ? "Remove" : "Add"}{" "}
                    <span className="font-semibold text-yellow-600">{featuredConfirmation.article.title}</span>{" "}
                    {featuredConfirmation.article.featured ? "from" : "to"} featured articles?
                  </p>

                  {/* Article Info Card */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{featuredConfirmation.article.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">by {featuredConfirmation.article.author}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(featuredConfirmation.article.category)}
                        {getStatusBadge(featuredConfirmation.article.status)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-700 dark:text-yellow-400">
                        <p className="font-medium mb-1">What will happen:</p>
                        <ul className="space-y-1 text-xs">
                          {featuredConfirmation.article.featured ? (
                            <>
                              <li>• Article will be removed from featured section</li>
                              <li>• Article will no longer appear in featured carousel</li>
                              <li>• Article remains published and accessible</li>
                            </>
                          ) : (
                            <>
                              <li>• Article will appear in featured section</li>
                              <li>• Article will be highlighted on homepage</li>
                              <li>• Article gets more visibility to users</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setFeaturedConfirmation({ isOpen: false, article: null })}
                    className="border-border bg-transparent hover:bg-muted/50 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmToggleFeatured}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {featuredConfirmation.article.featured ? "Remove from Featured" : "Add to Featured"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NewsPage
