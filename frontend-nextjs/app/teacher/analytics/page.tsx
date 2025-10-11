"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
  ComposedChart,
} from "recharts"
import {
  Users,
  AlertTriangle,
  Target,
  Star,
  Activity,
  MousePointer,
  Eye,
  Clock,
  FileText,
  Download,
  Search,
  Filter,
} from "lucide-react"

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("month")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedSection, setSelectedSection] = useState("all")

  const performanceData = [
    { month: "Sep", mathematics: 85, science: 78, english: 92 },
    { month: "Oct", mathematics: 88, science: 82, english: 89 },
    { month: "Nov", mathematics: 92, science: 85, english: 94 },
    { month: "Dec", mathematics: 89, science: 88, english: 91 },
    { month: "Jan", mathematics: 94, science: 91, english: 96 },
  ]

  const studentEngagementData = [
    { week: "Week 1", logins: 142, pageViews: 1250, timeSpent: 45 },
    { week: "Week 2", logins: 158, pageViews: 1380, timeSpent: 52 },
    { week: "Week 3", logins: 165, pageViews: 1420, timeSpent: 48 },
    { week: "Week 4", logins: 172, pageViews: 1580, timeSpent: 55 },
  ]

  const assessmentDistributionData = [
    { quiz: "Math Quiz 1", average: 85, median: 87, high: 98, low: 62, section: "7A" },
    { quiz: "Science Quiz 1", average: 78, median: 80, high: 95, low: 58 },
    { quiz: "English Quiz 1", average: 92, median: 94, high: 100, low: 75 },
    { quiz: "Math Quiz 2", average: 88, median: 90, high: 97, low: 68 },
  ]

  const contentEffectivenessData = [
    { resource: "Algebra Basics PDF", views: 245, downloads: 89, type: "PDF", engagement: 85 },
    { resource: "Science Lab Module", views: 198, downloads: 156, type: "Module", engagement: 92 },
    { resource: "Grammar Guide", views: 167, downloads: 67, type: "PDF", engagement: 78 },
    { resource: "History Timeline", views: 89, downloads: 23, type: "Module", engagement: 45 },
    { resource: "Math Practice Set", views: 234, downloads: 178, type: "PDF", engagement: 88 },
    { resource: "Chemistry Formulas", views: 45, downloads: 12, type: "PDF", engagement: 32 },
  ]

  const subjectDistribution = [
    { name: "Mathematics", value: 32, color: "hsl(var(--analytics-chart-1))" },
    { name: "Science", value: 28, color: "hsl(var(--analytics-chart-2))" },
    { name: "English", value: 35, color: "hsl(var(--analytics-chart-3))" },
  ]

  const engagementData = [
    { week: "Week 1", quizzes: 24, assignments: 18, participation: 28 },
    { week: "Week 2", quizzes: 28, assignments: 22, participation: 32 },
    { week: "Week 3", quizzes: 32, assignments: 25, participation: 35 },
    { week: "Week 4", quizzes: 29, assignments: 28, participation: 38 },
  ]

  const keyMetrics = {
    totalStudents: 95,
    avgPerformance: 89,
    studentEngagementRate: 94,
    completionRate: 87,
    atRiskStudents: 8,
    topPerformers: 12,
    improvementRate: 15,
    avgTimeSpent: 52,
    totalLogins: 647,
    contentViews: 1248,
  }

  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "Low Engagement Alert",
      message: "Chemistry Formulas PDF has only 32% engagement rate",
      priority: "high",
    },
    {
      id: 2,
      type: "info",
      title: "Quiz Performance",
      message: "Mathematics quiz scores improved by 12% this month",
      priority: "medium",
    },
    {
      id: 3,
      type: "warning",
      title: "Content Usage",
      message: "History Timeline module needs attention - low view count",
      priority: "high",
    },
  ]

  const topPerformers = [
    { name: "Alice Johnson", subject: "Mathematics", score: 98, improvement: "+5%" },
    { name: "Bob Smith", subject: "Science", score: 96, improvement: "+8%" },
    { name: "Carol Davis", subject: "English", score: 97, improvement: "+3%" },
    { name: "David Wilson", subject: "Mathematics", score: 95, improvement: "+12%" },
  ]

  const atRiskStudents = [
    { name: "Emma Brown", subject: "Science", score: 65, trend: "declining" },
    { name: "Frank Miller", subject: "Mathematics", score: 68, trend: "stable" },
    { name: "Grace Lee", subject: "English", score: 62, trend: "declining" },
  ]

  return (
    <div className="min-h-screen bg-[hsl(var(--analytics-background))] text-[hsl(var(--analytics-foreground))]">
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--analytics-foreground))]">Performance Analytics</h1>
            <p className="text-[hsl(var(--analytics-muted-foreground))] mt-1">
              Comprehensive insights into student performance and engagement
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-40 bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="english">English</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-32 bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                <SelectItem value="7A">Section 7A</SelectItem>
                <SelectItem value="7B">Section 7B</SelectItem>
                <SelectItem value="8A">Section 8A</SelectItem>
                <SelectItem value="8B">Section 8B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(var(--analytics-muted))] p-1 rounded-lg">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[hsl(var(--analytics-primary))] data-[state=active]:text-[hsl(var(--analytics-primary-foreground))] rounded-md"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="engagement"
              className="data-[state=active]:bg-[hsl(var(--analytics-primary))] data-[state=active]:text-[hsl(var(--analytics-primary-foreground))] rounded-md"
            >
              Engagement
            </TabsTrigger>
            <TabsTrigger
              value="assessment"
              className="data-[state=active]:bg-[hsl(var(--analytics-primary))] data-[state=active]:text-[hsl(var(--analytics-primary-foreground))] rounded-md"
            >
              Assessment
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-[hsl(var(--analytics-primary))] data-[state=active]:text-[hsl(var(--analytics-primary-foreground))] rounded-md"
            >
              Content
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))] hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">Total Students</p>
                      <p className="text-3xl font-bold text-[hsl(var(--analytics-foreground))]">
                        {keyMetrics.totalStudents}
                      </p>
                      <p className="text-sm text-[hsl(var(--analytics-accent))]">Active learners</p>
                    </div>
                    <Users className="h-8 w-8 text-[hsl(var(--analytics-primary))]" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))] hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">Avg Performance</p>
                      <p className="text-3xl font-bold text-[hsl(var(--analytics-foreground))]">
                        {keyMetrics.avgPerformance}%
                      </p>
                      <p className="text-sm text-[hsl(var(--analytics-accent))]">+5% from last month</p>
                    </div>
                    <Target className="h-8 w-8 text-[hsl(var(--analytics-primary))]" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))] hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">Engagement Rate</p>
                      <p className="text-3xl font-bold text-[hsl(var(--analytics-foreground))]">
                        {keyMetrics.studentEngagementRate}%
                      </p>
                      <p className="text-sm text-[hsl(var(--analytics-accent))]">+8% this week</p>
                    </div>
                    <Activity className="h-8 w-8 text-[hsl(var(--analytics-primary))]" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))] hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">Avg Time Spent</p>
                      <p className="text-3xl font-bold text-[hsl(var(--analytics-foreground))]">
                        {keyMetrics.avgTimeSpent}m
                      </p>
                      <p className="text-sm text-[hsl(var(--analytics-accent))]">Per session</p>
                    </div>
                    <Clock className="h-8 w-8 text-[hsl(var(--analytics-primary))]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
                <CardHeader>
                  <CardTitle className="text-[hsl(var(--analytics-foreground))]">Performance Trends</CardTitle>
                  <CardDescription className="text-[hsl(var(--analytics-muted-foreground))]">
                    Monthly performance across subjects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--analytics-border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--analytics-muted-foreground))" />
                      <YAxis stroke="hsl(var(--analytics-muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--analytics-card))",
                          border: "1px solid hsl(var(--analytics-border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="mathematics"
                        stroke="hsl(var(--analytics-chart-1))"
                        strokeWidth={3}
                      />
                      <Line type="monotone" dataKey="science" stroke="hsl(var(--analytics-chart-2))" strokeWidth={3} />
                      <Line type="monotone" dataKey="english" stroke="hsl(var(--analytics-chart-3))" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
                <CardHeader>
                  <CardTitle className="text-[hsl(var(--analytics-foreground))]">Subject Distribution</CardTitle>
                  <CardDescription className="text-[hsl(var(--analytics-muted-foreground))]">
                    Student enrollment by subject
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={subjectDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {subjectDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--analytics-card))",
                          border: "1px solid hsl(var(--analytics-border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[hsl(var(--analytics-foreground))]">
                  <AlertTriangle className="h-5 w-5 text-[hsl(var(--analytics-primary))]" />
                  <span>Recent Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start space-x-3 p-4 rounded-lg bg-[hsl(var(--analytics-muted))] hover:bg-[hsl(var(--analytics-secondary))] transition-colors"
                  >
                    <AlertTriangle
                      className={`h-5 w-5 mt-0.5 ${alert.priority === "high" ? "text-red-500" : "text-yellow-500"}`}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-[hsl(var(--analytics-foreground))]">{alert.title}</h4>
                      <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">{alert.message}</p>
                    </div>
                    <Badge variant={alert.priority === "high" ? "destructive" : "secondary"}>{alert.priority}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <MousePointer className="h-8 w-8 text-[hsl(var(--analytics-primary))]" />
                    <div>
                      <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">Total Logins</p>
                      <p className="text-2xl font-bold text-[hsl(var(--analytics-foreground))]">
                        {keyMetrics.totalLogins}
                      </p>
                      <p className="text-sm text-[hsl(var(--analytics-accent))]">This month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-8 w-8 text-[hsl(var(--analytics-primary))]" />
                    <div>
                      <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">Page Views</p>
                      <p className="text-2xl font-bold text-[hsl(var(--analytics-foreground))]">
                        {keyMetrics.contentViews}
                      </p>
                      <p className="text-sm text-[hsl(var(--analytics-accent))]">This week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-8 w-8 text-[hsl(var(--analytics-primary))]" />
                    <div>
                      <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">Avg Session Time</p>
                      <p className="text-2xl font-bold text-[hsl(var(--analytics-foreground))]">
                        {keyMetrics.avgTimeSpent}m
                      </p>
                      <p className="text-sm text-[hsl(var(--analytics-accent))]">Per student</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--analytics-foreground))]">Student Engagement Metrics</CardTitle>
                <CardDescription className="text-[hsl(var(--analytics-muted-foreground))]">
                  Weekly tracking of logins, page views, and time spent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={studentEngagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--analytics-border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--analytics-muted-foreground))" />
                    <YAxis yAxisId="left" stroke="hsl(var(--analytics-muted-foreground))" />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--analytics-muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--analytics-card))",
                        border: "1px solid hsl(var(--analytics-border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar yAxisId="left" dataKey="logins" fill="hsl(var(--analytics-chart-1))" name="Logins" />
                    <Bar yAxisId="right" dataKey="pageViews" fill="hsl(var(--analytics-chart-2))" name="Page Views" />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="timeSpent"
                      stroke="hsl(var(--analytics-chart-3))"
                      strokeWidth={3}
                      name="Time Spent (min)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessment" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[hsl(var(--analytics-foreground))]">
                Assessment Performance Distribution
              </h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--analytics-muted-foreground))]" />
                  <Input
                    placeholder="Search quizzes..."
                    className="pl-10 w-64 bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--analytics-foreground))]">Quiz Performance Overview</CardTitle>
                <CardDescription className="text-[hsl(var(--analytics-muted-foreground))]">
                  Average, median, high and low scores per quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={assessmentDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--analytics-border))" />
                    <XAxis dataKey="quiz" stroke="hsl(var(--analytics-muted-foreground))" />
                    <YAxis stroke="hsl(var(--analytics-muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--analytics-card))",
                        border: "1px solid hsl(var(--analytics-border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="average" fill="hsl(var(--analytics-chart-1))" name="Average" />
                    <Bar dataKey="median" fill="hsl(var(--analytics-chart-2))" name="Median" />
                    <Bar dataKey="high" fill="hsl(var(--analytics-chart-3))" name="Highest" />
                    <Bar dataKey="low" fill="hsl(var(--analytics-chart-4))" name="Lowest" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-[hsl(var(--analytics-foreground))]">
                    <Star className="h-5 w-5 text-[hsl(var(--analytics-primary))]" />
                    <span>Top Performers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topPerformers.map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--analytics-muted))] hover:bg-[hsl(var(--analytics-secondary))] transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-[hsl(var(--analytics-foreground))]">{student.name}</h4>
                        <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">{student.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[hsl(var(--analytics-primary))]">{student.score}%</p>
                        <p className="text-sm text-[hsl(var(--analytics-accent))]">{student.improvement}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-[hsl(var(--analytics-foreground))]">
                    <AlertTriangle className="h-5 w-5 text-[hsl(var(--analytics-primary))]" />
                    <span>At-Risk Students</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {atRiskStudents.map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--analytics-muted))] hover:bg-[hsl(var(--analytics-secondary))] transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-[hsl(var(--analytics-foreground))]">{student.name}</h4>
                        <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">{student.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-500">{student.score}%</p>
                        <Badge variant={student.trend === "declining" ? "destructive" : "secondary"}>
                          {student.trend}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[hsl(var(--analytics-foreground))]">
                Content Effectiveness Analysis
              </h2>
              <Button className="bg-[hsl(var(--analytics-primary))] text-[hsl(var(--analytics-primary-foreground))] hover:bg-[hsl(var(--analytics-primary))]/90">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-[hsl(var(--analytics-primary))]" />
                    <div>
                      <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">Most Viewed</p>
                      <p className="text-lg font-bold text-[hsl(var(--analytics-foreground))]">Algebra Basics PDF</p>
                      <p className="text-sm text-[hsl(var(--analytics-accent))]">245 views</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Download className="h-8 w-8 text-[hsl(var(--analytics-primary))]" />
                    <div>
                      <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">Most Downloaded</p>
                      <p className="text-lg font-bold text-[hsl(var(--analytics-foreground))]">Math Practice Set</p>
                      <p className="text-sm text-[hsl(var(--analytics-accent))]">178 downloads</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">Needs Attention</p>
                      <p className="text-lg font-bold text-[hsl(var(--analytics-foreground))]">Chemistry Formulas</p>
                      <p className="text-sm text-red-500">32% engagement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[hsl(var(--analytics-card))] border-[hsl(var(--analytics-border))]">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--analytics-foreground))]">Resource Performance</CardTitle>
                <CardDescription className="text-[hsl(var(--analytics-muted-foreground))]">
                  Views, downloads, and engagement rates for all content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentEffectivenessData.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-[hsl(var(--analytics-muted))] hover:bg-[hsl(var(--analytics-secondary))] transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-lg bg-[hsl(var(--analytics-primary))]/10">
                          <FileText className="h-5 w-5 text-[hsl(var(--analytics-primary))]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[hsl(var(--analytics-foreground))]">{resource.resource}</h4>
                          <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">{resource.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">Views</p>
                          <p className="font-bold text-[hsl(var(--analytics-foreground))]">{resource.views}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">Downloads</p>
                          <p className="font-bold text-[hsl(var(--analytics-foreground))]">{resource.downloads}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-[hsl(var(--analytics-muted-foreground))]">Engagement</p>
                          <p
                            className={`font-bold ${resource.engagement >= 70 ? "text-[hsl(var(--analytics-accent))]" : resource.engagement >= 50 ? "text-yellow-500" : "text-red-500"}`}
                          >
                            {resource.engagement}%
                          </p>
                        </div>
                        <Badge
                          variant={
                            resource.engagement >= 70
                              ? "default"
                              : resource.engagement >= 50
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {resource.engagement >= 70 ? "High" : resource.engagement >= 50 ? "Medium" : "Low"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
