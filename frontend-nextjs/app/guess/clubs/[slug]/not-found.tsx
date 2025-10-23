import Link from "next/link"
import { AnimatedButton } from "@/components/ui/animated-button"
import { ChevronLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center px-4">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Club Not Found</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The club you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <AnimatedButton asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Link href="/guess/extracurricular">
              <Search className="w-5 h-5 mr-2" />
              Browse All Clubs
            </Link>
          </AnimatedButton>
          <AnimatedButton asChild variant="outline" size="lg">
            <Link href="/">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </AnimatedButton>
        </div>
      </div>
    </div>
  )
}
