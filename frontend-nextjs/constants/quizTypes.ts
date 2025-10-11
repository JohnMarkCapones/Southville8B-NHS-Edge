import type { QuizType } from "@/types/quiz"

export interface QuizTypeMetadata {
  label: string
  description: string
  icon: string
  category: "text" | "choice" | "scale" | "grid" | "interactive"
}

export const QUIZ_TYPE_METADATA: Record<QuizType, QuizTypeMetadata> = {
  "short-answer": {
    label: "Short Answer",
    description: "Single line text response",
    icon: "📝",
    category: "text",
  },
  paragraph: {
    label: "Paragraph",
    description: "Multi-line text response",
    icon: "📄",
    category: "text",
  },
  "multiple-choice": {
    label: "Multiple Choice",
    description: "Select one option from multiple choices",
    icon: "🔘",
    category: "choice",
  },
  checkbox: {
    label: "Checkbox",
    description: "Select multiple options",
    icon: "☑️",
    category: "choice",
  },
  dropdown: {
    label: "Dropdown",
    description: "Select from dropdown menu",
    icon: "📋",
    category: "choice",
  },
  "linear-scale": {
    label: "Linear Scale",
    description: "Rate on a numerical scale",
    icon: "📊",
    category: "scale",
  },
  "multiple-choice-grid": {
    label: "Multiple Choice Grid",
    description: "Grid of multiple choice questions",
    icon: "🔲",
    category: "grid",
  },
  "checkbox-grid": {
    label: "Checkbox Grid",
    description: "Grid of checkbox questions",
    icon: "☑️",
    category: "grid",
  },
  "drag-and-drop": {
    label: "Drag & Drop",
    description: "Drag items to reorder",
    icon: "🔄",
    category: "interactive",
  },
  "true-false": {
    label: "True or False",
    description: "Binary choice question",
    icon: "✅",
    category: "choice",
  },
  "matching-pair": {
    label: "Matching Pairs",
    description: "Match items from two columns",
    icon: "🔗",
    category: "interactive",
  },
  "fill-in-blank": {
    label: "Fill in the Blank",
    description: "Complete sentences with missing words",
    icon: "📝",
    category: "text",
  },
  ordering: {
    label: "Ordering/Sequencing",
    description: "Arrange items in correct order",
    icon: "🔢",
    category: "interactive",
  },
}

export const QUIZ_CATEGORIES = {
  text: "Text Response",
  choice: "Multiple Choice",
  scale: "Rating Scale",
  grid: "Grid Questions",
  interactive: "Interactive",
} as const
