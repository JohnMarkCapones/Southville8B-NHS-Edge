"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Calendar,
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
  Heart,
  Share2,
  Users,
  Facebook,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedButton } from "@/components/ui/animated-button"
import { newsApi, type CreateNewsDto } from "@/lib/api/endpoints/news"
import type { NewsCategory } from "@/types/news"
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
  excerpt: string // maps to description
  content: string // TipTap HTML
  contentJson: object | null // TipTap JSON
  categoryId: string
  tags: string[]
  featuredImage: string // maps to featuredImageUrl
  author: string
  coAuthors: string[]
  credits: string
}

// Will be loaded from backend
const categoriesMock: { value: string; label: string }[] = []

export default function CreateArticlePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currentTag, setCurrentTag] = useState("")
  const [currentCoAuthor, setCurrentCoAuthor] = useState("")
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")
  const [wordCount, setWordCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const [categories, setCategories] = useState<NewsCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [createdArticleId, setCreatedArticleId] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    excerpt: "",
    content: "",
    contentJson: null,
    categoryId: "",
    tags: [],
    featuredImage: "",
    author: "Student Name",
    coAuthors: [],
    credits: "",
  })

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

  // Load categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const cats = await newsApi.getCategories()
        setCategories(cats)
      } finally {
        setIsLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

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

  // Helper function to extract first image from HTML content
  const extractFirstImageFromContent = (htmlContent: string): string | null => {
    if (!htmlContent) return null

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent

    // Find first img tag
    const firstImg = tempDiv.querySelector('img')
    return firstImg ? firstImg.src : null
  }

  // Get featured image (explicit upload takes priority, otherwise use first content image)
  const getFeaturedImageUrl = (): string | undefined => {
    // Priority 1: Explicitly uploaded featured image
    if (formData.featuredImage) {
      return formData.featuredImage
    }

    // Priority 2: First image from content
    const firstContentImage = extractFirstImageFromContent(formData.content)
    if (firstContentImage) {
      return firstContentImage
    }

    // Priority 3: No image at all - undefined (let backend handle it)
    return undefined
  }

  const handleSaveDraft = async () => {
    // Validation
    if (!formData.title.trim() || !formData.content.trim() || !formData.contentJson) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in title and content before saving.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const dto: CreateNewsDto = {
        title: formData.title,
        description: formData.excerpt || undefined,
        articleHtml: formData.content,
        articleJson: formData.contentJson,
        categoryId: formData.categoryId && /[0-9a-fA-F-]{36}/.test(formData.categoryId) ? formData.categoryId : undefined,
        tags: formData.tags.length ? formData.tags : undefined,
        featuredImageUrl: getFeaturedImageUrl(),
        authorName: formData.author || undefined,
        coAuthorNames: formData.coAuthors.length ? formData.coAuthors : undefined,
        credits: formData.credits || undefined,
        reviewStatus: 'pending',
      }

      const created = await newsApi.createNews(dto)
      setCreatedArticleId(created.id)
      toast({ title: "Draft Saved", description: `Saved "${created.title}"` })
    } catch (error: any) {
      toast({ title: "Failed to save", description: error?.message || "Unexpected error", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitClick = () => {
    if (!formData.title || !formData.content || !formData.contentJson) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in title and content before submitting.",
        variant: "destructive",
      })
      return
    }
    setShowSubmitConfirm(true)
  }

  const handleConfirmSubmit = async () => {
    setShowSubmitConfirm(false)
    try {
      setIsLoading(true)

      // Ensure we have a draft created
      let articleId = createdArticleId
      if (!articleId) {
        const dto: CreateNewsDto = {
          title: formData.title,
          description: formData.excerpt || undefined,
          articleHtml: formData.content,
          articleJson: formData.contentJson,
          categoryId: formData.categoryId && /[0-9a-fA-F-]{36}/.test(formData.categoryId) ? formData.categoryId : undefined,
          tags: formData.tags.length ? formData.tags : undefined,
          featuredImageUrl: getFeaturedImageUrl(),
          authorName: formData.author || undefined,
          coAuthorNames: formData.coAuthors.length ? formData.coAuthors : undefined,
          credits: formData.credits || undefined,
          reviewStatus: 'pending',
        }
        const created = await newsApi.createNews(dto)
        articleId = created.id
        setCreatedArticleId(created.id)
      }

      // Submit for approval (pending)
      await newsApi.submit(articleId as string)

      toast({
        title: "Article Submitted",
        description: "Your article has been submitted for review (pending).",
      })
      setTimeout(() => {
        router.push("/student/publisher")
      }, 500)
    } catch (error: any) {
      toast({ title: "Failed to submit", description: error?.message || "Unexpected error", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return
    
    const file = files[0]
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive",
      })
      return
    }

    await handleImageUpload(file)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const file = files[0]
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive",
      })
      return
    }

    await handleImageUpload(file)
  }

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true)

      const result = await newsApi.uploadImage(file)

      // Use Cloudflare Images URL (cf_image_url) if available, otherwise fall back to url
      const imageUrl = result.cf_image_url || result.url

      setFormData((prev) => ({
        ...prev,
        featuredImage: imageUrl,
      }))

      toast({
        title: "Image uploaded",
        description: "Featured image has been uploaded successfully to Cloudflare",
      })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error?.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-3 sm:p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Enhanced Responsive Header */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Top Row: Back Button + Stats (Mobile) */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-white/80 dark:hover:bg-slate-800/80 group"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden xs:inline">Back</span>
              </Button>

              {/* Mobile Stats */}
              <div className="flex md:hidden items-center gap-2">
                <Badge variant="secondary" className="bg-white/80 dark:bg-slate-800/80 text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  {wordCount}
                </Badge>
                <Badge variant="secondary" className="bg-white/80 dark:bg-slate-800/80 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {readingTime}m
                </Badge>
              </div>
            </div>

            {/* Title Section */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Write New Article
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  Share your story with the school
                </p>
                {autoSaveStatus === "saving" && (
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 animate-pulse text-xs sm:text-sm">
                    <Clock className="h-3 w-3" />
                    Saving...
                  </span>
                )}
                {autoSaveStatus === "saved" && (
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1 text-xs sm:text-sm">
                    <CheckCircle2 className="h-3 w-3" />
                    Saved
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {/* Desktop Stats */}
              <div className="hidden md:flex items-center gap-3 mr-auto">
                <Badge variant="secondary" className="bg-white/80 dark:bg-slate-800/80">
                  <FileText className="h-3 w-3 mr-1" />
                  {wordCount} words
                </Badge>
                <Badge variant="secondary" className="bg-white/80 dark:bg-slate-800/80">
                  <Clock className="h-3 w-3 mr-1" />
                  {readingTime} min read
                </Badge>
              </div>

              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Save Draft</span>
                <span className="xs:hidden">Save</span>
              </Button>
              <Button
                onClick={handleSubmitClick}
                disabled={isLoading || !formData.title || !formData.content || !formData.contentJson}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Send className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Submit for Review</span>
                <span className="xs:hidden">Submit</span>
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "edit" | "preview")} className="w-full">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <TabsTrigger value="edit" className="flex items-center justify-center gap-2">Edit Article</TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center justify-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-0">
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

                  {/* Editor moved below to be full width */}
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
                      {formData.featuredImage ? (
                        <div className="space-y-4">
                          <div className="relative">
                            <img
                              src={formData.featuredImage}
                              alt="Featured image preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setFormData((prev) => ({ ...prev, featuredImage: "" }))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                              ✓ Image uploaded successfully
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('image-upload')?.click()}
                              disabled={isUploadingImage}
                            >
                              {isUploadingImage ? "Uploading..." : "Change Image"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById('image-upload')?.click()}
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                            isDragging
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-105"
                              : "border-slate-300 dark:border-slate-700 hover:border-blue-400"
                          } ${isUploadingImage ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {isUploadingImage ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                              <p className="text-sm text-blue-600 dark:text-blue-400">Uploading...</p>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {isDragging ? "Drop image here" : "Click to upload or drag and drop"}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                            </>
                          )}
                        </div>
                      )}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
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
                        <Label>Category</Label>
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                        >
                          <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                            <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category (optional)"} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
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
                          <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Review Process</p>
                          <p className="text-blue-700 dark:text-blue-300">
                            Your article will be reviewed by teachers before publication. You'll be notified once it's
                            approved or if changes are needed.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Full-width Editor */}
              <div className="mt-6">
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
                      onChange={(html, json) => setFormData((prev) => ({ ...prev, content: html, contentJson: json }))}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="min-h-screen bg-background">
                {/* Preview Notice */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">Preview Mode</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        This is how your article will appear to readers. Switch to Edit tab to make changes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Article Preview (mirrors teacher) */}
                <article className="container mx-auto px-4 max-w-4xl pb-24">
                  <header className="mb-12">
                    {/* Article Meta */}
                    <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {readingTime} min read
                      </div>
                      <div className="flex items-center gap-1">
                        <UserCircle className="w-4 h-4" />
                        {formData.author || "Author Name"}
                      </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 break-words">
                      {formData.title || "Article Title"}
                    </h1>

                    {formData.excerpt && (
                      <p className="text-xl sm:text-2xl leading-relaxed text-muted-foreground mb-8 break-words">
                        {formData.excerpt}
                      </p>
                    )}

                    {/* Article Stats & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />0 views
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />0 likes
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />0 comments
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <AnimatedButton variant="outline" size="sm">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </AnimatedButton>
                        <AnimatedButton variant="outline" size="sm">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Save
                        </AnimatedButton>
                      </div>
                    </div>

                    {/* Tags */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-8">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </header>

                  {/* Featured Image */}
                  {formData.featuredImage && (
                    <div className="relative mb-12">
                      <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                        <img src={formData.featuredImage || "/placeholder.svg"} alt={formData.title} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="mb-16">
                    {formData.content ? (
                      <div className="prose prose-lg dark:prose-invert max-w-none break-words" dangerouslySetInnerHTML={{ __html: formData.content }} />
                    ) : (
                      <p className="text-muted-foreground italic">No content yet. Start writing in the Edit tab.</p>
                    )}
                  </div>

                  {/* Co-Authors */}
                  {formData.coAuthors.length > 0 && (
                    <div className="mb-8 border-l-4 border-primary pl-6">
                      <h3 className="font-semibold mb-3 text-lg">Co-Authors</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.coAuthors.map((author) => (
                          <Badge key={author} variant="secondary" className="break-words max-w-full">
                            <UserCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="break-words">{author}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Credits */}
                  {formData.credits && (
                    <div className="mb-8 border-l-4 border-primary pl-6">
                      <h3 className="font-semibold mb-2 text-lg">Credits</h3>
                      <p className="text-sm text-muted-foreground break-words whitespace-normal">{formData.credits}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <footer className="border-t pt-8 mb-24">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <UserCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold break-words">{formData.author || "Author Name"}</h4>
                          <p className="text-sm text-muted-foreground">Article Author</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <AnimatedButton variant="outline" size="sm">
                          <Heart className="w-4 h-4 mr-2" />
                          Like
                        </AnimatedButton>
                        <AnimatedButton variant="outline" size="sm">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </AnimatedButton>
                      </div>
                    </div>
                  </footer>
                </article>

                {/* Facebook Preview Section */}
                <div className="mt-8 mb-8">
                  <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="text-center items-center">
                      <CardTitle className="flex items-center justify-center gap-2">
                        <Facebook className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Facebook Share Preview
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        This is how your article will look when shared on Facebook
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden max-w-2xl w-full">
                        {/* Facebook-style preview card */}
                        <div className="bg-white dark:bg-slate-800">
                          {/* Image */}
                          {getFeaturedImageUrl() ? (
                            <div className="w-full aspect-video bg-gray-100 dark:bg-slate-700 overflow-hidden">
                              <img
                                src={getFeaturedImageUrl()}
                                alt={formData.title || "Article preview"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-full aspect-video bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-gray-400 dark:text-slate-500" />
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="p-4">
                            {/* Site name */}
                            <div className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                              Southville 8B National High School
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2 line-clamp-2">
                              {formData.title || "Your article title will appear here"}
                            </h3>
                            
                            {/* Description */}
                            <p className="text-sm text-gray-600 dark:text-slate-300 line-clamp-3 mb-3">
                              {formData.excerpt || 
                                (formData.content 
                                  ? formData.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                                  : "Add a description to see how it will appear on Facebook")}
                            </p>
                            
                            {/* URL */}
                            <div className="text-xs text-gray-400 dark:text-slate-500">
                              southville8bnhs.com
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>
                      
                      {/* Tips */}
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          <strong>Tip:</strong> Facebook recommends images of at least 1200x630 pixels for best results. 
                          Make sure your title is clear and your description is engaging!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Submit Article for Review?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit <strong>"{formData.title}"</strong> for review? Teachers will review your
              article before it's published to the school news.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Submitting..." : "Submit for Review"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StudentLayout>
  )
}
