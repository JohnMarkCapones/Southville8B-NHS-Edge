"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImageUpload: (imageUrl: string) => void
}

export function ImageUploadDialog({ open, onOpenChange, onImageUpload }: ImageUploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

  const handleFile = useCallback((file: File) => {
    setError(null)

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, or WebP)")
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 5MB")
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile],
  )

  const handleInsert = useCallback(() => {
    if (preview) {
      onImageUpload(preview)
      setPreview(null)
      setError(null)
      onOpenChange(false)
    }
  }, [preview, onImageUpload, onOpenChange])

  const handleCancel = useCallback(() => {
    setPreview(null)
    setError(null)
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">Upload Image</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Upload an image to insert into your article
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!preview ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-400
                ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/20"
                    : "border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                }
              `}
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />

              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    <span className="text-blue-600 dark:text-blue-400 underline">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum 1 file, 5MB each</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF, or WebP</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-auto max-h-[300px] object-contain bg-gray-50 dark:bg-slate-800"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreview(null)}
                  className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-800 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInsert}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Insert Image
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
