"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Play,
  Pause,
  Loader2,
  AlertCircle
} from "lucide-react"

interface SlideshowViewerProps {
  slideUrls: string[]
  currentSlide?: number
  onSlideChange?: (slide: number) => void
  zoomLevel?: number
  onZoomChange?: (zoom: number) => void
  className?: string
}

export default function SlideshowViewer({
  slideUrls,
  currentSlide = 1,
  onSlideChange,
  zoomLevel = 100,
  onZoomChange,
  className = ""
}: SlideshowViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(currentSlide - 1)
  const [scale, setScale] = useState(zoomLevel / 100)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const totalSlides = slideUrls.length

  // Initialize current slide from props
  useEffect(() => {
    setCurrentSlideIndex(Math.max(0, Math.min(currentSlide - 1, totalSlides - 1)))
  }, [currentSlide, totalSlides])

  // Update zoom level from props
  useEffect(() => {
    setScale(zoomLevel / 100)
  }, [zoomLevel])

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlideIndex(prev => (prev + 1) % totalSlides)
      }, 3000) // 3 seconds per slide
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
        autoPlayRef.current = null
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isPlaying, totalSlides])

  // Notify parent of slide changes
  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(currentSlideIndex + 1)
    }
  }, [currentSlideIndex, onSlideChange])

  // Notify parent of zoom changes
  useEffect(() => {
    if (onZoomChange) {
      onZoomChange(scale * 100)
    }
  }, [scale, onZoomChange])

  const handlePrevSlide = useCallback(() => {
    setCurrentSlideIndex(prev => Math.max(0, prev - 1))
    setIsPlaying(false) // Stop auto-play when manually navigating
  }, [])

  const handleNextSlide = useCallback(() => {
    setCurrentSlideIndex(prev => (prev + 1) % totalSlides)
    setIsPlaying(false) // Stop auto-play when manually navigating
  }, [totalSlides])

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3.0)) // Max zoom 300%
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5)) // Min zoom 50%
  }, [])

  const handleResetZoom = useCallback(() => {
    setScale(1.0)
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentSlideIndex(index)
    setIsPlaying(false) // Stop auto-play when manually navigating
  }, [])

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set([...prev, index]))
  }, [])

  const handleImageError = useCallback((index: number) => {
    setImageErrors(prev => new Set([...prev, index]))
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          handlePrevSlide()
          break
        case 'ArrowRight':
          event.preventDefault()
          handleNextSlide()
          break
        case ' ':
          event.preventDefault()
          togglePlayPause()
          break
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrevSlide, handleNextSlide, togglePlayPause, isFullscreen])

  if (!slideUrls || slideUrls.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center min-h-[600px]">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                No Slides Available
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                This presentation doesn't have any slides to display
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentSlideUrl = slideUrls[currentSlideIndex]
  const isCurrentSlideLoaded = loadedImages.has(currentSlideIndex)
  const hasCurrentSlideError = imageErrors.has(currentSlideIndex)

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900' : ''}`}>
          {/* Header Controls */}
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
            <CardTitle className="text-lg">Presentation Viewer</CardTitle>
            <div className="flex items-center gap-2">
              {/* Play/Pause Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayPause}
                className="bg-white/90 hover:bg-white shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              {/* Slide Navigation */}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevSlide}
                disabled={currentSlideIndex <= 0}
                className="bg-white/90 hover:bg-white shadow-md"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                Slide {currentSlideIndex + 1} of {totalSlides}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextSlide}
                disabled={currentSlideIndex >= totalSlides - 1}
                className="bg-white/90 hover:bg-white shadow-md"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              {/* Zoom Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="bg-white/90 hover:bg-white shadow-md"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={scale >= 3.0}
                className="bg-white/90 hover:bg-white shadow-md"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
                className="bg-white/90 hover:bg-white shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              {/* Fullscreen Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="bg-white/90 hover:bg-white shadow-md"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>

          {/* Main Slide Display */}
          <div className={`${isFullscreen ? 'h-screen overflow-auto' : 'max-h-[600px] overflow-auto'}`}>
            <div className="flex items-center justify-center p-4">
              <div 
                className="relative bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden shadow-lg"
                style={{ 
                  transform: `scale(${scale})`,
                  transformOrigin: 'center center'
                }}
              >
                {hasCurrentSlideError ? (
                  <div className="w-[800px] h-[600px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                          Failed to Load Slide
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          Slide {currentSlideIndex + 1} could not be loaded
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {!isCurrentSlideLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                        <div className="text-center space-y-4">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                          <p className="text-slate-600 dark:text-slate-400">Loading slide...</p>
                        </div>
                      </div>
                    )}
                    <img
                      src={currentSlideUrl}
                      alt={`Slide ${currentSlideIndex + 1}`}
                      className="w-[800px] h-[600px] object-contain"
                      onLoad={() => handleImageLoad(currentSlideIndex)}
                      onError={() => handleImageError(currentSlideIndex)}
                      style={{ display: isCurrentSlideLoaded ? 'block' : 'none' }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="border-t bg-slate-50 dark:bg-slate-800 p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {slideUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`flex-shrink-0 w-20 h-14 rounded border-2 overflow-hidden transition-all ${
                    index === currentSlideIndex
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}








