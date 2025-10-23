"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Save,
  Send,
  ImageIcon,
  Tag,
  BookOpen,
  Clock,
  FileText,
  CheckCircle2,
  Upload,
  X,
  AlertCircle,
  UserCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import StudentLayout from "@/components/student/student-layout"

interface ArticleFormData {
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  featuredImage: string
  author: string
  coAuthors: string[]
  credits: string
}

const categories = [
  { value: "academic", label: "Academic News" },
  { value: "events", label: "Events" },
  { value: "sports", label: "Sports" },
  { value: "announcements", label: "Announcements" },
]

// Mock data - TODO: Replace with actual database fetch
const mockArticle = {
  id: "1",
  title: "Science Fair Winners Announced",
  excerpt: "Congratulations to all participants in this year's science fair competition...",
  content: "<p>Full article content goes here with rich text formatting...</p>",
  category: "academic",
  tags: ["science", "competition", "students"],
  featuredImage: "",
  author: "Juan Dela Cruz",
  coAuthors: ["Maria Santos"],
  credits: "Photography by: Pedro Reyes",
}

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currentTag, setCurrentTag] = useState("")
  const [currentCoAuthor, setCurrentCoAuthor] = useState("")
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")
  const [wordCount, setWordCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [],
    featuredImage: "",
    author: "",
    coAuthors: [],
    credits: "",
  })

  useEffect(() => {
    // TODO: Fetch actual article data from database using articleId
    setFormData({
      title: mockArticle.title,
      excerpt: mockArticle.excerpt,
      content: mockArticle.content,
      category: mockArticle.category,
      tags: mockArticle.tags,
      featuredImage: mockArticle.featuredImage,
      author: mockArticle.author,
      coAuthors: mockArticle.coAuthors,
      credits: mockArticle.credits,
    })
  }, [articleId])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.content) {
        setAutoSaveStatus("saving")
        setTimeout(() => {
          setAutoSaveStatus("saved")
        }, 500)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [formData])

  useEffect(() => {
    const text = formData.content.replace(/<[^>]*>/g, "")
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    setWordCount(words.length)
    setReadingTime(Math.ceil(words.length / 200))
  }, [formData.content])

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }))
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const addCoAuthor = () => {
    if (currentCoAuthor.trim() && !formData.coAuthors.includes(currentCoAuthor.trim())) {
      setFormData((prev) => ({
        ...prev,
        coAuthors: [...prev.coAuthors, currentCoAuthor.trim()],
      }))
      setCurrentCoAuthor("")
    }
  }

  const removeCoAuthor = (authorToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      coAuthors: prev.coAuthors.filter((author) => author !== authorToRemove),
    }))
  }

  const handleSaveDraft = async () => {
    setIsLoading(true)
    // TODO: Update article in database
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast({
      title: "Draft Saved",
      description: "Your changes have been saved as a draft.",
    })
    setIsLoading(false)
  }

  const handleSubmitClick = () => {
    if (!formData.title || !formData.content || !formData.category) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in title, content, and category before submitting.",
        variant: "destructive",
      })
      return
    }
    setShowSubmitConfirm(true)
  }

  const handleConfirmSubmit = async () => {
    setShowSubmitConfirm(false)
    setIsLoading(true)
    // TODO: Update article in database
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast({
      title: "Article Updated",
      description: "Your article has been updated successfully.",
    })
    setTimeout(() => {
      router.push("/student/publisher")
    }, 500)
    setIsLoading(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // TODO: Implement actual image upload
    toast({
      title: "Image uploaded",
      description: "Featured image has been uploaded successfully",
    })
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-white/80 dark:hover:bg-slate-800/80"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Edit Article
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-slate-600 dark:text-slate-400">Update your article</p>
                  {autoSaveStatus === "saving" && (
                    <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 animate-pulse text-sm">
                      <Clock className="h-3 w-3" />
                      Saving...
                    </span>
                  )}
                  {autoSaveStatus === "saved" && (
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1 text-sm">
                      <CheckCircle2 className="h-3 w-3" />
                      Saved
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3 mr-4">
                <Badge variant="secondary" className="bg-white/80 dark:bg-slate-800/80">
                  <FileText className="h-3 w-3 mr-1" />
                  {wordCount} words
                </Badge>
                <Badge variant="secondary" className="bg-white/80 dark:bg-slate-800/80">
                  <Clock className="h-3 w-3 mr-1" />
                  {readingTime} min read
                </Badge>
              </div>
              <Button variant="outline" onClick={handleSaveDraft} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={handleSubmitClick}
                disabled={isLoading || !formData.title || !formData.content || !formData.category}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Update Article
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Article Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter article title..."
                      className="text-lg font-medium dark:bg-slate-800 dark:border-slate-700"
                    />
                    <p className={`text-xs ${formData.title.length > 60 ? "text-orange-600" : "text-slate-500"}`}>
                      {formData.title.length}/60 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Brief Description</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Brief description of your article..."
                      rows={3}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Author Information Card */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Author Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Author Name *</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                      placeholder="Enter your name..."
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Co-Authors</Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentCoAuthor}
                        onChange={(e) => setCurrentCoAuthor(e.target.value)}
                        placeholder="Add co-author..."
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCoAuthor())}
                        className="flex-1 dark:bg-slate-800 dark:border-slate-700"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addCoAuthor}>
                        Add
                      </Button>
                    </div>

                    {formData.coAuthors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.coAuthors.map((author) => (
                          <Badge
                            key={author}
                            variant="secondary"
                            className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 dark:bg-slate-800"
                            onClick={() => removeCoAuthor(author)}
                          >
                            {author} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits</Label>
                    <Textarea
                      id="credits"
                      value={formData.credits}
                      onChange={(e) => setFormData((prev) => ({ ...prev, credits: e.target.value }))}
                      placeholder="Additional credits (photographers, contributors, etc.)..."
                      rows={3}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Editor */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Article Content *
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TiptapEditor
                    content={formData.content}
                    onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    Featured Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                      isDragging
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-105"
                        : "border-slate-300 dark:border-slate-700 hover:border-blue-400"
                    }`}
                  >
                    <Upload className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {isDragging ? "Drop image here" : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    Category & Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="Add tag..."
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        className="flex-1 dark:bg-slate-800 dark:border-slate-700"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addTag}>
                        Add
                      </Button>
                    </div>

                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
                            onClick={() => removeTag(tag)}
                          >
                            {tag} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Update Notice</p>
                      <p className="text-blue-700 dark:text-blue-300">
                        Your updated article will be saved. Major changes may require teacher review before
                        republication.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Update Article?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update <strong>"{formData.title}"</strong>? Your changes will be saved and the
              article will be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Updating..." : "Update Article"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StudentLayout>
  )
}
