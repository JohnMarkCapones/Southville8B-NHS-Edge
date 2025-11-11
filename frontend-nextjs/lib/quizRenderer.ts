import type { Question, QuizType } from "@/types/quiz"
import { lazy } from "react"

// Lazy load quiz components for better performance
const ShortAnswerQuiz = lazy(() => import("@/components/quiz/short-answer-quiz"))
const ParagraphQuiz = lazy(() => import("@/components/quiz/paragraph-quiz"))
const MultipleChoiceQuiz = lazy(() => import("@/components/quiz/multiple-choice-quiz"))
const CheckboxQuiz = lazy(() => import("@/components/quiz/checkbox-quiz"))
const DropdownQuiz = lazy(() => import("@/components/quiz/dropdown-quiz"))
const LinearScaleQuiz = lazy(() => import("@/components/quiz/linear-scale-quiz"))
const MultipleChoiceGridQuiz = lazy(() => import("@/components/quiz/multiple-choice-grid-quiz"))
const CheckboxGridQuiz = lazy(() => import("@/components/quiz/checkbox-grid-quiz"))
const DragAndDropQuiz = lazy(() => import("@/components/quiz/drag-and-drop-quiz"))
const TrueFalseQuiz = lazy(() => import("@/components/quiz/true-false-quiz"))
const MatchingPairQuiz = lazy(() => import("@/components/quiz/matching-pair-quiz"))
const FillInBlankQuiz = lazy(() => import("@/components/quiz/fill-in-blank-quiz"))
const OrderingQuiz = lazy(() => import("@/components/quiz/ordering-quiz"))

// Component mapping for quiz types
const QUIZ_COMPONENTS = {
  "short-answer": ShortAnswerQuiz,
  paragraph: ParagraphQuiz,
  "multiple-choice": MultipleChoiceQuiz,
  checkbox: CheckboxQuiz,
  dropdown: DropdownQuiz,
  "linear-scale": LinearScaleQuiz,
  "multiple-choice-grid": MultipleChoiceGridQuiz,
  "checkbox-grid": CheckboxGridQuiz,
  "drag-and-drop": DragAndDropQuiz,
  "true-false": TrueFalseQuiz,
  "matching-pair": MatchingPairQuiz,
  matching: MatchingPairQuiz, // ✅ Alias for backend compatibility
  "fill-in-blank": FillInBlankQuiz,
  ordering: OrderingQuiz,
} as const

export interface QuizComponentProps {
  question: Question
  value?: any
  onChange: (value: any) => void
  disabled?: boolean
  showCorrectAnswer?: boolean
}

/**
 * Get the appropriate quiz component for a given question type
 * @param type - The quiz question type
 * @returns The corresponding React component
 */
export function getQuizComponent(type: QuizType) {
  const Component = QUIZ_COMPONENTS[type]
  if (!Component) {
    throw new Error(`No component found for quiz type: ${type}`)
  }
  return Component
}

/**
 * Render a quiz question with the appropriate component
 * @param question - The question to render
 * @param props - Additional props to pass to the component
 * @returns The rendered quiz component
 */
export function renderQuizQuestion(question: Question, props: Omit<QuizComponentProps, "question">) {
  const Component = getQuizComponent(question.type)
  return Component({ question, ...props })
}

/**
 * Validate if a quiz response is complete based on question requirements
 * @param question - The question to validate
 * @param response - The user's response
 * @returns Whether the response is valid
 */
export function validateQuizResponse(question: Question, response: any): boolean {
  // If question is not required and response is empty, it's valid
  if (!question.required && (response === undefined || response === null || response === "")) {
    return true
  }

  // If question is required, response must exist
  if (question.required && (response === undefined || response === null || response === "")) {
    return false
  }

  // Type-specific validation
  switch (question.type) {
    case "short-answer":
    case "paragraph":
      return typeof response === "string" && response.trim().length > 0

    case "multiple-choice":
    case "dropdown":
    case "true-false":
      return typeof response === "number" || typeof response === "boolean"

    case "checkbox":
      return Array.isArray(response) && response.length > 0

    case "linear-scale":
      return typeof response === "number" && response >= question.minValue && response <= question.maxValue

    case "multiple-choice-grid":
      return typeof response === "object" && Object.keys(response).length > 0

    case "checkbox-grid":
      return (
        typeof response === "object" && Object.values(response).some((arr: any) => Array.isArray(arr) && arr.length > 0)
      )

    case "drag-and-drop":
    case "ordering":
      return Array.isArray(response) && response.length > 0

    case "matching-pair":
    case "matching": // ✅ Alias for backend compatibility
      return typeof response === "object" && Object.keys(response).length > 0

    case "fill-in-blank":
      return (
        Array.isArray(response) && response.every((answer) => typeof answer === "string" && answer.trim().length > 0)
      )

    default:
      return true
  }
}

/**
 * Calculate score for a quiz question if correct answer is provided
 * @param question - The question with correct answer
 * @param response - The user's response
 * @returns Score (0-1) or null if no correct answer defined
 */
export function calculateQuestionScore(question: Question, response: any): number | null {
  switch (question.type) {
    case "multiple-choice":
    case "dropdown":
      return question.correctAnswer !== undefined && response === question.correctAnswer ? 1 : 0

    case "true-false":
      return question.correctAnswer !== undefined && response === question.correctAnswer ? 1 : 0

    case "checkbox":
      if (!question.correctAnswers) return null
      const correctSet = new Set(question.correctAnswers)
      const responseSet = new Set(response || [])
      const intersection = new Set([...correctSet].filter((x) => responseSet.has(x)))
      const union = new Set([...correctSet, ...responseSet])
      return union.size === 0 ? 1 : intersection.size / union.size

    case "drag-and-drop":
    case "ordering":
      if (!question.correctOrder) return null
      if (!Array.isArray(response)) return 0
      let correct = 0
      for (let i = 0; i < Math.min(response.length, question.correctOrder.length); i++) {
        if (response[i] === question.correctOrder[i]) correct++
      }
      return correct / question.correctOrder.length

    default:
      return null // No automatic scoring for text-based questions
  }
}
