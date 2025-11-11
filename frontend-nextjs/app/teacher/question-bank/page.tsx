"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { questionBankApi } from "@/lib/api/endpoints/question-bank"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Filter,
  X,
  Check,
  AlertCircle,
  Database
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { QuizImageUploader, type QuizImageData } from "@/components/quiz/QuizImageUploader"

interface QuestionBankItem {
  id: string
  question_text: string
  question_type: string
  difficulty: string
  default_points: number
  tags: string[]
  subject_id?: string
  created_at: string
  choices?: any
  correct_answer?: any
  // ✅ Image support fields
  question_image_id?: string
  question_image_url?: string
  question_image_file_size?: number
  question_image_mime_type?: string
  choices_image_data?: Record<string, any>
}

interface QuestionFormData {
  questionText: string
  questionType: string
  difficulty: string
  defaultPoints: number
  tags: string[]
  subjectId?: string
  choices?: { text: string; is_correct: boolean }[]
  correctAnswer?: any
  // ✅ Image support fields
  questionImageId?: string
  questionImageUrl?: string
  questionImageFileSize?: number
  questionImageMimeType?: string
  choicesImageData?: Record<string, any>
}

export default function QuestionBankPage() {
  const { toast } = useToast()

  // State
  const [questions, setQuestions] = useState<QuestionBankItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionBankItem | null>(null)

  // Form state
  const [formData, setFormData] = useState<QuestionFormData>({
    questionText: "",
    questionType: "multiple_choice",
    difficulty: "medium",
    defaultPoints: 1,
    tags: [],
    choices: [
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ],
  })
  const [tagInput, setTagInput] = useState("")

  // Load questions
  useEffect(() => {
    loadQuestions()
  }, [searchQuery, filterType, filterDifficulty])

  const loadQuestions = async () => {
    setIsLoading(true)
    try {
      const response = await questionBankApi.getQuestions({
        page: 1,
        limit: 100,
        search: searchQuery || undefined,
        questionType: filterType !== "all" ? filterType : undefined,
        difficulty: filterDifficulty !== "all" ? filterDifficulty : undefined,
      })
      setQuestions(response.data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateQuestion = async () => {
    try {
      await questionBankApi.createQuestion({
        questionText: formData.questionText,
        questionType: formData.questionType,
        difficulty: formData.difficulty,
        defaultPoints: formData.defaultPoints,
        tags: formData.tags,
        choices: formData.choices,
        correctAnswer: formData.correctAnswer,
        // ✅ Add image fields
        questionImageId: formData.questionImageId,
        questionImageUrl: formData.questionImageUrl,
        questionImageFileSize: formData.questionImageFileSize,
        questionImageMimeType: formData.questionImageMimeType,
        choicesImageData: formData.choicesImageData,
      })

      toast({
        title: "Success",
        description: "Question created successfully",
        variant: "success",
      })

      setShowCreateDialog(false)
      resetForm()
      loadQuestions()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create question",
        variant: "destructive",
      })
    }
  }

  const handleEditQuestion = async () => {
    if (!selectedQuestion) return

    try {
      await questionBankApi.updateQuestion(selectedQuestion.id, {
        questionText: formData.questionText,
        questionType: formData.questionType,
        difficulty: formData.difficulty,
        defaultPoints: formData.defaultPoints,
        tags: formData.tags,
        choices: formData.choices,
        correctAnswer: formData.correctAnswer,
        // ✅ Add image fields
        questionImageId: formData.questionImageId,
        questionImageUrl: formData.questionImageUrl,
        questionImageFileSize: formData.questionImageFileSize,
        questionImageMimeType: formData.questionImageMimeType,
        choicesImageData: formData.choicesImageData,
      })

      toast({
        title: "Success",
        description: "Question updated successfully",
        variant: "success",
      })

      setShowEditDialog(false)
      setSelectedQuestion(null)
      resetForm()
      loadQuestions()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update question",
        variant: "destructive",
      })
    }
  }

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return

    try {
      await questionBankApi.deleteQuestion(selectedQuestion.id)

      toast({
        title: "Success",
        description: "Question deleted successfully",
        variant: "success",
      })

      setShowDeleteDialog(false)
      setSelectedQuestion(null)
      loadQuestions()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete question",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (question: QuestionBankItem) => {
    setSelectedQuestion(question)
    setFormData({
      questionText: question.question_text,
      questionType: question.question_type,
      difficulty: question.difficulty || "medium",
      defaultPoints: question.default_points,
      tags: question.tags || [],
      choices: question.choices || [],
      // ✅ Add image fields
      questionImageId: question.question_image_id,
      questionImageUrl: question.question_image_url,
      questionImageFileSize: question.question_image_file_size,
      questionImageMimeType: question.question_image_mime_type,
      choicesImageData: question.choices_image_data,
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (question: QuestionBankItem) => {
    setSelectedQuestion(question)
    setShowDeleteDialog(true)
  }

  const resetForm = () => {
    setFormData({
      questionText: "",
      questionType: "multiple_choice",
      difficulty: "medium",
      defaultPoints: 1,
      tags: [],
      choices: [
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ],
    })
    setTagInput("")
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  const addChoice = () => {
    setFormData({
      ...formData,
      choices: [...(formData.choices || []), { text: "", is_correct: false }],
    })
  }

  const removeChoice = (index: number) => {
    const newChoices = formData.choices?.filter((_, i) => i !== index) || []
    setFormData({
      ...formData,
      choices: newChoices,
    })
  }

  const updateChoice = (index: number, field: "text" | "is_correct", value: any) => {
    const newChoices = [...(formData.choices || [])]
    newChoices[index] = {
      ...newChoices[index],
      [field]: value,
    }
    setFormData({
      ...formData,
      choices: newChoices,
    })
  }

  const updateChoiceImage = (index: number, imageData: QuizImageData | null) => {
    const newChoicesImageData = { ...(formData.choicesImageData || {}) }

    if (imageData) {
      newChoicesImageData[index] = {
        imageId: imageData.imageId,
        imageUrl: imageData.imageUrl,
        fileSize: imageData.fileSize,
        mimeType: imageData.mimeType,
      }
    } else {
      delete newChoicesImageData[index]
    }

    setFormData({
      ...formData,
      choicesImageData: newChoicesImageData,
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "hard":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
    }
  }

  const formatQuestionType = (type: string) => {
    const typeMap: Record<string, string> = {
      multiple_choice: "Multiple Choice",
      true_false: "True/False",
      short_answer: "Short Answer",
      essay: "Essay",
      fill_in_blank: "Fill in the Blank",
      matching: "Matching",
      ordering: "Ordering",
    }
    return typeMap[type] || type
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Question Bank</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your reusable question templates
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Question
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search questions, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                  <SelectItem value="fill_in_blank">Fill in the Blank</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No Questions Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Create your first reusable question template
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Question
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questions.map((question) => (
              <Card key={question.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-medium line-clamp-2">
                      {question.question_text}
                    </CardTitle>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(question)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(question)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Question Image Thumbnail */}
                  {question.question_image_url && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img
                        src={question.question_image_url}
                        alt="Question preview"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{formatQuestionType(question.question_type)}</Badge>
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                    <Badge variant="secondary">{question.default_points} pts</Badge>
                  </div>
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {question.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Created {new Date(question.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false)
          setShowEditDialog(false)
          resetForm()
          setSelectedQuestion(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {showEditDialog ? "Edit Question" : "Create Question"}
            </DialogTitle>
            <DialogDescription>
              {showEditDialog
                ? "Update your question template"
                : "Create a reusable question for your question bank"}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {/* Question Text */}
              <div className="space-y-2">
                <Label>Question Text *</Label>
                <Textarea
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Enter your question..."
                  rows={3}
                />
              </div>

              {/* Question Image */}
              <QuizImageUploader
                value={formData.questionImageUrl}
                onChange={(imageData) => {
                  if (imageData) {
                    setFormData({
                      ...formData,
                      questionImageId: imageData.imageId,
                      questionImageUrl: imageData.imageUrl,
                      questionImageFileSize: imageData.fileSize,
                      questionImageMimeType: imageData.mimeType,
                    })
                  } else {
                    setFormData({
                      ...formData,
                      questionImageId: undefined,
                      questionImageUrl: undefined,
                      questionImageFileSize: undefined,
                      questionImageMimeType: undefined,
                    })
                  }
                }}
                label="Question Image (Optional)"
                variant="question"
              />

              {/* Question Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Question Type *</Label>
                  <Select
                    value={formData.questionType}
                    onValueChange={(value) => setFormData({ ...formData, questionType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True/False</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                      <SelectItem value="fill_in_blank">Fill in the Blank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty *</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Points */}
              <div className="space-y-2">
                <Label>Default Points *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.defaultPoints}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultPoints: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add a tag..."
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Choices (for MCQ) */}
              {formData.questionType === "multiple_choice" && (
                <div className="space-y-3">
                  <Label>Answer Choices</Label>
                  {formData.choices?.map((choice, index) => (
                    <div key={index} className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex gap-2 items-center">
                        <Input
                          value={choice.text}
                          onChange={(e) => updateChoice(index, "text", e.target.value)}
                          placeholder={`Choice ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant={choice.is_correct ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateChoice(index, "is_correct", !choice.is_correct)}
                          className="shrink-0"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        {(formData.choices?.length || 0) > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeChoice(index)}
                            className="shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {/* Choice Image Uploader */}
                      <QuizImageUploader
                        value={formData.choicesImageData?.[index]?.imageUrl}
                        onChange={(imageData) => updateChoiceImage(index, imageData)}
                        label={`Choice ${index + 1} Image (Optional)`}
                        variant="choice"
                      />
                    </div>
                  ))}
                  <Button type="button" onClick={addChoice} variant="outline" size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Choice
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false)
                setShowEditDialog(false)
                resetForm()
                setSelectedQuestion(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={showEditDialog ? handleEditQuestion : handleCreateQuestion}
              disabled={!formData.questionText.trim()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {showEditDialog ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Delete Question
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <Card className="bg-slate-50 dark:bg-slate-900">
              <CardContent className="pt-6">
                <p className="font-medium text-slate-900 dark:text-white mb-2">
                  {selectedQuestion.question_text}
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">{formatQuestionType(selectedQuestion.question_type)}</Badge>
                  <Badge className={getDifficultyColor(selectedQuestion.difficulty)}>
                    {selectedQuestion.difficulty}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteQuestion}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
