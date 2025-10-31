"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ValidationError {
  field: string
  message: string
  severity: "error" | "warning"
}

interface EventValidationErrorsModalProps {
  isOpen: boolean
  onClose: () => void
  errors: ValidationError[]
  onFixErrors?: () => void
}

export function EventValidationErrorsModal({
  isOpen,
  onClose,
  errors,
  onFixErrors,
}: EventValidationErrorsModalProps) {
  const errorCount = errors.filter((e) => e.severity === "error").length
  const warningCount = errors.filter((e) => e.severity === "warning").length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">Validation Errors Found</DialogTitle>
              <DialogDescription>
                Please fix the following {errorCount > 0 && `${errorCount} error${errorCount > 1 ? "s" : ""}`}
                {errorCount > 0 && warningCount > 0 && " and "}
                {warningCount > 0 && `${warningCount} warning${warningCount > 1 ? "s" : ""}`} before submitting
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {errors.map((error, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border-l-4",
                error.severity === "error"
                  ? "bg-red-50 dark:bg-red-900/10 border-red-500"
                  : "bg-amber-50 dark:bg-amber-900/10 border-amber-500"
              )}
            >
              <AlertCircle
                className={cn(
                  "w-5 h-5 mt-0.5 flex-shrink-0",
                  error.severity === "error" ? "text-red-600" : "text-amber-600"
                )}
              />
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "font-semibold text-sm mb-1",
                    error.severity === "error"
                      ? "text-red-900 dark:text-red-200"
                      : "text-amber-900 dark:text-amber-200"
                  )}
                >
                  {error.field}
                </div>
                <div
                  className={cn(
                    "text-sm",
                    error.severity === "error"
                      ? "text-red-700 dark:text-red-300"
                      : "text-amber-700 dark:text-amber-300"
                  )}
                >
                  {error.message}
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onClose()
              onFixErrors?.()
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Fix Errors
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
