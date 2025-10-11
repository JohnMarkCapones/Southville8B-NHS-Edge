"use client"

import type React from "react"

import { useState } from "react"
import { PageTransition } from "@/components/superadmin/page-transition"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ImageIcon,
  Search,
  Grid3x3,
  List,
  Upload,
  Star,
  Eye,
  Download,
  Trash2,
  Edit,
  MoreVertical,
  Calendar,
  CheckCircle,
  Archive,
  Share2,
  Tag,
  Folder,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  AlertCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  AlertTriangle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Mock data for gallery items
const mockGalleryItems = [
  {
    id: 1,
    title: "Science Fair 2024",
    description: "Students showcasing their innovative projects",
    imageUrl: "/placeholder.svg?height=400&width=600",
    album: "Events",
    category: "Academic",
    uploadDate: "2024-03-15",
    views: 245,
    featured: true,
    status: "published",
    visible: true,
    tags: ["science", "fair", "2024"],
  },
  {
    id: 2,
    title: "Sports Day Champions",
    description: "Celebrating our athletic achievements",
    imageUrl: "/placeholder.svg?height=400&width=600",
    album: "Sports",
    category: "Athletics",
    uploadDate: "2024-03-10",
    views: 189,
    featured: true,
    status: "published",
    visible: true,
    tags: ["sports", "athletics", "champions"],
  },
  {
    id: 3,
    title: "Art Exhibition Opening",
    description: "Student artwork on display",
    imageUrl: "/placeholder.svg?height=400&width=600",
    album: "Arts",
    category: "Cultural",
    uploadDate: "2024-03-08",
    views: 156,
    featured: false,
    status: "published",
    visible: false,
    tags: ["art", "exhibition", "culture"],
  },
  {
    id: 4,
    title: "Graduation Ceremony 2024",
    description: "Honoring our graduating class",
    imageUrl: "/placeholder.svg?height=400&width=600",
    album: "Events",
    category: "Academic",
    uploadDate: "2024-03-05",
    views: 432,
    featured: true,
    status: "published",
    visible: true,
    tags: ["graduation", "ceremony", "2024"],
  },
  {
    id: 5,
    title: "Music Concert Performance",
    description: "School orchestra in action",
    imageUrl: "/placeholder.svg?height=400&width=600",
    album: "Arts",
    category: "Cultural",
    uploadDate: "2024-03-01",
    views: 198,
    featured: false,
    status: "published",
    visible: true,
    tags: ["music", "concert", "orchestra"],
  },
  {
    id: 6,
    title: "Community Service Day",
    description: "Students giving back to the community",
    imageUrl: "/placeholder.svg?height=400&width=600",
    album: "Community",
    category: "Service",
    uploadDate: "2024-02-28",
    views: 167,
    featured: false,
    status: "published",
    visible: false,
    tags: ["community", "service", "volunteering"],
  },
  {
    id: 7,
    title: "New Campus Building",
    description: "Our state-of-the-art learning facility",
    imageUrl: "/placeholder.svg?height=400&width=600",
    album: "Campus",
    category: "Infrastructure",
    uploadDate: "2024-02-25",
    views: 289,
    featured: true,
    status: "published",
    visible: true,
    tags: ["campus", "building", "infrastructure"],
  },
  {
    id: 8,
    title: "Robotics Competition",
    description: "Team competing in regional finals",
    imageUrl: "/placeholder.svg?height=400&width=600",
    album: "Events",
    category: "Academic",
    uploadDate: "2024-02-20",
    views: 213,
    featured: false,
    status: "draft",
    visible: true,
    tags: ["robotics", "competition", "technology"],
  },
]

