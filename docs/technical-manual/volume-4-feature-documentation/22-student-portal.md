# Chapter 22: Student Portal

## Table of Contents
- [Overview](#overview)
- [Dashboard](#dashboard)
- [Academic Features](#academic-features)
- [Assignments & Quizzes](#assignments--quizzes)
- [Grades & Performance](#grades--performance)
- [Productivity Tools](#productivity-tools)
- [Gamification System](#gamification-system)
- [Student Publisher](#student-publisher)
- [Clubs & Activities](#clubs--activities)
- [Schedule & Calendar](#schedule--calendar)
- [Communication Features](#communication-features)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Overview

The **Student Portal** is the primary interface for students to access all academic and extracurricular features of the Southville 8B NHS Edge platform. It provides a comprehensive, gamified learning experience with real-time updates, productivity tools, and social features.

###Key Features

- **Personalized Dashboard** with live updates and quick actions
- **Academic Management** - assignments, quizzes, grades, courses
- **Productivity Suite** - notes, todos, goals, Pomodoro timer
- **Gamification** - points, badges, levels, leaderboards
- **Publisher Platform** - student journalism and content creation
- **Social Features** - clubs, events, news feed
- **Real-time Chat** - messaging with peers and teachers
- **Mobile-Responsive** - optimized for all devices

### Route Structure

```
/student/
├── page.tsx                    # Dashboard
├── layout.tsx                  # Protected layout with RBAC
├── assignments/                # Assignment submissions
├── quiz/                       # Quiz participation
├── grades/                     # Grade tracking
├── courses/                    # Course materials
├── notes/                      # Note-taking
├── todo/                       # Task management
├── goals/                      # Goal tracking
├── pomodoro/                   # Focus timer
├── publisher/                  # Journalism platform
├── clubs/                      # Club management
├── events/                     # School events
├── schedule/                   # Class schedule
├── calendar/                   # Academic calendar
├── ranking/                    # Leaderboards
├── achievements/               # Badges & achievements
├── news/                       # School news
└── chat/                       # Messaging
```

---

## Dashboard

### Dashboard Overview

The student dashboard serves as the **central hub** for all activities:

**File:** `app/student/page.tsx`

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import StudentLayout from "@/components/student/student-layout"
import { useUser } from "@/hooks/useUser"
import { useMySchedule } from "@/hooks/useSchedules"
import { useEvents } from "@/hooks/useEvents"

export default function StudentDashboard() {
  const router = useRouter()
  const { data: user } = useUser()
  const { data: schedules } = useMySchedule()
  const { data: eventsResponse } = useEvents({ limit: 5 })

  // Gamification state
  const [gamificationProfile, setGamificationProfile] = useState(null)

  // Get today's schedule
  const getTodaysSchedule = () => {
    if (!schedules) return []
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    return schedules.filter(schedule => schedule.dayOfWeek === today)
  }

  return (
    <StudentLayout>
      {/* Welcome Section */}
      <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold">Welcome back, {user?.first_name}!</h1>
          <p className="opacity-90">Ready to conquer your goals today?</p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction title="Join Quiz" icon={Brain} onClick={() => router.push("/student/quiz")} />
        <QuickAction title="View Grades" icon={TrendingUp} onClick={() => router.push("/student/grades")} />
        <QuickAction title="Assignments" icon={BookOpen} onClick={() => router.push("/student/assignments")} />
        <QuickAction title="Resources" icon={BookMarked} onClick={() => router.push("/student/courses")} />
      </div>

      {/* Stats Grid - Gamification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Points"
          value={gamificationProfile?.points.total || 0}
          icon={Zap}
          color="from-green-500 to-green-600"
        />
        <StatsCard
          title="Level"
          value={gamificationProfile?.level.current || 1}
          icon={Trophy}
          color="from-orange-500 to-orange-600"
        />
        <StatsCard
          title="Streak"
          value={`${gamificationProfile?.streak.current || 0} days`}
          icon={Flame}
          color="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Badges"
          value={badgesData?.earned.length || 0}
          icon={Star}
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {getTodaysSchedule().map((classItem, index) => (
            <ScheduleItem key={index} {...classItem} />
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {eventsResponse?.data.map((event) => (
            <EventItem key={event.id} {...event} />
          ))}
        </CardContent>
      </Card>
    </StudentLayout>
  )
}
```

### Dashboard Components

#### Quick Action Buttons

Provide one-tap access to frequently used features:

```typescript
interface QuickActionProps {
  title: string
  icon: LucideIcon
  color: string
  onClick: () => void
}

function QuickAction({ title, icon: Icon, color, onClick }: QuickActionProps) {
  return (
    <Button
      onClick={onClick}
      className={`${color} text-white h-16 flex flex-col items-center justify-center hover:scale-105 transition-transform`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{title}</span>
    </Button>
  )
}
```

#### Stats Cards (Gamification)

Display key metrics with visual appeal:

```typescript
interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: string
}

function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  return (
    <Card className={`bg-gradient-to-br ${color} text-white hover:scale-105 transition-transform`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <Icon className="w-8 h-8 opacity-80" />
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Academic Features

### Course Materials

Access course content, modules, and learning resources:

**File:** `app/student/courses/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, Video, Download } from "lucide-react"

export default function CoursesPage() {
  const [activeSubject, setActiveSubject] = useState("all")

  const subjects = [
    {
      id: "math",
      name: "Mathematics",
      modules: [
        {
          id: "mod-1",
          title: "Introduction to Algebra",
          type: "pdf",
          downloadUrl: "/modules/math-algebra.pdf"
        },
        {
          id: "mod-2",
          title: "Geometry Basics",
          type: "video",
          videoUrl: "/videos/geometry-intro.mp4"
        }
      ]
    },
    // ... more subjects
  ]

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Course Materials</h1>

        <Tabs value={activeSubject} onValueChange={setActiveSubject}>
          <TabsList>
            <TabsTrigger value="all">All Subjects</TabsTrigger>
            {subjects.map(subject => (
              <TabsTrigger key={subject.id} value={subject.id}>
                {subject.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeSubject}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects
                .filter(s => activeSubject === "all" || s.id === activeSubject)
                .flatMap(subject => subject.modules)
                .map(module => (
                  <ModuleCard key={module.id} module={module} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  )
}

function ModuleCard({ module }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {module.type === "pdf" ? <FileText className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          {module.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => window.open(module.downloadUrl)}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

## Assignments & Quizzes

### Assignment Submission

Submit assignments with file uploads and tracking:

```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { assignmentsApi } from "@/lib/api/endpoints/assignments"

export default function AssignmentSubmissionPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [comments, setComments] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!file) {
      toast({ title: "Error", description: "Please select a file", variant: "destructive" })
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("comments", comments)

      await assignmentsApi.submitAssignment(params.id, formData)

      toast({ title: "Success", description: "Assignment submitted successfully" })
      router.push("/student/assignments")
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit assignment", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <StudentLayout>
      <Card>
        <CardHeader>
          <CardTitle>Submit Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Upload File</label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any notes for your teacher..."
              rows={4}
            />
          </div>

          <Button onClick={handleSubmit} disabled={submitting || !file}>
            {submitting ? "Submitting..." : "Submit Assignment"}
          </Button>
        </CardContent>
      </Card>
    </StudentLayout>
  )
}
```

### Quiz Participation

Take quizzes with real-time validation:

```typescript
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { quizApi } from "@/lib/api/endpoints/quiz"

export default function QuizPage({ params }: { params: { id: string } }) {
  const [quiz, setQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    // Load quiz
    quizApi.getQuiz(params.id).then(setQuiz)
  }, [params.id])

  useEffect(() => {
    // Timer countdown
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && quiz) {
      handleSubmit() // Auto-submit when time expires
    }
  }, [timeRemaining])

  const handleSubmit = async () => {
    const result = await quizApi.submitQuiz(params.id, {
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }))
    })

    router.push(`/student/quiz/${params.id}/results`)
  }

  if (!quiz) return <div>Loading...</div>

  const question = quiz.questions[currentQuestion]

  return (
    <StudentLayout>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{quiz.title}</CardTitle>
            <div className="text-lg font-semibold">
              Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
          </div>

          <h3 className="text-lg font-medium mb-4">{question.text}</h3>

          <RadioGroup
            value={answers[question.id]}
            onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id}>{option.text}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            {currentQuestion < quiz.questions.length - 1 ? (
              <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Submit Quiz
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </StudentLayout>
  )
}
```

---

## Grades & Performance

### Grade Tracking Dashboard

**File:** `app/student/grades/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Award, Star } from "lucide-react"

export default function GradesPage() {
  const [selectedSemester, setSelectedSemester] = useState("current")

  const currentGrades = [
    {
      subject: "Mathematics",
      currentGrade: 96,
      trend: "+2.5",
      assignments: [
        { name: "Quiz 1", score: 95, maxScore: 100, weight: 0.2 },
        { name: "Midterm", score: 98, maxScore: 100, weight: 0.4 },
        { name: "Project", score: 94, maxScore: 100, weight: 0.3 }
      ]
    },
    // ... more subjects
  ]

  const calculateGWA = () => {
    const total = currentGrades.reduce((sum, s) => sum + s.currentGrade, 0)
    return (total / currentGrades.length).toFixed(1)
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* GWA Overview */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Current GWA</p>
                <p className="text-3xl font-bold">{calculateGWA()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">+0.4 from last semester</span>
                </div>
              </div>
              <Star className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        {/* Subject Grades */}
        <div className="space-y-4">
          {currentGrades.map((subject, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{subject.subject}</span>
                  <span className="text-2xl font-bold">{subject.currentGrade}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subject.assignments.map((assignment, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span>{assignment.name}</span>
                      <span className="font-medium">
                        {assignment.score}/{assignment.maxScore} ({(assignment.weight * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StudentLayout>
  )
}
```

---

## Productivity Tools

### Notes

**File:** `app/student/notes/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StickyNote, Plus, Trash2, Edit } from "lucide-react"

export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const addNote = () => {
    if (!title || !content) return

    setNotes([...notes, {
      id: Date.now(),
      title,
      content,
      createdAt: new Date(),
      color: getRandomColor()
    }])

    setTitle("")
    setContent("")
  }

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id))
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Note Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
            <Button onClick={addNote}>
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => (
            <Card key={note.id} className={`${note.color} hover:shadow-lg transition-shadow`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{note.title}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => deleteNote(note.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{note.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {note.createdAt.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StudentLayout>
  )
}

function getRandomColor() {
  const colors = [
    "bg-yellow-100",
    "bg-blue-100",
    "bg-green-100",
    "bg-pink-100",
    "bg-purple-100"
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
```

### Pomodoro Timer

**File:** `app/student/pomodoro/page.tsx`

```typescript
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer, Play, Pause, RotateCcw } from "lucide-react"

export default function PomodoroPage() {
  const [time, setTime] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<"work" | "break">("work")

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(time - 1)
      }, 1000)
    } else if (time === 0) {
      // Timer completed
      if (mode === "work") {
        setMode("break")
        setTime(5 * 60) // 5-minute break
      } else {
        setMode("work")
        setTime(25 * 60)
      }
      setIsActive(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, time, mode])

  const toggleTimer = () => setIsActive(!isActive)
  const resetTimer = () => {
    setIsActive(false)
    setTime(mode === "work" ? 25 * 60 : 5 * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <StudentLayout>
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Pomodoro Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className={`text-6xl font-bold ${mode === "work" ? "text-red-500" : "text-green-500"}`}>
            {formatTime(time)}
          </div>

          <div className="text-lg font-medium">
            {mode === "work" ? "Focus Time" : "Break Time"}
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={toggleTimer} size="lg">
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button onClick={resetTimer} variant="outline" size="lg">
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </StudentLayout>
  )
}
```

---

## Gamification System

### Points & Levels

Students earn points for activities:

```typescript
// Point earning activities
const POINT_VALUES = {
  QUIZ_COMPLETION: 50,
  ASSIGNMENT_SUBMISSION: 30,
  PERFECT_SCORE: 100,
  LOGIN_STREAK: 10,
  MODULE_DOWNLOAD: 5,
  CLUB_JOIN: 20,
  EVENT_ATTENDANCE: 15
}

// Level titles
const LEVEL_TITLES = {
  1: "Novice Scholar",
  5: "Eager Learner",
  10: "Dedicated Student",
  15: "Academic Achiever",
  20: "Knowledge Seeker",
  25: "Excellence Pursuer",
  30: "Master Scholar"
}
```

### Leaderboard

**File:** `app/student/ranking/page.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Award } from "lucide-react"
import { getLeaderboard } from "@/lib/api/endpoints/gamification"

export default function RankingPage() {
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    getLeaderboard({ scope: "global", limit: 50 }).then(data => {
      setLeaderboard(data.entries)
    })
  }, [])

  return (
    <StudentLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Global Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.user_id}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  index < 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50" : "bg-gray-50"
                }`}
              >
                <div className="text-2xl font-bold w-12 text-center">
                  {index + 1}
                </div>

                {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                {index === 1 && <Medal className="w-6 h-6 text-gray-400" />}
                {index === 2 && <Award className="w-6 h-6 text-orange-600" />}

                <div className="flex-1">
                  <p className="font-medium">{entry.username}</p>
                  <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">{entry.total_points}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </StudentLayout>
  )
}
```

---

## Student Publisher

### Article Creation

Student journalism platform for content creation:

```typescript
"use client"

import { useState } from "react"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { newsApi } from "@/lib/api/endpoints/news"

export default function CreateArticlePage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState<"draft" | "submitted">("draft")

  const handleSave = async (publishStatus: "draft" | "submitted") => {
    const result = await newsApi.createArticle({
      title,
      content,
      status: publishStatus,
      category_id: 1
    })

    toast({
      title: "Success",
      description: `Article ${publishStatus === "draft" ? "saved" : "submitted for review"}`
    })

    router.push("/student/publisher")
  }

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Input
          placeholder="Article Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold"
        />

        <TiptapEditor
          content={content}
          onChange={(html) => setContent(html)}
          editable={true}
        />

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleSave("draft")}>
            Save Draft
          </Button>
          <Button onClick={() => handleSave("submitted")}>
            Submit for Review
          </Button>
        </div>
      </div>
    </StudentLayout>
  )
}
```

---

## Best Practices

### ✅ Do's

1. **Use SWR for data fetching**
   ```typescript
   const { data, error, isLoading } = useSWR('/api/grades', fetcher)
   ```

2. **Implement loading states**
   ```typescript
   if (isLoading) return <Skeleton />
   if (error) return <ErrorState />
   return <Content data={data} />
   ```

3. **Add optimistic updates**
   ```typescript
   mutate('/api/notes', [...notes, newNote], false)
   await addNote(newNote)
   mutate('/api/notes')
   ```

4. **Mobile-first design**
   ```typescript
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
   ```

### ❌ Don'ts

1. **Don't fetch in loops**
   ```typescript
   // ❌ WRONG
   students.forEach(async student => {
     const grade = await getGrade(student.id)
   })

   // ✅ CORRECT
   const grades = await Promise.all(students.map(s => getGrade(s.id)))
   ```

2. **Don't ignore error handling**
   ```typescript
   // ❌ WRONG
   const data = await api.getData()

   // ✅ CORRECT
   try {
     const data = await api.getData()
   } catch (error) {
     toast({ title: "Error", variant: "destructive" })
   }
   ```

---

## Troubleshooting

### Issue: Quiz timer not counting down

**Solution:**
```typescript
useEffect(() => {
  const timer = setInterval(() => {
    setTimeRemaining(prev => {
      if (prev <= 0) {
        clearInterval(timer)
        return 0
      }
      return prev - 1
    })
  }, 1000)

  return () => clearInterval(timer)
}, [])
```

### Issue: File upload fails

**Solution:**
```typescript
const formData = new FormData()
formData.append("file", file)

await fetch('/api/upload', {
  method: 'POST',
  body: formData, // Don't set Content-Type header
})
```

---

## Summary

The Student Portal provides a **comprehensive learning experience** with:
- ✅ Personalized dashboard
- ✅ Academic management tools
- ✅ Productivity features
- ✅ Gamification incentives
- ✅ Content creation platform
- ✅ Real-time updates

---

## Navigation

- **Previous Chapter:** [Chapter 21: Authentication & Authorization](./21-authentication-authorization.md)
- **Next Chapter:** [Chapter 23: Teacher Portal](./23-teacher-portal.md)
- **Volume Index:** [Volume 4: Feature Documentation](./README.md)
