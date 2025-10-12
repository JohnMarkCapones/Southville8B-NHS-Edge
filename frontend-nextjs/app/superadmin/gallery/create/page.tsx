"use client"

import type React from "react"

import { useState } from "react"
import { PageTransition } from "@/components/superadmin/page-transition"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, X, ArrowLeft, Star, Folder, Tag, FileImage, CheckCircle, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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

interface UploadedFile {
  id: string
  file: File
  preview: string
  title: string
  description: string
  album: string
  category: string
  tags: string[]
  featured: boolean
  photographer: string
  hasConsent: boolean
}

export default function CreateGalleryPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ""),
      description: "",
      album: "Events",
      category: "Academic",
      tags: [],
      featured: false,
      photographer: "",
      hasConsent: false,
    }))
    setUploadedFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
  }

  const updateFile = (id: string, updates: Partial<UploadedFile>) => {
    setUploadedFiles((prev) => prev.map((file) => (file.id === id ? { ...file, ...updates } : file)))
  }

  const handleSubmit = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "⚠️ No Photos Selected",
        description: "Please upload at least one photo.",
        className: "border-yellow-500/20 bg-yellow-500/5",
      })
      return
    }

    const incompleteFiles = uploadedFiles.filter(
      (file) => !file.title || !file.album || !file.category || !file.hasConsent,
    )

    if (incompleteFiles.length > 0) {
      toast({
        title: "⚠️ Incomplete Information",
        description: "Please fill in all required fields and confirm consent for each photo.",
        className: "border-yellow-500/20 bg-yellow-500/5",
      })
      return
    }

    setConfirmDialogOpen(true)
  }

  const confirmUpload = () => {
    toast({
      title: "✅ Photos Uploaded Successfully",
      description: (
        <div className="space-y-2">
          <p className="font-medium">{uploadedFiles.length} photos have been added to the gallery</p>
          <div className="text-sm space-y-1">
            <p>• {uploadedFiles.filter((f) => f.featured).length} marked as featured</p>
            <p>• Organized into {new Set(uploadedFiles.map((f) => f.album)).size} albums</p>
          </div>
        </div>
      ),
      className: "border-green-500/20 bg-green-500/5 backdrop-blur-md",
      duration: 5000,
    })
    setConfirmDialogOpen(false)
    setTimeout(() => {
      router.push("/superadmin/gallery")
    }, 1000)
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push("/superadmin/gallery")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Upload Photos</h1>
              <p className="text-muted-foreground">Add new photos to the school gallery</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/superadmin/gallery")}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              disabled={uploadedFiles.length === 0}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
            </Button>
          </div>
        </div>

        {/* Photo Upload Guidelines & Disclaimer */}
        <Card className="border-blue-500/20 bg-blue-50 dark:bg-blue-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <AlertCircle className="h-5 w-5" />
              Photo Upload Guidelines & Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <div className="space-y-2">
              <p className="font-semibold">Before uploading photos, please ensure:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You have proper permission to use and publish these photos</li>
                <li>Consent has been obtained from individuals featured in the photos (especially students)</li>
                <li>Photos do not contain sensitive or inappropriate content</li>
                <li>Photo credits are properly attributed to the photographer/source</li>
                <li>Images comply with copyright and intellectual property laws</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-semibold mb-1">Privacy Notice:</p>
              <p className="text-xs">
                By uploading photos to the school gallery, you confirm that all necessary permissions and consents have
                been obtained. The school reserves the right to remove any photos that violate privacy policies or
                community guidelines.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Select Photos</CardTitle>
            <CardDescription>
              Drag and drop photos or click to browse. Supports JPG, PNG, GIF, and WebP formats.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/50"
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold mb-1">
                    Drop your photos here, or <span className="text-primary">browse</span>
                  </p>
                  <p className="text-sm text-muted-foreground">Supports: JPG, PNG, GIF, WebP (Max 10MB per file)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Uploaded Photos ({uploadedFiles.length})</CardTitle>
                  <CardDescription>Configure details for each photo before uploading</CardDescription>
                </div>
                <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                  <FileImage className="h-3 w-3 mr-1" />
                  {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <Card key={file.id} className="overflow-hidden">
                    <div className="flex gap-4 p-4">
                      {/* Preview */}
                      <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={file.preview || "/placeholder.svg"}
                          alt={file.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Form Fields */}
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`title-${file.id}`}>
                              Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`title-${file.id}`}
                              value={file.title}
                              onChange={(e) => updateFile(file.id, { title: e.target.value })}
                              placeholder="Enter photo title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`album-${file.id}`}>
                              Album <span className="text-red-500">*</span>
                            </Label>
                            <Select value={file.album} onValueChange={(value) => updateFile(file.id, { album: value })}>
                              <SelectTrigger id={`album-${file.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Events">Events</SelectItem>
                                <SelectItem value="Sports">Sports</SelectItem>
                                <SelectItem value="Arts">Arts</SelectItem>
                                <SelectItem value="Community">Community</SelectItem>
                                <SelectItem value="Campus">Campus</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`description-${file.id}`}>Description</Label>
                          <Textarea
                            id={`description-${file.id}`}
                            value={file.description}
                            onChange={(e) => updateFile(file.id, { description: e.target.value })}
                            placeholder="Enter photo description"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`category-${file.id}`}>
                              Category <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={file.category}
                              onValueChange={(value) => updateFile(file.id, { category: value })}
                            >
                              <SelectTrigger id={`category-${file.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Academic">Academic</SelectItem>
                                <SelectItem value="Athletics">Athletics</SelectItem>
                                <SelectItem value="Cultural">Cultural</SelectItem>
                                <SelectItem value="Service">Service</SelectItem>
                                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`tags-${file.id}`}>Tags (comma separated)</Label>
                            <Input
                              id={`tags-${file.id}`}
                              value={file.tags.join(", ")}
                              onChange={(e) =>
                                updateFile(file.id, {
                                  tags: e.target.value.split(",").map((t) => t.trim()),
                                })
                              }
                              placeholder="e.g., science, fair, 2024"
                            />
                          </div>
                        </div>

                        {/* Photo Credit / Photographer */}
                        <div className="space-y-2">
                          <Label htmlFor={`photographer-${file.id}`}>Photo Credit / Photographer</Label>
                          <Input
                            id={`photographer-${file.id}`}
                            value={file.photographer}
                            onChange={(e) => updateFile(file.id, { photographer: e.target.value })}
                            placeholder="e.g., John Doe, School Photography Club"
                          />
                          <p className="text-xs text-muted-foreground">
                            Attribution for the photographer or source of the photo
                          </p>
                        </div>

                        {/* Consent Confirmation */}
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-start gap-3">
                            <Switch
                              id={`consent-${file.id}`}
                              checked={file.hasConsent}
                              onCheckedChange={(checked) => updateFile(file.id, { hasConsent: checked })}
                              className="mt-1"
                            />
                            <Label htmlFor={`consent-${file.id}`} className="cursor-pointer flex-1">
                              <div className="space-y-1">
                                <p className="font-semibold text-sm text-yellow-900 dark:text-yellow-100">
                                  Consent Confirmation <span className="text-red-500">*</span>
                                </p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                  I confirm that I have obtained proper permission and consent from all individuals
                                  featured in this photo, and I have the right to publish this image on the school
                                  gallery.
                                </p>
                              </div>
                            </Label>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              id={`featured-${file.id}`}
                              checked={file.featured}
                              onCheckedChange={(checked) => updateFile(file.id, { featured: checked })}
                            />
                            <Label htmlFor={`featured-${file.id}`} className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>Mark as Featured</span>
                              </div>
                            </Label>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                Confirm Photo Upload
              </DialogTitle>
              <DialogDescription>Please review the details before uploading to the gallery.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Summary */}
              <Card className="border-blue-500/20 bg-blue-50 dark:bg-blue-950/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{uploadedFiles.length}</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Total Photos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {uploadedFiles.filter((f) => f.featured).length}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Featured</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {new Set(uploadedFiles.map((f) => f.album)).size}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Albums</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Photos to Upload:</h4>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-2 rounded-lg bg-accent/50">
                      <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={file.preview || "/placeholder.svg"}
                          alt={file.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{file.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            {file.album}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {file.category}
                          </span>
                          {file.featured && (
                            <Badge className="bg-yellow-500 text-white border-0 h-5">
                              <Star className="h-2 w-2 mr-1 fill-white" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                    Are you sure you want to upload these photos?
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    The photos will be immediately visible in the gallery. You can edit or remove them later if needed.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmUpload}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}
