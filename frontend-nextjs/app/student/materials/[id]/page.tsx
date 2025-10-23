"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
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
import StudentLayout from "@/components/student/student-layout"
import {
  Download,
  Star,
  Award,
  Users,
  ArrowLeft,
  Eye,
  Heart,
  Bookmark,
  Trophy,
  Target,
  Zap,
  GraduationCap,
  Loader2,
  AlertCircle,
  FileText,
  Calendar,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSubject, type Subject } from "@/lib/api/endpoints/subjects"
import { getModules, getModuleDownloadUrl, type Module } from "@/lib/api/endpoints/modules"

export default function SubjectMaterialsPage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.id as string
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([])
  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<{ id: string; title: string } | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  // Fetch subject and modules data
  useEffect(() => {
    const fetchData = async () => {
      if (!subjectId) return

      try {
        setLoading(true)
        setError(null)
        console.log('[SubjectMaterials] Fetching subject:', subjectId)

        // Fetch subject data
        const subjectData = await getSubject(subjectId)
        setSubject(subjectData)
        console.log('[SubjectMaterials] ✅ Subject loaded:', subjectData.subject_name)

        // Fetch modules for this subject
        console.log('[SubjectMaterials] Fetching modules for subject:', subjectId)
        const modulesData = await getModules({ subjectId, limit: 100 })
        setModules(modulesData.modules)
        console.log('[SubjectMaterials] ✅ Loaded', modulesData.modules.length, 'modules')
      } catch (err) {
        console.error('[SubjectMaterials] ❌ Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load subject data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [subjectId])

  // Fallback helper function
  const fallback = (value: any, defaultValue: string = '-april') => {
    if (value === null || value === undefined || value === '') {
      return defaultValue
    }
    return value
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-april Unknown'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-april Unknown'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return '-april Invalid'
    }
  }

  const progressPercentage = modules.length > 0
    ? Math.round((modules.filter(m => m.downloadStats?.totalDownloads).length / modules.length) * 100)
    : 0

  const toggleBookmark = (id: string) => {
    setBookmarkedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleDownloadClick = (module: { id: string; title: string }) => {
    setSelectedModule(module)
    setDownloadConfirmOpen(true)
  }

  const handleDownloadConfirm = async () => {
    if (!selectedModule) return

    try {
      setDownloading(selectedModule.id)
      console.log('[SubjectMaterials] Downloading module:', selectedModule.title)
      const { url } = await getModuleDownloadUrl(selectedModule.id)
      window.open(url, '_blank')
      console.log('[SubjectMaterials] ✅ Download started')
    } catch (err) {
      console.error('[SubjectMaterials] ❌ Download failed:', err)
      alert('Failed to download module. Please try again.')
    } finally {
      setDownloading(null)
      setDownloadConfirmOpen(false)
      setSelectedModule(null)
    }
  }

  // Loading state
  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Loading Subject Materials...</h2>
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
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Error Loading Subject</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>
                <Download className="w-4 h-4 mr-2" />
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

  // Subject not found
  if (!subject) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Subject Not Found</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">The subject you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/student/courses")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-accent to-primary dark:from-primary/80 dark:via-accent/80 dark:to-primary/80">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>

          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/30 rounded-full blur-2xl"></div>
            <div className="absolute top-10 right-20 w-40 h-40 bg-cyan-600/35 rounded-full"></div>
            <div className="absolute top-32 right-40 w-20 h-20 bg-teal-600/40 rounded-full"></div>
            <div className="absolute bottom-10 left-32 w-32 h-32 bg-indigo-600/30 rounded-lg rotate-45"></div>
            <div className="absolute top-20 left-1/3 w-16 h-16 bg-sky-600/35 rounded-md rotate-12"></div>
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-blue-700/25 rounded-full blur-xl"></div>
            <div
              className="absolute bottom-20 right-1/4 w-24 h-24 bg-cyan-700/30 rounded-full"
              style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
            ></div>
          </div>

          <div className="relative p-8 text-white">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/student/courses")}
                className="text-white hover:bg-black/20 backdrop-blur-sm border-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-2xl">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2 text-white">{fallback(subject.subject_name, '-april Untitled Subject')}</h1>
                  <p className="text-white/90 text-lg mb-2">{fallback(subject.description, '-april No description available')}</p>
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Code: {fallback(subject.code, '-april N/A')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      <span>{progressPercentage}% Accessed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(subject.updated_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-white/20 text-white border-white/30">{fallback(subject.status, '-april unknown')}</Badge>
                    {subject.grade_levels && subject.grade_levels.length > 0 && (
                      <Badge className="bg-white/10 text-white border-white/20">
                        Grades: {subject.grade_levels.join(', ')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-600/40 backdrop-blur-sm rounded-xl p-4 text-center border border-blue-500/30">
                  <div className="text-2xl font-bold text-white">{modules.length}</div>
                  <div className="text-sm text-white/80">Total Modules</div>
                </div>
                <div className="bg-cyan-600/40 backdrop-blur-sm rounded-xl p-4 text-center border border-cyan-500/30">
                  <div className="text-2xl font-bold text-white">
                    {modules.filter(m => m.downloadStats?.totalDownloads).length}
                  </div>
                  <div className="text-sm text-white/80">Downloaded</div>
                </div>
                <div className="bg-indigo-600/40 backdrop-blur-sm rounded-xl p-4 text-center border border-indigo-500/30">
                  <div className="text-2xl font-bold text-white">{progressPercentage}%</div>
                  <div className="text-sm text-white/80">Access Rate</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">Overall Progress</span>
                <span className="text-sm font-bold text-white">{progressPercentage}%</span>
              </div>
              <div className="relative">
                <Progress value={progressPercentage} className="h-3 bg-blue-900/40" />
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                Learning Modules
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {modules.length > 0
                  ? `Access ${modules.length} comprehensive study materials and resources`
                  : '-april No modules available for this subject yet'}
              </p>
            </div>

            {modules.length === 0 ? (
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl p-12 text-center">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Modules Available</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  -april There are no modules uploaded for this subject yet. Please check back later.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module, index) => (
                  <Card
                    key={module.id}
                    className="group hover:-translate-y-2 transition-all duration-500 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 p-8 h-48 flex items-center justify-center">
                      <FileText className="w-20 h-20 text-primary/40" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-primary text-white border-0">{fallback(module.mime_type, '-april PDF')}</Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:bg-white/20 backdrop-blur-sm"
                          onClick={() => toggleBookmark(module.id)}
                        >
                          <Bookmark className={`w-4 h-4 ${bookmarkedItems.includes(module.id) ? "fill-current" : ""}`} />
                        </Button>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 text-sm font-medium">
                          <span>{formatFileSize(module.file_size_bytes)}</span>
                          <span>{formatDate(module.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-2">
                        {fallback(module.title, '-april Untitled Module')}
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400 line-clamp-2">
                        {fallback(module.description, '-april No description available')}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          <span>{fallback(module.downloadStats?.totalDownloads?.toString(), '-april 0')} downloads</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{fallback(module.uploader?.full_name, '-april Unknown')}</span>
                        </div>
                      </div>

                      {module.sections && module.sections.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {module.sections.slice(0, 2).map((section) => (
                            <Badge key={section.id} variant="outline" className="text-xs">
                              {section.name}
                            </Badge>
                          ))}
                          {module.sections.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{module.sections.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-300"
                          onClick={() => router.push(`/student/modules/${module.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Module
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 bg-transparent"
                          onClick={() => handleDownloadClick({ id: module.id, title: module.title })}
                          disabled={downloading === module.id || !module.file_url}
                        >
                          {downloading === module.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Learning Achievements</CardTitle>
              </div>
              <CardDescription className="text-lg">Track your progress and celebrate your success!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Quick Learner</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Completed 5 modules this week</p>
                </div>
                <div className="text-center p-6 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Goal Achiever</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Reached 75% completion rate</p>
                </div>
                <div className="text-center p-6 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Top Performer</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Scored 95% average on quizzes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <AlertDialog open={downloadConfirmOpen} onOpenChange={setDownloadConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Download Module</AlertDialogTitle>
              <AlertDialogDescription>
                Do you want to download "{selectedModule?.title}"? This file will be saved to your device.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDownloadConfirm} disabled={!!downloading}>
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  'Download'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </StudentLayout>
  )
}
