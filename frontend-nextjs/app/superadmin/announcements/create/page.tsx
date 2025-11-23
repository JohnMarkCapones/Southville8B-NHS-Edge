"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bell,
  Calendar,
  Clock,
  Eye,
  Mail,
  MessageSquare,
  Pin,
  Save,
  Send,
  Smartphone,
  Tag,
  Target,
  Users,
  FileText,
  Sparkles,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCreateAnnouncement } from "@/hooks/useAnnouncements"
import { AnnouncementVisibility } from "@/lib/api/types/announcements"
import { useRoles } from "@/hooks/useRoles"
import {
  validateExpirationDate,
  getVisibilityDuration,
  getMinimumExpirationDate,
  getMaximumExpirationDate,
  getSuggestedExpirationDate,
  type DateValidationResult,
} from "@/lib/utils/announcement-date-validation"

// Quick templates for common announcement types
const ANNOUNCEMENT_TEMPLATES = [
  {
    id: "emergency",
    name: "Emergency Alert",
    icon: AlertCircle,
    priority: "urgent",
    category: "urgent",
    title: "Emergency: [Brief Description]",
    content: `<h2>Emergency Alert</h2>
<p><strong>What happened:</strong> [Describe the situation]</p>
<p><strong>Immediate actions required:</strong></p>
<ul>
<li>[Action 1]</li>
<li>[Action 2]</li>
</ul>
<p><strong>Additional information:</strong> [Details]</p>
<p>For questions or concerns, contact [Contact Information]</p>`,
  },
  {
    id: "event",
    name: "Event Announcement",
    icon: Calendar,
    priority: "normal",
    category: "event",
    title: "[Event Name] - [Date]",
    content: `<h2>[Event Name]</h2>
<p>[Brief description of the event]</p>
<h3>Event Details</h3>
<ul>
<li><strong>Date:</strong> [Date]</li>
<li><strong>Time:</strong> [Time]</li>
<li><strong>Location:</strong> [Location]</li>
</ul>
<h3>What to Expect</h3>
<p>[Description of activities, schedule, etc.]</p>
<p>We look forward to seeing you there!</p>`,
  },
  {
    id: "reminder",
    name: "Reminder",
    icon: Bell,
    priority: "normal",
    category: "general",
    title: "Reminder: [Topic]",
    content: `<h2>Friendly Reminder</h2>
<p>This is a reminder about [topic].</p>
<h3>Important Dates</h3>
<ul>
<li>[Date 1]: [Description]</li>
<li>[Date 2]: [Description]</li>
</ul>
<p>Please ensure you [action required] by [deadline].</p>`,
  },
  {
    id: "academic",
    name: "Academic Update",
    icon: FileText,
    priority: "normal",
    category: "academic",
    title: "[Academic Topic]",
    content: `<h2>[Academic Topic]</h2>
<p>[Introduction to the academic update]</p>
<h3>Key Information</h3>
<ul>
<li>[Point 1]</li>
<li>[Point 2]</li>
<li>[Point 3]</li>
</ul>
<p>For more information, please contact [Department/Person].</p>`,
  },
]

