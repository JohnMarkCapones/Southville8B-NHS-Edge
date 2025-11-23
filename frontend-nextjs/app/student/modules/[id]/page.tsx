"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import StudentLayout from "@/components/student/student-layout"
import {
  BookOpen,
  Play,
  FileText,
  Clock,
  Star,
  ArrowLeft,
  Eye,
  Bookmark,
  RotateCcw,
  Download,
  Target,
  Trophy,
  Award,
  Brain,
  Lightbulb,
  GraduationCap,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getModuleById, getModuleDownloadUrl, type Module } from "@/lib/api/endpoints/modules"
import PDFViewer from "@/components/pdf-viewer"
import SlideshowViewer from "@/components/slideshow-viewer"

export default function ModuleViewerPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.id as string
  const [progress, setProgress] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [readingTime, setReadingTime] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [totalPages, setTotalPages] = useState(0)
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [fileType, setFileType] = useState<'pdf' | 'pptx' | 'word' | null>(null)
  const [pptxDownloadUrl, setPptxDownloadUrl] = useState<string | null>(null)
  const [slideUrls, setSlideUrls] = useState<string[]>([])
  const [currentSlide, setCurrentSlide] = useState(1)

  // Fetch module data from API
  useEffect(() => {
    const fetchModule = async () => {
      if (!moduleId) return

      try {
        setLoading(true)
        setError(null)
        console.log('[ModuleViewer] Fetching module:', moduleId)
        const data = await getModuleById(moduleId)
        console.log('[ModuleViewer] Raw module data:', data)
        console.log('[ModuleViewer] File URL:', data.file_url)
        console.log('[ModuleViewer] R2 file key:', data.r2_file_key)
        setModule(data)
        console.log('[ModuleViewer] ✅ Module loaded:', data.title)

        // Determine file type and get appropriate URLs
        const fileName = data.r2_file_key || data.file_url || ''
        const fileExtension = fileName.split('.').pop()?.toLowerCase()
        const mimeType = data.mime_type?.toLowerCase() || ''
        
        console.log('[ModuleViewer] File extension detected:', fileExtension)
        console.log('[ModuleViewer] MIME type:', mimeType)
        console.log('[ModuleViewer] R2 file key:', data.r2_file_key)
        console.log('[ModuleViewer] File URL:', data.file_url)
        
        // Check for Word/DOC files
        const isWordFile = fileExtension === 'doc' || fileExtension === 'docx' || 
          mimeType.includes('word') || mimeType.includes('msword') ||
          mimeType.includes('officedocument.wordprocessingml')
        
        if (fileExtension === 'pptx' || mimeType.includes('presentation')) {
          setFileType('pptx')
          console.log('[ModuleViewer] Detected PPTX file, converting to slideshow...')
          
          try {
            const downloadData = await getModuleDownloadUrl(moduleId)
            console.log('[ModuleViewer] PPTX Download response:', downloadData)
        
        if (downloadData.slideUrls && downloadData.slideUrls.length > 0) {
          // Store slide URLs for slideshow viewer
          setSlideUrls(downloadData.slideUrls)
          console.log('[ModuleViewer] ✅ PPTX slide URLs obtained:', downloadData.slideUrls.length, 'slides')
        } else if (downloadData.downloadUrl) {
          // Fallback to download URL if no slide URLs
          setPptxDownloadUrl(downloadData.downloadUrl)
          console.log('[ModuleViewer] ✅ PPTX download URL obtained (fallback):', downloadData.downloadUrl)
        } else {
          console.log('[ModuleViewer] ❌ No slide URLs or download URL received for PPTX')
        }
      } catch (downloadErr) {
        console.error('[ModuleViewer] ❌ Failed to get PPTX download URL:', downloadErr)
        setError('Failed to get PPTX download link. Please try again.')
      }
        } else if (isWordFile) {
          // Handle Word/DOC files - download only, no preview
          setFileType('word')
          console.log('[ModuleViewer] Detected Word/DOC file - download only')
          
          // Get download URL for Word files
          try {
            const downloadData = await getModuleDownloadUrl(moduleId)
            if (downloadData.downloadUrl) {
              setPptxDownloadUrl(downloadData.downloadUrl) // Reuse this state for download URL
              console.log('[ModuleViewer] ✅ Word file download URL obtained:', downloadData.downloadUrl)
            }
          } catch (downloadErr) {
            console.error('[ModuleViewer] ❌ Failed to get Word file download URL:', downloadErr)
          }
        } else {
          // Default to PDF handling (only for actual PDF files)
          const isPdfFile = fileExtension === 'pdf' || mimeType.includes('pdf')
          
          if (isPdfFile) {
            setFileType('pdf')
            
            if (!data.file_url && data.r2_file_key) {
              try {
                console.log('[ModuleViewer] Getting download URL for R2 file key:', data.r2_file_key)
                const downloadData = await getModuleDownloadUrl(moduleId)
                console.log('[ModuleViewer] Download response:', downloadData)
                setPdfUrl(downloadData.downloadUrl || null)
                console.log('[ModuleViewer] ✅ Download URL obtained:', downloadData.downloadUrl)
              } catch (downloadErr) {
                console.error('[ModuleViewer] ❌ Failed to get download URL:', downloadErr)
                // Keep pdfUrl as null, will show "PDF Not Available"
              }
            } else if (data.file_url) {
              console.log('[ModuleViewer] Using direct file URL:', data.file_url)
              setPdfUrl(data.file_url)
            } else {
              console.log('[ModuleViewer] ❌ No file URL or R2 file key available')
            }
          } else {
            // Unknown file type - treat as download-only
            setFileType('word') // Reuse word type for download-only message
            console.log('[ModuleViewer] Unknown file type, treating as download-only')
            
            try {
              const downloadData = await getModuleDownloadUrl(moduleId)
              if (downloadData.downloadUrl) {
                setPptxDownloadUrl(downloadData.downloadUrl)
                console.log('[ModuleViewer] ✅ Download URL obtained for unknown file type')
              }
            } catch (downloadErr) {
              console.error('[ModuleViewer] ❌ Failed to get download URL:', downloadErr)
            }
          }
        }
      } catch (err) {
        console.error('[ModuleViewer] ❌ Error fetching module:', err)
        setError(err instanceof Error ? err.message : 'Failed to load module')
      } finally {
        setLoading(false)
      }
    }

    fetchModule()
  }, [moduleId])

  // Download handler
  const handleDownload = async () => {
    if (!module) return

    try {
      setDownloading(true)
      console.log('[ModuleViewer] Downloading module:', module.id)
      
      // Use stored download URL if available (for PPTX/Word), otherwise get download URL
      let downloadUrl = pptxDownloadUrl
      
      if (!downloadUrl) {
        const downloadData = await getModuleDownloadUrl(module.id)
        downloadUrl = downloadData.downloadUrl || null
      }

      if (downloadUrl) {
        window.open(downloadUrl, '_blank')
        console.log('[ModuleViewer] ✅ Download URL opened')
      } else {
        throw new Error('No download URL available')
      }
    } catch (err) {
      console.error('[ModuleViewer] ❌ Download failed:', err)
      alert('Failed to download module. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  // Fallback helper function for handling missing data
  const fallback = (value: any, defaultValue: string = 'N/A') => {
    if (value === null || value === undefined || value === '') {
      return defaultValue
    }
    return value
  }

  // Calculate estimated pages (fallback to 20 if not available)
  const estimatedTotalPages = fallback(module?.file_size_bytes ? Math.ceil(module.file_size_bytes / 50000) : null, '20')
  const parsedTotalPages = typeof estimatedTotalPages === 'string' && estimatedTotalPages.includes('N/A')
    ? parseInt(estimatedTotalPages.split('N/A')[1]?.trim() || '20')
    : estimatedTotalPages

  // Calculate progress based on current page or slide
  useEffect(() => {
    if (module) {
      if (fileType === 'pptx') {
        // For PPTX files, we don't track progress since we can't preview them
        setProgress(0)
        setTotalPages(0)
      } else if (totalPages > 0) {
        // For PDF, calculate progress based on current page
        const newProgress = Math.round((currentPage / totalPages) * 100)
        setProgress(newProgress)
      }
    }
  }, [currentPage, currentSlide, module, totalPages, slideUrls.length, fileType])

  useEffect(() => {
    // Reading time tracker
    const timer = setInterval(() => {
      setReadingTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Loading state
  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Loading Module...</h2>
            <p className="text-slate-600 dark:text-slate-400">Please wait while we fetch your content</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Error Loading Module</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push("/student/courses")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Module not found
  if (!module) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Module Not Found</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">The module you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/student/courses")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          </div>
        </div>
      </StudentLayout>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "Advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-accent to-primary dark:from-primary/80 dark:via-accent/80 dark:to-primary/80">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-xl animate-pulse"></div>
            <div
              className="absolute bottom-10 right-10 w-24 h-24 bg-white/15 rounded-full blur-lg animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          <div className="relative p-4 sm:p-6 text-white">
            <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => module.subject_id
                  ? router.push(`/student/materials/${module.subject_id}`)
                  : router.push("/student/courses")
                }
                className="text-white hover:bg-white/20 backdrop-blur-sm text-xs sm:text-sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Back to {fallback(module.subject?.subject_name, 'Subject')}</span>
                <span className="xs:hidden">Back</span>
              </Button>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 sm:gap-6">
              <div className="flex items-start gap-3 sm:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm flex-shrink-0">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight break-words">
                      {fallback(module.title, 'Untitled Module')}
                    </h1>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 backdrop-blur-sm flex-shrink-0 p-2"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                  <p className="text-blue-100 dark:text-blue-200 text-sm sm:text-base lg:text-lg mb-3 line-clamp-2 sm:line-clamp-none">
                    {fallback(module.description, 'No description available')}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-blue-100 text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{fallback(module.uploader?.full_name, 'Unknown Author')}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{formatDate(module.updated_at)}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{totalPages}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">{fallback(module.downloadStats?.totalDownloads?.toString(), '0')} downloads</span>
                      <span className="sm:hidden">{fallback(module.downloadStats?.totalDownloads?.toString(), '0')}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
                      {fallback(module.mime_type, 'PDF')}
                    </Badge>
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs">
                      {formatFileSize(module.file_size_bytes)}
                    </Badge>
                    {module.subject && (
                      <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs">
                        {module.subject.subject_name}
                      </Badge>
                    )}
                    {module.is_global && (
                      <Badge variant="outline" className="bg-emerald-500/20 text-white border-emerald-400/30 text-xs">
                        Global Module
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-1 gap-3 sm:gap-4 xl:min-w-[200px]">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-white/20">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">{progress}%</div>
                  <div className="text-xs sm:text-sm text-blue-100">Progress</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-white/20">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">{formatTime(readingTime)}</div>
                  <div className="text-xs sm:text-sm text-blue-100">Reading Time</div>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm font-medium">
                    {fileType === 'pptx' || fileType === 'word' ? 'File Status' : 'Reading Progress'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold">
                    {fileType === 'pptx' || fileType === 'word'
                      ? 'Download Only'
                      : `Page ${currentPage} of ${totalPages || parsedTotalPages}`
                    }
                  </span>
                </div>
              <div className="relative">
                {fileType === 'pptx' || fileType === 'word' ? (
                  <div className="h-2 sm:h-3 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                      Preview not available
                    </span>
                  </div>
                ) : (
                  <>
                    <Progress value={progress} className="h-2 sm:h-3 bg-white/20" />
                    <div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-2 sm:p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {/* Sidebar - Module Info */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl lg:sticky lg:top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    Module Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Subject</div>
                    <div className="font-medium text-sm sm:text-base truncate">{fallback(module.subject?.subject_name, 'No Subject')}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Uploaded By</div>
                    <div className="font-medium text-sm sm:text-base truncate">{fallback(module.uploader?.full_name, 'Unknown')}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">File Size</div>
                    <div className="font-medium text-sm sm:text-base">{formatFileSize(module.file_size_bytes)}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Last Updated</div>
                    <div className="font-medium text-sm sm:text-base">{formatDate(module.updated_at)}</div>
                  </div>
                  {module.downloadStats && (
                    <>
                      <div>
                        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Total Downloads</div>
                        <div className="font-medium text-sm sm:text-base">
                          {fallback(module.downloadStats.totalDownloads?.toString(), '0')}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Success Rate</div>
                        <div className="font-medium text-sm sm:text-base">
                          {fallback(
                            module.downloadStats.successRate
                              ? `${(module.downloadStats.successRate * 100).toFixed(1)}%`
                              : null,
                            'N/A'
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  {module.sections && module.sections.length > 0 && (
                    <div>
                      <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Sections</div>
                      <div className="flex flex-wrap gap-1">
                        {module.sections.map((section, index) => (
                          <Badge key={section.id || `section-${index}`} variant="outline" className="text-xs">
                            {section.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl mt-4 sm:mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-accent text-white text-sm sm:text-base"
                    onClick={handleDownload}
                    disabled={downloading || (!module.file_url && !module.r2_file_key)}
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                        <span className="hidden sm:inline">Downloading...</span>
                        <span className="sm:hidden">Downloading</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        <span className="hidden sm:inline">Download Module</span>
                        <span className="sm:hidden">Download</span>
                      </>
                    )}
                  </Button>
                  {!module.file_url && !module.r2_file_key && (
                    <p className="text-xs text-red-500 text-center">No file available</p>
                  )}
                  <Button variant="outline" className="w-full bg-transparent text-sm sm:text-base" disabled>
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="hidden sm:inline">Print Preview</span>
                    <span className="sm:hidden">Print</span>
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent text-sm sm:text-base" disabled>
                    <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="hidden sm:inline">Take Notes</span>
                    <span className="sm:hidden">Notes</span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Document Viewer */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">
                      {fileType === 'pptx' ? 'PowerPoint File' : 
                       fileType === 'word' ? 'Word Document' : 
                       'PDF Viewer'}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-2 sm:p-4 lg:p-6">
                  {/* Document Viewer */}
                  {fileType === 'pptx' ? (
                    <div className="relative bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden min-h-[300px] sm:min-h-[400px] lg:min-h-[600px] flex items-center justify-center">
                      <div className="text-center space-y-4 sm:space-y-6 max-w-md px-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto">
                          <FileText className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2 sm:mb-3">
                            PowerPoint Preview Not Available
                          </h3>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-2">
                            We can't preview PowerPoint presentations yet.
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mb-4 sm:mb-6">
                            In the future, we might add this feature. For now, please download the file to view it.
                          </p>
                          <div className="flex gap-2 sm:gap-4 justify-center">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg text-sm sm:text-base"
                              onClick={handleDownload}
                              disabled={downloading}
                            >
                              {downloading ? (
                                <>
                                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                                  <span className="hidden sm:inline">Downloading...</span>
                                  <span className="sm:hidden">Downloading</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                  <span className="hidden sm:inline">Download PowerPoint</span>
                                  <span className="sm:hidden">Download</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : fileType === 'word' ? (
                    <div className="relative bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden min-h-[300px] sm:min-h-[400px] lg:min-h-[600px] flex items-center justify-center">
                      <div className="text-center space-y-4 sm:space-y-6 max-w-md px-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                          <FileText className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2 sm:mb-3">
                            Word Document Preview Not Available
                          </h3>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-2">
                            We can't preview Word documents in the browser.
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mb-4 sm:mb-6">
                            Please download the file to view it in Microsoft Word or another compatible application.
                          </p>
                          <div className="flex gap-2 sm:gap-4 justify-center">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg text-sm sm:text-base"
                              onClick={handleDownload}
                              disabled={downloading}
                            >
                              {downloading ? (
                                <>
                                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                                  <span className="hidden sm:inline">Downloading...</span>
                                  <span className="sm:hidden">Downloading</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                  <span className="hidden sm:inline">Download Document</span>
                                  <span className="sm:hidden">Download</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : pdfUrl ? (
                    <PDFViewer
                      fileUrl={pdfUrl}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                      zoomLevel={zoomLevel}
                      onZoomChange={setZoomLevel}
                      totalPages={totalPages}
                      onTotalPagesChange={setTotalPages}
                      className="min-h-[300px] sm:min-h-[400px] lg:min-h-[600px]"
                    />
                  ) : (
                    <div className="relative bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden min-h-[300px] sm:min-h-[400px] lg:min-h-[600px] flex items-center justify-center">
                      <div className="text-center space-y-3 sm:space-y-4 px-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                          <FileText className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                            PDF Not Available
                          </h3>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                            This module doesn't have a PDF file attached yet.
                          </p>
                          <div className="flex gap-2 sm:gap-4 justify-center">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg text-sm sm:text-base"
                              onClick={handleDownload}
                              disabled={downloading}
                            >
                              {downloading ? (
                                <>
                                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                                  <span className="hidden sm:inline">Downloading...</span>
                                  <span className="sm:hidden">Downloading</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                  <span className="hidden sm:inline">Download Module</span>
                                  <span className="sm:hidden">Download</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Progress Achievement */}
              {progress >= 100 && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-0 shadow-xl mt-3 sm:mt-4 lg:mt-6">
                  <CardHeader className="text-center pb-2 sm:pb-3">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3 lg:mb-4">
                      <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl">
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <CardTitle className="text-base sm:text-lg lg:text-2xl font-bold text-green-800 dark:text-green-200">
                        Module Completed!
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs sm:text-sm lg:text-lg text-green-700 dark:text-green-300 px-2">
                      Congratulations! You've successfully completed this learning module.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div className="text-center p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg sm:rounded-xl">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1">Knowledge Gained</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Mastered key concepts</p>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg sm:rounded-xl">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1">Achievement</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Module completed</p>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg sm:rounded-xl sm:col-span-2 lg:col-span-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1">Ready for More</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Continue learning</p>
                      </div>
                    </div>
                    <div className="flex justify-center mt-4 sm:mt-6">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-primary to-accent text-white text-sm sm:text-base"
                        onClick={() =>
                          module.subject_id
                            ? router.push(`/student/materials/${module.subject_id}`)
                            : router.push("/student/courses")
                        }
                      >
                        <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span className="hidden sm:inline">Explore More Modules</span>
                        <span className="sm:hidden">Explore More</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
