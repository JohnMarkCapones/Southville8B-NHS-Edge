"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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

interface ArticleFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  featuredImage: string
  status: "draft" | "scheduled" | "published" | "archived"
  visibility: "public" | "students" | "teachers" | "internal"
  scheduledDate: string
  metaDescription: string
  author: string
}

const categories = [
  { value: "academic", label: "Academic News", icon: BookOpen },
  { value: "events", label: "Events", icon: Calendar },
  { value: "achievements", label: "Achievements", icon: GraduationCap },
  { value: "announcements", label: "Announcements", icon: Send },
  { value: "sports", label: "Sports", icon: Users },
]

const visibilityOptions = [
  { value: "public", label: "Public", icon: Globe, description: "Visible to everyone" },
  { value: "students", label: "Students Only", icon: GraduationCap, description: "Only students can view" },
  { value: "teachers", label: "Teachers Only", icon: Users, description: "Only teachers can view" },
  { value: "internal", label: "Internal", icon: BookOpen, description: "Admin and staff only" },
]

// Mock article data for editing
const mockArticleData: Record<string, ArticleFormData> = {
  "1": {
    title: "Annual Science Fair Winners Announced",
    slug: "annual-science-fair-winners-announced",
    excerpt: "Congratulations to all participants in this year's science fair competition...",
    content:
      '<h2>Science Fair Results</h2><p>We are proud to announce the winners of our annual science fair competition. This year saw exceptional participation from students across all grade levels.</p><h3>First Place Winners:</h3><ul><li>Grade 7: Maria Santos - "Solar Energy Efficiency"</li><li>Grade 8: John Doe - "Water Purification Methods"</li><li>Grade 9: Jane Smith - "Plant Growth Under Different Light Conditions"</li></ul>',
    category: "academic",
    tags: ["science", "competition", "awards", "students"],
    featuredImage: "",
    status: "published",
    visibility: "public",
    scheduledDate: "",
    metaDescription:
      "Annual science fair winners announced at Southville 8B NHS. Congratulations to all participants and winners.",
    author: "Dr. Maria Santos",
  },
}

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currentTag, setCurrentTag] = useState("")
  const [articleId] = useState(params.id as string)

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
    metaDescription: "",
    author: "Admin User",
  })

  // Load article data on component mount
  useEffect(() => {
    if (articleId && mockArticleData[articleId]) {
      setFormData(mockArticleData[articleId])
    }
  }, [articleId])

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

  const handleSave = async (status: "draft" | "published" | "scheduled") => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const statusMessages = {
      draft: "Article updated and saved as draft",
      published: "Article updated and published successfully",
      scheduled: "Article updated and scheduled for publication",
    }

    toast({
      title: "Success!",
      description: statusMessages[status],
      className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
    })

    setIsLoading(false)

    if (status === "published") {
      router.push("/superadmin/news")
    }
  }

  const handlePreview = () => {
    // Open preview in new tab
    window.open(`/preview/article/${articleId}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-white/80">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
              <p className="text-gray-600 mt-1">Update and manage your news article</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handlePreview} className="hover:bg-white/80 bg-transparent">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave("draft")}
              disabled={isLoading}
              className="hover:bg-white/80"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave(formData.status)}
              disabled={isLoading || !formData.title || !formData.content}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {formData.status === "scheduled" ? "Update & Schedule" : "Update & Publish"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Article Content */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Article Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter article title..."
                    className="text-lg font-medium"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-medium">
                    URL Slug
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">/news/</span>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="article-url-slug"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt" className="text-sm font-medium">
                    Excerpt
                  </Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of the article..."
                    rows={3}
                  />
                </div>

                {/* Rich Text Editor */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Content *</Label>
                  <TiptapEditor
                    content={formData.content}
                    onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  SEO Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaDescription" className="text-sm font-medium">
                    Meta Description
                  </Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="SEO description for search engines..."
                    rows={2}
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500">{formData.metaDescription.length}/160 characters</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-purple-600" />
                  Publishing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.status === "scheduled" && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate" className="text-sm font-medium">
                      Publish Date
                    </Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                    />
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Visibility</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, visibility: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {visibilityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Category & Tags */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-orange-600" />
                  Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <category.icon className="h-4 w-4" />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Add tag..."
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      className="flex-1"
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
                          className="cursor-pointer hover:bg-red-100"
                          onClick={() => removeTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-pink-600" />
                  Featured Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
