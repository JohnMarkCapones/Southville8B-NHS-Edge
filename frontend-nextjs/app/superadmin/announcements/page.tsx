"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAnnouncements, useDeleteAnnouncement, useUpdateAnnouncement } from "@/hooks/useAnnouncements"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useBanners, useBannerMutations } from "@/hooks/useBanners"
import type { BannerNotification } from "@/lib/api/types/banners"
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
  Bell,
  Users,
  Clock,
  CheckCircle,
  Copy,
  Pin,
  BarChart3,
  Send,
  ChevronRightIcon,
  Check,
  AlertTriangle,
  AlertCircle,
  FileText,
  Mail,
  MessageSquare,
  Paperclip,
  X,
  TrendingUp,
  Megaphone,
  Info,
  Award,
  Wrench,
  CloudRain,
  PartyPopper,
  LinkIcon,
  Power,
  PowerOff,
} from "lucide-react"

// Mock data for announcements
const mockAnnouncements = [
  {
    id: "1",
    title: "School Closure Due to Weather",
    content: "Due to severe weather conditions, the school will be closed tomorrow...",
    author: "Admin Office",
    category: "Emergency",
    priority: "Urgent",
    status: "Published",
    publishedDate: "2024-01-15T08:00:00",
    scheduledDate: null,
    targetAudience: ["All Students", "All Teachers", "Parents"],
    isPinned: true,
    readCount: 1250,
    totalRecipients: 1500,
    notificationSent: true,
    emailSent: true,
    smsSent: false,
    attachments: [],
    template: null,
  },
  {
    id: "2",
    title: "Parent-Teacher Conference Schedule",
    content: "The upcoming parent-teacher conferences will be held on...",
    author: "Academic Affairs",
    category: "Academic",
    priority: "High",
    status: "Published",
    publishedDate: "2024-01-14T10:00:00",
    scheduledDate: null,
    targetAudience: ["Parents", "All Teachers"],
    isPinned: false,
    readCount: 890,
    totalRecipients: 1200,
    notificationSent: true,
    emailSent: true,
    smsSent: false,
    attachments: ["conference-schedule.pdf"],
    template: "Event Announcement",
  },
  {
    id: "3",
    title: "New Library Hours Starting Next Week",
    content: "Please note the updated library operating hours...",
    author: "Library Staff",
    category: "General",
    priority: "Normal",
    status: "Scheduled",
    publishedDate: null,
    scheduledDate: "2024-01-20T07:00:00",
    targetAudience: ["All Students", "All Teachers"],
    isPinned: false,
    readCount: 0,
    totalRecipients: 1800,
    notificationSent: false,
    emailSent: false,
    smsSent: false,
    attachments: [],
    template: "General Announcement",
  },
  {
    id: "4",
    title: "Mandatory Staff Meeting - Friday",
    content: "All teaching staff are required to attend the meeting...",
    author: "HR Department",
    category: "Staff",
    priority: "High",
    status: "Published",
    publishedDate: "2024-01-13T14:00:00",
    scheduledDate: null,
    targetAudience: ["All Teachers"],
    isPinned: true,
    readCount: 145,
    totalRecipients: 150,
    notificationSent: true,
    emailSent: true,
    smsSent: true,
    attachments: ["meeting-agenda.pdf"],
    template: null,
  },
  {
    id: "5",
    title: "Sports Day Registration Open",
    content: "Registration for the annual sports day is now open...",
    author: "Sports Department",
    category: "Events",
    priority: "Normal",
    status: "Draft",
    publishedDate: null,
    scheduledDate: null,
    targetAudience: ["All Students"],
    isPinned: false,
    readCount: 0,
    totalRecipients: 0,
    notificationSent: false,
    emailSent: false,
    smsSent: false,
    attachments: [],
    template: "Event Announcement",
  },
]

const mockBanners = [
  {
    id: "b1",
    message: "⚠️ Weather Alert: Early dismissal at 2:00 PM due to heavy rain. Stay safe and dry!",
    shortMessage: "Weather Alert: Early dismissal at 2:00 PM",
    type: "destructive" as const,
    isActive: true,
    isDismissible: true,
    hasAction: false,
    actionLabel: "",
    actionUrl: "",
    startDate: "2024-01-15T08:00:00",
    endDate: "2024-01-15T18:00:00",
    createdBy: "Admin Office",
    template: "Weather Alert",
  },
  {
    id: "b2",
    message: "🎉 Congratulations to our Science Olympiad team for winning the State Championship!",
    shortMessage: "Science Olympiad State Champions!",
    type: "success" as const,
    isActive: false,
    isDismissible: true,
    hasAction: true,
    actionLabel: "Read More",
    actionUrl: "/news/science-olympiad",
    startDate: "2024-01-14T00:00:00",
    endDate: "2024-01-20T23:59:59",
    createdBy: "Communications",
    template: "Achievement",
  },
  {
    id: "b3",
    message: "📢 Parent-Teacher Conference: Schedule your meeting now for January 25-26",
    shortMessage: "Parent-Teacher Conference Jan 25-26",
    type: "info" as const,
    isActive: false,
    isDismissible: true,
    hasAction: true,
    actionLabel: "Schedule Now",
    actionUrl: "/contact",
    startDate: "2024-01-18T00:00:00",
    endDate: "2024-01-26T23:59:59",
    createdBy: "Academic Affairs",
    template: "Event",
  },
]

