"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  Calendar,
  ImageIcon,
  Tag,
  Globe,
  Users,
  GraduationCap,
  BookOpen,
  Clock,
  FileText,
  CheckCircle2,
  Upload,
  X,
  UserCircle,
  CalendarX,
  CheckCircle,
  Edit3,
  Heart,
  Share2,
  AlertTriangle,
  Facebook,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedButton } from "@/components/ui/animated-button"
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
import { useCreateNews } from "@/hooks/useNewsMutations"
import type { CreateNewsDto } from "@/lib/api/endpoints/news"
import { newsApi } from "@/lib/api/endpoints/news"
import type { NewsCategory } from "@/types/news"

interface ArticleFormData {
  title: string
  description: string
  articleHtml: string
  articleJson: object | null
  categoryId: string
  tags: string[]
  featuredImageUrl: string
  visibility: "public" | "students" | "teachers" | "private"
  scheduledDate: string
  coAuthorNames: string[]
  // UI-only fields (not sent to backend)
  slug?: string
  author?: string
  credits?: string
  expirationDate?: string
}

const visibilityOptions = [
  { value: "public", label: "Public", icon: Globe, description: "Visible to everyone" },
  { value: "students", label: "Students Only", icon: GraduationCap, description: "Only students can view" },
  { value: "teachers", label: "Teachers Only", icon: Users, description: "Only teachers can view" },
  { value: "private", label: "Private", icon: BookOpen, description: "Admin and staff only" },
]

