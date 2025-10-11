"use client"

import type React from "react"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  Search,
  Grid3x3,
  List,
  MoreVertical,
  Eye,
  Download,
  Edit,
  Trash2,
  Copy,
  Share2,
  Users,
  FileText,
  File,
  ImageIcon,
  Video,
  BookOpen,
  FolderOpen,
  Calendar,
  Clock,
  Settings,
  Info,
  X,
  AlertCircle,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation" // Import useRouter

// TODO: DATABASE - Replace with actual database types
type MaterialStatus = "draft" | "published" | "scheduled" | "expired"
type FileType = "pdf" | "ppt" | "doc" | "xls" | "image" | "video" | "other"

interface StudentMaterial {
  id: string
  title: string
  description: string
  fileUrl: string
  fileName: string
  fileType: FileType
  fileSize: number
  subject: string
  gradeLevel: string
  topic: string
  status: MaterialStatus
  publishDate: Date | null
  expirationDate: Date | null
  allowDownload: boolean
  assignedSections: string[]
  views: number
  downloads: number
  uploadedAt: Date
  updatedAt: Date
}

// TODO: DATABASE - Fetch from your database
// Example: const materials = await db.query('SELECT * FROM student_materials WHERE teacher_id = ?', [teacherId])
const mockMaterials: StudentMaterial[] = [
  {
    id: "1",
    title: "Introduction to Algebra - Chapter 1",
    description: "Basic concepts of algebra including variables, expressions, and equations",
    fileUrl: "/materials/algebra-ch1.pdf",
    fileName: "algebra-chapter-1.pdf",
    fileType: "pdf",
    fileSize: 2500000,
    subject: "Mathematics",
    gradeLevel: "Grade 8",
    topic: "Algebra Basics",
    status: "published",
    publishDate: new Date("2024-01-15"),
    expirationDate: null,
    allowDownload: true,
    assignedSections: ["8-A", "8-B", "8-C"],
    views: 145,
    downloads: 89,
    uploadedAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "Photosynthesis Presentation",
    description: "Detailed PowerPoint presentation on the process of photosynthesis",
    fileUrl: "/materials/photosynthesis.pptx",
    fileName: "photosynthesis-lecture.pptx",
    fileType: "ppt",
    fileSize: 5800000,
    subject: "Science",
    gradeLevel: "Grade 7",
    topic: "Biology",
    status: "published",
    publishDate: new Date("2024-01-20"),
    expirationDate: null,
    allowDownload: true,
    assignedSections: ["7-A", "7-B"],
    views: 98,
    downloads: 67,
    uploadedAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    title: "Essay Writing Guide",
    description: "Comprehensive guide on writing effective essays with examples",
    fileUrl: "/materials/essay-guide.docx",
    fileName: "essay-writing-guide.docx",
    fileType: "doc",
    fileSize: 1200000,
    subject: "English",
    gradeLevel: "Grade 9",
    topic: "Writing Skills",
    status: "scheduled",
    publishDate: new Date("2024-02-01"),
    expirationDate: null,
    allowDownload: true,
    assignedSections: ["9-A"],
    views: 0,
    downloads: 0,
    uploadedAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25"),
  },
  {
    id: "4",
    title: "Periodic Table Reference",
    description: "High-resolution periodic table with element properties",
    fileUrl: "/materials/periodic-table.png",
    fileName: "periodic-table-hd.png",
    fileType: "image",
    fileSize: 3200000,
    subject: "Science",
    gradeLevel: "Grade 8",
    topic: "Chemistry",
    status: "published",
    publishDate: new Date("2024-01-10"),
    expirationDate: null,
    allowDownload: true,
    assignedSections: ["8-A", "8-B", "8-C"],
    views: 234,
    downloads: 156,
    uploadedAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
]

// TODO: DATABASE - Fetch this mapping from your database
// Example: const sectionsMap = await db.query('SELECT grade_level, section_name FROM sections')
const gradeSectionsMap: Record<string, string[]> = {
  "Grade 7": ["Newton", "Galileo", "Einstein", "Curie"],
  "Grade 8": ["Darwin", "Tesla", "Hawking", "Pasteur"],
  "Grade 9": ["Aristotle", "Archimedes", "Pythagoras", "Euclid"],
  "Grade 10": ["Da Vinci", "Edison", "Franklin", "Faraday"],
}

export default function StudentMaterialsPage() {
  const { toast } = useToast()
  const router = useRouter() // Initialize useRouter

  const [materials, setMaterials] = useState<StudentMaterial[]>(mockMaterials)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSubject, setFilterSubject] = useState<string>("all")
  const [filterGrade, setFilterGrade] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const [isDragging, setIsDragging] = useState(false)
  // CHANGE: Added drag counter to properly track drag enter/leave events
  const [dragCounter, setDragCounter] = useState(0)
  // END CHANGE

  const [validationAlert, setValidationAlert] = useState({
    open: false,
    title: "",
    message: "",
    errors: [] as string[],
  })

  // CHANGE: Added confirmation dialogs state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    materialId: "",
    materialTitle: "",
  })

  const [uploadConfirmation, setUploadConfirmation] = useState({
    open: false,
  })
  // CHANGE END

  const [shareDialog, setShareDialog] = useState({
    open: false,
    material: null as StudentMaterial | null,
  })

  const [copiedLink, setCopiedLink] = useState(false)
  // <CHANGE END>

  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    subject: "",
    gradeLevel: "",
    topic: "",
    assignedSections: [] as string[],
    publishDate: "",
    expirationDate: "",
    hasExpiration: false,
    // </CHANGE>
    allowDownload: true,
    status: "published" as MaterialStatus,
    files: [] as File[], // Store files in state
  })

  // TODO: DATABASE - Fetch subjects from database
  const subjects = ["Mathematics", "Science", "English", "Filipino", "History", "PE"]
  const grades = ["Grade 7", "Grade 8", "Grade 9", "Grade 10"]

  const availableSections = useMemo(() => {
    if (!uploadForm.gradeLevel) return []
    return gradeSectionsMap[uploadForm.gradeLevel] || []
  }, [uploadForm.gradeLevel])

  // CHANGE: Improved drag handlers to fix overlay not disappearing
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setDragCounter((prev) => prev + 1)

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setDragCounter((prev) => {
      const newCount = prev - 1
      // Only hide overlay when all drag events have left
      if (newCount === 0) {
        setIsDragging(false)
      }
      return newCount
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Reset drag state
    setIsDragging(false)
    setDragCounter(0)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files)
      setUploadForm((prev) => ({ ...prev, files: fileArray }))
      setUploadDialogOpen(true)
    }
  }, [])
  // END CHANGE

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files)
      // Append new files to existing files in the form state
      setUploadForm((prev) => ({ ...prev, files: [...prev.files, ...fileArray] }))
    }
  }, [])

  const handleRemoveFile = useCallback((index: number) => {
    setUploadForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
  }, [])

  // Effect to handle dropped files when dialog opens (Removed as files are now managed in state directly)
  // useEffect(() => {
  //   if (uploadDialogOpen && droppedFiles) {
  //     // Pre-populate the file input with dropped files
  //     const fileInput = document.getElementById("file-upload") as HTMLInputElement
  //     if (fileInput) {
  //       // Create a new DataTransfer object to set files
  //       const dataTransfer = new DataTransfer()
  //       Array.from(droppedFiles).forEach((file) => {
  //         dataTransfer.items.add(file)
  //       })
  //       fileInput.files = dataTransfer.files
  //     }
  //   }
  // }, [uploadDialogOpen, droppedFiles])

  // Clear dropped files when dialog closes (Removed as files are now managed in state directly)
  // useEffect(() => {
  //   if (!uploadDialogOpen) {
  //     setDroppedFiles(null)
  //   }
  // }, [uploadDialogOpen])

  // Filter and search materials (optimized with useMemo)
  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const matchesSearch =
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.topic.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSubject = filterSubject === "all" || material.subject === filterSubject
      const matchesGrade = filterGrade === "all" || material.gradeLevel === filterGrade
      const matchesStatus = filterStatus === "all" || material.status === filterStatus
      const matchesType = filterType === "all" || material.fileType === filterType

      return matchesSearch && matchesSubject && matchesGrade && matchesStatus && matchesType
    })
  }, [materials, searchQuery, filterSubject, filterGrade, filterStatus, filterType])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalMaterials = materials.length
    const publishedMaterials = materials.filter((m) => m.status === "published").length
    const totalViews = materials.reduce((sum, m) => sum + m.views, 0)
    const totalDownloads = materials.reduce((sum, m) => sum + m.downloads, 0)

    return { totalMaterials, publishedMaterials, totalViews, totalDownloads }
  }, [materials])

  const validateUploadForm = useCallback(() => {
    const errors: string[] = []

    if (uploadForm.files.length === 0) {
      errors.push("Please select at least one file to upload")
    }

    if (!uploadForm.title.trim()) {
      errors.push("Title is required")
    }

    if (!uploadForm.description.trim()) {
      errors.push("Description is required")
    }

    if (!uploadForm.subject) {
      errors.push("Subject is required")
    }

    if (!uploadForm.gradeLevel) {
      errors.push("Grade Level is required")
    }

    if (!uploadForm.topic.trim()) {
      errors.push("Topic/Module is required")
    }

    if (uploadForm.assignedSections.length === 0) {
      errors.push("At least one section must be selected")
    }

    // Add validation for expiration date if hasExpiration is true
    if (uploadForm.hasExpiration && !uploadForm.expirationDate) {
      errors.push("Expiration Date is required when 'Set an expiration date' is checked")
    }

    return errors
  }, [uploadForm])

  // CHANGE: Modified handleFileUpload to show confirmation first
  const handleFileUpload = useCallback(async () => {
    const validationErrors = validateUploadForm()

    if (validationErrors.length > 0) {
      setValidationAlert({
        open: true,
        title: "Please Complete All Required Fields",
        message: "The following fields are required to upload materials:",
        errors: validationErrors,
      })
      return
    }

    // Show upload confirmation dialog
    setUploadConfirmation({ open: true })
  }, [uploadForm, validateUploadForm])

  // New function to actually perform the upload after confirmation
  const confirmUpload = useCallback(async () => {
    setUploadConfirmation({ open: false })
    setIsUploading(true)
    setUploadProgress(0)

    // TODO: DATABASE - Upload file to storage and save metadata to database
    // Example:
    // const formData = new FormData()
    // uploadForm.files.forEach((file, index) => {
    //   formData.append(`file${index}`, file)
    // })
    // formData.append('metadata', JSON.stringify({
    //   title: uploadForm.title,
    //   description: uploadForm.description,
    //   subject: uploadForm.subject,
    //   gradeLevel: uploadForm.gradeLevel,
    //   topic: uploadForm.topic,
    //   assignedSections: uploadForm.assignedSections,
    //   publishDate: uploadForm.publishDate,
    //   expirationDate: uploadForm.hasExpiration ? uploadForm.expirationDate : null,
    //   allowDownload: uploadForm.allowDownload,
    //   status: uploadForm.status
    // }))
    //
    // const response = await fetch('/api/teacher/student-materials/upload', {
    //   method: 'POST',
    //   body: formData
    // })
    //
    // const result = await response.json()
    //
    // if (result.success) {
    //   // Assuming result.materials is an array of newly created materials
    //   setMaterials(prev => [...prev, ...result.materials])
    // }

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadDialogOpen(false)
          // Reset form
          setUploadForm({
            title: "",
            description: "",
            subject: "",
            gradeLevel: "",
            topic: "",
            assignedSections: [],
            publishDate: "",
            expirationDate: "",
            hasExpiration: false,
            // </CHANGE>
            allowDownload: true,
            status: "published",
            files: [], // Reset files
          })
          return 100
        }
        return prev + 10
      })
    }, 200)
  }, [uploadForm]) // Include uploadForm in dependencies if it's used within confirmUpload
  // CHANGE END

  // CHANGE: Modified handleDelete to show confirmation first
  const handleDelete = useCallback((materialId: string, materialTitle: string) => {
    setDeleteConfirmation({
      open: true,
      materialId,
      materialTitle,
    })
  }, [])

  // New function to actually delete after confirmation
  const confirmDelete = useCallback(() => {
    const materialId = deleteConfirmation.materialId

    // TODO: DATABASE - Delete material from database
    // Example:
    // await fetch(`/api/teacher/student-materials/${materialId}`, {
    //   method: 'DELETE'
    // })
    //
    // await db.query('DELETE FROM student_materials WHERE id = ?', [materialId])

    setMaterials((prev) => prev.filter((m) => m.id !== materialId))
    setDeleteConfirmation({ open: false, materialId: "", materialTitle: "" })
  }, [deleteConfirmation.materialId]) // Include deleteConfirmation.materialId in dependencies
  // CHANGE END

  // Handle bulk delete
  const handleBulkDelete = useCallback(() => {
    // TODO: DATABASE - Delete multiple materials
    // await fetch('/api/teacher/student-materials/bulk-delete', {
    //   method: 'POST',
    //   body: JSON.stringify({ ids: selectedMaterials })
    // })

    setMaterials((prev) => prev.filter((m) => !selectedMaterials.includes(m.id)))
    setSelectedMaterials([])
  }, [selectedMaterials])

  // Toggle material selection
  const toggleSelection = useCallback((materialId: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId) ? prev.filter((id) => id !== materialId) : [...prev, materialId],
    )
  }, [])

  // Get file type icon
  const getFileIcon = (fileType: FileType) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />
      case "ppt":
        return <File className="w-5 h-5 text-orange-500" />
      case "doc":
        return <FileText className="w-5 h-5 text-blue-500" />
      case "image":
        return <ImageIcon className="w-5 h-5 text-green-500" />
      case "video":
        return <Video className="w-5 h-5 text-purple-500" />
      default:
        return <File className="w-5 h-5 text-gray-500" />
    }
  }

  // Get status badge
  const getStatusBadge = (status: MaterialStatus) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Published</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "scheduled":
        return <Badge className="bg-yellow-500">Scheduled</Badge>
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const handleShare = useCallback((material: StudentMaterial) => {
    setShareDialog({
      open: true,
      material,
    })
    setCopiedLink(false)
  }, [])

  const handleCopyLink = useCallback(async () => {
    if (!shareDialog.material) return

    // Generate shareable link
    const shareLink = `${window.location.origin}/materials/view/${shareDialog.material.id}`

    try {
      await navigator.clipboard.writeText(shareLink)
      setCopiedLink(true)

      // Show success toast
      toast({
        title: "Link copied!",
        description: "The shareable link has been copied to your clipboard.",
        duration: 3000,
      })

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedLink(false)
      }, 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = shareLink
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      document.body.appendChild(textArea)
      textArea.select()

      try {
        document.execCommand("copy")
        setCopiedLink(true)

        toast({
          title: "Link copied!",
          description: "The shareable link has been copied to your clipboard.",
          duration: 3000,
        })

        setTimeout(() => {
          setCopiedLink(false)
        }, 2000)
      } catch (fallbackErr) {
        toast({
          title: "Copy failed",
          description: "Please manually copy the link.",
          variant: "destructive",
          duration: 3000,
        })
      }

      document.body.removeChild(textArea)
    }
  }, [shareDialog.material, toast])
  // <CHANGE END>

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-blue-600/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-12 border-4 border-dashed border-blue-500 max-w-md mx-4">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center animate-bounce">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Drop your files here</h3>
              <p className="text-slate-600 dark:text-slate-400">Release to upload materials for your students</p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <FileText className="w-4 h-4" />
                <span>PDF, PPT, DOC, XLS, Images, Videos</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={validationAlert.open} onOpenChange={(open) => setValidationAlert({ ...validationAlert, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle className="text-xl">{validationAlert.title}</DialogTitle>
            </div>
            <DialogDescription className="text-base">{validationAlert.message}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <ul className="space-y-2">
              {validationAlert.errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setValidationAlert({ ...validationAlert, open: false })}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CHANGE: Added Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmation.open}
        onOpenChange={(open) => setDeleteConfirmation({ ...deleteConfirmation, open })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle className="text-xl">Delete Material?</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              Are you sure you want to delete this material? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{deleteConfirmation.materialTitle}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This material will be permanently removed and students will no longer have access to it.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmation({ open: false, materialId: "", materialTitle: "" })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CHANGE: Added Upload Confirmation Dialog */}
      <Dialog open={uploadConfirmation.open} onOpenChange={(open) => setUploadConfirmation({ open })}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <DialogTitle className="text-xl">Upload Material?</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              Are you sure you want to upload this material? It will be available to the assigned sections.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">{uploadForm.title}</p>
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <p>
                  <span className="font-medium">Subject:</span> {uploadForm.subject}
                </p>
                <p>
                  <span className="font-medium">Grade:</span> {uploadForm.gradeLevel}
                </p>
                <p>
                  <span className="font-medium">Sections:</span> {uploadForm.assignedSections.join(", ")}
                </p>
                <p>
                  <span className="font-medium">Files:</span> {uploadForm.files.length} file(s)
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setUploadConfirmation({ open: false })} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={confirmUpload}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Confirm Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* CHANGE END */}

      <Dialog open={shareDialog.open} onOpenChange={(open) => setShareDialog({ ...shareDialog, open })}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Share2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">Share Material</DialogTitle>
                <DialogDescription className="text-base">
                  Share this material with students or colleagues
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {shareDialog.material && (
            <div className="space-y-6 py-4">
              {/* Material Info */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  {getFileIcon(shareDialog.material.fileType)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {shareDialog.material.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {shareDialog.material.subject}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {shareDialog.material.gradeLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shareable Link */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Shareable Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/materials/view/${shareDialog.material.id}`}
                    readOnly
                    className="flex-1 font-mono text-sm bg-slate-50 dark:bg-slate-900"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button
                    onClick={handleCopyLink}
                    className={cn(
                      "min-w-[100px] transition-all",
                      copiedLink ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700",
                    )}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Anyone with this link can view and download this material
                </p>
              </div>

              {/* Share Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <p className="font-medium">Share this link via:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li>Email or messaging apps</li>
                      <li>Google Classroom or LMS</li>
                      <li>Social media or class groups</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShareDialog({ open: false, material: null })}
              className="flex-1"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* <CHANGE END> */}

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Student Materials
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Upload and manage learning materials for your students
            </p>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="space-y-3 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">Upload New Material</DialogTitle>
                    <DialogDescription className="text-base">
                      Share learning resources with your students
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-6">
                {/* File Upload Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <File className="w-4 h-4" />
                    <span>File Upload</span>
                  </div>

                  {uploadForm.files.length > 0 ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            {uploadForm.files.length} file(s) selected
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUploadForm((prev) => ({ ...prev, files: [] }))}
                            className="h-7 text-xs"
                          >
                            Clear all
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {uploadForm.files.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.name}</p>
                                  <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFile(index)}
                                className="h-7 w-7 p-0 flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add more files button */}
                      <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-300 cursor-pointer group">
                        <input
                          type="file"
                          id="file-upload-additional"
                          className="hidden"
                          onChange={handleFileInputChange}
                          accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.mp4"
                          multiple
                        />
                        <label htmlFor="file-upload-additional" className="cursor-pointer">
                          <Upload className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Add more files</p>
                        </label>
                      </div>
                    </div>
                  ) : (
                    // Show upload area if no files selected
                    <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 text-center hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-300 cursor-pointer group">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileInputChange}
                        accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.mp4"
                        multiple
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">PDF, PPT, DOC, XLS, Images, Videos</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Maximum file size: 50MB</p>
                      </label>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="text-blue-700 dark:text-blue-300">Uploading files...</span>
                        <span className="text-blue-600 dark:text-blue-400">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Info className="w-4 h-4" />
                    <span>Basic Information</span>
                  </div>

                  <div className="space-y-4 pl-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g., Introduction to Algebra - Chapter 1"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Provide a brief description of what students will learn from this material..."
                        rows={3}
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                        className="resize-none"
                      />
                    </div>

                    {/* Topic */}
                    <div className="space-y-2">
                      <Label htmlFor="topic" className="text-sm font-medium">
                        Topic/Module
                      </Label>
                      <Input
                        id="topic"
                        placeholder="e.g., Algebra Basics, Chapter 1, Unit 2"
                        value={uploadForm.topic}
                        onChange={(e) => setUploadForm({ ...uploadForm, topic: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Classification Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <BookOpen className="w-4 h-4" />
                    <span>Classification</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Subject <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={uploadForm.subject}
                        onValueChange={(value) => setUploadForm({ ...uploadForm, subject: value })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Grade Level <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={uploadForm.gradeLevel}
                        onValueChange={(value) => {
                          setUploadForm({ ...uploadForm, gradeLevel: value, assignedSections: [] })
                        }}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Assign to Sections */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Users className="w-4 h-4" />
                    <span>Assign to Sections</span>
                    <span className="text-red-500">*</span>
                  </div>

                  <div className="pl-6">
                    {!uploadForm.gradeLevel ? (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          Please select a grade level first to see available sections
                        </p>
                      </div>
                    ) : availableSections.length === 0 ? (
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          No sections available for {uploadForm.gradeLevel}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {availableSections.map((section) => (
                            <div
                              key={section}
                              className={cn(
                                "flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900",
                                uploadForm.assignedSections.includes(section)
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                  : "border-slate-200 dark:border-slate-800",
                              )}
                              onClick={() => {
                                if (uploadForm.assignedSections.includes(section)) {
                                  setUploadForm({
                                    ...uploadForm,
                                    assignedSections: uploadForm.assignedSections.filter((s) => s !== section),
                                  })
                                } else {
                                  setUploadForm({
                                    ...uploadForm,
                                    assignedSections: [...uploadForm.assignedSections, section],
                                  })
                                }
                              }}
                            >
                              <Checkbox
                                id={section}
                                checked={uploadForm.assignedSections.includes(section)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setUploadForm({
                                      ...uploadForm,
                                      assignedSections: [...uploadForm.assignedSections, section],
                                    })
                                  } else {
                                    setUploadForm({
                                      ...uploadForm,
                                      assignedSections: uploadForm.assignedSections.filter((s) => s !== section),
                                    })
                                  }
                                }}
                              />
                              <Label htmlFor={section} className="text-sm font-medium cursor-pointer flex-1">
                                {section}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {uploadForm.assignedSections.length} section(s) selected
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Schedule & Settings Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Settings className="w-4 h-4" />
                    <span>Schedule & Settings</span>
                  </div>

                  <div className="space-y-4 pl-6">
                    {/* Publish Date */}
                    <div className="space-y-2">
                      <Label htmlFor="publishDate" className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Publish Date
                      </Label>
                      <Input
                        id="publishDate"
                        type="datetime-local"
                        value={uploadForm.publishDate}
                        onChange={(e) => setUploadForm({ ...uploadForm, publishDate: e.target.value })}
                        className="h-11"
                      />
                      <p className="text-xs text-slate-500">Leave empty to publish immediately</p>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <Checkbox
                        id="hasExpiration"
                        checked={uploadForm.hasExpiration}
                        onCheckedChange={(checked) =>
                          setUploadForm({
                            ...uploadForm,
                            hasExpiration: checked as boolean,
                            // Clear expiration date if unchecked
                            expirationDate: checked ? uploadForm.expirationDate : "",
                          })
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor="hasExpiration" className="text-sm font-medium cursor-pointer">
                          Set an expiration date for this material
                        </Label>
                        <p className="text-xs text-slate-500 mt-0.5">
                          If unchecked, material will be available indefinitely
                        </p>
                      </div>
                    </div>

                    {/* Expiration Date - Only show if hasExpiration is true */}
                    {uploadForm.hasExpiration && (
                      <div className="space-y-2 pl-4 border-l-2 border-blue-500">
                        <Label htmlFor="expirationDate" className="text-sm font-medium flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          Expiration Date
                        </Label>
                        <Input
                          id="expirationDate"
                          type="datetime-local"
                          value={uploadForm.expirationDate}
                          onChange={(e) => setUploadForm({ ...uploadForm, expirationDate: e.target.value })}
                          className="h-11"
                        />
                        <p className="text-xs text-slate-500">Material will be automatically hidden after this date</p>
                      </div>
                    )}
                    {/* </CHANGE> */}

                    {/* Allow Download Checkbox */}
                    <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <Checkbox
                        id="allowDownload"
                        checked={uploadForm.allowDownload}
                        onCheckedChange={(checked) =>
                          setUploadForm({ ...uploadForm, allowDownload: checked as boolean })
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor="allowDownload" className="text-sm font-medium cursor-pointer">
                          Allow students to download this material
                        </Label>
                        <p className="text-xs text-slate-500 mt-0.5">Students can save a copy to their device</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadDialogOpen(false)
                    // Reset form state to initial empty values when canceling
                    setUploadForm({
                      title: "",
                      description: "",
                      subject: "",
                      gradeLevel: "",
                      topic: "",
                      assignedSections: [],
                      publishDate: "",
                      expirationDate: "",
                      hasExpiration: false,
                      // </CHANGE>
                      allowDownload: true,
                      status: "published",
                      files: [], // Ensure files are cleared on cancel
                    })
                  }}
                  className="h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFileUpload}
                  disabled={isUploading || uploadForm.files.length === 0} // Disable if uploading or no files selected
                  className="h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isUploading ? "Uploading..." : "Upload Material"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalMaterials}</div>
              <p className="text-xs text-blue-100 mt-1">Uploaded files</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.publishedMaterials}</div>
              <p className="text-xs text-green-100 mt-1">Available to students</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-purple-100 mt-1">Student engagements</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalDownloads}</div>
              <p className="text-xs text-orange-100 mt-1">Total downloads</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterGrade} onValueChange={setFilterGrade}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="File Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="ppt">PowerPoint</SelectItem>
                    <SelectItem value="doc">Word</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedMaterials.length > 0 && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <span className="text-sm font-medium">{selectedMaterials.length} selected</span>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedMaterials([])}>
                  Clear Selection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Materials Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <Card
                key={material.id}
                className={cn(
                  "hover:shadow-lg transition-all duration-300 cursor-pointer",
                  selectedMaterials.includes(material.id) && "ring-2 ring-blue-500",
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedMaterials.includes(material.id)}
                        onCheckedChange={() => toggleSelection(material.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {getFileIcon(material.fileType)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/teacher/student-materials/edit/${material.id}`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {/* <CHANGE END> */}
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(material)}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {/* CHANGE: Modified delete to pass material title */}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(material.id, material.title)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                        {/* CHANGE END */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-lg mt-2">{material.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{material.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{material.subject}</Badge>
                    <Badge variant="outline">{material.gradeLevel}</Badge>
                    {getStatusBadge(material.status)}
                  </div>

                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{material.topic}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{material.assignedSections.join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4" />
                      <span>{formatFileSize(material.fileSize)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{material.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{material.downloads}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredMaterials.map((material) => (
                  <div
                    key={material.id}
                    className={cn(
                      "flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors",
                      selectedMaterials.includes(material.id) && "bg-blue-50 dark:bg-blue-950",
                    )}
                  >
                    <Checkbox
                      checked={selectedMaterials.includes(material.id)}
                      onCheckedChange={() => toggleSelection(material.id)}
                    />
                    {getFileIcon(material.fileType)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{material.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{material.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{material.subject}</Badge>
                      <Badge variant="outline">{material.gradeLevel}</Badge>
                      {getStatusBadge(material.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{material.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{material.downloads}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/teacher/student-materials/edit/${material.id}`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {/* <CHANGE END> */}
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(material)}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {/* CHANGE: Modified delete to pass material title */}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(material.id, material.title)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                        {/* CHANGE END */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {filteredMaterials.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No materials found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {searchQuery || filterSubject !== "all" || filterGrade !== "all"
                  ? "Try adjusting your filters or search query"
                  : "Get started by uploading your first material"}
              </p>
              {!searchQuery && filterSubject === "all" && filterGrade === "all" && (
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Material
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
