import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, BookOpen, Calendar, Users, GraduationCap, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main 404 Display */}
        <div className="relative mb-8">
          <div className="text-[12rem] md:text-[16rem] font-bold text-blue-100 dark:text-blue-900/30 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-full p-8 shadow-2xl border-4 border-blue-200 dark:border-blue-700">
              <GraduationCap className="w-16 h-16 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* School-themed Illustration */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Chalkboard */}
            <div className="bg-green-800 dark:bg-green-900 rounded-lg p-6 shadow-xl border-4 border-amber-600 dark:border-amber-700 transform -rotate-2">
              <div className="text-white font-handwriting text-2xl md:text-3xl">Class Dismissed!</div>
              <div className="text-green-200 text-sm mt-2">This page went home early</div>
            </div>

            {/* School supplies scattered around */}
            <div className="absolute -top-4 -left-4 transform rotate-12">
              <div className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-6 transform -rotate-45">
              <div className="bg-red-500 w-16 h-2 rounded-full shadow-lg"></div>
            </div>
            <div className="absolute top-2 -right-8 transform rotate-45">
              <div className="bg-blue-500 w-12 h-2 rounded-full shadow-lg"></div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <Card className="p-8 mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">Oops! Wrong Classroom!</h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Looks like you've wandered into an empty classroom! The page you're looking for must be in a different wing
            of our school. Don't worry, even the best students get lost sometimes! 📚
          </p>

          {/* Fun school-related message */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              🎓 <strong>Teacher's Note:</strong> This happens to the best of us! Even Einstein probably took a wrong
              turn in the hallway once or twice.
            </p>
          </div>
        </Card>

        {/* Navigation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white dark:bg-gray-800 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600">
              <Home className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Home</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Back to main hall</p>
            </Card>
          </Link>

          <Link href="/guess/academics">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white dark:bg-gray-800 border-2 border-transparent hover:border-green-300 dark:hover:border-green-600">
              <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Academics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Find your classes</p>
            </Card>
          </Link>

          <Link href="/guess/events">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white dark:bg-gray-800 border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-600">
              <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Events</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">School calendar</p>
            </Card>
          </Link>

          <Link href="/guess/about">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white dark:bg-gray-800 border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-600">
              <Users className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">About Us</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Meet our school</p>
            </Card>
          </Link>

          <Link href="/guess/search">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600">
              <Search className="w-8 h-8 text-gray-600 dark:text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Search Site</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Find what you're looking for</p>
            </Card>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Take Me Home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-2 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 bg-transparent"
          >
            <Link href="/search">
              <Search className="w-5 h-5 mr-2" />
              Search Site
            </Link>
          </Button>
        </div>

        {/* Fun badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            🏫 Lost Student
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            📍 Wrong Turn
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            🗺️ Need Directions
          </Badge>
        </div>

        {/* Footer message */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          If you believe this is an error, please contact our{" "}
          <Link href="/guess/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
            school administration
          </Link>
        </p>
      </div>
    </div>
  )
}
