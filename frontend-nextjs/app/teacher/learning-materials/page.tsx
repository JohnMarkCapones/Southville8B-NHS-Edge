"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Download,
  Upload,
  Folder,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Star,
  Clock,
  Home,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  CloudUpload,
  Grid3X3,
  List,
  BookOpen,
  Info,
} from "lucide-react"

// <DATABASE_CONNECTION_SPOT>
// TODO: Replace with actual database queries
// Example with Supabase:
// const { data: folders } = await supabase.from('folders').select('*')
// const { data: resources } = await supabase.from('resources').select('*').eq('status', 'approved')

// Mock folder structure (same as admin)
const mockFolders = [
  { id: "root", name: "Root", parentId: null, color: "blue", description: "", fileCount: 0, isStarred: false },
  {
    id: "1",
    name: "School Forms",
    parentId: "root",
    color: "blue",
    description: "Official school forms and documents",
    fileCount: 12,
    isStarred: true,
  },
  {
    id: "2",
    name: "Policy Documents",
    parentId: "root",
    color: "purple",
    description: "School policies and guidelines",
    fileCount: 8,
    isStarred: false,
  },
  {
    id: "3",
    name: "Templates",
    parentId: "root",
    color: "green",
    description: "Document templates",
    fileCount: 15,
    isStarred: false,
  },
  {
    id: "4",
    name: "Teaching Materials",
    parentId: "root",
    color: "orange",
    description: "Lesson plans and teaching resources",
    fileCount: 45,
    isStarred: true,
  },
  {
    id: "5",
    name: "Assessment Tools",
    parentId: "root",
    color: "cyan",
    description: "Quizzes and evaluation forms",
    fileCount: 23,
    isStarred: false,
  },
  {
    id: "6",
    name: "2024 Forms",
    parentId: "1",
    color: "blue",
    description: "Forms for 2024",
    fileCount: 8,
    isStarred: false,
  },
  {
    id: "7",
    name: "2023 Forms",
    parentId: "1",
    color: "blue",
    description: "Forms for 2023",
    fileCount: 4,
    isStarred: false,
  },
]

// Mock resources
const mockResources = [
  {
    id: "1",
    title: "Enrollment Form 2024",
    folderId: "6",
    type: "pdf",
    size: "2.4 MB",
    uploadedBy: "Admin",
    uploadedAt: "2024-01-15",
    downloads: 245,
    isStarred: false,
    visibility: "Everyone",
  },
  {
    id: "2",
    title: "Student Handbook",
    folderId: "2",
    type: "pdf",
    size: "5.2 MB",
    uploadedBy: "Admin",
    uploadedAt: "2024-01-10",
    downloads: 189,
    isStarred: true,
    visibility: "Everyone",
  },
  {
    id: "3",
    title: "Lesson Plan Template",
    folderId: "3",
    type: "docx",
    size: "1.1 MB",
    uploadedBy: "Ms. Garcia",
    uploadedAt: "2024-01-12",
    downloads: 156,
    isStarred: false,
    visibility: "Teachers Only",
  },
  {
    id: "4",
    title: "Math Quiz Template",
    folderId: "5",
    type: "xlsx",
    size: "890 KB",
    uploadedBy: "Mr. Santos",
    uploadedAt: "2024-01-08",
    downloads: 98,
    isStarred: false,
    visibility: "Teachers Only",
  },
  {
    id: "5",
    title: "Science Experiment Guide",
    folderId: "4",
    type: "pdf",
    size: "3.7 MB",
    uploadedBy: "Dr. Cruz",
    uploadedAt: "2024-01-14",
    downloads: 234,
    isStarred: true,
    visibility: "Everyone",
  },
]

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
      return <FileText className="h-5 w-5 text-red-500" />
    case "docx":
    case "doc":
      return <FileText className="h-5 w-5 text-blue-500" />
    case "xlsx":
    case "xls":
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />
    case "zip":
      return <FileArchive className="h-5 w-5 text-orange-500" />
    default:
      return <FileText className="h-5 w-5 text-gray-500" />
  }
}

