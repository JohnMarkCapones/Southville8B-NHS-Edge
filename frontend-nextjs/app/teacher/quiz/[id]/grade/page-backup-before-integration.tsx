"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Award,
  FileText,
  Save,
  AlertCircle,
} from "lucide-react"
import { Slider } from "@/components/ui/slider"

// TODO: DATABASE - Replace with actual database queries
// Example: const quiz = await db.query('SELECT * FROM quizzes WHERE id = ?', [quizId])
// Example: const submissions = await db.query('SELECT * FROM quiz_submissions WHERE quiz_id = ? AND grading_status = "pending_review"', [quizId])

// Mock quiz data
const quizData = {
  id: "QZ001",
  title: "Photosynthesis Test",
  subject: "Science",
  grade: "Grade 8",
  questions: [
    {
      id: 1,
      type: "multiple-choice",
      question: "What is the primary pigment in photosynthesis?",
      correctAnswer: "Chlorophyll",
      points: 1,
    },
    {
      id: 2,
      type: "short-answer",
      question: "Explain the process of photosynthesis in 2-3 sentences.",
      maxPoints: 5,
      gradingRubric: "• Clear explanation (2 pts)\n• Scientific accuracy (2 pts)\n• Proper grammar (1 pt)",
      sampleAnswers: ["Photosynthesis is the process where plants convert sunlight into energy using chlorophyll."],
      points: 5,
    },
    {
      id: 3,
      type: "long-answer",
      question: "Describe the importance of photosynthesis to life on Earth and explain its role in the carbon cycle.",
      maxPoints: 10,
      gradingRubric:
        "• Importance explained (3 pts)\n• Carbon cycle connection (4 pts)\n• Examples provided (2 pts)\n• Writing quality (1 pt)",
      points: 10,
    },
  ],
}

// Mock student submissions
const mockSubmissions = [
  {
    id: "SUB001",
    studentId: "ST001",
    studentName: "John Doe",
    studentAvatar: "/placeholder.svg?height=40&width=40",
    submittedAt: "2024-01-20 14:30",
    timeSpent: "28m",
    answers: [
      {
        questionId: 1,
        type: "multiple-choice",
        answer: "Chlorophyll",
        isCorrect: true,
        points: 1,
        maxPoints: 1,
      },
      {
        questionId: 2,
        type: "short-answer",
        answer:
          "Photosynthesis is the process where plants use sunlight, water, and carbon dioxide to create glucose and oxygen. This process is essential for plant growth and provides oxygen for other organisms.",
        isCorrect: null, // Needs grading
        points: null,
        maxPoints: 5,
        gradingStatus: "pending",
      },
      {
        questionId: 3,
        type: "long-answer",
        answer:
          "Photosynthesis is crucial to life on Earth because it produces oxygen that all aerobic organisms need to survive. It also forms the base of most food chains by converting solar energy into chemical energy stored in glucose. In the carbon cycle, photosynthesis removes CO2 from the atmosphere and stores it in plant biomass, helping regulate atmospheric carbon levels. For example, forests act as carbon sinks through photosynthesis. Without photosynthesis, there would be no oxygen in the atmosphere and no food for herbivores and carnivores.",
        isCorrect: null,
        points: null,
        maxPoints: 10,
        gradingStatus: "pending",
      },
    ],
    totalScore: 1, // Only auto-graded questions
    maxScore: 16,
    gradingStatus: "pending", // pending, graded
  },
  {
    id: "SUB002",
    studentId: "ST002",
    studentName: "Jane Smith",
    studentAvatar: "/placeholder.svg?height=40&width=40",
    submittedAt: "2024-01-20 15:45",
    timeSpent: "32m",
    answers: [
      {
        questionId: 1,
        type: "multiple-choice",
        answer: "Chlorophyll",
        isCorrect: true,
        points: 1,
        maxPoints: 1,
      },
      {
        questionId: 2,
        type: "short-answer",
        answer: "Plants make food using sunlight. They take in CO2 and release oxygen.",
        isCorrect: null,
        points: null,
        maxPoints: 5,
        gradingStatus: "pending",
      },
      {
        questionId: 3,
        type: "long-answer",
        answer:
          "Photosynthesis is important because it makes oxygen. Plants need it to grow. It also helps with the carbon cycle by using carbon dioxide.",
        isCorrect: null,
        points: null,
        maxPoints: 10,
        gradingStatus: "pending",
      },
    ],
    totalScore: 1,
    maxScore: 16,
    gradingStatus: "pending",
  },
  {
    id: "SUB003",
    studentId: "ST003",
    studentName: "Mike Johnson",
    studentAvatar: "/placeholder.svg?height=40&width=40",
    submittedAt: "2024-01-20 16:20",
    timeSpent: "25m",
    answers: [
      {
        questionId: 1,
        type: "multiple-choice",
        answer: "Carotene",
        isCorrect: false,
        points: 0,
        maxPoints: 1,
      },
      {
        questionId: 2,
        type: "short-answer",
        answer:
          "Photosynthesis converts light energy into chemical energy. Plants absorb sunlight through chlorophyll and use it to transform water and CO2 into glucose and oxygen through a series of chemical reactions.",
        isCorrect: null,
        points: null,
        maxPoints: 5,
        gradingStatus: "pending",
      },
      {
        questionId: 3,
        type: "long-answer",
        answer:
          "Photosynthesis is the foundation of life on Earth. It produces oxygen through the light-dependent reactions, which is essential for aerobic respiration in animals and humans. The process also creates glucose, which serves as the primary energy source for plants and, indirectly, for all heterotrophs in the food web. In terms of the carbon cycle, photosynthesis acts as a carbon sink by removing atmospheric CO2 and incorporating it into organic compounds. This helps mitigate climate change by reducing greenhouse gases. Examples include rainforests absorbing massive amounts of CO2 and phytoplankton in oceans performing about 50% of global photosynthesis.",
        isCorrect: null,
        points: null,
        maxPoints: 10,
        gradingStatus: "pending",
      },
    ],
    totalScore: 0,
    maxScore: 16,
    gradingStatus: "pending",
  },
]

