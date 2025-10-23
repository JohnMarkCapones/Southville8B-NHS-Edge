"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  Search,
  Plus,
  Eye,
  MessageSquare,
  Star,
  Paperclip,
  BookOpen,
  Target,
} from "lucide-react"
import StudentLayout from "@/components/student/student-layout"

export default function ActivitiesPage() {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Mock activity data
  const activities = [
    {
      id: 1,
      title: "Math Practice Quiz",
      subject: "Mathematics",
      teacher: "Ms. Garcia",
      dueDate: "2024-02-20",
      dueTime: "9:45 AM",
      status: "pending",
      priority: "high",
      description: "Interactive practice quiz covering quadratic equations and graphing functions.",
      instructions: "Complete all 15 practice questions. Review explanations for each answer.",
      maxScore: 100,
      activityType: "quiz",
      attachments: ["chapter5_notes.pdf", "practice_problems.pdf"],
      completedAt: null,
      score: null,
      feedback: null,
      progress: 0,
    },
    {
      id: 2,
      title: "Science Lab Simulation",
      subject: "Science",
      teacher: "Mr. Santos",
      dueDate: "2024-02-22",
      dueTime: "11:15 AM",
      status: "in-progress",
      priority: "medium",
      description: "Virtual lab simulation exploring photosynthesis processes.",
      instructions: "Complete the interactive simulation and record observations.",
      maxScore: 100,
      activityType: "simulation",
      attachments: ["lab_guide.pdf", "observation_sheet.xlsx"],
      completedAt: null,
      score: null,
      feedback: null,
      progress: 65,
    },
    {
      id: 3,
      title: "English Reading Comprehension",
      subject: "English",
      teacher: "Mrs. Cruz",
      dueDate: "2024-02-25",
      dueTime: "1:00 PM",
      status: "completed",
      priority: "medium",
      description: "Interactive reading activity with character analysis exercises.",
      instructions: "Read the assigned passage and complete comprehension questions.",
      maxScore: 100,
      activityType: "reading",
      attachments: ["reading_passage.pdf"],
      completedAt: "2024-02-23T10:30:00Z",
      score: 92,
      feedback: "Excellent comprehension with thoughtful analysis. Well done!",
      progress: 100,
    },
    {
      id: 4,
      title: "History Interactive Timeline",
      subject: "Araling Panlipunan",
      teacher: "Mr. Dela Cruz",
      dueDate: "2024-03-01",
      dueTime: "3:30 PM",
      status: "pending",
      priority: "high",
      description: "Create an interactive timeline of Philippine heroes during Spanish colonial period.",
      instructions: "Use the timeline tool to add events, dates, and descriptions.",
      maxScore: 150,
      activityType: "project",
      attachments: ["timeline_template.pdf", "hero_profiles.pdf"],
      completedAt: null,
      score: null,
      feedback: null,
      progress: 0,
    },
    {
      id: 5,
      title: "Filipino Poetry Workshop",
      subject: "Filipino",
      teacher: "Mrs. Reyes",
      dueDate: "2024-02-28",
      dueTime: "2:00 PM",
      status: "overdue",
      priority: "high",
      description: "Creative writing workshop focusing on nature poetry in Filipino.",
      instructions: "Participate in guided poetry creation with peer feedback.",
      maxScore: 75,
      activityType: "workshop",
      attachments: ["poetry_examples.pdf"],
      completedAt: null,
      score: null,
      feedback: null,
      progress: 30,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100 dark:bg-green-900/30"
      case "in-progress":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30"
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30"
      case "overdue":
        return "text-red-600 bg-red-100 dark:bg-red-900/30"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-50 dark:bg-red-900/20"
      case "medium":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
      case "low":
        return "border-green-500 bg-green-50 dark:bg-green-900/20"
      default:
        return "border-gray-500 bg-gray-50 dark:bg-gray-900/20"
    }
  }

  const filteredActivities = activities.filter((activity) => {
    const matchesFilter = selectedFilter === "all" || activity.status === selectedFilter
    const matchesSubject = selectedSubject === "all" || activity.subject === selectedSubject
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.subject.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSubject && matchesSearch
  })

  const getUpcomingDeadlines = () => {
    const now = new Date()
    const upcoming = activities
      .filter((a) => a.status !== "completed" && new Date(a.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3)
    return upcoming
  }

  const upcomingDeadlines = getUpcomingDeadlines()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleCompleteActivity = (activityId: number) => {
    console.log(`Completing activity ${activityId}`)
    // In real app, this would save progress and update activity status
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Learning Activities</h1>
              <p className="text-muted-foreground">
                Engage with interactive learning experiences and track your progress
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Calendar View
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Progress
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Pending</p>
                    <p className="text-3xl font-bold">{activities.filter((a) => a.status === "pending").length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">In Progress</p>
                    <p className="text-3xl font-bold">{activities.filter((a) => a.status === "in-progress").length}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Completed</p>
                    <p className="text-3xl font-bold">{activities.filter((a) => a.status === "completed").length}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Overdue</p>
                    <p className="text-3xl font-bold">{activities.filter((a) => a.status === "overdue").length}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Activities List */}
            <div className="lg:col-span-3 space-y-6">
              {/* Filters and Search */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search activities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Filipino">Filipino</SelectItem>
                        <SelectItem value="Araling Panlipunan">Araling Panlipunan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Cards */}
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <Card key={activity.id} className={`border-l-4 ${getPriorityColor(activity.priority)}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{activity.title}</h3>
                            <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                            <Badge variant="outline" className="text-xs">
                              {activity.priority} priority
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {activity.subject}
                            </span>
                            <span className="flex items-center">
                              <Avatar className="w-4 h-4 mr-1">
                                <AvatarFallback className="text-xs">
                                  {activity.teacher
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {activity.teacher}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Due: {new Date(activity.dueDate).toLocaleDateString()} at {activity.dueTime}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>

                          {/* Progress Bar */}
                          {activity.status === "in-progress" && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span>Progress</span>
                                <span>{activity.progress}%</span>
                              </div>
                              <Progress value={activity.progress} className="h-2" />
                            </div>
                          )}

                          {/* Score and Feedback */}
                          {activity.score && (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-green-800 dark:text-green-200">Score Achieved</span>
                                <div className="flex items-center space-x-2">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="font-bold text-green-800 dark:text-green-200">
                                    {activity.score}/{activity.maxScore}
                                  </span>
                                </div>
                              </div>
                              {activity.feedback && (
                                <p className="text-sm text-green-700 dark:text-green-300">{activity.feedback}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          {activity.attachments.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <Paperclip className="w-3 h-3 mr-1" />
                              {activity.attachments.length} resources
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">Max Score: {activity.maxScore} points</span>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{activity.title}</DialogTitle>
                                <DialogDescription>
                                  {activity.subject} • {activity.teacher}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Instructions</h4>
                                  <p className="text-sm text-muted-foreground">{activity.instructions}</p>
                                </div>

                                {activity.attachments.length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">Resources</h4>
                                    <div className="space-y-2">
                                      {activity.attachments.map((file, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded"
                                        >
                                          <span className="text-sm">{file}</span>
                                          <Button variant="ghost" size="sm">
                                            <Download className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {activity.status !== "completed" && (
                                  <div>
                                    <h4 className="font-medium mb-2">Complete Activity</h4>
                                    <div className="space-y-3">
                                      {activity.activityType === "quiz" && (
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                          <p className="text-sm text-blue-800 dark:text-blue-200">
                                            Click "Start Activity" to begin the interactive quiz.
                                          </p>
                                        </div>
                                      )}
                                      {activity.activityType === "simulation" && (
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                          <p className="text-sm text-green-800 dark:text-green-200">
                                            Launch the virtual lab simulation to complete this activity.
                                          </p>
                                        </div>
                                      )}
                                      <div className="flex space-x-2">
                                        <Button onClick={() => handleCompleteActivity(activity.id)}>
                                          <Target className="w-4 h-4 mr-2" />
                                          Start Activity
                                        </Button>
                                        <Button variant="outline">
                                          <BookOpen className="w-4 h-4 mr-2" />
                                          Save Progress
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {activity.status !== "completed" && (
                            <Button size="sm">
                              <Target className="w-4 h-4 mr-2" />
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Upcoming Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingDeadlines.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border-l-4"
                      style={{ borderLeftColor: activity.priority === "high" ? "#ef4444" : "#f59e0b" }}
                    >
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.subject}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.dueDate).toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {Math.ceil(
                            (new Date(activity.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                          )}{" "}
                          days
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Request Help
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Teacher
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Download Resources
                  </Button>
                </CardContent>
              </Card>

              {/* Learning Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Active Learning</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Engage fully with interactive activities for better understanding and retention.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Progress Tracking</p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Monitor your progress regularly and celebrate small achievements along the way.
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Collaborative Learning</p>
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      Participate in group activities and discussions to enhance your learning experience.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
