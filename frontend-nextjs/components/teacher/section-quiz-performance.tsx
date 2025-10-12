"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Award } from "lucide-react"

// Mock data for section quiz performance
const sectionQuizData = [
  { section: "NEUTRON-10", score: 92, percentage: 35, color: "bg-blue-500", students: 32, trend: "up" },
  { section: "PROTON-9", score: 88, percentage: 28, color: "bg-teal-500", students: 30, trend: "up" },
  { section: "ELECTRON-11", score: 85, percentage: 25, color: "bg-green-500", students: 35, trend: "down" },
  { section: "PHOTON-8", score: 82, percentage: 20, color: "bg-gray-500", students: 28, trend: "up" },
  { section: "QUARK-12", score: 78, percentage: 15, color: "bg-red-500", students: 33, trend: "down" },
  { section: "ATOM-7", score: 75, percentage: 12, color: "bg-orange-500", students: 29, trend: "up" },
]

export default function SectionQuizPerformance() {
  const maxScore = Math.max(...sectionQuizData.map((item) => item.score))

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950/30 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 shadow-md">
              <Award className="w-3 h-3 text-white" />
            </div>
            <span className="text-base">Section Quiz Performance</span>
          </div>
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
            Latest Results
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Horizontal Bar Chart */}
        <div className="space-y-3">
          {sectionQuizData.map((section, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[80px]">
                    {section.section}
                  </span>
                  <div className="flex items-center space-x-1">
                    {section.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400">{section.students}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{section.score}%</span>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden shadow-inner">
                  <div
                    className={`h-full ${section.color} rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 shadow-sm`}
                    style={{ width: `${(section.score / maxScore) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">{section.section}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Summary Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          {sectionQuizData.map((section, index) => (
            <div
              key={index}
              className="flex items-center space-x-1 p-1.5 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
            >
              <div className={`w-2 h-2 rounded-full ${section.color}`}></div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{section.section}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{section.percentage}%</div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Statistics */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                {Math.round(sectionQuizData.reduce((acc, section) => acc + section.score, 0) / sectionQuizData.length)}%
              </div>
              <div className="text-xs text-blue-500 dark:text-blue-300">Overall Average</div>
            </div>
            <div>
              <div className="text-base font-bold text-green-600 dark:text-green-400">
                {sectionQuizData.filter((s) => s.trend === "up").length}
              </div>
              <div className="text-xs text-green-500 dark:text-green-300">Improving</div>
            </div>
            <div>
              <div className="text-base font-bold text-purple-600 dark:text-purple-400">
                {sectionQuizData.reduce((acc, section) => acc + section.students, 0)}
              </div>
              <div className="text-xs text-purple-500 dark:text-purple-300">Total Students</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
