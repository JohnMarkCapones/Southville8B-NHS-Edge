"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, Trophy, RotateCcw, BookOpen, Timer, Target, Layers, Loader2, CheckCircle2, XCircle, Award, TrendingUp, Clock, ChevronDown, ChevronUp } from "lucide-react"
import StudentLayout from "@/components/student/student-layout"
import { FormModeRenderer } from "@/components/quiz/form-mode-renderer"
import { SequentialModeRenderer } from "@/components/quiz/sequential-mode-renderer"
import { HybridModeRenderer } from "@/components/quiz/hybrid-mode-renderer"
import { teacherQuizApi, studentQuizApi } from "@/lib/api/endpoints/quiz"
import type { Quiz, QuizResponse } from "@/types/quiz"
import { TimeUpDialog } from "@/components/quiz/time-up-dialog"
import { FullscreenWarningDialog } from "@/components/quiz/fullscreen-warning-dialog"
import { QuizWatermark } from "@/components/quiz/quiz-watermark"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
// ✅ ADD: Backend integration hooks
import { useQuizAttempt } from "@/hooks/useQuizAttempt"
import { useQuizSession } from "@/hooks/useQuizSession"
import { useQuizProgress } from "@/hooks/useQuizProgress"
import { useQuizFlags } from "@/hooks/useQuizFlags"
import { useHeartbeat } from "@/hooks/useHeartbeat"
import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '@/lib/api/endpoints'
import type { UserProfileResponse } from '@/lib/api/types'

