"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, ArrowRight, AlertCircle, BookOpen } from "lucide-react"
import { QuizRenderer } from "./quiz-renderer"
import { SequentialModeRenderer } from "./sequential-mode-renderer"
import { QuizSubmissionDialog } from "./quiz-submission-dialog"
import type { Quiz, QuizResponse, QuizSection } from "@/types/quiz"

interface HybridModeRendererProps {
  quiz: Quiz
  responses: Record<string, QuizResponse>
  onResponseChange: (questionId: string, response: QuizResponse) => void
  onSubmit: () => void
  timeRemaining: number
  markQuestionViewed?: (questionId: string) => void
}

export function HybridModeRenderer({
  quiz,
  responses,
  onResponseChange,
  onSubmit,
  timeRemaining,
  markQuestionViewed,
}: HybridModeRendererProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showValidation, setShowValidation] = useState(false)
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false)

  const sections: QuizSection[] = quiz.sections || [
    {
      id: "form-section",
      title: "Initial Questions",
      mode: "form",
      questionIds: quiz.questions.slice(0, 3).map((q) => q.id),
    },
    {
      id: "sequential-section",
      title: "Individual Questions",
      mode: "sequential",
      questionIds: quiz.questions.slice(3).map((q) => q.id),
    },
  ]

  const currentSection = sections[currentSectionIndex]
  const currentSectionQuestions = quiz.questions.filter((q) => currentSection.questionIds.includes(q.id))

  // ✅ TIME TRACKING: Mark questions as viewed based on current section mode
  useEffect(() => {
    if (markQuestionViewed && currentSection.mode === "form") {
      // Form mode: all questions in section are visible, mark all as viewed
      currentSectionQuestions.forEach((question) => {
        markQuestionViewed(question.id)
      })
    }
    // Sequential mode time tracking is handled by SequentialModeRenderer
  }, [currentSectionIndex, currentSection.mode, currentSectionQuestions, markQuestionViewed])

  const getAnsweredCount = (questions: typeof quiz.questions) => {
    return questions.filter((q) => responses[q.id]).length
  }

  const getTotalAnsweredCount = () => {
    return quiz.questions.filter((q) => responses[q.id]).length
  }

  const handleSectionComplete = () => {
    const unansweredRequired = currentSectionQuestions.filter((q) => q.required && !responses[q.id])

    if (unansweredRequired.length > 0 && currentSection.mode === "form") {
      setShowValidation(true)
      const firstUnanswered = unansweredRequired[0]
      const element = document.getElementById(`question-${firstUnanswered.id}`)
      element?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    // Move to next section or submit
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
      setCurrentQuestionIndex(0)
      setShowValidation(false)
    } else {
      setShowSubmissionDialog(true)
    }
  }

  const handleSequentialNext = () => {
    if (currentQuestionIndex < currentSectionQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleSectionComplete()
    }
  }

  const handleSequentialPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentSectionIndex > 0) {
      // Go back to previous section
      setCurrentSectionIndex(currentSectionIndex - 1)
      const prevSection = sections[currentSectionIndex - 1]
      const prevSectionQuestions = quiz.questions.filter((q) => prevSection.questionIds.includes(q.id))
      if (prevSection.mode === "sequential") {
        setCurrentQuestionIndex(prevSectionQuestions.length - 1)
      }
    }
  }

  const handleConfirmedSubmit = () => {
    onSubmit()
  }

  if (currentSection.mode === "sequential") {
    const sequentialQuiz = {
      ...quiz,
      questions: currentSectionQuestions,
    }

    return (
      <>
        <div className="mb-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Section {currentSectionIndex + 1} of {sections.length}: {currentSection.title}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Total Progress: {getTotalAnsweredCount()}/{quiz.questions.length}
                </span>
              </div>
              <Progress value={(getTotalAnsweredCount() / quiz.questions.length) * 100} className="h-2" />
            </CardContent>
          </Card>
        </div>

        <SequentialModeRenderer
          quiz={sequentialQuiz}
          currentQuestionIndex={currentQuestionIndex}
          responses={responses}
          onResponseChange={onResponseChange}
          onNext={handleSequentialNext}
          onPrevious={handleSequentialPrevious}
          onSubmit={handleSectionComplete}
          timeRemaining={timeRemaining}
          markQuestionViewed={markQuestionViewed}
        />
        <QuizSubmissionDialog
          open={showSubmissionDialog}
          onOpenChange={setShowSubmissionDialog}
          quiz={quiz}
          responses={responses}
          timeRemaining={timeRemaining}
          onConfirmSubmit={handleConfirmedSubmit}
        />
      </>
    )
  }

  const sectionAnsweredCount = getAnsweredCount(currentSectionQuestions)
  const sectionProgress =
    currentSectionQuestions.length > 0 ? (sectionAnsweredCount / currentSectionQuestions.length) * 100 : 0

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-4 z-10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">
                Section {currentSectionIndex + 1} of {sections.length}: {currentSection.title}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              Total Progress: {getTotalAnsweredCount()}/{quiz.questions.length}
            </span>
          </div>
          <Progress value={(getTotalAnsweredCount() / quiz.questions.length) * 100} className="h-2 mb-2" />

          <div className="text-xs text-muted-foreground">
            Section Progress: {sectionAnsweredCount} of {currentSectionQuestions.length} questions answered
          </div>

          {showValidation && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Please answer all required questions in this section before continuing
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {currentSectionQuestions.map((question, index) => (
          <Card
            key={question.id}
            id={`question-${question.id}`}
            className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm transition-all duration-200 ${
              showValidation && question.required && !responses[question.id]
                ? "ring-2 ring-red-500 ring-opacity-50"
                : ""
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Question {index + 1}</span>
                    {question.required && <span className="text-red-500 text-sm">*</span>}
                    {responses[question.id] && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>
                  <CardTitle className="text-lg">{question.title}</CardTitle>
                  {question.description && <p className="text-sm text-muted-foreground mt-1">{question.description}</p>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <QuizRenderer
                question={question}
                response={responses[question.id]}
                onResponseChange={(response) => onResponseChange(question.id, response)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky bottom-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {sectionAnsweredCount} of {currentSectionQuestions.length} questions answered in this section
              {currentSectionIndex < sections.length - 1 && (
                <div className="text-xs mt-1">
                  {sections.length - currentSectionIndex - 1} more section(s) to complete
                </div>
              )}
            </div>
            <Button
              onClick={handleSectionComplete}
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-8"
            >
              {currentSectionIndex < sections.length - 1 ? (
                <>
                  Continue to Next Section
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Quiz
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <QuizSubmissionDialog
        open={showSubmissionDialog}
        onOpenChange={setShowSubmissionDialog}
        quiz={quiz}
        responses={responses}
        timeRemaining={timeRemaining}
        onConfirmSubmit={handleConfirmedSubmit}
      />
    </div>
  )
}