export default function GradeQuizPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0)
  const [submissions, setSubmissions] = useState(mockSubmissions)
  const [isSaving, setIsSaving] = useState(false)

  const currentSubmission = submissions[currentStudentIndex]
  const pendingSubmissions = submissions.filter((s) => s.gradingStatus === "pending")
  const totalStudents = submissions.length
  const gradedCount = submissions.filter((s) => s.gradingStatus === "graded").length

  // Handle score change for essay questions
  const handleScoreChange = (questionId: number, score: number) => {
    setSubmissions((prev) =>
      prev.map((sub, idx) =>
        idx === currentStudentIndex
          ? {
              ...sub,
              answers: sub.answers.map((ans) => (ans.questionId === questionId ? { ...ans, points: score } : ans)),
            }
          : sub,
      ),
    )
  }

  // Handle feedback change
  const handleFeedbackChange = (questionId: number, feedback: string) => {
    setSubmissions((prev) =>
      prev.map((sub, idx) =>
        idx === currentStudentIndex
          ? {
              ...sub,
              answers: sub.answers.map((ans) => (ans.questionId === questionId ? { ...ans, feedback } : ans)),
            }
          : sub,
      ),
    )
  }

  // Save and move to next student
  const handleSaveAndNext = async () => {
    setIsSaving(true)

    // TODO: DATABASE - Save grades to database
    // Example:
    // for (const answer of currentSubmission.answers) {
    //   if (answer.type === 'short-answer' || answer.type === 'long-answer') {
    //     await db.query(
    //       'UPDATE student_answers SET essay_score = ?, essay_feedback = ?, graded_by = ?, graded_at = NOW(), grading_status = "graded" WHERE submission_id = ? AND question_id = ?',
    //       [answer.points, answer.feedback, teacherId, currentSubmission.id, answer.questionId]
    //     )
    //   }
    // }
    // await db.query('UPDATE quiz_submissions SET grading_status = "graded", total_score = ? WHERE id = ?', [totalScore, currentSubmission.id])

    // Calculate total score
    const totalScore = currentSubmission.answers.reduce((sum, ans) => sum + (ans.points || 0), 0)

    // Update submission status
    setSubmissions((prev) =>
      prev.map((sub, idx) =>
        idx === currentStudentIndex
          ? {
              ...sub,
              totalScore,
              gradingStatus: "graded",
            }
          : sub,
      ),
    )

    setTimeout(() => {
      setIsSaving(false)
      // Move to next student if available
      if (currentStudentIndex < totalStudents - 1) {
        setCurrentStudentIndex(currentStudentIndex + 1)
      }
    }, 500)
  }

  // Navigate between students
  const handlePrevious = () => {
    if (currentStudentIndex > 0) {
      setCurrentStudentIndex(currentStudentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentStudentIndex < totalStudents - 1) {
      setCurrentStudentIndex(currentStudentIndex + 1)
    }
  }

  // Check if all essay questions are graded
  const allEssaysGraded = currentSubmission?.answers
    .filter((ans) => ans.type === "short-answer" || ans.type === "long-answer")
    .every((ans) => ans.points !== null && ans.points !== undefined)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800 p-6 lg:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-white hover:bg-white/20 backdrop-blur-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">{quizData.title}</h1>
              <p className="text-blue-100 text-lg">Grade Essay Questions</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Progress</p>
              <p className="text-3xl font-bold">
                {gradedCount}/{totalStudents}
              </p>
              <Progress value={(gradedCount / totalStudents) * 100} className="mt-2 h-2 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentStudentIndex === 0}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous Student
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">Grading Student</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentStudentIndex + 1} of {totalStudents}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentStudentIndex === totalStudents - 1}
            >
              Next Student
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Info */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={currentSubmission?.studentAvatar || "/placeholder.svg"}
                  alt={currentSubmission?.studentName}
                />
                <AvatarFallback>
                  {currentSubmission?.studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl text-slate-900 dark:text-white">
                  {currentSubmission?.studentName}
                </CardTitle>
                <CardDescription>Submitted on {currentSubmission?.submittedAt}</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-slate-400">Current Score</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {currentSubmission?.totalScore}/{currentSubmission?.maxScore}
              </p>
              <Badge
                variant="secondary"
                className={
                  currentSubmission?.gradingStatus === "graded"
                    ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                    : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                }
              >
                {currentSubmission?.gradingStatus === "graded" ? "Graded" : "Pending"}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grading Interface */}
      <div className="space-y-6">
        {currentSubmission?.answers.map((answer, index) => {
          const question = quizData.questions.find((q) => q.id === answer.questionId)

          // Skip auto-graded questions
          if (answer.type !== "short-answer" && answer.type !== "long-answer") {
            return (
              <Card
                key={answer.questionId}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Question {answer.questionId}</CardTitle>
                    <Badge
                      variant="secondary"
                      className={
                        answer.isCorrect
                          ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                      }
                    >
                      {answer.isCorrect ? "Correct" : "Incorrect"} - {answer.points}/{answer.maxPoints} pts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 dark:text-slate-300 mb-3">{question?.question}</p>
                  <div className="flex items-center gap-2">
                    {answer.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <p className="text-slate-600 dark:text-slate-400">Auto-graded</p>
                  </div>
                </CardContent>
              </Card>
            )
          }

          // Essay questions that need grading
          return (
            <Card
              key={answer.questionId}
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-slate-900 dark:text-white">
                      Question {answer.questionId}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-2">
                      {answer.type === "short-answer" ? "Short Answer" : "Long Answer"} - {answer.maxPoints} points
                    </Badge>
                  </div>
                  {answer.points !== null && answer.points !== undefined && (
                    <div className="text-right">
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {answer.points}/{answer.maxPoints}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Points Assigned</p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Question</Label>
                  <p className="text-slate-900 dark:text-white text-lg">{question?.question}</p>
                </div>

                {/* Grading Rubric */}
                {question?.gradingRubric && (
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <Label className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Grading Rubric
                    </Label>
                    <pre className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-wrap font-sans">
                      {question.gradingRubric}
                    </pre>
                  </div>
                )}

                {/* Student's Answer */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Student's Answer
                  </Label>
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{answer.answer}</p>
                  </div>
                </div>

                {/* Grading Section */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-800 space-y-6">
                  <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Grade this Answer
                  </h3>

                  {/* Score Input */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                        Assign Points
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max={answer.maxPoints}
                          value={answer.points ?? ""}
                          onChange={(e) => {
                            const value = Number.parseFloat(e.target.value)
                            if (!isNaN(value) && value >= 0 && value <= answer.maxPoints) {
                              handleScoreChange(answer.questionId, value)
                            }
                          }}
                          className="w-20 text-center text-lg font-bold"
                        />
                        <span className="text-purple-700 dark:text-purple-300 font-semibold">/ {answer.maxPoints}</span>
                      </div>
                    </div>

                    {/* Slider */}
                    <Slider
                      value={[answer.points ?? 0]}
                      onValueChange={([value]) => handleScoreChange(answer.questionId, value)}
                      max={answer.maxPoints}
                      step={0.5}
                      className="w-full"
                    />

                    {/* Quick Score Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        0,
                        Math.floor(answer.maxPoints * 0.25),
                        Math.floor(answer.maxPoints * 0.5),
                        Math.floor(answer.maxPoints * 0.75),
                        answer.maxPoints,
                      ].map((score) => (
                        <Button
                          key={score}
                          variant="outline"
                          size="sm"
                          onClick={() => handleScoreChange(answer.questionId, score)}
                          className={`${
                            answer.points === score
                              ? "bg-purple-600 text-white border-purple-600"
                              : "hover:bg-purple-100 dark:hover:bg-purple-900/30"
                          }`}
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                      Feedback for Student
                    </Label>
                    <Textarea
                      placeholder="Provide constructive feedback..."
                      value={answer.feedback || ""}
                      onChange={(e) => handleFeedbackChange(answer.questionId, e.target.value)}
                      className="min-h-[100px] bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Save Button */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg sticky bottom-4">
        <CardContent className="p-6">
          {!allEssaysGraded && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Please grade all essay questions before saving
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Score</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {currentSubmission?.answers.reduce((sum, ans) => sum + (ans.points || 0), 0)}/
                {currentSubmission?.maxScore}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSaveAndNext} disabled={!allEssaysGraded || isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={handleSaveAndNext}
                disabled={!allEssaysGraded || isSaving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSaving ? (
                  "Saving..."
                ) : currentStudentIndex < totalStudents - 1 ? (
                  <>
                    Save & Next Student
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Save & Finish
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
