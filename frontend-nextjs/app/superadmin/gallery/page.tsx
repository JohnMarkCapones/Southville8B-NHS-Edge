"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  Star,
  Download,
  Eye,
  Calendar,
  Tag,
  ImageIcon,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useGallery } from "@/hooks/useGallery"
import { GalleryItem } from "@/lib/api/types/gallery"
import { useToast } from "@/hooks/use-toast"
import { getThumbnailUrl, getCardUrl, getImageAltText } from "@/lib/utils/gallery-images"

export default function GalleryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const {
    items,
    loading,
    error,
    pagination,
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    downloadItem,
    loadDeletedItems,
    restoreItem
  } = useGallery()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [showArchive, setShowArchive] = useState(false)
  const [archivedItems, setArchivedItems] = useState<GalleryItem[]>([])
  const [loadingArchive, setLoadingArchive] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)

  // Load items on component mount
  useEffect(() => {
    loadItems()
  }, [loadItems])

  // Auto-refresh gallery when page regains focus
  useEffect(() => {
    const handleFocus = () => {
      loadItems()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadItems])

  // Filter items based on search and category
  const filteredItems = items.filter((item) => {
    // Exclude soft-deleted items (safety check)
    if (item.is_deleted || item.deleted_at) {
      return false
    }

    const matchesSearch = !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caption?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" ||
      determineCategoryFromTags(item.tags || []) === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Pagination
  const itemsPerPage = 12
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredItems.length)
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  // Stats
  const stats = {
    total: items.length,
    featured: items.filter(item => item.is_featured).length,
    thisMonth: items.filter(item => {
      const itemDate = new Date(item.created_at)
      const now = new Date()
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
    }).length
  }

  // Helper function to determine category from tags
  function determineCategoryFromTags(tags: string[]): string {
    if (!tags || tags.length === 0) return "Uncategorized"
    return tags[0] // Use first tag as category
  }

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedItems.length === paginatedItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(paginatedItems.map(item => item.id))
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Action handlers
  const handleDelete = (itemId: string) => {
    // Check if item is already deleted
    const item = items.find(i => i.id === itemId)
    if (item && (item.is_deleted || item.deleted_at)) {
      // Item already deleted, remove from list immediately
      toast({
        title: "Item Already Deleted",
        description: "This gallery item was already deleted.",
      })
      return
    }

    setItemToDelete(itemId)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      setDeleting(true)
      const success = await deleteItem(itemToDelete)
      setDeleting(false)

      if (success) {
        setShowDeleteDialog(false)
        setItemToDelete(null)
        setSelectedItems([])
      }
    }
  }

  const handleFeatureToggle = async (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    // Check if item is deleted
    if (item.is_deleted || item.deleted_at) {
      toast({
        title: "Cannot Update Deleted Item",
        description: "This item has been deleted. Restore it first to make changes.",
      })
      return
    }

    setTogglingFeatured(itemId)
    await updateItem(itemId, { is_featured: !item.is_featured })
    setTogglingFeatured(null)
  }

  const handleDownload = async (itemId: string) => {
    setDownloading(itemId)
    const downloadUrl = await downloadItem(itemId)
    setDownloading(null)

    if (downloadUrl) {
      // Open download URL in new tab
      window.open(downloadUrl, '_blank')
    }
  }

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault()
    // Context menu logic here
  }

  const handleLoadArchive = async () => {
    setLoadingArchive(true)
    const deleted = await loadDeletedItems()
    setArchivedItems(deleted)
    setLoadingArchive(false)
    setShowArchive(true)
  }

  const handleRestore = async (itemId: string) => {
    setRestoring(itemId)
    const success = await restoreItem(itemId)
    setRestoring(null)

    if (success) {
      // Remove from archive list and refresh main gallery
      setArchivedItems(prev => prev.filter(item => item.id !== itemId))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gallery Management</h1>
          <p className="text-muted-foreground">Manage your school's photo gallery</p>
        </div>
        <Button onClick={() => router.push("/superadmin/gallery/create")}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Photos
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">{stats.featured}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Gallery Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gallery Items</CardTitle>
              <CardDescription>
                {filteredItems.length} items found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search gallery items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Events">Events</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Academics">Academics</SelectItem>
                <SelectItem value="Uncategorized">Uncategorized</SelectItem>
              </SelectContent>
            </Select>
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedItems.length} selected
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    // Handle bulk delete
                    selectedItems.forEach(id => handleDelete(id))
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading gallery items...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <p className="text-red-500">Failed to load gallery items</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No gallery items found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedCategory !== "all"
                      ? "Try adjusting your search or filters"
                      : "Upload your first photos to get started"}
                  </p>
                  <Button onClick={() => router.push("/superadmin/gallery/create")} variant="outline">
                    Upload Photos
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-4 gap-4">
                  {paginatedItems.map((item) => {
                    const category = determineCategoryFromTags(item.tags || [])
                    return (
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
                              <DropdownMenuItem
                                onClick={() => handleFeatureToggle(item.id)}
                                disabled={togglingFeatured === item.id}
                              >
                                {togglingFeatured === item.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {item.is_featured ? "Unfeaturing..." : "Featuring..."}
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-4 w-4 mr-2" />
                                    {item.is_featured ? "Unfeature" : "Feature"}
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownload(item.id)}
                                disabled={downloading === item.id}
                              >
                                {downloading === item.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
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
                            src={getThumbnailUrl(item)}
                            alt={getImageAltText(item)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {item.is_featured && (
                            <div className="absolute bottom-2 left-2">
                              <Badge className="bg-yellow-500 text-white border-0">
                                <Star className="h-3 w-3 mr-1 fill-white" />
                                Featured
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-card">
                          <h3 className="font-semibold text-sm mb-1 truncate">{item.title || 'Untitled'}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.caption || ''}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {item.views_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-700 border-green-500/20"
                            >
                              Published
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* List View */
                <div className="space-y-4">
                  {paginatedItems.map((item) => {
                    const category = determineCategoryFromTags(item.tags || [])
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                        />
                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                          <img
                            src={getThumbnailUrl(item)}
                            alt={getImageAltText(item)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{item.title || 'Untitled'}</h3>
                            {item.is_featured && (
                              <Badge className="bg-yellow-500 text-white border-0">
                                <Star className="h-3 w-3 mr-1 fill-white" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{item.caption || ''}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {category}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {item.views_count} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-700 border-green-500/20"
                        >
                          Published
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
                            <DropdownMenuItem
                              onClick={() => handleFeatureToggle(item.id)}
                              disabled={togglingFeatured === item.id}
                            >
                              {togglingFeatured === item.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  {item.is_featured ? "Unfeaturing..." : "Featuring..."}
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 mr-2" />
                                  {item.is_featured ? "Unfeature" : "Feature"}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownload(item.id)}
                              disabled={downloading === item.id}
                            >
                              {downloading === item.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
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
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
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
                    {startIndex + 1}-{endIndex} of {filteredItems.length}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Archive Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Archive</CardTitle>
              <CardDescription>View and restore deleted gallery items</CardDescription>
            </div>
            <Button
              onClick={handleLoadArchive}
              variant="outline"
              disabled={loadingArchive}
            >
              {loadingArchive ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : showArchive ? (
                'Refresh Archive'
              ) : (
                'Show Archive'
              )}
            </Button>
          </div>
        </CardHeader>
        {showArchive && (
          <CardContent>
            {archivedItems.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Archived Items</h3>
                <p className="text-muted-foreground">All deleted items have been permanently removed or restored.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {archivedItems.map((item) => {
                  const category = determineCategoryFromTags(item.tags || [])
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30"
                    >
                      <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative opacity-60">
                        <img
                          src={getThumbnailUrl(item)}
                          alt={getImageAltText(item)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate text-muted-foreground">{item.title || 'Untitled'}</h3>
                          <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">
                            Deleted
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{item.caption || ''}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Deleted {new Date(item.deleted_at!).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRestore(item.id)}
                        disabled={restoring === item.id}
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {restoring === item.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Restoring...
                          </>
                        ) : (
                          'Restore'
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Gallery Item</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete this gallery item? You can restore it later from the Archive section.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


