export default function TeacherResourcesPage() {
  const [folders] = useState(mockFolders)
  const [resources, setResources] = useState(mockResources)
  const [currentFolderId, setCurrentFolderId] = useState<string>("root")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["root", "1"]))
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [folderTreeVisible, setFolderTreeVisible] = useState(true)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [isDragging, setIsDragging] = useState(false)
  const [uploadFormData, setUploadFormData] = useState({
    title: "",
    description: "",
    suggestedFolder: "",
    tags: "",
  })

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const getSubfolders = (parentId: string) => {
    return folders.filter((f) => f.parentId === parentId)
  }

  const getCurrentFolder = () => {
    return folders.find((f) => f.id === currentFolderId) || folders[0]
  }

  const getFolderPath = (folderId: string): typeof folders => {
    const path: typeof folders = []
    let current = folders.find((f) => f.id === folderId)

    while (current && current.id !== "root") {
      path.unshift(current)
      current = folders.find((f) => f.id === current?.parentId)
    }

    return path
  }

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFolder = currentFolderId === "root" || resource.folderId === currentFolderId
      return matchesSearch && matchesFolder
    })
  }, [resources, searchQuery, currentFolderId])

  const handleStarResource = (resourceId: string) => {
    // <DATABASE_CONNECTION_SPOT>
    // TODO: Update starred status in database
    // await supabase.from('user_favorites').insert({ user_id: userId, resource_id: resourceId })

    setResources((prev) => prev.map((r) => (r.id === resourceId ? { ...r, isStarred: !r.isStarred } : r)))
  }

  const handleDownload = async (resource: (typeof mockResources)[0]) => {
    // <DATABASE_CONNECTION_SPOT>
    // TODO: Track download in database
    // await supabase.from('downloads').insert({ user_id: userId, resource_id: resource.id, timestamp: new Date() })
    // await supabase.from('resources').update({ downloads: resource.downloads + 1 }).eq('id', resource.id)

    setResources((prev) => prev.map((r) => (r.id === resource.id ? { ...r, downloads: r.downloads + 1 } : r)))
    console.log("[v0] Downloading:", resource.title)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadingFiles(files)
      setUploadModalOpen(true)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files)
      setUploadingFiles(files)
      setUploadModalOpen(true)
    }
  }

  const handleUpload = async () => {
    if (uploadingFiles.length === 0 || !uploadFormData.title) return

    // <DATABASE_CONNECTION_SPOT>
    // TODO: Upload files to storage and create pending approval records
    // Example with Supabase:
    /*
    for (const file of uploadingFiles) {
      // Upload file to storage
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('resources')
        .upload(`pending/${userId}/${file.name}`, file)
      
      if (!uploadError) {
        // Create pending approval record
        await supabase.from('resource_uploads').insert({
          teacher_id: userId,
          title: uploadFormData.title,
          description: uploadFormData.description,
          suggested_folder: uploadFormData.suggestedFolder,
          tags: uploadFormData.tags,
          file_url: fileData.path,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          status: 'pending',
          created_at: new Date()
        })
      }
    }
    */

    // Simulate upload progress
    for (const file of uploadingFiles) {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setUploadProgress((prev) => ({ ...prev, [file.name]: i }))
      }
    }

    setTimeout(() => {
      setUploadModalOpen(false)
      setUploadingFiles([])
      setUploadProgress({})
      setUploadFormData({ title: "", description: "", suggestedFolder: "", tags: "" })
    }, 1000)
  }

  const FolderTreeItem = ({ folder, level = 0 }: { folder: (typeof folders)[0]; level?: number }) => {
    const subfolders = getSubfolders(folder.id)
    const hasSubfolders = subfolders.length > 0
    const isExpanded = expandedFolders.has(folder.id)
    const isActive = currentFolderId === folder.id

    return (
      <div>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
            isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 font-medium"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => setCurrentFolderId(folder.id)}
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
          <Folder className={`w-4 h-4 text-${folder.color}-600`} />
          <span className="text-sm flex-1 truncate">{folder.name}</span>
          {folder.fileCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {folder.fileCount}
            </Badge>
          )}
          {folder.isStarred && <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />}
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
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      {isDragging && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[2px] animate-in fade-in-0 duration-200" />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 pointer-events-none">
            <div className="bg-gradient-to-br from-emerald-500/90 to-emerald-600/90 backdrop-blur-xl border-4 border-dashed border-white/50 rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <CloudUpload className="w-10 h-10 text-white animate-bounce" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold text-white drop-shadow-lg">Drop Files Here</h2>
                  <p className="text-lg text-white/90 drop-shadow">Release to upload for admin approval</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10" />
        </div>

        <div className="container mx-auto px-6 py-3 relative z-10">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">School Resources</h1>
                <p className="text-sm text-emerald-100">
                  Browse and download resources. Upload materials for admin approval.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-white/20 border-white/30 text-white placeholder:text-gray-200 focus:bg-white/30 focus:border-white/50 transition-all duration-300"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    className="h-9 bg-white/10 hover:bg-white/20 text-white border-white/30"
                  >
                    {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                  </Button>
                  <label htmlFor="file-upload">
                    <Button className="h-9 bg-white text-emerald-700 hover:bg-white/90" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </span>
                    </Button>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-10rem)]">
        {/* Folder Tree Sidebar */}
        {folderTreeVisible && (
          <div className="w-80 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-emerald-600" />
                  Folders
                </h2>
                <Button size="sm" variant="ghost" onClick={() => setFolderTreeVisible(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Browse folders organized by admin. Upload files for approval.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {/* Quick Access */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground px-3 py-2">QUICK ACCESS</p>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      currentFolderId === "root"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 font-medium"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                    onClick={() => setCurrentFolderId("root")}
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
                  {getSubfolders("root").map((folder) => (
                    <FolderTreeItem key={folder.id} folder={folder} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Home className="w-4 h-4" />
              <ChevronRight className="w-4 h-4" />
              {getFolderPath(currentFolderId).map((folder, index) => (
                <div key={folder.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentFolderId(folder.id)}
                    className="hover:text-emerald-600 transition-colors"
                  >
                    {folder.name}
                  </button>
                  {index < getFolderPath(currentFolderId).length - 1 && <ChevronRight className="w-4 h-4" />}
                </div>
              ))}
            </div>

            {/* Current Folder Info */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Folder className={`w-6 h-6 text-${getCurrentFolder().color}-600`} />
                {getCurrentFolder().name}
              </h2>
              {getCurrentFolder().description && (
                <p className="text-sm text-muted-foreground mt-1">{getCurrentFolder().description}</p>
              )}
            </div>

            {/* Resources Grid/List */}
            {filteredResources.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No resources found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try adjusting your search" : "This folder is empty"}
                </p>
              </Card>
            ) : (
              <div
                className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
              >
                {filteredResources.map((resource) => (
                  <Card
                    key={resource.id}
                    className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">{getFileIcon(resource.type)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{resource.title}</h3>
                          <p className="text-xs text-muted-foreground">{resource.size}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStarResource(resource.id)}
                        className="flex-shrink-0"
                      >
                        <Star
                          className={`h-4 w-4 ${resource.isStarred ? "fill-yellow-500 text-yellow-500" : "text-gray-400"}`}
                        />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {resource.visibility}
                      </Badge>
                      <span>•</span>
                      <span>{resource.downloads} downloads</span>
                    </div>

                    <div className="text-xs text-muted-foreground mb-4">
                      <p>Uploaded by {resource.uploadedBy}</p>
                      <p>{new Date(resource.uploadedAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        size="sm"
                        onClick={() => handleDownload(resource)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => {
              if (Object.keys(uploadProgress).length === 0) {
                setUploadModalOpen(false)
                setUploadingFiles([])
              }
            }}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card border-2 border-border rounded-2xl shadow-2xl max-w-2xl w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Upload Files for Approval</h3>
                      <p className="text-white/90 text-sm">Admin will review and place in appropriate folder</p>
                    </div>
                  </div>
                  {Object.keys(uploadProgress).length === 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setUploadModalOpen(false)
                        setUploadingFiles([])
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p className="font-medium mb-1">Pending Admin Approval</p>
                      <p className="text-xs">
                        Your files will be reviewed by admin before being added to the resource library.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="title">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter a descriptive title"
                      value={uploadFormData.title}
                      onChange={(e) => setUploadFormData((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the content and purpose"
                      rows={3}
                      value={uploadFormData.description}
                      onChange={(e) => setUploadFormData((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="suggested-folder">Suggested Folder (Optional)</Label>
                    <Select
                      value={uploadFormData.suggestedFolder}
                      onValueChange={(value) => setUploadFormData((prev) => ({ ...prev, suggestedFolder: value }))}
                    >
                      <SelectTrigger id="suggested-folder">
                        <SelectValue placeholder="Suggest where this should go" />
                      </SelectTrigger>
                      <SelectContent>
                        {folders
                          .filter((f) => f.id !== "root")
                          .map((folder) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., forms, 2024, enrollment"
                      value={uploadFormData.tags}
                      onChange={(e) => setUploadFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Files to Upload ({uploadingFiles.length})</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {uploadingFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                          {getFileIcon(file.name.split(".").pop() || "")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          {uploadProgress[file.name] !== undefined && (
                            <div className="mt-2 space-y-1">
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress[file.name]}%` }}
                                />
                              </div>
                              <p className="text-xs text-emerald-600">{uploadProgress[file.name]}%</p>
                            </div>
                          )}
                        </div>
                        {uploadProgress[file.name] === 100 && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                          <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (Object.keys(uploadProgress).length === 0) {
                        setUploadModalOpen(false)
                        setUploadingFiles([])
                      }
                    }}
                    disabled={Object.keys(uploadProgress).length > 0}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={
                      Object.keys(uploadProgress).length > 0 || !uploadFormData.title || uploadingFiles.length === 0
                    }
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {Object.keys(uploadProgress).length > 0 ? "Uploading..." : "Submit for Approval"}
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
