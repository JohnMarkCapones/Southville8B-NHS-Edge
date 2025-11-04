"use client"

import { useEffect, useState } from "react"
import { Monitor, Laptop, Smartphone, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function MobileBlock() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      // Check if screen width is mobile (below 768px - tablet breakpoint)
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    // Check on mount
    checkMobile()

    // Add resize listener
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Don't block if not mobile
  if (!isMobile) {
    return null
  }

  // Show blocking page
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto py-8">
        <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-2xl">
          <CardContent className="p-8 sm:p-12 text-center space-y-8">
            {/* Icon Section */}
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-red-100 dark:bg-red-900/30 p-6 rounded-full">
                  <Smartphone className="h-16 w-16 text-red-600 dark:text-red-400" strokeWidth={1.5} />
                </div>
              </div>

              <div className="text-4xl font-bold text-gray-400 dark:text-gray-600">→</div>

              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-green-100 dark:bg-green-900/30 p-6 rounded-full">
                  <Monitor className="h-16 w-16 text-green-600 dark:text-green-400" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
                Admin Panel Not Available
              </h1>
              <p className="text-lg text-muted-foreground font-medium">
                Mobile devices are not supported
              </p>
            </div>

            {/* Main Message */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-left text-gray-700 dark:text-gray-300 leading-relaxed">
                  The <strong>Southville 8B NHS Admin Panel</strong> requires a larger screen
                  for optimal experience. Please access this portal from a desktop or laptop computer.
                </p>
              </div>

              {/* Features List */}
              <div className="mt-6 space-y-3">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Why desktop is required:
                </p>
                <div className="grid grid-cols-1 gap-2 text-left">
                  {[
                    { icon: "📊", text: "Advanced analytics dashboards" },
                    { icon: "🗂️", text: "Complex data management tools" },
                    { icon: "📈", text: "Multi-panel workflows" },
                    { icon: "📋", text: "Detailed reports and charts" },
                    { icon: "⚙️", text: "System configuration panels" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Device Recommendation */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Monitor className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">or</span>
                <Laptop className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                Minimum recommended screen width: <strong className="text-gray-900 dark:text-white">768px</strong>
              </p>
            </div>

            {/* Footer Note */}
            <div className="pt-4">
              <p className="text-xs text-muted-foreground">
                For mobile-friendly features, please use the <strong>Student Portal</strong> or <strong>Teacher Portal</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* School Branding */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Southville 8B National High School
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Digital School Portal System
          </p>
        </div>
      </div>
    </div>
  )
}
