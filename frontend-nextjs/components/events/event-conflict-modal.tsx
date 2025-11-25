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
import { AlertTriangle, Calendar, Clock } from "lucide-react"
import type { Event } from "@/lib/api/types/events"

interface EventConflictModalProps {
  isOpen: boolean
  onClose: () => void
  onProceed: () => void
  conflictingEvents: Event[]
  newEventDate: string
  newEventTime: string
}

export function EventConflictModal({
  isOpen,
  onClose,
  conflictingEvents,
  newEventDate,
  newEventTime,
  onProceed,
}: EventConflictModalProps) {
  // Format date to readable format
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Format time to 12-hour AM/PM
  const formatTime = (time24: string): string => {
    if (!time24) return ""
    const [hours, minutes] = time24.split(":")
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/20">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">Scheduling Conflict Detected</DialogTitle>
              <DialogDescription>
                There {conflictingEvents.length === 1 ? 'is' : 'are'} {conflictingEvents.length} other event{conflictingEvents.length > 1 ? 's' : ''} scheduled at the same time
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* New Event Info */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
            <div className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Your New Event
            </div>
            <div className="flex items-center gap-4 text-sm text-blue-800 dark:text-blue-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(newEventDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatTime(newEventTime)}</span>
              </div>
            </div>
          </div>

          {/* Conflicting Events */}
          <div>
            <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
              Conflicting Event{conflictingEvents.length > 1 ? 's' : ''}:
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {conflictingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800"
                >
                  <div className="font-medium text-amber-900 dark:text-amber-200 mb-1">
                    {event.title}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-amber-700 dark:text-amber-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(event.time)}</span>
                    </div>
                  </div>
                  {event.location && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      📍 {event.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Warning Message */}
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Note:</strong> Creating multiple events at the same time may cause confusion for attendees.
              Consider changing the date or time, or proceed if this is intentional (e.g., different locations or audiences).
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel & Change Time
          </Button>
          <Button
            onClick={onProceed}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Create Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
