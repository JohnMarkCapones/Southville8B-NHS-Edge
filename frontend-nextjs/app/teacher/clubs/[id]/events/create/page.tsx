"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
  Users,
  Trophy,
  BookOpen,
  ImageIcon,
  X,
} from "lucide-react"

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

export default function CreateEventPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    image: null as File | null,
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [highlights, setHighlights] = useState<EventHighlight[]>([{ id: "1", text: "" }])

  const [schedule, setSchedule] = useState<ScheduleItem[]>([{ id: "1", time: "", activity: "", description: "" }])

  const [faqs, setFaqs] = useState<FAQ[]>([{ id: "1", question: "", answer: "" }])

  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo[]>([{ id: "1", title: "", content: "" }])

  const [selectedTemplate, setSelectedTemplate] = useState<string>("")

  const eventTemplates = {
    competition: {
      title: "Math Competition",
      description: "Annual mathematics competition featuring challenging problems and team collaboration.",
      highlights: ["Individual and team categories", "Prizes for top performers", "Certificate for all participants"],
      schedule: [
        { time: "9:00 AM", activity: "Registration", description: "Check-in and team assignments" },
        { time: "10:00 AM", activity: "Opening Ceremony", description: "Welcome and competition rules" },
        { time: "10:30 AM", activity: "Competition Round 1", description: "Individual problem solving" },
        { time: "12:00 PM", activity: "Lunch Break", description: "Refreshments provided" },
        { time: "1:00 PM", activity: "Competition Round 2", description: "Team collaboration round" },
        { time: "3:00 PM", activity: "Awards Ceremony", description: "Recognition and prizes" },
      ],
      faqs: [
        { question: "What should I bring?", answer: "Bring calculators, writing materials, and a positive attitude!" },
        {
          question: "Are there prizes?",
          answer: "Yes! Trophies for top 3 teams and certificates for all participants.",
        },
      ],
    },
    workshop: {
      title: "Advanced Calculus Workshop",
      description: "Interactive workshop covering advanced calculus concepts and real-world applications.",
      highlights: ["Expert instructor", "Hands-on practice", "Take-home materials"],
      schedule: [
        { time: "2:00 PM", activity: "Introduction", description: "Overview of topics to be covered" },
        { time: "2:30 PM", activity: "Theory Session", description: "Core concepts and principles" },
        { time: "3:30 PM", activity: "Practice Problems", description: "Guided problem-solving" },
        { time: "4:30 PM", activity: "Q&A Session", description: "Questions and discussion" },
      ],
      faqs: [
        { question: "What level is this workshop?", answer: "Designed for students with basic calculus knowledge." },
        { question: "Will materials be provided?", answer: "Yes, all worksheets and reference materials included." },
      ],
    },
    meeting: {
      title: "Monthly Club Meeting",
      description: "Regular club meeting to discuss upcoming events, member updates, and club business.",
      highlights: ["Member updates", "Event planning", "Open discussion"],
      schedule: [
        { time: "3:30 PM", activity: "Welcome & Attendance", description: "Check-in and introductions" },
        { time: "3:45 PM", activity: "Previous Meeting Review", description: "Review action items" },
        { time: "4:00 PM", activity: "New Business", description: "Upcoming events and initiatives" },
        { time: "4:30 PM", activity: "Open Discussion", description: "Member input and suggestions" },
        { time: "4:45 PM", activity: "Next Steps", description: "Action items and assignments" },
      ],
      faqs: [
        { question: "Is attendance mandatory?", answer: "Attendance is encouraged but not mandatory." },
        { question: "Can I suggest agenda items?", answer: "Yes! Contact officers before the meeting." },
      ],
    },
  }

  const applyTemplate = (templateKey: string) => {
    const template = eventTemplates[templateKey as keyof typeof eventTemplates]
    if (!template) return

    setEventData((prev) => ({
      ...prev,
      title: template.title,
      description: template.description,
    }))

    setHighlights(
      template.highlights.map((text, index) => ({
        id: (index + 1).toString(),
        text,
      })),
    )

    setSchedule(
      template.schedule.map((item, index) => ({
        id: (index + 1).toString(),
        time: item.time,
        activity: item.activity,
        description: item.description,
      })),
    )

    setFaqs(
      template.faqs.map((faq, index) => ({
        id: (index + 1).toString(),
        question: faq.question,
        answer: faq.answer,
      })),
    )

    setSelectedTemplate(templateKey)
  }

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

  const handleSave = () => {
    console.log("Event Data:", {
      ...eventData,
      highlights: highlights.filter((h) => h.text.trim()),
      schedule: schedule.filter((s) => s.time.trim() && s.activity.trim()),
      faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
      additionalInfo: additionalInfo.filter((a) => a.title.trim() && a.content.trim()),
    })

    router.push(`/teacher/clubs/${params.id}?section=events`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b shadow-sm sticky top-0 z-50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create New Event</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Plan and organize your club event</p>
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
                Create Event
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <Card className="shadow-xl border-0 dark:border dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/30 dark:to-pink-900/30 border-b dark:border-gray-700/50">
            <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
              Quick Start Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  key: "competition",
                  name: "Competition",
                  icon: Trophy,
                  color: "bg-yellow-500",
                  desc: "Math competitions and contests",
                },
                {
                  key: "workshop",
                  name: "Workshop",
                  icon: BookOpen,
                  color: "bg-blue-500",
                  desc: "Educational workshops",
                },
                { key: "meeting", name: "Meeting", icon: Users, color: "bg-green-500", desc: "Regular club meetings" },
              ].map((template) => (
                <div
                  key={template.key}
                  onClick={() => applyTemplate(template.key)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedTemplate === template.key
                      ? "border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600"
                  }`}
                >
                  <template.icon className={`w-8 h-8 mx-auto ${template.color.replace("bg-", "text-")} mb-3`} />
                  <h3 className="font-semibold text-center text-gray-900 dark:text-white">{template.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">{template.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center">
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Selected: {eventData.image?.name}
                    </p>
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
                    <div className="mt-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center bg-gray-50/50 dark:bg-gray-700/30">
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Choose an image to see preview here</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Supports JPG, PNG, GIF up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 dark:border dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 dark:from-yellow-900/30 dark:to-orange-900/30 border-b dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                Event Highlights
              </CardTitle>
              <Button
                onClick={addHighlight}
                size="sm"
                variant="outline"
                className="dark:border-gray-600 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Highlight
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {highlights.map((highlight, index) => (
                <div key={highlight.id} className="flex items-center space-x-3">
                  <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
                  >
                    {index + 1}
                  </Badge>
                  <Input
                    value={highlight.text}
                    onChange={(e) => updateHighlight(highlight.id, e.target.value)}
                    placeholder="Enter event highlight"
                    className="flex-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100"
                  />
                  {highlights.length > 1 && (
                    <Button
                      onClick={() => removeHighlight(highlight.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 dark:border dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 border-b dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                Event Schedule
              </CardTitle>
              <Button
                onClick={addScheduleItem}
                size="sm"
                variant="outline"
                className="dark:border-gray-600 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Schedule Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {schedule.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-700/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                    >
                      Item {index + 1}
                    </Badge>
                    {schedule.length > 1 && (
                      <Button
                        onClick={() => removeScheduleItem(item.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Time</Label>
                      <Input
                        value={item.time}
                        onChange={(e) => updateScheduleItem(item.id, "time", e.target.value)}
                        placeholder="e.g., 9:00 AM"
                        className="mt-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Activity</Label>
                      <Input
                        value={item.activity}
                        onChange={(e) => updateScheduleItem(item.id, "activity", e.target.value)}
                        placeholder="Activity name"
                        className="mt-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateScheduleItem(item.id, "description", e.target.value)}
                        placeholder="Brief description"
                        className="mt-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 dark:border dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-900/30 dark:to-indigo-900/30 border-b dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                Frequently Asked Questions
              </CardTitle>
              <Button onClick={addFAQ} size="sm" variant="outline" className="dark:border-gray-600 bg-transparent">
                <Plus className="w-4 h-4 mr-1" />
                Add FAQ
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-700/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      variant="outline"
                      className="text-purple-600 border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                    >
                      FAQ {index + 1}
                    </Badge>
                    {faqs.length > 1 && (
                      <Button
                        onClick={() => removeFAQ(faq.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Question</Label>
                      <Input
                        value={faq.question}
                        onChange={(e) => updateFAQ(faq.id, "question", e.target.value)}
                        placeholder="Enter question"
                        className="mt-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Answer</Label>
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => updateFAQ(faq.id, "answer", e.target.value)}
                        placeholder="Enter answer"
                        rows={3}
                        className="mt-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 dark:border dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-cyan-50/80 to-blue-50/80 dark:from-cyan-900/30 dark:to-blue-900/30 border-b dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                <Info className="w-5 h-5 mr-2 text-cyan-600 dark:text-cyan-400" />
                Additional Information
              </CardTitle>
              <Button
                onClick={addAdditionalInfo}
                size="sm"
                variant="outline"
                className="dark:border-gray-600 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Section
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {additionalInfo.map((info, index) => (
                <div
                  key={info.id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-700/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      variant="outline"
                      className="text-cyan-600 border-cyan-300 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20"
                    >
                      Section {index + 1}
                    </Badge>
                    {additionalInfo.length > 1 && (
                      <Button
                        onClick={() => removeAdditionalInfo(info.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Title</Label>
                      <Input
                        value={info.title}
                        onChange={(e) => updateAdditionalInfo(info.id, "title", e.target.value)}
                        placeholder="Section title"
                        className="mt-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Content</Label>
                      <Textarea
                        value={info.content}
                        onChange={(e) => updateAdditionalInfo(info.id, "content", e.target.value)}
                        placeholder="Section content"
                        rows={4}
                        className="mt-1 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
            Create Event
          </Button>
        </div>
      </div>
    </div>
  )
}
