import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, BookOpen, Search, Users, Clock, Wifi, Computer, Calendar, Bell, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Library - Coming Soon | Southville 8B NHS",
  description:
    "Digital library platform coming soon to Southville 8B NHS. Access books, research materials, and study resources online.",
}

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/guess/academics" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Academics
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <BookOpen className="w-12 h-12 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Digital Library
          </h1>

          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-6 py-3 rounded-full text-lg font-semibold mb-6">
            <Clock className="w-5 h-5" />
            Coming Soon
          </div>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            We're building a comprehensive digital library platform to enhance your learning experience with instant
            access to books, research materials, and study resources.
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Smart Search</CardTitle>
              <CardDescription>
                Advanced search capabilities to find books, articles, and resources instantly
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Computer className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Digital Resources</CardTitle>
              <CardDescription>
                Access e-books, research papers, and multimedia learning materials online
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl">Study Groups</CardTitle>
              <CardDescription>Collaborate with classmates and join virtual study sessions</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                <Wifi className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-xl">24/7 Access</CardTitle>
              <CardDescription>Access library resources anytime, anywhere with your student account</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <CardTitle className="text-xl">Reservation System</CardTitle>
              <CardDescription>Reserve physical books and study spaces in advance</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <CardTitle className="text-xl">Smart Notifications</CardTitle>
              <CardDescription>Get reminders for due dates, new arrivals, and recommended readings</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Development Timeline */}
        <Card className="mb-16 border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Development Timeline</CardTitle>
            <CardDescription>Track our progress as we build your digital library</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-green-800 dark:text-green-200">Phase 1: Planning & Design</div>
                  <div className="text-sm text-green-600 dark:text-green-300">
                    User research and interface design completed
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                >
                  Completed
                </Badge>
              </div>

              <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div className="font-semibold text-blue-800 dark:text-blue-200">Phase 2: Core Development</div>
                  <div className="text-sm text-blue-600 dark:text-blue-300">
                    Building search functionality and user interface
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  In Progress
                </Badge>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-500 rounded-full flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">Phase 3: Content Integration</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Adding digital books and resources</div>
                </div>
                <Badge variant="outline">Upcoming</Badge>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-500 rounded-full flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">Phase 4: Testing & Launch</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Beta testing and official launch</div>
                </div>
                <Badge variant="outline">Upcoming</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Signup */}
        <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Get Notified When We Launch</CardTitle>
            <CardDescription className="text-blue-100">
              Be the first to know when our digital library goes live
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter your school email address"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-blue-100"
              />
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                <Bell className="w-4 h-4 mr-2" />
                Notify Me
              </Button>
            </div>
            <p className="text-xs text-blue-100 mt-3 text-center">
              We'll send updates about new features and the official launch date
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