export default function DynamicQuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  // ✅ ADD: Backend integration hooks (non-destructive)
  const backendAttempt = useQuizAttempt()
  const { sendProgress, calculateProgress } = useQuizProgress()
  const { toast } = useToast()

  // ✅ ADD: Fetch current user to get student name for watermark
  const { data: user } = useQuery<UserProfileResponse, Error>({
    queryKey: ['user', 'me'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })

  // ✅ ADD: Extract student name from user profile
  const studentName = user?.student
    ? `${user.student.first_name} ${user.student.middle_name ? user.student.middle_name + ' ' : ''}${user.student.last_name}`.trim()
    : user?.full_name || 'Student'

  // ✅ KEEP: All existing state variables (100% preserved)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, QuizResponse>>({})
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false)
  const [noRetakesError, setNoRetakesError] = useState(false)
  const [backendResults, setBackendResults] = useState<any>(null) // Store backend quiz results
  const [requireFullscreen, setRequireFullscreen] = useState(false) // ✅ ADD: Store require_fullscreen setting
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false) // ✅ ADD: Show fullscreen exit warning
  const [isStarting, setIsStarting] = useState(false) // ✅ RACE CONDITION FIX: Prevent double-click on Start Quiz button
  const [isSubmitting, setIsSubmitting] = useState(false) // ✅ NEW: Loading state for submission
  const [submissionMessage, setSubmissionMessage] = useState('') // ✅ NEW: Current motivational message
  const [reviewData, setReviewData] = useState<any>(null) // ✅ NEW: Detailed review data with correct answers
  const [showReview, setShowReview] = useState(false) // ✅ NEW: Toggle to show/hide answer review
  const [screenshotDetected, setScreenshotDetected] = useState(false) // ✅ NEW: Track screenshot detection for watermark

  // ✅ ADD: Session monitoring (after quiz starts)
  const session = useQuizSession(
    backendAttempt.attempt?.attempt_id || null,
    quizStarted && !quizCompleted
  )

  // ✅ ADD: Security flag monitoring (submits flags to backend)
  const flags = useQuizFlags(
    backendAttempt.attempt?.attempt_id || null,
    {
      detectTabSwitch: true,
      detectCopyPaste: true,
      detectFullscreenExit: true,
      detectNetworkDisconnect: true,
      detectBrowserBack: true,
      detectScreenshot: true,
    }
  )

  // ✅ ADD: Track screenshot detection for watermark display
  useEffect(() => {
    if (flags.screenshotCount > 0) {
      setScreenshotDetected(true)
      // Keep watermark visible for 10 seconds after detection
      const timer = setTimeout(() => {
        setScreenshotDetected(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [flags.screenshotCount])

  // ✅ ADD: Heartbeat to keep session alive (Phase 1 of resume functionality)
  const heartbeat = useHeartbeat({
    interval: 120000, // 2 minutes (keeps session fresh within 5-min backend threshold)
    autoStart: false, // Don't start until quiz begins
    onSessionInvalid: () => {
      console.error('[Quiz] Session invalid - navigating back to quiz list')
      toast({
        title: "Session Invalid",
        description: "Your quiz session has ended. Please contact your teacher.",
        variant: "destructive",
      })
      router.push('/student/quiz')
    }
  })

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        console.log(`[StudentQuiz] Loading quiz with ID: ${quizId}`)
        const quizData = await teacherQuizApi.getQuizById(quizId)
        console.log(`[StudentQuiz] Quiz data loaded:`, quizData)

        if (quizData) {
          // ✅ CHECK: Retake prevention - block access if already attempted and retakes not allowed
          const hasAttempted = quizData.student_attempts && quizData.student_attempts.length > 0
          const allowsRetakes = quizData.allow_retakes === true

          console.log('[StudentQuiz] Retake check - Has attempted:', hasAttempted)
          console.log('[StudentQuiz] Retake check - Allows retakes:', allowsRetakes)

          if (hasAttempted && !allowsRetakes) {
            console.log('[StudentQuiz] BLOCKED - Student already attempted and retakes not allowed')
            setNoRetakesError(true)
            setLoading(false)
            return // Stop loading the quiz
          }

          // Transform backend quiz format to match component expectations
          const transformedQuiz: Quiz = {
            id: quizData.quiz_id,
            title: quizData.title,
            description: quizData.description || "",
            timeLimit: quizData.time_limit || 30,
            // Map backend "type" to frontend "deliveryMode" (mixed → hybrid)
            deliveryMode: quizData.type === 'mixed' ? 'hybrid' : (quizData.type || 'sequential'),
            validationSettings: {
              requireAnswerToProgress: false,
              requireAllAnswersToSubmit: false,
              allowQuestionSkipping: true
            },
            createdAt: new Date(quizData.created_at || Date.now()),
            updatedAt: new Date(quizData.updated_at || Date.now()),
            questions: quizData.questions?.map((q: any) => {
              // ✅ AUTO-FIX: If true/false question has no choices, generate them
              let choices = q.quiz_choices || [];
              if (q.question_type === 'true_false' && choices.length === 0) {
                console.warn(`[StudentQuiz] True/False question ${q.question_id} has no choices - generating default choices`);
                choices = [
                  {
                    choice_id: `${q.question_id}-true`,  // Temporary UUID-like ID
                    choice_text: 'True',
                    is_correct: false,  // Can't determine without backend data
                    order_index: 0
                  },
                  {
                    choice_id: `${q.question_id}-false`,
                    choice_text: 'False',
                    is_correct: false,
                    order_index: 1
                  }
                ];
              }

              // ✅ Extract metadata for complex question types
              const metadata = q.metadata || {};
              const additionalFields: any = {};

              // ✅ Handle metadata-based question types
              if (q.question_type === 'matching' && metadata.matching_pairs) {
                additionalFields.matchingPairs = metadata.matching_pairs;
              } else if (q.question_type === 'fill_in_blank' && metadata.blank_positions) {
                // For fill-in-blank, extract answers from metadata
                additionalFields.options = metadata.blank_positions.map((bp: any) => bp.answer || '');
              } else if (q.question_type === 'ordering' && metadata.items) {
                additionalFields.orderingItems = metadata.items;
              } else if (q.question_type === 'drag_drop') {
                additionalFields.dragDropAnswers = metadata.answer_bank || [];
                additionalFields.dragDropZones = metadata.drop_zones || [];
                additionalFields.dragDropMappings = metadata.correct_mappings || {};
              } else if (q.question_type === 'linear_scale') {
                additionalFields.scaleMin = metadata.scale_min || 1;
                additionalFields.scaleMax = metadata.scale_max || 5;
                additionalFields.scaleStartLabel = metadata.scale_start_label || '';
                additionalFields.scaleEndLabel = metadata.scale_end_label || '';
                additionalFields.scaleMiddleLabel = metadata.scale_middle_label || '';
              }

              return {
                id: q.question_id,
                type: q.question_type.replace(/_/g, '-'), // Convert snake_case to kebab-case (multiple_choice → multiple-choice)
                title: q.question_text, // Required by BaseQuestion - the actual question text
                description: q.description,
                points: q.points || 1,
                required: q.is_required || false,
                // Legacy format: Extract just the text for options array (for backward compatibility)
                options: choices.map((c: any) => c.choice_text),
                // Legacy format: Store the correct answer index
                correctAnswer: choices.findIndex((c: any) => c.is_correct),
                // ✅ NEW: Preserve full choice data with UUIDs for proper answer submission
                choices: choices,
                // ✅ NEW: Include image fields from backend
                question_image_url: q.question_image_url,
                question_image_id: q.question_image_id,
                // ✅ NEW: Add metadata-based fields
                ...additionalFields
              };
            }) || []
          }

          console.log('[StudentQuiz] Transformed quiz:', transformedQuiz)
          console.log('[StudentQuiz] Number of questions:', transformedQuiz.questions.length)
          console.log('[StudentQuiz] First question:', transformedQuiz.questions[0])

          // ✅ ADD: Load fullscreen requirement from quiz settings
          if (quizData.quiz_settings?.require_fullscreen) {
            console.log('[StudentQuiz] Quiz requires fullscreen mode')
            setRequireFullscreen(true)
          }

          setQuiz(transformedQuiz)
          setTimeRemaining((transformedQuiz.timeLimit || 30) * 60) // Convert minutes to seconds

          // ✅ FIX: Auto-resume if student has active session (check immediately on page load)
          console.log('[Quiz] Checking for existing active session...')
          try {
            // Use startQuiz instead of startAttempt to get the full response
            const fingerprint = await import('@/lib/utils/device-fingerprint').then(m => m.generateDeviceFingerprint())
            const response = await backendAttempt.startQuiz(quizId, fingerprint.fingerprint)

            console.log('[Quiz] 🔍 DEBUG - Full response:', response)
            console.log('[Quiz] 🔍 DEBUG - isResumed flag:', response?.isResumed)
            console.log('[Quiz] 🔍 DEBUG - Attempt ID:', response?.attempt?.attempt_id)
            console.log('[Quiz] 🔍 DEBUG - Attempt status:', response?.attempt?.status)
            console.log('[Quiz] 🔍 DEBUG - savedAnswers:', response?.attempt?.savedAnswers?.length)

            if (response && response.isResumed) {
              // ✅ SAFETY CHECK: Verify attempt is actually in progress
              const attemptStatus = response.attempt?.status
              console.log('[Quiz] 🔍 Attempt status:', attemptStatus)

              if (attemptStatus !== 'in_progress') {
                console.error('[Quiz] ❌ Cannot resume - attempt status is:', attemptStatus)
                toast({
                  title: "Cannot Resume Quiz",
                  description: "This quiz has already been completed or terminated.",
                  variant: "destructive",
                })
                setLoading(false)
                return
              }

              // Session was resumed - skip start page, go directly to quiz
              console.log('[Quiz] 🔄 Active session found - auto-resuming quiz')
              setQuizStarted(true)

              // Start heartbeat immediately
              heartbeat.start()
              console.log('[Quiz] ✅ Heartbeat started')

              // Show resume notification
              const savedAnswersCount = response.attempt?.savedAnswers?.length || 0
              if (savedAnswersCount > 0) {
                toast({
                  title: "Quiz Resumed",
                  description: `Welcome back! ${savedAnswersCount} previous answer${savedAnswersCount !== 1 ? 's' : ''} restored.`,
                  variant: "default",
                  duration: 5000,
                })
              }

              // Restore saved answers
              if (response.attempt?.savedAnswers && Array.isArray(response.attempt.savedAnswers)) {
                const restoredResponses: Record<string, QuizResponse> = {}
                response.attempt.savedAnswers.forEach((savedAnswer: any) => {
                  const answer = savedAnswer.temporary_choice_id ||
                                savedAnswer.temporary_choice_ids ||
                                savedAnswer.temporary_answer_text ||
                                savedAnswer.temporary_answer_json
                  if (answer !== null && answer !== undefined) {
                    restoredResponses[savedAnswer.question_id] = {
                      questionId: savedAnswer.question_id,
                      answer: answer,
                    }
                  }
                })
                if (Object.keys(restoredResponses).length > 0) {
                  setResponses(restoredResponses)
                  console.log(`[Quiz] ✅ Restored ${Object.keys(restoredResponses).length} saved answers`)
                }
              }

              // Restore question index
              if (response.attempt?.currentQuestionIndex !== undefined) {
                setCurrentQuestionIndex(response.attempt.currentQuestionIndex)
                console.log(`[Quiz] 📍 Restored question index: ${response.attempt.currentQuestionIndex}`)
              }

              // Restore timer
              if (transformedQuiz.timeLimit && response.attempt?.started_at) {
                const startedAt = new Date(response.attempt.started_at)
                const now = new Date()
                const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000)
                const timeLimitSeconds = transformedQuiz.timeLimit * 60
                const remainingSeconds = timeLimitSeconds - elapsedSeconds

                if (remainingSeconds <= 0) {
                  toast({
                    title: "Time Expired",
                    description: "Your time limit has been reached. Submitting quiz...",
                    variant: "destructive",
                  })
                  // Will auto-submit when component renders
                } else {
                  setTimeRemaining(remainingSeconds)
                  console.log(`[Quiz] ⏱️ Timer restored to ${Math.floor(remainingSeconds / 60)}m ${remainingSeconds % 60}s`)
                }
              }

              // Request fullscreen if required
              if (quizData.quiz_settings?.require_fullscreen) {
                try {
                  await flags.requestFullscreen()
                  console.log('[Quiz] Fullscreen mode activated')
                } catch (fsError) {
                  console.warn('[Quiz] Fullscreen request failed:', fsError)
                }
              }
            } else {
              console.log('[Quiz] No active session found - showing start page')
            }
          } catch (error) {
            console.log('[Quiz] No active session to resume:', error)
            // Show start page normally
          }
        }
        setLoading(false)
      } catch (error) {
        console.error("[StudentQuiz] Failed to load quiz:", error)
        setLoading(false)
      }
    }

    loadQuiz()
  }, [quizId, router])

  useEffect(() => {
    if (!quizStarted || quizCompleted || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setShowTimeUpDialog(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizStarted, quizCompleted, timeRemaining])

  useEffect(() => {
    if (!quizStarted || quizCompleted) return

    const autoSaveTimer = setInterval(() => {
      // Auto-save logic - in a real app, this would save to backend
      console.log("[v0] Auto-saving quiz responses:", responses)
      // You can implement actual auto-save to backend here
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer)
  }, [quizStarted, quizCompleted, responses])

  // ✅ PHASE 1: Stop heartbeat when quiz ends or component unmounts
  useEffect(() => {
    // Cleanup function runs on unmount
    return () => {
      if (heartbeat.isActive) {
        heartbeat.stop()
        console.log('[Quiz] 🧹 Heartbeat stopped - component unmounting')
      }
    }
  }, []) // Empty deps = runs once on mount, cleanup on unmount

  // ✅ PHASE 3: Save current question index and progress to backend (for UI restoration on resume)
  useEffect(() => {
    if (!quizStarted || quizCompleted || !backendAttempt.attempt || !quiz) return

    // Debounce progress updates to avoid spamming backend
    const timer = setTimeout(() => {
      const answeredCount = Object.keys(responses).length
      const progress = calculateProgress(answeredCount, quiz.questions.length)

      sendProgress(
        backendAttempt.attempt.attempt_id,
        currentQuestionIndex, // ✅ Save current question for UI restoration
        answeredCount,
        progress
      ).catch(err => {
        console.warn('[Quiz] Progress tracking failed:', err)
        // Silent failure - don't disrupt quiz experience
      })
    }, 2000) // Save 2 seconds after navigation/change

    return () => clearTimeout(timer)
  }, [currentQuestionIndex, responses, quizStarted, quizCompleted, backendAttempt.attempt, quiz])

  // ✅ TIME TRACKING: Mark question as viewed when it changes (for per-question time tracking)
  useEffect(() => {
    if (!quizStarted || quizCompleted || !quiz) return

    const currentQuestion = quiz.questions[currentQuestionIndex]
    if (currentQuestion?.id) {
      backendAttempt.markQuestionViewed(currentQuestion.id)
    }
  }, [currentQuestionIndex, quizStarted, quizCompleted, quiz, backendAttempt.markQuestionViewed])

  // ✅ ADD: Monitor fullscreen exits and show warning dialog + toast
  useEffect(() => {
    console.log('[Quiz] Fullscreen monitor effect:', {
      requireFullscreen,
      quizStarted,
      quizCompleted,
      isFullscreen: flags.isFullscreen,
      exitCount: flags.fullscreenExitCount,
    });

    if (!requireFullscreen || !quizStarted || quizCompleted) {
      console.log('[Quiz] Fullscreen monitoring disabled (conditions not met)');
      return;
    }

    // Show warning when student exits fullscreen
    if (!flags.isFullscreen && flags.fullscreenExitCount > 0) {
      console.warn('[Quiz] 🚨 Student exited fullscreen mode - showing warnings');

      // Show toast notification
      toast({
        variant: "destructive",
        title: "⚠️ Fullscreen Exit Detected",
        description: `You exited fullscreen mode. This has been logged. Exit count: ${flags.fullscreenExitCount}`,
        duration: 6000, // 6 seconds
      });

      console.log('[Quiz] Toast notification shown');

      // Show dialog
      setShowFullscreenWarning(true);
      console.log('[Quiz] Warning dialog opened');
    }
  }, [requireFullscreen, quizStarted, quizCompleted, flags.isFullscreen, flags.fullscreenExitCount, toast])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleResponseChange = (questionId: string, response: QuizResponse) => {
    // ✅ KEEP: Update local state immediately (for UI responsiveness)
    setResponses((prev) => ({
      ...prev,
      [questionId]: response,
    }))

    // ✅ ADD: Save to backend (async, non-blocking)
    if (backendAttempt.attempt?.attempt_id) {
      backendAttempt.submitAnswer(
        backendAttempt.attempt.attempt_id,
        questionId,
        response.answer  // ✅ FIX: Pass just the answer value, not the whole response object
      ).catch(error => {
        console.error('[Quiz] Failed to save answer to backend:', error)
        // ✅ UI continues to work even if backend save fails
      })

      // ✅ Send progress update when answer changes (student answered a question)
      const answeredCount = Object.keys(responses).length + 1 // +1 for current answer
      const progress = calculateProgress(answeredCount, quiz?.questions.length || 0)

      sendProgress(
        backendAttempt.attempt.attempt_id,
        currentQuestionIndex,
        answeredCount,
        progress
      ).catch(err => {
        console.error('[handleResponseChange] Progress tracking failed:', err)
        // Silent failure - don't disrupt quiz experience
      })
    }
  }

  const handleStartQuiz = async () => {
    // ✅ RACE CONDITION FIX: Prevent double-click
    if (isStarting) {
      console.log('[Quiz] Already starting, ignoring duplicate click')
      return
    }

    setIsStarting(true) // Disable button immediately
    setLoading(true)    // Show loading state

    try {
      // ✅ This function is now only called for NEW quiz attempts (not resumes)
      // Auto-resume happens in loadQuiz useEffect
      console.log('[Quiz] 🚀 START QUIZ CALLED', {
        timestamp: new Date().toISOString(),
        quizId,
        hasBackendAttempt: !!backendAttempt,
      })

      console.log('[Quiz] Starting NEW quiz attempt...')
      const success = await backendAttempt.startAttempt(quizId)

      if (success) {
        // ✅ SAFETY CHECK: Verify the attempt is actually in progress
        const attemptStatus = backendAttempt.attempt?.status
        console.log('[Quiz] ✅ START QUIZ RESPONSE', {
          attemptId: backendAttempt.attempt?.attempt_id,
          status: attemptStatus,
        })

        if (attemptStatus && attemptStatus !== 'in_progress') {
          console.error('[Quiz] ❌ Attempt status is not in_progress:', attemptStatus)
          toast({
            title: "Error Starting Quiz",
            description: "The quiz attempt could not be started. Please refresh and try again.",
            variant: "destructive",
          })
          return
        }

        console.log('[Quiz] New quiz started successfully!')
        setQuizStarted(true)

        // ✅ PHASE 1: Start heartbeat to keep session alive
        heartbeat.start()
        console.log('[Quiz] ✅ Heartbeat started - session will remain active')

        // ✅ Request fullscreen if required (NEW quizzes only)
        if (requireFullscreen) {
          console.log('[Quiz] Requesting fullscreen mode...')
          try {
            await flags.requestFullscreen()
            console.log('[Quiz] Fullscreen mode activated')
          } catch (fsError) {
            console.warn('[Quiz] Fullscreen request failed (user may have denied):', fsError)
          }
        }
      } else {
        console.error('[Quiz] Backend start returned false')
        // Don't start quiz if backend fails
      }
    } catch (error: any) {
      console.error('[Quiz] Backend start failed:', error)

      // Check if error is about retakes not allowed
      if (error?.message?.toLowerCase().includes('retake') ||
          error?.data?.message?.toLowerCase().includes('retake')) {
        console.log('[Quiz] Retakes not allowed - showing error UI')
        setNoRetakesError(true)
        return
      }

      // Don't start quiz if backend fails - this is critical
      console.error('[Quiz] Cannot start quiz without backend attempt')
    } finally {
      // ✅ RACE CONDITION FIX: Always reset starting state
      setIsStarting(false)
      setLoading(false)
    }
  }

  const handleNextQuestion = async () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      const newIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(newIndex)

      // ✅ Send progress update to backend for teacher monitoring
      if (backendAttempt.attempt?.attempt_id) {
        const answeredCount = Object.keys(responses).length
        const progress = calculateProgress(answeredCount, quiz.questions.length)

        sendProgress(
          backendAttempt.attempt.attempt_id,
          newIndex,
          answeredCount,
          progress
        ).catch(err => {
          console.error('[handleNextQuestion] Progress tracking failed:', err)
          // Silent failure - don't disrupt quiz experience
        })
      }
    }
  }

  const handlePreviousQuestion = async () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(newIndex)

      // ✅ Send progress update to backend for teacher monitoring
      if (backendAttempt.attempt?.attempt_id) {
        const answeredCount = Object.keys(responses).length
        const progress = calculateProgress(answeredCount, quiz?.questions.length || 0)

        sendProgress(
          backendAttempt.attempt.attempt_id,
          newIndex,
          answeredCount,
          progress
        ).catch(err => {
          console.error('[handlePreviousQuestion] Progress tracking failed:', err)
          // Silent failure - don't disrupt quiz experience
        })
      }
    }
  }

  const handleSubmitQuiz = async () => {
    // ✅ Submit to backend - NO FALLBACK
    if (!backendAttempt.attempt?.attempt_id) {
      console.error('[Quiz] No attempt ID found - cannot submit')
      return
    }

    // ✅ NEW: Motivational messages for loading
    const messages = [
      "Calculating your score...",
      "You did your best!",
      "Every answer counts!",
      "Reviewing your answers...",
      "Are you feeling confident?",
      "Great effort on this quiz!",
      "Analyzing your responses...",
      "Knowledge is power!",
      "Almost there...",
      "Preparing your results...",
      "You've got this!",
      "Grading in progress..."
    ]

    try {
      // ✅ NEW: Show loading with rotating messages
      setIsSubmitting(true)
      let messageIndex = 0
      setSubmissionMessage(messages[0])

      // Rotate messages every 2 seconds
      const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length
        setSubmissionMessage(messages[messageIndex])
      }, 2000)

      console.log('[Quiz] Submitting to backend...', {
        attemptId: backendAttempt.attempt.attempt_id
      })
      const result = await backendAttempt.submitQuiz(backendAttempt.attempt.attempt_id)

      // ✅ NEW: Stop rotating messages
      clearInterval(messageInterval)

      console.log('[Quiz] Backend submission result:', result)

      if (result) {
        console.log('[Quiz] ✅ Backend submission successful!', result)
        console.log('[Quiz] 🔍 DEBUG - Backend result breakdown:')
        console.log('[Quiz]   - score:', result.score)
        console.log('[Quiz]   - maxScore:', result.maxScore)
        console.log('[Quiz]   - percentage:', result.percentage)
        console.log('[Quiz]   - gradedCount:', result.gradedCount)
        console.log('[Quiz]   - manualGradingRequired:', result.manualGradingRequired)
        console.log('[Quiz]   - autoGraded:', result.autoGraded)
        setBackendResults(result) // ✅ Store backend results
        setQuizCompleted(true)
        setShowResults(true)
        setShowTimeUpDialog(false)

        // ✅ NEW: Fetch detailed review data for answer comparison
        try {
          console.log('[Quiz] 📝 Fetching review data...')
          const review = await studentQuizApi.getAttemptReview(backendAttempt.attempt.attempt_id)
          console.log('[Quiz] ✅ Review data fetched:', review)
          setReviewData(review)
        } catch (reviewError) {
          console.error('[Quiz] ⚠️ Failed to fetch review data:', reviewError)
          // Continue without review data - results still visible
        }

        // ✅ PHASE 1: Stop heartbeat when quiz is completed
        heartbeat.stop()
        console.log('[Quiz] ✅ Heartbeat stopped - quiz completed')

        // ✅ NEW: Hide loading after slight delay for smooth transition
        setTimeout(() => setIsSubmitting(false), 500)
      } else {
        console.error('[Quiz] ❌ Backend returned no result (null/undefined)')
        console.error('[Quiz] Check for error toast notification or backend logs')
        setIsSubmitting(false)
        // Don't show results if backend fails
      }
    } catch (error) {
      console.error('[Quiz] ❌ Backend submission failed with exception:', error)
      setIsSubmitting(false)
      // Don't show results if backend fails - this is a real error
    }
  }

  const handleTimeUpSubmission = async () => {
    console.log("[Quiz] Auto-submitting quiz due to time expiry")
    // Submit to backend when time is up
    await handleSubmitQuiz()
  }

  // ✅ REMOVED: Local calculateResults() function
  // All grading is now done 100% on the backend for security and consistency

  const getAnsweredCount = () => {
    if (!quiz) return 0
    return quiz.questions.filter((q) => responses[q.id]).length
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading quiz...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  // No retakes allowed UI
  if (noRetakesError) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
          <Card className="max-w-lg mx-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 shadow-2xl">
            <CardContent className="pt-12 pb-10 px-8 text-center">
              {/* Icon */}
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center border-4 border-amber-200 dark:border-amber-700/50">
                  <RotateCcw className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                </div>
                {/* X mark */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                  <span className="text-white font-bold text-lg">×</span>
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">
                Quiz Already Completed
              </h2>

              {/* Message */}
              <div className="space-y-3 mb-8">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  You have already completed this quiz. Retakes are not allowed for this assessment.
                </p>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-4">
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    <strong>Note:</strong> If you believe this is an error or need to retake the quiz for a valid reason, please contact your teacher.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.push('/student/quiz')}
                  className="bg-gradient-to-r from-school-blue to-indigo-600 hover:from-school-blue/90 hover:to-indigo-600/90 text-white shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Quiz Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </StudentLayout>
    )
  }

  if (!quiz) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
          <Card className="max-w-lg mx-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 shadow-2xl">
            <CardContent className="p-8 text-center">
              {/* School-themed illustration */}
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center border-4 border-amber-200 dark:border-amber-700/50">
                  <BookOpen className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                </div>
                {/* Floating question marks */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center border-2 border-red-200 dark:border-red-700/50">
                  <span className="text-red-500 dark:text-red-400 font-bold text-sm">?</span>
                </div>
                <div className="absolute -bottom-1 -left-3 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center border-2 border-blue-200 dark:border-blue-700/50">
                  <span className="text-blue-500 dark:text-blue-400 font-bold text-xs">?</span>
                </div>
              </div>

              {/* School-friendly heading */}
              <h2 className="text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">Oops! Quiz Not Found</h2>

              {/* Educational and friendly message */}
              <div className="space-y-3 mb-8">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  It looks like this quiz might have been moved to a different classroom or is no longer available.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Don't worry!</strong> You can return to your quiz dashboard to find other available
                    assignments and activities.
                  </p>
                </div>
              </div>

              {/* School-themed action buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/student/quiz")}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Return to Quiz Dashboard
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push("/student")}
                  className="w-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 py-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Student Portal
                </Button>
              </div>

              {/* Helpful tip */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  💡 <strong>Tip:</strong> If you think this quiz should be available, please contact your teacher or
                  check your assignment notifications.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </StudentLayout>
    )
  }

  // ✅ ONLY use backend results - no local calculation fallback
  const results = backendResults ? {
    score: backendResults.score || 0,
    totalQuestions: quiz?.questions.length || 0,
    percentage: backendResults.percentage || 0, // ✅ Backend now provides percentage
    // ✅ FIX: Calculate correct answers count
    // If all questions are worth 1 point each: score = correct answers
    // Otherwise: approximate by assuming equal distribution
    correctAnswers: quiz?.questions.every((q: any) => q.points === 1)
      ? backendResults.score || 0
      : Math.round((backendResults.score / backendResults.maxScore) * (quiz?.questions.length || 0)),
    maxScore: backendResults.maxScore || 0,
  } : {
    // Default values if no backend results (shouldn't happen in normal flow)
    score: 0,
    totalQuestions: quiz?.questions.length || 0,
    percentage: 0,
    correctAnswers: 0,
    maxScore: 0,
  }

  const progress = quiz.questions.length > 0 ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0
  const answeredCount = getAnsweredCount()

  // Quiz start screen
  if (!quizStarted) {
    // Group questions by category for Quiz 1
    const questionsByCategory =
      quiz.id === "quiz-1"
        ? quiz.questions.reduce(
            (acc, question) => {
              const category = question.category || "General"
              if (!acc[category]) acc[category] = []
              acc[category].push(question)
              return acc
            },
            {} as Record<string, typeof quiz.questions>,
          )
        : {}

    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push("/student/quiz")}
              className="mb-6 hover:bg-white/50 dark:hover:bg-slate-800/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz List
            </Button>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {quiz.title}
                    </CardTitle>
                    <p className="text-lg text-muted-foreground mt-2">{quiz.description}</p>
                    {quiz.deliveryMode && (
                      <Badge variant="secondary" className="mt-2">
                        {quiz.deliveryMode === "form" && "All Questions at Once"}
                        {quiz.deliveryMode === "sequential" && "One Question at a Time"}
                        {quiz.deliveryMode === "hybrid" && "Mixed Format"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{quiz.questions.length}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Questions</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                    <Timer className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">{quiz.timeLimit || 30}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Minutes</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                    <Layers className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {quiz.deliveryMode ? quiz.deliveryMode.charAt(0).toUpperCase() + quiz.deliveryMode.slice(1) : "Sequential"}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Format</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200/50 dark:border-orange-700/50">
                    <Target className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">All Types</div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">Question Formats</div>
                  </div>
                </div>

                {/* Academic integrity and monitoring notice */}
                <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 border-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-900 dark:text-amber-100">
                    <div className="space-y-3">
                      <p className="font-bold text-base">⚠️ Important: Academic Integrity & Monitoring Notice</p>
                      <ul className="space-y-2 text-sm ml-4 list-disc">
                        <li>
                          <strong>You are being monitored:</strong> Your quiz activity may be tracked for academic
                          integrity purposes
                        </li>
                        <li>
                          <strong>Flags are indicators, not proof:</strong> Automated flags help identify potential
                          issues but are not conclusive evidence of cheating
                        </li>
                        <li>
                          <strong>You can explain flagged behavior:</strong> If your activity is flagged, you'll have
                          the opportunity to provide an explanation
                        </li>
                        <li>
                          <strong>Don't over-rely on automated flags:</strong> Teachers review all flagged activities
                          with context and understanding
                        </li>
                        <li>
                          <strong>Your privacy is respected:</strong> Monitoring data is used solely for educational
                          purposes and handled confidentially
                        </li>
                        <li>
                          <strong>We comply with regulations:</strong> All monitoring practices follow educational
                          privacy laws and school policies
                        </li>
                      </ul>
                      <p className="text-sm italic mt-3">
                        By starting this quiz, you acknowledge that you understand these monitoring practices and agree
                        to maintain academic integrity.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>

                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Instructions:</strong> This quiz contains various question types including text responses,
                    multiple choice, interactive elements, and assessment grids.
                    {quiz.deliveryMode === "form" && " All questions will be displayed at once for you to complete."}
                    {quiz.deliveryMode === "sequential" && " Questions will be presented one at a time."}
                    {quiz.deliveryMode === "hybrid" &&
                      " Initial questions will be shown together, followed by individual questions."}
                  </AlertDescription>
                </Alert>

                <div className="text-center pt-6">
                  <Button
                    onClick={handleStartQuiz}
                    disabled={loading || isStarting}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-12 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStarting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Starting Quiz...
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5 mr-3" />
                        Start Quiz
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Results screen
  // ✅ NEW: Submission loading screen
  if (isSubmitting) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
          <div className="text-center">
            {/* Animated Hourglass */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              {/* Hourglass SVG with rotation animation */}
              <div className="animate-[spin_3s_ease-in-out_infinite]">
                <svg
                  className="w-32 h-32 text-indigo-600 dark:text-indigo-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 2h12v6l-6 4 6 4v6H6v-6l6-4-6-4V2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="currentColor"
                    fillOpacity="0.2"
                  />
                  {/* Falling sand animation */}
                  <circle cx="12" cy="12" r="1.5" fill="currentColor">
                    <animate
                      attributeName="cy"
                      values="8;16;8"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="1;0;1"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
              </div>
            </div>

            {/* Motivational Message */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                Grading Your Quiz
              </h2>
              <p className="text-lg text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
                {submissionMessage}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Please wait while we calculate your results...
              </p>
            </div>

            {/* Loading dots */}
            <div className="flex justify-center gap-2 mt-8">
              <div className="w-3 h-3 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  if (showResults) {
    // ✅ Calculate performance badge
    const getPerformanceBadge = (percentage: number) => {
      if (percentage >= 90) return { label: "Excellent!", color: "from-green-500 to-emerald-600", icon: Trophy }
      if (percentage >= 75) return { label: "Great Job!", color: "from-blue-500 to-indigo-600", icon: Award }
      if (percentage >= 60) return { label: "Good Work!", color: "from-purple-500 to-pink-600", icon: TrendingUp }
      return { label: "Keep Practicing!", color: "from-orange-500 to-red-600", icon: Target }
    }

    const performanceBadge = getPerformanceBadge(results.percentage)
    const PerformanceIcon = performanceBadge.icon

    // ✅ Helper to render correct answer based on question type
    const renderCorrectAnswer = (question: any) => {
      const correctAnswer = question.correctAnswer

      switch (question.questionType) {
        case 'multiple_choice':
        case 'true_false':
          return <span className="font-medium text-green-700 dark:text-green-300">{correctAnswer}</span>

        case 'multiple_select':
          return (
            <ul className="list-disc list-inside space-y-1">
              {correctAnswer.map((answer: string, idx: number) => (
                <li key={idx} className="text-green-700 dark:text-green-300">{answer}</li>
              ))}
            </ul>
          )

        case 'fill_in_blank':
          return (
            <div className="space-y-2">
              {correctAnswer.map((answer: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Blank {idx + 1}:</span>
                  <span className="font-medium text-green-700 dark:text-green-300">{answer}</span>
                </div>
              ))}
            </div>
          )

        case 'matching':
        case 'matching-pair':
          return (
            <div className="space-y-2">
              {Object.entries(correctAnswer).map(([left, right], idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm font-medium">{left}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-green-700 dark:text-green-300">{right as string}</span>
                </div>
              ))}
            </div>
          )

        case 'ordering':
          return (
            <ol className="list-decimal list-inside space-y-1">
              {correctAnswer.map((item: any, idx: number) => (
                <li key={idx} className="text-green-700 dark:text-green-300">{item.text || item.label}</li>
              ))}
            </ol>
          )

        case 'short_answer':
        case 'essay':
          return <span className="text-muted-foreground italic">Requires manual grading</span>

        default:
          return <span className="text-muted-foreground">N/A</span>
      }
    }

    // ✅ Helper to render fill-in-blank question text with student answers
    const renderFillInBlankQuestion = (questionText: string, studentAnswers: any[]) => {
      const parts = questionText.split(/({{blank_\d+}})/g)
      let currentBlankIndex = 0

      return (
        <div className="text-lg leading-relaxed flex flex-wrap items-baseline gap-1">
          {parts.map((part, index) => {
            if (part.match(/{{blank_\d+}}/)) {
              const answer = studentAnswers[currentBlankIndex] || ''
              currentBlankIndex++
              return (
                <span
                  key={index}
                  className="border-b-2 border-slate-400 px-2 py-1 font-medium text-slate-900 dark:text-slate-100 min-w-[100px] inline-block"
                >
                  {answer || <span className="text-muted-foreground italic">blank</span>}
                </span>
              )
            }
            return <span key={index}>{part}</span>
          })}
        </div>
      )
    }

    // ✅ Helper to render student answer
    const renderStudentAnswer = (question: any) => {
      const studentAnswerObj = question.studentAnswer

      // Check if no answer was provided
      if (!studentAnswerObj ||
          (!studentAnswerObj.choiceId && !studentAnswerObj.choiceIds && !studentAnswerObj.answerText && !studentAnswerObj.answerJson)) {
        return <span className="text-muted-foreground italic">No answer provided</span>
      }

      switch (question.questionType) {
        case 'multiple_choice':
        case 'true_false':
          return <span className="font-medium">{studentAnswerObj.answerText || 'No answer'}</span>

        case 'multiple_select':
          const multiSelectAnswers = studentAnswerObj.answerJson || []
          return (
            <ul className="list-disc list-inside space-y-1">
              {(Array.isArray(multiSelectAnswers) ? multiSelectAnswers : [multiSelectAnswers]).map((answer: string, idx: number) => (
                <li key={idx}>{answer}</li>
              ))}
            </ul>
          )

        case 'fill_in_blank':
          const fillAnswers = studentAnswerObj.answerJson || []
          return (
            <div className="space-y-2">
              {(Array.isArray(fillAnswers) ? fillAnswers : []).map((answer: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Blank {idx + 1}:</span>
                  <span className="font-medium">{answer}</span>
                </div>
              ))}
            </div>
          )

        case 'matching':
        case 'matching-pair':
          const matchAnswers = studentAnswerObj.answerJson || {}
          return (
            <div className="space-y-2">
              {Object.entries(matchAnswers).map(([left, right], idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm font-medium">{left}</span>
                  <span className="text-muted-foreground">→</span>
                  <span>{right as string}</span>
                </div>
              ))}
            </div>
          )

        case 'ordering':
          const orderAnswers = studentAnswerObj.answerJson || []
          return (
            <ol className="list-decimal list-inside space-y-1">
              {(Array.isArray(orderAnswers) ? orderAnswers : []).map((item: any, idx: number) => (
                <li key={idx}>{typeof item === 'string' ? item : item.text || item.label}</li>
              ))}
            </ol>
          )

        case 'short_answer':
        case 'essay':
          return <p className="text-sm">{studentAnswerObj.answerText || 'No answer'}</p>

        case 'drag_and_drop':
          return <span className="text-sm">{JSON.stringify(studentAnswerObj.answerJson)}</span>

        default:
          return <span className="text-muted-foreground">Unknown question type</span>
      }
    }

    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* ✅ Enhanced Results Summary Card */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-6">
                {/* Performance Icon & Badge */}
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className={`p-6 bg-gradient-to-r ${performanceBadge.color} rounded-full shadow-lg animate-fadeIn`}>
                    <PerformanceIcon className="w-12 h-12 text-white" />
                  </div>
                  <Badge className={`bg-gradient-to-r ${performanceBadge.color} text-white text-lg px-6 py-2 shadow-md`}>
                    {performanceBadge.label}
                  </Badge>
                </div>

                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Quiz Completed!
                </CardTitle>
                <p className="text-xl text-muted-foreground">{quiz.title}</p>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Score Statistics Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Percentage Score with Progress Circle */}
                  <div className="relative text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-200/50 dark:border-green-700/50 shadow-lg transition-colors duration-300">
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 mb-3">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-green-200 dark:text-green-800 transition-colors duration-300"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - results.percentage / 100)}`}
                            className="text-green-600 dark:text-green-400 transition-all duration-1000"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-green-700 dark:text-green-300 transition-colors duration-300">{results.percentage}%</span>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-green-600 dark:text-green-400 transition-colors duration-300">Final Score</div>
                    </div>
                  </div>

                  {/* Correct Answers */}
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-blue-200/50 dark:border-blue-700/50 shadow-lg transition-colors duration-300">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2 transition-colors duration-300">
                      {results.correctAnswers}/{results.totalQuestions}
                    </div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors duration-300">Correct Answers</div>
                  </div>

                  {/* Points Earned */}
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-200/50 dark:border-purple-700/50 shadow-lg transition-colors duration-300">
                    <Award className="w-8 h-8 mx-auto mb-3 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-2 transition-colors duration-300">{results.score}</div>
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400 transition-colors duration-300">Points Earned</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-300">out of {results.maxScore}</div>
                  </div>

                  {/* Time Taken */}
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border-2 border-orange-200/50 dark:border-orange-700/50 shadow-lg transition-colors duration-300">
                    <Clock className="w-8 h-8 mx-auto mb-3 text-orange-600 dark:text-orange-400 transition-colors duration-300" />
                    <div className="text-3xl font-bold text-orange-700 dark:text-orange-300 mb-2 transition-colors duration-300">
                      {formatTime(quiz.timeLimit * 60 - timeRemaining)}
                    </div>
                    <div className="text-sm font-medium text-orange-600 dark:text-orange-400 transition-colors duration-300">Time Taken</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <Button
                    onClick={() => router.push("/student/quiz")}
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 w-full sm:w-auto"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Quiz List
                  </Button>

                  {/* Toggle Review Button */}
                  {reviewData && (
                    <Button
                      onClick={() => setShowReview(!showReview)}
                      size="lg"
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-8 py-3 w-full sm:w-auto"
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      {showReview ? "Hide" : "Review"} Answers
                      {showReview ? <ChevronUp className="w-5 h-5 ml-2" /> : <ChevronDown className="w-5 h-5 ml-2" />}
                    </Button>
                  )}

                  {quiz.allow_retakes && (
                    <Button
                      onClick={() => {
                        setQuizStarted(false)
                        setQuizCompleted(false)
                        setShowResults(false)
                        setShowReview(false)
                        setReviewData(null)
                        setCurrentQuestionIndex(0)
                        setResponses({})
                        setTimeRemaining(quiz.timeLimit * 60)
                      }}
                      variant="outline"
                      size="lg"
                      className="px-8 py-3 w-full sm:w-auto"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Retake Quiz
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ✅ Answer Review Section */}
            {showReview && reviewData && (
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-xl animate-fadeIn">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                    Answer Review
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Review your answers and see the correct solutions</p>
                </CardHeader>

                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                  {reviewData.questions.map((question: any, index: number) => {
                    const isCorrect = question.isCorrect
                    const isPartial = question.pointsAwarded > 0 && question.pointsAwarded < question.pointsPossible

                    return (
                      <Card
                        key={question.questionId}
                        className={`border-l-4 ${
                          isCorrect
                            ? 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10'
                            : isPartial
                            ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10'
                            : 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10'
                        }`}
                      >
                        <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                          {/* Question Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="font-mono">Q{index + 1}</Badge>
                                <Badge variant="secondary" className="text-xs">{question.questionType.replace(/_/g, ' ')}</Badge>
                                {isCorrect ? (
                                  <Badge className="bg-green-600 text-white">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Correct
                                  </Badge>
                                ) : isPartial ? (
                                  <Badge className="bg-yellow-600 text-white">
                                    Partial Credit
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-600 text-white">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Incorrect
                                  </Badge>
                                )}
                              </div>
                              {question.questionType === 'fill_in_blank' ? (
                                renderFillInBlankQuestion(
                                  question.questionText,
                                  question.studentAnswer?.answerJson || []
                                )
                              ) : (
                                <p className="text-base font-medium mb-2">{question.questionText}</p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold">
                                {question.pointsAwarded.toFixed(1)}/{question.pointsPossible}
                              </div>
                              <div className="text-xs text-muted-foreground">points</div>
                            </div>
                          </div>

                          {/* Your Answer */}
                          <div className="mb-4 p-4 bg-white dark:bg-slate-800 rounded-lg border">
                            <div className="text-sm font-semibold text-muted-foreground mb-2">Your Answer:</div>
                            <div className="text-sm">
                              {renderStudentAnswer(question)}
                            </div>
                          </div>

                          {/* Correct Answer (only show if wrong or partial) */}
                          {!isCorrect && question.correctAnswer && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Correct Answer:</div>
                              <div className="text-sm">
                                {renderCorrectAnswer(question)}
                              </div>
                            </div>
                          )}

                          {/* Feedback */}
                          {question.feedback && (
                            <Alert className="mt-4">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{question.feedback}</AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Quiz taking screen - now with dynamic delivery modes
  // console.log('[StudentQuiz] Rendering quiz screen', {
  //   quizStarted,
  //   showResults,
  //   hasQuiz: !!quiz,
  //   deliveryMode: quiz?.deliveryMode,
  //   questionsCount: quiz?.questions?.length
  // })

  return (
    <StudentLayout>
      {/* ✅ ADD: Watermark overlay (subtle gray, student name only) */}
      {quizStarted && !quizCompleted && (
        <QuizWatermark
          screenshotDetected={screenshotDetected}
          studentName={studentName}
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/student/quiz")}
                className="hover:bg-white/50 dark:hover:bg-slate-800/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Quiz
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                {quiz.deliveryMode && (
                  <Badge variant="secondary" className="mt-1">
                    {quiz.deliveryMode.charAt(0).toUpperCase() + quiz.deliveryMode.slice(1)} Mode
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="text-center">
                <div
                  className={`text-xl sm:text-2xl font-bold ${
                    timeRemaining <= 300
                      ? "text-red-600 dark:text-red-400 animate-pulse"
                      : timeRemaining <= 600
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Time Left</div>
              </div>
            </div>
          </div>

          {quiz.deliveryMode === "form" && (
            <FormModeRenderer
              quiz={quiz}
              responses={responses}
              onResponseChange={handleResponseChange}
              onSubmit={handleSubmitQuiz}
              timeRemaining={timeRemaining}
              markQuestionViewed={backendAttempt.markQuestionViewed}
            />
          )}

          {quiz.deliveryMode === "hybrid" && (
            <HybridModeRenderer
              quiz={quiz}
              responses={responses}
              onResponseChange={handleResponseChange}
              onSubmit={handleSubmitQuiz}
              timeRemaining={timeRemaining}
              markQuestionViewed={backendAttempt.markQuestionViewed}
            />
          )}

          {/* Sequential mode (default) - render when deliveryMode is "sequential" or not set */}
          {(!quiz.deliveryMode || quiz.deliveryMode === "sequential") && (
            <SequentialModeRenderer
              quiz={quiz}
              currentQuestionIndex={currentQuestionIndex}
              responses={responses}
              onResponseChange={handleResponseChange}
              onNext={handleNextQuestion}
              onPrevious={handlePreviousQuestion}
              onSubmit={handleSubmitQuiz}
              timeRemaining={timeRemaining}
              markQuestionViewed={backendAttempt.markQuestionViewed}
            />
          )}
        </div>

        {/* ✅ ADD: Auto-save indicator (Phase 5) */}
        {backendAttempt.isSaving && quizStarted && !quizCompleted && (
          <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fadeIn z-50">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Saving...</span>
          </div>
        )}

        {/* ✅ ADD: Tab switch warning (Phase 5) */}
        {session.tabSwitchCount >= 3 && quizStarted && !quizCompleted && (
          <div className="fixed top-20 right-4 bg-amber-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fadeIn z-50 max-w-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Tab Switch Detected</p>
              <p className="text-xs opacity-90">
                You've switched tabs {session.tabSwitchCount} times. This activity is being monitored.
              </p>
            </div>
          </div>
        )}

        {quiz && (
          <TimeUpDialog
            isOpen={showTimeUpDialog}
            quiz={quiz}
            responses={responses}
            onConfirm={handleTimeUpSubmission}
          />
        )}

        {/* ✅ ADD: Fullscreen exit warning dialog */}
        <FullscreenWarningDialog
          isOpen={showFullscreenWarning}
          onClose={() => setShowFullscreenWarning(false)}
          onReturnToFullscreen={async () => {
            try {
              await flags.requestFullscreen()
              setShowFullscreenWarning(false)
            } catch (error) {
              console.error('[Quiz] Failed to return to fullscreen:', error)
            }
          }}
          exitCount={flags.fullscreenExitCount}
        />

        {/* ✅ ADD: Toast notifications */}
        <Toaster />
      </div>
    </StudentLayout>
  )
}
