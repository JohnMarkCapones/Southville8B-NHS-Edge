"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  ArrowLeft,
  File,
  FileText,
  Info,
  X,
  AlertCircle,
  BookOpen,
  Users,
  Calendar,
  Clock,
  Settings,
  Save,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

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

// TODO: DATABASE - Fetch this mapping from your database
const gradeSectionsMap: Record<string, string[]> = {
  "Grade 7": ["Newton", "Galileo", "Einstein", "Curie"],
  "Grade 8": ["Darwin", "Tesla", "Hawking", "Pasteur"],
  "Grade 9": ["Aristotle", "Archimedes", "Pythagoras", "Euclid"],
  "Grade 10": ["Da Vinci", "Edison", "Franklin", "Faraday"],
}

export default function EditMaterialPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const materialId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveProgress, setSaveProgress] = useState(0)
  const [material, setMaterial] = useState<StudentMaterial | null>(null)

  const [validationAlert, setValidationAlert] = useState({
    open: false,
    title: "",
    message: "",
    errors: [] as string[],
  })

  const [saveConfirmation, setSaveConfirmation] = useState({
    open: false,
  })

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    subject: "",
    gradeLevel: "",
    topic: "",
    assignedSections: [] as string[],
    publishDate: "",
    expirationDate: "",
    allowDownload: true,
    status: "published" as MaterialStatus,
    newFiles: [] as File[],
    keepExistingFile: true,
  })

  // TODO: DATABASE - Fetch subjects from database
  const subjects = ["Mathematics", "Science", "English", "Filipino", "History", "PE"]
  const grades = ["Grade 7", "Grade 8", "Grade 9", "Grade 10"]

  const availableSections = useMemo(() => {
    if (!editForm.gradeLevel) return []
    return gradeSectionsMap[editForm.gradeLevel] || []
  }, [editForm.gradeLevel])

  // TODO: DATABASE - Fetch material data from database
  useEffect(() => {
    const fetchMaterial = async () => {
      setIsLoading(true)

      // Example:
      // const response = await fetch(`/api/teacher/student-materials/${materialId}`)
      // const data = await response.json()
      // setMaterial(data.material)

      // Mock data for demonstration
      const mockMaterial: StudentMaterial = {
        id: materialId,
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
        assignedSections: ["Darwin", "Tesla"],
        views: 145,
        downloads: 89,
        uploadedAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      }

      setMaterial(mockMaterial)

      // Pre-populate form with existing data
      setEditForm({
        title: mockMaterial.title,
        description: mockMaterial.description,
        subject: mockMaterial.subject,
        gradeLevel: mockMaterial.gradeLevel,
        topic: mockMaterial.topic,
        assignedSections: mockMaterial.assignedSections,
        publishDate: mockMaterial.publishDate ? formatDateForInput(mockMaterial.publishDate) : "",
        expirationDate: mockMaterial.expirationDate ? formatDateForInput(mockMaterial.expirationDate) : "",
        allowDownload: mockMaterial.allowDownload,
        status: mockMaterial.status,
        newFiles: [],
        keepExistingFile: true,
      })

      setIsLoading(false)
    }

    fetchMaterial()
  }, [materialId])

  const formatDateForInput = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files)
      setEditForm((prev) => ({ ...prev, newFiles: fileArray, keepExistingFile: false }))
    }
  }, [])

  const handleRemoveNewFile = useCallback((index: number) => {
    setEditForm((prev) => ({
      ...prev,
      newFiles: prev.newFiles.filter((_, i) => i !== index),
      keepExistingFile: prev.newFiles.length === 1, // If removing the only new file, keep existing
    }))
  }, [])

  const validateEditForm = useCallback(() => {
    const errors: string[] = []

    if (!editForm.title.trim()) {
      errors.push("Title is required")
    }

    if (!editForm.description.trim()) {
      errors.push("Description is required")
    }

    if (!editForm.subject) {
      errors.push("Subject is required")
    }

    if (!editForm.gradeLevel) {
      errors.push("Grade Level is required")
    }

    if (!editForm.topic.trim()) {
      errors.push("Topic/Module is required")
    }

    if (editForm.assignedSections.length === 0) {
      errors.push("At least one section must be selected")
    }

    return errors
  }, [editForm])

  const handleSave = useCallback(async () => {
    const validationErrors = validateEditForm()

    if (validationErrors.length > 0) {
      setValidationAlert({
        open: true,
        title: "Please Complete All Required Fields",
        message: "The following fields are required to update the material:",
        errors: validationErrors,
      })
      return
    }

    setSaveConfirmation({ open: true })
  }, [editForm, validateEditForm])

  const confirmSave = useCallback(async () => {
    setSaveConfirmation({ open: false })
    setIsSaving(true)
    setSaveProgress(0)

    // TODO: DATABASE - Update material in database
    // Example:
    // const formData = new FormData()
    // if (editForm.newFiles.length > 0) {
    //   editForm.newFiles.forEach((file, index) => {
    //     formData.append(`file${index}`, file)
    //   })
    // }
    // formData.append('metadata', JSON.stringify({
    //   title: editForm.title,
    //   description: editForm.description,
    //   subject: editForm.subject,
    //   gradeLevel: editForm.gradeLevel,
    //   topic: editForm.topic,
    //   assignedSections: editForm.assignedSections,
    //   publishDate: editForm.publishDate,
    //   expirationDate: editForm.expirationDate,
    //   allowDownload: editForm.allowDownload,
    //   status: editForm.status,
    //   keepExistingFile: editForm.keepExistingFile
    // }))
    //
    // const response = await fetch(`/api/teacher/student-materials/${materialId}`, {
    //   method: 'PUT',
    //   body: formData
    // })
    //
    // const result = await response.json()

    // Simulate save progress
    const interval = setInterval(() => {
      setSaveProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsSaving(false)

          toast({
            title: "Material updated!",
            description: "Your changes have been saved successfully.",
            duration: 3000,
          })

          // Navigate back to materials page
          setTimeout(() => {
            router.push("/teacher/student-materials")
          }, 500)

          return 100
        }
        return prev + 10
      })
    }, 200)
  }, [editForm, materialId, router, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading material...</p>
        </div>
      </div>
    )
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
            <h2 className="text-xl font-semibold">Material Not Found</h2>
            <p className="text-slate-600 dark:text-slate-400">The material you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/teacher/student-materials")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Materials
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Validation Alert Dialog */}
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

      {/* Save Confirmation Dialog */}
      <Dialog open={saveConfirmation.open} onOpenChange={(open) => setSaveConfirmation({ open })}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Save className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <DialogTitle className="text-xl">Save Changes?</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              Are you sure you want to save these changes? The updated material will be available to assigned sections.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">{editForm.title}</p>
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <p>
                  <span className="font-medium">Subject:</span> {editForm.subject}
                </p>
                <p>
                  <span className="font-medium">Grade:</span> {editForm.gradeLevel}
                </p>
                <p>
                  <span className="font-medium">Sections:</span> {editForm.assignedSections.join(", ")}
                </p>
                {editForm.newFiles.length > 0 && (
                  <p>
                    <span className="font-medium">New File:</span> {editForm.newFiles[0].name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSaveConfirmation({ open: false })} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={confirmSave}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto p-6 space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/teacher/student-materials")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Edit Material
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Update material information and settings</p>
            </div>
          </div>
        </div>

        {/* Edit Form Card */}
        <Card>
          <CardHeader className="space-y-3 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Material Information</CardTitle>
                <CardDescription className="text-base">Update the details of your learning material</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Current File Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <File className="w-4 h-4" />
                <span>Current File</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{material.fileName}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(material.fileSize)}</p>
                    </div>
                  </div>
                  {editForm.keepExistingFile && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Current
                    </Badge>
                  )}
                </div>
              </div>

              {/* Replace File Option */}
              {editForm.newFiles.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">New file selected</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditForm((prev) => ({ ...prev, newFiles: [], keepExistingFile: true }))}
                        className="h-7 text-xs"
                      >
                        Keep original
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{editForm.newFiles[0].name}</p>
                          <p className="text-xs text-slate-500">{formatFileSize(editForm.newFiles[0].size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveNewFile(0)}
                        className="h-7 w-7 p-0 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-300 cursor-pointer group">
                  <input
                    type="file"
                    id="file-replace"
                    className="hidden"
                    onChange={handleFileInputChange}
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.mp4"
                  />
                  <label htmlFor="file-replace" className="cursor-pointer">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Replace with new file</p>
                    <p className="text-xs text-slate-500 mt-1">Click to upload a different file</p>
                  </label>
                </div>
              )}

              {/* Save Progress */}
              {isSaving && (
                <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-blue-700 dark:text-blue-300">Saving changes...</span>
                    <span className="text-blue-600 dark:text-blue-400">{saveProgress}%</span>
                  </div>
                  <Progress value={saveProgress} className="h-2" />
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
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Introduction to Algebra - Chapter 1"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a brief description of what students will learn from this material..."
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-sm font-medium">
                    Topic/Module
                  </Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Algebra Basics, Chapter 1, Unit 2"
                    value={editForm.topic}
                    onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
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
                    value={editForm.subject}
                    onValueChange={(value) => setEditForm({ ...editForm, subject: value })}
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
                    value={editForm.gradeLevel}
                    onValueChange={(value) => {
                      setEditForm({ ...editForm, gradeLevel: value, assignedSections: [] })
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
                {!editForm.gradeLevel ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Please select a grade level first to see available sections
                    </p>
                  </div>
                ) : availableSections.length === 0 ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      No sections available for {editForm.gradeLevel}
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
                            editForm.assignedSections.includes(section)
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                              : "border-slate-200 dark:border-slate-800",
                          )}
                          onClick={() => {
                            if (editForm.assignedSections.includes(section)) {
                              setEditForm({
                                ...editForm,
                                assignedSections: editForm.assignedSections.filter((s) => s !== section),
                              })
                            } else {
                              setEditForm({
                                ...editForm,
                                assignedSections: [...editForm.assignedSections, section],
                              })
                            }
                          }}
                        >
                          <Checkbox
                            id={section}
                            checked={editForm.assignedSections.includes(section)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setEditForm({
                                  ...editForm,
                                  assignedSections: [...editForm.assignedSections, section],
                                })
                              } else {
                                setEditForm({
                                  ...editForm,
                                  assignedSections: editForm.assignedSections.filter((s) => s !== section),
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
                      {editForm.assignedSections.length} section(s) selected
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="publishDate" className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Publish Date
                    </Label>
                    <Input
                      id="publishDate"
                      type="datetime-local"
                      value={editForm.publishDate}
                      onChange={(e) => setEditForm({ ...editForm, publishDate: e.target.value })}
                      className="h-11"
                    />
                    <p className="text-xs text-slate-500">Leave empty to publish immediately</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expirationDate" className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Expiration Date
                    </Label>
                    <Input
                      id="expirationDate"
                      type="datetime-local"
                      value={editForm.expirationDate}
                      onChange={(e) => setEditForm({ ...editForm, expirationDate: e.target.value })}
                      className="h-11"
                    />
                    <p className="text-xs text-slate-500">Optional - auto-hide after this date</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <Checkbox
                    id="allowDownload"
                    checked={editForm.allowDownload}
                    onCheckedChange={(checked) => setEditForm({ ...editForm, allowDownload: checked as boolean })}
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
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/teacher/student-materials")} className="h-11">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
