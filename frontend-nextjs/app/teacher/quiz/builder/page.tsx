"use client";

import type React from "react";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Save,
  Eye,
  GripVertical,
  Trash2,
  Copy,
  CheckCircle,
  Type,
  AlignLeft,
  List,
  ToggleLeft,
  FileText,
  Menu,
  Clock,
  Check,
  ChevronDown,
  Square,
  Move,
  ArrowUpDown,
  BarChart3,
  X,
  Share,
  CheckCircleIcon,
  Settings,
} from "lucide-react";
import { Database, Search, BookOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useToast } from "@/hooks/use-toast";
import { useQuiz } from "@/hooks/useQuiz";
import { questionBankApi } from "@/lib/api/endpoints/question-bank";
import { quizApi } from "@/lib/api/endpoints/quiz";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  QuizImageUploader,
  type QuizImageData,
} from "@/components/quiz/QuizImageUploader";

interface Question {
  id: string;
  type:
    | "multiple-choice"
    | "checkbox"
    | "true-false"
    | "short-answer"
    | "long-answer"
    | "fill-blank"
    | "matching"
    | "drag-drop"
    | "ordering"
    | "dropdown"
    | "linear-scale"
    | "essay"; // Added essay type
  title: string;
  description?: string;
  options?: string[];
  correctAnswer?: string | string[] | number | boolean;
  correctAnswers?: string[]; // For multiple correct answers in checkbox and fill-blank
  sampleAnswers?: string[]; // For short/long answer grading guidance
  maxPoints?: number; // For essay questions (short-answer, long-answer)
  gradingRubric?: string; // Grading criteria for essay questions
  // </CHANGE>
  matchingPairs?: { [key: string]: string }; // For matching questions
  dragDropAnswers?: string[]; // Shared answer bank for drag-drop
  dragDropZones?: string[]; // Drop zones (targets)
  dragDropMappings?: { [zone: string]: string[] }; // Correct mappings: { "Zone 1": ["Item A", "Item B"] }
  orderingItems?: string[]; // Items to be ordered
  dropdownOptions?: string[]; // Options for dropdown
  scaleMin?: number; // Linear scale minimum
  scaleMax?: number; // Linear scale maximum
  scaleLabels?: { min: string; max: string }; // Labels for scale endpoints
  scaleStartLabel?: string; // Linear scale start label
  scaleEndLabel?: string; // Linear scale end label
  scaleMiddleLabel?: string; // Linear scale middle label (optional)
  points: number;
  required: boolean;
  timeLimit?: number;
  randomizeOptions?: boolean;
  estimatedTime?: number; // Added estimated time
  // ✅ NEW: Fill-in-blank sensitivity settings
  caseSensitive?: boolean; // For fill-blank: whether answers must match exact capitalization
  whitespaceSensitive?: boolean; // For fill-blank: whether spacing must match exactly
  // ✅ NEW: Image support (Cloudflare Images)
  questionImageId?: string; // Cloudflare Images ID for question image
  questionImageUrl?: string; // Full Cloudflare Images delivery URL for question image
  questionImageFileSize?: number; // File size in bytes of question image
  questionImageMimeType?: string; // MIME type of question image
  choiceImages?: Array<{
    // Image data for each choice (for multiple-choice, checkbox)
    imageId?: string;
    imageUrl?: string;
    fileSize?: number;
    mimeType?: string;
  }>;
}

interface QuizDetails {
  title: string;
  subject: string;
  grade: string;
  duration: number;
  description: string;
  dueDate: string;
  allowRetakes: boolean;
  shuffleQuestions: boolean;
  showResults: boolean;

  // ✅ Quiz Settings - Security
  securedQuiz?: boolean;
  quizLockdown?: boolean;
  antiScreenshot?: boolean;
  disableCopyPaste?: boolean;
  disableRightClick?: boolean;
  lockdownUI?: boolean;

  // ✅ Quiz Settings - Question Pool
  questionPool?: boolean;
  stratifiedSampling?: boolean;
  totalQuestions?: number;
  poolSize?: number;

  // ✅ Quiz Settings - Behavior
  strictTimeLimit?: boolean;
  autoSave?: boolean;
  backtrackingControl?: boolean;

  // ✅ Quiz Settings - Other
  accessCode?: string;
  publishMode?: string;
}

// Question Bank Item interface (matches backend response)
interface QuestionBankItem {
  id: string;
  type: string;
  question: string;
  subject: string;
  difficulty: string;
  points: number;
  tags: string[];
  usedIn: number;
  createdAt: string;
  options?: string[];
  correctAnswer?: string | string[] | boolean;
  explanation?: string;
}

// Helper function to map backend question types to UI types
const mapBackendQuestionTypeToUI = (backendType: string): Question["type"] => {
  const typeMap: Record<string, Question["type"]> = {
    multiple_choice: "multiple-choice",
    checkbox: "checkbox", // ✅ ADDED: Checkbox type
    true_false: "true-false",
    short_answer: "short-answer",
    long_answer: "long-answer",
    essay: "essay",
    fill_in_blank: "fill-blank",
    matching: "matching",
    ordering: "ordering",
    dropdown: "dropdown", // ✅ ADDED: Dropdown type
    drag_drop: "drag-drop", // ✅ ADDED: Drag & drop type
    linear_scale: "linear-scale", // ✅ ADDED: Linear scale type
  };
  return typeMap[backendType] || "multiple-choice";
};

// Helper function to determine correct answer from choices
// Returns the appropriate format based on question type:
// - Multiple-choice: single index (number)
// - Checkbox: array of indices (number[])
// - True/False: boolean
// - Other types: undefined
const determineCorrectAnswer = (question: any, choices: any[]): any => {
  if (!choices || choices.length === 0) {
    return undefined;
  }

  const questionType = question.question_type;

  if (questionType === "multiple_choice") {
    // Find all correct answer indices
    const correctIndices = choices
      .map((c: any, idx: number) => (c.is_correct ? idx : -1))
      .filter((idx: number) => idx >= 0);

    if (correctIndices.length > 1) {
      // Multiple correct answers = checkbox question (return array)
      return correctIndices;
    } else if (correctIndices.length === 1) {
      // Single correct answer = multiple-choice (return single index)
      return correctIndices[0];
    } else {
      // No correct answer set
      return undefined;
    }
  } else if (questionType === "true_false") {
    // For true/false, correctAnswer is boolean
    const correctChoice = choices.find((c: any) => c.is_correct);
    if (correctChoice) {
      return correctChoice.choice_text.toLowerCase() === "true";
    }
    return undefined;
  }

  // For other question types (essay, short-answer, etc.)
  return undefined;
};

// Helper function to map UI question types to backend types
const mapUIQuestionTypeToBackend = (uiType: Question["type"]): string => {
  const typeMap: Record<Question["type"], string> = {
    "multiple-choice": "multiple_choice",
    checkbox: "checkbox", // ✅ FIXED: Checkbox is now a distinct type
    "true-false": "true_false",
    "short-answer": "short_answer",
    "long-answer": "long_answer",
    essay: "essay",
    "fill-blank": "fill_in_blank",
    matching: "matching",
    "drag-drop": "drag_drop", // ✅ FIXED: Drag & drop uses its own type
    ordering: "ordering",
    dropdown: "dropdown", // ✅ FIXED: Dropdown is now a distinct type
    "linear-scale": "linear_scale", // ✅ FIXED: Linear scale uses its own type
  };
  return typeMap[uiType] || "multiple_choice";
};

