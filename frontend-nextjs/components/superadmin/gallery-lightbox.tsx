"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Trash2,
  ZoomIn,
  ZoomOut,
  Star,
  Calendar,
  Eye,
  Tag,
  Maximize2,
  Loader2
} from "lucide-react"
import { GalleryItem } from "@/lib/api/types/gallery"
import { getPublicUrl, getImageAltText, needsUnoptimized } from "@/lib/utils/gallery-images"

interface GalleryLightboxProps {
  items: GalleryItem[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  onEdit?: (item: GalleryItem) => void
  onDelete?: (item: GalleryItem) => void
  onDownload?: (item: GalleryItem) => void
}

export function GalleryLightbox({
  items,
  initialIndex,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDownload
}: GalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isLoading, setIsLoading] = useState(true)
  const [zoom, setZoom] = useState(1)

  const currentItem = items[currentIndex]

  // Reset state when modal opens/closes or index changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setZoom(1)
      setIsLoading(true)
    }
  }, [isOpen, initialIndex])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") handlePrevious()
      if (e.key === "ArrowRight") handleNext()
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isOpen, currentIndex])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setZoom(1)
      setIsLoading(true)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setZoom(1)
      setIsLoading(true)
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 1))
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const determineCategoryFromTags = (tags: string[]) => {
    if (!tags || tags.length === 0) return "Uncategorized"
    return tags[0]
  }

  if (!isOpen || !currentItem) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {currentIndex + 1} of {items.length}
          </Badge>
          {currentItem.is_featured && (
            <Badge className="bg-yellow-500 text-white">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation Buttons */}
      {currentIndex > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full h-12 w-12"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {currentIndex < items.length - 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full h-12 w-12"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* Main Content */}
      <div className="flex items-center justify-center h-full p-4 pt-20 pb-32">
        <div className="relative max-w-7xl max-h-full">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 rounded-lg">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
          )}

          {/* Image */}
          <div
            className="relative transition-transform duration-300 ease-out"
            style={{ transform: `scale(${zoom})` }}
          >
            <Image
              src={getPublicUrl(currentItem)}
              alt={getImageAltText(currentItem)}
              width={1200}
              height={800}
              className="rounded-lg shadow-2xl object-contain max-h-[70vh]"
              unoptimized={needsUnoptimized(currentItem)}
              onLoad={() => setIsLoading(false)}
              priority
            />
          </div>

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm px-3">
              {Math.round(zoom * 100)}%
            </Badge>
          </div>
        </div>
      </div>

      {/* Footer with Details */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/90 to-transparent">
        <div className="max-w-4xl mx-auto">
          {/* Title and Caption */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentItem.title || 'Untitled'}
            </h2>
            {currentItem.caption && (
              <p className="text-gray-300 text-sm leading-relaxed">
                {currentItem.caption}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(currentItem.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{currentItem.views_count} views</span>
            </div>
            {currentItem.tags && currentItem.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <div className="flex gap-1">
                  {currentItem.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-gray-600 text-gray-300">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {onDownload && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onDownload(currentItem)}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border-0"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            {onEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onEdit(currentItem)
                  onClose()
                }}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border-0"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onDelete(currentItem)
                  onClose()
                }}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 backdrop-blur-sm border-0"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
