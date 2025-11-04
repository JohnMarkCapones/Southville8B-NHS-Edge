"use client"

import { useState, useEffect } from "react"
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
import { Clock, AlertTriangle, CheckCircle, Save } from "lucide-react"
import type { Quiz, QuizResponse } from "@/types/quiz"

interface TimeUpDialogProps {
  isOpen: boolean
  quiz: Quiz
  responses: Record<string, QuizResponse>
  onConfirm: () => void
}

export function TimeUpDialog({ isOpen, quiz, responses, onConfirm }: TimeUpDialogProps) {
  const [countdown, setCountdown] = useState(5)

  // Auto-submit countdown when dialog opens
  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onConfirm()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, onConfirm])

  const getAnsweredCount = () => {
    return Object.keys(responses).length
  }

  const getUnansweredCount = () => {
    return quiz.questions.length - getAnsweredCount()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400">Time's Up!</DialogTitle>
          <DialogDescription className="text-base mt-2">
            The quiz time has ended. Your current answers will be automatically submitted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quiz Summary */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Save className="w-4 h-4" />
              Auto-Save Summary
            </h4>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700/50">
                <div className="text-lg font-bold text-green-700 dark:text-green-300">{getAnsweredCount()}</div>
                <div className="text-green-600 dark:text-green-400">Answered</div>
              </div>

              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700/50">
                <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{getUnansweredCount()}</div>
                <div className="text-orange-600 dark:text-orange-400">Unanswered</div>
              </div>
            </div>
          </div>

          {/* Auto-submission notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Your answers have been automatically saved!</p>
                <p>
                  Even though time has ended, all your completed answers will be submitted as your final score. No
                  progress will be lost.
                </p>
              </div>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Auto-Saved
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              <Clock className="w-3 h-3 mr-1" />
              Time Ended
            </Badge>
          </div>
        </div>

        <DialogFooter className="flex-col space-y-3">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Auto-submitting in <span className="font-bold text-red-600 dark:text-red-400">{countdown}</span> seconds
            </p>
            <Button
              onClick={onConfirm}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
            >
              Submit Quiz Now
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
