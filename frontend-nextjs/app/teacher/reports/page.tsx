"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Download, Eye, Plus, Search, Calendar, TrendingUp, Filter, Share, Printer } from "lucide-react"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("all-reports")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")

  // Mock data for reports
  const reports = [
    {
      id: 1,
      title: "Monthly Performance Report",
      type: "Performance",
      description: "Comprehensive analysis of student performance across all subjects",
      createdDate: "2024-01-15",
      lastModified: "2024-01-18",
      status: "completed",
      format: "PDF",
      size: "2.4 MB",
      downloads: 12,
      author: "System Generated",
    },
    {
      id: 2,
      title: "Attendance Summary - January",
      type: "Attendance",
      description: "Detailed attendance tracking and analysis for January 2024",
      createdDate: "2024-01-10",
      lastModified: "2024-01-16",
      status: "completed",
      format: "Excel",
      size: "1.8 MB",
      downloads: 8,
      author: "Ms. Johnson",
    },
    {
      id: 3,
      title: "Quiz Analytics Report",
      type: "Assessment",
      description: "Analysis of quiz performance and question effectiveness",
      createdDate: "2024-01-12",
      lastModified: "2024-01-14",
      status: "completed",
      format: "PDF",
      size: "3.2 MB",
      downloads: 15,
      author: "System Generated",
    },
    {
      id: 4,
      title: "Student Progress Report",
      type: "Progress",
      description: "Individual student progress tracking and recommendations",
      createdDate: "2024-01-08",
      lastModified: "2024-01-08",
      status: "draft",
      format: "Word",
      size: "1.2 MB",
      downloads: 0,
      author: "Mr. Smith",
    },
  ]

  const templates = [
    {
      id: 1,
      name: "Performance Report Template",
      description: "Standard template for monthly performance analysis",
      category: "Performance",
      fields: ["Student Names", "Subject Scores", "Attendance", "Recommendations"],
    },
    {
      id: 2,
      name: "Attendance Report Template",
      description: "Template for tracking and analyzing attendance patterns",
      category: "Attendance",
      fields: ["Daily Attendance", "Weekly Summary", "Trends", "Alerts"],
    },
    {
      id: 3,
      name: "Assessment Analysis Template",
      description: "Template for analyzing quiz and test results",
      category: "Assessment",
      fields: ["Question Analysis", "Score Distribution", "Difficulty Metrics", "Improvements"],
    },
  ]

  const scheduledReports = [
    {
      id: 1,
      title: "Weekly Performance Summary",
      frequency: "Weekly",
      nextRun: "2024-01-22",
      recipients: ["admin@school.edu", "principal@school.edu"],
      status: "active",
    },
    {
      id: 2,
      title: "Monthly Attendance Report",
      frequency: "Monthly",
      nextRun: "2024-02-01",
      recipients: ["attendance@school.edu"],
      status: "active",
    },
    {
      id: 3,
      title: "Quarterly Progress Report",
      frequency: "Quarterly",
      nextRun: "2024-04-01",
      recipients: ["parents@school.edu", "admin@school.edu"],
      status: "paused",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--teacher-primary))]">Reports & Analytics</h1>
          <p className="text-[hsl(var(--teacher-muted-foreground))]">
            Generate, manage, and schedule comprehensive reports
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[hsl(var(--teacher-primary))] hover:bg-[hsl(var(--teacher-primary))]/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
                <DialogDescription>Generate a custom report with your selected parameters</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="report-title">Report Title</Label>
                    <Input id="report-title" placeholder="Enter report title" />
                  </div>
                  <div>
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="attendance">Attendance</SelectItem>
                        <SelectItem value="assessment">Assessment</SelectItem>
                        <SelectItem value="progress">Progress</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Report description and purpose" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date-range">Date Range</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="format">Output Format</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="word">Word</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Include Sections</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="performance" />
                      <Label htmlFor="performance">Performance Metrics</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="attendance" />
                      <Label htmlFor="attendance">Attendance Data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="engagement" />
                      <Label htmlFor="engagement">Engagement Analytics</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="recommendations" />
                      <Label htmlFor="recommendations">Recommendations</Label>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-[hsl(var(--teacher-primary))] hover:bg-[hsl(var(--teacher-primary))]/90">
                  Generate Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[hsl(var(--teacher-card))]">
          <TabsTrigger
            value="all-reports"
            className="data-[state=active]:bg-[hsl(var(--teacher-primary))] data-[state=active]:text-white"
          >
            All Reports
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="data-[state=active]:bg-[hsl(var(--teacher-primary))] data-[state=active]:text-white"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger
            value="scheduled"
            className="data-[state=active]:bg-[hsl(var(--teacher-primary))] data-[state=active]:text-white"
          >
            Scheduled
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-[hsl(var(--teacher-primary))] data-[state=active]:text-white"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* All Reports Tab */}
        <TabsContent value="all-reports" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--teacher-muted-foreground))]" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="bg-[hsl(var(--teacher-card))] border-[hsl(var(--teacher-border))]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="h-5 w-5 text-[hsl(var(--teacher-primary))]" />
                        <h3 className="font-semibold text-lg">{report.title}</h3>
                        <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                        <Badge variant="outline">{report.type}</Badge>
                      </div>
                      <p className="text-[hsl(var(--teacher-muted-foreground))] mb-3">{report.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-[hsl(var(--teacher-muted-foreground))]">
                        <span>Created: {report.createdDate}</span>
                        <span>Modified: {report.lastModified}</span>
                        <span>Format: {report.format}</span>
                        <span>Size: {report.size}</span>
                        <span>Downloads: {report.downloads}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="bg-[hsl(var(--teacher-card))] border-[hsl(var(--teacher-border))]">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-[hsl(var(--teacher-primary))]" />
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge variant="outline">{template.category}</Badge>
                  <div>
                    <h4 className="font-medium mb-2">Included Fields:</h4>
                    <div className="space-y-1">
                      {template.fields.map((field, index) => (
                        <div key={index} className="text-sm text-[hsl(var(--teacher-muted-foreground))]">
                          • {field}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-[hsl(var(--teacher-primary))] hover:bg-[hsl(var(--teacher-primary))]/90"
                    >
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Scheduled Reports</h3>
              <p className="text-[hsl(var(--teacher-muted-foreground))]">Automated report generation and delivery</p>
            </div>
            <Button className="bg-[hsl(var(--teacher-primary))] hover:bg-[hsl(var(--teacher-primary))]/90">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>

          <div className="space-y-4">
            {scheduledReports.map((report) => (
              <Card key={report.id} className="bg-[hsl(var(--teacher-card))] border-[hsl(var(--teacher-border))]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Calendar className="h-5 w-5 text-[hsl(var(--teacher-primary))]" />
                        <h3 className="font-semibold">{report.title}</h3>
                        <Badge variant={report.status === "active" ? "default" : "secondary"}>{report.status}</Badge>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-[hsl(var(--teacher-muted-foreground))]">
                        <span>Frequency: {report.frequency}</span>
                        <span>Next Run: {report.nextRun}</span>
                        <span>Recipients: {report.recipients.length}</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-[hsl(var(--teacher-muted-foreground))]">
                          Recipients: {report.recipients.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        {report.status === "active" ? "Pause" : "Resume"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[hsl(var(--teacher-card))] border-[hsl(var(--teacher-border))]">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-[hsl(var(--teacher-primary))]" />
                  <div>
                    <p className="text-sm text-[hsl(var(--teacher-muted-foreground))]">Total Reports</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--teacher-card))] border-[hsl(var(--teacher-border))]">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Download className="h-5 w-5 text-[hsl(var(--teacher-primary))]" />
                  <div>
                    <p className="text-sm text-[hsl(var(--teacher-muted-foreground))]">Total Downloads</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--teacher-card))] border-[hsl(var(--teacher-border))]">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-[hsl(var(--teacher-primary))]" />
                  <div>
                    <p className="text-sm text-[hsl(var(--teacher-muted-foreground))]">Scheduled Reports</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--teacher-card))] border-[hsl(var(--teacher-border))]">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-[hsl(var(--teacher-primary))]" />
                  <div>
                    <p className="text-sm text-[hsl(var(--teacher-muted-foreground))]">Usage Growth</p>
                    <p className="text-2xl font-bold">+23%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[hsl(var(--teacher-card))] border-[hsl(var(--teacher-border))]">
              <CardHeader>
                <CardTitle>Most Popular Reports</CardTitle>
                <CardDescription>Reports with highest download counts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Monthly Performance Report</span>
                  <Badge>15 downloads</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Quiz Analytics Report</span>
                  <Badge>12 downloads</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Attendance Summary</span>
                  <Badge>8 downloads</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[hsl(var(--teacher-card))] border-[hsl(var(--teacher-border))]">
              <CardHeader>
                <CardTitle>Report Generation Trends</CardTitle>
                <CardDescription>Monthly report creation activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>January 2024</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[hsl(var(--teacher-primary))] h-2 rounded-full"
                          style={{ width: "80%" }}
                        ></div>
                      </div>
                      <span className="text-sm">8 reports</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>December 2023</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[hsl(var(--teacher-primary))] h-2 rounded-full"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                      <span className="text-sm">6 reports</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>November 2023</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[hsl(var(--teacher-primary))] h-2 rounded-full"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <span className="text-sm">10 reports</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
