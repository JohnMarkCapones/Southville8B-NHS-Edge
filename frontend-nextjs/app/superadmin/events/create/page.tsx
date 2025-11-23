"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TimePicker } from "@/components/ui/time-picker"
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
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useCreateEvent, useUpdateEvent, useEvents } from "@/hooks/useEvents"
import { useUser } from "@/hooks/useUser"
import { uploadEventImage } from "@/lib/api/endpoints/events"
import { EventStatus, EventVisibility, type Event } from "@/lib/api/types/events"
import { validateEvent, type ValidationResult, hasBlockingErrors, hasWarnings } from "@/lib/utils/event-validations"
import { EventValidationModal } from "@/components/events/event-validation-modal"

interface EventHighlight {
  id: string
  text: string
}

interface ScheduleItem {
  id: string
  time: string
  title: string
}

interface FAQ {
  id: string
  question: string
  answer: string
}

interface AdditionalInfo {
  id: string
  text: string
}

interface CreateEventPageProps {
  initialData?: Event | null
  isEditMode?: boolean
  eventId?: string | null
}

export default function CreateEventPage({
  initialData = null,
  isEditMode = false,
  eventId = null
}: CreateEventPageProps = {}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const createEventMutation = useCreateEvent()
  const updateEventMutation = useUpdateEvent()
  const { data: user, isLoading: userLoading } = useUser()

  // Fetch existing events for validation
  const { data: eventsData } = useEvents({ limit: 1000 })
  const existingEvents = eventsData?.data || []

  // Validation state
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [validationOverridden, setValidationOverridden] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [venue, setVenue] = useState("")
  const [attendance, setAttendance] = useState("")
  const [status, setStatus] = useState<EventStatus>(EventStatus.DRAFT)
  const [visibility, setVisibility] = useState<EventVisibility>(EventVisibility.PUBLIC)

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Use ref to persist metadata across re-renders
  const cloudflareImageMetadataRef = useRef<{
    url: string
    cf_image_id: string
    cf_image_url: string
    fileSize: number
    mimeType: string
  } | null>(null)

  // Dynamic sections
  const [highlights, setHighlights] = useState<EventHighlight[]>([{ id: "1", text: "" }])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([{ id: "1", time: "", title: "" }])
  const [faqs, setFaqs] = useState<FAQ[]>([{ id: "1", question: "", answer: "" }])
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo[]>([{ id: "1", text: "" }])

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData && isEditMode) {
      console.log("Loading event data for edit:", initialData)

      // Basic fields
      setTitle(initialData.title || "")
      setDescription(initialData.description || "")
      setDate(initialData.date || "")
      setTime(initialData.time || "")
      setVenue(initialData.location || "")
      setStatus(initialData.status || EventStatus.DRAFT)
      setVisibility(initialData.visibility || EventVisibility.PUBLIC)

      console.log("Set basic fields:", {
        title: initialData.title,
        description: initialData.description,
        date: initialData.date,
        time: initialData.time,
        location: initialData.location,
        status: initialData.status,
        visibility: initialData.visibility
      })

      // Set existing image as preview
      if (initialData.eventImage) {
        setImagePreview(initialData.eventImage)
        console.log("Set image preview:", initialData.eventImage)
      }

      // Populate highlights
      if (Array.isArray(initialData.highlights) && initialData.highlights.length > 0) {
        const highlightsData = initialData.highlights.map((h, i) => ({
          id: String(i + 1),
          text: h.title || h.content || ""
        }))
        setHighlights(highlightsData)
        console.log("Set highlights:", highlightsData)
      }

      // Populate schedule
      if (Array.isArray(initialData.schedule) && initialData.schedule.length > 0) {
        const scheduleData = initialData.schedule.map((s, i) => ({
          id: String(i + 1),
          time: s.activityTime || "",
          title: s.activityDescription || ""
        }))
        setSchedule(scheduleData)
        console.log("Set schedule:", scheduleData)
      }

      // Populate FAQs
      if (Array.isArray(initialData.faq) && initialData.faq.length > 0) {
        const faqData = initialData.faq.map((f, i) => ({
          id: String(i + 1),
          question: f.question || "",
          answer: f.answer || ""
        }))
        setFaqs(faqData)
        console.log("Set FAQs:", faqData)
      }

      // Populate additional info
      if (Array.isArray(initialData.additionalInfo) && initialData.additionalInfo.length > 0) {
        const additionalInfoData = initialData.additionalInfo.map((a, i) => ({
          id: String(i + 1),
          text: a.content || a.title || ""
        }))
        setAdditionalInfo(additionalInfoData)
        console.log("Set additional info:", additionalInfoData)
      }

      console.log("Finished loading all event data")
    }
  }, [initialData, isEditMode])

  // Get all used times in schedule
  const usedTimes = schedule.map((item) => item.time).filter(Boolean)

  // Add functions for dynamic sections
  const addHighlight = () => {
    setHighlights([...highlights, { id: Date.now().toString(), text: "" }])
  }

  const removeHighlight = (id: string) => {
    if (highlights.length > 1) {
      setHighlights(highlights.filter((h) => h.id !== id))
    }
  }

  const updateHighlight = (id: string, text: string) => {
    setHighlights(highlights.map((h) => (h.id === id ? { ...h, text } : h)))
  }

  const addScheduleItem = () => {
    setSchedule([...schedule, { id: Date.now().toString(), time: "", title: "" }])
  }

  const removeScheduleItem = (id: string) => {
    if (schedule.length > 1) {
      setSchedule(schedule.filter((s) => s.id !== id))
    }
  }

  const updateScheduleItem = (id: string, field: "time" | "title", value: string) => {
    setSchedule(schedule.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const addFAQ = () => {
    setFaqs([...faqs, { id: Date.now().toString(), question: "", answer: "" }])
  }

  const removeFAQ = (id: string) => {
    if (faqs.length > 1) {
      setFaqs(faqs.filter((f) => f.id !== id))
    }
  }

  const updateFAQ = (id: string, field: "question" | "answer", value: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)))
  }

  const addAdditionalInfo = () => {
    setAdditionalInfo([...additionalInfo, { id: Date.now().toString(), text: "" }])
  }

  const removeAdditionalInfo = (id: string) => {
    if (additionalInfo.length > 1) {
      setAdditionalInfo(additionalInfo.filter((a) => a.id !== id))
    }
  }

  const updateAdditionalInfo = (id: string, text: string) => {
    setAdditionalInfo(additionalInfo.map((a) => (a.id === id ? { ...a, text } : a)))
  }

  // Image upload handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    cloudflareImageMetadataRef.current = null
  }

  const uploadImageToCloudflare = async (file: File): Promise<string | null> => {
    try {
      console.log("📤 Uploading image to Cloudflare...")
      const result = await uploadEventImage(file)
      console.log("✅ Cloudflare upload response:", result)

      // Store the full metadata in ref
      const metadata = {
        url: result.url || result.cf_image_url,
        cf_image_id: result.cf_image_id,
        cf_image_url: result.cf_image_url,
        fileSize: result.fileSize,
        mimeType: result.mimeType
      }

      console.log("💾 Storing Cloudflare metadata in ref:", metadata)
      cloudflareImageMetadataRef.current = metadata

      return result.url || result.cf_image_url
    } catch (error) {
      console.error('❌ Error uploading image:', error)
      throw error
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Basic validation
    if (!title.trim()) newErrors.title = "Title is required"
    if (!description.trim()) newErrors.description = "Description is required"
    if (!date) newErrors.date = "Date is required"
    if (!time) newErrors.time = "Time is required"
    if (!venue.trim()) newErrors.venue = "Venue is required"
    if (!attendance.trim()) newErrors.attendance = "Attendance is required"

    // Validate at least one filled item in each dynamic section
    const filledHighlights = highlights.filter((h) => h.text.trim())
    const validHighlights = highlights.filter((h) => h.text.trim() && h.text.trim().length >= 10)
    
    if (filledHighlights.length === 0) {
      newErrors.highlights = "At least one event highlight is required"
    } else if (validHighlights.length === 0) {
      newErrors.highlights = "At least one highlight must be at least 10 characters long"
    }

    // Validate highlight content length (backend requires 10+ characters)
    highlights.forEach((highlight, index) => {
      if (highlight.text.trim() && highlight.text.trim().length < 10) {
        newErrors[`highlight_${highlight.id}`] = "Highlight content must be at least 10 characters long"
      }
    })

    const filledSchedule = schedule.filter((s) => s.time && s.title.trim())
    if (filledSchedule.length === 0) {
      newErrors.schedule = "At least one schedule item is required"
    }

    const filledFAQs = faqs.filter((f) => f.question.trim() && f.answer.trim())
    if (filledFAQs.length === 0) {
      newErrors.faqs = "At least one FAQ is required"
    }

    const filledAdditionalInfo = additionalInfo.filter((a) => a.text.trim())
    if (filledAdditionalInfo.length === 0) {
      newErrors.additionalInfo = "At least one additional information item is required"
    }

    // Validate schedule items have both time and title
    schedule.forEach((item, index) => {
      if (item.time && !item.title.trim()) {
        newErrors[`schedule_${item.id}_title`] = "Title is required when time is selected"
      }
      if (!item.time && item.title.trim()) {
        newErrors[`schedule_${item.id}_time`] = "Time is required when title is provided"
      }
    })

    // Validate FAQs have both question and answer
    faqs.forEach((faq) => {
      if (faq.question.trim() && !faq.answer.trim()) {
        newErrors[`faq_${faq.id}_answer`] = "Answer is required when question is provided"
      }
      if (!faq.question.trim() && faq.answer.trim()) {
        newErrors[`faq_${faq.id}_question`] = "Question is required when answer is provided"
      }
      if (faq.question.trim() && faq.answer.trim() && faq.answer.trim().length < 10) {
        newErrors[`faq_${faq.id}_answer`] = "Answer must be at least 10 characters long"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Check if user is loaded
    if (userLoading || !user?.id) {
      console.error("User not loaded or not authenticated")
      return
    }

    // Basic form validation first
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]')
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    // Run event validations (date/time conflicts, etc.)
    const validations = validateEvent(
      {
        title: title.trim(),
        description: description.trim(),
        date,
        time,
        location: venue.trim()
      },
      existingEvents,
      {
        allowPastDates: false,              // Block past dates
        minimumLeadTimeHours: 2,            // Warn if less than 2 hours notice
        allowSameDateEvents: true,          // Allow but warn
        allowSameDateTimeEvents: false,     // Block same date & time
        checkVenueConflicts: true,          // Check venue availability
        warnOnWeekends: false,              // Don't warn on weekends (schools can have weekend events)
        warnOnCloseProximity: true,         // Warn if events are close together
        proximityThresholdHours: 2          // 2 hour proximity threshold
      },
      eventId || undefined
    )

    // Filter out INFO level validations, keep only errors and warnings
    const failedValidations = validations.filter(v => !v.isValid)

    if (failedValidations.length > 0) {
      // If there are errors or warnings, show validation modal
      setValidationResults(failedValidations)
      setShowValidationModal(true)
      return
    }

    // No validation issues, proceed to confirmation
    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false)
    setIsSubmitting(true)

    try {
      // Upload image first if selected (new image uploaded)
      let imageUrl: string | undefined = undefined
      if (selectedImage) {
        try {
          imageUrl = await uploadImageToCloudflare(selectedImage) || undefined
        } catch (error) {
          console.error("Failed to upload image:", error)
          alert(`Failed to upload image. ${isEditMode ? 'Updating' : 'Creating'} event without new image.`)
        }
      } else if (isEditMode && imagePreview && initialData?.eventImage) {
        // Keep existing image if in edit mode and no new image selected
        imageUrl = initialData.eventImage
      }

      // Filter out empty items and map to API format
      const eventData: any = {
        title: title.trim(),
        description: description.trim(),
        date,
        time,
        location: venue.trim(),
        organizerId: user?.id || initialData?.organizer?.id || "",
        eventImage: imageUrl,
        status,
        visibility,
        highlights: highlights
          .filter((h) => h.text.trim() && h.text.trim().length >= 10)
          .map((h) => ({ title: h.text, content: h.text, imageUrl: undefined })),
        schedule: schedule
          .filter((s) => s.time && s.title.trim())
          .map((s) => ({ activityTime: s.time, activityDescription: s.title })),
        faq: faqs
          .filter((f) => f.question.trim() && f.answer.trim() && f.answer.trim().length >= 10)
          .map((f) => ({ question: f.question, answer: f.answer })),
        additionalInfo: additionalInfo
          .filter((a) => a.text.trim())
          .map((a) => ({ title: "Additional Info", content: a.text })),
      }

      // Add Cloudflare Images metadata if available
      const cfMetadata = cloudflareImageMetadataRef.current
      console.log("🔍 Checking cloudflareImageMetadataRef.current:", cfMetadata)

      if (cfMetadata) {
        console.log("🖼️ Adding Cloudflare Images metadata to event:", cfMetadata)
        eventData.cfImageId = cfMetadata.cf_image_id
        eventData.cfImageUrl = cfMetadata.cf_image_url
        eventData.imageFileSize = cfMetadata.fileSize
        eventData.imageMimeType = cfMetadata.mimeType
      } else {
        console.warn("⚠️ No Cloudflare metadata available to add")
        console.warn("⚠️ This means either no image was uploaded, or metadata was lost")
      }

      console.log(`📨 ${isEditMode ? 'Updating' : 'Creating'} event with data:`, eventData)
      console.log("🔍 Event data keys:", Object.keys(eventData))
      console.log("🎯 Image fields:", {
        eventImage: eventData.eventImage,
        cfImageId: eventData.cfImageId,
        cfImageUrl: eventData.cfImageUrl,
        imageFileSize: eventData.imageFileSize,
        imageMimeType: eventData.imageMimeType
      })

      if (isEditMode && eventId) {
        // Update existing event
        await updateEventMutation.mutateAsync({ id: eventId, data: eventData })
      } else {
        // Create new event
        await createEventMutation.mutateAsync(eventData)
      }

      // Success - redirect to events page
      router.push("/superadmin/events")
    } catch (error) {
      console.error("Failed to create event:", error)
      // Error handling is done by the mutation hook
      // The mutation hook will show a toast notification
    } finally {
      setIsSubmitting(false)
    }
  }

  const getValidCounts = () => {
    const validHighlights = highlights.filter((h) => h.text.trim())
    const validSchedule = schedule.filter((s) => s.time && s.title.trim())
    const validFAQs = faqs.filter((f) => f.question.trim() && f.answer.trim())
    const validAdditionalInfo = additionalInfo.filter((a) => a.text.trim())
    return { validHighlights, validSchedule, validFAQs, validAdditionalInfo }
  }

  // Show loading state while user is being fetched
  if (userLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error if user is not authenticated
  if (!user?.id) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-500 opacity-50" />
            <p className="text-red-600 font-medium">Authentication required</p>
            <p className="text-muted-foreground text-sm mt-1">Please log in to create events</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6">
        <Link href="/superadmin/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>

      <Card className="border-2">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {isEditMode ? "Edit Event" : "Create New Event"}
              </CardTitle>
              <CardDescription>
                {isEditMode
                  ? "Update the event details below"
                  : "Fill in the details to create a new event"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>

              <div className="space-y-2" data-error={!!errors.title}>
                <Label htmlFor="title" className="text-base">
                  Event Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter event title"
                  className={cn(errors.title && "border-red-500")}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2" data-error={!!errors.description}>
                <Label htmlFor="description" className="text-base">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter event description"
                  rows={4}
                  className={cn(errors.description && "border-red-500")}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2" data-error={!!errors.date}>
                  <Label htmlFor="date" className="text-base">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={cn(errors.date && "border-red-500")}
                  />
                  {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                </div>

                <div className="space-y-2" data-error={!!errors.time}>
                  <Label htmlFor="time" className="text-base">
                    Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={cn(errors.time && "border-red-500")}
                  />
                  {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2" data-error={!!errors.attendance}>
                  <Label htmlFor="attendance" className="text-base">
                    Expected Attendance <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="attendance"
                    type="number"
                    value={attendance}
                    onChange={(e) => setAttendance(e.target.value)}
                    placeholder="e.g., 500"
                    className={cn(errors.attendance && "border-red-500")}
                  />
                  {errors.attendance && <p className="text-sm text-red-500">{errors.attendance}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-base">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as EventStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EventStatus.DRAFT}>Draft</SelectItem>
                      <SelectItem value={EventStatus.PUBLISHED}>Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility" className="text-base">
                    Visibility <span className="text-red-500">*</span>
                  </Label>
                  <Select value={visibility} onValueChange={(value) => setVisibility(value as EventVisibility)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EventVisibility.PUBLIC}>Public</SelectItem>
                      <SelectItem value={EventVisibility.PRIVATE}>Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2" data-error={!!errors.venue}>
                <Label htmlFor="venue" className="text-base">
                  Venue <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="venue"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Enter venue location"
                    className={cn("pl-10", errors.venue && "border-red-500")}
                  />
                </div>
                {errors.venue && <p className="text-sm text-red-500">{errors.venue}</p>}
              </div>

              {/* Event Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="event-image" className="text-base">
                  Event Image (Optional)
                </Label>
                <div className="space-y-3">
                  {!imagePreview ? (
                    <div className="relative border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        id="event-image"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden border-2 border-border">
                      <img
                        src={imagePreview}
                        alt="Event preview"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {imagePreview
                      ? "Image will be uploaded when you create the event"
                      : "Upload an eye-catching image for your event. This will be displayed on the event page."}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Highlights Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Event Highlights</h3>
                  <span className="text-sm text-muted-foreground">({highlights.length})</span>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addHighlight}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Highlight
                </Button>
              </div>
              {errors.highlights && (
                <p className="text-sm text-red-500 -mt-2" data-error="true">
                  {errors.highlights}
                </p>
              )}
              <div className="space-y-3">
                {highlights.map((highlight, index) => (
                  <div key={highlight.id} className="space-y-2">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Input
                          value={highlight.text}
                          onChange={(e) => updateHighlight(highlight.id, e.target.value)}
                          placeholder={`Highlight ${index + 1} (minimum 10 characters)`}
                          className={cn(errors[`highlight_${highlight.id}`] && "border-red-500")}
                        />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeHighlight(highlight.id)}
                        disabled={highlights.length === 1}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {errors[`highlight_${highlight.id}`] && (
                      <p className="text-xs text-red-500 ml-1">{errors[`highlight_${highlight.id}`]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Event Schedule Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Event Schedule / Program</h3>
                  <span className="text-sm text-muted-foreground">({schedule.length})</span>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addScheduleItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Schedule
                </Button>
              </div>
              {errors.schedule && (
                <p className="text-sm text-red-500 -mt-2" data-error="true">
                  {errors.schedule}
                </p>
              )}
              <div className="space-y-3">
                {schedule.map((item, index) => (
                  <div key={item.id} className="flex gap-2 items-start">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                      <div className="space-y-1" data-error={!!errors[`schedule_${item.id}_time`]}>
                        <TimePicker
                          value={item.time}
                          onChange={(time) => updateScheduleItem(item.id, "time", time)}
                          disabledTimes={usedTimes.filter((t) => t !== item.time)}
                          placeholder="Select time"
                        />
                        {errors[`schedule_${item.id}_time`] && (
                          <p className="text-xs text-red-500">{errors[`schedule_${item.id}_time`]}</p>
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-1" data-error={!!errors[`schedule_${item.id}_title`]}>
                        <Input
                          value={item.title}
                          onChange={(e) => updateScheduleItem(item.id, "title", e.target.value)}
                          placeholder="e.g., Opening Ceremony"
                          className={cn(errors[`schedule_${item.id}_title`] && "border-red-500")}
                        />
                        {errors[`schedule_${item.id}_title`] && (
                          <p className="text-xs text-red-500">{errors[`schedule_${item.id}_title`]}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeScheduleItem(item.id)}
                      disabled={schedule.length === 1}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
                  <span className="text-sm text-muted-foreground">({faqs.length})</span>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addFAQ}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add FAQ
                </Button>
              </div>
              {errors.faqs && (
                <p className="text-sm text-red-500 -mt-2" data-error="true">
                  {errors.faqs}
                </p>
              )}
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={faq.id} className="p-4">
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1" data-error={!!errors[`faq_${faq.id}_question`]}>
                          <Label className="text-sm font-medium">Question {index + 1}</Label>
                          <Input
                            value={faq.question}
                            onChange={(e) => updateFAQ(faq.id, "question", e.target.value)}
                            placeholder="Enter question"
                            className={cn(errors[`faq_${faq.id}_question`] && "border-red-500")}
                          />
                          {errors[`faq_${faq.id}_question`] && (
                            <p className="text-xs text-red-500">{errors[`faq_${faq.id}_question`]}</p>
                          )}
                        </div>
                        <div className="space-y-1" data-error={!!errors[`faq_${faq.id}_answer`]}>
                          <Label className="text-sm font-medium">Answer</Label>
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => updateFAQ(faq.id, "answer", e.target.value)}
                            placeholder="Enter answer"
                            rows={2}
                            className={cn(errors[`faq_${faq.id}_answer`] && "border-red-500")}
                          />
                          {errors[`faq_${faq.id}_answer`] && (
                            <p className="text-xs text-red-500">{errors[`faq_${faq.id}_answer`]}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFAQ(faq.id)}
                        disabled={faqs.length === 1}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                  <span className="text-sm text-muted-foreground">({additionalInfo.length})</span>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addAdditionalInfo}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Info
                </Button>
              </div>
              {errors.additionalInfo && (
                <p className="text-sm text-red-500 -mt-2" data-error="true">
                  {errors.additionalInfo}
                </p>
              )}
              <div className="space-y-3">
                {additionalInfo.map((info, index) => (
                  <div key={info.id} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Textarea
                        value={info.text}
                        onChange={(e) => updateAdditionalInfo(info.id, e.target.value)}
                        placeholder={`Additional information ${index + 1}`}
                        rows={2}
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeAdditionalInfo(info.id)}
                      disabled={additionalInfo.length === 1}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.push("/superadmin/events")} size="lg">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} size="lg" className="min-w-[150px]">
                {isSubmitting
                  ? (selectedImage
                      ? (isEditMode ? "Uploading & Updating..." : "Uploading & Creating...")
                      : (isEditMode ? "Updating..." : "Creating..."))
                  : (isEditMode ? "Update Event" : "Create Event")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  {isEditMode ? "Confirm Event Update" : "Confirm Event Creation"}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {isEditMode
                    ? "Please review the changes before updating this event"
                    : "Please review the details before creating this event"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Event Summary */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{venue}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <Badge variant="outline" className="text-xs">
                      {status === EventStatus.DRAFT ? "Draft" : "Published"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {visibility === EventVisibility.PUBLIC ? "Public" : "Private"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-medium text-blue-600">Highlights</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {getValidCounts().validHighlights.length}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-medium text-green-600">Schedule</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {getValidCounts().validSchedule.length}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-1">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <p className="text-xs font-medium text-purple-600">FAQs</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {getValidCounts().validFAQs.length}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4 text-orange-600" />
                    <p className="text-xs font-medium text-orange-600">Info Items</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                    {getValidCounts().validAdditionalInfo.length}
                  </p>
                </div>
              </div>

              {/* Preview Lists */}
              <div className="space-y-4 pt-2">
                {/* Highlights Preview */}
                {getValidCounts().validHighlights.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Event Highlights
                    </h4>
                    <ul className="space-y-1 pl-6">
                      {getValidCounts()
                        .validHighlights.slice(0, 3)
                        .map((highlight, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-blue-600 font-medium">•</span>
                            <span className="line-clamp-1">{highlight.text}</span>
                          </li>
                        ))}
                      {getValidCounts().validHighlights.length > 3 && (
                        <li className="text-sm text-muted-foreground italic pl-4">
                          +{getValidCounts().validHighlights.length - 3} more highlight
                          {getValidCounts().validHighlights.length - 3 !== 1 ? "s" : ""}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Schedule Preview */}
                {getValidCounts().validSchedule.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      Event Schedule
                    </h4>
                    <ul className="space-y-1 pl-6">
                      {getValidCounts()
                        .validSchedule.slice(0, 3)
                        .map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{item.time}:</span> {item.title}
                          </li>
                        ))}
                      {getValidCounts().validSchedule.length > 3 && (
                        <li className="text-sm text-muted-foreground italic pl-4">
                          +{getValidCounts().validSchedule.length - 3} more schedule item
                          {getValidCounts().validSchedule.length - 3 !== 1 ? "s" : ""}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* FAQs Preview */}
                {getValidCounts().validFAQs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-purple-600" />
                      Frequently Asked Questions
                    </h4>
                    <ul className="space-y-1 pl-6">
                      {getValidCounts()
                        .validFAQs.slice(0, 2)
                        .map((faq, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Q:</span> {faq.question}
                          </li>
                        ))}
                      {getValidCounts().validFAQs.length > 2 && (
                        <li className="text-sm text-muted-foreground italic pl-4">
                          +{getValidCounts().validFAQs.length - 2} more question
                          {getValidCounts().validFAQs.length - 2 !== 1 ? "s" : ""}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Warning Message */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Are you sure you want to create this event?
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  This will make the event visible to all students. You can edit the details later if needed.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isEditMode ? "Yes, Update Event" : "Yes, Create Event"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validation Modal */}
      <EventValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        onProceed={
          hasBlockingErrors(validationResults)
            ? undefined  // No proceed button for blocking errors
            : () => {
                // Close validation modal and proceed to confirmation
                setShowValidationModal(false)
                setValidationOverridden(true)
                setShowConfirmModal(true)
              }
        }
        validationResults={validationResults}
        mode={isEditMode ? 'edit' : 'create'}
      />
    </div>
  )
}
