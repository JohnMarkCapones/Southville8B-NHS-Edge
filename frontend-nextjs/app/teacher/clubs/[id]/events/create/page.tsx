"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Sparkles,
  Clock,
  HelpCircle,
  Info,
  AlertCircle,
  CheckCircle2,
  X,
  ImageIcon,
  Loader2,
  Save,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useCreateEvent } from "@/hooks/useEvents"
import { useUser } from "@/hooks/useUser"
import { useClub } from "@/hooks"
import { uploadEventImage } from "@/lib/api/endpoints/events"
import { EventStatus, EventVisibility } from "@/lib/api/types/events"
import { useToast } from "@/hooks/use-toast"
import { EventValidationErrorsModal, type ValidationError } from "@/components/events/event-validation-errors-modal"
import { EventConflictModal } from "@/components/events/event-conflict-modal"
import { useEvents } from "@/hooks/useEvents"

interface EventHighlight {
  id: string
  title: string
  content: string
}

interface ScheduleItem {
  id: string
  time: string
  description: string
}

interface FAQ {
  id: string
  question: string
  answer: string
}

interface AdditionalInfo {
  id: string
  title: string
  content: string
}

export default function CreateClubEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clubId } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const createEventMutation = useCreateEvent()
  const { data: user, isLoading: userLoading } = useUser()
  const { data: club, isLoading: clubLoading } = useClub(clubId)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [location, setLocation] = useState("")
  const [status, setStatus] = useState<EventStatus>(EventStatus.DRAFT)
  const [visibility, setVisibility] = useState<EventVisibility>(EventVisibility.PUBLIC)

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("")

  // Extended content
  const [highlights, setHighlights] = useState<EventHighlight[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo[]>([])

  // Fetch events for the selected date to check for conflicts
  const { data: eventsOnDate } = useEvents({
    startDate: date,
    endDate: date,
    limit: 100,
  })

  // Event templates
  const eventTemplates = {
    meeting: {
      title: "Club Meeting",
      description: "Regular club meeting to discuss upcoming events and activities.",
      highlights: [{ title: "Agenda Review", content: "Discussion of upcoming club activities and events" }],
      schedule: [
        { time: "15:30", description: "Welcome and attendance" },
        { time: "15:45", description: "Old business review" },
        { time: "16:00", description: "New business and planning" },
      ],
    },
    competition: {
      title: "Club Competition",
      description: "Competitive event showcasing member skills and talents.",
      highlights: [
        { title: "Prizes", content: "Awards for top performers" },
        { title: "Certificates", content: "Participation certificates for all members" },
      ],
      schedule: [
        { time: "09:00", description: "Registration and setup" },
        { time: "10:00", description: "Competition begins" },
        { time: "14:00", description: "Awards ceremony" },
      ],
    },
    workshop: {
      title: "Skills Workshop",
      description: "Educational workshop to develop new skills and knowledge.",
      highlights: [
        { title: "Expert Facilitator", content: "Learn from experienced professionals" },
        { title: "Hands-on Learning", content: "Practical exercises and activities" },
      ],
      schedule: [
        { time: "14:00", description: "Introduction and icebreaker" },
        { time: "14:30", description: "Main workshop session" },
        { time: "16:00", description: "Q&A and wrap-up" },
      ],
    },
  }

  const applyTemplate = (templateKey: string) => {
    const template = eventTemplates[templateKey as keyof typeof eventTemplates]
    if (!template) return

    setTitle(template.title)
    setDescription(template.description)
    setHighlights(template.highlights.map((h, i) => ({ ...h, id: `h-${i}` })))
    setSchedule(template.schedule.map((s, i) => ({ ...s, id: `s-${i}` })))

    toast({
      title: "Template Applied",
      description: "You can now customize the event details.",
    })
  }

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    setSelectedImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageUpload = async () => {
    if (!selectedImage) return

    setIsUploadingImage(true)
    try {
      const result = await uploadEventImage(selectedImage)
      setUploadedImageUrl(result.url)
      toast({
        title: "Image Uploaded",
        description: "Event image uploaded successfully",
      })
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error?.message || "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  // List management helpers
  const addHighlight = () => {
    setHighlights([...highlights, { id: Date.now().toString(), title: "", content: "" }])
  }

  const updateHighlight = (id: string, field: keyof EventHighlight, value: string) => {
    setHighlights(highlights.map((h) => (h.id === id ? { ...h, [field]: value } : h)))
  }

  const removeHighlight = (id: string) => {
    setHighlights(highlights.filter((h) => h.id !== id))
  }

  const addScheduleItem = () => {
    setSchedule([...schedule, { id: Date.now().toString(), time: "", description: "" }])
  }

  const updateScheduleItem = (id: string, field: keyof ScheduleItem, value: string) => {
    setSchedule(schedule.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const removeScheduleItem = (id: string) => {
    setSchedule(schedule.filter((s) => s.id !== id))
  }

  const addFaq = () => {
    setFaqs([...faqs, { id: Date.now().toString(), question: "", answer: "" }])
  }

  const updateFaq = (id: string, field: keyof FAQ, value: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)))
  }

  const removeFaq = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id))
  }

  const addAdditionalInfo = () => {
    setAdditionalInfo([...additionalInfo, { id: Date.now().toString(), title: "", content: "" }])
  }

  const updateAdditionalInfo = (id: string, field: keyof AdditionalInfo, value: string) => {
    setAdditionalInfo(additionalInfo.map((a) => (a.id === id ? { ...a, [field]: value } : a)))
  }

  const removeAdditionalInfo = (id: string) => {
    setAdditionalInfo(additionalInfo.filter((a) => a.id !== id))
  }

  // Convert 24-hour time to 12-hour AM/PM format
  const formatTimeToAMPM = (time24: string): string => {
    if (!time24) return ""

    const [hours, minutes] = time24.split(":")
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

    return `${hour12}:${minutes} ${ampm}`
  }

  // Calculate duration between two times in HH:MM format
  const calculateDuration = (startTime: string, endTime: string): string => {
    if (!startTime || !endTime) return ""

    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)

    const startTotalMinutes = startHours * 60 + startMinutes
    const endTotalMinutes = endHours * 60 + endMinutes

    const diffMinutes = endTotalMinutes - startTotalMinutes

    if (diffMinutes <= 0) return ""

    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60

    if (hours === 0) {
      return `${minutes}m`
    } else if (minutes === 0) {
      return `${hours}h`
    } else {
      return `${hours}h ${minutes}m`
    }
  }

  // Check if a highlight title is duplicate
  const isHighlightTitleDuplicate = (currentId: string, title: string): boolean => {
    if (!title.trim()) return false
    const titleLower = title.trim().toLowerCase()
    return highlights.some((h) => h.id !== currentId && h.title.trim().toLowerCase() === titleLower)
  }

  // Check if a FAQ question is duplicate
  const isFaqQuestionDuplicate = (currentId: string, question: string): boolean => {
    if (!question.trim()) return false
    const questionLower = question.trim().toLowerCase()
    return faqs.some((f) => f.id !== currentId && f.question.trim().toLowerCase() === questionLower)
  }

  // Check if an additional info title is duplicate
  const isAdditionalInfoTitleDuplicate = (currentId: string, title: string): boolean => {
    if (!title.trim()) return false
    const titleLower = title.trim().toLowerCase()
    return additionalInfo.some((a) => a.id !== currentId && a.title.trim().toLowerCase() === titleLower)
  }

  // Check if basic time matches first schedule item
  const getFirstScheduleTime = (): string | null => {
    const firstScheduleItem = schedule.find((s) => s.time)
    return firstScheduleItem?.time || null
  }

  const isBasicTimeMatchingSchedule = (): boolean => {
    const firstScheduleTime = getFirstScheduleTime()
    if (!firstScheduleTime || !time) return true // No schedule or no time set yet
    return time === firstScheduleTime
  }

  // Form validation
  const validateForm = (): boolean => {
    const errors: ValidationError[] = []

    // Required field validations
    if (!title.trim()) {
      errors.push({
        field: "Event Title",
        message: "Title is required and cannot be empty",
        severity: "error",
      })
    }

    if (!description.trim()) {
      errors.push({
        field: "Description",
        message: "Description is required and cannot be empty",
        severity: "error",
      })
    } else if (description.trim().length < 20) {
      errors.push({
        field: "Description",
        message: `Description must be at least 20 characters long (currently ${description.trim().length} characters)`,
        severity: "error",
      })
    }

    if (!date) {
      errors.push({
        field: "Date",
        message: "Event date is required",
        severity: "error",
      })
    }

    if (!time) {
      errors.push({
        field: "Time",
        message: "Event time is required",
        severity: "error",
      })
    }

    if (!location.trim()) {
      errors.push({
        field: "Location",
        message: "Location is required and cannot be empty",
        severity: "error",
      })
    }

    // Validate date is not in the past
    if (date && time) {
      const eventDateTime = new Date(`${date}T${time}`)
      const now = new Date()
      if (eventDateTime < now) {
        errors.push({
          field: "Date & Time",
          message: "Event date and time cannot be in the past",
          severity: "error",
        })
      }
    }

    // Validate visibility - CRITICAL FIX
    if (visibility !== EventVisibility.PUBLIC && visibility !== EventVisibility.PRIVATE) {
      errors.push({
        field: "Visibility",
        message: `Visibility must be either "public" or "private" (currently: "${visibility}")`,
        severity: "error",
      })
    }

    // Validate that basic time matches first schedule item
    const firstScheduleTime = getFirstScheduleTime()
    if (firstScheduleTime && time && time !== firstScheduleTime) {
      errors.push({
        field: "Event Time",
        message: `Event start time (${formatTimeToAMPM(time)}) must match the first schedule item (${formatTimeToAMPM(firstScheduleTime)})`,
        severity: "error",
      })
    }

    // Validate highlights content length
    const validHighlights = highlights.filter((h) => h.title.trim() || h.content.trim())
    validHighlights.forEach((highlight, index) => {
      if (highlight.content.trim() && highlight.content.trim().length < 10) {
        errors.push({
          field: `Highlight #${index + 1}`,
          message: `Highlight content must be at least 10 characters long (currently ${highlight.content.trim().length} characters)`,
          severity: "error",
        })
      }
      if (highlight.title.trim() && !highlight.content.trim()) {
        errors.push({
          field: `Highlight #${index + 1}`,
          message: "Highlight has a title but no content. Please add content or remove this highlight.",
          severity: "warning",
        })
      }
    })

    // Check for duplicate highlight titles
    const highlightTitles = validHighlights
      .map((h) => h.title.trim().toLowerCase())
      .filter((title) => title !== "")
    const duplicateHighlightTitles = highlightTitles.filter(
      (title, index) => highlightTitles.indexOf(title) !== index
    )
    if (duplicateHighlightTitles.length > 0) {
      const uniqueDuplicates = [...new Set(duplicateHighlightTitles)]
      uniqueDuplicates.forEach((dupTitle) => {
        const duplicateIndexes = validHighlights
          .map((h, idx) => (h.title.trim().toLowerCase() === dupTitle ? idx + 1 : -1))
          .filter((idx) => idx !== -1)
        errors.push({
          field: "Event Highlights",
          message: `Duplicate title "${validHighlights.find((h) => h.title.trim().toLowerCase() === dupTitle)?.title}" found in items #${duplicateIndexes.join(", #")}`,
          severity: "warning",
        })
      })
    }

    // Validate schedule items
    const validSchedule = schedule.filter((s) => s.time || s.description.trim())
    validSchedule.forEach((item, index) => {
      if (item.time && !item.description.trim()) {
        errors.push({
          field: `Schedule Item #${index + 1}`,
          message: "Schedule item has a time but no description",
          severity: "warning",
        })
      }
      if (!item.time && item.description.trim()) {
        errors.push({
          field: `Schedule Item #${index + 1}`,
          message: "Schedule item has a description but no time",
          severity: "warning",
        })
      }

      // Validate chronological order
      if (index > 0 && item.time && validSchedule[index - 1].time) {
        if (item.time <= validSchedule[index - 1].time) {
          errors.push({
            field: `Schedule Item #${index + 1}`,
            message: `Time (${formatTimeToAMPM(item.time)}) must be after the previous item (${formatTimeToAMPM(validSchedule[index - 1].time)})`,
            severity: "error",
          })
        }
      }
    })

    // Validate FAQs
    const validFaqs = faqs.filter((f) => f.question.trim() || f.answer.trim())
    validFaqs.forEach((faq, index) => {
      if (faq.question.trim() && !faq.answer.trim()) {
        errors.push({
          field: `FAQ #${index + 1}`,
          message: "FAQ has a question but no answer",
          severity: "warning",
        })
      }
      if (!faq.question.trim() && faq.answer.trim()) {
        errors.push({
          field: `FAQ #${index + 1}`,
          message: "FAQ has an answer but no question",
          severity: "warning",
        })
      }
    })

    // Check for duplicate FAQ questions
    const faqQuestions = validFaqs
      .map((f) => f.question.trim().toLowerCase())
      .filter((question) => question !== "")
    const duplicateFaqQuestions = faqQuestions.filter(
      (question, index) => faqQuestions.indexOf(question) !== index
    )
    if (duplicateFaqQuestions.length > 0) {
      const uniqueDuplicates = [...new Set(duplicateFaqQuestions)]
      uniqueDuplicates.forEach((dupQuestion) => {
        const duplicateIndexes = validFaqs
          .map((f, idx) => (f.question.trim().toLowerCase() === dupQuestion ? idx + 1 : -1))
          .filter((idx) => idx !== -1)
        errors.push({
          field: "FAQs",
          message: `Duplicate question "${validFaqs.find((f) => f.question.trim().toLowerCase() === dupQuestion)?.question}" found in items #${duplicateIndexes.join(", #")}`,
          severity: "warning",
        })
      })
    }

    // Validate additional info
    const validAdditionalInfo = additionalInfo.filter((a) => a.title.trim() || a.content.trim())
    validAdditionalInfo.forEach((info, index) => {
      if (info.title.trim() && !info.content.trim()) {
        errors.push({
          field: `Additional Info #${index + 1}`,
          message: "Info item has a title but no content",
          severity: "warning",
        })
      }
    })

    // Check for duplicate additional info titles
    const additionalInfoTitles = validAdditionalInfo
      .map((a) => a.title.trim().toLowerCase())
      .filter((title) => title !== "")
    const duplicateAdditionalInfoTitles = additionalInfoTitles.filter(
      (title, index) => additionalInfoTitles.indexOf(title) !== index
    )
    if (duplicateAdditionalInfoTitles.length > 0) {
      const uniqueDuplicates = [...new Set(duplicateAdditionalInfoTitles)]
      uniqueDuplicates.forEach((dupTitle) => {
        const duplicateIndexes = validAdditionalInfo
          .map((a, idx) => (a.title.trim().toLowerCase() === dupTitle ? idx + 1 : -1))
          .filter((idx) => idx !== -1)
        errors.push({
          field: "Additional Information",
          message: `Duplicate title "${validAdditionalInfo.find((a) => a.title.trim().toLowerCase() === dupTitle)?.title}" found in items #${duplicateIndexes.join(", #")}`,
          severity: "warning",
        })
      })
    }

    // If there are errors, show the modal
    if (errors.length > 0) {
      setValidationErrors(errors)
      setShowValidationModal(true)
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create events",
        variant: "destructive",
      })
      return
    }

    // Check for scheduling conflicts
    const conflictingEvents = eventsOnDate?.data?.filter(
      (event) => event.time === time && event.date === date
    ) || []

    if (conflictingEvents.length > 0) {
      setShowConflictModal(true)
    } else {
      setShowConfirmModal(true)
    }
  }

  const handleProceedDespiteConflict = () => {
    setShowConflictModal(false)
    setShowConfirmModal(true)
  }

  const confirmSubmit = async () => {
    setShowConfirmModal(false)
    setIsSubmitting(true)

    try {
      // Upload image if selected but not uploaded yet
      let finalImageUrl = uploadedImageUrl

      if (selectedImage && !uploadedImageUrl) {
        setIsUploadingImage(true)
        try {
          const result = await uploadEventImage(selectedImage)
          finalImageUrl = result.url
          setUploadedImageUrl(result.url)

          toast({
            title: "Image Uploaded",
            description: "Event image uploaded successfully",
          })
        } catch (error: any) {
          toast({
            title: "Upload Failed",
            description: error?.message || "Failed to upload image",
            variant: "destructive",
          })
          // Continue without image
          finalImageUrl = ""
        } finally {
          setIsUploadingImage(false)
        }
      }

      // Filter out empty items
      const validHighlights = highlights.filter((h) => h.title.trim() || h.content.trim())
      const validSchedule = schedule.filter((s) => s.time && s.description.trim())
      const validFaqs = faqs.filter((f) => f.question.trim() && f.answer.trim())
      const validAdditionalInfo = additionalInfo.filter((a) => a.title.trim() || a.content.trim())

      const eventData = {
        title,
        description,
        date,
        time,
        location,
        organizerId: user!.id,
        clubId, // ← Important: Include club ID!
        eventImage: finalImageUrl || undefined,
        status,
        visibility,
        highlights: validHighlights.map((h, idx) => ({
          title: h.title,
          content: h.content,
          orderIndex: idx,
        })),
        schedule: validSchedule.map((s, idx) => ({
          activityTime: s.time,
          activityDescription: s.description,
          orderIndex: idx,
        })),
        faq: validFaqs.map((f) => ({
          question: f.question,
          answer: f.answer,
        })),
        additionalInfo: validAdditionalInfo.map((a, idx) => ({
          title: a.title,
          content: a.content,
          orderIndex: idx,
        })),
      }

      console.log('🔍 Event data being sent:', eventData)
      console.log('🖼️ Image URL:', finalImageUrl)

      await createEventMutation.mutateAsync(eventData)

      toast({
        title: "Event Created!",
        description: "Your club event has been created successfully",
      })

      // Navigate back to club page
      router.push(`/teacher/clubs/${clubId}`)
    } catch (error: any) {
      console.error("Error creating event:", error)
      toast({
        title: "Creation Failed",
        description: error?.message || "Failed to create event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (clubLoading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/teacher/clubs/${clubId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {club?.name || "Club"}
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Club Event</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Create a new event for {club?.name || "your club"}
              </p>
            </div>

            <Badge className="bg-blue-600">
              <Sparkles className="w-4 h-4 mr-1" />
              New Event
            </Badge>
          </div>
        </div>

        {/* Templates */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Event Templates
            </CardTitle>
            <CardDescription>Start with a template to save time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => applyTemplate("meeting")}
                className="h-auto flex flex-col items-start p-4 hover:border-blue-500"
              >
                <div className="font-semibold mb-1">Club Meeting</div>
                <div className="text-xs text-gray-500">Regular meeting template</div>
              </Button>
              <Button
                variant="outline"
                onClick={() => applyTemplate("competition")}
                className="h-auto flex flex-col items-start p-4 hover:border-blue-500"
              >
                <div className="font-semibold mb-1">Competition</div>
                <div className="text-xs text-gray-500">Contest or tournament</div>
              </Button>
              <Button
                variant="outline"
                onClick={() => applyTemplate("workshop")}
                className="h-auto flex flex-col items-start p-4 hover:border-blue-500"
              >
                <div className="font-semibold mb-1">Workshop</div>
                <div className="text-xs text-gray-500">Skills training session</div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential event details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">
                Event Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter event title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
                <span className={cn(
                  "text-xs ml-2",
                  description.trim().length < 20 ? "text-red-500" : "text-gray-500"
                )}>
                  ({description.trim().length}/20 minimum)
                </span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your event... (minimum 20 characters)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={cn(
                  description.trim().length > 0 && description.trim().length < 20 && "border-red-300 focus:border-red-500"
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <Label htmlFor="time">
                  Time <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-1">
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={cn(
                      !isBasicTimeMatchingSchedule() && time && "border-amber-300 focus:border-amber-500"
                    )}
                  />
                  {!isBasicTimeMatchingSchedule() && time && getFirstScheduleTime() && (
                    <span className="text-xs text-amber-600">
                      ⚠️ Should match first schedule item ({formatTimeToAMPM(getFirstScheduleTime()!)})
                    </span>
                  )}
                  {getFirstScheduleTime() && time && isBasicTimeMatchingSchedule() && (
                    <span className="text-xs text-green-600">
                      ✓ Matches schedule start time
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="Event venue or location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as EventStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EventStatus.DRAFT}>Draft</SelectItem>
                    <SelectItem value={EventStatus.PUBLISHED}>Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={visibility} onValueChange={(value) => setVisibility(value as EventVisibility)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EventVisibility.PUBLIC}>Public</SelectItem>
                    <SelectItem value={EventVisibility.PRIVATE}>Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Image */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Event Image
            </CardTitle>
            <CardDescription>Upload a cover image for your event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedImage(null)
                      setImagePreview("")
                      setUploadedImageUrl("")
                    }}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop
                  </Label>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              )}

              {selectedImage && !uploadedImageUrl && (
                <Button onClick={handleImageUpload} disabled={isUploadingImage} className="w-full">
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
              )}

              {uploadedImageUrl && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Image uploaded successfully
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Highlights */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Event Highlights</CardTitle>
                <CardDescription>Key features or benefits of attending</CardDescription>
              </div>
              <Button onClick={addHighlight} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Highlight
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {highlights.map((highlight, index) => {
                const isDuplicateTitle = isHighlightTitleDuplicate(highlight.id, highlight.title)

                return (
                  <div key={highlight.id} className="flex gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      <div className="space-y-1">
                        <Input
                          placeholder="Highlight title..."
                          value={highlight.title}
                          onChange={(e) => updateHighlight(highlight.id, "title", e.target.value)}
                          className={cn(
                            isDuplicateTitle && "border-amber-300 focus:border-amber-500"
                          )}
                        />
                        {isDuplicateTitle && (
                          <span className="text-xs text-amber-600">
                            ⚠️ This title is already used in another highlight
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Textarea
                          placeholder="Highlight details... (minimum 10 characters)"
                          value={highlight.content}
                          onChange={(e) => updateHighlight(highlight.id, "content", e.target.value)}
                          rows={2}
                          className={cn(
                            highlight.content.trim().length > 0 && highlight.content.trim().length < 10 && "border-red-300 focus:border-red-500"
                          )}
                        />
                        {highlight.content.trim().length > 0 && (
                          <span className={cn(
                            "text-xs",
                            highlight.content.trim().length < 10 ? "text-red-500" : "text-gray-500"
                          )}>
                            {highlight.content.trim().length}/10 minimum
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHighlight(highlight.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}

              {highlights.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No highlights added yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Event Schedule</CardTitle>
                <CardDescription>Timeline of activities (chronological order)</CardDescription>
              </div>
              <Button onClick={addScheduleItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedule.map((item, index) => {
                // Get the minimum time for this item (must be after previous item)
                const previousItem = index > 0 ? schedule[index - 1] : null
                const minTime = previousItem?.time || undefined

                // Check if current time is valid (after previous)
                const isTimeValid = !minTime || !item.time || item.time > minTime

                // Calculate duration from first item
                const firstItem = schedule[0]
                const durationFromStart = index > 0 && firstItem?.time && item.time
                  ? calculateDuration(firstItem.time, item.time)
                  : ""

                return (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Input
                            type="time"
                            placeholder="Time"
                            value={item.time}
                            onChange={(e) => updateScheduleItem(item.id, "time", e.target.value)}
                            min={minTime}
                            className={cn(
                              !isTimeValid && "border-red-300 focus:border-red-500"
                            )}
                          />
                          {index === 0 && item.time && (
                            <>
                              <span className="text-xs text-blue-600 font-medium">
                                ⏱️ Event starts
                              </span>
                              {time && item.time !== time && (
                                <span className="text-xs text-amber-600">
                                  ⚠️ Should match event time ({formatTimeToAMPM(time)})
                                </span>
                              )}
                              {time && item.time === time && (
                                <span className="text-xs text-green-600">
                                  ✓ Matches event start time
                                </span>
                              )}
                            </>
                          )}
                          {minTime && (
                            <span className="text-xs text-gray-500">
                              Must be after {formatTimeToAMPM(minTime)}
                            </span>
                          )}
                          {!isTimeValid && item.time && (
                            <span className="text-xs text-red-500">
                              Time must be after {formatTimeToAMPM(previousItem?.time || "")}
                            </span>
                          )}
                          {durationFromStart && isTimeValid && (
                            <span className="text-xs text-emerald-600 font-medium">
                              📍 {durationFromStart} from start
                            </span>
                          )}
                        </div>
                        <Textarea
                          placeholder="Activity description..."
                          value={item.description}
                          onChange={(e) => updateScheduleItem(item.id, "description", e.target.value)}
                          className="col-span-2"
                          rows={1}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeScheduleItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}

              {schedule.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No schedule items added yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Answer common questions about your event</CardDescription>
              </div>
              <Button onClick={addFaq} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isDuplicateQuestion = isFaqQuestionDuplicate(faq.id, faq.question)

                return (
                  <div key={faq.id} className="flex gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      <div className="space-y-1">
                        <Input
                          placeholder="Question..."
                          value={faq.question}
                          onChange={(e) => updateFaq(faq.id, "question", e.target.value)}
                          className={cn(
                            isDuplicateQuestion && "border-amber-300 focus:border-amber-500"
                          )}
                        />
                        {isDuplicateQuestion && (
                          <span className="text-xs text-amber-600">
                            ⚠️ This question is already asked in another FAQ
                          </span>
                        )}
                      </div>
                      <Textarea
                        placeholder="Answer..."
                        value={faq.answer}
                        onChange={(e) => updateFaq(faq.id, "answer", e.target.value)}
                        rows={2}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFaq(faq.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}

              {faqs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No FAQs added yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Extra details about your event</CardDescription>
              </div>
              <Button onClick={addAdditionalInfo} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Info
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {additionalInfo.map((info, index) => {
                const isDuplicateTitle = isAdditionalInfoTitleDuplicate(info.id, info.title)

                return (
                  <div key={info.id} className="flex gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      <div className="space-y-1">
                        <Input
                          placeholder="Info title..."
                          value={info.title}
                          onChange={(e) => updateAdditionalInfo(info.id, "title", e.target.value)}
                          className={cn(
                            isDuplicateTitle && "border-amber-300 focus:border-amber-500"
                          )}
                        />
                        {isDuplicateTitle && (
                          <span className="text-xs text-amber-600">
                            ⚠️ This title is already used in another info item
                          </span>
                        )}
                      </div>
                      <Textarea
                        placeholder="Info content..."
                        value={info.content}
                        onChange={(e) => updateAdditionalInfo(info.id, "content", e.target.value)}
                        rows={2}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAdditionalInfo(info.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}

              {additionalInfo.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Info className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No additional info added yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href={`/teacher/clubs/${clubId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Event
              </>
            )}
          </Button>
        </div>

        {/* Validation Errors Modal */}
        <EventValidationErrorsModal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          errors={validationErrors}
        />

        {/* Scheduling Conflict Modal */}
        <EventConflictModal
          isOpen={showConflictModal}
          onClose={() => setShowConflictModal(false)}
          onProceed={handleProceedDespiteConflict}
          conflictingEvents={
            eventsOnDate?.data?.filter((event) => event.time === time && event.date === date) || []
          }
          newEventDate={date}
          newEventTime={time}
        />

        {/* Confirmation Modal */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Club Event?</DialogTitle>
              <DialogDescription>
                This will create a new event for {club?.name}. The event will be {status === EventStatus.PUBLISHED ? "published immediately" : "saved as a draft"}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button onClick={confirmSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