export default function QuizBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Backend integration: useQuiz hook
  const {
    quiz: backendQuiz,
    getQuiz,
    updateQuiz,
    publishQuiz: publishQuizBackend,
    isLoading: loadingBackendQuiz,
    isSaving: savingToBackend,
    error: backendError,
  } = useQuiz();

  // Get quizId from URL params (from create page navigation)
  const quizId = searchParams.get("quizId");

  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    questionId: string;
    questionIndex: number;
  } | null>(null);

  const [blankContextMenu, setBlankContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    blankIndex: number;
    questionId: string;
  } | null>(null);

  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [publishSettings, setPublishSettings] = useState({
    makePublic: true,
    showResults: true,
    allowRetakes: false,
    notifyStudents: true,
  });
  const [quizLink, setQuizLink] = useState("");

  const [gradingType, setGradingType] = useState<
    "automatic" | "manual" | "mixed"
  >("automatic");

  const [showQuestionBankDialog, setShowQuestionBankDialog] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [previewQuestion, setPreviewQuestion] = useState<any>(null);

  // ✅ Real question bank state
  const [questionBankData, setQuestionBankData] = useState<QuestionBankItem[]>(
    []
  );
  const [isLoadingQuestionBank, setIsLoadingQuestionBank] = useState(false);
  const [questionBankError, setQuestionBankError] = useState<string | null>(
    null
  );

  // Derived state for question bank filtering
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set<string>();
    questionBankData.forEach((item) => subjects.add(item.subject));
    return Array.from(subjects);
  }, [questionBankData]);

  const filteredQuestions = useMemo(() => {
    return questionBankData.filter((q) => {
      const matchesSearch =
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === "all" || q.type === filterType;
      const matchesDifficulty =
        filterDifficulty === "all" || q.difficulty === filterDifficulty;
      const matchesSubject =
        filterSubject === "all" || q.subject === filterSubject;

      return (
        matchesSearch && matchesType && matchesDifficulty && matchesSubject
      );
    });
  }, [searchQuery, filterType, filterDifficulty, filterSubject]);

  const getDefaultEstimatedTime = (questionType: Question["type"]): number => {
    switch (questionType) {
      case "true-false":
        return 0.5;
      case "multiple-choice":
        return 1;
      case "checkbox":
        return 1.5;
      case "short-answer":
        return 2;
      case "fill-blank":
        return 1.5;
      case "dropdown":
        return 1;
      case "linear-scale":
        return 0.5;
      case "matching":
        return 3;
      case "drag-drop":
        return 3;
      case "ordering":
        return 2;
      case "long-answer":
        return 5;
      case "essay": // Added default time for essay
        return 5;
      default:
        return 2;
    }
  };

  const totalEstimatedTime = questions.reduce((total, question) => {
    return (
      total + (question.estimatedTime || getDefaultEstimatedTime(question.type))
    );
  }, 0);

  useEffect(() => {
    // Backend integration: Load quiz from backend if quizId exists
    if (quizId) {
      console.log("[Builder] Loading quiz from backend, quizId:", quizId);
      const loadQuizFromBackend = async () => {
        try {
          const quizData = await getQuiz(quizId);
          console.log("[Builder] Quiz data loaded:", quizData);

          if (quizData) {
            // ✅ Extract quiz settings if available
            const settings = quizData.settings || {};

            // Transform backend quiz data to UI format
            setQuizDetails({
              title: quizData.title,
              subject: quizData.subject_id || "",
              grade: "Grade 8", // TODO: Get from section assignment
              duration: quizData.time_limit || 30,
              description: quizData.description || "",
              dueDate: quizData.end_date || "",
              allowRetakes: quizData.allow_retakes || false,
              shuffleQuestions:
                settings.shuffle_questions ??
                quizData.shuffle_questions ??
                false,
              showResults: true, // TODO: Get from settings

              // ✅ Load quiz_settings fields
              securedQuiz: settings.secured_quiz ?? false,
              quizLockdown: settings.quiz_lockdown ?? false,
              antiScreenshot: settings.anti_screenshot ?? false,
              disableCopyPaste: settings.disable_copy_paste ?? false,
              disableRightClick: settings.disable_right_click ?? false,
              lockdownUI: settings.lockdown_ui ?? false,
              questionPool: settings.question_pool ?? false,
              stratifiedSampling: settings.stratified_sampling ?? false,
              totalQuestions: settings.total_questions,
              poolSize: settings.pool_size,
              strictTimeLimit: settings.strict_time_limit ?? false,
              autoSave: settings.auto_save ?? true,
              backtrackingControl: settings.backtracking_control ?? false,
              accessCode: settings.access_code || "",
              publishMode: settings.publish_mode || "immediate",
            });

            // Transform backend questions to UI format
            console.log(
              "[Builder] Processing questions, count:",
              quizData.questions?.length || 0
            );
            console.log(
              "[Builder] Full quiz data structure:",
              JSON.stringify(quizData, null, 2)
            );

            if (quizData.questions && quizData.questions.length > 0) {
              console.log(
                "[Builder] Raw questions from backend:",
                quizData.questions
              );

              const transformedQuestions = quizData.questions.map(
                (q: any, index: number) => {
                  console.log(`[Builder] Transforming question ${index + 1}:`, {
                    question_id: q.question_id,
                    question_type: q.question_type,
                    question_text: q.question_text,
                    quiz_choices: q.quiz_choices,
                    metadata: q.metadata,
                  });

                  // Backend returns quiz_choices, not choices
                  const choices = q.quiz_choices || [];

                  // Extract options (choice texts)
                  let options = choices.map((c: any) => c.choice_text);

                  // Find correct answer INDEX (not text)
                  // For multiple-choice: single index
                  // For checkbox: array of indices (multiple correct answers)
                  let correctAnswer: any = undefined;
                  let questionType = q.question_type;

                  // ✅ Load metadata for complex question types
                  const metadata = q.metadata || {};
                  let additionalFields: any = {};

                  if (q.question_type === "fill_in_blank") {
                    // ✅ Fill-in-blank: Load answers from metadata
                    if (metadata.blank_positions) {
                      options = metadata.blank_positions.map(
                        (bp: any) => bp.answer || ""
                      );
                    }
                    // ✅ NEW: Load sensitivity settings from quiz_questions table
                    additionalFields = {
                      caseSensitive: q.case_sensitive ?? false,
                      whitespaceSensitive: q.whitespace_sensitive ?? false,
                    };
                  } else if (
                    q.question_type === "short_answer" ||
                    q.question_type === "long_answer" ||
                    q.question_type === "essay"
                  ) {
                    // ✅ Text questions: Load rubric and sample answers
                    additionalFields = {
                      maxPoints: metadata.max_points,
                      gradingRubric: metadata.grading_rubric,
                      sampleAnswers: metadata.sample_answers,
                    };
                  } else if (q.question_type === "linear_scale") {
                    // ✅ Linear scale: Load scale configuration
                    additionalFields = {
                      scaleMin: metadata.scale_min || 1,
                      scaleMax: metadata.scale_max || 5,
                      scaleStartLabel: metadata.scale_start_label || "",
                      scaleEndLabel: metadata.scale_end_label || "",
                      scaleMiddleLabel: metadata.scale_middle_label || "",
                    };
                  } else if (q.question_type === "ordering") {
                    // ✅ Ordering: Load items
                    additionalFields = {
                      orderingItems: metadata.items || [],
                    };
                  } else if (q.question_type === "matching") {
                    // ✅ Matching: Load pairs
                    additionalFields = {
                      matchingPairs: metadata.matching_pairs || {},
                    };
                  } else if (q.question_type === "drag_drop") {
                    // ✅ Drag & Drop: Load answer bank, zones, and mappings
                    additionalFields = {
                      dragDropAnswers: metadata.answer_bank || [],
                      dragDropZones: metadata.drop_zones || [],
                      dragDropMappings: metadata.correct_mappings || {},
                    };
                  } else if (q.question_type === "multiple_choice") {
                    // Count how many correct answers there are
                    const correctIndices = choices
                      .map((c: any, idx: number) => (c.is_correct ? idx : -1))
                      .filter((idx: number) => idx >= 0);

                    if (correctIndices.length > 1) {
                      // Multiple correct answers = checkbox question
                      questionType = "checkbox";
                      correctAnswer = correctIndices;
                    } else if (correctIndices.length === 1) {
                      // Single correct answer = multiple-choice
                      correctAnswer = correctIndices[0];
                    } else {
                      // No correct answer set
                      correctAnswer = undefined;
                    }
                  } else if (q.question_type === "true_false") {
                    // For true/false, correctAnswer is boolean
                    const correctChoice = choices.find(
                      (c: any) => c.is_correct
                    );
                    if (correctChoice) {
                      correctAnswer =
                        correctChoice.choice_text.toLowerCase() === "true";
                    }
                  }

                  return {
                    id: q.question_id,
                    type: mapBackendQuestionTypeToUI(questionType),
                    title: q.question_text,
                    description: q.description || "",
                    options: options,
                    correctAnswer: correctAnswer,
                    points: q.points || 1,
                    required: q.is_required ?? true, // Load from backend, default true
                    randomizeOptions: q.is_randomize ?? false, // Load from backend, default false
                    timeLimit: q.time_limit_seconds
                      ? q.time_limit_seconds / 60
                      : undefined, // Convert seconds to minutes
                    ...additionalFields, // ✅ Spread additional fields from metadata
                  };
                }
              );

              console.log(
                "[Builder] Transformed questions:",
                transformedQuestions
              );
              setQuestions(transformedQuestions);
              console.log(
                "[Builder] Questions set in state, count:",
                transformedQuestions.length
              );
            } else {
              console.log("[Builder] No questions found in quiz data");
              console.log(
                "[Builder] quizData.questions value:",
                quizData.questions
              );
            }
          } else {
            console.log("[Builder] Quiz data is null or undefined");
          }
        } catch (error) {
          console.error("[Builder] Error loading quiz:", error);
        }
      };

      loadQuizFromBackend();
    } else {
      console.log("[Builder] No quizId, loading from localStorage");
      // Fallback: Load quiz details from localStorage (for new quizzes)
      const savedDetails = localStorage.getItem("quizDetails");
      if (savedDetails) {
        setQuizDetails(JSON.parse(savedDetails));
      } else {
        // Redirect back if no quiz details found
        router.push("/teacher/quiz/create");
      }

      // Load saved questions if any
      const savedQuestions = localStorage.getItem("quizQuestions");
      if (savedQuestions) {
        setQuestions(JSON.parse(savedQuestions));
      }
    }
  }, [router, quizId, getQuiz]);

  useEffect(() => {
    const hasAutoGraded = questions.some(
      (q) =>
        q.type === "multiple-choice" ||
        q.type === "true-false" ||
        q.type === "checkbox" ||
        q.type === "ordering" ||
        q.type === "dropdown" ||
        q.type === "linear-scale"
    );
    const hasManualGraded = questions.some(
      (q) =>
        q.type === "short-answer" ||
        q.type === "long-answer" ||
        q.type === "essay" ||
        q.type === "fill-blank"
    );

    if (hasAutoGraded && hasManualGraded) {
      setGradingType("mixed");
    } else if (hasManualGraded) {
      setGradingType("manual");
    } else {
      setGradingType("automatic");
    }
  }, [questions]);

  // Auto-save functionality - saves to localStorage every 3 seconds
  const autoSaveLocal = useCallback(async () => {
    if (quizDetails && questions.length > 0) {
      // Quick local save (no UI indicator)
      localStorage.setItem("quizQuestions", JSON.stringify(questions));
      localStorage.setItem("quizDetails", JSON.stringify(quizDetails));
    }
  }, [questions, quizDetails]);

  // Auto-save to database every 15 seconds
  const autoSaveDatabase = useCallback(async () => {
    // Only save to database if we have a quizId and questions
    if (!quizId || !quizDetails || questions.length === 0) {
      return;
    }

    console.log("[Builder] Auto-saving to database...");
    setIsSaving(true);

    try {
      const { quizApi } = await import("@/lib/api/endpoints");

      // Save all questions to backend (skip incomplete ones)
      let savedCount = 0;
      let skippedCount = 0;
      const updatedQuestions = [...questions];

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];

        // ✅ Validate question before saving
        // Skip if question text is too short (< 3 chars)
        if (!question.title || question.title.trim().length < 3) {
          console.log(
            `[Builder] Skipping incomplete question (title too short): "${question.title}"`
          );
          skippedCount++;
          continue;
        }

        // Skip if choices exist but are empty for multiple-choice/checkbox
        if (
          (question.type === "multiple-choice" ||
            question.type === "checkbox") &&
          question.options
        ) {
          const hasEmptyChoices = question.options.some(
            (opt) => !opt || opt.trim().length === 0
          );
          if (hasEmptyChoices) {
            console.log(
              `[Builder] Skipping question with empty choices: "${question.title}"`
            );
            skippedCount++;
            continue;
          }
        }

        const isBackendQuestion =
          !question.id.startsWith("question-") && question.id.length === 36;

        // ✅ Handle choices based on question type (same logic as manual save)
        let choices;
        if (question.type === "true-false") {
          // True/False questions: Create "True" and "False" choices
          choices = [
            {
              choiceText: "True",
              isCorrect: question.correctAnswer === true,
              orderIndex: 0,
            },
            {
              choiceText: "False",
              isCorrect: question.correctAnswer === false,
              orderIndex: 1,
            },
          ];
        } else if (question.options && question.options.length > 0) {
          // Multiple choice, checkbox, etc.
          // Filter out empty options first
          const nonEmptyOptions = question.options
            .map((opt, originalIdx) => ({ text: opt, originalIdx }))
            .filter((item) => item.text && item.text.trim().length > 0);

          choices = nonEmptyOptions.map((item, newIdx) => {
            let isCorrect = false;
            if (question.type === "multiple-choice") {
              isCorrect = question.correctAnswer === item.originalIdx;
            } else if (question.type === "checkbox") {
              isCorrect =
                Array.isArray(question.correctAnswer) &&
                question.correctAnswer.includes(item.originalIdx);
            }

            // Get choice image data for this option
            const choiceImage = question.choiceImages?.[item.originalIdx];

            return {
              choiceText: item.text.trim(),
              isCorrect: isCorrect,
              orderIndex: newIdx,
              // ✅ Add image fields for choices
              choiceImageId: choiceImage?.imageId || undefined,
              choiceImageUrl: choiceImage?.imageUrl || undefined,
              choiceImageFileSize: choiceImage?.fileSize || undefined,
              choiceImageMimeType: choiceImage?.mimeType || undefined,
            };
          });
        } else {
          // For other question types (essay, short-answer, etc.), no choices needed
          choices = undefined;
        }

        const questionData = {
          questionText: question.title,
          questionType: mapUIQuestionTypeToBackend(question.type) as any,
          description: question.description || undefined,
          orderIndex: i,
          points: question.points || 1,
          timeLimitSeconds: question.timeLimit
            ? question.timeLimit * 60
            : undefined,
          isRequired: question.required || false,
          isRandomize: question.randomizeOptions || false,
          choices: choices,
          // ✅ Add image fields for questions
          questionImageId: question.questionImageId || undefined,
          questionImageUrl: question.questionImageUrl || undefined,
          questionImageFileSize: question.questionImageFileSize || undefined,
          questionImageMimeType: question.questionImageMimeType || undefined,
        };

        if (isBackendQuestion) {
          await quizApi.teacher.updateQuestion(
            quizId,
            question.id,
            questionData
          );
        } else {
          // Add new question and get the backend UUID
          const createdQuestion = await quizApi.teacher.addQuestion(
            quizId,
            questionData
          );
          // Update local question ID with backend UUID to prevent duplicates
          if (createdQuestion && createdQuestion.question_id) {
            console.log(
              `[Builder] Question created with backend ID: ${createdQuestion.question_id}`
            );
            updatedQuestions[i] = {
              ...question,
              id: createdQuestion.question_id,
            };
          }
        }
        savedCount++;
      }

      // Update state with backend IDs
      if (savedCount > 0) {
        setQuestions(updatedQuestions);
        setLastSaved(new Date());
        console.log(
          `[Builder] Auto-save to database successful! (${savedCount} saved, ${skippedCount} skipped)`
        );
      } else {
        console.log(
          `[Builder] No complete questions to save (${skippedCount} incomplete)`
        );
      }
    } catch (error) {
      console.error("[Builder] Auto-save to database failed:", error);
      // Don't show error toast for auto-save failures (non-intrusive)
    } finally {
      setIsSaving(false);
    }
  }, [quizId, questions, quizDetails]);

  // Local auto-save every 3 seconds (fast, no DB hit)
  useEffect(() => {
    const autoSaveTimer = setTimeout(autoSaveLocal, 3000);
    return () => clearTimeout(autoSaveTimer);
  }, [questions, quizDetails, autoSaveLocal]);

  // Database auto-save every 15 seconds
  useEffect(() => {
    if (!quizId || questions.length === 0) return;

    const databaseSaveTimer = setInterval(autoSaveDatabase, 15000);
    return () => clearInterval(databaseSaveTimer);
  }, [quizId, questions, quizDetails, autoSaveDatabase]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const question of questions) {
        const element = questionRefs.current[question.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveQuestionId(question.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [questions]);

  useEffect(() => {
    // Hide any footer elements on this page
    document.body.style.overflow = "hidden";
    const footer = document.querySelector("footer");
    if (footer) {
      footer.style.display = "none";
    }

    return () => {
      // Restore on cleanup
      document.body.style.overflow = "auto";
      const footer = document.querySelector("footer");
      if (footer) {
        footer.style.display = "block";
      }
    };
  }, []);

  // ✅ Fetch question bank data when dialog opens
  useEffect(() => {
    if (showQuestionBankDialog) {
      loadQuestionBankData();
    }
  }, [showQuestionBankDialog, searchQuery, filterType, filterDifficulty]);

  const loadQuestionBankData = async () => {
    setIsLoadingQuestionBank(true);
    setQuestionBankError(null);

    try {
      const response = await questionBankApi.getQuestions({
        page: 1,
        limit: 100, // Load up to 100 questions
        search: searchQuery || undefined,
        difficulty:
          filterDifficulty !== "all"
            ? filterDifficulty.toLowerCase()
            : undefined,
        questionType:
          filterType !== "all"
            ? mapUIQuestionTypeToBackend(filterType as Question["type"])
            : undefined,
      });

      // Transform backend data to UI format
      const transformedData: QuestionBankItem[] = response.data.map(
        (q: any) => ({
          id: q.id,
          type: capitalizeType(q.question_type),
          question: q.question_text,
          subject: q.subject_id || "General",
          difficulty: capitalizeFirst(q.difficulty || "medium"),
          points: q.default_points || 1,
          tags: q.tags || [],
          usedIn: 0, // Will be populated from usage stats if needed
          createdAt: q.created_at,
          options: Array.isArray(q.choices)
            ? q.choices.map((c: any) => c.text || c.choice_text)
            : undefined,
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
        })
      );

      setQuestionBankData(transformedData);
    } catch (error: any) {
      console.error("[QuizBuilder] Error loading question bank:", error);
      setQuestionBankError(error.message || "Failed to load question bank");
      toast({
        title: "Error",
        description: "Failed to load question bank. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingQuestionBank(false);
    }
  };

  const capitalizeType = (type: string): string => {
    const typeMap: Record<string, string> = {
      multiple_choice: "Multiple Choice",
      true_false: "True/False",
      short_answer: "Short Answer",
      long_answer: "Long Answer",
      essay: "Essay",
      fill_in_blank: "Fill in the Blank",
      matching: "Matching",
      ordering: "Ordering",
      checkbox: "Checkbox",
    };
    return typeMap[type] || type;
  };

  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    questionId: string,
    questionIndex: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      questionId,
      questionIndex,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const deleteBlank = (questionId: string, blankIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const parts = q.title.split(/({{blank_\d+}})/);
          let currentBlankIndex = 0;
          const newParts = parts.filter((part) => {
            if (part.match(/({{blank_\d+}})/)) {
              if (currentBlankIndex === blankIndex) {
                currentBlankIndex++;
                return false; // Remove this blank
              }
              currentBlankIndex++;
            }
            return true;
          });

          // Update blank indices in remaining parts
          let newBlankIndex = 0;
          const updatedParts = newParts.map((part) => {
            if (part.match(/({{blank_\d+}})/)) {
              return `{{blank_${newBlankIndex++}}}`;
            }
            return part;
          });

          const newOptions = [...(q.options || [])];
          newOptions.splice(blankIndex, 1);

          return {
            ...q,
            title: updatedParts.join(""),
            options: newOptions,
          };
        }
        return q;
      })
    );
    setBlankContextMenu(null);
  };

  const duplicateQuestion = (questionId: string) => {
    const questionToDuplicate = questions.find((q) => q.id === questionId);
    if (questionToDuplicate) {
      const newQuestion = {
        ...questionToDuplicate,
        id: `question-${Date.now()}`, // Use a more robust ID generation if needed
        title: `${questionToDuplicate.title} (Copy)`,
      };
      const questionIndex = questions.findIndex((q) => q.id === questionId);
      const newQuestions = [...questions];
      newQuestions.splice(questionIndex + 1, 0, newQuestion);
      setQuestions(newQuestions);
      toast({
        title: "Question Duplicated",
        description: "Question has been successfully duplicated.",
        variant: "default",
        className:
          "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg",
        duration: 3000,
      });
    }
    closeContextMenu();
  };

  const deleteQuestion = async (questionId: string) => {
    if (questions.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one question in your quiz.",
        variant: "destructive",
        duration: 3000,
      });
      closeContextMenu();
      return;
    }

    // ✅ Check if this is a backend question (has UUID)
    const isBackendQuestion =
      !questionId.startsWith("question-") && questionId.length === 36;

    if (isBackendQuestion && quizId) {
      // ✅ Immediately delete from backend
      try {
        console.log(
          `[Builder] 🗑️ Deleting question from backend: ${questionId}`
        );
        const { quizApi } = await import("@/lib/api/endpoints");
        await quizApi.teacher.deleteQuestion(quizId, questionId);
        console.log(`[Builder] ✅ Question deleted from backend successfully`);

        // Remove from local state
        setQuestions(questions.filter((q) => q.id !== questionId));

        toast({
          title: "Question Deleted",
          description: "Question has been successfully deleted from the quiz.",
          variant: "default",
          className:
            "bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-lg",
          duration: 3000,
        });
      } catch (error: any) {
        console.error(`[Builder] ❌ Error deleting question:`, error);
        toast({
          title: "Delete Failed",
          description:
            error.message || "Failed to delete question. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } else {
      // Local question (not yet saved to backend), just remove from state
      setQuestions(questions.filter((q) => q.id !== questionId));
      toast({
        title: "Question Deleted",
        description: "Question has been successfully deleted.",
        variant: "default",
        className:
          "bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-lg",
        duration: 3000,
      });
    }

    closeContextMenu();
  };

  const moveQuestionUp = (questionIndex: number) => {
    if (questionIndex === 0) return;
    const newQuestions = [...questions];
    const temp = newQuestions[questionIndex];
    newQuestions[questionIndex] = newQuestions[questionIndex - 1];
    newQuestions[questionIndex - 1] = temp;
    setQuestions(newQuestions);
    closeContextMenu();
  };

  const moveQuestionDown = (questionIndex: number) => {
    if (questionIndex === questions.length - 1) return;
    const newQuestions = [...questions];
    const temp = newQuestions[questionIndex];
    newQuestions[questionIndex] = newQuestions[questionIndex + 1];
    newQuestions[questionIndex + 1] = temp;
    setQuestions(newQuestions);
    closeContextMenu();
  };

  const changeQuestionType = (
    questionId: string,
    newType: Question["type"]
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              type: newType,
              options:
                newType === "multiple-choice"
                  ? ["", "", "", ""]
                  : newType === "checkbox"
                  ? ["", ""]
                  : newType === "matching"
                  ? ["", "", "", ""]
                  : newType === "fill-blank"
                  ? []
                  : undefined,
              correctAnswer: undefined,
              correctAnswers: undefined,
              matchingPairs: undefined,
              estimatedTime: getDefaultEstimatedTime(newType),
            }
          : q
      )
    );
    toast({
      title: "Question Type Changed",
      description: `Question type changed to ${
        questionTypes.find((t) => t.value === newType)?.label
      }.`,
      variant: "default",
      className:
        "bg-gradient-to-r from-blue-50 to-indigo-600 text-white border-0 shadow-lg",
      duration: 3000,
    });
    closeContextMenu();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu && !event.target?.closest(".fixed")) {
        // Check if click is outside the context menu
        closeContextMenu();
      }
    };

    if (contextMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [contextMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (blankContextMenu && !event.target?.closest(".fixed")) {
        // Check if click is outside the blank context menu
        setBlankContextMenu(null);
      }
    };

    if (blankContextMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [blankContextMenu]);

  const questionTypes = useMemo(
    () => [
      { value: "multiple-choice", label: "Multiple Choice", icon: CheckCircle },
      { value: "checkbox", label: "Checkbox", icon: Square },
      { value: "true-false", label: "True/False", icon: ToggleLeft },
      { value: "short-answer", label: "Short Answer", icon: Type },
      { value: "long-answer", label: "Long Answer", icon: AlignLeft },
      { value: "fill-blank", label: "Fill in the Blank", icon: FileText },
      { value: "matching", label: "Matching", icon: List },
      { value: "drag-drop", label: "Drag & Drop", icon: Move },
      { value: "ordering", label: "Ordering", icon: ArrowUpDown },
      { value: "dropdown", label: "Dropdown", icon: ChevronDown },
      { value: "linear-scale", label: "Linear Scale", icon: BarChart3 },
      { value: "essay", label: "Essay", icon: FileText }, // Added essay type
    ],
    []
  );

  const addNewQuestion = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type: "multiple-choice",
      title: "",
      description: "",
      options: ["", "", "", ""],
      points: 1,
      estimatedTime: getDefaultEstimatedTime("multiple-choice"), // Add default estimated time
    };
    setQuestions([...questions, newQuestion]);
    setTimeout(() => {
      setActiveQuestionId(newQuestion.id);
      scrollToQuestion(newQuestion.id);
    }, 100);
  };

  const handleTextSelection = (questionId: string) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const questionElement = document.getElementById(
        `question-title-${questionId}`
      );

      if (
        questionElement &&
        questionElement.contains(range.commonAncestorContainer)
      ) {
        setSelectedText(selectedText);
        setSelectionRange({
          start: range.startOffset,
          end: range.endOffset,
        });
      } else {
        setSelectedText("");
        setSelectionRange(null);
      }
    } else {
      setSelectedText("");
      setSelectionRange(null);
    }
  };

  const convertToBlank = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.title.trim()) return;

    const title = question.title.trim();
    const words = title.split(" ");
    if (words.length === 0) return;

    const lastWord = words[words.length - 1];
    const questionWithoutLastWord = words.slice(0, -1).join(" ");
    const newTitle = `${questionWithoutLastWord} {{blank_${Date.now()}}}`; // Use unique ID for blank

    // Add the last word as a correct answer for the new blank
    const newOptions = question.options
      ? [...question.options, lastWord]
      : [lastWord];

    updateQuestion(questionId, {
      title: newTitle,
      options: newOptions,
      type: "fill-blank", // Ensure type is fill-blank
    });

    toast({
      title: "Blank Created",
      description: `"${lastWord}" has been converted to a blank and added as the correct answer.`,
      variant: "success",
      duration: 3000,
    });
  };

  const addBlankAtCursor = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const titleElement = document.getElementById(
      `question-title-${questionId}`
    );
    const selection = window.getSelection();

    if (titleElement && selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const isSelectionInsideQuestion = titleElement.contains(
        range.commonAncestorContainer
      );

      if (isSelectionInsideQuestion && selectionRange) {
        const newBlankId = `blank_${Date.now()}`;
        const blankPlaceholder = `{{${newBlankId}}}`;

        const currentTitle = question.title;
        const newTitle =
          currentTitle.substring(0, selectionRange.start) +
          blankPlaceholder +
          currentTitle.substring(selectionRange.end);

        const newOptions = question.options ? [...question.options, ""] : [""]; // Add an empty option for the new blank

        updateQuestion(questionId, {
          title: newTitle,
          options: newOptions,
          type: "fill-blank", // Ensure type is fill-blank
        });

        toast({
          title: "Blank Added",
          description: `A new blank has been inserted at the selected position.`,
          variant: "success",
          duration: 3000,
        });
        setSelectedText(""); // Clear selection after adding blank
        setSelectionRange(null);
        window.getSelection()?.removeAllRanges();
      } else {
        toast({
          title: "Selection Error",
          description:
            "Please select text within the question title to add a blank.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Could not find the question title element.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const scrollToQuestion = (questionId: string) => {
    const element = questionRefs.current[questionId];
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
      setActiveQuestionId(questionId);
      setIsMobileMenuOpen(false);
    }
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const updatedQuestion = { ...q, ...updates };
          // Ensure options are initialized for relevant types if not present
          if (
            (updates.type === "multiple-choice" ||
              updates.type === "checkbox" ||
              updates.type === "matching") &&
            !updatedQuestion.options
          ) {
            updatedQuestion.options = [];
          }
          // If type changes, reset correct answers if they become incompatible
          if (updates.type && updates.type !== q.type) {
            updatedQuestion.estimatedTime = getDefaultEstimatedTime(
              updates.type
            );
            if (
              (q.type === "multiple-choice" &&
                updates.type !== "multiple-choice") ||
              (q.type === "checkbox" && updates.type !== "checkbox") ||
              (q.type === "true-false" && updates.type !== "true-false")
            ) {
              updatedQuestion.correctAnswer = undefined;
            }
            if (q.type === "fill-blank" && updates.type !== "fill-blank") {
              updatedQuestion.options = undefined;
            }
          }
          return updatedQuestion;
        }
        return q;
      })
    );
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setQuestions(items);

    toast({
      title: "Question Reordered",
      description: `Question moved from position ${
        result.source.index + 1
      } to position ${result.destination.index + 1}.`,
      variant: "info",
      duration: 3000,
    });
  };

  const saveQuiz = async () => {
    console.log("[Builder] saveQuiz called");
    console.log("[Builder] quizId:", quizId);
    console.log("[Builder] questions.length:", questions.length);
    console.log("[Builder] quizDetails:", quizDetails);

    setIsSaving(true);

    // Backend integration: Save quiz with questions to backend
    if (quizId && quizDetails && questions.length > 0) {
      console.log("[Builder] Starting to save questions to backend...");
      try {
        // Import the API directly since we need addQuestion
        const { quizApi } = await import("@/lib/api/endpoints");
        const { QuestionType } = await import("@/lib/api/types");

        console.log("[Builder] Processing", questions.length, "questions");

        // STEP 1: Get all existing questions from backend to check for deletions
        const existingQuiz = await quizApi.teacher.getQuizById(quizId);
        const existingQuestionIds =
          existingQuiz.questions?.map((q: any) => q.question_id) || [];
        const currentQuestionIds = questions
          .filter((q) => !q.id.startsWith("question-") && q.id.length === 36) // Only backend UUIDs
          .map((q) => q.id);

        // Find questions that were deleted (exist in backend but not in current state)
        const deletedQuestionIds = existingQuestionIds.filter(
          (id: string) => !currentQuestionIds.includes(id)
        );

        // STEP 2: Delete removed questions
        if (deletedQuestionIds.length > 0) {
          console.log(
            `[Builder] Deleting ${deletedQuestionIds.length} removed questions`
          );
          for (const questionId of deletedQuestionIds) {
            try {
              await quizApi.teacher.deleteQuestion(quizId, questionId);
              console.log(`[Builder] ❌ DELETED question: ${questionId}`);
            } catch (deleteError) {
              console.error(
                `[Builder] Error deleting question ${questionId}:`,
                deleteError
              );
            }
          }
        }

        // STEP 3: Add/Update all questions to the quiz via backend
        const updatedQuestions = [...questions];

        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          console.log("[Builder] Checking question:", question.id);
          console.log(
            "[Builder] - Starts with 'question-'?",
            question.id.startsWith("question-")
          );
          console.log("[Builder] - Length:", question.id.length);

          // Check if question already exists in backend (has UUID from backend)
          // Backend UUIDs: "550e8400-e29b-41d4-a716-446655440000" (36 chars, 5 segments)
          // New questions: "question-1762333212762" (starts with "question-")
          const isBackendQuestion =
            !question.id.startsWith("question-") && question.id.length === 36;
          console.log("[Builder] - Is backend question?", isBackendQuestion);

          // Transform UI question to backend format
          // Backend expects camelCase field names

          // Handle choices based on question type
          let choices;
          if (question.type === "true-false") {
            // True/False questions: Create "True" and "False" choices
            choices = [
              {
                choiceText: "True",
                isCorrect: question.correctAnswer === true,
                orderIndex: 0,
              },
              {
                choiceText: "False",
                isCorrect: question.correctAnswer === false,
                orderIndex: 1,
              },
            ];
          } else if (
            question.options &&
            question.options.length > 0 &&
            question.type !== "fill-blank"
          ) {
            // Multiple choice, checkbox, etc. (but NOT fill-blank!)
            // ✅ FILTER OUT EMPTY OPTIONS FIRST
            const nonEmptyOptions = question.options
              .map((opt, originalIdx) => ({ text: opt, originalIdx }))
              .filter((item) => item.text && item.text.trim().length > 0);

            // Map filtered options to choices
            choices = nonEmptyOptions.map((item, newIdx) => {
              // For multiple-choice, correctAnswer is an index (number) - need to map from original to new index
              // For checkbox, correctAnswer is an array of indices
              let isCorrect = false;
              if (question.type === "multiple-choice") {
                isCorrect = question.correctAnswer === item.originalIdx;
              } else if (question.type === "checkbox") {
                isCorrect =
                  Array.isArray(question.correctAnswer) &&
                  question.correctAnswer.includes(item.originalIdx);
              }

              // Get choice image data for this option
              const choiceImage = question.choiceImages?.[item.originalIdx];

              return {
                choiceText: item.text.trim(), // ✅ Trimmed text
                isCorrect: isCorrect, // ✅ camelCase (not is_correct)
                orderIndex: newIdx, // ✅ New sequential index
                // ✅ Add image fields for choices
                choiceImageId: choiceImage?.imageId || undefined,
                choiceImageUrl: choiceImage?.imageUrl || undefined,
                choiceImageFileSize: choiceImage?.fileSize || undefined,
                choiceImageMimeType: choiceImage?.mimeType || undefined,
              };
            });
          } else {
            // For other question types (essay, short-answer, fill-blank, etc.), no choices needed
            choices = undefined;
          }

          // Prepare metadata based on question type
          let metadata: any = undefined;

          if (question.type === "fill-blank") {
            // ✅ Fill-in-blank: Save blank positions and answers
            const blanks = question.title.match(/{{blank_\d+}}/g) || [];
            metadata = {
              blank_count: blanks.length,
              blank_positions: blanks.map((blank, idx) => ({
                blank_id: idx,
                placeholder: blank,
                answer: question.options?.[idx] || "",
              })),
            };
          } else if (
            question.type === "short-answer" ||
            question.type === "long-answer" ||
            question.type === "essay"
          ) {
            // ✅ Text questions: Save rubric, sample answers, and max points
            metadata = {
              max_points: question.maxPoints,
              grading_rubric: question.gradingRubric,
              sample_answers: question.sampleAnswers,
            };
          } else if (question.type === "linear-scale") {
            // ✅ Linear scale: Save scale configuration
            metadata = {
              scale_min: question.scaleMin || 1,
              scale_max: question.scaleMax || 5,
              scale_start_label: question.scaleStartLabel || "",
              scale_end_label: question.scaleEndLabel || "",
              scale_middle_label: question.scaleMiddleLabel || "",
            };
          } else if (question.type === "ordering") {
            // ✅ Ordering: Save items and correct order
            metadata = {
              items: question.orderingItems || [],
              correct_order: (question.orderingItems || []).map(
                (_, idx) => idx
              ), // Indices in correct order [0, 1, 2, ...]
            };
          } else if (question.type === "matching") {
            // ✅ Matching: Save matching pairs
            console.log(
              "[Builder] 🔍 MATCHING DEBUG - question.matchingPairs:",
              question.matchingPairs
            );
            console.log(
              "[Builder] 🔍 MATCHING DEBUG - matchingPairs type:",
              typeof question.matchingPairs
            );
            console.log(
              "[Builder] 🔍 MATCHING DEBUG - matchingPairs keys:",
              Object.keys(question.matchingPairs || {})
            );
            metadata = {
              matching_pairs: question.matchingPairs || {},
            };
            console.log(
              "[Builder] 🔍 MATCHING DEBUG - metadata being set:",
              metadata
            );
          } else if (question.type === "drag-drop") {
            // ✅ Drag & Drop: Save answer bank, drop zones, and correct mappings
            metadata = {
              answer_bank: question.dragDropAnswers || [],
              drop_zones: question.dragDropZones || [],
              correct_mappings: question.dragDropMappings || {},
            };
          }

          const questionData = {
            questionText: question.title, // ✅ camelCase (not question_text)
            questionType: mapUIQuestionTypeToBackend(question.type) as any, // ✅ camelCase (not question_type)
            description: question.description || undefined, // ✅ Add description
            orderIndex: i, // ✅ camelCase (required!)
            points: question.points || 1, // ✅ camelCase (already correct)
            timeLimitSeconds: question.timeLimit
              ? question.timeLimit * 60
              : undefined, // ✅ camelCase, in SECONDS
            isRequired: question.required || false, // ✅ Add isRequired
            isRandomize: question.randomizeOptions || false, // ✅ Add isRandomize
            choices: choices,
            metadata: metadata, // ✅ Add metadata for complex types
            // ✅ NEW: Fill-in-blank sensitivity settings
            caseSensitive:
              question.type === "fill-blank"
                ? question.caseSensitive ?? false
                : undefined,
            whitespaceSensitive:
              question.type === "fill-blank"
                ? question.whitespaceSensitive ?? false
                : undefined,
            // ✅ NEW: Image support fields
            questionImageId: question.questionImageId || undefined,
            questionImageUrl: question.questionImageUrl || undefined,
            questionImageFileSize: question.questionImageFileSize || undefined,
            questionImageMimeType: question.questionImageMimeType || undefined,
          };

          console.log("[Builder] Question data to send:", questionData);
          console.log(
            "[Builder] 🔍 MATCHING DEBUG - questionData.metadata:",
            questionData.metadata
          );
          console.log(
            "[Builder] 🔍 MATCHING DEBUG - Full questionData:",
            JSON.stringify(questionData, null, 2)
          );

          if (isBackendQuestion) {
            // Update existing question
            console.log(
              "[Builder] 🔄 UPDATING existing question:",
              question.id
            );
            const result = await quizApi.teacher.updateQuestion(
              quizId,
              question.id,
              questionData
            );
            console.log(
              "[Builder] Question updated successfully, result:",
              result
            );
          } else {
            // Create new question
            console.log("[Builder] ✅ CREATING new question:", question.id);
            const result = await quizApi.teacher.addQuestion(
              quizId,
              questionData
            );
            console.log(
              "[Builder] Question created successfully, result:",
              result
            );
            // Update local question ID with backend UUID to prevent duplicates
            if (result && result.question_id) {
              console.log(
                `[Builder] Question created with backend ID: ${result.question_id}`
              );
              updatedQuestions[i] = { ...question, id: result.question_id };
            }
          }
        }

        // Update state with backend IDs
        setQuestions(updatedQuestions);

        console.log("[Builder] All questions saved successfully!");

        toast({
          title: "Quiz Saved Successfully!",
          description: `"${quizDetails?.title}" has been saved with ${
            questions.length
          } question${questions.length !== 1 ? "s" : ""}.`,
          variant: "success",
          duration: 5000,
        });

        // Don't clear localStorage or redirect - stay on builder page
        // User can continue editing
        setIsSaving(false);
      } catch (error) {
        console.error("Error saving quiz:", error);
        toast({
          title: "Error Saving Quiz",
          description: "Failed to save quiz to backend. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
        setIsSaving(false);
      }
    } else {
      // Fallback: Save to localStorage only (for offline work)
      console.log("[Builder] Condition not met for backend save:");
      console.log("[Builder] - quizId:", quizId, "exists?", !!quizId);
      console.log(
        "[Builder] - quizDetails:",
        quizDetails,
        "exists?",
        !!quizDetails
      );
      console.log(
        "[Builder] - questions.length:",
        questions.length,
        "> 0?",
        questions.length > 0
      );

      const completeQuiz = {
        ...quizDetails,
        questions,
        createdAt: new Date().toISOString(),
        id: `quiz-${Date.now()}`,
      };

      console.log("[Builder] Saving quiz locally:", completeQuiz);

      toast({
        title: "Quiz Saved Locally",
        description: `"${quizDetails?.title}" has been saved locally with ${
          questions.length
        } question${questions.length !== 1 ? "s" : ""}.`,
        variant: "info",
        duration: 5000,
      });

      localStorage.setItem("quizQuestions", JSON.stringify(questions));
      localStorage.setItem("quizDetails", JSON.stringify(quizDetails));
      setIsSaving(false);
    }
  };

  const publishQuiz = async () => {
    setIsSaving(true);

    // Backend integration: Publish quiz to backend
    if (quizId && quizDetails) {
      try {
        // ✅ VALIDATION: Check for invalid question text before publishing
        const invalidQuestions = questions.filter(
          (q) => !q.title || q.title.trim().length < 3
        );
        if (invalidQuestions.length > 0) {
          toast({
            title: "Invalid Questions",
            description: `${invalidQuestions.length} question(s) have missing or too short text (minimum 3 characters). Please fix them before publishing.`,
            variant: "destructive",
          });
          return;
        }

        // First, save all questions (same as saveQuiz)
        const { quizApi } = await import("@/lib/api/endpoints");

        // STEP 1: Get all existing questions from backend to check for deletions
        const existingQuiz = await quizApi.teacher.getQuizById(quizId);
        const existingQuestionIds =
          existingQuiz.questions?.map((q: any) => q.question_id) || [];
        const currentQuestionIds = questions
          .filter((q) => !q.id.startsWith("question-") && q.id.length === 36) // Only backend UUIDs
          .map((q) => q.id);

        // Find questions that were deleted (exist in backend but not in current state)
        const deletedQuestionIds = existingQuestionIds.filter(
          (id: string) => !currentQuestionIds.includes(id)
        );

        // STEP 2: Delete removed questions
        if (deletedQuestionIds.length > 0) {
          console.log(
            `[Builder] Deleting ${deletedQuestionIds.length} removed questions before publish`
          );
          for (const questionId of deletedQuestionIds) {
            try {
              await quizApi.teacher.deleteQuestion(quizId, questionId);
              console.log(`[Builder] ❌ DELETED question: ${questionId}`);
            } catch (deleteError) {
              console.error(
                `[Builder] Error deleting question ${questionId}:`,
                deleteError
              );
            }
          }
        }

        // STEP 3: Add/Update all questions to the quiz via backend before publishing
        const updatedQuestions = [...questions];

        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          // Check if question already exists in backend (has UUID from backend)
          // Backend UUIDs: "550e8400-e29b-41d4-a716-446655440000" (36 chars, 5 segments)
          // New questions: "question-1762333212762" (starts with "question-")
          const isBackendQuestion =
            !question.id.startsWith("question-") && question.id.length === 36;
          // Transform UI question to backend format
          // Backend expects camelCase field names

          // Handle choices based on question type
          let choices;
          if (question.type === "true-false") {
            // True/False questions: Create "True" and "False" choices
            choices = [
              {
                choiceText: "True",
                isCorrect: question.correctAnswer === true,
                orderIndex: 0,
              },
              {
                choiceText: "False",
                isCorrect: question.correctAnswer === false,
                orderIndex: 1,
              },
            ];
          } else if (question.options && question.options.length > 0) {
            // Multiple choice, checkbox, etc.
            // ✅ FILTER OUT EMPTY OPTIONS FIRST
            const nonEmptyOptions = question.options
              .map((opt, originalIdx) => ({ text: opt, originalIdx }))
              .filter((item) => item.text && item.text.trim().length > 0);

            // Map filtered options to choices
            choices = nonEmptyOptions.map((item, newIdx) => {
              // For multiple-choice, correctAnswer is an index (number) - need to map from original to new index
              // For checkbox, correctAnswer is an array of indices
              let isCorrect = false;
              if (question.type === "multiple-choice") {
                isCorrect = question.correctAnswer === item.originalIdx;
              } else if (question.type === "checkbox") {
                isCorrect =
                  Array.isArray(question.correctAnswer) &&
                  question.correctAnswer.includes(item.originalIdx);
              }

              // Get choice image data for this option
              const choiceImage = question.choiceImages?.[item.originalIdx];

              return {
                choiceText: item.text.trim(), // ✅ Trimmed text
                isCorrect: isCorrect, // ✅ camelCase (not is_correct)
                orderIndex: newIdx, // ✅ New sequential index
                // ✅ Add image fields for choices
                choiceImageId: choiceImage?.imageId || undefined,
                choiceImageUrl: choiceImage?.imageUrl || undefined,
                choiceImageFileSize: choiceImage?.fileSize || undefined,
                choiceImageMimeType: choiceImage?.mimeType || undefined,
              };
            });
          } else {
            // For other question types (essay, short-answer, etc.), no choices needed
            choices = undefined;
          }

          const questionData = {
            questionText: question.title, // ✅ camelCase (not question_text)
            questionType: mapUIQuestionTypeToBackend(question.type) as any, // ✅ camelCase (not question_type)
            description: question.description || undefined, // ✅ Add description
            orderIndex: i, // ✅ camelCase (required!)
            points: question.points || 1, // ✅ camelCase (already correct)
            timeLimitSeconds: question.timeLimit
              ? question.timeLimit * 60
              : undefined, // ✅ camelCase, in SECONDS
            isRequired: question.required || false, // ✅ Add isRequired
            isRandomize: question.randomizeOptions || false, // ✅ Add isRandomize
            choices: choices,
            // ✅ NEW: Image support fields
            questionImageId: question.questionImageId || undefined,
            questionImageUrl: question.questionImageUrl || undefined,
            questionImageFileSize: question.questionImageFileSize || undefined,
            questionImageMimeType: question.questionImageMimeType || undefined,
          };

          if (isBackendQuestion) {
            // Update existing question
            console.log(
              "[Builder] 🔄 UPDATING existing question before publish:",
              question.id
            );
            await quizApi.teacher.updateQuestion(
              quizId,
              question.id,
              questionData
            );
          } else {
            // Create new question
            console.log(
              "[Builder] ✅ CREATING new question before publish:",
              question.id
            );
            const result = await quizApi.teacher.addQuestion(
              quizId,
              questionData
            );
            // Update local question ID with backend UUID to prevent duplicates
            if (result && result.question_id) {
              console.log(
                `[Builder] Question created with backend ID: ${result.question_id}`
              );
              updatedQuestions[i] = { ...question, id: result.question_id };
            }
          }
        }

        // Update state with backend IDs
        setQuestions(updatedQuestions);

        // Publish the quiz via backend
        const success = await publishQuizBackend(quizId);

        if (success) {
          // Backend integration: Assign quiz to sections AFTER publishing
          // (Backend requires quiz to be published before section assignment)
          const storedQuizDetails = localStorage.getItem("quizDetails");
          if (storedQuizDetails) {
            try {
              const quizDetailsData = JSON.parse(storedQuizDetails);
              const pendingAssignment =
                quizDetailsData.pendingSectionAssignment;

              if (
                pendingAssignment &&
                pendingAssignment.sectionIds &&
                pendingAssignment.sectionIds.length > 0
              ) {
                await quizApi.teacher.assignToSections(quizId, {
                  sectionIds: pendingAssignment.sectionIds,
                  startDate: pendingAssignment.startDate,
                  endDate: pendingAssignment.endDate,
                  timeLimit: pendingAssignment.timeLimit,
                });

                toast({
                  title: "Sections Assigned",
                  description: `Quiz assigned to ${pendingAssignment.sectionNames.join(
                    ", "
                  )}`,
                  duration: 3000,
                });
              }
            } catch (assignError) {
              console.error(
                "Error assigning sections after publish:",
                assignError
              );
              // Non-critical - quiz is already published
              toast({
                title: "Warning",
                description:
                  "Quiz published but section assignment failed. You can assign sections manually.",
                variant: "destructive",
                duration: 5000,
              });
            }
          }

          // Generate quiz link
          const generatedLink = `${window.location.origin}/student/quiz/${quizId}`;
          setQuizLink(generatedLink);

          toast({
            title: "Quiz Published Successfully!",
            description: `"${quizDetails?.title}" is now live and ready for students.`,
            variant: "success",
            duration: 5000,
          });

          // Clear localStorage
          localStorage.removeItem("quizDetails");
          localStorage.removeItem("quizQuestions");

          setIsSaving(false);
          setShowPublishModal(false);
          setShowLinkModal(true);
        } else {
          throw new Error("Failed to publish quiz");
        }
      } catch (error) {
        console.error("Error publishing quiz:", error);
        toast({
          title: "Error Publishing Quiz",
          description: "Failed to publish quiz to backend. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
        setIsSaving(false);
      }
    } else {
      // Fallback: Simulate publishing locally
      const completeQuiz = {
        ...quizDetails,
        questions,
        publishSettings,
        gradingType,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        id: `quiz-${Date.now()}`,
        status: "published",
      };

      const generatedLink = `${window.location.origin}/quiz/take/${completeQuiz.id}`;
      setQuizLink(generatedLink);

      console.log("Publishing quiz locally:", completeQuiz);

      toast({
        title: "Quiz Published Locally",
        description: `"${quizDetails?.title}" has been saved locally.`,
        variant: "info",
        duration: 5000,
      });

      setIsSaving(false);
      setShowPublishModal(false);
      setShowLinkModal(true);
    }
  };

  const copyQuizLink = async () => {
    try {
      await navigator.clipboard.writeText(quizLink);
      toast({
        title: "Link Copied!",
        description: "Quiz link has been copied to clipboard.",
        variant: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (!quizDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading quiz builder...
          </p>
        </div>
      </div>
    );
  }

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden bg-transparent hover:scale-105 transition-all duration-200"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <QuestionsSidebar />
      </SheetContent>
    </Sheet>
  );

  const QuestionsSidebar = () => (
    <div className="h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-xl relative z-30">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-slate-900 dark:text-white text-lg truncate">
              {quizDetails.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {quizDetails.subject} • {quizDetails.grade}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {questions.length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Questions
            </div>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(totalEstimatedTime)}m
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Est. Time
            </div>
          </div>
        </div>

        {/* Auto-save status */}
        <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
          {isSaving ? (
            <>
              <Clock className="w-3 h-3 animate-spin text-blue-500" />
              <span>Saving to database...</span>
            </>
          ) : lastSaved ? (
            <>
              <Check className="w-3 h-3 text-green-500" />
              <span>
                Auto-saved to database at {lastSaved.toLocaleTimeString()}
              </span>
            </>
          ) : (
            <span>No changes yet</span>
          )}
        </div>

        {/* Publish Button - Top Priority Action */}
        <div className="mb-4">
          <Button
            onClick={() => setShowPublishModal(true)}
            size="sm"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:scale-105 transition-all duration-200 text-white"
            disabled={questions.length === 0 || isSaving}
          >
            <Share className="w-4 h-4 mr-2" />
            Publish Quiz
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex-1 bg-white/80 dark:bg-slate-800/80 hover:scale-105 transition-all duration-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>

          <Button
            onClick={saveQuiz}
            size="sm"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:scale-105 transition-all duration-200"
            disabled={questions.length === 0 || isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Questions Navigation List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 px-2">
            Questions ({questions.length})
          </h3>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sidebar-questions">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {questions.map((question, index) => (
                    <Draggable
                      key={question.id}
                      draggableId={`sidebar-${question.id}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`group p-3 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
                            snapshot.isDragging
                              ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-800/50 border-blue-300 dark:border-blue-600 shadow-2xl opacity-90"
                              : activeQuestionId === question.id
                              ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700 shadow-lg"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 dark:hover:from-slate-700 dark:hover:to-slate-600"
                          }`}
                          onClick={() =>
                            !snapshot.isDragging &&
                            scrollToQuestion(question.id)
                          }
                          onContextMenu={(e) =>
                            handleContextMenu(e, question.id, index)
                          }
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200 ${
                                activeQuestionId === question.id ||
                                snapshot.isDragging
                                  ? "bg-blue-600 text-white shadow-lg"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {question.title || `Question ${index + 1}`}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                  {question.type.replace("-", " ")}
                                </span>
                                <span className="text-xs text-slate-400">
                                  •
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {question.points} pts
                                </span>
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                  {question.estimatedTime ||
                                    getDefaultEstimatedTime(question.type)}
                                  m
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <GripVertical className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              <ChevronDown
                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                  activeQuestionId === question.id
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Add Question Button */}
        <div className="mt-6 space-y-3">
          <Button
            onClick={() => addNewQuestion()}
            variant="outline"
            className="w-full justify-start bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Question
          </Button>

          <Button
            onClick={() => setShowQuestionBankDialog(true)}
            variant="outline"
            className="w-full justify-start bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 hover:scale-[1.02]"
          >
            <Database className="w-4 h-4 mr-2" />
            Import from Question Bank
          </Button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
        {/* Footer actions if needed */}
      </div>
    </div>
  );

  const isQuestionInQuiz = (questionId: string) => {
    return questions.some((q) => q.id === questionId);
  };

  const handleSelectAll = () => {
    if (selectedQuestionIds.size === filteredQuestions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(filteredQuestions.map((q) => q.id)));
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Hard":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const handleImportQuestions = async () => {
    if (!quizId) {
      toast({
        title: "Error",
        description: "Quiz ID is missing. Please save the quiz first.",
        variant: "destructive",
      });
      return;
    }

    const questionsToImport = questionBankData.filter((q) =>
      selectedQuestionIds.has(q.id)
    );

    if (questionsToImport.length === 0) {
      return;
    }

    try {
      // ✅ Call backend API to import each question
      const importPromises = questionsToImport.map((qbQuestion, index) =>
        quizApi.teacher.importQuestionFromBank(quizId, {
          questionBankId: qbQuestion.id,
          orderIndex: questions.length + index, // Add to end of existing questions
        })
      );

      await Promise.all(importPromises);

      // ✅ Reload quiz data from backend to get the newly imported questions
      const updatedQuizData = await getQuiz(quizId);

      // ✅ Update local state with newly imported questions
      if (updatedQuizData && updatedQuizData.questions) {
        const transformedQuestions = updatedQuizData.questions.map((q: any) => {
          const choices = q.quiz_choices || [];
          return {
            id: q.question_id,
            title: q.question_text,
            description: q.description || "",
            type: mapBackendQuestionTypeToUI(q.question_type),
            points: q.points || 1,
            timeLimit: q.time_limit_seconds
              ? q.time_limit_seconds / 60
              : undefined,
            required: q.is_required || false,
            randomizeOptions: q.is_randomize || false,
            options:
              choices.length > 0 ? choices.map((c: any) => c.choice_text) : [],
            correctAnswer: determineCorrectAnswer(q, choices),
          };
        });
        setQuestions(transformedQuestions);
        console.log(
          `[Builder] Updated questions state with ${transformedQuestions.length} questions after import`
        );
      }

      setSelectedQuestionIds(new Set()); // Clear selection
      setShowQuestionBankDialog(false);
      toast({
        title: "Questions Imported",
        description: `${questionsToImport.length} question(s) added to your quiz.`,
        variant: "success",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("[QuizBuilder] Error importing questions:", error);
      toast({
        title: "Import Failed",
        description:
          error.message || "Failed to import questions. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="flex h-full relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 fixed h-full z-30">
          <QuestionsSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-80 relative z-10 overflow-y-auto">
          {/* Mobile Header */}
          <div className="md:hidden sticky top-0 z-40 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MobileSidebar />
                <div>
                  <h1 className="font-bold text-slate-900 dark:text-white">
                    {quizDetails.title}
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {questions.length} question
                    {questions.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setShowPublishModal(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={questions.length === 0 || isSaving}
                >
                  <Share className="w-4 h-4 mr-2" />
                  Publish
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={saveQuiz}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={questions.length === 0 || isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    size="sm"
                    variant="outline"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {questions.length === 0 ? (
              <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-6">
                      <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                      No Questions Yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                      Start building your quiz by adding your first question.
                      Choose from multiple question types to create engaging
                      assessments.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => addNewQuestion()}
                        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg px-8 py-3 text-lg hover:scale-105 transition-all duration-200"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add First Question
                      </Button>
                      <Button
                        onClick={() => setShowQuestionBankDialog(true)}
                        variant="outline"
                        className="border-2 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-8 py-3 text-lg hover:scale-105 transition-all duration-200"
                      >
                        <Database className="w-5 h-5 mr-2" />
                        Import from Bank
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="questions">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-8"
                    >
                      {questions.map((question, index) => (
                        <Draggable
                          key={question.id}
                          draggableId={question.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={(el) => {
                                provided.innerRef(el);
                                questionRefs.current[question.id] = el;
                              }}
                              {...provided.draggableProps}
                              className={`transition-all duration-300 ${
                                snapshot.isDragging
                                  ? "opacity-80 shadow-2xl"
                                  : ""
                              }`}
                            >
                              <QuestionEditor
                                question={question}
                                onUpdate={(updates) =>
                                  updateQuestion(question.id, updates)
                                }
                                onConvertToBlank={convertToBlank}
                                onAddBlankAtCursor={addBlankAtCursor}
                                onDelete={() => deleteQuestion(question.id)}
                                onDuplicate={() =>
                                  duplicateQuestion(question.id)
                                }
                                questionNumber={index + 1}
                                dragHandleProps={provided.dragHandleProps}
                                isActive={activeQuestionId === question.id}
                                selectedText={selectedText}
                                selectionRange={selectionRange}
                                onTextSelection={handleTextSelection}
                                onClearSelection={() => {
                                  setSelectedText("");
                                  setSelectionRange(null);
                                  window.getSelection()?.removeAllRanges();
                                }}
                                setBlankContextMenu={setBlankContextMenu}
                                getDefaultEstimatedTime={
                                  getDefaultEstimatedTime
                                }
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {/* Add Question Button */}
            {questions.length > 0 && (
              <div className="flex justify-center pt-8 gap-3">
                <Button
                  onClick={() => addNewQuestion()}
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg px-8 py-3 text-lg hover:scale-105 transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Question
                </Button>
                <Button
                  onClick={() => setShowQuestionBankDialog(true)}
                  variant="outline"
                  className="border-2 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-8 py-3 text-lg hover:scale-105 transition-all duration-200"
                >
                  <Database className="w-5 h-5 mr-2" />
                  Import from Bank
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
        <DialogContent className="sm:max-w-[900px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <Share className="w-5 h-5 text-green-600" />
              Publish Quiz Settings
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Configure how students will access and take your quiz.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 py-4">
            {/* Left Column - Grading Type */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Grading Type
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select how this quiz will be graded based on question types.
              </p>

              <div className="space-y-3">
                {/* Automatic Grading */}
                <div
                  onClick={() => setGradingType("automatic")}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    gradingType === "automatic"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        gradingType === "automatic"
                          ? "border-green-500 bg-green-500"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {gradingType === "automatic" && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="font-semibold text-slate-900 dark:text-white cursor-pointer">
                          Automatic Grading
                        </Label>
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                          Recommended
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        All questions are auto-graded (Multiple Choice,
                        True/False). Results are instant.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Manual Grading */}
                <div
                  onClick={() => setGradingType("manual")}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    gradingType === "manual"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        gradingType === "manual"
                          ? "border-blue-500 bg-blue-500"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {gradingType === "manual" && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Label className="font-semibold text-slate-900 dark:text-white cursor-pointer">
                        Manual Grading
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Contains essay questions (Short Answer, Long Answer).
                        Requires teacher review and grading.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mixed Grading */}
                <div
                  onClick={() => setGradingType("mixed")}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    gradingType === "mixed"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        gradingType === "mixed"
                          ? "border-purple-500 bg-purple-500"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {gradingType === "mixed" && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Label className="font-semibold text-slate-900 dark:text-white cursor-pointer">
                        Mixed Grading
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Combination of auto-graded and essay questions. Partial
                        results shown immediately, full results after teacher
                        grading.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Access Settings & Quiz Behavior */}
            <div className="space-y-6">
              {/* Access Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Access Settings
                </h3>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Make Quiz Public</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Anyone with the link can access
                    </p>
                  </div>
                  <Switch
                    checked={publishSettings.makePublic}
                    onCheckedChange={(checked) =>
                      setPublishSettings({
                        ...publishSettings,
                        makePublic: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Notify Students</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Send notification when quiz is published
                    </p>
                  </div>
                  <Switch
                    checked={publishSettings.notifyStudents}
                    onCheckedChange={(checked) =>
                      setPublishSettings({
                        ...publishSettings,
                        notifyStudents: checked,
                      })
                    }
                  />
                </div>
              </div>

              {/* Quiz Behavior */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Quiz Behavior
                </h3>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Show Results</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Display score after completion
                    </p>
                  </div>
                  <Switch
                    checked={publishSettings.showResults}
                    onCheckedChange={(checked) =>
                      setPublishSettings({
                        ...publishSettings,
                        showResults: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Allow Retakes</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Students can retake the quiz
                    </p>
                  </div>
                  <Switch
                    checked={publishSettings.allowRetakes}
                    onCheckedChange={(checked) =>
                      setPublishSettings({
                        ...publishSettings,
                        allowRetakes: checked,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPublishModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={publishQuiz}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              disabled={isSaving}
            >
              <Share className="w-4 h-4 mr-2" />
              {isSaving ? "Publishing..." : "Publish Quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              Quiz Published Successfully!
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Your quiz is now live. Share this link with your students.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-medium">Quiz Link</Label>
              <div className="flex gap-2">
                <Input
                  value={quizLink}
                  readOnly
                  className="bg-slate-50 dark:bg-slate-800/50 font-mono text-sm"
                />
                <Button
                  onClick={copyQuizLink}
                  variant="outline"
                  size="sm"
                  className="shrink-0 bg-transparent"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Quick Stats
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">
                    Questions:
                  </span>
                  <span className="ml-2 font-medium">{questions.length}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">
                    Est. Time:
                  </span>
                  <span className="ml-2 font-medium">
                    {Math.round(totalEstimatedTime)}m
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">
                    Access:
                  </span>
                  <span className="ml-2 font-medium">
                    {publishSettings.makePublic ? "Public" : "Private"}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">
                    Retakes:
                  </span>
                  <span className="ml-2 font-medium">
                    {publishSettings.allowRetakes ? "Allowed" : "Not Allowed"}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">
                    Grading:
                  </span>
                  <span className="ml-2 font-medium capitalize">
                    {gradingType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkModal(false)}>
              Close
            </Button>
            <Button
              onClick={copyQuizLink}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={blankContextMenu && blankContextMenu.visible}
        onOpenChange={(visible) => !visible && setBlankContextMenu(null)}
      >
        <div
          className="fixed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-2 z-[60]"
          style={{
            left: blankContextMenu?.x,
            top: blankContextMenu?.y,
          }}
        >
          <button
            onClick={() => {
              if (!blankContextMenu) return;
              deleteBlank(
                blankContextMenu.questionId,
                blankContextMenu.blankIndex
              );
            }}
            className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Blank
          </button>
          <button
            onClick={() => {
              if (!blankContextMenu) return;
              // Duplicate the blank
              const question = questions.find(
                (q) => q.id === blankContextMenu.questionId
              );
              if (question) {
                const answer =
                  question.options?.[blankContextMenu.blankIndex] || "";
                const newOptions = [...(question.options || [])];
                newOptions.splice(blankContextMenu.blankIndex + 1, 0, answer);

                const parts = question.title.split(/({{blank_\d+}})/);
                let blankIndex = 0;
                const newParts = [];

                for (const part of parts) {
                  if (part.match(/({{blank_\d+}})/)) {
                    newParts.push(`{{blank_${blankIndex}}}`);
                    if (blankIndex === blankContextMenu.blankIndex) {
                      newParts.push(`{{blank_${blankIndex + 1}}}`);
                    }
                    blankIndex++;
                  } else {
                    newParts.push(part);
                  }
                }

                // Update indices
                let finalBlankIndex = 0;
                const finalParts = newParts.map((part) => {
                  if (part.match(/({{blank_\d+}})/)) {
                    return `{{blank_${finalBlankIndex++}}}`;
                  }
                  return part;
                });

                setQuestions((prev) =>
                  prev.map((q) =>
                    q.id === blankContextMenu.questionId
                      ? {
                          ...q,
                          title: finalParts.join(""),
                          options: newOptions,
                        }
                      : q
                  )
                );
              }
              setBlankContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Duplicate Blank
          </button>
        </div>
      </Dialog>

      <Dialog
        open={showQuestionBankDialog}
        onOpenChange={setShowQuestionBankDialog}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-600" />
              Import from Question Bank
            </DialogTitle>
            <DialogDescription>
              Select questions from your question bank to add to this quiz. You
              can search, filter, and preview questions before importing.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search questions, tags, or subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Multiple Choice">
                    Multiple Choice
                  </SelectItem>
                  <SelectItem value="True/False">True/False</SelectItem>
                  <SelectItem value="Short Answer">Short Answer</SelectItem>
                  <SelectItem value="Essay">Essay</SelectItem>
                  <SelectItem value="Fill in the Blank">
                    Fill in the Blank
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select
                value={filterDifficulty}
                onValueChange={setFilterDifficulty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject Filter */}
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium">Subject:</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterSubject === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterSubject("all")}
                >
                  All
                </Button>
                {uniqueSubjects.map((subject) => (
                  <Button
                    key={subject}
                    variant={filterSubject === subject ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterSubject(subject)}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </div>

            {/* Selection Controls */}
            <div className="flex items-center justify-between py-2 border-y">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {selectedQuestionIds.size === filteredQuestions.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedQuestionIds.size} of {filteredQuestions.length}{" "}
                  selected
                </span>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Showing {filteredQuestions.length} question
                {filteredQuestions.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Questions List */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {/* ✅ Loading State */}
                {isLoadingQuestionBank ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      Loading your question bank...
                    </p>
                  </div>
                ) : /* ✅ Error State */
                questionBankError ? (
                  <div className="text-center py-12">
                    <X className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <p className="text-red-600 dark:text-red-400 font-medium mb-2">
                      Failed to load questions
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                      {questionBankError}
                    </p>
                    <Button
                      onClick={loadQuestionBankData}
                      variant="outline"
                      size="sm"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : /* Empty State */
                filteredQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                    <p className="text-slate-600 dark:text-slate-400 text-center">
                      No questions found matching your filters.
                    </p>
                    {questionBankData.length === 0 && (
                      <p className="text-slate-500 dark:text-slate-500 text-sm mt-2 text-center">
                        Your question bank is empty. Create questions first!
                      </p>
                    )}
                  </div>
                ) : (
                  filteredQuestions.map((question) => {
                    const isSelected = selectedQuestionIds.has(question.id);
                    const isInQuiz = isQuestionInQuiz(question.id);

                    return (
                      <Card
                        key={question.id}
                        className={`transition-all duration-200 ${
                          isSelected
                            ? "border-indigo-500 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20"
                            : "hover:border-slate-300 dark:hover:border-slate-600"
                        } ${isInQuiz ? "opacity-50" : ""}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggleQuestionSelection(question.id)
                              }
                              disabled={isInQuiz}
                              className="mt-1"
                            />

                            {/* Question Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h4 className="font-medium text-slate-900 dark:text-white leading-snug">
                                  {question.question}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setPreviewQuestion(question)}
                                  className="shrink-0"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-sm">
                                <Badge
                                  variant="outline"
                                  className="font-normal"
                                >
                                  {question.type}
                                </Badge>
                                <Badge
                                  className={getDifficultyColor(
                                    question.difficulty
                                  )}
                                >
                                  {question.difficulty}
                                </Badge>
                                <Badge variant="secondary">
                                  {question.subject}
                                </Badge>
                                <span className="text-slate-600 dark:text-slate-400">
                                  {question.points} pts
                                </span>
                                <span className="text-slate-500 dark:text-slate-500">
                                  •
                                </span>
                                <span className="text-slate-600 dark:text-slate-400">
                                  Used in {question.usedIn} quizzes
                                </span>
                                {isInQuiz && (
                                  <>
                                    <span className="text-slate-500 dark:text-slate-500">
                                      •
                                    </span>
                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                      Already in quiz
                                    </span>
                                  </>
                                )}
                              </div>

                              {question.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {question.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="outline"
                                      className="text-xs font-normal"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="p-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowQuestionBankDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportQuestions}
              disabled={selectedQuestionIds.size === 0}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Import{" "}
              {selectedQuestionIds.size > 0
                ? `${selectedQuestionIds.size} `
                : ""}
              Question
              {selectedQuestionIds.size !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!previewQuestion}
        onOpenChange={() => setPreviewQuestion(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Question Preview
            </DialogTitle>
            <DialogDescription>
              This is how the question will appear to students.
            </DialogDescription>
          </DialogHeader>

          {previewQuestion && (
            <div className="space-y-4">
              {/* Question Info */}
              <div className="flex flex-wrap items-center gap-2 pb-3 border-b">
                <Badge variant="outline">{previewQuestion.type}</Badge>
                <Badge
                  className={getDifficultyColor(previewQuestion.difficulty)}
                >
                  {previewQuestion.difficulty}
                </Badge>
                <Badge variant="secondary">{previewQuestion.subject}</Badge>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {previewQuestion.points} points
                </span>
              </div>

              {/* Question Text */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {previewQuestion.question}
                </h3>

                {/* Options for Multiple Choice */}
                {previewQuestion.type === "Multiple Choice" &&
                  previewQuestion.options && (
                    <div className="space-y-2">
                      {previewQuestion.options.map(
                        (option: string, index: number) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border-2 ${
                              option === previewQuestion.correctAnswer
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : "border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  option === previewQuestion.correctAnswer
                                    ? "border-green-500 bg-green-500"
                                    : "border-slate-300 dark:border-slate-600"
                                }`}
                              >
                                {option === previewQuestion.correctAnswer && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="text-slate-900 dark:text-white">
                                {option}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                {/* True/False */}
                {previewQuestion.type === "True/False" && (
                  <div className="space-y-2">
                    {["True", "False"].map((option) => (
                      <div
                        key={option}
                        className={`p-3 rounded-lg border-2 ${
                          option.toLowerCase() === previewQuestion.correctAnswer
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              option.toLowerCase() ===
                              previewQuestion.correctAnswer
                                ? "border-green-500 bg-green-500"
                                : "border-slate-300 dark:border-slate-600"
                            }`}
                          >
                            {option.toLowerCase() ===
                              previewQuestion.correctAnswer && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-slate-900 dark:text-white">
                            {option}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Short Answer / Fill in the Blank */}
                {(previewQuestion.type === "Short Answer" ||
                  previewQuestion.type === "Fill in the Blank") && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Student Answer Area
                      </p>
                      <Input placeholder="Type answer here..." disabled />
                    </div>
                    <div className="p-3 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                        Correct Answer:
                      </p>
                      <p className="text-slate-900 dark:text-white">
                        {previewQuestion.correctAnswer}
                      </p>
                    </div>
                  </div>
                )}

                {/* Essay */}
                {previewQuestion.type === "Essay" && (
                  <div className="p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Student Essay Area
                    </p>
                    <Textarea
                      placeholder="Type essay here..."
                      rows={6}
                      disabled
                    />
                  </div>
                )}
              </div>

              {/* Explanation */}
              {previewQuestion.explanation && (
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                    Explanation:
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    {previewQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewQuestion(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface QuestionEditorProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  onConvertToBlank?: (questionId: string) => void;
  onAddBlankAtCursor?: (questionId: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  questionNumber: number;
  dragHandleProps: any;
  isActive: boolean;
  selectedText: string;
  selectionRange: { start: number; end: number } | null;
  onTextSelection: (questionId: string) => void;
  onClearSelection: () => void;
  setBlankContextMenu: (
    menu: {
      visible: boolean;
      x: number;
      y: number;
      blankIndex: number;
      questionId: string;
    } | null
  ) => void;
  getDefaultEstimatedTime: (questionType: Question["type"]) => number;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onUpdate,
  onConvertToBlank,
  onAddBlankAtCursor,
  onDelete,
  onDuplicate,
  questionNumber,
  dragHandleProps,
  isActive,
  selectedText,
  selectionRange,
  onTextSelection,
  onClearSelection,
  setBlankContextMenu,
  getDefaultEstimatedTime,
}) => {
  const questionTypes = useMemo(
    () => [
      { value: "multiple-choice", label: "Multiple Choice", icon: CheckCircle },
      { value: "checkbox", label: "Checkbox", icon: Square },
      { value: "true-false", label: "True/False", icon: ToggleLeft },
      { value: "short-answer", label: "Short Answer", icon: Type },
      { value: "long-answer", label: "Long Answer", icon: AlignLeft },
      { value: "fill-blank", label: "Fill in the Blank", icon: FileText },
      { value: "matching", label: "Matching", icon: List },
      { value: "drag-drop", label: "Drag & Drop", icon: Move },
      { value: "ordering", label: "Ordering", icon: ArrowUpDown },
      { value: "dropdown", label: "Dropdown", icon: ChevronDown },
      { value: "linear-scale", label: "Linear Scale", icon: BarChart3 },
      { value: "essay", label: "Essay", icon: FileText }, // Added essay type
    ],
    []
  );

  const addOption = () => {
    const newOptions = [...(question.options || []), ""];
    onUpdate({ options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = question.options?.filter((_, i) => i !== index) || [];
    onUpdate({ options: newOptions });
  };

  const setCorrectAnswer = (answer: number | boolean) => {
    onUpdate({ correctAnswer: answer });
  };

  const addCorrectAnswer = (answer: number) => {
    const currentCorrectAnswers = question.correctAnswers || [];
    const newCorrectAnswers = currentCorrectAnswers.includes(answer)
      ? currentCorrectAnswers.filter((a) => a !== answer)
      : [...currentCorrectAnswers, answer];
    onUpdate({ correctAnswers: newCorrectAnswers });
  };

  // ✅ FIX: Move hooks to component level (not inside render function)
  const editorRef = useRef<HTMLDivElement>(null);
  const [editingBlankIndex, setEditingBlankIndex] = useState<number | null>(
    null
  );
  const isUpdatingFromCode = useRef(false);

  // Generate HTML for contenteditable with blank badges
  const generateEditorHTML = useCallback(() => {
    const parts = question.title.split(/({{blank_\d+}})/);
    let blankIndex = 0;
    let html = "";

    parts.forEach((part) => {
      if (part.match(/({{blank_\d+}})/)) {
        const currentBlankIndex = blankIndex++;
        const answer = question.options?.[currentBlankIndex] || "";

        html += `<span
          data-blank-index="${currentBlankIndex}"
          contenteditable="false"
          class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-400 dark:border-blue-600 rounded-full text-blue-800 dark:text-blue-200 font-semibold cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-all hover:scale-105"
          style="user-select: none;"
          title="Click to edit"
        >
          <span class="text-xs">Blank ${currentBlankIndex + 1}:</span>
          <span class="font-bold">${answer || "(empty)"}</span>
          <button
            type="button"
            data-remove-blank="${currentBlankIndex}"
            class="ml-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            style="background: none; border: none; padding: 0; cursor: pointer;"
          >×</button>
        </span>`;
      } else {
        html +=
          part ||
          (blankIndex === 0 && parts.length === 1
            ? "Type your question here..."
            : "");
      }
    });

    return html;
  }, [question.title, question.options]);

  // Update editor HTML when title changes externally (not from typing)
  useEffect(() => {
    if (question.type !== "fill-blank") return; // Only for fill-blank questions
    if (!editorRef.current || isUpdatingFromCode.current) {
      isUpdatingFromCode.current = false;
      return;
    }

    // Only update if HTML is different
    const currentHTML = editorRef.current.innerHTML;
    const newHTML = generateEditorHTML();
    if (currentHTML !== newHTML) {
      editorRef.current.innerHTML = newHTML;
    }
  }, [question.type, question.title, question.options, generateEditorHTML]);

  const renderFillBlankEditor = () => {
    // Extract text content from contenteditable div (preserving {{blank_N}})
    const extractTextFromEditor = (element: HTMLElement): string => {
      let text = "";
      element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          text += node.textContent || "";
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          // If it's a blank badge, extract the marker
          if (el.dataset.blankIndex !== undefined) {
            text += `{{blank_${el.dataset.blankIndex}}}`;
          } else {
            text += el.textContent || "";
          }
        }
      });
      return text;
    };

    const handleConvertToBlank = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        alert("Please select text to convert to a blank");
        return;
      }

      const selectedText = selection.toString().trim();
      if (!selectedText) {
        alert("Please select text to convert to a blank");
        return;
      }

      // Get current blanks to determine next index
      const blanks = question.title.match(/{{blank_\d+}}/g) || [];
      const nextBlankNum = blanks.length;

      // Store the answer in options array
      const newOptions = [...(question.options || [])];
      newOptions[nextBlankNum] = selectedText;

      // Get current text and replace selection
      const editor = editorRef.current;
      if (!editor) return;

      const currentText = extractTextFromEditor(editor);
      const range = selection.getRangeAt(0);

      // Find position in text
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(editor);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const start = preSelectionRange.toString().length;

      const beforeSelection = currentText.substring(0, start);
      const afterSelection = currentText.substring(start + selectedText.length);
      const newTitle =
        beforeSelection + `{{blank_${nextBlankNum}}}` + afterSelection;

      isUpdatingFromCode.current = true;
      onUpdate({
        title: newTitle,
        options: newOptions,
      });

      // Clear selection
      selection.removeAllRanges();
    };

    const handleInsertBlank = () => {
      const editor = editorRef.current;
      if (!editor) return;

      const blanks = question.title.match(/{{blank_\d+}}/g) || [];
      const nextBlankNum = blanks.length;

      // Get current text from editor
      const currentText = extractTextFromEditor(editor);
      const newTitle = currentText + ` {{blank_${nextBlankNum}}}`;

      // Add empty option
      const newOptions = [...(question.options || [])];
      newOptions[nextBlankNum] = "";

      isUpdatingFromCode.current = true;
      onUpdate({ title: newTitle, options: newOptions });
    };

    const handleEditorBlur = () => {
      // Only update on blur, not on every keystroke
      const editor = editorRef.current;
      if (!editor) return;

      const newText = extractTextFromEditor(editor);
      if (newText !== question.title) {
        onUpdate({ title: newText });
      }
    };

    const handleRemoveBlank = (blankIndex: number) => {
      // Close edit modal if editing this blank
      if (editingBlankIndex === blankIndex) {
        setEditingBlankIndex(null);
      } else if (editingBlankIndex !== null && editingBlankIndex > blankIndex) {
        // Adjust editing index if it's after the deleted blank
        setEditingBlankIndex(editingBlankIndex - 1);
      }

      // Remove blank from title completely (don't restore the text)
      const blankMarker = `{{blank_${blankIndex}}}`;
      const newTitle = question.title.replace(blankMarker, "");

      // Remove from options and reindex
      const newOptions = (question.options || []).filter(
        (_, i) => i !== blankIndex
      );

      // Update all blank markers in title to reflect new indices
      let updatedTitle = newTitle;
      for (let i = blankIndex + 1; i < (question.options || []).length; i++) {
        updatedTitle = updatedTitle.replace(
          `{{blank_${i}}}`,
          `{{blank_${i - 1}}}`
        );
      }

      isUpdatingFromCode.current = true;
      onUpdate({
        title: updatedTitle,
        options: newOptions,
      });
    };

    // Handle clicks on the editor
    const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;

      // Check if clicked on remove button
      const removeButton = target.closest("[data-remove-blank]") as HTMLElement;
      if (removeButton) {
        e.preventDefault();
        e.stopPropagation();
        const blankIndex = parseInt(removeButton.dataset.removeBlank || "0");
        handleRemoveBlank(blankIndex);
        return;
      }

      // Check if clicked on blank badge
      const blankBadge = target.closest("[data-blank-index]") as HTMLElement;
      if (blankBadge) {
        e.preventDefault();
        const blankIndex = parseInt(blankBadge.dataset.blankIndex || "0");
        setEditingBlankIndex(blankIndex);
      }
    };

    // Parse title to show real input lines for student preview
    const renderStudentPreview = () => {
      const parts = question.title.split(/({{blank_\d+}})/);
      let blankIndex = 0;

      return (
        <div className="text-lg leading-relaxed flex flex-wrap items-baseline gap-1">
          {parts.map((part, index) => {
            if (part.match(/({{blank_\d+}})/)) {
              const currentBlankIndex = blankIndex++;
              const answer = question.options?.[currentBlankIndex] || "";

              return (
                <input
                  key={index}
                  type="text"
                  disabled
                  placeholder=" "
                  className="border-0 border-b-2 border-slate-400 dark:border-slate-500 bg-transparent outline-none px-2 py-1 text-slate-600 dark:text-slate-400"
                  style={{
                    minWidth: `${Math.max(120, answer.length * 12)}px`,
                    width: `${Math.max(120, answer.length * 12)}px`,
                  }}
                />
              );
            }

            return (
              <span key={index} className="inline">
                {part}
              </span>
            );
          })}
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Fill in the Blank Question
        </Label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <strong>How to create blanks:</strong> Type your question below,
          select text, then click "Convert to Blank"
        </p>

        {/* Visual editor with blank badges - CONTENTEDITABLE */}
        <div className="space-y-2">
          <div
            ref={editorRef}
            contentEditable={true}
            onBlur={handleEditorBlur}
            onClick={handleEditorClick}
            suppressContentEditableWarning
            className="min-h-[120px] p-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors outline-none text-lg leading-relaxed"
            dangerouslySetInnerHTML={{ __html: generateEditorHTML() }}
          />

          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              onClick={handleConvertToBlank}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Convert Selection to Blank
            </Button>
            <Button
              type="button"
              onClick={handleInsertBlank}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Insert Empty Blank
            </Button>
          </div>
        </div>

        {/* Edit blank modal */}
        {editingBlankIndex !== null && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-600 rounded-lg">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
              Edit Blank {editingBlankIndex + 1} Answer
            </Label>
            <div className="flex gap-2">
              <Input
                autoFocus
                value={question.options?.[editingBlankIndex] || ""}
                onChange={(e) => {
                  const newOptions = [...(question.options || [])];
                  newOptions[editingBlankIndex] = e.target.value;
                  onUpdate({ options: newOptions });
                }}
                placeholder="Type the correct answer..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setEditingBlankIndex(null);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => setEditingBlankIndex(null)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Done
              </Button>
            </div>
          </div>
        )}

        {/* Student preview with REAL input lines */}
        {question.title && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Student Preview (Real Lines)
            </Label>
            <div className="p-6 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900">
              {renderStudentPreview()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              Students will see real input lines with a bottom border (like
              paper worksheets)
            </p>
          </div>
        )}

        {/* ✅ NEW: Grading Sensitivity Settings */}
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Answer Grading Options
            </CardTitle>
            <CardDescription className="text-xs">
              How strictly should student answers be matched?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Case Sensitivity Toggle */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={`case-sensitive-${question.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    Case Sensitive
                  </Label>
                  <Badge variant="secondary" className="text-xs font-mono">
                    Aa
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  When enabled, capitalization must match exactly
                </p>
                <div className="text-xs space-y-1 mt-2 pl-2 border-l-2 border-slate-300 dark:border-slate-600">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        question.caseSensitive
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }
                    >
                      {question.caseSensitive ? "✗" : "✓"}
                    </span>
                    <span
                      className={
                        question.caseSensitive
                          ? "text-slate-400 line-through"
                          : ""
                      }
                    >
                      "paris" = "Paris" = "PARIS"
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        question.caseSensitive
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {question.caseSensitive ? "✓" : "✗"}
                    </span>
                    <span
                      className={
                        !question.caseSensitive
                          ? "text-slate-400 line-through"
                          : ""
                      }
                    >
                      "Paris" only (exact match)
                    </span>
                  </div>
                </div>
              </div>
              <Switch
                id={`case-sensitive-${question.id}`}
                checked={question.caseSensitive || false}
                onCheckedChange={(checked) => {
                  onUpdate({ caseSensitive: checked });
                }}
              />
            </div>

            <Separator />

            {/* Whitespace Sensitivity Toggle */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={`whitespace-sensitive-${question.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    Strict Whitespace
                  </Label>
                  <Badge variant="secondary" className="text-xs font-mono">
                    ␣
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  When enabled, spacing must match exactly
                </p>
                <div className="text-xs space-y-1 mt-2 pl-2 border-l-2 border-slate-300 dark:border-slate-600">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        question.whitespaceSensitive
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }
                    >
                      {question.whitespaceSensitive ? "✗" : "✓"}
                    </span>
                    <span
                      className={
                        question.whitespaceSensitive
                          ? "text-slate-400 line-through"
                          : ""
                      }
                    >
                      "New York" = "New York"
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        question.whitespaceSensitive
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {question.whitespaceSensitive ? "✓" : "✗"}
                    </span>
                    <span
                      className={
                        !question.whitespaceSensitive
                          ? "text-slate-400 line-through"
                          : ""
                      }
                    >
                      Spacing must be exact
                    </span>
                  </div>
                </div>
              </div>
              <Switch
                id={`whitespace-sensitive-${question.id}`}
                checked={question.whitespaceSensitive || false}
                onCheckedChange={(checked) => {
                  onUpdate({ whitespaceSensitive: checked });
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const handleBlankRightClick = (
    e: React.MouseEvent,
    blankIndex: number,
    questionId: string
  ) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent parent context menu
    setBlankContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      blankIndex,
      questionId,
    });
  };

  return (
    <Card
      className={`transition-all duration-300 hover:shadow-xl border-l-4 ${
        isActive
          ? "ring-2 ring-blue-500 shadow-xl border-l-blue-500"
          : "border-l-slate-200 dark:border-l-slate-700 hover:border-l-blue-400"
      }`}
    >
      <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform duration-200"
            >
              <GripVertical className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                {questionNumber}
              </div>
              <Select
                value={question.type}
                onValueChange={(value: Question["type"]) => {
                  let newOptions;
                  if (value === "multiple-choice" && !question.options) {
                    newOptions = ["", "", "", ""];
                  } else if (value === "matching" && !question.options) {
                    newOptions = ["", "", "", ""];
                  } else if (value === "fill-blank" && !question.options) {
                    newOptions = [];
                  } else if (value === "checkbox" && !question.options) {
                    newOptions = ["", ""];
                  }
                  onUpdate({
                    type: value,
                    options: newOptions,
                    correctAnswer: undefined,
                    correctAnswers: undefined,
                    matchingPairs: undefined,
                    estimatedTime: getDefaultEstimatedTime(value),
                  });
                }}
              >
                <SelectTrigger className="w-48 hover:border-blue-400 transition-colors duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Points:</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={question.points}
                onChange={(e) =>
                  onUpdate({ points: Number.parseInt(e.target.value) || 1 })
                }
                className="w-20 hover:border-blue-400 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Time:</Label>
              <Input
                type="number"
                min="0.5"
                max="60"
                step="0.5"
                value={
                  question.timeLimit ||
                  question.estimatedTime ||
                  getDefaultEstimatedTime(question.type)
                }
                onChange={(e) => {
                  const timeValue =
                    Number.parseFloat(e.target.value) ||
                    getDefaultEstimatedTime(question.type);
                  onUpdate({
                    timeLimit: timeValue, // ✅ Update timeLimit (saved to DB)
                    estimatedTime: timeValue, // ✅ Also update estimatedTime (for display)
                  });
                }}
                className="w-20 hover:border-gre"
              />
              <span className="text-xs text-slate-500">min</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent hover:scale-105 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDuplicate}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-transparent hover:scale-105 transition-all duration-200"
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Title */}
        {question.type === "fill-blank" ? (
          renderFillBlankEditor()
        ) : (
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Question
            </Label>
            <Textarea
              id={`question-title-${question.id}`}
              placeholder="Enter your question here..."
              value={question.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="min-h-[100px] text-base hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 hover:shadow-sm"
              onMouseUp={() => onTextSelection(question.id)}
              onMouseLeave={() => onClearSelection()}
            />
          </div>
        )}

        {/* Question Description */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Description (Optional)
          </Label>
          <Textarea
            placeholder="Add additional context or instructions..."
            value={question.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="min-h-[60px] hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 hover:shadow-sm"
          />
        </div>

        {/* Question Image Uploader */}
        <QuizImageUploader
          value={question.questionImageUrl}
          onChange={(imageData) => {
            if (imageData) {
              onUpdate({
                questionImageId: imageData.imageId,
                questionImageUrl: imageData.imageUrl,
                questionImageFileSize: imageData.fileSize,
                questionImageMimeType: imageData.mimeType,
              });
            } else {
              onUpdate({
                questionImageId: undefined,
                questionImageUrl: undefined,
                questionImageFileSize: undefined,
                questionImageMimeType: undefined,
              });
            }
          }}
          label="Question Image (Optional)"
          variant="question"
          compact
        />

        {/* Question Type Specific Content */}
        {question.type === "multiple-choice" && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Answer Options
            </Label>
            <div className="space-y-4">
              {question.options?.map((option, index) => (
                <div
                  key={index}
                  className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg group hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={question.correctAnswer === index}
                      onChange={() => setCorrectAnswer(index)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className={`flex-1 transition-all duration-200 hover:shadow-sm ${
                        question.correctAnswer === index
                          ? "border-green-300 bg-green-50 dark:bg-green-900/20 shadow-sm"
                          : "hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400"
                      }`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Choice Image Uploader */}
                  <QuizImageUploader
                    value={question.choiceImages?.[index]?.imageUrl}
                    onChange={(imageData) => {
                      const newChoiceImages = [
                        ...(question.choiceImages || []),
                      ];
                      // Ensure array is long enough
                      while (newChoiceImages.length <= index) {
                        newChoiceImages.push({});
                      }

                      if (imageData) {
                        newChoiceImages[index] = {
                          imageId: imageData.imageId,
                          imageUrl: imageData.imageUrl,
                          fileSize: imageData.fileSize,
                          mimeType: imageData.mimeType,
                        };
                      } else {
                        newChoiceImages[index] = {};
                      }

                      onUpdate({ choiceImages: newChoiceImages });
                    }}
                    label={`Option ${index + 1} Image`}
                    variant="choice"
                    compact
                  />
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addOption}
                className="w-full justify-start bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {question.type === "checkbox" && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Answer Options
            </Label>
            <div className="space-y-4">
              {question.options?.map((option, index) => (
                <div
                  key={index}
                  className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg group hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={
                        question.correctAnswers?.includes(index) || false
                      }
                      onChange={() => addCorrectAnswer(index)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className={`flex-1 transition-all duration-200 hover:shadow-sm ${
                        question.correctAnswers?.includes(index)
                          ? "border-green-300 bg-green-50 dark:bg-green-900/20 shadow-sm"
                          : "hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400"
                      }`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Choice Image Uploader */}
                  <QuizImageUploader
                    value={question.choiceImages?.[index]?.imageUrl}
                    onChange={(imageData) => {
                      const newChoiceImages = [
                        ...(question.choiceImages || []),
                      ];
                      // Ensure array is long enough
                      while (newChoiceImages.length <= index) {
                        newChoiceImages.push({});
                      }

                      if (imageData) {
                        newChoiceImages[index] = {
                          imageId: imageData.imageId,
                          imageUrl: imageData.imageUrl,
                          fileSize: imageData.fileSize,
                          mimeType: imageData.mimeType,
                        };
                      } else {
                        newChoiceImages[index] = {};
                      }

                      onUpdate({ choiceImages: newChoiceImages });
                    }}
                    label={`Option ${index + 1} Image`}
                    variant="choice"
                    compact
                  />
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addOption}
                className="w-full justify-start bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {question.type === "true-false" && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Correct Answer
            </Label>
            <div className="flex gap-4">
              <Button
                variant={
                  question.correctAnswer === true ? "default" : "outline"
                }
                onClick={() => setCorrectAnswer(true)}
                className={`flex-1 transition-all duration-200 hover:scale-105 ${
                  question.correctAnswer === true
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                    : "hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-400"
                }`}
              >
                <Check className="w-4 h-4 mr-2" />
                True
              </Button>
              <Button
                variant={
                  question.correctAnswer === false ? "default" : "outline"
                }
                onClick={() => setCorrectAnswer(false)}
                className={`flex-1 transition-all duration-200 hover:scale-105 ${
                  question.correctAnswer === false
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                    : "hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400"
                }`}
              >
                <X className="w-4 h-4 mr-2" />
                False
              </Button>
            </div>
          </div>
        )}

        {(question.type === "short-answer" ||
          question.type === "long-answer" ||
          question.type === "essay") && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Max Points for Grading
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g., 5"
                  value={question.maxPoints || 5}
                  onChange={(e) =>
                    onUpdate({
                      maxPoints: Number.parseInt(e.target.value) || 5,
                    })
                  }
                  className="hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Points teachers can assign when grading (0 to this value)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Grading Rubric (Optional)
              </Label>
              <Textarea
                placeholder="Enter grading criteria...&#10;Example:&#10;• Clear explanation (2 pts)&#10;• Scientific accuracy (2 pts)&#10;• Proper grammar (1 pt)"
                value={question.gradingRubric || ""}
                onChange={(e) => onUpdate({ gradingRubric: e.target.value })}
                className="min-h-[100px] hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provide grading criteria to help with consistent evaluation
              </p>
            </div>
            {/* </CHANGE> */}

            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Sample Answers (Optional)
            </Label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add sample correct answers to help with grading guidance.
            </p>
            <div className="space-y-2">
              {question.sampleAnswers?.map((answer, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <Input
                    placeholder={`Sample answer ${index + 1}`}
                    value={answer}
                    onChange={(e) => {
                      const newAnswers = [...(question.sampleAnswers || [])];
                      newAnswers[index] = e.target.value;
                      onUpdate({ sampleAnswers: newAnswers });
                    }}
                    className="flex-1 hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newAnswers =
                        question.sampleAnswers?.filter((_, i) => i !== index) ||
                        [];
                      onUpdate({ sampleAnswers: newAnswers });
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newAnswers = [...(question.sampleAnswers || []), ""];
                  onUpdate({ sampleAnswers: newAnswers });
                }}
                className="w-full justify-start bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sample Answer
              </Button>
            </div>
          </div>
        )}

        {question.type === "matching" && (
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Matching Pairs
            </Label>
            <p className="text-sm text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
              💡 <strong>How it works:</strong> Create pairs where students
              match items from the left column with items from the right column.
            </p>

            {(!question.matchingPairs ||
              Object.keys(question.matchingPairs).length === 0) && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No pairs created yet</p>
                <p className="text-xs">
                  Click "Add Pair" to create matching pairs
                </p>
              </div>
            )}

            {question.matchingPairs &&
              Object.keys(question.matchingPairs).length > 0 && (
                <div className="space-y-3">
                  {Object.entries(question.matchingPairs).map(
                    ([leftItem, rightItem], index) => (
                      <div key={index} className="group">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className="text-xs font-semibold"
                          >
                            Pair {index + 1}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newPairs = { ...question.matchingPairs };
                              delete newPairs[leftItem];
                              onUpdate({ matchingPairs: newPairs });
                            }}
                            className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500 dark:text-slate-400">
                              Left Item (Term)
                            </Label>
                            <Textarea
                              placeholder="e.g., Python"
                              value={leftItem}
                              onChange={(e) => {
                                const newPairs = { ...question.matchingPairs };
                                delete newPairs[leftItem];
                                newPairs[e.target.value] = rightItem;
                                onUpdate({ matchingPairs: newPairs });
                              }}
                              className="min-h-[80px] hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500 dark:text-slate-400">
                              Right Item (Definition)
                            </Label>
                            <Textarea
                              placeholder="e.g., Programming language"
                              value={rightItem}
                              onChange={(e) => {
                                const newPairs = { ...question.matchingPairs };
                                newPairs[leftItem] = e.target.value;
                                onUpdate({ matchingPairs: newPairs });
                              }}
                              className="min-h-[80px] hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

            <Button
              variant="outline"
              onClick={() => {
                const newPairs = { ...(question.matchingPairs || {}) };
                const pairNum = Object.keys(newPairs).length + 1;
                newPairs[`Item ${pairNum}`] = `Match ${pairNum}`;
                onUpdate({ matchingPairs: newPairs });
              }}
              className="w-full justify-start bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Pair
            </Button>

            {question.matchingPairs &&
              Object.keys(question.matchingPairs).length >= 3 && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                    ✅ Preview (Student View)
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mb-3">
                    Right column will be shuffled. Students must match items
                    correctly.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Left Column
                      </p>
                      {Object.keys(question.matchingPairs).map((left, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600"
                        >
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {left}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Right Column (Shuffled)
                      </p>
                      {Object.values(question.matchingPairs)
                        .sort(() => Math.random() - 0.5)
                        .map((right, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600"
                          >
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {right}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

            {question.matchingPairs &&
              Object.keys(question.matchingPairs).length < 3 &&
              Object.keys(question.matchingPairs).length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    ⚠️ Add at least 3 pairs for a matching question
                  </p>
                </div>
              )}
          </div>
        )}

        {question.type === "drag-drop" && (
          <div className="space-y-6">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Drag & Drop Configuration
            </Label>
            <p className="text-sm text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
              💡 <strong>How it works:</strong> Students drag items from the
              answer bank to the correct drop zones.
            </p>

            {/* Answer Bank Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Answer Bank Items
                </Label>
                <Badge variant="outline" className="text-xs">
                  {question.dragDropAnswers?.length || 0} items
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Items students can drag
              </p>

              {(!question.dragDropAnswers ||
                question.dragDropAnswers.length === 0) && (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No answer bank items yet</p>
                </div>
              )}

              {question.dragDropAnswers &&
                question.dragDropAnswers.length > 0 && (
                  <div className="space-y-2">
                    {question.dragDropAnswers.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 group"
                      >
                        <Badge
                          variant="secondary"
                          className="text-xs min-w-[60px] justify-center"
                        >
                          Item {index + 1}
                        </Badge>
                        <Input
                          placeholder="e.g., Apple"
                          value={item}
                          onChange={(e) => {
                            const newItems = [
                              ...(question.dragDropAnswers || []),
                            ];
                            newItems[index] = e.target.value;
                            onUpdate({ dragDropAnswers: newItems });
                          }}
                          className="flex-1 hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newItems =
                              question.dragDropAnswers?.filter(
                                (_, i) => i !== index
                              ) || [];
                            onUpdate({ dragDropAnswers: newItems });
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

              <Button
                variant="outline"
                onClick={() => {
                  const newItems = [...(question.dragDropAnswers || []), ""];
                  onUpdate({ dragDropAnswers: newItems });
                }}
                className="w-full justify-start bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Answer Bank Item
              </Button>
            </div>

            {/* Drop Zones */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Drop Zones
                </Label>
                <Badge variant="outline" className="text-xs">
                  {question.dragDropZones?.length || 0} zones
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Targets where students drop items
              </p>

              {(!question.dragDropZones ||
                question.dragDropZones.length === 0) && (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No drop zones yet</p>
                </div>
              )}

              {question.dragDropZones && question.dragDropZones.length > 0 && (
                <div className="space-y-2">
                  {question.dragDropZones.map((zone, index) => (
                    <div key={index} className="flex items-center gap-3 group">
                      <Badge
                        variant="default"
                        className="text-xs min-w-[60px] justify-center"
                      >
                        Zone {index + 1}
                      </Badge>
                      <Input
                        placeholder="e.g., Fruits"
                        value={zone}
                        onChange={(e) => {
                          const newZones = [...(question.dragDropZones || [])];
                          newZones[index] = e.target.value;
                          onUpdate({ dragDropZones: newZones });
                        }}
                        className="flex-1 hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newZones =
                            question.dragDropZones?.filter(
                              (_, i) => i !== index
                            ) || [];
                          onUpdate({ dragDropZones: newZones });
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  const newZones = [...(question.dragDropZones || []), ""];
                  onUpdate({ dragDropZones: newZones });
                }}
                className="w-full justify-start bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Drop Zone
              </Button>
            </div>

            {/* Correct Mappings */}
            {question.dragDropZones &&
              question.dragDropZones.length > 0 &&
              question.dragDropAnswers &&
              question.dragDropAnswers.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Correct Mappings
                  </Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Assign which items belong in each zone
                  </p>

                  {question.dragDropZones.map((zone, zoneIdx) => (
                    <div
                      key={zoneIdx}
                      className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="default" className="text-xs">
                          Zone {zoneIdx + 1}
                        </Badge>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {zone || "(unnamed zone)"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {question.dragDropAnswers.map((item, itemIdx) => {
                          const mappings = question.dragDropMappings || {};
                          const zoneItems = mappings[zone] || [];
                          const isChecked = zoneItems.includes(item);

                          return (
                            <div
                              key={itemIdx}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const newMappings = {
                                    ...question.dragDropMappings,
                                  };
                                  if (!newMappings[zone])
                                    newMappings[zone] = [];

                                  if (checked) {
                                    newMappings[zone] = [
                                      ...newMappings[zone],
                                      item,
                                    ];
                                  } else {
                                    newMappings[zone] = newMappings[
                                      zone
                                    ].filter((i) => i !== item);
                                  }

                                  onUpdate({ dragDropMappings: newMappings });
                                }}
                              />
                              <Label className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                                {item || "(empty item)"}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* Preview */}
            {question.dragDropZones &&
              question.dragDropZones.length > 0 &&
              question.dragDropAnswers &&
              question.dragDropAnswers.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                    ✅ Preview (Student View)
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mb-4">
                    Answer bank items will be shuffled.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Answer Bank
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[...question.dragDropAnswers]
                          .sort(() => Math.random() - 0.5)
                          .map((item, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-sm cursor-move"
                            >
                              {item || "(empty)"}
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Drop Zones
                      </p>
                      {question.dragDropZones.map((zone, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-400 dark:border-slate-500 min-h-[80px]"
                        >
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {zone}
                          </p>
                          <p className="text-xs text-slate-400">
                            Drop items here
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            {(!question.dragDropZones ||
              question.dragDropZones.length === 0 ||
              !question.dragDropAnswers ||
              question.dragDropAnswers.length === 0) && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  ⚠️ Add answer bank items and drop zones to create a drag &
                  drop question
                </p>
              </div>
            )}
          </div>
        )}

        {question.type === "linear-scale" && (
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Linear Scale Configuration
            </Label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Configure the scale range and labels for students to rate.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 dark:text-slate-400">
                  Min Value
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  placeholder="1"
                  value={question.scaleMin || 1}
                  onChange={(e) =>
                    onUpdate({ scaleMin: Number.parseInt(e.target.value) || 1 })
                  }
                  className="hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 dark:text-slate-400">
                  Max Value
                </Label>
                <Input
                  type="number"
                  min="2"
                  max="10"
                  placeholder="5"
                  value={question.scaleMax || 5}
                  onChange={(e) =>
                    onUpdate({ scaleMax: Number.parseInt(e.target.value) || 5 })
                  }
                  className="hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 dark:text-slate-400">
                  Start Label (Min Value)
                </Label>
                <Input
                  placeholder="e.g., Strongly Disagree"
                  value={question.scaleStartLabel || ""}
                  onChange={(e) =>
                    onUpdate({ scaleStartLabel: e.target.value })
                  }
                  className="hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 dark:text-slate-400">
                  End Label (Max Value)
                </Label>
                <Input
                  placeholder="e.g., Strongly Agree"
                  value={question.scaleEndLabel || ""}
                  onChange={(e) => onUpdate({ scaleEndLabel: e.target.value })}
                  className="hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 dark:text-slate-400">
                  Middle Label (Optional)
                </Label>
                <Input
                  placeholder="e.g., Neutral"
                  value={question.scaleMiddleLabel || ""}
                  onChange={(e) =>
                    onUpdate({ scaleMiddleLabel: e.target.value })
                  }
                  className="hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Preview:
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {question.scaleStartLabel || "Min"}
                </span>
                <div className="flex gap-2">
                  {Array.from({
                    length:
                      (question.scaleMax || 5) - (question.scaleMin || 1) + 1,
                  }).map((_, i) => {
                    const value = (question.scaleMin || 1) + i;
                    return (
                      <button
                        key={i}
                        className="w-10 h-10 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {question.scaleEndLabel || "Max"}
                </span>
              </div>
              {question.scaleMiddleLabel && (
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
                  {question.scaleMiddleLabel}
                </p>
              )}
            </div>
          </div>
        )}

        {question.type === "ordering" && (
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Ordering Items
            </Label>
            <p className="text-sm text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
              💡 <strong>How it works:</strong> Add items and arrange them in
              the correct order. Students will need to reorder these items.
            </p>

            {(!question.orderingItems ||
              question.orderingItems.length === 0) && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No items added yet</p>
                <p className="text-xs">
                  Click "Add Item" to create ordering items
                </p>
              </div>
            )}

            {question.orderingItems && question.orderingItems.length > 0 && (
              <div className="space-y-3">
                {question.orderingItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="flex flex-col gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (index === 0) return;
                          const newItems = [...(question.orderingItems || [])];
                          const temp = newItems[index];
                          newItems[index] = newItems[index - 1];
                          newItems[index - 1] = temp;
                          onUpdate({ orderingItems: newItems });
                        }}
                        disabled={index === 0}
                        className="h-8 px-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (
                            index ===
                            (question.orderingItems?.length || 0) - 1
                          )
                            return;
                          const newItems = [...(question.orderingItems || [])];
                          const temp = newItems[index];
                          newItems[index] = newItems[index + 1];
                          newItems[index + 1] = temp;
                          onUpdate({ orderingItems: newItems });
                        }}
                        disabled={
                          index === (question.orderingItems?.length || 0) - 1
                        }
                        className="h-8 px-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 min-w-[80px]">
                          Position {index + 1}:
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Correct Order
                        </Badge>
                      </div>
                      <Textarea
                        placeholder={`Item ${
                          index + 1
                        } (e.g., "First step in the process")`}
                        value={item}
                        onChange={(e) => {
                          const newItems = [...(question.orderingItems || [])];
                          newItems[index] = e.target.value;
                          onUpdate({ orderingItems: newItems });
                        }}
                        className="min-h-[80px] hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItems =
                          question.orderingItems?.filter(
                            (_, i) => i !== index
                          ) || [];
                        onUpdate({ orderingItems: newItems });
                      }}
                      className="mt-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => {
                const newItems = [...(question.orderingItems || []), ""];
                onUpdate({ orderingItems: newItems });
              }}
              className="w-full justify-start bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>

            {question.orderingItems && question.orderingItems.length >= 2 && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                  ✅ Preview (Student View)
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mb-3">
                  Items will be shown in random order. Students must arrange
                  them correctly.
                </p>
                <div className="space-y-2">
                  {[...question.orderingItems]
                    .sort(() => Math.random() - 0.5)
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-300 dark:border-slate-600"
                      >
                        <div className="flex items-center gap-2 text-slate-400">
                          <GripVertical className="w-4 h-4" />
                          <span className="text-xs font-mono">#{idx + 1}</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {item || "(empty item)"}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {question.orderingItems && question.orderingItems.length < 2 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  ⚠️ Add at least 2 items for an ordering question
                </p>
              </div>
            )}
          </div>
        )}

        {/* Question Settings */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={question.required}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
              />
              <Label className="text-sm">Required</Label>
            </div>
            {(question.type === "multiple-choice" ||
              question.type === "ordering") && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={question.randomizeOptions || false}
                  onCheckedChange={(checked) =>
                    onUpdate({ randomizeOptions: checked })
                  }
                />
                <Label className="text-sm">Randomize Options</Label>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