export default function CreateArticlePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { mutateAsync: createNews, isPending } = useCreateNews()
  const [currentTag, setCurrentTag] = useState("")
  const [currentCoAuthor, setCurrentCoAuthor] = useState("")
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const [categories, setCategories] = useState<NewsCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [showNoImageWarning, setShowNoImageWarning] = useState(false)
  const [pendingSaveAsDraft, setPendingSaveAsDraft] = useState(false)
  const [hasDateError, setHasDateError] = useState(false)

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    description: "",
    articleHtml: "",
    articleJson: null,
    categoryId: "",
    tags: [],
    featuredImageUrl: "",
    visibility: "public",
    scheduledDate: "",
    coAuthorNames: [],
    // UI-only fields (not sent to backend)
    slug: "",
    author: "",
    credits: "",
    expirationDate: "",
  })

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const categoriesData = await newsApi.getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error('[CreateArticlePage] Error fetching categories:', error)
        toast({
          title: "⚠️ Failed to load categories",
          description: "Categories could not be loaded. You can still create the article without a category.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [toast])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.articleHtml) {
        setAutoSaveStatus("saving")
        setTimeout(() => {
          setAutoSaveStatus("saved")
        }, 500)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [formData])

  useEffect(() => {
    const text = formData.articleHtml.replace(/<[^>]*>/g, "")
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    setWordCount(words.length)
    setCharCount(text.length)
    setReadingTime(Math.ceil(words.length / 200))
  }, [formData.articleHtml])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }))
  }

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
    if (currentCoAuthor.trim() && !formData.coAuthorNames.includes(currentCoAuthor.trim())) {
      setFormData((prev) => ({
        ...prev,
        coAuthorNames: [...prev.coAuthorNames, currentCoAuthor.trim()],
      }))
      setCurrentCoAuthor("")
    }
  }

  const removeCoAuthor = (authorToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      coAuthorNames: prev.coAuthorNames.filter((author) => author !== authorToRemove),
    }))
  }

  // Check if article has any images (featured image or images in content)
  const hasImages = () => {
    // Check for featured image
    if (formData.featuredImageUrl && formData.featuredImageUrl.trim()) {
      return true
    }
    // Check for images in HTML content
    const imgRegex = /<img[^>]+src=[\"']([^\"'>]+)[\"']/i
    return imgRegex.test(formData.articleHtml)
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
    if (formData.featuredImageUrl) {
      return formData.featuredImageUrl
    }

    // Priority 2: First image from content
    const firstContentImage = extractFirstImageFromContent(formData.articleHtml)
    if (firstContentImage) {
      return firstContentImage
    }

    // Priority 3: No image at all - undefined (let backend handle it)
    return undefined
  }

  const handleSave = async (saveAsDraft: boolean = true) => {
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "⚠️ Validation Error",
        description: "Please enter an article title",
        variant: "destructive",
      })
      return
    }

    if (!formData.articleHtml.trim() || !formData.articleJson) {
      toast({
        title: "⚠️ Validation Error",
        description: "Please write some content for your article",
        variant: "destructive",
      })
      return
    }

    // Validate expiration date vs scheduled date
    if (formData.scheduledDate && formData.expirationDate) {
      const scheduledTime = new Date(formData.scheduledDate).getTime()
      const expirationTime = new Date(formData.expirationDate).getTime()

      if (expirationTime < scheduledTime) {
        setHasDateError(true)
        toast({
          title: "⚠️ Invalid Date Range",
          description: "Expiration date cannot be before the scheduled publication date. Please adjust the dates.",
          variant: "destructive",
        })
        return
      }
    }

    // Clear date error if validation passes
    setHasDateError(false)

    // Check for images - show warning but allow to proceed
    if (!hasImages()) {
      setPendingSaveAsDraft(saveAsDraft)
      setShowNoImageWarning(true)
      return
    }

    // Proceed with save
    await performSave(saveAsDraft)
  }

  const performSave = async (saveAsDraft: boolean = true) => {
    try {
      // Build the DTO matching backend expectations
      const createDto: CreateNewsDto = {
        title: formData.title,
        description: formData.description || undefined,
        articleJson: formData.articleJson,
        articleHtml: formData.articleHtml,
        // Only send categoryId if it's a valid UUID (not empty string or mock value)
        categoryId: formData.categoryId && formData.categoryId.length > 0 &&
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formData.categoryId)
                    ? formData.categoryId : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        visibility: formData.visibility,
        featuredImageUrl: getFeaturedImageUrl(),
        coAuthorNames: formData.coAuthorNames.length > 0 ? formData.coAuthorNames : undefined,
        scheduledDate: formData.scheduledDate || undefined,
        authorName: formData.author || undefined,
        credits: formData.credits || undefined,
      }

      // Call the real API
      const newArticle = await createNews(createDto)

      // Success toast
      if (saveAsDraft) {
        toast({
          title: "✅ Draft Saved Successfully",
          description: (
            <div className="space-y-2">
              <p className="font-medium text-foreground">
                "{newArticle.title}" has been saved as a draft.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  <FileText className="w-3 h-3" />
                </div>
                <span>{wordCount} words</span>
                <span>•</span>
                <span>Last saved: {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-500/10 px-2 py-1 rounded-md w-fit">
                <CheckCircle className="w-3 h-3" />
                <span>Continue editing anytime</span>
              </div>
            </div>
          ),
          variant: "default",
          duration: 5000,
          className: "border-gray-500/20 bg-gray-500/5 backdrop-blur-md",
        })
      } else {
        toast({
          title: "✅ Article Created Successfully",
          description: (
            <div className="space-y-2">
              <p className="font-medium text-foreground">
                "{newArticle.title}" has been created and saved.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  <FileText className="w-3 h-3" />
                </div>
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{readingTime} min read</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-md w-fit">
                <CheckCircle className="w-3 h-3" />
                <span>Article created successfully</span>
              </div>
            </div>
          ),
          variant: "default",
          duration: 6000,
          className: "border-green-500/20 bg-green-500/5 backdrop-blur-md",
        })
      }

      // Navigate back to news list
      router.push("/teacher/news")
    } catch (error: any) {
      console.error("Error creating article:", error)
      toast({
        title: "❌ Failed to Create Article",
        description: error?.message || "An error occurred while creating the article. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const handlePreview = () => {
    // window.open("/preview/article", "_blank") // Removed this as tabs handle preview now
    setActiveTab("preview")
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 transition-colors duration-300">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Create New Article</h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-gray-600 dark:text-gray-400">Write and publish school news articles</p>
                <div className="flex items-center gap-2 text-sm">
                  {autoSaveStatus === "saving" && (
                    <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 animate-pulse">
                      <Clock className="h-3 w-3" />
                      Saving...
                    </span>
                  )}
                  {autoSaveStatus === "saved" && (
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1 animate-in fade-in duration-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Saved
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 mr-4">
              <Badge
                variant="secondary"
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm transition-all duration-200 hover:scale-105"
              >
                <FileText className="h-3 w-3 mr-1" />
                {wordCount} words
              </Badge>
              <Badge
                variant="secondary"
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm transition-all duration-200 hover:scale-105"
              >
                <Clock className="h-3 w-3 mr-1" />
                {readingTime} min read
              </Badge>
            </div>
            <Button
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={isPending}
              className="hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200 hover:scale-105"
            >
              <Save className="h-4 w-4 mr-2" />
              {isPending ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={isPending || !formData.title || !formData.articleHtml}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <Send className="h-4 w-4 mr-2" />
              {isPending ? "Creating..." : "Create Article"}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "edit" | "preview")} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <TabsTrigger value="edit" className="flex items-center justify-center gap-2">
              <Edit3 className="h-4 w-4" />
              Edit Article
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center justify-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Article Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium dark:text-gray-200">
                        Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Enter article title..."
                        className="text-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-400"
                      />
                      <p
                        className={`text-xs transition-colors ${
                          formData.title.length > 60
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {formData.title.length}/60 characters {formData.title.length > 60 && "(Consider shortening)"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium dark:text-gray-200">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the article..."
                        rows={3}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-400"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formData.description.length}/500 characters
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <UserCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      Author Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="author" className="text-sm font-medium dark:text-gray-200">
                        Author Name *
                      </Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                        placeholder="Enter author name..."
                        className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium dark:text-gray-200">Co-Authors</Label>
                      <div className="flex gap-2">
                        <Input
                          value={currentCoAuthor}
                          onChange={(e) => setCurrentCoAuthor(e.target.value)}
                          placeholder="Add co-author..."
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCoAuthor())}
                          className="flex-1 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addCoAuthor}
                          className="transition-all duration-200 hover:scale-105 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 bg-transparent"
                        >
                          Add
                        </Button>
                      </div>

                      {formData.coAuthorNames.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.coAuthorNames.map((author) => (
                            <Badge
                              key={author}
                              variant="secondary"
                              className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 hover:scale-105 dark:bg-slate-800 dark:text-white"
                              onClick={() => removeCoAuthor(author)}
                            >
                              {author} <X className="h-3 w-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="credits" className="text-sm font-medium dark:text-gray-200">
                        Credits
                      </Label>
                      <Textarea
                        id="credits"
                        value={formData.credits}
                        onChange={(e) => setFormData((prev) => ({ ...prev, credits: e.target.value }))}
                        placeholder="Additional credits (photographers, contributors, etc.)..."
                        rows={3}
                        className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-400"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Acknowledge photographers, contributors, or sources
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Send className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      Publishing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate" className="text-sm font-medium dark:text-gray-200">
                        Publish Date (Optional)
                      </Label>
                      <Input
                        id="scheduledDate"
                        type="datetime-local"
                        value={formData.scheduledDate}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))
                          setHasDateError(false)
                        }}
                        min={new Date().toISOString().slice(0, 16)}
                        className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${
                          hasDateError ? "border-red-500 dark:border-red-500 focus:ring-red-500" : ""
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="expirationDate"
                        className="text-sm font-medium dark:text-gray-200 flex items-center gap-2"
                      >
                        <CalendarX className="h-4 w-4 text-red-500" />
                        Expiration Date (Optional)
                      </Label>
                      <Input
                        id="expirationDate"
                        type="datetime-local"
                        value={formData.expirationDate}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, expirationDate: e.target.value }))
                          setHasDateError(false)
                        }}
                        min={new Date().toISOString().slice(0, 16)}
                        className={`dark:bg-slate-800 dark:border-slate-700 dark:text-white ${
                          hasDateError ? "border-red-500 dark:border-red-500 focus:ring-red-500" : ""
                        }`}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Article will be automatically unpublished after this date
                      </p>
                    </div>

                    <Separator className="dark:bg-slate-700" />

                    <div className="space-y-2">
                      <Label className="text-sm font-medium dark:text-gray-200">Visibility</Label>
                      <Select
                        value={formData.visibility}
                        onValueChange={(value: any) => setFormData((prev) => ({ ...prev, visibility: value }))}
                      >
                        <SelectTrigger className="transition-all duration-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                          {visibilityOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="dark:text-white dark:focus:bg-slate-700"
                            >
                              <div className="flex items-center gap-2">
                                <option.icon className="h-4 w-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <ImageIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                      Featured Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer ${
                        isDragging
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-105"
                          : "border-gray-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`transition-all duration-300 ${isDragging ? "scale-110 text-blue-500" : "text-gray-400 dark:text-gray-500"}`}
                        >
                          <Upload className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isDragging ? "Drop image here" : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Tag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      Organization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium dark:text-gray-200">Category</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                        disabled={isLoadingCategories}
                      >
                        <SelectTrigger className="transition-all duration-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                          <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category (optional)"} />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                              className="dark:text-white dark:focus:bg-slate-700"
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {categories.length === 0 && !isLoadingCategories && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          No categories available. You can still create the article without a category.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium dark:text-gray-200">Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          placeholder="Add tag..."
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                          className="flex-1 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addTag}
                          className="transition-all duration-200 hover:scale-105 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 bg-transparent"
                        >
                          Add
                        </Button>
                      </div>

                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 hover:scale-105 dark:bg-slate-800 dark:text-white"
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
              </div>
            </div>

            {/* TipTap Editor */}
            <div className="mt-8">
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Article Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TiptapEditor
                    content={formData.articleHtml}
                    onChange={(html, json) => setFormData((prev) => ({ ...prev, articleHtml: html, articleJson: json }))}
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

              {/* Article Preview */}
              <article className="container mx-auto px-4 max-w-4xl">
                <header className="mb-12">
                  {/* Article Meta */}
                  <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
                    {formData.categoryId && (
                      <Badge variant="outline" className="text-primary border-primary">
                        {categories.find((c) => c.id === formData.categoryId)?.name || "Category"}
                      </Badge>
                    )}
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

                  {formData.description && (
                    <p className="text-xl sm:text-2xl leading-relaxed text-muted-foreground mb-8 break-words">
                      {formData.description}
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
                {formData.featuredImageUrl && (
                  <div className="relative mb-12">
                    <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={formData.featuredImageUrl || "/placeholder.svg"}
                        alt={formData.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="mb-16">
                  {formData.articleHtml ? (
                    <div
                      className="prose prose-lg dark:prose-invert max-w-none break-words"
                      dangerouslySetInnerHTML={{ __html: formData.articleHtml }}
                    />
                  ) : (
                    <p className="text-muted-foreground italic">No content yet. Start writing in the Edit tab.</p>
                  )}
                </div>

                {formData.coAuthorNames.length > 0 && (
                  <div className="mb-8 border-l-4 border-primary pl-6">
                    <h3 className="font-semibold mb-3 text-lg">Co-Authors</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.coAuthorNames.map((authorName) => (
                        <Badge key={authorName} variant="secondary" className="break-words max-w-full">
                          <UserCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="break-words">{authorName}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {formData.credits && (
                  <div className="mb-8 border-l-4 border-primary pl-6">
                    <h3 className="font-semibold mb-2 text-lg">Credits</h3>
                    <p className="text-sm text-muted-foreground break-words whitespace-normal">{formData.credits}</p>
                  </div>
                )}

                {/* Article Footer */}
                <footer className="border-t pt-8 mb-16">
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
                              {formData.description || 
                                (formData.articleHtml 
                                  ? formData.articleHtml.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
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

      {/* No Image Warning Dialog */}
      <AlertDialog open={showNoImageWarning} onOpenChange={setShowNoImageWarning}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              No Images Found
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-base">
                <p className="text-slate-700 dark:text-slate-300">
                  This article doesn't have any images. Articles with images perform better and are more engaging for readers.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                    💡 Best Practices:
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>Add a featured image for better visibility</li>
                    <li>Include images in your article content</li>
                    <li>Images improve engagement and sharing</li>
                  </ul>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                  You can still publish without images, but it's recommended to add at least one.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowNoImageWarning(false)}>
              Go Back & Add Image
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowNoImageWarning(false)
                performSave(pendingSaveAsDraft)
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Continue Without Image
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
