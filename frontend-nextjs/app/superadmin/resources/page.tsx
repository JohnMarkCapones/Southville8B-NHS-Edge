"use client"

import type React from "react"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useSuperadminResources } from "@/hooks/useSuperadminResources"
import {
  Search,
  Upload,
  Download,
  Trash2,
  Edit,
  MoreVertical,
  FolderOpen,
  FileText,
  File,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileArchive,
  Eye,
  Users,
  GraduationCap,
  UserCog,
  Globe,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  Calendar,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Copy,
  Share2,
  Folder,
  Move,
  X,
  CloudUpload,
  Loader2,
  ChevronDown,
  FolderPlus,
  Home,
  Star,
  Clock,
  FolderTree,
} from "lucide-react"

interface FolderType {
  id: string
  name: string
  parentId: string | null
  description?: string
  color?: string
  icon?: string
  createdAt: string
  createdBy: string
  fileCount?: number
  totalSize?: number
  isStarred?: boolean
}

interface ResourceType {
  id: string
  name: string
  description: string
  folderId: string // Changed from sectionId to folderId
  fileType: string
  fileSize: string
  uploadDate: string
  uploadedBy: string
  downloads: number
  visibility: string
  tags: string[]
  isStarred?: boolean
}

const mockFolders: FolderType[] = [
  {
    id: "root",
    name: "Root",
    parentId: null,
    description: "Root folder",
    createdAt: "2024-01-01",
    createdBy: "System",
  },
  {
    id: "1",
    name: "School Forms",
    parentId: "root",
    description: "Official school forms and documents",
    color: "blue",
    icon: "FileText",
    createdAt: "2024-01-15",
    createdBy: "Admin User",
    fileCount: 12,
    totalSize: 24.5,
    isStarred: true,
  },
  {
    id: "1-1",
    name: "2024",
    parentId: "1",
    description: "Forms for 2024",
    color: "blue",
    createdAt: "2024-01-15",
    createdBy: "Admin User",
    fileCount: 8,
    totalSize: 16.2,
  },
  {
    id: "1-2",
    name: "2023",
    parentId: "1",
    description: "Forms for 2023",
    color: "blue",
    createdAt: "2023-01-15",
    createdBy: "Admin User",
    fileCount: 4,
    totalSize: 8.3,
  },
  {
    id: "2",
    name: "Policy Documents",
    parentId: "root",
    description: "School policies and guidelines",
    color: "purple",
    icon: "FileText",
    createdAt: "2024-01-10",
    createdBy: "Admin User",
    fileCount: 8,
    totalSize: 15.6,
  },
  {
    id: "3",
    name: "Templates",
    parentId: "root",
    description: "Document templates for staff",
    color: "green",
    icon: "File",
    createdAt: "2024-01-08",
    createdBy: "Admin User",
    fileCount: 15,
    totalSize: 5.2,
    isStarred: true,
  },
  {
    id: "3-1",
    name: "Lesson Plans",
    parentId: "3",
    description: "Lesson plan templates",
    color: "green",
    createdAt: "2024-01-08",
    createdBy: "Admin User",
    fileCount: 6,
    totalSize: 2.1,
  },
  {
    id: "3-2",
    name: "Reports",
    parentId: "3",
    description: "Report templates",
    color: "green",
    createdAt: "2024-01-08",
    createdBy: "Admin User",
    fileCount: 9,
    totalSize: 3.1,
  },
  {
    id: "4",
    name: "Teacher Guides",
    parentId: "root",
    description: "Teaching resources and guides",
    color: "orange",
    icon: "FileText",
    createdAt: "2024-01-05",
    createdBy: "Admin User",
    fileCount: 20,
    totalSize: 45.8,
  },
  {
    id: "5",
    name: "Student Handbooks",
    parentId: "root",
    description: "Student reference materials",
    color: "cyan",
    icon: "FileText",
    createdAt: "2024-01-01",
    createdBy: "Admin User",
    fileCount: 5,
    totalSize: 28.4,
  },
]

