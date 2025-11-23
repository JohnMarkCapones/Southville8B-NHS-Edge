"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, Loader2, AlertCircle, Maximize2, Minimize2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PDFViewerProps {
  fileUrl: string
  currentPage?: number
  onPageChange?: (page: number) => void
  zoomLevel?: number
  onZoomChange?: (zoom: number) => void
  totalPages?: number
  onTotalPagesChange?: (pages: number) => void
  className?: string
}

export default function PDFViewer({
  fileUrl,
  currentPage = 1,
  onPageChange,
  zoomLevel = 100,
  onZoomChange,
  totalPages = 0,
  onTotalPagesChange,
  className = ""
}: PDFViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [pageNum, setPageNum] = useState(currentPage)
  const [scale, setScale] = useState(zoomLevel / 100)
  const [totalPagesCount, setTotalPagesCount] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfjsLib = useRef<any>(null)
  const [isPdfJsReady, setIsPdfJsReady] = useState(false)
  const renderTaskRef = useRef<any>(null)
  
  // Unified toolbar button styles (light/dark)
  const toolbarButtonClass =
    "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-sm " +
    "dark:bg-slate-800/70 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"

  // Check if we're on the client side and load PDF.js
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true)
      
      // Load PDF.js dynamically
      const loadPDFJS = async () => {
        try {
          // Load PDF.js from CDN
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
          script.async = true
          
          script.onload = () => {
            // @ts-ignore
            pdfjsLib.current = window.pdfjsLib
            pdfjsLib.current.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
            console.log('[PDFViewer] PDF.js loaded successfully')
            setIsPdfJsReady(true)
          }
          
          document.head.appendChild(script)
        } catch (err) {
          console.error('[PDFViewer] Failed to load PDF.js:', err)
          setError('Failed to load PDF viewer')
        }
      }
      
      loadPDFJS()
    }
  }, [])

  // Load PDF document when PDF.js is ready
  useEffect(() => {
    if (!isClient || !isPdfJsReady || !pdfjsLib.current || !fileUrl) return

    const loadPDF = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('[PDFViewer] Loading PDF:', fileUrl)
        
        const loadingTask = pdfjsLib.current.getDocument(fileUrl)
        const pdf = await loadingTask.promise
        
        setPdfDoc(pdf)
        setTotalPagesCount(pdf.numPages)
        setPageNum(1)
        setLoading(false)
        
        console.log('[PDFViewer] PDF loaded successfully, pages:', pdf.numPages)
        
        // Notify parent component
        if (onTotalPagesChange) {
          onTotalPagesChange(pdf.numPages)
        }
      } catch (err) {
        console.error('[PDFViewer] Failed to load PDF:', err)
        setError(`Failed to load PDF: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setLoading(false)
      }
    }

    loadPDF()
  }, [isClient, isPdfJsReady, fileUrl, onTotalPagesChange])

  // Render PDF page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return

    const renderPage = async () => {
      try {
        // Cancel any ongoing render task before starting a new one
        if (renderTaskRef.current) {
          console.log('[PDFViewer] Cancelling previous render task')
          renderTaskRef.current.cancel()
          renderTaskRef.current = null
        }

        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        const page = await pdfDoc.getPage(pageNum)
        const viewport = page.getViewport({ scale })

        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }

        // Store the render task so we can cancel it later if needed
        renderTaskRef.current = page.render(renderContext)

        await renderTaskRef.current.promise
        renderTaskRef.current = null
        console.log('[PDFViewer] Page rendered:', pageNum)

        // Notify parent component
        if (onPageChange) {
          onPageChange(pageNum)
        }
      } catch (err) {
        // Ignore cancellation errors
        if (err instanceof Error && err.message.includes('cancelled')) {
          console.log('[PDFViewer] Render cancelled (expected)')
          return
        }
        console.error('[PDFViewer] Failed to render page:', err)
        setError(`Failed to render page: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    renderPage()

    // Cleanup: cancel render task on unmount or when dependencies change
    return () => {
      if (renderTaskRef.current) {
        console.log('[PDFViewer] Cleaning up: cancelling render task')
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
    }
  }, [pdfDoc, pageNum, scale, onPageChange])

  // Update zoom level
  useEffect(() => {
    setScale(zoomLevel / 100)
  }, [zoomLevel])

  // Update current page
  useEffect(() => {
    setPageNum(currentPage)
  }, [currentPage])

  // Navigation functions
  const goToPrevPage = useCallback(() => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1)
    }
  }, [pageNum])

  const goToNextPage = useCallback(() => {
    if (pageNum < totalPagesCount) {
      setPageNum(pageNum + 1)
    }
  }, [pageNum, totalPagesCount])

  const zoomIn = useCallback(() => {
    const newZoom = Math.min(zoomLevel + 25, 300)
    setScale(newZoom / 100)
    if (onZoomChange) {
      onZoomChange(newZoom)
    }
  }, [zoomLevel, onZoomChange])

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(zoomLevel - 25, 50)
    setScale(newZoom / 100)
    if (onZoomChange) {
      onZoomChange(newZoom)
    }
  }, [zoomLevel, onZoomChange])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  // Show loading state during SSR or initial client render
  if (!isClient) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center min-h-[600px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Initializing PDF Viewer...
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Please wait while we initialize the PDF viewer
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!fileUrl) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center min-h-[600px]">
          <div className="text-center space-y-4">
            <FileText className="w-12 h-12 text-slate-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                No PDF Available
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                This module doesn't have a PDF file attached
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center min-h-[600px]">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Error Loading PDF
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => { setLoading(true); setError(null); }}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => window.open(fileUrl, '_blank')}>
                  Open in New Tab
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center min-h-[600px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Loading PDF...
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Please wait while we load your document
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900' : ''}`}>
          {/* Navigation Header */}
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-4 border-b bg-white/60 backdrop-blur dark:bg-slate-900/70 gap-2 sm:gap-0">
            <CardTitle className="text-sm sm:text-lg">PDF Viewer</CardTitle>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full sm:w-auto">
              {/* Page Navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={pageNum <= 1}
                  className={`${toolbarButtonClass} h-8 w-8 p-0 sm:h-9 sm:w-9`}
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <span className="text-xs sm:text-sm font-medium px-1 sm:px-2 min-w-[3rem] sm:min-w-[4rem] text-center">
                  {pageNum} / {totalPagesCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={pageNum >= totalPagesCount}
                  className={`${toolbarButtonClass} h-8 w-8 p-0 sm:h-9 sm:w-9`}
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomOut}
                  className={`${toolbarButtonClass} h-8 w-8 p-0 sm:h-9 sm:w-9`}
                >
                  <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <span className="text-xs sm:text-sm font-medium px-1 sm:px-2 min-w-[2.5rem] sm:min-w-[3rem] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomIn}
                  className={`${toolbarButtonClass} h-8 w-8 p-0 sm:h-9 sm:w-9`}
                >
                  <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(fileUrl, '_blank')}
                className={`${toolbarButtonClass} h-8 px-2 sm:h-9 sm:px-3 hidden sm:flex`}
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden md:inline">New Tab</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(fileUrl, '_blank')}
                className={`${toolbarButtonClass} h-8 w-8 p-0 sm:h-9 sm:w-9`}
                title="Download"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className={`${toolbarButtonClass} h-8 w-8 p-0 sm:h-9 sm:w-9`}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>
            </div>
          </CardHeader>

          {/* PDF Canvas */}
          <div className={`${isFullscreen ? 'h-screen overflow-auto' : 'max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-auto'} bg-gray-100 dark:bg-gray-800`}>
            <div className="flex justify-center p-2 sm:p-4">
              <canvas
                ref={canvasRef}
                className="shadow-lg rounded-lg bg-white"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}