"use client"

import React, { useCallback, useRef, useState } from "react"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * Image data structure returned by Cloudflare Images API
 */
export interface QuizImageData {
  imageId: string
  imageUrl: string
  cardUrl: string
  thumbnailUrl: string
  fileSize: number
  mimeType: string
}

export interface QuizImageUploaderProps {
  /**
   * Current image URL (for displaying existing images)
   */
  value?: string

  /**
   * Callback when image data changes (upload success or delete)
   * @param imageData - Complete image data from Cloudflare, or null on delete
   */
  onChange: (imageData: QuizImageData | null) => void

  /**
   * Label to display above the uploader
   */
  label?: string

  /**
   * Maximum file size in megabytes (default: 10MB)
   */
  maxSizeMB?: number

  /**
   * Variant for styling (affects label text)
   */
  variant?: "question" | "choice"

  /**
   * Whether the uploader is disabled
   */
  disabled?: boolean

  /**
   * Custom className for the container
   */
  className?: string

  /**
   * Compact mode: shows button instead of full upload area
   * Opens upload UI in a dialog when clicked
   */
  compact?: boolean
}

/**
 * QuizImageUploader Component
 *
 * A reusable image uploader for quiz questions and answer choices.
 * Features:
 * - Drag-and-drop support
 * - Image preview with thumbnail
 * - Upload progress indicator
 * - Delete functionality
 * - Dark mode compatible
 * - Mobile responsive
 * - Comprehensive error handling
 * - Integrates with Cloudflare Images via /api/quiz/images/upload
 *
 * @example
 * ```tsx
 * const [imageData, setImageData] = useState<QuizImageData | null>(null)
 *
 * <QuizImageUploader
 *   value={imageData?.imageUrl}
 *   onChange={setImageData}
 *   label="Question Image"
 *   variant="question"
 * />
 * ```
 */
export function QuizImageUploader({
  value,
  onChange,
  label,
  maxSizeMB = 10,
  variant = "question",
  disabled = false,
  className,
  compact = false,
}: QuizImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Validate file type
  const isValidImageType = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"]
    return validTypes.includes(file.type)
  }

  // Validate file size
  const isValidFileSize = (file: File): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
  }

  // Upload file to API
  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Validate file type
      if (!isValidImageType(file)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, GIF, WebP, or AVIF image.",
          variant: "destructive",
        })
        return
      }

      // Validate file size
      if (!isValidFileSize(file)) {
        toast({
          title: "File too large",
          description: `Image size must be less than ${maxSizeMB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
          variant: "destructive",
        })
        return
      }

      // Simulate progress for better UX (since we can't track actual upload progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Create FormData
      const formData = new FormData()
      formData.append("file", file)

      // Get auth token from cookie
      const getTokenFromCookie = (): string | null => {
        if (typeof window === 'undefined') return null
        const match = document.cookie.match(/sb-access-token=([^;]+)/)
        return match ? match[1] : null
      }

      const token = getTokenFromCookie()
      if (!token) {
        throw new Error("Authentication required. Please log in.")
      }

      // Upload to backend API (port 3004)
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'
      const response = await fetch(`${apiBaseUrl}/api/v1/quiz/images/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
        // Note: Don't set Content-Type header, browser will set it with boundary
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Upload failed with status ${response.status}`)
      }

      const data: QuizImageData = await response.json()
      setUploadProgress(100)

      // Call onChange with complete image data
      onChange(data)

      // Close dialog on success (if in compact mode)
      if (compact) {
        setDialogOpen(false)
      }

      toast({
        title: "Upload successful",
        description: `${variant === "question" ? "Question" : "Choice"} image uploaded successfully.`,
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred while uploading the image.",
        variant: "destructive",
      })
      setUploadProgress(0)
    } finally {
      setIsUploading(false)

      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0)
      }, 1000)
    }
  }

  // Handle file input change
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && !disabled) {
        uploadFile(file)
      }
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [disabled, uploadFile]
  )

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled) return

      const file = e.dataTransfer.files[0]
      if (file) {
        uploadFile(file)
      }
    },
    [disabled, uploadFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (disabled) return

    try {
      // Call onChange with null to clear the image
      onChange(null)

      toast({
        title: "Image removed",
        description: `${variant === "question" ? "Question" : "Choice"} image has been removed.`,
      })
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Delete failed",
        description: "An error occurred while removing the image.",
        variant: "destructive",
      })
    }
  }, [disabled, onChange, variant, toast])

  // Handle click to open file picker
  const handleClick = useCallback(() => {
    if (!disabled && !value) {
      fileInputRef.current?.click()
    }
  }, [disabled, value])

  // Render the full upload UI (used in both normal mode and dialog)
  const renderUploadUI = () => (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg transition-all duration-200",
        isDragging
          ? "border-school-blue bg-blue-50 dark:bg-blue-950/20 scale-[1.02]"
          : "border-gray-300 dark:border-gray-600 hover:border-school-blue dark:hover:border-school-blue",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && !isUploading && "cursor-pointer"
      )}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Upload UI */}
      <div className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3">
          {/* Icon */}
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              isDragging
                ? "bg-school-blue text-white"
                : "bg-blue-100 dark:bg-blue-900/30 text-school-blue"
            )}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          {/* Text */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isUploading ? (
                "Uploading..."
              ) : (
                <>
                  <span className="text-school-blue underline">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              JPEG, PNG, GIF, WebP, AVIF (max {maxSizeMB}MB)
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {isUploading && uploadProgress > 0 && (
          <div className="mt-4">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
              {uploadProgress}%
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
    </div>
  )

  // COMPACT MODE
  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        {!value ? (
          // No image - show compact button
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
            disabled={disabled}
            className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-500 transition-all"
          >
            <ImageIcon className="w-4 h-4" />
            {label || "Add Image"}
          </Button>
        ) : (
          // Has image - show larger preview with actions
          <div className="space-y-2">
            {label && (
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {label}
              </label>
            )}
            <div className="relative group w-full max-w-md">
              {/* Image container with aspect ratio */}
              <div className="relative w-full aspect-video rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-sm">
                <img
                  src={value}
                  alt={`${variant} preview`}
                  className="w-full h-full object-contain"
                />

                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                        <ImageIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs text-white font-medium">
                        {variant === "question" ? "Question Image" : "Choice Image"}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setDialogOpen(true)}
                        disabled={disabled}
                        className="gap-1.5 h-8 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span className="text-xs">Replace</span>
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={disabled}
                        className="gap-1.5 h-8"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span className="text-xs">Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {value ? "Replace Image" : `Upload ${variant === "question" ? "Question" : "Choice"} Image`}
              </DialogTitle>
              <DialogDescription>
                Upload an image for this {variant === "question" ? "question" : "answer choice"}.
                Supported formats: JPEG, PNG, GIF, WebP, AVIF (max {maxSizeMB}MB)
              </DialogDescription>
            </DialogHeader>
            {renderUploadUI()}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // NORMAL MODE (original behavior)
  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* Upload area or Image preview */}
      {!value ? (
        renderUploadUI()
      ) : (
        // Image Preview
        <div className="relative group">
          <div className="relative border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Image */}
            <div className="relative aspect-video w-full">
              <img
                src={value}
                alt={`${variant} preview`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              {/* Delete button */}
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={disabled}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Remove
              </Button>

              {/* Replace button */}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Replace
              </Button>
            </div>
          </div>

          {/* Hidden file input for replace */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
        </div>
      )}

      {/* Helper text for existing image */}
      {value && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Hover over the image to remove or replace it
        </p>
      )}
    </div>
  )
}
