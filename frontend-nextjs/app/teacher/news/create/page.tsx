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
  BookOpen,
  Clock,
  FileText,
  CheckCircle2,
  Upload,
  X,
  UserCircle,
  Edit3,
  Database,
  AlertCircle,
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

interface ArticleFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  featuredImage: string
  status: "draft" | "scheduled" | "published"
  visibility: "public" | "students" | "teachers"
  scheduledDate: string
  author: string
  coAuthors: string[]
  credits: string
  expirationDate: string
}

const categories = [
  { value: "academic", label: "Academic News", icon: BookOpen },
  { value: "events", label: "Events", icon: Calendar },
  { value: "sports", label: "Sports", icon: Users },
  { value: "announcements", label: "Announcements", icon: Send },
]

const visibilityOptions = [
  { value: "public", label: "Public", icon: Globe, description: "Visible to everyone" },
  { value: "students", label: "Students Only", icon: Users, description: "Only students can view" },
  { value: "teachers", label: "Teachers Only", icon: Users, description: "Only teachers can view" },
]

export default function CreateArticlePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currentTag, setCurrentTag] = useState("")
  const [currentCoAuthor, setCurrentCoAuthor] = useState("")
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [],
    featuredImage: "",
    status: "draft",
    visibility: "public",
    scheduledDate: "",
    author: "Teacher Name", // TODO: Get from auth context
    coAuthors: [],
    credits: "",
    expirationDate: "",
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
    setCharCount(text.length)
    setReadingTime(Math.ceil(words.length / 200))
  }, [formData.content])

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

  const handleSave = async (status: "draft" | "published" | "scheduled") => {
    setIsLoading(true)

    // TODO: Replace with actual database save
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (status === "published") {
      toast({
        title: "✅ Article Published Successfully",
        description: `"${formData.title || "Untitled Article"}" is now live and visible to ${formData.visibility === "public" ? "everyone" : formData.visibility}.`,
      })
      setTimeout(() => {
        router.push("/teacher/news")
      }, 500)
    } else if (status === "scheduled") {
      toast({
        title: "✅ Article Scheduled Successfully",
        description: `"${formData.title || "Untitled Article"}" will be published on ${new Date(formData.scheduledDate).toLocaleString()}.`,
      })
      setTimeout(() => {
        router.push("/teacher/news")
      }, 500)
    } else {
      toast({
        title: "✅ Draft Saved Successfully",
        description: `"${formData.title || "Untitled Article"}" has been saved as a draft.`,
      })
    }

    setIsLoading(false)
  }

  const handlePublishClick = () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Missing Required Fields",
        description: "Please add a title and content before publishing.",
        variant: "destructive",
      })
      return
    }
    setShowPublishConfirm(true)
  }

  const handleConfirmPublish = async () => {
    setShowPublishConfirm(false)
    await handleSave(formData.status)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-6 py-8">
        {/* Database Connection Notice */}
        <Card className="mb-6 bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20 dark:border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Database Connection Required</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Connect your database to save and publish articles. All data entered here is currently stored locally
                  and will be lost on page refresh.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="hover:bg-white/80 dark:hover:bg-slate-800/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Article</h1>
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
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
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
              <Badge variant="secondary" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <FileText className="h-3 w-3 mr-1" />
                {wordCount} words
              </Badge>
              <Badge variant="secondary" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <Clock className="h-3 w-3 mr-1" />
                {readingTime} min read
              </Badge>
            </div>
            <Button variant="outline" onClick={() => handleSave("draft")} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={handlePublishClick}
              disabled={isLoading || !formData.title || !formData.content}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {formData.status === "scheduled" ? "Schedule" : "Publish"}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "edit" | "preview")} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Edit Article
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Article Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="dark:text-gray-200">
                        Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Enter article title..."
                        className="text-lg font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-gray-500"
                      />
                      <p
                        className={`text-xs ${formData.title.length > 60 ? "text-orange-600 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        {formData.title.length}/60 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerpt" className="dark:text-gray-200">
                        Description
                      </Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="Brief description of the article..."
                        rows={3}
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-gray-500"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formData.excerpt.length}/200 characters
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 dark:bg-slate-900/80 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <UserCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      Author Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="author" className="dark:text-gray-200">
                        Author Name *
                      </Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                        placeholder="Enter author name..."
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-gray-200">Co-Authors</Label>
                      <div className="flex gap-2">
                        <Input
                          value={currentCoAuthor}
                          onChange={(e) => setCurrentCoAuthor(e.target.value)}
                          placeholder="Add co-author..."
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCoAuthor())}
                          className="flex-1 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-gray-500"
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
                      <Label htmlFor="credits" className="dark:text-gray-200">
                        Credits
                      </Label>
                      <Textarea
                        id="credits"
                        value={formData.credits}
                        onChange={(e) => setFormData((prev) => ({ ...prev, credits: e.target.value }))}
                        placeholder="Additional credits (photographers, contributors, etc.)..."
                        rows={3}
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-gray-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="shadow-lg border-0 dark:bg-slate-900/80 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <Send className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      Publishing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="dark:text-gray-200">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.status === "scheduled" && (
                      <div className="space-y-2">
                        <Label htmlFor="scheduledDate" className="dark:text-gray-200">
                          Publish Date
                        </Label>
                        <Input
                          id="scheduledDate"
                          type="datetime-local"
                          value={formData.scheduledDate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                          className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                    )}

                    <Separator className="dark:bg-slate-700" />

                    <div className="space-y-2">
                      <Label className="dark:text-gray-200">Visibility</Label>
                      <Select
                        value={formData.visibility}
                        onValueChange={(value: any) => setFormData((prev) => ({ ...prev, visibility: value }))}
                      >
                        <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                          {visibilityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 dark:bg-slate-900/80 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
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
                          : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600"
                      }`}
                    >
                      <Upload className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isDragging ? "Drop image here" : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 dark:bg-slate-900/80 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <Tag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      Organization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="dark:text-gray-200">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-gray-200">Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          placeholder="Add tag..."
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                          className="flex-1 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-gray-500"
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
                              className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 dark:bg-slate-800"
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
              <Card className="shadow-lg border-0 dark:bg-slate-900/80 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Article Content
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
                    {formData.category && (
                      <Badge variant="outline" className="text-primary border-primary">
                        {categories.find((c) => c.value === formData.category)?.label || formData.category}
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

                  {formData.excerpt && (
                    <p className="text-xl sm:text-2xl leading-relaxed text-muted-foreground mb-8 break-words">
                      {formData.excerpt}
                    </p>
                  )}

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
                      <img
                        src={formData.featuredImage || "/placeholder.svg"}
                        alt={formData.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="mb-16">
                  {formData.content ? (
                    <div
                      className="prose prose-lg dark:prose-invert max-w-none break-words"
                      dangerouslySetInnerHTML={{ __html: formData.content }}
                    />
                  ) : (
                    <p className="text-muted-foreground italic">No content yet. Start writing in the Edit tab.</p>
                  )}
                </div>

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
                  </div>
                </footer>
              </article>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Publish Confirmation Modal */}
      <AlertDialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              {formData.status === "scheduled" ? "Schedule Article?" : "Publish Article?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {formData.status === "scheduled" ? (
                <>
                  Are you sure you want to schedule <strong>"{formData.title}"</strong> to be published on{" "}
                  <strong>
                    {formData.scheduledDate ? new Date(formData.scheduledDate).toLocaleString() : "the selected date"}
                  </strong>
                  ?
                  <br />
                  <br />
                  The article will be visible to{" "}
                  <strong>{formData.visibility === "public" ? "everyone" : formData.visibility}</strong> when published.
                </>
              ) : (
                <>
                  Are you sure you want to publish <strong>"{formData.title}"</strong>? The article will be immediately
                  visible to <strong>{formData.visibility === "public" ? "everyone" : formData.visibility}</strong>.
                  <br />
                  <br />
                  You can edit or unpublish it later from the news management page.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPublish}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Publishing..." : formData.status === "scheduled" ? "Schedule Article" : "Publish Article"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
