"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Maximize2, AlertTriangle, Eye, ShieldAlert, CheckCircle2 } from "lucide-react"

interface FullscreenWarningDialogProps {
  isOpen: boolean
  onClose: () => void
  onReturnToFullscreen: () => void
  exitCount: number
}

export function FullscreenWarningDialog({
  isOpen,
  onClose,
  onReturnToFullscreen,
  exitCount,
}: FullscreenWarningDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg overflow-hidden p-0 gap-0">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 px-6 py-8 text-white">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

          <DialogHeader className="relative space-y-4">
            {/* Icon */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
                <div className="relative p-4 bg-white/10 backdrop-blur-sm rounded-full border-2 border-white/30">
                  <Maximize2 className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-white">
                Fullscreen Required
              </DialogTitle>
              <DialogDescription className="text-white/90 text-base">
                Please return to fullscreen mode to continue your quiz
              </DialogDescription>
            </div>

            {/* Exit Count Badge */}
            {exitCount > 0 && (
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <ShieldAlert className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">
                    {exitCount} Exit{exitCount > 1 ? "s" : ""} Detected
                  </span>
                </div>
              </div>
            )}
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          {/* Warning Card */}
          <div className="relative overflow-hidden rounded-xl border border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="font-semibold text-orange-900 dark:text-orange-100">
                  What Happened?
                </p>
                <ul className="space-y-1.5 text-sm text-orange-800 dark:text-orange-200">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>You exited fullscreen mode (ESC key or F11)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>This action has been logged and flagged</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Your teacher will be notified in real-time</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Monitoring Info Card */}
          <div className="relative overflow-hidden rounded-xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Academic Integrity
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  This quiz is monitored to ensure fair assessment for all students. Multiple fullscreen exits may impact your submission.
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Action */}
          <div className="relative overflow-hidden rounded-xl border border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  Recommended Action
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Click "Return to Fullscreen" below to continue your quiz in fullscreen mode.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
          <div className="w-full space-y-3">
            {/* Primary Action */}
            <Button
              onClick={onReturnToFullscreen}
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 hover:from-orange-600 hover:via-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            >
              <Maximize2 className="w-5 h-5 mr-2" />
              Return to Fullscreen Mode
            </Button>

            {/* Secondary Action */}
            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
              className="w-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Continue Without Fullscreen
            </Button>

            {/* Warning Text */}
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 px-4">
              ⚠️ Continuing without fullscreen will generate additional security flags
            </p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
