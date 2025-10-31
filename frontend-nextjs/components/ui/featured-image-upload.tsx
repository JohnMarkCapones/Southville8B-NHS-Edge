"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ImageIcon, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeaturedImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  description?: string
  className?: string
  disabled?: boolean
}

export function FeaturedImageUpload({
  value,
  onChange,
  label = "Featured Image",
  description = "Click to upload or drag and drop. PNG, JPG up to 10MB",
  className,
  disabled = false,
}: FeaturedImageUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [preview, setPreview] = React.useState<string | undefined>(value)
  const inputId = React.useId()

  React.useEffect(() => {
    setPreview(value)
  }, [value])

  const handleFileChange = (file: File | null) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, GIF, etc.)")
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPreview(result)
      onChange(result)
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleFileChange(file)
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

    const file = e.dataTransfer.files?.[0] || null
    handleFileChange(file)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPreview(undefined)
    onChange("")

    // Clear the input value
    const input = document.getElementById(inputId) as HTMLInputElement
    if (input) {
      input.value = ""
    }
  }

  const handleChange = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Trigger the file input
    const input = document.getElementById(inputId) as HTMLInputElement
    if (input) {
      input.click()
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium dark:text-gray-200">
          <ImageIcon className="h-4 w-4 inline mr-2" />
          {label}
        </Label>
      )}

      <label
        htmlFor={inputId}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg transition-all duration-300 block",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-105"
            : "border-gray-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        )}
      >
        {preview ? (
          <div className="relative group">
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Featured image preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleChange}
                disabled={disabled}
              >
                <Upload className="h-4 w-4 mr-2" />
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "transition-all duration-300",
                  isDragging ? "scale-110 text-blue-500" : "text-gray-400 dark:text-gray-500"
                )}
              >
                <Upload className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isDragging ? "Drop image here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{description}</p>
            </div>
          </div>
        )}
      </label>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  )
}

// Compact version for cards
export function FeaturedImageUploadCard({
  value,
  onChange,
  disabled = false,
}: {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
}) {
  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <ImageIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
          Featured Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FeaturedImageUpload value={value} onChange={onChange} disabled={disabled} />
      </CardContent>
    </Card>
  )
}
