"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  Award,
  Star,
  Download,
} from "lucide-react"
import StudentLayout from "@/components/student/student-layout"

export default function GradesPage() {
  const [selectedSemester, setSelectedSemester] = useState("current")

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

  const calculateGWA = () => {
    const totalGrade = currentGrades.reduce((sum, subject) => sum + subject.currentGrade, 0)
    return (totalGrade / currentGrades.length).toFixed(1)
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

        </div>
      </div>
    </StudentLayout>
  )
}
