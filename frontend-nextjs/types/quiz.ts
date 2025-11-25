export type QuizType =
  | "short-answer"
  | "paragraph"
  | "multiple-choice"
  | "checkbox"
  | "dropdown"
  | "linear-scale"
  | "multiple-choice-grid"
  | "checkbox-grid"
  | "drag-and-drop"
  | "true-false"
  | "matching-pair"
  | "fill-in-blank"
  | "ordering"

export interface BaseQuestion {
  id: string
  type: QuizType
  title: string
  description?: string
  required?: boolean
  // Image support (Cloudflare Images)
  question_image_url?: string // Snake case from backend
  question_image_id?: string
  question_image_file_size?: number
  question_image_mime_type?: string
  questionImageUrl?: string // Camel case alias
  questionImageId?: string
  questionImageFileSize?: number
  questionImageMimeType?: string
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: "short-answer"
  placeholder?: string
  maxLength?: number
}

export interface ParagraphQuestion extends BaseQuestion {
  type: "paragraph"
  placeholder?: string
  maxLength?: number
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple-choice"
  options: string[]
  correctAnswer?: number
}

export interface CheckboxQuestion extends BaseQuestion {
  type: "checkbox"
  options: string[]
  correctAnswers?: number[]
}

export interface DropdownQuestion extends BaseQuestion {
  type: "dropdown"
  options: string[]
  correctAnswer?: number
}

export interface LinearScaleQuestion extends BaseQuestion {
  type: "linear-scale"
  minValue: number
  maxValue: number
  minLabel?: string
  maxLabel?: string
}

export interface GridOption {
  id: string
  label: string
}

export interface MultipleChoiceGridQuestion extends BaseQuestion {
  type: "multiple-choice-grid"
  rows: GridOption[]
  columns: GridOption[]
  correctAnswers?: Record<string, string>
}

export interface CheckboxGridQuestion extends BaseQuestion {
  type: "checkbox-grid"
  rows: GridOption[]
  columns: GridOption[]
  correctAnswers?: Record<string, string[]>
}

export interface DragAndDropQuestion extends BaseQuestion {
  type: "drag-and-drop"
  items: string[]
  correctOrder?: number[]
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "true-false"
  correctAnswer?: boolean
}

export interface MatchingPair {
  id: string
  left: string
  right: string
}

export interface MatchingPairQuestion extends BaseQuestion {
  type: "matching-pair"
  pairs: MatchingPair[]
}

export interface FillInBlankQuestion extends BaseQuestion {
  type: "fill-in-blank"
  text: string // Text with blanks marked as {{blank}}
  answers: string[]
}

export interface OrderingQuestion extends BaseQuestion {
  type: "ordering"
  items: string[]
  correctOrder?: number[]
}

export type Question =
  | ShortAnswerQuestion
  | ParagraphQuestion
  | MultipleChoiceQuestion
  | CheckboxQuestion
  | DropdownQuestion
  | LinearScaleQuestion
  | MultipleChoiceGridQuestion
  | CheckboxGridQuestion
  | DragAndDropQuestion
  | TrueFalseQuestion
  | MatchingPairQuestion
  | FillInBlankQuestion
  | OrderingQuestion

export type DeliveryMode = "sequential" | "form" | "hybrid"

export interface ValidationSettings {
  requireAnswerToProgress: boolean // Can't go to next question until current is answered
  requireAllAnswersToSubmit: boolean // Must answer all questions before submitting
  allowQuestionSkipping: boolean // Can skip questions and return later
}

export interface QuizSection {
  id: string
  title: string
  mode: "sequential" | "form"
  questionIds: string[]
}

export interface Quiz {
  id: string
  title: string
  description?: string
  questions: Question[]
  timeLimit?: number // in minutes
  allowRetake?: boolean
  showResults?: boolean
  deliveryMode: DeliveryMode
  validationSettings: ValidationSettings
  sections?: QuizSection[]
  createdAt: Date
  updatedAt: Date
}

export interface QuizResponse {
  questionId: string
  answer: any
}

export interface QuizSubmission {
  id: string
  quizId: string
  userId?: string
  responses: QuizResponse[]
  score?: number
  completedAt: Date
}