const mockArchivedGalleryItems = [
  {
    id: 101,
    title: "Old Campus Building",
    description: "Historical photo of the original campus",
    imageUrl: "/placeholder.svg?height=400&width=600",
    album: "Campus",
    category: "Infrastructure",
    uploadDate: "2023-01-15",
    views: 89,
    featured: false,
    status: "archived",
    visible: false,
    tags: ["campus", "history", "building"],
    archivedDate: "2024-02-15",
    archivedBy: "Admin User",
    archivedReason: "Outdated content",
  },
  {
    id: 102,
    title: "Previous Year Sports Day",
    description: "Last year's athletic competition",
    imageUrl: "/placeholder.svg?height=400&width=600",
    album: "Sports",
    category: "Athletics",
    uploadDate: "2023-03-20",
    views: 156,
    featured: false,
    status: "archived",
    visible: false,
    tags: ["sports", "athletics", "2023"],
    archivedDate: "2024-03-01",
    archivedBy: "John Doe",
    archivedReason: "Event concluded",
  },
]

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAlbum, setSelectedAlbum] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "feature" | "unfeature" | "hide" | "show" | "archive"
    itemId: number
    itemTitle: string
  } | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    itemId: number
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const { toast } = useToast()
  const router = useRouter()

  const [showArchivedGallery, setShowArchivedGallery] = useState(false)
  const [archivedSearchQuery, setArchivedSearchQuery] = useState("")
  const [archivedSelectedAlbum, setArchivedSelectedAlbum] = useState("all")
  const [archivedSelectedCategory, setArchivedSelectedCategory] = useState("all")
  const [archivedSelectedItems, setArchivedSelectedItems] = useState<number[]>([])
  const [archivedCurrentPage, setArchivedCurrentPage] = useState(1)
  const [archivedItemsPerPage, setArchivedItemsPerPage] = useState(12)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false)
  const [selectedArchivedItem, setSelectedArchivedItem] = useState<number | null>(null)

  // Filter items based on search and filters
  const filteredItems = mockGalleryItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesAlbum = selectedAlbum === "all" || item.album === selectedAlbum
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus

    return matchesSearch && matchesAlbum && matchesCategory && matchesStatus
  })

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  const handleFilterChange = (setter: (value: any) => void, value: any) => {
    setter(value)
    setCurrentPage(1)
  }

  // Calculate stats
  const stats = {
    total: mockGalleryItems.length,
    published: mockGalleryItems.filter((i) => i.status === "published").length,
    featured: mockGalleryItems.filter((i) => i.featured).length,
    draft: mockGalleryItems.filter((i) => i.status === "draft").length,
    totalViews: mockGalleryItems.reduce((sum, i) => sum + i.views, 0),
    albums: [...new Set(mockGalleryItems.map((i) => i.album))].length,
  }

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(paginatedItems.map((item) => item.id))
    }
  }

  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleDelete = (id: number) => {
    const item = mockGalleryItems.find((i) => i.id === id)
    if (item) {
      setConfirmAction({ type: "delete", itemId: id, itemTitle: item.title })
      setConfirmDialogOpen(true)
    }
  }

  const handleFeatureToggle = (id: number) => {
    const item = mockGalleryItems.find((i) => i.id === id)
    if (item) {
      setConfirmAction({
        type: item.featured ? "unfeature" : "feature",
        itemId: id,
        itemTitle: item.title,
      })
      setConfirmDialogOpen(true)
    }
  }

  const handleVisibilityToggle = (id: number) => {
    const item = mockGalleryItems.find((i) => i.id === id)
    if (item) {
      setConfirmAction({
        type: item.visible ? "hide" : "show",
        itemId: id,
        itemTitle: item.title,
      })
      setConfirmDialogOpen(true)
    }
  }

  const handleArchive = (id: number) => {
    const item = mockGalleryItems.find((i) => i.id === id)
    if (item) {
      setConfirmAction({ type: "archive", itemId: id, itemTitle: item.title })
      setConfirmDialogOpen(true)
    }
  }

  const handleConfirmAction = () => {
    if (!confirmAction) return

    const { type, itemId, itemTitle } = confirmAction

    const messages = {
      delete: {
        title: "Photo Deleted",
        description: `"${itemTitle}" has been removed from the gallery.`,
      },
      feature: {
        title: "Photo Featured",
        description: `"${itemTitle}" is now featured in the gallery.`,
      },
      unfeature: {
        title: "Photo Unfeatured",
        description: `"${itemTitle}" is no longer featured.`,
      },
      hide: {
        title: "Photo Hidden",
        description: `"${itemTitle}" is now hidden from public view.`,
      },
      show: {
        title: "Photo Visible",
        description: `"${itemTitle}" is now visible to the public.`,
      },
      archive: {
        title: "Photo Archived",
        description: `"${itemTitle}" has been moved to the archive.`,
      },
    }

    toast({
      title: `✅ ${messages[type].title}`,
      description: messages[type].description,
      className: "border-green-500/20 bg-green-500/5",
    })

    setConfirmDialogOpen(false)
    setConfirmAction(null)
  }

  const handleBulkDelete = () => {
    toast({
      title: "✅ Photos Deleted",
      description: `${selectedItems.length} photos have been removed from the gallery.`,
      className: "border-green-500/20 bg-green-500/5",
    })
    setSelectedItems([])
  }

  const handleContextMenu = (e: React.MouseEvent, itemId: number) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      itemId,
    })
  }

  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  const getActionDescription = () => {
    if (!confirmAction) return ""

    const item = mockGalleryItems.find((i) => i.id === confirmAction.itemId)
    if (!item) return ""

    const descriptions = {
      delete: {
        title: "Delete Photo",
        message: "This photo will be permanently removed from the gallery and cannot be recovered.",
        details: [
          `Title: ${item.title}`,
          `Album: ${item.album}`,
          `Category: ${item.category}`,
          `Views: ${item.views}`,
          `Status: ${item.status}`,
        ],
        warning: "This action cannot be undone.",
        color: "red",
      },
      feature: {
        title: "Feature Photo",
        message: "This photo will be highlighted in the gallery and shown prominently to visitors.",
        details: [
          `Title: ${item.title}`,
          `Album: ${item.album}`,
          `Current views: ${item.views}`,
          `Featured photos get more visibility`,
        ],
        warning: "Featured photos appear at the top of the gallery.",
        color: "yellow",
      },
      unfeature: {
        title: "Unfeature Photo",
        message: "This photo will no longer be highlighted in the gallery.",
        details: [`Title: ${item.title}`, `Album: ${item.album}`, `Current views: ${item.views}`],
        warning: "The photo will return to normal display order.",
        color: "gray",
      },
      hide: {
        title: "Hide Photo",
        message: "This photo will be hidden from public view but remain in the system.",
        details: [
          `Title: ${item.title}`,
          `Album: ${item.album}`,
          `Current views: ${item.views}`,
          `Only admins can see hidden photos`,
        ],
        warning: "Students and visitors will not be able to see this photo.",
        color: "orange",
      },
      show: {
        title: "Show Photo",
        message: "This photo will become visible to all students and visitors.",
        details: [
          `Title: ${item.title}`,
          `Album: ${item.album}`,
          `Status: ${item.status}`,
          `Will appear in public gallery`,
        ],
        warning: "Make sure the photo is appropriate for public viewing.",
        color: "green",
      },
      archive: {
        title: "Archive Photo",
        message: "This photo will be moved to the archive and hidden from the main gallery.",
        details: [
          `Title: ${item.title}`,
          `Album: ${item.album}`,
          `Upload date: ${new Date(item.uploadDate).toLocaleDateString()}`,
          `Can be restored later`,
        ],
        warning: "Archived photos can be restored from the archive section.",
        color: "blue",
      },
    }

    return descriptions[confirmAction.type]
  }

  const filteredArchivedItems = mockArchivedGalleryItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(archivedSearchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(archivedSearchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(archivedSearchQuery.toLowerCase()))

    const matchesAlbum = archivedSelectedAlbum === "all" || item.album === archivedSelectedAlbum
    const matchesCategory = archivedSelectedCategory === "all" || item.category === archivedSelectedCategory

    return matchesSearch && matchesAlbum && matchesCategory
  })

  const archivedTotalPages = Math.ceil(filteredArchivedItems.length / archivedItemsPerPage)
  const archivedStartIndex = (archivedCurrentPage - 1) * archivedItemsPerPage
  const archivedEndIndex = archivedStartIndex + archivedItemsPerPage
  const paginatedArchivedItems = filteredArchivedItems.slice(archivedStartIndex, archivedEndIndex)

  const handleArchivedSelectAll = () => {
    if (archivedSelectedItems.length === paginatedArchivedItems.length) {
      setArchivedSelectedItems([])
    } else {
      setArchivedSelectedItems(paginatedArchivedItems.map((item) => item.id))
    }
  }

  const handleArchivedSelectItem = (id: number) => {
    setArchivedSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleRestoreItem = (id: number) => {
    setSelectedArchivedItem(id)
    setRestoreDialogOpen(true)
  }

  const handlePermanentDelete = (id: number) => {
    setSelectedArchivedItem(id)
    setPermanentDeleteDialogOpen(true)
  }

  const confirmRestore = () => {
    const item = mockArchivedGalleryItems.find((i) => i.id === selectedArchivedItem)
    if (item) {
      toast({
        title: "✅ Photo Restored",
        description: `"${item.title}" has been restored to the active gallery.`,
        className: "border-green-500/20 bg-green-500/5",
      })
    }
    setRestoreDialogOpen(false)
    setSelectedArchivedItem(null)
  }

  const confirmPermanentDelete = () => {
    const item = mockArchivedGalleryItems.find((i) => i.id === selectedArchivedItem)
    if (item) {
      toast({
        title: "✅ Photo Permanently Deleted",
        description: `"${item.title}" has been permanently removed from the system.`,
        className: "border-red-500/20 bg-red-500/5",
      })
    }
    setPermanentDeleteDialogOpen(false)
    setSelectedArchivedItem(null)
  }

  const handleBulkRestore = () => {
    toast({
      title: "✅ Photos Restored",
      description: `${archivedSelectedItems.length} photos have been restored to the active gallery.`,
      className: "border-green-500/20 bg-green-500/5",
    })
    setArchivedSelectedItems([])
  }

  const handleBulkPermanentDelete = () => {
    toast({
      title: "✅ Photos Permanently Deleted",
      description: `${archivedSelectedItems.length} photos have been permanently removed from the system.`,
      className: "border-red-500/20 bg-red-500/5",
    })
    setArchivedSelectedItems([])
  }

  return (
    <PageTransition>
      <div className="space-y-6" onClick={handleCloseContextMenu}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">School Gallery</h1>
            <p className="text-muted-foreground">Manage photos, albums, and media content for the school gallery</p>
          </div>
          <Button
            onClick={() => router.push("/superadmin/gallery/create")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Photos
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Photos</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">Published</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.published}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Featured</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.featured}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/30 dark:to-cyan-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">Total Views</p>
                  <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                    {stats.totalViews.toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search photos by title, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedAlbum} onValueChange={(value) => handleFilterChange(setSelectedAlbum, value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Albums" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Albums</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                    <SelectItem value="Community">Community</SelectItem>
                    <SelectItem value="Campus">Campus</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => handleFilterChange(setSelectedCategory, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Athletics">Athletics</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={(value) => handleFilterChange(setSelectedStatus, value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleBulkDelete}>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {}}>
                      <Archive className="h-3 w-3 mr-1" />
                      Archive
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {}}>
                      <Folder className="h-3 w-3 mr-1" />
                      Move to Album
                    </Button>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedItems([])} className="ml-auto">
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gallery Items</CardTitle>
                <CardDescription>
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} photos
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 items</SelectItem>
                      <SelectItem value="24">24 items</SelectItem>
                      <SelectItem value="48">48 items</SelectItem>
                      <SelectItem value="96">96 items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">Select All</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-4 gap-4">
                {paginatedItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                    onContextMenu={(e) => handleContextMenu(e, item.id)}
                  >
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => handleSelectItem(item.id)}
                        className="bg-white dark:bg-gray-900 border-2"
                      />
                    </div>
                    <div className="absolute top-2 right-2 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/superadmin/gallery/edit/${item.id}`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFeatureToggle(item.id)}>
                            <Star className="h-4 w-4 mr-2" />
                            {item.featured ? "Unfeature" : "Feature"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVisibilityToggle(item.id)}>
                            {item.visible ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Hide from Public
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Show to Public
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleArchive(item.id)}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                      <img
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {!item.visible && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-gray-500 text-white border-0">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hidden
                          </Badge>
                        </div>
                      )}
                      {item.featured && (
                        <div className="absolute bottom-2 left-2">
                          <Badge className="bg-yellow-500 text-white border-0">
                            <Star className="h-3 w-3 mr-1 fill-white" />
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-card">
                      <h3 className="font-semibold text-sm mb-1 truncate">{item.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {item.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.uploadDate).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            item.status === "published"
                              ? "bg-green-500/10 text-green-700 border-green-500/20"
                              : "bg-gray-500/10 text-gray-700 border-gray-500/20"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          <Folder className="h-3 w-3 mr-1" />
                          {item.album}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all"
                    onContextMenu={(e) => handleContextMenu(e, item.id)}
                  >
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => handleSelectItem(item.id)}
                    />
                    <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                      <img
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {!item.visible && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <EyeOff className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{item.title}</h3>
                        {item.featured && (
                          <Badge className="bg-yellow-500 text-white border-0">
                            <Star className="h-3 w-3 mr-1 fill-white" />
                            Featured
                          </Badge>
                        )}
                        {!item.visible && (
                          <Badge className="bg-gray-500 text-white border-0">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{item.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Folder className="h-3 w-3" />
                          {item.album}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {item.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        item.status === "published"
                          ? "bg-green-500/10 text-green-700 border-green-500/20"
                          : "bg-gray-500/10 text-gray-700 border-gray-500/20"
                      }
                    >
                      {item.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/superadmin/gallery/edit/${item.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFeatureToggle(item.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          {item.featured ? "Unfeature" : "Feature"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleVisibilityToggle(item.id)}>
                          {item.visible ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Hide from Public
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Show to Public
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleArchive(item.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <Button
                          variant={currentPage === 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(1)}
                          className="w-9"
                        >
                          1
                        </Button>
                        {currentPage > 4 && <span className="px-2 text-muted-foreground">...</span>}
                      </>
                    )}

                    {/* Pages around current */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return page === currentPage || page === currentPage - 1 || page === currentPage + 1
                      })
                      .map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-9"
                        >
                          {page}
                        </Button>
                      ))}

                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && <span className="px-2 text-muted-foreground">...</span>}
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-9"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-50/50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Archive className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-orange-900 dark:text-orange-100">Archived Gallery Items</CardTitle>
                  <CardDescription className="text-orange-700 dark:text-orange-300">
                    {mockArchivedGalleryItems.length} archived photo{mockArchivedGalleryItems.length !== 1 ? "s" : ""} •
                    Can be restored or permanently deleted
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowArchivedGallery(!showArchivedGallery)}
                className="border-orange-500/30 hover:bg-orange-500/10"
              >
                {showArchivedGallery ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Hide Archived
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show Archived
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          {showArchivedGallery && (
            <CardContent className="space-y-4">
              {/* Warning Notice */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-100 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-800">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Archived Gallery Items Policy
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    Archived photos are kept for 90 days before automatic permanent deletion. You can restore them to
                    the active gallery or permanently delete them manually at any time.
                  </p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search archived photos..."
                      value={archivedSearchQuery}
                      onChange={(e) => {
                        setArchivedSearchQuery(e.target.value)
                        setArchivedCurrentPage(1)
                      }}
                      className="pl-10 bg-white dark:bg-gray-950"
                    />
                  </div>
                  <Select
                    value={archivedSelectedAlbum}
                    onValueChange={(value) => {
                      setArchivedSelectedAlbum(value)
                      setArchivedCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[180px] bg-white dark:bg-gray-950">
                      <SelectValue placeholder="All Albums" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Albums</SelectItem>
                      <SelectItem value="Events">Events</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                      <SelectItem value="Community">Community</SelectItem>
                      <SelectItem value="Campus">Campus</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={archivedSelectedCategory}
                    onValueChange={(value) => {
                      setArchivedSelectedCategory(value)
                      setArchivedCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[180px] bg-white dark:bg-gray-950">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Athletics">Athletics</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {archivedSelectedItems.length > 0 && (
                  <div className="flex items-center gap-4 p-3 bg-orange-100 dark:bg-orange-950/30 rounded-lg border border-orange-300 dark:border-orange-800">
                    <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      {archivedSelectedItems.length} item{archivedSelectedItems.length > 1 ? "s" : ""} selected
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBulkRestore}
                        className="border-green-500/30 hover:bg-green-500/10 bg-transparent"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBulkPermanentDelete}
                        className="border-red-500/30 hover:bg-red-500/10 text-red-600 bg-transparent"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Permanently Delete
                      </Button>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setArchivedSelectedItems([])} className="ml-auto">
                      Clear Selection
                    </Button>
                  </div>
                )}
              </div>

              {/* Archived Items Table */}
              <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-950 opacity-70">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100">Archived Photos</h3>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Showing {archivedStartIndex + 1}-{Math.min(archivedEndIndex, filteredArchivedItems.length)} of{" "}
                        {filteredArchivedItems.length} archived photos
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Show:</span>
                        <Select
                          value={archivedItemsPerPage.toString()}
                          onValueChange={(value) => {
                            setArchivedItemsPerPage(Number(value))
                            setArchivedCurrentPage(1)
                          }}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12 items</SelectItem>
                            <SelectItem value="24">24 items</SelectItem>
                            <SelectItem value="48">48 items</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={
                            archivedSelectedItems.length === paginatedArchivedItems.length &&
                            paginatedArchivedItems.length > 0
                          }
                          onCheckedChange={handleArchivedSelectAll}
                        />
                        <span className="text-sm text-muted-foreground">Select All</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {paginatedArchivedItems.map((item) => (
                      <div
                        key={item.id}
                        className="group relative rounded-xl overflow-hidden border border-border hover:border-orange-500/50 transition-all duration-300"
                      >
                        <div className="absolute top-2 left-2 z-10">
                          <Checkbox
                            checked={archivedSelectedItems.includes(item.id)}
                            onCheckedChange={() => handleArchivedSelectItem(item.id)}
                            className="bg-white dark:bg-gray-900 border-2"
                          />
                        </div>
                        <div className="absolute top-2 right-2 z-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {}}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRestoreItem(item.id)}
                                className="text-green-600 dark:text-green-400"
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Restore
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handlePermanentDelete(item.id)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Permanently Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                          <img
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-12">
                            <Badge className="bg-orange-500 text-white border-0">
                              <Archive className="h-3 w-3 mr-1" />
                              Archived
                            </Badge>
                          </div>
                        </div>

                        <div className="p-3 bg-card">
                          <h3 className="font-semibold text-sm mb-1 truncate">{item.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>Archived: {new Date(item.archivedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3" />
                              <span>By: {item.archivedBy}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Tag className="h-3 w-3" />
                              <span className="truncate">{item.archivedReason}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              <Folder className="h-3 w-3 mr-1" />
                              {item.album}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {archivedTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t">
                      <div className="text-sm text-muted-foreground">
                        Page {archivedCurrentPage} of {archivedTotalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setArchivedCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={archivedCurrentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setArchivedCurrentPage((prev) => Math.min(archivedTotalPages, prev + 1))}
                          disabled={archivedCurrentPage === archivedTotalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {archivedStartIndex + 1}-{Math.min(archivedEndIndex, filteredArchivedItems.length)} of{" "}
                        {filteredArchivedItems.length}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Delete Confirmation Dialog - Replaced by Confirm Dialog */}
        {/* <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Photo</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this photo? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog> */}

        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    confirmAction?.type === "delete"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : confirmAction?.type === "feature"
                        ? "bg-yellow-100 dark:bg-yellow-900/30"
                        : confirmAction?.type === "hide"
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : confirmAction?.type === "show"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-blue-100 dark:bg-blue-900/30"
                  }`}
                >
                  <AlertCircle
                    className={`w-6 h-6 ${
                      confirmAction?.type === "delete"
                        ? "text-red-600"
                        : confirmAction?.type === "feature"
                          ? "text-yellow-600"
                          : confirmAction?.type === "hide"
                            ? "text-orange-600"
                            : confirmAction?.type === "show"
                              ? "text-green-600"
                              : "text-blue-600"
                    }`}
                  />
                </div>
                <div>
                  <DialogTitle className="text-2xl">{getActionDescription()?.title}</DialogTitle>
                  <DialogDescription className="text-base">{getActionDescription()?.message}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Photo Details */}
              {getActionDescription() &&
                typeof getActionDescription() === "object" &&
                getActionDescription().details && (
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Photo Details
                    </h4>
                    <div className="space-y-2">
                      {getActionDescription().details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Warning Message */}
              {getActionDescription() &&
                typeof getActionDescription() === "object" &&
                getActionDescription().warning && (
                  <div
                    className={`flex items-start gap-3 p-4 rounded-lg border ${
                      confirmAction?.type === "delete"
                        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                        : confirmAction?.type === "feature"
                          ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
                          : confirmAction?.type === "hide"
                            ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                            : confirmAction?.type === "show"
                              ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                              : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <AlertCircle
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        confirmAction?.type === "delete"
                          ? "text-red-600"
                          : confirmAction?.type === "feature"
                            ? "text-yellow-600"
                            : confirmAction?.type === "hide"
                              ? "text-orange-600"
                              : confirmAction?.type === "show"
                                ? "text-green-600"
                                : "text-blue-600"
                      }`}
                    />
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          confirmAction?.type === "delete"
                            ? "text-red-900 dark:text-red-100"
                            : confirmAction?.type === "feature"
                              ? "text-yellow-900 dark:text-yellow-100"
                              : confirmAction?.type === "hide"
                                ? "text-orange-900 dark:text-orange-100"
                                : confirmAction?.type === "show"
                                  ? "text-green-900 dark:text-green-100"
                                  : "text-blue-900 dark:text-blue-100"
                        }`}
                      >
                        Are you sure you want to {confirmAction?.type} this photo?
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          confirmAction?.type === "delete"
                            ? "text-red-700 dark:text-red-300"
                            : confirmAction?.type === "feature"
                              ? "text-yellow-700 dark:text-yellow-300"
                              : confirmAction?.type === "hide"
                                ? "text-orange-700 dark:text-orange-300"
                                : confirmAction?.type === "show"
                                  ? "text-green-700 dark:text-green-300"
                                  : "text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {getActionDescription().warning}
                      </p>
                    </div>
                  </div>
                )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAction}
                className={
                  confirmAction?.type === "delete"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : confirmAction?.type === "feature"
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                      : confirmAction?.type === "hide"
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : confirmAction?.type === "show"
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                }
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Yes,{" "}
                {confirmAction?.type === "delete"
                  ? "Delete"
                  : confirmAction?.type === "feature"
                    ? "Feature"
                    : confirmAction?.type === "unfeature"
                      ? "Unfeature"
                      : confirmAction?.type === "hide"
                        ? "Hide"
                        : confirmAction?.type === "show"
                          ? "Show"
                          : "Archive"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30">
                  <RotateCcw className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl">Restore Photo</DialogTitle>
                  <DialogDescription className="text-base">
                    This photo will be restored to the active gallery and become visible again.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Photo Details
                </h4>
                <div className="space-y-2">
                  {selectedArchivedItem &&
                    mockArchivedGalleryItems
                      .filter((i) => i.id === selectedArchivedItem)
                      .map((item) => (
                        <div key={item.id} className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Title: {item.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Album: {item.album}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">
                              Archived: {new Date(item.archivedDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Archived by: {item.archivedBy}</span>
                          </div>
                        </div>
                      ))}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Are you sure you want to restore this photo?
                  </p>
                  <p className="text-xs mt-1 text-green-700 dark:text-green-300">
                    The photo will be moved back to the active gallery and become visible to all users.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmRestore} className="bg-green-600 hover:bg-green-700 text-white">
                <RotateCcw className="w-4 h-4 mr-2" />
                Yes, Restore Photo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={permanentDeleteDialogOpen} onOpenChange={setPermanentDeleteDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl">Permanently Delete Photo</DialogTitle>
                  <DialogDescription className="text-base">
                    This action cannot be undone. The photo will be permanently removed from the system.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Photo Details
                </h4>
                <div className="space-y-2">
                  {selectedArchivedItem &&
                    mockArchivedGalleryItems
                      .filter((i) => i.id === selectedArchivedItem)
                      .map((item) => (
                        <div key={item.id} className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Title: {item.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Album: {item.album}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Total Views: {item.views}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">
                              Archived: {new Date(item.archivedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Are you absolutely sure you want to permanently delete this photo?
                  </p>
                  <p className="text-xs mt-1 text-red-700 dark:text-red-300">
                    This action cannot be undone. The photo and all its associated data will be permanently removed from
                    the database.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setPermanentDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmPermanentDelete} className="bg-red-600 hover:bg-red-700 text-white">
                <Trash2 className="w-4 h-4 mr-2" />
                Yes, Permanently Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {contextMenu && (
          <div
            className="fixed z-50 min-w-[200px] rounded-lg border bg-popover p-1 shadow-lg"
            style={{
              top: contextMenu.y,
              left: contextMenu.x,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => {
                  router.push(`/superadmin/gallery/edit/${contextMenu.itemId}`)
                  handleCloseContextMenu()
                }}
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => {
                  handleFeatureToggle(contextMenu.itemId)
                  handleCloseContextMenu()
                }}
              >
                <Star className="h-4 w-4" />
                {mockGalleryItems.find((i) => i.id === contextMenu.itemId)?.featured ? "Unfeature" : "Feature"}
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => {
                  handleVisibilityToggle(contextMenu.itemId)
                  handleCloseContextMenu()
                }}
              >
                {mockGalleryItems.find((i) => i.id === contextMenu.itemId)?.visible ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide from Public
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show to Public
                  </>
                )}
              </button>
              <div className="h-px bg-border my-1" />
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => {
                  toast({
                    title: "Downloaded",
                    description: "Photo downloaded successfully.",
                  })
                  handleCloseContextMenu()
                }}
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => {
                  toast({
                    title: "Copied",
                    description: "Photo duplicated successfully.",
                  })
                  handleCloseContextMenu()
                }}
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </button>
              <div className="h-px bg-border my-1" />
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => {
                  handleArchive(contextMenu.itemId)
                  handleCloseContextMenu()
                }}
              >
                <Archive className="h-4 w-4" />
                Archive
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 transition-colors"
                onClick={() => {
                  handleDelete(contextMenu.itemId)
                  handleCloseContextMenu()
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
