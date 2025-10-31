"use client"

import { BookOpen, Clock, Zap } from "lucide-react"
import StudentLayout from "@/components/student/student-layout"

export default function StudentQuizPage() {
  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        {/* Coming Soon Content */}
        <div className="text-center space-y-8 max-w-2xl mx-auto px-6">
          {/* Icon */}
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
            <BookOpen className="w-16 h-16 text-white" />
          </div>

          {/* Main Content */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Coming Soon
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-200">
              Quiz Center
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
              We're working hard to bring you an amazing quiz experience. 
              Stay tuned for interactive quizzes, real-time feedback, and progress tracking!
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Interactive Quizzes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Engaging quiz formats with instant feedback
              </p>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Real-time Progress</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your performance and improvement over time
              </p>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Smart Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detailed insights into your learning patterns
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="pt-8">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Check back soon for updates!
            </p>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}