const mockResources: ResourceType[] = [
  {
    id: "1",
    name: "Enrollment Form 2024.pdf",
    description: "Official enrollment form for academic year 2024-2025",
    folderId: "1-1",
    fileType: "pdf",
    fileSize: "2.4 MB",
    uploadDate: "2024-01-15",
    uploadedBy: "Admin User",
    downloads: 245,
    visibility: "Everyone",
    tags: ["enrollment", "forms", "2024"],
    isStarred: true,
  },
  {
    id: "2",
    name: "Student Code of Conduct.pdf",
    description: "School rules and regulations for students",
    folderId: "2",
    fileType: "pdf",
    fileSize: "1.8 MB",
    uploadDate: "2024-01-10",
    uploadedBy: "Admin User",
    downloads: 189,
    visibility: "Students Only",
    tags: ["policy", "conduct", "rules"],
  },
  {
    id: "3",
    name: "Lesson Plan Template.docx",
    description: "Standard lesson plan template for teachers",
    folderId: "3-1",
    fileType: "docx",
    fileSize: "156 KB",
    uploadDate: "2024-01-08",
    uploadedBy: "Admin User",
    downloads: 156,
    visibility: "Teachers Only",
    tags: ["template", "lesson", "planning"],
  },
  {
    id: "4",
    name: "Classroom Management Guide.pdf",
    description: "Best practices for classroom management",
    folderId: "4",
    fileType: "pdf",
    fileSize: "3.2 MB",
    uploadDate: "2024-01-05",
    uploadedBy: "Admin User",
    downloads: 432,
    visibility: "Teachers Only",
    tags: ["guide", "classroom", "management"],
  },
  {
    id: "5",
    name: "Student Handbook 2024.pdf",
    description: "Complete student handbook for 2024-2025",
    folderId: "5",
    fileType: "pdf",
    fileSize: "5.6 MB",
    uploadDate: "2024-01-01",
    uploadedBy: "Admin User",
    downloads: 598,
    visibility: "Students Only",
    tags: ["handbook", "student", "2024"],
  },
  {
    id: "6",
    name: "Parent Consent Form.pdf",
    description: "Consent form for field trips and activities",
    folderId: "1-1",
    fileType: "pdf",
    fileSize: "890 KB",
    uploadDate: "2023-12-28",
    uploadedBy: "Admin User",
    downloads: 167,
    visibility: "Everyone",
    tags: ["consent", "parent", "form"],
  },
  {
    id: "7",
    name: "Grading System Policy.pdf",
    description: "Official grading system and assessment policy",
    folderId: "2",
    fileType: "pdf",
    fileSize: "1.2 MB",
    uploadDate: "2023-12-25",
    uploadedBy: "Admin User",
    downloads: 289,
    visibility: "Everyone",
    tags: ["grading", "policy", "assessment"],
  },
  {
    id: "8",
    name: "Report Card Template.xlsx",
    description: "Excel template for student report cards",
    folderId: "3-2",
    fileType: "xlsx",
    fileSize: "245 KB",
    uploadDate: "2023-12-20",
    uploadedBy: "Admin User",
    downloads: 213,
    visibility: "Teachers Only",
    tags: ["template", "report", "grades"],
  },
]

