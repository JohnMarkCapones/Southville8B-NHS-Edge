"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import TiptapEditor from "@/components/ui/tiptap-editor"
import { ArrowLeft, Save, Eye, Tag, Users, ImageIcon, Database, Send, FileText } from "lucide-react"

// Mock data - TODO: Replace with actual database fetch
const mockArticle = {
  id: "1",
  title: "Science Fair Winners Announced",
  excerpt: "Congratulations to all participants in this year's science fair competition...",
  content: "<p>Full article content goes here...</p>",
  category: "Academic",
  tags: ["science", "competition", "students"],
  author: "Dr. Maria Santos",
  coAuthors: ["Prof. Juan Cruz"],
  status: "Published",
  visibility: "Public",
  publishDate: "2024-01-15",
  publishTime: "09:00",
  featured: true,
  allowComments: true,
  featuredImage: "",
}

export default function EditNewsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string

  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [author, setAuthor] = useState("")
  const [coAuthors, setCoAuthors] = useState<string[]>([])
  const [coAuthorInput, setCoAuthorInput] = useState("")
  const [status, setStatus] = useState("Draft")
  const [visibility, setVisibility] = useState("Public")
  const [publishDate, setPublishDate] = useState("")
  const [publishTime, setPublishTime] = useState("")
  const [featured, setFeatured] = useState(false)
  const [allowComments, setAllowComments] = useState(true)
  const [featuredImage, setFeaturedImage] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load article data
  useEffect(() => {
    // TODO: Fetch actual article data from database
    setTitle(mockArticle.title)
    setExcerpt(mockArticle.excerpt)
    setContent(mockArticle.content)
    setCategory(mockArticle.category)
    setTags(mockArticle.tags)
    setAuthor(mockArticle.author)
    setCoAuthors(mockArticle.coAuthors)
    setStatus(mockArticle.status)
    setVisibility(mockArticle.visibility)
    setPublishDate(mockArticle.publishDate)
    setPublishTime(mockArticle.publishTime)
    setFeatured(mockArticle.featured)
    setAllowComments(mockArticle.allowComments)
    setFeaturedImage(mockArticle.featuredImage)
  }, [articleId])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleAddCoAuthor = () => {
    if (coAuthorInput.trim() && !coAuthors.includes(coAuthorInput.trim())) {
      setCoAuthors([...coAuthors, coAuthorInput.trim()])
      setCoAuthorInput("")
    }
  }

  const handleRemoveCoAuthor = (authorToRemove: string) => {
    setCoAuthors(coAuthors.filter((author) => author !== authorToRemove))
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    // TODO: Implement actual save to database
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date())
      toast({
        title: "Draft Saved",
        description: "Your changes have been saved successfully.",
      })
    }, 1000)
  }

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and content before publishing.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    // TODO: Implement actual publish to database
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Article Published",
        description: "Your article has been published successfully.",
      })
      router.push("/teacher/news")
    }, 1000)
  }

  const handlePreview = () => {
    // TODO: Implement preview functionality
    toast({
      title: "Preview",
      description: "Preview functionality will be implemented with database integration.",
    })
  }

  const wordCount = content
    .replace(/<[^>]*>/g, "")
    .split(/\s+/)
    .filter(Boolean).length
  const readingTime = Math.ceil(wordCount / 200)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Article</h1>
            <p className="text-muted-foreground">Update your news article</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-sm text-muted-foreground">Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Button onClick={handlePublish} disabled={isSaving} className="bg-green-500 hover:bg-green-600">
            <Send className="w-4 h-4 mr-2" />
            Update & Publish
          </Button>
        </div>
      </div>

      {/* Database Connection Notice */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Database Connection Required</p>
              <p className="text-blue-700 dark:text-blue-300">
                This page is ready for database integration. Connect your database to load and save article data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
              <CardDescription>Edit the main content of your article</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter article title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief summary of the article..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">{excerpt.length}/200 characters</p>
              </div>

              <div className="space-y-2">
                <Label>Content *</Label>
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList>
                    <TabsTrigger value="edit">
                      <FileText className="w-4 h-4 mr-2" />
                      Edit
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="mt-4">
                    <TiptapEditor content={content} onChange={setContent} />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-4">
                    <div
                      className="prose prose-sm max-w-none border rounded-lg p-4 min-h-[400px]"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </TabsContent>
                </Tabs>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span>{readingTime} min read</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Featured Image
              </CardTitle>
              <CardDescription>Upload a featured image for your article</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">Drag and drop an image here, or click to browse</p>
                <Button variant="outline" size="sm">
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Recommended: 1200x630px, max 5MB</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Publishing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Students Only">Students Only</SelectItem>
                    <SelectItem value="Teachers Only">Teachers Only</SelectItem>
                    <SelectItem value="Private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status === "Scheduled" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="publishDate">Publish Date</Label>
                    <Input
                      id="publishDate"
                      type="date"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publishTime">Publish Time</Label>
                    <Input
                      id="publishTime"
                      type="time"
                      value={publishTime}
                      onChange={(e) => setPublishTime(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured Article</Label>
                <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="comments">Allow Comments</Label>
                <Switch id="comments" checked={allowComments} onCheckedChange={setAllowComments} />
              </div>
            </CardContent>
          </Card>

          {/* Category & Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Announcements">Announcements</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Student Life">Student Life</SelectItem>
                    <SelectItem value="Arts & Culture">Arts & Culture</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Authors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="author">Primary Author</Label>
                <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coAuthors">Co-Authors</Label>
                <div className="flex gap-2">
                  <Input
                    id="coAuthors"
                    placeholder="Add co-author..."
                    value={coAuthorInput}
                    onChange={(e) => setCoAuthorInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCoAuthor())}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddCoAuthor}>
                    Add
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {coAuthors.map((coAuthor) => (
                    <div key={coAuthor} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{coAuthor}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCoAuthor(coAuthor)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
