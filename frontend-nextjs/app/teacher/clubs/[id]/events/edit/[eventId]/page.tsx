"use client"

import type React from "react"

import { useState, use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Star,
  HelpCircle,
  Info,
  Upload,
  Save,
  Eye,
  X,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEventById, useUpdateEvent } from "@/hooks/useEvents"
import Link from "next/link"

interface EventHighlight {
  id: string
  text: string
}

interface ScheduleItem {
  id: string
  time: string
  activity: string
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

export default function EditEventPage({ params }: { params: Promise<{ id: string; eventId: string }> }) {
  const { id: clubId, eventId } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch event data from API
  const { data: event, isLoading: loadingEvent } = useEventById(eventId)
  const updateEventMutation = useUpdateEvent()

  // Form state
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    status: "draft" as "draft" | "published",
    visibility: "public" as "public" | "private",
    image: null as File | null,
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [highlights, setHighlights] = useState<EventHighlight[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo[]>([])

  // Populate form when event data loads
  useEffect(() => {
    if (event) {
      setEventData({
        title: event.title || "",
        description: event.description || "",
        date: event.date || "",
        time: event.time || "",
        venue: event.location || "",
        status: event.status || "draft",
        visibility: event.visibility || "public",
        image: null,
      })

      if (event.eventImage) {
        setImagePreview(event.eventImage)
      }

      // Map highlights
      if (event.highlights) {
        setHighlights(
          event.highlights.map((h) => ({
            id: h.id,
            text: h.content || "",
          }))
        )
      }

      // Map schedule
      if (event.schedule) {
        setSchedule(
          event.schedule.map((s) => ({
            id: s.id,
            time: s.activityTime || "",
            activity: s.activityDescription || "",
            description: "",
          }))
        )
      }

      // Map FAQs
      if (event.faq) {
        setFaqs(
          event.faq.map((f) => ({
            id: f.id,
            question: f.question || "",
            answer: f.answer || "",
          }))
        )
      }

      // Map additional info
      if (event.additionalInfo) {
        setAdditionalInfo(
          event.additionalInfo.map((a) => ({
            id: a.id,
            title: a.title || "",
            content: a.content || "",
          }))
        )
      }
    }
  }, [event])

  const addHighlight = () => {
    const newId = (highlights.length + 1).toString()
    setHighlights([...highlights, { id: newId, text: "" }])
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
    const newId = (schedule.length + 1).toString()
    setSchedule([...schedule, { id: newId, time: "", activity: "", description: "" }])
  }

  const removeScheduleItem = (id: string) => {
    if (schedule.length > 1) {
      setSchedule(schedule.filter((s) => s.id !== id))
    }
  }

  const updateScheduleItem = (id: string, field: keyof ScheduleItem, value: string) => {
    setSchedule(schedule.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const addFAQ = () => {
    const newId = (faqs.length + 1).toString()
    setFaqs([...faqs, { id: newId, question: "", answer: "" }])
  }

  const removeFAQ = (id: string) => {
    if (faqs.length > 1) {
      setFaqs(faqs.filter((f) => f.id !== id))
    }
  }

  const updateFAQ = (id: string, field: keyof FAQ, value: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)))
  }

  const addAdditionalInfo = () => {
    const newId = (additionalInfo.length + 1).toString()
    setAdditionalInfo([...additionalInfo, { id: newId, title: "", content: "" }])
  }

  const removeAdditionalInfo = (id: string) => {
    if (additionalInfo.length > 1) {
      setAdditionalInfo(additionalInfo.filter((a) => a.id !== id))
    }
  }

  const updateAdditionalInfo = (id: string, field: keyof AdditionalInfo, value: string) => {
    setAdditionalInfo(additionalInfo.map((a) => (a.id === id ? { ...a, [field]: value } : a)))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEventData((prev) => ({ ...prev, image: file }))

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setEventData((prev) => ({ ...prev, image: null }))
    setImagePreview(null)
    const fileInput = document.getElementById("image") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const handleSave = async () => {
    try {
      const updateData = {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.venue,
        status: eventData.status,
        visibility: eventData.visibility,
      }

      await updateEventMutation.mutateAsync({
        id: eventId,
        data: updateData,
      })

      toast({
        title: "Event Updated",
        description: "Your event has been successfully updated.",
        variant: "default",
      })

      router.push(`/teacher/clubs/${clubId}?section=events`)
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update event. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Event not found</p>
          <Link href={`/teacher/clubs/${clubId}`}>
            <Button>Back to Club</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b shadow-sm sticky top-0 z-50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/teacher/clubs/${clubId}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Club
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Edit Event</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your club event details</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/80"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <Card className="shadow-xl border-0 dark:border dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 border-b dark:border-gray-700/50">
            <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="text-gray-700 dark:text-gray-300 font-medium">
                  Event Title *
                </Label>
                <Input
                  id="title"
                  value={eventData.title}
                  onChange={(e) => setEventData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title"
                  className="mt-2 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-gray-700 dark:text-gray-300 font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={eventData.description}
                  onChange={(e) => setEventData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your event"
                  rows={4}
                  className="mt-2 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                />
              </div>

              <div>
                <Label htmlFor="date" className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={eventData.date}
                  onChange={(e) => setEventData((prev) => ({ ...prev, date: e.target.value }))}
                  className="mt-2 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                />
              </div>

              <div>
                <Label htmlFor="time" className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Time *
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={eventData.time}
                  onChange={(e) => setEventData((prev) => ({ ...prev, time: e.target.value }))}
                  className="mt-2 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="venue" className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Venue *
                </Label>
                <Input
                  id="venue"
                  value={eventData.venue}
                  onChange={(e) => setEventData((prev) => ({ ...prev, venue: e.target.value }))}
                  placeholder="Event location"
                  className="mt-2 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                />
              </div>

              <div>
                <Label htmlFor="status" className="text-gray-700 dark:text-gray-300 font-medium">
                  Status *
                </Label>
                <Select
                  value={eventData.status}
                  onValueChange={(value: "draft" | "published") =>
                    setEventData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="mt-2 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="visibility" className="text-gray-700 dark:text-gray-300 font-medium">
                  Visibility *
                </Label>
                <Select
                  value={eventData.visibility}
                  onValueChange={(value: "public" | "private") =>
                    setEventData((prev) => ({ ...prev, visibility: value }))
                  }
                >
                  <SelectTrigger className="mt-2 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="image" className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                  <Upload className="w-4 h-4 mr-1" />
                  Event Image
                </Label>

                {imagePreview ? (
                  <div className="mt-3 relative">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Event preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Button
                          onClick={removeImage}
                          size="sm"
                          variant="destructive"
                          className="bg-red-500/80 hover:bg-red-600/80 backdrop-blur-sm"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <div className="relative">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mt-2 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Highlights Card */}
        <Card className="shadow-xl border-0 dark:border dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl opacity-60">
          <CardHeader className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 dark:from-yellow-900/30 dark:to-orange-900/30 border-b dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                Event Highlights
              </CardTitle>
              <Badge variant="outline" className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600">
                Read Only
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              ℹ️ Highlights can be viewed but cannot be edited yet. Use the event creation page to manage highlights.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {highlights.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No highlights added yet.</p>
              ) : (
                highlights.map((highlight, index) => (
                  <div key={highlight.id} className="flex items-center space-x-3">
                    <Badge
                      variant="outline"
                      className="text-yellow-600 border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
                    >
                      {index + 1}
                    </Badge>
                    <Input
                      value={highlight.text}
                      disabled
                      placeholder="Enter event highlight"
                      className="flex-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 cursor-not-allowed"
                    />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Schedule Card */}
        <Card className="shadow-xl border-0 dark:border dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl opacity-60">
          <CardHeader className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 border-b dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                Event Schedule
              </CardTitle>
              <Badge variant="outline" className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600">
                Read Only
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              ℹ️ Schedule can be viewed but cannot be edited yet. Use the event creation page to manage schedule.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {schedule.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No schedule items added yet.</p>
              ) : (
                schedule.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-700/30"
                  >
                    <div className="flex items-center mb-4">
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                      >
                        Item {index + 1}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Time</Label>
                        <Input
                          value={item.time}
                          disabled
                          placeholder="e.g., 9:00 AM"
                          className="mt-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Activity</Label>
                        <Input
                          value={item.activity}
                          disabled
                          placeholder="Activity name"
                          className="mt-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Description</Label>
                        <Input
                          value={item.description}
                          disabled
                          placeholder="Brief description"
                          className="mt-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* FAQs Card */}
        <Card className="shadow-xl border-0 dark:border dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl opacity-60">
          <CardHeader className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-900/30 dark:to-indigo-900/30 border-b dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                Frequently Asked Questions
              </CardTitle>
              <Badge variant="outline" className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600">
                Read Only
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              ℹ️ FAQs can be viewed but cannot be edited yet. Use the event creation page to manage FAQs.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {faqs.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No FAQs added yet.</p>
              ) : (
                faqs.map((faq, index) => (
                  <div
                    key={faq.id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-700/30"
                  >
                    <div className="flex items-center mb-4">
                      <Badge
                        variant="outline"
                        className="text-purple-600 border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                      >
                        FAQ {index + 1}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Question</Label>
                        <Input
                          value={faq.question}
                          disabled
                          placeholder="Enter question"
                          className="mt-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Answer</Label>
                        <Textarea
                          value={faq.answer}
                          disabled
                          placeholder="Enter answer"
                          rows={3}
                          className="mt-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Card */}
        <Card className="shadow-xl border-0 dark:border dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl opacity-60">
          <CardHeader className="bg-gradient-to-r from-cyan-50/80 to-blue-50/80 dark:from-cyan-900/30 dark:to-blue-900/30 border-b dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                <Info className="w-5 h-5 mr-2 text-cyan-600 dark:text-cyan-400" />
                Additional Information
              </CardTitle>
              <Badge variant="outline" className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600">
                Read Only
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              ℹ️ Additional information can be viewed but cannot be edited yet. Use the event creation page to manage additional info.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {additionalInfo.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No additional information added yet.</p>
              ) : (
                additionalInfo.map((info, index) => (
                  <div
                    key={info.id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-700/30"
                  >
                    <div className="flex items-center mb-4">
                      <Badge
                        variant="outline"
                        className="text-cyan-600 border-cyan-300 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20"
                      >
                        Section {index + 1}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Title</Label>
                        <Input
                          value={info.title}
                          disabled
                          placeholder="Section title"
                          className="mt-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Content</Label>
                        <Textarea
                          value={info.content}
                          disabled
                          placeholder="Section content"
                          rows={4}
                          className="mt-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 pb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