export default function ResourcesPage() {
  const { toast } = useToast()
  const router = useRouter()

  // Local UI state (not managed by API)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["root", "1", "3"]))
  const [folderTreeVisible, setFolderTreeVisible] = useState(true)

  // Real API integration
  const {
    folders,
    files: resources,
    currentFolder,
    analytics,
    loading,
    error,
    currentFolderId: apiCurrentFolderId,
    setCurrentFolderId: setApiCurrentFolderId,
    createFolder: apiCreateFolder,
    updateFolder: apiUpdateFolder,
    deleteFolder: apiDeleteFolder,
    uploadFile: apiUploadFile,
    updateFile: apiUpdateFile,
    deleteFile: apiDeleteFile,
    downloadFile: apiDownloadFile,
    bulkDeleteFiles: apiBulkDeleteFiles,
    bulkMoveFiles: apiBulkMoveFiles,
    bulkUpdateVisibility: apiBulkUpdateVisibility,
    searchQuery: apiSearchQuery,
    setSearchQuery: setApiSearchQuery,
    mimeTypeFilter: apiMimeTypeFilter,
    setMimeTypeFilter: setApiMimeTypeFilter,
    visibilityFilter: apiVisibilityFilter,
    setVisibilityFilter: setApiVisibilityFilter,
    sortBy: apiSortBy,
    setSortBy: setApiSortBy,
    sortOrder: apiSortOrder,
    setSortOrder: setApiSortOrder,
    pagination,
    setPage: setApiPage,
    setLimit: setApiLimit,
    refetch,
  } = useSuperadminResources({
    initialFileParams: {
      page: 1,
      limit: 12,
    },
  })

  // Local UI state (not managed by API)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedResources, setSelectedResources] = useState<string[]>([])

  // Dialog states
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    resource: any
  }>({ isOpen: false, resource: null })
  const [visibilityConfirmation, setVisibilityConfirmation] = useState<{
    isOpen: boolean
    resource: any
    newVisibility: string
  }>({ isOpen: false, resource: null, newVisibility: "" })
  const [moveFolderDialog, setMoveFolderDialog] = useState<{
    isOpen: boolean
    resourceIds: string[]
  }>({ isOpen: false, resourceIds: [] })

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)

  // Form states for upload modal
  const [uploadFormData, setUploadFormData] = useState({
    folder: apiCurrentFolderId || "root",
    title: "",
    description: "",
    visibility: "Everyone",
    tags: "",
  })

  const [createFolderFormData, setCreateFolderFormData] = useState({
    name: "",
    description: "",
    color: "blue",
    parentId: apiCurrentFolderId || "root",
  })

  // Update form data when current folder changes
  useEffect(() => {
    setUploadFormData(prev => ({
      ...prev,
      folder: apiCurrentFolderId || "root",
    }))
    setCreateFolderFormData(prev => ({
      ...prev,
      parentId: apiCurrentFolderId || "root",
    }))
  }, [apiCurrentFolderId])

  // Debounced search (performance optimization)
  const [debouncedSearch, setDebouncedSearch] = useState(apiSearchQuery)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(apiSearchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [apiSearchQuery])

  const getFolderPath = useCallback(
    (folderId: string): FolderType[] => {
      const path: FolderType[] = []
      let currentId: string | null = folderId

      while (currentId) {
        const folder = folders.find((f) => f.id === currentId)
        if (folder) {
          path.unshift(folder)
          currentId = folder.parentId
        } else {
          break
        }
      }

      return path
    },
    [folders],
  )

  const getSubfolders = useCallback(
    (parentId: string): FolderType[] => {
      return folders.filter((f) => f.parentId === parentId)
    },
    [folders],
  )

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }, [])

  // Resources are already filtered by the API, so we can use them directly
  const filteredResources = resources

  // Pagination is handled by the API
  const paginatedResources = filteredResources
  const totalPages = pagination?.totalPages || 1
  const startIndex = pagination ? (pagination.page - 1) * pagination.limit : 0
  const endIndex = pagination ? startIndex + pagination.limit : filteredResources.length

  const stats = useMemo(() => {
    const currentFolderResources =
      apiCurrentFolderId === "root" || !apiCurrentFolderId ? resources : resources.filter((r) => r.folder_id === apiCurrentFolderId)

    return {
      totalFiles: currentFolderResources.length,
      totalDownloads: currentFolderResources.reduce((sum, r) => sum + (r.download_count || 0), 0),
      totalFolders: getSubfolders(apiCurrentFolderId || "root").length,
      totalStorage: currentFolderResources.reduce((sum, r) => sum + (r.file_size_bytes || 0), 0).toFixed(2),
    }
  }, [resources, apiCurrentFolderId, getSubfolders])

  // File type icon helper (works with MIME types from API)
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-600" />
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-600" />
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5 text-green-600" />
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return <FileText className="w-5 h-5 text-orange-600" />
    } else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) {
      return <FileArchive className="w-5 h-5 text-purple-600" />
    } else if (mimeType.includes('image')) {
      return <FileImage className="w-5 h-5 text-pink-600" />
    } else if (mimeType.includes('video')) {
      return <FileVideo className="w-5 h-5 text-cyan-600" />
    } else {
      return <File className="w-5 h-5 text-gray-600" />
    }
  }

  // Visibility badge helper
  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "Everyone":
        return (
          <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
            <Globe className="w-3 h-3 mr-1" />
            Everyone
          </Badge>
        )
      case "Students Only":
        return (
          <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">
            <GraduationCap className="w-3 h-3 mr-1" />
            Students
          </Badge>
        )
      case "Teachers Only":
        return (
          <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20">
            <UserCog className="w-3 h-3 mr-1" />
            Teachers
          </Badge>
        )
      case "Staff Only":
        return (
          <Badge className="bg-orange-500/10 text-orange-700 border-orange-500/20">
            <Users className="w-3 h-3 mr-1" />
            Staff
          </Badge>
        )
      default:
        return <Badge variant="outline">{visibility}</Badge>
    }
  }

  // Handlers
  const handleSelectAll = useCallback(() => {
    if (selectedResources.length === paginatedResources.length) {
      setSelectedResources([])
    } else {
      setSelectedResources(paginatedResources.map((r) => r.id))
    }
  }, [selectedResources, paginatedResources])

  const handleSelectResource = useCallback((id: string) => {
    setSelectedResources((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }, [])

  const handleDownload = useCallback(
    async (resource: any) => {
      try {
        toast({
          title: "📥 Download Started",
          description: `Downloading ${resource.title || resource.name}...`,
          className: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20",
        })

        await apiDownloadFile(resource.id)
        
        toast({
          title: "✅ Download Complete",
          description: `${resource.title || resource.name} downloaded successfully`,
          className: "border-green-500/20 bg-green-50/50 dark:bg-green-950/20",
        })
      } catch (error) {
        console.error('Download error:', error)
        toast({
          title: "❌ Download Failed",
          description: "Failed to download file. Please try again.",
          variant: "destructive",
        })
      }
    },
    [toast, apiDownloadFile],
  )

  const handleDelete = useCallback((resource: any) => {
    setDeleteConfirmation({ isOpen: true, resource })
  }, [])

  const confirmDelete = useCallback(async () => {
    if (deleteConfirmation.resource) {
      try {
        await apiDeleteFile(deleteConfirmation.resource.id)
        
        toast({
          title: "✅ File Deleted",
          description: `${deleteConfirmation.resource.title || deleteConfirmation.resource.name} has been permanently removed.`,
          className: "border-green-500/20 bg-green-50/50 dark:bg-green-950/20",
        })

        setDeleteConfirmation({ isOpen: false, resource: null })
      } catch (error) {
        console.error('Delete error:', error)
        toast({
          title: "❌ Delete Failed",
          description: "Failed to delete file. Please try again.",
          variant: "destructive",
        })
      }
    }
  }, [deleteConfirmation, toast, apiDeleteFile])

  const handleVisibilityChange = useCallback((resource: any, newVisibility: string) => {
    setVisibilityConfirmation({ isOpen: true, resource, newVisibility })
  }, [])

  const confirmVisibilityChange = useCallback(() => {
    if (visibilityConfirmation.resource) {
      // TODO: Connect to database - Update visibility
      setResources((prev) =>
        prev.map((r) =>
          r.id === visibilityConfirmation.resource.id ? { ...r, visibility: visibilityConfirmation.newVisibility } : r,
        ),
      )

      toast({
        title: "✅ Visibility Updated",
        description: `${visibilityConfirmation.resource.name} is now visible to ${visibilityConfirmation.newVisibility}`,
        className: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20",
      })

      setVisibilityConfirmation({ isOpen: false, resource: null, newVisibility: "" })
    }
  }, [visibilityConfirmation, toast])

  const handleCreateFolder = useCallback(async () => {
    if (!createFolderFormData.name) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please provide a folder name",
        className: "border-orange-500/20 bg-orange-50/50 dark:bg-orange-950/20",
      })
      return
    }

    try {
      const newFolder = await apiCreateFolder({
        name: createFolderFormData.name,
        description: createFolderFormData.description,
        parent_id: createFolderFormData.parentId === "root" ? undefined : createFolderFormData.parentId,
      })

      toast({
        title: "✅ Folder Created",
        description: `${createFolderFormData.name} has been created successfully`,
        className: "border-green-500/20 bg-green-50/50 dark:bg-green-950/20",
      })

      setCreateFolderDialogOpen(false)
      setCreateFolderFormData({
        name: "",
        description: "",
        color: "blue",
        parentId: apiCurrentFolderId || "root",
      })
    } catch (error) {
      console.error('Create folder error:', error)
      toast({
        title: "❌ Create Failed",
        description: "Failed to create folder. Please try again.",
        variant: "destructive",
      })
    }
  }, [createFolderFormData, apiCurrentFolderId, toast, apiCreateFolder])

  const handleMoveToFolder = useCallback(
    (targetFolderId: string) => {
      // TODO: Connect to database - Move resources to folder
      setResources((prev) =>
        prev.map((r) => (moveFolderDialog.resourceIds.includes(r.id) ? { ...r, folderId: targetFolderId } : r)),
      )

      const targetFolder = folders.find((f) => f.id === targetFolderId)

      toast({
        title: "✅ Files Moved",
        description: `${moveFolderDialog.resourceIds.length} file(s) moved to ${targetFolder?.name || "folder"}`,
        className: "border-green-500/20 bg-green-50/50 dark:bg-green-950/20",
      })

      setMoveFolderDialog({ isOpen: false, resourceIds: [] })
      setSelectedResources([])
    },
    [moveFolderDialog, folders, toast],
  )

  const handleToggleStar = useCallback(
    (resourceId: string) => {
      // TODO: Connect to database - Toggle star status
      setResources((prev) => prev.map((r) => (r.id === resourceId ? { ...r, isStarred: !r.isStarred } : r)))

      toast({
        title: "⭐ Updated",
        description: "Favorite status updated",
        className: "border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-950/20",
      })
    },
    [toast],
  )

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragCounter((prev) => prev + 1)
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true)
      }
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragCounter((prev) => {
        const newCounter = prev - 1
        if (newCounter === 0) {
          setIsDragging(false)
        }
        return newCounter
      })
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      setDragCounter(0)

      const files = Array.from(e.dataTransfer?.files || [])
      if (files.length > 0) {
        handleFilesDropped(files)
      }
    }

    document.addEventListener("dragenter", handleDragEnter)
    document.addEventListener("dragleave", handleDragLeave)
    document.addEventListener("dragover", handleDragOver)
    document.addEventListener("drop", handleDrop)

    return () => {
      document.removeEventListener("dragenter", handleDragEnter)
      document.removeEventListener("dragleave", handleDragLeave)
      document.removeEventListener("dragover", handleDragOver)
      document.removeEventListener("drop", handleDrop)
    }
  }, [])

  const handleFilesDropped = useCallback((files: File[]) => {
    console.log("[v0] Files dropped:", files)
    setUploadingFiles(files)
    setUploadModalOpen(true)

    // Generate PDF preview for first PDF file
    const firstPdf = files.find((f) => f.type === "application/pdf")
    if (firstPdf) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPdfPreview(e.target?.result as string)
      }
      reader.readAsDataURL(firstPdf)
    }
  }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        handleFilesDropped(files)
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [handleFilesDropped],
  )

  const handleBrowseFiles = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleUploadSubmit = useCallback(async () => {
    if (!uploadFormData.folder || !uploadFormData.title) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please fill in folder and title fields",
        className: "border-orange-500/20 bg-orange-50/50 dark:bg-orange-950/20",
      })
      return
    }

    try {
      // Upload each file
      for (const file of uploadingFiles) {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))
        
        await apiUploadFile(file, {
          folder_id: uploadFormData.folder,
          title: uploadFormData.title,
          description: uploadFormData.description,
          visibility: uploadFormData.visibility,
          tags: uploadFormData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        })
        
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))
      }

      toast({
        title: "✅ Upload Complete",
        description: `${uploadingFiles.length} file(s) uploaded successfully`,
        className: "border-green-500/20 bg-green-50/50 dark:bg-green-950/20",
      })

      // Reset states
      setUploadModalOpen(false)
      setUploadingFiles([])
      setUploadProgress({})
      setPdfPreview(null)
      setUploadFormData({
        folder: apiCurrentFolderId || "root",
        title: "",
        description: "",
        visibility: "Everyone",
        tags: "",
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "❌ Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      })
    }
  }, [uploadingFiles, uploadFormData, toast, apiCurrentFolderId, apiUploadFile])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const FolderTreeItem = ({ folder, level = 0 }: { folder: any; level?: number }) => {
    // Use the children array from the API response instead of filtering
    const subfolders = folder.children || []
    const hasSubfolders = subfolders.length > 0
    const isExpanded = expandedFolders.has(folder.id)
    const isActive = apiCurrentFolderId === folder.id

    return (
      <div>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
            isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent hover:text-accent-foreground"
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => setApiCurrentFolderId(folder.id)}
        >
          {hasSubfolders && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(folder.id)
              }}
              className="p-0.5 hover:bg-accent/50 rounded"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          {!hasSubfolders && <div className="w-5" />}
          <Folder className="w-4 h-4 text-blue-600" />
          <span className="text-sm flex-1 truncate">{folder.name}</span>
          {folder.file_count !== undefined && folder.file_count > 0 && (
            <Badge variant="secondary" className="text-xs">
              {folder.file_count}
            </Badge>
          )}
        </div>
        {hasSubfolders && isExpanded && (
          <div>
            {subfolders.map((subfolder) => (
              <FolderTreeItem key={subfolder.id} folder={subfolder} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {isDragging && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[2px] animate-in fade-in-0 duration-200" />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 pointer-events-none">
            <div className="bg-gradient-to-br from-blue-500/90 to-purple-600/90 backdrop-blur-xl border-4 border-dashed border-white/50 rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <CloudUpload className="w-10 h-10 text-white animate-bounce" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold text-white drop-shadow-lg">Drop Files Here</h2>
                  <p className="text-lg text-white/90 drop-shadow">Release to upload your files</p>
                </div>
                <div className="flex items-center gap-3 text-white/80 text-sm">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>PDF</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Word</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Excel</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileArchive className="w-4 h-4" />
                    <span>ZIP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {folderTreeVisible && (
        <div className="w-80 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-primary" />
                Folders
              </h2>
              <Button size="sm" variant="ghost" onClick={() => setFolderTreeVisible(false)} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={() => {
                setCreateFolderFormData({ ...createFolderFormData, parentId: apiCurrentFolderId || "root" })
                setCreateFolderDialogOpen(true)
              }}
              className="w-full"
              size="sm"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {/* Quick Access */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground px-3 py-2">QUICK ACCESS</p>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                    apiCurrentFolderId === "root" || !apiCurrentFolderId
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => setApiCurrentFolderId("root")}
                >
                  <Home className="w-4 h-4" />
                  <span className="text-sm flex-1">All Files</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm flex-1">Starred</span>
                  <Badge variant="secondary" className="text-xs">
                    {resources.filter((r) => r.isStarred).length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm flex-1">Recent</span>
                </div>
              </div>

              {/* Folder Tree */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground px-3 py-2">FOLDERS</p>
                {folders.filter(f => !f.parent_id).map((folder) => (
                  <FolderTreeItem key={folder.id} folder={folder} />
                ))}
              </div>
            </div>
          </div>

          {/* Storage Info */}
          <div className="p-4 border-t border-border">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Storage Used</span>
                <span className="font-medium">{stats.totalStorage} MB</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  style={{ width: "45%" }}
                />
              </div>
              <p className="text-xs text-muted-foreground">45% of 200 MB used</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {!folderTreeVisible && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFolderTreeVisible(true)}
                      className="h-8 w-8 p-0"
                    >
                      <FolderTree className="w-4 h-4" />
                    </Button>
                  )}
                  <h1 className="text-3xl font-bold text-foreground">Resources Management</h1>
                </div>
                <p className="text-muted-foreground">
                  Manage downloadable files, documents, and resources with organized folders
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateFolderFormData({ ...createFolderFormData, parentId: apiCurrentFolderId || "root" })
                    setCreateFolderDialogOpen(true)
                  }}
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </Button>
                <Button onClick={() => setUploadModalOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  {getFolderPath(apiCurrentFolderId || "root").map((folder, index, array) => (
                    <div key={folder.id} className="flex items-center gap-2">
                      {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      <button
                        onClick={() => setApiCurrentFolderId(folder.id)}
                        className={`hover:text-primary transition-colors ${
                          index === array.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {folder.name}
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="border-blue-500/20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Files</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalFiles}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-500/20 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">Downloads</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {stats.totalDownloads.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-500/20 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Subfolders</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalFolders}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <FolderOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-500/20 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Storage</p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.totalStorage} MB</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <HardDrive className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {(() => {
              // Get current folder's children from the hierarchical structure
              const currentFolder = folders.find(f => f.id === apiCurrentFolderId)
              const childFolders = currentFolder?.children || folders.filter(f => f.parent_id === null)
              return childFolders.length > 0
            })() && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-primary" />
                    Folders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {(() => {
                      // Get current folder's children from the hierarchical structure
                      const currentFolder = folders.find(f => f.id === apiCurrentFolderId)
                      const childFolders = currentFolder?.children || folders.filter(f => f.parent_id === null)
                      return childFolders.map((folder) => (
                      <div
                        key={folder.id}
                        className="group relative rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer"
                        onClick={() => setApiCurrentFolderId(folder.id)}
                      >
                        <div className="p-4 bg-gradient-to-br from-muted/50 to-muted/30">
                          <div className="flex items-start justify-between mb-3">
                            <div
                              className={`w-12 h-12 rounded-xl bg-${folder.color}-500/10 flex items-center justify-center`}
                            >
                              <Folder className={`w-6 h-6 text-${folder.color}-600`} />
                            </div>
                            {folder.isStarred && <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />}
                          </div>
                          <h3 className="font-semibold text-sm mb-1 truncate">{folder.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{folder.description}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{folder.fileCount} files</span>
                            <span>{folder.totalSize?.toFixed(1)} MB</span>
                          </div>
                        </div>
                      </div>
                      ))
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search files by name, description, or tags..."
                        value={apiSearchQuery}
                        onChange={(e) => {
                          setApiSearchQuery(e.target.value)
                          setApiPage(1)
                        }}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={apiMimeTypeFilter || "all"}
                      onValueChange={(value) => {
                        setApiMimeTypeFilter(value === "all" ? "" : value)
                        setApiPage(1)
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All File Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All File Types</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="docx">Word</SelectItem>
                        <SelectItem value="xlsx">Excel</SelectItem>
                        <SelectItem value="pptx">PowerPoint</SelectItem>
                        <SelectItem value="zip">Archive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={apiVisibilityFilter || "all"}
                      onValueChange={(value) => {
                        setApiVisibilityFilter(value === "all" ? "" : value)
                        setApiPage(1)
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Visibility</SelectItem>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="teachers">Teachers Only</SelectItem>
                        <SelectItem value="staff">Staff Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={apiSortBy} onValueChange={setApiSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date (Newest)</SelectItem>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="downloads">Most Downloaded</SelectItem>
                        <SelectItem value="size">File Size</SelectItem>
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

                  {selectedResources.length > 0 && (
                    <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {selectedResources.length} file{selectedResources.length > 1 ? "s" : ""} selected
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setMoveFolderDialog({ isOpen: true, resourceIds: selectedResources })}
                        >
                          <Move className="h-3 w-3 mr-1" />
                          Move to Folder
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Change Visibility
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (selectedResources.length > 0) {
                              const resourceToDelete = resources.find((r) => r.id === selectedResources[0])
                              if (resourceToDelete) {
                                handleDelete(resourceToDelete)
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedResources([])} className="ml-auto">
                        Clear Selection
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resources Display */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Files</CardTitle>
                    <CardDescription>
                      Showing {startIndex + 1}-{Math.min(endIndex, pagination?.total || 0)} of{" "}
                      {pagination?.total || 0} files
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Show:</span>
                      <Select
                        value={pagination?.limit?.toString() || "12"}
                        onValueChange={(value) => {
                          setApiLimit(Number(value))
                          setApiPage(1)
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
                          selectedResources.length === paginatedResources.length && paginatedResources.length > 0
                        }
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
                    {paginatedResources.map((resource) => {
                      const folder = folders.find((f) => f.id === resource.folderId)
                      return (
                        <div
                          key={resource.id}
                          className="group relative rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                        >
                          <div className="absolute top-2 left-2 z-10">
                            <Checkbox
                              checked={selectedResources.includes(resource.id)}
                              onCheckedChange={() => handleSelectResource(resource.id)}
                              className="bg-white dark:bg-gray-900 border-2"
                            />
                          </div>
                          <div className="absolute top-2 right-2 z-10 flex gap-1">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm"
                              onClick={() => handleToggleStar(resource.id)}
                            >
                              <Star
                                className={`h-4 w-4 ${resource.isStarred ? "fill-yellow-500 text-yellow-500" : ""}`}
                              />
                            </Button>
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
                                <DropdownMenuItem onClick={() => handleDownload(resource)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share Link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleVisibilityChange(resource, "Everyone")}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Change Visibility
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setMoveFolderDialog({ isOpen: true, resourceIds: [resource.id] })}
                                >
                                  <Move className="h-4 w-4 mr-2" />
                                  Move to Folder
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(resource)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="aspect-[4/3] relative overflow-hidden bg-muted flex items-center justify-center">
                            <div className="w-20 h-20">{getFileIcon(resource.mime_type)}</div>
                          </div>

                          <div className="p-3 bg-card">
                            <h3 className="font-semibold text-sm mb-1 truncate">{resource.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{resource.description}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                              <span>{(resource.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                              <span className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {resource.download_count || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              {getVisibilityBadge(resource.visibility)}
                              {folder && (
                                <Badge variant="outline" className="text-xs">
                                  <Folder className="h-3 w-3 mr-1" />
                                  {folder.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {paginatedResources.map((resource) => {
                      const folder = folders.find((f) => f.id === resource.folderId)
                      return (
                        <div
                          key={resource.id}
                          className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all"
                        >
                          <Checkbox
                            checked={selectedResources.includes(resource.id)}
                            onCheckedChange={() => handleSelectResource(resource.id)}
                          />
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            {getFileIcon(resource.mime_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{resource.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{resource.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              {folder && (
                                <span className="flex items-center gap-1">
                                  <Folder className="h-3 w-3" />
                                  {folder.name}
                                </span>
                              )}
                              <span>{(resource.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                              <span className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {resource.download_count || 0} downloads
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(resource.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleToggleStar(resource.id)}
                            className="flex-shrink-0"
                          >
                            <Star
                              className={`h-4 w-4 ${resource.isStarred ? "fill-yellow-500 text-yellow-500" : ""}`}
                            />
                          </Button>
                          {getVisibilityBadge(resource.visibility)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownload(resource)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(resource)} className="text-red-600">
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
                      Page {pagination?.page || 1} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setApiPage((pagination?.page || 1) - 1)}
                        disabled={(pagination?.page || 1) === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={(pagination?.page || 1) === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setApiPage(page)}
                            className="w-9"
                          >
                            {page}
                          </Button>
                        ))}
                        {totalPages > 5 && (
                          <>
                            <span className="px-2 text-muted-foreground">...</span>
                            <Button
                              variant={(pagination?.page || 1) === totalPages ? "default" : "outline"}
                              size="sm"
                              onClick={() => setApiPage(totalPages)}
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
                        onClick={() => setApiPage((pagination?.page || 1) + 1)}
                        disabled={(pagination?.page || 1) === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {createFolderDialogOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setCreateFolderDialogOpen(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4">
                    <FolderPlus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Create New Folder</h3>
                    <p className="text-sm text-muted-foreground">Organize your files with folders</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="folder-name">
                      Folder Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="folder-name"
                      placeholder="Enter folder name"
                      value={createFolderFormData.name}
                      onChange={(e) => setCreateFolderFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="folder-description">Description</Label>
                    <Textarea
                      id="folder-description"
                      placeholder="Optional description"
                      rows={3}
                      value={createFolderFormData.description}
                      onChange={(e) => setCreateFolderFormData((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="folder-color">Color</Label>
                    <Select
                      value={createFolderFormData.color}
                      onValueChange={(value) => setCreateFolderFormData((prev) => ({ ...prev, color: value }))}
                    >
                      <SelectTrigger id="folder-color">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="cyan">Cyan</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700 dark:text-blue-400">
                        <p className="font-medium mb-1">Folder will be created in:</p>
                        <p className="text-xs">
                          {getFolderPath(createFolderFormData.parentId)
                            .map((f) => f.name)
                            .join(" / ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button variant="outline" onClick={() => setCreateFolderDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateFolder}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Create Folder
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {moveFolderDialog.isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setMoveFolderDialog({ isOpen: false, resourceIds: [] })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mr-4">
                    <Move className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Move to Folder</h3>
                    <p className="text-sm text-muted-foreground">
                      Select destination for {moveFolderDialog.resourceIds.length} file(s)
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {folders
                    .filter((f) => f.id !== "root")
                    .map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => handleMoveToFolder(folder.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-left"
                      >
                        <Folder className={`w-5 h-5 text-${folder.color}-600`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{folder.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{folder.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button variant="outline" onClick={() => setMoveFolderDialog({ isOpen: false, resourceIds: [] })}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && deleteConfirmation.resource && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setDeleteConfirmation({ isOpen: false, resource: null })}
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
                    <h3 className="text-xl font-bold text-foreground">Delete File</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-red-600">{deleteConfirmation.resource.name}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          {getFileIcon(deleteConfirmation.resource.fileType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{deleteConfirmation.resource.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {deleteConfirmation.resource.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getVisibilityBadge(deleteConfirmation.resource.visibility)}
                        <Badge variant="outline" className="text-xs">
                          {deleteConfirmation.resource.fileSize}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          {deleteConfirmation.resource.downloads} downloads
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700 dark:text-red-400">
                        <p className="font-medium mb-1">Warning: Permanent Action</p>
                        <ul className="space-y-1 text-xs">
                          <li>• File will be permanently deleted</li>
                          <li>• Download links will stop working</li>
                          <li>• This action cannot be reversed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button variant="outline" onClick={() => setDeleteConfirmation({ isOpen: false, resource: null })}>
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDelete}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete File
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Visibility Confirmation Modal */}
      {visibilityConfirmation.isOpen && visibilityConfirmation.resource && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setVisibilityConfirmation({ isOpen: false, resource: null, newVisibility: "" })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Change Visibility</h3>
                    <p className="text-sm text-muted-foreground">Update who can access this file</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Change visibility of{" "}
                    <span className="font-semibold text-blue-600">{visibilityConfirmation.resource.name}</span> to{" "}
                    <span className="font-semibold text-green-600">{visibilityConfirmation.newVisibility}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{visibilityConfirmation.resource.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {visibilityConfirmation.resource.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Current:</span>
                        {getVisibilityBadge(visibilityConfirmation.resource.visibility)}
                        <span className="text-muted-foreground">→</span>
                        {getVisibilityBadge(visibilityConfirmation.newVisibility)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700 dark:text-blue-400">
                        <p className="font-medium mb-1">Who can access this file:</p>
                        <p className="text-xs">
                          {visibilityConfirmation.newVisibility === "Everyone" &&
                            "Everyone including guests can download this file"}
                          {visibilityConfirmation.newVisibility === "Students Only" &&
                            "Only students can download this file"}
                          {visibilityConfirmation.newVisibility === "Teachers Only" &&
                            "Only teachers can download this file"}
                          {visibilityConfirmation.newVisibility === "Staff Only" &&
                            "Only staff members can download this file"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setVisibilityConfirmation({ isOpen: false, resource: null, newVisibility: "" })}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmVisibilityChange}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Change Visibility
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {uploadModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => {
              if (Object.keys(uploadProgress).length === 0) {
                setUploadModalOpen(false)
                setUploadingFiles([])
                setPdfPreview(null)
              }
            }}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-xl border-2 border-border/50 rounded-3xl shadow-2xl max-w-4xl w-full my-8 animate-in fade-in-0 zoom-in-95 duration-300 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-6">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <Upload className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg">Upload Files</h3>
                      <p className="text-white/90 text-sm mt-0.5">
                        {uploadingFiles.length} file{uploadingFiles.length > 1 ? "s" : ""} ready to upload
                      </p>
                    </div>
                  </div>
                  {Object.keys(uploadProgress).length === 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setUploadModalOpen(false)
                        setUploadingFiles([])
                        setPdfPreview(null)
                      }}
                      className="text-white hover:bg-white/20 rounded-xl"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="folder" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Folder className="w-4 h-4 text-blue-600" />
                        Folder <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={uploadFormData.folder}
                        onValueChange={(value) => setUploadFormData((prev) => ({ ...prev, folder: value }))}
                      >
                        <SelectTrigger id="folder" className="h-11 border-2 focus:border-blue-500 transition-colors">
                          <SelectValue placeholder="Select a folder" />
                        </SelectTrigger>
                        <SelectContent>
                          {folders
                            .filter((f) => f.id !== "root")
                            .map((folder) => (
                              <SelectItem key={folder.id} value={folder.id}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full bg-${folder.color}-500`} />
                                  {folder.name}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter a descriptive title"
                        value={uploadFormData.title}
                        onChange={(e) => setUploadFormData((prev) => ({ ...prev, title: e.target.value }))}
                        className="h-11 border-2 focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-sm font-semibold text-foreground flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-green-600" />
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Provide additional details about this file"
                        rows={3}
                        value={uploadFormData.description}
                        onChange={(e) => setUploadFormData((prev) => ({ ...prev, description: e.target.value }))}
                        className="border-2 focus:border-green-500 transition-colors resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="visibility"
                        className="text-sm font-semibold text-foreground flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4 text-orange-600" />
                        Visibility
                      </Label>
                      <Select
                        value={uploadFormData.visibility}
                        onValueChange={(value) => setUploadFormData((prev) => ({ ...prev, visibility: value }))}
                      >
                        <SelectTrigger
                          id="visibility"
                          className="h-11 border-2 focus:border-orange-500 transition-colors"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Everyone">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-green-600" />
                              <span>Everyone</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Students Only">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-blue-600" />
                              <span>Students Only</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Teachers Only">
                            <div className="flex items-center gap-2">
                              <UserCog className="w-4 h-4 text-purple-600" />
                              <span>Teachers Only</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Staff Only">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-orange-600" />
                              <span>Staff Only</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span className="text-cyan-600">#</span>
                        Tags
                      </Label>
                      <Input
                        id="tags"
                        placeholder="e.g., forms, 2024, enrollment"
                        value={uploadFormData.tags}
                        onChange={(e) => setUploadFormData((prev) => ({ ...prev, tags: e.target.value }))}
                        className="h-11 border-2 focus:border-cyan-500 transition-colors"
                      />
                      <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* PDF Preview */}
                    {pdfPreview && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Eye className="w-4 h-4 text-red-600" />
                          PDF Preview
                        </Label>
                        <div className="border-2 border-border rounded-xl overflow-hidden bg-muted shadow-inner">
                          <iframe src={pdfPreview} className="w-full h-72" title="PDF Preview" />
                        </div>
                      </div>
                    )}

                    {/* Files List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Files to Upload
                        </Label>
                        {Object.keys(uploadProgress).length === 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBrowseFiles}
                            className="h-9 border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all bg-transparent"
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                            Browse Files
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {uploadingFiles.map((file, index) => (
                          <div
                            key={index}
                            className="group flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-gradient-to-br from-muted/50 to-muted/30 hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              {getFileIcon(file.name.split(".").pop() || "")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate text-foreground">{file.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              {uploadProgress[file.name] !== undefined && (
                                <div className="mt-2 space-y-1">
                                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden shadow-inner">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300 animate-pulse"
                                      style={{ width: `${uploadProgress[file.name]}%` }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-blue-600">{uploadProgress[file.name]}%</p>
                                    {uploadProgress[file.name] === 100 && (
                                      <p className="text-xs font-medium text-green-600">Complete</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            {uploadProgress[file.name] === 100 && (
                              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 animate-in zoom-in-50 duration-300">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              </div>
                            )}
                            {uploadProgress[file.name] !== undefined &&
                              uploadProgress[file.name] < 100 &&
                              uploadProgress[file.name] > 0 && (
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-8">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    <span>All fields marked with * are required</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (Object.keys(uploadProgress).length === 0) {
                          setUploadModalOpen(false)
                          setUploadingFiles([])
                          setPdfPreview(null)
                        }
                      }}
                      disabled={Object.keys(uploadProgress).length > 0}
                      className="h-11 px-6 border-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUploadSubmit}
                      disabled={
                        Object.keys(uploadProgress).length > 0 || !uploadFormData.folder || !uploadFormData.title
                      }
                      className="h-11 px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {Object.keys(uploadProgress).length > 0 ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 mr-2" />
                          Upload {uploadingFiles.length} File{uploadingFiles.length > 1 ? "s" : ""}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