export default function CreateAnnouncementPage() {
  const { toast } = useToast()
  const router = useRouter()
  const createMutation = useCreateAnnouncement()
  const { data: roles, isLoading: rolesLoading } = useRoles()

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [category, setCategory] = useState<"urgent" | "academic" | "event" | "general">("general")
  const [priority, setPriority] = useState<"urgent" | "high" | "normal" | "low">("normal")
  const [tags, setTags] = useState("")
  const [source, setSource] = useState("")

  // Target audience
  const [targetStudents, setTargetStudents] = useState(true)
  const [targetTeachers, setTargetTeachers] = useState(false)
  const [targetParents, setTargetParents] = useState(false)
  const [targetStaff, setTargetStaff] = useState(false)

  // Notification options
  const [sendEmail, setSendEmail] = useState(false)
  const [sendSMS, setSendSMS] = useState(false)
  const [sendPush, setSendPush] = useState(true)

  // Advanced options
  const [isPinned, setIsPinned] = useState(false)
  const [trackReads, setTrackReads] = useState(true)
  const [scheduledDate, setScheduledDate] = useState("")
  const [expirationDate, setExpirationDate] = useState("")
  const [status, setStatus] = useState<"draft" | "scheduled" | "published">("draft")

  // Date validation state
  const [dateValidation, setDateValidation] = useState<DateValidationResult>({ isValid: true })

  // UI state
  const [showPreview, setShowPreview] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleApplyTemplate = (template: (typeof ANNOUNCEMENT_TEMPLATES)[0]) => {
    setTitle(template.title)
    setContent(template.content)
    setCategory(template.category as any)
    setPriority(template.priority as any)
    setShowTemplates(false)
    toast({
      title: "Template Applied",
      description: `${template.name} template has been applied. Customize as needed.`,
    })
  }

  const handleSave = async (publishNow = false) => {
    // Validation
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for the announcement.",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add content to the announcement.",
        variant: "destructive",
      })
      return
    }

    // Validate expiration date
    if (expirationDate) {
      const validation = validateExpirationDate(expirationDate, scheduledDate)
      if (!validation.isValid) {
        toast({
          title: "Invalid Expiration Date",
          description: validation.error || "Please check the expiration date.",
          variant: "destructive",
        })
        return
      }
    }

    // Build target role IDs array from fetched roles
    const targetRoleIds: string[] = []
    if (roles) {
      if (targetStudents) {
        const studentRole = roles.find(r => r.name === 'Student')
        if (studentRole) targetRoleIds.push(studentRole.id)
      }
      if (targetTeachers) {
        const teacherRole = roles.find(r => r.name === 'Teacher')
        if (teacherRole) targetRoleIds.push(teacherRole.id)
      }
      if (targetParents) {
        const parentRole = roles.find(r => r.name === 'Parent')
        if (parentRole) targetRoleIds.push(parentRole.id)
      }
      if (targetStaff) {
        const staffRole = roles.find(r => r.name === 'Staff')
        if (staffRole) targetRoleIds.push(staffRole.id)
      }
    }

    if (targetRoleIds.length === 0) {
      toast({
        title: "Target Audience Required",
        description: "Please select at least one target audience.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Transform form data to match backend API schema
      const announcementData = {
        title: title.trim(),
        content: content.trim(),
        type: category, // Use category as type (urgent, academic, event, general)
        visibility: AnnouncementVisibility.PUBLIC, // Default to public, can make this configurable
        targetRoleIds,
        expiresAt: expirationDate || undefined,
        tagIds: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .map(() => undefined) // TODO: Implement tag selection instead of free text
          .filter((t): t is string => !!t), // Filter out undefined values
      }

      // Debug: Log what we're sending
      console.log("📤 Sending announcement data:", JSON.stringify(announcementData, null, 2))

      // Create announcement via API
      const result = await createMutation.mutateAsync(announcementData)

      toast({
        title: "Announcement Created!",
        description: `Your announcement "${result.title}" has been created successfully.`,
      })

      // Navigate to announcements list
      router.push("/superadmin/announcements")
    } catch (error: any) {
      console.error("Failed to create announcement:", error)
      toast({
        title: "Failed to Create Announcement",
        description: error?.message || "An error occurred while creating the announcement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "normal":
        return "bg-blue-500"
      case "low":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCategoryColor = (c: string) => {
    switch (c) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "academic":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "event":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "general":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const characterCount = title.length
  const maxTitleLength = 120

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/superadmin/announcements")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Announcement</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Compose and publish announcements to your school community
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowTemplates(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Use Template
            </Button>
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the main details of your announcement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <span
                      className={`text-sm ${
                        characterCount > maxTitleLength ? "text-red-500" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {characterCount}/{maxTitleLength}
                    </span>
                  </div>
                  <Input
                    id="title"
                    placeholder="Enter announcement title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={characterCount > maxTitleLength ? "border-red-500" : ""}
                  />
                  {characterCount > maxTitleLength && (
                    <p className="text-sm text-red-500">Title should be concise (max {maxTitleLength} characters)</p>
                  )}
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt">
                    Brief Summary <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Write a brief summary that will appear in the announcement list..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This summary will be shown in announcement previews and notifications
                  </p>
                </div>

                {/* Content Editor */}
                <div className="space-y-2">
                  <Label>
                    Content <span className="text-red-500">*</span>
                  </Label>
                  <TiptapEditor content={content} onChange={setContent} />
                </div>
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scheduling & Expiration
                </CardTitle>
                <CardDescription>Control when this announcement is published and expires</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled">Publish Date & Time</Label>
                    <Input
                      id="scheduled"
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Leave empty to publish immediately</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiration">Expiration Date & Time (Optional)</Label>
                    <Input
                      id="expiration"
                      type="datetime-local"
                      value={expirationDate}
                      min={getMinimumExpirationDate()}
                      max={getMaximumExpirationDate()}
                      onChange={(e) => {
                        setExpirationDate(e.target.value)
                        // Real-time validation
                        const validation = validateExpirationDate(e.target.value, scheduledDate)
                        setDateValidation(validation)
                      }}
                      className={
                        dateValidation.severity === 'error'
                          ? 'border-red-500 focus:border-red-500'
                          : dateValidation.severity === 'warning'
                            ? 'border-yellow-500 focus:border-yellow-500'
                            : ''
                      }
                    />

                    {/* Validation Messages */}
                    {dateValidation.error && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-600 dark:text-red-400">{dateValidation.error}</p>
                      </div>
                    )}

                    {dateValidation.warning && !dateValidation.error && (
                      <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-900/20 dark:border-yellow-800">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">{dateValidation.warning}</p>
                      </div>
                    )}

                    {/* Duration Preview */}
                    {expirationDate && !dateValidation.error && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-800">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {getVisibilityDuration(expirationDate, scheduledDate)}
                        </p>
                      </div>
                    )}

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {!expirationDate
                        ? 'Leave empty for no expiration (announcement will be visible indefinitely)'
                        : 'Announcement will be hidden after this date'}
                    </p>

                    {/* Quick Actions */}
                    {!expirationDate && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const suggested = getSuggestedExpirationDate()
                          setExpirationDate(suggested)
                          const validation = validateExpirationDate(suggested)
                          setDateValidation(validation)
                        }}
                        className="w-full"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Set to 30 days from now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Priority & Category */}
            <Card>
              <CardHeader>
                <CardTitle>Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Priority */}
                <div className="space-y-2">
                  <Label>Priority Level</Label>
                  <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor("urgent")}`} />
                          Urgent
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor("high")}`} />
                          High
                        </div>
                      </SelectItem>
                      <SelectItem value="normal">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor("normal")}`} />
                          Normal
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor("low")}`} />
                          Low
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Source */}
                <div className="space-y-2">
                  <Label htmlFor="source">Source/Department</Label>
                  <Input
                    id="source"
                    placeholder="e.g., Administration, Academic Affairs"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">
                    <Tag className="h-4 w-4 inline mr-1" />
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    placeholder="Separate tags with commas"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Target Audience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Target Audience
                </CardTitle>
                <CardDescription>Select who should see this announcement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="students"
                    checked={targetStudents}
                    onCheckedChange={(checked) => setTargetStudents(checked as boolean)}
                  />
                  <Label htmlFor="students" className="cursor-pointer">
                    <Users className="h-4 w-4 inline mr-2" />
                    Students
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="teachers"
                    checked={targetTeachers}
                    onCheckedChange={(checked) => setTargetTeachers(checked as boolean)}
                  />
                  <Label htmlFor="teachers" className="cursor-pointer">
                    <Users className="h-4 w-4 inline mr-2" />
                    Teachers
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="parents"
                    checked={targetParents}
                    onCheckedChange={(checked) => setTargetParents(checked as boolean)}
                  />
                  <Label htmlFor="parents" className="cursor-pointer">
                    <Users className="h-4 w-4 inline mr-2" />
                    Parents
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="staff"
                    checked={targetStaff}
                    onCheckedChange={(checked) => setTargetStaff(checked as boolean)}
                  />
                  <Label htmlFor="staff" className="cursor-pointer">
                    <Users className="h-4 w-4 inline mr-2" />
                    Staff
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Choose how to notify the target audience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="push" className="cursor-pointer">
                    <MessageSquare className="h-4 w-4 inline mr-2" />
                    Push Notification
                  </Label>
                  <Switch id="push" checked={sendPush} onCheckedChange={setSendPush} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="cursor-pointer">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email
                  </Label>
                  <Switch id="email" checked={sendEmail} onCheckedChange={setSendEmail} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms" className="cursor-pointer">
                    <Smartphone className="h-4 w-4 inline mr-2" />
                    SMS
                  </Label>
                  <Switch id="sms" checked={sendSMS} onCheckedChange={setSendSMS} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 pt-2">
                  {/* TODO: Backend integration for notification services */}
                  Notifications will be sent when announcement is published
                </p>
              </CardContent>
            </Card>

            {/* Advanced Options */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pinned" className="cursor-pointer">
                    <Pin className="h-4 w-4 inline mr-2" />
                    Pin to Top
                  </Label>
                  <Switch id="pinned" checked={isPinned} onCheckedChange={setIsPinned} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="track" className="cursor-pointer">
                    <Eye className="h-4 w-4 inline mr-2" />
                    Track Read Receipts
                  </Label>
                  <Switch id="track" checked={trackReads} onCheckedChange={setTrackReads} />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button className="w-full" size="lg" onClick={() => handleSave(true)} disabled={isSaving}>
                  <Send className="h-4 w-4 mr-2" />
                  {isSaving ? "Publishing..." : "Publish Now"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
            <DialogDescription>Start with a pre-built template and customize it for your needs</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {ANNOUNCEMENT_TEMPLATES.map((template) => {
              const Icon = template.icon
              return (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className="h-5 w-5" />
                      {template.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
                      <Badge variant="outline">
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(template.priority)}`} />
                          {template.priority}
                        </div>
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Announcement Preview</DialogTitle>
            <DialogDescription>This is how your announcement will appear to users</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(category)}>{category}</Badge>
                <Badge variant="outline">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(priority)}`} />
                    {priority}
                  </div>
                </Badge>
                {isPinned && (
                  <Badge variant="secondary">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold">{title || "Untitled Announcement"}</h1>
              <p className="text-gray-600 dark:text-gray-400">{excerpt || "No summary provided"}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{source || "Administration"}</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <Separator />

            {/* Content */}
            <div
              className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content || "<p>No content yet</p>" }}
            />

            <Separator />

            {/* Metadata */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="font-medium">Target Audience:</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {[
                    targetStudents && "Students",
                    targetTeachers && "Teachers",
                    targetParents && "Parents",
                    targetStaff && "Staff",
                  ]
                    .filter(Boolean)
                    .join(", ") || "None selected"}
                </span>
              </div>
              {tags && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span className="font-medium">Tags:</span>
                  <div className="flex gap-1">
                    {tags.split(",").map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
