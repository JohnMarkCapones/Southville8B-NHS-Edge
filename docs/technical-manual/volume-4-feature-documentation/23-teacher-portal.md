# Chapter 23: Teacher Portal

## Table of Contents
- [Overview](#overview)
- [Teacher Dashboard](#teacher-dashboard)
- [Class Management](#class-management)
- [Grading System](#grading-system)
- [Quiz Builder](#quiz-builder)
- [Assignment Management](#assignment-management)
- [Student Analytics](#student-analytics)
- [Communication Tools](#communication-tools)
- [Resource Management](#resource-management)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The **Teacher Portal** provides educators with comprehensive tools for classroom management, student assessment, content delivery, and analytics.

### Key Features

- **Class Management** - Organize students, sections, and schedules
- **Assignment Creation** - Create and distribute homework assignments
- **Quiz Builder** - Build assessments with multiple question types
- **Grading Tools** - Efficient grading with bulk actions and rubrics
- **Analytics Dashboard** - Track student performance and engagement
- **Resource Library** - Upload and share learning materials
- **Communication** - Message students and parents
- **Attendance Tracking** - Record and monitor attendance

### Route Structure

```
/teacher/
├── dashboard/          # Teacher homepage
├── classes/            # Class management
├── students/           # Student roster
├── assignments/        # Assignment creation & grading
├── quizzes/            # Quiz builder & results
├── grades/             # Grade book
├── resources/          # Learning materials
├── analytics/          # Performance metrics
├── schedule/           # Class schedule
└── communication/      # Messaging
```

---

## Teacher Dashboard

**File:** `app/teacher/dashboard/page.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, ClipboardCheck, TrendingUp } from "lucide-react"
import { useClasses } from "@/hooks/useClasses"
import { useAssignments } from "@/hooks/useAssignments"

export default function TeacherDashboard() {
  const { data: classes } = useClasses()
  const { data: assignments } = useAssignments()

  const stats = {
    totalStudents: classes?.reduce((sum, c) => sum + c.studentCount, 0) || 0,
    activeClasses: classes?.length || 0,
    pendingGrading: assignments?.filter(a => a.status === 'submitted').length || 0,
    averageGrade: 94.5
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">Welcome, Teacher!</h1>
          <p className="text-muted-foreground">Manage your classes and students</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            color="from-blue-500 to-blue-600"
          />
          <StatsCard
            title="Active Classes"
            value={stats.activeClasses}
            icon={BookOpen}
            color="from-green-500 to-green-600"
          />
          <StatsCard
            title="Pending Grading"
            value={stats.pendingGrading}
            icon={ClipboardCheck}
            color="from-orange-500 to-orange-600"
          />
          <StatsCard
            title="Class Average"
            value={`${stats.averageGrade}%`}
            icon={TrendingUp}
            color="from-purple-500 to-purple-600"
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments
              ?.filter(a => a.status === 'submitted')
              .slice(0, 5)
              .map(assignment => (
                <SubmissionItem key={assignment.id} assignment={assignment} />
              ))}
          </CardContent>
        </Card>

        {/* Class Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes?.map(classItem => (
            <ClassCard key={classItem.id} classData={classItem} />
          ))}
        </div>
      </div>
    </TeacherLayout>
  )
}
```

---

## Class Management

### Class Roster

```typescript
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Search, Download, UserPlus } from "lucide-react"

export default function ClassRosterPage({ params }: { params: { id: string } }) {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: classData } = useClass(params.id)
  const { data: students } = useClassStudents(params.id)

  const filteredStudents = students?.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{classData?.name}</h1>
            <p className="text-muted-foreground">{students?.length} students</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Student List */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredStudents?.map(student => (
                <div key={student.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <Avatar>
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>{student.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{student.currentGrade}%</p>
                    <p className="text-xs text-muted-foreground">Current Grade</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Profile
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  )
}
```

---

## Grading System

### Assignment Grading Interface

```typescript
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"

export default function GradingPage({ params }: { params: { submissionId: string } }) {
  const { data: submission } = useSubmission(params.submissionId)
  const [grade, setGrade] = useState(0)
  const [feedback, setFeedback] = useState("")

  const handleSubmitGrade = async () => {
    await gradeSubmission(params.submissionId, {
      grade,
      feedback,
      gradedBy: currentTeacher.id
    })

    toast({ title: "Grade submitted successfully" })
    router.push("/teacher/assignments")
  }

  return (
    <TeacherLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Grade Assignment: {submission?.assignment.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Student Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar>
                <AvatarImage src={submission?.student.avatar} />
              </Avatar>
              <div>
                <p className="font-medium">{submission?.student.name}</p>
                <p className="text-sm text-muted-foreground">
                  Submitted: {new Date(submission?.submittedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Submission Content */}
            <div>
              <h3 className="font-medium mb-2">Submission</h3>
              {submission?.fileUrl && (
                <Button variant="outline" onClick={() => window.open(submission.fileUrl)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Submission
                </Button>
              )}
              {submission?.content && (
                <div className="p-4 bg-gray-50 rounded-lg mt-2">
                  {submission.content}
                </div>
              )}
            </div>

            {/* Grading */}
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">
                  Grade: {grade} / {submission?.assignment.maxPoints}
                </label>
                <Slider
                  value={[grade]}
                  onValueChange={([value]) => setGrade(value)}
                  max={submission?.assignment.maxPoints || 100}
                  step={1}
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Feedback</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback to the student..."
                  rows={6}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleSubmitGrade}>Submit Grade</Button>
              <Button variant="outline">Save Draft</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  )
}
```

### Bulk Grading

```typescript
export default function BulkGradingPage() {
  const [submissions, setSubmissions] = useState([])
  const [grades, setGrades] = useState<Record<string, number>>({})

  const handleBulkGrade = async () => {
    await Promise.all(
      Object.entries(grades).map(([submissionId, grade]) =>
        gradeSubmission(submissionId, { grade })
      )
    )

    toast({ title: `${Object.keys(grades).length} assignments graded` })
  }

  return (
    <TeacherLayout>
      <Card>
        <CardHeader>
          <CardTitle>Bulk Grading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {submissions.map(submission => (
              <div key={submission.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{submission.student.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {submission.assignment.title}
                  </p>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={submission.assignment.maxPoints}
                  value={grades[submission.id] || ''}
                  onChange={(e) => setGrades({
                    ...grades,
                    [submission.id]: parseInt(e.target.value)
                  })}
                  className="w-24"
                  placeholder="Grade"
                />
                <span>/ {submission.assignment.maxPoints}</span>
              </div>
            ))}
          </div>

          <Button onClick={handleBulkGrade} className="mt-4">
            Submit All Grades
          </Button>
        </CardContent>
      </Card>
    </TeacherLayout>
  )
}
```

---

## Quiz Builder

### Create Quiz Interface

```typescript
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

interface Question {
  id: string
  type: "multiple-choice" | "true-false" | "short-answer"
  text: string
  options?: string[]
  correctAnswer: string
  points: number
}

export default function QuizBuilderPage() {
  const [quizTitle, setQuizTitle] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [duration, setDuration] = useState(30) // minutes

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        type: "multiple-choice",
        text: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 1
      }
    ])
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, ...updates } : q
    ))
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const handleSaveQuiz = async () => {
    const quiz = {
      title: quizTitle,
      duration,
      questions,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0)
    }

    await quizApi.createQuiz(quiz)
    toast({ title: "Quiz created successfully" })
    router.push("/teacher/quizzes")
  }

  return (
    <TeacherLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Quiz Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Quiz Title</label>
              <Input
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Enter quiz title..."
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Duration (minutes)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min={5}
                max={180}
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Question {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(question.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">Question Type</label>
                  <Select
                    value={question.type}
                    onValueChange={(value: Question["type"]) =>
                      updateQuestion(question.id, { type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="true-false">True/False</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-medium mb-2">Question Text</label>
                  <Input
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                    placeholder="Enter question..."
                  />
                </div>

                {question.type === "multiple-choice" && (
                  <div className="space-y-2">
                    <label className="block font-medium">Options</label>
                    {question.options?.map((option, optIndex) => (
                      <Input
                        key={optIndex}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(question.options || [])]
                          newOptions[optIndex] = e.target.value
                          updateQuestion(question.id, { options: newOptions })
                        }}
                        placeholder={`Option ${optIndex + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block font-medium mb-2">Correct Answer</label>
                    <Input
                      value={question.correctAnswer}
                      onChange={(e) =>
                        updateQuestion(question.id, { correctAnswer: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Points</label>
                    <Input
                      type="number"
                      value={question.points}
                      onChange={(e) =>
                        updateQuestion(question.id, { points: parseInt(e.target.value) })
                      }
                      className="w-24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Question Button */}
        <Button onClick={addQuestion} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>

        {/* Save Quiz */}
        <Button onClick={handleSaveQuiz} className="w-full">
          Create Quiz
        </Button>
      </div>
    </TeacherLayout>
  )
}
```

---

## Assignment Management

### Create Assignment

```typescript
export default function CreateAssignmentPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxPoints: 100,
    attachments: []
  })

  const handleSubmit = async () => {
    await assignmentsApi.createAssignment(formData)
    toast({ title: "Assignment created" })
    router.push("/teacher/assignments")
  }

  return (
    <TeacherLayout>
      <Card>
        <CardHeader>
          <CardTitle>Create Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Assignment Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Textarea
            placeholder="Description and instructions..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-2">Due Date</label>
              <Input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Max Points</label>
              <Input
                type="number"
                value={formData.maxPoints}
                onChange={(e) => setFormData({ ...formData, maxPoints: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <Button onClick={handleSubmit}>Create Assignment</Button>
        </CardContent>
      </Card>
    </TeacherLayout>
  )
}
```

---

## Student Analytics

### Performance Dashboard

```typescript
export default function AnalyticsPage() {
  const { data: analytics } = useAnalytics()

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Student Analytics</h1>

        {/* Class Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Class Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.classPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topStudents.map((student, index) => (
              <div key={student.id} className="flex items-center gap-4 p-3 border-b">
                <div className="text-2xl font-bold">{index + 1}</div>
                <Avatar>
                  <AvatarImage src={student.avatar} />
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{student.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">{student.average}%</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  )
}
```

---

## Best Practices

### ✅ Do's

1. **Provide clear rubrics**
   ```typescript
   const rubric = {
     criteria: [
       { name: "Completeness", weight: 0.3, maxPoints: 30 },
       { name: "Quality", weight: 0.5, maxPoints: 50 },
       { name: "Timeliness", weight: 0.2, maxPoints: 20 }
     ]
   }
   ```

2. **Give detailed feedback**
   ```typescript
   const feedback = {
     strengths: "Excellent analysis and research",
     improvements: "Work on citations and formatting",
     suggestions: "Review MLA format guidelines"
   }
   ```

3. **Use bulk actions**
   ```typescript
   await Promise.all(
     selectedSubmissions.map(id => gradeSubmission(id, defaultGrade))
   )
   ```

### ❌ Don'ts

1. **Don't grade without downloading submissions**
2. **Don't create quizzes without clear learning objectives**
3. **Don't forget to set due dates and point values**

---

## Troubleshooting

### Issue: Bulk grading fails

**Solution:**
```typescript
const gradeBatch = async (submissions, batchSize = 10) => {
  for (let i = 0; i < submissions.length; i += batchSize) {
    const batch = submissions.slice(i, i + batchSize)
    await Promise.all(batch.map(s => gradeSubmission(s.id, s.grade)))
  }
}
```

---

## Summary

The Teacher Portal provides **comprehensive classroom management** with:
- ✅ Class and student management
- ✅ Assignment and quiz creation
- ✅ Efficient grading tools
- ✅ Student analytics
- ✅ Communication features

---

## Navigation

- **Previous Chapter:** [Chapter 22: Student Portal](./22-student-portal.md)
- **Next Chapter:** [Chapter 24: Admin Portal](./24-admin-portal.md)
- **Volume Index:** [Volume 4: Feature Documentation](./README.md)
