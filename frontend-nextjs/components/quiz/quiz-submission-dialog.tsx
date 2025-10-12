"use client"

import { useState } from "react"
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
import { CheckCircle2, AlertTriangle, Clock, FileText } from "lucide-react"
import type { Quiz, QuizResponse } from "@/types/quiz"

interface QuizSubmissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quiz: Quiz
  responses: Record<string, QuizResponse>
  timeRemaining: number
  onConfirmSubmit: () => void
}

export function QuizSubmissionDialog({
  open,
  onOpenChange,
  quiz,
  responses,
  timeRemaining,
  onConfirmSubmit,
}: QuizSubmissionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getAnsweredCount = () => {
    return quiz.questions.filter((q) => responses[q.id]).length
  }

  const getUnansweredQuestions = () => {
    return quiz.questions.filter((q) => !responses[q.id])
  }

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true)
    // Add a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onConfirmSubmit()
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const answeredCount = getAnsweredCount()
  const unansweredQuestions = getUnansweredQuestions()
  const completionPercentage = quiz.questions.length > 0 ? Math.round((answeredCount / quiz.questions.length) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-blue-600" />
            Ready to Submit Quiz?
          </DialogTitle>
          <DialogDescription className="text-base">
            Please review your quiz completion before final submission. Once submitted, you cannot make changes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quiz Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">Questions Answered</span>
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {answeredCount} / {quiz.questions.length}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">{completionPercentage}% Complete</div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-800 dark:text-orange-200">Time Remaining</span>
              </div>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{formatTime(timeRemaining)}</div>
              <div className="text-sm text-orange-600 dark:text-orange-400">
                {timeRemaining < 300 ? "Running low!" : "Good time left"}
              </div>
            </div>
          </div>

          {/* Completion Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Completion Status</span>
              <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                {completionPercentage === 100 ? "All Complete" : `${unansweredQuestions.length} Remaining`}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Unanswered Questions Warning */}
          {unansweredQuestions.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    {unansweredQuestions.length} Question{unansweredQuestions.length > 1 ? "s" : ""} Not Answered
                  </h4>
                  <div className="space-y-1">
                    {unansweredQuestions.slice(0, 3).map((question, index) => (
                      <div key={question.id} className="text-sm text-yellow-700 dark:text-yellow-300">
                        • Question {quiz.questions.findIndex((q) => q.id === question.id) + 1}:{" "}
                        {question.title.substring(0, 50)}...
                      </div>
                    ))}
                    {unansweredQuestions.length > 3 && (
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">
                        ... and {unansweredQuestions.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Final Confirmation */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h4 className="font-medium mb-2">Before you submit:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Double-check your answers are complete and accurate</li>
              <li>• Make sure you've answered all required questions</li>
              <li>• Remember, you cannot change answers after submission</li>
              {quiz.allowRetakes && <li>• You can retake this quiz if needed</li>}
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Review Answers
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Quiz
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