const AnnouncementsPage = () => {
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("announcements")

  // Fetch banners from API
  const { data: bannersData, isLoading: bannersLoading, error: bannersError } = useBanners({ enabled: true })
  const { createMutation, updateMutation, deleteMutation, toggleMutation } = useBannerMutations()
  const banners = bannersData?.data || []
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<any>(null)
  const [bannerPreview, setBannerPreview] = useState<any>(null)
  const [bannerForm, setBannerForm] = useState({
    message: "",
    shortMessage: "",
    type: "info" as "info" | "success" | "warning" | "destructive",
    isDismissible: true,
    hasAction: false,
    actionLabel: "",
    actionUrl: "",
    startDate: "",
    endDate: "",
    template: "",
  })

  const [bannerFormErrors, setBannerFormErrors] = useState({
    message: "",
    actionLabel: "",
    actionUrl: "",
    dateRange: "",
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [audienceFilter, setAudienceFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<string[]>([])
  const [previewAnnouncement, setPreviewAnnouncement] = useState<any>(null)

  // Fetch announcements from API
  const { data: announcementsData, isLoading, error } = useAnnouncements({
    page: currentPage,
    limit: itemsPerPage,
  })

  // Mutation hooks for announcement CRUD operations
  const deleteAnnouncementMutation = useDeleteAnnouncement()
  const updateAnnouncementMutation = useUpdateAnnouncement()

  // Transform backend data to match UI expectations
  const announcements = announcementsData?.data.map(announcement => ({
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    author: announcement.user?.full_name || announcement.user?.email || "Unknown",
    category: announcement.type || "general",
    priority: "normal", // Backend doesn't have priority field
    status: "Published", // All fetched announcements are published
    publishedDate: announcement.createdAt,
    scheduledDate: null,
    targetAudience: announcement.targetRoles?.map(r => r.name) || [],
    isPinned: false, // Backend doesn't have isPinned yet
    readCount: 0, // Would need view tracking
    totalRecipients: 0, // Would need calculation
    notificationSent: true,
    emailSent: false,
    smsSent: false,
    attachments: [],
    template: null,
    expiresAt: announcement.expiresAt,
    tags: announcement.tags?.map(t => t.name) || [],
  })) || []

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    announcement: any | null
    submenu: string | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    announcement: null,
    submenu: null,
  })

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    announcement: any
  }>({ isOpen: false, announcement: null })

  const [statusConfirmation, setStatusConfirmation] = useState<{
    isOpen: boolean
    announcement: any
    newStatus: string
  }>({ isOpen: false, announcement: null, newStatus: "" })

  const [priorityConfirmation, setPriorityConfirmation] = useState<{
    isOpen: boolean
    announcement: any
    newPriority: string
  }>({ isOpen: false, announcement: null, newPriority: "" })

  const [pinnedConfirmation, setPinnedConfirmation] = useState<{
    isOpen: boolean
    announcement: any
  }>({ isOpen: false, announcement: null })

  const [bannerDeleteConfirmation, setBannerDeleteConfirmation] = useState<{
    isOpen: boolean
    banner: any
  }>({ isOpen: false, banner: null })

  const [bannerToggleConfirmation, setBannerToggleConfirmation] = useState<{
    isOpen: boolean
    banner: any
  }>({ isOpen: false, banner: null })

  const [bannerCreateConfirmation, setBannerCreateConfirmation] = useState<{
    isOpen: boolean
    isEdit: boolean
  }>({ isOpen: false, isEdit: false })

  // Client-side filtering (for local filters only - backend handles pagination)
  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || announcement.category.toLowerCase() === categoryFilter
    const matchesPriority = priorityFilter === "all" || announcement.priority.toLowerCase() === priorityFilter
    const matchesStatus = statusFilter === "all" || announcement.status.toLowerCase() === statusFilter
    const matchesAudience =
      audienceFilter === "all" ||
      announcement.targetAudience.some((aud: string) => aud.toLowerCase().includes(audienceFilter.toLowerCase()))

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesAudience
  })

  // Use API pagination data
  const totalPages = announcementsData?.pagination.totalPages || 1
  const totalCount = announcementsData?.pagination.total || 0
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount)
  const paginatedAnnouncements = filteredAnnouncements

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1)
    switch (filterType) {
      case "category":
        setCategoryFilter(value)
        break
      case "priority":
        setPriorityFilter(value)
        break
      case "status":
        setStatusFilter(value)
        break
      case "audience":
        setAudienceFilter(value)
        break
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAnnouncements(paginatedAnnouncements.map((announcement) => announcement.id))
    } else {
      setSelectedAnnouncements([])
    }
  }

  const handleSelectAnnouncement = (announcementId: string, checked: boolean) => {
    if (checked) {
      setSelectedAnnouncements((prev) => [...prev, announcementId])
    } else {
      setSelectedAnnouncements((prev) => prev.filter((id) => id !== announcementId))
    }
  }

  const getPriorityBadge = (priority: string, announcement?: any) => {
    const badge = (() => {
      switch (priority) {
        case "Urgent":
          return (
            <Badge className="bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20">
              <AlertCircle className="w-3 h-3 mr-1" />
              Urgent
            </Badge>
          )
        case "High":
          return (
            <Badge className="bg-orange-500/10 text-orange-700 border-orange-500/20 hover:bg-orange-500/20">
              <AlertTriangle className="w-3 h-3 mr-1" />
              High
            </Badge>
          )
        case "Normal":
          return (
            <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20">
              <Bell className="w-3 h-3 mr-1" />
              Normal
            </Badge>
          )
        case "Low":
          return (
            <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20">
              <Bell className="w-3 h-3 mr-1" />
              Low
            </Badge>
          )
        default:
          return (
            <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20">{priority}</Badge>
          )
      }
    })()

    if (announcement) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
              {badge}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-card border-border w-[180px]">
            <DropdownMenuItem
              className={`text-foreground ${priority === "Urgent" ? "bg-red-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handlePriorityChange(announcement, "Urgent")
              }}
            >
              <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
              <span className="flex-1">Urgent</span>
              {priority === "Urgent" && <Check className="w-4 h-4 text-red-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${priority === "High" ? "bg-orange-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handlePriorityChange(announcement, "High")
              }}
            >
              <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
              <span className="flex-1">High</span>
              {priority === "High" && <Check className="w-4 h-4 text-orange-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${priority === "Normal" ? "bg-blue-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handlePriorityChange(announcement, "Normal")
              }}
            >
              <Bell className="w-4 h-4 mr-2 text-blue-600" />
              <span className="flex-1">Normal</span>
              {priority === "Normal" && <Check className="w-4 h-4 text-blue-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${priority === "Low" ? "bg-gray-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handlePriorityChange(announcement, "Low")
              }}
            >
              <Bell className="w-4 h-4 mr-2 text-gray-600" />
              <span className="flex-1">Low</span>
              {priority === "Low" && <Check className="w-4 h-4 text-gray-600" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return badge
  }

  const getStatusBadge = (status: string, announcement?: any) => {
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

    if (announcement) {
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
                handleStatusChange(announcement, "Published")
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
                handleStatusChange(announcement, "Draft")
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
                handleStatusChange(announcement, "Scheduled")
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
      Emergency: "bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20",
      Academic: "bg-purple-500/10 text-purple-700 border-purple-500/20 hover:bg-purple-500/20",
      Events: "bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20",
      Staff: "bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20",
      General: "bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20",
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

  const handleViewAnnouncement = (announcement: any) => {
    setPreviewAnnouncement(announcement)
    closeContextMenu()
  }

  const handleEditAnnouncement = (announcement: any) => {
    toast({
      title: "Edit Announcement",
      description: `Opening editor for "${announcement.title}"`,
      duration: 3000,
    })
    closeContextMenu()
  }

  const handleDeleteAnnouncement = (announcement: any) => {
    setDeleteConfirmation({ isOpen: true, announcement })
    closeContextMenu()
  }

  const handleCreateAnnouncement = () => {
    router.push("/superadmin/announcements/create")
  }

  const handleContextMenu = (e: React.MouseEvent, announcement: any) => {
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
      announcement,
      submenu: null,
    })
  }

  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      announcement: null,
      submenu: null,
    })
  }

  const confirmDeleteAnnouncement = async () => {
    if (deleteConfirmation.announcement) {
      try {
        await deleteAnnouncementMutation.mutateAsync(deleteConfirmation.announcement.id)

        toast({
          title: "Announcement Deleted",
          description: `"${deleteConfirmation.announcement.title}" has been permanently removed.`,
          duration: 4000,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete announcement. Please try again.",
          variant: "destructive",
          duration: 4000,
        })
      }

      setDeleteConfirmation({ isOpen: false, announcement: null })
    }
  }

  const handleStatusChange = (announcement: any, newStatus: string) => {
    setStatusConfirmation({ isOpen: true, announcement, newStatus })
    closeContextMenu()
  }

  const confirmStatusChange = async () => {
    if (statusConfirmation.announcement) {
      // TODO: Backend doesn't support status field yet
      toast({
        title: "Not Implemented",
        description: "Status change is not yet supported by the backend.",
        variant: "destructive",
        duration: 4000,
      })

      setStatusConfirmation({ isOpen: false, announcement: null, newStatus: "" })
    }
  }

  const handlePriorityChange = (announcement: any, newPriority: string) => {
    setPriorityConfirmation({ isOpen: true, announcement, newPriority })
    closeContextMenu()
  }

  const confirmPriorityChange = async () => {
    if (priorityConfirmation.announcement) {
      // TODO: Backend doesn't support priority field yet
      toast({
        title: "Not Implemented",
        description: "Priority change is not yet supported by the backend.",
        variant: "destructive",
        duration: 4000,
      })

      setPriorityConfirmation({ isOpen: false, announcement: null, newPriority: "" })
    }
  }

  const handleTogglePinned = (announcement: any) => {
    setPinnedConfirmation({ isOpen: true, announcement })
    closeContextMenu()
  }

  const confirmTogglePinned = async () => {
    if (pinnedConfirmation.announcement) {
      // TODO: Backend doesn't support isPinned field yet
      toast({
        title: "Not Implemented",
        description: "Pin/Unpin is not yet supported by the backend.",
        variant: "destructive",
        duration: 4000,
      })

      setPinnedConfirmation({ isOpen: false, announcement: null })
    }
  }

  const handleDuplicateAnnouncement = (announcement: any) => {
    // TODO: Backend - Create duplicate announcement in database
    toast({
      title: "Not Implemented",
      description: "Duplicate announcement is not yet supported by the backend.",
      variant: "destructive",
      duration: 4000,
    })

    closeContextMenu()
  }

  const handleSendNotification = (announcement: any) => {
    // TODO: Backend - Send push notification to target audience
    toast({
      title: "Sending Notification",
      description: `Push notification sent to ${announcement.targetAudience.join(", ")}`,
      duration: 4000,
    })

    closeContextMenu()
  }

  const handleSendEmail = (announcement: any) => {
    // TODO: Backend - Send email to target audience
    toast({
      title: "Sending Email",
      description: `Email sent to ${announcement.totalRecipients} recipients`,
      duration: 4000,
    })

    closeContextMenu()
  }

  const handleSendSMS = (announcement: any) => {
    // TODO: Backend - Send SMS to target audience
    toast({
      title: "Sending SMS",
      description: `SMS sent to ${announcement.totalRecipients} recipients`,
      duration: 4000,
    })

    closeContextMenu()
  }

  const handleViewAnalytics = (announcement: any) => {
    toast({
      title: "Announcement Analytics",
      description: `${announcement.readCount} of ${announcement.totalRecipients} recipients have read this announcement (${Math.round((announcement.readCount / announcement.totalRecipients) * 100)}%)`,
      duration: 5000,
    })

    closeContextMenu()
  }

  // Banner Management Functions

  const validateBannerForm = () => {
    const errors = {
      message: "",
      actionLabel: "",
      actionUrl: "",
      dateRange: "",
    }

    // Validate message
    if (!bannerForm.message.trim()) {
      errors.message = "Banner message is required"
    } else if (bannerForm.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters"
    }

    // Validate action button fields if enabled
    if (bannerForm.hasAction) {
      if (!bannerForm.actionLabel.trim()) {
        errors.actionLabel = "Button label is required when action is enabled"
      }
      if (!bannerForm.actionUrl.trim()) {
        errors.actionUrl = "Button URL is required when action is enabled"
      }
    }

    // Validate date range
    if (bannerForm.startDate && bannerForm.endDate) {
      const start = new Date(bannerForm.startDate)
      const end = new Date(bannerForm.endDate)
      if (end <= start) {
        errors.dateRange = "End date & time must be after start date & time. Please select a later end date."
      }
    } else if (!bannerForm.startDate) {
      errors.dateRange = "Start date & time is required"
    } else if (!bannerForm.endDate) {
      errors.dateRange = "End date & time is required"
    }

    setBannerFormErrors(errors)
    return !errors.message && !errors.actionLabel && !errors.actionUrl && !errors.dateRange
  }

  const isBannerFormValid = () => {
    if (!bannerForm.message.trim() || bannerForm.message.trim().length < 10) {
      return false
    }
    if (bannerForm.hasAction) {
      if (!bannerForm.actionLabel.trim() || !bannerForm.actionUrl.trim()) {
        return false
      }
    }
    if (bannerForm.startDate && bannerForm.endDate) {
      const start = new Date(bannerForm.startDate)
      const end = new Date(bannerForm.endDate)
      if (end <= start) {
        return false
      }
    }
    return true
  }

  const handleCreateBanner = () => {
    setBannerForm({
      message: "",
      shortMessage: "",
      type: "info",
      isDismissible: true,
      hasAction: false,
      actionLabel: "",
      actionUrl: "",
      startDate: "",
      endDate: "",
      template: "",
    })
    setBannerFormErrors({
      message: "",
      actionLabel: "",
      actionUrl: "",
      dateRange: "",
    })
    setEditingBanner(null)
    setBannerDialogOpen(true)
  }

  const handleEditBanner = (banner: any) => {
    setBannerForm({
      message: banner.message,
      shortMessage: banner.shortMessage,
      type: banner.type,
      isDismissible: banner.isDismissible,
      hasAction: banner.hasAction,
      actionLabel: banner.actionLabel,
      actionUrl: banner.actionUrl,
      startDate: banner.startDate,
      endDate: banner.endDate,
      template: banner.template,
    })
    setBannerFormErrors({
      message: "",
      actionLabel: "",
      actionUrl: "",
      dateRange: "",
    })
    setEditingBanner(banner)
    setBannerDialogOpen(true)
  }

  const handleSaveBanner = () => {
    if (!validateBannerForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    setBannerCreateConfirmation({ isOpen: true, isEdit: !!editingBanner })
  }

  const confirmSaveBanner = () => {
    if (editingBanner) {
      updateMutation.mutate(
        {
          id: editingBanner.id,
          data: {
            message: bannerForm.message,
            shortMessage: bannerForm.shortMessage,
            type: bannerForm.type,
            isDismissible: bannerForm.isDismissible,
            hasAction: bannerForm.hasAction,
            actionLabel: bannerForm.actionLabel,
            actionUrl: bannerForm.actionUrl,
            startDate: bannerForm.startDate,
            endDate: bannerForm.endDate,
            template: bannerForm.template,
          },
        },
        {
          onSuccess: () => {
            toast({
              title: "Banner Updated",
              description: "Banner notification has been updated successfully",
              duration: 3000,
            })
            setBannerDialogOpen(false)
            setBannerCreateConfirmation({ isOpen: false, isEdit: false })
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: error?.response?.data?.message || "Failed to update banner",
              variant: "destructive",
              duration: 3000,
            })
          },
        },
      )
    } else {
      createMutation.mutate(
        {
          message: bannerForm.message,
          shortMessage: bannerForm.shortMessage,
          type: bannerForm.type,
          isDismissible: bannerForm.isDismissible,
          hasAction: bannerForm.hasAction,
          actionLabel: bannerForm.actionLabel,
          actionUrl: bannerForm.actionUrl,
          startDate: bannerForm.startDate,
          endDate: bannerForm.endDate,
          template: bannerForm.template,
        },
        {
          onSuccess: () => {
            toast({
              title: "Banner Created",
              description: "New banner notification has been created",
              duration: 3000,
            })
            setBannerDialogOpen(false)
            setBannerCreateConfirmation({ isOpen: false, isEdit: false })
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: error?.response?.data?.message || "Failed to create banner",
              variant: "destructive",
              duration: 3000,
            })
          },
        },
      )
    }
  }

  const handleToggleBannerActive = (banner: any) => {
    setBannerToggleConfirmation({ isOpen: true, banner })
  }

  const confirmToggleBannerActive = () => {
    if (bannerToggleConfirmation.banner) {
      toggleMutation.mutate(bannerToggleConfirmation.banner.id, {
        onSuccess: () => {
          toast({
            title: bannerToggleConfirmation.banner.isActive ? "Banner Deactivated" : "Banner Activated",
            description: bannerToggleConfirmation.banner.isActive
              ? "Banner is no longer visible on the website"
              : "Banner is now visible on the website",
            duration: 3000,
          })
          setBannerToggleConfirmation({ isOpen: false, banner: null })
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error?.response?.data?.message || "Failed to toggle banner status",
            variant: "destructive",
            duration: 3000,
          })
        },
      })
    }
  }

  const handleDeleteBanner = (banner: any) => {
    setBannerDeleteConfirmation({ isOpen: true, banner })
  }

  const confirmDeleteBanner = () => {
    if (bannerDeleteConfirmation.banner) {
      deleteMutation.mutate(bannerDeleteConfirmation.banner.id, {
        onSuccess: () => {
          toast({
            title: "Banner Deleted",
            description: "Banner notification has been removed",
            duration: 3000,
          })
          setBannerDeleteConfirmation({ isOpen: false, banner: null })
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error?.response?.data?.message || "Failed to delete banner",
            variant: "destructive",
            duration: 3000,
          })
        },
      })
    }
  }

  const handlePromoteToBanner = (announcement: any) => {
    const bannerData = {
      message: announcement.title,
      shortMessage: announcement.title.substring(0, 50),
      type: (announcement.priority === "Urgent" ? "destructive" : announcement.priority === "High" ? "warning" : "info") as "info" | "success" | "warning" | "destructive",
      isActive: false,
      isDismissible: true,
      hasAction: false,
      actionLabel: "",
      actionUrl: "",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      template: "From Announcement",
    }

    createMutation.mutate(bannerData, {
      onSuccess: () => {
        toast({
          title: "Promoted to Banner",
          description: `"${announcement.title}" has been promoted to a banner notification`,
          duration: 4000,
        })
        closeContextMenu()
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to promote to banner",
          variant: "destructive",
          duration: 3000,
        })
      },
    })
  }

  const applyBannerTemplate = (template: string) => {
    const templates = {
      Emergency: {
        message: "🚨 Emergency Alert: [Your message here]",
        shortMessage: "Emergency Alert",
        type: "destructive" as const,
        isDismissible: false,
      },
      Weather: {
        message: "⚠️ Weather Alert: [Your message here]",
        shortMessage: "Weather Alert",
        type: "warning" as const,
        isDismissible: true,
      },
      Event: {
        message: "📅 Upcoming Event: [Your message here]",
        shortMessage: "Upcoming Event",
        type: "info" as const,
        isDismissible: true,
      },
      Maintenance: {
        message: "🔧 System Maintenance: [Your message here]",
        shortMessage: "System Maintenance",
        type: "warning" as const,
        isDismissible: true,
      },
      Achievement: {
        message: "🎉 Congratulations: [Your message here]",
        shortMessage: "Congratulations",
        type: "success" as const,
        isDismissible: true,
      },
    }

    const templateData = templates[template as keyof typeof templates]
    if (templateData) {
      setBannerForm((prev) => ({
        ...prev,
        ...templateData,
        template,
      }))
    }
  }

  const getBannerTypeColor = (type: string) => {
    switch (type) {
      case "destructive":
        return "bg-red-500/10 text-red-700 border-red-500/20"
      case "warning":
        return "bg-orange-500/10 text-orange-700 border-orange-500/20"
      case "success":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "info":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20"
    }
  }

  const getBannerTypeIcon = (type: string) => {
    switch (type) {
      case "destructive":
        return <AlertCircle className="w-4 h-4" />
      case "warning":
        return <AlertTriangle className="w-4 h-4" />
      case "success":
        return <CheckCircle className="w-4 h-4" />
      case "info":
        return <Info className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  useState(() => {
    const handleClick = () => closeContextMenu()
    const handleScroll = () => closeContextMenu()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeContextMenu()
        setPreviewAnnouncement(null)
      }
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
          <h1 className="text-3xl font-bold text-foreground">Announcement Management</h1>
          <p className="text-muted-foreground">
            Create, schedule, and manage school-wide announcements and notifications
          </p>
        </div>
        <Button onClick={handleCreateAnnouncement} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Announcement
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="announcements">
            <Bell className="w-4 h-4 mr-2" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="banners">
            <Megaphone className="w-4 h-4 mr-2" />
            Banner Notifications
          </TabsTrigger>
        </TabsList>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6 mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Bell className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Announcements</p>
                    <p className="text-2xl font-bold text-foreground">{totalCount}</p>
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
                      {announcements.filter((a) => a.status === "Published").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Pin className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Pinned</p>
                    <p className="text-2xl font-bold text-foreground">
                      {announcements.filter((a) => a.isPinned).length}
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
                    <p className="text-sm font-medium text-muted-foreground">Total Reads</p>
                    <p className="text-2xl font-bold text-foreground">
                      {announcements.reduce((sum, a) => sum + a.readCount, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Announcement Management</CardTitle>
              <CardDescription className="text-muted-foreground">
                Search, filter, and manage announcements across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search announcements by title, author, or content..."
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
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={(value) => handleFilterChange("priority", value)}>
                  <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
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
                <Select value={audienceFilter} onValueChange={(value) => handleFilterChange("audience", value)}>
                  <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                    <SelectValue placeholder="Filter by audience" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All Audiences</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="teachers">Teachers</SelectItem>
                    <SelectItem value="parents">Parents</SelectItem>
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAnnouncements.length)} of{" "}
                  {filteredAnnouncements.length} announcements
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedAnnouncements.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <span className="text-sm text-foreground">
                    {selectedAnnouncements.length} announcement{selectedAnnouncements.length > 1 ? "s" : ""} selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" className="border-border bg-transparent">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Publish
                    </Button>
                    <Button size="sm" variant="outline" className="border-border bg-transparent">
                      <Send className="w-4 h-4 mr-2" />
                      Send Notification
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}

              {/* Announcements Table */}
              <div className="border border-border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedAnnouncements.length === paginatedAnnouncements.length &&
                            paginatedAnnouncements.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-foreground">Announcement</TableHead>
                      <TableHead className="text-foreground">Author</TableHead>
                      <TableHead className="text-foreground">Category</TableHead>
                      <TableHead className="text-foreground">Priority</TableHead>
                      <TableHead className="text-foreground">Status</TableHead>
                      <TableHead className="text-foreground">Target Audience</TableHead>
                      <TableHead className="text-foreground">Date</TableHead>
                      <TableHead className="text-foreground">Engagement</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                            <span>Loading announcements...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-destructive">
                          <div className="flex flex-col items-center gap-2">
                            <AlertCircle className="h-8 w-8" />
                            <p>Failed to load announcements</p>
                            <p className="text-sm text-muted-foreground">{error.message}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedAnnouncements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No announcements found
                        </TableCell>
                      </TableRow>
                    ) : paginatedAnnouncements.map((announcement) => (
                      <TableRow
                        key={announcement.id}
                        className="border-border cursor-pointer hover:bg-muted/50"
                        onContextMenu={(e) => handleContextMenu(e, announcement)}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedAnnouncements.includes(announcement.id)}
                            onCheckedChange={(checked) => handleSelectAnnouncement(announcement.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-foreground">{announcement.title}</div>
                              {announcement.isPinned && (
                                <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                                  <Pin className="w-3 h-3 mr-1" />
                                  Pinned
                                </Badge>
                              )}
                            </div>
                            <div
                              className="text-sm text-muted-foreground mt-1 line-clamp-1"
                              dangerouslySetInnerHTML={{ __html: announcement.content }}
                            />
                            {announcement.attachments.length > 0 && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <Paperclip className="w-3 h-3" />
                                <span>{announcement.attachments.length} attachment(s)</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">{announcement.author}</TableCell>
                        <TableCell>{getCategoryBadge(announcement.category)}</TableCell>
                        <TableCell>{getPriorityBadge(announcement.priority, announcement)}</TableCell>
                        <TableCell>{getStatusBadge(announcement.status, announcement)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {announcement.targetAudience.slice(0, 2).map((audience: string, idx: number) => (
                              <Badge key={idx} className="bg-blue-500/10 text-blue-700 border-blue-500/20 text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                {audience}
                              </Badge>
                            ))}
                            {announcement.targetAudience.length > 2 && (
                              <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 text-xs">
                                +{announcement.targetAudience.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {announcement.publishedDate ? (
                            <div className="flex items-center text-sm">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(announcement.publishedDate).toLocaleDateString()}
                            </div>
                          ) : announcement.scheduledDate ? (
                            <div className="flex items-center text-sm text-blue-600">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(announcement.scheduledDate).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground">
                                {announcement.readCount}/{announcement.totalRecipients}
                              </span>
                              {announcement.totalRecipients > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ({Math.round((announcement.readCount / announcement.totalRecipients) * 100)}%)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {announcement.notificationSent && (
                                <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 text-xs px-1.5 py-0">
                                  <Bell className="w-3 h-3" />
                                </Badge>
                              )}
                              {announcement.emailSent && (
                                <Badge className="bg-green-500/10 text-green-700 border-green-500/20 text-xs px-1.5 py-0">
                                  <Mail className="w-3 h-3" />
                                </Badge>
                              )}
                              {announcement.smsSent && (
                                <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20 text-xs px-1.5 py-0">
                                  <MessageSquare className="w-3 h-3" />
                                </Badge>
                              )}
                            </div>
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
                              <DropdownMenuItem
                                className="text-foreground"
                                onClick={() => handleViewAnnouncement(announcement)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Announcement
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-foreground"
                                onClick={() => handleEditAnnouncement(announcement)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Announcement
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => handleDeleteAnnouncement(announcement)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Announcement
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
                  Page {currentPage} of {totalPages} ({filteredAnnouncements.length} total announcements)
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
        </TabsContent>

        <TabsContent value="banners" className="space-y-6 mt-6">
          {/* Banner Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Megaphone className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Banners</p>
                    <p className="text-2xl font-bold text-foreground">{banners.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Power className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Active Banner</p>
                    <p className="text-2xl font-bold text-foreground">{banners.filter((b) => b.isActive).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                    <p className="text-2xl font-bold text-foreground">
                      {banners.filter((b) => !b.isActive && new Date(b.startDate) > new Date()).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold text-foreground">12.5K</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Banner Preview */}
          {banners.find((b) => b.isActive) && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Power className="w-5 h-5 text-green-600" />
                  Currently Active Banner
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  This banner is currently visible on the website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  {/* Live Preview */}
                  <div
                    className={`w-full text-white px-4 py-3 rounded-md ${
                      banners.find((b) => b.isActive)?.type === "destructive"
                        ? "bg-red-600"
                        : banners.find((b) => b.isActive)?.type === "warning"
                          ? "bg-orange-600"
                          : banners.find((b) => b.isActive)?.type === "success"
                            ? "bg-green-600"
                            : "bg-blue-600"
                    }`}
                  >
                    <div className="container mx-auto flex items-center justify-center gap-3">
                      <p className="flex-1 text-sm font-medium text-center">
                        {banners.find((b) => b.isActive)?.message}
                      </p>
                      {banners.find((b) => b.isActive)?.hasAction && (
                        <button className="text-xs font-semibold rounded-md px-3 py-1 bg-white/10 border border-white/20 hover:bg-white/15 transition-colors">
                          {banners.find((b) => b.isActive)?.actionLabel}
                        </button>
                      )}
                      {banners.find((b) => b.isActive)?.isDismissible && (
                        <button className="ml-1 p-1 rounded-md hover:bg-white/10 transition-colors">
                          <X className="h-4 w-4 text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Banner Management */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Banner Notifications</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage site-wide banner notifications that appear at the top of the website
                  </CardDescription>
                </div>
                <Button onClick={handleCreateBanner} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Banner
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bannersLoading && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading banners...</p>
                  </div>
                )}

                {bannersError && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-500 font-medium mb-2">Failed to load banners</p>
                    <p className="text-muted-foreground text-sm">
                      {bannersError?.message || "An error occurred while fetching banners"}
                    </p>
                  </div>
                )}

                {!bannersLoading && !bannersError && banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getBannerTypeColor(banner.type)}>
                            {getBannerTypeIcon(banner.type)}
                            <span className="ml-1 capitalize">{banner.type}</span>
                          </Badge>
                          {banner.isActive && (
                            <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                              <Power className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          )}
                          {banner.template && (
                            <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20">
                              {banner.template}
                            </Badge>
                          )}
                        </div>
                        <p className="text-foreground font-medium">{banner.message}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(banner.startDate).toLocaleDateString()} -{" "}
                            {new Date(banner.endDate).toLocaleDateString()}
                          </span>
                          <span>By {banner.createdBy}</span>
                          {banner.hasAction && (
                            <span className="flex items-center gap-1">
                              <LinkIcon className="w-4 h-4" />
                              Has action button
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${banner.id}`} className="text-sm text-muted-foreground">
                            {banner.isActive ? "Active" : "Inactive"}
                          </Label>
                          <Switch
                            id={`active-${banner.id}`}
                            checked={banner.isActive}
                            onCheckedChange={() => handleToggleBannerActive(banner)}
                            disabled={toggleMutation.isPending}
                          />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem className="text-foreground" onClick={() => setBannerPreview(banner)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Preview Banner
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-foreground" onClick={() => handleEditBanner(banner)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Banner
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-foreground"
                              onClick={() => handleToggleBannerActive(banner)}
                              disabled={toggleMutation.isPending}
                            >
                              {banner.isActive ? (
                                <>
                                  <PowerOff className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() => handleDeleteBanner(banner)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Banner
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}

                {!bannersLoading && !bannersError && banners.length === 0 && (
                  <div className="text-center py-12">
                    <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No banner notifications yet</p>
                    <Button onClick={handleCreateBanner} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Banner
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Context Menu */}
      {contextMenu.visible && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={closeContextMenu} />

          <div
            className="fixed z-50 min-w-[240px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1.5 space-y-0.5">
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleViewAnnouncement(contextMenu.announcement)}
              >
                <Eye className="w-4 h-4 text-blue-600" />
                <span>View Announcement</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleEditAnnouncement(contextMenu.announcement)}
              >
                <Edit className="w-4 h-4 text-green-600" />
                <span>Edit Announcement</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleDuplicateAnnouncement(contextMenu.announcement)}
              >
                <Copy className="w-4 h-4 text-purple-600" />
                <span>Duplicate Announcement</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handlePromoteToBanner(contextMenu.announcement)}
              >
                <Megaphone className="w-4 h-4 text-indigo-600" />
                <span>Promote to Banner</span>
              </button>

              <div className="h-px bg-border my-1" />

              <div
                className="relative"
                onMouseEnter={() => setContextMenu((prev) => ({ ...prev, submenu: "priority" }))}
                onMouseLeave={() => setContextMenu((prev) => ({ ...prev, submenu: null }))}
              >
                <button className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span>Change Priority</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                </button>

                {contextMenu.submenu === "priority" && (
                  <div className="absolute left-full top-0 ml-1 min-w-[180px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 p-1.5 space-y-0.5">
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.announcement?.priority === "Urgent" ? "bg-red-500/10" : ""
                      }`}
                      onClick={() => handlePriorityChange(contextMenu.announcement, "Urgent")}
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>Urgent</span>
                      </div>
                      {contextMenu.announcement?.priority === "Urgent" && <Check className="w-4 h-4 text-red-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.announcement?.priority === "High" ? "bg-orange-500/10" : ""
                      }`}
                      onClick={() => handlePriorityChange(contextMenu.announcement, "High")}
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span>High</span>
                      </div>
                      {contextMenu.announcement?.priority === "High" && <Check className="w-4 h-4 text-orange-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.announcement?.priority === "Normal" ? "bg-blue-500/10" : ""
                      }`}
                      onClick={() => handlePriorityChange(contextMenu.announcement, "Normal")}
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-blue-600" />
                        <span>Normal</span>
                      </div>
                      {contextMenu.announcement?.priority === "Normal" && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.announcement?.priority === "Low" ? "bg-gray-500/10" : ""
                      }`}
                      onClick={() => handlePriorityChange(contextMenu.announcement, "Low")}
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-gray-600" />
                        <span>Low</span>
                      </div>
                      {contextMenu.announcement?.priority === "Low" && <Check className="w-4 h-4 text-gray-600" />}
                    </button>
                  </div>
                )}
              </div>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleTogglePinned(contextMenu.announcement)}
              >
                <Pin
                  className={`w-4 h-4 ${contextMenu.announcement?.isPinned ? "text-yellow-600 fill-yellow-600" : "text-gray-600"}`}
                />
                <span>{contextMenu.announcement?.isPinned ? "Unpin Announcement" : "Pin Announcement"}</span>
              </button>

              <div className="h-px bg-border my-1" />

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleSendNotification(contextMenu.announcement)}
              >
                <Bell className="w-4 h-4 text-blue-600" />
                <span>Send Push Notification</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleSendEmail(contextMenu.announcement)}
              >
                <Mail className="w-4 h-4 text-green-600" />
                <span>Send Email</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleSendSMS(contextMenu.announcement)}
              >
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span>Send SMS</span>
              </button>

              <div className="h-px bg-border my-1" />

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleViewAnalytics(contextMenu.announcement)}
              >
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>View Analytics</span>
              </button>

              <div className="h-px bg-border my-1" />

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition-colors text-left"
                onClick={() => handleDeleteAnnouncement(contextMenu.announcement)}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Announcement</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Preview Modal */}
      {previewAnnouncement && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setPreviewAnnouncement(null)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-foreground">{previewAnnouncement.title}</h2>
                      {previewAnnouncement.isPinned && (
                        <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>By {previewAnnouncement.author}</span>
                      <span>•</span>
                      {previewAnnouncement.publishedDate && (
                        <span>{new Date(previewAnnouncement.publishedDate).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setPreviewAnnouncement(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {getCategoryBadge(previewAnnouncement.category)}
                    {getPriorityBadge(previewAnnouncement.priority)}
                    {getStatusBadge(previewAnnouncement.status)}
                  </div>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Target Audience</p>
                        <div className="flex flex-wrap gap-2">
                          {previewAnnouncement.targetAudience.map((audience: string, idx: number) => (
                            <Badge key={idx} className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                              <Users className="w-3 h-3 mr-1" />
                              {audience}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {previewAnnouncement.template && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Template</p>
                          <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20">
                            {previewAnnouncement.template}
                          </Badge>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Engagement</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {previewAnnouncement.readCount}/{previewAnnouncement.totalRecipients} read
                            </span>
                            {previewAnnouncement.totalRecipients > 0 && (
                              <span className="text-xs text-muted-foreground">
                                (
                                {Math.round(
                                  (previewAnnouncement.readCount / previewAnnouncement.totalRecipients) * 100,
                                )}
                                %)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Notifications Sent</p>
                        <div className="flex items-center gap-2">
                          {previewAnnouncement.notificationSent && (
                            <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                              <Bell className="w-3 h-3 mr-1" />
                              Push
                            </Badge>
                          )}
                          {previewAnnouncement.emailSent && (
                            <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                              <Mail className="w-3 h-3 mr-1" />
                              Email
                            </Badge>
                          )}
                          {previewAnnouncement.smsSent && (
                            <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              SMS
                            </Badge>
                          )}
                          {!previewAnnouncement.notificationSent &&
                            !previewAnnouncement.emailSent &&
                            !previewAnnouncement.smsSent && (
                              <span className="text-sm text-muted-foreground">No notifications sent</span>
                            )}
                        </div>
                      </div>

                      {previewAnnouncement.attachments.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Attachments</p>
                          <div className="space-y-1">
                            {previewAnnouncement.attachments.map((attachment: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <Paperclip className="w-4 h-4 text-muted-foreground" />
                                <span>{attachment}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Content</p>
                    <div
                      className="prose prose-sm max-w-none text-foreground"
                      dangerouslySetInnerHTML={{ __html: previewAnnouncement.content }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setPreviewAnnouncement(null)}>
                    Close
                  </Button>
                  <Button onClick={() => handleEditAnnouncement(previewAnnouncement)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Announcement
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && deleteConfirmation.announcement && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setDeleteConfirmation({ isOpen: false, announcement: null })}
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
                    <h3 className="text-xl font-bold text-foreground">Delete Announcement</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-red-600">{deleteConfirmation.announcement.title}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{deleteConfirmation.announcement.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {deleteConfirmation.announcement.author}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(deleteConfirmation.announcement.category)}
                        {getPriorityBadge(deleteConfirmation.announcement.priority)}
                        {getStatusBadge(deleteConfirmation.announcement.status)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700 dark:text-red-400">
                        <p className="font-medium mb-1">Warning: Permanent Action</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Announcement will be permanently deleted</li>
                          <li>• All announcement data will be lost</li>
                          <li>• Recipients will no longer see this announcement</li>
                          <li>• This action cannot be reversed</li>
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
                    onClick={() => setDeleteConfirmation({ isOpen: false, announcement: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDeleteAnnouncement}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Announcement
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Status Confirmation Modal */}
      {statusConfirmation.isOpen && statusConfirmation.announcement && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setStatusConfirmation({ isOpen: false, announcement: null, newStatus: "" })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Change Status</h3>
                    <p className="text-sm text-muted-foreground">Confirm status change</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Change status of{" "}
                    <span className="font-semibold text-blue-600">{statusConfirmation.announcement.title}</span> to{" "}
                    <span className="font-semibold text-green-600">{statusConfirmation.newStatus}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{statusConfirmation.announcement.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {statusConfirmation.announcement.author}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Current status:</span>
                        {getStatusBadge(statusConfirmation.announcement.status)}
                        <span className="text-muted-foreground">→</span>
                        {getStatusBadge(statusConfirmation.newStatus)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setStatusConfirmation({ isOpen: false, announcement: null, newStatus: "" })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmStatusChange}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
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

      {/* Priority Confirmation Modal */}
      {priorityConfirmation.isOpen && priorityConfirmation.announcement && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setPriorityConfirmation({ isOpen: false, announcement: null, newPriority: "" })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mr-4">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Change Priority</h3>
                    <p className="text-sm text-muted-foreground">Confirm priority change</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Change priority of{" "}
                    <span className="font-semibold text-orange-600">{priorityConfirmation.announcement.title}</span> to{" "}
                    <span className="font-semibold text-red-600">{priorityConfirmation.newPriority}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{priorityConfirmation.announcement.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {priorityConfirmation.announcement.author}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Current priority:</span>
                        {getPriorityBadge(priorityConfirmation.announcement.priority)}
                        <span className="text-muted-foreground">→</span>
                        {getPriorityBadge(priorityConfirmation.newPriority)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setPriorityConfirmation({ isOpen: false, announcement: null, newPriority: "" })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmPriorityChange}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Change Priority
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pinned Confirmation Modal */}
      {pinnedConfirmation.isOpen && pinnedConfirmation.announcement && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setPinnedConfirmation({ isOpen: false, announcement: null })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mr-4">
                    <Pin className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {pinnedConfirmation.announcement.isPinned ? "Unpin Announcement" : "Pin Announcement"}
                    </h3>
                    <p className="text-sm text-muted-foreground">Confirm pinned status change</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    {pinnedConfirmation.announcement.isPinned ? "Unpin" : "Pin"}{" "}
                    <span className="font-semibold text-yellow-600">{pinnedConfirmation.announcement.title}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{pinnedConfirmation.announcement.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {pinnedConfirmation.announcement.author}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(pinnedConfirmation.announcement.category)}
                        {getPriorityBadge(pinnedConfirmation.announcement.priority)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-700 dark:text-yellow-400">
                        <p className="font-medium mb-1">What will happen:</p>
                        <ul className="space-y-1 text-xs">
                          {pinnedConfirmation.announcement.isPinned ? (
                            <>
                              <li>• Announcement will be unpinned</li>
                              <li>• Will appear in normal announcement list</li>
                              <li>• No longer highlighted at the top</li>
                            </>
                          ) : (
                            <>
                              <li>• Announcement will be pinned to the top</li>
                              <li>• Will be highlighted for all users</li>
                              <li>• Stays at top of announcement list</li>
                            </>
                          )}
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
                    onClick={() => setPinnedConfirmation({ isOpen: false, announcement: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmTogglePinned}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white"
                  >
                    <Pin className="w-4 h-4 mr-2" />
                    {pinnedConfirmation.announcement.isPinned ? "Unpin" : "Pin"} Announcement
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {bannerDialogOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setBannerDialogOpen(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {editingBanner ? "Edit Banner" : "Create Banner Notification"}
                    </h2>
                    <p className="text-sm text-muted-foreground">Configure your site-wide banner notification</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setBannerDialogOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Quick Templates */}
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">Quick Templates</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {[
                        { name: "Emergency", icon: AlertCircle, color: "red" },
                        { name: "Weather", icon: CloudRain, color: "orange" },
                        { name: "Event", icon: PartyPopper, color: "blue" },
                        { name: "Maintenance", icon: Wrench, color: "yellow" },
                        { name: "Achievement", icon: Award, color: "green" },
                      ].map((template) => (
                        <Button
                          key={template.name}
                          variant="outline"
                          size="sm"
                          onClick={() => applyBannerTemplate(template.name)}
                          className="flex flex-col items-center gap-1 h-auto py-3"
                        >
                          <template.icon className="w-5 h-5" />
                          <span className="text-xs">{template.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Banner Type */}
                  <div>
                    <Label htmlFor="banner-type" className="text-sm font-medium text-foreground mb-2 block">
                      Banner Type
                    </Label>
                    <Select
                      value={bannerForm.type}
                      onValueChange={(value: any) => setBannerForm((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="info">
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            <span>Info (Blue)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="success">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Success (Green)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="warning">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                            <span>Warning (Orange)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="destructive">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span>Urgent (Red)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="banner-message" className="text-sm font-medium text-foreground mb-2 block">
                      Banner Message <span className="text-red-500">*</span>
                      <span className="text-muted-foreground ml-2">({bannerForm.message.length}/200)</span>
                    </Label>
                    <Textarea
                      id="banner-message"
                      value={bannerForm.message}
                      onChange={(e) => {
                        setBannerForm((prev) => ({ ...prev, message: e.target.value.substring(0, 200) }))
                        if (bannerFormErrors.message) {
                          setBannerFormErrors((prev) => ({ ...prev, message: "" }))
                        }
                      }}
                      placeholder="Enter your banner message... (minimum 10 characters)"
                      className={`bg-background border-border text-foreground min-h-[80px] ${
                        bannerFormErrors.message ? "border-red-500" : ""
                      }`}
                    />
                    {bannerFormErrors.message && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {bannerFormErrors.message}
                      </p>
                    )}
                  </div>

                  {/* Short Message (Mobile) */}
                  <div>
                    <Label htmlFor="banner-short-message" className="text-sm font-medium text-foreground mb-2 block">
                      Short Message (Mobile)
                      <span className="text-muted-foreground ml-2">({bannerForm.shortMessage.length}/50)</span>
                    </Label>
                    <Input
                      id="banner-short-message"
                      value={bannerForm.shortMessage}
                      onChange={(e) =>
                        setBannerForm((prev) => ({ ...prev, shortMessage: e.target.value.substring(0, 50) }))
                      }
                      placeholder="Shorter version for mobile..."
                      className="bg-background border-border text-foreground"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dismissible" className="text-sm font-medium text-foreground">
                        Allow users to dismiss banner
                      </Label>
                      <Switch
                        id="dismissible"
                        checked={bannerForm.isDismissible}
                        onCheckedChange={(checked) => setBannerForm((prev) => ({ ...prev, isDismissible: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="has-action" className="text-sm font-medium text-foreground">
                        Add action button
                      </Label>
                      <Switch
                        id="has-action"
                        checked={bannerForm.hasAction}
                        onCheckedChange={(checked) => setBannerForm((prev) => ({ ...prev, hasAction: checked }))}
                      />
                    </div>
                  </div>

                  {/* Action Button (conditional) */}
                  {bannerForm.hasAction && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="action-label" className="text-sm font-medium text-foreground mb-2 block">
                          Button Label <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="action-label"
                          value={bannerForm.actionLabel}
                          onChange={(e) => {
                            setBannerForm((prev) => ({ ...prev, actionLabel: e.target.value }))
                            if (bannerFormErrors.actionLabel) {
                              setBannerFormErrors((prev) => ({ ...prev, actionLabel: "" }))
                            }
                          }}
                          placeholder="Learn More"
                          className={`bg-background border-border text-foreground ${
                            bannerFormErrors.actionLabel ? "border-red-500" : ""
                          }`}
                        />
                        {bannerFormErrors.actionLabel && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {bannerFormErrors.actionLabel}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="action-url" className="text-sm font-medium text-foreground mb-2 block">
                          Button URL <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="action-url"
                          value={bannerForm.actionUrl}
                          onChange={(e) => {
                            setBannerForm((prev) => ({ ...prev, actionUrl: e.target.value }))
                            if (bannerFormErrors.actionUrl) {
                              setBannerFormErrors((prev) => ({ ...prev, actionUrl: "" }))
                            }
                          }}
                          placeholder="/page-url"
                          className={`bg-background border-border text-foreground ${
                            bannerFormErrors.actionUrl ? "border-red-500" : ""
                          }`}
                        />
                        {bannerFormErrors.actionUrl && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {bannerFormErrors.actionUrl}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Schedule */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date" className="text-sm font-medium text-foreground mb-2 block">
                        Start Date & Time
                      </Label>
                      <Input
                        id="start-date"
                        type="datetime-local"
                        min={new Date().toISOString().slice(0, 16)}
                        value={bannerForm.startDate ? new Date(bannerForm.startDate).toISOString().slice(0, 16) : ""}
                        onChange={(e) => {
                          const newStartDate = e.target.value
                          setBannerForm((prev) => ({ ...prev, startDate: newStartDate }))

                          // Real-time validation
                          if (newStartDate && bannerForm.endDate) {
                            const start = new Date(newStartDate)
                            const end = new Date(bannerForm.endDate)
                            if (end <= start) {
                              setBannerFormErrors((prev) => ({
                                ...prev,
                                dateRange: "End date & time must be after start date & time. Please select a later end date."
                              }))
                            } else {
                              setBannerFormErrors((prev) => ({ ...prev, dateRange: "" }))
                            }
                          } else {
                            setBannerFormErrors((prev) => ({ ...prev, dateRange: "" }))
                          }
                        }}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date" className="text-sm font-medium text-foreground mb-2 block">
                        End Date & Time
                      </Label>
                      <Input
                        id="end-date"
                        type="datetime-local"
                        min={new Date().toISOString().slice(0, 16)}
                        value={bannerForm.endDate ? new Date(bannerForm.endDate).toISOString().slice(0, 16) : ""}
                        onChange={(e) => {
                          const newEndDate = e.target.value
                          setBannerForm((prev) => ({ ...prev, endDate: newEndDate }))

                          // Real-time validation
                          if (bannerForm.startDate && newEndDate) {
                            const start = new Date(bannerForm.startDate)
                            const end = new Date(newEndDate)
                            if (end <= start) {
                              setBannerFormErrors((prev) => ({
                                ...prev,
                                dateRange: "End date & time must be after start date & time. Please select a later end date."
                              }))
                            } else {
                              setBannerFormErrors((prev) => ({ ...prev, dateRange: "" }))
                            }
                          } else {
                            setBannerFormErrors((prev) => ({ ...prev, dateRange: "" }))
                          }
                        }}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    {bannerFormErrors.dateRange && (
                      <div className="col-span-2">
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {bannerFormErrors.dateRange}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Live Preview */}
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">Live Preview</Label>
                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div
                        className={`w-full text-white px-4 py-3 rounded-md ${
                          bannerForm.type === "destructive"
                            ? "bg-red-600"
                            : bannerForm.type === "warning"
                              ? "bg-orange-600"
                              : bannerForm.type === "success"
                                ? "bg-green-600"
                                : "bg-blue-600"
                        }`}
                      >
                        <div className="container mx-auto flex items-center justify-center gap-3">
                          <p className="flex-1 text-sm font-medium text-center">
                            {bannerForm.message || "Your banner message will appear here..."}
                          </p>
                          {bannerForm.hasAction && bannerForm.actionLabel && (
                            <button className="text-xs font-semibold rounded-md px-3 py-1 bg-white/10 border border-white/20 hover:bg-white/15 transition-colors">
                              {bannerForm.actionLabel}
                            </button>
                          )}
                          {bannerForm.isDismissible && (
                            <button className="ml-1 p-1 rounded-md hover:bg-white/10 transition-colors">
                              <X className="h-4 w-4 text-white" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setBannerDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveBanner}
                    disabled={!isBannerFormValid()}
                    className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingBanner ? "Update Banner" : "Create Banner"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {bannerPreview && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setBannerPreview(null)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-2xl w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-foreground">Banner Preview</h2>
                  <Button variant="ghost" size="sm" onClick={() => setBannerPreview(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <div
                      className={`w-full text-white px-4 py-3 rounded-md ${
                        bannerPreview.type === "destructive"
                          ? "bg-red-600"
                          : bannerPreview.type === "warning"
                            ? "bg-orange-600"
                            : bannerPreview.type === "success"
                              ? "bg-green-600"
                              : "bg-blue-600"
                      }`}
                    >
                      <div className="container mx-auto flex items-center justify-center gap-3">
                        <p className="flex-1 text-sm font-medium text-center">{bannerPreview.message}</p>
                        {bannerPreview.hasAction && (
                          <button className="text-xs font-semibold rounded-md px-3 py-1 bg-white/10 border border-white/20 hover:bg-white/15 transition-colors">
                            {bannerPreview.actionLabel}
                          </button>
                        )}
                        {bannerPreview.isDismissible && (
                          <button className="ml-1 p-1 rounded-md hover:bg-white/10 transition-colors">
                            <X className="h-4 w-4 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getBannerTypeColor(bannerPreview.type)}>
                        {getBannerTypeIcon(bannerPreview.type)}
                        <span className="ml-1 capitalize">{bannerPreview.type}</span>
                      </Badge>
                      {bannerPreview.isActive && (
                        <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                          <Power className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="text-muted-foreground">Schedule:</span>
                        <span className="ml-2 text-foreground">
                          {new Date(bannerPreview.startDate).toLocaleString()} -{" "}
                          {new Date(bannerPreview.endDate).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created by:</span>
                        <span className="ml-2 text-foreground">{bannerPreview.createdBy}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dismissible:</span>
                        <span className="ml-2 text-foreground">{bannerPreview.isDismissible ? "Yes" : "No"}</span>
                      </div>
                      {bannerPreview.hasAction && (
                        <div>
                          <span className="text-muted-foreground">Action:</span>
                          <span className="ml-2 text-foreground">
                            {bannerPreview.actionLabel} → {bannerPreview.actionUrl}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setBannerPreview(null)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setBannerPreview(null)
                      handleEditBanner(bannerPreview)
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Banner
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {bannerDeleteConfirmation.isOpen && bannerDeleteConfirmation.banner && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setBannerDeleteConfirmation({ isOpen: false, banner: null })}
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
                    <h3 className="text-xl font-bold text-foreground">Delete Banner</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">Are you sure you want to delete this banner notification?</p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getBannerTypeColor(bannerDeleteConfirmation.banner.type)}>
                          {getBannerTypeIcon(bannerDeleteConfirmation.banner.type)}
                          <span className="ml-1 capitalize">{bannerDeleteConfirmation.banner.type}</span>
                        </Badge>
                        {bannerDeleteConfirmation.banner.isActive && (
                          <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                            <Power className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-foreground">{bannerDeleteConfirmation.banner.message}</p>
                      <p className="text-sm text-muted-foreground">By {bannerDeleteConfirmation.banner.createdBy}</p>
                    </div>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700 dark:text-red-400">
                        <p className="font-medium mb-1">Warning: Permanent Action</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Banner will be permanently deleted</li>
                          <li>• All banner data will be lost</li>
                          {bannerDeleteConfirmation.banner.isActive && (
                            <li>• Active banner will be removed from website immediately</li>
                          )}
                          <li>• This action cannot be reversed</li>
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
                    onClick={() => setBannerDeleteConfirmation({ isOpen: false, banner: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDeleteBanner}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Banner
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {bannerToggleConfirmation.isOpen && bannerToggleConfirmation.banner && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setBannerToggleConfirmation({ isOpen: false, banner: null })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                      bannerToggleConfirmation.banner.isActive ? "bg-orange-500/10" : "bg-green-500/10"
                    }`}
                  >
                    {bannerToggleConfirmation.banner.isActive ? (
                      <PowerOff className="w-6 h-6 text-orange-600" />
                    ) : (
                      <Power className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {bannerToggleConfirmation.banner.isActive ? "Deactivate Banner" : "Activate Banner"}
                    </h3>
                    <p className="text-sm text-muted-foreground">Confirm banner status change</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    {bannerToggleConfirmation.banner.isActive
                      ? "Deactivate this banner notification?"
                      : "Activate this banner notification?"}
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getBannerTypeColor(bannerToggleConfirmation.banner.type)}>
                          {getBannerTypeIcon(bannerToggleConfirmation.banner.type)}
                          <span className="ml-1 capitalize">{bannerToggleConfirmation.banner.type}</span>
                        </Badge>
                        {bannerToggleConfirmation.banner.template && (
                          <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20">
                            {bannerToggleConfirmation.banner.template}
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-foreground">{bannerToggleConfirmation.banner.message}</p>
                      <p className="text-sm text-muted-foreground">By {bannerToggleConfirmation.banner.createdBy}</p>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-4 ${
                      bannerToggleConfirmation.banner.isActive
                        ? "bg-orange-500/5 border border-orange-500/20"
                        : "bg-green-500/5 border border-green-500/20"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <AlertTriangle
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          bannerToggleConfirmation.banner.isActive ? "text-orange-600" : "text-green-600"
                        }`}
                      />
                      <div
                        className={`text-sm ${
                          bannerToggleConfirmation.banner.isActive
                            ? "text-orange-700 dark:text-orange-400"
                            : "text-green-700 dark:text-green-400"
                        }`}
                      >
                        <p className="font-medium mb-1">What will happen:</p>
                        <ul className="space-y-1 text-xs">
                          {bannerToggleConfirmation.banner.isActive ? (
                            <>
                              <li>• Banner will be hidden from the website</li>
                              <li>• Users will no longer see this notification</li>
                              <li>• Banner can be reactivated later</li>
                            </>
                          ) : (
                            <>
                              <li>• Banner will appear at the top of the website</li>
                              <li>• All other active banners will be deactivated</li>
                              <li>• Only one banner can be active at a time</li>
                              <li>• Users will see this notification immediately</li>
                            </>
                          )}
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
                    onClick={() => setBannerToggleConfirmation({ isOpen: false, banner: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmToggleBannerActive}
                    className={`${
                      bannerToggleConfirmation.banner.isActive
                        ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                        : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    } text-white`}
                  >
                    {bannerToggleConfirmation.banner.isActive ? (
                      <>
                        <PowerOff className="w-4 h-4 mr-2" />
                        Deactivate Banner
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4 mr-2" />
                        Activate Banner
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {bannerCreateConfirmation.isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setBannerCreateConfirmation({ isOpen: false, isEdit: false })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4">
                    <Megaphone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {bannerCreateConfirmation.isEdit ? "Update Banner" : "Create Banner"}
                    </h3>
                    <p className="text-sm text-muted-foreground">Confirm banner details</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    {bannerCreateConfirmation.isEdit
                      ? "Save changes to this banner notification?"
                      : "Create this banner notification?"}
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getBannerTypeColor(bannerForm.type)}>
                          {getBannerTypeIcon(bannerForm.type)}
                          <span className="ml-1 capitalize">{bannerForm.type}</span>
                        </Badge>
                        {bannerForm.template && (
                          <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20">
                            {bannerForm.template}
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-foreground">{bannerForm.message || "No message"}</p>
                      {bannerForm.hasAction && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          Action: {bannerForm.actionLabel}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700 dark:text-blue-400">
                        <p className="font-medium mb-1">Note:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Banner will be created as inactive</li>
                          <li>• You can activate it from the banner list</li>
                          <li>• Only one banner can be active at a time</li>
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
                    onClick={() => setBannerCreateConfirmation({ isOpen: false, isEdit: false })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmSaveBanner}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <Megaphone className="w-4 h-4 mr-2" />
                    {bannerCreateConfirmation.isEdit ? "Update Banner" : "Create Banner"}
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

export default AnnouncementsPage
