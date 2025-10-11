"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  Award,
  Target,
  Calendar,
  BookOpen,
  Star,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
} from "lucide-react"
import StudentLayout from "@/components/student/student-layout"

export default function GradesPage() {
  const [selectedSemester, setSelectedSemester] = useState("current")
  const [selectedSubject, setSelectedSubject] = useState("all")

  // Mock grade data
  const currentGrades = [
    {
      subject: "Mathematics",
      currentGrade: 96,
      targetGrade: 95,
      trend: "+2.5",
      color: "#3b82f6",
      assignments: [
        { name: "Quiz 1", score: 95, maxScore: 100, date: "2024-01-15", weight: 0.2 },
        { name: "Midterm Exam", score: 98, maxScore: 100, date: "2024-01-30", weight: 0.4 },
        { name: "Project", score: 94, maxScore: 100, date: "2024-02-10", weight: 0.3 },
        { name: "Homework Average", score: 97, maxScore: 100, date: "2024-02-15", weight: 0.1 },
      ],
    },
    {
      subject: "Science",
      currentGrade: 94,
      targetGrade: 95,
      trend: "+1.2",
      color: "#10b981",
      assignments: [
        { name: "Lab Report 1", score: 92, maxScore: 100, date: "2024-01-20", weight: 0.25 },
        { name: "Quiz Series", score: 95, maxScore: 100, date: "2024-02-01", weight: 0.25 },
        { name: "Midterm Exam", score: 96, maxScore: 100, date: "2024-02-05", weight: 0.35 },
        { name: "Group Project", score: 93, maxScore: 100, date: "2024-02-12", weight: 0.15 },
      ],
    },
    {
      subject: "English",
      currentGrade: 92,
      targetGrade: 94,
      trend: "-0.8",
      color: "#8b5cf6",
      assignments: [
        { name: "Essay 1", score: 90, maxScore: 100, date: "2024-01-18", weight: 0.3 },
        { name: "Reading Quiz", score: 94, maxScore: 100, date: "2024-01-25", weight: 0.2 },
        { name: "Presentation", score: 91, maxScore: 100, date: "2024-02-08", weight: 0.25 },
        { name: "Participation", score: 95, maxScore: 100, date: "2024-02-15", weight: 0.25 },
      ],
    },
    {
      subject: "Filipino",
      currentGrade: 95,
      targetGrade: 93,
      trend: "+3.1",
      color: "#f59e0b",
      assignments: [
        { name: "Talumpati", score: 96, maxScore: 100, date: "2024-01-22", weight: 0.3 },
        { name: "Pagsusulit", score: 94, maxScore: 100, date: "2024-02-02", weight: 0.4 },
        { name: "Proyekto", score: 97, maxScore: 100, date: "2024-02-14", weight: 0.3 },
      ],
    },
    {
      subject: "Araling Panlipunan",
      currentGrade: 93,
      targetGrade: 92,
      trend: "+0.5",
      color: "#06b6d4",
      assignments: [
        { name: "Map Activity", score: 91, maxScore: 100, date: "2024-01-25", weight: 0.2 },
        { name: "Research Paper", score: 95, maxScore: 100, date: "2024-02-05", weight: 0.4 },
        { name: "Oral Report", score: 92, maxScore: 100, date: "2024-02-12", weight: 0.4 },
      ],
    },
  ]

  // Grade history data for charts
  const gradeHistory = [
    { month: "Sep", Mathematics: 94, Science: 92, English: 90, Filipino: 93, "Araling Panlipunan": 91 },
    { month: "Oct", Mathematics: 95, Science: 93, English: 91, Filipino: 94, "Araling Panlipunan": 92 },
    { month: "Nov", Mathematics: 94, Science: 94, English: 92, Filipino: 94, "Araling Panlipunan": 92 },
    { month: "Dec", Mathematics: 95, Science: 93, English: 91, Filipino: 95, "Araling Panlipunan": 93 },
    { month: "Jan", Mathematics: 96, Science: 94, English: 92, Filipino: 95, "Araling Panlipunan": 93 },
  ]

  const gwaData = [
    { semester: "1st Sem 2023", gwa: 93.2 },
    { semester: "2nd Sem 2023", gwa: 94.1 },
    { semester: "1st Sem 2024", gwa: 94.5 },
  ]

  const gradeDistribution = [
    { grade: "A (95-100)", count: 2, color: "#10b981" },
    { grade: "B+ (90-94)", count: 3, color: "#3b82f6" },
    { grade: "B (85-89)", count: 0, color: "#f59e0b" },
    { grade: "C+ (80-84)", count: 0, color: "#ef4444" },
  ]

  const calculateGWA = () => {
    const totalGrade = currentGrades.reduce((sum, subject) => sum + subject.currentGrade, 0)
    return (totalGrade / currentGrades.length).toFixed(1)
  }

  const getGradeStatus = (current: number, target: number) => {
    if (current >= target) return { status: "on-track", color: "text-green-600", icon: CheckCircle2 }
    if (current >= target - 2) return { status: "close", color: "text-yellow-600", icon: Clock }
    return { status: "needs-improvement", color: "text-red-600", icon: AlertCircle }
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Grade Tracking</h1>
              <p className="text-muted-foreground">Monitor your academic progress and performance</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Semester</SelectItem>
                  <SelectItem value="previous">Previous Semester</SelectItem>
                  <SelectItem value="all">All Semesters</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Current GWA</p>
                    <p className="text-3xl font-bold">{calculateGWA()}</p>
                  </div>
                  <Star className="w-8 h-8 text-blue-200" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-blue-100 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +0.4 from last semester
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Class Rank</p>
                    <p className="text-3xl font-bold">#12</p>
                  </div>
                  <Award className="w-8 h-8 text-green-200" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-green-100 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Top 5% of class
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subjects">By Subject</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Current Grades */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Grades</CardTitle>
                      <CardDescription>Your performance across all subjects</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {currentGrades.map((subject) => {
                          const status = getGradeStatus(subject.currentGrade, subject.targetGrade)
                          return (
                            <div
                              key={subject.subject}
                              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }}></div>
                                <div>
                                  <p className="font-medium">{subject.subject}</p>
                                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <span>Target: {subject.targetGrade}</span>
                                    <status.icon className={`w-4 h-4 ${status.color}`} />
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant={subject.trend.startsWith("+") ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {subject.trend}
                                  </Badge>
                                  <span className="text-2xl font-bold">{subject.currentGrade}</span>
                                </div>
                                <Progress
                                  value={(subject.currentGrade / 100) * 100}
                                  className="w-20 mt-2"
                                  style={{ backgroundColor: `${subject.color}20` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Grade Distribution */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Grade Distribution</CardTitle>
                      <CardDescription>Breakdown of your grades</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {gradeDistribution.map((item) => (
                          <div key={item.grade} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                              <span className="text-sm">{item.grade}</span>
                            </div>
                            <Badge variant="secondary">{item.count}</Badge>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={gradeDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              dataKey="count"
                            >
                              {gradeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* By Subject Tab */}
            <TabsContent value="subjects" className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {currentGrades.map((subject) => (
                      <SelectItem key={subject.subject} value={subject.subject}>
                        {subject.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="grid gap-6">
                {currentGrades
                  .filter((subject) => selectedSubject === "all" || subject.subject === selectedSubject)
                  .map((subject) => (
                    <Card key={subject.subject}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center">
                            <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: subject.color }}></div>
                            {subject.subject}
                          </CardTitle>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{subject.currentGrade}</div>
                            <Badge
                              variant={subject.trend.startsWith("+") ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {subject.trend}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {subject.assignments.map((assignment, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{assignment.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {assignment.date} • Weight: {(assignment.weight * 100).toFixed(0)}%
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">
                                  {assignment.score}/{assignment.maxScore}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {((assignment.score / assignment.maxScore) * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Grade Trends Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Grade Trends</CardTitle>
                    <CardDescription>Your performance over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={gradeHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[85, 100]} />
                        <Tooltip />
                        {currentGrades.map((subject) => (
                          <Line
                            key={subject.subject}
                            type="monotone"
                            dataKey={subject.subject}
                            stroke={subject.color}
                            strokeWidth={2}
                            dot={{ fill: subject.color, strokeWidth: 2, r: 4 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* GWA History */}
                <Card>
                  <CardHeader>
                    <CardTitle>GWA History</CardTitle>
                    <CardDescription>Your cumulative GWA progression</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={gwaData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semester" />
                        <YAxis domain={[90, 100]} />
                        <Tooltip />
                        <Bar dataKey="gwa" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Performance Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Insights</CardTitle>
                    <CardDescription>AI-powered analysis of your academic performance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">Strength</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Your Mathematics performance has improved consistently over the past 3 months, showing strong
                        problem-solving skills.
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">Area for Improvement</span>
                      </div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        English grades show slight decline. Consider focusing more on essay writing and reading
                        comprehension.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-800 dark:text-blue-200">Recommendation</span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        You're on track to achieve Honor Roll status. Maintain current performance in Math and Science
                        while focusing on English improvement.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Study Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Study Recommendations</CardTitle>
                    <CardDescription>Personalized suggestions to improve your grades</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">English Literature Review</p>
                          <p className="text-xs text-muted-foreground">
                            Spend 30 minutes daily on reading comprehension exercises
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Study Schedule</p>
                          <p className="text-xs text-muted-foreground">
                            Create a weekly study plan focusing on weaker subjects
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <Award className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Practice Tests</p>
                          <p className="text-xs text-muted-foreground">
                            Take practice quizzes to reinforce learning and identify gaps
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full mt-4">
                      <Target className="w-4 h-4 mr-2" />
                      Create Study Plan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </StudentLayout>
  )
}
