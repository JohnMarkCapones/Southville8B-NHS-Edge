"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Save,
  Eye,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Upload,
  X,
  ImageIcon,
  Tag,
  BookOpen,
  UserCircle,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import StudentLayout from "@/components/student/student-layout"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import { newsApi, UpdateNewsDto, ReviewComment, type NewsCategory } from "@/lib/api/endpoints/news"
import { NewsArticle } from "@/types/news"

interface ArticleFormData {
  title: string
  excerpt: string
  content: string
  contentJson: any
  categoryId: string
  tags: string[]
  featuredImage: string
  author: string
  coAuthors: string[]
  credits: string
}

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const articleId = params.id as string

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    excerpt: "",
    content: "",
    contentJson: null,
    categoryId: "",
    tags: [],
    featuredImage: "",
    author: "",
    coAuthors: [],
    credits: "",
  })

  const [categories, setCategories] = useState<NewsCategory[]>([])
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>([])
  const [articleStatus, setArticleStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTag, setCurrentTag] = useState("")
  const [currentCoAuthor, setCurrentCoAuthor] = useState("")

  // Fetch article data and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch article, categories, and review comments in parallel
        const [article, cats, comments] = await Promise.all([
          newsApi.getNewsById(articleId),
          newsApi.getCategories(),
          newsApi.getReviewComments(articleId).catch(() => []), // Don't fail if no comments
        ])

        if (!article) {
          setError("Article not found")
          return
        }

        setCategories(cats)
        setReviewComments(comments)
        setArticleStatus(article.status)

        // Debug: Check what we're getting from the API
        console.log('Article data from API:', {
          coAuthors: article.coAuthors,
          credits: article.credits,
          fullArticle: article
        })

        // Populate form with article data
        setFormData({
          title: article.title || "",
          excerpt: article.excerpt || "",
          content: article.content || "",
          contentJson: article.articleJson || null,
          categoryId: typeof article.category === 'object' ? article.category.id : "",
          tags: article.tags || [],
          featuredImage: article.image || "",
          author: typeof article.author === 'string' ? article.author : article.author?.full_name || "",
          coAuthors: article.coAuthors || [],
          credits: article.credits || "",
        })
      } catch (error: any) {
        console.error('Failed to fetch article data:', error)
        setError(error?.message || "Failed to load article")
        toast({
          title: "Failed to load article",
          description: error?.message || "Unable to load the article for editing.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        setIsLoadingCategories(false)
      }
    }

    if (articleId) {
      fetchData()
    }
  }, [articleId, toast])

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

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in title and content before saving.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      const updateData: UpdateNewsDto = {
        title: formData.title,
        description: formData.excerpt || undefined,
        article_html: formData.content,
        article_json: formData.contentJson || undefined,
        category_id: formData.categoryId && /[0-9a-fA-F-]{36}/.test(formData.categoryId) ? formData.categoryId : undefined,
        tags: formData.tags.length ? formData.tags : undefined,
        featured_image_url: getFeaturedImageUrl(),
        authorName: formData.author || undefined,
        coAuthorNames: formData.coAuthors.length ? formData.coAuthors : undefined,
        credits: formData.credits || undefined,
      }

      await newsApi.updateNews(articleId, updateData)

      toast({
        title: "Article Updated",
        description: "Your article has been successfully updated.",
      })

      // Navigate back to publisher dashboard
      router.push("/student/publisher")
    } catch (error: any) {
      console.error('Failed to update article:', error)
      toast({
        title: "Failed to update article",
        description: error?.message || "Unable to update the article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }


  if (isLoading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Loading article...</h3>
              <p className="text-slate-500 dark:text-slate-400">Please wait while we fetch the article for editing</p>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Error Loading Article</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
              <Button onClick={() => router.push("/student/publisher")} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Publisher
              </Button>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/student/publisher")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Edit Article
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Update your article content and settings</p>
                {articleStatus && (articleStatus === 'Published' || articleStatus === 'Approved') && (
                  <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Note:</strong> This article is {articleStatus}. Changes will require re-approval.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/student/publisher/preview/${articleId}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !formData.title || !formData.content}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Article Details */}
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

              {/* Author Information */}
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Featured Image */}
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

              {/* Category & Tags */}
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

              {/* Review Comments */}
              {reviewComments.length > 0 && (
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Review Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {reviewComments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {comment.author.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {comment.author}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(comment.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {comment.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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
        </div>
      </div>
    </StudentLayout>
  )
}
